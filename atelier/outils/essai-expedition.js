// Essai de bout en bout de l'écran des expéditions dans Chromium (Playwright) : départ depuis la carte de campagne, parchemin
// de l'année et Armorial, page de semaine, carte-itinéraire (clavier), quelques haltes jouées (bataille de route et porte de
// faveur, événement, marchand, bivouac), retour à la campagne et reprise, export puis import. Captures d'écran dans
// atelier/captures/expedition-*.png, aucune erreur JavaScript attendue.
// Usage : NODE_PATH=/opt/node22/lib/node_modules CHROMIUM=/opt/pw-browsers/chromium node atelier/outils/essai-expedition.js
"use strict";
const path = require("path"), fs = require("fs");
let chromium;
try { ({ chromium } = require("playwright")); } catch (e) { console.log("Playwright n'est pas installé : essai impossible."); process.exit(0); }
const URL = "file://" + path.join(__dirname, "..", "..", "jeu", "index.html").replace(/\\/g, "/");
const CAPTURES = path.join(__dirname, "..", "captures");
const attendre = ms => new Promise(r => setTimeout(r, ms));
const echecs = [], notes = {};

async function rangAffiche(page, texte) {
  return page.evaluate(t => { const b = [...document.querySelectorAll(".reponses button.choix[data-n]")].find(x => x.lastElementChild.textContent === t); return b ? Number(b.dataset.n) : 0; }, texte);
}
// Répond juste à la question affichée (copie de perf.js).
async function repondreJuste(page) {
  const q = await page.evaluate(() => { const q = JEU.ui.questionCourante; return { type: q.type, reponse: q.reponse, choix: q.choix, corrections: q.corrections, texte: q.texte }; });
  const k = n => page.keyboard.press(String(n));
  switch (q.type) {
    case "qcm": await k(await rangAffiche(page, q.reponse)); break;
    case "qcm_multiple": for (const c of q.reponse) await k(await rangAffiche(page, c)); await page.keyboard.press("Enter"); break;
    case "vrai_faux":
      if (q.reponse.vrai) await k(1);
      else { await k(2); const n = await page.evaluate(t => { const b = [...document.querySelectorAll(".reponses button.choix[data-n]")].find(x => x.lastElementChild.textContent === t); return b ? Number(b.dataset.n) : 0; }, q.reponse.correction); await k(n); }
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
async function questionAffichee(page) { return page.evaluate(() => !!document.querySelector(".question .enonce") && !document.querySelector(".panneau-erreur")); }
async function capture(page, nom) { await attendre(350); await page.screenshot({ path: path.join(CAPTURES, "expedition-" + nom + ".png"), fullPage: false }); }
// Recouvrement des noms des haltes entre eux et avec les médaillons voisins, et plus petite taille de texte à l'écran.
async function controlerCarte(page) {
  return page.evaluate(() => {
    const svg = document.querySelector(".route-svg"); if (!svg) return null;
    const k = svg.getBoundingClientRect().width / 1000;
    const boites = [...svg.querySelectorAll(".halte:not(.brume) .halte-nom")].map(t => { const b = t.getBBox(); return { x: b.x, y: b.y, w: b.width, h: b.height, t: t.textContent }; });
    const chev = [];
    for (let i = 0; i < boites.length; i++) for (let j = i + 1; j < boites.length; j++) {
      const a = boites[i], b = boites[j];
      if (a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h) chev.push(a.t + " / " + b.t);
    }
    const tailles = [...svg.querySelectorAll("text")].map(t => parseFloat(getComputedStyle(t).fontSize) * k);
    const r = svg.getBoundingClientRect();
    return { chevauchements: chev, texteMin: Math.round(Math.min(...tailles) * 10) / 10, bas: Math.round(r.bottom), vue: innerHeight, largeurPage: document.documentElement.scrollWidth, fenetre: innerWidth };
  });
}
// Joue la bataille de route en cours jusqu'au bilan, puis « Continuer la route ».
async function jouerBataille(page) {
  await page.waitForFunction(() => document.querySelector(".td-question .question"), null, { timeout: 20000 });
  let garde = 0;
  while (garde++ < 400) {
    const etat = await page.evaluate(() => ({ partie: !!JEU.partie, phase: JEU.bataille.enCours && JEU.bataille.enCours.phase, question: !!document.querySelector(".td-question .question .enonce"), erreur: !!document.querySelector(".panneau-erreur"), bilan: !!document.querySelector(".td-conseil .bilan") }));
    if (!etat.partie) return;
    if (etat.erreur) { await page.keyboard.press("Enter"); await attendre(120); continue; }
    if (etat.bilan) { await attendre(300); await page.keyboard.press("Enter"); await attendre(300); continue; }
    if (etat.question) { await repondreJuste(page); await attendre(120); continue; }
    if (etat.phase === "preparation") { await attendre(800); await page.keyboard.press("Enter"); await attendre(400); continue; }
    await attendre(500);
  }
  throw new Error("bataille de route sans fin");
}
// Joue un événement (partie de questions) jusqu'au retour.
async function jouerEvenement(page) {
  let garde = 0;
  while (garde++ < 60) {
    const etat = await page.evaluate(() => ({ partie: !!JEU.partie, question: !!document.querySelector(".scene-evenement .question .enonce"), erreur: !!document.querySelector(".panneau-erreur"), bilan: !!document.querySelector(".scene-evenement .bilan") }));
    if (!etat.partie) return;
    if (etat.erreur || etat.bilan) { await page.keyboard.press("Enter"); await attendre(200); continue; }
    if (etat.question) { await repondreJuste(page); await attendre(150); continue; }
    await attendre(200);
  }
  throw new Error("événement sans fin");
}
// Après une halte : la porte de faveur (question puis cartes), la page de semaine, puis la route.
async function finirHalte(page, n) {
  let garde = 0;
  while (garde++ < 40) {
    const etat = await page.evaluate(() => ({ ecran: JEU.ui.ecranCourant(), partie: !!JEU.partie, question: !!document.querySelector("#ecran-expedition .question .enonce") && !document.querySelector(".panneau-erreur"), erreur: !!document.querySelector("#ecran-expedition .panneau-erreur"), cartes: document.querySelectorAll("#ecran-expedition button.carte-faveur").length, page: !!document.querySelector("#ecran-expedition .page-semaine"), route: !!document.querySelector("#ecran-expedition .route-svg"), bilan: !!document.querySelector("#ecran-expedition .bilan-exp") }));
    if (etat.partie) return "partie";
    if (etat.bilan) return "bilan";
    if (etat.route) return "route";
    if (etat.erreur) { await page.keyboard.press("Enter"); await attendre(150); continue; }
    if (etat.cartes) { await capture(page, n + "-porte"); notes.cartes = etat.cartes; await page.keyboard.press("1"); await attendre(200); continue; }
    if (etat.question) { await repondreJuste(page); await attendre(200); continue; }
    if (etat.page) { await capture(page, n + "-semaine"); await page.keyboard.press("Enter"); await attendre(200); continue; }
    await attendre(200);
  }
  return "?";
}

(async () => {
  fs.mkdirSync(CAPTURES, { recursive: true });
  const navigateur = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
  const page = await navigateur.newPage({ viewport: { width: 1366, height: 768 } });
  const erreurs = [];
  page.on("pageerror", e => erreurs.push(e.message));
  page.on("console", m => { if (m.type() === "error") erreurs.push(m.text()); });
  await page.goto(URL);
  await page.waitForFunction(() => window.JEU && JEU.pret);
  // la campagne : la carte « Partir en expédition » et la ligne du cartouche des rivaux
  await page.click("#menu button[data-ecran=jouer]");
  await page.waitForSelector("#ecran-jouer .grille-jeux");
  await page.evaluate(() => JEU.ui.fermerModale()); // les missives de présentation
  notes.carteCampagne = await page.evaluate(() => { const b = [...document.querySelectorAll(".carte-jeu h2")].find(h => /expédition/i.test(h.textContent)); return b ? b.textContent : null; });
  notes.ligneRivaux = await page.evaluate(() => { const p = document.querySelector(".ligne-expeditions"); return p ? p.textContent : null; });
  if (!notes.carteCampagne) echecs.push("carte « Partir en expédition » absente de la grille");
  await capture(page, "0-campagne");
  await page.evaluate(() => { const b = [...document.querySelectorAll(".carte-jeu")].find(x => /expédition/i.test(x.textContent)); b.click(); });
  await page.waitForSelector("#ecran-expedition .parchemin-annee");
  await attendre(250);
  notes.depart = await page.evaluate(() => ({ relais: document.querySelector(".relais-numero").textContent, fronts: document.querySelectorAll(".choix-front").length, largeurPage: document.documentElement.scrollWidth, hauteurPage: document.documentElement.scrollHeight, cases: document.querySelectorAll(".annee-svg .case").length, relaisOuverts: document.querySelectorAll(".annee-svg .case.relais").length, bannieres: document.querySelectorAll(".annee-svg .banniere-cette").length }));
  if (notes.depart.largeurPage > 1366) echecs.push("écran de départ : défilement horizontal (" + notes.depart.largeurPage + " px)");
  await capture(page, "1-depart");
  await page.keyboard.press("ArrowLeft"); await attendre(100);
  notes.relaisApresFleche = await page.evaluate(() => document.querySelector(".relais-numero").textContent);
  await page.keyboard.press("ArrowRight"); await attendre(100);
  await page.keyboard.press("2"); await attendre(100);
  notes.frontChoisi = await page.evaluate(() => { const b = document.querySelector(".choix-front.choisi b"); return b && b.textContent; });
  await page.keyboard.press("1"); await attendre(100);
  await page.keyboard.press("a");
  await page.waitForSelector("#ecran-expedition .armorial");
  notes.armorial = await page.evaluate(() => document.querySelectorAll(".ligne-armorial").length);
  await capture(page, "2-armorial");
  await page.keyboard.press("Escape");
  await page.waitForSelector("#ecran-expedition .parchemin-annee");
  // partir
  await page.keyboard.press("Enter");
  await page.waitForSelector("#ecran-expedition .page-semaine");
  await attendre(200);
  notes.pageSemaine = await page.evaluate(() => ({ titre: document.querySelector(".page-semaine h2").textContent, cours: document.querySelectorAll(".page-semaine .liste-cours-semaine li").length, fenetre: document.querySelector(".ps-fenetre").textContent }));
  await capture(page, "3-semaine");
  await page.keyboard.press("Enter");
  await page.waitForSelector("#ecran-expedition .route-svg");
  await attendre(300);
  notes.route = await controlerCarte(page);
  notes.routeNoeuds = await page.evaluate(() => ({ haltes: document.querySelectorAll(".route-svg .halte").length, atteignables: document.querySelectorAll(".route-svg .halte.atteignable").length, focus: document.activeElement && document.activeElement.getAttribute("data-id"), brume: document.querySelectorAll(".route-svg .brume-bande").length, aria: document.querySelector(".route-svg .halte.atteignable").getAttribute("aria-label") }));
  if (notes.route.chevauchements.length) echecs.push("noms de haltes qui se touchent : " + notes.route.chevauchements.join(" ; "));
  if (notes.route.texteMin < 14) echecs.push("texte de la carte sous 14 px : " + notes.route.texteMin);
  if (notes.route.largeurPage > notes.route.fenetre) echecs.push("route : défilement horizontal");
  await capture(page, "4-route");
  // flèches : le focus passe d'une halte atteignable à l'autre
  await page.keyboard.press("ArrowRight"); await attendre(80);
  notes.focusApresFleche = await page.evaluate(() => document.activeElement && document.activeElement.getAttribute("data-id"));
  await page.evaluate(() => JEU.expedition.vitesse(3));
  // quelques haltes : d'abord une bataille s'il y en a une à portée (pour la porte de faveur), sinon la première
  const joues = [];
  for (let n = 5; n < 10; n++) {
    const att = await page.evaluate(() => JEU.expedition.atteignables().map(h => ({ id: h.id, type: h.type, ev: h.ev })));
    if (!att.length) break;
    let i = att.findIndex(h => h.type === "escarmouche" || h.type === "embuscade");
    if (i < 0 || joues.some(j => /escarmouche|embuscade/.test(j))) i = att.findIndex(h => !joues.some(j => j.indexOf(h.type) === 0)); // varier les types
    if (i < 0) i = 0;
    const h = att[i];
    joues.push(h.type + (h.ev ? ":" + h.ev : ""));
    await page.keyboard.press(String(i + 1));
    await attendre(300);
    if (h.type === "escarmouche" || h.type === "embuscade" || h.type === "gardien" || h.type === "grand") {
      await page.evaluate(() => JEU.ui.fermerModale()); // une missive de défi éventuelle
      await capture(page, n + "-bataille");
      await jouerBataille(page);
    } else if (h.type === "evenement") { await attendre(300); await capture(page, n + "-evenement"); await jouerEvenement(page); }
    else if (h.type === "marchand") {
      await page.waitForFunction(() => document.querySelector("#ecran-expedition .question .enonce") || document.querySelector("#ecran-expedition .etal"));
      if (await questionAffichee(page)) { await repondreJuste(page); await attendre(200); }
      if (await page.evaluate(() => !!document.querySelector(".panneau-erreur"))) { await page.keyboard.press("Enter"); await attendre(200); }
      await page.waitForSelector("#ecran-expedition .etal");
      await capture(page, n + "-marchand");
      notes.etal = await page.evaluate(() => [...document.querySelectorAll(".ligne-etal")].map(b => b.textContent.trim()));
      await page.keyboard.press("Escape");
    } else if (h.type === "bivouac") { await page.waitForSelector(".choix-bivouac"); await capture(page, n + "-bivouac"); await page.keyboard.press("1"); }
    const fin = await finirHalte(page, n);
    notes["halte" + n] = h.type + " → " + fin;
    await attendre(300);
    if (fin === "route") { await capture(page, n + "-route"); const c = await controlerCarte(page); if (c && c.chevauchements.length) echecs.push("noms qui se touchent après la halte " + n + " : " + c.chevauchements.join(" ; ")); }
    if (fin === "bilan") { await capture(page, n + "-bilan"); break; }
    if (joues.length >= 4 && joues.some(j => /escarmouche|embuscade/.test(j))) break;
  }
  notes.joues = joues;
  notes.compagnie = await page.evaluate(() => { const e = JEU.expedition.enCours(); return e ? { vivres: e.vivres, or: e.or, faveurs: e.faveurs, renom: e.compte.renom, questions: e.compte.questions, position: e.position, semaine: e.semaine } : null; });
  // retour à la campagne (Échap), la carte dit « Reprendre », et la reprise revient au même point
  if (await page.evaluate(() => !!JEU.expedition.enCours())) {
    const avant = await page.evaluate(() => JSON.stringify(JEU.sauvegarde.etat().expedition.enCours));
    await page.keyboard.press("Escape");
    await page.waitForFunction(() => JEU.ui.ecranCourant() === "jouer");
    await attendre(200);
    notes.carteReprise = await page.evaluate(() => { const b = [...document.querySelectorAll(".carte-jeu h2")].find(h => /expédition/i.test(h.textContent)); return b ? b.textContent : null; });
    if (!/Reprendre/.test(notes.carteReprise || "")) echecs.push("la carte de la campagne ne dit pas « Reprendre » : " + notes.carteReprise);
    await capture(page, "8-campagne-reprise");
    await page.evaluate(() => { const b = [...document.querySelectorAll(".carte-jeu")].find(x => /Reprendre/.test(x.textContent)); b.click(); });
    await page.waitForSelector("#ecran-expedition .route-svg, #ecran-expedition .page-semaine, #ecran-expedition button.carte-faveur");
    const apres = await page.evaluate(() => JSON.stringify(JEU.sauvegarde.etat().expedition.enCours));
    notes.reprise = avant === apres;
    if (!notes.reprise) echecs.push("la reprise ne revient pas au même point");
    // export puis import : l'expédition revient telle quelle
    notes.importIdentique = await page.evaluate(() => { const t = JEU.sauvegarde.texteExport(), a = JSON.stringify(JEU.sauvegarde.etat().expedition); JEU.sauvegarde.importer(t); return JSON.stringify(JEU.sauvegarde.etat().expedition) === a; });
    if (!notes.importIdentique) echecs.push("export puis import : expédition différente");
    // réglages coupés : aucune erreur sur la route
    await page.evaluate(() => { const r = JEU.sauvegarde.etat().reglages; r.animations = false; r.sang = false; r.rivaux = false; JEU.sauvegarde.enregistrer(); JEU.ui.appliquerAnimations(); JEU.ui.afficher("expedition"); });
    await attendre(300);
    await capture(page, "9-route-sans-anim");
    // la liste des faveurs (F) puis fermeture
    await page.evaluate(() => JEU.ui.afficher("expedition"));
    await attendre(200);
    if (await page.evaluate(() => !!document.querySelector("#ecran-expedition .route-svg"))) { await page.keyboard.press("f"); await attendre(150); notes.listeFaveurs = await page.evaluate(() => !!document.querySelector(".liste-faveurs")); await page.keyboard.press("Escape"); }
  }
  await navigateur.close();
  notes.erreurs = erreurs;
  console.log(JSON.stringify(notes, null, 1));
  if (erreurs.length) echecs.push("erreurs JavaScript : " + erreurs.join(" | "));
  echecs.forEach(m => console.log("ÉCHEC  " + m));
  console.log(echecs.length ? "ÉCHEC" : "RÉUSSI");
  process.exit(echecs.length ? 1 : 0);
})().catch(e => { console.log("ÉCHEC  " + (e && e.stack || e)); process.exit(1); });
