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
  var ETENDUE = { or: [230, 230, 190, 280], poussiere: [90, 90, 120, 60], feuilles: null };
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

  // genre : "or" (pièces et étincelles), "poussiere", "feuilles" (victoire), "fumee"
  function eclat(x, y, genre, nombre) {
    if (!actif()) return;
    var g = nouvelleGerbe(x, y, genre);
    nombre = nombre || 18;
    for (var i = 0; i < nombre; i++) {
      var a = Math.random() * Math.PI * 2, v = 60 + Math.random() * 220;
      var p = { x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 120, vie: 0, duree: 0.5 + Math.random() * 0.5, taille: 2 + Math.random() * 4, genre: genre || "or", rot: Math.random() * 6, vr: (Math.random() - 0.5) * 10 };
      if (genre === "feuilles") { p.vy = -200 - Math.random() * 200; p.vx = (Math.random() - 0.5) * 500; p.duree = 1.2 + Math.random() * 0.8; p.taille = 5 + Math.random() * 6; }
      if (genre === "poussiere") { p.vx *= 0.3; p.vy = -20 - Math.random() * 30; p.taille = 4 + Math.random() * 6; p.duree = 0.6; }
      g.particules.push(p);
    }
    demarrer();
  }

  function demarrer() { if (!boucle) { dernier = 0; boucle = racine.requestAnimationFrame(pas); } }

  var COULEURS = { or: ["#f6dc8e", "#e2c272", "#b08d3a", "#fff3c8"], feuilles: ["#b08d3a", "#6b2d5c", "#2f5a8a", "#4f6b32", "#9a2f22", "#e2c272"] };

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
        var gr = p.genre === "feuilles" ? 380 : p.genre === "poussiere" ? -10 : 520;
        p.vy += gr * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
        if (p.genre === "feuilles") p.vx *= 0.985;
        var alpha = Math.max(0, 1 - p.vie / p.duree);
        var m = p.taille * (p.genre === "poussiere" ? 1 + p.vie * 2 : 2) + 4; // demi-taille dessinée, avec une marge
        z.x0 = Math.min(z.x0, p.x - m); z.y0 = Math.min(z.y0, p.y - m); z.x1 = Math.max(z.x1, p.x + m); z.y1 = Math.max(z.y1, p.y + m);
        ctx.save(); ctx.globalAlpha = alpha; ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        if (p.genre === "poussiere") {
          ctx.fillStyle = "rgba(200,180,140,.6)"; ctx.beginPath(); ctx.arc(0, 0, p.taille * (1 + p.vie * 2), 0, Math.PI * 2); ctx.fill();
        } else if (p.genre === "feuilles") {
          ctx.fillStyle = COULEURS.feuilles[Math.floor(p.taille * 7) % COULEURS.feuilles.length];
          ctx.fillRect(-p.taille / 2, -p.taille, p.taille, p.taille * 2);
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

  // « +2 » qui s'envole d'un point vers le médaillon de la ressource, puis le compteur rebondit.
  function gain(ressource, n, depuis) {
    var cible = document.querySelector("#ressources .ressource[data-res='" + ressource + "']");
    if (!cible) return;
    if (!actif()) return;
    // points de départ et d'arrivée relevés tout de suite (la question qui part est encore là)
    var a = depuis ? centre(depuis) : { x: racine.innerWidth / 2, y: racine.innerHeight / 2 };
    var b = centre(cible);
    apresImage(function () {
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

  JEU.anim = { actif: actif, sang: sang, eclat: eclat, gain: gain, secouer: secouer, degats: degats, centre: centre, apresImage: apresImage };
})(typeof window !== "undefined" ? window : globalThis);
