// Icônes et blasons en SVG, dessinés pour ce jeu (aplats, traits d'encre, silhouettes).
(function (racine) {
  "use strict";
  var JEU = racine.JEU;
  var ENCRE = "#2e2419", OR = "#b08d3a";

  var RESSOURCES = {
    // sceau de cire
    sceaux: "<circle cx='12' cy='12' r='8' fill='currentColor'/><circle cx='12' cy='12' r='5' fill='none' stroke='#efe6d2' stroke-width='1.2'/><path d='M12 8.5l1.1 2.3 2.4.3-1.8 1.6.5 2.4-2.2-1.2-2.2 1.2.5-2.4-1.8-1.6 2.4-.3z' fill='#efe6d2'/>",
    // borne et chemin
    routes: "<path d='M3 21c4-5 4-9 9-11s6-5 9-7' fill='none' stroke='currentColor' stroke-width='2.4' stroke-linecap='round' stroke-dasharray='1 3.2'/><rect x='14' y='12' width='5' height='8' rx='2.5' fill='currentColor'/>",
    // mortier et pilon
    remedes: "<path d='M4 11h16c0 5-3.5 8-8 8s-8-3-8-8z' fill='currentColor'/><rect x='8' y='19' width='8' height='2' fill='currentColor'/><path d='M13 10l6-7' stroke='currentColor' stroke-width='2.4' stroke-linecap='round'/>",
    // alambic
    alambics: "<circle cx='9' cy='15' r='6' fill='currentColor'/><path d='M9 9V5h3l8 6' fill='none' stroke='currentColor' stroke-width='2' stroke-linejoin='round'/><path d='M20 11v6' stroke='currentColor' stroke-width='2'/>",
    // rouleau de parchemin
    parchemins: "<rect x='5' y='5' width='13' height='14' rx='1' fill='currentColor'/><circle cx='5' cy='6.5' r='2.5' fill='currentColor'/><circle cx='18' cy='17.5' r='2.5' fill='currentColor'/><path d='M8 9h7M8 12h7M8 15h5' stroke='#efe6d2' stroke-width='1.2'/>",
    // poignée de main stylisée : deux anneaux enlacés
    alliances: "<circle cx='9' cy='12' r='5.5' fill='none' stroke='currentColor' stroke-width='2.6'/><circle cx='15' cy='12' r='5.5' fill='none' stroke='currentColor' stroke-width='2.6'/>"
  };

  function ressource(k) {
    return "<svg viewBox='0 0 24 24' width='22' height='22' aria-hidden='true'>" + (RESSOURCES[k] || "") + "</svg>";
  }

  // Blason du domaine : écu parti, avec une tour. La couleur dépend du nom (stable).
  function blason(nom, taille) {
    var teintes = ["#6b2d5c", "#2f5a8a", "#4f6b32", "#7a4a2a", "#2a7470", "#8a3a2a"];
    var h = 0, s = String(nom || "");
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    var c = teintes[h % teintes.length];
    taille = taille || 96;
    return "<svg viewBox='0 0 100 120' width='" + taille + "' height='" + Math.round(taille * 1.2) + "' aria-hidden='true'>" +
      "<path d='M8 8h84v46c0 32-22 50-42 58C30 104 8 86 8 54z' fill='" + c + "' stroke='" + ENCRE + "' stroke-width='3'/>" +
      "<path d='M50 8v104C30 104 8 86 8 54V8z' fill='" + OR + "' opacity='.9'/>" +
      "<path d='M8 8h84v46c0 32-22 50-42 58C30 104 8 86 8 54z' fill='none' stroke='" + ENCRE + "' stroke-width='3'/>" +
      // tour
      "<g fill='#efe6d2' stroke='" + ENCRE + "' stroke-width='2'><path d='M36 86V48h-4V38h8v5h6v-5h8v5h6v-5h8v10h-4v38z'/><path d='M46 86V72a4 4 0 0 1 8 0v14z' fill='" + ENCRE + "'/></g>" +
      "</svg>";
  }

  // Bannière d'un seigneur rival : couleurs tirées au hasard parmi des émaux héraldiques.
  function banniere(graine) {
    var emaux = [["#8a3a2a", "#efe6d2"], ["#2f5a8a", OR], ["#2e2419", OR], ["#4f6b32", "#efe6d2"], ["#6b2d5c", OR]];
    var e = emaux[graine % emaux.length];
    var motif = graine % 3 === 0
      ? "<path d='M20 30h60M20 50h60M20 70h60' stroke='" + e[1] + "' stroke-width='8'/>"
      : graine % 3 === 1 ? "<path d='M20 20l60 70M80 20L20 90' stroke='" + e[1] + "' stroke-width='9'/>"
        : "<circle cx='50' cy='52' r='16' fill='" + e[1] + "'/>";
    return "<svg viewBox='0 0 100 140' width='110' height='154' aria-hidden='true'>" +
      "<path d='M14 4v136' stroke='" + ENCRE + "' stroke-width='4'/>" +
      "<path d='M16 12h70v84l-35 18-35-18z' fill='" + e[0] + "' stroke='" + ENCRE + "' stroke-width='3'/>" +
      "<g clip-path='url(#cb" + graine + ")'>" + motif + "</g>" +
      "<clipPath id='cb" + graine + "'><path d='M16 12h70v84l-35 18-35-18z'/></clipPath>" +
      "</svg>";
  }

  var OBJETS = {
    epee: "<path d='M32 4l6 6-22 22-4 1 1-4z' fill='currentColor'/><path d='M8 26l6 6M6 34l4-4' stroke='currentColor' stroke-width='3' stroke-linecap='round'/>",
    sceau: "<circle cx='20' cy='22' r='13' fill='currentColor'/><circle cx='20' cy='22' r='8' fill='none' stroke='#efe6d2' stroke-width='1.5'/><path d='M20 15v14M13 22h14' stroke='#efe6d2' stroke-width='1.5'/>",
    livre: "<path d='M4 8c6-2 11-1 16 2v24c-5-3-10-4-16-2z' fill='currentColor'/><path d='M36 8c-6-2-11-1-16 2v24c5-3 10-4 16-2z' fill='currentColor' opacity='.75'/>",
    plume: "<path d='M34 4C20 8 10 20 8 34l4-2C14 22 22 12 34 4z' fill='currentColor'/><path d='M8 34l-2 4' stroke='currentColor' stroke-width='2'/>",
    tour: "<path d='M10 36V14H7V6h6v4h4V6h6v4h4V6h6v8h-3v22z' fill='currentColor'/>"
  };

  function objet(k, taille) {
    taille = taille || 40;
    return "<svg viewBox='0 0 40 40' width='" + taille + "' height='" + taille + "' aria-hidden='true'>" + (OBJETS[k] || "") + "</svg>";
  }

  // Le chroniqueur : silhouette avec plume.
  function chroniqueur() {
    return "<svg viewBox='0 0 80 80' width='64' height='64' aria-hidden='true'>" +
      "<circle cx='40' cy='40' r='38' fill='#e3d6b8' stroke='" + ENCRE + "' stroke-width='2'/>" +
      "<path d='M18 74c2-16 10-24 22-24s20 8 22 24z' fill='#5b4a3a'/>" +
      "<circle cx='40' cy='34' r='12' fill='#5b4a3a'/>" +
      "<path d='M26 30c2-12 26-14 28 0-6-5-22-5-28 0z' fill='" + ENCRE + "'/>" +
      "<path d='M60 20c-8 4-14 14-15 26l3-1c2-10 6-18 12-25z' fill='" + OR + "'/>" +
      "</svg>";
  }

  JEU.icones = { ressource: ressource, blason: blason, banniere: banniere, objet: objet, chroniqueur: chroniqueur };
})(typeof window !== "undefined" ? window : globalThis);
