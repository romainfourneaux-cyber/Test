// Inventaire des menus (demande de Romain du 31/10/2026 : « Les graphismes des menus aussi »). Lecture seule sur le jeu.
// Deux profils : pc (1366 × 768, souris) et tablette (1340 × 800, toucher émulé, hover: none, pointer: coarse).
// Chaque élément de menu est capturé : bandeau, barre de menu (repos, survol, focus, appui), accueil, Cours (onglets,
// états), Codex (matières, dépli, vignettes, fiche, galerie), arsenal, réglages (cases, dates, boutons), boutons
// (principal, secondaire, désactivé), cartes, confirmation, toast, chargement.
// Sorties : atelier/captures/menus/inventaire/<profil>/NN-nom.png et inventaire/<profil>/journal.json.
// Usage : NODE_PATH=/opt/node22/lib/node_modules CHROMIUM=/opt/pw-browsers/chromium node atelier/captures/menus/capturer-menus.js [pc|tablette]
"use strict";
const path = require("path"), fs = require("fs");
const { chromium } = require("playwright");
const RACINE = path.join(__dirname, "..", "..", "..");
const URL = "file://" + path.join(RACINE, "jeu", "index.html");
const attendre = ms => new Promise(r => setTimeout(r, ms));
const PROFILS = { pc: { nom: "pc", w: 1366, h: 768, tactile: false }, tablette: { nom: "tablette", w: 1340, h: 800, tactile: true } };
let P;

const TACTILE = { features: [{ name: "hover", value: "none" }, { name: "pointer", value: "coarse" }] };
async function toucher() {
  await P.cdpMedia.send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
  await P.cdpMedia.send("Emulation.setEmulatedMedia", TACTILE);
}
async function fixe(page, nom, o) {
  o = o || {};
  await attendre(o.delai == null ? 350 : o.delai);
  const f = path.join(P.dossier, nom + ".png");
  const opts = { path: f, fullPage: !!o.entiere };
  if (o.clip) opts.clip = o.clip;
  await page.screenshot(opts);
  // une capture de la page entière coupe l'émulation du toucher (hover et pointer reviennent à la souris, vérifié le
  // 31/10/2026) : on rallume le toucher, puis les deux préférences
  if (P.cdpMedia && o.entiere) await toucher();
  P.notes[nom] = path.relative(RACINE, f);
  console.log(P.nom + " · " + nom);
}
// capture d'un élément (sa boîte, avec une marge)
async function boite(page, sel, nom, marge, o) {
  const r = await page.$eval(sel, e => { const b = e.getBoundingClientRect(); return { x: b.left, y: b.top, w: b.width, h: b.height }; }).catch(() => null);
  if (!r) { P.notes[nom] = "absent : " + sel; return; }
  const m = marge == null ? 8 : marge;
  const x = Math.max(0, r.x - m), y = Math.max(0, r.y - m);
  await fixe(page, nom, Object.assign({ clip: { x, y, width: Math.min(P.w - x, r.w + 2 * m), height: Math.min(P.h - y, r.h + 2 * m) } }, o || {}));
}
async function haut(page) { // bandeau + menu
  const b = await page.$eval("#menu", e => e.getBoundingClientRect().bottom).catch(() => 120);
  return Math.ceil(b) + 6;
}
async function survol(page, sel, nom, clipSel) {
  if (P.tactile) return;
  const e = await page.$(sel); if (!e) { P.notes[nom] = "absent : " + sel; return; }
  await e.hover({ force: true });
  if (clipSel) await boite(page, clipSel, nom, 10, { delai: 300 }); else await fixe(page, nom, { delai: 300 });
  await page.mouse.move(2, 600);
}
async function enfonce(page, sel, nom, clipSel) {
  const b = await page.$eval(sel, e => { const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }).catch(() => null);
  if (!b) { P.notes[nom] = "absent : " + sel; return; }
  const prendre = () => clipSel ? boite(page, clipSel, nom, 10, { delai: 160 }) : fixe(page, nom, { delai: 160 });
  if (P.tactile) {
    const cdp = P.cdpMedia; // la même session que l'émulation du toucher (une session détachée l'annule)
    await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: b.x, y: b.y }] });
    await prendre();
    await cdp.send("Input.dispatchTouchEvent", { type: "touchCancel", touchPoints: [] });
  } else {
    await page.mouse.move(b.x, b.y); await page.mouse.down();
    await prendre();
    await page.mouse.move(2, 600); await page.mouse.up();
  }
}
// focus clavier sur le premier élément qui vérifie le sélecteur (Tab répété)
async function focusTab(page, sel, max) {
  await page.evaluate(() => { if (document.activeElement) document.activeElement.blur(); window.scrollTo(0, 0); });
  for (let i = 0; i < (max || 30); i++) {
    await page.keyboard.press("Tab");
    if (await page.evaluate(s => !!(document.activeElement && document.activeElement.matches(s)), sel)) return true;
  }
  return false;
}
function clic(page, sel) { return page.evaluate(s => { const e = document.querySelector(s); if (!e) throw new Error("absent : " + s); e.click(); }, sel); }

async function tour(nav, profil) {
  P = profil; P.dossier = path.join(__dirname, "inventaire", P.nom); P.notes = {}; P.erreurs = [];
  fs.mkdirSync(P.dossier, { recursive: true });
  const ctx = await nav.newContext({ viewport: { width: P.w, height: P.h }, hasTouch: P.tactile, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  page.setDefaultTimeout(9000);
  page.on("pageerror", e => P.erreurs.push(e.message));
  // la session qui émule le toucher reste ouverte toute la passe (détachée, elle rend le survol et la souris au navigateur)
  if (P.tactile) { P.cdpMedia = await ctx.newCDPSession(page); await P.cdpMedia.send("Emulation.setEmulatedMedia", { features: [{ name: "hover", value: "none" }, { name: "pointer", value: "coarse" }] }); }
  await page.goto(URL);
  await page.waitForFunction(() => window.JEU && JEU.pret);
  await page.evaluate(() => JEU.ui.fermerModale());
  // des ressources réalistes (deux et trois chiffres) pour juger la largeur du bandeau
  await page.evaluate(() => { const e = JEU.sauvegarde.etat(); const v = [12, 47, 8, 130, 23, 5, 61]; Object.keys(JEU.RESSOURCES).forEach((k, i) => { e.ressources[k] = v[i % v.length]; }); JEU.ui.majRessources(); });
  P.notes.version = await page.evaluate(() => JEU.version);
  P.notes.tactile = await page.evaluate(() => JEU.ui.tactile);
  P.notes.mediaTactileFin = null;

  // chargement : l'état « body.chargement » reposé tel quel (bandeau sans médaillons, « Ouverture des archives… »)
  await page.evaluate(() => { document.body.classList.add("chargement"); document.getElementById("ressources").style.visibility = "hidden"; window.scrollTo(0, 0); });
  await fixe(page, "00-chargement");
  await page.evaluate(() => { document.body.classList.remove("chargement"); document.getElementById("ressources").style.visibility = ""; });

  // accueil
  await page.evaluate(() => { JEU.ui.afficher("accueil"); JEU.ui.fermerModale(); });
  await page.evaluate(() => window.scrollTo(0, 0));
  await fixe(page, "01-accueil", { delai: 500 });
  await fixe(page, "01b-accueil-entiere", { entiere: true });
  const H = await haut(page);
  await fixe(page, "02-bandeau-menu", { clip: { x: 0, y: 0, width: P.w, height: H } });
  await boite(page, "#bandeau .bandeau-titre", "02b-bandeau-blason-nom", 10);
  await boite(page, "#ressources", "02c-bandeau-medaillons", 10);
  await page.evaluate(() => { const m = document.getElementById("bouton-musique"); m.click(); });
  await fixe(page, "02d-bandeau-boutons-son", { clip: { x: P.w - 160, y: 0, width: 160, height: H } });
  await page.evaluate(() => { const m = document.getElementById("bouton-musique"); m.click(); });
  await survol(page, "#menu button[data-ecran=domaine]", "03-menu-survol", "#menu");
  await enfonce(page, "#menu button[data-ecran=cours]", "03b-menu-appui", "#menu");
  if (!P.tactile && await focusTab(page, "#menu button[data-ecran=codex]")) await boite(page, "#menu", "03c-menu-focus", 10);
  await page.evaluate(() => { if (document.activeElement) document.activeElement.blur(); });
  await page.evaluate(() => document.querySelector(".bouton.enorme").scrollIntoView({ block: "center" }));
  await boite(page, ".cartouches", "04-accueil-cartouches", 12);
  await boite(page, ".bouton.enorme", "04b-jouer-repos", 24);
  await survol(page, ".bouton.enorme", "04c-jouer-survol", ".bouton.enorme");
  await enfonce(page, ".bouton.enorme", "04d-jouer-appui", ".bouton.enorme");
  if (!P.tactile) { await page.evaluate(() => document.querySelector(".bouton.enorme").focus()); await boite(page, ".bouton.enorme", "04e-jouer-focus", 24); }
  await page.evaluate(() => window.scrollTo(0, 0));
  await boite(page, ".titre-domaine", "04f-accueil-titre", 14);

  // campagne : cartes de jeu (cartes, survol, appui, focus)
  await page.evaluate(() => { JEU.ui.afficher("jouer"); JEU.ui.fermerModale(); });
  await page.waitForSelector("#ecran-jouer .grille-jeux");
  await page.evaluate(() => document.querySelector(".grille-jeux").scrollIntoView({ block: "start" }));
  await fixe(page, "05-campagne-cartes", { delai: 500 });
  await survol(page, ".carte-jeu", "05b-carte-survol", ".carte-jeu");
  await enfonce(page, ".carte-jeu", "05c-carte-appui", ".carte-jeu");
  // arsenal : boutons principaux, secondaires, désactivés ; lignes à pointillés
  await page.evaluate(() => { JEU.ecranCampagne.ouvrirArsenal(); });
  await page.waitForSelector("#modale .arsenal");
  await fixe(page, "06-arsenal");
  await boite(page, "#modale .modale-boite", "06b-arsenal-boite", 6);
  await survol(page, "#modale .bouton:not([disabled])", "06c-arsenal-survol-bouton", "#modale .ligne-arsenal");
  await page.evaluate(() => JEU.ui.fermerModale()); await attendre(200);
  // confirmation : bouton principal et secondaire côte à côte
  await page.evaluate(() => JEU.ui.confirmer("Quitter la partie ? Tu gardes tout ce que tu as déjà gagné.", "Quitter", function () {}));
  await boite(page, "#modale .modale-boite", "07-confirmation", 6);
  await page.evaluate(() => JEU.ui.fermerModale()); await attendre(150);
  await page.evaluate(() => JEU.ui.toast("Partie exportée."));
  await fixe(page, "07b-toast", { delai: 400, clip: { x: Math.round(P.w / 2 - 220), y: P.h - 110, width: 440, height: 110 } });

  // cours
  await page.evaluate(() => { JEU.ui.afficher("cours"); });
  await page.evaluate(() => window.scrollTo(0, 0));
  await fixe(page, "08-cours", { delai: 400 });
  await fixe(page, "08b-cours-entiere", { entiere: true });
  await boite(page, ".onglets", "08c-cours-onglets", 10);
  await survol(page, ".onglet:not(.actif)", "08d-cours-onglet-survol", ".onglets");
  await enfonce(page, ".onglet:not(.actif)", "08e-cours-onglet-appui", ".onglets");
  if (!P.tactile && await focusTab(page, ".onglet:not(.actif)", 40)) await boite(page, ".onglets", "08f-cours-onglet-focus", 10);
  await page.evaluate(() => { const o = [...document.querySelectorAll(".onglet")].find(x => /Anglais/.test(x.textContent)); if (o) o.click(); });
  await page.evaluate(() => window.scrollTo(0, 0));
  await fixe(page, "08g-cours-anglais", { delai: 300 });
  await page.evaluate(() => { const o = [...document.querySelectorAll(".onglet")].find(x => /Grammaire/.test(x.textContent)); if (o) o.click(); });
  await page.evaluate(() => window.scrollTo(0, 0));
  await fixe(page, "08h-cours-grammaire", { delai: 300 });
  await page.evaluate(() => { const o = [...document.querySelectorAll(".onglet")].find(x => /Histoire/.test(x.textContent)); if (o) o.click(); });
  // une ligne de chaque état, si elle existe
  P.notes.etatsCours = await page.evaluate(() => [...new Set([...document.querySelectorAll(".ligne-cours")].map(l => l.className))]);
  for (const st of ["etat-presume", "etat-acquis", "etat-a-revoir", "etat-ouvert", "etat-brume", "etat-avenir"]) {
    const ok = await page.evaluate(s => { const l = document.querySelector(".ligne-cours." + s); if (!l) return false; l.scrollIntoView({ block: "center" }); return true; }, st);
    if (ok) await boite(page, ".ligne-cours." + st, "08i-ligne-" + st, 4);
  }

  // codex
  await page.evaluate(() => { JEU.ui.afficher("codex"); });
  await page.evaluate(() => window.scrollTo(0, 0));
  await fixe(page, "09-codex", { delai: 400 });
  await fixe(page, "09b-codex-entiere", { entiere: true });
  await clic(page, ".codex-matiere:not(.codex-galerie) .codex-entete");
  await page.evaluate(() => window.scrollTo(0, 0));
  await fixe(page, "09c-codex-ouvert", { delai: 300 });
  await page.evaluate(() => document.querySelector(".grille-fiches").scrollIntoView({ block: "center" }));
  await boite(page, ".grille-fiches", "09d-codex-vignettes", 8);
  await survol(page, ".vignette", "09e-vignette-survol", ".grille-fiches");
  await enfonce(page, ".vignette", "09f-vignette-appui", ".grille-fiches");
  await page.evaluate(() => document.querySelector(".vignette").click());
  await page.waitForSelector("#modale .fiche");
  await fixe(page, "09g-fiche", { delai: 300 });
  await page.evaluate(() => JEU.ui.fermerModale()); await attendre(150);
  await page.evaluate(() => { const g = document.querySelector(".codex-galerie .codex-entete"); if (g) g.click(); });
  await page.evaluate(() => { const g = document.querySelector(".codex-galerie"); if (g) g.scrollIntoView({ block: "start" }); });
  await fixe(page, "09h-codex-galerie", { delai: 400 });

  // réglages
  await page.evaluate(() => { JEU.ui.afficher("reglages"); });
  await page.evaluate(() => window.scrollTo(0, 0));
  await fixe(page, "10-reglages", { delai: 400 });
  await fixe(page, "10b-reglages-entiere", { entiere: true });
  await page.evaluate(() => document.querySelector(".liste-devoirs").scrollIntoView({ block: "center" }));
  await boite(page, ".liste-devoirs", "10c-reglages-devoirs-dates", 8);
  await page.evaluate(() => { const c = document.querySelector("input[data-reglage=sang]"); c.closest(".cartouche").scrollIntoView({ block: "center" }); });
  await boite(page, "input[data-reglage=sang]", "10d-reglages-case", 120, {});
  await page.evaluate(() => document.querySelector("#ecran-reglages .bouton.principal").scrollIntoView({ block: "center" }));
  await boite(page, "#ecran-reglages .bouton.principal", "10e-reglages-boutons", 140);
  await survol(page, "#ecran-reglages .bouton:not(.principal)", "10f-reglages-survol-secondaire", "#ecran-reglages .bouton:not(.principal)");
  await enfonce(page, "#ecran-reglages .bouton.principal", "10g-reglages-appui-principal", "#ecran-reglages .actions");
  if (!P.tactile && await focusTab(page, "#ecran-reglages input[type=checkbox]", 60)) {
    await page.evaluate(() => document.activeElement.scrollIntoView({ block: "center" }));
    await fixe(page, "10h-reglages-focus-case", { delai: 200 });
  }
  if (!P.tactile && await focusTab(page, "#ecran-reglages input[type=text]", 60)) await boite(page, "#ecran-reglages input[type=text]", "10i-reglages-focus-champ", 60);

  P.notes.mediaTactileFin = await page.evaluate(() => matchMedia("(hover: none) and (pointer: coarse)").matches);
  fs.writeFileSync(path.join(P.dossier, "journal.json"), JSON.stringify({ notes: P.notes, erreurs: P.erreurs }, null, 1));
  console.log(P.nom + " : " + Object.keys(P.notes).length + " notes, " + P.erreurs.length + " erreurs" + (P.erreurs.length ? " : " + P.erreurs.slice(0, 3).join(" | ") : ""));
  await ctx.close();
}

(async () => {
  const nav = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined, args: ["--allow-file-access-from-files"] });
  const quels = process.argv[2] ? [process.argv[2]] : ["pc", "tablette"];
  for (const q of quels) await tour(nav, Object.assign({}, PROFILS[q]));
  await nav.close();
})().catch(e => { console.error(e); process.exit(1); });
