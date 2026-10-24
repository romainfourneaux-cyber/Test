// Progression : état de chaque cours. Le jeu ne fait plus passer d'épreuve de validation :
// c'est le chroniqueur (Romain et Claude) qui estime, d'après les devoirs corrigés, si un cours est acquis
// (fichier data/suivi.js). États : acquis | a-revoir | presume | ouvert | avenir (méthode sans fichier) | brume.
// Les cours de langue (grammaire et conjugaison, rangés par badges Griffon) et les séquences d'anglais ne sont pas dans
// le planning : ouverts dès que leur fichier est chargé, dans la brume sinon.
(function (racine) {
  "use strict";
  var JEU = racine.JEU;

  function config() { return JEU.donnees.config || {}; }

  function entreesCours(matiere) {
    return JEU.donnees.planning.filter(function (p) { return p.type === "cours" && (!matiere || p.matiere === matiere); })
      .sort(function (a, b) { return a.ordre - b.ordre; });
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

  // Grammaire et conjugaison : rang d'un badge Griffon (0 = bois … 7 = or ; 99 si inconnu).
  function rangBadge(id) {
    var b = JEU.BADGES_GRIFFON || [];
    for (var i = 0; i < b.length; i++) if (b[i].id === id) return i;
    return 99;
  }

  // Cours de langue chargés, rangés par badge (bois, fer, cuivre…) puis par leur champ ordre.
  function coursLangue() {
    var c = JEU.donnees.cours;
    return Object.keys(c).filter(function (k) { return /^langue-/.test(k); }).map(function (k) { return c[k]; })
      .sort(function (x, y) { return (rangBadge(x.badge) - rangBadge(y.badge)) || ((x.ordre || 0) - (y.ordre || 0)) || (x.id < y.id ? -1 : 1); });
  }

  // Groupes de l'onglet Grammaire : un groupe par badge qui a au moins un cours, dans l'ordre des badges ;
  // un cours au badge inconnu va dans « Autres cours », à la fin.
  function groupesLangue() {
    var groupes = [], parBadge = {};
    coursLangue().forEach(function (c) {
      var r = rangBadge(c.badge), cle = r < 99 ? c.badge : "autres";
      if (!parBadge[cle]) {
        parBadge[cle] = { badge: cle, nom: r < 99 ? JEU.BADGES_GRIFFON[r].nom : "Autres cours", cours: [] };
        groupes.push(parBadge[cle]);
      }
      parBadge[cle].cours.push(c);
    });
    return groupes;
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

  function estimation(id) {
    var su = JEU.donnees.suivi && JEU.donnees.suivi.cours;
    return su && su[id] ? su[id] : null;
  }

  function calculer(id, etat) {
    var est = estimation(id);
    if (est && (est.etat === "acquis" || est.etat === "a-revoir")) return est.etat;
    var sauve = etat.cours[id];
    if (sauve && sauve.etat === "valide") return "acquis"; // anciennes épreuves (schéma 2) : on garde l'acquis
    if (/^methode-/.test(id)) return fichierPresent(id) ? "ouvert" : "avenir";
    if (/^anglais-/.test(id) || /^langue-/.test(id)) return fichierPresent(id) ? "ouvert" : "brume"; // hors planning
    var e = entree(id);
    if (e && e.semaine < (config().semaineDepart || 1)) return "presume";
    return fichierPresent(id) ? "ouvert" : "brume";
  }

  // Fiches des cours que le chroniqueur a marqués « à revoir » : elles sortent plus souvent.
  // Pour une séquence d'anglais, ce sont ses éléments (vocabulaire, structures, phrases), comme dans questions.indexer.
  function fichesARevoir() {
    var r = (JEU.donnees.aRetravailler || []).slice();
    function ajouter(id) { if (id && r.indexOf(id) < 0) r.push(id); }
    Object.keys(JEU.donnees.cours).forEach(function (id) {
      if (etatCours(id) !== "a-revoir") return;
      (JEU.donnees.cours[id].fiches || []).forEach(function (f) { ajouter(f.id); });
    });
    var ang = JEU.donnees.anglais || {};
    Object.keys(ang).forEach(function (id) {
      if (etatCours(id) !== "a-revoir") return;
      ["vocabulaire", "structures", "phrases"].forEach(function (k) {
        (ang[id][k] || []).forEach(function (el) { ajouter(el && el.id); });
      });
    });
    return r;
  }

  // Cours dont les questions peuvent sortir en partie libre (ouverts, validés, présumés avec fichier, méthodes).
  function coursAccessibles(etat) {
    etat = etat || JEU.sauvegarde.etat();
    var ids = Object.keys(JEU.donnees.cours).concat(Object.keys(JEU.donnees.anglais));
    return ids.filter(function (id) {
      var s = etatCours(id, etat);
      return s === "ouvert" || s === "acquis" || s === "a-revoir" || s === "presume";
    });
  }

  // Semaine médiane d'une liste de semaines (0 si la liste est vide).
  function mediane(t) {
    if (!t.length) return 0;
    var s = t.slice().sort(function (a, b) { return a - b; }), k = Math.floor(s.length / 2);
    return s.length % 2 ? s[k] : (s[k - 1] + s[k]) / 2;
  }

  // Rang de récence d'un cours (0 = le plus récent) pour le tirage Leitner : la semaine du planning, la plus récente
  // d'abord (un cours d'une ancienne épreuve passe devant, par date). Il ne sert qu'à l'intérieur d'une matière : le
  // tirage équilibre d'abord les familles de matières (leitner.tirer). Un cours de langue n'a pas de semaine : il prend
  // la semaine médiane des cours accessibles du planning (ni en tête, ni en queue) ; entre eux, le badge le plus avancé
  // puis le plus grand ordre passent devant. Méthodes et séquences d'anglais, sans semaine, viennent en dernier.
  function recence(etat) {
    etat = etat || JEU.sauvegarde.etat();
    var ids = coursAccessibles(etat);
    var semaines = [];
    ids.forEach(function (id) { var e = entree(id); if (e && typeof e.semaine === "number") semaines.push(e.semaine); });
    var semLangue = mediane(semaines);
    var dates = ids.map(function (id) {
      var s = etat.cours[id];
      var e = entree(id);
      var t = s && s.le ? JEU.util.lireDate(s.le).getTime() : 0;
      var langue = /^langue-/.test(id) ? JEU.donnees.cours[id] : null;
      var rb = langue ? rangBadge(langue.badge) : 99;
      return { id: id, t: t, sem: e ? e.semaine : (langue ? semLangue : 0), sous: langue && rb < 99 ? rb * 1000 + (langue.ordre || 0) : -1 };
    }).sort(function (a, b) { return (b.t - a.t) || (b.sem - a.sem) || (b.sous - a.sous); });
    var r = {};
    dates.forEach(function (d, i) { r[d.id] = i; });
    return r;
  }

  // Cours d'un onglet de l'écran Cours : une matière du planning, « methode », « langue » (par badge) ou « anglais ».
  function idsOnglet(onglet) {
    if (onglet === "methode") return methodes().map(function (c) { return c.id; });
    if (onglet === "langue") return coursLangue().map(function (c) { return c.id; });
    var ids = entreesCours(onglet).map(function (e) { return e.id; });
    if (onglet === "anglais") sequencesAnglais().forEach(function (c) { if (ids.indexOf(c.id) < 0) ids.push(c.id); });
    return ids;
  }

  // Position d'un onglet : combien de cours sont acquis, présumés acquis, à revoir, en cours.
  // Pas de comparaison au calendrier : seul un devoir corrigé (data/suivi.js) fait passer un cours « acquis ».
  function position(onglet, etat) {
    etat = etat || JEU.sauvegarde.etat();
    var ids = idsOnglet(onglet);
    var r = { acquis: 0, presumes: 0, aRevoir: 0, enCours: 0, total: ids.length };
    ids.forEach(function (id) {
      var s = etatCours(id, etat);
      if (s === "acquis") r.acquis++;
      else if (s === "presume") r.presumes++;
      else if (s === "a-revoir") r.aRevoir++;
      else if (s === "ouvert") r.enCours++;
    });
    return r;
  }

  // Semaine d'un cours : celle de son entrée du planning (sinon le numéro porté par son identifiant) ; null pour un cours
  // de langue, une fiche méthode ou une séquence d'anglais, qui n'ont pas de semaine. Partagé par le repère de semaine des
  // questions et par les expéditions (fenêtre et quota de chaque semaine traversée).
  function semaineDe(coursId) {
    if (!coursId || /^(methode|langue|anglais)-/.test(coursId)) return null;
    var e = entree(coursId);
    if (e && typeof e.semaine === "number") return e.semaine;
    var m = /^[a-z]+-s(\d\d)-\d+$/.exec(coursId);
    return m ? parseInt(m[1], 10) : null;
  }

  // Nombre de cours acquis, tous onglets confondus (le même compte que l'écran Cours, onglet par onglet).
  function totalAcquis(etat) {
    return ["methode"].concat(JEU.ORDRE_MATIERES).reduce(function (n, o) { return n + position(o, etat).acquis; }, 0);
  }

  JEU.progression = {
    etatCours: etatCours, coursAccessibles: coursAccessibles, recence: recence, position: position, totalAcquis: totalAcquis,
    estimation: estimation, fichesARevoir: fichesARevoir, oublier: oublier, entree: entree,
    entreesCours: entreesCours, sequencesAnglais: sequencesAnglais, methodes: methodes, fichierPresent: fichierPresent,
    idsOnglet: idsOnglet, coursLangue: coursLangue, groupesLangue: groupesLangue, rangBadge: rangBadge, semaineDe: semaineDe
  };
})(typeof window !== "undefined" ? window : globalThis);
