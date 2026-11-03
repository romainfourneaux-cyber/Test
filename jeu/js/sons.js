// Sons courts (fichiers locaux dans assets/sons, CC0). Un clic les coupe (réglage sauvegardé).
(function (racine) {
  "use strict";
  var JEU = racine.JEU;
  var SONS = ["coup", "coup-puissant", "sceau", "construction", "validation", "erreur"];
  var audios = {};

  function precharger() {
    SONS.forEach(function (n) {
      try { var a = new Audio("assets/sons/" + n + ".wav"); a.preload = "auto"; audios[n] = a; } catch (e) { /* pas de son */ }
    });
  }

  function jouer(nom) {
    var etat = JEU.sauvegarde && JEU.sauvegarde.etat();
    if (!etat || !etat.reglages.son) return;
    var a = audios[nom];
    if (!a) return;
    try {
      var c = a.cloneNode();
      c.volume = 0.6;
      var p = c.play();
      if (p && p.catch) p.catch(function () { /* lecture refusée : tant pis */ });
    } catch (e) { /* rien */ }
  }

  function basculer() {
    var etat = JEU.sauvegarde.etat();
    etat.reglages.son = !etat.reglages.son;
    JEU.sauvegarde.enregistrer();
    JEU.ui.majRessources();
  }

  JEU.sons = { precharger: precharger, jouer: jouer, basculer: basculer };
})(typeof window !== "undefined" ? window : globalThis);
