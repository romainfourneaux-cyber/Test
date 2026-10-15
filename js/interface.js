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
    s.classList.remove("entree"); void s.offsetWidth; s.classList.add("entree");
  };
  ui.ecrans = {};
  ui.ecranCourant = function () { return ecranCourant; };

  // ---------- clavier ----------
  // ui.clavier : fonction(touche) de l'écran actif ; renvoie true si la touche est utilisée.
  // Un bouton atteint avec Tab garde son action propre à Entrée et Espace : le raccourci de l'écran ne la lui vole pas.
  // Après un clic de souris, Entrée reste le raccourci de l'écran (Valider, Continuer, Lancer la vague…).
  // On note d'où vient le focus au moment où il arrive : à cet instant, :focus-visible est faux après un clic
  // et vrai après Tab. Au moment d'une touche, c'est trop tard : Chromium le rend vrai même pour un bouton cliqué.
  // Un focus posé par le jeu juste après un clic (un panneau redessiné) compte aussi comme venu de la souris.
  var focusClavier = false, sourisRecente = false;
  document.addEventListener("pointerdown", function () { focusClavier = false; sourisRecente = true; }, true);
  document.addEventListener("keydown", function () { sourisRecente = false; }, true);
  document.addEventListener("focusin", function (ev) {
    try { focusClavier = !sourisRecente && !!(ev.target && ev.target.matches && ev.target.matches(":focus-visible")); } catch (e) { focusClavier = false; }
  });
  // Vrai si le focus actuel a été donné au clavier (Tab, ou focus posé par le jeu juste après une touche).
  ui.focusAuClavier = function () { return focusClavier; };
  function boutonAuClavier(t) {
    if (!focusClavier || !t || t === document.body || !t.matches) return false;
    return t.matches("button, a[href]");
  }
  document.addEventListener("keydown", function (ev) {
    // dans un champ, seules Entrée (valider) et Échap (fermer, quitter) vont au jeu
    if (ev.target && /INPUT|TEXTAREA|SELECT/.test(ev.target.tagName) && ev.key !== "Enter" && ev.key !== "Escape") return;
    if (ev.altKey || ev.ctrlKey || ev.metaKey) return;
    if (ui.modaleOuverte()) {
      if (ev.key === "Escape") { ui.fermerModale(); ev.preventDefault(); }
      return;
    }
    if ((ev.key === "Enter" || ev.key === " ") && boutonAuClavier(ev.target)) return;
    if (ui.clavier && ui.clavier(ev.key, ev)) { ev.preventDefault(); return; }
    if (ev.key === "Escape" && JEU.partie && JEU.partie.enCours) { ev.preventDefault(); ui.proposerQuitter(); }
  });

  // ---------- notifications ----------
  // genre : classe en plus (« tribut » : en haut à droite) ; duree : ms d'affichage (1,6 s par défaut). Le toast
  // garde son genre en s'effaçant (il ne saute pas d'un coin à l'autre de l'écran).
  var minuterieToast = null;
  ui.toast = function (texte, genre, duree) {
    var t = document.getElementById("toast");
    t.textContent = texte;
    t.className = "toast visible " + (genre || "");
    clearTimeout(minuterieToast);
    minuterieToast = setTimeout(function () { t.className = "toast " + (genre || ""); }, duree || 1600);
  };

  // Sceau qui s'imprime au centre de l'écran (350 ms), sans retarder la question suivante : il est posé une image
  // après elle (JEU.anim.apresImage). Un nouveau sceau remplace celui qui est encore affiché : deux bonnes réponses
  // rapprochées ne les impriment jamais l'un sur l'autre.
  ui.tampon = function (texte, sous) {
    var poser = function () {
      Array.prototype.forEach.call(document.querySelectorAll(".tampon"), function (x) { x.remove(); });
      var t = document.createElement("div");
      t.className = "tampon";
      t.innerHTML = JEU.icones.icone("sceau", 120) + "<b>" + U.echapper(texte) + "</b>" + (sous ? "<span>" + U.echapper(sous) + "</span>" : "");
      document.body.appendChild(t);
      setTimeout(function () { t.remove(); }, 700);
    };
    if (JEU.anim && JEU.anim.apresImage) JEU.anim.apresImage(poser); else poser();
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
  // Tab reste dans la fenêtre ouverte (le jeu derrière n'est plus atteignable au clavier).
  document.addEventListener("keydown", function (ev) {
    if (ev.key !== "Tab" || !ui.modaleOuverte()) return;
    var boite = document.querySelector("#modale .modale-boite");
    var f = Array.prototype.filter.call(boite.querySelectorAll("button, input, textarea, select, a[href], [tabindex]:not([tabindex='-1'])"), function (x) { return !x.disabled && x.offsetParent !== null; });
    if (!f.length) return;
    var premier = f[0], dernier = f[f.length - 1];
    if (!boite.contains(document.activeElement)) { ev.preventDefault(); premier.focus(); }
    else if (ev.shiftKey && document.activeElement === premier) { ev.preventDefault(); dernier.focus(); }
    else if (!ev.shiftKey && document.activeElement === dernier) { ev.preventDefault(); premier.focus(); }
  }, true);
  ui.fermerModale = function () {
    document.getElementById("modale").hidden = true;
    var r = retourModale; retourModale = null;
    if (r) r();
  };
  ui.modaleOuverte = function () { return !document.getElementById("modale").hidden; };

  // Confirmation dans la page (les boîtes confirm() et alert() sont bloquées sur la version web).
  ui.confirmer = function (question, texteOui, siOui, texteNon) {
    var oui = el("button", { class: "bouton principal", texte: texteOui || "Oui" });
    var non = el("button", { class: "bouton", texte: texteNon || "Non, je reste" });
    var boite = el("div", { class: "confirmation" }, [el("p", { texte: question }), el("div", { class: "actions" }, [oui, non])]);
    oui.addEventListener("click", function () { ui.fermerModale(); siOui(); });
    non.addEventListener("click", ui.fermerModale);
    ui.ouvrirModale(null, boite);
    oui.focus();
  };
  ui.message = function (titre, texte) {
    var ok = el("button", { class: "bouton principal", onclick: ui.fermerModale, texte: "Compris" });
    ui.ouvrirModale(titre, el("div", { class: "confirmation" }, [el("p", { texte: texte }), el("div", { class: "actions" }, [ok])]));
  };

  // ---------- bandeau : ressources ----------
  // Les médaillons sont bâtis une fois ; ensuite seuls les nombres qui changent sont remplacés (une bonne réponse ne
  // fait pas redessiner tout le bandeau). Les boutons du son et de la musique ne changent que si leur état change.
  ui.majRessources = function () {
    var etat = JEU.sauvegarde.etat();
    var zone = document.getElementById("ressources");
    var cles = Object.keys(JEU.RESSOURCES);
    if (zone.getAttribute("data-cles") !== cles.join() || zone.children.length !== cles.length) {
      zone.innerHTML = "";
      cles.forEach(function (k) {
        var r = JEU.RESSOURCES[k];
        zone.appendChild(el("span", { class: "ressource", "data-res": k, title: r.nom + " (" + JEU.MATIERES[r.matiere].nom + ")", style: "--teinte:" + JEU.MATIERES[r.matiere].couleur }, [
          el("span", { class: "medaillon", html: JEU.icones.ressource(k, 20) }),
          el("b", { texte: String(etat.ressources[k] || 0) })
        ]));
      });
      zone.setAttribute("data-cles", cles.join());
    } else cles.forEach(function (k, i) {
      var b = zone.children[i].querySelector("b"), t = String(etat.ressources[k] || 0);
      if (b && b.textContent !== t) b.textContent = t;
    });
    var bl = document.getElementById("blason-bandeau");
    if (bl && bl.getAttribute("data-nom") !== etat.reglages.nomDomaine) { bl.innerHTML = JEU.icones.blason(etat.reglages.nomDomaine, 30); bl.setAttribute("data-nom", etat.reglages.nomDomaine); }
    var nom = document.getElementById("nom-domaine");
    if (nom) nom.textContent = etat.reglages.nomDomaine || "Le domaine";
    var son = document.getElementById("bouton-son");
    var mus = document.getElementById("bouton-musique");
    var mOn = etat.reglages.musique !== false, sOn = !!etat.reglages.son;
    if (mus && mus.getAttribute("data-etat") !== String(mOn)) { mus.setAttribute("data-etat", String(mOn)); mus.innerHTML = JEU.icones.icone("musique", 22); mus.classList.toggle("coupe", !mOn); mus.title = mOn ? "Couper la musique" : "Remettre la musique"; mus.setAttribute("aria-pressed", mOn ? "true" : "false"); }
    if (son && son.getAttribute("data-etat") !== String(sOn)) { son.setAttribute("data-etat", String(sOn)); son.innerHTML = JEU.icones.icone(sOn ? "son" : "sans-son", 22); son.title = sOn ? "Couper les bruitages" : "Remettre les bruitages"; son.setAttribute("aria-pressed", sOn ? "true" : "false"); }
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
    if (options.recit) zone.appendChild(ui.recit(options.recit));
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

  // Bandeau de récit : le personnage qui pose la question, et la situation.
  ui.recit = function (r) {
    return el("div", { class: "recit" }, [
      el("span", { class: "recit-portrait", html: JEU.icones.icone(r.icone, 34) }),
      el("div", {}, [el("b", { class: "recit-nom", texte: r.nom }), el("p", { class: "recit-texte", texte: r.texte })])
    ]);
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
        var corr = U.melanger(q.corrections);
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
        var complet = paires.length === q.gauche.length;
        // dernier appariement : on prévient l'écran (la bataille amène alors « Valider » en vue)
        if (complet && valider.disabled && typeof CustomEvent === "function") corps.dispatchEvent(new CustomEvent("paires-completes", { bubbles: true }));
        valider.disabled = !complet;
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

  // Panneau d'erreur : la bonne réponse, deux phrases d'explication, Continuer, la fiche, signaler.
  // Association : la bonne réponse en liste, une paire par ligne. L'explication n'est pas montrée si elle ne fait que
  // redire la bonne réponse (mêmes paires, « : » au lieu de « → »).
  function sansPonctuation(t) { return String(t || "").toLowerCase().replace(/[→:;,.!?«»"'’()\s-]+/g, " ").trim(); }
  function repeteReponse(q) {
    if (!q.explication) return false;
    var e = sansPonctuation(q.explication);
    if (e === sansPonctuation(JEU.questions.texteReponse(q))) return true;
    if (q.type !== "association" || !q.reponse) return false;
    // toutes les paires de la bonne réponse se retrouvent dans l'explication, et elle ne dit rien de plus
    var paires = q.reponse.map(function (p) { return sansPonctuation(q.gauche[p[0]] + " " + q.droite[p[1]]); });
    var reste = e;
    for (var i = 0; i < paires.length; i++) {
      if (reste.indexOf(paires[i]) < 0) return false;
      reste = reste.replace(paires[i], " ");
    }
    return reste.replace(/\s+/g, "").length < 4;
  }
  ui.repeteReponse = repeteReponse; // pour l'essai de bout en bout
  ui.panneauErreur = function (q, zone, suite) {
    zone.innerHTML = "";
    var f = JEU.questions.fiche(q.fiche);
    var bonne = q.type === "association" && q.reponse && q.reponse.length
      ? el("div", { class: "bonne" }, [el("b", { texte: "La bonne réponse :" }), el("ul", { class: "paires" }, q.reponse.map(function (p) {
        return el("li", {}, [el("b", { texte: q.gauche[p[0]] }), document.createTextNode(" → " + q.droite[p[1]])]);
      }))])
      : el("p", { class: "bonne" }, [el("b", { texte: "La bonne réponse : " }), document.createTextNode(JEU.questions.texteReponse(q))]);
    var panneau = el("div", { class: "panneau-erreur" }, [
      el("p", { class: "verdict", texte: "Pas tout à fait." }),
      bonne,
      repeteReponse(q) ? null : el("p", { class: "explication", texte: q.explication || "" }),
      el("div", { class: "actions" }, [
        el("button", { class: "bouton principal", onclick: continuer, texte: "Continuer (Entrée)" }),
        f ? el("button", { class: "bouton", onclick: function () { JEU.codex.ouvrirFiche(q.fiche); }, texte: "Voir la fiche" }) : null,
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

  // ---------- partie en cours (bataille, conseil, événement) ----------
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
      el("button", { class: "bouton discret", id: "bouton-quitter", onclick: ui.proposerQuitter, texte: "Quitter (Échap)" })
    ]);
    s.appendChild(barre);
    var zone = el("div", { class: "zone-partie" });
    s.appendChild(zone);
    return zone;
  };
  // Quitter une partie : confirmation dans la page, puis retour à l'écran d'origine.
  ui.proposerQuitter = function () {
    if (!JEU.partie) return;
    var quitter = JEU.partie.quitter;
    ui.confirmer("Quitter la partie ? Tu gardes tout ce que tu as déjà gagné.", "Quitter", function () {
      if (JEU.partie && JEU.partie.surQuitter) JEU.partie.surQuitter();
      ui.finirPartie(); if (quitter) quitter();
    });
  };
  ui.noterDerniere = function (q) {
    if (!JEU.partie) return;
    JEU.partie.derniere = q;
    var b = document.getElementById("signaler-derniere");
    if (b) b.hidden = false;
  };
  ui.finirPartie = function () {
    JEU.partie = null;
    if (JEU.musique) JEU.musique.humeur("paix");
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
    var valides = JEU.progression.totalAcquis(etat); // même compte que l'écran Cours
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
        el("p", { class: "stats" }, [el("b", { texte: String(valides) }), document.createTextNode(" cours acquis · "),
          el("b", { texte: String(vues) }), document.createTextNode(" notion" + (vues > 1 ? "s" : "") + " vue" + (vues > 1 ? "s" : ""))])])
    ]));
    if (JEU.sauvegarde.exportEnRetard()) {
      s.appendChild(el("div", { class: "rappel" }, [
        el("span", { texte: "Ton dernier export a plus de 7 jours. Exporte ta partie pour que ton père puisse la relire." }),
        el("button", { class: "bouton", onclick: function () { JEU.sauvegarde.exporter(); ui.toast("Partie exportée."); ui.afficher("accueil"); }, texte: "Exporter" })
      ]));
    }
    if (JEU.donnees.erreurs.length || (JEU.donnees.coursAbsents || []).length) {
      s.appendChild(el("p", { class: "note", texte: "Certains fichiers de cours n'ont pas pu être chargés : ces cours restent dans la brume." }));
    }
    var jouer = el("button", { class: "bouton principal enorme", onclick: function () { ui.afficher("jouer"); }, html: JEU.icones.icone("jouer", 34) + "<span>Jouer</span>" });
    s.appendChild(el("div", { class: "centre" }, [jouer]));
    setTimeout(function () { jouer.focus(); }, 0);
    ui.clavier = function (k) { if (k === "Enter") { ui.afficher("jouer"); return true; } return false; };
  };

  // L'écran « jouer » (la campagne) est dans ecran-campagne.js.

  // ---------- liste des cours ----------
  var ongletCours = "histoire";
  var LIBELLES = { presume: "Présumé acquis", acquis: "Acquis", "a-revoir": "À revoir", ouvert: "En cours", avenir: "Contenu à venir", brume: "Dans la brume" };

  ui.ecrans.cours = function (s) {
    var etat = JEU.sauvegarde.etat();
    var sem = JEU.calendrier.semaine(new Date());
    s.innerHTML = "";
    s.appendChild(el("h1", { texte: "Les cours" }));
    s.appendChild(el("p", { class: "note", texte: "Le chroniqueur estime d'après tes devoirs corrigés si un cours est acquis ou à revoir. Les notions à revoir reviennent plus souvent dans tes batailles et au conseil. Le calendrier n'est qu'un repère : tu avances à ton rythme." }));
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
    zone.appendChild(lignePosition(ongletCours, etat));
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
      return el("div", { class: "ligne-cours revision" }, [el("span", { texte: p.titre }), el("span", { class: "etat", texte: "Révision" })]);
    }
    if (p.type === "devoir") {
      return el("div", { class: "ligne-cours devoir" }, [el("span", { texte: p.titre }), el("span", { class: "etat", texte: "Devoir" })]);
    }
    var st = JEU.progression.etatCours(p.id, etat);
    var ligne = el("div", { class: "ligne-cours etat-" + st });
    ligne.appendChild(el("span", { class: st === "brume" ? "titre-brume" : "", texte: p.titre }));
    ligne.appendChild(etiquetteCours(p.id, st));
    return ligne;
  }

  // Compte neutre de l'onglet (le même que l'accueil) : aucune avance ni aucun retard sur le calendrier.
  function lignePosition(onglet, etat, phrase) {
    var pos = JEU.progression.position(onglet, etat);
    var morceaux = [pos.acquis + " acquis"];
    if (pos.presumes) morceaux.push(pos.presumes + (pos.presumes > 1 ? " présumés acquis" : " présumé acquis"));
    if (pos.aRevoir) morceaux.push(pos.aRevoir + " à revoir");
    if (pos.enCours) morceaux.push(pos.enCours + " en cours");
    var texte = pos.total ? "Sur " + pos.total + " cours : " + morceaux.join(", ") + "." : "";
    if (phrase) texte = phrase + (texte ? " " + texte : "");
    return el("p", { class: "position", texte: texte });
  }

  // État du cours, en lecture seule, avec la remarque du chroniqueur s'il y en a une.
  function etiquetteCours(id, st) {
    var est = JEU.progression.estimation(id);
    var t = LIBELLES[st] || st;
    if (st === "presume" && !JEU.donnees.cours[id]) t += " · contenu à venir";
    return el("span", { class: "etat " + st, title: est && est.note ? est.note : "", texte: t + (est && est.note && st === "a-revoir" ? " · " + est.note : "") });
  }

  function rendreMethodes(zone, etat) {
    var ms = JEU.progression.methodes();
    zone.appendChild(lignePosition("methode", etat, "Les savoir-faire sont ouverts d'emblée et reviennent dans toutes tes batailles."));
    if (!ms.length) zone.appendChild(el("p", { texte: "Contenu à venir." }));
    ms.forEach(function (c) {
      var st = JEU.progression.etatCours(c.id, etat);
      zone.appendChild(el("div", { class: "ligne-cours etat-" + st }, [
        el("span", {}, [el("span", { class: "pastille", style: "--teinte:" + JEU.MATIERES[c.matiere].couleur, texte: JEU.MATIERES[c.matiere].nom }), document.createTextNode(" " + c.titre)]),
        etiquetteCours(c.id, st)
      ]));
    });
  }

  function rendreAnglais(zone, etat) {
    var seq = JEU.progression.sequencesAnglais();
    zone.appendChild(lignePosition("anglais", etat, "Chaque séquence s'ouvre dès que son contenu est prêt."));
    if (!seq.length) zone.appendChild(el("p", { texte: "Contenu à venir : les séquences d'anglais n'ont pas encore été déposées." }));
    seq.forEach(function (c) {
      var st = JEU.progression.etatCours(c.id, etat);
      zone.appendChild(el("div", { class: "ligne-cours etat-" + st }, [
        el("span", { class: st === "brume" ? "titre-brume" : "", texte: c.titre }),
        etiquetteCours(c.id, st)
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
        ui.confirmer("Importer cette sauvegarde ? Elle remplace la partie en cours.", "Importer", function () {
          // importer() ne lance que des messages en français, écrits pour l'élève ; la partie en cours reste alors intacte.
          try { JEU.sauvegarde.importer(lecteur.result); } catch (e) { ui.message("Import impossible", e.message); return; }
          JEU.progression.oublier();
          ui.appliquerReglages();
          ui.majRessources();
          ui.toast("Sauvegarde importée.");
          ui.afficher("accueil");
        });
      };
      lecteur.readAsText(f);
      fichier.value = ""; // le même fichier pourra être choisi de nouveau
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
    var animCase = el("input", { type: "checkbox", checked: etat.reglages.animations !== false, onchange: function () {
      etat.reglages.animations = animCase.checked; JEU.sauvegarde.enregistrer(); ui.appliquerAnimations();
    } });
    s.appendChild(el("div", { class: "cartouche" }, [
      el("h3", { texte: "Animations" }),
      el("label", {}, [animCase, el("span", { texte: " Ambiance animée (fumées, nuages, villageois, drapeaux, particules)" })]),
      el("p", { class: "note", texte: "À décocher si l'ordinateur rame ou si le mouvement gêne. Le jeu reste aussi rapide dans les deux cas." })
    ]));
    s.appendChild(el("div", { class: "cartouche" }, [
      el("h3", { texte: "Crédits" }),
      el("p", { texte: "Icônes de Game-icons.net (Lorc, Delapouite et d'autres auteurs, licence CC BY 3.0). Tapisseries et œuvres du Metropolitan Museum of Art (domaine public, CC0). Polices Cinzel et Crimson Text (SIL Open Font License). Sons, musique, textures, cartes et blasons créés pour ce jeu (CC0). Détail dans CREDITS.md." }),
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

  ui.appliquerAnimations = function () {
    document.body.classList.toggle("sans-anim", !(JEU.anim && JEU.anim.actif()));
  };

  // Après un import : la musique et les animations suivent tout de suite les réglages de la sauvegarde.
  // (L'import est confirmé par un clic : le navigateur autorise alors le son.)
  ui.appliquerReglages = function () {
    if (JEU.musique) { if (JEU.musique.actif()) JEU.musique.demarrer(); else JEU.musique.arreter(); }
    ui.appliquerAnimations();
  };

  // Les polices sont toutes chargées dès l'ouverture, et non à leur premier emploi (en pleine bataille, ou sur la
  // carte) : aucun texte ne change de police, et la page n'est pas remise en forme, pendant une partie.
  try { if (document.fonts && document.fonts.forEach) document.fonts.forEach(function (f) { f.load().catch(function () { /* police absente : repli */ }); }); } catch (e) { /* navigateur ancien */ }

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
