// Source en clair du cours svt-s06-1 (livret 1, chapitre 2, séance 6 : les risques climatiques).
// Compilé (réponses brouillées) par node atelier/outils/compiler-cours.js svt-s06-1.
// Le corrigé du livret 1 n'a aucun exercice pour la séance 6 et la leçon n'est pas déposée. Ce cours reprend donc
// l'exemple de risque climatique détaillé dans le corrigé, p. 11 (exercice de la séance 5 : les cyclones de la Réunion,
// le cyclone de 1962, les alertes d'aujourd'hui, la vulnérabilité qui baisse). Les notions (aléa, enjeux, vulnérabilité,
// risque) sont dans svt-s05-2. Doute signalé à Romain : rattachement de cet exemple à la séance 6.
// Anti-spoil du devoir 1 : pas de chiffres du bilan humain ni de l'année 1980 dans les questions.
const C = (page) => ({ fichier: "cours/svt/Cours Griffon 5eme SVT Livret 1 - Corriges.pdf", page: page });

module.exports = {
  id: "svt-s06-1",
  fiches: [
    {
      id: "svt-s06-1-f1", notion: "Le cyclone, un risque climatique à la Réunion",
      titre: "Une île régulièrement frappée",
      texte: "L'île de la Réunion est régulièrement frappée par des cyclones : c'est un risque climatique. Cinq cyclones différents y ont tous provoqué des dégâts majeurs, voire considérables. L'aléa « cyclone » est toujours présent, mais le nombre de morts a considérablement baissé entre 1962 et 2014. Comprendre pourquoi, c'est comprendre comment un risque peut diminuer.",
      pointsCles: [
        "Risque climatique : les cyclones de la Réunion",
        "Cinq cyclones, tous avec des dégâts majeurs ou considérables",
        "L'aléa reste présent ; le nombre de morts a beaucoup baissé entre 1962 et 2014"
      ],
      dates: [
        { annee: 1962, evenement: "Le cyclone Jenny frappe la Réunion" },
        { annee: 2014, evenement: "Un cyclone touche la Réunion en faisant bien moins de victimes" }
      ],
      lieux: ["La Réunion"], personnages: [],
      vocabulaire: [
        { mot: "risque climatique", def: "un risque lié au climat, comme les cyclones à la Réunion" }
      ],
      schema: null, prerequis: ["svt-s05-2-f1", "svt-s05-2-f3"], source: C(11)
    },
    {
      id: "svt-s06-1-f2", notion: "1962 : le cyclone Jenny",
      titre: "Une alerte arrivée trop tard",
      texte: "En 1962, le cyclone Jenny frappe la Réunion. Les prévisions annonçaient un phénomène bien moins grave que la réalité, et le bulletin d'alerte diffusé à la radio arrive trop tard : beaucoup de gens sont déjà au travail. Des maisons sont détruites, des barques de pêcheurs surprises en mer, un paquebot rompt ses amarres, des wagons sont emportés.",
      pointsCles: [
        "1962 : cyclone Jenny à la Réunion",
        "Prévisions trop optimistes, bulletin d'alerte à la radio arrivé trop tard",
        "Beaucoup de personnes déjà au travail, maisons détruites, barques en mer, paquebot, wagons"
      ],
      dates: [{ annee: 1962, evenement: "Le cyclone Jenny frappe la Réunion" }],
      lieux: ["La Réunion"], personnages: [],
      vocabulaire: [
        { mot: "bulletin d'alerte", def: "un message officiel qui prévient la population d'un danger qui approche" },
        { mot: "prévision météorologique", def: "l'annonce du temps qu'il devrait faire, d'après les mesures et les calculs" }
      ],
      schema: null, prerequis: ["svt-s06-1-f1"], source: C(11)
    },
    {
      id: "svt-s06-1-f3", notion: "Prévenir aujourd'hui : alertes graduées et kit de survie",
      titre: "Des couleurs, des consignes, un kit",
      texte: "Aujourd'hui, Météo-France publie des bulletins systématiques et gradués : une échelle de couleurs indique le degré d'alerte, et des consignes disent quoi faire à chaque degré. De plus, chaque habitant de la Réunion dispose d'un kit de survie. Ces précautions se préparent avant l'arrivée du cyclone.",
      pointsCles: [
        "Bulletins systématiques, gradués par une échelle de couleurs",
        "Des consignes pour chaque degré d'alerte",
        "Un kit de survie pour chaque Réunionnais",
        "Tout se prépare avant le cyclone"
      ],
      dates: [], lieux: ["La Réunion"], personnages: [],
      vocabulaire: [
        { mot: "degré d'alerte", def: "le niveau de danger annoncé, repéré par une couleur" },
        { mot: "consigne", def: "une instruction à suivre, par exemple rester chez soi" },
        { mot: "kit de survie", def: "un ensemble d'objets utiles pour tenir pendant une catastrophe (eau, lampe, radio…)" }
      ],
      schema: null, prerequis: ["svt-s06-1-f2"], source: C(11)
    },
    {
      id: "svt-s06-1-f4", notion: "Un risque qui baisse sans que l'aléa change",
      titre: "Moins vulnérables, donc moins de risque",
      texte: "Grâce aux alertes graduées et aux kits de survie, le nombre de morts par cyclone a été divisé par 25 en quelques dizaines d'années. L'aléa n'a pas changé : les cyclones reviennent. La population n'explique rien non plus. Ce sont les personnes qui sont devenues moins vulnérables, et c'est pour cela que le risque a baissé.",
      pointsCles: [
        "Nombre de morts divisé par 25 depuis les années quatre-vingt",
        "L'aléa est le même ; rien n'indique un changement de population",
        "Les précautions réduisent la vulnérabilité des personnes, pas l'aléa",
        "Moins de vulnérabilité = moins de risque"
      ],
      dates: [], lieux: ["La Réunion"], personnages: [],
      vocabulaire: [
        { mot: "précaution", def: "ce que l'on fait à l'avance pour éviter un mal ou en limiter les effets" }
      ],
      schema: null, prerequis: ["svt-s06-1-f3", "svt-s05-2-f4"], source: C(11)
    }
  ],
  schemas: [],
  questions: [
    // f1 : le cyclone, un risque climatique
    { id: "svt-s06-1-q1", fiche: "svt-s06-1-f1", type: "qcm", niveau: 1,
      enonce: "Quelle île est régulièrement frappée par des cyclones dans l'exemple étudié ?",
      choix: ["La Réunion", "La Corse", "Mayotte", "L'Islande"],
      reponse: "La Réunion",
      explication: "L'exemple est celui de la Réunion. Cinq cyclones différents y sont cités.", source: C(11) },
    { id: "svt-s06-1-q2", fiche: "svt-s06-1-f1", type: "qcm", niveau: 1,
      enonce: "Dans le cas de la Réunion, de quel type de risque s'agit-il ?",
      choix: ["Un risque climatique, lié aux cyclones", "Un risque volcanique", "Un risque de tremblement de terre et d'éboulement", "Un risque routier"],
      reponse: "Un risque climatique, lié aux cyclones",
      explication: "Les cyclones sont un phénomène du climat. Le risque qu'ils font courir est donc un risque climatique.", source: C(11) },
    { id: "svt-s06-1-q3", fiche: "svt-s06-1-f1", type: "vrai_faux", niveau: 2,
      enonce: "Tous les cyclones cités pour la Réunion ont provoqué des dégâts majeurs, voire considérables.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : les cinq cyclones ont fait des dégâts majeurs, et surtout considérables. Cela traduit la vulnérabilité des enjeux.", source: C(11) },
    { id: "svt-s06-1-q4", fiche: "svt-s06-1-f1", type: "vrai_faux", niveau: 2,
      enonce: "Entre 1962 et 2014, le nombre de morts par cyclone à la Réunion a augmenté.",
      corrections: ["Faux : il a considérablement baissé.", "Faux : il est resté exactement le même.", "Faux : il n'y a jamais eu de mort à la Réunion à cause d'un cyclone."],
      reponse: { vrai: false, correction: "Faux : il a considérablement baissé." },
      explication: "Le nombre de morts a beaucoup diminué entre 1962 et 2014. Pourtant les cyclones continuent de frapper l'île.", source: C(11) },
    { id: "svt-s06-1-q5", fiche: "svt-s06-1-f1", type: "qcm", niveau: 1,
      enonce: "Combien de cyclones différents sont cités pour la Réunion ?",
      choix: ["Cinq", "Un seul", "Deux", "Cinquante"],
      reponse: "Cinq",
      explication: "Cinq cyclones sont cités, avec leurs dégâts. Ils montrent que l'aléa revient régulièrement.", source: C(11) },
    { id: "svt-s06-1-q6", fiche: "svt-s06-1-f1", type: "qcm", niveau: 3,
      enonce: "Pourquoi parle-t-on de risque climatique pour les cyclones, et pas seulement d'aléa ?",
      choix: ["Parce qu'ils menacent des enjeux vulnérables : habitants, maisons, bateaux", "Parce qu'ils ont lieu toute l'année", "Parce qu'ils ne font jamais de dégâts", "Parce qu'ils sont prévus plusieurs semaines à l'avance par les météorologues"],
      reponse: "Parce qu'ils menacent des enjeux vulnérables : habitants, maisons, bateaux",
      explication: "Un risque, c'est un aléa qui rencontre des enjeux vulnérables. À la Réunion, les cyclones frappent des habitants, des maisons et des bateaux.", source: C(11) },
    { id: "svt-s06-1-q7", fiche: "svt-s06-1-f1", type: "qcm", niveau: 2,
      enonce: "Comment la vulnérabilité se lit-elle pour chaque cyclone de la Réunion ?",
      choix: ["Dans les dégâts qu'il a causés", "Dans son nom", "Dans sa date", "Dans la vitesse de ses vents"],
      reponse: "Dans les dégâts qu'il a causés",
      explication: "La colonne des dégâts donne la vulnérabilité : majeurs, considérables. La vitesse des vents décrit l'aléa.", source: C(11) },
    // f2 : 1962, le cyclone Jenny
    { id: "svt-s06-1-q8", fiche: "svt-s06-1-f2", type: "qcm", niveau: 1,
      enonce: "Comment s'appelle le cyclone qui a frappé la Réunion en 1962 ?",
      choix: ["Jenny", "Jessy", "Janet", "Jade"],
      reponse: "Jenny",
      explication: "Le cyclone de 1962 s'appelle Jenny. Son bilan a été très lourd.", source: C(11) },
    { id: "svt-s06-1-q9", fiche: "svt-s06-1-f2", type: "vrai_faux", niveau: 2,
      enonce: "En 1962, le cyclone a été bien plus grave que ce que les prévisions annonçaient.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : la réalité a dépassé de loin les prévisions. La prévision était alors beaucoup moins fiable qu'aujourd'hui.", source: C(11) },
    { id: "svt-s06-1-q10", fiche: "svt-s06-1-f2", type: "vrai_faux", niveau: 2,
      enonce: "En 1962, le bulletin d'alerte diffusé à la radio est arrivé assez tôt pour mettre tout le monde à l'abri.",
      corrections: ["Faux : il est arrivé trop tard, alors que beaucoup de gens étaient déjà au travail.", "Faux : aucun bulletin n'a été diffusé.", "Faux : le bulletin a été diffusé une semaine avant, mais personne ne l'a cru."],
      reponse: { vrai: false, correction: "Faux : il est arrivé trop tard, alors que beaucoup de gens étaient déjà au travail." },
      explication: "Le bulletin d'alerte est arrivé trop tard. Beaucoup de personnes étaient déjà sur leur lieu de travail quand le cyclone a frappé.", source: C(11) },
    { id: "svt-s06-1-q11", fiche: "svt-s06-1-f2", type: "qcm", niveau: 1,
      enonce: "Par quel moyen le bulletin d'alerte a-t-il été diffusé en 1962 ?",
      choix: ["Par la radio", "Par un message sur téléphone portable", "Par Internet", "Par des affiches dans les rues"],
      reponse: "Par la radio",
      explication: "En 1962, l'alerte passait par les ondes de la radio. Téléphones portables et Internet n'existaient pas.", source: C(11) },
    { id: "svt-s06-1-q12", fiche: "svt-s06-1-f2", type: "qcm_multiple", niveau: 2,
      enonce: "Quels dégâts le cyclone Jenny a-t-il causés en 1962 ? (plusieurs réponses)",
      choix: ["Des maisons détruites", "Des barques de pêcheurs surprises en mer", "Un paquebot qui a rompu ses amarres", "Des wagons de chemin de fer emportés", "Un volcan réveillé", "Une sécheresse de trois ans"],
      reponse: ["Des maisons détruites", "Des barques de pêcheurs surprises en mer", "Un paquebot qui a rompu ses amarres", "Des wagons de chemin de fer emportés"],
      explication: "Maisons, barques, paquebot, wagons : tous les enjeux ont été touchés. Volcan et sécheresse n'ont rien à voir avec un cyclone.", source: C(11) },
    { id: "svt-s06-1-q13", fiche: "svt-s06-1-f2", type: "qcm", niveau: 3,
      enonce: "Pourquoi tant de personnes ont-elles été surprises par le cyclone de 1962 ?",
      choix: ["Parce que l'alerte est arrivée trop tard", "Parce que personne n'avait de radio", "Parce que le cyclone est arrivé de nuit", "Parce que l'île n'avait jamais connu de cyclone auparavant"],
      reponse: "Parce que l'alerte est arrivée trop tard",
      explication: "Les prévisions sous-estimaient le cyclone et l'alerte est venue trop tard. Les gens étaient déjà sortis travailler.", source: C(11) },
    { id: "svt-s06-1-q14", fiche: "svt-s06-1-f2", type: "qcm", niveau: 3,
      enonce: "Que montre la différence entre les prévisions de 1962 et la réalité ?",
      choix: ["Que la prévision était difficile à cette époque", "Que les prévisions météo sont toujours exactes, même à cette époque", "Que le cyclone était faible", "Que les habitants exagéraient"],
      reponse: "Que la prévision était difficile à cette époque",
      explication: "En 1962, on prévoyait mal la force d'un cyclone. Aujourd'hui, les bulletins gradués sont bien plus fiables.", source: C(11) },
    // f3 : prévenir aujourd'hui
    { id: "svt-s06-1-q15", fiche: "svt-s06-1-f3", type: "qcm", niveau: 1,
      enonce: "Qui publie aujourd'hui les bulletins d'alerte gradués à la Réunion ?",
      choix: ["Météo-France", "La radio de 1962", "La police", "Les pêcheurs"],
      reponse: "Météo-France",
      explication: "Météo-France publie des bulletins systématiques et gradués. Chacun indique un degré d'alerte.", source: C(11) },
    { id: "svt-s06-1-q16", fiche: "svt-s06-1-f3", type: "qcm", niveau: 2,
      enonce: "Comment les bulletins d'alerte sont-ils gradués aujourd'hui ?",
      choix: ["Avec une échelle de couleurs et des consignes pour chaque degré", "Avec des notes sur vingt données par les habitants de l'île", "Avec le nom du cyclone seulement", "Avec le nombre de morts prévu"],
      reponse: "Avec une échelle de couleurs et des consignes pour chaque degré",
      explication: "Chaque couleur correspond à un degré d'alerte. Des consignes accompagnent chaque degré.", source: C(11) },
    { id: "svt-s06-1-q17", fiche: "svt-s06-1-f3", type: "vrai_faux", niveau: 1,
      enonce: "Chaque habitant de la Réunion dispose d'un kit de survie.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : chaque Réunionnais a un kit de survie. C'est l'une des précautions qui réduisent la vulnérabilité.", source: C(11) },
    { id: "svt-s06-1-q18", fiche: "svt-s06-1-f3", type: "vrai_faux", niveau: 2,
      enonce: "Les bulletins d'alerte ne sont publiés que lorsqu'un cyclone a déjà touché l'île.",
      corrections: ["Faux : ils sont systématiques, publiés avant, avec des degrés d'alerte.", "Faux : ils ne sont publiés qu'une fois par an.", "Faux : ils ne sont diffusés qu'aux pêcheurs."],
      reponse: { vrai: false, correction: "Faux : ils sont systématiques, publiés avant, avec des degrés d'alerte." },
      explication: "Les bulletins sont systématiques et gradués : ils préviennent avant l'arrivée du cyclone. C'est ce qui permet de se préparer.", source: C(11) },
    { id: "svt-s06-1-q19", fiche: "svt-s06-1-f3", type: "qcm_multiple", niveau: 2,
      enonce: "Quelles précautions diminuent aujourd'hui la vulnérabilité des Réunionnais ? (plusieurs réponses)",
      choix: ["Des bulletins d'alerte gradués par couleur", "Des consignes à suivre pour chaque degré d'alerte", "Un kit de survie pour chacun", "Une digue autour de l'île", "L'interdiction des cyclones"],
      reponse: ["Des bulletins d'alerte gradués par couleur", "Des consignes à suivre pour chaque degré d'alerte", "Un kit de survie pour chacun"],
      explication: "Bulletins gradués, consignes et kit de survie : voilà les précautions citées. On ne peut ni interdire un cyclone ni entourer une île d'une digue.", source: C(11) },
    { id: "svt-s06-1-q20", fiche: "svt-s06-1-f3", type: "qcm", niveau: 3,
      enonce: "À quoi servent les consignes qui accompagnent chaque degré d'alerte ?",
      choix: ["À dire aux habitants quoi faire pour se protéger", "À mesurer la force du vent et la hauteur des vagues", "À donner un nom au cyclone", "À annuler le cyclone"],
      reponse: "À dire aux habitants quoi faire pour se protéger",
      explication: "Les consignes traduisent la couleur en actions : se mettre à l'abri, rester chez soi… Elles rendent les personnes moins vulnérables.", source: C(11) },
    { id: "svt-s06-1-q21", fiche: "svt-s06-1-f3", type: "ordre", niveau: 2,
      enonce: "Remets dans l'ordre ce qui se passe aujourd'hui à l'approche d'un cyclone.",
      elements: ["Météo-France publie un bulletin avec un degré d'alerte", "Les habitants appliquent les consignes du degré d'alerte", "Le cyclone passe en faisant moins de victimes", "Un cyclone se forme et s'approche de l'île"],
      reponse: [3, 0, 1, 2],
      explication: "Le cyclone approche, le bulletin tombe, les habitants suivent les consignes, et le cyclone fait moins de victimes. La préparation vient avant le passage.", source: C(11) },
    // f4 : un risque qui baisse
    { id: "svt-s06-1-q22", fiche: "svt-s06-1-f4", type: "qcm", niveau: 1,
      enonce: "Par combien le nombre de morts par cyclone a-t-il été divisé à la Réunion depuis les années quatre-vingt ?",
      choix: ["Par 25", "Par 2", "Par 5", "Par 100"],
      reponse: "Par 25",
      explication: "Le nombre de morts a été divisé par 25. Les alertes graduées et les kits de survie expliquent cette baisse.", source: C(11) },
    { id: "svt-s06-1-q23", fiche: "svt-s06-1-f4", type: "vrai_faux", niveau: 2,
      enonce: "Les bulletins d'alerte et les kits de survie ont fait disparaître l'aléa cyclone.",
      corrections: ["Faux : l'aléa est toujours là ; ces précautions réduisent la vulnérabilité des personnes.", "Faux : ils ont surtout réduit le nombre de cyclones.", "Faux : ils ont rendu les maisons indestructibles."],
      reponse: { vrai: false, correction: "Faux : l'aléa est toujours là ; ces précautions réduisent la vulnérabilité des personnes." },
      explication: "Rien ne peut empêcher un cyclone de venir. Les précautions agissent sur la vulnérabilité des personnes, pas sur l'aléa.", source: C(11) },
    { id: "svt-s06-1-q24", fiche: "svt-s06-1-f4", type: "vrai_faux", niveau: 3,
      enonce: "Le risque cyclonique a baissé à la Réunion parce que la vulnérabilité des personnes a diminué.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : à aléa égal, moins de vulnérabilité, c'est moins de risque. Les alertes et les kits de survie ont rendu les personnes moins vulnérables.", source: C(11) },
    { id: "svt-s06-1-q25", fiche: "svt-s06-1-f4", type: "qcm", niveau: 3,
      enonce: "Pourquoi peut-on dire que ce n'est pas la population qui explique la baisse du risque ?",
      choix: ["Parce qu'aucune information n'indique un changement de la population", "Parce que la population a doublé entre les deux cyclones les plus récents", "Parce que l'île s'est vidée", "Parce que la population vit sur les bateaux"],
      reponse: "Parce qu'aucune information n'indique un changement de la population",
      explication: "Rien n'indique que la population ait changé. La baisse vient donc des précautions, qui réduisent la vulnérabilité.", source: C(11) },
    { id: "svt-s06-1-q26", fiche: "svt-s06-1-f4", type: "qcm", niveau: 2,
      enonce: "Sur quoi agissent les précautions prises à la Réunion ?",
      choix: ["Sur la vulnérabilité des enjeux", "Sur l'aléa", "Sur le nombre de cyclones", "Sur la température de la mer"],
      reponse: "Sur la vulnérabilité des enjeux",
      explication: "Alertes et kits de survie protègent les personnes : leur vulnérabilité baisse. L'aléa et le nombre de cyclones ne changent pas.", source: C(11) },
    { id: "svt-s06-1-q27", fiche: "svt-s06-1-f4", type: "association", niveau: 3,
      enonce: "Relie chaque élément à ce qu'il représente à la Réunion.",
      gauche: ["Les cyclones qui reviennent", "Les habitants, leurs maisons, leurs bateaux", "Les morts et les dégâts", "Bulletins gradués et kits de survie"],
      droite: ["L'aléa", "Les enjeux", "La vulnérabilité", "Les précautions qui réduisent la vulnérabilité"],
      reponse: [[0, 0], [1, 1], [2, 2], [3, 3]],
      explication: "Aléa, enjeux, vulnérabilité, précautions : les quatre pièces du raisonnement. Les précautions font baisser le risque.", source: C(11) },
    { id: "svt-s06-1-q28", fiche: "svt-s06-1-f4", type: "qcm", niveau: 2,
      enonce: "Comment résumer l'évolution du risque cyclonique à la Réunion ?",
      choix: ["Même aléa, moins de vulnérabilité, donc moins de risque", "Moins d'aléa, donc moins de risque", "Plus d'enjeux et plus d'habitants, donc beaucoup plus de risque", "Même risque qu'en 1962"],
      reponse: "Même aléa, moins de vulnérabilité, donc moins de risque",
      explication: "Les cyclones sont toujours là, mais les personnes sont mieux préparées. Le risque a donc baissé.", source: C(11) },
    { id: "svt-s06-1-q29", fiche: "svt-s06-1-f4", type: "qcm_multiple", niveau: 2,
      enonce: "Qu'est-ce qui a changé à la Réunion entre 1962 et aujourd'hui ? (plusieurs réponses)",
      choix: ["Les moyens d'alerte", "Les consignes données aux habitants", "L'équipement des habitants, avec un kit de survie", "La présence de cyclones", "La position de l'île"],
      reponse: ["Les moyens d'alerte", "Les consignes données aux habitants", "L'équipement des habitants, avec un kit de survie"],
      explication: "Alertes, consignes et kits : tout cela est nouveau depuis 1962. Les cyclones, eux, n'ont pas changé.", source: C(11) }
  ],
  bonus: [
    {
      id: "svt-s06-1-b1", fiche: "svt-s06-1-f1",
      titre: "Ouragan, typhon ou cyclone ?",
      texte: "Un cyclone tropical est une immense zone de nuages d'orage qui tourne sur elle-même, avec des vents très violents. Il se forme au-dessus des mers chaudes de la zone intertropicale. Selon l'océan, on l'appelle ouragan, typhon ou cyclone. Au centre se trouve l'œil, une zone calme et souvent sans nuage. Chaque cyclone reçoit un nom pour ne pas être confondu avec un autre ; un nom peut être retiré après un cyclone très meurtrier.",
      source: { titre: "Cyclone tropical", editeur: "Wikipédia, l'encyclopédie libre", url: "https://fr.wikipedia.org/wiki/Cyclone_tropical" }
    }
  ],
  nonCouvert: [
    "La leçon de la séance 6 n'est pas déposée et le corrigé n'a pas d'exercice pour cette séance : la liste des risques climatiques (sécheresses, inondations, tempêtes, canicules…) et leurs conséquences ne sont pas dans le jeu ; seul l'exemple des cyclones de la Réunion l'est.",
    "Le tableau des cinq cyclones (noms, années, dégâts) et le texte du bilan de 1962 ne sont pas reproduits dans le corrigé : seules ses conclusions sont reprises.",
    "Les couleurs exactes de l'échelle d'alerte cyclonique de la Réunion et le contenu du kit de survie : non précisés dans le corrigé."
  ]
};
