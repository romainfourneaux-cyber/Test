// Source en clair du cours histoire-s08-2 « Cours 11 – Étude de document ».
// Compilé (réponses brouillées) par node atelier/outils/compiler-cours.js histoire-s08-2.
// Seule source : le support de la séance 11 (deux pages) : page 1, l'enluminure et deux questions (personnages et
// leur attitude, scène représentée) ; page 2, le corrigé qui identifie le document (hommage d'Édouard Ier à
// Philippe le Bel, Grandes Chroniques de France enluminées par Jean Fouquet, Tours, vers 1455-1460, BnF). La
// description de l'image s'en tient à ce que l'on y voit. Les indications du professeur, données en vidéo, ne
// sont pas dans le fichier : voir nonCouvert.
const F = "cours/histoire/Histoire 5e - Seance 11 - Support.pdf";
const S = p => ({ fichier: F, page: p });
// Questions de thème (règle du 25/10/2026) : fait vérifié dans une source fiable, notée sans fichier ni page.
const T = (titre, url) => ({ theme: "Cours 11 – Étude de document", titre, editeur: "Wikipédia", url });

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
      id: "histoire-s08-2-f2", notion: "La scène : l'hommage d'Édouard Ier à Philippe le Bel",
      titre: "Édouard Ier rend hommage à Philippe le Bel",
      texte: "La scène représentée est un hommage : Édouard Ier rend hommage à Philippe le Bel, qui règne de 1285 à 1314. Sur l'image, Philippe le Bel est assis sur un trône, tandis qu'Édouard Ier, lui aussi couronné, est à genoux devant lui. L'un, assis, reçoit l'hommage ; l'autre, à genoux, le rend.",
      pointsCles: ["La scène : un hommage", "Édouard Ier rend hommage à Philippe le Bel (roi de 1285 à 1314)", "Philippe le Bel est assis sur un trône ; Édouard Ier est à genoux devant lui", "Les deux personnages portent une couronne"],
      dates: [],
      lieux: [], personnages: ["Philippe le Bel", "Édouard Ier"],
      vocabulaire: [],
      schema: "histoire-s08-2-s1", prerequis: ["histoire-s08-1-f3", "histoire-s08-2-f1"], source: S(2)
    },
    {
      id: "histoire-s08-2-f3", notion: "Lire l'image : trône, couronnes, manteau à fleurs de lys, livre",
      titre: "Ce que montre l'enluminure",
      texte: "Philippe le Bel, assis sur un trône, porte une couronne, un sceptre et un manteau bleu à fleurs de lys d'or ; les murs sont du même bleu à fleurs de lys. Édouard Ier, couronné, est à genoux dans un grand manteau rouge brodé d'or. Entre eux, un homme tient un livre ouvert ; derrière, des hommes debout regardent.",
      pointsCles: ["Philippe le Bel : trône, couronne, sceptre, manteau bleu à fleurs de lys", "Les murs de la salle : bleus, à fleurs de lys", "Édouard Ier : couronne, grand manteau rouge brodé d'or, à genoux", "Un homme tient un livre ouvert entre les deux rois ; des témoins debout derrière"],
      astuce: "Bleu et fleurs de lys pour celui qui reçoit l'hommage, rouge pour celui qui le rend.",
      dates: [],
      lieux: [], personnages: ["Philippe le Bel", "Édouard Ier"],
      vocabulaire: [
        { mot: "trône", def: "le siège d'apparat d'un roi" },
        { mot: "sceptre", def: "le long bâton orné que tient un roi" },
        { mot: "fleur de lys", def: "le motif en forme de fleur stylisée qui décore le manteau de Philippe le Bel et les murs de la salle" }
      ],
      schema: "histoire-s08-2-s1", prerequis: ["histoire-s08-2-f2"], source: S(1)
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
    { id: "histoire-s08-2-q30", fiche: "histoire-s08-2-f1", type: "qcm", niveau: 2,
      enonce: "Que sont les Grandes Chroniques de France ?",
      choix: ["L'histoire des rois de France, écrite en français par les moines de Saint-Denis", "Un recueil des lois de Philippe le Bel, copié par ses légistes pour tout le royaume", "Le journal personnel de Jean Fouquet", "Une chanson sur les paysans de Verson"],
      reponse: "L'histoire des rois de France, écrite en français par les moines de Saint-Denis",
      explication: "Les Grandes Chroniques de France racontent l'histoire des rois de France depuis leurs origines, en français et non en latin. Elles sont écrites à l'abbaye de Saint-Denis, à partir du travail du moine Primat au XIIIe siècle, et souvent décorées d'enluminures.",
      source: T("Grandes Chroniques de France", "https://fr.wikipedia.org/wiki/Grandes_Chroniques_de_France") },
    { id: "histoire-s08-2-q31", fiche: "histoire-s08-2-f1", type: "ordre", niveau: 2,
      enonce: "Remets ces repères dans l'ordre du temps.",
      elements: ["Couronnement de Charlemagne, en 800", "Début du règne de Philippe le Bel, en 1285", "Fin du règne de Philippe le Bel, en 1314", "Jean Fouquet enlumine les Grandes Chroniques de France, vers 1455-1460"],
      reponse: [0, 1, 2, 3],
      explication: "800, puis 1285 et 1314, enfin 1455-1460. Jean Fouquet peint les deux scènes, celle de Charlemagne et celle de Philippe le Bel, longtemps après.", source: S(2) },
    // f2 : la scène
    { id: "histoire-s08-2-q10", fiche: "histoire-s08-2-f2", type: "qcm", niveau: 1,
      enonce: "Quelle scène l'enluminure de Jean Fouquet étudiée en séance représente-t-elle ?",
      choix: ["L'hommage d'Édouard Ier à Philippe le Bel", "Le couronnement de Charlemagne à Rome", "La bataille de Bouvines", "L'élection de Hugues Capet"],
      reponse: "L'hommage d'Édouard Ier à Philippe le Bel",
      explication: "La légende du support nomme la scène : l'hommage d'Édouard Ier à Philippe le Bel. Le couronnement de Charlemagne est une autre enluminure de Fouquet.", source: S(2) },
    { id: "histoire-s08-2-q11", fiche: "histoire-s08-2-f2", type: "vrai_faux", niveau: 1,
      enonce: "Sur l'enluminure, c'est Édouard Ier qui rend hommage à Philippe le Bel.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : Édouard Ier, à genoux, rend hommage. Philippe le Bel, assis sur son trône, le reçoit.", source: S(2) },
    { id: "histoire-s08-2-q12", fiche: "histoire-s08-2-f2", type: "qcm", niveau: 2,
      enonce: "Quelle est la position de Philippe le Bel sur l'image ?",
      choix: ["Assis sur un trône", "À genoux", "Debout près de la fenêtre", "À cheval"],
      reponse: "Assis sur un trône",
      explication: "Philippe le Bel est assis sur un trône doré. C'est Édouard Ier qui est à genoux.", source: S(1) },
    { id: "histoire-s08-2-q13", fiche: "histoire-s08-2-f2", type: "vrai_faux", niveau: 2,
      enonce: "Philippe le Bel est à genoux devant Édouard Ier.",
      corrections: ["Faux : c'est Édouard Ier qui est à genoux ; Philippe le Bel est assis sur un trône.", "Faux : les deux rois sont debout, face à face.", "Faux : les deux rois sont assis côte à côte sur le trône."],
      reponse: { vrai: false, correction: "Faux : c'est Édouard Ier qui est à genoux ; Philippe le Bel est assis sur un trône." },
      explication: "C'est l'inverse : Édouard Ier est à genoux et rend l'hommage. Philippe le Bel, assis, le reçoit.", source: S(1) },
    { id: "histoire-s08-2-q14", fiche: "histoire-s08-2-f2", type: "qcm", niveau: 3,
      enonce: "Pourquoi le roi d'Angleterre Édouard Ier rend-il hommage au roi de France ?",
      choix: ["Parce qu'il tient du roi de France des terres situées en France, l'Aquitaine", "Parce qu'il a perdu la guerre de Cent Ans contre lui et doit accepter sa défaite", "Parce que Philippe le Bel est aussi roi d'Angleterre", "Parce que l'empereur germanique le lui ordonne"],
      reponse: "Parce qu'il tient du roi de France des terres situées en France, l'Aquitaine",
      explication: "Édouard Ier est roi d'Angleterre, mais aussi duc d'Aquitaine, dans le sud-ouest du royaume de France. Pour ces terres, il dépend du roi de France : c'est pourquoi il lui rend hommage, à Paris, en 1286.",
      source: T("Édouard Ier (roi d'Angleterre)", "https://fr.wikipedia.org/wiki/%C3%89douard_Ier_(roi_d%27Angleterre)") },
    { id: "histoire-s08-2-q15", fiche: "histoire-s08-2-f2", type: "qcm", niveau: 3,
      enonce: "Philippe le Bel règne de 1285 à 1314. À quelle période l'hommage d'Édouard Ier a-t-il pu avoir lieu ?",
      choix: ["Entre 1285 et 1314", "En 1214, à Bouvines", "Vers 1455-1460", "En 987"],
      reponse: "Entre 1285 et 1314",
      explication: "L'hommage est rendu au roi Philippe le Bel : il a donc lieu pendant son règne. 1455-1460 est la date de la peinture, pas de la scène.", indice: "Un hommage se rend à un roi qui règne.", source: S(2) },
    { id: "histoire-s08-2-q16", fiche: "histoire-s08-2-f2", type: "qcm", niveau: 1,
      enonce: "Qui est Édouard Ier ?",
      choix: ["Le roi d'Angleterre, qui a aussi des terres en France", "Le fils de Philippe le Bel, futur roi de France", "L'empereur germanique, venu rendre visite au roi de France à Paris", "Le peintre de l'enluminure"],
      reponse: "Le roi d'Angleterre, qui a aussi des terres en France",
      explication: "Édouard Ier règne sur l'Angleterre de 1272 à 1307. Il est aussi duc d'Aquitaine, dans le sud-ouest de la France, ce qui l'oblige à rendre hommage au roi de France.",
      source: T("Édouard Ier (roi d'Angleterre)", "https://fr.wikipedia.org/wiki/%C3%89douard_Ier_(roi_d%27Angleterre)") },
    // f3 : lire l'image
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
      source: T("Fleur de lys", "https://fr.wikipedia.org/wiki/Fleur_de_lys") },
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
      droite: ["Tient un livre ouvert", "Debout, ils assistent à la scène", "Assis sur un trône, en manteau bleu", "À genoux, en manteau rouge"],
      reponse: [[0, 2], [1, 3], [2, 0], [3, 1]],
      explication: "Philippe le Bel est assis en bleu, Édouard Ier à genoux en rouge. Entre eux, l'homme au livre ; derrière, les témoins debout.", source: S(1) },
    { id: "histoire-s08-2-q27", fiche: "histoire-s08-2-f3", type: "qcm", niveau: 3,
      enonce: "D'après leurs positions sur l'image, lequel des deux rois est placé au-dessus de l'autre ?",
      choix: ["Philippe le Bel, assis sur le trône", "Édouard Ier, à genoux", "Aucun : ils sont tous les deux assis", "L'homme au livre"],
      reponse: "Philippe le Bel, assis sur le trône",
      explication: "Celui qui est assis sur le trône domine celui qui est à genoux. L'image place ainsi Philippe le Bel au-dessus d'Édouard Ier.", indice: "Qui est assis, qui est à genoux ?", source: S(1) },
    { id: "histoire-s08-2-q29", fiche: "histoire-s08-2-f3", type: "vrai_faux", niveau: 3,
      enonce: "Un seul des deux rois porte une couronne sur l'image.",
      corrections: ["Faux : tous les deux portent une couronne, mais seul Philippe le Bel tient un sceptre.", "Faux : aucun des deux ne porte de couronne.", "Faux : seul Édouard Ier porte une couronne."],
      reponse: { vrai: false, correction: "Faux : tous les deux portent une couronne, mais seul Philippe le Bel tient un sceptre." },
      explication: "Philippe le Bel et Édouard Ier portent chacun une couronne. Le sceptre et le trône, eux, n'appartiennent qu'à Philippe le Bel.", source: S(1) }
  ],
  bonus: [
    {
      id: "histoire-s08-2-b1",
      fiche: "histoire-s08-2-f1",
      titre: "Les Grandes Chroniques de France, l'histoire des rois en français",
      texte: "Les Grandes Chroniques de France racontent l'histoire des rois de France, en ancien français et non en latin. Le moine Primat, de Saint-Denis, en écrit le début vers 1250. Plus de 115 manuscrits d'avant la Renaissance nous sont parvenus. Celui que Jean Fouquet a enluminé entre 1455 et 1460 est attribué au roi Charles VII.",
      source: { titre: "Grandes Chroniques de France", editeur: "Wikipédia, l'encyclopédie libre", url: "https://fr.wikipedia.org/wiki/Grandes_Chroniques_de_France" }
    }
  ],
  nonCouvert: [
    "Les indications du professeur sur le document : le cadre de la page 2 est vide, elles sont données en vidéo.",
    "Ce qu'est un hommage, comment se déroule la cérémonie et ce que les deux personnages se promettent : le fichier ne donne que le titre de la scène.",
    "Qui est Édouard Ier, d'où il vient et pourquoi il rend hommage à Philippe le Bel.",
    "Ce que tient l'homme au livre ouvert, qui sont les témoins et ce que signifie leur présence.",
    "Les réponses rédigées aux deux questions du support (attitude des personnages, scène représentée), faites pendant la vidéo.",
    "Ce que raconte le Livre de Philippe le Bel dans les Grandes Chroniques de France.",
    "Les dates de règne de Philippe le Bel (1285-1314) viennent de la frise des séances 9 et 10 (histoire-s08-1)."
  ]
};
