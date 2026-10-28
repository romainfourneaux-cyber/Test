// Source en clair du cours litterature-s06-2 (livret 1, chapitre II, cours 5 : la leçon littéraire, p. 41 à 43 du livret).
// Compilé (réponses brouillées) par node atelier/outils/compiler-cours.js litterature-s06-2.
// Source déposée : le corrigé du livret 1, page 3 du PDF (colonne de droite, titrée « Chapitre III - Cours 5 » par le
// corrigé alors que l'emploi du temps place ce cours au chapitre II ; rubrique « Questions sur le cours »).
// Le livret lui-même n'est pas déposé : les notions viennent des réponses du corrigé, reformulées, et les
// exemples sont des phrases de tous les jours. Aucune citation des extraits du livret n'est reprise.
// Devoir 2 (litterature-d2, L'Île au trésor, cours 4 et 5) : son énoncé n'est pas déposé. Par prudence, les questions
// portent sur les notions (impression de vitesse, passé simple, narrateur), jamais sur l'intrigue.
const S = { fichier: "cours/litterature/Litterature 5e - Livret 1 - Corriges.pdf", page: 3 };
// Audit des questions du 28/10/2026 appliqué : q4, q6, q7, q8, q13, q22 et q23 réécrites (plus de « dans ce passage »,
// plus de consigne) ; q9, q10, q11, q16 (le passé simple dans le récit) et q21 (auteur et narrateur) devenues questions
// de thème : le corrigé ne dit du passé simple que son effet dans un passage, et la consigne de rédaction est hors jeu.
const THEME = "Cours 5 – Lire la leçon littéraire p41 à 43"; // intitulé du planning, pour les questions de thème (règle du 25/10/2026)
const T = (titre, page) => ({ theme: THEME, titre, editeur: "Wikipédia", url: "https://fr.wikipedia.org/wiki/" + page });

module.exports = {
  id: "litterature-s06-2",
  fiches: [
    {
      id: "litterature-s06-2-f1", notion: "Donner une impression de vitesse",
      titre: "Du lointain au tout proche, en un instant",
      texte: "Un récit peut donner une impression de vitesse, comme un film en accéléré. Le navire que Jim Hawkins rejoint est d'abord une forme vague, au loin ; puis ses mâts et sa coque se dessinent ; l'instant d'après, le garçon s'y accroche. Ce qui accélère tout, c'est le courant, très fort : il joue le rôle d'un accélérateur de temps.",
      pointsCles: [
        "Impression de vitesse : comme dans un film en accéléré",
        "L'objet décrit passe du lointain au tout proche en un instant",
        "Un élément du récit sert d'accélérateur : ici, le courant"
      ],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "accélérateur de temps", def: "un élément du récit qui fait aller les choses plus vite, comme un courant fort" }
      ],
      schema: null, prerequis: [], source: S
    },
    {
      id: "litterature-s06-2-f2", notion: "Le passé simple et le personnage pris de court",
      titre: "Des actions brusques, un personnage surpris",
      texte: "Dans ce passage rapide, les verbes sont au passé simple. Ce temps montre la conscience troublée de Jim : il est pris de court, tout va si vite qu'il n'est plus sûr de ce qu'il a perçu, et il le dit. Exemple de phrases au passé simple : « Il ouvrit, entra, s'assit : tout alla vite. »",
      pointsCles: [
        "Les verbes du passage rapide sont au passé simple",
        "Ce temps montre Jim pris de court, la conscience troublée",
        "Jim n'est plus sûr de ce qu'il a perçu, et il le dit"
      ],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "pris de court", def: "surpris par quelque chose qui arrive trop vite" },
        { mot: "conscience troublée", def: "l'esprit brouillé d'un personnage qui ne sait plus bien ce qu'il a perçu" }
      ],
      schema: null, prerequis: ["litterature-s06-2-f1"], source: S
    },
    {
      id: "litterature-s06-2-f3", notion: "Changer de narrateur",
      titre: "Raconter la même scène avec un autre « je »",
      texte: "Dans L'Île au trésor, c'est Jim Hawkins qui raconte. On peut réécrire une scène avec un autre narrateur, par exemple le capitaine Smollett : « je » désigne alors le capitaine, et l'on raconte ce que lui voit, pense et ressent. Le sujet d'un tel récit impose le narrateur et la longueur, de 5 à 10 lignes.",
      pointsCles: [
        "Le narrateur, c'est celui qui raconte et dit « je »",
        "Changer de narrateur : un autre personnage dit « je » et donne sa façon de voir",
        "Respecter le sujet : narrateur imposé, 5 à 10 lignes"
      ],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "narrateur", def: "celui qui raconte l'histoire ; dans un récit à la première personne, c'est lui qui dit « je »" }
      ],
      schema: null, prerequis: ["litterature-s03-2-f3", "litterature-s05-2-f4"], source: S
    }
  ],
  schemas: [],
  questions: [
    // f1 : l'impression de vitesse
    { id: "litterature-s06-2-q1", fiche: "litterature-s06-2-f1", type: "qcm", niveau: 1,
      enonce: "À quoi ressemble un passage de récit qui donne une impression de vitesse ?",
      choix: ["À un film en accéléré", "À une photo immobile", "À une liste d'objets", "À un dessin très détaillé"],
      reponse: "À un film en accéléré",
      explication: "Tout semble aller plus vite, comme dans un film en accéléré. Le navire se rapproche de Jim en un instant.", source: S },
    { id: "litterature-s06-2-q2", fiche: "litterature-s06-2-f1", type: "vrai_faux", niveau: 1,
      enonce: "Un récit peut donner l'impression que tout va très vite, comme dans un film en accéléré.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : c'est ce que fait le passage où Jim rejoint le navire. Il paraît se rapprocher étonnamment vite.", source: S },
    { id: "litterature-s06-2-q3", fiche: "litterature-s06-2-f1", type: "qcm", niveau: 2,
      enonce: "Comment la description du navire rejoint par Jim crée-t-elle une impression de vitesse ?",
      choix: ["Le navire passe du lointain au tout proche en un instant", "Le navire est décrit détail par détail pendant une page entière", "Le narrateur compare le navire à une maison", "Le navire reste immobile au loin"],
      reponse: "Le navire passe du lointain au tout proche en un instant",
      explication: "D'abord une forme vague au loin, puis des détails, et l'instant d'après Jim le touche. Ce passage si rapide du loin au près donne la vitesse.", source: S },
    { id: "litterature-s06-2-q4", fiche: "litterature-s06-2-f1", type: "qcm", niveau: 2,
      enonce: "Dans le passage où Jim rejoint le navire, qu'est-ce qui précipite tout et joue le rôle d'un accélérateur de temps ?",
      choix: ["Le courant, très fort", "Le vent dans les voiles", "La nuit qui tombe", "Les cris de l'équipage"],
      reponse: "Le courant, très fort",
      explication: "Le courant emporte Jim de plus en plus vite vers le navire. C'est lui qui fait office d'accélérateur.", source: S },
    { id: "litterature-s06-2-q5", fiche: "litterature-s06-2-f1", type: "vrai_faux", niveau: 2,
      enonce: "Pour donner une impression de vitesse, le narrateur décrit le navire longuement, détail après détail, pendant toute une page.",
      corrections: ["Faux : le navire passe en un instant d'une forme vague au loin à un objet tout proche.", "Faux : le narrateur ne décrit pas du tout le navire.", "Faux : le narrateur décrit seulement le courant, jamais le navire."],
      reponse: { vrai: false, correction: "Faux : le navire passe en un instant d'une forme vague au loin à un objet tout proche." },
      explication: "C'est l'inverse : la description va très vite, du lointain au tout proche. Une longue description ralentirait le récit.", source: S },
    { id: "litterature-s06-2-q6", fiche: "litterature-s06-2-f1", type: "ordre", niveau: 2,
      enonce: "Un récit veut donner l'impression qu'un navire arrive très vite. Range ce que perçoit le personnage, du plus loin au plus près.",
      elements: ["Il est à côté du navire et l'attrape", "Une tache sombre, à peine visible, au loin", "Les mâts et la coque se dessinent"],
      reponse: [1, 2, 0],
      explication: "D'abord une tache sombre au loin, puis les mâts et la coque, et l'instant d'après le navire qu'on touche. Passer de l'un à l'autre en quelques lignes, c'est le procédé de la vitesse.", source: S },
    { id: "litterature-s06-2-q7", fiche: "litterature-s06-2-f1", type: "qcm", niveau: 3,
      enonce: "Dans le passage où Jim rejoint le navire, pourquoi peut-on dire que le courant est un « accélérateur de temps » ?",
      choix: ["Il rapproche le navire de Jim bien plus vite que prévu", "Il laisse au narrateur le temps de décrire le navire en détail", "Il ralentit le canot de Jim", "Il éloigne le navire de Jim"],
      reponse: "Il rapproche le navire de Jim bien plus vite que prévu",
      explication: "Plus Jim avance, plus le courant est rapide : le navire arrive sur lui d'un coup. Le courant fait donc aller le temps du récit plus vite.", source: S },
    { id: "litterature-s06-2-q8", fiche: "litterature-s06-2-f1", type: "qcm_multiple", niveau: 3,
      enonce: "Dans le passage où Jim rejoint le navire, quels procédés donnent une impression de vitesse ? (plusieurs réponses)",
      choix: ["Le navire passe du lointain au tout proche en un instant", "Un courant fort accélère tout", "Le passé simple montre Jim pris de court par la vitesse", "Le narrateur énumère tous les objets du navire", "Le narrateur compare le navire à une vieille maison"],
      reponse: ["Le navire passe du lointain au tout proche en un instant", "Un courant fort accélère tout", "Le passé simple montre Jim pris de court par la vitesse"],
      explication: "Loin puis tout près, un courant accélérateur, un passé simple qui montre Jim dépassé : trois ingrédients de la vitesse. Une énumération d'objets ou une comparaison ne sont pas dans ce passage.", source: S },
    // f2 : le passé simple et le personnage pris de court
    { id: "litterature-s06-2-q9", fiche: "litterature-s06-2-f2", type: "qcm", niveau: 1,
      enonce: "Dans un récit au passé, quel temps sert à raconter les actions qui se suivent, au premier plan ?",
      choix: ["Le passé simple", "L'imparfait", "Le présent", "Le futur"],
      reponse: "Le passé simple",
      explication: "Le passé simple enchaîne les actions achevées, l'une après l'autre : c'est le temps du récit. L'imparfait, lui, sert plutôt au décor et aux descriptions.", source: T("Passé simple en français", "Pass%C3%A9_simple_en_fran%C3%A7ais") },
    { id: "litterature-s06-2-q10", fiche: "litterature-s06-2-f2", type: "vrai_faux", niveau: 1,
      enonce: "Dans un récit au passé, l'imparfait plante le décor en arrière-plan ; le passé simple raconte les actions qui font avancer l'histoire.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "L'imparfait sert à la toile de fond : décor, habitudes, descriptions. Le passé simple met les actions au premier plan.", source: T("Passé simple en français", "Pass%C3%A9_simple_en_fran%C3%A7ais") },
    { id: "litterature-s06-2-q11", fiche: "litterature-s06-2-f2", type: "qcm", niveau: 2,
      enonce: "Comment le passé simple donne-t-il du rythme à un récit ?",
      choix: ["Il enchaîne des actions achevées, l'une après l'autre", "Il décrit longuement le décor et les habitudes des personnages", "Il répète la même action tous les jours", "Il annonce ce qui arrivera plus tard"],
      reponse: "Il enchaîne des actions achevées, l'une après l'autre",
      explication: "Chaque verbe au passé simple pose une action finie, et la suivante arrive aussitôt. Le récit avance par à-coups, comme Jim pris de court par le courant.", source: T("Passé simple en français", "Pass%C3%A9_simple_en_fran%C3%A7ais") },
    { id: "litterature-s06-2-q12", fiche: "litterature-s06-2-f2", type: "qcm", niveau: 2,
      enonce: "Que veut dire « être pris de court » ?",
      choix: ["Être surpris par quelque chose qui arrive trop vite", "Être épuisé après avoir couru pendant très longtemps", "Avoir perdu son chemin dans le noir", "Être moins grand que les autres"],
      reponse: "Être surpris par quelque chose qui arrive trop vite",
      explication: "Être pris de court, c'est être surpris, sans avoir eu le temps de réagir. C'est ce qui arrive à Jim quand le navire surgit.", source: S },
    { id: "litterature-s06-2-q13", fiche: "litterature-s06-2-f2", type: "vrai_faux", niveau: 2,
      enonce: "Dans le passage où Jim rejoint le navire, le passé simple montre un personnage calme qui a tout prévu.",
      corrections: ["Faux : il montre un personnage pris de court, dépassé par la vitesse des événements.", "Faux : il montre un personnage qui se souvient de son enfance.", "Faux : il montre un personnage qui décrit un paysage immobile."],
      reponse: { vrai: false, correction: "Faux : il montre un personnage pris de court, dépassé par la vitesse des événements." },
      explication: "Le passé simple montre ici la conscience troublée de Jim : il est surpris, pas calme. Il n'est même plus sûr de ce qu'il a vu.", source: S },
    { id: "litterature-s06-2-q14", fiche: "litterature-s06-2-f2", type: "qcm_multiple", niveau: 2,
      enonce: "Quelles phrases sont au passé simple ? (plusieurs réponses)",
      choix: ["Il ouvrit la porte et entra.", "Elle sauta dans l'eau.", "Il ouvrait la porte chaque matin.", "Nous partirons demain.", "Le chat dort."],
      reponse: ["Il ouvrit la porte et entra.", "Elle sauta dans l'eau."],
      explication: "« Ouvrit », « entra », « sauta » sont au passé simple. « Ouvrait » est à l'imparfait, « partirons » au futur, « dort » au présent.", source: S },
    { id: "litterature-s06-2-q15", fiche: "litterature-s06-2-f2", type: "qcm", niveau: 3,
      enonce: "Pourquoi Jim n'est-il plus sûr de ce qu'il a perçu quand il rejoint le navire ?",
      choix: ["Parce que le navire est arrivé sur lui trop vite, dans un courant de plus en plus rapide", "Parce que le capitaine lui a raconté une fausse histoire", "Parce qu'il a gardé les yeux fermés pendant toute la traversée, de peur de tomber à l'eau", "Parce qu'il ne connaît pas le nom du navire qu'il cherche"],
      reponse: "Parce que le navire est arrivé sur lui trop vite, dans un courant de plus en plus rapide",
      explication: "Plus Jim avance, plus le courant est rapide : le navire surgit d'un coup. Pris de court, Jim ne sait plus très bien ce qu'il a vu.", source: S },
    { id: "litterature-s06-2-q16", fiche: "litterature-s06-2-f2", type: "trou", niveau: 1,
      enonce: "Complète la phrase.",
      texte: "Dans un récit au passé, les actions de premier plan sont au passé ___ ; le décor et les descriptions sont à l'___.",
      banque: ["simple", "imparfait", "composé", "futur"],
      reponse: [["simple"], ["imparfait"]],
      explication: "Le passé simple raconte les actions qui se suivent. L'imparfait installe le décor, en arrière-plan.", source: T("Passé simple en français", "Pass%C3%A9_simple_en_fran%C3%A7ais") },
    // f3 : changer de narrateur
    { id: "litterature-s06-2-q17", fiche: "litterature-s06-2-f3", type: "qcm", niveau: 1,
      enonce: "Dans L'Île au trésor, qui est le narrateur ?",
      choix: ["Jim Hawkins", "Le capitaine Smollett", "Le docteur Livesey", "Billy Bones"],
      reponse: "Jim Hawkins",
      explication: "C'est Jim Hawkins qui raconte et dit « je ». Le capitaine Smollett ne devient narrateur que si l'on réécrit la scène.", source: S },
    { id: "litterature-s06-2-q18", fiche: "litterature-s06-2-f3", type: "vrai_faux", niveau: 1,
      enonce: "Si l'on réécrit une scène avec le capitaine Smollett comme narrateur, c'est lui qui dit « je ».",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : le narrateur est celui qui raconte et dit « je ». Si c'est le capitaine, « je » le désigne.", source: S },
    { id: "litterature-s06-2-q19", fiche: "litterature-s06-2-f3", type: "qcm", niveau: 2,
      enonce: "Comment change un récit quand on remplace le narrateur par un autre personnage ?",
      choix: ["On raconte ce que ce personnage voit, pense et ressent", "L'histoire devient un poème", "Les verbes passent tous au futur", "On garde exactement les mêmes phrases en changeant seulement le titre"],
      reponse: "On raconte ce que ce personnage voit, pense et ressent",
      explication: "Le nouveau narrateur dit « je » et donne sa façon de voir la scène. On découvre ce que lui pense et ressent.", source: S },
    { id: "litterature-s06-2-q20", fiche: "litterature-s06-2-f3", type: "vrai_faux", niveau: 2,
      enonce: "Quand on change de narrateur, « je » désigne toujours le même personnage qu'avant.",
      corrections: ["Faux : « je » désigne le nouveau narrateur, par exemple le capitaine.", "Faux : « je » disparaît du récit, qui passe à la troisième personne.", "Faux : « je » désigne l'auteur du livre."],
      reponse: { vrai: false, correction: "Faux : « je » désigne le nouveau narrateur, par exemple le capitaine." },
      explication: "« Je », c'est celui qui raconte. Si le capitaine Smollett devient narrateur, « je » désigne le capitaine, plus Jim.", source: S },
    { id: "litterature-s06-2-q21", fiche: "litterature-s06-2-f3", type: "qcm", niveau: 2,
      enonce: "Quelle différence y a-t-il entre l'auteur d'un roman et son narrateur ?",
      choix: ["L'auteur écrit le livre ; le narrateur raconte dans le livre", "C'est toujours la même personne", "Le narrateur écrit le livre, l'auteur le raconte", "L'auteur est forcément un des personnages qui vivent l'histoire"],
      reponse: "L'auteur écrit le livre ; le narrateur raconte dans le livre",
      explication: "Dans L'Île au trésor, Jim Hawkins raconte et dit « je », mais ce n'est pas lui qui a écrit le roman. Le narrateur est une voix inventée par l'auteur.", source: T("Narrateur", "Narrateur") },
    { id: "litterature-s06-2-q22", fiche: "litterature-s06-2-f3", type: "qcm_multiple", niveau: 2,
      enonce: "Pour réécrire une scène avec un nouveau narrateur, que faut-il faire ? (plusieurs réponses)",
      choix: ["Faire dire « je » au nouveau narrateur", "Raconter ce que ce personnage voit et pense", "Garder les mêmes événements", "Garder le même narrateur qu'avant", "Changer l'histoire du tout au tout"],
      reponse: ["Faire dire « je » au nouveau narrateur", "Raconter ce que ce personnage voit et pense", "Garder les mêmes événements"],
      explication: "Le nouveau narrateur dit « je » et livre sa façon de voir la scène. Les événements restent les mêmes, racontés autrement.", source: S },
    { id: "litterature-s06-2-q23", fiche: "litterature-s06-2-f3", type: "association", niveau: 3,
      enonce: "Relie chaque mot à sa définition.",
      gauche: ["Narrateur", "Changer de narrateur", "Focalisation interne"],
      droite: ["Un autre personnage prend la parole et dit « je »", "Suivre l'histoire à travers ce qu'un personnage ressent", "Celui qui raconte et dit « je »"],
      reponse: [[0, 2], [1, 0], [2, 1]],
      explication: "Le narrateur raconte ; en changer, c'est donner « je » à un autre personnage. La focalisation interne suit ce qu'un personnage ressent.", source: S },
    { id: "litterature-s06-2-q24", fiche: "litterature-s06-2-f3", type: "qcm", niveau: 3,
      enonce: "Pourquoi la même scène paraît-elle différente quand le capitaine Smollett la raconte à la place de Jim ?",
      choix: ["Parce qu'on découvre ce que lui voit, pense et ressent", "Parce que le capitaine ne sait pas écrire", "Parce que la scène se passe alors à un autre endroit", "Parce que les verbes au passé simple sont interdits dans sa bouche"],
      reponse: "Parce qu'on découvre ce que lui voit, pense et ressent",
      explication: "Chaque narrateur raconte avec ses yeux et ses sentiments. Le capitaine ne voit pas la scène comme Jim, même si les faits sont les mêmes.", source: S }
  ],
  bonus: [
    {
      id: "litterature-s06-2-b1",
      fiche: "litterature-s06-2-f3",
      titre: "Qui a écrit L'Île au trésor ?",
      texte: "L'Île au trésor est un roman de Robert Louis Stevenson, un écrivain écossais. Il a d'abord paru en feuilleton, d'octobre 1881 à janvier 1882, dans un magazine pour la jeunesse, sous un faux nom de capitaine. Il est devenu un livre en 1883. Son narrateur est Jim Hawkins, fils des aubergistes de l'Amiral Benbow.",
      source: { titre: "L'Île au trésor", editeur: "Wikipédia, l'encyclopédie libre", url: "https://fr.wikipedia.org/wiki/L%27%C3%8Ele_au_tr%C3%A9sor" }
    }
  ],
  nonCouvert: [
    "La leçon littéraire elle-même (livret 1, pages 41 à 43) n'est pas déposée : seules les réponses du corrigé le sont, et les notions en sont tirées.",
    "Le corrigé titre ce cours « Chapitre III - Cours 5 » alors que l'emploi du temps le place au chapitre II : les notions suivent le corrigé, le numéro de chapitre reste à confirmer.",
    "Ce que la leçon dit du passé simple en général : le corrigé n'en commente que l'effet dans ce passage.",
    "Le résumé de la leçon et les outils de la langue à apprendre.",
    "Les extraits lus (livret, pages 39 et 40) ne sont pas déposés. Les réponses de compréhension du corrigé qui portent sur eux (page 3 : avis du docteur sur le drapeau, chance de Jim grâce à la marée, comparaisons relevées) relèvent de la lecture des textes (litterature-s06-1) et ne sont pas reprises ici.",
    "Le récit à écrire avec le capitaine Smollett comme narrateur : production personnelle, hors jeu ; seule la consigne (narrateur imposé, longueur) est reprise.",
    "La carte mentale de la page 44 : production personnelle, hors jeu."
  ]
};
