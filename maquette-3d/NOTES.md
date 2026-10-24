# Maquette 3D — extension (escalier / WC) — notes de travail

Visuel d'architecte **non coté** de l'extension à étage (plan PDF du 13 avril 2026, éch. 1/100).
Enduit **Weber 001 blanc cassé**, menuiseries **RAL 7016 anthracite**, tous les murs **doublés placo**
(doublage isolant 10 cm + BA13 sur les murs extérieurs, cloisons placo 72/48 à l'intérieur).
Zone d'attention : **escalier quart-tournant MÉTALLIQUE (acier RAL 7016) + jonction avec le WC du RDC et raccord avec les placos**.

Sols (demande client) : carrelage dans les couloirs (dégagement, sas, palier étage), la SdB et le WC ; parquet dans les chambres
(et le dressing). Déjà fait dans building.js.

## Lancer un rendu

```bash
cd /home/user/Test/maquette-3d
node tools/render.mjs --views coupe-escalier,int-wc --w 1400 --h 950 --out renders/_moi
# caméra libre (px,py,pz,tx,ty,tz,fov) + plans de coupe optionnels "nx,ny,nz,c" (on garde n·p + c >= 0)
node tools/render.mjs --cam "6,3,9,4.5,1.5,0.8,45" --clip "0,0,-1,2.17" --name test --out renders/_moi
```
Vues prédéfinies (src/app.js, `VIEWS`) : `ext-ouest`, `ext-est`, `axo-rdc`, `coupe-escalier`, `etage`,
`int-degagement`, `int-wc`, `detail-raccord` (coupe x = 6.31 sur une fixation du limon mural).
`--page render-dev.html` rend une autre page hôte ; `--callouts` écrit les repères projetés (si app.projectCallouts existe). Un rendu prend 10–30 s (WebGL logiciel). Regarder les PNG avec l'outil Read.
`--noao` désactive l'occlusion ambiante (plus rapide pour itérer).

## Repère (voir src/spec.js — source de vérité des cotes)

- `x` : 0 = face ext. du pignon **Nord**, croît vers le **Sud** (vers le sas et la maison existante).
- `z` : 0 = face ext. du mur **Est** (côté entrée), croît vers l'**Ouest** (façade jardin, z = 5.25 ; nez de balcon 5.75).
- `y` : 0 = sol fini RDC ; plafond RDC 2.40 ; sol fini étage 2.60 ; rampants sous toiture (`rampant(z)`).
- Unités : mètres. Vu depuis l'ouest (caméra en z+ regardant -z), le nord est à gauche.

Faces placo des pièces : `ROOMS` dans spec.js. Murs ext. = 0.22 maçonnerie enduite + 0.12 doublage.
Cloisons = 0.07 (placo / âme / placo).

## API partagée (src/core.js)

- `box(x0,y0,z0,x1,y1,z1, mat)` : boîte par ses coins (UV en mètres).
- `prismY(ptsXZ, y0, y1, mat)`, `prismX(ptsZY, x0, x1, mat)`, `prismZ(ptsXY, z0, z1, mat)` : extrusions.
- `cylinderY(x,z,y0,y1,r,mat)`, `tube([x,y,z],[x,y,z], r, mat)`.
- `wallWithHoles(...)`, `gableWithHoles(...)` (utilisés par building.js).
- `grp(name, level, kind)` + `add(parent, ...children)` : groupe étiqueté. `level` ∈ `rdc|etage|toit|site`,
  `kind` ∈ `structure|plafond|menuiserie|escalier|mobilier|eclairage|site`. Les filtres d'affichage s'en servent
  (ex. masquer le mobilier, masquer l'étage).
- `mat('nom')` : matériau du registre `MAT` (src/materials.js) : `crepi, placo, placoPlafond, isolant,
  cloisonAme, bloc, dalle, chape, carrelageSol, parquet, carrelageMural, ral7016, alu, chrome, inox, verre,
  verreDepoli, verreGardeCorps, miroir, chene, boisBardage, terrasse, blancLaque, rive, toiture, charpente,
  etancheite, herbe, gravier, terre, dallageExt, ceramique, luminaire, noir`.
- `cappedMaterial(params, capColor)` : créer un matériau local (tissus, couleurs de mobilier…). Les volumes
  **fermés** coupés par un plan de coupe affichent leurs faces arrière en `capColor` (poché d'architecte) :
  privilégier des volumes fermés (box/prism), pas de plans simples isolés.
- `ceilingLight(x,y,z,{intensity,distance})` : plafonnier (point light + diffuseur).

## Règles pour les modules

- Un module = un fichier `src/<module>.js` exportant `build…()` qui renvoie un `THREE.Group` (chargé par app.js).
- Ne modifier **que son propre fichier**. Besoin d'un changement ailleurs (spec, core, building, app,
  matériaux) : le signaler dans le compte rendu, ne pas l'éditer.
- Pas de ressource externe (textures en canvas procédural si besoin), pas de réseau.
- Rester raisonnable en géométrie (≈ < 150 000 triangles par module ; segments de cylindres 12–24).
- Pas de collision avec murs, cloisons, portes ouvertes, escalier (voir `DOORS`, `STAIR`, `ROOMS`).
