// Source en clair du cours geographie-s08-1 « Outil 9 – Mesurer la pauvreté et les inégalités ».
// Compilé (réponses brouillées) par node atelier/outils/compiler-cours.js geographie-s08-1.
// Seule source : le cours 2 du thème 1 (texte lu sur le Drive, 8 pages ; le PDF n'est pas encore déposé dans
// DEPOT/, les pages citées sont celles des repères « === page n === » de l'extraction) : partie I.B « Comment
// mesurer la richesse et la pauvreté ? » (page 2, qui renvoie à la capsule n° 9), vocabulaire à retenir et
// document sur la mortalité infantile (page 5), cartes de l'IDH et de l'espérance de vie, témoignage du
// dispensaire de Madagascar (page 6). La fiche et la capsule de l'outil 9 lui-même ne sont pas déposées.
// Fiche f5 (le dispensaire) : le seul document est un témoignage ; trois questions de thème (règle du 25/10/2026,
// audit du 28/10/2026) portent sur l'accès aux soins dans un pays pauvre, avec une source fiable vérifiée (OMS, Wikipédia).
// Contre-relecture du 28/10/2026 : leurres de q36 et q37 revus (plus de « maladies rares » ni de centres « vides »).
// Fiches de programme (règle du 28/10/2026, sous-thème « Répartition de la richesse et de la pauvreté dans le monde ») :
// f5 réécrite (se soigner dans un pays pauvre : OMS) en gardant son identifiant et ses questions (q35, q39, q40 restent
// sur le témoignage déposé, page 6 ; q36 à q38, q42 et q43 sont des questions de thème) ; f6 nouvelle (l'IDH en chiffres,
// PNUD). Faits relus le 28/10/2026 sur les pages citées. Devoir n° 2 (semaine 11) non déposé : aucune question « définis ».
// Relecture sceptique du 28/10/2026 : faits de f5 (OMS, 19/10/2026) et f6 (PNUD 2021, classement 2023) reconfirmés ;
// q23 ne parle plus de « la carte » ; trois leurres absurdes remplacés (q8, q44, q47).
const F = "cours/geographie/Geo 5e - Theme 1 - Cours 2.pdf";
const P = (page) => ({ fichier: F, page: page });
const THEME = "Outil 9 – Mesurer la pauvreté et les inégalités";
const T = (titre, editeur, url) => ({ theme: THEME, titre: titre, editeur: editeur, url: url });
const PROG = "Répartition de la richesse et de la pauvreté dans le monde";
const PR = (titre, editeur, url) => ({ programme: PROG, titre: titre, editeur: editeur, url: url });
const OMS = "Organisation mondiale de la santé (OMS)";
const U_OMS26 = "https://www.who.int/fr/news/item/19-10-2026-one-in-four-doctors-nearing-retirement-age-as-who-warns-of-global-health-workforce-gap";
const U_MEDECINS = "https://en.wikipedia.org/wiki/List_of_countries_by_number_of_medical_doctors";
const U_IDH = "https://fr.wikipedia.org/wiki/Indice_de_d%C3%A9veloppement_humain";
const U_LISTE_IDH = "https://fr.wikipedia.org/wiki/Liste_des_pays_par_IDH";
const U_ONU_POP = "https://www.un.org/fr/global-issues/population";

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
      id: "geographie-s08-1-f5", notion: "Se soigner dans un pays pauvre",
      titre: "Se soigner quand les médecins manquent",
      texte: "Plus un pays est pauvre, moins il a de soignants. D'après l'OMS, il manquera 11,1 millions d'agents de santé en 2030, et la Région Europe compte treize fois plus de médecins par habitant que la Région Afrique. Dans un dispensaire de brousse, comme celui de Madagascar, un médecin soigne des milliers de personnes, sans électricité ni eau courante.",
      pointsCles: [
        "OMS (2026) : il manquera 11,1 millions d'agents de santé dans le monde en 2030 ; 67 pays n'en auront pas assez",
        "La densité de soignants suit le revenu du pays : treize fois plus de médecins par habitant en Région Europe qu'en Région Afrique, six fois plus d'infirmiers et de sages-femmes",
        "Près d'un médecin sur quatre a plus de 55 ans : les départs à la retraite vont aggraver le manque",
        "Dans le cours : à Tsaharasina (Madagascar), un médecin, une sage-femme et une employée faisant office d'infirmière ; ni électricité ni eau courante ; un réfrigérateur au pétrole pour les vaccins"
      ],
      dates: [], lieux: ["Madagascar", "Tsaharasina"], personnages: [],
      vocabulaire: [
        { mot: "dispensaire", def: "un petit établissement médical, dans les pays pauvres" },
        { mot: "agent de santé", def: "toute personne qui soigne : médecin, infirmier, sage-femme" },
        { mot: "densité de médecins", def: "le nombre de médecins pour 10 000 habitants" }
      ],
      schema: null, prerequis: ["geographie-s07-1-f2", "geographie-s08-1-f4"],
      source: PR("Un médecin sur quatre approche de la retraite : l'OMS alerte sur la pénurie mondiale de personnels de santé (19 octobre 2026)", OMS, U_OMS26)
    },
    {
      id: "geographie-s08-1-f6", notion: "L'IDH en chiffres : le classement du PNUD",
      titre: "Le classement de l'IDH : de 0,385 à 0,962",
      texte: "Chaque rapport du PNUD classe les pays par IDH. En 2021, sur 191 pays, la Suisse est première avec 0,962 et le Soudan du Sud dernier avec 0,385 ; moyenne mondiale : 0,732. L'IDH combine trois notes de 0 à 1 : espérance de vie, années d'école, revenu par habitant. Deux pays aussi riches peuvent avoir des IDH différents.",
      pointsCles: [
        "PNUD (Programme des Nations unies pour le développement) : l'IDH existe depuis 1990, avec un classement à chaque rapport",
        "2021 : Suisse 0,962 (première sur 191 pays), Soudan du Sud 0,385 (dernier), moyenne mondiale 0,732",
        "Trois notes de 0 à 1 combinées en une seule : santé (espérance de vie), éducation (années d'école attendues et moyennes), niveau de vie (revenu par habitant)",
        "Seuils : très élevé à partir de 0,800 ; élevé de 0,700 à 0,799 ; moyen à partir d'environ 0,55 ; faible en dessous",
        "Limite : une moyenne nationale cache les écarts entre les habitants d'un même pays"
      ],
      astuce: "Retiens les deux bouts de l'échelle en 2021 : Suisse 0,962 tout en haut, Soudan du Sud 0,385 tout en bas.",
      dates: [
        { annee: 1990, evenement: "Le PNUD publie le premier indice de développement humain" },
        { annee: 2021, evenement: "IDH : Suisse 0,962, Soudan du Sud 0,385, moyenne mondiale 0,732" }
      ],
      lieux: ["Suisse", "Soudan du Sud"], personnages: ["Amartya Sen", "Mahbub ul Haq"],
      vocabulaire: [
        { mot: "PNUD", def: "le Programme des Nations unies pour le développement, qui calcule et publie l'IDH" },
        { mot: "moyenne nationale", def: "un chiffre pour tout un pays, qui cache les écarts entre ses habitants" }
      ],
      schema: null, prerequis: ["geographie-s08-1-f2", "geographie-s08-1-f3"],
      source: PR("Indice de développement humain", "Wikipédia", U_IDH)
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
      choix: ["Parce qu'un pays très peuplé produit forcément plus : la moyenne par habitant permet de comparer", "Parce que le PIB total ne compte que l'industrie", "Parce que le PIB par habitant mesure aussi l'éducation", "Parce que le PIB total ne se calcule que pour les pays du Nord, les pays du Sud n'ayant pas de statistiques"],
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
      enonce: "Comment appelle-t-on les deux grands groupes de pays que les géographes distinguent sur une carte de l'IDH ?",
      choix: ["Les pays développés et les pays en développement", "Les pays chauds et les pays froids", "Les pays très peuplés et les pays presque vides d'habitants", "Les pays riches et les pays émergents"],
      reponse: "Les pays développés et les pays en développement",
      explication: "Une limite sépare les pays développés des pays en développement. Parmi ces derniers, les pays émergents s'enrichissent vite et les PMA restent les plus pauvres.", source: P(2) },
    { id: "geographie-s08-1-q23", fiche: "geographie-s08-1-f3", type: "qcm", niveau: 3,
      enonce: "Un pays a un IDH de 0,52. Dans quel groupe d'IDH se range-t-il, et que peut-on en déduire ?",
      choix: ["IDH faible : c'est un pays en développement, peut-être un PMA", "IDH moyen : c'est un pays émergent, dont les conditions de vie s'améliorent vite", "IDH élevé : c'est un pays développé", "IDH très élevé : c'est un pays du Nord"],
      reponse: "IDH faible : c'est un pays en développement, peut-être un PMA",
      explication: "0,52 est sous 0,55 : IDH faible. Un tel pays est en développement, et peut faire partie des PMA.", indice: "Le seuil de l'IDH faible est 0,55.", source: P(2) },
    { id: "geographie-s08-1-q24", fiche: "geographie-s08-1-f3", type: "qcm", niveau: 2,
      enonce: "Comment appelle-t-on les pays du Sud dont les conditions de vie s'améliorent et dont l'économie grandit vite ?",
      choix: ["Les pays émergents", "Les PMA", "Les pays développés", "Les pays pétroliers"],
      reponse: "Les pays émergents",
      explication: "Les pays émergents sont des pays du Sud en pleine croissance. Les PMA, au contraire, restent les plus pauvres.", source: P(5) },
    { id: "geographie-s08-1-q25", fiche: "geographie-s08-1-f3", type: "trou", niveau: 1,
      enonce: "Complète avec les mots du cours.",
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

    // f5 : le dispensaire de brousse
    { id: "geographie-s08-1-q35", fiche: "geographie-s08-1-f5", type: "qcm", niveau: 1,
      enonce: "Qu'est-ce qu'un dispensaire ?",
      choix: ["Un petit établissement médical dans un pays pauvre", "Une grande école", "Un marché de village", "Un hôpital universitaire"],
      reponse: "Un petit établissement médical dans un pays pauvre",
      explication: "Un dispensaire est un petit centre de santé, typique des pays pauvres. Celui du cours est à Madagascar.", source: P(6) },
    { id: "geographie-s08-1-q36", fiche: "geographie-s08-1-f5", type: "qcm", niveau: 2,
      enonce: "Pourquoi est-il difficile de se soigner dans les campagnes des pays les plus pauvres ?",
      choix: ["Parce que les soignants manquent et que les centres de santé y sont rares et mal équipés", "Parce que les habitants des campagnes n'ont pas le droit de se faire soigner dans les hôpitaux des villes", "Parce que les hôpitaux y sont nombreux, mais réservés aux étrangers de passage", "Parce que les campagnes sont trop proches des villes pour avoir besoin de leurs propres centres de santé"],
      reponse: "Parce que les soignants manquent et que les centres de santé y sont rares et mal équipés",
      explication: "L'OMS prévoit qu'il manquera onze millions de soignants en 2030, surtout dans les pays pauvres, et les campagnes isolées en attirent encore moins. Loin des villes, le centre de santé est souvent petit, éloigné et peu équipé.",
      source: T("Health workforce", "Organisation mondiale de la santé (OMS)", "https://www.who.int/health-topics/health-workforce") },
    { id: "geographie-s08-1-q37", fiche: "geographie-s08-1-f5", type: "qcm_multiple", niveau: 2,
      enonce: "Qu'est-ce qui manque souvent aux centres de santé des pays les plus pauvres ? (plusieurs réponses)",
      choix: ["Une électricité fiable", "Un réfrigérateur pour garder les vaccins au froid", "Du matériel médical qui fonctionne", "De la lumière pour soigner la nuit", "Des malades à soigner : ces centres sont presque toujours vides", "Du soleil pour alimenter des panneaux solaires"],
      reponse: ["Une électricité fiable", "Un réfrigérateur pour garder les vaccins au froid", "Du matériel médical qui fonctionne", "De la lumière pour soigner la nuit"],
      explication: "Près d'un milliard de personnes dépendent de centres de santé sans électricité fiable, surtout en Afrique subsaharienne et en Asie du Sud. Sans courant, pas de réfrigérateur pour les vaccins, pas de matériel qui marche, pas de lumière pour un accouchement.",
      source: T("Close to one billion people globally are served by health-care facilities with no electricity access or with unreliable electricity", "Organisation mondiale de la santé (OMS)", "https://www.who.int/news/item/14-01-2023-close-to-one-billion-people-globally-are-served-by-health-care-facilities-with-no-electricity-access-or-with-unreliable-electricity") },
    { id: "geographie-s08-1-q38", fiche: "geographie-s08-1-f5", type: "vrai_faux", niveau: 2,
      enonce: "Un vaccin qui a eu trop chaud peut perdre son efficacité : il doit rester au froid depuis sa fabrication jusqu'au malade.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "C'est la chaîne du froid : les médicaments sensibles à la température, comme les vaccins, se dégradent quand elle est rompue. Voilà pourquoi un dispensaire sans électricité a besoin d'un réfrigérateur au pétrole.",
      source: T("Chaîne du froid", "Wikipédia", "https://fr.wikipedia.org/wiki/Cha%C3%AEne_du_froid") },
    { id: "geographie-s08-1-q39", fiche: "geographie-s08-1-f5", type: "vrai_faux", niveau: 2,
      enonce: "Dans les campagnes des pays pauvres, les centres de santé sont souvent aussi bien équipés que les hôpitaux des pays riches.",
      corrections: ["Faux : il leur manque souvent l'électricité, l'eau courante et le matériel.", "Faux : ils ont le matériel, mais aucun médecin.", "Faux : ils sont modernes, mais presque toujours fermés."],
      reponse: { vrai: false, correction: "Faux : il leur manque souvent l'électricité, l'eau courante et le matériel." },
      explication: "C'est tout le contraire : un dispensaire de brousse soigne avec très peu de moyens. À Madagascar, par exemple, les malades sont examinés sur une planche, sans électricité ni eau courante.", source: P(6) },
    { id: "geographie-s08-1-q40", fiche: "geographie-s08-1-f5", type: "qcm", niveau: 3,
      enonce: "Pourquoi l'accès aux soins est-il un signe du niveau de développement d'un pays ?",
      choix: ["Parce que se soigner demande des hôpitaux, des médecins et du matériel, qui coûtent cher", "Parce que les habitants des pays riches, mieux nourris, n'ont presque plus jamais besoin d'aller chez le médecin", "Parce que les soins sont gratuits dans tous les pays du monde", "Parce que la santé ne compte pas dans le calcul de l'IDH"],
      reponse: "Parce que se soigner demande des hôpitaux, des médecins et du matériel, qui coûtent cher",
      explication: "La santé est l'un des trois critères de l'IDH, avec la richesse et l'éducation. Un pays pauvre a du mal à payer hôpitaux, soignants et matériel : ses habitants se soignent moins bien.", source: P(6) },
    { id: "geographie-s08-1-q42", fiche: "geographie-s08-1-f5", type: "qcm", niveau: 3,
      enonce: "Comment le nombre de médecins par habitant varie-t-il d'un pays à l'autre ?",
      choix: ["Il suit le revenu du pays : treize fois plus de médecins par habitant en Région Europe qu'en Région Afrique", "Il est à peu près le même partout dans le monde, car les médecins vont toujours s'installer là où l'on a besoin d'eux", "Il est plus élevé dans les pays pauvres, où l'on tombe plus souvent malade", "Il dépend du climat"],
      reponse: "Il suit le revenu du pays : treize fois plus de médecins par habitant en Région Europe qu'en Région Afrique",
      explication: "L'OMS constate que la densité de soignants suit le revenu national. L'Europe compte treize fois plus de médecins par habitant que l'Afrique, et six fois plus d'infirmiers et de sages-femmes.",
      source: T("Un médecin sur quatre approche de la retraite : l'OMS alerte sur la pénurie mondiale de personnels de santé", OMS, U_OMS26) },
    { id: "geographie-s08-1-q43", fiche: "geographie-s08-1-f5", type: "vrai_faux", niveau: 1,
      enonce: "En France, on compte environ 33 médecins pour 10 000 habitants ; à Madagascar, moins de 2.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : 33,4 médecins pour 10 000 habitants en France (2021) contre 1,8 à Madagascar (2014) ; au Niger, c'est moins de 1. Un médecin malgache a donc bien plus de patients.",
      source: T("List of countries by number of medical doctors", "Wikipédia (en anglais)", U_MEDECINS) },

    // f6 : l'IDH en chiffres (fiche de programme : questions de thème)
    { id: "geographie-s08-1-q44", fiche: "geographie-s08-1-f6", type: "qcm", niveau: 1,
      enonce: "Quel organisme publie l'IDH et le classement des pays ?",
      choix: ["Le PNUD, un programme des Nations unies", "La Banque mondiale, qui fixe aussi le seuil de pauvreté", "L'INSEE", "L'OMS, l'Organisation mondiale de la santé"],
      reponse: "Le PNUD, un programme des Nations unies",
      explication: "Le PNUD, Programme des Nations unies pour le développement, publie l'IDH depuis 1990. La Banque mondiale, elle, s'occupe du seuil de pauvreté.",
      source: T("Indice de développement humain", "Wikipédia", U_IDH) },
    { id: "geographie-s08-1-q45", fiche: "geographie-s08-1-f6", type: "vrai_faux", niveau: 1,
      enonce: "En 2021, la Suisse avait l'IDH le plus élevé du monde, avec 0,962.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : 0,962, la meilleure note sur 191 pays classés. Le Soudan du Sud fermait la marche avec 0,385.",
      source: T("Indice de développement humain", "Wikipédia", U_IDH) },
    { id: "geographie-s08-1-q46", fiche: "geographie-s08-1-f6", type: "qcm", niveau: 2,
      enonce: "Quel pays avait l'IDH le plus bas en 2021 ?",
      choix: ["Le Soudan du Sud", "L'Inde", "L'Afghanistan, en guerre depuis quarante ans", "Le Brésil"],
      reponse: "Le Soudan du Sud",
      explication: "Le Soudan du Sud, avec 0,385, fermait le classement des 191 pays. C'est très loin de la moyenne mondiale de 0,732.",
      source: T("Indice de développement humain", "Wikipédia", U_IDH) },
    { id: "geographie-s08-1-q47", fiche: "geographie-s08-1-f6", type: "qcm", niveau: 3,
      enonce: "Pourquoi deux pays aussi riches l'un que l'autre peuvent-ils avoir des IDH différents ?",
      choix: ["Parce que l'IDH compte aussi l'espérance de vie et les années d'école, pas seulement le revenu", "Parce que l'IDH dépend de la taille du pays et du nombre de ses habitants, qui changent tout le calcul", "Parce que l'IDH dépend de la monnaie dans laquelle on compte le revenu", "Parce que l'IDH ne compte que le revenu"],
      reponse: "Parce que l'IDH compte aussi l'espérance de vie et les années d'école, pas seulement le revenu",
      explication: "Le revenu n'est qu'une des trois notes. Si la santé ou l'école sont moins bonnes, l'IDH baisse malgré la richesse.",
      source: T("Indice de développement humain", "Wikipédia", U_IDH) },
    { id: "geographie-s08-1-q48", fiche: "geographie-s08-1-f6", type: "vrai_faux", niveau: 2,
      enonce: "La moyenne mondiale de l'IDH est inférieure à 0,5.",
      corrections: ["Faux : elle était de 0,732 en 2021, dans la tranche « élevé ».", "Faux : elle est exactement de 1.", "Faux : elle était de 0,962 en 2021."],
      reponse: { vrai: false, correction: "Faux : elle était de 0,732 en 2021, dans la tranche « élevé »." },
      explication: "0,732 en 2021 : le monde est, en moyenne, dans la tranche élevée. Mais l'écart entre pays va de 0,385 à 0,962.",
      source: T("Indice de développement humain", "Wikipédia", U_IDH) },
    { id: "geographie-s08-1-q49", fiche: "geographie-s08-1-f6", type: "ordre", niveau: 3,
      enonce: "Range ces pays de l'IDH le plus faible au plus élevé (classement 2023).",
      elements: ["France", "Afghanistan", "Islande", "Inde"],
      reponse: [1, 3, 0, 2],
      explication: "Afghanistan 0,496 (faible), Inde 0,685 (moyen), France 0,920 et Islande 0,972 (très élevé). L'Islande est première du classement 2023.",
      indice: "L'Islande est en tête du classement 2023.",
      source: T("Liste des pays par IDH", "Wikipédia", U_LISTE_IDH) },
    { id: "geographie-s08-1-q51", fiche: "geographie-s08-1-f6", type: "trou", niveau: 1,
      enonce: "Complète la phrase.",
      texte: "L'IDH est publié par le ___ ; en 2021, la ___ était première du classement et le Soudan du Sud dernier.",
      banque: ["PNUD", "Suisse", "FMI", "France"],
      reponse: [["PNUD", "pnud"], ["Suisse", "suisse"]],
      explication: "Le PNUD publie l'IDH depuis 1990. En 2021, la Suisse avait 0,962 et le Soudan du Sud 0,385.",
      source: T("Indice de développement humain", "Wikipédia", U_IDH) },
    { id: "geographie-s08-1-q52", fiche: "geographie-s08-1-f6", type: "qcm", niveau: 2,
      enonce: "Comment l'IDH d'un pays est-il calculé ?",
      choix: ["On donne une note de 0 à 1 à la santé, à l'éducation et au revenu, puis on combine les trois", "On additionne le PIB et le nombre d'habitants", "On demande aux habitants de noter leur pays de 0 à 1, puis on fait la moyenne de leurs réponses", "On compte les hôpitaux et les écoles"],
      reponse: "On donne une note de 0 à 1 à la santé, à l'éducation et au revenu, puis on combine les trois",
      explication: "Chaque dimension reçoit une note entre 0 et 1, d'après un minimum et un maximum fixés à l'avance. Les trois notes sont ensuite combinées en une seule : l'IDH.",
      source: T("Indice de développement humain", "Wikipédia", U_IDH) }
  ],
  bonus: [
    {
      id: "geographie-s08-1-b1",
      fiche: "geographie-s08-1-f2",
      titre: "D'où vient l'IDH ?",
      texte: "L'IDH a été créé en 1990 par le PNUD, le Programme des Nations unies pour le développement. Deux économistes l'ont imaginé : l'Indien Amartya Sen et le Pakistanais Mahbub ul Haq. En 2021, la meilleure note du classement revenait à la Suisse, avec 0,962.",
      source: { titre: "Indice de développement humain", editeur: "Wikipédia, l'encyclopédie libre", url: U_IDH }
    },
    {
      id: "geographie-s08-1-b2",
      fiche: "geographie-s08-1-f4",
      titre: "73 ans : l'espérance de vie dans le monde",
      texte: "D'après l'ONU, l'espérance de vie à la naissance atteint 73,3 ans dans le monde en 2024, soit 8,4 ans de plus qu'en 1995. Elle devrait atteindre environ 77 ans en 2054. Cette moyenne cache de grands écarts : le cours compare la Finlande, 81 ans, et l'Afghanistan, 53 ans.",
      source: { titre: "Population (Enjeux mondiaux)", editeur: "Organisation des Nations unies", url: U_ONU_POP }
    }
  ],
  nonCouvert: [
    "La fiche et la capsule vidéo de l'outil 9 lui-même ne sont pas déposées : seules les pages 2, 5 et 6 du cours 2 sont utilisées.",
    "Le PDF du cours 2 n'est pas encore déposé dans DEPOT/ : les cartes (PIB par habitant en 2017, IDH, espérance de vie) ne sont connues que par leur légende. Les réponses aux questions de la page 6 (régions à IDH très élevé, pays à IDH élevé ou moyen, continent le moins développé, inégalités en Asie et en Amérique du Sud) ne sont pas reprises.",
    "Les corrigés des exercices des pages 5 et 6, imprimés à l'envers, sont illisibles dans le texte extrait.",
    "La carte de la page 6 range l'IDH avec d'autres seuils (élevé de 0,75 à 0,80, moyen de 0,55 à 0,75) : le jeu retient ceux de la carte de la page 2.",
    "Les valeurs de mortalité infantile de l'Inde, du Congo et de la République centrafricaine sont douteuses dans le texte extrait : seul le rang de la République centrafricaine (le plus élevé) est repris ; aucune valeur récente par pays (UNICEF) n'a été ajoutée.",
    "Le document 2 de la page 5 (une image) n'est pas décrit.",
    "Le détail du calcul de l'IDH (minimums et maximums de chaque note, moyenne géométrique) n'est pas enseigné : le jeu s'en tient aux trois notes combinées.",
    "La construction par l'élève d'une carte ou d'un graphique du développement (démarche attendue par le programme) n'est pas un exercice du jeu."
  ]
};
