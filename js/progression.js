// Progression : état de chaque cours (déblocage) et position de l'élève en cours validés.
// États : presume | valide | ouvert | avenir (ouvrable, fichier absent) | brume (pas encore ouvert).
(function (racine) {
  "use strict";
  var JEU = racine.JEU;

  function config() { return JEU.donnees.config || {}; }

  function entreesCours(matiere) {
    return JEU.donnees.planning.filter(function (p) { return p.type === "cours" && (!matiere || p.matiere === matiere); })
      .sort(function (a, b) { return a.ordre - b.ordre; });
  }

  function precedent(entree) {
    var liste = entreesCours(entree.matiere);
    var i = liste.indexOf(entree);
    return i > 0 ? liste[i - 1] : null;
  }

  function entree(id) {
    var p = JEU.donnees.planning;
    for (var i = 0; i < p.length; i++) if (p[i].id === id) return p[i];
    return null;
  }

  function fichierPresent(id) { return !!JEU.util.coursCharge(id); }

  function sequencesAnglais() {
    var a = JEU.donnees.anglais;
    return Object.keys(a).map(function (k) { return a[k]; }).sort(function (x, y) { return x.ordre - y.ordre; });
  }

  function methodes() {
    var c = JEU.donnees.cours;
    return Object.keys(c).filter(function (k) { return /^methode-/.test(k); }).map(function (k) { return c[k]; });
  }

  // Mémo pour éviter de remonter toute la chaîne à chaque appel (vidé à chaque changement d'état).
  var memo = {};
  function oublier() { memo = {}; }

  function etatCours(id, etat) {
    etat = etat || JEU.sauvegarde.etat();
    if (memo[id]) return memo[id];
    var r = calculer(id, etat);
    memo[id] = r;
    return r;
  }

  function calculer(id, etat) {
    var sauve = etat.cours[id];
    if (sauve && sauve.etat === "valide") return "valide";
    if (/^methode-/.test(id)) return fichierPresent(id) ? "ouvert" : "avenir";
    if (/^anglais-/.test(id)) {
      var seq = sequencesAnglais();
      for (var i = 0; i < seq.length; i++) {
        if (seq[i].id === id) {
          if (i === 0) return "ouvert";
          return etatCours(seq[i - 1].id, etat) === "valide" ? "ouvert" : "brume";
        }
      }
      return "avenir";
    }
    var e = entree(id);
    if (!e) return "avenir";
    if (e.semaine < (config().semaineDepart || 1)) return "presume";
    var p = precedent(e);
    var ouvrable = !p || ["valide", "presume"].indexOf(etatCours(p.id, etat)) >= 0;
    if (!ouvrable) return "brume";
    return fichierPresent(id) ? "ouvert" : "avenir";
  }

  // Cours dont les questions peuvent sortir en partie libre (ouverts, validés, présumés avec fichier, méthodes).
  function coursAccessibles(etat) {
    etat = etat || JEU.sauvegarde.etat();
    var ids = Object.keys(JEU.donnees.cours).concat(Object.keys(JEU.donnees.anglais));
    return ids.filter(function (id) {
      var s = etatCours(id, etat);
      return s === "ouvert" || s === "valide" || s === "presume";
    });
  }

  // Rang de récence d'un cours (0 = le plus récent) pour le tirage Leitner.
  function recence(etat) {
    etat = etat || JEU.sauvegarde.etat();
    var ids = coursAccessibles(etat);
    var dates = ids.map(function (id) {
      var s = etat.cours[id];
      var e = entree(id);
      var t = s && s.le ? JEU.util.lireDate(s.le).getTime() : 0;
      return { id: id, t: t, sem: e ? e.semaine : 0 };
    }).sort(function (a, b) { return (b.t - a.t) || (b.sem - a.sem); });
    var r = {};
    dates.forEach(function (d, i) { r[d.id] = i; });
    return r;
  }

  // Position par matière : cours validés ou présumés, comparés au calendrier.
  function position(matiere, semaine, etat) {
    etat = etat || JEU.sauvegarde.etat();
    var liste = entreesCours(matiere);
    var faits = 0, attendus = 0;
    liste.forEach(function (e) {
      var s = etatCours(e.id, etat);
      if (s === "valide" || s === "presume") faits++;
      if (e.semaine <= semaine) attendus++;
    });
    return { faits: faits, total: liste.length, attendus: attendus, ecart: faits - attendus };
  }

  function valider(id, score, etat) {
    etat = etat || JEU.sauvegarde.etat();
    etat.cours[id] = { etat: "valide", le: JEU.util.horodatage(), score: Math.round(score * 1000) / 1000 };
    oublier();
  }

  function cocherRevision(id, fait, etat) {
    etat = etat || JEU.sauvegarde.etat();
    if (fait) etat.cours[id] = { etat: "fait", le: JEU.util.horodatage() };
    else delete etat.cours[id];
    oublier();
  }

  JEU.progression = {
    etatCours: etatCours, coursAccessibles: coursAccessibles, recence: recence, position: position,
    valider: valider, cocherRevision: cocherRevision, oublier: oublier, entree: entree,
    entreesCours: entreesCours, sequencesAnglais: sequencesAnglais, methodes: methodes, fichierPresent: fichierPresent
  };
})(typeof window !== "undefined" ? window : globalThis);
