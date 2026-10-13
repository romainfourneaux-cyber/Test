# Jeu de révision 5e : règles du projet

Ce dossier sert à construire et à nourrir un jeu web de révision pour un élève de 5e qui suit les Cours Griffon à la maison. Il joue seul, sur son temps libre, sur un PC Windows. Romain, son père, dépose les cours et les devoirs dans DEPOT/ et te pilote. Il n'est pas développeur : parle-lui simplement, en français.

À lire selon la tâche :
- docs/CAHIER_DES_CHARGES.md : la spécification complète. Relis la section concernée avant toute conception ou tout code.
- docs/FORMAT_DONNEES.md : le format de tous les fichiers de données et la liste des contrôles. Tiens-le à jour si tu le modifies.
- docs/PROGRAMME_5E.md : le programme de l'année semaine par semaine et la liste des devoirs, relevés dans les PDF.
- docs/JOURNAL.md : le journal des modifications, à compléter après chaque changement.

## Dossiers

- DEPOT/ : les fichiers de Romain. Lecture seule : ne modifie, ne renomme, ne déplace et ne supprime jamais rien dedans, même pour ranger.
- atelier/ : ton espace de travail (registre des fichiers traités, index des notions, extractions, notes sur les devoirs, fiches de relecture, outils, copies de versions). Rien de ce dossier n'est copié dans jeu/.
- jeu/ : le seul dossier que l'élève utilise. N'y mets que ce qui sert au jeu.
- docs/ : spécifications et journal.

## Technique

- HTML, CSS et JavaScript pur, en scripts classiques. Pas de modules ES, pas de framework, pas de bundler, pas de CDN. Le jeu s'ouvre par double-clic sur jeu/index.html dans Edge ou Chrome, hors ligne.
- Données en fichiers .js qui s'enregistrent auprès d'une fonction globale. Pas de fetch ni de .json chargé à la volée : les navigateurs le bloquent en file://.
- Tout est chargé au lancement. Pendant la partie : aucun appel réseau, aucune IA, moins de 100 ms entre une réponse et la question suivante.
- Polices, sons et images sont des fichiers locaux dans jeu/assets/, avec leur licence dans jeu/CREDITS.md. Licences acceptées : domaine public, CC0, CC BY (avec crédit), OFL pour les polices.
- Sauvegarde dans localStorage, avec export et import en JSON. Chaque sauvegarde porte un numéro de schéma ; une nouvelle version du jeu migre l'ancienne sauvegarde sans rien perdre.
- Les réponses sont brouillées dans les fichiers de données. Ça décourage un curieux, ça ne protège rien.
- Poste Windows : commandes compatibles PowerShell, chemins entre guillemets (ils contiennent des espaces). N'installe rien sans l'accord de Romain.
- PDF de plus de 10 pages : l'outil Read a besoin de pdftoppm (Poppler). S'il échoue quand même, passe par la ligne de commande : `pdftotext -layout` pour le texte, `pdftoppm -png` pour les pages scannées ou les schémas, résultats dans atelier/extractions/, puis lis-les.

## Contenu : règles fermes

- Le contenu des cours vient uniquement des fichiers déposés. Ce qui manque va dans la liste « non couvert » du cours ; tu ne le complètes jamais avec tes connaissances.
- Chaque fiche et chaque question indique sa source : fichier et page.
- Tu reformules. Aucune phrase recopiée des livrets, aucune image reprise ; les schémas sont redessinés en SVG.
- Vocabulaire d'un élève de 13 ans. Une explication d'erreur tient en deux phrases.
- Devoirs : énoncés et corrigés servent seulement à délimiter un siège, à vérifier qu'aucune question ne recoupe le devoir et à repérer les notions à retravailler. Aucun énoncé, document, exemple, chiffre ou réponse attendue de devoir n'entre dans jeu/. Le nom de l'élève, de sa famille ou d'un correcteur et les numéros de sécurité sociale ne sont recopiés nulle part.
- Les productions personnelles (avis, carte mentale, création, rédaction libre) restent hors jeu.
- Bonus autorisé, toujours à part : fiche marquée bonus, rattachée à une notion du cours, avec une source fiable notée (encyclopédie, musée, institution). Jamais dans une épreuve de validation, un siège ou un boss. Environ une fiche bonus pour quatre fiches de cours.
- Croisades, guerres de religion et autres conflits : les camps sont des puissances politiques (royaumes, empires, sultanats), avec le ton neutre du cours. Aucune figure religieuse en unité de combat, aucun lieu de culte détruit, aucune caricature. Les armées et les adversaires sont ceux que le cours cite ; à défaut, « un seigneur rival », sans nom inventé.

## Jeu : règles fermes

- Jamais de chrono. Difficulté réglée pour environ 8 réussites sur 10.
- Une erreur ne fait jamais perdre un bâtiment, une province ou une ressource déjà gagnée. Elle amène une explication et une nouvelle tentative.
- Un cours s'ouvre quand son fichier de données existe et que le cours précédent de la même matière est validé ou présumé acquis. Le calendrier ne bloque rien : l'élève avance aussi loin que les données le permettent.
- Quand l'élève coche « cours fait », le jeu lance une épreuve sur ce cours (8 questions, niveaux 1 et 2). À 75 % ou plus, le cours est validé ; sinon, le mentor ouvre les fiches ratées et l'élève retente avec d'autres variantes, sans pénalité. Les réglages sont dans jeu/data/config.js.
- Les cours des semaines 1 à 6 sont présumés acquis : ils servent de prérequis et entrent dans la répétition espacée ; les valider rapporte quand même des récompenses.
- Un cours pas encore ouvert reste dans la brume : son titre se voit, sans question, sans indice, sans aperçu.
- Style : carte de campagne à la Total War, enluminure, héraldique, silhouettes. Ni pixel art, ni manga ou anime, ni dessin enfantin.

## Méthode

- Si le cahier des charges ne tranche pas, prends la solution la plus simple et note-la dans docs/JOURNAL.md, rubrique Décisions.
- Après chaque changement : lance le validateur (node atelier/outils/valider.js), ajoute une ligne au journal (date, fichiers, changement) et incrémente jeu/VERSION.txt quand tu livres. Sans Node, fais ses contrôles toi-même en lisant les fichiers et préviens Romain que l'anti-recopie et l'anti-spoil ont été vérifiés à la main.
- Si git est installé, un commit par jalon. Sinon, une copie datée de jeu/ dans atelier/versions/ avant chaque gros changement.
- Quand Romain doit vérifier quelque chose dans le navigateur, donne-lui cinq actions au plus, chacune avec ce qu'il doit voir.
- Commandes du projet : /traiter (intégrer les nouveaux fichiers de DEPOT/) et /relecture (fiche de relecture de la semaine et signalements de l'élève).
