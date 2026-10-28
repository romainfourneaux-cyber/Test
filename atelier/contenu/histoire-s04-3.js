// Source en clair du cours histoire-s04-3 « Cours 6 – La vie dans les campagnes au Moyen Âge ».
// Compilé (réponses brouillées) par node atelier/outils/compiler-cours.js histoire-s04-3.
// Sources : le support de la séance 6 (une page : frise et questions sur une image absente du fichier) et
// l'étude de cas 3 « La vie et le travail des paysans » (en-tête, calendrier des travaux du Rustican, famine
// de 1033 d'après Raoul Glaber). La charrue et le tableau des redevances de cette étude de cas sont traités
// au cours histoire-s06-1. La leçon est donnée en vidéo : depuis le 28/10/2026 (demande de Romain), les fiches f1,
// f5 et f6 viennent du programme officiel de 5e (sous-thème « L'ordre seigneurial : la formation et la domination
// des campagnes »), vérifiées sur les pages citées dans leur source.
const F6 = "cours/histoire/Histoire 5e - Seance 6 - Support.pdf";
const F3 = "cours/histoire/Histoire 5e - Moyen Age - Etude de cas 3 Vie et travail des paysans.pdf";
const S6 = p => ({ fichier: F6, page: p });
const S3 = p => ({ fichier: F3, page: p });
// Questions de thème (règle du 25/10/2026) : fait vérifié dans une source fiable, notée sans fichier ni page.
const T = (titre, url) => ({ theme: "Cours 6 – La vie dans les campagnes au Moyen Âge", titre, editeur: "Wikipédia", url });
// Fiches de programme (règle du 28/10/2026) : sous-thème officiel, page où les faits ont été vérifiés.
const P = (titre, url) => ({ programme: "L'ordre seigneurial : la formation et la domination des campagnes", titre, editeur: "Wikipédia", url });
const U_DEFRICHEMENT = "https://fr.wikipedia.org/wiki/D%C3%A9frichement";
const U_PESTE = "https://fr.wikipedia.org/wiki/Peste_noire";
const U_ENCELLULEMENT = "https://fr.wikipedia.org/wiki/Encellulement";
const U_SEIGNEURIE = "https://fr.wikipedia.org/wiki/Seigneurie";

// Frise redessinée (aucune image reprise) : années -> abscisses.
const A0 = 950, A1 = 1450, X0 = 30, X1 = 510;
const x = a => Math.round((X0 + (a - A0) * (X1 - X0) / (A1 - A0)) * 10) / 10;
function frise() {
  const encre = "#2e2419";
  let s = "<svg viewBox='0 20 540 200' xmlns='http://www.w3.org/2000/svg' font-family='Georgia,serif' font-size='11'>";
  s += "<rect x='" + x(950) + "' y='40' width='" + (x(1050) - x(950)) + "' height='14' fill='#8f86c2'/>";
  s += "<text x='" + x(950) + "' y='36' fill='" + encre + "'>Vers l'an mil : développement de la seigneurie banale</text>";
  s += "<rect x='" + x(1000) + "' y='74' width='" + (x(1300) - x(1000)) + "' height='18' fill='#9cc58a'/>";
  s += "<text x='" + ((x(1000) + x(1300)) / 2) + "' y='70' text-anchor='middle' font-size='10' fill='" + encre + "'>XIe-XIIIe siècle : grands défrichements (développement économique et démographique)</text>";
  s += "<line x1='" + x(1348) + "' y1='92' x2='" + x(1348) + "' y2='120' stroke='#b23a3a' stroke-dasharray='3 2'/>";
  s += "<circle cx='" + x(1348) + "' cy='120' r='4' fill='#b23a3a'/>";
  s += "<text x='" + x(1348) + "' y='108' text-anchor='middle' fill='#b23a3a'>1348 : Grande peste</text>";
  s += "<line x1='" + X0 + "' y1='120' x2='" + (X1 + 8) + "' y2='120' stroke='" + encre + "' stroke-width='2'/>";
  s += "<path d='M" + (X1 + 8) + " 115l10 5-10 5z' fill='" + encre + "'/>";
  for (let a = 1000; a <= 1400; a += 100) {
    s += "<line x1='" + x(a) + "' y1='116' x2='" + x(a) + "' y2='124' stroke='" + encre + "'/>";
    s += "<text x='" + x(a) + "' y='135' text-anchor='middle' font-size='9' fill='" + encre + "'>" + a + "</text>";
  }
  s += "<rect x='" + x(950) + "' y='144' width='" + (x(1100) - x(950)) + "' height='14' fill='#7fb4d6'/>";
  s += "<text x='" + x(950) + "' y='172' fill='" + encre + "'>Vers l'an mil : naissance du village médiéval</text>";
  s += "<line x1='" + x(1033) + "' y1='158' x2='" + x(1033) + "' y2='186' stroke='" + encre + "' stroke-dasharray='3 2'/>";
  s += "<text x='" + x(1033) + "' y='198' fill='" + encre + "'>1033 : famine racontée par Raoul Glaber</text>";
  return s + "</svg>";
}

module.exports = {
  id: "histoire-s04-3",
  fiches: [
    {
      id: "histoire-s04-3-f1", notion: "De l'an mil à 1348 : essor des campagnes, puis la Peste",
      titre: "Trois siècles de conquête de la terre, puis la Peste",
      texte: "Vers l'an mil, les paysans se regroupent en villages, autour du château et de l'église. Du XIe au XIIIe siècle, l'Occident gagne des champs sur la forêt : c'est l'âge des grands défrichements, et la population fait plus que doubler. Arrivée à Marseille fin 1347, la Grande Peste ravage la France en 1348 et vide des villages.",
      pointsCles: ["Vers l'an mil : les paysans se regroupent en villages ; la seigneurie banale se développe", "XIe-XIIIe siècle : grands défrichements ; l'Occident passe d'environ 38 millions d'habitants au début du Xe siècle à plus de 75 millions au début du XIVe", "Fin 1347 : la Peste débarque à Messine, puis à Marseille ; 1348 : toute la France est touchée", "Entre 30 et 60 % des Européens meurent en cinq ou six ans ; des villages sont abandonnés"],
      dates: [
        { annee: 1000, evenement: "Vers l'an mil : naissance du village médiéval" },
        { annee: 1050, evenement: "Vers 1050 : début de l'ère des grands défrichements" },
        { annee: 1348, evenement: "La Grande peste" }
      ],
      lieux: ["Marseille"], personnages: [],
      vocabulaire: [
        { mot: "défrichement", def: "le fait de couper les arbres et les broussailles d'un terrain pour en faire des champs" },
        { mot: "démographique", def: "qui concerne la population et son nombre" },
        { mot: "peste", def: "une maladie très contagieuse, transmise par les puces des rats, qui tue en quelques jours" }
      ],
      schema: "histoire-s04-3-s1", prerequis: [], source: P("Défrichement", U_DEFRICHEMENT)
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
    },
    {
      id: "histoire-s04-3-f5", notion: "Les grands défrichements : gagner des terres sur la forêt",
      titre: "À l'assaut de la forêt : les grands défrichements",
      texte: "Vers 1050, l'Occident part à l'assaut de ses forêts et de ses marais. Des paysans grignotent la lisière des bois ; des seigneurs et des moines organisent de grands chantiers et fondent des villages neufs. Les outils de fer, des routes meilleures et la fin des invasions rendent la conquête possible. Les terres gagnées s'appellent des essarts.",
      pointsCles: ["Vers 1050 s'ouvre l'« ère des grands défrichements » ; la forêt recule le plus aux XIIIe et XIVe siècles", "Qui défriche : des paysans, des seigneurs (parfois associés à une abbaye ou à une ville), des moines", "Pourquoi : la population augmente, les outils de fer se répandent, les invasions ont cessé, les routes s'améliorent", "Villages neufs du Sud-Ouest : sauvetés, bastides (surtout au XIIIe siècle)", "Un essart : une terre gagnée sur la forêt ; beaucoup de lieux s'appellent encore Les Essarts"],
      astuce: "Trois défricheurs : le paysan (sa hache), le seigneur (ses villages neufs), le moine (son abbaye).",
      dates: [
        { annee: 1050, evenement: "Vers 1050 : début de l'ère des grands défrichements" }
      ],
      lieux: [], personnages: [],
      vocabulaire: [
        { mot: "essart", def: "une terre gagnée sur la forêt en arrachant arbres et broussailles" },
        { mot: "lisière", def: "le bord d'une forêt" },
        { mot: "bastide", def: "un village neuf du Sud-Ouest, fondé surtout au XIIIe siècle" },
        { mot: "sauveté", def: "un village neuf fondé au Moyen Âge, sous la protection d'une église ou d'une abbaye" }
      ],
      schema: "histoire-s04-3-s1", prerequis: ["histoire-s04-3-f1"], source: P("Défrichement", U_DEFRICHEMENT)
    },
    {
      id: "histoire-s04-3-f6", notion: "Le village : le château, l'église, les champs",
      titre: "Le village naît autour du château et de l'église",
      texte: "Entre 950 et 1150, les paysans, jusque-là dispersés, se rassemblent. Leurs maisons se serrent autour de deux pôles : le château du seigneur, qui commande et protège, et l'église avec son cimetière, qui réunit tout le monde. Autour s'étendent les champs, les prés et le bois. Les historiens appellent ce regroupement l'encellulement : le village médiéval est né.",
      pointsCles: ["Vers l'an mil (950-1050), les paysans se regroupent ; vers 1150, le mouvement est achevé presque partout", "Deux pôles : le château (commander, protéger) et l'église avec son cimetière (rassembler)", "Pourquoi : après les raids vikings, les villageois se rapprochent des guerriers qui les défendent ; la population augmente", "Autour du village : les champs, les prés, le bois"],
      astuce: "Un village, deux tours : la tour du château et le clocher de l'église.",
      dates: [
        { annee: 1000, evenement: "Vers l'an mil : les paysans se regroupent en villages" }
      ],
      lieux: [], personnages: [],
      vocabulaire: [
        { mot: "encellulement", def: "le regroupement des paysans en villages autour du château et de l'église, vers l'an mil" },
        { mot: "raid", def: "une attaque rapide, menée pour piller" },
        { mot: "pôle", def: "un point central autour duquel les choses se rassemblent" }
      ],
      schema: "histoire-s04-3-s1", prerequis: ["histoire-s04-3-f1"], source: P("Encellulement", U_ENCELLULEMENT)
    }
  ],
  schemas: [
    { id: "histoire-s04-3-s1", legende: "Les campagnes de l'an mil à la Grande peste (frise redessinée d'après le support, complétée par la famine de 1033 de l'étude de cas).", svg: frise() }
  ],
  questions: [
    // f1 : les repères de l'an mil à 1348
    { id: "histoire-s04-3-q1", fiche: "histoire-s04-3-f1", type: "qcm", niveau: 1,
      enonce: "En quelle année la Grande peste frappe-t-elle l'Europe ?",
      choix: ["1348", "1033", "1238", "1000"],
      reponse: "1348",
      explication: "La Grande peste frappe en 1348. C'est le dernier repère du cours sur les campagnes.", source: S6(1) },
    { id: "histoire-s04-3-q2", fiche: "histoire-s04-3-f1", type: "vrai_faux", niveau: 1,
      enonce: "Le village médiéval naît vers l'an mil.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : le village médiéval naît vers l'an mil. La seigneurie banale se développe à la même époque.", source: S6(1) },
    { id: "histoire-s04-3-q3", fiche: "histoire-s04-3-f1", type: "qcm", niveau: 2,
      enonce: "Que se passe-t-il dans les campagnes du XIe au XIIIe siècle, au temps des grands défrichements ?",
      choix: ["La production et la population augmentent", "Les famines et la peste vident les campagnes", "Le village médiéval disparaît", "La seigneurie banale prend fin"],
      reponse: "La production et la population augmentent",
      explication: "Les grands défrichements vont avec un développement économique et démographique. Les campagnes produisent plus et la population augmente.", source: S6(1) },
    { id: "histoire-s04-3-q4", fiche: "histoire-s04-3-f1", type: "vrai_faux", niveau: 2,
      enonce: "La Grande peste a lieu avant les grands défrichements.",
      corrections: ["Faux : la Grande peste (1348) vient après les grands défrichements du XIe au XIIIe siècle.", "Faux : la Grande peste a lieu en même temps que la naissance du village médiéval.", "Faux : la Grande peste a lieu vers l'an mil."],
      reponse: { vrai: false, correction: "Faux : la Grande peste (1348) vient après les grands défrichements du XIe au XIIIe siècle." },
      explication: "Les grands défrichements se font du XIe au XIIIe siècle. La Grande peste arrive ensuite, en 1348.", source: S6(1) },
    { id: "histoire-s04-3-q5", fiche: "histoire-s04-3-f1", type: "qcm_multiple", niveau: 2,
      enonce: "Qu'est-ce qui commence vers l'an mil dans les campagnes ? (plusieurs réponses)",
      choix: ["La naissance du village médiéval", "Le développement de la seigneurie banale", "La Grande peste", "La fin des grands défrichements"],
      reponse: ["La naissance du village médiéval", "Le développement de la seigneurie banale"],
      explication: "Village médiéval et seigneurie banale commencent tous deux vers l'an mil. Les grands défrichements s'achèvent vers 1300 et la peste arrive en 1348.", source: S6(1) },
    { id: "histoire-s04-3-q6", fiche: "histoire-s04-3-f1", type: "qcm", niveau: 2,
      enonce: "Qu'est-ce que la Grande peste de 1348 ?",
      choix: ["Une épidémie qui tue environ un Européen sur trois, parfois plus, en quelques années", "Une famine due à des pluies qui ne s'arrêtent plus pendant trois ans et empêchent de semer", "Une guerre entre les seigneurs et les paysans des villages", "Une maladie qui ne touche que les troupeaux de moutons et de porcs"],
      reponse: "Une épidémie qui tue environ un Européen sur trois, parfois plus, en quelques années",
      explication: "La Grande peste, ou peste noire, arrive en Europe en 1347 et s'y répand jusque vers 1352. Transmise par les puces des rats, elle tue entre 30 et 60 % de la population européenne : des villages entiers se vident.",
      source: T("Peste noire", U_PESTE) },
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
    { id: "histoire-s04-3-q49", fiche: "histoire-s04-3-f1", type: "qcm", niveau: 3,
      enonce: "Par où la Grande peste entre-t-elle en France, à la fin de 1347 ?",
      choix: ["Par Marseille, apportée par des navires venus de Méditerranée", "Par Paris, apportée par des pèlerins", "Par Bouvines, apportée par l'armée de l'empereur", "Par Calais, apportée par les Anglais"],
      reponse: "Par Marseille, apportée par des navires venus de Méditerranée",
      explication: "Des navires partis de Crimée répandent la maladie à Messine, puis à Gênes et à Marseille en novembre 1347. Paris n'est atteinte qu'en août 1348.", indice: "Pense au grand port de la Méditerranée.",
      source: T("Peste noire", U_PESTE) },
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
    // f5 : les grands défrichements (fiche de programme, questions de thème)
    { id: "histoire-s04-3-q33", fiche: "histoire-s04-3-f5", type: "qcm", niveau: 1,
      enonce: "Vers quelle date s'ouvre l'ère des grands défrichements ?",
      choix: ["Vers 1050", "Vers 800", "Vers 1348", "Vers 1500"],
      reponse: "Vers 1050",
      explication: "Dans la plupart des régions, les grands défrichements commencent vers 1050. La forêt recule le plus aux XIIIe et XIVe siècles.",
      source: T("Défrichement", U_DEFRICHEMENT) },
    { id: "histoire-s04-3-q34", fiche: "histoire-s04-3-f5", type: "vrai_faux", niveau: 1,
      enonce: "Un essart est une terre gagnée sur la forêt.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : essarter, c'est arracher les arbres et les broussailles pour faire un champ. Beaucoup de villages s'appellent encore Les Essarts.",
      source: T("Défrichement", U_DEFRICHEMENT) },
    { id: "histoire-s04-3-q35", fiche: "histoire-s04-3-f5", type: "qcm_multiple", niveau: 2,
      enonce: "Qui défriche les forêts du XIe au XIIIe siècle ? (plusieurs réponses)",
      choix: ["Des paysans, qui grignotent la lisière des bois", "Des seigneurs, qui fondent des villages neufs", "Des moines, avec leurs abbayes", "Le calife de Bagdad", "L'empereur byzantin"],
      reponse: ["Des paysans, qui grignotent la lisière des bois", "Des seigneurs, qui fondent des villages neufs", "Des moines, avec leurs abbayes"],
      explication: "Paysans, seigneurs et moines défrichent, chacun à sa manière. Les seigneurs y gagnent des terres et des taxes nouvelles, les moines agrandissent les domaines de leurs abbayes.",
      source: T("Défrichement", U_DEFRICHEMENT) },
    { id: "histoire-s04-3-q36", fiche: "histoire-s04-3-f5", type: "qcm", niveau: 2,
      enonce: "Pourquoi gagne-t-on tant de terres sur la forêt à partir du XIe siècle ?",
      choix: ["Il faut nourrir une population qui augmente", "La forêt a brûlé pendant les invasions", "Le roi l'ordonne à tous les seigneurs", "Les paysans n'ont plus le droit de chasser"],
      reponse: "Il faut nourrir une population qui augmente",
      explication: "Entre le début du Xe siècle et le début du XIVe, la population de l'Occident fait plus que doubler. Pour la nourrir, il faut plus de champs, donc moins de forêt.",
      source: T("Défrichement", U_DEFRICHEMENT) },
    { id: "histoire-s04-3-q37", fiche: "histoire-s04-3-f5", type: "vrai_faux", niveau: 2,
      enonce: "Les outils de fer et la fin des invasions rendent les grands défrichements plus faciles.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : la hache et la bêche de fer se répandent, et les raids ont cessé, ce qui permet de s'installer loin des remparts. De meilleures routes aident aussi.",
      source: T("Défrichement", U_DEFRICHEMENT) },
    { id: "histoire-s04-3-q38", fiche: "histoire-s04-3-f5", type: "qcm", niveau: 2,
      enonce: "Comment s'appellent les villages neufs fondés dans le Sud-Ouest au XIIIe siècle, au temps des défrichements ?",
      choix: ["Des bastides", "Des tenures", "Des cartulaires", "Des califats"],
      reponse: "Des bastides",
      explication: "Les bastides sont des villages neufs du Sud-Ouest, fondés surtout au XIIIe siècle. On parle aussi de sauvetés, placées sous la protection d'une église ou d'une abbaye.",
      source: T("Défrichement", U_DEFRICHEMENT) },
    { id: "histoire-s04-3-q39", fiche: "histoire-s04-3-f5", type: "qcm", niveau: 3,
      enonce: "Au XIVe siècle, la forêt regagne du terrain sur les champs. Pourquoi ?",
      choix: ["La Peste et la guerre ont vidé des villages", "Les seigneurs interdisent de cultiver", "Les paysans ont tous quitté les campagnes pour les villes", "Le climat devient trop chaud"],
      reponse: "La Peste et la guerre ont vidé des villages",
      explication: "Après la Peste de 1348 et pendant la guerre de Cent Ans, des villages sont abandonnés. Les champs les moins bons retournent à la friche et aux arbres.", indice: "Pense aux deux grands malheurs du XIVe siècle.",
      source: T("Défrichement", U_DEFRICHEMENT) },
    { id: "histoire-s04-3-q40", fiche: "histoire-s04-3-f5", type: "trou", niveau: 1,
      enonce: "Complète avec les mots des défrichements.",
      texte: "Du XIe au XIIIe siècle, on gagne des champs sur la ___ ; une terre défrichée s'appelle un ___.",
      banque: ["forêt", "essart", "mer", "cens"],
      reponse: [["forêt"], ["essart"]],
      explication: "Les grands défrichements prennent des champs à la forêt et aux marais. La terre ainsi gagnée est un essart.",
      source: T("Défrichement", U_DEFRICHEMENT) },
    // f6 : le village (fiche de programme, questions de thème)
    { id: "histoire-s04-3-q41", fiche: "histoire-s04-3-f6", type: "qcm", niveau: 1,
      enonce: "Autour de quels deux bâtiments les maisons du village se regroupent-elles vers l'an mil ?",
      choix: ["Le château et l'église", "Le moulin et le four", "La grange et le pressoir", "La cathédrale et l'hôtel de ville"],
      reponse: "Le château et l'église",
      explication: "Le château du seigneur et l'église, avec son cimetière, sont les deux pôles du village. Les maisons se serrent autour d'eux.",
      source: T("Encellulement", U_ENCELLULEMENT) },
    { id: "histoire-s04-3-q42", fiche: "histoire-s04-3-f6", type: "vrai_faux", niveau: 1,
      enonce: "Le village médiéval se forme vers l'an mil, entre 950 et 1150 environ.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : les historiens situent le regroupement des paysans entre 950 et 1050, et il est achevé presque partout vers 1150. Avant, les maisons étaient dispersées.",
      source: T("Encellulement", U_ENCELLULEMENT) },
    { id: "histoire-s04-3-q43", fiche: "histoire-s04-3-f6", type: "qcm", niveau: 2,
      enonce: "Pourquoi les paysans viennent-ils se regrouper près du château ?",
      choix: ["Les guerriers du château les protègent", "Pour payer moins de taxes", "Parce que le roi de France l'a ordonné à tous", "Parce que la forêt a disparu"],
      reponse: "Les guerriers du château les protègent",
      explication: "Après les raids vikings, les villageois se rapprochent des guerriers capables de les défendre. Le château commande et protège, l'église rassemble.",
      source: T("Encellulement", U_ENCELLULEMENT) },
    { id: "histoire-s04-3-q44", fiche: "histoire-s04-3-f6", type: "vrai_faux", niveau: 2,
      enonce: "Au Moyen Âge, chaque seigneurie possède obligatoirement un château.",
      corrections: ["Faux : beaucoup de seigneuries n'ont jamais eu de château, mais toutes ont un seigneur.", "Faux : seules les seigneuries du roi ont un château.", "Faux : les châteaux n'apparaissent qu'après la guerre de Cent Ans."],
      reponse: { vrai: false, correction: "Faux : beaucoup de seigneuries n'ont jamais eu de château, mais toutes ont un seigneur." },
      explication: "Le château est souvent le centre de la seigneurie, mais beaucoup de seigneuries n'en ont jamais eu. Toutes, en revanche, ont un seigneur qui commande.",
      source: T("Seigneurie", U_SEIGNEURIE) },
    { id: "histoire-s04-3-q45", fiche: "histoire-s04-3-f6", type: "qcm_multiple", niveau: 2,
      enonce: "Que trouve-t-on dans un village médiéval et autour de lui ? (plusieurs réponses)",
      choix: ["L'église et son cimetière", "Le château du seigneur", "Les champs et les prés", "Une université", "Un port de mer"],
      reponse: ["L'église et son cimetière", "Le château du seigneur", "Les champs et les prés"],
      explication: "Église, château, champs et prés forment le village et ses terres. L'université et le port appartiennent aux villes.",
      source: T("Encellulement", U_ENCELLULEMENT) },
    { id: "histoire-s04-3-q46", fiche: "histoire-s04-3-f6", type: "qcm", niveau: 2,
      enonce: "Comment les historiens appellent-ils le regroupement des paysans en villages, vers l'an mil ?",
      choix: ["L'encellulement", "Le défrichement", "La banalité", "Le schisme"],
      reponse: "L'encellulement",
      explication: "Le mot encellulement, proposé par l'historien Robert Fossier, désigne ce regroupement autour du château et de l'église. Le défrichement, lui, est la conquête de terres sur la forêt.",
      source: T("Encellulement", U_ENCELLULEMENT) },
    { id: "histoire-s04-3-q47", fiche: "histoire-s04-3-f6", type: "ordre", niveau: 2,
      enonce: "Remets ces moments de l'histoire des campagnes dans l'ordre du temps.",
      elements: ["Les paysans se regroupent en villages (vers l'an mil)", "Les grands défrichements (XIe-XIIIe siècle)", "La Grande peste (1348)", "Les raids vikings (IXe siècle)"],
      reponse: [3, 0, 1, 2],
      explication: "Les raids vikings du IXe siècle précèdent le regroupement des villages vers l'an mil. Puis viennent les défrichements et, en 1348, la Peste.",
      source: T("Encellulement", U_ENCELLULEMENT) },
    { id: "histoire-s04-3-q48", fiche: "histoire-s04-3-f6", type: "qcm", niveau: 3,
      enonce: "Pourquoi les historiens disent-ils que le village médiéval est une « cellule » de la seigneurie ?",
      choix: ["Le seigneur y tient ses habitants rassemblés sous son contrôle", "Parce que chaque maison est minuscule", "Parce que les paysans y sont enfermés la nuit", "Parce que le village est entouré d'un grand mur de pierre"],
      reponse: "Le seigneur y tient ses habitants rassemblés sous son contrôle",
      explication: "Rassemblés autour du château et de l'église, les paysans sont plus faciles à commander, à juger et à taxer. C'est pour cela que l'on parle de cellules.", indice: "Qui commande dans le village ?",
      source: T("Encellulement", U_ENCELLULEMENT) }
  ],
  bonus: [
    {
      id: "histoire-s04-3-b1",
      fiche: "histoire-s04-3-f1",
      titre: "La Grande peste de 1348",
      texte: "La Grande peste, que les historiens appellent aussi peste noire, arrive à Marseille en novembre 1347, à Avignon en janvier 1348 et à Paris en août 1348. Transmise par des puces, que portent notamment les rats noirs, elle tue en cinq ou six ans entre 30 et 60 % des habitants de l'Europe.",
      source: { titre: "Peste noire", editeur: "Wikipédia, l'encyclopédie libre", url: U_PESTE }
    },
    {
      id: "histoire-s04-3-b2",
      fiche: "histoire-s04-3-f5",
      titre: "Des noms de lieux qui racontent les défrichements",
      texte: "La carte de France garde la trace des défricheurs. Les Essarts, Les Sarts dans le Nord, Le Thuit en Normandie, Les Artigues dans le Sud-Ouest, Les Rodes ou Le Rœulx et les villages en -rode d'Alsace et de Lorraine : tous ces noms veulent dire « terre gagnée sur la forêt ». Sauveterre rappelle les villages neufs placés sous protection.",
      source: { titre: "Défrichement", editeur: "Wikipédia, l'encyclopédie libre", url: U_DEFRICHEMENT }
    }
  ],
  nonCouvert: [
    "L'image du village et du château étudiée en classe (arrière-plan, place du château par rapport au village) n'est pas dans le fichier : la fiche f6 la remplace par ce que le programme attend sur la naissance du village.",
    "Les techniques nouvelles des campagnes (charrue, collier d'épaule, assolement triennal, moulins) : elles sont traitées au cours 8 (histoire-s06-1) ; l'assolement triennal n'est jamais interrogé (test de la séance 8).",
    "Ce qu'est la seigneurie banale (le ban, les banalités) : traité au cours 7 (histoire-s05-1).",
    "Les paysages créés par les défrichements (bocage, champs ouverts) et les rendements des terres.",
    "Le rôle de l'Église dans l'encadrement du village (paroisse, dîme) : seulement nommé, sans question (règle sur la religion).",
    "Les douze images du Rustican elles-mêmes (seules leurs légendes sont reprises) et le texte complet de la chronique de Raoul Glaber.",
    "Les réponses rédigées aux neuf questions de l'étude de cas, données pendant la vidéo."
  ]
};
