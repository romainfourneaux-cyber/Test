/* Terre Gravée · thème WordPress, d’après le script de la maquette v4 (assets/galerie.js).
   Trois moments interactifs : la lumière du mur, les pastilles de finition, la carte des lieux.
   Le reste : menu sur téléphone, états de l’offre de Noël, filtres de la collection, fiche produit (finition, kit LED,
   quantité, barre d’achat), rétractation en deux étapes, copie de l’adresse e-mail.
   Le panier est celui de WooCommerce (mini-panier de l’en-tête, pages Panier et Validation de la commande). */
(function () {
  "use strict";

  var CONF = window.TG || {};
  var NOMS_FINITION = { noir: "Noir", gris: "Gris", dore: "Doré" };
  var ACCORD_FINITION = { noir: "noire", gris: "grise", dore: "dorée" };
  var mouvementReduit = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function euros(n) {
    var entier = Math.round(n * 100) / 100;
    var texte = (entier % 1 === 0 ? String(entier) : entier.toFixed(2).replace(".", ","));
    return texte.replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " €";
  }
  function remplacerAdresse(hash) {
    try { history.replaceState(null, "", hash ? "#" + hash : location.pathname + location.search); } catch (e) { /* sans effet */ }
  }

  /* ---------- Menu sur téléphone ---------- */
  var entete = $(".entete");
  var boutonMenu = $(".bouton-menu");
  if (entete && boutonMenu) {
    boutonMenu.addEventListener("click", function () {
      var ouvert = entete.classList.toggle("menu-ouvert");
      boutonMenu.setAttribute("aria-expanded", ouvert ? "true" : "false");
    });
  }

  /* ---------- Offre de Noël : quatre états, à l’heure du site (Paris) ----------
     « avant » le 27 novembre, « pendant » l’offre (jusqu’au 14 décembre inclus), « apres » (du 15 au 24 décembre),
     « fini » (à partir du 25 décembre). Le serveur a déjà écrit son état sur <html data-noel> ; on le recalcule ici,
     ce qui corrige une page restée en cache. La date du jour est prise dans le fuseau du site (CONF.fuseau,
     Europe/Paris), comme le serveur et le panier : un visiteur à New York ou en Martinique voit le même état que le
     prix de la livraison. Les dates sont comparées sous forme AAAA-MM-JJ. Chaque élément .tg-quand liste ses états
     dans ses classes (tg-quand-pendant…). */
  function jourDuSite() {
    var fuseaux = [CONF.fuseau, "Europe/Paris"];
    for (var i = 0; i < fuseaux.length; i++) {
      if (!fuseaux[i]) continue;
      try {
        var j = new Intl.DateTimeFormat("fr-CA", { timeZone: fuseaux[i], year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
        if (/^\d{4}-\d{2}-\d{2}$/.test(j)) return j;
      } catch (e) { /* fuseau inconnu : suivant */ }
    }
    return null;
  }
  function etatNoel() {
    var valide = /^\d{4}-\d{2}-\d{2}$/;
    var j = CONF.dateEssai || jourDuSite();
    if (!j || !valide.test(CONF.offreDebut || "") || !valide.test(CONF.offreFin || "") || !valide.test(CONF.noelFin || "")) return CONF.etatServeur || "avant";
    if (j < CONF.offreDebut) return "avant";
    if (j <= CONF.offreFin) return "pendant";
    if (j <= CONF.noelFin) return "apres";
    return "fini";
  }
  function appliquerNoel() {
    var etat = etatNoel();
    document.documentElement.setAttribute("data-noel", etat);
    $$(".tg-quand").forEach(function (el) { el.hidden = !el.classList.contains("tg-quand-" + etat); });
  }
  appliquerNoel();

  /* ---------- Mini-panier de WooCommerce : tiroir fermé hors d’atteinte du clavier ----------
     Fermé, le tiroir porte aria-hidden="true" mais ses liens et boutons restent atteignables avec Tab (erreur
     « aria-hidden-focus » d’axe, WCAG 4.1.2). On lui ajoute inert tant qu’il est fermé, et on le retire à l’ouverture. */
  function suivreTiroir(tiroir) {
    if (tiroir.getAttribute("data-tg-inert")) return;
    tiroir.setAttribute("data-tg-inert", "1");
    var maj = function () {
      if (tiroir.getAttribute("aria-hidden") === "true") tiroir.setAttribute("inert", "");
      else tiroir.removeAttribute("inert");
    };
    maj();
    new MutationObserver(maj).observe(tiroir, { attributes: true, attributeFilter: ["aria-hidden"] });
  }
  $$(".wc-block-mini-cart__drawer").forEach(suivreTiroir);
  if (window.MutationObserver) {
    new MutationObserver(function () { $$(".wc-block-mini-cart__drawer").forEach(suivreTiroir); })
      .observe(document.body, { childList: true, subtree: true });
  }

  /* ---------- Pastilles de finition des cartes ---------- */
  function montrerFinition(carte, fin) {
    var image = $(".carte__visuel img", carte);
    var src = carte.getAttribute("data-img-" + fin);
    if (!image || !src) return false;
    image.src = src;
    image.srcset = carte.getAttribute("data-srcset-" + fin) || "";
    image.alt = "Plaque " + carte.getAttribute("data-nom") + ", finition " + ACCORD_FINITION[fin];
    $$(".pastille", carte).forEach(function (p) { if (!p.disabled) p.setAttribute("aria-pressed", p.getAttribute("data-fin") === fin ? "true" : "false"); });
    return true;
  }
  document.addEventListener("click", function (e) {
    var p = e.target.closest && e.target.closest(".carte .pastille");
    if (p && !p.disabled) montrerFinition(p.closest(".carte"), p.getAttribute("data-fin"));
  });

  /* ---------- Mur d’exposition : simulation du rétroéclairage ---------- */
  var mur = $("[data-mur]");
  if (mur) {
    var inter = $(".interrupteur", mur);
    var couleurs = $(".led-couleurs", mur);
    var texteInter = $(".interrupteur__texte", mur);
    if (inter && couleurs) {
      inter.addEventListener("click", function () {
        var allume = mur.classList.toggle("est-allume");
        inter.setAttribute("aria-pressed", allume ? "true" : "false");
        if (texteInter) texteInter.textContent = allume ? "Éteindre" : "Allumer le rétroéclairage";
        couleurs.hidden = !allume;
      });
      $$("button", couleurs).forEach(function (b) {
        b.addEventListener("click", function () {
          mur.style.setProperty("--led", b.getAttribute("data-couleur"));
          $$("button", couleurs).forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        });
      });
    }
  }

  /* ---------- Collection : filtres par thème et « Voir en » ---------- */
  var grille = $("[data-grille-collection]");
  if (grille) {
    var cartes = $$(".carte", grille);
    var compte = $("[data-compte]");
    var boutonsFiltre = $$("[data-filtre]");
    var filtre = "tout";
    var correspond = function (c, f) {
      return f === "tout" || (f === "cadeaux" ? c.hasAttribute("data-cadeau") : c.getAttribute("data-collection") === f);
    };
    // Nombre d’articles de chaque filtre, calculé sur la page (la liste suit les produits de WooCommerce)
    boutonsFiltre.forEach(function (b) {
      var n = cartes.filter(function (c) { return correspond(c, b.getAttribute("data-filtre")); }).length;
      var s = $("span", b);
      if (s) s.textContent = n;
      if (!n && b.getAttribute("data-filtre") !== "tout") b.hidden = true;
    });
    var appliquerFiltre = function () {
      var n = 0;
      cartes.forEach(function (c) {
        var ok = correspond(c, filtre);
        c.parentElement.hidden = !ok;
        if (ok) n++;
      });
      if (compte) compte.textContent = n + (n > 1 ? " articles" : " article");
      boutonsFiltre.forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-filtre") === filtre ? "true" : "false"); });
    };
    boutonsFiltre.forEach(function (b) {
      b.addEventListener("click", function () {
        filtre = b.getAttribute("data-filtre");
        appliquerFiltre();
        remplacerAdresse(filtre === "tout" ? "" : filtre);
      });
    });
    $$("[data-voir-en]").forEach(function (b) {
      b.addEventListener("click", function () {
        var fin = b.getAttribute("data-voir-en");
        cartes.forEach(function (c) { montrerFinition(c, fin); });
        $$("[data-voir-en]").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      });
    });
    var lireHash = function () {
      var depart = (location.hash || "").replace("#", "");
      var bouton = depart ? $("[data-filtre=\"" + depart + "\"]") : null;
      filtre = bouton && !bouton.hidden ? depart : "tout";
      appliquerFiltre();
    };
    window.addEventListener("hashchange", lireHash);
    lireHash();
  }

  /* ---------- Fiche produit ---------- */
  var fiche = $("[data-fiche]");
  if (fiche) {
    var scene = $(".galerie__scene", fiche);
    var formulaire = $("form.cart", fiche);
    var caseLed = $("#option-led", fiche);
    var blocPosition = $("[data-position-led]", fiche);
    var qte = $("#quantite", fiche);
    var affichePrix = $$("[data-prix-affiche]");
    var sortieFinition = $("#finition-choisie", fiche);
    var prixBase = parseFloat(fiche.getAttribute("data-prix")) || 0;
    var prixLed = parseFloat(fiche.getAttribute("data-prix-led")) || 0;
    var selectFinition = formulaire ? $(".variations select[data-tg-finition]", formulaire) : null;

    var montrerScene = function (cle) {
      if (!scene) return;
      var trouve = false;
      $$("[data-scene]", scene).forEach(function (s) { var ok = s.getAttribute("data-scene") === cle; s.hidden = !ok; trouve = trouve || ok; });
      if (!trouve) return;
      $$(".vignette", fiche).forEach(function (v) { v.setAttribute("aria-pressed", v.getAttribute("data-vue") === cle ? "true" : "false"); });
    };
    var majPrix = function () {
      if (!prixBase) return;
      var total = prixBase + (caseLed && caseLed.checked ? prixLed : 0);
      affichePrix.forEach(function (el) { el.textContent = euros(total); });
    };
    /* La finition choisie avec les boutons règle la liste masquée de WooCommerce, qui trouve la variation */
    var choisirFinition = function (radio) {
      if (!radio) return;
      montrerScene(radio.value);
      if (sortieFinition) sortieFinition.textContent = NOMS_FINITION[radio.value] || "";
      if (selectFinition && selectFinition.value !== radio.getAttribute("data-valeur")) {
        selectFinition.value = radio.getAttribute("data-valeur");
        selectFinition.dispatchEvent(new Event("change", { bubbles: true }));
      }
    };
    $$("input[name=tg_finition]", fiche).forEach(function (r) {
      r.addEventListener("change", function () { choisirFinition(r); });
    });
    $$(".vignette", fiche).forEach(function (v) {
      v.addEventListener("click", function () {
        var vue = v.getAttribute("data-vue");
        montrerScene(vue);
        var radio = $("input[name=tg_finition][value=\"" + vue + "\"]", fiche);
        if (radio && !radio.disabled) { radio.checked = true; choisirFinition(radio); }
      });
    });
    if (caseLed && blocPosition) caseLed.addEventListener("change", function () { blocPosition.hidden = !caseLed.checked; majPrix(); });
    $$("[data-qte]", fiche).forEach(function (b) {
      b.addEventListener("click", function () {
        if (!qte) return;
        var min = +qte.min || 1, max = +qte.max || 9;
        qte.value = Math.max(min, Math.min(max, (+qte.value || 1) + (+b.getAttribute("data-qte"))));
        qte.dispatchEvent(new Event("change", { bubbles: true }));
      });
    });
    majPrix();

    /* Quantité : pas plus que le stock de la finition choisie (max_qty de WooCommerce), 9 au plus */
    var maxDepart = qte ? (+qte.max || 9) : 9;
    var bornerQte = function (max) {
      if (!qte) return;
      qte.max = String(max);
      if ((+qte.value || 1) > max) {
        qte.value = String(max);
        qte.dispatchEvent(new Event("change", { bubbles: true }));
      }
    };
    if (formulaire && window.jQuery) {
      window.jQuery(formulaire)
        .on("found_variation", function (e, v) {
          var stock = v && v.max_qty !== "" && v.max_qty != null ? +v.max_qty : 0;
          bornerQte(stock > 0 ? Math.min(maxDepart, stock) : maxDepart);
        })
        .on("reset_data", function () { bornerQte(maxDepart); });
    }

    /* Barre d’achat collante (téléphone) : même bouton que le formulaire */
    var barre = $(".barre-achat-mobile");
    var boutonPrincipal = formulaire ? $(".single_add_to_cart_button", formulaire) : null;
    $$("[data-ajouter-barre]").forEach(function (b) {
      b.addEventListener("click", function () {
        if (!boutonPrincipal) return;
        if (boutonPrincipal.classList.contains("disabled")) { formulaire.scrollIntoView({ block: "center", behavior: mouvementReduit ? "auto" : "smooth" }); return; }
        boutonPrincipal.click();
      });
    });
    var blocPrix = $(".achat__prix", fiche);
    var piedPage = $("footer.pied, .pied");
    if (barre && blocPrix && boutonPrincipal && "IntersectionObserver" in window) {
      var etatBarre = { prixPasse: false, boutonVisible: false, piedVisible: false };
      var observateur = new IntersectionObserver(function (entrees) {
        entrees.forEach(function (en) {
          if (en.target === blocPrix) etatBarre.prixPasse = !en.isIntersecting && en.boundingClientRect.top < 0;
          else if (en.target === boutonPrincipal) etatBarre.boutonVisible = en.isIntersecting;
          else if (en.target === piedPage) etatBarre.piedVisible = en.isIntersecting;
        });
        barre.classList.toggle("visible", etatBarre.prixPasse && !etatBarre.boutonVisible && !etatBarre.piedVisible);
      });
      observateur.observe(blocPrix); observateur.observe(boutonPrincipal);
      if (piedPage) observateur.observe(piedPage);
    }
  }

  /* ---------- Carte des lieux ---------- */
  var atlas = $("[data-atlas]");
  var panneau = $("#fiche-lieu");
  if (atlas && panneau) {
    var reperes = $$("[data-repere]", atlas);
    var intro = $("[data-fiche-intro]", panneau);
    var fermerFiche = $("[data-fermer-fiche]", panneau);
    var courant = null;
    var visibleDansFenetre = function (el) {
      var r = el.getBoundingClientRect();
      return r.top >= 60 && r.top < (window.innerHeight - 140);
    };
    var ouvrir = function (cle, source) {
      var article = $("[data-fiche-lieu=\"" + cle + "\"]", panneau);
      if (!article) return false;
      courant = cle;
      $$("[data-fiche-lieu]", panneau).forEach(function (a) { a.hidden = a !== article; });
      if (intro) intro.hidden = true;
      if (fermerFiche) fermerFiche.hidden = false;
      reperes.forEach(function (r) { r.setAttribute("aria-pressed", r.getAttribute("data-repere") === cle ? "true" : "false"); });
      remplacerAdresse(cle);
      if (source !== "chargement" && !visibleDansFenetre(article)) {
        article.scrollIntoView({ block: "nearest", behavior: mouvementReduit ? "auto" : "smooth" });
      }
      return true;
    };
    var fermer = function () {
      if (!courant) return;
      var ancien = courant;
      courant = null;
      $$("[data-fiche-lieu]", panneau).forEach(function (a) { a.hidden = true; });
      if (intro) intro.hidden = false;
      if (fermerFiche) fermerFiche.hidden = true;
      reperes.forEach(function (r) { r.setAttribute("aria-pressed", "false"); });
      remplacerAdresse("");
      var rep = $("[data-repere=\"" + ancien + "\"]", atlas);
      if (rep && panneau.contains(document.activeElement)) rep.focus();
    };
    reperes.forEach(function (r) {
      r.addEventListener("click", function () {
        var cle = r.getAttribute("data-repere");
        if (courant === cle) { fermer(); r.focus(); } else { ouvrir(cle, "clic"); }
      });
    });
    if (fermerFiche) fermerFiche.addEventListener("click", fermer);
    $$("[data-situer]").forEach(function (b) {
      b.addEventListener("click", function () {
        var cle = b.getAttribute("data-situer");
        ouvrir(cle, "chargement");
        var rep = $("[data-repere=\"" + cle + "\"]", atlas);
        atlas.scrollIntoView({ block: "start", behavior: mouvementReduit ? "auto" : "smooth" });
        if (rep) rep.focus({ preventScroll: true });
      });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && courant) fermer();
    });
    var ouvrirDepuisAdresse = function () {
      var cle = decodeURIComponent((location.hash || "").replace("#", ""));
      if (!cle || cle === courant || !ouvrir(cle, "chargement")) return;
      if (!(window.matchMedia && window.matchMedia("(max-width: 900px)").matches)) return;
      var article = $("[data-fiche-lieu=\"" + cle + "\"]", panneau);
      requestAnimationFrame(function () {
        if (article && !visibleDansFenetre(article)) article.scrollIntoView({ block: "nearest" });
      });
    };
    ouvrirDepuisAdresse();
    window.addEventListener("hashchange", ouvrirDepuisAdresse);
  }

  /* Échap ferme le menu */
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (entete && entete.classList.contains("menu-ouvert")) {
      entete.classList.remove("menu-ouvert");
      if (boutonMenu) { boutonMenu.setAttribute("aria-expanded", "false"); boutonMenu.focus(); }
    }
  });

  /* Message après l’envoi d’un formulaire : il prend le focus (lecteurs d’écran) */
  var message = $(".message-demo[role=status]");
  if (message && /[?&]tg_(contact|retract)=/.test(location.search)) { try { message.focus({ preventScroll: true }); } catch (e) { message.focus(); } }

  /* Rétractation en deux étapes : déclaration, puis confirmation (l’envoi part à la confirmation) */
  $$("form[data-retract]").forEach(function (f) {
    var etape1 = $("[data-retract-etape=\"1\"]", f);
    var etape2 = $("[data-retract-etape=\"2\"]", f);
    var resume = $("[data-retract-resume]", f);
    var champEtape = f.elements.tg_etape;
    var confirme = false;
    f.addEventListener("submit", function (e) {
      if (confirme) return;
      e.preventDefault();
      if (!f.reportValidity || f.reportValidity()) {
        var nom = (f.elements.nom.value || "").trim();
        var commande = (f.elements.commande.value || "").trim();
        var articles = (f.elements.articles.value || "").trim();
        resume.textContent = "2. Vérifiez puis confirmez : " + nom + " renonce à la commande " + commande +
          (articles ? " (articles : " + articles + ")." : " (toute la commande).");
        etape1.hidden = true; etape2.hidden = false; resume.focus();
      }
    });
    $("[data-retract-retour]", f).addEventListener("click", function () {
      etape2.hidden = true; etape1.hidden = false;
      var premier = $("input:not([type=hidden])", etape1); if (premier) premier.focus();
    });
    $("[data-retract-confirmer]", f).addEventListener("click", function () {
      confirme = true;
      if (champEtape) champEtape.value = "2";
      etape1.hidden = false; etape1.style.display = "none";
      f.submit();
    });
  });

  /* Panier et validation en blocs : aucune livraison pour l’adresse (Corse, étranger) → message explicite.
     WooCommerce n’affiche sinon que « Saisir une adresse… » ou « Aucune option de livraison », sans dire pourquoi.
     Le message est ajouté à côté des modes de livraison, sans toucher aux éléments gérés par WooCommerce. */
  if (CONF.sansLivraison && $(".wp-block-woocommerce-checkout, .wp-block-woocommerce-cart")) {
    var horsZone = function (adr) {
      if (!adr) return false;
      var cp = String(adr.postcode || "").replace(/\s+/g, "");
      if (adr.country && adr.country !== "FR") return true;
      return /^(20|2A|2B)/i.test(cp);
    };
    var majSansLivraison = function () {
      var store;
      try { store = window.wp && wp.data && wp.data.select("wc/store/cart"); } catch (e) { store = null; }
      if (!store || !store.getCartData) return;
      var c = store.getCartData() || {};
      var adr = c.shippingAddress || {};
      var paquets = c.shippingRates || [];
      var aucun = !paquets.length || paquets.every(function (p) { return !p.shipping_rates || !p.shipping_rates.length; });
      var montrer = !!(c.needsShipping && aucun && adr.postcode && horsZone(adr));
      var cibles = $$(".wc-block-checkout__shipping-option .wc-block-components-checkout-step__content, .wp-block-woocommerce-cart-order-summary-shipping-block");
      cibles.forEach(function (cible) {
        var msg = cible.querySelector(":scope > .tg-sans-livraison");
        if (montrer && !msg) {
          msg = document.createElement("p");
          msg.className = "tg-sans-livraison";
          msg.setAttribute("role", "status");
          msg.textContent = CONF.sansLivraison;
          cible.insertBefore(msg, cible.firstChild);
        } else if (!montrer && msg) {
          msg.parentNode.removeChild(msg);
        }
      });
    };
    var attente = null;
    var planifier = function () { if (attente) return; attente = setTimeout(function () { attente = null; majSansLivraison(); }, 250); };
    var brancher = function () {
      if (window.wp && wp.data && wp.data.subscribe) { wp.data.subscribe(planifier); planifier(); return true; }
      return false;
    };
    if (!brancher()) window.addEventListener("load", brancher);
  }

  /* Copie de l’adresse e-mail */
  $$("[data-copier]").forEach(function (b) {
    b.addEventListener("click", function () {
      var cible = document.getElementById(b.getAttribute("data-copier"));
      if (!cible) return;
      var texte = cible.textContent.trim();
      var selection = function () {
        var r = document.createRange(); r.selectNodeContents(cible);
        var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
        b.textContent = "Sélectionnée : Ctrl+C pour copier";
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(texte).then(function () { b.textContent = "Copiée"; }, selection);
      } else { selection(); }
    });
  });
})();
