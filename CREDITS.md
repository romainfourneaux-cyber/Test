# Crédits

## Polices (SIL Open Font License 1.1)

- **Cinzel**, © 2020 The Cinzel Project Authors (https://github.com/NDISCOVER/Cinzel). Fichiers `assets/polices/cinzel-latin-*.woff2`, licence complète dans `assets/polices/OFL-Cinzel.txt`.
- **Crimson Text**, © 2010 The Crimson Text Project Authors (https://github.com/googlefonts/Crimson). Fichiers `assets/polices/crimson-text-latin-*.woff2`, licence complète dans `assets/polices/OFL-CrimsonText.txt`.
- Fichiers woff2 issus des paquets Fontsource (@fontsource/cinzel 5.0.13, @fontsource/crimson-text 5.0.13). Police de repli : Georgia.

## Sons (CC0, domaine public)

- `assets/sons/*.wav` (coup, coup puissant, sceau, construction, validation, erreur) : sons synthétisés pour ce jeu par `atelier/outils/generer-sons.js`, versés au domaine public (CC0 1.0).
- Musique d'ambiance (humeurs « paix » et « guerre » : bourdon, flûte, luth, tambour) : composée pour ce jeu et jouée par le navigateur (Web Audio, `js/musique.js`), sans fichier son. Domaine public (CC0 1.0).

## Icônes (CC BY 3.0)

- **Game-icons.net**, licence Creative Commons Attribution 3.0 (https://creativecommons.org/licenses/by/3.0/). Site : https://game-icons.net. Fichier `assets/icones/game-icons.js` : 84 entrées tirées de 77 icônes (ressources, menu, unités, bâtiments, campagne, conseil, événements, terrains, emblèmes lys, lion et tour), extraites du paquet @iconify-json/game-icons 1.2.4, sans modification de dessin (seules la couleur et la taille changent à l'affichage). Liste des entrées : `atelier/outils/icones-choisies.json`.
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
- Fond de carte `assets/images/terrain-domaine.jpg` (relief, champs, forêts, rivière) : peint par programme pour ce jeu, `atelier/outils/generer-terrain.py` (CC0 1.0).
- Images en 3D de `assets/images/td/` et `assets/images/campagne/` (places fortes, tours, troupes, terrains ; liste dans `assets/images/td/sprites.js`) : rendues pour ce jeu avec Blender par les scripts de `atelier/outils/rendu-3d/` (CC0 1.0). Personnages, chevaux, châteaux, tours, engins, ponts, eau et relief sont modélisés par ces scripts. Matières et modèles d'appoint de **Poly Haven** (https://polyhaven.com), domaine public (CC0 1.0), crédités quand même :
  - textures de Rob Tuytel, Amal Kumar, Charlotte Baglioni, Rico Cilliers, Dimitrios Savva, Sơn Nguyễn et Dario Barresi (herbe, terre, boue, rivière, sol de forêt, pierres des châteaux, toits, bois) ;
  - modèles de Rico Cilliers et Rob Tuytel (arbres, buissons), Kless Gyzen (rochers moussus) et Ulan Cabanilla (forme de l'écu).
  - Liste complète, avec le nom et la page de chaque source : `atelier/sources-3d/SOURCES.md`, écrit par `atelier/outils/rendu-3d/telecharger_sources.py`. Les emblèmes des blasons (lys, lion, tour) viennent de Game-icons (voir plus haut).
- Blasons, bannières, effets du champ de bataille, plan du domaine, carte de campagne, médaillon du chroniqueur et schémas des fiches : dessinés en SVG ou sur une toile (canvas) pour ce jeu (CC0 1.0). Les emblèmes lys, lion et tour viennent de Game-icons (voir plus haut). Les champs de bataille utilisent le fond de carte `terrain-domaine.jpg` ci-dessus. Aucune image n'est reprise des livrets des Cours Griffon : les schémas sont redessinés, avec des valeurs inventées.
- Pas encore de carte Natural Earth (prévue au jalon 2) : elle sera créditée ici.

## Contenu

- Fiches et questions reformulées à partir des documents des Cours Griffon déposés par la famille (fiches méthode, liste du matériel de TP). La source (fichier et page) est indiquée sur chaque fiche et chaque question.
- Fiches bonus : sources indiquées sur chaque fiche (Wikipédia, l'encyclopédie libre).
