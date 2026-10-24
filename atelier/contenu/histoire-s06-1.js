// Source en clair du cours histoire-s06-1 « Cours 8 – Étude de cas 3 et 4 ».
// Compilé (réponses brouillées) par node atelier/outils/compiler-cours.js histoire-s06-1.
// Seule source : l'étude de cas 3 « La vie et le travail des paysans » (une page) : l'encadré sur la charrue
// (araire, coutre, soc, versoir, collier d'épaule, laboureurs) et le tableau « Ce que les paysans doivent au
// seigneur » (taxes dues par tous, taxes des serfs : chevage, formariage, mainmorte). Le calendrier des travaux
// et la famine de 1033 de la même page sont traités au cours 6 (histoire-s04-3). L'étude de cas n°4 n'est pas
// déposée : voir nonCouvert. La leçon est donnée en vidéo.
const F = "cours/histoire/Histoire 5e - Moyen Age - Etude de cas 3 Vie et travail des paysans.pdf";
const S = p => ({ fichier: F, page: p });

// Schéma d'une charrue, redessiné et simplifié (aucune image reprise) : coutre, soc, versoir ; en vignette, l'araire.
function charrue() {
  const encre = "#2e2419", bois = "#8a5a2b", fer = "#5b6770", terre = "#b08a5a";
  let s = "<svg viewBox='0 0 540 250' xmlns='http://www.w3.org/2000/svg' font-family='Georgia,serif' font-size='11'>";
  s += "<rect x='0' y='0' width='540' height='250' fill='#f4ecd8'/>";
  // sol
  s += "<rect x='0' y='170' width='540' height='80' fill='" + terre + "'/>";
  s += "<path d='M0 170 Q 60 164 120 170 T 240 170 T 360 170 T 480 170 T 540 170' fill='none' stroke='#7a5a34' stroke-width='2'/>";
  // sillon tracé derrière la charrue (à gauche)
  s += "<path d='M20 172 L 170 172 L 170 196 L 20 196 Z' fill='#7a5230'/>";
  s += "<text x='95' y='214' text-anchor='middle' fill='#fff' font-size='10'>sillon : la terre a été retournée</text>";
  // --- la charrue (vue de côté, avance vers la droite) ---
  // age (poutre) du mancheron vers l'avant
  s += "<path d='M150 60 L 330 120' stroke='" + bois + "' stroke-width='10' stroke-linecap='round'/>";
  // mancherons (poignées) à l'arrière
  s += "<path d='M165 62 L 125 40' stroke='" + bois + "' stroke-width='6' stroke-linecap='round'/>";
  s += "<path d='M180 68 L 140 50' stroke='" + bois + "' stroke-width='6' stroke-linecap='round'/>";
  // montant vertical qui porte le soc
  s += "<path d='M232 88 L 232 168' stroke='" + bois + "' stroke-width='9'/>";
  // versoir : plaque courbe qui rabat la terre sur le côté
  s += "<path d='M232 130 C 200 128, 186 150, 190 168 L 232 168 Z' fill='#7f8a94' stroke='" + encre + "'/>";
  // soc : fer pointu qui trace le sillon
  s += "<path d='M186 168 L 262 168 L 290 180 L 200 182 Z' fill='" + fer + "' stroke='" + encre + "'/>";
  // coutre : lame verticale en fer, devant le soc
  s += "<path d='M296 112 L 300 112 L 298 184 L 290 178 Z' fill='" + fer + "' stroke='" + encre + "'/>";
  // chaîne vers l'attelage (hors cadre, à droite)
  s += "<path d='M330 120 L 420 110' stroke='" + encre + "' stroke-width='2' stroke-dasharray='4 3'/>";
  s += "<text x='424' y='108' fill='" + encre + "' font-size='10'>vers l'attelage</text>";
  s += "<text x='424' y='121' fill='" + encre + "' font-size='10'>(bœufs ou chevaux)</text>";
  // étiquettes
  s += "<line x1='298' y1='140' x2='360' y2='150' stroke='" + encre + "'/>";
  s += "<text x='364' y='154' fill='" + encre + "'>coutre : lame de fer qui</text>";
  s += "<text x='364' y='167' fill='" + encre + "'>s'enfonce profondément</text>";
  s += "<line x1='270' y1='176' x2='340' y2='200' stroke='" + encre + "'/>";
  s += "<text x='344' y='204' fill='" + encre + "'>soc : trace le sillon</text>";
  s += "<line x1='200' y1='150' x2='150' y2='120' stroke='" + encre + "'/>";
  s += "<text x='148' y='116' text-anchor='end' fill='" + encre + "'>versoir : rabat la terre</text>";
  s += "<text x='148' y='129' text-anchor='end' fill='" + encre + "'>sur le côté</text>";
  s += "<text x='140' y='36' text-anchor='end' fill='" + encre + "'>mancherons (poignées)</text>";
  s += "<text x='20' y='20' font-size='13' fill='" + encre + "'>La charrue, mise au point au XIIe siècle</text>";
  // --- vignette : l'araire ---
  s += "<rect x='392' y='18' width='138' height='74' fill='#fbf6ea' stroke='" + encre + "'/>";
  s += "<text x='461' y='32' text-anchor='middle' font-size='10' fill='" + encre + "'>Avant : l'araire</text>";
  s += "<path d='M408 50 L 500 70' stroke='" + bois + "' stroke-width='5' stroke-linecap='round'/>";
  s += "<path d='M455 60 L 455 80' stroke='" + bois + "' stroke-width='5'/>";
  s += "<path d='M440 80 L 470 80 L 484 86 L 446 88 Z' fill='" + fer + "' stroke='" + encre + "'/>";
  s += "<text x='461' y='102' text-anchor='middle' font-size='9' fill='" + encre + "'>un simple soc, sans versoir :</text>";
  s += "<text x='461' y='113' text-anchor='middle' font-size='9' fill='" + encre + "'>la terre n'est pas retournée</text>";
  // légende basse
  s += "<text x='270' y='240' text-anchor='middle' font-size='10' fill='#fff'>Les pièces de fer sont en gris, le bois en brun. Schéma simplifié d'après le texte de l'étude de cas.</text>";
  return s + "</svg>";
}

module.exports = {
  id: "histoire-s06-1",
  fiches: [
    {
      id: "histoire-s06-1-f1", notion: "La charrue, une invention du Moyen Âge (XIIe siècle)",
      titre: "De l'araire à la charrue",
      texte: "Avant le XIIe siècle, les paysans labourent avec un araire tiré par des bœufs : son simple soc gratte la terre sans la retourner en profondeur. Au cours du XIIe siècle apparaît la charrue, plus maniable et plus efficace. Son coutre en fer s'enfonce profondément, son soc trace le sillon et son versoir rabat la terre sur le côté.",
      pointsCles: ["Avant : l'araire, tiré par des bœufs, un simple soc qui ne retourne pas la terre en profondeur", "XIIe siècle : la charrue, plus maniable et plus efficace", "Coutre en fer : s'enfonce profondément dans le sol", "Soc : trace le sillon", "Versoir : rabat la terre sur le côté"],
      astuce: "Dans l'ordre où la terre les rencontre : le Coutre Coupe, le Soc Sillonne, le Versoir Verse la terre de côté.",
      dates: [
        { annee: 1150, evenement: "Au cours du XIIe siècle : mise au point de la charrue" }
      ],
      lieux: [], personnages: [],
      vocabulaire: [
        { mot: "araire", def: "l'ancien outil de labour, à simple soc, qui ne retourne pas la terre en profondeur" },
        { mot: "charrue", def: "l'outil de labour mis au point au XIIe siècle, avec un coutre, un soc et un versoir" },
        { mot: "coutre", def: "la lame de fer de la charrue, qui s'enfonce profondément dans le sol" },
        { mot: "soc", def: "la pièce de fer de l'araire ou de la charrue qui trace le sillon" },
        { mot: "versoir", def: "la pièce de la charrue qui rabat la terre sur le côté" },
        { mot: "sillon", def: "la longue tranchée que le labour creuse dans le champ" }
      ],
      schema: "histoire-s06-1-s1", prerequis: ["histoire-s04-3-f2"], source: S(1)
    },
    {
      id: "histoire-s06-1-f2", notion: "Le collier d'épaule et les laboureurs",
      titre: "Tirer plus lourd : le collier d'épaule",
      texte: "La charrue est perfectionnée peu à peu. On met aussi au point le collier d'épaule : il n'étouffe plus l'animal qui tire, et celui-ci peut traîner des charges bien plus lourdes. Mais un attelage et une charrue coûtent cher. Seuls les paysans les plus riches, que l'on appelle les laboureurs, peuvent se les acheter.",
      pointsCles: ["Collier d'épaule : l'animal n'est plus étouffé et tire des charges plus importantes", "Attelage et charrue coûtent cher", "Seuls les paysans les plus riches, les laboureurs, peuvent se les offrir"],
      dates: [],
      lieux: [], personnages: [],
      vocabulaire: [
        { mot: "collier d'épaule", def: "le collier posé sur les épaules de l'animal, qui ne l'étouffe plus et lui permet de tirer plus lourd" },
        { mot: "attelage", def: "les animaux attachés ensemble pour tirer une charrue ou une charrette" },
        { mot: "laboureur", def: "un paysan riche, qui possède un attelage et une charrue" }
      ],
      schema: "histoire-s06-1-s1", prerequis: ["histoire-s06-1-f1"], source: S(1)
    },
    {
      id: "histoire-s06-1-f3", notion: "Les taxes dues par tous les paysans : cens, banalités, champart, corvées",
      titre: "Ce que tous les paysans doivent au seigneur",
      texte: "Tous les paysans doivent des taxes au seigneur. Les unes se paient en argent ou en nature : le cens, pour l'utilisation de la terre, et les banalités, pour se servir du moulin, du pressoir ou du four du seigneur. Les autres se paient en travail ou en nature : le champart, une partie de la récolte, et les corvées, un travail obligatoire sur la réserve.",
      pointsCles: ["En argent ou en nature : le cens (pour la terre) et les banalités (moulin, pressoir, four du seigneur)", "En travail ou en nature : le champart (partie de la récolte) et les corvées (travail obligatoire sur la réserve)", "Ces quatre taxes sont dues par tous les paysans, libres ou non"],
      astuce: "Deux colonnes : ce qu'on paie (cens, banalités) et ce qu'on donne ou fait (champart, corvées).",
      dates: [],
      lieux: [], personnages: [],
      vocabulaire: [
        { mot: "en nature", def: "payé avec des produits (grain, bêtes…) et non avec de l'argent" },
        { mot: "taxe", def: "ce qu'il faut payer ou donner obligatoirement à celui qui a le pouvoir, ici le seigneur" }
      ],
      schema: null, prerequis: ["histoire-s05-1-f1", "histoire-s05-2-f3"], source: S(1)
    },
    {
      id: "histoire-s06-1-f4", notion: "Les taxes propres aux serfs : chevage, formariage, mainmorte",
      titre: "Serfs et vilains : trois taxes de plus pour les paysans non libres",
      texte: "Il existe deux catégories de paysans : les vilains, qui sont libres, et les serfs, qui ne le sont pas. Les serfs doivent au seigneur trois taxes de plus. Le chevage est une redevance payée en argent. Le formariage se paie quand un serf se marie hors de la seigneurie. La mainmorte est un droit payé par les héritiers d'un serf.",
      pointsCles: ["Vilain : paysan libre ; serf : paysan non libre", "Chevage : une redevance en argent", "Formariage : une taxe quand un serf se marie hors de la seigneurie", "Mainmorte : un droit payé par les héritiers d'un serf"],
      astuce: "CHE-FOR-MAIN : CHEvage (argent), FORmariage (mariage), MAINmorte (héritage).",
      dates: [],
      lieux: [], personnages: [],
      vocabulaire: [
        { mot: "chevage", def: "une redevance en argent due au seigneur par les serfs" },
        { mot: "formariage", def: "la taxe qu'un serf paie quand il se marie hors de la seigneurie" },
        { mot: "mainmorte", def: "le droit que les héritiers d'un serf paient au seigneur" },
        { mot: "héritier", def: "la personne qui reçoit les biens de quelqu'un à sa mort" }
      ],
      schema: null, prerequis: ["histoire-s06-1-f3", "histoire-s05-2-f3"], source: S(1)
    }
  ],
  schemas: [
    { id: "histoire-s06-1-s1", legende: "La charrue du XIIe siècle, redessinée d'après le texte de l'étude de cas : le coutre coupe, le soc trace le sillon, le versoir rabat la terre. En vignette, l'araire à simple soc qu'elle remplace.", svg: charrue() }
  ],
  questions: [
    // f1 : de l'araire à la charrue
    { id: "histoire-s06-1-q1", fiche: "histoire-s06-1-f1", type: "qcm", niveau: 1,
      enonce: "Avec quel outil les paysans labouraient-ils avant la charrue ?",
      choix: ["Un araire tiré par des bœufs", "Une herse", "Un pressoir", "Une faux"],
      reponse: "Un araire tiré par des bœufs",
      explication: "Avant la charrue, on labourait avec un araire tiré par des bœufs. Son simple soc ne retournait pas la terre en profondeur.", source: S(1) },
    { id: "histoire-s06-1-q2", fiche: "histoire-s06-1-f1", type: "vrai_faux", niveau: 1,
      enonce: "La charrue est mise au point au cours du XIIe siècle.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : la charrue apparaît au XIIe siècle. Elle est plus maniable et plus efficace que l'araire.", source: S(1) },
    { id: "histoire-s06-1-q3", fiche: "histoire-s06-1-f1", type: "qcm", niveau: 2,
      enonce: "Quelle pièce de la charrue rabat la terre sur le côté ?",
      choix: ["Le versoir", "Le coutre", "Le soc", "Le collier d'épaule"],
      reponse: "Le versoir",
      explication: "Le versoir rabat la terre sur le côté. Le coutre coupe le sol en profondeur et le soc trace le sillon.", source: S(1) },
    { id: "histoire-s06-1-q4", fiche: "histoire-s06-1-f1", type: "vrai_faux", niveau: 2,
      enonce: "L'araire retournait la terre en profondeur grâce à son versoir.",
      corrections: ["Faux : c'est la charrue qui retourne la terre grâce à son versoir ; l'araire n'a qu'un simple soc.", "Faux : l'araire retournait la terre grâce à son coutre, pas à son versoir.", "Faux : l'araire retournait la terre encore plus profondément que la charrue, sans versoir."],
      reponse: { vrai: false, correction: "Faux : c'est la charrue qui retourne la terre grâce à son versoir ; l'araire n'a qu'un simple soc." },
      explication: "L'araire n'a qu'un simple soc et ne retourne pas la terre en profondeur. Le versoir est une pièce de la charrue.", source: S(1) },
    { id: "histoire-s06-1-q5", fiche: "histoire-s06-1-f1", type: "qcm", niveau: 2,
      enonce: "Pourquoi la charrue laboure-t-elle mieux que l'araire ?",
      choix: ["Son coutre de fer s'enfonce profondément et son versoir retourne la terre", "Elle est tirée par des chevaux, qui courent plus vite que les bœufs de l'araire", "Elle n'a qu'un simple soc, donc elle est bien plus légère à traîner", "Elle est entièrement en bois, donc plus facile à réparer au village"],
      reponse: "Son coutre de fer s'enfonce profondément et son versoir retourne la terre",
      explication: "Le coutre en fer entre profondément dans le sol et le versoir rabat la terre sur le côté. L'araire, lui, ne fait que gratter la surface.", source: S(1) },
    { id: "histoire-s06-1-q6", fiche: "histoire-s06-1-f1", type: "association", niveau: 2,
      enonce: "Relie chaque pièce ou outil à ce qu'il fait.",
      gauche: ["Coutre", "Soc", "Versoir", "Araire"],
      droite: ["Trace le sillon", "Ancien outil à simple soc, tiré par des bœufs", "Lame de fer qui s'enfonce profondément dans le sol", "Rabat la terre sur le côté"],
      reponse: [[0, 2], [1, 0], [2, 3], [3, 1]],
      explication: "Coutre : il coupe en profondeur ; soc : il trace le sillon ; versoir : il rabat la terre. L'araire est l'ancien outil, sans versoir.", source: S(1) },
    { id: "histoire-s06-1-q7", fiche: "histoire-s06-1-f1", type: "qcm", niveau: 3,
      enonce: "Un paysan laboure son champ au XIe siècle. Quel outil utilise-t-il le plus probablement ?",
      choix: ["Un araire à simple soc", "Une charrue à versoir", "Une charrue à coutre", "Un collier d'épaule"],
      reponse: "Un araire à simple soc",
      explication: "La charrue n'est mise au point qu'au cours du XIIe siècle. Au XIe siècle, on laboure encore avec l'araire.", indice: "Compare le XIe siècle et le siècle où apparaît la charrue.", source: S(1) },
    { id: "histoire-s06-1-q8", fiche: "histoire-s06-1-f1", type: "trou", niveau: 1,
      enonce: "Complète avec les noms des outils.",
      texte: "Au XIIe siècle, la ___ remplace peu à peu l'___, qui n'avait qu'un simple soc.",
      banque: ["charrue", "araire", "herse", "moulin"],
      reponse: [["charrue"], ["araire"]],
      explication: "La charrue, avec son coutre, son soc et son versoir, remplace l'araire. L'araire n'avait qu'un simple soc.", source: S(1) },
    { id: "histoire-s06-1-q9", fiche: "histoire-s06-1-f1", type: "vrai_faux", niveau: 3,
      enonce: "La charrue apparaît pendant la période des grands défrichements, qui va du XIe au XIIIe siècle.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : la charrue date du XIIe siècle, en plein milieu des grands défrichements. Les campagnes produisent alors davantage.", source: S(1) },
    // f2 : collier d'épaule et laboureurs
    { id: "histoire-s06-1-q10", fiche: "histoire-s06-1-f2", type: "qcm", niveau: 1,
      enonce: "Comment appelle-t-on les paysans les plus riches, ceux qui peuvent s'acheter un attelage et une charrue ?",
      choix: ["Les laboureurs", "Les serfs", "Les meuniers", "Les vilains"],
      reponse: "Les laboureurs",
      explication: "Les laboureurs sont les paysans les plus riches : eux seuls peuvent payer un attelage et une charrue. Le vilain est simplement un paysan libre.", source: S(1) },
    { id: "histoire-s06-1-q11", fiche: "histoire-s06-1-f2", type: "vrai_faux", niveau: 1,
      enonce: "Grâce au collier d'épaule, l'animal peut tirer des charges plus importantes.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : le collier d'épaule n'étouffe plus l'animal. Il peut donc tirer bien plus lourd.", source: S(1) },
    { id: "histoire-s06-1-q12", fiche: "histoire-s06-1-f2", type: "qcm", niveau: 2,
      enonce: "Pourquoi le collier d'épaule est-il un progrès pour l'animal qui tire ?",
      choix: ["Il ne l'étouffe plus", "Il le rend beaucoup plus rapide", "Il le protège de la pluie et du froid pendant le labour", "Il remplace la charrue"],
      reponse: "Il ne l'étouffe plus",
      explication: "Avec le collier d'épaule, l'animal n'est plus étouffé en tirant. Il peut donc traîner des charges plus importantes.", source: S(1) },
    { id: "histoire-s06-1-q13", fiche: "histoire-s06-1-f2", type: "vrai_faux", niveau: 2,
      enonce: "Au XIIe siècle, tous les paysans possèdent une charrue et un attelage.",
      corrections: ["Faux : seuls les plus riches, les laboureurs, peuvent se les acheter.", "Faux : seuls les serfs en possèdent, parce que le seigneur les leur fournit.", "Faux : la charrue appartient au seigneur, comme le moulin et le four."],
      reponse: { vrai: false, correction: "Faux : seuls les plus riches, les laboureurs, peuvent se les acheter." },
      explication: "Un attelage et une charrue coûtent cher. Seuls les paysans les plus riches, les laboureurs, peuvent se les offrir.", source: S(1) },
    { id: "histoire-s06-1-q14", fiche: "histoire-s06-1-f2", type: "qcm_multiple", niveau: 2,
      enonce: "Que faut-il posséder pour labourer avec une charrue ? (plusieurs réponses)",
      choix: ["Une charrue", "Un attelage", "Un moulin", "Un pressoir", "Un four"],
      reponse: ["Une charrue", "Un attelage"],
      explication: "Il faut la charrue elle-même et un attelage pour la tirer. Moulin, four et pressoir servent après la récolte et appartiennent au seigneur.", source: S(1) },
    { id: "histoire-s06-1-q15", fiche: "histoire-s06-1-f2", type: "qcm", niveau: 3,
      enonce: "Un paysan pauvre voudrait labourer en profondeur comme les laboureurs. Qu'est-ce qui l'en empêche ?",
      choix: ["Il n'a pas de quoi acheter un attelage et une charrue", "Le seigneur réserve la charrue aux serfs de la réserve", "La charrue n'existe pas encore au Moyen Âge", "Les bœufs refusent de tirer une charrue"],
      reponse: "Il n'a pas de quoi acheter un attelage et une charrue",
      explication: "La charrue existe depuis le XIIe siècle, mais elle coûte cher, avec son attelage. Seuls les paysans riches, les laboureurs, peuvent se la payer.", indice: "Pense à ce qui distingue un laboureur des autres paysans.", source: S(1) },
    { id: "histoire-s06-1-q16", fiche: "histoire-s06-1-f2", type: "trou", niveau: 1,
      enonce: "Complète la phrase.",
      texte: "Grâce au collier d'___, l'animal n'est plus étouffé et tire des charges plus ___.",
      banque: ["épaule", "lourdes", "cou", "légères"],
      reponse: [["épaule"], ["lourdes"]],
      explication: "Le collier d'épaule n'étouffe plus l'animal. Il lui permet de tirer des charges plus importantes.", source: S(1) },
    { id: "histoire-s06-1-q17", fiche: "histoire-s06-1-f2", type: "vrai_faux", niveau: 3,
      enonce: "La charrue et le collier d'épaule sont deux inventions qui rendent le labour plus efficace.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : la charrue retourne la terre en profondeur, et le collier d'épaule permet à l'animal de la tirer sans être étouffé. Les deux vont ensemble.", source: S(1) },
    { id: "histoire-s06-1-q18", fiche: "histoire-s06-1-f2", type: "ordre", niveau: 2,
      enonce: "Remets dans l'ordre les étapes du progrès du labour, de la plus ancienne à la plus récente.",
      elements: ["L'araire à simple soc, tiré par des bœufs", "La charrue à coutre, soc et versoir, au XIIe siècle", "La charrue perfectionnée peu à peu", "Le collier d'épaule, pour tirer des charges plus lourdes"],
      reponse: [0, 1, 2, 3],
      explication: "D'abord l'araire, puis la charrue au XIIe siècle. Elle est ensuite perfectionnée, et le collier d'épaule vient compléter l'attelage.", source: S(1) },
    // f3 : les taxes dues par tous
    { id: "histoire-s06-1-q19", fiche: "histoire-s06-1-f3", type: "qcm", niveau: 1,
      enonce: "Quelle taxe le paysan doit-il pour l'utilisation de sa terre ?",
      choix: ["Le cens", "Le champart", "La banalité", "Le chevage"],
      reponse: "Le cens",
      explication: "Le cens est l'impôt dû pour l'utilisation de la terre. Le champart est une part de la récolte, la banalité se paie pour le moulin, le four ou le pressoir.", source: S(1) },
    { id: "histoire-s06-1-q20", fiche: "histoire-s06-1-f3", type: "vrai_faux", niveau: 1,
      enonce: "Les corvées sont un travail obligatoire sur la réserve du seigneur.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : la corvée est un travail obligatoire, fait sur la réserve, la terre que le seigneur garde pour lui.", source: S(1) },
    { id: "histoire-s06-1-q21", fiche: "histoire-s06-1-f3", type: "qcm_multiple", niveau: 2,
      enonce: "Quelles taxes sont dues par tous les paysans, libres ou non ? (plusieurs réponses)",
      choix: ["Le cens", "Les banalités", "Le champart", "Les corvées", "Le chevage", "La mainmorte"],
      reponse: ["Le cens", "Les banalités", "Le champart", "Les corvées"],
      explication: "Cens, banalités, champart et corvées pèsent sur tous les paysans. Le chevage et la mainmorte ne concernent que les serfs.", source: S(1) },
    { id: "histoire-s06-1-q22", fiche: "histoire-s06-1-f3", type: "association", niveau: 2,
      enonce: "Relie chaque taxe à ce qu'elle paie.",
      gauche: ["Cens", "Banalités", "Champart", "Corvées"],
      droite: ["Une partie de la récolte", "L'utilisation de la terre", "Un travail obligatoire sur la réserve", "L'usage du moulin, du pressoir ou du four du seigneur"],
      reponse: [[0, 1], [1, 3], [2, 0], [3, 2]],
      explication: "Cens : la terre ; banalités : moulin, pressoir, four ; champart : une partie de la récolte ; corvées : du travail sur la réserve.", source: S(1) },
    { id: "histoire-s06-1-q23", fiche: "histoire-s06-1-f3", type: "vrai_faux", niveau: 2,
      enonce: "Le champart est un travail obligatoire sur la réserve.",
      corrections: ["Faux : le champart est une partie de la récolte ; le travail obligatoire sur la réserve, c'est la corvée.", "Faux : le champart est la taxe payée pour cuire son pain au four du seigneur.", "Faux : le champart est une redevance en argent payée seulement par les serfs."],
      reponse: { vrai: false, correction: "Faux : le champart est une partie de la récolte ; le travail obligatoire sur la réserve, c'est la corvée." },
      explication: "Le champart est une partie de la récolte due au seigneur. Le travail obligatoire sur la réserve s'appelle la corvée.", source: S(1) },
    { id: "histoire-s06-1-q24", fiche: "histoire-s06-1-f3", type: "qcm", niveau: 2,
      enonce: "Comment le paysan s'acquitte-t-il de ses corvées ?",
      choix: ["En travaillant gratuitement sur la réserve", "En donnant une partie de sa récolte", "En versant de l'argent au meunier du seigneur", "En se mariant dans la seigneurie"],
      reponse: "En travaillant gratuitement sur la réserve",
      explication: "La corvée se paie en travail : le paysan va travailler sur la réserve du seigneur. Donner une part de récolte, c'est le champart.", source: S(1) },
    { id: "histoire-s06-1-q25", fiche: "histoire-s06-1-f3", type: "qcm", niveau: 3,
      enonce: "Un paysan donne au seigneur une part de son blé, puis va labourer la réserve. Quel point commun ont ces deux obligations ?",
      choix: ["Elles se paient en travail ou en nature, pas en argent", "Elles ne sont dues que par les serfs, jamais par les vilains", "Elles se paient en argent, à la saint Denis", "Elles concernent toutes deux l'usage du moulin"],
      reponse: "Elles se paient en travail ou en nature, pas en argent",
      explication: "La part de blé est le champart, le labour de la réserve est une corvée. Toutes deux se paient en nature ou en travail, et tous les paysans les doivent.", indice: "Retrouve le nom de chaque obligation, puis sa colonne.", source: S(1) },
    { id: "histoire-s06-1-q26", fiche: "histoire-s06-1-f3", type: "trou", niveau: 1,
      enonce: "Complète avec le nom des taxes.",
      texte: "Le ___ est une partie de la récolte due au seigneur ; les ___ sont des taxes pour utiliser son moulin, son pressoir ou son four.",
      banque: ["champart", "banalités", "cens", "chevage"],
      reponse: [["champart"], ["banalités"]],
      explication: "Le champart se prend sur la récolte. Les banalités se paient pour le moulin, le pressoir et le four du seigneur.", source: S(1) },
    { id: "histoire-s06-1-q27", fiche: "histoire-s06-1-f3", type: "vrai_faux", niveau: 3,
      enonce: "Un vilain, paysan libre, doit lui aussi le cens, le champart, les banalités et les corvées.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : ces quatre taxes sont dues par tous les paysans, libres ou non. Être libre ne dispense pas de payer le seigneur.", source: S(1) },
    // f4 : les taxes des serfs
    { id: "histoire-s06-1-q28", fiche: "histoire-s06-1-f4", type: "qcm", niveau: 1,
      enonce: "Comment appelle-t-on un paysan qui n'est pas libre ?",
      choix: ["Un serf", "Un vilain", "Un laboureur", "Un meunier"],
      reponse: "Un serf",
      explication: "Le serf est le paysan non libre. Le vilain, lui, est libre.", source: S(1) },
    { id: "histoire-s06-1-q29", fiche: "histoire-s06-1-f4", type: "vrai_faux", niveau: 1,
      enonce: "Le formariage est une taxe payée quand un serf se marie hors de la seigneurie.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : le formariage se paie pour un mariage hors de la seigneurie. C'est une taxe propre aux serfs.", source: S(1) },
    { id: "histoire-s06-1-q30", fiche: "histoire-s06-1-f4", type: "qcm", niveau: 2,
      enonce: "Qui paie la mainmorte ?",
      choix: ["Les héritiers d'un serf", "Tous les paysans, à la saint Denis", "Le seigneur, au roi", "Le meunier, pour son moulin"],
      reponse: "Les héritiers d'un serf",
      explication: "La mainmorte est un droit payé par les héritiers d'un serf. Elle ne concerne pas les paysans libres.", source: S(1) },
    { id: "histoire-s06-1-q31", fiche: "histoire-s06-1-f4", type: "qcm_multiple", niveau: 2,
      enonce: "Quelles taxes ne sont dues que par les serfs ? (plusieurs réponses)",
      choix: ["Le chevage", "Le formariage", "La mainmorte", "Le cens", "Les corvées"],
      reponse: ["Le chevage", "Le formariage", "La mainmorte"],
      explication: "Chevage, formariage et mainmorte sont les taxes des paysans non libres. Le cens et les corvées sont dus par tous.", source: S(1) },
    { id: "histoire-s06-1-q32", fiche: "histoire-s06-1-f4", type: "vrai_faux", niveau: 2,
      enonce: "Le chevage est une partie de la récolte due par les serfs.",
      corrections: ["Faux : le chevage est une redevance en argent.", "Faux : le chevage est une corvée de labour sur la réserve.", "Faux : le chevage est payé par les vilains, pas par les serfs."],
      reponse: { vrai: false, correction: "Faux : le chevage est une redevance en argent." },
      explication: "Le chevage se paie en argent. La partie de la récolte due au seigneur, c'est le champart.", source: S(1) },
    { id: "histoire-s06-1-q33", fiche: "histoire-s06-1-f4", type: "qcm", niveau: 2,
      enonce: "Pourquoi un serf paie-t-il plus de taxes qu'un vilain ?",
      choix: ["Il n'est pas libre : trois taxes s'ajoutent pour lui", "Il possède un attelage et une charrue", "Il habite plus près du château que le vilain", "Il est plus riche que le vilain"],
      reponse: "Il n'est pas libre : trois taxes s'ajoutent pour lui",
      explication: "Le serf n'est pas libre. En plus des taxes de tous les paysans, il doit le chevage, le formariage et la mainmorte.", source: S(1) },
    { id: "histoire-s06-1-q34", fiche: "histoire-s06-1-f4", type: "association", niveau: 2,
      enonce: "Relie chaque mot à sa définition.",
      gauche: ["Chevage", "Formariage", "Mainmorte", "Vilain"],
      droite: ["Droit payé par les héritiers d'un serf", "Paysan libre", "Redevance en argent due par les serfs", "Taxe pour le mariage d'un serf hors de la seigneurie"],
      reponse: [[0, 2], [1, 3], [2, 0], [3, 1]],
      explication: "Chevage : de l'argent ; formariage : le mariage ; mainmorte : l'héritage. Le vilain est le paysan libre, qui ne doit pas ces trois taxes.", source: S(1) },
    { id: "histoire-s06-1-q35", fiche: "histoire-s06-1-f4", type: "qcm", niveau: 3,
      enonce: "Un serf meurt. Que doivent payer ses enfants au seigneur pour recevoir ses biens ?",
      choix: ["La mainmorte", "Le formariage", "Le chevage", "Le champart"],
      reponse: "La mainmorte",
      explication: "Les enfants sont les héritiers du serf : ils paient la mainmorte. Le formariage, lui, se paie pour un mariage hors de la seigneurie.", indice: "Quel mot désigne les enfants qui reçoivent les biens d'un mort ?", source: S(1) },
    { id: "histoire-s06-1-q36", fiche: "histoire-s06-1-f4", type: "trou", niveau: 1,
      enonce: "Complète avec les deux catégories de paysans.",
      texte: "Le ___ est un paysan libre ; le ___ ne l'est pas.",
      banque: ["vilain", "serf", "laboureur", "meunier"],
      reponse: [["vilain"], ["serf"]],
      explication: "Le vilain est libre, le serf ne l'est pas. Le laboureur est un paysan riche, libre ou non.", source: S(1) },
    { id: "histoire-s06-1-q37", fiche: "histoire-s06-1-f4", type: "vrai_faux", niveau: 3,
      enonce: "Un serf qui se marie dans sa propre seigneurie doit payer le formariage.",
      corrections: ["Faux : le formariage n'est dû que pour un mariage hors de la seigneurie.", "Faux : le formariage est dû par les vilains, pas par les serfs.", "Faux : le formariage se paie à la mort du serf, par ses héritiers."],
      reponse: { vrai: false, correction: "Faux : le formariage n'est dû que pour un mariage hors de la seigneurie." },
      explication: "Le formariage se paie quand le serf se marie hors de la seigneurie. Un mariage à l'intérieur n'y donne pas lieu.", source: S(1) }
  ],
  bonus: [
    {
      id: "histoire-s06-1-b1",
      fiche: "histoire-s06-1-f1",
      titre: "Pourquoi la charrue retourne la terre d'un seul côté",
      texte: "Ce qui distingue vraiment la charrue de l'araire, c'est son versoir : il rejette la terre d'un seul côté, si bien que le travail est dissymétrique. Ses pièces principales sont le soc et le versoir, auxquels peuvent s'ajouter un coutre et une rasette. Elle s'est répandue plus largement en Europe pendant la révolution agricole du Moyen Âge, du Xe au XIIIe siècle.",
      source: { titre: "Charrue", editeur: "Wikipédia, l'encyclopédie libre", url: "https://fr.wikipedia.org/wiki/Charrue" }
    }
  ],
  nonCouvert: [
    "L'étude de cas n°4 annoncée par le planning n'est pas déposée : on ne sait pas de quoi elle traite.",
    "La leçon à apprendre et les réponses rédigées aux neuf questions de l'étude de cas 3, données en vidéo.",
    "L'image de la charrue de l'étude de cas (seul le texte de l'encadré est repris) et les douze images du Rustican.",
    "Les autres techniques nouvelles des campagnes médiévales : le fichier ne cite que la charrue et le collier d'épaule.",
    "Ce qu'est précisément un fief, un vassal ou un hommage : ces mots viennent des cours suivants, en vidéo.",
    "Le montant des taxes (combien d'argent pour le cens ou le chevage, quelle part pour le champart) : le tableau ne le dit pas.",
    "Le calendrier des travaux des paysans, la famine de 1033 et la part des paysans dans la population : ils sont traités au cours 6 (histoire-s04-3).",
    "Les tenures, la réserve, les droits du seigneur et la chanson de Verson : ils sont traités aux cours 7 et 8 (histoire-s05-1, histoire-s05-2)."
  ]
};
