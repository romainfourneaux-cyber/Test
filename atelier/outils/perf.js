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
// Expéditions (24/10/2026, conception 17.6) : départ depuis la carte de jeu, carte-itinéraire entière en 1366 × 768 (textes
// de 14 px au moins, rien qui se touche), clavier, escarmouche en temps réel (Event Timing, ruban de semaine en relief sur
// deux questions sur trois, carte de l'éclaireur avant la première question seulement), porte de faveur, retour puis
// « Reprendre », export puis import, réglages coupés, défaite forcée avec bilan et campagne intacte ; en 1366 × 768 et 1920 × 1080.
// Usage : node atelier/outils/perf.js   (demande le module playwright ; sinon, faire les vérifications à la main)
// Tablette tactile (31/10/2026) : la même partie rejouée au doigt seul, en 1280 × 800 et 1024 × 768 (Android émulé) et le mot
// « Tourne ta tablette » en portrait ; voir le bloc « tablette tactile » plus bas et atelier/relecture/tablette-tactile.md.
// Variables facultatives : CHROMIUM (chemin du navigateur), DETAIL=1 (affiche toutes les mesures), PARTIE=expedition (ne joue
// que l'essai des expéditions, pour le mettre au point), PARTIE=tablette (la passe tactile seule).
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

// Expédition (24/10/2026, conception atelier/conception/expeditions.md, 17.6) : départ depuis la carte de jeu de la campagne,
// carte-itinéraire entière à l'écran avec ses cartouches (textes de 14 px au moins, aucun nom ni médaillon qui se touche),
// clavier (flèches, chiffre), escarmouche jouée en temps réel (Event Timing de la touche à la question suivante peinte,
// JEU.mesure ; ruban de semaine sur chaque question, en relief sur deux sur trois ; la carte de l'éclaireur avant la
// première question seulement), porte de faveur (question puis choix au clavier), retour à la campagne puis « Reprendre »
// au même point, export puis import, « Sang » et « Animations » coupés, « Messages des rivaux » coupé (pas de défi), défaite
// forcée (un vivre, bataille quittée après la première vague) : bilan avec renommée, campagne intacte.
// Les textes de route et les gains viennent du jeu : l'essai ne fait que jouer.
async function essaiExpedition(navigateur, w, h, erreurs) {
  const page = await nouvellePage(navigateur, w, h, erreurs);
  const res = { taille: w + " × " + h, echecs: [] };
  const E = m => res.echecs.push(m);
  await page.evaluate(() => {
    window.__ev = [];
    new PerformanceObserver(l => l.getEntries().forEach(e => { if (e.name === "keydown") window.__ev.push(e.duration); }))
      .observe({ type: "event", durationThreshold: 16, buffered: true });
  });
  // ce que l'expédition ne doit jamais toucher dans la campagne (la chronique, elle, note le départ et le retour)
  const copieCampagne = () => page.evaluate(() => {
    const c = JEU.campagne.etat(), s = JEU.sauvegarde.etat();
    return { provinces: c.provinces, conquises: c.conquises, rival: { attaque: c.rival.attaque, menace: c.rival.menace, defaites: c.rival.defaites, rivalite: c.rival.rivalite },
      arsenal: c.arsenal, royaume: c.royaume, evenement: c.evenement, bonus: c.bonus, ressources: s.ressources };
  });
  await page.click("#menu button[data-ecran=jouer]");
  await page.waitForSelector("#ecran-jouer .grille-jeux");
  await page.evaluate(() => { JEU.ui.fermerModale(); const c = JEU.campagne.etat(); c.bonus.or = 40; c.bonus.espion = true; JEU.sauvegarde.enregistrer(); }); // le piège des bonus de campagne
  const avant = await copieCampagne();
  // 1. la carte de jeu « Partir en expédition »
  res.carteCampagne = await page.evaluate(() => { const b = [...document.querySelectorAll(".carte-jeu h2")].find(x => /expédition/i.test(x.textContent)); return b ? b.textContent : null; });
  if (!/Partir en expédition/.test(res.carteCampagne || "")) E("carte de jeu « Partir en expédition » absente de la campagne (" + res.carteCampagne + ")");
  await page.evaluate(() => { [...document.querySelectorAll(".carte-jeu")].find(x => /expédition/i.test(x.textContent)).click(); });
  await page.waitForSelector("#ecran-expedition .parchemin-annee");
  res.depart = await page.evaluate(() => ({ relais: document.querySelector(".relais-numero").textContent, cases: document.querySelectorAll(".annee-svg .case").length,
    frontiere: /Frontière/.test(document.querySelector(".annee-svg").textContent), banniere: document.querySelectorAll(".annee-svg .banniere-cette").length,
    duree: (document.querySelector(".depart-compagnie").textContent.match(/Environ \d+ minutes/) || [null])[0], armorial: !!document.querySelector(".depart-armorial svg") }));
  if (res.depart.cases !== 34 || !res.depart.frontiere || !res.depart.duree || !res.depart.armorial) E("écran de départ incomplet (" + JSON.stringify(res.depart) + ")");
  // 2. « Partir » (Entrée) jusqu'à une route dont la première couche a une escarmouche à porte de faveur (12 tentatives, en
  //    levant le camp entre deux : une expédition sur deux convient)
  let convient = false;
  for (let n = 0; n < 12 && !convient; n++) {
    await page.keyboard.press("Enter");
    await page.waitForSelector("#ecran-expedition .page-semaine");
    convient = await page.evaluate(() => JEU.expedition.enCours().route.actes[0].couches[0].some(x => x.type === "escarmouche" && x.porte && x.porte.genre === "faveur"));
    if (!convient) { await page.evaluate(() => { JEU.expedition.finir("abandon"); JEU.ui.afficher("expedition"); }); await page.waitForSelector("#ecran-expedition .parchemin-annee"); }
    res.tentativesRoute = n + 1;
  }
  if (!convient) E("aucune route avec une escarmouche à porte de faveur en première couche en 12 tirages");
  res.pageSemaine = await page.evaluate(() => ({ titre: document.querySelector(".page-semaine h2").textContent, cours: document.querySelectorAll(".page-semaine .liste-cours-semaine li").length }));
  if (!/^Semaine \d+$/.test(res.pageSemaine.titre) || !res.pageSemaine.cours) E("page de semaine sans titre ou sans cours (" + JSON.stringify(res.pageSemaine) + ")");
  await page.keyboard.press("Enter");
  await page.waitForSelector("#ecran-expedition .route-svg");
  await attendre(300);
  // 3. la carte-itinéraire : entière à l'écran avec ses cartouches, textes de 14 px au moins, aucun nom ni médaillon qui se touche
  const controlerRoute = () => page.evaluate(() => {
    const svg = document.querySelector(".route-svg"); if (!svg) return null;
    const k = svg.getBoundingClientRect().width / 1000, EX = JEU.ecranExpedition, e = JEU.expedition.enCours();
    const d = EX.disposition(e), etats = EX.etatsNoeuds(e, d), visibles = d.noeuds.filter(n => etats[n.id] !== "brume");
    const noms = [...svg.querySelectorAll(".halte-nom:not(.brume)")].map(t => { const b = t.getBBox(); return { x0: b.x, y0: b.y + 2, x1: b.x + b.width, y1: b.y + b.height - 2, t: t.textContent }; });
    const chocs = [];
    const touche = (a, b) => Math.min(a.x1, b.x1) > Math.max(a.x0, b.x0) && Math.min(a.y1, b.y1) > Math.max(a.y0, b.y0);
    for (let i = 0; i < noms.length; i++) for (let j = i + 1; j < noms.length; j++) if (touche(noms[i], noms[j])) chocs.push("« " + noms[i].t + " » touche « " + noms[j].t + " »");
    // un nom ne touche le médaillon d'aucune halte (le sien est au-dessus ou au-dessous, les autres plus loin)
    noms.forEach(n => visibles.forEach(m => { const cx = Math.max(n.x0, Math.min(m.x, n.x1)), cy = Math.max(n.y0, Math.min(m.y, n.y1)); if (Math.hypot(cx - m.x, cy - m.y) < m.r) chocs.push("« " + n.t + " » touche le médaillon " + m.id); }));
    for (let i = 0; i < visibles.length; i++) for (let j = i + 1; j < visibles.length; j++) { const a = visibles[i], b = visibles[j]; if (Math.hypot(a.x - b.x, a.y - b.y) < a.r + b.r) chocs.push("médaillons " + a.id + " et " + b.id + " se touchent"); }
    const tailles = [...svg.querySelectorAll("text")].map(t => parseFloat(getComputedStyle(t).fontSize) * k);
    const r = svg.getBoundingClientRect(), bas = [...document.querySelectorAll("#ecran-expedition .exp-bas .cartouche")].map(c => c.getBoundingClientRect().bottom);
    return { chocs, texteMin: Math.round(Math.min(...tailles) * 10) / 10, basCarte: Math.round(r.bottom), basCartouches: Math.round(Math.max(...bas)), vue: innerHeight, defilement: Math.round(scrollY),
      largeurPage: document.documentElement.scrollWidth, fenetre: innerWidth, noeuds: visibles.length, atteignables: document.querySelectorAll(".route-svg .halte.atteignable").length };
  });
  res.route = await controlerRoute();
  if (!res.route) E("carte-itinéraire absente");
  else {
    if (res.route.chocs.length) E("carte-itinéraire : " + res.route.chocs.join(" ; "));
    if (res.route.texteMin < 14) E("carte-itinéraire : texte à " + res.route.texteMin + " px à l'écran (14 au moins)");
    if (res.route.largeurPage > res.route.fenetre) E("carte-itinéraire : défilement horizontal (" + res.route.largeurPage + " px)");
    if (res.route.basCarte > res.route.vue + 0.5) E("carte-itinéraire coupée en " + res.taille + " (bas à " + res.route.basCarte + " px pour " + res.route.vue + ")");
    if (res.route.basCartouches > res.route.vue + 0.5) E("cartouches de la route coupés en " + res.taille + " (bas à " + res.route.basCartouches + " px pour " + res.route.vue + ")");
    if (res.route.atteignables < 2) E("carte-itinéraire : " + res.route.atteignables + " halte atteignable au départ (2 ou 3 attendues)");
  }
  // 4. clavier : les flèches parcourent les haltes atteignables, le chiffre entre
  const att = await page.evaluate(() => JEU.expedition.atteignables().map(x => ({ id: x.id, type: x.type, porte: x.porte || null })));
  const focus = () => page.evaluate(() => document.activeElement && document.activeElement.getAttribute("data-id"));
  res.clavier = { avant: await focus() };
  await page.keyboard.press("ArrowRight"); await attendre(60); res.clavier.droite = await focus();
  await page.keyboard.press("ArrowLeft"); await attendre(60); res.clavier.gauche = await focus();
  if (!res.clavier.avant || res.clavier.droite === res.clavier.avant || res.clavier.gauche !== res.clavier.avant) E("route : les flèches ne parcourent pas les haltes atteignables (" + JSON.stringify(res.clavier) + ")");
  const iE = att.findIndex(x => x.type === "escarmouche" && x.porte && x.porte.genre === "faveur");
  const escarmouche = att[iE], acte = await page.evaluate(() => { const a = JEU.expedition.acteCourant(); return { semaine: a.semaine, semaines: a.semaines, quota: a.quota }; });
  const mesuresAvant = await page.evaluate(() => JEU.mesure.valeurs.length);
  await page.evaluate(() => JEU.expedition.vitesse(3)); // les vagues en temps réel, à ×3
  await page.keyboard.press(String(iE + 1));
  // 5. l'escarmouche : deux vagues, trois questions chacune
  const eclaireur = await page.evaluate(() => JEU.expedition.TEXTES.eclaireur.map(t => t.replace(/\{S\}.*$/, "")));
  const questions = [], durees = [];
  let garde = 0, vagueVue = -1, dansVague = 0, finBataille = null;
  await page.waitForFunction(() => document.querySelector(".td-question .question"), null, { timeout: 30000 });
  while (garde++ < 300) {
    const etat = await page.evaluate(() => ({ partie: !!JEU.partie, phase: JEU.bataille.enCours && JEU.bataille.enCours.phase, vague: JEU.bataille.enCours && JEU.bataille.enCours.vague,
      question: !!document.querySelector(".td-question .question .enonce") && !document.querySelector(".panneau-erreur"), erreur: !!document.querySelector(".panneau-erreur"),
      bilan: !!document.querySelector(".td-conseil .bilan"), pret: !!document.querySelector(".td-pret") }));
    if (!etat.partie) break;
    if (etat.bilan) {
      finBataille = await page.evaluate(() => ({ titre: document.querySelector(".td-conseil .bilan h2").textContent, bouton: document.querySelector(".td-conseil .bilan .bouton").textContent }));
      await attendre(300); await page.keyboard.press("Enter"); await attendre(300); continue;
    }
    if (etat.erreur) { await page.keyboard.press("Enter"); await attendre(150); continue; }
    if (etat.question) {
      if (etat.vague !== vagueVue) { vagueVue = etat.vague; dansVague = 0; }
      await attendre(350);
      const q = await page.evaluate(() => {
        const r = document.querySelector(".td-question .recit"), ruban = r && r.querySelector(".recit-repere");
        const cartes = [...document.querySelectorAll(".td-conseil > .recit")].map(c => c.textContent);
        return { type: JEU.ui.questionCourante.type, nom: r ? r.querySelector(".recit-nom").firstChild.textContent : null, ruban: ruban ? ruban.textContent : null, relief: !!(ruban && ruban.classList.contains("recit-semaine")), cartes: cartes.length, textes: cartes };
      });
      q.vague = etat.vague; q.rang = dansVague;
      questions.push(q);
      const avantEv = await page.evaluate(() => window.__ev.length);
      await repondreJuste(page);
      await attendre(350);
      if (dansVague < 2 && q.type !== "association" && q.type !== "trou") { const ev = await page.evaluate(a => window.__ev.slice(a), avantEv); durees.push(ev.length ? Math.max(...ev) : 16); }
      dansVague++;
      continue;
    }
    if (etat.phase === "preparation" && etat.pret) { await attendre(700); await page.keyboard.press("Enter"); await attendre(400); continue; }
    await attendre(400);
  }
  res.escarmouche = { questions: questions.length, vagues: vagueVue + 1, fin: finBataille, mesures: durees.length, mediane: durees.slice().sort((a, b) => a - b)[Math.floor(durees.length / 2)], max: Math.max(...durees), detail: durees,
    rubans: questions.filter(q => q.ruban).length, reliefs: questions.filter(q => q.relief).length, parVague: [] };
  for (let v = 0; v <= vagueVue; v++) res.escarmouche.parVague.push(questions.filter(q => q.vague === v).map(q => (q.relief ? "S" : "·") + "(" + q.ruban + ")").join(" "));
  const mesuresRoute = await page.evaluate(a => JEU.mesure.valeurs.slice(a), mesuresAvant);
  res.escarmouche.jeuMesure = { n: mesuresRoute.length, max: mesuresRoute.length ? Math.round(Math.max(...mesuresRoute) * 10) / 10 : null };
  if (questions.length < 6) E("escarmouche : " + questions.length + " questions jouées (6 attendues : deux vagues de trois)");
  if (!finBataille || !/Continuer la route/.test(finBataille.bouton)) E("escarmouche : écran de fin sans « Continuer la route » (" + JSON.stringify(finBataille) + ")");
  if (questions.some(q => !q.ruban)) E("escarmouche : une question sans ruban de semaine (" + JSON.stringify(questions.map(q => q.ruban)) + ")");
  const attendus = Math.min(3, acte.quota); // deux sur trois quand la fenêtre est pleine ; une quand elle est mince ; aucune sans cours
  for (let v = 0; v <= vagueVue; v++) { const n = questions.filter(q => q.vague === v && q.relief).length; if (n < attendus) E("escarmouche, vague " + (v + 1) + " : " + n + " question(s) de la semaine " + acte.semaine + " en relief sur trois (" + attendus + " attendue(s) ; fenêtre " + JSON.stringify(acte.semaines) + ")"); }
  if (questions.some(q => !q.nom)) E("escarmouche : une question sans conseiller qui la pose");
  // la carte de l'éclaireur (la semaine) avant la première question de la première vague, jamais entre deux questions
  const q0 = questions[0], ditSemaine = q => q && q.textes.some(t => eclaireur.some(p => t.indexOf(p) >= 0) && t.indexOf(String(acte.semaine)) >= 0);
  if (!ditSemaine(q0)) E("escarmouche : pas de carte de l'éclaireur qui dit la semaine avant la première question (" + JSON.stringify(q0 && q0.textes) + ")");
  for (let v = 0; v <= vagueVue; v++) { const qv = questions.filter(q => q.vague === v); if (qv.some(q => q.cartes !== qv[0].cartes)) E("escarmouche, vague " + (v + 1) + " : une carte de récit ajoutée entre deux questions (" + qv.map(q => q.cartes).join(", ") + ")"); }
  if (res.escarmouche.max > 100) E("escarmouche " + res.taille + " : " + res.escarmouche.max + " ms entre une réponse et la question suivante peinte (plus de 100 ms)");
  if (res.escarmouche.jeuMesure.max !== null && !(res.escarmouche.jeuMesure.max < 100)) E("escarmouche : JEU.mesure à " + res.escarmouche.jeuMesure.max + " ms");
  // 6. la porte de faveur : la question du conseiller dans son cadre, puis trois cartes, choix au clavier
  await page.waitForSelector("#ecran-expedition .porte .question .enonce, #ecran-expedition button.carte-faveur", { timeout: 15000 });
  res.porte = await page.evaluate(() => { const r = document.querySelector("#ecran-expedition .porte .recit"); return { question: !!document.querySelector("#ecran-expedition .porte .question .enonce"), conseiller: r ? r.querySelector(".recit-nom").firstChild.textContent : null, ruban: !!(r && r.querySelector(".recit-repere")), titre: (document.querySelector("#ecran-expedition .porte h2") || {}).textContent }; });
  if (!res.porte.question || !res.porte.conseiller) E("porte de faveur : la question du conseiller manque (" + JSON.stringify(res.porte) + ")");
  const famillePorte = escarmouche.porte.conseiller;
  res.porte.famillePorte = famillePorte;
  res.porte.matiereQuestion = await page.evaluate(() => JEU.ui.questionCourante.matiere);
  res.porte.familleQuestion = await page.evaluate(() => JEU.recit.famille(JEU.ui.questionCourante.matiere));
  res.porte.rappel = await page.evaluate(() => !!JEU.ui.questionCourante.rappel);
  if (res.porte.familleQuestion !== famillePorte && !res.porte.rappel) E("porte de faveur : question de la famille " + res.porte.familleQuestion + " au lieu de " + famillePorte);
  await repondreJuste(page);
  await attendre(250);
  if (await page.$(".panneau-erreur")) { await page.keyboard.press("Enter"); await attendre(250); }
  await page.waitForSelector("#ecran-expedition button.carte-faveur");
  res.porte.cartes = await page.evaluate(() => [...document.querySelectorAll("#ecran-expedition button.carte-faveur")].map(b => ({ nom: b.querySelector(".cf-nom").textContent, rang: b.querySelector(".cf-rang").textContent, conseiller: b.querySelector(".cf-conseiller").textContent, texte: b.querySelector(".cf-texte").textContent })));
  res.porte.familles = await page.evaluate(() => JEU.expedition.enCours().offre.cartes.map(c => c.famille));
  if (res.porte.cartes.length < 2 || res.porte.cartes.length > 4) E("porte de faveur : " + res.porte.cartes.length + " cartes (3 attendues après une bonne réponse, 2 après une erreur)");
  if (!res.porte.familles.some(f => f !== famillePorte)) E("porte de faveur : aucune carte d'une autre famille que celle de la porte (" + res.porte.familles.join(", ") + ")");
  await page.keyboard.press("ArrowRight"); await attendre(60);
  res.porte.focusCarte = await page.evaluate(() => document.activeElement && document.activeElement.classList.contains("carte-faveur") ? document.activeElement.querySelector(".cf-nom").textContent : null);
  await page.keyboard.press("1");
  await page.waitForSelector("#ecran-expedition .route-svg");
  await attendre(300);
  res.apresPorte = await page.evaluate(() => { const e = JEU.expedition.enCours(); return { faveurs: e.faveurs.slice(), medaillons: document.querySelectorAll(".cp-faveurs .faveur-med").length, sceaux: document.querySelectorAll(".route-svg .sceau-halte").length, position: e.position, fait: e.faits[e.position], renom: e.compte.renom, questions: e.compte.questions, or: e.or, vivres: e.vivres }; });
  if (res.apresPorte.faveurs.length !== 1 || res.apresPorte.medaillons !== 1) E("faveur choisie absente de « Ta compagnie » (" + JSON.stringify(res.apresPorte) + ")");
  if (res.apresPorte.sceaux !== 1 || !res.apresPorte.fait) E("pas de sceau sur l'escarmouche jouée (" + JSON.stringify(res.apresPorte) + ")");
  if (res.apresPorte.questions < 7 || res.apresPorte.renom < 1) E("les réponses de la halte ne comptent pas pour l'expédition (" + JSON.stringify(res.apresPorte) + ")");
  const c2 = await controlerRoute();
  if (c2 && c2.chocs.length) E("carte-itinéraire après la halte : " + c2.chocs.join(" ; "));
  // 7. retour à la campagne (Échap), « Reprendre » au même point ; export puis import
  const avantRetour = await page.evaluate(() => JSON.stringify(JEU.sauvegarde.etat().expedition.enCours));
  await page.keyboard.press("Escape");
  await page.waitForFunction(() => JEU.ui.ecranCourant() === "jouer");
  await attendre(200);
  res.carteReprise = await page.evaluate(() => { const b = [...document.querySelectorAll(".carte-jeu h2")].find(x => /expédition/i.test(x.textContent)); return b ? b.textContent : null; });
  if (!/Reprendre l'expédition · semaine \d+, \de halte/.test(res.carteReprise || "")) E("carte de la campagne après le retour : « " + res.carteReprise + " » (« Reprendre l'expédition · semaine N, 2e halte » attendu)");
  res.evenementDuJour = await page.evaluate(() => { const c = JEU.campagne.etat(); return c.evenement ? { id: c.evenement.id, fait: c.evenement.fait } : null; });
  await page.evaluate(() => { JEU.ui.fermerModale(); [...document.querySelectorAll(".carte-jeu")].find(x => /Reprendre/.test(x.textContent)).click(); });
  await page.waitForSelector("#ecran-expedition .route-svg");
  res.reprise = await page.evaluate(a => JSON.stringify(JEU.sauvegarde.etat().expedition.enCours) === a, avantRetour);
  if (!res.reprise) E("« Reprendre » ne revient pas au même point (position, vivres, faveurs)");
  res.importIdentique = await page.evaluate(() => { const t = JEU.sauvegarde.texteExport(), a = JSON.stringify(JEU.sauvegarde.etat().expedition); JEU.sauvegarde.importer(t); JEU.ui.afficher("expedition"); return JSON.stringify(JEU.sauvegarde.etat().expedition) === a && !!JEU.expedition.enCours(); });
  if (!res.importIdentique) E("export puis import : l'expédition en cours ne revient pas telle quelle");
  // 8. « Messages des rivaux » coupé : le défi avant le Grand Gardien n'est pas demandé (lancement immédiat, aucune fenêtre)
  res.sansDefi = await page.evaluate(() => {
    const r = JEU.sauvegarde.etat().reglages; r.rivaux = false; JEU.sauvegarde.enregistrer();
    let lances = 0; for (let i = 0; i < 8; i++) JEU.ecranCampagne.defiAvantRoute("gue", () => { lances++; });
    return { lances, modale: !document.getElementById("modale").hidden };
  });
  if (res.sansDefi.lances !== 8 || res.sansDefi.modale) E("« Messages des rivaux » coupé : un défi est encore demandé avant le Grand Gardien (" + JSON.stringify(res.sansDefi) + ")");
  // 9. « Sang dans les combats » et « Animations » coupés : la route et la page de semaine se dessinent sans erreur ; puis
  //    la défaite forcée se joue avec ces réglages
  await page.evaluate(() => { const r = JEU.sauvegarde.etat().reglages; r.sang = false; r.animations = false; JEU.sauvegarde.enregistrer(); JEU.ui.appliquerAnimations(); JEU.ui.afficher("expedition"); });
  await page.waitForSelector("#ecran-expedition .route-svg");
  await page.keyboard.press("f"); await attendre(150);
  res.listeFaveurs = await page.evaluate(() => document.querySelectorAll("#ecran-expedition .liste-faveurs .carte-faveur").length);
  await page.keyboard.press("Escape"); await attendre(150);
  if (res.listeFaveurs !== 1) E("liste des faveurs (F) : " + res.listeFaveurs + " carte (1 attendue)");
  // 10. défaite forcée : un seul vivre (console), on avance jusqu'à une bataille (les haltes sans bataille sont passées par
  //     l'API), première vague lancée puis « Quitter » : −1 vivre → 0 → le bilan, renommée > 0, campagne intacte
  const avantDefaite = await page.evaluate(() => { const X = JEU.expedition, e = X.enCours(); e.vivres = 1; JEU.sauvegarde.enregistrer();
    let n = 0; while (n++ < 6 && !X.atteignables().some(x => JEU.expedition.EXP.BATAILLES.indexOf(x.type) >= 0)) { const h = X.atteignables()[0]; X.entrer(h.id); X.terminerHalte(h.id); }
    JEU.ui.afficher("expedition");
    return { vivres: e.vivres, renom: e.compte.renom, haltes: X.haltesJouees(e), bataille: X.atteignables().filter(x => JEU.expedition.EXP.BATAILLES.indexOf(x.type) >= 0).map(x => x.id + ":" + x.type)[0] || null }; });
  res.defaite = { avant: avantDefaite };
  if (!avantDefaite.bataille) E("défaite forcée : aucune bataille atteignable");
  else {
    await page.waitForSelector("#ecran-expedition .route-svg");
    const iB = await page.evaluate(() => JEU.expedition.atteignables().findIndex(x => JEU.expedition.EXP.BATAILLES.indexOf(x.type) >= 0));
    await page.keyboard.press(String(iB + 1));
    await page.waitForFunction(() => document.querySelector(".td-question .question"), null, { timeout: 30000 });
    for (let i = 0; i < 3; i++) {
      await page.waitForFunction(() => document.querySelector(".td-question .question .enonce") || document.querySelector(".panneau-erreur"));
      if (await page.$(".panneau-erreur")) { await page.keyboard.press("Enter"); await attendre(200); }
      await attendre(200);
      if (await page.$(".td-question .question .enonce")) await repondreJuste(page);
      await attendre(200);
    }
    await page.waitForSelector(".td-pret");
    for (let k = 0; k < 5 && await page.evaluate(() => JEU.bataille.enCours.phase === "preparation"); k++) { await attendre(700); await page.keyboard.press("Enter"); }
    await page.waitForFunction(() => JEU.bataille.enCours.phase === "vague");
    res.defaite.entamee = await page.evaluate(() => JEU.expedition.enCours().entamee);
    await attendre(1500); // la vague tourne (sang et animations coupés)
    await page.keyboard.press("Escape");
    await page.waitForSelector(".confirmation");
    await page.click(".confirmation .bouton.principal");
    await page.waitForSelector("#ecran-expedition .bilan-exp", { timeout: 10000 }).catch(() => {});
    res.defaite.bilan = await page.evaluate(() => { const b = document.querySelector("#ecran-expedition .bilan-exp"); if (!b) return null; const m = b.textContent.match(/Renommée gagnée : (\d+)/);
      return { titre: b.querySelector("h1").textContent, renom: m ? Number(m[1]) : null, relire: !!b.querySelector("h3:nth-of-type(2)"), enCours: !!JEU.expedition.enCours(), historique: JEU.expedition.etat().historique[0] && JEU.expedition.etat().historique[0].issue }; });
    if (!res.defaite.entamee) E("défaite forcée : la première vague lancée n'est pas notée (entamee)");
    if (!res.defaite.bilan) E("défaite forcée : pas d'écran de bilan après la bataille quittée au dernier vivre");
    else if (!(res.defaite.bilan.renom > 0) || res.defaite.bilan.enCours || res.defaite.bilan.historique !== "retour") E("défaite forcée : bilan sans renommée ou expédition encore en cours (" + JSON.stringify(res.defaite.bilan) + ")");
  }
  const apres = await copieCampagne();
  const cles = ["provinces", "conquises", "rival", "arsenal", "royaume", "evenement", "bonus"].filter(k => JSON.stringify(avant[k]) !== JSON.stringify(apres[k]));
  const ressources = Object.keys(avant.ressources).filter(k => apres.ressources[k] < avant.ressources[k]);
  res.campagne = { touches: cles, ressourcesEnBaisse: ressources, bonusApres: apres.bonus };
  if (cles.length || ressources.length) E("campagne touchée par l'expédition : " + cles.concat(ressources.map(r => "ressource " + r)).join(", "));
  if (apres.bonus.or !== 40 || apres.bonus.espion !== true) E("les bonus de l'événement du jour ont été consommés par la route (" + JSON.stringify(apres.bonus) + ")");
  await page.keyboard.press("Escape");
  await page.waitForFunction(() => JEU.ui.ecranCourant() === "jouer");
  await page.close();
  return res;
}

// ---------- tablette tactile (31/10/2026) : Android 10 pouces émulé (doigt seul, densité 2, « pointer: coarse ») ----------
// Tout se joue au toucher (locator.tap, page.touchscreen, événements tactiles bruts pour le glissement), jamais au clavier :
// accueil, campagne, bataille (type de tour puis emplacement touchés, tour bâtie touchée à nouveau pour la sélectionner,
// cible élargie au doigt, fantassins, « Lancer la vague », vitesse ×3, « Quitter »), route des semaines (halte touchée,
// escarmouche jouée au doigt à ×3, porte de faveur, carte choisie au doigt), conseil (carte glissée au doigt, sceaux),
// réglages (le libellé d'une case à cocher se touche) ; en 1280 × 800 et 1024 × 768. Contrôles : aucun défilement
// horizontal, champ de bataille entier à l'écran (côte à côte avec la colonne, même en 1024 × 768), carte-itinéraire et
// cartouches entiers, grille de la campagne sur deux colonnes, cibles tactiles de 44 px au moins, textes de 14 px au moins
// dans la colonne de bataille et sur la carte, moins de 100 ms entre une réponse touchée et la question suivante
// (JEU.mesure, et Event Timing sur pointerup et click). En portrait (800 × 1280) : « Tourne ta tablette en paysage »
// (feuille de style seule), qui disparaît en paysage. Captures : atelier/captures/tablette-*.png.
const CAPTURES = path.join(__dirname, "..", "captures");
async function contexteTablette(navigateur, w, h, erreurs) {
  const ctx = await navigateur.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  const page = await ctx.newPage();
  page.on("pageerror", e => erreurs.push(e.message));
  page.on("console", m => { if (m.type() === "error") erreurs.push(m.text()); });
  await page.goto(URL);
  await page.waitForFunction(() => window.JEU && JEU.pret);
  await page.evaluate(() => {
    window.__ev = [];
    new PerformanceObserver(l => l.getEntries().forEach(e => { if (e.name === "pointerup" || e.name === "click") window.__ev.push(e.duration); }))
      .observe({ type: "event", durationThreshold: 16, buffered: true });
  });
  return { ctx, page };
}
// Mesures d'un écran, dans la page : largeur défilable, champ de bataille, colonnes de la grille, plus petit texte de la
// colonne de bataille, et cibles tactiles visibles de moins de 44 px (une case à cocher compte avec son libellé). Le groupe
// .case.relais du parchemin de l'année n'est pas une cible : 29 px de large par construction (34 semaines sur 1000), les
// flèches « Relais précédent / suivant » font la même chose en 44 px.
function sondeTablette() {
  const petites = [];
  document.querySelectorAll("button, a[href], input, select, textarea, [role=button], .quartier, .noeud.cible, .noeud.attaque, .halte.atteignable").forEach(e => {
    if (e.hidden || e.closest("[hidden]")) return;
    let cible = e;
    if (e.tagName === "INPUT" && (e.type === "checkbox" || e.type === "radio") && e.closest("label")) cible = e.closest("label");
    const r = cible.getBoundingClientRect(), cs = getComputedStyle(cible);
    if (r.width === 0 || r.height === 0 || cs.visibility === "hidden" || cs.display === "none") return;
    if (r.width < 43.5 || r.height < 43.5) {
      const classe = String(e.className && e.className.baseVal !== undefined ? e.className.baseVal : e.className || "").split(" ")[0];
      petites.push((e.id ? "#" + e.id : e.tagName.toLowerCase() + (classe ? "." + classe : "")) + " " + Math.round(r.width) + "×" + Math.round(r.height) + " « " + (e.textContent || e.getAttribute("aria-label") || "").trim().slice(0, 24) + " »");
    }
  });
  const toile = document.querySelector(".td-canvas"), r = toile ? toile.getBoundingClientRect() : null;
  const grille = document.querySelector(".grille-jeux"), zone = document.querySelector(".zone-partie");
  const textes = [...document.querySelectorAll(".td-bas .choix, .td-bas .enonce, .td-bas .td-nom, .td-bas .td-cout, .td-bas .recit-texte, .td-bas .bouton")].map(e => parseFloat(getComputedStyle(e).fontSize));
  return { largeurPage: document.documentElement.scrollWidth, fenetre: innerWidth, vue: innerHeight,
    toile: r ? { gauche: Math.round(r.left), droite: Math.round(r.right), haut: Math.round(r.top), bas: Math.round(r.bottom), largeur: Math.round(r.width) } : null,
    colonnes: grille ? getComputedStyle(grille).gridTemplateColumns.split(" ").length : null,
    cotes: zone && toile ? getComputedStyle(zone).gridTemplateColumns.split(" ").length : null,
    texteMin: textes.length ? Math.round(Math.min(...textes) * 10) / 10 : null, petites };
}
const tap = (page, sel, options) => page.locator(sel, options).first().tap();
// touche le choix affiché dont le texte est t (QCM, vrai ou faux, corrections : les choix sont mélangés à l'affichage)
async function tapChoix(page, texte) {
  const i = await page.evaluate(t => [...document.querySelectorAll(".reponses button.choix")].findIndex(b => b.lastElementChild && b.lastElementChild.textContent === t), texte);
  if (i < 0) throw new Error("choix introuvable au doigt : " + texte);
  await page.locator(".reponses button.choix").nth(i).tap();
}
// Répond juste à la question affichée, au doigt seulement (un texte à trous se remplit par l'API : le clavier de la
// tablette ne se simule pas ; « Valider » est touché).
async function repondreJusteTap(page) {
  const q = await page.evaluate(() => { const q = JEU.ui.questionCourante; return { type: q.type, reponse: q.reponse, corrections: q.corrections }; });
  switch (q.type) {
    case "qcm": await tapChoix(page, q.reponse); break;
    case "qcm_multiple": for (const c of q.reponse) await tapChoix(page, c); await tap(page, ".reponses .valider"); break;
    case "vrai_faux":
      if (q.reponse.vrai) await tapChoix(page, "Vrai");
      else { await tapChoix(page, "Faux"); if (q.corrections && q.corrections.length) { await attendre(80); await tapChoix(page, q.reponse.correction); } }
      break;
    case "ordre": for (const i of q.reponse) await page.locator(".ordre .choix").nth(i).tap(); await tap(page, ".reponses .valider"); break;
    case "association":
      for (const [g, d] of q.reponse) { await page.locator(".association .colonne").nth(0).locator(".choix").nth(g).tap(); await page.locator(".association .colonne").nth(1).locator(".choix").nth(d).tap(); }
      await tap(page, ".reponses .valider"); break;
    case "trou":
      await page.evaluate(r => { document.querySelectorAll(".trou").forEach((c, i) => { c.value = Array.isArray(r[i]) ? r[i][0] : r[i]; }); }, q.reponse);
      await tap(page, ".reponses .valider"); break;
  }
}
// Joue au doigt tout ce qui se présente (panneau d'erreur, question, « Lancer la vague », bilan) jusqu'à ce que fini() soit
// vrai. journal : { questions, erreurs, bilans, vagues, durees } ; une durée Event Timing n'est gardée que quand la réponse
// amène une autre question (JEU.mesure a noté un enchaînement).
async function jouerAuDoigt(page, fini, journal, budget) {
  for (let garde = 0; garde < (budget || 200); garde++) {
    if (await fini()) return true;
    const etat = await page.evaluate(() => ({
      erreur: !!document.querySelector(".panneau-erreur"),
      question: !!document.querySelector(".question .enonce") && !document.querySelector(".panneau-erreur"),
      bilan: !!document.querySelector(".zone-partie .bilan .bouton.principal"),
      pret: !!document.querySelector(".td-pret") && !!document.querySelector(".td-lancer:not([disabled])") }));
    if (etat.erreur) { await tap(page, ".panneau-erreur .bouton.principal"); journal.erreurs++; }
    else if (etat.question) {
      await attendre(300);
      const avant = await page.evaluate(() => ({ ev: window.__ev.length, mesures: JEU.mesure.valeurs.length }));
      await repondreJusteTap(page); journal.questions++;
      await attendre(300);
      const apres = await page.evaluate(a => ({ ev: window.__ev.slice(a.ev), mesures: JEU.mesure.valeurs.length }), avant);
      if (apres.mesures > avant.mesures) journal.durees.push(apres.ev.length ? Math.max(...apres.ev) : 16);
    }
    else if (etat.bilan) { await attendre(300); await tap(page, ".zone-partie .bilan .bouton.principal"); journal.bilans++; }
    else if (etat.pret) { await attendre(300); await tap(page, ".td-lancer"); journal.vagues++; }
    await attendre(350);
  }
  return false;
}
async function essaiTablette(navigateur, w, h, erreurs) {
  const { ctx, page } = await contexteTablette(navigateur, w, h, erreurs);
  const tag = w + "x" + h, res = { taille: w + " × " + h, echecs: [], ecrans: {}, durees: [] };
  const E = m => res.echecs.push(m);
  const voir = async nom => {
    await attendre(250);
    await page.screenshot({ path: path.join(CAPTURES, "tablette-" + tag + "-" + nom + ".png") });
    const m = await page.evaluate(sondeTablette);
    res.ecrans[nom] = m;
    if (m.largeurPage > m.fenetre) E(nom + " : défilement horizontal (" + m.largeurPage + " px pour " + m.fenetre + ")");
    if (m.petites.length) E(nom + " : cibles de moins de 44 px : " + m.petites.join(" ; "));
    return m;
  };
  const champEntier = (m, quoi) => {
    if (!m.toile) return E(quoi + " : pas de champ de bataille");
    if (m.toile.gauche < -1 || m.toile.droite > m.fenetre + 1 || m.toile.haut < -1 || m.toile.bas > m.vue + 1) E(quoi + " : le champ n'est pas entier à l'écran (" + JSON.stringify(m.toile) + " pour " + m.fenetre + " × " + m.vue + ")");
    if (m.cotes !== 2) E(quoi + " : le champ et la colonne ne sont pas côte à côte (" + m.cotes + " colonne)");
    if (m.texteMin !== null && m.texteMin < 14) E(quoi + " : texte de la colonne à " + m.texteMin + " px (14 au moins)");
  };
  res.media = await page.evaluate(() => ({ coarse: matchMedia("(pointer: coarse)").matches, hover: matchMedia("(hover: hover)").matches, dpr: devicePixelRatio, tactile: JEU.ui.tactile }));
  if (!res.media.coarse || res.media.hover || !res.media.tactile) E("l'émulation tactile ne donne pas pointer: coarse et hover: none (" + JSON.stringify(res.media) + ")");
  await voir("accueil");
  // 1. la campagne : grille des cartes sur deux colonnes
  await tap(page, "#menu button[data-ecran=jouer]");
  await page.waitForSelector("#ecran-jouer .grille-jeux");
  await page.evaluate(() => JEU.ui.fermerModale());
  const mc = await voir("campagne");
  if (mc.colonnes !== 2) E("campagne : grille des cartes sur " + mc.colonnes + " colonnes (2 attendues)");
  // 2. la bataille au Gué, au doigt : trois questions, une tour (type puis emplacement touchés), la tour touchée à nouveau
  //    (sélection), un second emplacement touché 36 unités à côté (cible élargie au doigt), des fantassins, la vague à ×3
  await page.evaluate(() => { JEU.ui.fermerModale(); JEU.bataille.lancer("gue"); });
  await page.waitForSelector(".td-question .question", { timeout: 30000 });
  await attendre(300);
  champEntier(await voir("bataille-conseil"), "bataille (conseil de guerre)");
  res.enonceVisible = await page.evaluate(() => { const e = document.querySelector(".td-question .enonce"); if (!e) return false; const r = e.getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight; });
  if (!res.enonceVisible) E("bataille : l'énoncé n'est pas visible à l'ouverture du conseil de guerre");
  const mesuresAvant = await page.evaluate(() => JEU.mesure.valeurs.length);
  const jb = { questions: 0, erreurs: 0, bilans: 0, vagues: 0, durees: res.durees };
  if (!await jouerAuDoigt(page, () => page.$(".td-pret"), jb, 40)) E("bataille : le conseil de guerre ne se termine pas au doigt (" + JSON.stringify(jb) + ")");
  await page.waitForSelector(".td-lancer:not([disabled])");
  await page.locator('.td-bouton[data-cle="tour-piquiers"]').tap();
  res.bataille = { questions: jb.questions, choisi: await page.evaluate(() => { const b = document.querySelector(".td-bouton.choisi"); return b ? b.getAttribute("data-cle") : null; }) };
  if (res.bataille.choisi !== "tour-piquiers") E("bataille : le type de tour touché n'est pas retenu (" + res.bataille.choisi + ")");
  const slots = await page.evaluate(() => JEU.cartesBataille.carte("gue").emplacements.slice(0, 2));
  const cadre = await page.locator(".td-canvas").boundingBox();
  const surChamp = e => [cadre.x + e[0] / 1000 * cadre.width, cadre.y + e[1] / 660 * cadre.height];
  let [x, y] = surChamp(slots[0]);
  await page.touchscreen.tap(x, y); await attendre(200);
  res.bataille.tours = await page.evaluate(() => JEU.bataille.enCours.tours.map(t => t.type));
  if (res.bataille.tours.join() !== "piquiers") E("bataille : la tour n'est pas posée au doigt (" + JSON.stringify(res.bataille.tours) + ")");
  await page.touchscreen.tap(x, y); await attendre(200);
  res.bataille.selection = await page.evaluate(() => !!document.querySelector(".td-selection"));
  if (!res.bataille.selection) E("bataille : toucher une tour bâtie ne la sélectionne pas (portée, « Améliorer »)");
  await tap(page, ".td-selection .lien");
  [x, y] = surChamp(slots[1]);
  await page.touchscreen.tap(x + 36 * cadre.width / 1000, y); await attendre(200); // à la souris (rayon 30), ce toucher ne bâtirait rien
  res.bataille.toursApres = await page.evaluate(() => JEU.bataille.enCours.tours.length);
  if (res.bataille.toursApres !== 2) E("bataille : la cible élargie au doigt ne bâtit pas à 36 unités d'un emplacement (" + res.bataille.toursApres + " tour)");
  await page.locator('.td-bouton[data-cle="troupe-fantassins"]').tap(); await attendre(150);
  res.bataille.envois = await page.evaluate(() => JEU.bataille.enCours.envois.length);
  if (!res.bataille.envois) E("bataille : les fantassins touchés ne partent pas");
  await tap(page, ".td-lancer");
  await page.waitForFunction(() => JEU.bataille.enCours.phase === "vague", null, { timeout: 5000 });
  await page.locator('[data-cle="vitesse-3"]').tap(); await attendre(300);
  res.bataille.vitesse = await page.evaluate(() => { const b = document.querySelector(".td-vitesse .bouton.principal"); return b ? b.textContent : null; });
  if (res.bataille.vitesse !== "×3") E("bataille : la vitesse ×3 touchée n'est pas prise (" + res.bataille.vitesse + ")");
  await attendre(1200);
  champEntier(await voir("bataille-vague"), "bataille (vague)");
  await tap(page, "#bouton-quitter");
  await page.waitForSelector(".confirmation");
  await tap(page, ".confirmation .bouton.principal");
  await page.waitForFunction(() => !JEU.partie && JEU.ui.ecranCourant() === "jouer");
  const mesures = await page.evaluate(a => JEU.mesure.valeurs.slice(a), mesuresAvant);
  res.bataille.jeuMesure = { n: mesures.length, max: mesures.length ? Math.round(Math.max(...mesures) * 10) / 10 : null };
  // 3. la route des semaines au doigt : la carte « Partir en expédition », « Partir » jusqu'à une route dont la première
  //    couche a une escarmouche à porte de faveur (12 tirages au plus), « En route », la carte-itinéraire entière
  await page.evaluate(() => JEU.ui.fermerModale());
  await page.locator(".carte-jeu", { hasText: /Partir en expédition|Reprendre l'expédition/ }).tap();
  await page.waitForSelector("#ecran-expedition .parchemin-annee");
  await voir("expedition-depart");
  let convient = false;
  for (let n = 0; n < 12 && !convient; n++) {
    await page.locator("#ecran-expedition .exp-actions .bouton.principal").tap();
    await page.waitForSelector("#ecran-expedition .page-semaine");
    convient = await page.evaluate(() => JEU.expedition.enCours().route.actes[0].couches[0].some(x => x.type === "escarmouche" && x.porte && x.porte.genre === "faveur"));
    if (!convient) { await page.evaluate(() => { JEU.expedition.finir("abandon"); JEU.ui.afficher("expedition"); }); await page.waitForSelector("#ecran-expedition .parchemin-annee"); }
  }
  if (!convient) E("route : aucune escarmouche à porte de faveur en première couche en 12 tirages");
  await voir("expedition-semaine");
  await tap(page, "#ecran-expedition .exp-actions .bouton.principal");
  await page.waitForSelector("#ecran-expedition .route-svg");
  await attendre(300);
  await voir("expedition-route");
  res.route = await page.evaluate(() => {
    const svg = document.querySelector(".route-svg"), k = svg.getBoundingClientRect().width / 1000;
    const tailles = [...svg.querySelectorAll("text")].map(t => parseFloat(getComputedStyle(t).fontSize) * k);
    const r = svg.getBoundingClientRect(), bas = [...document.querySelectorAll("#ecran-expedition .exp-bas .cartouche")].map(c => c.getBoundingClientRect().bottom);
    return { texteMin: Math.round(Math.min(...tailles) * 10) / 10, basCarte: Math.round(r.bottom), basCartouches: Math.round(Math.max(...bas)), vue: innerHeight,
      haltes: [...document.querySelectorAll(".route-svg .halte.atteignable")].map(g => { const b = g.getBoundingClientRect(); return Math.round(Math.min(b.width, b.height)); }) };
  });
  if (res.route.texteMin < 14) E("route : texte à " + res.route.texteMin + " px à l'écran (14 au moins)");
  if (res.route.basCarte > res.route.vue + 0.5) E("route : carte coupée (bas à " + res.route.basCarte + " px pour " + res.route.vue + ")");
  if (res.route.basCartouches > res.route.vue + 0.5) E("route : cartouches coupés (bas à " + res.route.basCartouches + " px pour " + res.route.vue + ")");
  if (!res.route.haltes.length || res.route.haltes.some(t => t < 44)) E("route : halte atteignable de moins de 44 px (" + res.route.haltes.join(", ") + ")");
  // 4. la halte touchée : l'escarmouche jouée au doigt (deux vagues à ×3), la question de la porte, la carte de faveur touchée
  const idE = await page.evaluate(() => { const x = JEU.expedition.atteignables().filter(x => x.type === "escarmouche" && x.porte && x.porte.genre === "faveur")[0]; return x ? x.id : null; });
  if (!idE) E("route : aucune escarmouche à porte de faveur atteignable");
  else {
    await page.evaluate(() => JEU.expedition.vitesse(3));
    await page.locator('.route-svg .halte[data-id="' + idE + '"]').tap();
    await page.waitForFunction(() => document.querySelector(".td-question .question"), null, { timeout: 30000 });
    const jr = { questions: 0, erreurs: 0, bilans: 0, vagues: 0, durees: res.durees };
    const fini = () => page.$("#ecran-expedition .porte .question .enonce, #ecran-expedition button.carte-faveur");
    const ok = await jouerAuDoigt(page, fini, jr, 300);
    res.escarmouche = { questions: jr.questions, erreurs: jr.erreurs, vagues: jr.vagues, bilans: jr.bilans };
    if (!ok) E("escarmouche au doigt : la porte de faveur n'arrive pas (" + JSON.stringify(res.escarmouche) + ")");
    else {
      if (await page.$("#ecran-expedition .porte .question .enonce")) {
        await voir("expedition-porte");
        await repondreJusteTap(page); await attendre(250);
        if (await page.$(".panneau-erreur")) { await tap(page, ".panneau-erreur .bouton.principal"); await attendre(250); }
      }
      await page.waitForSelector("#ecran-expedition button.carte-faveur");
      await voir("expedition-faveurs");
      res.faveur = { nom: await page.evaluate(() => document.querySelector("#ecran-expedition button.carte-faveur .cf-nom").textContent) };
      await page.locator("#ecran-expedition button.carte-faveur").first().tap();
      await page.waitForSelector("#ecran-expedition .route-svg");
      Object.assign(res.faveur, await page.evaluate(() => ({ tenues: JEU.expedition.enCours().faveurs.length, medaillons: document.querySelectorAll(".cp-faveurs .faveur-med").length })));
      if (res.faveur.tenues !== 1 || res.faveur.medaillons !== 1) E("porte de faveur : la carte touchée n'est pas tenue (" + JSON.stringify(res.faveur) + ")");
    }
  }
  await tap(page, "#ecran-expedition .exp-actions .bouton", { hasText: "Retour" });
  await page.waitForFunction(() => JEU.ui.ecranCourant() === "jouer");
  // 5. le conseil au doigt : la carte glissée vers la droite (événements tactiles bruts), puis un sceau touché
  await page.evaluate(() => { JEU.ui.fermerModale(); JEU.conseil.lancer(); });
  await page.waitForSelector(".carte-conseil");
  await attendre(400);
  await voir("conseil");
  const cdp = await ctx.newCDPSession(page);
  const boite = await page.locator(".carte-conseil").boundingBox();
  const xc = boite.x + boite.width / 2, yc = boite.y + boite.height / 2;
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: xc, y: yc }] });
  for (let i = 1; i <= 10; i++) { await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: xc + i * 22, y: yc }] }); await attendre(16); }
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await cdp.detach();
  await attendre(400);
  res.conseil = await page.evaluate(() => ({ compteur: document.querySelector(".compteur").textContent, erreur: !!document.querySelector(".panneau-erreur"), correction: !!document.querySelector(".scene-conseil .choix") }));
  if (!(/Affaire 2 /.test(res.conseil.compteur) || res.conseil.erreur || res.conseil.correction)) E("conseil : la carte glissée au doigt n'est pas tranchée (" + JSON.stringify(res.conseil) + ")");
  if (res.conseil.correction) { await page.locator(".scene-conseil .choix").first().tap(); await attendre(200); }
  if (await page.$(".panneau-erreur")) { await tap(page, ".panneau-erreur .bouton.principal"); await attendre(200); }
  if (await page.$(".boutons-sceau .bouton")) { await page.locator(".boutons-sceau .bouton").last().tap(); await attendre(300); }
  res.conseil.apres = await page.evaluate(() => document.querySelector(".compteur").textContent);
  if (await page.$(".panneau-erreur")) { await tap(page, ".panneau-erreur .bouton.principal"); await attendre(200); }
  if (await page.$(".scene-conseil .choix")) { await page.locator(".scene-conseil .choix").first().tap(); await attendre(200); }
  if (await page.$(".panneau-erreur")) { await tap(page, ".panneau-erreur .bouton.principal"); await attendre(200); }
  await tap(page, "#bouton-quitter");
  await page.waitForSelector(".confirmation");
  await tap(page, ".confirmation .bouton.principal");
  await page.waitForFunction(() => !JEU.partie);
  // 6. les réglages : la ligne entière d'une case à cocher se touche
  await tap(page, "#menu button[data-ecran=reglages]");
  await page.waitForSelector("#ecran-reglages input[data-reglage=sang]");
  await voir("reglages");
  const avantSang = await page.evaluate(() => JEU.sauvegarde.etat().reglages.sang !== false);
  await page.locator("label:has(> input[data-reglage=sang])").tap({ position: { x: 150, y: 12 } }); await attendre(150);
  res.reglages = { avant: avantSang, apres: await page.evaluate(() => JEU.sauvegarde.etat().reglages.sang !== false) };
  if (res.reglages.apres === res.reglages.avant) E("réglages : toucher le libellé d'une case à cocher ne la bascule pas");
  await page.locator("label:has(> input[data-reglage=sang])").tap({ position: { x: 150, y: 12 } }); await attendre(150);
  res.reglages.remis = await page.evaluate(() => JEU.sauvegarde.etat().reglages.sang !== false);
  await ctx.close();
  const tri = res.durees.slice().sort((a, b) => a - b);
  res.tempsReel = { mesures: tri.length, mediane: tri[Math.floor(tri.length / 2)], max: tri[tri.length - 1] };
  return res;
}
// Portrait (800 × 1280) : le mot « Tourne ta tablette en paysage » (body::after, feuille de style seule, aucun toucher pris),
// qui disparaît en paysage.
async function essaiPortrait(navigateur, erreurs) {
  const { ctx, page } = await contexteTablette(navigateur, 800, 1280, erreurs);
  await attendre(250);
  const res = await page.evaluate(() => { const cs = getComputedStyle(document.body, "::after"); return { contenu: cs.content, pointeur: cs.pointerEvents, position: cs.position, largeurPage: document.documentElement.scrollWidth, fenetre: innerWidth }; });
  await page.screenshot({ path: path.join(CAPTURES, "tablette-800x1280-portrait.png") });
  await page.setViewportSize({ width: 1280, height: 800 });
  await attendre(250);
  res.paysage = await page.evaluate(() => getComputedStyle(document.body, "::after").content);
  await ctx.close();
  return res;
}
function echecsTablette(bilan) {
  const echecs = [];
  (bilan.tablette || []).forEach(x => {
    x.echecs.forEach(m => echecs.push("tablette " + x.taille + " : " + m));
    if (!(x.tempsReel && x.tempsReel.mesures >= 6)) echecs.push("tablette " + x.taille + " : seulement " + (x.tempsReel ? x.tempsReel.mesures : 0) + " mesures d'Event Timing au doigt");
    else if (x.tempsReel.max > 100) echecs.push("tablette " + x.taille + " : " + x.tempsReel.max + " ms entre une réponse touchée et la question suivante peinte (plus de 100 ms)");
    if (x.bataille && x.bataille.jeuMesure && x.bataille.jeuMesure.max !== null && !(x.bataille.jeuMesure.max < 100)) echecs.push("tablette " + x.taille + " : JEU.mesure à " + x.bataille.jeuMesure.max + " ms en bataille");
  });
  const P = bilan.portrait;
  if (P) {
    if (!/Tourne ta tablette en paysage/.test(P.contenu) || P.pointeur !== "none" || P.position !== "fixed") echecs.push("portrait : le mot « Tourne ta tablette en paysage » manque ou prend les touchers (" + JSON.stringify(P) + ")");
    if (P.paysage !== "none") echecs.push("portrait : le mot reste affiché en paysage (" + P.paysage + ")");
    if (P.largeurPage > P.fenetre) echecs.push("portrait : défilement horizontal (" + P.largeurPage + " px pour " + P.fenetre + ")");
  }
  return echecs;
}

// Ce que l'essai des expéditions doit avoir trouvé (ses propres échecs, et assez de mesures d'Event Timing).
function echecsExpedition(bilan) {
  const echecs = [];
  (bilan.expedition || []).forEach(x => {
    x.echecs.forEach(m => echecs.push("expédition " + x.taille + " : " + m));
    if (!(x.escarmouche && x.escarmouche.mesures >= 3)) echecs.push("expédition " + x.taille + " : seulement " + (x.escarmouche ? x.escarmouche.mesures : 0) + " mesures d'Event Timing pendant l'escarmouche");
  });
  return echecs;
}

(async () => {
  const navigateur = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
  if (process.env.PARTIE === "tablette") {
    const erreurs = [], bilan = { tablette: [] };
    for (const [w, h] of [[1280, 800], [1024, 768]]) bilan.tablette.push(await essaiTablette(navigateur, w, h, erreurs));
    bilan.portrait = await essaiPortrait(navigateur, erreurs);
    bilan.erreursJS = erreurs;
    console.log(JSON.stringify(bilan, null, 1));
    await navigateur.close();
    const echecs = echecsTablette(bilan);
    if (erreurs.length) echecs.push("erreurs JavaScript dans la page");
    echecs.forEach(m => console.log("ÉCHEC  " + m));
    process.exit(echecs.length ? 1 : 0);
  }
  if (process.env.PARTIE === "expedition") {
    const erreurs = [], bilan = { expedition: [] };
    for (const [w, h] of [[1366, 768], [1920, 1080]]) bilan.expedition.push(await essaiExpedition(navigateur, w, h, erreurs));
    bilan.erreursJS = erreurs;
    console.log(JSON.stringify(bilan, null, 1));
    await navigateur.close();
    const echecs = echecsExpedition(bilan);
    if (erreurs.length) echecs.push("erreurs JavaScript dans la page");
    echecs.forEach(m => console.log("ÉCHEC  " + m));
    process.exit(echecs.length ? 1 : 0);
  }
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
  // 11. expédition de bout en bout (route des semaines), en 1366 × 768 et en 1920 × 1080
  bilan.expedition = [];
  for (const [w, h] of [[1366, 768], [1920, 1080]]) bilan.expedition.push(await essaiExpedition(navigateur, w, h, erreurs));
  // 12. tablette tactile (31/10/2026) : tout au doigt en 1280 × 800 et 1024 × 768, et le mot en portrait
  bilan.tablette = [];
  for (const [w, h] of [[1280, 800], [1024, 768]]) bilan.tablette.push(await essaiTablette(navigateur, w, h, erreurs));
  bilan.portrait = await essaiPortrait(navigateur, erreurs);
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
  echecsExpedition(bilan).forEach(m => echecs.push(m));
  echecsTablette(bilan).forEach(m => echecs.push(m));
  echecs.forEach(m => console.log("ÉCHEC  " + m));
  process.exit(echecs.length ? 1 : 0);
})().catch(e => { console.log("ÉCHEC  " + e.message); process.exit(1); });
