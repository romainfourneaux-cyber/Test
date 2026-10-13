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

  function questionsDeFiche(ficheId, niveaux) {
    var x = fiche(ficheId);
    if (!x) return [];
    return questionsDuCours(x.cours).filter(function (q) {
      return q.fiche === ficheId && (!niveaux || niveaux.indexOf(q.niveau) >= 0);
    });
  }

  // Choisit une question pour une fiche : évite celles déjà vues récemment, adapte le niveau.
  function choisirPourFiche(ficheId, options) {
    options = options || {};
    var niveaux = options.niveaux || [1, 2];
    var liste = questionsDeFiche(ficheId, niveaux).filter(function (q) {
      return (!options.types || options.types.indexOf(q.type) >= 0) && (!options.exclure || options.exclure.indexOf(q.id) < 0);
    });
    if (!liste.length) liste = questionsDeFiche(ficheId, niveaux).filter(function (q) { return !options.types || options.types.indexOf(q.type) >= 0; });
    if (!liste.length) return null;
    var etat = JEU.sauvegarde.etat();
    var vues = (etat && etat.questionsVues) || {};
    var niveauVoulu = JEU.questions.niveauConseille();
    liste = U.melanger(liste).sort(function (a, b) {
      var va = vues[a.id] ? 1 : 0, vb = vues[b.id] ? 1 : 0;
      if (va !== vb) return va - vb;
      return Math.abs(a.niveau - niveauVoulu) - Math.abs(b.niveau - niveauVoulu);
    });
    return liste[0];
  }

  // Difficulté adaptative : vise environ 8 réussites sur 10 sur les 10 dernières réponses.
  var recentes = [];
  function retenir(juste) { recentes.push(juste ? 1 : 0); if (recentes.length > 10) recentes.shift(); }
  function niveauConseille() {
    if (recentes.length < 4) return 1;
    var taux = recentes.reduce(function (a, b) { return a + b; }, 0) / recentes.length;
    if (taux >= 0.85) return 2;
    if (taux < 0.7) return 1;
    return 1.5;
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

  // Applique les effets d'une réponse : Leitner, statistiques, ressources (1 par bonne réponse).
  function enregistrerReponse(q, juste, gain) {
    var etat = JEU.sauvegarde.etat();
    JEU.leitner.noter(etat, q.fiche, juste);
    etat.stats.total++;
    if (juste) etat.stats.bonnes++;
    etat.questionsVues[q.id] = (etat.questionsVues[q.id] || 0) + 1;
    retenir(juste);
    var res = null;
    if (juste) {
      res = JEU.MATIERES[q.matiere] ? JEU.MATIERES[q.matiere].ressource : null;
      if (res) etat.ressources[res] += (gain == null ? 1 : gain);
      // la récompense s'envole vers son médaillon (sans retarder la question suivante)
      if (res && JEU.anim && typeof document !== "undefined") {
        JEU.anim.gain(res, gain == null ? 1 : gain, document.querySelector("#ecran-partie .question, #ecran-partie .carte-sceau, #ecran-partie .champ-bataille"));
      }
    }
    JEU.sauvegarde.enregistrer();
    return res;
  }

  JEU.questions = {
    JOUABLES: JOUABLES, indexer: indexer, fiche: fiche, toutesFiches: toutesFiches,
    questionsDuCours: questionsDuCours, questionsDeFiche: questionsDeFiche, choisirPourFiche: choisirPourFiche,
    corriger: corriger, texteReponse: texteReponse, enregistrerReponse: enregistrerReponse,
    niveauConseille: niveauConseille, decoder: decoder,
    vider: function () { cache = {}; fiches = null; }
  };
})(typeof window !== "undefined" ? window : globalThis);
