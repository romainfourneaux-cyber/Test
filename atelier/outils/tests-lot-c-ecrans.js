// Contrôles du lot C, écrans (plan atelier/conception/graphismes-animations-plan.md, C2.1, C2.2, C2.3, C2.5, C2.7) : accueil
// sans repeinte, domaine sans flou ni animation dans son SVG, réglage « Ambiance », régulateur des écrans, finitions (focus,
// chiffres, pulsations), porte d'une expédition et réponses (rien de lourd dans l'image qui suit une réponse).
// Deux familles, comme atelier/outils/controles-menus.js :
//   statique() : lecture des fichiers et essais en Node (vm), pour tests.js ; renvoie [{ nom, ok, detail }] ;
//     require("./tests-lot-c-ecrans.js").statique().forEach(c => verifier(c.nom, c.ok, c.detail));
//   page(chromium) : essais dans le jeu ouvert (Playwright), pour perf.js ; renvoie la même forme.
// Seul : NODE_PATH=/opt/node22/lib/node_modules node atelier/outils/tests-lot-c-ecrans.js [--statique]
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const RACINE = path.join(__dirname, "..", "..");
const JEU = path.join(RACINE, "jeu");
const lire = f => fs.readFileSync(path.join(JEU, f), "utf8");
const URL_JEU = "file://" + path.join(JEU, "index.html");
const COMPOSITEUR = new Set(["transform", "opacity", "translate", "scale", "rotate"]);
// boucles d'ambiance : rien de cela ne doit tourner quand l'ambiance est coupée ; perf.js lit cette même expression
// (exportée plus bas), pour qu'une boucle neuve du domaine soit vue des deux côtés
const AMBIANCE = /nuage|oiseau|battre|fum|flott|drapeau|banni|brume|courant|eau|poussi|kenburns|respiration|reflet-domaine|villageois|tourner/i;

function sansCommentaires(css) { return css.replace(/\/\*[\s\S]*?\*\//g, ""); }
// @keyframes nom { … } → { nom: [propriétés animées] }
function keyframes(css) {
  const res = {}, s = sansCommentaires(css), re = /@keyframes\s+([\w-]+)\s*\{/g;
  let m;
  while ((m = re.exec(s))) {
    let n = 1, j = re.lastIndex;
    while (j < s.length && n) { if (s[j] === "{") n++; else if (s[j] === "}") n--; j++; }
    const corps = s.slice(re.lastIndex, j - 1);
    res[m[1]] = Array.from(new Set((corps.match(/([a-z-]+)\s*:/g) || []).map(p => p.replace(/\s*:$/, ""))));
  }
  return res;
}

// Un contexte Node du jeu (sauvegarde, anim.js) avec une horloge truquée : requestAnimationFrame et setTimeout avancent à la main.
function contexteAnim() {
  const stock = {}, rafs = [], minuteries = [];
  let maintenant = 0;
  const ctx = { console, Buffer, btoa: globalThis.btoa, atob: globalThis.atob,
    localStorage: { getItem: k => (k in stock ? stock[k] : null), setItem: (k, v) => { stock[k] = String(v); }, removeItem: k => { delete stock[k]; } },
    requestAnimationFrame: f => { rafs.push(f); return rafs.length; },
    setTimeout: (f, d) => { minuteries.push({ f, t: maintenant + (d || 0) }); return minuteries.length; }, clearTimeout: () => {},
    matchMedia: () => ({ matches: false, addEventListener() {} }), performance: { now: () => maintenant } };
  ctx.window = ctx; ctx.globalThis = ctx;
  vm.createContext(ctx);
  ["noyau", "brouillage", "calendrier", "sauvegarde", "leitner", "progression", "questions", "rappels", "recit", "campagne", "expedition", "anim"].forEach(m => {
    vm.runInContext(lire("js/" + m + ".js"), ctx, { filename: m + ".js" });
  });
  ["config", "planning", "devoirs", "suivi"].forEach(f => vm.runInContext(lire("data/" + f + ".js"), ctx));
  // avance l'horloge de duree ms, une image toutes les « ecart » ms
  ctx.avancer = (duree, ecart) => {
    const fin = maintenant + duree;
    while (maintenant < fin) {
      maintenant += ecart;
      minuteries.splice(0).forEach(m => { if (m.t <= maintenant) m.f(); else minuteries.push(m); });
      rafs.splice(0).forEach(f => f(maintenant));
    }
  };
  ctx.appliquees = 0;
  ctx.JEU.ui = { appliquerAnimations: () => { ctx.appliquees++; } };
  return ctx;
}

function statique() {
  const res = [];
  const ok = (nom, cond, detail) => res.push({ nom, ok: !!cond, detail: detail == null ? "" : detail });
  const css = lire("css/jeu.css"), menus = lire("css/menus.css"), kf = keyframes(css);
  const anim = lire("js/anim.js"), inter = lire("js/interface.js"), dom = lire("js/domaine.js"), exp = lire("js/ecran-expedition.js");

  // 1. réglage « Ambiance » : absent = actif ; coupé, il le reste après export puis import ; Animations coupées le coupent
  {
    const c = contexteAnim(), J = c.JEU;
    J.sauvegarde.remplacer(J.sauvegarde.nouvelle());
    const neuf = !("ambiance" in J.sauvegarde.etat().reglages) && J.anim.ambiance() === true;
    const v3 = JSON.parse(JSON.stringify(J.sauvegarde.nouvelle())); delete v3.rappels; v3.schema = 3;
    const m3 = J.sauvegarde.migrer(JSON.parse(JSON.stringify(v3)));
    J.sauvegarde.remplacer(m3);
    const ancien = JSON.stringify(m3.reglages) === JSON.stringify(v3.reglages) && J.anim.ambiance() === true;
    J.sauvegarde.etat().reglages.ambiance = false;
    const coupe = J.anim.ambiance() === false && J.anim.actif() === true;
    J.sauvegarde.importer(J.sauvegarde.texteExport());
    const garde = J.sauvegarde.etat().reglages.ambiance === false && J.anim.ambiance() === false;
    J.sauvegarde.etat().reglages.ambiance = true;
    J.sauvegarde.importer(J.sauvegarde.texteExport());
    const rendu = J.sauvegarde.etat().reglages.ambiance === true && J.anim.ambiance() === true;
    J.sauvegarde.etat().reglages.animations = false;
    const parAnim = J.anim.ambiance() === false;
    ok("Réglage « Ambiance » : actif sans le champ (sauvegarde neuve ou ancienne, rien de perdu), coupé ou remis il le reste après export puis import, Animations coupées le coupent",
      neuf && ancien && coupe && garde && rendu && parAnim, { neuf, ancien, coupe, garde, rendu, parAnim });
  }
  // 2. régulateur des écrans : coupe l'ambiance pour la séance au-delà de 20 ms d'écart médian, sans rien écrire
  {
    const c = contexteAnim(), J = c.JEU, R = J.anim.regulateur;
    J.sauvegarde.remplacer(J.sauvegarde.nouvelle());
    const avant = JSON.stringify(J.sauvegarde.etat().reglages);
    J.anim.surveiller("cours"); c.avancer(3000, 33);
    const horsAmbiance = !R.mesure && !R.coupe && R.fenetres === 0;
    J.anim.surveiller("domaine"); c.avancer(8000, 16.7);
    const fluide = !R.coupe && !R.mesure && R.fenetres === 1 && R.mediane < 20;
    J.anim.surveiller("jouer"); c.avancer(600, 16.7); c.avancer(2600, 33.4);
    const lent = R.coupe === true && R.coupeSur === "jouer" && J.anim.ambiance() === false && J.anim.actif() === true && c.appliquees >= 1;
    const rienEcrit = JSON.stringify(J.sauvegarde.etat().reglages) === avant;
    R.reinitialiser();
    const remis = !R.coupe && J.anim.ambiance() === true;
    ok("Régulateur des écrans : muet hors des écrans à ambiance, se tait après une fenêtre fluide de 2 s, coupe l'ambiance (pas Animations) après 2 s à plus de 20 ms d'écart médian, sans rien écrire dans la sauvegarde",
      horsAmbiance && fluide && lent && rienEcrit && remis, { horsAmbiance, fluide, lent, rienEcrit, remis, mediane: R.mediane });
  }
  // 3. ce qui tourne en continu sur les écrans du lot n'anime que transform, opacity, translate, scale
  const voulues = ["poussieres", "kenBurns", "respiration", "reflet-domaine", "flotter", "tourner", "fumee-domaine", "nuage-domaine", "oiseaux-domaine",
    "villageois-va", "villageois-tourne", "villageois-saute", "halo-quartier", "rebond", "lueur-passe", "monte", "lueur-monte", "halo-carte", "lueur-jour"];
  const absentes = voulues.filter(n => !kf[n]);
  const hors = voulues.filter(n => kf[n] && kf[n].some(p => !COMPOSITEUR.has(p))).map(n => n + " : " + kf[n].join(", "));
  ok("Écrans : accueil, domaine, pulsations et signaux de jeu animés par transform, opacity, translate ou scale seulement", !absentes.length && !hors.length, { absentes, hors });
  const anciennes = ["courant", "halo", "nuages", "oiseaux", "fumee"].filter(n => kf[n]);
  ok("Domaine : plus de courant en stroke-dashoffset, de halo en stroke-width, de nuages flous ni de fumée dans le SVG", !anciennes.length &&
    !/feGaussianBlur|url\(#flou\)|class='(courant|nuages|oiseaux|villageois|fumee|ailes)'/.test(dom), anciennes);
  ok("Domaine : le calque de vie (.vie-domaine) et le halo du quartier existent, sans tirage au hasard", /function vieHTML/.test(dom) && /vie-domaine/.test(dom) && /halo-quartier/.test(dom) && !/Math\.random/.test(dom));
  ok("Accueil : les poussières montent par une translation (::after deux fois plus haut), plus par background-position ; le focus de « Jouer » ne fait pas défiler",
    kf.poussieres && kf.poussieres.join() === "transform" && /tapisserie::after\s*\{[^}]*height:\s*200%/.test(sansCommentaires(css)) && /jouer\.focus\(\{ preventScroll: true \}\)/.test(inter));
  // 4. ambiance coupée : la classe body.sans-ambiance, posée par ui.appliquerAnimations, arrête l'accueil, le domaine, le chroniqueur
  const sa = sansCommentaires(css);
  ok("Ambiance coupée : body.sans-ambiance posée par ui.appliquerAnimations, et les feuilles arrêtent poussières, tapisserie, blason, chroniqueur et calque du domaine (le halo du quartier reste)",
    /toggle\("sans-ambiance"/.test(inter) && ["\\.sans-ambiance \\.scene-fond\\.tapisserie::before", "\\.sans-ambiance \\.scene-fond\\.tapisserie::after", "\\.sans-ambiance \\.blason-grand,",
      "\\.sans-ambiance \\.mentor\\.visible", "\\.sans-ambiance \\.vie-domaine > :not\\(\\.halo-quartier\\)"].every(r => new RegExp(r).test(sa)));
  ok("Réglages : case « Ambiance » (data-reglage=ambiance) sous « Animations », grisée quand Animations est décoché ; habillée en sceau comme les autres cases",
    /"data-reglage": "ambiance"/.test(inter) && /Ambiance \(nuages, fumées, oiseaux, drapeaux\)/.test(inter) && /ambCase\.disabled = !animCase\.checked/.test(inter) && /label\.reglage-ambiance/.test(menus));
  // chasse aux bugs du lot C : après une coupure du régulateur des écrans, la case dit pourquoi, et la recocher rend l'ambiance
  ok("Réglages : après une coupure du régulateur des écrans, une note le dit, et recocher « Ambiance » rend l'ambiance et une nouvelle mesure (reinitialiser)",
    /if \(ambCase\.checked && regEcrans && regEcrans\.coupe\) \{ regEcrans\.reinitialiser\(\);/.test(inter) && /var ambNote = regEcrans && regEcrans\.coupe/.test(inter));
  ok("Porte d'une expédition : le son et le message d'une bonne réponse partent après l'image qui suit la réponse",
    /JEU\.anim\.apresImage\(annoncer\)/.test(exp) && /var annoncer = function \(\) \{ JEU\.sons\.jouer\("coup"\); JEU\.ui\.toast\(texteJuste\); \};/.test(exp));
  ok("Signaux de jeu (halos des lieux, lueur de l'événement du jour) : jamais coupés par l'ambiance (ils suivent Animations)",
    !/\.sans-ambiance[^{]*\.halo(?![\w-])/.test(sa) && !/\.sans-ambiance[^{]*evenement::after/.test(sa));
  // 5. finitions : chiffres en Crimson Text sur la carte, la route et le bandeau du champ (compteur à rouleaux inchangé) ; focus en halo
  ok("Chiffres : police « Chiffres » sur la carte de campagne, la route des expéditions, le bandeau du champ et l'or qui y vole ; colonne de .66em par chiffre et roulement gardés",
    /#ecran-jouer, #ecran-expedition, #ecran-partie \.td-hud, \.td-or-volant\s*\{\s*--titre:\s*"Chiffres"/.test(menus) && /\.td-chiffre\s*\{[^}]*width:\s*\.66em/.test(sa) && /\.td-chiffre::before\s*\{[^}]*transition:\s*transform/.test(sa));
  ok("Focus au clavier : halo d'or arrondi (box-shadow) sur les réponses, liens, cartes, médaillons et ordres de bataille ; le quartier du domaine s'éclaire par son trait",
    /:is\(\.choix, \.lien, \.td-bouton, \.carte-jeu, \.carte-faveur[^)]*\):focus-visible\s*\{\s*outline:\s*none;\s*box-shadow:\s*var\(--halo\)/.test(menus) && /\.quartier:focus-visible rect:nth-child\(2\)/.test(menus));
  ok("Pulsations : plus aucune ombre animée (médaillon des ressources, jauges du royaume) ; leur lueur passe par l'opacité d'un pseudo-élément",
    !Object.keys(kf).some(n => kf[n].indexOf("box-shadow") >= 0) && /\.ressource\.rebond \.medaillon::after/.test(sa) && /\.jauge-royaume\.monte \.jr-icone::after/.test(sa));
  // 6. réponse → suite : l'éventail de la porte part une image plus tard ; les gerbes en vol sautent l'image de la réponse
  ok("Porte d'une expédition : les cartes et leur éventail partent une image après la réponse (JEU.anim.apresImage), dans la même fenêtre, sans rejouer son entrée",
    /JEU\.anim\.apresImage\(lancer\)/.test(exp) && /"cartes-faveur " \+ \(anime \? "attend" : "eventail"\)/.test(exp) && /rendreCartes\(s, X\.enCours\(\), off, \{ surPlace: true \}\)/.test(exp) && /\.cartes-faveur\.attend\s*\{/.test(sa));
  ok("Feuilles de la partie et de l'expédition : couches à taille fixe (lueur posée depuis le haut, bords en bandes), sans dégradé à la taille de la boîte ni ombre intérieure, pour qu'une réponse qui change leur hauteur ne les repeigne pas en entier",
    /#ecran-partie\.ecran, #ecran-expedition\.ecran\s*\{[^}]*radial-gradient\(ellipse 90% 540px at 50% 300px[^}]*\/ 100% 8000px no-repeat[^}]*box-shadow:\s*var\(--filet\), 0 18px 40px[^;]*;\s*\}/.test(sa));
  ok("Réponses : les gerbes encore en vol sautent l'image qui montre la question suivante (JEU.anim.laisserPasser, appelé par poserQuestion) ; la requête « réduire les animations » est créée une fois",
    /JEU\.anim\.laisserPasser\(\)/.test(inter) && /if \(sauter\) \{ sauter = false;/.test(anim) && !/function actif\(\) \{[^}]*matchMedia\(/.test(anim));
  return res;
}

// ---------------------------------------------------------------- dans le jeu ouvert
const attendre = ms => new Promise(r => setTimeout(r, ms));
async function ouvrir(nav, w, h, tactile) {
  const ctx = await nav.newContext({ viewport: { width: w, height: h }, hasTouch: !!tactile, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  page.setDefaultTimeout(20000);
  const erreurs = [];
  page.on("pageerror", e => erreurs.push(e.message));
  if (tactile) { const cdp = await ctx.newCDPSession(page); await cdp.send("Emulation.setEmulatedMedia", { features: [{ name: "hover", value: "none" }, { name: "pointer", value: "coarse" }] }); }
  await page.goto(URL_JEU);
  await page.waitForFunction(() => window.JEU && JEU.pret);
  return { ctx, page, erreurs };
}
const SCAN = `(() => document.getAnimations().filter(a => a.effect && a.effect.getTiming().iterations === Infinity).map(a => {
  const t = a.effect.target, kf = a.effect.getKeyframes ? a.effect.getKeyframes() : [];
  const props = Array.from(new Set([].concat(...kf.map(k => Object.keys(k).filter(p => !/^(offset|easing|composite|computedOffset)$/.test(p))))));
  let filtre = false;
  for (let e = t; e && e.nodeType === 1; e = e.parentElement) { if (e.getAttribute("filter") || getComputedStyle(e).filter !== "none") { filtre = true; break; } if (e.classList && e.classList.contains("ecran")) break; }
  return { nom: a.animationName || "web", props, filtre, dansPlan: !!(t && t.closest && t.closest("svg.plan")), cible: t ? (t.tagName + "." + String(t.className && t.className.baseVal !== undefined ? t.className.baseVal : t.className)).slice(0, 50) : "" };
}))()`;

async function page(chromium) {
  const res = [];
  const ok = (nom, cond, detail) => res.push({ nom, ok: !!cond, detail: detail == null ? "" : (typeof detail === "string" ? detail : JSON.stringify(detail)) });
  const nav = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined });
  try {
    // 1. accueil : menu visible à l'ouverture (1366 × 768, souris), « Jouer » au focus sans défilement
    {
      const o = await ouvrir(nav, 1366, 768, false);
      await attendre(900);
      const r = await o.page.evaluate(() => { const m = document.getElementById("menu").getBoundingClientRect(), j = document.querySelector("#ecran-accueil .bouton.enorme");
        return { scrollY: window.scrollY, menuHaut: Math.round(m.top), menuBas: Math.round(m.bottom), focus: document.activeElement === j, jouerBas: Math.round(j.getBoundingClientRect().bottom), h: innerHeight }; });
      ok("Accueil 1366 × 768 : menu visible à l'ouverture, « Jouer » au focus et visible, page non défilée", r.scrollY === 0 && r.menuHaut >= 0 && r.menuBas <= r.h && r.focus && r.jouerBas <= r.h, r);
      const a = await o.page.evaluate(SCAN);
      const p = a.find(x => x.nom === "poussieres");
      ok("Accueil : les poussières tournent en transform seulement, et rien d'animé sous un filtre (le blason bouge par son cadre)", p && p.props.join() === "transform" && !a.some(x => x.filtre), a);
      if (o.erreurs.length) ok("Accueil : aucune erreur de page", false, o.erreurs.slice(0, 3).join(" | "));
      await o.ctx.close();
    }
    // 2. domaine, campagne, accueil : ambiance active puis coupée ; régulateur
    {
      const o = await ouvrir(nav, 1340, 800, true), P = o.page;
      await P.evaluate(() => { const e = JEU.sauvegarde.etat(); e.reglages.musique = false; e.reglages.son = false; e.batiments = ["moulin", "forge", "tour-de-guet"]; JEU.ui.fermerModale(); JEU.ui.afficher("domaine"); });
      await attendre(1000);
      const d = await P.evaluate(SCAN);
      const dans = d.filter(x => x.dansPlan || x.filtre), hors = d.filter(x => x.props.some(p => !["transform", "opacity", "translate", "scale", "rotate"].includes(p)));
      const filtres = await P.evaluate(() => document.querySelectorAll("#ecran-domaine svg.plan filter feGaussianBlur, #ecran-domaine svg.plan [filter='url(#flou)']").length);
      const vie = await P.evaluate(() => ({ calque: !!document.querySelector("#ecran-domaine .vie-domaine.ambiance"), villageois: document.querySelectorAll("#ecran-domaine .villageois-domaine").length, fanions: document.querySelectorAll("#ecran-domaine .vie-domaine .flotte").length }));
      ok("Domaine : rien n'est animé dans le SVG du plan, aucun flou ; le calque de vie tourne en transform, opacity, translate et scale (" + d.length + " animations)",
        !dans.length && !hors.length && !filtres && vie.calque && vie.villageois >= 4 && vie.fanions === 6 && d.length >= 10, { dans, hors, filtres, vie });
      // halo du quartier : le seigneur au château
      await P.evaluate(() => { const b = JEU.domaine.balade; b.x = 500; b.y = 150; JEU.ui.afficher("accueil"); JEU.ui.afficher("domaine"); });
      await attendre(400);
      const halo = await P.evaluate(() => { const h = document.querySelector("#ecran-domaine .halo-quartier.vu"); if (!h) return null; const a = h.getAnimations({ subtree: true }).map(x => x.animationName + ":" + Object.keys(x.effect.getKeyframes()[0] || {}).join("/")); return a; });
      ok("Domaine : le halo du quartier où se tient le seigneur respire par l'opacité d'un pseudo-élément", halo && halo.some(x => /^halo-quartier:.*opacity/.test(x)), halo);
      // ambiance coupée par le réglage
      await P.evaluate(() => { JEU.sauvegarde.etat().reglages.ambiance = false; JEU.ui.appliquerAnimations(); });
      const restes = {};
      for (const e of ["accueil", "domaine", "jouer"]) {
        await P.evaluate(x => { JEU.ui.afficher(x); JEU.ui.fermerModale(); window.scrollTo(0, 0); }, e);
        await attendre(900);
        restes[e] = (await P.evaluate(SCAN)).map(x => x.nom);
      }
      const ambiances = Object.keys(restes).map(e => restes[e].filter(n => AMBIANCE.test(n)).map(n => e + " : " + n)).flat();
      const classe = await P.evaluate(() => document.body.classList.contains("sans-ambiance"));
      ok("Ambiance coupée (Réglages) : body.sans-ambiance, plus aucune boucle d'ambiance sur l'accueil, le domaine et la carte ; les signaux de jeu restent (halos, lueur du jour)",
        classe && !ambiances.length && restes.jouer.includes("halo-carte"), restes);
      await P.evaluate(() => { delete JEU.sauvegarde.etat().reglages.ambiance; JEU.ui.appliquerAnimations(); });
      // régulateur : des images de 30 ms sur le domaine
      const reg = await P.evaluate(() => new Promise(fin => {
        const avant = JSON.stringify(JEU.sauvegarde.etat().reglages);
        JEU.anim.regulateur.reinitialiser();
        let lourd = true;
        (function charge() { if (!lourd) return; const t = performance.now(); while (performance.now() - t < 30) { /* image lente */ } requestAnimationFrame(charge); })();
        JEU.ui.afficher("accueil"); JEU.ui.afficher("domaine");
        setTimeout(() => {
          lourd = false;
          const R = JEU.anim.regulateur;
          const r = { coupe: R.coupe, coupeSur: R.coupeSur, mediane: R.mediane, classe: document.body.classList.contains("sans-ambiance"), animations: JEU.anim.actif(), rienEcrit: JSON.stringify(JEU.sauvegarde.etat().reglages) === avant };
          R.reinitialiser();
          r.remis = !document.body.classList.contains("sans-ambiance") && JEU.anim.ambiance();
          fin(r);
        }, 4500);
      }));
      ok("Régulateur des écrans : des images de plus de 20 ms pendant 2 s sur le domaine coupent l'ambiance pour la séance (classe posée, Animations gardées, rien d'écrit dans la sauvegarde)",
        reg.coupe && reg.coupeSur === "domaine" && reg.classe && reg.animations && reg.rienEcrit && reg.remis, reg);
      // Réglages : la case et son lien avec Animations
      await P.evaluate(() => JEU.ui.afficher("reglages"));
      await attendre(300);
      const cases = await P.evaluate(() => {
        const a = document.querySelector("input[data-reglage=animations]"), b = document.querySelector("input[data-reglage=ambiance]");
        if (!a || !b) return null;
        const r = { cocheeAuDepart: b.checked, actifAuDepart: !b.disabled };
        b.click(); r.apresClic = JEU.sauvegarde.etat().reglages.ambiance === false && document.body.classList.contains("sans-ambiance");
        a.click(); r.griseeSansAnimations = b.disabled && document.body.classList.contains("sans-anim");
        a.click(); b.click(); r.remise = JEU.sauvegarde.etat().reglages.ambiance === true && !b.disabled && !document.body.classList.contains("sans-ambiance");
        const l = b.closest("label").getBoundingClientRect(); r.hauteur = Math.round(l.height);
        return r;
      });
      ok("Réglages : la case « Ambiance » coupe et remet l'ambiance, se grise quand Animations est décoché, cible de 44 px au doigt",
        cases && cases.cocheeAuDepart && cases.actifAuDepart && cases.apresClic && cases.griseeSansAnimations && cases.remise && cases.hauteur >= 44, cases);
      // chiffres sur la carte
      await P.evaluate(() => { JEU.ui.afficher("jouer"); JEU.ui.fermerModale(); });
      await attendre(300);
      const police = await P.evaluate(() => { const n = document.querySelector("#ecran-jouer .carte-svg .nom-lieu"); return n ? getComputedStyle(n).fontFamily : null; });
      ok("Carte de campagne : chiffres en Crimson Text (« Chiffres » d'abord)", police && /^"?Chiffres/.test(police), police);
      if (o.erreurs.length) ok("Domaine, carte, réglages : aucune erreur de page", false, o.erreurs.slice(0, 3).join(" | "));
      await o.ctx.close();
    }
  } finally { await nav.close(); }
  return res;
}

module.exports = { statique, page, AMBIANCE };

if (require.main === module) {
  (async () => {
    const tout = statique();
    if (process.argv.indexOf("--statique") < 0) tout.push(...await page(require("playwright").chromium));
    let echecs = 0;
    tout.forEach(c => { if (!c.ok) echecs++; console.log((c.ok ? "ok    " : "ÉCHEC ") + c.nom + (!c.ok && c.detail ? " : " + (typeof c.detail === "string" ? c.detail : JSON.stringify(c.detail)) : "")); });
    console.log(tout.length + " contrôles, " + echecs + " en échec");
    process.exit(echecs ? 1 : 0);
  })().catch(e => { console.error(e); process.exit(2); });
}
