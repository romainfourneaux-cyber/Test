/* Terre Gravée · maquette version 3 · visualiseur « Essayer chez moi ».
   Tout se passe dans le navigateur : la photo importée n'est ni envoyée ni conservée. */
(function () {
  "use strict";
  var O = window.TG3 && window.TG3.outils;
  var racine = document.querySelector("[data-essai]");
  if (!O || !racine) return;
  var D = window.TG3;

  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function borne(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function pct(v) { return Math.round(v * 100) + " %"; }

  var scene = $("#scene-essai");
  var murEl = $("[data-mur]", scene);
  var photoEl = $("[data-photo]", scene);
  var decors = $$("[data-decor]", scene);
  var plaqueEl = $("[data-plaque]", scene);
  var slot = $(".emplacement", plaqueEl);
  var barre = $("[data-barre]", scene);
  var barreTexte = $("[data-barre-texte]", scene);
  var repere = $("[data-repere]", scene);
  var ligneRepere = $("line", repere);
  var etiquetteRepere = $("[data-repere-etiquette]", repere);
  var poignees = { a: $("[data-poignee=a]", repere), b: $("[data-poignee=b]", repere) };

  var DEF_MUR = { platre: "#e8e3d9", beton: "#8e908d", brique: "#c9bba7", bois: "#b88a5c" };
  var NOM_MUR = { platre: "plâtre clair", beton: "béton", brique: "brique", bois: "bois", photo: "votre photo" };
  /* allume = aperçu de nuit (rendu seulement) ; kit = kit LED dans la configuration (choix distinct) */
  var etat = {
    slug: "le-pic-du-midi", fin: "noir", allume: false, kit: false, intensite: 1, cable: "bd",
    mur: "platre", couleur: DEF_MUR.platre, photo: false,
    x: 0.5, y: 0.25, taille: 60, vueCm: 180,
    repA: { x: 0.16, y: 0.18 }, repB: { x: 0.16, y: 0.84 }
  };

  /* ---------- Lecture du lien partagé ---------- */
  var recu = O.lireHash(location.hash);
  if (recu) {
    etat.slug = recu.slug;
    etat.fin = recu.fin && O.FIN[recu.fin] ? recu.fin : O.premiereFinition(recu.slug, "noir");
    if (recu.led) { etat.kit = true; O.appliquerLed(recu.led, false); }
    if (recu.nuit) etat.allume = true;
    if (recu.mur) { etat.mur = recu.mur; etat.couleur = DEF_MUR[recu.mur]; }
  }

  /* ---------- Rendu ---------- */
  var mesure = { W: 0, H: 0, pxcm: 1, w: 0, h: 0, left: 0, top: 0 };
  function ratioPlaque() {
    var p = O.PLQ[etat.slug];
    var t = p && p.t[etat.fin];
    return t ? t[1] / t[0] : 2;
  }
  function rendre() {
    var r = scene.getBoundingClientRect();
    if (!r.width) return;
    var W = r.width, H = r.height;
    var pxcm = H / etat.vueCm;
    scene.style.setProperty("--cm", pxcm.toFixed(4) + "px");
    scene.style.setProperty("--intensite", String(etat.intensite));
    var w = (etat.taille / 2) * pxcm;
    var h = w * ratioPlaque();
    var cx = W > w ? borne(etat.x * W, w / 2, W - w / 2) : W / 2;
    var cy = H > h ? borne(etat.y * H, h / 2, H - h / 2) : H / 2;
    etat.x = cx / W; etat.y = cy / H;
    mesure = { W: W, H: H, pxcm: pxcm, w: w, h: h, left: cx - w / 2, top: cy - h / 2 };
    plaqueEl.style.setProperty("--plaque-l", w.toFixed(2) + "px");
    plaqueEl.style.width = w.toFixed(2) + "px";
    plaqueEl.style.left = mesure.left.toFixed(2) + "px";
    plaqueEl.style.top = mesure.top.toFixed(2) + "px";
    // barre d'échelle
    var cm = 20;
    [200, 100, 50, 20].some(function (c) { if (c * pxcm <= W * 0.22) { cm = c; return true; } return false; });
    barre.style.width = (cm * pxcm).toFixed(1) + "px";
    barreTexte.textContent = cm >= 100 ? (cm / 100) + " m" : cm + " cm";
    rendreRepere();
  }
  function rendreRepere() {
    if (repere.hidden) return;
    var W = mesure.W, H = mesure.H;
    var ax = etat.repA.x * W, ay = etat.repA.y * H, bx = etat.repB.x * W, by = etat.repB.y * H;
    ligneRepere.setAttribute("x1", ax); ligneRepere.setAttribute("y1", ay);
    ligneRepere.setAttribute("x2", bx); ligneRepere.setAttribute("y2", by);
    poignees.a.style.left = ax + "px"; poignees.a.style.top = ay + "px";
    poignees.b.style.left = bx + "px"; poignees.b.style.top = by + "px";
    var dist = Math.sqrt((ax - bx) * (ax - bx) + (ay - by) * (ay - by));
    etiquetteRepere.style.left = ((ax + bx) / 2) + "px";
    etiquetteRepere.style.top = ((ay + by) / 2) + "px";
    etiquetteRepere.textContent = "≈ " + Math.round(dist / mesure.pxcm) + " cm";
  }

  function majMur() {
    var mur = etat.mur;
    var estPhoto = mur === "photo";
    murEl.className = "mur mur--" + (estPhoto ? "platre" : mur);
    murEl.hidden = estPhoto;
    murEl.style.setProperty("--mur-couleur", etat.couleur);
    photoEl.hidden = !estPhoto;
    decors.forEach(function (d) { d.hidden = estPhoto; });
    $$("[data-choix-mur]").forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-choix-mur") === mur ? "true" : "false"); });
    var couleur = $("#couleur-mur");
    if (couleur) { couleur.value = etat.couleur; couleur.disabled = estPhoto; }
    var blocRepere = $("[data-bloc-repere]");
    if (blocRepere) blocRepere.hidden = !estPhoto;
    if (!estPhoto) { repere.hidden = true; var bt = $("[data-montrer-repere]"); if (bt) bt.setAttribute("aria-pressed", "false"); }
    var info = $("[data-info-echelle]");
    if (info) info.textContent = estPhoto
      ? "Échelle par défaut : la hauteur de la photo vaut environ " + Math.round(etat.vueCm) + " cm. Calez le repère pour la préciser."
      : "Mur d’exemple : 1,80 m de hauteur visible. Le meuble mesure 120 cm de large et sert de repère.";
  }

  function majPlaque() {
    var p = O.PLQ[etat.slug];
    var sel = $("#modele-essai"); if (sel) sel.value = etat.slug;
    $$("input[name=finition-essai]").forEach(function (r) {
      r.checked = r.value === etat.fin;
      var lbl = r.closest("label");
      var m = lbl ? $(".marqueur", lbl) : null;
      if (m) m.hidden = O.aPhoto(etat.slug, r.value);
    });
    // emplacement : photo ou « photo à venir »
    var plq = $(".plaque:not(.plaque--vide)", slot);
    var vide = $(".plaque--vide", slot);
    if (O.aPhoto(etat.slug, etat.fin)) {
      var img = $("img.plaque__jour", plq);
      var t = p.t[etat.fin];
      O.majSilhouette($("img.plaque__nuit", plq), p, img.sizes);
      img.width = t[0]; img.height = t[1];
      img.srcset = O.srcPlaque(etat.slug, etat.fin, 440) + " 440w, " + O.srcPlaque(etat.slug, etat.fin, 880) + " 880w";
      img.src = O.srcPlaque(etat.slug, etat.fin, 440);
      img.alt = "Plaque " + p.n + ", finition " + O.FIN[etat.fin].a + ", posée sur le mur";
      plq.className = "plaque fin-" + etat.fin;
      plq.hidden = false; vide.hidden = true;
    } else {
      plq.hidden = true; vide.hidden = false;
      $("[data-texte-vide]", vide).textContent = p.n + " en finition " + O.FIN[etat.fin].a + " : photo à venir";
    }
    $("[data-cote-h]", plaqueEl).textContent = "60\u00a0cm";
    $("[data-cote-l]", plaqueEl).textContent = "30\u00a0cm";
    plaqueEl.setAttribute("aria-label", "Plaque " + p.n + ", finition " + O.FIN[etat.fin].a + ". Position : " + pct(etat.x) + " depuis la gauche, " + pct(etat.y) + " depuis le haut. Flèches pour déplacer.");
  }

  function majLumiere() {
    scene.classList.toggle("est-nuit", etat.allume);
    var inter = $("[data-interrupteur-essai]");
    if (inter) inter.setAttribute("aria-pressed", etat.allume ? "true" : "false");
    var opts = $("[data-options-lumiere]"); if (opts) opts.hidden = !etat.allume;
    var note = $("[data-note-apercu]"); if (note) note.hidden = !(etat.allume && !etat.kit);
    var kit = $("#kit-essai"); if (kit) kit.checked = etat.kit;
    var blocCable = $("[data-bloc-cable]"); if (blocCable) blocCable.hidden = !etat.kit;
    var it = $("#intensite-essai"); if (it) it.value = Math.round(etat.intensite * 100);
    var its = $("#intensite-sortie"); if (its) its.textContent = Math.round(etat.intensite * 100) + " %";
    scene.style.setProperty("--intensite", String(etat.intensite));
  }

  function majResume(ecrire) {
    var led = etat.kit ? O.ledCourante() : null;
    var txt = O.resumeConfig(etat.slug, etat.fin, led, 1);
    $$("[data-resume-essai]").forEach(function (x) { x.textContent = txt; });
    var cfg = { slug: etat.slug, fin: etat.fin, led: led, nuit: etat.allume, mur: (etat.mur !== "photo" && etat.mur !== "platre") ? etat.mur : null };
    var h = O.chaineHash(cfg);
    var lien = $("[data-lien-fiche-essai]");
    if (lien) { lien.href = "produit-" + etat.slug + ".html#" + etat.slug + "-" + etat.fin + (led ? "-" + led : "") + (etat.allume ? "-nuit" : ""); lien.textContent = "Voir la fiche " + O.PLQ[etat.slug].n; }
    if (ecrire) O.ecrireHash(cfg);
    return h;
  }

  function toutRendre(ecrire) { majMur(); majPlaque(); majLumiere(); rendre(); majResume(ecrire); }

  /* ---------- Onglets (téléphone) ---------- */
  var onglets = $$("[role=tab]", racine);
  function activerOnglet(b) {
    onglets.forEach(function (o) {
      var actif = o === b;
      o.setAttribute("aria-selected", actif ? "true" : "false");
      o.tabIndex = actif ? 0 : -1;
      var p = document.getElementById(o.getAttribute("aria-controls"));
      if (p) p.classList.toggle("actif", actif);
    });
  }
  onglets.forEach(function (o, i) {
    o.addEventListener("click", function () { activerOnglet(o); });
    o.addEventListener("keydown", function (e) {
      var k = e.key, j = null;
      if (k === "ArrowRight") j = (i + 1) % onglets.length;
      if (k === "ArrowLeft") j = (i - 1 + onglets.length) % onglets.length;
      if (j !== null) { e.preventDefault(); onglets[j].focus(); activerOnglet(onglets[j]); }
    });
  });

  /* ---------- Mur ---------- */
  $$("[data-choix-mur]").forEach(function (b) {
    b.addEventListener("click", function () {
      var m = b.getAttribute("data-choix-mur");
      if (m === "photo" && !etat.photo) return;
      etat.mur = m;
      if (m !== "photo") { etat.couleur = DEF_MUR[m]; etat.vueCm = 180; } else { etat.vueCm = etat.vuePhoto || 250; }
      toutRendre(true);
      O.annoncer("Mur : " + NOM_MUR[m]);
    });
  });
  var couleurMur = $("#couleur-mur");
  if (couleurMur) couleurMur.addEventListener("input", function () {
    if (!/^#[0-9a-f]{6}$/i.test(couleurMur.value)) return;
    etat.couleur = couleurMur.value; murEl.style.setProperty("--mur-couleur", etat.couleur);
  });

  var fichier = $("#photo-mur");
  var etatImport = $("[data-etat-import]");
  if (fichier) fichier.addEventListener("change", function () {
    var f = fichier.files && fichier.files[0];
    if (!f) return;
    if (!/^image\//.test(f.type)) { etatImport.textContent = "Ce fichier n’est pas une image."; return; }
    etatImport.textContent = "Préparation de la photo sur votre appareil…";
    var lecteur = new FileReader();
    lecteur.onerror = function () { etatImport.textContent = "Lecture impossible. Essayez une autre photo."; };
    lecteur.onload = function () {
      var im = new Image();
      im.onerror = function () { etatImport.textContent = "Format non reconnu par ce navigateur. Essayez une photo JPEG ou PNG."; };
      im.onload = function () {
        var max = 2048;
        var s = Math.min(1, max / Math.max(im.naturalWidth, im.naturalHeight));
        var url = lecteur.result;
        var cw = Math.round(im.naturalWidth * s), ch = Math.round(im.naturalHeight * s);
        try {
          var c = document.createElement("canvas");
          c.width = cw; c.height = ch;
          c.getContext("2d").drawImage(im, 0, 0, cw, ch);
          url = c.toDataURL("image/jpeg", 0.9);
        } catch (e) { url = lecteur.result; }
        photoEl.src = url;
        etat.photo = true; etat.mur = "photo"; etat.vueCm = 250; etat.vuePhoto = 250;
        etat.x = 0.5; etat.y = 0.4;
        reinitialiserRepere();
        var bPhoto = $("[data-choix-mur=photo]"); if (bPhoto) bPhoto.hidden = false;
        var retirer = $("[data-retirer-photo]"); if (retirer) retirer.hidden = false;
        etatImport.textContent = "Photo chargée sur votre appareil (" + cw + "\u00a0×\u00a0" + ch + "\u00a0px). Elle disparaîtra à la fermeture de la page. Calez le repère sur une porte ou une prise pour une taille juste.";
        toutRendre(true);
        O.annoncer("Photo chargée. Calez le repère d’échelle pour une taille plus juste.");
      };
      im.src = lecteur.result;
    };
    lecteur.readAsDataURL(f);
  });
  var retirerPhoto = $("[data-retirer-photo]");
  if (retirerPhoto) retirerPhoto.addEventListener("click", function () {
    photoEl.removeAttribute("src");
    etat.photo = false; etat.mur = "platre"; etat.couleur = DEF_MUR.platre; etat.vueCm = 180; etat.x = 0.5; etat.y = 0.25;
    reinitialiserRepere();
    if (fichier) fichier.value = "";
    var bPhoto = $("[data-choix-mur=photo]"); if (bPhoto) bPhoto.hidden = true;
    retirerPhoto.hidden = true;
    etatImport.textContent = "Photo retirée.";
    toutRendre(true);
  });

  /* ---------- Repère d'échelle ---------- */
  function reinitialiserRepere() {
    repere.hidden = true;
    etat.repA = { x: 0.16, y: 0.18 }; etat.repB = { x: 0.16, y: 0.84 };
    var bt = $("[data-montrer-repere]"); if (bt) bt.setAttribute("aria-pressed", "false");
    var msg = $("[data-etat-repere]"); if (msg) msg.textContent = "";
  }
  var boutonRepere = $("[data-montrer-repere]");
  if (boutonRepere) boutonRepere.addEventListener("click", function () {
    var on = repere.hidden;
    repere.hidden = !on;
    boutonRepere.setAttribute("aria-pressed", on ? "true" : "false");
    rendreRepere();
    if (on) poignees.a.focus();
  });
  var choixRef = $("#reference-echelle");
  var autreRef = $("#reference-autre");
  if (choixRef) choixRef.addEventListener("change", function () { $("[data-bloc-autre]").hidden = choixRef.value !== "autre"; });
  var appliquer = $("[data-appliquer-repere]");
  if (appliquer) appliquer.addEventListener("click", function () {
    var refCm = choixRef.value === "autre" ? parseFloat(String(autreRef.value).replace(",", ".")) : parseFloat(choixRef.value);
    var msg = $("[data-etat-repere]");
    if (!refCm || refCm < 2 || refCm > 600) { msg.textContent = "Indiquez une longueur entre 2 et 600 cm."; return; }
    if (repere.hidden) { msg.textContent = "Affichez d’abord le repère et calez ses deux extrémités."; return; }
    var dx = (etat.repA.x - etat.repB.x) * mesure.W, dy = (etat.repA.y - etat.repB.y) * mesure.H;
    var dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 12) { msg.textContent = "Écartez davantage les deux extrémités du repère."; return; }
    var pxcm = dist / refCm;
    etat.vueCm = borne(mesure.H / pxcm, 30, 1500);
    etat.vuePhoto = etat.vueCm;
    toutRendre(false);
    msg.textContent = "Échelle appliquée : " + Math.round(refCm) + " cm sur le repère. La plaque est affichée à cette échelle, de façon indicative.";
    O.annoncer("Échelle appliquée");
  });

  /* ---------- Déplacement : souris, doigt, clavier, boutons ---------- */
  function deplacer(dx, dy) { etat.x = borne(etat.x + dx, 0, 1); etat.y = borne(etat.y + dy, 0, 1); rendre(); majPlaque(); }
  var glisse = null, attente = null;
  plaqueEl.addEventListener("pointerdown", function (e) {
    if (e.button !== undefined && e.button !== 0) return;
    e.preventDefault();
    try { plaqueEl.setPointerCapture(e.pointerId); } catch (er) { /* rien */ }
    var r = scene.getBoundingClientRect();
    glisse = { id: e.pointerId, dx: e.clientX - (r.left + etat.x * r.width), dy: e.clientY - (r.top + etat.y * r.height), r: r };
    plaqueEl.focus({ preventScroll: true });
  });
  plaqueEl.addEventListener("pointermove", function (e) {
    if (!glisse || e.pointerId !== glisse.id) return;
    var cx = e.clientX, cy = e.clientY;
    if (attente) return;
    attente = requestAnimationFrame(function () {
      attente = null;
      if (!glisse) return;
      etat.x = borne((cx - glisse.dx - glisse.r.left) / glisse.r.width, 0, 1);
      etat.y = borne((cy - glisse.dy - glisse.r.top) / glisse.r.height, 0, 1);
      rendre();
    });
  });
  function finGlisse(e) {
    if (!glisse || (e && e.pointerId !== glisse.id)) return;
    glisse = null; majPlaque();
    O.annoncer("Plaque déplacée : " + pct(etat.x) + " depuis la gauche, " + pct(etat.y) + " depuis le haut");
  }
  plaqueEl.addEventListener("pointerup", finGlisse);
  plaqueEl.addEventListener("pointercancel", finGlisse);
  plaqueEl.addEventListener("keydown", function (e) {
    var pas = e.shiftKey ? 0.1 : 0.01;
    var map = { ArrowLeft: [-pas, 0], ArrowRight: [pas, 0], ArrowUp: [0, -pas], ArrowDown: [0, pas] };
    if (map[e.key]) { e.preventDefault(); deplacer(map[e.key][0], map[e.key][1]); O.annoncer("Plaque déplacée"); }
  });
  $$("[data-deplacer]").forEach(function (b) {
    b.addEventListener("click", function (e) {
      var pas = e.shiftKey ? 0.1 : 0.01;
      var d = b.getAttribute("data-deplacer");
      if (d === "centre") { etat.x = 0.5; etat.y = etat.mur === "photo" ? 0.45 : 0.25; rendre(); majPlaque(); O.annoncer("Plaque centrée"); return; }
      var map = { gauche: [-pas, 0], droite: [pas, 0], haut: [0, -pas], bas: [0, pas] };
      deplacer(map[d][0], map[d][1]);
      O.annoncer("Plaque déplacée : " + pct(etat.x) + " depuis la gauche, " + pct(etat.y) + " depuis le haut");
    });
  });

  // poignées du repère
  Object.keys(poignees).forEach(function (k) {
    var p = poignees[k], g = null;
    var pt = k === "a" ? "repA" : "repB";
    p.addEventListener("pointerdown", function (e) { e.preventDefault(); try { p.setPointerCapture(e.pointerId); } catch (er) { /* rien */ } g = { id: e.pointerId, r: scene.getBoundingClientRect() }; });
    p.addEventListener("pointermove", function (e) {
      if (!g || e.pointerId !== g.id) return;
      etat[pt] = { x: borne((e.clientX - g.r.left) / g.r.width, 0, 1), y: borne((e.clientY - g.r.top) / g.r.height, 0, 1) };
      rendreRepere();
    });
    p.addEventListener("pointerup", function () { g = null; });
    p.addEventListener("pointercancel", function () { g = null; });
    p.addEventListener("keydown", function (e) {
      var pas = e.shiftKey ? 0.05 : 0.005;
      var map = { ArrowLeft: [-pas, 0], ArrowRight: [pas, 0], ArrowUp: [0, -pas], ArrowDown: [0, pas] };
      if (!map[e.key]) return;
      e.preventDefault();
      etat[pt] = { x: borne(etat[pt].x + map[e.key][0], 0, 1), y: borne(etat[pt].y + map[e.key][1], 0, 1) };
      rendreRepere();
    });
  });

  /* ---------- Plaque : modèle, finition, taille ---------- */
  var selModele = $("#modele-essai");
  if (selModele) selModele.addEventListener("change", function () {
    if (!O.PLQ[selModele.value]) return;
    etat.slug = selModele.value;
    etat.fin = O.premiereFinition(etat.slug, etat.fin);
    toutRendre(true);
  });
  $$("input[name=finition-essai]").forEach(function (r) {
    r.addEventListener("change", function () { if (r.checked) { etat.fin = r.value; toutRendre(true); } });
  });
  var cotes = $("#afficher-cotes");
  if (cotes) cotes.addEventListener("change", function () { scene.classList.toggle("avec-cotes", cotes.checked); });

  /* ---------- Lumière ---------- */
  var inter = $("[data-interrupteur-essai]");
  if (inter) inter.addEventListener("click", function () {
    etat.allume = !etat.allume;
    O.avecTransition(function () { majLumiere(); });
    majResume(true);
    O.annoncer(etat.allume ? (etat.kit ? "Aperçu de nuit" : "Aperçu de nuit avec le kit LED, qui n’est pas dans votre configuration") : "Aperçu de jour");
  });
  var caseKit = $("#kit-essai");
  if (caseKit) caseKit.addEventListener("change", function () {
    etat.kit = caseKit.checked;
    majLumiere(); majResume(true);
    O.annoncer(etat.kit ? "Kit LED ajouté à la configuration, 15 euros" : "Kit LED retiré de la configuration");
  });
  var intensite = $("#intensite-essai");
  if (intensite) intensite.addEventListener("input", function () { etat.intensite = borne((+intensite.value || 100) / 100, 0.2, 1); majLumiere(); });
  var cable = $("#cable-essai");
  if (cable) cable.addEventListener("change", function () { if (O.CABLES[cable.value]) etat.cable = cable.value; });
  document.addEventListener("tg3:led", function () { majResume(true); });

  /* ---------- Panier, lien, partage ---------- */
  var ajout = $("[data-ajouter-essai]");
  if (ajout) ajout.addEventListener("click", function () {
    var p = O.PLQ[etat.slug];
    var details = ["Finition " + O.FIN[etat.fin].a];
    var cle = etat.slug + "-" + etat.fin;
    if (etat.kit) { details.push("Kit LED monté, câble " + O.CABLES[etat.cable].toLowerCase()); cle += "-led-" + etat.cable; }
    O.ajouterAuPanier({
      cle: cle, slug: etat.slug, nom: p.n, fin: etat.fin, led: etat.kit ? O.ledCourante() : null, cable: etat.kit ? etat.cable : null,
      details: details, prix: D.prixPlaque + (etat.kit ? D.prixLed : 0), qte: 1,
      image: O.aPhoto(etat.slug, etat.fin) ? O.srcVignette(etat.slug, etat.fin) : ""
    });
  });
  var copie = $("[data-copier-essai]");
  if (copie) copie.addEventListener("click", function () { var h = majResume(true); O.copier(O.urlSansHash() + "#" + h, copie, "Lien copié"); });
  var envoi = $("[data-partager-essai]");
  if (envoi) envoi.addEventListener("click", function () {
    var h = majResume(true);
    O.partager("Terre Gravée · " + O.PLQ[etat.slug].n, "Qu’en penses-tu ? " + O.resumeConfig(etat.slug, etat.fin, etat.kit ? O.ledCourante() : null, 1), O.urlSansHash() + "#" + h, envoi);
  });

  /* ---------- « Mon mur » : image PNG composée sur l'appareil ---------- */
  function chargerDonnees(cle, ok, ko) {
    window.TG3_PLAQUES = window.TG3_PLAQUES || {};
    if (window.TG3_PLAQUES[cle]) { ok(window.TG3_PLAQUES[cle]); return; }
    var s = document.createElement("script");
    s.src = "assets/plaques-data/" + cle + ".js";
    s.onload = function () { if (window.TG3_PLAQUES[cle]) ok(window.TG3_PLAQUES[cle]); else ko(); };
    s.onerror = ko;
    document.head.appendChild(s);
  }
  function hexRgb(hex) { var n = parseInt(hex.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  function motifBruit(ctx, force) {
    var t = document.createElement("canvas"); t.width = t.height = 128;
    var c = t.getContext("2d"), d = c.createImageData(128, 128);
    var graine = 7;
    for (var i = 0; i < d.data.length; i += 4) {
      graine = (graine * 16807) % 2147483647;
      var v = graine / 2147483647;
      d.data[i] = d.data[i + 1] = d.data[i + 2] = v > 0.5 ? 255 : 0;
      d.data[i + 3] = Math.round(Math.abs(v - 0.5) * 2 * force * 255);
    }
    c.putImageData(d, 0, 0);
    return ctx.createPattern(t, "repeat");
  }
  function dessinerMur(ctx, W, H, cm) {
    var m = etat.mur;
    ctx.fillStyle = etat.couleur; ctx.fillRect(0, 0, W, H);
    if (m === "brique") {
      var rangs = ["#a3543c", "#934733", "#ae6046", "#8c4430"];
      var hRang = 6.5 * cm, lB = 22 * cm, j = 1 * cm, k = 0;
      for (var y = H; y > -hRang; y -= hRang) {
        var dec = (k % 2) ? -11.5 * cm : 0;
        for (var x = dec; x < W; x += lB + j) {
          ctx.fillStyle = rangs[(k * 3 + Math.round(x / cm)) % 4];
          ctx.fillRect(x + j / 2, y - hRang + j / 2, lB, hRang - j);
        }
        k++;
      }
    } else if (m === "bois") {
      for (var xb = 0; xb < W; xb += 14 * cm) { ctx.fillStyle = "rgba(60,36,18,.7)"; ctx.fillRect(xb + (14 - 0.4) * cm, 0, Math.max(1, 0.4 * cm), H); }
      ctx.fillStyle = "rgba(60,36,18,.08)";
      for (var g = 0; g < W; g += 3 + (g * 7) % 9) ctx.fillRect(g, 0, 1, H);
    } else if (m === "beton") {
      ctx.fillStyle = "rgba(0,0,0,.16)";
      for (var yb = H; yb > 0; yb -= 50 * cm) ctx.fillRect(0, yb, W, 1);
      ctx.fillStyle = "rgba(40,40,40,.38)";
      for (var yy = H - 25 * cm; yy > 0; yy -= 50 * cm) {
        for (var xx = 31.25 * cm; xx < W; xx += 62.5 * cm) { ctx.beginPath(); ctx.arc(xx, yy, 1.1 * cm, 0, Math.PI * 2); ctx.fill(); }
      }
    }
    ctx.fillStyle = motifBruit(ctx, m === "beton" ? 0.22 : 0.1); ctx.fillRect(0, 0, W, H);
    var lum = ctx.createRadialGradient(W / 2, -H * 0.1, 0, W / 2, -H * 0.1, H * 1.2);
    lum.addColorStop(0, "rgba(255,255,255,.22)"); lum.addColorStop(1, "rgba(0,0,0,.14)");
    ctx.fillStyle = lum; ctx.fillRect(0, 0, W, H);
    // plinthe et meuble repère
    ctx.fillStyle = "#e9e5dd"; ctx.fillRect(0, H - 8 * cm, W, 8 * cm);
    ctx.fillStyle = "rgba(0,0,0,.12)"; ctx.fillRect(0, H - 8 * cm, W, 1);
    var mx = W / 2 - 60 * cm, my = H - 75 * cm;
    ctx.fillStyle = "#2c241e"; ctx.fillRect(mx + 6 * cm, H - 11 * cm, 2.5 * cm, 11 * cm); ctx.fillRect(mx + 111.5 * cm, H - 11 * cm, 2.5 * cm, 11 * cm);
    ctx.fillStyle = "#3f342b"; ctx.fillRect(mx, my, 120 * cm, 64 * cm);
    ctx.fillStyle = "#5b4c3f"; ctx.fillRect(mx, my, 120 * cm, 2 * cm);
    ctx.fillStyle = "rgba(0,0,0,.35)"; ctx.fillRect(mx + 60 * cm, my + 8 * cm, 1, 48 * cm);
    ctx.fillStyle = "#ddd5c9"; ctx.fillRect(mx + 0.18 * 120 * cm, my - 26 * cm, 12 * cm, 26 * cm);
    ctx.fillStyle = "#5d6f86"; ctx.fillRect(mx + 120 * cm * 0.84 - 24 * cm, my - 6 * cm, 24 * cm, 2 * cm);
    ctx.fillStyle = "#c9b48a"; ctx.fillRect(mx + 120 * cm * 0.84 - 24 * cm, my - 4 * cm, 24 * cm, 2 * cm);
    ctx.fillStyle = "#7a4b3a"; ctx.fillRect(mx + 120 * cm * 0.84 - 24 * cm, my - 2 * cm, 24 * cm, 2 * cm);
  }
  function dessinerCouverture(ctx, im, W, H) {
    var r = Math.max(W / im.naturalWidth, H / im.naturalHeight);
    var w = im.naturalWidth * r, h = im.naturalHeight * r;
    ctx.drawImage(im, (W - w) / 2, (H - h) / 2, w, h);
  }
  function composer(imPlaque, fini) {
    var E = 1600 / mesure.W;
    var W = 1600, H = Math.round(mesure.H * E), bande = 72, cm = mesure.pxcm * E;
    var c = document.createElement("canvas"); c.width = W; c.height = H + bande;
    var ctx = c.getContext("2d");
    if (etat.mur === "photo" && photoEl.naturalWidth) dessinerCouverture(ctx, photoEl, W, H);
    else dessinerMur(ctx, W, H, cm);
    var led = hexRgb(O.COUL[O.ledCourante()].hex);
    var px = mesure.left * E, py = mesure.top * E, pw = mesure.w * E, ph = pw * imPlaque.naturalHeight / imPlaque.naturalWidth;
    var off = document.createElement("canvas"); off.width = Math.max(1, Math.round(pw)); off.height = Math.max(1, Math.round(ph));
    var o = off.getContext("2d"); o.drawImage(imPlaque, 0, 0, off.width, off.height);
    var d = o.getImageData(0, 0, off.width, off.height), px4 = d.data, i;
    if (etat.allume) {
      ctx.fillStyle = "rgba(4,7,14,.84)"; ctx.fillRect(0, 0, W, H);
      var k = etat.intensite;
      /* halo en plusieurs couches douces, puis un léger grain pour casser les paliers du dégradé */
      [[40 * cm, 0.07], [28 * cm, 0.09], [18 * cm, 0.14], [11 * cm, 0.2], [6 * cm, 0.32], [2.5 * cm, 0.8]].forEach(function (h) {
        ctx.save();
        ctx.shadowColor = "rgba(" + led.join(",") + "," + (h[1] * k) + ")"; ctx.shadowBlur = h[0]; ctx.shadowOffsetX = 100000;
        ctx.fillStyle = "#000"; ctx.fillRect(px - 100000, py, pw, ph);
        ctx.restore();
      });
      ctx.save(); ctx.globalAlpha = 0.5; ctx.fillStyle = motifBruit(ctx, 0.05); ctx.fillRect(0, 0, W, H); ctx.restore();
      var f = 0.35 + 0.65 * k;
      for (i = 0; i < px4.length; i += 4) {
        var lum = (0.2126 * px4[i] + 0.7152 * px4[i + 1] + 0.0722 * px4[i + 2]) / 255;
        var v = (O.PLQ[etat.slug].sil === "noir" ? borne((lum - 0.5) * 1.8 + 0.5, 0, 1) : borne((lum * 0.68 - 0.5) * 10 + 0.5, 0, 1)) * f;
        px4[i] = led[0] * v; px4[i + 1] = led[1] * v; px4[i + 2] = led[2] * v; px4[i + 3] = 255;
      }
      o.putImageData(d, 0, 0);
      ctx.drawImage(off, px, py, pw, ph);
    } else {
      ctx.save();
      ctx.shadowColor = "rgba(30,24,16,.32)"; ctx.shadowBlur = 1.6 * cm; ctx.shadowOffsetX = 100000 + 0.5 * cm; ctx.shadowOffsetY = 1 * cm;
      ctx.fillStyle = "#000"; ctx.fillRect(px - 100000, py, pw, ph);
      ctx.restore();
      var b = etat.fin === "gris" ? 1.2 : (etat.fin === "dore" ? 1.12 : 1);
      if (b !== 1) {
        for (i = 0; i < px4.length; i += 4) { px4[i] = Math.min(255, px4[i] * b); px4[i + 1] = Math.min(255, px4[i + 1] * b); px4[i + 2] = Math.min(255, px4[i + 2] * b); }
        o.putImageData(d, 0, 0);
      }
      ctx.save(); ctx.globalCompositeOperation = "multiply"; ctx.drawImage(off, px, py, pw, ph); ctx.restore();
    }
    // bandeau légende
    ctx.fillStyle = "#060a14"; ctx.fillRect(0, H, W, bande);
    ctx.fillStyle = "rgb(" + led.join(",") + ")"; ctx.fillRect(0, H, 6, bande);
    ctx.fillStyle = "#edf1f8"; ctx.font = "600 24px Manrope, 'Segoe UI', sans-serif"; ctx.textBaseline = "middle";
    var p = O.PLQ[etat.slug];
    var c0 = O.COUL[O.ledCourante()];
    var nomLum = c0.f || c0.n.toLowerCase();
    var suffixe = etat.kit ? " · kit LED, lumière " + nomLum : (etat.allume ? " · aperçu de nuit, lumière " + nomLum : "");
    ctx.fillText("Terre Gravée · " + p.n + " · " + O.FIN[etat.fin].n + suffixe, 32, H + bande / 2);
    ctx.fillStyle = "#b7c1d4"; ctx.font = "400 18px 'JetBrains Mono', Consolas, monospace"; ctx.textAlign = "right";
    ctx.fillText("Simulation, rendu indicatif · 30 × 60 cm", W - 32, H + bande / 2);
    c.toBlob(function (blob) { fini(blob); }, "image/jpeg", 0.88);
  }
  var exporter = $("[data-exporter]");
  var etatExport = $("[data-etat-export]");
  if (exporter) exporter.addEventListener("click", function () {
    if (!O.aPhoto(etat.slug, etat.fin)) { etatExport.textContent = "La photo de cette finition est à venir : choisissez une autre finition pour enregistrer l’image."; return; }
    etatExport.textContent = "Composition de l’image sur votre appareil…";
    var finImage = etat.allume ? O.PLQ[etat.slug].sil : etat.fin;
    chargerDonnees(etat.slug + "-" + finImage, function (url) {
      var im = new Image();
      im.onload = function () {
        try {
          composer(im, function (blob) {
            if (!blob) { etatExport.textContent = "Image impossible à créer dans ce navigateur."; return; }
            var nomFichier = "mon-mur-terre-gravee-" + etat.slug + ".jpg";
            var fichierPng = null;
            try { fichierPng = new File([blob], nomFichier, { type: "image/jpeg" }); } catch (e) { fichierPng = null; }
            if (fichierPng && navigator.canShare && navigator.share && navigator.canShare({ files: [fichierPng] }) && window.matchMedia("(pointer: coarse)").matches) {
              navigator.share({ files: [fichierPng], title: "Mon mur · Terre Gravée" }).catch(function () { /* annulé */ });
              etatExport.textContent = "Image prête : choisissez où la partager.";
            } else {
              var a = document.createElement("a");
              a.href = URL.createObjectURL(blob); a.download = nomFichier;
              document.body.appendChild(a); a.click();
              setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 4000);
              etatExport.textContent = "Image enregistrée : " + nomFichier + ".";
            }
          });
        } catch (e) { etatExport.textContent = "Image impossible à créer dans ce navigateur."; }
      };
      im.src = url;
    }, function () { etatExport.textContent = "Image de la plaque indisponible."; });
  });

  /* ---------- Démarrage ---------- */
  var redim = null;
  window.addEventListener("resize", function () { if (redim) cancelAnimationFrame(redim); redim = requestAnimationFrame(rendre); });
  if ("ResizeObserver" in window) new ResizeObserver(function () { rendre(); }).observe(scene);
  toutRendre(false);
})();
