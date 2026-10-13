// La bataille : tower defense à double sens. Pendant la préparation, les conseillers posent des questions
// (sans chrono) : chaque bonne réponse remplit le coffre de guerre. Avec cet or, l'élève pose et améliore ses tours
// et envoie ses troupes contre le château rival. Puis il lance la vague et regarde le combat se jouer.
(function (racine) {
  "use strict";
  var JEU = racine.JEU;
  var U = JEU.util;
  var M = JEU.batailleMoteur;
  var QUESTIONS_PAR_VAGUE = 3, BONUS_SERIE = 10;
  function camp(c) { return JEU.campagne.CAMPS[c]; }

  // ---------- icônes Game-icons en Path2D (dessin sur canvas) ----------
  var chemins = {};
  function chemin(nom) {
    if (chemins[nom]) return chemins[nom];
    var corps = (JEU.GAME_ICONS && JEU.GAME_ICONS[nom]) || "";
    var r = [], m, rx = /\sd="([^"]+)"/g;
    while ((m = rx.exec(corps))) { try { r.push(new Path2D(m[1])); } catch (e) { /* rien */ } }
    chemins[nom] = r;
    return r;
  }
  function dessinerIcone(ctx, nom, x, y, t, couleur, contour) {
    var ps = chemin(nom);
    ctx.save();
    ctx.translate(x - t / 2, y - t / 2);
    ctx.scale(t / 512, t / 512);
    ps.forEach(function (p) {
      if (contour) { ctx.lineWidth = contour.largeur * 512 / t; ctx.strokeStyle = contour.couleur; ctx.lineJoin = "round"; ctx.stroke(p); }
      ctx.fillStyle = couleur; ctx.fill(p);
    });
    ctx.restore();
  }

  // ---------- décor : terrain peint, route, ponts (dessinés une fois) ----------
  var imageTerrain = null;
  function terrain(fini) {
    if (imageTerrain && imageTerrain.complete) return fini();
    imageTerrain = new Image();
    imageTerrain.onload = fini;
    imageTerrain.onerror = fini;
    imageTerrain.src = "assets/images/terrain-domaine.jpg";
  }

  function fond(carte) {
    var c = document.createElement("canvas");
    c.width = M.LARGEUR; c.height = M.HAUTEUR;
    var g = c.getContext("2d");
    g.fillStyle = "#6f7442"; g.fillRect(0, 0, c.width, c.height);
    if (imageTerrain && imageTerrain.naturalWidth) g.drawImage(imageTerrain, 0, 0, c.width, c.height);
    // route : bordure sombre, terre battue, ornières
    function trace(largeur, couleur, tirets) {
      g.beginPath();
      carte.route.forEach(function (p, i) { if (i) g.lineTo(p[0], p[1]); else g.moveTo(p[0], p[1]); });
      g.lineWidth = largeur; g.strokeStyle = couleur; g.lineCap = "round"; g.lineJoin = "round";
      g.setLineDash(tirets || []); g.stroke(); g.setLineDash([]);
    }
    g.save(); g.shadowColor = "rgba(0,0,0,.45)"; g.shadowBlur = 8; trace(44, "#4a3a22"); g.restore();
    trace(38, "#a08458");
    trace(30, "#b89a68");
    trace(2, "rgba(70,50,25,.45)", [14, 10]);
    // grain de la terre
    for (var i = 0; i < 900; i++) {
      var k = Math.floor(Math.random() * carte.route.length), p = carte.route[k];
      g.fillStyle = Math.random() < 0.5 ? "rgba(70,50,25,.18)" : "rgba(255,240,200,.14)";
      g.fillRect(p[0] + (Math.random() - 0.5) * 30, p[1] + (Math.random() - 0.5) * 30, 2, 2);
    }
    // ponts de bois
    carte.ponts.forEach(function (pt) {
      g.save(); g.translate(pt.x, pt.y); g.rotate(pt.angle);
      g.fillStyle = "rgba(0,0,0,.35)"; g.fillRect(-34, -26, 70, 54);
      for (var j = -30; j <= 30; j += 7) { g.fillStyle = j % 14 ? "#7a5230" : "#8b6038"; g.fillRect(j, -24, 6, 48); }
      g.fillStyle = "#4a3018"; g.fillRect(-32, -26, 64, 4); g.fillRect(-32, 22, 64, 4);
      g.restore();
    });
    // voile de lumière, vignette d'enluminure
    var v = g.createRadialGradient(500, 330, 200, 500, 330, 620);
    v.addColorStop(0, "rgba(255,240,200,0)"); v.addColorStop(1, "rgba(30,20,10,.55)");
    g.fillStyle = v; g.fillRect(0, 0, c.width, c.height);
    return c;
  }

  // ---------- dessin d'une image du combat ----------
  function dessiner(ctx, v) {
    var p = v.partie, carte = v.carte, t = p.temps;
    ctx.drawImage(v.fond, 0, 0);
    // ombres de nuages qui passent
    if (JEU.anim.actif()) {
      ctx.fillStyle = "rgba(20,25,10,.10)";
      for (var n = 0; n < 3; n++) {
        var nx = ((v.horloge * 12 + n * 420) % 1400) - 200;
        ctx.beginPath(); ctx.ellipse(nx, 120 + n * 190, 170, 60, 0, 0, Math.PI * 2); ctx.fill();
      }
    }
    // emplacements libres (pendant la préparation)
    if (p.phase === "preparation") {
      carte.emplacements.forEach(function (e, i) {
        if (!M.emplacementLibre(p, i)) return;
        var survol = v.survol === i;
        ctx.beginPath(); ctx.arc(e[0], e[1], 20, 0, Math.PI * 2);
        ctx.fillStyle = survol ? "rgba(226,194,114,.55)" : "rgba(239,230,210,.28)"; ctx.fill();
        ctx.setLineDash([5, 4]); ctx.lineWidth = 2; ctx.strokeStyle = survol ? "#fbe9bd" : "rgba(46,36,25,.7)"; ctx.stroke(); ctx.setLineDash([]);
        if (survol && v.choix) {
          ctx.beginPath(); ctx.arc(e[0], e[1], M.TOURS[v.choix].portee, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(251,233,189,.12)"; ctx.fill(); ctx.strokeStyle = "rgba(251,233,189,.6)"; ctx.stroke();
        }
      });
    }
    chateau(ctx, carte.route[0], v.couleurs, p.chateau, false, v);
    chateau(ctx, carte.route[carte.route.length - 1], v.adverse.couleurs, p.rival, true, v);
    // tours (les plus hautes à l'écran d'abord)
    p.toursRivales.concat(p.tours).sort(function (a, b) { return a.y - b.y; }).forEach(function (tr) { tour(ctx, tr, tr.rivale ? v.adverse.couleurs : v.couleurs, v, p); });
    // unités
    p.unites.slice().sort(function (a, b) { return a.y - b.y; }).forEach(function (u) { unite(ctx, u, u.camp === "rival" ? v.adverse.couleurs : v.couleurs); });
    // projectiles
    p.projectiles.forEach(function (pr) {
      var k = Math.min(1, pr.t / pr.duree);
      var x = pr.x0 + (pr.cx - pr.x0) * k, y = pr.y0 + (pr.cy - pr.y0) * k;
      var arc = pr.genre === "pierre" ? Math.sin(k * Math.PI) * 70 : pr.genre === "fleche" ? Math.sin(k * Math.PI) * 18 : 0;
      y -= arc;
      var ang = Math.atan2(pr.cy - pr.y0 - (pr.genre === "pierre" ? Math.cos(k * Math.PI) * 220 : 0), pr.cx - pr.x0);
      ctx.save(); ctx.translate(x, y);
      if (pr.genre === "pierre") {
        ctx.fillStyle = "rgba(0,0,0,.25)"; ctx.beginPath(); ctx.ellipse(0, arc, 6, 3, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#6d6457"; ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "#2e2419"; ctx.lineWidth = 1.5; ctx.stroke();
      } else {
        ctx.rotate(ang);
        var l = pr.genre === "carreau" ? 22 : 16;
        ctx.strokeStyle = "#2a1c0c"; ctx.lineWidth = pr.genre === "carreau" ? 3.5 : 2;
        ctx.beginPath(); ctx.moveTo(-l, 0); ctx.lineTo(0, 0); ctx.stroke();
        ctx.fillStyle = "#3a3a3a"; ctx.beginPath(); ctx.moveTo(3, 0); ctx.lineTo(-4, -3); ctx.lineTo(-4, 3); ctx.fill();
        ctx.fillStyle = pr.camp === "rival" ? "#efe6d2" : v.couleurs[1]; ctx.fillRect(-l, -2, 4, 4);
      }
      ctx.restore();
    });
    // effets
    p.effets.forEach(function (e) {
      var a = 1 - e.age / 1.2;
      if (e.genre === "touche" || e.genre === "pique") {
        if (e.age > 0.3) return;
        ctx.strokeStyle = "rgba(251,233,189," + (1 - e.age / 0.3) + ")"; ctx.lineWidth = 2;
        for (var k = 0; k < 4; k++) { var an = k * Math.PI / 2 + 0.5; ctx.beginPath(); ctx.moveTo(e.x + Math.cos(an) * 4, e.y - 10 + Math.sin(an) * 4); ctx.lineTo(e.x + Math.cos(an) * (8 + e.age * 30), e.y - 10 + Math.sin(an) * (8 + e.age * 30)); ctx.stroke(); }
      } else if (e.genre === "impact") {
        ctx.fillStyle = "rgba(120,100,70," + (0.5 * a) + ")";
        ctx.beginPath(); ctx.ellipse(e.x, e.y, e.rayon * (0.4 + e.age), e.rayon * 0.5 * (0.4 + e.age), 0, 0, Math.PI * 2); ctx.fill();
      } else if (e.genre === "chute") {
        ctx.globalAlpha = Math.max(0, a); dessinerIcone(ctx, "ecu-brise", e.x, e.y - 12 - e.age * 14, 22, e.camp === "rival" ? v.adverse.couleurs[0] : v.couleurs[0]); ctx.globalAlpha = 1;
      } else if (e.genre === "breche") {
        ctx.font = "bold 26px Cinzel, Georgia, serif"; ctx.textAlign = "center";
        ctx.lineWidth = 4; ctx.strokeStyle = "rgba(20,12,6," + a + ")"; ctx.fillStyle = (e.camp === "rival" ? "rgba(251,233,189," : "rgba(240,140,110,") + a + ")";
        ctx.strokeText("−" + e.degats, e.x, e.y - 40 - e.age * 30); ctx.fillText("−" + e.degats, e.x, e.y - 40 - e.age * 30);
      }
    });
    // pluie ou brouillard
    if (p.modificateurs.brouillard) { ctx.fillStyle = "rgba(230,230,220,.22)"; ctx.fillRect(560, 0, 440, M.HAUTEUR); }
    if (p.modificateurs.pluie && JEU.anim.actif()) {
      ctx.strokeStyle = "rgba(200,210,230,.35)"; ctx.lineWidth = 1;
      for (var r = 0; r < 120; r++) { var rx = (r * 97 + v.horloge * 300) % 1000, ry = (r * 53 + v.horloge * 700) % 660; ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(rx - 4, ry + 12); ctx.stroke(); }
    }
  }

  function chateau(ctx, pt, coul, etat, rival, v) {
    var x = pt[0], y = pt[1];
    var abime = 1 - etat.pv / etat.max;
    ctx.fillStyle = "rgba(0,0,0,.35)"; ctx.beginPath(); ctx.ellipse(x, y + 34, 66, 20, 0, 0, Math.PI * 2); ctx.fill();
    var pierre = ctx.createLinearGradient(x - 50, y - 60, x + 50, y + 40);
    pierre.addColorStop(0, "#d8ccb0"); pierre.addColorStop(1, "#8a7f70");
    dessinerIcone(ctx, "chateau", x, y - 6, 124, pierre, { largeur: 5, couleur: "#2e2419" });
    if (abime > 0.05) { ctx.globalAlpha = Math.min(0.6, abime); dessinerIcone(ctx, "chateau", x, y - 6, 124, "#2a1a10"); ctx.globalAlpha = 1; }
    // bannière qui flotte
    var bx = x + (rival ? -8 : 8), by = y - 92;
    ctx.strokeStyle = "#2e2419"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(bx, by + 40); ctx.lineTo(bx, by - 6); ctx.stroke();
    var ond = JEU.anim.actif() ? Math.sin(v.horloge * 4 + (rival ? 1 : 0)) * 4 : 0;
    var sens = rival ? -1 : 1;
    ctx.fillStyle = coul[0]; ctx.strokeStyle = "#2e2419"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(bx, by - 4); ctx.quadraticCurveTo(bx + sens * 22, by - 4 + ond, bx + sens * 42, by + ond * 0.5); ctx.lineTo(bx + sens * 30, by + 10 + ond * 0.5); ctx.lineTo(bx + sens * 42, by + 20 + ond * 0.5); ctx.quadraticCurveTo(bx + sens * 22, by + 20 + ond, bx, by + 20); ctx.closePath(); ctx.fill(); ctx.stroke();
    dessinerIcone(ctx, (rival ? v.adverse : camp("joueur")).embleme, bx + sens * 18, by + 8 + ond * 0.7, 18, coul[1]);
    // jauge de solidité
    var w = 96, jx = x - w / 2, jy = y + 50;
    ctx.fillStyle = "rgba(20,12,6,.75)"; ctx.fillRect(jx - 2, jy - 2, w + 4, 12);
    ctx.fillStyle = rival ? "#c9a14a" : "#7d9a4a"; ctx.fillRect(jx, jy, w * Math.max(0, etat.pv / etat.max), 8);
    ctx.font = "bold 13px Cinzel, Georgia, serif"; ctx.textAlign = "center"; ctx.fillStyle = "#fbe9bd"; ctx.strokeStyle = "#140c06"; ctx.lineWidth = 3;
    var txt = Math.ceil(etat.pv) + " / " + etat.max;
    ctx.strokeText(txt, x, jy + 24); ctx.fillText(txt, x, jy + 24);
  }

  function tour(ctx, tr, coul, v, p) {
    var d = tr.rivale ? null : M.TOURS[tr.type];
    var icone = tr.rivale ? (tr.type === "baliste" ? "fleches" : "archer") : d.icone;
    var x = tr.x, y = tr.y;
    if (!tr.rivale && v.choixTour === tr.emplacement) {
      ctx.beginPath(); ctx.arc(x, y, M.porteeTour(p, tr), 0, Math.PI * 2); ctx.fillStyle = "rgba(251,233,189,.12)"; ctx.fill(); ctx.strokeStyle = "rgba(251,233,189,.7)"; ctx.lineWidth = 1.5; ctx.stroke();
    }
    ctx.fillStyle = "rgba(0,0,0,.35)"; ctx.beginPath(); ctx.ellipse(x, y + 14, 24, 9, 0, 0, Math.PI * 2); ctx.fill();
    // socle de pierre crénelé
    var g = ctx.createLinearGradient(x - 20, y - 30, x + 20, y + 14);
    g.addColorStop(0, "#d8ccb0"); g.addColorStop(1, "#7e7464");
    ctx.fillStyle = g; ctx.strokeStyle = "#2e2419"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x - 18, y + 12); ctx.lineTo(x - 18, y - 22); ctx.lineTo(x - 12, y - 22); ctx.lineTo(x - 12, y - 28); ctx.lineTo(x - 4, y - 28); ctx.lineTo(x - 4, y - 22); ctx.lineTo(x + 4, y - 22); ctx.lineTo(x + 4, y - 28); ctx.lineTo(x + 12, y - 28); ctx.lineTo(x + 12, y - 22); ctx.lineTo(x + 18, y - 22); ctx.lineTo(x + 18, y + 12); ctx.closePath(); ctx.fill(); ctx.stroke();
    // écu aux couleurs du camp, avec l'arme
    ctx.fillStyle = coul[0]; ctx.beginPath(); ctx.moveTo(x - 13, y - 16); ctx.lineTo(x + 13, y - 16); ctx.lineTo(x + 13, y - 2); ctx.quadraticCurveTo(x + 13, y + 9, x, y + 13); ctx.quadraticCurveTo(x - 13, y + 9, x - 13, y - 2); ctx.closePath(); ctx.fill(); ctx.stroke();
    dessinerIcone(ctx, icone, x, y - 2, 22, coul[1]);
    // niveaux : pastilles d'or
    for (var k = 0; k < tr.niveau; k++) { ctx.fillStyle = "#e2c272"; ctx.strokeStyle = "#2e2419"; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x - 8 + k * 8, y - 34, 3.2, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
  }

  function unite(ctx, u, coul) {
    var d = u.camp === "rival" ? M.ENNEMIS[u.type] : M.TROUPES[u.type];
    var gros = u.type === "champion" || u.type === "belier" ? 1.5 : u.type === "cavaliers" ? 1.15 : 1;
    var bob = JEU.anim.actif() ? Math.abs(Math.sin(u.pas)) * 3 : 0;
    var x = u.x, y = u.y - bob;
    ctx.fillStyle = "rgba(0,0,0,.3)"; ctx.beginPath(); ctx.ellipse(u.x, u.y + 9 * gros, 10 * gros, 4 * gros, 0, 0, Math.PI * 2); ctx.fill();
    var s = 11 * gros;
    ctx.fillStyle = coul[0]; ctx.strokeStyle = "#140c06"; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(x - s, y - s); ctx.lineTo(x + s, y - s); ctx.lineTo(x + s, y); ctx.quadraticCurveTo(x + s, y + s * 0.8, x, y + s * 1.1); ctx.quadraticCurveTo(x - s, y + s * 0.8, x - s, y); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.save();
    if (u.camp === "rival") { ctx.translate(x * 2, 0); ctx.scale(-1, 1); }
    dessinerIcone(ctx, d.icone, x, y - 1, 18 * gros, coul[1]);
    ctx.restore();
    if (u.pv < u.max) {
      ctx.fillStyle = "rgba(20,12,6,.8)"; ctx.fillRect(x - 12, y - s - 8, 24, 4);
      ctx.fillStyle = u.camp === "rival" ? "#d07a5a" : "#9cc06a"; ctx.fillRect(x - 12, y - s - 8, 24 * Math.max(0, u.pv / u.max), 4);
    }
  }

  // ---------- la partie ----------
  // lieu : "domaine" (un camp adverse attaque) ou l'identifiant d'une province.
  function lancer(lieu) {
    var el = JEU.ui.el;
    var C = JEU.campagne;
    var defense = lieu === "domaine";
    var prov = defense ? null : C.province(lieu);
    var frontId = defense ? (C.etat().rival.attaque || "angleterre") : prov.front;
    var adv = C.campDe(frontId), Adv = function (t) { return C.maj1(t); };
    var niveau = defense ? Math.min(4, Math.floor(C.etat().conquises.length / 2)) : prov.niveau;
    var vagues = defense ? 3 : 4;
    var questions = JEU.recit.suite(vagues * QUESTIONS_PAR_VAGUE + 2);
    if (questions.length < QUESTIONS_PAR_VAGUE) { JEU.ui.toast("Pas encore assez de questions pour une bataille."); return; }
    terrain(function () { demarrer(); });

    function demarrer() {
      var carte = JEU.cartesBataille.carte(defense ? "domaine" : prov.carte);
      var o = C.options(niveau);
      o.vagues = vagues;
      if (defense) { o.pvRival = 12; o.pvRivalMax = 12; }
      else { o.pvRival = C.etat().provinces[lieu].pv; o.pvRivalMax = prov.pv; }
      var p = M.creer(carte, o);
      var v = { partie: p, carte: carte, fond: fond(carte), couleurs: camp("joueur").couleurs, adverse: adv, horloge: 0, survol: -1, choix: "archers", choixTour: -1, vitesse: 1 };
      var titre = defense ? "Défense du domaine contre " + adv.armee : "Bataille : " + prov.nom;
      var zone = JEU.ui.commencerPartie(titre, function () { JEU.ui.afficher("jouer"); });
      JEU.musique.humeur("guerre");
      var actif = true, iQ = 0, poseesVague = 0, serie = 0, bonnes = 0, total = 0, finie = false;

      // --- mise en page ---
      var canvas = el("canvas", { class: "td-canvas", width: String(M.LARGEUR), height: String(M.HAUTEUR), "aria-label": "Champ de bataille" });
      var ratio = Math.min(2, racine.devicePixelRatio || 1);
      canvas.width = M.LARGEUR * ratio; canvas.height = M.HAUTEUR * ratio;
      var ctx = canvas.getContext("2d");
      var hud = el("div", { class: "td-hud" });
      var cadre = el("div", { class: "td-cadre" }, [canvas, hud]);
      var conseil = el("div", { class: "td-conseil" });
      var ordres = el("div", { class: "td-ordres" });
      zone.appendChild(cadre);
      zone.appendChild(el("div", { class: "td-bas" }, [conseil, ordres]));

      function majHud() {
        hud.innerHTML = "";
        hud.appendChild(el("span", { class: "td-or", html: JEU.icones.icone("tresor", 22) + "<b>" + Math.floor(p.or) + "</b> or" }));
        hud.appendChild(el("span", { class: "td-vague", texte: p.phase === "fin" ? "Bataille terminée" : "Vague " + Math.min(p.vague + 1, p.vagues) + " / " + p.vagues + (p.phase === "vague" ? " · en cours" : " · préparation") }));
        hud.appendChild(el("span", { class: "td-revenu", texte: "Revenu : +" + p.revenu + " par vague" }));
      }

      // --- ordres : tours, troupes, lancement ---
      function majOrdres() {
        ordres.innerHTML = "";
        var prep = p.phase === "preparation";
        ordres.appendChild(el("h3", { texte: prep ? "Tes ordres" : p.phase === "vague" ? "Le combat fait rage" : "Fin de la bataille" }));
        if (prep) {
          var sel = p.tours.filter(function (t) { return t.emplacement === v.choixTour; })[0];
          if (sel) {
            var cAm = M.coutAmelioration(sel);
            ordres.appendChild(el("div", { class: "td-selection" }, [
              el("p", { texte: M.TOURS[sel.type].nom + " · niveau " + sel.niveau }),
              sel.niveau < M.AMELIORATION.max ? el("button", { class: "bouton petit", disabled: p.or < cAm, onclick: function () { if (M.ameliorerTour(p, sel.emplacement)) { JEU.sons.jouer("construction"); majTout(); } }, texte: "Améliorer · " + cAm + " or" }) : el("span", { class: "note", texte: "Niveau maximal" }),
              el("button", { class: "lien", onclick: function () { v.choixTour = -1; majOrdres(); }, texte: "Fermer" })
            ]));
          }
          ordres.appendChild(el("p", { class: "consigne", texte: "Choisis une tour, puis clique un emplacement près de la route." }));
          var lTours = el("div", { class: "td-boutons" });
          Object.keys(M.TOURS).forEach(function (k, i) {
            var d = M.TOURS[k], dispo = M.niveauArsenal(p, "tours", k) > 0;
            lTours.appendChild(el("button", { class: "td-bouton" + (v.choix === k ? " choisi" : ""), disabled: !dispo, title: dispo ? d.nom : d.nom + " : à débloquer dans l'arsenal", onclick: function () { v.choix = k; v.choixTour = -1; majOrdres(); } }, [
              el("span", { class: "td-ic", html: JEU.icones.icone(d.icone, 28) }), el("span", { class: "td-nom", texte: d.nom }), el("span", { class: "td-cout", texte: dispo ? d.cout + " or" : "verrouillée" })
            ]));
          });
          ordres.appendChild(lTours);
          ordres.appendChild(el("p", { class: "consigne", texte: "Envoie des troupes contre " + adv.chateau + " : chaque envoi augmente aussi ton revenu." }));
          var lTr = el("div", { class: "td-boutons" });
          Object.keys(M.TROUPES).forEach(function (k) {
            var d = M.TROUPES[k], dispo = M.niveauArsenal(p, "troupes", k) > 0;
            lTr.appendChild(el("button", { class: "td-bouton", disabled: !dispo || p.or < d.cout, title: dispo ? d.nom : "À débloquer dans l'arsenal", onclick: function () { if (M.envoyer(p, k)) { JEU.sons.jouer("coup"); majTout(); } } }, [
              el("span", { class: "td-ic", html: JEU.icones.icone(d.icone, 28) }), el("span", { class: "td-nom", texte: d.nom + (d.nombre > 1 ? " ×" + d.nombre : "") }), el("span", { class: "td-cout", texte: dispo ? d.cout + " or · +" + d.revenu + " revenu" : "verrouillé" })
            ]));
          });
          ordres.appendChild(lTr);
          if (p.envois.length) ordres.appendChild(el("p", { class: "td-file", texte: "Prêts à partir : " + p.envois.length + " soldat" + (p.envois.length > 1 ? "s" : "") }));
          var pret = iQ >= poseesVague + QUESTIONS_PAR_VAGUE || iQ >= questions.length;
          ordres.appendChild(el("button", { class: "bouton principal td-lancer", disabled: !pret, onclick: lancerVague, texte: pret ? "Lancer la vague (Entrée)" : "Réponds d'abord au conseil de guerre" }));
        } else if (p.phase === "vague") {
          var vit = el("div", { class: "td-vitesse" }, [1, 2, 3].map(function (n) {
            return el("button", { class: "bouton petit" + (v.vitesse === n ? " principal" : ""), onclick: function () { v.vitesse = n; majOrdres(); }, texte: "×" + n });
          }));
          ordres.appendChild(el("p", { texte: "Regarde tes tours tenir la route. Tes troupes marchent sur " + adv.chateau + "." }));
          ordres.appendChild(vit);
        }
      }

      function majTout() { majHud(); majOrdres(); }

      // --- conseil de guerre : les questions de la préparation ---
      function nouvellesDuFront() {
        if (p.vague === 0 || Math.random() > 0.45) return null;
        var n = U.hasard([
          { k: "brouillard", t: "Un brouillard épais couvre la plaine : " + adv.tours + " voient moins loin pendant cette vague." },
          { k: "pluie", t: "Une pluie battante détrempe la route : toutes les troupes marchent plus lentement pendant cette vague." },
          { k: "flechesNeuves", t: "Le forgeron a fini des flèches neuves : tes archers frappent plus fort pendant cette vague." },
          { k: "renfort", t: "Des paysans viennent consolider les murs : ton château gagne 3 points de solidité." }
        ]);
        if (n.k === "renfort") { p.chateau.pv = Math.min(p.chateau.max + 3, p.chateau.pv + 3); p.chateau.max = Math.max(p.chateau.max, p.chateau.pv); }
        else p.modificateurs[n.k] = true;
        return n.t;
      }

      function preparation() {
        poseesVague = iQ;
        JEU.mesure.debut = null; // la première question suit une vague, pas une réponse
        conseil.innerHTML = "";
        var nouv = nouvellesDuFront();
        if (nouv) conseil.appendChild(JEU.ui.recit({ nom: "Un éclaireur", icone: "trompe", texte: nouv }));
        var scene = el("div", { class: "td-question" });
        conseil.appendChild(scene);
        questionSuivante(scene);
        majTout();
      }

      function questionSuivante(scene) {
        if (iQ >= poseesVague + QUESTIONS_PAR_VAGUE || iQ >= questions.length) return conseilTermine(scene);
        var q = questions[iQ];
        JEU.ui.poserQuestion(q, scene, function (juste) {
          JEU.questions.enregistrerReponse(q, juste);
          JEU.ui.noterDerniere(q);
          iQ++; total++;
          if (juste) {
            bonnes++; serie++;
            var gain = p.orParReponse + (serie >= 3 ? BONUS_SERIE : 0);
            M.gagnerOr(p, gain);
            JEU.sons.jouer(serie >= 3 ? "coup-puissant" : "coup");
            JEU.ui.tampon(serie >= 3 ? "Coup d'éclat" : "Juste", "+" + gain + " or");
            if (serie >= 3) serie = 0;
            JEU.ui.majRessources();
            majTout();
            JEU.mesure.reponseDonnee();
            questionSuivante(scene);
          } else {
            serie = 0;
            JEU.ui.panneauErreur(q, scene, function () { JEU.mesure.reponseDonnee(); questionSuivante(scene); majTout(); });
          }
        }, { recit: JEU.recit.cadre(q, defense ? "defense" : "preparation") });
      }

      function conseilTermine(scene) {
        scene.innerHTML = "";
        scene.appendChild(el("div", { class: "td-pret" }, [
          el("p", { class: "grand", texte: "Le conseil de guerre est terminé." }),
          el("p", { texte: "Dépense ton or : pose des tours, améliore-les, envoie des troupes. Puis lance la vague." })
        ]));
        JEU.ui.clavier = function (k) {
          var n = parseInt(k, 10), types = Object.keys(M.TOURS);
          if (n >= 1 && n <= types.length && M.niveauArsenal(p, "tours", types[n - 1])) { v.choix = types[n - 1]; majOrdres(); return true; }
          if (k === "Enter") { lancerVague(); return true; }
          return false;
        };
        majOrdres();
      }

      function lancerVague() {
        if (p.phase !== "preparation" || iQ < Math.min(questions.length, poseesVague + QUESTIONS_PAR_VAGUE)) return;
        JEU.ui.clavier = null;
        v.choixTour = -1;
        M.lancerVague(p);
        JEU.sons.jouer("construction");
        conseil.innerHTML = "";
        conseil.appendChild(JEU.ui.recit({ nom: "Le capitaine", icone: "rallier", texte: defense ? Adv(adv.troupes) + " chargent ! Tes tours tiennent la route." : "Tes troupes s'élancent. " + Adv(adv.soldats) + " marchent sur ton château." }));
        majTout();
      }

      // --- clics sur le champ de bataille ---
      function point(ev) {
        var r = canvas.getBoundingClientRect();
        return { x: (ev.clientX - r.left) / r.width * M.LARGEUR, y: (ev.clientY - r.top) / r.height * M.HAUTEUR };
      }
      function emplacementSous(pt) {
        var meilleur = -1, dm = 30;
        carte.emplacements.forEach(function (e, i) { var d = Math.hypot(e[0] - pt.x, e[1] - pt.y); if (d < dm) { dm = d; meilleur = i; } });
        return meilleur;
      }
      canvas.addEventListener("pointermove", function (ev) { v.survol = emplacementSous(point(ev)); canvas.style.cursor = v.survol >= 0 && p.phase === "preparation" ? "pointer" : ""; });
      canvas.addEventListener("pointerleave", function () { v.survol = -1; });
      canvas.addEventListener("click", function (ev) {
        if (p.phase !== "preparation") return;
        var i = emplacementSous(point(ev));
        if (i < 0) return;
        if (!M.emplacementLibre(p, i)) { v.choixTour = i; majOrdres(); return; }
        if (M.poserTour(p, v.choix, i)) {
          JEU.sons.jouer("construction");
          var r = canvas.getBoundingClientRect();
          JEU.anim.eclat(r.left + carte.emplacements[i][0] / M.LARGEUR * r.width, r.top + carte.emplacements[i][1] / M.HAUTEUR * r.height, "or", 14);
          majTout();
        } else JEU.ui.toast(p.or < M.TOURS[v.choix].cout ? "Pas assez d'or : réponds au conseil de guerre." : "Impossible de bâtir ici.");
      });

      // --- boucle d'animation ---
      var avant = null, phaseAvant = p.phase;
      function boucle(t) {
        if (!actif) return;
        var dt = avant == null ? 0 : Math.min(0.05, (t - avant) / 1000);
        avant = t;
        v.horloge += dt;
        if (p.phase === "vague") {
          var reste = dt * v.vitesse;
          while (reste > 0) { var pas = Math.min(0.025, reste); M.etape(p, pas); reste -= pas; }
        } else M.etape(p, dt);
        if (p.phase !== phaseAvant) {
          var de = phaseAvant; phaseAvant = p.phase;
          if (de === "vague" && p.phase === "preparation") { JEU.sons.jouer("sceau"); JEU.ui.tampon("Vague repoussée", "+" + p.revenu + " or"); preparation(); }
          if (p.phase === "fin") bilan();
        }
        if (p.phase === "vague" && Math.floor(v.horloge * 4) !== v.dernierHud) { v.dernierHud = Math.floor(v.horloge * 4); majHud(); }
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        dessiner(ctx, v);
        racine.requestAnimationFrame(boucle);
      }

      function arreter() { actif = false; JEU.musique.humeur("paix"); }
      JEU.partie.surQuitter = function () {
        arreter();
        if (!finie) { finie = true; C.apresBataille({ lieu: lieu, front: frontId, issue: "retraite", degatsRival: p.stats.degatsRival }); }
      };

      function bilan() {
        if (finie) return;
        finie = true;
        var issue = p.fin;
        var b = { lieu: lieu, front: frontId, issue: issue, degatsRival: p.stats.degatsRival, bonnes: bonnes, total: total };
        var gains = C.apresBataille(b);
        var etat = JEU.sauvegarde.etat();
        etat.stats.parties++;
        JEU.sauvegarde.enregistrer();
        JEU.ui.majRessources();
        majTout();
        var titreB, texte;
        if (defense) {
          titreB = issue === "retraite" ? "Les murs ont cédé" : "Le domaine tient !";
          texte = issue === "retraite" ? "Tes gens se sont réfugiés dans le donjon. " + Adv(adv.armee) + " campe encore devant tes murs, mais n'a rien pris." : Adv(adv.armee) + " bat en retraite.";
        } else if (b.conquise) {
          titreB = "Victoire !"; texte = prov.nom + " est à toi. Elle te versera un tribut chaque jour.";
        } else {
          titreB = issue === "retraite" ? "Retraite en bon ordre" : Adv(adv.peuple) + " tiennent encore";
          texte = "Ton armée a porté " + p.stats.degatsRival + " coups à la place forte de " + prov.nom + ". Il lui reste " + C.etat().provinces[lieu].pv + " points de solidité : la prochaine bataille reprendra là.";
        }
        var liste = Object.keys(gains).map(function (r) { return "+" + gains[r] + " " + JEU.RESSOURCES[r].nom.toLowerCase(); }).join(", ");
        conseil.innerHTML = "";
        conseil.appendChild(el("div", { class: "bilan" + (issue !== "retraite" ? " reussi" : "") }, [
          el("h2", { texte: titreB }), el("p", { texte: texte }),
          el("p", { class: "grand", texte: bonnes + " / " + total + " bonnes réponses au conseil de guerre" }),
          el("p", { texte: liste ? "Butin : " + liste + "." : "Rien de perdu : tout ce que tu as gagné reste à toi." }),
          el("button", { class: "bouton principal", onclick: retour, texte: "Retour à la campagne (Entrée)" })
        ]));
        if (issue !== "retraite") {
          JEU.sons.jouer("validation"); JEU.mentor.feliciter();
          setTimeout(function () { var bl = conseil.querySelector(".bilan"); if (bl) { var c = JEU.anim.centre(bl); JEU.anim.eclat(c.x, c.y - 40, "feuilles", 80); } }, 30);
        }
        JEU.ui.clavier = function (k) { if (k === "Enter") { retour(); return true; } return false; };
      }
      function retour() { arreter(); JEU.ui.finirPartie(); JEU.ui.afficher("jouer"); }

      majTout();
      preparation();
      racine.requestAnimationFrame(boucle);
      JEU.bataille.enCours = p; // pour les tests de bout en bout
    }
  }

  JEU.bataille = { lancer: lancer, QUESTIONS_PAR_VAGUE: QUESTIONS_PAR_VAGUE };
})(typeof window !== "undefined" ? window : globalThis);
