# Graphismes des menus (31/10/2026)

Demande de Romain du 31/10/2026 : « Améliore les graphismes et les animations », puis « Les graphismes des menus
aussi ». Ce document conçoit l'habillage des menus : bandeau, barre de menu, accueil, Cours, Codex, arsenal,
réglages, boutons, cases, focus, toucher, chargement. Il prolonge le plan graphismes-animations-plan.md (réserve,
point 4 « listes, Codex, réglages et boutique habillés », et point 6 « chargement avec blason ») et l'audit
audit-graphismes-ecrans.md (3.1, 3.3, 3.8, 3.9, 3.10, 3.13, 3.15, section 4). Il le range dans le lot B comme un
quatrième agent, **B4 « menus habillés »** (section 8).

Rien n'a été modifié dans jeu/. Ce qui a été fait pour l'écrire :
- un inventaire en captures, 1366 × 768 à la souris et 1340 × 800 au doigt (91 images, regardées) ;
- des essais de rendu Blender, petits et peu nombreux (une bossette de laiton, six sceaux de cire, deux séries de
  peaux de bouton, un coin doré, un bord de sangle), dans le dossier d'essai, puis copiés dans
  atelier/captures/menus/rendus-essai/ ;
- des maquettes statiques faites du **vrai balisage du jeu** (l'écran rendu par le jeu, scripts retirés) avec la
  feuille proposée ; 22 captures maquette-*.png ;
- des mesures au ralenti 4 × de ce que la feuille coûte à l'ouverture des écrans, et de son contraste.

Sommaire : 1. Inventaire. 2. Direction. 3. Images à rendre. 4. Feuille de style. 5. Points d'accroche JavaScript.
6. Animations. 7. Contrôles d'acceptation. 8. B4 dans le lot B. 9. Pour Romain. 10. Fichiers.

## 1. Inventaire

Captures : atelier/captures/menus/inventaire/pc/ et …/tablette/ (même nom des deux côtés ; le survol et le focus
clavier n'existent que sur pc). Outil : atelier/captures/menus/capturer-menus.js.

| Élément | Ce que je vois | Défaut | Captures |
|---|---|---|---|
| Chargement | Le cuir, le bandeau sans médaillons, « Ouverture des archives… » seul au milieu | Rien n'annonce le domaine, rien n'avance | 00-chargement |
| Bandeau | Blason 30 px, nom en Cinzel or, six médaillons émaillés, deux boutons ronds dorés | Bon. Le filet d'or du bas double celui du menu | 02-bandeau-menu, 02b, 02c, 02d (musique coupée) |
| Barre de menu | Planche de bois sombre, six libellés Cinzel 14,4 px avec icône, trait d'or sous l'actif | Lisible mais plate ; l'actif se voit à peine ; survol : 1 px de montée | 02-bandeau-menu, 03-menu-survol |
| Menu, focus | Rectangle or autour du bouton | Air de formulaire | pc/03c-menu-focus |
| Menu, appui au doigt | Rien ne change | Aucun retour sous le doigt | tablette/03b-menu-appui |
| Accueil | Tapisserie, cartouche du titre, trois cartouches, grand « Jouer » doré | En 1366 × 768, « Jouer » est **sous la ligne de flottaison** (y ≈ 790) ; « 1er » se lit « Ier » en Cinzel | 01-accueil, 01b, 04-accueil-cartouches, 04f |
| Bouton « Jouer » | Dégradé d'or, reflet toutes les 5 s | Repos et appui presque pareils | 04b, 04c, 04d (appui), 04e (focus) |
| Cartes de la campagne | Parchemin, illustration, médaillon | Appui : 2 px, caché par le doigt | 05-campagne-cartes, 05b, 05c |
| Arsenal (boutique) | Lignes à tirets, icône nue, ◆◇, boutons « Débloquer · 10 » | Tableau de boutique web ; le reflet passe sur cinq boutons à la fois | 06-arsenal, 06b, 06c |
| Confirmation, toast | Boutons principal et secondaire côte à côte ; toast en cuir | Bon | 07-confirmation, 07b-toast |
| Cours, onglets | Onglets rectangulaires à liseré de couleur, sur deux rangs (9 onglets) | Air de tableur ; appui invisible au doigt | 08c, 08d (survol), 08e (appui), 08f (focus) |
| Cours, liste | Blocs « Semaine N », lignes à pointillés, liseré gauche par état | Pointillés web ; « Dans la brume » en flou CSS (un filter par ligne, 40 lignes) ; étiquettes d'état à 3,6 à 4,2 : 1 sur le parchemin sombre | 08-cours, 08b (page entière, réduite de moitié), 08g, 08h, 08i-ligne-* |
| Codex | Bandeau de tapisserie, barres d'accordéon à liseré, vignettes à bord supérieur coloré | Accordéons de site ; le coin doré de la feuille est caché par la tapisserie | 09-codex, 09b, 09c (ouvert), 09d, 09e, 09f |
| Fiche | Lettrine, « À retenir », mots clés | Bonne : on n'y touche pas | 09g-fiche |
| Galerie des souverains | Médaillons, fiches à filet, « à venir » en tirets | Bonne ; son en-tête est un accordéon comme les autres | 09h-codex-galerie |
| Réglages | Champ texte, boutons, cases natives, dates natives | Formulaire ; sur PC, la case native fait 13 px | 10-reglages, 10b, 10c, 10d, 10e, 10f, 10g, 10h (focus) |
| Curseurs | Aucun dans le jeu aujourd'hui | — (style prêt, voir 4) | — |
| Infobulles | Attributs title natifs seulement | — (rien à habiller) | — |

Trois constats de plus :
1. **La tablette ne voit aucun appui** sur le menu, les onglets et les boutons ronds (tablette/03b, 08e). Les cartes
   descendent de 2 px sous le doigt (05c). C'est le défaut le plus gênant des menus au toucher.
2. **Le reflet doré tourne sur tous les boutons principaux** : cinq à la fois dans l'arsenal. Il fait concurrence
   au texte. Il doit rester sur « Jouer » seul, et passer sous le réglage Ambiance.
3. **Outil de capture : une capture « page entière » coupe l'émulation du toucher** dans Chromium (hover et
   pointer reviennent à la souris ; vérifié le 31/10/2026). Il faut rallumer
   `Emulation.setTouchEmulationEnabled` puis `Emulation.setEmulatedMedia` après chaque capture entière (fait dans
   capturer-menus.js). **Pour C1** : capturer.js de l'audit fait une capture entière dès « 01-accueil-entiere » ;
   ses captures tablette suivantes ont été prises sans les règles tactiles (cases de 13 px au lieu de 26, etc.).
   À corriger avant les planches avant-après du lot B.

## 2. Direction (une page)

**Le harnois et le livre.** Le cadre du jeu est du cuir et du laiton, comme la sellerie d'un seigneur : le bandeau,
la sangle du menu, les clous, les boutons ronds. Le contenu est un livre : parchemin, signets de soie, tomes reliés,
sceaux de cire. Ce que l'on touche est un cartouche doré. Les ornements encadrent, ils ne passent jamais devant le
texte.

Code des matières, tenu partout : **or** = ce qui agit ou ce qui est actif ; **rubrique** (#8c2f39) = le repère (onglet
actif, « cette semaine », case cochée) ; **plomb** = indisponible ; **cire** = un état ; **une teinte par matière**
(ruban, tome), jamais une autre couleur vive.

- **Bandeau.** Inchangé dans sa forme. Le filet d'or du bas devient sombre : le filet doré est porté par la sangle.
  Les boutons musique et bruitages deviennent des bossettes de laiton rendues (même hauteur, 40 px, 44 px au doigt).
- **Barre de menu : une sangle de cuir gaufré.** Cuir chaud, filet doré en relief et couture en haut et en bas
  (bord rendu en border-image), clous de laiton entre les onglets. Même hauteur qu'aujourd'hui, au pixel près.
- **Onglet actif : un fanion rubrique** à queue d'aronde, frangé d'or, losange d'or au centre, qui pend sous la sangle
  et mord de 6 px sur le haut de la feuille. Il tombe et se balance une fois (240 ms) quand on change d'écran. Le
  libellé actif s'éclaire, une lueur d'or sous l'icône. (Le sceau de cire a été écarté pour l'actif : on le réserve aux
  états ; le fanion se lit de loin et appartient à la carte de campagne.)
- **Boutons : des cartouches dorés à coins rentrants.** Peau rendue (moulure d'or, face bombée) posée en
  border-image, sans changer la boîte du bouton. Principal : face d'or. Secondaire : face de parchemin, même moulure.
  Appuyé : face enfoncée, plus sombre, 1 px plus bas. Désactivé : plomb mat, texte encre (5,9 : 1), sans reflet.
- **Accueil.** « Jouer » posé sur la tapisserie, en face du titre, aligné sur son bas : visible sans défiler en
  1366 × 768 et en 1340 × 800 (maquette-accueil-*.png). Cartouches à filet d'or, titres rubriqués avec un trait d'or.
- **Cours : des signets.** Chaque onglet est un signet de parchemin cousu d'un ruban de soie à la teinte de la
  matière (queue d'aronde) ; l'actif est blanc, cerné d'encre et d'or, son ruban plus long. Sous les signets, la
  tranche dorée du livre. Les semaines sont des titres rubriqués à trait d'or. Chaque ligne porte son état en sceau de
  cire de 22 px à gauche : vert au lys (acquis ; plus petit et pâli pour « présumé »), brique (à revoir), or (en cours),
  cercle gravé vide (dans la brume, contenu à venir) ; losange d'or pour révisions et devoirs. Plus de pointillés : un
  filet d'encre très clair, comme la réglure d'un manuscrit. La brume : le titre se lit en italique gris-brun sous une
  nappe claire, sans flou.
- **Codex : des tomes reliés.** Chaque matière est le dos d'un tome couché : cuir grainé teinté de la matière, deux
  nerfs à gauche, deux filets dorés, titre doré, nombre de fiches en pied, fermoir en sceau d'or à droite. Ouvert, le
  tome laisse voir sa page (parchemin, ombre de la reliure à gauche), les vignettes sont des fiches où pend un petit
  ruban de la matière ; les bonus portent un sceau d'or. La galerie des souverains est un **rouleau** : parchemin bombé
  entre deux bâtons tournés.
- **Arsenal.** Chaque arme dans un médaillon de parchemin cerclé d'or (gris si verrouillée), losanges ◆◇ en or cerné
  d'encre, boutons en cartouches (or pour débloquer, parchemin pour améliorer, plomb si trop cher). Plus de tirets.
- **Réglages.** Champs en cartouche de parchemin à filet d'or ; dates en Cinzel avec une petite icône de calendrier
  dessinée (le sélecteur natif reste, pratique au doigt). **Cases : vide, un cercle gravé dans le parchemin ;
  cochée, un sceau de cire rubrique au lys d'or**, qui frappe (180 ms) quand on coche. Les boutons radio du
  signalement prennent le même habit. Curseur (aucun aujourd'hui) : rail de laiton creusé, rempli d'or jusqu'à la
  bossette.
- **Focus clavier : un halo héraldique** (filet clair, filet d'encre, filet d'or, lueur d'or), le `--filet` du jeu mis
  en lumière ; sur la sangle sombre, un filet d'or arrondi et une lueur sous le libellé. Jamais de rectangle bleu.
- **Toucher : un anneau d'or** s'ouvre sous le doigt (340 ms) sur tout ce qui se touche. Il remplace le survol absent,
  et se voit au-delà du doigt (80 px de diamètre).
- **Chargement.** Le blason du domaine (92 px), son nom en Cinzel, un rail de laiton à bossettes qui se remplit d'or,
  « Ouverture des archives · 24 / 38 ».

Ce qu'on refuse : néon, contour noir d'autocollant, pictogramme plat à la place d'une cire ou d'un métal rendus,
animation qui tourne sans raison de jeu, ornement plus contrasté que le texte qu'il entoure, blanc pur qui clignote.

Maquettes (vrai balisage, feuille proposée, essais de rendu) : atelier/captures/menus/maquette-accueil-pc.png,
-tablette.png ; maquette-cours-* (et -suite) ; maquette-codex-* (et -haut) ; maquette-reglages-* (et -suite) ;
maquette-arsenal-* ; maquette-chargement-* ; **maquette-etats-*-entiere.png** (planche de tous les états :
boutons repos, appuyé, focus, désactivé ; cases vide, cochée, focus ; champs ; curseur ; signets ; lignes d'état ;
tomes ; rouleau ; anneau ; rail).

## 3. Images à rendre (Blender)

Peu d'images, réutilisées partout. Toutes vues de dessus, soleil commun du nord-ouest (commun.py), au double de la
taille logique (commun.ECHELLE), fond transparent, ombre portée cuite dans l'image (en bas à droite), 2 px
transparents au bord. Dossier : **jeu/assets/images/menus/** (neuf). Budget du dossier : **200 Ko** (estimé 140).

| # | Fichier | Sert à | Taille logique (fichier) | Poids visé | Essai |
|---|---|---|---|---|---|
| 1 | bossette-laiton.png | clous du menu (12 px), boutons ronds (40 à 44 px), bouton du curseur (28 px), bouts du rail de chargement (22 px) | 40 × 40 (80 × 80) | 8 Ko | fait, bon (collerette assombrie) |
| 2 | sangle-bord.png | bord haut et bas de la sangle : filet doré, couture, sillon (border-image, tranches de 10 unités, milieu transparent ; période de 8 unités) | 64 × 40 (128 × 80) | 8 Ko | fait, bon (couture un peu claire : #b89a62) |
| 3 | fanion.png | onglet actif ; « cette semaine » (14 px) | 30 × 34 (60 × 68) | 8 Ko | à faire (dessin SVG provisoire dans la maquette) |
| 4 | cartouche-or.png, -or-appui, -parchemin, -parchemin-appui, -plomb | peaux des boutons (border-image … fill, tranches de 12 unités) | 48 × 32 (96 × 64) chacune | 8 Ko chacune | faites (version 2, coins rentrants) ; face de parchemin trop grise, arêtes des coins trop claires à 12 px |
| 5 | coin-dore.png | coins de la feuille (.ecran), de la fenêtre, des cartouches (22 px) | 46 × 46 (92 × 92) | 8 Ko | fait, trop simple : ajouter un fleuron |
| 6 | sceau-case, sceau-acquis, sceau-revoir, sceau-ouvert, sceau-or, sceau-plomb | case cochée (rubrique, lys d'or) ; acquis (vert, lys) ; à revoir (brique, plume) ; en cours (or, sablier) ; bonus et fermoir des tomes (or, lys) ; verrouillé (plomb, écu brisé) | 28 × 28 (56 × 56) chacun | 6 Ko chacun | case, acquis, à revoir, or : faits, bons |
| 7 | (facultatif) fermoir-‹matière› ×8 | fermoir des tomes : sceau d'or au symbole de la matière (7 matières, couronne pour la galerie) | 28 × 28 (56 × 56) | 6 Ko chacun | essai en teintes de matière (histoire, anglais) : sur un tome de même teinte, il disparaît ; d'où l'or |
| 8 | embout-rouleau.png | bâtons du rouleau de la galerie (miroir en CSS pour le côté droit) | 20 × 40 (40 × 80) | 5 Ko | à faire (dégradés CSS dans la maquette) |

Essais regardés : atelier/captures/menus/rendus-essai/ (vue-bossette.png, vue-peaux2.png, vue-sceaux-cadre.png,
vue-sangle-coin.png, vue-peaux.png pour la version 1 à pans coupés, écartée : trop « bouton de logiciel »). Temps :
3 à 6 s par image sur 2 fils ; toute la famille en moins de 2 minutes. Script d'essai :
atelier/captures/menus/outils/essai-rendu-menus.py (n'écrit que dans rendus-essai/).

**Script à créer : atelier/outils/rendu-3d/menus.py**, sur le modèle des scripts des expéditions :
- importe commun.py (lumière, caméra de dessus, réglages Cycles, contrôles) et expedition_commun.py (mat_or,
  mat_cire, sceau_cire, plaque_icone, mat_cuir, mat_parchemin, tore, disque) ; reprend de l'essai `scene_ui`,
  `anneau_rentrant`, `contour_rentrant`, `mat_degrade`, `peau`, `bossette`, `sangle_bord`, `coin` ;
- familles : `laiton` (1), `sangle` (2), `fanion` (3 : étoffe subdivisée découpée en queue d'aronde, onde légère,
  bordure dorée, losange d'or, barreau de laiton ; ombre cuite), `peaux` (4), `coin` (5 : équerre, volute et fleuron
  extrudés d'un chemin SVG propre au jeu), `sceaux` (6, 7 : sceau_cire avec les masques d'icônes du jeu), `rouleau` (8) ;
- options `--dossier` (essai hors de jeu/), `--planche` (planche de contrôle à 1 × et 2 × sur parchemin et sur cuir,
  atelier/captures/planche-menus.png), et le nom d'une famille ;
- contrôles automatiques : bords transparents (commun.controle_bords), blancs brûlés, poids par fichier et budget
  du dossier ; pour les peaux, **milieu uni** (écart de teinte < 2 % dans le rectangle central, sinon l'étirement se
  voit) et tranches de 12 unités qui contiennent tout le cadre ; pour les sceaux, part de la teinte attendue ;
- réglages retenus des essais : face de parchemin #fff1cf → #ead29c (encore trop grise : viser plus chaud), face d'or
  #e9cd7c → #a07c2c, rayon des coins rentrants 5 unités, moulure 3,4 unités, cire rubrique #74202b (la cire rendue
  éclaircit d'un cran), lys en plaque or-clair.
Pas de manifeste : les images ne servent qu'à la feuille de style. Rendus maison sur textures CC0 déjà créditées : une
ligne dans jeu/CREDITS.md (« pièces des menus rendues pour ce jeu, CC0 ») ; relancer atelier/outils/generer-sw.js ;
ajouter les fichiers à la liste embarquée de l'application Android.

## 4. Feuille de style

**Une feuille neuve, jeu/css/menus.css, chargée juste après jeu.css** (une balise dans jeu/index.html). Elle
habille par-dessus jeu.css sans le modifier : B4 reste hors des sections de jeu.css tenues par A3, B1, B2, B3 et C2.
Base prête : atelier/captures/menus/maquettes/menus.css (à reprendre en retirant le bloc « Maquette seulement » et les
sélecteurs `demo-`, et en remplaçant `../rendus-essai/` par `../assets/images/menus/`). Planche de démonstration :
maquettes/etats.html.

Règles de la feuille :
- **Rien ne bouge en place.** Bordures inchangées (2 px sur .bouton) : la peau déborde par `border-image-width`. La
  sangle garde la hauteur du menu (le bord est dessiné par-dessus, la bordure de 3 px est remplacée par 3 px de marge).
  Le bandeau garde sa bordure, assombrie. Contrôle : hauteurs de #bandeau et #menu identiques au pixel, en 1366 × 768,
  1920 × 1080 et 1340 × 800 au doigt.
- **Images en url() directes**, pas dans des propriétés personnalisées partagées avec jeu.css : une url() dans une
  variable se résout depuis la feuille qui l'emploie (constaté sur la maquette).
- Dégradés seulement s'ils sont fixes ; aucune animation infinie ajoutée ; aucun filter sur un élément animé (le
  fanion porte son ombre dans l'image) ; pas de `:has()` (classe `.ouvert` posée par codex.js), pas de `::first-letter`
  répété sur des dizaines de titres, un seul dégradé par ligne de liste, `content-visibility: auto` sur les blocs de
  semaine (leçons des mesures, 7.4).

| Section (commentaire de tête) | Sélecteurs | États |
|---|---|---|
| Menus : bandeau | #bandeau, .bouton-rond, .medaillon | appui (1 px), coupé (existant) |
| Menus : sangle et onglets | #menu, #menu button, #menu button + button::before (clou), #menu button.actif::after (fanion) | repos, survol (pc), appui, focus, actif ; `@keyframes fanion` |
| Menus : feuille et cartouches | .ecran::before/::after (coin doré), .cartouche, .cartouche h3 | — |
| Menus : boutons en cartouches dorés | .bouton, .bouton.principal, .petit, .enorme, .discret, .bouton.principal::after (reflet) | repos, survol (pc), :active, :disabled, :focus-visible ; reflet sur .enorme seul, coupé par body.sans-ambiance |
| Menus : accueil | #ecran-accueil .centre, .bouton.enorme (au-dessus de 720 px de large) | — |
| Menus : signets des cours | .onglets, .onglets::after (tranche), .onglet, .onglet::before (ruban), .onglet.actif | repos, survol, appui, focus, actif |
| Menus : listes des cours | .semaine-bloc, .semaine-bloc h3, .courante h3::before, .ligne-cours, .ligne-cours::before (sceau), .etat-*, .revision, .devoir, .titre-brume, .ligne-devoir | un sceau par état ; couleurs d'étiquette relevées (7.3) |
| Menus : Codex | .codex-matiere, .codex-matiere.ouvert, .codex-entete (+ ::after fermoir), .codex-cours, .grille-fiches, .vignette (+ ::before ruban, .bonus::after sceau), .codex-galerie > .codex-entete (+ bâtons) | repos, survol, appui, focus, ouvert |
| Menus : arsenal | .ligne-arsenal, .ligne-arsenal .td-ic, .verrouille, .etoiles | verrouillé |
| Menus : réglages | input[type=text], input[type=date] (+ ::-webkit-calendar-picker-indicator), input[type=checkbox], input[type=radio], input[type=range] (+ track, thumb) | vide, cochée, :checked:focus (frappe), focus ; règle tactile : cases de 28 px |
| Menus : chargement | .attente, .attente-blason, .attente-titre, .attente-rail (+ ::before/::after bossettes, i), .attente-compte | progression `--p` |
| Menus : onde | .onde | posée par interface.js (5) |
| Menus : cascade | .cascade (liste-cours, codex-matiere, cartouche, ligne-arsenal) | délais par nth-child (30 ms, plafond 150 ms) |

## 5. Points d'accroche JavaScript (le moins possible)

| Fichier | Où | Quoi | Lignes |
|---|---|---|---|
| jeu/index.html | `<head>` ; `<main>` | `<link rel="stylesheet" href="css/menus.css">` après jeu.css ; le `<p class="attente">` devient un bloc (blason, titre, rail, compte) | 2 |
| jeu/js/chargeur.js | chargerCours | second paramètre facultatif `avance(faits, total)`, appelé dans `un()` | 3 |
| jeu/js/demarrage.js | demarrer | blason (`JEU.icones.blason`) et nom posés dans le bloc dès le départ ; `--p` mis à jour par `avance` ; le bloc s'efface en 150 ms (opacité) après `JEU.pret` | 6 |
| jeu/js/interface.js | bloc neuf en fin de fichier « habillage des menus » | l'anneau au toucher : un seul `div.onde` créé au premier appui ; écouteur `pointerdown` en capture, passif, doigt ou stylet seulement, rien si `!JEU.anim.actif()` ; lancé dans `requestAnimationFrame` par l'API Web Animations (`translate(x, y) scale(.25 → 1)`, opacité 1 → 0, 340 ms) : **aucune lecture de mise en page**, rien dans le chemin réponse → question suivante | 12 |
| jeu/js/interface.js | ui.ecrans.cours, ui.ecrans.reglages | première ligne : `s.classList.toggle("cascade", !(arg && arg.surPlace))` ; l'export redessine les réglages avec `{ surPlace: true }` | 3 |
| jeu/js/codex.js | JEU.ui.ecrans.codex, galerie | même ligne de cascade ; classe `ouvert` sur la section dépliée ; les deux bascules redessinent avec `{ surPlace: true }` | 4 |
| jeu/js/domaine.js, ecran-campagne.js | — | **aucune ligne** (les boutons du domaine et de l'arsenal prennent l'habit par la feuille) | 0 |
| atelier/outils/generer-sw.js | — | relancer (feuille et images neuves) | — |

Contrats avec les autres agents :
- **B1** : un écran redessiné sur place reçoit `{ surPlace: true }` en argument (B1 le passe depuis `ui.redessiner`) ;
  B4 n'écrit pas dans `ui.afficher`.
- **C2** : B4 prend à son compte le halo de focus et l'onde de C2.7 (C2 garde les pulsations) ; C2 pose
  `body.sans-ambiance` dans `ui.appliquerAnimations` quand Ambiance est coupée ou le régulateur l'a coupée ; B4 s'en
  sert pour le reflet de « Jouer ». La case « Ambiance » de C2.3 prend le sceau toute seule.
- **B2** : B4 ne touche pas `.choix` ni le panneau d'erreur ; leurs `.bouton` prennent la peau.

## 6. Animations

| Animation | Déclencheur | Propriétés | Durée | Interrupteur | Coût |
|---|---|---|---|---|---|
| Fanion qui tombe | l'onglet actif change (classe .actif posée) | transform, opacity | 240 ms, une fois | Animations | un calque 240 ms |
| Cascade d'entrée | un écran entre (Cours, Codex, Réglages, arsenal), pas un redessin sur place | transform (translateY 8 px), opacity | 220 ms, décalage 30 ms, plafond 150 ms | Animations | ≤ 8 calques pendant 400 ms |
| Appui | :active | changement de peau, translateY 1 px | instantané (transition 60 ms) | aucun (état) | une repeinture du bouton |
| Anneau d'or | pointerdown d'un doigt | transform, opacity (Web Animations) | 340 ms | Animations | un calque de 80 px |
| Sceau qui frappe | case cochée (:checked:focus) | transform, opacity | 180 ms | Animations | négligeable |
| Tome qui s'ouvre | dépli d'une matière du Codex | transform, opacity sur le contenu (`apparition` existante) | 200 ms | Animations | un calque |
| Reflet de « Jouer » | toutes les 5 s (existant) | transform | 5 s, en boucle | **Ambiance** (body.sans-ambiance) | existant ; ôté des autres boutons |
| Rail de chargement | chaque cours chargé | transform (scaleX) | transition 150 ms | aucun (sous prefers-reduced-motion, saute) | négligeable |
| Halo de focus | :focus-visible | aucune (fixe) | — | toujours | nul |

`.sans-anim` et `prefers-reduced-motion` coupent déjà tout par les règles globales de jeu.css (`animation: none
!important`) : les états (peaux, sceaux, fanion, halo) restent, seuls les mouvements disparaissent. L'anneau ne se
crée pas du tout sans animations. Aucune animation infinie n'est ajoutée ; une est retirée (reflet des boutons
principaux autres que « Jouer »).

## 7. Contrôles d'acceptation

**7.1 Lisibilité.** Libellés à 14 px au moins : menu 14,4 px, étiquettes d'état 14,4 px (0,8 rem), signets 15,3 px,
nombre de fiches 16,2 px. Rien de rendu par-dessus un texte. Captures avant-après côte à côte (inventaire/ contre
maquette-*), mêmes écrans.

**7.2 Cibles de 44 px au doigt** (mesuré dans le jeu en 1340 × 800 tactile, puis sur la maquette) : boutons du menu
60 px de haut, signets 44, lignes de cours 44, cases (ligne du libellé) 44 avec un sceau de 28, boutons 44, en-têtes
du Codex 48 (50 dans la maquette), boutons ronds 44, curseur 44 de haut. Le bloc tactile de jeu.css reste la
référence ; menus.css n'y retire rien.

**7.3 Contraste** (mesuré sur les maquettes, fond pris sur le parchemin le plus sombre) :

| Texte | Contraste |
|---|---|
| libellé du menu sur la sangle ; actif | 12,3 : 1 ; 11,8 : 1 |
| signet inactif | 8,1 : 1 |
| titre doré des tomes : Histoire, Physique-chimie, Géographie (la plus claire) | 13,2 ; 12,7 ; 10,2 : 1 (sur le grain clair du cuir) |
| bouton principal ; appuyé ; désactivé ; secondaire | 6,9 ; 5,2 ; 5,9 ; 9,7 : 1 |
| titre de semaine rubriqué #6a2a30 | 6,2 : 1 |
| étiquettes d'état **aujourd'hui** (#6a5536, #4f6b32, #9a4a32, brume #7d7262) | 4,2 ; 3,6 ; 3,6 ; 3,1 : 1 (défaut actuel) |
| étiquettes d'état **proposées** : défaut #574430, présumé #3f4f2d, acquis #3a5224, à revoir #7a3522, brume #5a503f | 5,4 ; 5,2 ; 5,1 ; 5,2 ; 4,7 : 1 |

Contrôle à ajouter à perf.js : ces couples relus dans la page (couleur calculée du texte, fond échantillonné sur la
capture), seuil 4,5 : 1. Le halo de focus a toujours un filet d'encre : il se voit sur le parchemin comme sur la sangle.

**7.4 Coût au ralenti 4 ×** (1340 × 800 tactile ; outil atelier/captures/menus/outils/mesurer-habillage.js : la
feuille activée et désactivée en alternance dans la même page, 12 ouvertures de chaque écran, médianes ; le conteneur
était chargé par d'autres agents, d'où des écarts de 10 à 20 % d'une passe à l'autre) :
- première version de la feuille : ouverture de Cours **+66 %**, Codex **+71 %** (lettrine par semaine, `:has()`, trois
  dégradés par ligne de brume, filter sur le fanion animé) ;
- version corrigée (celle de la maquette) : Cours **0 à +18 %** à l'horloge, +14 à +21 % de travail (style, mise en
  page, script), soit **+6 à +9 ms** ; Réglages **−7 à +15 %** (les cases natives coûtaient autant que les sceaux) ;
  Codex **+12 à +18 ms** de travail, à réduire encore (piste : moins de couches de fond sur les en-têtes, ou une image
  de cuir pré-teintée par matière) ;
- écran immobile après l'ouverture : 16,7 ms par image en médiane et au 95e centile pour Cours, Codex, Réglages
  (aucune boucle ajoutée). L'accueil reste à 33 ms tant que les poussières de C2.1 ne sont pas passées en transform ;
  « Jouer » posé sur la tapisserie, avec son ombre, est à remesurer après C2.1 (un 95e centile de 100 ms vu une fois).
Critères : ouverture d'un écran au plus **+10 % ou +15 ms** (le plus grand des deux) au ralenti 4 ×, trois passes ;
écran immobile 16,7 ms en médiane, 95e centile sous 34 ms ; `document.getAnimations()` après 1 s : seul le reflet de
« Jouer » (transform), et rien quand Ambiance est coupée ; Event Timing de la touche à la question suivante peinte
inchangé (moins de 100 ms ; l'onde ne lit jamais la mise en page) ; aucune tâche longue neuve au premier appui.

**7.5 Réglages respectés.** Animations coupées et prefers-reduced-motion : aucune animation (fanion posé, cascade
absente, pas d'anneau, sceau posé sans frappe) ; Ambiance coupée : reflet absent. Contrôle existant de perf.js
« propriétés animées » étendu à menus.css.

**7.6 Rien ne bouge.** Hauteurs de #bandeau et #menu égales avant et après (trois fenêtres ; vérifié avec la feuille
de la maquette injectée dans le jeu : bandeau 64,4 px et menu 69,5 px, avant comme après, en 1366 × 768,
1920 × 1080 et 1340 × 800 au doigt) ; contrôles de perf.js de
la bataille (énoncé visible et « Lancer la vague » visible en 1366 × 768) et de la carte entière en 1366 × 768 verts ;
tests.js : toutes les url() de menus.css existent et sont dans sw.js (contrôle neuf).

**7.7 Revue de style.** Planche de contrôle des rendus (1 × et 2 ×, parchemin et cuir) ; maquette-etats refaite avec
le jeu réel ; liste de style du plan (section 8) : ornements moins contrastés que le texte, cire et métal rendus,
aucun contour noir neuf.

## 8. B4 « menus habillés » dans le lot B

**Fichiers de B4** (disjoints de B1 à B3, de A et de C) :
- neufs : jeu/css/menus.css ; jeu/assets/images/menus/ ; atelier/outils/rendu-3d/menus.py ;
- partagés, à des endroits que personne d'autre ne tient : jeu/index.html (une balise `<link>` et le bloc
  `.attente`) ; jeu/js/chargeur.js (avance) ; jeu/js/demarrage.js (bloc de chargement) ; jeu/js/codex.js ;
  jeu/js/interface.js, **seulement** `ui.ecrans.cours`, `ui.ecrans.reglages` (première ligne et redessin après
  l'export) et un bloc neuf en fin de fichier ;
- jamais : jeu.css, ui.afficher, la fenêtre modale, poserQuestion, panneauErreur, tampon, anim.js, conseil.js,
  ecran-campagne.js, ecran-expedition.js, domaine.js, bataille*.js.

**Déroulé (une journée).** Matin : menus.py et les rendus (≈ 15 rendus, moins de 2 minutes de processeur ; une
seule session Blender, jamais en même temps qu'un rendu de A1), planche regardée avant d'écrire dans jeu/. Midi :
menus.css repris de la maquette, balise dans index.html, sw.js. Après-midi : les accroches JavaScript, perf.js et
tests.js, captures avant-après avec capturer-menus.js corrigé.

**Ligne de coupe.** Au-dessus : sangle, clous et fanion ; cartouches des boutons ; cases en sceaux et champs ; halo de
focus et anneau au toucher ; signets et listes des Cours (avec les couleurs d'état relevées). En dessous, en réserve
si la journée ne suffit pas : tomes et rouleau du Codex, arsenal, chargement, curseur, « Jouer » sur la tapisserie
(après la mesure de C2.1).

**Ordre de fusion.** B4 après B1 (contrat `surPlace`) ; avant C2 (qui pose `body.sans-ambiance` et ne fait plus le
halo ni l'onde). Une ligne au journal, un commit au jalon, le numéro de version du lot B.

**Risques.** Peau étirée qui se voit (contrôle du milieu uni) ; coût d'ouverture du Codex (7.4, piste notée) ;
« Jouer » sur la tapisserie trop proche du titre sur un écran de 1000 à 1100 px de large (vérifier 1024 × 768 au doigt :
sinon le laisser à sa place sous 1100 px) ; fichier oublié par la version installable (contrôle 7.6).

## 9. Pour Romain

Les menus prennent l'allure du reste du jeu : la barre du haut devient une sangle de cuir cousue et dorée, avec des
clous de laiton ; l'écran où tu es est marqué par un petit fanion rouge qui pend sous la sangle. Les boutons deviennent
des cartouches dorés qui s'enfoncent quand on appuie. Dans les Cours, les onglets deviennent des signets à ruban de
couleur, et l'état de chaque cours est un petit sceau de cire. Le Codex devient une rangée de livres reliés, un par
matière. Les cases à cocher deviennent des sceaux de cire. Sur la tablette, un anneau doré s'ouvre sous le doigt à chaque
toucher. Rien ne change aux règles ni aux questions, et « Animations » coupe tous les mouvements.

Quand ce sera livré, cinq essais :
1. Ouvrir le jeu : le blason et une barre dorée qui se remplit, puis l'accueil avec « Jouer » visible sans descendre.
2. Toucher « Cours » : le fanion rouge passe sous « Cours », la liste arrive en douceur, chaque cours a son sceau.
3. Toucher un onglet de matière : il s'enfonce et un anneau doré s'ouvre sous le doigt.
4. Dans les Réglages, cocher « Sang dans les combats » : un sceau de cire rouge au lys se pose dans la case.
5. Décocher « Animations » : plus rien ne bouge, mais les sceaux, les cartouches et le fanion restent.

## 10. Fichiers

- Ce document : atelier/conception/graphismes-menus.md.
- Inventaire : atelier/captures/menus/inventaire/pc/ et …/tablette/ (journal.json dans chaque dossier) ; outil
  atelier/captures/menus/capturer-menus.js
  (`NODE_PATH=/opt/node22/lib/node_modules CHROMIUM=/opt/pw-browsers/chromium node atelier/captures/menus/capturer-menus.js [pc|tablette]`).
- Maquettes : atelier/captures/menus/maquette-*.png (22 images) ; sources atelier/captures/menus/maquettes/
  (accueil, cours, codex, reglages, arsenal, chargement, etats .html ; menus.css ; demo.css).
- Essais de rendu : atelier/captures/menus/rendus-essai/ ; outils atelier/captures/menus/outils/
  (essai-rendu-menus.py, extraire-dom.js, capturer-maquettes.js, mesurer-habillage.js).
- Poids : environ 36 Mo de captures, dont 22 Mo d'inventaire. **À l'intégrateur** : ajouter
  atelier/captures/menus/inventaire/ au .gitignore, comme atelier/captures/audit-graphismes/ (les maquettes, 14 Mo,
  peuvent rester).
