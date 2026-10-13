// Le Codex : les fiches des cours ouverts ou présumés acquis, et les bonus à part.
// Présentation inspirée de la fiche méthode « fiche de mémorisation » : plan, code couleur par niveau,
// mots clés, schéma, moyens de retenir.
(function (racine) {
  "use strict";
  var JEU = racine.JEU;
  var U = JEU.util;
  var ouvert = {};  // matière dépliée

  function ferme() { return JEU.partie && JEU.partie.codexFerme; }

  function rendreFiche(f, coursId, bonus) {
    var el = JEU.ui.el;
    var m = U.matiereDe(coursId);
    var couleur = (JEU.MATIERES[m] || {}).couleur || "#8a7f70";
    var c = U.coursCharge(coursId);
    var carte = el("article", { class: "fiche" + (bonus ? " bonus" : ""), style: "--teinte:" + couleur });
    if (bonus) carte.appendChild(el("p", { class: "marque-bonus", texte: "Bonus · pour aller plus loin" }));
    carte.appendChild(el("h3", { class: "fiche-titre", texte: f.titre || f.notion }));
    if (f.notion && f.titre && f.notion !== f.titre) carte.appendChild(el("p", { class: "fiche-notion", texte: f.notion }));
    carte.appendChild(el("p", { class: "fiche-texte", texte: f.texte || "" }));
    if (f.pointsCles && f.pointsCles.length) {
      carte.appendChild(el("h4", { texte: "À retenir" }));
      carte.appendChild(el("ul", { class: "points-cles" }, f.pointsCles.map(function (p) { return el("li", { texte: p }); })));
    }
    if (f.vocabulaire && f.vocabulaire.length) {
      carte.appendChild(el("h4", { texte: "Mots clés" }));
      carte.appendChild(el("dl", { class: "vocabulaire" }, [].concat.apply([], f.vocabulaire.map(function (v) {
        return [el("dt", { texte: v.mot }), el("dd", { texte: v.def })];
      }))));
    }
    if (f.dates && f.dates.length) {
      carte.appendChild(el("h4", { texte: "Dates" }));
      carte.appendChild(el("ul", { class: "points-cles" }, f.dates.map(function (d) { return el("li", { texte: d.annee + " : " + d.evenement }); })));
    }
    if (f.schema && c && c.schemas) {
      var s = c.schemas.filter(function (x) { return x.id === f.schema; })[0];
      if (s) carte.appendChild(el("figure", { class: "schema", html: s.svg }, s.legende ? [el("figcaption", { texte: s.legende })] : []));
    }
    if (f.astuce) carte.appendChild(el("p", { class: "astuce" }, [el("b", { texte: "Pour retenir : " }), document.createTextNode(f.astuce)]));
    var src = f.source || {};
    var txtSource = bonus
      ? "Source : " + [src.titre, src.editeur].filter(Boolean).join(", ") + (src.url ? " (" + src.url + ")" : "")
      : "Source : " + (src.fichier || "?").replace(/^.*\//, "") + (src.page ? ", page " + src.page : "");
    carte.appendChild(el("p", { class: "fiche-source", texte: txtSource }));
    return carte;
  }

  function trouver(ficheId) {
    var x = JEU.questions.fiche(ficheId);
    if (x) return { fiche: x.fiche, cours: x.cours, bonus: false };
    var d = JEU.donnees.cours;
    for (var k in d) {
      var b = (d[k].bonus || []).filter(function (y) { return y.id === ficheId; })[0];
      if (b) return { fiche: b, cours: k, bonus: true };
    }
    return null;
  }

  function ouvrirFiche(ficheId) {
    if (ferme()) { JEU.ui.toast("Le Codex est fermé pendant l'épreuve."); return; }
    var t = trouver(ficheId);
    if (!t) return;
    var boite = JEU.ui.el("div", {}, [rendreFiche(t.fiche, t.cours, t.bonus)]);
    var bonusLies = t.bonus ? [] : bonusDeFiche(ficheId);
    bonusLies.forEach(function (b) { boite.appendChild(rendreFiche(b, t.cours, true)); });
    JEU.ui.ouvrirModale(null, boite);
  }

  function bonusDeFiche(ficheId) {
    var t = trouver(ficheId);
    if (!t) return [];
    var c = U.coursCharge(t.cours);
    return ((c && c.bonus) || []).filter(function (b) { return b.fiche === ficheId; });
  }

  // Ouvre plusieurs fiches à la suite (bilan d'épreuve), puis appelle suite().
  function ouvrirSuite(ids, suite) {
    var i = 0;
    function une() {
      if (i >= ids.length) { if (suite) suite(); return; }
      var t = trouver(ids[i]);
      i++;
      if (!t) { une(); return; }
      var el = JEU.ui.el;
      var dernier = i >= ids.length;
      var boite = el("div", {}, [
        el("p", { class: "note", texte: "Fiche " + i + " sur " + ids.length }),
        rendreFiche(t.fiche, t.cours, t.bonus),
        el("div", { class: "actions" }, [el("button", { class: "bouton principal", onclick: function () { JEU.ui.fermerModale(); }, texte: dernier ? "J'ai relu, je retente" : "Fiche suivante" })])
      ]);
      JEU.ui.ouvrirModale(null, boite, une);
    }
    une();
  }

  JEU.ui.ecrans.codex = function (s) {
    var el = JEU.ui.el;
    var etat = JEU.sauvegarde.etat();
    s.innerHTML = "";
    s.appendChild(el("div", { class: "bandeau-oeuvre", title: "Tapisserie « La chasse au faucon », vers 1500-1530 (The Met, domaine public)" }));
    s.appendChild(el("h1", { class: "titre-ecran", texte: "Le Codex" }));
    s.appendChild(el("p", { class: "note", texte: "Les fiches de tes cours ouverts et acquis. Les fiches bonus sont marquées d'un sceau doré : elles ne comptent jamais dans une épreuve." }));
    var acces = JEU.progression.coursAccessibles(etat);
    var groupes = {};
    acces.forEach(function (id) {
      var m = U.matiereDe(id);
      (groupes[m] = groupes[m] || []).push(id);
    });
    JEU.ORDRE_MATIERES.forEach(function (m) {
      var ids = groupes[m] || [];
      var nb = 0;
      ids.forEach(function (id) { nb += (U.coursCharge(id).fiches || []).length; });
      var section = el("section", { class: "codex-matiere", style: "--teinte:" + JEU.MATIERES[m].couleur });
      var entete = el("button", { class: "codex-entete", onclick: function () { ouvert[m] = !ouvert[m]; JEU.ui.ecrans.codex(s); } }, [
        el("span", { html: JEU.icones.icone(JEU.icones.matiere(m), 26) + U.echapper(JEU.MATIERES[m].nom) }), el("span", { class: "note", texte: nb ? nb + " fiche" + (nb > 1 ? "s" : "") : "contenu à venir" })
      ]);
      section.appendChild(entete);
      if (ouvert[m] && ids.length) {
        ids.sort().forEach(function (id) {
          var c = U.coursCharge(id);
          var e = JEU.progression.entree(id);
          section.appendChild(el("h3", { class: "codex-cours", texte: c.titre || (e ? e.titre : id) }));
          var grille = el("div", { class: "grille-fiches" });
          (c.fiches || []).forEach(function (f) {
            grille.appendChild(el("button", { class: "vignette", onclick: function () { ouvrirFiche(f.id); } }, [el("b", { texte: f.titre || f.notion }), el("span", { texte: f.notion || "" })]));
          });
          (c.bonus || []).forEach(function (b) {
            grille.appendChild(el("button", { class: "vignette bonus", onclick: function () { ouvrirFiche(b.id); } }, [el("b", { texte: b.titre }), el("span", { texte: "Bonus" })]));
          });
          section.appendChild(grille);
        });
      }
      s.appendChild(section);
    });
  };

  JEU.codex = { ouvrirFiche: ouvrirFiche, ouvrirSuite: ouvrirSuite, rendreFiche: rendreFiche, bonusDeFiche: bonusDeFiche };
})(typeof window !== "undefined" ? window : globalThis);
