# -*- coding: utf-8 -*-
"""Contrôle du contrat des images pré-calculées (sans Blender).

Usage : python3 atelier/outils/rendu-3d/verifier.py
Compare jeu/assets/images/td/ et jeu/assets/images/campagne/ au contrat (liste des fichiers attendus) et au manifeste
sprites.js, puis contrôle la lecture des images. Code de sortie 1 s'il manque quelque chose ou si un contrôle échoue.

Contrat : fichiers manquants ou en trop, entrées du manifeste sans fichier, tailles (2 × la taille logique, × nombre
d'images), bords transparents (2 px, alpha ≤ 8), poids des JPEG (terrains ≤ 450 000 octets, carte de campagne
≤ 500 000 octets) et budget total (9 Mo = 9 000 000 octets : mêmes unités décimales partout).
Ancrages (décision consignée : le jeu lit ax / ay dans JEU.SPRITES, jamais en dur) : place-* → (75, 88), centre de la
cour ; tour-* → (35, 72) ; unite-* → (w / 2, h − 4). Ombres portées ombre-* : exactement (2 w, 2 h) pixels.
Lecture : aucun sprite avec plus de 0,3 % de pixels opaques blancs brûlés (trois canaux > 235) ; couleur du camp à la
taille logique ≥ 20 % sur chaque image de cavalerie et ≥ 18 % sur chaque image des fantassins omeyyades ;
terrains : écart de L* route − herbe (profils en travers, herbe à 26-30 px de l'axe) ≥ 15 en médiane, valeur HSV de
l'axe de la route ≥ 0,33 (aucun tronçon de plus de 20 px sous 0,28 ; ni les ponts, tablier de planches et culées
(emprise écrite par terrains.py dans le canal B du masque de contrôle), ni les bouts de route sous les places fortes
ne sont mesurés), sol de l'anneau de 40 px autour des clairières
≥ 0,6 × la luminance médiane de la plaine (masques écrits par terrains.py dans le cache) ; carte de campagne : écart de
L* entre le corps de chaque bourg lieu-* et l'aire de terre nue autour de lui (sprite posé sur la carte : ce que voit
l'élève ; masques écrits par campagne.py dans le cache) ≥ 15, en 7 positions de lieux (la
nappe de brume lieu-brume n'a pas de corps : elle n'est pas mesurée) ; unités tournées vers la gauche (« face »:
"gauche") : seulement pour les camps rivaux.
Places fortes : l'état « abîmé » se lit à l'échelle du jeu : images réduites à 96 px et posées sur l'herbe, au moins
12 % des pixels changent de plus de 0,1 (sur 1) entre « intact » et « abîmé ». Toits de France : saturation HSV
médiane des pixels de toit ≤ 0,32 (ardoise, pas bleu roi), mesurée avec les masques controle-toits-<nom>.png que les
générateurs écrivent dans le cache (places.py ; tout autre script peut en écrire pour ses propres sprites).
"""
import json
import math
import os
import re
import subprocess
import sys

import numpy as np
from PIL import Image, ImageFilter

ICI = os.path.dirname(os.path.abspath(__file__))
RACINE = os.path.abspath(os.path.join(ICI, "..", "..", ".."))
JEU = os.path.join(RACINE, "jeu")
TD = os.path.join(JEU, "assets", "images", "td")
CAMP = os.path.join(JEU, "assets", "images", "campagne")
CACHE = os.path.join(RACINE, "atelier", "sources-3d", "_cache")

CARTES = ["domaine", "gue", "foret", "moulin", "col", "chateau"]
RIVAUX = ["angleterre", "omeyyades"]
LIMITE_TERRAIN, LIMITE_FOND, BUDGET = 450_000, 500_000, 9_000_000
ENTREE_PLACE = 55          # px : les troupes plus près d'un bout de route sont sous la place forte


def contrat():
    """Fichiers attendus -> (dossier, taille logique (w, h), images). Les ombres portées sont vérifiées à part."""
    a = {}
    for c in CARTES:
        a["terrain-%s.jpg" % c] = (TD, (1000, 660), 1)
    for camp in ["france"] + RIVAUX:
        for etat in ("intact", "abime", "ruine"):
            a["place-%s-%s.png" % (camp, etat)] = (TD, (150, 150), 1)
    for t in ("archers", "piquiers", "baliste", "catapulte"):
        for n in (1, 2, 3):
            a["tour-%s-france-%d.png" % (t, n)] = (TD, (70, 84), 1)
    for camp in RIVAUX:
        for t in ("archers", "baliste"):
            a["tour-%s-%s-1.png" % (t, camp)] = (TD, (70, 84), 1)
    a["unite-fantassins-france.png"] = (TD, (40, 40), 4)
    a["unite-cavaliers-france.png"] = (TD, (40, 40), 4)
    a["unite-belier-france.png"] = (TD, (56, 64), 4)
    for camp in RIVAUX:
        for t in ("pietaille", "cavaliers", "hommes"):
            a["unite-%s-%s.png" % (t, camp)] = (TD, (40, 40), 4)
        a["unite-champion-%s.png" % camp] = (TD, (48, 48), 4)
    a["effet-fleche.png"] = (TD, (24, 6), 1)
    a["effet-carreau.png"] = (TD, (32, 8), 1)
    a["effet-pierre.png"] = (TD, (14, 14), 1)
    a["effet-poussiere.png"] = (TD, (48, 48), 5)
    a["effet-eclats.png"] = (TD, (32, 32), 4)
    a["fond-campagne.jpg"] = (CAMP, (1000, 530), 1)
    for camp in ("france", "france-2", "france-3", "angleterre", "omeyyades", "brume"):
        a["lieu-%s.png" % camp] = (CAMP, (80, 80), 1)
    return a


def manifeste():
    with open(os.path.join(TD, "sprites.js"), encoding="utf-8") as f:
        txt = f.read()
    return json.loads(re.search(r"JEU\.SPRITES\s*=\s*(\{.*\})\s*;", txt, re.S).group(1))


# ---------------------------------------------------------------- couleurs
def lineaire(c):
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)


def luminance(rgb):
    """Luminance relative (linéaire, 0..1) d'un tableau sRGB 0..1."""
    return (lineaire(rgb) * np.array([0.2126, 0.7152, 0.0722])).sum(-1)


def lstar(rgb):
    y = luminance(rgb)
    f = np.where(y > 0.008856, np.cbrt(y), 7.787 * y + 16 / 116)
    return 116 * f - 16


def hsv(rgb):
    mx, mn = rgb.max(-1), rgb.min(-1)
    d = mx - mn + 1e-6
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    h = np.where(mx == r, ((g - b) / d) % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) * 60
    return h, (mx - mn) / np.maximum(mx, 1e-6), mx


TEINTES = {"france": ((198, 242), 0.25, 0.10), "angleterre": ((342, 22), 0.33, 0.12)}


def part_camp(img, camp):
    """Part des pixels opaques à la couleur du camp, image réduite à la taille logique (ce que voit l'élève)."""
    w, h = img.size
    a = np.array(img.convert("RGBa").resize((w // 2, h // 2), Image.LANCZOS).convert("RGBA"), dtype=np.float64) / 255
    opaque = a[..., 3] >= 0.5
    hh, s, v = hsv(a[..., :3])
    if camp == "omeyyades":
        ok = ((s < 0.3) & (v > 0.6) & (hh >= 20) & (hh <= 70)) | ((hh >= 118) & (hh <= 185) & (s >= 0.18) & (v >= 0.1))
    else:
        (h0, h1), smin, vmin = TEINTES[camp]
        dans = (hh >= h0) & (hh <= h1) if h0 <= h1 else (hh >= h0) | (hh <= h1)
        ok = dans & (s >= smin) & (v >= vmin)
    return float((ok & opaque).sum()) / max(1, int(opaque.sum()))


# ---------------------------------------------------------------- géométrie des cartes (lue par Node dans jeu/js)
def cartes():
    js = os.path.join(JEU, "js")
    code = ('const vm=require("vm"),fs=require("fs");const c={console,Math};c.window=c;vm.createContext(c);'
            '["bataille-moteur","cartes-bataille"].forEach(f=>vm.runInContext(fs.readFileSync(%s+"/"+f+".js","utf8"),c));'
            'const K=c.JEU.cartesBataille;console.log(JSON.stringify(Object.keys(K.LIEUX).map(id=>K.carte(id))))') % json.dumps(js)
    sortie = subprocess.run(["node", "-e", code], capture_output=True, text=True, check=True).stdout
    return {c["id"]: c for c in json.loads(sortie)}


def le_long(route, pas=1.0):
    """Points (x, y, tangente) régulièrement espacés le long d'une polyligne."""
    res = []
    for i in range(1, len(route)):
        (ax, ay), (bx, by) = route[i - 1], route[i]
        l = math.hypot(bx - ax, by - ay)
        if l < 1e-6:
            continue
        n = max(1, int(l / pas))
        for k in range(n):
            t = k / n
            res.append((ax + (bx - ax) * t, ay + (by - ay) * t, (bx - ax) / l, (by - ay) / l))
    return res


def controle_terrain(nom, chemin, carte, fautes, notes):
    """Lisibilité de la route (L* et valeur HSV) et sol autour des clairières."""
    im = np.array(Image.open(chemin).convert("RGB"), dtype=np.float64) / 255.0
    H, W = im.shape[:2]
    k = W / 1000.0
    L = lstar(im)
    _, _, V = hsv(im)
    route = carte["route"]
    bouts = (route[0], route[-1])
    ch = os.path.join(CACHE, "controle-terrain-%s.png" % nom.replace("terrain-", ""))
    m = np.array(Image.open(ch).convert("RGB").resize((W, H), Image.NEAREST)) if os.path.exists(ch) else None
    ponts = m[..., 2] > 127 if m is not None else None      # emprise des ponts (canal B, écrit par terrains.py)
    ecarts, valeurs = [], []
    for (x, y, tx, ty) in le_long(route):
        if min(math.hypot(x - bx, y - by) for bx, by in bouts) < ENTREE_PLACE:
            valeurs.append(None)
            continue
        if ponts is not None and ponts[min(H - 1, int(y * k)), min(W - 1, int(x * k))]:
            valeurs.append(None)        # tablier de planches et culées, à l'ombre des garde-corps : ce n'est pas la terre
            continue
        nx, ny = -ty, tx
        cx, cy = int(x * k), int(y * k)
        valeurs.append(float(np.median(V[max(0, cy - 2):cy + 3, max(0, cx - 2):cx + 3])))
        c = [L[int((y + ny * t) * k), int((x + nx * t) * k)] for t in np.arange(-6, 6.5, 1.0)
             if 0 <= (y + ny * t) * k < H and 0 <= (x + nx * t) * k < W]
        g = [L[int((y + ny * t * s) * k), int((x + nx * t * s) * k)] for t in np.arange(26, 30.5, 1.0) for s in (-1, 1)
             if 0 <= (y + ny * t * s) * k < H and 0 <= (x + nx * t * s) * k < W]
        if c and g:
            ecarts.append(float(np.median(c) - np.median(g)))
    med = float(np.median(ecarts)) if ecarts else 0.0
    notes.append("%s : écart de L* route − herbe %.1f en médiane (min %.1f, 10e centile %.1f)"
                 % (nom, med, min(ecarts), float(np.percentile(ecarts, 10))))
    if med < 15:
        fautes.append("%s : route trop peu claire (écart de L* médian %.1f < 15)" % (nom, med))
    vs = [v for v in valeurs if v is not None]
    vmin = min(vs) if vs else 1.0
    pire, cours = 0, 0
    for v in valeurs:
        if v is not None and v < 0.28:
            cours += 1
            pire = max(pire, cours)
        else:
            cours = 0
    nb_sous = sum(1 for v in vs if v < 0.33)
    notes.append("%s : valeur HSV de l'axe de la route min %.2f, %d px sous 0,33, plus long tronçon sous 0,28 : %d px"
                 % (nom, vmin, nb_sous, pire))
    if nb_sous or pire > 20:
        fautes.append("%s : route assombrie (%d px sous V 0,33, tronçon de %d px sous 0,28)" % (nom, nb_sous, pire))
    if m is not None:
        anneau, plaine = m[..., 0] > 127, m[..., 1] > 127
        Y = luminance(im)
        r = float(np.median(Y[anneau]) / np.median(Y[plaine]))
        notes.append("%s : sol autour des clairières à %.2f × la plaine" % (nom, r))
        if r < 0.6:
            fautes.append("%s : anneau des clairières trop sombre (%.2f × la plaine < 0,6)" % (nom, r))
    else:
        fautes.append("%s : masque de contrôle absent (%s) : relancer terrains.py" % (nom, os.path.relpath(ch, RACINE)))


def positions_campagne():
    with open(os.path.join(JEU, "js", "ecran-campagne.js"), encoding="utf-8") as f:
        txt = f.read()
    bloc = re.search(r"POSITIONS\s*=\s*\{(.*?)\};", txt, re.S).group(1)
    return {k: (float(x), float(y)) for k, x, y in re.findall(r"(\w+):\s*\[\s*([\d.]+)\s*,\s*([\d.]+)\s*\]", bloc)}


def controle_lieux(man, fautes, notes):
    """Le corps de chaque bourg se détache de ce qui l'entoure à l'écran : sprite posé sur la carte à sa position (son
    aire de terre claire comprise), écart de L* ≥ 15 entre le corps du bourg et l'aire de terre nue autour de lui
    (masques controle-lieu-<nom>.png écrits par campagne.py ; à défaut : alpha > 200 contre un anneau de 10 px de carte
    hors du sprite)."""
    fond = os.path.join(CAMP, "fond-campagne.jpg")
    if not os.path.exists(fond):
        return
    carte = np.array(Image.open(fond).convert("RGB"), dtype=np.float64) / 255.0
    k = carte.shape[1] / 1000.0
    pos = positions_campagne()
    for lieu, camp in (("domaine", "france"), ("gue", "france-2"), ("piemont", "france-3"), ("col", "angleterre"),
                       ("chateau", "angleterre"), ("citadelle", "omeyyades"), ("forteresse", "omeyyades")):
        e = man.get("lieu-" + camp)
        if not e or lieu not in pos:
            continue
        sp = np.array(Image.open(os.path.join(JEU, e["src"])).convert("RGBA"), dtype=np.float64) / 255.0
        a = sp[..., 3]
        masque = os.path.join(CACHE, "controle-lieu-lieu-%s.png" % camp)
        if os.path.exists(masque):
            # masques écrits par campagne.py : corps du bourg (R) et aire de terre nue autour de lui (G)
            m = np.array(Image.open(masque).convert("RGB"))
            corps, anneau = m[..., 0] > 127, m[..., 1] > 127
        else:
            corps = a > 200 / 255.0
            ext = np.array(Image.fromarray(corps.astype(np.uint8) * 255).filter(ImageFilter.MaxFilter(21))) > 127
            anneau = ext & ~(a > 60 / 255.0)
        x0 = int(round((pos[lieu][0] - e["ax"]) * k))
        y0 = int(round((pos[lieu][1] - e["ay"]) * k))
        h, w = a.shape
        zone = carte[max(0, y0):y0 + h, max(0, x0):x0 + w]
        if zone.shape[:2] != (h, w):
            continue
        vu = sp[..., :3] * a[..., None] + zone * (1 - a[..., None])       # ce que voit l'élève
        l_corps = float(np.median(lstar(vu)[corps]))
        l_anneau = float(np.median(lstar(vu)[anneau]))
        ec = abs(l_corps - l_anneau)
        notes.append("lieu-%s sur « %s » : L* du bourg %.0f, autour %.0f (écart %.0f)" % (camp, lieu, l_corps, l_anneau, ec))
        if ec < 15:
            fautes.append("lieu-%s sur « %s » : trop peu de contraste avec la carte (écart de L* %.0f < 15)" % (camp, lieu, ec))


HERBE = np.array([0.29, 0.32, 0.19])     # fond d'herbe sous les sprites réduits (couleur moyenne de la plaine)
SEUIL_ABIME, TAILLE_ABIME = 0.12, 96
PLAFOND_TOITS = 0.32


def controle_abime(fautes, notes):
    """Place forte abîmée lisible à l'échelle du jeu : part des pixels (image réduite à 96 px, posée sur l'herbe) qui
    changent de plus de 0,1 entre « intact » et « abîmé »."""
    def petit(chemin):
        im = Image.open(chemin).convert("RGBA").convert("RGBa").resize((TAILLE_ABIME, TAILLE_ABIME), Image.LANCZOS)
        a = np.array(im, dtype=np.float64) / 255.0           # prémultiplié
        return a[..., :3] + HERBE * (1 - a[..., 3:])
    for camp in ["france"] + RIVAUX:
        ci, ca = (os.path.join(TD, "place-%s-%s.png" % (camp, e)) for e in ("intact", "abime"))
        if not (os.path.exists(ci) and os.path.exists(ca)):
            continue
        part = float((np.abs(petit(ci) - petit(ca)).max(-1) > 0.1).mean())
        notes.append("place-%s : %.1f %% des pixels changent entre intact et abîmé (à 96 px)" % (camp, part * 100))
        if part < SEUIL_ABIME:
            fautes.append("place-%s-abime : trop peu visible à l'échelle du jeu (%.1f %% des pixels changent à 96 px, "
                          "< %.0f %%)" % (camp, part * 100, SEUIL_ABIME * 100))


def controle_toits(attendu, fautes, notes):
    """Toits de France en ardoise : saturation médiane des pixels de toit ≤ 0,32 (masques du cache)."""
    for fichier, (dossier, _, n) in sorted(attendu.items()):
        nom = fichier.rsplit(".", 1)[0]
        masque = os.path.join(CACHE, "controle-toits-%s.png" % nom)
        chemin = os.path.join(dossier, fichier)
        if "france" not in nom or n != 1 or not (os.path.exists(masque) and os.path.exists(chemin)):
            continue
        img = np.array(Image.open(chemin).convert("RGBA"), dtype=np.float64) / 255.0
        m = np.array(Image.open(masque).convert("L").resize(img.shape[1::-1], Image.LANCZOS)) > 127
        sel = m & (img[..., 3] >= 0.5)
        if sel.sum() < 30:
            continue
        _, s, _ = hsv(img[..., :3])
        med = float(np.median(s[sel]))
        notes.append("%s : saturation médiane des toits %.2f (%d px)" % (nom, med, int(sel.sum())))
        if med > PLAFOND_TOITS:
            fautes.append("%s : toits trop saturés (%.2f > %.2f) : ardoise gris-bleu attendue" % (nom, med, PLAFOND_TOITS))


def main():
    fautes, notes = [], []
    attendu = contrat()
    man = manifeste()
    par_src = {e["src"]: (k, e) for k, e in man.items()}
    total = 0
    presents = 0
    for fichier, (dossier, (w, h), n) in sorted(attendu.items()):
        chemin = os.path.join(dossier, fichier)
        src = os.path.relpath(chemin, JEU).replace(os.sep, "/")
        if not os.path.exists(chemin):
            fautes.append("manquant : " + src)
            continue
        presents += 1
        total += os.path.getsize(chemin)
        im = Image.open(chemin)
        if im.size != (w * 2 * n, h * 2):
            fautes.append("%s : taille %s, attendu %s" % (src, im.size, (w * 2 * n, h * 2)))
        nom = fichier.rsplit(".", 1)[0]
        if src not in par_src:
            fautes.append("%s : absent de sprites.js" % src)
        else:
            k, e = par_src[src]
            if (e["w"], e["h"], e["frames"]) != (w, h, n):
                fautes.append("%s : manifeste %s × %s × %d, attendu %d × %d × %d" % (src, e["w"], e["h"], e["frames"], w, h, n))
            ancre = None
            if nom.startswith("place-"):
                ancre = (75, 88)
            elif nom.startswith("tour-"):
                ancre = (35, 72)
            elif nom.startswith("unite-"):
                ancre = (w / 2, h - 4)
            if ancre and (e["ax"], e["ay"]) != ancre:
                fautes.append("%s : ancre (%s, %s), attendu %s" % (src, e["ax"], e["ay"], ancre))
            if nom.startswith("unite-"):
                attendue = "droite" if nom.endswith("-france") else "gauche"
                if e.get("face", "droite") != attendue:
                    fautes.append("%s : face %s, attendu %s (France vers la droite, camps rivaux vers la gauche)"
                                  % (src, e.get("face", "droite"), attendue))
        if fichier.endswith(".png"):
            rgba = np.array(im.convert("RGBA"))
            a = rgba[..., 3]
            fw = a.shape[1] // n
            for k_ in range(n):
                f = a[:, k_ * fw:(k_ + 1) * fw]
                bord = max(f[:2].max(), f[-2:].max(), f[:, :2].max(), f[:, -2:].max())
                if bord > 8:
                    fautes.append("%s image %d : bord non transparent (alpha %d)" % (src, k_, bord))
            opaque = a >= 128
            blancs = float((opaque & (rgba[..., :3].min(-1) > 235)).sum()) / max(1, int(opaque.sum()))
            if blancs > 0.003:
                fautes.append("%s : %.2f %% de pixels opaques blancs brûlés (> 0,3 %%)" % (src, blancs * 100))
            if nom.startswith("unite-"):
                camp = nom.rsplit("-", 1)[1]
                cav = "cavaliers" in nom
                if cav or camp == "omeyyades":
                    seuil = 0.20 if cav else 0.18
                    img = im.convert("RGBA")
                    parts = [part_camp(img.crop((k_ * fw, 0, (k_ + 1) * fw, img.size[1])), camp) for k_ in range(n)]
                    notes.append("%s : couleur du camp %s %% (taille logique)" % (nom, " / ".join("%.0f" % (p * 100) for p in parts)))
                    if min(parts) < seuil:
                        fautes.append("%s : couleur du camp %.1f %% < %.0f %% sur une image" % (src, min(parts) * 100, seuil * 100))
        else:
            octets = os.path.getsize(chemin)
            limite = LIMITE_FOND if fichier.startswith("fond") else LIMITE_TERRAIN
            if octets > limite:
                fautes.append("%s : %d octets > %d" % (src, octets, limite))
    # ombres portées des tours et places fortes : exactement 2 × la taille logique du manifeste
    for k, e in man.items():
        if k.startswith("ombre-"):
            chemin = os.path.join(JEU, e["src"])
            if os.path.exists(chemin):
                total += os.path.getsize(chemin)
                taille = Image.open(chemin).size
                if taille != (2 * e["w"], 2 * e["h"]):
                    fautes.append("%s : %s px, attendu %s (2 × w, 2 × h)" % (e["src"], taille, (2 * e["w"], 2 * e["h"])))
            else:
                fautes.append("ombre manquante : " + e["src"])
    # entrées du manifeste sans fichier, fichiers en trop
    for k, e in man.items():
        if not os.path.exists(os.path.join(JEU, e["src"])):
            fautes.append("manifeste : %s -> fichier absent (%s)" % (k, e["src"]))
    noms_attendus = set(attendu) | {os.path.basename(e["src"]) for e in man.values()} | {"sprites.js"}
    for dossier in (TD, CAMP):
        for f in sorted(os.listdir(dossier)):
            if f not in noms_attendus:
                notes.append("fichier hors contrat : " + os.path.relpath(os.path.join(dossier, f), JEU))
    # lecture des terrains et des lieux de campagne
    try:
        geo = cartes()
    except Exception as ex:          # Node absent : contrôles de lecture des terrains impossibles
        geo = {}
        fautes.append("géométrie des cartes illisible (Node) : %s" % ex)
    for c in CARTES:
        chemin = os.path.join(TD, "terrain-%s.jpg" % c)
        if os.path.exists(chemin) and c in geo:
            controle_terrain("terrain-" + c, chemin, geo[c], fautes, notes)
    controle_lieux(man, fautes, notes)
    controle_abime(fautes, notes)
    controle_toits(attendu, fautes, notes)
    print("Contrat : %d / %d fichiers présents ; poids total (avec ombres) %.2f Mo (budget 9 Mo, 1 Mo = 1 000 000 octets)"
          % (presents, len(attendu), total / 1e6))
    if total > BUDGET:
        fautes.append("budget dépassé : %.2f Mo" % (total / 1e6))
    for n_ in notes:
        print("  note : " + n_)
    for f in fautes:
        print("  ÉCART : " + f)
    if not fautes:
        print("  tout est conforme")
    return 1 if fautes else 0


if __name__ == "__main__":
    sys.exit(main())
