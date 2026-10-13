// Récit : chaque question est posée par un personnage du domaine, dans la situation du moment
// (préparation d'une bataille, défense, conseil du royaume, événement). L'énoncé du cours ne change pas.
// Aussi : tirage des questions (répétition espacée), commun à la bataille, au conseil et aux événements.
(function (racine) {
  "use strict";
  var JEU = racine.JEU;
  var U = JEU.util;

  // Un conseiller par matière. Personnages fictifs du domaine, sans nom propre. Le royaume d'Angleterre est
  // l'adversaire du front de l'ouest : le conseiller d'anglais est un interprète du domaine, pas un allié des Anglais.
  var CONSEILLERS = {
    histoire:    { nom: "Le chroniqueur", icone: "chroniqueur", titre: "garde la mémoire du royaume" },
    geographie:  { nom: "La cartographe", icone: "routes", titre: "trace les cartes du domaine" },
    svt:         { nom: "L'herboriste", icone: "remedes", titre: "connaît la terre et le ciel" },
    physique:    { nom: "Le maître d'œuvre", icone: "alambics", titre: "dirige les ateliers et les engins" },
    litterature: { nom: "Le ménestrel", icone: "parchemin-plume", titre: "connaît les récits et les mots" },
    lecture:     { nom: "Le ménestrel", icone: "parchemin-plume", titre: "connaît les récits et les mots" },
    anglais:     { nom: "L'interprète", icone: "alliances", titre: "parle la langue des marchands d'outre-Manche" }
  };

  // {N} : le conseiller (« Le chroniqueur ») ; {deArmee} : « de » + l'armée qui attaque (« de l'armée omeyyade »).
  // Au conseil, l'affirmation peut être fausse : la phrase dit qu'il « affirme », « assure », « soutient »…,
  // jamais qu'il « rappelle » ou « enseigne », ce qui la ferait passer pour vraie.
  var PHRASES = {
    preparation: [
      "{N} déroule une carte sous la tente de commandement : « Avant de payer tes ingénieurs, seigneur, dis-moi ceci. »",
      "{N} pose la main sur le coffre de guerre : « Le trésorier n'ouvrira ce coffre que si tu réponds juste. »",
      "Les capitaines attendent tes ordres. {N} te glisse : « Une bonne réponse, et l'or suivra. »",
      "{N} entre dans la tente, une lanterne à la main : « Les hommes veulent savoir si leur chef connaît son affaire. »",
      "Un messager tend un pli scellé. {N} le lit et te regarde : « Réponds, et nos soldats seront payés. »"
    ],
    defense: [
      "Les tambours {deArmee} approchent. {N} monte sur le rempart : « Vite, seigneur, une question avant l'assaut ! »",
      "On voit déjà les bannières {deArmee} sur la colline. {N} t'arrête au pied de la tour : « Réponds, et j'arme les murailles. »",
      "Les paysans se réfugient derrière les murs. {N} te presse : « Pour payer les défenseurs, il faut savoir ceci. »"
    ],
    evenement: [
      "{N} s'approche : « Seigneur, avant de décider, réponds à ceci. »",
      "{N} hésite, puis te demande : « Sais-tu ceci ? De ta réponse dépend la suite. »"
    ],
    tresor: [
      "Un marchand veut ouvrir un comptoir sur tes terres. {N} donne son avis devant le conseil :",
      "Le trésorier compte les pièces de la récolte. {N} s'avance et assure :",
      "Une caravane demande le passage. {N} prend la parole :"
    ],
    peuple: [
      "Les gens d'un hameau se pressent devant la grande salle. {N} les écoute, puis déclare :",
      "Le marché du village s'agite. {N} rapporte ce qu'on y dit :",
      "Une famille demande justice au seigneur. {N} soutient devant le conseil :"
    ],
    garde: [
      "Le capitaine veut renforcer les remparts. {N} assure devant le conseil :",
      "Les sentinelles ont vu des feux sur la colline. {N} affirme :",
      "La garde réclame de nouvelles armes. {N} prétend :"
    ],
    savoir: [
      "On a retrouvé de vieux manuscrits au scriptorium. {N} affirme y avoir lu :",
      "Un savant de passage visite ta bibliothèque. {N} lui répond devant toi :",
      "Les enfants du domaine apprennent à lire. {N} leur assure :"
    ]
  };

  function conseiller(matiere) { return CONSEILLERS[matiere] || CONSEILLERS.histoire; }

  // Armée qui attaque le domaine : celle du camp donné, sinon celle du front qui attaque dans la campagne.
  function armeeAdverse(camp) {
    if (!camp && JEU.campagne) {
      var attaque = JEU.campagne.etat().rival.attaque;
      if (attaque) camp = JEU.campagne.campDe(attaque);
    }
    return camp && camp.armee ? camp.armee : "l'armée ennemie";
  }

  // Cadre narratif d'une question : { nom, icone, texte }. camp (facultatif) : le camp adverse d'une défense.
  function cadre(q, contexte, camp) {
    var c = conseiller(q.matiere);
    var liste = PHRASES[contexte] || PHRASES.evenement;
    var texte = U.hasard(liste);
    var nom = c.nom;
    texte = texte.replace("{N}", nom).replace("{n}", nom.charAt(0).toLowerCase() + nom.slice(1));
    if (texte.indexOf("{deArmee}") >= 0) {
      var armee = armeeAdverse(camp);
      texte = texte.replace("{deArmee}", JEU.campagne ? JEU.campagne.avecArticle(armee, "de") : "de " + armee);
    }
    return { nom: nom, icone: c.icone, texte: texte };
  }

  // ---------- tirage des questions ----------
  // Candidats : fiches des cours accessibles qui ont des questions jouables (niveaux 1 et 2).
  function candidats(filtreQuestion) {
    var etat = JEU.sauvegarde.etat();
    var rang = JEU.progression.recence(etat);
    var res = [];
    JEU.progression.coursAccessibles(etat).forEach(function (cid) {
      var parFiche = {};
      JEU.questions.questionsDuCours(cid).forEach(function (q) {
        if (q.niveau <= 2 && (!filtreQuestion || filtreQuestion(q))) parFiche[q.fiche] = true;
      });
      Object.keys(parFiche).forEach(function (f) { res.push({ fiche: f, cours: cid, recent: rang[cid] || 0 }); });
    });
    return res;
  }

  // Une suite de questions : une par fiche tirée (Leitner, fiches à revoir d'abord), sans doublon.
  function suite(nombre, options) {
    options = options || {};
    var etat = JEU.sauvegarde.etat();
    var fiches = JEU.leitner.tirer(candidats(options.filtre), etat, nombre * 2, { aRetravailler: JEU.progression.fichesARevoir() });
    var vues = (options.exclure || []).slice(), qs = [];
    for (var i = 0; i < fiches.length && qs.length < nombre; i++) {
      var q = JEU.questions.choisirPourFiche(fiches[i].fiche, { types: options.types, exclure: vues });
      if (q) { qs.push(q); vues.push(q.id); }
    }
    return qs;
  }

  JEU.recit = { CONSEILLERS: CONSEILLERS, conseiller: conseiller, cadre: cadre, candidats: candidats, suite: suite };
})(typeof window !== "undefined" ? window : globalThis);
