// Source en clair du cours histoire-s08-2 « Cours 11 – Étude de document ».
// Compilé (réponses brouillées) par node atelier/outils/compiler-cours.js histoire-s08-2.
// Sources : le support de la séance 11 (deux pages) : page 1, l'enluminure et deux questions (personnages et leur
// attitude, scène représentée) ; page 2, le corrigé qui identifie le document (hommage d'Édouard Ier à Philippe le
// Bel, Grandes Chroniques de France enluminées par Jean Fouquet, Tours, vers 1455-1460, BnF). Les fiches f1 et f3
// (le document, l'image) gardent leur source de dépôt. Depuis le 28/10/2026 (demande de Romain), les fiches f2, f4 et
// f5 viennent du programme officiel de 5e (sous-thème « L'affirmation de l'État monarchique dans le Royaume des
// Capétiens et des Valois »), vérifiées sur les pages citées dans leur source. Le devoir n°1 et le test de la séance
// 11 portent sur la cérémonie de l'hommage : aucune question sur ses étapes, une seule sur les postures (q27).
const F = "cours/histoire/Histoire 5e - Seance 11 - Support.pdf";
const S = p => ({ fichier: F, page: p });
// Questions de thème (règle du 25/10/2026) : fait vérifié dans une source fiable, notée sans fichier ni page.
const T = (titre, url) => ({ theme: "Cours 11 – Étude de document", titre, editeur: "Wikipédia", url });
// Fiches de programme (règle du 28/10/2026) : sous-thème officiel, page où les faits ont été vérifiés.
const P = (titre, url) => ({ programme: "L'affirmation de l'État monarchique dans le Royaume des Capétiens et des Valois", titre, editeur: "Wikipédia", url });
const U_EDOUARD = "https://fr.wikipedia.org/wiki/%C3%89douard_Ier_(roi_d%27Angleterre)";
const U_PHILIPPE4 = "https://fr.wikipedia.org/wiki/Philippe_IV_le_Bel";
const U_CHRONIQUES = "https://fr.wikipedia.org/wiki/Grandes_Chroniques_de_France";
const U_FOUQUET = "https://fr.wikipedia.org/wiki/Jean_Fouquet";
const U_FLEUR = "https://fr.wikipedia.org/wiki/Fleur_de_lys";
const U_TRAITE1259 = "https://fr.wikipedia.org/wiki/Trait%C3%A9_de_Paris_(1259)";
const U_GUYENNE = "https://fr.wikipedia.org/wiki/Guyenne";
const U_SARDOS = "https://fr.wikipedia.org/wiki/Guerre_de_Saint-Sardos";
const U_CENTANS = "https://fr.wikipedia.org/wiki/Guerre_de_Cent_Ans";

// Schéma de la composition de l'enluminure, redessiné en silhouettes (aucune image reprise) : le roi assis sur son
// trône à gauche, le roi à genoux devant lui, l'homme au livre entre eux, les témoins debout derrière.
function composition() {
  const encre = "#2e2419", bleu = "#2c4a9e", rouge = "#b23a3a", or = "#d4a93a";
  let s = "<svg viewBox='0 0 540 300' xmlns='http://www.w3.org/2000/svg' font-family='Georgia,serif' font-size='11'>";
  // salle bleue à fleurs de lys (motif simplifié : losanges dorés)
  s += "<rect x='0' y='0' width='540' height='300' fill='" + bleu + "'/>";
  for (let i = 0; i < 12; i++) for (let j = 0; j < 7; j++) {
    const cx = 25 + i * 45 + (j % 2) * 22, cy = 22 + j * 40;
    s += "<path d='M" + cx + " " + (cy - 7) + " l5 7 -5 7 -5 -7 z' fill='" + or + "' opacity='0.8'/>";
  }
  // fenêtre au fond
  s += "<rect x='238' y='60' width='64' height='70' fill='#e9e2c8' stroke='" + or + "' stroke-width='3'/>";
  s += "<line x1='270' y1='60' x2='270' y2='130' stroke='" + or + "' stroke-width='2'/><line x1='238' y1='95' x2='302' y2='95' stroke='" + or + "' stroke-width='2'/>";
  // sol
  s += "<rect x='0' y='230' width='540' height='70' fill='#1f3675'/>";
  // trône (à gauche) et roi assis : silhouette
  s += "<rect x='40' y='120' width='22' height='120' fill='" + or + "'/><rect x='40' y='112' width='70' height='8' fill='" + or + "'/>";
  s += "<ellipse cx='98' cy='128' rx='14' ry='15' fill='#f1dcc0'/>";
  s += "<path d='M84 116 l6 -12 8 8 8 -8 6 12 z' fill='" + or + "'/>";
  s += "<path d='M70 142 h56 l10 60 h-30 v40 h-34 v-40 h-12 z' fill='#3a62c8' stroke='" + encre + "'/>";
  s += "<line x1='128' y1='110' x2='128' y2='240' stroke='" + or + "' stroke-width='4'/><circle cx='128' cy='106' r='6' fill='" + or + "'/>";
  // livre ouvert tenu par un homme entre les deux rois
  s += "<ellipse cx='200' cy='150' rx='11' ry='12' fill='#f1dcc0'/>";
  s += "<rect x='186' y='162' width='28' height='60' fill='#5b7a3a' stroke='" + encre + "'/>";
  s += "<path d='M160 200 l30 -8 30 8 v10 l-30 -8 -30 8 z' fill='#fbf6ea' stroke='" + encre + "'/>";
  // roi à genoux, manteau rouge
  s += "<ellipse cx='262' cy='170' rx='13' ry='14' fill='#f1dcc0'/>";
  s += "<path d='M249 158 l5 -11 8 7 8 -7 5 11 z' fill='" + or + "'/>";
  s += "<path d='M236 184 h52 l40 56 h-130 z' fill='" + rouge + "' stroke='" + encre + "'/>";
  for (let k = 0; k < 6; k++) s += "<circle cx='" + (246 + k * 14) + "' cy='" + (214 + (k % 2) * 10) + "' r='3' fill='" + or + "'/>";
  // témoins debout derrière (silhouettes)
  const couleurs = ["#e9e2c8", "#e9e2c8", "#b23a3a", "#3f8a5a", "#b23a3a", "#e9e2c8", "#3f8a5a"];
  for (let k = 0; k < 7; k++) {
    const cx = 330 + k * 28, haut = 140 + (k % 2) * 6;
    s += "<ellipse cx='" + cx + "' cy='" + haut + "' rx='9' ry='10' fill='#f1dcc0'/>";
    s += "<rect x='" + (cx - 11) + "' y='" + (haut + 10) + "' width='22' height='80' fill='" + couleurs[k] + "' stroke='" + encre + "'/>";
  }
  // étiquettes
  s += "<rect x='8' y='250' width='524' height='42' fill='#fbf6ea' opacity='0.92'/>";
  s += "<text x='20' y='266' fill='" + encre + "'>À gauche : Philippe le Bel, assis sur un trône, couronne, sceptre, manteau bleu à fleurs de lys.</text>";
  s += "<text x='20' y='282' fill='" + encre + "'>Au centre : Édouard Ier, couronné, à genoux en manteau rouge ; un homme tient un livre ouvert ; témoins debout.</text>";
  return s + "</svg>";
}

module.exports = {
  id: "histoire-s08-2",
  fiches: [
    {
      id: "histoire-s08-2-f1", notion: "Le document : une enluminure de Jean Fouquet dans les Grandes Chroniques de France",
      titre: "Une page des Grandes Chroniques de France, peinte par Jean Fouquet",
      texte: "Le document est une enluminure : une peinture dans un livre fait à la main. Elle vient des Grandes Chroniques de France, enluminées par Jean Fouquet à Tours, vers 1455-1460. Le manuscrit est conservé à Paris, à la BnF (département des Manuscrits, Français 6465) ; la page, le feuillet 301, est dans le Livre de Philippe le Bel.",
      pointsCles: ["Une enluminure des Grandes Chroniques de France", "Peinte par Jean Fouquet, à Tours, vers 1455-1460", "Conservée à Paris, à la BnF (département des Manuscrits, Français 6465, feuillet 301 verso)", "Dans la partie du livre consacrée à Philippe le Bel"],
      dates: [
        { annee: 1455, evenement: "Vers 1455-1460 : Jean Fouquet enlumine les Grandes Chroniques de France" }
      ],
      lieux: ["Tours", "Paris"], personnages: ["Jean Fouquet"],
      vocabulaire: [
        { mot: "enluminure", def: "une peinture faite à la main dans un livre manuscrit" },
        { mot: "manuscrit", def: "un livre écrit à la main, avant l'imprimerie" },
        { mot: "chronique", def: "un récit des événements dans l'ordre du temps, comme les Grandes Chroniques de France" },
        { mot: "BnF", def: "la Bibliothèque nationale de France, à Paris, où le manuscrit est conservé" }
      ],
      schema: null, prerequis: ["histoire-s01-2-f3"], source: S(2)
    },
    {
      id: "histoire-s08-2-f2", notion: "1286 : le roi d'Angleterre, vassal du roi de France pour la Guyenne",
      titre: "Un roi devant un autre roi : l'hommage de 1286",
      texte: "En 1286, Édouard Ier, roi d'Angleterre depuis 1272, vient en France et rend hommage au nouveau roi, Philippe le Bel. Pourquoi un roi s'incline-t-il devant un autre ? Parce qu'il tient de lui la Guyenne, dans le Sud-Ouest : pour ce duché, il est son vassal. Nul grand, pas même un roi, n'échappe à l'hommage dû au roi de France.",
      pointsCles: ["Édouard Ier : roi d'Angleterre de 1272 à 1307, surnommé « Longues-Jambes » ; il conquiert le pays de Galles (1282-1283) et guerroie en Écosse", "Depuis le traité de Paris (1259), le roi d'Angleterre tient la Guyenne (Limousin, Périgord, Quercy, Agenais, Saintonge du sud…) comme vassal du roi de France", "1286 : au cours d'une mission diplomatique en France, Édouard Ier rend hommage à Philippe IV le Bel, roi depuis octobre 1285", "1294 : Philippe le Bel prononce la saisie du duché d'Aquitaine ; guerre de Guyenne (1294-1297) ; paix en 1299, scellée par le mariage d'Édouard avec Marguerite, demi-sœur de Philippe", "Ce que l'image affirme : dans son royaume, le roi de France est le seigneur de tous"],
      astuce: "1286, l'hommage ; 1294, la saisie ; 1299, la paix et le mariage : huit ans pour passer de l'un à l'autre.",
      dates: [
        { annee: 1272, evenement: "Édouard Ier devient roi d'Angleterre" },
        { annee: 1286, evenement: "Édouard Ier rend hommage à Philippe le Bel pour la Guyenne" },
        { annee: 1294, evenement: "Philippe le Bel saisit le duché d'Aquitaine : guerre de Guyenne" }
      ],
      lieux: ["Guyenne", "Paris", "Bordeaux"], personnages: ["Édouard Ier", "Philippe le Bel", "Marguerite de France"],
      vocabulaire: [
        { mot: "Guyenne", def: "le nom donné au duché d'Aquitaine, dans le Sud-Ouest, tenu par le roi d'Angleterre" },
        { mot: "mission diplomatique", def: "un voyage officiel pour négocier avec un autre souverain" },
        { mot: "saisie", def: "la confiscation d'un fief par le seigneur qui l'a donné" }
      ],
      schema: "histoire-s08-2-s1", prerequis: ["histoire-s08-1-f5", "histoire-s07-2-f6", "histoire-s08-2-f1"], source: P("Édouard Ier (roi d'Angleterre)", U_EDOUARD)
    },
    {
      id: "histoire-s08-2-f3", notion: "Lire l'image : trône, couronnes, manteau à fleurs de lys, livre",
      titre: "Ce que montre l'enluminure",
      texte: "Philippe le Bel, assis sur un trône, porte une couronne, un sceptre et un manteau bleu à fleurs de lys ; les murs sont du même bleu. Édouard Ier, couronné, porte un grand manteau rouge brodé d'or. Entre eux, un homme tient un livre ouvert ; derrière, des hommes debout regardent. Les couleurs disent qui est le maître.",
      pointsCles: ["Philippe le Bel : trône, couronne, sceptre, manteau bleu à fleurs de lys", "Les murs de la salle : bleus, à fleurs de lys, comme le manteau du roi de France", "Édouard Ier : couronne, grand manteau rouge brodé d'or", "Un homme tient un livre ouvert entre les deux rois ; des témoins debout derrière", "Seul Philippe le Bel a le trône et le sceptre : l'image le place au-dessus"],
      astuce: "Bleu et fleurs de lys pour celui qui reçoit l'hommage, rouge pour celui qui le rend.",
      dates: [],
      lieux: [], personnages: ["Philippe le Bel", "Édouard Ier"],
      vocabulaire: [
        { mot: "trône", def: "le siège d'apparat d'un roi" },
        { mot: "sceptre", def: "le long bâton orné que tient un roi" },
        { mot: "fleur de lys", def: "le motif en forme de fleur stylisée qui décore le manteau de Philippe le Bel et les murs de la salle" }
      ],
      schema: "histoire-s08-2-s1", prerequis: ["histoire-s08-2-f2"], source: S(1)
    },
    {
      id: "histoire-s08-2-f4", notion: "Les Grandes Chroniques de France : l'histoire des rois écrite à Saint-Denis",
      titre: "Le livre officiel des rois de France",
      texte: "Les Grandes Chroniques de France racontent l'histoire des rois de France, en français et non en latin. Vers 1250, le moine Primat, à l'abbaye de Saint-Denis, en écrit le début, jusqu'à Philippe Auguste ; des continuateurs poursuivent au XIVe siècle, puis pour Charles V. Plus de 115 manuscrits subsistent ; celui que Fouquet enlumine vers 1455-1460 compte 51 miniatures.",
      pointsCles: ["Une chronique en langue française, et non en latin : l'histoire officielle des rois, de leurs origines jusqu'au roi du moment", "Vers 1250 : Primat, moine de Saint-Denis, écrit le Roman des rois, qui va jusqu'à Philippe Auguste ; l'abbaye y justifie sa place dans le royaume", "XIVe siècle : les moines de Saint-Denis, puis l'entourage de Charles V, continuent le récit ; le manuscrit de Charles V est à la BnF (Français 2813)", "Plus de 115 manuscrits antérieurs à la Renaissance ; celui de Charles VII, enluminé par Jean Fouquet vers 1455-1460, est le Français 6465", "Lire ces images : elles montrent les rois comme le pouvoir royal veut qu'on les voie"],
      astuce: "Saint-Denis écrit, les rois commandent, les peintres illustrent : trois mains pour un même livre.",
      dates: [
        { annee: 1250, evenement: "Vers 1250 : le moine Primat écrit le début des Grandes Chroniques, à Saint-Denis" }
      ],
      lieux: ["Saint-Denis", "Tours"], personnages: ["Primat", "Charles V", "Charles VII", "Jean Fouquet"],
      vocabulaire: [
        { mot: "continuateur", def: "celui qui poursuit un livre commencé par un autre" },
        { mot: "langue vernaculaire", def: "la langue parlée par les gens du pays, ici le français, par opposition au latin" },
        { mot: "miniature", def: "une petite peinture dans un manuscrit" }
      ],
      schema: null, prerequis: ["histoire-s08-2-f1"], source: P("Grandes Chroniques de France", U_CHRONIQUES)
    },
    {
      id: "histoire-s08-2-f5", notion: "La Guyenne, pomme de discorde entre les deux rois",
      titre: "Un fief qui vaut une guerre : la Guyenne",
      texte: "Le 4 décembre 1259, Henri III d'Angleterre rend hommage à Louis IX : il renonce à la Normandie et à l'Anjou, mais garde la Guyenne comme vassal du roi de France. Un roi vassal d'un roi, cela tourne mal. La Guyenne est saisie en 1294, en 1324, puis en 1337. Édouard III réplique : la guerre de Cent Ans.",
      pointsCles: ["La Guyenne (le nom apparaît en 1259) : l'ancien duché d'Aquitaine, autour de Bordeaux, aux mains des Plantagenêts, rois d'Angleterre, jusqu'en 1453", "Traité de Paris : accord du 28 mai 1258, hommage d'Henri III à Louis IX le 4 décembre 1259 ; Henri garde Guyenne, Limousin, Périgord, Quercy, Agenais et Saintonge du sud, et abandonne Normandie, Anjou, Touraine, Maine, Poitou", "1286 : Édouard Ier rend hommage à Philippe le Bel ; 1294 : Philippe le Bel saisit le duché, guerre de Guyenne (1294-1297)", "1323-1324 : l'affaire de la bastide de Saint-Sardos ; Charles IV confisque l'Aquitaine ; le jeune Édouard III rend hommage pour son père (1325)", "1337 : Philippe VI saisit la Guyenne ; en octobre, Édouard III rompt son lien de vassalité et réclame la couronne : la guerre de Cent Ans commence ; la Guyenne redevient française après Castillon (1453)"],
      astuce: "Trois saisies, trois rois de France : Philippe le Bel (1294), Charles IV (1324), Philippe VI (1337).",
      dates: [
        { annee: 1259, evenement: "Traité de Paris : Henri III rend hommage à Louis IX pour la Guyenne" },
        { annee: 1294, evenement: "Première saisie de la Guyenne par Philippe le Bel" },
        { annee: 1337, evenement: "Philippe VI saisit la Guyenne : début de la guerre de Cent Ans" }
      ],
      lieux: ["Guyenne", "Bordeaux", "Paris", "Saint-Sardos"], personnages: ["Henri III", "Louis IX", "Édouard Ier", "Charles IV", "Édouard III", "Philippe VI"],
      vocabulaire: [
        { mot: "Aquitaine", def: "le grand duché du Sud-Ouest, que l'on appelle Guyenne à partir de 1259" },
        { mot: "renoncer", def: "abandonner un droit ou un bien" },
        { mot: "Agenais", def: "la région d'Agen, entre Bordeaux et Toulouse, disputée entre les deux rois" }
      ],
      schema: null, prerequis: ["histoire-s08-2-f2", "histoire-s08-1-f4"], source: P("Traité de Paris (1259)", U_TRAITE1259)
    }
  ],
  schemas: [
    { id: "histoire-s08-2-s1", legende: "La composition de l'enluminure, redessinée en silhouettes : le roi assis sur son trône, le roi à genoux devant lui, l'homme au livre entre eux et les témoins debout, dans une salle bleue à fleurs de lys.", svg: composition() }
  ],
  questions: [
    // f1 : le document
    { id: "histoire-s08-2-q1", fiche: "histoire-s08-2-f1", type: "qcm", niveau: 1,
      enonce: "Qui a peint l'enluminure de l'hommage d'Édouard Ier à Philippe le Bel ?",
      choix: ["Jean Fouquet", "Eginhard", "Raoul Glaber", "Pietro Crescenzi"],
      reponse: "Jean Fouquet",
      explication: "L'enluminure est de Jean Fouquet, qui a aussi peint le couronnement de Charlemagne. Eginhard et Raoul Glaber sont des auteurs de textes.", source: S(2) },
    { id: "histoire-s08-2-q2", fiche: "histoire-s08-2-f1", type: "vrai_faux", niveau: 1,
      enonce: "L'enluminure vient des Grandes Chroniques de France.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : elle décore un manuscrit des Grandes Chroniques de France. Jean Fouquet l'a peinte à Tours.", source: S(2) },
    { id: "histoire-s08-2-q6", fiche: "histoire-s08-2-f1", type: "qcm", niveau: 2,
      enonce: "Comment appelle-t-on une peinture faite dans un livre écrit à la main, comme celle de Jean Fouquet ?",
      choix: ["Une enluminure", "Une chronique", "Un cartulaire scellé", "Une frise"],
      reponse: "Une enluminure",
      explication: "Une enluminure est une peinture dans un manuscrit. La chronique, elle, est le texte qui raconte l'histoire des rois.", source: S(2) },
    { id: "histoire-s08-2-q7", fiche: "histoire-s08-2-f1", type: "qcm", niveau: 3,
      enonce: "Jean Fouquet a aussi peint le couronnement de Charlemagne. Quel point commun ont ses deux enluminures étudiées cette année ?",
      choix: ["Elles montrent des scènes bien plus anciennes que le XVe siècle où il peint", "Elles ont été peintes l'année même des événements qu'elles montrent", "Elles montrent toutes les deux Philippe le Bel", "Elles ont été peintes à Rome"],
      reponse: "Elles montrent des scènes bien plus anciennes que le XVe siècle où il peint",
      explication: "Charlemagne est couronné en 800 et Philippe le Bel règne de 1285 à 1314. Jean Fouquet, lui, peint vers 1455-1460, longtemps après.", indice: "Compare les dates des scènes et celles du peintre.", source: S(2) },
    { id: "histoire-s08-2-q8", fiche: "histoire-s08-2-f1", type: "trou", niveau: 1,
      enonce: "Complète avec le nom du livre et celui du peintre.",
      texte: "Les Grandes ___ de France ont été enluminées par Jean ___ à Tours.",
      banque: ["Chroniques", "Fouquet", "Annales", "Glaber"],
      reponse: [["Chroniques"], ["Fouquet"]],
      explication: "Le livre s'appelle les Grandes Chroniques de France. Jean Fouquet l'a enluminé à Tours, vers 1455-1460.", source: S(2) },
    { id: "histoire-s08-2-q9", fiche: "histoire-s08-2-f1", type: "vrai_faux", niveau: 3,
      enonce: "Entre le règne de Philippe le Bel (1285-1314) et l'enluminure de Jean Fouquet (vers 1455-1460), il s'écoule plus d'un siècle.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : de 1314 à 1455, il y a 141 ans. Jean Fouquet peint une scène qu'il n'a pas pu voir.", source: S(2) },
    { id: "histoire-s08-2-q31", fiche: "histoire-s08-2-f1", type: "ordre", niveau: 2,
      enonce: "Remets ces repères dans l'ordre du temps.",
      elements: ["Couronnement de Charlemagne, en 800", "Début du règne de Philippe le Bel, en 1285", "Fin du règne de Philippe le Bel, en 1314", "Jean Fouquet enlumine les Grandes Chroniques de France, vers 1455-1460"],
      reponse: [0, 1, 2, 3],
      explication: "800, puis 1285 et 1314, enfin 1455-1460. Jean Fouquet peint les deux scènes, celle de Charlemagne et celle de Philippe le Bel, longtemps après.", source: S(2) },
    // f2 : l'hommage de 1286 (fiche de programme ; q10 et q11 viennent de la légende du support)
    { id: "histoire-s08-2-q10", fiche: "histoire-s08-2-f2", type: "qcm", niveau: 1,
      enonce: "Quelle scène l'enluminure de Jean Fouquet étudiée en séance représente-t-elle ?",
      choix: ["L'hommage d'Édouard Ier à Philippe le Bel", "Le couronnement de Charlemagne à Rome", "La bataille de Bouvines", "L'élection de Hugues Capet"],
      reponse: "L'hommage d'Édouard Ier à Philippe le Bel",
      explication: "La légende du support nomme la scène : l'hommage d'Édouard Ier à Philippe le Bel. Le couronnement de Charlemagne est une autre enluminure de Fouquet.", source: S(2) },
    { id: "histoire-s08-2-q11", fiche: "histoire-s08-2-f2", type: "vrai_faux", niveau: 1,
      enonce: "Sur l'enluminure, c'est Édouard Ier qui rend hommage à Philippe le Bel.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : Édouard Ier rend l'hommage, Philippe le Bel le reçoit. Le roi d'Angleterre est le vassal du roi de France pour ses terres du Sud-Ouest.", source: S(2) },
    { id: "histoire-s08-2-q14", fiche: "histoire-s08-2-f2", type: "qcm", niveau: 3,
      enonce: "Pourquoi le roi d'Angleterre Édouard Ier rend-il hommage au roi de France ?",
      choix: ["Parce qu'il tient du roi de France des terres situées en France, l'Aquitaine", "Parce qu'il a perdu la guerre de Cent Ans contre lui et doit accepter sa défaite", "Parce que Philippe le Bel est aussi roi d'Angleterre", "Parce que l'empereur germanique le lui ordonne"],
      reponse: "Parce qu'il tient du roi de France des terres situées en France, l'Aquitaine",
      explication: "Édouard Ier est roi d'Angleterre, mais aussi duc d'Aquitaine, dans le sud-ouest du royaume de France. Pour ces terres, il dépend du roi de France : c'est pourquoi il lui rend hommage, en 1286.",
      source: T("Édouard Ier (roi d'Angleterre)", U_EDOUARD) },
    { id: "histoire-s08-2-q15", fiche: "histoire-s08-2-f2", type: "qcm", niveau: 3,
      enonce: "Philippe le Bel règne de 1285 à 1314. À quelle période l'hommage d'Édouard Ier a-t-il pu avoir lieu ?",
      choix: ["Entre 1285 et 1314", "En 1214, à Bouvines", "Vers 1455-1460", "En 987"],
      reponse: "Entre 1285 et 1314",
      explication: "L'hommage est rendu au roi Philippe le Bel : il a donc lieu pendant son règne, en 1286. 1455-1460 est la date de la peinture, pas de la scène.", indice: "Un hommage se rend à un roi qui règne.", source: S(2) },
    { id: "histoire-s08-2-q16", fiche: "histoire-s08-2-f2", type: "qcm", niveau: 1,
      enonce: "Qui est Édouard Ier ?",
      choix: ["Le roi d'Angleterre, qui a aussi des terres en France", "Le fils de Philippe le Bel, futur roi de France", "L'empereur germanique, venu rendre visite au roi de France à Paris", "Le peintre de l'enluminure"],
      reponse: "Le roi d'Angleterre, qui a aussi des terres en France",
      explication: "Édouard Ier règne sur l'Angleterre de 1272 à 1307. Il est aussi duc d'Aquitaine, dans le sud-ouest de la France, ce qui l'oblige à rendre hommage au roi de France.",
      source: T("Édouard Ier (roi d'Angleterre)", U_EDOUARD) },
    { id: "histoire-s08-2-q32", fiche: "histoire-s08-2-f2", type: "vrai_faux", niveau: 2,
      enonce: "Édouard Ier rend hommage à Philippe le Bel pour la Normandie.",
      corrections: ["Faux : c'est pour la Guyenne, dans le Sud-Ouest ; la Normandie est au roi de France depuis 1204.", "Faux : c'est pour la couronne d'Angleterre elle-même.", "Faux : c'est pour la ville de Paris."],
      reponse: { vrai: false, correction: "Faux : c'est pour la Guyenne, dans le Sud-Ouest ; la Normandie est au roi de France depuis 1204." },
      explication: "Le roi d'Angleterre a perdu la Normandie en 1204, prise par Philippe Auguste. En 1286, il ne tient plus en France que la Guyenne, et c'est pour elle qu'il rend hommage.",
      source: T("Édouard Ier (roi d'Angleterre)", U_EDOUARD) },
    { id: "histoire-s08-2-q33", fiche: "histoire-s08-2-f2", type: "qcm", niveau: 2,
      enonce: "Que décide Philippe le Bel en 1294, huit ans après l'hommage ?",
      choix: ["Il prononce la saisie du duché d'Aquitaine", "Il donne la Normandie à Édouard Ier", "Il cède sa couronne à Édouard Ier", "Il épouse la fille d'Édouard Ier"],
      reponse: "Il prononce la saisie du duché d'Aquitaine",
      explication: "En 1294, Philippe le Bel saisit le duché d'Aquitaine : c'est la guerre de Guyenne, jusqu'en 1297. Le seigneur reprend le fief de son vassal, même si ce vassal est roi.",
      source: T("Édouard Ier (roi d'Angleterre)", U_EDOUARD) },
    { id: "histoire-s08-2-q34", fiche: "histoire-s08-2-f2", type: "qcm", niveau: 2,
      enonce: "Comment la querelle de 1294 entre Édouard Ier et Philippe le Bel se termine-t-elle ?",
      choix: ["Par une paix en 1299 et un mariage : Édouard épouse Marguerite, demi-sœur de Philippe", "Par la conquête de Londres par Philippe le Bel", "Par la bataille de Bouvines", "Par l'arrivée de Jeanne d'Arc"],
      reponse: "Par une paix en 1299 et un mariage : Édouard épouse Marguerite, demi-sœur de Philippe",
      explication: "Le traité de Montreuil-sur-Mer, en 1299, ramène la paix, et Édouard Ier épouse Marguerite de France. La guerre de Guyenne a coûté cher aux Anglais sans rien leur rapporter.",
      source: T("Édouard Ier (roi d'Angleterre)", U_EDOUARD) },
    // f3 : lire l'image (une seule question de posture, q27)
    { id: "histoire-s08-2-q19", fiche: "histoire-s08-2-f3", type: "qcm", niveau: 1,
      enonce: "Quel emblème des rois de France couvre le manteau de Philippe le Bel sur l'enluminure ?",
      choix: ["La fleur de lys", "Le lion dressé", "L'aigle à deux têtes", "La croix rouge"],
      reponse: "La fleur de lys",
      explication: "Le manteau bleu de Philippe le Bel est semé de fleurs de lys d'or, comme les murs de la salle. C'est l'emblème des rois de France.", source: S(1) },
    { id: "histoire-s08-2-q21", fiche: "histoire-s08-2-f3", type: "qcm", niveau: 2,
      enonce: "Pourquoi voit-on des fleurs de lys sur le manteau du roi de France et sur les murs autour de lui ?",
      choix: ["La fleur de lys est l'emblème des rois de France depuis le XIIe siècle", "C'est l'emblème du roi d'Angleterre, venu rendre hommage à Philippe le Bel", "C'est le signe des villes du domaine royal", "C'est une simple mode de décoration du XVe siècle"],
      reponse: "La fleur de lys est l'emblème des rois de France depuis le XIIe siècle",
      explication: "Depuis le roi Louis VII, au XIIe siècle, les rois de France ont pour armes des fleurs de lys d'or sur fond bleu. Le peintre en couvre le manteau et les murs pour montrer que l'homme assis sur le trône est le roi de France.",
      source: T("Fleur de lys", U_FLEUR) },
    { id: "histoire-s08-2-q23", fiche: "histoire-s08-2-f3", type: "vrai_faux", niveau: 2,
      enonce: "Les deux rois sont seuls dans la salle.",
      corrections: ["Faux : des hommes debout, derrière eux, assistent à la scène, et un homme tient un livre ouvert.", "Faux : une foule de paysans les entoure.", "Faux : seul un meunier est présent, près de la fenêtre."],
      reponse: { vrai: false, correction: "Faux : des hommes debout, derrière eux, assistent à la scène, et un homme tient un livre ouvert." },
      explication: "Plusieurs hommes debout assistent à l'hommage, et un homme tient un livre ouvert entre les deux rois. La scène a des témoins.", source: S(1) },
    { id: "histoire-s08-2-q25", fiche: "histoire-s08-2-f3", type: "qcm_multiple", niveau: 2,
      enonce: "Quels objets montrent le pouvoir royal de Philippe le Bel sur l'image ? (plusieurs réponses)",
      choix: ["Une couronne", "Un sceptre", "Un trône", "Un manteau bleu à fleurs de lys", "Une épée levée", "Un livre ouvert"],
      reponse: ["Une couronne", "Un sceptre", "Un trône", "Un manteau bleu à fleurs de lys"],
      explication: "Couronne, sceptre, trône et manteau à fleurs de lys sont les signes du roi de France sur l'image. Le livre ouvert est tenu par un autre homme, et personne ne lève d'épée dans cette salle.", source: S(1) },
    { id: "histoire-s08-2-q26", fiche: "histoire-s08-2-f3", type: "association", niveau: 2,
      enonce: "Relie chaque personnage de l'enluminure à ce qu'il fait ou porte.",
      gauche: ["Philippe le Bel", "Édouard Ier", "L'homme entre les deux rois", "Les hommes du fond"],
      droite: ["Tient un livre ouvert", "Debout, ils assistent à la scène", "Manteau bleu à fleurs de lys et sceptre", "Grand manteau rouge brodé d'or"],
      reponse: [[0, 2], [1, 3], [2, 0], [3, 1]],
      explication: "Philippe le Bel porte le bleu à fleurs de lys et le sceptre, Édouard Ier le rouge brodé d'or. Entre eux, l'homme au livre ; derrière, les témoins debout.", source: S(1) },
    { id: "histoire-s08-2-q27", fiche: "histoire-s08-2-f3", type: "qcm", niveau: 3,
      enonce: "D'après leurs positions sur l'image, lequel des deux rois est placé au-dessus de l'autre ?",
      choix: ["Philippe le Bel, assis sur le trône", "Édouard Ier, à genoux", "Aucun : ils sont tous les deux assis", "L'homme au livre"],
      reponse: "Philippe le Bel, assis sur le trône",
      explication: "Celui qui est assis sur le trône domine celui qui est à genoux. L'image place ainsi Philippe le Bel au-dessus d'Édouard Ier.", indice: "Qui est assis, qui est à genoux ?", source: S(1) },
    { id: "histoire-s08-2-q29", fiche: "histoire-s08-2-f3", type: "vrai_faux", niveau: 3,
      enonce: "Un seul des deux rois porte une couronne sur l'image.",
      corrections: ["Faux : tous les deux portent une couronne, mais seul Philippe le Bel tient un sceptre.", "Faux : aucun des deux ne porte de couronne.", "Faux : seul Édouard Ier porte une couronne."],
      reponse: { vrai: false, correction: "Faux : tous les deux portent une couronne, mais seul Philippe le Bel tient un sceptre." },
      explication: "Philippe le Bel et Édouard Ier portent chacun une couronne. Le sceptre et le trône, eux, n'appartiennent qu'à Philippe le Bel.", source: S(1) },
    // f4 : les Grandes Chroniques de France (fiche de programme, questions de thème)
    { id: "histoire-s08-2-q30", fiche: "histoire-s08-2-f4", type: "qcm", niveau: 2,
      enonce: "Que sont les Grandes Chroniques de France ?",
      choix: ["L'histoire des rois de France, écrite en français par les moines de Saint-Denis", "Un recueil des lois de Philippe le Bel, copié par ses légistes pour tout le royaume", "Le journal personnel de Jean Fouquet", "Une chanson sur les paysans de Verson"],
      reponse: "L'histoire des rois de France, écrite en français par les moines de Saint-Denis",
      explication: "Les Grandes Chroniques de France racontent l'histoire des rois de France depuis leurs origines, en français et non en latin. Elles sont écrites à l'abbaye de Saint-Denis, à partir du travail du moine Primat au XIIIe siècle, et souvent décorées d'enluminures.",
      source: T("Grandes Chroniques de France", U_CHRONIQUES) },
    { id: "histoire-s08-2-q35", fiche: "histoire-s08-2-f4", type: "qcm", niveau: 1,
      enonce: "Dans quelle abbaye écrit-on les Grandes Chroniques de France ?",
      choix: ["Saint-Denis", "Cluny", "Le Mont-Saint-Michel", "Saint-Vital de Ravenne"],
      reponse: "Saint-Denis",
      explication: "L'abbaye de Saint-Denis, près de Paris, écrit l'histoire des rois. Le moine Primat en rédige le début vers 1250.",
      source: T("Grandes Chroniques de France", U_CHRONIQUES) },
    { id: "histoire-s08-2-q36", fiche: "histoire-s08-2-f4", type: "vrai_faux", niveau: 1,
      enonce: "Les Grandes Chroniques de France sont écrites en latin.",
      corrections: ["Faux : elles sont écrites en français, la langue du pays, et non en latin.", "Faux : elles sont écrites en grec, comme à Constantinople.", "Faux : elles ne contiennent que des images, sans texte."],
      reponse: { vrai: false, correction: "Faux : elles sont écrites en français, la langue du pays, et non en latin." },
      explication: "Elles sont écrites en langue vernaculaire, le français, ce qui est rare pour une histoire officielle au XIIIe siècle. Le latin reste la langue des savants et de l'Église.",
      source: T("Grandes Chroniques de France", U_CHRONIQUES) },
    { id: "histoire-s08-2-q37", fiche: "histoire-s08-2-f4", type: "qcm", niveau: 2,
      enonce: "Qui écrit le début des Grandes Chroniques de France, vers 1250 ?",
      choix: ["Primat, un moine de Saint-Denis", "Jean Fouquet, un peintre de Tours", "Raoul Glaber, un moine de Bourgogne", "Guillaume de Nogaret, un légiste du roi"],
      reponse: "Primat, un moine de Saint-Denis",
      explication: "Le moine Primat écrit vers 1250 le Roman des rois, qui va jusqu'à Philippe Auguste. D'autres moines, puis l'entourage de Charles V, continuent après lui.",
      source: T("Grandes Chroniques de France", U_CHRONIQUES) },
    { id: "histoire-s08-2-q38", fiche: "histoire-s08-2-f4", type: "qcm", niveau: 2,
      enonce: "Pourquoi l'abbaye de Saint-Denis écrit-elle l'histoire des rois de France ?",
      choix: ["Pour montrer son importance dans le royaume", "Parce que le pape le lui ordonne", "Pour vendre les livres aux marchands", "Parce que les rois ne savent pas écrire"],
      reponse: "Pour montrer son importance dans le royaume",
      explication: "L'abbaye, liée aux rois depuis des siècles, justifie ainsi sa place dans le royaume. Écrire l'histoire des rois, c'est aussi dire comment il faut les voir.",
      source: T("Grandes Chroniques de France", U_CHRONIQUES) },
    { id: "histoire-s08-2-q39", fiche: "histoire-s08-2-f4", type: "qcm", niveau: 2,
      enonce: "Combien de manuscrits des Grandes Chroniques antérieurs à la Renaissance nous sont parvenus ?",
      choix: ["Plus de 115", "Un seul", "Une dizaine", "Plus de 10 000"],
      reponse: "Plus de 115",
      explication: "Plus de 115 manuscrits d'avant la Renaissance subsistent. Celui de Charles V (Français 2813) et celui de Charles VII, enluminé par Fouquet (Français 6465), sont à la BnF.",
      source: T("Grandes Chroniques de France", U_CHRONIQUES) },
    { id: "histoire-s08-2-q40", fiche: "histoire-s08-2-f4", type: "qcm", niveau: 3,
      enonce: "Pour quel roi le manuscrit enluminé par Jean Fouquet vers 1455-1460 a-t-il été fait ?",
      choix: ["Charles VII", "Philippe le Bel", "Charles V", "Louis IX"],
      reponse: "Charles VII",
      explication: "Ce manuscrit est attribué à Charles VII, le roi que Jeanne d'Arc a conduit à Reims. Fouquet y peint 51 miniatures, dont l'hommage d'Édouard Ier.", indice: "Quel roi règne entre 1455 et 1460 ?",
      source: T("Grandes Chroniques de France", U_CHRONIQUES) },
    { id: "histoire-s08-2-q41", fiche: "histoire-s08-2-f4", type: "trou", niveau: 1,
      enonce: "Complète avec le lieu et la langue des Grandes Chroniques.",
      texte: "Les Grandes Chroniques de France sont écrites à l'abbaye de ___, en ___.",
      banque: ["Saint-Denis", "français", "Cluny", "latin"],
      reponse: [["Saint-Denis"], ["français"]],
      explication: "Saint-Denis, l'abbaye des rois, écrit leur histoire en français. C'est le livre officiel de la monarchie.",
      source: T("Grandes Chroniques de France", U_CHRONIQUES) },
    // f5 : la Guyenne (fiche de programme, questions de thème)
    { id: "histoire-s08-2-q42", fiche: "histoire-s08-2-f5", type: "qcm", niveau: 1,
      enonce: "Pour quelle terre le roi d'Angleterre est-il le vassal du roi de France, après 1259 ?",
      choix: ["La Guyenne, dans le Sud-Ouest", "La Normandie", "L'Île-de-France", "La Flandre"],
      reponse: "La Guyenne, dans le Sud-Ouest",
      explication: "Par le traité de Paris, Henri III garde la Guyenne, l'ancienne Aquitaine, comme fief tenu du roi de France. Il a dû renoncer à la Normandie.",
      source: T("Traité de Paris (1259)", U_TRAITE1259) },
    { id: "histoire-s08-2-q43", fiche: "histoire-s08-2-f5", type: "vrai_faux", niveau: 1,
      enonce: "En 1259, le roi d'Angleterre Henri III renonce à la Normandie.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : Henri III abandonne la Normandie, l'Anjou, la Touraine, le Maine et le Poitou, pris par Philippe Auguste. Il garde la Guyenne et rend hommage à Louis IX le 4 décembre 1259.",
      source: T("Traité de Paris (1259)", U_TRAITE1259) },
    { id: "histoire-s08-2-q44", fiche: "histoire-s08-2-f5", type: "qcm", niveau: 2,
      enonce: "Que fait le roi de France Philippe VI en 1337 ?",
      choix: ["Il saisit la Guyenne", "Il donne la Guyenne au roi d'Angleterre", "Il épouse la reine d'Angleterre", "Il abandonne Paris"],
      reponse: "Il saisit la Guyenne",
      explication: "Philippe VI prononce la saisie de la Guyenne. En octobre 1337, Édouard III rompt son lien de vassalité et réclame la couronne de France : la guerre de Cent Ans commence.",
      source: T("Guyenne", U_GUYENNE) },
    { id: "histoire-s08-2-q45", fiche: "histoire-s08-2-f5", type: "qcm", niveau: 2,
      enonce: "Pourquoi la Guyenne est-elle l'une des causes de la guerre de Cent Ans ?",
      choix: ["Le roi de France la confisque plusieurs fois à son vassal anglais", "Jeanne d'Arc y est née", "Le pape y réside", "Les Vikings l'ont conquise en 1337"],
      reponse: "Le roi de France la confisque plusieurs fois à son vassal anglais",
      explication: "Un roi n'aime pas rendre hommage à un autre roi, et le roi de France use de son droit de seigneur : saisies en 1294, en 1324, en 1337. La dernière déclenche la guerre.",
      source: T("Guerre de Cent Ans", U_CENTANS) },
    { id: "histoire-s08-2-q46", fiche: "histoire-s08-2-f5", type: "ordre", niveau: 2,
      enonce: "Remets dans l'ordre les épisodes de la querelle de la Guyenne.",
      elements: ["Affaire de la bastide de Saint-Sardos", "Hommage d'Henri III à Louis IX", "Saisie par Philippe VI et début de la guerre de Cent Ans", "Hommage d'Édouard Ier à Philippe le Bel"],
      reponse: [1, 3, 0, 2],
      explication: "1259 : Henri III ; 1286 : Édouard Ier ; 1323-1324 : Saint-Sardos et la confiscation par Charles IV ; 1337 : Philippe VI. Trois quarts de siècle de disputes.",
      source: T("Guerre de Saint-Sardos", U_SARDOS) },
    { id: "histoire-s08-2-q47", fiche: "histoire-s08-2-f5", type: "vrai_faux", niveau: 2,
      enonce: "La Guyenne reste anglaise jusqu'en 1558, comme Calais.",
      corrections: ["Faux : elle redevient française en 1453, après la bataille de Castillon ; seule Calais reste anglaise jusqu'en 1558.", "Faux : elle redevient française dès 1294.", "Faux : elle n'a jamais appartenu au roi d'Angleterre."],
      reponse: { vrai: false, correction: "Faux : elle redevient française en 1453, après la bataille de Castillon ; seule Calais reste anglaise jusqu'en 1558." },
      explication: "La Guyenne est réunie au domaine du roi de France après Castillon, en 1453, qui met fin à la guerre de Cent Ans. Calais, elle, reste anglaise un siècle de plus.",
      source: T("Guyenne", U_GUYENNE) },
    { id: "histoire-s08-2-q48", fiche: "histoire-s08-2-f5", type: "qcm", niveau: 3,
      enonce: "Qu'ont en commun les années 1294, 1324 et 1337 ?",
      choix: ["Le roi de France saisit la Guyenne à son vassal anglais", "Le roi d'Angleterre est couronné roi de France", "Une bataille a lieu à Bouvines", "Jeanne d'Arc délivre une ville"],
      reponse: "Le roi de France saisit la Guyenne à son vassal anglais",
      explication: "Philippe le Bel en 1294, Charles IV en 1324, Philippe VI en 1337 : trois rois de France confisquent le fief du roi d'Angleterre. La troisième fois, la guerre de Cent Ans éclate.", indice: "Trois rois de France, un même fief.",
      source: T("Guerre de Saint-Sardos", U_SARDOS) },
    { id: "histoire-s08-2-q49", fiche: "histoire-s08-2-f5", type: "association", niveau: 2,
      enonce: "Relie chaque roi d'Angleterre à l'hommage ou à la saisie qui le concerne.",
      gauche: ["Henri III", "Édouard Ier", "Édouard III", "Charles IV de France"],
      droite: ["Rend hommage à Philippe le Bel en 1286", "Rend hommage à Louis IX en 1259", "Confisque l'Aquitaine en 1324, après Saint-Sardos", "Réclame la couronne de France en 1337"],
      reponse: [[0, 1], [1, 0], [2, 3], [3, 2]],
      explication: "Henri III en 1259, Édouard Ier en 1286 : deux hommages. Charles IV confisque en 1324 ; Édouard III, lui, réclame la couronne en 1337.",
      source: T("Guerre de Saint-Sardos", U_SARDOS) }
  ],
  bonus: [
    {
      id: "histoire-s08-2-b1",
      fiche: "histoire-s08-2-f1",
      titre: "Les Grandes Chroniques de France, l'histoire des rois en français",
      texte: "Les Grandes Chroniques de France racontent l'histoire des rois de France, en ancien français et non en latin. Le moine Primat, de Saint-Denis, en écrit le début vers 1250. Plus de 115 manuscrits d'avant la Renaissance nous sont parvenus. Celui que Jean Fouquet a enluminé entre 1455 et 1460 est attribué au roi Charles VII.",
      source: { titre: "Grandes Chroniques de France", editeur: "Wikipédia, l'encyclopédie libre", url: U_CHRONIQUES }
    },
    {
      id: "histoire-s08-2-b2",
      fiche: "histoire-s08-2-f1",
      titre: "Jean Fouquet, le peintre de Tours",
      texte: "Jean Fouquet, né vers 1420 à Tours, est l'un des plus grands peintres de la première Renaissance. Vers 1445, il séjourne en Italie et peint le portrait du pape. Revenu à Tours, il peint Charles VII, enlumine les Heures d'Étienne Chevalier et, vers 1455-1460, les 51 miniatures des Grandes Chroniques de France. En 1475, Louis XI lui donne le titre de peintre du roi. Il meurt entre 1478 et 1481.",
      source: { titre: "Jean Fouquet", editeur: "Wikipédia, l'encyclopédie libre", url: U_FOUQUET }
    }
  ],
  nonCouvert: [
    "Les indications du professeur sur le document : le cadre de la page 2 est vide, elles sont données en vidéo.",
    "Le déroulement de la cérémonie de l'hommage (gestes, serment, objet remis) et les définitions de vassal et de fief : devoir n°1 et test de la séance 11 ; le jeu ne les interroge jamais et ne garde qu'une question de posture (q27).",
    "Ce que tient l'homme au livre ouvert et qui sont les témoins : l'image ne le dit pas, le fichier non plus.",
    "Le lieu exact de l'hommage de 1286 : la page consultée parle d'une mission diplomatique en France, sans nommer la ville.",
    "Ce que raconte le Livre de Philippe le Bel dans les Grandes Chroniques de France.",
    "Le mariage d'Aliénor d'Aquitaine (1152), origine de la présence anglaise dans le Sud-Ouest : aucune page vérifiée, seulement la possession des Plantagenêts de 1188 à 1453."
  ]
};
