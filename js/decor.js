// Décors : champ de bataille de l'Assaut (tableau du Met en fond, bannières et effets en SVG).
(function (racine) {
  "use strict";
  var JEU = racine.JEU;

  function alea(graine) {
    var s = graine;
    return function () { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  }

  // Champ de bataille : tableau de Van der Meulen (The Met, CC0) ; la garnison rivale est figurée par ses
  // bannières, plantées à droite, qui tombent une à une.
  function champBataille(graine, force, nomDomaine) {
    var c = JEU.icones.couleurs(nomDomaine);
    var r = alea(graine + 7);
    var L = 1000, H = 400;
    var s = "<svg viewBox='0 0 " + L + " " + H + "' class='bataille' role='img' aria-label='Champ de bataille'>" +
      "<defs><linearGradient id='basB' x1='0' y1='0' x2='0' y2='1'><stop offset='.55' stop-color='#000' stop-opacity='0'/><stop offset='1' stop-color='#140c06' stop-opacity='.7'/></linearGradient>" +
      "<radialGradient id='vigB' cx='.5' cy='.5' r='.75'><stop offset='.55' stop-color='#000' stop-opacity='0'/><stop offset='1' stop-color='#1c140c' stop-opacity='.55'/></radialGradient>" +
      "<filter id='ombreB'><feDropShadow dx='3' dy='5' stdDeviation='3' flood-color='#000' flood-opacity='.6'/></filter></defs>" +
      "<filter id='flouF' x='-50%' y='-50%' width='200%' height='200%'><feGaussianBlur stdDeviation='14'/></filter>" +
      "<g class='toile-fond'><image href='assets/images/oeuvres/bataille-cavalerie.jpg' x='0' y='-120' width='" + L + "' height='663' preserveAspectRatio='xMidYMid slice'/></g>" +
      // fumées qui dérivent sur le champ de bataille
      "<g class='fumees' filter='url(#flouF)'>" +
      "<ellipse class='f1' cx='300' cy='230' rx='160' ry='40' fill='#e8e0d0' opacity='.35'/>" +
      "<ellipse class='f2' cx='600' cy='280' rx='200' ry='45' fill='#ddd3c0' opacity='.3'/>" +
      "<ellipse class='f3' cx='150' cy='300' rx='140' ry='35' fill='#f0e8d8' opacity='.3'/></g>" +
      "<rect width='" + L + "' height='" + H + "' fill='url(#basB)'/>";
    // ta bannière, à gauche, au-dessus de tes cavaliers
    s += "<g filter='url(#ombreB)' transform='translate(40,150)'><g class='flotte'><path d='M0 0v190' stroke='#2e2419' stroke-width='5'/><circle r='6' fill='#b08d3a'/>" +
      "<path d='M3 8h86l-18 26 18 26H3z' fill='" + c[0] + "' stroke='#2e2419' stroke-width='2'/><path d='M3 8h40v52H3z' fill='" + c[1] + "'/></g></g>";
    // la garnison rivale : une bannière par point de force
    s += "<g class='armee ennemie'>";
    for (var i = 0; i < force; i++) {
      var x = 610 + (i % 3) * 120 + (i > 2 ? 60 : 0), y = i > 2 ? 210 : 150;
      s += "<g class='unite' data-rang='" + i + "' filter='url(#ombreB)'><g class='flotte' style='animation-delay:-" + (i * 0.7).toFixed(1) + "s'>" + JEU.icones.banniereSVG(graine + i, x, y, 150) + "</g></g>";
    }
    s += "</g>";
    // volée de flèches (animée au coup) et éclat du coup puissant
    s += "<g class='volee'>";
    for (var f = 0; f < 9; f++) {
      var fy = 120 + f * 18 + r() * 10, fx = 230 + r() * 80;
      s += "<path d='M" + fx + " " + fy + " l60 -10' stroke='#1a120a' stroke-width='2.5'/><path d='M" + (fx + 60) + " " + (fy - 10) + " l-10 -3 l3 8z' fill='#1a120a'/>";
    }
    s += "</g><g class='eclat'><circle cx='760' cy='230' r='120' fill='#fbe9bd' opacity='.85'/></g>";
    s += "<rect width='" + L + "' height='" + H + "' fill='url(#vigB)' pointer-events='none'/></svg>";
    return s;
  }

  JEU.decor = { champBataille: champBataille, alea: alea };
})(typeof window !== "undefined" ? window : globalThis);
