// Animations : particules (une petite toile par gerbe, par-dessus la page), chiffres qui volent vers les ressources,
// secousses. Les effets qui suivent une réponse durent moins de 400 ms et ne retardent jamais la question
// suivante. L'ambiance continue (fumées, nuages, villageois…) se coupe dans les Réglages.
(function (racine) {
  "use strict";
  var JEU = racine.JEU;
  var boucle = null, dernier = 0;

  // Après la prochaine image : la question suivante est peinte d'abord, la décoration (sceau, gain qui s'envole)
  // une image plus tard (16 à 30 ms, invisible à l'œil), sans alourdir l'image qui montre la question.
  function apresImage(f) {
    if (racine.requestAnimationFrame && racine.setTimeout) racine.requestAnimationFrame(function () { racine.setTimeout(f, 0); });
    else f();
  }

  function actif() {
    var etat = JEU.sauvegarde && JEU.sauvegarde.etat();
    if (etat && etat.reglages && etat.reglages.animations === false) return false;
    try { if (racine.matchMedia && racine.matchMedia("(prefers-reduced-motion: reduce)").matches) return false; } catch (e) { /* rien */ }
    return true;
  }

  // Réglage « Sang dans les combats » (bataille : giclées, flaques, soldats tombés). Actif par défaut : une sauvegarde
  // sans ce réglage (plus ancienne que le 15/10/2026) le garde actif. Seul le rendu de la bataille le lit.
  function sang() {
    var etat = JEU.sauvegarde && JEU.sauvegarde.etat();
    return !(etat && etat.reglages && etat.reglages.sang === false);
  }

  // Chaque gerbe de particules a sa petite toile, posée autour de son point de départ (et non une toile sur toute la
  // fenêtre) : sur un PC sans carte graphique, la page ne recompose à chaque image que ce petit carré, et la question
  // suivante n'attend pas. Les particules qui sortent du carré (elles s'effacent déjà) sont coupées. ETENDUE : marges
  // autour du point de départ (gauche, droite, haut, bas, en px) ; null : toute la fenêtre (feuilles de la victoire).
  var ETENDUE = { or: [230, 230, 190, 280], poussiere: [90, 90, 120, 60], pieces: [150, 150, 170, 150], feuilles: null };
  var gerbes = []; // { toile, ctx, particules, zone : rectangle dessiné à l'image d'avant }

  function nouvelleGerbe(x, y, genre) {
    var e = ETENDUE.hasOwnProperty(genre) ? ETENDUE[genre] : ETENDUE.or, r = racine.devicePixelRatio || 1;
    var x0 = e ? Math.floor(x - e[0]) : 0, y0 = e ? Math.floor(y - e[2]) : 0;
    var w = e ? e[0] + e[1] : racine.innerWidth, h = e ? e[2] + e[3] : racine.innerHeight;
    var toile = document.createElement("canvas");
    toile.className = "particules";
    toile.width = Math.ceil(w * r); toile.height = Math.ceil(h * r);
    toile.style.left = x0 + "px"; toile.style.top = y0 + "px"; toile.style.width = w + "px"; toile.style.height = h + "px";
    document.body.appendChild(toile);
    var ctx = toile.getContext("2d");
    ctx.setTransform(r, 0, 0, r, -x0 * r, -y0 * r); // on dessine en coordonnées de la fenêtre
    var g = { toile: toile, ctx: ctx, particules: [], zone: null };
    gerbes.push(g);
    return g;
  }

  // Images des réponses, demandées au lancement (règle du projet : rien n'est lu sur le disque pendant une question) et
  // décodées d'avance : le sceau qui frappe une bonne réponse, la pièce d'or de la gerbe « pieces », les deux tampons
  // (ui.tampon les pose en fond, par la feuille de style). Image absente : repli dessiné.
  var IMAGES = { sceau: "assets/images/expedition/sceau-reussie.png", piece: "assets/images/reponses/piece-or.png",
    cire: "assets/images/reponses/tampon-cire.png", plomb: "assets/images/reponses/tampon-plomb.png", or: "assets/images/reponses/sceau-or.png" };
  var images = {};
  if (typeof Image !== "undefined") Object.keys(IMAGES).forEach(function (k) {
    var im = new Image();
    im.src = IMAGES[k];
    images[k] = im;
    if (im.decode) im.decode().catch(function () { /* image absente : repli dessiné */ });
  });
  function maintenant() { return (racine.performance || Date).now(); }

  // genre : "or" (étincelles), "pieces" (pièces d'or qui jaillissent et tournent), "poussiere", "feuilles" (victoire)
  function eclat(x, y, genre, nombre) {
    if (!actif()) return;
    var g = nouvelleGerbe(x, y, genre);
    nombre = nombre || 18;
    for (var i = 0; i < nombre; i++) {
      var a = Math.random() * Math.PI * 2, v = 60 + Math.random() * 220;
      var p = { x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 120, vie: 0, duree: 0.5 + Math.random() * 0.5, taille: 2 + Math.random() * 4, genre: genre || "or", rot: Math.random() * 6, vr: (Math.random() - 0.5) * 10 };
      if (genre === "feuilles") { p.vy = -200 - Math.random() * 200; p.vx = (Math.random() - 0.5) * 500; p.duree = 1.2 + Math.random() * 0.8; p.taille = 5 + Math.random() * 6; }
      if (genre === "poussiere") { p.vx *= 0.3; p.vy = -20 - Math.random() * 30; p.taille = 4 + Math.random() * 6; p.duree = 0.6; }
      if (genre === "pieces") { p.vx = Math.cos(a) * (50 + Math.random() * 90); p.vy = -250 - Math.random() * 150; p.duree = 0.7 + Math.random() * 0.25; p.taille = 9 + Math.random() * 3; p.vr = 9 + Math.random() * 9; }
      if (genre === "feuilles") { p.forme = i % 3; p.balance = Math.random() * 6.28; }
      g.particules.push(p);
    }
    demarrer();
  }

  function demarrer() { if (!boucle) { dernier = 0; boucle = racine.requestAnimationFrame(pas); } }

  // feuilles d'automne : ors, roux, vert passé, brique (plus les teintes vives des matières : c'étaient des confettis)
  var COULEURS = { or: ["#f6dc8e", "#e2c272", "#b08d3a", "#fff3c8"], feuilles: ["#b5772b", "#c99a3a", "#8a5a22", "#6f7a34", "#9a3a22", "#d4b04e"] };

  // Une feuille dessinée en courbes (quadraticCurveTo), longue de 2 × t : trois formes (lancéolée, ronde, de chêne
  // simplifiée), une nervure plus sombre. Elle tourne sur elle-même (rotation) et bascule (écrasée en x).
  function feuille(ctx, t, forme, couleur) {
    var l = t, w = forme === 1 ? t * 0.75 : t * 0.5;
    ctx.fillStyle = couleur;
    ctx.beginPath();
    ctx.moveTo(0, -l);
    if (forme === 2) {
      ctx.quadraticCurveTo(w * 1.3, -l * 0.6, w * 0.6, -l * 0.2);
      ctx.quadraticCurveTo(w * 1.4, l * 0.1, w * 0.5, l * 0.6);
      ctx.quadraticCurveTo(w * 0.3, l * 0.9, 0, l);
      ctx.quadraticCurveTo(-w * 0.3, l * 0.9, -w * 0.5, l * 0.6);
      ctx.quadraticCurveTo(-w * 1.4, l * 0.1, -w * 0.6, -l * 0.2);
      ctx.quadraticCurveTo(-w * 1.3, -l * 0.6, 0, -l);
    } else {
      ctx.quadraticCurveTo(w * 1.6, -l * 0.1, 0, l);
      ctx.quadraticCurveTo(-w * 1.6, -l * 0.1, 0, -l);
    }
    ctx.fill();
    ctx.strokeStyle = "rgba(60,30,10,.45)";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, -l * 0.8); ctx.lineTo(0, l * 1.25); ctx.stroke(); // nervure et queue
  }

  // Seule la zone où étaient les particules à l'image d'avant est effacée (et non toute la toile).
  function pas(t) {
    var dt = dernier ? Math.min(0.05, (t - dernier) / 1000) : 0.016;
    dernier = t;
    gerbes = gerbes.filter(function (g) {
      var ctx = g.ctx;
      if (g.zone) ctx.clearRect(g.zone.x0, g.zone.y0, g.zone.x1 - g.zone.x0, g.zone.y1 - g.zone.y0);
      g.particules = g.particules.filter(function (p) { return p.vie < p.duree; });
      if (!g.particules.length) { g.toile.remove(); return false; }
      var z = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };
      g.particules.forEach(function (p) {
        p.vie += dt;
        var gr = p.genre === "feuilles" ? 380 : p.genre === "poussiere" ? -10 : p.genre === "pieces" ? 820 : 520;
        p.vy += gr * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
        if (p.genre === "feuilles") { p.vx *= 0.985; p.vy = Math.min(p.vy, 150); p.balance += dt * 5; } // elles planent
        var alpha = Math.max(0, 1 - p.vie / p.duree);
        if (p.genre === "pieces") alpha = Math.min(1, alpha / 0.4); // une pièce ne pâlit qu'à la fin de sa chute
        var m = p.taille * (p.genre === "poussiere" ? 1 + p.vie * 2 : 2) + 4; // demi-taille dessinée, avec une marge
        z.x0 = Math.min(z.x0, p.x - m); z.y0 = Math.min(z.y0, p.y - m); z.x1 = Math.max(z.x1, p.x + m); z.y1 = Math.max(z.y1, p.y + m);
        ctx.save(); ctx.globalAlpha = alpha; ctx.translate(p.x, p.y);
        if (p.genre !== "pieces") ctx.rotate(p.rot);
        if (p.genre === "poussiere") {
          ctx.fillStyle = "rgba(200,180,140,.6)"; ctx.beginPath(); ctx.arc(0, 0, p.taille * (1 + p.vie * 2), 0, Math.PI * 2); ctx.fill();
        } else if (p.genre === "feuilles") {
          ctx.scale(0.35 + 0.65 * Math.abs(Math.cos(p.balance)), 1); // la feuille bascule en tombant
          feuille(ctx, p.taille, p.forme, COULEURS.feuilles[Math.floor(p.taille * 7) % COULEURS.feuilles.length]);
        } else if (p.genre === "pieces") {
          // la pièce tourne sur elle-même : son image est écrasée en x (|cos|), jamais tout à fait de profil
          var im = images.piece, t = p.taille;
          ctx.scale(Math.max(0.14, Math.abs(Math.cos(p.rot))), 1);
          if (im && im.complete && im.naturalWidth) ctx.drawImage(im, -t, -t, 2 * t, 2 * t);
          else { ctx.fillStyle = "#d4ac4a"; ctx.beginPath(); ctx.arc(0, 0, t, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = "#7a5c1e"; ctx.stroke(); }
        } else {
          ctx.fillStyle = COULEURS.or[Math.floor(p.taille * 3) % COULEURS.or.length];
          ctx.beginPath(); ctx.moveTo(0, -p.taille); ctx.lineTo(p.taille * 0.6, 0); ctx.lineTo(0, p.taille); ctx.lineTo(-p.taille * 0.6, 0); ctx.fill();
        }
        ctx.restore();
      });
      g.zone = { x0: Math.floor(z.x0), y0: Math.floor(z.y0), x1: Math.ceil(z.x1), y1: Math.ceil(z.y1) };
      return true;
    });
    boucle = gerbes.length ? racine.requestAnimationFrame(pas) : null;
  }

  function centre(el) {
    var r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  // Bonne réponse hors bataille : un sceau de cire (sceau-reussie.png, 64 px) frappe la réponse choisie, des pièces d'or
  // en jaillissent, et le gain qui suit (questions.js → gain) part de ce point. r : rectangle de la réponse, relevé par
  // poserQuestion avant de passer à la suivante. Tout est posé une image plus tard (apresImage) : la question suivante
  // est peinte d'abord, dessous. En bataille, le sceau de bataille.js (« Juste ») suffit : poserQuestion n'appelle pas.
  var depart = null; // { x, y, t } : point de départ du prochain gain (le sceau), valable 400 ms
  function frapper(r) {
    if (!r || !actif()) return;
    // dans la marge, juste à droite de la réponse choisie, quand il y a la place (intégration du lot B) : la question
    // suivante arrive au même endroit, et un sceau posé sur une de ses réponses se lirait comme un indice
    var x = racine.innerWidth - (r.left + r.width) >= 80 ? r.left + r.width + 40 : r.width > 200 ? r.left + r.width - 46 : r.left + r.width / 2, y = r.top + r.height / 2;
    depart = { x: x, y: y, t: maintenant() };
    apresImage(function () {
      var s = document.createElement("div");
      s.className = "sceau-reponse";
      s.setAttribute("aria-hidden", "true");
      s.style.left = x + "px"; s.style.top = y + "px";
      document.body.appendChild(s);
      setTimeout(function () { s.remove(); }, 760);
      setTimeout(function () { eclat(x, y - 4, "pieces", 6); }, 120); // au moment où la cire touche
    });
  }
  // Le point de départ du gain : celui du sceau s'il vient d'être frappé (pris une seule fois), sinon null.
  function prendreDepart() {
    var d = depart && maintenant() - depart.t < 400 ? depart : null;
    depart = null;
    return d;
  }

  // « +2 » qui s'envole d'un point vers le médaillon de la ressource, puis le compteur rebondit. Après une bonne réponse
  // frappée d'un sceau, il part du sceau, un peu après la frappe, avec six éclats d'or.
  function gain(ressource, n, depuis) {
    var cible = document.querySelector("#ressources .ressource[data-res='" + ressource + "']");
    var sceau = prendreDepart();
    if (!cible) return;
    if (!actif()) return;
    // points de départ et d'arrivée relevés tout de suite (la question qui part est encore là)
    var a = sceau ? { x: sceau.x, y: sceau.y } : depuis ? centre(depuis) : { x: racine.innerWidth / 2, y: racine.innerHeight / 2 };
    var b = centre(cible);
    apresImage(function () { setTimeout(envoyer, sceau ? 170 : 0); });
    function envoyer() {
      if (sceau) eclat(a.x, a.y, "or", 6);
      var e = document.createElement("div");
      e.className = "gain-volant";
      e.innerHTML = "<span class='medaillon' style='--teinte:" + JEU.MATIERES[JEU.RESSOURCES[ressource].matiere].couleur + "'>" + JEU.icones.ressource(ressource, 18) + "</span>+" + n;
      e.style.left = a.x + "px"; e.style.top = a.y + "px";
      document.body.appendChild(e);
      e.getBoundingClientRect();
      e.style.transform = "translate(" + (b.x - a.x) + "px," + (b.y - a.y) + "px) scale(.6)";
      e.style.opacity = "0.2";
      setTimeout(function () {
        e.remove();
        cible.classList.remove("rebond"); void cible.offsetWidth; cible.classList.add("rebond");
        eclat(b.x, b.y, "or", 8);
      }, 380);
    }
  }
  // Le prochain gain part de ce point (le conseil : le sceau « Sage décision », posé à côté de la carte).
  function noterDepart(x, y) { depart = { x: x, y: y, t: maintenant() }; }

  // Bilan d'un événement ou d'un conseil : le score (premier nombre de la ligne .grand) compte de 0 à sa valeur en
  // 400 ms ; tout juste : un sceau d'or au lys (sceau-or.png) frappe le coin du bilan. Une image plus tard. Sans
  // animations : le score est posé tel quel, le sceau aussi, sans frappe (feuille de style).
  function bilan(el, parfait) {
    if (!el) return;
    if (parfait) {
      var s = document.createElement("span");
      s.className = "sceau-or";
      s.setAttribute("aria-hidden", "true");
      el.appendChild(s);
    }
    var g = el.querySelector(".grand"), m = g && /^(\d+)/.exec(g.textContent);
    if (!m || !actif() || !racine.requestAnimationFrame) return;
    var n = +m[1], reste = g.textContent.slice(m[1].length), t0 = null;
    if (n < 1) return;
    g.textContent = "0" + reste;
    apresImage(function () {
      racine.requestAnimationFrame(function pas(t) {
        if (t0 === null) t0 = t;
        var k = Math.min(1, (t - t0) / 400);
        g.textContent = Math.round(n * k) + reste;
        if (k < 1 && g.isConnected) racine.requestAnimationFrame(pas);
      });
    });
  }

  function secouer(el) {
    if (!el || !actif()) return;
    el.classList.remove("secousse"); void el.offsetWidth; el.classList.add("secousse");
  }

  // Chiffre de dégâts qui monte au-dessus d'un point d'un SVG.
  function degats(conteneur, texte, x, y, puissant) {
    if (!actif() || !conteneur) return;
    var d = document.createElement("div");
    d.className = "degats" + (puissant ? " puissant" : "");
    d.textContent = texte;
    d.style.left = x + "%"; d.style.top = y + "%";
    conteneur.appendChild(d);
    setTimeout(function () { d.remove(); }, 900);
  }

  JEU.anim = { actif: actif, sang: sang, eclat: eclat, gain: gain, secouer: secouer, degats: degats, centre: centre, apresImage: apresImage,
    frapper: frapper, noterDepart: noterDepart, bilan: bilan, images: images };
  // Ambiance continue (nuages, fumées, oiseaux, drapeaux, brume) : pour l'instant, la même chose que actif().
  // Cale posée par le lot A ; le lot C la remplit (réglage Ambiance, régulateur).
  JEU.anim.ambiance = function () { return JEU.anim.actif(); };
})(typeof window !== "undefined" ? window : globalThis);
