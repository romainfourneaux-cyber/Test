// Captures des maquettes statiques, en 1366 × 768 (souris) et 1340 × 800 (toucher émulé) -> atelier/captures/menus/maquette-*.png
const { chromium } = require("playwright");
const path = require("path");
const MAQ = path.join(__dirname, "..", "maquettes");
const SORTIE = path.join(__dirname, "..");
const PAGES = (process.env.PAGES || "accueil,cours,codex,reglages,arsenal,chargement,etats").split(",");
const SUFFIXE = process.env.SUFFIXE || "";
const T = { features: [{ name: "hover", value: "none" }, { name: "pointer", value: "coarse" }] };
(async () => {
  const nav = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
  for (const prof of [{ nom: "pc", w: 1366, h: 768, t: false }, { nom: "tablette", w: 1340, h: 800, t: true }]) {
    const ctx = await nav.newContext({ viewport: { width: prof.w, height: prof.h }, hasTouch: prof.t, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    let cdp = null;
    if (prof.t) { cdp = await ctx.newCDPSession(page); await cdp.send("Emulation.setEmulatedMedia", T); }
    for (const p of PAGES) {
      await page.goto("file://" + path.join(MAQ, p + ".html"));
      await page.waitForTimeout(700);
      const prep = {
        cours: () => { const b = document.querySelector(".semaine-bloc.courante"); const l = document.querySelector(".ligne-cours.etat-ouvert"); window.scrollTo(0, 0); },
        codex: () => { window.scrollTo(0, 260); },
        reglages: () => { window.scrollTo(0, 0); },
        arsenal: () => {},
      }[p];
      if (prep) await page.evaluate(prep);
      await page.waitForTimeout(150);
      const f = path.join(SORTIE, "maquette-" + p + "-" + prof.nom + SUFFIXE + ".png");
      await page.screenshot({ path: f });
      // un second cadrage pour les longues pages
      if (p === "cours") { await page.evaluate(() => document.querySelector(".semaine-bloc:nth-child(8)").scrollIntoView({ block: "start" })); await page.waitForTimeout(100); await page.screenshot({ path: f.replace(".png", "-suite.png") }); }
      if (p === "reglages") { await page.evaluate(() => document.querySelector(".liste-devoirs").scrollIntoView({ block: "center" })); await page.waitForTimeout(100); await page.screenshot({ path: f.replace(".png", "-suite.png") }); }
      if (p === "codex") { await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(100); await page.screenshot({ path: f.replace(".png", "-haut.png") }); }
      if (p === "etats") { await page.screenshot({ path: f.replace(".png", "-entiere.png"), fullPage: true }); if (cdp) { await cdp.send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 }); await cdp.send("Emulation.setEmulatedMedia", T); } }
      console.log(prof.nom, p, await page.evaluate(() => matchMedia("(pointer: coarse)").matches));
    }
    await ctx.close();
  }
  await nav.close();
})();
