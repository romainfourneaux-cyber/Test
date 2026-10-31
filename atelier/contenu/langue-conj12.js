// Source en clair du cours langue-conj12 (Grammaire, badge Griffon de cuivre) : les homophones grammaticaux.
// Compilé (réponses brouillées) par node atelier/outils/compiler-cours.js vers jeu/data/cours/langue-conj12.js.
// Source déposée : la fiche du cours 12 de conjugaison, pages 1 et 2 (les pages 3 et 4 sont des exercices dont
// les consignes sont données en classe : rien n'en est repris). Fiche à compléter : on ne s'appuie que sur ce qui
// est imprimé. Les formes que j'aie, qu'il ait et que nous ayons sont imprimées dans le tableau du cours 10.
// Exemples inventés ; aucun ne reprend ceux de la fiche ni le devoir du badge.
// Pas de question « trou » sur a / à : le jeu compare les trous sans tenir compte des accents.
const C12 = (page) => ({ fichier: "cours/langue/Francais 5e - Conjugaison - Cours 12 - Homophones grammaticaux.pdf", page: page });

module.exports = {
  id: "langue-conj12",
  matiere: "langue",
  titre: "Les homophones grammaticaux",
  badge: "cuivre",
  ordre: 3,
  fiches: [
    {
      id: "langue-conj12-f1", notion: "a, as ou à",
      titre: "a, as ou à ?",
      texte: "Ces trois mots se prononcent pareil : ce sont des homophones. « a » est le verbe avoir avec il ou elle, seul ou comme auxiliaire : « Il a froid », « Elle a gagné ». « as » est avoir avec tu : « Tu as raison ». « à » est une préposition, un mot invariable.",
      pointsCles: [
        "a : avoir, avec il ou elle (présent de l'indicatif)",
        "as : avoir, avec tu",
        "à : préposition, mot invariable, avec un accent"
      ],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "homophones", def: "des mots qui se prononcent de la même façon mais ne s'écrivent pas pareil" },
        { mot: "préposition", def: "un mot invariable, comme « à », qui peut exprimer un lieu, un temps, un but…" },
        { mot: "invariable", def: "qui ne change jamais de forme" },
        { mot: "auxiliaire", def: "le verbe avoir ou être quand il sert à former un temps composé : il a gagné" }
      ],
      schema: null, prerequis: [], source: C12(1)
    },
    {
      id: "langue-conj12-f2", notion: "Le truc de « avait »",
      titre: "Le truc : remplacer a par avait",
      texte: "Pour choisir entre a et à, mets la phrase à l'imparfait : essaie de remplacer « a » par « avait ». Si la phrase garde son sens, c'est le verbe ou l'auxiliaire avoir : écris a, sans accent. Si la phrase ne veut plus rien dire, c'est la préposition : écris à, avec un accent.",
      pointsCles: [
        "« avait » convient : a, sans accent",
        "« avait » ne convient pas : à, avec un accent"
      ],
      astuce: "a peut devenir avait ; à, jamais.",
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "imparfait", def: "un temps simple de l'indicatif : il avait, je dessinais" }
      ],
      schema: null, prerequis: ["langue-conj12-f1"], source: C12(1)
    },
    {
      id: "langue-conj12-f3", notion: "Les emplois de la préposition à",
      titre: "À quoi sert la préposition à ?",
      texte: "La préposition « à » ne se conjugue pas et ne change jamais. Elle peut exprimer le lieu (aller à la plage), le temps (à midi), l'appartenance (ce sac est à Lina), le but (un fer à repasser), la manière (parler à voix basse), le moyen (fermer à clé) ou une caractéristique (une jupe à fleurs).",
      pointsCles: [
        "Lieu (à la plage), temps (à midi), appartenance (à Lina)",
        "But (un fer à repasser), manière (à voix basse), moyen (à clé)",
        "Caractéristique (une jupe à fleurs)"
      ],
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "appartenance", def: "le fait d'être à quelqu'un : ce stylo est à moi" },
        { mot: "caractéristique", def: "un trait qui distingue une chose : une jupe à fleurs, un pull à pois" }
      ],
      schema: null, prerequis: ["langue-conj12-f1"], source: C12(1)
    },
    {
      id: "langue-conj12-f4", notion: "est, es ou et",
      titre: "est, es ou et ?",
      texte: "« est » et « es » sont le verbe être à l'indicatif, seul ou auxiliaire : est avec il ou elle (« Le ciel est gris »), es avec tu (« Tu es en retard »). « et » est un mot invariable qui veut dire « + » ou « et puis ».",
      pointsCles: [
        "est : être, avec il ou elle",
        "es : être, avec tu",
        "et : mot invariable, qui veut dire « + » ou « et puis » ; il ajoute un mot, un groupe de mots ou une phrase à un autre"
      ],
      astuce: "Si tu peux dire « et puis », écris et.",
      dates: [], lieux: [], personnages: [],
      vocabulaire: [],
      schema: null, prerequis: ["langue-conj12-f1"], source: C12(1)
    },
    {
      id: "langue-conj12-f5", notion: "ai, aie, aies, ait, aient",
      titre: "ai ou aie, aies, ait, aient ?",
      texte: "« ai » est le verbe avoir à l'indicatif, avec je : « J'ai soif ». « aie, aies, ait, aient » sont avoir au subjonctif présent. Pour reconnaître le subjonctif, change de personne : que j'aie devient que nous ayons. Puis choisis la terminaison selon la personne : que j'aie, que tu aies, qu'il ait, qu'ils aient.",
      pointsCles: [
        "ai : avoir, indicatif, avec je",
        "aie (je), aies (tu), ait (il, elle), aient (ils, elles) : avoir au subjonctif présent",
        "Ces formes servent aussi d'auxiliaire au subjonctif passé : que tu aies gagné",
        "Sept formes se prononcent pareil : est, es, ai, aie, aies, ait, aient ; pour les distinguer, cherche l'infinitif, le mode, le temps et la personne"
      ],
      astuce: "Avec nous, le subjonctif se reconnaît tout de suite : que nous ayons.",
      dates: [], lieux: [], personnages: [],
      vocabulaire: [
        { mot: "terminaison", def: "la fin d'un verbe conjugué, qui change selon la personne : aie, aies, ait, aient" }
      ],
      schema: null, prerequis: ["langue-conj12-f1"], source: C12(2)
    }
  ],
  schemas: [],
  questions: [
    // f1 : a, as ou à
    { id: "langue-conj12-q1", fiche: "langue-conj12-f1", type: "qcm", niveau: 1,
      enonce: "Quel mot complète la phrase ? « Mon frère ___ perdu sa gourde. »",
      choix: ["à", "as", "a", "ai"],
      reponse: "a",
      explication: "On peut dire « mon frère avait perdu sa gourde » : c'est l'auxiliaire avoir, avec il. On écrit donc a, sans accent.", source: C12(1) },
    { id: "langue-conj12-q2", fiche: "langue-conj12-f1", type: "qcm", niveau: 1,
      enonce: "Quel mot complète la phrase ? « Nous allons ___ la piscine. »",
      choix: ["a", "à", "as", "ai"],
      reponse: "à",
      explication: "On ne peut pas dire « nous allons avait la piscine ». C'est la préposition à, avec un accent.", source: C12(1) },
    { id: "langue-conj12-q3", fiche: "langue-conj12-f1", type: "vrai_faux", niveau: 2,
      enonce: "Dans « Tu as un beau sourire », « as » est une préposition.",
      corrections: [
        "Faux : « as » est le verbe avoir, employé avec tu.",
        "Faux : « as » est le verbe avoir, employé avec il ou elle.",
        "Faux : « as » est le verbe être, employé avec tu."
      ],
      reponse: { vrai: false, correction: "Faux : « as » est le verbe avoir, employé avec tu." },
      explication: "La préposition s'écrit à et ne change jamais. « As » est le verbe avoir conjugué avec tu.", source: C12(1) },
    { id: "langue-conj12-q4", fiche: "langue-conj12-f1", type: "qcm", niveau: 2,
      enonce: "Pourquoi écrit-on « as » et non « a » dans « Tu as gagné » ?",
      choix: [
        "Parce que le sujet est tu",
        "Parce que « as » sert d'auxiliaire, « a » non",
        "Parce que « a » sans accent est une préposition",
        "Parce que le verbe est au passé composé"
      ],
      reponse: "Parce que le sujet est tu",
      explication: "Avec tu, le verbe avoir s'écrit as ; avec il ou elle, il s'écrit a. Les deux peuvent servir d'auxiliaire : tu as gagné, elle a gagné.", source: C12(1) },
    { id: "langue-conj12-q24", fiche: "langue-conj12-f1", type: "vrai_faux", niveau: 2,
      enonce: "Dans « Elle a lavé la voiture », « a » est le verbe avoir employé seul.",
      corrections: [
        "Faux : « a » est ici l'auxiliaire avoir, qui forme le passé composé de laver.",
        "Faux : « a » est ici la préposition, écrite sans accent.",
        "Faux : « a » est ici le verbe être, employé avec elle."
      ],
      reponse: { vrai: false, correction: "Faux : « a » est ici l'auxiliaire avoir, qui forme le passé composé de laver." },
      explication: "Suivi du participe passé lavé, « a » sert d'auxiliaire au passé composé. On peut dire « elle avait lavé », donc on l'écrit sans accent.", source: C12(1) },
    { id: "langue-conj12-q25", fiche: "langue-conj12-f1", type: "qcm_multiple", niveau: 3,
      enonce: "Dans quelles phrases faut-il écrire « a » ? Coche toutes les bonnes réponses.",
      choix: ["Je pars ___ la gare.", "Mon oncle ___ une moto.", "Tu ___ un chien ?", "Ma sœur ___ réussi son gâteau.", "Le bébé ___ sommeil."],
      reponse: ["Mon oncle ___ une moto.", "Ma sœur ___ réussi son gâteau.", "Le bébé ___ sommeil."],
      explication: "Avec mon oncle, ma sœur et le bébé, on peut dire « avait » : c'est avoir, écrit a. « Je pars avait la gare » n'a pas de sens, et avec tu on écrit as.", source: C12(1) },
    { id: "langue-conj12-q26", fiche: "langue-conj12-f1", type: "qcm", niveau: 3,
      enonce: "Quelle phrase est bien écrite ?",
      choix: ["Mon voisin à appris a nager.", "Mon voisin a appris a nager.", "Mon voisin à appris à nager.", "Mon voisin a appris à nager."],
      reponse: "Mon voisin a appris à nager.",
      explication: "On peut dire « mon voisin avait appris » : on écrit a, sans accent. « Avait nager » n'a pas de sens : c'est la préposition à.", source: C12(1) },
    { id: "langue-conj12-q27", fiche: "langue-conj12-f1", type: "vrai_faux", niveau: 1,
      enonce: "Quand « à » est une préposition, il s'écrit avec un accent.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "La préposition à porte toujours un accent. Le verbe avoir, lui, s'écrit a, sans accent.", source: C12(1) },
    // f2 : le truc de « avait »
    { id: "langue-conj12-q5", fiche: "langue-conj12-f2", type: "ordre", niveau: 2,
      enonce: "Remets dans l'ordre les étapes du truc pour choisir entre a et à.",
      elements: [
        "Si la phrase a du sens, écrire a ; sinon, écrire à",
        "Remplacer ce mot par « avait »",
        "Repérer le mot où l'on hésite entre a et à",
        "Relire la phrase obtenue"
      ],
      reponse: [2, 1, 3, 0],
      explication: "On repère le mot, on essaie « avait », puis on relit. Si la phrase garde son sens, c'est a ; sinon, c'est à.", source: C12(1) },
    { id: "langue-conj12-q6", fiche: "langue-conj12-f2", type: "qcm", niveau: 2,
      enonce: "Comment vérifier qu'il faut écrire « a » sans accent ?",
      choix: [
        "On essaie de le remplacer par « et puis »",
        "On essaie de le remplacer par « avait »",
        "On change de personne pour dire « ayons »",
        "On regarde si le mot suivant est au pluriel"
      ],
      reponse: "On essaie de le remplacer par « avait »",
      explication: "Si « avait » convient, c'est le verbe ou l'auxiliaire avoir : on écrit a, sans accent. « Et puis » sert pour et, et « ayons » pour reconnaître le subjonctif.", source: C12(1) },
    { id: "langue-conj12-q7", fiche: "langue-conj12-f2", type: "vrai_faux", niveau: 1,
      enonce: "Dans « Elle a pris son parapluie », on peut remplacer « a » par « avait » : il faut donc écrire a, sans accent.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "« Elle avait pris son parapluie » a du sens. C'est l'auxiliaire avoir, écrit sans accent.", source: C12(1) },
    { id: "langue-conj12-q8", fiche: "langue-conj12-f2", type: "qcm", niveau: 2,
      enonce: "On essaie le truc : « Le train part avait midi. » Que faut-il en conclure ?",
      choix: [
        "La phrase n'a plus de sens : il faut écrire a",
        "La phrase a du sens : il faut écrire a",
        "La phrase n'a plus de sens : il faut écrire à",
        "La phrase a du sens : il faut écrire à"
      ],
      reponse: "La phrase n'a plus de sens : il faut écrire à",
      explication: "« Le train part avait midi » ne veut rien dire, ce n'est donc pas le verbe avoir. On écrit à, avec un accent.", source: C12(1) },
    { id: "langue-conj12-q28", fiche: "langue-conj12-f2", type: "vrai_faux", niveau: 2,
      enonce: "Pour choisir entre a et à, on remplace le mot par « avait » : si la phrase garde son sens, on écrit à.",
      corrections: [
        "Faux : si la phrase garde son sens, c'est le verbe avoir ; on écrit a, sans accent.",
        "Faux : on remplace le mot par « et puis », et non par « avait ».",
        "Faux : on remplace le mot par « avais », et non par « avait »."
      ],
      reponse: { vrai: false, correction: "Faux : si la phrase garde son sens, c'est le verbe avoir ; on écrit a, sans accent." },
      explication: "Si « avait » convient, c'est le verbe ou l'auxiliaire avoir : a, sans accent. Si la phrase ne veut plus rien dire, c'est la préposition à.", source: C12(1) },
    { id: "langue-conj12-q29", fiche: "langue-conj12-f2", type: "qcm", niveau: 2,
      enonce: "On fait le test : « Mon cousin avait un scooter. » Que faut-il écrire dans « Mon cousin ___ un scooter » ?",
      choix: [
        "à, car la phrase avec « avait » a du sens",
        "a, car la phrase avec « avait » a du sens",
        "à, car c'est un mot invariable",
        "as, car c'est le verbe avoir"
      ],
      reponse: "a, car la phrase avec « avait » a du sens",
      explication: "La phrase avec « avait » garde son sens : c'est le verbe avoir. Avec mon cousin, qu'on peut remplacer par il, on écrit a.", source: C12(1) },
    { id: "langue-conj12-q30", fiche: "langue-conj12-f2", type: "qcm", niveau: 3,
      enonce: "Combien de fois faut-il écrire « à », avec un accent, dans cette phrase ? « Elle ___ offert un livre ___ son frère ___ Noël. »",
      choix: ["Une fois", "Trois fois", "Aucune fois", "Deux fois"],
      reponse: "Deux fois",
      explication: "« Elle avait offert » a du sens : la première fois, on écrit a. « Avait son frère » et « avait Noël » n'en ont pas : on écrit deux fois à.",
      indice: "Fais le test de « avait » à chacun des trois trous.", source: C12(1) },
    { id: "langue-conj12-q31", fiche: "langue-conj12-f2", type: "qcm", niveau: 2,
      enonce: "Laquelle de ces phrases, après le test de « avait », montre qu'il faut écrire « a » ?",
      choix: ["Le facteur avait une sacoche.", "Je vais avait l'école.", "Il habite avait la campagne.", "Ce livre est avait Lucie."],
      reponse: "Le facteur avait une sacoche.",
      explication: "« Le facteur avait une sacoche » garde son sens : on écrira « le facteur a une sacoche ». Dans les trois autres phrases, « avait » ne veut rien dire : il faut à.", source: C12(1) },
    // f3 : les emplois de la préposition à
    { id: "langue-conj12-q9", fiche: "langue-conj12-f3", type: "association", niveau: 2,
      enonce: "Relie chaque exemple à ce qu'exprime la préposition à.",
      gauche: ["Ce ballon est à Hugo.", "Rendez-vous à midi.", "Une chemise à carreaux.", "Nous partons à la mer."],
      droite: ["Le temps", "Une caractéristique", "Le lieu", "L'appartenance"],
      reponse: [[0, 3], [1, 0], [2, 1], [3, 2]],
      explication: "Le ballon est à Hugo : il lui appartient ; midi est un moment, la mer un lieu. Les carreaux, eux, décrivent la chemise.", source: C12(1) },
    { id: "langue-conj12-q10", fiche: "langue-conj12-f3", type: "qcm", niveau: 2,
      enonce: "Dans « une canne à pêche », qu'exprime la préposition à ?",
      choix: ["Le but", "Le lieu", "La manière", "L'appartenance"],
      reponse: "Le but",
      explication: "Une canne à pêche sert à pêcher : à exprime le but. C'est le même emploi que dans « un fer à repasser ».", source: C12(1) },
    { id: "langue-conj12-q11", fiche: "langue-conj12-f3", type: "vrai_faux", niveau: 1,
      enonce: "La préposition à change de forme selon la personne, comme un verbe.",
      corrections: [
        "Faux : à est un mot invariable, il ne change jamais.",
        "Faux : à ne change pas selon la personne, mais il prend un s avec tu.",
        "Faux : à ne change pas, car c'est le verbe avoir sans accent."
      ],
      reponse: { vrai: false, correction: "Faux : à est un mot invariable, il ne change jamais." },
      explication: "Une préposition ne se conjugue pas. Elle garde toujours la même forme : à.", source: C12(1) },
    { id: "langue-conj12-q12", fiche: "langue-conj12-f3", type: "qcm", niveau: 2,
      enonce: "Comment s'écrit le mot qui manque dans « Ce cahier est ___ moi », et pourquoi ?",
      choix: [
        "a : c'est le verbe avoir, qu'on peut remplacer par avait",
        "à : c'est la préposition, qui dit à qui est le cahier",
        "as : c'est le verbe avoir avec tu",
        "a : c'est la préposition, qui ne prend jamais d'accent"
      ],
      reponse: "à : c'est la préposition, qui dit à qui est le cahier",
      explication: "« Ce cahier est avait moi » n'a pas de sens. C'est la préposition à, qui exprime l'appartenance.", source: C12(1) },
    { id: "langue-conj12-q32", fiche: "langue-conj12-f3", type: "vrai_faux", niveau: 2,
      enonce: "Dans « Il ferme le coffre à clé », la préposition à exprime le lieu.",
      corrections: [
        "Faux : elle exprime le moyen ; on ferme le coffre grâce à la clé.",
        "Faux : elle exprime l'appartenance ; la clé est à lui.",
        "Faux : elle exprime le temps."
      ],
      reponse: { vrai: false, correction: "Faux : elle exprime le moyen ; on ferme le coffre grâce à la clé." },
      explication: "La clé est l'outil avec lequel on ferme : à exprime ici le moyen. Le lieu répond à la question « où », comme dans « aller à la plage ».", source: C12(1) },
    { id: "langue-conj12-q33", fiche: "langue-conj12-f3", type: "vrai_faux", niveau: 1,
      enonce: "Dans « Cette trottinette est à mon cousin », la préposition à exprime l'appartenance.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "La trottinette appartient à mon cousin. C'est l'appartenance, comme dans « ce sac est à Lina ».", source: C12(1) },
    { id: "langue-conj12-q34", fiche: "langue-conj12-f3", type: "qcm_multiple", niveau: 3,
      enonce: "Dans quelles expressions la préposition à exprime-t-elle une caractéristique ? Coche toutes les bonnes réponses.",
      choix: ["une machine à coudre", "une robe à pois", "rentrer à minuit", "un pantalon à poches", "marcher à pas lents"],
      reponse: ["une robe à pois", "un pantalon à poches"],
      explication: "Les pois et les poches décrivent la robe et le pantalon : c'est une caractéristique. Une machine à coudre sert à coudre (le but), minuit est un moment et à pas lents une manière.", source: C12(1) },
    { id: "langue-conj12-q35", fiche: "langue-conj12-f3", type: "association", niveau: 3,
      enonce: "Relie chaque exemple à ce qu'exprime la préposition à.",
      gauche: ["une planche à repasser", "rentrer à pied", "se coucher à dix heures", "un bonnet à pompon"],
      droite: ["Le temps", "Une caractéristique", "Le but", "Le moyen"],
      reponse: [[0, 2], [1, 3], [2, 0], [3, 1]],
      explication: "La planche sert à repasser (le but) et l'on rentre grâce à ses pieds (le moyen). Dix heures est un moment de la journée, et le pompon décrit le bonnet.", source: C12(1) },
    // f4 : est, es ou et
    { id: "langue-conj12-q13", fiche: "langue-conj12-f4", type: "qcm", niveau: 1,
      enonce: "Quel mot complète la phrase ? « Mon chat ___ très câlin. »",
      choix: ["est", "et", "es", "ai"],
      reponse: "est",
      explication: "Mon chat peut se remplacer par il, et avec il le verbe être s'écrit est. On ne pourrait pas dire « et puis » à cet endroit.", source: C12(1) },
    { id: "langue-conj12-q14", fiche: "langue-conj12-f4", type: "trou", niveau: 1,
      enonce: "Complète avec est, es ou et.",
      texte: "Le chocolat ___ fondu ___ la crème ___ prête.",
      banque: ["est", "es", "et"],
      reponse: [["est"], ["et"], ["est"]],
      explication: "Le chocolat et la crème vont avec il ou elle : on écrit est. Au milieu, on peut dire « et puis » : c'est et.", source: C12(2) },
    { id: "langue-conj12-q15", fiche: "langue-conj12-f4", type: "vrai_faux", niveau: 2,
      enonce: "Dans « Tu es mon voisin », on pourrait aussi écrire « est ».",
      corrections: [
        "Faux : avec tu, le verbe être s'écrit es.",
        "Faux : avec tu, le verbe avoir s'écrit es.",
        "Faux : est va avec je, et es va avec tu."
      ],
      reponse: { vrai: false, correction: "Faux : avec tu, le verbe être s'écrit es." },
      explication: "Est va avec il ou elle, es va avec tu. Ici, le sujet est tu.", source: C12(1) },
    { id: "langue-conj12-q16", fiche: "langue-conj12-f4", type: "qcm", niveau: 2,
      enonce: "Comment savoir qu'il faut écrire « et » ?",
      choix: [
        "Il change avec la personne",
        "On peut le remplacer par « avait »",
        "On peut le remplacer par « et puis »",
        "On change de personne pour vérifier le mode"
      ],
      reponse: "On peut le remplacer par « et puis »",
      explication: "« Et » a le sens de « + » ou de « et puis ». Si « et puis » convient, on écrit et.", source: C12(2) },
    { id: "langue-conj12-q17", fiche: "langue-conj12-f4", type: "qcm_multiple", niveau: 2,
      enonce: "Dans quelles phrases le mot manquant s'écrit-il « est » ? Coche toutes les bonnes réponses.",
      choix: ["Paul ___ Zoé jouent dehors.", "Le gâteau ___ délicieux.", "Tu ___ très drôle.", "Ma grand-mère ___ partie hier.", "La porte ___ fermée à clé."],
      reponse: ["Le gâteau ___ délicieux.", "Ma grand-mère ___ partie hier.", "La porte ___ fermée à clé."],
      explication: "Le gâteau, ma grand-mère et la porte vont avec il ou elle : c'est est. Entre Paul et Zoé, on peut dire « et puis », et avec tu on écrit es.", source: C12(1) },
    { id: "langue-conj12-q36", fiche: "langue-conj12-f4", type: "vrai_faux", niveau: 2,
      enonce: "Dans « Tu es parti tôt », « es » est l'auxiliaire avoir.",
      corrections: [
        "Faux : « es » est ici l'auxiliaire être, employé avec tu.",
        "Faux : « es » est ici le mot invariable qui veut dire « et puis ».",
        "Faux : « es » est ici l'auxiliaire être, employé avec il."
      ],
      reponse: { vrai: false, correction: "Faux : « es » est ici l'auxiliaire être, employé avec tu." },
      explication: "Es est une forme du verbe être, avec tu ; ici, il sert d'auxiliaire au passé composé de partir. Avec avoir, on aurait écrit as.", source: C12(1) },
    { id: "langue-conj12-q37", fiche: "langue-conj12-f4", type: "qcm", niveau: 3,
      enonce: "Quelle phrase est bien écrite ?",
      choix: ["Mon chien et noir est blanc.", "Mon chien est noir est blanc.", "Mon chien es noir et blanc.", "Mon chien est noir et blanc."],
      reponse: "Mon chien est noir et blanc.",
      explication: "Mon chien va avec il : le verbe être s'écrit est. Entre noir et blanc, on peut dire « et puis » : c'est et.", source: C12(2) },
    { id: "langue-conj12-q38", fiche: "langue-conj12-f4", type: "trou", niveau: 3,
      enonce: "Écris est, es ou et dans chaque trou.",
      texte: "Tu ___ en avance ___ ton frère ___ en retard.",
      reponse: [["es"], ["et"], ["est"]],
      explication: "Avec tu, on écrit es ; avec ton frère, qu'on peut remplacer par il, on écrit est. Au milieu, on peut dire « et puis » : c'est et.", source: C12(2) },
    // f5 : ai, aie, aies, ait, aient
    { id: "langue-conj12-q18", fiche: "langue-conj12-f5", type: "qcm", niveau: 1,
      enonce: "Quel mot complète la phrase ? « J'___ une nouvelle trousse. »",
      choix: ["aie", "est", "ai", "es"],
      reponse: "ai",
      explication: "Avec je, à l'indicatif, le verbe avoir s'écrit ai. Ce n'est pas le subjonctif : avec nous, on dirait « nous avons une nouvelle trousse », pas « nous ayons ».", source: C12(2) },
    { id: "langue-conj12-q19", fiche: "langue-conj12-f5", type: "trou", niveau: 1,
      enonce: "Complète avec la bonne forme de avoir au subjonctif présent.",
      texte: "La monitrice demande que tu ___ ton bonnet et qu'ils ___ leurs lunettes.",
      banque: ["aie", "aies", "ait", "aient"],
      reponse: [["aies"], ["aient"]],
      explication: "Avec tu, on écrit aies ; avec ils, on écrit aient. La terminaison suit la personne.", source: C12(2) },
    { id: "langue-conj12-q20", fiche: "langue-conj12-f5", type: "association", niveau: 2,
      enonce: "Relie chaque début à la bonne forme de avoir au subjonctif présent.",
      gauche: ["que j'", "que tu", "qu'il", "qu'ils"],
      droite: ["aient", "aie", "ait", "aies"],
      reponse: [[0, 1], [1, 3], [2, 2], [3, 0]],
      explication: "Que j'aie, que tu aies, qu'il ait, qu'ils aient. Les quatre se prononcent pareil, seule la terminaison change.", source: C12(2) },
    { id: "langue-conj12-q21", fiche: "langue-conj12-f5", type: "vrai_faux", niveau: 2,
      enonce: "« ait » et « est » sont deux formes du même verbe.",
      corrections: [
        "Faux : « ait » vient du verbe avoir (subjonctif), « est » du verbe être (indicatif).",
        "Faux : les deux viennent du verbe avoir, à deux modes différents.",
        "Faux : « ait » vient du verbe être (subjonctif), « est » du verbe avoir."
      ],
      reponse: { vrai: false, correction: "Faux : « ait » vient du verbe avoir (subjonctif), « est » du verbe être (indicatif)." },
      explication: "Ces deux mots se prononcent pareil mais ne viennent pas du même verbe. Pour les distinguer, on cherche l'infinitif, le mode, le temps et la personne.", source: C12(2) },
    { id: "langue-conj12-q22", fiche: "langue-conj12-f5", type: "qcm", niveau: 2,
      enonce: "« Le cuisinier exige que j'___ les mains propres. » Comment vérifier que le verbe avoir est ici au subjonctif ?",
      choix: [
        "On le remplace par « avait »",
        "On regarde si le verbe est au passé composé",
        "On change de personne : « que nous ayons »",
        "On le remplace par « et puis »"
      ],
      reponse: "On change de personne : « que nous ayons »",
      explication: "Pour reconnaître le subjonctif, on change de personne : avec nous, on dirait « que nous ayons les mains propres ». C'est bien le subjonctif, donc on écrit aie.", source: C12(2) },
    { id: "langue-conj12-q23", fiche: "langue-conj12-f5", type: "ordre", niveau: 3,
      enonce: "Remets dans l'ordre la méthode pour écrire une forme de avoir au subjonctif présent.",
      elements: [
        "Choisir la terminaison qui va avec cette personne",
        "Changer de personne pour vérifier que c'est le subjonctif",
        "Repérer la personne du verbe"
      ],
      reponse: [1, 2, 0],
      explication: "On vérifie d'abord le mode en changeant de personne. Ensuite, on repère la personne pour choisir la bonne terminaison.", source: C12(2) },
    { id: "langue-conj12-q39", fiche: "langue-conj12-f5", type: "vrai_faux", niveau: 2,
      enonce: "Dans « Il faut que tu aies ton casque », « aies » est le verbe avoir à l'indicatif présent.",
      corrections: [
        "Faux : « aies » est le verbe avoir au subjonctif présent, avec tu.",
        "Faux : « aies » est le verbe être au subjonctif présent, avec tu.",
        "Faux : « aies » est le verbe avoir au subjonctif présent, avec je."
      ],
      reponse: { vrai: false, correction: "Faux : « aies » est le verbe avoir au subjonctif présent, avec tu." },
      explication: "Avec nous, on dirait « que nous ayons » : c'est le subjonctif présent. Avec tu, avoir s'écrit aies.", source: C12(2) },
    { id: "langue-conj12-q40", fiche: "langue-conj12-f5", type: "qcm", niveau: 3,
      enonce: "Quelle phrase est bien écrite ?",
      choix: ["Je veux qu'elles ait lavé leurs bottes.", "Je veux qu'elles aient lavé leurs bottes.", "Je veux qu'elles aie lavé leurs bottes.", "Je veux qu'elles ai lavé leurs bottes."],
      reponse: "Je veux qu'elles aient lavé leurs bottes.",
      explication: "Avec elles, l'auxiliaire avoir au subjonctif s'écrit aient. Ait va avec il ou elle, aie avec je, et ai est l'indicatif.", source: C12(2) }
  ],
  bonus: [],
  nonCouvert: [
    "Le rôle de la préposition à devant un complément d'objet indirect (page 1, ligne b) : le mot clé est laissé en blanc et cette fonction n'est expliquée dans aucun cours déposé.",
    "La nature exacte du mot « et » et le verbe qui dit ce qu'il fait (page 2) sont laissés en blanc sur la fiche.",
    "Le tableau du subjonctif présent de avoir (page 2) est vide : les formes du jeu viennent du tableau du cours 10 (que j'aie, qu'il ait, que nous ayons) et de la liste des sept formes imprimée page 2.",
    "L'observation de début de cours et les exercices des pages 3 et 4 : consignes données en classe.",
    "Notions du Griffon de cuivre sans support déposé (tableau de progression) : COI et COS, complément d'attribution, compléments circonstanciels de lieu et de temps ; adjectifs et pronoms interrogatifs, indéfinis et numéraux ; pronoms relatifs.",
    "Les fiches d'exercices des cours 6 et 7 de grammaire (natures des mots) : consignes orales, aucune leçon déposée."
  ]
};
