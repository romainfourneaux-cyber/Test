# Génère les textures du jeu (parchemin, cuir, bois) : bruit procédural raccordable, créé pour ce projet (CC0).
# Usage : python generer-textures.py   (demande numpy et Pillow)
import numpy as np, os
from PIL import Image
ici = os.path.dirname(os.path.abspath(__file__))
sortie = os.path.join(ici, "..", "..", "jeu", "assets", "images")
rng = np.random.default_rng(5)

def bruit(n, echelles):
    # bruit raccordable : filtrage en fréquence d'un bruit blanc (périodique par construction)
    total = np.zeros((n, n))
    fx = np.fft.fftfreq(n)[:, None]; fy = np.fft.fftfreq(n)[None, :]
    f = np.sqrt(fx ** 2 + fy ** 2)
    for sigma, poids in echelles:
        b = np.fft.fft2(rng.standard_normal((n, n)))
        filtre = np.exp(-(f * n / sigma) ** 2 / 2)
        c = np.real(np.fft.ifft2(b * filtre))
        c = (c - c.mean()) / (c.std() + 1e-9)
        total += poids * c
    return total

def teinter(v, sombre, clair):
    v = (v - v.min()) / (v.max() - v.min())
    s, c = np.array(sombre, float), np.array(clair, float)
    return (s + (c - s) * v[..., None]).clip(0, 255).astype(np.uint8)

n = 384
p = bruit(n, [(4, 1.0), (16, 0.5), (90, 0.25)])
fibres = bruit(n, [(120, 1)]) * 0.15
img = teinter(np.tanh((p + fibres) * 0.6), (214, 196, 158), (246, 238, 218))
Image.fromarray(img).save(os.path.join(sortie, "parchemin.png"), optimize=True)

c = bruit(n, [(6, 1.0), (40, 0.6), (140, 0.3)])
Image.fromarray(teinter(np.tanh(c * 0.7), (28, 20, 14), (74, 52, 34))).save(os.path.join(sortie, "cuir.png"), optimize=True)

# bois : veines étirées horizontalement
y = np.arange(n)[:, None]; x = np.arange(n)[None, :]
v = bruit(n, [(3, 1.0), (10, 0.4)])
veines = np.sin((y + v * 18) * 2 * np.pi * 7 / n) * 0.5 + bruit(n, [(60, 1)]) * 0.25
Image.fromarray(teinter(np.tanh(veines), (58, 36, 20), (122, 82, 46))).save(os.path.join(sortie, "bois.png"), optimize=True)
print("textures écrites dans", sortie)
