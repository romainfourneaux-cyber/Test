// Musique d'ambiance composée pour ce jeu (CC0) et jouée par le navigateur (Web Audio), sans fichier :
// bourdon de vielle, mélodie de flûte en mode de ré, luth et tambour. Deux humeurs : « paix » et « guerre ».
// Elle démarre au premier clic ou à la première touche (les navigateurs l'exigent) et se coupe d'un clic.
(function (racine) {
  "use strict";
  var JEU = racine.JEU;
  var ctx = null, maitre = null, bourdon = null, minuterie = null;
  var humeur = "paix", prochaine = 0, pas = 0, iPhrase = 0, iNote = 0, resteNote = 0;
  var VOLUME = 0.16;

  // Phrases en croches : [note MIDI, durée en croches] ; 0 = silence. Mode de ré (dorien), mesure à 6/8.
  var PHRASES = {
    paix: [
      [[62, 2], [65, 1], [67, 2], [69, 1], [72, 2], [71, 1], [69, 3], [67, 2], [65, 1], [64, 2], [62, 1], [64, 3], [62, 3]],
      [[69, 2], [72, 1], [74, 2], [72, 1], [71, 2], [69, 1], [67, 3], [69, 2], [67, 1], [65, 2], [64, 1], [62, 6]],
      [[62, 1], [64, 1], [65, 1], [67, 2], [65, 1], [64, 2], [62, 1], [60, 3], [62, 2], [65, 1], [69, 3], [67, 2], [64, 1], [62, 3]],
      [[74, 3], [72, 2], [71, 1], [69, 3], [67, 3], [65, 2], [67, 1], [69, 2], [65, 1], [64, 3], [62, 3]]
    ],
    guerre: [
      [[62, 1], [62, 1], [69, 1], [67, 1], [65, 1], [64, 1], [62, 2], [0, 1], [62, 1], [65, 1], [67, 1], [69, 2], [72, 1], [69, 3]],
      [[69, 1], [69, 1], [72, 1], [71, 1], [69, 1], [67, 1], [65, 2], [67, 1], [64, 1], [62, 2], [0, 1], [62, 3]],
      [[74, 1], [72, 1], [71, 1], [69, 1], [67, 1], [65, 1], [67, 2], [69, 1], [62, 3], [65, 1], [64, 1], [62, 1], [60, 1], [62, 2]]
    ]
  };
  var TEMPO = { paix: 0.26, guerre: 0.19 }; // durée d'une croche en secondes

  function hz(m) { return 440 * Math.pow(2, (m - 69) / 12); }
  function actif() { var e = JEU.sauvegarde && JEU.sauvegarde.etat(); return !!(e && e.reglages.musique !== false); }

  function creer() {
    var AC = racine.AudioContext || racine.webkitAudioContext;
    if (!AC) return false;
    try { ctx = new AC(); } catch (e) { ctx = null; return false; }
    maitre = ctx.createGain();
    maitre.gain.value = 0;
    // un peu d'écho de grande salle
    var echo = ctx.createDelay(); echo.delayTime.value = 0.23;
    var retour = ctx.createGain(); retour.gain.value = 0.25;
    var adoucir = ctx.createBiquadFilter(); adoucir.type = "lowpass"; adoucir.frequency.value = 2200;
    maitre.connect(ctx.destination);
    maitre.connect(echo); echo.connect(adoucir); adoucir.connect(retour); retour.connect(echo); retour.connect(ctx.destination);
    creerBourdon();
    return true;
  }

  // Bourdon de vielle : ré et la graves, filtrés, qui respirent lentement.
  function creerBourdon() {
    var g = ctx.createGain(); g.gain.value = 0.05;
    var f = ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 520; f.Q.value = 2;
    var lfo = ctx.createOscillator(); lfo.frequency.value = 0.13;
    var lfoG = ctx.createGain(); lfoG.gain.value = 160;
    lfo.connect(lfoG); lfoG.connect(f.frequency);
    [hz(38), hz(45), hz(50)].forEach(function (fr, i) {
      var o = ctx.createOscillator(); o.type = "sawtooth"; o.frequency.value = fr; o.detune.value = i * 3;
      o.connect(f); o.start();
    });
    f.connect(g); g.connect(maitre); lfo.start();
    bourdon = g;
  }

  // Flûte : triangle et sinus avec un léger vibrato.
  function flute(m, t, d, fort) {
    var o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain();
    var vib = ctx.createOscillator(), vibG = ctx.createGain();
    o.type = "triangle"; o.frequency.value = hz(m);
    o2.type = "sine"; o2.frequency.value = hz(m) * 2;
    vib.frequency.value = 5.2; vibG.gain.value = hz(m) * 0.006;
    vib.connect(vibG); vibG.connect(o.frequency);
    var g2 = ctx.createGain(); g2.gain.value = 0.25;
    o.connect(g); o2.connect(g2); g2.connect(g); g.connect(maitre);
    var v = fort ? 0.13 : 0.1;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(v, t + 0.04);
    g.gain.setValueAtTime(v * 0.85, t + Math.max(0.05, d - 0.08));
    g.gain.linearRampToValueAtTime(0, t + d);
    [o, o2, vib].forEach(function (x) { x.start(t); x.stop(t + d + 0.05); });
  }

  // Luth : corde pincée (onde carrée filtrée qui s'éteint vite).
  function luth(m, t, v) {
    var o = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    o.type = "square"; o.frequency.value = hz(m);
    f.type = "lowpass"; f.frequency.setValueAtTime(2400, t); f.frequency.exponentialRampToValueAtTime(400, t + 0.3);
    g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0008, t + 0.55);
    o.connect(f); f.connect(g); g.connect(maitre);
    o.start(t); o.stop(t + 0.6);
  }

  // Tambour sur cadre : peau grave et un souffle de bruit.
  var bruit = null;
  function tambour(t, v) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(55, t + 0.18);
    g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    o.connect(g); g.connect(maitre); o.start(t); o.stop(t + 0.3);
    if (!bruit) {
      bruit = ctx.createBuffer(1, ctx.sampleRate * 0.2, ctx.sampleRate);
      var d = bruit.getChannelData(0);
      for (var i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    }
    var b = ctx.createBufferSource(), bf = ctx.createBiquadFilter(), bg = ctx.createGain();
    b.buffer = bruit; bf.type = "bandpass"; bf.frequency.value = 900; bg.gain.value = v * 0.35;
    b.connect(bf); bf.connect(bg); bg.connect(maitre); b.start(t);
  }

  // Accords de luth par mesure (fondamentale), en ré dorien.
  var BASSES = [50, 50, 48, 45, 50, 53, 48, 50];

  function ordonnancer() {
    if (!ctx) return;
    var croche = TEMPO[humeur];
    var phrases = PHRASES[humeur];
    while (prochaine < ctx.currentTime + 0.35) {
      var t = prochaine;
      var dansMesure = pas % 6;
      // tambour : temps forts (et contretemps en guerre)
      if (dansMesure === 0) tambour(t, humeur === "guerre" ? 0.5 : 0.28);
      else if (dansMesure === 3) tambour(t, humeur === "guerre" ? 0.35 : 0.14);
      else if (humeur === "guerre" && dansMesure === 5) tambour(t, 0.18);
      // luth : arpège sur la basse de la mesure
      var basse = BASSES[Math.floor(pas / 6) % BASSES.length];
      if (dansMesure === 0) luth(basse, t, 0.05);
      if (dansMesure === 2) luth(basse + 7, t, 0.035);
      if (dansMesure === 4) luth(basse + 12, t, 0.035);
      // mélodie
      if (resteNote <= 0) {
        var ph = phrases[iPhrase % phrases.length];
        if (iNote >= ph.length) { iNote = 0; iPhrase = (iPhrase + 1 + (Math.random() < 0.3 ? 1 : 0)) % phrases.length; ph = phrases[iPhrase]; }
        var n = ph[iNote++];
        resteNote = n[1];
        if (n[0]) flute(humeur === "guerre" ? n[0] - 12 : n[0], t, n[1] * croche * (humeur === "guerre" ? 0.8 : 0.95), dansMesure === 0);
      }
      resteNote--;
      pas++;
      prochaine += croche;
    }
  }

  function demarrer() {
    if (!actif()) return;
    if (!ctx && !creer()) return;
    if (ctx.state === "suspended") { try { ctx.resume(); } catch (e) { /* rien */ } }
    if (minuterie) return;
    prochaine = ctx.currentTime + 0.1;
    maitre.gain.cancelScheduledValues(ctx.currentTime);
    maitre.gain.setValueAtTime(maitre.gain.value, ctx.currentTime);
    maitre.gain.linearRampToValueAtTime(VOLUME, ctx.currentTime + 2.5);
    minuterie = setInterval(ordonnancer, 90);
  }

  function arreter() {
    if (!ctx) return;
    clearInterval(minuterie); minuterie = null;
    maitre.gain.cancelScheduledValues(ctx.currentTime);
    maitre.gain.setValueAtTime(maitre.gain.value, ctx.currentTime);
    maitre.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
  }

  // « paix » sur la carte et au conseil, « guerre » pendant un assaut ou une défense.
  function changerHumeur(h) {
    if (h === humeur || !PHRASES[h]) return;
    humeur = h; iPhrase = 0; iNote = 0; resteNote = 0;
    if (bourdon && ctx) bourdon.gain.setTargetAtTime(h === "guerre" ? 0.07 : 0.05, ctx.currentTime, 0.5);
  }

  function basculer() {
    var etat = JEU.sauvegarde.etat();
    etat.reglages.musique = !actif();
    JEU.sauvegarde.enregistrer();
    if (etat.reglages.musique) demarrer(); else arreter();
    if (JEU.ui && JEU.ui.majRessources) JEU.ui.majRessources();
  }

  // Le navigateur n'autorise le son qu'après un geste de l'élève.
  function brancher() {
    function premierGeste() {
      document.removeEventListener("pointerdown", premierGeste, true);
      document.removeEventListener("keydown", premierGeste, true);
      demarrer();
    }
    document.addEventListener("pointerdown", premierGeste, true);
    document.addEventListener("keydown", premierGeste, true);
    document.addEventListener("visibilitychange", function () {
      if (!ctx) return;
      if (document.hidden) { try { ctx.suspend(); } catch (e) { /* rien */ } }
      else if (actif()) { try { ctx.resume(); } catch (e) { /* rien */ } }
    });
  }

  JEU.musique = { brancher: brancher, demarrer: demarrer, arreter: arreter, basculer: basculer, humeur: changerHumeur, actif: actif };
})(typeof window !== "undefined" ? window : globalThis);
