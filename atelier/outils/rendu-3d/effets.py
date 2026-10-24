# -*- coding: utf-8 -*-
"""Effets du champ de bataille : projectiles (flèche, carreau, pierre), nuage de poussière, éclats.

Usage : python3 atelier/outils/rendu-3d/effets.py [nom ...]
Sorties (jeu/assets/images/td/) :
  effet-fleche.png 24 × 6 px logiques, effet-carreau.png 32 × 8, effet-pierre.png 14 × 14 : projectiles pointés vers
  +X (le jeu les tourne selon leur trajectoire), ancrage au centre ;
  effet-poussiere.png : bande de 5 images de 48 × 48 (le nuage de terre gonfle et se dissipe), ancrage bas-centre moins
  8 px ; le jeu s'en sert aussi, réduit, pour la bouffée d'un coup porté à un soldat (sans sang) ;
  effet-eclats.png : bande de 4 images de 32 × 32 (éclats de bois et de pierre qui s'écartent), ancrage au centre :
  pierres de trébuchet et brèches seulement ; sans trait de contour, bords sans frange sombre.
Même lumière que tout le reste ; projectiles sans ombre (ils sont en l'air).
"""
import math
import os
import random
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import commun as C  # noqa: E402
import bmesh  # noqa: E402
import bpy  # noqa: E402
from mathutils import Vector, Matrix  # noqa: E402

import engins as E  # noqa: E402

V = Vector


def scene(largeur, hauteur, ppm, ancre_bas, ancre_x=None, surech=4):
    C.reinitialiser()
    C.installer_lumiere()
    C.lumiere_appoint()
    C.lumiere_contour(1.2)
    W, H = largeur * C.ECHELLE * surech, hauteur * C.ECHELLE * surech
    C.camera_trois_quarts(W, H, ppm * C.ECHELLE * surech, ancre_bas * C.ECHELLE * surech,
                          ancre_x_px=None if ancre_x is None else ancre_x * C.ECHELLE * surech)


def plumes(nom, base, longueur, hauteur, mat, n=3):
    """Empennage : trois plumes triangulaires autour de la hampe, près du talon."""
    objs = []
    for k in range(n):
        a = 2 * math.pi * k / n + 0.3
        bm = bmesh.new()
        d = V((0, math.cos(a), math.sin(a)))
        p = [bm.verts.new(base), bm.verts.new(base + V((longueur, 0, 0))), bm.verts.new(base + V((longueur * 0.25, 0, 0)) + d * hauteur),
             bm.verts.new(base + d * hauteur * 0.7)]
        bm.faces.new(p)
        ob = C.objet_maillage(nom + "_plume%d" % k, bm, mat)
        ob.modifiers.new("ep", "SOLIDIFY").thickness = 0.004
        objs.append(ob)
    return objs


def fleche(carreau=False):
    """Flèche (ou carreau de baliste, plus court et plus gros), pointée vers +X, centrée sur l'origine, à 1 m du sol.

    Un trait fin, pas un crayon : hampe de bois sombre (#5b4026) de 1,25 px logique (flèche) ou 1,5 px (carreau), sans
    liseré, pointe d'acier, empennage clair (#cfc3a6) bien visible au talon : la hampe se lit sur la route claire,
    l'empennage sur l'herbe sombre.
    Carreau : pointe de 1,5 × le diamètre de la hampe au plus, longue de 15 % du total (plus de « flèche de panneau »)."""
    bois = C.mat_simple("hampe", "#5b4026", rugosite=0.7)
    fer = C.mat_metal("fer_p", "#8d8579", rugosite=0.4, metal=0.8)
    plume = C.mat_simple("plume", "#cfc3a6", rugosite=0.95)
    L = 0.9 if not carreau else 1.05
    r = 0.0284 if not carreau else 0.031       # diamètre : 1,25 px logique à 22 px/m ; 1,5 px à 24 px/m
    z = 1.0
    hp = 0.11 if not carreau else 0.15 * L
    rp = r * (1.45 if not carreau else 1.5)
    a, b = V((-L / 2, 0, z)), V((L / 2 - hp, 0, z))
    objs = [E.poutre("hampe", a, b, r * 2, bois)]
    pointe = C.cone("pointe", rp, hp, (0, 0, 0), fer, segments=8)
    pointe.rotation_euler = (0, math.pi / 2, 0)
    pointe.location = b
    objs.append(pointe)
    objs += plumes("emp", a + V((0.02, 0, 0)), 0.22 if not carreau else 0.2, 0.075 if not carreau else 0.08, plume)
    return objs


def pierre():
    """Pierre de trébuchet : bloc grossièrement taillé (icosphère déformée), texture de pierre."""
    rnd = random.Random(4)
    bm = bmesh.new()
    bmesh.ops.create_icosphere(bm, subdivisions=2, radius=0.3)
    for v in bm.verts:
        v.co *= 1 + rnd.uniform(-0.12, 0.12)
    ob = C.objet_maillage("pierre", bm, C.mat_ph("pierre_p", "rustic_stone_wall", echelle_m=0.6, cible="#8f8574", contraste=1.3,
                                                  bosse=0.6))
    for f in ob.data.polygons:
        f.use_smooth = True
    ob.location = (0, 0, 1.0)
    ob.rotation_euler = (0.4, 0.2, 0.7)
    return [ob]


def mat_poussiere(opacite, effiloche=0.5):
    """Poussière de terre : ocre clair (#d2bf98) en haut, dessous brun (#8a7050) : une poussière de chemin, pas un coton
    gris ni un buisson. Bords très effilochés par un bruit fin, opacité réglable (le nuage se dissipe).
    Le dégradé suit la hauteur dans le monde (0,15 m → 1,1 m) : le bas des bouffées fonce un peu, le haut s'éclaircit."""
    m, nt, p = C.nouveau_materiau("poussiere%.2f-%.2f" % (opacite, effiloche))
    p.inputs["Roughness"].default_value = 1.0
    p.inputs["Specular IOR Level"].default_value = 0.0
    geo = nt.nodes.new("ShaderNodeNewGeometry")
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    nt.links.new(geo.outputs["Position"], sep.inputs["Vector"])
    haut = nt.nodes.new("ShaderNodeMapRange")
    haut.inputs["From Min"].default_value = 0.15
    haut.inputs["From Max"].default_value = 1.1
    nt.links.new(sep.outputs["Z"], haut.inputs["Value"])
    teinte = T_mix(nt, haut.outputs["Result"], C.couleur("#8a7050"), C.couleur("#d2bf98"))
    nt.links.new(teinte, p.inputs["Base Color"])
    tc = nt.nodes.new("ShaderNodeTexCoord")
    nz = nt.nodes.new("ShaderNodeTexNoise")
    nz.inputs["Scale"].default_value = 9.0
    nz.inputs["Detail"].default_value = 10.0
    try:
        nz.inputs["Roughness"].default_value = 0.65      # grain plus fin : des bords effilochés, pas des boules lisses
    except Exception:
        pass
    nt.links.new(tc.outputs["Object"], nz.inputs["Vector"])
    fr = nt.nodes.new("ShaderNodeLayerWeight")
    fr.inputs["Blend"].default_value = 0.45
    mr = nt.nodes.new("ShaderNodeMapRange")
    # le bruit module la densité ((1 − effiloche) à 1 × l'opacité) : nuage plein au début (pas une éponge), qui
    # s'effiloche en se dissipant
    mr.inputs["From Min"].default_value = 0.3
    mr.inputs["From Max"].default_value = 0.6
    mr.inputs["To Min"].default_value = opacite * (1 - effiloche)
    mr.inputs["To Max"].default_value = opacite
    nt.links.new(nz.outputs["Factor"], mr.inputs["Value"])
    inv = nt.nodes.new("ShaderNodeMath"); inv.operation = "SUBTRACT"; inv.inputs[0].default_value = 1.0
    nt.links.new(fr.outputs["Facing"], inv.inputs[1])
    # cœur des bouffées plus dense que les bords : (1 − facing) ** 1,7 ; les bords s'effacent tout à fait (pas de
    # silhouette nette de boule)
    pw = nt.nodes.new("ShaderNodeMath"); pw.operation = "POWER"; pw.inputs[1].default_value = 1.7
    nt.links.new(inv.outputs[0], pw.inputs[0])
    mul = nt.nodes.new("ShaderNodeMath"); mul.operation = "MULTIPLY"
    nt.links.new(mr.outputs["Result"], mul.inputs[0])
    nt.links.new(pw.outputs[0], mul.inputs[1])
    nt.links.new(mul.outputs[0], p.inputs["Alpha"])
    try:
        m.surface_render_method = "BLENDED"
    except Exception:
        pass
    return m


def T_mix(nt, fac, a, b):
    """Mélange de deux couleurs (a si fac = 0, b si fac = 1) ; a et b : tuples RGBA linéaires."""
    mx = nt.nodes.new("ShaderNodeMix")
    mx.data_type = "RGBA"
    nt.links.new(fac, C._entree(mx, "Factor", "VALUE"))
    C._entree(mx, "A", "RGBA").default_value = a
    C._entree(mx, "B", "RGBA").default_value = b
    return C._sortie(mx, "RGBA")


def poussiere(k, n=5):
    """Nuage de poussière (image k sur n) : bouffées qui gonflent, montent un peu et pâlissent, sans ombre portée ni
    ombre propre (un voile de terre, pas un volume plein).

    Écart au centre d = (0,6 + 1,4 t) et rayon r = (0,8 + 1,2 t) (fois un tirage par bouffée) : le nuage couvre environ
    55 % de la largeur de l'image à l'image 2 et 80 % à l'image 4 ; opacité maximale 0,45 à l'image 1 et 0,36 à
    l'image 2, puis il se dissipe ; bords effilochés dès le début (le bruit creuse la densité de 90 % puis 100 %)."""
    rnd = random.Random(11)
    t = (k + 0.6) / n
    t0 = 0.6 / n
    opa = OPACITE_POUSSIERE * ((1 - t) / (1 - t0)) ** 1.1
    m = mat_poussiere(opa, 0.9 + 0.1 * t)
    objs = []
    pos = []
    for i in range(16):
        a = 2 * math.pi * i / 12 + rnd.uniform(-0.3, 0.3)
        d = rnd.uniform(0.2, 0.75) * (0.6 + 1.4 * t) * ECART_POUSSIERE
        r = rnd.uniform(0.32, 0.55) * (0.8 + 1.2 * t) * RAYON_POUSSIERE
        # le nuage monte en gonflant (+0,3 m à la fin) : il reste dans son image, sans toucher le bas
        pos.append((d * math.cos(a), d * math.sin(a) * 0.7, r * 0.75 + 0.45 * t * rnd.random() + 0.3 * t, r))
    mx = sum(p[0] for p in pos) / len(pos)
    my = sum(p[1] for p in pos) / len(pos)
    for i, (x, y, z, r) in enumerate(pos):
        o = C.sphere("bouffee%d" % i, r, (x - mx, y - my, z), m, subdiv=3, echelle=(1.0, 1.0, 0.8))
        o.visible_shadow = False                # ni ombre portée au sol, ni ombre d'une bouffée sur l'autre
        objs.append(o)
    return objs


ECART_POUSSIERE = 0.88    # réglages fins de la taille du nuage (mesurée par mesurer_poussiere())
OPACITE_POUSSIERE = 0.45  # opacité maximale du nuage (0,45 puis 0,36 : la route et les troupes se voient à travers)
RAYON_POUSSIERE = 0.88


def eclats(k, n=4):
    """Éclats (image k sur n) : 7 copeaux de bois et éclats de pierre de 3 à 5 px logiques (0,29 à 0,48 m à 10,5 px/m),
    projetés en gerbe puis retombant. Sans trait de contour ni frange sombre (alpha prémultiplié à la réduction, couleur
    des bords tirée des pixels opaques voisins) : ils se lisent par leur seule lumière, comme le reste du rendu."""
    rnd = random.Random(5)
    t = (k + 0.5) / n
    bois = C.mat_simple("copeau", "#a27b4c", rugosite=0.8)
    pierre = C.mat_ph("eclat", "rustic_stone_wall", echelle_m=0.6, cible="#a39887", contraste=1.2, bosse=0.4)
    objs = []
    for i in range(7):
        a = 2 * math.pi * i / 7 + rnd.uniform(-0.35, 0.35)
        v = rnd.uniform(0.55, 1.0)
        dx, dy = math.cos(a) * v * t * 1.1, math.sin(a) * v * t * 0.9
        z = 1.0 + rnd.uniform(0.8, 1.5) * t - 1.6 * t * t
        L = rnd.uniform(0.29, 0.48)
        if i % 2:
            o = C.boite("eclat%d" % i, L, L * 0.42, L * 0.28, (dx, dy, z), bois, base=False)       # copeau allongé
        else:
            o = C.boite("eclat%d" % i, L * 0.8, L * 0.7, L * 0.55, (dx, dy, z), pierre, base=False)  # éclat trapu
            C.biseau(o, 0.04)
        o.rotation_euler = (rnd.uniform(0, 6), rnd.uniform(0, 6), rnd.uniform(0, 6) + 3 * t)
        objs.append(o)
    return objs


# nom -> (fabrique(k), (w, h) logiques, images, (ax, ay) logiques, px/m, ombre)
EFFETS = {
    "effet-fleche": (lambda k: fleche(False), (24, 6), 1, (12, 3), 22.0, False),
    "effet-carreau": (lambda k: fleche(True), (32, 8), 1, (16, 4), 24.0, False),
    "effet-pierre": (lambda k: pierre(), (14, 14), 1, (7, 7), 15.0, False),
    "effet-poussiere": (poussiere, (48, 48), 5, (24, 40), 13.0, False),
    "effet-eclats": (eclats, (32, 32), 4, (16, 16), 10.5, False),
}


def adoucir_reflets(img, seuil=226, pente=0.3):
    """Épaule douce sur les reflets (comme pour les troupes) : au-dessus de seuil sur les trois canaux, l'excès est
    ramené à pente × l'excès."""
    import numpy as np
    from PIL import Image
    a = np.array(img.convert("RGBA"), dtype=np.float32)
    rgb = a[..., :3]
    exces = np.clip(rgb.min(axis=-1, keepdims=True) - seuil, 0, None)
    a[..., :3] = rgb - exces * (1 - pente)
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), "RGBA")


def sans_frange(img):
    """Bords sans frange sombre : la couleur des pixels peu couvrants (alpha < 0,9) est remplacée par celle des pixels
    opaques voisins (la couleur s'étend de 4 px vers l'extérieur), l'alpha ne change pas. Une image ainsi faite se fond
    pareil en alpha droit ou prémultiplié."""
    import numpy as np
    from PIL import Image
    a = np.array(img.convert("RGBA"), dtype=np.float32)
    rgb, al = a[..., :3].copy(), a[..., 3]
    connu = al >= 230

    def voisins(t):                          # somme des 3 × 3 voisins (bords répétés)
        p = np.pad(t, [(1, 1), (1, 1)] + [(0, 0)] * (t.ndim - 2), mode="edge")
        return sum(p[1 + dy:p.shape[0] - 1 + dy, 1 + dx:p.shape[1] - 1 + dx] for dy in (-1, 0, 1) for dx in (-1, 0, 1))
    coul = rgb * connu[..., None]
    for _ in range(4):
        n = voisins(connu.astype(np.float32))
        somme = voisins(coul)
        nouveaux = (~connu) & (n > 0)
        coul[nouveaux] = somme[nouveaux] / n[nouveaux][:, None]
        connu = connu | nouveaux
    garde = (al < 230) & connu
    rgb[garde] = coul[garde]
    return Image.fromarray(np.dstack([np.clip(rgb, 0, 255), al]).astype(np.uint8), "RGBA")


def rendre_effet(nom):
    fab, (lw, lh), n, (ax, ay), ppm, ombre = EFFETS[nom]
    images = []
    surech = 4 if lw <= 32 else 2
    for k in range(n):
        # projectiles et éclats : l'ancrage (centre) correspond au point à 1 m du sol ; poussière : au sol
        if nom == "effet-poussiere":
            scene(lw, lh, ppm, lh - ay, surech=surech)
            C.sol_capteur(10)
        else:
            # le point (0, 0, 1 m) doit tomber sur l'ancrage : on descend l'origine de 1 m projeté (cos 40°)
            scene(lw, lh, ppm, (lh - ay) - math.cos(math.radians(C.INCLINAISON)) * ppm, surech=surech)
        objs = fab(k)
        projectile = nom in ("effet-fleche", "effet-carreau")
        img, _ = C.rendre_sprite("%s-%d" % (nom, k), lw * C.ECHELLE, lh * C.ECHELLE, objs, ombre=ombre, surech=surech,
                                 echantillons=48, contour=0.0, epaisseur_contour=1,
                                 net=0.0 if nom in ("effet-poussiere", "effet-eclats") else 0.6, pres=0.2,
                                 force_ombre=0.35, controle=False)
        if projectile:
            img = adoucir_reflets(img)          # un reflet sur la plume ne brûle pas au blanc
        if nom == "effet-eclats":
            img = sans_frange(img)
        C.controle_bords(img, "%s-%d" % (nom, k))
        C.controle_blancs(img, "%s-%d" % (nom, k))
        if nom == "effet-poussiere":
            # jamais opaque (0,45 au plus) : la route et les troupes se voient à travers le nuage
            img.putalpha(img.split()[3].point(lambda v: min(v, int(OPACITE_POUSSIERE * 255))))
        images.append(img)
    C.sauver_sprite(nom, C.bande(images), None, lw, lh, ax, ay, n)


def mesurer_bande(nom, seuil=26):
    """Mesures de lisibilité d'une bande d'effet déjà écrite : par image, largeur couverte (part des colonnes qui ont
    au moins un pixel d'alpha > seuil, soit 0,1), part des pixels au-dessus du seuil et alpha maximal (0..1).
    L'ombre portée (pixels très sombres) ne compte pas : on mesure le nuage ou les éclats eux-mêmes."""
    import numpy as np
    from PIL import Image
    e = C.lire_manifeste()[nom]
    im = np.array(Image.open(os.path.join(C.RACINE, "jeu", e["src"])).convert("RGBA"))
    a = np.where(im[..., :3].max(-1) >= 50, im[..., 3], 0)
    fw = a.shape[1] // e["frames"]
    res = []
    for k in range(e["frames"]):
        f = a[:, k * fw:(k + 1) * fw]
        cols = (f > seuil).any(axis=0)
        res.append((float(cols.mean()), float((f > seuil).mean()), float(f.max()) / 255.0))
        C.journal("%s image %d : largeur couverte %.0f %%, pixels > 0,1 : %.1f %%, alpha max %.2f"
                  % (nom, k + 1, res[-1][0] * 100, res[-1][1] * 100, res[-1][2]))
    return res


def main(args):
    for nom in (args or list(EFFETS)):
        rendre_effet(nom)
        if nom in ("effet-poussiere", "effet-eclats"):
            mesurer_bande(nom)


if __name__ == "__main__":
    main(sys.argv[1:])
