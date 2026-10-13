// Campagne contre le seigneur rival : provinces à conquérir, attaques du rival, arsenal (gestion de l'armée),
// jauges du royaume (nourries par le conseil), événements du jour. Rien de ce qui est gagné ne se perd :
// le rival peut attaquer, mais une défense ratée ne coûte ni bâtiment, ni province, ni ressource.
(function (racine) {
  "use strict";
  var JEU = racine.JEU;
  var U = JEU.util;

  // Provinces du rival, dans l'ordre de la route. pv : solidité de son château dans la province (gardée d'une bataille à l'autre).
  var PROVINCES = [
    { id: "gue", nom: "Le Gué", pv: 16, icone: "riviere", tribut: "routes" },
    { id: "foret", nom: "La Forêt de l'Ouest", pv: 20, icone: "foret", tribut: "remedes" },
    { id: "moulin", nom: "Le Moulin du Val", pv: 24, icone: "moulin", tribut: "alambics" },
    { id: "col", nom: "La Tour du Col", pv: 30, icone: "tour-de-guet", tribut: "sceaux" },
    { id: "chateau", nom: "Le Château du rival", pv: 32, icone: "chateau", tribut: "parchemins" }
  ];

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
      rival: { menace: 0, attaque: false, defaites: 0 },
      arsenal: { tours: tours, troupes: troupes, remparts: 0 },
      royaume: { tresor: 0, peuple: 0, garde: 0, savoir: 0, conseils: 0 },
      dernierJour: null, evenement: null, bonus: {}, chronique: []
    };
  }

  // Complète une campagne incomplète (sauvegarde plus ancienne ou abîmée), sans rien écraser.
  function completer(c) {
    var v = etatVide();
    if (!c || typeof c !== "object") return v;
    Object.keys(v).forEach(function (k) { if (c[k] == null || typeof c[k] !== typeof v[k]) c[k] = v[k]; });
    PROVINCES.forEach(function (p) { if (!c.provinces[p.id]) c.provinces[p.id] = { pv: p.pv }; });
    ["tours", "troupes"].forEach(function (g) { Object.keys(v.arsenal[g]).forEach(function (t) { if (typeof (c.arsenal[g] || (c.arsenal[g] = {}))[t] !== "number") c.arsenal[g][t] = v.arsenal[g][t]; }); });
    if (typeof c.arsenal.remparts !== "number") c.arsenal.remparts = 0;
    Object.keys(v.royaume).forEach(function (k) { if (typeof c.royaume[k] !== "number") c.royaume[k] = 0; });
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

  function prochaineProvince() {
    var c = etat();
    for (var i = 0; i < PROVINCES.length; i++) if (c.conquises.indexOf(PROVINCES[i].id) < 0) return { province: PROVINCES[i], niveau: i };
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
    { id: "defi", titre: "Le défi du champion", icone: "defi", texte: "Le seigneur rival lance un défi : ton champion contre le sien. Deux bonnes réponses sur trois, et son château vacille.", questions: 3 },
    { id: "mercenaires", titre: "Des mercenaires", icone: "mercenaires", texte: "Une compagnie de mercenaires propose ses services. Une bonne réponse sur deux, et ta prochaine bataille commence avec 40 or de plus.", questions: 2 },
    { id: "incendie", titre: "Le feu au grenier", icone: "incendie", texte: "Le feu prend dans un grenier. Chaque bonne réponse organise la chaîne des seaux et fait grandir la jauge du peuple.", questions: 2 },
    { id: "espion", titre: "Un espion démasqué", icone: "espion", texte: "La garde a pris un espion du rival. Une bonne réponse sur deux, et il avoue : la première vague rivale de ta prochaine bataille sera plus faible.", questions: 2 }
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
      var p = PROVINCES.filter(function (x) { return x.id === id; })[0];
      if (!p) return;
      JEU.sauvegarde.etat().ressources[p.tribut] += 2;
      res.tributs[p.tribut] = (res.tributs[p.tribut] || 0) + 2;
    });
    // le rival reprend des forces
    if (!premier) {
      c.rival.menace += Math.min(3, Math.max(1, ecart));
      if (c.rival.menace >= 2 && !c.rival.attaque) { c.rival.attaque = true; c.rival.menace = 0; res.attaque = true; noter("Le seigneur rival marche sur ton domaine."); }
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
  // bilan : { lieu, issue, degatsRival, bonnes, total }
  function apresBataille(bilan) {
    var c = etat(), r = JEU.sauvegarde.etat().ressources;
    var gains = {};
    function gagner(res, n) { r[res] += n; gains[res] = (gains[res] || 0) + n; }
    c.bonus = {};
    if (bilan.lieu === "domaine") {
      if (bilan.issue !== "retraite") {
        c.rival.attaque = false; c.rival.defaites++;
        gagner("sceaux", 4); gagner("routes", 2);
        noter("Tu as repoussé l'attaque du seigneur rival.");
      } else noter("Le seigneur rival campe toujours devant tes murs.");
    } else {
      var prov = c.provinces[bilan.lieu];
      var def = PROVINCES.filter(function (p) { return p.id === bilan.lieu; })[0];
      prov.pv = Math.max(0, prov.pv - bilan.degatsRival);
      if (bilan.issue === "victoire" || prov.pv <= 0) {
        prov.pv = 0;
        if (c.conquises.indexOf(bilan.lieu) < 0) c.conquises.push(bilan.lieu);
        gagner(def.tribut, 8);
        c.rival.menace++;
        noter("Tu as conquis " + def.nom + ".");
        bilan.conquise = true;
      } else if (bilan.degatsRival > 0) {
        noter("Ton armée a ébranlé " + def.nom + " (" + bilan.degatsRival + " coups au château).");
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
    var i = 0, bonnes = 0;
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
    function fin() {
      var c = etat(), texte;
      c.evenement.fait = true;
      if (ev.id === "marchands") texte = bonnes ? "Le marché a été bon : " + 2 * bonnes + " ressources de plus." : "Les marchands repartent sans rien vendre. Rien n'est perdu.";
      else if (ev.id === "defi") {
        var cible = prochaineProvince();
        if (bonnes >= 2 && cible) { c.provinces[cible.province.id].pv = Math.max(1, c.provinces[cible.province.id].pv - 3); texte = "Ton champion l'emporte ! Le château de " + cible.province.nom + " perd 3 points de solidité."; noter("Ton champion a vaincu celui du rival."); }
        else texte = bonnes >= 2 ? "Ton champion l'emporte !" : "Le duel reste indécis. Le rival ne gagne rien.";
      } else if (ev.id === "mercenaires") { if (bonnes) { c.bonus.or = 40; texte = "Les mercenaires rejoignent ton armée : +40 or au début de la prochaine bataille."; } else texte = "Les mercenaires passent leur chemin."; }
      else if (ev.id === "incendie") texte = bonnes ? "Le feu est éteint, et le peuple te remercie (+" + bonnes + " Peuple)." : "Les villageois éteignent le feu eux-mêmes. Rien n'est perdu.";
      else if (ev.id === "espion") { if (bonnes) { c.bonus.espion = true; texte = "L'espion avoue tout : la première vague rivale sera plus faible."; } else texte = "L'espion se tait. Tant pis, rien n'est perdu."; }
      JEU.sauvegarde.enregistrer();
      JEU.ui.majRessources();
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
    PROVINCES: PROVINCES, ARSENAL: ARSENAL, JAUGES: JAUGES, EVENEMENTS: EVENEMENTS, NIVEAU_MAX: NIVEAU_MAX,
    etatVide: etatVide, completer: completer, etat: etat, noter: noter, prochaineProvince: prochaineProvince,
    totalRessources: totalRessources, payer: payer, prixArsenal: prixArsenal, ameliorerArsenal: ameliorerArsenal,
    prixRemparts: prixRemparts, renforcerRemparts: renforcerRemparts, options: options,
    nouveauJour: nouveauJour, evenementDuJour: evenementDuJour, apresBataille: apresBataille, jouerEvenement: jouerEvenement
  };
})(typeof window !== "undefined" ? window : globalThis);
