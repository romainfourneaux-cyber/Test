# -*- coding: utf-8 -*-
"""Troupes du champ de bataille : bandes de 4 images de marche. France tournée vers la droite (elle marche vers l'est),
camps rivaux tournés vers la GAUCHE (ils marchent vers l'ouest), sous la même lumière que tout le reste : la figurine
de droite est rendue sous un éclairage en miroir (soleil, appoint et contour symétriques par rapport à l'axe nord-sud),
puis l'image est retournée ; le soleil revient ainsi au nord-ouest, comme sur le terrain, les tours et les places
fortes, et l'ombre tombe au sud-est. Le manifeste porte « face »: "gauche" pour ces bandes : le jeu ne retourne une
bande que si la troupe marche dans l'autre sens que sa face.

Usage : python3 atelier/outils/rendu-3d/unites.py [nom ...] [--images N] [--dossier D] [--bande chute|coup]
        python3 atelier/outils/rendu-3d/unites.py --planche <fichier.png> [--avant <dossier>] [--carte gue]
        python3 atelier/outils/rendu-3d/unites.py --planche <fichier.png> --bande chute|coup [--source D]
  nom : par exemple unite-fantassins-france (par défaut : toutes les troupes du tableau UNITES)
  --images N : ne rendre que les N premières images de la marche (essais rapides)
  --dossier D : essai ; écrit les bandes dans D, sans toucher à jeu/ ni au manifeste
  --bande B : bande de geste au lieu de la marche, pour les dix troupes de GESTES (le bélier n'en a pas) :
              « chute » (4 images : genoux qui plient, buste renversé, au sol, couché, arme à côté ; cavaliers : le cheval
              s'affaisse, le cavalier glisse, au sol, couchés) ou « coup » (4 images : armer, frapper, suivi, revenir ;
              cavaliers : lance couchée, poussée, cheval qui se cabre un peu, retour). Sorties unite-<type>-<camp>-<B>.png,
              même w, h, ax, ay et face que la bande de marche (contrôlé). Une figurine qui tombe est recalée dans son
              image (au plus juste) si elle en sortirait ; une figurine qui frappe ne bouge pas (ses pieds restent sur
              l'ancrage) : si elle sortait de l'image, le rendu est refusé.
  --installer D --bande B : écrit dans jeu/ (et au manifeste) les bandes B d'un essai déjà regardé (dossier D).
  --planche F --bande B : planche de la bande B, chaque troupe grossie avec sa bande de marche au-dessus (même
              ancrage) ; --source D lit les bandes neuves dans D (essai --dossier) au lieu de jeu/.
  --planche F : planche de contrôle (sans Blender) : les troupes posées sur la route d'un terrain, à leur taille en jeu
                (1 ×) et telles qu'affichées à 2 ×, puis chaque bande grossie ; --avant D ajoute les anciennes bandes
                (même nom dans D) à côté des nouvelles, pour comparer.
Sorties : jeu/assets/images/td/unite-<type>-<camp>.png (+ entrées du manifeste sprites.js).
Ancrage : bas-centre moins 4 px logiques (le point de la route est sous les pieds) ; chaque image garde au moins
2 px rendus transparents sur ses bords (contrôle automatique), pour ne jamais déborder sur sa voisine dans la bande.

Échelles : piétons 18 px/m, cavaliers 15 px/m (un cavalier reste plus haut qu'un piéton), champions 20 px/m × 1,15
(hauteur opaque d'au moins 74 px dans l'image de 96 px), tour de siège 6,5 px/m. Hommes d'armes anglais × 1,08 (plus
massifs que la piétaille) ; leur heaume est d'acier gris clair (et non bruni) : à l'échelle du jeu, il se lit comme
un casque et non comme une tête noire.
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
    "unite-fantassins-france": (lambda ph, **g: F.soldat("f", "france", "fantassin", ph, **g), (40, 40), 4, PIETON),
    "unite-cavaliers-france": (lambda ph, **g: F.cavalier("c", "france", ph, lourd=True, **g), (40, 40), 4, CAVALIER),
    "unite-belier-france": (lambda ph, **g: E.tour_de_siege("b", "france", ph), (56, 64), 4, 6.5),
    "unite-pietaille-angleterre": (lambda ph, **g: F.soldat("p", "angleterre", "pietaille", ph, echelle=0.95,
                                                            plafond=(40 - 4 - MARGE_HAUT) / PIETON, **g), (40, 40), 4, PIETON),
    "unite-cavaliers-angleterre": (lambda ph, **g: F.cavalier("c", "angleterre", ph, **g), (40, 40), 4, CAVALIER),
    "unite-hommes-angleterre": (lambda ph, **g: F.soldat("h", "angleterre", "homme_armes", ph, echelle=1.08, recul_y=0.14, **g),
                                (40, 40), 4, PIETON),
    "unite-champion-angleterre": (lambda ph, **g: F.soldat("k", "angleterre", "champion", ph, echelle=1.15, recul_y=0.22, **g),
                                  (48, 48), 4, CHAMPION),
    "unite-pietaille-omeyyades": (lambda ph, **g: F.soldat("p", "omeyyades", "pietaille", ph, **g), (40, 40), 4, PIETON),
    "unite-cavaliers-omeyyades": (lambda ph, **g: F.cavalier("c", "omeyyades", ph, **g), (40, 40), 4, CAVALIER),
    "unite-hommes-omeyyades": (lambda ph, **g: F.soldat("h", "omeyyades", "homme_armes", ph, **g), (40, 40), 4, PIETON),
    "unite-champion-omeyyades": (lambda ph, **g: F.soldat("k", "omeyyades", "champion", ph, echelle=1.15, recul_y=0.22, **g),
                                 (48, 48), 4, CHAMPION),
}
# troupes qui ont des bandes de geste (« -chute », « -coup ») : toutes sauf le bélier (tour de siège)
GESTES = ["unite-fantassins-france", "unite-hommes-angleterre", "unite-hommes-omeyyades", "unite-pietaille-angleterre",
          "unite-pietaille-omeyyades", "unite-cavaliers-france", "unite-cavaliers-angleterre", "unite-cavaliers-omeyyades",
          "unite-champion-angleterre", "unite-champion-omeyyades"]
BANDES = ("chute", "coup")
IMAGES_GESTE = 4
MARGE_GESTE = 2.0     # px logiques laissés libres autour de la géométrie d'une figurine de geste (liseré et ombre compris)


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


def adoucir_reflets(img, seuil=226, pente=0.3):
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
def face(camp):
    """Sens de la bande : les troupes de France marchent vers la droite, celles des camps rivaux vers la gauche."""
    return "droite" if camp == "france" else "gauche"


def lumieres(miroir):
    """Soleil, ciel, appoint et contour communs ; miroir : les mêmes, symétriques par rapport à l'axe nord-sud (soleil
    du nord-est), pour une image qui sera retournée (le soleil revient alors au nord-ouest)."""
    if not miroir:
        C.installer_lumiere()
        C.lumiere_appoint()
        C.lumiere_contour()
        return
    azimut = C.SOLEIL_AZIMUT
    C.SOLEIL_AZIMUT = (360 - azimut) % 360
    try:
        C.installer_lumiere()
    finally:
        C.SOLEIL_AZIMUT = azimut
    t = math.radians(C.INCLINAISON + 8)
    C._soleil_sans_ombre("appoint", C.APPOINT_FORCE, C.APPOINT_TEINTE, (-0.25, -math.cos(t), math.sin(t)))
    C._soleil_sans_ombre("contour", C.CONTOUR_FORCE, C.CONTOUR_TEINTE, (0.45, 0.85, 0.42), angle=12)


def caler_dans_image(nom, objs, pv, lw, lh, ppm, surech, deplacer=True, marge=MARGE_GESTE):
    """Boîte de la figurine à l'écran (px logiques de son image) ; si elle déborde de la marge et que deplacer est vrai,
    le pivot glisse au plus juste sur le sol (X : gauche-droite ; Y : haut-bas de l'écran, vue inclinée de 40°).
    Renvoie (décalage x, décalage y) appliqués en px logiques, ou None si la figurine est trop grande pour l'image."""
    ech = surech * C.ECHELLE
    b = boite_ecran(objs, (), exclure=True, ech=ech)
    if b is None:
        return (0.0, 0.0)
    x0, y0, x1, y1 = b
    if x1 - x0 > lw - 2 * marge or y1 - y0 > lh - 2 * marge:
        C.journal("%s : figurine trop grande pour son image (%.1f × %.1f px logiques dans %d × %d)" % (nom, x1 - x0, y1 - y0, lw, lh))
        return None
    dx = (marge - x0) if x0 < marge else ((lw - marge) - x1 if x1 > lw - marge else 0.0)
    dy = (marge - y0) if y0 < marge else ((lh - marge) - y1 if y1 > lh - marge else 0.0)
    if (dx or dy) and deplacer:
        t = math.radians(C.INCLINAISON)
        pv.location.x += dx / ppm
        pv.location.y += -dy / (ppm * math.sin(t))         # vers le bas de l'écran = vers la caméra (sud)
        C.bpy.context.view_layer.update()
        C.journal("%s : recalée de %+.1f, %+.1f px logiques dans son image" % (nom, dx, dy))
    elif dx or dy:
        C.journal("%s : déborde de son image (%+.1f, %+.1f px logiques), pieds tenus sur l'ancrage" % (nom, dx, dy))
    return (dx, dy)


def eteindre_bleus(img, nom):
    """Camp anglais, figurine couchée ou renversée : voir commun.eteindre_bleus."""
    return C.eteindre_bleus(img, nom)


def rendre_geste(nom, bande, surech=2, dossier=None, echantillons=64):
    """Bande de geste (« chute » ou « coup ») d'une troupe de GESTES : 4 images, même cadrage que la marche."""
    from PIL import Image
    fabrique, (lw, lh), ancre, ppm = UNITES[nom]
    pw, ph = lw * C.ECHELLE, lh * C.ECHELLE
    camp = nom.rsplit("-", 1)[1]
    sens = face(camp)
    sortie = "%s-%s" % (nom, bande)
    images = []
    for k in range(IMAGES_GESTE):
        C.reinitialiser()
        lumieres(sens == "gauche")
        C.camera_trois_quarts(pw * surech, ph * surech, ppm * C.ECHELLE * surech, ancre * C.ECHELLE * surech)
        C.sol_capteur(14)
        objs, pivot = fabrique(0.0, **{bande: k})
        cale = caler_dans_image("%s-%d" % (sortie, k), objs, pivot, lw, lh, ppm, surech, deplacer=(bande == "chute"))
        ident = "%s-%d" % (sortie, k)
        img, _ = C.rendre_sprite(ident, pw, ph, objs, surech=surech, echantillons=echantillons,
                                 contour=CONTOUR, epaisseur_contour=EPAISSEUR_CONTOUR, pres=0.10, controle=False)
        img = adoucir_reflets(img)
        if camp == "angleterre":
            img = eteindre_bleus(img, ident)
        if cale is None:
            C._refuser(img, ident, "figurine plus grande que son image")
        C.controle_bords(img, ident)
        C.controle_blancs(img, ident)
        if "cavaliers" in nom:
            C.controle_troupe(img, ident, camp, SEUIL_CAVALERIE)
        elif camp == "omeyyades":
            C.controle_troupe(img, ident, camp, SEUIL_OMEYYADES)
        else:
            C.journal("%s : couleur du camp %.1f %% (taille logique)" % (ident, 100 * C.part_couleur_troupe(img, camp)))
        if camp == "angleterre":
            C.controle_sans_bleu(img, ident)
        if sens == "gauche":
            img = img.transpose(Image.FLIP_LEFT_RIGHT)
        images.append(img)
    if len(images) != IMAGES_GESTE:
        raise C.RefusRendu("%s : %d images au lieu de %d" % (sortie, len(images), IMAGES_GESTE))
    img = C.bande(images)
    if dossier:
        os.makedirs(dossier, exist_ok=True)
        chemin = os.path.join(dossier, sortie + ".png")
        C.sauver_png(img, chemin) if chemin.startswith(C.RACINE) else img.save(chemin, optimize=True)
        C.journal("essai écrit dans %s (manifeste inchangé)" % chemin)
        return chemin
    marche = C.lire_manifeste()[nom]
    if (marche["w"], marche["h"], marche["ax"], marche["ay"]) != (lw, lh, lw // 2, lh - ancre) or \
            marche.get("face", "droite") != sens:
        raise C.RefusRendu("%s : la bande de marche n'a pas le cadrage attendu" % nom)
    return ecrire_geste(nom, bande, img)


def ecrire_geste(nom, bande, img):
    """Écrit une bande de geste dans jeu/ et son entrée du manifeste : w, h, ax, ay et face repris de la marche
    (contrôlé), 4 images, 2 px transparents au bord de chaque image."""
    import numpy as np
    marche = C.lire_manifeste()[nom]
    lw, lh = marche["w"], marche["h"]
    sortie = "%s-%s" % (nom, bande)
    if img.size != (IMAGES_GESTE * lw * C.ECHELLE, lh * C.ECHELLE):
        raise C.RefusRendu("%s : taille %s, attendu %d images de %d × %d" % (sortie, img.size, IMAGES_GESTE, lw * 2, lh * 2))
    a = np.array(img.convert("RGBA"))[..., 3]
    fw = a.shape[1] // IMAGES_GESTE
    for k in range(IMAGES_GESTE):
        C.controle_bords(img.crop((k * fw, 0, (k + 1) * fw, a.shape[0])), "%s-%d" % (sortie, k))
    C.sauver_sprite(sortie, img, None, lw, lh, marche["ax"], marche["ay"], IMAGES_GESTE)
    if marche.get("face"):
        e = C.lire_manifeste()[sortie]
        e["face"] = marche["face"]
        C.maj_manifeste({sortie: e})
    return C.chemin_td(sortie + ".png")[0]


def installer_gestes(dossier, bande):
    """Installe dans jeu/ les bandes d'un essai (--dossier) déjà regardé sur sa planche, sans les rendre une seconde fois
    (même code, même graine : même image) ; contrôles de ecrire_geste."""
    from PIL import Image
    faits = []
    for nom in GESTES:
        chemin = os.path.join(dossier, "%s-%s.png" % (nom, bande))
        if os.path.exists(chemin):
            faits.append(ecrire_geste(nom, bande, Image.open(chemin).convert("RGBA")))
    C.journal("bandes « %s » installées depuis %s : %d" % (bande, dossier, len(faits)))
    return faits


def rendre_unite(nom, nb_images=IMAGES, surech=2, dossier=None):
    from PIL import Image
    fabrique, (lw, lh), ancre, ppm = UNITES[nom]
    pw, ph = lw * C.ECHELLE, lh * C.ECHELLE           # taille finale d'une image (2 × logique)
    camp = nom.rsplit("-", 1)[1]
    sens = face(camp)
    images = []
    for k in range(nb_images):
        phase = 2 * math.pi * k / IMAGES
        C.reinitialiser()
        lumieres(sens == "gauche")
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
        if sens == "gauche":
            img = img.transpose(Image.FLIP_LEFT_RIGHT)     # ancrage au milieu de la largeur : il ne bouge pas
        images.append(img)
    img = C.bande(images)
    if dossier:
        os.makedirs(dossier, exist_ok=True)
        chemin = os.path.join(dossier, nom + ".png")
        C.sauver_png(img, chemin) if chemin.startswith(C.RACINE) else img.save(chemin, optimize=True)
        C.journal("essai écrit dans %s (manifeste inchangé)" % chemin)
        return chemin
    C.sauver_sprite(nom, img, None, lw, lh, lw // 2, lh - ancre, nb_images)
    if sens == "gauche":
        e = C.lire_manifeste()[nom]
        e["face"] = "gauche"
        C.maj_manifeste({nom: e})
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
    # troupes posées le long de la route : France vers la droite, ennemis vers la gauche (bandes déjà tournées vers la
    # gauche : miroir seulement pour une bande qui regarde à droite), images variées
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
        if miroir and man.get(nom, {}).get("face") == "gauche":
            miroir = False
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


def planche_bandes(sortie, bande, source=None):
    """Planche d'une bande de geste : pour chaque troupe de GESTES, la bande de marche (jeu/) puis la bande neuve
    (jeu/ ou le dossier source d'un essai), grossies 4 × sur l'herbe et la route du gué, croix rouge à l'ancrage ;
    et à droite, la dernière image de la bande à la taille du jeu (1 ×) à côté d'une figurine qui marche."""
    from PIL import Image, ImageDraw
    import planche as P
    man = C.lire_manifeste()
    terrain = Image.open(os.path.join(C.TD, "terrain-gue.jpg")).convert("RGBA")
    herbe = terrain.crop((900, 700, 1060, 780))
    zoom = 4
    f, f2 = P.police(15, True), P.police(13)
    lignes = []
    for n in GESTES:
        e = man.get(n)
        nom_b = "%s-%s" % (n, bande)
        chemin = os.path.join(source, nom_b + ".png") if source else os.path.join(C.TD, nom_b + ".png")
        if not e or not os.path.exists(chemin):
            continue
        marche = Image.open(os.path.join(C.RACINE, "jeu", e["src"])).convert("RGBA")
        neuf = Image.open(chemin).convert("RGBA")
        lignes.append((n, e, marche, neuf))
    L, marge, titre = 1500, 14, 26
    hauteur = 60 + sum(2 * e["h"] * 2 * 2 + titre + 3 * marge for (_, e, _, _) in lignes)
    pl = Image.new("RGBA", (L, hauteur), (40, 34, 28, 255))
    d = ImageDraw.Draw(pl)
    d.text((marge, 14), "Bandes « %s » (4 images) sous la bande de marche, grossies %d × ; croix rouge = ancrage ; à droite : "
           "taille du jeu (1 ×)" % (bande, zoom // 2 * 2), fill=(240, 228, 200, 255), font=f)
    y = 50
    for n, e, marche, neuf in lignes:
        d.text((marge, y), "%s-%s  (%d × %d, ancre %d, %d)" % (n, bande, e["w"], e["h"], e["ax"], e["ay"]),
               fill=(230, 220, 195, 255), font=f2)
        y += titre
        for k_, im in enumerate((marche, neuf)):
            g = im.resize((im.size[0] * zoom // 2, im.size[1] * zoom // 2), Image.NEAREST)
            fond = herbe.resize(g.size)
            x = marge + 60
            pl.alpha_composite(fond, (x, y))
            pl.alpha_composite(g, (x, y))
            d.text((marge, y + g.size[1] // 2 - 8), ("marche", bande)[k_], fill=(220, 210, 185, 255), font=f2)
            nfr = im.size[0] // (2 * e["w"])
            for kk in range(nfr):
                ax = x + (kk * e["w"] + e["ax"]) * zoom
                ay = y + e["ay"] * zoom
                d.line((ax - 5, ay, ax + 5, ay), fill=(255, 60, 60, 255))
                d.line((ax, ay - 5, ax, ay + 5), fill=(255, 60, 60, 255))
            if k_ == 1:
                # taille du jeu : une figurine qui marche et la dernière image de la bande, sur l'herbe
                pw, ph = 2 * e["w"], 2 * e["h"]
                case = herbe.crop((0, 0, 3 * e["w"], 2 * e["h"])).convert("RGBA")
                for kk, (src, fx) in enumerate(((marche, 0), (neuf, 3))):
                    vue = src.crop((fx * pw, 0, (fx + 1) * pw, ph)).resize((e["w"], e["h"]), Image.LANCZOS)
                    case.alpha_composite(vue, (kk * e["w"] + e["w"] // 4, e["h"] // 2))
                case = case.resize((case.size[0] * 2, case.size[1] * 2), Image.NEAREST)
                pl.alpha_composite(case, (x + g.size[0] + 40, y - g.size[1] // 2))
            y += g.size[1] + marge
        y += marge
    os.makedirs(os.path.dirname(os.path.abspath(sortie)), exist_ok=True)
    pl.convert("RGB").crop((0, 0, L, y + marge)).save(sortie, optimize=True)
    C.journal("planche des bandes « %s » écrite : %s" % (bande, sortie))
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
    bande = None
    if "--bande" in args:
        i = args.index("--bande")
        bande = args[i + 1]
        if bande not in BANDES:
            raise SystemExit("bande inconnue : %s (attendu : %s)" % (bande, ", ".join(BANDES)))
        args = args[:i] + args[i + 2:]
    if "--planche" in args:
        i = args.index("--planche")
        if bande:
            source = args[args.index("--source") + 1] if "--source" in args else None
            planche_bandes(args[i + 1], bande, source)
            return
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
    if bande and "--installer" in args:
        installer_gestes(args[args.index("--installer") + 1], bande)
        return
    if bande:
        for nom in (args or GESTES):
            if nom not in GESTES:
                raise SystemExit("%s n'a pas de bande de geste" % nom)
            rendre_geste(nom, bande, dossier=dossier)
        return
    noms = args or list(UNITES)
    for nom in noms:
        rendre_unite(nom, nb, dossier=dossier)
    if not dossier:
        C.journal("troupes : %d octets au total" % poids_troupes())


if __name__ == "__main__":
    main(sys.argv[1:])
