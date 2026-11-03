// Source en clair du cours histoire-s08-1 « Cours 10 – Émergence d'un État royal fort ».
// Compilé (réponses brouillées) par node atelier/outils/compiler-cours.js histoire-s08-1.
// Sources : le support de la séance 10 (une page) : la même frise de 900 à 1500 que la séance 9 (Hugues Capet élu roi
// 987, Philippe Auguste 1180-1223, bataille de Bouvines 1214, Louis IX 1226-1270, Philippe le Bel 1285-1314, guerre
// de Cent Ans 1337-1453, Jeanne d'Arc 1428) et trois questions (principaux fiefs sur une carte, le roi sur une image
// de Bouvines, le pouvoir de Louis IX) dont la carte et les images sont absentes du fichier. La leçon est donnée en
// vidéo : depuis le 28/10/2026 (demande de Romain), les six fiches viennent du programme officiel de 5e (sous-thème
// « L'affirmation de l'État monarchique dans le Royaume des Capétiens et des Valois »), vérifiées sur les pages citées
// dans leur source ; les questions tirées de la frise gardent leur source de dépôt.
const F = "cours/histoire/Histoire 5e - Seance 10 - Support.pdf";
const S = p => ({ fichier: F, page: p });
// Questions de thème (règle du 25/10/2026) : fait vérifié dans une source fiable, notée sans fichier ni page.
const T = (titre, url) => ({ theme: "Cours 10 – Émergence d’un État royal fort", titre, editeur: "Wikipédia", url });
// Fiches de programme (règle du 28/10/2026) : sous-thème officiel, page où les faits ont été vérifiés.
const P = (titre, url) => ({ programme: "L'affirmation de l'État monarchique dans le Royaume des Capétiens et des Valois", titre, editeur: "Wikipédia", url });
const U_DOMAINE = "https://fr.wikipedia.org/wiki/Domaine_royal_fran%C3%A7ais";
const U_PHILIPPE2 = "https://fr.wikipedia.org/wiki/Philippe_II_Auguste";
const U_BOUVINES = "https://fr.wikipedia.org/wiki/Bataille_de_Bouvines";
const U_LOUIS = "https://fr.wikipedia.org/wiki/Louis_IX";
const U_GROS = "https://fr.wikipedia.org/wiki/Gros_tournois";
const U_VINCENNES = "https://fr.wikipedia.org/wiki/Ch%C3%A2teau_de_Vincennes";
const U_PHILIPPE4 = "https://fr.wikipedia.org/wiki/Philippe_IV_le_Bel";
const U_ETATS = "https://fr.wikipedia.org/wiki/%C3%89tats_g%C3%A9n%C3%A9raux_de_1302";
const U_CENTANS = "https://fr.wikipedia.org/wiki/Guerre_de_Cent_Ans";
const U_CRECY = "https://fr.wikipedia.org/wiki/Bataille_de_Cr%C3%A9cy";
const U_POITIERS = "https://fr.wikipedia.org/wiki/Bataille_de_Poitiers_(1356)";
const U_JEANNE = "https://fr.wikipedia.org/wiki/Jeanne_d%27Arc";
const U_ORLEANS = "https://fr.wikipedia.org/wiki/Si%C3%A8ge_d%27Orl%C3%A9ans_(1428-1429)";
const U_PATAY = "https://fr.wikipedia.org/wiki/Bataille_de_Patay";

// Frise redessinée (aucune image reprise) : années -> abscisses.
const A0 = 900, A1 = 1500, X0 = 30, X1 = 510;
const x = a => Math.round((X0 + (a - A0) * (X1 - X0) / (A1 - A0)) * 10) / 10;
function frise() {
  const encre = "#2e2419";
  let s = "<svg viewBox='0 0 540 214' xmlns='http://www.w3.org/2000/svg' font-family='Georgia,serif' font-size='11'>";
  s += "<line x1='" + x(987) + "' y1='24' x2='" + x(987) + "' y2='120' stroke='#6a4c9c' stroke-dasharray='3 2'/>";
  s += "<circle cx='" + x(987) + "' cy='120' r='4' fill='#6a4c9c'/>";
  s += "<text x='" + (x(987) + 4) + "' y='20' fill='#6a4c9c'>987 : Hugues Capet élu roi</text>";
  s += "<line x1='" + x(1214) + "' y1='48' x2='" + x(1214) + "' y2='120' stroke='#b23a3a' stroke-dasharray='3 2'/>";
  s += "<circle cx='" + x(1214) + "' cy='120' r='4' fill='#b23a3a'/>";
  s += "<text x='" + (x(1214) - 4) + "' y='44' text-anchor='end' fill='#b23a3a'>1214 : bataille de Bouvines</text>";
  s += "<line x1='" + x(1428) + "' y1='48' x2='" + x(1428) + "' y2='96' stroke='#2f5e8e' stroke-dasharray='3 2'/>";
  s += "<text x='" + x(1428) + "' y='44' text-anchor='middle' fill='#2f5e8e'>1428 : Jeanne d'Arc</text>";
  s += "<rect x='" + x(1337) + "' y='96' width='" + (x(1453) - x(1337)) + "' height='18' fill='#d46a5c'/>";
  s += "<text x='" + ((x(1337) + x(1453)) / 2) + "' y='82' text-anchor='middle' font-size='10' fill='" + encre + "'>Guerre de Cent Ans : 1337-1453</text>";
  s += "<line x1='" + X0 + "' y1='120' x2='" + (X1 + 8) + "' y2='120' stroke='" + encre + "' stroke-width='2'/>";
  s += "<path d='M" + (X1 + 8) + " 115l10 5-10 5z' fill='" + encre + "'/>";
  for (let a = 900; a <= 1500; a += 100) {
    s += "<line x1='" + x(a) + "' y1='116' x2='" + x(a) + "' y2='124' stroke='" + encre + "'/>";
    s += "<text x='" + x(a) + "' y='135' text-anchor='middle' font-size='9' fill='" + encre + "'>" + a + "</text>";
  }
  s += "<rect x='" + x(1180) + "' y='144' width='" + (x(1223) - x(1180)) + "' height='10' fill='#2f5e8e'/>";
  s += "<text x='" + x(1223) + "' y='170' text-anchor='end' fill='" + encre + "'>Philippe Auguste 1180-1223</text>";
  s += "<rect x='" + x(1226) + "' y='144' width='" + (x(1270) - x(1226)) + "' height='10' fill='#3f8a5a'/>";
  s += "<line x1='" + ((x(1226) + x(1270)) / 2) + "' y1='154' x2='" + ((x(1226) + x(1270)) / 2) + "' y2='180' stroke='" + encre + "'/>";
  s += "<text x='" + ((x(1226) + x(1270)) / 2) + "' y='192' text-anchor='middle' fill='" + encre + "'>Louis IX 1226-1270</text>";
  s += "<rect x='" + x(1285) + "' y='144' width='" + (x(1314) - x(1285)) + "' height='10' fill='#2f5e8e'/>";
  s += "<text x='" + x(1285) + "' y='170' fill='" + encre + "'>Philippe le Bel 1285-1314</text>";
  s += "<rect x='30' y='200' width='12' height='10' fill='#2f5e8e'/><text x='48' y='209' fill='" + encre + "'>règne d'un roi</text>";
  s += "<rect x='150' y='200' width='12' height='10' fill='#d46a5c'/><text x='168' y='209' fill='" + encre + "'>guerre</text>";
  s += "<circle cx='236' cy='205' r='4' fill='#b23a3a'/><text x='246' y='209' fill='" + encre + "'>événement daté</text>";
  return s + "</svg>";
}

module.exports = {
  id: "histoire-s08-1",
  fiches: [
    {
      id: "histoire-s08-1-f1", notion: "Le domaine royal : de Paris-Orléans à un tiers du royaume",
      titre: "Les terres du roi : de presque rien au tiers de la France",
      texte: "En 987, le roi ne tient que l'Île-de-France et l'Orléanais. Pendant deux siècles, ses successeurs grappillent quelques terres, par mariage, achat ou héritage. Puis Philippe Auguste frappe : en 1202, il confisque la Normandie à Jean sans Terre, puis prend l'Anjou, la Touraine, le Poitou. En 1214, ses terres couvrent un tiers de la France.",
      pointsCles: ["987 : les terres du roi, en Île-de-France et dans l'Orléanais, ne dépassent pas un département d'aujourd'hui", "Cinq façons d'agrandir le domaine : confiscation, mariage, achat, héritage, conquête", "1185 (traité de Boves) : Artois, Amiens, Vermandois ; 1202-1205 : Normandie, Anjou, Touraine, Poitou, confisqués à Jean sans Terre, roi d'Angleterre jugé félon", "Philippe Auguste quadruple le domaine ; après 1214, il couvre le tiers de la France", "Plus tard : le comté de Toulouse (1271), la Champagne par le mariage de Philippe le Bel (1284), Lyon (1312)"],
      astuce: "Le domaine grandit comme une tache d'huile autour de Paris : Normandie à l'ouest, Loire au sud, Champagne à l'est.",
      dates: [
        { annee: 1202, evenement: "Philippe Auguste confisque la Normandie à Jean sans Terre" },
        { annee: 1214, evenement: "Après Bouvines, le domaine royal couvre le tiers de la France" }
      ],
      lieux: ["Paris", "Orléans", "Normandie", "Anjou", "Touraine", "Poitou"], personnages: ["Philippe Auguste", "Jean sans Terre"],
      vocabulaire: [
        { mot: "confisquer", def: "prendre à quelqu'un ses biens par décision de justice" },
        { mot: "Plantagenêt", def: "la famille des rois d'Angleterre qui tiennent de grandes terres en France, comme Jean sans Terre" },
        { mot: "héritage", def: "les biens que l'on reçoit à la mort d'un parent" }
      ],
      schema: null, prerequis: ["histoire-s07-2-f5"], source: P("Domaine royal français", U_DOMAINE)
    },
    {
      id: "histoire-s08-1-f2", notion: "Philippe Auguste (1180-1223) et la bataille de Bouvines (1214)",
      titre: "Bouvines, dimanche 27 juillet 1214",
      texte: "Dimanche 27 juillet 1214, à Bouvines. Face au roi de France : l'empereur Otton IV, le comte de Flandre et le comte de Boulogne, alliés du roi d'Angleterre. Dans la mêlée, des fantassins allemands atteignent le roi ; ses chevaliers le dégagent. Le soir, l'empereur fuit, les deux comtes sont prisonniers. Paris fête son roi six jours durant.",
      pointsCles: ["Philippe II, né en 1165, roi de 1180 à 1223 ; le chroniqueur Rigord le surnomme « Auguste », celui qui agrandit", "1204 : Château-Gaillard tombe le 6 mars, Rouen le 24 juin ; la Normandie est au roi, puis Poitiers, Loches et Chinon", "27 juillet 1214, Bouvines : environ 7 000 hommes du roi contre 9 000 coalisés ; Ferrand de Flandre et Renaud de Boulogne prisonniers, Otton IV s'enfuit", "Conséquences : Otton perd sa couronne ; Jean sans Terre accepte la trêve de Chinon, puis doit accorder la Grande Charte à ses barons (1215) ; six jours de fêtes à Paris", "Paris, capitale : rues pavées, les Halles (1183), une muraille commencée en 1190, la forteresse du Louvre (1202)", "Gouverner : les baillis, officiers payés par le roi, rendent des comptes trois fois par an ; en 1204, le roi des Francs devient officiellement « roi de France »"],
      astuce: "Bouvines, un dimanche : le roi affronte un empereur, deux comtes et l'argent d'un roi, et il gagne.",
      dates: [
        { annee: 1180, evenement: "Début du règne de Philippe Auguste" },
        { annee: 1204, evenement: "Prise de Château-Gaillard et de Rouen : la Normandie est au roi" },
        { annee: 1214, evenement: "Bataille de Bouvines" },
        { annee: 1223, evenement: "Fin du règne de Philippe Auguste" }
      ],
      lieux: ["Bouvines", "Château-Gaillard", "Rouen", "Paris"], personnages: ["Philippe Auguste", "Otton IV", "Ferrand de Flandre", "Renaud de Boulogne", "Jean sans Terre", "Guillaume le Breton"],
      vocabulaire: [
        { mot: "coalition", def: "une alliance de plusieurs puissances contre un ennemi commun" },
        { mot: "bailli", def: "un officier nommé et payé par le roi, qui rend la justice et lève ses revenus dans un bailliage" },
        { mot: "mêlée", def: "le moment de la bataille où les deux armées se mélangent au corps à corps" },
        { mot: "chroniqueur", def: "celui qui écrit le récit des événements de son temps, comme Guillaume le Breton, présent à Bouvines" }
      ],
      schema: "histoire-s08-1-s1", prerequis: ["histoire-s08-1-f1", "histoire-s07-2-f2"], source: P("Bataille de Bouvines", U_BOUVINES)
    },
    {
      id: "histoire-s08-1-f3", notion: "Louis IX, le roi justicier (1226-1270)",
      titre: "Saint Louis : la justice du roi au-dessus de celle des seigneurs",
      texte: "Roi à douze ans, en 1226, Louis IX laisse d'abord gouverner sa mère, Blanche de Castille. D'après son compagnon Joinville, il rend ensuite lui-même la justice, assis sous un chêne, à Vincennes. En 1247, ses enquêteurs parcourent le royaume pour punir les officiers malhonnêtes. En 1266, il crée le gros tournois, une monnaie d'argent valable dans tout le royaume.",
      pointsCles: ["Né à Poissy le 25 avril 1214 ; roi le 8 novembre 1226, à douze ans ; sa mère Blanche de Castille assure la régence", "1247 : les enquêteurs royaux recueillent les plaintes contre baillis, sénéchaux et prévôts ; 1254 : grande ordonnance contre les abus des officiers, qui n'ont plus le droit de recevoir des cadeaux", "La justice du roi monte : sa cour de justice devient le Parlement ; 1245, la quarantaine-le-roi freine les guerres privées ; 1261, l'ordalie est abolie", "Monnaie : 1265, la monnaie du roi circule dans tout le royaume ; 24 juillet 1266, le gros tournois d'argent, très imité en Europe", "Paris : la Sainte-Chapelle consacrée le 26 avril 1248, le collège de Sorbonne (1253), l'hospice des Quinze-Vingts (1260)", "Deux croisades (départ d'Aigues-Mortes le 25 août 1248 ; Tunis en 1270) ; mort près de Tunis le 25 août 1270 ; canonisé le 11 août 1297 : « Saint Louis »"],
      astuce: "Trois outils du roi justicier : les enquêteurs (1247), le Parlement, la monnaie (1266).",
      dates: [
        { annee: 1226, evenement: "Louis IX devient roi, à douze ans" },
        { annee: 1247, evenement: "Les enquêteurs royaux parcourent le royaume" },
        { annee: 1266, evenement: "Création du gros tournois" },
        { annee: 1270, evenement: "Mort de Louis IX près de Tunis" }
      ],
      lieux: ["Poissy", "Vincennes", "Paris", "Aigues-Mortes", "Tunis"], personnages: ["Louis IX", "Blanche de Castille", "Jean de Joinville"],
      vocabulaire: [
        { mot: "enquêteur", def: "un envoyé du roi qui recueille les plaintes contre ses officiers" },
        { mot: "régence", def: "le gouvernement du royaume par un proche du roi, quand celui-ci est trop jeune" },
        { mot: "Parlement", def: "au Moyen Âge, la cour de justice du roi, à Paris" },
        { mot: "ordalie", def: "une ancienne épreuve, comme le duel, censée désigner le coupable ; Louis IX l'interdit en 1261" }
      ],
      schema: "histoire-s08-1-s1", prerequis: ["histoire-s08-1-f2"], source: P("Louis IX", U_LOUIS)
    },
    {
      id: "histoire-s08-1-f5", notion: "Philippe le Bel : légistes, monnaie, États généraux",
      titre: "Philippe le Bel, le roi de fer (1285-1314)",
      texte: "Philippe IV, dit le Bel, règne de 1285 à 1314. Des légistes, juristes comme Nogaret, le conseillent. Il lève des impôts, manipule la monnaie, défie le pape Boniface VIII. Le 10 avril 1302, à Notre-Dame, il réunit clergé, nobles et villes pour l'appuyer : les premiers États généraux. Le vendredi 13 octobre 1307, tous les Templiers sont arrêtés.",
      pointsCles: ["Règne du 5 octobre 1285 au 29 novembre 1314 ; son mariage avec Jeanne de Navarre (1284) lui apporte la Champagne et la Navarre", "Les légistes, conseillers formés au droit, comme Guillaume de Nogaret, servent le roi plutôt que les seigneurs", "Argent : des impôts nouveaux, y compris sur les biens du clergé ; des manipulations de monnaie qui lui valent le surnom de « faux-monnayeur » ; l'agnel d'or (1311)", "Conflit avec le pape Boniface VIII : 10 avril 1302, premiers États généraux à Notre-Dame de Paris (clergé, noblesse, villes) ; 7 septembre 1303, le pape est bousculé à Anagni par Nogaret", "Vendredi 13 octobre 1307 : arrestation de tous les Templiers, un ordre de chevaliers riche et puissant ; 1312 : Lyon rattachée au royaume (traité de Vienne)", "Flandre : défaite de Courtrai (1302), revanche à Mons-en-Pévèle (1304)"],
      astuce: "Trois dates en 13 : 1302 (États généraux), 1303 (Anagni), 1307 (Templiers, un vendredi 13).",
      dates: [
        { annee: 1285, evenement: "Début du règne de Philippe le Bel" },
        { annee: 1302, evenement: "10 avril : premiers États généraux, à Notre-Dame de Paris" },
        { annee: 1307, evenement: "Vendredi 13 octobre : arrestation des Templiers" },
        { annee: 1314, evenement: "Mort de Philippe le Bel" }
      ],
      lieux: ["Paris", "Anagni", "Lyon", "Courtrai"], personnages: ["Philippe le Bel", "Guillaume de Nogaret", "Boniface VIII", "Jeanne de Navarre"],
      vocabulaire: [
        { mot: "légiste", def: "un conseiller du roi formé au droit, qui défend le pouvoir royal" },
        { mot: "États généraux", def: "une assemblée du clergé, de la noblesse et des villes, réunie par le roi" },
        { mot: "Templiers", def: "un ordre de chevaliers, riche et puissant, que Philippe le Bel fait arrêter en 1307" },
        { mot: "manipuler la monnaie", def: "changer le poids ou la valeur des pièces pour enrichir le trésor du roi" }
      ],
      schema: "histoire-s08-1-s1", prerequis: ["histoire-s08-1-f3"], source: P("Philippe IV le Bel", U_PHILIPPE4)
    },
    {
      id: "histoire-s08-1-f4", notion: "La guerre de Cent Ans (1337-1453) : Crécy, Poitiers, Azincourt",
      titre: "Cent seize ans de guerre entre Valois et Plantagenêts",
      texte: "En 1328, Charles IV meurt sans fils ; la couronne va à son cousin Philippe VI de Valois. Édouard III, roi d'Angleterre, petit-fils de Philippe le Bel, la réclame : 1337, la guerre. Trois désastres face aux archers anglais : Crécy (1346), Poitiers (1356), Azincourt (1415). En 1420, le traité de Troyes promet la couronne au roi anglais.",
      pointsCles: ["Causes : la succession de 1328 (Valois contre Plantagenêt) et la Guyenne, fief du roi d'Angleterre en France, saisie par Philippe VI en 1337", "26 août 1346, Crécy : les archers gallois d'Édouard III déciment les charges désordonnées de Philippe VI ; environ 1 500 chevaliers français tués ; Calais tombe le 4 août 1347", "19 septembre 1356, Poitiers : le Prince Noir capture le roi Jean II le Bon et son fils ; rançon de trois millions d'écus (traité de Brétigny, 1360)", "Charles V et Du Guesclin reprennent presque tout (1364-1380) ; puis la guerre civile entre Armagnacs et Bourguignons affaiblit la France", "25 octobre 1415, Azincourt : dans la boue, Henri V écrase l'armée du connétable d'Albret ; 21 mai 1420, traité de Troyes : Henri V héritier de Charles VI", "Fin : Orléans (1429), Formigny (1450), Castillon (17 juillet 1453) ; les Anglais ne gardent que Calais, jusqu'en 1558"],
      astuce: "C-P-A dans l'ordre : Crécy 1346, Poitiers 1356, Azincourt 1415. Dix ans entre les deux premières, soixante avant la troisième.",
      dates: [
        { annee: 1337, evenement: "Début de la guerre de Cent Ans" },
        { annee: 1346, evenement: "Défaite de Crécy" },
        { annee: 1356, evenement: "Défaite de Poitiers : le roi Jean le Bon est capturé" },
        { annee: 1415, evenement: "Défaite d'Azincourt" },
        { annee: 1453, evenement: "Victoire de Castillon : fin de la guerre de Cent Ans" }
      ],
      lieux: ["Crécy", "Poitiers", "Azincourt", "Calais", "Castillon"], personnages: ["Philippe VI de Valois", "Édouard III", "Jean II le Bon", "Charles V", "Bertrand du Guesclin", "Henri V"],
      vocabulaire: [
        { mot: "Valois", def: "la famille de rois qui succède aux Capétiens directs en 1328" },
        { mot: "rançon", def: "la somme payée pour libérer un prisonnier" },
        { mot: "connétable", def: "le chef des armées du roi de France" },
        { mot: "trêve", def: "un arrêt provisoire des combats" }
      ],
      schema: "histoire-s08-1-s1", prerequis: ["histoire-s08-1-f5"], source: P("Guerre de Cent Ans", U_CENTANS)
    },
    {
      id: "histoire-s08-1-f6", notion: "Jeanne d'Arc : Orléans 1429, Reims, Rouen 1431",
      titre: "La Pucelle d'Orléans : dix jours qui renversent la guerre",
      texte: "Octobre 1428 : les Anglais assiègent Orléans. Jeanne, jeune fille de Domrémy, arrive à Chinon en février 1429 et convainc Charles VII. Entrée dans Orléans le 29 avril, elle combat ; le 8 mai, les Anglais lèvent le siège. Le 17 juillet, Charles VII est sacré à Reims. Capturée en 1430, elle est brûlée à Rouen le 30 mai 1431.",
      pointsCles: ["Née vers 1412 à Domrémy ; à Vaucouleurs, le capitaine Robert de Baudricourt finit par lui donner une escorte", "23 février 1429 : arrivée à Chinon ; Charles VII, que ses ennemis moquent comme « roi de Bourges », la reçoit deux jours plus tard", "Orléans, assiégée depuis octobre 1428 : Jeanne y entre le 29 avril avec un convoi de vivres ; forts Saint-Loup (4 mai), des Augustins (6 mai), des Tourelles (7 mai, elle est blessée à l'épaule) ; 8 mai : le siège est levé", "18 juin 1429, Patay : la cavalerie française écrase les archers anglais ; la route de Reims est ouverte ; 17 juillet : Charles VII y est sacré, Jeanne à ses côtés", "23 mai 1430 : capturée à Compiègne par les Bourguignons, vendue aux Anglais dix mille livres ; procès à Rouen (Pierre Cauchon) ; brûlée place du Vieux-Marché le 30 mai 1431, vers dix-neuf ans", "1456 : un second procès la déclare innocente ; 1920 : elle est canonisée"],
      astuce: "Cinq villes dans l'ordre : Domrémy, Chinon, Orléans, Reims, Rouen.",
      dates: [
        { annee: 1429, evenement: "8 mai : levée du siège d'Orléans ; 17 juillet : sacre de Charles VII à Reims" },
        { annee: 1431, evenement: "30 mai : Jeanne d'Arc est brûlée à Rouen" }
      ],
      lieux: ["Domrémy", "Vaucouleurs", "Chinon", "Orléans", "Patay", "Reims", "Compiègne", "Rouen"], personnages: ["Jeanne d'Arc", "Charles VII", "Robert de Baudricourt", "Jean d'Orléans, dit Dunois", "Pierre Cauchon"],
      vocabulaire: [
        { mot: "siège", def: "l'encerclement d'une ville pour la forcer à se rendre" },
        { mot: "lever le siège", def: "abandonner l'encerclement d'une ville" },
        { mot: "Bourguignons", def: "le parti du duc de Bourgogne, allié des Anglais pendant la guerre de Cent Ans" }
      ],
      schema: "histoire-s08-1-s1", prerequis: ["histoire-s08-1-f4"], source: P("Jeanne d'Arc", U_JEANNE)
    }
  ],
  schemas: [
    { id: "histoire-s08-1-s1", legende: "De Hugues Capet à Jeanne d'Arc, de 900 à 1500 (frise redessinée d'après le support, le même qu'à la séance 9).", svg: frise() }
  ],
  questions: [
    // f1 : le domaine royal (fiche de programme ; q1 à q6 viennent de l'exemple du support, « le domaine royal est autour de Paris »)
    { id: "histoire-s08-1-q1", fiche: "histoire-s08-1-f1", type: "qcm", niveau: 1,
      enonce: "Autour de quelle ville se trouve le domaine royal ?",
      choix: ["Paris", "Bouvines", "Rome", "Wismes"],
      reponse: "Paris",
      explication: "Le domaine royal est autour de Paris. Bouvines est le lieu d'une bataille, Wismes une seigneurie du nord.", source: S(1) },
    { id: "histoire-s08-1-q2", fiche: "histoire-s08-1-f1", type: "vrai_faux", niveau: 1,
      enonce: "Le domaine royal est situé autour de Paris.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : c'est l'exemple que donne la séance pour situer les principaux fiefs. Les terres du roi sont autour de Paris.", source: S(1) },
    { id: "histoire-s08-1-q3", fiche: "histoire-s08-1-f1", type: "qcm", niveau: 2,
      enonce: "Comment Philippe Auguste agrandit-il fortement le domaine royal ?",
      choix: ["Il prend la Normandie et d'autres terres au roi d'Angleterre, en 1204", "Il hérite de la Bourgogne à la mort de son oncle", "Il reçoit la Flandre en cadeau de l'empereur", "Il conquiert la Lombardie, au-delà des Alpes, comme Charlemagne avant lui"],
      reponse: "Il prend la Normandie et d'autres terres au roi d'Angleterre, en 1204",
      explication: "Le roi d'Angleterre tient de grandes terres en France, comme la Normandie. En 1204, Philippe Auguste s'en empare, puis prend Poitiers, Loches et Chinon : le domaine royal devient bien plus grand.",
      source: T("Philippe II Auguste", U_PHILIPPE2) },
    // q4 retirée le 28/10/2026 (relecture) : troisième question sur « le domaine royal est autour de Paris », doublon de q1 et q2. Identifiant non réutilisé.
    { id: "histoire-s08-1-q5", fiche: "histoire-s08-1-f1", type: "qcm", niveau: 2,
      enonce: "Pourquoi Philippe Auguste peut-il confisquer la Normandie à Jean sans Terre, en 1202 ?",
      choix: ["Jean, son vassal pour ce duché, a été condamné par sa cour", "Jean lui a vendu la Normandie contre une grosse somme d'or", "Le pape lui a donné la Normandie", "Les Normands ont élu Philippe Auguste comme duc"],
      reponse: "Jean, son vassal pour ce duché, a été condamné par sa cour",
      explication: "Pour ses terres françaises, le roi d'Angleterre est le vassal du roi de France. Condamné comme félon par la cour du roi, il perd ses fiefs : c'est la commise.",
      source: T("Domaine royal français", U_DOMAINE) },
    { id: "histoire-s08-1-q6", fiche: "histoire-s08-1-f1", type: "qcm_multiple", niveau: 2,
      enonce: "Quels mots désignent des territoires du royaume ? (plusieurs réponses)",
      choix: ["Le domaine royal", "Un duché", "Un comté", "Un fief", "Le cens", "Une corvée"],
      reponse: ["Le domaine royal", "Un duché", "Un comté", "Un fief"],
      explication: "Domaine royal, duchés, comtés et fiefs sont des territoires. Le cens et la corvée sont des taxes dues au seigneur.", source: S(1) },
    { id: "histoire-s08-1-q8", fiche: "histoire-s08-1-f1", type: "vrai_faux", niveau: 2,
      enonce: "Quand Hugues Capet devient roi, en 987, le domaine royal couvre déjà presque tout le royaume de France.",
      corrections: ["Faux : il est alors très petit, autour de Paris et d'Orléans ; les rois l'agrandissent ensuite peu à peu.", "Faux : il n'existe pas encore ; c'est Philippe Auguste qui le crée en 1204.", "Faux : il couvre déjà tout le royaume, mais seulement au sud de la Loire."],
      reponse: { vrai: false, correction: "Faux : il est alors très petit, autour de Paris et d'Orléans ; les rois l'agrandissent ensuite peu à peu." },
      explication: "Au début, les terres du roi se limitent à peu près à l'Île-de-France et à la région d'Orléans. Les Capétiens les agrandissent ensuite par des confiscations, des mariages et des achats, jusqu'à ce que le domaine se confonde avec le royaume.",
      source: T("Domaine royal français", U_DOMAINE) },
    { id: "histoire-s08-1-q38", fiche: "histoire-s08-1-f1", type: "qcm_multiple", niveau: 2,
      enonce: "Par quels moyens les Capétiens agrandissent-ils le domaine royal ? (plusieurs réponses)",
      choix: ["Par des mariages avec des héritières de grands fiefs", "Par des achats de terres", "En confisquant les fiefs de vassaux félons", "En vendant Paris à l'empereur", "En rendant la Normandie aux Anglais"],
      reponse: ["Par des mariages avec des héritières de grands fiefs", "Par des achats de terres", "En confisquant les fiefs de vassaux félons"],
      explication: "Mariage, achat, confiscation, héritage et conquête : cinq façons de grandir. Philippe le Bel gagne ainsi la Champagne par son mariage, et Philippe Auguste la Normandie par confiscation.",
      source: T("Domaine royal français", U_DOMAINE) },
    // f2 : Philippe Auguste et Bouvines (fiche de programme ; q9, q10, q15, q16, q37 viennent de la frise du support)
    { id: "histoire-s08-1-q9", fiche: "histoire-s08-1-f2", type: "qcm", niveau: 1,
      enonce: "En quelle année a lieu la bataille de Bouvines ?",
      choix: ["1214", "1180", "1223", "1428"],
      reponse: "1214",
      explication: "La bataille de Bouvines a lieu en 1214. 1180 et 1223 sont le début et la fin du règne de Philippe Auguste.", source: S(1) },
    { id: "histoire-s08-1-q10", fiche: "histoire-s08-1-f2", type: "vrai_faux", niveau: 1,
      enonce: "La bataille de Bouvines a lieu pendant le règne de Philippe Auguste.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : 1214 se situe entre 1180 et 1223. Philippe Auguste est le roi de Bouvines.", source: S(1) },
    { id: "histoire-s08-1-q11", fiche: "histoire-s08-1-f2", type: "qcm", niveau: 2,
      enonce: "Qui Philippe Auguste bat-il à Bouvines, en 1214 ?",
      choix: ["L'empereur germanique Otton IV et ses alliés, soutenus par le roi d'Angleterre", "L'armée de l'Empire byzantin, envoyée par Constantinople contre le roi de France", "Le calife de Cordoue et ses troupes d'Al Andalus", "Le duc de Normandie révolté contre le roi"],
      reponse: "L'empereur germanique Otton IV et ses alliés, soutenus par le roi d'Angleterre",
      explication: "À Bouvines, Philippe Auguste affronte l'empereur Otton IV, allié au comte de Flandre et au comte de Boulogne, et soutenu par le roi d'Angleterre Jean sans Terre. Le roi de France l'emporte : l'empereur s'enfuit et les deux comtes sont faits prisonniers.",
      source: T("Bataille de Bouvines", U_BOUVINES) },
    { id: "histoire-s08-1-q13", fiche: "histoire-s08-1-f2", type: "qcm", niveau: 3,
      enonce: "Pourquoi la victoire de Bouvines renforce-t-elle le roi de France ?",
      choix: ["Elle montre qu'il est plus fort que les grands seigneurs ligués contre lui", "Parce qu'elle lui donne la couronne d'Angleterre, que portait Jean sans Terre", "Parce qu'elle met fin à la guerre de Cent Ans", "Parce qu'elle lui apporte l'Empire germanique"],
      reponse: "Elle montre qu'il est plus fort que les grands seigneurs ligués contre lui",
      explication: "Après Bouvines, le prestige de Philippe Auguste est immense : le roi apparaît au-dessus des grands seigneurs, qui n'osent plus le défier. Sa victoire protège aussi les terres qu'il a prises au roi d'Angleterre.",
      source: T("Bataille de Bouvines", U_BOUVINES) },
    { id: "histoire-s08-1-q15", fiche: "histoire-s08-1-f2", type: "ordre", niveau: 2,
      enonce: "Remets ces repères dans l'ordre du temps.",
      elements: ["Début du règne de Philippe Auguste", "Bataille de Bouvines", "Fin du règne de Philippe Auguste", "Début du règne de Louis IX"],
      reponse: [0, 1, 2, 3],
      explication: "1180 : Philippe Auguste devient roi ; 1214 : Bouvines ; 1223 : fin de son règne ; 1226 : Louis IX commence à régner.", source: S(1) },
    { id: "histoire-s08-1-q16", fiche: "histoire-s08-1-f2", type: "trou", niveau: 1,
      enonce: "Complète avec les repères de la frise.",
      texte: "Philippe Auguste règne de 1180 à ___ ; la bataille de ___ a lieu en 1214.",
      banque: ["1223", "Bouvines", "1270", "Paris"],
      reponse: [["1223"], ["Bouvines"]],
      explication: "Le règne de Philippe Auguste s'achève en 1223. Bouvines est la bataille de 1214.", source: S(1) },
    { id: "histoire-s08-1-q37", fiche: "histoire-s08-1-f2", type: "qcm_multiple", niveau: 2,
      enonce: "Que sait-on de Philippe Auguste ? (plusieurs réponses)",
      choix: ["Il règne de 1180 à 1223", "La bataille de Bouvines a lieu pendant son règne", "Il est élu roi en 987", "Il règne pendant la guerre de Cent Ans", "Il règne après Louis IX"],
      reponse: ["Il règne de 1180 à 1223", "La bataille de Bouvines a lieu pendant son règne"],
      explication: "Philippe Auguste règne de 1180 à 1223, et la bataille de Bouvines, en 1214, a lieu pendant son règne. Hugues Capet est élu en 987, et la guerre de Cent Ans ne commence qu'en 1337.", source: S(1) },
    { id: "histoire-s08-1-q39", fiche: "histoire-s08-1-f2", type: "qcm", niveau: 2,
      enonce: "Comment Philippe Auguste se fait-il obéir dans ses terres, loin de Paris ?",
      choix: ["Par des baillis, payés par lui, qui lui rendent des comptes", "Par les grands seigneurs, qui gouvernent à sa place", "Par des missi dominici envoyés par deux, comme Charlemagne", "Par les paysans, élus dans chaque village"],
      reponse: "Par des baillis, payés par lui, qui lui rendent des comptes",
      explication: "En 1190, avant de partir en croisade, le roi règle le gouvernement du royaume en son absence. Ses baillis, officiers nommés et payés par lui, rendent la justice, lèvent ses revenus et viennent rendre des comptes à Paris trois fois par an.",
      source: T("Philippe II Auguste", U_PHILIPPE2) },
    { id: "histoire-s08-1-q40", fiche: "histoire-s08-1-f2", type: "vrai_faux", niveau: 2,
      enonce: "En 1204, Philippe Auguste prend la Normandie au roi d'Angleterre Jean sans Terre.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : Château-Gaillard tombe le 6 mars 1204 et Rouen se rend le 24 juin, après quarante jours de siège. La Normandie, anglaise depuis 1066, revient au roi de France.",
      source: T("Philippe II Auguste", U_PHILIPPE2) },
    // f3 : Louis IX (fiche de programme ; q19, q23, q24 viennent de la frise du support)
    { id: "histoire-s08-1-q19", fiche: "histoire-s08-1-f3", type: "vrai_faux", niveau: 1,
      enonce: "Louis IX règne de 1226 à 1270.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : Louis IX règne de 1226 à 1270. La séance demande ce qui montre son pouvoir.", source: S(1) },
    { id: "histoire-s08-1-q23", fiche: "histoire-s08-1-f3", type: "qcm", niveau: 2,
      enonce: "Qui gouverne le royaume pendant l'enfance de Louis IX, roi à douze ans ?",
      choix: ["Sa mère, Blanche de Castille", "Son fidèle compagnon Jean de Joinville", "Le pape", "Philippe le Bel"],
      reponse: "Sa mère, Blanche de Castille",
      explication: "Louis IX devient roi en 1226, à douze ans. Sa mère Blanche de Castille assure la régence jusqu'à sa majorité.",
      source: T("Louis IX", U_LOUIS) },
    { id: "histoire-s08-1-q24", fiche: "histoire-s08-1-f3", type: "association", niveau: 3,
      enonce: "Relie chaque repère au siècle (ou aux siècles) où il se place.",
      gauche: ["Hugues Capet élu roi (987)", "Philippe Auguste (1180-1223)", "Louis IX (1226-1270)", "Philippe le Bel (1285-1314)"],
      droite: ["XIIIe siècle seulement", "XIIe et XIIIe siècles", "Xe siècle", "XIIIe et XIVe siècles"],
      reponse: [[0, 2], [1, 1], [2, 0], [3, 3]],
      explication: "987 est au Xe siècle, et 1180-1223 va du XIIe au XIIIe. 1226-1270 reste au XIIIe, tandis que 1285-1314 va du XIIIe au XIVe.", source: S(1) },
    { id: "histoire-s08-1-q27", fiche: "histoire-s08-1-f3", type: "qcm", niveau: 2,
      enonce: "Pourquoi Louis IX est-il resté célèbre ?",
      choix: ["Pour sa justice : il étend la justice du roi à tout le royaume", "Pour sa victoire à Bouvines contre l'empereur et le roi d'Angleterre", "Pour avoir fondé la dynastie des Capétiens", "Pour avoir mis fin à la guerre de Cent Ans"],
      reponse: "Pour sa justice : il étend la justice du roi à tout le royaume",
      explication: "Louis IX, roi de 1226 à 1270, est resté dans les mémoires comme le roi qui rend la justice sous un chêne, à Vincennes. Il envoie aussi des enquêteurs dans le royaume et fait du roi le juge suprême, au-dessus des seigneurs.",
      source: T("Louis IX", U_LOUIS) },
    { id: "histoire-s08-1-q41", fiche: "histoire-s08-1-f3", type: "qcm", niveau: 2,
      enonce: "Qu'envoie Louis IX dans tout le royaume en 1247 ?",
      choix: ["Des enquêteurs qui écoutent les plaintes", "Des percepteurs qui lèvent un nouvel impôt", "Des chevaliers chargés de reprendre la Normandie", "Des baillis chargés de vendre les forêts du roi"],
      reponse: "Des enquêteurs qui écoutent les plaintes",
      explication: "Les enquêteurs royaux recueillent les plaintes contre les baillis, sénéchaux et prévôts, et réparent les abus. En 1254, une grande ordonnance interdit à ces officiers de recevoir des cadeaux.",
      source: T("Louis IX", U_LOUIS) },
    { id: "histoire-s08-1-q42", fiche: "histoire-s08-1-f3", type: "vrai_faux", niveau: 2,
      enonce: "Le gros tournois, créé par Louis IX en 1266, est une pièce d'or.",
      corrections: ["Faux : c'est une pièce d'argent, qui vaut douze deniers, soit un sou.", "Faux : c'est une pièce de cuivre sans valeur.", "Faux : le gros tournois n'est pas une monnaie mais un impôt."],
      reponse: { vrai: false, correction: "Faux : c'est une pièce d'argent, qui vaut douze deniers, soit un sou." },
      explication: "Le gros tournois est frappé en argent, environ quatre grammes, et vaut un sou. Louis IX crée aussi un écu d'or, qui, lui, est un échec.",
      source: T("Gros tournois", U_GROS) },
    { id: "histoire-s08-1-q43", fiche: "histoire-s08-1-f3", type: "qcm", niveau: 3,
      enonce: "Pourquoi une monnaie du roi valable dans tout le royaume renforce-t-elle son pouvoir ?",
      choix: ["Elle vaut partout, celle des seigneurs seulement chez eux", "Elle est frappée en or massif", "Elle porte le nom de Jeanne d'Arc", "Les seigneurs n'ont plus le droit de garder de l'argent"],
      reponse: "Elle vaut partout, celle des seigneurs seulement chez eux",
      explication: "En 1265, le roi fait confirmer que sa monnaie a cours dans tout le royaume. Le gros tournois est si bien reçu que seigneurs et abbayes l'imitent : la monnaie du roi devient la référence.", indice: "Qui peut utiliser la monnaie du roi, et où ?",
      source: T("Gros tournois", U_GROS) },
    { id: "histoire-s08-1-q44", fiche: "histoire-s08-1-f3", type: "trou", niveau: 1,
      enonce: "Complète avec les repères de Louis IX.",
      texte: "Louis IX règne de 1226 à ___ ; d'après Joinville, il rend la justice assis sous un ___, à Vincennes.",
      banque: ["1270", "chêne", "1314", "donjon"],
      reponse: [["1270"], ["chêne"]],
      explication: "Louis IX règne jusqu'à sa mort, près de Tunis, en 1270. Son contemporain Jean de Joinville raconte qu'il rendait la justice assis sous un chêne, à Vincennes.",
      source: T("Château de Vincennes", U_VINCENNES) },
    // f5 : Philippe le Bel (fiche de programme ; q18, q20, q21, q25 viennent de la frise du support)
    { id: "histoire-s08-1-q18", fiche: "histoire-s08-1-f5", type: "qcm", niveau: 1,
      enonce: "Quel roi règne de 1285 à 1314 ?",
      choix: ["Philippe le Bel", "Louis IX", "Philippe Auguste", "Hugues Capet"],
      reponse: "Philippe le Bel",
      explication: "Philippe le Bel règne de 1285 à 1314. C'est le dernier roi de la frise.", source: S(1) },
    { id: "histoire-s08-1-q20", fiche: "histoire-s08-1-f5", type: "qcm", niveau: 2,
      enonce: "Qui sont les légistes de Philippe le Bel ?",
      choix: ["Des conseillers formés au droit, comme Nogaret", "Des chevaliers chargés de garder le palais du Louvre", "Des moines qui écrivent l'histoire des rois", "Des marchands qui prêtent de l'argent au roi"],
      reponse: "Des conseillers formés au droit, comme Nogaret",
      explication: "Les légistes sont des juristes au service du roi. Avec eux, Philippe le Bel renforce son pouvoir face aux seigneurs et au pape.",
      source: T("Philippe IV le Bel", U_PHILIPPE4) },
    { id: "histoire-s08-1-q21", fiche: "histoire-s08-1-f5", type: "vrai_faux", niveau: 2,
      enonce: "Philippe le Bel règne entièrement au XIVe siècle.",
      corrections: ["Faux : son règne commence en 1285, au XIIIe siècle, et s'achève en 1314, au XIVe.", "Faux : il règne entièrement au XIIIe siècle.", "Faux : il règne au XIIe siècle."],
      reponse: { vrai: false, correction: "Faux : son règne commence en 1285, au XIIIe siècle, et s'achève en 1314, au XIVe." },
      explication: "1285 appartient au XIIIe siècle et 1314 au XIVe. Le règne de Philippe le Bel est à cheval sur les deux.", source: S(1) },
    { id: "histoire-s08-1-q25", fiche: "histoire-s08-1-f5", type: "trou", niveau: 1,
      enonce: "Complète avec les dates de la frise.",
      texte: "Louis IX règne de 1226 à ___ ; Philippe le Bel règne de ___ à 1314.",
      banque: ["1270", "1285", "1223", "1337"],
      reponse: [["1270"], ["1285"]],
      explication: "Louis IX règne jusqu'en 1270. Philippe le Bel commence à régner en 1285.", source: S(1) },
    { id: "histoire-s08-1-q26", fiche: "histoire-s08-1-f5", type: "vrai_faux", niveau: 2,
      enonce: "Philippe le Bel est un roi faible, qui laisse les grands seigneurs gouverner le royaume à sa place.",
      corrections: ["Faux : il renforce le pouvoir du roi, aidé de conseillers juristes, les légistes.", "Faux : il laisse l'empereur germanique gouverner le royaume à sa place.", "Faux : il abandonne le royaume pour aller vivre en Angleterre."],
      reponse: { vrai: false, correction: "Faux : il renforce le pouvoir du roi, aidé de conseillers juristes, les légistes." },
      explication: "Philippe le Bel, roi de 1285 à 1314, s'entoure de légistes, des conseillers qui connaissent bien le droit. Avec eux, il renforce beaucoup le pouvoir du roi face aux grands seigneurs.",
      source: T("Philippe IV le Bel", U_PHILIPPE4) },
    { id: "histoire-s08-1-q45", fiche: "histoire-s08-1-f5", type: "qcm", niveau: 2,
      enonce: "Que se passe-t-il à Notre-Dame de Paris le 10 avril 1302 ?",
      choix: ["Les premiers États généraux du royaume", "Le sacre de Philippe le Bel", "L'arrestation des Templiers", "La signature de la paix avec l'Angleterre"],
      reponse: "Les premiers États généraux du royaume",
      explication: "Philippe le Bel y réunit le clergé, la noblesse et des représentants des villes : c'est la première réunion des États généraux. Les trois ordres lui apportent leur soutien contre le pape.",
      source: T("États généraux de 1302", U_ETATS) },
    { id: "histoire-s08-1-q46", fiche: "histoire-s08-1-f5", type: "qcm", niveau: 3,
      enonce: "Pourquoi Philippe le Bel réunit-il clergé, nobles et villes en 1302 ?",
      choix: ["Pour qu'ils l'appuient dans son bras de fer avec le pape Boniface VIII", "Pour leur annoncer la fin de la guerre de Cent Ans", "Pour élire un nouveau roi", "Pour partager le domaine royal entre eux"],
      reponse: "Pour qu'ils l'appuient dans son bras de fer avec le pape Boniface VIII",
      explication: "Le pape affirme que son pouvoir dépasse celui des rois ; Philippe le Bel veut montrer que tout son royaume est derrière lui. Les trois ordres approuvent le roi et écrivent au pape et aux cardinaux.", indice: "Contre qui le roi cherche-t-il des appuis ?",
      source: T("États généraux de 1302", U_ETATS) },
    { id: "histoire-s08-1-q47", fiche: "histoire-s08-1-f5", type: "vrai_faux", niveau: 1,
      enonce: "Le vendredi 13 octobre 1307, Philippe le Bel fait arrêter les Templiers dans tout le royaume.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : le même jour, tous les Templiers de France sont arrêtés sur ordre du roi. L'ordre, riche et puissant, est ensuite supprimé, et son dernier maître, Jacques de Molay, meurt sur le bûcher en 1314.",
      source: T("Philippe IV le Bel", U_PHILIPPE4) },
    // f4 : la guerre de Cent Ans (fiche de programme ; q28, q30, q31, q35 viennent de la frise du support)
    { id: "histoire-s08-1-q28", fiche: "histoire-s08-1-f4", type: "qcm", niveau: 1,
      enonce: "En quelle année la guerre de Cent Ans commence-t-elle ?",
      choix: ["1337", "1453", "1428", "1214"],
      reponse: "1337",
      explication: "La guerre de Cent Ans commence en 1337 et finit en 1453. Jeanne d'Arc apparaît en 1428, pendant cette guerre.", source: S(1) },
    { id: "histoire-s08-1-q30", fiche: "histoire-s08-1-f4", type: "qcm", niveau: 2,
      enonce: "En quelle année la guerre de Cent Ans se termine-t-elle ?",
      choix: ["1453", "1337", "1428", "1314"],
      reponse: "1453",
      explication: "La guerre de Cent Ans s'achève en 1453. Elle avait commencé en 1337.", source: S(1) },
    { id: "histoire-s08-1-q31", fiche: "histoire-s08-1-f4", type: "vrai_faux", niveau: 2,
      enonce: "La guerre de Cent Ans dure exactement cent ans.",
      corrections: ["Faux : de 1337 à 1453, elle dure 116 ans.", "Faux : elle ne dure que dix ans.", "Faux : elle dure deux cents ans."],
      reponse: { vrai: false, correction: "Faux : de 1337 à 1453, elle dure 116 ans." },
      explication: "1453 moins 1337 font 116. La guerre de Cent Ans dure donc un peu plus d'un siècle.", source: S(1) },
    { id: "histoire-s08-1-q32", fiche: "histoire-s08-1-f4", type: "qcm", niveau: 3,
      enonce: "Pourquoi la guerre de Cent Ans commence-t-elle, en 1337 ?",
      choix: ["Le roi d'Angleterre réclame la couronne de France", "Le roi de France veut conquérir l'Angleterre", "Les deux rois se disputent Jérusalem et la Terre sainte", "L'empereur germanique attaque la France"],
      reponse: "Le roi d'Angleterre réclame la couronne de France",
      explication: "En 1328, le dernier fils de Philippe le Bel meurt sans héritier, et la couronne passe à son cousin Philippe VI de Valois. Le roi d'Angleterre Édouard III, petit-fils de Philippe le Bel par sa mère, estime qu'elle lui revient : la guerre éclate en 1337.",
      source: T("Guerre de Cent Ans", U_CENTANS) },
    { id: "histoire-s08-1-q35", fiche: "histoire-s08-1-f4", type: "trou", niveau: 1,
      enonce: "Complète avec les dates de la frise.",
      texte: "La guerre de Cent Ans dure de ___ à 1453 ; Jeanne d'Arc apparaît en ___.",
      banque: ["1337", "1428", "1314", "1453"],
      reponse: [["1337"], ["1428"]],
      explication: "La guerre commence en 1337. Jeanne d'Arc est placée en 1428, avant la fin de la guerre en 1453.", source: S(1) },
    { id: "histoire-s08-1-q48", fiche: "histoire-s08-1-f4", type: "ordre", niveau: 2,
      enonce: "Remets ces trois défaites françaises dans l'ordre du temps.",
      elements: ["Azincourt", "Crécy", "Poitiers", "Traité de Troyes"],
      reponse: [1, 2, 0, 3],
      explication: "Crécy en 1346, Poitiers en 1356, Azincourt en 1415, puis le traité de Troyes en 1420. Trois défaites de la chevalerie française face aux archers anglais.",
      source: T("Guerre de Cent Ans", U_CENTANS) },
    { id: "histoire-s08-1-q49", fiche: "histoire-s08-1-f4", type: "qcm", niveau: 2,
      enonce: "Que se passe-t-il à Poitiers, le 19 septembre 1356 ?",
      choix: ["Le roi Jean le Bon est fait prisonnier", "Jeanne d'Arc fait lever le siège de la ville", "Philippe Auguste bat l'empereur", "Les Anglais perdent Calais"],
      reponse: "Le roi Jean le Bon est fait prisonnier",
      explication: "Le Prince Noir, fils du roi d'Angleterre, capture Jean II le Bon et son fils Philippe. Le roi n'est libéré qu'en 1360, contre une rançon de trois millions d'écus d'or.",
      source: T("Bataille de Poitiers (1356)", U_POITIERS) },
    { id: "histoire-s08-1-q50", fiche: "histoire-s08-1-f4", type: "vrai_faux", niveau: 3,
      enonce: "À Crécy, en 1346, l'armée française l'emporte grâce à ses arbalétriers génois.",
      corrections: ["Faux : les Français sont écrasés ; les arbalétriers génois, gênés par la pluie, tirent mal, et les archers anglais fauchent les charges.", "Faux : la bataille de Crécy se termine sans vainqueur.", "Faux : à Crécy, ce sont les Anglais qui ont des arbalétriers génois."],
      reponse: { vrai: false, correction: "Faux : les Français sont écrasés ; les arbalétriers génois, gênés par la pluie, tirent mal, et les archers anglais fauchent les charges." },
      explication: "Le 26 août 1346, les archers gallois d'Édouard III déciment les charges désordonnées de la chevalerie française ; environ 1 500 chevaliers meurent. Philippe VI, blessé, quitte le champ de bataille.",
      source: T("Bataille de Crécy", U_CRECY) },
    // f6 : Jeanne d'Arc (fiche de programme ; q29 vient de la frise du support)
    { id: "histoire-s08-1-q29", fiche: "histoire-s08-1-f6", type: "vrai_faux", niveau: 1,
      enonce: "Jeanne d'Arc intervient en 1428, pendant la guerre de Cent Ans.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : 1428 se situe entre 1337 et 1453. Jeanne d'Arc apparaît pendant la guerre de Cent Ans.", source: S(1) },
    { id: "histoire-s08-1-q33", fiche: "histoire-s08-1-f6", type: "qcm", niveau: 1,
      enonce: "Que fait Jeanne d'Arc pendant la guerre de Cent Ans ?",
      choix: ["Elle mène l'armée du roi de France et délivre Orléans", "Elle négocie la paix entre le roi de France et le roi d'Angleterre", "Elle gagne la bataille de Bouvines", "Elle devient reine de France"],
      reponse: "Elle mène l'armée du roi de France et délivre Orléans",
      explication: "Jeanne d'Arc conduit les troupes de Charles VII et fait lever le siège d'Orléans, tenu par les Anglais. Capturée par les Bourguignons, alliés des Anglais, elle leur est ensuite vendue.",
      source: T("Jeanne d'Arc", U_JEANNE) },
    { id: "histoire-s08-1-q36", fiche: "histoire-s08-1-f6", type: "vrai_faux", niveau: 2,
      enonce: "Pendant la guerre de Cent Ans, Jeanne d'Arc combat du côté du roi d'Angleterre.",
      corrections: ["Faux : elle combat pour le roi de France, Charles VII, contre les Anglais et leurs alliés bourguignons.", "Faux : elle ne combat pas : elle négocie la paix entre les deux rois.", "Faux : elle combat pour le duc de Bourgogne, contre les deux rois à la fois."],
      reponse: { vrai: false, correction: "Faux : elle combat pour le roi de France, Charles VII, contre les Anglais et leurs alliés bourguignons." },
      explication: "Jeanne d'Arc se bat pour Charles VII, le roi de France, contre les Anglais et leurs alliés, les Bourguignons. Ce sont d'ailleurs les Bourguignons qui la capturent et la vendent aux Anglais.",
      source: T("Jeanne d'Arc", U_JEANNE) },
    { id: "histoire-s08-1-q51", fiche: "histoire-s08-1-f6", type: "trou", niveau: 1,
      enonce: "Complète le parcours de Jeanne d'Arc.",
      texte: "Jeanne d'Arc fait lever le siège d'___ le 8 mai 1429 ; elle est brûlée à ___ le 30 mai 1431.",
      banque: ["Orléans", "Rouen", "Paris", "Reims"],
      reponse: [["Orléans"], ["Rouen"]],
      explication: "Orléans est délivrée le 8 mai 1429, dix jours après l'arrivée de Jeanne. Deux ans plus tard, elle meurt sur le bûcher à Rouen.",
      source: T("Jeanne d'Arc", U_JEANNE) },
    { id: "histoire-s08-1-q52", fiche: "histoire-s08-1-f6", type: "qcm", niveau: 2,
      enonce: "Où Jeanne d'Arc conduit-elle Charles VII après la délivrance d'Orléans ?",
      choix: ["À Reims, où il est sacré le 17 juillet 1429", "À Londres, pour signer la paix", "À Rouen, pour juger les Anglais", "À Bouvines, pour une nouvelle bataille"],
      reponse: "À Reims, où il est sacré le 17 juillet 1429",
      explication: "Après Orléans et la victoire de Patay, le 18 juin, la route de Reims est ouverte. Charles VII y est sacré le 17 juillet 1429, Jeanne à ses côtés.",
      source: T("Bataille de Patay", U_PATAY) },
    { id: "histoire-s08-1-q53", fiche: "histoire-s08-1-f6", type: "ordre", niveau: 2,
      enonce: "Remets les étapes de Jeanne d'Arc dans l'ordre.",
      elements: ["Capture à Compiègne", "Rencontre avec Charles VII à Chinon", "Levée du siège d'Orléans", "Bûcher de Rouen"],
      reponse: [1, 2, 0, 3],
      explication: "Chinon en février 1429, Orléans le 8 mai 1429, Compiègne le 23 mai 1430, Rouen le 30 mai 1431. Deux ans et trois mois entre la première étape et la dernière.",
      source: T("Jeanne d'Arc", U_JEANNE) },
    { id: "histoire-s08-1-q54", fiche: "histoire-s08-1-f6", type: "qcm", niveau: 3,
      enonce: "Pourquoi Orléans compte-t-elle autant, en 1428-1429 ?",
      choix: ["La ville verrouille la Loire et protège le sud du royaume", "C'est la capitale du roi d'Angleterre", "C'est la ville natale de Jeanne d'Arc", "Le pape y réside"],
      reponse: "La ville verrouille la Loire et protège le sud du royaume",
      explication: "Si Orléans tombe, les Anglais passent la Loire et menacent les terres du sud, restées fidèles à Charles VII. Sa délivrance renverse le cours de la guerre.", indice: "Regarde où coule la Loire par rapport aux terres de Charles VII.",
      source: T("Siège d'Orléans (1428-1429)", U_ORLEANS) },
    { id: "histoire-s08-1-q55", fiche: "histoire-s08-1-f6", type: "qcm", niveau: 2,
      enonce: "Comment finit Jeanne d'Arc ?",
      choix: ["Capturée à Compiègne, vendue aux Anglais, brûlée à Rouen en 1431", "Tuée à la bataille de Patay en 1429", "Reine de France après la mort de Charles VII", "Retirée dans son village de Domrémy jusqu'à sa mort"],
      reponse: "Capturée à Compiègne, vendue aux Anglais, brûlée à Rouen en 1431",
      explication: "Le 23 mai 1430, des capitaines bourguignons la capturent devant Compiègne et la vendent aux Anglais dix mille livres. Jugée à Rouen, elle est brûlée le 30 mai 1431, vers dix-neuf ans ; un second procès l'innocente en 1456.",
      source: T("Jeanne d'Arc", U_JEANNE) }
  ],
  bonus: [
    {
      id: "histoire-s08-1-b1",
      fiche: "histoire-s08-1-f2",
      titre: "Bouvines, un dimanche de juillet 1214",
      texte: "La bataille de Bouvines se déroule le dimanche 27 juillet 1214, près du village de Bouvines, dans le comté de Flandre, aujourd'hui dans le département du Nord. Philippe Auguste y affronte une coalition menée par l'empereur Otton IV, avec le comte de Flandre et le comte de Boulogne. Le roi de France l'emporte : son retour à Paris est triomphal, avec six jours de fêtes.",
      source: { titre: "Bataille de Bouvines", editeur: "Wikipédia, l'encyclopédie libre", url: U_BOUVINES }
    },
    {
      id: "histoire-s08-1-b2",
      fiche: "histoire-s08-1-f3",
      titre: "La Sainte-Chapelle, un écrin bâti en sept ans",
      texte: "En 1239, Louis IX achète pour 135 000 livres une relique célèbre, la couronne d'épines, que l'empereur latin de Constantinople avait mise en gage. Pour l'abriter, il fait élever dans son palais de l'île de la Cité la Sainte-Chapelle, commencée entre 1241 et 1244 et consacrée le 26 avril 1248 : moins de sept ans pour un chef-d'œuvre du gothique rayonnant, célèbre pour ses vitraux.",
      source: { titre: "Sainte-Chapelle", editeur: "Wikipédia, l'encyclopédie libre", url: "https://fr.wikipedia.org/wiki/Sainte-Chapelle" }
    }
  ],
  nonCouvert: [
    "La carte des principaux fiefs et la représentation de la bataille de Bouvines étudiées en séance : absentes du fichier ; les fiches f1 et f2 donnent ce que le programme attend à leur place.",
    "La définition du domaine royal et du fief : question du devoir n°1, jamais posée ; le jeu demande où se trouve le domaine et avec quel roi il grandit.",
    "Le sacre des rois (Reims, les gestes de la cérémonie) : test de la séance 11 ; le sacre de Charles VII n'est cité que comme événement du 17 juillet 1429.",
    "Les chevaliers (équipement, mode de vie), même à propos de Crécy ou d'Azincourt : devoir n°1 ; le jeu parle d'archers et de chevalerie sans plus.",
    "Le règne de Charles V et la reconquête de Du Guesclin, la guerre civile entre Armagnacs et Bourguignons, le traité d'Arras (1435) et l'armée permanente de Charles VII (1445) : seulement nommés dans les points clés.",
    "Les villes et le mouvement communal, autre sous-thème du programme : au cours 17 (semaine 16).",
    "La place de l'Église dans l'État royal (le conflit avec Boniface VIII est raconté comme un conflit de pouvoirs, sans doctrine) : règle sur la religion."
  ]
};
