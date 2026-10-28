// Revue visuelle des graphismes rendus en 3D du mode Expéditions (28/10/2026) : le parcours complet est rejoué dans Chromium,
// en 1366 × 768 puis en 1920 × 1080, et chaque écran est capturé pour être regardé : carte « Partir en expédition », départ
// (haut et bas), Armorial (puis quartiers achetés par l'API), page de semaine, route, escarmouche jouée en vrai (conseil,
// vague, fin), porte de faveur (question puis cartes), route scellée, marchand, bivouac, faveurs tenues, retour à la
// campagne puis « Reprendre », réglages « Animations » et « Sang » coupés, défaite forcée (vague puis bilan), route de la
// deuxième semaine (sceaux, brume), puis le repli sans manifeste (images.js renommé le temps d'une page : le SVG seul).
// Aucune erreur JavaScript attendue (hors le script manquant pendant le repli).
// Usage : NODE_PATH=/opt/node22/lib/node_modules CHROMIUM=/opt/pw-browsers/chromium node atelier/outils/captures-expedition-revue.js [1366|1920|repli]
// Captures dans atelier/captures/expedition-revue-<numéro>-<nom>[-1920].png.
"use strict";
const path = require("path"), fs = require("fs");
let chromium;
try { ({ chromium } = require("playwright")); } catch (e) { console.log("Playwright n'est pas installé : captures impossibles."); process.exit(0); }
const RACINE = path.join(__dirname, "..", "..");
const URL = "file://" + path.join(RACINE, "jeu", "index.html").replace(/\\/g, "/");
const CAPTURES = path.join(__dirname, "..", "captures");
const MANIFESTE = path.join(RACINE, "jeu", "assets", "images", "expedition", "images.js"), MANIFESTE_CACHE = MANIFESTE + ".hors-ligne";
const attendre = ms => new Promise(r => setTimeout(r, ms));
const echecs = [], notes = {};
let enRepli = false, suffixe = "";

async function capture(page, nom) { await attendre(450); const f = "expedition-revue-" + nom + suffixe + ".png"; await page.screenshot({ path: path.join(CAPTURES, f), fullPage: false }); console.log("capture " + f); }
async function bilanImages(page) {
  return page.evaluate(() => {
    const imgs = [...document.querySelectorAll("#ecran-expedition img.img-exp")], svg = document.querySelectorAll("#ecran-expedition image.img-exp").length;
    return { img: imgs.length, imgOk: imgs.filter(i => i.complete && i.naturalWidth > 0).length, svg, cadre: document.querySelectorAll("#ecran-expedition .exp-fenetre.cadre-image").length };
  });
}
async function nouvellePage(navigateur, w, h) {
  const page = await navigateur.newPage({ viewport: { width: w, height: h } });
  page.on("pageerror", e => echecs.push("erreur JS (" + suffixe + ") : " + e.message));
  page.on("console", m => { if (m.type() === "error" && !(enRepli && /ERR_FILE_NOT_FOUND/.test(m.text()))) echecs.push("console (" + suffixe + ") : " + m.text()); });
  await page.goto(URL);
  await page.waitForFunction(() => window.JEU && JEU.pret);
  await page.evaluate(() => { JEU.ui.fermerModale(); });
  return page;
}
// ---- jouer une question (repris de perf.js) ----
async function rangAffiche(page, texte) {
  return page.evaluate(t => { const b = [...document.querySelectorAll(".reponses button.choix[data-n]")].find(x => x.lastElementChild.textContent === t); return b ? Number(b.dataset.n) : 0; }, texte);
}
async function repondreJuste(page) {
  const q = await page.evaluate(() => { const q = JEU.ui.questionCourante; return { type: q.type, reponse: q.reponse, choix: q.choix }; });
  const k = n => page.keyboard.press(String(n));
  switch (q.type) {
    case "qcm": await k(await rangAffiche(page, q.reponse)); break;
    case "qcm_multiple": for (const c of q.reponse) await k(await rangAffiche(page, c)); await page.keyboard.press("Enter"); break;
    case "vrai_faux":
      if (q.reponse.vrai) await k(1);
      else { await k(2); const n = await page.evaluate(t => { const b = [...document.querySelectorAll(".reponses button.choix[data-n]")].find(x => x.lastElementChild.textContent === t); return b ? Number(b.dataset.n) : 0; }, q.reponse.correction); await k(n); }
      break;
    case "ordre": for (const i of q.reponse) await k(i + 1); await page.keyboard.press("Enter"); break;
    case "association": for (const [g, d] of q.reponse) { await k(g + 1); await page.locator(".association .colonne").nth(1).locator(".choix").nth(d).click(); } await page.keyboard.press("Enter"); break;
    case "trou": await page.evaluate(r => { document.querySelectorAll(".trou").forEach((c, i) => { c.value = Array.isArray(r[i]) ? r[i][0] : r[i]; }); }, q.reponse); await page.keyboard.press("Enter"); break;
  }
}
// Avance la route par l'API jusqu'à ce qu'une halte atteignable vérifie le critère (les autres sont jouées sans bataille réelle).
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
// Joue une bataille de route jusqu'au bout (réponses justes), avec des captures : le conseil (première question), la vague
// (troupes engagées), la fin. Rend le nombre de questions jouées.
async function jouerBataille(page, prefixe, options) {
  options = options || {};
  let garde = 0, questions = 0, vagueVue = -1, capConseil = false, capFin = false, capVagues = 0;
  await page.waitForFunction(() => document.querySelector(".td-question .question"), null, { timeout: 30000 });
  while (garde++ < 400) {
    const etat = await page.evaluate(() => ({ partie: !!JEU.partie, phase: JEU.bataille.enCours && JEU.bataille.enCours.phase, vague: JEU.bataille.enCours && JEU.bataille.enCours.vague,
      question: !!document.querySelector(".td-question .question .enonce") && !document.querySelector(".panneau-erreur"), erreur: !!document.querySelector(".panneau-erreur"),
      bilan: !!document.querySelector(".td-conseil .bilan"), pret: !!document.querySelector(".td-pret"), engages: JEU.bataille.enCours ? JEU.bataille.enCours.unites.filter(u => u.adversaire).length : 0 }));
    if (!etat.partie) break;
    if (etat.bilan) { if (!capFin) { await capture(page, prefixe + "-fin"); capFin = true; } await attendre(300); await page.keyboard.press("Enter"); await attendre(300); continue; }
    if (etat.erreur) { await page.keyboard.press("Enter"); await attendre(150); continue; }
    if (etat.question) {
      if (etat.vague !== vagueVue) vagueVue = etat.vague;
      await attendre(300);
      if (!capConseil) { await capture(page, prefixe + "-conseil"); capConseil = true; }
      await repondreJuste(page); questions++;
      await attendre(300);
      continue;
    }
    if (etat.phase === "preparation" && etat.pret) { await attendre(600); await page.keyboard.press("Enter"); await attendre(400); continue; }
    if (etat.phase === "vague") {
      if (capVagues <= etat.vague) {
        await attendre(1500);
        await capture(page, prefixe + "-vague" + (etat.vague + 1)); capVagues = etat.vague + 1;
        if (options.quitterApresVague) { await page.keyboard.press("Escape"); await page.waitForSelector(".confirmation"); await capture(page, prefixe + "-quitter"); await page.click(".confirmation .bouton.principal"); return questions; }
      }
      await attendre(300); continue;
    }
    await attendre(300);
  }
  return questions;
}

async function parcours(navigateur, w, h) {
  suffixe = w === 1920 ? "-1920" : "";
  const page = await nouvellePage(navigateur, w, h);
  // 1. la carte « Partir en expédition » de la campagne
  await page.click("#menu button[data-ecran=jouer]");
  await page.waitForSelector("#ecran-jouer .grille-jeux");
  await page.evaluate(() => { JEU.ui.fermerModale(); const c = [...document.querySelectorAll(".carte-jeu")].find(x => /expédition/i.test(x.textContent)); c.scrollIntoView({ block: "center" }); });
  await capture(page, "01-campagne");
  // 2. le départ : deux semaines franchies, de la renommée, deux quartiers déjà achetés
  await page.evaluate(() => { [...document.querySelectorAll(".carte-jeu")].find(x => /expédition/i.test(x.textContent)).click(); });
  await page.waitForSelector("#ecran-expedition .parchemin-annee");
  await page.evaluate(() => { const x = JEU.expedition.etat(); x.franchies = [1, 2]; x.renom = 260; x.renomTotal = 300; x.armorial.bourse = 1; x.armorial.murs = 1; JEU.sauvegarde.enregistrer(); JEU.ui.afficher("expedition"); });
  await page.waitForSelector("#ecran-expedition .parchemin-annee");
  await capture(page, "02-depart");
  notes["depart" + suffixe] = await bilanImages(page);
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await capture(page, "03-depart-bas");
  await page.evaluate(() => window.scrollTo(0, 0));
  // 3. l'Armorial, puis des rangs mêlés posés par l'API (vivres complet, bourse 2 sur 3, murs 1, ouverture complet, bannière 0)
  await page.keyboard.press("a");
  await page.waitForSelector("#ecran-expedition .exp-fenetre.armorial");
  await capture(page, "04-armorial");
  notes["armorial" + suffixe] = await page.evaluate(() => [...document.querySelectorAll(".exp-fenetre.armorial .ecu-armorial image.img-exp")].map(i => i.getAttribute("href").replace(/.*\//, "") + "@" + (i.getAttribute("opacity") || 1)));
  await page.evaluate(() => { const A = JEU.expedition.armorial; A.acheter("vivres"); A.acheter("vivres"); A.acheter("bourse"); A.acheter("ouverture"); JEU.sauvegarde.enregistrer(); });
  await page.keyboard.press("Escape");
  await page.waitForSelector("#ecran-expedition .parchemin-annee");
  await page.keyboard.press("a");
  await page.waitForSelector("#ecran-expedition .exp-fenetre.armorial");
  await capture(page, "05-armorial-achats");
  notes["armorialAchats" + suffixe] = await page.evaluate(() => ({ rangs: Object.assign({}, JEU.expedition.etat().armorial), couches: [...document.querySelectorAll(".exp-fenetre.armorial .ecu-armorial image.img-exp")].map(i => i.getAttribute("href").replace(/.*\//, "") + "@" + (i.getAttribute("opacity") || 1)) }));
  await page.keyboard.press("Escape");
  await page.waitForSelector("#ecran-expedition .parchemin-annee");
  // 4. partir : une route dont la première couche a une escarmouche à porte de faveur, et qui compte un marchand et un bivouac
  let convient = false;
  for (let n = 0; n < 24 && !convient; n++) {
    await page.keyboard.press("Enter");
    await page.waitForSelector("#ecran-expedition .page-semaine");
    convient = await page.evaluate(() => { const a = JEU.expedition.enCours().route.actes[0], h = a.couches.reduce((t, c) => t.concat(c), []);
      return a.couches[0].some(x => x.type === "escarmouche" && x.porte && x.porte.genre === "faveur") && h.some(x => x.type === "marchand") && h.some(x => x.type === "bivouac"); });
    if (!convient) { await page.evaluate(() => { JEU.expedition.finir("abandon"); JEU.ecranExpedition.etat.bilan = null; JEU.ui.afficher("expedition"); }); await page.waitForSelector("#ecran-expedition .parchemin-annee"); }
  }
  if (!convient) echecs.push("aucune route convenable en 24 tirages (" + suffixe + ")");
  await capture(page, "06-semaine");
  await page.keyboard.press("Enter");
  await page.waitForSelector("#ecran-expedition .route-svg");
  await capture(page, "07-route");
  notes["route" + suffixe] = await bilanImages(page);
  // la route au clavier : la halte en relief (focus visible)
  await page.keyboard.press("ArrowRight");
  await capture(page, "08-route-clavier");
  // 5. l'escarmouche à porte de faveur, jouée en vrai (vitesse ×3) : conseil, vague, fin ; puis la porte : question et cartes
  const iE = await page.evaluate(() => JEU.expedition.atteignables().findIndex(x => x.type === "escarmouche" && x.porte && x.porte.genre === "faveur"));
  await page.evaluate(() => JEU.expedition.vitesse(3));
  await page.keyboard.press(String(iE + 1));
  notes["escarmouche" + suffixe] = await jouerBataille(page, "09-escarmouche");
  await page.waitForSelector("#ecran-expedition .porte .question .enonce, #ecran-expedition button.carte-faveur", { timeout: 15000 });
  await capture(page, "10-porte-question");
  if (await page.$("#ecran-expedition .porte .question .enonce")) {
    await repondreJuste(page); await attendre(250);
    if (await page.$(".panneau-erreur")) { await page.keyboard.press("Enter"); await attendre(250); }
  }
  await page.waitForSelector("#ecran-expedition button.carte-faveur");
  await capture(page, "11-porte-cartes");
  notes["cartes" + suffixe] = await page.evaluate(() => { const b = document.querySelector(".exp-fenetre.cartes").getBoundingClientRect(), c = [...document.querySelectorAll("button.carte-faveur")];
    return { haut: Math.round(b.top), bas: Math.round(b.bottom), largeur: Math.round(b.width), vue: innerHeight, cartes: c.length, medaillons: c.map(x => { const m = x.querySelector(".faveur-med"); return m ? Math.round(m.getBoundingClientRect().width) : 0; }) }; });
  await page.keyboard.press("ArrowRight"); await attendre(100);
  await capture(page, "12-porte-cartes-focus");
  await page.keyboard.press("1");
  await page.waitForSelector("#ecran-expedition .route-svg");
  await capture(page, "13-route-scellee");
  // 6. le marchand (étal ouvert avec la remise : pas de question), puis le bivouac
  const idMarchand = await page.evaluate("(" + avancerJusqua + ")(x => x.type === 'marchand')");
  if (idMarchand) {
    await page.evaluate(id => { JEU.expedition.ouvrirEtal(id, true); JEU.ui.afficher("expedition"); }, idMarchand);
    await page.waitForSelector("#ecran-expedition .route-svg");
    await page.click(".route-svg .halte.atteignable[data-id='" + idMarchand + "']");
    await page.waitForSelector("#ecran-expedition .etal");
    await capture(page, "14-marchand");
    await page.keyboard.press("Escape");
    await page.waitForSelector("#ecran-expedition .route-svg");
  } else echecs.push("aucun marchand atteignable (" + suffixe + ")");
  const idBivouac = await page.evaluate("(" + avancerJusqua + ")(x => x.type === 'bivouac')");
  if (idBivouac) {
    await page.evaluate(() => JEU.ui.afficher("expedition"));
    await page.waitForSelector("#ecran-expedition .route-svg");
    await page.click(".route-svg .halte.atteignable[data-id='" + idBivouac + "']");
    await page.waitForSelector("#ecran-expedition .choix-bivouac");
    await capture(page, "15-bivouac");
    await page.keyboard.press("1");
    await page.waitForSelector("#ecran-expedition .route-svg");
  } else echecs.push("aucun bivouac atteignable (" + suffixe + ")");
  // 7. les faveurs tenues (F), avec une faveur rare posée par l'API pour voir l'argent, et un plan de bataille
  await page.evaluate(() => { const e = JEU.expedition.enCours(); if (!e.faveurs.some(f => f.id === "eclaireurs")) e.faveurs.push({ id: "eclaireurs", rang: 2 }); e.plan = 25; e.espion = true; JEU.sauvegarde.enregistrer(); JEU.ui.afficher("expedition"); });
  await page.waitForSelector("#ecran-expedition .route-svg");
  await capture(page, "16-route-compagnie");
  await page.keyboard.press("f");
  await page.waitForSelector("#ecran-expedition .liste-faveurs");
  await capture(page, "17-faveurs");
  await page.keyboard.press("Escape");
  await page.waitForSelector("#ecran-expedition .route-svg");
  // 8. retour à la campagne (Échap) : la carte « Reprendre », puis la reprise au même point
  await page.keyboard.press("Escape");
  await page.waitForFunction(() => JEU.ui.ecranCourant() === "jouer");
  await page.evaluate(() => { JEU.ui.fermerModale(); const c = [...document.querySelectorAll(".carte-jeu")].find(x => /Reprendre/.test(x.textContent)); if (c) c.scrollIntoView({ block: "center" }); });
  await capture(page, "18-campagne-reprise");
  notes["reprise" + suffixe] = await page.evaluate(() => { const b = [...document.querySelectorAll(".carte-jeu h2")].find(x => /expédition/i.test(x.textContent)); return b ? b.textContent : null; });
  await page.evaluate(() => { JEU.ui.fermerModale(); [...document.querySelectorAll(".carte-jeu")].find(x => /Reprendre/.test(x.textContent)).click(); });
  await page.waitForSelector("#ecran-expedition .route-svg");
  await capture(page, "19-route-reprise");
  // 9. « Animations » et « Sang » coupés : la route, la liste des faveurs ; puis la défaite forcée avec ces réglages
  await page.evaluate(() => { const r = JEU.sauvegarde.etat().reglages; r.sang = false; r.animations = false; JEU.sauvegarde.enregistrer(); JEU.ui.appliquerAnimations(); JEU.ui.afficher("expedition"); });
  await page.waitForSelector("#ecran-expedition .route-svg");
  await capture(page, "20-route-sans-anim");
  await page.keyboard.press("f"); await page.waitForSelector("#ecran-expedition .liste-faveurs");
  await capture(page, "21-faveurs-sans-anim");
  await page.keyboard.press("Escape"); await page.waitForSelector("#ecran-expedition .route-svg");
  // 10. défaite forcée : un seul vivre, une bataille, première vague lancée puis « Quitter » → le bilan
  const bat = await page.evaluate(() => { const X = JEU.expedition, e = X.enCours(); e.vivres = 1; JEU.sauvegarde.enregistrer();
    let n = 0; while (n++ < 6 && !X.atteignables().some(x => X.EXP.BATAILLES.indexOf(x.type) >= 0)) { const h = X.atteignables()[0]; X.entrer(h.id); X.terminerHalte(h.id); }
    JEU.ui.afficher("expedition");
    return X.atteignables().findIndex(x => X.EXP.BATAILLES.indexOf(x.type) >= 0); });
  if (bat < 0) echecs.push("défaite : aucune bataille atteignable (" + suffixe + ")");
  else {
    await page.waitForSelector("#ecran-expedition .route-svg");
    await capture(page, "22-route-dernier-vivre");
    await page.keyboard.press(String(bat + 1));
    await jouerBataille(page, "23-defaite", { quitterApresVague: true });
    await page.waitForSelector("#ecran-expedition .bilan-exp", { timeout: 10000 }).catch(() => echecs.push("défaite : pas de bilan (" + suffixe + ")"));
    await capture(page, "24-bilan-defaite");
    notes["bilan" + suffixe] = await page.evaluate(() => { const b = document.querySelector("#ecran-expedition .bilan-exp"); return b ? { titre: b.querySelector("h1").textContent, renom: (b.textContent.match(/Renommée gagnée : (\d+)/) || [])[1] || null } : null; });
  }
  // 11. réglages remis ; nouvelle expédition jouée par l'API jusqu'au gardien de la première semaine : sceaux, semaine
  //     franchie, deuxième semaine courante, troisième dans la brume
  await page.evaluate(() => { const r = JEU.sauvegarde.etat().reglages; r.sang = true; r.animations = true; JEU.sauvegarde.enregistrer(); JEU.ui.appliquerAnimations(); JEU.ecranExpedition.etat.bilan = null; JEU.ui.afficher("expedition"); });
  await page.waitForSelector("#ecran-expedition .parchemin-annee");
  await capture(page, "25-depart-apres");
  await page.keyboard.press("Enter");
  await page.waitForSelector("#ecran-expedition .page-semaine");
  await page.keyboard.press("Enter");
  await page.waitForSelector("#ecran-expedition .route-svg");
  const idGardien = await page.evaluate("(" + avancerJusqua + ")(x => x.type === 'gardien')");
  await page.evaluate(id => { const X = JEU.expedition, e = X.enCours(); if (id) { const t = X.trouverHalte(id, e); X.entrer(id); X.apresBataille(t.halte, { issue: "tenu", degatsRival: 9, bonnes: 3, total: 3, entamee: true }); }
    const e2 = X.enCours(); if (e2) JEU.ecranExpedition.etat.pageVue = e2.semaine; JEU.ui.afficher("expedition"); }, idGardien);
  await page.waitForSelector("#ecran-expedition .route-svg");
  await capture(page, "26-route-semaine-2");
  notes["semaine2" + suffixe] = await page.evaluate(() => ({ sceaux: document.querySelectorAll(".route-svg .sceau-halte").length, brume: document.querySelectorAll(".route-svg .halte.brume").length, nappes: document.querySelectorAll(".route-svg .brume-bande image").length }));
  // une halte perdue (murs cédés) : le sceau de plomb
  await page.evaluate(() => { const X = JEU.expedition, e = X.enCours(), a = X.atteignables().find(x => X.EXP.BATAILLES.indexOf(x.type) >= 0 && x.type !== "grand");
    if (a) { X.entrer(a.id); X.apresBataille(a, { issue: "retraite", degatsRival: 0, bonnes: 1, total: 3, entamee: true }); } JEU.ui.afficher("expedition"); });
  await page.waitForSelector("#ecran-expedition .route-svg");
  await capture(page, "27-route-murs-cedes");
  await page.close();
}

// Repli sans manifeste : images.js renommé le temps d'une page ; l'écran doit être le SVG d'avant, sans erreur JavaScript.
async function repli(navigateur) {
  suffixe = "-repli";
  fs.renameSync(MANIFESTE, MANIFESTE_CACHE);
  enRepli = true;
  try {
    const page = await nouvellePage(navigateur, 1366, 768);
    notes.repliManifeste = await page.evaluate(() => typeof JEU.imagesExpedition);
    await page.click("#menu button[data-ecran=jouer]");
    await page.waitForSelector("#ecran-jouer .grille-jeux");
    await page.evaluate(() => { JEU.ui.fermerModale(); const x = JEU.expedition.etat(); x.franchies = [1]; x.armorial.bourse = 1; JEU.sauvegarde.enregistrer(); JEU.ui.afficher("expedition"); });
    await page.waitForSelector("#ecran-expedition .parchemin-annee");
    await capture(page, "28-depart");
    notes.repliDepart = await bilanImages(page);
    await page.keyboard.press("a"); await page.waitForSelector("#ecran-expedition .exp-fenetre.armorial");
    await capture(page, "29-armorial");
    await page.keyboard.press("Escape"); await page.waitForSelector("#ecran-expedition .parchemin-annee");
    await page.keyboard.press("Enter");
    await page.waitForSelector("#ecran-expedition .page-semaine");
    await page.keyboard.press("Enter");
    await page.waitForSelector("#ecran-expedition .route-svg");
    await capture(page, "30-route");
    const id = await page.evaluate("(" + avancerJusqua + ")(x => x.porte && x.porte.genre === 'faveur' && (x.type === 'escarmouche' || x.type === 'embuscade'))");
    if (id) await page.evaluate(id => { const X = JEU.expedition, t = X.trouverHalte(id, X.enCours()); X.entrer(id);
      const res = X.apresBataille(t.halte, { issue: "tenu", degatsRival: 3, bonnes: 3, total: 3, entamee: true });
      if (res && res.porte) { const off = X.offrirFaveurs(res.porte, true, false); if (off && off.cartes.length) { off.question = false; JEU.sauvegarde.enregistrer(); } } }, id);
    await page.evaluate(() => JEU.ui.afficher("expedition"));
    await page.waitForSelector("#ecran-expedition button.carte-faveur, #ecran-expedition .route-svg");
    await capture(page, "31-cartes");
    notes.repliCartes = await bilanImages(page);
    await page.keyboard.press("1").catch(() => {});
    await page.waitForSelector("#ecran-expedition .route-svg");
    await capture(page, "32-route-scellee");
    notes.repliRoute = await bilanImages(page);
    [notes.repliDepart, notes.repliCartes, notes.repliRoute].forEach((n, i) => { if (n.svg || n.img || n.cadre) echecs.push("repli " + i + " : des images rendues restent sans manifeste (" + JSON.stringify(n) + ")"); });
    await page.close();
  } finally { enRepli = false; fs.renameSync(MANIFESTE_CACHE, MANIFESTE); }
}

(async () => {
  const navigateur = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
  const quoi = process.argv[2] || "tout";
  try {
    if (quoi === "tout" || quoi === "1366") await parcours(navigateur, 1366, 768);
    if (quoi === "tout" || quoi === "1920") await parcours(navigateur, 1920, 1080);
    if (quoi === "tout" || quoi === "repli") await repli(navigateur);
  } catch (e) { echecs.push("arrêt (" + suffixe + ") : " + (e && e.stack || e)); }
  await navigateur.close();
  console.log(JSON.stringify(notes, null, 1));
  echecs.forEach(m => console.log("ÉCHEC  " + m));
  process.exit(echecs.length ? 1 : 0);
})();
