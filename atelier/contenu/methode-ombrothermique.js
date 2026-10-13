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
    // f1
    { id: "methode-ombrothermique-q1", fiche: "methode-ombrothermique-f1", type: "qcm", niveau: 1,
      enonce: "Que représente un diagramme ombrothermique ?",
      choix: ["Les précipitations et les températures moyennes de chaque mois en un lieu", "Le nombre d'habitants d'une ville", "Les heures de lever du soleil", "La vitesse du vent chaque jour"],
      reponse: "Les précipitations et les températures moyennes de chaque mois en un lieu",
      explication: "Il montre, pour un lieu, les pluies et les températures moyennes de chaque mois.", source: P(1) },
    { id: "methode-ombrothermique-q2", fiche: "methode-ombrothermique-f1", type: "vrai_faux", niveau: 1,
      enonce: "Les valeurs d'un diagramme ombrothermique sont celles d'une seule année.",
      corrections: ["Faux : ce sont des moyennes calculées sur trente ans.", "Faux : ce sont les valeurs d'un seul jour.", "Faux : ce sont des valeurs inventées."],
      reponse: { vrai: false, correction: "Faux : ce sont des moyennes calculées sur trente ans." },
      explication: "On utilise des moyennes sur 30 ans. Une seule année pourrait être exceptionnelle.", source: P(1) },
    { id: "methode-ombrothermique-q3", fiche: "methode-ombrothermique-f1", type: "qcm", niveau: 2,
      enonce: "Pourquoi utilise-t-on des moyennes sur trente ans plutôt qu'une seule année ?",
      choix: ["Pour décrire le climat habituel du lieu, pas une année particulière", "Parce qu'on ne mesure la pluie qu'une fois tous les trente ans", "Pour que le diagramme soit plus coloré", "Parce que les thermomètres sont lents"],
      reponse: "Pour décrire le climat habituel du lieu, pas une année particulière",
      explication: "Une année peut être très sèche ou très chaude. La moyenne sur 30 ans montre le climat habituel.", source: P(1) },
    // f2
    { id: "methode-ombrothermique-q4", fiche: "methode-ombrothermique-f2", type: "qcm", niveau: 1,
      enonce: "Sur un diagramme ombrothermique, comment sont représentées les précipitations ?",
      choix: ["Par des bâtons", "Par une courbe", "Par des camemberts", "Par des flèches"],
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
      choix: ["Parce qu'il mélange des bâtons et une courbe", "Parce qu'il est dessiné à deux", "Parce qu'il mélange deux villes", "Parce qu'il a deux titres"],
      reponse: "Parce qu'il mélange des bâtons et une courbe",
      explication: "Mixte veut dire mélangé. Il combine un diagramme en bâtons et un graphique linéaire.", source: P(1) },
    // f3
    { id: "methode-ombrothermique-q8", fiche: "methode-ombrothermique-f3", type: "qcm", niveau: 1,
      enonce: "Que porte l'axe horizontal d'un diagramme ombrothermique ?",
      choix: ["Les mois, de janvier à décembre", "Les températures en °C", "Les précipitations en mm", "Les années de 1 à 30"],
      reponse: "Les mois, de janvier à décembre",
      explication: "L'axe horizontal donne les douze mois. Il est commun aux bâtons et à la courbe.", source: P(1) },
    { id: "methode-ombrothermique-q9", fiche: "methode-ombrothermique-f3", type: "vrai_faux", niveau: 1,
      enonce: "Sur le diagramme, l'axe des précipitations est à gauche, en rouge.",
      corrections: ["Faux : à gauche, en rouge, ce sont les températures ; les précipitations sont à droite, en bleu.", "Faux : les précipitations sont sur l'axe horizontal.", "Faux : il n'y a pas d'axe pour les précipitations."],
      reponse: { vrai: false, correction: "Faux : à gauche, en rouge, ce sont les températures ; les précipitations sont à droite, en bleu." },
      explication: "Rouge à gauche pour la chaleur en °C. Bleu à droite pour l'eau en mm.", indice: "Rouge comme la chaleur, bleu comme l'eau.", source: P(1) },
    { id: "methode-ombrothermique-q10", fiche: "methode-ombrothermique-f3", type: "association", niveau: 2,
      enonce: "Relie chaque axe à ce qu'il indique.",
      gauche: ["Axe horizontal", "Axe vertical de gauche", "Axe vertical de droite"],
      droite: ["Les précipitations en mm", "Les mois de l'année", "Les températures en °C"],
      reponse: [[0, 1], [1, 2], [2, 0]],
      explication: "En bas les mois, à gauche les °C, à droite les mm.", source: P(1) },
    // f4
    { id: "methode-ombrothermique-q11", fiche: "methode-ombrothermique-f4", type: "qcm", niveau: 2,
      enonce: "L'axe des précipitations monte jusqu'à 160 mm. Jusqu'où doit monter l'axe des températures ?",
      choix: ["80 °C", "160 °C", "320 °C", "40 °C"],
      reponse: "80 °C",
      explication: "Le maximum en mm vaut le double du maximum en °C. 160 divisé par 2 donne 80.", indice: "Les millimètres valent le double des degrés.", source: P(1) },
    { id: "methode-ombrothermique-q12", fiche: "methode-ombrothermique-f4", type: "vrai_faux", niveau: 1,
      enonce: "La valeur maximale des précipitations est égale au double de la température maximale.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "C'est la règle des graduations : par exemple 100 mm en face de 50 °C.", source: P(1) },
    { id: "methode-ombrothermique-q13", fiche: "methode-ombrothermique-f4", type: "qcm", niveau: 2,
      enonce: "Pourquoi respecter la règle « maximum des pluies = 2 × maximum des températures » ?",
      choix: ["Pour pouvoir comparer les climats de lieux différents", "Pour que le diagramme tienne sur une page", "Pour que les bâtons soient tous de la même taille", "Parce qu'il pleut deux fois par mois"],
      reponse: "Pour pouvoir comparer les climats de lieux différents",
      explication: "Avec la même règle partout, deux diagrammes se comparent d'un coup d'œil.", source: P(1) },
    { id: "methode-ombrothermique-q14", fiche: "methode-ombrothermique-f4", type: "qcm", niveau: 2,
      enonce: "L'axe des températures monte jusqu'à 30 °C. Jusqu'où doit monter l'axe des précipitations ?",
      choix: ["60 mm", "30 mm", "15 mm", "90 mm"],
      reponse: "60 mm",
      explication: "On double la valeur des températures. 2 × 30 donne 60 mm.", source: P(1) },
    // f5
    { id: "methode-ombrothermique-q15", fiche: "methode-ombrothermique-f5", type: "ordre", niveau: 2,
      enonce: "Remets dans l'ordre les étapes de construction du diagramme.",
      elements: ["Placer les croix des températures et les relier", "Tracer l'axe des mois avec le zéro", "Dessiner les bâtons des précipitations", "Choisir les maximums des deux axes verticaux", "Écrire le titre"],
      reponse: [1, 3, 2, 0, 4],
      explication: "Axe des mois, maximums, bâtons, courbe, titre. On finit toujours par le titre.", source: P(2) },
    { id: "methode-ombrothermique-q16", fiche: "methode-ombrothermique-f5", type: "qcm", niveau: 2,
      enonce: "Le mois le plus pluvieux d'une ville reçoit 87 mm. Quel maximum est le plus pratique pour l'axe des précipitations ?",
      choix: ["90 mm", "87 mm", "50 mm", "200 mm"],
      reponse: "90 mm",
      explication: "On prend une valeur ronde juste au-dessus du plus fort cumul. 90 mm convient, et l'axe des températures ira à 45 °C.", source: P(2) },
    { id: "methode-ombrothermique-q17", fiche: "methode-ombrothermique-f5", type: "vrai_faux", niveau: 1,
      enonce: "On dessine la courbe des températures avant de tracer l'axe des mois.",
      corrections: ["Faux : on trace d'abord l'axe des mois, puis les bâtons, puis la courbe.", "Faux : on ne trace jamais l'axe des mois.", "Faux : on commence par le titre."],
      reponse: { vrai: false, correction: "Faux : on trace d'abord l'axe des mois, puis les bâtons, puis la courbe." },
      explication: "Sans axe, impossible de savoir où placer les points. L'axe des mois vient en premier.", source: P(2) },
    { id: "methode-ombrothermique-q18", fiche: "methode-ombrothermique-f5", type: "qcm", niveau: 1,
      enonce: "Que doit contenir le titre d'un diagramme ombrothermique ?",
      choix: ["Le lieu et la période des mesures", "Le nom de l'élève seulement", "La couleur des bâtons", "Le mois le plus chaud"],
      reponse: "Le lieu et la période des mesures",
      explication: "Le titre dit de quel lieu il s'agit et sur quelles années portent les moyennes.", source: P(6) },
    { id: "methode-ombrothermique-q19", fiche: "methode-ombrothermique-f3", type: "qcm", niveau: 2,
      enonce: "Comment savoir, sur le diagramme, quel axe vertical lire pour une température ?",
      choix: ["On lit l'axe de gauche, en rouge, gradué en °C", "On lit l'axe de droite, en bleu, gradué en mm", "On lit l'axe horizontal", "On lit le titre"],
      reponse: "On lit l'axe de gauche, en rouge, gradué en °C",
      explication: "Les températures se lisent à gauche, en °C. Les précipitations à droite, en mm.", source: P(1) },
    { id: "methode-ombrothermique-q20", fiche: "methode-ombrothermique-f5", type: "qcm", niveau: 2,
      enonce: "Comment place-t-on la température d'un mois sur le diagramme ?",
      choix: ["Par une croix en face du mois, à la hauteur de sa température", "Par un bâton bleu", "Par une flèche vers l'axe de droite", "Par une couleur dans le titre"],
      reponse: "Par une croix en face du mois, à la hauteur de sa température",
      explication: "On repère chaque température par une croix au-dessus de son mois. On relie ensuite les croix.", source: P(5) }
  ],
  bonus: [
    { id: "methode-ombrothermique-b1", fiche: "methode-ombrothermique-f4", titre: "Le mois sec de Gaussen",
      texte: "Ce diagramme a été mis au point au milieu du XXe siècle par le botaniste français Henri Gaussen, avec F. Bagnouls. Grâce à la règle « 2 × », un mois est dit sec quand la courbe des températures passe au-dessus du bâton des pluies.",
      source: { titre: "Diagramme ombrothermique", editeur: "Wikipédia, l'encyclopédie libre", url: "https://fr.wikipedia.org/wiki/Diagramme_ombrothermique" } }
  ],
  nonCouvert: []
};
