// Décors en SVG, dessinés pour ce jeu (CC0) : paysage d'accueil qui grandit avec le domaine,
// champ de bataille de l'Assaut. Style : aplats, traits d'encre, silhouettes, lumière d'aube.
(function (racine) {
  "use strict";
  var JEU = racine.JEU;
  var ENCRE = "#2e2419", OR = "#b08d3a";

  function alea(graine) {
    var s = graine;
    return function () { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  }

  // Ligne de crêtes : points pseudo-aléatoires entre y0 et y0 + amplitude.
  function crete(r, largeur, y0, amp, pas, bas) {
    var d = "M0 " + bas + " L0 " + y0;
    for (var x = 0; x <= largeur + pas; x += pas) d += " L" + x + " " + Math.round(y0 + (r() - 0.5) * amp);
    return d + " L" + largeur + " " + bas + " Z";
  }

  function sapin(x, y, h, c) {
    return "<path d='M" + x + " " + (y - h) + " l" + (h * 0.32) + " " + (h * 0.55) + " h" + (-h * 0.14) + " l" + (h * 0.22) + " " + (h * 0.4) + " h" + (-h * 0.8) + " l" + (h * 0.22) + " " + (-h * 0.4) + " h" + (-h * 0.14) + "z' fill='" + c + "' stroke='" + ENCRE + "' stroke-width='1'/>" +
      "<rect x='" + (x - 2) + "' y='" + (y - 1) + "' width='4' height='" + (h * 0.12) + "' fill='" + ENCRE + "'/>";
  }

  function maison(x, y, l, h, toit, mur) {
    return "<g><rect x='" + x + "' y='" + (y - h) + "' width='" + l + "' height='" + h + "' fill='" + (mur || "#d9c49a") + "' stroke='" + ENCRE + "' stroke-width='1.3'/>" +
      "<path d='M" + (x - 3) + " " + (y - h) + " L" + (x + l / 2) + " " + (y - h - l * 0.6) + " L" + (x + l + 3) + " " + (y - h) + "z' fill='" + (toit || "#8a4a2e") + "' stroke='" + ENCRE + "' stroke-width='1.3'/>" +
      "<rect x='" + (x + l / 2 - 3) + "' y='" + (y - 9) + "' width='6' height='9' fill='" + ENCRE + "'/></g>";
  }

  function creneaux(x, y, l, n) {
    var d = "", w = l / (n * 2 - 1);
    for (var i = 0; i < n; i++) d += "<rect x='" + (x + i * 2 * w) + "' y='" + (y - 7) + "' width='" + w + "' height='7' fill='#bcae92' stroke='" + ENCRE + "' stroke-width='1'/>";
    return d;
  }

  function tourChateau(x, y, l, h, couleurs) {
    return "<rect x='" + x + "' y='" + (y - h) + "' width='" + l + "' height='" + h + "' fill='#c8b996' stroke='" + ENCRE + "' stroke-width='1.6'/>" +
      creneaux(x - 2, y - h, l + 4, 3) +
      "<rect x='" + (x + l / 2 - 3) + "' y='" + (y - h + 14) + "' width='6' height='12' rx='3' fill='" + ENCRE + "'/>" +
      "<path d='M" + (x + l / 2) + " " + (y - h - 7) + "v-26' stroke='" + ENCRE + "' stroke-width='2'/>" +
      "<path d='M" + (x + l / 2) + " " + (y - h - 33) + "h22l-6 7 6 7h-22z' fill='" + couleurs[0] + "' stroke='" + ENCRE + "' stroke-width='1'/>";
  }

  // Paysage d'accueil. stade : 0 hameau, 1 village, 2 bourg, 3 ville.
  function paysage(stade, nomDomaine) {
    var c = JEU.icones.couleurs(nomDomaine);
    var r = alea(11);
    var L = 1200, H = 380;
    var s = "<svg viewBox='0 0 " + L + " " + H + "' class='paysage' preserveAspectRatio='xMidYMid slice' role='img' aria-label='Ton domaine au lever du jour'>" +
      "<defs><linearGradient id='ciel' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#7d8fa0'/><stop offset='.55' stop-color='#e8c88e'/><stop offset='1' stop-color='#f3e2bc'/></linearGradient>" +
      "<radialGradient id='soleil' cx='.5' cy='.5' r='.5'><stop offset='0' stop-color='#fff4d6'/><stop offset='1' stop-color='#fff4d6' stop-opacity='0'/></radialGradient>" +
      "<radialGradient id='vignette' cx='.5' cy='.45' r='.75'><stop offset='.6' stop-color='#000' stop-opacity='0'/><stop offset='1' stop-color='#1c140c' stop-opacity='.55'/></radialGradient></defs>" +
      "<rect width='" + L + "' height='" + H + "' fill='url(#ciel)'/>" +
      "<circle cx='860' cy='170' r='140' fill='url(#soleil)'/><circle cx='860' cy='170' r='34' fill='#fbe9bd' opacity='.9'/>" +
      // montagnes lointaines (les Pyrénées ne sont jamais loin)
      "<path d='" + crete(r, L, 150, 70, 60, H) + "' fill='#8d97a0' opacity='.75'/>" +
      "<path d='" + crete(r, L, 190, 60, 45, H) + "' fill='#77806b' opacity='.85'/>" +
      // collines
      "<path d='M0 250 C200 210 380 230 560 215 S900 200 1200 240 V" + H + " H0z' fill='#8c8a55' stroke='" + ENCRE + "' stroke-width='1.5'/>" +
      "<path d='M0 300 C260 270 520 290 760 275 S1040 268 1200 290 V" + H + " H0z' fill='#a39a5e' stroke='" + ENCRE + "' stroke-width='1.5'/>";
    // champs en lanières
    for (var i = 0; i < 9; i++) {
      var fx = 40 + i * 125, fy = 300 + (i % 2) * 8;
      s += "<path d='M" + fx + " " + fy + " l100 -6 l10 26 l-104 6z' fill='" + (i % 3 ? "#b9a965" : "#c7b874") + "' stroke='" + ENCRE + "' stroke-width='.8' opacity='.85'/>";
    }
    // forêts
    for (var k = 0; k < 26; k++) {
      var tx = k < 13 ? 20 + k * 22 + r() * 10 : 940 + (k - 13) * 20 + r() * 10;
      s += sapin(tx, 262 + r() * 22, 26 + r() * 14, k % 2 ? "#4c5a32" : "#56653a");
    }
    // château sur la colline, qui grandit avec le domaine
    var cx = 560, cy = 222;
    s += "<path d='M" + (cx - 120) + " " + (cy + 4) + " Q" + cx + " " + (cy - 40) + " " + (cx + 140) + " " + (cy + 4) + "z' fill='#7f7d4b' stroke='" + ENCRE + "' stroke-width='1.5'/>";
    if (stade === 0) {
      // palissade de bois et tour de guet
      for (var p = 0; p < 18; p++) s += "<path d='M" + (cx - 70 + p * 9) + " " + (cy - 4) + " v-18 l3 -5 l3 5 v18z' fill='#8a5a34' stroke='" + ENCRE + "' stroke-width='.8'/>";
      s += tourChateau(cx - 12, cy - 6, 30, 52, c);
    } else {
      var mur = stade >= 2 ? 130 : 90;
      s += "<rect x='" + (cx - mur) + "' y='" + (cy - 36) + "' width='" + mur * 2 + "' height='32' fill='#bcae92' stroke='" + ENCRE + "' stroke-width='1.6'/>" + creneaux(cx - mur, cy - 36, mur * 2, Math.round(mur / 7));
      s += "<path d='M" + (cx - 10) + " " + (cy - 4) + " v-18 a10 10 0 0 1 20 0 v18z' fill='" + ENCRE + "'/>";
      s += tourChateau(cx - mur - 18, cy - 4, 32, 66, c) + tourChateau(cx + mur - 14, cy - 4, 32, 66, c);
      s += tourChateau(cx - 22, cy - 36, 44, stade >= 3 ? 104 : 84, c);
      if (stade >= 2) s += tourChateau(cx - 70, cy - 36, 28, 56, c) + tourChateau(cx + 42, cy - 36, 28, 56, c);
    }
    // maisons du village au pied du château
    var nb = [3, 7, 12, 18][stade] || 3;
    var r2 = alea(3);
    for (var m = 0; m < nb; m++) {
      var side = m % 2 ? 1 : -1;
      var mx = cx + side * (150 + Math.floor(m / 2) * 46) + r2() * 14;
      var my = 300 + r2() * 26;
      s += maison(mx, my, 22 + r2() * 10, 16 + r2() * 6, r2() > .5 ? "#8a4a2e" : "#6e4a33");
    }
    // route qui serpente
    s += "<path d='M600 " + H + " C620 340 520 320 560 " + (cy + 6) + "' fill='none' stroke='#d8c58e' stroke-width='12' stroke-linecap='round'/>" +
      "<path d='M600 " + H + " C620 340 520 320 560 " + (cy + 6) + "' fill='none' stroke='" + ENCRE + "' stroke-width='1' stroke-dasharray='2 8'/>";
    // bannière du joueur au premier plan
    s += "<g transform='translate(70,250)'><path d='M0 0v130' stroke='" + ENCRE + "' stroke-width='4'/><path d='M2 6h56l-12 18 12 18H2z' fill='" + c[0] + "' stroke='" + ENCRE + "' stroke-width='2'/><path d='M2 6h26v36H2z' fill='" + c[1] + "'/></g>";
    s += "<rect width='" + L + "' height='" + H + "' fill='url(#vignette)'/></svg>";
    return s;
  }

  // ---------- champ de bataille ----------
  var UNITES_ENNEMIES = ["epeiste", "lances", "archer", "epeiste", "cavalier", "archer"];
  var UNITES_JOUEUR = ["cavalier", "epeiste", "lances", "archer", "epeiste"];

  function champBataille(graine, force, nomDomaine) {
    var c = JEU.icones.couleurs(nomDomaine);
    var r = alea(graine + 7);
    var L = 1000, H = 260;
    var s = "<svg viewBox='0 0 " + L + " " + H + "' class='bataille' role='img' aria-label='Champ de bataille'>" +
      "<defs><linearGradient id='cielB' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#9aa3a2'/><stop offset='1' stop-color='#e3cfa3'/></linearGradient>" +
      "<radialGradient id='vigB' cx='.5' cy='.5' r='.75'><stop offset='.55' stop-color='#000' stop-opacity='0'/><stop offset='1' stop-color='#1c140c' stop-opacity='.5'/></radialGradient></defs>" +
      "<rect width='" + L + "' height='" + H + "' fill='url(#cielB)'/>" +
      "<path d='" + crete(r, L, 110, 50, 50, H) + "' fill='#86907c' opacity='.8'/>" +
      "<path d='M0 170 C250 150 500 175 750 160 S950 165 1000 170 V" + H + " H0z' fill='#9a9158' stroke='" + ENCRE + "' stroke-width='1.5'/>" +
      "<path d='M0 215 C300 200 700 222 1000 205 V" + H + " H0z' fill='#8a8250' opacity='.7'/>";
    for (var k = 0; k < 10; k++) s += sapin(430 + k * 14 + r() * 6, 168 + r() * 6, 20 + r() * 8, "#4c5a32");
    // armée du joueur
    s += "<g class='armee joueur'>";
    s += "<g transform='translate(40,70)'><path d='M0 0v120' stroke='" + ENCRE + "' stroke-width='4'/><path d='M2 6h60l-12 18 12 18H2z' fill='" + c[0] + "' stroke='" + ENCRE + "' stroke-width='2'/><path d='M2 6h28v36H2z' fill='" + c[1] + "'/></g>";
    UNITES_JOUEUR.forEach(function (u, i) {
      var x = 100 + (i % 3) * 78 + (i > 2 ? 38 : 0), y = i > 2 ? 150 : 108;
      s += "<g class='unite'>" + JEU.icones.dans(u, x, y, 70, c[0]) + "</g>";
    });
    s += "</g>";
    // armée ennemie : une unité par point de force
    s += "<g class='armee ennemie'>";
    for (var i = 0; i < force; i++) {
      var ex = 840 - (i % 3) * 82 - (i > 2 ? 38 : 0), ey = i > 2 ? 150 : 108;
      s += "<g class='unite' data-rang='" + i + "'><g transform='translate(" + (ex + 70) + ",0) scale(-1,1)'>" + JEU.icones.dans(UNITES_ENNEMIES[i % UNITES_ENNEMIES.length], 0, ey, 70, "#3b3027") + "</g></g>";
    }
    s += JEU.icones.banniereSVG(graine, 905, 60, 130) + "</g>";
    // volée de flèches (animée au coup)
    s += "<g class='volee'>";
    for (var f = 0; f < 7; f++) {
      var fy = 70 + f * 14 + r() * 10, fx = 360 + r() * 60;
      s += "<path d='M" + fx + " " + fy + " l46 -6' stroke='" + ENCRE + "' stroke-width='2'/><path d='M" + (fx + 46) + " " + (fy - 6) + " l-8 -3 l2 6z' fill='" + ENCRE + "'/>";
    }
    s += "</g><g class='eclat'><circle cx='720' cy='140' r='70' fill='#fbe9bd' opacity='.85'/></g>";
    s += "<rect width='" + L + "' height='" + H + "' fill='url(#vigB)' pointer-events='none'/></svg>";
    return s;
  }

  JEU.decor = { paysage: paysage, champBataille: champBataille, sapin: sapin, maison: maison, alea: alea };
})(typeof window !== "undefined" ? window : globalThis);
