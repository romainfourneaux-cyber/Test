// Écran de la campagne (menu « Campagne ») : carte des deux fronts (royaume d'Angleterre à l'ouest,
// Empire omeyyade au sud), alerte d'attaque, conseil du royaume, arsenal, événement du jour, jauges et chronique.
(function (racine) {
  "use strict";
  var JEU = racine.JEU;
  var U = JEU.util;

  var POSITIONS = {
    domaine: [95, 262],
    gue: [255, 125], foret: [415, 98], moulin: [575, 132], col: [720, 98], chateau: [868, 125],
    piemont: [255, 392], oliveraie: [415, 420], fleuve: [575, 386], citadelle: [720, 420], forteresse: [868, 392]
  };
  var L = 1000, H = 530;
  function camp(c) { return JEU.campagne.CAMPS[c]; }

  function route(ids) {
    var d = "M" + POSITIONS[ids[0]].join(" ");
    for (var i = 1; i < ids.length; i++) {
      var a = POSITIONS[ids[i - 1]], b = POSITIONS[ids[i]];
      d += " Q" + ((a[0] + b[0]) / 2) + " " + ((a[1] + b[1]) / 2 + (i % 2 ? 34 : -34)) + " " + b[0] + " " + b[1];
    }
    return "<path d='" + d + "' fill='none' stroke='#2e2419' stroke-width='9' stroke-linecap='round' opacity='.55'/>" +
      "<path d='" + d + "' fill='none' stroke='#e9d9b0' stroke-width='4' stroke-dasharray='2 12' stroke-linecap='round'/>";
  }

  function carteSVG(c) {
    var C = JEU.campagne, france = camp("joueur");
    var s = "<svg viewBox='0 0 " + L + " " + H + "' class='carte-svg' role='img' aria-label='Carte de la campagne : deux fronts'>" +
      "<defs><filter id='sepiaC'><feColorMatrix type='matrix' values='.45 .4 .15 0 .05  .38 .4 .14 0 .04  .25 .3 .12 0 .02  0 0 0 1 0'/></filter>" +
      "<radialGradient id='vigC' cx='.5' cy='.5' r='.7'><stop offset='.6' stop-color='#000' stop-opacity='0'/><stop offset='1' stop-color='#1c140c' stop-opacity='.6'/></radialGradient>" +
      "<filter id='ombreC'><feDropShadow dx='2' dy='4' stdDeviation='3' flood-color='#000' flood-opacity='.55'/></filter></defs>" +
      "<image href='assets/images/terrain-domaine.jpg' x='0' y='-65' width='1000' height='660' preserveAspectRatio='xMidYMid slice' filter='url(#sepiaC)'/>" +
      "<rect width='" + L + "' height='" + H + "' fill='url(#vigC)'/>";
    C.FRONTS.forEach(function (f) { s += route(["domaine"].concat(f.provinces.map(function (p) { return p.id; }))); });
    // titres des fronts
    C.FRONTS.forEach(function (f, i) {
      var adv = camp(f.camp);
      var y = i === 0 ? 28 : H - 14;
      s += "<g>" + JEU.icones.dans(adv.embleme, 556, y - 20, 24, adv.couleurs[0] === "#e9e1cc" ? "#2f6b52" : adv.couleurs[0]) +
        "<text x='548' y='" + y + "' class='titre-front' text-anchor='end'>" + U.echapper(f.nom) + " · " + U.echapper(C.maj1(adv.nom)) + "</text></g>";
    });
    var attaque = c.rival.attaque;
    s += noeud(POSITIONS.domaine, "lys", france.couleurs, "lys", "Ton domaine", attaque ? "attaqué par " + camp(C.front(attaque).camp).armee : "", "domaine", attaque ? "attaque" : "tien");
    C.FRONTS.forEach(function (f) {
      var cible = C.prochaineProvince(f.id), adv = camp(f.camp);
      f.provinces.forEach(function (p) {
        var conquise = c.conquises.indexOf(p.id) >= 0;
        var etat = conquise ? "tien" : cible && cible.province.id === p.id ? "cible" : "brume";
        var sous = conquise ? "prise" : etat === "cible" ? "place forte " + c.provinces[p.id].pv + " / " + p.pv : "";
        var coul = conquise ? france.couleurs : adv.couleurs;
        s += noeud(POSITIONS[p.id], p.icone, coul, conquise ? "lys" : adv.embleme, p.nom, sous, p.id, etat);
      });
    });
    return s + "</svg>";
  }

  function noeud(pos, icone, coul, embleme, nom, sous, id, etat) {
    var x = pos[0], y = pos[1];
    var s = "<g class='noeud " + etat + "' data-lieu='" + id + "' filter='url(#ombreC)' tabindex='" + (etat === "cible" || etat === "attaque" ? "0" : "-1") + "'>";
    if (etat === "cible" || etat === "attaque") s += "<circle class='halo' cx='" + x + "' cy='" + y + "' r='50' fill='none' stroke='" + (etat === "attaque" ? "#d0644a" : "#e2c272") + "' stroke-width='4'/>";
    s += "<circle cx='" + x + "' cy='" + y + "' r='40' fill='#b08d3a' stroke='#2e2419' stroke-width='3'/>" +
      "<circle cx='" + x + "' cy='" + y + "' r='33' fill='" + (etat === "brume" ? "#6f6658" : coul[0]) + "'/>" +
      JEU.icones.dans(icone, x - 23, y - 23, 46, etat === "brume" ? "#bfb39a" : coul[1]);
    // bannière plantée, avec l'emblème du camp qui tient le lieu
    if (etat !== "brume") s += "<g transform='translate(" + (x + 20) + "," + (y - 70) + ")'><path d='M0 0v38' stroke='#2e2419' stroke-width='3'/><path d='M2 2h26l-7 9 7 9H2z' fill='" + coul[0] + "' stroke='#2e2419' stroke-width='1.5'/>" + JEU.icones.dans(embleme, 5, 3, 15, coul[1]) + "</g>";
    s += "<text x='" + x + "' y='" + (y + 60) + "' class='nom-lieu'>" + U.echapper(nom) + "</text>";
    if (sous) s += "<text x='" + x + "' y='" + (y + 79) + "' class='sous-lieu'>" + U.echapper(sous) + "</text>";
    return s + "</g>";
  }

  JEU.ui.ecrans.jouer = function (s) {
    var el = JEU.ui.el;
    var C = JEU.campagne;
    var jour = C.nouveauJour();
    var c = C.etat();
    var etat = JEU.sauvegarde.etat();
    var ev = C.evenementDuJour();
    s.innerHTML = "";
    s.appendChild(el("h1", { class: "titre-ecran", texte: "La campagne" }));
    s.appendChild(el("p", { class: "sous-titre-campagne", html: JEU.icones.icone("lys", 22) + " Royaume de France <span>contre</span> royaume d'Angleterre <span>et</span> Empire omeyyade" }));

    if (jour) {
      var t = Object.keys(jour.tributs).map(function (r) { return "+" + jour.tributs[r] + " " + JEU.RESSOURCES[r].nom.toLowerCase(); });
      if (t.length) JEU.mentor.dire("Tes provinces t'ont versé leur tribut : " + t.join(", ") + ".", "joie", 5000);
      JEU.ui.majRessources();
    }

    var attaquant = c.rival.attaque ? camp(C.front(c.rival.attaque).camp) : null;
    if (attaquant) {
      s.appendChild(el("div", { class: "alerte-rival" }, [
        el("span", { class: "ar-banniere", html: JEU.icones.icone(attaquant.embleme, 52) }),
        el("div", {}, [el("h2", { texte: C.maj1(attaquant.armee) + " marche sur ton domaine !" }), el("p", { texte: "Ses troupes approchent par la route. Défends tes murs : tu ne perdras rien, quoi qu'il arrive." })]),
        el("button", { class: "bouton principal", onclick: function () { JEU.bataille.lancer("domaine"); }, html: "<span class='touche'>1</span> Défendre le domaine" })
      ]));
    }

    var carte = el("div", { class: "carte-campagne", html: carteSVG(c) });
    s.appendChild(carte);
    Array.prototype.forEach.call(carte.querySelectorAll(".noeud.cible, .noeud.attaque"), function (n) {
      function go() { JEU.bataille.lancer(n.getAttribute("data-lieu")); }
      n.addEventListener("click", go);
      n.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.stopPropagation(); go(); } });
    });

    var options = [];
    if (attaquant) options.push({ titre: "Défendre le domaine", texte: C.maj1(attaquant.nom) + " attaque. Pose tes tours sur la route de ton domaine.", icone: "rempart", action: function () { JEU.bataille.lancer("domaine"); } });
    C.FRONTS.forEach(function (f) {
      var cible = C.prochaineProvince(f.id), adv = camp(f.camp);
      if (cible) options.push({ titre: "Attaquer : " + cible.province.nom, texte: f.nom + ", contre " + adv.nom + ". Place forte : " + c.provinces[cible.province.id].pv + " / " + cible.province.pv + ". Les coups portés restent acquis.", icone: "assaut", action: function () { JEU.bataille.lancer(cible.province.id); } });
    });
    if (!C.prochaineProvince()) options.push({ titre: "Les deux fronts sont tenus", texte: "Toutes les provinces sont à toi. Défends ton domaine et tiens ton conseil.", icone: "couronne", action: function () { JEU.ui.toast("Toutes les provinces sont prises !"); } });
    options.push({ titre: "Conseil du royaume", texte: "Tes conseillers t'apportent leurs affaires. Juge juste et le royaume grandit.", icone: "conseil", action: function () { JEU.conseil.lancer(); } });
    options.push({ titre: "Arsenal", texte: "Débloque et améliore tes tours, tes troupes et tes remparts avec tes ressources.", icone: "caserne", action: ouvrirArsenal });
    if (ev) options.push({ titre: ev.titre, texte: ev.texte, icone: ev.icone, action: function () { JEU.campagne.jouerEvenement(); }, evenement: true });

    var grille = el("div", { class: "grille-jeux" });
    options.forEach(function (o, i) {
      grille.appendChild(el("button", { class: "carte-jeu" + (o.evenement ? " evenement" : ""), onclick: o.action }, [
        el("span", { class: "touche", texte: String(i + 1) }),
        el("span", { class: "illustration ill-" + o.icone }, [el("span", { class: "icone-jeu", html: JEU.icones.icone(o.icone, 44) })]),
        el("h2", { texte: o.titre }), el("p", { texte: o.texte })
      ]));
    });
    s.appendChild(grille);

    // royaume et rivalité
    var jz = el("div", { class: "jauges-royaume" });
    JEU.conseil.jauges(jz);
    var conquises = c.conquises.length;
    s.appendChild(el("div", { class: "bas-campagne" }, [
      el("div", { class: "cartouche" }, [el("h3", { html: JEU.icones.icone("royaume", 20) + " Ton royaume" }), jz,
        el("p", { class: "note", texte: Object.keys(C.JAUGES).map(function (k) { return C.JAUGES[k].effet(c.royaume[k]); }).join(" · ") })]),
      el("div", { class: "cartouche rival" }, [
        el("h3", { html: JEU.icones.icone("defi", 20) + " Les fronts" }),
        el("ul", { class: "liste-simple" }, C.FRONTS.map(function (f) {
          var pris = f.provinces.filter(function (p) { return c.conquises.indexOf(p.id) >= 0; }).length;
          return el("li", { texte: f.nom + " (" + camp(f.camp).nom + ") : " + pris + " province" + (pris > 1 ? "s" : "") + " prise" + (pris > 1 ? "s" : "") + " sur " + f.provinces.length });
        })),
        el("p", { texte: c.rival.defaites + " attaque" + (c.rival.defaites > 1 ? "s" : "") + " repoussée" + (c.rival.defaites > 1 ? "s" : "") + "." }),
        el("div", { class: "menace" }, [el("span", { texte: "Menace" }), el("span", { class: "jr-barre" }, [el("span", { style: "width:" + Math.min(100, c.rival.attaque ? 100 : c.rival.menace * 50) + "%" })])]),
        c.chronique.length ? el("ul", { class: "chronique" }, c.chronique.slice(0, 5).map(function (x) { return el("li", { texte: x.texte }); })) : el("p", { class: "note", texte: "La chronique des campagnes est encore vierge." })
      ])
    ]));

    JEU.ui.clavier = function (k) {
      var n = parseInt(k, 10);
      if (n >= 1 && n <= options.length) { options[n - 1].action(); return true; }
      return false;
    };
  };

  // ---------- arsenal : gestion de l'armée ----------
  var EFFETS = {
    archers: "Tir rapide, portée moyenne.", piquiers: "Ralentit et blesse tout ce qui passe.", baliste: "Gros dégâts, très longue portée.",
    catapulte: "Dégâts de zone sur les groupes.", fantassins: "Trois soldats par envoi, pas chers.", cavaliers: "Deux cavaliers rapides : ils rapportent le plus de revenu.", belier: "Lente et très solide : passe là où les autres tombent et frappe le château le plus fort."
  };

  function ouvrirArsenal() {
    var el = JEU.ui.el, C = JEU.campagne, M = JEU.batailleMoteur;
    var boite = el("div", { class: "arsenal" });
    function rendu() {
      var c = C.etat();
      // au clavier, après un achat, le focus reste sur la même ligne (ou passe à la suivante qu'on peut acheter)
      var rang = -1;
      Array.prototype.forEach.call(boite.querySelectorAll(".ligne-arsenal"), function (l, k) { if (l.contains(document.activeElement)) rang = k; });
      boite.innerHTML = "";
      boite.appendChild(el("p", { class: "note", texte: "Tes réserves : " + C.totalRessources() + " ressources. Le prix est pris dans tes réserves les plus fournies. Chaque niveau au-delà du premier ajoute 15 % de force." }));
      [["tours", "Tours", M.TOURS], ["troupes", "Troupes", M.TROUPES]].forEach(function (g) {
        boite.appendChild(el("h3", { texte: g[1] }));
        C.ARSENAL.filter(function (a) { return a.genre === g[0]; }).forEach(function (a) {
          var n = c.arsenal[a.genre][a.type] || 0, prix = C.prixArsenal(a), d = g[2][a.type];
          var etoiles = "";
          for (var k = 1; k <= C.NIVEAU_MAX; k++) etoiles += k <= n ? "◆" : "◇";
          boite.appendChild(el("div", { class: "ligne-arsenal" + (n ? "" : " verrouille") }, [
            el("span", { class: "td-ic", html: JEU.icones.icone(d.icone, 34) }),
            el("div", {}, [el("b", { texte: d.nom + " " }), el("span", { class: "etoiles", texte: etoiles }), el("p", { class: "note", texte: EFFETS[a.type] })]),
            prix == null ? el("span", { class: "etat", texte: "Au maximum" }) :
              el("button", { class: "bouton petit" + (n ? "" : " principal"), disabled: C.totalRessources() < prix, onclick: function () {
                if (C.ameliorerArsenal(a.genre, a.type)) { JEU.sons.jouer("construction"); JEU.ui.majRessources(); JEU.ui.toast(n ? "Amélioré !" : "Débloqué !"); rendu(); }
              }, texte: (n ? "Améliorer" : "Débloquer") + " · " + prix })
          ]));
        });
      });
      var pr = C.prixRemparts();
      boite.appendChild(el("h3", { texte: "Remparts" }));
      boite.appendChild(el("div", { class: "ligne-arsenal" }, [
        el("span", { class: "td-ic", html: JEU.icones.icone("rempart", 34) }),
        el("div", {}, [el("b", { texte: "Murailles du château " + "◆◆◆".slice(0, c.arsenal.remparts) + "◇◇◇".slice(0, 3 - c.arsenal.remparts) }), el("p", { class: "note", texte: "+4 de solidité pour ton château à chaque niveau." })]),
        pr == null ? el("span", { class: "etat", texte: "Au maximum" }) :
          el("button", { class: "bouton petit", disabled: C.totalRessources() < pr, onclick: function () { if (C.renforcerRemparts()) { JEU.sons.jouer("construction"); JEU.ui.majRessources(); rendu(); } }, texte: "Renforcer · " + pr })
      ]));
      if (rang >= 0) remettreFocus(rang);
    }
    function remettreFocus(rang) {
      var lignes = boite.querySelectorAll(".ligne-arsenal");
      for (var k = 0; k < lignes.length; k++) {
        var b = lignes[(rang + k) % lignes.length].querySelector("button:not([disabled])");
        if (b) { b.focus(); return; }
      }
      var fermer = document.querySelector("#modale .modale-fermer"); // plus rien à acheter : le bouton Fermer
      if (fermer) fermer.focus();
    }
    rendu();
    JEU.ui.ouvrirModale("L'arsenal", boite, function () { if (JEU.ui.ecranCourant() === "jouer") JEU.ui.afficher("jouer"); });
  }

  JEU.ecranCampagne = { ouvrirArsenal: ouvrirArsenal, carteSVG: carteSVG };
})(typeof window !== "undefined" ? window : globalThis);
