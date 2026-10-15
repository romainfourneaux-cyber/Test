// Réglages du jeu. Voir docs/FORMAT_DONNEES.md.
JEU.enregistrer("config", {
  debutSemaine1: "2026-08-31",  // lundi de la semaine 1
  pauses: [],                   // lundis des semaines sautées, aucune pour l'instant
  avanceMax: null,              // null : le calendrier ne limite pas l'avance
  semaineDepart: 7,             // les cours des semaines 1 à 6 sont présumés acquis
  seuilBatiment: 0.70,
  leitnerJours: [1, 2, 4, 8, 16],
  rappelApres: 3,               // une question ratée revient après 3 autres questions
  orPerduErreur: 6,             // bataille : or retiré par réponse fausse (or de la bataille en cours, jamais sous zéro)
  usureBatiments: false,
  son: true
});
