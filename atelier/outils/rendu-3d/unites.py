# -*- coding: utf-8 -*-
"""Troupes du champ de bataille : bandes de 4 images de marche, tournées vers la droite.

Usage : python3 atelier/outils/rendu-3d/unites.py [nom ...] [--images N] [--dossier D]
        python3 atelier/outils/rendu-3d/unites.py --planche <fichier.png> [--avant <dossier>] [--carte gue]
  nom : par exemple unite-fantassins-france (par défaut : toutes les troupes du tableau UNITES)
  --images N : ne rendre que les N premières images de la marche (essais rapides)
  --dossier D : essai ; écrit les bandes dans D, sans toucher à jeu/ ni au manifeste
  --planche F : planche de contrôle (sans Blender) : les troupes posées sur la route d'un terrain, à leur taille en jeu
                (1 ×) et telles qu'affichées à 2 ×, puis chaque bande grossie ; --avant D ajoute les anciennes bandes
                (même nom dans D) à côté des nouvelles, pour comparer.
Sorties : jeu/assets/images/td/unite-<type>-<camp>.png (+ entrées du manifeste sprites.js).
Ancrage : bas-centre moins 4 px logiques (le point de la route est sous les pieds) ; chaque image garde au moins
2 px rendus transparents sur ses bords (contrôle automatique), pour ne jamais déborder sur sa voisine dans la bande.

Échelles : piétons 18 px/m, cavaliers 15 px/m (un cavalier reste plus haut qu'un piéton), champions 20 px/m × 1,15
(hauteur opaque d'au moins 74 px dans l'image de 96 px), tour de siège 6,5 px/m. Hommes d'armes anglais × 1,08 (plus
massifs que la piétaille).
Éclairage : le soleil commun, l'appoint côté caméra et une lumière de contour chaude qui allume le haut des figures.
Lisibilité : liseré sombre léger (opacité 0,45, 1 px rendu) : c'est la lumière de contour (CONTOUR_FORCE) qui détache
les figures du fond, comme dans un pré-rendu à la Age of Empires II, et non un trait d'autocollant.
Anatomie (figurines.py, soldat(fine=True) et cavalier) : jambes galbées 25 % plus fines, genou fléchi de 18 à 56° pendant
la marche, bottes 30 % plus petites, visage dégagé sous le casque des piétons, épées d'environ 0,55 × la hauteur de la
figure à l'écran ; chevaux à encolure plus longue, tête distincte (liste, bout du nez), genoux, jarrets et paturons.
Contrôles : couleur du camp (mesurée à la taille logique) ≥ 20 % sur chaque image de cavalerie, ≥ 18 % sur chaque image
des fantassins omeyyades (ivoire ou vert) ; pas de bleu chez les Anglais ; piétaille anglaise : le fer de la lance dépasse
le haut du casque d'au moins 8 px logiques ; piétailles : hampe de frêne claire (L* ≥ 70 à l'écran) ; journal : longueur de l'épée à l'écran rapportée à la hauteur de la figure.
"""
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import commun as C  # noqa: E402
import figurines as F  # noqa: E402
import engins as E  # noqa: E402

IMAGES = 4  # images de la marche
PIETON, CAVALIER, CHAMPION = 18.0, 15.0, 20.0
SEUIL_CAVALERIE, SEUIL_OMEYYADES = 0.20, 0.18
MARGE_HAUT = 2.0      # px logiques laissés libres au-dessus de la pointe de la lance de la piétaille anglaise
HAMPE_L_MIN = 70      # clarté minimale (L*) de la hampe de frêne des piétailles, mesurée sur l'image finale
LANCE_MIN = 8          # px logiques : la lance de la piétaille anglaise dépasse au moins d'autant le haut du casque
CONTOUR, EPAISSEUR_CONTOUR = 0.45, 1

# nom -> (fabrique, (largeur, hauteur) logiques d'une image, ancrage bas en px logiques, px logiques par mètre)
UNITES = {
    "unite-fantassins-france": (lambda ph: F.soldat("f", "france", "fantassin", ph), (40, 40), 4, PIETON),
    "unite-cavaliers-france": (lambda ph: F.cavalier("c", "france", ph, lourd=True), (40, 40), 4, CAVALIER),
    "unite-belier-france": (lambda ph: E.tour_de_siege("b", "france", ph), (56, 64), 4, 6.5),
    "unite-pietaille-angleterre": (lambda ph: F.soldat("p", "angleterre", "pietaille", ph, echelle=0.95,
                                                       plafond=(40 - 4 - MARGE_HAUT) / PIETON), (40, 40), 4, PIETON),
    "unite-cavaliers-angleterre": (lambda ph: F.cavalier("c", "angleterre", ph), (40, 40), 4, CAVALIER),
    "unite-hommes-angleterre": (lambda ph: F.soldat("h", "angleterre", "homme_armes", ph, echelle=1.08, recul_y=0.14),
                                (40, 40), 4, PIETON),
    "unite-champion-angleterre": (lambda ph: F.soldat("k", "angleterre", "champion", ph, echelle=1.15, recul_y=0.22), (48, 48), 4, CHAMPION),
    "unite-pietaille-omeyyades": (lambda ph: F.soldat("p", "omeyyades", "pietaille", ph), (40, 40), 4, PIETON),
    "unite-cavaliers-omeyyades": (lambda ph: F.cavalier("c", "omeyyades", ph), (40, 40), 4, CAVALIER),
    "unite-hommes-omeyyades": (lambda ph: F.soldat("h", "omeyyades", "homme_armes", ph), (40, 40), 4, PIETON),
    "unite-champion-omeyyades": (lambda ph: F.soldat("k", "omeyyades", "champion", ph, echelle=1.15, recul_y=0.22), (48, 48), 4, CHAMPION),
}


# ---------------------------------------------------------------- mesures à l'écran (avant le rendu)
def boite_ecran(objs, motifs, exclure=False, ech=1.0):
    """Boîte (x0, y0, x1, y1) en pixels de l'image rendue des sommets (modificateurs appliqués) des objets dont le nom
    contient l'un des motifs (ou n'en contient aucun si exclure) ; y compté vers le bas. ech : divise les pixels."""
    from bpy_extras.object_utils import world_to_camera_view
    s = C.bpy.context.scene
    C.bpy.context.view_layer.update()
    cam = s.camera
    W, H = s.render.resolution_x, s.render.resolution_y
    dg = C.bpy.context.evaluated_depsgraph_get()
    xs, ys = [], []
    for o in objs:
        if o.type != "MESH" or not o.visible_camera:
            continue
        pris = any(m in o.name for m in motifs)
        if pris == exclure:
            continue
        oe = o.evaluated_get(dg)
        me = oe.to_mesh()
        mw = oe.matrix_world
        for v in me.vertices:
            p = world_to_camera_view(s, cam, mw @ v.co)
            xs.append(p.x * W)
            ys.append((1 - p.y) * H)
        oe.to_mesh_clear()
    if not xs:
        return None
    return (min(xs) / ech, min(ys) / ech, max(xs) / ech, max(ys) / ech)


def axe_hampe_ecran(objs, ech, t0=0.72, t1=0.95, n=6):
    """Points de l'écran (px de l'image finale ÷ ech) le long du haut de la hampe de lance (entre t0 et t1 de sa
    longueur) : l'axe va du centre du premier anneau du tube au centre du dernier."""
    from bpy_extras.object_utils import world_to_camera_view
    s = C.bpy.context.scene
    cam = s.camera
    W, H = s.render.resolution_x, s.render.resolution_y
    dg = C.bpy.context.evaluated_depsgraph_get()
    for o in objs:
        if o.type == "MESH" and o.name.endswith("_hampe"):
            oe = o.evaluated_get(dg)
            me = oe.to_mesh()
            vs = [oe.matrix_world @ v.co for v in me.vertices]
            oe.to_mesh_clear()
            a = sum(vs[:8], C.Vector()) / 8
            b = sum(vs[8:16], C.Vector()) / 8
            pts = []
            for i in range(n):
                p = world_to_camera_view(s, cam, a.lerp(b, t0 + (t1 - t0) * i / (n - 1)))
                pts.append((p.x * W / ech, (1 - p.y) * H / ech))
            return pts
    return []


def clarte_hampe(img, pts):
    """L* médian de la hampe à l'écran : à chaque point de l'axe, le pixel opaque le plus clair d'une fenêtre de
    3 × 3 px (la face éclairée de la hampe, large d'un ou deux pixels)."""
    import numpy as np
    a = np.array(img.convert("RGBA"), dtype=np.float32)
    vals = []
    for (x, y) in pts:
        xi, yi = int(round(x)), int(round(y))
        f = a[max(0, yi - 1):yi + 2, max(0, xi - 1):xi + 2].reshape(-1, 4)
        f = f[f[:, 3] > 160]
        if len(f):
            c = f[:, :3] / 255.0
            lin = np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
            Y = 0.2126 * lin[:, 0] + 0.7152 * lin[:, 1] + 0.0722 * lin[:, 2]
            vals.append(float((116 * np.cbrt(Y) - 16).max()))
    return float(np.median(vals)) if vals else 0.0


ARMES = ("_lame", "_garde", "_pommeau", "_hampe", "_fer", "_fanion", "_tete_masse", "_manche", "_ailette", "_ecu", "_umbo")


def mesures(nom, objs, surech, k):
    """Contrôles de lecture mesurés sur la géométrie projetée (px logiques : rendu ÷ surech ÷ 2)."""
    ech = surech * C.ECHELLE
    corps = boite_ecran(objs, ARMES, exclure=True, ech=ech)
    if corps is None:
        return
    haut_figure = corps[3] - corps[1]
    lame = boite_ecran(objs, ("_lame", "_garde", "_pommeau"), ech=ech)
    if lame:
        l = math.hypot(lame[2] - lame[0], lame[3] - lame[1])
        C.journal("%s-%d : épée %.1f px logiques pour une figure de %.1f px (rapport %.2f)" % (nom, k, l, haut_figure, l / haut_figure))
    if nom == "unite-pietaille-angleterre":
        casque = boite_ecran(objs, ("_calotte", "_bord"), ech=ech)
        fer = boite_ecran(objs, ("_fer", "_hampe"), ech=ech)
        if casque and fer:
            ecart = casque[1] - fer[1]
            C.journal("%s-%d : la lance dépasse le casque de %.1f px logiques (minimum %d)" % (nom, k, ecart, LANCE_MIN))
            return ecart
    return None


def adoucir_reflets(img, seuil=226, pente=0.35):
    """Épaule douce sur les reflets : au-dessus de seuil (sur les trois canaux à la fois), l'excès est ramené à
    pente × l'excès. Les éclats du soleil sur les casques et les lames restent visibles mais ne brûlent plus au blanc
    pur (contrôle des blancs : trois canaux > 235 sur au plus 0,3 % des pixels opaques)."""
    import numpy as np
    from PIL import Image
    a = np.array(img.convert("RGBA"), dtype=np.float32)
    rgb = a[..., :3]
    mn = rgb.min(axis=-1, keepdims=True)
    exces = np.clip(mn - seuil, 0, None)
    rgb -= exces * (1 - pente)
    a[..., :3] = rgb
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), "RGBA")


# ---------------------------------------------------------------- rendu d'une bande
def rendre_unite(nom, nb_images=IMAGES, surech=2, dossier=None):
    fabrique, (lw, lh), ancre, ppm = UNITES[nom]
    pw, ph = lw * C.ECHELLE, lh * C.ECHELLE           # taille finale d'une image (2 × logique)
    camp = nom.rsplit("-", 1)[1]
    images = []
    for k in range(nb_images):
        phase = 2 * math.pi * k / IMAGES
        C.reinitialiser()
        C.installer_lumiere()
        C.lumiere_appoint()
        C.lumiere_contour()
        C.camera_trois_quarts(pw * surech, ph * surech, ppm * C.ECHELLE * surech, ancre * C.ECHELLE * surech)
        C.sol_capteur(14)
        objs, pivot = fabrique(phase)
        ecart = mesures(nom, objs, surech, k)
        hampe = axe_hampe_ecran(objs, surech) if "pietaille" in nom else []
        img, _ = C.rendre_sprite("%s-%d" % (nom, k), pw, ph, objs, surech=surech, echantillons=64,
                                 contour=CONTOUR, epaisseur_contour=EPAISSEUR_CONTOUR, pres=0.10, controle=False)
        img = adoucir_reflets(img)
        C.controle_bords(img, "%s-%d" % (nom, k))
        C.controle_blancs(img, "%s-%d" % (nom, k))
        if hampe:
            lh_ = clarte_hampe(img, hampe)
            C.journal("%s-%d : hampe de la lance, L* %.0f à l'écran (minimum %d)" % (nom, k, lh_, HAMPE_L_MIN))
            if lh_ < HAMPE_L_MIN:
                C._refuser(img, "%s-%d" % (nom, k), "hampe trop sombre (L* %.0f < %d)" % (lh_, HAMPE_L_MIN))
        if ecart is not None and ecart < LANCE_MIN:
            C._refuser(img, "%s-%d" % (nom, k), "la lance ne dépasse le casque que de %.1f px logiques (< %d)" % (ecart, LANCE_MIN))
        if "cavaliers" in nom:
            C.controle_troupe(img, "%s-%d" % (nom, k), camp, SEUIL_CAVALERIE)
        elif camp == "omeyyades":
            C.controle_troupe(img, "%s-%d" % (nom, k), camp, SEUIL_OMEYYADES)
        else:
            C.journal("%s-%d : couleur du camp %.1f %% (taille logique)" % (nom, k, 100 * C.part_couleur_troupe(img, camp)))
        if camp == "angleterre":
            C.controle_sans_bleu(img, "%s-%d" % (nom, k))
        images.append(img)
    img = C.bande(images)
    if dossier:
        os.makedirs(dossier, exist_ok=True)
        chemin = os.path.join(dossier, nom + ".png")
        C.sauver_png(img, chemin) if chemin.startswith(C.RACINE) else img.save(chemin, optimize=True)
        C.journal("essai écrit dans %s (manifeste inchangé)" % chemin)
        return chemin
    C.sauver_sprite(nom, img, None, lw, lh, lw // 2, lh - ancre, nb_images)
    return C.chemin_td(nom + ".png")[0]


# ---------------------------------------------------------------- planche de contrôle (sans rendu)
def coin_herbe(carte, w=160, h=80):
    """Rectangle (x0, y0, x1, y1) de pré (dans la plaine, loin de la route, de la rivière et des emplacements)."""
    obstacles = list(carte["route"]) + list(carte.get("riviere") or []) + list(carte["emplacements"]) \
        + list(carte["emplacementsRivaux"])
    for cy in range(200, 470, 10):
        for cx in range(200, 800, 10):
            coins = [(cx + dx, cy + dy) for dx in (-w / 2, 0, w / 2) for dy in (-h / 2, 0, h / 2)]
            if any(((x - 500) / 445) ** 2 + ((y - 330) / 285) ** 2 > 0.7 for x, y in coins):
                continue
            if all(min(math.dist(c, o) for c in coins) > 55 for o in obstacles):
                return (cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2)
    return (420, 290, 420 + w, 290 + h)


def planche(sortie, avant=None, id_carte="gue"):
    """Planche de contrôle des troupes : (1) un morceau de terrain affiché comme en jeu sur un écran à 2 × (le fichier
    terrain tel quel, les bandes telles quelles), avec chaque troupe posée sur la route ; (2) le même morceau à la taille
    logique (1 ×) ; (3) chaque bande grossie 2 × de plus (4 × la taille logique), sur l'herbe et sur la route, à côté de
    l'ancienne version si --avant est donné."""
    from PIL import Image, ImageDraw
    import planche as P
    import terrains as T
    man = C.lire_manifeste()
    carte = T.lire_cartes()[id_carte]
    route = carte["route"]
    _, _, longueur = P.sur_route(route, 0)
    terrain = Image.open(os.path.join(C.TD, "terrain-%s.jpg" % id_carte)).convert("RGBA")   # 2000 × 1320 (2 ×)
    k = terrain.size[0] / T.LARG
    # troupes posées le long de la route : France vers la droite, ennemis vers la gauche (miroir), images variées
    poses = [("unite-belier-france", 70, 0, False, 0), ("unite-cavaliers-france", 110, -5, False, 1),
             ("unite-fantassins-france", 140, 6, False, 0), ("unite-fantassins-france", 160, -6, False, 2),
             ("unite-fantassins-france", 180, 5, False, 3),
             ("unite-pietaille-angleterre", 230, -6, True, 0), ("unite-pietaille-angleterre", 248, 6, True, 2),
             ("unite-hommes-angleterre", 272, -5, True, 1), ("unite-hommes-angleterre", 292, 6, True, 3),
             ("unite-cavaliers-angleterre", 322, 0, True, 2), ("unite-champion-angleterre", 356, 0, True, 1),
             ("unite-pietaille-omeyyades", 400, -6, True, 1), ("unite-pietaille-omeyyades", 418, 6, True, 3),
             ("unite-hommes-omeyyades", 442, -5, True, 0), ("unite-cavaliers-omeyyades", 474, 0, True, 1),
             ("unite-champion-omeyyades", 510, 0, True, 2)]
    vue = terrain.copy()
    boites = []
    for nom, s, cote, miroir, image in sorted(poses, key=lambda p: P.sur_route(route, p[1], p[2])[1]):
        x, y, _ = P.sur_route(route, s, cote)
        b = P.poser(vue, nom, x, y, image, miroir)
        if b:
            boites.append(b)
    x0 = max(0, min(b[0] for b in boites) - 20)
    y0 = max(0, min(b[1] for b in boites) - 20)
    x1 = min(T.LARG, max(b[2] for b in boites) + 20)
    y1 = min(T.HAUT, max(b[3] for b in boites) + 20)
    vue2 = vue.crop((round(x0 * k), round(y0 * k), round(x1 * k), round(y1 * k)))
    vue1 = vue2.resize((vue2.size[0] // 2, vue2.size[1] // 2), Image.LANCZOS)
    # bandes grossies, sur un échantillon d'herbe et un échantillon de route
    herbe = terrain.crop(tuple(round(v * k) for v in coin_herbe(carte)))
    xr, yr, _ = P.sur_route(route, longueur * 0.42)
    sol_route = terrain.crop((round((xr - 30) * k), round((yr - 12) * k), round((xr + 30) * k), round((yr + 12) * k)))
    noms = [n for n in UNITES if n in man]
    blocs = []
    for n in noms:
        e = man[n]
        neuf = Image.open(os.path.join(C.RACINE, "jeu", e["src"])).convert("RGBA")
        vieux = None
        if avant and os.path.exists(os.path.join(avant, n + ".png")):
            vieux = Image.open(os.path.join(avant, n + ".png")).convert("RGBA")
        blocs.append((n, e, vieux, neuf))
    zoom = 2
    L = max(vue2.size[0], 1200)
    marge, titre = 16, 30
    f, f2 = P.police(15, True), P.police(13)

    def fond_bande(w, h):
        """Moitié haute : herbe ; moitié basse : terre de la route (les deux fonds où l'on voit les troupes)."""
        fb = Image.new("RGBA", (w, h))
        fb.paste(herbe.resize((w, h // 2 + 1)), (0, 0))
        fb.paste(sol_route.resize((w, h - h // 2)), (0, h // 2))
        return fb

    lignes = []
    for n, e, vieux, neuf in blocs:
        nz = neuf.resize((neuf.size[0] * zoom, neuf.size[1] * zoom), Image.NEAREST)
        vz = vieux.resize((vieux.size[0] * zoom, vieux.size[1] * zoom), Image.NEAREST) if vieux else None
        lignes.append((n, e, vz, nz))
    # chaque troupe : l'ancienne bande (si --avant) au-dessus de la nouvelle, avec l'étiquette « avant » / « après »
    eti = 70 if avant else 0
    L = max(L, max(nz.size[0] for (_, _, _, nz) in lignes) + 2 * marge + eti)
    h_bandes = sum(nz.size[1] + (vz.size[1] + 6 if vz else 0) + titre + marge for (_, _, vz, nz) in lignes)
    H = titre * 3 + vue2.size[1] + vue1.size[1] + h_bandes + marge * 6
    P_ = Image.new("RGBA", (L, H), (40, 34, 28, 255))
    d = ImageDraw.Draw(P_)
    y = marge
    d.text((marge, y), "Troupes sur la route (carte « %s ») telles qu'affichées à 2 × ; France vers la droite, ennemis "
           "vers la gauche" % carte["nom"], fill=(240, 228, 200, 255), font=f)
    y += titre
    P_.alpha_composite(vue2, (0, y))
    y += vue2.size[1] + marge
    d.text((marge, y), "Le même morceau à la taille logique (1 ×) : ce que voit l'élève sur un écran ordinaire",
           fill=(240, 228, 200, 255), font=f)
    y += titre
    P_.alpha_composite(vue1, (0, y))
    y += vue1.size[1] + marge
    d.text((marge, y), "Bandes de marche grossies (4 × la taille logique), moitié haute sur l'herbe, moitié basse sur la "
           "route%s ; croix rouge = point d'ancrage" % (" : l'ancienne version au-dessus de la nouvelle" if avant else ""),
           fill=(240, 228, 200, 255), font=f)
    y += titre
    for n, e, vz, nz in lignes:
        d.text((marge, y), "%s  (%d × %d px logiques, %d images)" % (n, e["w"], e["h"], e["frames"]), fill=(230, 220, 195, 255), font=f2)
        y += titre - 8
        x = marge + eti
        if vz:
            d.text((marge, y + vz.size[1] // 2 - 8), "avant", fill=(200, 190, 170, 255), font=f2)
            P_.alpha_composite(fond_bande(vz.size[0], vz.size[1]), (x, y))
            P_.alpha_composite(vz, (x, y))
            y += vz.size[1] + 6
            d.text((marge, y + nz.size[1] // 2 - 8), "après", fill=(240, 228, 200, 255), font=f)
        P_.alpha_composite(fond_bande(nz.size[0], nz.size[1]), (x, y))
        P_.alpha_composite(nz, (x, y))
        for kk in range(e["frames"]):
            ax = x + (kk * e["w"] + e["ax"]) * 2 * zoom
            ay = y + e["ay"] * 2 * zoom
            d.line((ax - 4, ay, ax + 4, ay), fill=(255, 60, 60, 255))
            d.line((ax, ay - 4, ax, ay + 4), fill=(255, 60, 60, 255))
        y += nz.size[1] + marge + 8
    os.makedirs(os.path.dirname(os.path.abspath(sortie)), exist_ok=True)
    P_.convert("RGB").crop((0, 0, L, y + marge)).save(sortie, optimize=True)
    C.journal("planche des troupes écrite : %s" % sortie)
    return sortie


def poids_troupes():
    """Poids total des bandes de troupes (octets décimaux)."""
    t = 0
    for n in UNITES:
        ch = C.chemin_td(n + ".png")[0]
        if os.path.exists(ch):
            t += os.path.getsize(ch)
    return t


def main(args):
    nb = IMAGES
    dossier = None
    if "--planche" in args:
        i = args.index("--planche")
        avant = args[args.index("--avant") + 1] if "--avant" in args else None
        id_carte = args[args.index("--carte") + 1] if "--carte" in args else "gue"
        planche(args[i + 1], avant, id_carte)
        return
    if "--images" in args:
        i = args.index("--images")
        nb = int(args[i + 1])
        args = args[:i] + args[i + 2:]
    if "--dossier" in args:
        i = args.index("--dossier")
        dossier = args[i + 1]
        args = args[:i] + args[i + 2:]
    noms = args or list(UNITES)
    for nom in noms:
        rendre_unite(nom, nb, dossier=dossier)
    if not dossier:
        C.journal("troupes : %d octets au total" % poids_troupes())


if __name__ == "__main__":
    main(sys.argv[1:])
