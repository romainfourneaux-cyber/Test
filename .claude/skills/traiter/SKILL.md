---
name: traiter
description: Intègre au jeu les nouveaux fichiers déposés dans DEPOT/ (cours, devoirs, planning, fiches méthode). À utiliser quand Romain dit qu'il a déposé des fichiers ou demande de mettre à jour le contenu du jeu.
argument-hint: "[fichier ou sous-dossier de DEPOT, facultatif]"
---

# Intégrer les nouveaux dépôts

Rappels : DEPOT/ est en lecture seule. Le contenu de cours vient uniquement des fichiers déposés. Format des données et contrôles : docs/FORMAT_DONNEES.md.

## 1. Repérer les nouveautés

- Compare DEPOT/ avec atelier/registre.json (chemin, taille, date de modification). Un fichier absent du registre, ou modifié depuis son traitement, est à traiter ; DEPOT/LISEZMOI.txt et les fichiers dont le nom commence par « _ » ne comptent pas. Si un argument est donné ($ARGUMENTS), limite-toi à ce fichier ou à ce dossier.
- Annonce la liste à Romain avec le type que tu supposes pour chaque fichier : cours (matière, semaine, livret, pages), énoncé ou corrigé de devoir, planning, fiche méthode, sauvegarde du jeu. Si un fichier est ambigu, pose la question avant d'aller plus loin.

## 2. Lire

- Lis chaque PDF en entier avec l'outil Read, par tranches de 20 pages au plus. Un PDF scanné ou une photo se lit comme une image.
- Si Read refuse un PDF (« pdftoppm is not installed » ou autre), passe par la ligne de commande : `pdftotext -layout "<pdf>" "atelier/extractions/<nom>.txt"` pour un PDF texte, `pdftoppm -png -r 110 -f <première page> -l <dernière page> "<pdf>" "atelier/extractions/<nom>-p"` pour les pages scannées et les schémas, puis lis ces fichiers. Si pdftoppm reste introuvable, cherche pdftoppm.exe dans %LOCALAPPDATA%\Microsoft\WinGet\Packages et utilise son chemin complet.
- Garde le texte intégral, mot pour mot, dans atelier/extractions/<nom du fichier>.txt : il évite de relire le PDF et sert aux contrôles anti-recopie et anti-spoil. Retire seulement le nom de l'élève, de sa famille ou d'un correcteur, et tout numéro de sécurité sociale.

## 3. Produire, selon le type

### Cours
- Rattache le contenu aux entrées de jeu/data/planning.js (matière, semaine, livret, chapitre, pages). Un livret entier se découpe cours par cours.
- Pour chaque cours, écris la source en clair atelier/contenu/<id>.js (réponses en clair dans `reponse`), puis compile-la vers jeu/data/cours/<id>.js avec `node atelier/outils/compiler-cours.js <id>` (voir docs/FORMAT_DONNEES.md). Le cours contient :
  - les fiches : une notion par fiche, texte reformulé de 60 mots au plus, dates, lieux, personnages, vocabulaire, prérequis, source (fichier et page) ;
  - les schémas utiles, redessinés en SVG simple ;
  - les questions écrites à la main : au moins trois par notion, dont une en « pourquoi » ou en « comment » et une vrai_faux avec deux ou trois corrections proposées. Les QCM simples, associations et frises que le jeu fabrique à partir des fiches ne s'écrivent pas ;
  - les bonus : environ un pour quatre fiches, chacun rattaché à une notion, avec une source fiable (titre, éditeur ou institution, adresse web si elle existe) ;
  - la liste « non couvert » : ce que le titre du cours annonce et que le fichier ne développe pas.
- Anglais : un fichier par séquence (jeu/data/anglais/<id>.js) avec le vocabulaire (anglais, français, exemple), les structures et de courtes phrases. L'ordre des séquences remplace la semaine.
- Lecture suivie : questions sur les pages lues chaque semaine et sur le vocabulaire du livre ; jamais celles des quiz imprimés dans le livre.
- Ajoute le cours à jeu/data/index-cours.js.

### Cours d'histoire : personnages de la campagne (jeu/data/personnages.js)
La campagne fait parler de vrais souverains : celui que l'élève sert (camp « joueur ») et les rivaux des deux fronts (camps « angleterre » et « omeyyades »). Format exact et contrôle 10 : docs/FORMAT_DONNEES.md, section personnages.js.
- Quand un nouveau cours d'histoire cite un souverain (frise, carte, texte, légende), regarde aussi les pages en images (`pdftoppm -png -r 110`) : frises et cartes sont souvent des images que pdftotext ne lit pas. Note le nom exact, le titre et les dates tels qu'ils sont imprimés, avec la page.
- Seuls les souverains imprimés dans un cours déposé entrent. Rien d'autre sur la fiche que ce que le cours imprime (titre, dates, un fait reformulé de 35 mots au plus) : pas de lien de parenté, pas de date ni de titre que le cours ne donne pas (Pépin le Bref n'a ni titre ni date : le support ne lui en donne pas).
- Ajoute une entrée à la liste personnages : id (minuscules et tirets), nom, camp, seuil (provinces prises sur les deux fronts à partir duquel il règne ; garde l'ordre : le dernier de la liste dont le cours est ouvert et le seuil atteint règne), titre et dates (ou null), cours (l'identifiant du planning qui le cite), source (fichier relatif à DEPOT/ et page), faits (un fait qui vient d'un autre cours porte son propre cours et sa propre source), repliques (presentation et changement : une ou deux phrases de jeu, sans chiffre ni fait historique, avec son seul nom). Le personnage n'apparaît dans le jeu que quand le fichier de son cours est chargé (brume) : un souverain d'un cours pas encore déposé peut être préparé, il reste invisible.
- Rivaux : un rival n'a un nom propre que si un cours déposé le nomme. Sinon, titre seul (titreSeul: true), sans date, sans visage (portrait: null : le jeu dessine un médaillon héraldique, silhouette couronnée sur les armes du camp). Ses répliques sont celles de son camp (repliques.<camp>.<situation>) : elles ne nomment jamais un personnage. Un rival sans cours (le roi d'Angleterre) suit son camp ; s'il n'y a personne, le jeu écrit « un seigneur rival ». Jamais de figure religieuse, jamais de nom inventé.
- Portrait d'un souverain : une œuvre réelle du domaine public ou CC0 (peinture, miniature, gravure), scène profane seulement (ni baptême, ni sacre par un pape, ni scène religieuse ; pas de symbole religieux visible dans le médaillon), et jamais une œuvre imprimée dans un support des Cours Griffon (vérifie les pages en images). Cherche d'abord dans l'Open Access du Met (https://collectionapi.metmuseum.org/public/collection/v1.1/search?q=<nom>&hasImages=true&limit=50, puis /public/collection/v1/objects/<id> : isPublicDomain doit être vrai). Wikimedia Commons répond souvent 429 : passe par https://commons.wikimedia.org/wiki/Special:FilePath/<nom exact du fichier>?width=400 avec un User-Agent sans donnée personnelle, une requête toutes les quelques secondes, et vérifie la licence sur la page du fichier. Télécharge l'original dans un dossier à part (jamais dans DEPOT/), ajoute une ligne à CROPS dans atelier/outils/preparer-portraits.py (recadrage 4:5 sur le buste, tête vers le tiers haut), lance `python3 -I atelier/outils/preparer-portraits.py <dossier> jeu/assets/images/personnages`, puis regarde le résultat (240 × 300, 40 à 80 Ko, sans texte de l'œuvre ni symbole religieux).
- Crédit complet dans portrait (oeuvre, artiste, date, institution, licence, url) et une ligne dans jeu/CREDITS.md, rubrique « Portraits des souverains » (nom du fichier, titre, artiste, date, institution, licence, adresse) : le validateur vérifie le fichier et la ligne.
- Dans le rapport : chaque personnage ajouté avec sa page source, son seuil, le portrait et sa licence, à confirmer par Romain.

### Devoir (énoncé, corrigé, remarques du correcteur)
- Aucune question ne naît d'un devoir.
- Mets à jour jeu/data/devoirs.js (semaine, périmètre) sans aucun texte du devoir.
- Inscris le fichier au registre avec le type enonce ou corrige et, dans cours, l'identifiant du devoir : le validateur s'en sert pour l'anti-spoil.
- Écris atelier/devoirs/<id>.md : les notions évaluées (identifiants) et, si le devoir est corrigé, les notions réussies, celles à retravailler et ton estimation par cours. Ni le nom de l'élève, de sa famille ou du correcteur, ni numéro de sécurité sociale.
- Anglais : laisse le périmètre vide et demande à Romain quelles séquences le devoir couvre.
- Contrôle anti-spoil : compare toutes les questions du périmètre avec l'énoncé (exemples, chiffres, documents, tournures). Réécris celles qui recoupent et cite-les dans le rapport.

### Devoir corrigé : suivi des cours (jeu/data/suivi.js et jeu/data/a-retravailler.js)
Le jeu ne fait plus passer d'épreuve : c'est toi qui dis si un cours est acquis ou à revoir. Format exact : docs/FORMAT_DONNEES.md, section suivi.js.
- Il faut un corrigé de l'élève : sa note, les remarques du correcteur ou sa copie annotée. Un corrigé type seul ne dit rien de l'élève : n'estime rien et demande ses remarques à Romain.
- Pour chaque cours du périmètre (entrées de type cours seulement, jamais une révision ou un devoir), écris dans jeu/data/suivi.js, sous cours :
  `"<id du cours>": { etat: "acquis" | "a-revoir", note: "...", source: "<id du devoir>", le: "AAAA-MM-JJ" }`
  et mets majLe à la date du jour.
  - « a-revoir » dès qu'une notion du cours est ratée ou fragile ; sinon « acquis ».
  - source : l'identifiant du devoir dans devoirs.js. Pour un document corrigé sans identifiant (devoir d'entraînement, par exemple), le chemin du fichier relatif à DEPOT/ ; si ce nom contient un nom de personne, demande à Romain de le redéposer sous un autre nom.
  - Un corrigé plus récent remplace l'estimation du même cours : réécris l'entrée entière.
- La note est facultative, 20 mots au plus, écrite pour l'élève avec les mots du cours : elle s'affiche dans sa liste des cours, à côté de « À revoir ». Elle dit quoi revoir (« Revois ce qui distingue… »), jamais comment le devoir l'a demandé. Jamais d'énoncé, de document, d'exemple, de chiffre, de réponse attendue, de note du devoir, ni de nom (élève, famille, correcteur).
- Ajoute à jeu/data/a-retravailler.js les fiches ratées (identifiants seulement, sans doublon) ; retire celles qu'un corrigé plus récent montre réussies. Le jeu ramène plus souvent ces fiches et toutes celles des cours « à revoir ».
- Dans le rapport, liste chaque estimation (cours, état, note) et chaque fiche ajoutée ou retirée : Romain les confirme ou les corrige, et /relecture les reprend sur sa fiche.

### Planning
- Régénère jeu/data/planning.js et jeu/data/devoirs.js. Liste les écarts avec la version précédente et ce qu'ils changent pour les cours déjà estimés dans jeu/data/suivi.js. Ne change jamais un identifiant publié.

### Fiche méthode
- Un fichier jeu/data/cours/methode-<nom>.js par fiche (avec matiere et titre), rattaché selon la section 3 du cahier : frise en Histoire ; diagramme ombrothermique et tableau à double entrée en SVT ; graphique et instruments de mesure en Physique-chimie, la liste du matériel de TP venant compléter les instruments.
- Fiches de savoir-faire et exercices : lire ou compléter une frise, un graphique, un tableau, un diagramme ombrothermique, choisir un instrument et lire une mesure. Mêmes règles de questions qu'un cours. Pas d'épreuve : un savoir-faire s'ouvre dès que son fichier existe et s'estime comme un cours, d'après les devoirs corrigés.
- La fiche de mémorisation ne donne pas de questions : elle sert de modèle à la présentation des fiches du Codex.

### Sauvegarde du jeu
- Ne la modifie pas : elle sert à /relecture.

## 4. Contrôler

- Lance le validateur (`node atelier/outils/valider.js`) et les tests (`node atelier/outils/tests.js`), et corrige jusqu'à zéro erreur. Lis aussi les alertes de suivi.js (chiffre, personne, cours hors du périmètre).
- Vérifie aussi : aucune suite de 12 mots identique à atelier/extractions (cours, notes de suivi.js et textes de personnages.js) ; aucune donnée de devoir dans jeu/ (ni les notes de jeu/data/suivi.js ni jeu/data/a-retravailler.js ne reprennent quoi que ce soit du devoir) ; chaque prérequis pris dans un cours antérieur ou le même cours ; chaque bonne réponse présente parmi les choix.

## 5. Ranger et rendre compte

- Mets à jour atelier/registre.json, atelier/index-notions.json, docs/JOURNAL.md, puis le numéro de version, au même numéro à deux endroits : jeu/VERSION.txt et JEU.version dans jeu/index.html (+1 sur le dernier chiffre). Le validateur refuse deux numéros différents.
- Rapport court à Romain : fichiers traités ; par cours, le nombre de fiches, de questions et de bonus ; ce qui n'est pas couvert ; tes doutes, avec la page à regarder ; les questions réécrites à cause d'un devoir ; pour un devoir corrigé, chaque estimation de suivi.js (cours, état, note) et les fiches ajoutées à a-retravailler.js, à confirmer. Termine en rappelant /relecture si de nouvelles fiches attendent sa relecture.
