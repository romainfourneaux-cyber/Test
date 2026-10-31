// La bataille : tower defense à double sens. Pendant la préparation, les conseillers posent des questions
// (sans chrono) : chaque bonne réponse remplit le coffre de guerre. Avec cet or, l'élève pose et améliore ses tours
// et envoie ses troupes contre le château rival. Puis il lance la vague et regarde le combat se jouer.
(function (racine) {
  "use strict";
  var JEU = racine.JEU;
  var U = JEU.util;
  var M = JEU.batailleMoteur;
  var QUESTIONS_PAR_VAGUE = 3;
  var GARDE_ENTREE = 700; // ms : l'Entrée qui finit la dernière question (ou un double appui) ne lance pas la vague
  var REPOS_APRES_REPONSE = 0.25; // s : pendant le conseil, le champ n'est pas redessiné juste après une réponse
  var RAYON_DOIGT = 42; // unités du champ (1000 × 660) : rayon de la cible d'un emplacement sous le doigt (30 à la souris) ; tablette, 31/10/2026
  // Indication de touche en fin de bouton (« (Entrée) »), cachée sur une tablette par la feuille de style (JEU.ui.astuce)
  function astuce(t) { return JEU.ui.astuce ? JEU.ui.astuce(t) : " (" + t + ")"; }
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
  // ---------- le seigneur rival parle (16/10/2026) ----------
  // Le moteur note chaque décision du rival dans p.ia.journal ({ vague, posture, texte }) ; ses phrases commencent par
  // « Ton rival ». Ici, le rival du front prend son titre (jeu/data/personnages.js : « Le roi d'Angleterre », « L'émir de
  // Cordoue » ; sinon « un seigneur rival ») : « Le roi d'Angleterre a vu tes troupes foncer sur sa porte », « Tu gardes
  // de l'or : le roi d'Angleterre se méfie… », « Les guetteurs de l'émir de Cordoue… ». alerte : la phrase de ses
  // guetteurs au départ de la vague ; sinon sa décision pour cette vague (la dernière notée). Null s'il n'a rien dit.
  function phraseRival(journal, vague, alerte, nom) {
    if (!journal || !journal.length) return null;
    var d = null;
    for (var i = journal.length - 1; i >= 0 && !d; i--) {
      var j = journal[i];
      if (j && j.vague === vague && typeof j.texte === "string" && (j.posture === "alerte") === !!alerte) d = j;
    }
    if (!d) return null;
    nom = nom || "Un seigneur rival";
    var bas = nom.replace(/^(Les|Le|La|Une|Un)(?=\s)|^L(?=['’])/, function (m) { return m.toLowerCase(); });
    return d.texte.replace(/^Ton rival\b/, nom).replace(/\bton rival\b/g, bas).replace(/\bdu rival\b/g, avecArticle(bas, "de"));
  }
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
    var n = [terrain, "effet-fleche", "effet-carreau", "effet-pierre", "effet-poussiere", "effet-eclats", "effet-cratere"];
    ["intact", "abime", "ruine"].forEach(function (e) {
      ["france", campAdv].forEach(function (c) { n.push("place-" + c + "-" + e, "ombre-place-" + c + "-" + e); });
    });
    Object.keys(M.TOURS).forEach(function (t) {
      for (var k = 1; k <= M.AMELIORATION.max; k++) n.push("tour-" + t + "-france-" + k, "ombre-tour-" + t + "-france-" + k);
    });
    Object.keys(M.TOURS_RIVALES).forEach(function (t) { n.push("tour-" + t + "-" + campAdv + "-1", "ombre-tour-" + t + "-" + campAdv + "-1"); });
    Object.keys(M.TROUPES).forEach(function (t) { n.push("unite-" + t + "-france"); });
    Object.keys(M.ENNEMIS).forEach(function (t) { n.push("unite-" + t + "-" + campAdv); });
    // bandes de chute et de coup des troupes (lot A) : chargées si sprites.js les a, sinon la marche et poseCouchee()
    n.slice().forEach(function (nom) { if (nom.indexOf("unite-") === 0) n.push(nom + "-chute", nom + "-coup"); });
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
    // lot A : effets (bataille-effets.js) et couche de sol (bataille-sol.js), s'ils sont chargés ; sinon, comme avant
    var FX = JEU.batailleEffets || null, SOL = v.sol && JEU.batailleSol ? JEU.batailleSol : null;
    var ambiance = JEU.anim.ambiance ? JEU.anim.ambiance() : anim;
    var dtj = v.tempsFx === undefined ? 0 : Math.max(0, Math.min(0.25, p.temps - v.tempsFx)); // temps de la partie depuis l'image d'avant
    v.tempsFx = p.temps;
    if (FX) FX.avancer(dtj);
    // le fond, ou la couche de sol : le fond et les traces posées (corps, flaques, taches, cratères, flèches plantées)
    if (SOL) SOL.avancer(v.sol, p.temps);
    ctx.drawImage(SOL ? v.sol.vue : v.fond, 0, 0, M.LARGEUR, M.HAUTEUR);

    // --- sol : ombres portées des places fortes et des tours ---
    sprite(ctx, "ombre-" + nomPlace("france", p.chateau), v.depart.x, v.depart.y, 0);
    sprite(ctx, "ombre-" + nomPlace(v.campAdverse, p.rival), v.arrivee.x, v.arrivee.y, 0);
    // Tours que le rival vient de bâtir (effet « tourRivale » du moteur, pendant ta préparation) : elles apparaissent en
    // fondu (NAISSANCE_TOUR s), ombre comprise ; v.naissance : emplacement → âge de l'effet (null sans tour neuve).
    v.naissance = null;
    for (i = 0; i < p.effets.length; i++) { e = p.effets[i]; if (e.genre === "tourRivale" && e.age < NAISSANCE_TOUR) (v.naissance || (v.naissance = {}))[e.emplacement] = e.age; }
    for (i = 0; i < p.toursRivales.length; i++) {
      tr = p.toursRivales[i];
      var ft = fonduTour(tr, v);
      if (ft < 1) ctx.globalAlpha = ft;
      sprite(ctx, "ombre-" + nomTour(tr, v), tr.x, tr.y, 0);
      if (ft < 1) ctx.globalAlpha = 1;
    }
    for (i = 0; i < p.tours.length; i++) { tr = p.tours[i]; sprite(ctx, "ombre-" + nomTour(tr, v), tr.x, tr.y, 0); }
    // Marques au sol des effets de l'IA rivale (16/10/2026), sous les murs et les troupes : une onde de sa couleur au
    // pied d'une tour qu'il vient de bâtir et à sa porte quand ses guetteurs rappellent des gardes (départ de la vague,
    // deux ondes par seconde et demie ; animations coupées : une seule, immobile) ; un anneau doré à sa porte quand sa
    // garnison est vaincue et que la porte s'ouvre à tes troupes. La poussière de ces effets est dessinée avec les autres.
    for (i = 0; i < p.effets.length; i++) {
      e = p.effets[i];
      if (e.genre === "tourRivale") { if (e.age < 1.2) onde(ctx, e.x, e.y + 2, 14 + e.age * 24, 1 - e.age / 1.2, v.porteeAdverse); }
      else if (e.genre === "alerte") {
        if (e.age >= 1.6) continue;
        if (!anim) onde(ctx, e.x, e.y, 24, 0.6, v.porteeAdverse);
        else { var ka = (e.age % 0.8) / 0.8; onde(ctx, e.x, e.y, 10 + ka * 28, 0.9 * (1 - ka), v.porteeAdverse); }
      } else if (e.genre === "porteOuverte") {
        if (e.age < 1.4) { ctx.globalAlpha = 1 - e.age / 1.4; anneau(ctx, e.x, e.y + 2, 12 + e.age * 20, 2.5); ctx.globalAlpha = 1; }
      }
    }
    // bataillons : chaque figurine suit sa troupe ; figurines tombées et flaques : à plat sur le sol, sous les troupes,
    // les tours et les places fortes (la tour de siège abattue, haute, est triée avec les volumes)
    var sang = JEU.anim.sang ? JEU.anim.sang() : true, R = v.rendu;
    R.bataillons = 0; R.figures = 0; R.corps = 0; R.bannieres = 0;
    // compteurs de la dernière image (lot A, règle 2.2 du plan) : corps dessinés en train de tomber, particules, coups
    // étincelants, traînées, lueurs, gouttes en vol, flaques dessinées ; decalques : traces entières dans la couche de sol
    R.corpsVifs = 0; R.particules = 0; R.etincelles = 0; R.trainees = 0; R.lueurs = 0; R.gouttes = 0; R.flaques = 0;
    R.decalques = SOL ? v.sol.compte : null;
    majBataillons(v, anim, sang);
    for (i = 0; i < v.corps.length; i++) corps(ctx, v.corps[i], v, sang, anim);
    // au ras du sol, sous les troupes : traces posées par les effets neufs, anneaux des pierres, poussières
    solEffets(ctx, v, anim, sang, FX, SOL);
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
      viseeTrait(pr);
      ctx.fillStyle = "rgba(0,0,0," + (0.34 - 0.18 * haut) + ")";
      ctx.beginPath(); ctx.ellipse(pr.x0 + (pr.cx + pr.dvx - pr.x0) * kk, pr.y0 + 18 + (pr.cy + pr.dvy - pr.y0 - 18) * kk, 6 - 2 * haut, 3 - haut, 0, 0, Math.PI * 2); ctx.fill();
    }
    // ombres de nuages qui passent (ambiance)
    if (ambiance) {
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
      if (!un.vivant) continue; // tombée à cette étape : son corps est déjà au sol
      // trié là où son bataillon est dessiné (une mêlée rangée le décale un peu de sa place du moteur)
      var ux = un.bat && un.bat.vx !== undefined ? un.bat.vx : un.x, uy = un.bat && un.bat.vx !== undefined ? un.bat.vy : un.y;
      un.prof = uy;
      if (Math.hypot(ux - v.porteDepart.x, uy - v.porteDepart.y) < PRES_PORTE) un.prof = Math.max(uy, v.piedDepart.y + 0.5);
      else if (Math.hypot(ux - v.porteArrivee.x, uy - v.porteArrivee.y) < PRES_PORTE) un.prof = Math.max(uy, v.piedArrivee.y + 0.5);
      volumes.push(un);
    }
    // giclées de sang (réglage « Sang dans les combats », animations actives) : juste devant la figurine touchée ou
    // tombée, triées avec elle (une façade ou une troupe plus proche de l'écran passe devant) ; les GERBES coups et les
    // GERBES_CHUTES chutes les plus récents seulement (un coup porté à la tour de siège n'en fait pas : c'est du bois)
    if (sang && anim) {
      for (var ng = 0, ie = p.effets.length - 1; ie >= 0 && ng < GERBES; ie--) {
        e = p.effets[ie];
        if (e.genre === "coup" && e.age < GICLEE_COUP && cibleDuCoup(e, p) !== "belier") { e.prof = (e.gy !== undefined ? e.gy : e.y) + 0.5; volumes.push(e); ng++; }
      }
      for (ng = 0, ie = v.corps.length - 1; ie >= 0 && ng < GERBES_CHUTES; ie--) {
        e = v.corps[ie];
        if (e.age < GICLEE_CHUTE) { e.prof = e.y + 0.5; volumes.push(e); ng++; }
      }
    }
    // tour de siège abattue : elle penche, haute comme avant, triée avec les troupes qui passent devant ou derrière
    for (i = 0; i < p.effets.length; i++) { e = p.effets[i]; if (e.genre === "chute" && e.type === "belier") { decalEffet(e, v); e.prof = e.y + e.dvy; volumes.push(e); } }
    volumes.sort(parProfondeur);
    for (i = 0; i < volumes.length; i++) {
      var o = volumes[i];
      if (o === v.piedDepart) place(ctx, v, false);
      else if (o === v.piedArrivee) place(ctx, v, true);
      else if (o.emplacement !== undefined) tour(ctx, o, v);
      else if (o.genre === "chute" && o.type === "belier") tombe(ctx, o, v, sang, anim);
      else if (o.genre !== undefined) giclee(ctx, o, v, SOL);
      else bataillon(ctx, o, v, anim);
    }
    // gouttes retombées : posées une fois dans la couche de sol, en taches brun-rouge, quand leur giclée finit
    if (SOL && sang && anim) poserTaches(v, SOL);

    // --- projectiles : flèches et carreaux tournés le long de leur trajectoire, pierres en cloche ---
    for (i = 0; i < p.projectiles.length; i++) projectile(ctx, p.projectiles[i], v, FX, anim);
    if (FX) R.trainees = FX.dessinerTrainees(ctx);

    // --- effets --- (ceux posés à la place d'une troupe se dessinent là où est son bataillon : decalEffet)
    // étincelles (bataille-effets.js) : les ETINCELLES_MAX coups ou chocs les plus récents seulement
    var sautees = 0;
    if (FX) {
      for (i = 0; i < p.effets.length; i++) { e = p.effets[i]; if ((e.genre === "coup" || e.genre === "choc") && e.age < FX.DUREE_ETINCELLES) sautees++; }
      sautees = Math.max(0, sautees - FX.PLAFONDS.etincelles);
    }
    for (i = 0; i < p.effets.length; i++) {
      e = p.effets[i];
      var a = 1 - e.age / 1.2, dg = e.genre;
      var decale = dg === "touche" || dg === "pique" || dg === "impact" || dg === "choc" || dg === "chute";
      if (decale) { decalEffet(e, v); if (e.dvx || e.dvy) { ctx.save(); ctx.translate(e.dvx, e.dvy); } else decale = false; }
      if (e.genre === "touche" || e.genre === "pique") {
        // coup porté à un soldat : une petite bouffée de terre (au sol : solEffets) et, pour un trait, un éclat chaud de
        // 6 px (bataille-effets.js ; sans lui, l'éclat de lumière d'avant), sans sang
        if (FX) {
          if (e.genre === "touche" && R.lueurs < FX.PLAFONDS.lueurs && FX.lueur(ctx, e.x, e.y - HAUT_CORPS, e.age, 0.12, 6)) R.lueurs++;
        } else if (prete("effet-poussiere")) {
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
        // pierre de trébuchet : un nuage de poussière (l'anneau, le cratère et les mottes viennent de bataille-sol.js et
        // bataille-effets.js ; sans eux, les éclats clairs d'avant)
        if (prete("effet-poussiere")) { if (e.age < 0.75) sprite(ctx, "effet-poussiere", e.x, e.y + 4, vue(e.age, 0.75, 5), false, Math.max(1, e.rayon / 32)); }
        else {
          ctx.fillStyle = "rgba(120,100,70," + (0.5 * a) + ")";
          ctx.beginPath(); ctx.ellipse(e.x, e.y, e.rayon * (0.4 + e.age), e.rayon * 0.5 * (0.4 + e.age), 0, 0, Math.PI * 2); ctx.fill();
        }
        if (!FX && e.age < 0.32) sprite(ctx, "effet-eclats", e.x, e.y - 4, vue(e.age, 0.32, 4), false, 1.3);
      } else if (e.genre === "choc") {
        // deux troupes s'engagent : des étincelles de métal (sans bataille-effets.js : l'éclat de lumière d'avant) ; la
        // poussière d'une charge est au sol (solEffets)
        if (FX) {
          if (e.age < FX.DUREE_ETINCELLES) {
            if (sautees > 0) sautees--;
            else if (FX.etincelles(ctx, e.x, e.y - HAUT_CORPS, e.age, FX.graineDe(e.x, e.y), FX.graineDe(e.x, e.y) % 2 ? 1 : -1, !anim, 1.3)) R.etincelles++;
          }
        } else if (e.age < 0.2) { ctx.globalAlpha = 1 - e.age / 0.2; ctx.drawImage(eclatLumiere(), e.x - 12, e.y - HAUT_CORPS - 12, 24, 24); ctx.globalAlpha = 1; }
      } else if (e.genre === "coup") {
        // coup porté en mêlée : des étincelles de métal, du côté du coup (deux fois plus si le champion frappe) et, avec
        // le sang, la giclée (plus haut). Sans bataille-effets.js : sans sang (ou sans animations), un petit éclat de métal.
        // Sur la tour de siège : l'éclat de métal et quelques échardes de bois, jamais de sang.
        // Sur un bataillon, l'éclat part de l'homme du premier rang touché (gx, gy).
        var bois = cibleDuCoup(e, p) === "belier", cx = e.gx !== undefined ? e.gx : e.x, cy = (e.gy !== undefined ? e.gy : e.y) - (e.haut || HAUT_CORPS) * 1.3;
        if (FX) {
          if (e.age < FX.DUREE_ETINCELLES) {
            if (sautees > 0) sautees--;
            else if (FX.etincelles(ctx, cx, cy, e.age, FX.graineDe(e.x, e.y), e.dir || 1, !anim, e.champion ? 2 : 1)) R.etincelles++;
          }
        } else if ((!sang || !anim || bois) && e.age < 0.12) { ctx.globalAlpha = 1 - e.age / 0.12; ctx.drawImage(eclatLumiere(), cx - 7, cy - 7, 14, 14); ctx.globalAlpha = 1; }
        if (bois && e.age < 0.32) sprite(ctx, "effet-eclats", e.gx !== undefined ? e.gx : e.x, (e.gy !== undefined ? e.gy : e.y) - HAUT_CORPS, vue(e.age, 0.32, 4), false, 0.7);
      } else if (e.genre === "chute") {
        // sa poussière est au sol (solEffets) ; sans l'image de poussière, l'écu brisé qui monte
        if (!prete("effet-poussiere")) { ctx.globalAlpha = Math.max(0, a); dessinerIcone(ctx, "ecu-brise", e.x, e.y - 12 - e.age * 14, 22, e.camp === "rival" ? v.adverse.couleurs[0] : v.couleurs[0]); ctx.globalAlpha = 1; }
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
      } else if (e.genre === "tourRivale") {
        // le rival bâtit une tour pendant ta préparation : de la poussière à son pied (la tour apparaît en fondu : tour(),
        // et son onde est au sol, plus haut)
        if (e.age < 0.7) sprite(ctx, "effet-poussiere", e.x, e.y + 2, vue(e.age, 0.7, 5), false, 1.1);
      } else if (e.genre === "sortie" || e.genre === "rentree") {
        // un garde de la garnison sort par la porte du rival (ou y rentre) : une bouffée de poussière sur le seuil
        if (e.age < 0.45) sprite(ctx, "effet-poussiere", e.x, e.y + 2, vue(e.age, 0.45, 5), false, e.genre === "sortie" ? 0.55 : 0.4);
      } else if (e.genre === "porteOuverte") {
        // la garnison du rival est vaincue, sa porte s'ouvre à tes troupes : poussière et éclats (l'anneau doré est au sol)
        if (e.age < 0.8) sprite(ctx, "effet-poussiere", e.x, e.y + 4, vue(e.age, 0.8, 5), false, 1.1);
        if (e.age < 0.32) sprite(ctx, "effet-eclats", e.x, e.y - 8, vue(e.age, 0.32, 4), false, 1.1);
      }
      if (decale) ctx.restore();
    }
    // particules (bataille-effets.js) : mottes des pierres, éclats
    if (FX) R.particules = FX.dessiner(ctx);

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

  // ---------- au ras du sol (lot A) ----------
  // Après les bataillons et les corps, avant les murs, les tours et les troupes : chaque effet du moteur vu pour la
  // première fois pose ses traces (premiereVue) ; puis les anneaux des pierres et les poussières (choc d'une charge,
  // trait qui touche, palissade, chute, retrait de fin de bataille), moins opaques qu'avant : les troupes passent devant.
  // Sang coupé : la poussière d'une figurine qui tombe.
  var POUSSEE = 48, RECUL = 0.08, OPACITE_POUSSIERE = 0.72;
  function solEffets(ctx, v, anim, sang, FX, SOL) {
    var p = v.partie, poussiere = !!prete("effet-poussiere"), i, e;
    for (i = 0; i < p.effets.length; i++) {
      e = p.effets[i];
      var g = e.genre;
      if (!e.vuSol) { e.vuSol = true; premiereVue(e, v, anim, sang, FX, SOL); }
      var decale = g === "touche" || g === "pique" || g === "impact" || g === "choc" || g === "chute";
      if (decale) decalEffet(e, v);
      var x = e.x + (decale ? e.dvx : 0), y = e.y + (decale ? e.dvy : 0);
      if (g === "impact") {
        // anneau brun au ras du sol, de 10 à 40 px en 0,35 s ; animations coupées : une tache fixe
        if (anim) { if (e.age < 0.35) onde(ctx, x, y + 2, 10 + 30 * e.age / 0.35, 1 - e.age / 0.35, "#6b4a2a"); }
        else if (e.age < 0.75) { ctx.globalAlpha = 0.3; ctx.fillStyle = "#4a3420"; ctx.beginPath(); ctx.ellipse(x, y + 2, 22, 15, 0, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; }
        continue;
      }
      if (!poussiere) continue;
      ctx.globalAlpha = OPACITE_POUSSIERE;
      if (g === "touche" || g === "pique") { if (e.age < 0.45) sprite(ctx, "effet-poussiere", x, y + 2, vue(e.age, 0.45, 5), false, g === "pique" ? 0.5 : 0.4); }
      else if (g === "choc") { if (e.charge && e.age < 0.45) sprite(ctx, "effet-poussiere", x, y + 2, vue(e.age, 0.45, 5), false, 0.6); }
      else if (g === "chute") { if (e.age < 0.6) sprite(ctx, "effet-poussiere", x, y + 2, vue(e.age, 0.6, 5), false, 0.75); }
      else if (g === "retrait") { if (e.age < 0.6) sprite(ctx, "effet-poussiere", x, y + 2, vue(e.age, 0.6, 5), false, 0.9); }
      ctx.globalAlpha = 1;
    }
    if (!sang && poussiere) {
      ctx.globalAlpha = OPACITE_POUSSIERE;
      for (i = 0; i < v.corps.length; i++) { e = v.corps[i]; if (e.age < 0.5) sprite(ctx, "effet-poussiere", e.x, e.y + 1, vue(e.age, 0.5, 5), false, 0.4); }
      ctx.globalAlpha = 1;
    }
  }
  // Un effet vu pour la première fois. Pierre (« impact ») : son cratère dans la couche de sol, ses mottes, et les
  // figurines à moins de POUSSEE px bousculées de 1 à 2 px puis ramenées (bousculer). Trait qui touche (« touche ») : la
  // figurine touchée recule d'un pixel pendant RECUL s et s'assombrit un instant ; une ou deux flèches plantées à côté.
  // Animations coupées : ni mottes, ni poussée, ni recul. Sang coupé : rien n'est posé que le cratère.
  function premiereVue(e, v, anim, sang, FX, SOL) {
    if (e.genre !== "impact" && e.genre !== "touche") return;
    decalEffet(e, v);
    var x = e.x + e.dvx, y = e.y + e.dvy, graine = FX ? FX.graineDe(e.x, e.y) : 1, t = v.partie.temps;
    if (e.genre === "impact") {
      if (SOL) poserCratere(v, x, y, e.rayon || 32, SOL);
      if (FX && anim) { FX.mottes(x, y, graine); bousculer(v, x, y, t); }
      return;
    }
    if (anim) {
      var fg = figurineTouchee(v, x, y);
      if (fg) { fg.recul = t; fg.reculX = fg.gauche ? 1 : -1; }
    }
    if (SOL && sang && FX) {
      var n = FX.alea(graine, 5) < 0.45 ? 2 : 1;
      for (var k = 0; k < n; k++) {
        var sens = FX.alea(graine, 6 + k) < 0.5 ? -1 : 1, fx = x + sens * (3 + 6 * FX.alea(graine, 8 + k)), fy = y + 1 + 4 * FX.alea(graine, 10 + k);
        var img = SOL.flechePlantee(v.ratio, sens);
        SOL.poser(v.sol, "fleches", t, img, Math.round(fx * v.ratio - img.axd), Math.round(fy * v.ratio - img.ayd));
      }
    }
  }
  // Les figurines debout à moins de POUSSEE px du point (x, y) sont poussées en s'en écartant (de 2 px tout près à 1 px
  // au bord), puis ramenées en 0,3 s (majBataillon, amortiPoussee).
  function bousculer(v, x, y, t) {
    for (var i = 0; i < v.vus.length; i++) {
      var b = v.vus[i].bat;
      if (!b || b.vx === undefined || Math.abs(b.vx - x) > POUSSEE + 30 || Math.abs(b.vy - y) > POUSSEE + 30) continue;
      for (var k = 0; k < b.figs.length; k++) {
        var fg = b.figs[k];
        if (!fg.debout || !fg.vu) continue;
        var dx = fg.x - x, dy = fg.y - y, d = Math.sqrt(dx * dx + dy * dy);
        if (d >= POUSSEE || d < 0.01) continue;
        var amp = 1 + (1 - d / POUSSEE);
        fg.pousse = t; fg.pousseX = dx / d * amp; fg.pousseY = dy / d * amp * 0.7;
      }
    }
  }
  // 0 → 1 en 40 ms, puis retour à 0 en 0,26 s (amorti) ; 0 ensuite.
  function amortiPoussee(tau) {
    if (!(tau >= 0) || tau >= 0.3) return 0;
    if (tau < 0.04) return tau / 0.04;
    var k = 1 - (tau - 0.04) / 0.26;
    return k * k;
  }
  // La figurine debout la plus proche du point où un trait touche une troupe (14 px au plus), parmi les troupes vues.
  function figurineTouchee(v, x, y) {
    var meilleure = null, dm = 196;
    for (var i = 0; i < v.vus.length; i++) {
      var b = v.vus[i].bat;
      if (!b || b.vx === undefined || Math.abs(b.vx - x) > 30 || Math.abs(b.vy - y) > 30) continue;
      for (var k = 0; k < b.figs.length; k++) {
        var fg = b.figs[k];
        if (!fg.debout || !fg.vu) continue;
        var d = (fg.x - x) * (fg.x - x) + (fg.y - y) * (fg.y - y);
        if (d < dm) { dm = d; meilleure = fg; fg.gauche = b.gauche; }
      }
    }
    return meilleure;
  }
  // Cratère d'une pierre dans la couche de sol : l'image rendue (effet-cratere : herbe, ou route si la pierre tombe sur la
  // route), sinon celui de bataille-sol.js ; à la taille de la zone touchée.
  function poserCratere(v, x, y, rayon, SOL) {
    var pts = v.partie.route.points, d = Infinity;
    for (var k = 0; k < pts.length; k += 3) d = Math.min(d, (pts[k][0] - x) * (pts[k][0] - x) + (pts[k][1] - y) * (pts[k][1] - y));
    var variante = d < 16 * 16 ? 1 : 0, echelle = Math.max(0.8, Math.min(1.4, rayon / 40)), img;
    if (prete("effet-cratere")) img = vueFigure("effet-cratere", "pied", "", null, variante, false, echelle, v.ratio);
    else img = SOL.cratere(v.ratio, variante);
    SOL.poser(v.sol, "crateres", v.partie.temps, img, Math.round(x * v.ratio - img.axd), Math.round((y + 2) * v.ratio - img.ayd));
  }
  // Gouttes retombées des giclées finies (coups de la mêlée, chutes) : posées en taches dans la couche de sol, une fois.
  var tachesTmp = new Float32Array(4 * 16);
  function poserTaches(v, SOL) {
    var p = v.partie, i, e;
    for (i = 0; i < p.effets.length; i++) { e = p.effets[i]; if (e.gicle && !e.tachee && e.age >= GICLEE_COUP) tacher(e, v, SOL); }
    for (i = 0; i < v.corps.length; i++) { e = v.corps[i]; if (e.gicle && !e.tachee && e.age >= GICLEE_CHUTE) tacher(e, v, SOL); }
  }
  function tacher(e, v, SOL) {
    e.tachee = true;
    var n = gouttes(e, e.genre === "chute" ? GICLEE_CHUTE : GICLEE_COUP), m = 0;
    for (var i = 0; i < n && m < 16; i++) {
      var j = i * 6;
      if (!gouttesTmp[j + 5]) continue; // encore en l'air à la fin de la giclée : elle ne laisse rien
      tachesTmp[m * 4] = gouttesTmp[j]; tachesTmp[m * 4 + 1] = gouttesTmp[j + 1]; tachesTmp[m * 4 + 2] = gouttesTmp[j + 2]; tachesTmp[m * 4 + 3] = gouttesTmp[j + 3];
      m++;
    }
    if (m) SOL.poserTaches(v.sol, v.partie.temps, tachesTmp, m, ROUGE_POSE);
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
  // Onde à plat sur le sol, à la couleur d'un camp (sa tour neuve, l'alerte à sa porte), cernée d'encre, qui s'efface (alpha).
  function onde(ctx, x, y, r, alpha, couleur) {
    if (alpha <= 0) return;
    ctx.globalAlpha = Math.min(1, alpha);
    ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.7, 0, 0, Math.PI * 2);
    ctx.lineWidth = 4.5; ctx.strokeStyle = "rgba(20,12,6,.5)"; ctx.stroke();
    ctx.lineWidth = 2.5; ctx.strokeStyle = couleur; ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // Un trait vise le bataillon de sa cible là où il est dessiné (dvx, dvy : décalage du dessin, gardé si la cible tombe).
  function viseeTrait(pr) {
    var c = pr.cible;
    if (c && c.vivant && c.bat && c.bat.vx !== undefined) { pr.dvx = c.bat.vx - c.x; pr.dvy = c.bat.vy - c.y; }
    else if (pr.dvx === undefined) { pr.dvx = 0; pr.dvy = 0; }
  }
  // Effet du moteur posé à la place d'une troupe (trait qui touche, chute, choc…) : il se dessine là où est son
  // bataillon (dvx, dvy), cherché une fois, au premier dessin, parmi les troupes vues et celles tombées depuis peu.
  function decalEffet(e, v) {
    if (e.dvx !== undefined) return;
    e.dvx = 0; e.dvy = 0;
    var meilleur = e.genre === "choc" ? 196 : 36, n = v.vus.length, morts = v.morts || [], k, u, d;
    for (k = 0; k < n + morts.length; k++) {
      u = k < n ? v.vus[k] : morts[k - n].u;
      if (!u.bat || u.bat.vx === undefined) continue;
      d = (u.x - e.x) * (u.x - e.x) + (u.y - e.y) * (u.y - e.y);
      if (d < meilleur) { meilleur = d; e.dvx = u.bat.vx - u.x; e.dvy = u.bat.vy - u.y; }
    }
  }

  // Traits à l'échelle (lot A) : flèche de 12 px, carreau de 16 px, pierre de 9 px. Animations actives : une tour
  // d'archers tire une volée de 3 flèches (dessin seulement : décalées de ± 4 px, parties de 0 à 60 ms après la première,
  // toutes arrivées avec elle ; le moteur n'en tire qu'une, dégâts inchangés), flèches et carreaux laissent une traînée
  // crème (bataille-effets.js), la pierre tourne sur elle-même et un petit nuage la suit.
  // Départ : pr.tirX, pr.tirY s'ils sont posés (point « tir » de la tour, lot A3), sinon le haut de la tour.
  var ECHELLE_FLECHE = 0.5, ECHELLE_CARREAU = 0.5, ECHELLE_PIERRE = 9 / 14, VOLEE = [[0, 0], [0.03, 4], [0.06, -4]];
  function projectile(ctx, pr, v, FX, anim) {
    var k = Math.min(1, pr.t / pr.duree), pierre = pr.genre === "pierre";
    viseeTrait(pr);
    // départ en haut de la tour, arrivée à mi-corps (la pierre, elle, tombe au sol)
    var x0 = pr.tirX !== undefined ? pr.tirX : pr.x0, y0 = pr.tirY !== undefined ? pr.tirY : pr.y0 - HAUT_TIR;
    var dx = pr.cx + pr.dvx - x0, dy = pr.cy + pr.dvy - (pierre ? 0 : HAUT_CORPS) - y0;
    var A = pierre ? 70 : pr.genre === "fleche" ? 18 : 5; // hauteur de la cloche
    var x = x0 + dx * k, y = y0 + dy * k - Math.sin(k * Math.PI) * A, ratio = v.ratio;
    if (pierre) {
      var bouge = FX && anim, fait;
      if (bouge) {
        var nu = bouffee(false);
        for (var j = 1; j <= 2; j++) {
          var kj = k - 0.05 * j;
          if (kj <= 0) break;
          var rj = 2.5 + 1.5 * j;
          ctx.globalAlpha = 0.24 / j;
          ctx.drawImage(nu, x0 + dx * kj - rj, y0 + dy * kj - Math.sin(kj * Math.PI) * A - rj, 2 * rj, 2 * rj);
        }
        ctx.globalAlpha = 1;
        var ar = pr.t * 9, ca = Math.cos(ar), sa = Math.sin(ar);
        ctx.setTransform(ratio * ca, ratio * sa, -ratio * sa, ratio * ca, x * ratio, y * ratio);
        fait = sprite(ctx, "effet-pierre", 0, 0, 0, false, ECHELLE_PIERRE);
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      } else fait = sprite(ctx, "effet-pierre", x, y, 0, false, ECHELLE_PIERRE);
      if (!fait) {
        ctx.fillStyle = "#6d6457"; ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "#2e2419"; ctx.lineWidth = 1.2; ctx.stroke();
      }
      return;
    }
    var fleche = pr.genre === "fleche", nom = fleche ? "effet-fleche" : "effet-carreau", ech = fleche ? ECHELLE_FLECHE : ECHELLE_CARREAU;
    var n = fleche && anim && FX ? VOLEE.length : 1, lg = Math.sqrt(dx * dx + dy * dy) || 1, nx = -dy / lg, ny = dx / lg;
    var queue = (fleche ? 24 : 32) * ech / 2, traine = FX && anim;
    if (traine && pr.graine === undefined) pr.graine = FX.graineDe(pr.x0 + pr.duree * 97, pr.y0);
    for (var i = 0; i < n; i++) {
      var kk = k, ox = 0;
      if (i) {
        var d = VOLEE[i][0] * (0.6 + 0.8 * FX.alea(pr.graine, i));
        kk = (pr.t - d) / Math.max(0.05, pr.duree - d);
        if (kk <= 0) continue;
        kk = Math.min(1, kk); ox = VOLEE[i][1] * (0.7 + 0.5 * FX.alea(pr.graine, i + 3));
      }
      var xi = x0 + dx * kk + nx * ox, yi = y0 + dy * kk - Math.sin(kk * Math.PI) * A + ny * ox;
      var ang = Math.atan2(dy - A * Math.PI * Math.cos(kk * Math.PI), dx), c = Math.cos(ang), sn = Math.sin(ang);
      ctx.setTransform(ratio * c, ratio * sn, -ratio * sn, ratio * c, xi * ratio, yi * ratio); // tangente à la trajectoire
      if (!sprite(ctx, nom, 0, 0, 0, false, ech)) {
        var l = fleche ? 8 : 11;
        ctx.strokeStyle = "#2a1c0c"; ctx.lineWidth = fleche ? 1.2 : 2;
        ctx.beginPath(); ctx.moveTo(-l, 0); ctx.lineTo(0, 0); ctx.stroke();
        ctx.fillStyle = "#3a3a3a"; ctx.beginPath(); ctx.moveTo(1.5, 0); ctx.lineTo(-2, -1.5); ctx.lineTo(-2, 1.5); ctx.fill();
        ctx.fillStyle = pr.camp === "rival" ? "#efe6d2" : v.couleurs[1]; ctx.fillRect(-l, -1, 2, 2);
      }
      if (traine && kk > 0.04) {
        var tx = xi - c * queue, ty = yi - sn * queue, lt = fleche ? 9 : 10;
        FX.trainee(tx, ty, tx - c * lt, ty - sn * lt);
      }
    }
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
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

  // Une tour que le rival vient de bâtir (effet « tourRivale », v.naissance) apparaît en fondu sur NAISSANCE_TOUR s.
  var NAISSANCE_TOUR = 0.7;
  function fonduTour(tr, v) {
    var n = v.naissance;
    return tr.rivale && n && n[tr.emplacement] !== undefined ? Math.max(0.05, Math.min(1, n[tr.emplacement] / NAISSANCE_TOUR)) : 1;
  }
  function tour(ctx, tr, v) {
    var nom = nomTour(tr, v), ft = fonduTour(tr, v);
    if (ft < 1) ctx.globalAlpha = ft;
    if (sprite(ctx, nom, tr.x, tr.y, 0)) {
      var s = descr(nom);
      if (!tr.rivale) pastilles(ctx, tr.x, tr.y + s.h - s.ay, tr.niveau);
    } else tourDessinee(ctx, tr, tr.rivale ? v.adverse.couleurs : v.couleurs);
    if (ft < 1) ctx.globalAlpha = 1;
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

  // ---------- troupes : des bataillons ----------
  // Depuis le 16/10/2026 (demande de Romain : « au lieu de soldats, des bataillons, pour faire des batailles plus
  // impressionnantes »), chaque troupe du moteur est dessinée en bataillon : une formation de petites figurines (les
  // images 3D des troupes, réduites), en rangs sur la route. Le moteur ne change pas : la troupe garde sa place sur la
  // route, ses points de vie, sa mêlée et ses effets ; seul le dessin la montre en formation (BATAILLONS).
  // - Fantassins et piétaille : deux rangs de quatre ; hommes d'armes : deux rangs de trois ; cavaliers : trois devant,
  //   deux derrière ; champion : une grande figurine et sa garde de quatre hommes d'armes ; tour de siège : l'engin et
  //   trois hommes qui le poussent. Un porte-bannière aux couleurs du camp dans chaque bataillon (la tour de siège porte
  //   déjà la sienne ; le champion porte lui-même son étendard). Même traitement pour tous les camps.
  // - La formation suit la route : chaque figurine est posée sur le tracé à sa propre distance le long de la route (les
  //   rangs prennent les virages) et reste dans sa largeur (BORD_ROUTE px du milieu au plus ; sur un pont, elle se
  //   resserre à SERRE_PONT de sa largeur, pour tenir sur le tablier). Chaque figurine a sa
  //   propre cadence de marche et un petit décalage : le bataillon ne marche pas au pas comme une seule image. Elle
  //   regarde où elle marche (un garde qui rentre à sa porte se retourne) ; en mêlée, vers l'adversaire.
  // - Pertes : quand la troupe perd des points de vie, ses figurines tombent une à une (debout = arrondi supérieur de
  //   figurines × pv / max, au moins une tant que la troupe vit) ; en mêlée, c'est le premier rang qui tombe, ailleurs
  //   une figurine au hasard ; le porte-bannière (le champion, l'engin) tombe le dernier, et un homme d'un rang de
  //   derrière avance pour boucher le trou (les rangs se resserrent). Chaque figurine tombée reste couchée au sol, avec
  //   le traitement du sang des soldats tombés (plus bas).
  // - Mêlée : les deux bataillons se font face, premier rang contre premier rang. Le premier rang se fend et frappe,
  //   chaque homme à son rythme, et tout le premier rang se fend quand la troupe porte un coup ; le second rang pousse.
  //   Le moteur engage deux troupes à 20 px (MELEE.contact) et les fait combattre à 16 px (MELEE.ecart) : des cavaliers,
  //   longs, se seraient traversés ; et plusieurs duels se tiennent souvent au même endroit. Chaque mêlée est donc rangée
  //   en ligne de front, à l'œil seulement (pas dans le moteur) : premiers rangs à ECART_FRONTS px l'un de l'autre, les
  //   autres bataillons engagés en deuxième ligne, les troupes libres à la file derrière (placerMelees, plus bas).
  //   Ceux de la deuxième ligne poussent : seuls les premiers rangs au contact se fendent.
  // - Barre de vie : seulement pour le champion et la tour de siège (une grande figurine seule) ; pour les autres, les
  //   figurines qui tombent la remplacent (une pile de barres cachait la mêlée).
  // Vitesse (PC sans carte graphique) : chaque vue de chaque figurine est réduite une fois, à la netteté de la toile,
  // dans une petite toile gardée (vueFigure) ; une image du combat ne fait que copier ces petites toiles pixel pour pixel
  // (positions arrondies au pixel de l'écran), ombres et bannières comprises.
  var ECHELLE_TROUPE = 1.2; // taille d'une troupe seule avant les bataillons : l'étalon des flaques et des giclées
  var PAS_PIETON = 4.5, PAS_CHEVAL = 9; // px parcourus par cran de pas (lot A : un cycle de marche pour 15 px à pied)
  var BORD_ROUTE = 12, ECART_FRONTS = 2, CORPS_MAX = 150, MILIEU_MELEE = 0.3, SERRE_PONT = 0.65;
  // rangs : figurines par rang, du premier (face à l'ennemi) au dernier ; pasRang : écart entre deux rangs, le long de la
  // route ; pasFile : écart entre deux voisins d'un rang, en travers de la route ; echelle : taille des figurines (× leur
  // image) ; allonge : demi-longueur d'une figurine du premier rang (corps et arme), le long de la route ; banniere :
  // hauteur de la hampe au-dessus des pieds du porte-bannière (0 : pas de bannière). chef : taille de la grande figurine,
  // posée sur la troupe ; garde : type des figurines qui l'entourent ; places : leur place [le long, en travers] (px,
  // positif : vers l'avant) ; barre : barre de vie au-dessus du chef.
  var BATAILLONS = {
    fantassins: { rangs: [4, 4], pasRang: 6.5, pasFile: 4.4, echelle: 0.6, allonge: 4, banniere: 28 },
    pietaille: { rangs: [4, 4], pasRang: 6.5, pasFile: 4.4, echelle: 0.6, allonge: 4, banniere: 28 },
    hommes: { rangs: [3, 3], pasRang: 7, pasFile: 5.6, echelle: 0.64, allonge: 4.5, banniere: 29 },
    cavaliers: { rangs: [3, 2], pasRang: 11, pasFile: 7.5, echelle: 0.56, allonge: 8.5, banniere: 31 },
    champion: { chef: 0.92, garde: "hommes", places: [[3, -9.5], [3, 9.5], [-7, -5.5], [-7, 5.5]], echelle: 0.6, allonge: 7, banniere: 47, barre: true },
    belier: { chef: 1, garde: "fantassins", places: [[-19, -6.5], [-20.5, 0.5], [-19, 7.5]], echelle: 0.58, allonge: 13, banniere: 0, barre: true }
  };

  // Places d'un bataillon (calculées une fois par type) : [{ a (le long, vers l'avant), b (en travers), rang (0 : premier
  // rang), type (image), echelle, noyau (porte-bannière, champion ou engin : tombe le dernier) }], avant (décalage qui
  // centre les rangs sur la troupe), tete (place du premier rang), bmin, bmax (largeur en travers). Type inconnu (une
  // nouvelle troupe du moteur) : la formation des hommes d'armes.
  var formes = {};
  function formation(type) {
    if (formes[type]) return formes[type];
    var d = BATAILLONS[type] || BATAILLONS.hommes, places = [], i, r;
    if (d.chef) {
      places.push({ a: 0, b: 0, rang: 0, type: type, echelle: d.chef, noyau: true });
      d.places.forEach(function (q) { places.push({ a: q[0], b: q[1], rang: q[0] >= 0 ? 0 : 1, type: d.garde, echelle: d.echelle, noyau: false }); });
    } else {
      for (r = 0; r < d.rangs.length; r++) {
        var n = d.rangs[r], quinconce = d.rangs.length > 1 && n === d.rangs[0] ? (r % 2 ? 0.25 : -0.25) * d.pasFile : 0;
        for (i = 0; i < n; i++) places.push({ a: -r * d.pasRang, b: (i - (n - 1) / 2) * d.pasFile + quinconce, rang: r, type: type, echelle: d.echelle, noyau: false });
      }
      // le porte-bannière : au dernier rang, au milieu (jamais la dernière place : c'est elle qui avance boucher les trous)
      var dernier = d.rangs[d.rangs.length - 1];
      places[places.length - dernier + Math.floor((dernier - 1) / 2)].noyau = true;
    }
    var amin = Infinity, amax = -Infinity, bmin = Infinity, bmax = -Infinity;
    places.forEach(function (q) { amin = Math.min(amin, q.a); amax = Math.max(amax, q.a); bmin = Math.min(bmin, q.b); bmax = Math.max(bmax, q.b); });
    var avant = d.chef ? 0 : -(amin + amax) / 2;
    // devant, derriere : étendue du bataillon le long de la route, depuis son milieu, vers l'avant (premier rang et son
    // allonge) et vers l'arrière (dernier rang et un peu plus de la moitié d'une figurine)
    return (formes[type] = { type: type, d: d, places: places, avant: avant, tete: amax + avant, queue: amin + avant, bmin: bmin, bmax: bmax,
      allonge: d.allonge, devant: amax + avant + d.allonge, derriere: 0.6 * d.allonge - (amin + avant), banniere: d.banniere, barre: !!d.barre });
  }
  // Figurines debout pour une troupe de « n » figurines : toutes à pleine vie, au moins une tant qu'elle vit, aucune morte.
  function deboutVoulu(n, pv, max, vivant) {
    if (!vivant || pv <= 0) return 0;
    return Math.max(1, Math.min(n, Math.ceil(n * pv / (max || pv) - 1e-9)));
  }
  // Décalage du milieu du bataillon en travers de la route : celui de la troupe (sa file, cote), ramené pour que toutes
  // les figurines restent à BORD_ROUTE px du milieu de la route au plus.
  function coteBataillon(f, cote) {
    var haut = BORD_ROUTE - f.bmax, bas = -BORD_ROUTE - f.bmin;
    return haut < bas ? (haut + bas) / 2 : Math.max(bas, Math.min(haut, cote));
  }
  // ---------- mêlées : la ligne de front, à l'œil ----------
  // Le moteur engage deux troupes à 20 px (MELEE.contact) et les fait combattre à 16 px (MELEE.ecart) ; il laisse aussi
  // plusieurs duels se tenir au même endroit (la paire la plus proche d'abord), une troupe libre traverser une mêlée qui
  // ne la concerne pas, un garde passer devant tes troupes déjà engagées (il peut ensuite se battre « à l'envers », du
  // côté de ton château), et il arrête tes troupes devant la porte du rival tant que sa garnison tient (u.porte).
  // Dessinés à leur place du moteur, les bataillons des deux camps se mêlaient. Le dessin range donc chaque mêlée en une
  // ligne de front, sans rien changer au moteur (placerMelees, avant chaque image) :
  // - les duels dont les bataillons se toucheraient forment une seule mêlée ; sa ligne de front (F, le long de la route)
  //   est au milieu des milieux de ses duels, gardée assez loin des portes pour que le premier bataillon de chaque camp
  //   tienne devant la sienne ; tes bataillons du côté de ton château, ceux du rival du côté du sien (un duel « à
  //   l'envers » est remis dans ce sens) ;
  // - de chaque côté, les bataillons engagés de ce camp se rangent l'un derrière l'autre, dans l'ordre où ils se sont
  //   engagés (l'ordre ne saute pas d'une image à l'autre) : le premier au contact, premier rang contre premier rang
  //   (ECART_FRONTS px entre les deux, allonges comprises), les autres en deuxième ligne, à ECART_FILE px du précédent :
  //   ils poussent ; deux mêlées qui, rangées, se chevauchent n'en font qu'une ;
  // - une troupe libre qui arrive sur une mêlée attend à la file derrière les siens, tant que le moteur ne l'a pas fait
  //   passer de l'autre côté ; quand il l'a fait passer, elle traverse vite (TRAVERSE px/s) pour rejoindre sa place ;
  // - devant la porte du rival, tes troupes arrêtées par sa garnison se rangent à la file, devant la porte et bien visibles.
  // Décalage le long de la route : DECAL_MELEE px au plus pour un bataillon engagé, DECAL_FILE pour une troupe libre,
  // DECAL_PORTE devant la porte. Les traits des tours, les coups et les chutes suivent le bataillon là où il est dessiné.
  var ECART_FILE = 3, DECAL_MELEE = 60, DECAL_FILE = 60, DECAL_PORTE = 140, MARGE_PORTE = 2, GLISSE = 120, TRAVERSE = 170;
  var paires = [], melees = [], libres = [];
  function parS(a, b) { return a.s - b.s; }
  function parEngagement(x, y) { return x.bat.engage - y.bat.engage; }
  // Écrit dans u.bat : cible (décalage voulu le long de la route, px), slot (0 : au contact, 1 et plus : deuxième ligne,
  // −1 : hors mêlée), front (ligne de front de sa mêlée, le long de la route), file (troupe libre qui attend derrière une
  // mêlée ou devant la porte). liste : troupes vivantes, avec leur bataillon. Rend les mêlées (essais).
  function placerMelees(p, liste) {
    var L = p.route.longueur, i, j, u, b, a, pr, m;
    paires.length = 0; melees.length = 0; libres.length = 0;
    for (i = 0; i < liste.length; i++) {
      u = liste[i]; b = u.bat;
      b.cible = 0; b.slot = -1; b.file = false; b.front = undefined;
      a = u.adversaire && u.adversaire.vivant && u.adversaire.pv > 0 && u.adversaire.bat ? u.adversaire : null;
      if (!a) { b.engage = Infinity; libres.push(u); continue; }
      if (b.engage === Infinity || b.engage === undefined) b.engage = p.temps + i * 1e-6; // heure de son engagement
      if (u.camp === "rival" || a.camp !== "rival") continue; // chaque duel une fois, par ta troupe
      var fa = b.f, fr = a.bat.f;
      paires.push({ a: u, r: a, m: (u.s + a.s) / 2, ext: ECART_FRONTS / 2 + Math.max(fa.devant + fa.derriere, fr.devant + fr.derriere) });
    }
    paires.sort(function (x, y) { return x.m - y.m; });
    // duels qui se touchent : une seule mêlée
    for (i = 0; i < paires.length; i++) {
      pr = paires[i]; m = melees[melees.length - 1];
      if (!m || pr.m - m.der.m >= m.der.ext + pr.ext) melees.push(m = { somme: 0, n: 0, J: [], R: [], der: pr });
      m.somme += pr.m; m.n++; m.der = pr; m.J.push(pr.a); m.R.push(pr.r);
    }
    for (i = 0; i < melees.length; i++) rangerMelee(melees[i], L);
    // deux mêlées voisines qui, rangées, se chevauchent (leurs deuxièmes lignes) n'en font qu'une
    for (i = 1; i < melees.length; i++) {
      var m0 = melees[i - 1];
      m = melees[i];
      if (m0.finR > m.finJ - ECART_FILE) {
        m0.somme += m.somme; m0.n += m.n;
        for (j = 0; j < m.J.length; j++) m0.J.push(m.J[j]);
        for (j = 0; j < m.R.length; j++) m0.R.push(m.R[j]);
        melees.splice(i, 1);
        rangerMelee(m0, L);
        i = Math.max(0, i - 2);
      }
    }
    // troupes libres : à la file derrière les leurs, sur la première mêlée qu'elles n'ont pas encore traversée (ou devant
    // la porte du rival), de la plus avancée à la moins avancée ; une troupe dessinée déjà de l'autre côté de la ligne de
    // front (elle vient de la traverser) n'y est pas reprise, sauf ta troupe arrêtée devant la porte du rival (elle n'a
    // rien traversé : elle attend) ; une troupe pas encore dessinée n'a rien traversé
    libres.sort(parS);
    var porte = L - MARGE_PORTE, porteFermee = false, f, lim, vu;
    for (j = libres.length - 1; j >= 0; j--) {
      u = libres[j];
      if (u.camp === "rival") continue;
      m = null; vu = u.porte || u.bat.decal === undefined ? -Infinity : u.s + u.bat.decal;
      for (i = 0; i < melees.length && !m; i++) if (u.s <= melees[i].finR + 2 && vu <= melees[i].F) m = melees[i];
      var cap = u.porte ? DECAL_PORTE : DECAL_FILE, avant = m && i > 1 ? melees[i - 2] : null;
      f = u.bat.f;
      if (m) {
        if (m.fermeJ) continue;
        // jamais reculée dans la mêlée d'avant, qu'elle a déjà traversée : entre les deux, elle reste parmi les siens
        lim = Math.max(m.posJ - f.devant, avant ? avant.finR + f.derriere + 1 : -Infinity);
        if (u.s > lim) { aLaFile(u, Math.max(lim, u.s - cap), m.F); m.posJ = u.s + u.bat.cible - f.derriere - ECART_FILE; } else m.fermeJ = true;
      } else if (u.porte && !porteFermee) {
        lim = porte - f.devant;
        if (u.s > lim) { aLaFile(u, Math.max(lim, u.s - cap), L); porte = u.s + u.bat.cible - f.derriere - ECART_FILE; } else porteFermee = true;
      }
    }
    for (j = 0; j < libres.length; j++) {
      u = libres[j];
      if (u.camp !== "rival") continue;
      m = null; vu = u.bat.decal === undefined ? Infinity : u.s + u.bat.decal;
      for (i = melees.length - 1; i >= 0 && !m; i--) if (u.s >= melees[i].finJ - 2 && vu >= melees[i].F) m = melees[i];
      if (!m || m.fermeR) continue;
      var apres = i + 2 < melees.length ? melees[i + 2] : null;
      f = u.bat.f; lim = Math.min(m.posR + f.devant, apres ? apres.finJ - f.derriere - 1 : Infinity);
      if (u.s < lim) { aLaFile(u, Math.min(lim, u.s + DECAL_FILE), m.F); m.posR = u.s + u.bat.cible + f.derriere + ECART_FILE; } else m.fermeR = true;
    }
    return melees;
  }
  // Range une mêlée : de part et d'autre de sa ligne de front F, tes bataillons engagés vers ton château (s plus petit),
  // ceux du rival vers le sien. posJ, posR : place du bataillon suivant de chaque camp (troupes libres à la file) ;
  // finJ, finR : bouts de la mêlée.
  function rangerMelee(m, L) {
    var F = m.somme / m.n;
    m.J.sort(parEngagement); m.R.sort(parEngagement);
    var bas = m.J[0].bat.f, haut = m.R[0].bat.f;
    var fmin = MARGE_PORTE + ECART_FRONTS / 2 + bas.devant + bas.derriere, fmax = L - MARGE_PORTE - ECART_FRONTS / 2 - haut.devant - haut.derriere;
    if (fmin <= fmax) F = Math.max(fmin, Math.min(fmax, F));
    m.F = F;
    m.posJ = rangerFront(m.J, F - ECART_FRONTS / 2, -1, F);
    m.posR = rangerFront(m.R, F + ECART_FRONTS / 2, 1, F);
    m.finJ = m.posJ + ECART_FILE; m.finR = m.posR - ECART_FILE;
    m.fermeJ = m.fermeR = false;
  }
  // Range les bataillons engagés d'un camp, du premier au contact au dernier : « front » est le bout de leur premier rang
  // (allonge comprise), « dos » le sens de leur arrière le long de la route. Rend la place du bataillon suivant.
  function rangerFront(liste, front, dos, F) {
    for (var k = 0; k < liste.length; k++) {
      var u = liste[k], b = u.bat, f = b.f;
      var c = front + dos * f.devant;
      c = Math.max(u.s - DECAL_MELEE, Math.min(u.s + DECAL_MELEE, c));
      b.cible = c - u.s; b.slot = k; b.front = F;
      front = c + dos * (f.derriere + ECART_FILE);
    }
    return front;
  }
  function aLaFile(u, c, F) { u.bat.cible = c - u.s; u.bat.file = true; u.bat.front = F; }

  // Point de la route à la distance s, décalé de « cote » px sur le côté : le calcul de M.surRoute (même résultat), avec
  // une recherche par moitiés dans les longueurs cumulées (les routes ont 200 à 400 points), écrit dans « o ».
  function pointRoute(route, s, cote, o) {
    var c = route.cumul, p = route.points, lo = 1, hi = c.length - 1, mi;
    s = s < 0 ? 0 : s > route.longueur ? route.longueur : s;
    while (lo < hi) { mi = (lo + hi) >> 1; if (c[mi] < s) lo = mi + 1; else hi = mi; }
    var t = (s - c[lo - 1]) / ((c[lo] - c[lo - 1]) || 1);
    var dx = p[lo][0] - p[lo - 1][0], dy = p[lo][1] - p[lo - 1][1], l = Math.sqrt(dx * dx + dy * dy) || 1;
    o.x = p[lo - 1][0] + dx * t - dy / l * cote; o.y = p[lo - 1][1] + dy * t + dx / l * cote; o.tx = dx / l; // tx : sens de la route (vers l'est > 0)
    return o;
  }

  // État de dessin d'un bataillon (u.bat, ignoré par le moteur) : ses figurines, leur place, leur décalage, leur pas.
  function creerBataillon(u, f, cleCamp) {
    var figs = [];
    for (var i = 0; i < f.places.length; i++) {
      var q = f.places[i];
      figs.push({ place: i, a: q.a, b: q.b, ja: (Math.random() - 0.5) * 1.8, jb: (Math.random() - 0.5) * 1.3, phase: Math.random() * 4,
        delai: Math.random() * 0.14, debout: true, noyau: q.noyau, nom: "unite-" + q.type + "-" + cleCamp, x: u.x, y: u.y, s: u.s, alpha: 0, vu: false });
    }
    var sens = u.camp === "rival" ? -1 : 1;
    return { f: f, figs: figs, debout: figs.length, marche: sens, dir: sens, s: u.s, gauche: u.camp === "rival", mort: false,
      cleCamp: cleCamp, phaseBanniere: Math.random() * 4, ordre: [], pasV: u.pas || 0, decal: undefined, cible: 0, slot: -1, file: false,
      etaitFile: false, lache: false };
  }

  // Une figurine du bataillon tombe : en mêlée, un homme du premier rang encore debout ; ailleurs, un homme au hasard ;
  // le noyau (porte-bannière, champion, engin) seulement s'il reste seul. Un homme d'un rang de derrière (le plus loin
  // dans l'ordre des places) prend sa place. Elle reste couchée au sol (v.corps), sauf l'engin de la tour de siège, dont
  // l'effet « chute » du moteur dessine déjà la chute.
  var choixChute = [];
  function faireTomber(u, bat, v) {
    var f = bat.f, figs = bat.figs, i, fg, rangMin = 99, tombe = null;
    choixChute.length = 0;
    for (i = 0; i < figs.length; i++) {
      fg = figs[i];
      if (!fg.debout || fg.noyau) continue;
      var rg = f.places[fg.place].rang;
      if (u.adversaire && rg < rangMin) { rangMin = rg; choixChute.length = 0; }
      if (!u.adversaire || rg === rangMin) choixChute.push(fg);
    }
    if (choixChute.length) tombe = choixChute[Math.floor(Math.random() * choixChute.length)];
    else for (i = 0; i < figs.length && !tombe; i++) if (figs[i].debout) tombe = figs[i];
    if (!tombe) { bat.debout = 0; return; }
    tombe.debout = false; bat.debout--;
    var trou = tombe.place, q = f.places[trou];
    // les rangs se resserrent : l'homme debout le plus loin derrière prend la place laissée libre
    var remplacant = null;
    for (i = 0; i < figs.length; i++) {
      fg = figs[i];
      if (fg.debout && !fg.noyau && f.places[fg.place].rang > q.rang && (!remplacant || fg.place > remplacant.place)) remplacant = fg;
    }
    if (remplacant) { tombe.place = remplacant.place; remplacant.place = trou; }
    if (!tombe.vu || (tombe.noyau && u.type === "belier")) return;
    if (v.corps.length >= CORPS_MAX) v.corps.shift();
    var gauche = bat.gauche;
    v.corps.push({ genre: "chute", x: tombe.x, y: tombe.y, age: 0, regard: gauche ? -1 : 1, camp: u.camp, type: q.type,
      nom: tombe.nom, cleCamp: bat.cleCamp, echelle: q.echelle, gauche: gauche, flaque: Math.floor(Math.random() * 3),
      haut: HAUT_CORPS * q.echelle / ECHELLE_TROUPE * 1.25, taille: 0.7, elan: 0.5, gouttes: 5, graine: Math.floor(Math.random() * 997) + 1 });
  }

  // Avant chaque image : les bataillons suivent leur troupe (figurines debout, direction, recul en mêlée, place de
  // chaque figurine), les troupes tombées depuis l'image d'avant couchent leurs dernières figurines, et les figurines
  // couchées vieillissent (temps de la partie : la vitesse ×2 ou ×3 compte). Animations coupées : pas de geste, de
  // balancement ni de glissement (les rangs se resserrent d'un coup).
  var pointTmp = { x: 0, y: 0 };
  // v.morts : troupes tombées depuis peu (une seconde et demie de partie), pour que l'effet « chute » du moteur se
  // dessine là où était leur bataillon.
  function abattre(u, v) {
    u.bat.mort = true;
    while (u.bat.debout > 0) faireTomber(u, u.bat, v);
    if (v.morts) v.morts.push({ u: u, t: v.partie.temps });
  }
  function majBataillons(v, anim, sang) {
    var p = v.partie, dt = Math.max(0, Math.min(0.25, p.temps - v.tempsRendu)), i, u;
    v.tempsRendu = p.temps;
    for (i = 0; i < v.vus.length; i++) {
      u = v.vus[i];
      if (u.pv <= 0 && u.bat && !u.bat.mort) abattre(u, v);
    }
    if (v.morts) { var km = 0; for (i = 0; i < v.morts.length; i++) if (p.temps - v.morts[i].t < 1.5) v.morts[km++] = v.morts[i]; v.morts.length = km; }
    v.vus.length = 0;
    for (i = 0; i < p.unites.length; i++) {
      u = p.unites[i];
      if (u.pv <= 0) { if (u.bat && !u.bat.mort) abattre(u, v); continue; }
      if (!u.vivant) continue; // arrivée à la porte d'en face (ou garde rentré) à cette étape
      if (!u.bat) u.bat = creerBataillon(u, formation(u.type), u.camp === "rival" ? v.campAdverse : "france");
      v.vus.push(u);
    }
    // la ligne de front de chaque mêlée, puis chaque bataillon suit sa troupe
    placerMelees(p, v.vus);
    for (i = 0; i < v.vus.length; i++) majBataillon(v.vus[i], v, dt, anim);
    // figurines couchées : vieillissent, puis s'effacent (plus vite sans le sang)
    var fin = sang ? M.DUREE_CHUTE : CHUTE_SANS_SANG, k = 0;
    for (i = 0; i < v.corps.length; i++) { var c = v.corps[i]; c.age += dt; if (c.age < fin) v.corps[k++] = c; }
    v.corps.length = k;
  }

  function majBataillon(u, v, dt, anim) {
    var p = v.partie, route = p.route, bat = u.bat, f = bat.f;
    var voulu = deboutVoulu(f.places.length, u.pv, u.max, u.vivant);
    while (bat.debout > voulu) faireTomber(u, bat, v);
    // sens de marche : d'après le déplacement le long de la route ; en mêlée, vers l'adversaire
    var ds = u.s - bat.s;
    if (ds > 0.01) bat.marche = 1; else if (ds < -0.01) bat.marche = -1;
    bat.s = u.s;
    var adv = u.adversaire && u.adversaire.vivant ? u.adversaire : null;
    // en mêlée, vers sa ligne de front : tes troupes vers le château du rival, les siennes vers le tien (placerMelees)
    var dirV = adv ? (bat.front !== undefined ? (u.camp === "rival" ? -1 : 1) : adv.s > u.s ? 1 : adv.s < u.s ? -1 : bat.marche) : bat.marche;
    // décalage le long de la route (placerMelees) : glisse vers sa place (une troupe libre que le moteur a fait passer de
    // l'autre côté d'une mêlée traverse vite) ; au premier dessin, tout de suite à sa place
    if (bat.etaitFile && !bat.file) bat.lache = true;
    bat.etaitFile = bat.file;
    if (bat.decal === undefined || !anim) bat.decal = bat.cible;
    else {
      var vg = (bat.lache || !adv ? TRAVERSE : GLISSE) * dt;
      bat.decal += Math.max(-vg, Math.min(vg, bat.cible - bat.decal));
    }
    if (Math.abs(bat.cible - bat.decal) < 0.5) bat.lache = false;
    if (anim) bat.dir += Math.max(-6 * dt, Math.min(6 * dt, dirV - bat.dir)); // demi-tour en un tiers de seconde
    else bat.dir = dirV;
    // en travers : sa file (cote), ou presque le milieu de la route en mêlée et à la file derrière elle (premiers rangs
    // face à face)
    var ccV = coteBataillon(f, adv || bat.file ? u.cote * MILIEU_MELEE : u.cote);
    if (bat.cc === undefined || !anim) bat.cc = ccV; else bat.cc += Math.max(-14 * dt, Math.min(14 * dt, ccV - bat.cc));
    var cc = bat.cc, centre = u.s + bat.decal, L = route.longueur, t = p.temps;
    // pas : au rythme de la marche dessinée (une troupe qui attend à la file ne marche pas sur place), piétinement en mêlée.
    // Un cycle de la bande de marche (4 images) pour 15 px parcourus à pied (PAS_PIETON), 30 px à cheval (lot A).
    var dc = bat.centre === undefined ? 0 : Math.abs(centre - bat.centre);
    bat.pasV += adv ? dt * 1.5 : Math.min(dc, 4) / (u.type === "cavaliers" ? PAS_CHEVAL : PAS_PIETON);
    bat.centre = centre;
    // milieu du bataillon dessiné : les traits des tours, les coups et les chutes y tombent
    pointRoute(route, centre, Math.max(-BORD_ROUTE, Math.min(BORD_ROUTE, cc)), pointTmp);
    var mx = pointTmp.x, my = pointTmp.y;
    // sur un pont (tablier de 28 px), le bataillon se resserre en travers ; il reprend sa largeur sur la rive
    var serre = 1, ponts = v.carte && v.carte.ponts;
    if (ponts) for (var j = 0; j < ponts.length; j++) {
      var dxp = mx - ponts[j].x, dyp = my - ponts[j].y, dp = Math.sqrt(dxp * dxp + dyp * dyp);
      if (dp < 40) serre = Math.min(serre, SERRE_PONT + (1 - SERRE_PONT) * Math.max(0, (dp - 22) / 18));
    }
    if (serre < 1) { pointRoute(route, centre, Math.max(-BORD_ROUTE, Math.min(BORD_ROUTE, cc)) * serre, pointTmp); mx = pointTmp.x; my = pointTmp.y; }
    bat.vx = mx; bat.vy = my;
    // regard (image retournée ou non), là où le bataillon est dessiné : en mêlée, vers sa ligne de front (sans elle, vers
    // l'adversaire) ; sinon vers où il marche ; marge pour les tronçons presque verticaux (il garde son regard)
    var vers = pointTmp.tx * bat.marche;
    if (adv && bat.front !== undefined) {
      pointRoute(route, bat.front, 0, pointTmp);
      if (Math.abs(pointTmp.x - mx) > 1.5) bat.gauche = pointTmp.x < mx;
    } else if (adv) bat.gauche = adv.x < u.x;
    else if (vers < -0.2) bat.gauche = true; else if (vers > 0.2) bat.gauche = false;
    // en deuxième ligne d'une mêlée, le premier rang pousse (il ne frappe pas dans le vide)
    var contact = adv && bat.slot <= 0;
    var depuisCoup = contact && u.frappe >= 0 ? t - u.frappe : 99, figs = bat.figs, glisse = 18 * dt;
    for (var i = 0; i < figs.length; i++) {
      var fg = figs[i];
      if (!fg.debout) continue;
      var q = f.places[fg.place];
      if (anim) { fg.a += Math.max(-glisse, Math.min(glisse, q.a - fg.a)); fg.b += Math.max(-glisse, Math.min(glisse, q.b - fg.b)); }
      else { fg.a = q.a; fg.b = q.b; }
      // geste : en mêlée, le premier rang se fend (chacun à son rythme, et tous ensemble quand la troupe frappe)
      var fente = 0;
      if (adv && anim) {
        if (q.rang === 0 && contact) {
          var g = depuisCoup - fg.delai, coup = g >= 0 && g < 0.2 ? 1 - g / 0.2 : 0;
          fente = Math.max(3.2 * coup, 1.5 * Math.max(0, Math.sin(t * 6.3 + fg.phase * 2.2)));
        } else fente = 0.8 * Math.max(0, Math.sin(t * 4.1 + fg.phase * 1.7));
      }
      var la = fg.a + f.avant + fg.ja + fente;
      var lb = fg.b + fg.jb + (anim ? 0.35 * Math.sin(bat.pasV * 0.9 + fg.phase * 1.9) : 0);
      var sf = centre + bat.dir * la, cf = Math.max(-BORD_ROUTE - 0.7, Math.min(BORD_ROUTE + 0.7, cc + lb)) * serre;
      pointRoute(route, sf, cf, pointTmp);
      fg.x = pointTmp.x; fg.y = pointTmp.y; fg.s = sf; fg.vu = true;
      // bousculée par une pierre tombée tout près, ou qui recule sous un trait (lot A, dessin seulement)
      if (fg.pousse !== undefined) { var fp = amortiPoussee(t - fg.pousse); if (fp > 0) { fg.x += fg.pousseX * fp; fg.y += fg.pousseY * fp; } else if (t - fg.pousse > 0.3) fg.pousse = undefined; }
      if (fg.recul !== undefined) { if (t - fg.recul < RECUL && t >= fg.recul) fg.x += fg.reculX; else fg.recul = undefined; }
      // fondu sur le seuil des portes : chaque figurine sort (ou entre) à son tour, sur 16 px de marche ; en mêlée (les
      // gardes du rival se battent devant sa porte), sur 6 px seulement : on ne se bat pas en fantôme ; ta troupe arrêtée
      // devant la porte du rival (u.porte) n'entre pas : elle reste bien visible
      var bout = Math.min(sf, L - sf), bande = adv ? 6 : 16;
      fg.alpha = u.porte || bout >= bande + 2 ? 1 : Math.max(0, Math.min(1, (bout - 2) / bande));
    }
  }

  // Une vue d'une figurine, réduite à sa taille sur la toile (netteté comprise), gardée : l'image 3D si elle est chargée,
  // sinon la silhouette peinte (repli). Ancrage (pieds) en px de l'écran : axd, ayd ; taille logique : lw, lh.
  // ombre : la même vue posée sur son ombre douce (portée vers le sud-est, soleil au nord-ouest), cuite dans la même
  // petite toile : une seule copie par figurine et par image. Les figurines sont dessinées du fond vers l'avant, et
  // l'ombre tombe devant les pieds : celles de devant la recouvrent, comme sur le sol.
  var vues = {}, vuesRatio = 0;
  function memoVues(ratio) { if (vuesRatio !== ratio) { vues = {}; vuesRatio = ratio; } }
  function oublierVues() { vues = {}; vuesRatio = 0; }
  function vueFigure(nom, type, cleCamp, coul, k, gauche, echelle, ratio, ombre) {
    memoVues(ratio);
    var e = images[nom], c;
    if (!e || e.etat !== "ok") {
      c = figurePeinte(type, cleCamp, coul, k, gauche, echelle, ratio);
      return ombre ? avecOmbre(c, genreFigure(type), echelle, ratio) : c;
    }
    var s = e.s, n = s.frames || 1, fr = n > 1 ? ((Math.floor(k) % n) + n) % n : 0, miroir = gauche !== (s.face === "gauche");
    var cle = nom + "|" + fr + "|" + (miroir ? 1 : 0) + "|" + echelle;
    c = vues[cle];
    if (c) return ombre ? avecOmbre(c, genreFigure(type), echelle, ratio) : c;
    var iw = e.img.naturalWidth / n, ih = e.img.naturalHeight, sc = echelle * ratio;
    c = document.createElement("canvas"); c.width = Math.ceil(s.w * sc) + 2; c.height = Math.ceil(s.h * sc) + 2;
    var g = c.getContext("2d");
    g.imageSmoothingQuality = "high";
    if (miroir) { g.translate(c.width, 0); g.scale(-1, 1); }
    g.drawImage(e.img, fr * iw, 0, iw, ih, 1, 1, s.w * sc, s.h * sc);
    vues[cle] = ancrer(c, miroir ? c.width - 1 - s.ax * sc : 1 + s.ax * sc, 1 + s.ay * sc, ratio);
    return ombre ? avecOmbre(c, genreFigure(type), echelle, ratio) : c;
  }
  // Ombre d'une figurine, selon son genre : [largeur, hauteur, décalage vers l'est, vers le sud] (px de l'image, × échelle).
  var OMBRES = { pied: [15, 6, 3, 1.6], chef: [18, 7, 3.5, 1.8], cheval: [26, 8, 3, 1.5], engin: [34, 11, 4, 2] };
  function avecOmbre(base, genre, echelle, ratio) {
    if (base.ombree) return base.ombree;
    var o = OMBRES[genre] || OMBRES.pied, w = o[0] * echelle * ratio, h = o[1] * echelle * ratio;
    var c = document.createElement("canvas"); c.width = base.width; c.height = base.height + Math.ceil(4 * echelle * ratio) + 1;
    var g = c.getContext("2d");
    g.drawImage(ombreTroupe(), base.axd + o[2] * echelle * ratio - w / 2, base.ayd + o[3] * echelle * ratio - h / 2, w, h);
    g.drawImage(base, 0, 0);
    return (base.ombree = ancrer(c, base.axd, base.ayd, ratio));
  }
  function ancrer(c, axd, ayd, ratio) { c.axd = axd; c.ayd = ayd; c.ax = axd / ratio; c.ay = ayd / ratio; c.lw = c.width / ratio; c.lh = c.height / ratio; return c; }

  // Repli sans images : chaque figurine est une petite silhouette peinte, cernée d'encre (tunique aux couleurs du camp,
  // casque, écu, lance ; cheval caparaçonné et son cavalier ; champion plus grand, au plumet ; tour de bois sur roues),
  // dans le même gabarit que les images (taille et pieds : w, h, ax, ay) ; deux vues de marche.
  var GABARITS = { pied: [40, 40, 20, 36], cheval: [40, 40, 20, 36], chef: [48, 48, 24, 44], engin: [56, 64, 28, 60] };
  function genreFigure(type) { return type === "cavaliers" ? "cheval" : type === "belier" ? "engin" : type === "champion" ? "chef" : "pied"; }
  function figurePeinte(type, cleCamp, coul, k, gauche, echelle, ratio) {
    var genre = genreFigure(type), fr = genre === "engin" ? 0 : ((Math.floor(k) % 2) + 2) % 2;
    var cle = "~" + genre + "|" + cleCamp + "|" + fr + "|" + (gauche ? 1 : 0) + "|" + echelle, c = vues[cle];
    if (c) return c;
    var gb = GABARITS[genre], sc = echelle * ratio;
    c = document.createElement("canvas"); c.width = Math.ceil(gb[0] * sc) + 2; c.height = Math.ceil(gb[1] * sc) + 2;
    var g = c.getContext("2d");
    if (gauche) { g.translate(c.width - 1, 1); g.scale(-sc, sc); } else { g.translate(1, 1); g.scale(sc, sc); }
    silhouette(g, genre, coul, fr);
    return (vues[cle] = ancrer(c, gauche ? c.width - 1 - gb[2] * sc : 1 + gb[2] * sc, 1 + gb[3] * sc, ratio));
  }
  function silhouette(g, genre, coul, fr) {
    var encre = "#1c130b", acier = "#a3a8ae", bois = "#5a4026";
    g.lineCap = "round"; g.lineJoin = "round";
    if (genre === "engin") {
      g.fillStyle = "#7a5230"; g.strokeStyle = encre; g.lineWidth = 1.6;
      g.fillRect(16, 10, 26, 44); g.strokeRect(16, 10, 26, 44);
      g.strokeStyle = "rgba(28,19,11,.55)"; g.lineWidth = 1;
      for (var y = 17; y < 54; y += 7) { g.beginPath(); g.moveTo(16, y); g.lineTo(42, y); g.stroke(); }
      g.fillStyle = "#8b6038"; g.strokeStyle = encre; g.lineWidth = 1.4;
      for (var x = 16; x < 42; x += 7) { g.fillRect(x, 5, 4.5, 5); g.strokeRect(x, 5, 4.5, 5); }
      g.fillStyle = coul[0]; g.fillRect(22, 18, 14, 17); g.strokeStyle = coul[1]; g.lineWidth = 1.2; g.strokeRect(22, 18, 14, 17);
      g.fillStyle = "#3a2a1a"; g.strokeStyle = encre;
      [21, 37].forEach(function (cx) { g.beginPath(); g.arc(cx, 56, 4.5, 0, Math.PI * 2); g.fill(); g.stroke(); });
      return;
    }
    if (genre === "cheval") {
      var j = fr ? 2.5 : -2.5;
      g.strokeStyle = "#2e2016"; g.lineWidth = 2.4;
      g.beginPath(); g.moveTo(12, 27); g.lineTo(11 - j, 36); g.moveTo(15, 27); g.lineTo(15 + j, 36); g.moveTo(24, 27); g.lineTo(24 - j, 36); g.moveTo(27, 27); g.lineTo(28 + j, 36); g.stroke();
      g.fillStyle = "#6b4a2e"; g.strokeStyle = encre; g.lineWidth = 1.3;
      g.beginPath(); g.moveTo(26, 22); g.lineTo(32, 13); g.lineTo(36, 15); g.lineTo(31, 25); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = coul[0]; g.beginPath(); g.ellipse(19, 24, 11, 5.5, 0, 0, Math.PI * 2); g.fill(); g.stroke();
      g.strokeStyle = coul[1]; g.lineWidth = 1.1; g.beginPath(); g.moveTo(9, 26); g.lineTo(29, 26); g.stroke();
      g.strokeStyle = "#d8c49a"; g.lineWidth = 1.4; g.beginPath(); g.moveTo(11, 18); g.lineTo(39, 12); g.stroke();
      g.fillStyle = coul[0]; g.strokeStyle = encre; g.lineWidth = 1.3;
      g.beginPath(); g.moveTo(16, 9); g.lineTo(22, 9); g.lineTo(23, 20); g.lineTo(15, 20); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = acier; g.beginPath(); g.arc(19, 6.5, 3.2, 0, Math.PI * 2); g.fill(); g.stroke();
      return;
    }
    if (genre === "chef") { g.translate(0, 0.8); g.scale(1.2, 1.2); }
    var jj = fr ? 3 : -3;
    g.strokeStyle = "#3a2c1e"; g.lineWidth = 3;
    g.beginPath(); g.moveTo(19, 27); g.lineTo(19 - jj, 36); g.moveTo(21, 27); g.lineTo(21 + jj, 36); g.stroke();
    g.strokeStyle = bois; g.lineWidth = 1.6; g.beginPath(); g.moveTo(24, 31); g.lineTo(28, 3); g.stroke();
    g.fillStyle = acier; g.beginPath(); g.moveTo(28.5, -1); g.lineTo(29.8, 4.5); g.lineTo(27, 4); g.closePath(); g.fill();
    g.fillStyle = coul[0]; g.strokeStyle = encre; g.lineWidth = 1.4;
    g.beginPath(); g.moveTo(15.5, 15); g.lineTo(24.5, 15); g.lineTo(26, 29); g.lineTo(14, 29); g.closePath(); g.fill(); g.stroke();
    g.strokeStyle = coul[1]; g.lineWidth = 1.2; g.beginPath(); g.moveTo(15, 23); g.lineTo(25, 23); g.stroke();
    g.fillStyle = acier; g.strokeStyle = encre; g.lineWidth = 1.3; g.beginPath(); g.arc(20, 11, 4, 0, Math.PI * 2); g.fill(); g.stroke();
    if (genre === "chef") { g.fillStyle = coul[1]; g.beginPath(); g.ellipse(19, 5.5, 2, 3.2, -0.4, 0, Math.PI * 2); g.fill(); g.stroke(); }
    g.fillStyle = coul[0]; g.strokeStyle = coul[1]; g.lineWidth = 1.4;
    g.beginPath(); g.moveTo(22, 16); g.lineTo(30, 16); g.lineTo(30, 22); g.quadraticCurveTo(30, 27, 26, 29); g.quadraticCurveTo(22, 27, 22, 22); g.closePath(); g.fill(); g.stroke();
  }

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

  // Bannière d'un bataillon : un gonfanon aux couleurs du camp (champ, bordure et emblème : lys, lion ou tour) pendu à une
  // traverse, au bout d'une hampe de « haut » px ; VUES_BANNIERE vues qui ondulent de ± 1,4 px, jouées à 8 images par
  // seconde (lot A ; ambiance coupée : la première). Gardée comme les vues des figurines ; ancrage : le pied de la hampe.
  var VUES_BANNIERE = 6;
  function banniere(cleCamp, coul, embleme, gauche, fr, haut, ratio) {
    memoVues(ratio);
    var cle = "^" + cleCamp + "|" + (gauche ? 1 : 0) + "|" + fr + "|" + haut, c = vues[cle];
    if (c) return c;
    var W = 14, H = haut + 2;
    c = document.createElement("canvas"); c.width = Math.ceil(W * ratio) + 2; c.height = Math.ceil(H * ratio) + 2;
    var g = c.getContext("2d");
    if (gauche) { g.translate(c.width - 1, 1); g.scale(-ratio, ratio); } else { g.translate(1, 1); g.scale(ratio, ratio); }
    // l'onde descend l'étoffe : le bas du côté libre suit le bas du côté de la hampe avec un temps de retard
    var ph = fr / VUES_BANNIERE * Math.PI * 2, o = 1.4 * Math.sin(ph), o2 = 1.4 * Math.sin(ph - 1.1);
    g.lineCap = "round"; g.strokeStyle = "#2a1c10"; g.lineWidth = 1.1;
    g.beginPath(); g.moveTo(3, H); g.lineTo(3, 1.8); g.stroke();
    // l'étoffe, aux trois quarts de la taille d'origine (une bannière par bataillon : plus grandes, elles se cachaient)
    g.translate(3, 1.4); g.scale(0.78, 0.78); g.translate(-3, 0);
    g.lineWidth = 1; g.beginPath(); g.moveTo(2, 2.4); g.lineTo(12.6, 2.4); g.stroke();
    g.beginPath(); g.moveTo(3.6, 2.8); g.lineTo(12.2, 2.8); g.lineTo(12.2 + o2 * 0.6, 11.4); g.lineTo(10.1 + o2 * 0.9, 9.8); g.lineTo(7.9 + o, 12); g.lineTo(5.7 + o * 0.6, 10); g.lineTo(3.6, 11.6); g.closePath();
    g.fillStyle = coul[0]; g.fill();
    g.lineWidth = 1.1; g.strokeStyle = coul[1]; g.stroke();
    g.lineWidth = 0.5; g.strokeStyle = "#1c130b"; g.stroke();
    dessinerIcone(g, embleme, 7.9 + o * 0.3, 6.8, 6.6, coul[1]);
    g.fillStyle = "#e2c272"; g.beginPath(); g.arc(3, 0.6, 1.4, 0, Math.PI * 2); g.fill();
    return (vues[cle] = ancrer(c, gauche ? c.width - 1 - 3 * ratio : 1 + 3 * ratio, 1 + H * ratio, ratio));
  }

  // Dessine un bataillon : les figurines debout (chacune sur son ombre) du fond vers l'avant de l'écran, le
  // porte-bannière avec sa bannière ; barre de vie du champion et de la tour de siège. Copie pixel pour pixel : la toile
  // est remise à l'échelle de l'écran le temps du bataillon.
  function parY(a, b) { return a.y - b.y; }
  function bataillon(ctx, u, v, anim) {
    var bat = u.bat;
    if (!bat) return;
    var ambiance = JEU.anim.ambiance ? JEU.anim.ambiance() : anim; // bannières qui flottent : ambiance
    var fondu = v.retrait !== null ? Math.max(0, 1 - (v.horloge - v.retrait) / 0.6) : 1;
    if (fondu <= 0) return;
    var f = bat.f, figs = bat.figs, ordre = bat.ordre, ratio = v.ratio, i, fg, c;
    var rival = u.camp === "rival", coul = rival ? v.adverse.couleurs : v.couleurs, R = v.rendu;
    ordre.length = 0;
    for (i = 0; i < figs.length; i++) if (figs[i].debout && figs[i].alpha > 0) ordre.push(figs[i]);
    if (!ordre.length) return;
    ordre.sort(parY);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    var k0 = bat.pasV * 1.2, chef = null;
    for (i = 0; i < ordre.length; i++) {
      fg = ordre[i];
      var q = f.places[fg.place];
      c = vueFigure(fg.nom, q.type, bat.cleCamp, coul, k0 + fg.phase, bat.gauche, q.echelle, ratio, true);
      if (fg.recul !== undefined) c = touchee(c); // touchée par un trait : un cran plus sombre, le temps du recul
      ctx.globalAlpha = fondu * fg.alpha;
      ctx.drawImage(c, Math.round(fg.x * ratio - c.axd), Math.round(fg.y * ratio - c.ayd));
      R.figures++;
      if (fg.noyau) {
        chef = fg;
        if (f.banniere) {
          var b = banniere(bat.cleCamp, coul, (rival ? v.adverse : camp("joueur")).embleme, bat.gauche, ambiance ? Math.floor(v.horloge * 8 + bat.phaseBanniere * 1.5) % VUES_BANNIERE : 0, f.banniere, ratio);
          var bx = fg.x + (bat.gauche ? -1 : 1) * 2.2 * q.echelle / 0.6, by = fg.y - 1.5;
          ctx.drawImage(b, Math.round(bx * ratio - b.axd), Math.round(by * ratio - b.ayd));
          R.bannieres++;
        }
      }
    }
    ctx.globalAlpha = 1;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    R.bataillons++;
    if (f.barre && chef && u.pv < u.max) {
      // au-dessus de la tête (ou de la bannière, que la barre ne cache pas)
      var e = images[chef.nom], haut = (e && e.etat === "ok" ? e.s.ay : GABARITS[genreFigure(u.type)][3]) * f.places[chef.place].echelle;
      if (fondu < 1) ctx.globalAlpha = fondu;
      barreVie(ctx, u, chef.x, chef.y - Math.max(haut, f.banniere + 1.5) - 6);
      ctx.globalAlpha = 1;
    }
  }
  // Barre de vie fine (24 × 5 px) au-dessus d'un champion ou d'une tour de siège.
  function barreVie(ctx, u, x, y) {
    ctx.fillStyle = "rgba(20,12,6,.78)"; ctx.fillRect(x - 12, y, 24, 5);
    ctx.fillStyle = u.camp === "rival" ? "#d07a5a" : "#9cc06a"; ctx.fillRect(x - 11, y + 1, 22 * Math.max(0, u.pv / u.max), 3);
  }

  // ---------- mêlée : soldats tombés, sang ----------
  // Réglage « Sang dans les combats » (Réglages, JEU.anim.sang ; actif par défaut) : giclées rouges aux coups de la mêlée et
  // aux chutes, petite flaque sous chaque figurine tombée, qui bascule (BASCULE), reste couchée (tournée, plus sombre)
  // puis s'efface avec sa flaque (M.DUREE_CHUTE secondes, comme l'effet « chute » du moteur). Même traitement pour tous
  // les camps ; jamais de démembrement ni de gros plan. La tour de siège, en bois, ne saigne jamais (ni coup ni chute).
  // Sang coupé : ni giclée ni flaque ; la figurine tombée s'efface vite (CHUTE_SANS_SANG), dans un peu de poussière.
  // Animations réduites : ni giclée ni bascule ; flaques et figurines tombées restent, sans mouvement.
  // Plafonds (PC sans carte graphique) : CORPS_MAX figurines couchées à la fois, GERBES giclées de coups et GERBES_CHUTES
  // giclées de chutes, GOUTTES gouttes chacune au plus (M.TOMBES : effets « chute » du moteur, une par troupe).
  var GERBES = 24, GERBES_CHUTES = 16, GOUTTES = 9, GICLEE_COUP = 0.45, GICLEE_CHUTE = 0.55, FIN_CHUTE = 1.5, CHUTE_SANS_SANG = 1.4;
  var ROUGES = ["#7a0c0c", "#9c1515", "#560707"];

  // Flaque de sang vue de trois quarts (ellipse aplatie, bords irréguliers, reflet mouillé), trois variantes calculées une fois.
  var flaques = [];
  function flaque(k) {
    if (flaques[k]) return flaques[k];
    var c = document.createElement("canvas"); c.width = 80; c.height = 40;
    var g = c.getContext("2d");
    g.scale(2, 2); g.translate(20, 10);
    g.fillStyle = "rgba(64,5,5,.84)";
    function tache(x, y, rx, ry) { g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.fill(); }
    tache(0, 0, 10, 4.4);
    for (var i = 0; i < 4; i++) tache((hasard(k * 40 + i) - 0.5) * 16, (hasard(k * 40 + i + 9) - 0.5) * 5, 2.5 + 3 * hasard(k * 40 + i + 17), 1.4 + 1.4 * hasard(k * 40 + i + 23));
    g.globalCompositeOperation = "source-atop";
    var r = g.createRadialGradient(-2, -1, 1, 0, 0, 12);
    r.addColorStop(0, "rgba(112,14,12,.4)"); r.addColorStop(0.6, "rgba(90,8,8,0)"); r.addColorStop(1, "rgba(18,0,0,.55)");
    g.fillStyle = r; g.fillRect(-20, -10, 40, 20);
    g.fillStyle = "rgba(255,200,180,.14)"; g.beginPath(); g.ellipse(-3, -1.5, 3, 0.9, -0.2, 0, Math.PI * 2); g.fill();
    flaques[k] = c;
    return c;
  }

  // Troupe touchée par un coup de mêlée (effet « coup ») : son type, cherché une fois, au premier dessin (le coup vient
  // d'être porté : la troupe est encore là, à quelques pixels près ; tombée sous ce coup, son effet « chute » est au même
  // endroit). Sert à ne jamais faire saigner la tour de siège, qui est en bois. Bataillon touché : le coup frappe un homme
  // de son premier rang, du côté d'où vient le coup ; giclée et éclat partent de lui (gx, gy), à sa taille (haut, taille).
  function cibleDuCoup(e, p) {
    if (e.cible !== undefined) return e.cible;
    var meilleur = 36, type = "", i, o, d, touchee = null;
    for (i = 0; i < p.unites.length; i++) {
      o = p.unites[i];
      if (o.camp !== e.camp) continue;
      d = (o.x - e.x) * (o.x - e.x) + (o.y - e.y) * (o.y - e.y);
      if (d < meilleur) { meilleur = d; type = o.type; touchee = o; }
    }
    for (i = 0; i < p.effets.length && meilleur > 0.01; i++) {
      o = p.effets[i];
      if (o.genre === "chute" && o.camp === e.camp && Math.abs(o.x - e.x) < 0.1 && Math.abs(o.y - e.y) < 0.1) { meilleur = 0; type = o.type; touchee = null; }
    }
    e.cible = type;
    e.champion = !!(touchee && touchee.adversaire && touchee.adversaire.type === "champion"); // le champion frappe : étincelles × 2
    if (touchee && touchee.bat) {
      var f = touchee.bat.f, figs = touchee.bat.figs, choisi = null, dir = e.dir || 1;
      for (i = 0; i < figs.length; i++) {
        o = figs[i];
        if (!o.debout || !o.vu || f.places[o.place].rang !== 0) continue;
        if (!choisi || o.x * dir < choisi.x * dir) choisi = o;
      }
      if (choisi) {
        var ech = f.places[choisi.place].echelle;
        e.gx = choisi.x; e.gy = choisi.y; e.haut = HAUT_CORPS * ech / ECHELLE_TROUPE * 1.25; e.taille = 0.75; e.elan = 0.5;
      }
    }
    return type;
  }

  // Une figurine tombée (v.corps, une par homme d'un bataillon) : sa flaque (si le sang est actif, à sa taille), puis son
  // corps couché, assombri. Animations actives : il tombe en BASCULE secondes, en jouant sa bande « chute » (lot A1 :
  // genoux qui plient, buste renversé, au sol ; sa dernière image : couché, l'arme à côté), sinon en basculant d'un quart
  // de tour vers l'arrière de son regard (repli : poseCouchee, la vue de marche tournée et aplatie).
  // Avec la couche de sol (bataille-sol.js) et le sang : seule la chute est dessinée à chaque image ; couché, le corps est
  // posé une fois dans la couche de sol, assombri et un peu désaturé (sur un pont, les vivants se détachent des morts),
  // sur sa flaque, qui grandit de 0,4 à 1 en CROISSANCE s (reposée deux fois) ; la couche l'efface ensuite.
  // Sans elle, ou sans le sang : comme avant, il est copié à chaque image et s'efface au bout de M.DUREE_CHUTE secondes
  // (CHUTE_SANS_SANG sans le sang), au plus CORPS_MAX à la fois (la plus ancienne part la première).
  var BASCULE = 0.3, CROISSANCE = 1;
  function tailleFlaque(age) { var k = Math.min(1, Math.max(0, age) / CROISSANCE); return 0.4 + 0.6 * (1 - (1 - k) * (1 - k)); }
  function arrondiFlaque(x) { return Math.round(x * 20) / 20; } // quelques tailles gardées seulement
  // Bande « chute » de la figurine, si elle est chargée ; sinon null (repli).
  function bandeChute(c) { var nom = c.nom + "-chute"; return prete(nom) ? nom : null; }
  function imagesChute(nom) { var s = descr(nom); return (s && s.frames) || 4; }
  // Vue couchée d'une figurine tombée : la dernière image de sa bande de chute (assombrie), sinon poseCouchee().
  // gisant : de plus un peu désaturée (posée dans la couche de sol).
  function vueCouchee(c, v, gisant) {
    var coul = c.camp === "rival" ? v.adverse.couleurs : v.couleurs, bande = bandeChute(c), base;
    if (bande) base = sombre(vueFigure(bande, c.type, c.cleCamp, coul, imagesChute(bande) - 1, c.gauche, c.echelle, v.ratio));
    else base = poseCouchee(vueFigure(c.nom, c.type, c.cleCamp, coul, 0, c.gauche, c.echelle, v.ratio), c.regard, 14 * c.echelle, v.ratio);
    return gisant ? desature(base) : base;
  }
  // Pendant la chute (age < BASCULE) : l'image de la bande (pixel pour pixel), ou la figurine qui bascule (repli).
  function dessinerChute(ctx, c, v, age) {
    var ratio = v.ratio, coul = c.camp === "rival" ? v.adverse.couleurs : v.couleurs, bande = bandeChute(c);
    if (bande) {
      var f = sombre(vueFigure(bande, c.type, c.cleCamp, coul, vue(age, BASCULE, imagesChute(bande) - 1), c.gauche, c.echelle, ratio));
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.drawImage(f, Math.round(c.x * ratio - f.axd), Math.round(c.y * ratio - f.ayd));
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      return;
    }
    var b = Math.min(1, age / BASCULE), pivot = 14 * c.echelle;
    b = 1 - (1 - b) * (1 - b);
    var so = sombre(vueFigure(c.nom, c.type, c.cleCamp, coul, 0, c.gauche, c.echelle, ratio));
    ctx.save(); ctx.translate(c.x, c.y); ctx.scale(1, 1 - 0.45 * b); ctx.rotate((c.regard > 0 ? -Math.PI / 2 : Math.PI / 2) * b);
    ctx.drawImage(so, -so.ax, -(so.ay - pivot * b), so.lw, so.lh);
    ctx.restore();
  }
  function corps(ctx, c, v, sang, anim) {
    var fin = sang ? M.DUREE_CHUTE : CHUTE_SANS_SANG;
    if (c.age >= fin) return;
    v.rendu.corps++;
    if (sang && v.sol && JEU.batailleSol) { corpsAuSol(ctx, c, v, anim, JEU.batailleSol); return; }
    var a = sang ? Math.min(1, (fin - c.age) / FIN_CHUTE) : Math.min(1, (fin - c.age) / 0.9);
    var b = anim ? Math.min(1, c.age / BASCULE) : 1;
    var ratio = v.ratio, t = c.echelle / ECHELLE_TROUPE, k = sang && anim ? Math.min(1, 0.35 + c.age / 0.9) : 1, fx = c.x - c.regard * 7 * t;
    ctx.globalAlpha = a;
    if (b >= 1 && k >= 1) {
      // posée : flaque et corps gardés à leur taille, copiés pixel pour pixel
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      if (sang) { var fl = flaqueReduite(c.flaque, t, ratio); ctx.drawImage(fl, Math.round(fx * ratio - fl.axd), Math.round(c.y * ratio - fl.ayd)); }
      var pc = vueCouchee(c, v, false);
      ctx.drawImage(pc, Math.round(c.x * ratio - pc.axd), Math.round(c.y * ratio - pc.ayd));
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    } else {
      if (sang) ctx.drawImage(flaque(c.flaque), fx - 16 * k * t, c.y + 1 - 8 * k * t, 32 * k * t, 16 * k * t);
      if (b < 1) dessinerChute(ctx, c, v, c.age);
      else {
        var pc2 = vueCouchee(c, v, false);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.drawImage(pc2, Math.round(c.x * ratio - pc2.axd), Math.round(c.y * ratio - pc2.ayd));
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      }
    }
    ctx.globalAlpha = 1;
    v.rendu.corpsVifs = (v.rendu.corpsVifs || 0) + 1;
  }
  // Avec la couche de sol : la chute dessinée sur sa flaque qui naît, puis le corps couché posé (trois paliers de flaque).
  // Animations coupées : posé tout de suite, flaque entière.
  function corpsAuSol(ctx, c, v, anim, SOL) {
    var ratio = v.ratio, t = c.echelle / ECHELLE_TROUPE, fx = c.x - c.regard * 7 * t, R = v.rendu, fl;
    var age = anim ? c.age : CROISSANCE;
    if (age < BASCULE) {
      fl = flaqueReduite(c.flaque, arrondiFlaque(t * tailleFlaque(age)), ratio);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.drawImage(fl, Math.round(fx * ratio - fl.axd), Math.round(c.y * ratio - fl.ayd));
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      dessinerChute(ctx, c, v, age);
      R.flaques++; R.corpsVifs++;
      return;
    }
    var palier = age >= CROISSANCE ? 3 : age >= 0.6 ? 2 : 1;
    if ((c.pose || 0) >= palier) return;
    fl = flaqueReduite(c.flaque, arrondiFlaque(t * tailleFlaque(palier === 3 ? CROISSANCE : palier === 2 ? 0.6 : BASCULE)), ratio);
    var xf = Math.round(fx * ratio - fl.axd), yf = Math.round(c.y * ratio - fl.ayd);
    if (!c.pose) {
      var pc = vueCouchee(c, v, true);
      c.tracePose = v.partie.temps;
      c.trace = SOL.poser(v.sol, "corps", c.tracePose, fl, xf, yf, pc, Math.round(c.x * ratio - pc.axd), Math.round(c.y * ratio - pc.ayd));
    } else SOL.reposer(v.sol, c.trace, c.tracePose, fl, xf, yf);
    c.pose = palier;
  }
  // Flaque à sa taille finale (32 × 16 px × t, centrée 1 px sous les pieds), gardée comme les vues des figurines.
  function flaqueReduite(n, t, ratio) {
    memoVues(ratio);
    var cle = "f|" + n + "|" + t, c = vues[cle];
    if (c) return c;
    c = document.createElement("canvas"); c.width = Math.ceil(32 * t * ratio) + 2; c.height = Math.ceil(16 * t * ratio) + 2;
    var g = c.getContext("2d");
    g.imageSmoothingQuality = "high";
    g.drawImage(flaque(n), 1, 1, 32 * t * ratio, 16 * t * ratio);
    return (vues[cle] = ancrer(c, 1 + 16 * t * ratio, 1 + (8 * t - 1) * ratio, ratio));
  }
  // La vue d'une figurine, assombrie (gardée avec elle).
  function sombre(img) {
    if (img.sombre) return img.sombre;
    var c = document.createElement("canvas"); c.width = img.width; c.height = img.height;
    var g = c.getContext("2d");
    g.drawImage(img, 0, 0);
    g.globalCompositeOperation = "source-atop"; g.fillStyle = "rgba(30,18,10,.5)"; g.fillRect(0, 0, c.width, c.height);
    c.ax = img.ax; c.ay = img.ay; c.lw = img.lw; c.lh = img.lh; c.axd = img.axd; c.ayd = img.ayd;
    return (img.sombre = c);
  }
  // La même, un peu désaturée (corps posé dans la couche de sol), gardée avec elle.
  function desature(img) {
    if (img.gisant) return img.gisant;
    var c = document.createElement("canvas"); c.width = img.width; c.height = img.height;
    var g = c.getContext("2d");
    g.drawImage(img, 0, 0);
    g.globalCompositeOperation = "saturation";
    if (g.globalCompositeOperation === "saturation") {
      g.globalAlpha = 0.45; g.fillStyle = "#808080"; g.fillRect(0, 0, c.width, c.height);
      g.globalAlpha = 1; g.globalCompositeOperation = "destination-in"; g.drawImage(img, 0, 0);
    }
    g.globalCompositeOperation = "source-over";
    c.ax = img.ax; c.ay = img.ay; c.lw = img.lw; c.lh = img.lh; c.axd = img.axd; c.ayd = img.ayd;
    return (img.gisant = c);
  }
  // Une figurine touchée par un trait, un cran plus sombre le temps de son recul (gardée avec sa vue, ombre comprise).
  function touchee(img) {
    if (img.touchee) return img.touchee;
    var c = document.createElement("canvas"); c.width = img.width; c.height = img.height;
    var g = c.getContext("2d");
    g.drawImage(img, 0, 0);
    g.globalCompositeOperation = "source-atop"; g.fillStyle = "rgba(24,12,6,.32)"; g.fillRect(0, 0, c.width, c.height);
    c.ax = img.ax; c.ay = img.ay; c.lw = img.lw; c.lh = img.lh; c.axd = img.axd; c.ayd = img.ayd;
    return (img.touchee = c);
  }
  // Pose couchée d'une figurine (tournée d'un quart de tour vers l'arrière de son regard, aplatie aux 55 centièmes),
  // gardée avec sa vue, dans une toile juste à sa taille. Ancrage : les pieds de la figurine debout.
  function poseCouchee(img, regard, pivot, ratio) {
    var cle = regard > 0 ? "coucheeD" : "coucheeG";
    if (img[cle]) return img[cle];
    var so = sombre(img), xmin, ymin;
    if (regard > 0) { xmin = pivot - so.ay; ymin = 0.55 * (so.ax - so.lw); } else { xmin = so.ay - pivot - so.lh; ymin = -0.55 * so.ax; }
    var c = document.createElement("canvas"); c.width = Math.ceil(so.lh * ratio) + 2; c.height = Math.ceil(0.55 * so.lw * ratio) + 2;
    var ox = 1 - xmin * ratio, oy = 1 - ymin * ratio, g = c.getContext("2d");
    g.setTransform(ratio, 0, 0, ratio, ox, oy); g.scale(1, 0.55); g.rotate(regard > 0 ? -Math.PI / 2 : Math.PI / 2);
    g.drawImage(so, -so.ax, -(so.ay - pivot), so.lw, so.lh);
    return (img[cle] = ancrer(c, ox, oy, ratio));
  }

  // La tour de siège abattue (effet « chute » du moteur) : elle penche et s'assombrit. Animations actives : elle bascule
  // en 2 × BASCULE secondes. Les hommes qui la poussaient tombent comme les autres figurines (corps). Repli sans image :
  // l'écu couché.
  function tombe(ctx, e, v, sang, anim) {
    var fin = sang ? M.DUREE_CHUTE : CHUTE_SANS_SANG;
    if (e.age >= fin) return;
    var a = sang ? Math.min(1, (fin - e.age) / FIN_CHUTE) : Math.min(1, (fin - e.age) / 0.9);
    var regard = e.regard || (e.camp === "rival" ? -1 : 1), cleCamp = e.camp === "rival" ? v.campAdverse : "france";
    var b = anim ? Math.min(1, e.age / (2 * BASCULE)) : 1;
    b = 1 - (1 - b) * (1 - b); // la chute accélère, puis se pose
    var img = vueFigure("unite-" + e.type + "-" + cleCamp, e.type, cleCamp, e.camp === "rival" ? v.adverse.couleurs : v.couleurs, 0, regard < 0, formation(e.type).places[0].echelle * 0.9, v.ratio);
    var so = sombre(img);
    ctx.globalAlpha = a;
    ctx.save(); ctx.translate(e.x + (e.dvx || 0), e.y + (e.dvy || 0)); ctx.rotate(-regard * 0.28 * b);
    ctx.drawImage(so, -so.ax, -so.ay + 4 * b, so.lw, so.lh);
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  // Giclée : par gerbe, une ou deux grosses gouttes (2 à 2,5 px de large) et une brume de fines gouttes partent du corps
  // de la troupe touchée, dans le sens du coup (vers l'arrière pour une chute), retombent et restent là où elles touchent
  // le sol. Gouttes étirées dans le sens de leur vol tant qu'elles volent. Tirage fixe par effet (e.graine, tirée de sa
  // place pour un coup : jamais Math.random dans le dessin), dessiné en quatre remplissages au plus. Sur un bataillon, la
  // giclée part de la figurine touchée ou tombée (gx, gy ; haut : hauteur de son corps ; elan : vitesses × elan, pour
  // qu'elles retombent près d'elle ; gouttes : leur nombre). Même sang pour tous les camps.
  // Avec la couche de sol (bataille-sol.js) : les gouttes retombées sont brun-rouge (ROUGE_POSE) et ne pâlissent pas ; à
  // la fin de la giclée, elles sont posées en taches dans la couche (poserTaches). Sans elle, toute la giclée pâlit.
  var GRAVITE = 260, ROUGE_POSE = "#4a0606"; // px/s² (la moitié de l'accélération) ; rouge des gouttes posées
  var gouttesTmp = new Float32Array(GOUTTES * 6); // par goutte : x, y, rx, ry, angle, posée (1) ou en vol (0)
  function gouttes(e, t) {
    if (e.graine === undefined) e.graine = Math.floor(hasard(e.x * 0.731 + e.y * 1.379) * 997) + 1;
    var chute = e.genre === "chute", tl = e.taille || 1, el = e.elan || 1;
    var n = Math.min(GOUTTES, e.gouttes || (chute ? GOUTTES : e.fort ? GOUTTES - 1 : GOUTTES - 3));
    var ex = e.gx !== undefined ? e.gx : e.x, ey = e.gy !== undefined ? e.gy : e.y;
    var dir = chute ? -(e.regard || 1) : e.dir || 1, x0 = ex, y0 = ey - (e.haut || HAUT_CORPS), sol = ey + 2;
    var grosses = hasard(e.graine + 0.5) < 0.55 ? 2 : 1;
    for (var i = 0; i < n; i++) {
      var h1 = hasard(e.graine + i * 7.13), h2 = hasard(e.graine + i * 3.71 + 50), h3 = hasard(e.graine + i * 1.37 + 90), grosse = i < grosses;
      var vx = dir * (20 + 90 * h1) * el * (chute && h3 < 0.3 ? -0.5 : 1) * (grosse ? 0.8 : 1.15), vy = -(30 + 80 * h2) * el * (grosse ? 0.85 : 1);
      var r = grosse ? 1 + 0.25 * h3 : 0.25 + 0.2 * h3, bas = sol + 3 * h3 * tl;
      // instant où la goutte touche le sol : elle s'y arrête
      var tSol = (-vy + Math.sqrt(vy * vy + 4 * GRAVITE * (bas - y0))) / (2 * GRAVITE), tt = Math.min(t, tSol), j = i * 6;
      gouttesTmp[j] = x0 + vx * tt; gouttesTmp[j + 1] = y0 + vy * tt + GRAVITE * tt * tt;
      if (t < tSol) {
        var vyt = vy + 2 * GRAVITE * t;
        gouttesTmp[j + 2] = r * Math.min(2, 1 + Math.sqrt(vx * vx + vyt * vyt) / 220); gouttesTmp[j + 3] = r * 0.8; gouttesTmp[j + 4] = Math.atan2(vyt, vx); gouttesTmp[j + 5] = 0;
      } else { gouttesTmp[j + 2] = r * 1.3; gouttesTmp[j + 3] = r * 0.6; gouttesTmp[j + 4] = 0; gouttesTmp[j + 5] = 1; } // posée : une petite tache à plat
    }
    return n;
  }
  function giclee(ctx, e, v, SOL) {
    var duree = e.genre === "chute" ? GICLEE_CHUTE : GICLEE_COUP, n = gouttes(e, e.age), pose = !!SOL;
    e.gicle = true;
    if (!pose) ctx.globalAlpha = Math.max(0, 1 - e.age / duree);
    for (var c = 0; c < 4; c++) {
      var ouvert = false;
      for (var i = 0; i < n; i++) {
        var j = i * 6, posee = pose && gouttesTmp[j + 5] > 0;
        if (c === 3 ? !posee : posee || i % 3 !== c) continue;
        if (!ouvert) { ctx.beginPath(); ouvert = true; }
        var x = gouttesTmp[j], y = gouttesTmp[j + 1], rx = gouttesTmp[j + 2], rot = gouttesTmp[j + 4];
        ctx.moveTo(x + rx * Math.cos(rot), y + rx * Math.sin(rot));
        ctx.ellipse(x, y, rx, gouttesTmp[j + 3], rot, 0, Math.PI * 2);
      }
      if (ouvert) { ctx.fillStyle = c === 3 ? ROUGE_POSE : ROUGES[c]; ctx.fill(); }
    }
    ctx.globalAlpha = 1;
    if (v && v.rendu) v.rendu.gouttes += n;
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

  // ---------- la partie ----------
  var enChargement = false; // une seule bataille à la fois, même pendant le chargement des images
  var ATTENTE_MAX = 5000; // ms : une image qui ne répond pas ne bloque jamais la bataille

  // Questions d'une vague, tirées au début de son conseil (le niveau suit les dernières réponses ; une bataille tire les
  // niveaux 1 à 3, JEU.questions.NIVEAUX_BATAILLE) : une par fiche, sans reprendre une question ni une fiche déjà posées
  // dans cette bataille (s'il en manque, sans la règle des fiches). Une question ratée qui revient (rappels.js) passe
  // outre et prend sa place dans le lot.
  function tirerQuestions(n, posees) {
    var ids = posees.map(function (q) { return q.id; }), fiches = posees.map(function (q) { return q.fiche; });
    return enBataille(function () { return JEU.recit.suite(n, { exclure: ids, filtre: function (q) { return fiches.indexOf(q.fiche) < 0; }, completer: true }); });
  }
  // Tirage ou replacement des « Seconde chance » aux niveaux de la bataille (1 à 3) : une question de niveau 3 ratée
  // pendant la bataille y revient comme les autres.
  function enBataille(f) {
    var Q = JEU.questions;
    return Q.avecNiveaux ? Q.avecNiveaux(Q.NIVEAUX_BATAILLE, f) : f();
  }

  // lieu : "domaine" (un camp adverse attaque) ou l'identifiant d'une province.
  // contexte (facultatif, expédition, 24/10/2026) : une bataille de route, qui ne touche jamais la campagne. Tout ce qui
  // venait de la province ou du domaine vient de lui : { carte, titre, front, camp (nom du camp dans les images, sinon celui
  // du front), niveau, vagues, defense, pvRival, pvRivalMax, options (celles de JEU.expedition.optionsBataille, à la place de
  // C.options(niveau) ; vagues, defense et solidités de la halte sont posés par-dessus), semaine (l'éclaireur la dit une vague
  // sur deux), tirage(n, posees) (à la place de tirerQuestions, aux niveaux de la bataille), cadre(q) (à la place de
  // JEU.recit.cadre), nomRival, rivalPerso (médaillon ; sinon « un seigneur rival » au tortil du camp), eclaireur (phrase dite
  // avant la première question de la 1re vague, jamais entre deux), eclaireurs (rang de la faveur : 2 repose l'espion à la
  // 2e vague), sansFiche (panneau d'erreur sans « Voir la fiche »), vitesse, surVitesse(n), surVague(numero) (la vague est
  // lancée : la halte est entamée), surFin(bilan) (à la place de C.apresBataille ; peut rendre { titre, texte, butin,
  // bouton } pour l'écran de fin), surQuitter(entamee) (à la place de C.apresBataille), retour() (à la place de la carte de
  // campagne) }. lieu n'est alors qu'un identifiant rendu dans le bilan. Sans contexte, rien ne change.
  function lancer(lieu, contexte) {
    if (enChargement || JEU.partie) return; // double clic ou touche pressée deux fois : une seule bataille
    var el = JEU.ui.el;
    var C = JEU.campagne;
    contexte = contexte || null;
    var defense = contexte ? !!contexte.defense : lieu === "domaine";
    var prov = contexte || defense ? null : C.province(lieu);
    var frontId = contexte ? contexte.front : defense ? (C.etat().rival.attaque || "angleterre") : prov.front;
    var adv = C.campDe(frontId), Adv = function (t) { return C.maj1(t); };
    var niveau = contexte ? contexte.niveau : defense ? Math.min(4, Math.floor(C.etat().conquises.length / 2)) : prov.niveau;
    var vagues = contexte ? contexte.vagues : defense ? 3 : 4;
    // le lot d'une vague : sur la route, le tirage du contexte (quota de la semaine), aux niveaux de la bataille
    function tirer(n, posees) { return contexte ? enBataille(function () { return contexte.tirage(n, posees); }) : tirerQuestions(n, posees); }
    var questions = tirer(QUESTIONS_PAR_VAGUE, []);
    if (questions.length < QUESTIONS_PAR_VAGUE) { JEU.ui.toast("Pas encore assez de questions pour une bataille."); return; }
    var carteId = contexte ? contexte.carte : defense ? "domaine" : prov.carte;
    var campAdv = (contexte && contexte.camp) || (C.front(frontId) || {}).camp || "angleterre"; // nom du camp dans les images (angleterre, omeyyades)
    // Terrain : sur le front du sud, la variante sèche du même tracé (herbe jaunie, oliviers, cyprès), si elle existe ;
    // sinon le terrain vert ; sinon l'ancien fond peint. La défense du domaine garde le terrain du domaine ; sur la route,
    // la variante suit le camp, quel que soit le mode.
    var sec = campAdv === "omeyyades" && (contexte ? carteId !== "domaine" : !defense);
    var terrains = (sec ? ["terrain-" + carteId + "-sud"] : []).concat(["terrain-" + carteId, "terrain-peint"])
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
    return true; // la bataille démarre (après le chargement du terrain) : l'écran des expéditions le sait (24/10/2026)

    function demarrer() {
      var carte = JEU.cartesBataille.carte(carteId);
      var o;
      if (contexte) {
        // bataille de route : les options du contexte (faveurs, Armorial, sans les bonus de la campagne, or perdu par erreur
        // déjà réglé), puis les vagues, le mode et les solidités de la halte
        o = Object.assign({}, contexte.options || C.options(niveau));
        o.vagues = vagues; o.defense = defense;
        if (typeof contexte.pvRival === "number") o.pvRival = contexte.pvRival;
        if (typeof contexte.pvRivalMax === "number") o.pvRivalMax = contexte.pvRivalMax;
      } else {
        o = C.options(niveau);
        o.vagues = vagues;
        var cfg = JEU.donnees.config || {};
        if (typeof cfg.orPerduErreur === "number") o.orPerduErreur = cfg.orPerduErreur; // or perdu par réponse fausse
        if (defense) { o.pvRival = 12; o.pvRivalMax = 12; }
        else { o.pvRival = C.etat().provinces[lieu].pv; o.pvRivalMax = prov.pv; }
      }
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
        horloge: 0, survol: -1, curseur: -1, choix: "archers", choixTour: -1, vitesse: contexte && contexte.vitesse > 0 ? contexte.vitesse : 1, envoyesVague: 0, gardeEntree: 0,
        survolRivale: -1, porteesRivales: false, retrait: null, hud: null, hudDiscret: false, repos: 0,
        // bataillons : figurines couchées, troupes vues à l'image d'avant, troupes tombées depuis peu (decalEffet), heure
        // de la partie au dernier dessin, et compteurs de la dernière image (bataillons, figurines debout, figurines
        // couchées, bannières : essais)
        corps: [], vus: [], morts: [], tempsRendu: 0, rendu: { bataillons: 0, figures: 0, corps: 0, bannieres: 0, corpsVifs: 0, particules: 0, etincelles: 0,
          trainees: 0, lueurs: 0, gouttes: 0, flaques: 0, decalques: null, secousses: 0, niveau: 0 },
        sol: null, // couche de sol (bataille-sol.js), refaite avec le fond
        naissance: null }; // tours rivales neuves en fondu (effet « tourRivale ») : emplacement → âge, calculé à chaque image
      var titre = contexte ? (contexte.titre || "Bataille de route") : defense ? "Défense du domaine contre " + adv.armee : "Bataille : " + prov.nom;
      // Le rival du front, à son titre seul (jeu/data/personnages.js ; sinon « un seigneur rival ») : ses décisions du
      // moteur (p.ia.journal) se lisent dans la colonne de droite, sous son médaillon, en tête du conseil de guerre de
      // chaque vague et au départ d'une vague. Jamais entre deux questions. Sur la route, le contexte dit qui il est ;
      // sans personnage, un seigneur rival au tortil du camp (gardien de semaine).
      var rivalPerso = contexte ? (contexte.rivalPerso || null) : C.rivalDe ? C.rivalDe(frontId) : null;
      var nomRival = contexte && contexte.nomRival ? contexte.nomRival : rivalPerso ? rivalPerso.nom : "Un seigneur rival";
      if (contexte && !rivalPerso) rivalPerso = { camp: campAdv, generique: true, nom: nomRival };
      function motDuRival(alerte) {
        var t = phraseRival(p.ia && p.ia.journal, p.vague, alerte, nomRival);
        if (!t) return null;
        var carte = JEU.ui.recit({ nom: nomRival, icone: "defi", texte: t }), E = JEU.ecranCampagne;
        carte.classList.add("recit-rival");
        if (E && E.medaillon) {
          var port = carte.querySelector(".recit-portrait");
          if (port) { port.innerHTML = E.medaillon(rivalPerso, 50); E.surveillerPortraits(carte); }
        }
        return carte;
      }
      var zone = JEU.ui.commencerPartie(titre, function () { if (contexte) contexte.retour(); else JEU.ui.afficher("jouer"); });
      JEU.musique.humeur("guerre");
      var actif = true, iQ = 0, poseesVague = 0, bonnes = 0, total = 0, finie = false;

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
        // couche de sol (lot A) : refaite depuis le fond neuf, ses traces sont perdues
        if (JEU.batailleSol) { JEU.batailleSol.liberer(v.sol); v.sol = JEU.batailleSol.creer(v.fond, v.ratio); }
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

      // L'or du bandeau rougit un instant quand une erreur en coûte (classe « perte », jeu.css).
      function orPerdu() {
        var b = hudOr && hudOr.parentNode;
        if (!b) return;
        b.classList.remove("perte"); void b.offsetWidth; b.classList.add("perte");
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
              sel.niveau < M.AMELIORATION.max ? el("button", { class: "bouton petit", "data-cle": "ameliorer", disabled: p.or < cAm, onclick: function () { ameliorer(sel.emplacement); } }, ["Améliorer", auClavier ? astuce("A") : null, " · " + cAm + " or"]) : el("span", { class: "note", texte: "Niveau maximal" }),
              el("button", { class: "lien", "data-cle": "fermer", onclick: function () { v.choixTour = -1; majOrdres(); }, texte: "Fermer" })
            ]));
          }
          ordres.appendChild(el("p", { class: "consigne", texte: "Choisis une tour, puis " + (JEU.ui.tactile ? "touche" : "clique") + " un emplacement près de la route." }));
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
          ordres.appendChild(el("button", { class: "bouton principal td-lancer", "data-cle": "lancer", disabled: !auClavier, onclick: lancerVague }, auClavier ? ["Lancer la vague", astuce("Entrée")] : ["Réponds d'abord au conseil de guerre"]));
          if (auClavier) ordres.appendChild(el("p", { class: "note td-touches" }, [
            "Au clavier :", touche("1"), "à", touche(String(Object.keys(M.TOURS).length)), "une tour,", touche("← ↑ ↓ →"), "un emplacement,",
            touche("Espace"), "bâtir,", touche("A"), "améliorer,", touche("Entrée"), "lancer la vague."
          ]));
        } else if (p.phase === "vague") {
          var vit = el("div", { class: "td-vitesse" }, [1, 2, 3].map(function (n) {
            return el("button", { class: "bouton petit" + (v.vitesse === n ? " principal" : ""), "data-cle": "vitesse-" + n, onclick: function () { v.vitesse = n; majOrdres(); if (contexte && contexte.surVitesse) contexte.surVitesse(n); }, texte: "×" + n });
          }));
          ordres.appendChild(el("p", { texte: "Regarde tes tours tenir la route." + (v.envoyesVague ? " Tes troupes marchent sur " + adv.chateau + " : quand elles croisent des soldats adverses, elles se battent au corps à corps." : "") }));
          ordres.appendChild(vit);
          ordres.appendChild(tableauMelee());
        } else {
          // fin : un court résumé du combat plutôt qu'un cadre vide
          ordres.appendChild(el("ul", { class: "td-resume" }, [
            el("li", { texte: "Soldats envoyés : " + p.stats.envoyes }),
            el("li", { texte: "Ennemis arrêtés : " + p.stats.tues }),
            el("li", { texte: "Combats au corps à corps : " + p.stats.duels }),
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
        p.unites.forEach(function (u) { if (!u.vivant) return; if (u.camp === "rival") rivaux++; else amis++; }); // une troupe tombée à cette étape compte déjà dans « arrêtés »
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
        if (contexte) {
          // route : la phrase de l'éclaireur du contexte avant la première question de la 1re vague ; sinon la semaine de
          // l'acte, une vague sur deux (toujours en tête du conseil, jamais entre deux questions)
          if (p.vague === 0 && contexte.eclaireur) return contexte.eclaireur;
          if (typeof contexte.semaine === "number" && Math.random() < 0.5) return "Nous traversons les terres de la semaine " + contexte.semaine + " : ses cours sont en tête.";
        }
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
        if (p.vague > 0) questions = questions.concat(tirer(QUESTIONS_PAR_VAGUE, questions));
        JEU.mesure.debut = null; // la première question suit une vague, pas une réponse
        v.curseur = -1; v.survol = -1; v.survolRivale = -1;
        conseil.innerHTML = "";
        var mot = motDuRival(false); // sa décision pour cette vague, prise par le moteur à la fin de la précédente
        if (mot) conseil.appendChild(mot);
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
          // or de la réponse (moteur) : juste, +12 (et +10 au 3e succès d'affilée) ; fausse, −6 sur l'or de la bataille,
          // jamais en dessous de zéro (config.js, orPerduErreur). Rien d'autre n'est jamais perdu.
          var or = M.repondre(p, juste);
          if (juste) {
            bonnes++;
            JEU.sons.jouer(or.eclat ? "coup-puissant" : "coup");
            JEU.ui.tampon(or.eclat ? "Coup d'éclat" : "Juste", "+" + or.or + " or");
            JEU.mesure.reponseDonnee();
            questionSuivante(scene);
            // or, ressources et boutons de l'arsenal : mis à jour une image plus tard, comme le sceau (la première
            // image après la réponse ne peint que la question suivante)
            var majApres = function () { JEU.ui.majRessources(); if (actif) majTout(); };
            if (JEU.anim && JEU.anim.apresImage) JEU.anim.apresImage(majApres); else majApres();
          } else {
            // la question ratée reviendra un peu plus tard : si c'est dans cette vague, elle prend sa place dans le lot
            enBataille(function () { JEU.rappels.replacer(questions, iQ, poseesVague + QUESTIONS_PAR_VAGUE); });
            JEU.ui.panneauErreur(q, scene, function () { v.repos = v.horloge + REPOS_APRES_REPONSE; JEU.mesure.reponseDonnee(); questionSuivante(scene); majTout(); }, contexte ? { sansFiche: !!contexte.sansFiche } : undefined);
            montrer(scene, "proche"); // le panneau d'erreur, vu depuis son titre
            // l'or perdu se voit tout de suite, sans rien retarder : sceau « −6 or » et or du bandeau, une image plus tard
            // (le son d'erreur du panneau suffit)
            if (or.or < 0) {
              JEU.ui.tampon("Dommage", "−" + (-or.or) + " or", "perte");
              var perteApres = function () { if (!actif) return; majTout(); orPerdu(); };
              if (JEU.anim && JEU.anim.apresImage) JEU.anim.apresImage(perteApres); else perteApres();
            }
          }
        }, { recit: contexte && contexte.cadre ? contexte.cadre(q) : JEU.recit.cadre(q, defense ? "defense" : "preparation", adv) });
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
        v.choixTour = -1; v.curseur = -1; v.survol = -1; v.survolRivale = -1; v.porteesRivales = false;
        if (contexte && contexte.eclaireurs >= 2 && p.vague === 1) p.modificateurs.espion = true; // Éclaireurs au rang 2 : la 2e vague adverse aussi perd un homme
        M.lancerVague(p);
        if (contexte && contexte.surVague) contexte.surVague(p.vague); // la halte est entamée : fermer le jeu vaut une retraite
        v.envoyesVague = p.fileAmie.length;
        JEU.sons.jouer("construction");
        conseil.innerHTML = "";
        var texte = defense
          ? Adv(adv.troupes) + " chargent ! Tes tours tiennent la route." + (v.envoyesVague ? " Tes soldats partent vers " + adv.chateau + "." : "")
          : (v.envoyesVague ? "Tes troupes s'élancent. " : "Tes tours attendent l'ennemi. ") + Adv(adv.soldats) + " marchent sur ton château.";
        conseil.appendChild(JEU.ui.recit({ nom: "Le capitaine", icone: "rallier", texte: texte }));
        var alerte = motDuRival(true); // ses guetteurs ont vu ton armée sortir : il rappelle des gardes à sa porte
        if (alerte) conseil.appendChild(alerte);
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
      function emplacementSous(pt, rayon) {
        var meilleur = -1, dm = rayon || 30;
        carte.emplacements.forEach(function (e, i) { var d = Math.hypot(e[0] - pt.x, e[1] - pt.y); if (d < dm) { dm = d; meilleur = i; } });
        return meilleur;
      }
      // tour adverse sous la souris (son pied ou son corps, qui monte de 24 px) : sa portée se dessine pendant la préparation
      function tourRivaleSous(pt, rayon) {
        var meilleure = -1, dm = rayon || 30;
        p.toursRivales.forEach(function (tr, i) {
          var d = Math.min(Math.hypot(tr.x - pt.x, tr.y - pt.y), Math.hypot(tr.x - pt.x, tr.y - 24 - pt.y));
          if (d < dm) { dm = d; meilleure = i; }
        });
        return meilleure;
      }
      // Au doigt (tablette, 31/10/2026) : la position est prise à l'appui, la cible est plus large (RAYON_DOIGT), et la portée
      // montrée (emplacement choisi, tour adverse touchée) reste jusqu'au toucher suivant : sans souris, rien ne « survole ».
      var pointeurTactile = false;
      canvas.addEventListener("pointerdown", function (ev) {
        pointeurTactile = ev.pointerType === "touch";
        if (!pointeurTactile) return;
        var pt = point(ev);
        v.survol = emplacementSous(pt, RAYON_DOIGT);
        v.survolRivale = v.survol < 0 ? tourRivaleSous(pt, RAYON_DOIGT) : -1;
        if (v.survol >= 0) v.curseur = -1;
      });
      canvas.addEventListener("pointermove", function (ev) {
        if (ev.pointerType === "touch") return;
        var pt = point(ev);
        v.survol = emplacementSous(pt);
        v.survolRivale = v.survol < 0 ? tourRivaleSous(pt) : -1;
        if (v.survol >= 0) v.curseur = -1; // la souris reprend la main
        canvas.style.cursor = v.survol >= 0 && p.phase === "preparation" ? "pointer" : "";
      });
      canvas.addEventListener("pointerleave", function () { if (pointeurTactile) return; v.survol = -1; v.survolRivale = -1; });
      // pointeur (ou focus du clavier) sur un bouton de troupe : la portée de toutes les tours adverses se montre, pour
      // voir sur quel tronçon de la route tes soldats seront pris sous le tir
      function voirPortees(ev) {
        if (ev.pointerType === "touch") return; // au doigt : le bouton touché garde le focus, les portées restent jusqu'au toucher suivant
        var b = ev.target && ev.target.closest ? ev.target.closest('[data-cle^="troupe-"]') : null;
        v.porteesRivales = !!b && (ev.type === "pointerover" || ev.type === "focusin");
      }
      ["pointerover", "pointerout", "focusin", "focusout"].forEach(function (t) { ordres.addEventListener(t, voirPortees); });
      canvas.addEventListener("click", function (ev) { agirSur(emplacementSous(point(ev), pointeurTactile ? RAYON_DOIGT : 30)); });
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
            p.unites.forEach(function (u) { var b = u.bat && u.bat.vx !== undefined ? u.bat : null; p.effets.push({ genre: "retrait", x: b ? b.vx : u.x, y: b ? b.vy : u.y, age: 0 }); });
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
      // sans attendre la bataille suivante, comme les vues gardées des figurines (quelques Mo à la netteté 2).
      function arreter() {
        actif = false; arreterTaille(); JEU.musique.humeur("paix");
        v.fond = null; canvas.width = 0; canvas.height = 0;
        if (JEU.batailleSol) JEU.batailleSol.liberer(v.sol);
        v.sol = null;
        if (JEU.batailleEffets) JEU.batailleEffets.vider();
        v.corps.length = 0; oublierVues();
      }
      JEU.partie.surQuitter = function () {
        arreter();
        if (finie) return;
        finie = true;
        var entamee = p.vague > 0 || p.phase !== "preparation";
        if (contexte) { if (contexte.surQuitter) contexte.surQuitter(entamee); } // la route décide (un vivre après la 1re vague), la campagne ne bouge pas
        else C.apresBataille({ lieu: lieu, front: frontId, issue: "retraite", degatsRival: p.stats.degatsRival, entamee: entamee });
      };

      function bilan() {
        if (finie) return;
        finie = true;
        var issue = p.fin;
        var b = { lieu: lieu, front: frontId, issue: issue, degatsRival: p.stats.degatsRival, bonnes: bonnes, total: total };
        var gains = {}, route = null;
        if (contexte) {
          // bataille de route : le bilan va au contexte (vivres, porte, or de route, renommée), jamais à la campagne ; il
          // peut rendre les textes de l'écran de fin { titre, texte, butin, bouton }
          b.vagues = p.vague; b.murs = p.chateau.pv; b.mursMax = p.chateau.max; b.pvRival = p.rival.pv; b.pvRivalMax = p.rival.max; b.or = Math.floor(p.or);
          route = (contexte.surFin ? contexte.surFin(b) : null) || {};
        } else gains = C.apresBataille(b);
        var etat = JEU.sauvegarde.etat();
        etat.stats.parties++;
        JEU.sauvegarde.enregistrer();
        JEU.ui.majRessources();
        majTout();
        var titreB, texte;
        if (contexte) {
          var camp = "le camp adverse";
          titreB = route.titre || (issue === "retraite" ? "Les murs ont cédé" : issue === "victoire" ? "Le camp adverse est tombé !" : defense ? "La compagnie tient !" : "Le camp tient encore");
          texte = route.texte || (issue === "retraite" ? "Tes gens se replient en bon ordre. La route continue." : issue === "victoire" ? "Une victoire éclatante : " + camp + " est pris." :
            defense ? Adv(adv.armee) + " renonce et s'éloigne de la route." : (p.stats.degatsRival > 0 ? "Ton armée a porté " + pluriel(p.stats.degatsRival, "coup") + " à " + camp + "." : "Aucun de tes soldats n'a atteint " + camp + ".") + " La route continue.");
        } else if (defense) {
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
        if (route && route.butin) liste = route.butin;
        conseil.innerHTML = "";
        conseil.appendChild(el("div", { class: "bilan" + (issue !== "retraite" ? " reussi" : "") }, [
          el("h2", { texte: titreB }), el("p", { texte: texte }),
          el("p", { class: "grand", texte: bonnes + " / " + total + " bonnes réponses au conseil de guerre" }),
          el("p", { texte: liste ? "Butin : " + liste + "." : "Rien de perdu : tout ce que tu as gagné reste à toi." }),
          el("button", { class: "bouton principal", onclick: retour, texte: contexte ? (route.bouton || "Continuer la route (Entrée)") : "Retour à la campagne (Entrée)" })
        ]));
        if (issue !== "retraite") {
          JEU.sons.jouer("validation"); JEU.mentor.feliciter();
          setTimeout(function () { var bl = conseil.querySelector(".bilan"); if (bl) { var c = JEU.anim.centre(bl); JEU.anim.eclat(c.x, c.y - 40, "feuilles", 80); } }, 30);
        }
        JEU.ui.clavier = function (k) { if (k === "Enter") { retour(); return true; } return false; };
        montrer(conseil, "proche");
      }
      function retour() { arreter(); JEU.ui.finirPartie(); if (contexte) contexte.retour(); else JEU.ui.afficher("jouer"); }

      majTout();
      preparation();
      lance = true;
      racine.requestAnimationFrame(boucle);
      JEU.bataille.enCours = p; // pour les tests de bout en bout
      JEU.bataille.rendu = v.rendu;
    }
  }

  JEU.bataille = { lancer: lancer, enChargement: function () { return enChargement; }, QUESTIONS_PAR_VAGUE: QUESTIONS_PAR_VAGUE, verrouille: verrouille, phraseRival: phraseRival,
    // formations des bataillons (essais sous Node : tests.js)
    bataillons: { BATAILLONS: BATAILLONS, BORD_ROUTE: BORD_ROUTE, ECART_FRONTS: ECART_FRONTS, CORPS_MAX: CORPS_MAX,
      ECART_FILE: ECART_FILE, DECAL_MELEE: DECAL_MELEE, DECAL_FILE: DECAL_FILE, DECAL_PORTE: DECAL_PORTE,
      formation: formation, debout: deboutVoulu, cote: coteBataillon, placer: placerMelees, pointRoute: pointRoute, suivre: majBataillons } };
})(typeof window !== "undefined" ? window : globalThis);
