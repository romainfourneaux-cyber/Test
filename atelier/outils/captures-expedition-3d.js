// Captures de l'écran des expéditions habillé des images rendues en 3D (28/10/2026) : carte de la campagne, départ, Armorial,
// page de semaine, route, porte (question puis cartes), route scellée, marchand, bivouac, faveurs tenues, bilan, puis la route
// et les cartes en repli (dossier d'images renommé le temps de la capture). Les haltes sont avancées par l'API du jeu, pas en
// jouant les batailles (c'est atelier/outils/essai-expedition.js et perf.js qui les jouent). Aucune erreur JavaScript attendue.
// Usage : NODE_PATH=/opt/node22/lib/node_modules CHROMIUM=/opt/pw-browsers/chromium node atelier/outils/captures-expedition-3d.js
// Captures dans atelier/captures/expedition-3d-*.png, en 1366 × 768 (et la route en 1920 × 1080).
"use strict";
const path = require("path"), fs = require("fs");
let chromium;
try { ({ chromium } = require("playwright")); } catch (e) { console.log("Playwright n'est pas installé : captures impossibles."); process.exit(0); }
const RACINE = path.join(__dirname, "..", "..");
const URL = "file://" + path.join(RACINE, "jeu", "index.html").replace(/\\/g, "/");
const CAPTURES = path.join(__dirname, "..", "captures");
const DOSSIER = path.join(RACINE, "jeu", "assets", "images", "expedition"), DOSSIER_CACHE = DOSSIER + "-hors-ligne";
const attendre = ms => new Promise(r => setTimeout(r, ms));
const echecs = [], notes = {};

async function capture(page, nom) { await attendre(400); await page.screenshot({ path: path.join(CAPTURES, "expedition-3d-" + nom + ".png"), fullPage: false }); console.log("capture " + nom); }
// Compte les images rendues en place et celles retirées (repli) : img HTML chargées, image SVG présentes.
async function bilanImages(page) {
  return page.evaluate(() => {
    const imgs = [...document.querySelectorAll("#ecran-expedition img.img-exp")], svg = document.querySelectorAll("#ecran-expedition image.img-exp").length;
    return { img: imgs.length, imgOk: imgs.filter(i => i.complete && i.naturalWidth > 0).length, svg, cadre: document.querySelectorAll("#ecran-expedition .exp-fenetre.cadre-image").length, enveloppes: document.querySelectorAll("#ecran-expedition .image").length };
  });
}
async function nouvellePage(navigateur, w, h) {
  const page = await navigateur.newPage({ viewport: { width: w, height: h } });
  page.on("pageerror", e => echecs.push("erreur JS : " + e.message));
  page.on("console", m => { if (m.type() === "error") echecs.push("console : " + m.text()); });
  await page.goto(URL);
  await page.waitForSelector("#menu button[data-ecran=jouer]");
  await page.evaluate(() => { JEU.ui.fermerModale(); });
  return page;
}
// Avance la route par l'API jusqu'à ce qu'une halte atteignable vérifie le critère (en jouant les autres sans bataille réelle).
const avancerJusqua = `function (pred) {
  const X = JEU.expedition; let n = 0;
  while (n++ < 14) {
    const att = X.atteignables(), h = att.find(pred); if (h) return h.id;
    const a = att.find(x => x.type !== "grand") || att[0]; if (!a) return null;
    X.entrer(a.id);
    if (X.EXP.BATAILLES.indexOf(a.type) >= 0) X.apresBataille(a, { issue: "tenu", degatsRival: 3, bonnes: 3, total: 3, entamee: true }); else X.terminerHalte(a.id);
  }
  return null;
}`;

async function parcours(navigateur) {
  const page = await nouvellePage(navigateur, 1366, 768);
  // 1. la carte « Partir en expédition » de la campagne
  await page.click("#menu button[data-ecran=jouer]");
  await page.waitForSelector("#ecran-jouer .grille-jeux");
  await page.evaluate(() => { JEU.ui.fermerModale(); const c = [...document.querySelectorAll(".carte-jeu")].find(x => /expédition/i.test(x.textContent)); c.scrollIntoView({ block: "center" }); }); // les missives du jour sont fermées
  await capture(page, "01-campagne");
  notes.carte = await page.evaluate(() => { const c = [...document.querySelectorAll(".carte-jeu .illustration")].find(x => /ill-relais/.test(x.className)); return c ? getComputedStyle(c).backgroundImage.slice(0, 90) : null; });
  // 2. le départ
  await page.evaluate(() => { [...document.querySelectorAll(".carte-jeu")].find(x => /expédition/i.test(x.textContent)).click(); });
  await page.waitForSelector("#ecran-expedition .parchemin-annee");
  await page.evaluate(() => { const x = JEU.expedition.etat(); x.franchies = [1, 2]; x.renom = 120; x.renomTotal = 160; x.armorial.bourse = 1; x.armorial.murs = 1; JEU.sauvegarde.enregistrer(); JEU.ui.afficher("expedition"); });
  await page.waitForSelector("#ecran-expedition .parchemin-annee");
  await capture(page, "02-depart");
  notes.depart = await bilanImages(page);
  // 3. l'Armorial
  await page.keyboard.press("a");
  await page.waitForSelector("#ecran-expedition .exp-fenetre.armorial");
  await capture(page, "03-armorial");
  notes.armorial = await bilanImages(page);
  await page.keyboard.press("Escape");
  await page.waitForSelector("#ecran-expedition .parchemin-annee");
  // 4. partir : page de semaine, puis la route (une route dont la première semaine a une porte de faveur, un marchand et un bivouac)
  let convient = false;
  for (let n = 0; n < 20 && !convient; n++) {
    await page.keyboard.press("Enter");
    await page.waitForSelector("#ecran-expedition .page-semaine");
    convient = await page.evaluate(() => { const a = JEU.expedition.enCours().route.actes[0], h = a.couches.reduce((t, c) => t.concat(c), []);
      return h.some(x => x.porte && x.porte.genre === "faveur" && JEU.expedition.EXP.BATAILLES.indexOf(x.type) >= 0) && h.some(x => x.type === "marchand") && h.some(x => x.type === "bivouac"); });
    if (!convient) { await page.evaluate(() => { JEU.expedition.finir("abandon"); JEU.ecranExpedition.etat.bilan = null; JEU.ui.afficher("expedition"); }); await page.waitForSelector("#ecran-expedition .parchemin-annee"); }
  }
  if (!convient) echecs.push("aucune route avec porte de faveur, marchand et bivouac en première semaine (20 tirages)");
  await capture(page, "04-semaine");
  notes.semaine = await bilanImages(page);
  await page.keyboard.press("Enter");
  await page.waitForSelector("#ecran-expedition .route-svg");
  await capture(page, "05-route");
  notes.route = await bilanImages(page);
  notes.routeFond = await page.evaluate(() => { const i = document.querySelector(".route-svg image.fond"); return i ? i.getAttribute("href") : null; });
  // 5. une bataille de route à porte de faveur, gagnée par l'API : la question de la porte, puis les cartes
  const idPorte = await page.evaluate("(" + avancerJusqua + ")(x => x.porte && x.porte.genre === 'faveur' && JEU.expedition.EXP.BATAILLES.indexOf(x.type) >= 0)");
  if (!idPorte) echecs.push("aucune halte à porte de faveur atteignable");
  else {
    await page.evaluate(id => { const X = JEU.expedition, t = X.trouverHalte(id, X.enCours()); X.entrer(id);
      const res = X.apresBataille(t.halte, { issue: "tenu", degatsRival: 3, bonnes: 3, total: 3, entamee: true });
      if (res && res.porte) { const off = X.offrirFaveurs(res.porte, true, false); if (off && off.cartes.length) { off.question = true; JEU.sauvegarde.enregistrer(); } }
      JEU.ui.afficher("expedition"); }, idPorte);
    await page.waitForSelector("#ecran-expedition .porte .question .enonce, #ecran-expedition button.carte-faveur", { timeout: 10000 });
    await capture(page, "06-porte-question");
    await page.evaluate(() => { const off = JEU.expedition.enCours().offre; if (off) { off.question = false; JEU.sauvegarde.enregistrer(); } JEU.ui.afficher("expedition"); });
    await page.waitForSelector("#ecran-expedition button.carte-faveur");
    await capture(page, "07-porte-cartes");
    notes.cartes = await bilanImages(page);
    notes.cartesGeometrie = await page.evaluate(() => { const b = document.querySelector(".exp-fenetre.cartes").getBoundingClientRect(), c = [...document.querySelectorAll("button.carte-faveur")].map(x => x.getBoundingClientRect().top);
      const rangees = c.reduce((r, t) => (r.some(y => Math.abs(y - t) < 12) ? r : r.concat([t])), []).length; // une carte en relief (focus) remonte de 4 px
      return { haut: Math.round(b.top), bas: Math.round(b.bottom), largeur: Math.round(b.width), cartes: c.length, rangees, vue: innerHeight }; });
    await page.keyboard.press("1");
    await page.waitForSelector("#ecran-expedition .route-svg");
    await capture(page, "08-route-scellee");
    notes.routeScellee = await bilanImages(page);
  }
  // 6. le marchand (étal ouvert sans question : remise déjà notée), puis le bivouac
  const idMarchand = await page.evaluate("(" + avancerJusqua + ")(x => x.type === 'marchand')");
  if (idMarchand) {
    await page.evaluate(id => { JEU.expedition.ouvrirEtal(id, true); JEU.ui.afficher("expedition"); }, idMarchand); // l'étal est déjà ouvert avec remise : pas de question
    await page.waitForSelector("#ecran-expedition .route-svg");
    await page.click(".route-svg .halte.atteignable[data-id='" + idMarchand + "']");
    await page.waitForSelector("#ecran-expedition .etal");
    await capture(page, "09-marchand");
    await page.keyboard.press("Escape");
    await page.waitForSelector("#ecran-expedition .route-svg");
  } else echecs.push("aucun marchand atteignable");
  const idBivouac = await page.evaluate("(" + avancerJusqua + ")(x => x.type === 'bivouac')");
  if (idBivouac) {
    await page.evaluate(() => JEU.ui.afficher("expedition"));
    await page.waitForSelector("#ecran-expedition .route-svg");
    await page.click(".route-svg .halte.atteignable[data-id='" + idBivouac + "']");
    await page.waitForSelector("#ecran-expedition .choix-bivouac");
    await capture(page, "10-bivouac");
    await page.keyboard.press("1");
    await page.waitForSelector("#ecran-expedition .route-svg");
  } else echecs.push("aucun bivouac atteignable");
  // 7. les faveurs tenues (F), avec une seconde faveur de rang 2 posée par l'API pour voir l'argent
  await page.evaluate(() => { const e = JEU.expedition.enCours(); if (!e.faveurs.some(f => f.id === "eclaireurs")) e.faveurs.push({ id: "eclaireurs", rang: 2 }); JEU.sauvegarde.enregistrer(); JEU.ui.afficher("expedition"); });
  await page.waitForSelector("#ecran-expedition .route-svg");
  await page.keyboard.press("f");
  await page.waitForSelector("#ecran-expedition .liste-faveurs");
  await capture(page, "11-faveurs");
  notes.faveurs = await bilanImages(page);
  await page.keyboard.press("Escape");
  await page.waitForSelector("#ecran-expedition .route-svg");
  // la route au clavier : la halte en relief (focus visible)
  await page.keyboard.press("ArrowRight");
  await capture(page, "12-route-clavier");
  // 8. le bilan (camp levé par l'API)
  await page.evaluate(() => { const b = JEU.expedition.finir("abandon"); JEU.ecranExpedition.etat.bilan = b; JEU.ui.afficher("expedition"); });
  await page.waitForSelector("#ecran-expedition .bilan-exp");
  await capture(page, "13-bilan");
  notes.bilan = await bilanImages(page);
  await page.close();
  // 9. la route en 1920 × 1080
  const grande = await nouvellePage(navigateur, 1920, 1080);
  await grande.click("#menu button[data-ecran=jouer]");
  await grande.waitForSelector("#ecran-jouer .grille-jeux");
  await grande.evaluate(() => { JEU.ui.fermerModale(); JEU.ui.afficher("expedition"); });
  await grande.waitForSelector("#ecran-expedition .parchemin-annee");
  await grande.keyboard.press("Enter");
  await grande.waitForSelector("#ecran-expedition .page-semaine");
  await grande.keyboard.press("Enter");
  await grande.waitForSelector("#ecran-expedition .route-svg");
  // joue la première semaine jusqu'au gardien compris : sceaux, semaine franchie, deuxième semaine courante
  const idGardien = await grande.evaluate("(" + avancerJusqua + ")(x => x.type === 'gardien')");
  await grande.evaluate(id => { const X = JEU.expedition, e = X.enCours(); if (id) { const t = X.trouverHalte(id, e); X.entrer(id); X.apresBataille(t.halte, { issue: "tenu", degatsRival: 9, bonnes: 3, total: 3, entamee: true }); }
    const e2 = X.enCours(); if (e2) JEU.ecranExpedition.etat.pageVue = e2.semaine; JEU.ui.afficher("expedition"); }, idGardien);
  await grande.waitForSelector("#ecran-expedition .route-svg");
  await capture(grande, "14-route-1920");
  notes.route1920 = await bilanImages(grande);
  await grande.close();
}

// Repli : le dossier des images est renommé le temps d'une page ; chaque image retirée doit laisser le dessin.
async function repli(navigateur) {
  fs.renameSync(DOSSIER, DOSSIER_CACHE);
  try {
    const page = await nouvellePage(navigateur, 1366, 768);
    await page.click("#menu button[data-ecran=jouer]");
    await page.waitForSelector("#ecran-jouer .grille-jeux");
    await page.evaluate(() => { JEU.ui.fermerModale(); const x = JEU.expedition.etat(); x.franchies = [1]; x.armorial.bourse = 1; JEU.sauvegarde.enregistrer(); JEU.ui.afficher("expedition"); });
    await page.waitForSelector("#ecran-expedition .parchemin-annee");
    await attendre(600);
    notes.repliDepart = await bilanImages(page);
    await capture(page, "15-repli-depart");
    await page.keyboard.press("Enter");
    await page.waitForSelector("#ecran-expedition .page-semaine");
    await page.keyboard.press("Enter");
    await page.waitForSelector("#ecran-expedition .route-svg");
    const id = await page.evaluate("(" + avancerJusqua + ")(x => x.porte && x.porte.genre === 'faveur' && JEU.expedition.EXP.BATAILLES.indexOf(x.type) >= 0)");
    if (id) await page.evaluate(id => { const X = JEU.expedition, t = X.trouverHalte(id, X.enCours()); X.entrer(id);
      const res = X.apresBataille(t.halte, { issue: "tenu", degatsRival: 3, bonnes: 3, total: 3, entamee: true });
      if (res && res.porte) { const off = X.offrirFaveurs(res.porte, true, false); if (off && off.cartes.length) { off.question = false; JEU.sauvegarde.enregistrer(); } } }, id);
    await page.evaluate(() => JEU.ui.afficher("expedition"));
    await page.waitForSelector("#ecran-expedition button.carte-faveur, #ecran-expedition .route-svg");
    await attendre(600);
    notes.repliCartes = await bilanImages(page);
    await capture(page, "16-repli-cartes");
    await page.keyboard.press("1").catch(() => {});
    await page.waitForSelector("#ecran-expedition .route-svg");
    await attendre(600);
    notes.repliRoute = await bilanImages(page);
    await capture(page, "17-repli-route");
    if (notes.repliRoute.svg || notes.repliRoute.imgOk || notes.repliRoute.enveloppes) echecs.push("repli : des images rendues restent en place sans fichier (" + JSON.stringify(notes.repliRoute) + ")");
    await page.close();
  } finally { fs.renameSync(DOSSIER_CACHE, DOSSIER); }
}

(async () => {
  const navigateur = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
  try { await parcours(navigateur); await repli(navigateur); }
  catch (e) { echecs.push("arrêt : " + (e && e.stack || e)); }
  await navigateur.close();
  console.log(JSON.stringify(notes, null, 1));
  echecs.forEach(m => console.log("ÉCHEC  " + m));
  process.exit(echecs.length ? 1 : 0);
})();
