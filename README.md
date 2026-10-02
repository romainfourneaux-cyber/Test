# Grotte de sel — Aquensis (travaux intersaison 2026)

Maquette 3D interactive de la future grotte de sel, construite à partir du SketchUp `model/grotte_de_sel1.skp`,
avec le mobilier Cèdre & Rondins, les panneaux infrarouges (Fenix ECOSUN, comparés à d'autres modèles), les mains courantes, les deux murs de sel
rétro-éclairés, un contrôle automatique des dégagements et une simulation de circulation des curistes.

![Vue d'ensemble](docs/captures/ensemble.jpg)

## Ouvrir la maquette (Windows)

1. Sur GitHub : bouton vert **Code → Download ZIP**, puis clic droit sur le ZIP → **Extraire tout**.
2. Double-cliquer sur `index.html` (Edge ou Chrome). Tout fonctionne hors ligne (Three.js est inclus dans `js/vendor`).

Commandes : glisser = tourner, molette = zoom, clic droit = déplacer, clic sur un objet = nom, dimensions et
coordonnées X/Y/Z dans le repère SketchUp.

| Vue | Contenu |
|---|---|
| ![Plan](docs/captures/plan.jpg) | **Plan** : implantation vue de dessus |
| ![Dégagements](docs/captures/degagements.jpg) | **Carte des dégagements** : rouge < 0,90 m, orange 0,90–1,40 m, vert ≥ 1,40 m |
| ![Escalier](docs/captures/escalier.jpg) | **Escalier** : 2 marches, avancée de 0,73 m, mains courantes, porte du frigidarium |
| ![Grotte](docs/captures/grotte.jpg) | **Partie basse** : murs de sel rétro-éclairés, canapés B6 KD, radiants |

## Ce que fait la maquette

- **Géométrie** : lue directement dans le `.skp` (447 sommets, 734 arêtes, 280 faces) par `tools/skp_extract.py`.
- **Textures** : moellons gris-bleu à joints orangés, plafond plat en lames de bois sur solives (grotte), dallage pierre, chape sombre,
  croûte de sel blanche (voûte de la salle 2, d'après les photos), briques de sel de l'Himalaya rétro-éclairées.
- **Équipements** (`js/layout.js`, d'après le plan annoté `docs/plan_annote.jpg`) : salle haute avec 6 chaises longues
  B17 et 4 fauteuils B4A KD ; partie basse avec 4 canapés B6 KD et les 2 murs de sel (nord et sud) ; 2 bancs B20B dans
  l'alcôve ; 6 radiants au choix (menu « Radiants infrarouges » : Fenix ECOSUN 600 U par défaut, voir docs/RADIANTS_IR.md) avec leur volume de sécurité
  (vert = conforme, rouge = non conforme) ; 2 mains courantes inox à 0,90 m.
- **Locaux** : grotte de sel chaude et sèche = salle haute + partie basse ; frigidarium froid et humide derrière la porte
  vitrée de 0,80 m (vue rivière).
- **Simulation** : bouton **Séance** — arrivée par la double porte du pignon ouest (seule porte de circulation),
  chacun rejoint sa place, séance (radiants allumés), sortie. Les places sans chemin d'accès restent vides.
  Bouton **Évacuation** — tout le monde rejoint la sortie, avec le temps mesuré.
- **Contrôles** : liste OK / NOK / à voir dans le panneau, imprimable en A4 (bouton « Imprimer les contrôles »).
  Résumé dans [docs/CONTROLES.md](docs/CONTROLES.md).

## Modifier l'aménagement

Tout se règle dans **`js/layout.js`** (Bloc-notes suffit) : position `x`, `y` en mm dans le repère SketchUp,
orientation `rot` en degrés, liste des murs de sel éclairés, modèle de radiant (irModele), plafonds.
Recharger la page (F5) : les contrôles se recalculent.

Si le SketchUp change, régénérer la géométrie (Python 3 installé) :

```
py tools\skp_extract.py model\grotte_de_sel1.skp js\model-data.js
```

## Hypothèses à confirmer sur place

- **Profondeur de la partie basse** : 1,77 m dans le SketchUp, alors que le plan papier (cotes 1,55 / 2,25) semble en
  supposer davantage. Ça décide si les 4 canapés B6 KD tiennent.
- **Voûte du frigidarium** : non dessinée dans le SketchUp, prise d'après les photos (berceau naissant au sol, clé 2,50 m).
- **Positions exactes** : les meubles et les lampes IR sont reportés depuis une photo en perspective du plan ; à ajuster
  dans `js/layout.js` si besoin.

## Arborescence

```
index.html              visionneuse (ouvrir ce fichier)
js/layout.js            aménagement modifiable
js/app.js               scène, contrôles, simulation
js/furniture.js         mobilier paramétrique + radiant
js/textures.js          textures procédurales
js/model-data.js        géométrie extraite du .skp (générée)
tools/skp_extract.py    extracteur SketchUp -> JS
model/                  fichier SketchUp source
docs/photos/            photos du chantier
docs/references/        notice Trotec IR 1500 SC (FR)
docs/CONTROLES.md       synthèse des contrôles
docs/RADIANTS_IR.md     comparatif des radiants infrarouges
js/ir-models.js         caractéristiques des radiants (notices)
docs/plan_annote.jpg    plan annoté à la main (référence de l'aménagement)
```
