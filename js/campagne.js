// Campagne du royaume de France au Moyen Âge, sur deux fronts : à l'ouest le royaume d'Angleterre (le cours cite
// Bouvines), au sud l'Empire omeyyade d'Al-Andalus (le cours cite les Empires omeyyade et abbasside).
// Provinces à conquérir, attaques adverses, arsenal (gestion de l'armée), jauges du royaume (nourries par le conseil),
// événements du jour. Rien de ce qui est gagné ne se perd : une défense ratée ne coûte ni bâtiment, ni province, ni ressource.
// Les camps sont des puissances politiques, au ton neutre du cours : ni symbole religieux, ni caricature.
(function (racine) {
  "use strict";
  var JEU = racine.JEU;
  var U = JEU.util;

  var CAMPS = {
    joueur: { nom: "le royaume de France", court: "France", couleurs: ["#24407a", "#e2c272"], embleme: "lys" },
    angleterre: { nom: "le royaume d'Angleterre", court: "Angleterre", couleurs: ["#9b1f1f", "#e2c272"], embleme: "lion",
      armee: "l'armée anglaise", troupes: "les troupes anglaises", soldats: "les soldats anglais", chateau: "le château anglais", tours: "les tours anglaises", peuple: "les Anglais" },
    omeyyades: { nom: "l'Empire omeyyade", court: "Empire omeyyade", couleurs: ["#e9e1cc", "#2f6b52"], embleme: "tour",
      armee: "l'armée omeyyade", troupes: "les troupes omeyyades", soldats: "les soldats omeyyades", chateau: "la forteresse omeyyade", tours: "les tours omeyyades", peuple: "les Omeyyades" }
  };
  function maj1(t) { return t.charAt(0).toUpperCase() + t.slice(1); }

  // Un nom précédé de « de » ou de « à », avec l'article contracté ou élidé comme en français :
  // « Le Gué » → du Gué, au Gué ; « La Tour du Col » → de la Tour du Col, à la Tour du Col ;
  // « Les Oliveraies » → des Oliveraies, aux Oliveraies ; « l'Empire omeyyade » → de l'Empire omeyyade, à l'Empire omeyyade.
  // Une autre préposition (« par », « contre »…) garde l'article, mis en minuscule : « par le royaume d'Angleterre ».
  function avecArticle(nom, preposition) {
    var prep = preposition === "a" ? "à" : (preposition || "de");
    var m = /^(les|le|la) (.+)$/i.exec(nom);
    if (m) {
      var art = m[1].toLowerCase(), reste = m[2];
      if (art === "le" && prep === "de") return "du " + reste;
      if (art === "le" && prep === "à") return "au " + reste;
      if (art === "les" && prep === "de") return "des " + reste;
      if (art === "les" && prep === "à") return "aux " + reste;
      return prep + " " + art + " " + reste;
    }
    m = /^l(['’])(.+)$/i.exec(nom);
    if (m) return prep + " l" + m[1] + m[2];
    if (prep === "de" && /^[aeiouyàâäéèêëîïôöùûüœæ]/i.test(nom)) return "d'" + nom;
    return prep + " " + nom;
  }

  // Deux fronts, chacun avec ses provinces dans l'ordre de la route. pv : solidité de la place forte adverse
  // (gardée d'une bataille à l'autre). carte : le tracé de la bataille (cartes-bataille.js).
  // il, est : pour accorder une phrase dont la province est le sujet (« Les Oliveraies sont à toi. Elles… »).
  var FRONTS = [
    { id: "angleterre", nom: "Front de l'ouest", camp: "angleterre", provinces: [
      { id: "gue", nom: "Le Gué", pv: 16, icone: "riviere", tribut: "routes", carte: "gue", il: "Il", est: "est" },
      { id: "foret", nom: "La Forêt de l'Ouest", pv: 20, icone: "foret", tribut: "remedes", carte: "foret", il: "Elle", est: "est" },
      { id: "moulin", nom: "Le Moulin du Val", pv: 24, icone: "moulin", tribut: "alambics", carte: "moulin", il: "Il", est: "est" },
      { id: "col", nom: "La Tour du Col", pv: 30, icone: "tour-de-guet", tribut: "sceaux", carte: "col", il: "Elle", est: "est" },
      { id: "chateau", nom: "La Forteresse anglaise", pv: 32, icone: "chateau", tribut: "parchemins", carte: "chateau", il: "Elle", est: "est" }
    ] },
    { id: "omeyyades", nom: "Front du sud", camp: "omeyyades", provinces: [
      { id: "piemont", nom: "Le Piémont", pv: 16, icone: "montagne", tribut: "sceaux", carte: "col", il: "Il", est: "est" },
      { id: "oliveraie", nom: "Les Oliveraies", pv: 20, icone: "recolte", tribut: "remedes", carte: "moulin", il: "Elles", est: "sont" },
      { id: "fleuve", nom: "Le Grand Fleuve", pv: 24, icone: "riviere", tribut: "routes", carte: "gue", il: "Il", est: "est" },
      { id: "citadelle", nom: "La Citadelle du Sud", pv: 30, icone: "tour", tribut: "alambics", carte: "foret", il: "Elle", est: "est" },
      { id: "forteresse", nom: "La Forteresse omeyyade", pv: 32, icone: "chateau", tribut: "parchemins", carte: "chateau", il: "Elle", est: "est" }
    ] }
  ];
  var PROVINCES = [];
  FRONTS.forEach(function (f) { f.provinces.forEach(function (p, i) { p.front = f.id; p.niveau = i; PROVINCES.push(p); }); });
  function province(id) { return PROVINCES.filter(function (p) { return p.id === id; })[0] || null; }
  function front(id) { return FRONTS.filter(function (f) { return f.id === id; })[0] || null; }
  function campDe(frontId) { var f = front(frontId); return CAMPS[f ? f.camp : "angleterre"]; }

  // Arsenal : ce que tu débloques et améliores avec tes ressources (prises dans tes réserves les plus fournies).
  var ARSENAL = [
    { genre: "tours", type: "archers", debut: 1, prix: [0, 0, 10, 18] },
    { genre: "tours", type: "piquiers", debut: 1, prix: [0, 0, 10, 18] },
    { genre: "tours", type: "baliste", debut: 0, prix: [0, 10, 14, 22] },
    { genre: "tours", type: "catapulte", debut: 0, prix: [0, 16, 18, 26] },
    { genre: "troupes", type: "fantassins", debut: 1, prix: [0, 0, 8, 16] },
    { genre: "troupes", type: "cavaliers", debut: 0, prix: [0, 8, 12, 20] },
    { genre: "troupes", type: "belier", debut: 0, prix: [0, 14, 16, 24] }
  ];
  var PRIX_REMPARTS = [8, 14, 22];
  var NIVEAU_MAX = 3;

  // Jauges du royaume : elles ne font que monter ; chaque point renforce tes batailles (plafond 12 points utiles).
  var JAUGES = {
    tresor: { nom: "Trésor", icone: "tresor", effet: function (n) { return "+" + 5 * Math.min(n, 12) + " or au début des batailles"; } },
    peuple: { nom: "Peuple", icone: "peuple", effet: function (n) { return "+" + Math.floor(Math.min(n, 12) / 2) + " solidité de ton château"; } },
    garde: { nom: "Garde", icone: "defense", effet: function (n) { return "+" + Math.round(2.5 * Math.min(n, 12)) + " % de dégâts pour tes tours"; } },
    savoir: { nom: "Savoir", icone: "savoir", effet: function (n) { return "+" + Math.floor(Math.min(n, 12) / 3) + " or par bonne réponse"; } }
  };

  function etatVide() {
    var prov = {};
    PROVINCES.forEach(function (p) { prov[p.id] = { pv: p.pv }; });
    var tours = {}, troupes = {};
    ARSENAL.forEach(function (a) { (a.genre === "tours" ? tours : troupes)[a.type] = a.debut; });
    return {
      provinces: prov, conquises: [],
      rival: { menace: 0, attaque: false, defaites: 0 }, // attaque : false ou l'identifiant du front qui attaque
      arsenal: { tours: tours, troupes: troupes, remparts: 0 },
      royaume: { tresor: 0, peuple: 0, garde: 0, savoir: 0, conseils: 0 },
      dernierJour: null, evenement: null, bonus: {}, chronique: []
    };
  }

  // Complète ou répare une campagne (sauvegarde plus ancienne ou abîmée) sans toucher à ce qui est valable :
  // une valeur absente, nulle ou du mauvais genre (objet, tableau, nombre) reprend sa valeur neuve.
  function completer(c) {
    var v = etatVide();
    if (!c || typeof c !== "object" || Array.isArray(c)) return v;
    function nombre(x) { return typeof x === "number" && isFinite(x); }
    function objet(x) { return !!x && typeof x === "object" && !Array.isArray(x); }
    Object.keys(v).forEach(function (k) {
      if (c[k] === undefined) c[k] = v[k];
      else if (v[k] !== null && (c[k] === null || typeof c[k] !== typeof v[k] || Array.isArray(c[k]) !== Array.isArray(v[k]))) c[k] = v[k];
    });
    if (c.dernierJour !== null && typeof c.dernierJour !== "string") c.dernierJour = null;
    if (c.evenement !== null && !objet(c.evenement)) c.evenement = null;
    PROVINCES.forEach(function (p) {
      if (!objet(c.provinces[p.id])) c.provinces[p.id] = { pv: p.pv };
      else if (!nombre(c.provinces[p.id].pv)) c.provinces[p.id].pv = p.pv;
    });
    ["tours", "troupes"].forEach(function (g) {
      if (!objet(c.arsenal[g])) c.arsenal[g] = {};
      Object.keys(v.arsenal[g]).forEach(function (t) { if (!nombre(c.arsenal[g][t])) c.arsenal[g][t] = v.arsenal[g][t]; });
    });
    if (!nombre(c.arsenal.remparts)) c.arsenal.remparts = 0;
    Object.keys(v.royaume).forEach(function (k) { if (!nombre(c.royaume[k])) c.royaume[k] = 0; });
    ["menace", "defaites"].forEach(function (k) { if (!nombre(c.rival[k])) c.rival[k] = 0; });
    if (c.rival.attaque === true) c.rival.attaque = "angleterre";
    if (typeof c.rival.attaque !== "string" || !front(c.rival.attaque)) c.rival.attaque = false;
    if (c.bonus.or !== undefined && !nombre(c.bonus.or)) delete c.bonus.or;
    if (c.chronique.some(function (x) { return !x || typeof x.texte !== "string"; })) c.chronique = c.chronique.filter(function (x) { return x && typeof x.texte === "string"; });
    return c;
  }

  function etat() {
    var e = JEU.sauvegarde.etat();
    e.campagne = completer(e.campagne);
    return e.campagne;
  }

  function noter(texte) {
    var c = etat();
    c.chronique.unshift({ le: U.jour(), texte: texte });
    if (c.chronique.length > 20) c.chronique.length = 20;
  }

  // Prochaine province à prendre sur un front (ou sur le premier front qui en a encore).
  function prochaineProvince(frontId) {
    var c = etat();
    var fs = frontId ? [front(frontId)] : FRONTS;
    for (var k = 0; k < fs.length; k++) {
      var ps = fs[k].provinces;
      for (var i = 0; i < ps.length; i++) if (c.conquises.indexOf(ps[i].id) < 0) return { province: ps[i], niveau: i, front: fs[k] };
    }
    return null;
  }

  // ---------- coûts en ressources : pris dans les réserves les plus fournies ----------
  function totalRessources() {
    var r = JEU.sauvegarde.etat().ressources, t = 0;
    Object.keys(r).forEach(function (k) { t += r[k] || 0; });
    return t;
  }
  function payer(montant) {
    var r = JEU.sauvegarde.etat().ressources;
    if (totalRessources() < montant) return false;
    var reste = montant;
    while (reste > 0) {
      var k = Object.keys(r).sort(function (a, b) { return r[b] - r[a]; })[0];
      r[k]--; reste--;
    }
    return true;
  }

  function prixArsenal(a) {
    var n = etat().arsenal[a.genre][a.type] || 0;
    return n >= NIVEAU_MAX ? null : a.prix[n + 1];
  }
  function ameliorerArsenal(genre, type) {
    var a = ARSENAL.filter(function (x) { return x.genre === genre && x.type === type; })[0];
    var c = etat();
    var prix = a && prixArsenal(a);
    if (prix == null || !payer(prix)) return false;
    c.arsenal[genre][type] = (c.arsenal[genre][type] || 0) + 1;
    JEU.sauvegarde.enregistrer();
    return true;
  }
  function prixRemparts() { var n = etat().arsenal.remparts; return n >= PRIX_REMPARTS.length ? null : PRIX_REMPARTS[n]; }
  function renforcerRemparts() {
    var p = prixRemparts();
    if (p == null || !payer(p)) return false;
    etat().arsenal.remparts++;
    JEU.sauvegarde.enregistrer();
    return true;
  }

  // ---------- bonus des jauges pour une bataille ----------
  function options(niveau) {
    var c = etat(), r = c.royaume;
    var o = {
      niveau: niveau,
      orDepart: 60 + 5 * Math.min(r.tresor, 12) + (c.bonus.or || 0),
      pvChateau: 20 + Math.floor(Math.min(r.peuple, 12) / 2) + 4 * c.arsenal.remparts,
      bonusDegats: 0.025 * Math.min(r.garde, 12),
      orParReponse: 12 + Math.floor(Math.min(r.savoir, 12) / 3),
      arsenal: { tours: c.arsenal.tours, troupes: c.arsenal.troupes },
      espion: !!c.bonus.espion
    };
    return o;
  }

  // ---------- un nouveau jour : tributs, menace du rival, événement ----------
  var EVENEMENTS = [
    { id: "marchands", titre: "Des marchands à la porte", icone: "marchand", texte: "Une caravane demande à vendre au marché du domaine. Chaque bonne réponse rapporte 2 ressources.", questions: 3 },
    { id: "defi", titre: "Le défi du champion", icone: "defi", texte: "Le camp adverse lance un défi : ton champion contre le sien. Deux bonnes réponses sur trois, et son château vacille.", questions: 3 },
    { id: "mercenaires", titre: "Des mercenaires", icone: "mercenaires", texte: "Une compagnie de mercenaires propose ses services. Une bonne réponse sur deux, et ta prochaine bataille commence avec 40 or de plus.", questions: 2 },
    { id: "incendie", titre: "Le feu au grenier", icone: "incendie", texte: "Le feu prend dans un grenier. Chaque bonne réponse organise la chaîne des seaux et fait grandir la jauge du peuple.", questions: 2 },
    { id: "espion", titre: "Un espion démasqué", icone: "espion", texte: "La garde a pris un espion du camp adverse. Une bonne réponse sur deux, et il avoue : la première vague adverse de ta prochaine bataille sera plus faible.", questions: 2 }
  ];

  function nouveauJour(maintenant) {
    var c = etat();
    var j = U.jour(maintenant);
    if (c.dernierJour === j) return null;
    var ecart = c.dernierJour ? Math.round((U.lireDate(j) - U.lireDate(c.dernierJour)) / 86400000) : 0;
    var premier = !c.dernierJour;
    c.dernierJour = j;
    var res = { tributs: {}, attaque: false, evenement: null };
    // tributs des provinces conquises
    c.conquises.forEach(function (id) {
      var p = province(id);
      if (!p) return;
      JEU.sauvegarde.etat().ressources[p.tribut] += 2;
      res.tributs[p.tribut] = (res.tributs[p.tribut] || 0) + 2;
    });
    // le rival reprend des forces
    if (!premier) {
      c.rival.menace += Math.min(3, Math.max(1, ecart));
      if (c.rival.menace >= 2 && !c.rival.attaque) {
        c.rival.attaque = U.hasard(FRONTS).id; c.rival.menace = 0; res.attaque = c.rival.attaque;
        noter(maj1(campDe(c.rival.attaque).armee) + " marche sur ton domaine.");
      }
    }
    // un événement par jour, souvent
    if (premier || Math.random() < 0.75) {
      var ev = U.hasard(EVENEMENTS);
      c.evenement = { id: ev.id, jour: j, fait: false };
      res.evenement = ev;
    } else c.evenement = null;
    JEU.sauvegarde.enregistrer();
    return res;
  }

  function evenementDuJour() {
    var c = etat();
    if (!c.evenement || c.evenement.fait || c.evenement.jour !== U.jour()) return null;
    return EVENEMENTS.filter(function (e) { return e.id === c.evenement.id; })[0] || null;
  }

  // ---------- issue d'une bataille ----------
  // bilan : { lieu, front, issue, degatsRival, bonnes, total, entamee }
  // entamee : false quand l'élève quitte avant la première vague. Rien ne change alors, et les bonus gagnés
  // aux événements (mercenaires, espion) restent pour la prochaine bataille.
  function apresBataille(bilan) {
    if (bilan.entamee === false) return {};
    var c = etat(), r = JEU.sauvegarde.etat().ressources;
    var gains = {};
    function gagner(res, n) { r[res] += n; gains[res] = (gains[res] || 0) + n; }
    c.bonus = {}; // les bonus des événements ont servi pendant cette bataille
    if (bilan.lieu === "domaine") {
      var adv = campDe(bilan.front || c.rival.attaque);
      if (bilan.issue !== "retraite") {
        c.rival.attaque = false; c.rival.defaites++;
        gagner("sceaux", 4); gagner("routes", 2);
        noter("Tu as repoussé l'attaque " + avecArticle(adv.armee, "de") + ".");
      } else noter(maj1(adv.armee) + " campe toujours devant tes murs.");
    } else {
      var prov = c.provinces[bilan.lieu];
      var def = province(bilan.lieu);
      prov.pv = Math.max(0, prov.pv - bilan.degatsRival);
      if (bilan.issue === "victoire" || prov.pv <= 0) {
        prov.pv = 0;
        if (c.conquises.indexOf(bilan.lieu) < 0) c.conquises.push(bilan.lieu);
        gagner(def.tribut, 8);
        c.rival.menace++;
        noter("Tu as pris " + def.nom + " " + avecArticle(campDe(def.front).nom, "à") + ".");
        bilan.conquise = true;
      } else if (bilan.degatsRival > 0) {
        noter("Ton armée a porté " + bilan.degatsRival + (bilan.degatsRival > 1 ? " coups" : " coup") + " à la place forte " + avecArticle(def.nom, "de") + ".");
      }
      if (bilan.issue !== "retraite") gagner(def.tribut, 2);
    }
    JEU.sauvegarde.enregistrer();
    return gains;
  }

  // ---------- événement du jour : une petite suite de questions, dans le récit ----------
  function jouerEvenement() {
    var ev = evenementDuJour();
    if (!ev) return;
    var el = JEU.ui.el;
    var qs = JEU.recit.suite(ev.questions);
    if (!qs.length) { JEU.ui.toast("Pas encore de questions disponibles."); return; }
    var zone = JEU.ui.commencerPartie(ev.titre, function () { JEU.ui.afficher("jouer"); });
    var i = 0, bonnes = 0, texteFin = null;
    var scene = el("div", { class: "scene-evenement" });
    zone.appendChild(el("div", { class: "evenement-tete" }, [el("span", { class: "evenement-icone", html: JEU.icones.icone(ev.icone, 64) }), el("p", { texte: ev.texte })]));
    zone.appendChild(scene);
    function suivante() {
      if (i >= qs.length) return fin();
      var q = qs[i];
      JEU.ui.poserQuestion(q, scene, function (juste) {
        JEU.questions.enregistrerReponse(q, juste);
        JEU.ui.noterDerniere(q);
        i++;
        if (juste) {
          bonnes++;
          if (ev.id === "marchands") { var res = JEU.MATIERES[q.matiere].ressource; JEU.sauvegarde.etat().ressources[res] += 2; }
          if (ev.id === "incendie") etat().royaume.peuple++;
          JEU.sons.jouer("coup"); JEU.ui.majRessources(); JEU.mesure.reponseDonnee(); suivante();
        } else JEU.ui.panneauErreur(q, scene, function () { JEU.mesure.reponseDonnee(); suivante(); });
      }, { recit: JEU.recit.cadre(q, "evenement") });
    }
    // Quitter en route clôt l'événement avec les réponses déjà données : ce qui est gagné reste, mais on ne peut
    // pas le rejouer pour gagner encore. Quitté avant la première réponse, il reste à jouer.
    JEU.partie.surQuitter = function () { if (i > 0) cloturer(); };
    // Applique l'issue de l'événement (une seule fois) et renvoie la phrase du bilan.
    function cloturer() {
      if (texteFin !== null) return texteFin;
      var c = etat(), texte;
      if (c.evenement) c.evenement.fait = true;
      if (ev.id === "marchands") texte = bonnes ? "Le marché a été bon : " + 2 * bonnes + " ressources de plus." : "Les marchands repartent sans rien vendre. Rien n'est perdu.";
      else if (ev.id === "defi") {
        var cible = prochaineProvince(U.hasard(FRONTS).id) || prochaineProvince();
        if (bonnes >= 2 && cible) {
          var pr = c.provinces[cible.province.id], avant = pr.pv;
          var place = "La place forte " + avecArticle(cible.province.nom, "de");
          pr.pv = Math.max(1, avant - 3); // le duel affaiblit la place forte, seule une bataille la prend
          var perte = avant - pr.pv;
          texte = "Ton champion l'emporte ! " + place + (perte ? " perd " + perte + (perte > 1 ? " points" : " point") + " de solidité." : " est déjà à bout : ton armée n'a plus qu'à la prendre.");
          noter("Ton champion a vaincu celui du camp adverse.");
        } else texte = bonnes >= 2 ? "Ton champion l'emporte !" : "Le duel reste indécis. Le camp adverse ne gagne rien.";
      } else if (ev.id === "mercenaires") { if (bonnes) { c.bonus.or = 40; texte = "Les mercenaires rejoignent ton armée : +40 or au début de la prochaine bataille."; } else texte = "Les mercenaires passent leur chemin."; }
      else if (ev.id === "incendie") texte = bonnes ? "Le feu est éteint, et le peuple te remercie (+" + bonnes + " Peuple)." : "Les villageois éteignent le feu eux-mêmes. Rien n'est perdu.";
      else if (ev.id === "espion") { if (bonnes) { c.bonus.espion = true; texte = "L'espion avoue tout : la première vague adverse sera plus faible."; } else texte = "L'espion se tait. Tant pis, rien n'est perdu."; }
      JEU.sauvegarde.enregistrer();
      JEU.ui.majRessources();
      texteFin = texte || "";
      return texteFin;
    }
    function fin() {
      var texte = cloturer();
      scene.innerHTML = "";
      scene.appendChild(el("div", { class: "bilan" + (bonnes ? " reussi" : "") }, [
        el("h2", { texte: ev.titre }), el("p", { class: "grand", texte: bonnes + " / " + qs.length }), el("p", { texte: texte }),
        el("button", { class: "bouton principal", onclick: function () { JEU.ui.finirPartie(); JEU.ui.afficher("jouer"); }, texte: "Retour à la campagne (Entrée)" })
      ]));
      JEU.ui.clavier = function (k) { if (k === "Enter") { JEU.ui.finirPartie(); JEU.ui.afficher("jouer"); return true; } return false; };
    }
    suivante();
  }

  JEU.campagne = {
    CAMPS: CAMPS, FRONTS: FRONTS, PROVINCES: PROVINCES, province: province, front: front, campDe: campDe, maj1: maj1, ARSENAL: ARSENAL, JAUGES: JAUGES, EVENEMENTS: EVENEMENTS, NIVEAU_MAX: NIVEAU_MAX,
    avecArticle: avecArticle, etatVide: etatVide, completer: completer, etat: etat, noter: noter, prochaineProvince: prochaineProvince,
    totalRessources: totalRessources, payer: payer, prixArsenal: prixArsenal, ameliorerArsenal: ameliorerArsenal,
    prixRemparts: prixRemparts, renforcerRemparts: renforcerRemparts, options: options,
    nouveauJour: nouveauJour, evenementDuJour: evenementDuJour, apresBataille: apresBataille, jouerEvenement: jouerEvenement
  };
})(typeof window !== "undefined" ? window : globalThis);
