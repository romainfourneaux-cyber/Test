# Plan graphismes et animations (31/10/2026)

Demande de Romain du 31/10/2026 : « Améliore les graphismes et les animations ». Ce plan arbitre les deux audits
(audit-graphismes-bataille.md et audit-graphismes-ecrans.md) et les découpe en trois lots d'environ une journée,
chacun pour deux ou trois agents en parallèle. Rien n'a été modifié dans jeu/ pour l'écrire.

Ce qui a été fait pour l'écrire : lecture complète des deux audits ; regard sur les planches et les images qu'ils
citent (champ : hd-melee, h-chute, h-breche, h-marche, ht-trebuchet, ht-impact, ht-archers, a-efface, hv-victoire,
construction, h-sans-anim, hud-juste ; écrans : transitions accueil → domaine, conseil, retour sur la route, bonne
réponse, panneau d'erreur, carte, domaine, brume de la route, bilan du conseil) ; deux mesures neuves, rangées dans
atelier/captures/audit-graphismes/plan/ :
- base-boucle.json : la boucle de bataille en grosse mêlée, aujourd'hui, en 1920 × 1080 et 1340 × 800, normale et
  ralentie 4 × (script base-boucle.js) ;
- temps-rendu.json : le vrai temps de rendu d'une figurine et d'une tour dans ce conteneur (essais hors de jeu/,
  outil essai-tour.py). Correction de l'audit du champ : le module de rendu Blender **est** disponible ici
  (bpy 5.2.2 dans /tmp/bpy-env, appelé par commun.py), et il est plus rapide que l'estimation.

Sommaire : 1. Diagnostic. 2. Décisions de l'arbitre et règles communes. 3. Lot A. 4. Lot B. 5. Lot C. 6. Réserve.
7. Contrôles d'acceptation. 8. Risques et revue. 9. Pour Romain.

## 1. Diagnostic (une page)

**Ce qui marche déjà.** À l'arrêt, le jeu a l'allure voulue. Terrain rendu en 3D, places fortes et tours, bataillons
en rangs avec bannières héraldiques lisibles (h-marche-00 à 22), figurines qui tombent une à une, sang qui gicle du
côté du coup (hd-melee-18 à 22), fumées des places abîmées, ombres de nuages. Hors bataille : la carte de campagne
(pc/04-campagne.png) est le plus bel écran ; missives à lettrine et sceau, carte du conseil qui se retourne, parchemin
des expéditions. Le vocabulaire (cuir, parchemin, filets d'or, Cinzel) est tenu partout. Les réglages Animations et
Sang font ce qu'ils disent (h-sans-anim-00 à 07, pc/seq-51-sans-anim-conseil/).

**Ce qui est faible, par ordre d'importance.**
1. **Rien ne pèse.** Une pierre de trébuchet tombe dans un bataillon : bouffée pâle, cubes clairs, la troupe continue
   (ht-impact-02 à 11). Des cavaliers frappent la porte : ils deviennent des fantômes bleus devant elle, la porte ne
   bouge pas (h-breche-14 à 19). La victoire se joue en une image : le château est déjà en ruine à la première image,
   tes troupes s'effacent, le champ reste vide (hv-victoire-00 à 07). Aucune secousse nulle part.
2. **Les tours et la mêlée n'ont pas de geste.** Le trébuchet garde sa verge immobile et la pierre naît en l'air
   au-dessus de lui (ht-trebuchet-00 à 11). Les figurines marchent sur place au contact. Le choc est une grande étoile
   blanche qui cache le premier rang (hd-melee-00, h-chute-00 à 02).
3. **Les morts sont des bâtons.** La figurine tuée pivote d'un quart de tour et devient un trait gris (h-chute-03 à
   11). Sur un pont encombré, morts et vivants font une bouillie rouge et brune (a-efface-00 à 11). Le pas patine
   (cycle de 30 px au lieu de 15).
4. **Les écrans passent par le cuir nu.** Entre deux écrans, 60 à 150 ms de fond vide sur PC, plus sur tablette
   (pc/seq-02-transition-accueil-domaine/f08-0393ms.png, pc/seq-36-exp-retour-sceau/f03-0166ms.png). Le même
   mécanisme cache le sceau qui tombe sur la route (f06-0395ms : le sceau est déjà posé).
5. **Une réponse hors bataille n'a pas de poids.** Bonne réponse : la question suivante est là à 50 ms, un médaillon de
   18 px s'envole (pc/seq-13-evenement-bonne-reponse/f02-0050ms.png). Mauvaise : une boîte rose « Pas tout à fait. »
   remplace la question, l'élève ne voit plus ce qu'il avait choisi (pc/14-evenement-panneau-erreur.png). Le sceau
   « Sage décision » se pose sur le texte de la carte suivante (pc/seq-19-conseil-bonne-reponse/f04-0305ms.png).
6. **La carte est immobile, le domaine sort du style.** Pas une fumée, pas un drapeau, pas un oiseau sur la carte. Le
   plan du domaine est un schéma pastel à taches floues (pc/03-domaine.png). La brume de la route est un rectangle à
   bords nets (pc/33z-exp-route-brume-zoom.png). Les « feuilles » du bilan sont des confettis
   (pc/seq-22-conseil-bilan/f10-1047ms.png).
7. **La tablette est déjà à la limite.** Mesures du jour (base-boucle.json) en grosse mêlée :

| Fenêtre | Processeur | Boucle médiane | Boucle 95 % | Boucle max | Image médiane |
|---|---|---|---|---|---|
| 1366 × 768 (audit du champ) | normal | 2,1 ms | 3,1 ms | 6,0 ms | 16,7 ms |
| 1920 × 1080 | normal | 2,1 ms | 3,7 ms | **7,1 ms** | 16,7 ms |
| 1340 × 800 | normal | 2,0 ms | 4,8 ms | 7,3 ms | 16,7 ms |
| 1340 × 800 | ralenti 4 × | **7,2 ms** | 12,9 ms | 26,9 ms | **33,3 ms** |
| 1920 × 1080 | ralenti 4 × | 7,8 ms | 15,3 ms | 33,7 ms | 50 ms |

   Au ralenti 4 × (approche de la Galaxy Tab A9), la bataille tombe à 30 images par seconde. L'accueil coûte 133 ms
   par image (poussières animées en background-position) et le domaine a 15 % d'images lentes (flou SVG animé). Toute
   animation nouvelle doit donc être payée par une économie.

**Verdict.** Le style est bon ; ce qui manque, c'est le mouvement qui a du poids, et une marge de calcul pour le payer.
Les deux audits disent juste, chiffres et images à l'appui. Je les suis presque partout ; mes arbitrages sont en 2.1.

## 2. Décisions de l'arbitre et règles communes

### 2.1 Décisions

1. **Payer avant d'ajouter.** La couche de sol (corps, sang, cratères posés une fois dans une toile) ouvre le lot A :
   elle rend 1,5 à 2 ms au ralenti 4 ×. Aucun effet continu n'entre dans la bataille avant elle.
2. **Ordre des jours.** Jour 1 : lot A. Jour 2 : lot B. Jour 3 : lot C. Le premier agent du lot C (mesures) commence dès
   le jour 1 : il ne touche que atelier/, et A et B ont besoin de ses mesures pour être acceptés. A et B peuvent tourner
   le même jour si l'intégrateur le veut (fichiers presque disjoints, voir 2.3), mais jamais avant que la passe
   tablette soit livrée et fusionnée : elle modifie jeu/js, jeu/css et jeu/index.html en ce moment.
3. **Ce qui est différé** (section 6) : le plan du domaine enluminé (2 à 3 jours, le plus gros chantier) ; les
   drapeaux animés des tours et places fortes (le poste le plus cher par gain : 0,7 ms au ralenti 4 ×) ; la marche à 8
   images et trois sens ; l'habillage des listes, du Codex et des réglages ; corbeaux, reflets sur l'eau, brouillard
   en nappes. Le lot C garde seulement ce qui est gratuit ou qui fait gagner du temps (flou du domaine, accueil).
4. **Mauvaise réponse en bataille.** Hors bataille, la question reste visible et le panneau se déplie dessous. En
   bataille, la colonne est étroite et perf.js contrôle l'énoncé visible à 1366 × 768 : on garde le remplacement
   actuel, mais le panneau montre ta réponse barrée de rouge au-dessus de la bonne réponse en or. Pas de risque de mise
   en page.
5. **Palier tablette.** Oui, en deux étages. a) Un nouveau réglage « Ambiance » sous « Animations » : nuages, fumées
   de la carte, oiseaux, drapeaux, brume qui dérive. Champ facultatif reglages.ambiance, absent = actif, comme
   reglages.sang : aucun changement du numéro de schéma de la sauvegarde. b) Un régulateur automatique qui allège
   la bataille et coupe l'ambiance des écrans quand la machine peine (lot C). Animations coupées coupe toujours tout.
6. **Bannières de la carte.** Rendues dans Blender (bande de 6 images par camp), comme le reste. Pas de drapeau
   vectoriel plat sur un bourg rendu en 3D. Le rendu est fait par l'agent de rendu du lot A, tôt dans sa journée ; s'il
   manque, le lot B garde les bannières cuites et fait le reste de l'ambiance.
7. **Nouveaux fichiers plutôt que gros fichiers partagés.** Les effets du champ vont dans deux scripts classiques
   neufs : jeu/js/bataille-sol.js (couche de sol) et jeu/js/bataille-effets.js (étincelles, mottes, traînées,
   poussières, pool de particules, adoucissements). bataille.js les appelle s'ils existent et dessine comme
   aujourd'hui sinon (tests.js le charge seul dans un contexte vm).

### 2.2 Règles communes (contrat pour tous les agents)

- **Le moteur ne change pas.** jeu/js/bataille-moteur.js reste identique octet pour octet. Les effets se déduisent de
  ce qu'il publie (projectiles neufs, effets « impact », « breche », « coup », « chute », « pique »). Les champs de
  dessin vont où ils vont déjà (u.bat, pr.dvx, e.dvx, v.*) ; aucun champ nouveau que le moteur lirait.
- **Pas de Math.random dans le dessin neuf.** Un petit tirage local (graine tirée de l'effet). Ainsi une même partie
  donne la même issue quels que soient les réglages, et perf.js peut le vérifier (7.4).
- **Trois familles d'animation, trois interrupteurs.**
  - État du jeu (marche, traits en vol, jauges) : toujours là.
  - Retour d'une action (gestes, chutes, tirs des tours, impacts, secousses, sceaux, transitions, or qui roule) :
    JEU.anim.actif() (Animations, prefers-reduced-motion).
  - Ambiance continue (nuages, fumées, oiseaux, drapeaux, brume, poussières de l'accueil) : nouvelle fonction
    JEU.anim.ambiance(), vraie seulement si actif() et si le réglage Ambiance et le régulateur la laissent. L'agent A2
    ajoute la cale de trois lignes dans anim.js dès le matin du lot A (ambiance = actif ; seule exception au tableau
    2.3) ; le lot C la remplit.
  - Sang : JEU.anim.sang(). Coupé : ni goutte, ni flaque, ni tache, ni corps gardé plus de 1,4 s. Les étincelles et
    les chutes restent.
- **Plafonds dans la toile** : 8 coups étincelants, 24 traits avec traînée, 60 particules, 10 lueurs, une secousse à la
  fois. Particules dans un pool alloué une fois (tableaux fixes, rien de créé à chaque image).
- **Jamais de voile ni de dégradé plein écran dans la toile.** Secousse, éclair, liseré, voile doré ou gris : feuille
  de style, sur le cadre de la toile.
- **Feuille de style : transform et opacity seulement pour ce qui tourne en continu.** Une seule exception admise :
  stroke-dashoffset sur les deux traits d'eau de la carte (deux chemins, mesurés). Jamais de filter SVG sur un groupe
  animé.
- **Rien dans le chemin réponse → question suivante.** Tout ce qu'une réponse déclenche part après l'image
  (JEU.anim.apresImage).
- **Compteurs pour la mesure.** bataille.js expose dans JEU.bataille.rendu : particules, etincelles, trainees, lueurs,
  gouttes, flaques, decalques (corps, taches, crateres), secousses, niveau (régulateur).
- **Repli.** Toute nouvelle bande a son repli : la marche si la bande d'attaque ou de chute manque, l'image de repos
  si la tour n'a pas d'images de tir, poseCouchee() si le corps rendu manque. Une tour rendue en bande reste lisible
  par le code actuel (image 0).
- **Méthode du projet** (règles du projet) : après chaque changement, valider.js et tests.js, une ligne au journal ; un commit
  par jalon ; un numéro de version par lot livré (après celui de la passe tablette), dans jeu/VERSION.txt et
  JEU.version. Tout fichier qui entre dans jeu/ : relancer atelier/outils/generer-sw.js (tests.js le vérifie) et
  vérifier la liste des fichiers embarqués de l'application Android. Images rendues : rendus maison sur textures CC0
  déjà créditées ; une ligne dans jeu/CREDITS.md si une nouvelle source entre.

### 2.3 Qui touche quoi

| Agent | Fichiers |
|---|---|
| A1 rendu | atelier/outils/rendu-3d/ (figurines.py, unites.py, tours.py, engins.py, effets.py, campagne.py, verifier.py, planche.py) ; jeu/assets/images/td/ et campagne/ (images neuves, sprites.js généré) ; l'après-midi, la fin de bataille dans bataille.js (A3.6) |
| A2 dessin du champ | jeu/js/bataille-sol.js et bataille-effets.js (neufs) ; dans bataille.js : dessiner() (passes sol, troupes, effets), majBataillon, corps, giclee, projectile ; deux balises script dans jeu/index.html |
| A3 retour et mise en scène | dans bataille.js : tour(), agirSur (pose et amélioration), jauge(), fumees(), majHud et orPerdu ; jeu/css/jeu.css, section « Champ : retour » |
| B1 transitions et route | interface.js : ui.afficher, la fenêtre modale, ui.redessiner (neuf) ; ecran-expedition.js ; jeu.css, sections écrans, fenêtre, expédition |
| B2 réponses et conseil | interface.js : poserQuestion, panneauErreur, ui.tampon ; anim.js ; conseil.js ; jeu.css, sections question et conseil |
| B3 carte vivante | ecran-campagne.js (ambiance, conquête, missive, événement du jour) ; jeu.css, section campagne |
| C1 mesures | atelier/outils/perf.js, tests.js ; atelier/captures/audit-graphismes/ (mesurer.js, capturer.js, capturer-bataille-2.js, avant-apres.py neuf) |
| C2 régulateur et finitions | anim.js (ambiance, régulateur), interface.js (case Ambiance), bataille.js (crochets du régulateur, netteté), domaine.js, jeu.css (accueil, focus, onde, pulsations) |

interface.js et jeu.css sont partagés : chacun reste dans ses fonctions et ses sections ; un intégrateur fusionne à la
fin de chaque lot.

## 3. Lot A « Le champ de bataille vivant » (1 jour, 3 agents)

But : que chaque coup se voie et pèse, sans coûter plus qu'aujourd'hui au ralenti 4 ×.

### A1. Rendus (agent A1)

Préalable (10 min) : vérifier /tmp/bpy-env (import de bpy : 30 s à froid). Faire chaque essai d'abord hors de jeu/ :
unites.py a --dossier ; pour les tours, atelier/captures/audit-graphismes/plan/essai-tour.py. Ajouter à tours.py une
option --dossier sur le modèle d'unites.py. Planche de contrôle de chaque famille avec --avant (planche.py), regardée
avant d'écrire dans jeu/.

Bandes à rendre, dans cet ordre (temps mesurés : 3,6 s par image de troupe, 10 s par image de tour qui garde son ombre) :

| # | Bande (nom dans sprites.js) | Images | Taille logique | Script à étendre | Rendus | Processeur |
|---|---|---|---|---|---|---|
| 1 | unite-‹type›-‹camp›-chute, pour fantassins-france, hommes-angleterre, hommes-omeyyades, pietaille-angleterre, pietaille-omeyyades, cavaliers-france, cavaliers-angleterre, cavaliers-omeyyades, champion-angleterre, champion-omeyyades | 4 : genoux qui plient, buste renversé, au sol, couché (arme à côté) ; cavaliers : cheval qui s'affaisse, cavalier qui glisse, au sol, couchés | 40 × 40 (champion 48 × 48) | figurines.py : pose « tombe » (pose_homme, racine tournée de 90° autour des pieds, bassin au sol) ; cavalier ; unites.py : option --bande chute | 40 | ≈ 3 min |
| 2 | unite-‹type›-‹camp›-coup, mêmes 10 troupes | 4 : armer (épaule 130°, coude 40°), frapper (épaule 20°, coude 5°), suivi, revenir ; cavaliers : lance couchée, poussée, cheval qui se cabre un peu | idem | figurines.py : poses de bras ; unites.py --bande coup | 40 | ≈ 3 min |
| 3 | tour-catapulte-france-1, -2, -3 (le trébuchet) | 4 : armé (repos, 36 à 40°), mi-course, verge verticale, lâché (fronde vide) | 70 × 84 | tours.py : boucle d'images ; engins.trebuchet(bras_angle, pierre=False après le lâcher) | 12 | ≈ 2 min |
| 4 | tour-baliste-france-1, -2, -3, tour-baliste-angleterre-1, tour-baliste-omeyyades-1 | 3 : tendue (repos), détendue, retour | 70 × 84 | tours.py ; engins.baliste(arc) | 15 | ≈ 2,5 min |
| 5 | tour-archers-france-1, -2, -3, tour-archers-angleterre-1, tour-archers-omeyyades-1 | 3 : repos, bander, lâcher | 70 × 84 | tours.py : archers (bras_droit, bras_gauche de soldat()) | 15 | ≈ 2,5 min |
| 6 | tour-piquiers-france-1, -2, -3 | 3 : repos, piques poussées, retour | 70 × 84 | tours.py : piquier_tour(pique) | 9 | ≈ 1,5 min |
| 7 | drapeau-france, drapeau-angleterre, drapeau-omeyyades (pour le lot B) | 6 : étoffe qui ondule | 20 × 24 | campagne.py : étoffe déformée par une onde, mêmes emblèmes que les camps | 18 | ≈ 1 min (estimé) |
| 8 | lieu-france, lieu-france-2, lieu-france-3, lieu-angleterre, lieu-omeyyades, sans leur bannière, avec un point « hampe » | 1 | 80 × 80 | campagne.py | 5 | ≈ 1 min (estimé) |
| 9 | effet-cratere (terre retournée, bord clair, centre sombre) | 2 variantes (herbe, route) | 24 × 12 | effets.py | 2 | < 30 s |
| 10 | effet-effondrement (gros nuage dense, pierres) | 8 | 96 × 96 | effets.py | 8 | ≈ 40 s (estimé) |

Total : environ 164 images, **17 à 20 minutes de processeur** ; compter 45 minutes avec les reprises. Poids ajouté :
environ 2 Mo dans jeu/ (15 Mo aujourd'hui). Les ombres des tours ne sont pas refaites (une seule par tour). L'image 0
de chaque tour est rendue dans la même passe que les autres (même graine), et remplace l'image actuelle.

Manifeste (sprites.js, généré) : les bandes de troupes reprennent w, h, ax, ay et face de leur bande de marche ; les
tours passent à frames 3 ou 4 et gagnent « tir » : [x, y], le point de départ du trait (bout de la verge, des bras de
la baliste, de l'arc), relevé sur la scène 3D comme les foyers « fumees » ; les lieux gagnent « hampe » : [x, y].
Mettre à jour l'en-tête du manifeste (ENTETE_MANIFESTE dans commun.py).

Contrôles automatiques à ajouter dans unites.py et tours.py : nombre d'images, même ancre que la marche, 2 px
transparents au bord, couleur du camp (seuils actuels), pas de bleu chez les Anglais, pas de membre détaché sur les
poses de chute (contrôle visuel sur la planche, noté au journal).

### A2. Dessin du champ (agent A2), dans cet ordre

Le matin, la couche de sol et les réglages ; vers midi, les impacts, pendant que A1 rend ; l'après-midi, les chutes
et les gestes, quand les bandes sont là.

**A2.1 Couche de sol qui garde les traces** (la condition de tout le reste).
- Quoi : une toile hors écran de la taille du fond, initialisée avec lui, dessinée à sa place. On y pose une fois les
  corps couchés à la fin de leur chute, leurs flaques quand elles ont fini de s'étendre (1 s), les taches de sang
  retombées, les cratères, une ou deux flèches plantées par troupe touchée. Effacement : à chaque image, une bande
  d'un huitième de la hauteur reçoit le fond d'origine à 0,08 d'opacité ; tout disparaît en 6 à 8 s. Refaite depuis
  le fond quand la netteté change (ajusterNettete) et à chaque nouvelle carte. Les corps couchés sont assombris et
  un peu désaturés à la pose : sur un pont, les vivants se détachent des morts.
- Fichiers : jeu/js/bataille-sol.js (neuf) ; bataille.js : dessiner() (fond), corps(), giclee().
- Images : aucune (utilise la bande « chute » de A1, poseCouchee() en repli).
- Réglages : Sang coupé, rien n'est posé sauf les cratères ; les figurines tombées s'effacent en 1,4 s comme
  aujourd'hui. Animations coupées : on pose directement l'image couchée.
- Acceptation : boucle médiane au ralenti 4 × en 1340 × 800 inférieure d'au moins 1 ms à la base (7,2 ms) avant
  tout autre effet ; corps couchés redessinés à chaque image : 0 (seuls les corps en train de tomber, moins de 0,3 s,
  sont encore dessinés) ; décalques visibles sur les captures 6 s après la pose, disparus 9 s après.

**A2.2 Réglages presque gratuits.**
- Cadence du pas par genre : piétons un cycle pour 15 px (diviseur 4,5 au lieu de 9), cavaliers inchangés.
- Poussières de choc, de trait, de chute et de retrait dessinées dans la passe sol (sous les figurines), moins
  opaques : fin des cavaliers délavés (h-melee-00, hd-melee-08).
- Étincelles de métal à la place de l'étoile blanche : 3 à 5 traits orangés de 2 à 3 px qui s'écartent en 0,15 s
  pour « coup » et « choc » ; pour « touche », un éclat de 6 px au plus.
- Traits à l'échelle par sprite() : flèche 12 px (au lieu de 24), carreau 16 px (32), pierre 9 px (14). Volée de 3
  flèches pour les tours d'archers (décalées de ± 4 px et de 0 à 60 ms, dégâts inchangés). Traînée de 8 à 10 px
  crème à 0,35 derrière flèches et carreaux. Pierre qui tourne sur elle-même, petit nuage qui la suit.
- Bannières de bataillon : ± 1,4 px, 6 vues gardées à 8 images par seconde (banniere()).
- Fichiers : bataille.js (majBataillon, projectile, banniere), bataille-effets.js.
- Réglages : Animations coupées, ni volée, ni traînée, ni étincelle (éclat fixe court), bannières immobiles ; le pas
  reste (c'est l'état du jeu).
- Acceptation : sur la séquence h-marche refaite, un cycle de bande pour 14 à 16 px parcourus (relevé pasV) ; aucune
  étoile blanche dans h-melee, hd-melee, h-chute ; plafond de 24 traînées jamais dépassé (compteur).

**A2.3 Impacts qui pèsent.**
- Pierre : anneau brun au ras du sol (onde(), 10 à 40 px en 0,35 s), 6 à 8 mottes brun sombre en cloche (0,5 s),
  figurines à moins de 48 px repoussées de 1 à 2 px puis ramenées en 0,3 s (amorti), cratère posé dans la couche de
  sol, secousse légère si l'impact est près de ton château (via A3).
- Trait qui touche : la figurine touchée recule de 1 px pendant 80 ms et s'assombrit d'un cran (vue sombre gardée).
- Fichiers : bataille-effets.js, bataille.js (passe effets, décalages fg.ja/fg.jb).
- Images : effet-cratere (A1).
- Réglages : Animations coupées, ni mottes, ni recul, ni secousse ; l'anneau devient une tache fixe ; le cratère reste.
- Acceptation : moins de 0,1 ms par impact au ralenti 4 × (mesure isolée dans perf.js) ; sur ht-impact refait, au
  moins deux figurines voisines déplacées sur deux images consécutives et un cratère visible 3 s après.

**A2.4 Sang varié et chutes rendues.**
- Chute : corps() joue la bande « chute » pendant 0,3 s (BASCULE portée de 0,2 à 0,3), puis pose l'image couchée
  dans la couche de sol.
- Sang : par gerbe, une ou deux grosses gouttes de 2 à 2,5 px et une brume de gouttes de 0,5 px, du côté du coup ; un
  rouge brun (#4a0606) pour les gouttes posées ; flaque qui grandit de 0,4 à 1 en 1 s puis est posée. Pareil pour
  tous les camps. Pas de démembrement.
- Fichiers : bataille.js (corps, giclee), bataille-sol.js.
- Images : bandes « chute » (A1).
- Réglages : Sang coupé, aucune goutte, flaque ni tache ; la chute est jouée puis la figurine s'efface en 1,4 s.
  Animations coupées : directement l'image couchée.
- Acceptation : sur h-chute refait, trois images de chute distinctes par figurine tuée, plus aucun « bâton » pivoté
  quand la bande existe ; sang coupé, compteurs gouttes, flaques et taches à 0 pendant toute la vague.

— ligne de coupe : ce qui suit passe au matin du jour 3 si la journée ne suffit pas —

**A2.5 Gestes de mêlée.**
- Le premier rang au contact joue la bande « coup » sur le rythme de u.frappe (déjà utilisé pour la fente) ; le second
  rang garde la marche sur place, au pas ralenti. Le champion frappe enfin, étincelles × 2.
- Fichiers : bataille.js (majBataillon, vueFigure : clé de vue avec la bande).
- Réglages : Animations coupées, pas de geste (comme aujourd'hui).
- Acceptation : sur h-melee et hd-melee refaits, une arme levée visible dans au moins 3 images sur 12 ; + 0,05 ms au
  plus par image.

### A3. Retour et mise en scène (agent A3)

Le matin, secousse, or, brèche et construction (aucune image neuve) ; l'après-midi, les tours qui tirent, quand A1 a
rendu leurs bandes.

**A3.1 Secousse, éclair, liseré.** Classe sur le cadre de la toile (.td-cadre), animation transform de 120 à 400 ms,
trois forces : 1 px (pierre près de ton château), 2 px (brèche chez le rival), 3 à 4 px (brèche chez toi), 6 px
(effondrement). Éclair blanc chaud 60 ms, opacité 0,15, au plus une fois par seconde. Liseré rouge (box-shadow inset
sur un pseudo-élément, opacité animée) quand tes murs sont frappés. Une secousse à la fois.
- Fichiers : jeu.css (section « Champ : retour »), bataille.js (déclencheurs sur « impact », « breche », fin).
- Réglages : Animations coupées et prefers-reduced-motion, rien.
- Acceptation : 0 ms dans la boucle ; la toile n'est pas repeinte par la secousse (trace de rendu de perf.js : pas de
  « Paint » de la toile pendant une secousse sans changement de jeu) ; jamais deux secousses en même temps (compteur).

**A3.2 Or qui roule et qui vole.** « +12 » qui part du sceau et vole jusqu'au compteur (transform), compteur qui roule
en 0,4 s (chiffres de largeur fixe), éclat sur la pièce ; à l'erreur, le compteur tressaille de 2 px et un « −6 »
rouge en tombe. Lancé après l'image.
- Fichiers : bataille.js (majHud, orPerdu), jeu.css ; utilise JEU.anim.gain d'anim.js (propriété de B2).
- Réglages : Animations coupées, compteur direct, rougeur seule.
- Acceptation : Event Timing de la réponse à la question suivante peinte inchangé (moins de 100 ms) ; perf.js garde son
  contrôle de l'or perdu (sceau « −6 or », bandeau juste).

**A3.3 Brèche.** Trois ou quatre éclats tombent du haut du mur au pied (gravité, 0,5 s), deux bouffées au pied, éclair
sur la place forte (sprite redessinée en « lighter » à 0,25 pendant 80 ms), chiffre qui frappe (échelle 1,6 → 1 en
120 ms puis montée), jauge en deux temps (la part perdue reste claire 0,5 s puis fond). Devant la porte, les troupes
passent derrière la façade en s'assombrissant au lieu de devenir transparentes.
- Fichiers : bataille.js (jauge, tri des volumes près de la porte, effets « breche »).
- Réglages : Animations coupées, pas d'éclair, chiffre sans rebond, jauge directe, une seule image d'éclats.
- Acceptation : sur h-breche refait, aucune figurine à moins de 0,9 d'opacité devant la porte ; moins de 0,1 ms par
  brèche.

**A3.4 Tour qui sort de terre.** À la pose (tr.bati noté dans agirSur), la tour monte du sol en 0,35 s : on dessine
d'abord le haut de l'image au ras du sol, puis une hauteur croissante (drawImage avec source rognée) ; tassement de
2 px qui s'amortit, poussière au pied (effet-poussiere 1,1), losanges d'or d'anim.js réduits de 14 à 6. Amélioration :
révélation de 0,25 s depuis le haut, éclat chaud qui monte.
- Réglages : Animations coupées, apparition directe.
- Acceptation : sur la séquence construction refaite, au moins 4 images de montée ; 0 ms en vague.

**A3.5 Tours qui tirent.** Un projectile neuf donne son départ : on retrouve la tour et on note tr.dernierTir ; l'image
de la tour vaut vue(horloge − dernierTir, durée, frames). Palissade : l'effet « pique » le plus proche fait de même.
Le trait part du point « tir » de la tour (dessin seulement). Poussière au pied du trébuchet au lâcher.
- Fichiers : bataille.js (tour(), point de départ fourni à projectile() de A2).
- Images : bandes de tours (A1).
- Réglages : Animations coupées, image de repos, pas de poussière (les traits volent toujours).
- Acceptation : sur ht-trebuchet refait, la verge passe par au moins trois positions et la pierre quitte le bout de la
  fronde ; 0 ms de plus par image.

— ligne de coupe : ce qui suit passe au matin du jour 3 si la journée ne suffit pas —

**A3.6 Fin de bataille et champion** (repris par A1 l'après-midi, une fois ses rendus finis). Au passage à « fin » :
0,9 s d'effondrement (ancienne image qui s'enfonce de 6 px en s'assombrissant, trois bouffées effet-effondrement
décalées, éclats, secousse forte, puis la ruine). Victoire : la bannière du rival tombe, celle de France monte de
20 px sur la ruine ; tes bataillons restent 1,5 s bannières levées puis le retrait actuel ; voile doré posé en feuille de
style. Défaite : champ désaturé et assombri (feuille de style). Champion : anneau de sa couleur au sol, étoffe
agrandie.
- Images : effet-effondrement (A1).
- Réglages : Animations coupées, changement d'image direct, un nuage fixe, pas de voile ni de secousse.
- Acceptation : pic de 1 ms au plus pendant 1 s au ralenti 4 × ; le bilan arrive comme aujourd'hui ; sur hv-victoire
  refait, au moins 6 images d'effondrement avant la ruine et tes troupes visibles 1,5 s.

## 4. Lot B « La carte et les écrans vivants » (1 jour, 3 agents)

But : plus jamais de cuir nu, une réponse qui se voit, une carte qui respire. Coût à l'exécution : nul ou presque,
compositeur seulement. Chaque agent a une ligne de coupe : ce qui est sous la ligne passe en réserve si la journée ne
suffit pas.

### B1. Transitions et route des expéditions (agent B1)

**B1.1 Changement d'écran sans cuir nu.** L'ancien écran reçoit .sortie (position absolue, 140 ms, légère descente)
pendant que le nouveau entre depuis l'opacité 0,3. ui.redessiner(nom) (ou { sansEntree: true }) pour les redessins
sur place : conquête, arsenal fermé, route, onglets. window.scrollTo après la sortie.
**B1.2 Fenêtres.** Voile en fondu 150 ms, boîte de 0,96 à 1, sortie 120 ms ; retourModale appelé tout de suite (une
bataille qui suit une missive n'attend pas).
**B1.3 Route redessinée sur place, sceau visible.** La route n'est plus reconstruite par ui.afficher quand l'écran est
déjà là ; le sceau est posé une image après (apresImage) avec un éclat d'or (JEU.anim.eclat, 6) ; fenêtres de halte
par-dessus la route assombrie (opacité 0,35). Brume : les ellipses de repli seulement si lieu-brume manque, voile en
dégradé horizontal 0 → 0,42 → 0,42 → 0 sur toute la bande.
— ligne de coupe —
**B1.4 Pion de compagnie.** Petit étendard au lys (ou le cavalier rendu, image 0) sur la halte courante ; au retour, il
suit le chemin pris en 600 ms, le trait d'or se dore derrière lui, le sceau tombe, puis les halos s'allument l'un
après l'autre (200 ms, 60 ms d'écart).
**B1.5 Cartes de faveur en éventail.** Retournement décalé de 80 ms ; carte choisie qui grandit (1,06) et brille 200 ms,
les deux autres qui s'effacent vers le bas.
- Fichiers : interface.js (afficher, modale, redessiner), ecran-expedition.js, jeu.css.
- Images : aucune neuve (sceau-pose existe ; pion : unite-cavaliers-france image 0, ou un petit rendu
  expedition_commun.py, 5 s).
- Réglages : .sans-anim et prefers-reduced-motion coupent tout (les écrans sautent, le pion est posé, les halos sont
  allumés) ; le voile de brume reste (image fixe).
- Acceptation : 0 image « vide » (cuir sans parchemin) dans les séquences de transition de capturer.js, pc et
  tablette ; sur seq-36 refaite, au moins 3 images où le sceau descend ; temps de construction des écrans à 4 × pas
  plus de 10 % au-dessus du tableau 2.2 de l'audit des écrans.

### B2. Réponses et conseil (agent B2)

**B2.1 Bonne réponse qui pèse.** poserQuestion relève le rectangle du bouton choisi ; une image après, un sceau de cire
rendu (sceau-reussie.png, 64 px, 350 ms) frappe la réponse choisie ; pièces d'or qui en jaillissent et filent vers le
médaillon (gain() part de ce point, pièce de 1,6 rem, 6 éclats). La question suivante arrive en même temps, dessous.
**B2.2 Mauvaise réponse lisible.** Hors bataille : mode « réponse montrée » : la question reste, boutons désactivés,
réponse choisie qui rougit et tremble (secousse existante, 300 ms), bonne réponse en vert-or avec un petit sceau ; le
panneau d'explication se déplie dessous, en parchemin à filet brique et lettrine rouge, à la place de la boîte rose.
En bataille : remplacement actuel, avec ta réponse barrée de rouge au-dessus de la bonne réponse (décision 2.1.4).
**B2.3 Sceau du conseil à sa place.** ui.tampon prend une position ; « Sage décision » se pose là où la carte est partie
(72 % de la largeur), en cire rendue avec le mot gravé, plus jamais sur le texte de la carte suivante.
— ligne de coupe —
**B2.4 Seconde chance et bilan.** La carte qui revient arrive de dessous (translateY 30 px), la pastille s'imprime
200 ms après ; bilan d'un événement : score qui compte (0 → 2 en 400 ms), sceau d'or si tout est juste.
**B2.5 Vraies feuilles.** Genre « feuilles » d'anim.js dessiné en courbes (quadraticCurveTo) qui tournent, au lieu de
rectangles.
- Fichiers : interface.js (poserQuestion, panneauErreur, tampon), anim.js, conseil.js, jeu.css.
- Images : aucune neuve (sceau-reussie.png existe déjà dans les images des expéditions).
- Réglages : Animations pour la secousse, les sceaux, les pièces, la cascade ; la mise en page de la réponse montrée
  reste sans animations.
- Acceptation : Event Timing de la touche à la question suivante peinte inchangé (moins de 100 ms, 1366 × 768,
  1920 × 1080 et tablette) ; JEU.mesure inchangé ; perf.js : « deux sceaux affichés l'un sur l'autre » reste en
  échec si cela arrive ; panneau d'erreur d'une association : bonne réponse écrite une fois (contrôle existant) ; sur
  seq-19 refaite, aucune image où le sceau recouvre le texte de la carte suivante.

### B3. Carte de campagne vivante et conquête (agent B3)

**B3.1 Ambiance de la carte, sans image neuve.** Fumée aux cheminées du domaine et des bourgs pris (trois cercles du
domaine, plus clairs, transform et opacity) ; eau qui scintille (deux traits en pointillés animés, stroke-dashoffset,
relevés une fois sur fond-campagne.jpg) ; nappes de brume qui dérivent de ± 6 px en 14 s, aller-retour ; vol de cinq
oiseaux toutes les 30 s (le groupe .oiseaux du domaine) ; boucles arrêtées quand l'écran n'est plus affiché.
**B3.2 Cérémonie de conquête.** c.derniereConquete (champ facultatif) ; à l'arrivée sur la carte après une victoire,
1,2 s : la bannière adverse tombe (rotation 70°, 400 ms), le bourg adverse se fond dans celui de France (deux images
superposées, 500 ms), anneau d'or qui s'élargit, brume du lieu suivant qui se lève (600 ms), éclat d'or, son « sceau »,
puis une ligne dans la chronique. Une seule fois.
**B3.3 Bannières qui flottent.** Une image par bourg tenu, posée à son point « hampe », un seul setInterval de 150 ms qui
change l'image des onze bannières (dans un svg imbriqué dont on décale le viewBox : pas d'image recréée) ; arrêté hors
écran ou sans ambiance. Dépend des rendus A1 n° 7 et 8.
— ligne de coupe —
**B3.4 Missive et événement du jour.** La lettre se déplie (rotateX −10° → 0, 220 ms), le sceau saute (1,4 → 1) ;
cachet « Aujourd'hui » frappé une fois par jour sur la carte de l'événement, lueur brique qui respire (opacité d'un
pseudo-élément), ruban sous le titre de la carte de campagne qui fait défiler jusqu'à l'événement.
**B3.5 Lumière du jour.** Teinte posée une fois à l'ouverture selon l'heure (aube, jour, soir), multiply, opacité 0,12
à 0,2. Sans animation.
- Fichiers : ecran-campagne.js, jeu.css (section campagne).
- Images : drapeau-‹camp› (6 images) et lieu-* sans bannière (A1) ; rien d'autre.
- Réglages : fumées, eau, brume, oiseaux, bannières : ambiance() ; cérémonie et missive : actif() (sans animations,
  affichage direct) ; lumière du jour : aucun (fixe) ; cachet et ruban visibles sans animations.
- Acceptation : mesurer.js, carte immobile 2,5 s au ralenti 4 × en 1340 × 800 : médiane 16,7 ms, 95 % sous 34 ms,
  aucune tâche de plus de 50 ms ; ensemble de l'ambiance sous 2 ms par image ; perf.js : noms de la carte qui ne se
  touchent pas (contrôle existant), carte entière à 1366 × 768 (existant), tribut hors de la carte (existant).

## 5. Lot C « Finitions et performance » (1 jour, 2 agents)

But : que la tablette tienne 60 images par seconde en grosse mêlée, et sinon qu'elle allège d'elle-même, sans que
l'élève voie autre chose qu'un champ un peu plus calme.

### C1. Mesures et garde-fous (agent C1, commence le jour 1)

- perf.js, nouvelles mesures (détail en 7) : grosse mêlée avec effets, ralenti 4 × en 1340 × 800, écrans au ralenti
  4 ×, propriétés animées, cuir nu, issue identique sous quatre réglages, Sang coupé et Animations coupées.
- Outil avant-après : atelier/captures/audit-graphismes/avant-apres.py, qui pose côte à côte la planche d'origine
  (planches/gros-*.png, loupe2-*.png) et la même séquence refaite après le lot (même horloge truquée, mêmes temps),
  une ligne par image.
- capturer-bataille-2.js : ajouter une séquence h-sans-sang (absente de l'audit) et une séquence en temps réel par
  capture du compositeur pour juger les animations de feuille de style (secousse, or qui roule), que l'horloge
  truquée ne pilote pas.
- Fichiers : atelier/outils/perf.js, tests.js, atelier/captures/audit-graphismes/.

### C2. Régulateur, paliers et finitions (agent C2, jour 3)

**C2.1 Accueil gratuit et menu visible.** Poussières : même dégradé sur ::after deux fois plus haut, animé en
translateY sur 26 s (peint une fois) ; jouer.focus({ preventScroll: true }) sur PC (la passe tablette ne donne déjà
plus le focus au doigt). Acceptation : accueil au ralenti 4 × de 133 à 16,7 ms par image, et de 33 à 16,7 ms sur PC ;
menu visible à l'ouverture en 1366 × 768.
**C2.2 Domaine sans flou animé.** Nuages en ellipses à dégradé radial ou image pré-floutée, sans filter SVG ; halo du
quartier en transform et opacity au lieu de stroke-width. Acceptation : domaine au ralenti 4 × sans image lente (0 %
au lieu de 15 %), et la tâche de 448 ms disparaît.
**C2.3 Réglage Ambiance.** Case « Ambiance (nuages, fumées, oiseaux, drapeaux) » sous Animations ; reglages.ambiance,
absent = actif ; JEU.anim.ambiance() = actif() et ambiance et pas de coupure du régulateur ; export puis import
identiques (contrôle existant étendu).
**C2.4 Régulateur de la bataille.** Moyenne glissante de la boucle sur 1 s. Au-dessus de 4 ms, un cran de moins ; sous
3 ms, un cran de plus ; au plus un changement toutes les 2 s. Crans, dans l'ordre : 1) traînées ; 2) volées (une
flèche par tir) ; 3) mottes et étincelles divisées par deux, poussières légères ; 4) netteté de la toile plafonnée à
1,5 puis 1,25 (redessin de la couche de sol) ; 5) ombres des figurines du dernier rang. Le niveau est dans
JEU.bataille.rendu.niveau. Jamais : moins de figurines (elles disent la force d'une troupe), ni gestes, chutes ou tirs
des tours coupés (ce sont des retours, ils coûtent 0 ms).
**C2.5 Régulateur des écrans.** Sur un écran à ambiance, si l'écart médian entre images dépasse 20 ms pendant 2 s,
ambiance() devient faux pour la séance ; rien n'est écrit dans la sauvegarde.
**C2.6 Toiles hors écran et pool.** Vérifier que toute vue neuve (bandes de coup, de chute, de tours, drapeaux) passe
par vueFigure ou une petite toile gardée ; pool de particules sans allocation par image (relevé du tas sur 6 s de
mêlée : pas de croissance) ; fumées et éclats en vues gardées.
**C2.7 Finitions qui ne coûtent rien.** Halo d'or de focus (:focus-visible en box-shadow arrondi) au lieu du rectangle ;
onde dorée au toucher depuis le point d'appui (::after, transform et opacity), qui remplace le survol absent sur la
tablette ; pulsations en box-shadow (alerte, halo du domaine) remplacées par l'opacité d'un pseudo-élément.
- Fichiers : anim.js, interface.js (réglages, onde), bataille.js (crochets du régulateur, netteté), domaine.js,
  jeu.css.
- Images : aucune.
- Réglages : le régulateur et Ambiance n'agissent que sur l'ambiance et les effets ; Animations coupées coupe tout
  comme aujourd'hui ; Sang coupé inchangé.
- Acceptation : critères 7.1 à 7.3 au ralenti 4 ×, régulateur actif ; puis la vérification de Romain sur la tablette
  (section 9).

### Si la tablette reste trop lente après le lot C

Dans l'ordre, chacun mesuré : 1) palier « Ambiance » coupé par défaut quand l'écran est tactile (hover: none) ; 2)
netteté de la toile plafonnée à 1,25 sur écran tactile ; 3) couche de sol à demi-résolution (les traces sont floues
de toute façon) ; 4) une seule passe d'effacement toutes les deux images ; 5) fumées des places fortes à 3 bouffées par
foyer au lieu de 7, ombres de nuages coupées pendant la vague. Ne jamais toucher à la cadence du moteur.

## 6. Réserve (après les trois lots, dans cet ordre)

1. Plan du domaine enluminé (parcelles, fondations, bâtiments rendus, seigneur en bande de cavalier) : 2 à 3 jours,
   rendus places.py et decors.py. C'est l'écran qui sort encore du style.
2. Marche à 8 images et trois sens (profil, dos, face) : 44 + 176 rendus, environ 13 min de processeur ; à faire dans
   la même session Blender qu'une reprise des bandes de coup et de chute.
3. Drapeaux animés des tours et des places fortes (tours et places rendues sans leur flamme, points d'accroche,
   bandes drapeau-‹camp› du lot A) : seulement si la mesure finale laisse 1 ms de marge au ralenti 4 ×.
4. Listes, Codex, réglages et boutique habillés (signets, tomes, sceaux pour les cases, cascade d'entrée).
5. Corbeaux au-dessus des morts, reflets sur la rivière, brouillard en nappes, éclaboussures de pluie, roues de la tour
   de siège, braises qui palpitent : le régulateur les coupe en premier.
6. Chargement avec blason et barre qui avance.

## 7. Contrôles d'acceptation (perf.js et outils)

Chaque contrôle est une ligne « ÉCHEC » de perf.js ou de tests.js, sauf la revue visuelle. Toutes les mesures de
boucle sont la médiane de trois passages (le maximum d'une seule passe est trop bruité).

**7.1 Bataille, processeur normal** (grosse mêlée existante, et nouvelle « grosse mêlée avec effets » : 4 tours dont
archers niveau 3, baliste, trébuchet, palissade ; pierres, volées, brèches) :
- 1366 × 768 : boucle médiane sous 4 ms (objectif : rester à 2,1 ms ou moins, la couche de sol payant les effets) ;
  écart médian entre images 16,7 ms (seuil 17,5), au plus 2 % au-delà de 34 ms ; boucle 95 % sous 8 ms (existant).
- 1920 × 1080 : boucle max sous 7,1 ms (max d'aujourd'hui, base-boucle.json), boucle 95 % sous 4,1 ms (3,7 + 10 %),
  écart médian 16,7 ms (seuil 17,5).
- Plafonds jamais dépassés (compteurs de JEU.bataille.rendu) : 8 coups étincelants, 24 traînées, 60 particules,
  10 lueurs, 1 secousse.

**7.2 Bataille, ralenti 4 × en 1340 × 800** (CDP Emulation.setCPUThrottlingRate 4). À relever une fois sur la
tablette : window.innerWidth, innerHeight et devicePixelRatio. Si la fenêtre du navigateur n'y fait pas 1340 × 800
(densité supérieure à 1), mesurer aussi à sa vraie taille, avec le même facteur de densité :
- fin du lot A : boucle médiane pas au-dessus de la base (7,2 ms) avec tous les effets ;
- fin du lot C, régulateur actif : boucle médiane sous 4 ms, écart médian entre images sous 17,5 ms, au plus 5 % au-delà
  de 34 ms ; relever le cran atteint par le régulateur ;
- Event Timing pendant la vague, de la touche à la question suivante peinte : moins de 100 ms.

**7.3 Écrans** (mesurer.js de l'audit, versé dans perf.js) :
- au ralenti 4 × en 1340 × 800, écran immobile 2,5 s : médiane 16,7 ms, 95 % sous 34 ms, aucune tâche de plus de 50 ms,
  pour accueil, domaine, campagne, route, conseil ;
- 0 image « cuir nu » dans toutes les séquences de transition (passe automatique de capturer.js) ;
- propriétés animées : document.getAnimations() sur chaque écran après 1 s ; toute animation infinie n'anime que
  transform ou opacity (exception écrite : stroke-dashoffset des deux traits d'eau) ;
- Event Timing (existant, 1366 × 768, 1920 × 1080, tablette au doigt) : moins de 100 ms ; plus une passe au ralenti 4 ×
  sur un événement et sur la porte d'une expédition.

**7.4 Le moteur n'a pas bougé.**
- git diff vide sur jeu/js/bataille-moteur.js depuis le commit de départ des lots ;
- même partie, même graine, quatre réglages (Animations oui ou non × Sang oui ou non), horloge truquée : même issue en
  fin de vague (solidité des deux places, troupes vivantes, or). Possible grâce à la règle « pas de Math.random dans le
  dessin neuf » ;
- tests.js : contrôles de la mêlée (bataillons ennemis l'un dans l'autre 35 % au plus), des bataillons, des corps ;
  simuler-bataille.js inchangé.

**7.5 Réglages respectés.**
- Sang coupé : compteurs gouttes, flaques, taches et corps posés à 0 pendant une vague entière ; séquence h-sans-sang
  regardée.
- Animations coupées : particules, traînées, secousses à 0 ; tours sur leur image 0 ; aucune classe de secousse posée ;
  document.getAnimations() vide hors état du jeu.
- Ambiance coupée : aucune boucle d'ambiance (setInterval des bannières arrêté, animations de brume absentes).

## 8. Risques et revue

| Risque | Parade | Qui vérifie, comment |
|---|---|---|
| Régression du moteur de bataille (aucune admise) | moteur intouché ; champs de dessin seulement ; pas de Math.random neuf | 7.4 à chaque lot ; le relecteur refuse tout diff sur bataille-moteur.js |
| Tablette trop lente | couche de sol d'abord ; plafonds ; régulateur ; mesures 7.2 à chaque lot | C1 lance perf.js à la fin de chaque lot ; vérification de Romain sur la Galaxy Tab A9 (le ralenti 4 × n'est qu'une approche) |
| Question suivante retardée | tout part après l'image | Event Timing 7.2 et 7.3 |
| Dérive de style (dessin animé, néon, contours d'autocollant) | étincelles orangées et petites, pas d'étoile ; cire rendue, pas de pictogramme plat ; même lumière nord-ouest pour toute image rendue ; lissage d'image toujours actif (jamais de pixel art) | planches avant-après ; contrôles automatiques des rendus ; liste ci-dessous |
| Sang hors de la règle | pas de démembrement ; même sang pour tous les camps ; Sang coupé respecté | planche des poses de chute ; 7.5 |
| Conflits entre agents et avec la passe tablette | départ après sa livraison ; tableau 2.3 ; nouveaux fichiers ; un intégrateur par lot | git : un commit par jalon, fusion relue |
| Fichiers oubliés par la version installable ou l'application | generer-sw.js relancé ; liste de l'application contrôlée | tests.js (sw.js), contrôle de l'application Android |
| Mémoire de la tablette (4 Go) | couche de sol à la netteté de la toile (au plus 2000 × 1320, 10 Mo) ; bandes petites (environ 6 Mo décodés pour toutes les tours) | relevé du tas dans perf.js |
| Bandes d'effacement visibles dans la couche de sol | opacité faible (0,08), bandes fines ; repli : effacement par décalque | revue des séquences a-efface et a-chute refaites |
| Éclairs trop fréquents | au plus un par seconde, opacité 0,15 | revue en temps réel |

**Méthode du relecteur.** Pour chaque lot, avant et après côte à côte, mêmes temps de jeu :
- champ (avant-apres.py) : h-marche (pas), h-melee et hd-melee (gestes, étincelles, poussière sous les pieds),
  h-chute (chute en trois images, corps lisible), a-efface (pont lisible, traces qui s'effacent), ht-trebuchet (verge),
  ht-archers (volée, taille des traits), ht-impact (anneau, mottes, recul, cratère), h-breche (pierres, plus de
  fantômes), hv-victoire (effondrement, bannière), construction (montée), hud-juste et hud-faux (or qui vole), h-sans-anim
  et h-sans-sang (réglages) ;
- écrans (capturer.js, pc et tablette) : seq-02 (transition), seq-13 et seq-14 (réponses), seq-19 (sceau du conseil),
  seq-22 (feuilles), seq-36 et seq-39 (sceau et carte choisie sur la route), seq-09 (conquête), seq-05 (carte vivante),
  01-accueil (menu visible) ;
- liste de style : rien de blanc pur qui clignote ; rien de plus saturé que les bannières ; pas de contour noir neuf ;
  les sceaux sont de la cire rendue ; la carte reste plus calme que la bataille ; tout ce qui bouge sans raison de jeu
  se coupe avec Ambiance.
Un lot n'est accepté que si les contrôles 7 passent et si la planche avant-après montre chaque gain annoncé.

## 9. Pour Romain

Ce qui va changer à l'écran, en trois temps.

**Dans les batailles (lot A).** Les soldats lèvent l'épée et frappent au lieu de se pousser. Quand ils tombent, ils
plient les genoux et tombent vraiment ; les corps et le sang restent quelques secondes sur le champ, puis s'effacent,
comme dans Total War. Le trébuchet bascule son bras pour lancer sa pierre, la baliste se détend, les archers tirent
par volées de flèches plus fines. Une pierre qui tombe laisse un cratère et bouscule les soldats autour. Quand on
frappe un mur, des pierres tombent et l'écran tremble un peu. À la victoire, le château s'effondre dans un nuage de
poussière et la bannière de France est plantée sur la ruine. Le compteur d'or roule quand tu gagnes de l'or.

**Hors bataille (lot B).** On ne voit plus de fond vide entre deux écrans. Une bonne réponse est frappée d'un sceau de
cire et des pièces filent vers le compteur. Une erreur montre en rouge la réponse choisie et en or la bonne, et
l'explication se déplie juste en dessous. Sur la carte, la fumée monte des villages, la brume bouge doucement, l'eau
scintille, des oiseaux passent, les bannières flottent. Prendre une province donne une petite cérémonie : la bannière
ennemie tombe et le bourg passe aux couleurs de France. Dans les expéditions, on voit le sceau tomber sur chaque halte.

**Sur la tablette (lot C).** L'écran d'accueil ne rame plus. Une nouvelle case « Ambiance » dans les Réglages coupe
les décorations qui bougent (nuages, fumées, oiseaux, drapeaux) sans couper le reste. Si la tablette peine, le jeu
allège tout seul les effets les moins utiles. « Animations » coupe toujours tout, et « Sang » enlève toujours le sang.
Rien ne change aux règles du jeu ni aux questions.

À la fin du lot C, je te demanderai cinq essais sur la tablette :
1. Ouvrir le jeu : l'accueil s'affiche avec le menu visible, sans saccade.
2. Lancer une bataille et envoyer beaucoup de troupes : le combat reste fluide, les soldats frappent et tombent.
3. Poser une tour d'archers pendant la préparation, puis lancer la vague : la tour sort de terre dans un peu de
   poussière, puis ses archers tirent par volées de flèches fines.
4. Répondre faux à une question d'un événement : ta réponse en rouge, la bonne en or, l'explication dessous.
5. Décocher « Sang » dans les Réglages, puis relancer une bataille : plus aucune goutte ni flaque, les soldats tombés
   s'effacent.
