# Prompt de lancement : jalon 1

Copie tout le texte situé sous la ligne et colle-le dans Claude Code, ouvert sur ce dossier.

---

Tu vas construire le jalon 1 du jeu de révision 5e. Les règles du projet sont dans CLAUDE.md. Lis maintenant en entier docs/CAHIER_DES_CHARGES.md, docs/FORMAT_DONNEES.md et docs/PROGRAMME_5E.md, puis avance dans l'ordre ci-dessous.

## Étape 1 : inventaire, avant tout code

1. Liste le contenu de DEPOT/, sous-dossier par sous-dossier.
2. Vérifie ce qui est installé avec `pdftoppm -v`, `pdftotext -v`, `node --version` et `git --version`. N'installe rien toi-même.
   - Poppler (pdftoppm, pdftotext) est indispensable : sans lui, tu ne peux pas lire les PDF de plus de 10 pages. S'il manque, donne-moi la commande `winget install oschwartz10612.Poppler`.
   - Node.js est fortement conseillé (validateur complet, tests automatiques). S'il manque, donne-moi `winget install OpenJS.NodeJS.LTS`.
   - Après une installation, je ferme le terminal et je relance Claude Code avec `claude -c` pour reprendre cette conversation. Si pdftoppm reste introuvable, cherche pdftoppm.exe dans %LOCALAPPDATA%\Microsoft\WinGet\Packages et utilise son chemin complet.
3. Résume en dix lignes au plus ce que tu vas construire, l'arborescence prévue pour jeu/ et atelier/, et les choix techniques que le cahier laisse ouverts.
4. Pose-moi toutes tes questions en une seule fois. Si tu n'en as pas, enchaîne sans attendre.

## Étape 2 : le socle

- Crée l'arborescence de jeu/ et d'atelier/ décrite dans le cahier (section 12).
- jeu/data/config.js avec les valeurs de FORMAT_DONNEES.md : semaine 1 au lundi 31 août 2026, aucune pause, pas de limite d'avance, seuil de validation 0,75, épreuve de 8 questions, semaine de départ 7.
- Le noyau : enregistrement des données ; chargeur (config, planning, devoirs, index des cours, a-retravailler, puis un script par cours, un fichier manquant faisant passer le cours en « contenu à venir ») ; calendrier ; brouillage (même fonction côté jeu et côté atelier) ; sauvegarde à schéma versionné, avec export et import.
- L'écran d'accueil : bannière du domaine, semaine du calendrier, prochain devoir, bouton Jouer.

## Étape 3 : planning et devoirs

- Construis jeu/data/planning.js et jeu/data/devoirs.js à partir des deux PDF de DEPOT/planning/, au format de FORMAT_DONNEES.md. Seules les matières du jeu y entrent.
- Recoupe avec docs/PROGRAMME_5E.md et liste-moi chaque écart avec la page du PDF. Le PDF fait foi.
- devoirs.js ne contient que l'identifiant, la matière, la semaine, l'intitulé et le périmètre. Périmètres d'anglais vides pour l'instant.
- Inscris les deux PDF dans atelier/registre.json (type planning), pour que /traiter ne les reprenne pas.

## Étape 4 : le premier contenu

- Suis la procédure de .claude/skills/traiter/SKILL.md pour tout ce qui se trouve dans DEPOT/methodes/ et DEPOT/cours/.
- Les fiches méthode deviennent cinq savoir-faire (frise, graphique, tableau à double entrée, diagramme ombrothermique, instruments de mesure avec le matériel de TP), rattachés comme le prévoit la section 3 du cahier, avec leurs propres questions et une épreuve de validation. La fiche de mémorisation ne donne pas de questions : elle sert de modèle aux fiches du Codex.
- Si DEPOT/cours/ est encore vide, le jeu tourne avec les savoir-faire seuls et affiche « contenu à venir » pour le reste.

## Étape 5 : la boucle de jeu

- Le domaine : plan de ville sur parchemin, six quartiers (château, marché, herboristerie, forge, scriptorium, ambassade), ressources par matière, un premier bâtiment qui coûte des ressources de deux matières, passage visible de hameau à village.
- La validation d'un cours : case « cours fait », épreuve de 8 questions, seuil, récompenses, nouvelle tentative guidée par le mentor en cas d'échec.
- Assaut (à la Slay the Spire) et Sceau de vérité (à la Reigns), comme décrit dans la section 6 du cahier. Aucune issue perdante : au pire une retraite avec un gain partiel.
- Le Codex, le mentor, le bouton « Signaler une erreur » sur chaque correction, la répétition espacée (Leitner, 5 boîtes).
- Raccourcis clavier : 1 à 6 pour les choix, flèches gauche et droite pour le Sceau, Entrée pour continuer.

## Étape 6 : l'habillage

- Direction artistique de la section 4 : parchemin, encre, héraldique, silhouettes, palette, polices locales (Cinzel, Crimson Text, repli Georgia). Ni pixel, ni manga, ni cartoon.
- Quelques sons courts sous licence CC0 (coup, sceau, construction, validation) et un bouton pour couper le son. Animations de moins de 400 ms.
- Crédits complets dans jeu/CREDITS.md.

## Étape 7 : les contrôles

- Écris atelier/outils/valider.js (Node) et atelier/outils/validateur.html (navigateur, sans les contrôles qui demandent les extractions), avec les contrôles listés dans FORMAT_DONNEES.md.
- Tests de logique : calendrier (S7 le 13/10/2026, S34 le 19/04/2027, S34 conservée au-delà), déblocage dans l'ordre, seuil de validation, boîtes Leitner, brouillage aller-retour, migration d'une sauvegarde de schéma 1.
- Mesure le temps entre une réponse et la question suivante sur 50 questions. Objectif : moins de 100 ms.
- Donne-moi ensuite cinq actions à faire dans le navigateur, avec ce que je dois voir à chaque fois.

## Étape 8 : la livraison

- jeu/VERSION.txt à 0.1.0, journal à jour, commit git ou copie datée dans atelier/versions/.
- Résumé final en dix lignes au plus : ce qui marche, ce qui manque, et les fichiers à déposer en priorité pour les prochains devoirs.

## Critères d'acceptation du jalon 1

- Double-clic sur jeu/index.html : l'accueil s'affiche en moins de 2 secondes, hors ligne, dans Edge comme dans Chrome.
- La semaine affichée correspond au calendrier (S7 du 12 au 18 octobre 2026, S8 la semaine suivante, etc.).
- Un cours sans fichier affiche « contenu à venir » ; un cours ouvert passe à « validé » après une épreuve réussie.
- Assaut et Sceau de vérité se jouent sans chrono et sans attente perceptible entre deux questions.
- Un signalement se retrouve dans l'export ; un export réimporté redonne exactement la même partie.
- Le validateur ne trouve aucune erreur.

Le jalon 2 (carte de campagne, ères, sièges, Plan de bataille, Observatoire) attendra ma validation de celui-ci.
