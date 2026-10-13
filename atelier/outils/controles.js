// Contrôles 1 à 7 du validateur (docs/FORMAT_DONNEES.md), communs à valider.js (Node)
// et à validateur.html (navigateur). Les contrôles 8 et 9 (extractions) sont dans valider.js.
(function (racine) {
  "use strict";
  var TYPES = ["qcm", "qcm_multiple", "vrai_faux", "association", "ordre", "trou", "legende_schema", "clic_carte", "calcul_etapes"];
  var MATIERES = ["histoire", "geographie", "svt", "physique", "litterature", "lecture", "anglais", "methode"];
  var CHAMPS_DEVOIR = ["id", "matiere", "semaine", "intitule", "perimetre"];
  var RX = {
    cours: /^(histoire|geographie|svt|physique|litterature|lecture)-s(0[1-9]|[12][0-9]|3[0-4])-\d+$/,
    methode: /^methode-[a-z]+$/,
    anglais: /^anglais-seq\d\d$/,
    devoir: /^(histoire|geographie|svt|physique|litterature|lecture|anglais)-d\d+$/
  };

  function phrases(s) {
    var t = String(s || "").trim();
    if (!t) return 0;
    return t.split(/[.!?…]+(?:\s+|$)/).filter(function (x) { return x.trim().length > 0; }).length;
  }
  function mots(s) { return String(s || "").split(/\s+/).filter(Boolean).length; }

  // donnees : { config, planning, devoirs, indexCours, aRetravailler, cours: {id: obj}, anglais: {id: obj}, erreursChargement: [] }
  // debrouiller : fonction(texte) -> texte
  function controler(donnees, debrouiller) {
    var erreurs = [], alertes = [];
    function E(m) { erreurs.push(m); }
    function A(m) { alertes.push(m); }

    // 1. chargement
    (donnees.erreursChargement || []).forEach(function (e) { E("[1] " + e); });
    if (!donnees.config) E("[1] config.js absent ou illisible");
    ["planning", "devoirs", "indexCours"].forEach(function (k) { if (!Array.isArray(donnees[k])) E("[1] " + k + " absent ou illisible"); });
    var planning = donnees.planning || [], devoirs = donnees.devoirs || [], index = donnees.indexCours || [];

    // 2. identifiants uniques et au bon format
    var vus = {};
    function unique(id, ou) {
      if (!id) { E("[2] identifiant manquant (" + ou + ")"); return; }
      if (vus[id]) E("[2] identifiant en double : " + id + " (" + ou + " et " + vus[id] + ")");
      vus[id] = ou;
    }
    var parId = {};
    planning.forEach(function (p) {
      unique(p.id, "planning");
      parId[p.id] = p;
      if (!RX.cours.test(p.id)) E("[2] identifiant de planning mal formé : " + p.id);
      if (MATIERES.indexOf(p.matiere) < 0) E("[2] matière inconnue dans le planning : " + p.id);
      if (!(p.semaine >= 1 && p.semaine <= 34)) E("[3] semaine hors de 1 à 34 : " + p.id);
      if (["cours", "revision", "devoir"].indexOf(p.type) < 0) E("[2] type d'entrée inconnu : " + p.id);
      if (p.id.indexOf(p.matiere + "-s" + (p.semaine < 10 ? "0" : "") + p.semaine + "-") !== 0) E("[2] identifiant incohérent avec matière ou semaine : " + p.id);
    });
    devoirs.forEach(function (d) { unique(d.id, "devoirs"); if (!RX.devoir.test(d.id)) E("[2] identifiant de devoir mal formé : " + d.id); });

    // 3. index-cours
    index.forEach(function (id) {
      var anglais = RX.anglais.test(id), methode = RX.methode.test(id);
      if (!anglais && !methode && !parId[id]) E("[3] cours de index-cours absent du planning : " + id);
      if (!anglais && !methode && parId[id] && parId[id].type !== "cours") E("[3] index-cours vise une entrée qui n'est pas un cours : " + id);
      if (!(donnees.cours[id] || donnees.anglais[id])) E("[3] fichier de cours absent ou illisible : " + id);
    });
    Object.keys(donnees.cours).concat(Object.keys(donnees.anglais)).forEach(function (id) {
      if (index.indexOf(id) < 0) A("[3] fichier présent mais absent de index-cours.js : " + id);
    });

    // index des fiches (et éléments d'anglais) pour les contrôles suivants
    var fiches = {}, bonusIds = {};
    function rangCours(id) {
      if (RX.methode.test(id)) return { semaine: 0, ordre: 0 };
      if (RX.anglais.test(id)) return { semaine: 0, ordre: Number(id.slice(-2)) };
      var p = parId[id];
      return p ? { semaine: p.semaine, ordre: p.ordre } : { semaine: 99, ordre: 0 };
    }
    Object.keys(donnees.cours).forEach(function (cid) {
      var c = donnees.cours[cid];
      if (c.id !== cid) E("[2] identifiant de cours différent du nom de fichier : " + cid);
      if (RX.methode.test(cid) && (!c.matiere || !c.titre)) E("[2] fiche méthode sans matiere ou titre : " + cid);
      (c.fiches || []).forEach(function (f) {
        unique(f.id, cid);
        if (!new RegExp("^" + cid + "-f\\d+$").test(f.id)) E("[2] identifiant de fiche mal formé : " + f.id);
        fiches[f.id] = { cours: cid, fiche: f };
      });
      (c.schemas || []).forEach(function (s) { unique(s.id, cid); if (!new RegExp("^" + cid + "-s\\d+$").test(s.id)) E("[2] identifiant de schéma mal formé : " + s.id); });
      (c.bonus || []).forEach(function (b) { unique(b.id, cid); bonusIds[b.id] = cid; if (!new RegExp("^" + cid + "-b\\d+$").test(b.id)) E("[2] identifiant de bonus mal formé : " + b.id); });
      (c.questions || []).forEach(function (q) { unique(q.id, cid); if (!new RegExp("^" + cid + "-q\\d+$").test(q.id)) E("[2] identifiant de question mal formé : " + q.id); });
    });
    Object.keys(donnees.anglais).forEach(function (cid) {
      var s = donnees.anglais[cid];
      [["vocabulaire", "v"], ["structures", "g"], ["phrases", "p"]].forEach(function (k) {
        (s[k[0]] || []).forEach(function (el) {
          unique(el.id, cid);
          if (!new RegExp("^" + cid + "-" + k[1] + "\\d+$").test(el.id)) E("[2] identifiant d'élément d'anglais mal formé : " + el.id);
          fiches[el.id] = { cours: cid, fiche: el };
          if (!el.source || !el.source.fichier) E("[5] élément d'anglais sans source : " + el.id);
        });
      });
      (s.questions || []).forEach(function (q) { unique(q.id, cid); });
      (s.bonus || []).forEach(function (b) { unique(b.id, cid); bonusIds[b.id] = cid; });
    });

    // 4. questions
    function tousLesCours() {
      var r = [];
      Object.keys(donnees.cours).forEach(function (k) { r.push(donnees.cours[k]); });
      Object.keys(donnees.anglais).forEach(function (k) { r.push(donnees.anglais[k]); });
      return r;
    }
    var vfParFiche = {}, qParFiche = {}, pourquoiParFiche = {};
    tousLesCours().forEach(function (c) {
      (c.questions || []).forEach(function (q) {
        var o = q.id;
        if (TYPES.indexOf(q.type) < 0) E("[4] type de question inconnu : " + o + " (" + q.type + ")");
        if (bonusIds[q.fiche]) E("[6] une question s'appuie sur un bonus : " + o);
        else if (!fiches[q.fiche]) E("[4] fiche inexistante : " + o + " → " + q.fiche);
        else if (fiches[q.fiche].cours !== c.id) E("[4] la question vise une fiche d'un autre cours : " + o);
        if (!q.source || !q.source.fichier || !q.source.page) E("[4] source manquante : " + o);
        if (!q.explication) E("[4] explication manquante : " + o);
        else if (phrases(q.explication) > 2) E("[4] explication de plus de deux phrases : " + o);
        if (!(q.niveau >= 1 && q.niveau <= 3)) E("[4] niveau absent ou hors de 1 à 3 : " + o);
        var r;
        try { r = JSON.parse(debrouiller(q.r)); } catch (e) { E("[4] réponse illisible une fois débrouillée : " + o); return; }
        function doublons(t, nom) {
          if (!Array.isArray(t)) { E("[4] " + nom + " manquant : " + o); return; }
          var n = t.map(function (x) { return String(x).trim().toLowerCase(); });
          if (n.some(function (x, i) { return n.indexOf(x) !== i; })) E("[4] " + nom + " en double : " + o);
        }
        switch (q.type) {
          case "qcm":
            doublons(q.choix, "choix");
            if (q.choix && q.choix.length !== 4) A("[4] QCM sans 4 choix : " + o);
            if (q.choix && q.choix.indexOf(r) < 0) E("[4] bonne réponse absente des choix : " + o);
            break;
          case "qcm_multiple":
            doublons(q.choix, "choix");
            if (!Array.isArray(r) || !r.length || r.some(function (x) { return q.choix.indexOf(x) < 0; })) E("[4] bonne réponse absente des choix : " + o);
            break;
          case "vrai_faux":
            if (typeof r !== "object" || typeof r.vrai !== "boolean") { E("[4] réponse vrai/faux mal formée : " + o); break; }
            if (!r.vrai) {
              doublons(q.corrections, "corrections");
              if (!q.corrections || q.corrections.length < 2 || q.corrections.length > 3) E("[4] il faut 2 ou 3 corrections : " + o);
              else if (q.corrections.indexOf(r.correction) < 0) E("[4] bonne correction absente des corrections : " + o);
            }
            break;
          case "association":
            doublons(q.gauche, "gauche"); doublons(q.droite, "droite");
            if (!Array.isArray(r) || r.length !== (q.gauche || []).length) { E("[4] paires incomplètes : " + o); break; }
            var g = r.map(function (p) { return p[0]; }), d = r.map(function (p) { return p[1]; });
            if (g.some(function (x, i) { return g.indexOf(x) !== i || x >= q.gauche.length; }) || d.some(function (x, i) { return d.indexOf(x) !== i || x >= q.droite.length; })) E("[4] paires invalides : " + o);
            break;
          case "ordre":
            doublons(q.elements, "éléments");
            if (!Array.isArray(r) || r.length !== (q.elements || []).length || r.slice().sort().some(function (x, i) { return x !== i; })) E("[4] ordre juste invalide : " + o);
            break;
          case "trou":
            var nb = String(q.texte || "").split("___").length - 1;
            if (!Array.isArray(r) || r.length !== nb) E("[4] nombre de trous différent du nombre de réponses : " + o);
            if (q.banque) {
              doublons(q.banque, "banque");
              (r || []).forEach(function (a) { var x = Array.isArray(a) ? a[0] : a; if (q.banque.indexOf(x) < 0) E("[4] mot attendu absent de la banque : " + o); });
            }
            break;
        }
        qParFiche[q.fiche] = (qParFiche[q.fiche] || 0) + 1;
        if (q.type === "vrai_faux") vfParFiche[q.fiche] = true;
        if (/\b(pourquoi|comment)\b/i.test(q.enonce)) pourquoiParFiche[q.fiche] = true;
      });
    });
    Object.keys(donnees.cours).forEach(function (cid) {
      (donnees.cours[cid].fiches || []).forEach(function (f) {
        if (!vfParFiche[f.id]) E("[4] aucune question vrai_faux pour la notion : " + f.id);
        if ((qParFiche[f.id] || 0) < 3) A("[4] moins de trois questions écrites pour : " + f.id);
        if (!pourquoiParFiche[f.id]) A("[4] aucune question en « pourquoi » ou « comment » pour : " + f.id);
      });
    });

    // 5. fiches
    Object.keys(donnees.cours).forEach(function (cid) {
      var c = donnees.cours[cid];
      (c.fiches || []).forEach(function (f) {
        if (!f.source || !f.source.fichier || !f.source.page) E("[5] source (fichier et page) manquante : " + f.id);
        if (mots(f.texte) > 60) A("[5] texte de plus de 60 mots (" + mots(f.texte) + ") : " + f.id);
        if (f.schema && !(c.schemas || []).some(function (s) { return s.id === f.schema; })) E("[5] schéma inexistant : " + f.id + " → " + f.schema);
        (f.prerequis || []).forEach(function (p) {
          var x = fiches[p];
          if (!x) { E("[5] prérequis inexistant : " + f.id + " → " + p); return; }
          if (x.cours === cid) return;
          var a = rangCours(x.cours), b = rangCours(cid);
          var anterieur = a.semaine < b.semaine || (a.semaine === b.semaine && x.cours.split("-")[0] === cid.split("-")[0] && a.ordre < b.ordre) ||
            (a.semaine === b.semaine && x.cours.split("-")[0] !== cid.split("-")[0]);
          if (!anterieur) E("[5] prérequis pris dans un cours postérieur : " + f.id + " → " + p);
        });
      });
    });

    // 6. bonus
    tousLesCours().forEach(function (c) {
      (c.bonus || []).forEach(function (b) {
        if (!b.source || !b.source.titre || !(b.source.editeur || b.source.url)) E("[6] bonus sans source fiable notée : " + b.id);
        if (!fiches[b.fiche]) E("[6] bonus rattaché à une notion inexistante : " + b.id);
      });
    });

    // 7. devoirs
    devoirs.forEach(function (d) {
      Object.keys(d).forEach(function (k) { if (CHAMPS_DEVOIR.indexOf(k) < 0) E("[7] champ interdit dans devoirs.js : " + d.id + "." + k); });
      CHAMPS_DEVOIR.forEach(function (k) { if (!(k in d)) E("[7] champ manquant : " + d.id + "." + k); });
      if (!(d.semaine >= 1 && d.semaine <= 34)) E("[7] semaine invalide : " + d.id);
      if (!Array.isArray(d.perimetre)) { E("[7] périmètre invalide : " + d.id); return; }
      if (d.matiere === "anglais") {
        d.perimetre.forEach(function (p) { if (!RX.anglais.test(p)) E("[7] périmètre d'anglais invalide : " + d.id + " → " + p); });
      } else {
        if (!d.perimetre.length) A("[7] périmètre vide : " + d.id);
        d.perimetre.forEach(function (p) {
          var e = parId[p];
          if (!e) E("[7] périmètre : entrée inconnue " + p + " (" + d.id + ")");
          else if (e.type !== "cours" || e.matiere !== d.matiere) E("[7] périmètre : " + p + " n'est pas un cours de " + d.matiere + " (" + d.id + ")");
          else if (e.semaine > d.semaine) E("[7] périmètre : " + p + " vient après le devoir " + d.id);
        });
      }
    });
    (donnees.aRetravailler || []).forEach(function (id) { if (!fiches[id]) A("[7] a-retravailler : fiche inconnue " + id); });
    // suivi du chroniqueur : cours connus, états permis, note courte
    if (donnees.suivi) {
      if (typeof donnees.suivi.cours !== "object") E("[1] suivi : champ cours absent");
      Object.keys(donnees.suivi.cours || {}).forEach(function (id) {
        var x = donnees.suivi.cours[id];
        var connu = planning.some(function (p) { return p.id === id; }) || donnees.cours[id] || donnees.anglais[id] || /^methode-/.test(id);
        if (!connu) E("[7] suivi : cours inconnu " + id);
        if (["acquis", "a-revoir"].indexOf(x.etat) < 0) E("[7] suivi : état inconnu pour " + id + " (acquis ou a-revoir)");
        if (x.note && mots(x.note) > 20) A("[7] suivi : note trop longue pour " + id + " (20 mots au plus)");
      });
    }

    return { erreurs: erreurs, alertes: alertes };
  }

  var api = { controler: controler, phrases: phrases, mots: mots };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  racine.CONTROLES = api;
})(typeof window !== "undefined" ? window : globalThis);
