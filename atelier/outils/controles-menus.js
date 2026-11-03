// Contrôles des menus habillés (lot B, agent B4 ; conception atelier/conception/graphismes-menus.md, sections 7 et 11).
// Deux familles, pour que tests.js et perf.js (tenus par l'agent des mesures) les appellent chacun par une ligne :
//   statique() : lecture des fichiers seulement (pour tests.js) ; renvoie [{ nom, ok, detail }] ;
//     require("./controles-menus.js").statique().forEach(c => verifier(c.nom, c.ok, c.detail));
//   page(chromium) : mesures dans le jeu ouvert (pour perf.js, Playwright) ; renvoie la même forme, avec les mesures.
// Seul, il lance les deux et écrit atelier/captures/menus/controles-menus.json :
//   NODE_PATH=/opt/node22/lib/node_modules CHROMIUM=/opt/pw-browsers/chromium node atelier/outils/controles-menus.js [--statique] [--sans-cout]
// Seuils : contraste 4,5 : 1 (couleur du texte et cœur des lettres, sur les pixels) ; cibles de 44 px au doigt en
// 1340 × 800 ; hauteurs du bandeau et du menu égales avec et sans la feuille ; ouverture d'un écran au ralenti 4 × au plus
// +10 % ou +15 ms (le plus grand des deux) ; écran immobile : médiane sous 17,5 ms, 95e centile sous 34 ms.
"use strict";
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const RACINE = path.join(__dirname, "..", "..");
const JEU = path.join(RACINE, "jeu");
const FEUILLE = path.join(JEU, "css", "menus.css");
const URL_JEU = "file://" + path.join(JEU, "index.html");
const IMAGES = path.join(JEU, "assets", "images", "menus");
const BUDGET = 120000;

// ---------------------------------------------------------------- lecture de la feuille
function sansCommentaires(css) { return css.replace(/\/\*[\s\S]*?\*\//g, ""); }
// blocs de premier niveau et imbriqués : [{ prelude, corps, parents: [préludes des @ englobants] }]
function regles(css) {
  const out = [];
  (function lire(txt, parents) {
    let i = 0;
    while (i < txt.length) {
      const o = txt.indexOf("{", i);
      if (o < 0) break;
      const prelude = txt.slice(i, o).trim();
      let n = 1, j = o + 1;
      while (j < txt.length && n) { if (txt[j] === "{") n++; else if (txt[j] === "}") n--; j++; }
      const corps = txt.slice(o + 1, j - 1);
      if (/^@(media|supports)/.test(prelude)) lire(corps, parents.concat([prelude]));
      else out.push({ prelude, corps, parents });
      i = j;
    }
  })(sansCommentaires(css), []);
  return out;
}
function urls(css) {
  const l = [];
  sansCommentaires(css).replace(/url\(\s*["']?([^"')]+)["']?\s*\)/g, (m, u) => { if (!/^data:/.test(u)) l.push(u); return m; });
  return Array.from(new Set(l));
}

function statique() {
  const res = [];
  const ok = (nom, cond, detail) => res.push({ nom, ok: !!cond, detail: detail == null ? "" : detail });
  const css = fs.readFileSync(FEUILLE, "utf8");
  const R = regles(css);
  // 1. toutes les url() existent et sont dans la liste de précache de sw.js
  const sw = fs.readFileSync(path.join(JEU, "sw.js"), "utf8");
  const chemins = urls(css).map(u => path.posix.normalize(path.posix.join("css", u)));
  const absents = chemins.filter(c => !fs.existsSync(path.join(JEU, c)));
  const horsSw = chemins.filter(c => sw.indexOf(JSON.stringify(c)) < 0);
  ok("menus.css : toutes les url() existent (" + chemins.length + ")", !absents.length, absents.join(", "));
  ok("menus.css : toutes les url() sont dans la liste de précache de sw.js", !horsSw.length, horsSw.join(", "));
  // 2. toutes les images de menus.css sont préchargées au lancement (demarrage.js, IMAGES_MENUS)
  const dem = fs.readFileSync(path.join(JEU, "js", "demarrage.js"), "utf8");
  const m = dem.match(/IMAGES_MENUS\s*=\s*\[([\s\S]*?)\]/);
  const liste = m ? (m[1].match(/"([^"]+)"/g) || []).map(x => "assets/images/menus/" + x.slice(1, -1) + ".png") : [];
  const images = chemins.filter(c => /\.(png|jpe?g|webp|svg)$/.test(c));
  const nonPre = images.filter(c => liste.indexOf(c) < 0);
  const inutiles = liste.filter(c => images.indexOf(c) < 0);
  ok("menus.css : toutes ses images sont préchargées au lancement (demarrage.js), et rien de plus", m && !nonPre.length && !inutiles.length,
    "non préchargées : " + nonPre.join(", ") + " ; en trop : " + inutiles.join(", "));
  // 3. aucun survol hors de @media (hover: hover) (sinon il colle au doigt sur la tablette) ; seule exception, une règle qui
  //    ne fait qu'annuler un survol de jeu.css (toutes ses valeurs à none : elle ne peut rien laisser « collé »)
  const neutre = corps => corps.split(";").map(d => d.trim()).filter(Boolean).every(d => /:\s*none\s*$/.test(d));
  const survols = R.filter(r => /:hover/.test(r.prelude) && !neutre(r.corps) && !r.parents.some(p => /\(\s*hover\s*:\s*hover\s*\)/.test(p))).map(r => r.prelude);
  ok("menus.css : aucun :hover hors de @media (hover: hover)", !survols.length, survols.join(" | "));
  // 4. images de menus.css : budget, aucun fichier inutilisé, aucun nom en point ou trait bas (l'application Android les perd)
  const fichiers = fs.readdirSync(IMAGES);
  const poids = fichiers.reduce((t, f) => t + fs.statSync(path.join(IMAGES, f)).size, 0);
  const orphelins = fichiers.filter(f => images.indexOf("assets/images/menus/" + f) < 0);
  ok("images des menus : " + fichiers.length + " fichiers, " + poids + " octets (budget " + BUDGET + "), tous employés, aucun nom en . ou _",
    poids <= BUDGET && !orphelins.length && !fichiers.some(f => /^[._]/.test(f)), "inutilisés : " + orphelins.join(", "));
  // 5. ce qui bouge : keyframes en transform et opacity seulement ; aucune animation infinie ; aucun filter sur un élément animé
  const kf = [];
  sansCommentaires(css).replace(/@keyframes\s+([\w-]+)\s*\{((?:[^{}]*\{[^{}]*\})*)[^{}]*\}/g, (x, nom, corps) => {
    (corps.match(/([a-z-]+)\s*:/g) || []).map(p => p.replace(/\s*:$/, "")).forEach(p => { if (p !== "transform" && p !== "opacity") kf.push(nom + " : " + p); });
    return x;
  });
  ok("menus.css : les keyframes n'animent que transform et opacity", !kf.length, kf.join(", "));
  const infinies = R.filter(r => /animation[^;]*infinite/.test(r.corps)).map(r => r.prelude);
  ok("menus.css : aucune animation infinie", !infinies.length, infinies.join(" | "));
  const filtresAnimes = R.filter(r => /(^|;|\s)animation\s*:(?!\s*none)/.test(r.corps) && /(^|;|\s)filter\s*:(?!\s*none)/.test(r.corps)).map(r => r.prelude);
  ok("menus.css : aucun filter sur un élément animé", !filtresAnimes.length, filtresAnimes.join(" | "));
  // 6. index.html : menus.css juste après jeu.css ; le bloc de chargement (blason, titre, rail, compte)
  const idx = fs.readFileSync(path.join(JEU, "index.html"), "utf8");
  ok("index.html : menus.css chargée juste après jeu.css", /<link rel="stylesheet" href="css\/jeu\.css">\s*<link rel="stylesheet" href="css\/menus\.css">/.test(idx));
  ok("index.html : bloc de chargement (blason, titre, rail, compte)", ["attente-blason", "attente-titre", "attente-rail", "attente-compte"].every(c => idx.indexOf(c) >= 0));
  // 7. chiffres lisibles : police « Chiffres » (Crimson Text, chiffres seuls) sur les sept conteneurs des menus
  ok("menus.css : police « Chiffres » (U+0030-0039, Crimson Text) posée sur les menus",
    /font-family:\s*"Chiffres"[^}]*unicode-range:\s*U\+0030-0039/.test(css) && /#bandeau, #menu, #ecran-accueil, #ecran-cours, #ecran-codex, #ecran-reglages, #modale\s*\{\s*--titre:\s*"Chiffres"/.test(css));
  return res;
}

// ---------------------------------------------------------------- pixels (PNG des captures, sans bibliothèque)
function decoderPng(buf) {
  let p = 8, w = 0, h = 0, type = 0;
  const idat = [];
  while (p < buf.length) {
    const len = buf.readUInt32BE(p), nom = buf.toString("ascii", p + 4, p + 8);
    if (nom === "IHDR") { w = buf.readUInt32BE(p + 8); h = buf.readUInt32BE(p + 12); type = buf[p + 17]; }
    else if (nom === "IDAT") idat.push(buf.slice(p + 8, p + 8 + len));
    p += 12 + len;
  }
  const bpp = type === 6 ? 4 : 3, brut = zlib.inflateSync(Buffer.concat(idat)), ligne = w * bpp;
  const px = Buffer.alloc(w * h * 4);
  let prec = Buffer.alloc(ligne);
  for (let y = 0; y < h; y++) {
    const f = brut[y * (ligne + 1)], cour = Buffer.from(brut.slice(y * (ligne + 1) + 1, (y + 1) * (ligne + 1)));
    for (let i = 0; i < ligne; i++) {
      const a = i >= bpp ? cour[i - bpp] : 0, b = prec[i], c = i >= bpp ? prec[i - bpp] : 0;
      let v = cour[i];
      if (f === 1) v += a; else if (f === 2) v += b; else if (f === 3) v += (a + b) >> 1;
      else if (f === 4) { const pp = a + b - c, pa = Math.abs(pp - a), pb = Math.abs(pp - b), pc = Math.abs(pp - c); v += (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c); }
      cour[i] = v & 255;
    }
    for (let x = 0; x < w; x++) for (let k = 0; k < 3; k++) px[(y * w + x) * 4 + k] = cour[x * bpp + k];
    prec = cour;
  }
  return { w, h, px };
}
function lin(c) { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }
function lum(r, g, b) { return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b); }
function rapport(a, b) { return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05); }
function centile(t, q) { const s = t.slice().sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.max(0, Math.floor(q * (s.length - 1))))]; }
const mediane = t => centile(t, 0.5);
const attendre = ms => new Promise(r => setTimeout(r, ms));

// Contraste d'un texte, mesuré sur la page : capture avec le texte, puis avec le texte rendu transparent (le fond seul).
// « couleur » : couleur calculée du texte contre le fond le plus défavorable (10e ou 90e centile des pixels du fond) ;
// « rendu » : cœur des lettres (le quart des pixels de lettre les plus marqués) contre le même fond.
async function contraste(page, sel, rang) {
  const r = await page.evaluate(([s, k]) => {
    const e = document.querySelectorAll(s)[k || 0];
    if (!e) return null;
    e.scrollIntoView({ block: "center" });
    const g = document.createRange(); g.selectNodeContents(e);
    const rs = Array.from(g.getClientRects()).filter(x => x.width > 2 && x.height > 2);
    if (!rs.length) return null;
    const x0 = Math.min(...rs.map(x => x.left)), y0 = Math.min(...rs.map(x => x.top)), x1 = Math.max(...rs.map(x => x.right)), y1 = Math.max(...rs.map(x => x.bottom));
    e.setAttribute("data-mesure", "");
    const c = getComputedStyle(e).color.match(/[\d.]+/g).map(Number);
    return { x: Math.floor(x0), y: Math.floor(y0), w: Math.ceil(x1 - x0), h: Math.ceil(y1 - y0), c, taille: parseFloat(getComputedStyle(e).fontSize), texte: e.textContent.trim().slice(0, 40) };
  }, [sel, rang]);
  if (!r) return null;
  await calme(page);
  await attendre(60);
  const clip = { x: Math.max(0, r.x), y: Math.max(0, r.y), width: Math.max(4, r.w), height: Math.max(4, r.h) };
  const A = decoderPng(await page.screenshot({ clip }));
  const st = await page.addStyleTag({ content: "[data-mesure], [data-mesure] * { color: transparent !important; -webkit-text-fill-color: transparent !important; text-shadow: none !important; }" });
  await attendre(60);
  const B = decoderPng(await page.screenshot({ clip }));
  await st.evaluate(n => n.remove());
  await page.evaluate(() => { const e = document.querySelector("[data-mesure]"); if (e) e.removeAttribute("data-mesure"); });
  const lt = lum(r.c[0], r.c[1], r.c[2]);
  const fond = [], lettres = [];
  for (let i = 0; i < A.w * A.h; i++) {
    const la = lum(A.px[i * 4], A.px[i * 4 + 1], A.px[i * 4 + 2]), lb = lum(B.px[i * 4], B.px[i * 4 + 1], B.px[i * 4 + 2]);
    fond.push(lb);
    if (Math.abs(la - lb) > 0.02) lettres.push(la);
  }
  const lmed = mediane(fond), sombre = lt < lmed;
  const lf = centile(fond, sombre ? 0.1 : 0.9);
  const coeur = lettres.length ? centile(lettres, sombre ? 0.25 : 0.75) : lt;
  return { texte: r.texte, taille: r.taille, couleur: +rapport(lt, lf).toFixed(2), rendu: +rapport(coeur, lf).toFixed(2) };
}

// ---------------------------------------------------------------- mesures dans le jeu
const TACTILE = { features: [{ name: "hover", value: "none" }, { name: "pointer", value: "coarse" }] };
async function ouvrir(nav, w, h, tactile, autres) {
  const ctx = await nav.newContext(Object.assign({ viewport: { width: w, height: h }, hasTouch: !!tactile, deviceScaleFactor: 1 }, autres || {}));
  const page = await ctx.newPage();
  page.setDefaultTimeout(15000);
  const erreurs = [];
  page.on("pageerror", e => erreurs.push(e.message));
  let cdp = null;
  if (tactile) {
    cdp = await ctx.newCDPSession(page);
    await cdp.send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
    await cdp.send("Emulation.setEmulatedMedia", TACTILE);
  }
  await page.goto(URL_JEU);
  await page.waitForFunction(() => window.JEU && JEU.pret);
  await page.evaluate(() => { JEU.ui.fermerModale(); });
  await attendre(300);
  return { ctx, page, cdp, erreurs };
}
const feuille = (page, active) => page.evaluate(a => { document.querySelector('link[href="css/menus.css"]').disabled = !a; }, active);
async function hauteurs(page) {
  return page.evaluate(() => ["bandeau", "menu"].map(i => +document.getElementById(i).getBoundingClientRect().height.toFixed(2)));
}
// Cibles d'au moins 44 px au doigt : tout ce qui se touche et se voit dans l'écran affiché (ou dans la fenêtre ouverte)
// attend la fin des animations finies en cours (fenêtre qui s'ouvre, cascade) : une boîte encore à l'échelle 0,96 mentirait
function calme(page) {
  return page.evaluate(() => Promise.race([new Promise(r => setTimeout(r, 3000)),
    Promise.all(document.getAnimations().filter(a => a.effect && a.effect.getTiming().iterations !== Infinity).map(a => a.finished.catch(() => 0)))]));
}
async function cibles(page) {
  await calme(page);
  return page.evaluate(() => {
    const racine = document.querySelector("#modale:not([hidden])") || document.querySelector("main > .ecran:not([hidden])");
    const zones = [document.getElementById("bandeau"), document.getElementById("menu"), racine];
    const petits = [];
    let n = 0;
    zones.forEach(z => z && z.querySelectorAll("button, [role=tab], a[href], input:not([type=hidden]):not([type=file]), select, label").forEach(e => {
      if (e.closest("[hidden]")) return;
      let cible = e;
      if (e.tagName === "INPUT" && /checkbox|radio/.test(e.type)) { cible = e.closest("label") || e; }
      const r = cible.getBoundingClientRect();
      if (!r.width || !r.height || getComputedStyle(cible).visibility === "hidden") return;
      n++;
      if (r.height < 43.99 || r.width < 43.99) petits.push((e.className || e.tagName) + " « " + (e.textContent || e.type || "").trim().slice(0, 24) + " » " + r.width.toFixed(1) + " × " + r.height.toFixed(1));
    }));
    return { n, petits };
  });
}

async function page(chromium) {
  const res = [];
  const ok = (nom, cond, detail, mesure) => res.push({ nom, ok: !!cond, detail: detail == null ? "" : detail, mesure });
  const nav = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined, args: ["--allow-file-access-from-files"] });
  try {
    // 1. hauteurs du bandeau et du menu, avec et sans la feuille (trois fenêtres)
    for (const [w, h, t] of [[1366, 768, false], [1920, 1080, false], [1340, 800, true]]) {
      const o = await ouvrir(nav, w, h, t);
      const avec = await hauteurs(o.page);
      await feuille(o.page, false); await attendre(100);
      const sans = await hauteurs(o.page);
      await feuille(o.page, true);
      ok("hauteurs du bandeau et du menu inchangées en " + w + " × " + h + (t ? " au doigt" : ""), avec[0] === sans[0] && avec[1] === sans[1], "avec " + avec.join(" / ") + ", sans " + sans.join(" / "), { avec, sans });
      if (o.erreurs.length) ok("aucune erreur de page en " + w + " × " + h, false, o.erreurs.slice(0, 3).join(" | "));
      await o.ctx.close();
    }
    // 2. chiffres en Crimson Text ; contraste mesuré sur les pixels (1366 × 768, souris ; puis 1340 × 800, doigt)
    for (const [w, h, t] of [[1366, 768, false], [1340, 800, true]]) {
      const o = await ouvrir(nav, w, h, t), P = o.page, suffixe = t ? " (1340 × 800, doigt)" : " (1366 × 768)";
      if (!t) {
        const ch = await P.evaluate(async () => { await document.fonts.ready; return { check: document.fonts.check("700 16px Chiffres", "1"), famille: getComputedStyle(document.querySelector("#menu button")).fontFamily }; });
        ok("chiffres : document.fonts.check(\"700 16px Chiffres\", \"1\") vrai et police des menus « Chiffres » d'abord", ch.check && /^"?Chiffres/.test(ch.famille), JSON.stringify(ch));
      }
      const mesures = [];
      const mesurer = async (nom, sel, rang) => { const c = await contraste(P, sel, rang); if (c) mesures.push(Object.assign({ nom }, c)); };
      await P.evaluate(() => { JEU.ui.afficher("cours"); }); await attendre(500);
      await mesurer("menu, libellé", "#menu button:not(.actif)");
      await mesurer("menu, actif", "#menu button.actif");
      await mesurer("signet inactif", ".onglet:not(.actif)");
      await mesurer("signet actif", ".onglet.actif");
      await mesurer("titre de semaine", ".semaine-bloc h3");
      // une ligne de chaque état : si l'état n'existe pas dans la partie, une ligne existante le prend le temps de la mesure
      for (const st of ["presume", "acquis", "a-revoir", "ouvert", "brume", "avenir"]) {
        await P.evaluate(s => {
          if (document.querySelector(".ligne-cours .etat." + s)) return;
          const l = document.querySelector(".ligne-cours[class*=etat-]"); if (!l) return;
          l.className = "ligne-cours etat-" + s; const e = l.querySelector(".etat"); e.className = "etat " + s; e.textContent = { presume: "Présumé acquis", acquis: "Acquis", "a-revoir": "À revoir", ouvert: "En cours", brume: "Dans la brume", avenir: "Contenu à venir" }[s];
          if (s === "brume") l.firstChild.className = "titre-brume";
        }, st);
        await mesurer("état « " + st + " »", ".ligne-cours .etat." + st);
      }
      await mesurer("titre dans la brume", ".titre-brume");
      await P.evaluate(() => { JEU.ui.afficher("codex"); }); await attendre(500);
      const tomes = await P.evaluate(() => Array.from(document.querySelectorAll(".codex-matiere:not(.codex-galerie) .codex-entete > span:first-child")).map(e => e.textContent));
      for (let k = 0; k < tomes.length; k++) await mesurer("tome « " + tomes[k] + " »", ".codex-matiere:not(.codex-galerie) .codex-entete > span:first-child", k);
      await mesurer("nombre de fiches (Histoire)", ".codex-matiere:not(.codex-galerie) .codex-entete .note", 0);
      await mesurer("rouleau de la galerie", ".codex-galerie .codex-entete > span:first-child");
      await P.evaluate(() => { JEU.ui.afficher("reglages"); }); await attendre(500);
      await mesurer("bouton principal", "#ecran-reglages .bouton.principal");
      await mesurer("bouton secondaire", "#ecran-reglages .actions .bouton:not(.principal)");
      // appuyé : le bouton tenu enfoncé pendant la mesure
      const b = await P.evaluate(() => { const e = document.querySelector("#ecran-reglages .bouton.principal"); e.scrollIntoView({ block: "center" }); const r = e.getBoundingClientRect(); return { x: r.left + 6, y: r.top + r.height / 2 }; });
      if (!t) { await P.mouse.move(b.x, b.y); await P.mouse.down(); await mesurer("bouton principal appuyé", "#ecran-reglages .bouton.principal"); await P.mouse.up(); await P.mouse.move(2, 2); }
      await mesurer("date", "#ecran-reglages input[type=date]");
      // désactivé : l'arsenal, réserves vidées le temps de la mesure
      await P.evaluate(() => { const e = JEU.sauvegarde.etat(); window.__res = Object.assign({}, e.ressources); Object.keys(e.ressources).forEach(k => { e.ressources[k] = 0; }); JEU.ui.afficher("jouer"); JEU.ecranCampagne.ouvrirArsenal(); });
      await attendre(500);
      await mesurer("bouton désactivé (arsenal)", "#modale .bouton:disabled");
      await P.evaluate(() => { JEU.ui.fermerModale(); const e = JEU.sauvegarde.etat(); Object.assign(e.ressources, window.__res); });
      const faibles = mesures.filter(m => m.couleur < 4.5 || m.rendu < 4.5 || m.taille < 14);
      ok("contraste ≥ 4,5 : 1 (couleur et cœur des lettres) et libellés ≥ 14 px" + suffixe + " : " + mesures.length + " textes", !faibles.length,
        faibles.map(m => m.nom + " " + m.couleur + " / " + m.rendu + " (" + m.taille + " px)").join(" | "), mesures);
      await o.ctx.close();
    }
    // 3. cibles de 44 px au doigt (1340 × 800 et 1024 × 768)
    for (const [w, h] of [[1340, 800], [1024, 768]]) {
      const o = await ouvrir(nav, w, h, true), P = o.page;
      const tous = { n: 0, petits: [] };
      const ajouter = async nom => { const c = await cibles(P); tous.n += c.n; c.petits.forEach(x => tous.petits.push(nom + " : " + x)); };
      await ajouter("accueil");
      await P.evaluate(() => JEU.ui.afficher("cours")); await attendre(300); await ajouter("cours");
      await P.evaluate(() => { JEU.ui.afficher("codex"); const b = document.querySelector(".codex-matiere:not(.codex-galerie) .codex-entete"); b.click(); }); await attendre(300); await ajouter("codex");
      await P.evaluate(() => JEU.ui.afficher("reglages")); await attendre(300); await ajouter("réglages");
      await P.evaluate(() => { JEU.ui.afficher("jouer"); JEU.ecranCampagne.ouvrirArsenal(); }); await attendre(400); await ajouter("arsenal");
      const media = await P.evaluate(() => matchMedia("(hover: none) and (pointer: coarse)").matches);
      ok("cibles de 44 px au doigt en " + w + " × " + h + " (" + tous.n + " cibles, accueil, cours, codex, réglages, arsenal)", media && !tous.petits.length, tous.petits.slice(0, 8).join(" | "), tous);
      await o.ctx.close();
    }
    // 4. mouvements : après 1 s, aucune animation de la feuille ne tourne encore ; Animations coupées et
    //    prefers-reduced-motion : rien ne bouge (fanion posé, pas de cascade, pas d'onde) ; l'onde jamais dans une question
    const NOMS = ["fanion", "cascade", "frappe", "attente-part", "apparition"];
    for (const mode of ["normal", "sans-anim", "reduit"]) {
      const o = await ouvrir(nav, 1340, 800, true, mode === "reduit" ? { reducedMotion: "reduce" } : {}), P = o.page;
      if (mode === "sans-anim") await P.evaluate(() => { JEU.sauvegarde.etat().reglages.animations = false; JEU.ui.appliquerAnimations(); });
      const r = await P.evaluate(async noms => {
        const enCours = () => document.getAnimations().filter(a => noms.indexOf(a.animationName) >= 0 || a.effect && a.effect.target && a.effect.target.classList && a.effect.target.classList.contains("onde"));
        JEU.ui.afficher("cours");
        await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
        const tot = enCours().length;
        const fanion = getComputedStyle(document.querySelector("#menu button.actif"), "::after").animationName;
        // un toucher sur un onglet : l'onde part (sauf sans animations)
        const o = document.querySelector(".onglet:not(.actif)"), rr = o.getBoundingClientRect();
        o.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, pointerType: "touch", clientX: rr.left + 5, clientY: rr.top + 5 }));
        await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
        const onde = document.querySelector(".onde"), ondeAnim = onde ? onde.getAnimations().length : 0;
        // un toucher dans une question : aucune onde
        if (onde) onde.getAnimations().forEach(a => a.cancel());
        const q = document.createElement("div"); q.className = "question"; q.innerHTML = "<button class='choix bouton'>x</button>"; document.querySelector("#ecran-cours").appendChild(q);
        q.firstChild.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, pointerType: "touch", clientX: 50, clientY: 50 }));
        await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
        const ondeQuestion = document.querySelector(".onde") ? document.querySelector(".onde").getAnimations().length : 0;
        q.remove();
        await new Promise(r => setTimeout(r, 1000));
        const reste = enCours().map(a => a.animationName || "onde");
        const infinies = document.getAnimations().filter(a => a.effect && a.effect.getTiming && a.effect.getTiming().iterations === Infinity).map(a => a.animationName);
        return { tot, fanion, ondeAnim, ondeQuestion, reste, infinies };
      }, NOMS);
      if (mode === "normal") ok("mouvements : fanion à l'entrée des Cours, onde au toucher d'un onglet, rien dans une question, tout fini après 1 s",
        r.tot > 0 && r.fanion === "fanion" && r.ondeAnim === 1 && r.ondeQuestion === 0 && !r.reste.length, JSON.stringify(r), r);
      else ok("mouvements " + (mode === "reduit" ? "sous prefers-reduced-motion" : "avec Animations coupées") + " : ni fanion, ni cascade, ni onde (les états restent)",
        r.tot === 0 && r.ondeAnim === 0 && !r.reste.length, JSON.stringify(r), r);
      await o.ctx.close();
    }
    // 5. coût d'ouverture au ralenti 4 × (1340 × 800, doigt) : la feuille activée et désactivée en alternance dans la même
    //    page (le bruit des autres processus touche les deux de la même façon), 8 ouvertures comptées de chaque, trois passes,
    //    jugées sur les médianes des trois passes réunies
    if (process.argv.indexOf("--sans-cout") < 0) {
      const o = await ouvrir(nav, 1340, 800, true), P = o.page, cdp = o.cdp;
      await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
      await cdp.send("Performance.enable");
      const metr = async () => { const r = await cdp.send("Performance.getMetrics"); const x = {}; r.metrics.forEach(m => { x[m.name] = m.value; }); return x; };
      const cout = {};
      for (const nom of ["accueil", "cours", "codex", "reglages"]) {
        cout[nom] = [];
        for (let passe = 0; passe < 3; passe++) {
          const hor = { sans: [], avec: [] }, trav = { sans: [], avec: [] }; // horloge ; tâches du fil principal (script, style, mise en page, peinture)
          for (let k = 0; k < 32; k++) {
            // deux échantillons de suite dans le même état (sans, sans, avec, avec…), seul le second compte : juste après la
            // bascule, la page recalcule tout, redécode les images et recharge la police « Chiffres » (chargée à part,
            // elle remet le texte en page quand elle arrive), ce qu'aucun joueur ne paie en changeant d'écran
            const avec = ((k >> 1) & 1) === 1, compte = (k & 1) === 1;
            await P.evaluate(([a, n]) => { document.querySelector('link[href="css/menus.css"]').disabled = !a; JEU.ui.afficher("domaine"); JEU.ui.afficher(n); }, [avec, nom]);
            await attendre(300);
            await P.evaluate(() => JEU.ui.afficher("domaine"));
            await attendre(260);
            const a0 = await metr();
            hor[avec ? "avec" : "sans"].push(await P.evaluate(n => new Promise(ok => { const t0 = performance.now(); JEU.ui.afficher(n);
              requestAnimationFrame(() => requestAnimationFrame(() => ok(performance.now() - t0))); }), nom));
            const a1 = await metr();
            if (!compte) { hor[avec ? "avec" : "sans"].pop(); continue; }
            trav[avec ? "avec" : "sans"].push(1000 * (a1.TaskDuration - a0.TaskDuration));
          }
          const m = x => +mediane(x).toFixed(1);
          cout[nom].push({ horloge: [m(hor.sans), m(hor.avec)], travail: [m(trav.sans), m(trav.avec)], brut: hor });
        }
        // médianes des trois passes réunies (24 ouvertures de chaque) : une passe seule varie de ± 40 ms quand le
        // conteneur est chargé par d'autres processus ; le détail de chaque passe reste dans le rapport
        const tous = c => [].concat(...cout[nom].map(p => p.brut[c]));
        const ms = mediane(tous("sans")), ma = mediane(tous("avec"));
        cout[nom].forEach(p => { delete p.brut; });
        ok("ouverture de « " + nom + " » au ralenti 4 × : " + ms.toFixed(1) + " → " + ma.toFixed(1) + " ms (médianes des trois passes), au plus +10 % ou +15 ms",
          ma - ms <= Math.max(0.10 * ms, 15),
          cout[nom].map(p => "horloge " + p.horloge.join(" → ") + " ms, tâches " + p.travail.join(" → ") + " ms").join(" | "), { sans: ms, avec: ma, passes: cout[nom] });
      }
      // écran immobile 2,5 s après l'ouverture, feuille active
      await P.evaluate(() => { document.querySelector('link[href="css/menus.css"]').disabled = false; });
      for (const nom of ["cours", "codex", "reglages"]) {
        await P.evaluate(n => JEU.ui.afficher(n), nom);
        await attendre(800);
        const ecarts = await P.evaluate(() => new Promise(ok => { const t = []; let d = performance.now(); const f = n => { t.push(n - d); d = n; if (t.length < 150) requestAnimationFrame(f); else ok(t.slice(1)); }; requestAnimationFrame(f); }));
        const med = +mediane(ecarts).toFixed(1), p95 = +centile(ecarts, 0.95).toFixed(1);
        ok("« " + nom + " » immobile au ralenti 4 × : médiane " + med + " ms, 95e centile " + p95 + " ms", med < 17.5 && p95 < 34, "", { med, p95 });
      }
      await o.ctx.close();
    }
  } finally { await nav.close(); }
  return res;
}

module.exports = { statique, page, contraste, decoderPng };

if (require.main === module) {
  (async () => {
    const tout = statique();
    if (process.argv.indexOf("--statique") < 0) tout.push(...await page(require("playwright").chromium));
    let echecs = 0;
    tout.forEach(c => { if (!c.ok) echecs++; console.log((c.ok ? "ok    " : "ÉCHEC ") + c.nom + (c.detail && !c.ok ? " : " + c.detail : (c.detail && c.detail.length < 260 ? " · " + c.detail : ""))); });
    console.log(tout.length + " contrôles, " + echecs + " en échec");
    if (process.argv.indexOf("--statique") < 0) fs.writeFileSync(path.join(RACINE, "atelier", "captures", "menus", "controles-menus.json"), JSON.stringify(tout, null, 1));
    process.exit(echecs ? 1 : 0);
  })().catch(e => { console.error(e); process.exit(2); });
}
