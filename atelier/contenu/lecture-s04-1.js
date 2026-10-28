// Source en clair du cours lecture-s04-1 « Un hivernage dans les glaces – chapitres 5 et 6 ».
// Compilé (réponses brouillées) par node atelier/outils/compiler-cours.js lecture-s04-1.
// Seule source : la liste de vocabulaire du livre. Elle ne dit pas à quel chapitre appartient chaque mot :
// ce cours prend les animaux de l'Arctique (page 4 de la liste). Aucune question sur l'intrigue.
// Anti-spoil (devoir lecture-d1) : rien sur le titre, l'auteur, les personnages, le cadre du récit ni les épreuves
// de l'équipage ; les quatre mots du schéma de navire du devoir n'apparaissent nulle part.
// Relu le 2026-10-24 : définitions vérifiées une à une contre la page 4 de la liste (texte et page rendue en image).
// Seconde relecture indépendante le 2026-10-24 : fidélité à la liste, bonus revérifiés en ligne, anti-spoil.
const F = "cours/lecture/Vocabulaire 5e - Un hivernage dans les glaces.pdf";
const S = p => ({ fichier: F, page: p });
// Audit des questions du 28/10/2026 appliqué : q3, q8, q13, q16 (doublons), q11, q26, q28, q37, q38, q39 (tailles, poids,
// détails de légende) supprimées ; q9 retouchée, q15 réécrite ; q21 (harfang et lemming), q34, q35, q36 (loup arctique
// et bœuf musqué) devenues questions de thème : les fiches f3 et f5 ne sont que deux phrases de la liste, presque en chiffres.
const THEME = "Un hivernage dans les glaces – Lire les chapitres 5 et 6 p55 à 67"; // intitulé du planning, pour les questions de thème (règle du 25/10/2026)
const T = (titre, page) => ({ theme: THEME, titre, editeur: "Wikipédia", url: "https://fr.wikipedia.org/wiki/" + page });
// Seconde relecture du 28/10/2026 (vérification des questions de thème et des cours minces) : leurres de q4, q34 et q35 remplacés ; q15 devient un trou sur les animaux de l'océan Arctique (q9 et q10 posaient déjà « le pingouin vole ») ; q20 reformulée.

module.exports = {
  id: "lecture-s04-1",
  fiches: [
    {
      id: "lecture-s04-1-f1", notion: "L'ours polaire et les pinnipèdes",
      titre: "L'ours polaire, le phoque et l'otarie",
      texte: "Dans l'Arctique, l'ours polaire chasse les phoques et les morses. Ces deux proies font partie des pinnipèdes, une famille qui réunit le morse, l'otarie, le phoque, le lion de mer et l'éléphant de mer. Pour distinguer un phoque d'une otarie, regarde la tête : les oreilles de l'otarie se voient, celles du phoque non.",
      pointsCles: ["L'ours polaire chasse les phoques et les morses", "Pinnipèdes : morse, otarie, phoque, lion de mer, éléphant de mer", "Le phoque n'a pas d'oreilles visibles ; l'otarie, si"],
      astuce: "Otarie : on voit ses oreilles. Phoque : pas d'oreilles visibles.",
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "ours polaire", def: "le grand ours de l'Arctique, qui chasse les phoques et les morses" },
        { mot: "pinnipèdes", def: "la famille du morse, de l'otarie, du phoque, du lion de mer et de l'éléphant de mer" },
        { mot: "phoque", def: "un pinnipède dont on ne voit pas les oreilles" },
        { mot: "otarie", def: "un pinnipède dont les oreilles se voient" },
        { mot: "morse", def: "un pinnipède de l'Arctique, chassé par l'ours polaire" }
      ],
      schema: null, prerequis: ["lecture-s01-1-f1"], source: S(4)
    },
    {
      id: "lecture-s04-1-f2", notion: "Le pingouin et les grands animaux de l'océan Arctique",
      titre: "Pingouin ou manchot ? Et les géants de l'océan",
      texte: "Ne confonds pas le pingouin et le manchot. Le pingouin est plus petit que le manchot et, surtout, il sait voler : le manchot, lui, en est incapable. Dans l'océan Arctique vivent aussi la baleine blanche, le requin du Groenland et l'orque.",
      pointsCles: ["Le pingouin est plus petit que le manchot", "Le pingouin vole, le manchot non", "Dans l'océan Arctique : baleine blanche, requin du Groenland, orque"],
      astuce: "Le pingouin a des ailes qui volent ; le manchot, comme son nom le dit, est « manchot » pour voler.",
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "pingouin", def: "un oiseau plus petit que le manchot, et qui sait voler" },
        { mot: "manchot", def: "un oiseau marin qui ne sait pas voler" },
        { mot: "baleine blanche", def: "un animal marin de l'océan Arctique" },
        { mot: "requin du Groenland", def: "un requin qui vit dans l'océan Arctique" },
        { mot: "orque", def: "un animal marin qui vit aussi dans l'océan Arctique" }
      ],
      schema: null, prerequis: ["lecture-s04-1-f1"], source: S(4)
    },
    {
      id: "lecture-s04-1-f3", notion: "Le harfang des neiges et le lemming",
      titre: "Un oiseau blanc aux yeux jaunes et un tout petit rongeur",
      texte: "Le harfang des neiges vit dans la toundra arctique. On le reconnaît à son plumage blanc et à ses yeux jaunes. Le lemming arctique, lui, est un rongeur proche de la souris, et aucun mammifère de l'Arctique n'est plus petit que lui.",
      pointsCles: ["Harfang des neiges : oiseau blanc aux yeux jaunes, dans la toundra arctique", "Lemming arctique : un rongeur voisin de la souris", "Le lemming est le plus petit mammifère de l'Arctique"],
      astuce: "Le harfang des neiges, c'est l'oiseau blanc qui tient compagnie au héros de Harry Potter.",
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "harfang des neiges", def: "un oiseau blanc aux yeux jaunes, qui vit dans la toundra arctique" },
        { mot: "lemming arctique", def: "un rongeur voisin de la souris, le plus petit mammifère de l'Arctique" }
      ],
      schema: null, prerequis: [], source: S(4)
    },
    {
      id: "lecture-s04-1-f4", notion: "Le lièvre arctique et le renard polaire",
      titre: "Blancs l'hiver, bruns l'été",
      texte: "Le lièvre arctique creuse ses terriers dans la neige ou dans le sol. Blanc en hiver, il devient brun en été pour se fondre dans la boue et les roches. Le renard polaire, dit aussi renard arctique ou renard bleu, est plus petit que le renard roux. Lui aussi change : brun foncé l'été, blanc l'hiver dans la neige.",
      pointsCles: ["Lièvre arctique : terriers dans la neige et le sol", "Lièvre : blanc l'hiver, brun l'été (boue et roches)", "Renard polaire = renard arctique = renard bleu", "Le renard polaire est plus petit que le renard roux", "Renard polaire : brun foncé l'été, blanc l'hiver (neige)"],
      astuce: "Pelage blanc sur la neige, pelage brun sur la boue : la couleur suit la saison pour se camoufler.",
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "lièvre arctique", def: "un lièvre qui creuse des terriers, blanc l'hiver et brun l'été" },
        { mot: "renard polaire", def: "un petit renard, blanc l'hiver et brun foncé l'été ; on dit aussi renard arctique ou renard bleu" },
        { mot: "se camoufler", def: "se cacher en prenant la couleur de ce qui entoure" }
      ],
      schema: null, prerequis: [], source: S(4)
    },
    {
      id: "lecture-s04-1-f5", notion: "Le loup arctique et le bœuf musqué",
      titre: "Un petit loup blanc et une grosse bête à laine",
      texte: "Le loup arctique est un petit loup blanc : il ne dépasse pas 90 cm. Le bœuf musqué ressemble au bison, mais il est en réalité plus proche des mouflons et des chèvres. Il pèse environ 300 kg, et sa laine tient chaud huit fois plus que celle du mouton.",
      pointsCles: ["Loup arctique : petit loup blanc, 90 cm au plus", "Bœuf musqué : il ressemble au bison, mais sa famille est celle des mouflons et des chèvres", "Bœuf musqué : environ 300 kg", "Sa laine est 8 fois plus chaude que celle du mouton"],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "loup arctique", def: "un petit loup blanc qui ne dépasse pas 90 cm" },
        { mot: "bœuf musqué", def: "un gros animal à laine de l'Arctique, proche des mouflons et des chèvres, qui ressemble au bison" }
      ],
      schema: null, prerequis: ["lecture-s04-1-f4"], source: S(4)
    }
  ],
  schemas: [],
  questions: [
    // f1 : l'ours polaire et les pinnipèdes
    { id: "lecture-s04-1-q1", fiche: "lecture-s04-1-f1", type: "qcm", niveau: 1,
      enonce: "Que chasse l'ours polaire dans l'Arctique ?",
      choix: ["Les phoques et les morses", "Les lemmings et les lièvres", "Les orques et les baleines", "Les harfangs et les renards"],
      reponse: "Les phoques et les morses",
      explication: "L'ours polaire chasse les phoques et les morses. Ce sont deux pinnipèdes de l'Arctique.", source: S(4) },
    { id: "lecture-s04-1-q2", fiche: "lecture-s04-1-f1", type: "vrai_faux", niveau: 1,
      enonce: "Le phoque fait partie des pinnipèdes.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : le phoque est un pinnipède, comme le morse, l'otarie, le lion de mer et l'éléphant de mer.", source: S(4) },
    { id: "lecture-s04-1-q4", fiche: "lecture-s04-1-f1", type: "qcm", niveau: 2,
      enonce: "Comment distinguer une otarie d'un phoque ?",
      choix: ["Les oreilles de l'otarie se voient", "L'otarie est blanche, le phoque est brun", "L'otarie a des moustaches, le phoque n'en a pas", "L'otarie vit seulement sur la terre ferme"],
      reponse: "Les oreilles de l'otarie se voient",
      explication: "Les oreilles de l'otarie sont visibles, celles du phoque non. Tous les deux sont des pinnipèdes.", source: S(4) },
    { id: "lecture-s04-1-q5", fiche: "lecture-s04-1-f1", type: "qcm_multiple", niveau: 2,
      enonce: "Lesquels de ces animaux sont des pinnipèdes ?",
      choix: ["le morse", "l'otarie", "l'éléphant de mer", "l'ours polaire", "le lemming", "l'orque"],
      reponse: ["le morse", "l'otarie", "l'éléphant de mer"],
      explication: "Les pinnipèdes sont le morse, l'otarie, le phoque, le lion de mer et l'éléphant de mer. L'ours polaire les chasse, le lemming est un rongeur et l'orque un animal marin.", source: S(4) },
    { id: "lecture-s04-1-q6", fiche: "lecture-s04-1-f1", type: "association", niveau: 2,
      enonce: "Relie chaque animal à ce qui le décrit.",
      gauche: ["ours polaire", "phoque", "otarie", "lion de mer"],
      droite: ["un pinnipède dont les oreilles se voient", "un pinnipède, comme l'éléphant de mer", "un chasseur de phoques et de morses", "un pinnipède sans oreilles visibles"],
      reponse: [[0, 2], [1, 3], [2, 0], [3, 1]],
      explication: "L'ours polaire chasse les phoques et les morses. Le phoque n'a pas d'oreilles visibles, l'otarie en a, et le lion de mer est un pinnipède comme l'éléphant de mer.", source: S(4) },
    { id: "lecture-s04-1-q7", fiche: "lecture-s04-1-f1", type: "qcm", niveau: 3,
      enonce: "Un marin décrit un animal de l'Arctique : il nage, il est chassé par l'ours polaire et on ne voit pas ses oreilles. Lequel est-ce ?",
      choix: ["Un phoque", "Une otarie", "Un lemming", "Une orque"],
      reponse: "Un phoque",
      explication: "Le phoque est un pinnipède sans oreilles visibles, et l'ours polaire le chasse. L'otarie, elle, a des oreilles qui se voient.", source: S(4) },

    // f2 : le pingouin et les grands animaux de l'océan Arctique
    { id: "lecture-s04-1-q9", fiche: "lecture-s04-1-f2", type: "qcm", niveau: 1,
      enonce: "Comment distingue-t-on le pingouin du manchot ?",
      choix: ["Le pingouin vole, pas le manchot", "Le manchot vole, pas le pingouin", "Le pingouin vit dans l'eau, pas le manchot", "Le manchot vit dans l'Arctique, pas le pingouin"],
      reponse: "Le pingouin vole, pas le manchot",
      explication: "Le pingouin sait voler, le manchot non. C'est la différence à retenir entre les deux.", source: S(4) },
    { id: "lecture-s04-1-q10", fiche: "lecture-s04-1-f2", type: "vrai_faux", niveau: 1,
      enonce: "Le pingouin est capable de voler.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : le pingouin vole, contrairement au manchot. Il est aussi plus petit que lui.", source: S(4) },
    { id: "lecture-s04-1-q12", fiche: "lecture-s04-1-f2", type: "qcm_multiple", niveau: 2,
      enonce: "Lesquels de ces animaux vivent dans l'océan Arctique ?",
      choix: ["la baleine blanche", "le requin du Groenland", "l'orque", "le bœuf musqué", "le lièvre arctique"],
      reponse: ["la baleine blanche", "le requin du Groenland", "l'orque"],
      explication: "La baleine blanche, le requin du Groenland et l'orque vivent dans l'océan Arctique. Le bœuf musqué et le lièvre arctique vivent sur la terre ferme.", source: S(4) },
    { id: "lecture-s04-1-q14", fiche: "lecture-s04-1-f2", type: "qcm", niveau: 3,
      enonce: "Un marin aperçoit un animal qui nage dans l'océan Arctique. Lequel de ces animaux peut-il voir ?",
      choix: ["Une orque", "Un bœuf musqué", "Un lemming arctique", "Un harfang des neiges"],
      reponse: "Une orque",
      explication: "L'orque vit dans l'océan Arctique, comme la baleine blanche et le requin du Groenland. Le bœuf musqué, le lemming et le harfang vivent sur la terre.", source: S(4) },
    { id: "lecture-s04-1-q15", fiche: "lecture-s04-1-f2", type: "trou", niveau: 2,
      enonce: "Complète la phrase.",
      texte: "Dans l'océan Arctique nagent la baleine ___, le requin du ___ et l'orque.",
      banque: ["blanche", "Groenland", "bleue", "Antarctique"],
      reponse: [["blanche"], ["Groenland"]],
      explication: "La baleine blanche, le requin du Groenland et l'orque sont les géants de l'océan Arctique. La baleine bleue, elle, est rangée avec les animaux de l'Antarctique.", source: S(4) },

    // f3 : le harfang des neiges et le lemming
    { id: "lecture-s04-1-q17", fiche: "lecture-s04-1-f3", type: "qcm", niveau: 1,
      enonce: "Où vit le harfang des neiges ?",
      choix: ["Dans la toundra arctique", "Dans l'océan Arctique", "Dans les forêts tropicales", "Dans les terriers des lièvres"],
      reponse: "Dans la toundra arctique",
      explication: "Le harfang des neiges vit dans la toundra arctique. C'est un oiseau blanc aux yeux jaunes.", source: S(4) },
    { id: "lecture-s04-1-q18", fiche: "lecture-s04-1-f3", type: "vrai_faux", niveau: 1,
      enonce: "Le harfang des neiges est blanc, avec des yeux jaunes.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : son plumage est blanc et ses yeux sont jaunes. Il vit dans la toundra arctique.", source: S(4) },
    { id: "lecture-s04-1-q19", fiche: "lecture-s04-1-f3", type: "vrai_faux", niveau: 2,
      enonce: "Le lemming arctique est le plus gros mammifère de l'Arctique.",
      corrections: ["Faux : c'est le plus petit mammifère de l'Arctique.", "Faux : c'est le plus petit oiseau de l'Arctique.", "Faux : c'est un gros rongeur, cousin du lièvre."],
      reponse: { vrai: false, correction: "Faux : c'est le plus petit mammifère de l'Arctique." },
      explication: "Le lemming arctique est un petit rongeur qui ressemble à la souris. Aucun mammifère de l'Arctique n'est plus petit que lui.", source: S(4) },
    { id: "lecture-s04-1-q20", fiche: "lecture-s04-1-f3", type: "qcm", niveau: 2,
      enonce: "À quel animal le lemming arctique ressemble-t-il ?",
      choix: ["À une souris", "À un lièvre", "À une chèvre", "À un renard"],
      reponse: "À une souris",
      explication: "Le lemming arctique ressemble à une souris : c'est un rongeur. Il est aussi le plus petit des mammifères de l'Arctique.", source: S(4) },
    { id: "lecture-s04-1-q21", fiche: "lecture-s04-1-f3", type: "qcm", niveau: 2,
      enonce: "Pourquoi le harfang des neiges vit-il là où vivent les lemmings ?",
      choix: ["Parce que le lemming est sa proie principale", "Parce que les lemmings le protègent du froid de l'hiver", "Parce qu'il pond ses œufs dans leurs terriers", "Parce qu'ils migrent ensemble vers le sud"],
      reponse: "Parce que le lemming est sa proie principale",
      explication: "Ce rapace blanc de la toundra chasse surtout de jour, et surtout des lemmings. Quand les lemmings manquent, le harfang se fait rare.", source: T("Harfang des neiges", "Harfang_des_neiges") },
    { id: "lecture-s04-1-q22", fiche: "lecture-s04-1-f3", type: "association", niveau: 3,
      enonce: "Relie chaque animal de l'Arctique à ce qui le décrit.",
      gauche: ["harfang des neiges", "lemming arctique", "lièvre arctique", "ours polaire"],
      droite: ["un rongeur, le plus petit mammifère de l'Arctique", "un oiseau blanc aux yeux jaunes", "un chasseur de phoques et de morses", "il creuse des terriers dans la neige"],
      reponse: [[0, 1], [1, 0], [2, 3], [3, 2]],
      explication: "Le harfang est un oiseau blanc aux yeux jaunes et le lemming un tout petit rongeur. Le lièvre creuse des terriers, et l'ours polaire chasse phoques et morses.", source: S(4) },
    { id: "lecture-s04-1-q23", fiche: "lecture-s04-1-f3", type: "trou", niveau: 3,
      enonce: "Écris les deux noms qui manquent.",
      texte: "Le ___ des neiges est un oiseau blanc de la toundra ; le ___ arctique est un petit rongeur.",
      reponse: [["harfang"], ["lemming"]],
      explication: "Le harfang des neiges est l'oiseau blanc aux yeux jaunes. Le lemming arctique est le rongeur voisin de la souris.", source: S(4) },

    // f4 : le lièvre arctique et le renard polaire
    { id: "lecture-s04-1-q24", fiche: "lecture-s04-1-f4", type: "qcm", niveau: 1,
      enonce: "De quelle couleur est le lièvre arctique en hiver ?",
      choix: ["Blanc", "Brun", "Gris", "Roux"],
      reponse: "Blanc",
      explication: "En hiver, le lièvre arctique est blanc comme la neige. En été, il devient brun.", source: S(4) },
    { id: "lecture-s04-1-q25", fiche: "lecture-s04-1-f4", type: "vrai_faux", niveau: 1,
      enonce: "Le renard polaire s'appelle aussi renard arctique ou renard bleu.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : renard polaire, renard arctique et renard bleu désignent le même animal. Il est plus petit que le renard roux.", source: S(4) },
    { id: "lecture-s04-1-q27", fiche: "lecture-s04-1-f4", type: "qcm", niveau: 2,
      enonce: "Pourquoi le pelage du lièvre arctique devient-il brun en été ?",
      choix: ["Pour se cacher dans la boue et les roches", "Pour se cacher dans la neige qui fond au printemps", "Pour ne pas avoir trop chaud sous le soleil de l'été", "Pour ressembler au renard roux qui vit tout près"],
      reponse: "Pour se cacher dans la boue et les roches",
      explication: "En été, le sol est fait de boue et de roches : un pelage brun s'y fond mieux. En hiver, le blanc le cache dans la neige.", source: S(4) },
    { id: "lecture-s04-1-q29", fiche: "lecture-s04-1-f4", type: "qcm_multiple", niveau: 2,
      enonce: "Quels animaux de l'Arctique sont blancs l'hiver et bruns l'été ?",
      choix: ["le lièvre arctique", "le renard polaire", "le harfang des neiges", "le loup arctique", "le lemming arctique"],
      reponse: ["le lièvre arctique", "le renard polaire"],
      explication: "Le lièvre arctique et le renard polaire changent de couleur avec la saison pour se camoufler. Le harfang et le loup arctique sont décrits comme blancs, et le lemming comme un petit rongeur.", source: S(4) },
    { id: "lecture-s04-1-q30", fiche: "lecture-s04-1-f4", type: "qcm", niveau: 3,
      enonce: "En plein été, un renard polaire trotte sur un sol de boue et de roches. De quelle couleur est son pelage ?",
      choix: ["Brun foncé", "Blanc pur", "Bleu clair", "Roux vif"],
      reponse: "Brun foncé",
      explication: "En été, le renard polaire est brun foncé. Il ne redevient blanc qu'en hiver, pour se cacher dans la neige.", source: S(4) },
    { id: "lecture-s04-1-q31", fiche: "lecture-s04-1-f4", type: "vrai_faux", niveau: 3,
      enonce: "Le lièvre arctique et le renard polaire changent de couleur selon la saison pour se camoufler.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : tous les deux sont blancs l'hiver et bruns l'été. Ainsi, ils se fondent dans la neige, puis dans la boue et les roches.", source: S(4) },

    // f5 : le loup arctique et le bœuf musqué
    { id: "lecture-s04-1-q32", fiche: "lecture-s04-1-f5", type: "qcm", niveau: 1,
      enonce: "À quel animal le bœuf musqué ressemble-t-il ?",
      choix: ["Au bison", "Au cheval", "À l'ours", "Au renne"],
      reponse: "Au bison",
      explication: "Le bœuf musqué ressemble au bison. Pourtant, sa famille est plutôt celle des mouflons et des chèvres.", source: S(4) },
    { id: "lecture-s04-1-q33", fiche: "lecture-s04-1-f5", type: "vrai_faux", niveau: 1,
      enonce: "Le loup arctique est un petit loup blanc.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : le loup arctique est un petit loup blanc. Il ne dépasse pas 90 cm.", source: S(4) },
    { id: "lecture-s04-1-q34", fiche: "lecture-s04-1-f5", type: "vrai_faux", niveau: 3,
      enonce: "Le loup arctique chasse toujours seul, même les grosses proies.",
      corrections: ["Faux : il chasse en meute les grosses proies, comme le bœuf musqué, et seul les petites, comme le lièvre ou le lemming.", "Faux : il chasse toujours en meute, même les petites proies.", "Faux : il chasse seul, mais uniquement la nuit."],
      reponse: { vrai: false, correction: "Faux : il chasse en meute les grosses proies, comme le bœuf musqué, et seul les petites, comme le lièvre ou le lemming." },
      explication: "Seul, le loup arctique attrape des lemmings et des lièvres. Pour un bœuf musqué, il chasse en meute.", source: T("Loup arctique", "Loup_arctique") },
    { id: "lecture-s04-1-q35", fiche: "lecture-s04-1-f5", type: "qcm", niveau: 2,
      enonce: "Comment les bœufs musqués se défendent-ils quand des loups les attaquent ?",
      choix: ["Ils se serrent en cercle, les petits au milieu", "Ils se dispersent chacun de son côté", "Ils s'enfuient en courant vers les montagnes", "Ils se cachent dans un trou creusé dans la neige"],
      reponse: "Ils se serrent en cercle, les petits au milieu",
      explication: "Les adultes forment un cercle, les petits au centre, et font face aux loups. Le plus fort d'entre eux se charge de repousser l'attaque.", source: T("Bœuf musqué", "B%C5%93uf_musqu%C3%A9") },
    { id: "lecture-s04-1-q36", fiche: "lecture-s04-1-f5", type: "qcm", niveau: 1,
      enonce: "Où vivent le loup arctique et le bœuf musqué ?",
      choix: ["Dans le Grand Nord du Canada et au Groenland", "En Antarctique, tout autour du pôle Sud", "Dans les grandes forêts du centre de l'Europe", "Sur la banquise, loin des côtes"],
      reponse: "Dans le Grand Nord du Canada et au Groenland",
      explication: "Les deux vivent dans la toundra de l'extrême nord du Canada et du Groenland. Là, en hiver, le loup chasse le bœuf musqué.", source: T("Bœuf musqué", "B%C5%93uf_musqu%C3%A9") },
  ],
  bonus: [
    {
      id: "lecture-s04-1-b1",
      fiche: "lecture-s04-1-f3",
      titre: "Le harfang des neiges, un géant blanc",
      texte: "Le harfang des neiges peut mesurer jusqu'à 70 cm de long, et une femelle aux ailes ouvertes atteint 170 à 177 cm d'envergure. Le mâle est d'un blanc pur ; la femelle et les jeunes sont légèrement tachetés de brun. Le lemming est sa principale nourriture. Au Canada, un comité d'experts l'a déclarée « menacée » en 2025.",
      source: { titre: "Harfang des neiges", editeur: "Wikipédia, l'encyclopédie libre", url: "https://fr.wikipedia.org/wiki/Harfang_des_neiges" }
    }
  ],
  nonCouvert: [
    "Le contenu des chapitres 5 et 6 (p. 55 à 67 du livre) : le livre n'est pas déposé, et la liste de vocabulaire ne dit pas à quel chapitre appartient chaque mot. Ce cours reprend les animaux de l'Arctique (page 4 de la liste).",
    "Les photos des animaux (page 4) : aucune image de la liste n'est reprise dans le jeu.",
    "La couleur et la taille de l'ours polaire, du morse, de l'otarie et des autres pinnipèdes : la liste ne les donne pas.",
    "Les animaux de l'Antarctique (page 5) : ils sont repris au cours suivant."
  ]
};
