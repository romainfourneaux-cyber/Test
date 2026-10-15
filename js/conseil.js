// Le conseil du royaume, à la manière de Reigns : tes conseillers viennent un par un avec une affaire du domaine
// et une affirmation tirée du cours. Glisse à droite (« Je le crois ») ou à gauche (« J'en doute »), ou flèches.
// Juger juste fait monter une jauge du royaume (Trésor, Peuple, Garde, Savoir), qui renforce tes batailles.
// Deux cartes de décision, sans question, laissent choisir quelle jauge favoriser. Les jauges ne baissent jamais.
(function (racine) {
  "use strict";
  var JEU = racine.JEU;
  var U = JEU.util;
  var CARTES = 8, DECISIONS = 2, SEUIL_GLISSE = 90;
  var PILIERS = ["tresor", "peuple", "garde", "savoir"];

  var DILEMMES = [
    { texte: "Les paysans demandent des bras pour rentrer la moisson avant l'orage.", gauche: { t: "Garder les soldats aux remparts", j: "garde" }, droite: { t: "Envoyer la garde aux champs", j: "peuple" } },
    { texte: "Un marchand propose de financer une école pour les enfants du domaine.", gauche: { t: "Garder l'or au coffre", j: "tresor" }, droite: { t: "Ouvrir l'école", j: "savoir" } },
    { texte: "Le forgeron peut forger des socs de charrue ou des pointes de flèche.", gauche: { t: "Des pointes de flèche", j: "garde" }, droite: { t: "Des socs de charrue", j: "tresor" } },
    { texte: "La fête des moissons approche. Le village espère un grand banquet.", gauche: { t: "Un banquet modeste", j: "tresor" }, droite: { t: "Un grand banquet", j: "peuple" } },
    { texte: "Un copiste voyageur demande l'hospitalité au scriptorium.", gauche: { t: "Le loger à la caserne", j: "garde" }, droite: { t: "L'accueillir au scriptorium", j: "savoir" } },
    { texte: "Le pont du gué est fragile. Les charretiers se plaignent.", gauche: { t: "Le réparer aux frais du domaine", j: "peuple" }, droite: { t: "Instaurer un péage", j: "tresor" } }
  ];

  function jauges(zone) {
    var r = JEU.campagne.etat().royaume;
    zone.innerHTML = "";
    PILIERS.forEach(function (k) {
      var J = JEU.campagne.JAUGES[k];
      var n = r[k];
      zone.appendChild(JEU.ui.el("div", { class: "jauge-royaume", title: J.nom + " : " + J.effet(n) }, [
        JEU.ui.el("span", { class: "jr-icone", html: JEU.icones.icone(J.icone, 30) }),
        JEU.ui.el("span", { class: "jr-barre" }, [JEU.ui.el("span", { style: "width:" + Math.min(100, n / 12 * 100) + "%" })]),
        JEU.ui.el("b", { texte: J.nom + " " + n })
      ]));
    });
  }

  function lancer() {
    var el = JEU.ui.el;
    var qs = JEU.recit.suite(CARTES, { types: ["vrai_faux"] });
    if (qs.length < 3) { JEU.ui.toast("Pas encore assez d'affirmations pour réunir le conseil."); return; }
    // ordre des cartes : les questions, avec deux décisions glissées au milieu
    var paquet = qs.map(function (q, i) { return { q: q, pilier: PILIERS[i % PILIERS.length] }; });
    var dil = U.melanger(DILEMMES).slice(0, DECISIONS);
    paquet.splice(Math.min(3, paquet.length), 0, { d: dil[0] });
    if (dil[1]) paquet.splice(Math.min(6, paquet.length), 0, { d: dil[1] });

    var zone = JEU.ui.commencerPartie("Le conseil du royaume", function () { JEU.ui.afficher("jouer"); });
    var barre = el("div", { class: "jauges-royaume" });
    var compteur = el("p", { class: "compteur" });
    var scene = el("div", { class: "scene-conseil" });
    zone.appendChild(barre); zone.appendChild(compteur); zone.appendChild(scene);
    jauges(barre);
    var i = 0, bonnes = 0, posees = 0, montees = {};

    // Une affirmation ratée revient un peu plus tard (rappels.js), peut-être dans ce conseil : elle prend la place
    // d'une affirmation encore à venir. Les cartes de décision ne bougent pas et ne comptent pas comme des questions.
    function replacerRappels() {
      var places = [];
      for (var j = i; j < paquet.length; j++) if (paquet[j].q) places.push(j);
      var reste = JEU.rappels.placer(places.map(function (j) { return paquet[j].q; }), { types: ["vrai_faux"] });
      places.forEach(function (j, k) { if (k < reste.length) paquet[j].q = reste[k]; });
      for (var k = places.length - 1; k >= reste.length; k--) paquet.splice(places[k], 1);
    }

    function monter(k, n) {
      JEU.campagne.etat().royaume[k] += n;
      montees[k] = (montees[k] || 0) + n;
      JEU.sauvegarde.enregistrer();
      jauges(barre);
      var j = barre.querySelectorAll(".jauge-royaume")[PILIERS.indexOf(k)];
      if (j) { j.classList.remove("monte"); void j.offsetWidth; j.classList.add("monte"); }
    }

    function suivante() {
      if (i >= paquet.length) return fin();
      compteur.textContent = "Affaire " + (i + 1) + " / " + paquet.length;
      var c = paquet[i];
      scene.innerHTML = "";
      if (c.d) return decision(c.d);
      var q = c.q, cons = JEU.recit.conseiller(q.matiere), m = JEU.MATIERES[q.matiere];
      var cadre = JEU.recit.cadre(q, c.pilier);
      var carte = el("div", { class: "carte-conseil", style: "--teinte:" + m.couleur, tabindex: "0" }, [
        el("div", { class: "cc-tete" }, [el("span", { class: "cc-portrait", html: JEU.icones.icone(cons.icone, 46) }), el("div", {}, [el("b", { texte: cons.nom }), el("span", { texte: cons.titre })])]),
        el("p", { class: "cc-affaire", texte: cadre.texte }),
        cadre.etiquette ? el("span", { class: "etiquette-rappel", texte: cadre.etiquette }) : null,
        el("p", { class: "affirmation", texte: "« " + q.enonce + " »" }),
        el("span", { class: "cc-enjeu", html: JEU.icones.icone(JEU.campagne.JAUGES[c.pilier].icone, 20) + " En jeu : " + JEU.campagne.JAUGES[c.pilier].nom }),
        el("div", { class: "indic gauche", texte: "J'EN DOUTE" }),
        el("div", { class: "indic droite", texte: "JE LE CROIS" })
      ]);
      var boutons = el("div", { class: "boutons-sceau" }, [
        el("button", { class: "bouton faux", onclick: function () { decider(false); }, texte: "← J'en doute" }),
        el("button", { class: "bouton vrai", onclick: function () { decider(true); }, texte: "Je le crois →" })
      ]);
      scene.appendChild(carte); scene.appendChild(boutons);
      glisser(carte, decider);
      var fait = false;
      function decider(v) {
        if (fait) return; fait = true;
        JEU.mesure.reponseDonnee();
        carte.classList.add(v ? "part-droite" : "part-gauche");
        if (!v && !q.reponse.vrai && q.corrections && q.corrections.length) return corriger(q, c);
        conclure(q, c, { vrai: v, correction: null });
      }
      JEU.ui.clavier = function (k) {
        if (k === "ArrowLeft") { decider(false); return true; }
        if (k === "ArrowRight") { decider(true); return true; }
        return false;
      };
      JEU.mesure.questionAffichee();
    }

    function corriger(q, c) {
      scene.innerHTML = "";
      scene.appendChild(el("p", { class: "affirmation petite", texte: "« " + q.enonce + " »" }));
      scene.appendChild(el("p", { class: "consigne", texte: "Tu as raison d'en douter. Que faut-il dire à la place ?" }));
      var corr = U.melanger(q.corrections); // la bonne correction n'est pas toujours la première
      corr.forEach(function (x, k) {
        scene.appendChild(el("button", { class: "choix", onclick: function () { conclure(q, c, { vrai: false, correction: x }); } }, [el("span", { class: "touche", texte: String(k + 1) }), el("span", { texte: x })]));
      });
      JEU.ui.clavier = function (k) {
        var n = parseInt(k, 10);
        if (n >= 1 && n <= corr.length) { conclure(q, c, { vrai: false, correction: corr[n - 1] }); return true; }
        return false;
      };
      JEU.mesure.questionAffichee();
    }

    function conclure(q, c, rj) {
      JEU.ui.clavier = null;
      var juste = JEU.questions.corriger(q, rj);
      JEU.questions.enregistrerReponse(q, juste);
      JEU.ui.noterDerniere(q);
      i++; posees++;
      if (juste) {
        bonnes++;
        monter(c.pilier, 1);
        JEU.sons.jouer("sceau");
        JEU.ui.tampon("Sage décision", "+1 " + JEU.campagne.JAUGES[c.pilier].nom);
        JEU.ui.majRessources();
        JEU.mesure.reponseDonnee();
        suivante();
      } else {
        replacerRappels();
        JEU.ui.panneauErreur(q, scene, function () { JEU.mesure.reponseDonnee(); suivante(); });
      }
    }

    // Carte de décision : pas de bonne ou de mauvaise réponse, chaque choix fait monter une jauge.
    // Ce n'est pas une question : le temps passé à trancher n'entre pas dans la mesure réponse → question suivante.
    function decision(d) {
      JEU.mesure.debut = null;
      var carte = el("div", { class: "carte-conseil decision", tabindex: "0" }, [
        el("div", { class: "cc-tete" }, [el("span", { class: "cc-portrait", html: JEU.icones.icone("roi", 46) }), el("div", {}, [el("b", { texte: "À toi de trancher" }), el("span", { texte: "aucune mauvaise réponse ici" })])]),
        el("p", { class: "cc-affaire", texte: d.texte }),
        el("div", { class: "indic gauche", texte: d.gauche.t.toUpperCase() }),
        el("div", { class: "indic droite", texte: d.droite.t.toUpperCase() })
      ]);
      var boutons = el("div", { class: "boutons-sceau" }, [
        el("button", { class: "bouton", onclick: function () { choisir(false); }, html: "← " + U.echapper(d.gauche.t) + " <small>(+" + JEU.campagne.JAUGES[d.gauche.j].nom + ")</small>" }),
        el("button", { class: "bouton", onclick: function () { choisir(true); }, html: U.echapper(d.droite.t) + " <small>(+" + JEU.campagne.JAUGES[d.droite.j].nom + ")</small> →" })
      ]);
      scene.appendChild(carte); scene.appendChild(boutons);
      glisser(carte, choisir);
      var fait = false;
      function choisir(droite) {
        if (fait) return; fait = true;
        var o = droite ? d.droite : d.gauche;
        monter(o.j, 1);
        JEU.sons.jouer("construction");
        JEU.ui.clavier = null;
        i++;
        suivante(); // la carte suivante arrive tout de suite ; la jauge qui monte et le son font l'effet
      }
      JEU.ui.clavier = function (k) {
        if (k === "ArrowLeft") { choisir(false); return true; }
        if (k === "ArrowRight") { choisir(true); return true; }
        return false;
      };
    }

    function fin() {
      var etat = JEU.sauvegarde.etat();
      etat.stats.parties++;
      JEU.campagne.etat().royaume.conseils++;
      JEU.sauvegarde.enregistrer();
      var nbQ = posees || 1, taux = bonnes / nbQ;
      if (taux >= 0.8) {
        JEU.mentor.feliciter();
        setTimeout(function () { var b = scene.querySelector(".bilan"); if (b) { var c = JEU.anim.centre(b); JEU.anim.eclat(c.x, c.y - 60, "feuilles", 60); } }, 30);
      }
      scene.innerHTML = "";
      compteur.textContent = "";
      var liste = Object.keys(montees).map(function (k) { return "+" + montees[k] + " " + JEU.campagne.JAUGES[k].nom; }).join(", ");
      scene.appendChild(el("div", { class: "bilan" + (taux >= 0.8 ? " reussi" : "") }, [
        el("h2", { texte: taux >= 0.8 ? "Un conseil avisé !" : "Le conseil est levé" }),
        el("p", { class: "grand", texte: bonnes + " / " + posees + " jugements justes" }),
        el("p", { texte: liste ? "Le royaume grandit : " + liste + "." : "Rien de perdu : le royaume garde tout ce qu'il a." }),
        el("div", { class: "actions" }, [
          el("button", { class: "bouton principal", onclick: function () { JEU.ui.finirPartie(); lancer(); }, texte: "Nouveau conseil (Entrée)" }),
          el("button", { class: "bouton", onclick: function () { JEU.ui.finirPartie(); JEU.ui.afficher("jouer"); }, texte: "Retour à la campagne" })
        ])
      ]));
      JEU.ui.clavier = function (k) { if (k === "Enter") { JEU.ui.finirPartie(); lancer(); return true; } return false; };
    }

    suivante();
  }

  // Glisser la carte à la souris ou au doigt.
  function glisser(carte, decider) {
    var x0 = null, dx = 0;
    carte.addEventListener("pointerdown", function (e) { x0 = e.clientX; dx = 0; carte.setPointerCapture(e.pointerId); carte.classList.add("glisse"); });
    carte.addEventListener("pointermove", function (e) {
      if (x0 === null) return;
      dx = e.clientX - x0;
      carte.style.transform = "translateX(" + dx + "px) rotate(" + (dx / 20) + "deg)";
      carte.classList.toggle("vers-droite", dx > 30);
      carte.classList.toggle("vers-gauche", dx < -30);
    });
    function lacher() {
      if (x0 === null) return;
      x0 = null;
      carte.classList.remove("glisse");
      if (dx > SEUIL_GLISSE) decider(true);
      else if (dx < -SEUIL_GLISSE) decider(false);
      else { carte.style.transform = ""; carte.classList.remove("vers-droite", "vers-gauche"); }
    }
    carte.addEventListener("pointerup", lacher);
    carte.addEventListener("pointercancel", lacher);
  }

  JEU.conseil = { lancer: lancer, jauges: jauges, DILEMMES: DILEMMES };
})(typeof window !== "undefined" ? window : globalThis);
