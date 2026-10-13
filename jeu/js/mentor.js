// Le mentor : un chroniqueur du royaume. Il donne des indices, félicite et ouvre la bonne fiche.
(function (racine) {
  "use strict";
  var JEU = racine.JEU;
  var minuterie = null;

  var FELICITATIONS = [
    "Voilà qui sera consigné dans la chronique !",
    "Belle réponse. Le domaine s'en souviendra.",
    "Juste et bien tranché.",
    "Ta plume est sûre, seigneur."
  ];
  var ENCOURAGEMENTS = [
    "Même les grands seigneurs relisent leurs fiches.",
    "Une erreur n'enlève rien : on en tire une leçon et on repart.",
    "Reprenons ensemble ce point, puis tu retenteras."
  ];

  function dire(texte, genre, duree) {
    var b = document.getElementById("mentor");
    if (!b) return;
    b.querySelector(".mentor-texte").textContent = texte;
    b.className = "mentor visible " + (genre || "");
    clearTimeout(minuterie);
    if (duree !== 0) minuterie = setTimeout(taire, duree || 5000);
  }

  function taire() {
    var b = document.getElementById("mentor");
    if (b) b.className = "mentor";
  }

  function feliciter() { dire(JEU.util.hasard(FELICITATIONS), "joie", 2500); }
  function encourager() { dire(JEU.util.hasard(ENCOURAGEMENTS), "", 4000); }

  // Après une épreuve ratée : le chroniqueur ouvre les fiches ratées, une par une.
  function ouvrirFichesRatees(ficheIds, suite) {
    var ids = ficheIds.filter(function (v, i, t) { return t.indexOf(v) === i; });
    dire("Relisons ensemble " + (ids.length > 1 ? "ces " + ids.length + " fiches" : "cette fiche") + " avant ta nouvelle tentative.", "", 6000);
    JEU.codex.ouvrirSuite(ids, suite);
  }

  JEU.mentor = { dire: dire, taire: taire, feliciter: feliciter, encourager: encourager, ouvrirFichesRatees: ouvrirFichesRatees };
})(typeof window !== "undefined" ? window : globalThis);
