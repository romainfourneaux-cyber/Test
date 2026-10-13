# Journal des modifications

Une ligne par changement : date, fichiers touchés, ce qui a changé, version du jeu. Les plus récentes en haut.

## Journal

- 2026-10-13 : jalon 1, version 0.1.0. Créé jeu/ (index.html, css/jeu.css, js/ : noyau, brouillage, calendrier, sauvegarde, leitner, chargeur, progression, questions, icones, sons, interface, mentor, signalement, codex, validation, assaut, sceau, domaine, demarrage ; data/ : config, planning, devoirs, index-cours, a-retravailler, cours/methode-*.js ; assets/polices et assets/sons ; CREDITS.md ; VERSION.txt) et atelier/ (registre.json, index-notions.json, extractions/, contenu/, outils/ : valider.js, controles.js, validateur.html, brouillage.js, tests.js, perf.js, compiler-cours.js, generer-planning.js, generer-sons.js, extraction Python). Planning (292 entrées) et devoirs (35) tirés des PDF ; cinq savoir-faire (25 fiches, 94 questions, 5 bonus). Validateur : 0 erreur, 0 alerte. Tests de logique : 28/28. Essai de bout en bout : 50 enchaînements mesurés, 1 ms au plus. Mis à jour docs/FORMAT_DONNEES.md, docs/PROGRAMME_5E.md (recoupement), .claude/skills/traiter/SKILL.md (sources en clair).
- 2026-10-13 : création du dossier de projet (CLAUDE.md, LANCEMENT.md, LISEZMOI.md, docs/CAHIER_DES_CHARGES.md v3, docs/FORMAT_DONNEES.md, docs/PROGRAMME_5E.md, commandes /traiter et /relecture, zone DEPOT avec le planning et les fiches méthode). Aucune version du jeu pour l'instant.

## Décisions

Choix faits en cours de route quand le cahier des charges ne tranchait pas : date, décision, raison.

- 2026-10-13 : le calendrier ne limite pas l'avance de l'élève ; seuls les fichiers déposés et la validation par le jeu comptent (choix de Romain).
- 2026-10-13 : planning continu, sans pause pendant les vacances ; semaine 1 au lundi 31 août 2026 (choix de Romain).
- 2026-10-13 : sauvegarde en schéma 2 (réglages, statistiques, questions déjà vues), avec migration du schéma 1 (le format de départ).
- 2026-10-13 : les cours s'écrivent en clair dans atelier/contenu/ et se compilent vers jeu/data/cours/ (réponses brouillées automatiquement). Plus sûr que de brouiller à la main.
- 2026-10-13 : dans l'emploi du temps, une entrée « dossier + début de devoir » compte comme cours ; « carte mentale + début de devoir » compte comme devoir ; tests et devoirs d'entraînement en autocorrection, révisions, exercices, quiz et préparation de fiche de lecture comptent comme révisions.
- 2026-10-13 : un cours encore verrouillé reste « dans la brume » même si son fichier manque ; « contenu à venir » s'affiche pour un cours ouvrable dont le fichier n'est pas encore déposé.
- 2026-10-13 : Assaut : force de l'ennemi 6, toujours 8 tours (même si l'ennemi tombe avant), coup puissant au 3e succès d'affilée puis la série repart à zéro ; victoire +5 ressources, retraite +5 × part des dégâts.
- 2026-10-13 : maîtrise d'un quartier = part des notions vues (au moins 3) arrivées en boîte 2 ou plus. Douze bâtiments (deux par quartier), chacun payé avec deux matières ; hameau, village dès 2 bâtiments, bourg dès 6, ville dès 10.
- 2026-10-13 : sons synthétisés pour le jeu (CC0) plutôt que téléchargés ; icônes et blasons dessinés en SVG (pas encore de Game-icons). Polices Cinzel et Crimson Text locales (OFL).
- 2026-10-13 : un « Signaler la question précédente » reste visible pendant toute partie, en plus du lien sur chaque correction, pour signaler aussi une question réussie.
- 2026-10-13 : fiche méthode « graphique » : seuls les objectifs de 6e et 5e sont repris (4e et 3e en « non couvert »). Bonus sourcés sur Wikipédia (Priestley, Gaussen, Playfair, Roberval, fil à plomb).
