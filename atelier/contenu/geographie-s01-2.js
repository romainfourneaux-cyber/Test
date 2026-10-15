// Source en clair du cours geographie-s01-2 (Thème 1, cours 1, 1re partie : croissance et développement de la population).
// Compilé (réponses brouillées) par node atelier/outils/compiler-cours.js vers jeu/data/cours/geographie-s01-2.js.
// Pages utilisées : 1, 2, 5 et 7 du cours 1. Le devoir geographie-d1 couvre ce cours : aucune question ne reprend
// ses questions, ses documents, ses chiffres ni ses réponses attendues (les mots qu'il demande de définir ne sont
// pas posés tels quels). Les définitions du cours (page 5) sont dans « vocabulaire » : le cahier des charges (section 9)
// autorise définitions et repères du cours, et le devoir corrigé montre qu'elles sont à retravailler.
const F = "cours/geographie/Geo 5e - Theme 1 - Cours 1.pdf";
const P = (page) => ({ fichier: F, page: page });

// Schéma redessiné : allure générale des courbes de la transition démographique (sans valeurs chiffrées).
function schemaTransition() {
  const nat = [[50, 60], [150, 60], [200, 61], [270, 68], [310, 95], [350, 140], [390, 172], [500, 176]];
  const mor = [[50, 68], [150, 70], [180, 100], [220, 140], [270, 160], [330, 168], [390, 176], [500, 180]];
  const pts = (l) => l.map(p => p.join(",")).join(" ");
  let s = "<svg viewBox='0 0 540 270' xmlns='http://www.w3.org/2000/svg' font-family='Georgia,serif' font-size='11' fill='#2e2419'>";
  s += "<polygon points='" + pts(nat) + " " + pts(mor.slice().reverse()) + "' fill='#b08d3a' opacity='.35'/>";
  [150, 270, 390].forEach(x => { s += "<line x1='" + x + "' y1='40' x2='" + x + "' y2='205' stroke='#5b5044' stroke-dasharray='4 4'/>"; });
  s += "<line x1='50' y1='205' x2='510' y2='205' stroke='#2e2419' stroke-width='2'/><path d='M510 199l12 6-12 6z' fill='#2e2419'/>";
  s += "<line x1='50' y1='205' x2='50' y2='40' stroke='#2e2419' stroke-width='2'/><path d='M44 40l6-12 6 12z' fill='#2e2419'/>";
  s += "<polyline points='" + pts(nat) + "' fill='none' stroke='#2f5a8a' stroke-width='3'/>";
  s += "<polyline points='" + pts(mor) + "' fill='none' stroke='#9a4a32' stroke-width='3'/>";
  s += "<g text-anchor='middle' font-weight='bold'><text x='100' y='30'>Régime ancien</text><text x='210' y='30'>Phase 1</text><text x='330' y='30'>Phase 2</text><text x='450' y='30'>Régime moderne</text></g>";
  s += "<g text-anchor='middle' font-size='10'><text x='210' y='44'>la mortalité chute</text><text x='330' y='44'>la natalité chute</text></g>";
  s += "<text x='300' y='128' text-anchor='middle' font-style='italic'>fort accroissement naturel</text>";
  s += "<text x='18' y='125' transform='rotate(-90 18 125)' text-anchor='middle'>taux pour mille habitants</text>";
  s += "<text x='520' y='222' text-anchor='end'>temps</text>";
  s += "<line x1='60' y1='250' x2='90' y2='250' stroke='#2f5a8a' stroke-width='3'/><text x='96' y='254'>natalité</text>";
  s += "<line x1='170' y1='250' x2='200' y2='250' stroke='#9a4a32' stroke-width='3'/><text x='206' y='254'>mortalité</text>";
  s += "<rect x='290' y='243' width='26' height='14' fill='#b08d3a' opacity='.35'/><text x='322' y='254'>écart : accroissement naturel</text>";
  return s + "</svg>";
}

module.exports = {
  id: "geographie-s01-2",
  fiches: [
    {
      id: "geographie-s01-2-f1", notion: "Une population mondiale en forte hausse",
      titre: "Toujours plus d'habitants sur Terre",
      texte: "Vers le début du XIXe siècle, la Terre a atteint son premier milliard d'habitants. Depuis 1950, la population mondiale a triplé : environ 2,5 milliards cette année-là, 7,5 milliards en 2020. Cette hausse concerne surtout les pays du Sud. Elle ralentit un peu, mais on attend environ 9 milliards d'habitants vers le milieu du siècle.",
      pointsCles: [
        "Un milliard d'habitants au début du XIXe siècle",
        "2,5 milliards d'habitants en 1950, 7,5 milliards en 2020 : trois fois plus",
        "Une hausse qui touche surtout les pays du Sud",
        "Croissance démographique : le nombre d'habitants grandit"
      ],
      dates: [{ annee: 1950, evenement: "Début de la très forte hausse de la population mondiale" }],
      lieux: [], personnages: [],
      vocabulaire: [
        { mot: "croissance démographique", def: "l'augmentation du nombre d'habitants" }
      ],
      schema: null, prerequis: [], source: P(1)
    },
    {
      id: "geographie-s01-2-f2", notion: "Les causes de la hausse de l'espérance de vie",
      titre: "Pourquoi vit-on plus longtemps ?",
      texte: "La population grandit surtout parce qu'on meurt moins et qu'on vit plus longtemps. Plusieurs progrès se sont additionnés : une nourriture plus abondante et variée, qui a fait disparaître les famines ; la médecine (vaccins, antibiotiques, chirurgie) ; une meilleure hygiène ; des machines qui rendent le travail moins dur. La médecine compte parmi les causes principales.",
      pointsCles: [
        "Moins de décès et une vie plus longue : la population augmente",
        "Quatre progrès : alimentation, médecine, hygiène, techniques",
        "Hygiène : eaux usées traitées, douches et toilettes, eau de Javel, ramassage des ordures, aliments mieux conservés",
        "Techniques : grues, chariots élévateurs, machines puissantes"
      ],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "espérance de vie", def: "le nombre moyen d'années que peut vivre un bébé qui vient de naître" }
      ],
      schema: null, prerequis: ["geographie-s01-2-f1"], source: P(1)
    },
    {
      id: "geographie-s01-2-f3", notion: "Croissance démographique et niveau de développement",
      titre: "Une croissance très inégale",
      texte: "La croissance démographique dépend du développement. Elle est très forte dans les PMA, en Afrique et en Asie du Sud : on y fait encore beaucoup d'enfants, mais on meurt moins. Dans les pays émergents, comme la Chine ou le Brésil, elle ralentit. Dans les pays développés, peu de naissances et une vie longue font vieillir la population.",
      pointsCles: [
        "PMA : natalité très haute, mortalité en baisse, croissance très forte",
        "Pays émergents : la natalité baisse et se rapproche de la mortalité",
        "Pays développés (Europe, Russie, Amérique du Nord, Japon) : population qui vieillit, qui augmente peu ou diminue",
        "Depuis 1950, la population de l'Afrique a été multipliée par 5",
        "Pour se renouveler, une population a besoin d'au moins 2,1 enfants par femme"
      ],
      dates: [], lieux: ["Afrique", "Asie du Sud", "Chine", "Brésil"], personnages: [],
      vocabulaire: [
        { mot: "PMA", def: "les Pays les Moins Avancés, les moins développés de la planète" },
        { mot: "pays émergent", def: "un pays dont l'économie grandit vite et où la vie des habitants s'améliore" },
        { mot: "taux de fécondité", def: "le nombre moyen d'enfants par femme" }
      ],
      schema: null, prerequis: ["geographie-s01-2-f2"], source: P(2)
    },
    {
      id: "geographie-s01-2-f4", notion: "La transition démographique",
      titre: "La transition démographique",
      texte: "Une population passe de beaucoup de naissances et de décès à peu de naissances et de décès : c'est la transition démographique. Elle commence quand la mortalité recule, puis la natalité baisse à son tour. Entre les deux, la population augmente vite. En France, elle est terminée ; en Inde, elle continue ; au Burkina Faso, elle débute.",
      pointsCles: [
        "Régime ancien : natalité et mortalité hautes",
        "Phase 1 : la mortalité chute ; phase 2 : la natalité chute à son tour",
        "Régime moderne : natalité et mortalité basses",
        "France : de la fin du XVIIIe siècle aux années 1960 ; Inde : depuis les années 1920"
      ],
      dates: [], lieux: ["France", "Inde", "Burkina Faso"], personnages: [],
      vocabulaire: [
        { mot: "transition démographique", def: "le passage d'une natalité et d'une mortalité élevées à une natalité et une mortalité faibles" }
      ],
      schema: "geographie-s01-2-s1", prerequis: ["geographie-s01-2-f3"], source: P(5)
    },
    {
      id: "geographie-s01-2-f5", notion: "Accroissement naturel et solde migratoire",
      titre: "Mesurer l'évolution d'une population",
      texte: "Pour suivre la population d'un pays, on compte les naissances, les décès, les immigrés qui arrivent et les émigrés qui partent. Le taux de natalité donne les naissances pour mille habitants ; le taux de mortalité, les décès. Naissances moins décès donnent l'accroissement naturel, immigrés moins émigrés le solde migratoire. Les deux ensemble font la croissance démographique.",
      pointsCles: [
        "Naissances − décès = accroissement naturel",
        "Immigrés − émigrés = solde migratoire",
        "Accroissement naturel + solde migratoire = croissance démographique",
        "Natalité et mortalité se comptent pour mille habitants ; la fécondité, en enfants par femme"
      ],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "accroissement naturel", def: "ce qu'on obtient en retirant le nombre de décès du nombre de naissances" },
        { mot: "solde migratoire", def: "l'écart entre les immigrés qui arrivent et les émigrés qui partent" },
        { mot: "émigré", def: "une personne qui a quitté son pays pour aller vivre ailleurs" },
        { mot: "taux de natalité", def: "le nombre de naissances comptées pour mille habitants" },
        { mot: "taux de mortalité", def: "le nombre de décès comptés pour mille habitants" }
      ],
      schema: null, prerequis: ["geographie-s01-2-f1"], source: P(7)
    }
  ],
  schemas: [
    { id: "geographie-s01-2-s1",
      legende: "La transition démographique : la mortalité baisse d'abord, la natalité ensuite ; entre les deux, la population augmente vite.",
      svg: schemaTransition() }
  ],
  questions: [
    // f1
    { id: "geographie-s01-2-q1", fiche: "geographie-s01-2-f1", type: "qcm", niveau: 1,
      enonce: "Vers quelle époque la Terre a-t-elle atteint un milliard d'habitants ?",
      choix: ["Au début du XIXe siècle", "Au Moyen Âge", "Au milieu du XXe siècle", "Dans l'Antiquité"],
      reponse: "Au début du XIXe siècle",
      explication: "Le premier milliard est atteint au début du XIXe siècle. La très forte hausse vient bien plus tard, après 1950.", source: P(1) },
    { id: "geographie-s01-2-q2", fiche: "geographie-s01-2-f1", type: "vrai_faux", niveau: 1,
      enonce: "Depuis 1950, la population mondiale a environ triplé.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui, la population a été multipliée par trois en quelques dizaines d'années.", source: P(1) },
    { id: "geographie-s01-2-q3", fiche: "geographie-s01-2-f1", type: "qcm", niveau: 2,
      enonce: "Comment la croissance de la population mondiale évolue-t-elle aujourd'hui ?",
      choix: ["Elle ralentit un peu, mais la population continue d'augmenter", "Elle s'est complètement arrêtée", "Elle s'accélère partout", "La population mondiale diminue déjà"],
      reponse: "Elle ralentit un peu, mais la population continue d'augmenter",
      explication: "La hausse ralentit, mais la Terre gagne toujours des habitants. On en attend environ 9 milliards vers le milieu du siècle.", source: P(1) },
    { id: "geographie-s01-2-q4", fiche: "geographie-s01-2-f1", type: "qcm", niveau: 2,
      enonce: "D'après le cours, combien d'habitants la Terre devrait-elle compter vers le milieu du siècle ?",
      choix: ["Environ 9 milliards", "Environ 3 milliards", "Environ 1 milliard", "Environ 50 milliards"],
      reponse: "Environ 9 milliards",
      explication: "Malgré le ralentissement, la population continue de monter. Elle devrait approcher les 9 milliards.", source: P(1) },
    // f2
    { id: "geographie-s01-2-q5", fiche: "geographie-s01-2-f2", type: "qcm_multiple", niveau: 2,
      enonce: "Quels progrès expliquent qu'on vive plus longtemps ?",
      choix: ["Une alimentation plus riche et plus variée", "Les vaccins et les antibiotiques", "Une meilleure hygiène", "Des machines qui rendent le travail moins pénible", "Des familles plus nombreuses", "Des villes plus grandes"],
      reponse: ["Une alimentation plus riche et plus variée", "Les vaccins et les antibiotiques", "Une meilleure hygiène", "Des machines qui rendent le travail moins pénible"],
      explication: "Quatre progrès se sont ajoutés : alimentation, médecine, hygiène et techniques. Ensemble, ils allongent la vie.", source: P(1) },
    { id: "geographie-s01-2-q6", fiche: "geographie-s01-2-f2", type: "vrai_faux", niveau: 1,
      enonce: "La hausse de la population vient surtout d'une mortalité plus basse et d'une vie plus longue.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : on meurt moins et on vit plus longtemps, donc la population grossit.", source: P(1) },
    { id: "geographie-s01-2-q7", fiche: "geographie-s01-2-f2", type: "qcm", niveau: 1,
      enonce: "Lequel de ces progrès améliore l'hygiène ?",
      choix: ["Le ramassage des ordures", "Les antibiotiques", "Les grues et les chariots élévateurs", "La chirurgie"],
      reponse: "Le ramassage des ordures",
      explication: "Le ramassage des ordures rend la vie plus propre. Antibiotiques et chirurgie sont des progrès médicaux, les grues des progrès techniques.", source: P(1) },
    { id: "geographie-s01-2-q8", fiche: "geographie-s01-2-f2", type: "qcm", niveau: 2,
      enonce: "Pourquoi les progrès agricoles ont-ils fait reculer la mortalité ?",
      choix: ["Parce que la nourriture, plus abondante et variée, a fait disparaître les famines", "Parce que les paysans ont arrêté de travailler", "Parce que les champs ont remplacé les hôpitaux", "Parce qu'on mange moins qu'avant"],
      reponse: "Parce que la nourriture, plus abondante et variée, a fait disparaître les famines",
      explication: "Mieux nourris, les gens ne meurent plus de faim. Les famines et les disettes ont disparu.", source: P(1) },
    { id: "geographie-s01-2-q9", fiche: "geographie-s01-2-f2", type: "vrai_faux", niveau: 2,
      enonce: "Les progrès de la médecine ne jouent presque aucun rôle dans la hausse de l'espérance de vie.",
      corrections: ["Faux : ils comptent parmi les raisons principales de cette hausse.", "Faux : ils en sont la seule et unique raison.", "Faux : ils font baisser l'espérance de vie."],
      reponse: { vrai: false, correction: "Faux : ils comptent parmi les raisons principales de cette hausse." },
      explication: "Vaccins, antibiotiques et chirurgie ont beaucoup allongé la vie. Le cours les place parmi les causes principales.", source: P(1) },
    // f3
    { id: "geographie-s01-2-q10", fiche: "geographie-s01-2-f3", type: "association", niveau: 2,
      enonce: "Relie chaque groupe de pays à l'évolution de sa population.",
      gauche: ["Les PMA", "Les pays émergents", "Les pays développés"],
      droite: ["Une population qui augmente peu, voire qui baisse", "Une croissance très forte", "Une croissance qui ralentit"],
      reponse: [[0, 1], [1, 2], [2, 0]],
      explication: "Plus un pays est développé, plus sa croissance est faible. Les PMA grandissent très vite, les pays développés très peu.", source: P(2) },
    { id: "geographie-s01-2-q11", fiche: "geographie-s01-2-f3", type: "qcm", niveau: 2,
      enonce: "Comment la natalité évolue-t-elle dans les pays émergents comme la Chine ou le Brésil ?",
      choix: ["Elle baisse et se rapproche de la mortalité", "Elle reste très élevée", "Elle monte très vite", "Elle tombe à zéro"],
      reponse: "Elle baisse et se rapproche de la mortalité",
      explication: "Dans les pays émergents, il naît moins d'enfants qu'avant. L'écart avec les décès se réduit, donc la croissance ralentit.", source: P(2) },
    { id: "geographie-s01-2-q12", fiche: "geographie-s01-2-f3", type: "vrai_faux", niveau: 1,
      enonce: "Dans les PMA, l'espérance de vie augmente mais reste plus faible qu'ailleurs.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui, on y vit plus longtemps qu'avant. Mais on y vit moins longtemps que dans les autres pays.", source: P(2) },
    { id: "geographie-s01-2-q13", fiche: "geographie-s01-2-f3", type: "qcm", niveau: 1,
      enonce: "Par combien la population de l'Afrique a-t-elle été multipliée depuis 1950 ?",
      choix: ["Par 5", "Par 2", "Par 100", "Elle a baissé"],
      reponse: "Par 5",
      explication: "C'est un chiffre-clé du cours : cinq fois plus d'habitants en Afrique depuis 1950.", source: P(2) },
    { id: "geographie-s01-2-q24", fiche: "geographie-s01-2-f3", type: "qcm", niveau: 2,
      enonce: "Pourquoi la population des PMA augmente-t-elle si vite ?",
      choix: ["Parce que la mortalité y baisse alors que la natalité reste très haute", "Parce que la mortalité y augmente fortement", "Parce que la natalité y baisse plus vite que la mortalité", "Parce que les familles y ont de moins en moins d'enfants"],
      reponse: "Parce que la mortalité y baisse alors que la natalité reste très haute",
      explication: "On y meurt moins qu'avant, mais il naît toujours beaucoup d'enfants. Les naissances dépassent largement les décès, donc la population grimpe.", source: P(2) },
    { id: "geographie-s01-2-q14", fiche: "geographie-s01-2-f3", type: "vrai_faux", niveau: 2,
      enonce: "Dans les pays développés, la population augmente toujours très vite.",
      corrections: ["Faux : elle augmente peu, et parfois elle diminue.", "Faux : elle augmente plus vite que dans les PMA.", "Faux : elle double tous les dix ans."],
      reponse: { vrai: false, correction: "Faux : elle augmente peu, et parfois elle diminue." },
      explication: "Peu de naissances et des gens qui vivent vieux : la population y grandit à peine. Dans certains pays, elle recule.", source: P(2) },
    // f4
    { id: "geographie-s01-2-q15", fiche: "geographie-s01-2-f4", type: "ordre", niveau: 2,
      enonce: "Remets dans l'ordre les étapes de la transition démographique.",
      elements: ["La natalité baisse à son tour", "Natalité et mortalité sont toutes les deux élevées", "Natalité et mortalité sont toutes les deux basses", "La mortalité baisse"],
      reponse: [1, 3, 0, 2],
      explication: "On part de taux élevés, la mortalité chute d'abord, puis la natalité. On arrive à des taux bas.", source: P(5) },
    { id: "geographie-s01-2-q16", fiche: "geographie-s01-2-f4", type: "vrai_faux", niveau: 1,
      enonce: "Pendant la transition démographique, c'est la natalité qui baisse en premier.",
      corrections: ["Faux : c'est la mortalité qui recule d'abord, la natalité suit plus tard.", "Faux : les deux montent en même temps.", "Faux : rien ne change pendant la transition."],
      reponse: { vrai: false, correction: "Faux : c'est la mortalité qui recule d'abord, la natalité suit plus tard." },
      explication: "La transition commence quand des progrès font reculer les décès. Les naissances ne baissent qu'ensuite.", source: P(5) },
    { id: "geographie-s01-2-q17", fiche: "geographie-s01-2-f4", type: "qcm", niveau: 2,
      enonce: "Pourquoi la population augmente-t-elle vite pendant la transition démographique ?",
      choix: ["Parce que les décès ont déjà baissé alors que les naissances restent nombreuses", "Parce que les naissances baissent avant les décès", "Parce que tout le monde part à l'étranger", "Parce que la mortalité augmente fortement"],
      reponse: "Parce que les décès ont déjà baissé alors que les naissances restent nombreuses",
      explication: "Il naît encore beaucoup d'enfants, mais on meurt moins. L'écart entre les deux fait grimper la population.", source: P(5) },
    { id: "geographie-s01-2-q18", fiche: "geographie-s01-2-f4", type: "association", niveau: 2,
      enonce: "Relie chaque pays à l'état de sa transition démographique, d'après le cours.",
      gauche: ["La France", "L'Inde", "Le Burkina Faso"],
      droite: ["Une transition qui ne fait que commencer", "Une transition terminée dans les années 1960", "Une transition commencée dans les années 1920, pas encore finie"],
      reponse: [[0, 1], [1, 2], [2, 0]],
      explication: "La France a fini sa transition, l'Inde est en plein dedans. Le Burkina Faso n'en est qu'au début.", source: P(5) },
    { id: "geographie-s01-2-q19", fiche: "geographie-s01-2-f4", type: "qcm", niveau: 3,
      enonce: "Quand la transition démographique a-t-elle commencé en France ?",
      choix: ["À la fin du XVIIIe siècle", "Dans les années 1920", "Dans les années 1960", "Au début du XXIe siècle"],
      reponse: "À la fin du XVIIIe siècle",
      explication: "En France, elle a duré de la fin du XVIIIe siècle aux années 1960. Les années 1920, c'est le début de celle de l'Inde.", source: P(5) },
    // f5
    { id: "geographie-s01-2-q20", fiche: "geographie-s01-2-f5", type: "qcm", niveau: 1,
      enonce: "Comment calcule-t-on l'accroissement naturel d'un pays ?",
      choix: ["Naissances moins décès", "Immigrés moins émigrés", "Naissances plus décès", "Décès moins immigrés"],
      reponse: "Naissances moins décès",
      explication: "L'accroissement naturel ne regarde que les naissances et les décès. Les arrivées et les départs forment le solde migratoire.", source: P(7) },
    { id: "geographie-s01-2-q21", fiche: "geographie-s01-2-f5", type: "trou", niveau: 2,
      enonce: "Complète le calcul.",
      texte: "Immigrés moins émigrés donnent le ___. Ajouté à l'accroissement naturel, il donne la ___ démographique.",
      banque: ["solde migratoire", "croissance", "natalité", "transition"],
      reponse: [["solde migratoire"], ["croissance"]],
      explication: "Le solde migratoire compare arrivées et départs. Avec l'accroissement naturel, il donne la croissance démographique.", source: P(7) },
    { id: "geographie-s01-2-q22", fiche: "geographie-s01-2-f5", type: "vrai_faux", niveau: 1,
      enonce: "Le solde migratoire compare les naissances et les décès.",
      corrections: ["Faux : il compare les immigrés qui arrivent et les émigrés qui partent.", "Faux : il compare les villes et les campagnes.", "Faux : il ne compte que les enfants."],
      reponse: { vrai: false, correction: "Faux : il compare les immigrés qui arrivent et les émigrés qui partent." },
      explication: "Naissances et décès, c'est l'accroissement naturel. Le solde migratoire parle de ceux qui arrivent et de ceux qui partent.", source: P(7) },
    { id: "geographie-s01-2-q23", fiche: "geographie-s01-2-f5", type: "qcm", niveau: 3,
      enonce: "Un pays a plus de naissances que de décès, et autant d'immigrés que d'émigrés. Que fait sa population ?",
      choix: ["Elle augmente", "Elle baisse", "Elle reste exactement la même", "On ne peut rien en dire"],
      reponse: "Elle augmente",
      explication: "L'accroissement naturel est positif et le solde migratoire est nul. Leur somme est positive, donc la population grandit.", source: P(7) },
    { id: "geographie-s01-2-q25", fiche: "geographie-s01-2-f5", type: "vrai_faux", niveau: 1,
      enonce: "Le taux de natalité compte les décès pour mille habitants.",
      corrections: ["Faux : il compte les naissances pour mille habitants ; les décès, c'est le taux de mortalité.", "Faux : il compte le nombre d'enfants par femme.", "Faux : il compte les immigrés qui arrivent dans le pays."],
      reponse: { vrai: false, correction: "Faux : il compte les naissances pour mille habitants ; les décès, c'est le taux de mortalité." },
      explication: "Natalité parle des naissances, mortalité des décès. Les deux se comptent pour mille habitants.", source: P(5) }
  ],
  bonus: [],
  nonCouvert: [
    "Les graphiques et la carte du cours (évolution de la population mondiale, croissance dans le monde, fécondité par pays) : seuls leurs titres sont lisibles dans l'extraction, leurs valeurs ne sont pas reprises.",
    "Page 6 (les pays les plus peuplés du monde) : exercice qui recoupe le devoir n° 1, non repris.",
    "Page 8 (carte mentale à compléter, texte sur le risque de surpeuplement) et page 9 (la Chine) : exercices, non repris.",
    "Les vidéos du cours (repère V au tableau de progression) ne sont pas déposées."
  ]
};
