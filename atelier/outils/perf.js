// Essai de bout en bout dans Chromium (Playwright) : bataille (tower defense) lancée deux fois de suite,
// quitter avec Échap, question ratée en bataille qui revient 4 questions plus tard (« Seconde chance »), onglet
// Grammaire rangé par badges, événement du jour, conseil du royaume, signalement, export puis import, noms de la carte de
// campagne qui ne se touchent pas (de la première province prise à la dernière, avec les bourgs puis en repli avec les
// médaillons), carte de campagne entière dans une fenêtre de 1366 × 768 (avec et sans alerte), énoncé de chaque question
// de bataille visible en haut de la colonne de droite à 1366 × 768 (association longue, erreur, questions suivantes),
// et deux mesures du temps entre une réponse et la question suivante (objectif < 100 ms) :
//  - JEU.mesure (horloge truquée) : seulement la construction de la question suivante, sur 50 enchaînements au moins ;
//  - Event Timing (temps réel, sans horloge truquée) : de la touche à l'image peinte qui montre la question suivante,
//    pendant le conseil de guerre de batailles en 1366 × 768 et en 1920 × 1080.
// Seuls les enchaînements question → question comptent : une vague, une carte de décision ou un bilan n'en sont pas.
// Contrôles de la toile de bataille : jamais réallouée pendant une bataille sans changement de taille de la fenêtre
// (le conseil de guerre élargit la colonne de droite, la toile ne bouge pas) ; réallouée (fenêtre redimensionnée), elle
// est redessinée dans la même tâche ; rendue (largeur 0) quand on quitte. Repli : sans terrain 3D, la route est dessinée.
// Mêlée (15/10/2026) : la vague au Gué donne des combats au corps à corps, dessinés avec le sang, sans le sang, puis sans
// animations (aucune erreur JavaScript) ; une question ratée en bataille coûte 6 or (sceau « −6 or », bandeau) ; la case
// « Sang dans les combats » des Réglages est cochée par défaut et s'enregistre.
// Bataillons (16/10/2026) : pendant la vague au Gué, chaque troupe est dessinée en formation de plusieurs figurines, et des
// figurines tombées restent couchées au sol. Grosse mêlée forcée (dernière vague de la Forteresse anglaise, armée nombreuse
// des deux côtés), en temps réel, en 1366 × 768 et en 1920 × 1080 : écarts entre deux images (médiane 16,7 ms attendue,
// au plus 2 % au-delà de 34 ms) et durée de la boucle de bataille (moteur et dessin ; 95 % des images sous 8 ms).
// Contrôles d'interface : accords de « verrouillé », un seul sceau à la fois, bonne réponse d'une association montrée
// une fois, or du bandeau jamais estompé, titre et « Quitter » visibles en 1366 × 768, tribut hors de la carte,
// lignes sous les noms de la carte d'au moins 14 px à l'écran, noms séparés de 8 px et plus près de leur lieu.
// Usage : node atelier/outils/perf.js   (demande le module playwright ; sinon, faire les vérifications à la main)
// Variables facultatives : CHROMIUM (chemin du navigateur), DETAIL=1 (affiche toutes les mesures).
"use strict";
const path = require("path");
let chromium;
try { ({ chromium } = require("playwright")); } catch (e) {
  console.log("Playwright n'est pas installé : essai automatique impossible. Faire les vérifications dans le navigateur.");
  process.exit(0);
}
const URL = "file://" + path.join(__dirname, "..", "..", "jeu", "index.html").replace(/\\/g, "/");
const MESURES_VOULUES = 50;

// Rang affiché (1, 2…) d'un choix, retrouvé par son texte : les choix des QCM sont mélangés à l'affichage.
const rangsQcm = []; // rang affiché de la bonne réponse des QCM simples répondus juste (doit varier)
async function rangAffiche(page, texte) {
  return page.evaluate(t => {
    const b = [...document.querySelectorAll(".reponses button.choix[data-n]")].find(x => x.lastElementChild.textContent === t);
    return b ? Number(b.dataset.n) : 0;
  }, texte);
}

// Répond juste à la question affichée, au clavier (et à la souris pour la colonne de droite des associations).
async function repondreJuste(page) {
  const q = await page.evaluate(() => { const q = JEU.ui.questionCourante; return { type: q.type, reponse: q.reponse, choix: q.choix, corrections: q.corrections, texte: q.texte }; });
  const k = n => page.keyboard.press(String(n));
  switch (q.type) {
    case "qcm": { const r = await rangAffiche(page, q.reponse); rangsQcm.push(r); await k(r); break; }
    case "qcm_multiple": for (const c of q.reponse) await k(await rangAffiche(page, c)); await page.keyboard.press("Enter"); break;
    case "vrai_faux":
      if (q.reponse.vrai) await k(1);
      else {
        await k(2);
        // les corrections sont mélangées à l'affichage : on cherche la bonne par son texte
        const n = await page.evaluate(t => { const b = [...document.querySelectorAll(".reponses button.choix[data-n]")].find(x => x.lastElementChild.textContent === t); return b ? Number(b.dataset.n) : 0; }, q.reponse.correction);
        await k(n);
      }
      break;
    case "ordre": for (const i of q.reponse) await k(i + 1); await page.keyboard.press("Enter"); break;
    case "association":
      for (const [g, d] of q.reponse) { await k(g + 1); await page.locator(".association .colonne").nth(1).locator(".choix").nth(d).click(); }
      await page.keyboard.press("Enter"); break;
    case "trou":
      await page.evaluate(r => { document.querySelectorAll(".trou").forEach((c, i) => { c.value = Array.isArray(r[i]) ? r[i][0] : r[i]; }); }, q.reponse);
      await page.keyboard.press("Enter"); break;
  }
}

// Répond faux à la question affichée (première réponse fausse, sans essai de plus).
async function repondreFaux(page) {
  const q = await page.evaluate(() => { const q = JEU.ui.questionCourante; return { type: q.type, reponse: q.reponse, choix: q.choix, elements: q.elements }; });
  const k = n => page.keyboard.press(String(n));
  switch (q.type) {
    case "qcm": await k(await rangAffiche(page, q.choix.find(c => c !== q.reponse))); break;
    case "vrai_faux": await k(q.reponse.vrai ? 2 : 1); break; // « Faux » pour une affirmation vraie, et inversement
    case "ordre": { const faux = q.reponse.slice(1).concat(q.reponse.slice(0, 1)); for (const i of faux) await k(i + 1); await page.keyboard.press("Enter"); break; }
    case "association":
      for (const [g, d] of q.reponse) { await k(g + 1); await page.locator(".association .colonne").nth(1).locator(".choix").nth((d + 1) % q.reponse.length).click(); }
      await page.keyboard.press("Enter"); break;
    case "trou":
      await page.evaluate(() => { document.querySelectorAll(".trou").forEach(c => { if (c.tagName === "SELECT") c.selectedIndex = 0; else c.value = "zzz"; }); });
      await page.keyboard.press("Enter"); break;
    default: await page.keyboard.press("Enter"); // qcm_multiple : rien de coché
  }
}

// Une carte du conseil : affirmation jugée juste (avec la bonne correction si elle est fausse), décision tranchée à droite.
async function jouerCarteConseil(page) {
  if (await page.$(".carte-conseil.decision")) {
    await page.keyboard.press("ArrowRight");
    await page.waitForSelector(".carte-conseil.decision", { state: "detached" });
    return;
  }
  const r = await page.evaluate(() => {
    const t = document.querySelector(".carte-conseil .affirmation").textContent.replace(/^« | »$/g, "");
    const tout = [];
    // tous les cours chargés : ceux du planning et des méthodes (JEU.donnees.cours) et les séquences d'anglais
    // (JEU.donnees.anglais, 16/10/2026 : le conseil du royaume en tire aussi des affirmations)
    Object.keys(JEU.donnees.cours).concat(Object.keys(JEU.donnees.anglais || {}))
      .forEach(c => JEU.questions.questionsDuCours(c).forEach(x => { if (x.enonce === t) tout.push(x); }));
    if (!tout.length) throw new Error("affirmation du conseil introuvable parmi les questions : " + t);
    return tout[0].reponse;
  });
  await page.keyboard.press(r.vrai ? "ArrowRight" : "ArrowLeft");
  if (r.vrai) return;
  // les corrections sont mélangées à l'affichage : on cherche la bonne par son texte
  await page.waitForSelector(".scene-conseil .choix");
  const n = await page.evaluate(c => Array.from(document.querySelectorAll(".scene-conseil .choix"))
    .findIndex(b => b.lastElementChild && b.lastElementChild.textContent === c), r.correction);
  await page.keyboard.press(String(n + 1));
}

// Espion de la toile de bataille : chaque largeur donnée à une toile .td-canvas déjà dessinée (réallocation : la toile
// est effacée) est notée, avec « redessinee » si un dessin a suivi dans la même tâche (avant la fin de la tâche, vue
// par une micro-tâche). La largeur 0 (toile rendue en quittant) est notée à part.
function espionToile() {
  window.__toile = { realloc: [], rendues: 0 };
  const d = Object.getOwnPropertyDescriptor(HTMLCanvasElement.prototype, "width");
  Object.defineProperty(HTMLCanvasElement.prototype, "width", { configurable: true, get: d.get, set(v) {
    d.set.call(this, v);
    if (!this.classList || !this.classList.contains("td-canvas")) return;
    if (v === 0) { window.__toile.rendues++; return; }
    if (!this.__dessinee) return; // première taille, avant le premier dessin
    const e = { largeur: v, redessinee: false, conseil: !!document.querySelector(".td-question .question") };
    this.__attente = e;
    window.__toile.realloc.push(e);
    queueMicrotask(() => { this.__attente = null; });
  } });
  const di = CanvasRenderingContext2D.prototype.drawImage;
  CanvasRenderingContext2D.prototype.drawImage = function () {
    const c = this.canvas;
    if (c && c.classList && c.classList.contains("td-canvas")) { c.__dessinee = true; if (c.__attente) c.__attente.redessinee = true; }
    return di.apply(this, arguments);
  };
}

async function nouvellePage(navigateur, w, h, erreurs) {
  const page = await navigateur.newPage({ viewport: { width: w, height: h } });
  await page.addInitScript(espionToile);
  page.on("pageerror", e => erreurs.push(e.message));
  page.on("console", m => { if (m.type() === "error") erreurs.push(m.text()); });
  await page.goto(URL);
  await page.waitForFunction(() => window.JEU && JEU.pret);
  return page;
}
const attendre = ms => new Promise(r => setTimeout(r, ms));

// Questions choisies pour le conseil de guerre : la plus longue association, puis un long QCM, puis un vrai ou faux
// (les plus longs du jeu), à la place du tirage habituel.
async function questionsLongues(page) {
  await page.evaluate(() => {
    const toutes = [].concat(...Object.keys(JEU.donnees.cours).map(c => JEU.questions.questionsDuCours(c)));
    const taille = q => JSON.stringify([q.enonce, q.choix, q.gauche, q.droite]).length;
    const plus = t => toutes.filter(q => q.type === t).sort((a, b) => taille(b) - taille(a))[0];
    const choix = [plus("association"), plus("qcm"), plus("vrai_faux")].filter(Boolean);
    window.__suite = JEU.recit.suite;
    JEU.recit.suite = function (n) { const r = choix.splice(0, n); return r.length ? r : window.__suite.apply(this, arguments); };
  });
}

// haut visible de la colonne de droite (sous le bandeau) et position d'un élément de la question
async function visibilite(page, selecteur) {
  return page.evaluate(sel => {
    const col = document.querySelector(".td-bas"), e = document.querySelector(sel);
    if (!col || !e) return null;
    const bandeau = document.getElementById("bandeau");
    const hb = bandeau ? bandeau.getBoundingClientRect().bottom : 0;
    const rc = col.getBoundingClientRect(), re = e.getBoundingClientRect();
    const hautVisible = Math.max(rc.top, hb, 0);
    return { haut: Math.round(re.top), hautVisible: Math.round(hautVisible), visible: re.top >= hautVisible - 1 && re.top < Math.min(rc.bottom, innerHeight) - 10 };
  }, selecteur);
}

async function essaiPortable(navigateur, erreurs) {
  const page = await nouvellePage(navigateur, 1366, 768, erreurs);
  const res = { carte: [], questions: [], interface: {} };
  // carte de campagne : bas du dessin dans la fenêtre, sans alerte puis avec l'alerte d'une attaque ; taille à l'écran
  // de la plus petite ligne sous un nom (place forte n / n, prise, attaqué par…)
  await page.click("#menu button[data-ecran=jouer]");
  await page.waitForSelector("#ecran-jouer .carte-campagne");
  for (const cas of ["sans alerte", "avec alerte"]) {
    await page.evaluate(a => { const c = JEU.campagne.etat(); c.conquises = ["gue", "piemont"]; c.rival.attaque = a ? "angleterre" : null; JEU.ui.afficher("jouer"); window.scrollTo(0, 0); }, cas === "avec alerte");
    await attendre(150);
    res.carte.push(Object.assign({ cas }, await page.evaluate(() => {
      const svg = document.querySelector(".carte-svg"), k = svg.getBoundingClientRect().width / 1000;
      const sous = [...svg.querySelectorAll(".sous-lieu")].map(t => parseFloat(getComputedStyle(t).fontSize) * k);
      return { bas: Math.round(svg.getBoundingClientRect().bottom), vue: innerHeight, sousEcran: Math.round(Math.min(...sous) * 10) / 10 };
    })));
  }
  // tribut du jour : le message s'affiche hors de la carte
  res.interface.tribut = await page.evaluate(async () => {
    const c = JEU.campagne.etat(); c.dernierJour = "2000-01-01"; c.rival.attaque = null;
    JEU.ui.afficher("jouer"); window.scrollTo(0, 0);
    await new Promise(r => setTimeout(r, 400));
    const t = document.getElementById("toast"), a = t.getBoundingClientRect(), b = document.querySelector(".carte-svg").getBoundingClientRect();
    return { visible: t.classList.contains("visible") && /tribut/.test(t.textContent), surCarte: Math.min(a.right, b.right) > Math.max(a.left, b.left) && Math.min(a.bottom, b.bottom) > Math.max(a.top, b.top) };
  });
  await page.evaluate(() => { const c = JEU.campagne.etat(); c.conquises = []; c.rival.attaque = null; JEU.ui.afficher("jouer"); });
  // bataille : association longue répondue fausse (la colonne défile pour l'atteindre), panneau d'erreur, puis deux
  // questions répondues justes : chaque fois, le haut doit se voir
  await questionsLongues(page);
  await page.evaluate(() => JEU.bataille.lancer("gue"));
  await page.waitForSelector(".td-question .question");
  await attendre(250);
  res.questions.push(Object.assign({ quoi: "énoncé de l'association" }, await visibilite(page, ".td-question .enonce")));
  // titre de la bataille et « Quitter (Échap) » visibles (pas cachés sous le bandeau), page défilée
  res.interface.barre = await page.evaluate(() => {
    const b = document.getElementById("bouton-quitter"), t = document.querySelector("#ecran-partie .barre-partie h2");
    const vu = e => { const r = e.getBoundingClientRect(), x = Math.min(r.right - 4, Math.max(r.left + 4, r.left + r.width / 2)), y = r.top + r.height / 2; const h = document.elementFromPoint(x, y); return !!h && (h === e || e.contains(h)); };
    return { defilement: Math.round(scrollY), quitter: vu(b), titre: vu(t) };
  });
  // l'or du bandeau du champ reste lisible quand un cercle de portée passe dessous (vague et revenu s'estompent)
  res.interface.or = await page.evaluate(async () => {
    const h = document.querySelector(".td-hud"); h.classList.add("discret");
    await new Promise(r => setTimeout(r, 300));
    const o = +getComputedStyle(h.querySelector(".td-or")).opacity * +getComputedStyle(h).opacity, v = +getComputedStyle(h.querySelector(".td-vague")).opacity;
    h.classList.remove("discret");
    return { or: o, vague: v };
  });
  const q = await page.evaluate(() => { const q = JEU.ui.questionCourante; return { type: q.type, reponse: q.reponse }; });
  if (q.type === "association") {
    // réponse fausse : chaque mot avec la définition du suivant
    for (const [g, d] of q.reponse) {
      await page.keyboard.press(String(g + 1));
      await page.locator(".association .colonne").nth(1).locator(".choix").nth((d + 1) % q.reponse.length).click();
    }
    await attendre(100);
    res.questions.push(Object.assign({ quoi: "bouton Valider de l'association" }, await visibilite(page, ".td-question .valider")));
    await page.keyboard.press("Enter");
    await page.waitForSelector(".panneau-erreur");
    await attendre(250);
    res.questions.push(Object.assign({ quoi: "titre du panneau d'erreur" }, await visibilite(page, ".panneau-erreur .verdict")));
    // la bonne réponse n'y est écrite qu'une fois (pas de nouveau dans l'explication)
    res.interface.erreurAssociation = await page.evaluate(() => {
      const q = JEU.ui.questionCourante, t = document.querySelector(".panneau-erreur").textContent;
      return { fois: Math.max(...q.reponse.map(p => t.split(q.droite[p[1]]).length - 1)), paires: document.querySelectorAll(".panneau-erreur .paires li").length };
    });
    await page.keyboard.press("Enter");
  } else await repondreJuste(page);
  for (let i = 0; i < 2; i++) {
    await page.waitForFunction(() => document.querySelector(".td-question .question .enonce"));
    await attendre(250);
    res.questions.push(Object.assign({ quoi: "énoncé de la question " + (i + 2) }, await visibilite(page, ".td-question .enonce")));
    // trois cartes de récit avant la question (le mot du rival, un événement de vague ajouté ici, le conseiller) : la
    // dernière réponse d'un QCM reste en vue sans faire défiler la colonne (cartes et question serrées en fenêtre
    // basse, revue du 16/10/2026 ; avant, la 4e réponse passait 95 px sous le bord)
    if (await page.evaluate(() => JEU.ui.questionCourante.type === "qcm")) {
      res.questions.push(Object.assign({ quoi: "dernière réponse du QCM avec trois cartes de récit (question " + (i + 2) + ")" }, await page.evaluate(async () => {
        const conseil = document.querySelector(".td-conseil"), rival = conseil.querySelector(":scope > .recit");
        const ev = JEU.ui.recit({ nom: "Un éclaireur", icone: "trompe", texte: "Le forgeron a fini des flèches neuves : tes archers frappent plus fort pendant cette vague." });
        if (rival) rival.after(ev); else conseil.prepend(ev);
        await new Promise(r => setTimeout(r, 150));
        const col = document.querySelector(".td-bas").getBoundingClientRect(), choix = document.querySelectorAll(".td-question .choix"), d = choix[choix.length - 1].getBoundingClientRect();
        const cartes = conseil.querySelectorAll(".recit").length;
        ev.remove();
        return { haut: Math.round(d.top), hautVisible: Math.round(col.top), bas: Math.round(d.bottom), basColonne: Math.round(col.bottom), cartes, visible: d.top >= col.top && d.bottom <= col.bottom + 0.5 };
      })));
    }
    await repondreJuste(page);
  }
  // deux sceaux coup sur coup : le second remplace le premier
  res.interface.sceaux = await page.evaluate(async () => {
    JEU.ui.tampon("Juste", "+12 or"); await new Promise(r => setTimeout(r, 120));
    JEU.ui.tampon("Coup d'éclat", "+22 or"); await new Promise(r => setTimeout(r, 120));
    return document.querySelectorAll(".tampon").length;
  });
  // fin du conseil : « verrouillé » accordé (Trébuchet, Cavaliers ×2, Tour de siège), puis on quitte : la toile est rendue
  await page.waitForSelector(".td-pret");
  res.interface.verrous = await page.evaluate(() => Object.fromEntries([...document.querySelectorAll(".td-bouton:disabled")]
    .map(b => [b.querySelector(".td-nom").textContent.replace(/^\d/, "").trim(), b.querySelector(".td-cout").textContent])));
  await page.keyboard.press("Escape");
  await page.waitForSelector(".confirmation");
  await page.click(".confirmation .bouton.principal");
  await page.waitForFunction(() => !JEU.partie);
  res.interface.toileRendue = await page.evaluate(() => { const c = document.querySelector(".td-canvas"); return !c || c.width === 0; });
  await page.close();
  return res;
}

// Event Timing : durée de chaque touche qui répond à une question de bataille et amène la suivante (de la touche à
// l'image peinte), batailles réelles (le champ de bataille s'anime pendant ce temps), sans horloge truquée.
async function tempsReel(navigateur, w, h, erreurs) {
  const page = await nouvellePage(navigateur, w, h, erreurs);
  await page.evaluate(() => {
    window.__ev = [];
    new PerformanceObserver(l => l.getEntries().forEach(e => { if (e.name === "keydown") window.__ev.push(e.duration); }))
      .observe({ type: "event", durationThreshold: 16, buffered: true });
  });
  await page.click("#menu button[data-ecran=jouer]");
  await page.waitForSelector("#ecran-jouer .carte-campagne");
  const durees = [];
  // batailles des deux fronts, jusqu'à 8 mesures (les associations et les textes à trous, répondus en plusieurs
  // gestes, ne sont pas mesurés : le tirage des questions décide du nombre de batailles)
  for (const lieu of ["gue", "piemont", "moulin", "forteresse", "col", "oliveraie", "chateau", "fleuve"]) {
    if (durees.length >= 8) break;
    await page.evaluate(l => JEU.bataille.lancer(l), lieu);
    await page.waitForSelector(".td-canvas");
    for (let i = 0; i < 3; i++) {
      await page.waitForFunction(() => document.querySelector(".td-question .question"));
      await attendre(350);
      const avant = await page.evaluate(() => window.__ev.length);
      const type = await page.evaluate(() => JEU.ui.questionCourante.type);
      await repondreJuste(page);
      await attendre(350);
      // les réponses au clavier qui amènent une autre question (la 3e amène la fin du conseil)
      if (i < 2 && type !== "association" && type !== "trou") {
        const ev = await page.evaluate(a => window.__ev.slice(a), avant);
        durees.push(ev.length ? Math.max(...ev) : 16);
      }
    }
    await page.waitForSelector(".td-pret");
    await page.keyboard.press("Escape");
    await page.waitForSelector(".confirmation");
    await page.click(".confirmation .bouton.principal");
    await page.waitForFunction(() => !JEU.partie && JEU.ui.ecranCourant() === "jouer");
  }
  const toile = await page.evaluate(() => window.__toile);
  await page.close();
  const tri = durees.slice().sort((a, b) => a - b);
  return { taille: w + " × " + h, mesures: durees.length, mediane: tri[Math.floor(tri.length / 2)], max: tri[tri.length - 1], detail: durees,
    reallocations: toile.realloc.length, toilesRendues: toile.rendues };
}

// Grosse mêlée en temps réel (bataillons, 16/10/2026) : dernière vague de la Forteresse anglaise, avec une armée
// nombreuse des deux côtés (or et arsenal donnés par l'essai). La vague avance à ×3 jusqu'à ce que six troupes se battent
// au corps à corps, puis à ×1 pendant la mesure : écarts entre deux images (requestAnimationFrame) et durée de chaque
// passage de la boucle de bataille (moteur et dessin), pendant MESURE_MELEE secondes.
const MESURE_MELEE = 6;
async function grosseMelee(navigateur, w, h, erreurs) {
  const page = await navigateur.newPage({ viewport: { width: w, height: h } });
  await page.addInitScript(() => {
    window.__boucle = [];
    const raf = window.requestAnimationFrame;
    window.requestAnimationFrame = function (f) {
      if (f && f.name === "boucle") return raf.call(window, function boucle(t) { const a = performance.now(); f(t); window.__boucle.push(performance.now() - a); });
      return raf.call(window, f);
    };
  });
  page.on("pageerror", e => erreurs.push(e.message));
  page.on("console", m => { if (m.type() === "error") erreurs.push(m.text()); });
  await page.goto(URL);
  await page.waitForFunction(() => window.JEU && JEU.pret);
  await page.click("#menu button[data-ecran=jouer]");
  await page.waitForSelector("#ecran-jouer .carte-campagne");
  await page.evaluate(() => JEU.bataille.lancer("chateau"));
  for (let i = 0; i < 3; i++) {
    await page.waitForFunction(() => document.querySelector(".td-question .question"));
    await attendre(200);
    await repondreJuste(page);
  }
  await page.waitForSelector(".td-pret");
  await page.evaluate(() => {
    const p = JEU.bataille.enCours, M = JEU.batailleMoteur;
    p.arsenal.troupes = { fantassins: 1, cavaliers: 1, belier: 1 };
    p.or = 5000;
    for (let i = 0; i < 5; i++) M.envoyer(p, "fantassins");
    for (let i = 0; i < 3; i++) M.envoyer(p, "cavaliers");
    M.envoyer(p, "belier");
    p.vague = p.vagues - 1; p.or = 0;
  });
  // l'Entrée qui suit de trop près la dernière réponse ne lance pas la vague : on réessaie
  for (let k = 0; k < 5 && await page.evaluate(() => JEU.bataille.enCours.phase === "preparation"); k++) { await attendre(400); await page.keyboard.press("Enter"); }
  await page.waitForFunction(() => JEU.bataille.enCours.phase === "vague");
  await page.click('[data-cle="vitesse-3"]');
  await page.waitForFunction(() => JEU.bataille.enCours.phase !== "vague" || JEU.bataille.enCours.unites.filter(u => u.adversaire).length >= 6, null, { timeout: 60000 });
  await page.click('[data-cle="vitesse-1"]').catch(() => {});
  const r = await page.evaluate(async d => {
    window.__boucle.length = 0;
    const ecarts = [], fin = performance.now() + d * 1000;
    let avant = null, engages = 0, figures = 0, corps = 0, releves = 0, meles = 0, n = 0;
    // une image sur six : deux bataillons ennemis l'un dans l'autre le long de la route (figurines debout), hors des
    // deux adversaires d'un même duel (ligne de front des mêlées, 16/10/2026)
    function melange(p) {
      const b = p.unites.filter(u => u.vivant && u.bat).map(u => { let a = Infinity, z = -Infinity;
        u.bat.figs.forEach(g => { if (g.debout && g.vu && g.alpha > 0) { a = Math.min(a, g.s); z = Math.max(z, g.s); } }); return { u, a, z }; }).filter(x => x.a <= x.z);
      return b.some(x => x.u.camp !== "rival" && b.some(y => y.u.camp === "rival" && x.u.adversaire !== y.u && Math.min(x.z, y.z) - Math.max(x.a, y.a) > 1));
    }
    await new Promise(res => {
      function f(t) {
        if (avant !== null) ecarts.push(t - avant);
        avant = t;
        const p = JEU.bataille.enCours, R = JEU.bataille.rendu;
        if (++n % 6 === 0) { releves++; if (melange(p)) meles++; }
        engages = Math.max(engages, p.unites.filter(u => u.adversaire).length); figures = Math.max(figures, R.figures); corps = Math.max(corps, R.corps);
        if (performance.now() < fin) requestAnimationFrame(f); else res();
      }
      requestAnimationFrame(f);
    });
    const tri = ecarts.slice().sort((a, b) => a - b), b = window.__boucle.slice().sort((a, b) => a - b);
    const q = (t, x) => Math.round(t[Math.min(t.length - 1, Math.floor(t.length * x))] * 10) / 10;
    return { images: ecarts.length, mediane: q(tri, 0.5), max: q(tri, 1), plus34: ecarts.filter(x => x > 34).length,
      boucleMediane: q(b, 0.5), boucle95: q(b, 0.95), boucleMax: q(b, 1), engages, figures, corps, melange: Math.round(meles / Math.max(1, releves) * 100) };
  }, MESURE_MELEE);
  await page.close();
  return Object.assign({ taille: w + " × " + h }, r);
}

// Toile de bataille en 1920 × 1080 : le conseil de guerre ne la réalloue pas ; une fenêtre redimensionnée la réalloue
// et elle est redessinée dans la même tâche. Repli : sans terrain 3D (images retirées de sprites.js), la route, les
// ponts et le gué sont dessinés ; avec lui, ils ne le sont pas (déjà dans l'image).
async function essaiToile(navigateur, erreurs) {
  const page = await nouvellePage(navigateur, 1920, 1080, erreurs);
  const res = {};
  await page.evaluate(() => JEU.bataille.lancer("gue"));
  await page.waitForSelector(".td-question .question");
  res.decor3D = await page.evaluate(() => JEU.bataille.decor);
  for (let i = 0; i < 3; i++) {
    await page.waitForFunction(() => document.querySelector(".td-question .question"));
    await attendre(300);
    await repondreJuste(page);
  }
  await page.waitForSelector(".td-pret");
  await attendre(400);
  res.conseil = await page.evaluate(() => window.__toile.realloc.length);
  // fenêtre réduite puis agrandie : la toile est réallouée (au moins en grandissant) et redessinée aussitôt
  await page.setViewportSize({ width: 1366, height: 768 });
  await attendre(600);
  await page.setViewportSize({ width: 1920, height: 1080 });
  await attendre(600);
  res.redimension = await page.evaluate(() => window.__toile.realloc.map(e => e.redessinee));
  await page.keyboard.press("Escape");
  await page.waitForSelector(".confirmation");
  await page.click(".confirmation .bouton.principal");
  await page.waitForFunction(() => !JEU.partie);
  res.repli = await page.evaluate(async () => {
    const sauve = {};
    ["terrain-gue", "terrain-gue-sud"].forEach(k => { sauve[k] = JEU.SPRITES[k]; delete JEU.SPRITES[k]; });
    JEU.bataille.lancer("gue");
    while (!document.querySelector(".td-question .question")) await new Promise(r => setTimeout(r, 50));
    const d = JEU.bataille.decor;
    Object.assign(JEU.SPRITES, sauve);
    return d;
  });
  await page.close();
  return res;
}

(async () => {
  const navigateur = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
  const page = await navigateur.newPage({ viewport: { width: 1280, height: 900 }, acceptDownloads: true });
  const erreurs = [];
  page.on("pageerror", e => erreurs.push(e.message));
  page.on("console", m => { if (m.type() === "error") erreurs.push(m.text()); });
  await page.clock.install({ time: new Date("2026-10-13T18:00:00") });
  const t0 = Date.now();
  await page.goto(URL);
  await page.waitForFunction(() => window.JEU && JEU.pret);
  const bilan = { accueil_ms: Date.now() - t0 };
  bilan.semaine = await page.textContent("#ecran-accueil .cartouche .grand");

  // compteurs : parties commencées, et images de la boucle d'animation des batailles (fonction « boucle »)
  await page.evaluate(() => {
    window.__essai = { parties: 0, boucles: 0 };
    const commencer = JEU.ui.commencerPartie;
    JEU.ui.commencerPartie = function () { window.__essai.parties++; return commencer.apply(this, arguments); };
    const raf = window.requestAnimationFrame;
    window.requestAnimationFrame = function (f) { if (f && f.name === "boucle") window.__essai.boucles++; return raf.call(window, f); };
  });

  // 1. bataille au Gué, lancée deux fois de suite (double appui pendant le chargement du terrain) : une seule bataille
  await page.click("#menu button[data-ecran=jouer]");
  await page.waitForSelector("#ecran-jouer .carte-campagne");
  await page.keyboard.press("1");
  await page.evaluate(() => JEU.bataille.lancer("gue"));
  await page.waitForSelector(".td-canvas");
  await page.clock.runFor(300);
  bilan.lancementsBataille = await page.evaluate(() => window.__essai.parties);
  // 3 questions justes, tours posées, troupes envoyées, une vague jouée
  for (let i = 0; i < 3; i++) { await page.waitForFunction(() => document.querySelector(".td-question .question")); await repondreJuste(page); }
  await page.waitForSelector(".td-pret");
  const slots = await page.evaluate(() => JEU.cartesBataille.carte("gue").emplacements.slice(0, 3));
  const cadre = await page.locator(".td-canvas").boundingBox();
  for (const e of slots) await page.mouse.click(cadre.x + e[0] / 1000 * cadre.width, cadre.y + e[1] / 660 * cadre.height);
  await page.locator(".td-bouton", { hasText: "Fantassins" }).click();
  bilan.bataille = await page.evaluate(() => ({ tours: JEU.bataille.enCours.tours.length, envois: JEU.bataille.enCours.envois.length }));
  // Entrée lance la vague ; s'il reste de l'or, le jeu prévient d'abord, et une seconde Entrée confirme
  for (let k = 0; k < 3 && await page.evaluate(() => JEU.bataille.enCours.phase === "preparation"); k++) {
    await page.clock.runFor(800);
    await page.keyboard.press("Enter");
  }
  await page.waitForFunction(() => JEU.bataille.enCours.phase !== "preparation");
  // la vague se joue en temps réel : on avance l'horloge du navigateur. La mêlée se dessine tour à tour avec le sang
  // (réglage par défaut), sans sang, puis avec le sang et les animations coupées (pas de giclée), puis comme au début.
  const reglagesMelee = [[6, { sang: false }], [12, { sang: true, animations: false }], [18, { sang: true, animations: true }]];
  bilan.bataillons = { troupes: 0, figures: 0, corps: 0, bannieres: 0 };
  for (let k = 0; k < 200 && await page.evaluate(() => JEU.bataille.enCours.phase === "vague"); k++) {
    const r = reglagesMelee.find(x => x[0] === k);
    if (r) await page.evaluate(o => Object.assign(JEU.sauvegarde.etat().reglages, o), r[1]);
    await page.clock.runFor(500);
    // bataillons : figurines debout par troupe dessinée, figurines couchées, bannières (dernière image dessinée)
    const R = await page.evaluate(() => Object.assign({}, JEU.bataille.rendu));
    if (R.bataillons > bilan.bataillons.troupes) Object.assign(bilan.bataillons, { troupes: R.bataillons, figures: R.figures, bannieres: R.bannieres });
    bilan.bataillons.corps = Math.max(bilan.bataillons.corps, R.corps);
  }
  await page.evaluate(() => Object.assign(JEU.sauvegarde.etat().reglages, { sang: true, animations: true }));
  bilan.apresVague = await page.evaluate(() => ({ phase: JEU.bataille.enCours.phase, vague: JEU.bataille.enCours.vague, chateau: JEU.bataille.enCours.chateau.pv,
    duels: JEU.bataille.enCours.stats.duels, tombes: JEU.bataille.enCours.stats.tues + JEU.bataille.enCours.stats.pertes }));
  // quitter avec Échap : confirmation dans la page, les coups portés restent ; la boucle d'animation s'arrête
  await page.keyboard.press("Escape");
  await page.waitForSelector(".confirmation");
  await page.click(".confirmation .bouton.principal");
  await page.waitForFunction(() => !JEU.partie && JEU.ui.ecranCourant() === "jouer");
  await page.clock.runFor(100);
  await page.evaluate(() => { window.__essai.boucles = 0; });
  await page.clock.runFor(1000);
  bilan.bouclesApresQuitter = await page.evaluate(() => window.__essai.boucles);
  bilan.quitter = "ok";

  // 1 bis. une question ratée revient un peu plus tard : ratée à la 1re question d'une bataille (Forêt de l'Ouest),
  // elle doit revenir à la 4e question qui suit (après 3 autres : 2 dans cette vague, 1 dans la suivante), avec
  // l'étiquette « Seconde chance » ; réussie, elle sort de la file des rappels.
  await page.evaluate(() => JEU.bataille.lancer("foret"));
  await page.waitForSelector(".td-canvas");
  await page.clock.runFor(300);
  await page.waitForFunction(() => document.querySelector(".td-question .question"));
  const rappel = { ratee: await page.evaluate(() => JEU.ui.questionCourante.id), suivantes: [] };
  const orAvantErreur = await page.evaluate(() => JEU.bataille.enCours.or);
  await repondreFaux(page);
  await page.waitForSelector(".panneau-erreur");
  // l'erreur coûte 6 or (config.js), montrés par un sceau « −6 or » et l'or du bandeau, une image plus tard
  await page.clock.runFor(60);
  rappel.or = await page.evaluate(a => ({ avant: a, apres: JEU.bataille.enCours.or, sceau: (document.querySelector(".tampon.perte span") || {}).textContent || null,
    bandeau: Number(document.querySelector(".td-or b").textContent) }), orAvantErreur);
  rappel.enAttente = await page.evaluate(id => JEU.rappels.enAttente().indexOf(id) >= 0, rappel.ratee);
  await page.keyboard.press("Enter"); // Continuer
  // mise : mise en page du bandeau du conseiller (celui d'une seconde chance doit être celui des autres questions)
  const noterQuestion = () => page.evaluate(() => {
    const q = JEU.ui.questionCourante, r = document.querySelector(".td-question .recit"), e = r && r.querySelector(".etiquette-rappel"), cs = r && getComputedStyle(r);
    return { id: q.id, rappel: !!q.rappel, etiquette: e ? e.textContent : null, mise: cs ? [cs.justifyContent, cs.borderLeftWidth, cs.paddingLeft].join(" ") : null };
  });
  for (let i = 0; i < 2; i++) {
    await page.waitForFunction(() => document.querySelector(".td-question .question") && !document.querySelector(".panneau-erreur"));
    rappel.suivantes.push(await noterQuestion());
    await repondreJuste(page);
  }
  await page.waitForSelector(".td-pret");
  const cadreF = await page.locator(".td-canvas").boundingBox();
  for (const e of await page.evaluate(() => JEU.cartesBataille.carte("foret").emplacements.slice(0, 2))) await page.mouse.click(cadreF.x + e[0] / 1000 * cadreF.width, cadreF.y + e[1] / 660 * cadreF.height);
  for (let k = 0; k < 3 && await page.evaluate(() => JEU.bataille.enCours.phase === "preparation"); k++) { await page.clock.runFor(800); await page.keyboard.press("Enter"); }
  await page.waitForFunction(() => JEU.bataille.enCours.phase !== "preparation");
  for (let k = 0; k < 200 && await page.evaluate(() => JEU.bataille.enCours.phase === "vague"); k++) await page.clock.runFor(500);
  rappel.phase = await page.evaluate(() => JEU.bataille.enCours.phase);
  if (rappel.phase === "preparation") {
    for (let i = 0; i < 2; i++) {
      await page.waitForFunction(() => document.querySelector(".td-question .question"));
      rappel.suivantes.push(await noterQuestion());
      await repondreJuste(page);
    }
    rappel.sortie = await page.evaluate(id => JEU.rappels.enAttente().indexOf(id) < 0, rappel.ratee);
  }
  rappel.position = rappel.suivantes.findIndex(x => x.id === rappel.ratee) + 1; // 4 attendu
  bilan.rappel = rappel;
  await page.keyboard.press("Escape");
  await page.waitForSelector(".confirmation");
  await page.click(".confirmation .bouton.principal");
  await page.waitForFunction(() => !JEU.partie && JEU.ui.ecranCourant() === "jouer");

  // 2. événement du jour (les marchands) : 3 questions justes, 2 ressources chacune
  const avantEv = await page.evaluate(() => Object.values(JEU.sauvegarde.etat().ressources).reduce((a, b) => a + b, 0));
  await page.evaluate(() => {
    JEU.campagne.etat().evenement = { id: "marchands", jour: JEU.util.jour(), fait: false };
    JEU.campagne.jouerEvenement();
  });
  for (let i = 0; i < 6; i++) {
    await page.waitForSelector(".scene-evenement .question, .scene-evenement .bilan");
    if (await page.$(".scene-evenement .bilan")) break;
    await repondreJuste(page);
  }
  await page.waitForSelector(".scene-evenement .bilan");
  bilan.evenement = await page.textContent(".scene-evenement .bilan .grand");
  bilan.gainEvenement = await page.evaluate(a => Object.values(JEU.sauvegarde.etat().ressources).reduce((x, y) => x + y, 0) - a, avantEv);
  await page.keyboard.press("Enter");
  await page.waitForFunction(() => !JEU.partie && JEU.ui.ecranCourant() === "jouer");

  // 3. conseil du royaume, repris jusqu'à avoir assez de mesures : affirmations jugées justes, décisions à droite
  await page.evaluate(() => JEU.conseil.lancer());
  bilan.conseils = 0;
  for (let n = 0; n < 10; n++) {
    for (let i = 0; i < 12; i++) {
      await page.waitForSelector(".carte-conseil, .scene-conseil .bilan");
      if (await page.$(".scene-conseil .bilan")) break;
      await jouerCarteConseil(page);
    }
    await page.waitForSelector(".scene-conseil .bilan");
    bilan.conseils++;
    if (await page.evaluate(m => JEU.mesure.valeurs.length >= m, MESURES_VOULUES)) break;
    await page.keyboard.press("Enter"); // « Nouveau conseil »
    await page.waitForSelector(".scene-conseil .bilan", { state: "detached" });
  }
  bilan.conseil = await page.textContent(".scene-conseil .bilan .grand");
  bilan.royaume = await page.evaluate(() => JEU.campagne.etat().royaume);

  // 4. signalement sur la dernière question, puis export et réimport
  await page.click("#signaler-derniere");
  await page.fill(".signalement textarea", "Essai automatique");
  await page.click("text=Envoyer le signalement");
  await page.click(".bilan >> text=Retour à la campagne");
  const avant = await page.evaluate(() => JEU.sauvegarde.texteExport());
  bilan.signalements = JSON.parse(avant).signalements.length;
  await page.evaluate(t => { localStorage.clear(); JEU.sauvegarde.importer(t); }, avant);
  const apres = await page.evaluate(() => JSON.stringify(JEU.sauvegarde.etat(), null, 1));
  bilan.importIdentique = JSON.stringify(JSON.parse(avant)) === JSON.stringify(JSON.parse(apres));

  // 4 ter. Réglages : la case « Sang dans les combats », cochée par défaut, enregistrée dans la sauvegarde
  await page.click("#menu button[data-ecran=reglages]");
  await page.waitForSelector("input[data-reglage=sang]");
  const caseSang = () => page.evaluate(() => {
    const c = document.querySelector("input[data-reglage=sang]");
    const s = JSON.parse(localStorage.getItem(JEU.sauvegarde.CLE)).reglages.sang;
    return { cochee: c.checked, texte: c.parentNode.textContent.trim(), sauvegarde: s, sang: JEU.anim.sang() };
  });
  bilan.reglageSang = { avant: await caseSang() };
  await page.click("input[data-reglage=sang]");
  bilan.reglageSang.coupe = await caseSang();
  await page.click("input[data-reglage=sang]");
  bilan.reglageSang.remis = await caseSang();

  // 4 bis. écran Cours, onglet Grammaire : les cours de langue rangés sous leur badge Griffon (seulement les badges qui
  //    ont un cours), dans l'ordre du badge. Deux cours d'essai sont ajoutés en mémoire, puis retirés.
  bilan.grammaire = await page.evaluate(() => {
    const ajout = { "langue-nat98": { badge: "fer", ordre: 1, titre: "Essai fer" }, "langue-conj99": { badge: "cuivre", ordre: 99, titre: "Essai cuivre" } };
    const avant = Object.keys(JEU.donnees.cours);
    Object.keys(ajout).forEach(id => { if (!JEU.donnees.cours[id]) JEU.donnees.cours[id] = Object.assign({ id, matiere: "langue", fiches: [], questions: [] }, ajout[id]); });
    JEU.progression.oublier();
    JEU.ui.afficher("cours");
    const onglet = [...document.querySelectorAll("#ecran-cours .onglet")].find(b => b.textContent === "Grammaire");
    if (onglet) onglet.click();
    const blocs = [...document.querySelectorAll("#ecran-cours .badge-bloc")].map(b => ({ badge: b.querySelector("h3").textContent, cours: [...b.querySelectorAll(".ligne-cours > span:first-child")].map(x => x.textContent) }));
    Object.keys(ajout).forEach(id => { if (avant.indexOf(id) < 0) delete JEU.donnees.cours[id]; });
    JEU.questions.vider(); JEU.progression.oublier();
    JEU.ui.afficher("jouer");
    return { onglet: !!onglet, blocs };
  });

  // 5. carte de campagne : aucune étiquette (nom ou ligne sous le nom) ne touche celle d'un autre lieu, de la première
  //    province à la dernière (en particulier toutes prises sauf la dernière de chaque front : les deux places fortes
  //    visées portent « place forte n / n »). Boîtes getBBox() en unités de la carte ; 2 px de marge pour l'interligne.
  bilan.etiquettes = await page.evaluate(() => {
    const C = JEU.campagne, c = C.etat(), avant = c.conquises.slice();
    const ordre = C.FRONTS.map(f => f.provinces.map(p => p.id));
    const etats = [];
    for (let n = 0; n <= ordre[0].length; n++) etats.push([].concat(...ordre.map(l => l.slice(0, n))));
    const chocs = [];
    etats.forEach(conq => {
      c.conquises = conq.slice();
      JEU.ui.afficher("jouer");
      const t = [...document.querySelectorAll(".carte-svg text.nom-lieu, .carte-svg text.sous-lieu")].map(e => {
        const b = e.getBBox(); return { t: e.textContent, n: e.closest(".noeud").dataset.lieu, x0: b.x, y0: b.y + 2, x1: b.x + b.width, y1: b.y + b.height - 2 };
      });
      for (let i = 0; i < t.length; i++) for (let j = i + 1; j < t.length; j++) {
        const a = t[i], b = t[j];
        if (a.n !== b.n && Math.min(a.x1, b.x1) > Math.max(a.x0, b.x0) && Math.min(a.y1, b.y1) > Math.max(a.y0, b.y0)) chocs.push(conq.length + " prises : « " + a.t + " » touche « " + b.t + " »");
        // deux étiquettes de lieux différents l'une au-dessus de l'autre : 8 px d'écart au moins (boîtes entières)
        if (a.n !== b.n && Math.min(a.x1, b.x1) > Math.max(a.x0, b.x0) && Math.max(a.y0, b.y0) - 2 - Math.min(a.y1, b.y1) - 2 < 8) chocs.push(conq.length + " prises : « " + a.t + " » à moins de 8 px de « " + b.t + " »");
        // côte à côte sur la même ligne : 16 px d'écart au moins (sinon les deux noms se lisent comme un seul)
        if (a.n !== b.n && Math.min(a.y1, b.y1) > Math.max(a.y0, b.y0) && Math.max(a.x0, b.x0) - Math.min(a.x1, b.x1) < 16) chocs.push(conq.length + " prises : « " + a.t + " » dans le prolongement de « " + b.t + " »");
      }
      // chaque nom est plus près de son lieu (milieu du bourg, 24 px au-dessus du pied) que de tout autre
      const lieux = [...document.querySelectorAll(".carte-svg .noeud")].map(g => ({ n: g.dataset.lieu, x: +g.dataset.x, y: +g.dataset.y - 24 }));
      [...document.querySelectorAll(".carte-svg text.nom-lieu")].forEach(e => {
        const bb = e.getBBox(), cx = bb.x + bb.width / 2, cy = bb.y + bb.height / 2, n = e.closest(".noeud").dataset.lieu;
        const d = l => Math.hypot(cx - l.x, cy - l.y), propre = d(lieux.find(l => l.n === n));
        lieux.forEach(l => { if (l.n !== n && d(l) <= propre) chocs.push(conq.length + " prises : « " + e.textContent + " » est plus près de « " + l.n + " » que de son lieu"); });
      });
    });
    c.conquises = avant;
    JEU.ui.afficher("jouer");
    return { etats: etats.length, chocs };
  });
  // même contrôle en repli (images des bourgs absentes : médaillons), plus : la bannière d'un médaillon ne touche pas le
  // titre d'un front
  bilan.etiquettesRepli = await page.evaluate(() => {
    const C = JEU.campagne, c = C.etat(), avant = c.conquises.slice(), sauve = {};
    Object.keys(JEU.SPRITES || {}).filter(k => k.startsWith("lieu-")).forEach(k => { sauve[k] = JEU.SPRITES[k]; delete JEU.SPRITES[k]; });
    const ordre = C.FRONTS.map(f => f.provinces.map(p => p.id));
    const chocs = [];
    const boite = (e, m) => { const b = e.getBBox(); return { x0: b.x, y0: b.y + m, x1: b.x + b.width, y1: b.y + b.height - m }; };
    const touche = (a, b) => Math.min(a.x1, b.x1) > Math.max(a.x0, b.x0) && Math.min(a.y1, b.y1) > Math.max(a.y0, b.y0);
    for (let n = 0; n <= ordre[0].length; n++) {
      c.conquises = [].concat(...ordre.map(l => l.slice(0, n)));
      JEU.ui.afficher("jouer");
      const t = [...document.querySelectorAll(".carte-svg text.nom-lieu, .carte-svg text.sous-lieu")].map(e => Object.assign(boite(e, 2), { t: e.textContent, n: e.closest(".noeud").dataset.lieu }));
      const medaillons = [...document.querySelectorAll(".carte-svg .repli-lieu")].map(e => Object.assign(boite(e, 0), { n: e.closest(".noeud").dataset.lieu }));
      const titres = [...document.querySelectorAll(".carte-svg .titre-front")].map(e => Object.assign(boite(e, 0), { t: e.textContent }));
      for (let i = 0; i < t.length; i++) {
        for (let j = i + 1; j < t.length; j++) if (t[i].n !== t[j].n && touche(t[i], t[j])) chocs.push(n + " prises (repli) : « " + t[i].t + " » touche « " + t[j].t + " »");
        medaillons.forEach(m => { if (m.n !== t[i].n && touche(m, t[i])) chocs.push(n + " prises (repli) : le médaillon de « " + m.n + " » touche « " + t[i].t + " »"); });
        medaillons.forEach(m => { if (m.n === t[i].n && touche(m, t[i])) chocs.push(n + " prises (repli) : « " + t[i].t + " » est écrit sur son médaillon"); });
      }
      medaillons.forEach(m => titres.forEach(ti => { if (touche(m, ti)) chocs.push(n + " prises (repli) : le médaillon de « " + m.n + " » touche le titre « " + ti.t + " »"); }));
    }
    Object.assign(JEU.SPRITES, sauve);
    c.conquises = avant;
    JEU.ui.afficher("jouer");
    return { chocs };
  });

  // 6. mesure : temps entre une réponse et la question suivante
  const v = await page.evaluate(() => JEU.mesure.valeurs.slice());
  if (process.env.DETAIL) console.log(v.map(x => Math.round(x)).join(" "));
  bilan.mesures = v.length;
  bilan.moyenne_ms = v.length ? Math.round(v.reduce((a, b) => a + b, 0) / v.length * 10) / 10 : null;
  bilan.max_ms = v.length ? Math.round(Math.max(...v) * 10) / 10 : null;
  bilan.ressources = await page.evaluate(() => JEU.sauvegarde.etat().ressources);
  await page.close();

  // 7. fenêtre de portable (1366 × 768), sans horloge truquée : carte de campagne entière à l'écran, puis énoncé de
  //    chaque question de bataille visible (association longue répondue fausse, panneau d'erreur, questions suivantes)
  bilan.portable = await essaiPortable(navigateur, erreurs);
  // 8. temps réel (Event Timing) : de la touche qui répond à l'image peinte de la question suivante
  bilan.tempsReel = [];
  for (const [w, h] of [[1366, 768], [1920, 1080]]) bilan.tempsReel.push(await tempsReel(navigateur, w, h, erreurs));
  // 9. toile de bataille : pas de réallocation pendant le conseil, redessin immédiat, repli du terrain
  bilan.toile = await essaiToile(navigateur, erreurs);
  // 10. grosse mêlée de bataillons en temps réel : images par seconde et durée de la boucle de bataille
  bilan.grosseMelee = [];
  for (const [w, h] of [[1366, 768], [1920, 1080]]) bilan.grosseMelee.push(await grosseMelee(navigateur, w, h, erreurs));
  bilan.erreursJS = erreurs;
  console.log(JSON.stringify(bilan, null, 1));
  await navigateur.close();

  const echecs = [];
  if (erreurs.length) echecs.push("erreurs JavaScript dans la page");
  if (bilan.lancementsBataille !== 1) echecs.push("la bataille a commencé " + bilan.lancementsBataille + " fois au lieu d'une");
  const R = bilan.rappel;
  if (!R.enAttente) echecs.push("question ratée en bataille : elle n'entre pas dans la file des rappels");
  if (R.phase !== "preparation") echecs.push("question ratée en bataille : pas de seconde vague pour la voir revenir (phase " + R.phase + ")");
  else {
    if (R.position !== 4) echecs.push("question ratée en bataille : revenue à la question " + R.position + " après l'erreur au lieu de la 4e (" + JSON.stringify(R.suivantes) + ")");
    else if (!R.suivantes[3].rappel || R.suivantes[3].etiquette !== "Seconde chance") echecs.push("question ratée revenue sans l'étiquette « Seconde chance »");
    else if (R.suivantes[3].mise !== R.suivantes[0].mise) echecs.push("bandeau « Seconde chance » mis en page autrement que les autres (" + R.suivantes[3].mise + " au lieu de " + R.suivantes[0].mise + ")");
    if (!R.sortie) echecs.push("question ratée, réussie au rappel : elle reste dans la file");
  }
  const G = bilan.grammaire, cuivre = (G.blocs.find(b => b.badge === "Griffon de cuivre") || { cours: [] }).cours;
  if (!G.onglet) echecs.push("écran Cours : pas d'onglet Grammaire");
  else if (G.blocs.map(b => b.badge).join("|").indexOf("Griffon de fer|Griffon de cuivre") !== 0 || G.blocs.some(b => !b.cours.length) || cuivre[cuivre.length - 1] !== "Essai cuivre") echecs.push("onglet Grammaire : cours mal rangés par badge (" + JSON.stringify(G.blocs) + ")");
  if (bilan.bouclesApresQuitter > 0) echecs.push("la boucle de la bataille tourne encore après avoir quitté");
  if (!(bilan.apresVague.duels > 0)) echecs.push("vague au Gué : aucun combat au corps à corps (" + JSON.stringify(bilan.apresVague) + ")");
  const BA = bilan.bataillons;
  if (!(BA.troupes > 0 && BA.figures >= 4 * BA.troupes && BA.bannieres > 0)) echecs.push("vague au Gué : les troupes ne sont pas dessinées en bataillons (" + JSON.stringify(BA) + ")");
  if (!(BA.corps > 0)) echecs.push("vague au Gué : aucune figurine tombée couchée au sol (" + JSON.stringify(BA) + ")");
  bilan.grosseMelee.forEach(m => {
    if (!(m.engages >= 6 && m.figures >= 60)) echecs.push("grosse mêlée " + m.taille + " : pas assez de troupes engagées pour la mesure (" + JSON.stringify(m) + ")");
    if (!(m.mediane <= 17.5)) echecs.push("grosse mêlée " + m.taille + " : " + m.mediane + " ms entre deux images en médiane (60 images par seconde attendues)");
    if (m.plus34 > Math.max(2, 0.02 * m.images)) echecs.push("grosse mêlée " + m.taille + " : " + m.plus34 + " images sur " + m.images + " à plus de 34 ms");
    if (!(m.boucle95 < 8)) echecs.push("grosse mêlée " + m.taille + " : boucle de bataille à " + m.boucle95 + " ms pour 95 % des images (moins de 8 ms attendu)");
    if (!(m.melange <= 35)) echecs.push("grosse mêlée " + m.taille + " : bataillons ennemis l'un dans l'autre sur " + m.melange + " % des images (35 % au plus ; ligne de front des mêlées)");
  });
  const OR = R.or;
  if (!OR || OR.apres !== Math.max(0, OR.avant - 6) || (OR.avant > 0 && OR.sceau !== "−" + Math.min(6, OR.avant) + " or") || OR.bandeau !== Math.floor(OR.apres)) echecs.push("question ratée en bataille : l'or perdu ne se voit pas comme prévu (" + JSON.stringify(OR) + ")");
  const RS = bilan.reglageSang;
  if (!RS.avant.cochee || !/Sang dans les combats/.test(RS.avant.texte) || !RS.avant.sang) echecs.push("Réglages : case « Sang dans les combats » absente ou décochée par défaut (" + JSON.stringify(RS.avant) + ")");
  if (RS.coupe.cochee || RS.coupe.sauvegarde !== false || RS.coupe.sang) echecs.push("Réglages : le sang coupé n'est pas enregistré (" + JSON.stringify(RS.coupe) + ")");
  if (!RS.remis.cochee || RS.remis.sauvegarde !== true || !RS.remis.sang) echecs.push("Réglages : le sang remis n'est pas enregistré (" + JSON.stringify(RS.remis) + ")");
  if (bilan.gainEvenement < 6) echecs.push("l'événement n'a pas rapporté ses ressources");
  if (!bilan.royaume || bilan.royaume.tresor + bilan.royaume.peuple + bilan.royaume.garde + bilan.royaume.savoir <= 0) echecs.push("les jauges du royaume n'ont pas monté");
  if (bilan.mesures < MESURES_VOULUES) echecs.push("seulement " + bilan.mesures + " mesures (il en faut " + MESURES_VOULUES + ")");
  if (!(bilan.max_ms < 100)) echecs.push("plus de 100 ms entre une réponse et la question suivante");
  if (!bilan.importIdentique) echecs.push("l'import ne redonne pas la même partie");
  if (bilan.etiquettes.chocs.length) echecs.push("carte de campagne : des noms se touchent (" + bilan.etiquettes.chocs.join(" ; ") + ")");
  if (bilan.etiquettesRepli.chocs.length) echecs.push("carte de campagne en repli : " + bilan.etiquettesRepli.chocs.join(" ; "));
  bilan.portable.carte.forEach(m => { if (m.bas > m.vue + 0.5) echecs.push("carte de campagne coupée à 1366 × 768 (" + m.cas + " : bas à " + m.bas + " px pour " + m.vue + ")"); });
  bilan.portable.questions.forEach(m => {
    if (m.visible) return;
    if (m.bas !== undefined) echecs.push("bataille à 1366 × 768 : " + m.quoi + " sous le bord de la colonne (bas à " + m.bas + " px, colonne jusqu'à " + m.basColonne + " ; " + m.cartes + " cartes)");
    else echecs.push("bataille à 1366 × 768 : " + m.quoi + " coupé par le haut (" + m.haut + " px, haut visible de la colonne à " + m.hautVisible + ")");
  });
  if (bilan.portable.questions.length < 4) echecs.push("bataille à 1366 × 768 : seulement " + bilan.portable.questions.length + " contrôles d'énoncé");
  // les choix des QCM sont mélangés à l'affichage : la bonne réponse ne doit pas être presque toujours la première
  bilan.rangsQcm = { mesures: rangsQcm.length, premiere: rangsQcm.filter(r => r === 1).length };
  console.log("QCM : bonne réponse affichée en premier " + bilan.rangsQcm.premiere + " fois sur " + rangsQcm.length);
  if (rangsQcm.length >= 12 && bilan.rangsQcm.premiere / rangsQcm.length > 0.6) echecs.push("QCM : la bonne réponse est affichée en premier " + bilan.rangsQcm.premiere + " fois sur " + rangsQcm.length + " (choix non mélangés ?)");
  bilan.tempsReel.forEach(m => {
    if (m.mesures < 6) echecs.push("temps réel " + m.taille + " : seulement " + m.mesures + " mesures");
    if (m.max > 100) echecs.push("temps réel " + m.taille + " : " + m.max + " ms entre une réponse et la question suivante peinte (plus de 100 ms)");
    if (m.reallocations) echecs.push("temps réel " + m.taille + " : toile de bataille réallouée " + m.reallocations + " fois sans changement de taille de la fenêtre");
    if (!m.toilesRendues) echecs.push("temps réel " + m.taille + " : la toile de bataille n'est pas rendue quand on quitte");
  });
  const P = bilan.portable, I = P.interface;
  P.carte.forEach(m => { if (!(m.sousEcran >= 14)) echecs.push("carte de campagne (" + m.cas + ") : ligne sous un nom à " + m.sousEcran + " px à l'écran (14 au moins)"); });
  if (!I.tribut.visible || I.tribut.surCarte) echecs.push("carte de campagne : le tribut du jour " + (I.tribut.visible ? "cache la carte" : "ne s'affiche pas"));
  if (!I.barre.quitter || !I.barre.titre) echecs.push("bataille à 1366 × 768 : titre ou « Quitter » caché (" + JSON.stringify(I.barre) + ")");
  if (!(I.or.or > 0.99 && I.or.vague < 0.5)) echecs.push("bandeau du champ : l'or s'estompe sous un cercle de portée (" + JSON.stringify(I.or) + ")");
  if (I.erreurAssociation && (I.erreurAssociation.fois !== 1 || !I.erreurAssociation.paires)) echecs.push("panneau d'erreur d'une association : bonne réponse écrite " + I.erreurAssociation.fois + " fois");
  if (I.sceaux > 1) echecs.push("deux sceaux affichés l'un sur l'autre");
  const verrous = { "Baliste": "verrouillée", "Trébuchet": "verrouillé", "Cavaliers ×2": "verrouillés", "Tour de siège": "verrouillée" };
  Object.keys(verrous).forEach(k => { if (I.verrous[k] !== verrous[k]) echecs.push("« " + k + " » : « " + I.verrous[k] + " » au lieu de « " + verrous[k] + " »"); });
  if (!I.toileRendue) echecs.push("la toile de la dernière bataille n'est pas rendue après l'avoir quittée");
  const T = bilan.toile;
  if (T.conseil) echecs.push("toile de bataille réallouée " + T.conseil + " fois pendant le conseil de guerre (1920 × 1080)");
  if (!T.redimension.length || T.redimension.some(x => !x)) echecs.push("toile réallouée sans être redessinée dans la même tâche (" + JSON.stringify(T.redimension) + ")");
  if (!T.decor3D || T.decor3D.route) echecs.push("terrain 3D : la route est dessinée par-dessus l'image (" + JSON.stringify(T.decor3D) + ")");
  if (!T.repli || !T.repli.route || T.repli.terrain !== "terrain-peint") echecs.push("repli sans terrain 3D : route, ponts et gué non dessinés (" + JSON.stringify(T.repli) + ")");
  echecs.forEach(m => console.log("ÉCHEC  " + m));
  process.exit(echecs.length ? 1 : 0);
})().catch(e => { console.log("ÉCHEC  " + e.message); process.exit(1); });
