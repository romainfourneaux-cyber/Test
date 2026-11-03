# Portraits des souverains de la campagne (jeu/assets/images/personnages/) : recadrage 240 x 300, camaïeu d'encre
# brune sur parchemin, JPEG de 80 Ko au plus. Sources : programme Open Access du Metropolitan Museum of Art (domaine
# public, CC0 ; vérifier isPublicDomain sur https://collectionapi.metmuseum.org/public/collection/v1/objects/<id>).
# Télécharger d'abord les images originales dans un dossier à part (rien n'est téléchargé ici) :
#   DP831126.jpg  https://images.metmuseum.org/CRDImages/dp/original/DP831126.jpg  (objet 412341, Clovis le grand)
#   DP831127.jpg  https://images.metmuseum.org/CRDImages/dp/original/DP831127.jpg  (objet 412342, Pepin le bref)
#   DP104304.jpg  https://images.metmuseum.org/CRDImages/dp/original/DP104304.jpg  (objet 359448, Charlemagne à Pavie)
# Un nouveau portrait (commande /traiter) : ajouter une ligne à CROPS (fichier, boîte de recadrage en pixels de
# l'original, nom du fichier de sortie, zone à effacer ou None), puis son crédit complet dans jeu/CREDITS.md.
# Demande Pillow et numpy.
# Charlemagne : la petite croix au sommet de la couronne est effacée avant le recadrage (recouverte par le papier
# pris juste au-dessus), pour qu'aucun symbole religieux ne figure dans un médaillon du jeu.
# Usage : python3 -I atelier/outils/preparer-portraits.py <dossier des images du Met> jeu/assets/images/personnages
import sys, os
import numpy as np
from PIL import Image, ImageOps, ImageEnhance, ImageFilter

SRC, OUT = sys.argv[1], sys.argv[2]
CROPS = [
    ("DP831126.jpg", (950, 120, 1302, 560), "clovis", None),
    ("DP831127.jpg", (735, 150, 1105, 613), "pepin-le-bref", None),
    ("DP104304.jpg", (1552, 743, 1940, 1228), "charlemagne", (1736, 776, 1796, 816)),
]
ENCRE, MILIEU, PAPIER = (58, 38, 22), (150, 118, 78), (238, 226, 196)


def effacer(im, zone):
    # tampon de duplication : la zone reçoit le papier pris juste au-dessus d'elle (papier uni), fondu sur 6 px aux bords
    X0, Y0, X1, Y1 = zone
    w, h, F = X1 - X0, Y1 - Y0, 6
    a = np.asarray(im).astype(np.float64)
    cible = a[Y0 - F:Y1 + F, X0 - F:X1 + F].copy()
    source = a[Y0 - F - h - 10:Y1 + F - h - 10, X0 - F:X1 + F]
    yy, xx = np.mgrid[0:h + 2 * F, 0:w + 2 * F]
    d = np.minimum.reduce([yy, xx, h + 2 * F - 1 - yy, w + 2 * F - 1 - xx]).astype(np.float64)
    alpha = np.clip(d / F, 0, 1)[..., None]
    melange = cible * (1 - alpha) + source * alpha
    im = im.copy()
    im.paste(Image.fromarray(np.clip(melange, 0, 255).astype(np.uint8)), (X0 - F, Y0 - F))
    return im


for f, box, nom, zone in CROPS:
    im = Image.open(os.path.join(SRC, f)).convert("RGB")
    if zone:
        im = effacer(im, zone)
    g = ImageOps.grayscale(im.crop(box))
    g = ImageOps.autocontrast(g, cutoff=1)
    if nom == "charlemagne":
        g = ImageEnhance.Contrast(g).enhance(1.35)
    g = g.resize((240, 300), Image.LANCZOS).filter(ImageFilter.UnsharpMask(radius=1.2, percent=60, threshold=2))
    t = ImageOps.colorize(g, black=ENCRE, white=PAPIER, mid=MILIEU)
    p = os.path.join(OUT, nom + ".jpg")
    for q in (95, 93, 90, 86, 82):
        t.save(p, quality=q, optimize=True, progressive=True)
        if os.path.getsize(p) <= 80 * 1024:
            break
    print(nom, box, os.path.getsize(p), "octets, qualité", q)
