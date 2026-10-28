// Source en clair du cours geographie-s01-2 (Thème 1, cours 1, 1re partie : croissance et développement de la population).
// Compilé (réponses brouillées) par node atelier/outils/compiler-cours.js vers jeu/data/cours/geographie-s01-2.js.
// Pages utilisées : 1, 2, 5 et 7 du cours 1. Le devoir geographie-d1 couvre ce cours : aucune question ne reprend
// ses questions, ses documents, ses chiffres ni ses réponses attendues (les mots qu'il demande de définir ne sont
// pas posés tels quels). Les définitions du cours (page 5) sont dans « vocabulaire » : le cahier des charges (section 9)
// autorise définitions et repères du cours, et le devoir corrigé montre qu'elles sont à retravailler.
// Fiches de programme (règle du 28/10/2026, demande de Romain : « J'ai pas les cours d'histoire-géo : inspire-toi du
// programme officiel de 5e ») : f6 (les jalons de la population mondiale d'après l'ONU) et f7 (les continents par
// population), faits vérifiés sur les pages citées ; leurs questions sont des questions de thème (source { theme, titre,
// editeur, url }). Les fiches f1 à f5 et leurs questions viennent du cours déposé et restent inchangées. Anti-spoil
// (devoir n° 1) : aucune question ne demande le nombre d'habitants de la Terre en 2020, le seuil de renouvellement ni la
// liste des pays les plus peuplés ; les causes de la croissance de l'Afrique sont interrogées une par une.
// Relecture du 28/10/2026 (après-midi), pages rouvertes : q24 réécrite (elle reprenait la réponse attendue B2 du devoir n° 1 ;
// une cause à la fois désormais), q49 ajustée à la page (marge de quinze mois en 1987), l'Inde et la Chine retirées de la fiche f7
// (repère du devoir n° 1, fait absent de la page citée).
const F = "cours/geographie/Geo 5e - Theme 1 - Cours 1.pdf";
const P = (page) => ({ fichier: F, page: page });
const THEME = "Thème 1 – Cours 1 – 1re partie – Croissance et développement de la population";
const T = (titre, editeur, url) => ({ theme: THEME, titre: titre, editeur: editeur, url: url });
// Fiches de programme : sous-thème officiel et page où les faits ont été vérifiés.
const PR = (titre, editeur, url) => ({ programme: "La croissance démographique et ses effets", titre: titre, editeur: editeur, url: url });
const ONU = "Organisation des Nations Unies (ONU)";
const U_ONU = "https://www.un.org/fr/global-issues/population";
const U_POP = "https://fr.wikipedia.org/wiki/Population_mondiale";
const U_JOUR = "https://fr.wikipedia.org/wiki/Journ%C3%A9e_mondiale_de_la_population";
const U_TRANS = "https://fr.wikipedia.org/wiki/Transition_d%C3%A9mographique";

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
    },
    {
      id: "geographie-s01-2-f6", notion: "Les jalons de la population mondiale (ONU)",
      titre: "8 milliards d'humains : les caps de l'ONU",
      texte: "L'ONU suit la population mondiale et date ses grands caps. 5 milliards le 11 juillet 1987 ; 8 milliards le 15 novembre 2022. D'après ses prévisions de 2024, le cap des 9 milliards serait franchi vers 2037, puis la population culminerait vers 10,3 milliards au milieu des années 2080, avant de baisser lentement.",
      pointsCles: [
        "11 juillet 1987 : 5 milliards ; 15 novembre 2022 : 8 milliards (ONU)",
        "Il a fallu une douzaine d'années pour passer de 7 à 8 milliards",
        "Prévision ONU (2024) : 9 milliards vers 2037, sommet d'environ 10,3 milliards vers 2085, puis lente baisse",
        "Espérance de vie dans le monde : 73,3 ans en 2024 ; fécondité : 2,25 enfants par femme",
        "Les dates des caps sont des estimations symboliques : personne ne compte les humains un par un"
      ],
      astuce: "Les prévisions changent à chaque révision de l'ONU : retiens surtout les caps déjà franchis.",
      dates: [
        { annee: 1987, evenement: "5 milliards d'habitants sur Terre (11 juillet)" },
        { annee: 2022, evenement: "8 milliards d'habitants sur Terre (15 novembre)" }
      ],
      lieux: [], personnages: [],
      vocabulaire: [
        { mot: "ONU", def: "l'Organisation des Nations unies, qui réunit presque tous les pays du monde et publie les chiffres de population" },
        { mot: "projection", def: "un calcul de ce que pourrait être la population dans l'avenir, si les tendances continuent" }
      ],
      schema: null, prerequis: ["geographie-s01-2-f1"], source: PR("Population", ONU, U_ONU)
    },
    {
      id: "geographie-s01-2-f7", notion: "Les continents par population",
      titre: "Où vivent les humains ?",
      texte: "En 2023, d'après l'ONU, près de six humains sur dix vivent en Asie : 4,8 milliards. L'Afrique vient ensuite avec 1,5 milliard, puis les Amériques (1 milliard), l'Europe (750 millions) et l'Océanie (46 millions). La croissance à venir se concentre en Afrique subsaharienne : sa population devrait augmenter de près de 80 % d'ici 2054, pour atteindre 2,2 milliards.",
      pointsCles: [
        "Asie 59 %, Afrique 18 %, Amériques 13 %, Europe 9 %, Océanie moins de 1 % (ONU, 2023)",
        "Afrique subsaharienne : + 79 % d'ici 2054, soit 2,2 milliards d'habitants (prévision ONU)",
        "Neuf pays africains, dont l'Angola, le Niger et la RDC, devraient voir leur population doubler entre 2024 et 2054",
        "La Chine devrait perdre environ 200 millions d'habitants d'ici 2054"
      ],
      dates: [], lieux: ["Asie", "Afrique subsaharienne", "Europe", "Amériques", "Océanie"], personnages: [],
      vocabulaire: [
        { mot: "Afrique subsaharienne", def: "la partie de l'Afrique située au sud du Sahara" }
      ],
      schema: null, prerequis: ["geographie-s01-2-f1", "geographie-s01-2-f3"], source: PR("Population mondiale", "Wikipédia", U_POP)
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
      choix: ["Au début du XIXe siècle", "Au début du XXe siècle", "Au milieu du XXe siècle", "Dans l'Antiquité"],
      reponse: "Au début du XIXe siècle",
      explication: "Le premier milliard est atteint au début du XIXe siècle. La très forte hausse vient bien plus tard, après 1950.", source: P(1) },
    { id: "geographie-s01-2-q2", fiche: "geographie-s01-2-f1", type: "vrai_faux", niveau: 1,
      enonce: "Depuis 1950, la population mondiale a environ triplé.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui, la population a été multipliée par trois en quelques dizaines d'années.", source: P(1) },
    { id: "geographie-s01-2-q3", fiche: "geographie-s01-2-f1", type: "qcm", niveau: 2,
      enonce: "Comment la croissance de la population mondiale évolue-t-elle aujourd'hui ?",
      choix: ["Elle ralentit un peu, mais la population continue d'augmenter", "Elle s'accélère, et la population augmente plus vite que jamais", "Elle s'est arrêtée, et la population reste désormais stable", "Elle s'est inversée, et la population commence à diminuer"],
      reponse: "Elle ralentit un peu, mais la population continue d'augmenter",
      explication: "La hausse ralentit, mais la Terre gagne toujours des habitants. On en attend environ 9 milliards vers le milieu du siècle.", source: P(1) },
    { id: "geographie-s01-2-q4", fiche: "geographie-s01-2-f1", type: "qcm", niveau: 2,
      enonce: "Combien d'habitants la Terre devrait-elle compter vers le milieu du siècle ?",
      choix: ["Environ 9 milliards", "Environ 3 milliards", "Environ 5 milliards", "Environ 20 milliards"],
      reponse: "Environ 9 milliards",
      explication: "Malgré le ralentissement, la population continue de monter. Elle devrait approcher les 9 milliards.", source: P(1) },
    { id: "geographie-s01-2-q26", fiche: "geographie-s01-2-f1", type: "vrai_faux", niveau: 2,
      enonce: "La forte hausse de la population mondiale depuis 1950 concerne surtout les pays du Nord.",
      corrections: ["Faux : elle concerne surtout les pays du Sud.", "Faux : elle touche tous les pays de la même façon.", "Faux : elle s'est arrêtée dans les pays du Sud depuis 1950."],
      reponse: { vrai: false, correction: "Faux : elle concerne surtout les pays du Sud." },
      explication: "Depuis 1950, ce sont surtout les pays du Sud qui gagnent des habitants. Au Nord, la population augmente peu.", source: P(1) },
    { id: "geographie-s01-2-q27", fiche: "geographie-s01-2-f1", type: "ordre", niveau: 2,
      enonce: "Remets dans l'ordre ces étapes de la population mondiale.",
      elements: ["La population mondiale commence à grimper très fort", "La Terre devrait approcher 9 milliards d'habitants", "La Terre atteint son premier milliard d'habitants"],
      reponse: [2, 0, 1],
      explication: "Le premier milliard est atteint au début du XIXe siècle, et la très forte hausse commence vers 1950. Environ 9 milliards sont attendus vers le milieu du XXIe siècle.", source: P(1) },
    { id: "geographie-s01-2-q28", fiche: "geographie-s01-2-f1", type: "qcm", niveau: 3,
      enonce: "Laquelle de ces phrases sur la population mondiale est juste ?",
      choix: ["Elle a environ triplé depuis 1950, et sa hausse ralentit un peu", "Elle a environ triplé depuis 1950, et sa hausse s'accélère", "Elle a environ doublé depuis 1950, et sa hausse ralentit un peu", "Elle a environ triplé depuis 1950, mais elle commence à baisser"],
      reponse: "Elle a environ triplé depuis 1950, et sa hausse ralentit un peu",
      explication: "La population mondiale a été multipliée par trois depuis 1950. Sa hausse ralentit un peu, mais elle continue.", source: P(1) },
    // f2
    { id: "geographie-s01-2-q5", fiche: "geographie-s01-2-f2", type: "qcm_multiple", niveau: 2,
      enonce: "Quels progrès expliquent qu'on vive plus longtemps ?",
      choix: ["Une alimentation plus riche et plus variée", "Les vaccins et les antibiotiques", "Une meilleure hygiène", "Des machines qui rendent le travail moins pénible", "Des familles plus nombreuses", "L'arrivée de nombreux immigrés"],
      reponse: ["Une alimentation plus riche et plus variée", "Les vaccins et les antibiotiques", "Une meilleure hygiène", "Des machines qui rendent le travail moins pénible"],
      explication: "Quatre progrès se sont ajoutés : alimentation, médecine, hygiène et techniques. Des familles nombreuses ou des immigrés font grossir une population, mais n'allongent pas la vie.", source: P(1) },
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
      choix: ["Parce que, mieux nourris, les gens ne meurent plus de famine", "Parce qu'ils ont fait augmenter le nombre de naissances", "Parce qu'ils ont apporté les vaccins et les antibiotiques", "Parce qu'ils ont rendu les logements plus propres et plus sains"],
      reponse: "Parce que, mieux nourris, les gens ne meurent plus de famine",
      explication: "Les progrès agricoles ont donné une nourriture plus abondante et variée. Les famines et les disettes ont disparu, donc moins de gens meurent.", source: P(1) },
    { id: "geographie-s01-2-q9", fiche: "geographie-s01-2-f2", type: "vrai_faux", niveau: 2,
      enonce: "Les progrès de la médecine ne jouent presque aucun rôle dans la hausse de l'espérance de vie.",
      corrections: ["Faux : ils comptent parmi les raisons principales de cette hausse.", "Faux : ils en sont la seule et unique raison.", "Faux : ils jouent un rôle, mais bien moins que les machines au travail."],
      reponse: { vrai: false, correction: "Faux : ils comptent parmi les raisons principales de cette hausse." },
      explication: "Vaccins, antibiotiques et chirurgie ont beaucoup allongé la vie. Ils comptent parmi les causes principales, à côté de l'alimentation, de l'hygiène et des techniques.", source: P(1) },
    { id: "geographie-s01-2-q29", fiche: "geographie-s01-2-f2", type: "association", niveau: 2,
      enonce: "Relie chaque exemple au progrès qu'il représente.",
      gauche: ["Les vaccins", "Les douches et les toilettes dans chaque logement", "Les chariots élévateurs", "La fin des famines"],
      droite: ["Un progrès technique", "Un progrès agricole", "Un progrès médical", "Un progrès de l'hygiène"],
      reponse: [[0, 2], [1, 3], [2, 0], [3, 1]],
      explication: "Les vaccins relèvent de la médecine, les douches et les toilettes de l'hygiène. Les chariots élévateurs allègent le travail, et une agriculture plus productive a mis fin aux famines.", source: P(1) },
    { id: "geographie-s01-2-q30", fiche: "geographie-s01-2-f2", type: "vrai_faux", niveau: 2,
      enonce: "L'eau de Javel fait partie des progrès médicaux qui ont allongé la vie.",
      corrections: ["Faux : c'est un progrès de l'hygiène.", "Faux : c'est un progrès technique, comme les grues.", "Faux : c'est un progrès agricole."],
      reponse: { vrai: false, correction: "Faux : c'est un progrès de l'hygiène." },
      explication: "L'eau de Javel fait partie des progrès de l'hygiène, comme le ramassage des ordures. Les progrès médicaux, ce sont les vaccins, les antibiotiques et la chirurgie.", source: P(1) },
    { id: "geographie-s01-2-q31", fiche: "geographie-s01-2-f2", type: "qcm", niveau: 3,
      enonce: "Une ville se met à traiter ses eaux usées, et ses habitants conservent mieux leurs aliments. Quel progrès est-ce ?",
      choix: ["Un progrès de l'hygiène", "Un progrès médical", "Un progrès agricole", "Un progrès technique au travail"],
      reponse: "Un progrès de l'hygiène",
      explication: "Traiter les eaux usées et mieux conserver les aliments, c'est améliorer l'hygiène. Ce progrès aide, lui aussi, à vivre plus longtemps.", source: P(1) },
    { id: "geographie-s01-2-q32", fiche: "geographie-s01-2-f2", type: "qcm", niveau: 2,
      enonce: "Comment les grues et les machines puissantes ont-elles aidé à vivre plus longtemps ?",
      choix: ["En rendant le travail moins pénible", "En soignant des maladies graves", "En produisant plus de nourriture", "En rendant les logements plus propres"],
      reponse: "En rendant le travail moins pénible",
      explication: "Ces progrès techniques rendent le travail moins dur pour le corps. Ils s'ajoutent à l'alimentation, à la médecine et à l'hygiène.", source: P(1) },
    // f3
    { id: "geographie-s01-2-q10", fiche: "geographie-s01-2-f3", type: "association", niveau: 2,
      enonce: "Relie chaque groupe de pays à l'évolution de sa population.",
      gauche: ["Les PMA", "Les pays émergents", "Les pays développés"],
      droite: ["Une population qui augmente peu, voire qui baisse", "Une croissance très forte", "Une croissance qui ralentit"],
      reponse: [[0, 1], [1, 2], [2, 0]],
      explication: "Plus un pays est développé, plus sa croissance est faible. Les PMA grandissent très vite, les pays développés très peu.", source: P(2) },
    { id: "geographie-s01-2-q11", fiche: "geographie-s01-2-f3", type: "qcm", niveau: 2,
      enonce: "Comment la natalité évolue-t-elle dans les pays émergents comme la Chine ou le Brésil ?",
      choix: ["Elle baisse et se rapproche de la mortalité", "Elle reste très élevée, loin au-dessus de la mortalité", "Elle baisse et passe nettement sous la mortalité", "Elle monte et s'éloigne de plus en plus de la mortalité"],
      reponse: "Elle baisse et se rapproche de la mortalité",
      explication: "Dans les pays émergents, il naît moins d'enfants qu'avant. L'écart avec les décès se réduit, donc la croissance ralentit.", source: P(2) },
    { id: "geographie-s01-2-q12", fiche: "geographie-s01-2-f3", type: "vrai_faux", niveau: 1,
      enonce: "Dans les PMA, l'espérance de vie augmente mais reste plus faible qu'ailleurs.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui, on y vit plus longtemps qu'avant. Mais on y vit moins longtemps que dans les autres pays.", source: P(2) },
    { id: "geographie-s01-2-q13", fiche: "geographie-s01-2-f3", type: "qcm", niveau: 1,
      enonce: "Par combien la population de l'Afrique a-t-elle été multipliée depuis 1950 ?",
      choix: ["Par 5", "Par 3", "Par 2", "Par 10"],
      reponse: "Par 5",
      explication: "C'est un chiffre-clé : cinq fois plus d'habitants en Afrique depuis 1950. Pour le monde entier, c'est environ trois fois plus.", source: P(2) },
    { id: "geographie-s01-2-q24", fiche: "geographie-s01-2-f3", type: "qcm", niveau: 2,
      enonce: "Dans les PMA, on meurt moins qu'avant. Pourquoi la population y augmente-t-elle pourtant si vite ?",
      choix: ["Parce qu'il y naît toujours beaucoup d'enfants : les naissances dépassent largement les décès", "Parce que la natalité y a chuté encore plus vite que la mortalité", "Parce que des millions d'habitants des pays riches viennent s'y installer", "Parce qu'on y vit plus longtemps que partout ailleurs"],
      reponse: "Parce qu'il y naît toujours beaucoup d'enfants : les naissances dépassent largement les décès",
      explication: "Moins de décès, mais toujours autant de naissances : l'écart entre les deux fait grimper la population. C'est le début de la transition démographique.", source: P(2) },
    { id: "geographie-s01-2-q14", fiche: "geographie-s01-2-f3", type: "vrai_faux", niveau: 2,
      enonce: "Dans les pays développés, la natalité est faible mais la population augmente très vite.",
      corrections: ["Faux : la population y augmente peu, et parfois elle diminue.", "Faux : la natalité y est très forte, comme dans les PMA.", "Faux : la population y augmente vite grâce à une natalité forte."],
      reponse: { vrai: false, correction: "Faux : la population y augmente peu, et parfois elle diminue." },
      explication: "Peu de naissances et des gens qui vivent vieux : la population y grandit à peine. Dans certains pays, elle recule.", source: P(2) },
    { id: "geographie-s01-2-q33", fiche: "geographie-s01-2-f3", type: "qcm_multiple", niveau: 2,
      enonce: "Lesquels de ces pays sont des pays émergents ?",
      choix: ["La Chine", "Le Brésil", "Le Japon", "La Russie", "Le Burkina Faso"],
      reponse: ["La Chine", "Le Brésil"],
      explication: "La Chine et le Brésil sont des pays émergents, où la croissance ralentit. Le Japon et la Russie sont des pays développés, et le Burkina Faso n'est qu'au début de sa transition.", source: P(2) },
    { id: "geographie-s01-2-q34", fiche: "geographie-s01-2-f3", type: "vrai_faux", niveau: 2,
      enonce: "Les PMA, où la croissance démographique est très forte, se trouvent notamment en Afrique et en Amérique du Sud.",
      corrections: ["Faux : ils se trouvent notamment en Afrique et en Asie du Sud.", "Faux : ils se trouvent notamment en Europe et en Russie.", "Faux : ils se trouvent notamment en Chine et au Brésil."],
      reponse: { vrai: false, correction: "Faux : ils se trouvent notamment en Afrique et en Asie du Sud." },
      explication: "La croissance est très forte dans les PMA, notamment en Afrique et en Asie du Sud. La Chine et le Brésil sont des pays émergents.", source: P(2) },
    { id: "geographie-s01-2-q35", fiche: "geographie-s01-2-f3", type: "qcm", niveau: 3,
      enonce: "Dans un pays, la natalité baisse et se rapproche de la mortalité, et la vie des habitants s'améliore vite. Dans quel groupe le ranger ?",
      choix: ["Les pays émergents", "Les PMA", "Les pays développés", "Les pays en tout début de transition"],
      reponse: "Les pays émergents",
      explication: "Une natalité qui rejoint la mortalité et une vie qui s'améliore : c'est le cas des pays émergents, comme la Chine ou le Brésil. Dans les PMA, la natalité reste très haute.", source: P(2) },
    // f4
    { id: "geographie-s01-2-q15", fiche: "geographie-s01-2-f4", type: "ordre", niveau: 2,
      enonce: "Remets dans l'ordre les étapes de la transition démographique.",
      elements: ["La natalité baisse à son tour", "Natalité et mortalité sont toutes les deux élevées", "Natalité et mortalité sont toutes les deux basses", "La mortalité baisse"],
      reponse: [1, 3, 0, 2],
      explication: "On part de taux élevés, la mortalité chute d'abord, puis la natalité. On arrive à des taux bas.", source: P(5) },
    { id: "geographie-s01-2-q16", fiche: "geographie-s01-2-f4", type: "vrai_faux", niveau: 2,
      enonce: "Pendant la transition démographique, c'est la natalité qui baisse en premier.",
      corrections: ["Faux : c'est la mortalité qui recule d'abord, la natalité suit plus tard.", "Faux : les deux baissent en même temps, au même rythme.", "Faux : la natalité monte d'abord, puis la mortalité baisse."],
      reponse: { vrai: false, correction: "Faux : c'est la mortalité qui recule d'abord, la natalité suit plus tard." },
      explication: "La transition commence quand des progrès font reculer les décès. Les naissances ne baissent qu'ensuite.", source: P(5) },
    { id: "geographie-s01-2-q17", fiche: "geographie-s01-2-f4", type: "qcm", niveau: 2,
      enonce: "Pourquoi la population augmente-t-elle vite pendant la transition démographique ?",
      choix: ["Parce que les décès ont déjà baissé, mais pas encore les naissances", "Parce que les naissances ont déjà baissé, mais pas encore les décès", "Parce que les naissances et les décès montent en même temps", "Parce que la natalité et la mortalité sont déjà toutes les deux basses"],
      reponse: "Parce que les décès ont déjà baissé, mais pas encore les naissances",
      explication: "Il naît encore beaucoup d'enfants, mais on meurt moins. L'écart entre les deux fait grimper la population.", source: P(5) },
    { id: "geographie-s01-2-q18", fiche: "geographie-s01-2-f4", type: "association", niveau: 3,
      enonce: "Relie chaque pays à l'état de sa transition démographique.",
      gauche: ["La France", "L'Inde", "Le Burkina Faso"],
      droite: ["Une transition qui ne fait que commencer", "Une transition terminée dans les années 1960", "Une transition commencée dans les années 1920, pas encore finie"],
      reponse: [[0, 1], [1, 2], [2, 0]],
      explication: "La France a fini sa transition, l'Inde est en plein dedans. Le Burkina Faso n'en est qu'au début.", source: P(5) },
    { id: "geographie-s01-2-q19", fiche: "geographie-s01-2-f4", type: "qcm", niveau: 2,
      enonce: "Quand la transition démographique a-t-elle commencé en France ?",
      choix: ["À la fin du XVIIIe siècle", "Dans les années 1920", "Dans les années 1960", "Vers le milieu du XIXe siècle"],
      reponse: "À la fin du XVIIIe siècle",
      explication: "En France, elle a duré de la fin du XVIIIe siècle aux années 1960. Les années 1920, c'est le début de celle de l'Inde.", source: P(5) },
    { id: "geographie-s01-2-q37", fiche: "geographie-s01-2-f4", type: "qcm", niveau: 3,
      enonce: "Dans un pays, la mortalité vient de chuter, mais il naît encore autant d'enfants qu'avant. Où en est-il ?",
      choix: ["Dans la phase 1 de la transition", "Dans le régime démographique ancien", "Dans la phase 2 de la transition", "Dans le régime démographique moderne"],
      reponse: "Dans la phase 1 de la transition",
      explication: "La phase 1 commence quand la mortalité chute, alors que la natalité reste haute. La natalité ne baisse qu'à la phase 2.", source: P(5) },
    { id: "geographie-s01-2-q38", fiche: "geographie-s01-2-f4", type: "qcm", niveau: 2,
      enonce: "Comment l'écart entre naissances et décès évolue-t-il à la fin de la transition ?",
      choix: ["Il se réduit, car la natalité baisse à son tour", "Il grandit, car la mortalité remonte", "Il grandit, car la natalité augmente encore", "Il reste aussi grand qu'au milieu de la transition"],
      reponse: "Il se réduit, car la natalité baisse à son tour",
      explication: "À la phase 2, la natalité chute et rejoint la mortalité. Dans le régime moderne, les deux sont basses et proches.", source: P(5) },
    { id: "geographie-s01-2-q39", fiche: "geographie-s01-2-f4", type: "qcm_multiple", niveau: 3,
      enonce: "Quelles phrases sur la transition démographique sont justes ?",
      choix: ["Elle commence quand la mortalité recule", "La natalité baisse après la mortalité", "Elle s'achève quand natalité et mortalité sont basses", "Elle a commencé partout en même temps", "Elle est déjà terminée en Inde"],
      reponse: ["Elle commence quand la mortalité recule", "La natalité baisse après la mortalité", "Elle s'achève quand natalité et mortalité sont basses"],
      explication: "La transition part du recul de la mortalité, puis la natalité suit, jusqu'à des taux bas. Elle a commencé à des moments différents selon les pays et n'est pas finie en Inde.", source: P(5) },
    { id: "geographie-s01-2-q40", fiche: "geographie-s01-2-f4", type: "vrai_faux", niveau: 1,
      enonce: "Dans le régime démographique moderne, la natalité et la mortalité sont toutes les deux basses.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui, c'est la fin de la transition. Au départ, dans le régime ancien, les deux étaient élevées.", source: P(5) },
    // f5
    { id: "geographie-s01-2-q20", fiche: "geographie-s01-2-f5", type: "qcm", niveau: 1,
      enonce: "Comment calcule-t-on l'accroissement naturel d'un pays ?",
      choix: ["Naissances moins décès", "Immigrés moins émigrés", "Naissances plus décès", "Décès moins naissances"],
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
      corrections: ["Faux : il compare les immigrés qui arrivent et les émigrés qui partent.", "Faux : il compare les naissances et les immigrés.", "Faux : il compare les décès et les émigrés."],
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
      explication: "Natalité parle des naissances, mortalité des décès. Les deux se comptent pour mille habitants.", source: P(5) },
    { id: "geographie-s01-2-q41", fiche: "geographie-s01-2-f5", type: "qcm", niveau: 3,
      enonce: "Une ville compte 50 naissances et 20 décès dans l'année, sans arrivée ni départ. Quel est son accroissement naturel ?",
      choix: ["+ 30 habitants", "+ 70 habitants", "− 30 habitants", "+ 50 habitants"],
      reponse: "+ 30 habitants",
      explication: "L'accroissement naturel, c'est les naissances moins les décès : 50 − 20 = 30. La ville gagne donc 30 habitants.", source: P(7) },
    { id: "geographie-s01-2-q42", fiche: "geographie-s01-2-f5", type: "qcm", niveau: 3,
      enonce: "Un pays a un accroissement naturel de + 100 et un solde migratoire de − 30. Quelle est sa croissance démographique ?",
      choix: ["+ 70", "+ 130", "− 70", "+ 100"],
      reponse: "+ 70",
      explication: "La croissance démographique additionne l'accroissement naturel et le solde migratoire : 100 − 30 = 70. Le pays gagne 70 habitants.", source: P(7) },
    { id: "geographie-s01-2-q43", fiche: "geographie-s01-2-f5", type: "vrai_faux", niveau: 2,
      enonce: "Le taux de mortalité compte les décès pour cent habitants.",
      corrections: ["Faux : il compte les décès pour mille habitants.", "Faux : il compte les naissances pour mille habitants.", "Faux : il compte le nombre d'enfants par femme."],
      reponse: { vrai: false, correction: "Faux : il compte les décès pour mille habitants." },
      explication: "Natalité et mortalité se comptent pour mille habitants. Le nombre d'enfants par femme, c'est le taux de fécondité.", source: P(5) },
    { id: "geographie-s01-2-q44", fiche: "geographie-s01-2-f5", type: "qcm", niveau: 3,
      enonce: "Pourquoi un pays peut-il gagner des habitants alors qu'il compte plus de décès que de naissances ?",
      choix: ["Parce que plus d'immigrés arrivent que d'émigrés ne partent", "Parce que son accroissement naturel reste positif", "Parce que plus d'émigrés partent que d'immigrés n'arrivent", "Parce que ses habitants vivent de plus en plus longtemps"],
      reponse: "Parce que plus d'immigrés arrivent que d'émigrés ne partent",
      explication: "Avec plus de décès que de naissances, l'accroissement naturel est négatif. Seul un solde migratoire positif, plus fort que cette perte, peut faire grandir la population.", source: P(7) },
    // f6 : les jalons de la population mondiale (questions de thème)
    { id: "geographie-s01-2-q45", fiche: "geographie-s01-2-f6", type: "qcm", niveau: 1,
      enonce: "En quelle année la population mondiale a-t-elle atteint 8 milliards d'habitants, d'après l'ONU ?",
      choix: ["2022", "2011", "1999", "2037"],
      reponse: "2022",
      explication: "L'ONU a daté ce cap de novembre 2022. Les 7 milliards dataient de 2011, et les 9 milliards sont attendus vers 2037.",
      source: T("Population", ONU, U_ONU) },
    { id: "geographie-s01-2-q46", fiche: "geographie-s01-2-f6", type: "vrai_faux", niveau: 1,
      enonce: "D'après l'ONU, la population mondiale devrait continuer d'augmenter jusque vers le milieu des années 2080, puis baisser lentement.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : la prévision de 2024 donne un sommet d'environ 10,3 milliards vers 2085, puis une lente baisse. Ce n'est qu'une projection, qui change à chaque révision.",
      source: T("Population", ONU, U_ONU) },
    { id: "geographie-s01-2-q47", fiche: "geographie-s01-2-f6", type: "qcm", niveau: 2,
      enonce: "Combien de temps a-t-il fallu pour passer de 7 à 8 milliards d'humains ?",
      choix: ["Environ douze ans", "Environ trente ans", "Environ un siècle", "Moins de cinq ans"],
      reponse: "Environ douze ans",
      explication: "Les 7 milliards datent de 2011 et les 8 milliards de 2022 : une douzaine d'années. Passer de 8 à 9 milliards devrait prendre un peu plus longtemps, une quinzaine d'années.",
      source: T("Population", ONU, U_ONU) },
    { id: "geographie-s01-2-q48", fiche: "geographie-s01-2-f6", type: "ordre", niveau: 2,
      enonce: "Range ces caps de la population mondiale du plus ancien au plus récent.",
      elements: ["8 milliards d'habitants", "5 milliards d'habitants", "7 milliards d'habitants", "6 milliards d'habitants"],
      reponse: [1, 3, 2, 0],
      explication: "5 milliards en 1987, 6 milliards en 1999, 7 milliards en 2011, 8 milliards en 2022. Chaque milliard de plus arrive en une douzaine d'années.",
      source: T("Population mondiale", "Wikipédia", U_POP) },
    { id: "geographie-s01-2-q49", fiche: "geographie-s01-2-f6", type: "qcm", niveau: 2,
      enonce: "Pourquoi l'ONU annonce-t-elle un jour précis, comme en novembre 2022, pour le passage des 8 milliards ?",
      choix: ["Parce que c'est une date symbolique : la population est estimée, pas comptée un par un", "Parce que tous les pays du monde ont fait un recensement exactement le même jour", "Parce que l'ONU reçoit chaque jour le compte exact des naissances et des décès de tous les pays", "Parce que c'est le jour d'une grande conférence mondiale sur la population"],
      reponse: "Parce que c'est une date symbolique : la population est estimée, pas comptée un par un",
      explication: "Personne ne compte les humains un par un : l'ONU estime la population à partir des recensements et des registres. La date d'un cap est donc un repère symbolique : en 1987, la marge d'erreur dépassait un an.",
      source: T("Journée mondiale de la population", "Wikipédia", U_JOUR) },
    { id: "geographie-s01-2-q50", fiche: "geographie-s01-2-f6", type: "vrai_faux", niveau: 2,
      enonce: "En 2024, une femme a en moyenne un peu plus de deux enfants dans le monde.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : l'ONU compte 2,25 enfants par femme en 2024. Ce chiffre baisse et devrait passer sous le seuil de renouvellement vers la fin des années 2040.",
      source: T("Population", ONU, U_ONU) },
    { id: "geographie-s01-2-q51", fiche: "geographie-s01-2-f6", type: "trou", niveau: 2,
      enonce: "Complète les deux dates.",
      texte: "La Terre comptait 7 milliards d'habitants en ___ et 8 milliards en ___.",
      banque: ["2011", "2022", "1987", "2037"],
      reponse: [["2011"], ["2022"]],
      explication: "Le septième milliard date d'octobre 2011 et le huitième de novembre 2022. En 1987, on passait les 5 milliards ; 2037 est la date prévue pour 9 milliards.",
      source: T("Population mondiale", "Wikipédia", U_POP) },
    { id: "geographie-s01-2-q52", fiche: "geographie-s01-2-f6", type: "qcm", niveau: 3,
      enonce: "La population mondiale a été multipliée par huit entre 1800 et 2022. Qu'est-ce qui a surtout rendu cela possible ?",
      choix: ["Le recul de la mortalité, grâce aux progrès de l'alimentation, de la médecine et de l'hygiène", "Des femmes qui ont eu, à chaque génération, bien plus d'enfants que leurs mères et leurs grands-mères", "Les grandes migrations d'un continent à l'autre", "Un climat devenu plus doux sur toute la planète"],
      reponse: "Le recul de la mortalité, grâce aux progrès de l'alimentation, de la médecine et de l'hygiène",
      explication: "On meurt beaucoup moins qu'en 1800 : les enfants survivent et les adultes vivent plus vieux. La natalité, elle, n'a pas augmenté ; elle a même fini par baisser presque partout.",
      source: T("Transition démographique", "Wikipédia", U_TRANS) },
    // f7 : les continents par population (questions de thème)
    { id: "geographie-s01-2-q53", fiche: "geographie-s01-2-f7", type: "qcm", niveau: 1,
      enonce: "Quel continent regroupe près de six humains sur dix ?",
      choix: ["L'Asie", "L'Afrique", "L'Europe", "L'Amérique"],
      reponse: "L'Asie",
      explication: "L'Asie compte 4,8 milliards d'habitants en 2023, soit 59 % des humains. L'Afrique arrive loin derrière, avec 1,5 milliard.",
      source: T("Population mondiale", "Wikipédia", U_POP) },
    { id: "geographie-s01-2-q54", fiche: "geographie-s01-2-f7", type: "vrai_faux", niveau: 1,
      enonce: "L'Europe compte plus d'habitants que l'Afrique.",
      corrections: ["Faux : l'Afrique en compte environ deux fois plus.", "Faux : les deux continents ont à peu près le même nombre d'habitants.", "Faux : l'Europe est le continent le moins peuplé du monde."],
      reponse: { vrai: false, correction: "Faux : l'Afrique en compte environ deux fois plus." },
      explication: "L'Afrique compte 1,5 milliard d'habitants en 2023, l'Europe 750 millions. Et l'écart se creuse, car l'Afrique grandit vite.",
      source: T("Population mondiale", "Wikipédia", U_POP) },
    { id: "geographie-s01-2-q55", fiche: "geographie-s01-2-f7", type: "qcm", niveau: 2,
      enonce: "Que prévoit l'ONU pour la population de l'Afrique subsaharienne d'ici 2054 ?",
      choix: ["Une hausse de près de 80 %, jusqu'à 2,2 milliards d'habitants", "Une baisse de moitié, comme dans la plupart des pays d'Europe", "Une population qui ne bouge plus, parce que la fécondité y est déjà très basse", "Une hausse de 5 % seulement"],
      reponse: "Une hausse de près de 80 %, jusqu'à 2,2 milliards d'habitants",
      explication: "L'ONU attend 2,2 milliards d'habitants en Afrique subsaharienne en 2054, près de 80 % de plus qu'en 2024. C'est là que se concentre la croissance mondiale à venir.",
      source: T("Population", ONU, U_ONU) },
    { id: "geographie-s01-2-q56", fiche: "geographie-s01-2-f7", type: "qcm", niveau: 3,
      enonce: "Pourquoi la part de l'Europe dans la population mondiale recule-t-elle ?",
      choix: ["Parce que sa population augmente peu, alors que celle d'autres continents grandit vite", "Parce que beaucoup de jeunes Européens partent vivre en Asie ou en Amérique chaque année", "Parce que l'espérance de vie y baisse depuis les années 1970", "Parce que plusieurs de ses pays sont désormais comptés en Asie"],
      reponse: "Parce que sa population augmente peu, alors que celle d'autres continents grandit vite",
      explication: "Tous les pays d'Europe ont une fécondité sous le seuil de renouvellement : leur population stagne ou baisse. Pendant ce temps, l'Afrique et l'Asie gagnent des centaines de millions d'habitants.",
      source: T("Population", ONU, U_ONU) },
    { id: "geographie-s01-2-q57", fiche: "geographie-s01-2-f7", type: "association", niveau: 2,
      enonce: "Relie chaque continent à sa part de la population mondiale en 2023.",
      gauche: ["L'Asie", "L'Afrique", "Les Amériques", "L'Europe"],
      droite: ["9 %", "59 %", "13 %", "18 %"],
      reponse: [[0, 1], [1, 3], [2, 2], [3, 0]],
      explication: "Asie 59 %, Afrique 18 %, Amériques 13 %, Europe 9 %. L'Océanie complète avec moins de 1 %.",
      source: T("Population mondiale", "Wikipédia", U_POP) },
    { id: "geographie-s01-2-q58", fiche: "geographie-s01-2-f7", type: "vrai_faux", niveau: 2,
      enonce: "L'Océanie est le continent le moins peuplé, avec moins d'un humain sur cent.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : environ 46 millions d'habitants en 2023, soit 0,6 % de l'humanité. À côté, l'Europe en compte 750 millions.",
      source: T("Population mondiale", "Wikipédia", U_POP) },
    { id: "geographie-s01-2-q59", fiche: "geographie-s01-2-f7", type: "qcm", niveau: 3,
      enonce: "L'ONU prévoit que la population du Niger ou de la République démocratique du Congo double entre 2024 et 2054. Que montre cet exemple ?",
      choix: ["Que la croissance mondiale à venir se concentre en Afrique subsaharienne", "Que l'Afrique a terminé sa transition démographique", "Que ces pays accueillent chaque année des millions d'immigrés venus d'Europe et d'Asie", "Que l'Afrique est déjà le continent le plus peuplé"],
      reponse: "Que la croissance mondiale à venir se concentre en Afrique subsaharienne",
      explication: "Neuf pays africains devraient voir leur population doubler en trente ans. C'est le signe d'une croissance encore très forte, loin de la fin de la transition démographique.",
      source: T("Population", ONU, U_ONU) },
    { id: "geographie-s01-2-q60", fiche: "geographie-s01-2-f7", type: "trou", niveau: 1,
      enonce: "Complète la phrase.",
      texte: "Le continent le plus peuplé est l'___ ; le deuxième est l'___.",
      banque: ["Asie", "Afrique", "Europe", "Océanie"],
      reponse: [["Asie"], ["Afrique"]],
      explication: "L'Asie regroupe près de six humains sur dix, l'Afrique un peu moins d'un sur cinq. L'Europe et l'Océanie viennent loin derrière.",
      source: T("Population mondiale", "Wikipédia", U_POP) }
  ],
  bonus: [
    {
      id: "geographie-s01-2-b1",
      fiche: "geographie-s01-2-f2",
      titre: "La variole, une maladie disparue",
      texte: "Pendant au moins 3 000 ans, la variole a frappé l'humanité : au XXe siècle, elle a encore tué 300 millions de personnes. En 1980, après un programme mondial appuyé sur la vaccination, l'OMS a déclaré le monde libéré de cette maladie. Aucune autre maladie humaine n'a été éradiquée.",
      source: { titre: "L'OMS célèbre le quarantième anniversaire de l'éradication de la variole", editeur: "Organisation mondiale de la Santé (OMS)", url: "https://www.who.int/fr/news/item/13-12-2019-who-commemorates-the-40th-anniversary-of-smallpox-eradication" }
    },
    {
      id: "geographie-s01-2-b2",
      fiche: "geographie-s01-2-f6",
      titre: "Le 11 juillet, Journée mondiale de la population",
      texte: "Le 11 juillet 1987, l'ONU a situé le passage des 5 milliards d'humains : ce fut la « Journée des cinq milliards ». Deux ans plus tard, le Programme des Nations unies pour le développement a proposé d'en faire, chaque année, la Journée mondiale de la population. La date reste symbolique : la marge d'erreur du calcul dépassait un an.",
      source: { titre: "Journée mondiale de la population", editeur: "Wikipédia", url: U_JOUR }
    }
  ],
  nonCouvert: [
    "Les graphiques et la carte du cours (évolution de la population mondiale, croissance dans le monde, fécondité par pays) : seuls leurs titres sont lisibles dans l'extraction, leurs valeurs ne sont pas reprises.",
    "Page 6 (les pays les plus peuplés du monde) : exercice qui recoupe le devoir n° 1, non repris ; les pays les plus peuplés ne sont pas nommés dans ce cours (l'étude de cas 2 traite l'Inde).",
    "Page 8 (carte mentale, texte sur le surpeuplement) : exercices non repris ; page 9 (la Chine) sert au cours geographie-s03-1.",
    "Attente du programme : la croissance démographique vue à l'échelle d'un pays émergent (Chine) : la Chine n'apparaît qu'en prévision de baisse (f7) ; l'étude de cas 2 (Inde) complète.",
    "Attente du programme : les effets de la croissance sur l'environnement et les ressources (eau, nourriture) : traités dans la deuxième partie du cours (geographie-s02-2).",
    "Les vidéos du cours (repère V au tableau de progression) ne sont pas déposées."
  ]
};
