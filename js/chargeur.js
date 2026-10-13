// Chargeur : une balise script par cours listé dans index-cours.js.
// Un fichier absent ou en erreur ne bloque rien : le cours passe en « contenu à venir ».
(function (racine) {
  "use strict";
  var JEU = racine.JEU;

  function dossierDe(id) { return /^anglais-/.test(id) ? "anglais" : "cours"; }

  function chargerCours(fini) {
    var ids = (JEU.donnees.indexCours || []).slice();
    var restant = ids.length;
    var termine = false;
    JEU.donnees.coursAbsents = [];
    function un() {
      restant--;
      if (restant <= 0 && !termine) { termine = true; fini(); }
    }
    if (!restant) { termine = true; fini(); return; }
    ids.forEach(function (id) {
      var s = document.createElement("script");
      s.src = "data/" + dossierDe(id) + "/" + id + ".js";
      s.onload = function () {
        if (!JEU.donnees.cours[id] && !JEU.donnees.anglais[id]) JEU.donnees.coursAbsents.push(id);
        un();
      };
      s.onerror = function () { JEU.donnees.coursAbsents.push(id); un(); };
      document.head.appendChild(s);
    });
    // filet de sécurité : on démarre quoi qu'il arrive au bout de 4 secondes
    setTimeout(function () { if (!termine) { termine = true; fini(); } }, 4000);
  }

  JEU.chargeur = { chargerCours: chargerCours, dossierDe: dossierDe };
})(typeof window !== "undefined" ? window : globalThis);
