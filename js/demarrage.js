// Démarrage : charge les cours listés, la sauvegarde, puis affiche l'accueil.
(function (racine) {
  "use strict";
  var JEU = racine.JEU;

  function demarrer() {
    if (!JEU.donnees.config) {
      document.body.innerHTML = "<p style='padding:2em'>Le fichier data/config.js est introuvable. Le jeu ne peut pas démarrer.</p>";
      return;
    }
    JEU.sauvegarde.charger();
    JEU.sons.precharger();
    JEU.chargeur.chargerCours(function () {
      JEU.questions.vider();
      JEU.progression.oublier();
      document.body.classList.remove("chargement");
      var ICONES_MENU = { accueil: "accueil", domaine: "domaine", jouer: "jouer", cours: "cours", codex: "codex", reglages: "reglages" };
      Array.prototype.forEach.call(document.querySelectorAll("#menu button"), function (b) {
        b.insertAdjacentHTML("afterbegin", JEU.icones.icone(ICONES_MENU[b.getAttribute("data-ecran")], 22));
        b.addEventListener("click", function () { JEU.ui.afficher(b.getAttribute("data-ecran")); });
      });
      document.getElementById("bouton-son").addEventListener("click", JEU.sons.basculer);
      document.getElementById("bouton-musique").addEventListener("click", JEU.musique.basculer);
      JEU.musique.brancher();
      document.getElementById("modale").addEventListener("click", function (e) { if (e.target.id === "modale") JEU.ui.fermerModale(); });
      var bl = document.getElementById("blason-bandeau");
      if (bl) bl.innerHTML = JEU.icones.blason(JEU.sauvegarde.etat().reglages.nomDomaine, 30);
      JEU.ui.majRessources();
      JEU.ui.appliquerAnimations();
      JEU.ui.afficher("accueil");
      JEU.pret = true;
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", demarrer);
  else demarrer();
})(window);
