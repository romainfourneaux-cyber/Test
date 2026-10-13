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

  // ---------- dessin ----------
  var ENCRE = "#2e2419";

  function pseudoHasard(graine) {
    var s = graine;
    return function () { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  }

  function maison(x, y, r) {
    var w = 14 + r * 8, h = 10 + r * 5;
    return "<g transform='translate(" + x + "," + y + ")'><rect x='" + (-w / 2) + "' y='0' width='" + w + "' height='" + h + "' fill='#d9c9a3' stroke='" + ENCRE + "' stroke-width='1.2'/>" +
      "<path d='M" + (-w / 2 - 2) + " 0L0 " + (-h * 0.8) + "L" + (w / 2 + 2) + " 0z' fill='#8a5a3a' stroke='" + ENCRE + "' stroke-width='1.2'/></g>";
  }

  var FORMES = {
    tour: "<rect x='-12' y='-34' width='24' height='44' fill='#cfc0a0' stroke='#2e2419' stroke-width='2'/><path d='M-14 -34h28v-8h-6v4h-5v-4h-6v4h-5v-4h-6z' fill='#cfc0a0' stroke='#2e2419' stroke-width='2'/><rect x='-3' y='-24' width='6' height='9' fill='#2e2419'/>",
    salle: "<rect x='-28' y='-14' width='56' height='24' fill='#d9c9a3' stroke='#2e2419' stroke-width='2'/><path d='M-32 -14L0 -36L32 -14z' fill='#6b2d5c' stroke='#2e2419' stroke-width='2'/><path d='M-4 10v-12h8v12' fill='#2e2419'/>",
    jardin: "<rect x='-30' y='-16' width='60' height='30' fill='#c7cf9a' stroke='#2e2419' stroke-width='2'/><path d='M-24 -8h48M-24 0h48M-24 8h48' stroke='#4f6b32' stroke-width='3' stroke-dasharray='4 3'/>",
    maison: "<rect x='-18' y='-10' width='36' height='20' fill='#d9c9a3' stroke='#2e2419' stroke-width='2'/><path d='M-22 -10L0 -28L22 -10z' fill='#8a5a3a' stroke='#2e2419' stroke-width='2'/>",
    forge: "<rect x='-20' y='-12' width='40' height='22' fill='#bfb39a' stroke='#2e2419' stroke-width='2'/><path d='M-24 -12L0 -28L24 -12z' fill='#5b4a3a' stroke='#2e2419' stroke-width='2'/><rect x='10' y='-34' width='7' height='14' fill='#5b4a3a' stroke='#2e2419' stroke-width='1.5'/>",
    moulin: "<rect x='-10' y='-16' width='20' height='26' fill='#d9c9a3' stroke='#2e2419' stroke-width='2'/><path d='M0 -22l-22 -14M0 -22l22 -14M0 -22l-14 22M0 -22l14 22' stroke='#2e2419' stroke-width='3'/><circle cx='0' cy='-22' r='3' fill='#2e2419'/>",
    etal: "<rect x='-22' y='-6' width='44' height='14' fill='#d9c9a3' stroke='#2e2419' stroke-width='2'/><path d='M-26 -6l6 -12h40l6 12z' fill='#b5772b' stroke='#2e2419' stroke-width='2'/>"
  };

  function dessiner(etat) {
    var nb = etat.batiments.length;
    var st = stade(nb);
    var alea = pseudoHasard(7);
    var svg = "<svg viewBox='0 0 900 600' class='plan' role='img' aria-label='Plan du domaine'>" +
      "<defs><pattern id='hachure' width='8' height='8' patternUnits='userSpaceOnUse' patternTransform='rotate(45)'><path d='M0 0v8' stroke='#8a7f70' stroke-width='1' opacity='.35'/></pattern></defs>" +
      "<rect x='0' y='0' width='900' height='600' fill='#efe6d2'/>" +
      // rivière
      "<path d='M-10 180C150 210 220 120 360 160S560 300 700 250 860 160 910 200' fill='none' stroke='#7f9bb0' stroke-width='22' opacity='.55'/>" +
      // routes
      "<path d='" + Object.keys(QUARTIERS).map(function (k) { return "M450 300L" + QUARTIERS[k].x + " " + QUARTIERS[k].y; }).join("") + "' stroke='#b9a57e' stroke-width='10' stroke-linecap='round'/>" +
      "<circle cx='450' cy='300' r='34' fill='#e3d6b8' stroke='" + ENCRE + "' stroke-width='2'/>" +
      "<text x='450' y='305' text-anchor='middle' class='plan-texte petit'>Place</text>";
    // maisons selon le stade (positions stables)
    for (var i = 0; i < st.maisons; i++) {
      var ang = alea() * Math.PI * 2, dist = 70 + alea() * 120;
      svg += maison(Math.round(450 + Math.cos(ang) * dist * 1.5), Math.round(300 + Math.sin(ang) * dist * 0.9), alea());
    }
    // quartiers
    Object.keys(QUARTIERS).forEach(function (k) {
      var q = QUARTIERS[k];
      var m = maitrise(k, etat);
      var ouvert = m.vues > 0;
      var couleur = JEU.MATIERES[q.matieres[0]].couleur;
      svg += "<g class='quartier" + (ouvert ? "" : " endormi") + "' data-quartier='" + k + "' tabindex='0' role='button' aria-label='" + q.nom + "'>" +
        "<ellipse cx='" + q.x + "' cy='" + q.y + "' rx='110' ry='56' fill='" + (ouvert ? couleur : "url(#hachure)") + "' fill-opacity='" + (ouvert ? ".14" : "1") + "' stroke='" + couleur + "' stroke-width='2' stroke-dasharray='6 4'/>";
      var places = BATIMENTS.filter(function (b) { return b.quartier === k; });
      places.forEach(function (b, j) {
        if (etat.batiments.indexOf(b.id) < 0) return;
        svg += "<g transform='translate(" + (q.x - 40 + j * 80) + "," + (q.y + 6) + ")'>" + FORMES[b.forme] + "</g>";
      });
      svg += "<text x='" + q.x + "' y='" + (q.y - 40) + "' text-anchor='middle' class='plan-texte'>" + q.nom + "</text></g>";
    });
    // cartouche du titre
    svg += "<g><rect x='20' y='18' width='250' height='54' fill='#efe6d2' stroke='" + ENCRE + "' stroke-width='2'/>" +
      "<text x='145' y='42' text-anchor='middle' class='plan-texte'>" + U.echapper(etat.reglages.nomDomaine || "Le domaine") + "</text>" +
      "<text x='145' y='62' text-anchor='middle' class='plan-texte petit'>" + st.nom + "</text></g>" +
      // rose des vents
      "<g transform='translate(840,540)'><path d='M0 -30L6 0L0 30L-6 0z' fill='" + ENCRE + "'/><path d='M-30 0L0 -6L30 0L0 6z' fill='#b08d3a'/><text y='-34' text-anchor='middle' class='plan-texte petit'>N</text></g>";
    return svg + "</svg>";
  }

  // ---------- écran ----------
  var quartierChoisi = null;

  JEU.ui.ecrans.domaine = function (s) {
    var el = JEU.ui.el;
    var etat = JEU.sauvegarde.etat();
    var st = stade(etat.batiments.length);
    s.innerHTML = "";
    s.appendChild(el("h1", { texte: "Ton domaine · " + st.nom }));
    var plan = el("div", { class: "plan-cadre", html: dessiner(etat) });
    s.appendChild(plan);
    var panneau = el("div", { class: "panneau-quartier" });
    s.appendChild(panneau);
    Array.prototype.forEach.call(plan.querySelectorAll(".quartier"), function (g) {
      function choisir() { quartierChoisi = g.getAttribute("data-quartier"); rendrePanneau(panneau, etat); }
      g.addEventListener("click", choisir);
      g.addEventListener("keydown", function (e) { if (e.key === "Enter") choisir(); });
    });
    var prochain = STADES.filter(function (x) { return x.min > etat.batiments.length; })[0];
    if (prochain) s.appendChild(el("p", { class: "note centre", texte: "Encore " + (prochain.min - etat.batiments.length) + " bâtiment" + (prochain.min - etat.batiments.length > 1 ? "s" : "") + " pour devenir " + prochain.nom.toLowerCase() + "." }));
    rendrePanneau(panneau, etat);
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
          el("span", {}, [el("b", { texte: b.nom }), el("span", { class: "note", texte: " · " + cout })]), action
        ]));
      });
      panneau.appendChild(bloc);
    });
    if (quartierChoisi) panneau.appendChild(el("button", { class: "lien", onclick: function () { quartierChoisi = null; rendrePanneau(panneau, etat); }, texte: "Voir tous les quartiers" }));
  }

  JEU.domaine = { QUARTIERS: QUARTIERS, BATIMENTS: BATIMENTS, STADES: STADES, stade: stade, maitrise: maitrise, debloque: debloque, abordable: abordable, construire: construire, dessiner: dessiner };
})(typeof window !== "undefined" ? window : globalThis);
