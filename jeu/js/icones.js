// Icônes et blasons. Les icônes viennent de Game-icons.net (CC BY 3.0, assets/icones/game-icons.js) ;
// blasons, bannières et médaillons sont dessinés pour ce jeu (CC0).
(function (racine) {
  "use strict";
  var JEU = racine.JEU;
  var ENCRE = "#2e2419", OR = "#b08d3a";

  function corps(nom) { return (JEU.GAME_ICONS && JEU.GAME_ICONS[nom]) || ""; }

  // Icône autonome (balise <svg>), couleur = currentColor.
  function icone(nom, taille, classe) {
    taille = taille || 24;
    return "<svg viewBox='0 0 512 512' width='" + taille + "' height='" + taille + "' class='gi " + (classe || "") + "' aria-hidden='true'>" + corps(nom) + "</svg>";
  }

  // Icône à insérer dans un autre SVG : coin haut gauche (x, y), côté t, couleur c.
  function dans(nom, x, y, t, c, extra) {
    return "<g transform='translate(" + x + "," + y + ") scale(" + (t / 512) + ")' color='" + (c || ENCRE) + "'" + (extra || "") + ">" + corps(nom) + "</g>";
  }

  var RESSOURCE_ICONE = { sceaux: "sceaux", routes: "routes", remedes: "remedes", alambics: "alambics", parchemins: "parchemins", alliances: "alliances" };
  function ressource(k, taille) { return icone(RESSOURCE_ICONE[k] || k, taille || 22); }

  // Couleurs du blason du joueur, stables d'après le nom du domaine.
  var EMAUX = [["#6b2d5c", OR], ["#2f5a8a", OR], ["#4f6b32", "#efe6d2"], ["#8a3a2a", OR], ["#2a7470", "#efe6d2"], ["#2e2419", OR]];
  function couleurs(nom) {
    var h = 0, s = String(nom || "");
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return EMAUX[h % EMAUX.length];
  }

  // Écu parti avec une tour, ombré comme une enluminure.
  function blason(nom, taille) {
    var c = couleurs(nom);
    taille = taille || 96;
    var id = "bl" + Math.floor(Math.random() * 1e6);
    return "<svg viewBox='0 0 100 120' width='" + taille + "' height='" + Math.round(taille * 1.2) + "' aria-hidden='true' class='blason'>" +
      "<defs><linearGradient id='" + id + "' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#fff' stop-opacity='.35'/><stop offset='.5' stop-color='#fff' stop-opacity='0'/><stop offset='1' stop-color='#000' stop-opacity='.3'/></linearGradient></defs>" +
      "<path d='M6 6h88v48c0 34-23 52-44 60C29 106 6 88 6 54z' fill='" + OR + "' stroke='" + ENCRE + "' stroke-width='2'/>" +
      "<path d='M11 11h78v43c0 29-20 45-39 52C31 99 11 83 11 54z' fill='" + c[0] + "'/>" +
      "<path d='M50 11v95C31 99 11 83 11 54V11z' fill='" + c[1] + "'/>" +
      dans("tour", 26, 30, 48, c[1] === OR ? "#efe6d2" : ENCRE) +
      "<path d='M11 11h78v43c0 29-20 45-39 52C31 99 11 83 11 54z' fill='url(#" + id + ")'/>" +
      "<path d='M6 6h88v48c0 34-23 52-44 60C29 106 6 88 6 54z' fill='none' stroke='" + ENCRE + "' stroke-width='2.5'/>" +
      "</svg>";
  }

  // Bannière d'un seigneur rival (émaux tirés au sort).
  function banniereSVG(graine, x, y, h) {
    var emaux = [["#8a3a2a", "#efe6d2"], ["#2f5a8a", OR], ["#2e2419", OR], ["#4f6b32", "#efe6d2"], ["#6b2d5c", OR]];
    var e = emaux[graine % emaux.length];
    var s = h / 140;
    var motif = graine % 3 === 0 ? "<path d='M16 34h70M16 56h70M16 78h70' stroke='" + e[1] + "' stroke-width='9'/>"
      : graine % 3 === 1 ? "<path d='M18 16l66 80M84 16L18 96' stroke='" + e[1] + "' stroke-width='10'/>"
        : "<circle cx='51' cy='56' r='17' fill='" + e[1] + "'/>";
    return "<g transform='translate(" + x + "," + y + ") scale(" + s + ")'>" +
      "<path d='M14 0v140' stroke='" + ENCRE + "' stroke-width='5'/><circle cx='14' cy='0' r='5' fill='" + OR + "'/>" +
      "<path d='M16 12h70v84l-35 18-35-18z' fill='" + e[0] + "' stroke='" + ENCRE + "' stroke-width='3'/>" +
      "<g clip-path='url(#cb" + graine + ")'>" + motif + "</g>" +
      "<clipPath id='cb" + graine + "'><path d='M16 12h70v84l-35 18-35-18z'/></clipPath></g>";
  }
  function banniere(graine) {
    return "<svg viewBox='0 0 100 150' width='100' height='150' aria-hidden='true'>" + banniereSVG(graine, 0, 5, 140) + "</svg>";
  }

  var MATIERE_ICONE = { histoire: "couronne", geographie: "routes", svt: "remedes", physique: "alambics", litterature: "parchemin-plume", lecture: "plume", langue: "pupitre", anglais: "alliances" };
  function matiere(m) { return MATIERE_ICONE[m] || "ecu"; }

  function objet(k, taille) { return icone(k, taille || 40); }

  // Le chroniqueur : silhouette encapuchonnée dans un médaillon doré.
  function chroniqueur() {
    return "<svg viewBox='0 0 80 80' width='72' height='72' aria-hidden='true'>" +
      "<defs><radialGradient id='medc' cx='.4' cy='.35' r='.7'><stop offset='0' stop-color='#f3e3bf'/><stop offset='1' stop-color='#c9ae78'/></radialGradient></defs>" +
      "<circle cx='40' cy='40' r='38' fill='" + OR + "' stroke='" + ENCRE + "' stroke-width='2'/>" +
      "<circle cx='40' cy='40' r='32' fill='url(#medc)' stroke='" + ENCRE + "' stroke-width='1.5'/>" +
      dans("chroniqueur", 14, 12, 52, "#3a2a1c") + "</svg>";
  }

  JEU.icones = { matiere: matiere, icone: icone, dans: dans, ressource: ressource, blason: blason, couleurs: couleurs, banniere: banniere, banniereSVG: banniereSVG, objet: objet, chroniqueur: chroniqueur };
})(typeof window !== "undefined" ? window : globalThis);
