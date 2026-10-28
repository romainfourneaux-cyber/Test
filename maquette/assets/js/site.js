/* Terre Gravée : maquette de refonte. Script commun à toutes les pages.
   Le panier est une démonstration : il vit dans le navigateur et ne déclenche aucun paiement. */
(function () {
  "use strict";

  var CLE_PANIER = "tg-maquette-panier";
  var NOMS_FINITION = { noir: "Noir", gris: "Gris", dore: "Doré" };
  var ACCORD_FINITION = { noir: "noire", gris: "grise", dore: "dorée" };

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function euros(n) { return n.toLocaleString("fr-FR") + " €"; }

  /* ---------- Menu mobile ---------- */
  var entete = $(".entete");
  var boutonMenu = $(".bouton-menu");
  if (entete && boutonMenu) {
    boutonMenu.addEventListener("click", function () {
      var ouvert = entete.classList.toggle("menu-ouvert");
      boutonMenu.setAttribute("aria-expanded", ouvert ? "true" : "false");
    });
  }

  /* ---------- Panier de démonstration ---------- */
  function lirePanier() {
    try { return JSON.parse(localStorage.getItem(CLE_PANIER)) || []; } catch (e) { return memoirePanier; }
  }
  var memoirePanier = [];
  function ecrirePanier(lignes) {
    memoirePanier = lignes;
    try { localStorage.setItem(CLE_PANIER, JSON.stringify(lignes)); } catch (e) { /* stockage indisponible : le panier reste en mémoire */ }
    afficherPanier();
  }
  function ajouterAuPanier(article) {
    var lignes = lirePanier();
    var existante = lignes.filter(function (l) { return l.cle === article.cle; })[0];
    if (existante) { existante.qte += article.qte; } else { lignes.push(article); }
    ecrirePanier(lignes);
    toast(article.nom + " ajouté au panier");
  }

  var tiroir = $(".tiroir");
  var voile = $(".voile");
  var dernierFocus = null;
  function ouvrirPanier() {
    if (!tiroir) return;
    dernierFocus = document.activeElement;
    tiroir.classList.add("ouvert"); voile.classList.add("ouvert");
    if (toastEl) toastEl.classList.remove("visible");
    tiroir.removeAttribute("inert"); tiroir.setAttribute("aria-hidden", "false");
    var fermer = $(".tiroir__fermer", tiroir); if (fermer) fermer.focus();
  }
  function fermerPanier() {
    if (!tiroir) return;
    tiroir.classList.remove("ouvert"); voile.classList.remove("ouvert");
    tiroir.setAttribute("inert", ""); tiroir.setAttribute("aria-hidden", "true");
    if (dernierFocus) dernierFocus.focus();
  }
  $$("[data-ouvrir-panier]").forEach(function (b) { b.addEventListener("click", ouvrirPanier); });
  $$("[data-fermer-panier]").forEach(function (b) { b.addEventListener("click", fermerPanier); });
  if (voile) voile.addEventListener("click", fermerPanier);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") fermerPanier(); });

  function afficherPanier() {
    var lignes = lirePanier();
    var total = 0, nombre = 0;
    lignes.forEach(function (l) { total += l.prix * l.qte; nombre += l.qte; });
    $$(".compteur").forEach(function (c) { c.textContent = nombre; });
    var liste = $(".tiroir__liste");
    if (!liste) return;
    liste.innerHTML = "";
    if (!lignes.length) {
      var vide = document.createElement("li");
      vide.className = "tiroir__vide";
      vide.innerHTML = "<p>Votre panier est vide.</p><a class=\"lien-fleche\" href=\"" + (document.body.dataset.racine || "") + "collection.html\">Voir la collection</a>";
      liste.appendChild(vide);
    }
    lignes.forEach(function (l, i) {
      var li = document.createElement("li");
      li.className = "ligne-panier";
      var img = document.createElement("img");
      img.src = l.image; img.alt = ""; if (l.carre) img.className = "carre";
      var milieu = document.createElement("div");
      var nom = document.createElement("strong"); nom.textContent = l.nom;
      milieu.appendChild(nom);
      (l.details || []).forEach(function (d) { var s = document.createElement("span"); s.textContent = d; milieu.appendChild(s); });
      var q = document.createElement("span"); q.textContent = "Quantité : " + l.qte; milieu.appendChild(q);
      var retirer = document.createElement("button"); retirer.type = "button"; retirer.textContent = "Retirer";
      retirer.addEventListener("click", function () { var ls = lirePanier(); ls.splice(i, 1); ecrirePanier(ls); });
      milieu.appendChild(retirer);
      var prix = document.createElement("span"); prix.className = "num"; prix.textContent = euros(l.prix * l.qte);
      li.appendChild(img); li.appendChild(milieu); li.appendChild(prix);
      liste.appendChild(li);
    });
    var t = $(".tiroir__total strong"); if (t) t.textContent = euros(total);
  }
  afficherPanier();

  var toastEl = $(".toast");
  var minuteurToast = null;
  function toast(texte) {
    if (!toastEl) return;
    $(".toast__texte", toastEl).textContent = texte;
    toastEl.classList.add("visible");
    clearTimeout(minuteurToast);
    minuteurToast = setTimeout(function () { toastEl.classList.remove("visible"); }, 3200);
  }
  if (toastEl) $(".toast button", toastEl).addEventListener("click", function () { toastEl.classList.remove("visible"); ouvrirPanier(); });

  /* ---------- Pastilles des cartes produit ---------- */
  function montrerFinition(carte, fin) {
    var img = $(".carte__visuel img", carte);
    var src = carte.getAttribute("data-img-" + fin);
    if (!img || !src) return false;
    img.src = src;
    img.srcset = carte.getAttribute("data-srcset-" + fin);
    img.alt = "Plaque " + carte.getAttribute("data-nom") + ", finition " + ACCORD_FINITION[fin];
    $$(".pastille", carte).forEach(function (p) { p.setAttribute("aria-pressed", p.dataset.fin === fin ? "true" : "false"); });
    return true;
  }
  $$(".carte .pastille").forEach(function (p) {
    p.addEventListener("click", function () { montrerFinition(p.closest(".carte"), p.dataset.fin); });
  });

  /* ---------- Héros : simulation du rétroéclairage ---------- */
  var mur = $("[data-mur]");
  if (mur) {
    var inter = $(".interrupteur", mur);
    var couleurs = $(".led-couleurs", mur);
    var texteInter = $(".interrupteur__texte", mur);
    inter.addEventListener("click", function () {
      var allume = mur.classList.toggle("est-allume");
      inter.setAttribute("aria-pressed", allume ? "true" : "false");
      texteInter.textContent = allume ? "Éteindre" : "Allumer le rétroéclairage";
      couleurs.hidden = !allume;
    });
    $$("button", couleurs).forEach(function (b) {
      b.addEventListener("click", function () {
        mur.style.setProperty("--led", b.dataset.couleur);
        $$("button", couleurs).forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      });
    });
  }

  /* ---------- Collection : filtres, finition, tri ---------- */
  var grille = $("[data-grille-collection]");
  if (grille) {
    var cartes = $$(".carte", grille);
    var ordreInitial = cartes.slice();
    var compte = $("[data-compte]");
    var filtre = "tout";
    function appliquerFiltre() {
      var n = 0;
      cartes.forEach(function (c) {
        var ok = filtre === "tout" || c.dataset.collection === filtre;
        c.parentElement.hidden = !ok;
        if (ok) n++;
      });
      compte.textContent = n + (n > 1 ? " modèles" : " modèle");
      $$("[data-filtre]").forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.filtre === filtre ? "true" : "false"); });
    }
    $$("[data-filtre]").forEach(function (b) {
      b.addEventListener("click", function () {
        filtre = b.dataset.filtre;
        appliquerFiltre();
        try { history.replaceState(null, "", filtre === "tout" ? location.pathname : "#" + filtre); } catch (e) { /* navigation locale */ }
      });
    });
    $$("[data-voir-en]").forEach(function (b) {
      b.addEventListener("click", function () {
        var fin = b.dataset.voirEn;
        cartes.forEach(function (c) { montrerFinition(c, fin); });
        $$("[data-voir-en]").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      });
    });
    var tri = $("#tri");
    if (tri) tri.addEventListener("change", function () {
      var liste = ordreInitial.slice();
      if (tri.value === "nom") liste.sort(function (a, b) { return a.dataset.tri.localeCompare(b.dataset.tri, "fr"); });
      if (tri.value === "avis") liste.sort(function (a, b) { return (+b.dataset.avis) - (+a.dataset.avis); });
      liste.forEach(function (c) { grille.appendChild(c.parentElement); });
    });
    var depart = (location.hash || "").replace("#", "");
    if ($("[data-filtre=\"" + depart + "\"]")) filtre = depart;
    appliquerFiltre();
  }

  /* ---------- Fiche produit ---------- */
  var fiche = $("[data-fiche]");
  if (fiche) {
    var prixBase = +fiche.dataset.prix;
    var prixLed = +fiche.dataset.prixLed || 0;
    var scene = $(".galerie__scene", fiche);
    var caseLed = $("#option-led");
    var blocPosition = $("[data-position-led]");
    var selectPosition = $("#position-cable");
    var qte = $("#quantite");
    var affichePrix = $$("[data-prix-affiche]");
    var sortieFinition = $("#finition-choisie");

    function finitionCourante() {
      var r = $("input[name=finition]:checked", fiche);
      return r ? r.value : null;
    }
    function montrerScene(cle) {
      $$("[data-scene]", scene).forEach(function (s) { s.hidden = s.dataset.scene !== cle; });
      $$(".vignette", fiche).forEach(function (v) { v.setAttribute("aria-pressed", v.dataset.vue === cle ? "true" : "false"); });
    }
    function majPrix() {
      var total = prixBase + (caseLed && caseLed.checked ? prixLed : 0);
      affichePrix.forEach(function (el) { el.textContent = euros(total); });
      return total;
    }
    $$("input[name=finition]", fiche).forEach(function (r) {
      r.addEventListener("change", function () {
        montrerScene(r.value);
        if (sortieFinition) sortieFinition.textContent = NOMS_FINITION[r.value];
      });
    });
    $$(".vignette", fiche).forEach(function (v) {
      v.addEventListener("click", function () {
        montrerScene(v.dataset.vue);
        var radio = $("input[name=finition][value=\"" + v.dataset.vue + "\"]", fiche);
        if (radio) { radio.checked = true; if (sortieFinition) sortieFinition.textContent = NOMS_FINITION[radio.value]; }
      });
    });
    if (caseLed) caseLed.addEventListener("change", function () { blocPosition.hidden = !caseLed.checked; majPrix(); });
    $$("[data-qte]").forEach(function (b) {
      b.addEventListener("click", function () {
        var v = Math.max(1, Math.min(9, (+qte.value || 1) + (+b.dataset.qte)));
        qte.value = v;
      });
    });
    function ajouter() {
      var fin = finitionCourante();
      var details = [];
      var cle = fiche.dataset.slug;
      if (fin) { details.push("Finition " + ACCORD_FINITION[fin]); cle += "-" + fin; }
      if (selectPosition && fiche.dataset.type === "led") { details.push("Câble : " + selectPosition.value.toLowerCase()); cle += "-" + selectPosition.value; }
      if (caseLed && caseLed.checked) { details.push("Kit LED monté, câble " + selectPosition.value.toLowerCase()); cle += "-led-" + selectPosition.value; }
      ajouterAuPanier({
        cle: cle, nom: fiche.dataset.nom, details: details, prix: majPrix(), qte: Math.max(1, +qte.value || 1),
        image: fin ? fiche.getAttribute("data-img-" + fin) : fiche.dataset.image, carre: fiche.dataset.carre === "1"
      });
    }
    $$("[data-ajouter]").forEach(function (b) { b.addEventListener("click", ajouter); });
    majPrix();

    var barre = $(".barre-achat-mobile");
    var boutonPrincipal = $(".quantite-achat .btn", fiche);
    if (barre && boutonPrincipal && "IntersectionObserver" in window) {
      new IntersectionObserver(function (entrees) {
        barre.classList.toggle("visible", !entrees[0].isIntersecting && entrees[0].boundingClientRect.top < 0);
      }).observe(boutonPrincipal);
    }
  }

  /* ---------- Ajout direct depuis un bouton (carte cadeau, kit LED) ---------- */
  $$("[data-ajout-rapide]").forEach(function (b) {
    b.addEventListener("click", function () {
      ajouterAuPanier({ cle: b.dataset.cle, nom: b.dataset.nom, details: b.dataset.details ? [b.dataset.details] : [], prix: +b.dataset.prix, qte: 1, image: b.dataset.image, carre: b.dataset.carre === "1" });
    });
  });

  /* ---------- Formulaires de démonstration ---------- */
  $$("form[data-demo]").forEach(function (f) {
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var msg = $(".message-demo", f.parentElement) || $(".message-demo", f);
      if (msg) { msg.hidden = false; msg.focus(); }
    });
  });

  /* ---------- Copie de l'adresse e-mail ---------- */
  $$("[data-copier]").forEach(function (b) {
    b.addEventListener("click", function () {
      var cible = document.getElementById(b.dataset.copier);
      var texte = cible.textContent.trim();
      function selection() {
        var r = document.createRange(); r.selectNodeContents(cible);
        var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
        b.textContent = "Sélectionné, faites Ctrl+C";
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(texte).then(function () { b.textContent = "Copié"; }, selection);
      } else { selection(); }
    });
  });
})();
