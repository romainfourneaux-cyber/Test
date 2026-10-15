// Rappels : une question ratée revient « un peu plus tard », où que l'on joue (préparation d'une bataille, conseil du
// royaume, événement du jour). Seconde chance, jamais une pénalité : rien n'est retiré, aucun chrono.
//
// Règle : quand l'élève se trompe, la même question (même identifiant) revient après config.rappelApres autres
// questions (3 par défaut). Juste au rappel, elle sort de la file ; encore fausse, elle repart pour un tour. Un rappel
// passe outre les exclusions du tirage (une question par fiche, jamais deux fois la même question dans une bataille),
// mais ne vient jamais deux fois de suite. Douze rappels au plus en attente (le plus ancien tombe). Un rappel dont la
// question n'existe plus (fichier de cours retiré) disparaît sans bruit. La file est sauvegardée : si la séance
// s'arrête avant, les rappels en attente passent en tête à la séance suivante.
//
// État dans la sauvegarde (schéma 4) : etat.rappels = { compteur, file: [{ id, cours, du }], derniere }
//  - compteur : nombre de réponses données depuis le début, toutes parties confondues ;
//  - du : valeur du compteur à partir de laquelle la question est due (compteur après l'erreur + rappelApres) ;
//  - derniere : identifiant de la dernière question répondue (absent au début) ; gardé d'une séance à l'autre, pour
//    qu'une question ratée juste avant de fermer le jeu ne soit pas la toute première à sa réouverture.
// Points d'accroche, et seulement ceux-là :
//  - JEU.questions.enregistrerReponse appelle noter(q, juste) après chaque réponse ;
//  - JEU.recit.suite (tout tirage de questions : bataille, conseil, événement) passe son lot par placer() ;
//  - pendant une partie, après une erreur, la boucle de jeu passe les questions qui restent à poser par replacer().
(function (racine) {
  "use strict";
  var JEU = racine.JEU;
  var MAX = 12;
  var ETIQUETTE = "Seconde chance";

  function apres() {
    var n = JEU.donnees.config && JEU.donnees.config.rappelApres;
    return typeof n === "number" && n >= 1 ? Math.floor(n) : 3;
  }

  function vide() { return { compteur: 0, file: [] }; }

  function bienForme(e) { return !!e && typeof e.id === "string" && typeof e.du === "number" && isFinite(e.du); }

  // Répare une file abîmée ou absente sans rien perdre de ce qui est lisible.
  function completer(r) {
    if (!r || typeof r !== "object" || Array.isArray(r)) return vide();
    if (typeof r.compteur !== "number" || !isFinite(r.compteur) || r.compteur < 0) r.compteur = 0;
    if ("derniere" in r && typeof r.derniere !== "string") delete r.derniere;
    if (!Array.isArray(r.file)) r.file = [];
    else if (!r.file.every(bienForme)) r.file = r.file.filter(bienForme);
    if (r.file.length > MAX) r.file.splice(0, r.file.length - MAX);
    return r;
  }

  function etatRappels(etat) {
    etat = etat || (JEU.sauvegarde && JEU.sauvegarde.etat());
    if (!etat) return vide();
    etat.rappels = completer(etat.rappels);
    return etat.rappels;
  }

  function position(r, id) {
    for (var i = 0; i < r.file.length; i++) if (r.file[i].id === id) return i;
    return -1;
  }

  // Après chaque réponse : le compteur avance ; une erreur (re)programme la question, une bonne réponse la retire.
  function noter(q, juste, etat) {
    var r = etatRappels(etat);
    r.compteur++;
    r.derniere = q.id; // un rappel ne suit jamais tout de suite la question qu'on vient de répondre
    var i = position(r, q.id);
    if (i >= 0) r.file.splice(i, 1);
    if (juste) return null;
    var e = { id: q.id, cours: q.cours, du: r.compteur + apres() };
    r.file.push(e);
    if (r.file.length > MAX) r.file.splice(0, r.file.length - MAX); // le plus ancien tombe
    return e;
  }

  // Nouvelle séance (le jeu vient d'être ouvert) : les rappels encore en attente sont dus tout de suite (celui de la
  // dernière question répondue, s'il y en a un, vient en second : jamais deux fois de suite, même d'une séance à l'autre).
  function ouvrirSession(etat) {
    var r = etatRappels(etat);
    r.file.forEach(function (e) { if (e.du > r.compteur) e.du = r.compteur; });
  }

  // Question préparée d'un rappel, ou null si elle n'existe plus.
  function question(e) {
    var liste = e.cours ? JEU.questions.questionsDuCours(e.cours) : [];
    for (var i = 0; i < liste.length; i++) if (liste[i].id === e.id) return liste[i];
    return null;
  }

  // Copie marquée de la question (l'énoncé ne change pas) : le récit la présente comme une seconde chance.
  function copie(q) {
    var c = {};
    for (var k in q) if (Object.prototype.hasOwnProperty.call(q, k)) c[k] = q[k];
    c.rappel = true;
    return c;
  }

  function enAttente() { return etatRappels().file.map(function (e) { return e.id; }); }

  // Place les rappels dus dans « liste » (les questions qui restent à poser, dans l'ordre) et renvoie la nouvelle liste.
  // Un rappel dû après k autres réponses va à la position k (0 s'il est déjà dû), ou juste après si la question
  // d'avant est la même ; il prend la place d'une question ordinaire, qui sort du lot (le lot garde sa taille).
  // options : types (le conseil ne pose que des vrai_faux : un autre rappel attend une bataille ou un événement),
  // longueur (taille voulue du lot, si le tirage en a donné moins). Les rappels déjà placés sont replacés.
  function placer(liste, options) {
    options = options || {};
    var r = etatRappels();
    var dejaPlaces = liste.some(function (q) { return q && q.rappel; });
    if (!r.file.length && !dejaPlaces) return liste;
    // un rappel dont la question n'existe plus disparaît sans bruit
    var dus = [];
    r.file = r.file.filter(function (e) {
      var q = question(e);
      if (!q) return false;
      var admis = (!options.types || options.types.indexOf(q.type) >= 0) && q.niveau <= 2;
      if (admis) dus.push({ e: e, q: q });
      return true;
    });
    var L = Math.max(liste.length, options.longueur || 0);
    dus.sort(function (a, b) { return a.e.du - b.e.du; });
    // questions qui vont revenir dans ce lot : leur exemplaire ordinaire en sort (pas deux fois la même dans le lot)
    var vontVenir = dus.filter(function (x) { return x.e.du - r.compteur < L; }).map(function (x) { return x.e.id; });
    var ordinaires = liste.filter(function (q) { return q && !q.rappel && vontVenir.indexOf(q.id) < 0; });
    var res = [], prec = r.derniere || null, iN = 0;
    for (var pos = 0; pos < L; pos++) {
      var k = -1;
      for (var j = 0; j < dus.length; j++) if (dus[j].e.du - r.compteur <= pos && dus[j].q.id !== prec) { k = j; break; }
      var q = null;
      if (k >= 0) { q = copie(dus[k].q); dus.splice(k, 1); }
      else if (iN < ordinaires.length) q = ordinaires[iN++];
      if (!q) break; // plus de question ordinaire : les rappels dus plus tard attendront le lot suivant
      res.push(q);
      prec = q.id;
    }
    return res;
  }

  // Replace les rappels dans liste[debut..fin[ (questions encore à poser dans la partie en cours), sur place.
  function replacer(liste, debut, fin, options) {
    fin = Math.min(fin == null ? liste.length : fin, liste.length);
    if (debut >= fin) return liste;
    var reste = placer(liste.slice(debut, fin), options);
    Array.prototype.splice.apply(liste, [debut, fin - debut].concat(reste));
    return liste;
  }

  JEU.rappels = {
    MAX: MAX, ETIQUETTE: ETIQUETTE, apres: apres, vide: vide, completer: completer, etat: etatRappels,
    noter: noter, ouvrirSession: ouvrirSession, enAttente: enAttente, placer: placer, replacer: replacer,
    derniere: function () { return etatRappels().derniere || null; }
  };
})(typeof window !== "undefined" ? window : globalThis);
