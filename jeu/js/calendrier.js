// Calendrier : numéro de semaine du programme. Il informe, il ne bloque rien.
(function (racine) {
  "use strict";
  var JEU = racine.JEU;
  var JOUR = 86400000;
  var MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août",
    "septembre", "octobre", "novembre", "décembre"];
  var DERNIERE = 34;

  // Nombre de jours depuis une origine fixe, en ignorant les heures et les changements d'heure.
  function numJour(d) { return Math.round(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / JOUR); }
  function depuisNum(n) { var u = new Date(n * JOUR); return new Date(u.getUTCFullYear(), u.getUTCMonth(), u.getUTCDate()); }

  function semaine(date, config) {
    config = config || JEU.donnees.config;
    date = date || new Date();
    var lundi1 = numJour(JEU.util.lireDate(config.debutSemaine1));
    var jour = numJour(date);
    var ecoule = Math.floor((jour - lundi1) / 7);
    var lundi = lundi1 + ecoule * 7;
    if (jour < lundi1) {
      return { numero: 1, avant: true, apres: false, pause: false, lundi: depuisNum(lundi1), dimanche: depuisNum(lundi1 + 6) };
    }
    var pauses = (config.pauses || []).map(function (p) { return numJour(JEU.util.lireDate(p)); });
    var enPause = pauses.indexOf(lundi) >= 0;
    var sautees = pauses.filter(function (p) { return p <= lundi && p >= lundi1; }).length;
    var numero = ecoule + 1 - sautees;
    if (enPause) numero = Math.max(1, numero); // une semaine de pause garde le numéro de la précédente
    var apres = numero > DERNIERE;
    return {
      numero: Math.min(numero, DERNIERE), apres: apres, avant: false, pause: enPause,
      revisionLibre: apres, lundi: depuisNum(lundi), dimanche: depuisNum(lundi + 6)
    };
  }

  function lundiDe(numero, config) {
    config = config || JEU.donnees.config;
    var lundi1 = numJour(JEU.util.lireDate(config.debutSemaine1));
    var pauses = (config.pauses || []).map(function (p) { return numJour(JEU.util.lireDate(p)); }).sort();
    var l = lundi1, n = 1;
    while (n < numero) { l += 7; if (pauses.indexOf(l) < 0) n++; }
    while (pauses.indexOf(l) >= 0) l += 7;
    return depuisNum(l);
  }

  function formatJour(d, avecAnnee) {
    return d.getDate() + (d.getDate() === 1 ? "er" : "") + " " + MOIS[d.getMonth()] + (avecAnnee ? " " + d.getFullYear() : "");
  }

  function libelle(s) {
    var a = s.lundi, b = s.dimanche;
    var debut = a.getMonth() === b.getMonth() ? String(a.getDate()) + (a.getDate() === 1 ? "er" : "") : formatJour(a, a.getFullYear() !== b.getFullYear());
    var txt = "Semaine " + s.numero + " · du " + debut + " au " + formatJour(b, true);
    if (s.revisionLibre) txt = "Semaine 34 passée · révision libre";
    else if (s.avant) txt = "Avant la rentrée · semaine 1 le " + formatJour(a, true);
    else if (s.pause) txt += " (pause)";
    return txt;
  }

  JEU.calendrier = { semaine: semaine, lundiDe: lundiDe, libelle: libelle, formatJour: formatJour, DERNIERE: DERNIERE };
})(typeof window !== "undefined" ? window : globalThis);
