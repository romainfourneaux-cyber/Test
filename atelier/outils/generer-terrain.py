# Peint le fond de la carte du domaine (jeu/assets/images/terrain-domaine.jpg) : relief ombré, prés, champs
# en lanières, forêts, rivière, grain de papier. Créé pour ce projet (CC0). Les coordonnées suivent le plan
# SVG de jeu/js/domaine.js (cadre 1000 × 660), rendu à l'échelle ECH.
# Usage : python generer-terrain.py   (demande numpy et Pillow)
import os, math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ici = os.path.dirname(os.path.abspath(__file__))
racine = os.path.join(ici, "..", "..")
ECH = 1.6
W, H = int(1000 * ECH), int(660 * ECH)
CX, CY = 500 * ECH, 350 * ECH
rng = np.random.default_rng(42)

def fbm(octaves, base, persistance=0.5):
    total = np.zeros((H, W)); amp = 1.0; norme = 0
    for o in range(octaves):
        n = base * (2 ** o)
        g = rng.random((int(H / W * n) + 2, n + 2)).astype(np.float32)
        im = Image.fromarray(g, mode="F").resize((W, H), Image.BICUBIC)
        total += amp * (np.asarray(im, float) - 0.5)
        norme += amp; amp *= persistance
    return total / norme

yy, xx = np.mgrid[0:H, 0:W].astype(float)
dist_ville = np.sqrt(((xx - CX) / (430 * ECH)) ** 2 + ((yy - CY) / (285 * ECH)) ** 2)

# --- rivière (même tracé que le SVG) ---
def bezier(p0, p1, p2, p3, n=500):
    t = np.linspace(0, 1, n)[:, None]
    return ((1 - t) ** 3) * p0 + 3 * ((1 - t) ** 2) * t * p1 + 3 * (1 - t) * t * t * p2 + (t ** 3) * p3
seg = [((-20, 250), (150, 280), (260, 200), (380, 230)),
       ((380, 230), (500, 260), (600, 300), (720, 255)),
       ((720, 255), (840, 210), (900, 190), (1020, 230))]
riviere = np.vstack([bezier(*[np.array(p, float) * ECH for p in s]) for s in seg])
# distance à la rivière (approchée, par échantillons)
# distance au tracé : calculée seulement près de la rivière (fenêtre locale), ailleurs bornée
R = int(90 * ECH)
d2 = np.full((H, W), float(R * R))
for (px, py) in riviere:
    x0, x1 = max(0, int(px) - R), min(W, int(px) + R); y0, y1 = max(0, int(py) - R), min(H, int(py) + R)
    if x0 >= x1 or y0 >= y1: continue
    sous = (xx[y0:y1, x0:x1] - px) ** 2 + (yy[y0:y1, x0:x1] - py) ** 2
    np.minimum(d2[y0:y1, x0:x1], sous, out=d2[y0:y1, x0:x1])
d_riv = np.sqrt(d2)
d_riv[d2 >= R * R - 1] = 1e4

# --- relief ---
relief = fbm(6, 3) * 1.2 + np.clip(dist_ville - 0.7, 0, None) * 0.9
relief += np.exp(-(((xx - 150 * ECH) / 160) ** 2 + ((yy - 120 * ECH) / 110) ** 2)) * 0.5
relief += np.exp(-(((xx - 820 * ECH) / 200) ** 2 + ((yy - 70 * ECH) / 110) ** 2)) * 0.55
relief -= np.exp(-(d_riv / (40 * ECH)) ** 2) * 0.35
lisse = np.clip((dist_ville - 0.55) / 0.7, 0, 1); lisse = lisse * lisse * (3 - 2 * lisse)
relief = relief * (0.35 + 0.65 * lisse)

gy, gx = np.gradient(relief * 140)
lx, ly, lz = -0.6, -0.6, 0.55
norme = np.sqrt(gx ** 2 + gy ** 2 + 1)
ombre = ((-gx * lx) + (-gy * ly) + lz) / norme
ombre = np.clip(0.62 + ombre * 0.6, 0.5, 1.2)

# --- couleurs du sol ---
humide = fbm(5, 4)
pre = np.array([166, 160, 96], float); pre2 = np.array([128, 138, 76], float)
roche = np.array([168, 152, 122], float); rive = np.array([110, 132, 78], float)
t_h = np.clip(humide * 2.5 + 0.5, 0, 1)[..., None]
sol = pre * (1 - t_h) + pre2 * t_h
haut = np.clip((relief - 0.35) * 2.2, 0, 1)[..., None]
sol = sol * (1 - haut) + roche * haut
pres_riv = np.clip(1 - d_riv / (55 * ECH), 0, 1)[..., None]
sol = sol * (1 - pres_riv * 0.6) + rive * pres_riv * 0.6
# la ville : terre battue plus claire
ville = (1 - lisse)[..., None]
sol = sol * (1 - ville * 0.4) + np.array([190, 176, 128], float) * ville * 0.4
# brins d'herbe : mouchetis fin
mouche = np.asarray(Image.fromarray((rng.random((H // 2, W // 2)) * 255).astype(np.uint8)).resize((W, H), Image.NEAREST), float) / 255
sol = sol * (0.93 + 0.12 * mouche[..., None])
img = Image.fromarray(np.clip(sol, 0, 255).astype(np.uint8))
d = ImageDraw.Draw(img, "RGBA")

# --- champs en lanières (entre la ville et les bois) ---
champs_rng = np.random.default_rng(7)
for i in range(90):
    a = champs_rng.random() * 2 * math.pi
    r = 1.05 + champs_rng.random() * 0.32
    x = CX + math.cos(a) * 430 * ECH * r; y = CY + math.sin(a) * 285 * ECH * r
    if not (0 < x < W and 0 < y < H): continue
    if d_riv[int(min(H - 1, y)), int(min(W - 1, x))] < 35 * ECH: continue
    l, h = (60 + champs_rng.random() * 70) * ECH, (16 + champs_rng.random() * 18) * ECH
    ang = a + math.pi / 2 + (champs_rng.random() - 0.5) * 0.6
    c, s = math.cos(ang), math.sin(ang)
    pts = [(x + c * dx - s * dy, y + s * dx + c * dy) for dx, dy in [(-l / 2, -h / 2), (l / 2, -h / 2), (l / 2, h / 2), (-l / 2, h / 2)]]
    teinte = [(204, 182, 104), (186, 170, 92), (150, 152, 82), (196, 160, 96), (172, 140, 84)][i % 5]
    d.polygon(pts, fill=teinte + (255,), outline=(52, 66, 34, 255), width=3)
    for k in range(1, 6):  # sillons
        dy = -h / 2 + k * h / 6
        d.line([(x - c * l / 2 - s * dy, y - s * l / 2 + c * dy), (x + c * l / 2 - s * dy, y + s * l / 2 + c * dy)], fill=(96, 74, 38, 120), width=2)
    for k in range(3):  # arbres de haie
        t = champs_rng.random() - 0.5
        hx, hy = x + c * l * t + s * h / 2, y + s * l * t - c * h / 2
        rr = 5 * ECH
        d.ellipse([hx - rr + 2, hy - rr + 3, hx + rr + 2, hy + rr + 3], fill=(30, 36, 18, 110))
        d.ellipse([hx - rr, hy - rr, hx + rr, hy + rr], fill=(70, 90, 44, 255), outline=(36, 42, 22, 220))

# --- forêts ---
foret = fbm(5, 3) + np.clip(dist_ville - 1.15, 0, None) * 0.9
arbres_rng = np.random.default_rng(3)
n = 0
pos = []
for _ in range(120000):
    x = arbres_rng.random() * W; y = arbres_rng.random() * H
    ix, iy = int(x), int(y)
    if foret[iy, ix] < 0.02 or dist_ville[iy, ix] < 1.08 or d_riv[iy, ix] < 28 * ECH: continue
    pos.append((y, x))
pos = pos[:14000]
pos.sort()
for (y, x) in pos:
    r = (4.5 + arbres_rng.random() * 3.5) * ECH * 0.9
    d.ellipse([x - r + 2, y - r + 3, x + r + 2, y + r + 3], fill=(30, 36, 18, 110))
    base = [(64, 84, 42), (72, 92, 46), (58, 76, 40), (84, 98, 52)][int(arbres_rng.random() * 4)]
    d.ellipse([x - r, y - r, x + r, y + r], fill=base + (255,), outline=(36, 42, 22, 200))
    d.ellipse([x - r * 0.6, y - r * 0.7, x + r * 0.1, y - r * 0.05], fill=(130, 150, 80, 140))

# --- rivière : peinte d'après la distance au tracé ---
eau = np.asarray(img, float)
w_eau = 13 * ECH
berge = np.clip(1 - np.abs(d_riv - w_eau) / (2.5 * ECH), 0, 1)[..., None]
dedans = np.clip((w_eau - d_riv) / (2 * ECH), 0, 1)[..., None]
prof = np.clip(1 - d_riv / w_eau, 0, 1)[..., None]
bleu = np.array([126, 162, 172], float) * (1 - prof) + np.array([84, 122, 142], float) * prof
reflets = (fbm(3, 40) > 0.16)[..., None] * 38
eau = eau * (1 - dedans) + (bleu + reflets) * dedans
eau = eau * (1 - berge * 0.75) + np.array([50, 58, 44], float) * berge * 0.75
img = Image.fromarray(np.clip(eau, 0, 255).astype(np.uint8))

# --- ombrage du relief, grain de papier, ton sépia, vignette ---
a = np.asarray(img, float) * ombre[..., None]
papier = Image.open(os.path.join(racine, "jeu", "assets", "images", "parchemin.png")).convert("RGB")
tuile = np.asarray(papier.resize((papier.width * 2, papier.height * 2)), float)
reps = (H // tuile.shape[0] + 1, W // tuile.shape[1] + 1, 1)
grain = np.tile(tuile, reps)[:H, :W] / 235.0
a = a * (0.75 + 0.25 * grain)
gris = a.mean(axis=2, keepdims=True)
sepia = gris * np.array([1.08, 0.98, 0.78])
a = a * 0.78 + sepia * 0.22
vig = np.clip(1.15 - 0.45 * (((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2), 0.6, 1)
a = a * vig[..., None]
out = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).filter(ImageFilter.UnsharpMask(radius=1.2, percent=60))
f = os.path.join(racine, "jeu", "assets", "images", "terrain-domaine.jpg")
out.save(f, quality=84, optimize=True, progressive=True)
print("écrit", f, out.size, os.path.getsize(f) // 1024, "Ko")
