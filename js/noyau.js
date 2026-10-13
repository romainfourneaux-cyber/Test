// Noyau : espace de noms JEU, enregistrement des données, constantes et petits outils.
// Chargé en premier. Aucun accès au DOM au chargement (les tests le chargent sous Node).
(function (racine) {
  "use strict";
  var JEU = racine.JEU = racine.JEU || {};

  JEU.donnees = {
    config: null, planning: [], devoirs: [], indexCours: [], aRetravailler: [],
    cours: {}, anglais: {}, erreurs: []
  };

  JEU.MATIERES = {
    histoire:    { nom: "Histoire", ressource: "sceaux", quartier: "chateau", couleur: "#6b2d5c" },
    geographie:  { nom: "Géographie", ressource: "routes", quartier: "marche", couleur: "#b5772b" },
    svt:         { nom: "SVT", ressource: "remedes", quartier: "herboristerie", couleur: "#4f6b32" },
    physique:    { nom: "Physique-chimie", ressource: "alambics", quartier: "forge", couleur: "#2f5a8a" },
    litterature: { nom: "Littérature", ressource: "parchemins", quartier: "scriptorium", couleur: "#7a4a2a" },
    lecture:     { nom: "Lecture suivie", ressource: "parchemins", quartier: "scriptorium", couleur: "#7a4a2a" },
    anglais:     { nom: "Anglais", ressource: "alliances", quartier: "ambassade", couleur: "#2a7470" }
  };
  JEU.ORDRE_MATIERES = ["histoire", "geographie", "svt", "physique", "litterature", "lecture", "anglais"];

  JEU.RESSOURCES = {
    sceaux:     { nom: "Sceaux", matiere: "histoire" },
    routes:     { nom: "Routes", matiere: "geographie" },
    remedes:    { nom: "Remèdes", matiere: "svt" },
    alambics:   { nom: "Alambics", matiere: "physique" },
    parchemins: { nom: "Parchemins", matiere: "litterature" },
    alliances:  { nom: "Alliances", matiere: "anglais" }
  };

  // Chaque fichier de données appelle JEU.enregistrer(type, objet) une seule fois.
  JEU.enregistrer = function (type, obj) {
    var d = JEU.donnees;
    try {
      switch (type) {
        case "config": d.config = obj; break;
        case "planning": d.planning = obj; break;
        case "devoirs": d.devoirs = obj; break;
        case "index-cours": d.indexCours = obj; break;
        case "a-retravailler": d.aRetravailler = obj; break;
        case "cours":
          if (!obj || !obj.id || !Array.isArray(obj.fiches)) throw new Error("cours mal formé");
          d.cours[obj.id] = obj; break;
        case "anglais":
          if (!obj || !obj.id) throw new Error("séquence mal formée");
          d.anglais[obj.id] = obj; break;
        default: throw new Error("type inconnu : " + type);
      }
    } catch (e) {
      d.erreurs.push({ type: type, id: obj && obj.id, message: e.message });
    }
  };

  // ---------- petits outils ----------
  var U = JEU.util = {};

  U.melanger = function (t) {
    var a = t.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var x = a[i]; a[i] = a[j]; a[j] = x;
    }
    return a;
  };

  U.hasard = function (t) { return t[Math.floor(Math.random() * t.length)]; };

  U.echapper = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c];
    });
  };

  // Date locale au format AAAA-MM-JJTHH:MM:SS (sans fuseau), comme dans la sauvegarde.
  U.horodatage = function (d) {
    d = d || new Date();
    function z(n) { return (n < 10 ? "0" : "") + n; }
    return d.getFullYear() + "-" + z(d.getMonth() + 1) + "-" + z(d.getDate()) + "T" +
      z(d.getHours()) + ":" + z(d.getMinutes()) + ":" + z(d.getSeconds());
  };

  U.jour = function (d) { return U.horodatage(d).slice(0, 10); };

  U.lireDate = function (s) {
    if (!s) return null;
    var m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2}))?)?/);
    if (!m) return null;
    return new Date(+m[1], +m[2] - 1, +m[3], +(m[4] || 0), +(m[5] || 0), +(m[6] || 0));
  };

  // Comparaison souple pour les réponses tapées : casse, accents, espaces, apostrophes.
  U.normaliser = function (s) {
    return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[’']/g, "'").replace(/\s+/g, " ").trim();
  };

  U.compterPhrases = function (s) {
    var t = String(s || "").trim();
    if (!t) return 0;
    var morceaux = t.split(/[.!?…]+(?:\s+|$)/).filter(function (x) { return x.trim().length > 0; });
    return morceaux.length;
  };

  U.compterMots = function (s) {
    return String(s || "").split(/\s+/).filter(Boolean).length;
  };

  // Liste des cours « jouables » en tant que fichiers (méthodes, cours du planning, séquences d'anglais).
  U.coursCharge = function (id) {
    return JEU.donnees.cours[id] || JEU.donnees.anglais[id] || null;
  };

  U.matiereDe = function (coursId) {
    var c = JEU.donnees.cours[coursId];
    if (c && c.matiere) return c.matiere;
    if (/^anglais-/.test(coursId)) return "anglais";
    var m = coursId.match(/^([a-z]+)-s\d\d-\d+$/);
    return m ? m[1] : null;
  };
})(typeof window !== "undefined" ? window : globalThis);
