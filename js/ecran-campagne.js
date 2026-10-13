// Écran de la campagne (menu « Campagne ») : carte des provinces du seigneur rival, alerte d'attaque,
// conseil du royaume, arsenal, événement du jour, jauges du royaume et chronique de la rivalité.
(function (racine) {
  "use strict";
  var JEU = racine.JEU;
  var U = JEU.util;

  var POSITIONS = { domaine: [95, 250], gue: [255, 160], foret: [415, 300], moulin: [575, 150], col: [735, 290], chateau: [900, 165] };
  var ROUGE = ["#8a3a2a", "#efe6d2"];

  function carteSVG(c, couleurs, cible) {
    var L = 1000, H = 420;
    var s = "<svg viewBox='0 0 " + L + " " + H + "' class='carte-svg' role='img' aria-label='Carte de la campagne'>" +
      "<defs><filter id='sepiaC'><feColorMatrix type='matrix' values='.45 .4 .15 0 .05  .38 .4 .14 0 .04  .25 .3 .12 0 .02  0 0 0 1 0'/></filter>" +
      "<radialGradient id='vigC' cx='.5' cy='.5' r='.7'><stop offset='.6' stop-color='#000' stop-opacity='0'/><stop offset='1' stop-color='#1c140c' stop-opacity='.6'/></radialGradient>" +
      "<filter id='ombreC'><feDropShadow dx='2' dy='4' stdDeviation='3' flood-color='#000' flood-opacity='.55'/></filter></defs>" +
      "<image href='assets/images/terrain-domaine.jpg' x='0' y='-120' width='1000' height='660' preserveAspectRatio='xMidYMid slice' filter='url(#sepiaC)'/>" +
      "<rect width='" + L + "' height='" + H + "' fill='url(#vigC)'/>";
    // la route de la campagne
    var ids = ["domaine"].concat(JEU.campagne.PROVINCES.map(function (p) { return p.id; }));
    var d = "M" + POSITIONS.domaine.join(" ");
    for (var i = 1; i < ids.length; i++) {
      var a = POSITIONS[ids[i - 1]], b = POSITIONS[ids[i]];
      d += " Q" + ((a[0] + b[0]) / 2) + " " + ((a[1] + b[1]) / 2 + (i % 2 ? 60 : -60)) + " " + b[0] + " " + b[1];
    }
    s += "<path d='" + d + "' fill='none' stroke='#2e2419' stroke-width='9' stroke-linecap='round' opacity='.55'/>" +
      "<path d='" + d + "' fill='none' stroke='#e9d9b0' stroke-width='4' stroke-dasharray='2 12' stroke-linecap='round'/>";
    // ton domaine
    s += noeud(POSITIONS.domaine, "accueil", couleurs, "Ton domaine", "", "domaine", c.rival.attaque ? "attaque" : "tien");
    JEU.campagne.PROVINCES.forEach(function (p, k) {
      var conquise = c.conquises.indexOf(p.id) >= 0;
      var etat = conquise ? "tien" : cible && cible.province.id === p.id ? "cible" : "brume";
      var sous = conquise ? "conquise" : etat === "cible" ? "château " + c.provinces[p.id].pv + " / " + p.pv : "";
      s += noeud(POSITIONS[p.id], p.icone, conquise ? couleurs : ROUGE, p.nom, sous, p.id, etat);
    });
    s += "</svg>";
    return s;
  }

  function noeud(pos, icone, coul, nom, sous, id, etat) {
    var x = pos[0], y = pos[1];
    var s = "<g class='noeud " + etat + "' data-lieu='" + id + "' filter='url(#ombreC)' tabindex='" + (etat === "cible" || etat === "attaque" ? "0" : "-1") + "'>";
    if (etat === "cible" || etat === "attaque") s += "<circle class='halo' cx='" + x + "' cy='" + y + "' r='52' fill='none' stroke='" + (etat === "attaque" ? "#d0644a" : "#e2c272") + "' stroke-width='4'/>";
    s += "<circle cx='" + x + "' cy='" + y + "' r='42' fill='#b08d3a' stroke='#2e2419' stroke-width='3'/>" +
      "<circle cx='" + x + "' cy='" + y + "' r='35' fill='" + (etat === "brume" ? "#6f6658" : coul[0]) + "'/>" +
      JEU.icones.dans(icone, x - 24, y - 24, 48, etat === "brume" ? "#bfb39a" : coul[1]);
    // bannière plantée : la tienne ou celle du rival
    if (etat !== "brume") s += "<g transform='translate(" + (x + 22) + "," + (y - 74) + ")'><path d='M0 0v40' stroke='#2e2419' stroke-width='3'/><path d='M2 2h26l-7 9 7 9H2z' fill='" + coul[0] + "' stroke='#2e2419' stroke-width='1.5'/><rect x='2' y='2' width='10' height='18' fill='" + coul[1] + "'/></g>";
    s += "<text x='" + x + "' y='" + (y + 64) + "' class='nom-lieu'>" + U.echapper(nom) + "</text>";
    if (sous) s += "<text x='" + x + "' y='" + (y + 84) + "' class='sous-lieu'>" + U.echapper(sous) + "</text>";
    return s + "</g>";
  }

  JEU.ui.ecrans.jouer = function (s) {
    var el = JEU.ui.el;
    var C = JEU.campagne;
    var jour = C.nouveauJour();
    var c = C.etat();
    var etat = JEU.sauvegarde.etat();
    var nomDomaine = etat.reglages.nomDomaine;
    var couleurs = JEU.icones.couleurs(nomDomaine);
    var cible = C.prochaineProvince();
    var ev = C.evenementDuJour();
    s.innerHTML = "";
    s.appendChild(el("h1", { class: "titre-ecran", texte: "La campagne" }));

    if (jour) {
      var t = Object.keys(jour.tributs).map(function (r) { return "+" + jour.tributs[r] + " " + JEU.RESSOURCES[r].nom.toLowerCase(); });
      if (t.length) JEU.mentor.dire("Tes provinces t'ont versé leur tribut : " + t.join(", ") + ".", "joie", 5000);
      JEU.ui.majRessources();
    }

    if (c.rival.attaque) {
      s.appendChild(el("div", { class: "alerte-rival" }, [
        el("span", { class: "ar-banniere", html: JEU.icones.banniere(3) }),
        el("div", {}, [el("h2", { texte: "Le seigneur rival marche sur ton domaine !" }), el("p", { texte: "Ses troupes approchent par la route de l'est. Défends tes murs : tu ne perdras rien, quoi qu'il arrive." })]),
        el("button", { class: "bouton principal", onclick: function () { JEU.bataille.lancer("domaine"); }, html: "<span class='touche'>1</span> Défendre le domaine" })
      ]));
    }

    var carte = el("div", { class: "carte-campagne", html: carteSVG(c, couleurs, cible) });
    s.appendChild(carte);
    Array.prototype.forEach.call(carte.querySelectorAll(".noeud.cible, .noeud.attaque"), function (n) {
      function go() { JEU.bataille.lancer(n.getAttribute("data-lieu")); }
      n.addEventListener("click", go);
      n.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.stopPropagation(); go(); } });
    });

    var options = [];
    if (c.rival.attaque) options.push({ titre: "Défendre le domaine", texte: "Le rival attaque. Pose tes tours sur la route de ton domaine.", icone: "rempart", action: function () { JEU.bataille.lancer("domaine"); } });
    if (cible) options.push({ titre: "Attaquer : " + cible.province.nom, texte: "Château rival : " + c.provinces[cible.province.id].pv + " / " + cible.province.pv + ". Les coups portés restent acquis d'une bataille à l'autre.", icone: "assaut", action: function () { JEU.bataille.lancer(cible.province.id); } });
    else options.push({ titre: "Le rival est vaincu", texte: "Toutes ses provinces sont à toi. Reviens défendre ton domaine et tenir ton conseil.", icone: "couronne", action: function () { JEU.ui.toast("Toutes les provinces sont conquises !"); } });
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
        el("h3", { html: JEU.icones.icone("defi", 20) + " Le seigneur rival" }),
        el("p", { texte: conquises + " province" + (conquises > 1 ? "s" : "") + " conquise" + (conquises > 1 ? "s" : "") + " sur " + C.PROVINCES.length + " · " + c.rival.defaites + " attaque" + (c.rival.defaites > 1 ? "s" : "") + " repoussée" + (c.rival.defaites > 1 ? "s" : "") }),
        el("div", { class: "menace" }, [el("span", { texte: "Menace" }), el("span", { class: "jr-barre" }, [el("span", { style: "width:" + Math.min(100, c.rival.attaque ? 100 : c.rival.menace * 50) + "%" })])]),
        c.chronique.length ? el("ul", { class: "chronique" }, c.chronique.slice(0, 5).map(function (x) { return el("li", { texte: x.texte }); })) : el("p", { class: "note", texte: "La chronique de la rivalité est encore vierge." })
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
    catapulte: "Dégâts de zone sur les groupes.", fantassins: "Trois soldats par envoi, pas chers.", cavaliers: "Deux cavaliers rapides.", belier: "Lente, très solide, frappe fort le château."
  };

  function ouvrirArsenal() {
    var el = JEU.ui.el, C = JEU.campagne, M = JEU.batailleMoteur;
    var boite = el("div", { class: "arsenal" });
    function rendu() {
      var c = C.etat();
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
    }
    rendu();
    JEU.ui.ouvrirModale("L'arsenal", boite, function () { if (JEU.ui.ecranCourant() === "jouer") JEU.ui.afficher("jouer"); });
  }

  JEU.ecranCampagne = { ouvrirArsenal: ouvrirArsenal, carteSVG: carteSVG };
})(typeof window !== "undefined" ? window : globalThis);
