// Sceau de vérité, à la manière de Reigns : 10 affirmations. Glisser à gauche (faux) ou à droite (vrai),
// ou flèches du clavier. Si c'est faux, choisir la bonne correction parmi deux ou trois.
// Chaque carte juste et bien corrigée rapporte 2 ressources de sa matière.
(function (racine) {
  "use strict";
  var JEU = racine.JEU;
  var U = JEU.util;
  var CARTES = 10, GAIN = 2, SEUIL_GLISSE = 90;

  function estVF(q) { return q.type === "vrai_faux"; }

  function lancer() {
    var el = JEU.ui.el;
    var fiches = JEU.assaut.tirer(null, CARTES, estVF);
    var qs = [], vues = [];
    fiches.forEach(function (c) {
      var q = JEU.questions.choisirPourFiche(c.fiche, { types: ["vrai_faux"], exclure: vues });
      if (q) { qs.push(q); vues.push(q.id); }
    });
    if (qs.length < 3) { JEU.ui.toast("Pas encore assez d'affirmations pour le Sceau de vérité."); return; }
    var zone = JEU.ui.commencerPartie("Sceau de vérité", function () { JEU.ui.afficher("jouer"); });
    var i = 0, bonnes = 0, gains = {};
    var compteur = el("p", { class: "compteur" });
    var scene = el("div", { class: "scene-sceau" });
    zone.appendChild(compteur); zone.appendChild(scene);

    function suivante() {
      if (i >= qs.length) return fin();
      compteur.textContent = "Carte " + (i + 1) + " / " + qs.length + " · " + bonnes + " scellée" + (bonnes > 1 ? "s" : "");
      var q = qs[i];
      var m = JEU.MATIERES[q.matiere];
      scene.innerHTML = "";
      var carte = el("div", { class: "carte-sceau", style: "--teinte:" + m.couleur, tabindex: "0" }, [
        el("span", { class: "pastille", texte: m.nom }),
        el("p", { class: "affirmation", texte: q.enonce }),
        el("div", { class: "indic gauche", texte: "FAUX" }),
        el("div", { class: "indic droite", texte: "VRAI" })
      ]);
      var boutons = el("div", { class: "boutons-sceau" }, [
        el("button", { class: "bouton faux", onclick: function () { decider(false); }, texte: "← Faux" }),
        el("button", { class: "bouton vrai", onclick: function () { decider(true); }, texte: "Vrai →" })
      ]);
      scene.appendChild(carte); scene.appendChild(boutons);
      glisser(carte, decider);
      var fait = false;
      function decider(v) {
        if (fait) return; fait = true;
        JEU.mesure.reponseDonnee();
        carte.classList.add(v ? "part-droite" : "part-gauche");
        if (!v && !q.reponse.vrai && q.corrections && q.corrections.length) return corriger(q);
        conclure(q, { vrai: v, correction: null });
      }
      JEU.ui.clavier = function (k) {
        if (k === "ArrowLeft") { decider(false); return true; }
        if (k === "ArrowRight") { decider(true); return true; }
        return false;
      };
      JEU.mesure.questionAffichee();
    }

    function corriger(q) {
      scene.innerHTML = "";
      scene.appendChild(el("p", { class: "affirmation petite", texte: "« " + q.enonce + " »" }));
      scene.appendChild(el("p", { class: "consigne", texte: "Faux, en effet. Choisis la bonne correction :" }));
      var corr = q.corrections.slice();
      corr.forEach(function (c, k) {
        scene.appendChild(el("button", { class: "choix", onclick: function () { conclure(q, { vrai: false, correction: c }); } }, [el("span", { class: "touche", texte: String(k + 1) }), el("span", { texte: c })]));
      });
      JEU.ui.clavier = function (k) {
        var n = parseInt(k, 10);
        if (n >= 1 && n <= corr.length) { conclure(q, { vrai: false, correction: corr[n - 1] }); return true; }
        return false;
      };
      JEU.mesure.questionAffichee();
    }

    function conclure(q, rj) {
      JEU.ui.clavier = null;
      var juste = JEU.questions.corriger(q, rj);
      var res = JEU.questions.enregistrerReponse(q, juste, GAIN);
      JEU.ui.noterDerniere(q);
      i++;
      if (juste) {
        bonnes++;
        if (res) gains[res] = (gains[res] || 0) + GAIN;
        JEU.sons.jouer("sceau");
        JEU.ui.toast("Scellé ! +" + GAIN, "bon");
        JEU.ui.majRessources();
        JEU.mesure.reponseDonnee();
        suivante();
      } else {
        JEU.ui.panneauErreur(q, scene, function () { JEU.mesure.reponseDonnee(); suivante(); });
      }
    }

    function fin() {
      var etat = JEU.sauvegarde.etat();
      etat.stats.parties++;
      JEU.sauvegarde.enregistrer();
      var taux = bonnes / qs.length;
      if (taux >= 0.8) JEU.mentor.feliciter();
      scene.innerHTML = "";
      compteur.textContent = "";
      var liste = Object.keys(gains).map(function (r) { return "+" + gains[r] + " " + JEU.RESSOURCES[r].nom.toLowerCase(); }).join(", ");
      scene.appendChild(el("div", { class: "bilan" + (taux >= 0.8 ? " reussi" : "") }, [
        el("h2", { texte: taux >= 0.8 ? "Série réussie !" : "Série terminée" }),
        el("p", { class: "grand", texte: bonnes + " / " + qs.length + " cartes scellées" }),
        el("p", { texte: liste ? "Gains : " + liste + "." : "Pas de gain cette fois, mais rien de perdu." }),
        el("div", { class: "actions" }, [
          el("button", { class: "bouton principal", onclick: function () { JEU.ui.finirPartie(); lancer(); }, texte: "Nouvelle série (Entrée)" }),
          el("button", { class: "bouton", onclick: function () { JEU.ui.finirPartie(); JEU.ui.afficher("domaine"); }, texte: "Voir le domaine" })
        ])
      ]));
      JEU.ui.clavier = function (k) { if (k === "Enter") { JEU.ui.finirPartie(); lancer(); return true; } return false; };
    }

    suivante();
  }

  // Glisser la carte à la souris ou au doigt.
  function glisser(carte, decider) {
    var x0 = null, dx = 0;
    carte.addEventListener("pointerdown", function (e) { x0 = e.clientX; dx = 0; carte.setPointerCapture(e.pointerId); carte.classList.add("glisse"); });
    carte.addEventListener("pointermove", function (e) {
      if (x0 === null) return;
      dx = e.clientX - x0;
      carte.style.transform = "translateX(" + dx + "px) rotate(" + (dx / 20) + "deg)";
      carte.classList.toggle("vers-droite", dx > 30);
      carte.classList.toggle("vers-gauche", dx < -30);
    });
    function lacher() {
      if (x0 === null) return;
      x0 = null;
      carte.classList.remove("glisse");
      if (dx > SEUIL_GLISSE) decider(true);
      else if (dx < -SEUIL_GLISSE) decider(false);
      else { carte.style.transform = ""; carte.classList.remove("vers-droite", "vers-gauche"); }
    }
    carte.addEventListener("pointerup", lacher);
    carte.addEventListener("pointercancel", lacher);
  }

  JEU.sceau = { lancer: lancer };
})(typeof window !== "undefined" ? window : globalThis);
