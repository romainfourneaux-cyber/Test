// Interface : écrans, navigation, clavier, notifications, rendu des questions, accueil, cours, réglages.
(function (racine) {
  "use strict";
  var JEU = racine.JEU;
  var U = JEU.util;
  var ui = JEU.ui = {};

  // ---------- fabrication d'éléments ----------
  function el(tag, attrs, enfants) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v == null || v === false) return;
      if (k === "class") e.className = v;
      else if (k === "html") e.innerHTML = v;
      else if (k === "texte") e.textContent = v;
      else if (k.slice(0, 2) === "on") e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v === true ? "" : v);
    });
    (enfants || []).forEach(function (c) {
      if (c == null || c === false) return;
      e.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return e;
  }
  ui.el = el;
  ui.$ = function (sel) { return document.querySelector(sel); };

  // ---------- écrans ----------
  var ecranCourant = null;
  ui.afficher = function (nom, arg) {
    if (JEU.partie && JEU.partie.enCours && nom !== "partie") {
      ui.toast("Termine ou quitte la partie en cours d'abord.");
      return;
    }
    Array.prototype.forEach.call(document.querySelectorAll(".ecran"), function (s) { s.hidden = true; });
    var s = document.getElementById("ecran-" + nom);
    s.hidden = false;
    ecranCourant = nom;
    Array.prototype.forEach.call(document.querySelectorAll("#menu button"), function (b) {
      b.classList.toggle("actif", b.getAttribute("data-ecran") === nom);
    });
    ui.clavier = null;
    // le bouton du menu ne garde pas le focus : les touches vont au jeu
    if (document.activeElement && document.activeElement.closest && document.activeElement.closest("#menu")) document.activeElement.blur();
    var rendu = ui.ecrans[nom];
    if (rendu) rendu(s, arg);
    window.scrollTo(0, 0);
  };
  ui.ecrans = {};
  ui.ecranCourant = function () { return ecranCourant; };

  // ---------- clavier ----------
  // ui.clavier : fonction(touche) de l'écran actif ; renvoie true si la touche est utilisée.
  document.addEventListener("keydown", function (ev) {
    if (ev.target && /INPUT|TEXTAREA|SELECT/.test(ev.target.tagName) && ev.key !== "Enter") return;
    if (ev.altKey || ev.ctrlKey || ev.metaKey) return;
    if (ui.modaleOuverte()) {
      if (ev.key === "Escape") { ui.fermerModale(); ev.preventDefault(); }
      return;
    }
    if (ui.clavier && ui.clavier(ev.key, ev)) ev.preventDefault();
  });

  // ---------- notifications ----------
  var minuterieToast = null;
  ui.toast = function (texte, genre) {
    var t = document.getElementById("toast");
    t.textContent = texte;
    t.className = "toast visible " + (genre || "");
    clearTimeout(minuterieToast);
    minuterieToast = setTimeout(function () { t.className = "toast"; }, 1600);
  };

  // Sceau qui s'imprime au centre de l'écran (350 ms), sans retarder la question suivante.
  ui.tampon = function (texte, sous) {
    var t = document.createElement("div");
    t.className = "tampon";
    t.innerHTML = JEU.icones.icone("sceau", 120) + "<b>" + U.echapper(texte) + "</b>" + (sous ? "<span>" + U.echapper(sous) + "</span>" : "");
    document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 700);
  };

  // ---------- fenêtre modale ----------
  var retourModale = null;
  ui.ouvrirModale = function (titre, contenu, fermeture) {
    var m = document.getElementById("modale");
    var boite = m.querySelector(".modale-boite");
    boite.innerHTML = "";
    boite.appendChild(el("button", { class: "modale-fermer", "aria-label": "Fermer", onclick: ui.fermerModale, texte: "×" }));
    if (titre) boite.appendChild(el("h2", { texte: titre }));
    boite.appendChild(contenu);
    m.hidden = false;
    retourModale = fermeture || null;
    var f = boite.querySelector("input, textarea, button:not(.modale-fermer)");
    if (f) f.focus();
  };
  ui.fermerModale = function () {
    document.getElementById("modale").hidden = true;
    var r = retourModale; retourModale = null;
    if (r) r();
  };
  ui.modaleOuverte = function () { return !document.getElementById("modale").hidden; };

  // ---------- bandeau : ressources ----------
  ui.majRessources = function () {
    var etat = JEU.sauvegarde.etat();
    var zone = document.getElementById("ressources");
    zone.innerHTML = "";
    Object.keys(JEU.RESSOURCES).forEach(function (k) {
      var r = JEU.RESSOURCES[k];
      zone.appendChild(el("span", { class: "ressource", title: r.nom + " (" + JEU.MATIERES[r.matiere].nom + ")", style: "--teinte:" + JEU.MATIERES[r.matiere].couleur }, [
        el("span", { class: "medaillon", html: JEU.icones.ressource(k, 20) }),
        el("b", { texte: String(etat.ressources[k] || 0) })
      ]));
    });
    var bl = document.getElementById("blason-bandeau");
    if (bl && bl.getAttribute("data-nom") !== etat.reglages.nomDomaine) { bl.innerHTML = JEU.icones.blason(etat.reglages.nomDomaine, 30); bl.setAttribute("data-nom", etat.reglages.nomDomaine); }
    var nom = document.getElementById("nom-domaine");
    if (nom) nom.textContent = etat.reglages.nomDomaine || "Le domaine";
    var son = document.getElementById("bouton-son");
    if (son) { son.innerHTML = JEU.icones.icone(etat.reglages.son ? "son" : "sans-son", 22); son.title = etat.reglages.son ? "Couper le son" : "Remettre le son"; son.setAttribute("aria-pressed", etat.reglages.son ? "true" : "false"); }
  };

  // ---------- questions ----------
  // Pose une question dans « zone ». fini(juste, reponseJoueur) est appelé une seule fois.
  // options : { sansIndice }
  ui.poserQuestion = function (q, zone, fini, options) {
    options = options || {};
    zone.innerHTML = "";
    ui.questionCourante = q;
    var deja = false;
    function repondre(rj) {
      if (deja) return;
      deja = true;
      ui.clavier = null;
      fini(JEU.questions.corriger(q, rj), rj);
    }
    var m = JEU.MATIERES[q.matiere] || { nom: "", couleur: "#8a7f70" };
    var carte = el("div", { class: "question", style: "--teinte:" + m.couleur }, [
      el("div", { class: "question-entete" }, [
        el("span", { class: "pastille", texte: m.nom }),
        el("span", { class: "notion", texte: (JEU.questions.fiche(q.fiche) || { fiche: {} }).fiche.notion || "" })
      ]),
      el("p", { class: "enonce", texte: q.enonce || "" })
    ]);
    zone.appendChild(carte);
    var corps = el("div", { class: "reponses" });
    carte.appendChild(corps);
    var rendu = RENDUS[q.type];
    if (!rendu) { repondre(null); return; }
    rendu(q, corps, repondre);
    var pied = el("div", { class: "question-pied" });
    if (q.indice && !options.sansIndice) {
      pied.appendChild(el("button", { class: "lien", onclick: function () { JEU.mentor.dire(q.indice, "indice"); }, texte: "Un indice, chroniqueur ?" }));
    }
    carte.appendChild(pied);
    JEU.mesure.questionAffichee();
  };

  function boutonChoix(n, texte, action) {
    return el("button", { class: "choix", "data-n": n, onclick: action }, [el("span", { class: "touche", texte: String(n) }), el("span", { texte: texte })]);
  }

  function boutonValider(action) {
    return el("button", { class: "bouton principal valider", onclick: action, texte: "Valider (Entrée)" });
  }

  var RENDUS = {
    qcm: function (q, corps, repondre) {
      var choix = q.choix.slice();
      choix.forEach(function (c, i) { corps.appendChild(boutonChoix(i + 1, c, function () { repondre(c); })); });
      ui.clavier = function (k) {
        var n = parseInt(k, 10);
        if (n >= 1 && n <= choix.length) { repondre(choix[n - 1]); return true; }
        return false;
      };
    },
    qcm_multiple: function (q, corps, repondre) {
      var choisis = [];
      corps.appendChild(el("p", { class: "consigne", texte: "Plusieurs réponses possibles." }));
      var boutons = q.choix.map(function (c, i) {
        var b = boutonChoix(i + 1, c, function () { basculer(i); });
        corps.appendChild(b);
        return b;
      });
      function basculer(i) {
        var c = q.choix[i];
        var k = choisis.indexOf(c);
        if (k >= 0) choisis.splice(k, 1); else choisis.push(c);
        boutons[i].classList.toggle("coche", k < 0);
      }
      corps.appendChild(boutonValider(function () { repondre(choisis.slice()); }));
      ui.clavier = function (k) {
        var n = parseInt(k, 10);
        if (n >= 1 && n <= q.choix.length) { basculer(n - 1); return true; }
        if (k === "Enter") { repondre(choisis.slice()); return true; }
        return false;
      };
    },
    vrai_faux: function (q, corps, repondre) {
      function etape2() {
        corps.innerHTML = "";
        if (!q.corrections || !q.corrections.length) { repondre({ vrai: false, correction: null }); return; }
        corps.appendChild(el("p", { class: "consigne", texte: "Faux, oui. Quelle est la bonne correction ?" }));
        var corr = q.corrections.slice();
        corr.forEach(function (c, i) { corps.appendChild(boutonChoix(i + 1, c, function () { repondre({ vrai: false, correction: c }); })); });
        ui.clavier = function (k) {
          var n = parseInt(k, 10);
          if (n >= 1 && n <= corr.length) { repondre({ vrai: false, correction: corr[n - 1] }); return true; }
          return false;
        };
      }
      function choisir(v) {
        if (v) { repondre({ vrai: true, correction: null }); return; }
        if (q.reponse.vrai) { repondre({ vrai: false, correction: null }); return; }
        etape2();
      }
      corps.appendChild(boutonChoix(1, "Vrai", function () { choisir(true); }));
      corps.appendChild(boutonChoix(2, "Faux", function () { choisir(false); }));
      ui.clavier = function (k) {
        if (k === "1" || k === "ArrowRight") { choisir(true); return true; }
        if (k === "2" || k === "ArrowLeft") { choisir(false); return true; }
        return false;
      };
    },
    ordre: function (q, corps, repondre) {
      var suite = [];
      corps.appendChild(el("p", { class: "consigne", texte: "Clique les éléments dans le bon ordre (clique à nouveau pour retirer)." }));
      var liste = el("div", { class: "ordre" });
      corps.appendChild(liste);
      var boutons = q.elements.map(function (t, i) {
        var b = boutonChoix(i + 1, t, function () { basculer(i); });
        liste.appendChild(b);
        return b;
      });
      function basculer(i) {
        var k = suite.indexOf(i);
        if (k >= 0) suite.splice(k, 1); else suite.push(i);
        boutons.forEach(function (b, j) {
          var r = suite.indexOf(j);
          b.classList.toggle("coche", r >= 0);
          b.querySelector(".touche").textContent = r >= 0 ? "#" + (r + 1) : String(j + 1);
        });
        valider.disabled = suite.length !== q.elements.length;
      }
      var valider = boutonValider(function () { repondre(suite.slice()); });
      valider.disabled = true;
      corps.appendChild(valider);
      ui.clavier = function (k) {
        var n = parseInt(k, 10);
        if (n >= 1 && n <= q.elements.length) { basculer(n - 1); return true; }
        if (k === "Enter" && !valider.disabled) { repondre(suite.slice()); return true; }
        return false;
      };
    },
    association: function (q, corps, repondre) {
      var paires = [];      // [[g, d]]
      var gaucheChoisie = null;
      corps.appendChild(el("p", { class: "consigne", texte: "Clique un élément à gauche, puis celui qui lui correspond à droite." }));
      var grille = el("div", { class: "association" });
      var colG = el("div", { class: "colonne" }), colD = el("div", { class: "colonne" });
      grille.appendChild(colG); grille.appendChild(colD); corps.appendChild(grille);
      var bG = q.gauche.map(function (t, i) { var b = el("button", { class: "choix", onclick: function () { choisirG(i); } }, [el("span", { class: "touche", texte: String(i + 1) }), el("span", { texte: t })]); colG.appendChild(b); return b; });
      var bD = q.droite.map(function (t, j) { var b = el("button", { class: "choix", onclick: function () { choisirD(j); } }, [el("span", { class: "touche", texte: "·" }), el("span", { texte: t })]); colD.appendChild(b); return b; });
      function maj() {
        bG.forEach(function (b, i) {
          var p = paires.filter(function (x) { return x[0] === i; })[0];
          b.className = "choix" + (p ? " paire paire" + paires.indexOf(p) : "") + (gaucheChoisie === i ? " selection" : "");
        });
        bD.forEach(function (b, j) {
          var p = paires.filter(function (x) { return x[1] === j; })[0];
          b.className = "choix" + (p ? " paire paire" + paires.indexOf(p) : "");
          b.querySelector(".touche").textContent = p ? String(p[0] + 1) : "·";
        });
        valider.disabled = paires.length !== q.gauche.length;
      }
      function choisirG(i) {
        paires = paires.filter(function (x) { return x[0] !== i; });
        gaucheChoisie = i; maj();
      }
      function choisirD(j) {
        if (gaucheChoisie === null) {
          paires = paires.filter(function (x) { return x[1] !== j; }); maj(); return;
        }
        paires = paires.filter(function (x) { return x[1] !== j && x[0] !== gaucheChoisie; });
        paires.push([gaucheChoisie, j]);
        gaucheChoisie = null; maj();
      }
      var valider = boutonValider(function () { repondre(paires.slice()); });
      corps.appendChild(valider);
      maj();
      ui.clavier = function (k) {
        var n = parseInt(k, 10);
        if (n >= 1 && n <= q.gauche.length) { choisirG(n - 1); return true; }
        if (k === "Enter" && !valider.disabled) { repondre(paires.slice()); return true; }
        return false;
      };
    },
    trou: function (q, corps, repondre) {
      var morceaux = q.texte.split("___");
      var p = el("p", { class: "texte-trous" });
      var champs = [];
      morceaux.forEach(function (m, i) {
        p.appendChild(document.createTextNode(m));
        if (i < morceaux.length - 1) {
          var c;
          if (q.banque && q.banque.length) {
            c = el("select", { class: "trou" }, [el("option", { value: "", texte: "…" })].concat(q.banque.map(function (w) { return el("option", { value: w, texte: w }); })));
          } else {
            c = el("input", { class: "trou", type: "text", autocomplete: "off", spellcheck: "false" });
          }
          champs.push(c);
          p.appendChild(c);
        }
      });
      corps.appendChild(p);
      function envoyer() { repondre(champs.map(function (c) { return c.value; })); }
      corps.appendChild(boutonValider(envoyer));
      if (champs[0]) setTimeout(function () { champs[0].focus(); }, 0);
      ui.clavier = function (k) { if (k === "Enter") { envoyer(); return true; } return false; };
    }
  };

  // Panneau d'erreur : la bonne réponse, deux phrases d'explication, Continuer, fiche (si permis), signaler.
  // options : { ficheBloquee: bool }
  ui.panneauErreur = function (q, zone, suite, options) {
    options = options || {};
    zone.innerHTML = "";
    var f = JEU.questions.fiche(q.fiche);
    var panneau = el("div", { class: "panneau-erreur" }, [
      el("p", { class: "verdict", texte: "Pas tout à fait." }),
      el("p", { class: "bonne" }, [el("b", { texte: "La bonne réponse : " }), document.createTextNode(JEU.questions.texteReponse(q))]),
      el("p", { class: "explication", texte: q.explication || "" }),
      el("div", { class: "actions" }, [
        el("button", { class: "bouton principal", onclick: continuer, texte: "Continuer (Entrée)" }),
        f ? (options.ficheBloquee
          ? el("span", { class: "note", texte: "La fiche t'attend au bilan." })
          : el("button", { class: "bouton", onclick: function () { JEU.codex.ouvrirFiche(q.fiche); }, texte: "Voir la fiche" })) : null,
        el("button", { class: "lien signaler", onclick: function () { JEU.signalement.ouvrir(q); }, texte: "Signaler une erreur" })
      ])
    ]);
    zone.appendChild(panneau);
    panneau.querySelector(".bouton.principal").focus();
    var fait = false;
    function continuer() { if (fait) return; fait = true; ui.clavier = null; suite(); }
    ui.clavier = function (k) { if (k === "Enter" || k === " ") { continuer(); return true; } return false; };
    JEU.sons.jouer("erreur");
  };

  // ---------- partie en cours (assaut, sceau, épreuve) ----------
  ui.commencerPartie = function (titre, quitter) {
    JEU.partie = { enCours: true, titre: titre, quitter: quitter, derniere: null };
    JEU.mesure.debut = null;
    document.body.classList.add("en-partie");
    ui.afficher("partie");
    var s = document.getElementById("ecran-partie");
    s.innerHTML = "";
    var barre = el("div", { class: "barre-partie" }, [
      el("h2", { texte: titre }),
      el("button", { class: "lien signaler", id: "signaler-derniere", hidden: true, onclick: function () { if (JEU.partie.derniere) JEU.signalement.ouvrir(JEU.partie.derniere); }, texte: "Signaler la question précédente" }),
      el("button", { class: "bouton discret", onclick: function () {
        if (confirm("Quitter la partie ? Tu gardes tout ce que tu as déjà gagné.")) { ui.finirPartie(); if (quitter) quitter(); }
      }, texte: "Quitter" })
    ]);
    s.appendChild(barre);
    var zone = el("div", { class: "zone-partie" });
    s.appendChild(zone);
    return zone;
  };
  ui.noterDerniere = function (q) {
    if (!JEU.partie) return;
    JEU.partie.derniere = q;
    var b = document.getElementById("signaler-derniere");
    if (b) b.hidden = false;
  };
  ui.finirPartie = function () {
    JEU.partie = null;
    document.body.classList.remove("en-partie");
    ui.clavier = null;
    ui.majRessources();
  };

  // ---------- accueil ----------
  function prochainsDevoirs(semaine, etat) {
    return JEU.donnees.devoirs.filter(function (d) { return d.semaine >= semaine && !(etat.devoirs[d.id] && etat.devoirs[d.id].envoye); })
      .sort(function (a, b) { return a.semaine - b.semaine; });
  }

  ui.ecrans.accueil = function (s) {
    var etat = JEU.sauvegarde.etat();
    var sem = JEU.calendrier.semaine(new Date());
    var devoirs = prochainsDevoirs(sem.numero, etat);
    var prochain = devoirs.length ? devoirs.filter(function (d) { return d.semaine === devoirs[0].semaine; }) : [];
    s.innerHTML = "";
    var nbBat = etat.batiments.length;
    var st = JEU.domaine.stade(nbBat);
    var idx = JEU.domaine.STADES.indexOf(st);
    var valides = Object.keys(etat.cours).filter(function (k) { return etat.cours[k].etat === "valide"; }).length;
    var vues = Object.keys(etat.notions).length;
    s.appendChild(el("div", { class: "accueil-scene" }, [
      el("div", { class: "scene-fond tapisserie", title: "Tapisserie « Le cerf aux abois », vers 1495-1515 (The Met, domaine public)" }),
      el("div", { class: "titre-domaine" }, [
        el("div", { class: "blason-grand", html: JEU.icones.blason(etat.reglages.nomDomaine, 84) }),
        el("div", {}, [
          el("h1", { texte: etat.reglages.nomDomaine || "Le domaine" }),
          el("p", { class: "sous-titre", texte: st.nom + " · " + nbBat + " bâtiment" + (nbBat > 1 ? "s" : "") })
        ])
      ])
    ]));
    s.appendChild(el("div", { class: "cartouches" }, [
      el("div", { class: "cartouche" }, [el("h3", { html: JEU.icones.icone("sablier", 20) + " Calendrier" }), el("p", { class: "grand", texte: JEU.calendrier.libelle(sem) })]),
      el("div", { class: "cartouche" }, [el("h3", { html: JEU.icones.icone("parchemin-plume", 20) + " Prochain devoir" }),
        prochain.length ? el("ul", { class: "liste-simple" }, prochain.map(function (d) {
          return el("li", { texte: d.intitule + " · semaine " + d.semaine });
        })) : el("p", { texte: "Aucun devoir à venir." })]),
      el("div", { class: "cartouche" }, [el("h3", { html: JEU.icones.icone("trophee", 20) + " Chronique" }),
        el("p", { class: "stats" }, [el("b", { texte: String(valides) }), document.createTextNode(" cours validé" + (valides > 1 ? "s" : "") + " · "),
          el("b", { texte: String(vues) }), document.createTextNode(" notion" + (vues > 1 ? "s" : "") + " vue" + (vues > 1 ? "s" : ""))])])
    ]));
    if (JEU.sauvegarde.exportEnRetard()) {
      s.appendChild(el("div", { class: "rappel" }, [
        el("span", { texte: "Ton dernier export a plus de 7 jours. Exporte ta partie pour que ton père puisse la relire." }),
        el("button", { class: "bouton", onclick: function () { JEU.sauvegarde.exporter(); ui.toast("Partie exportée."); ui.afficher("accueil"); }, texte: "Exporter" })
      ]));
    }
    if (JEU.donnees.erreurs.length || (JEU.donnees.coursAbsents || []).length) {
      s.appendChild(el("p", { class: "note", texte: "Certains fichiers de cours n'ont pas pu être chargés : ils restent en « contenu à venir »." }));
    }
    var jouer = el("button", { class: "bouton principal enorme", onclick: function () { ui.afficher("jouer"); }, html: JEU.icones.icone("jouer", 34) + "<span>Jouer</span>" });
    s.appendChild(el("div", { class: "centre" }, [jouer]));
    setTimeout(function () { jouer.focus(); }, 0);
    ui.clavier = function (k) { if (k === "Enter") { ui.afficher("jouer"); return true; } return false; };
  };

  // ---------- jouer : choix du mini-jeu ----------
  ui.ecrans.jouer = function (s) {
    s.innerHTML = "";
    var etat = JEU.sauvegarde.etat();
    var aValider = [];
    JEU.progression.coursAccessibles(etat).forEach(function (id) { if (JEU.progression.etatCours(id, etat) === "ouvert") aValider.push(id); });
    s.appendChild(el("h1", { class: "titre-ecran", texte: "Aux armes, seigneur" }));
    var options = [
      { titre: "Assaut", texte: "8 questions. Joue tes cartes de notions contre la garnison d'un seigneur rival.", action: function () { JEU.assaut.choisirMatiere(); }, icone: "assaut" },
      { titre: "Sceau de vérité", texte: "10 affirmations à sceller : vraies à droite, fausses à gauche. Corrige les fausses.", action: function () { JEU.sceau.lancer(); }, icone: "sceau" },
      { titre: "Valider un cours", texte: aValider.length ? aValider.length + " cours ouvert" + (aValider.length > 1 ? "s" : "") + " à valider." : "Coche « cours fait » dans la liste des cours.", action: function () { ui.afficher("cours"); }, icone: "valider" }
    ];
    var grille = el("div", { class: "grille-jeux" });
    options.forEach(function (o, i) {
      grille.appendChild(el("button", { class: "carte-jeu", onclick: o.action }, [
        el("span", { class: "touche", texte: String(i + 1) }),
        el("span", { class: "illustration ill-" + o.icone }, [el("span", { class: "icone-jeu", html: JEU.icones.icone(o.icone, 44) })]),
        el("h2", { texte: o.titre }), el("p", { texte: o.texte })
      ]));
    });
    s.appendChild(grille);
    ui.clavier = function (k) {
      var n = parseInt(k, 10);
      if (n >= 1 && n <= options.length) { options[n - 1].action(); return true; }
      return false;
    };
  };

  // ---------- liste des cours ----------
  var ongletCours = "histoire";
  var LIBELLES = { presume: "Présumé acquis", valide: "Validé", ouvert: "Ouvert", avenir: "Contenu à venir", brume: "Dans la brume" };

  ui.ecrans.cours = function (s) {
    var etat = JEU.sauvegarde.etat();
    var sem = JEU.calendrier.semaine(new Date());
    s.innerHTML = "";
    s.appendChild(el("h1", { texte: "Les cours" }));
    var onglets = el("div", { class: "onglets", role: "tablist" });
    var liste = ["methode"].concat(JEU.ORDRE_MATIERES);
    liste.forEach(function (m) {
      var nom = m === "methode" ? "Savoir-faire" : JEU.MATIERES[m].nom;
      onglets.appendChild(el("button", { class: "onglet" + (m === ongletCours ? " actif" : ""), role: "tab",
        style: "--teinte:" + (m === "methode" ? "#b08d3a" : JEU.MATIERES[m].couleur),
        onclick: function () { ongletCours = m; ui.ecrans.cours(s); }, texte: nom }));
    });
    s.appendChild(onglets);
    var zone = el("div", { class: "liste-cours" });
    s.appendChild(zone);
    if (ongletCours === "methode") return rendreMethodes(zone, etat);
    if (ongletCours === "anglais") return rendreAnglais(zone, etat);
    var pos = JEU.progression.position(ongletCours, sem.numero, etat);
    var ecart = pos.ecart === 0 ? "pile à l'heure" : pos.ecart > 0 ? "en avance de " + pos.ecart + " cours" : "en retard de " + (-pos.ecart) + " cours";
    zone.appendChild(el("p", { class: "position", texte: pos.faits + " cours validés ou acquis sur " + pos.total + " · " + ecart + " par rapport au calendrier." }));
    var parSemaine = {};
    JEU.donnees.planning.filter(function (p) { return p.matiere === ongletCours; }).forEach(function (p) {
      (parSemaine[p.semaine] = parSemaine[p.semaine] || []).push(p);
    });
    Object.keys(parSemaine).map(Number).sort(function (a, b) { return a - b; }).forEach(function (w) {
      var bloc = el("div", { class: "semaine-bloc" + (w === sem.numero ? " courante" : "") }, [el("h3", { texte: "Semaine " + w + (w === sem.numero ? " · cette semaine" : "") })]);
      parSemaine[w].sort(function (a, b) { return a.ordre - b.ordre; }).forEach(function (p) { bloc.appendChild(ligneEntree(p, etat)); });
      zone.appendChild(bloc);
    });
    var courante = zone.querySelector(".courante");
    if (courante) setTimeout(function () { courante.scrollIntoView({ block: "start" }); }, 0);
  };

  function ligneEntree(p, etat) {
    if (p.type === "revision") {
      var fait = etat.cours[p.id] && etat.cours[p.id].etat === "fait";
      var cb = el("input", { type: "checkbox", checked: fait, onchange: function () { JEU.progression.cocherRevision(p.id, cb.checked); JEU.sauvegarde.enregistrer(); } });
      return el("div", { class: "ligne-cours revision" }, [el("label", {}, [cb, el("span", { texte: " " + p.titre })]), el("span", { class: "etat", texte: "Révision" })]);
    }
    if (p.type === "devoir") {
      return el("div", { class: "ligne-cours devoir" }, [el("span", { texte: p.titre }), el("span", { class: "etat", texte: "Devoir · siège au jalon 2" })]);
    }
    var st = JEU.progression.etatCours(p.id, etat);
    var ligne = el("div", { class: "ligne-cours etat-" + st });
    if (st === "brume") {
      ligne.appendChild(el("span", { class: "titre-brume", texte: p.titre }));
      ligne.appendChild(el("span", { class: "etat", texte: LIBELLES.brume }));
      return ligne;
    }
    ligne.appendChild(el("span", { texte: p.titre }));
    ligne.appendChild(actionCours(p.id, st, etat));
    return ligne;
  }

  function actionCours(id, st, etat) {
    var present = JEU.progression.fichierPresent(id);
    if (st === "ouvert") {
      var cb = el("input", { type: "checkbox", onchange: function () { if (cb.checked) JEU.validation.lancer(id); } });
      return el("label", { class: "action-cours" }, [cb, el("span", { texte: " Cours fait" })]);
    }
    if (st === "valide") {
      var sc = etat.cours[id] && etat.cours[id].score != null ? " · " + Math.round(etat.cours[id].score * 100) + " %" : "";
      return el("span", { class: "etat valide", texte: "Validé" + sc });
    }
    if (st === "presume") {
      if (present) return el("button", { class: "bouton petit", onclick: function () { JEU.validation.lancer(id); }, texte: "Présumé acquis · valider quand même" });
      return el("span", { class: "etat", texte: LIBELLES.presume });
    }
    return el("span", { class: "etat", texte: LIBELLES[st] || st });
  }

  function rendreMethodes(zone, etat) {
    var ms = JEU.progression.methodes();
    zone.appendChild(el("p", { class: "position", texte: "Les savoir-faire sont ouverts d'emblée. Valide-les quand tu veux." }));
    if (!ms.length) zone.appendChild(el("p", { texte: "Contenu à venir." }));
    ms.forEach(function (c) {
      var st = JEU.progression.etatCours(c.id, etat);
      zone.appendChild(el("div", { class: "ligne-cours etat-" + st }, [
        el("span", {}, [el("span", { class: "pastille", style: "--teinte:" + JEU.MATIERES[c.matiere].couleur, texte: JEU.MATIERES[c.matiere].nom }), document.createTextNode(" " + c.titre)]),
        actionCours(c.id, st, etat)
      ]));
    });
  }

  function rendreAnglais(zone, etat) {
    var seq = JEU.progression.sequencesAnglais();
    zone.appendChild(el("p", { class: "position", texte: "Les séquences s'ouvrent dans l'ordre, à ton rythme." }));
    if (!seq.length) zone.appendChild(el("p", { texte: "Contenu à venir : les séquences d'anglais n'ont pas encore été déposées." }));
    seq.forEach(function (c) {
      var st = JEU.progression.etatCours(c.id, etat);
      zone.appendChild(el("div", { class: "ligne-cours etat-" + st }, [
        el("span", { class: st === "brume" ? "titre-brume" : "", texte: c.titre }),
        st === "brume" ? el("span", { class: "etat", texte: LIBELLES.brume }) : actionCours(c.id, st, etat)
      ]));
    });
  }

  // ---------- réglages ----------
  ui.ecrans.reglages = function (s) {
    var etat = JEU.sauvegarde.etat();
    s.innerHTML = "";
    s.appendChild(el("h1", { texte: "Réglages et sauvegarde" }));
    var nom = el("input", { type: "text", value: etat.reglages.nomDomaine || "", maxlength: "40" });
    s.appendChild(el("div", { class: "cartouche" }, [
      el("h3", { texte: "Nom du domaine" }), nom,
      el("button", { class: "bouton", onclick: function () {
        etat.reglages.nomDomaine = nom.value.trim() || "Le domaine"; JEU.sauvegarde.enregistrer(); ui.majRessources(); ui.toast("Nom enregistré.");
      }, texte: "Enregistrer" })
    ]));
    var fichier = el("input", { type: "file", accept: ".json,application/json", hidden: true, onchange: function () {
      var f = fichier.files[0];
      if (!f) return;
      var lecteur = new FileReader();
      lecteur.onload = function () {
        if (!confirm("Importer cette sauvegarde ? Elle remplace la partie en cours.")) return;
        try {
          JEU.sauvegarde.importer(lecteur.result);
          JEU.progression.oublier();
          ui.majRessources();
          ui.toast("Sauvegarde importée.");
          ui.afficher("accueil");
        } catch (e) { alert("Import impossible : " + e.message); }
      };
      lecteur.readAsText(f);
    } });
    s.appendChild(el("div", { class: "cartouche" }, [
      el("h3", { texte: "Sauvegarde" }),
      el("p", { texte: "Ta partie est enregistrée dans ce navigateur. Exporte-la chaque semaine : ton père la dépose dans DEPOT\\sauvegardes." }),
      el("p", { class: "note", texte: etat.dernierExport ? "Dernier export : " + etat.dernierExport.replace("T", " à ") : "Aucun export pour l'instant." }),
      el("div", { class: "actions" }, [
        el("button", { class: "bouton principal", onclick: function () { JEU.sauvegarde.exporter(); ui.toast("Partie exportée."); ui.ecrans.reglages(s); }, texte: "Exporter" }),
        el("button", { class: "bouton", onclick: function () { fichier.click(); }, texte: "Importer" }), fichier
      ]),
      el("p", { class: "note", texte: "Signalements en attente : " + etat.signalements.length + ". Ils partent avec l'export." })
    ]));
    s.appendChild(el("div", { class: "cartouche" }, [
      el("h3", { texte: "Devoirs envoyés" }),
      el("p", { class: "note", texte: "Coche un devoir quand tu l'as envoyé, avec la date, comme sur le plan des devoirs papier." }),
      listeDevoirs(etat)
    ]));
    s.appendChild(el("div", { class: "cartouche" }, [
      el("h3", { texte: "Crédits" }),
      el("p", { texte: "Polices Cinzel et Crimson Text (SIL Open Font License). Sons, dessins et blasons créés pour ce jeu (CC0). Détail dans CREDITS.md." }),
      el("p", { class: "note", texte: "Version " + (JEU.version || "") })
    ]));
  };

  function listeDevoirs(etat) {
    var liste = el("div", { class: "liste-devoirs" });
    JEU.donnees.devoirs.slice().sort(function (a, b) { return a.semaine - b.semaine; }).forEach(function (d) {
      var info = etat.devoirs[d.id];
      var date = el("input", { type: "date", value: info && info.envoye ? info.envoye : U.jour() });
      var cb = el("input", { type: "checkbox", checked: !!(info && info.envoye), onchange: maj });
      function maj() {
        if (cb.checked) etat.devoirs[d.id] = { envoye: date.value || U.jour() };
        else delete etat.devoirs[d.id];
        JEU.sauvegarde.enregistrer();
      }
      date.addEventListener("change", function () { if (cb.checked) maj(); });
      liste.appendChild(el("div", { class: "ligne-devoir" }, [el("label", {}, [cb, el("span", { texte: " S" + d.semaine + " · " + d.intitule })]), date]));
    });
    return liste;
  }

  // ---------- mesure du temps entre une réponse et la question suivante ----------
  JEU.mesure = {
    debut: null, valeurs: [],
    reponseDonnee: function () { this.debut = (racine.performance || Date).now(); },
    questionAffichee: function () {
      if (this.debut == null) return;
      this.valeurs.push((racine.performance || Date).now() - this.debut);
      this.debut = null;
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
