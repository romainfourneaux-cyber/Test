# -*- coding: utf-8 -*-
"""Planche de contrôle : les sprites posés sur un terrain à leur vraie taille dans le jeu, puis agrandis.

Usage : python3 atelier/outils/rendu-3d/planche.py --terrain <terrain.jpg> --sortie <dossier> [--carte gue]
Écrit <dossier>/proto-en-jeu.png (1000 × 660, vue telle qu'en jeu à l'échelle 1, rival anglais),
<dossier>/proto-en-jeu-sud.png (la même carte tenue par les Omeyyades, comme « Le Grand Fleuve »),
<dossier>/planche-prototype.png (les deux vues + chaque sprite à 2 × sur fond gris neutre + contrôle des blasons).
Ne lance pas Blender : simple montage PIL à partir des images déjà rendues et du manifeste.

Ordre d'affichage simulé (celui que le jeu devrait suivre) : terrain, puis passe « sol » (ombres portées des tours et des
places fortes), puis tous les sprites triés par le y de leur point d'ancrage ; les troupes à moins de 55 px d'un bout de
la route passent sous la place forte (elles y entrent) ; enfin la « vue aux rayons X » des jeux de stratégie : chaque
troupe dont la boîte croise une tour ou une place forte dessinée après elle est redessinée par-dessus à 45 % d'opacité,
pour qu'aucune troupe ne soit jamais entièrement cachée (note (g) pour l'intégrateur).
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
ENTREE_PLACE = 55        # px : en deçà, la troupe est dessinée sous la place forte


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


def poser(fond, nom, x, y, image=0, miroir=False, opacite=1.0):
    """Pose un sprite à sa taille logique, son point d'ancrage sur (x, y) du canevas 1000 × 660 ; renvoie sa boîte
    (x0, y0, x1, y1) en px logiques (boîte des pixels opaques)."""
    if nom not in C.lire_manifeste():
        return None
    im, e = sprite(nom, image, 0.5 * fond.size[0] / T.LARG, miroir)
    k = fond.size[0] / T.LARG
    ax = (e["w"] - e["ax"]) if miroir else e["ax"]
    pos = (round(x * k - ax * k), round(y * k - e["ay"] * k))
    if opacite < 1.0:
        a = im.split()[3].point(lambda v: int(v * opacite))
        im.putalpha(a)
    fond.alpha_composite(im, pos)
    b = im.split()[3].getbbox()
    if not b:
        return None
    return ((pos[0] + b[0]) / k, (pos[1] + b[1]) / k, (pos[0] + b[2]) / k, (pos[1] + b[3]) / k)


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


def vue_en_jeu(terrain, carte, rival="angleterre"):
    fond = Image.open(terrain).convert("RGBA")
    if fond.size != (T.LARG, T.HAUT):
        fond = fond.resize((T.LARG, T.HAUT), Image.LANCZOS)
    man = C.lire_manifeste()
    route = carte["route"]
    _, _, longueur = sur_route(route, 0)
    pl = carte.get("places") or {"depart": route[0], "arrivee": route[-1]}      # pied des places (la route part des portes)
    places = [("place-france-intact", pl["depart"]), ("place-%s-intact" % rival, pl["arrivee"])]
    emp, riv = carte["emplacements"], carte["emplacementsRivaux"]
    tours = [("tour-archers-france-1", emp[0]), ("tour-piquiers-france-2", emp[2]), ("tour-archers-france-2", emp[3]),
             ("tour-baliste-france-3", emp[5]), ("tour-archers-france-3", emp[7]), ("tour-catapulte-france-3", emp[8])]
    if riv:
        tours.append(("tour-archers-%s-1" % rival, riv[0]))
    if len(riv) > 2:
        tours.append(("tour-baliste-%s-1" % rival, riv[2]))
    pont = carte["ponts"][0] if carte["ponts"] else None
    s_pont = None
    if pont:
        best = 1e9
        for s in range(0, int(longueur), 2):
            x, y, _ = sur_route(route, s)
            d = math.hypot(x - pont["x"], y - pont["y"])
            if d < best:
                best, s_pont = d, s
    troupes = [("unite-fantassins-france", 120, -6, False, 0), ("unite-fantassins-france", 142, 6, False, 2),
               ("unite-fantassins-france", 166, -6, False, 1), ("unite-fantassins-france", 30, 0, False, 3)]
    ennemi_rapide = "unite-cavaliers-%s" % rival if "unite-cavaliers-%s" % rival in man else "unite-cavaliers-angleterre"
    ennemi_pied = "unite-pietaille-%s" % rival if "unite-pietaille-%s" % rival in man else "unite-pietaille-omeyyades"
    if s_pont:
        troupes += [(ennemi_rapide, s_pont - 4, 6, True, 1), (ennemi_rapide, s_pont + 22, -6, True, 3),
                    (ennemi_pied, s_pont + 60, -6, True, 0), (ennemi_pied, s_pont + 78, 6, True, 2)]
    troupes += [(ennemi_pied, longueur - 20, 0, True, 1)]
    # passe « sol » : ombres portées sous tout le reste
    for nom, (x, y) in places + tours:
        poser(fond, "ombre-" + nom, x, y)
    objets = []
    for nom, (x, y) in places + tours:
        objets.append((y, 0, None, lambda n=nom, x=x, y=y, o=1.0: poser(fond, n, x, y, opacite=o)))
    for nom, s, cote, miroir, image in troupes:
        x, y, _ = sur_route(route, s, cote)
        sous = min(s, longueur - s) < ENTREE_PLACE
        objets.append((y if not sous else -1e6, 1, sous,
                       lambda n=nom, x=x, y=y, m=miroir, i=image, o=1.0: poser(fond, n, x, y, i, m, opacite=o)))
    dessines = []
    for cle_y, genre, sous, f in sorted(objets, key=lambda o: (o[0], o[1])):
        dessines.append((genre, sous, f, f()))
    # vue aux rayons X : une troupe recouverte par un bâtiment dessiné après elle est redessinée à 45 % d'opacité
    def croise(a, b):
        return a and b and a[0] < b[2] and b[0] < a[2] and a[1] < b[3] and b[1] < a[3]
    for i, (genre, sous, f, boite) in enumerate(dessines):
        if genre != 1 or sous:
            continue
        if any(g2 == 0 and croise(boite, b2) for (g2, _, _, b2) in dessines[i + 1:]):
            f(o=0.45)
    return fond


def panneau_sprites(noms, largeur, zoom=1, avec_ombre=False):
    """Chaque sprite à 2 × la taille logique (= le PNG tel quel, × zoom) sur gris neutre, avec son nom."""
    marge, titre_h = 20, 40
    f = police(14)
    f2 = police(12)
    man = C.lire_manifeste()
    blocs = []
    for nom in noms:
        if nom not in man:
            continue
        e = man[nom]
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


def planche_blasons_bande(largeur):
    """Contrôle héraldique : lys, lion passant gardant et tour, à 8, 12, 16, 24 et 48 px de haut (tailles réelles)."""
    tailles = (8, 12, 16, 24, 48)
    f = police(16)
    h = 3 * 100 + 50
    p = Image.new("RGBA", (largeur, h), (128, 128, 128, 255))
    d = ImageDraw.Draw(p)
    y = 44
    for camp in ("france", "angleterre", "omeyyades"):
        src = Image.open(C.texture_blason(camp, 384, 256, taille_embleme=0.62, bordure=camp == "omeyyades")).convert("RGB")
        x = 20
        d.text((x, y + 14), camp, fill=(15, 15, 15, 255), font=f)
        x, x2 = 150, 820
        for t in tailles:
            im = src.resize((int(t * 1.5), t), Image.LANCZOS)
            p.paste(im, (x, y))
            big = im.resize((im.size[0] * 2, im.size[1] * 2), Image.NEAREST)
            p.paste(big, (x2, y - 24 if t == 48 else y))
            x += int(t * 1.5) + 24
            x2 += big.size[0] + 24
        y += 100
    d.text((150, h - 22), "taille réelle", fill=(15, 15, 15, 255), font=f)
    d.text((820, h - 22), "les mêmes, grossies 2 × (pixels nets)", fill=(15, 15, 15, 255), font=f)
    return p


def vue_campagne(largeur):
    """Carte de campagne (fond-campagne.jpg) avec les lieux posés à leur position (domaine et prises françaises, places
    rivales visées, provinces encore dans la brume), réduite à la largeur de la planche."""
    import campagne as K
    chemin = os.path.join(C.CAMPAGNE, "fond-campagne.jpg")
    if not os.path.exists(chemin):
        return Image.new("RGBA", (largeur, 40), (40, 34, 28, 255))
    fond = Image.open(chemin).convert("RGBA")
    k = fond.size[0] / 1000.0
    man = C.lire_manifeste()
    pos = K.positions()
    poses = [("domaine", "france"), ("gue", "france"), ("foret", "angleterre"), ("moulin", "brume"), ("col", "brume"),
             ("chateau", "brume"), ("piemont", "france"), ("oliveraie", "omeyyades"), ("fleuve", "brume"),
             ("citadelle", "brume"), ("forteresse", "brume")]
    for lieu, camp in sorted(poses, key=lambda q: pos[q[0]][1]):
        e = man.get("lieu-" + camp)
        if not e:
            continue
        im = Image.open(os.path.join(C.RACINE, "jeu", e["src"])).convert("RGBA")
        x, y = pos[lieu]
        fond.alpha_composite(im, (round((x - e["ax"]) * k), round((y - e["ay"]) * k)))
    return fond.resize((largeur, round(largeur * fond.size[1] / fond.size[0])), Image.LANCZOS)


def main(args):
    terrain = args[args.index("--terrain") + 1]
    sortie = args[args.index("--sortie") + 1]
    id_carte = args[args.index("--carte") + 1] if "--carte" in args else "gue"
    os.makedirs(sortie, exist_ok=True)
    carte = T.lire_cartes()[id_carte]
    vue = vue_en_jeu(terrain, carte, "angleterre")
    vue.convert("RGB").save(os.path.join(sortie, "proto-en-jeu.png"), optimize=True)
    vue_sud = vue_en_jeu(terrain, carte, "omeyyades")
    vue_sud.convert("RGB").save(os.path.join(sortie, "proto-en-jeu-sud.png"), optimize=True)
    man = C.lire_manifeste()
    batis = [n for n in sorted(man) if n.startswith(("place-", "tour-"))]
    autres = [n for n in sorted(man) if n.startswith(("effet-", "lieu-"))]
    troupes = [n for n in sorted(man) if n.startswith("unite-")]
    L = 2000
    pan = panneau_sprites(batis + autres, L)
    pan2 = panneau_sprites(troupes, L, zoom=2)
    bl = planche_blasons_bande(L)
    camp = vue_campagne(L)
    titre_h = 56
    vue2 = vue.resize((L, round(L * T.HAUT / T.LARG)), Image.LANCZOS)
    vue3 = vue_sud.resize((L, round(L * T.HAUT / T.LARG)), Image.LANCZOS)
    hauteur = titre_h * 6 + vue2.size[1] + vue3.size[1] + pan.size[1] + pan2.size[1] + bl.size[1] + camp.size[1]
    planche = Image.new("RGBA", (L, hauteur), (40, 34, 28, 255))
    d = ImageDraw.Draw(planche)
    y = 0
    for titre, bloc in (("Vue en jeu (carte « %s », rival anglais) : sprites à leur taille logique, passe « sol » des ombres, "
                         "affichée ici à 2 ×" % carte["nom"], vue2),
                        ("La même carte tenue par les Omeyyades (« Le Grand Fleuve » utilise ce tracé)", vue3),
                        ("Bâtiments, effets et lieux de campagne à 2 × la taille logique (résolution des fichiers) ; "
                         "croix rouge = point d'ancrage", pan),
                        ("Troupes : les 4 images de la marche, grossies encore 2 × (4 × la taille logique)", pan2),
                        ("Contrôle des blasons à la taille du jeu : lys, lion passant gardant, tour", bl),
                        ("Carte de campagne (fond-campagne.jpg, 2000 × 1060) et lieux posés à leur position "
                         "(France, rivaux visés, provinces dans la brume)", camp)):
        d.text((24, y + 14), titre, fill=(240, 228, 200, 255), font=police(24, True))
        planche.alpha_composite(bloc, (0, y + titre_h))
        y += titre_h + bloc.size[1]
    planche.convert("RGB").save(os.path.join(sortie, "planche-prototype.png"), optimize=True)
    C.journal("planche écrite dans " + sortie)


if __name__ == "__main__":
    main(sys.argv[1:])
