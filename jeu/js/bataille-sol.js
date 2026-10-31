// Couche de sol du champ de bataille (lot A, 31/10/2026). Les traces qui restent un moment par terre (corps couchés et
// leurs flaques, taches de sang retombées, cratères, flèches plantées) sont posées une seule fois dans une toile hors
// écran de la taille du fond (la « vue »), dessinée à la place du fond : une image du combat ne les redessine plus.
// Script classique et facultatif : bataille.js l'appelle s'il est chargé (JEU.batailleSol) et dessine comme avant sinon.
//
// Effacement. Une seconde toile (la « cible ») porte le fond et les traces de moins de GARDE secondes. Quand une trace
// a GARDE secondes, on la retire de la cible : on y recopie le fond sur son rectangle, puis on y repose les traces plus
// jeunes qui le touchent. La vue rejoint ensuite la cible, bande par bande (BANDES bandes en hauteur ; seules les bandes
// où une trace a été retirée, et seulement leur partie touchée ; au plus BANDES_PAR_IMAGE bandes par image), avec une
// opacité réglée sur le temps écoulé : il reste e^(−FONTE × t) de la trace t secondes après sa garde. Avec GARDE = 4,5 s
// et FONTE = 0,8 : la trace est entière 4,5 s, encore bien visible à 6 s (30 %), presque effacée à 8 s (6 %), disparue
// à 9 s (3 %). Au bout de FIN secondes, la bande touchée est recopiée telle quelle depuis la cible.
// Le temps est celui de la partie (la vitesse ×2 ou ×3 efface plus vite, comme elle fait vieillir les corps).
// La couche est refaite depuis le fond quand la netteté de la toile change, et à chaque bataille (les traces sont perdues).
// Positions des images en px de la toile (entiers : copies pixel pour pixel) ; taches en px logiques (× ratio).
(function (racine) {
  "use strict";
  var JEU = racine.JEU = racine.JEU || {};
  var BANDES = 8, BANDES_PAR_IMAGE = 2, GARDE = 4.5, FONTE = 0.8, FIN = 6, MAX = 320, RETRAITS = 6, TACHES = 16;
  var GENRES = ["corps", "taches", "crateres", "fleches"];
  var ESSAI = { fondu: true, pose: true }; // ESSAI-TEMPORAIRE

  function toile(w, h) { var c = document.createElement("canvas"); c.width = w; c.height = h; return c; }
  function nouvelle() {
    return { genre: "corps", t0: 0, dans: false, x0: 0, y0: 0, x1: 0, y1: 0, img1: null, ix1: 0, iy1: 0, img2: null, ix2: 0, iy2: 0,
      taches: new Float32Array(TACHES * 4), nt: 0, couleur: "" };
  }

  // Une couche neuve, copiée du fond (toile du terrain à la netteté de la toile du combat).
  function creer(fond, ratio) {
    var W = fond.width, H = fond.height, vue = toile(W, H), cible = toile(W, H);
    var gv = vue.getContext("2d", { alpha: false }), gc = cible.getContext("2d", { alpha: false });
    gv.drawImage(fond, 0, 0); gc.drawImage(fond, 0, 0);
    var traces = [], bandes = [], hb = Math.ceil(H / BANDES), i;
    for (i = 0; i < MAX; i++) traces.push(nouvelle());
    for (i = 0; i < BANDES; i++) bandes.push({ y0: i * hb, h: Math.max(0, Math.min(hb, H - i * hb)), x0: W, x1: 0, jusqua: -1, t: 0 });
    var compte = {};
    GENRES.forEach(function (g) { compte[g] = 0; });
    return { fond: fond, vue: vue, cible: cible, gv: gv, gc: gc, W: W, H: H, ratio: ratio, traces: traces, tete: 0, n: 0,
      bandes: bandes, prochaine: 0, compte: compte, poses: 0, t: 0 };
  }
  // Rend la mémoire des deux toiles (fin de bataille).
  function liberer(sol) {
    if (!sol) return;
    sol.vue.width = sol.vue.height = 0; sol.cible.width = sol.cible.height = 0;
    sol.traces.length = 0; sol.n = 0; sol.fond = null;
  }

  function peindre(g, r, ratio) {
    if (!ESSAI.pose) return; // ESSAI-TEMPORAIRE
    if (r.img1) g.drawImage(r.img1, r.ix1, r.iy1);
    if (r.img2) g.drawImage(r.img2, r.ix2, r.iy2);
    if (r.nt) {
      g.setTransform(ratio, 0, 0, ratio, 0, 0);
      g.fillStyle = r.couleur; g.beginPath();
      for (var k = 0; k < r.nt; k++) {
        var j = k * 4, x = r.taches[j], y = r.taches[j + 1], rx = r.taches[j + 2], ry = r.taches[j + 3];
        g.moveTo(x + rx, y); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
      }
      g.fill();
      g.setTransform(1, 0, 0, 1, 0, 0);
    }
  }
  function boiteImage(r, img, x, y) {
    if (!img) return;
    r.x0 = Math.min(r.x0, x); r.y0 = Math.min(r.y0, y); r.x1 = Math.max(r.x1, x + img.width); r.y1 = Math.max(r.y1, y + img.height);
  }
  function borner(sol, r) {
    r.x0 = Math.max(0, Math.floor(r.x0) - 1); r.y0 = Math.max(0, Math.floor(r.y0) - 1);
    r.x1 = Math.min(sol.W, Math.ceil(r.x1) + 1); r.y1 = Math.min(sol.H, Math.ceil(r.y1) + 1);
  }

  // Une place libre dans l'anneau des traces (dans l'ordre de pose) ; plein, la plus ancienne est retirée tout de suite.
  function place(sol, t) {
    if (sol.n >= MAX) { retirer(sol, sol.traces[sol.tete], t); sol.tete = (sol.tete + 1) % MAX; sol.n--; }
    var r = sol.traces[(sol.tete + sol.n) % MAX];
    sol.n++;
    r.t0 = t; r.dans = true; r.img1 = r.img2 = null; r.nt = 0;
    r.x0 = Infinity; r.y0 = Infinity; r.x1 = -Infinity; r.y1 = -Infinity;
    return r;
  }

  // Pose une trace faite d'une ou deux images (img1 sous img2 : la flaque, puis le corps). Rend la trace (reposer).
  function poser(sol, genre, t, img1, x1, y1, img2, x2, y2) {
    var r = place(sol, t);
    r.genre = genre; r.img1 = img1 || null; r.ix1 = x1; r.iy1 = y1; r.img2 = img2 || null; r.ix2 = x2; r.iy2 = y2;
    boiteImage(r, r.img1, x1, y1); boiteImage(r, r.img2, x2, y2); borner(sol, r);
    peindre(sol.gv, r, sol.ratio); peindre(sol.gc, r, sol.ratio);
    sol.compte[genre]++; sol.poses++;
    return r;
  }
  // La flaque d'un corps déjà posé grandit : la nouvelle flaque, puis le corps par-dessus, dans les deux toiles.
  function reposer(sol, r, t0, img1, x1, y1) {
    if (!r || !r.dans || r.t0 !== t0) return;
    r.img1 = img1; r.ix1 = x1; r.iy1 = y1;
    boiteImage(r, img1, x1, y1); borner(sol, r);
    var g = [sol.gv, sol.gc];
    for (var k = 0; k < 2; k++) { g[k].drawImage(img1, x1, y1); if (r.img2) g[k].drawImage(r.img2, r.ix2, r.iy2); }
  }
  // Pose des taches de sang retombées (px logiques : x, y, rx, ry à la suite dans « liste », n taches au plus TACHES).
  function poserTaches(sol, t, liste, n, couleur) {
    if (!(n > 0)) return null;
    var r = place(sol, t), q = sol.ratio;
    n = Math.min(n, TACHES);
    r.genre = "taches"; r.nt = n; r.couleur = couleur;
    for (var k = 0; k < n * 4; k++) r.taches[k] = liste[k];
    for (k = 0; k < n; k++) {
      var j = k * 4, x = liste[j], y = liste[j + 1], rx = liste[j + 2], ry = liste[j + 3];
      r.x0 = Math.min(r.x0, (x - rx) * q); r.y0 = Math.min(r.y0, (y - ry) * q); r.x1 = Math.max(r.x1, (x + rx) * q); r.y1 = Math.max(r.y1, (y + ry) * q);
    }
    borner(sol, r);
    peindre(sol.gv, r, q); peindre(sol.gc, r, q);
    sol.compte.taches++; sol.poses++;
    return r;
  }

  // Retire une trace de la cible : le fond recopié sur son rectangle, les traces plus jeunes qui le touchent reposées
  // (coupées au rectangle) ; les bandes touchées de la vue sont à rejoindre.
  function retirer(sol, r, t) {
    if (!r.dans) return;
    r.dans = false; sol.compte[r.genre]--;
    var x0 = r.x0, y0 = r.y0, w = r.x1 - r.x0, h = r.y1 - r.y0, g = sol.gc, coupe = false;
    r.img1 = r.img2 = null;
    if (!(w > 0 && h > 0)) return;
    g.drawImage(sol.fond, x0, y0, w, h, x0, y0, w, h);
    for (var i = 0; i < sol.n; i++) {
      var s = sol.traces[(sol.tete + i) % MAX];
      if (s === r || !s.dans || s.x1 <= x0 || s.x0 >= r.x1 || s.y1 <= y0 || s.y0 >= r.y1) continue;
      if (!coupe) { g.save(); g.beginPath(); g.rect(x0, y0, w, h); g.clip(); coupe = true; }
      peindre(g, s, sol.ratio);
    }
    if (coupe) g.restore();
    for (var k = 0; k < BANDES; k++) {
      var b = sol.bandes[k];
      if (b.y0 + b.h <= y0 || b.y0 >= r.y1) continue;
      if (b.jusqua < 0) { b.t = t; b.x0 = x0; b.x1 = r.x1; } else { b.x0 = Math.min(b.x0, x0); b.x1 = Math.max(b.x1, r.x1); }
      b.jusqua = t + FIN;
    }
  }

  // Avant chaque image (t : temps de la partie) : retire de la cible les traces de plus de GARDE s (au plus RETRAITS
  // par image), puis rapproche de la cible au plus BANDES_PAR_IMAGE bandes de la vue.
  function avancer(sol, t) {
    sol.t = t;
    for (var k = 0; sol.n && k < RETRAITS; k++) {
      var r = sol.traces[sol.tete];
      if (r.dans && t - r.t0 < GARDE) break;
      retirer(sol, r, t);
      sol.tete = (sol.tete + 1) % MAX; sol.n--;
    }
    var faites = 0, gv = sol.gv;
    if (!ESSAI.fondu) return; // ESSAI-TEMPORAIRE
    for (var j = 0; j < BANDES && faites < BANDES_PAR_IMAGE; j++) {
      var b = sol.bandes[sol.prochaine];
      sol.prochaine = (sol.prochaine + 1) % BANDES;
      if (b.jusqua < 0 || !(b.h > 0)) continue;
      var w = b.x1 - b.x0;
      if (t >= b.jusqua) {
        if (w > 0) gv.drawImage(sol.cible, b.x0, b.y0, w, b.h, b.x0, b.y0, w, b.h);
        b.jusqua = -1; b.x0 = sol.W; b.x1 = 0;
      } else {
        var a = 1 - Math.exp(-FONTE * Math.max(0, t - b.t));
        if (a < 0.004) continue; // trop peu de temps depuis la dernière fois : la bande attend
        if (w > 0) { gv.globalAlpha = a; gv.drawImage(sol.cible, b.x0, b.y0, w, b.h, b.x0, b.y0, w, b.h); gv.globalAlpha = 1; }
      }
      b.t = t; faites++;
    }
  }

  // ---------- images de repli (sans les images rendues en 3D) ----------
  // Gardées à la netteté de la toile ; ancrage (axd, ayd) en px de la toile.
  var vues = {}, vuesRatio = 0;
  function memo(ratio) { if (vuesRatio !== ratio) { vues = {}; vuesRatio = ratio; } }
  function hasard(n) { var h = Math.sin(n * 12.9898 + 4.1) * 43758.5453; return h - Math.floor(h); }
  // Cratère de pierre de trébuchet : terre retournée, bord clair, fond sombre, quelques mottes autour (24 × 12 px).
  // variante 1 : sur la route (bord plus pâle).
  function cratere(ratio, variante) {
    memo(ratio);
    var cle = "c" + variante;
    if (vues[cle]) return vues[cle];
    var W = 30, H = 16, c = toile(Math.ceil(W * ratio) + 2, Math.ceil(H * ratio) + 2), g = c.getContext("2d");
    g.setTransform(ratio, 0, 0, ratio, 1, 1); g.translate(W / 2, H / 2);
    g.save(); g.scale(1, 0.5);
    var r = g.createRadialGradient(0, -1, 1, 0, 0, 12);
    r.addColorStop(0, "rgba(28,20,12,.85)"); r.addColorStop(0.55, "rgba(58,42,26,.7)");
    r.addColorStop(0.8, variante ? "rgba(176,152,112,.55)" : "rgba(128,108,70,.55)"); r.addColorStop(1, "rgba(90,70,44,0)");
    g.fillStyle = r; g.beginPath(); g.arc(0, 0, 12, 0, Math.PI * 2); g.fill();
    g.restore();
    g.fillStyle = "rgba(42,30,18,.75)";
    for (var i = 0; i < 9; i++) {
      var an = hasard(i + 40 * variante) * Math.PI * 2, d = 10 + 4 * hasard(i + 13), s = 0.8 + 0.9 * hasard(i + 27);
      g.fillRect(Math.cos(an) * d - s / 2, Math.sin(an) * d * 0.5 - s / 2, s, s * 0.8);
    }
    c.axd = 1 + W / 2 * ratio; c.ayd = 1 + H / 2 * ratio;
    return (vues[cle] = c);
  }
  // Flèche plantée dans le sol, penchée à gauche (sens −1) ou à droite (1) : fût sombre, empennage clair. Ancrage : le
  // point où elle entre dans la terre.
  function flechePlantee(ratio, sens) {
    memo(ratio);
    var cle = "f" + sens;
    if (vues[cle]) return vues[cle];
    var W = 8, H = 9, c = toile(Math.ceil(W * ratio) + 2, Math.ceil(H * ratio) + 2), g = c.getContext("2d");
    g.setTransform(ratio, 0, 0, ratio, 1, 1); g.translate(W / 2, H - 1);
    if (sens < 0) g.scale(-1, 1);
    g.lineCap = "round";
    g.strokeStyle = "rgba(0,0,0,.25)"; g.lineWidth = 0.9; g.beginPath(); g.moveTo(0, 0); g.lineTo(2.6, 0.8); g.stroke(); // ombre
    g.strokeStyle = "#3a2814"; g.lineWidth = 0.75; g.beginPath(); g.moveTo(0, 0); g.lineTo(2.4, -6.2); g.stroke();
    g.strokeStyle = "#e4d6b4"; g.lineWidth = 1.1; g.beginPath(); g.moveTo(2.0, -5.2); g.lineTo(2.6, -6.8); g.stroke();
    g.fillStyle = "rgba(30,20,10,.5)"; g.beginPath(); g.ellipse(0, 0, 0.9, 0.45, 0, 0, Math.PI * 2); g.fill();
    c.axd = 1 + W / 2 * ratio; c.ayd = 1 + (H - 1) * ratio;
    return (vues[cle] = c);
  }

  JEU.batailleSol = { BANDES: BANDES, GARDE: GARDE, FONTE: FONTE, FIN: FIN, MAX: MAX, TACHES: TACHES,
    creer: creer, liberer: liberer, avancer: avancer, poser: poser, reposer: reposer, poserTaches: poserTaches,
    cratere: cratere, flechePlantee: flechePlantee, essai: ESSAI, // ESSAI-TEMPORAIRE
    // traces entières dans la couche, par genre (corps, taches, crateres, fleches)
    compte: function (sol) { return sol ? sol.compte : null; } };
})(typeof window !== "undefined" ? window : globalThis);
