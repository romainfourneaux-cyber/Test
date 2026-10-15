// Questions : préparation (débrouillage, variantes fabriquées à partir des fiches), choix et correction.
// Le rendu à l'écran est dans interface.js (JEU.ui.poserQuestion).
(function (racine) {
  "use strict";
  var JEU = racine.JEU;
  var U = JEU.util;
  var JOUABLES = ["qcm", "qcm_multiple", "vrai_faux", "association", "ordre", "trou"];

  var cache = {};       // coursId -> [questions préparées]
  var fiches = null;    // ficheId -> { fiche, cours, matiere, bonus? }

  function indexer() {
    fiches = {};
    var d = JEU.donnees;
    Object.keys(d.cours).forEach(function (cid) {
      var c = d.cours[cid];
      var m = U.matiereDe(cid);
      (c.fiches || []).forEach(function (f) { fiches[f.id] = { fiche: f, cours: cid, matiere: m }; });
    });
    Object.keys(d.anglais).forEach(function (cid) {
      var s = d.anglais[cid];
      ["vocabulaire", "structures", "phrases"].forEach(function (k) {
        (s[k] || []).forEach(function (el) {
          var titre = el.en ? el.en + " : " + el.fr : el.regle;
          fiches[el.id] = { fiche: { id: el.id, notion: titre, titre: titre, texte: el.regle || el.exemple || "", source: el.source }, cours: cid, matiere: "anglais" };
        });
      });
    });
  }

  function fiche(id) { if (!fiches) indexer(); return fiches[id] || null; }
  function toutesFiches() { if (!fiches) indexer(); return fiches; }

  function decoder(q) {
    try { return JSON.parse(JEU.debrouiller(q.r)); } catch (e) { return null; }
  }

  function preparer(q, coursId) {
    var p = {};
    for (var k in q) if (Object.prototype.hasOwnProperty.call(q, k)) p[k] = q[k];
    p.reponse = q.reponse !== undefined ? q.reponse : decoder(q);
    p.cours = coursId;
    p.matiere = U.matiereDe(coursId);
    p.poids = q.poids || 1;
    return p;
  }

  // ----- variantes fabriquées à partir des fiches -----
  function vocabulaireMatiere(matiere) {
    var res = [];
    var tf = toutesFiches();
    Object.keys(tf).forEach(function (fid) {
      var x = tf[fid];
      if (x.matiere !== matiere) return;
      (x.fiche.vocabulaire || []).forEach(function (v) { res.push({ mot: v.mot, def: v.def, fiche: fid, cours: x.cours }); });
    });
    return res;
  }

  function fabriquer(coursId) {
    var c = JEU.donnees.cours[coursId];
    if (!c) return [];
    var m = U.matiereDe(coursId);
    var voc = vocabulaireMatiere(m);
    var res = [];
    (c.fiches || []).forEach(function (f) {
      (f.vocabulaire || []).forEach(function (v, i) {
        // leurres pris d'abord dans le même cours, puis dans la même matière
        var autres = voc.filter(function (w) { return w.mot !== v.mot && w.def !== v.def; });
        var memeCours = U.melanger(autres.filter(function (w) { return w.cours === coursId; }));
        var ailleurs = U.melanger(autres.filter(function (w) { return w.cours !== coursId; }));
        var leurres = memeCours.concat(ailleurs).slice(0, 3);
        if (leurres.length < 3) return;
        res.push({
          id: f.id + "-gv" + (i + 1), fiche: f.id, type: "qcm", niveau: 1, fabriquee: true,
          enonce: "Que veut dire « " + v.mot + " » ?",
          choix: U.melanger([v.def].concat(leurres.map(function (w) { return w.def; }))),
          reponse: v.def,
          explication: "« " + v.mot + " » : " + v.def + ".",
          source: f.source, poids: 1
        });
      });
    });
    // association de vocabulaire sur tout le cours (4 paires)
    var vc = [];
    (c.fiches || []).forEach(function (f) { (f.vocabulaire || []).forEach(function (v) { vc.push({ mot: v.mot, def: v.def, fiche: f.id, source: f.source }); }); });
    if (vc.length >= 4) {
      for (var n = 0; n < Math.min(3, Math.floor(vc.length / 2)); n++) {
        var lot = U.melanger(vc).slice(0, 4);
        var droite = U.melanger(lot.map(function (x, i) { return i; }));
        res.push({
          id: coursId + "-ga" + (n + 1), fiche: lot[0].fiche, type: "association", niveau: 2, fabriquee: true,
          enonce: "Relie chaque mot à sa définition.",
          gauche: lot.map(function (x) { return x.mot; }),
          droite: droite.map(function (i) { return lot[i].def; }),
          reponse: lot.map(function (x, i) { return [i, droite.indexOf(i)]; }),
          explication: lot.map(function (x) { return x.mot + " : " + x.def; }).join(" ; ") + ".",
          source: lot[0].source, poids: 1
        });
      }
    }
    // frise : dates du cours à remettre dans l'ordre
    var dates = [];
    (c.fiches || []).forEach(function (f) { (f.dates || []).forEach(function (d) { if (d && d.annee != null) dates.push({ annee: d.annee, evenement: d.evenement, fiche: f.id, source: f.source }); }); });
    if (dates.length >= 3) {
      var lotD = U.melanger(dates).slice(0, Math.min(5, dates.length));
      var juste = lotD.slice().sort(function (a, b) { return a.annee - b.annee; });
      res.push({
        id: coursId + "-gf1", fiche: lotD[0].fiche, type: "ordre", niveau: 2, fabriquee: true,
        enonce: "Range ces événements du plus ancien au plus récent.",
        elements: lotD.map(function (x) { return x.evenement; }),
        reponse: juste.map(function (x) { return lotD.indexOf(x); }),
        explication: juste.map(function (x) { return x.annee + " : " + x.evenement; }).join(" ; ") + ".",
        source: lotD[0].source, poids: 1
      });
    }
    return res.map(function (q) { return preparer(q, coursId); });
  }

  function questionsDuCours(coursId) {
    if (cache[coursId]) return cache[coursId];
    var c = U.coursCharge(coursId);
    if (!c) return [];
    var main = (c.questions || []).map(function (q) { return preparer(q, coursId); })
      .filter(function (q) { return q.reponse !== null && JOUABLES.indexOf(q.type) >= 0; });
    cache[coursId] = main.concat(fabriquer(coursId));
    return cache[coursId];
  }

  // Questions d'un cours rangées par fiche : [{ fiche, questions }] dans l'ordre du cours (gardé en cache, pour le tirage).
  var parFiche = {};
  function questionsParFiche(coursId) {
    if (parFiche[coursId]) return parFiche[coursId];
    var res = [], ou = {}, liste = questionsDuCours(coursId);
    liste.forEach(function (q) {
      var g = ou[q.fiche];
      if (!g) { g = ou[q.fiche] = { fiche: q.fiche, questions: [] }; res.push(g); }
      g.questions.push(q);
    });
    if (cache[coursId]) parFiche[coursId] = res;
    return res;
  }

  function questionsDeFiche(ficheId, niveaux) {
    var x = fiche(ficheId);
    if (!x) return [];
    var groupes = questionsParFiche(x.cours);
    for (var i = 0; i < groupes.length; i++) {
      if (groupes[i].fiche !== ficheId) continue;
      return groupes[i].questions.filter(function (q) { return !niveaux || niveaux.indexOf(q.niveau) >= 0; });
    }
    return [];
  }

  // Niveaux tirés : 1 et 2 par défaut (conseil du royaume, événements). Une bataille tire aussi le niveau 3 (demande de
  // Romain, 15/10/2026 : difficulté relevée) : elle fait son tirage dans avecNiveaux(NIVEAUX_BATAILLE, tirage).
  var NIVEAUX = [1, 2], NIVEAUX_BATAILLE = [1, 2, 3], niveauxEnCours = NIVEAUX;
  function avecNiveaux(niveaux, f) {
    var avant = niveauxEnCours;
    niveauxEnCours = niveaux;
    try { return f(); } finally { niveauxEnCours = avant; }
  }
  // Niveau le plus haut du tirage en cours (2 hors bataille, 3 en bataille) : les « Seconde chance » le suivent (rappels.js).
  function niveauMax() { return Math.max.apply(null, niveauxEnCours); }

  // ----- mémoire des questions posées (demande de Romain, 15/10/2026 : « elles reviennent souvent ») -----
  // Sauvegardée (schéma 5) : etat.posees = { horloge, questions: { id: horloge } }. horloge compte les réponses données
  // depuis le début, toutes parties confondues ; questions[id] est la valeur de l'horloge quand la question a été posée
  // pour la dernière fois (« Seconde chance » comprise). Une question posée parmi les « fenêtre » dernières ne ressort pas
  // au tirage ordinaire (JEU.recit.suite) ; seule sa « Seconde chance » peut revenir plus tôt.
  var ANCIENNE = -1e9; // vue avant le schéma 5 (questionsVues), sans date : comme posée il y a très longtemps
  function poseesVides() { return { horloge: 0, questions: {} }; }
  // Répare une mémoire absente ou abîmée sans rien perdre de ce qui est lisible (une horloge illisible repart de la
  // plus grande valeur notée, pour qu'aucune question ne semble posée « dans le futur »).
  function completerPosees(m) {
    if (!m || typeof m !== "object" || Array.isArray(m)) return poseesVides();
    if (!m.questions || typeof m.questions !== "object" || Array.isArray(m.questions)) m.questions = {};
    if (typeof m.horloge !== "number" || !isFinite(m.horloge) || m.horloge < 0) {
      m.horloge = 0;
      Object.keys(m.questions).forEach(function (id) { var h = m.questions[id]; if (typeof h === "number" && isFinite(h) && h > m.horloge) m.horloge = h; });
    }
    return m;
  }
  function posees(etat) {
    etat = etat || JEU.sauvegarde.etat();
    if (!etat) return poseesVides();
    var m = etat.posees;
    if (!m || typeof m.horloge !== "number" || !m.questions || typeof m.questions !== "object") m = etat.posees = completerPosees(m);
    return m;
  }
  // Dernière fois où la question a été posée : -Infinity si jamais.
  function dernierePose(id, m, vues) {
    var h = m.questions[id];
    if (typeof h === "number" && isFinite(h)) return h;
    return vues && vues[id] ? ANCIENNE : -Infinity;
  }
  function reglage(nom, defaut) {
    var n = JEU.donnees.config && JEU.donnees.config[nom];
    return typeof n === "number" && isFinite(n) && n >= 0 ? Math.floor(n) : defaut;
  }
  // Fenêtre anti-répétition d'un tirage où « pool » questions peuvent sortir : config.fenetreQuestions (60), jamais plus
  // de la moitié du pool, pour qu'un petit pool (les vrai ou faux du conseil, un jeu qui commence) ne bloque jamais.
  function fenetre(pool) { return Math.max(0, Math.min(reglage("fenetreQuestions", 60), Math.floor(pool / 2))); }

  // Séance : en mémoire seulement (elle repart de zéro quand le jeu est rouvert, ou quand la sauvegarde change), pour
  // chaque fiche, l'horloge de sa dernière bonne réponse et son nombre de bonnes réponses dans la séance.
  var seance = { etat: null, fiches: {} };
  function fichesSeance(etat) {
    if (seance.etat !== etat) seance = { etat: etat, fiches: {} };
    return seance.fiches;
  }
  // Repos d'une fiche au tirage ordinaire (une « Seconde chance » passe outre). derniere : la dernière fois qu'une de
  // ses questions a été posée.
  //  - posée parmi les config.reposFiche (10) dernières questions : elle attend ;
  //  - réussie parmi les config.reposFicheJuste (15) dernières questions de la séance : elle attend.
  function enRepos(ficheId, derniere, etat) {
    etat = etat || JEU.sauvegarde.etat();
    var h = posees(etat).horloge;
    if (derniere > h - reglage("reposFiche", 10)) return true;
    var s = fichesSeance(etat)[ficheId];
    return !!s && s.juste > h - reglage("reposFicheJuste", 15);
  }
  // Fiches à revoir (a-retravailler.js, cours « à revoir » de suivi.js) qui gardent leur priorité dans cette séance :
  // une fiche réussie deux fois dans la séance redevient une notion comme les autres jusqu'à la séance suivante, où sa
  // priorité revient. (L'écarter tout à fait vidait une matière presque entière à revoir, comme la géographie, des
  // longues séances : 2 % des questions au lieu de 25 %.)
  var REUSSITES_A_REVOIR = 2;
  function aRevoirEnCours(ids, etat) {
    var f = fichesSeance(etat || JEU.sauvegarde.etat());
    return ids.filter(function (id) { return !f[id] || f[id].justes < REUSSITES_A_REVOIR; });
  }
  // Après chaque réponse (enregistrerReponse) : l'horloge avance, la question est datée, la séance retient les réussites.
  function noterPosee(q, juste, etat) {
    var m = posees(etat);
    m.horloge++;
    m.questions[q.id] = m.horloge;
    if (juste) {
      var f = fichesSeance(etat), s = f[q.fiche] || (f[q.fiche] = { juste: 0, justes: 0 });
      s.juste = m.horloge; s.justes++;
    }
  }

  // Niveau visé pour un choix : le niveau conseillé, arrondi au hasard quand il tombe entre deux (1,5 : le niveau 1 une
  // fois sur deux, le niveau 2 l'autre), pour que les niveaux posés suivent en moyenne le niveau conseillé.
  function niveauVise(voulu) { var b = Math.floor(voulu); return b + (Math.random() < voulu - b ? 1 : 0); }

  // Choisit une question pour une fiche. Seul JEU.recit.suite l'appelle ; c'est lui qui place ensuite les rappels des
  // questions ratées (rappels.js). options : niveaux, types, exclure (identifiants à ne pas prendre), fenetre (nombre :
  // une question posée parmi les « fenetre » dernières n'est jamais prise ; si toutes le sont, null, et la fiche est
  // remplacée). Sans fenetre (dernier recours du tirage), une question exclue peut être reprise faute d'autre.
  // Ordre (15/10/2026) : le niveau le plus proche du niveau visé (niveauVise ; à égalité, du niveau conseillé), avant
  // tout le reste (avant, une question jamais vue passait devant, si bien qu'un élève en difficulté recevait encore
  // beaucoup de niveau 3) ; puis les questions jamais posées, puis celle posée il y a le plus longtemps (puis la moins
  // souvent vue) ; à égalité, au hasard.
  function choisirPourFiche(ficheId, options) {
    options = options || {};
    var niveaux = options.niveaux || niveauxEnCours;
    var toutes = questionsDeFiche(ficheId, niveaux).filter(function (q) { return !options.types || options.types.indexOf(q.type) >= 0; });
    var etat = JEU.sauvegarde.etat();
    var m = posees(etat), vues = (etat && etat.questionsVues) || {};
    var limite = options.fenetre > 0 ? m.horloge - options.fenetre : null;
    var liste = toutes.filter(function (q) {
      return (!options.exclure || options.exclure.indexOf(q.id) < 0) && (limite === null || dernierePose(q.id, m, vues) <= limite);
    });
    if (!liste.length && limite === null) liste = toutes;
    if (!liste.length) return null;
    var voulu = niveauConseille(), vise = niveauVise(voulu), cle = {};
    liste.forEach(function (q) { cle[q.id] = [Math.abs(q.niveau - vise), Math.abs(q.niveau - voulu), dernierePose(q.id, m, vues), vues[q.id] || 0]; });
    liste = U.melanger(liste).sort(function (a, b) {
      var ka = cle[a.id], kb = cle[b.id];
      for (var i = 0; i < 4; i++) if (ka[i] !== kb[i]) return ka[i] < kb[i] ? -1 : 1;
      return 0;
    });
    return liste[0];
  }

  // Difficulté adaptative : vise environ 7 réussites sur 10 (8 sur 10 avant le 15/10/2026) sur les 10 dernières réponses.
  // Le niveau conseillé monte d'un demi-cran par tranche de 10 % au-dessus de 7 sur 10 et descend de même en dessous :
  // 9 sur 10 et plus → 3 ; 8 → 2,5 ; 7 → 2 ; 6 → 1,5 ; moins → 1. Au début (moins de 4 réponses) : 1,5. Les questions du
  // niveau le plus proche passent d'abord (à égalité, au hasard) ; le conseil et les événements s'arrêtent au niveau 2.
  var recentes = [];
  function retenir(juste) { recentes.push(juste ? 1 : 0); if (recentes.length > 10) recentes.shift(); }
  function niveauConseille() {
    if (recentes.length < 4) return 1.5;
    var taux = recentes.reduce(function (a, b) { return a + b; }, 0) / recentes.length;
    if (taux >= 0.9) return 3;
    if (taux >= 0.8) return 2.5;
    if (taux >= 0.7) return 2;
    if (taux >= 0.6) return 1.5;
    return 1;
  }

  // ----- correction -----
  // reponseJoueur selon le type :
  //   qcm : texte du choix ; qcm_multiple : [textes] ; vrai_faux : { vrai: bool, correction: texte|null }
  //   association : [[g, d], ...] ; ordre : [indices] ; trou : [textes]
  function corriger(q, rj) {
    var r = q.reponse;
    switch (q.type) {
      case "qcm": return rj === r;
      case "qcm_multiple":
        if (!Array.isArray(rj) || rj.length !== r.length) return false;
        return r.every(function (x) { return rj.indexOf(x) >= 0; });
      case "vrai_faux":
        if (!rj || rj.vrai !== r.vrai) return false;
        if (r.vrai) return true;
        return !q.corrections || !q.corrections.length || rj.correction === r.correction;
      case "association":
        if (!Array.isArray(rj) || rj.length !== r.length) return false;
        return r.every(function (p) { return rj.some(function (x) { return x[0] === p[0] && x[1] === p[1]; }); });
      case "ordre":
        return Array.isArray(rj) && rj.length === r.length && r.every(function (x, i) { return rj[i] === x; });
      case "trou":
        if (!Array.isArray(rj) || rj.length !== r.length) return false;
        return r.every(function (attendus, i) {
          var a = Array.isArray(attendus) ? attendus : [attendus];
          return a.some(function (x) { return U.normaliser(x) === U.normaliser(rj[i]); });
        });
    }
    return false;
  }

  // Texte de la bonne réponse, pour l'afficher après une erreur.
  function texteReponse(q) {
    var r = q.reponse;
    switch (q.type) {
      case "qcm": return r;
      case "qcm_multiple": return r.join(" ; ");
      case "vrai_faux": return r.vrai ? "Vrai." : "Faux. " + (r.correction || "");
      case "association": return r.map(function (p) { return q.gauche[p[0]] + " → " + q.droite[p[1]]; }).join(" ; ");
      case "ordre": return r.map(function (i) { return q.elements[i]; }).join(" → ");
      case "trou": return r.map(function (a) { return Array.isArray(a) ? a[0] : a; }).join(", ");
    }
    return "";
  }

  // Applique les effets d'une réponse : Leitner, statistiques, ressources (1 par bonne réponse), et file des rappels
  // (une question ratée revient un peu plus tard : jeu/js/rappels.js).
  function enregistrerReponse(q, juste, gain) {
    var etat = JEU.sauvegarde.etat();
    JEU.leitner.noter(etat, q.fiche, juste);
    etat.stats.total++;
    if (juste) etat.stats.bonnes++;
    etat.questionsVues[q.id] = (etat.questionsVues[q.id] || 0) + 1;
    noterPosee(q, juste, etat);
    if (JEU.rappels) JEU.rappels.noter(q, juste, etat);
    retenir(juste);
    var res = null;
    if (juste) {
      res = JEU.MATIERES[q.matiere] ? JEU.MATIERES[q.matiere].ressource : null;
      if (res) etat.ressources[res] += (gain == null ? 1 : gain);
      // la récompense s'envole vers son médaillon (sans retarder la question suivante)
      if (res && JEU.anim && typeof document !== "undefined") {
        JEU.anim.gain(res, gain == null ? 1 : gain, document.querySelector("#ecran-partie .question, #ecran-partie .carte-conseil, #ecran-partie .td-cadre"));
      }
    }
    JEU.sauvegarde.enregistrer();
    return res;
  }

  JEU.questions = {
    JOUABLES: JOUABLES, indexer: indexer, fiche: fiche, toutesFiches: toutesFiches,
    questionsDuCours: questionsDuCours, questionsParFiche: questionsParFiche, questionsDeFiche: questionsDeFiche, choisirPourFiche: choisirPourFiche,
    corriger: corriger, texteReponse: texteReponse, enregistrerReponse: enregistrerReponse,
    niveauConseille: niveauConseille, decoder: decoder, retenir: retenir, oublierReponses: function () { recentes = []; },
    NIVEAUX: NIVEAUX, NIVEAUX_BATAILLE: NIVEAUX_BATAILLE, avecNiveaux: avecNiveaux, niveauMax: niveauMax,
    ANCIENNE: ANCIENNE, poseesVides: poseesVides, completerPosees: completerPosees, posees: posees, dernierePose: dernierePose,
    fenetre: fenetre, enRepos: enRepos, aRevoirEnCours: aRevoirEnCours, REUSSITES_A_REVOIR: REUSSITES_A_REVOIR, niveauVise: niveauVise,
    oublierSeance: function () { seance = { etat: null, fiches: {} }; },
    vider: function () { cache = {}; parFiche = {}; fiches = null; }
  };
})(typeof window !== "undefined" ? window : globalThis);
