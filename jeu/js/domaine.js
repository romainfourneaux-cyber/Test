// Le domaine, à la manière de Manor Lords : plan de ville ancien sur parchemin, six quartiers.
// Un bâtiment se débloque quand sa matière atteint 70 % de maîtrise sur les notions vues,
// puis se construit avec des ressources d'au moins deux matières. Rien ne se perd jamais.
(function (racine) {
  "use strict";
  var JEU = racine.JEU;
  var U = JEU.util;
  var MIN_NOTIONS = 3; // nombre de notions vues avant de parler de maîtrise

  var QUARTIERS = {
    chateau:       { nom: "Château", matieres: ["histoire"], x: 450, y: 110 },
    marche:        { nom: "Marché et routes", matieres: ["geographie"], x: 720, y: 290 },
    herboristerie: { nom: "Herboristerie", matieres: ["svt"], x: 180, y: 290 },
    forge:         { nom: "Forge et moulin", matieres: ["physique"], x: 690, y: 470 },
    scriptorium:   { nom: "Scriptorium", matieres: ["litterature", "lecture"], x: 210, y: 470 },
    ambassade:     { nom: "Ambassade", matieres: ["anglais"], x: 450, y: 528 }
  };

  // Bâtiments du jalon 1 : deux par quartier. Coûts à équilibrer (jalon 4).
  var BATIMENTS = [
    { id: "tour-de-guet", nom: "Tour de guet", quartier: "chateau", cout: { sceaux: 6, alambics: 4 }, forme: "tour" },
    { id: "grande-salle", nom: "Grande salle", quartier: "chateau", cout: { sceaux: 20, parchemins: 10 }, forme: "salle" },
    { id: "jardin-des-simples", nom: "Jardin des simples", quartier: "herboristerie", cout: { remedes: 6, sceaux: 4 }, forme: "jardin" },
    { id: "sechoir", nom: "Séchoir à plantes", quartier: "herboristerie", cout: { remedes: 20, alambics: 10 }, forme: "maison" },
    { id: "forge", nom: "Forge", quartier: "forge", cout: { alambics: 6, remedes: 4 }, forme: "forge" },
    { id: "moulin", nom: "Moulin", quartier: "forge", cout: { alambics: 20, routes: 10 }, forme: "moulin" },
    { id: "etal", nom: "Étal du marché", quartier: "marche", cout: { routes: 6, alambics: 4 }, forme: "etal" },
    { id: "halle", nom: "Halle", quartier: "marche", cout: { routes: 20, sceaux: 10 }, forme: "salle" },
    { id: "pupitre", nom: "Atelier de copiste", quartier: "scriptorium", cout: { parchemins: 6, sceaux: 4 }, forme: "maison" },
    { id: "bibliotheque", nom: "Bibliothèque", quartier: "scriptorium", cout: { parchemins: 20, sceaux: 10 }, forme: "salle" },
    { id: "relais", nom: "Relais de poste", quartier: "ambassade", cout: { alliances: 6, routes: 4 }, forme: "maison" },
    { id: "ambassade", nom: "Maison des ambassadeurs", quartier: "ambassade", cout: { alliances: 20, parchemins: 10 }, forme: "salle" }
  ];

  var STADES = [
    { min: 0, nom: "Hameau", maisons: 4 },
    { min: 2, nom: "Village", maisons: 10 },
    { min: 6, nom: "Bourg", maisons: 18 },
    { min: 10, nom: "Ville", maisons: 28 }
  ];

  function stade(nb) {
    var s = STADES[0];
    STADES.forEach(function (x) { if (nb >= x.min) s = x; });
    return s;
  }

  // Maîtrise d'un quartier : part des notions vues (de ses matières) qui ont progressé (boîte 2 ou plus).
  function maitrise(quartier, etat) {
    etat = etat || JEU.sauvegarde.etat();
    var mats = QUARTIERS[quartier].matieres;
    var vues = 0, sures = 0;
    var tf = JEU.questions.toutesFiches();
    Object.keys(etat.notions).forEach(function (fid) {
      var x = tf[fid];
      if (!x || mats.indexOf(x.matiere) < 0) return;
      vues++;
      if (etat.notions[fid].boite >= 2) sures++;
    });
    return { vues: vues, taux: vues ? sures / vues : 0 };
  }

  function debloque(b, etat) {
    var m = maitrise(b.quartier, etat);
    var seuil = (JEU.donnees.config && JEU.donnees.config.seuilBatiment) || 0.7;
    return m.vues >= MIN_NOTIONS && m.taux >= seuil - 1e-9;
  }

  function abordable(b, etat) {
    return Object.keys(b.cout).every(function (r) { return (etat.ressources[r] || 0) >= b.cout[r]; });
  }

  function construire(id, etat) {
    etat = etat || JEU.sauvegarde.etat();
    var b = BATIMENTS.filter(function (x) { return x.id === id; })[0];
    if (!b || etat.batiments.indexOf(id) >= 0 || !debloque(b, etat) || !abordable(b, etat)) return false;
    var avant = stade(etat.batiments.length);
    Object.keys(b.cout).forEach(function (r) { etat.ressources[r] -= b.cout[r]; });
    etat.batiments.push(id);
    JEU.sauvegarde.enregistrer();
    var apres = stade(etat.batiments.length);
    return { batiment: b, nouveauStade: apres !== avant ? apres : null };
  }

  // ---------- dessin : plan de ville ancien ----------
  var ENCRE = "#2e2419";
  var L = 1000, H = 660, CX = 500, CY = 350;
  var POS = {
    chateau: [500, 135], marche: [810, 335], herboristerie: [190, 335],
    forge: [770, 530], scriptorium: [230, 530], ambassade: [500, 545]
  };

  function arbre(x, y, t, c) {
    return "<circle cx='" + x + "' cy='" + y + "' r='" + t + "' fill='" + c + "' stroke='" + ENCRE + "' stroke-width='1'/>" +
      "<path d='M" + (x - t * 0.4) + " " + (y - t * 0.2) + " a" + (t * 0.5) + " " + (t * 0.5) + " 0 0 1 " + (t * 0.6) + " " + (-t * 0.4) + "' fill='none' stroke='#efe6d2' stroke-width='1' opacity='.5'/>";
  }

  function toit(x, y, l, h, ang, c) {
    return "<g transform='translate(" + x + "," + y + ") rotate(" + ang + ")'>" +
      "<rect x='" + (-l / 2) + "' y='" + (-h / 2) + "' width='" + l + "' height='" + h + "' fill='" + c + "' stroke='" + ENCRE + "' stroke-width='1.1'/>" +
      "<path d='M" + (-l / 2) + " 0H" + (l / 2) + "' stroke='" + ENCRE + "' stroke-width='.9'/>" +
      "<rect x='" + (-l / 2) + "' y='0' width='" + l + "' height='" + (h / 2) + "' fill='#000' opacity='.18'/></g>";
  }

  function enceinte(stadeIdx) {
    var rx = [300, 330, 360, 380][stadeIdx], ry = [205, 225, 245, 255][stadeIdx];
    var s = "";
    if (stadeIdx === 0) {
      s += "<ellipse cx='" + CX + "' cy='" + CY + "' rx='" + rx + "' ry='" + ry + "' fill='none' stroke='#7a5230' stroke-width='6' stroke-dasharray='3 4'/>";
      return s;
    }
    s += "<ellipse cx='" + CX + "' cy='" + CY + "' rx='" + rx + "' ry='" + ry + "' fill='none' stroke='" + ENCRE + "' stroke-width='11'/>" +
      "<ellipse cx='" + CX + "' cy='" + CY + "' rx='" + rx + "' ry='" + ry + "' fill='none' stroke='#b9ab8c' stroke-width='7'/>" +
      "<ellipse cx='" + CX + "' cy='" + CY + "' rx='" + rx + "' ry='" + ry + "' fill='none' stroke='" + ENCRE + "' stroke-width='1' stroke-dasharray='4 5'/>";
    var n = [0, 6, 10, 14][stadeIdx];
    for (var i = 0; i < n; i++) {
      var a = i / n * Math.PI * 2 + 0.3;
      var x = CX + Math.cos(a) * rx, y = CY + Math.sin(a) * ry;
      s += "<circle cx='" + x.toFixed(1) + "' cy='" + y.toFixed(1) + "' r='12' fill='#c8b996' stroke='" + ENCRE + "' stroke-width='2'/><circle cx='" + x.toFixed(1) + "' cy='" + y.toFixed(1) + "' r='5' fill='#8a7f70'/>";
    }
    return s;
  }

  function rubanTexte(x, y, texte, l) {
    l = l || Math.max(110, texte.length * 10 + 30);
    return "<g transform='translate(" + x + "," + y + ")'>" +
      "<path d='M" + (-l / 2 - 14) + " 4l10 -10l-10 -10h18v20z' fill='#c9b07a' stroke='" + ENCRE + "' stroke-width='1.2' transform='translate(0,8)'/>" +
      "<path d='M" + (l / 2 + 14) + " 4l-10 -10l10 -10h-18v20z' fill='#c9b07a' stroke='" + ENCRE + "' stroke-width='1.2' transform='translate(0,8)'/>" +
      "<rect x='" + (-l / 2) + "' y='-13' width='" + l + "' height='24' fill='#efe2bf' stroke='" + ENCRE + "' stroke-width='1.4'/>" +
      "<text y='5' text-anchor='middle' class='plan-texte'>" + U.echapper(texte) + "</text></g>";
  }

  function dessiner(etat) {
    var nb = etat.batiments.length;
    var st = stade(nb);
    var idx = STADES.indexOf(st);
    var r = pseudoHasard(7);
    var s = "<svg viewBox='0 0 " + L + " " + H + "' class='plan' role='img' aria-label='Plan du domaine'>" +
      "<defs>" +
      "<pattern id='sillons' width='7' height='7' patternUnits='userSpaceOnUse' patternTransform='rotate(30)'><path d='M0 0v7' stroke='" + ENCRE + "' stroke-width='.8' opacity='.35'/></pattern>" +
      "<pattern id='sillons2' width='7' height='7' patternUnits='userSpaceOnUse' patternTransform='rotate(-40)'><path d='M0 0v7' stroke='" + ENCRE + "' stroke-width='.8' opacity='.35'/></pattern>" +
      "<filter id='flou' x='-30%' y='-30%' width='160%' height='160%'><feGaussianBlur stdDeviation='9'/></filter>" +
      "<radialGradient id='vigP' cx='.5' cy='.5' r='.72'><stop offset='.62' stop-color='#5b4428' stop-opacity='0'/><stop offset='1' stop-color='#5b4428' stop-opacity='.35'/></radialGradient>" +
      "</defs>";
    // champs en lanières à l'extérieur
    for (var i = 0; i < 16; i++) {
      var a = i / 16 * Math.PI * 2, d = 410 + r() * 60;
      var fx = CX + Math.cos(a) * d * 1.05, fy = CY + Math.sin(a) * d * 0.72;
      var champ = "M" + fx.toFixed(0) + " " + fy.toFixed(0) + " l" + (60 + r() * 40).toFixed(0) + " " + (r() * 20 - 10).toFixed(0) + " l" + (r() * 16).toFixed(0) + " " + (40 + r() * 20).toFixed(0) + " l" + (-70 - r() * 30).toFixed(0) + " " + (r() * 10).toFixed(0) + "z";
      s += "<path d='" + champ + "' fill='" + ["#cdbb7a", "#a9a865", "#c2a66a"][i % 3] + "' stroke='" + ENCRE + "' stroke-width='1'/>" +
        "<path d='" + champ + "' fill='url(#" + (i % 2 ? "sillons" : "sillons2") + ")'/>";
    }
    // forêts dans les coins
    [[70, 90], [930, 80], [60, 620], [950, 610], [880, 190]].forEach(function (c, k) {
      for (var t = 0; t < 16; t++) s += arbre(c[0] + (r() - 0.5) * 120, c[1] + (r() - 0.5) * 80, 9 + r() * 6, k % 2 ? "#5a6a3a" : "#4f5f34");
    });
    // collines en hachures
    [[150, 160], [330, 70], [690, 60]].forEach(function (c) {
      s += "<path d='M" + (c[0] - 60) + " " + c[1] + " q60 -46 120 0' fill='#d4c08a' stroke='" + ENCRE + "' stroke-width='1.4'/>";
      for (var h = 0; h < 7; h++) s += "<path d='M" + (c[0] - 42 + h * 14) + " " + (c[1] - 18 + Math.abs(h - 3) * 5) + " l-4 10' stroke='" + ENCRE + "' stroke-width='1'/>";
    });
    // rivière
    var riv = "M-20 250 C150 280 260 200 380 230 S600 300 720 255 S900 190 1020 230";
    s += "<path d='" + riv + "' fill='none' stroke='" + ENCRE + "' stroke-width='30'/><path d='" + riv + "' fill='none' stroke='#9fb5bf' stroke-width='26'/>" +
      "<path d='" + riv + "' fill='none' stroke='#c9dbe0' stroke-width='2' stroke-dasharray='14 22' opacity='.9'/>";
    // enceinte
    s += enceinte(idx);
    // routes vers chaque quartier
    var routes = Object.keys(POS).map(function (k) { return "M" + CX + " " + CY + " L" + POS[k][0] + " " + POS[k][1]; }).join(" ");
    s += "<path d='" + routes + "' stroke='" + ENCRE + "' stroke-width='16' stroke-linecap='round'/><path d='" + routes + "' stroke='#e2d2a4' stroke-width='12' stroke-linecap='round'/>";
    // pont sur la rivière (route du château)
    s += "<rect x='486' y='222' width='28' height='46' fill='#bfa77a' stroke='" + ENCRE + "' stroke-width='1.6'/><path d='M486 230h28M486 260h28' stroke='" + ENCRE + "' stroke-width='1'/>";
    // maisons le long des routes, plus nombreuses à chaque stade
    var nbMaisons = [8, 20, 34, 50][idx];
    var r2 = pseudoHasard(21);
    var cles = Object.keys(POS);
    for (var m = 0; m < nbMaisons; m++) {
      var q = POS[cles[m % cles.length]];
      var t = 0.25 + r2() * 0.45;
      var px = CX + (q[0] - CX) * t, py = CY + (q[1] - CY) * t;
      var ang = Math.atan2(q[1] - CY, q[0] - CX) * 180 / Math.PI;
      var cote = (m % 2 ? 1 : -1) * (16 + r2() * 6);
      var ox = -Math.sin(ang * Math.PI / 180) * cote, oy = Math.cos(ang * Math.PI / 180) * cote;
      s += toit(px + ox, py + oy, 16 + r2() * 8, 11 + r2() * 4, ang, r2() > 0.5 ? "#9a5634" : "#7a4a32");
    }
    // place centrale et puits
    s += "<circle cx='" + CX + "' cy='" + CY + "' r='40' fill='#e2d2a4' stroke='" + ENCRE + "' stroke-width='2'/>" +
      "<circle cx='" + CX + "' cy='" + CY + "' r='9' fill='#9fb5bf' stroke='" + ENCRE + "' stroke-width='2'/>";
    // quartiers
    Object.keys(QUARTIERS).forEach(function (k) {
      var q = QUARTIERS[k], p = POS[k];
      var m = maitrise(k, etat);
      var eveille = m.vues > 0;
      var couleur = JEU.MATIERES[q.matieres[0]].couleur;
      s += "<g class='quartier" + (eveille ? "" : " endormi") + "' data-quartier='" + k + "' tabindex='0' role='button' aria-label='" + q.nom + "'>" +
        "<rect x='" + (p[0] - 115) + "' y='" + (p[1] - 58) + "' width='230' height='116' rx='18' fill='" + couleur + "' fill-opacity='.16' stroke='" + couleur + "' stroke-width='3' stroke-dasharray='9 5'/>";
      var places = BATIMENTS.filter(function (b) { return b.quartier === k; });
      places.forEach(function (b, j) {
        var bx = p[0] - 82 + j * 104, by = p[1] - 40;
        if (etat.batiments.indexOf(b.id) >= 0) {
          s += "<ellipse cx='" + (bx + 32) + "' cy='" + (by + 66) + "' rx='34' ry='9' fill='#000' opacity='.2'/>" +
            JEU.icones.dans(b.id, bx, by, 66, ENCRE) +
            "<g transform='translate(" + (bx + 52) + "," + (by - 4) + ")'><path d='M0 0v18' stroke='" + ENCRE + "' stroke-width='1.6'/><path d='M1 0h13l-4 4 4 4H1z' fill='" + couleur + "'/></g>";
        } else {
          s += "<rect x='" + (bx + 8) + "' y='" + (by + 12) + "' width='48' height='48' fill='none' stroke='" + ENCRE + "' stroke-width='1.4' stroke-dasharray='4 4' opacity='.55'/>" +
            "<path d='M" + (bx + 8) + " " + (by + 60) + " l48 -48 M" + (bx + 8) + " " + (by + 12) + " l48 48' stroke='" + ENCRE + "' stroke-width='1' opacity='.25'/>";
        }
      });
      // fanion à l'icône de la matière
      s += "<g transform='translate(" + (p[0] - 128) + "," + (p[1] - 78) + ")'><path d='M4 0v70' stroke='" + ENCRE + "' stroke-width='3'/>" +
        "<path d='M6 2h40v34l-20 10-20-10z' fill='" + couleur + "' stroke='" + ENCRE + "' stroke-width='1.6'/>" +
        JEU.icones.dans(JEU.icones.matiere(q.matieres[0]), 12, 6, 28, "#efe6d2") + "</g>";
      // brume sur les quartiers endormis
      if (!eveille) {
        s += "<g filter='url(#flou)' opacity='.85'><ellipse cx='" + (p[0] - 40) + "' cy='" + p[1] + "' rx='90' ry='45' fill='#f4ede0'/><ellipse cx='" + (p[0] + 50) + "' cy='" + (p[1] + 8) + "' rx='80' ry='40' fill='#f4ede0'/></g>";
      }
      s += rubanTexte(p[0], p[1] + 74, q.nom) + "</g>";
    });
    // le seigneur à cheval, que le joueur dirige au clavier
    var cs = JEU.icones.couleurs(etat.reglages.nomDomaine);
    s += "<g id='seigneur' transform='translate(" + balade.x.toFixed(1) + "," + balade.y.toFixed(1) + ")'>" +
      "<ellipse cx='0' cy='3' rx='34' ry='9' fill='#000' opacity='.3'/>" +
      "<g class='monture' transform='scale(" + balade.sens + ",1)'>" + JEU.icones.dans("cavalier", -40, -78, 80, ENCRE) + JEU.icones.dans("cavalier", -38, -76, 76, cs[0]) +
      "<path d='M-18 -64v-34' stroke='" + ENCRE + "' stroke-width='2.5'/><path d='M-18 -98h24l-7 8 7 8h-24z' fill='" + cs[1] + "' stroke='" + ENCRE + "' stroke-width='1.2'/></g></g>";
    // cartouche du titre et rose des vents
    s += "<g transform='translate(30,24)'><rect width='270' height='70' rx='4' fill='#efe2bf' stroke='" + ENCRE + "' stroke-width='2'/><rect x='5' y='5' width='260' height='60' fill='none' stroke='" + ENCRE + "' stroke-width='1'/>" +
      "<text x='135' y='34' text-anchor='middle' class='plan-texte grand'>" + U.echapper(etat.reglages.nomDomaine || "Le domaine") + "</text>" +
      "<text x='135' y='55' text-anchor='middle' class='plan-texte petit'>— " + st.nom + " —</text></g>";
    s += "<g transform='translate(920,560)'><circle r='34' fill='none' stroke='" + ENCRE + "' stroke-width='1.2'/>" +
      "<path d='M0 -44L8 0L0 44L-8 0z' fill='" + ENCRE + "'/><path d='M-44 0L0 -8L44 0L0 8z' fill='#b08d3a' stroke='" + ENCRE + "' stroke-width='.8'/>" +
      "<path d='M-24 -24L4 -4L24 24L-4 4z' fill='#8a7f70' opacity='.7'/><path d='M24 -24L4 4L-24 24L-4 -4z' fill='#8a7f70' opacity='.7'/>" +
      "<text y='-50' text-anchor='middle' class='plan-texte petit'>N</text></g>";
    s += "<rect width='" + L + "' height='" + H + "' fill='url(#vigP)' pointer-events='none'/>" +
      "<rect x='6' y='6' width='" + (L - 12) + "' height='" + (H - 12) + "' fill='none' stroke='" + ENCRE + "' stroke-width='3'/><rect x='12' y='12' width='" + (L - 24) + "' height='" + (H - 24) + "' fill='none' stroke='" + ENCRE + "' stroke-width='1'/>";
    return s + "</svg>";
  }

  function pseudoHasard(graine) {
    var x = graine;
    return function () { x = (x * 9301 + 49297) % 233280; return x / 233280; };
  }

  // ---------- écran ----------
  var quartierChoisi = null;

  // ---------- balade du seigneur : flèches ou Z Q S D, Entrée pour visiter le quartier ----------
  var balade = { x: CX, y: CY + 62, sens: 1, touches: {}, cible: null, boucle: null, t: 0, proche: null };
  var VITESSE = 300; // unités du plan par seconde
  var DIRECTIONS = {
    arrowup: [0, -1], z: [0, -1], w: [0, -1], arrowdown: [0, 1], s: [0, 1],
    arrowleft: [-1, 0], q: [-1, 0], a: [-1, 0], arrowright: [1, 0], d: [1, 0]
  };

  function surDomaine() {
    return JEU.ui.ecranCourant && JEU.ui.ecranCourant() === "domaine" && !JEU.partie && !JEU.ui.modaleOuverte();
  }

  function quartierSous(x, y) {
    var k = Object.keys(POS).filter(function (q) { return Math.abs(x - POS[q][0]) <= 115 && Math.abs(y - POS[q][1]) <= 70; });
    return k[0] || null;
  }

  function placer() {
    var g = document.querySelector("#ecran-domaine #seigneur");
    if (!g) return;
    g.setAttribute("transform", "translate(" + balade.x.toFixed(1) + "," + balade.y.toFixed(1) + ")");
    g.querySelector(".monture").setAttribute("transform", "scale(" + balade.sens + ",1)");
    var q = quartierSous(balade.x, balade.y);
    if (q !== balade.proche) {
      balade.proche = q;
      Array.prototype.forEach.call(document.querySelectorAll("#ecran-domaine .quartier"), function (e) {
        e.classList.toggle("proche", e.getAttribute("data-quartier") === q);
      });
      var aide = document.querySelector("#ecran-domaine .aide-balade");
      if (aide) aide.innerHTML = q
        ? "Tu es au quartier <b>" + U.echapper(QUARTIERS[q].nom) + "</b> · <span class='touche'>↵</span> Entrée pour le visiter"
        : "Chevauche avec les <b>flèches</b> ou <b>Z Q S D</b> · clique sur le plan pour t'y rendre";
    }
  }

  function pas(t) {
    if (!surDomaine()) { balade.boucle = null; balade.touches = {}; balade.cible = null; return; }
    var dt = Math.min(0.05, (t - (balade.t || t)) / 1000);
    balade.t = t;
    var vx = 0, vy = 0;
    Object.keys(balade.touches).forEach(function (k) { vx += DIRECTIONS[k][0]; vy += DIRECTIONS[k][1]; });
    if (vx || vy) balade.cible = null;
    else if (balade.cible) {
      var dx = balade.cible[0] - balade.x, dy = balade.cible[1] - balade.y, dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 4) balade.cible = null; else { vx = dx / dist; vy = dy / dist; }
    }
    if (!vx && !vy) { balade.boucle = null; balade.t = 0; placer(); return; }
    var n = Math.sqrt(vx * vx + vy * vy);
    balade.x = Math.max(40, Math.min(L - 40, balade.x + vx / n * VITESSE * dt));
    balade.y = Math.max(80, Math.min(H - 20, balade.y + vy / n * VITESSE * dt));
    if (vx) balade.sens = vx < 0 ? -1 : 1;
    placer();
    balade.boucle = requestAnimationFrame(pas);
  }

  function relancer() { if (!balade.boucle) { balade.t = 0; balade.boucle = requestAnimationFrame(pas); } }

  function visiter() {
    if (!balade.proche) return false;
    quartierChoisi = balade.proche;
    var panneau = document.querySelector("#ecran-domaine .panneau-quartier");
    if (panneau) { rendrePanneau(panneau, JEU.sauvegarde.etat()); panneau.scrollIntoView({ behavior: "smooth", block: "start" }); }
    return true;
  }

  if (typeof document !== "undefined") {
    document.addEventListener("keydown", function (e) {
      if (!surDomaine() || e.altKey || e.ctrlKey || e.metaKey) return;
      // Entrée sur un bouton du domaine (Construire…) garde son rôle ; sur le menu, elle sert à visiter.
      if (e.target && e.target.tagName === "BUTTON" && e.key === "Enter" && !(e.target.closest && e.target.closest("#menu"))) return;
      if (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
      var k = e.key.toLowerCase();
      if (DIRECTIONS[k]) { balade.touches[k] = true; e.preventDefault(); relancer(); }
      else if (k === "enter" && visiter()) e.preventDefault();
    });
    document.addEventListener("keyup", function (e) { delete balade.touches[e.key.toLowerCase()]; });
    window.addEventListener("blur", function () { balade.touches = {}; });
  }

  JEU.ui.ecrans.domaine = function (s) {
    var el = JEU.ui.el;
    var etat = JEU.sauvegarde.etat();
    var st = stade(etat.batiments.length);
    s.innerHTML = "";
    s.appendChild(el("h1", { class: "titre-ecran", texte: "Ton domaine · " + st.nom }));
    var plan = el("div", { class: "plan-cadre", html: dessiner(etat) });
    s.appendChild(plan);
    s.appendChild(el("p", { class: "aide-balade" }));
    var panneau = el("div", { class: "panneau-quartier" });
    s.appendChild(panneau);
    var svg = plan.querySelector("svg");
    svg.addEventListener("click", function (e) {
      var m = svg.getScreenCTM();
      if (!m) return;
      var pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
      var p = pt.matrixTransform(m.inverse());
      balade.cible = [p.x, p.y]; relancer();
    });
    balade.proche = undefined;
    Array.prototype.forEach.call(plan.querySelectorAll(".quartier"), function (g) {
      function choisir() { quartierChoisi = g.getAttribute("data-quartier"); rendrePanneau(panneau, etat); }
      g.addEventListener("click", choisir);
      g.addEventListener("keydown", function (e) { if (e.key === "Enter") choisir(); });
    });
    var prochain = STADES.filter(function (x) { return x.min > etat.batiments.length; })[0];
    if (prochain) s.appendChild(el("p", { class: "note centre", texte: "Encore " + (prochain.min - etat.batiments.length) + " bâtiment" + (prochain.min - etat.batiments.length > 1 ? "s" : "") + " pour devenir " + prochain.nom.toLowerCase() + "." }));
    rendrePanneau(panneau, etat);
    placer();
  };

  function rendrePanneau(panneau, etat) {
    var el = JEU.ui.el;
    panneau.innerHTML = "";
    var liste = quartierChoisi ? [quartierChoisi] : Object.keys(QUARTIERS);
    if (!quartierChoisi) panneau.appendChild(el("p", { class: "note", texte: "Clique un quartier sur le plan pour le voir de près." }));
    liste.forEach(function (k) {
      var q = QUARTIERS[k];
      var m = maitrise(k, etat);
      var bloc = el("div", { class: "quartier-bloc", style: "--teinte:" + JEU.MATIERES[q.matieres[0]].couleur }, [
        el("h3", { texte: q.nom + " · " + q.matieres.map(function (x) { return JEU.MATIERES[x].nom; }).filter(function (v, i, t) { return t.indexOf(v) === i; }).join(", ") }),
        el("p", { class: "note", texte: m.vues ? "Maîtrise : " + Math.round(m.taux * 100) + " % sur " + m.vues + " notion" + (m.vues > 1 ? "s" : "") + " vue" + (m.vues > 1 ? "s" : "") : "Aucune notion vue : joue dans cette matière pour réveiller le quartier." })
      ]);
      BATIMENTS.filter(function (b) { return b.quartier === k; }).forEach(function (b) {
        var fait = etat.batiments.indexOf(b.id) >= 0;
        var cout = Object.keys(b.cout).map(function (r) { return b.cout[r] + " " + JEU.RESSOURCES[r].nom.toLowerCase(); }).join(" + ");
        var action;
        if (fait) action = el("span", { class: "etat valide", texte: "Construit" });
        else if (!debloque(b, etat)) action = el("span", { class: "etat", texte: m.vues < MIN_NOTIONS ? "Verrouillé · " + MIN_NOTIONS + " notions à voir" : "Verrouillé · 70 % de maîtrise" });
        else if (!abordable(b, etat)) action = el("button", { class: "bouton petit", disabled: true, texte: "Ressources insuffisantes" });
        else action = el("button", { class: "bouton principal petit", onclick: function () {
          var r = construire(b.id, etat);
          if (!r) return;
          JEU.sons.jouer("construction");
          JEU.ui.majRessources();
          if (r.nouveauStade) JEU.mentor.dire("Ton domaine grandit : le voici devenu " + r.nouveauStade.nom.toLowerCase() + " !", "joie", 5000);
          else JEU.ui.toast(b.nom + " construit !", "bon");
          JEU.ui.ecrans.domaine(document.getElementById("ecran-domaine"));
        }, texte: "Construire" });
        bloc.appendChild(el("div", { class: "ligne-batiment" + (fait ? " fait" : "") }, [
          el("span", {}, [el("span", { html: JEU.icones.icone(b.id, 28) }), el("b", { texte: b.nom }), el("span", { class: "note", texte: " · " + cout })]), action
        ]));
      });
      panneau.appendChild(bloc);
    });
    if (quartierChoisi) panneau.appendChild(el("button", { class: "lien", onclick: function () { quartierChoisi = null; rendrePanneau(panneau, etat); }, texte: "Voir tous les quartiers" }));
  }

  JEU.domaine = { balade: balade, quartierSous: quartierSous, QUARTIERS: QUARTIERS, BATIMENTS: BATIMENTS, STADES: STADES, stade: stade, maitrise: maitrise, debloque: debloque, abordable: abordable, construire: construire, dessiner: dessiner };
})(typeof window !== "undefined" ? window : globalThis);
