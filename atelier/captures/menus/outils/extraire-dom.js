// Extrait le balisage réel du jeu (écran rendu par le jeu lui-même) dans des pages statiques de maquette :
// scripts retirés, <base> vers jeu/, feuille de la maquette (menus.css) chargée après jeu.css.
const { chromium } = require("playwright");
const fs = require("fs"), path = require("path");
const ICI = __dirname, MAQ = path.join(ICI, "..", "maquettes");
const BASE = "file:///home/user/Test/jeu/";
(async () => {
  const nav = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
  const page = await (await nav.newContext({ viewport: { width: 1366, height: 768 } })).newPage();
  await page.goto(BASE + "index.html"); await page.waitForFunction(() => window.JEU && JEU.pret);
  await page.evaluate(() => { JEU.ui.fermerModale(); const e = JEU.sauvegarde.etat(); const v = [12, 47, 8, 130, 23, 5, 61]; Object.keys(JEU.RESSOURCES).forEach((k, i) => { e.ressources[k] = v[i % v.length]; }); JEU.ui.majRessources(); });
  async function vider(nom, prep) {
    await page.evaluate(prep);
    await page.waitForTimeout(300);
    let html = await page.evaluate(() => {
      const d = document.documentElement.cloneNode(true);
      d.querySelectorAll("script").forEach(s => s.remove());
      d.querySelectorAll(".ecran.entree").forEach(s => s.classList.remove("entree"));
      d.querySelectorAll(".toast").forEach(s => { s.className = "toast"; s.textContent = ""; });
      const l = d.querySelector('link[href="css/jeu.css"]');
      const m = document.createElement("link"); m.rel = "stylesheet"; m.href = "MENUS_CSS"; l.after(m);
      const b = document.createElement("base"); b.href = "BASE_JEU"; d.querySelector("head").prepend(b);
      d.querySelector('link[rel="manifest"]') && d.querySelector('link[rel="manifest"]').remove();
      return "<!doctype html>\n" + d.outerHTML;
    });
    html = html.replace("BASE_JEU", BASE).replace("MENUS_CSS", "file://" + path.join(MAQ, "menus.css"));
    fs.writeFileSync(path.join(MAQ, nom + ".html"), html);
    console.log(nom, html.length);
  }
  await vider("accueil", () => { JEU.ui.afficher("accueil"); JEU.ui.fermerModale(); if (document.activeElement) document.activeElement.blur(); });
  await vider("cours", () => { JEU.ui.afficher("cours"); window.scrollTo(0, 0); });
  await vider("codex", () => { JEU.ui.afficher("codex"); const h = [...document.querySelectorAll(".codex-matiere:not(.codex-galerie) .codex-entete")][0]; h.click(); });
  await vider("reglages", () => { JEU.ui.afficher("reglages"); const c = document.querySelectorAll("#ecran-reglages .liste-devoirs input[type=checkbox]"); c[0].checked = true; c[2].checked = true;
    document.querySelectorAll("#ecran-reglages input[type=checkbox]").forEach(x => { if (x.checked) x.setAttribute("checked", ""); }); });
  await vider("arsenal", () => { JEU.ui.afficher("jouer"); JEU.ui.fermerModale(); JEU.ecranCampagne.ouvrirArsenal(); });
  await nav.close();
})();
