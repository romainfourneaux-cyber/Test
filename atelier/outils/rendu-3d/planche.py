# -*- coding: utf-8 -*-
"""Planche de contrôle : les sprites posés sur un terrain à leur vraie taille dans le jeu, puis agrandis.

Usage : python3 atelier/outils/rendu-3d/planche.py --terrain <terrain.jpg> --sortie <dossier> [--carte gue]
Écrit <dossier>/proto-en-jeu.png (1000 × 660, vue telle qu'en jeu à l'échelle 1) et
<dossier>/planche-prototype.png (la même vue + chaque sprite à 2 × sur fond gris neutre).
Ne lance pas Blender : simple montage PIL à partir des images déjà rendues et du manifeste.
"""
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import commun as C  # noqa: E402
import terrains as T  # noqa: E402
from PIL import Image, ImageDraw, ImageFont  # noqa: E402

POLICE = "/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf"
POLICE_GRAS = "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf"


def police(taille, gras=False):
    try:
        return ImageFont.truetype(POLICE_GRAS if gras else POLICE, taille)
    except Exception:
        return ImageFont.load_default()


def sprite(nom, image=0, echelle=0.5, miroir=False):
    """Image n° image d'un sprite du manifeste, réduite à l'échelle voulue (0,5 = taille logique)."""
    e = C.lire_manifeste()[nom]
    im = Image.open(os.path.join(C.RACINE, "jeu", e["src"])).convert("RGBA")
    w = im.size[0] // e["frames"]
    im = im.crop((image * w, 0, (image + 1) * w, im.size[1]))
    if miroir:
        im = im.transpose(Image.FLIP_LEFT_RIGHT)
    if echelle != 1:
        im = im.convert("RGBa").resize((round(im.size[0] * echelle), round(im.size[1] * echelle)), Image.LANCZOS).convert("RGBA")
    return im, e


def poser(fond, nom, x, y, image=0, miroir=False):
    """Pose un sprite à sa taille logique, son point d'ancrage sur (x, y) du canevas 1000 × 660."""
    im, e = sprite(nom, image, 0.5 * fond.size[0] / T.LARG, miroir)
    k = fond.size[0] / T.LARG
    ax = (e["w"] - e["ax"]) if miroir else e["ax"]
    fond.alpha_composite(im, (round(x * k - ax * k), round(y * k - e["ay"] * k)))


def sur_route(route, s, cote=0.0):
    """Point de la route à l'abscisse s (px), décalé de « cote » px sur le côté (comme le moteur du jeu)."""
    cumul = [0.0]
    for i in range(1, len(route)):
        cumul.append(cumul[-1] + math.dist(route[i - 1], route[i]))
    s = max(0, min(cumul[-1], s))
    i = 1
    while i < len(cumul) - 1 and cumul[i] < s:
        i += 1
    t = (s - cumul[i - 1]) / ((cumul[i] - cumul[i - 1]) or 1)
    (ax, ay), (bx, by) = route[i - 1], route[i]
    dx, dy = bx - ax, by - ay
    l = math.hypot(dx, dy) or 1
    return ax + dx * t - dy / l * cote, ay + dy * t + dx / l * cote, cumul[-1]


def vue_en_jeu(terrain, carte):
    fond = Image.open(terrain).convert("RGBA")
    if fond.size != (T.LARG, T.HAUT):
        fond = fond.resize((T.LARG, T.HAUT), Image.LANCZOS)
    route = carte["route"]
    objets = []   # (y d'ancrage, fonction de pose)
    objets.append((route[0][1], lambda: poser(fond, "place-france-intact", *route[0])))
    objets.append((route[-1][1], lambda: poser(fond, "place-angleterre-intact", *route[-1])))
    emp = carte["emplacements"]
    riv = carte["emplacementsRivaux"]
    choix = [("tour-archers-france-1", emp[2]), ("tour-archers-france-2", emp[5]), ("tour-archers-france-3", emp[8])]
    if riv:
        choix.append(("tour-archers-angleterre-1", riv[0]))
    if len(riv) > 3:
        choix.append(("tour-archers-omeyyades-1", riv[3]))
    for nom, (x, y) in choix:
        if nom in C.lire_manifeste():
            objets.append((y, lambda n=nom, x=x, y=y: poser(fond, n, x, y)))
    # troupes sur la route : les tiennes vont vers la droite, celles d'en face (en miroir) vers la gauche
    _, _, longueur = sur_route(route, 0)
    troupes = [("unite-fantassins-france", 150, -6, False, 0), ("unite-fantassins-france", 172, 6, False, 2),
               ("unite-fantassins-france", 196, -6, False, 1),
               ("unite-cavaliers-angleterre", longueur - 330, 6, True, 1), ("unite-cavaliers-angleterre", longueur - 300, -6, True, 3),
               ("unite-pietaille-omeyyades", longueur - 420, -6, True, 0), ("unite-pietaille-omeyyades", longueur - 440, 6, True, 2)]
    for nom, s, cote, miroir, image in troupes:
        if nom not in C.lire_manifeste():
            continue
        x, y, _ = sur_route(route, s, cote)
        objets.append((y, lambda n=nom, x=x, y=y, m=miroir, i=image: poser(fond, n, x, y, i, m)))
    for _, f in sorted(objets, key=lambda o: o[0]):
        f()
    return fond


def panneau_sprites(noms, largeur, zoom=1):
    """Chaque sprite à 2 × la taille logique (= le PNG tel quel, × zoom) sur gris neutre, avec son nom."""
    marge, titre_h = 24, 40
    f = police(14)
    f2 = police(12)
    blocs = []
    for nom in noms:
        if nom not in C.lire_manifeste():
            continue
        e = C.lire_manifeste()[nom]
        im = Image.open(os.path.join(C.RACINE, "jeu", e["src"])).convert("RGBA")
        if zoom != 1:
            im = im.resize((im.size[0] * zoom, im.size[1] * zoom), Image.NEAREST)
        l1 = nom
        l2 = "%d × %d px logiques%s" % (e["w"], e["h"], " · %d images" % e["frames"] if e["frames"] > 1 else "")
        lt = max(f.getlength(l1), f2.getlength(l2))
        blocs.append((nom, im, e, l1, l2, int(max(im.size[0], lt))))
    lignes, ligne, x = [], [], marge
    for b in blocs:
        if ligne and x + b[5] > largeur - marge:
            lignes.append(ligne)
            ligne, x = [], marge
        ligne.append(b)
        x += b[5] + marge
    if ligne:
        lignes.append(ligne)
    h = marge + sum(max(b[1].size[1] for b in l) + titre_h + marge for l in lignes)
    p = Image.new("RGBA", (largeur, h), (128, 128, 128, 255))
    d = ImageDraw.Draw(p)
    y = marge
    for l in lignes:
        x = marge
        hl = max(b[1].size[1] for b in l)
        for nom, im, e, l1, l2, bw in l:
            p.alpha_composite(im, (x, y + hl - im.size[1]))
            # point d'ancrage (croix fine) de chaque image
            for k in range(e["frames"]):
                ax = x + (k * e["w"] + e["ax"]) * 2 * zoom
                ay = y + hl - im.size[1] + e["ay"] * 2 * zoom
                d.line((ax - 4, ay, ax + 4, ay), fill=(255, 60, 60, 255))
                d.line((ax, ay - 4, ax, ay + 4), fill=(255, 60, 60, 255))
            d.text((x, y + hl + 4), l1, fill=(15, 15, 15, 255), font=f)
            d.text((x, y + hl + 21), l2, fill=(40, 40, 40, 255), font=f2)
            x += bw + marge
        y += hl + titre_h + marge
    return p


def main(args):
    terrain = args[args.index("--terrain") + 1]
    sortie = args[args.index("--sortie") + 1]
    id_carte = args[args.index("--carte") + 1] if "--carte" in args else "gue"
    os.makedirs(sortie, exist_ok=True)
    carte = T.lire_cartes()[id_carte]
    vue = vue_en_jeu(terrain, carte)
    vue.convert("RGB").save(os.path.join(sortie, "proto-en-jeu.png"), optimize=True)
    noms = ["place-france-intact", "place-angleterre-intact", "place-omeyyades-intact",
            "tour-archers-france-1", "tour-archers-france-2", "tour-archers-france-3", "tour-archers-angleterre-1",
            "tour-archers-omeyyades-1", "unite-fantassins-france", "unite-cavaliers-angleterre", "unite-pietaille-omeyyades"]
    L = 2000
    pan = panneau_sprites(noms, L)
    troupes = [n for n in noms if n.startswith("unite-")]
    pan2 = panneau_sprites(troupes, L, zoom=2)
    titre_h = 56
    vue2 = vue.resize((L, round(L * T.HAUT / T.LARG)), Image.LANCZOS)
    planche = Image.new("RGBA", (L, titre_h * 3 + vue2.size[1] + pan.size[1] + pan2.size[1]), (40, 34, 28, 255))
    d = ImageDraw.Draw(planche)
    d.text((24, 14), "Vue en jeu (carte « %s ») : sprites à leur taille logique sur le terrain, affichée ici à 2 ×" % carte["nom"],
           fill=(240, 228, 200, 255), font=police(24, True))
    planche.alpha_composite(vue2, (0, titre_h))
    d.text((24, titre_h + vue2.size[1] + 14), "Sprites à 2 × la taille logique (résolution des fichiers) ; croix rouge = point d'ancrage",
           fill=(240, 228, 200, 255), font=police(24, True))
    planche.alpha_composite(pan, (0, titre_h * 2 + vue2.size[1]))
    y3 = titre_h * 2 + vue2.size[1] + pan.size[1]
    d.text((24, y3 + 14), "Troupes : les 4 images de la marche, grossies encore 2 × (4 × la taille logique) pour juger le détail",
           fill=(240, 228, 200, 255), font=police(24, True))
    planche.alpha_composite(pan2, (0, y3 + titre_h))
    planche.convert("RGB").save(os.path.join(sortie, "planche-prototype.png"), optimize=True)
    C.journal("planche écrite dans " + sortie)


if __name__ == "__main__":
    main(sys.argv[1:])
