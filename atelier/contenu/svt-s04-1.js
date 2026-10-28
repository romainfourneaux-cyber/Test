// Source en clair du cours svt-s04-1 (livret 1, chapitre 2, séance 2 : les mouvements des vents et des courants).
// Compilé (réponses brouillées) par node atelier/outils/compiler-cours.js svt-s04-1.
// Sources déposées : le corrigé du livret 1 (p. 8 : schéma de la circulation thermohaline et diagramme
// ombrothermique de Palerme) et les ressources complémentaires (p. 4 : simulation des courants chauds et froids ;
// p. 5 : simulation des courants salés). La leçon (vidéo) n'est pas déposée : ce qu'elle apporterait sur les vents
// et sur les courants de surface va dans nonCouvert. Les photos des montages ne sont pas reprises ; le schéma et le
// diagramme sont redessinés en SVG. Le « 35 % » de sel noté sur les ressources (p. 5) n'est pas repris (à vérifier).
const C = (page) => ({ fichier: "cours/svt/Cours Griffon 5eme SVT Livret 1 - Corriges.pdf", page: page });
const R = (page) => ({ fichier: "cours/svt/Cours Griffon 5eme SVT Livret 1 - Ressources complementaires.pdf", page: page });
// Questions de thème (règle du 25/10/2026) : fait vérifié dans une source fiable, notée sans fichier ni page.
// La leçon (vidéo) n'est pas déposée : les deux fiches de simulation gardent leur conclusion et prennent des questions de thème (audit du 28/10/2026).
const T = (titre, url) => ({ theme: "Séance 2 – Les mouvements des vents et des courants", titre, editeur: "Wikipédia", url });

// Boucle de la circulation thermohaline, redessinée.
function schemaBoucle() {
  const encre = "#2e2419";
  let s = "<svg viewBox='0 0 720 330' xmlns='http://www.w3.org/2000/svg' font-family='Georgia,serif' font-size='13'>";
  // quatre côtés de la boucle
  s += "<path d='M230 80 H500' stroke='#d9463b' stroke-width='26' fill='none' stroke-linecap='round'/>";
  s += "<path d='M530 110 V230' stroke='#7b3fa0' stroke-width='26' fill='none' stroke-linecap='round'/>";
  s += "<path d='M500 260 H230' stroke='#1f3b78' stroke-width='26' fill='none' stroke-linecap='round'/>";
  s += "<path d='M200 230 V110' stroke='#9a62b8' stroke-width='26' fill='none' stroke-linecap='round'/>";
  // coins
  s += "<path d='M500 80 Q530 80 530 110' stroke='#a8408a' stroke-width='26' fill='none'/>";
  s += "<path d='M530 230 Q530 260 500 260' stroke='#4b3a8c' stroke-width='26' fill='none'/>";
  s += "<path d='M230 260 Q200 260 200 230' stroke='#5f4e9c' stroke-width='26' fill='none'/>";
  s += "<path d='M200 110 Q200 80 230 80' stroke='#c04a6a' stroke-width='26' fill='none'/>";
  // flèches blanches : sens du courant
  s += "<g fill='#fff'><path d='M350 70 l22 10 -22 10z'/><path d='M520 160 l10 22 10 -22z'/><path d='M390 250 l-22 10 22 10z'/><path d='M190 180 l10 -22 10 22z'/></g>";
  // étiquettes
  s += "<g fill='" + encre + "'>";
  s += "<text x='365' y='48' text-anchor='middle' fill='#b2322a' font-weight='bold'>Surface : eau chaude et peu salée</text>";
  s += "<text x='365' y='300' text-anchor='middle' fill='#1f3b78' font-weight='bold'>Fond : eau froide et très salée</text>";
  s += "<text x='556' y='160' fill='#5a2d78'>Courant descendant :</text><text x='556' y='178' fill='#5a2d78'>plus froid, plus salé</text>";
  s += "<text x='176' y='160' text-anchor='end' fill='#5a2d78'>Courant ascendant :</text><text x='176' y='178' text-anchor='end' fill='#5a2d78'>plus chaud, moins salé</text>";
  s += "</g>";
  // flèche de la profondeur
  s += "<line x1='700' y1='70' x2='700' y2='270' stroke='" + encre + "' stroke-width='2'/><path d='M694 262 l6 14 6 -14z' fill='" + encre + "'/>";
  s += "<text x='712' y='112' fill='" + encre + "' font-size='11' transform='rotate(90 712 112)'>vers la profondeur</text>";
  return s + "</svg>";
}

// Diagramme ombrothermique de Palerme, redessiné d'après la lecture du corrigé (valeurs approchées).
function schemaPalerme() {
  const encre = "#2e2419";
  const mois = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
  const P = [70, 64, 57, 43, 23, 10, 4, 10, 40, 88, 92, 88];
  const Tmax = [14, 13.5, 15, 18, 23, 27, 29.5, 30, 27, 23.5, 20.5, 15];
  const Tmin = [7.5, 7, 9, 11, 15, 18.5, 20.5, 22, 16.5, 16.5, 14.5, 9];
  const X0 = 60, X1 = 460, Y0 = 250, H = 180;
  const x = i => X0 + 15 + i * (X1 - X0) / 12;
  const yT = t => Y0 - t / 50 * H, yP = p => Y0 - p / 100 * H;
  let s = "<svg viewBox='0 0 540 300' xmlns='http://www.w3.org/2000/svg' font-family='Georgia,serif' font-size='11'>";
  s += "<text x='270' y='18' text-anchor='middle' font-size='13' font-weight='bold' fill='" + encre + "'>Palerme : climat méditerranéen</text>";
  for (let i = 0; i < 12; i++) {
    s += "<rect x='" + (x(i) - 9) + "' y='" + yP(P[i]) + "' width='18' height='" + (Y0 - yP(P[i])) + "' fill='#5fb6e6'/>";
    s += "<text x='" + x(i) + "' y='" + (Y0 + 16) + "' text-anchor='middle' fill='" + encre + "'>" + mois[i] + "</text>";
  }
  const ligne = (T, couleur) => "<polyline fill='none' stroke='" + couleur + "' stroke-width='2' points='" + T.map((t, i) => x(i) + "," + yT(t)).join(" ") + "'/>";
  s += ligne(Tmax, "#d9463b") + ligne(Tmin, "#1f3b78");
  s += "<line x1='" + X0 + "' y1='" + Y0 + "' x2='" + X1 + "' y2='" + Y0 + "' stroke='" + encre + "'/>";
  s += "<line x1='" + X0 + "' y1='" + Y0 + "' x2='" + X0 + "' y2='" + (Y0 - H - 10) + "' stroke='#d9463b'/>";
  s += "<line x1='" + X1 + "' y1='" + Y0 + "' x2='" + X1 + "' y2='" + (Y0 - H - 10) + "' stroke='#1f3b78'/>";
  for (let t = 0; t <= 50; t += 10) {
    s += "<text x='" + (X0 - 6) + "' y='" + (yT(t) + 4) + "' text-anchor='end' fill='#d9463b'>" + t + "</text>";
    s += "<text x='" + (X1 + 6) + "' y='" + (yP(t * 2) + 4) + "' fill='#1f3b78'>" + (t * 2) + "</text>";
  }
  s += "<text x='" + X0 + "' y='" + (Y0 - H - 18) + "' fill='#d9463b'>°C</text><text x='" + (X1 - 10) + "' y='" + (Y0 - H - 18) + "' fill='#1f3b78'>mm</text>";
  s += "<g font-size='10'><rect x='180' y='40' width='12' height='8' fill='#5fb6e6'/><text x='196' y='48' fill='" + encre + "'>précipitations</text>";
  s += "<line x1='180' y1='62' x2='192' y2='62' stroke='#d9463b' stroke-width='2'/><text x='196' y='65' fill='" + encre + "'>températures maximales</text>";
  s += "<line x1='180' y1='76' x2='192' y2='76' stroke='#1f3b78' stroke-width='2'/><text x='196' y='79' fill='" + encre + "'>températures minimales</text></g>";
  return s + "</svg>";
}

module.exports = {
  id: "svt-s04-1",
  fiches: [
    {
      id: "svt-s04-1-f1", notion: "La circulation thermohaline",
      titre: "Un grand circuit entre la surface et le fond des océans",
      texte: "L'eau des océans circule en boucle. En surface, elle est chaude et peu salée. Quand elle devient plus froide et plus salée, elle plonge : c'est le courant descendant. Au fond, l'eau froide et très salée repart dans l'autre sens. Puis un courant ascendant, plus chaud et moins salé, la ramène vers la surface. Ce circuit s'appelle la circulation thermohaline.",
      pointsCles: [
        "Surface : eau chaude et peu salée",
        "Courant descendant : plus froid, plus salé",
        "Fond des océans : eau froide et très salée",
        "Courant ascendant : plus chaud, moins salé",
        "Le circuit forme une boucle fermée"
      ],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "circulation thermohaline", def: "le grand circuit de l'eau des océans entre la surface et les profondeurs, lié à sa température et à son sel" },
        { mot: "courant descendant", def: "l'eau plus froide et plus salée qui plonge de la surface vers le fond" },
        { mot: "courant ascendant", def: "l'eau plus chaude et moins salée qui remonte du fond vers la surface" }
      ],
      schema: "svt-s04-1-s1", prerequis: ["svt-s03-1-f4"], source: C(8)
    },
    {
      id: "svt-s04-1-f2", notion: "Simuler les courants chauds et froids",
      titre: "Un bac d'eau chaude, un bac de glaçons",
      texte: "Un circuit de tubes transparents est rempli d'eau. D'un côté, un bac d'eau chaude ; de l'autre, un bac de glaçons. On ajoute du colorant rouge côté chaud, du bleu côté froid. L'eau rouge monte et circule par le tube du haut ; l'eau bleue descend et passe par le tube du bas. Après un quart d'heure, tout est mélangé.",
      pointsCles: [
        "Côté chaud : colorant rouge ; côté froid (glaçons) : colorant bleu",
        "Le courant chaud circule en haut, le courant froid en bas",
        "Au bout de quelques minutes, les eaux commencent à se mélanger là où les tubes se rejoignent",
        "Après environ un quart d'heure, le mélange est homogène"
      ],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "simulation", def: "une expérience qui imite en petit un phénomène réel pour le comprendre" },
        { mot: "homogène", def: "pareil partout, sans zone différente des autres" }
      ],
      schema: null, prerequis: ["svt-s04-1-f1"], source: R(4)
    },
    {
      id: "svt-s04-1-f3", notion: "Simuler un courant d'eau salée",
      titre: "L'eau salée descend",
      texte: "Dans le même circuit de tubes, les bacs restent vides : cette fois, la température ne compte pas. On verse dans un tube vertical de l'eau très salée, colorée en bleu. Elle rejoint l'autre tube par le tube horizontal le plus bas. Après quelques minutes, elle occupe la partie basse des tubes verticaux : l'eau salée descend.",
      pointsCles: [
        "Bacs vides : seule la quantité de sel entre en jeu",
        "L'eau salée colorée passe par le tube horizontal du bas",
        "Elle finit dans la partie basse des tubes verticaux",
        "Froid et sel font descendre l'eau : c'est la base de la circulation thermohaline"
      ],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "eau salée", def: "de l'eau dans laquelle du sel est dissous, comme l'eau de mer" }
      ],
      schema: null, prerequis: ["svt-s04-1-f2"], source: R(5)
    },
    {
      id: "svt-s04-1-f4", notion: "Le diagramme ombrothermique de Palerme",
      titre: "Palerme : un climat méditerranéen",
      texte: "Le diagramme ombrothermique de Palerme montre les précipitations de chaque mois (barres bleues) et deux courbes : températures maximales en rouge, minimales en bleu. L'été est chaud et presque sans pluie : les maximales approchent 30 °C en juillet et en août. L'automne et l'hiver sont doux et pluvieux ; octobre, novembre et décembre sont les plus arrosés. Climat méditerranéen.",
      pointsCles: [
        "Barres : précipitations ; courbes : températures maximales (rouge) et minimales (bleu)",
        "Été chaud et sec : juin, juillet, août presque sans pluie",
        "Mois les plus pluvieux : octobre, novembre, décembre",
        "Hiver doux : les minimales restent au-dessus de 5 °C",
        "Climat méditerranéen"
      ],
      dates: [], lieux: ["Palerme"], personnages: [],
      vocabulaire: [
        { mot: "climat méditerranéen", def: "un climat à été chaud et sec et à hiver doux et pluvieux, comme à Palerme" },
        { mot: "températures maximales", def: "les températures les plus hautes relevées, ici pour chaque mois" }
      ],
      schema: "svt-s04-1-s2", prerequis: ["methode-ombrothermique-f1"], source: C(8)
    }
  ],
  schemas: [
    { id: "svt-s04-1-s1", legende: "La boucle de la circulation thermohaline : en surface vers la droite, au fond vers la gauche (schéma redessiné).", svg: schemaBoucle() },
    { id: "svt-s04-1-s2", legende: "Le diagramme ombrothermique de Palerme, redessiné avec des valeurs approchées.", svg: schemaPalerme() }
  ],
  questions: [
    // f1 : la circulation thermohaline
    { id: "svt-s04-1-q1", fiche: "svt-s04-1-f1", type: "qcm", niveau: 1,
      enonce: "Dans la circulation thermohaline, comment est l'eau qui circule en surface ?",
      choix: ["Chaude et peu salée", "Froide et très salée", "Chaude et très salée", "Froide et peu salée"],
      reponse: "Chaude et peu salée",
      explication: "En surface, l'eau est chaude et peu salée. C'est au fond qu'elle est froide et très salée.", source: C(8) },
    { id: "svt-s04-1-q2", fiche: "svt-s04-1-f1", type: "qcm", niveau: 1,
      enonce: "Au fond des océans, comment est l'eau qui circule ?",
      choix: ["Froide et très salée", "Chaude et peu salée", "Tiède et sans sel", "Chaude et très salée"],
      reponse: "Froide et très salée",
      explication: "Au fond, l'eau est froide et très salée. Elle repart en sens inverse de l'eau de surface.", source: C(8) },
    { id: "svt-s04-1-q3", fiche: "svt-s04-1-f1", type: "vrai_faux", niveau: 2,
      enonce: "Le courant descendant est formé d'une eau plus froide et plus salée que l'eau de surface.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : l'eau de surface se refroidit et devient plus salée, puis elle plonge. C'est le courant descendant.", source: C(8) },
    { id: "svt-s04-1-q4", fiche: "svt-s04-1-f1", type: "vrai_faux", niveau: 2,
      enonce: "Le courant ascendant ramène vers la surface une eau plus froide et plus salée.",
      corrections: ["Faux : le courant ascendant est plus chaud et moins salé que l'eau du fond.", "Faux : le courant ascendant n'existe que dans les mers chaudes.", "Faux : le courant ascendant circule au fond des océans."],
      reponse: { vrai: false, correction: "Faux : le courant ascendant est plus chaud et moins salé que l'eau du fond." },
      explication: "Le courant ascendant remonte vers la surface : il est plus chaud et moins salé. C'est le courant descendant qui est plus froid et plus salé.", source: C(8) },
    { id: "svt-s04-1-q5", fiche: "svt-s04-1-f1", type: "ordre", niveau: 2,
      enonce: "Remets dans l'ordre les étapes du circuit de l'eau, en partant de la surface.",
      elements: ["L'eau froide et très salée circule au fond", "L'eau chaude et peu salée circule en surface", "Le courant descendant plonge vers le fond", "Le courant ascendant remonte vers la surface"],
      reponse: [1, 2, 0, 3],
      explication: "Surface, plongée, fond, remontée : la boucle recommence ensuite. L'eau change de température et de sel en chemin.", source: C(8) },
    { id: "svt-s04-1-q6", fiche: "svt-s04-1-f1", type: "qcm", niveau: 2,
      enonce: "Comment appelle-t-on ce grand circuit de l'eau des océans entre la surface et les profondeurs ?",
      choix: ["La circulation thermohaline", "La convection de l'air", "Une perturbation", "La force de Coriolis"],
      reponse: "La circulation thermohaline",
      explication: "C'est la circulation thermohaline. La convection et la force de Coriolis concernent les déplacements de l'air.", source: C(8) },
    { id: "svt-s04-1-q7", fiche: "svt-s04-1-f1", type: "qcm_multiple", niveau: 2,
      enonce: "Quelles qualités de l'eau changent le long du circuit thermohaline ? (plusieurs réponses)",
      choix: ["Sa température", "Sa quantité de sel", "Sa couleur", "Son altitude au-dessus de la mer", "Son acidité"],
      reponse: ["Sa température", "Sa quantité de sel"],
      explication: "L'eau passe de chaude et peu salée à froide et très salée, puis l'inverse. Température et sel sont les deux moteurs du circuit.", source: C(8) },
    { id: "svt-s04-1-q8", fiche: "svt-s04-1-f1", type: "qcm", niveau: 3,
      enonce: "Pourquoi dit-on que la circulation thermohaline forme une boucle ?",
      choix: ["L'eau qui a plongé remonte plus loin et repart en surface", "Les océans ont une forme ronde", "Les courants s'arrêtent aux pôles", "L'eau de surface s'évapore puis retombe en pluie au même endroit"],
      reponse: "L'eau qui a plongé remonte plus loin et repart en surface",
      explication: "L'eau qui descend au fond finit par remonter grâce au courant ascendant. Elle recommence alors le même trajet en surface.", source: C(8) },
    // f2 : simuler les courants chauds et froids
    { id: "svt-s04-1-q9", fiche: "svt-s04-1-f2", type: "qcm", niveau: 1,
      enonce: "Qu'est-ce qu'un courant marin ?",
      choix: ["Un grand déplacement d'eau de mer, en surface ou en profondeur", "Une vague qui se brise sur la plage", "La marée qui monte et qui descend deux fois par jour sur les côtes", "Un fleuve qui se jette dans la mer"],
      reponse: "Un grand déplacement d'eau de mer, en surface ou en profondeur",
      explication: "Un courant marin est comme une rivière dans l'océan : une grande masse d'eau qui se déplace. Il peut couler en surface, poussé par le vent, ou en profondeur.",
      source: T("Courant marin", "https://fr.wikipedia.org/wiki/Courant_marin") },
    { id: "svt-s04-1-q10", fiche: "svt-s04-1-f2", type: "qcm", niveau: 2,
      enonce: "Comment s'appelle le grand courant chaud qui part du golfe du Mexique et remonte l'Atlantique Nord ?",
      choix: ["Le Gulf Stream", "Le courant du Labrador", "Le courant de Humboldt", "Le courant circumpolaire"],
      reponse: "Le Gulf Stream",
      explication: "Le Gulf Stream naît près de la Floride et longe la côte des États-Unis avant de traverser l'Atlantique. On lui attribue souvent une part de la douceur des hivers de l'ouest de l'Europe.",
      source: T("Gulf Stream", "https://fr.wikipedia.org/wiki/Gulf_Stream") },
    { id: "svt-s04-1-q11", fiche: "svt-s04-1-f2", type: "vrai_faux", niveau: 2,
      enonce: "Quand de l'eau chaude et de l'eau froide se rencontrent, l'eau chaude circule au-dessus et l'eau froide en dessous.",
      corrections: [],
      reponse: { vrai: true, correction: null },
      explication: "Le courant chaud monte et circule en haut, le courant froid descend et circule en bas. C'est ce que montre la simulation avec un bac d'eau chaude et un bac de glaçons.", source: R(4) },
    { id: "svt-s04-1-q13", fiche: "svt-s04-1-f2", type: "qcm", niveau: 2,
      enonce: "Que fait l'eau chaude quand elle est au contact d'une eau plus froide ?",
      choix: ["Elle monte et circule au-dessus", "Elle descend et circule au fond", "Elle reste immobile sans bouger", "Elle se transforme aussitôt en glace"],
      reponse: "Elle monte et circule au-dessus",
      explication: "L'eau chaude monte et circule au-dessus de l'eau froide. L'eau froide, elle, descend.", source: R(4) },
    { id: "svt-s04-1-q15", fiche: "svt-s04-1-f2", type: "qcm", niveau: 3,
      enonce: "À quoi sert une simulation avec un bac d'eau chaude et un bac de glaçons ?",
      choix: ["À montrer qu'un écart de température fait circuler l'eau", "À mesurer la température des océans", "À fabriquer de l'eau salée", "À montrer que l'eau chaude gèle plus vite que l'eau froide"],
      reponse: "À montrer qu'un écart de température fait circuler l'eau",
      explication: "Le chaud monte, le froid descend : l'écart de température crée un courant. C'est ce qui se passe en grand dans les océans.", source: R(4) },
    // f3 : simuler un courant d'eau salée
    { id: "svt-s04-1-q17", fiche: "svt-s04-1-f3", type: "qcm", niveau: 2,
      enonce: "Où l'eau de surface plonge-t-elle vers les profondeurs pour alimenter la circulation thermohaline ?",
      choix: ["Près des pôles, où elle devient froide et très salée", "À l'équateur, là où elle est la plus chaude", "Dans la Méditerranée, une mer presque fermée", "À l'embouchure des grands fleuves, là où l'eau de mer devient douce"],
      reponse: "Près des pôles, où elle devient froide et très salée",
      explication: "Dans l'Atlantique Nord, près du Groenland et de la Norvège, l'eau de surface se refroidit et se charge en sel. Devenue plus lourde, elle coule vers le fond et repart vers le sud.",
      source: T("Circulation thermohaline", "https://fr.wikipedia.org/wiki/Circulation_thermohaline") },
    { id: "svt-s04-1-q18", fiche: "svt-s04-1-f3", type: "vrai_faux", niveau: 2,
      enonce: "L'eau froide et très salée plonge parce qu'elle est plus dense, donc plus lourde, que l'eau chaude et peu salée.",
      corrections: [],
      reponse: { vrai: true, correction: null },
      explication: "Plus l'eau est froide et salée, plus elle est dense. C'est ce qui la fait couler sous l'eau chaude et peu salée de la surface.",
      source: T("Circulation thermohaline", "https://fr.wikipedia.org/wiki/Circulation_thermohaline") },
    { id: "svt-s04-1-q20", fiche: "svt-s04-1-f3", type: "vrai_faux", niveau: 2,
      enonce: "De l'eau très salée versée dans de l'eau moins salée flotte au-dessus.",
      corrections: ["Faux : elle descend en dessous, parce qu'elle est plus lourde.", "Faux : elle se mélange tout de suite, sans monter ni descendre.", "Faux : elle reste au milieu, entre la surface et le fond."],
      reponse: { vrai: false, correction: "Faux : elle descend en dessous, parce qu'elle est plus lourde." },
      explication: "L'eau très salée descend sous l'eau moins salée. C'est ce que montre la simulation avec les tubes : après quelques minutes, elle occupe le bas.", source: R(5) },
    { id: "svt-s04-1-q21", fiche: "svt-s04-1-f3", type: "qcm", niveau: 3,
      enonce: "Que fait de l'eau très salée versée dans de l'eau moins salée ?",
      choix: ["Elle descend sous l'eau moins salée", "Elle monte au-dessus de l'eau moins salée", "Elle se réchauffe toute seule", "Elle ne se mélange jamais avec l'eau douce"],
      reponse: "Elle descend sous l'eau moins salée",
      explication: "L'eau très salée plonge sous l'eau moins salée. C'est pour cela que l'eau du fond des océans est très salée.", source: R(5) },
    { id: "svt-s04-1-q22", fiche: "svt-s04-1-f3", type: "qcm_multiple", niveau: 3,
      enonce: "Comment le froid et le sel font-ils circuler l'eau des océans ? (plusieurs réponses)",
      choix: ["L'eau froide descend", "L'eau salée descend", "L'eau chaude monte", "L'eau salée monte", "L'eau froide monte"],
      reponse: ["L'eau froide descend", "L'eau salée descend", "L'eau chaude monte"],
      explication: "Le froid et le sel font plonger l'eau, la chaleur la fait monter. Dans l'océan, les deux agissent ensemble.", source: R(5) },
    // f4 : le diagramme ombrothermique de Palerme
    { id: "svt-s04-1-q24", fiche: "svt-s04-1-f4", type: "qcm", niveau: 1,
      enonce: "Quel climat le diagramme ombrothermique de Palerme illustre-t-il ?",
      choix: ["Le climat méditerranéen", "Le climat tropical", "Le climat polaire", "Le climat de haute montagne"],
      reponse: "Le climat méditerranéen",
      explication: "Palerme a un climat méditerranéen. Son été est chaud et sec, son hiver doux et pluvieux.", source: C(8) },
    { id: "svt-s04-1-q25", fiche: "svt-s04-1-f4", type: "qcm", niveau: 1,
      enonce: "Sur un diagramme ombrothermique, que représentent les barres ?",
      choix: ["Les précipitations de chaque mois", "Les températures les plus hautes de chaque mois", "Les températures les plus basses", "La durée du jour"],
      reponse: "Les précipitations de chaque mois",
      explication: "Les barres donnent les précipitations de chaque mois. Les températures sont dessinées par des courbes.", source: C(8) },
    { id: "svt-s04-1-q26", fiche: "svt-s04-1-f4", type: "vrai_faux", niveau: 2,
      enonce: "À Palerme, les mois les moins arrosés sont ceux de l'été, de juin à août.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : en juin, juillet et août, les barres sont presque nulles. L'été méditerranéen est sec.", source: C(8) },
    { id: "svt-s04-1-q27", fiche: "svt-s04-1-f4", type: "vrai_faux", niveau: 2,
      enonce: "À Palerme, c'est en hiver qu'il fait le plus chaud.",
      corrections: ["Faux : les températures les plus hautes sont en juillet et en août.", "Faux : il fait aussi chaud toute l'année à Palerme.", "Faux : le mois le plus chaud est octobre."],
      reponse: { vrai: false, correction: "Faux : les températures les plus hautes sont en juillet et en août." },
      explication: "Les deux courbes sont au plus haut en juillet et en août. L'hiver est doux, mais c'est la saison la plus fraîche.", source: C(8) },
    { id: "svt-s04-1-q29", fiche: "svt-s04-1-f4", type: "qcm", niveau: 2,
      enonce: "Quels mois sont les plus pluvieux à Palerme ?",
      choix: ["Octobre, novembre et décembre", "Juin, juillet et août", "Mars, avril et mai, au printemps", "Janvier seulement"],
      reponse: "Octobre, novembre et décembre",
      explication: "Les barres les plus hautes sont celles d'octobre, de novembre et de décembre. L'automne et le début de l'hiver sont pluvieux.", source: C(8) },
    { id: "svt-s04-1-q30", fiche: "svt-s04-1-f4", type: "qcm", niveau: 3,
      enonce: "Comment résumer le climat méditerranéen d'après le diagramme de Palerme ?",
      choix: ["Été chaud et sec, hiver doux et pluvieux", "Été frais et pluvieux, hiver glacial", "Deux saisons, une sèche et une très humide, chaudes toutes les deux", "Des pluies égales toute l'année"],
      reponse: "Été chaud et sec, hiver doux et pluvieux",
      explication: "L'été est chaud et presque sans pluie, l'hiver doux et arrosé. C'est la marque du climat méditerranéen.", source: C(8) },
    { id: "svt-s04-1-q32", fiche: "svt-s04-1-f4", type: "qcm_multiple", niveau: 2,
      enonce: "Que lit-on sur un diagramme ombrothermique comme celui de Palerme ? (plusieurs réponses)",
      choix: ["Les précipitations de chaque mois", "Les températures de chaque mois", "La vitesse du vent", "La pression atmosphérique", "Le nom du climat, dans le titre"],
      reponse: ["Les précipitations de chaque mois", "Les températures de chaque mois", "Le nom du climat, dans le titre"],
      explication: "Un diagramme ombrothermique croise pluies et températures mois par mois. Ici, le titre précise aussi le climat.", source: C(8) },
    { id: "svt-s04-1-q33", fiche: "svt-s04-1-f2", type: "qcm", niveau: 3,
      enonce: "Pourquoi les courants marins comptent-ils pour le climat ?",
      choix: ["Ils transportent de la chaleur vers les régions froides", "Ils font tourner la Terre un peu plus vite", "Ils provoquent les marées sur toutes les côtes", "Ils empêchent la pluie de tomber au-dessus des océans et des côtes"],
      reponse: "Ils transportent de la chaleur vers les régions froides",
      explication: "Les courants chauds emportent vers les pôles la chaleur reçue près de l'équateur. L'océan en transporte autant que l'atmosphère, ce qui adoucit le climat de certaines régions.",
      source: T("Courant marin", "https://fr.wikipedia.org/wiki/Courant_marin") }
  ],
  bonus: [
    {
      id: "svt-s04-1-b1", fiche: "svt-s04-1-f1",
      titre: "Le Gulf Stream, un fleuve dans l'océan",
      texte: "Le Gulf Stream est un courant chaud de surface de l'océan Atlantique. Il naît entre la Floride et les Bahamas, longe la côte est des États-Unis, puis se disperse au large de la Nouvelle-Écosse et de Terre-Neuve. Il emporte vers le nord des eaux tropicales à environ 25 °C et avance à près de 9 km/h. On a longtemps cru qu'il adoucissait les hivers d'Europe ; les scientifiques pensent aujourd'hui que les vents et la géographie comptent davantage.",
      source: { titre: "Gulf Stream", editeur: "Wikipédia, l'encyclopédie libre", url: "https://fr.wikipedia.org/wiki/Gulf_Stream" }
    }
  ],
  nonCouvert: [
    "La leçon de la séance 2 (vidéo) n'est pas déposée : ce qu'elle dit des vents et des courants de surface n'est pas dans le jeu ; seuls le schéma de la circulation thermohaline, les deux simulations et le diagramme de Palerme le sont.",
    "Pourquoi l'eau de surface devient plus froide et plus salée avant de plonger : rien dans les fichiers déposés.",
    "La proportion de sel de l'eau de mer : les ressources (p. 5) notent « 35 % », valeur à faire vérifier avant de la mettre dans le jeu.",
    "Les valeurs exactes du diagramme de Palerme : elles sont lues sur le graphique, sans tableau ; le schéma du jeu reprend des valeurs approchées."
  ]
};
