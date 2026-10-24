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
    langue:      { nom: "Le maître scribe", icone: "parchemin-plume", titre: "veille sur la langue du royaume" },
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
    // question ratée qui revient un peu plus tard (rappels.js) : une seconde chance, rien à perdre
    rappel: [
      "{N} revient vers toi : « Cette question t'a échappé tout à l'heure. Maintenant, tu connais la réponse. »",
      "{N} sourit : « Je te repose la question de tout à l'heure. Une seconde chance de bien faire. »",
      "{N} rouvre son carnet : « Reprenons ce point de tout à l'heure. Tu vas y arriver. »"
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

  // Repère du cours d'une question, pour voir les semaines défiler dans les batailles, les événements et au conseil
  // (demande de Romain, 16/10/2026) : « Semaine 4 · Histoire · Cours 5 » pour un cours du planning (semaine, matière et
  // le numéro que porte son titre : Cours, Séance, Étude de cas, Outil, sinon Thème ; rien de plus si le titre n'en a
  // pas), « Grammaire · Griffon de cuivre » pour un cours de langue (son badge), « Savoir-faire · Histoire » pour une
  // fiche méthode, « Anglais · Séquence 1 » pour une séquence. L'énoncé ne change pas : le repère s'ajoute au cadre.
  // Mémorisé par cours : la question suivante n'attend rien.
  var reperes = {};
  function repere(coursId) {
    if (!coursId) return "";
    if (Object.prototype.hasOwnProperty.call(reperes, coursId)) return reperes[coursId];
    var m = U.matiereDe(coursId), nomM = JEU.MATIERES[m] ? JEU.MATIERES[m].nom : "", c = U.coursCharge(coursId) || {}, P = JEU.progression, r;
    if (/^methode-/.test(coursId)) r = ["Savoir-faire", nomM];
    else if (m === "langue") { var rb = P && c.badge ? P.rangBadge(c.badge) : 99; r = [nomM, rb < 99 ? JEU.BADGES_GRIFFON[rb].nom : ""]; }
    else if (m === "anglais") { var s = String(c.titre || "").match(/^Séquence\s+\d+/); r = [nomM, s ? s[0] : (c.ordre ? "Séquence " + c.ordre : "")]; }
    else {
      var e = P ? P.entree(coursId) : null, t = e ? String(e.titre || "") : "";
      var n = t.match(/(?:^|\s)((?:Cours|Séance|Étude de cas|Outil)\s*\d+)/) || t.match(/(?:^|\s)(Thème\s*\d+)/);
      r = e && typeof e.semaine === "number" ? ["Semaine " + e.semaine, nomM, n ? n[1] : ""] : [nomM];
    }
    r = r.filter(Boolean).join(" · ");
    reperes[coursId] = r;
    return r;
  }

  // Armée qui attaque le domaine : celle du camp donné, sinon celle du front qui attaque dans la campagne.
  function armeeAdverse(camp) {
    if (!camp && JEU.campagne) {
      var attaque = JEU.campagne.etat().rival.attaque;
      if (attaque) camp = JEU.campagne.campDe(attaque);
    }
    return camp && camp.armee ? camp.armee : "l'armée ennemie";
  }

  // Cadre narratif d'une question : { nom, icone, texte, repere?, etiquette? }. camp (facultatif) : le camp adverse d'une
  // défense. repere : la semaine et la matière du cours (fonction repere), affiché sur la ligne du conseiller.
  // Une question ratée qui revient (q.rappel) porte l'étiquette « Seconde chance » ; en bataille et dans un événement,
  // le conseiller le dit avec ses mots. Au conseil du royaume, l'affaire du jour reste la même (seule l'étiquette change).
  function cadre(q, contexte, camp) {
    var c = conseiller(q.matiere);
    var rappel = !!q.rappel && (contexte === "preparation" || contexte === "defense" || contexte === "evenement");
    var liste = rappel ? PHRASES.rappel : PHRASES[contexte] || PHRASES.evenement;
    var texte = U.hasard(liste);
    var nom = c.nom;
    texte = texte.replace("{N}", nom).replace("{n}", nom.charAt(0).toLowerCase() + nom.slice(1));
    if (texte.indexOf("{deArmee}") >= 0) {
      var armee = armeeAdverse(camp);
      texte = texte.replace("{deArmee}", JEU.campagne ? JEU.campagne.avecArticle(armee, "de") : "de " + armee);
    }
    var r = { nom: nom, icone: c.icone, texte: texte };
    var rep = repere(q.cours);
    if (rep) r.repere = rep;
    if (q.rappel) r.etiquette = JEU.rappels ? JEU.rappels.ETIQUETTE : "Seconde chance";
    return r;
  }

  // ---------- tirage des questions ----------
  // Familles de matières pour l'équilibre du tirage : chaque famille qui a des questions a la même part (leitner.tirer).
  // Le français (littérature, lecture suivie, grammaire) forme une seule famille, partagée entre ses trois matières ;
  // un savoir-faire compte dans la matière de sa fiche méthode (champ matiere du cours).
  var FAMILLES = { litterature: "francais", lecture: "francais", langue: "francais" };
  function famille(matiere) { return FAMILLES[matiere] || matiere || ""; }

  // Dernières questions tirées ({ famille, matiere }, la plus récente en dernier), d'un lot à l'autre : l'équilibre se
  // poursuit de vague en vague et de partie en partie. En mémoire seulement : il repart de zéro à l'ouverture du jeu.
  var historique = [];
  function retenir(qs) {
    qs.forEach(function (q) { historique.push({ famille: famille(q.matiere), matiere: q.matiere }); });
    var max = JEU.leitner.FENETRE || 20;
    if (historique.length > max) historique.splice(0, historique.length - max);
  }

  // Candidats : fiches des cours accessibles qui ont des questions jouables (niveaux 1 et 2).
  // regles (facultatif, anti-répétition du 15/10/2026) : { exclure: { id: true }, attente: { id: true }, souple }.
  // Alors une fiche n'est candidate que si une de ses questions peut sortir (bon type, niveau
  // du tirage, pas exclue, pas posée parmi les « fenêtre » dernières questions), et si elle n'est pas au repos
  // (JEU.questions.enRepos, ou une de ses questions attend sa « Seconde chance » : elle viendra d'elle-même). souple : 0,
  // toutes ces règles ; 1, sans le repos des fiches ; 2, sans la fenêtre non plus (le tirage d'avant, qui ne bloque
  // jamais). La fenêtre (JEU.questions.fenetre) se règle sur le nombre de questions qui peuvent sortir : la liste
  // renvoyée la porte (res.fenetre), pour choisirPourFiche.
  function candidats(filtreQuestion, regles) {
    var etat = JEU.sauvegarde.etat();
    var rang = JEU.progression.recence(etat);
    var Q = JEU.questions;
    var mem = regles ? Q.posees(etat) : null, vues = (etat && etat.questionsVues) || {};
    var datees = mem ? mem.questions : {}, exclues = regles ? regles.exclure : {}, ANCIENNE = Q.ANCIENNE;
    var attente = regles && regles.attente || {}, nAttente = Object.keys(attente).length;
    var niveauMax = Q.niveauMax ? Q.niveauMax() : 2;
    var res = [], pool = 0;
    JEU.progression.coursAccessibles(etat).forEach(function (cid) {
      var m = U.matiereDe(cid), fam = famille(m), groupes = Q.questionsParFiche(cid);
      for (var g = 0; g < groupes.length; g++) {
        var qs = groupes[g].questions, jouable = false, derniere = -Infinity, ancienne = Infinity, attend = false;
        for (var i = 0; i < qs.length; i++) {
          var q = qs[i], d = 0;
          if (mem) { // Q.dernierePose, en ligne ; toute question de la fiche compte pour son repos
            d = datees[q.id];
            if (typeof d !== "number") d = vues[q.id] ? ANCIENNE : -Infinity;
            if (d > derniere) derniere = d;
            if (nAttente && attente[q.id]) attend = true;
          }
          if (filtreQuestion && !filtreQuestion(q)) continue;
          if (q.niveau <= 2) jouable = true;
          if (mem && q.niveau <= niveauMax && !exclues[q.id]) { pool++; if (d < ancienne) ancienne = d; }
        }
        if (jouable) res.push({ fiche: groupes[g].fiche, cours: cid, recent: rang[cid] || 0, matiere: m, famille: fam, derniere: derniere, ancienne: ancienne, attend: attend });
      }
    });
    if (!mem) return res;
    var n = regles.souple >= 2 ? 0 : Q.fenetre(pool), limite = mem.horloge - n;
    var garde = res.filter(function (c) {
      if (n && c.ancienne > limite) return false; // toutes ses questions viennent d'être posées (ou sont exclues)
      return regles.souple >= 1 || (!c.attend && !Q.enRepos(c.fiche, c.derniere, etat));
    });
    garde.fenetre = n;
    return garde;
  }

  function index(ids) { var o = {}; for (var i = 0; i < ids.length; i++) o[ids[i]] = true; return o; }

  // Tirage ordinaire : une question par fiche tirée (Leitner, équilibré entre les familles), sans doublon.
  // Seules les fiches qui ont une question du bon type (et qui passent le filtre) sont candidates.
  // interdits : identifiants qui ne sortent jamais, même quand choisirPourFiche, faute d'autre question pour la fiche,
  // reprend une question exclue (les questions ratées en attente, celles déjà tirées pour ce lot).
  // avant : questions déjà dans le lot (premier tirage d'une vague), pour l'équilibre.
  // souple : règles anti-répétition relâchées (voir candidats).
  function tirage(nombre, filtre, types, exclure, interdits, avant, souple) {
    var etat = JEU.sauvegarde.etat();
    var vues = exclure.slice(), qs = [];
    var garder = function (q) { return (!types || types.indexOf(q.type) >= 0) && (!filtre || filtre(q)); };
    var passe = historique.concat((avant || []).map(function (q) { return { famille: famille(q.matiere), matiere: q.matiere }; }));
    var attente = JEU.rappels ? JEU.rappels.enAttente() : [];
    var cands = candidats(garder, { exclure: index(exclure), attente: index(attente), souple: souple || 0 });
    JEU.leitner.tirer(cands, etat, nombre, {
      // une fiche à revoir déjà réussie deux fois dans la séance perd sa priorité jusqu'à la séance suivante
      aRetravailler: JEU.questions.aRevoirEnCours(JEU.progression.fichesARevoir(), etat),
      historique: passe,
      accepter: function (c) {
        var q = JEU.questions.choisirPourFiche(c.fiche, { types: types, exclure: vues, fenetre: cands.fenetre });
        if (!q || (interdits && interdits.indexOf(q.id) >= 0)) return false;
        qs.push(q); vues.push(q.id);
        return true;
      }
    });
    return qs;
  }

  // Après le placement des rappels (qui gardent leur place), remet dans l'ordre les questions ordinaires du lot pour
  // qu'une même famille ne vienne pas trois fois de suite, lots précédents compris, quand c'est évitable.
  function eviterTriples(qs) {
    var f = historique.map(function (h) { return h.famille; });
    var d = f.length;
    var libres = qs.filter(function (q) { return !q.rappel; });
    var res = [];
    function triple(k) { return k >= 2 && f[k] === f[k - 1] && f[k - 1] === f[k - 2]; }
    for (var i = 0; i < qs.length; i++) {
      if (qs[i].rappel) { res.push(qs[i]); f[d + i] = famille(qs[i].matiere); continue; }
      var choix = 0;
      for (var j = 0; j < libres.length; j++) {
        f[d + i] = famille(libres[j].matiere);
        // la place i, et les rappels qui la suivent immédiatement, ne doivent pas faire un triple
        var ok = !triple(d + i);
        for (var k = i + 1; ok && k < qs.length && qs[k].rappel; k++) {
          f[d + k] = famille(qs[k].matiere);
          if (triple(d + k)) ok = false;
        }
        if (ok) { choix = j; break; }
      }
      var q = libres.splice(choix, 1)[0];
      res.push(q);
      f[d + i] = famille(q.matiere);
      f.length = d + i + 1;
    }
    return res;
  }

  // Une suite de questions, pour toute partie (bataille, conseil, événement). C'est le seul tirage du jeu.
  // options : types (types de questions permis), exclure (identifiants déjà posés), filtre (fonction(question) : la
  // garder ?), completer (s'il manque des questions, un tirage de plus, sans le filtre).
  // Les questions ratées en attente (rappels.js) ne sortent pas au tirage ordinaire : elles reviennent à leur place,
  // au-delà des exclusions, du filtre et des règles anti-répétition.
  // Anti-répétition (15/10/2026) : tant que le lot n'est pas plein, du plus strict au plus souple : toutes les règles
  // (une question posée parmi les 60 dernières ne ressort pas ; une fiche posée parmi les 10 dernières, réussie parmi les
  // 15 dernières, ou dont une question attend sa « Seconde chance », se repose ; une fiche à revoir réussie deux fois
  // dans la séance perd sa priorité jusqu'à la séance suivante) ; sans le repos des fiches ; sans le
  // filtre (completer) ; enfin sans la fenêtre, comme le tirage d'avant : le tirage ne bloque jamais.
  function suite(nombre, options) {
    options = options || {};
    var attente = JEU.rappels ? JEU.rappels.enAttente() : [];
    var exclure = (options.exclure || []).concat(attente);
    var f = options.filtre, essais = [[f, 0], [f, 1]];
    if (options.completer) essais.push([null, 1]);
    essais.push([f, 2]);
    if (options.completer) essais.push([null, 2]);
    var qs = [];
    for (var i = 0; i < essais.length && qs.length < nombre; i++) {
      var deja = qs.map(function (q) { return q.id; });
      qs = qs.concat(tirage(nombre - qs.length, essais[i][0], options.types, exclure.concat(deja), attente.concat(deja), qs, essais[i][1]));
    }
    if (JEU.rappels) qs = eviterTriples(JEU.rappels.placer(qs, { types: options.types, longueur: nombre }));
    retenir(qs);
    return qs;
  }

  JEU.recit = {
    CONSEILLERS: CONSEILLERS, conseiller: conseiller, cadre: cadre, repere: repere, candidats: candidats, suite: suite, famille: famille,
    historique: function () { return historique.slice(); }, oublierHistorique: function () { historique = []; }
  };
})(typeof window !== "undefined" ? window : globalThis);
