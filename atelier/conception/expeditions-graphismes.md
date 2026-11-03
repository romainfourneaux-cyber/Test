# Expéditions : graphismes rendus en 3D (cahier des images, version 0.9.1)

Demande de Romain du 25/10/2026 : « Blender pour faire les graphismes ». Ce cahier habille l'écran des expéditions
(jeu/js/ecran-expedition.js, conception atelier/conception/expeditions.md, section 14) avec des images rendues par la
chaîne 3D de l'atelier (atelier/outils/rendu-3d/, Blender en module Python, Cycles sur CPU). Trois scripts de rendu
travaillent en parallèle, un par famille, sur un module commun : atelier/outils/rendu-3d/expedition_commun.py.

Règles qui ne se discutent pas :
1. **Le SVG reste le repli.** Chaque image est un habillage : si le manifeste n'a pas l'entrée, ou si le fichier ne se
   charge pas, l'écran dessine ce qu'il dessine aujourd'hui. Rien ne casse sans image.
2. **Rien ne ralentit le jeu.** Les images sont de simples `<img>`, `<image>` SVG ou fonds CSS, chargées une fois par le
   navigateur, jamais redessinées pendant une bataille ; aucune image n'entre dans le chemin réponse → question suivante
   (moins de 100 ms, règle ferme). Budget : moins de 3 Mo pour tout le dossier, aucun fichier au-dessus de 600 Ko.
3. **Même monde que le reste du jeu.** Même soleil du nord-ouest, mêmes réglages Cycles, mêmes textures CC0 du cache,
   mêmes contrôles automatiques (bords transparents, blancs brûlés) que les sprites du champ de bataille et de la carte.
4. **Pas de texte dans les images** (lettrines, dates, noms, « Cette semaine » restent du texte SVG ou HTML, pour la
   traduction, l'accessibilité et la netteté), **aucune figure religieuse, aucun lieu de culte, aucune caricature** ;
   les camps sont des puissances politiques (écus et bannières aux couleurs du camp), le ton reste neutre.
5. Style : carte de campagne à la Total War, enluminure, héraldique, silhouettes. Ni pixel art, ni manga, ni dessin enfantin.

## 1. Style

### 1.1 Palette (sRGB, les mêmes valeurs dans jeu/css/jeu.css, ecran-expedition.js et expedition_commun.py)

| Usage | Hex | Où |
|---|---|---|
| Fond du jeu / parchemin clair | `#efe6d2` / `#f7efdc` | champ des médaillons, cases de l'année |
| Parchemin moyen / sombre | `#e8dbb8` / `#c8b28a` | fond de la carte-itinéraire, bords patinés |
| Encre | `#2e2419` | cernes, perles, traits, liserés |
| Or (CSS) / or clair / or sombre | `#b08d3a` / `#e2c272` / `#7a5c1e` | cerclage des médaillons, halo, chemin parcouru |
| Or rendu (albédo métal) | `#c9a24a` | même valeur que les épis des bannières de commun.py |
| Rubrique | `#8c2f39` | lettrines, pennon d'embuscade, bannière « Cette semaine », ruban du plan |
| Plomb | `#4a4e57` (cire `#6a6e78`, ombre `#2f3238`, reflet `#a6aab3`) | sceau « murs cédés » |
| Cire du joueur (bleu de France) | cire `#2d4f94`, ombre `#14284f`, reflet `#9db2df` | sceaux « réussie » et semaines franchies |
| Bronze / argent | `#a86f3b` / `#c9ccd2` | cerclage d'une faveur commune / rare |
| Champ gris de la brume | `#9a927f` | médaillon d'une halte pas encore atteinte |
| Teintes des matières | histoire `#6b2d5c`, géographie `#b5772b`, SVT `#4f6b32`, physique-chimie `#2f5a8a`, littérature (français) `#7a4a2a`, grammaire `#8c2f39`, anglais `#2a7470` | écussons des portes de faveur, champ teinté des faveurs (`champ_teinte`, 12 %), émaux de l'Armorial |
| Quartiers de l'Armorial | vivres `#4f6b32`, bourse `#b5772b`, murs `#2f5a8a`, bannière `#8c2f39`, ouverture `#6b2d5c` | TEINTES_ECU du SVG |
| Camps | France azur `#24407a` / or `#e2c272` (lys) ; Angleterre gueules `#9b1f1f` / or (lion) ; Omeyyades ivoire `#e9e1cc` / vert `#2f6b52` (tour) | commun.CAMPS, bannières et écus des gardiens |

Matières : parchemin (`mat_parchemin`), encre (`mat_encre`), or d'enluminure un peu mat (`mat_or`, metallic 0,75 : pas
de ciel bleu en miroir), or poli des épis (`mat_or_poli`), bronze, argent, plomb, cire (`mat_cire`, brillante, un peu
translucide, emblème en relief), bois (`rough_wood`, `weathered_planks`), toile et jute (`mat_toile`), cuir, pierre
(`yellow_stone_wall`), flamme émissive (`mat_flamme`). Aucune source nouvelle n'est nécessaire ; si un script en
ajoute une (CC0 seulement), il la note dans atelier/sources-3d/SOURCES.md et dans jeu/CREDITS.md.

### 1.2 Lumière et caméras

- Soleil du nord-ouest à 45° (haut-gauche de l'écran), chaud ; ciel doux ; appoint côté caméra (`APPOINT` 0,7, un peu
  plus fort que sur l'herbe : le parchemin renvoie de la lumière). Tout vient de commun.installer_lumiere.
- **Objets des médaillons** : `scene_vignette()` : caméra orthographique de trois quarts inclinée de 45° (entre la vue
  de dessus du cadre et les 40° des sprites), origine du monde au centre de l'image, 10 unités logiques par mètre.
- **Cadre des médaillons** : vu de dessus (`cadre_rondel`), rendu une fois par variante et mis en cache : le cercle est
  exactement celui du SVG (rayon 24 unités pour une halte, 34 pour un gardien).
- **Fonds** (parchemin de route, cadre de page) : vue de dessus (`scene_dessus`), rendu opaque.
- **Carte de campagne** : trois quarts à 40° comme les lieux de la carte (`scene_scene`).
- Écussons des portes : 55°, ancre basse ; sceaux : 70° (la cire se lit ronde) ; icônes de la compagnie : 45 à 50°.

### 1.3 Le rondel : un seul cadre pour tous les médaillons

Disque d'or de rayon R cerné d'un fin trait d'encre, un rang de trente perles d'encre à R − 3,5 unités (le pointillé du
SVG), champ de parchemin un peu surélevé de rayon R − 6 cerné d'encre. L'objet est rendu à part, de trois quarts, avec
son ombre portée sur le champ (ombre coupée au champ, brun chaud `(70, 48, 24)` et non le vert du pré), puis posé dans le
cadre : le liseré d'encre des sprites (contour 0,4) détache l'objet du parchemin. Variantes du cadre : anneau `or`
(haltes, gardiens, faveur de rang 3), `bronze` (faveur commune), `argent` (faveur rare) ; champ `#9a927f` pour la brume,
champ teinté de la matière pour les faveurs.

### 1.4 Lisibilité à 48 unités

Un médaillon de halte fait 48 unités (environ 46 px à 1366 × 768, 60 px à 1920). Un objet par médaillon, silhouette
franche, trois volumes au plus, pas de détail de moins de 10 cm (1 unité). Il tient dans un cercle de 1,5 m au sol et
sous 2,5 m de haut (il peut mordre un peu sur la bande d'or, jamais sortir de la toile : contrôle des bords). Vérifier
sur la planche (`planche(famille)`) à l'échelle 0,5 : si on ne reconnaît pas l'objet, il est trop petit ou trop détaillé.
Les icônes Game-icons existent en plaque découpée (`plaque_icone`) pour les écussons et les emblèmes ; pour les médaillons
on préfère de vrais objets en volume, la plaque reste le dernier recours.

## 2. Inventaire : ce que l'écran dessine aujourd'hui et ce qui devient une image

| Élément | Fonction (ecran-expedition.js) | Taille logique | États | Décision |
|---|---|---|---|---|
| Fond du parchemin de route | `carteSVG`, `<rect fill=url(#parchR)>` | 1000 × 320 | un seul | image `route-fond.jpg` au-dessus du rect |
| Lettrines « S6 », dates, filets, séparateurs | `carteSVG` | texte 32 / 15 px | courante, passée, à venir, brume | reste SVG |
| Chemins (pointillés d'encre ; parcouru : doré) | `carteSVG`, `courbe()` | traits 2,4 / 5 | pris, possible, pâle, hors, ordinaire | reste SVG |
| Bourg de départ | `carteSVG`, `image("lieu-france")` | 80 × 80 × 0,62 | un seul | déjà un sprite rendu : rien |
| Médaillon d'une halte | `carteSVG`, branche non gardien | rayon 24 (48) | atteignable (halo animé), avenir, hors, passée (35 %), brume (champ gris), jouée (+ sceau) ; icône par type ou événement, embuscade en rubrique | `halte-<type>`, `halte-ev-<ev>`, `halte-brume` |
| Médaillon du gardien / Grand Gardien | `medaillonGardien` → `EC.medaillonHeraldique` (portrait s'il existe) | rayon 34 (68) | gardien (tortil), grand (couronne du camp) ; portrait prioritaire | `gardien-<camp>`, `grand-<camp>` quand il n'y a pas de portrait |
| Halo d'or et borne de touche | `carteSVG` | r + 8 ; disque 11 | animé | reste SVG |
| Écusson de la porte | `ecussonPorte` | 22 ; à (x + 16, y + 12), gardien (x + 24, y + 20) | faveur (6 teintes de conseiller), bourse, parchemin, vivres ; rare : liseré argent + halo | `porte-<matière>`, `porte-bourse`, `porte-parchemin`, `porte-vivres` |
| Sceau de cire | `sceauHalte` | 32 (halte), 36 (gardien), 26 (année) | réussie / faite (cire bleue, lys), murs cédés (plomb, écu brisé) ; animation « sceau-pose » | `sceau-reussie`, `sceau-cedes` |
| Nappes de brume | `nappes` (ellipses + `lieu-brume`) | — | — | déjà un sprite rendu : rien |
| Bannière « Cette semaine » | `carteSVG`, `parcheminAnnee` | ruban 134 × 18 | texte dedans | reste SVG |
| Parchemin de l'année | `parcheminAnnee` | 1000 × 104, cases 27 × 34 | sans fond SVG (CSS `#e8dbb8`) | `annee-fond.jpg` sous les cases |
| Fenêtres (page de semaine, porte, cartes, bivouac, marchand, Armorial, bilan) | `.exp-fenetre` (CSS parchemin + filets) | 860 px de large au plus, hauteur libre | victoire : halo d'or | `cadre-page.png` en border-image (classe `cadre-image`) |
| Lettrine HTML de la page de semaine | `.lettrine-html` | 74 px | — | reste CSS |
| Écu de l'Armorial | `ecuArmorial` | viewBox 100 × 110 (72 au départ, 150 dans la fenêtre) | 5 quartiers, opacité selon le rang | `armorial-ecu` + 5 émaux `armorial-<quartier>` |
| Sacs de vivres | `sac(plein)` | 18 × 22 px | plein / vide | `compagnie-sac-plein`, `compagnie-sac-vide` |
| Or de route, plan de bataille, espion | `cartoucheCompagnie` (icône `tresor`, textes) | 20 px | — | `compagnie-or`, `compagnie-plan`, `compagnie-espion` (facultatif, en dernier) |
| Médaillon d'une faveur | `medaillonFaveur` | 34 (compagnie), 56 (carte) | rang 1 bronze, 2 argent, 3 or ; teinte de la matière | `faveur-<id>-<rang>` |
| Carte de faveur (fond, ruban de rang) | `.carte-faveur` | 190 × 230 px | rang | reste CSS |
| Carte « Partir en expédition » | ecran-campagne.js (icône `relais`), `.carte-jeu .ill-relais` | 100 % × 190 px (couverture) | partir / reprendre | `carte-expedition.jpg` en premier fond CSS |
| Écus du front, gardien de la page de semaine | `EC.medaillon` | 50 / 60 px | portraits existants | rien (le gardien de la page peut reprendre `gardien-<camp>`, option) |

## 3. Les images de la livraison : trois familles, 53 fichiers

Tous dans jeu/assets/images/expedition/, nom = identifiant du manifeste, fichier à 2 × la taille logique. Alpha = PNG à
fond transparent ; opaque = JPEG. Ancre : point de l'image que le jeu pose sur le point de l'écran (unités logiques
depuis le coin haut-gauche). Les compositions font deux lignes : objets ; matières, caméra, lumière. La caméra et la
lumière valent pour toute la famille sauf mention.

### 3.1 Famille « route » (script expedition_route.py) : fonds, cadre, carte de campagne, gardiens

| Fichier | Pixels | Alpha | Ancre | Composition | Accroche |
|---|---|---|---|---|---|
| route-fond.jpg | 2000 × 640 | opaque, ≤ 450 Ko | 0, 0 | Feuille de parchemin de 100 × 32 m, plan finement subdivisé déplacé par un bruit lent (ondulations de 5 cm qui accrochent le soleil), `mat_parchemin` grain 0,6 taches de 6 m ; `scene_dessus`, puis `patine(force 0,35)` : bords assombris irréguliers, grain fin, aucun texte, aucun dessin. | `carteSVG` : `<image class='fond' preserveAspectRatio='none'>` juste après le `<rect>` (qui reste dessous) |
| annee-fond.jpg | 2000 × 208 | opaque, ≤ 100 Ko | 0, 0 | La même feuille (recadrage d'une bande du rendu de route-fond, pas un second rendu), `patine` plus légère (0,25). | `parcheminAnnee` : `<image>` en premier enfant du SVG, sous les cases |
| cadre-page.png | 480 × 480 | alpha (coins), `coupe: 60` | 0, 0 | Feuille de parchemin 24 × 24 m vue de dessus ; cadre : filet d'encre extérieur, bande d'or de 0,5 m (`mat_or`, légèrement bombée), filet d'encre intérieur, à 3 m du bord, une perle d'or à chaque angle ; le centre reste du parchemin nu (tranche centrale de border-image, répétée). Tranches de 60 unités (120 px). | CSS `.exp-fenetre.cadre-image { border-image: url(...) 120 fill / 60px / 44px round }` ; la classe est posée par JS quand l'entrée existe |
| carte-expedition.jpg | 640 × 380 | opaque, ≤ 160 Ko | 0, 0 | Route de terre qui serpente vers le haut (bande de `dirt_aerial_02` sur un pré `aerial_grass_rock`), deux bornes de pierre, trois houppiers (campagne.houppier), un petit bourg de France au loin (campagne.bourg("france"), échelle 0,6) ; `scene_scene(320, 190, px_par_m 6, ancre_bas 20)`, exposition −0,1. Pas de ciel : la caméra ne voit que le sol. | CSS `.carte-jeu .ill-relais { background-image: url(expedition/carte-expedition.jpg), url(oeuvres/chasseur-chateau.jpg) }` (le second fond est le repli natif) |
| halte-brume.png | 128 × 128 | alpha | 32, 32 | Le cadre seul, champ gris `#9a927f` (`rendre_rondel(nom, [], parchemin=BRUME_CHAMP)`). Rendu par expedition_commun.py --essai, à garder tel quel. | branche brume de `carteSVG` |
| gardien-angleterre.png, gardien-omeyyades.png | 176 × 176 | alpha | 44, 44 | Écu en amande aux armes du camp (figurines.ecu_amande, 1,9 m) penché contre un poteau de bois, heaume d'acier posé sur le poteau (C.sphere + C.cylindre, `mat_metal`) ceint d'un tortil tressé aux deux couleurs du camp (deux tores), pennon du camp sur une courte hampe (C.drapeau, 1,2 × 0,7 m, `inverse` pour les Omeyyades) ; `scene_vignette(GARDIEN, rayon_sol 2,8)`, `rendre_rondel(…, taille GARDIEN, rayon_u R_GARDIEN)`. Omeyyades : casque conique à nasal plutôt que heaume (sphère étirée + cône). | `medaillonGardien` quand le gardien n'a pas de portrait |
| grand-angleterre.png, grand-omeyyades.png | 176 × 176 | alpha | 44, 44 | Même composition, écu plus grand (2,3 m), bannière entière (C.drapeau 2,2 × 1,4 m, épi d'or) à la place du pennon, un second écu plus petit à l'arrière ; pas de couronne ni d'emblème de pouvoir religieux. | idem, type `grand` |

### 3.2 Famille « haltes » (script expedition_haltes.py) : médaillons des haltes, écussons des portes, sceaux

Médaillons : 128 × 128, alpha, ancre 32, 32 ; `scene_vignette(rayon_sol=1.8)` puis `rendre_rondel(nom, objets)` ;
anneau or, champ `#f7efdc`. Objets dans 1,5 m de rayon, 2,5 m de haut.

| Fichier | Composition (objets ; matières) | Accroche |
|---|---|---|
| halte-escarmouche.png | Deux épées croisées plantées dans le champ (lames : boîtes aplaties `mat_metal`, gardes `mat_or_poli`, poignées `mat_cuir`), devant un bouclier rond de bois posé de biais (disque `mat_planches`, umbo d'acier). Aucune couleur de camp : c'est une escarmouche de route. | `carteSVG`, `h.type === "escarmouche"` |
| halte-embuscade.png | Fourré sombre (trois houppiers de campagne.houppier, verts sombres `#2f4423`), deux lances couchées en travers (hampes `mat_bois`, fers `mat_metal`), un pennon rubrique `#8c2f39` déchiré sur une hampe courte (`mat_toile` + drapeau sans emblème). | `h.type === "embuscade"` |
| halte-bivouac.png | Tente de toile (`tente`, 2,2 × 1,9 × 1,6 m, lacet −28°) et feu de camp devant à droite (`feu`, rayon 0,32), une bûche de réserve. | `h.type === "bivouac"` |
| halte-marchand.png | Étal : table sur deux tréteaux (`mat_planches`), auvent rayé sur deux poteaux (places.auvent + places.texture_rayee ocre `#b5772b` / ivoire), un sac (`sac`) et un petit tonneau (cylindre `mat_bois` cerclé de deux tores d'acier) sous la table. | `h.type === "marchand"` |
| halte-ev-marchands.png | Charrette à bras (caisse `mat_planches`, deux roues à rayons : disque + 8 boîtes, brancards) chargée de deux sacs et d'un coffre ferré (`mat_bois` + bandes `mat_metal`). | `h.type === "evenement" && h.ev === "marchands"` |
| halte-ev-defi.png | Pas d'armes : poteau de bois coiffé d'un heaume d'acier, deux lances croisées derrière, un écu de bois pendu au poteau. | `h.ev === "defi"` |
| halte-ev-mercenaires.png | Bouclier rond de bois posé droit, deux hallebardes croisées derrière (hampes + fers en boîtes biseautées), une bourse de cuir (`sac` petit, `mat_cuir`) devant. | `h.ev === "mercenaires"` |
| halte-ev-incendie.png | Grenier : boîte de `clay_plaster` ocre sur soubassement de pierre, toit de chaume (places.toit_deux_pans en `mat_toile` jaune paille `#c8b46a`), flammes (`mat_flamme`, trois sphères étirées) qui sortent du toit, deux bouffées de fumée (`mat_fumee`, sphères) ; pas de personnage. | `h.ev === "incendie"` |
| halte-ev-espion.png | Lanterne sourde (cage de boîtes `mat_metal` sombre, flamme dedans), lettre pliée au cachet de cire (boîte plate `mat_parchemin` + `sceau_cire` rayon 0,12), dague posée en travers. | `h.ev === "espion"` |
| halte-ev-archives.png | Pupitre incliné (`mat_bois`), livre ouvert dessus (deux boîtes plates `mat_parchemin`, tranche `mat_cuir`), deux rouleaux (`rouleau`) au pied, encrier (petit cylindre d'encre) avec plume (cône fin). | `h.ev === "archives"` |

Écussons des portes : 56 × 56, alpha, ancre 14, 14 ; `scene_vignette(PORTE, inclinaison 55, px_par_m 11, ancre (14, 21))` ;
`ecusson("porte", 1.5, 1.7, teinte, penche 14)` debout, liseré d'encre ; emblème en `plaque_icone` ivoire `#fff8e4`
(0,95 m, à y = −0,07, z = 0,42, penché 14°) ; `rendre_vignette(nom, objets, PORTE, contour 0.5)`, pas d'ombre.

| Fichier | Champ | Emblème (icône Game-icons) |
|---|---|---|
| porte-histoire.png | `#6b2d5c` | `chroniqueur` |
| porte-geographie.png | `#b5772b` | `routes` |
| porte-svt.png | `#4f6b32` | `remedes` |
| porte-physique.png | `#2f5a8a` | `alambics` |
| porte-litterature.png | `#7a4a2a` | `parchemin-plume` |
| porte-anglais.png | `#2a7470` | `alliances` |
| porte-bourse.png | `#7a5c1e` | `tresor` |
| porte-parchemin.png | `#6b2d5c` | `parchemins` |
| porte-vivres.png | `#4f6b32` | `recolte` |

Le liseré argent d'une porte rare reste au SVG (halo CSS `.porte-ecusson.rare`), l'image ne change pas.

Sceaux : 80 × 80, alpha, ancre 20, 20, diamètre de la cire 34 unités ; `scene_vignette(SCEAU, inclinaison 70)` ;
`sceau_cire("sceau", rayon 1.7, teintes, icone)` ; `rendre_vignette(nom, objets, SCEAU, contour 0.3)`.

| Fichier | Cire | Emblème |
|---|---|---|
| sceau-reussie.png | `CIRE_JOUEUR` (bleu de France) | `lys` |
| sceau-cedes.png | `CIRE_PLOMB` | `ecu-brise` |

### 3.3 Famille « faveurs » (script expedition_faveurs.py) : faveurs, compagnie, Armorial

Faveurs : 128 × 128, alpha, ancre 32, 32 ; `scene_vignette(rayon_sol=1.8)` ; `rendre_rondel(nom, objets, anneau,
parchemin=champ_teinte(MATIERES[matière]))` ; rang 1 = anneau `bronze`, rang 2 = `argent` (même scène rendue deux fois,
seul le cadre change : rendre le sprite une fois et composer deux cadres si l'on veut gagner du temps). Un ruban ou un
objet porte franchement la teinte de la matière.

| Fichiers | Matière | Composition |
|---|---|---|
| faveur-annales-1/2.png | histoire `#6b2d5c` | Livre d'annales ouvert (deux boîtes plates `mat_parchemin` sur une reliure `mat_cuir`), signet pourpre qui pend, plume d'oie plantée dans un encrier. |
| faveur-eclaireurs-1/2.png | géographie `#b5772b` | Carte déroulée à plat (plan `mat_parchemin` entre deux demi-rouleaux), compas de laiton ouvert dessus (`mat_or_poli`), cor de chasse ocre posé contre. |
| faveur-simples-1/2.png | SVT `#4f6b32` | Panier d'osier bas (cylindre `mat_bois` clair cerclé) débordant de brins verts (petites sphères et cônes `#4f6b32`, `#61793a`), fiole de verre bouchée (cylindre + sphère, `mat_simple` bleuté peu rugueux). |
| faveur-engrenages-1/2.png | physique-chimie `#2f5a8a` | Deux roues dentées qui s'engrènent, une de fer (`mat_metal`), une de bois (`mat_bois`), dents en boîtes autour du disque ; clé à écrou bleue posée devant. |
| faveur-ballade-1/2.png | littérature `#7a4a2a` | Luth (demi-sphère `mat_bois` roux, manche en boîte, quatre cordes en cylindres fins, chevillier replié) couché sur un rouleau de parchemin déroulé. |
| faveur-lettres-1/2.png | anglais `#2a7470` | Lettre pliée (boîte plate `mat_parchemin`) au cachet de cire sarcelle (`sceau_cire` rayon 0,14, teintes dérivées de `#2a7470`), pile de pièces d'or (`pile_pieces`, 6) à côté, ruban sarcelle. |

Compagnie : alpha ; `scene_vignette((w, h), inclinaison 45, px_par_m 12, ancre (w / 2, h − 2))` ; `rendre_vignette`,
ombre portée fine (`ombre=True`, force 0,4), contour 0,5.

| Fichier | Pixels | Ancre | Composition |
|---|---|---|---|
| compagnie-sac-plein.png | 48 × 56 | 12, 26 | `sac(rayon 0.9, hauteur 1.8)` jute `#c9b48a`, lien de cuir. |
| compagnie-sac-vide.png | 48 × 56 | 12, 26 | `sac(…, plein=False)` toile claire `#efe6d2`, affaissé. |
| compagnie-or.png | 48 × 48 | 12, 12 | `pile_pieces(7, rayon 0.6, epaisseur 0.12)`. |
| compagnie-plan.png | 48 × 48 | 12, 12 | `rouleau(1.6, 0.22)` au ruban rubrique, lacet −20°. |
| compagnie-espion.png | 48 × 48 | 12, 12 | Lanterne sourde fermée (cage `mat_metal` sombre, flamme à peine visible par la fente). |

Armorial : 200 × 220, alpha, ancre 0, 0 (viewBox 100 × 110 du SVG) ; `scene_vignette((100, 110), inclinaison 12,
px_par_m 10, ancre (50, 104))` (vue de face) ; écu de 8,8 × 9,6 m debout (`ecusson` sans liseré, champ `mat_parchemin`,
bordure : bande d'or de 0,4 m suivant le contour, trait d'encre), les séparations des quartiers en fins cylindres
d'encre couchés sur le champ ; cinq plaques d'émail (`mat_teinte` de la couleur du quartier, 3 cm d'épaisseur) découpées
aux formes de `QUARTIERS_ECU` (carrés haut gauche et haut droit, demi-écus bas gauche et bas droit, losange central).

| Fichier | Contenu |
|---|---|
| armorial-ecu.png | l'écu seul : champ, bordure d'or, traits des quartiers (les plaques cachées) |
| armorial-vivres.png, armorial-bourse.png, armorial-murs.png, armorial-banniere.png, armorial-ouverture.png | une plaque d'émail seule, les autres et l'écu cachés (`visible_camera = False`), même caméra : le jeu les superpose à l'écu avec l'opacité du rang |

## 4. Le module commun : expedition_commun.py (ce que les trois scripts utilisent)

Lancement : `cd /home/user/Test && python3 atelier/outils/rendu-3d/expedition_<famille>.py` (python3 du système ; le
module bpy est dans /tmp/bpy-env, mis sur sys.path par commun.py). `--essai` du module commun rend le cadre, halte-brume
et la planche de la famille route : c'est le test de bout en bout, fait le 25/10/2026 (cadre 3,2 s, médaillon vide, 13 Ko).

Constantes : palette (FOND, ENCRE, OR, OR_CLAIR, OR_SOMBRE, RUBRIQUE, PLOMB, PARCHEMIN_CLAIR, PARCHEMIN, PARCHEMIN_SOMBRE,
BRUME_CHAMP, OR_METAL, BRONZE, ARGENT, CIRE_JOUEUR, CIRE_PLOMB, TOILE, JUTE, CUIR, BOIS, OMBRE_PARCHEMIN, MATIERES,
FAMILLE_MATIERE, PORTES, ARMORIAL, ANNEAUX) ; tailles (PX_PAR_M 10, VIGNETTE 64, R_HALTE 24, GARDIEN 88, R_GARDIEN 34,
SCEAU 40, D_SCEAU 34, PORTE 28, INCLINAISON 45, OBJET_RAYON_MAX 1,5, OBJET_HAUTEUR_MAX 2,5, SURECH 2, BANDE_CADRE 6) ;
chemins (DOSSIER, MANIFESTE, PREFIXE_SRC, CAPTURES) ; budget (BUDGET_TOTAL 3 000 000, MAX_FICHIER 600 000) ; CATALOGUE
(toutes les images : famille, w, h, ax, ay, format, description), `catalogue(famille)`, `manquants(famille)`.

Matières : `mat_parchemin(nom, teinte, grain, echelle)`, `mat_encre`, `mat_teinte(nom, teinte)`, `mat_or`, `mat_or_poli`,
`mat_bronze`, `mat_argent`, `mat_plomb`, `mat_anneau(anneau)`, `mat_cire(nom, teintes, relief_png)`, `mat_bois`,
`mat_planches`, `mat_toile(nom, teinte, rayures_png)`, `mat_cuir`, `mat_pierre`, `mat_flamme`, `mat_fumee`, `mat_plaque`,
`champ_teinte(teinte, part)`.

Formes : `tore`, `disque`, `perles`, `contour_ecu`, `ecusson(nom, largeur, hauteur, teinte, …)`, `plaque_icone(nom, icone,
largeur, teinte, dresse, penche)`, `icone_png`, `sac`, `rouleau`, `pile_pieces`, `tente`, `feu`, `sceau_cire`, `rondel`.
Et tout commun.py : `boite`, `cylindre`, `cone`, `sphere`, `biseau`, `drapeau`, `tenture`, `mat_metal`, `mat_ph`, `pivot` ;
figurines.ecu_amande / ecu_rond ; places.auvent, texture_rayee, toit_deux_pans ; campagne.houppier, bourg.

Scènes : `scene_vignette(taille, inclinaison, px_par_m, surech, rayon_sol, appoint, ancre)`, `scene_dessus(largeur_m,
hauteur_m, W, H)`, `scene_scene(w, h, px_par_m, ancre_bas, inclinaison)`, `sol_capteur_disque`.

Rendu : `cadre_rondel(anneau, taille, rayon_u, parchemin)` (cache atelier/sources-3d/_cache/rondel-*.png), `rendre_rondel(nom,
objets, anneau, taille, rayon_u, parchemin, …)`, `rendre_vignette(nom, objets, taille, ombre, contour)`, `rendre_opaque(nom)`,
`patine(img, force)`, `masque_disque`.

Enregistrement : `controler(img, nom)` (bords + blancs), `sauver(nom, img, w, h, ax, ay, jpg, max_ko, extra)` (PNG
optimisé, 256 couleurs au-delà de 160 Ko, JPEG sous max_ko ; refus au-dessus de 600 Ko ; met le manifeste à jour ; les
tailles et l'ancre viennent du CATALOGUE si l'identifiant y est), `lire_manifeste`, `maj_manifeste`, `budget`,
`verifier_budget()` (à appeler à la fin de chaque script : refus au-dessus de 3 Mo), `planche(famille)` →
atelier/captures/planche-expedition-<famille>.png (chaque image à 0,5, 0,75 et 1, identifiant, taille, ancre, poids,
images manquantes).

Squelette d'un script de famille :

```python
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import expedition_commun as E
import commun as C

def halte_bivouac():
    E.scene_vignette(rayon_sol=1.8)
    objets = E.tente("tente", 2.2, 1.9, 1.6, loc=(-0.3, 0.4, 0), lacet=-28) + E.feu("feu", loc=(0.9, -0.7, 0), rayon=0.32)
    E.sauver("halte-bivouac", E.rendre_rondel("halte-bivouac", objets))

def main(args):
    quoi = args or ["tout"]
    if "tout" in quoi or "bivouac" in quoi: halte_bivouac()
    E.planche("haltes")
    E.verifier_budget()

if __name__ == "__main__":
    main(sys.argv[1:])
```

Règles des scripts : RENDU_ESSAI=1 dans l'environnement transforme les refus en avertissements (mise au point seulement) ;
échantillons 48 pour un médaillon (64 pour un gardien, 32 pour un écusson) ; un script accepte le nom d'une image en
argument pour ne rendre qu'elle ; chaque script finit par `planche` et `verifier_budget` ; on regarde la planche avant
de livrer ; aucun identifiant de modèle ni nom d'éditeur dans les fichiers ; commentaires en français, phrases courtes.

## 5. Contrat d'intégration (ecran-expedition.js, ecran-campagne.js, jeu.css, index.html, crédits)

1. **Manifeste** : jeu/assets/images/expedition/images.js déclare `JEU.imagesExpedition = { id: { f, w, h, ax, ay } }`
   (f relatif à jeu/, w h ax ay en unités logiques, fichier à 2 ×, `coupe` en plus pour cadre-page). index.html le charge
   juste après `assets/images/td/sprites.js` : `<script src="assets/images/expedition/images.js"></script>`. S'il manque,
   `JEU.imagesExpedition` est indéfini et tout reste en SVG.
2. **Accès** dans ecran-expedition.js :
   ```js
   function imageExp(id) { var m = JEU.imagesExpedition, e = m && m[id]; return e && e.f ? e : null; }
   function imgSVG(e, cx, cy, k, extra) { k = k || 1; return "<image href='" + e.f + "' x='" + (cx - e.ax * k) + "' y='" + (cy - e.ay * k) + "' width='" + (e.w * k) + "' height='" + (e.h * k) + "'" + (extra || "") + "/>"; }
   ```
3. **Repli** : dans le SVG, le dessin actuel est toujours émis, et l'image est posée par-dessus quand l'entrée existe ;
   le cercle du cadre couvre exactement le cercle du SVG. `surveillerImages` retire déjà une `<image>` qui ne se charge
   pas : le SVG réapparaît. En HTML (`<img>` des faveurs et des sacs), un gestionnaire `error` remet le médaillon CSS
   (comme `surveillerPortraits`). En CSS, deux fonds (`url(expedition), url(repli)`) ou une classe posée par JS.
4. **Accroches**, dans l'ordre d'importance :
   - `carteSVG` : après le `<rect>` de fond, `imgSVG(imageExp("route-fond"), 0, 0, 1, " preserveAspectRatio='none' class='fond'")` ;
   - haltes : dans le `<g class='corps'>` d'une halte non gardien, après les cercles et l'icône, `imgSVG(e, x, y)` avec
     `e = imageExp(brume ? "halte-brume" : h.type === "evenement" ? "halte-ev-" + h.ev : "halte-" + h.type)` ; l'opacité
     des états (hors, passée, brume) s'applique au groupe, donc à l'image ; le halo, la borne de touche, l'écusson et le
     sceau viennent après, comme aujourd'hui ;
   - `medaillonGardien` : sans portrait, `imageExp((nd.type === "grand" ? "grand-" : "gardien-") + camp)` → `imgSVG(e, nd.x, nd.y)`
     par-dessus le médaillon héraldique ;
   - `ecussonPorte` : `imageExp(porte.genre === "faveur" ? "porte-" + (MATIERE_FAMILLE[porte.conseiller] || "histoire") : "porte-" + porte.genre)`
     → `imgSVG(e, x, y)` dans le groupe `porte-ecusson`, après le `<path>` ; le halo de la porte rare passe de
     `path:first-child` à `> :first-child` ;
   - `sceauHalte` : `imageExp(echoue ? "sceau-cedes" : "sceau-reussie")` → `imgSVG(e, x, y, taille / 34)` dans le groupe
     `sceau-halte` (la rotation et l'animation CSS restent), aussi pour les cases franchies du parchemin de l'année ;
   - `parcheminAnnee` : `imgSVG(imageExp("annee-fond"), 0, 0, 1, " preserveAspectRatio='none'")` en premier enfant ;
   - `medaillonFaveur(c, taille)` : `imageExp("faveur-" + c.id + "-" + Math.min(c.rang, 2))` → `<span class='faveur-med image'><img src=… width=taille height=taille alt='' draggable='false'></span>`,
     CSS `.faveur-med.image { background: none; box-shadow: none }` ; rang 3 (hors MVP) garde le CSS ;
   - `ecuArmorial` : si `imageExp("armorial-ecu")`, après les chemins SVG : `<image href=écu x='0' y='0' width='100' height='110'/>`
     puis, par quartier, `<image href=armorial-<q> … opacity='…'/>` avec la même opacité que le `<path>` (0,08 sans rang) ;
   - `sac(plein)` : `<img class='sac' src=… width='18' height='22'>` si l'entrée existe, sinon le SVG ;
   - fenêtres : `cadreEcran` et `rendreBilan`, `rendreArmorial`, `rendreDepart` ajoutent la classe `cadre-image` à `.exp-fenetre`
     quand `imageExp("cadre-page")` existe ; CSS :
     `.exp-fenetre.cadre-image { border: 60px solid transparent; border-image: url("../assets/images/expedition/cadre-page.png") 120 fill / 60px / 44px round; box-shadow: 0 14px 30px rgba(0,0,0,.45); padding: .4rem .8rem .6rem; }`
     (le cadre déborde de 44 px vers l'extérieur ; vérifier en 1366 × 768 que la carte des faveurs tient : perf.js) ;
   - carte de campagne : `.carte-jeu .ill-relais { background-image: url("../assets/images/expedition/carte-expedition.jpg"), url("../assets/images/oeuvres/chasseur-chateau.jpg"); }`.
5. **Performance** : rien de nouveau entre une réponse et la question suivante (l'écran de la route n'est pas affiché
   pendant une partie) ; le SVG de la route est reconstruit comme avant au retour sur l'écran ; les images sont mises en
   cache par le navigateur ; pas de filtre SVG ajouté sur les images (le `filter='url(#ombreR)'` existant du groupe
   `corps` suffit) ; perf.js rejoue la passe « expédition » après intégration.
6. **Crédits** : jeu/CREDITS.md, rubrique « Images rendues en 3D » : ajouter `assets/images/expedition/` (rendues par
   atelier/outils/rendu-3d/expedition_*.py, CC0 1.0 ; parchemins, cadres, médaillons, sceaux, écussons, objets modélisés
   par programme) ; rubrique « Icônes » : préciser que des tracés Game-icons (CC BY 3.0) sont adaptés en relief dans les
   sceaux, les écussons des portes et certains emblèmes. atelier/sources-3d/SOURCES.md : rien à ajouter tant qu'aucune
   source nouvelle n'est téléchargée (rough_wood, weathered_planks, yellow_stone_wall, clay_plaster, dirt_aerial_02,
   aerial_grass_rock y sont déjà).
7. **Contrôles avant livraison** : `node atelier/outils/tests.js` (345 réussis au 25/10/2026) et `node atelier/outils/valider.js`
   (0 erreur, 5 alertes connues de sources non déposées) ; `python3 atelier/outils/rendu-3d/expedition_commun.py --manquants`
   doit répondre « rien » pour les trois familles (sauf les images facultatives de la compagnie, à signaler) ;
   `--planche` regénère les trois planches ; budget sous 3 Mo ; ligne dans docs/JOURNAL.md ; le numéro de version
   (0.9.1) est posé par l'orchestrateur à la livraison.

## 6. Répartition et ordre de travail des trois rendeurs

| Script | Images | Ordre conseillé | Points d'attention |
|---|---|---|---|
| expedition_route.py | route-fond, annee-fond, cadre-page, carte-expedition, (halte-brume déjà rendu), gardien × 2, grand × 2 | route-fond d'abord (le plus vu), puis les gardiens, le cadre de page, la carte | Le parchemin de route reste calme : ni dessin ni texte, les filets et lettrines SVG se posent dessus ; vérifier le poids JPEG ; les gardiens ne portent aucun emblème de pouvoir religieux ; pour la carte de campagne, aucun personnage |
| expedition_haltes.py | 10 médaillons, 9 écussons, 2 sceaux | escarmouche, bivouac, marchand, embuscade, puis les événements, puis écussons et sceaux | Un objet par médaillon, lisible à 0,5 sur la planche ; l'embuscade porte le rubrique ; pas de figurine humaine dans les médaillons |
| expedition_faveurs.py | 12 faveurs, 5 compagnie, 6 Armorial | faveurs (rang 1 puis 2 : même sprite, cadre différent), Armorial, compagnie en dernier | La teinte de la matière doit se voir à 34 px ; l'Armorial : même caméra pour les six rendus, plaques cachées une à une |

Décisions prises ici faute d'arbitrage dans le cahier (à reporter dans docs/JOURNAL.md, rubrique Décisions) :
1. Le cadre est rendu de dessus et l'objet de trois quarts, puis composés : c'est le seul moyen d'avoir un cercle parfait
   à la place du cercle du SVG (un rondel vu de trois quarts serait une ellipse qui ne couvrirait pas le repli) et un
   cadre identique au pixel près pour tous les médaillons.
2. Les faveurs ont une image par rang (bronze, argent) plutôt qu'un cerclage CSS autour d'une image : un anneau rendu
   dans un anneau CSS ferait deux cercles.
3. L'écu de l'Armorial est livré en six couches (écu + cinq émaux) pour garder l'opacité par rang du SVG.
4. Le cadre des fenêtres passe par border-image (une classe posée par JS) : une seule image habille toutes les fenêtres
   de hauteur variable (page de semaine, bilan, porte, bivouac, marchand, Armorial).
5. Restent en SVG ou CSS : textes, chemins, halo, borne de touche, bannière « Cette semaine », lettrine HTML, fond des
   cartes de faveurs, nappes de brume et bourg de départ (déjà des sprites rendus).
