# -*- coding: utf-8 -*-
"""Images des réponses et du conseil (lot B du plan graphismes et animations, agent B2, 31/10/2026).

Quatre petites images, rendues avec Blender (Cycles), mêmes réglages et même soleil du nord-ouest que les expéditions
(expedition_commun.py) :
  - tampon-cire.png : empreinte de sceau en cire rouge : centre plat cerné de perles, bourrelet de cire au bord. Le jeu
    écrit le mot dans l'empreinte, en lettres dorées (« Sage décision », « Juste », « Vague repoussée ») : ui.tampon ;
  - tampon-plomb.png : la même en plomb (l'or perdu en bataille, « Dommage ») ;
  - piece-or.png : une pièce d'or au lys, vue de face ; la gerbe « pieces » d'anim.js la fait tourner (étirée en x) ;
  - sceau-or.png : sceau de cire dorée au lys, frappé sur le bilan d'un événement ou d'un conseil tout juste.
Le sceau qui frappe une bonne réponse reste sceau-reussie.png des expéditions (cire bleue au lys).

Fichiers : jeu/assets/images/reponses/ (2 × la taille logique). Pas de manifeste : interface.js et anim.js
connaissent les quatre noms. Après un rendu : node atelier/outils/generer-sw.js.
Lancer avec le python3 du système (un seul rendu Blender à la fois) :
  cd /home/user/Test && python3 atelier/outils/rendu-3d/reponses.py [--dossier DOSSIER] [tampon-cire tampon-plomb piece-or sceau-or]
"""
import math
import os
import random
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import commun as C  # noqa: E402
import expedition_commun as E  # noqa: E402
import bmesh  # noqa: E402
from PIL import Image  # noqa: E402

DOSSIER = os.path.join(C.RACINE, "jeu", "assets", "images", "reponses")
ECHANTILLONS = 48
TAMPON = 150          # toile du tampon, en unités (px CSS) ; la cire fait environ 140 unités de large
R_TAMPON = 6.6        # rayon de la cire (m, 10 unités par mètre), avant le bord irrégulier (± 7 %)
PIECE = 28            # toile de la pièce ; la pièce fait 24 unités
CIRE_ROUGE = ("#5e1419", "#2a0508", "#c27466")         # cire, ombre, reflet (la cire rendue éclaircit d'un cran)
CIRE_PLOMB = ("#42454c", "#1b1d21", "#8a8e97")         # assez sombre pour un mot clair à plus de 4,5 : 1
CIRE_OR = ("#a8781e", "#4a300a", "#f3dc96")
SCEAU = 40            # toile du sceau d'or (comme sceau-reussie.png des expéditions)

# Profil de la cire, du centre au bord : (rayon relatif, hauteur relative à l'épaisseur). Le centre est l'empreinte du
# sceau, plate et un peu creusée (le mot y est écrit) ; un filet en relief la cerne ; la cire chassée par la matrice
# forme un bourrelet, puis retombe en arrondi jusqu'au papier.
PROFIL = [(0.0, 0.70), (0.70, 0.70), (0.745, 0.72), (0.76, 0.80), (0.775, 0.72), (0.80, 0.70), (0.84, 0.86),
          (0.89, 1.0), (0.935, 0.96), (0.965, 0.78), (0.985, 0.48), (1.0, 0.12), (1.0, 0.0)]


def galette(nom, teintes, rayon, epaisseur, graine):
    """Empreinte de sceau en cire : tour de révolution du PROFIL ; seul le bord extérieur (au-delà de 0,8 du rayon) est
    irrégulier, l'empreinte reste ronde. Un rang de perles en relief dans l'empreinte, comme sur les sceaux médiévaux."""
    rnd = random.Random(graine)
    ph = [rnd.uniform(0, 6.28) for _ in range(3)]
    n = 128
    bm = bmesh.new()
    anneaux = []
    for (rr, hh) in PROFIL[1:]:
        ring = []
        for k in range(n):
            a = 2 * math.pi * k / n
            f = 1.0
            if rr > 0.8:
                f = 1 + ((rr - 0.8) / 0.2) * (0.05 * math.sin(3 * a + ph[0]) + 0.03 * math.sin(5 * a + ph[1]) + 0.018 * math.sin(9 * a + ph[2]))
            ring.append(bm.verts.new((rayon * rr * f * math.cos(a), rayon * rr * f * math.sin(a), epaisseur * hh)))
        anneaux.append(ring)
    centre = bm.verts.new((0, 0, epaisseur * PROFIL[0][1]))
    for k in range(n):
        bm.faces.new((centre, anneaux[0][k], anneaux[0][(k + 1) % n]))
    for i in range(len(anneaux) - 1):
        a0, a1 = anneaux[i], anneaux[i + 1]
        for k in range(n):
            bm.faces.new((a0[k], a1[k], a1[(k + 1) % n], a0[(k + 1) % n]))
    fond = bm.faces.new(list(reversed(anneaux[-1])))
    for f in bm.faces:
        f.smooth = True
    fond.smooth = False
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    m = E.mat_cire(nom + "_cire", teintes)
    ob = C.objet_maillage(nom, bm, m, lisse=True)
    sub = ob.modifiers.new("lisse", "SUBSURF")
    sub.levels = 1
    sub.render_levels = 1
    objets = [ob]
    objets.append(E.perles(nom + "_perles", rayon * 0.72, 44, rayon * 0.016, z=epaisseur * 0.70, mat=E.mat_cire(nom + "_perle", teintes)))
    return objets


def tampon(nom, teintes, graine):
    E.scene_vignette(TAMPON, inclinaison=80, rayon_sol=None)
    objets = galette("tampon", teintes, R_TAMPON, 0.75, graine)
    return E.rendre_vignette(nom, objets, TAMPON, echantillons=ECHANTILLONS, contour=0.3, ombre=False)


def piece(nom):
    """Pièce d'or vue de face : disque biseauté, grènetis en bourrelet, lys en relief."""
    E.scene_vignette(PIECE, inclinaison=82, rayon_sol=None)
    m = E.mat_or_poli("piece_or")
    r, ep = 1.18, 0.16
    objets = [E.disque("piece", r, ep, (0, 0, 0), m, segments=64, biseau=0.04),
              E.tore("piece_grenetis", r * 0.86, 0.035, (0, 0, ep), E.mat_or("piece_bord", "#a8802e"), segments=64, cotes=8)]
    w = r * 1.15
    objets.append(E.plaque_icone("piece_lys", "lys", w, "#8a6a22", epaisseur=0.04, loc=(0, -w / 2, ep + 0.01), dresse=False))
    return E.rendre_vignette(nom, objets, PIECE, echantillons=ECHANTILLONS, contour=0.35, ombre=False)


def sceau_or(nom):
    E.scene_vignette(SCEAU, inclinaison=70, rayon_sol=None)
    objets = E.sceau_cire("sceau", rayon=E.D_SCEAU / 2.0 / E.PX_PAR_M, teintes=CIRE_OR, icone="lys", graine=7)
    return E.rendre_vignette(nom, objets, SCEAU, echantillons=ECHANTILLONS, contour=0.3, ombre=False)


RENDUS = {
    "tampon-cire": lambda: tampon("tampon-cire", CIRE_ROUGE, 11),
    "tampon-plomb": lambda: tampon("tampon-plomb", CIRE_PLOMB, 13),
    "piece-or": lambda: piece("piece-or"),
    "sceau-or": lambda: sceau_or("sceau-or"),
}


def sauver(nom, img, dossier):
    os.makedirs(dossier, exist_ok=True)
    chemin = os.path.join(dossier, nom + ".png")
    img.save(chemin, optimize=True)
    if os.path.getsize(chemin) > 140_000:         # au-delà, 256 couleurs (alpha gardé)
        q = img.convert("RGBA").quantize(256, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.FLOYDSTEINBERG)
        q.save(chemin, optimize=True)
    E.journal("écrit %s (%d Ko, %d × %d px)" % (chemin, os.path.getsize(chemin) // 1024, img.size[0], img.size[1]))
    return chemin


def main(args):
    dossier = DOSSIER
    if "--dossier" in args:
        i = args.index("--dossier")
        dossier = os.path.abspath(args[i + 1])
        args = args[:i] + args[i + 2:]
    noms = [a for a in args if a in RENDUS] or list(RENDUS)
    for nom in noms:
        sauver(nom, RENDUS[nom](), dossier)


if __name__ == "__main__":
    main(sys.argv[1:])
