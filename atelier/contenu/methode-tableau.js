// Source en clair du savoir-faire « tableau à double entrée » (rattaché aux SVT).
const S = { fichier: "methodes/Fiche methode - Tableau a double entree.pdf", page: 1 };

module.exports = {
  id: "methode-tableau",
  matiere: "svt",
  titre: "Savoir-faire : le tableau à double entrée",
  fiches: [
    {
      id: "methode-tableau-f1", notion: "À quoi sert un tableau à double entrée",
      titre: "Classer selon deux critères",
      texte: "On fait un tableau à double entrée quand des données dépendent d'au moins deux critères, chacun découpé en catégories. Un critère est rangé en lignes (les rangs), l'autre en colonnes.",
      pointsCles: ["Au moins deux critères", "Un critère en rangs, l'autre en colonnes"],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "critère", def: "ce qui sert à trier les données, par exemple la taille ou l'ingrédient" },
        { mot: "rang", def: "une ligne horizontale du tableau" },
        { mot: "colonne", def: "une bande verticale du tableau" }
      ],
      schema: "methode-tableau-s1", prerequis: [], source: S
    },
    {
      id: "methode-tableau-f2", notion: "Lire une case",
      titre: "Le croisement d'un rang et d'une colonne",
      texte: "Chaque case se trouve au croisement d'un rang et d'une colonne : elle contient la donnée qui correspond aux deux à la fois. Une case peut contenir plusieurs lignes d'écriture.",
      pointsCles: ["Case = croisement d'un rang et d'une colonne", "Une case peut avoir plusieurs lignes"],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [{ mot: "case", def: "le petit rectangle au croisement d'un rang et d'une colonne" }],
      schema: "methode-tableau-s1", prerequis: ["methode-tableau-f1"], source: S
    },
    {
      id: "methode-tableau-f3", notion: "Les deux entrées",
      titre: "Entrée 1 et entrée 2",
      texte: "Les deux critères s'appellent les entrées. L'une se lit dans la première colonne, en tête de chaque rang ; l'autre se lit dans la première ligne, en tête de chaque colonne. Chaque valeur d'une entrée forme une catégorie.",
      pointsCles: ["Une entrée = un critère", "Chaque valeur d'une entrée = une catégorie"],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "entrée", def: "l'un des deux critères qui organisent le tableau" },
        { mot: "catégorie", def: "un groupe de données qui ont la même valeur pour un critère" }
      ],
      schema: "methode-tableau-s1", prerequis: ["methode-tableau-f1"], source: S
    }
  ],
  schemas: [
    {
      id: "methode-tableau-s1", legende: "Un tableau à double entrée : l'entrée 1 en tête des rangs, l'entrée 2 en tête des colonnes.",
      svg: "<svg viewBox='0 0 520 220' xmlns='http://www.w3.org/2000/svg' font-family='Georgia,serif' font-size='13' fill='#2e2419'>" +
        "<rect x='120' y='40' width='380' height='160' fill='#fbf6ea' stroke='#2e2419' stroke-width='2'/>" +
        "<rect x='120' y='40' width='380' height='32' fill='#b08d3a' opacity='.45'/>" +
        "<rect x='120' y='40' width='95' height='160' fill='#4f6b32' opacity='.25'/>" +
        "<g stroke='#2e2419'><line x1='215' y1='40' x2='215' y2='200'/><line x1='310' y1='40' x2='310' y2='200'/><line x1='405' y1='40' x2='405' y2='200'/>" +
        "<line x1='120' y1='72' x2='500' y2='72'/><line x1='120' y1='115' x2='500' y2='115'/><line x1='120' y1='158' x2='500' y2='158'/></g>" +
        "<g text-anchor='middle'><text x='262' y='61'>colonne A</text><text x='357' y='61'>colonne B</text><text x='452' y='61'>colonne C</text>" +
        "<text x='167' y='98'>rang 1</text><text x='167' y='141'>rang 2</text><text x='167' y='184'>rang 3</text></g>" +
        "<rect x='310' y='115' width='95' height='43' fill='none' stroke='#9a4a32' stroke-width='3'/>" +
        "<text x='357' y='141' text-anchor='middle' fill='#9a4a32'>case B2</text>" +
        "<text x='310' y='24' text-anchor='middle'>entrée 2 (en tête des colonnes)</text>" +
        "<text x='10' y='140' >entrée 1</text><text x='10' y='156'>(en tête</text><text x='10' y='172'>des rangs)</text>" +
        "</svg>"
    }
  ],
  questions: [
    // f1
    { id: "methode-tableau-q1", fiche: "methode-tableau-f1", type: "qcm", niveau: 1,
      enonce: "Quand fait-on un tableau à double entrée ?",
      choix: ["Quand les données dépendent d'au moins deux critères", "Quand on n'a qu'une seule donnée", "Quand on veut raconter une histoire", "Quand on veut dessiner une carte"],
      reponse: "Quand les données dépendent d'au moins deux critères",
      explication: "Double entrée, deux critères : l'un en rangs, l'autre en colonnes.", source: S },
    { id: "methode-tableau-q2", fiche: "methode-tableau-f1", type: "vrai_faux", niveau: 1,
      enonce: "Dans un tableau à double entrée, les deux critères sont rangés en colonnes.",
      corrections: ["Faux : un critère est rangé en lignes (les rangs), l'autre en colonnes.", "Faux : les deux critères sont rangés en lignes.", "Faux : il n'y a qu'un seul critère."],
      reponse: { vrai: false, correction: "Faux : un critère est rangé en lignes (les rangs), l'autre en colonnes." },
      explication: "C'est ce qui fait la double entrée : un critère par direction.", source: S },
    { id: "methode-tableau-q3", fiche: "methode-tableau-f1", type: "qcm", niveau: 2,
      enonce: "Pourquoi un tableau à double entrée est-il pratique pour classer des données ?",
      choix: ["Parce qu'on retrouve chaque donnée grâce à ses deux critères", "Parce qu'il évite d'écrire les données", "Parce qu'il range tout dans une seule case", "Parce qu'il remplace un graphique dans tous les cas"],
      reponse: "Parce qu'on retrouve chaque donnée grâce à ses deux critères",
      explication: "Chaque donnée a sa case, repérée par son rang et sa colonne. On la retrouve d'un coup d'œil.", source: S },
    { id: "methode-tableau-q4", fiche: "methode-tableau-f1", type: "qcm", niveau: 1,
      enonce: "Comment appelle-t-on les lignes horizontales d'un tableau à double entrée ?",
      choix: ["Les rangs", "Les axes", "Les échelles", "Les légendes"],
      reponse: "Les rangs",
      explication: "Les lignes horizontales sont les rangs. Les bandes verticales sont les colonnes.", source: S },
    // f2
    { id: "methode-tableau-q5", fiche: "methode-tableau-f2", type: "qcm", niveau: 2,
      enonce: "Un tableau range les ventes d'un marché : les jours en rangs (lundi, mardi), les fruits en colonnes (pommes, poires). Où lis-tu les poires vendues mardi ?",
      choix: ["Au croisement du rang « mardi » et de la colonne « poires »", "Dans la première case du tableau", "En bas de la colonne « pommes »", "Dans le titre du tableau"],
      reponse: "Au croisement du rang « mardi » et de la colonne « poires »",
      explication: "Une donnée se lit au croisement de son rang et de sa colonne.", indice: "Suis le rang du jour, puis descends la colonne du fruit.", source: S },
    { id: "methode-tableau-q6", fiche: "methode-tableau-f2", type: "vrai_faux", niveau: 1,
      enonce: "Une case d'un tableau à double entrée ne peut contenir qu'une seule ligne d'écriture.",
      corrections: ["Faux : une case peut contenir plusieurs lignes d'écriture.", "Faux : une case doit rester vide.", "Faux : une case contient toujours un nombre."],
      reponse: { vrai: false, correction: "Faux : une case peut contenir plusieurs lignes d'écriture." },
      explication: "Une case peut accueillir plusieurs lignes si la donnée le demande.", source: S },
    { id: "methode-tableau-q7", fiche: "methode-tableau-f2", type: "qcm", niveau: 2,
      enonce: "Comment trouver la bonne case pour ranger une donnée ?",
      choix: ["On cherche son rang, puis sa colonne : la case est à leur croisement", "On la met dans la dernière case libre", "On l'écrit sous le tableau", "On choisit une case au hasard"],
      reponse: "On cherche son rang, puis sa colonne : la case est à leur croisement",
      explication: "Chaque donnée correspond à une valeur de chaque critère. Leur croisement donne sa case.", source: S },
    // f3
    { id: "methode-tableau-q8", fiche: "methode-tableau-f3", type: "qcm", niveau: 1,
      enonce: "Dans un tableau à double entrée, comment appelle-t-on chacun des deux critères ?",
      choix: ["Une entrée", "Une sortie", "Une échelle", "Un axe du temps"],
      reponse: "Une entrée",
      explication: "Les deux critères sont l'entrée 1 et l'entrée 2. D'où le nom « double entrée ».", source: S },
    { id: "methode-tableau-q9", fiche: "methode-tableau-f3", type: "vrai_faux", niveau: 1,
      enonce: "Chaque valeur d'une entrée forme une catégorie.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : chaque titre de rang ou de colonne est une catégorie.", source: S },
    { id: "methode-tableau-q10", fiche: "methode-tableau-f3", type: "association", niveau: 2,
      enonce: "Relie chaque mot à sa place dans le tableau à double entrée.",
      gauche: ["Entrée 1", "Entrée 2", "Case", "Catégorie"],
      droite: ["Croisement d'un rang et d'une colonne", "Lue en tête des rangs", "Une valeur d'une entrée", "Lue en tête des colonnes"],
      reponse: [[0, 1], [1, 3], [2, 0], [3, 2]],
      explication: "Une entrée en tête des rangs, l'autre en tête des colonnes. Les cases sont aux croisements.", source: S }
  ],
  bonus: [],
  nonCouvert: []
};
