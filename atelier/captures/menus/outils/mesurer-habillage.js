// Même mesure, mais sans et avec la feuille alternés dans la même page (la feuille est activée puis désactivée à
// chaque ouverture) : le bruit des autres processus touche les deux de la même façon. 9 ouvertures de chaque, médiane.
const { chromium } = require("playwright");
const path = require("path");
const CSS = "file://" + path.join(__dirname, "..", "maquettes", process.env.FEUILLE || "menus.css");
(async () => {
  const nav = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
  const ctx = await nav.newContext({ viewport: { width: 1340, height: 800 }, hasTouch: true });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Emulation.setEmulatedMedia", { features: [{ name: "hover", value: "none" }, { name: "pointer", value: "coarse" }] });
  await page.goto("file:///home/user/Test/jeu/index.html"); await page.waitForFunction(() => window.JEU && JEU.pret);
  await page.evaluate(() => JEU.ui.fermerModale());
  await page.evaluate(href => new Promise(ok => { const l = document.createElement("link"); l.id = "maq"; l.rel = "stylesheet"; l.href = href; l.onload = ok; document.head.appendChild(l); }), CSS);
  await page.waitForTimeout(500);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await cdp.send("Performance.enable");
  const metr = async () => { const r = await cdp.send("Performance.getMetrics"); const o = {}; r.metrics.forEach(x => { o[x.name] = x.value; }); return o; };
  const res = {};
  for (const nom of (process.env.ECRANS || "cours,codex,reglages").split(",")) {
    const m = { sans: [], avec: [] }, w = { sans: [], avec: [] };
    for (let k = 0; k < 24; k++) {
      const avec = k % 2 === 1;
      await page.evaluate(a => { document.getElementById("maq").disabled = !a; JEU.ui.afficher("domaine"); }, avec);
      await page.waitForTimeout(220);
      const a0 = await metr();
      m[avec ? "avec" : "sans"].push(await page.evaluate(n => new Promise(ok => { const t0 = performance.now(); JEU.ui.afficher(n);
        requestAnimationFrame(() => requestAnimationFrame(() => ok(performance.now() - t0))); }), nom));
      const a1 = await metr();
      w[avec ? "avec" : "sans"].push(1000 * ((a1.RecalcStyleDuration - a0.RecalcStyleDuration) + (a1.LayoutDuration - a0.LayoutDuration) + (a1.ScriptDuration - a0.ScriptDuration)));
    }
    const med = a => +a.slice().sort((x, y) => x - y)[Math.floor(a.length / 2)].toFixed(1);
    res[nom] = { horloge: [med(m.sans), med(m.avec), (100 * (med(m.avec) / med(m.sans) - 1)).toFixed(0) + " %"],
      travail: [med(w.sans), med(w.avec), (100 * (med(w.avec) / med(w.sans) - 1)).toFixed(0) + " %"] };
  }
  console.log(JSON.stringify(res));
  await nav.close();
})();
