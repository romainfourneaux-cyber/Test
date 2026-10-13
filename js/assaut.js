// Assaut, à la manière de Slay the Spire : chaque notion est une carte ; la jouer demande une bonne réponse.
// 8 questions. Dégâts = poids de la question ; trois bonnes réponses d'affilée : coup puissant (+50 %).
// Ennemi à zéro : victoire. Sinon : retraite honorable avec un gain proportionnel aux dégâts.
// Le joueur n'a pas de points de vie.
(function (racine) {
  "use strict";
  var JEU = racine.JEU;
  var U = JEU.util;
  var TOURS = 8, FORCE_ENNEMI = 6, BONUS_VICTOIRE = 5;

  // Candidats d'une partie libre : fiches des cours accessibles ayant des questions jouables.
  function candidats(matiere, filtreQuestion) {
    var etat = JEU.sauvegarde.etat();
    var rang = JEU.progression.recence(etat);
    var res = [];
    JEU.progression.coursAccessibles(etat).forEach(function (cid) {
      if (matiere && U.matiereDe(cid) !== matiere) return;
      var parFiche = {};
      JEU.questions.questionsDuCours(cid).forEach(function (q) {
        if (q.niveau <= 2 && (!filtreQuestion || filtreQuestion(q))) parFiche[q.fiche] = true;
      });
      Object.keys(parFiche).forEach(function (f) { res.push({ fiche: f, cours: cid, recent: rang[cid] || 0 }); });
    });
    return res;
  }

  function tirer(matiere, nombre, filtreQuestion) {
    var etat = JEU.sauvegarde.etat();
    return JEU.leitner.tirer(candidats(matiere, filtreQuestion), etat, nombre, { aRetravailler: JEU.donnees.aRetravailler || [] });
  }

  function choisirMatiere() {
    var el = JEU.ui.el;
    var dispo = {};
    candidats(null).forEach(function (c) { var m = U.matiereDe(c.cours); dispo[m] = (dispo[m] || 0) + 1; });
    var options = [{ m: null, nom: "Toutes les matières" }].concat(JEU.ORDRE_MATIERES.filter(function (m) { return dispo[m] >= 3; }).map(function (m) { return { m: m, nom: JEU.MATIERES[m].nom }; }));
    if (!candidats(null).length) { JEU.ui.toast("Pas encore de notions à jouer."); return; }
    var boite = el("div", { class: "choix-matiere" }, options.map(function (o, i) {
      return el("button", { class: "choix", onclick: function () { JEU.ui.fermerModale(); lancer(o.m); },
        style: o.m ? "--teinte:" + JEU.MATIERES[o.m].couleur : "" }, [el("span", { class: "touche", texte: String(i + 1) }), el("span", { texte: o.nom })]);
    }));
    JEU.ui.ouvrirModale("Quel front attaquer ?", boite);
    var touche = function (ev) {
      var n = parseInt(ev.key, 10);
      if (JEU.ui.modaleOuverte() && n >= 1 && n <= options.length) {
        document.removeEventListener("keydown", touche, true);
        ev.preventDefault(); ev.stopPropagation();
        JEU.ui.fermerModale(); lancer(options[n - 1].m);
      }
      if (!JEU.ui.modaleOuverte()) document.removeEventListener("keydown", touche, true);
    };
    document.addEventListener("keydown", touche, true);
  }

  function lancer(matiere) {
    var el = JEU.ui.el;
    // un paquet de cartes-notions : 3 en main à chaque tour
    var paquet = tirer(matiere, TOURS * 3);
    if (paquet.length < 3) { JEU.ui.toast("Pas encore assez de notions pour un assaut."); return; }
    var zone = JEU.ui.commencerPartie("Assaut", function () { JEU.ui.afficher("jouer"); });
    var graine = Math.floor(Math.random() * 1000);
    var pv = FORCE_ENNEMI, tour = 0, serie = 0, bonnes = 0, degats = 0, gains = {};
    var dejaPosees = [];

    var nomDomaine = JEU.sauvegarde.etat().reglages.nomDomaine;
    var champ = el("div", { class: "champ-bataille" }, [
      el("div", { class: "scene-bataille", html: JEU.decor.champBataille(graine, FORCE_ENNEMI, nomDomaine) }),
      el("div", { class: "hud-bataille" }, [
        el("div", { class: "hud-joueur" }, [
          el("span", { class: "blason-petit", html: JEU.icones.blason(nomDomaine, 40) }),
          el("div", {}, [el("b", { texte: "Ton ost" }), el("p", { class: "tour-info" }), el("p", { class: "serie-info" })])
        ]),
        el("div", { class: "hud-ennemi" }, [
          el("b", { texte: "La garnison d'un seigneur rival" }),
          el("div", { class: "jauge" }, [el("div", { class: "jauge-remplie" })]),
          el("p", { class: "pv" })
        ])
      ])
    ]);
    var scene = el("div", { class: "scene" });
    zone.appendChild(champ); zone.appendChild(scene);

    function majChamp(coup, puissant) {
      champ.querySelector(".jauge-remplie").style.width = Math.max(0, pv / FORCE_ENNEMI * 100) + "%";
      champ.querySelector(".pv").textContent = pv <= 0 ? "En déroute !" : "Force : " + Math.round(pv * 10) / 10 + " / " + FORCE_ENNEMI;
      champ.querySelector(".tour-info").textContent = "Tour " + Math.min(tour + 1, TOURS) + " / " + TOURS;
      var pips = "";
      for (var k = 0; k < 3; k++) pips += k < serie ? "◆" : "◇";
      champ.querySelector(".serie-info").textContent = "Série " + pips + (serie === 2 ? " · coup puissant au prochain !" : "");
      var restants = Math.max(0, Math.ceil(pv - 1e-9));
      Array.prototype.forEach.call(champ.querySelectorAll(".ennemie .unite"), function (u) {
        u.classList.toggle("tombee", Number(u.getAttribute("data-rang")) >= restants);
      });
      if (coup) {
        var svg = champ.querySelector("svg");
        svg.classList.remove("tir", "puissant"); void svg.getBoundingClientRect();
        svg.classList.add("tir"); if (puissant) svg.classList.add("puissant");
      }
    }

    function main() {
      if (paquet.length < 3) paquet = paquet.concat(tirer(matiere, TOURS * 3));
      var cartes = [], reste = [];
      while (paquet.length && cartes.length < 3) {
        var c = paquet.shift();
        if (cartes.some(function (x) { return x.fiche === c.fiche; })) reste.push(c); else cartes.push(c);
      }
      paquet = paquet.concat(reste);
      return cartes;
    }

    function tourSuivant() {
      if (tour >= TOURS) return fin();
      majChamp();
      var cartes = main();
      scene.innerHTML = "";
      scene.appendChild(el("p", { class: "consigne", texte: "Choisis une carte à jouer (1 à " + cartes.length + ")." }));
      var mainEl = el("div", { class: "main-cartes" });
      cartes.forEach(function (c, i) {
        var f = JEU.questions.fiche(c.fiche);
        var m = U.matiereDe(c.cours);
        var n = JEU.sauvegarde.etat().notions[c.fiche];
        var pipsM = "";
        for (var k = 1; k <= 5; k++) pipsM += "<i class='" + (n && n.boite >= k ? "plein" : "") + "'></i>";
        mainEl.appendChild(el("button", { class: "carte-notion", style: "--teinte:" + JEU.MATIERES[m].couleur, onclick: function () { jouer(c, cartes); } }, [
          el("span", { class: "touche", texte: String(i + 1) }),
          el("span", { class: "carte-matiere", texte: JEU.MATIERES[m].nom }),
          el("span", { class: "carte-art", html: JEU.icones.icone(JEU.icones.matiere(m), 64) }),
          el("b", { class: "carte-titre", texte: f.fiche.titre || f.fiche.notion }),
          el("span", { class: "carte-boite", html: (n ? "Maîtrise" : "Nouvelle notion") + " <span class='pips'>" + pipsM + "</span>" })
        ]));
      });
      scene.appendChild(mainEl);
      JEU.ui.clavier = function (k) {
        var x = parseInt(k, 10);
        if (x >= 1 && x <= cartes.length) { jouer(cartes[x - 1], cartes); return true; }
        return false;
      };
      JEU.mesure.questionAffichee();
    }

    function jouer(carte, cartes) {
      JEU.mesure.reponseDonnee();
      // les cartes non jouées retournent au paquet
      cartes.forEach(function (c) { if (c !== carte) paquet.push(c); });
      var q = JEU.questions.choisirPourFiche(carte.fiche, { exclure: dejaPosees });
      if (!q) { tour++; tourSuivant(); return; }
      dejaPosees.push(q.id);
      JEU.ui.poserQuestion(q, scene, function (juste) {
        var res = JEU.questions.enregistrerReponse(q, juste);
        JEU.ui.noterDerniere(q);
        tour++;
        if (juste) {
          bonnes++; serie++;
          var d = q.poids || 1;
          var puissant = serie >= 3;
          if (puissant) { d *= 1.5; serie = 0; }
          pv -= d; degats += d;
          if (res) gains[res] = (gains[res] || 0) + 1;
          JEU.sons.jouer(puissant ? "coup-puissant" : "coup");
          JEU.ui.tampon(puissant ? "Coup puissant" : "Touché", "−" + d);
          JEU.ui.majRessources();
          majChamp(true, puissant);
          JEU.mesure.reponseDonnee();
          tourSuivant();
        } else {
          serie = 0;
          JEU.ui.panneauErreur(q, scene, function () { JEU.mesure.reponseDonnee(); tourSuivant(); });
        }
      });
    }

    function fin() {
      majChamp();
      var etat = JEU.sauvegarde.etat();
      var victoire = pv <= 0;
      var principale = Object.keys(gains).sort(function (a, b) { return gains[b] - gains[a]; })[0];
      var bonus = 0;
      if (principale) {
        bonus = victoire ? BONUS_VICTOIRE : Math.floor(BONUS_VICTOIRE * Math.min(1, degats / FORCE_ENNEMI));
        etat.ressources[principale] += bonus;
        gains[principale] += bonus;
      }
      etat.stats.parties++;
      JEU.sauvegarde.enregistrer();
      JEU.ui.majRessources();
      JEU.sons.jouer(victoire ? "validation" : "sceau");
      if (victoire) JEU.mentor.feliciter();
      scene.innerHTML = "";
      var liste = Object.keys(gains).map(function (r) { return "+" + gains[r] + " " + JEU.RESSOURCES[r].nom.toLowerCase(); }).join(", ");
      scene.appendChild(el("div", { class: "bilan" + (victoire ? " reussi" : "") }, [
        el("h2", { texte: victoire ? "Victoire !" : "Retraite honorable" }),
        el("p", { texte: victoire ? "La garnison rivale se rend." : "Tu te replies en bon ordre, avec ce que tu as gagné." }),
        el("p", { class: "grand", texte: bonnes + " / " + tour + " bonnes réponses" }),
        el("p", { texte: liste ? "Gains : " + liste + "." : "Pas de gain cette fois, mais rien de perdu." }),
        el("div", { class: "actions" }, [
          el("button", { class: "bouton principal", onclick: function () { JEU.ui.finirPartie(); lancer(matiere); }, texte: "Nouvel assaut (Entrée)" }),
          el("button", { class: "bouton", onclick: function () { JEU.ui.finirPartie(); JEU.ui.afficher("domaine"); }, texte: "Voir le domaine" })
        ])
      ]));
      JEU.ui.clavier = function (k) { if (k === "Enter") { JEU.ui.finirPartie(); lancer(matiere); return true; } return false; };
    }

    tourSuivant();
  }

  JEU.assaut = { lancer: lancer, choisirMatiere: choisirMatiere, candidats: candidats, tirer: tirer, TOURS: TOURS, FORCE_ENNEMI: FORCE_ENNEMI };
})(typeof window !== "undefined" ? window : globalThis);
