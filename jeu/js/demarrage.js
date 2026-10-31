// Démarrage : charge les cours listés, la sauvegarde, puis affiche l'accueil.
(function (racine) {
  "use strict";
  var JEU = racine.JEU;

  // Images des menus habillés (jeu/css/menus.css) : lues au lancement et gardées en mémoire, comme celles des
  // expéditions ; aucune ne se lit sur le disque pendant une question. Même liste que les url() d'images de menus.css
  // (contrôle : atelier/outils/controles-menus.js).
  var IMAGES_MENUS = ["bossette-laiton", "sangle-bord", "fanion", "cartouche-or", "cartouche-or-appui", "cartouche-parchemin",
    "cartouche-parchemin-appui", "cartouche-plomb", "sceau-case", "sceau-acquis", "sceau-revoir", "sceau-or", "coin-dore", "embout-rouleau", "rail-laiton"];
  var imagesMenus = [];
  function prechargerImagesMenus() {
    IMAGES_MENUS.forEach(function (n) { var im = new Image(); im.src = "assets/images/menus/" + n + ".png"; imagesMenus.push(im); });
  }
  JEU.imagesMenus = IMAGES_MENUS;

  // Écran de chargement : le blason et le nom du domaine dès le départ, puis le rail qui se remplit à chaque cours chargé.
  function blocAttente() {
    var b = document.querySelector(".attente");
    if (!b) return null;
    var nom = JEU.sauvegarde.etat().reglages.nomDomaine || "Le domaine";
    var bl = b.querySelector(".attente-blason"), ti = b.querySelector(".attente-titre");
    if (bl && JEU.icones && JEU.icones.blason) bl.innerHTML = JEU.icones.blason(nom, 92);
    if (ti) ti.textContent = nom;
    return b;
  }

  function demarrer() {
    if (!JEU.donnees.config) {
      document.body.innerHTML = "<p style='padding:2em'>Le fichier data/config.js est introuvable. Le jeu ne peut pas démarrer.</p>";
      return;
    }
    JEU.sauvegarde.charger();
    JEU.sons.precharger();
    prechargerImagesMenus();
    var bloc = blocAttente();
    var rail = bloc && bloc.querySelector(".attente-rail"), compte = bloc && bloc.querySelector(".attente-compte");
    function avance(faits, total) {
      if (rail) rail.style.setProperty("--p", String(total ? faits / total : 1));
      if (compte) compte.textContent = "Ouverture des archives · " + faits + " / " + total;
    }
    JEU.chargeur.chargerCours(function () {
      JEU.questions.vider();
      JEU.progression.oublier();
      document.body.classList.remove("chargement");
      var ICONES_MENU = { accueil: "accueil", domaine: "domaine", jouer: "campagne", cours: "cours", codex: "codex", reglages: "reglages" };
      Array.prototype.forEach.call(document.querySelectorAll("#menu button"), function (b) {
        b.insertAdjacentHTML("afterbegin", JEU.icones.icone(ICONES_MENU[b.getAttribute("data-ecran")], 22));
        b.addEventListener("click", function () { JEU.ui.afficher(b.getAttribute("data-ecran")); });
      });
      document.getElementById("bouton-son").addEventListener("click", JEU.sons.basculer);
      document.getElementById("bouton-musique").addEventListener("click", JEU.musique.basculer);
      JEU.musique.brancher();
      document.getElementById("modale").addEventListener("click", function (e) { if (e.target.id === "modale") JEU.ui.fermerModale(); });
      var bl = document.getElementById("blason-bandeau");
      if (bl) bl.innerHTML = JEU.icones.blason(JEU.sauvegarde.etat().reglages.nomDomaine, 30);
      JEU.ui.majRessources();
      JEU.ui.appliquerAnimations();
      JEU.ui.afficher("accueil");
      JEU.pret = true;
      // le bloc de chargement s'efface en 150 ms par-dessus l'accueil (opacité seulement) ; sans animations, il part d'un coup
      if (bloc && JEU.anim && JEU.anim.actif()) {
        bloc.classList.add("fondu");
        setTimeout(function () { bloc.classList.remove("fondu"); }, 200);
      }
    }, avance);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", demarrer);
  else demarrer();
})(window);
