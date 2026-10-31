// Effets du champ de bataille (lot A, 31/10/2026) : étincelles de métal, petits éclats chauds, traînées des traits, mottes
// de terre et éclats de pierre (pool de particules alloué une fois), petits tirages sans Math.random.
// Script classique et facultatif : bataille.js l'appelle s'il est chargé (JEU.batailleEffets) et dessine comme avant sinon.
// On ne fait que dessiner ce que le moteur publie : rien ici ne touche à la partie.
// Plafonds (PLAFONDS) : 8 coups étincelants, 24 traînées, 60 particules, 10 lueurs à la fois. Rien n'est créé à chaque
// image : les particules vivent dans des tableaux fixes, les traînées dans un tampon fixe.
(function (racine) {
  "use strict";
  var JEU = racine.JEU = racine.JEU || {};

  var PLAFONDS = { etincelles: 8, trainees: 24, particules: 60, lueurs: 10 };

  // ---------- tirages fixes ----------
  // Même graine, même nombre (de 0 à 1) : une partie se dessine pareil d'une fois à l'autre, quels que soient les réglages,
  // et le dessin ne tire jamais dans Math.random (le moteur, lui, peut s'en servir sans que le dessin change ses tirages).
  function alea(graine, i) { var h = Math.sin((graine + i * 78.233) * 12.9898 + 4.1) * 43758.5453; return h - Math.floor(h); }
  // Graine d'un effet du moteur, tirée de sa place : la même à chaque image.
  function graineDe(x, y) { return Math.floor(alea(x * 0.731 + y * 1.379, 3) * 9973) + 1; }

  // ---------- pool de particules ----------
  // genre : 0 libre, MOTTE (terre d'une pierre qui tombe), ECLAT (pierre d'un mur), POUSSIERE (petit nuage qui monte).
  // Une particule lancée retombe (gravité) jusqu'à son sol (sol : y du sol sous elle), puis reste posée jusqu'à la fin
  // de sa vie ; elle rétrécit sur le dernier tiers de sa vie (une seule couleur par genre : un seul remplissage).
  var N = PLAFONDS.particules, MOTTE = 1, ECLAT = 2, POUSSIERE = 3, GRAVITE = 520;
  var px = new Float32Array(N), py = new Float32Array(N), pvx = new Float32Array(N), pvy = new Float32Array(N);
  var page = new Float32Array(N), pvie = new Float32Array(N), ptaille = new Float32Array(N), psol = new Float32Array(N);
  var pgenre = new Uint8Array(N), suivante = 0, vivantes = 0;
  var COULEURS = [null, "#3a2a18", "#8a8276", "rgba(196,178,140,.45)"];

  // Lance une particule ; le pool plein, la plus ancienne cède sa place.
  function emettre(genre, x, y, vx, vy, vie, taille, sol) {
    var i = suivante;
    suivante = (suivante + 1) % N;
    if (!pgenre[i]) vivantes++;
    pgenre[i] = genre; px[i] = x; py[i] = y; pvx[i] = vx; pvy[i] = vy; page[i] = 0; pvie[i] = vie; ptaille[i] = taille;
    psol[i] = sol === undefined ? y : sol;
  }
  function avancer(dt) {
    if (!vivantes || !(dt > 0)) return;
    for (var i = 0; i < N; i++) {
      var g = pgenre[i];
      if (!g) continue;
      page[i] += dt;
      if (page[i] >= pvie[i]) { pgenre[i] = 0; vivantes--; continue; }
      if (g === POUSSIERE) { px[i] += pvx[i] * dt; py[i] += pvy[i] * dt; pvx[i] *= 0.9; pvy[i] *= 0.9; continue; }
      if (pvx[i] === 0 && pvy[i] === 0) continue; // posée
      pvy[i] += GRAVITE * dt; px[i] += pvx[i] * dt; py[i] += pvy[i] * dt;
      if (pvy[i] > 0 && py[i] >= psol[i]) { py[i] = psol[i]; pvx[i] = 0; pvy[i] = 0; }
    }
  }
  // Dessine les particules, un remplissage par genre. Rend leur nombre.
  function dessiner(ctx) {
    if (!vivantes) return 0;
    var n = 0;
    for (var g = 1; g <= 3; g++) {
      var ouvert = false;
      for (var i = 0; i < N; i++) {
        if (pgenre[i] !== g) continue;
        if (!ouvert) { ctx.beginPath(); ouvert = true; }
        var k = page[i] / pvie[i], s = ptaille[i] * (k > 0.66 ? (1 - k) / 0.34 : 1);
        if (g === POUSSIERE) { var r = s * (1 + k); ctx.moveTo(px[i] + r, py[i]); ctx.arc(px[i], py[i], r, 0, Math.PI * 2); }
        else ctx.rect(px[i] - s / 2, py[i] - s * 0.4, s, s * 0.8);
        n++;
      }
      if (ouvert) { ctx.fillStyle = COULEURS[g]; ctx.fill(); }
    }
    return n;
  }
  function vider() { for (var i = 0; i < N; i++) pgenre[i] = 0; vivantes = 0; suivante = 0; nTr = 0; nVifs = 0; nPales = 0; }

  // Mottes de terre d'une pierre qui tombe : 6 à 8 mottes brun sombre lancées en cloche, retombées en 0,5 s.
  function mottes(x, y, graine) {
    var n = 6 + Math.floor(alea(graine, 30) * 3);
    for (var i = 0; i < n; i++) {
      var an = alea(graine, 31 + i) * Math.PI * 2, v = 26 + 46 * alea(graine, 41 + i), c = Math.cos(an), s = Math.sin(an);
      emettre(MOTTE, x + c * 4, y + s * 2, c * v, -(90 + 80 * alea(graine, 51 + i)), 0.5 + 0.1 * alea(graine, 71 + i), 1.6 + 1.2 * alea(graine, 61 + i), y + s * 6);
    }
  }

  // ---------- étincelles de métal ----------
  // Un coup d'arme (« coup ») ou deux troupes qui s'engagent (« choc ») : 3 à 5 traits orangés de 2 à 3 px qui s'écartent
  // du point touché en 0,15 s, surtout du côté du coup (dir : 1 vers l'est, −1 vers l'ouest), un peu vers le haut.
  // fixe (Animations coupées) : un éclat court qui ne bouge pas (0,12 s). force : 2 pour le champion (deux fois plus).
  // Les traits d'une image sont rangés dans deux tampons (vifs, puis pâles en fin de course) et tracés d'un coup par
  // dessinerEtincelles : trois coups de plume par image en tout, quel que soit le nombre de coups.
  var DUREE_ETINCELLES = 0.15, TRAITS = PLAFONDS.etincelles * 12;
  var vifs = new Float32Array(TRAITS * 4), pales = new Float32Array(TRAITS * 4), nVifs = 0, nPales = 0;
  function etincelles(x, y, age, graine, dir, fixe, force) {
    var duree = fixe ? 0.12 : DUREE_ETINCELLES;
    if (!(age >= 0 && age < duree)) return false;
    force = force || 1;
    var n = Math.round((3 + Math.floor(alea(graine, 0) * 3)) * force), k = age / duree, sens = dir < 0 ? -1 : 1, vif = k < 0.5;
    var r0 = fixe ? 1.2 : 1.2 + 6 * Math.sqrt(k) * (force > 1 ? 1.3 : 1), t = vif ? vifs : pales;
    for (var i = 0; i < n; i++) {
      var m = vif ? nVifs : nPales;
      if (m >= TRAITS) break;
      var an = (sens < 0 ? Math.PI : 0) + (alea(graine, i + 1) - 0.5) * 2.4 - 0.35 * sens;
      var l = 2 + alea(graine, i + 9), r = r0 * (0.7 + 0.6 * alea(graine, i + 17)), c = Math.cos(an), s = Math.sin(an), j = m * 4;
      t[j] = x + c * r; t[j + 1] = y + s * r; t[j + 2] = x + c * (r + l); t[j + 3] = y + s * (r + l);
      if (vif) nVifs++; else nPales++;
    }
    return true;
  }
  function traits(ctx, t, n) {
    ctx.beginPath();
    for (var i = 0; i < n; i++) { var j = i * 4; ctx.moveTo(t[j], t[j + 1]); ctx.lineTo(t[j + 2], t[j + 3]); }
  }
  function dessinerEtincelles(ctx) {
    if (!nVifs && !nPales) return;
    ctx.lineCap = "round"; ctx.strokeStyle = "#e8912e"; ctx.lineWidth = 1;
    if (nPales) { traits(ctx, pales, nPales); ctx.globalAlpha = 0.55; ctx.stroke(); ctx.globalAlpha = 1; }
    if (nVifs) { traits(ctx, vifs, nVifs); ctx.stroke(); ctx.strokeStyle = "#ffd28a"; ctx.lineWidth = 0.5; ctx.stroke(); } // cœur plus chaud au départ
    ctx.lineCap = "butt";
    nVifs = 0; nPales = 0;
  }

  // ---------- lueur : l'éclat chaud d'un trait qui touche (6 px au plus) ----------
  var imageLueur = null;
  function lueurImage() {
    if (imageLueur) return imageLueur;
    var c = document.createElement("canvas"); c.width = c.height = 24;
    var g = c.getContext("2d");
    g.translate(12, 12);
    var r = g.createRadialGradient(0, 0, 0, 0, 0, 11);
    r.addColorStop(0, "rgba(255,222,160,.9)"); r.addColorStop(0.4, "rgba(240,170,90,.5)"); r.addColorStop(1, "rgba(220,140,60,0)");
    g.fillStyle = r; g.beginPath(); g.arc(0, 0, 11, 0, Math.PI * 2); g.fill();
    return (imageLueur = c);
  }
  function lueur(ctx, x, y, age, duree, taille) {
    if (!(age >= 0 && age < duree)) return false;
    ctx.globalAlpha = 1 - age / duree;
    ctx.drawImage(lueurImage(), x - taille / 2, y - taille / 2, taille, taille);
    ctx.globalAlpha = 1;
    return true;
  }

  // ---------- traînées des traits ----------
  // Chaque flèche ou carreau en vol laisse derrière lui un trait crème très pâle (8 à 10 px) ; toutes les traînées d'une
  // image sont tracées d'un seul coup de plume (dessinerTrainees), au plus PLAFONDS.trainees.
  var tampon = new Float32Array(PLAFONDS.trainees * 4), nTr = 0;
  function trainee(x0, y0, x1, y1) {
    if (nTr >= PLAFONDS.trainees) return false;
    var j = nTr * 4;
    tampon[j] = x0; tampon[j + 1] = y0; tampon[j + 2] = x1; tampon[j + 3] = y1;
    nTr++;
    return true;
  }
  function dessinerTrainees(ctx) {
    var n = nTr;
    if (!n) return 0;
    ctx.beginPath();
    for (var i = 0; i < n; i++) { var j = i * 4; ctx.moveTo(tampon[j], tampon[j + 1]); ctx.lineTo(tampon[j + 2], tampon[j + 3]); }
    ctx.strokeStyle = "rgba(246,232,200,.35)"; ctx.lineWidth = 1; ctx.lineCap = "round"; ctx.stroke(); ctx.lineCap = "butt";
    nTr = 0;
    return n;
  }

  JEU.batailleEffets = { PLAFONDS: PLAFONDS, alea: alea, graineDe: graineDe,
    MOTTE: MOTTE, ECLAT: ECLAT, POUSSIERE: POUSSIERE, emettre: emettre, avancer: avancer, dessiner: dessiner, vider: vider,
    particules: function () { return vivantes; }, mottes: mottes, etincelles: etincelles, dessinerEtincelles: dessinerEtincelles, DUREE_ETINCELLES: DUREE_ETINCELLES,
    lueur: lueur, trainee: trainee, dessinerTrainees: dessinerTrainees };
})(typeof window !== "undefined" ? window : globalThis);
