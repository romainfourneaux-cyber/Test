// Source en clair du cours histoire-s04-3 « Cours 6 – La vie dans les campagnes au Moyen Âge ».
// Compilé (réponses brouillées) par node atelier/outils/compiler-cours.js histoire-s04-3.
// Sources : le support de la séance 6 (une page : frise et questions sur une image absente du fichier) et
// l'étude de cas 3 « La vie et le travail des paysans » (en-tête, calendrier des travaux du Rustican, famine
// de 1033 d'après Raoul Glaber). La charrue et le tableau des redevances de cette étude de cas sont traités
// au cours histoire-s06-1. La leçon est donnée en vidéo : voir nonCouvert.
const F6 = "cours/histoire/Histoire 5e - Seance 6 - Support.pdf";
const F3 = "cours/histoire/Histoire 5e - Moyen Age - Etude de cas 3 Vie et travail des paysans.pdf";
const S6 = p => ({ fichier: F6, page: p });
const S3 = p => ({ fichier: F3, page: p });

// Frise redessinée (aucune image reprise) : années -> abscisses.
const A0 = 950, A1 = 1450, X0 = 30, X1 = 510;
const x = a => Math.round((X0 + (a - A0) * (X1 - X0) / (A1 - A0)) * 10) / 10;
function frise() {
  const encre = "#2e2419";
  let s = "<svg viewBox='0 20 540 200' xmlns='http://www.w3.org/2000/svg' font-family='Georgia,serif' font-size='11'>";
  s += "<rect x='" + x(1000) + "' y='40' width='" + (x(1050) - x(1000)) + "' height='14' fill='#8f86c2'/>";
  s += "<text x='" + x(1000) + "' y='36' fill='" + encre + "'>Vers l'an mil : développement de la seigneurie banale</text>";
  s += "<rect x='" + x(1050) + "' y='74' width='" + (x(1300) - x(1050)) + "' height='18' fill='#9cc58a'/>";
  s += "<text x='" + ((x(1050) + x(1300)) / 2) + "' y='70' text-anchor='middle' font-size='10' fill='" + encre + "'>XIe-XIIIe siècle : grands défrichements (développement économique et démographique)</text>";
  s += "<line x1='" + x(1348) + "' y1='92' x2='" + x(1348) + "' y2='120' stroke='#b23a3a' stroke-dasharray='3 2'/>";
  s += "<circle cx='" + x(1348) + "' cy='120' r='4' fill='#b23a3a'/>";
  s += "<text x='" + x(1348) + "' y='108' text-anchor='middle' fill='#b23a3a'>1348 : Grande peste</text>";
  s += "<line x1='" + X0 + "' y1='120' x2='" + (X1 + 8) + "' y2='120' stroke='" + encre + "' stroke-width='2'/>";
  s += "<path d='M" + (X1 + 8) + " 115l10 5-10 5z' fill='" + encre + "'/>";
  for (let a = 1000; a <= 1400; a += 100) {
    s += "<line x1='" + x(a) + "' y1='116' x2='" + x(a) + "' y2='124' stroke='" + encre + "'/>";
    s += "<text x='" + x(a) + "' y='135' text-anchor='middle' font-size='9' fill='" + encre + "'>" + a + "</text>";
  }
  s += "<rect x='" + x(1000) + "' y='144' width='" + (x(1100) - x(1000)) + "' height='14' fill='#7fb4d6'/>";
  s += "<text x='" + x(1000) + "' y='172' fill='" + encre + "'>Vers l'an mil : naissance du village médiéval</text>";
  s += "<line x1='" + x(1033) + "' y1='158' x2='" + x(1033) + "' y2='186' stroke='" + encre + "' stroke-dasharray='3 2'/>";
  s += "<text x='" + x(1033) + "' y='198' fill='" + encre + "'>1033 : famine racontée par Raoul Glaber</text>";
  return s + "</svg>";
}

module.exports = {
  id: "histoire-s04-3",
  fiches: [
    {
      id: "histoire-s04-3-f1", notion: "Les campagnes de l'an mil à 1348 : repères",
      titre: "Du village médiéval à la Grande peste",
      texte: "Vers l'an mil naît le village médiéval. C'est aussi l'époque où se développe la seigneurie banale. Du XIe au XIIIe siècle, les campagnes connaissent un développement économique et démographique : c'est le temps des grands défrichements. Puis, en 1348, survient la Grande peste.",
      pointsCles: ["Vers l'an mil : naissance du village médiéval, développement de la seigneurie banale", "XIe-XIIIe siècle : grands défrichements, développement économique et démographique", "1348 : la Grande peste"],
      dates: [
        { annee: 1000, evenement: "Vers l'an mil : naissance du village médiéval" },
        { annee: 1348, evenement: "La Grande peste" }
      ],
      lieux: [], personnages: [],
      vocabulaire: [
        { mot: "défrichement", def: "le fait de couper les arbres et les broussailles d'un terrain pour en faire des champs" },
        { mot: "démographique", def: "qui concerne la population et son nombre" }
      ],
      schema: "histoire-s04-3-s1", prerequis: [], source: S6(1)
    },
    {
      id: "histoire-s04-3-f2", notion: "Les paysans, plus de 90 % de la population",
      titre: "Un monde de paysans nourri de céréales",
      texte: "Au Moyen Âge, plus de neuf habitants sur dix sont des paysans. Sur leurs terres, ils font pousser surtout des céréales. Transformées en bouillies, en galettes ou en pains, ces céréales sont la base de ce que tout le monde mange.",
      pointsCles: ["Les paysans : plus de 90 % de la population", "Culture principale : les céréales", "Céréales mangées en bouillies, galettes et pains : la base de l'alimentation"],
      dates: [],
      lieux: [], personnages: [],
      vocabulaire: [
        { mot: "céréales", def: "les plantes à grains, comme le blé ou l'avoine, dont on fait les bouillies, les galettes et le pain" }
      ],
      schema: null, prerequis: [], source: S3(1)
    },
    {
      id: "histoire-s04-3-f3", notion: "Les travaux des paysans mois par mois",
      titre: "Une année de travail : le calendrier du Rustican",
      texte: "Un livre du XVe siècle, le Rustican, montre les travaux de chaque mois. Au printemps : épandre le fumier, tailler la vigne, tondre les moutons. En été : fenaison en juin, moisson en juillet, battage du blé en août. En automne : semailles en septembre, vendange et foulage du raisin en octobre, glandée des porcs en novembre.",
      pointsCles: ["Janvier : argile pour les tuiles ; février : fumier ; mars : taille de la vigne ; avril : tonte des moutons", "Mai : le seigneur chasse au faucon", "Juin : fenaison ; juillet : moisson ; août : battage", "Septembre : semailles ; octobre : vendange et foulage ; novembre : glandée ; décembre : on tue les porcs"],
      astuce: "L'été est le plus chargé : faucher (juin), moissonner (juillet), battre (août).",
      dates: [],
      lieux: ["Chantilly"], personnages: ["Pietro Crescenzi"],
      vocabulaire: [
        { mot: "fenaison", def: "le fauchage des prés pour faire le foin, en juin" },
        { mot: "moisson", def: "la récolte des céréales, en juillet" },
        { mot: "battage", def: "le fait de battre les épis pour en faire sortir les grains, en août" },
        { mot: "semailles", def: "le moment où l'on sème les graines dans les champs, en septembre" },
        { mot: "glandée", def: "le ramassage des glands en forêt pour nourrir les porcs, en novembre" }
      ],
      schema: null, prerequis: ["histoire-s04-3-f2"], source: S3(1)
    },
    {
      id: "histoire-s04-3-f4", notion: "La famine de 1033",
      titre: "Vers 1033, la faim : le récit de Raoul Glaber",
      texte: "Vers 1033, une terrible famine frappe. Le moine bourguignon Raoul Glaber, un chroniqueur, en est le témoin et la raconte : des pluies sans fin ont trempé le sol, et pendant trois ans on n'a pas pu semer. Les gens affamés mangent des bêtes sauvages, des charognes, et même du pain fait d'une terre blanche mêlée de son.",
      pointsCles: ["Vers 1033 : une famine", "Cause : des pluies continuelles, impossible de semer pendant trois ans", "Nourriture de misère : bêtes sauvages, oiseaux, charognes, pain de terre et de son", "Témoin : Raoul Glaber, moine et chroniqueur bourguignon"],
      dates: [
        { annee: 1033, evenement: "Famine racontée par Raoul Glaber" }
      ],
      lieux: ["Bourgogne"], personnages: ["Raoul Glaber"],
      vocabulaire: [
        { mot: "famine", def: "un manque grave de nourriture, qui fait mourir de faim" },
        { mot: "chroniqueur", def: "une personne qui écrit le récit des événements de son temps" }
      ],
      schema: "histoire-s04-3-s1", prerequis: ["histoire-s04-3-f2"], source: S3(1)
    }
  ],
  schemas: [
    { id: "histoire-s04-3-s1", legende: "Les campagnes de l'an mil à la Grande peste (frise redessinée d'après le support, complétée par la famine de 1033 de l'étude de cas).", svg: frise() }
  ],
  questions: [
    // f1 : la frise
    { id: "histoire-s04-3-q1", fiche: "histoire-s04-3-f1", type: "qcm", niveau: 1,
      enonce: "En quelle année la frise place-t-elle la Grande peste ?",
      choix: ["1348", "1033", "1238", "1000"],
      reponse: "1348",
      explication: "La Grande peste est datée de 1348 sur la frise. C'est le dernier repère du cours.", source: S6(1) },
    { id: "histoire-s04-3-q2", fiche: "histoire-s04-3-f1", type: "vrai_faux", niveau: 1,
      enonce: "D'après la frise, le village médiéval naît vers l'an mil.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : la frise place la naissance du village médiéval à partir de l'an mil. La seigneurie banale se développe à la même époque.", source: S6(1) },
    { id: "histoire-s04-3-q3", fiche: "histoire-s04-3-f1", type: "qcm", niveau: 2,
      enonce: "Comment la frise décrit-elle la période des grands défrichements, du XIe au XIIIe siècle ?",
      choix: ["Un développement économique et démographique", "Une période de famines et de peste dans les campagnes", "La naissance du village médiéval", "La fin de la seigneurie banale"],
      reponse: "Un développement économique et démographique",
      explication: "Les grands défrichements vont avec un développement économique et démographique. Les campagnes produisent plus et la population augmente.", source: S6(1) },
    { id: "histoire-s04-3-q4", fiche: "histoire-s04-3-f1", type: "vrai_faux", niveau: 2,
      enonce: "La Grande peste a lieu avant les grands défrichements.",
      corrections: ["Faux : la Grande peste (1348) vient après les grands défrichements du XIe au XIIIe siècle.", "Faux : la Grande peste a lieu en même temps que la naissance du village médiéval.", "Faux : la Grande peste a lieu vers l'an mil."],
      reponse: { vrai: false, correction: "Faux : la Grande peste (1348) vient après les grands défrichements du XIe au XIIIe siècle." },
      explication: "Les grands défrichements se font du XIe au XIIIe siècle. La Grande peste arrive ensuite, en 1348.", source: S6(1) },
    { id: "histoire-s04-3-q5", fiche: "histoire-s04-3-f1", type: "association", niveau: 2,
      enonce: "Relie chaque repère de la frise à son époque.",
      gauche: ["Grande peste", "Grands défrichements", "Naissance du village médiéval", "Développement de la seigneurie banale"],
      droite: ["Vers l'an mil, pendant un demi-siècle", "1348", "Du XIe au XIIIe siècle", "Vers l'an mil, pendant un siècle"],
      reponse: [[0, 1], [1, 2], [2, 3], [3, 0]],
      explication: "Village médiéval (un siècle) et seigneurie banale (un demi-siècle) commencent vers l'an mil. Les défrichements suivent, puis la peste en 1348.", source: S6(1) },
    { id: "histoire-s04-3-q6", fiche: "histoire-s04-3-f1", type: "qcm", niveau: 3,
      enonce: "Un paysan naît en 1340. Quel événement de la frise survient quand il a huit ans ?",
      choix: ["La Grande peste", "La naissance du village médiéval", "Le début des grands défrichements", "La famine racontée par Raoul Glaber"],
      reponse: "La Grande peste",
      explication: "1340 plus 8 font 1348 : l'année de la Grande peste. Les autres repères sont bien plus anciens.", indice: "Ajoute 8 à 1340, puis cherche l'année sur la frise.", source: S6(1) },
    { id: "histoire-s04-3-q7", fiche: "histoire-s04-3-f1", type: "qcm", niveau: 2,
      enonce: "Pourquoi parle-t-on de développement « démographique » du XIe au XIIIe siècle ?",
      choix: ["La population augmente", "Les villages disparaissent", "La peste fait beaucoup de morts", "Le seigneur perd ses droits"],
      reponse: "La population augmente",
      explication: "Démographique veut dire : qui concerne la population. Pendant les grands défrichements, il y a de plus en plus d'habitants.", source: S6(1) },
    { id: "histoire-s04-3-q8", fiche: "histoire-s04-3-f1", type: "trou", niveau: 1,
      enonce: "Complète avec les mots de la frise.",
      texte: "Vers l'an mil naît le ___ médiéval. En 1348 survient la Grande ___.",
      banque: ["village", "peste", "château", "famine"],
      reponse: [["village"], ["peste"]],
      explication: "La frise commence avec la naissance du village médiéval. Elle se termine par la Grande peste de 1348.", source: S6(1) },
    // f2 : les paysans
    { id: "histoire-s04-3-q9", fiche: "histoire-s04-3-f2", type: "qcm", niveau: 1,
      enonce: "Quelle part de la population les paysans représentent-ils au Moyen Âge ?",
      choix: ["Plus de 90 %", "Environ la moitié", "Moins de 10 %", "Un tiers"],
      reponse: "Plus de 90 %",
      explication: "Les paysans forment plus de 90 % de la population. Presque tout le monde vit de la terre.", source: S3(1) },
    { id: "histoire-s04-3-q10", fiche: "histoire-s04-3-f2", type: "vrai_faux", niveau: 1,
      enonce: "Au Moyen Âge, plus de neuf habitants sur dix sont des paysans.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : plus de 90 % de la population, c'est plus de neuf personnes sur dix.", source: S3(1) },
    { id: "histoire-s04-3-q11", fiche: "histoire-s04-3-f2", type: "qcm", niveau: 2,
      enonce: "Que cultivent surtout les paysans sur leurs terres ?",
      choix: ["Des céréales", "Des légumes", "Du raisin seulement", "Des fruits"],
      reponse: "Des céréales",
      explication: "Les paysans cultivent surtout des céréales. Elles sont la base de l'alimentation.", source: S3(1) },
    { id: "histoire-s04-3-q12", fiche: "histoire-s04-3-f2", type: "qcm_multiple", niveau: 2,
      enonce: "Sous quelles formes les céréales sont-elles mangées ? (plusieurs réponses)",
      choix: ["En bouillies", "En galettes", "En pains", "En fromages", "En confitures"],
      reponse: ["En bouillies", "En galettes", "En pains"],
      explication: "Les céréales deviennent des bouillies, des galettes ou des pains. Fromages et confitures ne sont pas faits de céréales.", source: S3(1) },
    { id: "histoire-s04-3-q13", fiche: "histoire-s04-3-f2", type: "vrai_faux", niveau: 2,
      enonce: "Au Moyen Âge, la base de l'alimentation est la viande.",
      corrections: ["Faux : ce sont les céréales, mangées en bouillies, galettes ou pains.", "Faux : ce sont les fruits, mangés en confitures.", "Faux : c'est le poisson, mangé séché."],
      reponse: { vrai: false, correction: "Faux : ce sont les céréales, mangées en bouillies, galettes ou pains." },
      explication: "La base de l'alimentation, ce sont les céréales. On les mange en bouillies, en galettes ou en pains.", source: S3(1) },
    { id: "histoire-s04-3-q14", fiche: "histoire-s04-3-f2", type: "qcm", niveau: 2,
      enonce: "Pourquoi les céréales sont-elles si importantes au Moyen Âge ?",
      choix: ["Elles sont la base de ce que tout le monde mange", "Elles servent seulement à nourrir les porcs du seigneur", "Elles ne poussent que sur la réserve du seigneur", "Elles sont vendues très cher aux villes lointaines"],
      reponse: "Elles sont la base de ce que tout le monde mange",
      explication: "Bouillies, galettes et pains sont faits de céréales. Sans elles, les gens n'ont plus de quoi manger.", source: S3(1) },
    { id: "histoire-s04-3-q15", fiche: "histoire-s04-3-f2", type: "qcm", niveau: 3,
      enonce: "Dans un village de 100 habitants au Moyen Âge, combien sont paysans, d'après le cours ?",
      choix: ["Plus de 90", "Environ 50", "Moins de 10", "Exactement 100"],
      reponse: "Plus de 90",
      explication: "Les paysans sont plus de 90 % de la population. Sur 100 habitants, cela fait plus de 90 paysans.", indice: "90 % de 100, c'est 90.", source: S3(1) },
    { id: "histoire-s04-3-q16", fiche: "histoire-s04-3-f2", type: "vrai_faux", niveau: 3,
      enonce: "Si les céréales manquent, c'est toute la population qui risque la faim.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : les céréales sont la base de l'alimentation de tous. Quand elles manquent, c'est la famine, comme vers 1033.", source: S3(1) },
    // f3 : les travaux des mois
    { id: "histoire-s04-3-q17", fiche: "histoire-s04-3-f3", type: "qcm", niveau: 1,
      enonce: "En quel mois a lieu la moisson, d'après le Rustican ?",
      choix: ["Juillet", "Mars", "Septembre", "Décembre"],
      reponse: "Juillet",
      explication: "La moisson est en juillet. En mars on taille la vigne, en septembre on sème, en décembre on tue les porcs.", source: S3(1) },
    { id: "histoire-s04-3-q18", fiche: "histoire-s04-3-f3", type: "vrai_faux", niveau: 1,
      enonce: "La vendange et le foulage du raisin ont lieu en octobre.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : en octobre, on vendange puis on foule le raisin. La vigne avait été taillée en mars.", source: S3(1) },
    { id: "histoire-s04-3-q19", fiche: "histoire-s04-3-f3", type: "association", niveau: 2,
      enonce: "Relie chaque mois au travail des champs qui lui correspond.",
      gauche: ["Juin", "Septembre", "Novembre", "Avril"],
      droite: ["Glandée pour nourrir les porcs", "Tonte des moutons", "Fenaison : on fauche les prés", "Semailles"],
      reponse: [[0, 2], [1, 3], [2, 0], [3, 1]],
      explication: "Juin : fenaison ; septembre : semailles ; novembre : glandée ; avril : tonte des moutons.", source: S3(1) },
    { id: "histoire-s04-3-q20", fiche: "histoire-s04-3-f3", type: "qcm", niveau: 2,
      enonce: "Qui chasse au faucon en mai, sur les images du Rustican ?",
      choix: ["Le seigneur", "Les paysans", "Le meunier", "Les enfants du village"],
      reponse: "Le seigneur",
      explication: "En mai, l'image montre le seigneur à la chasse au faucon. Les paysans, eux, travaillent tous les autres mois.", source: S3(1) },
    { id: "histoire-s04-3-q21", fiche: "histoire-s04-3-f3", type: "vrai_faux", niveau: 2,
      enonce: "Les semailles ont lieu en juillet, juste après la moisson.",
      corrections: ["Faux : les semailles sont en septembre ; en juillet, c'est la moisson.", "Faux : les semailles sont en janvier, avec l'argile des tuiles.", "Faux : les semailles sont en décembre, en même temps que la glandée."],
      reponse: { vrai: false, correction: "Faux : les semailles sont en septembre ; en juillet, c'est la moisson." },
      explication: "On sème en septembre. Juillet est le mois de la moisson, et août celui du battage.", source: S3(1) },
    { id: "histoire-s04-3-q22", fiche: "histoire-s04-3-f3", type: "qcm", niveau: 2,
      enonce: "Pourquoi mène-t-on les porcs en forêt en novembre ?",
      choix: ["Pour les nourrir de glands", "Pour les vendre au marché de la ville", "Pour les tondre comme les moutons", "Pour leur faire tirer la charrue"],
      reponse: "Pour les nourrir de glands",
      explication: "Novembre est le mois de la glandée : les porcs mangent les glands tombés des chênes. En décembre, on les tue.", source: S3(1) },
    { id: "histoire-s04-3-q23", fiche: "histoire-s04-3-f3", type: "qcm", niveau: 3,
      enonce: "Fenaison en juin, moisson en juillet, battage en août : quelle saison est la plus chargée pour les paysans ?",
      choix: ["L'été", "L'hiver", "Le printemps", "L'automne"],
      reponse: "L'été",
      explication: "Juin, juillet et août sont les mois d'été. Ils enchaînent la fenaison, la moisson et le battage.", source: S3(1) },
    { id: "histoire-s04-3-q24", fiche: "histoire-s04-3-f3", type: "ordre", niveau: 2,
      enonce: "Remets ces travaux dans l'ordre de l'année, de janvier à décembre.",
      elements: ["Battage des épis", "Taille de la vigne", "Semailles", "Fenaison"],
      reponse: [1, 3, 0, 2],
      explication: "Mars : taille de la vigne ; juin : fenaison ; août : battage ; septembre : semailles.", source: S3(1) },
    { id: "histoire-s04-3-q25", fiche: "histoire-s04-3-f3", type: "qcm", niveau: 2,
      enonce: "D'où viennent les images des travaux des mois ?",
      choix: ["Du Rustican, au XVe siècle", "D'un cartulaire de 1238", "D'une chanson de Normandie", "D'une chronique de Raoul Glaber"],
      reponse: "Du Rustican, au XVe siècle",
      explication: "Les images viennent du Rustican, de Pietro Crescenzi, un livre du XVe siècle. Il est conservé au musée Condé, à Chantilly.", source: S3(1) },
    // f4 : la famine de 1033
    { id: "histoire-s04-3-q26", fiche: "histoire-s04-3-f4", type: "qcm", niveau: 1,
      enonce: "Qui raconte la famine survenue vers 1033 ?",
      choix: ["Raoul Glaber, un moine", "Pietro Crescenzi", "Eginhard", "Un seigneur de Wismes"],
      reponse: "Raoul Glaber, un moine",
      explication: "Le moine Raoul Glaber en témoigne dans sa chronique. Pietro Crescenzi est l'auteur du Rustican, bien plus tard.", source: S3(1) },
    { id: "histoire-s04-3-q27", fiche: "histoire-s04-3-f4", type: "vrai_faux", niveau: 1,
      enonce: "La famine racontée par Raoul Glaber a lieu vers 1033.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : Raoul Glaber parle d'une faim terrible survenue vers 1033.", source: S3(1) },
    { id: "histoire-s04-3-q28", fiche: "histoire-s04-3-f4", type: "qcm", niveau: 2,
      enonce: "Pourquoi la famine éclate-t-elle, d'après Raoul Glaber ?",
      choix: ["Des pluies sans fin ont empêché de semer pendant trois ans", "Une grande sécheresse a brûlé toutes les récoltes des paysans", "Le seigneur a pris toutes les récoltes", "La peste a tué les paysans"],
      reponse: "Des pluies sans fin ont empêché de semer pendant trois ans",
      explication: "Le sol trempé par des pluies continuelles n'a pas pu être semé pendant trois ans. Sans semailles, plus de récoltes.", source: S3(1) },
    { id: "histoire-s04-3-q29", fiche: "histoire-s04-3-f4", type: "qcm_multiple", niveau: 2,
      enonce: "Que mangent les gens pendant la famine, d'après le texte ? (plusieurs réponses)",
      choix: ["Des bêtes sauvages et des oiseaux", "Des charognes", "Du pain fait de terre blanche et de son", "Des galettes de blé", "Du raisin"],
      reponse: ["Des bêtes sauvages et des oiseaux", "Des charognes", "Du pain fait de terre blanche et de son"],
      explication: "Faute de céréales, les gens mangent des bêtes sauvages, des oiseaux, des charognes et un pain de terre mêlée de son. Galettes et raisin manquent justement.", source: S3(1) },
    { id: "histoire-s04-3-q30", fiche: "histoire-s04-3-f4", type: "vrai_faux", niveau: 2,
      enonce: "Raoul Glaber est un seigneur de Bourgogne.",
      corrections: ["Faux : c'est un moine et chroniqueur bourguignon.", "Faux : c'est un paysan de Normandie.", "Faux : c'est un roi de Bourgogne."],
      reponse: { vrai: false, correction: "Faux : c'est un moine et chroniqueur bourguignon." },
      explication: "Raoul Glaber est un moine de Bourgogne. Il écrit une chronique, un récit des événements de son temps.", source: S3(1) },
    { id: "histoire-s04-3-q31", fiche: "histoire-s04-3-f4", type: "qcm", niveau: 3,
      enonce: "Pourquoi des pluies qui empêchent de semer provoquent-elles une famine ?",
      choix: ["Sans semailles, il n'y a plus de céréales à récolter", "Les pluies noient les porcs menés à la glandée en novembre", "La pluie fait pourrir le bois du moulin du seigneur", "Les pluies font fuir les chevaliers du château"],
      reponse: "Sans semailles, il n'y a plus de céréales à récolter",
      explication: "Les céréales sont la base de l'alimentation. Sans semailles pendant trois ans, il n'y a plus ni pain, ni galettes, ni bouillies.", indice: "Souviens-toi de ce que mangent surtout les gens au Moyen Âge.", source: S3(1) },
    { id: "histoire-s04-3-q32", fiche: "histoire-s04-3-f4", type: "trou", niveau: 1,
      enonce: "Complète le récit de la famine.",
      texte: "Vers ___, une famine frappe : pendant trois ans, les ___ continuelles ont empêché de semer.",
      banque: ["1033", "pluies", "1348", "loups"],
      reponse: [["1033"], ["pluies"]],
      explication: "Raoul Glaber situe la famine vers 1033. Sa cause : des pluies qui ne s'arrêtent pas.", source: S3(1) },
    { id: "histoire-s04-3-q33", fiche: "histoire-s04-3-f4", type: "vrai_faux", niveau: 3,
      enonce: "La famine de 1033 et la Grande peste de 1348 ont lieu à plus de trois siècles d'écart.",
      corrections: ["Faux : 1348 moins 1033 font 315 ans, soit un peu plus de trois siècles... c'est donc vrai.", "Faux : elles ont lieu la même année.", "Faux : elles sont séparées d'une dizaine d'années seulement."],
      reponse: { vrai: true, correction: null },
      explication: "Oui : 1348 moins 1033 font 315 ans. Les deux malheurs sont séparés par plus de trois siècles.", source: S3(1) }
  ],
  bonus: [
    {
      id: "histoire-s04-3-b1",
      fiche: "histoire-s04-3-f1",
      titre: "La Grande peste de 1348",
      texte: "La Grande peste, que les historiens appellent aussi peste noire, arrive à Marseille en novembre 1347, à Avignon en janvier 1348 et à Paris en août 1348. Transmise par les puces des rats noirs, elle tue en cinq ou six ans entre 30 et 60 % des habitants de l'Europe.",
      source: { titre: "Peste noire", editeur: "Wikipédia, l'encyclopédie libre", url: "https://fr.wikipedia.org/wiki/Peste_noire" }
    }
  ],
  nonCouvert: [
    "L'image du village et du château étudiée en classe (arrière-plan, place du château par rapport au village) n'est pas dans le fichier : seules les questions y figurent.",
    "Les mots importants à noter : le cadre est vide ; la leçon est donnée en vidéo.",
    "Ce qu'est la seigneurie banale : la frise cite seulement l'époque de son développement.",
    "Les causes des grands défrichements et ce qu'ils changent dans le paysage.",
    "Les conséquences de la Grande peste de 1348 sur les campagnes.",
    "Les douze images du Rustican elles-mêmes (seules leurs légendes sont reprises) et le texte de la chronique de Raoul Glaber dans sa version complète.",
    "Les réponses écrites aux questions de l'étude de cas (saison la plus chargée, définition d'une famine), données pendant la vidéo.",
    "La charrue, le collier d'épaule et le tableau des redevances de la même étude de cas : ils sont traités au cours 8 (histoire-s06-1)."
  ]
};
