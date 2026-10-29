# Génère des variantes légères des images de la maquette pour la v3 (vignettes, photos LED, carte cadeau).
# Lit ../../maquette/assets/img (sans le modifier) et écrit dans ../assets/img, avec _sizes.json.
# Nécessite Pillow (pip install pillow). build.py reste en bibliothèque standard et se passe de ces variantes si elles manquent.
import json, os
from PIL import Image

ICI = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.normpath(os.path.join(ICI, "..", "..", "..", "maquette", "assets", "img"))
DST = os.path.normpath(os.path.join(ICI, "..", "assets", "img"))
cat = json.load(open(os.path.join(SRC, "..", "..", "data", "catalogue.json"), encoding="utf-8"))
tailles = {}


def sortie(rel, im, q=80):
    chemin = os.path.join(DST, rel)
    os.makedirs(os.path.dirname(chemin), exist_ok=True)
    im.save(chemin, "WEBP", quality=q, method=6)
    tailles[rel] = list(im.size)


def reduire(rel_src, rel_dst, largeur, q=80):
    im = Image.open(os.path.join(SRC, rel_src))
    im = im.convert("RGBA") if im.mode in ("RGBA", "LA", "P") else im.convert("RGB")
    h = round(im.height * largeur / im.width)
    sortie(rel_dst, im.resize((largeur, h), Image.LANCZOS), q)


for p in cat:
    if p["collection"] == "accessoires":
        continue
    for f in ("noir", "gris", "dore"):
        src = "p/{}-{}-440.webp".format(p["slug"], f)
        if os.path.exists(os.path.join(SRC, src)):
            reduire(src, "v/{}-{}-100.webp".format(p["slug"], f), 100)
    if p["decor"]:
        d = p["decor"].replace("-1200", "-640")
        if not os.path.exists(os.path.join(SRC, d)):
            d = p["decor"]
        reduire(d, "v/{}-decor-160.webp".format(p["slug"]), 160)

for i in range(4):
    reduire("led/led-img{}.webp".format(i), "led/led-img{}-440.webp".format(i), 440, 82)
for i in range(2):
    reduire("led/led-img{}.webp".format(i), "v/led-img{}-160.webp".format(i), 160)
reduire("misc/carte-cadeau.webp", "misc/carte-cadeau-240.webp", 240, 82)
reduire("misc/carte-cadeau.webp", "misc/carte-cadeau-440.webp", 440, 82)

with open(os.path.join(DST, "_sizes.json"), "w", encoding="utf-8") as fh:
    json.dump(tailles, fh, indent=0, sort_keys=True)
total = sum(os.path.getsize(os.path.join(DST, k)) for k in tailles)
print(len(tailles), "variantes,", round(total / 1024), "Ko")
