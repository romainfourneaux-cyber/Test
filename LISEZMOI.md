# Jeu de révision 5e : mode d'emploi

Ce dossier contient tout ce qu'il faut pour que Claude Code construise le jeu sur ton PC, puis le nourrisse au fil des cours.

## Ce qu'il y a dedans

- LANCEMENT.md : le prompt du jalon 1, déjà joué (document historique, à ne pas recoller).
- CLAUDE.md : les règles du projet. Claude Code le relit tout seul à chaque session.
- docs/ : le cahier des charges (v4), le format des données, le programme de l'année relevé dans tes PDF et le journal des modifications.
- DEPOT/ : ta zone de dépôt. Le planning et les fiches méthode y sont déjà.
- .claude/ : les deux commandes du projet (/traiter et /relecture) et un garde-fou qui empêche Claude Code de modifier DEPOT/ avec ses outils d'édition.
- jeu/ et atelier/ apparaîtront au premier lancement.

## Installation

1. Clic droit sur le zip, « Extraire tout », destination par exemple C:\Jeu5e. Vérifie que CLAUDE.md se trouve directement dans C:\Jeu5e : c'est ce dossier-là que Claude Code doit ouvrir, sinon il ne voit ni les règles ni les commandes.
2. Installe les deux outils dont Claude Code aura besoin. Dans un terminal (clic droit sur le bouton Démarrer, « Terminal »), tape :
   - `winget install oschwartz10612.Poppler` : indispensable, il permet de lire les PDF de plus de 10 pages ;
   - `winget install OpenJS.NodeJS.LTS` : fortement conseillé, il fait tourner les contrôles automatiques du contenu.
   Ferme ensuite le terminal.
3. Ouvre un nouveau terminal dans C:\Jeu5e (sous Windows 11 : clic droit dans le dossier, « Ouvrir dans le Terminal ») et tape `claude`. Tu peux aussi choisir ce dossier depuis l'application de bureau.
4. Accepte la demande de confiance pour ce dossier. Elle autorise Claude Code à écrire dans jeu/, atelier/ et docs/ sans te redemander à chaque fichier.
5. Ouvre LANCEMENT.md, copie le texte situé sous la ligne et colle-le dans Claude Code.

Claude Code commence par un inventaire : il vérifie les deux outils et peut te poser quelques questions. S'il te fait installer quelque chose en cours de route, ferme le terminal, rouvre-le dans C:\Jeu5e et tape `claude -c` pour reprendre la conversation là où elle s'était arrêtée.

## Donner le jeu à ton fils

- Même PC : un raccourci vers jeu\index.html sur son bureau suffit, et les mises à jour arrivent toutes seules.
- Autre PC : copie le dossier jeu\ (clé USB ou dossier partagé) et remplace l'ancien au même endroit à chaque mise à jour. Sa progression reste enregistrée dans son navigateur.
- Toujours le même navigateur, Edge ou Chrome.

## La routine de la semaine

1. Tu déposes les nouveaux cours dans DEPOT\cours\<matière>\ et, quand tu les as, les énoncés dans DEPOT\devoirs\, puis, après correction, la copie corrigée ou les remarques du correcteur. Avec un devoir corrigé, /traiter marque chaque cours du devoir « acquis » ou « à revoir » dans le jeu, et le jeu ramène plus souvent ce qui est à revoir.
2. Dans Claude Code, tu tapes /traiter.
3. Une fois par semaine, ton fils exporte sa sauvegarde (bouton Exporter du jeu) et tu la poses dans DEPOT\sauvegardes\.
4. Dans Claude Code, tu tapes /relecture. Tu obtiens une fiche A4 d'une trentaine de lignes à vérifier en 20 minutes, avec les fiches nouvelles et les cours que Claude a marqués « acquis » ou « à revoir ». Tu donnes les numéros à corriger, Claude corrige.

À déposer en priorité, vu les prochains devoirs : Histoire cours 1 à 11 (devoir en S10), Physique-chimie livret 1 thème A (S12), SVT livret 1 (S12 pour le chapitre 3), Géographie thème 1 (S10 et S11), Littérature livret I (S10), Un hivernage dans les glaces et son vocabulaire (S11), et les premières séquences d'anglais. Pour chaque devoir d'anglais, Claude Code te demandera quelles séquences il couvre.

## Les jalons suivants

Quand le jalon 1 te convient, colle ceci dans Claude Code :

« Continue le jalon 2 du cahier des charges : ères, lieux du cours et brume sur la carte, sièges, boss, Plan de bataille, Observatoire. La carte de campagne à deux fronts, la bataille, le conseil du royaume et les événements existent déjà, avec leurs images 3D (version 0.6.1) : garde-les. Même méthode que pour le jalon 1 : relis le cahier, inventaire et questions, construction, contrôles, cinq vérifications pour moi, livraison. »

Même phrase ensuite pour le jalon 3 puis le jalon 4, en reprenant leur contenu dans docs/CAHIER_DES_CHARGES.md, section 13.

## Si quelque chose cloche

- Page blanche ou jeu bloqué : décris à Claude Code ce que tu vois, il sait quoi vérifier.
- Contenu faux : ton fils le signale dans le jeu, toi tu le notes sur la fiche de relecture.
- Fichiers du projet laissés de côté : la fiche de méthodologie des devoirs de français, « Comment travailler son brouillon », les fiches du projet de technologie et le calendrier des visios 2025-2026. Ils concernent des matières hors jeu, ou des dates d'une autre année.
