# Crédits

## Polices (SIL Open Font License 1.1)

- **Cinzel**, © 2020 The Cinzel Project Authors (https://github.com/NDISCOVER/Cinzel). Fichiers `assets/polices/cinzel-latin-*.woff2`, licence complète dans `assets/polices/OFL-Cinzel.txt`.
- **Crimson Text**, © 2010 The Crimson Text Project Authors (https://github.com/googlefonts/Crimson). Fichiers `assets/polices/crimson-text-latin-*.woff2`, licence complète dans `assets/polices/OFL-CrimsonText.txt`.
- Fichiers woff2 issus des paquets Fontsource (@fontsource/cinzel 5.0.13, @fontsource/crimson-text 5.0.13). Police de repli : Georgia.

## Sons (CC0, domaine public)

- `assets/sons/*.wav` (coup, coup puissant, sceau, construction, validation, erreur) : sons synthétisés pour ce jeu par `atelier/outils/generer-sons.js`, versés au domaine public (CC0 1.0).
- Musique d'ambiance (humeurs « paix » et « guerre » : bourdon, flûte, luth, tambour) : composée pour ce jeu et jouée par le navigateur (Web Audio, `js/musique.js`), sans fichier son. Domaine public (CC0 1.0).

## Icônes (CC BY 3.0)

- **Game-icons.net**, licence Creative Commons Attribution 3.0 (https://creativecommons.org/licenses/by/3.0/). Site : https://game-icons.net. Fichier `assets/icones/game-icons.js` : 84 entrées tirées de 77 icônes (ressources, menu, unités, bâtiments, campagne, conseil, événements, terrains, emblèmes lys, lion et tour), extraites du paquet @iconify-json/game-icons 1.2.4, sans modification de dessin (seules la couleur et la taille changent à l'affichage), sauf les emblèmes adaptés pour les images 3D (voir plus bas). Liste des entrées : `atelier/outils/icones-choisies.json`.
- Auteurs des icônes utilisées :
  - **Lorc** (34 icônes, dont castle, crown, king, lion, scales, stone-tower, book-cover, bowman, crossed-swords, wax-seal) ;
  - **Delapouite** (38 icônes, dont fleur-de-lys, throne-king, spy, pikeman, farmer, village, watchtower, two-coins) ;
  - **Sbed** : fire ;
  - **Cathelineau** : swordman ;
  - **Skoll** : mounted-knight ;
  - **HeavenlyDog** : catapult ;
  - **DarkZaitzev** : hooded-figure.

## Œuvres du domaine public (CC0)

Images du programme Open Access du Metropolitan Museum of Art (New York), versées au domaine public (Creative Commons Zero). Recadrées et réduites pour le jeu.

- `assets/images/oeuvres/tapisserie-cerf.jpg, millefleurs.jpg (détail)` : « The Stag at Bay (From Incidents in a Stag Hunt) », artiste inconnu, ca. 1495–1515. The Metropolitan Museum of Art, objet 468097, Bequest of Helen Hay Whitney, 1944. https://www.metmuseum.org/art/collection/search/468097
- `assets/images/oeuvres/chasseur-chateau.jpg` : « A Hunter Returning to a Castle (From Incidents in a Stag Hunt) », artiste inconnu, ca. 1495–1515. The Metropolitan Museum of Art, objet 468100, Bequest of Helen Hay Whitney, 1944. https://www.metmuseum.org/art/collection/search/468100
- `assets/images/oeuvres/chasse-faucon.jpg` : « The Falcon Hunt », artiste inconnu, ca. 1500–1530. The Metropolitan Museum of Art, objet 459953, Robert Lehman Collection, 1975. https://www.metmuseum.org/art/collection/search/459953
- `assets/images/oeuvres/chevalier-or.jpg` : « Ornamental Plaque of a Knight on Horseback », artiste inconnu, ca. 1300. The Metropolitan Museum of Art, objet 23346, Bashford Dean Memorial Collection, Funds from various donors, 1929. https://www.metmuseum.org/art/collection/search/23346
- `assets/images/oeuvres/bataille-cavalerie.jpg` : « A Cavalry Engagement », Adam Frans van der Meulen, date non indiquée. The Metropolitan Museum of Art, objet 437074, Purchase, 1871. https://www.metmuseum.org/art/collection/search/437074

## Images, textures, blasons, décors

- Textures `assets/images/parchemin.png`, `cuir.png`, `bois.png` : bruit procédural généré pour ce jeu par `atelier/outils/generer-textures.py` (CC0 1.0).
- Fond de carte `assets/images/terrain-domaine.jpg` (relief, champs, forêts, rivière) : peint par programme pour ce jeu, `atelier/outils/generer-terrain.py` (CC0 1.0). Il sert au plan du domaine, et de repli au champ de bataille et à la carte de campagne si leurs images 3D manquent.
- Blasons, bannières de l'interface, plan du domaine, médaillon du chroniqueur, marques des emplacements de tours, marques au sol des troupes, écus des jauges, éclat de lumière des coups portés et schémas des fiches : dessinés en SVG ou sur une toile (canvas) pour ce jeu (CC0 1.0). Les emblèmes lys, lion et tour de l'interface viennent de Game-icons (voir plus haut). L'ancien dessin vectoriel du champ de bataille (châteaux, tours, troupes, route, ponts, effets) reste dans le jeu comme repli, si une image 3D manque. Aucune image n'est reprise des livrets des Cours Griffon : les schémas sont redessinés, avec des valeurs inventées.
- Pas encore de carte Natural Earth (prévue au jalon 2) : elle sera créditée ici.

### Images rendues en 3D (champ de bataille et carte de campagne)

- **Images de `assets/images/td/` et `assets/images/campagne/`** (terrains, places fortes, tours, troupes, effets, carte de campagne, lieux, ombres portées ; liste, tailles et points d'ancrage dans `assets/images/td/sprites.js`) : rendues avec Blender (moteur Cycles) pour ce jeu, à partir de scènes construites par les scripts de `atelier/outils/rendu-3d/`. Licence **CC0 1.0** (domaine public). Personnages, chevaux, châteaux, tours, engins, ponts, joncs, eau et relief sont modélisés par ces scripts ; la nappe de brume des lieux pas encore ouverts (`lieu-brume.png`) et l'aire de terre sous les bourgs sont dessinées par programme par les mêmes scripts (CC0 1.0).
- **Textures et modèles 3D de Poly Haven** (https://polyhaven.com), licence **CC0 1.0** (domaine public), crédités quand même ; ils servent de matière première aux rendus :
  - textures `aerial_grass_rock`, `rocky_terrain_02`, `leafy_grass`, `dirt_aerial_02`, `brown_mud`, `river_small_rocks`, `forest_ground_04`, `castle_wall_slates`, `castle_wall_varriation`, `rustic_stone_wall`, `yellow_stone_wall`, `clay_plaster`, `roof_slates_02`, `clay_roof_tiles`, `weathered_planks`, `medieval_wood`, `rough_wood`, `cobblestone_01` ;
  - modèles `tree_small_02`, `island_tree_02`, `shrub_04`, `rock_moss_set_01` ;
  - auteurs : Rob Tuytel, Rico Cilliers, Amal Kumar, Charlotte Baglioni, Dimitrios Savva, Sơn Nguyễn, Dario Barresi, Kless Gyzen ;
  - le modèle `kite_shield` (Ulan Cabanilla) a servi de référence de forme seulement : il n'entre dans aucune image ;
  - liste complète (identifiants, adresses, usages) : `atelier/sources-3d/SOURCES.md`, écrit par `atelier/outils/rendu-3d/telecharger_sources.py`.
- **Emblèmes adaptés de Game-icons.net**, licence Creative Commons Attribution 3.0 (https://creativecommons.org/licenses/by/3.0/) : la fleur de lys (« fleur-de-lys », par **Delapouite**) et la tour (« stone-tower », par **Lorc**) ont été recolorées, cernées et plaquées sur les bannières, tentures, écus, surcots, housses et caparaçons rendus en 3D. Ce sont des **adaptations** des dessins d'origine.
- **Lion passant gardant** des armes d'Angleterre sur les images 3D : dessiné pour ce jeu (`commun.masque_lion`, CC0 1.0) ; il ne reprend pas l'icône « lion » de Game-icons.

## Contenu

- Fiches et questions reformulées à partir des documents des Cours Griffon déposés par la famille (fiches méthode, liste du matériel de TP). La source (fichier et page) est indiquée sur chaque fiche et chaque question.
- Fiches bonus : sources indiquées sur chaque fiche (Wikipédia, l'encyclopédie libre).
