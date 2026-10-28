// Source en clair du cours physique-s06-1 « Séance 6 – Volume et masse au cours du changement d'état (1) : expériences ».
// Compilé (réponses brouillées) par node atelier/outils/compiler-cours.js physique-s06-1.
// Seule source déposée : le corrigé du livret 1 (thème A, chapitre 1, séance 6, pages 8 et 9) : TP 7 (masse des glaçons
// qui fondent, bouteille d'eau qui gèle et déborde), schéma de mémorisation des changements d'état avec leurs
// températures, exercice 1 (corps purs métalliques : densité, température de fusion, alliage, mercure), exercice 2
// (banquise et glaciers modélisés par deux verres). Le livret de cours lui-même n'est pas déposé.
// Anti-spoil (physique-d1) : pas de question formulée comme « cite une particularité de la fusion de l'eau salée » ;
// la température de début de fusion de la glace salée est donnée comme un fait du cours. Aucun nombre propre à l'énoncé.
const F = "cours/physique-chimie/Cours Griffon 5eme Physique Chimie - Livret 1 - Corriges.pdf";
const P = p => ({ fichier: F, page: p });
// Audit des questions du 28/10/2026 appliqué : q23 et q26 (doublons) et q48 (valeurs du mercure par cœur) supprimées.

// Schéma redessiné (aucune image reprise) : les trois états et les quatre changements d'état de l'eau.
function cycle() {
  const encre = "#2e2419";
  let s = "<svg viewBox='0 0 560 230' xmlns='http://www.w3.org/2000/svg' font-family='Georgia,serif' font-size='12' fill='" + encre + "'>";
  const etats = [["SOLIDE", 85], ["LIQUIDE", 280], ["GAZEUX", 475]];
  etats.forEach(e => {
    s += "<circle cx='" + e[1] + "' cy='115' r='40' fill='#dbe7f3' stroke='#2f5e8e' stroke-width='2'/>";
    s += "<text x='" + e[1] + "' y='119' text-anchor='middle' font-size='11' font-weight='bold' fill='#2f5e8e'>" + e[0] + "</text>";
  });
  function fleche(x1, x2, y, texte, couleur) {
    s += "<path d='M" + x1 + " " + y + " H" + x2 + "' stroke='" + couleur + "' stroke-width='3' fill='none'/>";
    const d = x2 > x1 ? 1 : -1;
    s += "<path d='M" + x2 + " " + y + " l" + (-9 * d) + " -6 v12 z' fill='" + couleur + "'/>";
    s += "<text x='" + ((x1 + x2) / 2) + "' y='" + (y + (y < 115 ? -8 : 18)) + "' text-anchor='middle' fill='" + couleur + "'>" + texte + "</text>";
  }
  fleche(130, 235, 70, "fusion", "#c8742a");
  fleche(235, 130, 160, "solidification", "#2f5e8e");
  fleche(325, 430, 70, "vaporisation", "#c8742a");
  fleche(430, 325, 160, "liquéfaction", "#2f5e8e");
  s += "<text x='182' y='119' text-anchor='middle' font-weight='bold'>0 °C</text>";
  s += "<text x='378' y='119' text-anchor='middle' font-weight='bold'>100 °C</text>";
  s += "<text x='280' y='215' text-anchor='middle' font-size='11'>Les changements d'état de l'eau et leurs températures</text>";
  return s + "</svg>";
}

module.exports = {
  id: "physique-s06-1",
  fiches: [
    {
      id: "physique-s06-1-f1", notion: "Masse et volume au cours du changement d'état",
      titre: "Les glaçons pesés, la bouteille qui déborde",
      texte: "On pèse des glaçons, puis le mélange de glace et d'eau pendant la fonte, puis l'eau fondue : la masse est la même à chaque fois. La fusion ne change pas la masse. Mais une bouteille pleine d'eau laissée au froid finit par déborder : la glace dépasse, tout en restant solide. En se solidifiant, l'eau prend plus de place.",
      pointsCles: ["Glaçons, glace + eau, eau fondue : même masse", "La masse se conserve pendant la fusion", "L'eau gelée déborde de la bouteille : le volume augmente", "Solide, l'eau prend plus de place que liquide"],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "conservation de la masse", def: "la masse reste la même pendant un changement d'état, comme les glaçons qui fondent" }
      ],
      schema: null, prerequis: ["physique-s02-1-f1", "methode-instruments-f2"], source: P(8)
    },
    {
      id: "physique-s06-1-f2", notion: "Les quatre changements d'état de l'eau et leurs températures",
      titre: "0 °C et 100 °C",
      texte: "Entre l'état solide et l'état liquide, l'eau passe par la fusion dans un sens et la solidification dans l'autre : les deux se font à 0 °C. Entre l'état liquide et l'état gazeux, elle passe par la vaporisation dans un sens et la liquéfaction dans l'autre : les deux se font à 100 °C.",
      pointsCles: ["Solide ⇄ liquide : fusion / solidification, à 0 °C", "Liquide ⇄ gaz : vaporisation / liquéfaction, à 100 °C", "Un changement et son inverse ont la même température"],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "liquéfaction", def: "le passage du gaz au liquide ; pour l'eau, à 100 °C, à l'inverse de la vaporisation" },
        { mot: "température de vaporisation", def: "la température à laquelle un liquide bout et devient gaz ; 100 °C pour l'eau" }
      ],
      schema: "physique-s06-1-s1", prerequis: ["physique-s02-1-f1", "physique-s02-1-f2", "physique-s05-1-f3"], source: P(8)
    },
    {
      id: "physique-s06-1-f3", notion: "Corps pur ou alliage : la température de fusion",
      titre: "Fondre net ou fondre peu à peu",
      texte: "Un corps pur fond à une température bien précise. Un alliage comme l'acier fond dans une fourchette de températures : ce n'est pas un corps pur. Le zinc se ramollit près d'une chaleur intense, alors que l'acier fond bien plus haut. Le mercure fond à −38,83 °C et bout à 357 °C : à 20 °C, il est liquide.",
      pointsCles: ["Corps pur : température de fusion précise", "Alliage (acier) : fond sur une plage de températures", "Zinc : se ramollit vite ; acier : fond bien plus haut", "Mercure : liquide à 20 °C (fusion −38,83 °C, vaporisation 357 °C)"],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "corps pur", def: "une matière faite d'une seule substance, qui fond à une température précise" },
        { mot: "alliage", def: "un matériau comme l'acier, qui n'est pas un corps pur et fond dans une fourchette de températures" }
      ],
      schema: null, prerequis: ["physique-s05-1-f3"], source: P(8)
    },
    {
      id: "physique-s06-1-f4", notion: "Reconnaître un métal par sa densité",
      titre: "Aluminium, zinc, acier, platine",
      texte: "Le métal le moins dense est celui qui a la plus petite masse pour 1 dm³ : l'aluminium. Le plus dense est le platine. Acier, aluminium et zinc se ressemblent, gris clair et brillants. L'aluminium se repère vite, bien moins dense. Zinc et acier ont des densités voisines : on les départage par leur température de fusion.",
      pointsCles: ["Moins dense : plus petite masse pour 1 dm³ (aluminium)", "Plus dense : platine", "Acier, aluminium, zinc : même aspect gris clair et brillant", "Zinc et acier : densités voisines, donc température de fusion"],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "décimètre cube", def: "une unité de volume, notée dm³ ; on compare les métaux par leur masse pour 1 dm³" }
      ],
      schema: null, prerequis: ["physique-s03-1-f5", "physique-s06-1-f3"], source: P(8)
    },
    {
      id: "physique-s06-1-f5", notion: "Deux verres pour modéliser la fonte des glaces",
      titre: "Le verre A et le verre B",
      texte: "Verre A : des glaçons, puis de l'eau jusqu'à 1 cm du bord. Une fois la glace fondue, le niveau est descendu un peu sous le repère. Verre B : de l'eau jusqu'à 1 cm du bord, puis un glaçon ajouté : le niveau monte. Le verre A représente la banquise, le verre B les glaciers.",
      pointsCles: ["Verre A : glaçons dans l'eau, le niveau baisse un peu après la fonte", "Verre B : glaçon ajouté à un verre plein, le niveau monte", "Verre A = banquise ; verre B = glaciers"],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "modéliser", def: "représenter une situation réelle, comme la fonte des glaces, par une expérience simple" },
        { mot: "banquise", def: "la glace qui flotte sur l'océan, formée d'eau de mer gelée" }
      ],
      schema: null, prerequis: ["physique-s06-1-f1"], source: P(9)
    },
    {
      id: "physique-s06-1-f6", notion: "Banquise, calottes glaciaires et niveau des océans",
      titre: "Quelle glace fait monter la mer ?",
      texte: "La banquise est de l'eau de mer gelée aux pôles, en hiver. Comme elle flotte déjà dans l'océan, sa fonte ne fait pas monter le niveau ; elle le fait baisser un peu. Les calottes glaciaires sont de l'eau douce gelée sur les terres : en fondant, elle rejoint l'océan par les cours d'eau et fait monter son niveau.",
      pointsCles: ["Banquise : eau de mer gelée aux pôles, en hiver", "Gelée, l'eau de mer prend plus de volume que liquide", "Sa fonte ne fait pas monter l'océan", "Calottes glaciaires : eau douce gelée sur les terres", "Leur fonte rejoint l'océan et le fait monter", "Glace pure : fond à 0 °C ; glace salée : commence à fondre à −2 °C"],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "calotte glaciaire", def: "une épaisse couche d'eau douce gelée qui recouvre des terres émergées" },
        { mot: "terres émergées", def: "les terres hors de l'eau, par opposition aux océans" }
      ],
      schema: null, prerequis: ["physique-s06-1-f5", "physique-s05-1-f5"], source: P(9)
    }
  ],
  schemas: [
    { id: "physique-s06-1-s1", legende: "Les trois états de l'eau et les quatre changements d'état : 0 °C entre solide et liquide, 100 °C entre liquide et gaz (schéma redessiné d'après le corrigé).", svg: cycle() }
  ],
  questions: [
    // f1 : masse conservée, volume qui augmente
    { id: "physique-s06-1-q1", fiche: "physique-s06-1-f1", type: "qcm", niveau: 1,
      enonce: "On pèse des glaçons, puis on les laisse fondre et on pèse l'eau obtenue. Que constate-t-on ?",
      choix: ["La masse est la même", "La masse a diminué", "La masse a augmenté", "La masse a doublé"],
      reponse: "La masse est la même",
      explication: "La masse des glaçons, du mélange glace et eau, et de l'eau fondue est la même. La fusion ne change pas la masse.", source: P(8) },
    { id: "physique-s06-1-q2", fiche: "physique-s06-1-f1", type: "vrai_faux", niveau: 1,
      enonce: "Pendant la fusion, la masse de l'eau ne change pas.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : la balance affiche la même masse avant, pendant et après la fonte des glaçons.", source: P(8) },
    { id: "physique-s06-1-q3", fiche: "physique-s06-1-f1", type: "qcm", niveau: 2,
      enonce: "Une bouteille pleine d'eau est mise au froid pendant quelques heures. Que se passe-t-il ?",
      choix: ["L'eau devenue solide déborde de la bouteille", "L'eau devenue solide descend dans la bouteille", "L'eau reste liquide mais déborde", "La bouteille se vide"],
      reponse: "L'eau devenue solide déborde de la bouteille",
      explication: "En se solidifiant, l'eau prend plus de place. La glace dépasse de la bouteille tout en restant solide.", source: P(8) },
    { id: "physique-s06-1-q4", fiche: "physique-s06-1-f1", type: "vrai_faux", niveau: 2,
      enonce: "Quand l'eau se solidifie, son volume diminue.",
      corrections: ["Faux : son volume augmente, la glace déborde de la bouteille.", "Faux : son volume ne change pas, seule sa masse augmente.", "Faux : son volume diminue seulement si l'eau est salée."],
      reponse: { vrai: false, correction: "Faux : son volume augmente, la glace déborde de la bouteille." },
      explication: "L'eau prend plus de volume à l'état solide qu'à l'état liquide. C'est pour cela que la glace déborde de la bouteille.", source: P(8) },
    { id: "physique-s06-1-q5", fiche: "physique-s06-1-f1", type: "qcm", niveau: 2,
      enonce: "Pendant un changement d'état de l'eau, qu'est-ce qui se conserve et qu'est-ce qui change ?",
      choix: ["La masse se conserve, le volume change", "Le volume se conserve, la masse change", "La masse et le volume se conservent", "La masse et le volume changent"],
      reponse: "La masse se conserve, le volume change",
      explication: "Les glaçons pesés gardent leur masse en fondant. Mais l'eau qui gèle prend plus de place : le volume change.", source: P(8) },
    { id: "physique-s06-1-q6", fiche: "physique-s06-1-f1", type: "qcm", niveau: 3,
      enonce: "Pourquoi la glace déborde-t-elle d'une bouteille remplie d'eau liquide à ras bord ?",
      choix: ["Parce que la glace prend plus de place que l'eau", "Parce que la masse de l'eau augmente en gelant", "Parce que la bouteille rétrécit avec le froid", "Parce que de l'air entre dans l'eau en gelant"],
      reponse: "Parce que la glace prend plus de place que l'eau",
      explication: "Le volume de l'eau augmente quand elle se solidifie. La même masse d'eau a besoin de plus de place une fois gelée.", source: P(8) },
    { id: "physique-s06-1-q7", fiche: "physique-s06-1-f1", type: "qcm", niveau: 3,
      enonce: "Des glaçons de 50 g fondent entièrement. Quelle est la masse de l'eau obtenue ?",
      choix: ["50 g", "Moins de 50 g", "Plus de 50 g", "On ne peut pas savoir"],
      reponse: "50 g",
      explication: "La masse se conserve pendant la fusion. L'eau fondue pèse 50 g, comme les glaçons.", source: P(8) },
    { id: "physique-s06-1-q8", fiche: "physique-s06-1-f1", type: "qcm_multiple", niveau: 2,
      enonce: "Quelles affirmations sont justes ? (plusieurs réponses)",
      choix: ["La masse des glaçons ne change pas quand ils fondent", "L'eau prend plus de place quand elle devient solide", "La masse de l'eau augmente quand elle gèle", "Le volume de l'eau ne change jamais", "Un mélange de glace et d'eau a la même masse que les glaçons de départ"],
      reponse: ["La masse des glaçons ne change pas quand ils fondent", "L'eau prend plus de place quand elle devient solide", "Un mélange de glace et d'eau a la même masse que les glaçons de départ"],
      explication: "La masse se conserve pendant les changements d'état. Le volume, lui, augmente quand l'eau se solidifie.", source: P(8) },
    // f2 : le schéma des changements d'état
    { id: "physique-s06-1-q9", fiche: "physique-s06-1-f2", type: "qcm", niveau: 1,
      enonce: "À quelle température se font la fusion et la solidification de l'eau ?",
      choix: ["À zéro degré", "À cent degrés", "À quarante degrés", "À cinquante degrés"],
      reponse: "À zéro degré",
      explication: "Entre solide et liquide, le passage se fait à zéro degré. Entre liquide et gaz, c'est à cent degrés.", source: P(8) },
    { id: "physique-s06-1-q10", fiche: "physique-s06-1-f2", type: "qcm", niveau: 1,
      enonce: "À quelle température l'eau liquide se vaporise-t-elle ?",
      choix: ["À cent degrés", "À zéro degré", "À dix degrés", "À cinquante degrés"],
      reponse: "À cent degrés",
      explication: "Vaporisation et liquéfaction se font à cent degrés pour l'eau. Fusion et solidification, à zéro degré.", source: P(8) },
    { id: "physique-s06-1-q11", fiche: "physique-s06-1-f2", type: "association", niveau: 2,
      enonce: "Relie chaque changement d'état au passage qu'il décrit.",
      gauche: ["Fusion", "Solidification", "Vaporisation", "Liquéfaction"],
      droite: ["Gaz → liquide", "Solide → liquide", "Liquide → gaz", "Liquide → solide"],
      reponse: [[0, 1], [1, 3], [2, 2], [3, 0]],
      explication: "Fusion : du solide au liquide ; solidification : l'inverse. Vaporisation : du liquide au gaz ; liquéfaction : l'inverse.", source: P(8) },
    { id: "physique-s06-1-q12", fiche: "physique-s06-1-f2", type: "vrai_faux", niveau: 2,
      enonce: "La liquéfaction est le passage de l'état gazeux à l'état liquide, à cent degrés pour l'eau.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : la vapeur redevient liquide à cent degrés. C'est l'inverse de la vaporisation.", source: P(8) },
    { id: "physique-s06-1-q13", fiche: "physique-s06-1-f2", type: "vrai_faux", niveau: 2,
      enonce: "La vaporisation de l'eau se fait à zéro degré.",
      corrections: ["Faux : elle se fait à cent degrés ; c'est la fusion qui se fait à zéro degré.", "Faux : elle se fait à cinquante degrés.", "Faux : elle se fait à moins quarante degrés."],
      reponse: { vrai: false, correction: "Faux : elle se fait à cent degrés ; c'est la fusion qui se fait à zéro degré." },
      explication: "Sur le schéma, le passage liquide-gaz est à cent degrés. Le passage solide-liquide est à zéro degré.", source: P(8) },
    { id: "physique-s06-1-q14", fiche: "physique-s06-1-f2", type: "ordre", niveau: 2,
      enonce: "Remets dans l'ordre les états que traverse l'eau quand on la chauffe en partant de la glace.",
      elements: ["État solide", "État gazeux", "État liquide"],
      reponse: [0, 2, 1],
      explication: "La glace fond d'abord et donne de l'eau liquide. En chauffant encore, l'eau liquide se vaporise et devient gazeuse.", source: P(8) },
    { id: "physique-s06-1-q15", fiche: "physique-s06-1-f2", type: "qcm", niveau: 3,
      enonce: "Comment appelle-t-on le changement d'état inverse de la vaporisation ?",
      choix: ["La liquéfaction", "La solidification", "La fusion", "La dissolution"],
      reponse: "La liquéfaction",
      explication: "La vaporisation va du liquide au gaz. Le retour du gaz au liquide est la liquéfaction.", source: P(8) },
    { id: "physique-s06-1-q16", fiche: "physique-s06-1-f2", type: "qcm", niveau: 3,
      enonce: "De l'eau pure est à 150 °C. Dans quel état est-elle ?",
      choix: ["Gazeux", "Liquide", "Solide", "Liquide et solide"],
      reponse: "Gazeux",
      explication: "Au-dessus de cent degrés, l'eau pure est à l'état gazeux. Elle est liquide entre zéro et cent degrés, solide en dessous de zéro.", indice: "Compare avec la température de vaporisation de l'eau.", source: P(8) },
    // f3 : corps pur, alliage, mercure
    { id: "physique-s06-1-q17", fiche: "physique-s06-1-f3", type: "qcm", niveau: 1,
      enonce: "Un corps pur fond à une température bien précise. Que fait un alliage comme l'acier ?",
      choix: ["Il fond dans une fourchette de températures", "Il ne fond jamais", "Il fond à 0 °C", "Il fond à une température encore plus précise"],
      reponse: "Il fond dans une fourchette de températures",
      explication: "L'acier n'est pas un corps pur : c'est un alliage. Il fond sur une plage de températures, pas à une valeur précise.", source: P(8) },
    { id: "physique-s06-1-q18", fiche: "physique-s06-1-f3", type: "vrai_faux", niveau: 1,
      enonce: "L'acier est un corps pur.",
      corrections: ["Faux : l'acier est un alliage, il fond dans une fourchette de températures.", "Faux : l'acier est un alliage, car il ne fond jamais.", "Faux : l'acier est un corps pur seulement quand il est chaud."],
      reponse: { vrai: false, correction: "Faux : l'acier est un alliage, il fond dans une fourchette de températures." },
      explication: "Un corps pur fond à une température précise. L'acier fond sur une plage de températures : c'est un alliage.", source: P(8) },
    { id: "physique-s06-1-q19", fiche: "physique-s06-1-f3", type: "vrai_faux", niveau: 2,
      enonce: "Dans une pièce à température ordinaire, vers vingt degrés, le mercure est liquide.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : il fond à −38,83 °C et bout à 357 °C. Vingt degrés se trouve entre les deux : il est liquide.", source: P(8) },
    { id: "physique-s06-1-q20", fiche: "physique-s06-1-f3", type: "qcm", niveau: 2,
      enonce: "Comment distinguer le zinc de l'acier, qui ont des densités voisines ?",
      choix: ["Par leur température de fusion", "Par leur couleur", "Par leur masse", "Par leur brillance"],
      reponse: "Par leur température de fusion",
      explication: "Les deux sont gris clair et brillants, et leurs densités sont proches. Mais le zinc se ramollit près d'une forte chaleur, l'acier fond à une température bien plus haute.", source: P(8) },
    { id: "physique-s06-1-q21", fiche: "physique-s06-1-f3", type: "qcm", niveau: 3,
      enonce: "Pourquoi peut-on dire qu'un métal qui fond à une température bien précise est un corps pur ?",
      choix: ["Parce qu'un alliage, lui, fond sur une plage de températures", "Parce que seuls les métaux purs fondent", "Parce qu'un alliage fond toujours à 0 °C", "Parce que la température de fusion dépend de la masse du morceau"],
      reponse: "Parce qu'un alliage, lui, fond sur une plage de températures",
      explication: "Un corps pur fond à une température précise. Un alliage comme l'acier fond dans une fourchette de températures.", source: P(8) },
    { id: "physique-s06-1-q22", fiche: "physique-s06-1-f3", type: "qcm", niveau: 3,
      enonce: "Le mercure fond à −38,83 °C et bout à 357 °C. Dans quel état est-il à 400 °C ?",
      choix: ["Gazeux", "Liquide", "Solide", "Solide et liquide"],
      reponse: "Gazeux",
      explication: "Au-dessus de 357 °C, le mercure s'est vaporisé. À 400 °C, il est donc à l'état gazeux.", indice: "Compare 400 °C à sa température de vaporisation.", source: P(8) },
    { id: "physique-s06-1-q24", fiche: "physique-s06-1-f3", type: "trou", niveau: 1,
      enonce: "Complète avec les mots du cours.",
      texte: "Un corps ___ fond à une température précise. Un ___ comme l'acier fond dans une fourchette de températures.",
      banque: ["pur", "alliage", "liquide", "solvant"],
      reponse: [["pur"], ["alliage"]],
      explication: "Le corps pur a une température de fusion nette. L'alliage, lui, fond sur une plage de températures.", source: P(8) },
    // f4 : densité des métaux
    { id: "physique-s06-1-q25", fiche: "physique-s06-1-f4", type: "qcm", niveau: 1,
      enonce: "Parmi l'aluminium, le platine, l'acier et le zinc, lequel est le moins dense ?",
      choix: ["L'aluminium", "Le platine", "L'acier", "Le zinc"],
      reponse: "L'aluminium",
      explication: "Le moins dense est celui qui a la plus petite masse pour 1 dm³ : l'aluminium. Le plus dense est le platine.", source: P(8) },
    { id: "physique-s06-1-q27", fiche: "physique-s06-1-f4", type: "vrai_faux", niveau: 2,
      enonce: "Le métal le moins dense est celui qui a la plus petite masse pour un même volume.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : on compare les masses pour 1 dm³. La plus petite masse revient à l'aluminium.", source: P(8) },
    { id: "physique-s06-1-q28", fiche: "physique-s06-1-f4", type: "vrai_faux", niveau: 2,
      enonce: "L'aluminium, le zinc et l'acier se distinguent facilement à l'œil, car ils n'ont pas la même couleur.",
      corrections: ["Faux : tous trois sont gris clair et brillants ; on les distingue par la densité ou la température de fusion.", "Faux : ils se ressemblent, mais seul le zinc est brillant.", "Faux : on les distingue à l'œil par leur masse."],
      reponse: { vrai: false, correction: "Faux : tous trois sont gris clair et brillants ; on les distingue par la densité ou la température de fusion." },
      explication: "Ces trois métaux se ressemblent : gris clair et brillants. Il faut comparer leur densité, puis leur température de fusion.", source: P(8) },
    { id: "physique-s06-1-q29", fiche: "physique-s06-1-f4", type: "qcm", niveau: 2,
      enonce: "Comment reconnaît-on l'aluminium parmi l'acier et le zinc ?",
      choix: ["Il est beaucoup moins dense", "Il est beaucoup plus brillant", "Il est le seul à être gris", "Il fond à 0 °C"],
      reponse: "Il est beaucoup moins dense",
      explication: "Les trois se ressemblent, mais l'aluminium est bien moins dense. Un même volume pèse nettement moins.", source: P(8) },
    { id: "physique-s06-1-q30", fiche: "physique-s06-1-f4", type: "qcm", niveau: 3,
      enonce: "Deux cubes de même volume, l'un en platine, l'autre en aluminium. Lequel a la plus grande masse ?",
      choix: ["Celui en platine", "Celui en aluminium", "Ils ont la même masse", "On ne peut pas savoir"],
      reponse: "Celui en platine",
      explication: "À volume égal, le métal le plus dense a la plus grande masse. Le platine est le plus dense.", source: P(8) },
    { id: "physique-s06-1-q31", fiche: "physique-s06-1-f4", type: "qcm", niveau: 3,
      enonce: "Pourquoi la densité ne suffit-elle pas pour distinguer le zinc de l'acier ?",
      choix: ["Parce que leurs densités sont voisines", "Parce qu'ils n'ont pas de densité", "Parce que le zinc est plus brillant", "Parce que la densité change avec la température"],
      reponse: "Parce que leurs densités sont voisines",
      explication: "Le zinc et l'acier ont des densités proches. On passe alors par la température de fusion, bien plus haute pour l'acier.", source: P(8) },
    { id: "physique-s06-1-q32", fiche: "physique-s06-1-f4", type: "ordre", niveau: 2,
      enonce: "Range ces métaux du moins dense au plus dense.",
      elements: ["L'acier", "L'aluminium", "Le platine"],
      reponse: [1, 0, 2],
      explication: "L'aluminium est le moins dense, le platine le plus dense. L'acier se place entre les deux.", source: P(8) },
    // f5 : les deux verres
    { id: "physique-s06-1-q33", fiche: "physique-s06-1-f5", type: "qcm", niveau: 1,
      enonce: "Dans le verre A, on met des glaçons puis on remplit d'eau jusqu'à 1 cm du bord. Que fait le niveau quand la glace a fondu ?",
      choix: ["Il baisse un peu", "Il monte", "Il ne bouge pas", "Le verre déborde"],
      reponse: "Il baisse un peu",
      explication: "Une fois la glace fondue, le niveau descend légèrement sous le repère. La glace qui flottait dans l'eau a fondu.", source: P(9) },
    { id: "physique-s06-1-q34", fiche: "physique-s06-1-f5", type: "qcm", niveau: 1,
      enonce: "Dans le verre B, on remplit d'eau jusqu'à 1 cm du bord, puis on ajoute un glaçon. Que fait le niveau ?",
      choix: ["Il monte", "Il baisse", "Il ne bouge pas", "L'eau gèle"],
      reponse: "Il monte",
      explication: "On ajoute de la matière dans un verre déjà plein : le niveau monte. Ce verre représente les glaciers.", source: P(9) },
    { id: "physique-s06-1-q35", fiche: "physique-s06-1-f5", type: "vrai_faux", niveau: 2,
      enonce: "Le verre A, avec les glaçons déjà dans l'eau, représente la banquise.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : la banquise flotte dans l'océan, comme les glaçons dans le verre A. Sa fonte ne fait pas monter le niveau.", source: P(9) },
    { id: "physique-s06-1-q36", fiche: "physique-s06-1-f5", type: "vrai_faux", niveau: 2,
      enonce: "Le verre B, où l'on ajoute un glaçon, représente la banquise.",
      corrections: ["Faux : il représente les glaciers, dont l'eau vient de l'extérieur de l'océan.", "Faux : il représente la pluie qui tombe sur l'océan.", "Faux : il représente la banquise en hiver."],
      reponse: { vrai: false, correction: "Faux : il représente les glaciers, dont l'eau vient de l'extérieur de l'océan." },
      explication: "Dans le verre B, la glace vient de l'extérieur, comme l'eau des glaciers. C'est le verre A qui représente la banquise.", source: P(9) },
    { id: "physique-s06-1-q37", fiche: "physique-s06-1-f5", type: "qcm", niveau: 2,
      enonce: "Pourquoi la fonte de la banquise ne fait-elle pas monter le niveau des océans ?",
      choix: ["Parce que la banquise est déjà dans l'eau de l'océan", "Parce que la banquise est trop petite", "Parce que la banquise ne fond jamais", "Parce que l'eau de la banquise s'évapore aussitôt"],
      reponse: "Parce que la banquise est déjà dans l'eau de l'océan",
      explication: "La banquise flotte dans l'océan, comme les glaçons du verre A. Quand elle fond, le niveau baisse même légèrement.", source: P(9) },
    { id: "physique-s06-1-q38", fiche: "physique-s06-1-f5", type: "qcm", niveau: 3,
      enonce: "Comment modéliser la fonte des glaciers avec un verre d'eau ?",
      choix: ["Ajouter un glaçon à un verre déjà plein", "Mettre des glaçons, puis remplir le verre d'eau", "Remplir le verre et attendre que l'eau s'évapore", "Mettre du sel dans le verre"],
      reponse: "Ajouter un glaçon à un verre déjà plein",
      explication: "L'eau des glaciers est hors de l'océan. Un glaçon ajouté à un verre plein fait monter le niveau, comme un glacier qui fond.", source: P(9) },
    { id: "physique-s06-1-q39", fiche: "physique-s06-1-f5", type: "qcm", niveau: 3,
      enonce: "Après la fonte, le niveau du verre A est un peu plus bas que le repère. Qu'est-ce que cela montre pour la banquise ?",
      choix: ["Sa fonte fait un peu baisser le niveau", "Sa fonte fait monter le niveau de l'océan", "Sa fonte ne change rien du tout", "Sa fonte fait déborder l'océan"],
      reponse: "Sa fonte fait un peu baisser le niveau",
      explication: "La banquise est dans l'eau, comme les glaçons du verre A. Sa fonte fait baisser le niveau légèrement, elle ne le fait pas monter.", source: P(9) },
    // f6 : banquise et calottes
    { id: "physique-s06-1-q40", fiche: "physique-s06-1-f6", type: "qcm", niveau: 1,
      enonce: "Où se forme la banquise ?",
      choix: ["Dans l'océan, aux pôles", "Sur les terres émergées, en montagne", "Dans les rivières", "Dans les déserts"],
      reponse: "Dans l'océan, aux pôles",
      explication: "La banquise est de l'eau de mer qui se solidifie près des pôles, en hiver. Elle flotte sur l'océan.", source: P(9) },
    { id: "physique-s06-1-q41", fiche: "physique-s06-1-f6", type: "qcm", niveau: 2,
      enonce: "De quelle eau sont faites les calottes glaciaires ?",
      choix: ["D'eau douce, sur les terres", "D'eau de mer gelée près des pôles", "D'eau salée flottante", "D'eau de pluie liquide"],
      reponse: "D'eau douce, sur les terres",
      explication: "Les calottes glaciaires sont de l'eau douce gelée sur les terres émergées. Quand elles fondent, l'eau rejoint l'océan par les cours d'eau.", source: P(9) },
    { id: "physique-s06-1-q42", fiche: "physique-s06-1-f6", type: "vrai_faux", niveau: 2,
      enonce: "La glace pure fond à 0 °C, mais la glace salée commence à fondre vers −2 °C.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : la glace salée commence à fondre à −2 °C, un peu en dessous de la glace pure. Le sel change la température de fusion.", source: P(9) },
    { id: "physique-s06-1-q43", fiche: "physique-s06-1-f6", type: "vrai_faux", niveau: 2,
      enonce: "La fonte des calottes glaciaires fait monter le niveau des océans.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : leur eau douce, gelée sur les terres, rejoint l'océan en fondant. Elle s'ajoute à l'eau déjà présente.", source: P(9) },
    { id: "physique-s06-1-q44", fiche: "physique-s06-1-f6", type: "vrai_faux", niveau: 2,
      enonce: "La banquise est faite d'eau douce venue des rivières.",
      corrections: ["Faux : c'est de l'eau de mer qui se solidifie aux pôles.", "Faux : c'est de l'eau de pluie gelée en montagne.", "Faux : c'est de la neige tombée sur l'océan."],
      reponse: { vrai: false, correction: "Faux : c'est de l'eau de mer qui se solidifie aux pôles." },
      explication: "La banquise se forme quand l'eau des océans gèle, en hiver, près des pôles. Les calottes, elles, sont de l'eau douce sur les terres.", source: P(9) },
    { id: "physique-s06-1-q45", fiche: "physique-s06-1-f6", type: "qcm", niveau: 3,
      enonce: "Pourquoi le volume total d'eau des océans augmente-t-il quand il y a plus de banquise ?",
      choix: ["Parce que la glace prend plus de place que l'eau liquide", "Parce que la banquise attire l'eau des rivières vers les pôles", "Parce que la banquise est plus lourde que l'eau", "Parce que l'eau salée se dilate au froid"],
      reponse: "Parce que la glace prend plus de place que l'eau liquide",
      explication: "L'eau de mer qui gèle prend plus de volume que liquide. Plus il y a de banquise, plus le volume total d'eau est grand.", source: P(9) },
    { id: "physique-s06-1-q46", fiche: "physique-s06-1-f6", type: "qcm_multiple", niveau: 2,
      enonce: "Quelles affirmations sont justes ? (plusieurs réponses)",
      choix: ["La banquise est de l'eau de mer gelée", "Les calottes glaciaires sont de l'eau douce gelée sur les terres", "La fonte des calottes fait monter le niveau des océans", "La fonte de la banquise fait monter le niveau des océans", "La banquise se forme en été"],
      reponse: ["La banquise est de l'eau de mer gelée", "Les calottes glaciaires sont de l'eau douce gelée sur les terres", "La fonte des calottes fait monter le niveau des océans"],
      explication: "La banquise flotte déjà dans l'océan : sa fonte ne le fait pas monter. L'eau des calottes, elle, vient s'ajouter à l'océan.", source: P(9) },
    { id: "physique-s06-1-q47", fiche: "physique-s06-1-f6", type: "qcm", niveau: 3,
      enonce: "Comment l'eau d'une calotte glaciaire qui fond arrive-t-elle jusqu'à l'océan ?",
      choix: ["Par les cours d'eau", "En s'évaporant", "En restant sur place", "Par le vent"],
      reponse: "Par les cours d'eau",
      explication: "L'eau douce fondue s'écoule par les cours d'eau jusqu'à l'océan. Elle contribue à faire monter son niveau.", source: P(9) }
  ],
  bonus: [
    {
      id: "physique-s06-1-b1",
      fiche: "physique-s06-1-f6",
      titre: "Un iceberg presque entièrement sous l'eau",
      texte: "Un iceberg flotte parce que la glace est moins dense que l'eau de mer : environ 0,92 kg par dm³, contre un peu plus de 1 kg pour l'eau de mer. Résultat, près de 90 % de son volume est caché sous la surface, et seule une petite partie émerge. C'est pour la même raison que les glaçons flottent dans le verre A.",
      source: { titre: "Iceberg", editeur: "Wikipédia, l'encyclopédie libre", url: "https://fr.wikipedia.org/wiki/Iceberg" }
    }
  ],
  nonCouvert: [
    "La leçon elle-même : seul le corrigé des TP et des exercices est déposé, pas le livret de cours.",
    "Le tableau des métaux de l'exercice 1 (masses pour 1 dm³, températures de fusion de l'acier, de l'aluminium, du zinc et du platine) : le corrigé n'en reprend pas les valeurs.",
    "Le déroulement du TP 7 (masse des glaçons, matériel, où la bouteille est placée pour geler) : le corrigé ne donne que les résultats.",
    "Les documents de l'exercice 2 (schéma des verres A et B, textes sur la banquise et les glaciers) : seules les réponses sont déposées.",
    "Ce qu'est précisément un alliage (mélange de métaux) : le corrigé dit seulement que l'acier en est un parce qu'il fond sur une plage de températures."
  ]
};
