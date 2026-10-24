// Source en clair du cours histoire-s05-1 « Cours 7 – La seigneurie ».
// Compilé (réponses brouillées) par node atelier/outils/compiler-cours.js histoire-s05-1.
// Sources : le support de la séance 7 (une page : la frise des campagnes et trois questions sur une enluminure
// absente du fichier) et l'étude de cas 2 « L'organisation d'une seigneurie : la seigneurie de Wismes » (plan du
// XIVe siècle, droits du seigneur d'après un cartulaire de 1238, banalités, texte de Verson). Le calendrier des
// redevances de Verson est traité au cours suivant (histoire-s05-2). La leçon est donnée en vidéo : voir nonCouvert.
const FW = "cours/histoire/Histoire 5e - Moyen Age - Etude de cas 2 Seigneurie de Wismes.pdf";
const F7 = "cours/histoire/Histoire 5e - Seance 7 - Support.pdf";
const SW = p => ({ fichier: FW, page: p });
const S7 = p => ({ fichier: F7, page: p });

// Schéma d'une seigneurie, redessiné et simplifié (aucune image reprise) : réserve, tenures, château, église,
// moulin, four, pressoir, forêt.
function plan() {
  const encre = "#2e2419";
  let s = "<svg viewBox='0 0 540 300' xmlns='http://www.w3.org/2000/svg' font-family='Georgia,serif' font-size='11'>";
  s += "<rect x='0' y='0' width='540' height='300' fill='#efe6d2'/>";
  // rivière
  s += "<path d='M0 215 C 120 190, 200 250, 320 225 S 480 200, 540 230' fill='none' stroke='#7fb4d6' stroke-width='14'/>";
  // forêt
  for (let i = 0; i < 14; i++) {
    const cx = 400 + (i % 5) * 26 + (Math.floor(i / 5) % 2) * 13, cy = 40 + Math.floor(i / 5) * 24;
    s += "<circle cx='" + cx + "' cy='" + cy + "' r='12' fill='#3f6b3a'/>";
  }
  s += "<text x='460' y='118' text-anchor='middle' fill='" + encre + "'>Forêt du seigneur</text>";
  s += "<text x='460' y='131' text-anchor='middle' font-size='9' fill='" + encre + "'>(bois, chasse)</text>";
  // réserve autour du château
  s += "<rect x='150' y='40' width='200' height='110' fill='#d9c77a' stroke='#8a7a3a'/>";
  s += "<text x='250' y='58' text-anchor='middle' fill='" + encre + "'>Réserve du seigneur</text>";
  // château
  s += "<rect x='225' y='80' width='50' height='40' fill='#8c7b6b' stroke='" + encre + "'/>";
  s += "<rect x='220' y='70' width='12' height='18' fill='#8c7b6b' stroke='" + encre + "'/><rect x='268' y='70' width='12' height='18' fill='#8c7b6b' stroke='" + encre + "'/>";
  s += "<text x='250' y='138' text-anchor='middle' fill='" + encre + "'>Château</text>";
  // tenures (petites parcelles)
  const couleurs = ["#b7c98a", "#c9b982", "#a6c27a", "#d0c48c"];
  for (let i = 0; i < 12; i++) {
    const x = 20 + (i % 4) * 30, y = 40 + Math.floor(i / 4) * 32;
    s += "<rect x='" + x + "' y='" + y + "' width='26' height='28' fill='" + couleurs[i % 4] + "' stroke='#7a7a4a'/>";
  }
  s += "<text x='78' y='150' text-anchor='middle' fill='" + encre + "'>Tenures des paysans</text>";
  for (let i = 0; i < 8; i++) {
    const x = 160 + (i % 4) * 30, y = 160 + Math.floor(i / 4) * 24;
    s += "<rect x='" + x + "' y='" + y + "' width='26' height='20' fill='" + couleurs[(i + 1) % 4] + "' stroke='#7a7a4a'/>";
  }
  s += "<text x='220' y='200' font-size='9' fill='" + encre + "'>Tenures</text>";
  // village et église
  s += "<rect x='30' y='172' width='14' height='10' fill='#c8742a'/><rect x='50' y='170' width='14' height='12' fill='#c8742a'/><rect x='70' y='173' width='14' height='9' fill='#c8742a'/>";
  s += "<rect x='96' y='165' width='16' height='18' fill='#d9d2c0' stroke='" + encre + "'/><rect x='101' y='152' width='6' height='14' fill='#d9d2c0' stroke='" + encre + "'/>";
  s += "<text x='70' y='198' text-anchor='middle' fill='" + encre + "'>Village et église</text>";
  // moulin sur la rivière
  s += "<rect x='300' y='196' width='18' height='22' fill='#8c7b6b' stroke='" + encre + "'/>";
  s += "<circle cx='300' cy='222' r='9' fill='none' stroke='" + encre + "' stroke-width='2'/>";
  s += "<text x='309' y='250' text-anchor='middle' fill='" + encre + "'>Moulin du seigneur</text>";
  // four et pressoir
  s += "<path d='M120 232 a10 10 0 0 1 20 0 v8 h-20z' fill='#a0522d' stroke='" + encre + "'/>";
  s += "<text x='130' y='256' text-anchor='middle' fill='" + encre + "'>Four</text>";
  s += "<rect x='190' y='228' width='22' height='12' fill='#7a5a3a' stroke='" + encre + "'/><rect x='198' y='218' width='6' height='10' fill='#7a5a3a'/>";
  s += "<text x='201' y='256' text-anchor='middle' fill='" + encre + "'>Pressoir</text>";
  // légende
  s += "<rect x='20' y='272' width='12' height='10' fill='#d9c77a' stroke='#8a7a3a'/><text x='38' y='281' fill='" + encre + "'>réserve : terres gardées par le seigneur</text>";
  s += "<rect x='280' y='272' width='12' height='10' fill='#b7c98a' stroke='#7a7a4a'/><text x='298' y='281' fill='" + encre + "'>tenures : terres cédées aux paysans (cens, corvées)</text>";
  return s + "</svg>";
}

module.exports = {
  id: "histoire-s05-1",
  fiches: [
    {
      id: "histoire-s05-1-f1", notion: "La seigneurie : tenures et réserve",
      titre: "Deux parties : les tenures des paysans, la réserve du seigneur",
      texte: "Une seigneurie a deux parties. Les tenures sont des terres que le seigneur cède aux paysans. En échange, ceux-ci lui paient une taxe, le cens, et lui doivent des corvées, c'est-à-dire des travaux gratuits. La réserve, elle, regroupe les terres que le seigneur garde pour lui. La frise place le développement de la seigneurie banale vers l'an mil.",
      pointsCles: ["Tenures : terres cédées aux paysans par le seigneur", "Contre une tenure : le cens (taxe) et des corvées (travaux gratuits)", "Réserve : terres que le seigneur garde pour son usage", "Frise : la seigneurie banale se développe vers l'an mil"],
      astuce: "Tenure : le paysan la « tient » du seigneur. Réserve : le seigneur se la « réserve ».",
      dates: [],
      lieux: ["Wismes"], personnages: [],
      vocabulaire: [
        { mot: "tenure", def: "une terre que le seigneur cède à un paysan, contre le cens et des corvées" },
        { mot: "réserve", def: "les terres que le seigneur garde pour son usage personnel" },
        { mot: "cens", def: "la taxe que le paysan paie au seigneur pour sa tenure" },
        { mot: "corvée", def: "un travail gratuit que le paysan doit faire pour le seigneur" }
      ],
      schema: "histoire-s05-1-s1", prerequis: ["histoire-s04-3-f1"], source: SW(1)
    },
    {
      id: "histoire-s05-1-f2", notion: "Les droits du seigneur : forêt, chasse, justice",
      titre: "Le cartulaire de Wismes (1238) : ce que le seigneur s'accorde",
      texte: "En 1238, le seigneur de Wismes fait écrire ses droits dans un cartulaire, qu'il signe de son sceau. Il rappelle qu'il peut prendre du bois dans sa forêt, pour bâtir ou se chauffer, et y chasser. Il affirme aussi son droit de rendre la justice pour toutes les affaires de sa seigneurie, des plus graves au simple vol.",
      pointsCles: ["1238 : un cartulaire rappelle les droits du seigneur de Wismes", "Droit de prendre le bois de sa forêt (construction, chauffage) et d'y chasser", "Droit de rendre la justice sur toutes les affaires de la seigneurie", "Le texte est signé du sceau du seigneur"],
      dates: [
        { annee: 1238, evenement: "Cartulaire des droits du seigneur de Wismes" }
      ],
      lieux: ["Wismes"], personnages: [],
      vocabulaire: [
        { mot: "cartulaire", def: "un recueil où une seigneurie fait copier ses actes et ses droits" },
        { mot: "sceau", def: "une marque pressée dans la cire qui authentifie un texte, comme une signature" },
        { mot: "rendre la justice", def: "juger les affaires et punir les coupables" }
      ],
      schema: null, prerequis: ["histoire-s05-1-f1"], source: SW(1)
    },
    {
      id: "histoire-s05-1-f3", notion: "Les banalités : moulin, four, pressoir",
      titre: "Payer pour moudre, cuire et presser",
      texte: "Les banalités sont des taxes que les paysans paient pour se servir du moulin, du four ou du pressoir, qui appartiennent au seigneur. Au moulin, le meunier du seigneur garde un boisseau de grain et de la farine quand il moud le grain d'un vilain. Au four, on paie un droit pour faire cuire son pain.",
      pointsCles: ["Banalités : taxes pour utiliser le moulin, le four ou le pressoir du seigneur", "Au moulin : le meunier prélève un boisseau de grain et de la farine", "Au four : un droit sur la cuisson du pain"],
      astuce: "Trois B : les Banalités, c'est payer pour moudre le Blé, cuire le pain et presser le raisin.",
      dates: [],
      lieux: [], personnages: [],
      vocabulaire: [
        { mot: "banalités", def: "les taxes dues au seigneur pour utiliser son moulin, son four ou son pressoir" },
        { mot: "boisseau", def: "une ancienne mesure de grain, à peu près le contenu d'un seau" },
        { mot: "pressoir", def: "l'appareil qui écrase le raisin pour en tirer le jus" }
      ],
      schema: "histoire-s05-1-s1", prerequis: ["histoire-s05-1-f1"], source: SW(1)
    },
    {
      id: "histoire-s05-1-f4", notion: "Le plan de la seigneurie de Wismes (XIVe siècle)",
      titre: "Château, église, moulin, tenures : lire le plan de Wismes",
      texte: "Le plan de la seigneurie de Wismes, dans le nord de la France, date du XIVe siècle. On y voit le château du seigneur et l'église du village, le moulin du seigneur près de l'eau, la réserve et, à plusieurs endroits, les tenures des paysans. Un gibet rappelle que le seigneur rend la justice.",
      pointsCles: ["Wismes : une seigneurie du nord de la France", "Un plan du XIVe siècle", "Sur le plan : château, église, moulin du seigneur, réserve, tenures", "Le gibet : signe du droit de justice du seigneur"],
      dates: [],
      lieux: ["Wismes", "nord de la France"], personnages: [],
      vocabulaire: [
        { mot: "gibet", def: "la potence où le seigneur faisait exécuter les condamnés ; sur le plan, elle rappelle son droit de justice" }
      ],
      schema: "histoire-s05-1-s1", prerequis: ["histoire-s05-1-f1", "histoire-s05-1-f2"], source: SW(1)
    }
  ],
  schemas: [
    { id: "histoire-s05-1-s1", legende: "Schéma d'une seigneurie, redessiné et simplifié d'après le plan de Wismes : la réserve autour du château, les tenures des paysans, le village et son église, la forêt, le moulin, le four et le pressoir du seigneur.", svg: plan() }
  ],
  questions: [
    // f1 : tenures et réserve
    { id: "histoire-s05-1-q1", fiche: "histoire-s05-1-f1", type: "qcm", niveau: 1,
      enonce: "Comment appelle-t-on les terres que le seigneur garde pour son usage personnel ?",
      choix: ["La réserve", "Les tenures", "Les banalités", "Le cens"],
      reponse: "La réserve",
      explication: "La réserve est la partie que le seigneur garde pour lui. Les tenures, elles, sont cédées aux paysans.", source: SW(1) },
    { id: "histoire-s05-1-q2", fiche: "histoire-s05-1-f1", type: "vrai_faux", niveau: 1,
      enonce: "Les tenures sont les terres que le seigneur cède aux paysans.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : une tenure est cédée à un paysan. En échange, il paie le cens et fait des corvées.", source: SW(1) },
    { id: "histoire-s05-1-q3", fiche: "histoire-s05-1-f1", type: "qcm", niveau: 2,
      enonce: "Que doit un paysan au seigneur en échange de sa tenure ?",
      choix: ["Le cens et des corvées", "Un pourceau sur huit seulement", "Rien du tout", "La garde du château"],
      reponse: "Le cens et des corvées",
      explication: "La tenure se paie par une taxe, le cens, et par des corvées. Ces travaux gratuits se font pour le seigneur.", source: SW(1) },
    { id: "histoire-s05-1-q4", fiche: "histoire-s05-1-f1", type: "vrai_faux", niveau: 2,
      enonce: "La réserve est cultivée par les paysans pour nourrir leurs propres familles.",
      corrections: ["Faux : la réserve est gardée par le seigneur pour son usage ; les paysans vivent de leurs tenures.", "Faux : la réserve est la forêt où le seigneur chasse.", "Faux : la réserve est le moulin du seigneur."],
      reponse: { vrai: false, correction: "Faux : la réserve est gardée par le seigneur pour son usage ; les paysans vivent de leurs tenures." },
      explication: "La réserve appartient au seigneur et sert à son usage personnel. Les paysans cultivent pour eux les tenures qu'il leur a cédées.", source: SW(1) },
    { id: "histoire-s05-1-q5", fiche: "histoire-s05-1-f1", type: "qcm", niveau: 2,
      enonce: "Pourquoi dit-on que les corvées sont des travaux gratuits ?",
      choix: ["Les paysans les font sans être payés", "Le seigneur les paie avec du blé de sa réserve", "Elles ne durent qu'un seul jour", "Elles se font seulement le dimanche"],
      reponse: "Les paysans les font sans être payés",
      explication: "Une corvée est un travail dû au seigneur, sans salaire. C'est une des charges qui pèsent sur la tenure.", source: SW(1) },
    { id: "histoire-s05-1-q6", fiche: "histoire-s05-1-f1", type: "association", niveau: 2,
      enonce: "Relie chaque mot de la seigneurie à sa définition.",
      gauche: ["Tenure", "Réserve", "Cens", "Corvée"],
      droite: ["Travail gratuit dû au seigneur", "Terre gardée par le seigneur pour lui", "Taxe payée pour une tenure", "Terre cédée à un paysan par le seigneur"],
      reponse: [[0, 3], [1, 1], [2, 2], [3, 0]],
      explication: "Tenure : terre du paysan ; réserve : terre du seigneur. Le cens est la taxe, la corvée le travail gratuit.", source: SW(1) },
    { id: "histoire-s05-1-q7", fiche: "histoire-s05-1-f1", type: "qcm", niveau: 3,
      enonce: "Un paysan de Wismes cultive un champ que le seigneur lui a cédé et paie chaque année une taxe pour ce champ. Comment s'appellent ce champ et cette taxe ?",
      choix: ["Une tenure et le cens", "La réserve et le cens", "Une tenure et la banalité", "La réserve et la corvée"],
      reponse: "Une tenure et le cens",
      explication: "Un champ cédé à un paysan est une tenure. La taxe qu'il paie pour elle est le cens.", indice: "La réserve n'est jamais cédée : le seigneur la garde.", source: SW(1) },
    { id: "histoire-s05-1-q8", fiche: "histoire-s05-1-f1", type: "qcm", niveau: 1,
      enonce: "À quelle époque la frise du cours place-t-elle le développement de la seigneurie banale ?",
      choix: ["Vers l'an mil", "En 1348", "Au XVe siècle", "Vers 1450"],
      reponse: "Vers l'an mil",
      explication: "La frise place la seigneurie banale vers l'an mil, en même temps que la naissance du village médiéval. 1348 est l'année de la Grande peste.", source: S7(1) },
    { id: "histoire-s05-1-q9", fiche: "histoire-s05-1-f1", type: "vrai_faux", niveau: 3,
      enonce: "Un paysan qui laboure gratuitement la réserve du seigneur fait une corvée.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : un travail gratuit dû au seigneur est une corvée. Labourer sa réserve en est un exemple.", source: SW(1) },
    // f2 : les droits du seigneur
    { id: "histoire-s05-1-q10", fiche: "histoire-s05-1-f2", type: "qcm", niveau: 1,
      enonce: "En quelle année le seigneur de Wismes rappelle-t-il ses droits dans un cartulaire ?",
      choix: ["1238", "1348", "1033", "1214"],
      reponse: "1238",
      explication: "Le cartulaire de Wismes date de 1238. 1348 est la Grande peste, 1033 la famine racontée par Raoul Glaber.", source: SW(1) },
    { id: "histoire-s05-1-q11", fiche: "histoire-s05-1-f2", type: "vrai_faux", niveau: 1,
      enonce: "Le seigneur de Wismes a le droit de rendre la justice dans sa seigneurie.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : il affirme ce droit dans le cartulaire de 1238. Il juge toutes les affaires de sa seigneurie.", source: SW(1) },
    { id: "histoire-s05-1-q12", fiche: "histoire-s05-1-f2", type: "qcm_multiple", niveau: 2,
      enonce: "Quels droits le seigneur de Wismes rappelle-t-il dans son cartulaire ? (plusieurs réponses)",
      choix: ["Prendre du bois dans sa forêt", "Chasser dans sa forêt", "Rendre la justice", "Élire le roi", "Battre monnaie"],
      reponse: ["Prendre du bois dans sa forêt", "Chasser dans sa forêt", "Rendre la justice"],
      explication: "Le bois, la chasse et la justice sont les droits rappelés. Élire un roi ou fabriquer de la monnaie ne sont pas des droits du seigneur de Wismes.", source: SW(1) },
    { id: "histoire-s05-1-q13", fiche: "histoire-s05-1-f2", type: "vrai_faux", niveau: 2,
      enonce: "Le droit de justice du seigneur de Wismes ne concerne que les petits vols.",
      corrections: ["Faux : il juge toutes les affaires de sa seigneurie, les plus graves comme le vol.", "Faux : le seigneur ne juge que les affaires de chasse.", "Faux : la justice appartient seulement au roi, pas au seigneur."],
      reponse: { vrai: false, correction: "Faux : il juge toutes les affaires de sa seigneurie, les plus graves comme le vol." },
      explication: "Le cartulaire parle de toutes les affaires de la seigneurie, des crimes les plus graves jusqu'au vol. Le droit de justice est très large.", source: SW(1) },
    { id: "histoire-s05-1-q14", fiche: "histoire-s05-1-f2", type: "qcm", niveau: 2,
      enonce: "Comment le seigneur de Wismes rend-il officiel le texte de ses droits ?",
      choix: ["Il le signe de son sceau", "Il le fait lire à l'église", "Il le grave sur son moulin", "Il le fait jurer par les paysans"],
      reponse: "Il le signe de son sceau",
      explication: "Le texte se termine par la marque du sceau du seigneur. Le sceau joue le rôle d'une signature.", source: SW(1) },
    { id: "histoire-s05-1-q15", fiche: "histoire-s05-1-f2", type: "qcm", niveau: 2,
      enonce: "Pourquoi le seigneur de Wismes fait-il écrire ses droits dans un cartulaire ?",
      choix: ["Pour rappeler et faire respecter ses droits et coutumes", "Pour offrir sa forêt et son moulin à tous les paysans de la seigneurie", "Pour demander pardon au roi", "Pour vendre son château"],
      reponse: "Pour rappeler et faire respecter ses droits et coutumes",
      explication: "Le texte commence par « nous rappelons » : il fixe par écrit ce que le seigneur a l'habitude de percevoir. Écrit et scellé, ce droit se discute moins.", source: SW(1) },
    { id: "histoire-s05-1-q16", fiche: "histoire-s05-1-f2", type: "qcm", niveau: 3,
      enonce: "Un habitant de Wismes coupe du bois dans la forêt pour se chauffer, sans l'accord du seigneur. Que rappelle le cartulaire de 1238 ?",
      choix: ["Que prendre du bois dans la forêt est un droit du seigneur", "Que la forêt appartient à tous les habitants de la seigneurie", "Que seul le roi peut juger cette affaire", "Que le bois se prend seulement au mois de juillet"],
      reponse: "Que prendre du bois dans la forêt est un droit du seigneur",
      explication: "Le seigneur rappelle son droit de prendre le bois de sa forêt pour bâtir ou se chauffer. Il peut aussi juger lui-même l'affaire.", indice: "Qui a le droit de se servir dans la forêt, d'après le cartulaire ?", source: SW(1) },
    { id: "histoire-s05-1-q17", fiche: "histoire-s05-1-f2", type: "trou", niveau: 1,
      enonce: "Complète avec les droits du seigneur de Wismes.",
      texte: "Dans sa forêt, le seigneur de Wismes a le droit de prendre le ___ et d'y ___.",
      banque: ["bois", "chasser", "blé", "moudre"],
      reponse: [["bois"], ["chasser"]],
      explication: "La forêt donne au seigneur du bois pour construire et se chauffer. Il s'y réserve aussi la chasse.", source: SW(1) },
    { id: "histoire-s05-1-q18", fiche: "histoire-s05-1-f2", type: "qcm", niveau: 3,
      enonce: "Le cartulaire de Wismes est daté de juillet 1238. À quel siècle appartient-il ?",
      choix: ["Le XIIIe siècle", "Le XIIe siècle", "Le XIVe siècle", "Le Xe siècle"],
      reponse: "Le XIIIe siècle",
      explication: "Les années 1201 à 1300 forment le XIIIe siècle. 1238 en fait partie.", indice: "Ajoute 1 au nombre de centaines : 12 centaines, donc XIIIe siècle.", source: SW(1) },
    // f3 : les banalités
    { id: "histoire-s05-1-q19", fiche: "histoire-s05-1-f3", type: "qcm", niveau: 1,
      enonce: "Qu'appelle-t-on les banalités ?",
      choix: ["Des taxes pour utiliser le moulin, le four ou le pressoir du seigneur", "Des travaux gratuits que les paysans font sur la réserve du seigneur", "Une taxe payée pour une tenure", "Une part de la récolte"],
      reponse: "Des taxes pour utiliser le moulin, le four ou le pressoir du seigneur",
      explication: "Les banalités se paient pour se servir des installations du seigneur. Les travaux gratuits sont les corvées, la taxe de la tenure est le cens.", source: SW(1) },
    { id: "histoire-s05-1-q20", fiche: "histoire-s05-1-f3", type: "vrai_faux", niveau: 1,
      enonce: "Pour faire moudre son grain au moulin du seigneur, le vilain laisse au meunier une part de grain et de farine.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : le meunier du seigneur prélève un boisseau de grain et de la farine. C'est une banalité.", source: SW(1) },
    { id: "histoire-s05-1-q21", fiche: "histoire-s05-1-f3", type: "qcm_multiple", niveau: 2,
      enonce: "Quelles installations du seigneur donnent lieu à des banalités ? (plusieurs réponses)",
      choix: ["Le moulin", "Le four", "Le pressoir", "L'église", "Le château"],
      reponse: ["Le moulin", "Le four", "Le pressoir"],
      explication: "Moulin, four et pressoir sont les trois installations des banalités. L'église et le château ne servent pas à transformer les récoltes.", source: SW(1) },
    { id: "histoire-s05-1-q22", fiche: "histoire-s05-1-f3", type: "vrai_faux", niveau: 2,
      enonce: "Le pressoir du seigneur sert à moudre le grain des paysans.",
      corrections: ["Faux : le pressoir sert à presser le raisin ; c'est le moulin qui moud le grain.", "Faux : le pressoir sert à cuire le pain.", "Faux : le pressoir sert à tondre les moutons."],
      reponse: { vrai: false, correction: "Faux : le pressoir sert à presser le raisin ; c'est le moulin qui moud le grain." },
      explication: "Chaque installation a son usage : le moulin moud, le four cuit, le pressoir presse le raisin. Toutes trois sont au seigneur.", source: SW(1) },
    { id: "histoire-s05-1-q23", fiche: "histoire-s05-1-f3", type: "qcm", niveau: 2,
      enonce: "Comment le meunier du seigneur se fait-il payer quand il moud le grain d'un vilain ?",
      choix: ["Il garde un boisseau de grain et de la farine", "Il reçoit des poules à Noël", "Il prend un porc sur huit", "Il envoie le paysan travailler gratuitement sur la réserve"],
      reponse: "Il garde un boisseau de grain et de la farine",
      explication: "Le meunier prélève sa part en nature : un boisseau de grain et de la farine. Les poules et les porcs sont d'autres redevances, dues au seigneur.", source: SW(1) },
    { id: "histoire-s05-1-q24", fiche: "histoire-s05-1-f3", type: "qcm", niveau: 2,
      enonce: "Pourquoi les paysans doivent-ils payer quand ils utilisent le four du seigneur ?",
      choix: ["Un droit est dû sur la cuisson du pain", "Le pain y est vendu au marché par le seigneur", "Le four appartient aux paysans", "Le four cuit aussi les tuiles"],
      reponse: "Un droit est dû sur la cuisson du pain",
      explication: "Le four est au seigneur : cuire son pain s'y paie par un droit. C'est l'une des banalités.", source: SW(1) },
    { id: "histoire-s05-1-q25", fiche: "histoire-s05-1-f3", type: "qcm", niveau: 3,
      enonce: "Au moulin, au four et au pressoir, le paysan paie à chaque fois. Quel point commun ont ces trois installations ?",
      choix: ["Elles appartiennent au seigneur", "Elles se trouvent toutes dans la forêt", "Elles servent à rendre la justice", "Elles sont tenues par le roi"],
      reponse: "Elles appartiennent au seigneur",
      explication: "Les trois sont des installations du seigneur. C'est pour cela que leur usage se paie : ce sont les banalités.", source: SW(1) },
    { id: "histoire-s05-1-q26", fiche: "histoire-s05-1-f3", type: "association", niveau: 2,
      enonce: "Relie chaque lieu de la seigneurie à ce qu'on y fait.",
      gauche: ["Moulin", "Four", "Pressoir", "Forêt"],
      droite: ["Cuire le pain", "Presser le raisin", "Moudre le grain", "Prendre du bois et chasser"],
      reponse: [[0, 2], [1, 0], [2, 1], [3, 3]],
      explication: "Moulin : le grain ; four : le pain ; pressoir : le raisin. La forêt donne le bois et le gibier au seigneur.", source: SW(1) },
    { id: "histoire-s05-1-q27", fiche: "histoire-s05-1-f3", type: "vrai_faux", niveau: 3,
      enonce: "Les banalités rapportent au seigneur chaque fois qu'un paysan moud, cuit ou presse.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : moulin, four et pressoir sont à lui, et chaque usage se paie. Plus les paysans s'en servent, plus il perçoit.", source: SW(1) },
    // f4 : le plan de Wismes
    { id: "histoire-s05-1-q28", fiche: "histoire-s05-1-f4", type: "qcm", niveau: 1,
      enonce: "De quel siècle date le plan de la seigneurie de Wismes ?",
      choix: ["Le XIVe siècle", "Le XIIe siècle", "Le XVe siècle", "Le Xe siècle"],
      reponse: "Le XIVe siècle",
      explication: "Le plan de Wismes date du XIVe siècle. Le cartulaire des droits du seigneur, lui, est de 1238.", source: SW(1) },
    { id: "histoire-s05-1-q29", fiche: "histoire-s05-1-f4", type: "vrai_faux", niveau: 1,
      enonce: "La seigneurie de Wismes se trouve dans le nord de la France.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : Wismes est une seigneurie du nord de la France. Le texte de Verson, lui, vient de Normandie.", source: SW(1) },
    { id: "histoire-s05-1-q30", fiche: "histoire-s05-1-f4", type: "qcm_multiple", niveau: 2,
      enonce: "Quels bâtiments sont indiqués sur le plan de la seigneurie de Wismes ? (plusieurs réponses)",
      choix: ["Le château", "L'église", "Le moulin du seigneur", "Une cathédrale", "Un port"],
      reponse: ["Le château", "L'église", "Le moulin du seigneur"],
      explication: "Le plan marque le château, l'église et le moulin du seigneur. Il n'y a ni cathédrale ni port à Wismes.", source: SW(1) },
    { id: "histoire-s05-1-q31", fiche: "histoire-s05-1-f4", type: "qcm", niveau: 2,
      enonce: "Quel élément du plan de Wismes rappelle le droit de justice du seigneur ?",
      choix: ["Le gibet", "Le moulin", "L'église", "Les tenures"],
      reponse: "Le gibet",
      explication: "Le gibet est l'endroit où l'on exécutait les condamnés. Il montre que le seigneur juge et punit dans sa seigneurie.", source: SW(1) },
    { id: "histoire-s05-1-q32", fiche: "histoire-s05-1-f4", type: "vrai_faux", niveau: 2,
      enonce: "Sur le plan, les tenures occupent un seul endroit de la seigneurie.",
      corrections: ["Faux : le plan marque des tenures à plusieurs endroits, autour du village.", "Faux : les tenures sont toutes dans la réserve.", "Faux : le plan ne montre aucune tenure."],
      reponse: { vrai: false, correction: "Faux : le plan marque des tenures à plusieurs endroits, autour du village." },
      explication: "Le mot « tenures » apparaît à plusieurs endroits du plan. Les terres des paysans sont réparties dans la seigneurie.", source: SW(1) },
    { id: "histoire-s05-1-q33", fiche: "histoire-s05-1-f4", type: "qcm", niveau: 2,
      enonce: "Comment se répartissent les terres sur le plan de Wismes ?",
      choix: ["Des tenures pour les paysans et une réserve pour le seigneur", "Tout appartient à l'église", "Tout est couvert de forêt", "Une seule grande tenure cultivée par le roi et ses chevaliers"],
      reponse: "Des tenures pour les paysans et une réserve pour le seigneur",
      explication: "Le plan distingue la réserve, gardée par le seigneur, et les tenures, cédées aux paysans. Ce sont les deux parties de la seigneurie.", source: SW(1) },
    { id: "histoire-s05-1-q34", fiche: "histoire-s05-1-f4", type: "qcm", niveau: 3,
      enonce: "Le plan de Wismes date du XIVe siècle et le cartulaire de 1238. Lequel des deux documents est le plus ancien ?",
      choix: ["Le cartulaire", "Le plan", "Ils datent de la même année", "On ne peut pas le savoir"],
      reponse: "Le cartulaire",
      explication: "1238 appartient au XIIIe siècle, qui précède le XIVe. Le cartulaire est donc plus ancien que le plan.", indice: "Trouve d'abord le siècle de 1238.", source: SW(1) },
    { id: "histoire-s05-1-q35", fiche: "histoire-s05-1-f4", type: "ordre", niveau: 2,
      enonce: "Remets ces documents du plus ancien au plus récent.",
      elements: ["Plan de la seigneurie de Wismes (XIVe siècle)", "Cartulaire de Wismes (1238)", "Chanson des vilains de Verson (XIIe siècle)", "Famine racontée par Raoul Glaber (1033)"],
      reponse: [3, 2, 1, 0],
      explication: "1033 (famine), puis le XIIe siècle (Verson), puis 1238 (cartulaire), enfin le XIVe siècle (plan).", source: SW(1) }
  ],
  bonus: [
    {
      id: "histoire-s05-1-b1",
      fiche: "histoire-s05-1-f3",
      titre: "Les banalités ont duré jusqu'à la Révolution",
      texte: "Four, moulin et pressoir banaux n'étaient pas les seuls : il existait aussi des moulins à foulon pour les draps et des marchés banaux. Les habitants devaient s'en servir au prix fixé par le seigneur, qui devait en échange entretenir ces installations. Les banalités ont été abolies dans la nuit du 4 août 1789, puis supprimées sans rachat en 1793.",
      source: { titre: "Banalité (droit seigneurial)", editeur: "Wikipédia, l'encyclopédie libre", url: "https://fr.wikipedia.org/wiki/Banalit%C3%A9_(droit_seigneurial)" }
    }
  ],
  nonCouvert: [
    "La leçon à apprendre : le cadre « mots importants » du support est vide ; la leçon est donnée en vidéo.",
    "L'enluminure étudiée en séance 7 (personnages du premier plan, chevaliers, Bernart de Ventadour) n'est pas dans le fichier : seules les questions y figurent.",
    "Qui est Bernart de Ventadour et ce qu'est un troubadour.",
    "Ce qu'est la seigneurie banale : la frise cite seulement l'époque de son développement.",
    "Ce que le seigneur doit à ses paysans en échange de son pouvoir (question 5 de l'étude de cas) : la réponse est donnée en vidéo.",
    "Le plan de Wismes lui-même (seules ses légendes sont reprises) et les enluminures du moulin et du four.",
    "Le calendrier complet des redevances de Verson (saint Jean, moisson, porcs, cens, corvées, poules, moutons) : il est traité au cours 8 (histoire-s05-2).",
    "Le rôle des chevaliers et du château dans la seigneurie."
  ]
};
