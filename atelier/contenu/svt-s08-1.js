// Source en clair du cours svt-s08-1 (livret 1, chapitre 3, séance 1 : environnement, biomes, sol).
// Compilé (réponses brouillées) par node atelier/outils/compiler-cours.js svt-s08-1.
// Sources déposées : le corrigé du livret 1, p. 11-12 (le corrigé imprime « Chapitre 2 » par erreur : triangle de
// Holdridge, carte des biomes, carte mentale sur les biomes) et les ressources complémentaires, p. 6-7 (biomes aquatiques)
// et p. 8 (carte des biomes terrestres). La leçon n'est pas déposée : le sol (annoncé par le titre) n'apparaît qu'à la
// séance 2 (coupe de sol, svt-s08-2). Les cartes et schémas ne sont pas repris ; la coupe des biomes marins est
// redessinée en SVG. Doute : les ressources écrivent que les cours d'eau coulent « de l'aval vers l'amont » (p. 6),
// l'inverse de l'usage ; la fiche ne reprend pas ce sens.
const C = (page) => ({ fichier: "cours/svt/Cours Griffon 5eme SVT Livret 1 - Corriges.pdf", page: page });
const R = (page) => ({ fichier: "cours/svt/Cours Griffon 5eme SVT Livret 1 - Ressources complementaires.pdf", page: page });
// Questions de thème (règle du 25/10/2026) : fait vérifié dans une source fiable, notée sans fichier ni page.
const T = (titre, url) => ({ theme: "Séance 1 – Environnement, biomes, sol", titre, editeur: "Wikipédia", url });

// Coupe des biomes marins, de la côte aux grandes fosses (schéma redessiné, profondeurs pas à l'échelle).
function schemaMarin() {
  const encre = "#2e2419";
  let s = "<svg viewBox='0 0 560 300' xmlns='http://www.w3.org/2000/svg' font-family='Georgia,serif' font-size='11'>";
  s += "<rect x='0' y='0' width='560' height='300' fill='#f6f1e7'/>";
  // eau
  s += "<path d='M60 70 H560 V300 H60 Z' fill='#9fd0ea'/>";
  s += "<path d='M60 70 L130 70 L200 150 L330 230 L400 262 L470 262 L500 230 L560 150 V300 H60 Z' fill='#4a93c6'/>";
  s += "<path d='M300 220 L330 230 L400 262 L470 262 L500 230 L430 200 Z' fill='#2b5f8e'/>";
  // fond marin et côte
  s += "<path d='M0 20 L55 70 L130 70 L200 150 L330 230 L400 262 L470 262 L500 230 L560 150 V300 H0 Z' fill='#7a6a4f'/>";
  s += "<path d='M55 70 L130 70 L200 150 L330 230 L400 262 L470 262 L500 230 L560 150' stroke='#4f412c' stroke-width='3' fill='none'/>";
  // fosse abyssale et dorsale
  s += "<path d='M400 262 L420 295 L450 295 L470 262 Z' fill='#1f3b5c'/>";
  s += "<path d='M520 250 Q535 200 550 250 Z' fill='#c25a3c'/>";
  // limites de profondeur
  s += "<g stroke='" + encre + "' stroke-dasharray='4 3' stroke-width='1'><line x1='170' y1='112' x2='560' y2='112'/><line x1='300' y1='200' x2='560' y2='200'/></g>";
  s += "<g fill='" + encre + "' font-size='10'><text x='340' y='124'>− 200 m : limite de la zone néritique</text><text x='305' y='196'>− 1 000 m : plus de végétaux en dessous</text></g>";
  // étiquettes
  s += "<g fill='" + encre + "' font-weight='bold'>";
  s += "<text x='60' y='62'>zone littorale</text>";
  s += "<text x='150' y='92'>zone néritique</text><text x='186' y='106' font-weight='normal' font-size='10'>récifs coralliens, forêts de kelp</text>";
  s += "<text x='330' y='92'>zone pélagique (pleine mer, surface)</text>";
  s += "<text x='250' y='180' fill='#fff'>zone benthique (profondeurs)</text>";
  s += "<text x='380' y='288' fill='#fff' font-size='10'>fosse : biome abyssal</text>";
  s += "<text x='470' y='245' fill='#fff' font-size='10'>fumeurs</text>";
  s += "</g>";
  s += "<text x='6' y='14' fill='" + encre + "' font-size='10'>côte</text>";
  return s + "</svg>";
}

module.exports = {
  id: "svt-s08-1",
  fiches: [
    {
      id: "svt-s08-1-f1", notion: "Qu'est-ce qu'un biome ?",
      titre: "Une vaste zone, un climat, une faune, une flore",
      texte: "Un biome est une vaste zone géographique qui partage un même climat, une flore et une faune semblables. On distingue les biomes terrestres, rangés en quatorze grands biomes, les biomes aquatiques, d'eau douce ou marins, et un biome à part : les terres cultivées, qui montrent le rôle de l'humanité sur les paysages.",
      pointsCles: [
        "Biome : vaste zone au climat, à la flore et à la faune semblables",
        "Quatorze grands biomes terrestres",
        "Biomes aquatiques : eau douce et marins",
        "Terres cultivées : la marque de l'humanité"
      ],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "biome", def: "une vaste zone géographique au climat, à la flore et à la faune semblables" },
        { mot: "flore", def: "l'ensemble des végétaux d'un lieu" },
        { mot: "faune", def: "l'ensemble des animaux d'un lieu" }
      ],
      schema: null, prerequis: ["svt-s04-2-f2"], source: C(12)
    },
    {
      id: "svt-s08-1-f2", notion: "Le triangle de Holdridge",
      titre: "Climat, humidité, altitude",
      texte: "Le triangle de Holdridge range les biomes terrestres selon trois entrées : zone climatique, gradient d'humidité, altitude. Le biome se lit à l'intersection. Un climat tropical très aride donne le désert chaud ; les hautes montagnes très humides, la toundra pluvieuse. Le maquis s'étale sur cinq zones climatiques, et le désert polaire existe aussi en très haute montagne.",
      pointsCles: [
        "Trois entrées : zone climatique, gradient d'humidité, altitude",
        "Tropical + très aride = désert chaud",
        "Hautes montagnes très humides = toundra pluvieuse",
        "Maquis : boréale, tempérée froide, tempérée chaude, subtropicale, tropicale",
        "Désert polaire : aux pôles et en très haute montagne"
      ],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "gradient d'humidité", def: "l'échelle qui va du très aride au très humide" },
        { mot: "aride", def: "très sec, presque sans pluie" },
        { mot: "maquis", def: "un biome présent autour de la Méditerranée et dans le sud de l'Australie" }
      ],
      schema: null, prerequis: ["svt-s08-1-f1"], source: C(11)
    },
    {
      id: "svt-s08-1-f3", notion: "La carte des biomes terrestres",
      titre: "Où sont le maquis, la forêt tropicale et les déserts",
      texte: "Sur la carte, chaque biome a sa couleur, donnée par la légende. Le maquis méditerranéen entoure la Méditerranée et occupe aussi le sud de l'Australie. La plus grande forêt tropicale pluvieuse est en Amérique du Sud, surtout au Brésil : l'Amazonie. Les déserts très secs sont en Afrique (Sahara) et en Asie : Arabie, sud de la Russie, Mongolie.",
      pointsCles: [
        "Lire la légende : une couleur par biome",
        "Maquis méditerranéen : pourtour de la Méditerranée, sud de l'Australie",
        "Forêt tropicale pluvieuse la plus vaste : l'Amazonie (Brésil)",
        "Déserts très secs : Sahara, Arabie, sud de la Russie, Mongolie",
        "Biodiversité maximale : la forêt tropicale humide"
      ],
      dates: [], lieux: ["Méditerranée", "Australie", "Brésil", "Amazonie", "Sahara", "Arabie", "Russie", "Mongolie"], personnages: [],
      vocabulaire: [
        { mot: "biodiversité", def: "la variété des êtres vivants d'un milieu" },
        { mot: "forêt tropicale pluvieuse", def: "une forêt dense des régions chaudes et très arrosées, comme l'Amazonie" }
      ],
      schema: null, prerequis: ["svt-s08-1-f1"], source: C(12)
    },
    {
      id: "svt-s08-1-f4", notion: "Les biomes d'eau douce",
      titre: "Cours d'eau, lacs et terres humides",
      texte: "Les biomes d'eau douce (dulcicoles) ont moins de 1 % de sel. Cours d'eau : du ruisseau, peu profond, rapide, parfois à sec, au grand fleuve, profond et toujours en eau. Lac : le littoral (algues, plantes), la surface (plancton, poissons), les profondeurs (sombres, sédiments). Terres humides : marais, deltas, tourbières, débordant de biodiversité.",
      pointsCles: [
        "Dulcicole : eau douce, moins de 1 % de sel",
        "Ruisseaux et rivières : peu profonds, courant fort, peuvent s'assécher ; fleuves : profonds, toujours en eau",
        "Lac : littoral, surface, profondeurs",
        "Terres humides : marais, deltas, tourbières ; très riches en biodiversité"
      ],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "dulcicole", def: "qui vit dans l'eau douce, ou qui concerne l'eau douce" },
        { mot: "terres humides", def: "des étendues d'eau peu profondes sur des terres plates : marais, deltas, tourbières" },
        { mot: "plancton", def: "les petits êtres vivants qui flottent dans l'eau, végétaux ou animaux" }
      ],
      schema: null, prerequis: ["svt-s08-1-f1"], source: R(6)
    },
    {
      id: "svt-s08-1-f5", notion: "Les biomes marins",
      titre: "De la côte aux grandes fosses",
      texte: "Les biomes marins font 71 % des biomes de la planète. Au rivage, la zone littorale, puis la zone néritique jusqu'à 200 m, avec récifs coralliens et forêts de kelp. En pleine mer, la zone pélagique de surface assure 40 % de la photosynthèse. Dessous, la zone benthique, sombre et pauvre, abrite le biome abyssal et les fumeurs.",
      pointsCles: [
        "71 % des biomes de la planète ; la majorité des espèces marines près des côtes",
        "Zone littorale, puis zone néritique (jusqu'à 200 m) : récifs coralliens, forêts de kelp",
        "Zone pélagique : pleine mer en surface, 40 % de la photosynthèse",
        "Zone benthique : profondeurs sombres, pauvres en vie ; plus de végétaux sous 1 000 m",
        "Biome abyssal (fosses sous 6 000 m) et fumeurs (volcans sous-marins très chauds, pleins de vie)"
      ],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "zone néritique", def: "la partie de la mer proche des côtes, jusqu'à 200 m de profondeur" },
        { mot: "zone pélagique", def: "la pleine mer, en surface, loin des côtes" },
        { mot: "zone benthique", def: "les profondeurs de l'océan, où la lumière n'arrive presque plus" },
        { mot: "fumeur", def: "un volcan sous-marin des dorsales océaniques, très chaud et pourtant plein de vie" }
      ],
      schema: "svt-s08-1-s1", prerequis: ["svt-s08-1-f4"], source: R(7)
    }
  ],
  schemas: [
    { id: "svt-s08-1-s1", legende: "Les biomes marins, de la côte aux grandes fosses (coupe redessinée, profondeurs pas à l'échelle).", svg: schemaMarin() }
  ],
  questions: [
    // f1 : qu'est-ce qu'un biome
    { id: "svt-s08-1-q1", fiche: "svt-s08-1-f1", type: "qcm", niveau: 1,
      enonce: "Qu'est-ce qu'un biome ?",
      choix: ["Une vaste zone qui partage un même climat, une flore et une faune semblables", "Un petit jardin cultivé derrière une maison", "Un seul écosystème, comme une mare", "Une région délimitée par des frontières"],
      reponse: "Une vaste zone qui partage un même climat, une flore et une faune semblables",
      explication: "Un biome est une vaste zone géographique au climat, à la flore et à la faune semblables. Une forêt tropicale ou un désert sont des biomes.", source: C(12) },
    { id: "svt-s08-1-q2", fiche: "svt-s08-1-f1", type: "qcm", niveau: 1,
      enonce: "Combien de grands biomes terrestres distingue-t-on ?",
      choix: ["Quatorze", "Quatre", "Quarante", "Cent"],
      reponse: "Quatorze",
      explication: "Il y a quatorze grands biomes terrestres. Ils se rangent grâce au triangle de Holdridge.", source: C(12) },
    { id: "svt-s08-1-q3", fiche: "svt-s08-1-f1", type: "vrai_faux", niveau: 2,
      enonce: "Les biomes aquatiques comprennent les biomes d'eau douce et les biomes marins.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : d'un côté les biomes d'eau douce, dits dulcicoles, de l'autre les biomes marins. Les terres cultivées forment un biome à part.", source: C(12) },
    { id: "svt-s08-1-q4", fiche: "svt-s08-1-f1", type: "vrai_faux", niveau: 2,
      enonce: "Un biome est une petite zone qui ne dépasse pas la taille d'une ville.",
      corrections: ["Faux : c'est une vaste zone géographique.", "Faux : un biome est toujours une île.", "Faux : un biome est un seul animal."],
      reponse: { vrai: false, correction: "Faux : c'est une vaste zone géographique." },
      explication: "Un biome est une vaste zone : le Sahara ou l'Amazonie, par exemple. Il dépasse de loin une ville.", source: C(12) },
    { id: "svt-s08-1-q5", fiche: "svt-s08-1-f1", type: "qcm_multiple", niveau: 2,
      enonce: "Que partagent les lieux d'un même biome ? (plusieurs réponses)",
      choix: ["Un climat semblable", "Une flore semblable", "Une faune semblable", "La même langue", "Le même nombre d'habitants"],
      reponse: ["Un climat semblable", "Une flore semblable", "Une faune semblable"],
      explication: "Climat, flore et faune : les trois points communs d'un biome. La langue et la population n'ont rien à voir.", source: C(12) },
    { id: "svt-s08-1-q6", fiche: "svt-s08-1-f1", type: "qcm", niveau: 2,
      enonce: "Quel biome traduit le rôle de l'humanité sur les paysages ?",
      choix: ["Le biome des terres cultivées", "Le biome des océans et des mers", "La toundra", "Le désert polaire"],
      reponse: "Le biome des terres cultivées",
      explication: "Les terres cultivées sont un biome façonné par les humains. Les autres sont des biomes naturels.", source: C(12) },
    { id: "svt-s08-1-q7", fiche: "svt-s08-1-f1", type: "qcm", niveau: 3,
      enonce: "Comment range-t-on les biomes terrestres ?",
      choix: ["Grâce au triangle de Holdridge : climat, humidité, altitude", "Par ordre alphabétique", "Par le nombre d'animaux que chaque zone peut nourrir en une année", "Par la couleur du sol"],
      reponse: "Grâce au triangle de Holdridge : climat, humidité, altitude",
      explication: "Le triangle de Holdridge croise la zone climatique, le gradient d'humidité et l'altitude. Chaque case donne un biome.", source: C(12) },
    { id: "svt-s08-1-q8", fiche: "svt-s08-1-f1", type: "association", niveau: 2,
      enonce: "Relie chaque exemple à sa famille de biomes.",
      gauche: ["Forêt tropicale humide", "Lac", "Récif corallien", "Champ de blé"],
      droite: ["Biome marin", "Biome des terres cultivées", "Biome terrestre", "Biome d'eau douce"],
      reponse: [[0, 2], [1, 3], [2, 0], [3, 1]],
      explication: "Forêt sur la terre, lac en eau douce, récif en mer, champ cultivé par l'humain. Quatre familles de biomes.", source: C(12) },
    // f2 : le triangle de Holdridge
    { id: "svt-s08-1-q9", fiche: "svt-s08-1-f2", type: "qcm", niveau: 1,
      enonce: "Quelles sont les trois entrées du triangle de Holdridge ?",
      choix: ["Zone climatique, gradient d'humidité et altitude", "Latitude, longitude et heure de la journée", "Faune, flore et sol", "Pluie, neige et grêle"],
      reponse: "Zone climatique, gradient d'humidité et altitude",
      explication: "Le triangle croise le climat, l'humidité et l'altitude. Le biome se lit à leur intersection.", source: C(12) },
    { id: "svt-s08-1-q10", fiche: "svt-s08-1-f2", type: "qcm", niveau: 1,
      enonce: "Quel biome correspond au climat tropical très aride ?",
      choix: ["Le désert chaud", "La toundra pluvieuse", "Le maquis", "La forêt tropicale humide"],
      reponse: "Le désert chaud",
      explication: "Chaud et presque sans pluie : c'est le désert chaud. La forêt tropicale humide demande au contraire beaucoup d'eau.", source: C(11) },
    { id: "svt-s08-1-q11", fiche: "svt-s08-1-f2", type: "qcm", niveau: 2,
      enonce: "Quel biome trouve-t-on dans les hautes montagnes très humides ?",
      choix: ["La toundra pluvieuse", "Le désert chaud", "La savane herbeuse d'Afrique", "Le désert polaire"],
      reponse: "La toundra pluvieuse",
      explication: "Haute altitude et forte humidité donnent la toundra pluvieuse. Le désert polaire, lui, apparaît en très haute montagne.", source: C(11) },
    { id: "svt-s08-1-q12", fiche: "svt-s08-1-f2", type: "vrai_faux", niveau: 2,
      enonce: "La taïga est une immense forêt de conifères qui couvre le nord du Canada, de l'Europe et de la Russie.",
      corrections: [],
      reponse: { vrai: true, correction: null },
      explication: "La taïga, ou forêt boréale, forme une bande presque continue autour du pôle Nord. C'est la plus grande forêt d'un seul tenant de la planète.",
      source: T("Taïga", "https://fr.wikipedia.org/wiki/Ta%C3%AFga") },
    { id: "svt-s08-1-q13", fiche: "svt-s08-1-f2", type: "vrai_faux", niveau: 2,
      enonce: "Le désert polaire n'existe qu'autour des pôles.",
      corrections: ["Faux : on le trouve aussi en très haute montagne.", "Faux : on le trouve aussi dans le Sahara.", "Faux : il n'existe qu'au pôle Nord."],
      reponse: { vrai: false, correction: "Faux : on le trouve aussi en très haute montagne." },
      explication: "Le désert polaire existe en zone polaire, mais aussi en très haute montagne. Le froid de l'altitude vaut celui des pôles.", source: C(11) },
    { id: "svt-s08-1-q14", fiche: "svt-s08-1-f2", type: "qcm_multiple", niveau: 3,
      enonce: "Lesquels sont des biomes terrestres ? (plusieurs réponses)",
      choix: ["La toundra", "La taïga", "La savane", "Le désert", "Le récif corallien", "Le lac"],
      reponse: ["La toundra", "La taïga", "La savane", "Le désert"],
      explication: "Toundra, taïga, savane et désert sont des biomes des continents. Le récif corallien et le lac sont des biomes aquatiques, d'eau de mer pour l'un, d'eau douce pour l'autre.",
      source: T("Biome", "https://fr.wikipedia.org/wiki/Biome") },
    { id: "svt-s08-1-q15", fiche: "svt-s08-1-f2", type: "qcm", niveau: 3,
      enonce: "Pourquoi le désert polaire apparaît-il aussi en très haute montagne ?",
      choix: ["Parce que le triangle de Holdridge tient compte aussi de l'altitude", "Parce que la neige y est salée", "Parce qu'il y pleut beaucoup", "Parce que toutes les très hautes montagnes se trouvent près des pôles"],
      reponse: "Parce que le triangle de Holdridge tient compte aussi de l'altitude",
      explication: "Le triangle a trois entrées : zone climatique, gradient d'humidité et altitude. En très haute montagne, on tombe sur le désert polaire, comme en zone polaire.", source: C(11) },
    // f3 : la carte des biomes terrestres
    { id: "svt-s08-1-q17", fiche: "svt-s08-1-f3", type: "qcm", niveau: 1,
      enonce: "Où se trouve la plus grande forêt tropicale pluvieuse du monde ?",
      choix: ["En Amérique du Sud, surtout au Brésil", "En Europe", "En Australie, tout le long de la côte sud", "Au Sahara"],
      reponse: "En Amérique du Sud, surtout au Brésil",
      explication: "La plus grande forêt tropicale pluvieuse est en Amérique du Sud, surtout au Brésil. C'est la forêt amazonienne.", source: C(12) },
    { id: "svt-s08-1-q18", fiche: "svt-s08-1-f3", type: "qcm", niveau: 1,
      enonce: "Comment s'appelle cette immense forêt d'Amérique du Sud ?",
      choix: ["La forêt amazonienne", "La forêt de kelp des zones tempérées", "La forêt noire", "La taïga"],
      reponse: "La forêt amazonienne",
      explication: "C'est la forêt amazonienne. La forêt de kelp, elle, est faite de végétaux marins.", source: C(12) },
    { id: "svt-s08-1-q19", fiche: "svt-s08-1-f3", type: "vrai_faux", niveau: 1,
      enonce: "On trouve du maquis méditerranéen en Australie.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : le maquis méditerranéen existe autour de la Méditerranée, mais aussi dans le sud-ouest et le sud de l'Australie. Même biome, deux continents.", source: C(12) },
    { id: "svt-s08-1-q20", fiche: "svt-s08-1-f3", type: "vrai_faux", niveau: 2,
      enonce: "Le Sahara est une forêt tropicale.",
      corrections: ["Faux : c'est un désert très sec, en Afrique.", "Faux : c'est une toundra.", "Faux : c'est un maquis méditerranéen."],
      reponse: { vrai: false, correction: "Faux : c'est un désert très sec, en Afrique." },
      explication: "Le Sahara est le grand désert très sec de l'Afrique. Il apparaît en marron sur la carte.", source: C(12) },
    { id: "svt-s08-1-q21", fiche: "svt-s08-1-f3", type: "qcm_multiple", niveau: 2,
      enonce: "Où trouve-t-on des déserts très secs ? (plusieurs réponses)",
      choix: ["Au Sahara, en Afrique", "Dans le désert d'Arabie", "Dans le sud de la Russie", "En Mongolie", "Au Brésil", "Autour de la Méditerranée"],
      reponse: ["Au Sahara, en Afrique", "Dans le désert d'Arabie", "Dans le sud de la Russie", "En Mongolie"],
      explication: "Sahara, Arabie, sud de la Russie et Mongolie : des déserts très secs en Afrique et en Asie. Le Brésil a la forêt amazonienne, la Méditerranée le maquis.", source: C(12) },
    { id: "svt-s08-1-q22", fiche: "svt-s08-1-f3", type: "qcm", niveau: 2,
      enonce: "Quel biome possède la biodiversité la plus grande ?",
      choix: ["La forêt tropicale humide", "Le désert polaire", "Le maquis du pourtour méditerranéen", "La toundra"],
      reponse: "La forêt tropicale humide",
      explication: "La forêt tropicale humide abrite la biodiversité maximale. Les déserts et la toundra en ont très peu.", source: C(12) },
    { id: "svt-s08-1-q23", fiche: "svt-s08-1-f3", type: "association", niveau: 3,
      enonce: "Relie chaque biome à une région où on le trouve.",
      gauche: ["Maquis méditerranéen", "Forêt tropicale pluvieuse", "Désert très sec", "Toundra"],
      droite: ["Sahara et Mongolie", "Nord de l'Europe", "Pourtour de la Méditerranée et sud de l'Australie", "Amazonie, au Brésil"],
      reponse: [[0, 2], [1, 3], [2, 0], [3, 1]],
      explication: "Chaque biome a ses régions : maquis autour de la Méditerranée, forêt pluvieuse en Amazonie, déserts au Sahara et en Mongolie. La toundra, elle, couvre le nord de l'Europe.", source: C(12) },
    // f4 : les biomes d'eau douce
    { id: "svt-s08-1-q25", fiche: "svt-s08-1-f4", type: "qcm", niveau: 1,
      enonce: "Comment appelle-t-on les biomes d'eau douce ?",
      choix: ["Dulcicoles", "Marins", "Pélagiques", "Abyssaux"],
      reponse: "Dulcicoles",
      explication: "Les biomes d'eau douce sont dits dulcicoles. Les trois autres mots concernent la mer.", source: R(6) },
    { id: "svt-s08-1-q26", fiche: "svt-s08-1-f4", type: "qcm", niveau: 2,
      enonce: "Qu'est-ce qui distingue un ruisseau d'un grand fleuve ?",
      choix: ["Le ruisseau est peu profond, à courant fort, et peut s'assécher", "Le ruisseau est plus profond", "Le fleuve a un courant plus fort et s'assèche chaque été, au mois d'août", "Le ruisseau est toujours en eau"],
      reponse: "Le ruisseau est peu profond, à courant fort, et peut s'assécher",
      explication: "Ruisseaux et rivières sont peu profonds, rapides et parfois à sec. Les fleuves sont profonds, plus calmes et toujours en eau.", source: R(6) },
    { id: "svt-s08-1-q27", fiche: "svt-s08-1-f4", type: "vrai_faux", niveau: 1,
      enonce: "Dans un lac, la surface éclairée est riche en plancton et en poissons.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : la lumière pénètre la surface du lac, qui est riche en plancton et en poissons. Les profondeurs, sombres, sont surtout riches en sédiments.", source: R(6) },
    { id: "svt-s08-1-q28", fiche: "svt-s08-1-f4", type: "vrai_faux", niveau: 2,
      enonce: "Les profondeurs d'un lac sont l'espace le plus riche en algues.",
      corrections: ["Faux : les profondeurs reçoivent peu de lumière et sont surtout riches en sédiments.", "Faux : les profondeurs d'un lac sont toujours gelées.", "Faux : les profondeurs sont riches en coraux."],
      reponse: { vrai: false, correction: "Faux : les profondeurs reçoivent peu de lumière et sont surtout riches en sédiments." },
      explication: "Les algues et les plantes aquatiques poussent sur le littoral, bien éclairé. Au fond, la lumière manque et les sédiments s'accumulent.", source: R(6) },
    { id: "svt-s08-1-q30", fiche: "svt-s08-1-f4", type: "qcm_multiple", niveau: 2,
      enonce: "Lesquels sont des terres humides ? (plusieurs réponses)",
      choix: ["Les marais", "Les deltas", "Les tourbières", "Les ruisseaux", "Les récifs coralliens"],
      reponse: ["Les marais", "Les deltas", "Les tourbières"],
      explication: "Marais, deltas et tourbières sont des étendues d'eau peu profondes sur des terres plates. Les ruisseaux sont des cours d'eau, les récifs des biomes marins.", source: R(6) },
    { id: "svt-s08-1-q31", fiche: "svt-s08-1-f4", type: "qcm", niveau: 3,
      enonce: "Pourquoi un ruisseau et un fleuve abritent-ils des êtres vivants différents ?",
      choix: ["Parce que leur profondeur et leur courant diffèrent", "Parce que l'eau du fleuve est salée", "Parce que le ruisseau coule toujours en montagne, loin des villes", "Parce que le fleuve est plus froid"],
      reponse: "Parce que leur profondeur et leur courant diffèrent",
      explication: "Peu profond et rapide d'un côté, profond et calme de l'autre : ces conditions très différentes attirent une flore et une faune différentes. L'eau reste douce dans les deux cas.", source: R(6) },
    { id: "svt-s08-1-q32", fiche: "svt-s08-1-f4", type: "qcm", niveau: 2,
      enonce: "Quelle quantité de sel contient l'eau des biomes dulcicoles ?",
      choix: ["Moins de 1 %", "Plus de 10 %", "Environ 3,5 %, comme la mer", "Aucun sel du tout"],
      reponse: "Moins de 1 %",
      explication: "L'eau douce contient moins de 1 % de sel. Ce n'est pas zéro, mais bien moins que la mer.", source: R(6) },
    // f5 : les biomes marins
    { id: "svt-s08-1-q33", fiche: "svt-s08-1-f5", type: "qcm", niveau: 1,
      enonce: "Quelle part des biomes de la planète les biomes marins représentent-ils ?",
      choix: ["71 %", "7 %", "25 %", "99 %"],
      reponse: "71 %",
      explication: "Les biomes marins font 71 % des biomes de la planète. Ils comptent énormément dans la biodiversité de la Terre.", source: R(6) },
    { id: "svt-s08-1-q34", fiche: "svt-s08-1-f5", type: "qcm", niveau: 1,
      enonce: "Où vit l'immense majorité des espèces marines ?",
      choix: ["Près des côtes", "En pleine mer, en surface", "Dans les fosses abyssales", "Près des fumeurs"],
      reponse: "Près des côtes",
      explication: "La plupart des espèces marines se concentrent près des côtes, dans la zone néritique. Les fosses abyssales n'en abritent que très peu.", source: R(7) },
    { id: "svt-s08-1-q35", fiche: "svt-s08-1-f5", type: "ordre", niveau: 2,
      enonce: "Range ces zones marines de la côte vers les grandes profondeurs.",
      elements: ["Zone benthique", "Zone littorale", "Zone abyssale", "Zone néritique"],
      reponse: [1, 3, 0, 2],
      explication: "Littorale au rivage, néritique jusqu'à 200 m, benthique dans les profondeurs, abyssale dans les fosses. Plus on descend, moins il y a de lumière.", source: R(7) },
    { id: "svt-s08-1-q36", fiche: "svt-s08-1-f5", type: "vrai_faux", niveau: 2,
      enonce: "La zone pélagique, en pleine mer et en surface, réalise une grande part de la photosynthèse de la planète.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : la zone pélagique assure 40 % de la photosynthèse totale de la planète. La lumière y est abondante.", source: R(7) },
    { id: "svt-s08-1-q37", fiche: "svt-s08-1-f5", type: "vrai_faux", niveau: 2,
      enonce: "Le biome abyssal, dans les grandes fosses, est le plus riche en espèces.",
      corrections: ["Faux : très peu d'espèces y vivent, adaptées au froid et à l'énorme pression.", "Faux : aucun être vivant n'y survit.", "Faux : il est riche en coraux et en forêts de kelp."],
      reponse: { vrai: false, correction: "Faux : très peu d'espèces y vivent, adaptées au froid et à l'énorme pression." },
      explication: "Sous 6 000 m, il fait froid et la pression est colossale. Seules quelques espèces adaptées y vivent.", source: R(7) },
    { id: "svt-s08-1-q38", fiche: "svt-s08-1-f5", type: "qcm", niveau: 2,
      enonce: "Où trouve-t-on les récifs coralliens ?",
      choix: ["Dans la zone néritique, surtout en zone intertropicale", "Dans les fosses abyssales", "Près des fumeurs", "En pleine mer, loin des côtes, à la surface de l'océan"],
      reponse: "Dans la zone néritique, surtout en zone intertropicale",
      explication: "Les récifs coralliens poussent près des côtes, dans la zone néritique, surtout entre les tropiques. Les forêts de kelp occupent la même zone en région tempérée.", source: R(7) },
    { id: "svt-s08-1-q39", fiche: "svt-s08-1-f5", type: "qcm", niveau: 3,
      enonce: "Pourquoi y a-t-il de moins en moins de végétaux quand on descend dans l'océan ?",
      choix: ["Parce que la lumière du Soleil pénètre de moins en moins", "Parce que l'eau devient douce", "Parce que les poissons les mangent", "Parce que l'eau est de plus en plus chaude quand on descend"],
      reponse: "Parce que la lumière du Soleil pénètre de moins en moins",
      explication: "Sans lumière, pas de photosynthèse, donc pas de végétaux. En dessous de 1 000 m, il n'y en a plus du tout.", source: R(7) },
    { id: "svt-s08-1-q40", fiche: "svt-s08-1-f5", type: "qcm", niveau: 3,
      enonce: "Qu'est-ce qu'un « fumeur » ?",
      choix: ["Un volcan sous-marin très chaud, plein de vie", "Un courant d'eau chaude à la surface de l'océan", "Un poisson des abysses", "Un nuage de cendres au-dessus de la mer, après une éruption"],
      reponse: "Un volcan sous-marin très chaud, plein de vie",
      explication: "Les fumeurs sont des volcans sous-marins des dorsales océaniques. Malgré la chaleur et la pression, des espèces très particulières y vivent en nombre.", source: R(7) }
  ],
  bonus: [
    {
      id: "svt-s08-1-b1", fiche: "svt-s08-1-f3",
      titre: "L'Amazonie en chiffres",
      texte: "La forêt amazonienne couvre environ 5,5 millions de km², sur neuf pays ; le Brésil en possède environ 63 %. Elle abriterait 390 milliards d'arbres de quelque 16 000 espèces, environ 2 200 espèces de poissons et près de 1 300 espèces d'oiseaux. On l'appelle parfois « poumon de la Terre », mais l'expression est trompeuse : les océans produisent bien plus de dioxygène qu'elle.",
      source: { titre: "Forêt amazonienne", editeur: "Wikipédia, l'encyclopédie libre", url: "https://fr.wikipedia.org/wiki/For%C3%AAt_amazonienne" }
    }
  ],
  nonCouvert: [
    "La leçon de la séance 1 n'est pas déposée : la notion d'environnement et la définition du sol, annoncées par le titre, ne sont pas dans le jeu (le sol est abordé à la séance 2 avec la coupe de sol).",
    "La liste complète des quatorze grands biomes terrestres : la carte mentale ne cite que quelques exemples (désert très sec, désert polaire, forêt tropicale humide, biome méditerranéen).",
    "Le triangle de Holdridge lui-même n'est pas reproduit : seuls les exemples lus dans le corrigé sont repris.",
    "Le sens du courant des cours d'eau : les ressources écrivent « de l'aval vers l'amont », à faire vérifier ; la fiche n'en parle pas.",
    "Les pourcentages d'espèces par zone marine du schéma des ressources (p. 7) ne sont pas repris, à part les deux de la carte mentale (90 % des espèces marines dans la zone néritique, 40 % de la photosynthèse dans la zone pélagique)."
  ]
};
