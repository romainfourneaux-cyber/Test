// Contrôles 1 à 7, 10 et 11 du validateur (docs/FORMAT_DONNEES.md), communs à valider.js (Node)
// et à validateur.html (navigateur). Les contrôles 8 et 9 (extractions) sont dans valider.js.
(function (racine) {
  "use strict";
  var TYPES = ["qcm", "qcm_multiple", "vrai_faux", "association", "ordre", "trou", "legende_schema", "clic_carte", "calcul_etapes"];
  var MATIERES = ["histoire", "geographie", "svt", "physique", "litterature", "lecture", "langue", "anglais", "methode"];
  var CHAMPS_DEVOIR = ["id", "matiere", "semaine", "intitule", "perimetre"];
  // Grammaire et conjugaison (matière « langue ») : hors planning, rangées par badges Griffon (même liste que
  // JEU.BADGES_GRIFFON dans jeu/js/noyau.js). Thèmes : nat (natures), fon (fonctions), log (analyse logique),
  // conj (conjugaison), txt (analyse de texte) ; numéro du cours Griffon sur deux chiffres.
  var BADGES = ["bois", "fer", "cuivre", "acier", "bronze", "titane", "argent", "or"];
  var RX = {
    cours: /^(histoire|geographie|svt|physique|litterature|lecture)-s(0[1-9]|[12][0-9]|3[0-4])-\d+$/,
    methode: /^methode-[a-z]+$/,
    anglais: /^anglais-seq\d\d$/,
    langue: /^langue-(nat|fon|log|conj|txt)\d\d$/,
    devoir: /^(histoire|geographie|svt|physique|litterature|lecture|langue|anglais)-d\d+$/
  };

  // 10. personnages.js (16/10/2026) : souverains réels cités par les cours d'histoire et rivaux de la campagne.
  var CAMPS_PERSONNAGES = ["joueur", "angleterre", "omeyyades"];
  var CAMPS_RIVAUX = ["angleterre", "omeyyades"];
  var SITUATIONS_RIVAL = ["presentation", "defi", "victoire", "tenu", "retraite", "province", "attaque"];
  var NIVEAUX_RIVALITE = ["calme", "pique", "acharne"];
  // Répliques : jeu seulement. Ni religion, ni insulte (mots repérés en entier, accents compris).
  var MOTS_INTERDITS = /(^|[^a-zà-ÿœæ])(dieux?|papes?|[ée]glises?|chr[ée]tien\w*|musulman\w*|islam\w*|mosqu[ée]e\w*|croisades?|infid[èe]le\w*|pri[èe]res?|saints?|saintes?|paradis|enfer|messe|proph[èe]te\w*|religi\w*|idiot\w*|imb[ée]cile\w*|cr[ée]tin\w*|stupide\w*|minable\w*|l[âa]che|l[âa]ches|mis[ée]rable\w*|path[ée]tique\w*|ridicule\w*|abruti\w*|nullard\w*)(?![a-zà-ÿœæ])/i;

  function phrases(s) {
    var t = String(s || "").trim();
    if (!t) return 0;
    return t.split(/[.!?…]+(?:\s+|$)/).filter(function (x) { return x.trim().length > 0; }).length;
  }
  function mots(s) { return String(s || "").split(/\s+/).filter(Boolean).length; }

  // Source d'une estimation de suivi.js : "devoir" (identifiant de devoirs.js), "fichier" (chemin d'un fichier
  // déposé, relatif à DEPOT/ ; valider.js vérifie qu'il existe) ou null (manquante ou inconnue).
  function sourceSuivi(source, devoirs) {
    if (typeof source !== "string" || !source.trim()) return null;
    if ((devoirs || []).some(function (d) { return d.id === source; })) return "devoir";
    if (/\.(pdf|jpe?g|png|heic|docx?|odt|txt)$/i.test(source) && !/^(\/|[a-z]:)|\.\./i.test(source)) return "fichier";
    return null;
  }

  // donnees : { config, planning, devoirs, indexCours, aRetravailler, cours: {id: obj}, anglais: {id: obj}, erreursChargement: [] }
  // debrouiller : fonction(texte) -> texte
  // 11. Questions de thème (25/10/2026, demande de Romain) : une source qui porte un champ « theme » vient d'une source
  // fiable (encyclopédie, institution, musée), pas d'un fichier déposé : { theme, titre, editeur, url }, sans fichier ni page.
  var SITES_THEME = ["wikipedia.org", "vikidia.org", "lumni.fr", "larousse.fr", "bnf.fr", "education.fr", "gouv.fr",
    "louvre.fr", "musee-moyenage.fr", "chateauversailles.fr", "mnhn.fr", "universcience.fr", "cite-sciences.fr", "palais-decouverte.fr",
    "cnrs.fr", "cnes.fr", "meteofrance.com", "ign.fr", "insee.fr", "ined.fr", "un.org", "unesco.org", "who.int",
    "metmuseum.org", "britishmuseum.org", "nasa.gov", "esa.int"];
  function estSourceTheme(src) { return !!(src && typeof src === "object" && src.theme !== undefined); }
  function hoteDe(url) { var m = /^https?:\/\/([^\/?#]+)/i.exec(String(url || "")); return m ? m[1].toLowerCase() : ""; }
  function siteConnu(hote) {
    if (!hote) return false;
    if (/musee|museum/.test(hote)) return true;
    return SITES_THEME.some(function (s) { return hote === s || hote.slice(-s.length - 1) === "." + s; });
  }

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

    // 3. index-cours (séquences d'anglais, fiches méthode et cours de langue : hors planning)
    index.forEach(function (id) {
      var horsPlanning = RX.anglais.test(id) || RX.methode.test(id) || RX.langue.test(id);
      if (/^langue-/.test(id) && !RX.langue.test(id)) E("[2] identifiant de cours de langue mal formé : " + id + " (langue-<nat|fon|log|conj|txt><nn>)");
      else if (!horsPlanning && !parId[id]) E("[3] cours de index-cours absent du planning : " + id);
      if (!horsPlanning && parId[id] && parId[id].type !== "cours") E("[3] index-cours vise une entrée qui n'est pas un cours : " + id);
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
      if (RX.langue.test(id)) {
        // cours de langue : un badge antérieur, ou le même badge avec un ordre plus petit
        var cl = donnees.cours[id] || {}, rb = BADGES.indexOf(cl.badge);
        return { semaine: 0, ordre: (rb < 0 ? 99 : rb) * 1000 + (Number(cl.ordre) || 0) };
      }
      var p = parId[id];
      return p ? { semaine: p.semaine, ordre: p.ordre } : { semaine: 99, ordre: 0 };
    }
    Object.keys(donnees.cours).forEach(function (cid) {
      var c = donnees.cours[cid];
      if (c.id !== cid) E("[2] identifiant de cours différent du nom de fichier : " + cid);
      if (RX.methode.test(cid) && (!c.matiere || !c.titre)) E("[2] fiche méthode sans matiere ou titre : " + cid);
      if (/^langue-/.test(cid)) {
        if (!RX.langue.test(cid)) E("[2] identifiant de cours de langue mal formé : " + cid + " (langue-<nat|fon|log|conj|txt><nn>)");
        if (c.matiere !== "langue") E("[2] cours de langue sans matiere « langue » : " + cid);
        if (!c.titre || typeof c.titre !== "string") E("[2] cours de langue sans titre : " + cid);
        if (BADGES.indexOf(c.badge) < 0) E("[2] cours de langue sans badge connu : " + cid + " (" + BADGES.join(", ") + ")");
        if (!(typeof c.ordre === "number" && c.ordre >= 1 && Math.floor(c.ordre) === c.ordre)) E("[2] cours de langue sans ordre (entier, 1 ou plus) : " + cid);
      }
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
    var vfParFiche = {}, qParFiche = {}, pourquoiParFiche = {}, themeParCours = {};
    tousLesCours().forEach(function (c) {
      (c.questions || []).forEach(function (q) {
        var o = q.id;
        if (TYPES.indexOf(q.type) < 0) E("[4] type de question inconnu : " + o + " (" + q.type + ")");
        if (bonusIds[q.fiche]) E("[6] une question s'appuie sur un bonus : " + o);
        else if (!fiches[q.fiche]) E("[4] fiche inexistante : " + o + " → " + q.fiche);
        else if (fiches[q.fiche].cours !== c.id) E("[4] la question vise une fiche d'un autre cours : " + o);
        if (estSourceTheme(q.source)) {
          // 11. question de thème : theme, titre, editeur, url en http(s) ; ni fichier ni page ; site connu, sinon ALERTE
          var manque = ["theme", "titre", "editeur", "url"].filter(function (k) { return typeof q.source[k] !== "string" || !q.source[k].trim(); });
          if (manque.length) E("[11] question de thème sans " + manque.join(", ") + " : " + o);
          else if (!/^https?:\/\//i.test(q.source.url)) E("[11] question de thème avec une adresse qui n'est pas en http(s) : " + o + " (" + q.source.url + ")");
          else if (!siteConnu(hoteDe(q.source.url))) A("[11] source de thème hors de la liste des sites connus : " + o + " (" + hoteDe(q.source.url) + ") : vérifie que c'est une encyclopédie, une institution ou un musée");
          if (q.source.fichier !== undefined || q.source.page !== undefined) E("[11] une source de thème ne cite ni fichier ni page : " + o);
          themeParCours[c.id] = (themeParCours[c.id] || 0) + 1;
        } else if (!q.source || !q.source.fichier || !q.source.page) E("[4] source manquante : " + o);
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
    // 11 (suite). Au plus la moitié des questions d'un cours sont des questions de thème (ALERTE avec le compte :
    // un cours trop mince, dit tel par l'audit, garde son alerte, notée au journal).
    tousLesCours().forEach(function (c) {
      var n = themeParCours[c.id] || 0, total = (c.questions || []).length;
      if (n * 2 > total) A("[11] " + c.id + " : " + n + " questions de thème sur " + total + ", plus de la moitié (règle du 25/10/2026 : la moitié au plus, sauf cours trop mince dit tel par l'audit)");
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
      if (d.matiere === "langue") {
        // grammaire : un devoir par badge Griffon, fait au rythme de l'élève, donc sans semaine
        if (d.semaine !== null) E("[7] semaine invalide : " + d.id + " (null pour un devoir de langue, hors planning)");
      } else if (!(d.semaine >= 1 && d.semaine <= 34)) E("[7] semaine invalide : " + d.id);
      if (!Array.isArray(d.perimetre)) { E("[7] périmètre invalide : " + d.id); return; }
      if (d.matiere === "anglais") {
        d.perimetre.forEach(function (p) { if (!RX.anglais.test(p)) E("[7] périmètre d'anglais invalide : " + d.id + " → " + p); });
      } else if (d.matiere === "langue") {
        // cours de langue : identifiant bien formé ; s'il a déjà son fichier, c'est bien un cours de langue
        if (!d.perimetre.length) A("[7] périmètre vide : " + d.id);
        d.perimetre.forEach(function (p) {
          if (!RX.langue.test(p)) E("[7] périmètre de langue invalide : " + d.id + " → " + p);
          else if (donnees.cours[p] && donnees.cours[p].matiere !== "langue") E("[7] périmètre : " + p + " n'est pas un cours de langue (" + d.id + ")");
        });
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
    // suivi du chroniqueur (jeu/data/suivi.js) : seulement des cours, états permis, devoir source connu, note courte.
    // La note s'affiche à l'élève : l'anti-recopie et l'anti-spoil de la note sont dans valider.js (contrôles 8 et 9).
    if (donnees.suivi) {
      var su = donnees.suivi.cours;
      if (!su || typeof su !== "object" || Array.isArray(su)) E("[1] suivi : champ cours absent");
      Object.keys(su || {}).forEach(function (id) {
        var x = su[id];
        if (!x || typeof x !== "object") { E("[7] suivi : estimation illisible pour " + id); return; }
        var p = parId[id], langue = RX.langue.test(id);
        if (p && p.type !== "cours") E("[7] suivi : " + id + " n'est pas un cours (entrée de type " + p.type + ")");
        else if (!p && !RX.anglais.test(id) && !RX.methode.test(id) && !langue) E("[7] suivi : cours inconnu " + id);
        if (["acquis", "a-revoir"].indexOf(x.etat) < 0) E("[7] suivi : état inconnu pour " + id + " (acquis ou a-revoir)");
        var genre = sourceSuivi(x.source, devoirs);
        if (!genre) E("[7] suivi : devoir source manquant ou inconnu pour " + id + (x.source ? " (" + x.source + ")" : "") + " : identifiant de devoirs.js ou fichier déposé");
        else if (genre === "devoir" && ((p && p.type === "cours") || langue)) {
          var dv = devoirs.filter(function (d) { return d.id === x.source; })[0];
          if (Array.isArray(dv.perimetre) && dv.perimetre.indexOf(id) < 0) A("[7] suivi : " + id + " n'est pas dans le périmètre de " + x.source);
        }
        if (typeof x.le !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(x.le)) A("[7] suivi : date de l'estimation (le, AAAA-MM-JJ) absente ou mal écrite pour " + id + " : /relecture s'en sert");
        if (x.note !== undefined && typeof x.note !== "string") E("[7] suivi : note illisible pour " + id);
        else if (x.note && mots(x.note) > 20) A("[7] suivi : note trop longue pour " + id + " (20 mots au plus)");
        if (typeof x.note === "string" && /\d/.test(x.note)) A("[7] suivi : la note de " + id + " contient un chiffre (donnée ou note du devoir ?)");
        if (typeof x.note === "string" && /(^|[^\wÀ-ÿ])(M\.|Mme|Mlle|monsieur|madame|correct(eur|rice)|professeure?|prof)([^\wÀ-ÿ]|$)/i.test(x.note)) A("[7] suivi : la note de " + id + " parle d'une personne (aucun nom d'élève, de famille ou de correcteur)");
      });
    }

    // 10. personnages.js (facultatif : sans lui, chaque front a « un seigneur rival » et ton camp n'a pas de souverain)
    if (donnees.personnages !== undefined && donnees.personnages !== null) controlerPersonnages(donnees.personnages, parId, index, E, A);

    return { erreurs: erreurs, alertes: alertes };
  }

  // Contrôle 10 : champs, camps, cours reliés (planning, fiche méthode ou cours de langue), sources, portraits
  // (fichier et crédit vérifiés par valider.js), règle des rivaux « titre seul », répliques (nombre, longueur,
  // marques {nom} {province} {souverain}, ni chiffre, ni religion, ni insulte, ni nom d'un personnage historique dans la
  // bouche d'un rival).
  function controlerPersonnages(P, parId, index, E, A) {
    function objet(x) { return !!x && typeof x === "object" && !Array.isArray(x); }
    if (!objet(P) || !Array.isArray(P.personnages)) { E("[10] personnages : objet { personnages: [...] } attendu"); return; }
    var ids = {}, noms = [];
    function coursValide(c, ou) {
      if (typeof c !== "string" || !c) { E("[10] " + ou + " : cours manquant"); return; }
      var p = parId[c];
      if (p) { if (p.type !== "cours") E("[10] " + ou + " : " + c + " n'est pas un cours (entrée de type " + p.type + ")"); }
      else if (!RX.methode.test(c) && !RX.langue.test(c)) E("[10] " + ou + " : cours inconnu " + c + " (planning, fiche méthode ou cours de langue)");
      if (index.indexOf(c) < 0) A("[10] " + ou + " : le cours " + c + " n'est pas encore dans index-cours.js (le personnage ou le fait reste dans la brume)");
    }
    function sourceValide(src, ou) {
      if (!objet(src) || typeof src.fichier !== "string" || !src.fichier || typeof src.page !== "number" || src.page < 1 || Math.floor(src.page) !== src.page) E("[10] " + ou + " : source { fichier, page } manquante ou mal écrite");
      else if (/^(\/|[a-z]:)|\.\./i.test(src.fichier)) E("[10] " + ou + " : chemin de source à écrire relatif à DEPOT/ (" + src.fichier + ")");
    }
    function texteCourt(t, ou, maxMots) {
      if (typeof t !== "string" || !t.trim()) { E("[10] " + ou + " : texte vide"); return false; }
      if (phrases(t) > 2) E("[10] " + ou + " : plus de deux phrases (« " + t + " »)");
      if (mots(t) > (maxMots || 28)) E("[10] " + ou + " : plus de " + (maxMots || 28) + " mots (« " + t + " »)");
      return true;
    }
    function replique(t, ou, marques, autorises) {
      if (!texteCourt(t, ou)) return;
      if (/\d/.test(t)) E("[10] " + ou + " : chiffre dans une réplique (pas de date ni de fait historique) : « " + t + " »");
      var m = MOTS_INTERDITS.exec(t);
      if (m) E("[10] " + ou + " : mot interdit dans une réplique (religion ou insulte) « " + m[2] + " » : « " + t + " »");
      (t.match(/\{[^}]*\}/g) || []).forEach(function (x) { if (marques.indexOf(x) < 0) E("[10] " + ou + " : marque " + x + " inconnue ici (permises : " + marques.join(", ") + ")"); });
      noms.forEach(function (n) { if (autorises.indexOf(n) < 0 && t.indexOf(n) >= 0) E("[10] " + ou + " : la réplique nomme " + n + " (un personnage relié à un cours qui peut être fermé)"); });
    }
    P.personnages.forEach(function (p, i) {
      if (!objet(p)) { E("[10] personnages[" + i + "] illisible"); return; }
      if (!p.titreSeul && typeof p.nom === "string" && p.nom) noms.push(p.nom);
    });
    P.personnages.forEach(function (p, i) {
      if (!objet(p)) return;
      var ou = "personnage " + (p.id || "#" + i);
      if (typeof p.id !== "string" || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(p.id)) E("[10] " + ou + " : identifiant mal formé");
      else if (ids[p.id]) E("[10] identifiant de personnage en double : " + p.id);
      ids[p.id] = true;
      if (typeof p.nom !== "string" || !p.nom.trim()) E("[10] " + ou + " : nom manquant");
      if (CAMPS_PERSONNAGES.indexOf(p.camp) < 0) E("[10] " + ou + " : camp inconnu " + p.camp + " (" + CAMPS_PERSONNAGES.join(", ") + ")");
      if (typeof p.seuil !== "number" || p.seuil < 0 || Math.floor(p.seuil) !== p.seuil) E("[10] " + ou + " : seuil (provinces prises, entier ≥ 0) manquant");
      if (p.dates !== undefined && p.dates !== null && !(typeof p.dates === "string" && /^\d{3,4}(-\d{3,4})?$/.test(p.dates))) E("[10] " + ou + " : dates mal écrites (« 481-511 » ou null)");
      if (p.titre !== undefined && p.titre !== null && !(typeof p.titre === "string" && p.titre.trim() && p.titre.length <= 60)) E("[10] " + ou + " : titre mal écrit (60 caractères au plus, ou null)");
      var faits = p.faits === undefined ? [] : p.faits;
      if (!Array.isArray(faits)) { E("[10] " + ou + " : faits doit être une liste"); faits = []; }
      if (p.cours === null || p.cours === undefined) {
        // sans cours : seulement un rival « titre seul », sans date, sans titre ni fait (rien d'un cours fermé)
        if (!p.titreSeul || p.camp === "joueur") E("[10] " + ou + " : un personnage sans cours n'est permis que pour un rival « titre seul »");
        if (p.dates || p.titre || faits.length) E("[10] " + ou + " : sans cours, ni titre, ni date, ni fait");
        if (p.source) E("[10] " + ou + " : source sans cours");
      } else {
        coursValide(p.cours, ou);
        sourceValide(p.source, ou);
      }
      if (p.titreSeul) {
        if (p.portrait) E("[10] " + ou + " : un rival « titre seul » n'a pas de visage (portrait: null, médaillon héraldique)");
        if (p.dates) E("[10] " + ou + " : un rival « titre seul » n'a pas de dates");
      }
      faits.forEach(function (f, k) {
        var o = ou + ", fait " + (k + 1);
        if (!objet(f)) { E("[10] " + o + " illisible"); return; }
        texteCourt(f.texte, o, 35);
        if (f.cours !== undefined) { coursValide(f.cours, o); sourceValide(f.source, o); }
        else if (f.source !== undefined) sourceValide(f.source, o);
      });
      if (p.portrait !== undefined && p.portrait !== null) {
        var r = p.portrait;
        if (!objet(r)) E("[10] " + ou + " : portrait illisible");
        else {
          if (typeof r.fichier !== "string" || !/^assets\/images\/personnages\/[a-z0-9-]+\.(jpe?g|png)$/.test(r.fichier)) E("[10] " + ou + " : portrait.fichier attendu dans assets/images/personnages/ (jpg ou png)");
          ["oeuvre", "artiste", "date", "institution", "licence", "url"].forEach(function (k) { if (typeof r[k] !== "string" || !r[k].trim()) E("[10] " + ou + " : portrait." + k + " manquant (crédit complet)"); });
          if (typeof r.licence === "string" && !/domaine public|CC0|CC BY/i.test(r.licence)) E("[10] " + ou + " : licence du portrait refusée (domaine public, CC0 ou CC BY)");
          if (typeof r.url === "string" && !/^https:\/\//.test(r.url)) E("[10] " + ou + " : portrait.url doit commencer par https://");
        }
      } else if (p.camp === "joueur") A("[10] " + ou + " : pas de portrait (médaillon héraldique)");
      if (p.repliques !== undefined) {
        if (!objet(p.repliques)) E("[10] " + ou + " : repliques illisibles");
        else Object.keys(p.repliques).forEach(function (k) {
          if (["presentation", "changement"].indexOf(k) < 0) E("[10] " + ou + " : situation inconnue " + k + " (presentation, changement)");
          (Array.isArray(p.repliques[k]) ? p.repliques[k] : []).forEach(function (t, j) { replique(t, ou + ", " + k + " " + (j + 1), ["{nom}", "{souverain}"], [p.nom]); });
        });
      }
      if (p.camp === "joueur" && !(objet(p.repliques) && Array.isArray(p.repliques.presentation) && p.repliques.presentation.length)) A("[10] " + ou + " : pas de réplique de présentation");
    });
    // humeurs et répliques des rivaux, par camp
    CAMPS_RIVAUX.forEach(function (camp) {
      var h = objet(P.humeurs) ? P.humeurs[camp] : null;
      NIVEAUX_RIVALITE.forEach(function (n) {
        if (!h || typeof h[n] !== "string") E("[10] humeur manquante : " + camp + "." + n);
        else replique(h[n], "humeur " + camp + "." + n, ["{nom}"], []);
      });
      var R = objet(P.repliques) ? P.repliques[camp] : null;
      SITUATIONS_RIVAL.forEach(function (sit) {
        var l = R && Array.isArray(R[sit]) ? R[sit] : [];
        var ou = "répliques " + camp + "." + sit;
        if (l.length < 6) E("[10] " + ou + " : " + l.length + " au lieu de 6 au moins");
        NIVEAUX_RIVALITE.forEach(function (n) {
          var k = l.filter(function (x) { return objet(x) && (!x.niveau || x.niveau === n); }).length;
          if (l.length && k < 2) E("[10] " + ou + " : " + k + " réplique(s) pour la rivalité « " + n + " » (2 au moins, pour ne jamais redire la même)");
        });
        l.forEach(function (x, j) {
          if (!objet(x)) { E("[10] " + ou + " " + (j + 1) + " : { niveau, texte } attendu"); return; }
          if (x.niveau !== undefined && NIVEAUX_RIVALITE.indexOf(x.niveau) < 0) E("[10] " + ou + " " + (j + 1) + " : niveau inconnu " + x.niveau);
          replique(x.texte, ou + " " + (j + 1), sit === "province" ? ["{nom}", "{province}", "{souverain}"] : ["{nom}", "{souverain}"], []);
        });
      });
    });
    if (!Array.isArray(P.changement) || !P.changement.length) E("[10] changement : au moins une annonce de changement de souverain ({nom})");
    else P.changement.forEach(function (t, j) {
      replique(t, "changement " + (j + 1), ["{nom}"], []);
      if (String(t).indexOf("{nom}") < 0) E("[10] changement " + (j + 1) + " : {nom} manquant");
    });
  }

  var api = { controler: controler, phrases: phrases, mots: mots, sourceSuivi: sourceSuivi, estSourceTheme: estSourceTheme, siteConnu: siteConnu, hoteDe: hoteDe, BADGES: BADGES, RX: RX,
    controlerPersonnages: controlerPersonnages, SITUATIONS_RIVAL: SITUATIONS_RIVAL, NIVEAUX_RIVALITE: NIVEAUX_RIVALITE, MOTS_INTERDITS: MOTS_INTERDITS };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  racine.CONTROLES = api;
})(typeof window !== "undefined" ? window : globalThis);
