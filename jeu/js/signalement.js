// Signaler une erreur : enregistré dans la sauvegarde, part avec l'export, traité par /relecture.
(function (racine) {
  "use strict";
  var JEU = racine.JEU;

  var MOTIFS = [
    ["reponse", "La réponse attendue est fausse"],
    ["clarte", "La question n'est pas claire"],
    ["pas-dans-mon-cours", "Ce n'est pas dans mon cours"],
    ["autre", "Autre chose"]
  ];

  function ouvrir(q) {
    var el = JEU.ui.el;
    var choix = "reponse";
    var radios = MOTIFS.map(function (m, i) {
      var r = el("input", { type: "radio", name: "motif", value: m[0], checked: i === 0, onchange: function () { choix = m[0]; } });
      return el("label", { class: "radio" }, [r, el("span", { texte: " " + m[1] })]);
    });
    var texte = el("textarea", { rows: "3", maxlength: "500", placeholder: "Explique en quelques mots (facultatif)." });
    var contenu = el("div", { class: "signalement" }, [
      el("p", { class: "note", texte: "Question : " + (q.enonce || q.id) }),
      el("div", { class: "radios" }, radios),
      texte,
      el("div", { class: "actions" }, [
        el("button", { class: "bouton principal", onclick: envoyer, texte: "Envoyer le signalement" })
      ])
    ]);
    function envoyer() {
      var etat = JEU.sauvegarde.etat();
      etat.signalements.push({ le: JEU.util.horodatage(), question: q.id, motif: choix, texte: texte.value.trim() });
      JEU.sauvegarde.enregistrer();
      JEU.ui.fermerModale();
      JEU.ui.toast("Merci ! Ton signalement part avec le prochain export.");
    }
    JEU.ui.ouvrirModale("Signaler une erreur", contenu);
  }

  JEU.signalement = { ouvrir: ouvrir, MOTIFS: MOTIFS };
})(typeof window !== "undefined" ? window : globalThis);
