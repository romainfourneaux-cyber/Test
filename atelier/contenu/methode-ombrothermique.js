// Source en clair du savoir-faire « diagramme ombrothermique » (rattaché aux SVT).
const F = "methodes/Fiche methode - Diagramme ombrothermique.pdf";
const P = (page) => ({ fichier: F, page: page });

// Schéma redessiné avec des valeurs inventées (ville imaginaire), pas celles de la fiche.
function schema() {
  const pluie = [60, 50, 45, 55, 70, 40, 20, 25, 50, 80, 90, 75];
  const temp = [3, 4, 8, 11, 15, 19, 22, 21, 17, 12, 7, 4];
  const x0 = 60, y0 = 230, larg = 30, hMax = 180; // 100 mm = 180 px ; 50 °C = 180 px
  let s = "<svg viewBox='0 0 480 280' xmlns='http://www.w3.org/2000/svg' font-family='Georgia,serif' font-size='11' fill='#2e2419'>";
  pluie.forEach((p, i) => {
    const h = p / 100 * hMax;
    s += `<rect x='${x0 + i * larg + 4}' y='${y0 - h}' width='${larg - 8}' height='${h}' fill='#7fb0d8' stroke='#2f5a8a'/>`;
  });
  const pts = temp.map((t, i) => `${x0 + i * larg + larg / 2},${(y0 - t / 50 * hMax).toFixed(1)}`);
  s += `<polyline points='${pts.join(" ")}' fill='none' stroke='#9a4a32' stroke-width='2.5'/>`;
  pts.forEach(p => { const [x, y] = p.split(","); s += `<path d='M${x - 4} ${y - 4}l8 8M${x - 4} ${+y + 4}l8 -8' stroke='#9a4a32' stroke-width='1.5'/>`; });
  s += `<line x1='${x0}' y1='${y0}' x2='${x0 + 12 * larg}' y2='${y0}' stroke='#2e2419' stroke-width='2'/>`;
  s += `<line x1='${x0}' y1='${y0}' x2='${x0}' y2='${y0 - hMax - 10}' stroke='#9a4a32' stroke-width='2'/>`;
  s += `<line x1='${x0 + 12 * larg}' y1='${y0}' x2='${x0 + 12 * larg}' y2='${y0 - hMax - 10}' stroke='#2f5a8a' stroke-width='2'/>`;
  for (let k = 0; k <= 5; k++) {
    const y = y0 - k * hMax / 5;
    s += `<text x='${x0 - 6}' y='${y + 4}' text-anchor='end' fill='#9a4a32'>${k * 10}</text>`;
    s += `<text x='${x0 + 12 * larg + 6}' y='${y + 4}' fill='#2f5a8a'>${k * 20}</text>`;
  }
  "JFMAMJJASOND".split("").forEach((m, i) => { s += `<text x='${x0 + i * larg + larg / 2}' y='${y0 + 14}' text-anchor='middle'>${m}</text>`; });
  s += `<text x='${x0 - 40}' y='30' fill='#9a4a32'>°C</text><text x='${x0 + 12 * larg + 4}' y='30' fill='#2f5a8a'>mm</text>`;
  s += `<text x='240' y='270' text-anchor='middle' font-weight='bold'>Diagramme ombrothermique d'une ville imaginaire</text>`;
  return s + "</svg>";
}

module.exports = {
  id: "methode-ombrothermique",
  matiere: "svt",
  titre: "Savoir-faire : le diagramme ombrothermique",
  fiches: [
    {
      id: "methode-ombrothermique-f1", notion: "Ce que montre un diagramme ombrothermique",
      titre: "Pluies et températures d'un lieu",
      texte: "Un diagramme ombrothermique montre le climat d'un lieu mois par mois : les précipitations et les températures. Ce sont des moyennes, calculées sur trente ans.",
      pointsCles: ["Un lieu, douze mois", "Précipitations et températures", "Moyennes sur 30 ans"],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "précipitations", def: "l'eau qui tombe du ciel : pluie, neige, grêle" },
        { mot: "moyenne", def: "la valeur obtenue en partageant le total de plusieurs mesures entre elles" }
      ],
      schema: "methode-ombrothermique-s1", prerequis: [], source: P(1)
    },
    {
      id: "methode-ombrothermique-f2", notion: "Bâtons et courbe",
      titre: "Un graphique mixte",
      texte: "Les précipitations sont dessinées en bâtons : chaque bâton est le cumul moyen d'un mois, en millimètres. Les températures forment une courbe : un point par mois, en degrés Celsius, reliés par un trait. Il peut y avoir deux courbes, l'une des températures basses, l'autre des hautes.",
      pointsCles: ["Bâtons = précipitations (mm)", "Courbe = températures (°C)", "Bâtons + courbe = graphique mixte"],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "cumul", def: "la quantité totale accumulée, par exemple toute la pluie tombée en un mois" },
        { mot: "graphique mixte", def: "un graphique qui mélange deux façons de représenter : bâtons et courbe" }
      ],
      schema: "methode-ombrothermique-s1", prerequis: ["methode-ombrothermique-f1"], source: P(1)
    },
    {
      id: "methode-ombrothermique-f3", notion: "Les trois axes",
      titre: "Un axe horizontal, deux axes verticaux",
      texte: "L'axe horizontal porte les mois, de janvier à décembre ; il sert aux deux représentations. À gauche, un axe vertical rouge donne les températures en °C. À droite, un axe vertical bleu donne les précipitations en mm.",
      pointsCles: ["En bas : les mois", "À gauche, en rouge : °C", "À droite, en bleu : mm"],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "abscisse", def: "l'axe horizontal d'un graphique" },
        { mot: "ordonnée", def: "un axe vertical d'un graphique" }
      ],
      schema: "methode-ombrothermique-s1", prerequis: ["methode-ombrothermique-f2"], source: P(1)
    },
    {
      id: "methode-ombrothermique-f4", notion: "La règle des graduations",
      titre: "Précipitations = 2 × températures",
      texte: "Pour comparer les climats entre eux, on gradue les deux axes verticaux avec une règle : la valeur la plus haute des précipitations vaut le double de la température la plus haute. Si l'axe des pluies monte à 100 mm, celui des températures monte à 50 °C.",
      pointsCles: ["Maximum en mm = 2 × maximum en °C", "Exemple : 100 mm en face de 50 °C"],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [{ mot: "graduation", def: "un repère chiffré placé régulièrement le long d'un axe" }],
      schema: "methode-ombrothermique-s1", prerequis: ["methode-ombrothermique-f3"], source: P(1)
    },
    {
      id: "methode-ombrothermique-f5", notion: "Construire le diagramme",
      titre: "Les étapes de construction",
      texte: "On trace l'axe des mois avec le zéro. On repère le plus fort cumul de pluie et on choisit un maximum un peu au-dessus. On en déduit le maximum des températures. On dessine les bâtons en bleu clair, puis on place une croix par mois pour la température, on relie, et on écrit le titre.",
      pointsCles: ["1. Axe des mois et zéro", "2. Maximums des deux axes", "3. Bâtons bleu clair", "4. Croix des températures reliées", "5. Titre : lieu et période"],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [],
      schema: "methode-ombrothermique-s1", prerequis: ["methode-ombrothermique-f4"], source: P(2)
    }
  ],
  schemas: [
    { id: "methode-ombrothermique-s1", legende: "Exemple redessiné avec des valeurs inventées : bâtons bleus (mm, axe de droite), courbe rouge (°C, axe de gauche).", svg: schema() }
  ],
  questions: [
    // f1 : ce que montre le diagramme
    { id: "methode-ombrothermique-q1", fiche: "methode-ombrothermique-f1", type: "qcm", niveau: 2,
      enonce: "Que représente un diagramme ombrothermique ?",
      choix: ["Les précipitations et les températures moyennes de chaque mois en un lieu", "Les précipitations et les températures moyennes de chaque jour en un lieu", "Les températures moyennes de chaque mois, sans les précipitations", "Les précipitations moyennes de plusieurs lieux sur une même carte"],
      reponse: "Les précipitations et les températures moyennes de chaque mois en un lieu",
      explication: "Il montre, pour un lieu, les pluies et les températures moyennes de chaque mois. Ces moyennes sont calculées sur trente ans.", source: P(1) },
    { id: "methode-ombrothermique-q2", fiche: "methode-ombrothermique-f1", type: "vrai_faux", niveau: 1,
      enonce: "Les valeurs d'un diagramme ombrothermique sont celles d'une seule année.",
      corrections: ["Faux : ce sont des moyennes calculées sur trente ans.", "Faux : ce sont des moyennes calculées sur dix ans.", "Faux : ce sont les valeurs d'un seul mois."],
      reponse: { vrai: false, correction: "Faux : ce sont des moyennes calculées sur trente ans." },
      explication: "On utilise des moyennes sur 30 ans. Une seule année pourrait être exceptionnelle.", source: P(1) },
    { id: "methode-ombrothermique-q3", fiche: "methode-ombrothermique-f1", type: "qcm", niveau: 3,
      enonce: "Pourquoi utilise-t-on des moyennes sur trente ans plutôt qu'une seule année ?",
      choix: ["Pour montrer le climat habituel du lieu", "Pour montrer le temps qu'il fera l'année suivante", "Pour que bâtons et courbe aient la même hauteur", "Pour garder les records de pluie et de chaleur"],
      reponse: "Pour montrer le climat habituel du lieu",
      explication: "Une année peut être très sèche ou très chaude. La moyenne sur 30 ans montre le climat habituel.", source: P(1) },
    { id: "methode-ombrothermique-q21", fiche: "methode-ombrothermique-f1", type: "vrai_faux", niveau: 1,
      enonce: "Un diagramme ombrothermique décrit le climat d'une seule zone géographique.",
      corrections: [],
      reponse: { vrai: true, correction: null },
      explication: "Chaque diagramme correspond à un lieu précis, comme une ville. Pour comparer deux lieux, on compare leurs deux diagrammes.", source: P(1) },
    { id: "methode-ombrothermique-q22", fiche: "methode-ombrothermique-f1", type: "qcm_multiple", niveau: 2,
      enonce: "Coche ce qu'on peut lire sur un diagramme ombrothermique.",
      choix: ["Le cumul moyen des précipitations de chaque mois", "La température moyenne de chaque mois", "La pluie tombée un jour précis", "La température la plus haute jamais relevée", "La vitesse du vent chaque mois"],
      reponse: ["Le cumul moyen des précipitations de chaque mois", "La température moyenne de chaque mois"],
      explication: "Le diagramme ne donne que deux choses : les précipitations et les températures moyennes de chaque mois. Il ne dit rien d'un jour précis, d'un record ou du vent.", source: P(1) },
    { id: "methode-ombrothermique-q23", fiche: "methode-ombrothermique-f1", type: "qcm", niveau: 3,
      enonce: "Une année, un lieu connaît un été exceptionnellement chaud. Son diagramme ombrothermique en est-il bouleversé ?",
      choix: ["Non : chaque valeur est une moyenne sur trente ans", "Oui : le diagramme ne montre qu'une seule année", "Oui : on refait le diagramme après chaque été", "Non : le diagramme ne montre jamais les températures"],
      reponse: "Non : chaque valeur est une moyenne sur trente ans",
      explication: "Chaque valeur du diagramme est une moyenne sur trente ans. Une seule année exceptionnelle la change donc très peu.", source: P(1) },
    // f2 : bâtons et courbe
    { id: "methode-ombrothermique-q4", fiche: "methode-ombrothermique-f2", type: "qcm", niveau: 1,
      enonce: "Sur un diagramme ombrothermique, comment sont représentées les précipitations ?",
      choix: ["Par des bâtons", "Par une courbe", "Par des points reliés", "Par des flèches"],
      reponse: "Par des bâtons",
      explication: "Les précipitations sont en bâtons, un par mois. Les températures forment la courbe.", source: P(1) },
    { id: "methode-ombrothermique-q5", fiche: "methode-ombrothermique-f2", type: "vrai_faux", niveau: 1,
      enonce: "Les températures sont représentées par des points reliés par un trait.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : un point par mois, puis on relie les points pour obtenir la courbe.", source: P(1) },
    { id: "methode-ombrothermique-q6", fiche: "methode-ombrothermique-f2", type: "vrai_faux", niveau: 2,
      enonce: "Un diagramme ombrothermique a toujours une seule courbe de température.",
      corrections: ["Faux : il peut y en avoir deux, celle des températures basses et celle des hautes.", "Faux : il n'a jamais de courbe.", "Faux : il a une courbe par jour."],
      reponse: { vrai: false, correction: "Faux : il peut y en avoir deux, celle des températures basses et celle des hautes." },
      explication: "On peut tracer deux courbes : les moyennes des températures les plus basses et des plus hautes de la journée.", source: P(1) },
    { id: "methode-ombrothermique-q7", fiche: "methode-ombrothermique-f2", type: "qcm", niveau: 2,
      enonce: "Pourquoi dit-on que le diagramme ombrothermique est un graphique mixte ?",
      choix: ["Il mélange des bâtons et une courbe", "Il mélange des mois et des années", "Il mélange les climats de deux lieux différents", "Il mélange le jour et la nuit"],
      reponse: "Il mélange des bâtons et une courbe",
      explication: "Mixte veut dire mélangé. Il combine un diagramme en bâtons et un graphique linéaire.", source: P(1) },
    { id: "methode-ombrothermique-q25", fiche: "methode-ombrothermique-f2", type: "vrai_faux", niveau: 2,
      enonce: "Un bâton du diagramme représente la pluie tombée en un seul jour du mois.",
      corrections: ["Faux : il représente le cumul moyen de tout le mois, calculé sur trente ans.", "Faux : il représente la température moyenne du mois.", "Faux : il représente la pluie d'une année entière."],
      reponse: { vrai: false, correction: "Faux : il représente le cumul moyen de tout le mois, calculé sur trente ans." },
      explication: "Chaque bâton donne la quantité totale de précipitations d'un mois, en moyenne sur trente ans. Pluie, neige et grêle y sont comptées ensemble.", source: P(1) },
    { id: "methode-ombrothermique-q27", fiche: "methode-ombrothermique-f2", type: "association", niveau: 2,
      enonce: "Relie chaque élément du diagramme à ce qu'il représente.",
      gauche: ["Un bâton bleu", "Une croix rouge", "L'axe horizontal", "Le titre"],
      droite: ["Le lieu et la période des mesures", "Le cumul moyen de précipitations d'un mois", "Les mois de l'année", "La température moyenne d'un mois"],
      reponse: [[0, 1], [1, 3], [2, 2], [3, 0]],
      explication: "Un bâton donne les précipitations d'un mois et une croix sa température. L'axe horizontal porte les mois, le titre le lieu et la période.", source: P(1) },
    { id: "methode-ombrothermique-q28", fiche: "methode-ombrothermique-f2", type: "qcm", niveau: 3,
      enonce: "En face d'avril, un bâton monte jusqu'à 70 sur l'axe de droite. Que signifie-t-il ?",
      choix: ["En moyenne, il tombe 70 mm en avril", "En moyenne, il fait 70 °C en avril", "Il a plu pendant 70 jours en avril", "Il est tombé 70 mm en avril dernier"],
      reponse: "En moyenne, il tombe 70 mm en avril",
      explication: "L'axe de droite donne les précipitations en mm, et chaque bâton est une moyenne sur trente ans. Il tombe donc en moyenne 70 mm en avril.", source: P(1) },
    // f3 : les trois axes
    { id: "methode-ombrothermique-q8", fiche: "methode-ombrothermique-f3", type: "qcm", niveau: 1,
      enonce: "Que porte l'axe horizontal d'un diagramme ombrothermique ?",
      choix: ["Les mois de l'année", "Les températures en °C", "Les précipitations en mm", "Les années de mesure"],
      reponse: "Les mois de l'année",
      explication: "L'axe horizontal donne les douze mois. Il est commun aux bâtons et à la courbe.", source: P(1) },
    { id: "methode-ombrothermique-q9", fiche: "methode-ombrothermique-f3", type: "vrai_faux", niveau: 2,
      enonce: "Sur le diagramme, l'axe des précipitations est à gauche, en rouge.",
      corrections: ["Faux : à gauche, en rouge, ce sont les températures ; les précipitations sont à droite, en bleu.", "Faux : les précipitations sont sur l'axe horizontal.", "Faux : les précipitations sont à droite, en rouge."],
      reponse: { vrai: false, correction: "Faux : à gauche, en rouge, ce sont les températures ; les précipitations sont à droite, en bleu." },
      explication: "Rouge à gauche pour la chaleur en °C. Bleu à droite pour l'eau en mm.", indice: "Rouge comme la chaleur, bleu comme l'eau.", source: P(1) },
    { id: "methode-ombrothermique-q10", fiche: "methode-ombrothermique-f3", type: "association", niveau: 2,
      enonce: "Relie chaque axe à ce qu'il indique.",
      gauche: ["Axe horizontal", "Axe vertical de gauche", "Axe vertical de droite"],
      droite: ["Les précipitations en mm", "Les mois de l'année", "Les températures en °C"],
      reponse: [[0, 1], [1, 2], [2, 0]],
      explication: "En bas les mois, à gauche les °C, à droite les mm.", source: P(1) },
    { id: "methode-ombrothermique-q19", fiche: "methode-ombrothermique-f3", type: "qcm", niveau: 2,
      enonce: "Comment lire une croix rouge placée en face de la graduation 30 de l'axe de gauche ?",
      choix: ["C'est une température moyenne de 30 °C", "C'est un cumul moyen de précipitations de 30 mm", "C'est le trentième jour du mois", "C'est une pluie qui a duré 30 jours"],
      reponse: "C'est une température moyenne de 30 °C",
      explication: "Les croix rouges sont les températures, lues sur l'axe de gauche en °C. Cette croix indique donc une moyenne de 30 °C.", source: P(1) },
    { id: "methode-ombrothermique-q29", fiche: "methode-ombrothermique-f3", type: "vrai_faux", niveau: 2,
      enonce: "L'axe horizontal sert à la fois aux bâtons et à la courbe.",
      corrections: [],
      reponse: { vrai: true, correction: null },
      explication: "Les mois de l'axe horizontal valent pour les précipitations comme pour les températures. C'est l'axe commun aux deux représentations.", source: P(1) },
    { id: "methode-ombrothermique-q30", fiche: "methode-ombrothermique-f3", type: "qcm", niveau: 1,
      enonce: "Combien d'axes compte un diagramme ombrothermique ?",
      choix: ["Trois : un horizontal, deux verticaux", "Deux : un horizontal, un vertical", "Quatre : deux de chaque sorte", "Trois : deux horizontaux, un vertical"],
      reponse: "Trois : un horizontal, deux verticaux",
      explication: "Un axe horizontal pour les mois, et deux axes verticaux : les °C à gauche, les mm à droite. Cela fait trois axes.", source: P(1) },
    { id: "methode-ombrothermique-q31", fiche: "methode-ombrothermique-f3", type: "qcm_multiple", niveau: 3,
      enonce: "Coche les phrases justes sur les axes d'un diagramme ombrothermique.",
      choix: ["L'axe horizontal porte les douze mois", "Les températures se lisent à gauche, en °C", "Les précipitations se lisent à droite, en mm", "L'axe horizontal est gradué en années", "Les précipitations se lisent à gauche, en mm"],
      reponse: ["L'axe horizontal porte les douze mois", "Les températures se lisent à gauche, en °C", "Les précipitations se lisent à droite, en mm"],
      explication: "En bas, les douze mois ; à gauche, les températures en °C ; à droite, les précipitations en mm. L'axe horizontal ne porte jamais d'années : le diagramme décrit une année moyenne, mois par mois.", source: P(1) },
    // f4 : la règle des graduations
    { id: "methode-ombrothermique-q11", fiche: "methode-ombrothermique-f4", type: "qcm", niveau: 2,
      enonce: "L'axe des précipitations monte jusqu'à 140 mm. Jusqu'où doit monter l'axe des températures ?",
      choix: ["70 °C", "140 °C", "280 °C", "35 °C"],
      reponse: "70 °C",
      explication: "Le maximum en mm vaut le double du maximum en °C. 140 divisé par 2 donne 70.", indice: "Les millimètres valent le double des degrés.", source: P(1) },
    { id: "methode-ombrothermique-q12", fiche: "methode-ombrothermique-f4", type: "vrai_faux", niveau: 1,
      enonce: "La valeur maximale des précipitations est égale au double de la température maximale.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "C'est la règle des graduations : par exemple 100 mm en face de 50 °C.", source: P(1) },
    { id: "methode-ombrothermique-q13", fiche: "methode-ombrothermique-f4", type: "qcm", niveau: 3,
      enonce: "Pourquoi respecter la règle « maximum des pluies = 2 × maximum des températures » ?",
      choix: ["Pour pouvoir comparer les climats de lieux différents", "Pour que le diagramme tienne toujours sur une page", "Pour que les bâtons aient tous la même hauteur", "Pour que la courbe passe toujours au-dessus des bâtons"],
      reponse: "Pour pouvoir comparer les climats de lieux différents",
      explication: "Avec la même règle partout, deux diagrammes se comparent d'un coup d'œil.", source: P(1) },
    { id: "methode-ombrothermique-q14", fiche: "methode-ombrothermique-f4", type: "qcm", niveau: 2,
      enonce: "L'axe des températures monte jusqu'à 35 °C. Jusqu'où doit monter l'axe des précipitations ?",
      choix: ["70 mm", "35 mm", "17,5 mm", "140 mm"],
      reponse: "70 mm",
      explication: "On double la valeur des températures. 2 × 35 donne 70 mm.", source: P(1) },
    { id: "methode-ombrothermique-q32", fiche: "methode-ombrothermique-f4", type: "vrai_faux", niveau: 3,
      enonce: "Si l'axe des précipitations monte à 240 mm, celui des températures doit monter à 480 °C.",
      corrections: ["Faux : il doit monter à la moitié, soit 120 °C.", "Faux : il doit monter à la même valeur, 240 °C."],
      reponse: { vrai: false, correction: "Faux : il doit monter à la moitié, soit 120 °C." },
      explication: "C'est le maximum des précipitations qui vaut le double de celui des températures, pas l'inverse. Ici, 240 mm vont donc avec 120 °C.", source: P(1) },
    { id: "methode-ombrothermique-q34", fiche: "methode-ombrothermique-f4", type: "qcm_multiple", niveau: 2,
      enonce: "Coche les couples de maximums qui respectent la règle des graduations.",
      choix: ["100 mm et 50 °C", "140 mm et 70 °C", "70 mm et 35 °C", "100 mm et 100 °C", "50 mm et 100 °C"],
      reponse: ["100 mm et 50 °C", "140 mm et 70 °C", "70 mm et 35 °C"],
      explication: "La règle veut que le maximum en mm soit le double du maximum en °C. C'est le cas pour 100 et 50, 140 et 70, 70 et 35.", source: P(1) },
    // f5 : construire le diagramme
    { id: "methode-ombrothermique-q15", fiche: "methode-ombrothermique-f5", type: "ordre", niveau: 3,
      enonce: "Remets dans l'ordre les étapes de construction du diagramme.",
      elements: ["Placer les croix des températures et les relier", "Tracer l'axe des mois avec le zéro", "Dessiner les bâtons des précipitations", "Choisir les maximums des deux axes verticaux", "Écrire le titre"],
      reponse: [1, 3, 2, 0, 4],
      explication: "Axe des mois, maximums, bâtons, courbe, titre. On finit toujours par le titre.", source: P(2) },
    { id: "methode-ombrothermique-q16", fiche: "methode-ombrothermique-f5", type: "qcm", niveau: 3,
      enonce: "Le mois le plus pluvieux d'une ville reçoit 113 mm. Quel maximum est le plus pratique pour l'axe des précipitations ?",
      choix: ["120 mm", "113 mm", "100 mm", "226 mm"],
      reponse: "120 mm",
      explication: "On choisit une valeur ronde juste au-dessus du plus fort cumul. 120 mm convient, alors que 100 mm serait trop bas pour ce mois.", source: P(2) },
    { id: "methode-ombrothermique-q17", fiche: "methode-ombrothermique-f5", type: "vrai_faux", niveau: 1,
      enonce: "On dessine la courbe des températures avant de tracer l'axe des mois.",
      corrections: ["Faux : on trace d'abord l'axe des mois, puis les bâtons, puis la courbe.", "Faux : on commence par le titre, puis la courbe.", "Faux : on dessine les bâtons en premier, avant l'axe des mois."],
      reponse: { vrai: false, correction: "Faux : on trace d'abord l'axe des mois, puis les bâtons, puis la courbe." },
      explication: "Sans axe, impossible de savoir où placer les points. L'axe des mois vient en premier.", source: P(2) },
    { id: "methode-ombrothermique-q18", fiche: "methode-ombrothermique-f5", type: "qcm", niveau: 1,
      enonce: "Que doit contenir le titre d'un diagramme ombrothermique ?",
      choix: ["Le lieu et la période des mesures", "Le mois le plus pluvieux", "La température la plus haute", "Le nom de la personne qui l'a tracé"],
      reponse: "Le lieu et la période des mesures",
      explication: "Le titre dit de quel lieu il s'agit et sur quelles années portent les moyennes.", source: P(6) },
    { id: "methode-ombrothermique-q20", fiche: "methode-ombrothermique-f5", type: "qcm", niveau: 2,
      enonce: "Comment place-t-on la température d'un mois sur le diagramme ?",
      choix: ["Par une croix à la bonne hauteur", "Par un bâton bleu clair", "Par un petit trait horizontal de 5 mm", "Par une flèche vers l'axe de droite"],
      reponse: "Par une croix à la bonne hauteur",
      explication: "On repère chaque température par une croix au-dessus de son mois. On relie ensuite les croix.", source: P(5) }
  ],
  bonus: [
    { id: "methode-ombrothermique-b1", fiche: "methode-ombrothermique-f4", titre: "Le mois sec de Gaussen",
      texte: "Ce diagramme a été mis au point au milieu du XXe siècle par le botaniste français Henri Gaussen, avec F. Bagnouls. Grâce à la règle « 2 × », un mois est dit sec quand la courbe des températures passe au-dessus du bâton des pluies.",
      source: { titre: "Diagramme ombrothermique", editeur: "Wikipédia, l'encyclopédie libre", url: "https://fr.wikipedia.org/wiki/Diagramme_ombrothermique" } }
  ],
  nonCouvert: []
};
