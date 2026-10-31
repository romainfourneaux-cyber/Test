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
6. Animations. 7. Contrôles d'acceptation. 8. B4 dans le lot B. 9. Pour Romain. 10. Fichiers. 11. Critique et
arbitrages.

**Relu par la critique le 31/10/2026.** Les corrections sont dans le texte (repérées « (critique) ») et listées en
section 11. **Regarder les maquettes -v2 (.jpg)** : les 22 maquettes d'origine (.png) ont été enregistrées en 256
couleurs, ce qui fausse les teintes des matières et des sceaux (rubans ternes, sceaux gris). Ne jamais juger une
couleur sur elles. La feuille de la maquette est corrigée (maquettes/menus.css) ; l'ancienne reste dans
maquettes/menus-v1.css.

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
   À corriger avant les planches avant-après du lot B. Le même défaut touchait la planche tablette « entière » de
   cette conception (maquette-etats-tablette-entiere.png : règles de la souris) ; capturer-maquettes.js est corrigé
   (fenêtre agrandie au lieu de fullPage, émulation rallumée et vérifiée) (critique).
4. **En Cinzel, le chiffre 1 est un I** (critique) : « Semaine I2 », « Cours I », « I souverain rencontré », « I2 »
   au bandeau, « Ier novembre », « Améliorer · I0 » ; pour un élève de 13 ans, « Cours 11 » se lit « Cours II ».
   C'est partout dans les menus, pas seulement à l'accueil (atelier/captures/menus/maquette-*-v2.jpg montre la
   correction, section 2).

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
  1366 × 768, 1340 × 800 et 1024 × 768, dès 1000 px de large (maquette-accueil-*-v2.jpg). Le titre du domaine est
  borné : un nom long passe sur deux lignes au lieu de filer sous « Jouer » (un nom de 33 lettres le recouvrait :
  maquette-accueil-nom-long-1366-v1.jpg contre -1366-v2.jpg et -1024-v2.jpg) (critique). Cartouches à filet d'or,
  titres rubriqués avec un trait d'or.
- **Cours : des signets.** Chaque onglet est un signet de parchemin cousu d'un ruban de soie à la teinte de la
  matière (queue d'aronde) ; l'actif est blanc, cerné d'encre et d'or, son ruban plus long. Sous les signets, la
  tranche dorée du livre. Les semaines sont des titres rubriqués à trait d'or. Chaque ligne porte son état en sceau de
  cire de 22 px à gauche : vert franc au lys (acquis ; 18 px pour « présumé », **sans pâlir** : la cire pâlie faisait
  une tache grise), brique plus claire et sans emblème (à revoir : autre teinte, autre luminance, autre forme, lisible
  sans les couleurs), or (en cours), cercle gravé vide (dans la brume, contenu à venir) ; losange d'or pour révisions
  et devoirs. Étiquettes d'état en Cinzel **gras** (critique). Plus de pointillés : un filet d'encre très clair, comme
  la réglure d'un manuscrit. La brume : le titre se lit en italique gris-brun sous une nappe pâle **fondue aux deux
  bouts**, sans flou (la nappe claire à bord net se lisait comme la ligne choisie : la ligne qu'on ne peut pas encore
  ouvrir était la plus voyante) (critique).
- **Codex : des tomes reliés.** Chaque matière est le dos d'un tome couché : cuir grainé teinté de la matière, deux
  nerfs à gauche, deux filets dorés, titre doré, nombre de fiches en pied, fermoir en sceau d'or à droite. Ouvert, le
  tome laisse voir sa page (parchemin, ombre de la reliure à gauche), les vignettes sont des fiches où pend un petit
  ruban de la matière ; les bonus portent un sceau d'or. La galerie des souverains est un **rouleau** : parchemin bombé
  entre deux bâtons tournés.
- **Arsenal.** Chaque arme dans un médaillon de parchemin cerclé d'or (gris si verrouillée), losanges ◆◇ en or cerné
  d'encre, boutons en cartouches (or pour débloquer, parchemin pour améliorer, plomb si trop cher). Plus de tirets.
- **Réglages.** Champs en cartouche de parchemin à filet d'or ; dates en Crimson Text (en Cinzel, « 10/31/2026 » se
  lisait « I0/3I/2026 ») (critique), avec une petite icône de calendrier dessinée (le sélecteur natif reste, pratique
  au doigt). **Cases : vide, un cercle gravé dans le parchemin ;
  cochée, un sceau de cire rubrique au lys d'or**, qui frappe (180 ms) quand on coche. Les boutons radio du
  signalement prennent le même habit. Curseur (aucun aujourd'hui) : rail de laiton creusé, rempli d'or jusqu'à la
  bossette.
- **Focus clavier : un halo héraldique** (filet clair, filet d'encre, filet d'or, lueur d'or), le `--filet` du jeu mis
  en lumière ; sur la sangle sombre, un filet d'or arrondi et une lueur sous le libellé. Jamais de rectangle bleu. Sur
  les cartouches, le halo suit un arrondi de 6 px (`border-radius`, que la peau ignore) au lieu d'un rectangle
  (critique).
- **Toucher : un anneau d'or** s'ouvre sous le doigt (340 ms) sur ce qui se touche **dans les menus** : menu,
  boutons du bandeau, onglets, boutons, cases, tomes, fiches du Codex, cartes de la campagne. Jamais sur une réponse,
  le panneau d'erreur, le conseil ni le champ de bataille : le sceau de B2 frappe la réponse choisie, la bataille a
  son propre retour, et rien ne doit s'ajouter entre la réponse et la question suivante (critique). Il remplace le
  survol absent, et se voit au-delà du doigt (80 px de diamètre).
- **Chiffres (critique).** Les chiffres passent en Crimson Text (police « Chiffres » faite des fichiers du jeu, par
  unicode-range ; les lettres restent en Cinzel) dans le bandeau, le menu, l'accueil, les Cours, le Codex, les
  réglages et les fenêtres. « Semaine 12 », « Cours 1 », « 1er novembre », « 31/10/2026 » se lisent enfin.
- **Chargement.** Le blason du domaine (92 px), son nom en Cinzel, un rail de laiton à bossettes qui se remplit d'or,
  « Ouverture des archives · 24 / 38 ».

Ce qu'on refuse : néon, contour noir d'autocollant, pictogramme plat à la place d'une cire ou d'un métal rendus,
animation qui tourne sans raison de jeu, ornement plus contrasté que le texte qu'il entoure, blanc pur qui clignote.

Maquettes (vrai balisage, feuille proposée, essais de rendu) : atelier/captures/menus/maquette-accueil-pc.png,
-tablette.png ; maquette-cours-* (et -suite) ; maquette-codex-* (et -haut) ; maquette-reglages-* (et -suite) ;
maquette-arsenal-* ; maquette-chargement-* ; **maquette-etats-*-entiere.png** (planche de tous les états :
boutons repos, appuyé, focus, désactivé ; cases vide, cochée, focus ; champs ; curseur ; signets ; lignes d'état ;
tomes ; rouleau ; anneau ; rail). **Après la critique, regarder les -v2.jpg** (accueil, cours, codex, réglages,
planche ; couleurs justes, feuille corrigée) : maquette-etats-tablette-v2-entiere.jpg est la seule planche tablette
entière prise au doigt. L'arsenal et le chargement n'ont pas changé (anciens .png, couleurs réduites).

## 3. Images à rendre (Blender)

Peu d'images, réutilisées partout. Toutes vues de dessus, soleil commun du nord-ouest (commun.py), au double de la
taille logique (commun.ECHELLE), fond transparent, ombre portée cuite dans l'image (en bas à droite), 2 px
transparents au bord. Dossier : **jeu/assets/images/menus/** (neuf). Budget du dossier : **120 Ko** (estimé 95 :
14 images ; avant la critique, 200 Ko pour 29 images).

| # | Fichier | Sert à | Taille logique (fichier) | Poids visé | Essai |
|---|---|---|---|---|---|
| 1 | bossette-laiton.png | clous du menu (12 px), boutons ronds (40 à 44 px), bouton du curseur (28 px), bouts du rail de chargement (22 px) | 40 × 40 (80 × 80) | 8 Ko | fait, bon (collerette assombrie) |
| 2 | sangle-bord.png | bord haut et bas de la sangle : filet doré, couture, sillon (border-image, tranches de 10 unités, milieu transparent ; période de 8 unités) | 64 × 40 (128 × 80) | 8 Ko | fait, bon (couture un peu claire : #b89a62) |
| 3 | fanion.png | onglet actif ; « cette semaine » (14 px) | 30 × 34 (60 × 68) | 8 Ko | à faire (dessin SVG provisoire dans la maquette) |
| 4 | cartouche-or.png, -or-appui, -parchemin, -parchemin-appui, -plomb | peaux des boutons (border-image … fill, tranches de 12 unités) | 48 × 32 (96 × 64) chacune | 8 Ko chacune | faites (version 2, coins rentrants) ; face de parchemin trop grise, arêtes des coins trop claires à 12 px |
| 5 | coin-dore.png | coins de la feuille (.ecran), de la fenêtre, des cartouches (22 px) | 46 × 46 (92 × 92) | 8 Ko | fait, trop simple : ajouter un fleuron |
| 6 | sceau-case, sceau-acquis, sceau-revoir, sceau-or (quatre ; sceau-ouvert et sceau-plomb retirés : la feuille ne s'en sert pas) | case cochée (rubrique, lys d'or) ; acquis et présumé (vert franc, lys) ; à revoir (brique, sans emblème) ; en cours, bonus et fermoir des tomes (or, lys) | 28 × 28 (56 × 56) chacun | 6 Ko chacun | case, or : faits, bons. Acquis refait (critique) : cire #2f7424, lys sur plaque #efdc98 (rendus-essai/sceau-acquis-v3.png ; l'ancien, olive, tirait sur le brun à 22 px). À revoir refait : #b0402a, sans emblème (sceau-revoir-v2.png) |
| 7 | ~~fermoir-‹matière› ×8~~ | **retiré (critique)** : un seul sceau d'or pour tous les tomes (l'essai en teinte de matière disparaissait sur le tome) | — | — | — |
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
  éclaircit d'un cran), lys en plaque or-clair ; acquis #2f7424 / #123508, plaque #efdc98 ; à revoir #b0402a /
  #4e140a, `embleme=False` (critique) ;
- contrôle des sceaux **à leur taille d'emploi** (22 px, réduits par Lanczos ; critique) : teinte moyenne du centre
  90 à 130° pour acquis, 0 à 20° pour à revoir, 30 à 50° pour l'or, saturation au moins 0,3 ; luminance du brique
  au-dessus de celle du vert d'au moins 0,05 (essai : acquis 103°, 0,33, 0,39 ; à revoir 9°, 0,55, 0,47).
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
- **Tout survol sous `@media (hover: hover)`** (critique). jeu.css neutralise le survol au doigt (bloc tactile) avec la
  même spécificité ; menus.css, chargée après, le rallumait : une fiche du Codex restait soulevée et un bouton restait
  monté de 1 px après un toucher. La maquette corrigée le fait pour #menu, .bouton, .onglet, .vignette.
- **Chiffres** (critique) : `@font-face` « Chiffres » (crimson-text-latin-400 et -700, `unicode-range: U+0030-0039`,
  `size-adjust: 112%`), puis `--titre: "Chiffres", "Cinzel", Georgia, serif` sur #bandeau, #menu, #ecran-accueil,
  #ecran-cours, #ecran-codex, #ecran-reglages, #modale. Aucun fichier neuf ; interface.js charge déjà toutes les
  polices au lancement. La bataille et la carte gardent leur police (lots A et B3) ; C2.7 pourra l'étendre à :root,
  après avoir vérifié le compteur d'or à rouleaux de la bataille (largeur .66em par chiffre).
- **Images préchargées au lancement** (critique) : une image d'interface ne se lit jamais sur le disque pendant une
  question (règle du projet : tout est chargé au lancement). La peau de parchemin, par exemple, apparaîtrait pour la
  première fois sur un bouton du conseil ou de la bataille.
- **Dates en Crimson Text**, pas en Cinzel (critique).

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
| Menus : chiffres | @font-face « Chiffres », --titre des sept conteneurs | — |
| Menus : réglages | input[type=text], input[type=date] (+ ::-webkit-calendar-picker-indicator), input[type=checkbox], input[type=radio], input[type=range] (+ track, thumb) | vide, cochée, :checked:focus:not(:focus-visible) (frappe au clic ou au doigt, pas à chaque Tab), focus ; règle tactile : cases de 28 px |
| Menus : chargement | .attente, .attente-blason, .attente-titre, .attente-rail (+ ::before/::after bossettes, i), .attente-compte | progression `--p` |
| Menus : onde | .onde | posée par interface.js (5) |
| Menus : cascade | .cascade (liste-cours, codex-matiere, cartouche), **six premiers enfants seulement** | 30 ms d'écart, plafond 150 ms ; les suivants sans animation ; pas d'arsenal (critique) |

## 5. Points d'accroche JavaScript (le moins possible)

| Fichier | Où | Quoi | Lignes |
|---|---|---|---|
| jeu/index.html | `<head>` ; `<main>` | `<link rel="stylesheet" href="css/menus.css">` après jeu.css ; le `<p class="attente">` devient un bloc (blason, titre, rail, compte) | 2 |
| jeu/js/chargeur.js | chargerCours | second paramètre facultatif `avance(faits, total)`, appelé dans `un()` | 3 |
| jeu/js/demarrage.js | demarrer | blason (`JEU.icones.blason`) et nom posés dans le bloc dès le départ ; `--p` mis à jour par `avance` ; le bloc s'efface en 150 ms (opacité) après `JEU.pret` ; à côté de `JEU.sons.precharger()`, une `new Image()` par image de menus.css, gardée dans un tableau (le modèle d'ecran-expedition.js), liste vérifiée par le contrôle de B4 (critique) | 9 |
| jeu/js/interface.js | bloc neuf en fin de fichier « habillage des menus » | l'anneau au toucher : un seul `div.onde` créé au premier appui ; écouteur `pointerdown` en capture, passif, doigt ou stylet seulement, rien si `!JEU.anim.actif()` ; **seulement si** `ev.target.closest("#menu button, #bandeau button, .onglet, .bouton, .codex-entete, .vignette, label, .carte-jeu")` **et pas** `closest(".question, .panneau-erreur, .scene-conseil, .td-cadre")` (même garde que l'écouteur des touchers d'interface.js ; critique) ; lancé dans `requestAnimationFrame` par l'API Web Animations (`translate(x, y) scale(.25 → 1)`, opacité 1 → 0, 340 ms) ; la feuille ne donne que l'aspect (`.onde`, sans keyframes) : **aucune lecture de mise en page**, rien dans le chemin réponse → question suivante | 14 |
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
- **B2** : B4 ne touche pas `.choix` ni le panneau d'erreur ; leurs `.bouton` prennent la peau. L'anneau ne part ni
  d'une réponse, ni du panneau, ni du conseil (critique).
- **A3, B1, B2, B3 : la peau vaut pour tout `.bouton` du jeu** (critique ; 36 boutons hors menus : bataille,
  conseil, expéditions, domaine, arsenal). « Lancer la vague » (`.bouton.principal.td-lancer`) devient plomb tant
  qu'il est désactivé (« Réponds d'abord au conseil de guerre »), puis or ; il **perd son reflet** (une animation
  infinie de moins pendant la bataille). Aucune boîte ne change de taille (contrôle 7.6 : « Lancer la vague » visible
  en 1366 × 768). Chaque agent est prévenu par ce paragraphe ; aucun n'a de ligne à changer.

## 6. Animations

| Animation | Déclencheur | Propriétés | Durée | Interrupteur | Coût |
|---|---|---|---|---|---|
| Fanion qui tombe | l'onglet actif change (classe .actif posée) | transform, opacity | 240 ms, une fois | Animations | un calque 240 ms |
| Cascade d'entrée | un écran entre (Cours, Codex, Réglages), pas un redessin sur place ; changement d'onglet des Cours compris | transform (translateY 8 px), opacity | 220 ms, décalage 30 ms, plafond 150 ms ; **six premiers enfants**, les suivants posés d'un coup | Animations | ≤ 6 calques pendant 370 ms (avant la critique : tous les blocs, 20 calques et plus) |
| Appui | :active | changement de peau, translateY 1 px | instantané (transition 60 ms) | aucun (état) | une repeinture du bouton |
| Anneau d'or | pointerdown d'un doigt sur un élément des menus (jamais réponse, panneau, conseil, champ) | transform, opacity (Web Animations) | 340 ms | Animations | un calque de 80 px |
| Sceau qui frappe | case cochée au clic ou au doigt (:checked:focus:not(:focus-visible)) | transform, opacity | 180 ms | Animations | négligeable |
| Tome qui s'ouvre | dépli d'une matière du Codex | transform, opacity sur le contenu (`apparition` existante) | 200 ms | Animations | un calque |
| Reflet de « Jouer » | toutes les 5 s (existant) | transform | 5 s, en boucle | **Ambiance** (body.sans-ambiance) | existant ; ôté des autres boutons |
| Rail de chargement | chaque cours chargé | transform (scaleX) | transition 150 ms | aucun (sous prefers-reduced-motion, saute) | négligeable |
| Halo de focus | :focus-visible | aucune (fixe) | — | toujours | nul |

`.sans-anim` et `prefers-reduced-motion` coupent déjà tout par les règles globales de jeu.css (`animation: none
!important`) : les états (peaux, sceaux, fanion, halo) restent, seuls les mouvements disparaissent. L'anneau ne se
crée pas du tout sans animations. Aucune animation infinie n'est ajoutée ; une est retirée (reflet des boutons
principaux autres que « Jouer », dont « Lancer la vague » en bataille). Sur les Cours, la liste défile jusqu'à la
semaine en cours : la cascade des six premiers enfants se joue souvent hors de la vue ; c'est voulu (aucun retard sur
ce qui se lit).

## 7. Contrôles d'acceptation

**7.1 Lisibilité.** Libellés à 14 px au moins : menu 14,4 px, étiquettes d'état 14,4 px (0,8 rem), signets 15,3 px,
nombre de fiches 16,2 px. Rien de rendu par-dessus un texte. Captures avant-après côte à côte (inventaire/ contre
maquette-*), mêmes écrans.

**7.2 Cibles de 44 px au doigt** (mesuré dans le jeu en 1340 × 800 tactile, puis sur la maquette) : boutons du menu
60 px de haut, signets 44, lignes de cours 44, cases (ligne du libellé) 44 avec un sceau de 28, boutons 44, en-têtes
du Codex 48 (50 dans la maquette), boutons ronds 44, curseur 44 de haut. Le bloc tactile de jeu.css reste la
référence ; menus.css n'y retire rien (vrai seulement avec la règle du survol sous `(hover: hover)`, section 4).
**Mesuré sur les maquettes corrigées** (DOM, toucher émulé ; critique) : aucune cible sous 44 px en 1340 × 800 ni en
1024 × 768, sur l'accueil, les Cours, le Codex, les réglages, l'arsenal et la planche (289 cibles ; les petits
boutons de l'arsenal font 44,00 px).

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

Contrôle à ajouter (fichier de B4, section 8) : ces couples relus dans la page (couleur calculée du texte, fond
échantillonné sur la capture), seuil 4,5 : 1. Le halo de focus a toujours un filet d'encre : il se voit sur le
parchemin comme sur la sangle.

**Contraste rendu** (critique) : en Cinzel 400 à 14,4 px, les traits sont si fins que les étiquettes proposées ne
dépassent pas 4,0 à 4,7 : 1 une fois rendues (cœur des lettres relevé sur les pixels de la maquette : « à revoir »
4,0, « dans la brume » 4,3). Elles passent en **gras** (Cinzel 700, déjà chargé). **Sans les couleurs** : acquis et à
revoir diffèrent aussi par la luminance et par la forme (lys ou rien) ; l'étiquette reste écrite.

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
tests.js : toutes les url() de menus.css existent et sont dans sw.js (contrôle neuf) ; aucun `:hover` de menus.css hors
de `@media (hover: hover)` (contrôle neuf, critique) ; toutes les url() de menus.css sont dans la liste préchargée de
demarrage.js (contrôle neuf, critique).

**7.8 Chiffres** (critique). Capture de « Semaine 12 », « Cours 1 », d'une date des réglages, de « Améliorer · 10 » et
du bandeau, en 1366 × 768 et 1340 × 800 : aucun « 1 » en Cinzel. Dans la page : `document.fonts.check("700 16px
Chiffres", "1")` vrai après le chargement ; hauteurs de #bandeau et #menu inchangées (7.6).

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
  ecran-campagne.js, ecran-expedition.js, domaine.js, bataille*.js ; **ni atelier/outils/perf.js ni tests.js**, tenus par
  C1 (critique) : les contrôles de B4 vont dans un fichier neuf, **atelier/outils/controles-menus.js**, que tests.js et
  perf.js appellent par une ligne chacun (posée par C1 ou l'intégrateur à la fusion). jeu/sw.js est régénéré par
  generer-sw.js : en cas de conflit à la fusion, on relance le générateur.

**Déroulé (une journée).** Matin : menus.py et les rendus (14 images, moins de 2 minutes de processeur ; une seule
session Blender, jamais en même temps qu'un rendu de A1), planche regardée avant d'écrire dans jeu/. **Le fanion
rendu (étoffe subdivisée) a une heure au plus** ; sinon le dessin SVG de la maquette reste, il tient le style
(critique). Midi : menus.css repris de la maquette corrigée (maquettes/menus.css, pas menus-v1.css), balise dans
index.html, sw.js. Après-midi : les accroches JavaScript (≈ 35 lignes), controles-menus.js, captures avant-après
avec capturer-menus.js corrigé. Verdict de la critique : tenable en un jour avec la ligne de coupe ci-dessous.

**Ligne de coupe.** Au-dessus : chiffres en Crimson Text (dix lignes de feuille, le gain de lecture le plus net ;
critique) ; sangle, clous et fanion ; cartouches des boutons ; cases en sceaux et champs ; halo de focus et anneau au
toucher ; signets et listes des Cours (avec les couleurs d'état relevées). En dessous, en réserve si la journée ne
suffit pas : tomes et rouleau du Codex, arsenal, chargement, curseur, coin doré rendu (le coin SVG actuel reste en
attendant ; critique), « Jouer » sur la tapisserie (après la mesure de C2.1).

**Ordre de fusion.** B4 après B1 (contrat `surPlace`) ; avant C2 (qui pose `body.sans-ambiance` et ne fait plus le
halo ni l'onde). Une ligne au journal, un commit au jalon, le numéro de version du lot B.

**Risques.** Peau étirée qui se voit (contrôle du milieu uni) ; coût d'ouverture du Codex (7.4) : si le critère n'est
pas tenu, dans l'ordre, 1) retirer `background-blend-mode` et la couche de cuir des en-têtes (trois dégradés
restent), remesurer ; 2) sinon, tomes en bandes teintées sans grain (critique) ; « Jouer » sur la tapisserie : réglé
par la critique (titre borné, posé dès 1000 px, vérifié en 1366, 1024 et 1000 px avec un nom de 33 lettres : aucun
chevauchement) ; fichier oublié par la version installable (contrôle 7.6).

## 9. Pour Romain

Les menus prennent l'allure du reste du jeu : la barre du haut devient une sangle de cuir cousue et dorée, avec des
clous de laiton ; l'écran où tu es est marqué par un petit fanion rouge qui pend sous la sangle. Les boutons deviennent
des cartouches dorés qui s'enfoncent quand on appuie. Dans les Cours, les onglets deviennent des signets à ruban de
couleur, et l'état de chaque cours est un petit sceau de cire (vert pour acquis, brique pour à revoir, or pour en
cours). Les chiffres se lisent mieux : le « 1 » ne ressemble plus à un « I » (« Cours 11 » ne se lit plus « Cours
II »). Le Codex devient une rangée de livres reliés, un par
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
- Maquettes : atelier/captures/menus/maquette-*.png (22 images, 256 couleurs : teintes faussées) et maquette-*-v2.jpg (corrigées, couleurs justes) ; sources atelier/captures/menus/maquettes/
  (accueil, cours, codex, reglages, arsenal, chargement, etats .html ; menus.css ; demo.css).
- Essais de rendu : atelier/captures/menus/rendus-essai/ ; outils atelier/captures/menus/outils/
  (essai-rendu-menus.py, extraire-dom.js, capturer-maquettes.js, mesurer-habillage.js).
- Critique (31/10/2026) : maquettes corrigées atelier/captures/menus/maquette-*-v2.jpg (21 images, JPEG qualité
  90 sans sous-échantillonnage des couleurs, 6 Mo) et maquette-accueil-nom-long-1366-v1.jpg (le défaut) ; feuille
  d'origine maquettes/menus-v1.css ; sceaux refaits rendus-essai/sceau-acquis-v3.png et sceau-revoir-v2.png (script
  d'essai dans le dossier d'essai de la critique, mêmes réglages que essai-rendu-menus.py) ; outils/capturer-maquettes.js
  corrigé (planche tablette entière vraiment au doigt).
- Poids : environ 36 Mo de captures, dont 22 Mo d'inventaire. **À l'intégrateur** : ajouter
  atelier/captures/menus/inventaire/ au .gitignore, comme atelier/captures/audit-graphismes/ (les maquettes, 14 Mo,
  peuvent rester).

## 11. Critique et arbitrages (31/10/2026)

**Verdict : accepté avec corrections.** La direction tient la règle du projet : cuir, laiton, cire, parchemin, signets
de soie et fanion de carte de campagne. C'est la table d'un seigneur, pas un gabarit de site « fantasy » ni un jeu
d'enfant : les ornements sont sobres, rendus, et restent derrière le texte. Les images sont peu nombreuses, légères
(environ 95 Ko pour 14 images, bien sous les 600 Ko) et réutilisées partout. Les animations sont sur transform et
opacity, coupées par Animations, et la seule animation infinie restante passera sous Ambiance. Les accroches
JavaScript sont courtes et disjointes de B1 à B3 et de A. Le placement en B4 sur une journée est tenable avec la ligne
de coupe. Mais dix points étaient faibles ou faux ; ils sont corrigés dans le texte, dans la feuille de la maquette
(maquettes/menus.css) et dans des maquettes refaites (-v2.jpg).

| # | Constat | Correction | Pourquoi |
|---|---|---|---|
| 1 | Les 22 maquettes sont en 256 couleurs : rubans des matières ternes, médaillons gris, sceaux gris ou bruns | Maquettes refaites en couleurs pleines (-v2.jpg, 6 Mo) ; avertissement en tête du document | On jugeait les couleurs sur des images fausses ; une partie des défauts de teinte venait de là |
| 2 | En Cinzel, « 1 » = « I » partout : « Semaine I2 », « Cours I », « I0/3I/2026 », « Ier », « I2 » au bandeau ; la conception passait même les dates en Cinzel | Police « Chiffres » (Crimson Text, unicode-range, fichiers du jeu) sur les sept conteneurs des menus ; dates en Crimson Text ; contrôle 7.8 ; au-dessus de la ligne de coupe | Lisibilité d'abord : « Cours 11 » se lisait « Cours II ». Dix lignes de feuille, aucun fichier neuf |
| 3 | Sceaux d'état : acquis olive (brun à 22 px), présumé pâli à 72 % (tache grise sur 9 des 12 cours ouverts en histoire), acquis et à revoir proches | Acquis refait en vert franc avec son lys (sceau-acquis-v3.png) ; à revoir en brique plus claire, sans emblème (sceau-revoir-v2.png) ; présumé sans pâlir ; contrôle des teintes à 22 px | L'état doit se voir d'un coup d'œil, et aussi sans les couleurs (lys ou rien, luminance différente) |
| 4 | Étiquettes d'état en Cinzel 400 : 5,1 à 5,4 : 1 sur le papier, 4,0 à 4,7 une fois rendues (traits fins) | Cinzel gras | Mesuré sur les pixels ; le gras est déjà chargé |
| 5 | Lignes « Dans la brume » plus claires que les autres, à bord net : elles se lisaient comme la ligne choisie | Nappe plus pâle, fondue aux deux bouts (un seul dégradé, coût inchangé) | La ligne qu'on ne peut pas encore ouvrir ne doit pas être la plus voyante |
| 6 | Les survols de menus.css annulaient la neutralisation du survol au doigt de jeu.css (même spécificité, feuille chargée après) : fiche du Codex soulevée et bouton monté après un toucher | Tout survol sous `@media (hover: hover)` ; contrôle dans tests.js | « menus.css n'y retire rien » n'était pas vrai |
| 7 | Anneau d'or « sur tout ce qui se touche », y compris les réponses, le panneau d'erreur, le conseil et le champ de bataille | Limité aux éléments des menus, même garde `closest()` que l'écouteur existant | Règle « rien entre la réponse et la question suivante » ; le sceau de B2 frappe la réponse ; la bataille a son retour et son budget |
| 8 | Cascade : tous les enfants animés (20 calques et plus, pas « ≤ 8 ») ; l'arsenal dans la cascade alors qu'il est une fenêtre d'ecran-campagne.js sans ancêtre `.cascade`, redessinée à chaque achat | Six premiers enfants seulement ; arsenal retiré ; frappe de la case au clic ou au doigt, plus à chaque Tab | Coût annoncé faux, sélecteur mort, animation sans raison de jeu |
| 9 | « Jouer » sur la tapisserie : un nom de domaine long (le jeu en permet 40 lettres) passait sous le bouton en 1366 × 768 ; risque laissé ouvert pour 1000 à 1100 px | Titre borné (`max-width`, deux lignes au besoin) ; « Jouer » posé dès 1000 px ; vérifié à 1366, 1024 et 1000 px (aucun chevauchement) | Le fils de Romain peut renommer son domaine ; 1024 × 768 est un profil de la passe tablette |
| 10 | B4 devait écrire dans perf.js et tests.js (tenus par C1) ; la peau de `.bouton` change aussi 36 boutons de la bataille, du conseil et des expéditions sans que A3, B1 et B2 le sachent ; images chargées à leur premier emploi (peut-être pendant une question) ; budget de 29 images dont 8 fermoirs facultatifs et 2 sceaux que la feuille n'emploie pas | Contrôles dans un fichier neuf (controles-menus.js) ; contrat écrit pour A3, B1, B2, B3 (« Lancer la vague » plomb puis or, sans reflet) ; préchargement au lancement dans demarrage.js ; 14 images, budget 120 Ko ; fanion rendu borné à une heure ; coin doré rendu sous la ligne de coupe | Fichiers disjoints, règle « tout est chargé au lancement », moins d'images |

Petite retouche de plus : le halo de focus des cartouches est arrondi (6 px) au lieu d'un rectangle à quatre filets.

Vérifié par la critique : toutes les maquettes et tous les essais de rendu regardés ; contraste relevé sur les
pixels ; cibles mesurées dans le DOM au doigt émulé (aucune sous 44 px, en 1340 × 800 et 1024 × 768) ; deux sceaux
rendus dans le dossier d'essai (4 à 5 s chacun, un seul processus Blender, aucun autre rendu en cours) ; feuille
corrigée injectée dans les maquettes ; outil de capture corrigé pour la planche tablette entière (elle était prise
avec les règles de la souris, et la fenêtre agrandie affichait « Tourne ta tablette »).

Gardé tel quel, avec une réserve :
- **Bouton désactivé en plomb** : il se lit un peu comme un bouton d'argent sur la planche. Garder le plomb (code
  des matières : plomb = indisponible), mais mat, sans reflet ; à juger sur la planche des rendus.
- **Coût d'ouverture du Codex** (+12 à +18 ms au ralenti 4 ×, au bord du critère) : ordre de repli écrit en
  section 8 (sans fusion de calques, puis sans grain).
- **Coin doré rendu** : peu de gain sur le coin SVG actuel ; sous la ligne de coupe, sans fleuron chargé.

Non modifié : le fond (sangle, fanion, cartouches à coins rentrants, signets, tomes, rouleau, halo de focus hors son arrondi,
chargement), les mesures de hauteur du bandeau et du menu, le plan de fusion après B1 et avant C2.

