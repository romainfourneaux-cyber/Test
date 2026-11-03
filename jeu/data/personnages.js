// Personnages de la campagne : les souverains réels que tu sers, cités dans les cours d'histoire déposés, et les rivaux
// des deux fronts. Format et contrôles : docs/FORMAT_DONNEES.md, section personnages.js. Tenu à jour par /traiter.
// Règle de la brume : un personnage relié à un cours (champ cours) n'existe dans le jeu que si le fichier de ce cours
// est chargé ; chacun de ses faits ne se montre que si le cours qui le donne est chargé. Sur sa fiche, rien d'autre
// que ce que le cours imprime (titre, dates), reformulé. Un rival « titre seul » (titreSeul) n'a ni nom propre, ni
// date, ni visage : le cours ne le nomme pas.
// seuil : nombre de provinces prises (les deux fronts) à partir duquel le personnage règne ; dans un camp, c'est le
// dernier de la liste dont le cours est ouvert et le seuil atteint.
// Répliques : 1 ou 2 phrases, jeu seulement (ni fait historique, ni religion, ni moquerie) ; {nom} : le personnage,
// {province} : la province prise, {souverain} : le souverain que tu sers.
JEU.enregistrer("personnages", {
  personnages: [
    {
      id: "clovis", nom: "Clovis", camp: "joueur", seuil: 0,
      titre: "roi des Francs", dates: "481-511",
      cours: "histoire-s01-2", source: { fichier: "cours/histoire/Histoire 5e - Seance 2 - Support.pdf", page: 1 },
      faits: [{ texte: "Sur la frise du cours, il est roi des Francs de 481 à 511." }],
      portrait: {
        fichier: "assets/images/personnages/clovis.jpg",
        oeuvre: "Clovis le grand, carte du Jeu des Rois de France (détail)",
        artiste: "Stefano della Bella", date: "1644",
        institution: "The Metropolitan Museum of Art, New York (objet 412341, Bequest of Phyllis Massar, 2011)",
        licence: "domaine public (CC0, Open Access du Met)",
        url: "https://www.metmuseum.org/art/collection/search/412341"
      },
      repliques: {
        presentation: [
          "Je suis Clovis, roi des Francs. Deux voisins guettent nos terres : je compte sur toi, seigneur !",
          "Clovis, roi des Francs, te salue. Tiens bon à l'ouest comme au sud, et le royaume te le rendra."
        ],
        changement: [
          "Les années passent : Clovis est maintenant ton souverain. Il attend de belles victoires.",
          "Les années passent, et Clovis prend la tête du royaume. Il compte sur ton épée."
        ]
      }
    },
    {
      id: "pepin-le-bref", nom: "Pépin le Bref", camp: "joueur", seuil: 3,
      titre: null, dates: null,
      cours: "histoire-s01-2", source: { fichier: "cours/histoire/Histoire 5e - Seance 2 - Support.pdf", page: 1 },
      faits: [{ texte: "La carte du cours montre le royaume franc tel qu'il est à sa mort." }],
      portrait: {
        fichier: "assets/images/personnages/pepin-le-bref.jpg",
        oeuvre: "Pepin le bref, carte du Jeu des Rois de France (détail)",
        artiste: "Stefano della Bella", date: "1644",
        institution: "The Metropolitan Museum of Art, New York (objet 412342, Bequest of Phyllis Massar, 2011)",
        licence: "domaine public (CC0, Open Access du Met)",
        url: "https://www.metmuseum.org/art/collection/search/412342"
      },
      repliques: {
        presentation: [
          "Je suis Pépin le Bref. Les deux fronts t'attendent, seigneur : à toi de jouer !",
          "Pépin le Bref te salue, seigneur. Le royaume a besoin de ton courage."
        ],
        changement: [
          "Les années passent : Pépin le Bref est maintenant ton souverain. Il a entendu parler de tes victoires.",
          "Les années passent, et Pépin le Bref devient ton souverain. Il te confie les deux fronts."
        ]
      }
    },
    {
      id: "charlemagne", nom: "Charlemagne", camp: "joueur", seuil: 6,
      titre: "roi des Francs, puis empereur d'Occident", dates: "768-814",
      cours: "histoire-s01-2", source: { fichier: "cours/histoire/Histoire 5e - Seance 2 - Support.pdf", page: 1 },
      faits: [
        { texte: "Sur la frise du cours, il est roi des Francs de 768 à 814." },
        { texte: "À partir de 800, il est aussi empereur d'Occident : c'est l'Empire carolingien." }
      ],
      portrait: {
        fichier: "assets/images/personnages/charlemagne.jpg",
        oeuvre: "L'entrée de Charlemagne à Pavie (The Entrance of Charlemagne into Pavia), détail",
        artiste: "Julius Schnorr von Carolsfeld", date: "1840",
        institution: "The Metropolitan Museum of Art, New York (objet 359448, Purchase, Anna-Maria and Stephen Kellen Foundation Gift, 2003)",
        licence: "domaine public (CC0, Open Access du Met)",
        url: "https://www.metmuseum.org/art/collection/search/359448"
      },
      repliques: {
        presentation: [
          "Je suis Charlemagne, roi des Francs. Ensemble, faisons grandir le royaume !",
          "Charlemagne te salue, seigneur. On parle de tes victoires dans tout le royaume."
        ],
        changement: [
          "Les années passent : Charlemagne est maintenant ton souverain. Il compte sur toi pour tenir les deux fronts.",
          "Les années passent, et Charlemagne prend la tête du royaume. Il veut te voir à l'œuvre."
        ]
      }
    },
    {
      // Aucun cours déposé ne nomme un roi d'Angleterre (la carte de la séance 2 ne cite que les Anglo-Saxons) :
      // c'est la figure du camp de l'ouest, retenu le 13/10/2026 (à confirmer par Romain). Titre seul, sans nom,
      // sans date, sans fait, sans visage.
      id: "roi-angleterre", nom: "Le roi d'Angleterre", camp: "angleterre", seuil: 0, titreSeul: true,
      titre: null, dates: null, cours: null, source: null, faits: [], portrait: null
    },
    {
      // La carte de la séance 2 place l'émirat de Cordoue au sud-ouest du royaume franc ; le support de la séance 4
      // (histoire-s03-1) donne la dynastie omeyyade (Damas) et le début du califat de Cordoue. Titre seul : le cours
      // ne nomme aucun émir.
      id: "emir-cordoue", nom: "L'émir de Cordoue", camp: "omeyyades", seuil: 0, titreSeul: true,
      titre: null, dates: null,
      cours: "histoire-s01-2", source: { fichier: "cours/histoire/Histoire 5e - Seance 2 - Support.pdf", page: 1 },
      faits: [
        { texte: "La carte du cours place l'émirat de Cordoue au sud-ouest du royaume franc." },
        { texte: "Sur la frise de la séance 4, la dynastie omeyyade, liée à Damas, va de 661 à 750 ; le califat de Cordoue commence en 929.",
          cours: "histoire-s03-1", source: { fichier: "cours/histoire/Histoire 5e - Seance 4 - Support.pdf", page: 1 } }
      ],
      portrait: null
    }
  ],

  // Humeur de chaque rival selon la rivalité : calme (0 à 29), pique (30 à 64), acharne (65 à 100).
  humeurs: {
    angleterre: {
      calme: "{nom} t'observe de loin, plus curieux qu'inquiet.",
      pique: "{nom} commence à te prendre très au sérieux.",
      acharne: "{nom} ne parle plus que de toi à sa cour."
    },
    omeyyades: {
      calme: "{nom} te salue poliment et surveille ses frontières.",
      pique: "{nom} renforce ses tours en pensant à toi.",
      acharne: "{nom} a promis de te battre, avec panache."
    }
  },

  // Répliques des rivaux, par camp et par situation (au moins deux par niveau de rivalité). Elles ne nomment jamais un
  // personnage : un « seigneur rival » de remplacement peut les dire.
  // presentation : première visite de la campagne ; defi : avant une bataille ; victoire : tu as repoussé son
  // attaque ; tenu : sa place forte tient ; retraite : tu as reculé ; province : tu lui as pris une province ;
  // attaque : il attaque ton domaine.
  repliques: {
    angleterre: {
      presentation: [
        { niveau: "calme", texte: "Bonjour, voisin ! Mes archers sont curieux de voir de quoi tu es capable." },
        { niveau: "calme", texte: "On m'a parlé de ton domaine. Viens donc me rendre visite avec ton armée, si tu l'oses !" },
        { niveau: "pique", texte: "Te voilà enfin ! Mes chevaliers parlent de toi à chaque repas." },
        { niveau: "pique", texte: "Tu as déjà fait parler de toi. Mon lion n'aime pas qu'on lui marche sur la queue." },
        { niveau: "acharne", texte: "Nous nous connaissons bien, toi et moi. Cette fois, ma forteresse ne cédera pas un pouce." },
        { niveau: "acharne", texte: "Je ne pense plus qu'à notre duel. Que le meilleur stratège gagne !" }
      ],
      defi: [
        { niveau: "calme", texte: "Tu viens frapper à ma porte ? Mes tours sont prêtes à t'accueillir." },
        { niveau: "calme", texte: "Une bataille ? Excellente idée, mes archers s'ennuyaient." },
        { niveau: "pique", texte: "Encore toi ! Cette fois, mes soldats ont aiguisé leurs lances." },
        { niveau: "pique", texte: "Approche donc. Mon lion a faim de victoire." },
        { niveau: "acharne", texte: "Je t'attendais. Toute ma garnison est sur les remparts." },
        { niveau: "acharne", texte: "Viens, seigneur ! Cette bataille, on la racontera longtemps." }
      ],
      victoire: [
        { niveau: "calme", texte: "Tes murs sont plus solides que je ne pensais. Bien joué, seigneur." },
        { niveau: "calme", texte: "Mes troupes rentrent bredouilles. Je reviendrai avec de meilleurs plans !" },
        { niveau: "pique", texte: "Repoussé, encore ! Tes gardes méritent une bonne soupe ce soir." },
        { niveau: "pique", texte: "Tu défends bien ton domaine. Mon lion boude dans son coin." },
        { niveau: "acharne", texte: "Encore repoussé… Tu es l'adversaire le plus coriace que je connaisse." },
        { niveau: "acharne", texte: "Je salue ta défense, seigneur. Mais notre duel n'est pas fini !" }
      ],
      tenu: [
        { niveau: "calme", texte: "Ma forteresse tient bon ! Reviens quand tu veux, la porte est solide." },
        { niveau: "calme", texte: "Joli assaut, mais mes murs sont encore debout. Enfin, presque tous." },
        { niveau: "pique", texte: "Tes soldats ont laissé de belles bosses sur mes murs. Mes maçons ont du travail !" },
        { niveau: "pique", texte: "Tu frappes fort, je l'admets. Mais je suis toujours là !" },
        { niveau: "acharne", texte: "Encore debout ! Ma forteresse est fatiguée, mais fière." },
        { niveau: "acharne", texte: "Tu y étais presque… Je vais mal dormir cette nuit." }
      ],
      retraite: [
        { niveau: "calme", texte: "Tu recules en bon ordre : c'est sage. Reviens quand tu seras prêt." },
        { niveau: "calme", texte: "La bataille est pour moi aujourd'hui. Demain, qui sait ?" },
        { niveau: "pique", texte: "Un peu de repos te fera du bien. Mes archers, eux, restent à leur poste." },
        { niveau: "pique", texte: "Pas de chance cette fois ! Je te garde une place sur le champ de bataille." },
        { niveau: "acharne", texte: "Je savoure ce jour, seigneur. Mais je sais que tu reviendras." },
        { niveau: "acharne", texte: "Tu as reculé, pas abandonné, je le sais bien. À bientôt !" }
      ],
      province: [
        { niveau: "calme", texte: "Tu m'as pris {province}… Bien joué, mais la route est encore longue !" },
        { niveau: "calme", texte: "Ainsi, tu tiens {province}. Prends-en soin, c'est une belle terre." },
        { niveau: "pique", texte: "Perdre {province}, quel affront ! Mon lion rugit de colère." },
        { niveau: "pique", texte: "Tu avances vite, seigneur. Beaucoup trop vite à mon goût !" },
        { niveau: "acharne", texte: "Encore une province ! Tu es un vrai stratège, je le reconnais." },
        { niveau: "acharne", texte: "Tu m'as pris {province}. Je te félicite, en serrant les dents !" }
      ],
      attaque: [
        { niveau: "calme", texte: "Mes troupes viennent saluer ton domaine. Prépare tes tours !" },
        { niveau: "calme", texte: "Une petite visite s'impose. Mes soldats prennent la route de ton château." },
        { niveau: "pique", texte: "Tu m'as assez taquiné : mon armée marche sur ton domaine !" },
        { niveau: "pique", texte: "À mon tour d'attaquer ! Tes murs vont trembler un peu." },
        { niveau: "acharne", texte: "Toute mon armée marche vers toi. Montre-moi ta meilleure défense !" },
        { niveau: "acharne", texte: "J'envoie mes meilleurs chevaliers. Tiens bon, seigneur !" }
      ]
    },
    omeyyades: {
      presentation: [
        { niveau: "calme", texte: "Salutations, seigneur du nord ! Mes cavaliers ont hâte de te rencontrer." },
        { niveau: "calme", texte: "Ton domaine grandit, à ce qu'on raconte. Voyons s'il résiste à mes tours." },
        { niveau: "pique", texte: "Ton nom arrive jusqu'à ma cour. Il est temps de nous mesurer." },
        { niveau: "pique", texte: "On dit que tu es rusé. Moi aussi, figure-toi !" },
        { niveau: "acharne", texte: "Nous voici face à face, encore une fois. Que la meilleure stratégie gagne !" },
        { niveau: "acharne", texte: "Mes tours se souviennent de toi. Elles t'attendent de pied ferme." }
      ],
      defi: [
        { niveau: "calme", texte: "Tu veux te mesurer à moi ? Mes tours sont prêtes." },
        { niveau: "calme", texte: "Une bataille ? Avec plaisir, mes cavaliers sont déjà en selle !" },
        { niveau: "pique", texte: "Encore toi ! Mes archers t'ont gardé leurs meilleures flèches." },
        { niveau: "pique", texte: "Approche, seigneur. Ma garnison a très bien dormi cette nuit." },
        { niveau: "acharne", texte: "Je t'attendais avec impatience. Que la bataille commence !" },
        { niveau: "acharne", texte: "Tous mes guerriers sont sur les remparts. Viens, si tu l'oses !" }
      ],
      victoire: [
        { niveau: "calme", texte: "Belle défense, seigneur. Mes cavaliers en parlent encore." },
        { niveau: "calme", texte: "Tes murs ont tenu. Je retourne à mes plans de bataille." },
        { niveau: "pique", texte: "Repoussé ! Ta garde est bien entraînée, je le reconnais." },
        { niveau: "pique", texte: "Tu ne te laisses pas faire, toi. J'aime ça !" },
        { niveau: "acharne", texte: "Encore une fois, tu me tiens tête. Quel adversaire !" },
        { niveau: "acharne", texte: "Je m'incline pour aujourd'hui. Mais je reviendrai." }
      ],
      tenu: [
        { niveau: "calme", texte: "Ma citadelle tient bon ! Mais j'ai bien senti tes coups." },
        { niveau: "calme", texte: "Joli assaut ! Mes murs portent la trace de tes soldats." },
        { niveau: "pique", texte: "Tu frappes fort, seigneur. Mes maçons n'ont plus une minute de repos !" },
        { niveau: "pique", texte: "Toujours debout ! Reviens quand tu veux." },
        { niveau: "acharne", texte: "Ma forteresse vacille, mais elle tient. Pour l'instant !" },
        { niveau: "acharne", texte: "Tu y étais presque. Je reconnais ton courage." }
      ],
      retraite: [
        { niveau: "calme", texte: "Tu as reculé avec sagesse. Reviens quand tu seras prêt." },
        { niveau: "calme", texte: "La victoire est pour moi aujourd'hui. Demain, on verra !" },
        { niveau: "pique", texte: "Repose tes troupes, seigneur. Mes tours ne bougent pas d'ici." },
        { niveau: "pique", texte: "Pas de chance cette fois ! Je t'attends pour la revanche." },
        { niveau: "acharne", texte: "Je savoure cette journée. Mais je sais que tu reviendras plus fort." },
        { niveau: "acharne", texte: "Tu as reculé, pas abandonné. Je t'attends !" }
      ],
      province: [
        { niveau: "calme", texte: "Tu m'as pris {province}. Bien joué, seigneur !" },
        { niveau: "calme", texte: "Ainsi, tu tiens {province}. Prends-en bien soin." },
        { niveau: "pique", texte: "Perdre {province}… Mes conseillers n'en reviennent pas !" },
        { niveau: "pique", texte: "Tu avances vite, seigneur. Je dois revoir mes plans !" },
        { niveau: "acharne", texte: "Encore une province ! Tu es un adversaire redoutable." },
        { niveau: "acharne", texte: "Tu m'as pris {province}. Je te félicite, même si cela me coûte." }
      ],
      attaque: [
        { niveau: "calme", texte: "Mes cavaliers viennent saluer ton domaine. Prépare tes tours !" },
        { niveau: "calme", texte: "Il est temps de te rendre visite. Mes troupes sont en route." },
        { niveau: "pique", texte: "À mon tour d'attaquer ! Tes remparts vont trembler un peu." },
        { niveau: "pique", texte: "Tu m'as assez provoqué : mon armée marche vers toi !" },
        { niveau: "acharne", texte: "Toute ma garnison marche sur ton domaine. Montre-moi ta meilleure défense !" },
        { niveau: "acharne", texte: "Je lance mes meilleurs cavaliers. Tiens bon, seigneur !" }
      ]
    }
  },

  // Changement de souverain, quand le nouveau n'a pas de phrase à lui : {nom}.
  changement: [
    "Les années passent : {nom} est maintenant ton souverain. Il compte sur toi pour tenir les deux fronts.",
    "Les années passent, et le royaume a un nouveau souverain : {nom}. Il t'attend sur le front."
  ]
});
