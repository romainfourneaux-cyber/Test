// Brouillage des réponses. Le même fichier existe, identique, dans atelier/outils/brouillage.js.
// Ça décourage un curieux qui ouvre les fichiers de données ; ça ne protège rien.
(function (racine) {
  "use strict";
  var CLE = "Griffon-5e-Chroniqueur";

  function versBase64(binaire) {
    if (typeof btoa === "function") return btoa(binaire);
    return Buffer.from(binaire, "binary").toString("base64");
  }
  function depuisBase64(b64) {
    if (typeof atob === "function") return atob(b64);
    return Buffer.from(b64, "base64").toString("binary");
  }

  function brouiller(texte) {
    var utf8 = unescape(encodeURIComponent(String(texte)));
    var sortie = "";
    for (var i = 0; i < utf8.length; i++) {
      sortie += String.fromCharCode(utf8.charCodeAt(i) ^ CLE.charCodeAt(i % CLE.length));
    }
    return versBase64(sortie).split("").reverse().join("");
  }

  function debrouiller(code) {
    var binaire = depuisBase64(String(code).split("").reverse().join(""));
    var utf8 = "";
    for (var i = 0; i < binaire.length; i++) {
      utf8 += String.fromCharCode(binaire.charCodeAt(i) ^ CLE.charCodeAt(i % CLE.length));
    }
    return decodeURIComponent(escape(utf8));
  }

  var api = { brouiller: brouiller, debrouiller: debrouiller };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (racine && racine.JEU) {
    racine.JEU.brouiller = brouiller;
    racine.JEU.debrouiller = debrouiller;
  }
})(typeof window !== "undefined" ? window : globalThis);
