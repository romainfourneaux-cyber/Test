// Répétition espacée, méthode de Leitner à 5 boîtes (intervalles dans config.leitnerJours).
// Une « notion » est une fiche (ou un élément d'anglais) : etat.notions[idFiche].
(function (racine) {
  "use strict";
  var JEU = racine.JEU;
  var JOUR = 86400000;

  function jours() {
    return (JEU.donnees.config && JEU.donnees.config.leitnerJours) || [1, 2, 4, 8, 16];
  }

  function noter(etat, ficheId, juste, maintenant) {
    var n = etat.notions[ficheId] || { boite: 1, vue: null, ok: 0, ko: 0 };
    if (juste) { n.boite = Math.min(5, n.boite + 1); n.ok++; }
    else { n.boite = 1; n.ko++; }
    n.vue = JEU.util.horodatage(maintenant);
    etat.notions[ficheId] = n;
    return n;
  }

  function echeance(n) {
    var vue = JEU.util.lireDate(n.vue);
    if (!vue) return null;
    return new Date(vue.getTime() + jours()[Math.max(0, Math.min(4, n.boite - 1))] * JOUR);
  }

  function aRevoir(n, maintenant) {
    if (!n || !n.vue) return false;
    return (maintenant || new Date()) >= echeance(n);
  }

  function solide(n) { return !!n && n.boite >= 4; }

  // Tirage d'une partie libre : 50 % à revoir, 40 % de cours récents, 10 % de notions solides.
  // candidats : [{ fiche, cours, recent }], recent = rang de récence (0 = plus récent).
  function tirer(candidats, etat, nombre, options) {
    options = options || {};
    var maintenant = options.maintenant || new Date();
    var aRetravailler = options.aRetravailler || [];
    var revoir = [], recents = [], solides = [], neufs = [];
    candidats.forEach(function (c) {
      var n = etat.notions[c.fiche];
      if (aRetravailler.indexOf(c.fiche) >= 0 || aRevoir(n, maintenant) || (n && n.boite === 1 && n.ko > 0)) revoir.push(c);
      else if (solide(n)) solides.push(c);
      else if (!n) neufs.push(c);
      else recents.push(c);
    });
    // les notions jamais vues des cours récents passent en tête des « récents »
    recents = neufs.concat(recents).sort(function (a, b) { return (a.recent || 0) - (b.recent || 0); });
    var M = JEU.util.melanger;
    revoir = M(revoir); solides = M(solides);
    var quotas = [Math.round(nombre * 0.5), Math.round(nombre * 0.4)];
    quotas.push(nombre - quotas[0] - quotas[1]);
    var paquets = [revoir, melangerParTranches(recents), solides];
    var choisis = [];
    for (var p = 0; p < 3; p++) choisis = choisis.concat(paquets[p].splice(0, quotas[p]));
    // compléter avec ce qui reste, dans l'ordre de priorité
    var reste = revoir.concat(paquets[1], solides);
    while (choisis.length < nombre && reste.length) choisis.push(reste.shift());
    return M(choisis);
  }

  // Garde l'ordre de récence par tranches de 6, mais mélange à l'intérieur de chaque tranche.
  function melangerParTranches(t) {
    var r = [];
    for (var i = 0; i < t.length; i += 6) r = r.concat(JEU.util.melanger(t.slice(i, i + 6)));
    return r;
  }

  JEU.leitner = { noter: noter, echeance: echeance, aRevoir: aRevoir, solide: solide, tirer: tirer, jours: jours };
})(typeof window !== "undefined" ? window : globalThis);
