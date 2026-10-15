// La bataille : tower defense à double sens. Pendant la préparation, les conseillers posent des questions
// (sans chrono) : chaque bonne réponse remplit le coffre de guerre. Avec cet or, l'élève pose et améliore ses tours
// et envoie ses troupes contre le château rival. Puis il lance la vague et regarde le combat se jouer.
(function (racine) {
  "use strict";
  var JEU = racine.JEU;
  var U = JEU.util;
  var M = JEU.batailleMoteur;
  var QUESTIONS_PAR_VAGUE = 3, BONUS_SERIE = 10;
  var GARDE_ENTREE = 700; // ms : l'Entrée qui finit la dernière question (ou un double appui) ne lance pas la vague
  var REPOS_APRES_REPONSE = 0.25; // s : pendant le conseil, le champ n'est pas redessiné juste après une réponse
  var IMAGES_CONSEIL = 8; // images par seconde du champ pendant le conseil de guerre (il ne fait que respirer)
  function camp(c) { return JEU.campagne.CAMPS[c]; }

  // ---------- petites aides de texte et de mise en page ----------
  // « de » + « Le Gué » → « du Gué » ; « à » + « Les Oliveraies » → « aux Oliveraies » ; « la » et « l' » restent.
  // Celle de la campagne sert si elle existe ; sinon, la même règle ici.
  function avecArticle(nom, prep) {
    if (JEU.campagne && JEU.campagne.avecArticle) return JEU.campagne.avecArticle(nom, prep);
    var m = /^(le|les|la) (.+)$/i.exec(nom);
    if (m) {
      var art = m[1].toLowerCase();
      if (art === "la") return prep + " la " + m[2];
      return (prep === "à" ? (art === "les" ? "aux " : "au ") : (art === "les" ? "des " : "du ")) + m[2];
    }
    if (/^l['’]/i.test(nom)) return prep + " l" + nom.slice(1);
    return prep + " " + nom;
  }
  function pluriel(n, mot) { return n + " " + mot + (n >= 2 ? "s" : ""); }
  // « verrouillé » accordé au nom du bouton : la Tour d'archers, la Palissade, la Baliste, la Tour de siège (féminin) ;
  // le Trébuchet (masculin) ; les Fantassins, les Cavaliers (masculin pluriel).
  var GENRES = { archers: "f", piquiers: "f", baliste: "f", catapulte: "m", fantassins: "mp", cavaliers: "mp", belier: "f" };
  function verrouille(type) {
    var g = GENRES[type] || "m";
    return "verrouill" + (g.charAt(0) === "f" ? "ée" : "é") + (g.charAt(1) === "p" ? "s" : "");
  }

  // Fait défiler la page pour montrer « elem » sous le bandeau collant. mode « proche » : seulement s'il dépasse.
  // Défilement immédiat : un clic juste après tombe là où l'élève le voit.
  // Dans la colonne de droite qui défile à part (grand écran) : la page amène d'abord la colonne à sa place collante
  // (toute la colonne dans la fenêtre), puis c'est la colonne qui défile.
  // Le haut de la fenêtre est caché par le bandeau, et sur grand écran par la barre de la partie (titre et
  // « Quitter »), collante elle aussi sous le bandeau.
  function montrer(elem, mode) {
    if (!elem || !elem.isConnected || !racine.scrollBy) return;
    var bandeau = document.getElementById("bandeau"), barre = document.querySelector("#ecran-partie > .barre-partie");
    var haut = bandeau ? bandeau.getBoundingClientRect().height : 0, vue = racine.innerHeight;
    if (barre && racine.getComputedStyle(barre).position === "sticky") haut += barre.getBoundingClientRect().height;
    // l'écran qui vient de s'ouvrir glisse encore de quelques pixels (animation d'entrée) : sa position finale compte
    var ecran = elem.closest ? elem.closest(".ecran") : null, glisse = 0;
    if (ecran) { var m = /matrix\(([^)]+)\)/.exec(racine.getComputedStyle(ecran).transform || ""); if (m) glisse = parseFloat(m[1].split(",")[5]) || 0; }
    haut += glisse; vue += glisse;
    var col = elem.closest ? elem.closest(".td-bas") : null;
    if (col && col !== elem && col.scrollHeight > col.clientHeight + 1 && /auto|scroll/.test(racine.getComputedStyle(col).overflowY)) {
      var rc = col.getBoundingClientRect(), dc;
      if (rc.top > haut + 10 || rc.bottom > vue + 1) { racine.scrollBy(0, rc.top - haut - 6); rc = col.getBoundingClientRect(); }
      var h0 = Math.max(rc.top, haut), b0 = Math.min(rc.bottom, vue), re = elem.getBoundingClientRect();
      if (mode === "proche") {
        if (re.top >= h0 && re.bottom <= b0) return;
        dc = re.top < h0 || re.height > b0 - h0 ? re.top - h0 - 4 : re.bottom - b0 + 4;
      } else dc = re.top - h0 - 4;
      col.scrollTop += dc;
      return;
    }
    var r = elem.getBoundingClientRect(), dy;
    if (mode === "proche") {
      if (r.top >= haut && r.bottom <= vue) return;
      dy = r.top < haut || r.height > vue - haut ? r.top - haut - 8 : r.bottom - vue + 8;
    } else dy = r.top - haut - 8;
    if (Math.abs(dy) >= 2) racine.scrollBy(0, dy);
  }

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

  // ---------- images pré-calculées (rendu 3D, liste dans assets/images/td/sprites.js) ----------
  // Chaque image est chargée une seule fois et gardée d'une bataille à l'autre. Une image en échec le reste :
  // l'élément est alors dessiné à l'ancienne (dessin vectoriel), et la bataille se joue quand même.
  // Le fond peint d'avant ne sert que de repli, si le terrain d'une carte manque.
  var AUTRES = { "terrain-peint": { src: "assets/images/terrain-domaine.jpg", w: 1000, h: 660, ax: 0, ay: 0, frames: 1 } };
  var images = {}; // nom → { img, s (taille et ancrage), etat : "charge", "ok" ou "echec", attente : fonctions à rappeler }
  function descr(nom) { return (JEU.SPRITES && JEU.SPRITES[nom]) || AUTRES[nom] || null; }
  function prete(nom) { var e = images[nom]; return e && e.etat === "ok" ? e : null; }

  // Charge les images « noms » (celles déjà chargées ou en échec sont sautées), puis appelle fini une fois.
  function charger(noms, fini) {
    var reste = 1, fait = false;
    function un() { if (--reste === 0 && !fait) { fait = true; fini(); } }
    noms.forEach(function (nom) {
      var s = descr(nom), e = images[nom];
      if (!s || (e && e.etat !== "charge")) return;
      reste++;
      if (e) { e.attente.push(un); return; } // déjà demandée par une autre bataille : on attend la même
      e = images[nom] = { img: new Image(), s: s, etat: "charge", attente: [un] };
      function termine(ok) {
        if (e.etat !== "charge") return;
        e.etat = ok ? "ok" : "echec";
        var a = e.attente; e.attente = [];
        a.forEach(function (f) { f(); });
      }
      e.img.onload = function () {
        // décodée d'avance : son premier dessin ne fait pas attendre la page
        if (e.img.decode) e.img.decode().then(function () { termine(true); }, function () { termine(e.img.naturalWidth > 0); });
        else termine(true);
      };
      e.img.onerror = function () { termine(false); };
      e.img.src = s.src;
    });
    un();
  }

  // Les images d'une bataille : terrain de la carte, places fortes et tours des deux camps (avec leurs ombres),
  // troupes, projectiles et effets.
  function imagesDeBataille(terrain, campAdv) {
    var n = [terrain, "effet-fleche", "effet-carreau", "effet-pierre", "effet-poussiere", "effet-eclats"];
    ["intact", "abime", "ruine"].forEach(function (e) {
      ["france", campAdv].forEach(function (c) { n.push("place-" + c + "-" + e, "ombre-place-" + c + "-" + e); });
    });
    Object.keys(M.TOURS).forEach(function (t) {
      for (var k = 1; k <= M.AMELIORATION.max; k++) n.push("tour-" + t + "-france-" + k, "ombre-tour-" + t + "-france-" + k);
    });
    Object.keys(M.TOURS_RIVALES).forEach(function (t) { n.push("tour-" + t + "-" + campAdv + "-1", "ombre-tour-" + t + "-" + campAdv + "-1"); });
    Object.keys(M.TROUPES).forEach(function (t) { n.push("unite-" + t + "-france"); });
    Object.keys(M.ENNEMIS).forEach(function (t) { n.push("unite-" + t + "-" + campAdv); });
    return n;
  }

  // Dessine l'image « nom » avec son point d'ancrage en (x, y) : vue k d'une bande (k est ramené dans la bande),
  // miroir (image retournée), echelle facultative. Renvoie false si l'image manque : l'appelant dessine alors la
  // version vectorielle.
  function sprite(ctx, nom, x, y, k, miroir, echelle) {
    var e = images[nom];
    if (!e || e.etat !== "ok") return false;
    var s = e.s, n = s.frames || 1, iw = e.img.naturalWidth / n, ih = e.img.naturalHeight;
    var f = n > 1 ? ((Math.floor(k) % n) + n) % n : 0, sc = echelle || 1;
    if (miroir) {
      ctx.save(); ctx.translate(x, y); ctx.scale(-sc, sc);
      ctx.drawImage(e.img, f * iw, 0, iw, ih, -s.ax, -s.ay, s.w, s.h);
      ctx.restore();
    } else ctx.drawImage(e.img, f * iw, 0, iw, ih, x - s.ax * sc, y - s.ay * sc, s.w * sc, s.h * sc);
    return true;
  }
  // Vue d'un effet joué une seule fois : de 0 à n − 1 pendant « duree » secondes.
  function vue(age, duree, n) { return Math.min(n - 1, Math.floor(age / duree * n)); }

  // intact au-dessus de la moitié de la solidité, abîmée tant qu'il en reste, ruine à zéro
  function nomPlace(c, etat) { return "place-" + c + "-" + (etat.pv > etat.max / 2 ? "intact" : etat.pv > 0 ? "abime" : "ruine"); }
  // tours du joueur : type et niveau ; tours rivales : celles du camp adverse, au niveau 1
  function nomTour(tr, v) { return tr.rivale ? "tour-" + tr.type + "-" + v.campAdverse + "-1" : "tour-" + tr.type + "-france-" + tr.niveau; }
  function nomUnite(u, v) { return "unite-" + u.type + "-" + (u.camp === "rival" ? v.campAdverse : "france"); }

  // ---------- décor : le terrain de la carte, calculé une fois par bataille (et à chaque changement de netteté) ----------
  // Route, rivière, ponts et gué sont déjà dans l'image du terrain rendu en 3D (terrain-<carte>, ou sa variante -sud) :
  // c'est la seule image qui compte comme « route dessinée ». Sans elle (repli) : l'ancien fond peint (sa rivière est
  // le ruisseau de référence) ou, s'il manque aussi, le ruisseau de la carte dessiné ici ; puis la route, les ponts et
  // le gué dessinés par-dessus. La toile rendue porte routeTracee (vrai en repli) : l'essai de bout en bout le vérifie.
  // terrain : nom de l'image (« terrain-col-sud » sur le front du sud, « terrain-col », ou « terrain-peint »).
  function fond(carte, ratio, terrain) {
    var c = document.createElement("canvas");
    c.width = Math.round(M.LARGEUR * ratio); c.height = Math.round(M.HAUTEUR * ratio);
    var g = c.getContext("2d");
    g.scale(ratio, ratio);
    var t = terrain && terrain !== "terrain-peint" ? prete(terrain) : null;
    c.routeTracee = !t;
    if (t) { g.drawImage(t.img, 0, 0, M.LARGEUR, M.HAUTEUR); vignette(g, 0.42); return c; }
    g.fillStyle = "#6f7442"; g.fillRect(0, 0, M.LARGEUR, M.HAUTEUR);
    var CB = JEU.cartesBataille, ancien = prete("terrain-peint"), eau, traversees;
    if (ancien) {
      // le fond peint a sa rivière, toujours au même endroit : les traversées sont là où la route la croise
      g.drawImage(ancien.img, 0, 0, M.LARGEUR, M.HAUTEUR);
      eau = CB.RIVIERE;
      traversees = croisements(carte.route, eau);
    } else {
      eau = carte.riviere || CB.RIVIERE;
      riviere(g, eau, carte.rive || 11);
      traversees = carte.ponts.map(function (p) { return { x: p.x, y: p.y, angle: p.angle }; });
    }
    // la traversée passée à gué (le Gué) garde son numéro, dans l'ordre de la route
    var iGue = ((CB.LIEUX && CB.LIEUX[carte.id]) || {}).gue;
    if (iGue !== undefined && traversees[iGue]) traversees[iGue].gue = true;
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
    // grain de la terre (toujours le même tirage : le fond recalculé à une autre netteté ne change pas)
    for (var i = 0; i < 900; i++) {
      var k = Math.floor(hasard(i) * carte.route.length), p = carte.route[k];
      g.fillStyle = hasard(i + 1000) < 0.5 ? "rgba(70,50,25,.18)" : "rgba(255,240,200,.14)";
      g.fillRect(p[0] + (hasard(i + 2000) - 0.5) * 30, p[1] + (hasard(i + 3000) - 0.5) * 30, 2, 2);
    }
    // ponts de bois, ou gué de galets
    traversees.forEach(function (pt) { if (pt.gue) gue(g, pt, carte.rive || 11); else pont(g, pt); });
    vignette(g, 0.55);
    return c;
  }
  function hasard(n) { var h = Math.sin(n * 12.9898 + 4.1) * 43758.5453; return h - Math.floor(h); } // toujours le même tirage
  // Points où la route croise une rivière (dans l'ordre de la route), avec l'angle de la route à cet endroit.
  function croisements(route, eau) {
    var r = [];
    for (var i = 1; i < route.length; i++) {
      var a = route[i - 1], b = route[i];
      for (var j = 1; j < eau.length; j++) {
        var c = eau[j - 1], d = eau[j];
        var den = (b[0] - a[0]) * (d[1] - c[1]) - (b[1] - a[1]) * (d[0] - c[0]);
        if (!den) continue;
        var u = ((c[0] - a[0]) * (d[1] - c[1]) - (c[1] - a[1]) * (d[0] - c[0])) / den;
        var w = ((c[0] - a[0]) * (b[1] - a[1]) - (c[1] - a[1]) * (b[0] - a[0])) / den;
        if (u >= 0 && u <= 1 && w >= 0 && w <= 1) r.push({ x: a[0] + u * (b[0] - a[0]), y: a[1] + u * (b[1] - a[1]), angle: Math.atan2(b[1] - a[1], b[0] - a[0]) });
      }
    }
    return r;
  }
  // Ruisseau de la carte (repli sans aucune image de fond) : berge sombre, eau, reflet.
  function riviere(g, eau, rive) {
    function trace(largeur, couleur) {
      g.beginPath();
      eau.forEach(function (p, i) { if (i) g.lineTo(p[0], p[1]); else g.moveTo(p[0], p[1]); });
      g.lineWidth = largeur; g.strokeStyle = couleur; g.lineCap = "round"; g.lineJoin = "round"; g.stroke();
    }
    trace(2 * rive + 8, "#4d5530");
    trace(2 * rive, "#4e6d74");
    trace(Math.max(2, rive * 0.6), "rgba(190,214,220,.28)");
  }
  function pont(g, pt) {
    g.save(); g.translate(pt.x, pt.y); g.rotate(pt.angle);
    g.fillStyle = "rgba(0,0,0,.35)"; g.fillRect(-34, -26, 70, 54);
    for (var j = -30; j <= 30; j += 7) { g.fillStyle = j % 14 ? "#7a5230" : "#8b6038"; g.fillRect(j, -24, 6, 48); }
    g.fillStyle = "#4a3018"; g.fillRect(-32, -26, 64, 4); g.fillRect(-32, 22, 64, 4);
    g.restore();
  }
  // Gué : l'eau peu profonde passe sur la route, des galets clairs la traversent.
  function gue(g, pt, rive) {
    var l = rive + 6;
    g.save(); g.translate(pt.x, pt.y); g.rotate(pt.angle);
    g.beginPath(); g.ellipse(0, 0, l, 27, 0, 0, Math.PI * 2);
    g.fillStyle = "rgba(78,109,116,.78)"; g.fill();
    g.lineWidth = 2; g.strokeStyle = "rgba(200,220,225,.35)"; g.stroke();
    for (var i = 0; i < 26; i++) {
      var x = (hasard(i + 500) - 0.5) * 1.6 * l, y = (hasard(i + 600) - 0.5) * 46, r = 2.2 + 2.6 * hasard(i + 700);
      if ((x * x) / (l * l) + (y * y) / (27 * 27) > 0.8) continue;
      g.beginPath(); g.ellipse(x, y, r * 1.2, r, hasard(i + 800) * 3, 0, Math.PI * 2);
      g.fillStyle = hasard(i + 900) < 0.5 ? "#c9c0ad" : "#a99f8c"; g.fill();
      g.lineWidth = 0.8; g.strokeStyle = "rgba(40,34,26,.6)"; g.stroke();
    }
    g.restore();
  }
  // voile de lumière au centre, bords assombris comme une enluminure
  function vignette(g, force) {
    var v = g.createRadialGradient(500, 330, 200, 500, 330, 620);
    v.addColorStop(0, "rgba(255,240,200,0)"); v.addColorStop(1, "rgba(30,20,10," + force + ")");
    g.fillStyle = v; g.fillRect(0, 0, M.LARGEUR, M.HAUTEUR);
  }

  // Marque d'un emplacement libre : un anneau de dalles usées posé à plat sur l'herbe (vue de trois quarts),
  // bien lisible sur le terrain réaliste. Dorée au survol. Calculée une fois par netteté de la toile (seules celles
  // de la netteté en cours sont gardées).
  var marques = {}, MARQUE = 64;
  function marque(survol, ratio) {
    if (marques.ratio !== ratio) marques = { ratio: ratio };
    var cle = survol ? "s" : "n";
    if (marques[cle]) return marques[cle];
    var c = document.createElement("canvas");
    c.width = c.height = Math.ceil(MARQUE * ratio);
    var g = c.getContext("2d");
    g.scale(ratio, ratio); g.translate(MARQUE / 2, MARQUE / 2);
    var RX = 22, RY = 15.5, rx = 13.5, ry = 9.5, N = 11, i, k;
    function ellipse(a, b) { g.beginPath(); g.ellipse(0, 0, a, b, 0, 0, Math.PI * 2); }
    // ombre douce sous l'anneau (ou lueur dorée au survol)
    g.save();
    g.shadowColor = survol ? "rgba(255,226,150,.95)" : "rgba(0,0,0,.55)"; g.shadowBlur = survol ? 9 : 5; g.shadowOffsetY = survol ? 0 : 1.5;
    ellipse(RX, RY); g.fillStyle = survol ? "rgba(240,208,120,.45)" : "rgba(38,28,16,.42)"; g.fill();
    g.restore();
    // terre battue au milieu, où l'herbe transparaît encore
    var t = g.createRadialGradient(0, 0, 1, 0, 0, rx + 1);
    t.addColorStop(0, survol ? "rgba(226,190,112,.75)" : "rgba(118,94,60,.6)"); t.addColorStop(1, survol ? "rgba(200,160,90,.6)" : "rgba(84,66,42,.45)");
    g.save(); g.scale(1, ry / rx); g.beginPath(); g.arc(0, 0, rx + 1, 0, Math.PI * 2); g.fillStyle = t; g.fill(); g.restore();
    // dalles usées de l'anneau : tailles, teintes et joints un peu irréguliers
    var teintes = survol ? ["#efdcaa", "#e2cc93", "#f6e6bb", "#d9c18a", "#e8d39c"] : ["#b9ac90", "#a69a7e", "#c6baa0", "#ab9e83", "#9d917a"];
    g.lineJoin = "round";
    for (i = 0; i < N; i++) {
      var a0 = (i + 0.06 + 0.08 * hasard(i)) * 2 * Math.PI / N, a1 = (i + 0.94 - 0.08 * hasard(i + 50)) * 2 * Math.PI / N;
      var fo = 0.97 + 0.07 * hasard(i + 100), fi = 0.97 + 0.08 * hasard(i + 150);
      g.beginPath();
      for (k = 0; k <= 4; k++) { var ao = a0 + (a1 - a0) * k / 4; g.lineTo(Math.cos(ao) * RX * fo, Math.sin(ao) * RY * fo); }
      for (k = 4; k >= 0; k--) { var ai = a0 + (a1 - a0) * k / 4; g.lineTo(Math.cos(ai) * (rx + 0.5) * fi, Math.sin(ai) * (ry + 0.4) * fi); }
      g.closePath();
      g.fillStyle = teintes[Math.floor(hasard(i + 200) * teintes.length)]; g.fill();
      g.lineWidth = 0.9; g.strokeStyle = "rgba(46,34,20,.72)"; g.stroke();
    }
    // relief : lumière en haut, ombre en bas, sur les dalles seulement
    g.globalCompositeOperation = "source-atop";
    var l = g.createLinearGradient(0, -RY, 0, RY);
    l.addColorStop(0, "rgba(255,248,225,.28)"); l.addColorStop(0.55, "rgba(255,248,225,0)"); l.addColorStop(1, "rgba(0,0,0,.28)");
    g.fillStyle = l; g.fillRect(-RX - 2, -RY - 2, 2 * RX + 4, 2 * RY + 4);
    g.globalCompositeOperation = "source-over";
    if (survol) { ellipse(RX + 1.5, RY + 1.5); g.lineWidth = 2; g.strokeStyle = "#fbe9bd"; g.stroke(); }
    marques[cle] = c;
    return c;
  }

  // Ombre d'un nuage qui passe (ambiance), calculée une fois.
  var nuage = null;
  function ombreNuage() {
    if (nuage) return nuage;
    nuage = document.createElement("canvas"); nuage.width = 360; nuage.height = 140;
    var g = nuage.getContext("2d");
    g.translate(180, 70); g.scale(1, 140 / 360);
    var r = g.createRadialGradient(0, 0, 0, 0, 0, 180);
    r.addColorStop(0, "rgba(12,18,8,.17)"); r.addColorStop(0.6, "rgba(12,18,8,.10)"); r.addColorStop(1, "rgba(12,18,8,0)");
    g.fillStyle = r; g.beginPath(); g.arc(0, 0, 180, 0, Math.PI * 2); g.fill();
    return nuage;
  }

  // ---------- dessin d'une image du combat ----------
  // Passe « sol » (ombres portées, emplacements, portées), puis volumes triés de haut en bas de l'écran
  // (places fortes, tours, troupes), puis projectiles, effets, météo et jauges.
  var volumes = []; // réutilisé d'une image à l'autre
  // Profondeur : le pied de l'objet. Une place forte est triée sur le pied de sa façade (36 px sous son ancrage) :
  // son mur de face cache les troupes qui passent derrière elle. Une troupe sur le seuil de sa porte (moins de
  // PRES_PORTE px) est devant la façade : elle est dessinée après la place forte.
  function prof(o) { return o.prof !== undefined ? o.prof : o.y; }
  function parProfondeur(a, b) { return prof(a) - prof(b); }
  var FACADE = 36, PRES_PORTE = 46;
  var HAUT_TIR = 24, HAUT_CORPS = 12; // px : départ des traits au-dessus du pied de la tour, impact à mi-corps

  function dessiner(ctx, v) {
    var p = v.partie, carte = v.carte, anim = JEU.anim.actif(), i, tr, e;
    ctx.drawImage(v.fond, 0, 0, M.LARGEUR, M.HAUTEUR);

    // --- sol : ombres portées des places fortes et des tours ---
    sprite(ctx, "ombre-" + nomPlace("france", p.chateau), v.depart.x, v.depart.y, 0);
    sprite(ctx, "ombre-" + nomPlace(v.campAdverse, p.rival), v.arrivee.x, v.arrivee.y, 0);
    for (i = 0; i < p.toursRivales.length; i++) { tr = p.toursRivales[i]; sprite(ctx, "ombre-" + nomTour(tr, v), tr.x, tr.y, 0); }
    for (i = 0; i < p.tours.length; i++) { tr = p.tours[i]; sprite(ctx, "ombre-" + nomTour(tr, v), tr.x, tr.y, 0); }
    // portée des tours adverses (préparation) : celle qu'on survole, ou toutes quand on choisit des troupes à envoyer
    var hautPortee = M.HAUTEUR; // haut du plus haut cercle de portée : le bandeau d'or pâlit s'il le cache
    if (p.phase === "preparation") {
      for (i = 0; i < p.toursRivales.length; i++) {
        tr = p.toursRivales[i];
        if (v.porteesRivales || v.survolRivale === i) hautPortee = Math.min(hautPortee, cercle(ctx, tr.x, tr.y, M.porteeTour(p, tr), v.porteeAdverse));
      }
    }
    // emplacements libres (pendant la préparation), portée de la tour choisie au survol
    if (p.phase === "preparation") {
      for (i = 0; i < carte.emplacements.length; i++) {
        if (!M.emplacementLibre(p, i)) continue;
        e = carte.emplacements[i];
        var survol = v.survol === i || v.curseur === i;
        ctx.drawImage(marque(survol, v.ratio), e[0] - MARQUE / 2, e[1] - MARQUE / 2, MARQUE, MARQUE);
        if (survol && v.choix) hautPortee = Math.min(hautPortee, cercle(ctx, e[0], e[1], M.TOURS[v.choix].portee));
      }
    }
    // tour sélectionnée : sa portée, un anneau doré à son pied
    for (i = 0; i < p.tours.length; i++) {
      tr = p.tours[i];
      if (v.choixTour !== tr.emplacement) continue;
      hautPortee = Math.min(hautPortee, cercle(ctx, tr.x, tr.y, M.porteeTour(p, tr)));
      anneau(ctx, tr.x, tr.y, 26, 2.5);
    }
    var discret = hautPortee < 52;
    if (discret !== v.hudDiscret) { v.hudDiscret = discret; if (v.hud) v.hud.classList.toggle("discret", discret); }
    // curseur du clavier : un anneau doré autour de l'emplacement choisi avec les flèches
    if (p.phase === "preparation" && v.curseur >= 0) {
      var ec = carte.emplacements[v.curseur];
      anneau(ctx, ec[0], ec[1], 30 + (anim ? 2 * Math.sin(v.horloge * 5) : 0), 3);
    }
    // ombres des pierres en vol
    for (i = 0; i < p.projectiles.length; i++) {
      var pr = p.projectiles[i];
      if (pr.genre !== "pierre") continue;
      var kk = Math.min(1, pr.t / pr.duree), haut = Math.sin(kk * Math.PI);
      ctx.fillStyle = "rgba(0,0,0," + (0.34 - 0.18 * haut) + ")";
      ctx.beginPath(); ctx.ellipse(pr.x0 + (pr.cx - pr.x0) * kk, pr.y0 + 18 + (pr.cy - pr.y0 - 18) * kk, 6 - 2 * haut, 3 - haut, 0, 0, Math.PI * 2); ctx.fill();
    }
    // ombres de nuages qui passent
    if (anim) {
      var nu = ombreNuage();
      for (var n = 0; n < 3; n++) ctx.drawImage(nu, ((v.horloge * 12 + n * 420) % 1400) - 380, 50 + n * 190, 360, 140);
    }

    // --- volumes : places fortes, tours, troupes, du haut de l'écran vers le bas ---
    volumes.length = 0;
    volumes.push(v.piedDepart, v.piedArrivee);
    for (i = 0; i < p.toursRivales.length; i++) volumes.push(p.toursRivales[i]);
    for (i = 0; i < p.tours.length; i++) volumes.push(p.tours[i]);
    for (i = 0; i < p.unites.length; i++) {
      var un = p.unites[i];
      un.prof = un.y;
      if (Math.hypot(un.x - v.porteDepart.x, un.y - v.porteDepart.y) < PRES_PORTE) un.prof = Math.max(un.y, v.piedDepart.y + 0.5);
      else if (Math.hypot(un.x - v.porteArrivee.x, un.y - v.porteArrivee.y) < PRES_PORTE) un.prof = Math.max(un.y, v.piedArrivee.y + 0.5);
      volumes.push(un);
    }
    volumes.sort(parProfondeur);
    for (i = 0; i < volumes.length; i++) {
      var o = volumes[i];
      if (o === v.piedDepart) place(ctx, v, false);
      else if (o === v.piedArrivee) place(ctx, v, true);
      else if (o.emplacement !== undefined) tour(ctx, o, v);
      else unite(ctx, o, v);
    }

    // --- projectiles : flèches et carreaux tournés le long de leur trajectoire, pierres en cloche ---
    for (i = 0; i < p.projectiles.length; i++) projectile(ctx, p.projectiles[i], v);

    // --- effets ---
    for (i = 0; i < p.effets.length; i++) {
      e = p.effets[i];
      var a = 1 - e.age / 1.2;
      if (e.genre === "touche" || e.genre === "pique") {
        // coup porté à un soldat : une petite bouffée de terre (et, pour un trait, un éclat de lumière), sans sang
        if (prete("effet-poussiere")) {
          if (e.age < 0.45) sprite(ctx, "effet-poussiere", e.x, e.y + 2, vue(e.age, 0.45, 5), false, e.genre === "pique" ? 0.5 : 0.4);
          if (e.genre === "touche" && e.age < 0.16) {
            ctx.globalAlpha = 1 - e.age / 0.16;
            ctx.drawImage(eclatLumiere(), e.x - 9, e.y - HAUT_CORPS * 1.2 - 9, 18, 18);
            ctx.globalAlpha = 1;
          }
        } else if (e.age < 0.32) {
          ctx.strokeStyle = "rgba(251,233,189," + Math.max(0, 1 - e.age / 0.3) + ")"; ctx.lineWidth = 2;
          for (var k = 0; k < 4; k++) { var an = k * Math.PI / 2 + 0.5; ctx.beginPath(); ctx.moveTo(e.x + Math.cos(an) * 4, e.y - 10 + Math.sin(an) * 4); ctx.lineTo(e.x + Math.cos(an) * (8 + e.age * 30), e.y - 10 + Math.sin(an) * (8 + e.age * 30)); ctx.stroke(); }
        }
      } else if (e.genre === "impact") {
        if (prete("effet-poussiere")) { if (e.age < 0.75) sprite(ctx, "effet-poussiere", e.x, e.y + 4, vue(e.age, 0.75, 5), false, Math.max(1, e.rayon / 32)); }
        else {
          ctx.fillStyle = "rgba(120,100,70," + (0.5 * a) + ")";
          ctx.beginPath(); ctx.ellipse(e.x, e.y, e.rayon * (0.4 + e.age), e.rayon * 0.5 * (0.4 + e.age), 0, 0, Math.PI * 2); ctx.fill();
        }
        if (e.age < 0.32) sprite(ctx, "effet-eclats", e.x, e.y - 4, vue(e.age, 0.32, 4), false, 1.3);
      } else if (e.genre === "retrait") {
        // fin de bataille : la troupe restée sur la route s'efface dans une petite bouffée de poussière
        if (e.age < 0.6) sprite(ctx, "effet-poussiere", e.x, e.y + 2, vue(e.age, 0.6, 5), false, 0.6);
      } else if (e.genre === "chute") {
        if (prete("effet-poussiere")) { if (e.age < 0.6) sprite(ctx, "effet-poussiere", e.x, e.y + 2, vue(e.age, 0.6, 5), false, 0.75); }
        else { ctx.globalAlpha = Math.max(0, a); dessinerIcone(ctx, "ecu-brise", e.x, e.y - 12 - e.age * 14, 22, e.camp === "rival" ? v.adverse.couleurs[0] : v.couleurs[0]); ctx.globalAlpha = 1; }
      } else if (e.genre === "breche") {
        if (e.age < 0.8) sprite(ctx, "effet-poussiere", e.x, e.y + 4, vue(e.age, 0.8, 5), false, 1.2);
        if (e.age < 0.32) sprite(ctx, "effet-eclats", e.x, e.y - 10, vue(e.age, 0.32, 4), false, 1.3);
        // le chiffre flotte au-dessus de la place forte touchée (et de sa jauge si elle est au-dessus), jamais sur ses murs
        var touchee = e.camp === "rival" ? v.placeArrivee : v.placeDepart;
        var ty = touchee.hautLibre - e.age * 30;
        ctx.font = "bold 30px Cinzel, Georgia, serif"; ctx.textAlign = "center";
        ctx.lineWidth = 5; ctx.lineJoin = "round"; ctx.strokeStyle = "rgba(20,12,6," + a + ")";
        ctx.fillStyle = (e.camp === "rival" ? "rgba(255,215,94," : "rgba(255,122,92,") + a + ")"; // or vif : le château adverse ; rouge clair : le tien
        ctx.strokeText("−" + e.degats, touchee.chiffreX, ty); ctx.fillText("−" + e.degats, touchee.chiffreX, ty);
      }
    }

    // --- pluie ou brouillard ---
    if (p.modificateurs.brouillard) { ctx.fillStyle = v.brume; ctx.fillRect(520, 0, 480, M.HAUTEUR); }
    if (p.modificateurs.pluie && anim) {
      ctx.strokeStyle = "rgba(200,210,230,.35)"; ctx.lineWidth = 1; ctx.beginPath();
      for (var r = 0; r < 120; r++) { var rx = (r * 97 + v.horloge * 300) % 1000, ry = (r * 53 + v.horloge * 700) % 660; ctx.moveTo(rx, ry); ctx.lineTo(rx - 4, ry + 12); }
      ctx.stroke();
    }

    // --- jauges de solidité, au-dessus de la mêlée, du côté de la place forte où la route ne passe pas ---
    jauge(ctx, v, false);
    jauge(ctx, v, true);
  }

  // Éclat de lumière d'un trait qui touche (petite étoile chaude), calculé une fois.
  var eclat = null;
  function eclatLumiere() {
    if (eclat) return eclat;
    eclat = document.createElement("canvas"); eclat.width = eclat.height = 36;
    var g = eclat.getContext("2d");
    g.translate(18, 18);
    var r = g.createRadialGradient(0, 0, 0, 0, 0, 12);
    r.addColorStop(0, "rgba(255,250,225,.95)"); r.addColorStop(0.35, "rgba(255,226,150,.55)"); r.addColorStop(1, "rgba(255,210,120,0)");
    g.fillStyle = r; g.beginPath(); g.arc(0, 0, 12, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "rgba(255,246,214,.9)"; g.lineCap = "round";
    for (var k = 0; k < 4; k++) {
      var an = k * Math.PI / 2 + Math.PI / 4, l = k % 2 ? 11 : 16;
      g.lineWidth = 2; g.beginPath(); g.moveTo(Math.cos(an) * 3, Math.sin(an) * 3); g.lineTo(Math.cos(an) * l, Math.sin(an) * l); g.stroke();
    }
    return eclat;
  }

  // Cercle de portée (distance réelle du jeu : un cercle, pas une ellipse).
  // Tes tours : même recette que anneau(), un trait sombre dessous, puis le trait crème en longs tirets (on ne le
  // confond pas avec un chemin), sur un voile léger.
  // Tours adverses (adverse : couleur de portée du camp adverse, CAMPS.x.portee, rouge sombre) : un motif à elles,
  // des points courts posés sur un trait clair (lisible sur l'herbe sombre comme sur l'herbe sèche), et un voile un
  // peu plus dense de la même couleur. Jamais crème : on ne la confond pas avec la portée de tes tours.
  function cercle(ctx, x, y, r, adverse) {
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
    if (adverse) {
      ctx.globalAlpha = 0.2; ctx.fillStyle = adverse; ctx.fill(); ctx.globalAlpha = 1;
      ctx.lineWidth = 5; ctx.strokeStyle = "rgba(20,12,6,.45)"; ctx.stroke();
      ctx.lineWidth = 3; ctx.strokeStyle = "rgba(246,226,196,.7)"; ctx.stroke();
      ctx.setLineDash([4, 6]); ctx.lineCap = "round"; ctx.lineWidth = 3.4; ctx.strokeStyle = adverse; ctx.stroke();
      ctx.setLineDash([]); ctx.lineCap = "butt";
      return y - r;
    }
    ctx.globalAlpha = 0.16; ctx.fillStyle = "#fbe9bd"; ctx.fill(); ctx.globalAlpha = 1;
    ctx.lineWidth = 3.5; ctx.strokeStyle = "rgba(20,12,6,.5)"; ctx.stroke();
    ctx.setLineDash([14, 5]); ctx.lineWidth = 2; ctx.globalAlpha = 0.85; ctx.strokeStyle = "#fbe9bd"; ctx.stroke();
    ctx.setLineDash([]); ctx.globalAlpha = 1;
    return y - r;
  }
  // Anneau doré à plat sur le sol, cerné d'encre pour rester lisible sur l'herbe.
  function anneau(ctx, x, y, r, largeur) {
    ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.7, 0, 0, Math.PI * 2);
    ctx.lineWidth = largeur + 2; ctx.strokeStyle = "#2e2419"; ctx.stroke();
    ctx.lineWidth = largeur; ctx.strokeStyle = "#fbe9bd"; ctx.stroke();
  }

  function projectile(ctx, pr, v) {
    var k = Math.min(1, pr.t / pr.duree), pierre = pr.genre === "pierre";
    // départ en haut de la tour, arrivée à mi-corps (la pierre, elle, tombe au sol)
    var x0 = pr.x0, y0 = pr.y0 - HAUT_TIR, dx = pr.cx - x0, dy = pr.cy - (pierre ? 0 : HAUT_CORPS) - y0;
    var A = pierre ? 70 : pr.genre === "fleche" ? 18 : 5; // hauteur de la cloche
    var x = x0 + dx * k, y = y0 + dy * k - Math.sin(k * Math.PI) * A;
    if (pierre) {
      if (!sprite(ctx, "effet-pierre", x, y, 0)) {
        ctx.fillStyle = "#6d6457"; ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "#2e2419"; ctx.lineWidth = 1.5; ctx.stroke();
      }
      return;
    }
    ctx.save(); ctx.translate(x, y);
    ctx.rotate(Math.atan2(dy - A * Math.PI * Math.cos(k * Math.PI), dx)); // tangente à la trajectoire
    if (!sprite(ctx, pr.genre === "carreau" ? "effet-carreau" : "effet-fleche", 0, 0, 0)) {
      var l = pr.genre === "carreau" ? 22 : 16;
      ctx.strokeStyle = "#2a1c0c"; ctx.lineWidth = pr.genre === "carreau" ? 3.5 : 2;
      ctx.beginPath(); ctx.moveTo(-l, 0); ctx.lineTo(0, 0); ctx.stroke();
      ctx.fillStyle = "#3a3a3a"; ctx.beginPath(); ctx.moveTo(3, 0); ctx.lineTo(-4, -3); ctx.lineTo(-4, 3); ctx.fill();
      ctx.fillStyle = pr.camp === "rival" ? "#efe6d2" : v.couleurs[1]; ctx.fillRect(-l, -2, 4, 4);
    }
    ctx.restore();
  }

  // Place forte : la tienne au départ de la route, celle du camp adverse à l'arrivée. Abîmée ou en ruine, elle fume.
  function place(ctx, v, rival) {
    var pt = rival ? v.arrivee : v.depart, etat = rival ? v.partie.rival : v.partie.chateau;
    var nom = nomPlace(rival ? v.campAdverse : "france", etat);
    if (!sprite(ctx, nom, pt.x, pt.y, 0)) chateau(ctx, pt, rival ? v.adverse.couleurs : v.couleurs, etat, rival, v);
    if (etat.pv <= etat.max / 2) fumees(ctx, v, nom, pt, etat.pv <= 0, rival ? 1 : 0);
  }

  // Fumée d'une place forte abîmée (ou en ruine, plus épaisse et plus sombre) : des bouffées dessinées qui montent,
  // grossissent, dérivent vers l'est (le vent) et s'effacent, chacune à son heure (v.horloge). Points d'émission :
  // « fumees » de l'image dans sprites.js ([[x, y], …] en px logiques depuis le coin haut-gauche de l'image, comme
  // ax et ay ; une valeur négative est lue depuis le point d'ancrage) ; sans eux, le haut de l'image, au milieu.
  // Animations coupées (Réglages) : une seule bouffée, immobile.
  var BOUFFEES = 7, VIE_BOUFFEE = 3.6; // bouffées par point d'émission ; durée de vie d'une bouffée (s)
  var bouffees = {};
  function bouffee(sombre) {
    var k = sombre ? "s" : "c";
    if (bouffees[k]) return bouffees[k];
    var c = document.createElement("canvas"); c.width = c.height = 64;
    var g = c.getContext("2d"), r = g.createRadialGradient(28, 28, 2, 32, 32, 31);
    var t = sombre ? "66,58,52" : "150,144,136";
    r.addColorStop(0, "rgba(" + t + ",.9)"); r.addColorStop(0.55, "rgba(" + t + ",.55)"); r.addColorStop(1, "rgba(" + t + ",0)");
    g.fillStyle = r; g.beginPath(); g.arc(32, 32, 31, 0, Math.PI * 2); g.fill();
    bouffees[k] = c;
    return c;
  }
  function pointsFumee(nom, pt) {
    var s = descr(nom);
    if (!s) return [[pt.x, pt.y - 80]];
    var liste = s.fumees && s.fumees.length ? s.fumees : [[s.w / 2, Math.max(6, s.h * 0.12)]];
    return liste.map(function (f) {
      return f[0] < 0 || f[1] < 0 ? [pt.x + f[0], pt.y + f[1]] : [pt.x - s.ax + f[0], pt.y - s.ay + f[1]];
    });
  }
  function fumees(ctx, v, nom, pt, ruine, decalage) {
    var pts = pointsFumee(nom, pt), anim = JEU.anim.actif(), sombre = bouffee(true), claire = bouffee(false);
    var force = ruine ? 0.9 : 0.78;
    for (var k = 0; k < pts.length; k++) {
      var ex = pts[k][0], ey = pts[k][1];
      if (!anim) { ctx.globalAlpha = force * 0.8; ctx.drawImage(ruine ? sombre : claire, ex - 8, ey - 40, 34, 34); continue; }
      for (var i = 0; i < BOUFFEES; i++) {
        var age = (v.horloge / VIE_BOUFFEE + i / BOUFFEES + k * 0.37 + decalage * 0.19) % 1;
        var r = (ruine ? 8 : 6) + age * (ruine ? 30 : 22);
        var x = ex + age * age * 42 + Math.sin(v.horloge * 1.3 + i * 2.1 + k) * 4 * age;
        var y = ey - age * (ruine ? 96 : 76);
        ctx.globalAlpha = force * (age < 0.1 ? age / 0.1 : Math.pow(1 - (age - 0.1) / 0.9, 1.3));
        ctx.drawImage(age < (ruine ? 0.5 : 0.25) ? sombre : claire, x - r, y - r, 2 * r, 2 * r);
      }
    }
    ctx.globalAlpha = 1;
  }

  // Jauge de solidité : un cartouche sombre avec l'écu du camp, la barre et les chiffres, au-dessus ou au-dessous de la
  // place forte, là où la route ne passe pas (calculé une fois : placerJauge). Il pâlit quand une troupe passe dessous,
  // pour ne jamais cacher la mêlée.
  var JAUGE_L = 132, JAUGE_H = 42;
  function jauge(ctx, v, rival) {
    var pl = rival ? v.placeArrivee : v.placeDepart, etat = rival ? v.partie.rival : v.partie.chateau;
    var x0 = pl.jaugeX, y0 = pl.jaugeY, us = v.partie.unites, dessous = false;
    for (var i = 0; i < us.length && !dessous; i++) {
      var u = us[i];
      dessous = u.x > x0 - 10 && u.x < x0 + JAUGE_L + 10 && u.y > y0 - 4 && u.y < y0 + JAUGE_H + 36;
    }
    ctx.globalAlpha = dessous ? 0.45 : 1;
    ctx.fillStyle = "rgba(20,12,6,.66)"; ctx.fillRect(x0, y0, JAUGE_L, JAUGE_H);
    ctx.lineWidth = 1; ctx.strokeStyle = "rgba(176,141,58,.85)"; ctx.strokeRect(x0 + 0.5, y0 + 0.5, JAUGE_L - 1, JAUGE_H - 1);
    // écu du camp, à gauche : lys de France, ou emblème du camp adverse
    var coul = rival ? v.adverse.couleurs : v.couleurs, ex = x0 + 15, ey = y0 + JAUGE_H / 2;
    ctx.beginPath(); ctx.moveTo(ex - 9, ey - 11); ctx.lineTo(ex + 9, ey - 11); ctx.lineTo(ex + 9, ey + 1);
    ctx.quadraticCurveTo(ex + 9, ey + 8, ex, ey + 12); ctx.quadraticCurveTo(ex - 9, ey + 8, ex - 9, ey + 1); ctx.closePath();
    ctx.fillStyle = coul[0]; ctx.fill(); ctx.lineWidth = 1.5; ctx.strokeStyle = "#e2c272"; ctx.stroke();
    dessinerIcone(ctx, (rival ? v.adverse : camp("joueur")).embleme, ex, ey - 0.5, 14, coul[1]);
    // barre de solidité et chiffres
    var bx = x0 + 30, bw = JAUGE_L - 38;
    ctx.fillStyle = "rgba(20,12,6,.95)"; ctx.fillRect(bx - 1, y0 + 5, bw + 2, 12);
    ctx.fillStyle = rival ? "#c9a14a" : "#7d9a4a"; ctx.fillRect(bx, y0 + 6, bw * Math.max(0, Math.min(1, etat.pv / etat.max)), 10);
    ctx.font = "bold 16px Cinzel, Georgia, serif"; ctx.textAlign = "center"; ctx.fillStyle = "#fbe9bd"; ctx.strokeStyle = "#140c06"; ctx.lineWidth = 3;
    var txt = Math.ceil(etat.pv) + " / " + etat.max;
    ctx.strokeText(txt, bx + bw / 2, y0 + 36); ctx.fillText(txt, bx + bw / 2, y0 + 36);
    ctx.globalAlpha = 1;
  }

  // Place de la jauge et du chiffre des brèches pour une place forte (une fois par bataille). Le haut et le bas de la
  // place forte viennent de son image (boîte opaque relevée sur les rendus : 74 px au-dessus du pied, 40 px dessous ;
  // ancien dessin vectoriel : 98 et 56 px). On essaie la jauge au-dessus et au-dessous (au ras de la place forte ou
  // un cran plus loin), décalée au plus de 70 px de côté, et on garde la place qui gêne le moins : la route (les troupes y passent, leur image monte de 45 px
  // au-dessus de leurs pieds) et les tours ; à gêne égale, du côté où la route n'arrive pas, puis la moins décalée.
  function placerJauge(pt, carte, route, versLaFin, image) {
    var dessus = pt.y - (image ? 78 : 102) - JAUGE_H, dessous = pt.y + (image ? 44 : 60);
    var q = M.surRoute(route, versLaFin ? route.longueur - 60 : 60, 0);
    var routeEnBas = q.y > pt.y + 10, pts = [], tours = carte.emplacements.concat(carte.emplacementsRivaux || []), mieux = null;
    for (var s = 0; s <= route.longueur; s += 6) pts.push(M.surRoute(route, s, 0));
    // au ras de la place forte, ou un cran (44 px) plus loin si la route passe juste à côté
    [[dessus, true, 0], [dessous, false, 0], [dessus - 44, true, 30], [dessous + 44, false, 30]].forEach(function (c) {
      [0, -40, 40, -70, 70].forEach(function (dx) {
        var x0 = Math.max(4, Math.min(M.LARGEUR - 4 - JAUGE_L, pt.x - JAUGE_L / 2 + dx));
        var y0 = Math.max(60, Math.min(M.HAUTEUR - 4 - JAUGE_H, c[0])), gene = 0;
        pts.forEach(function (r) { if (r.x > x0 - 15 && r.x < x0 + JAUGE_L + 15 && r.y > y0 - 2 && r.y < y0 + JAUGE_H + 45) gene++; });
        tours.forEach(function (t) { if (t[0] + 30 > x0 && t[0] - 30 < x0 + JAUGE_L && t[1] + 12 > y0 && t[1] - 72 < y0 + JAUGE_H) gene += 20; });
        var note = gene * 100 + Math.abs(dx) + c[2] + (c[1] === routeEnBas ? 0 : 50);
        if (!mieux || note < mieux.note) mieux = { note: note, x0: x0, y0: y0, haut: c[1] };
      });
    });
    // le chiffre d'une brèche monte au-dessus de la jauge si elle est en haut, sinon au-dessus du donjon
    return { x: pt.x, y: pt.y, jaugeX: mieux.x0, jaugeY: mieux.y0, jaugeEnHaut: mieux.haut,
      chiffreX: mieux.haut ? mieux.x0 + JAUGE_L / 2 : pt.x, hautLibre: Math.max(96, mieux.haut ? mieux.y0 - 8 : dessus + JAUGE_H - 20) };
  }

  function tour(ctx, tr, v) {
    var nom = nomTour(tr, v);
    if (sprite(ctx, nom, tr.x, tr.y, 0)) {
      var s = descr(nom);
      if (!tr.rivale) pastilles(ctx, tr.x, tr.y + s.h - s.ay, tr.niveau);
      return;
    }
    tourDessinee(ctx, tr, tr.rivale ? v.adverse.couleurs : v.couleurs);
  }
  // Niveau de la tour : losanges d'or sur un cartouche sombre, au pied de la tour.
  function pastilles(ctx, x, y, n) {
    var w = n * 11 + 6;
    ctx.fillStyle = "rgba(20,12,6,.8)"; ctx.fillRect(x - w / 2, y - 6, w, 12);
    ctx.lineWidth = 1; ctx.strokeStyle = "#b08d3a"; ctx.strokeRect(x - w / 2 + 0.5, y - 5.5, w - 1, 11);
    ctx.fillStyle = "#e2c272";
    for (var k = 0; k < n; k++) {
      var cx = x - (n - 1) * 5.5 + k * 11;
      ctx.beginPath(); ctx.moveTo(cx, y - 4); ctx.lineTo(cx + 4, y); ctx.lineTo(cx, y + 4); ctx.lineTo(cx - 4, y); ctx.closePath(); ctx.fill();
    }
  }

  // Troupe : vues de marche menées par u.pas, dessinée à 1,2 × (lisible sur un portable), sur son ombre et un anneau
  // au sol aux couleurs de son camp (comme les anneaux d'unité d'un jeu de stratégie). Les bandes des camps rivaux
  // regardent déjà à gauche (« face » dans JEU.SPRITES) : une bande n'est retournée que si la troupe marche dans
  // l'autre sens.
  // La route part de la porte d'une place forte et finit à la porte de l'autre : la troupe apparaît (ou disparaît) en
  // fondu sur le seuil, sur ses 26 premiers (ou derniers) pixels de marche. En fin de bataille, les troupes restées
  // sur la route s'effacent en 0,6 s dans une bouffée de poussière (v.retrait).
  // Sous chaque troupe : son ombre douce, portée vers le sud-est comme celles des tours, des places fortes et des arbres
  // (soleil au nord-ouest), puis un anneau fin aux couleurs de son camp, à peine teinté dedans (on voit la route et
  // l'ombre au travers) : bleu pour la France, rouge pour l'Angleterre, vert pour l'Empire omeyyade.
  var ECHELLE_TROUPE = 1.2;
  var ANNEAU_CAMP = {
    france: { trait: "#5b8ce0", fond: "rgba(60,110,210,.18)" },
    angleterre: { trait: "#d8473a", fond: "rgba(200,60,50,.18)" },
    omeyyades: { trait: "#58c08e", fond: "rgba(70,170,120,.18)" }
  };
  var ombreT = null;
  function ombreTroupe() {
    if (ombreT) return ombreT;
    ombreT = document.createElement("canvas"); ombreT.width = 64; ombreT.height = 26;
    var g = ombreT.getContext("2d");
    g.translate(32, 13); g.scale(1, 13 / 32);
    var r = g.createRadialGradient(0, 0, 0, 0, 0, 32);
    r.addColorStop(0, "rgba(0,0,0,.42)"); r.addColorStop(0.6, "rgba(0,0,0,.3)"); r.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = r; g.beginPath(); g.arc(0, 0, 32, 0, Math.PI * 2); g.fill();
    return ombreT;
  }
  function unite(ctx, u, v) {
    // sens d'après la marche sur la route, avec une marge pour les tronçons presque verticaux
    var dir = Math.cos(u.angle) * (u.camp === "rival" ? -1 : 1);
    if (u.gauche === undefined) u.gauche = u.camp === "rival";
    if (dir < -0.2) u.gauche = true; else if (dir > 0.2) u.gauche = false;
    var d = Math.min(Math.hypot(u.x - v.porteDepart.x, u.y - v.porteDepart.y), Math.hypot(u.x - v.porteArrivee.x, u.y - v.porteArrivee.y));
    var fondu = d < 26 ? Math.max(0, Math.min(1, (d - 2) / 24)) : 1;
    if (v.retrait !== null) fondu *= Math.max(0, 1 - (v.horloge - v.retrait) / 0.6);
    if (fondu <= 0) return;
    if (fondu < 1) ctx.globalAlpha = fondu;
    var nom = nomUnite(u, v), s = descr(nom), sc = ECHELLE_TROUPE;
    if (prete(nom)) {
      var an = ANNEAU_CAMP[u.camp === "rival" ? v.campAdverse : "france"] || ANNEAU_CAMP.france;
      // ombre douce (ellipse de 11 × 4,5 px à l'échelle, décalée de 5 px vers l'est et 2 px vers le sud)
      ctx.drawImage(ombreTroupe(), u.x + (5 - 11) * sc, u.y + (2 - 4.5) * sc, 22 * sc, 9 * sc);
      ctx.beginPath(); ctx.ellipse(u.x, u.y, 10 * sc, 4.5 * sc, 0, 0, Math.PI * 2);
      ctx.fillStyle = an.fond; ctx.fill();
      ctx.lineWidth = 3; ctx.strokeStyle = "rgba(20,12,6,.5)"; ctx.stroke();
      ctx.lineWidth = 1.6; ctx.strokeStyle = an.trait; ctx.stroke();
      sprite(ctx, nom, u.x, u.y, u.pas * 1.2, u.gauche !== (s.face === "gauche"), sc);
      if (u.pv < u.max) barreVie(ctx, u, u.y - s.ay * sc - 2);
    } else uniteDessinee(ctx, u, u.camp === "rival" ? v.adverse.couleurs : v.couleurs);
    ctx.globalAlpha = 1;
  }
  function barreVie(ctx, u, y) {
    ctx.fillStyle = "rgba(20,12,6,.9)"; ctx.fillRect(u.x - 15, y - 1, 30, 7);
    ctx.fillStyle = u.camp === "rival" ? "#d07a5a" : "#9cc06a"; ctx.fillRect(u.x - 14, y, 28 * Math.max(0, u.pv / u.max), 5);
  }

  // ---------- repli : dessin vectoriel, si une image manque ----------
  function chateau(ctx, pt, coul, etat, rival, v) {
    var x = pt.x, y = pt.y;
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
  }

  function tourDessinee(ctx, tr, coul) {
    var d = tr.rivale ? null : M.TOURS[tr.type];
    var icone = tr.rivale ? (tr.type === "baliste" ? "fleches" : "archer") : d.icone;
    var x = tr.x, y = tr.y;
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
    for (var k = 0; k < (tr.rivale ? 0 : tr.niveau); k++) { ctx.fillStyle = "#e2c272"; ctx.strokeStyle = "#2e2419"; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x - 8 + k * 8, y - 34, 3.2, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
  }

  function uniteDessinee(ctx, u, coul) {
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
    if (u.pv < u.max) barreVie(ctx, u, y - s - 8);
  }

  // ---------- la partie ----------
  var enChargement = false; // une seule bataille à la fois, même pendant le chargement des images
  var ATTENTE_MAX = 5000; // ms : une image qui ne répond pas ne bloque jamais la bataille

  // Questions d'une vague, tirées au début de son conseil (le niveau suit les dernières réponses) :
  // une par fiche, sans reprendre une question ni une fiche déjà posées dans cette bataille (s'il en manque, sans la
  // règle des fiches). Une question ratée qui revient (rappels.js) passe outre et prend sa place dans le lot.
  function tirerQuestions(n, posees) {
    var ids = posees.map(function (q) { return q.id; }), fiches = posees.map(function (q) { return q.fiche; });
    return JEU.recit.suite(n, { exclure: ids, filtre: function (q) { return fiches.indexOf(q.fiche) < 0; }, completer: true });
  }

  // lieu : "domaine" (un camp adverse attaque) ou l'identifiant d'une province.
  function lancer(lieu) {
    if (enChargement || JEU.partie) return; // double clic ou touche pressée deux fois : une seule bataille
    var el = JEU.ui.el;
    var C = JEU.campagne;
    var defense = lieu === "domaine";
    var prov = defense ? null : C.province(lieu);
    var frontId = defense ? (C.etat().rival.attaque || "angleterre") : prov.front;
    var adv = C.campDe(frontId), Adv = function (t) { return C.maj1(t); };
    var niveau = defense ? Math.min(4, Math.floor(C.etat().conquises.length / 2)) : prov.niveau;
    var vagues = defense ? 3 : 4;
    var questions = tirerQuestions(QUESTIONS_PAR_VAGUE, []);
    if (questions.length < QUESTIONS_PAR_VAGUE) { JEU.ui.toast("Pas encore assez de questions pour une bataille."); return; }
    var carteId = defense ? "domaine" : prov.carte;
    var campAdv = (C.front(frontId) || {}).camp || "angleterre"; // nom du camp dans les images (angleterre, omeyyades)
    // Terrain : sur le front du sud, la variante sèche du même tracé (herbe jaunie, oliviers, cyprès), si elle existe ;
    // sinon le terrain vert ; sinon l'ancien fond peint. La défense du domaine garde le terrain du domaine.
    var terrains = (campAdv === "omeyyades" && !defense ? ["terrain-" + carteId + "-sud"] : []).concat(["terrain-" + carteId, "terrain-peint"])
      .filter(function (n) { return descr(n); });
    var terrain = terrains[0];
    enChargement = true;
    var parti = false;
    function partir() {
      if (parti) return;
      parti = true;
      enChargement = false;
      if (JEU.partie) return; // une autre partie a commencé pendant le chargement
      demarrer();
    }
    // terrain absent : le suivant de la liste (terrain vert, puis l'ancien fond peint) sert de repli
    function suivant(k) {
      terrain = terrains[k];
      if (!terrain || prete(terrain)) return partir();
      charger([terrain], function () { if (prete(terrain)) partir(); else suivant(k + 1); });
    }
    charger(imagesDeBataille(terrain, campAdv), function () { suivant(0); });
    setTimeout(partir, ATTENTE_MAX);

    function demarrer() {
      var carte = JEU.cartesBataille.carte(carteId);
      var o = C.options(niveau);
      o.vagues = vagues;
      if (defense) { o.pvRival = 12; o.pvRivalMax = 12; }
      else { o.pvRival = C.etat().provinces[lieu].pv; o.pvRivalMax = prov.pv; }
      var p = M.creer(carte, o);
      // netteté : la toile est dessinée à la taille où elle s'affiche (× la densité de l'écran), recalculée plus bas
      // dès que le champ est dans la page, puis à chaque changement de taille de la fenêtre
      var ratio = Math.min(2, racine.devicePixelRatio || 1);
      var route = carte.route, fin = route[route.length - 1];
      // survol : emplacement sous la souris ; curseur : emplacement choisi au clavier ; choixTour : tour sélectionnée ;
      // survolRivale : tour adverse sous la souris ; porteesRivales : montrer la portée de toutes les tours adverses.
      // depart, arrivee : pied de ta place forte et de celle du camp adverse ; porteDepart, porteArrivee : leurs portes
      // (début et fin de la route) ; piedDepart, piedArrivee : leur façade, triée avec les tours et les troupes ;
      // placeDepart, placeArrivee : place de la jauge et du chiffre des brèches ; retrait : heure de la fin de bataille.
      var places = carte.places || { depart: route[0], arrivee: fin };
      var depart = { x: places.depart[0], y: places.depart[1] }, arrivee = { x: places.arrivee[0], y: places.arrivee[1] };
      var v = { partie: p, carte: carte, ratio: ratio, terrain: terrain, fond: null, couleurs: camp("joueur").couleurs, adverse: adv, campAdverse: campAdv,
        porteeAdverse: adv.portee || "#a8322a",
        depart: depart, arrivee: arrivee, porteDepart: { x: route[0][0], y: route[0][1] }, porteArrivee: { x: fin[0], y: fin[1] },
        piedDepart: { x: depart.x, y: depart.y + FACADE }, piedArrivee: { x: arrivee.x, y: arrivee.y + FACADE },
        placeDepart: placerJauge(depart, carte, p.route, false, !!prete(nomPlace("france", p.chateau))),
        placeArrivee: placerJauge(arrivee, carte, p.route, true, !!prete(nomPlace(campAdv, p.rival))),
        horloge: 0, survol: -1, curseur: -1, choix: "archers", choixTour: -1, vitesse: 1, envoyesVague: 0, gardeEntree: 0,
        survolRivale: -1, porteesRivales: false, retrait: null, hud: null, hudDiscret: false, repos: 0 };
      var titre = defense ? "Défense du domaine contre " + adv.armee : "Bataille : " + prov.nom;
      var zone = JEU.ui.commencerPartie(titre, function () { JEU.ui.afficher("jouer"); });
      JEU.musique.humeur("guerre");
      var actif = true, iQ = 0, poseesVague = 0, serie = 0, bonnes = 0, total = 0, finie = false;

      // --- mise en page ---
      var canvas = el("canvas", { class: "td-canvas", width: String(M.LARGEUR), height: String(M.HAUTEUR), tabindex: "0",
        "aria-label": "Champ de bataille : choisis un emplacement avec les flèches, puis bâtis avec Espace" });
      // toile opaque (le terrain la couvre toujours en entier) : la page n'a pas à composer ce qui est dessous
      var ctx = canvas.getContext("2d", { alpha: false });
      // brouillard : un voile qui s'épaissit vers le château adverse (dégradé créé une fois)
      v.brume = ctx.createLinearGradient(520, 0, 660, 0);
      v.brume.addColorStop(0, "rgba(230,230,220,0)"); v.brume.addColorStop(1, "rgba(230,230,220,.26)");
      var hud = el("div", { class: "td-hud" });
      v.hud = hud;
      var cadre = el("div", { class: "td-cadre" }, [canvas, hud]);
      var conseil = el("div", { class: "td-conseil" });
      var ordres = el("div", { class: "td-ordres" });
      zone.classList.add("td-zone"); // sur grand écran, la feuille de style met le champ et les panneaux côte à côte
      zone.appendChild(cadre);
      zone.appendChild(el("div", { class: "td-bas" }, [conseil, ordres]));

      // Netteté : sur un grand écran, le champ s'affiche à plus de 1000 px ; la toile suit cette taille (× la densité de
      // l'écran), entre 1 et 2 fois la taille logique (les images sont rendues à 2 fois : au-delà, rien n'est plus net,
      // seulement plus lent). Le fond est recalculé à cette échelle.
      // Une toile réallouée est effacée : elle n'est donc réallouée que pour un vrai changement de taille, plus grande
      // de 4 % ou plus petite de 20 %. La colonne de droite qui s'élargit pendant le conseil de guerre (td-large : le
      // champ perd environ 8 % de largeur) ne la touche pas : la feuille de style la réduit un peu, puis la rend à sa
      // taille. La toile est mesurée avant le premier conseil (champ à sa taille de combat). Et une toile réallouée est
      // redessinée aussitôt, dans la même tâche : jamais d'image noire.
      function ajusterNettete() {
        var w = canvas.getBoundingClientRect().width * (racine.devicePixelRatio || 1);
        var px = w > 0 ? Math.round(Math.max(1, Math.min(2, w / M.LARGEUR)) * M.LARGEUR) : Math.round(M.LARGEUR * ratio);
        if (v.fond && px <= canvas.width * 1.04 && px >= canvas.width * 0.8) return;
        v.ratio = px / M.LARGEUR;
        canvas.width = px; canvas.height = Math.round(M.HAUTEUR * v.ratio);
        v.fond = fond(carte, v.ratio, v.terrain);
        JEU.bataille.decor = { terrain: v.terrain, route: !!v.fond.routeTracee, largeur: px };
        if (lance) { ctx.setTransform(v.ratio, 0, 0, v.ratio, 0, 0); dessiner(ctx, v); v.dernierDessin = v.horloge; }
      }
      var lance = false; // la boucle d'animation tourne (le premier dessin est le sien)
      ajusterNettete();
      // la fenêtre change de taille : la toile suit, 200 ms après
      var delaiTaille = null, observateur = null;
      function surTaille() {
        if (!canvas.isConnected) { arreterTaille(); return; }
        clearTimeout(delaiTaille);
        delaiTaille = setTimeout(ajusterNettete, 200);
      }
      function arreterTaille() {
        racine.removeEventListener("resize", surTaille);
        if (observateur) observateur.disconnect();
        clearTimeout(delaiTaille);
      }
      if (racine.ResizeObserver) { observateur = new racine.ResizeObserver(surTaille); observateur.observe(canvas); }
      else racine.addEventListener("resize", surTaille);

      // bandeau du champ : bâti une fois, puis seuls les textes qui changent sont remplacés
      var hudOr = null, hudVague = null, hudRevenu = null;
      function majHud() {
        if (!hudOr) {
          hudOr = el("b");
          hud.appendChild(el("span", { class: "td-or", html: JEU.icones.icone("tresor", 22) }, [hudOr, " or"]));
          hud.appendChild(hudVague = el("span", { class: "td-vague" }));
          hud.appendChild(hudRevenu = el("span", { class: "td-revenu" }));
        }
        var t = [String(Math.floor(p.or)), p.phase === "fin" ? "Bataille terminée" : "Vague " + Math.min(p.vague + 1, p.vagues) + " / " + p.vagues + (p.phase === "vague" ? " · en cours" : " · préparation"),
          "Revenu : +" + p.revenu + " par vague"];
        [hudOr, hudVague, hudRevenu].forEach(function (e, i) { if (e.textContent !== t[i]) e.textContent = t[i]; });
      }

      // --- ordres : tours, troupes, lancement ---
      // Pastille de touche, comme sur les boutons de réponse ; les mots (Espace, Entrée) en cartouche.
      function touche(t) { return el("span", { class: "touche", style: "margin:0 .25rem;" + (t.length > 1 ? "border-radius:.9em;padding:0 .5em;" : ""), texte: t }); }

      // Le panneau n'est rebâti que si ce qu'il montre a changé (signature) : pendant le conseil de guerre, une bonne
      // réponse ne change souvent que l'or, et la page n'a alors rien à redessiner de plus que la question suivante.
      var signatureOrdres = null;
      function majOrdres() {
        var prep = p.phase === "preparation", auClavier = prep && !conseilEnCours();
        var sel = prep ? p.tours.filter(function (t) { return t.emplacement === v.choixTour; })[0] : null;
        var sig = [p.phase, auClavier, v.choix, v.choixTour, sel ? sel.niveau + "/" + (p.or >= M.coutAmelioration(sel)) : "",
          Object.keys(M.TROUPES).map(function (k) { return p.or >= M.TROUPES[k].cout ? 1 : 0; }).join(""), p.envois.length,
          v.vitesse, v.envoyesVague, p.phase === "fin" ? JSON.stringify(p.stats) : ""].join("|");
        if (sig === signatureOrdres && ordres.firstChild) return;
        signatureOrdres = sig;
        // le panneau est redessiné : le bouton atteint avec Tab retrouve ensuite le focus (pas après un clic de souris,
        // pour qu'Entrée lance toujours la vague)
        var focus = document.activeElement, cle = null;
        try { if (focus && ordres.contains(focus) && JEU.ui.focusAuClavier()) cle = focus.getAttribute("data-cle"); } catch (e) { /* navigateur ancien */ }
        ordres.innerHTML = "";
        ordres.appendChild(el("h3", { texte: prep ? "Tes ordres" : p.phase === "vague" ? "Le combat fait rage" : "Fin de la bataille" }));
        if (prep) {
          if (sel) {
            var cAm = M.coutAmelioration(sel);
            ordres.appendChild(el("div", { class: "td-selection" }, [
              el("p", { texte: M.TOURS[sel.type].nom + " · niveau " + sel.niveau }),
              sel.niveau < M.AMELIORATION.max ? el("button", { class: "bouton petit", "data-cle": "ameliorer", disabled: p.or < cAm, onclick: function () { ameliorer(sel.emplacement); }, texte: "Améliorer" + (auClavier ? " (A)" : "") + " · " + cAm + " or" }) : el("span", { class: "note", texte: "Niveau maximal" }),
              el("button", { class: "lien", "data-cle": "fermer", onclick: function () { v.choixTour = -1; majOrdres(); }, texte: "Fermer" })
            ]));
          }
          ordres.appendChild(el("p", { class: "consigne", texte: "Choisis une tour, puis clique un emplacement près de la route." }));
          var lTours = el("div", { class: "td-boutons" });
          Object.keys(M.TOURS).forEach(function (k, i) {
            var d = M.TOURS[k], dispo = M.niveauArsenal(p, "tours", k) > 0;
            lTours.appendChild(el("button", { class: "td-bouton" + (v.choix === k ? " choisi" : ""), "data-cle": "tour-" + k, disabled: !dispo, title: dispo ? d.nom : d.nom + " : à débloquer dans l'arsenal", onclick: function () { v.choix = k; v.choixTour = -1; majOrdres(); } }, [
              el("span", { class: "td-ic", html: JEU.icones.icone(d.icone, 28) }),
              el("span", { class: "td-nom" }, [auClavier && dispo ? touche(String(i + 1)) : null, d.nom]),
              el("span", { class: "td-cout", texte: dispo ? d.cout + " or" : verrouille(k) })
            ]));
          });
          ordres.appendChild(lTours);
          ordres.appendChild(el("p", { class: "consigne", texte: "Envoie des troupes contre " + adv.chateau + " : chaque envoi augmente aussi ton revenu." }));
          var lTr = el("div", { class: "td-boutons" });
          Object.keys(M.TROUPES).forEach(function (k) {
            var d = M.TROUPES[k], dispo = M.niveauArsenal(p, "troupes", k) > 0;
            lTr.appendChild(el("button", { class: "td-bouton", "data-cle": "troupe-" + k, disabled: !dispo || p.or < d.cout, title: dispo ? d.nom : "À débloquer dans l'arsenal", onclick: function () { if (M.envoyer(p, k)) { v.gardeEntree = 0; JEU.sons.jouer("coup"); majTout(); } } }, [
              el("span", { class: "td-ic", html: JEU.icones.icone(d.icone, 28) }), el("span", { class: "td-nom", texte: d.nom + (d.nombre > 1 ? " ×" + d.nombre : "") }), el("span", { class: "td-cout", texte: dispo ? d.cout + " or · +" + d.revenu + " revenu" : verrouille(k) })
            ]));
          });
          ordres.appendChild(lTr);
          if (p.envois.length) ordres.appendChild(el("p", { class: "td-file", texte: "Prêts à partir : " + pluriel(p.envois.length, "soldat") }));
          ordres.appendChild(el("button", { class: "bouton principal td-lancer", "data-cle": "lancer", disabled: !auClavier, onclick: lancerVague, texte: auClavier ? "Lancer la vague (Entrée)" : "Réponds d'abord au conseil de guerre" }));
          if (auClavier) ordres.appendChild(el("p", { class: "note td-touches" }, [
            "Au clavier :", touche("1"), "à", touche(String(Object.keys(M.TOURS).length)), "une tour,", touche("← ↑ ↓ →"), "un emplacement,",
            touche("Espace"), "bâtir,", touche("A"), "améliorer,", touche("Entrée"), "lancer la vague."
          ]));
        } else if (p.phase === "vague") {
          var vit = el("div", { class: "td-vitesse" }, [1, 2, 3].map(function (n) {
            return el("button", { class: "bouton petit" + (v.vitesse === n ? " principal" : ""), "data-cle": "vitesse-" + n, onclick: function () { v.vitesse = n; majOrdres(); }, texte: "×" + n });
          }));
          ordres.appendChild(el("p", { texte: "Regarde tes tours tenir la route." + (v.envoyesVague ? " Tes troupes marchent sur " + adv.chateau + "." : "") }));
          ordres.appendChild(vit);
          ordres.appendChild(tableauMelee());
        } else {
          // fin : un court résumé du combat plutôt qu'un cadre vide
          ordres.appendChild(el("ul", { class: "td-resume" }, [
            el("li", { texte: "Soldats envoyés : " + p.stats.envoyes }),
            el("li", { texte: "Ennemis arrêtés : " + p.stats.tues }),
            el("li", { texte: "Ennemis passés : " + p.stats.fuites }),
            el("li", { texte: "Coups portés au château adverse : " + p.stats.degatsRival })
          ]));
        }
        if (cle) {
          var b = ordres.querySelector('[data-cle="' + cle + '"]');
          if (b && !b.disabled) b.focus({ preventScroll: true });
        }
      }

      function majTout() { majHud(); majOrdres(); }

      // --- tableau de la mêlée (pendant une vague) : les deux camps sous leur écu, mis à jour quatre fois par seconde ---
      var melee = null;
      function ecu(c, embleme) {
        return el("span", { class: "tm-ecu", style: "background:" + c[0] + ";color:" + c[1], html: JEU.icones.icone(embleme, 22) });
      }
      function tableauMelee() {
        var lignes = [["marche", "En marche"], ["arretes", "Arrêtés en route"], ["murs", "Ont atteint les murs"], ["tours", "Tours"], ["solidite", "Solidité"]];
        melee = {};
        var corps = el("tbody", {}, lignes.map(function (l) {
          var a = el("td"), b = el("td");
          melee[l[0]] = [a, b];
          return el("tr", {}, [el("th", { scope: "row", texte: l[1] }), a, b]);
        }));
        var tete = el("thead", {}, [el("tr", {}, [el("th"),
          el("th", { scope: "col" }, [ecu(v.couleurs, camp("joueur").embleme), el("span", { texte: "Toi" })]),
          el("th", { scope: "col" }, [ecu(adv.couleurs, adv.embleme), el("span", { texte: C.maj1(adv.peuple) })])])]);
        var t = el("table", { class: "td-melee", "aria-label": "La mêlée" }, [tete, corps]);
        majMelee();
        return t;
      }
      function barre(pv, max) {
        return "<span class='tm-barre'><span style='width:" + Math.round(100 * Math.max(0, Math.min(1, pv / max))) + "%'></span></span>" + Math.ceil(pv) + " / " + max;
      }
      function majMelee() {
        if (!melee || !melee.marche[0].isConnected) return;
        var amis = 0, rivaux = 0;
        p.unites.forEach(function (u) { if (u.camp === "rival") rivaux++; else amis++; });
        var val = {
          marche: [amis + p.fileAmie.length, rivaux + p.fileRivale.length], arretes: [p.stats.pertes, p.stats.tues],
          murs: [p.stats.arrivees, p.stats.fuites], tours: [p.tours.length, p.toursRivales.length]
        };
        Object.keys(val).forEach(function (k) {
          for (var i = 0; i < 2; i++) { var t = String(val[k][i]); if (melee[k][i].textContent !== t) melee[k][i].textContent = t; }
        });
        var sol = [barre(p.chateau.pv, p.chateau.max), barre(p.rival.pv, p.rival.max)];
        for (var i = 0; i < 2; i++) if (melee.solidite[i].innerHTML !== sol[i]) melee.solidite[i].innerHTML = sol[i];
      }

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

      // Le conseil de la vague en cours a-t-il encore des questions à poser ?
      function conseilEnCours() { return iQ < Math.min(questions.length, poseesVague + QUESTIONS_PAR_VAGUE); }

      function preparation() {
        poseesVague = iQ;
        // les questions de cette vague sont tirées maintenant : leur niveau suit les réponses déjà données
        if (p.vague > 0) questions = questions.concat(tirerQuestions(QUESTIONS_PAR_VAGUE, questions));
        JEU.mesure.debut = null; // la première question suit une vague, pas une réponse
        v.curseur = -1;
        conseil.innerHTML = "";
        var nouv = nouvellesDuFront();
        if (nouv) conseil.appendChild(JEU.ui.recit({ nom: "Un éclaireur", icone: "trompe", texte: nouv }));
        var scene = el("div", { class: "td-question" });
        conseil.appendChild(scene);
        // association : après le dernier appariement, le bouton Valider est amené en vue
        scene.addEventListener("paires-completes", function () { setTimeout(function () { montrer(scene.querySelector(".valider"), "proche"); }, 0); });
        questionSuivante(scene);
        majTout();
        if (conseilEnCours()) montrer(conseil, "proche"); // la question est la prochaine chose à faire
      }

      function questionSuivante(scene) {
        if (!conseilEnCours()) { zone.classList.remove("td-large"); return conseilTermine(scene); }
        var q = questions[iQ];
        // pendant tout le conseil de guerre, la colonne de droite est plus large (associations aux définitions longues) :
        // le champ n'est pas jouable pendant les questions. Elle ne change pas d'une question à l'autre (changer la
        // grille redessinait toute la page entre deux questions) : seulement au début et à la fin du conseil.
        zone.classList.add("td-large");
        JEU.ui.poserQuestion(q, scene, function (juste) {
          v.repos = v.horloge + REPOS_APRES_REPONSE; // le champ attend : l'image suivante ne montre que la question
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
            // la question ratée reviendra un peu plus tard : si c'est dans cette vague, elle prend sa place dans le lot
            JEU.rappels.replacer(questions, iQ, poseesVague + QUESTIONS_PAR_VAGUE);
            JEU.ui.panneauErreur(q, scene, function () { v.repos = v.horloge + REPOS_APRES_REPONSE; JEU.mesure.reponseDonnee(); questionSuivante(scene); majTout(); });
            montrer(scene, "proche"); // le panneau d'erreur, vu depuis son titre
          }
        }, { recit: JEU.recit.cadre(q, defense ? "defense" : "preparation", adv) });
        // la colonne de droite défile à part : la question suivante est montrée depuis son énoncé, jamais coupée par le haut
        if (conseilEnCours()) montrer(scene, "proche");
      }

      // Reste-t-il de quoi dépenser (une tour sur un emplacement libre, ou des troupes) ?
      function orADepenser() {
        var libre = carte.emplacements.some(function (e, i) { return M.emplacementLibre(p, i); });
        var tour = libre && Object.keys(M.TOURS).some(function (t) { return M.niveauArsenal(p, "tours", t) > 0 && p.or >= M.TOURS[t].cout; });
        return tour || Object.keys(M.TROUPES).some(function (t) { return M.niveauArsenal(p, "troupes", t) > 0 && p.or >= M.TROUPES[t].cout; });
      }

      function conseilTermine(scene) {
        scene.innerHTML = "";
        var avis = el("p", { class: "note", "aria-live": "polite" });
        scene.appendChild(el("div", { class: "td-pret" }, [
          el("p", { class: "grand", texte: "Le conseil de guerre est terminé." }),
          el("p", { texte: "Dépense ton or : pose des tours, améliore-les, envoie des troupes. Puis lance la vague." }),
          avis
        ]));
        // L'Entrée qui a fini la dernière question, ou un double appui, ne lance pas la vague tout de suite.
        // Une action (tour posée, améliorée, troupes envoyées) lève cette garde.
        v.gardeEntree = Date.now() + GARDE_ENTREE;
        var averti = false;
        JEU.ui.clavier = function (k, ev) {
          if (p.phase !== "preparation") return false;
          var n = parseInt(k, 10), types = Object.keys(M.TOURS);
          if (n >= 1 && n <= types.length) {
            if (M.niveauArsenal(p, "tours", types[n - 1])) { v.choix = types[n - 1]; majOrdres(); }
            else JEU.ui.toast(M.TOURS[types[n - 1]].nom + " : à débloquer dans l'arsenal.");
            return true;
          }
          if (DIRECTIONS[k]) { deplacerCurseur(DIRECTIONS[k]); return true; }
          if ((k === " " || k === "Spacebar") && v.curseur >= 0) { agirSur(v.curseur); majCurseur(); return true; }
          if ((k === "a" || k === "A") && v.choixTour >= 0) { ameliorer(v.choixTour); return true; }
          if (k === "Enter") {
            if ((ev && ev.repeat) || Date.now() < v.gardeEntree) return true;
            if (!averti && orADepenser()) {
              averti = true;
              avis.textContent = "Il te reste " + Math.floor(p.or) + " or à dépenser. Appuie encore sur Entrée pour lancer la vague quand même.";
              JEU.ui.toast("Il te reste " + Math.floor(p.or) + " or à dépenser.");
              return true;
            }
            lancerVague(); return true;
          }
          return false;
        };
        majOrdres();
        montrer(cadre); // tout le champ de bataille, pour poser les tours
        montrer(ordres.querySelector(".td-lancer"), "proche"); // et le bouton « Lancer la vague » dans la colonne de droite
      }

      function lancerVague() {
        if (p.phase !== "preparation" || conseilEnCours()) return;
        JEU.ui.clavier = null;
        v.choixTour = -1; v.curseur = -1;
        M.lancerVague(p);
        v.envoyesVague = p.fileAmie.length;
        JEU.sons.jouer("construction");
        conseil.innerHTML = "";
        var texte = defense
          ? Adv(adv.troupes) + " chargent ! Tes tours tiennent la route." + (v.envoyesVague ? " Tes soldats partent vers " + adv.chateau + "." : "")
          : (v.envoyesVague ? "Tes troupes s'élancent. " : "Tes tours attendent l'ennemi. ") + Adv(adv.soldats) + " marchent sur ton château.";
        conseil.appendChild(JEU.ui.recit({ nom: "Le capitaine", icone: "rallier", texte: texte }));
        majTout();
        montrer(cadre); // l'élève regarde la vague
      }

      // --- actions sur un emplacement (souris ou clavier) ---
      function agirSur(i) {
        if (p.phase !== "preparation" || i < 0) return;
        if (!M.emplacementLibre(p, i)) { v.choixTour = i; majOrdres(); return; }
        if (M.poserTour(p, v.choix, i)) {
          v.gardeEntree = 0;
          JEU.sons.jouer("construction");
          var r = canvas.getBoundingClientRect();
          JEU.anim.eclat(r.left + carte.emplacements[i][0] / M.LARGEUR * r.width, r.top + carte.emplacements[i][1] / M.HAUTEUR * r.height, "or", 14);
          majTout();
        } else if (p.or < M.TOURS[v.choix].cout) {
          JEU.ui.toast(conseilEnCours() ? "Pas assez d'or : réponds au conseil de guerre." : "Pas assez d'or : lance la vague, ton revenu arrivera ensuite.");
        } else JEU.ui.toast("Impossible de bâtir ici.");
      }
      function ameliorer(i) {
        if (M.ameliorerTour(p, i)) { v.gardeEntree = 0; JEU.sons.jouer("construction"); majTout(); return; }
        var t = p.tours.filter(function (x) { return x.emplacement === i; })[0];
        if (t && t.niveau < M.AMELIORATION.max) JEU.ui.toast("Pas assez d'or pour améliorer cette tour.");
      }

      // --- clavier : les flèches promènent un curseur sur les emplacements ---
      var DIRECTIONS = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1], Left: [-1, 0], Right: [1, 0], Up: [0, -1], Down: [0, 1] };
      var ordreClavier = carte.emplacements.map(function (e, i) { return i; }).sort(function (a, b) {
        var ea = carte.emplacements[a], eb = carte.emplacements[b];
        return ea[0] - eb[0] || ea[1] - eb[1];
      });
      // Sur une tour déjà bâtie, le curseur la sélectionne (portée visible, bouton Améliorer).
      function majCurseur() {
        if (v.curseur >= 0 && !M.emplacementLibre(p, v.curseur)) v.choixTour = v.curseur;
        else if (v.choixTour >= 0) v.choixTour = -1;
        majOrdres();
      }
      function deplacerCurseur(dir) {
        var es = carte.emplacements, i = v.curseur;
        if (!es.length) return;
        if (i < 0) {
          v.curseur = ordreClavier[0];
          if (document.activeElement !== canvas) canvas.focus({ preventScroll: true });
          return majCurseur();
        }
        var meilleur = -1, score = Infinity;
        es.forEach(function (f, j) {
          if (j === i) return;
          var dx = f[0] - es[i][0], dy = f[1] - es[i][1];
          var avance = dx * dir[0] + dy * dir[1], ecart = Math.abs(dx * dir[1] - dy * dir[0]);
          if (avance <= 0) return;
          if (avance + 2 * ecart < score) { score = avance + 2 * ecart; meilleur = j; }
        });
        if (meilleur < 0) { // bord du champ : on repart de l'autre côté
          var k = ordreClavier.indexOf(i), pas = dir[0] + dir[1] > 0 ? 1 : ordreClavier.length - 1;
          meilleur = ordreClavier[(k + pas) % ordreClavier.length];
        }
        v.curseur = meilleur;
        // le champ prend le focus : Espace bâtit ici, même si un bouton l'avait avant
        if (document.activeElement !== canvas) canvas.focus({ preventScroll: true });
        majCurseur();
      }

      // --- souris sur le champ de bataille ---
      function point(ev) {
        var r = canvas.getBoundingClientRect();
        return { x: (ev.clientX - r.left) / r.width * M.LARGEUR, y: (ev.clientY - r.top) / r.height * M.HAUTEUR };
      }
      function emplacementSous(pt) {
        var meilleur = -1, dm = 30;
        carte.emplacements.forEach(function (e, i) { var d = Math.hypot(e[0] - pt.x, e[1] - pt.y); if (d < dm) { dm = d; meilleur = i; } });
        return meilleur;
      }
      // tour adverse sous la souris (son pied ou son corps, qui monte de 24 px) : sa portée se dessine pendant la préparation
      function tourRivaleSous(pt) {
        var meilleure = -1, dm = 30;
        p.toursRivales.forEach(function (tr, i) {
          var d = Math.min(Math.hypot(tr.x - pt.x, tr.y - pt.y), Math.hypot(tr.x - pt.x, tr.y - 24 - pt.y));
          if (d < dm) { dm = d; meilleure = i; }
        });
        return meilleure;
      }
      canvas.addEventListener("pointermove", function (ev) {
        var pt = point(ev);
        v.survol = emplacementSous(pt);
        v.survolRivale = v.survol < 0 ? tourRivaleSous(pt) : -1;
        if (v.survol >= 0) v.curseur = -1; // la souris reprend la main
        canvas.style.cursor = v.survol >= 0 && p.phase === "preparation" ? "pointer" : "";
      });
      canvas.addEventListener("pointerleave", function () { v.survol = -1; v.survolRivale = -1; });
      // pointeur (ou focus du clavier) sur un bouton de troupe : la portée de toutes les tours adverses se montre, pour
      // voir sur quel tronçon de la route tes soldats seront pris sous le tir
      function voirPortees(ev) {
        var b = ev.target && ev.target.closest ? ev.target.closest('[data-cle^="troupe-"]') : null;
        v.porteesRivales = !!b && (ev.type === "pointerover" || ev.type === "focusin");
      }
      ["pointerover", "pointerout", "focusin", "focusout"].forEach(function (t) { ordres.addEventListener(t, voirPortees); });
      canvas.addEventListener("click", function (ev) { agirSur(emplacementSous(point(ev))); });
      // Arrivée au clavier (Tab) sur le champ : le curseur se pose sur le premier emplacement.
      canvas.addEventListener("focus", function () {
        var auClavier = false;
        try { auClavier = canvas.matches(":focus-visible"); } catch (e) { /* navigateur ancien */ }
        if (auClavier && v.curseur < 0 && p.phase === "preparation" && !conseilEnCours() && carte.emplacements.length) { v.curseur = ordreClavier[0]; majCurseur(); }
      });

      // --- boucle d'animation ---
      var avant = null, phaseAvant = p.phase;
      function boucle(t) {
        if (!actif || !canvas.isConnected || !v.fond) { actif = false; return; } // partie quittée : la boucle s'arrête d'elle-même
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
          if (p.phase === "fin") {
            // les troupes restées sur la route s'effacent (0,6 s) dans une bouffée de poussière : pas d'arrêt sur image
            v.retrait = v.horloge;
            p.unites.forEach(function (u) { p.effets.push({ genre: "retrait", x: u.x, y: u.y, age: 0 }); });
            bilan();
          }
        }
        if (v.retrait !== null && p.unites.length && v.horloge - v.retrait > 0.6) p.unites.length = 0;
        // bandeau et tableau de la mêlée : 4 fois par seconde, et tout de suite quand une place forte est frappée (la
        // solidité du tableau suit la jauge du champ)
        var solidites = p.chateau.pv + "/" + p.rival.pv;
        if (p.phase === "vague" && (Math.floor(v.horloge * 4) !== v.dernierHud || solidites !== v.dernieresSolidites)) {
          v.dernierHud = Math.floor(v.horloge * 4); v.dernieresSolidites = solidites; majHud(); majMelee();
        }
        // Pendant le conseil de guerre, le champ ne fait que respirer (ombres des nuages, fumées) : 8 images par seconde
        // suffisent et laissent la page dessiner aussitôt la question suivante ; et juste après une réponse, il attend
        // un quart de seconde (la page n'a alors à peindre et composer que la question suivante, sans la toile).
        // Partout ailleurs, chaque image.
        var calme = p.phase === "preparation" && conseilEnCours();
        if (!calme || (v.horloge >= v.repos && v.horloge - (v.dernierDessin || -1) >= 1 / IMAGES_CONSEIL)) {
          v.dernierDessin = v.horloge;
          ctx.setTransform(v.ratio, 0, 0, v.ratio, 0, 0);
          dessiner(ctx, v);
        }
        racine.requestAnimationFrame(boucle);
      }

      // Fin de la partie : la boucle s'arrête, et la toile et son fond (7 Mo en 1920 × 1080) sont rendus tout de suite,
      // sans attendre la bataille suivante.
      function arreter() {
        actif = false; arreterTaille(); JEU.musique.humeur("paix");
        v.fond = null; canvas.width = 0; canvas.height = 0;
      }
      JEU.partie.surQuitter = function () {
        arreter();
        if (!finie) { finie = true; C.apresBataille({ lieu: lieu, front: frontId, issue: "retraite", degatsRival: p.stats.degatsRival, entamee: p.vague > 0 || p.phase !== "preparation" }); }
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
          // « La province des Oliveraies », « du Gué », « de la Forêt de l'Ouest » : l'accord tient pour les dix noms.
          titreB = "Victoire !"; texte = "La province " + avecArticle(prov.nom, "de") + " est à toi : elle te versera un tribut chaque jour.";
        } else {
          titreB = issue === "retraite" ? "Retraite en bon ordre" : Adv(adv.peuple) + " tiennent encore";
          var place = "la place forte " + avecArticle(prov.nom, "de");
          texte = (p.stats.degatsRival > 0 ? "Ton armée a porté " + pluriel(p.stats.degatsRival, "coup") + " à " + place + "." : "Aucun de tes soldats n'a atteint " + place + ".") +
            " Il lui reste " + pluriel(C.etat().provinces[lieu].pv, "point") + " de solidité : la prochaine bataille reprendra là.";
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
        montrer(conseil, "proche");
      }
      function retour() { arreter(); JEU.ui.finirPartie(); JEU.ui.afficher("jouer"); }

      majTout();
      preparation();
      lance = true;
      racine.requestAnimationFrame(boucle);
      JEU.bataille.enCours = p; // pour les tests de bout en bout
    }
  }

  JEU.bataille = { lancer: lancer, QUESTIONS_PAR_VAGUE: QUESTIONS_PAR_VAGUE, verrouille: verrouille };
})(typeof window !== "undefined" ? window : globalThis);
