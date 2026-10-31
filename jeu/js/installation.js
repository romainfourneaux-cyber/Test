// Installation : version web installable (tablette Android, Chrome) et jeu hors ligne.
// En http(s) seulement, ce module enregistre le service worker sw.js (généré par atelier/outils/generer-sw.js), qui met
// tous les fichiers du jeu en cache. Jamais en file:// : le double-clic sur index.html sur le PC reste tel quel.
// Il ajoute aussi, dans les Réglages, l'état du mode hors ligne, le bouton « Mettre à jour » et, quand le navigateur
// le propose, le bouton « Installer sur la tablette ». Le jeu lui-même ne fait aucun appel réseau pendant la partie :
// le service worker est le mécanisme d'installation du navigateur, rien d'autre.
// Chargé en dernier (balise defer dans l'en-tête de index.html) : JEU.ui existe déjà.
(function (racine) {
  "use strict";
  var JEU = racine.JEU = racine.JEU || {};
  var nav = racine.navigator, loc = racine.location, doc = racine.document;
  var inst = JEU.installation = { enregistrement: null, invite: null, erreur: null, controle: false };

  function surHttp() { return !!loc && (loc.protocol === "http:" || loc.protocol === "https:"); }
  // Vrai seulement sur la version web, dans un navigateur qui connaît les service workers.
  // L'application Android (atelier/android, pont window.AndroidDomaine) sert déjà tout depuis l'APK : rien à enregistrer.
  function possible() { return surHttp() && !!nav && !!nav.serviceWorker && typeof racine.AndroidDomaine === "undefined"; }
  function installe() {
    try { return !!(racine.matchMedia && racine.matchMedia("(display-mode: standalone)").matches); } catch (e) { return false; }
  }
  function toast(t) { if (JEU.ui && JEU.ui.toast) JEU.ui.toast(t); }

  function enregistrer() {
    if (!possible()) return false;
    try {
      inst.controle = !!nav.serviceWorker.controller;
      nav.serviceWorker.register("sw.js").then(function (reg) { inst.enregistrement = reg; rafraichir(); })
        .catch(function (e) { inst.erreur = (e && e.message) || "refusé"; rafraichir(); try { console.warn("Service worker : " + inst.erreur); } catch (x) { /* rien */ } });
      nav.serviceWorker.addEventListener("controllerchange", function () { inst.controle = true; rafraichir(); });
    } catch (e) { inst.erreur = (e && e.message) || "refusé"; }
    return true;
  }

  // ---------- Réglages ----------
  function etatTexte() {
    var v = "Version " + (JEU.version || "");
    if (installe()) return v + " · mode installé";
    if (inst.controle || (nav.serviceWorker && nav.serviceWorker.controller)) return v + " · hors ligne prêt";
    if (inst.erreur) return v + " · hors ligne indisponible";
    return v + " · hors ligne en préparation…";
  }

  function rafraichir() {
    if (!doc || !doc.querySelector) return;
    var e = doc.querySelector("[data-installation='etat']");
    if (e) e.textContent = etatTexte();
    var b = doc.querySelector("[data-installation='installer']");
    if (b) b.hidden = !inst.invite;
  }

  function proposerRechargement() {
    if (JEU.ui && JEU.ui.confirmer) JEU.ui.confirmer("Nouvelle version prête. Recharger le jeu maintenant ? Ta partie est enregistrée.", "Recharger", function () { loc.reload(); }, "Plus tard");
    else toast("Nouvelle version prête : recharge le jeu.");
  }

  function mettreAJour() {
    var reg = inst.enregistrement;
    if (!reg) { toast("Mise à jour impossible pour l'instant."); return; }
    if (!nav.serviceWorker.controller && !installe()) { toast("Le jeu finit de s'installer : réessaie dans un instant."); return; }
    toast("Recherche d'une nouvelle version…");
    reg.update().then(function () {
      var w = reg.installing || reg.waiting;
      if (!w) { toast("Le jeu est déjà à jour."); return; }
      if (w.state === "activated") { proposerRechargement(); return; }
      w.addEventListener("statechange", function () {
        if (w.state === "activated") proposerRechargement();
        else if (w.state === "redundant") toast("La mise à jour n'a pas abouti.");
      });
    }).catch(function () { toast("Pas de réseau : la mise à jour attendra."); });
  }

  function installer() {
    var ev = inst.invite;
    if (!ev) return;
    inst.invite = null;
    rafraichir();
    try {
      ev.prompt();
      if (ev.userChoice && ev.userChoice.then) ev.userChoice.then(function (r) { if (r && r.outcome === "accepted") toast("Le domaine s'installe sur l'écran d'accueil."); });
    } catch (e) { /* rien */ }
  }

  function cartouche() {
    var el = JEU.ui.el;
    var btnInstaller = el("button", { class: "bouton", "data-installation": "installer", onclick: installer, texte: "Installer sur la tablette" });
    btnInstaller.hidden = !inst.invite;
    return el("div", { class: "cartouche", "data-installation": "cartouche" }, [
      el("h3", { texte: "Tablette et hors ligne" }),
      el("p", { texte: "Sur la tablette, le jeu se garde entier dans le navigateur : une fois ouvert une première fois, il marche sans réseau. Pour l'avoir comme une application : menu de Chrome, « Ajouter à l'écran d'accueil » ou « Installer l'application »." }),
      el("div", { class: "actions" }, [
        el("button", { class: "bouton", onclick: mettreAJour, texte: "Mettre à jour" }),
        btnInstaller
      ]),
      el("p", { class: "note", texte: "« Mettre à jour » va chercher la dernière version quand il y a du réseau. Ta partie reste enregistrée dans ce navigateur : pense à l'exporter." })
    ]);
  }

  // Enrobe l'écran des Réglages (jeu/js/interface.js, intact) : la ligne « Version » reçoit l'état du mode hors ligne
  // et un cartouche « Tablette et hors ligne » se place avant les crédits. En file://, l'écran ne change pas.
  function brancherReglages() {
    var ui = JEU.ui;
    if (!ui || !ui.ecrans || typeof ui.ecrans.reglages !== "function" || ui.ecrans.reglages.installation) return;
    var original = ui.ecrans.reglages;
    var enrobe = function (s, arg) {
      original.call(this, s, arg);
      if (!possible()) return;
      var notes = s.querySelectorAll ? s.querySelectorAll("p.note") : [];
      var ligne = null;
      for (var i = 0; i < notes.length; i++) if (/^Version /.test(notes[i].textContent)) ligne = notes[i];
      var c = cartouche();
      if (ligne) {
        ligne.setAttribute("data-installation", "etat");
        ligne.textContent = etatTexte();
        var credits = ligne.closest ? ligne.closest(".cartouche") : null;
        if (credits && credits.parentNode === s) s.insertBefore(c, credits); else s.appendChild(c);
      } else {
        c.insertBefore(JEU.ui.el("p", { class: "note", "data-installation": "etat", texte: etatTexte() }), c.firstChild.nextSibling);
        s.appendChild(c);
      }
    };
    enrobe.installation = true;
    ui.ecrans.reglages = enrobe;
  }

  inst.possible = possible;
  inst.etatTexte = etatTexte;
  inst.mettreAJour = mettreAJour;

  if (enregistrer()) {
    brancherReglages();
    if (racine.addEventListener) {
      // Chrome Android propose l'installation : on garde l'invitation pour le bouton des Réglages.
      racine.addEventListener("beforeinstallprompt", function (e) { e.preventDefault(); inst.invite = e; rafraichir(); });
      racine.addEventListener("appinstalled", function () { inst.invite = null; rafraichir(); toast("Le domaine est installé sur l'écran d'accueil."); });
    }
  }
})(typeof window !== "undefined" ? window : globalThis);
