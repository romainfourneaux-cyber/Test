// Essai de bout en bout dans Chromium (Playwright) : bataille (tower defense) lancée deux fois de suite,
// quitter avec Échap, événement du jour, conseil du royaume, signalement, export puis import, noms de la carte de
// campagne qui ne se touchent pas (de la première province prise à la dernière),
// et mesure du temps entre une réponse et la question suivante sur 50 enchaînements au moins (objectif < 100 ms).
// Seuls les enchaînements question → question comptent : une vague, une carte de décision ou un bilan n'en sont pas.
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

// Répond juste à la question affichée, au clavier (et à la souris pour la colonne de droite des associations).
async function repondreJuste(page) {
  const q = await page.evaluate(() => { const q = JEU.ui.questionCourante; return { type: q.type, reponse: q.reponse, choix: q.choix, corrections: q.corrections, texte: q.texte }; });
  const k = n => page.keyboard.press(String(n));
  switch (q.type) {
    case "qcm": await k(q.choix.indexOf(q.reponse) + 1); break;
    case "qcm_multiple": for (const c of q.reponse) await k(q.choix.indexOf(c) + 1); await page.keyboard.press("Enter"); break;
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
    Object.keys(JEU.donnees.cours).forEach(c => JEU.questions.questionsDuCours(c).forEach(x => { if (x.enonce === t) tout.push(x); }));
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
  // la vague se joue en temps réel : on avance l'horloge du navigateur
  for (let k = 0; k < 200 && await page.evaluate(() => JEU.bataille.enCours.phase === "vague"); k++) await page.clock.runFor(500);
  bilan.apresVague = await page.evaluate(() => ({ phase: JEU.bataille.enCours.phase, vague: JEU.bataille.enCours.vague, chateau: JEU.bataille.enCours.chateau.pv }));
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
      }
    });
    c.conquises = avant;
    JEU.ui.afficher("jouer");
    return { etats: etats.length, chocs };
  });

  // 6. mesure : temps entre une réponse et la question suivante
  const v = await page.evaluate(() => JEU.mesure.valeurs.slice());
  if (process.env.DETAIL) console.log(v.map(x => Math.round(x)).join(" "));
  bilan.mesures = v.length;
  bilan.moyenne_ms = v.length ? Math.round(v.reduce((a, b) => a + b, 0) / v.length * 10) / 10 : null;
  bilan.max_ms = v.length ? Math.round(Math.max(...v) * 10) / 10 : null;
  bilan.ressources = await page.evaluate(() => JEU.sauvegarde.etat().ressources);
  bilan.erreursJS = erreurs;
  console.log(JSON.stringify(bilan, null, 1));
  await navigateur.close();

  const echecs = [];
  if (erreurs.length) echecs.push("erreurs JavaScript dans la page");
  if (bilan.lancementsBataille !== 1) echecs.push("la bataille a commencé " + bilan.lancementsBataille + " fois au lieu d'une");
  if (bilan.bouclesApresQuitter > 0) echecs.push("la boucle de la bataille tourne encore après avoir quitté");
  if (bilan.gainEvenement < 6) echecs.push("l'événement n'a pas rapporté ses ressources");
  if (!bilan.royaume || bilan.royaume.tresor + bilan.royaume.peuple + bilan.royaume.garde + bilan.royaume.savoir <= 0) echecs.push("les jauges du royaume n'ont pas monté");
  if (bilan.mesures < MESURES_VOULUES) echecs.push("seulement " + bilan.mesures + " mesures (il en faut " + MESURES_VOULUES + ")");
  if (!(bilan.max_ms < 100)) echecs.push("plus de 100 ms entre une réponse et la question suivante");
  if (!bilan.importIdentique) echecs.push("l'import ne redonne pas la même partie");
  if (bilan.etiquettes.chocs.length) echecs.push("carte de campagne : des noms se touchent (" + bilan.etiquettes.chocs.join(" ; ") + ")");
  echecs.forEach(m => console.log("ÉCHEC  " + m));
  process.exit(echecs.length ? 1 : 0);
})().catch(e => { console.log("ÉCHEC  " + e.message); process.exit(1); });
