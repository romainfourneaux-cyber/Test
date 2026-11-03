// Contrôles du lot C côté champ de bataille (plan atelier/conception/graphismes-animations-plan.md, C2.4, C2.6, et « si
// la tablette reste trop lente »), sous Node, sans navigateur : le régulateur seul (creerRegulateur de jeu/js/bataille.js),
// le plafond de netteté, les dessins de bataille-effets.js qui rendent à la toile l'opacité trouvée, la moitié des mottes et
// des étincelles, le pool de particules sans rien créer à chaque image, et ce qui se lit dans les fichiers (crans dans le
// dessin seulement, calque des nuages dans la feuille de style).
// Deux usages :
//   require("./tests-lot-c-bataille.js").controles().forEach(c => verifier(c.nom, c.ok, c.detail));   (tests.js)
//   node atelier/outils/tests-lot-c-bataille.js   (seul : une ligne OK ou ÉCHEC par contrôle, code de sortie 1 si échec)
// Les mesures dans le navigateur (boucle au ralenti 4 ×, issue identique à chaque niveau forcé) sont dans perf.js et dans
// la relecture du lot ; ici, ce qui ne demande pas de navigateur.
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const RACINE = path.join(__dirname, "..", "..");
const lire = f => fs.readFileSync(path.join(RACINE, "jeu", f), "utf8");
const sansCommentaires = t => t.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'\\])\/\/.*$/gm, "$1");

// Une fausse toile : garde l'opacité, compte les dessins et les traits.
function fausseToile() {
  const t = { globalAlpha: 1, dessins: 0, traits: 0, lineCap: "butt", strokeStyle: "", lineWidth: 1, fillStyle: "",
    globalCompositeOperation: "source-over" };
  ["save", "restore", "beginPath", "closePath", "fill", "stroke", "rect", "arc", "ellipse", "lineTo", "translate", "scale",
    "setTransform", "fillRect"].forEach(n => { t[n] = function () {}; });
  t.moveTo = function () { t.traits++; };
  t.drawImage = function () { t.dessins++; };
  t.createRadialGradient = () => ({ addColorStop() {} });
  return t;
}
function contexteDessin() {
  const ctx = { console, Math, Float32Array, Float64Array, Uint8Array,
    document: { createElement: () => ({ width: 0, height: 0, getContext: () => fausseToile() }) } };
  ctx.window = ctx; ctx.globalThis = ctx;
  vm.createContext(ctx);
  return ctx;
}

function controles() {
  const res = [];
  const C = (nom, ok, detail) => res.push({ nom, ok: !!ok, detail });

  // ---------- bataille-effets.js : opacité rendue, moitié des mottes et des étincelles ----------
  const cE = contexteDessin();
  vm.runInContext(lire("js/bataille-effets.js"), cE, { filename: "bataille-effets.js" });
  const FX = cE.JEU.batailleEffets;
  let t = fausseToile();
  t.globalAlpha = 0.4;
  const dessine = FX.poussierePose(t, 100, 100, 0.2, 77, false) | FX.poussierePose(t, 100, 100, 0.2, 77, true);
  C("Lot C, champ : la poussière d'une tour posée rend à la toile l'opacité trouvée (une tour en fondu ne redevient pas opaque)",
    dessine && Math.abs(t.globalAlpha - 0.4) < 1e-9 && t.dessins > 0, { alpha: t.globalAlpha, dessins: t.dessins });
  t = fausseToile(); t.globalAlpha = 0.5;
  FX.lueur(t, 10, 10, 0.05, 0.12, 6);
  const aLueur = t.globalAlpha;
  FX.etincelles(10, 10, 0.03, 5, 1, false, 1);
  FX.etincelles(20, 10, 0.12, 9, -1, false, 1); // la seconde moitié de sa course : un trait pâle
  FX.dessinerEtincelles(t);
  C("Lot C, champ : l'éclat d'un trait et les étincelles rendent aussi l'opacité trouvée", Math.abs(aLueur - 0.5) < 1e-9 && Math.abs(t.globalAlpha - 0.5) < 1e-9,
    { lueur: aLueur, etincelles: t.globalAlpha });
  // étincelles : la part 0,5 (cran 3 du régulateur) garde la moitié des traits, jamais moins d'un
  const traits = part => { const g = fausseToile(); let n = 0; for (let k = 1; k <= 8; k++) FX.etincelles(5 * k, 9, 0.03, k * 13, 1, false, k % 4 ? 1 : 2, part); FX.dessinerEtincelles(g); n = g.traits; return n; };
  const tPlein = traits(1), tMoitie = traits(0.5), tMin = (() => { const g = fausseToile(); FX.etincelles(5, 9, 0.03, 13, 1, false, 1, 0.01); FX.dessinerEtincelles(g); return g.traits; })();
  C("Lot C, régulateur niveau 3 : la moitié des étincelles (au moins un trait par coup)", tMoitie >= tPlein * 0.4 && tMoitie <= tPlein * 0.62 && tMin >= 1,
    { plein: tPlein, moitie: tMoitie, minimum: tMin });
  // mottes : la part 0,5 lance la moitié (3 ou 4 au lieu de 6 à 8), les mêmes que les premières
  const mottes = part => { FX.vider(); FX.mottes(200, 200, 4242, part); return FX.particules(); };
  const mPlein = mottes(1), mMoitie = mottes(0.5), mDefaut = mottes(undefined);
  FX.vider();
  C("Lot C, régulateur niveau 3 : la moitié des mottes d'une pierre (et toutes sans le régulateur)", mPlein >= 6 && mPlein <= 8 && mDefaut === mPlein &&
    mMoitie === Math.round(mPlein / 2), { plein: mPlein, moitie: mMoitie, defaut: mDefaut });
  // pool : rien n'est créé à chaque image (emettre, avancer, dessiner, mottes, étincelles, traînées)
  const srcE = sansCommentaires(lire("js/bataille-effets.js"));
  const corpsDe = (src, nom) => { const i = src.indexOf("function " + nom + "("); if (i < 0) return null; let j = src.indexOf("{", i), d = 1, k = j + 1; while (d && k < src.length) { if (src[k] === "{") d++; else if (src[k] === "}") d--; k++; } return src.slice(j, k); };
  const parImage = ["emettre", "avancer", "dessiner", "mottes", "etincelles", "dessinerEtincelles", "trainee", "dessinerTrainees", "poussierePose"];
  const allouent = parImage.filter(n => { const c = corpsDe(srcE, n); return !c || /\bnew\s|\[\s*\]|\{\s*\}|\.push\(|\.slice\(|\.map\(|\.concat\(/.test(c); });
  C("Lot C, C2.6 : particules, étincelles, traînées et poussières dessinées sans rien créer à chaque image (tableaux fixes)", allouent.length === 0, allouent);

  // ---------- bataille.js : le régulateur seul ----------
  const cB = contexteDessin();
  cB.JEU = { util: {}, batailleMoteur: { LARGEUR: 1000, HAUTEUR: 660, TROUPES: {}, ENNEMIS: {}, TOURS: {}, TOURS_RIVALES: {}, AMELIORATION: { max: 3 } } };
  vm.runInContext(lire("js/bataille.js"), cB, { filename: "bataille.js" });
  const B = cB.JEU.bataille, REG = B.REGULATEUR;
  C("Lot C, régulateur : réglages du plan (fenêtre 1 s, au-dessus de 4 ms un cran de moins, sous 3 ms un cran de plus, au plus un changement toutes les 2 s ; un cran qui ne rend pas 0,3 ms est rendu)",
    REG && REG.fenetre === 1 && REG.haut === 4 && REG.bas === 3 && REG.attente === 2 && REG.max === 8 && REG.gain === 0.3 && REG.nettete[4] === 1.5 && REG.nettete[5] === 1.25, REG);
  // une boucle donnée (ms par image ; ou fonction de l'heure et du niveau) pendant d secondes, à 60 images par seconde : la
  // suite des niveaux et leurs heures
  function jouer(r, d, duree, t0) {
    const changes = [];
    let niv = r.niveau, t = t0 || 0;
    for (; t < (t0 || 0) + d * 1000; t += 1000 / 60) { const n = r.noter(t, typeof duree === "function" ? duree(t, r.niveau) : duree); if (n !== niv) { changes.push([Math.round(t), n]); niv = n; } }
    return { changes, fin: t };
  }
  // une machine lente dont chaque cran allège la boucle de 0,5 ms (12 ms au niveau 0, 8 ms au dernier)
  const lourde = (t, n) => 12 - 0.5 * n;
  let r = B.creerRegulateur(0, () => true);
  const pc = jouer(r, 20, 2);
  C("Lot C, régulateur : une machine rapide (boucle de 2 ms) garde tout (niveau 0)", pc.changes.length === 0 && r.niveau === 0, pc.changes);
  r = B.creerRegulateur(0, () => true);
  const lent = jouer(r, 20, lourde);
  const ecarts = lent.changes.slice(1).map((c, i) => c[0] - lent.changes[i][0]);
  C("Lot C, régulateur : une machine lente (12 ms, chaque cran rend 0,5 ms) descend d'un cran à la fois, le premier après une fenêtre pleine, puis toutes les 2 s, jusqu'au dernier",
    lent.changes.length === REG.max && lent.changes[0][0] >= 850 && lent.changes[0][0] <= 1100 && ecarts.every(e => e >= 2000 && e <= 2100) &&
    lent.changes.every((c, i) => c[1] === i + 1) && r.niveau === REG.max, lent.changes);
  const remonte = jouer(r, 30, 1.5, lent.fin);
  C("Lot C, régulateur : quand la boucle redevient courte (1,5 ms), il rend les crans un par un, toutes les 2 s, jusqu'à 0",
    remonte.changes.length === REG.max && remonte.changes.every((c, i) => c[1] === REG.max - 1 - i) && r.niveau === 0, remonte.changes);
  r = B.creerRegulateur(0, () => true);
  const entre = jouer(r, 20, 3.5);
  C("Lot C, régulateur : entre 3 et 4 ms, il ne bouge pas (pas de va-et-vient)", entre.changes.length === 0 && r.niveau === 0, entre.changes);
  // une pointe isolée (une image de 40 ms, le reste à 2 ms) ne suffit pas : c'est la moyenne sur 1 s qui compte
  r = B.creerRegulateur(0, () => true);
  const pointe = jouer(r, 10, t => (Math.round(t) % 3000 < 17 ? 40 : 2));
  C("Lot C, régulateur : une image lente isolée ne fait pas descendre (moyenne glissante sur 1 s)", pointe.changes.length === 0, pointe.changes);
  // crans de netteté sans effet sur cet écran (la toile déjà à 1) : sautés, dans les deux sens
  r = B.creerRegulateur(0, n => REG.nettete[n] === undefined);
  const saute = jouer(r, 20, lourde), sauteHaut = jouer(r, 20, 1.5, saute.fin);
  C("Lot C, régulateur : les crans de netteté qui ne changeraient rien sont sautés (3 → 6 en un pas, 6 → 3 au retour)",
    JSON.stringify(saute.changes.map(c => c[1])) === "[1,2,3,6,7,8]" && JSON.stringify(sauteHaut.changes.map(c => c[1])) === "[7,6,3,2,1,0]",
    { descente: saute.changes, remontee: sauteHaut.changes });
  // un cran qui n'allège pas la boucle (mesuré au ralenti 4 × : la même boucle au cran 0 et au cran 8) : rendu à la décision
  // suivante, et plus de montée dans cette bataille ; il redescend encore si la boucle devient courte (chasse aux bugs du lot C)
  r = B.creerRegulateur(0, () => true);
  const vain = jouer(r, 20, 7);
  C("Lot C, régulateur : un cran qui n'allège pas la boucle (7 ms à tous les crans) est rendu 2 s plus tard, et il ne monte plus dans cette bataille",
    JSON.stringify(vain.changes.map(c => c[1])) === "[1,0]" && vain.changes[1][0] - vain.changes[0][0] >= 2000 && vain.changes[1][0] - vain.changes[0][0] <= 2100 &&
    r.niveau === 0 && r.plafond === 0, { changes: vain.changes, plafond: r.plafond });
  r = B.creerRegulateur(0, () => true);
  const moitie = jouer(r, 30, (t, n) => (n <= 3 ? 9 - n : 6));
  C("Lot C, régulateur : il garde les crans qui allègent (1 à 3 ici) et rend le premier qui ne rend rien (le 4e)",
    JSON.stringify(moitie.changes.map(c => c[1])) === "[1,2,3,4,3]" && r.niveau === 3 && r.plafond === 3, { changes: moitie.changes, plafond: r.plafond });
  r = B.creerRegulateur(6, () => true);
  const depart = jouer(r, 20, 1.5);
  C("Lot C, régulateur : parti d'un niveau de la séance (6), il rend les crans quand la boucle est courte, sans contrôle de gain à la descente",
    JSON.stringify(depart.changes.map(c => c[1])) === "[5,4,3,2,1,0]" && r.plafond === REG.max, depart.changes);
  r = B.creerRegulateur(2, () => true); r.force = true;
  const force = jouer(r, 20, 12);
  C("Lot C, régulateur : un niveau forcé (essais) ne bouge plus", r.niveau === 2 && force.changes.length === 0, force.changes);
  // plafond de la netteté : 2, 1,5 au niveau 4, 1,25 au niveau 5 ; 1,25 sur un écran tactile, quel que soit le niveau
  cB.JEU.ui = { tactile: false };
  const p0 = [0, 3, 4, 5, 8].map(n => B.plafondNettete(n));
  cB.JEU.ui.tactile = true;
  const p1 = [0, 4, 5].map(n => B.plafondNettete(n));
  C("Lot C : plafond de la netteté (2, puis 1,5 et 1,25 par le régulateur ; 1,25 sur un écran tactile)",
    JSON.stringify(p0) === "[2,2,1.5,1.25,1.25]" && JSON.stringify(p1) === "[1.25,1.25,1.25]", { souris: p0, tactile: p1 });
  C("Lot C : forcerNiveau borne le niveau (0 à " + REG.max + ") et rend la main avec null", B.forcerNiveau(99) === REG.max && B.forcerNiveau(-3) === 0 &&
    B.forcerNiveau(null) === null);

  // ---------- ce qui se lit dans les fichiers ----------
  const srcB = sansCommentaires(lire("js/bataille.js"));
  // la toile n'est jamais refaite en pleine bataille par le régulateur : crans de netteté sautés pendant la vague, reglerNiveau
  // sans ajusterNettete ; une toile refaite (fenêtre redimensionnée) repose les corps couchés dans la couche neuve
  const corpsReglerNiveau = corpsDe(srcB, "reglerNiveau") || "", corpsAjuster = corpsDe(srcB, "ajusterNettete") || "";
  C("Lot C, régulateur : il ne refait jamais la toile en pleine bataille (crans de netteté sautés pendant la vague ; ils valent à la bataille suivante)",
    corpsReglerNiveau && !/ajusterNettete|canvas\.width|batailleSol/.test(corpsReglerNiveau) &&
    /creerRegulateur\(v\.rendu\.niveau, function \(n\) \{ return REG\.nettete\[n\] === undefined; \}\)/.test(srcB), corpsReglerNiveau);
  C("Lot C : une toile refaite (fenêtre redimensionnée) repose les corps couchés dans la couche de sol neuve, à la bonne netteté",
    /batailleSol\.creer\(v\.fond, v\.ratio\);\s*for \(var ic = 0; ic < v\.corps\.length; ic\+\+\) \{ v\.corps\[ic\]\.pose = 0; v\.corps\[ic\]\.trace = null; \}/.test(corpsAjuster), null);
  // le niveau n'est lu que par le dessin : jamais dans un appel au moteur, jamais écrit dans la partie ou la sauvegarde
  const lignesNiveau = srcB.split("\n").filter(l => /\.niveau\b/.test(l) && /rendu\.niveau|R\.niveau/.test(l));
  const fautives = lignesNiveau.filter(l => /\bM\.\w+\(|\bp\.\w+\s*=[^=]|sauvegarde|reglages/.test(l));
  C("Lot C, régulateur : le niveau n'est lu que par le dessin (jamais passé au moteur, ni écrit dans la partie ou la sauvegarde)",
    lignesNiveau.length >= 8 && fautives.length === 0, fautives);
  C("Lot C : le dessin appelle toujours JEU.anim.ambiance() (réglage Ambiance et régulateur des écrans) pour l'ambiance du champ",
    /JEU\.anim\.ambiance\s*\?\s*JEU\.anim\.ambiance\(\)/.test(srcB));
  // C2.6 : places fortes, tours, ombres, poussières et éclats passent par une vue gardée (spriteGarde → vueFigure)
  // (seuls restent dessinés de l'image rendue : les traits tournés le long de leur vol, la pierre qui tourne, les drapeaux de
  // la fin, et la tour qui sort de terre ou s'améliore, rognée, le temps d'un tiers de seconde)
  const directs = (srcB.match(/sprite\(ctx, ("ombre-[^"]*"\s*\+|"effet-poussiere"|"effet-eclats"|"effet-effondrement"|"place-|"tour-)/g) || []);
  const corpsPlace = corpsDe(srcB, "place") || "", corpsTour = corpsDe(srcB, "tour") || "";
  C("Lot C, C2.6 : places fortes, tours, ombres, poussières, éclats et nuage d'effondrement copiés de vues gardées (aucune réduction de l'image rendue à chaque image)",
    /function spriteGarde\(/.test(srcB) && (srcB.match(/spriteGarde\(ctx,/g) || []).length >= 18 && directs.length === 0 &&
    !/[^e]sprite\(ctx, nom/.test(corpsPlace) && !/[^e]sprite\(ctx, nom/.test(corpsTour), { directs, place: /[^e]sprite\(ctx, nom/.test(corpsPlace), tour: /[^e]sprite\(ctx, nom/.test(corpsTour) });
  // nuages : calque de la feuille de style (transform seulement), caché sans ambiance
  const css = lire("css/jeu.css").replace(/\/\*[\s\S]*?\*\//g, "");
  const kf = /@keyframes\s+td-nuage\s*\{([^{}]*\{[^}]*\}[^{}]*)*\}/.exec(css);
  C("Lot C : ombres des nuages en calque de la feuille de style (transform seulement, caché par défaut, montré avec l'ambiance)",
    kf && !/opacity|left|top|background|width/.test(kf[0].replace(/@keyframes\s+td-nuage/, "")) && /transform/.test(kf[0]) &&
    /\.td-nuages\s*\{[^}]*display:\s*none/.test(css) && /\.td-nuages\.td-nuages-vus\s*\{[^}]*display:\s*block/.test(css) &&
    /classList\.toggle\("td-nuages-vus", ambiance\)/.test(srcB), kf ? kf[0] : null);
  // aucun Math.random neuf dans le dessin : seuls les tirages d'avant le lot C (figurines et chutes, une fois par troupe)
  const tirages = (srcB.match(/Math\.random\(\)/g) || []).length;
  C("Lot C : aucun Math.random neuf dans bataille.js (les 10 tirages d'avant : figurines, chutes et mots du rival, quel que soit le niveau)", tirages === 10, tirages);
  return res;
}

module.exports = { controles };

if (require.main === module) {
  const r = controles();
  r.forEach(c => console.log((c.ok ? "OK     " : "ÉCHEC  ") + c.nom + (c.ok || c.detail === undefined ? "" : " → " + JSON.stringify(c.detail))));
  const ko = r.filter(c => !c.ok).length;
  console.log("\n" + (r.length - ko) + " réussis, " + ko + " en échec.");
  process.exit(ko ? 1 : 0);
}
