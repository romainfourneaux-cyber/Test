// Source en clair du cours physique-s05-1 « Séance 5 – Caractéristiques des changements d'état ».
// Compilé (réponses brouillées) par node atelier/outils/compiler-cours.js physique-s05-1.
// Seule source déposée : le corrigé du livret 1 (thème A, chapitre 1, séance 5, pages 6 et 7) : réponses aux
// questions du TP (vaporisation puis fusion dans un ballon, température constante quand deux états coexistent,
// solidification et fusion de l'eau pure à 0 °C) et graphique de solidification de l'eau salée (page 7, image seule).
// Le livret de cours lui-même n'est pas déposé.
// Anti-spoil (physique-d1) : aucune question sur le graphique de fusion de l'eau pure de l'énoncé (titre à donner,
// zones 1 à 3, durée du changement d'état) ; les questions de lecture portent sur le graphique de l'eau salée du
// corrigé. Aucun nombre propre à l'énoncé.
const F = "cours/physique-chimie/Cours Griffon 5eme Physique Chimie - Livret 1 - Corriges.pdf";
const P = p => ({ fichier: F, page: p });

// Graphique redessiné (aucune image reprise) : temps en minutes -> abscisses, température en °C -> ordonnées.
function graphique() {
  const encre = "#2e2419";
  const px = t => 70 + t * 30;
  const py = T => 150 - T * 6;
  const pts = [[0, 10], [1, 7], [2, 3], [3, 0], [4, -0.5], [5, -1], [6, -1.5], [7, -2], [8, -2.5], [9, -5], [10, -11], [11, -14], [12, -18]];
  let s = "<svg viewBox='0 0 520 300' xmlns='http://www.w3.org/2000/svg' font-family='Georgia,serif' font-size='11' fill='" + encre + "'>";
  // axes
  s += "<line x1='" + px(0) + "' y1='" + py(16) + "' x2='" + px(0) + "' y2='" + py(-22) + "' stroke='" + encre + "' stroke-width='1.5'/>";
  s += "<line x1='" + px(0) + "' y1='" + py(0) + "' x2='" + px(14.5) + "' y2='" + py(0) + "' stroke='" + encre + "' stroke-width='1.5'/>";
  s += "<path d='M" + px(14.5) + " " + (py(0) - 4) + "l8 4-8 4z' fill='" + encre + "'/>";
  s += "<path d='M" + (px(0) - 4) + " " + py(16) + "l4 -8 4 8z' fill='" + encre + "'/>";
  s += "<text x='" + (px(0) + 6) + "' y='" + (py(16) - 2) + "' font-size='10'>Température (°C)</text>";
  s += "<text x='" + px(14.5) + "' y='" + (py(0) - 8) + "' text-anchor='end' font-size='10'>Temps (min)</text>";
  for (let T = -20; T <= 10; T += 10) {
    s += "<line x1='" + (px(0) - 4) + "' y1='" + py(T) + "' x2='" + px(0) + "' y2='" + py(T) + "' stroke='" + encre + "'/>";
    s += "<text x='" + (px(0) - 8) + "' y='" + (py(T) + 4) + "' text-anchor='end' font-size='10'>" + T + "</text>";
  }
  for (let t = 1; t <= 14; t++) {
    s += "<line x1='" + px(t) + "' y1='" + (py(0) - 3) + "' x2='" + px(t) + "' y2='" + (py(0) + 3) + "' stroke='" + encre + "'/>";
    if (t % 2 === 0) s += "<text x='" + px(t) + "' y='" + (py(0) + 14) + "' text-anchor='middle' font-size='10'>" + t + "</text>";
  }
  // zones
  s += "<line x1='" + px(3) + "' y1='" + py(16) + "' x2='" + px(3) + "' y2='" + py(-22) + "' stroke='#2f5e8e' stroke-dasharray='4 3'/>";
  s += "<line x1='" + px(8) + "' y1='" + py(16) + "' x2='" + px(8) + "' y2='" + py(-22) + "' stroke='#2f5e8e' stroke-dasharray='4 3'/>";
  s += "<text x='" + px(1.5) + "' y='" + py(-13) + "' text-anchor='middle' fill='#2f5e8e'>eau liquide</text>";
  s += "<text x='" + px(5.5) + "' y='" + py(-13) + "' text-anchor='middle' fill='#2f5e8e'>liquide + solide</text>";
  s += "<text x='" + px(11) + "' y='" + py(-21) + "' text-anchor='middle' fill='#2f5e8e'>eau solide</text>";
  // courbe
  s += "<polyline points='" + pts.map(p => px(p[0]) + "," + py(p[1])).join(" ") + "' fill='none' stroke='#b23a2e' stroke-width='2'/>";
  pts.forEach(p => { s += "<circle cx='" + px(p[0]) + "' cy='" + py(p[1]) + "' r='2.2' fill='#b23a2e'/>"; });
  s += "<text x='" + px(7) + "' y='" + py(13) + "' text-anchor='middle' font-size='12' fill='#b23a2e'>Solidification de l'eau salée</text>";
  return s + "</svg>";
}

module.exports = {
  id: "physique-s05-1",
  fiches: [
    {
      id: "physique-s05-1-f1", notion: "Vaporisation puis fusion dans un ballon",
      titre: "L'eau qui bout, la glace qui fond",
      texte: "Dans un ballon, on chauffe de l'eau jusqu'à ce qu'elle bouille : les premières lignes du tableau de mesures, de l'eau liquide à la vapeur, décrivent une vaporisation. Dans la deuxième partie, de la glace fond dans le ballon : c'est une fusion. Dans les deux cas, on note la température dans un tableau, ligne après ligne.",
      pointsCles: ["Première partie : l'eau bout, vaporisation", "Deuxième partie : la glace fond, fusion", "Les températures sont notées dans un tableau"],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "ballon", def: "le récipient de verre dans lequel on chauffe l'eau pendant l'expérience" }
      ],
      schema: null, prerequis: ["physique-s02-1-f1", "physique-s02-1-f2"], source: P(6)
    },
    {
      id: "physique-s05-1-f2", notion: "Pendant un changement d'état, la température ne change pas",
      titre: "Le palier de température",
      texte: "Tant que l'eau pure est dans un seul état, sa température monte quand on chauffe ou baisse quand on refroidit. Mais quand deux états sont présents en même temps dans le ballon, glace et eau liquide par exemple, la température reste la même. Elle ne bouge plus tant que le changement d'état n'est pas terminé.",
      pointsCles: ["Deux états en même temps : température constante", "Le palier dure tant que le changement d'état n'est pas fini", "Un seul état : la température peut monter ou baisser"],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "palier de température", def: "une période où la température reste la même, pendant un changement d'état" }
      ],
      schema: null, prerequis: ["physique-s05-1-f1"], source: P(6)
    },
    {
      id: "physique-s05-1-f3", notion: "Fusion et solidification de l'eau pure : 0 °C",
      titre: "Même température dans les deux sens",
      texte: "La solidification fait passer l'eau de l'état liquide à l'état solide. C'est l'inverse de la fusion, qui fait passer la glace à l'état liquide. Pour l'eau pure, les deux ont lieu à la même température : 0 °C. L'eau gèle à 0 °C et la glace fond à 0 °C.",
      pointsCles: ["Solidification : liquide → solide", "Fusion : solide → liquide", "Eau pure : fusion et solidification à 0 °C"],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "température de fusion", def: "la température à laquelle un solide fond ; 0 °C pour la glace pure" },
        { mot: "température de solidification", def: "la température à laquelle un liquide devient solide ; la même que celle de fusion" }
      ],
      schema: null, prerequis: ["physique-s02-1-f1", "physique-s05-1-f2"], source: P(6)
    },
    {
      id: "physique-s05-1-f4", notion: "Lire le graphique de solidification de l'eau salée",
      titre: "Trois zones sur le graphique",
      texte: "Le graphique de solidification de l'eau salée porte le temps en minutes en abscisse et la température en degrés Celsius en ordonnée. Trois zones se suivent : eau liquide, puis eau liquide et solide ensemble, puis eau solide. Au début, l'eau est à environ 10 °C et sa température baisse ; à la fin, la glace continue de refroidir.",
      pointsCles: ["Abscisse : le temps en minutes", "Ordonnée : la température en °C", "Zones : liquide, liquide + solide, solide", "Titre : solidification de l'eau salée"],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "abscisse", def: "l'axe horizontal d'un graphique ; ici, le temps" },
        { mot: "ordonnée", def: "l'axe vertical d'un graphique ; ici, la température" }
      ],
      schema: "physique-s05-1-s1", prerequis: ["methode-graphique-f5", "physique-s05-1-f2"], source: P(7)
    },
    {
      id: "physique-s05-1-f5", notion: "L'eau salée ne gèle pas comme l'eau pure",
      titre: "Une solidification en pente",
      texte: "Sur le graphique, l'eau salée commence à se solidifier vers la troisième minute, un peu en dessous de 0 °C, et finit vers la huitième. Pendant ce temps, liquide et solide coexistent, mais la température ne reste pas fixe : elle continue de baisser doucement. Ce n'est pas un vrai palier, contrairement à l'eau pure.",
      pointsCles: ["Début de la solidification : un peu sous 0 °C", "Pendant la solidification, la température baisse doucement", "Pas de vrai palier, à la différence de l'eau pure"],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "eau salée", def: "de l'eau dans laquelle du sel est dissous ; elle gèle un peu plus bas que l'eau pure" }
      ],
      schema: "physique-s05-1-s1", prerequis: ["physique-s05-1-f4", "physique-s04-1-f3"], source: P(7)
    }
  ],
  schemas: [
    { id: "physique-s05-1-s1", legende: "Solidification de l'eau salée : trois zones, et une température qui continue de baisser doucement pendant le changement d'état (graphique redessiné d'après le corrigé).", svg: graphique() }
  ],
  questions: [
    // f1 : les deux parties de l'expérience
    { id: "physique-s05-1-q1", fiche: "physique-s05-1-f1", type: "qcm", niveau: 1,
      enonce: "Dans la première partie de l'expérience, on chauffe l'eau du ballon jusqu'à ce qu'elle bouille. Quel changement d'état observe-t-on ?",
      choix: ["Une vaporisation", "Une fusion", "Une solidification", "Une liquéfaction"],
      reponse: "Une vaporisation",
      explication: "L'eau liquide devient vapeur : c'est une vaporisation. Les premières lignes du tableau de mesures la décrivent.", source: P(6) },
    { id: "physique-s05-1-q2", fiche: "physique-s05-1-f1", type: "qcm", niveau: 1,
      enonce: "Dans la deuxième partie, de la glace fond dans le ballon. Comment s'appelle ce changement d'état ?",
      choix: ["Une fusion", "Une vaporisation", "Une liquéfaction", "Une solidification"],
      reponse: "Une fusion",
      explication: "La glace, solide, devient liquide : c'est une fusion. C'est l'inverse de la solidification.", source: P(6) },
    { id: "physique-s05-1-q3", fiche: "physique-s05-1-f1", type: "vrai_faux", niveau: 2,
      enonce: "Les premières lignes du tableau de mesures correspondent à la fusion de la glace.",
      corrections: ["Faux : elles correspondent à la vaporisation, la fusion vient dans la deuxième partie.", "Faux : elles correspondent à la solidification de l'eau.", "Faux : le tableau ne contient aucune mesure de température."],
      reponse: { vrai: false, correction: "Faux : elles correspondent à la vaporisation, la fusion vient dans la deuxième partie." },
      explication: "L'expérience commence par chauffer l'eau jusqu'à l'ébullition : c'est la vaporisation. La fusion de la glace vient ensuite.", source: P(6) },
    { id: "physique-s05-1-q4", fiche: "physique-s05-1-f1", type: "vrai_faux", niveau: 1,
      enonce: "Dans cette séance, on relève la température de l'eau à mesure qu'elle change d'état.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : les mesures sont notées dans un tableau, ligne après ligne. On peut ensuite en tirer un graphique.", source: P(6) },
    { id: "physique-s05-1-q5", fiche: "physique-s05-1-f1", type: "association", niveau: 2,
      enonce: "Relie chaque élément de l'expérience à ce qui lui correspond.",
      gauche: ["Première partie", "Deuxième partie", "Eau liquide qui bout", "Glace qui fond"],
      droite: ["Fusion", "Vaporisation", "La glace devient liquide", "L'eau liquide devient vapeur"],
      reponse: [[0, 1], [1, 0], [2, 3], [3, 2]],
      explication: "Première partie : l'eau bout, c'est la vaporisation. Deuxième partie : la glace fond, c'est la fusion.", source: P(6) },
    { id: "physique-s05-1-q6", fiche: "physique-s05-1-f1", type: "qcm", niveau: 3,
      enonce: "Pourquoi l'expérience se fait-elle en deux parties ?",
      choix: ["Pour étudier deux changements d'état", "Pour vérifier que le ballon résiste au froid", "Pour comparer de l'eau pure et de l'eau salée", "Pour mesurer la masse de l'eau avant et après"],
      reponse: "Pour étudier deux changements d'état",
      explication: "La première partie fait bouillir l'eau, la seconde fait fondre la glace. On observe ainsi la vaporisation puis la fusion.", source: P(6) },
    { id: "physique-s05-1-q7", fiche: "physique-s05-1-f1", type: "qcm", niveau: 2,
      enonce: "Comment range-t-on les mesures de température prises pendant l'expérience ?",
      choix: ["Dans un tableau", "Dans une liste sans ordre", "Sur une carte", "Dans une frise chronologique"],
      reponse: "Dans un tableau",
      explication: "Les mesures sont notées dans un tableau. Les premières lignes correspondent à la vaporisation.", source: P(6) },
    // f2 : le palier
    { id: "physique-s05-1-q8", fiche: "physique-s05-1-f2", type: "qcm", niveau: 1,
      enonce: "Dans le ballon, l'eau est à la fois liquide et solide. Que fait sa température ?",
      choix: ["Elle reste la même", "Elle monte vite", "Elle baisse vite", "Elle double"],
      reponse: "Elle reste la même",
      explication: "Tant que les deux états sont présents, la température ne bouge pas. C'est le palier du changement d'état.", source: P(6) },
    { id: "physique-s05-1-q9", fiche: "physique-s05-1-f2", type: "vrai_faux", niveau: 1,
      enonce: "Pendant un changement d'état de l'eau pure, la température reste constante.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : quand liquide et solide sont ensemble, la température ne change pas. Elle repart seulement quand le changement est fini.", source: P(6) },
    { id: "physique-s05-1-q10", fiche: "physique-s05-1-f2", type: "vrai_faux", niveau: 2,
      enonce: "Quand on chauffe un mélange de glace et d'eau liquide, la température monte tout de suite.",
      corrections: ["Faux : elle reste la même tant qu'il reste de la glace.", "Faux : elle baisse tant qu'il reste de la glace.", "Faux : elle monte seulement si l'on ajoute du sel."],
      reponse: { vrai: false, correction: "Faux : elle reste la même tant qu'il reste de la glace." },
      explication: "Tant que glace et eau liquide coexistent, la température reste constante. Elle remonte quand toute la glace a fondu.", source: P(6) },
    { id: "physique-s05-1-q11", fiche: "physique-s05-1-f2", type: "qcm", niveau: 2,
      enonce: "À quel moment la température de l'eau pure peut-elle à nouveau monter ou baisser ?",
      choix: ["Quand il ne reste plus qu'un seul état", "Quand les deux états sont présents", "Jamais, elle reste toujours fixe", "Seulement quand on ajoute de l'eau"],
      reponse: "Quand il ne reste plus qu'un seul état",
      explication: "Pendant le changement d'état, la température reste fixe. Une fois un seul état présent, elle peut varier à nouveau.", source: P(6) },
    { id: "physique-s05-1-q12", fiche: "physique-s05-1-f2", type: "qcm", niveau: 3,
      enonce: "Pourquoi la température reste-t-elle fixe pendant que la glace fond ?",
      choix: ["Parce que deux états coexistent dans le ballon", "Parce que le ballon n'est pas chauffé pendant ce temps", "Parce que l'eau liquide refroidit la glace", "Parce que le thermomètre est bloqué dans la glace"],
      reponse: "Parce que deux états coexistent dans le ballon",
      explication: "Tant que glace et eau liquide sont ensemble, la température ne change pas. Elle se remet à monter quand il ne reste que du liquide.", source: P(6) },
    { id: "physique-s05-1-q13", fiche: "physique-s05-1-f2", type: "qcm", niveau: 3,
      enonce: "Comment reconnaît-on un changement d'état de l'eau pure sur un graphique de température ?",
      choix: ["La courbe forme un palier horizontal", "La courbe monte très vite", "La courbe descend très vite", "La courbe revient au point de départ"],
      reponse: "La courbe forme un palier horizontal",
      explication: "Pendant le changement d'état de l'eau pure, la température ne varie pas : la courbe est plate. C'est un palier.", source: P(6) },
    { id: "physique-s05-1-q14", fiche: "physique-s05-1-f2", type: "trou", niveau: 2,
      enonce: "Complète la règle du palier.",
      texte: "Quand l'eau pure est dans ___ états en même temps, sa température reste la ___.",
      banque: ["deux", "même", "trois", "plus haute"],
      reponse: [["deux"], ["même"]],
      explication: "Deux états présents, par exemple glace et eau liquide : la température ne bouge pas. C'est le palier.", source: P(6) },
    { id: "physique-s05-1-q36", fiche: "physique-s05-1-f2", type: "qcm_multiple", niveau: 2,
      enonce: "Dans quelles situations la température de l'eau pure reste-t-elle fixe ? (plusieurs réponses)",
      choix: ["De la glace fond dans de l'eau liquide", "De l'eau liquide bout et devient vapeur", "De l'eau liquide refroidit sans geler", "De la glace seule se réchauffe", "De l'eau liquide gèle peu à peu"],
      reponse: ["De la glace fond dans de l'eau liquide", "De l'eau liquide bout et devient vapeur", "De l'eau liquide gèle peu à peu"],
      explication: "Dès que deux états sont présents ensemble, la température ne bouge pas : fusion, vaporisation, solidification. Avec un seul état, elle varie.", source: P(6) },
    // f3 : 0 °C
    { id: "physique-s05-1-q15", fiche: "physique-s05-1-f3", type: "qcm", niveau: 1,
      enonce: "À quelle température l'eau pure se solidifie-t-elle ?",
      choix: ["0 °C", "50 °C", "10 °C", "−10 °C"],
      reponse: "0 °C",
      explication: "L'eau pure gèle à 0 °C. C'est aussi la température à laquelle la glace fond.", source: P(6) },
    { id: "physique-s05-1-q16", fiche: "physique-s05-1-f3", type: "vrai_faux", niveau: 2,
      enonce: "La fusion et la solidification de l'eau pure ont lieu à la même température.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : la glace fond à 0 °C et l'eau gèle à 0 °C. Les deux changements inverses ont la même température.", source: P(6) },
    { id: "physique-s05-1-q17", fiche: "physique-s05-1-f3", type: "vrai_faux", niveau: 2,
      enonce: "L'eau pure gèle à une température plus basse que celle où la glace fond.",
      corrections: ["Faux : les deux ont lieu à la même température, 0 °C.", "Faux : l'eau gèle à une température plus haute que celle où la glace fond.", "Faux : l'eau pure ne gèle jamais."],
      reponse: { vrai: false, correction: "Faux : les deux ont lieu à la même température, 0 °C." },
      explication: "Solidification et fusion sont deux changements inverses. Pour l'eau pure, ils ont lieu tous les deux à 0 °C.", source: P(6) },
    { id: "physique-s05-1-q18", fiche: "physique-s05-1-f3", type: "qcm", niveau: 1,
      enonce: "Quel changement d'état est l'inverse de la fusion ?",
      choix: ["La solidification", "La vaporisation", "La liquéfaction", "La dissolution"],
      reponse: "La solidification",
      explication: "La fusion va du solide au liquide, la solidification du liquide au solide. L'une est l'inverse de l'autre.", source: P(6) },
    { id: "physique-s05-1-q19", fiche: "physique-s05-1-f3", type: "qcm", niveau: 3,
      enonce: "De l'eau pure est à −5 °C. Dans quel état se trouve-t-elle ?",
      choix: ["Solide", "Liquide", "Gazeux", "Liquide et gazeux"],
      reponse: "Solide",
      explication: "L'eau pure est solide en dessous de 0 °C. À −5 °C, c'est de la glace.", indice: "Compare avec 0 °C.", source: P(6) },
    { id: "physique-s05-1-q20", fiche: "physique-s05-1-f3", type: "qcm", niveau: 3,
      enonce: "Un thermomètre plongé dans de la glace pure qui fond indique 0 °C. Pourquoi ?",
      choix: ["Parce que la fusion de la glace pure a lieu à 0 °C", "Parce que le thermomètre ne descend pas plus bas", "Parce que la glace ne peut pas être plus froide que 0 °C", "Parce que l'eau liquide est toujours à 0 °C"],
      reponse: "Parce que la fusion de la glace pure a lieu à 0 °C",
      explication: "La glace pure fond à 0 °C, et la température reste à cette valeur tant qu'elle fond. Le thermomètre affiche donc 0 °C.", source: P(6) },
    { id: "physique-s05-1-q21", fiche: "physique-s05-1-f3", type: "qcm", niveau: 2,
      enonce: "Comment s'appelle le passage de l'eau liquide à la glace ?",
      choix: ["La solidification", "La fusion", "La vaporisation", "La liquéfaction"],
      reponse: "La solidification",
      explication: "Liquide vers solide, c'est la solidification. Elle a lieu à 0 °C pour l'eau pure.", source: P(6) },
    { id: "physique-s05-1-q37", fiche: "physique-s05-1-f3", type: "qcm_multiple", niveau: 2,
      enonce: "Quelles affirmations sur l'eau pure sont justes ? (plusieurs réponses)",
      choix: ["Elle gèle à 0 °C", "La glace fond à 0 °C", "Elle gèle à 50 °C", "Fusion et solidification ont la même température", "La glace fond à −10 °C"],
      reponse: ["Elle gèle à 0 °C", "La glace fond à 0 °C", "Fusion et solidification ont la même température"],
      explication: "Pour l'eau pure, fusion et solidification ont lieu toutes deux à 0 °C. Ce sont deux changements inverses à la même température.", source: P(6) },
    // f4 : lire le graphique
    { id: "physique-s05-1-q22", fiche: "physique-s05-1-f4", type: "qcm", niveau: 1,
      enonce: "Sur le graphique de solidification de l'eau salée, que représente l'axe horizontal ?",
      choix: ["Le temps en minutes", "La température en degrés Celsius", "La masse en grammes", "Le volume en millilitres"],
      reponse: "Le temps en minutes",
      explication: "Le temps en minutes est en abscisse, sur l'axe horizontal. La température est en ordonnée.", source: P(7) },
    { id: "physique-s05-1-q23", fiche: "physique-s05-1-f4", type: "qcm", niveau: 1,
      enonce: "Sur ce graphique, dans quelle unité la température est-elle exprimée ?",
      choix: ["En degrés Celsius", "En minutes", "En grammes", "En litres"],
      reponse: "En degrés Celsius",
      explication: "L'axe vertical porte les températures en degrés Celsius. L'axe horizontal porte le temps en minutes.", source: P(7) },
    { id: "physique-s05-1-q24", fiche: "physique-s05-1-f4", type: "ordre", niveau: 2,
      enonce: "Remets dans l'ordre les trois zones du graphique, de la première à la dernière.",
      elements: ["Eau liquide et solide", "Eau solide", "Eau liquide"],
      reponse: [2, 0, 1],
      explication: "L'eau salée est d'abord liquide, puis liquide et solide pendant la solidification, puis entièrement solide.", source: P(7) },
    { id: "physique-s05-1-q25", fiche: "physique-s05-1-f4", type: "vrai_faux", niveau: 2,
      enonce: "Sur ce graphique, l'eau salée est d'abord solide, puis liquide.",
      corrections: ["Faux : elle est d'abord liquide, puis elle se solidifie.", "Faux : elle reste liquide du début à la fin.", "Faux : elle est gazeuse au début."],
      reponse: { vrai: false, correction: "Faux : elle est d'abord liquide, puis elle se solidifie." },
      explication: "C'est une solidification : l'eau part de l'état liquide. Elle finit à l'état solide.", source: P(7) },
    { id: "physique-s05-1-q26", fiche: "physique-s05-1-f4", type: "vrai_faux", niveau: 1,
      enonce: "Au début de l'expérience, l'eau salée est liquide et sa température est d'environ 10 °C.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : la courbe part d'environ 10 °C. L'eau salée est alors liquide et refroidit.", source: P(7) },
    { id: "physique-s05-1-q27", fiche: "physique-s05-1-f4", type: "qcm", niveau: 3,
      enonce: "Comment sait-on, en lisant le graphique, que l'eau salée est en train de se solidifier ?",
      choix: ["On est dans la zone « liquide et solide »", "La température remonte brusquement vers 10 °C", "La courbe monte au-dessus de 50 °C", "Le temps s'arrête de s'écouler"],
      reponse: "On est dans la zone « liquide et solide »",
      explication: "Entre la zone liquide et la zone solide, les deux états coexistent. C'est là que l'eau salée se solidifie.", source: P(7) },
    { id: "physique-s05-1-q28", fiche: "physique-s05-1-f4", type: "qcm", niveau: 2,
      enonce: "Que fait la température de la glace salée dans la dernière zone du graphique ?",
      choix: ["Elle continue de baisser", "Elle remonte vers 0 °C", "Elle reste à 0 °C", "Elle monte jusqu'à 10 °C"],
      reponse: "Elle continue de baisser",
      explication: "Une fois toute l'eau solidifiée, la glace continue de refroidir. La courbe descend bien en dessous de −10 °C.", source: P(7) },
    // f5 : l'eau salée
    { id: "physique-s05-1-q29", fiche: "physique-s05-1-f5", type: "vrai_faux", niveau: 2,
      enonce: "Pendant que l'eau salée se solidifie, sa température continue de baisser doucement.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : la courbe n'est pas plate, elle descend lentement sous 0 °C. Ce n'est pas un vrai palier comme pour l'eau pure.", source: P(7) },
    { id: "physique-s05-1-q30", fiche: "physique-s05-1-f5", type: "vrai_faux", niveau: 2,
      enonce: "L'eau salée se solidifie exactement comme l'eau pure, avec un palier à 0 °C.",
      corrections: ["Faux : sa température continue de baisser doucement, un peu en dessous de 0 °C.", "Faux : sa température remonte pendant la solidification.", "Faux : l'eau salée ne se solidifie jamais."],
      reponse: { vrai: false, correction: "Faux : sa température continue de baisser doucement, un peu en dessous de 0 °C." },
      explication: "L'eau pure a un palier à 0 °C. L'eau salée se solidifie un peu en dessous, et sa température continue de descendre pendant ce temps.", source: P(7) },
    { id: "physique-s05-1-q31", fiche: "physique-s05-1-f5", type: "qcm", niveau: 2,
      enonce: "À partir de quelle minute, environ, l'eau salée commence-t-elle à se solidifier sur le graphique ?",
      choix: ["Vers la 3e minute", "Dès la 1re minute", "Vers la 8e minute", "Vers la 12e minute"],
      reponse: "Vers la 3e minute",
      explication: "La zone « liquide et solide » commence vers la 3e minute. Elle se termine vers la 8e.", source: P(7) },
    { id: "physique-s05-1-q32", fiche: "physique-s05-1-f5", type: "qcm", niveau: 3,
      enonce: "Pourquoi dit-on que la solidification de l'eau salée n'a pas de vrai palier ?",
      choix: ["Parce que la température continue de baisser doucement", "Parce que la température remonte pendant le changement d'état", "Parce que le changement d'état est instantané", "Parce que l'eau salée reste liquide à toute température"],
      reponse: "Parce que la température continue de baisser doucement",
      explication: "Pour l'eau pure, la courbe est plate à 0 °C. Pour l'eau salée, elle descend lentement pendant que la glace se forme.", source: P(7) },
    { id: "physique-s05-1-q33", fiche: "physique-s05-1-f5", type: "qcm", niveau: 2,
      enonce: "À quelle température, par rapport à 0 °C, l'eau salée commence-t-elle à geler ?",
      choix: ["Un peu en dessous de 0 °C", "Exactement à 0 °C", "Nettement au-dessus de 0 °C", "À 50 °C"],
      reponse: "Un peu en dessous de 0 °C",
      explication: "L'eau salée gèle un peu plus bas que l'eau pure. La courbe passe sous l'axe du 0 °C quand la solidification commence.", source: P(7) },
    { id: "physique-s05-1-q34", fiche: "physique-s05-1-f5", type: "qcm_multiple", niveau: 3,
      enonce: "Qu'est-ce qui distingue la solidification de l'eau salée de celle de l'eau pure ? (plusieurs réponses)",
      choix: ["Elle commence un peu en dessous de 0 °C", "La température continue de baisser pendant le changement d'état", "Elle commence au-dessus de 10 °C", "La température reste parfaitement fixe", "Elle n'a pas de vrai palier"],
      reponse: ["Elle commence un peu en dessous de 0 °C", "La température continue de baisser pendant le changement d'état", "Elle n'a pas de vrai palier"],
      explication: "L'eau salée gèle un peu sous 0 °C et sa température continue de descendre doucement pendant la solidification. L'eau pure, elle, a un palier fixe à 0 °C.", source: P(7) },
    { id: "physique-s05-1-q35", fiche: "physique-s05-1-f5", type: "qcm", niveau: 1,
      enonce: "Quel liquide a été refroidi pour tracer le graphique de cette séance ?",
      choix: ["De l'eau salée", "De l'eau pure", "De l'huile", "Du lait"],
      reponse: "De l'eau salée",
      explication: "Le graphique montre la solidification de l'eau salée. Sa courbe descend doucement pendant le changement d'état.", source: P(7) }
  ],
  bonus: [
    {
      id: "physique-s05-1-b1",
      fiche: "physique-s05-1-f3",
      titre: "Le 0 et le 100 du thermomètre",
      texte: "L'échelle des degrés Celsius porte le nom d'Anders Celsius, astronome et physicien suédois, qui proposa en 1742 une échelle en cent degrés. Sur son thermomètre, le 0 marquait l'eau bouillante et le 100 la glace fondante ! Après sa mort, ses collègues, Carl von Linné sans doute, retournèrent l'échelle : 0 °C pour la glace fondante, 100 °C pour l'eau bouillante.",
      source: { titre: "Anders Celsius", editeur: "Wikipédia, l'encyclopédie libre", url: "https://fr.wikipedia.org/wiki/Anders_Celsius" }
    }
  ],
  nonCouvert: [
    "La leçon elle-même (définitions, tableau des températures de changement d'état) : seul le corrigé des questions est déposé, pas le livret de cours.",
    "Le tableau de mesures de l'expérience du ballon (températures relevées, durées) : le corrigé dit seulement quelles lignes correspondent à la vaporisation.",
    "La température de vaporisation de l'eau (100 °C) : elle n'apparaît pas dans le corrigé de cette séance, mais sur le schéma de la séance 6.",
    "La valeur exacte à laquelle l'eau salée commence à geler : le graphique la montre un peu sous 0 °C, sans la chiffrer (la séance 6 donne −2 °C pour la glace salée).",
    "Le protocole du TP de solidification de l'eau salée (matériel, quantité de sel, mesures) : seul le graphique final est reproduit."
  ]
};
