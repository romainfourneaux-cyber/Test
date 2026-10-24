// Source en clair du cours litterature-s06-2 (livret 1, chapitre II, cours 5 : la leçon littéraire, p. 41 à 43 du livret).
// Compilé (réponses brouillées) par node atelier/outils/compiler-cours.js litterature-s06-2.
// Source déposée : le corrigé du livret 1, page 3 du PDF (colonne de droite, titrée « Chapitre III - Cours 5 » par le
// corrigé alors que l'emploi du temps place ce cours au chapitre II ; rubrique « Questions sur le cours »).
// Le livret lui-même n'est pas déposé : les notions viennent des réponses du corrigé, reformulées, et les
// exemples sont des phrases de tous les jours. Aucune citation des extraits du livret n'est reprise.
// Devoir 2 (litterature-d2, L'Île au trésor, cours 4 et 5) : son énoncé n'est pas déposé. Par prudence, les questions
// portent sur les notions (impression de vitesse, passé simple, narrateur), jamais sur l'intrigue.
const S = { fichier: "cours/litterature/Litterature 5e - Livret 1 - Corriges.pdf", page: 3 };

module.exports = {
  id: "litterature-s06-2",
  fiches: [
    {
      id: "litterature-s06-2-f1", notion: "Donner une impression de vitesse",
      titre: "Du lointain au tout proche, en un instant",
      texte: "Un récit peut donner une impression de vitesse, comme un film en accéléré. Le navire que Jim Hawkins rejoint est d'abord une forme vague, au loin ; puis ses détails apparaissent ; l'instant d'après, le garçon le touche. Ce qui accélère tout, c'est le courant, très fort : il joue le rôle d'un accélérateur de temps.",
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
      texte: "Dans ce passage rapide, les verbes sont au passé simple : les actions tombent d'un coup, l'une après l'autre. Ce temps montre aussi que Jim est pris de court : tout va si vite qu'il n'est plus sûr de ce qu'il perçoit, et il le dit. Exemple : « Il ouvrit, entra, s'assit : tout alla très vite. »",
      pointsCles: [
        "Passé simple : des actions brusques qui s'enchaînent",
        "Il montre un personnage pris de court, surpris",
        "Le personnage n'est plus sûr de ce qu'il perçoit"
      ],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "pris de court", def: "surpris par quelque chose qui arrive trop vite" }
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
      enonce: "Dans ce passage, quel élément joue le rôle d'un accélérateur de temps ?",
      choix: ["Le courant, très fort", "Le vent dans les voiles", "La nuit qui tombe", "Les cris de l'équipage"],
      reponse: "Le courant, très fort",
      explication: "Le courant emporte Jim de plus en plus vite vers le navire. C'est lui qui fait office d'accélérateur.", source: S },
    { id: "litterature-s06-2-q5", fiche: "litterature-s06-2-f1", type: "vrai_faux", niveau: 2,
      enonce: "Pour donner une impression de vitesse, le narrateur décrit le navire longuement, détail après détail, pendant toute une page.",
      corrections: ["Faux : le navire passe en un instant d'une forme vague au loin à un objet tout proche.", "Faux : le narrateur ne décrit pas du tout le navire.", "Faux : le narrateur décrit seulement le courant, jamais le navire."],
      reponse: { vrai: false, correction: "Faux : le navire passe en un instant d'une forme vague au loin à un objet tout proche." },
      explication: "C'est l'inverse : la description va très vite, du lointain au tout proche. Une longue description ralentirait le récit.", source: S },
    { id: "litterature-s06-2-q6", fiche: "litterature-s06-2-f1", type: "ordre", niveau: 2,
      enonce: "Remets dans l'ordre ce que perçoit Jim à mesure qu'il se rapproche du navire.",
      elements: ["Il est à côté du navire et l'attrape", "Une tache sombre, à peine visible, au loin", "Les mâts et la coque se dessinent"],
      reponse: [1, 2, 0],
      explication: "D'abord une tache sombre au loin, puis les mâts et la coque prennent forme, et l'instant d'après Jim touche le navire. Le tout en quelques lignes : c'est la vitesse.", source: S },
    { id: "litterature-s06-2-q7", fiche: "litterature-s06-2-f1", type: "qcm", niveau: 3,
      enonce: "Pourquoi peut-on dire que le courant est un « accélérateur de temps » dans ce passage ?",
      choix: ["Il rapproche le navire de Jim bien plus vite que prévu", "Il laisse au narrateur le temps de décrire le navire en détail", "Il ralentit le canot de Jim", "Il éloigne le navire de Jim"],
      reponse: "Il rapproche le navire de Jim bien plus vite que prévu",
      explication: "Plus Jim avance, plus le courant est rapide : le navire arrive sur lui d'un coup. Le courant fait donc aller le temps du récit plus vite.", source: S },
    { id: "litterature-s06-2-q8", fiche: "litterature-s06-2-f1", type: "qcm_multiple", niveau: 3,
      enonce: "Quels procédés donnent une impression de vitesse dans ce passage ? (plusieurs réponses)",
      choix: ["Le navire passe du lointain au tout proche en un instant", "Un courant fort accélère tout", "Les verbes sont au passé simple et les actions s'enchaînent", "Le narrateur énumère tous les objets du navire", "Le narrateur compare le navire à une vieille maison"],
      reponse: ["Le navire passe du lointain au tout proche en un instant", "Un courant fort accélère tout", "Les verbes sont au passé simple et les actions s'enchaînent"],
      explication: "Loin puis tout près, un courant accélérateur, des actions brusques au passé simple : trois ingrédients de la vitesse. Une énumération d'objets ou une comparaison ne sont pas dans ce passage.", source: S },
    // f2 : le passé simple et le personnage pris de court
    { id: "litterature-s06-2-q9", fiche: "litterature-s06-2-f2", type: "qcm", niveau: 1,
      enonce: "À quel temps sont les verbes du passage rapide où Jim rejoint le navire ?",
      choix: ["Au passé simple", "À l'imparfait de l'indicatif", "Au futur", "Au présent"],
      reponse: "Au passé simple",
      explication: "Les actions sont au passé simple : elles tombent d'un coup, l'une après l'autre. L'imparfait aurait étiré la scène.", source: S },
    { id: "litterature-s06-2-q10", fiche: "litterature-s06-2-f2", type: "vrai_faux", niveau: 1,
      enonce: "Dans ce passage, le passé simple fait sentir que les actions tombent d'un coup, l'une après l'autre.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : le passé simple enchaîne des actions brusques. Il va avec la vitesse du passage.", source: S },
    { id: "litterature-s06-2-q11", fiche: "litterature-s06-2-f2", type: "qcm", niveau: 2,
      enonce: "Comment le texte montre-t-il que Jim est pris de court ?",
      choix: ["Il n'est plus sûr de ce qu'il perçoit, tant tout va vite", "Il décrit calmement, détail après détail, chaque partie du navire", "Il compte lentement les secondes qui passent", "Il explique qu'il avait tout prévu depuis longtemps"],
      reponse: "Il n'est plus sûr de ce qu'il perçoit, tant tout va vite",
      explication: "Jim précise que c'est ce qu'il lui a semblé : il doute de ce qu'il a perçu. Tout est allé trop vite pour lui.", source: S },
    { id: "litterature-s06-2-q12", fiche: "litterature-s06-2-f2", type: "qcm", niveau: 2,
      enonce: "Que veut dire « être pris de court » ?",
      choix: ["Être surpris par quelque chose qui arrive trop vite", "Être épuisé après avoir couru pendant très longtemps", "Avoir perdu son chemin dans le noir", "Être moins grand que les autres"],
      reponse: "Être surpris par quelque chose qui arrive trop vite",
      explication: "Être pris de court, c'est être surpris, sans avoir eu le temps de réagir. C'est ce qui arrive à Jim quand le navire surgit.", source: S },
    { id: "litterature-s06-2-q13", fiche: "litterature-s06-2-f2", type: "vrai_faux", niveau: 2,
      enonce: "Le passé simple, dans ce passage, montre un personnage calme qui a tout prévu.",
      corrections: ["Faux : il montre un personnage pris de court, dépassé par la vitesse des événements.", "Faux : il montre un personnage qui se souvient de son enfance.", "Faux : il montre un personnage qui décrit un paysage immobile."],
      reponse: { vrai: false, correction: "Faux : il montre un personnage pris de court, dépassé par la vitesse des événements." },
      explication: "Le passé simple enchaîne des actions brusques : Jim est surpris, pas calme. Il n'est même plus sûr de ce qu'il a vu.", source: S },
    { id: "litterature-s06-2-q14", fiche: "litterature-s06-2-f2", type: "qcm_multiple", niveau: 2,
      enonce: "Quelles phrases sont au passé simple ? (plusieurs réponses)",
      choix: ["Il ouvrit la porte et entra.", "Elle sauta dans l'eau.", "Il ouvrait la porte chaque matin.", "Nous partirons demain.", "Le chat dort."],
      reponse: ["Il ouvrit la porte et entra.", "Elle sauta dans l'eau."],
      explication: "« Ouvrit », « entra », « sauta » sont au passé simple : des actions brusques. « Ouvrait » est à l'imparfait, « partirons » au futur, « dort » au présent.", source: S },
    { id: "litterature-s06-2-q15", fiche: "litterature-s06-2-f2", type: "qcm", niveau: 3,
      enonce: "Pourquoi le passé simple convient-il à un passage qui va très vite ?",
      choix: ["Il enchaîne des actions brusques, l'une après l'autre", "Il décrit un décor qui ne bouge pas", "Il annonce ce qui se passera plus tard", "Il exprime une habitude qui se répète tous les jours de l'année"],
      reponse: "Il enchaîne des actions brusques, l'une après l'autre",
      explication: "Au passé simple, chaque action tombe d'un coup et la suivante arrive aussitôt. Le récit avance donc à toute vitesse.", source: S },
    { id: "litterature-s06-2-q16", fiche: "litterature-s06-2-f2", type: "trou", niveau: 1,
      enonce: "Complète la phrase.",
      texte: "Dans le passage rapide, les verbes sont au passé ___ ; Jim, surpris, est pris de ___.",
      banque: ["simple", "court", "composé", "longue"],
      reponse: [["simple"], ["court"]],
      explication: "Le passé simple enchaîne les actions brusques. Jim, dépassé par la vitesse, est pris de court.", source: S },
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
      enonce: "Le sujet impose le capitaine Smollett comme narrateur et un récit de 5 à 10 lignes. Quel texte respecte le sujet ?",
      choix: ["Sept lignes où le capitaine raconte la scène en disant « je »", "Sept lignes où Jim raconte la scène en disant « je »", "Vingt lignes où le capitaine raconte la scène en disant « je »", "Deux lignes où le capitaine se présente"],
      reponse: "Sept lignes où le capitaine raconte la scène en disant « je »",
      explication: "Le narrateur imposé est le capitaine et sept lignes tiennent entre cinq et dix. Avec Jim, le narrateur est faux ; vingt lignes, c'est trop ; deux, pas assez.", source: S },
    { id: "litterature-s06-2-q22", fiche: "litterature-s06-2-f3", type: "qcm_multiple", niveau: 2,
      enonce: "Pour réécrire une scène avec un nouveau narrateur, que faut-il faire ? (plusieurs réponses)",
      choix: ["Faire dire « je » au nouveau narrateur", "Raconter ce que ce personnage voit et pense", "Respecter le nombre de lignes demandé", "Garder le même narrateur qu'avant", "Changer l'histoire du tout au tout"],
      reponse: ["Faire dire « je » au nouveau narrateur", "Raconter ce que ce personnage voit et pense", "Respecter le nombre de lignes demandé"],
      explication: "Le nouveau narrateur dit « je » et livre sa façon de voir ; on respecte aussi la longueur du sujet. La scène reste la même, racontée autrement.", source: S },
    { id: "litterature-s06-2-q23", fiche: "litterature-s06-2-f3", type: "association", niveau: 3,
      enonce: "Relie chaque mot à sa définition.",
      gauche: ["Narrateur", "Changer de narrateur", "Sujet du récit", "Focalisation interne"],
      droite: ["Suivre l'histoire à travers ce qu'un personnage ressent", "Celui qui raconte et dit « je »", "Ce qui impose le narrateur et la longueur", "Un autre personnage prend la parole et dit « je »"],
      reponse: [[0, 1], [1, 3], [2, 2], [3, 0]],
      explication: "Le narrateur raconte ; en changer, c'est donner « je » à un autre personnage. Le sujet fixe les consignes, et la focalisation interne suit ce qu'un personnage ressent.", source: S },
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
