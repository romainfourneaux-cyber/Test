// Génère jeu/data/planning.js et jeu/data/devoirs.js à partir des entrées
// extraites de l'emploi du temps (atelier/extractions/Emploi du temps - entrees par matiere.json)
// et du plan des devoirs (relevé à la main ci-dessous, PDF d'une page).
// Usage : node atelier/outils/generer-planning.js
// Attention : un identifiant publié ne change plus jamais. Ce script ne doit être relancé
// que si l'on vérifie ensuite que les identifiants existants sont inchangés.
"use strict";
const fs = require("fs");
const path = require("path");

const RACINE = path.join(__dirname, "..", "..");
const ENTREES = path.join(RACINE, "atelier", "extractions", "Emploi du temps - entrees par matiere.json");
const ORDRE_JOURS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];
const MATIERES = ["histoire", "geographie", "svt", "physique", "litterature", "lecture"];

// Plan des devoirs 5e (DEPOT/planning/Plan des devoirs 5e scolarite complete.pdf, page 1),
// matières du jeu seulement. Semaine = celle du plan.
const PLAN_DEVOIRS = {
  litterature: [4, 7, 10, 13, 17, 20, 23],
  lecture: [11, 20, 33],
  geographie: [6, 11, 19, 24],
  histoire: [10, 15, 20, 26, 30, 33],
  svt: [7, 12, 17, 22, 26, 31],
  physique: [12, 20, 30],
  anglais: [5, 13, 18, 22, 28, 32]
};
const NOMS = {
  histoire: "Histoire", geographie: "Géographie", svt: "SVT", physique: "Physique-chimie",
  litterature: "Littérature", lecture: "Lecture suivie", anglais: "Anglais"
};

function typeEntree(m, t) {
  const s = t.toLowerCase();
  if (/devoir d’entraînement|autocorrection|\btest en\b/.test(s)) return "revision";
  if (m === "lecture" && /fiche de lecture/.test(s)) {
    return /envoyer|commencer la fiche|finir la fiche/.test(s) ? "devoir" : "revision";
  }
  if (/dossier|leçon|lire (les |le )?(textes?|p ?\d)/.test(s)) return "cours";
  if (/devoir/.test(s)) return "devoir";
  if (/révis|carte mentale|exercices|teste tes connaissances|quizz?\b|arrêt sur lecture/.test(s)) return "revision";
  return "cours";
}

function nettoyer(t) {
  return t.replace(/\s+/g, " ").replace(/\s*–\s*–\s*/g, " – ").replace(/bysantin/g, "byzantin")
    .replace(/2ère partie/g, "2e partie").replace(/2ème partie/g, "2e partie").replace(/1ère partie/g, "1re partie")
    .replace(/Révisons/g, "Révisions").replace(/\s+([,.;:?])/g, "$1").trim();
}

function titreCourt(m, t) {
  let s = nettoyer(t);
  s = s.replace(/^(Histoire|Géo|SVT|Physique-Chimie|Littérature|Lecture)\s*–\s*/, "");
  if (m === "lecture") {
    s = s.replace(/ et prendre des notes.*$/, "").replace(/ puis (consulter|écouter).*$/, "")
      .replace(/ en s’appuyant.*$/, "");
  }
  if (m === "litterature") {
    s = s.replace(/ deux fois.*$/, "").replace(/, répondre aux questions.*$/, "").replace(/ \(à voix haute.*$/, "");
  }
  if ((m === "svt" || m === "physique") && /Séance/.test(s)) s = s.slice(s.indexOf("Séance"));
  if (m === "litterature" && /Cours \d/.test(s)) s = s.slice(s.search(/Cours \d/));
  if (m === "svt") s = s.replace(/Livret 3 – Livret 2/, "Livret 2").replace(/Livret 2 – Livret 2/, "Livret 2");
  return s;
}

function champs(m, t) {
  const s = nettoyer(t);
  const livret = (s.match(/Livret (III|II|I|1|2|3)\b/) || [])[1] || "";
  const chapitre = (s.match(/Chapitre (IV|III|II|I|\d)\b/) || [])[1] || "";
  const pages = (s.match(/\bp ?\d+( (à|et) \d+)?/g) || []).map(p => p.replace(/^p ?/, "p. ")).join(", ");
  return { livret, chapitre, pages };
}

function ereHistoire(n) {
  if (n <= 3) return 1;
  if (n <= 5) return 2;
  if (n <= 11) return 3;
  if (n <= 22) return 4;
  if (n <= 28) return 5;
  return 6;
}

function generer() {
  const brut = JSON.parse(fs.readFileSync(ENTREES, "utf8"));
  const planning = [];
  const ordre = {};
  let ere = 1;
  const semaines = Object.keys(brut).map(Number).sort((a, b) => a - b);
  for (const sem of semaines) {
    const entrees = brut[String(sem)].filter(e => MATIERES.includes(e.matiere));
    // ordre de l'emploi du temps : jour, puis créneau (déjà dans l'ordre d'extraction)
    entrees.sort((a, b) => ORDRE_JOURS.indexOf(a.jour) - ORDRE_JOURS.indexOf(b.jour));
    const n = {};
    for (const e of entrees) {
      n[e.matiere] = (n[e.matiere] || 0) + 1;
      ordre[e.matiere] = (ordre[e.matiere] || 0) + 1;
      const type = typeEntree(e.matiere, e.texte);
      const c = champs(e.matiere, e.texte);
      const ent = {
        id: e.matiere + "-s" + String(sem).padStart(2, "0") + "-" + n[e.matiere],
        matiere: e.matiere, semaine: sem, ordre: ordre[e.matiere],
        titre: titreCourt(e.matiere, e.texte), type: type, jour: e.jour.toLowerCase(),
        livret: c.livret, chapitre: c.chapitre, pages: c.pages
      };
      if (e.matiere === "histoire") {
        const mc = e.texte.match(/Cours (\d+)/);
        if (mc) ere = ereHistoire(Number(mc[1]));
        ent.ere = ere;
      }
      planning.push(ent);
    }
  }
  return planning;
}

function devoirs(planning) {
  const res = [];
  for (const m of Object.keys(PLAN_DEVOIRS)) {
    const semaines = PLAN_DEVOIRS[m];
    if (m === "anglais") {
      semaines.forEach((s, i) => res.push({ id: "anglais-d" + (i + 1), matiere: "anglais", semaine: s,
        intitule: "Anglais, devoir " + (i + 1), perimetre: [] }));
      continue;
    }
    const entrees = planning.filter(p => p.matiere === m);
    // groupes d'entrées « devoir » consécutifs (dans l'ordre de la matière) = un devoir
    const groupes = [];
    let courant = null;
    for (const p of entrees) {
      if (p.type === "devoir") {
        const num = (p.titre.match(/(?:[Dd]evoir(?: n°)?|fiche de lecture) ?(\d+|I)\b/) || [])[1];
        const k = num === "I" ? "1" : num;
        if (!courant || courant.num !== k) { courant = { num: k, entrees: [] }; groupes.push(courant); }
        courant.entrees.push(p);
      }
    }
    if (groupes.length !== semaines.length) {
      throw new Error(m + " : " + groupes.length + " devoirs dans l'emploi du temps, " + semaines.length + " dans le plan");
    }
    let debut = 0;
    groupes.forEach((g, i) => {
      const premier = g.entrees[0].ordre;
      const perimetre = entrees.filter(p => p.type === "cours" && p.ordre > debut && p.ordre < premier).map(p => p.id);
      debut = g.entrees[g.entrees.length - 1].ordre;
      const nom = m === "lecture" ? "fiche de lecture " : "devoir ";
      res.push({ id: m + "-d" + (i + 1), matiere: m, semaine: semaines[i],
        intitule: NOMS[m] + ", " + nom + (i + 1), perimetre: perimetre });
    });
  }
  return res;
}

function ecrire(fichier, type, donnees, entete) {
  const lignes = donnees.map(o => "  " + JSON.stringify(o)).join(",\n");
  const txt = "// " + entete + "\n// Généré par atelier/outils/generer-planning.js. Ne pas changer un identifiant publié.\n" +
    "JEU.enregistrer(\"" + type + "\", [\n" + lignes + "\n]);\n";
  fs.writeFileSync(path.join(RACINE, "jeu", "data", fichier), txt, "utf8");
}

if (require.main === module) {
  const p = generer();
  const d = devoirs(p);
  ecrire("planning.js", "planning", p, "Emploi du temps 5e, semaines 1 à 34, matières du jeu.");
  ecrire("devoirs.js", "devoirs", d, "Plan des devoirs 5e : identifiant, matière, semaine, intitulé, périmètre. Aucun texte de devoir.");
  const parType = {};
  p.forEach(e => { parType[e.type] = (parType[e.type] || 0) + 1; });
  console.log("planning :", p.length, "entrées", JSON.stringify(parType), "; devoirs :", d.length);
}

module.exports = { generer, devoirs, typeEntree };
