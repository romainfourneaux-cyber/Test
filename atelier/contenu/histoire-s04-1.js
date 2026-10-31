// Source en clair du cours histoire-s04-1 « Cours 5 – Empire abbasside et 2 études de document ».
// Compilé (réponses brouillées) par node atelier/outils/compiler-cours.js histoire-s04-1.
// Sources : le support de la séance 5, pages 1 à 5 (frise, cartes, encadré sur le calendrier hégirien) pour les
// fiches f1, f2 et f4 ; le programme officiel de 5e (règle du 28/10/2026) pour les fiches f5 (le Coran comme document :
// langue, date, découpage, mois de ramadan dans le calendrier), f6 (Bagdad), f7 (Maison de la sagesse) et f8 (1258),
// faits vérifiés sur les pages citées. La fiche « lieux sur la carte » (ancienne f3, carte sans légende) a été retirée ;
// son identifiant n'est pas réutilisé. Les pages 6 et 7 (devoir d'entraînement) servent seulement à délimiter le cours :
// rien n'en est tiré. Règle sur la religion : aucune question de croyance ni de pratique.
const F = "cours/histoire/Histoire 5e - Seance 5 - Support et Devoir entrainement.pdf";
const S = p => ({ fichier: F, page: p });
// Questions de thème (règle du 25/10/2026) : fait vérifié dans une source fiable, notée sans fichier ni page.
const T = (titre, url) => ({ theme: "Cours 5 – Empire abbasside et 2 études de document", titre, editeur: "Wikipédia", url });
// Fiches de programme (règle du 28/10/2026) : sous-thème officiel et page où les faits ont été vérifiés.
const P = (titre, url) => ({ programme: "De la naissance de l'islam à la prise de Bagdad par les Mongols : pouvoirs, sociétés, cultures", titre, editeur: "Wikipédia", url });
const U_BAGDAD = "https://fr.wikipedia.org/wiki/Bagdad";
const U_MAISON = "https://fr.wikipedia.org/wiki/Maison_de_la_sagesse";
const U_KHWARIZMI = "https://fr.wikipedia.org/wiki/Al-Khw%C3%A2rizm%C3%AE";
const U_PAPIER = "https://fr.wikipedia.org/wiki/Histoire_du_papier";
const U_ABBASSIDE = "https://fr.wikipedia.org/wiki/Califat_abbasside";
const U_HAROUN = "https://fr.wikipedia.org/wiki/Haroun_ar-Rachid";
const U_CORAN = "https://fr.wikipedia.org/wiki/Coran";
const U_RAMADAN = "https://fr.wikipedia.org/wiki/Ramadan";
const U_YARMOUK = "https://fr.wikipedia.org/wiki/Bataille_du_Yarmouk";
const U_BYZ = "https://fr.wikipedia.org/wiki/Empire_byzantin";

// Frise redessinée (aucune image reprise) : années -> abscisses.
const A0 = 560, A1 = 1300, X0 = 30, X1 = 510;
const x = a => Math.round((X0 + (a - A0) * (X1 - X0) / (A1 - A0)) * 10) / 10;
function frise() {
  const encre = "#2e2419";
  let s = "<svg viewBox='0 30 540 190' xmlns='http://www.w3.org/2000/svg' font-family='Georgia,serif' font-size='11'>";
  s += "<text x='" + x(570) + "' y='48' fill='" + encre + "'>Mohamed (Mahomet), 570-632</text>";
  s += "<rect x='" + x(570) + "' y='54' width='" + (x(632) - x(570)) + "' height='10' fill='#a8848c'/>";
  s += "<line x1='" + x(622) + "' y1='64' x2='" + x(622) + "' y2='120' stroke='#8e2f4f' stroke-dasharray='3 2'/>";
  s += "<text x='" + (x(622) + 4) + "' y='80' fill='#8e2f4f'>622 : l'Hégire, an 1 du calendrier hégirien</text>";
  s += "<rect x='" + x(750) + "' y='96' width='" + (x(1258) - x(750)) + "' height='18' fill='#3f8a5a'/>";
  s += "<text x='" + ((x(750) + x(1258)) / 2) + "' y='109' text-anchor='middle' font-size='10' fill='#fff'>Empire abbasside, de Bagdad : 750-1258</text>";
  s += "<line x1='" + X0 + "' y1='120' x2='" + (X1 + 8) + "' y2='120' stroke='" + encre + "' stroke-width='2'/>";
  s += "<path d='M" + (X1 + 8) + " 115l10 5-10 5z' fill='" + encre + "'/>";
  for (let a = 600; a <= 1300; a += 100) {
    s += "<line x1='" + x(a) + "' y1='116' x2='" + x(a) + "' y2='124' stroke='" + encre + "'/>";
    s += "<text x='" + x(a) + "' y='135' text-anchor='middle' font-size='9' fill='" + encre + "'>" + a + "</text>";
  }
  s += "<rect x='" + x(661) + "' y='142' width='" + (x(750) - x(661)) + "' height='14' fill='#9cc58a'/>";
  s += "<text x='" + x(661) + "' y='170' fill='" + encre + "'>Empire omeyyade, de Damas : 661-750</text>";
  s += "<line x1='" + x(929) + "' y1='120' x2='" + x(929) + "' y2='190' stroke='" + encre + "' stroke-dasharray='3 2'/>";
  s += "<circle cx='" + x(929) + "' cy='120' r='4' fill='#2f5e8e'/>";
  s += "<text x='" + (x(929) + 4) + "' y='202' fill='#2f5e8e'>929 : début du califat de Cordoue</text>";
  return s + "</svg>";
}

module.exports = {
  id: "histoire-s04-1",
  fiches: [
    {
      id: "histoire-s04-1-f1", notion: "L'Empire abbasside (750-1258)",
      titre: "L'Empire abbasside, gouverné depuis Bagdad",
      texte: "La dynastie abbasside gouverne depuis Bagdad de 750 à 1258 : plus de cinq siècles. Sur la carte, son empire s'étend de l'Afrique du Nord jusqu'au-delà de la péninsule d'Arabie, vers l'est. Damas, Jérusalem, Médine et La Mecque s'y trouvent. Al Andalus, tout à l'ouest, n'en fait pas partie.",
      pointsCles: ["750-1258 : dynastie abbasside, à Bagdad", "Un empire immense, de l'Afrique du Nord à l'est de la péninsule d'Arabie et au-delà", "Dans l'empire : Damas, Jérusalem, Médine, La Mecque", "En dehors : Al Andalus, à l'ouest"],
      dates: [
        { annee: 750, evenement: "Début de la dynastie abbasside (Bagdad)" },
        { annee: 1258, evenement: "Fin de la dynastie abbasside" }
      ],
      lieux: ["Bagdad", "Damas", "Jérusalem", "Médine", "La Mecque", "Al Andalus"], personnages: [],
      vocabulaire: [
        { mot: "Al Andalus", def: "la région écrite tout à l'ouest de la carte, qui reste en dehors de l'Empire abbasside" }
      ],
      schema: "histoire-s04-1-s1", prerequis: ["histoire-s03-1-f2"], source: S(5)
    },
    {
      id: "histoire-s04-1-f2", notion: "L'Empire omeyyade comparé à l'Empire abbasside",
      titre: "Deux empires sur la carte : Omeyyades puis Abbassides",
      texte: "Avant les Abbassides, la dynastie omeyyade règne depuis Damas, de 661 à 750. Sur la carte, l'Empire omeyyade est encore plus vaste : il couvre toute l'Afrique du Nord et Al Andalus, à l'ouest. L'Empire abbasside, lui, ne comprend plus ni Al Andalus ni l'ouest de l'Afrique du Nord. En 929, d'ailleurs, commence le califat de Cordoue.",
      pointsCles: ["661-750 : Empire omeyyade, depuis Damas", "L'Empire omeyyade est plus étendu : il va jusqu'en Al Andalus", "L'Empire abbasside perd l'ouest : ni Al Andalus, ni l'ouest de l'Afrique du Nord", "929 : début du califat de Cordoue"],
      astuce: "Omeyyade = Ouest compris (jusqu'en Al Andalus) ; Abbasside = Bagdad, sans l'ouest.",
      dates: [
        { annee: 661, evenement: "Début de la dynastie omeyyade (Damas)" },
        { annee: 929, evenement: "Début du califat de Cordoue" }
      ],
      lieux: ["Damas", "Al Andalus", "Cordoue", "Afrique du Nord"], personnages: [],
      vocabulaire: [],
      schema: "histoire-s04-1-s1", prerequis: ["histoire-s04-1-f1", "histoire-s03-1-f3"], source: S(5)
    },
    {
      id: "histoire-s04-1-f4", notion: "Le calendrier hégirien",
      titre: "Un calendrier lunaire qui commence en 622",
      texte: "Le calendrier musulman est dit hégirien : son an 1 est l'année de l'Hégire, c'est-à-dire 622 dans notre calendrier. C'est un calendrier lunaire : ses 12 mois suivent la Lune et durent 29 ou 30 jours. Une année hégirienne compte donc 354 ou 355 jours, un peu moins qu'une année de notre calendrier.",
      pointsCles: ["An 1 = l'Hégire = 622", "Calendrier lunaire : 12 mois de 29 ou 30 jours", "354 ou 355 jours par an"],
      astuce: "Hégire, hégirien : le calendrier porte le nom de l'événement qui le commence.",
      dates: [
        { annee: 622, evenement: "L'Hégire, an 1 du calendrier hégirien" }
      ],
      lieux: [], personnages: [],
      vocabulaire: [
        { mot: "calendrier hégirien", def: "le calendrier musulman, dont l'an 1 est l'année de l'Hégire (622)" },
        { mot: "calendrier lunaire", def: "un calendrier dont les mois suivent la Lune : 12 mois de 29 ou 30 jours" }
      ],
      schema: null, prerequis: ["histoire-s03-1-f1"], source: S(3)
    },
    {
      id: "histoire-s04-1-f5", notion: "Le Coran, un livre du VIIe siècle",
      titre: "Étude de document : un extrait du Coran",
      texte: "Le cours étudie un extrait du Coran, le livre sacré de l'islam. Écrit en arabe, son nom signifie « récitation » ; selon la tradition, il est mis par écrit au VIIe siècle. Il compte 114 sourates, découpées en versets : l'extrait vient de la sourate 2. Il parle du mois de ramadan, le neuvième mois du calendrier hégirien.",
      pointsCles: ["Le Coran : le livre sacré de l'islam, écrit en arabe ; son nom veut dire « la récitation »", "D'après la tradition, il est mis par écrit au VIIe siècle, sous le calife Othman", "114 sourates (chapitres), découpées en versets (phrases numérotées) ; l'extrait étudié est dans la sourate 2, versets 183 à 185", "Le ramadan est le neuvième mois du calendrier hégirien ; comme ce calendrier est lunaire, il avance d'une dizaine de jours chaque année dans notre calendrier"],
      dates: [],
      lieux: [], personnages: ["Othman"],
      vocabulaire: [
        { mot: "sourate", def: "une des 114 grandes parties numérotées du Coran ; le texte étudié vient de la sourate 2" },
        { mot: "verset", def: "une des phrases numérotées d'une sourate, comme les versets 183 à 185" },
        { mot: "ramadan", def: "le neuvième mois du calendrier hégirien" }
      ],
      schema: null, prerequis: ["histoire-s04-1-f4"], source: P("Coran", U_CORAN)
    },
    {
      id: "histoire-s04-1-f6", notion: "Bagdad, la ville ronde (762)",
      titre: "762 : al-Mansur trace Bagdad, la ville ronde",
      texte: "762. Le calife al-Mansur choisit un site sur le Tigre et trace une ville ronde : Madinat as-Salam, « la cité de la paix », Bagdad. Cent mille ouvriers, quatre ans : 2,5 km de diamètre, quatre portes, le palais et la mosquée au centre. Elle approche bientôt le million d'habitants, carrefour du commerce entre l'Inde, la Chine et l'Europe.",
      pointsCles: ["762 : le calife abbasside al-Mansur fonde Bagdad, « la cité de la paix », sur le Tigre", "La ville ronde : environ 2,5 km de diamètre, quatre portes, le palais et la mosquée au centre ; cent mille ouvriers, quatre ans de travaux", "Aux VIIIe-IXe siècles, sans doute la première ville du monde à dépasser le million d'habitants", "Carrefour du commerce : ports du golfe Persique vers l'Inde, la Chine et l'Afrique de l'Est ; routes vers Constantinople et l'Europe", "Haroun al-Rachid (786-809) : l'âge d'or de Bagdad"],
      astuce: "762, c'est Bagdad ; 750, c'est la dynastie. Les Abbassides règnent douze ans avant d'avoir leur capitale.",
      dates: [
        { annee: 762, evenement: "Al-Mansur fonde Bagdad" },
        { annee: 786, evenement: "Début du règne de Haroun al-Rachid" }
      ],
      lieux: ["Bagdad", "Tigre"], personnages: ["Al-Mansur", "Haroun al-Rachid"],
      vocabulaire: [
        { mot: "Tigre", def: "le fleuve de Bagdad, qui coule vers le golfe Persique" },
        { mot: "ville ronde", def: "le surnom de Bagdad, bâtie en cercle par al-Mansur" }
      ],
      schema: null, prerequis: ["histoire-s04-1-f1"], source: P("Bagdad", U_BAGDAD)
    },
    {
      id: "histoire-s04-1-f7", notion: "La Maison de la sagesse et les savants de Bagdad",
      titre: "La Maison de la sagesse : traduire, calculer, écrire sur papier",
      texte: "Les califes attirent les savants à Bagdad. Sous al-Ma'mun (813-833), une bibliothèque, la Maison de la sagesse, rassemble les traducteurs : les livres des Grecs, des Perses et des Indiens passent en arabe. Al-Khwarizmi y écrit le premier manuel d'algèbre et fait connaître les chiffres indiens, nos chiffres actuels. Le papier, appris des Chinois, est fabriqué à Bagdad dès 793.",
      pointsCles: ["La Maison de la sagesse (Bayt al-Hikma) : une bibliothèque de Bagdad, à son apogée sous le calife al-Ma'mun (813-833)", "Sous les Abbassides, on traduit en arabe les livres des Grecs (Aristote, Ptolémée, Euclide), des Perses et des Indiens", "Al-Khwarizmi : le premier manuel d'algèbre ; son nom a donné le mot « algorithme » ; il fait connaître le calcul indien et nos chiffres", "Al-Kindi, philosophe et savant ; Hunayn ibn Ishaq, traducteur du grec", "Le papier, appris des Chinois après la bataille de Talas (751), est fabriqué à Bagdad dès 793"],
      dates: [
        { annee: 751, evenement: "Bataille de Talas : les Arabes apprennent le papier" },
        { annee: 793, evenement: "Du papier à Bagdad" },
        { annee: 813, evenement: "Début du règne d'al-Ma'mun, protecteur des savants" }
      ],
      lieux: ["Bagdad", "Samarcande"], personnages: ["Al-Ma'mun", "Al-Khwarizmi", "Al-Kindi", "Hunayn ibn Ishaq"],
      vocabulaire: [
        { mot: "Maison de la sagesse", def: "la bibliothèque de Bagdad où l'on copie, traduit et étudie les livres, au IXe siècle" },
        { mot: "algèbre", def: "la partie des mathématiques qui résout des équations ; le mot vient de l'arabe al-jabr" },
        { mot: "traducteur", def: "quelqu'un qui fait passer un texte d'une langue dans une autre" }
      ],
      schema: null, prerequis: ["histoire-s04-1-f6"], source: P("Maison de la sagesse", U_MAISON)
    },
    {
      id: "histoire-s04-1-f8", notion: "1258 : les Mongols prennent Bagdad",
      titre: "1258 : la chute de Bagdad",
      texte: "Depuis le Xe siècle, le calife de Bagdad n'a plus le pouvoir réel : les Bouyides (945) puis les Seldjoukides (1055) gouvernent à sa place ; il garde le titre. En 1258, les Mongols de Houlagou assiègent la ville. Après vingt jours, le 10 février, Bagdad tombe : pillage, mort du calife al-Musta'sim. Le califat de Bagdad est fini.",
      pointsCles: ["Dès le Xe siècle, le calife perd le pouvoir réel : les Bouyides prennent Bagdad en 945, les Turcs seldjoukides en 1055 ; le calife garde le titre", "1258 : les Mongols de Houlagou assiègent Bagdad vingt jours, du 20 janvier au 10 février", "La ville est pillée, le calife al-Musta'sim est tué ; les livres de la Maison de la sagesse sont jetés dans le Tigre", "Fin du califat abbasside de Bagdad : la borne qui ferme le thème", "1261 : un calife abbasside est rétabli au Caire, sans pouvoir réel"],
      astuce: "750-1258 : la dynastie dure cinq siècles, mais le calife ne gouverne vraiment que pendant les deux premiers.",
      dates: [
        { annee: 945, evenement: "Les Bouyides maîtres de Bagdad" },
        { annee: 1055, evenement: "Les Seldjoukides maîtres de Bagdad" },
        { annee: 1258, evenement: "Les Mongols prennent Bagdad" }
      ],
      lieux: ["Bagdad", "Tigre", "Le Caire"], personnages: ["Houlagou", "Al-Musta'sim"],
      vocabulaire: [
        { mot: "Mongols", def: "un peuple de cavaliers venu d'Asie centrale, dont les armées conquièrent une grande partie de l'Asie au XIIIe siècle" },
        { mot: "siège", def: "l'encerclement d'une ville par une armée, pour la forcer à se rendre" }
      ],
      schema: null, prerequis: ["histoire-s04-1-f6"], source: P("Bagdad", U_BAGDAD)
    }
  ],
  schemas: [
    { id: "histoire-s04-1-s1", legende: "Omeyyades, Abbassides et califat de Cordoue, de 570 à 1258 (frise redessinée d'après le support).", svg: frise() }
  ],
  questions: [
    // f1 : l'Empire abbasside
    { id: "histoire-s04-1-q1", fiche: "histoire-s04-1-f1", type: "qcm", niveau: 1,
      enonce: "Depuis quelle ville la dynastie abbasside gouverne-t-elle son empire ?",
      choix: ["Bagdad", "Damas", "Cordoue", "La Mecque"],
      reponse: "Bagdad",
      explication: "La dynastie abbasside gouverne depuis Bagdad, de 750 à 1258. Damas était la ville de la dynastie omeyyade.", source: S(1) },
    { id: "histoire-s04-1-q2", fiche: "histoire-s04-1-f1", type: "vrai_faux", niveau: 1,
      enonce: "La dynastie abbasside règne de 750 à 1258.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : elle commence en 750, quand s'arrête la dynastie omeyyade, et dure jusqu'en 1258.", source: S(1) },
    { id: "histoire-s04-1-q3", fiche: "histoire-s04-1-f1", type: "qcm", niveau: 2,
      enonce: "Pourquoi Bagdad est-elle célèbre au temps des Abbassides ?",
      choix: ["C'est une ville immense et riche, où des savants traduisent et étudient les sciences", "C'est surtout une forteresse militaire, sans marchands ni savants, bâtie contre les Byzantins", "C'est la capitale de l'Empire byzantin, après Constantinople", "C'est un petit port de pêcheurs sur la Méditerranée"],
      reponse: "C'est une ville immense et riche, où des savants traduisent et étudient les sciences",
      explication: "Fondée en 762 par le calife Al-Mansur, Bagdad devient la capitale des Abbassides et compte peut-être un million d'habitants. Ses marchands commercent jusqu'en Inde et en Chine, et sa Maison de la sagesse traduit les livres des savants grecs.",
      source: T("Bagdad", U_BAGDAD) },
    { id: "histoire-s04-1-q4", fiche: "histoire-s04-1-f1", type: "qcm_multiple", niveau: 2,
      enonce: "Quelles villes font partie de l'Empire abbasside ? (plusieurs réponses)",
      choix: ["Damas", "Jérusalem", "Médine", "La Mecque", "Cordoue", "Constantinople"],
      reponse: ["Damas", "Jérusalem", "Médine", "La Mecque"],
      explication: "Damas, Jérusalem, Médine et La Mecque sont dans l'empire. Cordoue est à l'ouest, hors de l'empire, et Constantinople reste la capitale de l'Empire byzantin.", source: S(5) },
    { id: "histoire-s04-1-q5", fiche: "histoire-s04-1-f1", type: "vrai_faux", niveau: 2,
      enonce: "Al Andalus, tout à l'ouest, fait partie de l'Empire abbasside.",
      corrections: ["Faux : Al Andalus, tout à l'ouest, reste en dehors de l'Empire abbasside.", "Faux : Al Andalus est la capitale de l'Empire abbasside.", "Faux : Al Andalus se trouve dans la péninsule d'Arabie, au cœur de l'empire."],
      reponse: { vrai: false, correction: "Faux : Al Andalus, tout à l'ouest, reste en dehors de l'Empire abbasside." },
      explication: "Al Andalus est tout à l'ouest, au-delà des terres des Abbassides. L'Empire abbasside ne l'englobe pas : en 929, un califat rival y commence même, à Cordoue.", source: S(5) },
    { id: "histoire-s04-1-q6", fiche: "histoire-s04-1-f1", type: "qcm", niveau: 2,
      enonce: "Quelle est l'étendue de l'Empire abbasside ?",
      choix: ["Un vaste empire, de l'Afrique du Nord jusque loin vers l'est", "Un petit territoire qui entoure seulement la ville de Bagdad et ses environs", "Un empire limité à la péninsule d'Arabie", "Un empire qui couvre l'Europe de l'Ouest"],
      reponse: "Un vaste empire, de l'Afrique du Nord jusque loin vers l'est",
      explication: "L'empire part de l'Afrique du Nord, englobe la péninsule d'Arabie et continue loin vers l'est. Il est immense.", source: S(5) },
    { id: "histoire-s04-1-q7", fiche: "histoire-s04-1-f1", type: "qcm", niveau: 3,
      enonce: "En l'an 1000, quelle dynastie règne à Bagdad ?",
      choix: ["La dynastie abbasside", "La dynastie omeyyade", "Le califat de Cordoue", "L'Empire carolingien"],
      reponse: "La dynastie abbasside",
      explication: "La dynastie abbasside règne à Bagdad de 750 à 1258 : l'an 1000 est dans cette période. La dynastie omeyyade s'est arrêtée en 750.", indice: "Regarde les dates de la dynastie abbasside sur la frise.", source: S(1) },
    { id: "histoire-s04-1-q8", fiche: "histoire-s04-1-f1", type: "vrai_faux", niveau: 3,
      enonce: "En 1300, la dynastie abbasside règne encore à Bagdad.",
      corrections: ["Faux : elle s'arrête en 1258, donc avant 1300.", "Faux : elle s'arrête en 750, quand commence la dynastie omeyyade.", "Faux : elle ne commence qu'en 1300."],
      reponse: { vrai: false, correction: "Faux : elle s'arrête en 1258, donc avant 1300." },
      explication: "La dynastie abbasside dure jusqu'en 1258. En 1300, elle a donc disparu depuis une quarantaine d'années.", source: S(1) },
    // f2 : Omeyyades et Abbassides
    { id: "histoire-s04-1-q9", fiche: "histoire-s04-1-f2", type: "qcm", niveau: 1,
      enonce: "Quelle dynastie règne depuis Damas de 661 à 750 ?",
      choix: ["La dynastie omeyyade", "La dynastie abbasside", "La dynastie carolingienne", "La dynastie byzantine"],
      reponse: "La dynastie omeyyade",
      explication: "La dynastie omeyyade règne à Damas de 661 à 750. La dynastie abbasside lui succède à Bagdad.", source: S(1) },
    { id: "histoire-s04-1-q10", fiche: "histoire-s04-1-f2", type: "vrai_faux", niveau: 1,
      enonce: "L'Empire omeyyade est plus vaste que l'Empire abbasside.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : l'Empire omeyyade s'étend en plus sur Al Andalus et sur tout l'ouest de l'Afrique du Nord.", source: S(5) },
    { id: "histoire-s04-1-q12", fiche: "histoire-s04-1-f2", type: "qcm", niveau: 1,
      enonce: "Quelle ville est la capitale d'Al Andalus, l'Espagne musulmane ?",
      choix: ["Cordoue", "Damas", "Bagdad", "Jérusalem"],
      reponse: "Cordoue",
      explication: "Cordoue est la capitale de l'émirat d'Al Andalus à partir de 756, puis du califat de Cordoue à partir de 929. Damas et Bagdad sont les capitales des Omeyyades puis des Abbassides, bien plus à l'est.",
      source: T("Cordoue", "https://fr.wikipedia.org/wiki/Cordoue") },
    { id: "histoire-s04-1-q13", fiche: "histoire-s04-1-f2", type: "ordre", niveau: 2,
      enonce: "Remets ces repères dans l'ordre du temps.",
      elements: ["Début de la dynastie abbasside à Bagdad", "L'Hégire", "Début de la dynastie omeyyade à Damas", "Début du califat de Cordoue"],
      reponse: [1, 2, 0, 3],
      explication: "622 : l'Hégire ; 661 : les Omeyyades à Damas ; 750 : les Abbassides à Bagdad ; 929 : le califat de Cordoue.", source: S(1) },
    { id: "histoire-s04-1-q14", fiche: "histoire-s04-1-f2", type: "vrai_faux", niveau: 2,
      enonce: "L'Empire omeyyade et l'Empire abbasside existent en même temps, l'un à Damas et l'autre à Bagdad.",
      corrections: ["Faux : la dynastie abbasside succède à la dynastie omeyyade en 750.", "Faux : ils existent en même temps, mais tous les deux à Bagdad.", "Faux : la dynastie omeyyade succède à la dynastie abbasside en 1258."],
      reponse: { vrai: false, correction: "Faux : la dynastie abbasside succède à la dynastie omeyyade en 750." },
      explication: "Les deux dynasties se suivent : les Omeyyades jusqu'en 750, puis les Abbassides. Elles ne règnent pas en même temps.", source: S(1) },
    { id: "histoire-s04-1-q15", fiche: "histoire-s04-1-f2", type: "qcm", niveau: 2,
      enonce: "Pourquoi peut-on dire que l'Empire omeyyade est plus étendu que l'Empire abbasside ?",
      choix: ["Il comprend en plus Al Andalus et l'ouest de l'Afrique du Nord", "Il comprend en plus toute la péninsule d'Arabie", "Il comprend en plus la ville de Damas", "Il comprend en plus Bagdad et Jérusalem"],
      reponse: "Il comprend en plus Al Andalus et l'ouest de l'Afrique du Nord",
      explication: "Les deux empires ont l'Arabie, Damas et Jérusalem. Seul l'Empire omeyyade va jusqu'en Al Andalus et à l'ouest de l'Afrique du Nord.", source: S(5) },
    { id: "histoire-s04-1-q16", fiche: "histoire-s04-1-f2", type: "association", niveau: 2,
      enonce: "Relie chaque repère à ce qui le caractérise.",
      gauche: ["Dynastie omeyyade", "Dynastie abbasside", "Califat de Cordoue", "Hégire"],
      droite: ["An 1 du calendrier hégirien, en 622", "Damas, de 661 à 750", "Bagdad, de 750 à 1258", "Commence en 929"],
      reponse: [[0, 1], [1, 2], [2, 3], [3, 0]],
      explication: "Omeyyades à Damas (661-750), Abbassides à Bagdad (750-1258), califat de Cordoue à partir de 929. L'Hégire, en 622, ouvre le calendrier hégirien.", source: S(1) },
    { id: "histoire-s04-1-q22", fiche: "histoire-s04-1-f2", type: "qcm", niveau: 3,
      enonce: "Pourquoi la bataille du Yarmouk, en 636, est-elle importante ?",
      choix: ["L'armée du califat y bat les Byzantins : la Syrie passe sous domination musulmane", "L'Empire byzantin y reprend Damas et Jérusalem et chasse les armées du califat de toute la Syrie", "Elle marque la fin de la dynastie omeyyade et le début des Abbassides", "Charlemagne y arrête une armée venue d'Al Andalus"],
      reponse: "L'armée du califat y bat les Byzantins : la Syrie passe sous domination musulmane",
      explication: "En août 636, près de la rivière Yarmouk, l'armée du califat remporte une victoire décisive sur celle de l'Empire byzantin. Les Byzantins perdent alors la Syrie et la Palestine, où se trouvent Damas et Jérusalem : Damas deviendra la capitale des Omeyyades.",
      source: T("Bataille du Yarmouk", U_YARMOUK) },
    // f4 : le calendrier hégirien
    { id: "histoire-s04-1-q25", fiche: "histoire-s04-1-f4", type: "qcm", niveau: 1,
      enonce: "Quel événement marque l'an 1 du calendrier hégirien ?",
      choix: ["L'Hégire", "La naissance de Mohamed", "Le début de la dynastie omeyyade", "Le début de la dynastie abbasside"],
      reponse: "L'Hégire",
      explication: "Le calendrier hégirien commence avec l'Hégire, en 622. C'est de là qu'il tire son nom.", source: S(3) },
    { id: "histoire-s04-1-q26", fiche: "histoire-s04-1-f4", type: "vrai_faux", niveau: 1,
      enonce: "Le calendrier hégirien est un calendrier lunaire.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : ses mois suivent la Lune. Ils durent 29 ou 30 jours.", source: S(3) },
    { id: "histoire-s04-1-q27", fiche: "histoire-s04-1-f4", type: "qcm", niveau: 2,
      enonce: "Combien de jours compte une année hégirienne ?",
      choix: ["354 ou 355", "365 ou 366", "360 exactement", "300 exactement"],
      reponse: "354 ou 355",
      explication: "Une année hégirienne compte 354 ou 355 jours. C'est un peu moins qu'une année de notre calendrier.", source: S(3) },
    { id: "histoire-s04-1-q28", fiche: "histoire-s04-1-f4", type: "qcm", niveau: 2,
      enonce: "Pourquoi une année hégirienne est-elle plus courte qu'une année de notre calendrier ?",
      choix: ["Ses 12 mois suivent la Lune et durent 29 ou 30 jours", "Elle ne compte que 10 mois au lieu de 12", "Elle commence en 622 et non en l'an 1", "Ses mois durent tous exactement 31 jours"],
      reponse: "Ses 12 mois suivent la Lune et durent 29 ou 30 jours",
      explication: "Douze mois de 29 ou 30 jours font 354 ou 355 jours. C'est moins que nos douze mois, plus longs.", source: S(3) },
    { id: "histoire-s04-1-q29", fiche: "histoire-s04-1-f4", type: "vrai_faux", niveau: 2,
      enonce: "Une année hégirienne compte 12 mois de 31 jours.",
      corrections: ["Faux : 12 mois lunaires de 29 ou 30 jours.", "Faux : 10 mois lunaires de 35 jours.", "Faux : 13 mois de 28 jours."],
      reponse: { vrai: false, correction: "Faux : 12 mois lunaires de 29 ou 30 jours." },
      explication: "Les mois hégiriens suivent la Lune : ils durent 29 ou 30 jours. Il y en a bien douze.", source: S(3) },
    { id: "histoire-s04-1-q31", fiche: "histoire-s04-1-f4", type: "qcm", niveau: 3,
      enonce: "Une année hégirienne a une dizaine de jours de moins que la nôtre. Que se passe-t-il, d'une année à l'autre, pour le début d'un même mois hégirien dans notre calendrier ?",
      choix: ["Il arrive une dizaine de jours plus tôt chaque année", "Il tombe toujours à la même date", "Il arrive une dizaine de jours plus tard chaque année", "Il change seulement tous les cent ans"],
      reponse: "Il arrive une dizaine de jours plus tôt chaque année",
      explication: "L'année hégirienne est plus courte, donc le mois suivant commence plus tôt que l'année d'avant. L'écart est d'environ dix jours par an.", indice: "Une année plus courte se termine plus tôt.", source: S(3) },
    { id: "histoire-s04-1-q32", fiche: "histoire-s04-1-f4", type: "trou", niveau: 1,
      enonce: "Complète la phrase.",
      texte: "Le calendrier hégirien est ___ : il compte ___ mois de 29 ou 30 jours.",
      banque: ["lunaire", "12", "solaire", "10"],
      reponse: [["lunaire"], ["12"]],
      explication: "C'est un calendrier lunaire de 12 mois. Chaque mois dure 29 ou 30 jours.", source: S(3) },
    // f5 : le Coran comme document
    { id: "histoire-s04-1-q33", fiche: "histoire-s04-1-f5", type: "qcm", niveau: 1,
      enonce: "Comment s'appelle le livre sacré de l'islam, dont le cours étudie un extrait ?",
      choix: ["Le Coran", "Les Mille et Une Nuits", "Le Code de Justinien", "Les Annales d'Eginhard"],
      reponse: "Le Coran",
      explication: "Le livre sacré de l'islam est le Coran, écrit en arabe au VIIe siècle. Les Mille et Une Nuits sont des contes, le Code de Justinien un recueil de lois, et Eginhard a écrit sur Charlemagne.", source: S(2) },
    { id: "histoire-s04-1-q34", fiche: "histoire-s04-1-f5", type: "vrai_faux", niveau: 1,
      enonce: "Le ramadan est le neuvième mois du calendrier hégirien.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : le ramadan est le neuvième des douze mois du calendrier hégirien. Il dure 29 ou 30 jours, comme les autres mois lunaires.",
      source: T("Ramadan", U_RAMADAN) },
    { id: "histoire-s04-1-q35", fiche: "histoire-s04-1-f5", type: "qcm", niveau: 2,
      enonce: "Comment appelle-t-on une grande partie numérotée du Coran ?",
      choix: ["Une sourate", "Un verset", "Un chapitre des Annales", "Une chronique"],
      reponse: "Une sourate",
      explication: "Le Coran est divisé en sourates : le texte sur le ramadan vient de la sourate 2. Les versets sont les phrases numérotées à l'intérieur d'une sourate.", source: S(2) },
    { id: "histoire-s04-1-q37", fiche: "histoire-s04-1-f5", type: "qcm", niveau: 2,
      enonce: "En quelle langue le Coran est-il écrit ?",
      choix: ["En arabe", "En grec", "En latin", "En persan"],
      reponse: "En arabe",
      explication: "Le Coran, le livre de l'islam, est écrit en arabe : son nom veut dire « la récitation ». Le grec est la langue de l'Empire byzantin et le latin celle de l'Église d'Occident.",
      source: T("Coran", U_CORAN) },
    { id: "histoire-s04-1-q39", fiche: "histoire-s04-1-f5", type: "qcm", niveau: 2,
      enonce: "Pourquoi le mois de ramadan ne tombe-t-il pas à la même date chaque année dans notre calendrier ?",
      choix: ["Le calendrier hégirien est lunaire : il est plus court d'une dizaine de jours", "Le calife de Bagdad choisit chaque année librement la date et la durée de ce mois", "Il suit les saisons et change avec les récoltes", "Il tombe toujours en été, mais l'été change de date"],
      reponse: "Le calendrier hégirien est lunaire : il est plus court d'une dizaine de jours",
      explication: "L'année hégirienne compte 354 ou 355 jours, une dizaine de moins que la nôtre. Chaque mois hégirien, dont le ramadan, commence donc dix ou onze jours plus tôt que l'année précédente.",
      source: T("Ramadan", U_RAMADAN) },
    { id: "histoire-s04-1-q40", fiche: "histoire-s04-1-f5", type: "trou", niveau: 1,
      enonce: "Complète la phrase sur le livre étudié.",
      texte: "Le Coran, le livre sacré de l'islam, est écrit en ___ ; il est divisé en 114 ___.",
      banque: ["arabe", "sourates", "grec", "chapitres"],
      reponse: [["arabe"], ["sourates"]],
      explication: "Le Coran est écrit en arabe. Ses 114 grandes parties s'appellent des sourates.",
      source: T("Coran", U_CORAN) },
    { id: "histoire-s04-1-q41", fiche: "histoire-s04-1-f5", type: "qcm", niveau: 3,
      enonce: "À quel siècle le Coran est-il mis par écrit, d'après la tradition musulmane ?",
      choix: ["Au VIIe siècle, sous le calife Othman", "Au IXe siècle, à la Maison de la sagesse de Bagdad", "Au Xe siècle, à Cordoue", "Au IVe siècle, à Constantinople"],
      reponse: "Au VIIe siècle, sous le calife Othman",
      explication: "D'après la tradition musulmane, le texte est mis par écrit sous le troisième calife, Othman, entre 644 et 656. C'est le siècle de l'Hégire (622) et des premières conquêtes.",
      source: T("Coran", U_CORAN) },
    // f6 : Bagdad, la ville ronde
    { id: "histoire-s04-1-q42", fiche: "histoire-s04-1-f6", type: "qcm", niveau: 1,
      enonce: "Qui fonde Bagdad, et quand ?",
      choix: ["Le calife al-Mansur, en 762", "Le calife Haroun al-Rachid, en 800", "Le Mongol Houlagou, en 1258", "Mohamed, en 622"],
      reponse: "Le calife al-Mansur, en 762",
      explication: "En 762, le calife abbasside al-Mansur fonde Bagdad sur le Tigre. Haroun al-Rachid y règne plus tard, de 786 à 809.",
      source: T("Bagdad", U_BAGDAD) },
    { id: "histoire-s04-1-q43", fiche: "histoire-s04-1-f6", type: "vrai_faux", niveau: 1,
      enonce: "Bagdad est bâtie au bord du Tigre.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : al-Mansur choisit un site sur les rives du Tigre, qui fournit l'eau de la ville. Le fleuve coule vers le golfe Persique.",
      source: T("Bagdad", U_BAGDAD) },
    { id: "histoire-s04-1-q44", fiche: "histoire-s04-1-f6", type: "qcm", niveau: 2,
      enonce: "Pourquoi surnomme-t-on Bagdad « la ville ronde » ?",
      choix: ["Al-Mansur l'a fait bâtir en cercle, avec le palais au centre et quatre portes", "Elle est entourée d'un grand lac circulaire creusé par les ouvriers du calife", "Ses habitants vivaient dans des maisons rondes", "Ses rues tournent autour du Tigre"],
      reponse: "Al-Mansur l'a fait bâtir en cercle, avec le palais au centre et quatre portes",
      explication: "La ville d'al-Mansur est un cercle d'environ 2,5 km de diamètre, percé de quatre portes et entouré d'un fossé. Le palais et la mosquée occupent le centre.",
      source: T("Bagdad", U_BAGDAD) },
    { id: "histoire-s04-1-q45", fiche: "histoire-s04-1-f6", type: "qcm", niveau: 2,
      enonce: "Combien d'habitants Bagdad compte-t-elle à son apogée, aux VIIIe-IXe siècles ?",
      choix: ["Environ un million", "Environ dix mille", "Environ cent mille", "Environ dix millions"],
      reponse: "Environ un million",
      explication: "Certains historiens pensent que Bagdad est la première ville du monde à dépasser le million d'habitants. Cent mille, c'est le nombre d'ouvriers qui l'ont bâtie.",
      source: T("Bagdad", U_BAGDAD) },
    { id: "histoire-s04-1-q46", fiche: "histoire-s04-1-f6", type: "vrai_faux", niveau: 2,
      enonce: "Bagdad est une ville isolée, sans commerce avec le reste du monde.",
      corrections: ["Faux : c'est une plaque tournante du commerce, de l'Inde et la Chine jusqu'à l'Europe.", "Faux : elle ne commerce qu'avec Constantinople.", "Faux : elle commerce seulement avec l'Espagne."],
      reponse: { vrai: false, correction: "Faux : c'est une plaque tournante du commerce, de l'Inde et la Chine jusqu'à l'Europe." },
      explication: "Par les ports du golfe Persique, Bagdad commerce avec l'Inde, la Chine, le Yémen et l'Afrique de l'Est. Des routes terrestres la relient à la route de la soie, à Constantinople et à l'Europe.",
      source: T("Bagdad", U_BAGDAD) },
    { id: "histoire-s04-1-q47", fiche: "histoire-s04-1-f6", type: "qcm", niveau: 3,
      enonce: "Comment les marchandises de l'Inde et de la Chine arrivent-elles à Bagdad ?",
      choix: ["Par les ports du golfe Persique et par la route de la soie", "Elles n'y arrivent jamais : Bagdad ne commerce qu'avec les villes d'Arabie", "Par le Nil et la mer Rouge seulement", "Par la Méditerranée, depuis Constantinople"],
      reponse: "Par les ports du golfe Persique et par la route de la soie",
      explication: "Les navires remontent le golfe Persique jusqu'aux ports de Bagdad, et les caravanes suivent la route de la soie. La ville est au carrefour des deux.",
      source: T("Bagdad", U_BAGDAD) },
    { id: "histoire-s04-1-q48", fiche: "histoire-s04-1-f6", type: "association", niveau: 2,
      enonce: "Relie chaque élément à ce qu'il désigne.",
      gauche: ["762", "Al-Mansur", "Tigre", "Madinat as-Salam"],
      droite: ["L'année de la fondation de Bagdad", "Le calife qui fonde Bagdad", "Le fleuve de Bagdad", "« La cité de la paix », le nom officiel de Bagdad"],
      reponse: [[0, 0], [1, 1], [2, 2], [3, 3]],
      explication: "En 762, le calife al-Mansur fonde sur le Tigre Madinat as-Salam, « la cité de la paix ». Tout le monde l'appelle Bagdad.",
      source: T("Bagdad", U_BAGDAD) },
    { id: "histoire-s04-1-q49", fiche: "histoire-s04-1-f6", type: "trou", niveau: 1,
      enonce: "Complète la phrase.",
      texte: "En 762, le calife ___ fonde Bagdad au bord du ___.",
      banque: ["al-Mansur", "Tigre", "Haroun", "Nil"],
      reponse: [["al-Mansur"], ["Tigre"]],
      explication: "Al-Mansur fonde Bagdad en 762, sur le Tigre. Haroun al-Rachid règne plus tard, et le Nil est le fleuve de l'Égypte.",
      source: T("Bagdad", U_BAGDAD) },
    { id: "histoire-s04-1-q50", fiche: "histoire-s04-1-f6", type: "qcm", niveau: 3,
      enonce: "Avec quel souverain d'Occident le calife Haroun al-Rachid échange-t-il des cadeaux et des ambassades ?",
      choix: ["Charlemagne", "Clovis", "Justinien", "Pépin le Bref"],
      reponse: "Charlemagne",
      explication: "Haroun al-Rachid règne de 786 à 809 et offre à Charlemagne un éléphant blanc, Abul-Abbas, arrivé à Aix-la-Chapelle en 802. Clovis et Justinien vivent deux siècles plus tôt.",
      source: T("Haroun ar-Rachid", U_HAROUN) },
    // f7 : la Maison de la sagesse
    { id: "histoire-s04-1-q51", fiche: "histoire-s04-1-f7", type: "qcm", niveau: 1,
      enonce: "Qu'est-ce que la Maison de la sagesse ?",
      choix: ["Une bibliothèque de Bagdad où l'on traduit et étudie les livres", "Le palais fortifié du calife, au centre exact de la ville ronde de Bagdad", "Une forteresse bâtie contre les Mongols", "Une école de Cordoue"],
      reponse: "Une bibliothèque de Bagdad où l'on traduit et étudie les livres",
      explication: "La Maison de la sagesse est une bibliothèque de cour où travaillent lettrés et traducteurs. Elle connaît son apogée sous le calife al-Ma'mun, de 813 à 833.",
      source: T("Maison de la sagesse", U_MAISON) },
    { id: "histoire-s04-1-q52", fiche: "histoire-s04-1-f7", type: "vrai_faux", niveau: 1,
      enonce: "Al-Khwarizmi est un savant de Bagdad, auteur du premier manuel d'algèbre.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : membre de la Maison de la sagesse, al-Khwarizmi publie son livre d'algèbre sous al-Ma'mun. Le mot « algèbre » vient de son titre, al-jabr.",
      source: T("Al-Khwârizmî", U_KHWARIZMI) },
    { id: "histoire-s04-1-q53", fiche: "histoire-s04-1-f7", type: "qcm", niveau: 2,
      enonce: "Pourquoi les savants de Bagdad traduisent-ils les livres grecs, persans et indiens en arabe ?",
      choix: ["Pour réunir les savoirs de ces peuples dans la langue de l'empire, l'arabe", "Parce que plus personne au monde, même à Constantinople, ne sait lire le grec", "Pour vendre les traductions aux Byzantins", "Pour les brûler ensuite"],
      reponse: "Pour réunir les savoirs de ces peuples dans la langue de l'empire, l'arabe",
      explication: "Les califes font collecter, copier et traduire les textes grecs, syriaques, persans et indiens. Les savants de l'empire peuvent alors les lire et les faire avancer en arabe.",
      source: T("Maison de la sagesse", U_MAISON) },
    { id: "histoire-s04-1-q54", fiche: "histoire-s04-1-f7", type: "qcm", niveau: 2,
      enonce: "Quel mot vient du nom du savant al-Khwarizmi ?",
      choix: ["Algorithme", "Algèbre", "Alphabet", "Astronomie"],
      reponse: "Algorithme",
      explication: "Son nom, écrit en latin, a donné le mot « algorithme ». Le mot « algèbre », lui, vient du titre de son livre, al-jabr.",
      source: T("Al-Khwârizmî", U_KHWARIZMI) },
    { id: "histoire-s04-1-q55", fiche: "histoire-s04-1-f7", type: "vrai_faux", niveau: 2,
      enonce: "Les chiffres que nous utilisons aujourd'hui ont été inventés à Bagdad par al-Khwarizmi.",
      corrections: ["Faux : ils viennent de l'Inde ; al-Khwarizmi les fait connaître dans un livre, d'où leur nom de chiffres arabes.", "Faux : ils ont été inventés à Rome, sous Justinien.", "Faux : ils viennent de Chine, en même temps que le papier."],
      reponse: { vrai: false, correction: "Faux : ils viennent de l'Inde ; al-Khwarizmi les fait connaître dans un livre, d'où leur nom de chiffres arabes." },
      explication: "Le système décimal avec le zéro vient de l'Inde. Le livre d'al-Khwarizmi sur le calcul indien le diffuse au Moyen-Orient puis en Europe, où l'on parle de chiffres arabes.",
      source: T("Al-Khwârizmî", U_KHWARIZMI) },
    { id: "histoire-s04-1-q36", fiche: "histoire-s04-1-f7", type: "vrai_faux", niveau: 2,
      enonce: "Au temps des Abbassides, il n'y a pas de papier à Bagdad : la Chine garde le secret de sa fabrication.",
      corrections: ["Faux : les Arabes apprennent à fabriquer le papier au VIIIe siècle, et on en trouve à Bagdad dès 793.", "Faux : le papier est une invention de Bagdad, que la Chine copie ensuite.", "Faux : le papier n'arrive à Bagdad qu'au XIIIe siècle, en même temps qu'en Europe."],
      reponse: { vrai: false, correction: "Faux : les Arabes apprennent à fabriquer le papier au VIIIe siècle, et on en trouve à Bagdad dès 793." },
      explication: "Après la bataille de Talas, en 751, les Arabes apprennent à fabriquer le papier auprès de prisonniers chinois, et Samarcande est la première ville du monde musulman à en produire. Le papier est à Bagdad dès 793, au temps des premiers califes abbassides.",
      indice: "Les marchands de l'empire vont jusqu'en Chine, et ils n'en rapportent pas que de la soie.",
      source: T("Histoire du papier", U_PAPIER) },
    { id: "histoire-s04-1-q56", fiche: "histoire-s04-1-f7", type: "ordre", niveau: 3,
      enonce: "Range ces événements du plus ancien au plus récent.",
      elements: ["La Maison de la sagesse à son apogée sous al-Ma'mun", "Du papier est fabriqué à Bagdad", "Fondation de Bagdad", "Les Arabes apprennent le papier après la bataille de Talas"],
      reponse: [3, 2, 1, 0],
      explication: "751 : Talas ; 762 : fondation de Bagdad ; 793 : du papier à Bagdad ; 813-833 : le règne d'al-Ma'mun.",
      source: T("Histoire du papier", U_PAPIER) },
    { id: "histoire-s04-1-q57", fiche: "histoire-s04-1-f7", type: "qcm", niveau: 3,
      enonce: "Comment le papier arrive-t-il dans le monde musulman ?",
      choix: ["Après la bataille de Talas (751), des prisonniers chinois apprennent sa fabrication aux Arabes", "Les marchands byzantins de Constantinople le vendent à prix d'or aux califes abbassides de Bagdad", "Les moines de Cluny l'inventent et l'envoient à Bagdad", "Les marchands de Venise l'apportent de Rome"],
      reponse: "Après la bataille de Talas (751), des prisonniers chinois apprennent sa fabrication aux Arabes",
      explication: "La bataille de Talas, en 751, oppose les armées du califat aux Chinois. Des prisonniers chinois apprennent aux Arabes à faire du papier : Samarcande en produit la première, puis Bagdad dès 793.",
      source: T("Histoire du papier", U_PAPIER) },
    { id: "histoire-s04-1-q58", fiche: "histoire-s04-1-f7", type: "association", niveau: 2,
      enonce: "Relie chaque nom à ce qui le caractérise.",
      gauche: ["Al-Khwarizmi", "Maison de la sagesse", "Papier", "Al-Ma'mun"],
      droite: ["Savant : l'algèbre et le calcul indien", "Bibliothèque et atelier de traduction de Bagdad", "Appris des Chinois, fabriqué à Bagdad dès 793", "Calife (813-833), protecteur des savants"],
      reponse: [[0, 0], [1, 1], [2, 2], [3, 3]],
      explication: "Sous al-Ma'mun, la Maison de la sagesse rassemble les traducteurs et des savants comme al-Khwarizmi. Le papier, venu de Chine, sert à copier leurs livres.",
      source: T("Maison de la sagesse", U_MAISON) },
    // f8 : 1258
    { id: "histoire-s04-1-q59", fiche: "histoire-s04-1-f8", type: "qcm", niveau: 1,
      enonce: "Qui prend Bagdad en 1258 ?",
      choix: ["Les Mongols de Houlagou", "Les Ottomans de Mehmed II", "Les croisés", "Les Omeyyades de Cordoue"],
      reponse: "Les Mongols de Houlagou",
      explication: "Les Mongols de Houlagou prennent Bagdad le 10 février 1258, après vingt jours de siège. Les Ottomans de Mehmed II prennent Constantinople, en 1453.",
      source: T("Bagdad", U_BAGDAD) },
    { id: "histoire-s04-1-q60", fiche: "histoire-s04-1-f8", type: "vrai_faux", niveau: 1,
      enonce: "En 1258, la prise de Bagdad met fin au califat abbasside de Bagdad.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : le calife al-Musta'sim est tué et la ville pillée. Après cinq siècles, le califat de Bagdad disparaît.",
      source: T("Califat abbasside", U_ABBASSIDE) },
    { id: "histoire-s04-1-q61", fiche: "histoire-s04-1-f8", type: "qcm", niveau: 2,
      enonce: "Pourquoi dit-on que le calife de Bagdad n'a plus le pouvoir réel dès le Xe siècle ?",
      choix: ["D'autres gouvernent à sa place, les Bouyides puis les Seldjoukides ; il ne garde que le titre", "Les Mongols de Houlagou l'ont déjà renversé une première fois en 945, puis une seconde en 1055", "Il a déménagé à Cordoue", "Il a été remplacé par le basileus"],
      reponse: "D'autres gouvernent à sa place, les Bouyides puis les Seldjoukides ; il ne garde que le titre",
      explication: "En 945, un prince bouyide s'empare de Bagdad ; en 1055, les Turcs seldjoukides les remplacent. Le calife garde une autorité de principe, mais ce sont eux qui gouvernent.",
      source: T("Califat abbasside", U_ABBASSIDE) },
    { id: "histoire-s04-1-q62", fiche: "histoire-s04-1-f8", type: "qcm", niveau: 2,
      enonce: "Combien de temps dure le siège de Bagdad par les Mongols, en 1258 ?",
      choix: ["Une vingtaine de jours", "Trois ans", "Une seule nuit", "Six mois"],
      reponse: "Une vingtaine de jours",
      explication: "Le siège dure du 20 janvier au 10 février 1258, soit vingt jours. La plus grande ville du monde musulman tombe en trois semaines.",
      source: T("Bagdad", U_BAGDAD) },
    { id: "histoire-s04-1-q63", fiche: "histoire-s04-1-f8", type: "vrai_faux", niveau: 2,
      enonce: "Après 1258, le titre de calife abbasside disparaît pour toujours.",
      corrections: ["Faux : un calife abbasside est rétabli au Caire en 1261, sans pouvoir réel ; le califat de Bagdad, lui, a bien pris fin.", "Faux : les Mongols rétablissent eux-mêmes un calife à Bagdad dès 1260.", "Faux : le califat continue à Cordoue jusqu'en 1492."],
      reponse: { vrai: false, correction: "Faux : un calife abbasside est rétabli au Caire en 1261, sans pouvoir réel ; le califat de Bagdad, lui, a bien pris fin." },
      explication: "En 1261, le sultan mamelouk Baybars installe un calife abbasside au Caire. Il n'a plus de pouvoir, et le califat de Bagdad n'existe plus.",
      source: T("Califat abbasside", U_ABBASSIDE) },
    { id: "histoire-s04-1-q64", fiche: "histoire-s04-1-f8", type: "ordre", niveau: 2,
      enonce: "Range ces moments de l'histoire de Bagdad du plus ancien au plus récent.",
      elements: ["Les Seldjoukides maîtres de Bagdad", "Fondation de Bagdad", "Les Mongols prennent Bagdad", "Les Bouyides maîtres de Bagdad"],
      reponse: [1, 3, 0, 2],
      explication: "762 : fondation ; 945 : les Bouyides ; 1055 : les Seldjoukides ; 1258 : les Mongols.",
      source: T("Bagdad", U_BAGDAD) },
    { id: "histoire-s04-1-q65", fiche: "histoire-s04-1-f8", type: "qcm", niveau: 3,
      enonce: "Que deviennent les livres de la Maison de la sagesse en 1258 ?",
      choix: ["Ils sont jetés dans le Tigre, dont l'eau, dit-on, devient noire d'encre", "Ils sont emportés à Constantinople par les Byzantins, alliés des Mongols", "Ils sont vendus à Cordoue", "Ils sont sauvés par le calife"],
      reponse: "Ils sont jetés dans le Tigre, dont l'eau, dit-on, devient noire d'encre",
      explication: "La Maison de la sagesse est pillée et ses livres jetés dans le fleuve : on raconte que le Tigre était noir d'encre. Le calife, lui, est tué.",
      source: T("Bagdad", U_BAGDAD) },
    { id: "histoire-s04-1-q66", fiche: "histoire-s04-1-f8", type: "qcm", niveau: 3,
      enonce: "Quel autre grand empire étudié cette année tombe aussi devant une armée venue d'Asie, deux siècles après Bagdad ?",
      choix: ["L'Empire byzantin, pris par les Ottomans en 1453", "L'Empire carolingien, partagé entre les trois petits-fils de Charlemagne en 843", "Le califat de Cordoue, en 1031", "L'Empire romain d'Occident, en 476"],
      reponse: "L'Empire byzantin, pris par les Ottomans en 1453",
      explication: "Bagdad tombe en 1258 devant les Mongols, Constantinople en 1453 devant les Ottomans, venus d'Anatolie. L'Empire carolingien, lui, se divise de l'intérieur en 843.",
      source: T("Empire byzantin", U_BYZ) },
    { id: "histoire-s04-1-q67", fiche: "histoire-s04-1-f8", type: "trou", niveau: 1,
      enonce: "Complète la phrase.",
      texte: "En ___, les Mongols de ___ prennent Bagdad.",
      banque: ["1258", "Houlagou", "1453", "Mehmed"],
      reponse: [["1258"], ["Houlagou"]],
      explication: "Les Mongols de Houlagou prennent Bagdad en 1258. Mehmed II et 1453, c'est Constantinople.",
      source: T("Bagdad", U_BAGDAD) }
  ],
  bonus: [
    {
      id: "histoire-s04-1-b1",
      fiche: "histoire-s04-1-f6",
      titre: "Quand Bagdad perd son rang",
      texte: "Entre le VIIIe et le IXe siècle, Bagdad est sans doute la première ville du monde à dépasser le million d'habitants. Mais le calife al-Mu'tasim déplace la capitale à Samarra, et la cour ne revient à Bagdad qu'en 892. Au Xe siècle, c'est probablement Cordoue, la capitale d'Al-Andalus, qui lui ravit le rang de ville la plus peuplée du monde musulman.",
      source: { titre: "Bagdad", editeur: "Wikipédia, l'encyclopédie libre", url: U_BAGDAD }
    },
    {
      id: "histoire-s04-1-b2",
      fiche: "histoire-s04-1-f6",
      titre: "Haroun al-Rachid, le calife des Mille et Une Nuits",
      texte: "Haroun al-Rachid, cinquième calife abbasside, règne de 786 à 809. Il impose l'usage du papier dans toutes les administrations de l'empire et envoie un éléphant blanc à Charlemagne. Des siècles plus tard, les contes des Mille et Une Nuits le mettent en scène avec son vizir Ja'far, dans les rues de Bagdad.",
      source: { titre: "Haroun ar-Rachid", editeur: "Wikipédia, l'encyclopédie libre", url: U_HAROUN }
    }
  ],
  nonCouvert: [
    "Les mots importants des pages 1 et 4 (calife, califat, dynastie, émirat…) : les cadres sont vides ; le calife est traité dans histoire-s03-1.",
    "Les noms des régions des deux empires : les cartes n'ont ni légende ni nom de région, sauf Al Andalus et quatre villes.",
    "Les réponses écrites aux trois questions sur le texte du ramadan et les notes de la page 3, prises pendant la vidéo.",
    "Les croyances et les pratiques de l'islam : hors jeu (règle sur la religion) ; le texte du Coran n'est traité que comme document (langue, date, découpage, calendrier).",
    "Le devoir d'entraînement des pages 6 et 7 (cinq piliers, « Serviteur », carte à compléter) sert seulement à délimiter le cours : rien n'en est tiré.",
    "La vie quotidienne à Bagdad (quartiers, marchés, maisons) et la société de l'empire (paysans, esclaves, marchands).",
    "Les autres grands savants du monde musulman (Avicenne, Averroès) et la médecine ; les hôpitaux.",
    "Le déroulement du siège de 1258 et le nombre de victimes : les estimations divergent trop pour être données."
  ]
};
