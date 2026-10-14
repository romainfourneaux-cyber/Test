// Écran de la campagne (menu « Campagne ») : carte des deux fronts (royaume d'Angleterre à l'ouest,
// Empire omeyyade au sud), alerte d'attaque, conseil du royaume, arsenal, événement du jour, jauges et chronique.
(function (racine) {
  "use strict";
  var JEU = racine.JEU;
  var U = JEU.util;

  // Position de chaque lieu (pied du bourg) sur le fond de carte rendu en 3D (1000 × 530) : le domaine dans les champs
  // de l'ouest ; le front de l'ouest (royaume d'Angleterre) sur les terres vertes du nord, au-dessus de l'escarpement ;
  // le front du sud (Empire omeyyade) sur les terres sèches du sud, entre l'escarpement et le fleuve.
  // Les noms sont sous les lieux : deux lieux voisins trop proches en largeur pour leurs noms sont décalés en hauteur
  // (col et château, citadelle et forteresse), pour que deux étiquettes ne se touchent jamais (contrôle dans perf.js).
  // Aucun bourg ni aucun nom n'est posé sur l'eau : le Gué est sur la rive ouest de la rivière, le Moulin du Val sur la
  // berge sud de son ruisseau ; le nom de la Citadelle du Sud est au-dessus du bourg (dessous, il suivait le fleuve).
  var POSITIONS = {
    domaine: [122, 258],
    gue: [244, 116], foret: [404, 100], moulin: [585, 178], col: [712, 87], chateau: [870, 134],
    piemont: [262, 380], oliveraie: [418, 404], fleuve: [566, 366], citadelle: [706, 410], forteresse: [868, 356]
  };
  var NOM_DESSUS = { citadelle: true };
  var L = 1000, H = 530;
  function camp(c) { return JEU.campagne.CAMPS[c]; }
  // Image décrite dans sprites.js, sauf si elle a déjà manqué (fichier absent ou illisible) : on dessine alors
  // directement le repli (ancien fond sépia, médaillon), sans montrer d'image cassée.
  var manquees = {};
  function image(nom) { var s = JEU.SPRITES && JEU.SPRITES[nom]; return s && !manquees[s.src] ? s : null; }
  // Bourg d'une province prise : trois variantes du bourg de France, alternées le long de chaque front (deux lieux
  // voisins n'ont jamais le même) ; le domaine garde la première.
  function variante(p) {
    var k = ((p.niveau || 0) + (p.front === "omeyyades" ? 2 : 1)) % 3 + 1;
    return k > 1 && image("lieu-france-" + k) ? "france-" + k : "france";
  }

  // Chemins en pointillés d'un lieu au suivant. Les noms sont sous les lieux : le chemin ondule au-dessus d'eux.
  // Le premier tronçon quitte le domaine sans couper son nom (point de contrôle propre à chaque front).
  // Un tronçon qui mène à un lieu dans la brume est plus pâle : on devine le chemin, sans qu'il barre la nappe.
  var DEPARTS = { angleterre: [132, 126], omeyyades: [292, 256] };
  function route(frontId, ids, brume) {
    var net = "", pale = "";
    for (var i = 1; i < ids.length; i++) {
      var a = POSITIONS[ids[i - 1]], b = POSITIONS[ids[i]];
      var q = i === 1 && DEPARTS[frontId] ? DEPARTS[frontId] : [(a[0] + b[0]) / 2, Math.min(a[1], b[1]) - 22];
      var d = "M" + a.join(" ") + " Q" + q[0] + " " + q[1] + " " + b[0] + " " + b[1] + " ";
      if (brume[ids[i]]) pale += d; else net += d;
    }
    function trace(d, opacite) {
      return d ? "<g opacity='" + opacite + "'><path d='" + d + "' fill='none' stroke='#2e2419' stroke-width='9' stroke-linecap='round' opacity='.55'/>" +
        "<path d='" + d + "' fill='none' stroke='#efe2bc' stroke-width='4' stroke-dasharray='2 12' stroke-linecap='round'/></g>" : "";
    }
    return trace(pale, ".35") + trace(net, "1");
  }

  // Brouillard de guerre : sous chaque nappe de brume (et entre deux lieux voisins encore dans la brume, pour un voile
  // continu qui se retire province par province), le terrain est voilé et désaturé. Copie du fond 3D passée au gris
  // clair, découpée par un masque fait des nappes elles-mêmes.
  function voileBrume(c, brume, fond) {
    var nappe = image("lieu-brume");
    if (!fond || !nappe) return "";
    var C = JEU.campagne, poses = [];
    C.FRONTS.forEach(function (f) {
      var ids = ["domaine"].concat(f.provinces.map(function (p) { return p.id; }));
      ids.forEach(function (id, i) {
        if (!brume[id]) return;
        var p = POSITIONS[id];
        poses.push([p[0], p[1], 1.15]);
        if (i > 0 && brume[ids[i - 1]]) { var q = POSITIONS[ids[i - 1]]; poses.push([(p[0] + q[0]) / 2, (p[1] + q[1]) / 2 + 8, 0.95]); }
      });
    });
    if (!poses.length) return "";
    var m = "<mask id='masqueBrume' maskUnits='userSpaceOnUse' x='0' y='0' width='" + L + "' height='" + H + "'>" +
      poses.map(function (p) {
        var w = nappe.w * p[2], h = nappe.h * p[2];
        return "<image href='" + nappe.src + "' x='" + (p[0] - nappe.ax * p[2]) + "' y='" + (p[1] - nappe.ay * p[2]) + "' width='" + w + "' height='" + h + "'/>";
      }).join("") + "</mask>";
    // nappes intermédiaires (entre deux lieux dans la brume) : dessinées aussi, plus pâles
    var entre = poses.filter(function (p) { return p[2] < 1; }).map(function (p) {
      return "<image class='nappe-entre' href='" + nappe.src + "' x='" + (p[0] - nappe.ax * p[2]) + "' y='" + (p[1] - nappe.ay * p[2]) + "' width='" + nappe.w * p[2] + "' height='" + nappe.h * p[2] + "' opacity='.7'/>";
    }).join("");
    return "<defs>" + m + "</defs><image class='voile-brume' href='" + fond.src + "' x='0' y='0' width='" + L + "' height='" + H +
      "' preserveAspectRatio='none' filter='url(#grisBrume)' mask='url(#masqueBrume)'/>" + entre;
  }

  function carteSVG(c) {
    var C = JEU.campagne, france = camp("joueur"), fond = image("fond-campagne");
    var brume = {}; // lieux pas encore ouverts : ni pris, ni visés
    C.FRONTS.forEach(function (f) {
      var cible = C.prochaineProvince(f.id);
      f.provinces.forEach(function (p) { brume[p.id] = c.conquises.indexOf(p.id) < 0 && !(cible && cible.province.id === p.id); });
    });
    var s = "<svg viewBox='0 0 " + L + " " + H + "' class='carte-svg' role='img' aria-label='Carte de la campagne : deux fronts'>" +
      "<defs><filter id='sepiaC'><feColorMatrix type='matrix' values='.45 .4 .15 0 .05  .38 .4 .14 0 .04  .25 .3 .12 0 .02  0 0 0 1 0'/></filter>" +
      "<radialGradient id='vigC' cx='.5' cy='.5' r='.7'><stop offset='.6' stop-color='#000' stop-opacity='0'/><stop offset='1' stop-color='#1c140c' stop-opacity='" + (fond ? ".3" : ".6") + "'/></radialGradient>" +
      "<filter id='ombreC'><feDropShadow dx='2' dy='4' stdDeviation='3' flood-color='#000' flood-opacity='.55'/></filter>" +
      // terrain sous la brume : flou (vu à travers la brume : champs et chemins sans arêtes nettes), presque sans
      // couleur, éclairci
      "<filter id='grisBrume' color-interpolation-filters='sRGB'><feGaussianBlur stdDeviation='3'/><feColorMatrix type='saturate' values='.12'/>" +
      "<feComponentTransfer><feFuncR type='linear' slope='.7' intercept='.27'/><feFuncG type='linear' slope='.7' intercept='.27'/><feFuncB type='linear' slope='.7' intercept='.26'/></feComponentTransfer></filter></defs>" +
      // fond rendu en 3D (relief, forêts, champs, escarpement, fleuve), posé sur l'ancien fond peint passé au sépia :
      // si l'image 3D manque, elle est retirée (voir surveillerImages) et l'ancien fond reste
      "<image href='assets/images/terrain-domaine.jpg' x='0' y='-65' width='1000' height='660' preserveAspectRatio='xMidYMid slice' filter='url(#sepiaC)'/>" +
      (fond ? "<image class='fond-3d' href='" + fond.src + "' x='0' y='0' width='" + L + "' height='" + H + "' preserveAspectRatio='none'/>" : "") +
      voileBrume(c, brume, fond) +
      "<rect width='" + L + "' height='" + H + "' fill='url(#vigC)'/>";
    C.FRONTS.forEach(function (f) { s += route(f.id, ["domaine"].concat(f.provinces.map(function (p) { return p.id; })), brume); });
    // titres des fronts, en haut et en bas, à l'intérieur du cadre de parchemin
    C.FRONTS.forEach(function (f, i) {
      var adv = camp(f.camp);
      var y = i === 0 ? 40 : H - 30;
      s += "<g>" + JEU.icones.dans(adv.embleme, 556, y - 20, 24, adv.couleurs[0] === "#e9e1cc" ? "#2f6b52" : adv.couleurs[0]) +
        "<text x='548' y='" + y + "' class='titre-front' text-anchor='end'>" + U.echapper(f.nom) + " · " + U.echapper(C.maj1(adv.nom)) + "</text></g>";
    });
    var attaque = c.rival.attaque;
    s += noeud(POSITIONS.domaine, "lys", france.couleurs, "lys", "Ton domaine", attaque ? "attaqué par " + camp(C.front(attaque).camp).armee : "", "domaine", attaque ? "attaque" : "tien", "france");
    C.FRONTS.forEach(function (f) {
      var cible = C.prochaineProvince(f.id), adv = camp(f.camp);
      f.provinces.forEach(function (p) {
        var conquise = c.conquises.indexOf(p.id) >= 0;
        var etat = conquise ? "tien" : cible && cible.province.id === p.id ? "cible" : "brume";
        var sous = conquise ? "prise" : etat === "cible" ? "place forte " + c.provinces[p.id].pv + " / " + p.pv : "";
        var coul = conquise ? france.couleurs : adv.couleurs;
        // bourg du camp qui tient le lieu ; dans la brume, une nappe de brume
        var lieu = conquise ? variante(p) : etat === "brume" ? "brume" : f.camp;
        s += noeud(POSITIONS[p.id], p.icone, coul, conquise ? "lys" : adv.embleme, p.nom, sous, p.id, etat, lieu);
      });
    });
    return s + "</svg>";
  }

  // Un lieu de la carte : le bourg rendu en 3D (avec la bannière de son camp), son nom et une ligne sous le nom.
  // L'ancien médaillon (icône du lieu, bannière plantée) est le repli : dessiné seul sans sprites.js, ou caché sous
  // le bourg et montré si l'image du bourg manque. L'ombre portée ne touche que le texte et le médaillon : le bourg
  // a déjà la sienne, rendue au sol.
  // Place du nom et de la ligne dessous : sous le bas du lieu (bourg, nappe de brume ou médaillon de repli), ou
  // au-dessus du bourg pour les lieux de NOM_DESSUS. Recalculée si l'image du bourg manque (repli).
  function placeNoms(g, x, y, haut, bas, dessus) {
    var n = g.querySelector(".nom-lieu"), so = g.querySelector(".sous-lieu");
    if (dessus) { if (n) n.setAttribute("y", haut - (so ? 24 : 6)); if (so) so.setAttribute("y", haut - 6); return; }
    if (n) n.setAttribute("y", bas + 21);
    if (so) so.setAttribute("y", bas + 39);
  }

  function noeud(pos, icone, coul, embleme, nom, sous, id, etat, lieu) {
    var x = pos[0], y = pos[1], sp = image("lieu-" + lieu);
    var s = "<g class='noeud " + etat + "' data-lieu='" + id + "' data-x='" + x + "' data-y='" + y + "' tabindex='" + (etat === "cible" || etat === "attaque" ? "0" : "-1") + "'>";
    var halo = etat === "cible" || etat === "attaque" ? " fill='none' stroke='" + (etat === "attaque" ? "#d0644a" : "#e2c272") + "' stroke-width='4'" : null;
    // halo : un trait d'or (ou rouge) posé sur un trait sombre, lisible sur l'herbe claire comme sur le sable du sud
    function anneauHalo(forme, attributs) {
      return "<g class='halo'><" + forme + attributs + " fill='none' stroke='#1c120a' stroke-width='7' opacity='.5'/><" + forme + " class='halo-or'" + attributs + halo + "/></g>";
    }
    var medaillon = "<g class='repli-lieu' filter='url(#ombreC)'" + (sp ? " style='display:none'" : "") + ">" +
      "<circle class='lieu' cx='" + x + "' cy='" + y + "' r='40' fill='#b08d3a' stroke='#2e2419' stroke-width='3'/>" +
      "<circle cx='" + x + "' cy='" + y + "' r='33' fill='" + (etat === "brume" ? "#6f6658" : coul[0]) + "'/>" +
      JEU.icones.dans(icone, x - 23, y - 23, 46, etat === "brume" ? "#bfb39a" : coul[1]) +
      // bannière plantée, avec l'emblème du camp qui tient le lieu
      (etat !== "brume" ? "<g transform='translate(" + (x + 18) + "," + (y - 50) + ")'><path d='M0 0v38' stroke='#2e2419' stroke-width='3'/><path d='M2 2h26l-7 9 7 9H2z' fill='" + coul[0] + "' stroke='#2e2419' stroke-width='1.5'/>" + JEU.icones.dans(embleme, 5, 3, 15, coul[1]) + "</g>" : "") +
      "</g>";
    var bas, haut; // bas et haut du lieu : le nom vient dessous (ou dessus)
    if (sp) {
      // halo posé au sol autour du bourg, aplati et remonté : il ne touche pas le nom
      if (halo) s += anneauHalo("ellipse", " cx='" + x + "' cy='" + (y - sp.h * 0.2) + "' rx='" + sp.w * 0.58 + "' ry='" + sp.w * 0.34 + "'");
      s += medaillon + "<image class='lieu" + (lieu === "brume" ? " nappe" : "") + "' href='" + sp.src + "' x='" + (x - sp.ax) + "' y='" + (y - sp.ay) + "' width='" + sp.w + "' height='" + sp.h + "'/>";
      // nappe de brume : le nom se cale sur le bas visible de la nuée (« bas » dans sprites.js), pas sur son cadre
      bas = y + (sp.bas !== undefined ? sp.bas : sp.h - sp.ay);
      haut = y + (sp.haut !== undefined ? sp.haut : -sp.ay);
    } else {
      if (halo) s += anneauHalo("circle", " cx='" + x + "' cy='" + y + "' r='50'");
      s += medaillon;
      bas = y + 50; haut = y - 56;
    }
    var dessus = !!NOM_DESSUS[id];
    var yn = dessus ? haut - (sous ? 24 : 6) : bas + 21, ys = dessus ? haut - 6 : bas + 39;
    s += "<g filter='url(#ombreC)'><text x='" + x + "' y='" + yn + "' class='nom-lieu'>" + U.echapper(nom) + "</text>";
    if (sous) s += "<text x='" + x + "' y='" + ys + "' class='sous-lieu'>" + U.echapper(sous) + "</text>";
    return s + "</g></g>";
  }

  // Une image de la carte qui ne se charge pas est retirée : l'ancien fond sépia, ou le médaillon du lieu, la remplace.
  // L'échec est retenu : la carte suivante dessine directement le repli.
  function surveillerImages(carte) {
    // nappes du voile de brume (masque et nappes entre deux lieux) : si l'image manque, le voile disparaît
    Array.prototype.forEach.call(carte.querySelectorAll("mask image, image.nappe-entre"), function (im) {
      im.addEventListener("error", function () {
        manquees[im.getAttribute("href")] = true;
        Array.prototype.forEach.call(carte.querySelectorAll(".voile-brume, .nappe-entre, #masqueBrume"), function (v) { v.remove(); });
      });
    });
    Array.prototype.forEach.call(carte.querySelectorAll("image.fond-3d, image.lieu"), function (im) {
      im.addEventListener("error", function () {
        var src = im.getAttribute("href");
        manquees[src] = true;
        var g = im.parentNode, repli = g && g.querySelector(".repli-lieu");
        if (repli) {
          // repli : le médaillon (rayon 50 avec le halo) remplace le bourg ; le nom passe sous le médaillon
          repli.style.display = "";
          var x = +g.getAttribute("data-x"), y = +g.getAttribute("data-y");
          placeNoms(g, x, y, y - 56, y + 50, !!NOM_DESSUS[g.getAttribute("data-lieu")]);
          var h = g.querySelector(".halo");
          if (h) h.outerHTML = "<g class='halo'><circle cx='" + x + "' cy='" + y + "' r='50' fill='none' stroke='#1c120a' stroke-width='7' opacity='.5'/>" +
            "<circle class='halo-or' cx='" + x + "' cy='" + y + "' r='50' fill='none' stroke='" + h.querySelector(".halo-or").getAttribute("stroke") + "' stroke-width='4'/></g>";
        }
        im.remove();
        if (im.classList.contains("fond-3d") || im.classList.contains("nappe"))
          Array.prototype.forEach.call(carte.querySelectorAll(".voile-brume, .nappe-entre, #masqueBrume"), function (v) { v.remove(); });
      });
    });
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
    surveillerImages(carte);
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
