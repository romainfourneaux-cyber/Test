// Validation d'un cours : l'élève coche « cours fait », le jeu lance une épreuve de 8 questions
// (niveaux 1 et 2). Au seuil (75 %), le cours est validé ; sinon le mentor ouvre les fiches ratées
// et l'élève retente avec d'autres variantes, sans pénalité ni attente.
(function (racine) {
  "use strict";
  var JEU = racine.JEU;
  var U = JEU.util;

  function cfg() { return JEU.donnees.config || {}; }

  // Choisit les questions : une fiche après l'autre (tour de rôle), en évitant celles de la tentative précédente.
  function composer(coursId, taille, eviter) {
    var toutes = JEU.questions.questionsDuCours(coursId).filter(function (q) { return q.niveau <= 2; });
    var parFiche = {};
    toutes.forEach(function (q) { (parFiche[q.fiche] = parFiche[q.fiche] || []).push(q); });
    Object.keys(parFiche).forEach(function (f) {
      parFiche[f] = U.melanger(parFiche[f]).sort(function (a, b) {
        return (eviter.indexOf(a.id) >= 0 ? 1 : 0) - (eviter.indexOf(b.id) >= 0 ? 1 : 0);
      });
    });
    var fichesOrdre = U.melanger(Object.keys(parFiche));
    var res = [];
    var tour = 0;
    while (res.length < taille) {
      var ajout = false;
      for (var i = 0; i < fichesOrdre.length && res.length < taille; i++) {
        var q = parFiche[fichesOrdre[i]][tour];
        if (q) { res.push(q); ajout = true; }
      }
      if (!ajout) break;
      tour++;
    }
    return U.melanger(res);
  }

  function seuilAtteint(bonnes, total, seuil) {
    if (!total) return false;
    return bonnes / total >= (seuil == null ? cfg().seuilValidation || 0.75 : seuil) - 1e-9;
  }

  var precedentes = {}; // coursId -> ids des questions de la dernière tentative

  function lancer(coursId) {
    var c = U.coursCharge(coursId);
    var taille = cfg().tailleEpreuve || 8;
    var qs = composer(coursId, taille, precedentes[coursId] || []);
    if (qs.length < 4) { JEU.ui.toast("Pas encore assez de questions pour ce cours."); return; }
    precedentes[coursId] = qs.map(function (q) { return q.id; });
    var titre = "Épreuve : " + (c.titre || (JEU.progression.entree(coursId) || {}).titre || coursId);
    var zone = JEU.ui.commencerPartie(titre, function () { JEU.ui.afficher("cours"); });
    JEU.partie.codexFerme = true;
    var i = 0, bonnes = 0, ratees = [];
    var suivi = JEU.ui.el("div", { class: "suivi" });
    var scene = JEU.ui.el("div", {});
    zone.appendChild(suivi); zone.appendChild(scene);

    function majSuivi() {
      suivi.innerHTML = "";
      for (var k = 0; k < qs.length; k++) {
        suivi.appendChild(JEU.ui.el("span", { class: "jalon" + (k < i ? (k < i && qs[k]._juste ? " ok" : " ko") : k === i ? " courant" : "") }));
      }
    }

    function suivante() {
      if (i >= qs.length) return bilan();
      majSuivi();
      var q = qs[i];
      JEU.ui.poserQuestion(q, scene, function (juste) {
        q._juste = juste;
        JEU.questions.enregistrerReponse(q, juste);
        JEU.ui.noterDerniere(q);
        i++;
        if (juste) {
          bonnes++;
          JEU.sons.jouer("coup");
          JEU.ui.majRessources();
          JEU.mesure.reponseDonnee();
          suivante();
        } else {
          ratees.push(q.fiche);
          JEU.ui.panneauErreur(q, scene, function () { JEU.mesure.reponseDonnee(); suivante(); }, { ficheBloquee: true });
        }
      }, { sansIndice: false });
    }

    function bilan() {
      majSuivi();
      var el = JEU.ui.el;
      var etat = JEU.sauvegarde.etat();
      var reussi = seuilAtteint(bonnes, qs.length);
      JEU.partie.codexFerme = false;
      scene.innerHTML = "";
      etat.stats.parties++;
      if (reussi) {
        var dejaValide = etat.cours[coursId] && etat.cours[coursId].etat === "valide";
        JEU.progression.valider(coursId, bonnes / qs.length, etat);
        var res = JEU.MATIERES[U.matiereDe(coursId)].ressource;
        if (!dejaValide) etat.ressources[res] += 10;
        JEU.sauvegarde.enregistrer();
        JEU.sons.jouer("validation");
        JEU.mentor.dire("Cours validé ! La chronique le retiendra.", "joie", 4000);
        scene.appendChild(el("div", { class: "bilan reussi" }, [
          el("h2", { texte: "Cours validé" }),
          el("p", { class: "grand", texte: bonnes + " / " + qs.length }),
          el("p", { texte: dejaValide ? "Déjà validé : tu gardes tes ressources gagnées pendant l'épreuve." : "+10 " + JEU.RESSOURCES[res].nom.toLowerCase() + " pour la validation." }),
          ratees.length ? el("button", { class: "bouton", onclick: function () { JEU.codex.ouvrirSuite(ratees.filter(function (v, k, t) { return t.indexOf(v) === k; })); }, texte: "Relire les fiches ratées" }) : null,
          el("button", { class: "bouton principal", onclick: fin, texte: "Retour aux cours (Entrée)" })
        ]));
        JEU.ui.clavier = function (k) { if (k === "Enter") { fin(); return true; } return false; };
      } else {
        JEU.sauvegarde.enregistrer();
        scene.appendChild(el("div", { class: "bilan" }, [
          el("h2", { texte: "Presque !" }),
          el("p", { class: "grand", texte: bonnes + " / " + qs.length }),
          el("p", { texte: "Il faut " + Math.ceil((cfg().seuilValidation || 0.75) * qs.length) + " bonnes réponses. Tu gardes tout ce que tu as gagné. Le chroniqueur t'ouvre les fiches ratées, puis tu retentes avec d'autres questions." }),
          el("button", { class: "bouton principal", onclick: retenter, texte: "Relire les fiches et retenter (Entrée)" }),
          el("button", { class: "bouton", onclick: fin, texte: "Plus tard" })
        ]));
        JEU.ui.clavier = function (k) { if (k === "Enter") { retenter(); return true; } return false; };
      }
    }

    function retenter() {
      JEU.ui.clavier = null;
      JEU.mentor.ouvrirFichesRatees(ratees, function () { JEU.ui.finirPartie(); lancer(coursId); });
    }
    function fin() { JEU.ui.finirPartie(); JEU.ui.afficher("cours"); }

    suivante();
  }

  JEU.validation = { lancer: lancer, composer: composer, seuilAtteint: seuilAtteint };
})(typeof window !== "undefined" ? window : globalThis);
