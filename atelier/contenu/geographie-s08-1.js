// Source en clair du cours geographie-s08-1 « Outil 9 – Mesurer la pauvreté et les inégalités ».
// Compilé (réponses brouillées) par node atelier/outils/compiler-cours.js geographie-s08-1.
// Seule source : le cours 2 du thème 1 (texte lu sur le Drive, 8 pages ; le PDF n'est pas encore déposé dans
// DEPOT/, les pages citées sont celles des repères « === page n === » de l'extraction) : partie I.B « Comment
// mesurer la richesse et la pauvreté ? » (page 2, qui renvoie à la capsule n° 9), vocabulaire à retenir et
// document sur la mortalité infantile (page 5), cartes de l'IDH et de l'espérance de vie, témoignage du
// dispensaire de Madagascar (page 6). La fiche et la capsule de l'outil 9 lui-même ne sont pas déposées.
const F = "cours/geographie/Geo 5e - Theme 1 - Cours 2.pdf";
const P = (page) => ({ fichier: F, page: page });

// Schéma redessiné : les trois critères de l'IDH et sa note de 0 à 1.
function schemaIDH() {
  const encre = "#2e2419";
  let s = "<svg viewBox='0 0 520 250' xmlns='http://www.w3.org/2000/svg' font-family='Georgia,serif' font-size='13'>";
  s += "<text x='260' y='24' text-anchor='middle' font-size='15' fill='" + encre + "'>L'IDH : trois critères, une note de 0 à 1</text>";
  const boites = [["Richesse", "revenu par habitant", "#c8742a"], ["Santé", "espérance de vie", "#b5452f"], ["Éducation", "niveau d'instruction", "#2f5e8e"]];
  boites.forEach((b, i) => {
    const x = 30 + 165 * i;
    s += "<rect x='" + x + "' y='44' width='150' height='62' rx='8' fill='" + b[2] + "'/>";
    s += "<text x='" + (x + 75) + "' y='70' text-anchor='middle' font-weight='bold' fill='#fff'>" + b[0] + "</text>";
    s += "<text x='" + (x + 75) + "' y='92' text-anchor='middle' font-size='11' fill='#fff'>" + b[1] + "</text>";
    s += "<line x1='" + (x + 75) + "' y1='106' x2='260' y2='150' stroke='" + encre + "' stroke-width='1.5'/>";
  });
  s += "<rect x='200' y='150' width='120' height='34' rx='6' fill='#e9d8b4' stroke='#8a6d3b'/>";
  s += "<text x='260' y='173' text-anchor='middle' font-weight='bold' fill='" + encre + "'>IDH</text>";
  s += "<line x1='60' y1='222' x2='460' y2='222' stroke='" + encre + "' stroke-width='3'/>";
  s += "<text x='60' y='243' text-anchor='middle' fill='" + encre + "'>0 : peu développé</text>";
  s += "<text x='460' y='243' text-anchor='middle' fill='" + encre + "'>1 : très développé</text>";
  s += "<path d='M260 184l0 30' stroke='" + encre + "' stroke-dasharray='3 2'/>";
  return s + "</svg>";
}

module.exports = {
  id: "geographie-s08-1",
  fiches: [
    {
      id: "geographie-s08-1-f1", notion: "Le PIB : mesurer la richesse d'un pays",
      titre: "Le PIB, la richesse produite en un an",
      texte: "Pour mesurer richesse et pauvreté, les géographes utilisent d'abord le PIB (Produit Intérieur Brut) : la richesse qu'un pays produit en une année. Divisé par le nombre d'habitants, il donne le PIB par habitant, une moyenne. Plus elle est élevée, plus le pays crée de richesses.",
      pointsCles: [
        "PIB (Produit Intérieur Brut) : la richesse produite par un pays en une année",
        "PIB par habitant = PIB divisé par le nombre d'habitants : une moyenne",
        "Plus le PIB par habitant est élevé, plus le pays crée de richesses",
        "Carte de 2017 : de 1 000 à plus de 35 000 dollars par habitant selon les pays"
      ],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "PIB", def: "le Produit Intérieur Brut : toute la richesse qu'un pays produit en une année" }
      ],
      schema: null, prerequis: ["geographie-s02-1-f4", "geographie-s07-1-f5"], source: P(2)
    },
    {
      id: "geographie-s08-1-f2", notion: "L'IDH : mesurer le développement",
      titre: "L'IDH, une note de 0 à 1",
      texte: "Le PIB ne dit pas tout. Pour juger le développement d'un pays, on calcule l'IDH, l'indice de développement humain. Il combine trois éléments : la richesse (le revenu par habitant), la santé (l'espérance de vie) et l'éducation. Il va de 0 à 1 : plus la note d'un pays est proche de 1, plus ce pays est riche et développé.",
      pointsCles: [
        "IDH : indice de développement humain",
        "Trois critères : richesse (revenu par habitant), santé (espérance de vie), éducation",
        "Note de 0 (peu développé) à 1 (très développé)",
        "Plus précis que le PIB, qui ne mesure que la richesse"
      ],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "IDH", def: "l'indice de développement humain : une note de 0 à 1 qui combine richesse, santé et éducation pour mesurer le développement d'un pays" }
      ],
      schema: "geographie-s08-1-s1", prerequis: ["geographie-s08-1-f1", "geographie-s07-1-f5"], source: P(2)
    },
    {
      id: "geographie-s08-1-f3", notion: "Lire la carte de l'IDH",
      titre: "Pays développés, pays en développement",
      texte: "La carte de l'IDH range les pays en quatre groupes. Au-dessus de 0,80, l'IDH est très élevé ; entre 0,70 et 0,80, élevé ; entre 0,55 et 0,70, moyen ; sous 0,55, faible. Une ligne sépare pays développés et pays en développement. Parmi ceux-ci, les pays émergents s'enrichissent vite ; les PMA restent les plus pauvres du monde.",
      pointsCles: [
        "Très élevé au-dessus de 0,80 ; élevé entre 0,70 et 0,80 ; moyen entre 0,55 et 0,70 ; faible sous 0,55",
        "Une limite sépare les pays développés des pays en développement",
        "Pays émergents : pays du Sud qui s'enrichissent vite",
        "PMA (pays les moins avancés) : les plus pauvres de la planète"
      ],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "pays émergent", def: "un pays du Sud où les conditions de vie s'améliorent et où l'économie grandit vite" },
        { mot: "PMA", def: "les Pays les Moins Avancés : les États les plus pauvres du monde" }
      ],
      schema: null, prerequis: ["geographie-s08-1-f2", "geographie-s01-2-f3"], source: P(2)
    },
    {
      id: "geographie-s08-1-f4", notion: "Espérance de vie et mortalité infantile",
      titre: "Deux indicateurs de santé",
      texte: "L'espérance de vie est la durée de vie moyenne d'une personne. Le taux de mortalité infantile compte les enfants morts avant l'âge d'un an, pour mille naissances. En 2019, il était très bas au Japon (2) et en France (3), plus haut en Chine (20), en Algérie (29) et en Afghanistan (48), et le plus élevé en République centrafricaine.",
      pointsCles: [
        "Espérance de vie : la durée de vie moyenne d'une personne",
        "Taux de mortalité infantile : les enfants morts avant un an, pour mille naissances",
        "2019 : Japon 2 ‰, France 3 ‰, Chine 20 ‰, Algérie 29 ‰, Afghanistan 48 ‰ ; République centrafricaine la plus touchée",
        "L'espérance de vie est l'un des trois critères de l'IDH"
      ],
      dates: [], lieux: ["Japon", "France", "Chine", "Algérie", "Afghanistan", "République centrafricaine"], personnages: [],
      vocabulaire: [
        { mot: "taux de mortalité infantile", def: "le nombre d'enfants morts avant l'âge d'un an, pour mille naissances" }
      ],
      schema: null, prerequis: ["geographie-s08-1-f2", "geographie-s02-1-f4"], source: P(5)
    },
    {
      id: "geographie-s08-1-f5", notion: "L'accès aux soins dans un pays pauvre : un dispensaire de brousse",
      titre: "Un dispensaire de brousse à Madagascar",
      texte: "Une infirmière raconte sa mission à Madagascar, dans un village de 4 000 habitants. Le dispensaire, un petit centre de santé, a un médecin, une sage-femme et une employée qui fait office d'infirmière, mais ni électricité ni eau courante. Les vaccins sont gardés dans un réfrigérateur au pétrole. Les malades sont examinés sur une planche de bois, parfois par terre.",
      pointsCles: [
        "Dispensaire : un petit établissement médical dans un pays pauvre",
        "À Tsaharasina (Madagascar) : un médecin, une sage-femme, une employée qui fait office d'infirmière",
        "Ni électricité ni eau courante ; vaccins dans un réfrigérateur au pétrole",
        "Malades examinés sur une planche de bois ou par terre"
      ],
      dates: [], lieux: ["Madagascar", "Tsaharasina"], personnages: [],
      vocabulaire: [
        { mot: "dispensaire", def: "un petit établissement médical, dans les pays pauvres" }
      ],
      schema: null, prerequis: ["geographie-s07-1-f2"], source: P(6)
    }
  ],
  schemas: [
    { id: "geographie-s08-1-s1", legende: "L'IDH combine trois critères et donne une note de 0 à 1 (schéma redessiné d'après le cours).", svg: schemaIDH() }
  ],
  questions: [
    // f1 : le PIB
    { id: "geographie-s08-1-q1", fiche: "geographie-s08-1-f1", type: "qcm", niveau: 1,
      enonce: "Que mesure le PIB ?",
      choix: ["La richesse produite par un pays en une année", "Le nombre d'habitants d'un pays", "La durée de vie moyenne des habitants", "Le nombre d'enfants par femme"],
      reponse: "La richesse produite par un pays en une année",
      explication: "Le PIB additionne toute la richesse produite par un pays en un an. La durée de vie, c'est l'espérance de vie.", source: P(2) },
    { id: "geographie-s08-1-q2", fiche: "geographie-s08-1-f1", type: "qcm", niveau: 1,
      enonce: "Que signifie le sigle PIB ?",
      choix: ["Produit Intérieur Brut", "Produit International Brut", "Part des Importations Brutes", "Production Industrielle de Base"],
      reponse: "Produit Intérieur Brut",
      explication: "PIB veut dire Produit Intérieur Brut. « Intérieur » parce qu'il compte ce qui est produit à l'intérieur du pays.", source: P(2) },
    { id: "geographie-s08-1-q3", fiche: "geographie-s08-1-f1", type: "qcm", niveau: 2,
      enonce: "Comment obtient-on le PIB par habitant ?",
      choix: ["En divisant le PIB par le nombre d'habitants", "En multipliant le PIB par le nombre d'habitants", "En additionnant les salaires des habitants", "En comptant les habitants qui ont un emploi"],
      reponse: "En divisant le PIB par le nombre d'habitants",
      explication: "On divise la richesse produite par le nombre d'habitants. On obtient une moyenne par personne.", source: P(2) },
    { id: "geographie-s08-1-q4", fiche: "geographie-s08-1-f1", type: "vrai_faux", niveau: 1,
      enonce: "Plus le PIB par habitant d'un pays est élevé, plus ce pays crée de richesses.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : un PIB par habitant élevé signale un pays créateur de richesses. C'est le premier outil des géographes pour comparer les pays.", source: P(2) },
    { id: "geographie-s08-1-q5", fiche: "geographie-s08-1-f1", type: "vrai_faux", niveau: 2,
      enonce: "Le PIB par habitant indique exactement ce que gagne chaque habitant du pays.",
      corrections: ["Faux : c'est une moyenne pour tout le pays, pas le revenu de chaque personne.", "Faux : le PIB par habitant mesure l'espérance de vie.", "Faux : le PIB par habitant compte les habitants, pas les richesses."],
      reponse: { vrai: false, correction: "Faux : c'est une moyenne pour tout le pays, pas le revenu de chaque personne." },
      explication: "Le PIB par habitant est une moyenne. Dans un même pays, certains gagnent beaucoup plus et d'autres beaucoup moins.", source: P(2) },
    { id: "geographie-s08-1-q6", fiche: "geographie-s08-1-f1", type: "qcm", niveau: 3,
      enonce: "Deux pays produisent la même richesse en une année, mais l'un a deux fois plus d'habitants que l'autre. Lequel a le PIB par habitant le plus élevé ?",
      choix: ["Le pays le moins peuplé", "Le pays le plus peuplé", "Les deux ont le même", "On ne peut pas le savoir"],
      reponse: "Le pays le moins peuplé",
      explication: "La même richesse partagée entre moins d'habitants donne une part plus grande à chacun. Le pays le moins peuplé a donc le PIB par habitant le plus élevé.", indice: "Le PIB par habitant, c'est une division.", source: P(2) },
    { id: "geographie-s08-1-q7", fiche: "geographie-s08-1-f1", type: "trou", niveau: 1,
      enonce: "Complète avec les mots du cours.",
      texte: "Le ___ est la richesse produite par un pays en une ___. Divisé par le nombre d'habitants, il donne une moyenne : le PIB par ___.",
      banque: ["PIB", "année", "habitant", "IDH", "semaine"],
      reponse: [["PIB", "pib"], ["année", "annee", "an"], ["habitant"]],
      explication: "Le PIB se calcule sur une année. Divisé par le nombre d'habitants, il donne le PIB par habitant.", source: P(2) },
    { id: "geographie-s08-1-q8", fiche: "geographie-s08-1-f1", type: "qcm", niveau: 3,
      enonce: "Pourquoi compare-t-on les pays avec le PIB par habitant plutôt qu'avec le PIB total ?",
      choix: ["Parce qu'un pays très peuplé produit forcément plus : la moyenne par habitant permet de comparer", "Parce que le PIB total est tenu secret", "Parce que le PIB par habitant mesure aussi l'éducation", "Parce que le PIB total ne se calcule que pour les pays du Nord, les pays du Sud n'ayant pas de statistiques"],
      reponse: "Parce qu'un pays très peuplé produit forcément plus : la moyenne par habitant permet de comparer",
      explication: "Un grand pays produit plus qu'un petit sans être plus riche par personne. Ramener la richesse à chaque habitant permet une vraie comparaison.", source: P(2) },

    // f2 : l'IDH
    { id: "geographie-s08-1-q9", fiche: "geographie-s08-1-f2", type: "qcm_multiple", niveau: 2,
      enonce: "Quels sont les trois éléments pris en compte par l'IDH ? (plusieurs réponses)",
      choix: ["Le revenu par habitant", "L'espérance de vie", "Le niveau d'éducation", "Le nombre d'habitants", "La superficie du pays", "Le climat"],
      reponse: ["Le revenu par habitant", "L'espérance de vie", "Le niveau d'éducation"],
      explication: "Richesse, santé et éducation : voilà les trois critères de l'IDH. Le nombre d'habitants, la superficie et le climat n'en font pas partie.", source: P(2) },
    { id: "geographie-s08-1-q10", fiche: "geographie-s08-1-f2", type: "qcm", niveau: 1,
      enonce: "Entre quelles valeurs varie l'IDH ?",
      choix: ["De 0 à 1", "De 0 à 100", "De 1 à 10", "De 0 à 1 000"],
      reponse: "De 0 à 1",
      explication: "L'IDH est une note entre 0 et 1. Plus elle est proche de 1, plus le pays est développé.", source: P(2) },
    { id: "geographie-s08-1-q11", fiche: "geographie-s08-1-f2", type: "vrai_faux", niveau: 1,
      enonce: "Plus l'IDH d'un pays est proche de 1, plus ce pays est développé.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : 1 est la meilleure note possible. Un IDH proche de 0 signale au contraire un pays peu développé.", source: P(2) },
    { id: "geographie-s08-1-q12", fiche: "geographie-s08-1-f2", type: "vrai_faux", niveau: 2,
      enonce: "L'IDH ne tient compte que de la richesse d'un pays.",
      corrections: ["Faux : il combine la richesse, la santé (espérance de vie) et l'éducation.", "Faux : il ne tient compte que de l'espérance de vie.", "Faux : il ne tient compte que du nombre d'habitants."],
      reponse: { vrai: false, correction: "Faux : il combine la richesse, la santé (espérance de vie) et l'éducation." },
      explication: "C'est le PIB qui ne mesure que la richesse. L'IDH y ajoute la santé et l'éducation.", source: P(2) },
    { id: "geographie-s08-1-q13", fiche: "geographie-s08-1-f2", type: "qcm", niveau: 3,
      enonce: "Pourquoi l'IDH mesure-t-il mieux le développement que le PIB ?",
      choix: ["Parce qu'il tient compte aussi de la santé et de l'éducation, pas seulement du revenu", "Parce qu'il compte le nombre d'habitants, ce qui permet de classer les pays du plus peuplé au moins peuplé", "Parce qu'il se calcule chaque mois", "Parce qu'il est exprimé en dollars"],
      reponse: "Parce qu'il tient compte aussi de la santé et de l'éducation, pas seulement du revenu",
      explication: "Le développement, ce n'est pas que de l'argent. L'IDH regarde aussi si l'on vit longtemps et si l'on est instruit.", source: P(2) },
    { id: "geographie-s08-1-q14", fiche: "geographie-s08-1-f2", type: "qcm", niveau: 3,
      enonce: "Un pays a un IDH de 0,45 et un autre de 0,92. Que peut-on dire ?",
      choix: ["Le second est bien plus développé que le premier", "Le premier est bien plus développé que le second", "Ils ont à peu près le même développement", "Le premier est plus peuplé"],
      reponse: "Le second est bien plus développé que le premier",
      explication: "0,92 est proche de 1, la meilleure note ; 0,45 est en dessous de 0,55, un IDH faible. L'IDH ne dit rien du nombre d'habitants.", source: P(2) },
    { id: "geographie-s08-1-q15", fiche: "geographie-s08-1-f2", type: "association", niveau: 2,
      enonce: "Relie chaque indicateur à ce qu'il mesure.",
      gauche: ["PIB", "IDH", "Espérance de vie", "Taux de mortalité infantile"],
      droite: ["Durée de vie moyenne d'une personne", "Richesse produite par un pays en une année", "Nombre d'enfants morts avant un an, pour mille naissances", "Niveau de développement d'un pays, de 0 à 1"],
      reponse: [[0, 1], [1, 3], [2, 0], [3, 2]],
      explication: "Le PIB mesure la richesse, l'IDH le développement. L'espérance de vie et la mortalité infantile sont des indicateurs de santé.", source: P(5) },
    { id: "geographie-s08-1-q16", fiche: "geographie-s08-1-f2", type: "qcm", niveau: 1,
      enonce: "Que signifie le sigle IDH ?",
      choix: ["Indice de développement humain", "Indice des dépenses des habitants", "Indicateur de la démographie humaine", "Indice de la dette des habitants"],
      reponse: "Indice de développement humain",
      explication: "IDH veut dire indice de développement humain. Il note le développement d'un pays de 0 à 1.", source: P(2) },
    { id: "geographie-s08-1-q17", fiche: "geographie-s08-1-f2", type: "trou", niveau: 3,
      enonce: "Complète sans aide : les trois critères de l'IDH.",
      texte: "L'IDH combine trois critères : le ___ par habitant, l'___ de vie et le niveau d'___.",
      reponse: [["revenu", "richesse"], ["espérance", "esperance"], ["éducation", "education", "instruction"]],
      explication: "Richesse (revenu par habitant), santé (espérance de vie) et éducation : ce sont les trois critères. Chacun compte dans la note.", source: P(2) },

    // f3 : lire la carte de l'IDH
    { id: "geographie-s08-1-q18", fiche: "geographie-s08-1-f3", type: "qcm", niveau: 1,
      enonce: "À partir de quelle valeur l'IDH est-il dit « très élevé » ?",
      choix: ["Plus de 0,80", "Plus de 0,55", "Plus de 0,70", "Plus de 0,50"],
      reponse: "Plus de 0,80",
      explication: "Au-dessus de 0,80, l'IDH est très élevé. Entre 0,70 et 0,80, il est seulement élevé.", source: P(2) },
    { id: "geographie-s08-1-q19", fiche: "geographie-s08-1-f3", type: "ordre", niveau: 2,
      enonce: "Range ces groupes d'IDH du plus faible au plus élevé.",
      elements: ["Élevé (0,70 à 0,80)", "Faible (moins de 0,55)", "Très élevé (plus de 0,80)", "Moyen (0,55 à 0,70)"],
      reponse: [1, 3, 0, 2],
      explication: "Faible, puis moyen, puis élevé, puis très élevé. Les seuils sont 0,55, 0,70 et 0,80.", source: P(2) },
    { id: "geographie-s08-1-q20", fiche: "geographie-s08-1-f3", type: "vrai_faux", niveau: 3,
      enonce: "Un pays dont l'IDH est de 0,60 fait partie des pays à IDH moyen.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : l'IDH moyen va de 0,55 à 0,70. 0,60 est bien dans cette tranche.", source: P(2) },
    { id: "geographie-s08-1-q21", fiche: "geographie-s08-1-f3", type: "vrai_faux", niveau: 2,
      enonce: "Les PMA sont les pays les plus riches du monde.",
      corrections: ["Faux : PMA veut dire Pays les Moins Avancés : ce sont les plus pauvres.", "Faux : les PMA sont les pays émergents.", "Faux : les PMA sont les pays pétroliers."],
      reponse: { vrai: false, correction: "Faux : PMA veut dire Pays les Moins Avancés : ce sont les plus pauvres." },
      explication: "Les PMA sont les États les plus pauvres du monde. Les pays émergents, eux, s'enrichissent vite.", source: P(5) },
    { id: "geographie-s08-1-q22", fiche: "geographie-s08-1-f3", type: "qcm", niveau: 2,
      enonce: "Que sépare la ligne tracée sur la carte de l'IDH ?",
      choix: ["Les pays développés des pays en développement", "L'hémisphère Nord de l'hémisphère Sud", "Les pays peuplés des pays peu peuplés", "Les continents entre eux"],
      reponse: "Les pays développés des pays en développement",
      explication: "La limite partage le monde entre pays développés et pays en développement. Elle ne suit ni l'équateur ni les continents.", source: P(2) },
    { id: "geographie-s08-1-q23", fiche: "geographie-s08-1-f3", type: "qcm", niveau: 3,
      enonce: "Un pays a un IDH de 0,52. Dans quel groupe de la carte se trouve-t-il, et que peut-on en déduire ?",
      choix: ["IDH faible : c'est un pays en développement, peut-être un PMA", "IDH moyen : c'est un pays émergent, dont les conditions de vie s'améliorent vite", "IDH élevé : c'est un pays développé", "IDH très élevé : c'est un pays du Nord"],
      reponse: "IDH faible : c'est un pays en développement, peut-être un PMA",
      explication: "0,52 est sous 0,55 : IDH faible. Un tel pays est en développement, et peut faire partie des PMA.", indice: "Le seuil de l'IDH faible est 0,55.", source: P(2) },
    { id: "geographie-s08-1-q24", fiche: "geographie-s08-1-f3", type: "qcm", niveau: 2,
      enonce: "Comment appelle-t-on les pays du Sud dont les conditions de vie s'améliorent et dont l'économie grandit vite ?",
      choix: ["Les pays émergents", "Les PMA", "Les pays développés", "Les pays pétroliers"],
      reponse: "Les pays émergents",
      explication: "Les pays émergents sont des pays du Sud en pleine croissance. Les PMA, au contraire, restent les plus pauvres.", source: P(5) },
    { id: "geographie-s08-1-q25", fiche: "geographie-s08-1-f3", type: "trou", niveau: 1,
      enonce: "Complète avec les mots de la carte.",
      texte: "Un IDH supérieur à 0,80 est ___ ; un IDH inférieur à 0,55 est ___ ; les pays les plus pauvres sont les ___.",
      banque: ["très élevé", "faible", "PMA", "moyen", "émergents"],
      reponse: [["très élevé", "tres eleve"], ["faible"], ["PMA", "pma"]],
      explication: "Plus de 0,80 : très élevé ; moins de 0,55 : faible. Les pays les plus pauvres sont les PMA.", source: P(2) },

    // f4 : espérance de vie et mortalité infantile
    { id: "geographie-s08-1-q26", fiche: "geographie-s08-1-f4", type: "qcm", niveau: 1,
      enonce: "Qu'est-ce que l'espérance de vie ?",
      choix: ["La durée de vie moyenne d'une personne", "L'âge de la retraite", "Le nombre d'années d'école", "L'âge du plus vieil habitant"],
      reponse: "La durée de vie moyenne d'une personne",
      explication: "L'espérance de vie est la durée de vie moyenne. Elle est plus longue dans les pays développés.", source: P(5) },
    { id: "geographie-s08-1-q27", fiche: "geographie-s08-1-f4", type: "qcm", niveau: 2,
      enonce: "Que compte le taux de mortalité infantile ?",
      choix: ["Les enfants morts avant l'âge d'un an", "Les enfants qui ne vont pas à l'école", "Les enfants nés dans l'année", "Les enfants de moins de cinq ans"],
      reponse: "Les enfants morts avant l'âge d'un an",
      explication: "Il compte les enfants morts avant un an, pour mille naissances. Les naissances, c'est le taux de natalité.", source: P(5) },
    { id: "geographie-s08-1-q28", fiche: "geographie-s08-1-f4", type: "vrai_faux", niveau: 2,
      enonce: "En 2019, le Japon et la France avaient des taux de mortalité infantile très faibles, de 2 et 3 pour mille naissances.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : 2 pour mille au Japon, 3 en France. Ce sont les plus bas de la série du cours.", source: P(5) },
    { id: "geographie-s08-1-q29", fiche: "geographie-s08-1-f4", type: "vrai_faux", niveau: 3,
      enonce: "Un taux de mortalité infantile élevé est le signe d'un pays développé.",
      corrections: ["Faux : c'est le signe d'un pays peu développé, où les soins manquent.", "Faux : la mortalité infantile ne dépend pas du développement.", "Faux : c'est le signe d'un pays très peuplé."],
      reponse: { vrai: false, correction: "Faux : c'est le signe d'un pays peu développé, où les soins manquent." },
      explication: "Dans les pays développés comme le Japon ou la France, très peu de bébés meurent. Un taux élevé signale un pays peu développé.", source: P(5) },
    { id: "geographie-s08-1-q30", fiche: "geographie-s08-1-f4", type: "qcm", niveau: 2,
      enonce: "Parmi ces pays, lequel avait le taux de mortalité infantile le plus élevé en 2019 ?",
      choix: ["L'Afghanistan", "La France", "Le Japon", "La Chine"],
      reponse: "L'Afghanistan",
      explication: "L'Afghanistan comptait 48 décès pour mille naissances. La Chine en avait 20, la France 3 et le Japon 2.", source: P(5) },
    { id: "geographie-s08-1-q31", fiche: "geographie-s08-1-f4", type: "qcm", niveau: 3,
      enonce: "Dans un pays, 48 bébés sur 1 000 meurent avant un an ; dans un autre, 3 sur 1 000. Lequel est probablement le plus développé ?",
      choix: ["Celui où 3 bébés sur 1 000 meurent avant un an", "Celui où 48 bébés sur 1 000 meurent avant un an", "Les deux sont aussi développés", "Celui qui a le plus d'habitants"],
      reponse: "Celui où 3 bébés sur 1 000 meurent avant un an",
      explication: "Une faible mortalité infantile va avec de bons soins et une bonne alimentation. Le pays à 3 pour mille est probablement le plus développé.", source: P(5) },
    { id: "geographie-s08-1-q32", fiche: "geographie-s08-1-f4", type: "ordre", niveau: 3,
      enonce: "Range ces pays du taux de mortalité infantile le plus faible au plus élevé (2019).",
      elements: ["Afghanistan", "Japon", "Algérie", "Chine"],
      reponse: [1, 3, 2, 0],
      explication: "Japon 2, Chine 20, Algérie 29, Afghanistan 48 pour mille naissances. Plus le pays est développé, plus le taux est bas.", source: P(5) },
    { id: "geographie-s08-1-q33", fiche: "geographie-s08-1-f4", type: "qcm", niveau: 2,
      enonce: "Comment s'exprime le taux de mortalité infantile ?",
      choix: ["En nombre de morts pour mille naissances", "En pourcentage de la population totale du pays", "En années", "En dollars par habitant"],
      reponse: "En nombre de morts pour mille naissances",
      explication: "On compte les enfants morts avant un an pour mille naissances. Les années servent à l'espérance de vie, les dollars au PIB.", source: P(5) },
    { id: "geographie-s08-1-q34", fiche: "geographie-s08-1-f4", type: "qcm_multiple", niveau: 2,
      enonce: "Quels pays avaient un taux de mortalité infantile inférieur à 10 pour mille en 2019 ? (plusieurs réponses)",
      choix: ["Le Japon", "La France", "La Chine", "L'Algérie", "L'Afghanistan"],
      reponse: ["Le Japon", "La France"],
      explication: "Japon 2 et France 3 pour mille : bien en dessous de 10. Chine 20, Algérie 29 et Afghanistan 48 sont au-dessus.", source: P(5) },

    // f5 : le dispensaire de brousse
    { id: "geographie-s08-1-q35", fiche: "geographie-s08-1-f5", type: "qcm", niveau: 1,
      enonce: "Qu'est-ce qu'un dispensaire ?",
      choix: ["Un petit établissement médical dans un pays pauvre", "Une grande école", "Un marché de village", "Un hôpital universitaire"],
      reponse: "Un petit établissement médical dans un pays pauvre",
      explication: "Un dispensaire est un petit centre de santé, typique des pays pauvres. Celui du cours est à Madagascar.", source: P(6) },
    { id: "geographie-s08-1-q36", fiche: "geographie-s08-1-f5", type: "qcm", niveau: 1,
      enonce: "Dans quel pays se trouve le dispensaire de brousse décrit par l'infirmière ?",
      choix: ["À Madagascar", "En Inde", "Au Bénin", "En Finlande"],
      reponse: "À Madagascar",
      explication: "L'infirmière est en mission à Madagascar, dans le village de Tsaharasina. L'Inde et le Bénin sont d'autres exemples du cours.", source: P(6) },
    { id: "geographie-s08-1-q37", fiche: "geographie-s08-1-f5", type: "qcm_multiple", niveau: 2,
      enonce: "Que manque-t-il au dispensaire de Tsaharasina ? (plusieurs réponses)",
      choix: ["L'électricité", "L'eau courante", "Une vraie table d'examen", "Un médecin", "Des vaccins", "Une sage-femme"],
      reponse: ["L'électricité", "L'eau courante", "Une vraie table d'examen"],
      explication: "Il n'y a ni électricité, ni eau courante, et les malades sont examinés sur une planche. Médecin, sage-femme et vaccins, eux, sont là.", source: P(6) },
    { id: "geographie-s08-1-q38", fiche: "geographie-s08-1-f5", type: "vrai_faux", niveau: 2,
      enonce: "Au dispensaire de Tsaharasina, les vaccins sont conservés dans un réfrigérateur qui marche au pétrole, faute d'électricité.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : sans électricité, le réfrigérateur fonctionne au pétrole. C'est le seul moyen de garder les vaccins au froid.", source: P(6) },
    { id: "geographie-s08-1-q39", fiche: "geographie-s08-1-f5", type: "vrai_faux", niveau: 2,
      enonce: "Le dispensaire de Tsaharasina est un hôpital moderne, avec l'électricité et l'eau courante.",
      corrections: ["Faux : il n'a ni électricité ni eau courante, et les malades sont examinés sur une planche.", "Faux : il a l'électricité, mais pas de médecin.", "Faux : il est moderne, mais fermé la plupart du temps."],
      reponse: { vrai: false, correction: "Faux : il n'a ni électricité ni eau courante, et les malades sont examinés sur une planche." },
      explication: "C'est tout le contraire d'un hôpital moderne. Les moyens sont très réduits.", source: P(6) },
    { id: "geographie-s08-1-q40", fiche: "geographie-s08-1-f5", type: "qcm", niveau: 3,
      enonce: "Pourquoi ce témoignage illustre-t-il les inégalités de développement ?",
      choix: ["Parce qu'il montre que l'accès aux soins est bien plus difficile dans un pays pauvre", "Parce qu'il montre que Madagascar est un pays riche", "Parce qu'il parle d'une école", "Parce qu'il montre que les habitants refusent de se soigner, même quand un hôpital moderne existe près de chez eux"],
      reponse: "Parce qu'il montre que l'accès aux soins est bien plus difficile dans un pays pauvre",
      explication: "Se soigner fait partie des ressources immatérielles. Ici, les moyens manquent : c'est une inégalité de développement.", source: P(6) },
    { id: "geographie-s08-1-q41", fiche: "geographie-s08-1-f5", type: "qcm", niveau: 2,
      enonce: "Comment les malades sont-ils examinés dans ce dispensaire ?",
      choix: ["Sur une planche de bois, ou par terre", "Sur un lit d'hôpital, dans une salle bien équipée", "Dans une ambulance", "Debout, dans la rue"],
      reponse: "Sur une planche de bois, ou par terre",
      explication: "Faute de matériel, l'examen se fait sur une planche, parfois par terre. Les accouchements se passent de la même façon.", source: P(6) }
  ],
  bonus: [
    {
      id: "geographie-s08-1-b1",
      fiche: "geographie-s08-1-f2",
      titre: "D'où vient l'IDH ?",
      texte: "L'IDH a été créé en 1990 par le PNUD, le Programme des Nations unies pour le développement. Deux économistes l'ont imaginé : l'Indien Amartya Sen et le Pakistanais Mahbub ul Haq. En 2021, la meilleure note du classement revenait à la Suisse, avec 0,962.",
      source: { titre: "Indice de développement humain", editeur: "Wikipédia, l'encyclopédie libre", url: "https://fr.wikipedia.org/wiki/Indice_de_d%C3%A9veloppement_humain" }
    }
  ],
  nonCouvert: [
    "La fiche et la capsule vidéo de l'outil 9 lui-même ne sont pas déposées : seules les pages 2, 5 et 6 du cours 2 sont utilisées.",
    "Le PDF du cours 2 n'est pas encore déposé dans DEPOT/ : les cartes (PIB par habitant en 2017, IDH, espérance de vie) ne sont connues que par leur légende. Les réponses aux questions de la page 6 (régions à IDH très élevé, pays à IDH élevé ou moyen, continent le moins développé, inégalités en Asie et en Amérique du Sud) ne sont pas reprises.",
    "Les corrigés des exercices des pages 5 et 6, imprimés à l'envers, sont illisibles dans le texte extrait.",
    "La carte de la page 6 range l'IDH avec d'autres seuils (élevé de 0,75 à 0,80, moyen de 0,55 à 0,75) : le jeu retient ceux de la carte de la page 2.",
    "Les valeurs de mortalité infantile de l'Inde, du Congo et de la République centrafricaine sont douteuses dans le texte extrait : seul le rang de la République centrafricaine (le plus élevé) est repris.",
    "Le document 2 de la page 5 (une image) n'est pas décrit."
  ]
};
