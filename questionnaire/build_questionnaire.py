#!/usr/bin/env python3
"""Génère la page du questionnaire Terre Gravée (publication claude.ai, sans squelette HTML).

Les questions viennent de questions.json ; les réponses de Romain sont enregistrées par la page
dans la base de l'artifact (collection « reponses », un document par question) et les photos
dans ses fichiers. Rien de tout cela n'est écrit dans ce dépôt.

Usage :  python build_questionnaire.py [sortie.html]
"""
import html
import json
import os
import sys

ICI = os.path.dirname(os.path.abspath(__file__))

PRIORITES = {
    "bloquant": ("Avant la mise en ligne", "Obligatoire ou indispensable pour vendre"),
    "important": ("Important", "Sans cette réponse, le site est faux ou incomplet"),
    "utile": ("Utile", "Améliore le site"),
}


def e(t):
    return html.escape(str(t or ""), quote=True)


def est_autre(option):
    return option.strip().lower().startswith("autre")


def champ(q):
    i, t = q["id"], q["type"]
    fid = "f-" + i
    defaut = (q.get("defaut") or "").strip()
    if t in ("texte", "fichier"):
        if t == "fichier":
            return ('<div class="fichiers" data-fichiers hidden>'
                    '<label class="bouton-fichier" for="{f}-fichier">Ajouter une photo ou un fichier</label>'
                    '<input id="{f}-fichier" type="file" accept="image/*,application/pdf,.svg" multiple>'
                    '<ul class="vignettes" data-vignettes></ul></div>'
                    '<label class="sous-label" for="{f}">Ou indique où je peux la trouver (dossier du Drive, lien…)</label>'
                    '<input id="{f}" type="text" autocomplete="off" placeholder="{ex}">').format(f=fid, ex=e(q.get("exemple")))
        return '<input id="{}" type="text" autocomplete="off" placeholder="{}">'.format(fid, e(q.get("exemple")))
    if t == "texte-long":
        return '<textarea id="{}" rows="3" placeholder="{}"></textarea>'.format(fid, e(q.get("exemple")))
    if t == "nombre":
        unite = '<span class="unite">{}</span>'.format(e(q["unite"])) if q.get("unite") else ""
        return '<div class="nombre"><input id="{}" type="number" inputmode="decimal" min="0" step="any" placeholder="{}">{}</div>'.format(
            fid, e(q.get("exemple")), unite)
    if t == "date":
        return '<input id="{}" type="date">'.format(fid)
    if t == "oui-non":
        options = ["Oui", "Non"]
    elif t == "relecture":
        texte = '<blockquote class="a-relire">{}</blockquote>'.format(e(q.get("a_relire")).replace("\n", "<br>")) if q.get("a_relire") else ""
        return texte + (
            '<div class="choix choix--ligne" role="radiogroup" aria-label="Ce texte">'
            '<label><input type="radio" name="{f}" value="Le texte me va"> Le texte me va</label>'
            '<label><input type="radio" name="{f}" value="Je le corrige"> Je le corrige</label></div>'
            '<div class="correction" data-correction hidden><label class="sous-label" for="{f}-correction">Ta version</label>'
            '<textarea id="{f}-correction" rows="4" data-texte="{txt}"></textarea></div>').format(f=fid, txt=e(q.get("a_relire")))
    else:
        options = q.get("options") or []
    multiple = t == "choix-multiple"
    lignes = []
    for n, o in enumerate(options):
        marque = ' <span class="actuel">sur la maquette</span>' if defaut and o.strip().lower() == defaut.lower() else ""
        lignes.append('<label><input type="{}" name="{}" value="{}"{}> <span>{}{}</span></label>'.format(
            "checkbox" if multiple else "radio", fid, e(o), ' data-autre' if est_autre(o) else "", e(o), marque))
    autre = ""
    if any(est_autre(o) for o in options):
        autre = '<div class="autre" data-autre-bloc hidden><label class="sous-label" for="{0}-autre">Précise</label><input id="{0}-autre" type="text" autocomplete="off"></div>'.format(fid)
    classe = "choix choix--ligne" if t == "oui-non" else "choix"
    return '<div class="{}">{}</div>{}'.format(classe, "".join(lignes), autre)


def question(q, num):
    prio = q.get("priorite", "utile")
    nom, titre_prio = PRIORITES.get(prio, PRIORITES["utile"])
    pages = ", ".join(q.get("pages") or [])
    defaut = (q.get("defaut") or "").strip()
    rappel = ""
    if defaut and q["type"] not in ("choix", "choix-multiple", "oui-non"):
        rappel = '<p class="q__defaut">Sur la maquette pour l’instant : <strong>{}</strong></p>'.format(e(defaut))
    elif defaut and not any(o.strip().lower() == defaut.lower() for o in (q.get("options") or ["Oui", "Non"])):
        rappel = '<p class="q__defaut">Sur la maquette pour l’instant : <strong>{}</strong></p>'.format(e(defaut))
    return """<fieldset class="q" id="q-{id}" data-q="{id}" data-type="{type}" data-prio="{prio}" data-etat="vide">
  <legend><span class="q__num">{num}</span><span class="q__texte">{question}</span></legend>
  <div class="q__meta"><span class="pastille pastille--{prio}" title="{titre_prio}">{nom}</span>{pages}</div>
  <p class="q__aide">{aide}</p>
  {rappel}
  <div class="q__champ">{champ}</div>
  <div class="q__pied">
    <button type="button" class="plus-tard" data-plus-tard aria-pressed="false">Je ne sais pas encore</button>
    <span class="q__etat" data-etat-texte aria-live="polite"></span>
  </div>
</fieldset>""".format(id=e(q["id"]), type=e(q["type"]), prio=e(prio), num=num, question=e(q["question"]), nom=nom, titre_prio=titre_prio,
                      pages='<span class="q__pages">{}</span>'.format(e(pages)) if pages else "", aide=e(q.get("aide")),
                      rappel=rappel, champ=champ(q))


STYLE = """
/* Une colonne de lecture, une barre de progression collante en haut ; chaque question est une fiche à remplir au pouce. */
:root {
  --fond: #F5F5F0; --surface: #FFFFFF; --encre: #2C2C2C; --encre-2: #55554E; --trait: #D0D0D0; --trait-fort: #7E7E77;
  --sauge: #DCE2D4; --cuivre: #CBAA88; --cuivre-texte: #80542B; --urgent: #9B2C1F; --urgent-fond: #F6E3DF; --ok: #3F6B3A;
  --f-titre: "Marcellus", Georgia, "Times New Roman", serif;
  --f-texte: "Jost", "Segoe UI", system-ui, sans-serif;
  --f-cartel: "Barlow Semi Condensed", "Arial Narrow", "Segoe UI", sans-serif;
  --f-pochoir: "Allerta Stencil", "Arial Black", sans-serif;
}
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) {
  --fond: #1E1F1C; --surface: #282925; --encre: #EEEEE8; --encre-2: #B6B7AE; --trait: #3D3E39; --trait-fort: #8C8D85;
  --sauge: #323A2E; --cuivre: #CBAA88; --cuivre-texte: #DDBF9C; --urgent: #F09A8A; --urgent-fond: #3B2420; --ok: #9CCB92; color-scheme: dark; } }
:root[data-theme="dark"] {
  --fond: #1E1F1C; --surface: #282925; --encre: #EEEEE8; --encre-2: #B6B7AE; --trait: #3D3E39; --trait-fort: #8C8D85;
  --sauge: #323A2E; --cuivre: #CBAA88; --cuivre-texte: #DDBF9C; --urgent: #F09A8A; --urgent-fond: #3B2420; --ok: #9CCB92; color-scheme: dark; }
* { box-sizing: border-box; }
[hidden] { display: none !important; }
body { margin: 0; background: var(--fond); color: var(--encre); font-family: var(--f-texte); font-size: 17px; line-height: 1.5; }
body::before { content: ""; position: fixed; inset: 0 0 auto; height: env(safe-area-inset-top, 0px); z-index: 10; background: var(--fond); }
.cadre { max-width: 46rem; margin: 0 auto; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); }
.entete { padding-block: clamp(28px, 6vw, 56px) 20px; display: grid; gap: 12px; }
.signature { font-family: var(--f-pochoir); letter-spacing: .18em; font-size: .85rem; color: var(--cuivre-texte); margin: 0; }
h1 { font-family: var(--f-titre); font-weight: 400; font-size: clamp(2rem, 1.5rem + 2.4vw, 2.9rem); line-height: 1.08; margin: 0; text-wrap: balance; }
.chapo { margin: 0; color: var(--encre-2); max-width: 38em; }
.legende { display: flex; flex-wrap: wrap; gap: 8px 14px; margin: 4px 0 0; padding: 0; list-style: none; font-size: .9rem; color: var(--encre-2); }
.legende li { display: flex; align-items: center; gap: 6px; }

.barre { position: sticky; top: env(safe-area-inset-top, 0px); z-index: 5; background: var(--fond); border-bottom: 1px solid var(--trait); }
.barre__in { display: grid; gap: 6px; padding-block: 8px; }
.barre__ligne { display: flex; align-items: center; justify-content: space-between; gap: 8px 12px; flex-wrap: wrap; }
.compte { font-family: var(--f-cartel); font-weight: 600; letter-spacing: .04em; font-size: .95rem; font-variant-numeric: tabular-nums; }
.compte span { color: var(--encre-2); font-weight: 500; }
.sauvegarde { font-size: .82rem; color: var(--encre-2); }
.sauvegarde[data-etat="erreur"] { color: var(--urgent); }
.jauge { height: 6px; background: var(--trait); overflow: hidden; }
.jauge span { display: block; height: 100%; width: 0; background: var(--cuivre); transition: width .3s ease; }
.filtres { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 18px; }
.filtres button { font: inherit; font-family: var(--f-cartel); font-weight: 600; font-size: .85rem; letter-spacing: .05em; text-transform: uppercase;
  min-height: 36px; padding: 0 12px; background: transparent; color: var(--encre); border: 1px solid var(--trait-fort); cursor: pointer; }
.filtres button[aria-pressed="true"] { background: var(--encre); color: var(--fond); border-color: var(--encre); }

.sommaire { margin: 24px 0 8px; }
.sommaire ol { list-style: none; margin: 0; padding: 0; display: grid; gap: 2px; }
.sommaire a { display: flex; justify-content: space-between; gap: 12px; padding: 8px 0; border-bottom: 1px solid var(--trait); color: var(--encre); text-decoration: none; }
.sommaire a:hover .s__titre { text-decoration: underline; }
.s__titre { display: flex; gap: 10px; min-width: 0; }
.s__num { font-family: var(--f-cartel); font-weight: 600; color: var(--cuivre-texte); font-variant-numeric: tabular-nums; }
.s__compte { font-family: var(--f-cartel); color: var(--encre-2); font-variant-numeric: tabular-nums; white-space: nowrap; }

.section { padding-block: 28px 8px; scroll-margin-top: 80px; }
.section > header { display: grid; gap: 6px; margin-bottom: 14px; }
.section__num { font-family: var(--f-cartel); font-weight: 600; letter-spacing: .14em; text-transform: uppercase; font-size: .8rem; color: var(--cuivre-texte); margin: 0; }
h2 { font-family: var(--f-titre); font-weight: 400; font-size: 1.65rem; line-height: 1.15; margin: 0; text-wrap: balance; }
.section__intro { margin: 0; color: var(--encre-2); }
.questions { display: grid; gap: 14px; }

.q { margin: 0; padding: 16px 16px 12px; background: var(--surface); border: 1px solid var(--trait); display: grid; gap: 10px; min-width: 0; scroll-margin-top: 80px; }
.q[data-prio="bloquant"] { border-left: 3px solid var(--urgent); }
.q legend { padding: 0; display: flex; gap: 10px; font-weight: 500; font-size: 1.05rem; line-height: 1.35; float: left; width: 100%; }
.q legend + * { clear: both; }
.q__num { font-family: var(--f-cartel); font-weight: 600; color: var(--cuivre-texte); font-variant-numeric: tabular-nums; min-width: 2.2em; }
.q__texte { min-width: 0; }
.q__meta { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 10px; font-size: .8rem; color: var(--encre-2); }
.pastille { font-family: var(--f-cartel); font-weight: 600; letter-spacing: .06em; text-transform: uppercase; font-size: .75rem; padding: 2px 7px; border: 1px solid currentColor; }
.pastille--bloquant { color: var(--urgent); background: var(--urgent-fond); }
.pastille--important { color: var(--cuivre-texte); }
.pastille--utile { color: var(--encre-2); }
.q__pages::before { content: "Pages : "; }
.q__aide { margin: 0; font-size: .92rem; color: var(--encre-2); }
.q__defaut { margin: 0; font-size: .9rem; padding: 6px 10px; background: var(--sauge); }
.q__champ { display: grid; gap: 8px; min-width: 0; }
input[type=text], input[type=number], input[type=date], textarea { font: inherit; font-size: 1rem; width: 100%; padding: 10px 12px; color: var(--encre);
  background: var(--fond); border: 1px solid var(--trait-fort); border-radius: 0; min-width: 0; }
textarea { resize: vertical; min-height: 5.5em; }
input:focus-visible, textarea:focus-visible, button:focus-visible, .choix label:focus-within, .bouton-fichier:focus-within, a:focus-visible { outline: 2px solid var(--cuivre); outline-offset: 2px; }
.nombre { display: flex; align-items: center; gap: 8px; max-width: 16rem; }
.unite { color: var(--encre-2); white-space: nowrap; }
.choix { display: grid; gap: 6px; }
.choix--ligne { grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr)); }
.choix label { display: flex; align-items: flex-start; gap: 10px; padding: 10px 12px; border: 1px solid var(--trait); background: var(--fond); cursor: pointer; min-height: 44px; }
.choix label:has(input:checked) { border-color: var(--encre); background: var(--sauge); }
.choix input { margin: 3px 0 0; width: 18px; height: 18px; accent-color: var(--cuivre-texte); flex: none; }
.actuel { font-family: var(--f-cartel); font-size: .75rem; letter-spacing: .05em; text-transform: uppercase; color: var(--cuivre-texte); margin-left: 6px; white-space: nowrap; }
.sous-label { font-size: .88rem; color: var(--encre-2); }
.autre, .correction { display: grid; gap: 6px; }
.a-relire { margin: 0; padding: 10px 14px; border-left: 3px solid var(--cuivre); background: var(--fond); font-size: .95rem; white-space: normal; overflow-wrap: anywhere; }
.fichiers { display: grid; gap: 8px; }
.fichiers input[type=file] { position: absolute; opacity: 0; width: 1px; height: 1px; }
.bouton-fichier { display: inline-flex; align-items: center; justify-content: center; min-height: 44px; padding: 0 16px; background: var(--cuivre); color: #2C2C2C; font-weight: 600; cursor: pointer; justify-self: start; }
.vignettes { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 8px; }
.vignettes li { position: relative; width: 84px; display: grid; gap: 4px; font-size: .75rem; color: var(--encre-2); }
.vignettes img, .vignettes .doc { width: 84px; height: 84px; object-fit: cover; border: 1px solid var(--trait); background: var(--fond); display: grid; place-items: center; }
.vignettes button { font: inherit; font-size: .75rem; background: none; border: 0; padding: 0; color: var(--urgent); text-decoration: underline; cursor: pointer; justify-self: start; }
.q__pied { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
.plus-tard { font: inherit; font-size: .88rem; background: none; border: 0; padding: 6px 0; color: var(--encre-2); text-decoration: underline; cursor: pointer; min-height: 36px; }
.plus-tard[aria-pressed="true"] { color: var(--cuivre-texte); font-weight: 600; }
.q__etat { font-family: var(--f-cartel); font-weight: 600; font-size: .85rem; letter-spacing: .04em; color: var(--ok); }
.q[data-etat="plus-tard"] .q__etat { color: var(--cuivre-texte); }
.q[data-etat="repondu"] { border-color: var(--trait); }

body[data-filtre="a-faire"] .q:not([data-etat="vide"]) { display: none; }
body[data-filtre="bloquant"] .q:not([data-prio="bloquant"]) { display: none; }
.section[data-vide-filtre="1"] { display: none; }
.rien { display: none; padding: 24px 0; color: var(--encre-2); }
body[data-tout-cache="1"] .rien { display: block; }

.fin { margin-block: 36px 48px; padding: 18px; border: 1px solid var(--trait); background: var(--surface); display: grid; gap: 10px; }
.fin h2 { font-size: 1.35rem; }
.fin p { margin: 0; color: var(--encre-2); }
.bouton { font: inherit; font-weight: 600; min-height: 44px; padding: 0 18px; background: var(--encre); color: var(--fond); border: 0; cursor: pointer; justify-self: start; }
.bouton:hover { background: var(--cuivre); color: #2C2C2C; }
.copie { width: 100%; min-height: 8em; font-size: .85rem; }
@media (prefers-reduced-motion: reduce) { .jauge span { transition: none; } html { scroll-behavior: auto; } }
@media (min-width: 700px) { .q { padding: 18px 20px 14px; } }
"""

SCRIPT = r"""
(function () {
  "use strict";
  var CLE_LOCALE = "tg-questionnaire-v1";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var fiches = $$(".q");
  var parId = {};
  fiches.forEach(function (f) { parId[f.getAttribute("data-q")] = f; });

  var db = null, assets = null, collection = null;
  var dernier = {};      // id -> JSON du dernier état écrit ou reçu
  var minuteurs = {};    // id -> minuteur de saisie
  var files = {};        // id -> chaîne d'écritures (une à la fois par document)
  var enCours = 0, bloque = false;
  var fichiersParId = {}; // id -> [{id, type, nom}]

  function lireLocal() { try { return JSON.parse(localStorage.getItem(CLE_LOCALE) || "{}") || {}; } catch (e) { return {}; } }
  function ecrireLocal(id, etat) {
    try { var t = lireLocal(); t[id] = etat; localStorage.setItem(CLE_LOCALE, JSON.stringify(t)); } catch (e) { /* stockage indisponible */ }
  }

  var sauvegarde = $("[data-sauvegarde]");
  function statut(texte, etat) { if (sauvegarde) { sauvegarde.textContent = texte; sauvegarde.setAttribute("data-etat", etat || ""); } }
  function heure() { var d = new Date(); return d.getHours() + " h " + String(d.getMinutes()).padStart(2, "0"); }

  /* --- Lire et remplir une fiche --- */
  function etatDe(fiche) {
    var id = fiche.getAttribute("data-q"), type = fiche.getAttribute("data-type"), f = "f-" + id;
    var etat = { valeur: "", autre: "", correction: "", fichiers: (fichiersParId[id] || []).slice(), plusTard: $("[data-plus-tard]", fiche).getAttribute("aria-pressed") === "true" };
    if (type === "choix-multiple") {
      etat.valeur = $$('input[name="' + f + '"]:checked', fiche).map(function (i) { return i.value; });
    } else if (type === "choix" || type === "oui-non" || type === "relecture") {
      var c = $('input[name="' + f + '"]:checked', fiche); etat.valeur = c ? c.value : "";
    } else {
      var champ = document.getElementById(f); etat.valeur = champ ? champ.value.trim() : "";
    }
    var autre = document.getElementById(f + "-autre"); if (autre) etat.autre = autre.value.trim();
    var corr = document.getElementById(f + "-correction"); if (corr && etat.valeur === "Je le corrige") etat.correction = corr.value.trim();
    return etat;
  }
  function estRempli(etat) {
    var v = etat.valeur;
    return (Array.isArray(v) ? v.length > 0 : !!v) || (etat.fichiers && etat.fichiers.length > 0);
  }
  function remplir(fiche, etat) {
    var id = fiche.getAttribute("data-q"), type = fiche.getAttribute("data-type"), f = "f-" + id;
    var v = etat.valeur;
    if (type === "choix-multiple") {
      $$('input[name="' + f + '"]', fiche).forEach(function (i) { i.checked = Array.isArray(v) && v.indexOf(i.value) >= 0; });
    } else if (type === "choix" || type === "oui-non" || type === "relecture") {
      $$('input[name="' + f + '"]', fiche).forEach(function (i) { i.checked = i.value === v; });
    } else {
      var champ = document.getElementById(f); if (champ) champ.value = v || "";
    }
    var autre = document.getElementById(f + "-autre"); if (autre) autre.value = etat.autre || "";
    var corr = document.getElementById(f + "-correction"); if (corr && etat.correction) corr.value = etat.correction;
    fichiersParId[id] = (etat.fichiers || []).slice();
    afficherFichiers(fiche);
    $("[data-plus-tard]", fiche).setAttribute("aria-pressed", etat.plusTard ? "true" : "false");
    majFiche(fiche);
  }

  function majFiche(fiche) {
    var etat = etatDe(fiche);
    var rempli = estRempli(etat);
    fiche.setAttribute("data-etat", rempli ? "repondu" : (etat.plusTard ? "plus-tard" : "vide"));
    $("[data-etat-texte]", fiche).textContent = rempli ? "Répondu" : (etat.plusTard ? "Mis de côté" : "");
    var blocAutre = $("[data-autre-bloc]", fiche);
    if (blocAutre) blocAutre.hidden = !$$("input[data-autre]", fiche).some(function (i) { return i.checked; });
    var blocCorr = $("[data-correction]", fiche);
    if (blocCorr) {
      var ouvre = etat.valeur === "Je le corrige";
      blocCorr.hidden = !ouvre;
      var zone = $("textarea", blocCorr);
      if (ouvre && zone && !zone.value) zone.value = zone.getAttribute("data-texte") || "";
    }
  }

  /* --- Progression et filtres --- */
  function majProgression() {
    var total = fiches.length, faits = 0, bloq = 0, bloqFaits = 0;
    fiches.forEach(function (f) {
      var e = f.getAttribute("data-etat");
      if (e === "repondu") faits++;
      if (f.getAttribute("data-prio") === "bloquant") { bloq++; if (e === "repondu") bloqFaits++; }
    });
    $("[data-compte]").innerHTML = faits + " / " + total + " <span>répondues · avant la mise en ligne : " + bloqFaits + " / " + bloq + "</span>";
    $(".jauge span").style.width = (total ? Math.round(faits * 100 / total) : 0) + "%";
    $$("[data-compte-section]").forEach(function (el) {
      var s = document.getElementById(el.getAttribute("data-compte-section"));
      var qs = $$(".q", s), r = qs.filter(function (q) { return q.getAttribute("data-etat") === "repondu"; }).length;
      el.textContent = r + " / " + qs.length;
    });
    appliquerFiltre();
  }
  function appliquerFiltre() {
    var visibles = 0;
    $$(".section").forEach(function (s) {
      var n = $$(".q", s).filter(function (q) { return getComputedStyle(q).display !== "none"; }).length;
      s.setAttribute("data-vide-filtre", n ? "0" : "1"); visibles += n;
    });
    document.body.setAttribute("data-tout-cache", visibles ? "0" : "1");
  }
  $$("[data-filtre]").forEach(function (b) {
    b.addEventListener("click", function () {
      $$("[data-filtre]").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      document.body.setAttribute("data-filtre", b.getAttribute("data-filtre"));
      appliquerFiltre();
    });
  });

  /* --- Enregistrement --- */
  function corps(fiche, etat) {
    return {
      question: fiche.querySelector(".q__texte").textContent,
      section: fiche.closest(".section").getAttribute("data-titre"),
      priorite: fiche.getAttribute("data-prio"), type: fiche.getAttribute("data-type"),
      valeur: etat.valeur, autre: etat.autre, correction: etat.correction, fichiers: etat.fichiers,
      plusTard: etat.plusTard, maj: new Date().toISOString()
    };
  }
  function enregistrer(fiche) {
    var id = fiche.getAttribute("data-q");
    var etat = etatDe(fiche), json = JSON.stringify(etat);
    if (dernier[id] === json) return;
    dernier[id] = json;
    ecrireLocal(id, etat);
    if (!collection || bloque) { if (!db) statut("Sur cet appareil seulement", "local"); return; }
    enCours++; statut("Enregistrement…", "cours");
    files[id] = (files[id] || Promise.resolve()).then(function () {
      return collection.doc(id).set(corps(fiche, etat));
    }).then(function () {
      enCours--; if (!enCours) statut("Enregistré à " + heure(), "ok");
    }, function (err) {
      enCours--;
      if (err && err.code === "invalid_argument") { bloque = true; statut("Lecture seule : tu n’as pas le droit d’écrire ici", "erreur"); }
      else statut("Non enregistré (" + (err && err.code || "erreur") + "). Tes réponses restent sur cet appareil.", "erreur");
    });
  }
  function planifier(fiche, delai) {
    var id = fiche.getAttribute("data-q");
    clearTimeout(minuteurs[id]);
    minuteurs[id] = setTimeout(function () { delete minuteurs[id]; enregistrer(fiche); }, delai);
  }

  fiches.forEach(function (fiche) {
    fiche.addEventListener("input", function (ev) {
      if (ev.target.type === "file") return;
      majFiche(fiche); majProgression(); planifier(fiche, 900);
    });
    fiche.addEventListener("change", function (ev) {
      if (ev.target.type === "file") return;
      majFiche(fiche); majProgression(); planifier(fiche, ev.target.type === "radio" || ev.target.type === "checkbox" ? 0 : 300);
    });
    $("[data-plus-tard]", fiche).addEventListener("click", function () {
      var b = this; b.setAttribute("aria-pressed", b.getAttribute("aria-pressed") === "true" ? "false" : "true");
      majFiche(fiche); majProgression(); planifier(fiche, 0);
    });
    var entree = $("input[type=file]", fiche);
    if (entree) entree.addEventListener("change", function () { televerser(fiche, entree); });
  });

  /* --- Photos et fichiers --- */
  function afficherFichiers(fiche) {
    var liste = $("[data-vignettes]", fiche); if (!liste) return;
    var id = fiche.getAttribute("data-q");
    liste.innerHTML = "";
    (fichiersParId[id] || []).forEach(function (fi, n) {
      var li = document.createElement("li");
      var vue;
      if (/^image\//.test(fi.type)) { vue = document.createElement("img"); vue.src = "/_blob/" + fi.id; vue.alt = fi.nom || "Fichier envoyé"; vue.onerror = function () { vue.alt = "Aperçu indisponible"; }; }
      else { vue = document.createElement("span"); vue.className = "doc"; vue.textContent = "PDF"; }
      var nom = document.createElement("span"); nom.textContent = (fi.nom || "fichier").slice(0, 22);
      li.appendChild(vue); li.appendChild(nom);
      if (assets) {
        var retirer = document.createElement("button"); retirer.type = "button"; retirer.textContent = "Retirer";
        retirer.addEventListener("click", function () {
          var liste = fichiersParId[id] || []; var parti = liste.splice(n, 1)[0];
          afficherFichiers(fiche); majFiche(fiche); majProgression(); enregistrer(fiche);
          if (parti) assets.delete(parti.id).catch(function () { /* déjà retiré */ });
        });
        li.appendChild(retirer);
      }
      liste.appendChild(li);
    });
  }
  function televerser(fiche, entree) {
    if (!assets) return;
    var id = fiche.getAttribute("data-q");
    var choisis = Array.prototype.slice.call(entree.files || []);
    entree.value = "";
    var chaine = Promise.resolve();
    choisis.forEach(function (fichier) {
      chaine = chaine.then(function () {
        statut("Envoi de " + fichier.name + "…", "cours");
        var opts = {};
        if (/\.svg$/i.test(fichier.name)) opts.type = "image/svg+xml";
        else if (!fichier.type && /\.pdf$/i.test(fichier.name)) opts.type = "application/pdf";
        return assets.upload(fichier, opts).then(function (r) {
          (fichiersParId[id] = fichiersParId[id] || []).push({ id: r.id, type: r.contentType, nom: fichier.name });
          afficherFichiers(fiche); majFiche(fiche); majProgression(); enregistrer(fiche);
        }, function (err) {
          var msg = { too_large: "fichier trop lourd (20 Mo au plus)", unsupported_type: "format non accepté (photo, PDF ou SVG)", quota_or_state: "espace de stockage plein", rate_limited: "trop d’envois d’un coup, réessaie dans une minute" }[err && err.code] || "envoi impossible";
          statut(fichier.name + " : " + msg, "erreur");
        });
      });
    });
  }

  /* --- Copier les réponses (secours) --- */
  function texteReponses() {
    var lignes = [];
    $$(".section").forEach(function (s) {
      var bloc = [];
      $$(".q", s).forEach(function (f) {
        var et = etatDe(f);
        if (!estRempli(et) && !et.plusTard) return;
        var v = Array.isArray(et.valeur) ? et.valeur.join(", ") : et.valeur;
        if (et.autre) v += " (" + et.autre + ")";
        if (et.correction) v += "\n   Ma version : " + et.correction;
        if (et.fichiers.length) v += (v ? " · " : "") + et.fichiers.length + " fichier(s) envoyé(s)";
        bloc.push("- " + f.querySelector(".q__texte").textContent + "\n   " + (estRempli(et) ? v : "Je ne sais pas encore"));
      });
      if (bloc.length) lignes.push("## " + s.getAttribute("data-titre") + "\n" + bloc.join("\n"));
    });
    return lignes.join("\n\n") || "Aucune réponse pour l’instant.";
  }
  var boutonCopier = $("[data-copier]"), zoneCopie = $("[data-zone-copie]");
  if (boutonCopier) boutonCopier.addEventListener("click", function () {
    var t = texteReponses();
    zoneCopie.value = t; zoneCopie.hidden = false;
    var ok = function () { boutonCopier.textContent = "Copié"; setTimeout(function () { boutonCopier.textContent = "Copier mes réponses"; }, 2500); };
    var secours = function () { zoneCopie.focus(); zoneCopie.select(); boutonCopier.textContent = "Texte sélectionné : copie-le"; };
    try { navigator.clipboard.writeText(t).then(ok, secours); } catch (e) { secours(); }
  });

  /* --- Démarrage : brouillon local, puis la base de l'artifact --- */
  var local = lireLocal();
  fiches.forEach(function (f) {
    var id = f.getAttribute("data-q");
    if (local[id]) { remplir(f, local[id]); dernier[id] = JSON.stringify(etatDe(f)); }
    else majFiche(f);
  });
  majProgression();
  statut("Connexion…", "cours");

  var promesseDb = window.claude && window.claude.use ? window.claude.use("db") : Promise.resolve(null);
  var promesseAssets = window.claude && window.claude.use ? window.claude.use("assets") : Promise.resolve(null);
  promesseAssets.then(function (a) {
    assets = a;
    if (assets) $$("[data-fichiers]").forEach(function (b) { b.hidden = false; });
    fiches.forEach(afficherFichiers);
  }, function () { /* sans fichiers */ });
  promesseDb.then(function (d) {
    db = d;
    if (!db) { statut("Sur cet appareil seulement", "local"); return; }
    collection = db.collection("reponses");
    var premier = true;
    collection.onSnapshot(function (snap) {
      var vus = {};
      snap.docs.forEach(function (doc) {
        var id = doc.id, f = parId[id]; vus[id] = true;
        if (!f || minuteurs[id] || f.contains(document.activeElement)) return;
        var b = doc.data() || {};
        var etat = { valeur: b.valeur || "", autre: b.autre || "", correction: b.correction || "", fichiers: b.fichiers || [], plusTard: !!b.plusTard };
        remplir(f, etat);
        dernier[id] = JSON.stringify(etatDe(f));
        ecrireLocal(id, etatDe(f));
      });
      if (premier) {
        premier = false;
        /* Réponses saisies hors connexion : on les envoie. */
        fiches.forEach(function (f) {
          var id = f.getAttribute("data-q"), et = etatDe(f);
          if (!vus[id] && (estRempli(et) || et.plusTard)) { delete dernier[id]; enregistrer(f); }
        });
        if (!enCours) statut(snap.size ? "À jour" : "Prêt : tes réponses s’enregistrent au fil de l’eau", "ok");
      }
      majProgression();
    }, function (err) {
      statut("Synchronisation interrompue (" + (err && err.code || "erreur") + "). Tes réponses restent sur cet appareil.", "erreur");
    });
  }, function () { statut("Enregistré sur cet appareil seulement", "local"); });
})();
"""


def page(donnees):
    sections = donnees["sections"]
    total = sum(len(s["questions"]) for s in sections)
    bloquants = sum(1 for s in sections for q in s["questions"] if q.get("priorite") == "bloquant")
    corps, sommaire, num = [], [], 0
    for n, s in enumerate(sections, 1):
        sid = "s-" + s["id"]
        qs = []
        for q in s["questions"]:
            num += 1
            qs.append(question(q, num))
        sommaire.append('<li><a href="#{sid}"><span class="s__titre"><span class="s__num">{n:02d}</span><span>{t}</span></span>'
                        '<span class="s__compte" data-compte-section="{sid}">0 / {nb}</span></a></li>'.format(sid=sid, n=n, t=e(s["titre"]), nb=len(s["questions"])))
        corps.append("""<section class="section" id="{sid}" data-titre="{t}" aria-labelledby="{sid}-t">
  <header><p class="section__num">Partie {n} sur {nb}</p><h2 id="{sid}-t">{t}</h2><p class="section__intro">{intro}</p></header>
  <div class="questions">{qs}</div>
</section>""".format(sid=sid, n=n, nb=len(sections), t=e(s["titre"]), intro=e(s.get("intro")), qs="".join(qs)))
    return """<title>Questionnaire Terre Gravée</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Allerta+Stencil&family=Barlow+Semi+Condensed:wght@500;600&family=Jost:wght@400;500;600&family=Marcellus&display=swap">
<style>{style}</style>
<div class="cadre">
  <header class="entete">
    <p class="signature">TERRE GRAVÉE</p>
    <h1>Ce qu’il me manque pour finir le site</h1>
    <p class="chapo">Romain, {total} questions pour compléter la maquette et préparer la mise en ligne. Réponds dans l’ordre que tu veux, en plusieurs fois si besoin : chaque réponse s’enregistre toute seule et je la lis directement. Si tu n’as pas l’info, touche « Je ne sais pas encore ».</p>
    <ul class="legende">
      <li><span class="pastille pastille--bloquant">Avant la mise en ligne</span> {bloquants} questions : la loi l’exige ou la vente est impossible sans</li>
      <li><span class="pastille pastille--important">Important</span> le site est faux ou incomplet sans</li>
      <li><span class="pastille pastille--utile">Utile</span> améliore le site</li>
    </ul>
  </header>
</div>
<div class="barre"><div class="cadre barre__in">
  <div class="barre__ligne"><span class="compte" data-compte aria-live="polite">0 / {total}</span><span class="sauvegarde" data-sauvegarde aria-live="polite"></span></div>
  <div class="jauge" aria-hidden="true"><span></span></div>
</div></div>
<main class="cadre">
  <div class="filtres" role="group" aria-label="Afficher">
    <button type="button" data-filtre="tout" aria-pressed="true">Tout</button>
    <button type="button" data-filtre="a-faire" aria-pressed="false">Sans réponse</button>
    <button type="button" data-filtre="bloquant" aria-pressed="false">Avant la mise en ligne</button>
  </div>
  <nav class="sommaire" aria-label="Parties du questionnaire"><ol>{sommaire}</ol></nav>
  {corps}
  <p class="rien">Plus rien à afficher avec ce filtre. Bravo.</p>
  <section class="fin" aria-labelledby="fin-t">
    <h2 id="fin-t">Quand tu as fini</h2>
    <p>Pas besoin d’envoyer quoi que ce soit : dis-moi simplement dans la conversation que c’est rempli, je lis tes réponses et tes photos et je mets la maquette à jour. Tu peux revenir compléter plus tard.</p>
    <p>Si la page indique « Enregistré sur cet appareil seulement », copie tes réponses et colle-les dans la conversation.</p>
    <button type="button" class="bouton" data-copier>Copier mes réponses</button>
    <textarea class="copie" data-zone-copie hidden readonly aria-label="Tes réponses en texte"></textarea>
  </section>
</main>
<script>{script}</script>
""".format(style=STYLE, total=total, bloquants=bloquants, sommaire="".join(sommaire), corps="".join(corps), script=SCRIPT)


if __name__ == "__main__":
    with open(os.path.join(ICI, "questions.json"), encoding="utf-8") as f:
        donnees = json.load(f)
    ids = [q["id"] for s in donnees["sections"] for q in s["questions"]]
    assert len(ids) == len(set(ids)), "identifiants en double"
    sortie = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ICI, "questionnaire.html")
    with open(sortie, "w", encoding="utf-8") as f:
        f.write(page(donnees))
    print("{} questions dans {}".format(len(ids), sortie))
