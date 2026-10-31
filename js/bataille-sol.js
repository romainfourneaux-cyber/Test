// Couche de sol du champ de bataille (lot A, 31/10/2026). Les traces qui restent un moment par terre (corps couchés et
// leurs flaques, taches de sang retombées, cratères, flèches plantées) sont posées une seule fois dans une toile hors
// écran de la taille du fond (la « vue »), dessinée à la place du fond : une image du combat ne les redessine plus.
// Script classique et facultatif : bataille.js l'appelle s'il est chargé (JEU.batailleSol) et dessine comme avant sinon.
//
// Vitesse (toile logicielle du PC sans carte graphique, tablette) : la vue est dessinée au début de l'image, et elle
// n'est touchée qu'ensuite (avancer, puis les traces posées pendant l'image) : une toile modifiée puis dessinée dans la
// même image coûte une copie entière ; dessinée puis modifiée, presque rien (mesuré au ralenti 4 ×). Une trace posée
// pendant une image apparaît donc dans la vue à l'image suivante : l'appelant la dessine lui-même une fois (le corps
// couché, les taches).
//
// Effacement. Une seconde toile (la « cible ») porte le fond et les traces de moins de GARDE secondes. Quand une trace
// a GARDE secondes, on la retire de la cible : on y recopie le fond sur son rectangle, puis on y repose les traces plus
// jeunes qui le touchent. Ensuite, le rectangle de la trace, dans la vue, rejoint la cible par petits pas (au plus
// FONDUS_PAR_IMAGE rectangles par image, opacité réglée sur le temps écoulé) : il reste e^(−FONTE × t) de la trace
// t secondes après sa garde. Une trace plus jeune qui touche ce rectangle n'en souffre pas : elle est aussi dans la cible.
// Avec GARDE = 5 s et FONTE = 1,2 : la trace est entière 5 s, encore bien visible à 6 s (30 %), presque effacée à 8 s
// (3 %) ; on la laisse à 1,5 % au bout de FIN s (invisible).
// Le temps est celui de la partie (la vitesse ×2 ou ×3 efface plus vite, comme elle fait vieillir les corps).
// La couche est refaite depuis le fond quand la netteté de la toile change, et à chaque bataille (les traces sont perdues).
// Positions des images en px de la toile (entiers : copies pixel pour pixel) ; taches en px logiques (× ratio).
(function (racine) {
  "use strict";
  var JEU = racine.JEU = racine.JEU || {};
  var GARDE = 5, FONTE = 1.2, FIN = 3.5, MAX = 384, RETRAITS = 8, FONDUS_PAR_IMAGE = 8, TACHES = 24, CASE = 36, FENETRE = 0.6;
  var LIBRE = 0, ATTENTE = 1, ENTIERE = 2, FONDUE = 3;
  var GENRES = ["corps", "taches", "crateres", "fleches"];

  function toile(w, h) { var c = document.createElement("canvas"); c.width = w; c.height = h; return c; }
  function nouvelle() {
    return { etat: LIBRE, genre: "corps", t0: 0, tf: 0, x0: 0, y0: 0, x1: 0, y1: 0, img1: null, ix1: 0, iy1: 0, img2: null, ix2: 0, iy2: 0,
      taches: new Float32Array(TACHES * 4), nt: 0, couleur: "", cle: -1 };
  }

  // Une couche neuve, copiée du fond (toile du terrain à la netteté de la toile du combat).
  function creer(fond, ratio) {
    var W = fond.width, H = fond.height, vue = toile(W, H), cible = toile(W, H);
    var gv = vue.getContext("2d", { alpha: false }), gc = cible.getContext("2d", { alpha: false });
    gv.drawImage(fond, 0, 0); gc.drawImage(fond, 0, 0);
    var traces = [], i;
    for (i = 0; i < MAX; i++) traces.push(nouvelle());
    var compte = {};
    GENRES.forEach(function (g) { compte[g] = 0; });
    return { fond: fond, vue: vue, cible: cible, gv: gv, gc: gc, W: W, H: H, ratio: ratio, traces: traces, tete: 0, n: 0, nF: 0, curseur: 0,
      cases: {}, fenetre: -1, compte: compte, poses: 0, t: 0 };
  }
  // Rend la mémoire des deux toiles (fin de bataille).
  function liberer(sol) {
    if (!sol) return;
    sol.vue.width = sol.vue.height = 0; sol.cible.width = sol.cible.height = 0;
    sol.traces.length = 0; sol.n = sol.nF = 0; sol.fond = null;
  }

  function peindre(g, r, ratio) {
    if (r.img1) g.drawImage(r.img1, r.ix1, r.iy1);
    if (r.img2) g.drawImage(r.img2, r.ix2, r.iy2);
    if (r.nt) {
      g.setTransform(ratio, 0, 0, ratio, 0, 0);
      g.fillStyle = r.couleur; g.beginPath();
      for (var k = 0; k < r.nt; k++) {
        var j = k * 4, x = r.taches[j], y = r.taches[j + 1], rx = r.taches[j + 2], ry = r.taches[j + 3];
        if (rx < 0.7) g.rect(x - rx, y - ry, 2 * rx, 2 * ry); else { g.moveTo(x + rx, y); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); }
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

  // Une place libre dans l'anneau des traces (dans l'ordre de pose). L'anneau plein (jamais en pratique : avancer() en
  // garde de la marge), la trace est perdue (null).
  function place(sol, t) {
    if (sol.n >= MAX) return null;
    var r = sol.traces[(sol.tete + sol.n) % MAX];
    sol.n++;
    r.etat = ATTENTE; r.t0 = t; r.tf = t; r.img1 = r.img2 = null; r.nt = 0; r.cle = -1;
    r.x0 = Infinity; r.y0 = Infinity; r.x1 = -Infinity; r.y1 = -Infinity;
    return r;
  }

  // Pose une trace faite d'une ou deux images (img1 sous img2 : la flaque, puis le corps), peinte tout de suite dans les
  // deux toiles. Rend la trace (reposer) ou null.
  function poser(sol, genre, t, img1, x1, y1, img2, x2, y2) {
    var r = place(sol, t);
    if (!r) return null;
    r.genre = genre; r.img1 = img1 || null; r.ix1 = x1; r.iy1 = y1; r.img2 = img2 || null; r.ix2 = x2; r.iy2 = y2;
    boiteImage(r, r.img1, x1, y1); boiteImage(r, r.img2, x2, y2); borner(sol, r);
    peindre(sol.gv, r, sol.ratio); peindre(sol.gc, r, sol.ratio); r.etat = ENTIERE;
    sol.compte[genre]++; sol.poses++;
    return r;
  }
  // La flaque d'un corps déjà posé grandit : la nouvelle flaque, puis le corps par-dessus, dans les deux toiles.
  function reposer(sol, r, t0, img1, x1, y1) {
    if (!r || r.t0 !== t0 || r.etat !== ENTIERE) return;
    r.img1 = img1; r.ix1 = x1; r.iy1 = y1;
    boiteImage(r, img1, x1, y1); borner(sol, r);
    for (var k = 0; k < 2; k++) { var g = k ? sol.gc : sol.gv; g.drawImage(img1, x1, y1); if (r.img2) g.drawImage(r.img2, r.ix2, r.iy2); }
  }
  // Pose des taches de sang retombées (px logiques : x, y, rx, ry à la suite dans « liste »). Les taches tombées dans la
  // même case de CASE px pendant la même fenêtre de FENETRE s partagent une trace (moins de traces à effacer).
  function poserTaches(sol, t, liste, n, couleur) {
    if (!(n > 0)) return null;
    var q = sol.ratio, fen = Math.floor(t / FENETRE);
    if (fen !== sol.fenetre) { sol.cases = {}; sol.fenetre = fen; }
    var cle = Math.floor(liste[0] / CASE) + 100 * Math.floor(liste[1] / CASE), r = sol.cases[cle];
    if (!r || r.etat !== ENTIERE || r.cle !== cle || r.t0 < t - FENETRE || r.nt + n > TACHES) {
      r = place(sol, t);
      if (!r) return null;
      r.genre = "taches"; r.couleur = couleur; r.cle = cle; r.etat = ENTIERE;
      sol.cases[cle] = r; sol.compte.taches++; sol.poses++;
    }
    n = Math.min(n, TACHES - r.nt);
    var g0 = r.nt, k;
    for (k = 0; k < n; k++) {
      var j = k * 4, x = liste[j], y = liste[j + 1], rx = liste[j + 2], ry = liste[j + 3], d = (r.nt + k) * 4;
      r.taches[d] = x; r.taches[d + 1] = y; r.taches[d + 2] = rx; r.taches[d + 3] = ry;
      r.x0 = Math.min(r.x0, (x - rx) * q); r.y0 = Math.min(r.y0, (y - ry) * q); r.x1 = Math.max(r.x1, (x + rx) * q); r.y1 = Math.max(r.y1, (y + ry) * q);
    }
    r.nt += n;
    borner(sol, r);
    // les nouvelles taches seulement, dans les deux toiles
    for (var c = 0; c < 2; c++) {
      var g = c ? sol.gc : sol.gv;
      g.setTransform(q, 0, 0, q, 0, 0); g.fillStyle = couleur; g.beginPath();
      for (k = g0; k < r.nt; k++) {
        var i4 = k * 4, tx = r.taches[i4], ty = r.taches[i4 + 1], trx = r.taches[i4 + 2], tr = r.taches[i4 + 3];
        if (trx < 0.7) g.rect(tx - trx, ty - tr, 2 * trx, 2 * tr); else { g.moveTo(tx + trx, ty); g.ellipse(tx, ty, trx, tr, 0, 0, Math.PI * 2); }
      }
      g.fill(); g.setTransform(1, 0, 0, 1, 0, 0);
    }
    return r;
  }

  // Retire une trace de la cible : le fond recopié sur son rectangle, les traces plus jeunes qui le touchent reposées
  // (coupées au rectangle). Elle commence à s'effacer de la vue.
  function retirer(sol, r, t) {
    r.etat = FONDUE; r.tf = t; sol.compte[r.genre]--;
    var x0 = r.x0, y0 = r.y0, w = r.x1 - r.x0, h = r.y1 - r.y0, g = sol.gc, coupe = false;
    if (!(w > 0 && h > 0)) return;
    g.drawImage(sol.fond, x0, y0, w, h, x0, y0, w, h);
    for (var i = sol.nF; i < sol.n; i++) {
      var s = sol.traces[(sol.tete + i) % MAX];
      if (s === r || s.etat !== ENTIERE || s.x1 <= x0 || s.x0 >= r.x1 || s.y1 <= y0 || s.y0 >= r.y1) continue;
      if (!coupe) { g.save(); g.beginPath(); g.rect(x0, y0, w, h); g.clip(); coupe = true; }
      peindre(g, s, sol.ratio);
    }
    if (coupe) g.restore();
  }

  // À chaque image, juste après que la vue a été dessinée (t : temps de la partie) : rapproche de la cible au plus
  // FONDUS_PAR_IMAGE rectangles de traces retirées, puis retire de la cible celles de plus de GARDE s (au plus RETRAITS
  // par image, plus si l'anneau se remplit). Dans cet ordre : la cible sert avant d'être modifiée.
  function avancer(sol, t) {
    sol.t = t;
    var r, k, presse = sol.n > MAX - 48; // l'anneau se remplit : on retire et on libère plus tôt
    var gv = sol.gv, faits = 0;
    for (k = 0; k < sol.nF && faits < FONDUS_PAR_IMAGE; k++) {
      sol.curseur = (sol.curseur + 1) % sol.nF;
      r = sol.traces[(sol.tete + sol.curseur) % MAX];
      if (r.etat !== FONDUE) continue;
      if (t - r.t0 >= GARDE + FIN || (presse && sol.curseur < 8)) { r.etat = LIBRE; r.img1 = r.img2 = null; continue; } // il en reste moins de 2 %
      var a = 1 - Math.exp(-FONTE * Math.max(0, t - r.tf));
      if (a < 0.05) continue;
      var w = r.x1 - r.x0, h = r.y1 - r.y0;
      if (w > 0 && h > 0) { gv.globalAlpha = a; gv.drawImage(sol.cible, r.x0, r.y0, w, h, r.x0, r.y0, w, h); }
      r.tf = t; faits++;
    }
    gv.globalAlpha = 1;
    while (sol.n && sol.traces[sol.tete].etat === LIBRE) { sol.tete = (sol.tete + 1) % MAX; sol.n--; sol.nF--; }
    for (k = 0; sol.nF < sol.n && (k < RETRAITS || presse); k++) {
      r = sol.traces[(sol.tete + sol.nF) % MAX];
      if (r.etat !== ENTIERE || (t - r.t0 < GARDE && !(presse && k < 4))) break;
      retirer(sol, r, t);
      sol.nF++;
    }
  }

  // ---------- images de repli (sans les images rendues en 3D) ----------
  // Gardées à la netteté de la toile ; ancrage (axd, ayd) en px de la toile.
  var vues = {}, vuesRatio = 0;
  function memo(ratio) { if (vuesRatio !== ratio) { vues = {}; vuesRatio = ratio; } }
  function hasard(n) { var h = Math.sin(n * 12.9898 + 4.1) * 43758.5453; return h - Math.floor(h); }
  // Cratère de pierre de trébuchet : terre retournée, bord clair, fond sombre, quelques mottes autour (30 × 16 px).
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

  JEU.batailleSol = { GARDE: GARDE, FONTE: FONTE, FIN: FIN, MAX: MAX, TACHES: TACHES,
    creer: creer, liberer: liberer, avancer: avancer, poser: poser, reposer: reposer, poserTaches: poserTaches,
    cratere: cratere, flechePlantee: flechePlantee,
    // traces entières dans la couche, par genre (corps, taches, crateres, fleches)
    compte: function (sol) { return sol ? sol.compte : null; } };
})(typeof window !== "undefined" ? window : globalThis);
