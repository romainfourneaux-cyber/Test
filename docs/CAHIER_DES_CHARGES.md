# Jeu de révision 5e : cahier des charges

Version 3 du 13 octobre 2026. Elle remplace la v2 du même jour. Les points marqués « à valider » sont des propositions : Romain tranche.

## 1. Joueur et usage

- Élève de 5e aux Cours Griffon (scolarité complète). Vocabulaire visé : 13 ans.
- Il joue seul, sur son temps libre : au moins 20 minutes par semaine, souvent plus. Une séance type dure 15 à 20 minutes.
- Ses jeux : Medieval Total War, Manor Lords, des FPS, Brawl Stars. Il n'aime ni le pixel art ni le style manga.
- Ce qui le fait rester : voir son domaine et sa ville grandir.
- Pas de chrono, pas trop d'échecs.
- Il gère seul : il déclare les cours qu'il a faits, le jeu vérifie qu'il les maîtrise.
- PC Windows, Edge ou Chrome. Programme de 5e seulement.
- Romain consacre une vingtaine de minutes par semaine à vérifier le contenu.

## 2. Principes

- Le jeu d'abord ; des graphismes simples mais soignés.
- Le jeu révise les notions du cours, jamais les devoirs.
- Le contenu de cours vient uniquement des fichiers déposés. Un jeu qui enseigne une erreur est pire qu'aucun jeu.
- Tout est préchargé. Ni IA ni réseau pendant la partie. Une question toutes les 10 à 20 secondes, un clic au plus entre deux questions.
- Après une bonne réponse, on enchaîne. Après une erreur : deux phrases d'explication, un bouton Continuer et un lien vers la fiche du Codex. Pendant une épreuve, un siège ou un boss, ce lien attend le bilan de fin.
- Difficulté adaptative, réglée pour environ 8 réussites sur 10.
- Une erreur ne retire jamais rien de ce qui a été gagné.
- Les récompenses viennent des notions réussies, jamais du hasard seul. Tout ce qui fait plaisir rapporte quelque chose de visible.

## 3. Matières

- Dans le jeu : Histoire, Géographie, SVT, Physique-chimie, Littérature (livrets I à III) avec la lecture suivie (Un hivernage dans les glaces, Les Fourberies de Scapin, Lancelot), Anglais, et les savoir-faire des fiches méthode (frise, graphique, tableau à double entrée, diagramme ombrothermique, instruments de mesure).
- Fiches méthode, rattachement par défaut (Romain peut le changer) : frise chronologique en Histoire ; diagramme ombrothermique et tableau à double entrée en SVT ; réalisation d'un graphique et instruments de mesure en Physique-chimie (la liste du matériel de TP complète les instruments). La fiche de mémorisation ne donne pas de questions : elle inspire la présentation des fiches du Codex.
- Hors jeu : maths, français (grammaire, rédaction, dictée, poésie), espagnol, musique, arts plastiques, EMC, technologie, latin (option non prise), théâtre.
- Visios, devoirs eux-mêmes, dictées et récitations : hors quiz.

## 4. Univers et direction artistique

### Univers
- Histoire réelle, de l'Empire byzantin à Louis XIV, au rythme du cours. Personnages, villes, monuments et armées viennent du cours. Aucun élément fantastique. Ton épique et chevaleresque, sans violence graphique.
- Le joueur est un seigneur fictif qui bâtit son domaine. Selon l'ère, il sert une puissance réelle du cours (vassal de l'empereur carolingien, puis du roi capétien) ou part en mission auprès d'une autre (Byzance, califat abbasside) comme ambassadeur ou marchand. À valider.
- Croisades et guerres de religion : les camps sont des puissances politiques, avec le ton neutre du cours. Aucune figure religieuse en unité de combat, aucun lieu de culte détruit, aucune caricature.

### Les six ères (histoire)

| Ère | Semaines | Cours | Contenu |
|---|---|---|---|
| 1. Les héritiers de Rome | S1 à S2 | 1 à 3 | Byzance de Justinien, Empire carolingien, christianisme entre Orient et Occident |
| 2. Le monde de l'islam | S3 à S4 | 4 et 5 | Islam, origines et expansion ; Empire abbasside |
| 3. Le temps des seigneurs | S4 à S9 | 6 à 11 | Campagnes, seigneurie, féodaux, État royal fort |
| 4. Chrétienté et croisades | S12 à S19 | 12 à 22 | Chrétienté médiévale, essor des échanges, croisades, du Moyen Âge à l'époque moderne |
| 5. Renaissance et grandes découvertes | S21 à S25 | 23 à 28 | Humanisme, arts de la Renaissance, grandes découvertes, empires coloniaux |
| 6. Réformes, sciences et roi absolu | S27 à S32 | 29 à 37 | Réforme protestante, conflits religieux, révolution scientifique, Louis XIV et Versailles |

Chaque ère change le décor, les bâtiments à débloquer et la monnaie, et se termine par un boss (quiz de synthèse) qui ouvre le décor de la suivante. Le boss ne bloque jamais l'ouverture des cours. La géographie, les sciences, la littérature et l'anglais avancent en parallèle, chacun dans son quartier.

### Direction artistique
- Références : la carte de campagne de Medieval Total War, les plans de ville anciens, l'enluminure, l'héraldique. Ni pixel art, ni manga ou anime, ni cartoon enfantin.
- Rendu vectoriel (SVG et CSS) : aplats, traits d'encre, texture de parchemin, blasons, silhouettes d'unités. Icônes Game-icons (CC BY, crédit obligatoire). Enluminures et cartes anciennes du domaine public (Wikimedia Commons) possibles, source notée.
- Deux cartes : la carte de campagne (histoire), stylisée comme une carte d'époque, et l'Observatoire (géographie), monde actuel tiré de Natural Earth au 1:110m (domaine public).
- Palette : fond #efe6d2, pierre #8a7f70, encre #2e2419, or #b08d3a. Une teinte par matière : pourpre pour l'Histoire, ocre pour la Géographie, vert pour les SVT, bleu pour la Physique-chimie, brun pour la Littérature, sarcelle pour l'Anglais (à valider). Les erreurs s'affichent en brique, jamais en rouge vif.
- Typographie : Cinzel pour les titres, Crimson Text pour les questions (fichiers locaux, licence OFL), repli sur Georgia. Questions en 18 px au moins.
- Son : effets courts (coup, sceau, construction, validation) sous licence CC0 (Kenney), qu'on coupe d'un clic. Ils comptent plus que le dessin pour le plaisir de jeu.
- Animations de moins de 400 ms pour tout ce qui suit une réponse, sans jamais retarder la question suivante. Une ambiance animée continue (fumées, nuages, villageois, drapeaux), lente et sans clignotement, se coupe dans les Réglages (décision du 13/10/2026).

## 5. Structure de jeu

Deux niveaux, comme dans Total War : le domaine, où l'on gère et construit, et la campagne, où l'on se déplace et combat. Les combats se jouent en mini-jeux.

### Le domaine (à la Manor Lords)
- Vue de dessus, façon plan de ville ancien. Le domaine passe de hameau à village, bourg puis ville selon le nombre de bâtiments construits.
- Six quartiers : château (Histoire), marché et routes (Géographie), herboristerie (SVT), forge et moulin (Physique-chimie), scriptorium (Littérature et lecture), ambassade (Anglais).
- Ressources : sceaux (Histoire), routes (Géographie), remèdes (SVT), alambics (Physique-chimie), parchemins (Littérature), alliances (Anglais). Valeurs de départ, à équilibrer : 1 par bonne réponse, 10 par cours validé, 30 par siège gagné.
- Bâtiments : débloqués quand la matière atteint 70 % de maîtrise sur les notions vues, puis construits avec des ressources d'au moins deux matières (la bibliothèque coûte des parchemins et des sceaux, par exemple). On ne les obtient qu'avec des ressources gagnées en jouant.
- À valider, désactivé par défaut : une notion pas révisée depuis longtemps use son bâtiment, une révision le répare.

### La campagne (à la Total War), jalon 2
- Carte en réseau : des lieux cités dans le cours, reliés par des routes qui portent les prérequis. Les lieux des cours pas encore ouverts restent dans la brume.
- Batailles au tour par tour (une question, puis la riposte), de 2 à 3 minutes.
- Siège = devoir (section 8). Boss de fin d'ère = quiz de synthèse.
- Un lien entre matières n'ouvre jamais un lieu dont le cours n'est pas ouvert.

### Progression et motivation
- Le mentor, un chroniqueur du royaume, donne des indices, félicite et ouvre la bonne fiche après une erreur.
- Arbre des notions avec prérequis ; un prérequis appartient toujours à un cours antérieur ou au même cours.
- Le Codex, à la manière de la Civilopédie de Civilization : les fiches des cours ouverts ou présumés acquis, et les bonus à part, marqués comme tels. Fermé pendant une épreuve, un siège ou un boss.
- Répétition espacée Leitner, 5 boîtes (1, 2, 4, 8 et 16 jours). Tirage d'une partie libre : 50 % de notions à revoir, 40 % de cours récents, 10 % de notions solides. Les notions listées dans a-retravailler.js comptent comme à revoir.
- À valider : quêtes courtes à la Brawl Stars qui récompensent la variété des matières ; collection d'unités et de héros ; serment (avant de répondre, il jure d'être sûr de lui : gain doublé s'il a juste, seul le bonus est perdu s'il se trompe) ; événements qui relient deux matières (un marchand, un sage).

## 6. Mini-jeux

| Mini-jeu | Question | Modèle | Effet | Jalon |
|---|---|---|---|---|
| Assaut | QCM | Slay the Spire : chaque notion est une carte, la jouer demande une bonne réponse | 8 questions par assaut. Dégâts = poids de la question ; trois bonnes réponses d'affilée donnent un coup puissant (+50 %). Ennemi à zéro : victoire. Sinon, retraite honorable avec un gain proportionnel aux dégâts. Le joueur n'a pas de points de vie | 1 |
| Sceau de vérité | Vrai/faux justifié | Reigns : glisser à gauche (faux) ou à droite (vrai), ou flèches du clavier | 10 cartes. Si c'est faux, il choisit la bonne correction parmi deux ou trois. Chaque carte juste et bien corrigée rapporte 2 ressources de sa matière ; à partir du jalon 2, une série réussie à 80 % fortifie une province (bonus de force au prochain siège) | 1 |
| Plan de bataille | Légende de schéma | Phase de déploiement de Total War : placer ses troupes revient à placer les légendes | Placement juste : la notion se renforce. Plan complet : bonus de force pour la bataille suivante | 2 |
| Observatoire | Clic sur la carte | Seterra (quiz de cartes) | Pays trouvé : territoire révélé ; trois d'affilée : une route commerciale | 2 |
| Ambassade | Anglais | Des émissaires apportent des lettres à comprendre et auxquelles répondre ; la voix anglaise du navigateur lit les mots | Alliances et commerce | 3 |
| Chronique | Ordre, frise | Timeline (jeu de cartes) | Frise complète : un bâtiment offert | 3 |
| Pont de liens | Association | Mini Metro : tracer la ligne entre deux éléments liés | Accès à la province voisine | 3 |
| Forge | Calcul pas à pas | Potion Craft : chaque étape juste ajoute un ingrédient | Une arme ou un objet pour les batailles | 4 |
| Coffre secret | Énigme | The Room (boîte à énigmes) | Un objet rare | 4 |

## 7. Progression dans l'année

- Calendrier : la semaine 1 commence le lundi 31 août 2026, sans pause pendant les vacances. S7 est la semaine du 12 octobre 2026, S34 celle du 19 avril 2027. Après S34, le jeu passe en révision libre.
- Le calendrier informe, il ne bloque rien : il affiche la semaine en cours, le prochain devoir, l'avance ou le retard par matière.
- Déblocage : un cours s'ouvre quand son fichier existe et que le cours précédent de la même matière est validé ou présumé acquis. Aucune limite d'avance (avanceMax = null dans config.js). L'anglais suit la même règle, séquence par séquence.
- Validation : l'élève coche « cours fait » et le jeu lance une épreuve de 8 questions sur ce cours (niveaux 1 et 2, types variés). À 75 % ou plus, le cours est validé : ressources, et parfois un bâtiment débloqué. En dessous, le mentor ouvre les fiches ratées, puis nouvelle épreuve avec d'autres variantes, sans pénalité ni attente.
- Les entrées « Révisions » du planning se cochent sans épreuve, et les entrées « Devoir » renvoient au siège correspondant ; ni les unes ni les autres ne bloquent le cours suivant. Les savoir-faire des fiches méthode sont ouverts d'emblée.
- Cours des semaines 1 à 6 : présumés acquis. Ils servent de prérequis et entrent dans la répétition espacée ; les valider rapporte quand même.
- Un cours pas encore ouvert reste dans la brume : titre visible, ni question, ni indice, ni aperçu.
- La position de l'élève se compte en cours validés, et non plus en jours ou en créneaux.

## 8. Devoirs = sièges

- Chaque devoir d'une matière du jeu devient un siège sur la carte. Son périmètre couvre les cours de la matière depuis le devoir précédent. Liste complète et périmètres : docs/PROGRAMME_5E.md.
- Anglais : le périmètre d'un devoir dépend des séquences réellement faites. Il reste vide, et le siège fermé, tant que Romain ne l'a pas confirmé.
- Le siège s'ouvre quand tous les cours du périmètre sont validés ou présumés acquis : 12 à 15 questions, niveaux 2 et 3, sans Codex. Pas d'échec possible : chaque bonne réponse ouvre une brèche, et le siège reprend là où il s'était arrêté.
- Quand il a envoyé le devoir, l'élève le coche avec la date, comme sur le plan des devoirs papier. La province est alors tenue jusqu'au devoir suivant, et la répétition espacée continue.
- Thèmes sans devoir en fin d'année (Géographie thème 3, SVT livret 3 chapitres 2 et 3, Physique-chimie thème D, Littérature livret III chapitres II et III) : un boss de fin de thème.
- Romain dépose l'énoncé dès qu'il peut, avant que son fils fasse le devoir, pour le contrôle anti-spoil ; puis le corrigé ou les remarques du correcteur. Les notions ratées reviennent alors plus souvent dans le jeu.

## 9. Non-spoil

- Interdit dans jeu/ : énoncé, question, document, tableau, figure, donnée chiffrée, exemple ou réponse attendue tirés d'un devoir.
- Autorisé : définitions, règles, méthodes, vocabulaire et repères du cours.
- Une question porte toujours sur un autre exemple que celui du devoir.
- Les productions personnelles (avis, carte mentale, création, rédaction libre) restent hors jeu, ou passent dans un parchemin d'autoévaluation sans note automatique.
- Documents Cours Griffon : rien de recopié, ni texte ni image. Fiches reformulées, schémas redessinés.
- Le nom de l'élève, de sa famille ou d'un correcteur et les numéros de sécurité sociale ne sont recopiés nulle part. Les personnages historiques et les auteurs du cours restent, bien sûr.

## 10. Questions

- Types : qcm ; qcm_multiple ; vrai_faux (si c'est faux, choix d'une correction parmi deux ou trois) ; association ; ordre ; trou (banque de mots au niveau 1, sans banque au niveau 3) ; legende_schema (coordonnées de placement dans le fichier) ; clic_carte (code ISO de Natural Earth) ; calcul_etapes (chaque ligne vérifiée, exemples inventés).
- Niveaux : 1 reconnaître (QCM à 4 choix), 2 rappeler ou classer, 3 appliquer ou relier. Épreuves et parties libres : niveaux 1 et 2. Sièges et boss : niveaux 2 et 3.
- Le jeu fabrique les variantes à partir des fiches : QCM avec des leurres pris dans le même chapitre, associations, frises, clics sur la carte. S'écrivent à la main : les questions en « pourquoi » et en « comment », et au moins une vrai_faux par notion avec ses corrections (le Sceau de vérité en a besoin).
- Les bonus n'entrent jamais dans une épreuve, un siège ou un boss. Ils vivent dans le Codex puis, au jalon 4, dans le Coffre secret.
- Format exact : docs/FORMAT_DONNEES.md.

## 11. Module connaissance

- Romain dépose les fichiers (un cours, un chapitre ou un livret entier, en PDF ou en photo) dans DEPOT/, rangés par type et par matière.
- La commande /traiter lit les nouveautés, découpe selon le planning, rédige les fiches reformulées avec leur page, les questions, les schémas redessinés, les bonus et la liste « non couvert », passe le validateur et met à jour l'index des notions.
- Bonus : environ une fiche pour quatre fiches de cours, rattachée à une notion, avec une source fiable notée (encyclopédie, musée, institution), marquée bonus partout.
- La commande /relecture prépare une fiche A4 imprimable : une ligne par fiche nouvelle avec la page du livret, une trentaine de lignes pour 20 minutes. Elle traite aussi les signalements de l'élève, trouvés dans sa sauvegarde exportée.
- Dans le jeu, « Signaler une erreur » est proposé à chaque correction ; les signalements partent avec l'export.

## 12. Architecture technique

- HTML, CSS et JavaScript pur en scripts classiques ; ouverture par double-clic sur jeu/index.html (Edge, Chrome).
- Arborescence :
  - jeu/index.html, jeu/VERSION.txt, jeu/CREDITS.md
  - jeu/css/
  - jeu/js/ : un fichier par module (noyau, brouillage, calendrier, sauvegarde, leitner, chargeur, domaine, validation, assaut, sceau, codex, mentor, signalement, interface)
  - jeu/data/ : config, planning, devoirs, index-cours, a-retravailler, cours/, anglais/
  - jeu/assets/ : polices, sons, icônes, images, cartes
  - atelier/ : registre.json, index-notions.json, extractions/, devoirs/, relectures/, outils/, versions/
- Chargement : config, planning, devoirs, index-cours et a-retravailler, puis une balise script par cours listé. Un fichier en erreur ne bloque pas le jeu : le cours passe en « contenu à venir ».
- Sauvegarde : localStorage (clé jeu5e), schéma versionné avec migration, export et import en JSON. Le jeu rappelle d'exporter si le dernier export a plus de 7 jours.
- Brouillage des réponses : la même fonction dans jeu/js/brouillage.js et atelier/outils/brouillage.js.
- Validateur : atelier/outils/valider.js (Node, tous les contrôles) et atelier/outils/validateur.html (navigateur, contrôles qui ne demandent pas les extractions).
- Anglais : synthèse vocale du navigateur, en-GB de préférence. Si aucune voix anglaise n'est installée, le jeu le signale et explique comment en ajouter une dans les paramètres vocaux de Windows.
- Accessibilité : gros boutons, raccourcis clavier (1 à 6 pour les choix, flèches, Entrée), aucun clignotement.
- Prérequis sur le PC de Romain : Poppler (pdftoppm, pdftotext) pour lire les PDF de plus de 10 pages ; Node.js LTS, fortement conseillé, pour le validateur complet et les tests.

## 13. Jalons

1. Socle et premier plaisir de jeu : config, calendrier, chargement, sauvegarde, domaine (hameau puis village), validation des cours, Assaut, Sceau de vérité, Codex, mentor, signalements, Leitner, validateur, savoir-faire tirés des fiches méthode. Critères d'acceptation dans LANCEMENT.md.
2. La campagne : carte de campagne, ères, sièges, boss, Plan de bataille, Observatoire.
3. Les langues et le temps : Ambassade (anglais et voix), Chronique, Pont de liens.
4. La profondeur : Forge, Coffre secret, quêtes, collection, serment, événements, équilibrage, finitions sonores.

Chaque jalon se termine par une version jouable, le journal à jour et une liste courte de vérifications pour Romain.

## 14. Points ouverts

- Rôle du joueur selon l'ère (section 4).
- Quêtes, collection, serment, usure des bâtiments.
- Couleur de l'anglais.

## Historique

- v1, 13/10/2026 : résumé de la première conversation de conception.
- v2, 13/10/2026 : réponses sur l'élève et l'usage, anglais intégré, module connaissance, vitesse, modèles des mini-jeux.
- v3, 13/10/2026 : pas de style manga ; cours validés par le jeu, sans limite d'avance ; calendrier fixé (S1 = 31/08/2026, sans pause) ; zone DEPOT et bonus ; programme réel relevé dans les PDF (six ères jusqu'à Louis XIV, croisades en S17, littérature livrets I à III, lecture suivie, anglais au rythme de l'élève) ; position comptée en cours validés ; jalons.
