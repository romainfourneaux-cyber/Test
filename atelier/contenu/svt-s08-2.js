// Source en clair du cours svt-s08-2 (livret 1, chapitre 3, séance 2 : influence de la nature des sols sur les biomes ;
// ressources naturelles). Compilé (réponses brouillées) par node atelier/outils/compiler-cours.js svt-s08-2.
// Seule source déposée : le corrigé du livret 1, p. 12-13 (ressources naturelles biologiques, l'eau ; schéma d'une coupe
// de sol dessiné à la main ; diagramme circulaire du mix énergétique mondial de 2015) et p. 14 (pas à pas du diagramme).
// La leçon n'est pas déposée : l'influence des sols sur les biomes va dans nonCouvert. La coupe de sol est redessinée
// en SVG. Doute : la roche du bas est notée « primaire ou secondaire » sur le dessin manuscrit, sans explication.
const C = (page) => ({ fichier: "cours/svt/Cours Griffon 5eme SVT Livret 1 - Corriges.pdf", page: page });

// Coupe de sol redessinée d'après le schéma manuscrit du corrigé.
function schemaSol() {
  const encre = "#2e2419";
  let s = "<svg viewBox='0 0 520 330' xmlns='http://www.w3.org/2000/svg' font-family='Georgia,serif' font-size='12'>";
  s += "<rect x='0' y='0' width='520' height='330' fill='#f6f1e7'/>";
  // couches
  s += "<rect x='120' y='70' width='260' height='34' fill='#c9b07a'/>";
  s += "<rect x='120' y='104' width='260' height='70' fill='#6b4a2b'/>";
  s += "<rect x='120' y='174' width='260' height='90' fill='#a67b4f'/>";
  s += "<rect x='120' y='264' width='260' height='50' fill='#8d8d8d'/>";
  s += "<g stroke='" + encre + "' stroke-width='1.5'><line x1='120' y1='104' x2='380' y2='104'/><line x1='120' y1='174' x2='380' y2='174'/><line x1='120' y1='264' x2='380' y2='264'/></g>";
  s += "<rect x='120' y='70' width='260' height='244' fill='none' stroke='" + encre + "' stroke-width='2'/>";
  // horizons
  s += "<g stroke='#f6f1e7' stroke-dasharray='5 4'><line x1='120' y1='196' x2='380' y2='196'/><line x1='120' y1='218' x2='380' y2='218'/><line x1='120' y1='240' x2='380' y2='240'/></g>";
  s += "<g fill='#f6f1e7' font-size='10'><text x='126' y='190'>horizon 1</text><text x='126' y='212'>horizon 2</text><text x='126' y='234'>horizon 3</text><text x='126' y='256'>horizon 4</text></g>";
  // plante
  s += "<path d='M250 70 V30' stroke='#3f7d3a' stroke-width='3'/><path d='M250 45 q-18 -8 -24 -22 q20 2 24 22z M250 38 q18 -8 24 -22 q-20 2 -24 22z' fill='#5aa34f'/>";
  s += "<path d='M250 70 q-10 20 -20 40 M250 70 q8 25 15 50 M250 70 v45' stroke='#d9c8a3' stroke-width='2' fill='none'/>";
  // feuilles et lombric
  s += "<g fill='#8a5a1b'><ellipse cx='160' cy='86' rx='12' ry='5'/><ellipse cx='330' cy='90' rx='12' ry='5' transform='rotate(-20 330 90)'/></g>";
  s += "<path d='M290 126 q10 -8 20 0 q10 8 20 0' stroke='#e39a8c' stroke-width='4' fill='none'/>";
  s += "<ellipse cx='170' cy='146' rx='22' ry='9' fill='#3a2817'/>";
  // étiquettes
  s += "<g fill='" + encre + "'>";
  s += "<text x='392' y='92'>litière : débris végétaux</text>";
  s += "<text x='392' y='132'>humus : couche vivante,</text><text x='392' y='147'>pleine de décomposeurs</text>";
  s += "<text x='392' y='212'>couches profondes :</text><text x='392' y='227'>roche + matière organique</text>";
  s += "<text x='392' y='285'>roche : basalte (volcanique)</text><text x='392' y='300'>ou calcaire (sédimentaire)</text>";
  s += "<text x='282' y='40'>végétal enraciné</text>";
  s += "<text x='150' y='166' font-size='10' fill='#f6f1e7'>terrier</text><text x='292' y='146' font-size='10' fill='#f6f1e7'>lombric</text>";
  s += "</g>";
  return s + "</svg>";
}

module.exports = {
  id: "svt-s08-2",
  fiches: [
    {
      id: "svt-s08-2-f1", notion: "Le sol en coupe",
      titre: "Litière, humus, couches profondes, roche",
      texte: "Vu en coupe, le sol s'organise en couches. En surface, la litière : des débris végétaux. Dessous, l'humus, couche vivante pleine de décomposeurs comme le lombric, où des animaux creusent leurs terriers. Puis les couches profondes, en plusieurs horizons : un mélange de roche et de matière organique. Tout en bas, la roche : basalte volcanique ou calcaire sédimentaire.",
      pointsCles: [
        "Litière : débris végétaux en surface",
        "Humus : couche vivante, nombreux décomposeurs (lombric), terriers",
        "Couches profondes : horizons de roche mêlée de matière organique",
        "Roche du dessous : basalte (volcanique) ou calcaire (sédimentaire)"
      ],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "litière", def: "la couche de débris végétaux à la surface du sol" },
        { mot: "humus", def: "la couche vivante du sol, où vivent de nombreux décomposeurs" },
        { mot: "décomposeur", def: "un être vivant qui transforme les restes de plantes et d'animaux, comme le lombric" },
        { mot: "horizon", def: "une des couches qui se succèdent dans la profondeur du sol" }
      ],
      schema: "svt-s08-2-s1", prerequis: ["svt-s08-1-f1"], source: C(13)
    },
    {
      id: "svt-s08-2-f2", notion: "Les ressources naturelles biologiques",
      titre: "Ce que l'on tire du vivant",
      texte: "Beaucoup de ressources naturelles viennent d'êtres vivants : on les dit biologiques. Le bois sert à construire et à fabriquer papier, meubles et instruments de musique. Coton, soie, laine et lin habillent. Le saule, la digitale, des champignons et des venins donnent des médicaments ; les algues, des cosmétiques. La ressource la plus précieuse est pourtant minérale : l'eau.",
      pointsCles: [
        "Construction : bois, chanvre ; papier : bois, coton",
        "Habillement : coton, soie, laine, lin",
        "Médicaments : saule (précurseur de l'aspirine), digitale, champignons, venins",
        "Meubles et instruments : bois, bambou, crin de cheval ; cosmétique : algues",
        "Ressource minérale la plus précieuse : l'eau"
      ],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "ressource naturelle biologique", def: "une matière utile tirée d'un être vivant : plante, animal ou champignon" },
        { mot: "ressource minérale", def: "une matière utile qui ne vient pas du vivant, comme l'eau" },
        { mot: "cosmétique", def: "un produit de soin ou de beauté pour la peau ou les cheveux" }
      ],
      schema: null, prerequis: ["svt-s08-1-f1"], source: C(12)
    },
    {
      id: "svt-s08-2-f3", notion: "Laine, liège, chanvre et lin",
      titre: "D'où viennent-ils vraiment ?",
      texte: "Le liège est l'écorce d'un arbre, le chêne-liège : une sorte de bois, donc. La laine est du poil d'animal : mouton, mais aussi chèvre (cachemire), alpaga, un cousin du lama, lapin (angora), et même certains chiens. Un pull tricoté, lui, peut être en fil de coton. Chanvre et lin, eux, sont des tiges d'herbes hautes et très solides.",
      pointsCles: [
        "Liège = écorce du chêne-liège, une sorte de bois",
        "Laine = poil d'animal : mouton, chèvre (cachemire), alpaga, lapin (angora), certains chiens",
        "Un pull tricoté n'est pas forcément en laine : il peut être en coton",
        "Chanvre et lin = tiges d'herbes hautes, très solides"
      ],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "liège", def: "l'écorce du chêne-liège, légère et imperméable" },
        { mot: "cachemire", def: "la laine très douce tirée du poil de la chèvre" },
        { mot: "angora", def: "la laine tirée du poil du lapin angora" }
      ],
      schema: null, prerequis: ["svt-s08-2-f2"], source: C(12)
    },
    {
      id: "svt-s08-2-f4", notion: "Le mix énergétique mondial en 2015",
      titre: "Cinq sources d'énergie",
      texte: "Le mix énergétique, c'est la part de chaque source d'énergie utilisée dans le monde. En 2015 : le charbon arrive en tête avec 31 %, puis le pétrole avec 29 %, le gaz avec 20 %, les énergies renouvelables avec 14 % et le nucléaire avec 6 %. Charbon et pétrole réunis font donc 60 % de l'énergie mondiale.",
      pointsCles: [
        "Charbon 31 %, pétrole 29 %, gaz 20 %",
        "Énergies renouvelables 14 %, nucléaire 6 %",
        "Charbon + pétrole = 60 %",
        "Le total fait 100 %"
      ],
      dates: [{ annee: 2015, evenement: "Mix énergétique mondial étudié : le charbon en tête" }],
      lieux: [], personnages: [],
      vocabulaire: [
        { mot: "mix énergétique", def: "la part de chaque source d'énergie dans l'énergie utilisée" },
        { mot: "source d'énergie", def: "ce dont on tire de l'énergie : charbon, pétrole, gaz, nucléaire, renouvelables" }
      ],
      schema: null, prerequis: ["svt-s08-2-f2"], source: C(13)
    },
    {
      id: "svt-s08-2-f5", notion: "Construire un diagramme circulaire",
      titre: "Des pourcentages aux angles",
      texte: "Pour un diagramme circulaire, on transforme chaque pourcentage en proportion décimale (31 % = 0,31), puis on la multiplie par 360 : l'angle de la part vaut 0,31 × 360 = 111,6°. On vérifie que la somme des angles fait 360. On trace un cercle, on mesure chaque angle au rapporteur, on colorie, puis légende et titre.",
      pointsCles: [
        "Proportion décimale = pourcentage ÷ 100",
        "Angle = proportion décimale × 360",
        "Vérification : la somme des angles fait 360",
        "Cercle, rapporteur, couleurs, légende, titre"
      ],
      astuce: "Un pourcentage, c'est sur 100 ; un cercle, c'est 360°. Multiplie par 3,6 pour passer de l'un à l'autre.",
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "diagramme circulaire", def: "un cercle découpé en parts dont la taille montre la proportion de chaque chose" },
        { mot: "rapporteur", def: "l'instrument qui sert à mesurer et à tracer les angles" },
        { mot: "proportion décimale", def: "un pourcentage écrit sous forme de nombre à virgule, par exemple 0,2 pour 20 %" }
      ],
      schema: null, prerequis: ["svt-s08-2-f4"], source: C(13)
    }
  ],
  schemas: [
    { id: "svt-s08-2-s1", legende: "Le sol en coupe, de la litière à la roche (schéma redessiné).", svg: schemaSol() }
  ],
  questions: [
    // f1 : le sol en coupe
    { id: "svt-s08-2-q1", fiche: "svt-s08-2-f1", type: "qcm", niveau: 1,
      enonce: "Comment s'appelle la couche de débris végétaux à la surface du sol ?",
      choix: ["La litière", "L'humus", "La roche", "L'horizon"],
      reponse: "La litière",
      explication: "La litière est la couche de feuilles et de débris végétaux du dessus. L'humus est juste en dessous.", source: C(13) },
    { id: "svt-s08-2-q2", fiche: "svt-s08-2-f1", type: "qcm", niveau: 1,
      enonce: "Quelle couche du sol est décrite comme vivante, pleine de décomposeurs ?",
      choix: ["L'humus", "La roche", "La litière", "Le basalte"],
      reponse: "L'humus",
      explication: "L'humus est la couche vivante du sol. Les lombrics et bien d'autres décomposeurs y travaillent.", source: C(13) },
    { id: "svt-s08-2-q3", fiche: "svt-s08-2-f1", type: "ordre", niveau: 2,
      enonce: "Range les couches du sol, du haut vers le bas.",
      elements: ["La roche", "L'humus", "La litière", "Les couches profondes"],
      reponse: [2, 1, 3, 0],
      explication: "Litière en surface, humus dessous, puis les couches profondes et enfin la roche. Plus on descend, moins il y a de matière vivante.", source: C(13) },
    { id: "svt-s08-2-q4", fiche: "svt-s08-2-f1", type: "vrai_faux", niveau: 2,
      enonce: "Les couches profondes du sol mélangent de la roche et de la matière organique.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : sous l'humus, les couches profondes sont un mélange de roche et de matière organique. Elles se divisent en plusieurs horizons.", source: C(13) },
    { id: "svt-s08-2-q5", fiche: "svt-s08-2-f1", type: "vrai_faux", niveau: 2,
      enonce: "Le lombric vit dans la roche, tout en bas du sol.",
      corrections: ["Faux : il vit dans l'humus, la couche vivante.", "Faux : il vit dans l'air, au-dessus de la litière.", "Faux : il vit uniquement dans l'eau."],
      reponse: { vrai: false, correction: "Faux : il vit dans l'humus, la couche vivante." },
      explication: "Le lombric est un décomposeur de l'humus. Il ne creuse pas la roche.", source: C(13) },
    { id: "svt-s08-2-q6", fiche: "svt-s08-2-f1", type: "qcm_multiple", niveau: 2,
      enonce: "Quelles roches peut-on trouver sous le sol ? (plusieurs réponses)",
      choix: ["Du basalte, roche volcanique", "Du calcaire, roche sédimentaire", "De l'humus", "De la litière", "Du bois"],
      reponse: ["Du basalte, roche volcanique", "Du calcaire, roche sédimentaire"],
      explication: "La roche du dessous peut être volcanique, comme le basalte, ou sédimentaire, comme le calcaire. Humus et litière sont des couches du sol, pas des roches.", source: C(13) },
    { id: "svt-s08-2-q7", fiche: "svt-s08-2-f1", type: "qcm", niveau: 3,
      enonce: "Pourquoi l'humus est-il appelé la couche vivante du sol ?",
      choix: ["Parce que de nombreux décomposeurs y vivent, comme les lombrics", "Parce qu'il est vert", "Parce qu'il bouge avec le vent", "Parce que c'est de la roche fondue qui remonte du centre de la Terre"],
      reponse: "Parce que de nombreux décomposeurs y vivent, comme les lombrics",
      explication: "L'humus grouille de décomposeurs et d'animaux qui y creusent des terriers. C'est la couche la plus vivante du sol.", source: C(13) },
    { id: "svt-s08-2-q8", fiche: "svt-s08-2-f1", type: "qcm", niveau: 2,
      enonce: "Comment appelle-t-on les niveaux numérotés des couches profondes du sol ?",
      choix: ["Des horizons", "Des étages", "Des litières", "Des terriers"],
      reponse: "Des horizons",
      explication: "Les couches profondes se divisent en horizons, numérotés de haut en bas. Chacun mélange roche et matière organique.", source: C(13) },
    // f2 : les ressources naturelles biologiques
    { id: "svt-s08-2-q9", fiche: "svt-s08-2-f2", type: "qcm", niveau: 1,
      enonce: "Quelle ressource naturelle sert à la fois à construire, à fabriquer du papier et des meubles ?",
      choix: ["Le bois", "Le coton", "La soie", "L'algue"],
      reponse: "Le bois",
      explication: "Le bois est partout : construction, papier, meubles, instruments de musique. C'est une ressource biologique tirée des arbres.", source: C(12) },
    { id: "svt-s08-2-q10", fiche: "svt-s08-2-f2", type: "qcm_multiple", niveau: 2,
      enonce: "Quelles ressources biologiques servent à l'habillement ? (plusieurs réponses)",
      choix: ["Le coton", "La soie", "La laine", "Le lin", "Le basalte", "Le calcaire"],
      reponse: ["Le coton", "La soie", "La laine", "Le lin"],
      explication: "Coton, soie, laine et lin viennent de plantes ou d'animaux. Basalte et calcaire sont des roches.", source: C(12) },
    { id: "svt-s08-2-q11", fiche: "svt-s08-2-f2", type: "vrai_faux", niveau: 2,
      enonce: "Certains médicaments sont tirés d'arbres, comme le saule.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : le saule fournit un précurseur de l'aspirine. D'autres plantes, des champignons et des venins servent aussi aux médicaments.", source: C(12) },
    { id: "svt-s08-2-q12", fiche: "svt-s08-2-f2", type: "vrai_faux", niveau: 2,
      enonce: "L'eau est une ressource naturelle biologique.",
      corrections: ["Faux : l'eau est une ressource minérale, la plus précieuse de toutes.", "Faux : l'eau n'est pas une ressource naturelle.", "Faux : l'eau est une ressource biologique seulement quand elle est salée."],
      reponse: { vrai: false, correction: "Faux : l'eau est une ressource minérale, la plus précieuse de toutes." },
      explication: "L'eau ne vient pas d'un être vivant : c'est une ressource minérale. C'est aussi la plus précieuse.", source: C(12) },
    { id: "svt-s08-2-q13", fiche: "svt-s08-2-f2", type: "qcm", niveau: 1,
      enonce: "En cosmétique, quelle ressource biologique utilise-t-on surtout ?",
      choix: ["Les algues", "Le bois", "La laine", "Le venin de serpent"],
      reponse: "Les algues",
      explication: "Les cosmétiques utilisent surtout des algues. Le venin sert plutôt à fabriquer des médicaments.", source: C(12) },
    { id: "svt-s08-2-q14", fiche: "svt-s08-2-f2", type: "association", niveau: 2,
      enonce: "Relie chaque ressource à un usage.",
      gauche: ["Le saule", "Le bambou", "Le chanvre", "Les algues"],
      droite: ["Un précurseur de l'aspirine", "Des pièces d'instruments de musique", "La construction", "Les cosmétiques"],
      reponse: [[0, 0], [1, 1], [2, 2], [3, 3]],
      explication: "Saule pour un médicament, bambou pour les instruments, chanvre pour construire, algues pour les cosmétiques. Chaque être vivant a son usage.", source: C(12) },
    { id: "svt-s08-2-q15", fiche: "svt-s08-2-f2", type: "qcm", niveau: 3,
      enonce: "Pourquoi parle-t-on de ressources naturelles « biologiques » ?",
      choix: ["Parce qu'elles viennent d'êtres vivants : plantes, animaux, champignons", "Parce qu'elles sont vendues en pharmacie", "Parce qu'elles sont toujours vertes", "Parce qu'on les trouve sous terre, dans les couches profondes du sol"],
      reponse: "Parce qu'elles viennent d'êtres vivants : plantes, animaux, champignons",
      explication: "Biologique veut dire « qui vient du vivant ». Le bois d'un arbre, la laine d'un mouton ou un champignon sont des ressources biologiques.", source: C(12) },
    { id: "svt-s08-2-q16", fiche: "svt-s08-2-f2", type: "qcm", niveau: 1,
      enonce: "Quelle est la ressource naturelle la plus précieuse ?",
      choix: ["L'eau", "Le bois", "Le pétrole", "L'or"],
      reponse: "L'eau",
      explication: "La ressource la plus précieuse est l'eau. Elle est minérale, pas biologique.", source: C(12) },
    // f3 : laine, liège, chanvre et lin
    { id: "svt-s08-2-q17", fiche: "svt-s08-2-f3", type: "qcm", niveau: 1,
      enonce: "Qu'est-ce que le liège ?",
      choix: ["L'écorce du chêne-liège", "Une laine très fine", "Une tige d'herbe haute et solide", "Une algue séchée"],
      reponse: "L'écorce du chêne-liège",
      explication: "Le liège se récolte sur le chêne-liège : c'est son écorce. On le range donc avec le bois.", source: C(12) },
    { id: "svt-s08-2-q18", fiche: "svt-s08-2-f3", type: "qcm", niveau: 1,
      enonce: "D'où vient la laine ?",
      choix: ["Du poil d'animaux comme le mouton", "Des tiges du lin", "Des feuilles du cotonnier, une fois séchées", "De l'écorce d'un arbre"],
      reponse: "Du poil d'animaux comme le mouton",
      explication: "La laine est du poil d'animal. Le mouton n'est pas le seul à en donner.", source: C(12) },
    { id: "svt-s08-2-q19", fiche: "svt-s08-2-f3", type: "vrai_faux", niveau: 2,
      enonce: "Le chanvre et le lin viennent de tiges d'herbes hautes et très solides.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : chanvre et lin sont tirés de tiges d'herbes hautes. Leur solidité en fait des fibres pour construire ou s'habiller.", source: C(12) },
    { id: "svt-s08-2-q20", fiche: "svt-s08-2-f3", type: "vrai_faux", niveau: 2,
      enonce: "Un pull tricoté est forcément en laine.",
      corrections: ["Faux : il peut être tricoté avec du fil de coton.", "Faux : il est forcément en soie.", "Faux : il est toujours en lin."],
      reponse: { vrai: false, correction: "Faux : il peut être tricoté avec du fil de coton." },
      explication: "Tricoté ne veut pas dire en laine. Un pull peut être tricoté en fil de coton.", source: C(12) },
    { id: "svt-s08-2-q21", fiche: "svt-s08-2-f3", type: "qcm_multiple", niveau: 2,
      enonce: "Quels animaux donnent de la laine ? (plusieurs réponses)",
      choix: ["Le mouton", "La chèvre", "L'alpaga", "Le lapin", "Le ver à soie", "La vache"],
      reponse: ["Le mouton", "La chèvre", "L'alpaga", "Le lapin"],
      explication: "Mouton, chèvre (cachemire), alpaga et lapin (angora) donnent de la laine. Le ver à soie donne de la soie, pas de la laine.", source: C(12) },
    { id: "svt-s08-2-q22", fiche: "svt-s08-2-f3", type: "association", niveau: 3,
      enonce: "Relie chaque animal à sa laine.",
      gauche: ["La chèvre", "Le lapin", "L'alpaga", "Le mouton"],
      droite: ["Laine cachemire", "Laine angora", "Laine d'un cousin du lama", "La laine la plus connue"],
      reponse: [[0, 0], [1, 1], [2, 2], [3, 3]],
      explication: "Cachemire pour la chèvre, angora pour le lapin ; l'alpaga est un cousin du lama. Le mouton reste le fournisseur le plus connu.", source: C(12) },
    { id: "svt-s08-2-q23", fiche: "svt-s08-2-f3", type: "qcm", niveau: 3,
      enonce: "Pourquoi le liège est-il considéré comme une sorte de bois ?",
      choix: ["Parce que c'est l'écorce d'un arbre", "Parce qu'il brûle", "Parce qu'il flotte", "Parce qu'il est marron"],
      reponse: "Parce que c'est l'écorce d'un arbre",
      explication: "Le liège vient du chêne-liège : c'est son écorce. Une écorce fait partie de l'arbre, donc c'est du bois.", source: C(12) },
    // f4 : le mix énergétique mondial en 2015
    { id: "svt-s08-2-q24", fiche: "svt-s08-2-f4", type: "qcm", niveau: 1,
      enonce: "En 2015, quelle était la première source d'énergie dans le monde ?",
      choix: ["Le charbon", "Le nucléaire", "Les énergies renouvelables", "Le gaz"],
      reponse: "Le charbon",
      explication: "Le charbon arrive en tête avec 31 %. Le pétrole le suit de près avec 29 %.", source: C(13) },
    { id: "svt-s08-2-q25", fiche: "svt-s08-2-f4", type: "qcm", niveau: 1,
      enonce: "Quelle part du mix énergétique mondial représentait le pétrole en 2015 ?",
      choix: ["29 %", "6 %", "14 %", "50 %"],
      reponse: "29 %",
      explication: "Le pétrole faisait 29 % en 2015. Les 6 % sont le nucléaire et les 14 % les énergies renouvelables.", source: C(13) },
    { id: "svt-s08-2-q26", fiche: "svt-s08-2-f4", type: "vrai_faux", niveau: 2,
      enonce: "En 2015, le nucléaire était la plus petite part du mix énergétique mondial.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : 6 % seulement pour le nucléaire. Les énergies renouvelables, avec 14 %, faisaient plus du double.", source: C(13) },
    { id: "svt-s08-2-q27", fiche: "svt-s08-2-f4", type: "vrai_faux", niveau: 2,
      enonce: "En 2015, les énergies renouvelables dépassaient le charbon dans le monde.",
      corrections: ["Faux : le charbon faisait 31 % et les renouvelables 14 %.", "Faux : les renouvelables n'existaient pas encore.", "Faux : elles étaient à égalité, 25 % chacune."],
      reponse: { vrai: false, correction: "Faux : le charbon faisait 31 % et les renouvelables 14 %." },
      explication: "Le charbon était la première source avec 31 %. Les renouvelables n'en étaient qu'à 14 %.", source: C(13) },
    { id: "svt-s08-2-q28", fiche: "svt-s08-2-f4", type: "ordre", niveau: 3,
      enonce: "Range ces sources d'énergie de la plus utilisée à la moins utilisée en 2015.",
      elements: ["Gaz", "Charbon", "Nucléaire", "Pétrole", "Énergies renouvelables"],
      reponse: [1, 3, 0, 4, 2],
      explication: "Charbon 31 %, pétrole 29 %, gaz 20 %, renouvelables 14 %, nucléaire 6 %. Le total fait 100 %.", source: C(13) },
    { id: "svt-s08-2-q29", fiche: "svt-s08-2-f4", type: "qcm", niveau: 3,
      enonce: "Charbon et pétrole réunis, quelle part du mix énergétique de 2015 cela fait-il ?",
      choix: ["60 %", "31 %", "45 %", "80 %"],
      reponse: "60 %",
      explication: "31 % de charbon plus 29 % de pétrole font 60 %. Ces deux sources dominaient l'énergie mondiale.", indice: "Additionne les deux pourcentages.", source: C(13) },
    { id: "svt-s08-2-q30", fiche: "svt-s08-2-f4", type: "qcm", niveau: 2,
      enonce: "Comment appelle-t-on la répartition des sources d'énergie utilisées dans le monde ?",
      choix: ["Le mix énergétique", "Le diagramme ombrothermique", "Le cycle de l'eau", "Le réseau trophique"],
      reponse: "Le mix énergétique",
      explication: "Le mix énergétique donne la part de chaque source d'énergie. On le représente souvent par un diagramme circulaire.", source: C(13) },
    // f5 : construire un diagramme circulaire
    { id: "svt-s08-2-q31", fiche: "svt-s08-2-f5", type: "qcm", niveau: 1,
      enonce: "Combien de degrés fait un cercle complet ?",
      choix: ["360°", "180°", "100°", "90°"],
      reponse: "360°",
      explication: "Un tour complet fait 360°. C'est pour cela que la somme des angles d'un diagramme circulaire doit faire 360.", source: C(13) },
    { id: "svt-s08-2-q32", fiche: "svt-s08-2-f5", type: "qcm", niveau: 2,
      enonce: "Comment calcule-t-on l'angle d'une part dans un diagramme circulaire ?",
      choix: ["On multiplie la proportion décimale par 360", "On divise le pourcentage par 360", "On ajoute 360 au pourcentage", "On multiplie le pourcentage par 100"],
      reponse: "On multiplie la proportion décimale par 360",
      explication: "Angle = proportion décimale × 360. Pour 31 %, cela donne 0,31 × 360 = 111,6°.", source: C(13) },
    { id: "svt-s08-2-q33", fiche: "svt-s08-2-f5", type: "qcm", niveau: 3,
      enonce: "Une source d'énergie représente 20 %. Quel angle lui donne-t-on sur le diagramme ?",
      choix: ["72°", "20°", "200°", "36°"],
      reponse: "72°",
      explication: "20 % = 0,2 et 0,2 × 360 = 72. La part du gaz, qui fait 20 %, occupe donc 72°.", indice: "Écris 20 % en nombre à virgule, puis multiplie par 360.", source: C(13) },
    { id: "svt-s08-2-q34", fiche: "svt-s08-2-f5", type: "vrai_faux", niveau: 2,
      enonce: "Pour vérifier ses calculs, on additionne tous les angles : on doit trouver 360.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : les parts remplissent tout le cercle, donc leurs angles font 360 au total. Si la somme est différente, il y a une erreur.", source: C(13) },
    { id: "svt-s08-2-q35", fiche: "svt-s08-2-f5", type: "vrai_faux", niveau: 2,
      enonce: "Dans un diagramme circulaire, le titre et la légende sont inutiles.",
      corrections: ["Faux : ils sont indispensables pour comprendre ce que montre chaque part.", "Faux : seul le titre est utile, pas la légende.", "Faux : la légende remplace le cercle."],
      reponse: { vrai: false, correction: "Faux : ils sont indispensables pour comprendre ce que montre chaque part." },
      explication: "Sans légende, on ne sait pas à quoi correspond chaque couleur ; sans titre, on ne sait pas de quoi parle le diagramme. Les deux sont obligatoires.", source: C(14) },
    { id: "svt-s08-2-q36", fiche: "svt-s08-2-f5", type: "ordre", niveau: 2,
      enonce: "Remets dans l'ordre les étapes de construction d'un diagramme circulaire.",
      elements: ["Mesurer chaque angle au rapporteur, en tournant la feuille", "Calculer l'angle de chaque part et vérifier que la somme fait 360", "Tracer un cercle", "Colorier, puis ajouter la légende et le titre"],
      reponse: [1, 2, 0, 3],
      explication: "D'abord les calculs, puis le cercle, les angles au rapporteur, et enfin couleurs, légende et titre. Le titre vient en dernier.", source: C(14) },
    { id: "svt-s08-2-q37", fiche: "svt-s08-2-f5", type: "qcm", niveau: 3,
      enonce: "Pourquoi convertit-on d'abord le pourcentage en proportion décimale ?",
      choix: ["Pour pouvoir le multiplier par 360 et obtenir l'angle", "Pour le rendre plus joli", "Parce que les rapporteurs sont gradués en dixièmes de degré", "Pour obtenir une longueur en centimètres"],
      reponse: "Pour pouvoir le multiplier par 360 et obtenir l'angle",
      explication: "31 % devient 0,31, et 0,31 × 360 donne l'angle. La proportion décimale est l'étape entre le pourcentage et l'angle.", source: C(13) },
    { id: "svt-s08-2-q38", fiche: "svt-s08-2-f5", type: "qcm_multiple", niveau: 2,
      enonce: "Que doit comporter un diagramme circulaire terminé ? (plusieurs réponses)",
      choix: ["Des parts aux bons angles", "Des couleurs différentes", "Une légende", "Un titre", "Une courbe des températures", "Des barres"],
      reponse: ["Des parts aux bons angles", "Des couleurs différentes", "Une légende", "Un titre"],
      explication: "Angles justes, couleurs, légende et titre : le diagramme est complet. Courbes et barres appartiennent à d'autres graphiques.", source: C(14) }
  ],
  bonus: [
    {
      id: "svt-s08-2-b1", fiche: "svt-s08-2-f1",
      titre: "Le ver de terre, laboureur du sol",
      texte: "Le ver de terre, ou lombric, respire par sa peau, qui doit rester humide. Il avale de la terre et des débris de plantes, et ses galeries aèrent et mélangent le sol : il participe ainsi à la formation de l'humus. Certains déposent à la surface de petites tours de terre, les turricules. En Europe, un hectare de sol peut porter près de deux tonnes de vers, le poids de six ou sept vaches.",
      source: { titre: "Ver de terre", editeur: "Wikipédia, l'encyclopédie libre", url: "https://fr.wikipedia.org/wiki/Ver_de_terre" }
    }
  ],
  nonCouvert: [
    "La leçon de la séance 2 n'est pas déposée : l'influence de la nature des sols sur les biomes, annoncée par le titre, n'est pas dans le jeu.",
    "La roche du dessous est notée « primaire ou secondaire » sur le dessin manuscrit du corrigé, sans explication : non repris.",
    "Les ressources naturelles minérales autres que l'eau (minerais, pétrole…) : le corrigé ne cite que l'eau.",
    "Ce qu'est une énergie renouvelable : le corrigé donne seulement sa part dans le mix de 2015."
  ]
};
