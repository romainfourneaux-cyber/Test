// Essai de bout en bout dans Chromium (Playwright) : bataille (tower defense), conseil du royaume,
// événement du jour, quitter avec Échap, signalement, export puis import, et mesure du temps entre une réponse et la question suivante (objectif < 100 ms).
// Usage : node atelier/outils/perf.js   (demande le module playwright ; sinon, faire les vérifications à la main)
"use strict";
const path = require("path");
let chromium;
try { ({ chromium } = require("playwright")); } catch (e) {
  console.log("Playwright n'est pas installé : essai automatique impossible. Faire les vérifications dans le navigateur.");
  process.exit(0);
}
const URL = "file://" + path.join(__dirname, "..", "..", "jeu", "index.html").replace(/\\/g, "/");

// Répond juste à la question affichée, au clavier (et à la souris pour la colonne de droite des associations).
async function repondreJuste(page) {
  const q = await page.evaluate(() => { const q = JEU.ui.questionCourante; return { type: q.type, reponse: q.reponse, choix: q.choix, corrections: q.corrections, texte: q.texte }; });
  const k = n => page.keyboard.press(String(n));
  switch (q.type) {
    case "qcm": await k(q.choix.indexOf(q.reponse) + 1); break;
    case "qcm_multiple": for (const c of q.reponse) await k(q.choix.indexOf(c) + 1); await page.keyboard.press("Enter"); break;
    case "vrai_faux":
      if (q.reponse.vrai) await k(1); else { await k(2); await k(q.corrections.indexOf(q.reponse.correction) + 1); }
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

  // 1. bataille au Gué : 3 questions justes par vague, tours posées, troupes envoyées, une vague jouée
  await page.click("#menu button[data-ecran=jouer]");
  await page.waitForSelector("#ecran-jouer .carte-campagne");
  await page.keyboard.press("1");
  await page.waitForSelector(".td-canvas");
  for (let i = 0; i < 3; i++) { await page.waitForFunction(() => document.querySelector(".td-question .question")); await repondreJuste(page); }
  await page.waitForSelector(".td-pret");
  const slots = await page.evaluate(() => JEU.cartesBataille.carte("gue").emplacements.slice(0, 3));
  const cadre = await page.locator(".td-canvas").boundingBox();
  for (const e of slots) await page.mouse.click(cadre.x + e[0] / 1000 * cadre.width, cadre.y + e[1] / 660 * cadre.height);
  await page.locator(".td-bouton", { hasText: "Fantassins" }).click();
  bilan.bataille = await page.evaluate(() => ({ tours: JEU.bataille.enCours.tours.length, envois: JEU.bataille.enCours.envois.length }));
  await page.keyboard.press("Enter");
  await page.waitForFunction(() => JEU.bataille.enCours.phase === "vague");
  // la vague se joue en temps réel : on avance l'horloge du navigateur
  for (let k = 0; k < 200 && await page.evaluate(() => JEU.bataille.enCours.phase === "vague"); k++) await page.clock.runFor(500);
  bilan.apresVague = await page.evaluate(() => ({ phase: JEU.bataille.enCours.phase, vague: JEU.bataille.enCours.vague, chateau: JEU.bataille.enCours.chateau.pv }));
  // quitter avec Échap : confirmation dans la page, les coups portés restent
  await page.keyboard.press("Escape");
  await page.waitForSelector(".confirmation");
  await page.click(".confirmation .bouton.principal");
  await page.waitForFunction(() => !JEU.partie && JEU.ui.ecranCourant() === "jouer");
  bilan.quitter = "ok";

  // 2. conseil du royaume : toutes les affirmations jugées justes, décisions à droite
  await page.evaluate(() => JEU.conseil.lancer());
  for (let i = 0; i < 12; i++) {
    await page.waitForSelector(".carte-conseil, .scene-conseil .bilan");
    if (await page.$(".scene-conseil .bilan")) break;
    if (await page.$(".carte-conseil.decision")) { await page.keyboard.press("ArrowRight"); await page.waitForSelector(".carte-conseil.decision", { state: "detached" }); continue; }
    const q = await page.evaluate(() => {
      const t = document.querySelector(".carte-conseil .affirmation").textContent.replace(/^« | »$/g, "");
      const tout = [];
      Object.keys(JEU.donnees.cours).forEach(c => JEU.questions.questionsDuCours(c).forEach(x => { if (x.enonce === t) tout.push(x); }));
      return { reponse: tout[0].reponse, corrections: tout[0].corrections };
    });
    await page.keyboard.press(q.reponse.vrai ? "ArrowRight" : "ArrowLeft");
    if (!q.reponse.vrai) await page.keyboard.press(String(q.corrections.indexOf(q.reponse.correction) + 1));
  }
  await page.waitForSelector(".scene-conseil .bilan");
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

  // 5. mesure : temps entre une réponse et la question suivante
  const v = await page.evaluate(() => JEU.mesure.valeurs.slice(0, 50));
  if (process.env.DETAIL) console.log(v.map(x => Math.round(x)).join(" "));
  bilan.mesures = v.length;
  bilan.moyenne_ms = Math.round(v.reduce((a, b) => a + b, 0) / v.length * 10) / 10;
  bilan.max_ms = Math.round(Math.max(...v) * 10) / 10;
  bilan.ressources = await page.evaluate(() => JEU.sauvegarde.etat().ressources);
  bilan.erreursJS = erreurs;
  console.log(JSON.stringify(bilan, null, 1));
  await navigateur.close();
  process.exit(erreurs.length || bilan.max_ms >= 100 || !bilan.importIdentique ? 1 : 0);
})();
