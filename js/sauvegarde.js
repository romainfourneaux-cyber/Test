// Sauvegarde : localStorage (clé jeu5e), schéma versionné, migration, export et import JSON.
(function (racine) {
  "use strict";
  var JEU = racine.JEU;
  var CLE = "jeu5e";
  var SCHEMA = 2;

  function ressourcesVides() {
    return { sceaux: 0, routes: 0, remedes: 0, alambics: 0, parchemins: 0, alliances: 0 };
  }

  function nouvelle(maintenant) {
    var t = JEU.util.horodatage(maintenant);
    var son = JEU.donnees.config ? JEU.donnees.config.son !== false : true;
    return {
      schema: SCHEMA, creeLe: t, majLe: t,
      cours: {}, notions: {}, ressources: ressourcesVides(), batiments: [], devoirs: {},
      signalements: [], dernierExport: null,
      // ajouts du schéma 2
      reglages: { son: son, nomDomaine: "Le domaine" },
      stats: { bonnes: 0, total: 0, parties: 0 },
      questionsVues: {}
    };
  }

  // Chaque étape fait passer la sauvegarde d'un schéma au suivant sans rien perdre.
  var MIGRATIONS = {
    1: function (s) {
      var son = JEU.donnees.config ? JEU.donnees.config.son !== false : true;
      s.reglages = s.reglages || { son: son, nomDomaine: "Le domaine" };
      var ok = 0, total = 0;
      Object.keys(s.notions || {}).forEach(function (k) {
        ok += s.notions[k].ok || 0; total += (s.notions[k].ok || 0) + (s.notions[k].ko || 0);
      });
      s.stats = s.stats || { bonnes: ok, total: total, parties: 0 };
      s.questionsVues = s.questionsVues || {};
      s.schema = 2;
      return s;
    }
  };

  function migrer(s) {
    if (!s || typeof s !== "object") throw new Error("sauvegarde illisible");
    if (!s.schema) s.schema = 1;
    if (s.schema > SCHEMA) throw new Error("sauvegarde d'une version plus récente du jeu (schéma " + s.schema + ")");
    var base = nouvelle();
    // champs du schéma 1 manquants : on complète, sans écraser
    ["cours", "notions", "devoirs"].forEach(function (k) { if (!s[k] || typeof s[k] !== "object") s[k] = {}; });
    ["batiments", "signalements"].forEach(function (k) { if (!Array.isArray(s[k])) s[k] = []; });
    s.ressources = s.ressources || {};
    Object.keys(base.ressources).forEach(function (k) { if (typeof s.ressources[k] !== "number") s.ressources[k] = 0; });
    if (!s.creeLe) s.creeLe = base.creeLe;
    if (!s.majLe) s.majLe = s.creeLe;
    if (!("dernierExport" in s)) s.dernierExport = null;
    while (s.schema < SCHEMA) s = MIGRATIONS[s.schema](s);
    return s;
  }

  function stockage() {
    try { return racine.localStorage || null; } catch (e) { return null; }
  }

  var etat = null;

  function charger() {
    var ls = stockage();
    var brut = null;
    try { brut = ls ? ls.getItem(CLE) : null; } catch (e) { brut = null; }
    if (!brut) { etat = nouvelle(); enregistrer(); return etat; }
    try {
      etat = migrer(JSON.parse(brut));
    } catch (e) {
      try { ls.setItem(CLE + "-illisible-" + Date.now(), brut); } catch (e2) { /* rien */ }
      etat = nouvelle();
    }
    enregistrer();
    return etat;
  }

  function enregistrer() {
    if (!etat) return;
    etat.majLe = JEU.util.horodatage();
    var ls = stockage();
    try { if (ls) ls.setItem(CLE, JSON.stringify(etat)); } catch (e) { /* stockage plein ou interdit */ }
  }

  function texteExport() {
    etat.dernierExport = JEU.util.horodatage();
    enregistrer();
    return JSON.stringify(etat, null, 1);
  }

  function nomFichier() { return "sauvegarde-jeu5e-" + JEU.util.jour() + ".json"; }

  function exporter() {
    var txt = texteExport();
    var blob = new Blob([txt], { type: "application/json" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = nomFichier();
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  // Remplace la partie en cours. La confirmation est demandée par l'interface.
  function importer(texte) {
    var s = migrer(JSON.parse(texte));
    if (typeof s.cours !== "object" || typeof s.notions !== "object") throw new Error("ce fichier n'est pas une sauvegarde du jeu");
    etat = s;
    var ls = stockage();
    try { if (ls) ls.setItem(CLE, JSON.stringify(etat)); } catch (e) { /* rien */ }
    return etat;
  }

  function exportEnRetard(maintenant) {
    maintenant = maintenant || new Date();
    var ref = JEU.util.lireDate(etat.dernierExport || etat.creeLe);
    return ref && (maintenant - ref) > 7 * 86400000;
  }

  JEU.sauvegarde = {
    SCHEMA: SCHEMA, CLE: CLE,
    nouvelle: nouvelle, migrer: migrer, charger: charger, enregistrer: enregistrer,
    exporter: exporter, texteExport: texteExport, importer: importer, nomFichier: nomFichier,
    exportEnRetard: exportEnRetard,
    etat: function () { return etat; },
    remplacer: function (s) { etat = s; }
  };
})(typeof window !== "undefined" ? window : globalThis);
