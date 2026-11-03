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

  // ---------- tirage d'une partie libre, équilibré entre les familles de matières ----------
  // Chaque famille de matières qui a des questions (histoire, géographie, SVT, physique-chimie, français, anglais) a la
  // même part ; une famille qui a des notions à revoir pèse BOOST (1,5) au lieu de 1, jamais plus. Dans une famille,
  // les matières (pour le français : littérature, lecture suivie, grammaire) se partagent sa part de la même façon.
  // Dans une matière, les priorités de toujours : 50 % à revoir (fiche de a-retravailler.js, cours « à revoir » de
  // suivi.js, notion due ou ratée), 40 % de cours récents (les notions jamais vues d'abord), 10 % de notions solides ;
  // et une notion à revoir sort toujours au moins BOOST fois plus souvent qu'une autre de sa matière, en moyenne.
  // Les questions ratées qui reviennent (« Seconde chance ») ne passent pas par ici : rappels.js les place ensuite.
  var PARTS = [0.5, 0.4, 0.1]; // à revoir, récents, solides
  var BOOST = 1.5;
  var FENETRE = 20;            // questions passées regardées pour l'équilibre (historique)
  var OUBLI = 0.85;            // une question passée compte 0,85 fois moins à chaque question posée après elle

  // Classe d'une notion : 0 à revoir, 1 récente (ou jamais vue), 2 solide.
  function classe(n, aRetravailler, maintenant) {
    if (aRetravailler || aRevoir(n, maintenant) || (n && n.boite === 1 && n.ko > 0)) return 0;
    return solide(n) ? 2 : 1;
  }

  // Le groupe le plus en retard sur sa part, parmi groupes [{ nom, poids }], d'après les passées [{ famille, matiere }]
  // (cle : "famille" ou "matiere" ; la plus récente en dernier). Part d'un groupe = poids / somme des poids ;
  // retard = part × (passées + 1) − vues, chaque passée comptant OUBLI^âge (les plus anciennes pèsent moins : sur une
  // longue partie, chaque groupe reçoit exactement sa part). Égalité : au hasard. « eviter » n'est pris que s'il est seul.
  function enRetard(groupes, passees, cle, eviter) {
    var vus = {}, total = 0, n = 0, w = 1, i;
    for (i = 0; i < groupes.length; i++) { vus[groupes[i].nom] = 0; total += groupes[i].poids; }
    for (i = passees.length - 1; i >= 0; i--, w *= OUBLI) {
      var k = passees[i][cle];
      if (Object.prototype.hasOwnProperty.call(vus, k)) { vus[k] += w; n += w; }
    }
    var meilleurs = [], max = -Infinity;
    for (i = 0; i < groupes.length; i++) {
      var g = groupes[i];
      if (g.nom === eviter && groupes.length > 1) continue;
      var retard = g.poids / total * (n + 1) - vus[g.nom];
      if (retard > max + 1e-9) { max = retard; meilleurs = [g]; }
      else if (retard > max - 1e-9) meilleurs.push(g);
    }
    return meilleurs.length ? JEU.util.hasard(meilleurs) : groupes[0];
  }

  // Prend la prochaine notion d'une matière : à revoir, récente ou solide, au hasard selon PARTS (parmi les files non
  // vides). Quand les notions à revoir sont nombreuses dans la matière, leur part monte juste assez pour qu'une notion
  // à revoir sorte « boost » fois plus souvent qu'une autre notion de la matière, en moyenne (sinon, la moitié des
  // tirages pour les deux tiers des notions, elles sortiraient moins souvent que les autres).
  function prendre(m, boost) {
    var n = [m.files[0].length, m.files[1].length, m.files[2].length], q = [0, 0, 0], total = 0, i;
    for (i = 0; i < 3; i++) if (n[i]) total += PARTS[i];
    for (i = 0; i < 3; i++) q[i] = n[i] ? PARTS[i] / total : 0;
    var autres = n[1] + n[2];
    if (n[0] && autres) {
      var plancher = boost * n[0] / (boost * n[0] + autres);
      if (q[0] < plancher) { var r = (1 - plancher) / (1 - q[0]); q[0] = plancher; q[1] *= r; q[2] *= r; }
    }
    var x = Math.random(), dernier = -1;
    for (i = 0; i < 3; i++) {
      if (!n[i]) continue;
      dernier = i;
      x -= q[i];
      if (x < 0) break;
    }
    return m.files[dernier].shift();
  }

  // candidats : [{ fiche, cours, recent, famille?, matiere? }], recent = rang de récence du cours (0 = plus récent).
  // options : maintenant ; aRetravailler (identifiants des fiches à revoir) ; historique ([{ famille, matiere }] des
  // questions déjà posées, la plus récente en dernier) ; accepter (fonction(candidat) : faux si aucune question ne peut
  // sortir pour cette fiche, qui est alors écartée et remplacée) ; boost.
  // Renvoie au plus « nombre » candidats, dans l'ordre où poser les questions : la famille la plus en retard sur sa part
  // d'abord, jamais la même famille trois fois de suite (lots précédents compris) quand une autre a encore des notions.
  function tirer(candidats, etat, nombre, options) {
    options = options || {};
    var maintenant = options.maintenant || new Date();
    var boost = options.boost == null ? BOOST : options.boost;
    var aRetr = {};
    (options.aRetravailler || []).forEach(function (id) { aRetr[id] = true; });
    var familles = [], parNom = {};
    candidats.forEach(function (c) {
      var nf = c.famille || "", nm = c.matiere || nf;
      var F = parNom[nf];
      if (!F) { F = parNom[nf] = { nom: nf, poids: 1, reste: 0, matieres: [], parNom: {} }; familles.push(F); }
      var m = F.parNom[nm];
      if (!m) { m = F.parNom[nm] = { nom: nm, poids: 1, reste: 0, files: [[], [], []], neufs: [] }; F.matieres.push(m); }
      var n = etat.notions[c.fiche];
      var k = classe(n, aRetr[c.fiche], maintenant);
      if (k === 0) { m.poids = boost; F.poids = boost; }
      if (k === 1 && !n) m.neufs.push(c); else m.files[k].push(c);
      m.reste++; F.reste++;
    });
    var M = JEU.util.melanger;
    familles.forEach(function (F) {
      F.matieres.forEach(function (m) {
        m.files[0] = M(m.files[0]);
        // les notions jamais vues des cours récents passent en tête des « récents »
        m.files[1] = melangerParTranches(m.neufs.concat(m.files[1]).sort(function (a, b) { return (a.recent || 0) - (b.recent || 0); }));
        m.files[2] = M(m.files[2]);
      });
    });
    var passees = (options.historique || []).slice(-FENETRE);
    var choisis = [];
    while (choisis.length < nombre) {
      var ouvertes = familles.filter(function (F) { return F.reste > 0; });
      if (!ouvertes.length) break;
      var L = passees.length;
      var eviter = L >= 2 && passees[L - 1].famille === passees[L - 2].famille ? passees[L - 1].famille : null;
      var F = enRetard(ouvertes, passees, "famille", eviter);
      var dansF = passees.filter(function (p) { return p.famille === F.nom; });
      var m = enRetard(F.matieres.filter(function (x) { return x.reste > 0; }), dansF, "matiere", null);
      var c = prendre(m, boost);
      m.reste--; F.reste--;
      if (options.accepter && !options.accepter(c)) continue;
      choisis.push(c);
      passees.push({ famille: F.nom, matiere: m.nom });
      if (passees.length > FENETRE) passees.shift();
    }
    return choisis;
  }

  // Garde l'ordre de récence par tranches de 6, mais mélange à l'intérieur de chaque tranche.
  function melangerParTranches(t) {
    var r = [];
    for (var i = 0; i < t.length; i += 6) r = r.concat(JEU.util.melanger(t.slice(i, i + 6)));
    return r;
  }

  JEU.leitner = {
    noter: noter, echeance: echeance, aRevoir: aRevoir, solide: solide, tirer: tirer, jours: jours,
    BOOST: BOOST, FENETRE: FENETRE, PARTS: PARTS, OUBLI: OUBLI
  };
})(typeof window !== "undefined" ? window : globalThis);
