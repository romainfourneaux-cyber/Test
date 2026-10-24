// Écran des expéditions : la route des semaines (demande de Romain du 16/10/2026, conception atelier/conception/expeditions.md,
// sections 5, 8.5, 8.6, 9, 11, 12 et 14). Toute la logique (route, vivres, faveurs, renommée, Armorial, sauvegarde) est dans
// jeu/js/expedition.js (JEU.expedition) : ici, seulement le rendu et le clavier.
//  - l'écran de départ : le parchemin de l'année (frontière, bannière « Cette semaine », relais, semaines franchies scellées),
//    le relais, le front, l'Armorial, la durée estimée (elle informe, elle ne limite rien) ;
//  - la carte-itinéraire : un parchemin horizontal à la manière de la Table de Peutinger (trois couches par semaine, deux ou
//    trois haltes par couche avec leur porte, le gardien à droite, les semaines suivantes dans la brume) ;
//  - la page de semaine, les fenêtres des haltes (porte de faveur, bivouac, marchand), le bilan, la reprise.
// Les batailles passent par JEU.bataille.lancer(lieu, contexte) (contexte bâti sur JEU.expedition.optionsBataille), les
// événements du jour rejoués et les archives par JEU.campagne.jouerEvenement(ev, contexte). Rien ici ne touche le moteur.
// Règles fermes : aucun chrono ; une erreur ne coûte jamais un vivre ; chaque question est posée par un personnage ; les
// semaines au-delà de la frontière restent dans la brume (numéro et titres du planning seulement).
(function (racine) {
  "use strict";
  var JEU = racine.JEU;
  var U = JEU.util;

  // ---------- le parchemin de route : unités logiques (1000 × 300) ----------
  var L = 1000, H = 300;
  var DEPART = { x: 36, y: 170 };                 // le bourg de départ (petit bourg de France)
  var X0 = 70, BANDE = 310, NB_BANDES = 3;        // une semaine = une bande de 310 unités, après le départ
  var COL0 = 40, COL_FIN = 210, GARDIEN_X = 276;  // colonnes des couches dans la bande ; le gardien à droite (66 unités après la dernière colonne : les médaillons ne se touchent pas)
  var Y_MILIEU = 170, PAS = 72;                   // les haltes d'une couche s'étalent en hauteur autour du milieu
  var R_HALTE = 26, R_GARDIEN = 34, R_DEPART = 24;
  var ENCRE = "#2e2419", OR = "#b08d3a", OR_CLAIR = "#e2c272", OR_SOMBRE = "#7a5c1e", RUBRIQUE = "#8c2f39", PLOMB = "#4a4e57", FOND = "#efe6d2";
  var ICONES = { escarmouche: "assaut", embuscade: "mercenaires", marchand: "marchand", bivouac: "camp", archives: "parchemin-plume", gardien: "defi", grand: "couronne", depart: "lys" };
  var PORTE_ICONES = { bourse: "tresor", parchemin: "parchemins", vivres: "recolte" };
  // noms courts des événements sur la carte (le titre entier est dans l'infobulle et la page de la halte)
  var COURTS = { marchands: "Marchands", defi: "Le défi", mercenaires: "Mercenaires", incendie: "Incendie", espion: "L'espion", archives: "Archives" };
  var RANGS = ["", "bronze", "argent", "or"];

  // ---------- textes de l'écran : des textes de jeu, sans fait de cours ni chiffre (contrôlés par tests.js) ----------
  var TEXTES = {
    depart: {
      titre: "Partir en expédition", sous: "La route des semaines : trois semaines du programme à traverser, une halte par couche, un gardien par semaine.",
      relais: "Le relais", relaisAide: "Flèches pour changer de semaine de départ.", front: "Le front", compagnie: "La compagnie",
      duree: "Environ {M} minutes, reprise possible à chaque halte.", vivres: "Vivres au départ : {V}", renom: "Renommée : {D} à dépenser ({T} gagnés en tout).",
      franchies: "Semaines franchies : {F}.", aucuneFranchie: "Aucune semaine franchie encore.", attente: "La route attend tes premiers cours.",
      partir: "Partir", armorial: "Armorial", retour: "Retour", chronique: "Tes dernières expéditions", aucune: "Aucune expédition encore : la première ouvre la chronique.",
      contre: "contre {C}", grand: "Grand Gardien : {G}", ouverts: "Cours ouverts de la semaine {S}", aucunOuvert: "Aucun cours chargé pour cette semaine."
    },
    annee: { titre: "Le parchemin de l'année", cette: "Cette semaine", frontiere: "Frontière", legende: "Cases scellées : semaines franchies. Anneau d'or : relais ouverts. Au-delà de la frontière : la brume." },
    route: {
      titre: "La route des semaines", sous: "Semaine {S} · vers {F} · {H} halte", depart: "Départ", gardien: "Gardien", grand: "Grand Gardien",
      loin: "Plus loin sur la route", brume: "Dans la brume", entrer: "Entrer dans la halte", faveurs: "Faveurs", retour: "Retour à la campagne",
      lever: "Lever le camp", leverQuestion: "Lever le camp ? L'expédition s'arrête ici et tu gardes toute la renommée gagnée.", leverBouton: "Lever le camp",
      aucune: "Aucune halte à portée.", touche: "touche {T}", recompense: "récompense : {P}", couche: "{C} couche"
    },
    etats: { reussi: "réussie", eclatante: "victoire éclatante", echoue: "murs cédés", fait: "faite" },
    compagnie: {
      titre: "Ta compagnie", vivres: "Vivres", or: "Or de route", renom: "Renommée de l'expédition", total: "en tout", faveurs: "Faveurs", aucuneFaveur: "aucune encore",
      plan: "Plan de bataille : +{V} or à la prochaine bataille de route.", espion: "Un espion a parlé : la première vague adverse de la prochaine bataille sera plus faible.",
      graine: "Graine {G}", journal: "Journal de route", journalVide: "La compagnie vient de partir.", vitesse: "Vitesse des batailles ×{V}"
    },
    semaine: { enRoute: "En route", cours: "Les cours de la semaine", aucunCours: "Aucun cours du planning cette semaine : la route puise dans tout le royaume.", aVenir: "à venir", sautees: "Semaines traversées sans halte (cours pas encore déposés) : {S}." },
    porte: {
      titre: "La porte : {P}", sous: "{N} pose une question de son art. Juste : trois faveurs au choix ; fausse : deux.", juste: "Juste ! Trois faveurs au choix.", justeQuatre: "Juste ! Quatre faveurs au choix.",
      faux: "Pas tout à fait : deux faveurs au choix quand même.", choisir: "Choisis une faveur", affine: "Affiner : {A} → {B}", tenue: "Faveur tenue : {F} ({R}).",
      ouverture: "Faveur d'ouverture", ouvertureSous: "L'Armorial t'offre une faveur commune au choix avant la première halte.", sansFaveur: "Aucune faveur à offrir : l'or de route grossit à la place."
    },
    bivouac: {
      titre: "Le bivouac", sous: "Le ménestrel accueille la compagnie au feu de camp.", repos: "Repos", reposTexte: "Un sac de vivres de plus (si les sacs sont pleins : de l'or de route).",
      veillee: "Veillée", veilleeTexte: "Trois questions, d'abord sur ce qui est à revoir : de l'or de route par bonne réponse ; sans faute, une faveur s'affine.",
      question: "Question {I} sur {N}", affiner: "Sans faute : choisis la faveur à affiner", continuer: "Continuer la route", aucuneQuestion: "Aucune question pour la veillée : la compagnie se repose."
    },
    marchand: {
      titre: "L'étal du marchand", sous: "Le maître d'œuvre tient l'étal. Une bonne réponse fait baisser les prix.", or: "Or de route : {O}", remise: "Les prix ont baissé.",
      sansRemise: "Les prix restent entiers.", quitter: "Quitter l'étal", achete: "Acheté : {A}.", pasAssez: "Pas assez d'or de route.", vendu: "vendu", indisponible: "sans objet"
    },
    armorial: {
      titre: "L'Armorial", sous: "La renommée paie les quartiers de ton écu, pour toujours. Tu peux toujours jouer sans rien acheter. Ordre conseillé : la Bourse, les Vivres, la Faveur d'ouverture.",
      renom: "Renommée à dépenser : {R}", rang: "rang {A} sur {B}", complet: "complet", acheter: "Acheter · {P}", achete: "{Q} : l'Armorial s'enrichit.", fermer: "Fermer"
    },
    fin: {
      cede: "Les murs ont cédé", cedeTexte: "La compagnie perd un sac de vivres. Il en reste {V}.", retente: " Les coups portés au gardien restent : tu peux retenter.",
      dernier: " Plus de vivres : la compagnie rentre au domaine.", tenu: "La halte est passée", eclatante: "Victoire éclatante : la porte est doublée",
      gardien: "Semaine {S} franchie", gardienTexte: "Le seigneur rival recule. Le relais suivant est ouvert, et le conseiller t'attend à la sortie du camp.",
      grand: "Expédition accomplie", grandTexte: "Le Grand Gardien cède. La compagnie rentre couverte de renommée.", bouton: "Continuer la route",
      tenuTexte: "La compagnie passe. La route continue.", eclatanteTexte: "Le camp de route est tombé : la récompense annoncée est doublée.",
      porte: "porte : {P}", vivre: "+{V} vivre", renom: "+{R} renommée", or: "+{O} or de route", vivrePerdu: "Un sac de vivres perdu : la bataille avait commencé quand le jeu s'est fermé."
    },
    bilan: { repartir: "Repartir", retour: "Retour à la campagne", atteint: "Semaine {S}, {H} halte", ressources: "+{N} {R} pour ta meilleure matière ({M}).", relireVide: "Rien à relire : aucune question ratée sur cette route.", banniere: "Bannière de l'Armorial : +{B}." },
    evenements: {
      defi: "Le champion du gardien de la semaine défie le tien. Deux bonnes réponses sur trois, et le gardien perd trois coups.",
      mercenaires: "Une compagnie de mercenaires propose ses services. Une bonne réponse sur deux, et ta prochaine bataille de route commence avec plus d'or.",
      espion: "La compagnie a pris un espion. Une bonne réponse sur deux, et il avoue : la première vague adverse de ta prochaine bataille de route sera plus faible.",
      marchands: "Des marchands croisent la compagnie. Chaque bonne réponse rapporte des ressources au domaine et un peu d'or de route.",
      incendie: "Le feu prend dans un grenier du bourg. Chaque bonne réponse organise la chaîne des seaux ; deux réponses justes, et les villageois remplissent un sac de vivres."
    }
  };

  // État de l'écran (mémoire seulement : tout ce qui compte est dans la sauvegarde, par JEU.expedition)
  var S = { suite: null, bilan: null, toast: null, pageVue: null, focus: 0, enHalte: false, relais: null, front: null };

  // Chaque réponse donnée pendant une halte compte pour l'expédition (+1 renommée par bonne réponse, compte par famille,
  // fiches ratées pour « À relire »), en plus de tout ce que JEU.questions.enregistrerReponse fait déjà (Leitner, Seconde
  // chance, statistiques). Une partie de campagne jouée pendant qu'une expédition attend ne compte pas (S.enHalte).
  // Notée avant enregistrerReponse, sans sauvegarder : la sauvegarde qu'enregistrerReponse écrit de toute façon emporte
  // le compte de l'expédition (une seule écriture par réponse, rien de plus entre une réponse et la question suivante).
  var enregistrerVrai = JEU.questions.enregistrerReponse;
  JEU.questions.enregistrerReponse = function (q, juste) {
    if (S.enHalte && JEU.expedition && JEU.expedition.enCours()) JEU.expedition.noterReponse(q, juste, true);
    return enregistrerVrai.apply(JEU.questions, arguments);
  };

  function remplir(t, v) { return JEU.expedition.remplir(t, v); }
  function ordinal(n) { return n === 1 ? "1re" : n + "e"; }
  function ecranEl() { return document.getElementById("ecran-expedition"); }
  function afficher() { JEU.ui.afficher("expedition"); }
  function minuscule(nom) { return nom.charAt(0).toLowerCase() + nom.slice(1); }
  function conseillerDe(famille) {
    var X = JEU.expedition;
    return JEU.recit.CONSEILLERS[X.MATIERE_FAMILLE[famille] || "histoire"] || JEU.recit.CONSEILLERS.histoire;
  }
  function couleurFamille(famille) {
    var m = JEU.expedition.MATIERE_FAMILLE[famille] || famille;
    return (JEU.MATIERES[m] || { couleur: OR }).couleur;
  }
  function campDuFront(front) { var f = JEU.campagne.front(front); return f ? f.camp : "angleterre"; }
  function evenementDe(id) {
    var X = JEU.expedition;
    if (id === "archives") { var a = X.TEXTES.evenements.archives; return { id: "archives", titre: a.titre, icone: a.icone, texte: a.texte, questions: a.questions }; }
    var ev = JEU.campagne.EVENEMENTS.filter(function (x) { return x.id === id; })[0];
    return ev ? { id: ev.id, titre: ev.titre, icone: ev.icone, texte: TEXTES.evenements[ev.id] || ev.texte, questions: ev.questions } : null;
  }
  function nomHalte(h) {
    var X = JEU.expedition;
    if (h.type === "evenement") { var ev = evenementDe(h.ev); return ev ? ev.titre : X.TEXTES.haltes.evenement; }
    return X.TEXTES.haltes[h.type] || h.type;
  }
  function nomCourt(h) { return h.type === "evenement" ? (COURTS[h.ev] || JEU.expedition.TEXTES.haltes.evenement) : nomHalte(h); }
  function iconeHalte(h) {
    if (h.type === "evenement") { var ev = evenementDe(h.ev); return ev ? ev.icone : "drapeau"; }
    return ICONES[h.type] || "drapeau";
  }
  // Dates d'une semaine du planning (« du 21 au 27 septembre 2026 »), ou "" si le calendrier n'est pas réglé.
  function datesSemaine(s) {
    try {
      var lundi = JEU.calendrier.lundiDe(s), dim = new Date(lundi.getFullYear(), lundi.getMonth(), lundi.getDate() + 6);
      return JEU.calendrier.libelle({ numero: s, lundi: lundi, dimanche: dim }).replace(/^Semaine \d+ · /, "");
    } catch (e) { return ""; }
  }
  function semaineCalendrier() { try { return JEU.calendrier.semaine(new Date()).numero; } catch (e) { return 0; } }

  // ---------- disposition de la route (pure : testée sous Node) ----------
  // d : { bandes: [{ semaine, x, acte | null, etat: courante | passee | avenir | loin | brume }], noeuds: [{ id, x, y, r, type, halte, acte,
  // semaine, couche }], parId, chemins: [{ de, a, x1, y1, x2, y2 }], depart }
  function disposition(e) {
    var X = JEU.expedition, actes = e.route.actes, f = X.frontiere(), iCourant = indexActe(e, e.semaine), bandes = [], noeuds = [], parId = {}, chemins = [];
    actes.forEach(function (a, i) { bandes.push({ semaine: a.semaine, x: X0 + BANDE * i, acte: a, etat: i < iCourant ? "passee" : i === iCourant ? "courante" : "avenir" }); });
    var w = actes[actes.length - 1].semaine + 1, derniere = JEU.calendrier ? JEU.calendrier.DERNIERE : 34;
    while (bandes.length < NB_BANDES && w <= derniere) { bandes.push({ semaine: w, x: X0 + BANDE * bandes.length, acte: null, etat: w <= f ? "loin" : "brume" }); w++; }
    actes.forEach(function (a, i) {
      var bx = X0 + BANDE * i, nb = a.couches.length;
      a.couches.forEach(function (c, k) {
        var n = c.length, cx = bx + (nb > 1 ? COL0 + (COL_FIN - COL0) * k / (nb - 1) : (COL0 + COL_FIN) / 2);
        c.forEach(function (h, j) {
          var g = X.alea(X.hash(e.graine, "pos", h.id));
          var y = Y_MILIEU + (j - (n - 1) / 2) * PAS + Math.round((g() - 0.5) * 6); // gigue ±3 unités, à la graine
          var nd = { id: h.id, x: Math.round(cx), y: y, r: R_HALTE, type: h.type, halte: h, acte: a, semaine: a.semaine, couche: k + 1 };
          noeuds.push(nd); parId[h.id] = nd;
        });
      });
      var g = a.gardien, ng = { id: g.id, x: bx + GARDIEN_X, y: Y_MILIEU, r: R_GARDIEN, type: g.type, halte: g, acte: a, semaine: a.semaine, couche: nb + 1 };
      noeuds.push(ng); parId[g.id] = ng;
    });
    // chemins : départ → 1re couche de la 1re semaine ; halte → suivants ; gardien → 1re couche de la semaine suivante
    var depart = { id: "depart", x: DEPART.x, y: DEPART.y, r: R_DEPART };
    actes.forEach(function (a, i) {
      var source = i === 0 ? depart : parId[actes[i - 1].gardien.id];
      a.couches[0].forEach(function (h) { var b = parId[h.id]; chemins.push({ de: source.id, a: h.id, x1: source.x, y1: source.y, x2: b.x, y2: b.y }); });
    });
    noeuds.forEach(function (nd) {
      (nd.halte.suivants || []).forEach(function (id) { var b = parId[id]; if (b) chemins.push({ de: nd.id, a: id, x1: nd.x, y1: nd.y, x2: b.x, y2: b.y }); });
    });
    return { largeur: L, hauteur: H, bandes: bandes, noeuds: noeuds, parId: parId, chemins: chemins, depart: depart };
  }
  function indexActe(e, semaine) { for (var i = 0; i < e.route.actes.length; i++) if (e.route.actes[i].semaine === semaine) return i; return -1; }
  function plat(acte) { return acte.couches.reduce(function (t, c) { return t.concat(c); }, []); }
  // Haltes jouées d'un acte, dans l'ordre où elles l'ont été (e.faits garde l'ordre d'insertion), gardien compris.
  function sequence(e, acte) {
    var ids = plat(acte).map(function (h) { return h.id; }).concat([acte.gardien.id]);
    return Object.keys(e.faits).filter(function (id) { return ids.indexOf(id) >= 0; });
  }
  function classeFait(fait) { return fait === "echoue" ? "echouee" : "reussie"; }
  // État de chaque nœud (pure) : jouee reussie | jouee echouee | atteignable | avenir | hors | passee | brume.
  function etatsNoeuds(e, d) {
    var X = JEU.expedition, att = X.atteignables().map(function (h) { return h.id; }), etats = {}, futur = {}, file = att.slice(), iCourant = indexActe(e, e.semaine);
    while (file.length) {
      var id = file.shift();
      if (futur[id]) continue;
      futur[id] = true;
      var nd = d.parId[id];
      if (nd) (nd.halte.suivants || []).forEach(function (s) { file.push(s); });
    }
    d.noeuds.forEach(function (nd) {
      var i = indexActe(e, nd.semaine), fait = e.faits[nd.id];
      if (i < iCourant) etats[nd.id] = fait ? "jouee " + classeFait(fait) : "passee";
      else if (i > iCourant) etats[nd.id] = "brume";
      else if (fait) etats[nd.id] = "jouee " + classeFait(fait);
      else if (att.indexOf(nd.id) >= 0) etats[nd.id] = "atteignable";
      else if (futur[nd.id]) etats[nd.id] = "avenir";
      else etats[nd.id] = "hors";
    });
    return etats;
  }
  // État de chaque chemin : pris (parcouru), possible (depuis la halte courante vers une halte atteignable), pale (brume), ordinaire.
  function etatsChemins(e, d, etats) {
    var X = JEU.expedition, pris = {}, iCourant = indexActe(e, e.semaine);
    e.route.actes.forEach(function (a, i) {
      if (i > iCourant) return;
      var seq = sequence(e, a), prec = i === 0 ? "depart" : e.route.actes[i - 1].gardien.id;
      seq.forEach(function (id) { pris[prec + ">" + id] = true; prec = id; });
      // la halte courante entrée mais pas finie (jeu fermé en route) : le chemin qui y mène est pris aussi
      if (i === iCourant && e.position && !e.faits[e.position] && e.position !== prec) pris[prec + ">" + e.position] = true;
    });
    var att = X.atteignables().map(function (h) { return h.id; });
    // le sommet d'où partent les chemins possibles : la dernière halte jouée (ou le départ de la semaine)
    var sommet = e.position && e.faits[e.position] ? e.position : (e.position === null ? (iCourant > 0 ? e.route.actes[iCourant - 1].gardien.id : "depart") : null);
    return d.chemins.map(function (c) {
      if (pris[c.de + ">" + c.a]) return "pris";
      var nd = d.parId[c.a];
      if (nd && etats[nd.id] === "brume") return "pale";
      if (sommet !== null && c.de === sommet && att.indexOf(c.a) >= 0) return "possible";
      if (nd && (etats[nd.id] === "hors" || etats[nd.id] === "passee")) return "hors";
      return "ordinaire";
    });
  }

  // ---------- la carte-itinéraire en SVG ----------
  var nSvg = 0;
  function image(nom) { var s = JEU.SPRITES && JEU.SPRITES[nom]; return s && s.src ? s : null; }
  function courbe(c) {
    var mx = (c.x1 + c.x2) / 2;
    return "M" + c.x1 + " " + c.y1 + " C" + mx + " " + c.y1 + " " + mx + " " + c.y2 + " " + c.x2 + " " + c.y2;
  }
  function texteSVG(x, y, classe, texte, extra) {
    return "<text x='" + x + "' y='" + y + "' class='" + classe + "'" + (extra || "") + ">" + U.echapper(texte) + "</text>";
  }
  // Nappes de brume (les sprites lieu-brume de la carte de campagne) sur une bande ; sous elles, des nuées dessinées (repli).
  function nappes(bx, pleine) {
    var br = image("lieu-brume"), s = "", poses = pleine ? [[70, 118, 1.15], [230, 96, 1.05], [150, 212, 1.2], [268, 236, 1.0], [40, 250, .95]] : [[150, 100, 1.25], [60, 220, 1.1], [250, 200, 1.15]];
    poses.forEach(function (p) {
      s += "<ellipse cx='" + (bx + p[0]) + "' cy='" + p[1] + "' rx='" + (80 * p[2]) + "' ry='" + (34 * p[2]) + "' fill='#d9d2c3' opacity='.55'/>";
    });
    if (br) poses.forEach(function (p) {
      var k = p[2];
      s += "<image class='nappe' href='" + br.src + "' x='" + (bx + p[0] - br.ax * k) + "' y='" + (p[1] - br.ay * k) + "' width='" + (br.w * k) + "' height='" + (br.h * k) + "' opacity='.82'/>";
    });
    return s;
  }
  // Petit écusson de la porte (22 unités) en bas à droite du médaillon : conseiller à la teinte de sa matière, bourse, parchemin, sac.
  function ecussonPorte(porte, x, y) {
    if (!porte) return "";
    var k = "ep" + (++nSvg), teinte, icone;
    if (porte.genre === "faveur") { teinte = couleurFamille(porte.conseiller); icone = conseillerDe(porte.conseiller).icone; }
    else { teinte = porte.genre === "vivres" ? "#4f6b32" : porte.genre === "parchemin" ? "#6b2d5c" : OR_SOMBRE; icone = PORTE_ICONES[porte.genre] || "tresor"; }
    var ecu = "M" + (x - 11) + " " + (y - 11) + "h22v11c0 7-5 10.5-11 13-6-2.5-11-6-11-13z";
    return "<g class='porte-ecusson" + (porte.rare ? " rare" : "") + "' id='" + k + "'><path d='" + ecu + "' fill='" + teinte + "' stroke='" + (porte.rare ? "#c9ccd2" : ENCRE) + "' stroke-width='" + (porte.rare ? 2 : 1.3) + "'/>" +
      JEU.icones.dans(icone, x - 7, y - 8, 14, "#fff8e4") + "</g>";
  }
  // Sceau de cire posé sur une halte jouée : la cire du joueur (bleu de France), ou le plomb quand les murs ont cédé.
  function sceauHalte(x, y, taille, echoue) {
    var k = "sh" + (++nSvg), c = echoue ? ["#6a6e78", "#2f3238", "#a6aab3"] : ["#2d4f94", "#14284f", "#9db2df"], pts = [], r0 = taille / 2;
    for (var i = 0; i < 28; i++) {
      var a = i / 28 * 2 * Math.PI, r = r0 * (0.86 + 0.06 * Math.sin(i * 2.6) + 0.04 * Math.cos(i * 1.7));
      pts.push((x + r * Math.cos(a)).toFixed(1) + " " + (y + r * Math.sin(a)).toFixed(1));
    }
    return "<g class='sceau-halte" + (echoue ? " plomb" : "") + "'><defs><radialGradient id='" + k + "' cx='.38' cy='.32' r='.75'><stop offset='0' stop-color='" + c[2] + "'/><stop offset='.45' stop-color='" + c[0] + "'/><stop offset='1' stop-color='" + c[1] + "'/></radialGradient></defs>" +
      "<path d='M" + pts.join(" L") + "Z' fill='url(#" + k + ")' stroke='" + c[1] + "' stroke-width='1'/>" +
      "<circle cx='" + x + "' cy='" + y + "' r='" + (r0 * 0.56) + "' fill='none' stroke='" + c[1] + "' stroke-width='1.6' opacity='.75'/>" +
      JEU.icones.dans(echoue ? "ecu-brise" : "lys", x - r0 * 0.4, y - r0 * 0.4, r0 * 0.8, c[2]) + "</g>";
  }
  // Médaillon nésté (SVG dans le SVG) d'un gardien : le seigneur rival au tortil, ou le rival du front (portrait s'il en a un).
  function medaillonGardien(nd, e) {
    var C = JEU.campagne, EC = JEU.ecranCampagne, camp = campDuFront(e.front), t = nd.r * 2, x = nd.x - nd.r, y = nd.y - nd.r;
    var p = nd.type === "grand" && C.rivalDe ? C.rivalDe(e.front) : null;
    if (p && p.portrait && p.portrait.fichier) {
      var k = "mg" + (++nSvg);
      return "<defs><clipPath id='" + k + "'><circle cx='" + nd.x + "' cy='" + nd.y + "' r='" + (nd.r - 4) + "'/></clipPath></defs>" +
        "<circle cx='" + nd.x + "' cy='" + nd.y + "' r='" + nd.r + "' fill='" + OR + "' stroke='" + ENCRE + "' stroke-width='1.5'/>" +
        "<image href='" + U.echapper(p.portrait.fichier) + "' x='" + (x + 4) + "' y='" + (y + 4) + "' width='" + (t - 8) + "' height='" + (t - 8) + "' preserveAspectRatio='xMidYMin slice' clip-path='url(#" + k + ")'/>" +
        "<circle cx='" + nd.x + "' cy='" + nd.y + "' r='" + (nd.r - 4) + "' fill='none' stroke='" + ENCRE + "' stroke-width='1.2'/>";
    }
    var svg = EC && EC.medaillonHeraldique ? EC.medaillonHeraldique(camp, nd.type !== "grand") : "";
    return svg.replace("<svg viewBox='0 0 100 100'", "<svg x='" + x + "' y='" + y + "' width='" + t + "' height='" + t + "' viewBox='0 0 100 100'");
  }
  function libelleEtat(etat) {
    if (/reussie/.test(etat)) return TEXTES.etats.reussi;
    if (/echouee/.test(etat)) return TEXTES.etats.echoue;
    return "";
  }
  function ariaHalte(nd, etat, touche) {
    var X = JEU.expedition, h = nd.halte, parts = ["Semaine " + nd.semaine];
    parts.push(h.type === "gardien" || h.type === "grand" ? nomHalte(h) : remplir(TEXTES.route.couche, { C: ordinal(nd.couche) }) + " : " + minuscule(nomHalte(h)));
    if (h.porte) parts.push(remplir(TEXTES.route.recompense, { P: minuscule(X.nomPorte(h.porte)) }));
    if (etat === "atteignable" && touche) parts.push(remplir(TEXTES.route.touche, { T: touche }));
    if (/jouee/.test(etat)) parts.push(libelleEtat(etat));
    return parts.join(", ");
  }

  function carteSVG(e, d, etats) {
    var X = JEU.expedition, att = X.atteignables().map(function (h) { return h.id; }), chemins = etatsChemins(e, d, etats), semCal = semaineCalendrier();
    var s = "<svg viewBox='0 0 " + L + " " + H + "' class='route-svg' role='group' aria-label='" + U.echapper(TEXTES.route.titre) + "'>" +
      "<defs><radialGradient id='parchR' cx='.5' cy='.5' r='.75'><stop offset='0' stop-color='#f6eedb'/><stop offset='1' stop-color='#e2d3ad'/></radialGradient>" +
      "<filter id='ombreR'><feDropShadow dx='1' dy='2' stdDeviation='1.5' flood-color='#000' flood-opacity='.45'/></filter></defs>" +
      "<rect width='" + L + "' height='" + H + "' fill='url(#parchR)'/>";
    // bandes : lettrine rubriquée, dates, filets, brume
    d.bandes.forEach(function (b, i) {
      var bx = b.x, brume = b.etat === "brume" || b.etat === "avenir";
      if (i > 0) s += "<path d='M" + (bx - 8) + " 12V" + (H - 12) + "' stroke='" + OR + "' stroke-width='1' stroke-dasharray='3 5' opacity='.6'/>";
      s += "<g class='bande " + b.etat + "'>" + texteSVG(bx + 8, 42, "lettrine" + (brume ? " brume" : ""), "S" + b.semaine);
      var dates = datesSemaine(b.semaine);
      if (dates && !brume) s += texteSVG(bx + 62, 40, "dates-semaine", dates);
      if (b.etat === "loin") s += texteSVG(bx + 62, 40, "dates-semaine", TEXTES.route.loin) + "<path d='M" + (bx + 10) + " " + Y_MILIEU + "H" + (bx + BANDE - 20) + "' stroke='" + ENCRE + "' stroke-width='2.4' stroke-dasharray='2 7' stroke-linecap='round' opacity='.3'/>";
      if (b.etat === "brume") s += texteSVG(bx + 62, 40, "dates-semaine brume", TEXTES.route.brume);
      if (b.etat === "avenir") s += texteSVG(bx + 62, 40, "dates-semaine brume", dates || TEXTES.route.brume);
      s += "<path d='M" + (bx + 6) + " 50H" + (bx + BANDE - 16) + "' stroke='" + OR + "' stroke-width='1.2' opacity='.7'/></g>";
    });
    // chemins
    d.chemins.forEach(function (c, i) {
      var et = chemins[i];
      if (et === "pris") s += "<path d='" + courbe(c) + "' fill='none' stroke='" + OR_SOMBRE + "' stroke-width='5' stroke-linecap='round' opacity='.9'/><path d='" + courbe(c) + "' fill='none' stroke='" + OR_CLAIR + "' stroke-width='2.2' stroke-linecap='round'/>";
      else s += "<path class='chemin " + et + "' d='" + courbe(c) + "' fill='none' stroke='" + ENCRE + "' stroke-width='2.4' stroke-dasharray='2 7' stroke-linecap='round' opacity='" + (et === "possible" ? ".95" : et === "pale" ? ".2" : et === "hors" ? ".3" : ".55") + "'/>";
    });
    // le départ : le bourg de France (sprite de la carte de campagne), sinon un médaillon au lys
    var sp = image("lieu-france"), dx = d.depart.x, dy = d.depart.y;
    if (sp) { var k = 0.62; s += "<image href='" + sp.src + "' x='" + (dx - sp.ax * k) + "' y='" + (dy + 14 - sp.ay * k) + "' width='" + (sp.w * k) + "' height='" + (sp.h * k) + "'/>"; }
    else s += "<circle cx='" + dx + "' cy='" + dy + "' r='" + R_DEPART + "' fill='#24407a' stroke='" + OR + "' stroke-width='3'/>" + JEU.icones.dans("lys", dx - 13, dy - 13, 26, OR_CLAIR);
    s += texteSVG(dx, dy + 44, "halte-nom", TEXTES.route.depart);
    // les haltes ; leurs noms vont dans une couche à part, dessinée après tous les médaillons (le halo d'un gardien ne
    // couvre jamais le nom d'une voisine ; le nom garde l'estompage de sa halte par sa classe)
    var etiquettes = "";
    d.noeuds.forEach(function (nd) {
      var et = etats[nd.id], h = nd.halte, gardien = h.type === "gardien" || h.type === "grand", x = nd.x, y = nd.y, r = nd.r;
      var touche = att.indexOf(nd.id) >= 0 ? String(att.indexOf(nd.id) + 1) : null;
      var brume = et === "brume", classeNom = "halte-nom " + et.split(" ")[0];
      s += "<g class='halte " + et + (gardien ? " gardien" : "") + "' data-id='" + nd.id + "' data-type='" + h.type + "' tabindex='" + (et === "atteignable" ? 0 : -1) + "'" +
        (et === "atteignable" ? " role='button'" : "") + " aria-label='" + U.echapper(ariaHalte(nd, et, touche)) + "'><title>" + U.echapper(ariaHalte(nd, et, touche)) + "</title>";
      if (et === "atteignable") s += "<g class='halo'><circle cx='" + x + "' cy='" + y + "' r='" + (r + 8) + "' fill='none' stroke='#1c120a' stroke-width='7' opacity='.4'/><circle class='halo-or' cx='" + x + "' cy='" + y + "' r='" + (r + 8) + "' fill='none' stroke='" + OR_CLAIR + "' stroke-width='4'/></g>";
      if (gardien) {
        s += "<g class='corps' filter='url(#ombreR)'>" + medaillonGardien(nd, e) + "</g>";
        if (h.type === "grand") etiquettes += texteSVG(x, y + r + 17, classeNom, TEXTES.route.grand.split(" ")[0]) + texteSVG(x, y + r + 33, classeNom, TEXTES.route.grand.split(" ").slice(1).join(" "));
        else etiquettes += texteSVG(x, y + r + 17, classeNom, TEXTES.route.gardien);
        if (!brume && h.type === "gardien" && h.porte) s += ecussonPorte(h.porte, x + 24, y + 20);
      } else {
        s += "<g class='corps' filter='url(#ombreR)'><circle cx='" + x + "' cy='" + y + "' r='" + r + "' fill='" + OR + "' stroke='" + ENCRE + "' stroke-width='1.6'/>" +
          "<circle cx='" + x + "' cy='" + y + "' r='" + (r - 3.5) + "' fill='none' stroke='" + ENCRE + "' stroke-width='1' stroke-dasharray='.1 3' stroke-linecap='round'/>" +
          "<circle cx='" + x + "' cy='" + y + "' r='" + (r - 6) + "' fill='" + (brume ? "#9a927f" : "#f7efdc") + "' stroke='" + ENCRE + "' stroke-width='1.2'/>" +
          (brume ? "" : JEU.icones.dans(iconeHalte(h), x - 14, y - 14, 28, h.type === "embuscade" ? RUBRIQUE : ENCRE)) + "</g>";
        // le nom : au-dessus du médaillon dans les colonnes impaires, dessous dans les paires (deux voisines n'ont jamais leurs noms
        // sur la même ligne, et le nom de la dernière colonne reste hors du halo du gardien)
        if (!brume) etiquettes += texteSVG(x, nd.couche % 2 === 1 ? y - r - 7 : y + r + 15, classeNom, nomCourt(h));
        if (!brume && h.porte) s += ecussonPorte(h.porte, x + 17, y + 15);
      }
      if (/jouee/.test(et)) s += sceauHalte(x + (gardien ? 10 : 6), y - (gardien ? 10 : 6), gardien ? 36 : 32, /echouee/.test(et));
      if (touche) s += "<g class='touche-halte'><circle cx='" + (x - r + 3) + "' cy='" + (y - r + 3) + "' r='11' fill='#8e3424' stroke='#f6e7bf' stroke-width='1.5'/>" + texteSVG(x - r + 3, y - r + 8, "txt-touche", touche) + "</g>";
      s += "</g>";
    });
    s += "<g class='etiquettes' aria-hidden='true'>" + etiquettes + "</g>";
    // brume : sur les semaines suivantes de l'expédition et sur tout ce qui dépasse la frontière
    d.bandes.forEach(function (b) {
      if (b.etat !== "brume" && b.etat !== "avenir") return;
      s += "<g class='brume-bande'><rect x='" + (b.x + 2) + "' y='56' width='" + (BANDE - 12) + "' height='" + (H - 60) + "' fill='" + FOND + "' opacity='.42'/>" + nappes(b.x, b.etat === "brume") + "</g>";
    });
    // la bannière « Cette semaine » plantée au bord droit de la semaine du calendrier, le drap vers la gauche : la hampe
    // ne traverse ni la lettrine ni les dates (qui vont de la gauche de la bande jusqu'au milieu)
    d.bandes.forEach(function (b) {
      if (b.semaine !== semCal) return;
      var bx = b.x + BANDE - 22;
      s += "<g class='banniere-cette'><path d='M" + bx + " 8v38' stroke='" + ENCRE + "' stroke-width='2'/><path d='M" + (bx - 2) + " 10h-134l8 9-8 9h134z' fill='" + RUBRIQUE + "' stroke='" + ENCRE + "' stroke-width='1'/>" +
        texteSVG(bx - 126, 24, "txt-banniere", TEXTES.annee.cette) + "</g>";
    });
    return s + "</svg>";
  }
  // Une nappe de brume qui ne se charge pas est retirée (les nuées dessinées restent).
  function surveillerImages(zone) {
    Array.prototype.forEach.call(zone.querySelectorAll("image"), function (im) { im.addEventListener("error", function () { im.remove(); }); });
  }

  // ---------- parchemin de l'année (écran de départ) ----------
  function parcheminAnnee(x, frontiere, ouverts, relais, semaines, semCal) {
    var X = JEU.expedition, derniere = JEU.calendrier ? JEU.calendrier.DERNIERE : 34, w = 27, gap = 1, x0 = 16, y0 = 40, h = 34, ouvertes = X.semainesOuvertes();
    var s = "<svg viewBox='0 0 1000 104' class='annee-svg' role='group' aria-label='" + U.echapper(TEXTES.annee.titre) + "'>";
    for (var i = 1; i <= derniere; i++) {
      var cx = x0 + (i - 1) * (w + gap) + (i > frontiere ? 6 : 0), brume = i > frontiere, franchie = x.franchies.indexOf(i) >= 0, ouvert = ouverts.indexOf(i) >= 0, dans = semaines.indexOf(i) >= 0, trou = !brume && ouvertes.indexOf(i) < 0;
      s += "<g class='case" + (brume ? " brume" : "") + (ouvert ? " relais" : "") + (i === relais ? " choisi" : "") + (franchie ? " franchie" : "") + "' data-semaine='" + i + "'" + (ouvert ? " tabindex='-1' role='button'" : "") + ">";
      s += "<rect x='" + cx + "' y='" + y0 + "' width='" + w + "' height='" + h + "' rx='2' fill='" + (brume ? "#cfc7b6" : dans ? "#f3e4b6" : "#f7efdc") + "' stroke='" + (brume ? "#9a927f" : ENCRE) + "' stroke-width='" + (brume ? 0.8 : 1) + "'" + (trou ? " stroke-dasharray='2 2'" : "") + "/>";
      if (franchie) s += sceauHalte(cx + w / 2, y0 + h / 2, 26, false);
      s += texteSVG(cx + w / 2, y0 + h / 2 + 5, "txt-case" + (brume ? " brume" : "") + (franchie ? " sur-sceau" : ""), String(i));
      if (ouvert) s += "<rect x='" + (cx - 2) + "' y='" + (y0 - 2) + "' width='" + (w + 4) + "' height='" + (h + 4) + "' rx='3' fill='none' stroke='" + (i === relais ? OR_CLAIR : OR) + "' stroke-width='" + (i === relais ? 3.5 : 2) + "'/>";
      if (i === relais) s += "<path d='M" + (cx + w / 2 - 7) + " " + (y0 + h + 14) + "h14l-7-9z' fill='" + RUBRIQUE + "'/>";
      s += "</g>";
    }
    if (semaines.length) {
      var a = x0 + (semaines[0] - 1) * (w + gap), b = x0 + (semaines[semaines.length - 1] - 1) * (w + gap) + w;
      s += "<path d='M" + a + " " + (y0 + h + 4) + "H" + b + "' stroke='" + OR + "' stroke-width='3'/>";
    }
    if (frontiere >= 1 && frontiere < derniere) {
      var fx = x0 + frontiere * (w + gap) + 2;
      s += "<path d='M" + fx + " " + (y0 - 14) + "V" + (y0 + h + 10) + "' stroke='" + RUBRIQUE + "' stroke-width='2' stroke-dasharray='4 3'/>" + texteSVG(fx + 4, y0 + h + 22, "txt-legende", TEXTES.annee.frontiere);
    }
    if (semCal >= 1 && semCal <= derniere) {
      var bx = x0 + (semCal - 1) * (w + gap) + w / 2 + (semCal > frontiere ? 6 : 0), gauche = bx + 142 > 990;
      s += "<g class='banniere-cette'><path d='M" + bx + " 6v34' stroke='" + ENCRE + "' stroke-width='2'/>" +
        (gauche ? "<path d='M" + (bx - 2) + " 8h-134l8 9-8 9h134z' fill='" + RUBRIQUE + "' stroke='" + ENCRE + "'/>" + texteSVG(bx - 128, 22, "txt-banniere", TEXTES.annee.cette)
          : "<path d='M" + (bx + 2) + " 8h134l-8 9 8 9H" + (bx + 2) + "z' fill='" + RUBRIQUE + "' stroke='" + ENCRE + "'/>" + texteSVG(bx + 10, 22, "txt-banniere", TEXTES.annee.cette)) + "</g>";
    }
    return s + "</svg>";
  }

  // ---------- l'écu de l'Armorial ----------
  var QUARTIERS_ECU = { vivres: "M10 10h40v40H10z", bourse: "M50 10h40v40H50z", murs: "M10 50h40v30c0 8 8 16 20 22V50z", banniere: "M50 50h40v30c0 8-8 16-20 22V50z", ouverture: "M50 36l14 24-14 24-14-24z" };
  var TEINTES_ECU = { vivres: "#4f6b32", bourse: "#b5772b", murs: "#2f5a8a", banniere: "#8c2f39", ouverture: "#6b2d5c" };
  function ecuArmorial(arm, taille) {
    var s = "<svg viewBox='0 0 100 110' width='" + (taille || 120) + "' height='" + Math.round((taille || 120) * 1.1) + "' class='ecu-armorial' aria-hidden='true'>" +
      "<path d='M6 6h88v48c0 30-22 48-44 56C28 102 6 84 6 54z' fill='#f7efdc' stroke='" + ENCRE + "' stroke-width='2.5'/>";
    Object.keys(QUARTIERS_ECU).forEach(function (q) {
      var r = arm[q] || 0, max = JEU.expedition.EXP.ARMORIAL[q] ? JEU.expedition.EXP.ARMORIAL[q].prix.length : 1;
      s += "<path d='" + QUARTIERS_ECU[q] + "' fill='" + TEINTES_ECU[q] + "' fill-opacity='" + (r ? 0.35 + 0.65 * r / max : 0.08) + "' stroke='" + ENCRE + "' stroke-width='1'/>";
    });
    return s + "<path d='M6 6h88v48c0 30-22 48-44 56C28 102 6 84 6 54z' fill='none' stroke='" + OR + "' stroke-width='1.5' transform='translate(50 55) scale(.9) translate(-50 -55)'/></svg>";
  }

  // ---------- cartouche « Ta compagnie » et journal de route ----------
  function sac(plein) {
    return "<svg viewBox='0 0 20 24' width='18' height='22' class='sac" + (plein ? " plein" : "") + "' aria-hidden='true'><path d='M6 5h8l2 4c3 3 3 9 1 13H3C1 17 1 11 4 9z' fill='" + (plein ? "#c9a14a" : "#efe6d2") + "' stroke='" + ENCRE + "' stroke-width='1.6'/><path d='M7 5c1-2.4 5-2.4 6 0' fill='none' stroke='" + ENCRE + "' stroke-width='1.6'/></svg>";
  }
  function medaillonFaveur(c, taille) {
    return "<span class='faveur-med rang-" + (c.rang || 1) + "' style='--teinte:" + couleurFamille(c.famille) + ";--t:" + (taille || 34) + "px' title='" + U.echapper(c.nom + " (" + c.rangNom + ") : " + c.texte) + "'>" + JEU.icones.icone(c.icone, Math.round((taille || 34) * 0.58)) + "</span>";
  }
  function journalDeRoute(e) {
    var X = JEU.expedition, lignes = [];
    e.route.actes.forEach(function (a) {
      sequence(e, a).forEach(function (id) {
        var t = X.trouverHalte(id, e);
        if (t) lignes.push("Semaine " + a.semaine + " · " + nomHalte(t.halte) + " : " + (TEXTES.etats[e.faits[id]] || TEXTES.etats.fait) + ".");
      });
    });
    return lignes.slice(-10).reverse();
  }
  function cartoucheCompagnie(e, x) {
    var X = JEU.expedition, el = JEU.ui.el, T = TEXTES.compagnie, sacs = "";
    for (var i = 0; i < e.vivresMax; i++) sacs += sac(i < e.vivres);
    var tenues = X.faveursTenues();
    var notes = [];
    if (e.plan) notes.push(remplir(T.plan, { V: e.plan }));
    if (e.espion) notes.push(T.espion);
    notes.push(remplir(T.vitesse, { V: e.vitesse }) + " · " + remplir(T.graine, { G: X.hex(e.graine) }));
    return el("div", { class: "cartouche compagnie" }, [
      el("h3", { html: JEU.icones.icone("camp", 20) + " " + U.echapper(T.titre) }),
      el("div", { class: "cp-ligne" }, [el("span", { class: "cp-sacs", html: sacs, "aria-hidden": "true" }), el("b", { texte: T.vivres + " " + e.vivres + " / " + e.vivresMax }),
        el("span", { class: "cp-or", html: JEU.icones.icone("tresor", 20) + " <b>" + e.or + "</b> " + U.echapper(T.or) })]),
      el("p", { class: "cp-renom", html: U.echapper(T.renom) + " <b>" + e.compte.renom + "</b> <span class='note'>(" + x.renomTotal + " " + U.echapper(T.total) + ")</span>" }),
      el("div", { class: "cp-faveurs" }, [el("span", { class: "cp-titre", texte: T.faveurs + " : " })].concat(tenues.length ? tenues.map(function (c) { return el("span", { html: medaillonFaveur(c, 34) }); }) : [el("i", { texte: T.aucuneFaveur })])),
      el("p", { class: "note cp-notes", texte: notes.join(" ") })
    ]);
  }
  function cartoucheJournal(e) {
    var el = JEU.ui.el, lignes = journalDeRoute(e);
    return el("div", { class: "cartouche journal-route" }, [
      el("h3", { html: JEU.icones.icone("parchemin-plume", 20) + " " + U.echapper(TEXTES.compagnie.journal) }),
      lignes.length ? el("ul", { class: "chronique" }, lignes.map(function (t) { return el("li", { texte: t }); })) : el("p", { class: "note", texte: TEXTES.compagnie.journalVide })
    ]);
  }
  function enTeteRoute(e, acte) {
    var X = JEU.expedition, el = JEU.ui.el, C = JEU.campagne, f = C.front(e.front);
    return el("div", { class: "exp-tete" }, [
      el("h1", { class: "titre-ecran", texte: TEXTES.route.titre }),
      el("p", { class: "exp-sous", texte: remplir(TEXTES.route.sous, { S: e.semaine, F: X.TEXTES.fronts[e.front] || (f ? f.nom : ""), H: ordinal(X.haltesJouees(e) + 1) }) })
    ]);
  }
  function cadreEcran(s, e, contenu, options) {
    var el = JEU.ui.el, x = JEU.expedition.etat();
    s.innerHTML = "";
    s.appendChild(enTeteRoute(e));
    s.appendChild(contenu);
    if (options && options.boutons) s.appendChild(options.boutons);
    s.appendChild(el("div", { class: "exp-bas" }, [cartoucheCompagnie(e, x), cartoucheJournal(e)]));
  }

  // ---------- l'écran : aiguillage ----------
  JEU.ui.ecrans.expedition = function (s) {
    var X = JEU.expedition;
    if (!X) { s.innerHTML = ""; return; }
    S.enHalte = false;
    if (S.bilan) return rendreBilan(s, S.bilan);
    // une bataille de route vient de clore l'expédition (Grand Gardien vaincu, dernier vivre perdu) : l'expédition n'est
    // déjà plus en cours, le bilan rendu par apresBataille ou quitter s'affiche avant tout
    if (S.suite) {
      var su = S.suite; S.suite = null;
      if (su.fini) { S.bilan = su.fini; return rendreBilan(s, su.fini); }
    }
    var e = X.enCours();
    if (!e) return rendreDepart(s);
    // reprise : une bataille entamée puis le jeu fermé coûte un vivre (une fois) ; plus de vivres → le bilan
    var rep = X.reprendre();
    if (rep && rep.vivrePerdu) S.toast = TEXTES.fin.vivrePerdu;
    if (rep && rep.fini) { S.bilan = rep.fini; return rendreBilan(s, rep.fini); }
    e = X.enCours();
    if (!e) return rendreDepart(s);
    if (e.offre && e.offre.cartes.length) return e.offre.question ? rendrePorte(s, e) : rendreCartes(s, e, e.offre, null);
    if (e.position === null && S.pageVue !== e.semaine) return rendrePageSemaine(s, e);
    return rendreRoute(s, e);
  };

  // ---------- l'écran de départ ----------
  function rendreDepart(s) {
    var X = JEU.expedition, C = JEU.campagne, EC = JEU.ecranCampagne, el = JEU.ui.el, x = X.etat(), cfg = X.reglages(), T = TEXTES.depart;
    var f = X.frontiere(), ouverts = X.relais();
    s.innerHTML = "";
    s.appendChild(el("h1", { class: "titre-ecran", texte: T.titre }));
    if (!f || !ouverts.length) {
      s.appendChild(el("p", { class: "exp-souverain", texte: T.attente }));
      s.appendChild(el("div", { class: "actions centre" }, [el("button", { class: "bouton", onclick: function () { JEU.ui.afficher("jouer"); }, texte: T.retour + " (Échap)" })]));
      JEU.ui.clavier = function (k) { if (k === "Escape" || k === "Enter") { JEU.ui.afficher("jouer"); return true; } return false; };
      return;
    }
    if (S.relais === null || ouverts.indexOf(S.relais) < 0) S.relais = X.relaisDefaut();
    if (!C.front(S.front)) S.front = C.FRONTS[0].id;
    var semaines = X.semainesDepuis(S.relais, cfg.semaines), semCal = semaineCalendrier();
    s.appendChild(el("p", { class: "exp-sous", texte: T.sous }));
    var annee = el("div", { class: "parchemin-annee", html: parcheminAnnee(x, f, ouverts, S.relais, semaines, semCal) });
    s.appendChild(annee);
    Array.prototype.forEach.call(annee.querySelectorAll(".case.relais"), function (g) {
      g.addEventListener("click", function () { S.relais = parseInt(g.getAttribute("data-semaine"), 10); rendreDepart(s); });
    });
    s.appendChild(el("p", { class: "note centre annee-legende", texte: TEXTES.annee.legende }));
    s.appendChild(el("p", { class: "exp-souverain", texte: X.phraseDepart(S.relais) }));
    var colonnes = el("div", { class: "depart-colonnes" });
    // le relais : flèches, cours ouverts de la semaine de départ
    var iR = ouverts.indexOf(S.relais);
    var cours = X.coursDeSemaine(S.relais).map(function (id) { var p = JEU.progression.entree(id); return { id: id, titre: p ? p.titre : id, matiere: U.matiereDe(id) }; });
    colonnes.appendChild(el("div", { class: "cartouche depart-relais" }, [
      el("h3", { html: JEU.icones.icone("relais", 20) + " " + U.echapper(T.relais) }),
      el("div", { class: "relais-choix" }, [
        el("button", { class: "bouton petit", disabled: iR <= 0, "aria-label": "Relais précédent", onclick: function () { S.relais = ouverts[iR - 1]; rendreDepart(s); }, texte: "←" }),
        el("b", { class: "relais-numero", texte: "Semaine " + S.relais }),
        el("button", { class: "bouton petit", disabled: iR >= ouverts.length - 1, "aria-label": "Relais suivant", onclick: function () { S.relais = ouverts[iR + 1]; rendreDepart(s); }, texte: "→" })
      ]),
      el("p", { class: "note", texte: T.relaisAide + " " + (datesSemaine(S.relais) ? "Du " + datesSemaine(S.relais).replace(/^du /, "") + "." : "") }),
      el("p", { class: "cp-titre", texte: remplir(T.ouverts, { S: S.relais }) }),
      cours.length ? el("ul", { class: "liste-cours-semaine" }, cours.map(function (c) {
        return el("li", {}, [el("span", { class: "pastille", style: "--teinte:" + (JEU.MATIERES[c.matiere] || { couleur: OR }).couleur, texte: (JEU.MATIERES[c.matiere] || { nom: "" }).nom }), document.createTextNode(" " + c.titre)]);
      })) : el("p", { class: "note", texte: T.aucunOuvert })
    ]));
    // le front : deux écus
    var fronts = el("div", { class: "cartouche depart-front" }, [el("h3", { html: JEU.icones.icone("drapeau", 20) + " " + U.echapper(T.front) })]);
    C.FRONTS.forEach(function (fr, i) {
      var rival = C.rivalDe(fr.id), camp = C.CAMPS[fr.camp];
      var b = el("button", { class: "choix-front camp-" + fr.camp + (fr.id === S.front ? " choisi" : ""), "aria-pressed": fr.id === S.front ? "true" : "false", onclick: function () { S.front = fr.id; rendreDepart(s); } }, [
        el("span", { class: "touche", texte: String(i + 1) }),
        el("span", { html: EC ? EC.medaillon(rival, 50) : "" }),
        el("span", { class: "cf-texte" }, [el("b", { texte: fr.nom }), el("span", { texte: remplir(T.contre, { C: camp.nom }) }), el("i", { texte: remplir(T.grand, { G: rival.nom }) })])
      ]);
      fronts.appendChild(b);
    });
    if (EC) EC.surveillerPortraits(fronts);
    colonnes.appendChild(fronts);
    // la compagnie : vivres, durée, renommée, Armorial
    var vivres = Math.min(X.EXP.VIVRES_MAX, cfg.vivres + (x.armorial.vivres || 0)), minutes = X.dureeEstimee(semaines, cfg.vitesse);
    var sacs = ""; for (var i = 0; i < vivres; i++) sacs += sac(true);
    colonnes.appendChild(el("div", { class: "cartouche depart-compagnie" }, [
      el("h3", { html: JEU.icones.icone("camp", 20) + " " + U.echapper(T.compagnie) }),
      el("div", { class: "cp-ligne" }, [el("span", { class: "cp-sacs", html: sacs, "aria-hidden": "true" }), el("b", { texte: remplir(T.vivres, { V: vivres }) })]),
      el("p", { texte: remplir(T.duree, { M: minutes }) }),
      el("p", { texte: remplir(T.renom, { D: x.renom, T: x.renomTotal }) }),
      el("p", { class: "note", texte: x.franchies.length ? remplir(T.franchies, { F: x.franchies.join(", ") }) : T.aucuneFranchie }),
      el("div", { class: "depart-armorial" }, [el("span", { html: ecuArmorial(x.armorial, 72) }), el("button", { class: "bouton petit", onclick: function () { rendreArmorial(s); }, texte: T.armorial + " (A)" })])
    ]));
    s.appendChild(colonnes);
    var partir = el("button", { class: "bouton principal", onclick: function () { partirExpedition(); }, texte: T.partir + " (Entrée)" });
    s.appendChild(el("div", { class: "actions centre exp-actions" }, [partir,
      el("button", { class: "bouton", onclick: function () { rendreArmorial(s); }, texte: T.armorial + " (A)" }),
      el("button", { class: "bouton discret", onclick: function () { JEU.ui.afficher("jouer"); }, texte: T.retour + " (Échap)" })]));
    // la chronique des dernières expéditions
    var hist = x.historique.slice(0, 5);
    s.appendChild(el("div", { class: "cartouche chronique-exp" }, [
      el("h3", { html: JEU.icones.icone("trophee", 20) + " " + U.echapper(T.chronique) }),
      hist.length ? el("ul", { class: "chronique" }, hist.map(function (h) {
        var issue = X.TEXTES.bilan[h.issue] || h.issue, sem = h.semaines && h.semaines.length ? (h.semaines.length > 1 ? "semaines " + h.semaines[0] + " à " + h.semaines[h.semaines.length - 1] : "semaine " + h.semaines[0]) : "";
        return el("li", { texte: h.le + " · " + sem + " · " + issue + " · renommée " + h.renom + " · " + remplir(TEXTES.compagnie.graine, { G: X.hex(h.graine || 0) }) });
      })) : el("p", { class: "note", texte: T.aucune })
    ]));
    JEU.ui.clavier = function (k) {
      if (k === "Enter") { partirExpedition(); return true; }
      if (k === "Escape") { JEU.ui.afficher("jouer"); return true; }
      if (k === "a" || k === "A") { rendreArmorial(s); return true; }
      if (k === "ArrowLeft" && iR > 0) { S.relais = ouverts[iR - 1]; rendreDepart(s); return true; }
      if (k === "ArrowRight" && iR < ouverts.length - 1) { S.relais = ouverts[iR + 1]; rendreDepart(s); return true; }
      var n = parseInt(k, 10);
      if (n >= 1 && n <= C.FRONTS.length) { S.front = C.FRONTS[n - 1].id; rendreDepart(s); return true; }
      return false;
    };
    if (JEU.ui.focusAuClavier()) partir.focus();
  }
  function partirExpedition() {
    var X = JEU.expedition, e = X.commencer(S.relais, S.front);
    if (!e) { JEU.ui.toast(TEXTES.depart.attente); return; }
    S.pageVue = null; S.bilan = null; S.suite = null;
    JEU.sons.jouer("sceau");
    afficher();
  }

  // ---------- l'Armorial (fenêtre de l'écran de départ) ----------
  function rendreArmorial(s) {
    var X = JEU.expedition, el = JEU.ui.el, x = X.etat(), T = TEXTES.armorial, quartiers = X.armorial.quartiers();
    s.innerHTML = "";
    s.appendChild(el("h1", { class: "titre-ecran", texte: T.titre }));
    s.appendChild(el("p", { class: "exp-sous", texte: T.sous }));
    var boite = el("div", { class: "exp-fenetre armorial" }, [
      el("div", { class: "armorial-ecu", html: ecuArmorial(x.armorial, 150) }),
      el("div", { class: "armorial-lignes" }, [el("p", { class: "grand", texte: remplir(T.renom, { R: x.renom }) })].concat(quartiers.map(function (q, i) {
        return el("div", { class: "ligne-armorial" + (q.rang ? " tenu" : ""), style: "--teinte:" + TEINTES_ECU[q.id] }, [
          el("span", { class: "touche", texte: String(i + 1) }),
          el("div", {}, [el("b", { texte: q.nom + " · " + (q.rang >= q.rangs ? T.complet : remplir(T.rang, { A: q.rang, B: q.rangs })) }), el("p", { class: "note", texte: q.texte })]),
          q.prix === null ? el("span", { class: "etat", texte: T.complet }) : el("button", { class: "bouton petit" + (q.possible ? " principal" : ""), disabled: !q.possible, onclick: function () { acheterQuartier(s, q.id); }, texte: remplir(T.acheter, { P: q.prix }) })
        ]);
      })))
    ]);
    s.appendChild(boite);
    var fermer = el("button", { class: "bouton", onclick: function () { rendreDepart(s); }, texte: T.fermer + " (Échap)" });
    s.appendChild(el("div", { class: "actions centre" }, [fermer]));
    JEU.ui.clavier = function (k) {
      if (k === "Escape" || k === "Enter") { rendreDepart(s); return true; }
      var n = parseInt(k, 10);
      if (n >= 1 && n <= quartiers.length) { acheterQuartier(s, quartiers[n - 1].id); return true; }
      return false;
    };
    if (JEU.ui.focusAuClavier()) { var b = boite.querySelector("button:not([disabled])"); (b || fermer).focus(); }
  }
  function acheterQuartier(s, id) {
    var X = JEU.expedition;
    if (!X.armorial.acheter(id)) { JEU.ui.toast(TEXTES.marchand.pasAssez); return; }
    JEU.sons.jouer("construction");
    JEU.ui.toast(remplir(TEXTES.armorial.achete, { Q: X.EXP.ARMORIAL[id].nom }));
    rendreArmorial(s);
  }

  // ---------- la page de semaine ----------
  function rendrePageSemaine(s, e) {
    var X = JEU.expedition, C = JEU.campagne, EC = JEU.ecranCampagne, el = JEU.ui.el, acte = X.acteCourant(e), T = TEXTES.semaine;
    S.pageVue = e.semaine;
    var entrees = JEU.donnees.planning.filter(function (p) { return p.type === "cours" && p.semaine === e.semaine; })
      .sort(function (a, b) { return JEU.ORDRE_MATIERES.indexOf(a.matiere) - JEU.ORDRE_MATIERES.indexOf(b.matiere) || a.ordre - b.ordre; });
    var i = indexActe(e, e.semaine), precedente = i > 0 ? e.route.actes[i - 1].semaine : e.depart - 1, sautees = [];
    for (var w = precedente + 1; w < e.semaine; w++) sautees.push(w);
    var grand = acte.gardien.type === "grand", rival = grand && C.rivalDe ? C.rivalDe(e.front) : null;
    var page = el("div", { class: "exp-fenetre page-semaine" }, [
      el("div", { class: "ps-tete" }, [el("span", { class: "lettrine-html", texte: "S" + e.semaine }), el("div", {}, [
        el("h2", { texte: remplir(X.TEXTES.semaine.titre, { S: e.semaine }) }), el("p", { class: "ps-dates", texte: datesSemaine(e.semaine) })])]),
      el("p", { class: "ps-fenetre", texte: X.texteFenetre(acte) }),
      sautees.length ? el("p", { class: "note", texte: remplir(T.sautees, { S: sautees.join(", ") }) }) : null,
      el("h3", { texte: T.cours }),
      entrees.length ? el("ul", { class: "liste-cours-semaine" }, entrees.map(function (p) {
        var ouvert = !!U.coursCharge(p.id), m = JEU.MATIERES[p.matiere] || { nom: "", couleur: OR };
        return el("li", { class: ouvert ? "" : "brume" }, [el("span", { class: "pastille", style: "--teinte:" + m.couleur, texte: m.nom }), el("span", { class: ouvert ? "" : "titre-brume", texte: " " + p.titre }), ouvert ? null : el("i", { class: "note", texte: " · " + T.aVenir })]);
      })) : el("p", { class: "note", texte: T.aucunCours }),
      el("div", { class: "ps-gardien" }, [
        el("span", { html: EC ? (rival ? EC.medaillon(rival, 60) : EC.medaillon({ camp: campDuFront(e.front), generique: true }, 60)) : "" }),
        el("p", { texte: grand ? remplir(X.TEXTES.semaine.grand, { G: rival ? rival.nom : "Un seigneur rival" }) : remplir(X.TEXTES.semaine.gardien, { S: e.semaine }) })
      ])
    ]);
    if (EC) EC.surveillerPortraits(page);
    var bouton = el("button", { class: "bouton principal", onclick: function () { rendreRoute(s, X.enCours()); }, texte: T.enRoute + " (Entrée)" });
    cadreEcran(s, e, page, { boutons: el("div", { class: "actions centre exp-actions" }, [bouton]) });
    JEU.ui.clavier = function (k) { if (k === "Enter") { rendreRoute(s, X.enCours()); return true; } if (k === "Escape") { JEU.ui.afficher("jouer"); return true; } return false; };
    bouton.focus();
  }

  // ---------- la carte-itinéraire ----------
  function rendreRoute(s, e) {
    var X = JEU.expedition, el = JEU.ui.el, T = TEXTES.route, att = X.atteignables();
    S.enHalte = false;
    var d = disposition(e), etats = etatsNoeuds(e, d);
    var carte = el("div", { class: "route-carte", html: carteSVG(e, d, etats) });
    surveillerImages(carte);
    var noeuds = carte.querySelectorAll(".halte.atteignable");
    Array.prototype.forEach.call(noeuds, function (g, i) {
      g.addEventListener("click", function () { entrer(g.getAttribute("data-id")); });
      g.addEventListener("focus", function () { S.focus = i; });
    });
    if (S.focus >= att.length) S.focus = 0;
    var entrerB = el("button", { class: "bouton principal", disabled: !att.length, onclick: function () { if (att.length) entrer(att[Math.min(S.focus, att.length - 1)].id); }, texte: T.entrer + " (Entrée)" });
    var boutons = el("div", { class: "actions centre exp-actions" }, [entrerB,
      el("button", { class: "bouton", onclick: function () { rendreFaveurs(s, X.enCours()); }, texte: T.faveurs + " (F)" }),
      el("button", { class: "bouton", onclick: function () { JEU.ui.afficher("jouer"); }, texte: T.retour + " (Échap)" }),
      el("button", { class: "bouton discret", onclick: function () { leverLeCamp(); }, texte: T.lever })]);
    cadreEcran(s, e, carte, { boutons: boutons });
    if (S.toast) { JEU.ui.toast(S.toast, null, 3200); S.toast = null; }
    function focusVers(delta) {
      if (!noeuds.length) return;
      S.focus = (S.focus + delta + noeuds.length) % noeuds.length;
      noeuds[S.focus].focus({ preventScroll: true });
    }
    JEU.ui.clavier = function (k) {
      var n = parseInt(k, 10);
      if (n >= 1 && n <= att.length) { entrer(att[n - 1].id); return true; }
      if (k === "ArrowLeft" || k === "ArrowUp") { focusVers(-1); return true; }
      if (k === "ArrowRight" || k === "ArrowDown") { focusVers(1); return true; }
      if (k === "Enter") { if (att.length) entrer(att[Math.min(S.focus, att.length - 1)].id); return true; }
      if (k === "f" || k === "F") { rendreFaveurs(s, X.enCours()); return true; }
      if (k === "Escape") { JEU.ui.afficher("jouer"); return true; }
      return false;
    };
    if (noeuds.length) noeuds[Math.min(S.focus, noeuds.length - 1)].focus({ preventScroll: true });
  }
  function leverLeCamp() {
    JEU.ui.confirmer(TEXTES.route.leverQuestion, TEXTES.route.leverBouton, function () {
      var b = JEU.expedition.finir("abandon");
      if (b) { S.bilan = b; afficher(); }
    });
  }
  // La liste des faveurs tenues (touche F), avec leur effet.
  function rendreFaveurs(s, e) {
    var X = JEU.expedition, el = JEU.ui.el, tenues = X.faveursTenues();
    var boite = el("div", { class: "exp-fenetre liste-faveurs" }, [
      el("h2", { texte: TEXTES.compagnie.faveurs }),
      tenues.length ? el("div", { class: "cartes-faveur" }, tenues.map(function (c) { return carteFaveurEl(c, null, null); })) : el("p", { class: "note", texte: TEXTES.compagnie.aucuneFaveur })
    ]);
    var fermer = el("button", { class: "bouton", onclick: function () { rendreRoute(s, X.enCours()); }, texte: TEXTES.armorial.fermer + " (Échap)" });
    cadreEcran(s, e, boite, { boutons: el("div", { class: "actions centre exp-actions" }, [fermer]) });
    JEU.ui.clavier = function (k) { if (k === "Escape" || k === "Enter" || k === "f" || k === "F") { rendreRoute(s, X.enCours()); return true; } return false; };
    fermer.focus();
  }

  // ---------- entrer dans une halte ----------
  function entrer(id) {
    var X = JEU.expedition;
    if (JEU.partie || (JEU.bataille.enChargement && JEU.bataille.enChargement())) return; // une halte se lance déjà (touche répétée)
    var t = X.entrer(id);
    if (!t) return;
    var h = t.halte, s = ecranEl(), e = X.enCours();
    S.enHalte = true; S.focus = 0;
    if (X.EXP.BATAILLES.indexOf(h.type) >= 0) return lancerBatailleRoute(t);
    if (h.type === "evenement") return jouerEvenementRoute(t);
    if (h.type === "marchand") return rendreMarchand(s, e, t);
    if (h.type === "bivouac") return rendreBivouac(s, e, t);
    S.enHalte = false;
    rendreRoute(s, e);
  }
  function extraDe(acte) { return acte ? { semaine: acte.semaine, semaines: acte.semaines } : null; }

  // --- bataille de route : contexte pour JEU.bataille.lancer ---
  function lancerBatailleRoute(t) {
    var X = JEU.expedition, C = JEU.campagne, e = X.enCours(), halte = t.halte, acte = t.acte;
    var type = halte.type, grand = type === "grand", gardien = type === "gardien" || grand;
    var options = X.optionsBataille(halte);
    var rival = grand && C.rivalDe ? C.rivalDe(e.front) : null;
    var extra = extraDe(acte), ctxCadre = type === "escarmouche" ? "route" : type === "embuscade" ? "embuscade" : "gardien";
    var titre = gardien ? nomHalte(halte) + (grand ? " · semaine " + acte.semaine : " " + acte.semaine) : nomHalte(halte) + " · semaine " + acte.semaine;
    var premiere = !gardien && X.haltesJouees(e) === 0;
    var contexte = {
      carte: halte.carte || acte.carte, titre: titre, front: e.front, camp: campDuFront(e.front), niveau: options.niveau, vagues: options.vagues, defense: options.defense,
      pvRival: options.pvRival, pvRivalMax: options.pvRivalMax, options: options, semaine: acte.semaine,
      tirage: function (n, posees) { return X.tirage(n, posees, halte); },
      cadre: function (q) { return JEU.recit.cadre(q, ctxCadre, null, extra); },
      nomRival: rival ? rival.nom : "Un seigneur rival", rivalPerso: rival,
      eclaireur: premiere ? remplir(U.hasard(X.TEXTES.eclaireur), { S: acte.semaine }) : null,
      eclaireurs: X.rang("eclaireurs"), sansFiche: grand, vitesse: e.vitesse,
      surVitesse: function (n) { X.vitesse(n); },
      surVague: function () { X.marquerEntamee(halte.id); },
      surFin: function (b) {
        var res = X.apresBataille(halte, b);
        if (!res) return null;
        if (res.porte) preparerPorte(res.porte);
        S.suite = res;
        return textesFin(res, halte);
      },
      surQuitter: function (entamee) {
        var r = X.quitter(entamee);
        if (r && r.fini) S.suite = { fini: r.fini };
        else if (r && r.vivrePerdu) S.toast = remplir(TEXTES.fin.cedeTexte, { V: r.vivres });
      },
      retour: function () { afficher(); }
    };
    var lancer = function () {
      // lancer charge le terrain avant de commencer (JEU.partie n'existe pas encore) : il renvoie true dès qu'il s'y met ;
      // sinon (pas assez de questions, bataille déjà en cours), la halte reste à jouer
      if (!JEU.bataille.lancer(halte.id, contexte) && !JEU.partie) { S.enHalte = false; afficher(); }
    };
    if (grand && JEU.ecranCampagne && JEU.ecranCampagne.defiAvantRoute) {
      // le défi du rival du front (une bataille sur deux, réglage « Messages des rivaux ») : demandé par l'écran de campagne
      var pp = C.prochaineProvince(e.front);
      JEU.ecranCampagne.defiAvantRoute(pp ? pp.province.id : null, lancer);
      return;
    }
    lancer();
  }
  // Textes de l'écran de fin d'une bataille de route : { titre, texte, butin, bouton }.
  function textesFin(res, halte) {
    var X = JEU.expedition, T = TEXTES.fin, gardien = res.type === "gardien" || res.type === "grand", butin = [];
    if (res.or) butin.push(remplir(T.or, { O: res.or }));
    if (res.renom) butin.push(remplir(T.renom, { R: res.renom }));
    if (res.vivre) butin.push(remplir(T.vivre, { V: res.vivre }));
    if (res.nomPorte && (res.porte || !res.cede || !gardien)) butin.push(remplir(T.porte, { P: res.nomPorte }));
    var titre, texte;
    if (res.cede) {
      titre = T.cede;
      texte = remplir(T.cedeTexte, { V: res.vivres }) + (res.fini ? T.dernier : gardien ? T.retente : "");
    } else if (res.type === "grand") { titre = T.grand; texte = T.grandTexte; }
    else if (res.type === "gardien") { titre = remplir(T.gardien, { S: res.franchie || halte.semaine || "" }); texte = T.gardienTexte; }
    else { titre = res.eclatante ? T.eclatante : T.tenu; texte = res.eclatante ? T.eclatanteTexte : T.tenuTexte; }
    return { titre: titre, texte: texte, butin: butin.join(", "), bouton: T.bouton + " (Entrée)" };
  }
  // Une porte de faveur rendue par apresBataille : l'offre est préparée tout de suite (trois cartes, quatre si éclatante) et
  // enregistrée avec la question en attente ; la question du conseiller décide ensuite si deux cartes sont retirées.
  function preparerPorte(porte) {
    var X = JEU.expedition, off = X.offrirFaveurs(porte, true, !!porte.eclatante);
    if (off && off.cartes.length) { off.question = true; off.eclatante = !!porte.eclatante; JEU.sauvegarde.enregistrer(); }
    else if (off && off.or) S.toast = TEXTES.porte.sansFaveur;
  }

  // --- événement du jour rejoué sur la route, et les archives ---
  function jouerEvenementRoute(t) {
    var X = JEU.expedition, C = JEU.campagne, h = t.halte, acte = t.acte, ev = evenementDe(h.ev);
    if (!ev) { X.terminerHalte(h.id); S.enHalte = false; afficher(); return; }
    var extra = extraDe(acte), ctxCadre = h.ev === "archives" ? "archives" : "evenement";
    C.jouerEvenement(ev, {
      tirage: function (n) { return X.tirage(n, [], h); },
      cadre: function (q) { return JEU.recit.cadre(q, ctxCadre, null, extra); },
      cloturer: function (id, bonnes, total) { return X.cloturerEvenement(h.id, id, bonnes, total); },
      retour: function () { afficher(); }
    });
    if (!JEU.partie) { S.enHalte = false; afficher(); }
  }

  // ---------- la porte de faveur : la question du conseiller, puis les cartes ----------
  function rendrePorte(s, e) {
    var X = JEU.expedition, el = JEU.ui.el, offre = e.offre, T = TEXTES.porte, famille = offre.conseiller, cons = conseillerDe(famille);
    var t = X.trouverHalte(offre.halte, e), acte = t ? t.acte : X.acteCourant(e);
    S.enHalte = true;
    var q = X.tirage(1, [], { type: "porte", famille: famille })[0];
    if (!q) { offre.question = false; JEU.sauvegarde.enregistrer(); return rendreCartes(s, e, offre, null); }
    var nomP = t && t.halte.porte ? X.nomPorte(t.halte.porte) : X.nomPorte({ genre: "faveur", conseiller: famille });
    var zone = el("div", { class: "zone-question" });
    var boite = el("div", { class: "exp-fenetre porte" }, [
      el("div", { class: "fen-tete", style: "--teinte:" + couleurFamille(famille) }, [el("span", { class: "fen-portrait", html: JEU.icones.icone(cons.icone, 34) }),
        el("div", {}, [el("h2", { texte: remplir(T.titre, { P: nomP }) }), el("p", { class: "note", texte: remplir(T.sous, { N: cons.nom }) })])]),
      zone
    ]);
    cadreEcran(s, e, boite, null);
    JEU.ui.poserQuestion(q, zone, function (juste) {
      JEU.questions.enregistrerReponse(q, juste);
      var off = X.enCours() && X.enCours().offre;
      if (!off) return afficher();
      off.question = false;
      if (!juste && off.cartes.length > 2) { // les deux cartes du conseiller et de la famille la moins jouée (et une de plus si éclatante)
        var garde = [off.cartes[0], off.cartes[off.cartes.length - 1]];
        if (off.eclatante && off.cartes.length > 3) garde.splice(1, 0, off.cartes[1]);
        off.cartes = garde;
      }
      JEU.sauvegarde.enregistrer();
      if (juste) { JEU.sons.jouer("coup"); JEU.ui.toast(off.cartes.length >= 4 ? T.justeQuatre : T.juste); rendreCartes(s, X.enCours(), off, null); }
      else JEU.ui.panneauErreur(q, zone, function () { JEU.ui.toast(T.faux); rendreCartes(s, X.enCours(), off, null); });
    }, { recit: JEU.recit.cadre(q, "porte", null, extraDe(acte)) });
  }
  // Une carte de faveur (HTML) : conseiller en médaillon, nom, ruban de rang, effet, « Affiner » si la faveur est déjà tenue.
  function carteFaveurEl(c, n, action) {
    var el = JEU.ui.el, X = JEU.expedition, contenu = [
      n ? el("span", { class: "touche", texte: String(n) }) : null,
      el("span", { class: "cf-medaillon", html: medaillonFaveur(c, 56) }),
      el("b", { class: "cf-nom", texte: c.nom }),
      el("span", { class: "cf-rang rang-" + c.rang, texte: c.rangNom }),
      el("span", { class: "cf-conseiller", texte: c.conseiller }),
      el("p", { class: "cf-texte", texte: c.texte }),
      c.affine ? el("i", { class: "cf-affine", texte: remplir(TEXTES.porte.affine, { A: X.TEXTES.rangs[c.rang - 2] || "", B: c.rangNom }) }) : null
    ];
    return action ? el("button", { class: "carte-faveur rang-" + c.rang, "data-id": c.id, onclick: action }, contenu) : el("div", { class: "carte-faveur rang-" + c.rang + " tenue" }, contenu);
  }
  // Les cartes au choix. offre : { cartes } ; options : { titre, sous, apres(id) } (par défaut : prendreFaveur puis la route).
  function rendreCartes(s, e, offre, options) {
    var X = JEU.expedition, el = JEU.ui.el, T = TEXTES.porte;
    options = options || {};
    var ouverture = offre.halte === "depart";
    var titre = options.titre || (ouverture ? T.ouverture : T.choisir), sous = options.sous || (ouverture ? T.ouvertureSous : "");
    var boutons = [];
    var choisir = function (id) {
      if (options.apres) { options.apres(id); return; }
      var f = X.prendreFaveur(id);
      if (f) { JEU.sons.jouer("validation"); JEU.ui.toast(remplir(T.tenue, { F: X.EXP.FAVEURS[f.id].nom, R: X.TEXTES.rangs[f.rang - 1] })); }
      afficher();
    };
    var cartes = el("div", { class: "cartes-faveur" }, offre.cartes.map(function (c, i) {
      var b = carteFaveurEl(c, i + 1, function () { choisir(c.id); });
      boutons.push(b);
      return b;
    }));
    var boite = el("div", { class: "exp-fenetre cartes" }, [el("h2", { texte: titre }), sous ? el("p", { class: "note", texte: sous }) : null, cartes]);
    cadreEcran(s, e, boite, null);
    var focus = 0;
    JEU.ui.clavier = function (k) {
      var n = parseInt(k, 10);
      if (n >= 1 && n <= offre.cartes.length) { choisir(offre.cartes[n - 1].id); return true; }
      if (k === "ArrowLeft" || k === "ArrowUp") { focus = (focus - 1 + boutons.length) % boutons.length; boutons[focus].focus(); return true; }
      if (k === "ArrowRight" || k === "ArrowDown") { focus = (focus + 1) % boutons.length; boutons[focus].focus(); return true; }
      if (k === "Enter") { choisir(offre.cartes[focus].id); return true; }
      return false; // Échap ne ferme jamais une porte : on choisit toujours
    };
    boutons.forEach(function (b, i) { b.addEventListener("focus", function () { focus = i; }); });
    if (boutons[0]) boutons[0].focus();
  }

  // ---------- le bivouac : repos ou veillée ----------
  function rendreBivouac(s, e, t) {
    var X = JEU.expedition, el = JEU.ui.el, T = TEXTES.bivouac;
    var repos = el("button", { class: "choix choix-bivouac", onclick: function () { choixRepos(); } }, [el("span", { class: "touche", texte: "1" }), el("span", {}, [el("b", { texte: T.repos }), el("p", { class: "note", texte: T.reposTexte })])]);
    var veillee = el("button", { class: "choix choix-bivouac", onclick: function () { choixVeillee(); } }, [el("span", { class: "touche", texte: "2" }), el("span", {}, [el("b", { texte: T.veillee }), el("p", { class: "note", texte: T.veilleeTexte })])]);
    var boite = el("div", { class: "exp-fenetre bivouac" }, [
      el("div", { class: "fen-tete" }, [el("span", { class: "fen-portrait", html: JEU.icones.icone("camp", 34) }), el("div", {}, [el("h2", { texte: T.titre }), el("p", { class: "note", texte: T.sous })])]),
      el("div", { class: "reponses" }, [repos, veillee])
    ]);
    cadreEcran(s, e, boite, null);
    function choixRepos() {
      var r = X.bivouac("repos");
      if (r) { JEU.sons.jouer("sceau"); S.toast = r.texte; }
      afficher();
    }
    function choixVeillee() {
      var qs = X.tirage(X.EXP.QUESTIONS.bivouac, [], { type: "veillee" });
      if (!qs.length) { JEU.ui.toast(T.aucuneQuestion); return choixRepos(); }
      X.bivouac("veillee");
      rendreVeillee(s, e, t, qs);
    }
    JEU.ui.clavier = function (k) {
      if (k === "1") { choixRepos(); return true; }
      if (k === "2") { choixVeillee(); return true; }
      if (k === "Escape") { S.enHalte = false; rendreRoute(s, X.enCours()); return true; } // la halte reste à jouer
      return false;
    };
    repos.focus();
  }
  function rendreVeillee(s, e, t, qs) {
    var X = JEU.expedition, el = JEU.ui.el, T = TEXTES.bivouac, i = 0, bonnes = 0, extra = extraDe(t.acte);
    var compteur = el("p", { class: "compteur" }), zone = el("div", { class: "zone-question" });
    var boite = el("div", { class: "exp-fenetre bivouac" }, [
      el("div", { class: "fen-tete" }, [el("span", { class: "fen-portrait", html: JEU.icones.icone("camp", 34) }), el("div", {}, [el("h2", { texte: T.titre + " · " + T.veillee }), compteur])]),
      zone
    ]);
    cadreEcran(s, e, boite, null);
    function suivante() {
      if (i >= qs.length) return fin();
      var q = qs[i];
      compteur.textContent = remplir(T.question, { I: i + 1, N: qs.length });
      JEU.ui.poserQuestion(q, zone, function (juste) {
        JEU.questions.enregistrerReponse(q, juste);
        i++;
        // la mesure réponse → question suivante ne compte que lorsqu'une question suit (jamais le bilan)
        if (juste) { bonnes++; JEU.sons.jouer("coup"); if (i < qs.length) JEU.mesure.reponseDonnee(); suivante(); }
        else { JEU.rappels.replacer(qs, i, qs.length); JEU.ui.panneauErreur(q, zone, function () { if (i < qs.length) JEU.mesure.reponseDonnee(); suivante(); }); }
      }, { recit: JEU.recit.cadre(q, "bivouac", null, extra) });
    }
    function fin() {
      var res = X.finirVeillee(bonnes, qs.length);
      if (res && res.affinables.length) {
        return rendreCartes(s, X.enCours(), { cartes: res.affinables, halte: t.halte.id }, { titre: T.affiner, sous: res.texte, apres: function (id) { X.affiner(id); JEU.sons.jouer("validation"); afficher(); } });
      }
      zone.innerHTML = "";
      var bouton = el("button", { class: "bouton principal", onclick: afficher, texte: T.continuer + " (Entrée)" });
      zone.appendChild(el("div", { class: "bilan reussi" }, [el("h2", { texte: T.veillee }), el("p", { class: "grand", texte: bonnes + " / " + qs.length }), el("p", { texte: res ? res.texte : "" }), bouton]));
      JEU.ui.clavier = function (k) { if (k === "Enter") { afficher(); return true; } return false; };
      bouton.focus();
    }
    suivante();
  }

  // ---------- le marchand : la question du maître d'œuvre ouvre l'étal ----------
  function rendreMarchand(s, e, t) {
    var X = JEU.expedition, el = JEU.ui.el, T = TEXTES.marchand, h = t.halte, cons = JEU.recit.CONSEILLERS.physique;
    if (e.etal[h.id]) return rendreEtal(s, X.enCours(), t, X.ouvrirEtal(h.id, e.etal[h.id].remise));
    var q = X.tirage(1, [], { type: "marchand" })[0];
    if (!q) return rendreEtal(s, e, t, X.ouvrirEtal(h.id, false));
    var zone = el("div", { class: "zone-question" });
    var boite = el("div", { class: "exp-fenetre marchand" }, [
      el("div", { class: "fen-tete", style: "--teinte:" + couleurFamille("physique") }, [el("span", { class: "fen-portrait", html: JEU.icones.icone(cons.icone, 34) }), el("div", {}, [el("h2", { texte: T.titre }), el("p", { class: "note", texte: T.sous })])]),
      zone
    ]);
    cadreEcran(s, e, boite, null);
    JEU.ui.poserQuestion(q, zone, function (juste) {
      JEU.questions.enregistrerReponse(q, juste);
      if (juste) { JEU.sons.jouer("coup"); JEU.ui.toast(T.remise); rendreEtal(s, X.enCours(), t, X.ouvrirEtal(h.id, true)); }
      else JEU.ui.panneauErreur(q, zone, function () { JEU.ui.toast(T.sansRemise); rendreEtal(s, X.enCours(), t, X.ouvrirEtal(h.id, false)); });
    }, { recit: JEU.recit.cadre(q, "marchand", null, extraDe(t.acte)) });
  }
  function rendreEtal(s, e, t, vue) {
    var X = JEU.expedition, el = JEU.ui.el, T = TEXTES.marchand, h = t.halte;
    if (!vue) { S.enHalte = false; return afficher(); }
    var lignes = vue.lignes.map(function (l, i) {
      var peut = l.dispo && vue.or >= l.prix;
      return el("button", { class: "ligne-etal" + (l.dispo ? "" : " epuise"), disabled: !peut, onclick: function () { acheterLigne(l.ligne); } }, [
        el("span", { class: "touche", texte: String(i + 1) }), el("span", { class: "le-texte", texte: l.texte }),
        el("b", { class: "le-prix", texte: l.dispo ? l.prix + " or" : (l.genre === "vivres" ? T.indisponible : T.vendu) })
      ]);
    });
    var quitter = el("button", { class: "bouton principal", onclick: fermer, texte: T.quitter + " (Échap)" });
    var boite = el("div", { class: "exp-fenetre marchand" }, [
      el("div", { class: "fen-tete", style: "--teinte:" + couleurFamille("physique") }, [el("span", { class: "fen-portrait", html: JEU.icones.icone("marchand", 34) }), el("div", {}, [el("h2", { texte: T.titre }), el("p", { class: "grand", texte: remplir(T.or, { O: vue.or }) + (vue.remise ? " · " + T.remise : "") })])]),
      el("div", { class: "etal" }, lignes),
      el("p", { class: "note", texte: vue.restant })
    ]);
    cadreEcran(s, e, boite, { boutons: el("div", { class: "actions centre exp-actions" }, [quitter]) });
    function acheterLigne(ligne) {
      var v = X.acheter(ligne, h.id);
      if (!v) { JEU.ui.toast(T.pasAssez); return; }
      JEU.sons.jouer("construction");
      JEU.ui.toast(remplir(T.achete, { A: (vue.lignes.filter(function (l) { return l.ligne === ligne; })[0] || { texte: "" }).texte }));
      rendreEtal(s, X.enCours(), t, v);
    }
    function fermer() { X.fermerEtal(h.id); JEU.sons.jouer("sceau"); afficher(); }
    JEU.ui.clavier = function (k) {
      var n = parseInt(k, 10);
      if (n >= 1 && n <= vue.lignes.length) { if (!lignes[n - 1].disabled) acheterLigne(vue.lignes[n - 1].ligne); return true; }
      if (k === "Escape" || k === "Enter") { fermer(); return true; }
      return false;
    };
    var premier = lignes.filter(function (b) { return !b.disabled; })[0];
    (premier || quitter).focus();
  }

  // ---------- le bilan (victoire, retour au domaine, camp levé) ----------
  function rendreBilan(s, b) {
    var X = JEU.expedition, el = JEU.ui.el, T = TEXTES.bilan, x = X.etat();
    s.innerHTML = "";
    var fiches = (b.aRelire || []).map(function (id) { var f = JEU.questions.fiche(id); return { id: id, titre: f && f.fiche ? (f.fiche.titre || f.fiche.notion || id) : id }; });
    var boite = el("div", { class: "exp-fenetre bilan-exp" + (b.issue === "victoire" ? " victoire" : "") }, [
      el("h1", { class: "titre-ecran", texte: b.textes.titre }),
      el("p", { class: "bx-chroniqueur", texte: b.textes.chroniqueur }),
      el("p", { class: "grand", texte: b.textes.renom }),
      b.textes.orRestant ? el("p", { texte: b.textes.orRestant }) : null,
      b.banniere ? el("p", { texte: remplir(T.banniere, { B: b.banniere }) }) : null,
      b.ressources ? el("p", { texte: remplir(T.ressources, { N: b.ressources.nombre, R: JEU.RESSOURCES[b.ressources.ressource].nom.toLowerCase(), M: JEU.MATIERES[b.ressources.matiere].nom }) }) : null,
      el("p", { class: "note", texte: remplir(T.atteint, { S: b.atteint.semaine, H: ordinal(Math.max(1, b.atteint.halte)) }) + " · " + b.textes.graine }),
      el("h3", { texte: X.TEXTES.bilan.meilleures }),
      b.meilleures.length ? el("ul", { class: "liste-simple" }, b.meilleures.map(function (m) { return el("li", { texte: m.nom + " : " + m.bonnes + " / " + m.posees }); })) : el("p", { class: "note", texte: "—" }),
      el("h3", { texte: X.TEXTES.bilan.relire }),
      fiches.length ? el("div", { class: "grille-fiches a-relire" }, fiches.map(function (f) { return el("button", { class: "vignette", onclick: function () { JEU.codex.ouvrirFiche(f.id); }, texte: f.titre }); })) : el("p", { class: "note", texte: T.relireVide })
    ]);
    s.appendChild(boite);
    var repartir = el("button", { class: "bouton principal", onclick: function () { S.bilan = null; rendreDepart(s); }, texte: T.repartir + " (Entrée)" });
    s.appendChild(el("div", { class: "actions centre exp-actions" }, [repartir, el("button", { class: "bouton", onclick: function () { S.bilan = null; JEU.ui.afficher("jouer"); }, texte: T.retour + " (Échap)" })]));
    if (b.issue === "victoire") { JEU.sons.jouer("validation"); if (JEU.mentor && JEU.mentor.feliciter) JEU.mentor.feliciter(); }
    JEU.ui.clavier = function (k) {
      if (k === "Enter") { S.bilan = null; rendreDepart(s); return true; }
      if (k === "Escape") { S.bilan = null; JEU.ui.afficher("jouer"); return true; }
      return false;
    };
    repartir.focus();
  }

  JEU.ecranExpedition = {
    TEXTES: TEXTES, disposition: disposition, etatsNoeuds: etatsNoeuds, etatsChemins: etatsChemins, carteSVG: carteSVG, parcheminAnnee: parcheminAnnee,
    ecuArmorial: ecuArmorial, journalDeRoute: journalDeRoute, textesFin: textesFin, nomHalte: nomHalte, nomCourt: nomCourt, evenementDe: evenementDe,
    MESURES: { L: L, H: H, BANDE: BANDE, X0: X0, R_HALTE: R_HALTE, R_GARDIEN: R_GARDIEN },
    CLAVIER: {
      depart: { "Entrée": "partir", "← →": "relais", "1 2": "front", "A": "Armorial", "Échap": "retour à la campagne" },
      route: { "1 2 3": "entrer dans une halte atteignable", "← → ↑ ↓": "parcourir les haltes atteignables", "Entrée": "entrer dans la halte en relief", "F": "faveurs tenues", "Échap": "retour à la campagne (expédition enregistrée)" },
      porte: { "1 à 4": "choisir une carte", "← →": "parcourir les cartes", "Entrée": "prendre la carte en relief" },
      bivouac: { "1": "repos", "2": "veillée", "Échap": "revenir à la route (la halte reste à jouer)" },
      marchand: { "1 à 4": "acheter une ligne", "Entrée ou Échap": "quitter l'étal" },
      armorial: { "1 à 5": "acheter un quartier", "Entrée ou Échap": "fermer" },
      bilan: { "Entrée": "repartir", "Échap": "retour à la campagne" }
    },
    etat: S // lecture seule (essais)
  };
})(typeof window !== "undefined" ? window : globalThis);
