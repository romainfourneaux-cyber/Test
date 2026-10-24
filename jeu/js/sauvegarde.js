// Sauvegarde : localStorage (clé jeu5e), schéma versionné, migration, export et import JSON.
(function (racine) {
  "use strict";
  var JEU = racine.JEU;
  var CLE = "jeu5e";
  var SCHEMA = 6;

  function ressourcesVides() {
    return { sceaux: 0, routes: 0, remedes: 0, alambics: 0, parchemins: 0, alliances: 0 };
  }

  function rappelsVides() { return JEU.rappels ? JEU.rappels.vide() : { compteur: 0, file: [] }; }
  function poseesVides() { return JEU.questions && JEU.questions.poseesVides ? JEU.questions.poseesVides() : { horloge: 0, questions: {} }; }
  function expeditionVide() { return JEU.expedition ? JEU.expedition.etatVide() : null; }

  function nouvelle(maintenant) {
    var t = JEU.util.horodatage(maintenant);
    var son = JEU.donnees.config ? JEU.donnees.config.son !== false : true;
    return {
      schema: SCHEMA, creeLe: t, majLe: t,
      cours: {}, notions: {}, ressources: ressourcesVides(), batiments: [], devoirs: {},
      signalements: [], dernierExport: null,
      // ajouts du schéma 2
      reglages: { son: son, musique: true, sang: true, nomDomaine: "Le domaine" }, // sang : 15/10/2026, absent = actif
      stats: { bonnes: 0, total: 0, parties: 0 },
      questionsVues: {},
      // ajout du schéma 3 : la campagne contre le seigneur rival
      campagne: JEU.campagne ? JEU.campagne.etatVide() : null,
      // ajout du schéma 4 : les questions ratées qui reviennent un peu plus tard (rappels.js)
      rappels: rappelsVides(),
      // ajout du schéma 5 : quand chaque question a été posée pour la dernière fois (questions.js, anti-répétition)
      posees: poseesVides(),
      // ajout du schéma 6 : les expéditions (route des semaines, renommée, Armorial ; expedition.js)
      expedition: expeditionVide()
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
    },
    // 2 → 3 : la campagne (tower defense, rival, conseil) arrive ; tout l'acquis est gardé tel quel.
    2: function (s) {
      s.campagne = JEU.campagne ? JEU.campagne.completer(s.campagne) : (s.campagne || null);
      if (s.reglages && typeof s.reglages.musique !== "boolean") s.reglages.musique = true;
      s.schema = 3;
      return s;
    },
    // 3 → 4 : la file des questions ratées à reposer un peu plus tard arrive, vide ; rien d'autre ne change.
    3: function (s) {
      s.rappels = JEU.rappels ? JEU.rappels.completer(s.rappels) : (s.rappels || rappelsVides());
      s.schema = 4;
      return s;
    },
    // 4 → 5 : la mémoire des questions posées arrive, vide (l'horloge part de zéro ; une question déjà vue d'après
    // questionsVues compte comme posée il y a longtemps) ; rien d'autre ne change.
    4: function (s) {
      s.posees = JEU.questions && JEU.questions.completerPosees ? JEU.questions.completerPosees(s.posees) : (s.posees || poseesVides());
      s.schema = 5;
      return s;
    },
    // 5 → 6 : le bloc des expéditions arrive, vide (renommée 0, Armorial vide, aucune expédition en cours ; complété par
    // JEU.expedition.completer) ; rien d'autre ne change.
    5: function (s) {
      s.expedition = JEU.expedition ? JEU.expedition.completer(s.expedition) : (s.expedition || expeditionVide());
      s.schema = 6;
      return s;
    }
  };

  function migrer(s) {
    if (!s || typeof s !== "object" || Array.isArray(s)) throw new Error("sauvegarde illisible");
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
    // nouvelle séance : les questions ratées encore en attente passent en tête des prochaines questions
    if (JEU.rappels) JEU.rappels.ouvrirSession(etat);
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

  function objetSimple(x) { return !!x && typeof x === "object" && !Array.isArray(x); }

  // Une vraie sauvegarde du jeu a toujours une date de création, des notions et des ressources.
  function ressembleASauvegarde(s) {
    return objetSimple(s) && typeof s.creeLe === "string" && objetSimple(s.notions) && objetSimple(s.ressources);
  }

  // Remplace la partie en cours. La confirmation est demandée par l'interface.
  // Le fichier est vérifié AVANT la migration (qui compléterait n'importe quel objet),
  // et l'ancienne partie est gardée de côté dans le navigateur (clé jeu5e-avant-import).
  function importer(texte) {
    var PAS_UNE_SAUVEGARDE = "Ce fichier n'est pas une sauvegarde du jeu, ou il est abîmé.";
    var brut;
    try { brut = JSON.parse(texte); } catch (e) { throw new Error(PAS_UNE_SAUVEGARDE); }
    if (!ressembleASauvegarde(brut)) throw new Error(PAS_UNE_SAUVEGARDE);
    if (brut.schema > SCHEMA) throw new Error("Cette sauvegarde vient d'une version plus récente du jeu. Demande à ton père de mettre le jeu à jour.");
    var s;
    try { s = migrer(brut); } catch (e) { throw new Error(PAS_UNE_SAUVEGARDE); }
    var ls = stockage();
    try { var ancien = ls && ls.getItem(CLE); if (ancien) ls.setItem(CLE + "-avant-import", ancien); } catch (e) { /* stockage plein ou interdit */ }
    etat = s;
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
