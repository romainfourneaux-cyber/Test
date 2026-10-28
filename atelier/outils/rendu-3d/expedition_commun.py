# -*- coding: utf-8 -*-
"""Module commun des images du mode Expéditions (la route des semaines, jeu/js/ecran-expedition.js).

Trois scripts le partagent, un par famille d'images (voir CATALOGUE et atelier/conception/expeditions-graphismes.md) :
  expedition_route.py (fonds de parchemin, cadre de page, carte de campagne, gardiens), expedition_haltes.py (médaillons des
  haltes, écussons des portes, sceaux), expedition_faveurs.py (faveurs, icônes de la compagnie, Armorial).
Tout ce qui doit être identique d'une image à l'autre vit ici, par-dessus commun.py (même soleil du nord-ouest, mêmes
réglages Cycles, mêmes contrôles) :
  - la palette du jeu (fond, encre, or, rubrique, teintes des matières) et les matières d'enluminure (parchemin, encre,
    or, bronze, argent, plomb, cire, bois, toile, cuir, pierre, flamme) ;
  - le rondel : le cadre doré commun à tous les médaillons (disque d'or cerné d'encre, rang de perles, champ de parchemin),
    rendu une fois de dessus et mis en cache ; l'objet de chaque médaillon est rendu à part, de trois quarts, avec son
    ombre portée sur le champ, puis posé dans le cadre : tous les médaillons ont exactement le même cercle, celui du SVG ;
  - des formes qui reviennent dans plusieurs familles (écusson, plaque découpée d'une icône, sac, rouleau, pièces, tente,
    feu, sceau de cire, tore, perles) ;
  - les caméras (vignette de trois quarts à ancre centrale, vue de dessus pour les fonds) ;
  - l'enregistrement dans jeu/assets/images/expedition/ avec les contrôles (bords transparents, blancs brûlés, taille du
    fichier, budget total) et le manifeste jeu/assets/images/expedition/images.js (JEU.imagesExpedition) ;
  - la planche de contrôle d'une famille (atelier/captures/planche-expedition-<famille>.png).

Unités : le mètre dans Blender ; PX_PAR_M = 10 unités logiques par mètre (le parchemin de route fait 1000 × 320 unités) ;
les fichiers font 2 × la taille logique (commun.ECHELLE). Un médaillon de halte : rayon 24 unités = 2,4 m, son champ
intérieur 1,8 m : l'objet tient dans un cercle de 1,5 m de rayon et 2,5 m de haut.
Lancer avec le python3 du système : cd /home/user/Test && python3 atelier/outils/rendu-3d/expedition_commun.py --essai
(rend le cadre, le médaillon « halte-brume » et la planche de la famille route).
"""
import json
import math
import os
import random
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import commun as C  # noqa: E402
import terrains as T  # noqa: E402
import bmesh  # noqa: E402
import bpy  # noqa: E402
import numpy as np  # noqa: E402
from PIL import Image, ImageDraw, ImageFilter, ImageFont  # noqa: E402

# ---------------------------------------------------------------- chemins et budget
DOSSIER = os.path.join(C.RACINE, "jeu", "assets", "images", "expedition")
MANIFESTE = os.path.join(DOSSIER, "images.js")
PREFIXE_SRC = "assets/images/expedition/"
CAPTURES = os.path.join(C.RACINE, "atelier", "captures")
os.makedirs(DOSSIER, exist_ok=True)
BUDGET_TOTAL = 3_000_000        # octets, toutes les images du dossier (contrat de la livraison)
MAX_FICHIER = 600_000           # octets par fichier
SEUIL_QUANTIFIER = 160_000      # au-delà, un PNG est ramené à 256 couleurs (alpha conservé)

# ---------------------------------------------------------------- palette du jeu (sRGB)
FOND, ENCRE, OR, OR_CLAIR, OR_SOMBRE, RUBRIQUE, PLOMB = "#efe6d2", "#2e2419", "#b08d3a", "#e2c272", "#7a5c1e", "#8c2f39", "#4a4e57"
PARCHEMIN_CLAIR, PARCHEMIN, PARCHEMIN_SOMBRE = "#f7efdc", "#e8dbb8", "#c8b28a"
BRUME_CHAMP = "#9a927f"                                # champ d'un médaillon dans la brume (SVG)
OR_METAL = "#c9a24a"                                   # albédo de l'or rendu (le même que les épis des bannières)
BRONZE, ARGENT = "#a86f3b", "#b8bcc4"                  # cerclages des faveurs : commune, rare (argent un peu assombri le 28/10/2026 : à 56 px il se perdait sur le parchemin)
CIRE_JOUEUR = ("#2d4f94", "#14284f", "#9db2df")        # cire bleue de France : (cire, ombre, reflet)
CIRE_PLOMB = ("#6a6e78", "#2f3238", "#a6aab3")         # plomb des murs cédés
TOILE, JUTE, CUIR, BOIS = "#e6dcc4", "#c9b48a", "#6a4426", "#6b4a2e"
OMBRE_PARCHEMIN = (70, 48, 24)                         # ombre portée sur le parchemin : brun chaud (pas le vert du pré)
# teintes des matières (jeu/js/noyau.js JEU.MATIERES) ; les faveurs du français vont à la littérature
MATIERES = {"histoire": "#6b2d5c", "geographie": "#b5772b", "svt": "#4f6b32", "physique": "#2f5a8a",
            "litterature": "#7a4a2a", "lecture": "#7a4a2a", "langue": "#8c2f39", "anglais": "#2a7470"}
FAMILLE_MATIERE = {"histoire": "histoire", "geographie": "geographie", "svt": "svt", "physique": "physique",
                   "francais": "litterature", "anglais": "anglais"}
# écussons des portes simples (ecran-expedition.js ecussonPorte) et quartiers de l'Armorial (TEINTES_ECU)
PORTES = {"bourse": OR_SOMBRE, "parchemin": "#6b2d5c", "vivres": "#4f6b32"}
ARMORIAL = {"vivres": "#4f6b32", "bourse": "#b5772b", "murs": "#2f5a8a", "banniere": "#8c2f39", "ouverture": "#6b2d5c"}
ANNEAUX = {"or": OR_METAL, "bronze": BRONZE, "argent": ARGENT, "plomb": PLOMB}

# ---------------------------------------------------------------- tailles (unités logiques)
PX_PAR_M = 10                   # 10 unités par mètre : un médaillon de rayon 24 fait 2,4 m
VIGNETTE, R_HALTE = 64, 24      # toile d'un médaillon de halte ou de faveur, rayon du cadre (R_HALTE du SVG)
GARDIEN, R_GARDIEN = 88, 34     # médaillon d'un gardien (R_GARDIEN du SVG)
SCEAU, D_SCEAU = 40, 34         # toile d'un sceau, diamètre de la cire (le jeu l'affiche à 26, 32 ou 36 unités)
PORTE = 28                      # écusson d'une porte (dessiné à 22 unités dans le SVG, un peu plus pour le liseré)
INCLINAISON = 45                # caméra des objets dans un rondel : entre la vue de dessus du cadre et les sprites à 40°
OBJET_RAYON_MAX = 1.5           # un objet de médaillon tient dans un cercle de 1,5 m au sol (le champ fait 1,8 m)...
OBJET_HAUTEUR_MAX = 2.5         # ... et sous 2,5 m de haut (il peut mordre un peu sur la bande d'or, jamais sortir de la toile)
SURECH = 2
APPOINT = 0.7                   # débouchage un peu plus fort que sur l'herbe : le parchemin renvoie de la lumière
BANDE_CADRE = 6                 # largeur de la bande d'or du rondel (unités) : le champ intérieur a pour rayon R - 6

# ---------------------------------------------------------------- catalogue : toutes les images de la livraison
# id : (famille, w, h, ax, ay, format, description courte) ; w, h, ax, ay en unités logiques.
def _rondel(nom, famille, desc, t=VIGNETTE):
    return (nom, (famille, t, t, t // 2, t // 2, "png", desc))


CATALOGUE = dict([
    # famille « route » : fonds, cadre, carte de campagne, gardiens
    ("route-fond", ("route", 1000, 320, 0, 0, "jpg", "parchemin du parchemin de route (vue de dessus, bords patinés, sans texte)")),
    ("annee-fond", ("route", 1000, 104, 0, 0, "jpg", "parchemin de la bande de l'année (même feuille, recadrée)")),
    ("cadre-page", ("route", 240, 240, 0, 0, "png", "cadre de page à filets d'or pour border-image (tranches de 60 unités, centre = parchemin)")),
    ("carte-expedition", ("route", 320, 190, 0, 0, "jpg", "illustration de la carte « Partir en expédition » (route, bornes, bourg au loin)")),
    _rondel("halte-brume", "route", "médaillon vide d'une halte dans la brume (champ gris)"),
    _rondel("gardien-angleterre", "route", "gardien de semaine, royaume d'Angleterre : écu, heaume au tortil, pennon", GARDIEN),
    _rondel("gardien-omeyyades", "route", "gardien de semaine, Empire omeyyade : écu, casque, pennon", GARDIEN),
    _rondel("grand-angleterre", "route", "Grand Gardien d'Angleterre : écu, heaume, grande bannière", GARDIEN),
    _rondel("grand-omeyyades", "route", "Grand Gardien omeyyade : écu, casque, grande bannière", GARDIEN),
    # famille « haltes » : médaillons des haltes, écussons des portes, sceaux
    _rondel("halte-escarmouche", "haltes", "deux épées croisées plantées devant un écu rond"),
    _rondel("halte-embuscade", "haltes", "fourré sombre, deux lances couchées, pennon rubrique"),
    _rondel("halte-bivouac", "haltes", "tente de toile et feu de camp"),
    _rondel("halte-marchand", "haltes", "étal : table sur tréteaux, auvent rayé, sac et tonneau"),
    _rondel("halte-ev-marchands", "haltes", "charrette à bras chargée de sacs et d'un coffre"),
    _rondel("halte-ev-defi", "haltes", "pas d'armes : poteau coiffé d'un heaume, deux lances croisées"),
    _rondel("halte-ev-mercenaires", "haltes", "écu rond, deux hallebardes croisées, bourse"),
    _rondel("halte-ev-incendie", "haltes", "grenier au toit de chaume, flammes et fumée"),
    _rondel("halte-ev-espion", "haltes", "lanterne sourde, lettre scellée, dague"),
    _rondel("halte-ev-archives", "haltes", "pupitre, livre ouvert, rouleaux et encrier"),
    ("porte-histoire", ("haltes", PORTE, PORTE, PORTE // 2, PORTE // 2, "png", "écusson de porte : faveur du chroniqueur (teinte histoire)")),
    ("porte-geographie", ("haltes", PORTE, PORTE, PORTE // 2, PORTE // 2, "png", "écusson de porte : faveur de la cartographe")),
    ("porte-svt", ("haltes", PORTE, PORTE, PORTE // 2, PORTE // 2, "png", "écusson de porte : faveur de l'herboriste")),
    ("porte-physique", ("haltes", PORTE, PORTE, PORTE // 2, PORTE // 2, "png", "écusson de porte : faveur du maître d'œuvre")),
    ("porte-litterature", ("haltes", PORTE, PORTE, PORTE // 2, PORTE // 2, "png", "écusson de porte : faveur du ménestrel")),
    ("porte-anglais", ("haltes", PORTE, PORTE, PORTE // 2, PORTE // 2, "png", "écusson de porte : faveur de l'interprète")),
    ("porte-bourse", ("haltes", PORTE, PORTE, PORTE // 2, PORTE // 2, "png", "écusson de porte : bourse d'or de route")),
    ("porte-parchemin", ("haltes", PORTE, PORTE, PORTE // 2, PORTE // 2, "png", "écusson de porte : parchemin de renommée")),
    ("porte-vivres", ("haltes", PORTE, PORTE, PORTE // 2, PORTE // 2, "png", "écusson de porte : sac de vivres")),
    ("sceau-reussie", ("haltes", SCEAU, SCEAU, SCEAU // 2, SCEAU // 2, "png", "sceau de cire bleue au lys : halte réussie ou faite, semaine franchie")),
    ("sceau-cedes", ("haltes", SCEAU, SCEAU, SCEAU // 2, SCEAU // 2, "png", "sceau de plomb à l'écu brisé : les murs ont cédé")),
    # famille « faveurs » : les six faveurs à deux rangs, la compagnie, l'Armorial
    _rondel("faveur-annales-1", "faveurs", "Annales (chroniqueur) : livre d'annales ouvert et plume ; cerclage de bronze"),
    _rondel("faveur-annales-2", "faveurs", "Annales, rang rare : cerclage d'argent"),
    _rondel("faveur-eclaireurs-1", "faveurs", "Éclaireurs (cartographe) : carte déroulée, longue-vue ou cor, cerclage de bronze"),
    _rondel("faveur-eclaireurs-2", "faveurs", "Éclaireurs, rang rare : cerclage d'argent"),
    _rondel("faveur-simples-1", "faveurs", "Simples (herboriste) : panier d'herbes et fiole ; cerclage de bronze"),
    _rondel("faveur-simples-2", "faveurs", "Simples, rang rare : cerclage d'argent"),
    _rondel("faveur-engrenages-1", "faveurs", "Engrenages (maître d'œuvre) : deux roues dentées de bois et de fer ; cerclage de bronze"),
    _rondel("faveur-engrenages-2", "faveurs", "Engrenages, rang rare : cerclage d'argent"),
    _rondel("faveur-ballade-1", "faveurs", "Ballade consolante (ménestrel) : luth ou harpe posée sur un parchemin ; cerclage de bronze"),
    _rondel("faveur-ballade-2", "faveurs", "Ballade consolante, rang rare : cerclage d'argent"),
    _rondel("faveur-lettres-1", "faveurs", "Lettres de crédit (interprète) : lettre scellée et pile de pièces ; cerclage de bronze"),
    _rondel("faveur-lettres-2", "faveurs", "Lettres de crédit, rang rare : cerclage d'argent"),
    ("compagnie-sac-plein", ("faveurs", 24, 28, 12, 26, "png", "sac de vivres plein (jute, lien de cuir)")),
    ("compagnie-sac-vide", ("faveurs", 24, 28, 12, 26, "png", "sac de vivres vide (affaissé, toile claire)")),
    ("compagnie-or", ("faveurs", 24, 24, 12, 12, "png", "or de route : petite pile de pièces")),
    ("compagnie-plan", ("faveurs", 24, 24, 12, 12, "png", "plan de bataille : rouleau de parchemin et ruban rubrique")),
    ("compagnie-espion", ("faveurs", 24, 24, 12, 12, "png", "espion de route : lanterne sourde")),
    ("armorial-ecu", ("faveurs", 100, 110, 0, 0, "png", "écu de l'Armorial : champ de parchemin, bordure d'or, traits des cinq quartiers")),
    ("armorial-vivres", ("faveurs", 100, 110, 0, 0, "png", "émail du quartier Vivres (haut gauche), seul sur fond transparent")),
    ("armorial-bourse", ("faveurs", 100, 110, 0, 0, "png", "émail du quartier Bourse (haut droit)")),
    ("armorial-murs", ("faveurs", 100, 110, 0, 0, "png", "émail du quartier Murs (bas gauche)")),
    ("armorial-banniere", ("faveurs", 100, 110, 0, 0, "png", "émail du quartier Bannière (bas droit)")),
    ("armorial-ouverture", ("faveurs", 100, 110, 0, 0, "png", "émail du losange central Faveur d'ouverture")),
])
FAMILLES = ("route", "haltes", "faveurs")


def catalogue(famille=None):
    """Les identifiants d'une famille (ou de toutes), dans l'ordre du catalogue."""
    return [k for k, v in CATALOGUE.items() if famille is None or v[0] == famille]


def champ_teinte(teinte, part=0.12, base=PARCHEMIN_CLAIR):
    """Parchemin légèrement teinté vers une couleur ('#rrggbb') : le champ d'une faveur prend la teinte de sa matière
    sans cesser d'être du parchemin (part 0,12 par défaut)."""
    a, b = C.rgb8(base), C.rgb8(teinte)
    return "#%02x%02x%02x" % tuple(int(round(x + (y - x) * part)) for x, y in zip(a, b))


def journal(*m):
    C.journal("[expédition]", *m)


# ---------------------------------------------------------------- matières d'enluminure
def mat_parchemin(nom="parchemin", teinte=PARCHEMIN_CLAIR, grain=0.5, echelle=4.0, fibres=True):
    """Parchemin : teinte unie nuancée par un bruit lent (taches d'un vélin) et des fibres fines, mat, léger velouté.
    echelle : taille des taches (m) ; grain : force des nuances (0 = uni)."""
    m, nt, p = C.nouveau_materiau(nom)
    N, L = nt.nodes.new, nt.links.new
    tc = N("ShaderNodeTexCoord")
    base = N("ShaderNodeRGB")
    base.outputs[0].default_value = C.couleur(teinte)
    coul = base.outputs[0]
    if grain > 0:
        nz = N("ShaderNodeTexNoise")
        nz.inputs["Scale"].default_value = 1.0 / echelle
        nz.inputs["Detail"].default_value = 6.0
        nz.inputs["Roughness"].default_value = 0.55
        L(tc.outputs["Object"], nz.inputs["Vector"])
        coul = C._multiplier(nt, coul, C._plage(nt, nz.outputs["Fac"], 0.35, 0.65, 1.0 - 0.12 * grain, 1.0 + 0.05 * grain))
        if fibres:
            mp = N("ShaderNodeMapping")
            mp.inputs["Scale"].default_value = (18.0, 3.0, 18.0)           # fibres étirées (sens de la peau)
            L(tc.outputs["Object"], mp.inputs["Vector"])
            nf = N("ShaderNodeTexNoise")
            nf.inputs["Scale"].default_value = 6.0 / echelle
            nf.inputs["Detail"].default_value = 3.0
            L(mp.outputs["Vector"], nf.inputs["Vector"])
            coul = C._multiplier(nt, coul, C._plage(nt, nf.outputs["Fac"], 0.3, 0.7, 1.0 - 0.06 * grain, 1.0 + 0.03 * grain))
    L(coul, p.inputs["Base Color"])
    p.inputs["Roughness"].default_value = 0.88
    p.inputs["Specular IOR Level"].default_value = 0.3
    try:
        p.inputs["Sheen Weight"].default_value = 0.25
    except KeyError:
        pass
    C._grain(nt, p, 0.12 * max(grain, 0.2), 80.0)
    return m


def mat_encre(nom="encre", teinte=ENCRE):
    """Encre brune : mate, un peu de spéculaire (trait d'une enluminure)."""
    return C.mat_simple(nom, teinte, rugosite=0.62, speculaire=0.4)


def mat_teinte(nom, teinte, rugosite=0.55, bosse=0.0):
    """Aplat de couleur (champ d'un écusson, émail) : satiné."""
    return C.mat_simple(nom, teinte, rugosite=rugosite, speculaire=0.5, bosse=bosse, echelle_bosse=120.0)


def mat_or(nom="or", teinte=OR_METAL, rugosite=0.42, metal=0.75):
    """Or d'enluminure : feuille d'or un peu mate (metallic 0,75) qui ne renvoie pas le ciel bleu en miroir."""
    return C.mat_metal(nom, teinte, rugosite=rugosite, metal=metal)


def mat_or_poli(nom="or_poli"):
    """Or poli (épis, boucles) : le métal des bannières de commun.py."""
    return C.mat_metal(nom, OR_METAL, rugosite=0.32)


def mat_bronze(nom="bronze"):
    return C.mat_metal(nom, BRONZE, rugosite=0.48, metal=0.85)


def mat_argent(nom="argent"):
    return C.mat_metal(nom, ARGENT, rugosite=0.34, metal=0.9)


def mat_plomb(nom="plomb"):
    return C.mat_metal(nom, PLOMB, rugosite=0.6, metal=0.7)


def mat_anneau(anneau="or"):
    """Matière du cerclage d'un rondel : or (haltes, gardiens, rang 3), bronze (faveur commune), argent (rare), plomb."""
    return {"or": mat_or, "bronze": mat_bronze, "argent": mat_argent, "plomb": mat_plomb}[anneau]("anneau_" + anneau)


def mat_cire(nom="cire", teintes=CIRE_JOUEUR, relief_png=None, force_relief=0.5, rayon=1.0, part=0.7):
    """Cire à cacheter : brillante, un peu translucide ; relief_png (masque L) embosse un emblème au centre du cachet,
    en coordonnées objet (pas d'UV) : l'image couvre « part » du diamètre 2 × rayon."""
    m, nt, p = C.nouveau_materiau(nom)
    N, L = nt.nodes.new, nt.links.new
    p.inputs["Base Color"].default_value = C.couleur(teintes[0])
    p.inputs["Roughness"].default_value = 0.32
    p.inputs["Specular IOR Level"].default_value = 0.6
    for cle, val in (("Coat Weight", 0.35), ("Coat Roughness", 0.2), ("Subsurface Weight", 0.15), ("Subsurface Scale", 0.05)):
        try:
            p.inputs[cle].default_value = val
        except KeyError:
            pass
    try:
        p.inputs["Subsurface Radius"].default_value = (0.03, 0.015, 0.01)
    except KeyError:
        pass
    b = C._grain(nt, p, 0.08, 60.0)
    if relief_png:
        tc = N("ShaderNodeTexCoord")
        mp = N("ShaderNodeMapping")
        s = 1.0 / (2.0 * rayon * part)
        mp.inputs["Scale"].default_value = (s, s, s)
        mp.inputs["Location"].default_value = (0.5, 0.5, 0.0)
        L(tc.outputs["Object"], mp.inputs["Vector"])
        im = N("ShaderNodeTexImage")
        im.image = C.image(relief_png, non_couleur=True)
        im.extension = "CLIP"
        L(mp.outputs["Vector"], im.inputs["Vector"])
        flou = N("ShaderNodeMath"); flou.operation = "MULTIPLY"; flou.inputs[1].default_value = 1.0
        L(im.outputs["Color"], flou.inputs[0])
        br = N("ShaderNodeBump")
        br.inputs["Strength"].default_value = force_relief
        br.inputs["Distance"].default_value = 0.06
        L(flou.outputs[0], br.inputs["Height"])
        L(b.outputs["Normal"], br.inputs["Normal"])
        L(br.outputs["Normal"], p.inputs["Normal"])
    return m


def mat_bois(nom="bois", teinte=BOIS, ident="rough_wood", echelle=0.8):
    """Bois (tréteaux, hampes, pupitre) : photo Poly Haven teintée par la luminance."""
    return C.mat_ph(nom, ident, echelle_m=echelle, cible=teinte, contraste=1.2, garde=0.15, rugosite=0.75, bosse=0.3)


def mat_planches(nom="planches", teinte="#7a5a3a"):
    return C.mat_ph(nom, "weathered_planks", echelle_m=1.2, cible=teinte, contraste=1.25, garde=0.15, rugosite=0.8, bosse=0.35)


def mat_toile(nom="toile", teinte=TOILE, rayures_png=None):
    """Toile de tente, de sac ou d'auvent (commun.mat_tissu) ; rayures_png : motif plaqué en UV (places.texture_rayee)."""
    return C.mat_tissu(nom, teinte, rugosite=0.92, image_png=rayures_png, brillance=0.2)


def mat_cuir(nom="cuir", teinte=CUIR):
    return C.mat_simple(nom, teinte, rugosite=0.6, speculaire=0.45, bosse=0.3, echelle_bosse=150.0)


def mat_pierre(nom="pierre", teinte="#a39a86"):
    return C.mat_ph(nom, "yellow_stone_wall", echelle_m=1.6, cible=teinte, contraste=1.2, garde=0.2, rugosite=0.9, bosse=0.4)


def mat_flamme(nom="flamme", teinte="#ff9a2e", force=6.0, alpha=0.85):
    """Flamme : émission orange, un peu transparente (feu de camp, incendie)."""
    m, nt, p = C.nouveau_materiau(nom)
    p.inputs["Base Color"].default_value = (0.02, 0.005, 0.0, 1.0)
    p.inputs["Emission Color"].default_value = C.couleur(teinte)
    p.inputs["Emission Strength"].default_value = force
    p.inputs["Roughness"].default_value = 1.0
    try:
        p.inputs["Alpha"].default_value = alpha
    except KeyError:
        pass
    return m


def mat_fumee(nom="fumee", teinte="#8f877a", alpha=0.45):
    m, nt, p = C.nouveau_materiau(nom)
    p.inputs["Base Color"].default_value = C.couleur(teinte)
    p.inputs["Roughness"].default_value = 1.0
    try:
        p.inputs["Alpha"].default_value = alpha
    except KeyError:
        pass
    return m


# ---------------------------------------------------------------- icônes en relief ou découpées
def icone_png(icone, teinte=None, taille=512, marge=0.04):
    """Image d'une icône Game-icons (masque de commun.masque_embleme) : masque L (teinte None, pour un relief) ou RGBA
    colorée (plaque découpée). Mise en cache dans atelier/sources-3d/_cache."""
    cle = "icone-%s-%s-%d.png" % (icone, (teinte or "L").lstrip("#"), taille)
    chemin = os.path.join(C.CACHE, cle)
    if not os.path.exists(chemin):
        masque = C.masque_embleme(icone, taille, marge)
        if teinte is None:
            masque.save(chemin)
        else:
            im = Image.new("RGBA", (taille, taille), C.rgb8(teinte) + (255,))
            im.putalpha(masque)
            im.save(chemin)
    return chemin


def mat_plaque(nom, png, rugosite=0.55):
    """Matière d'une plaque découpée : couleur et alpha de l'image (UV)."""
    m, nt, p = C.nouveau_materiau(nom)
    N, L = nt.nodes.new, nt.links.new
    tc = N("ShaderNodeTexCoord")
    im = N("ShaderNodeTexImage")
    im.image = C.image(png)
    im.extension = "CLIP"
    L(tc.outputs["UV"], im.inputs["Vector"])
    L(im.outputs["Color"], p.inputs["Base Color"])
    L(im.outputs["Alpha"], p.inputs["Alpha"])
    p.inputs["Roughness"].default_value = rugosite
    p.inputs["Specular IOR Level"].default_value = 0.4
    return m


def plaque_icone(nom, icone, largeur, teinte=ENCRE, epaisseur=0.05, loc=(0, 0, 0), lacet=0.0, dresse=True, penche=0.0):
    """Plaque fine découpée à la forme d'une icône (enseigne d'encre ou d'or), carrée de « largeur » m.
    dresse : debout, face à la caméra (-Y), le pied en loc ; sinon couchée à plat, le haut de l'icône vers le nord.
    penche : inclinaison en arrière (degrés) d'une plaque debout. lacet : rotation autour de Z (degrés)."""
    png = icone_png(icone, teinte)
    bm = bmesh.new()
    uv = bm.loops.layers.uv.new("UVMap")
    w = largeur / 2.0
    vs = [bm.verts.new(v) for v in ((-w, 0, 0), (w, 0, 0), (w, 0, largeur), (-w, 0, largeur))]
    f = bm.faces.new(vs)
    for lp, (u, v) in zip(f.loops, ((0, 0), (1, 0), (1, 1), (0, 1))):
        lp[uv].uv = (u, v)
    ob = C.objet_maillage(nom, bm, mat_plaque(nom + "_mat", png))
    so = ob.modifiers.new("ep", "SOLIDIFY")
    so.thickness = epaisseur
    so.offset = 0.0
    if dresse:
        ob.rotation_euler = (-math.radians(penche), 0.0, math.radians(lacet))
    else:
        ob.rotation_euler = (-math.pi / 2, 0.0, math.radians(lacet))
    ob.location = loc
    return ob


# ---------------------------------------------------------------- formes
def tore(nom, rayon, section, loc=(0, 0, 0), mat=None, segments=48, cotes=12):
    """Anneau (tore) à plat, de rayon « rayon » et de section « section »."""
    bm = bmesh.new()
    anneaux = []
    for i in range(segments):
        a = 2 * math.pi * i / segments
        ca, sa = math.cos(a), math.sin(a)
        ring = []
        for j in range(cotes):
            b = 2 * math.pi * j / cotes
            r = rayon + section * math.cos(b)
            ring.append(bm.verts.new((r * ca, r * sa, section * math.sin(b))))
        anneaux.append(ring)
    for i in range(segments):
        a0, a1 = anneaux[i], anneaux[(i + 1) % segments]
        for j in range(cotes):
            f = bm.faces.new((a0[j], a1[j], a1[(j + 1) % cotes], a0[(j + 1) % cotes]))
            f.smooth = True
    ob = C.objet_maillage(nom, bm, mat, lisse=True)
    ob.location = loc
    return ob


def disque(nom, rayon, epaisseur, loc=(0, 0, 0), mat=None, segments=64, biseau=0.0):
    """Disque épais posé sur loc (cylindre bas) ; biseau : chanfrein du bord (m)."""
    ob = C.cylindre(nom, rayon, epaisseur, loc=loc, mat=mat, segments=segments)
    if biseau > 0:
        C.biseau(ob, biseau, segments=3)
    return ob


def perles(nom, rayon, nombre, taille, z=0.0, mat=None, loc=(0, 0, 0), graine=0):
    """Rang de perles (petites sphères) sur un cercle : le cerclage pointillé des médaillons du SVG."""
    bm = bmesh.new()
    for k in range(nombre):
        a = 2 * math.pi * k / nombre
        geo = bmesh.ops.create_icosphere(bm, subdivisions=2, radius=taille)
        bmesh.ops.translate(bm, vec=(rayon * math.cos(a), rayon * math.sin(a), z), verts=geo["verts"])
    ob = C.objet_maillage(nom, bm, mat, lisse=True)
    ob.location = loc
    return ob


def contour_ecu(largeur, hauteur, n=12):
    """Points (x, z) d'un écusson : bord droit en haut, flancs droits sur la moitié, pointe arrondie (le chemin du SVG)."""
    w, zf = largeur / 2.0, hauteur * 0.5
    pts = [(-w, hauteur), (w, hauteur)]
    for k in range(n + 1):
        a = k / n * math.pi / 2
        pts.append((w * math.cos(a), zf * (1 - math.sin(a))))
    for k in range(n - 1, -1, -1):
        a = k / n * math.pi / 2
        pts.append((-w * math.cos(a), zf * (1 - math.sin(a))))
    return pts


def ecusson(nom, largeur, hauteur, teinte, epaisseur=0.08, loc=(0, 0, 0), penche=12.0, lacet=0.0, mat=None, lisere=ENCRE,
            bombe=0.0):
    """Écusson debout face à la caméra (-Y), le pied en loc, légèrement penché en arrière ; lisere : un second écusson un peu
    plus grand derrière, à l'encre (le trait du SVG) ; None pour s'en passer. Renvoie la liste des objets."""
    objets = []
    for k, (l, h, t, dy) in enumerate(((largeur, hauteur, teinte, 0.0),) + (((largeur * 1.1, hauteur * 1.08, lisere, epaisseur * 0.6),) if lisere else ())):
        bm = bmesh.new()
        vs = [bm.verts.new((x, 0.0, z)) for x, z in contour_ecu(l, h)]
        bm.faces.new(vs)
        if bombe > 0 and k == 0:
            for v in vs:
                v.co.y = -bombe * (1 - (v.co.x / (l / 2.0)) ** 2) * 0.5
        ob = C.objet_maillage(nom if k == 0 else nom + "_lisere", bm, (mat if k == 0 and mat else mat_teinte(nom + "_t%d" % k, t)))
        so = ob.modifiers.new("ep", "SOLIDIFY")
        so.thickness = epaisseur
        so.offset = 1.0
        C.biseau(ob, min(0.02, epaisseur * 0.3), segments=2)
        ob.rotation_euler = (-math.radians(penche), 0.0, math.radians(lacet))
        ob.location = (loc[0], loc[1] + dy, loc[2] - (0.01 if k else 0.0))
        objets.append(ob)
    return objets


def sac(nom, rayon=0.32, hauteur=0.62, loc=(0, 0, 0), mat=None, lacet=0.0, plein=True):
    """Sac de grain : une sphère écrasée au sol, col noué d'un lien de cuir ; vide : affaissé, plus bas."""
    rnd = random.Random(hash(nom) & 0xffff)
    bm = bmesh.new()
    bmesh.ops.create_icosphere(bm, subdivisions=3, radius=rayon)
    kz = (hauteur if plein else hauteur * 0.55) / (2 * rayon)
    for v in bm.verts:
        x, y, z = v.co
        r = math.hypot(x, y) / rayon
        v.co.z = max(z * kz, -0.18 * rayon) + rayon * 0.18
        bosse = 1 + 0.05 * math.sin(6 * math.atan2(y, x) + 1.3) * (1 - z / rayon) ** 2
        v.co.x, v.co.y = x * bosse * (1.0 if plein else 1.15), y * bosse * (1.0 if plein else 1.15)
        if not plein:
            v.co.z *= 1 - 0.25 * (1 - r) ** 2        # creux au milieu
    ob = C.objet_maillage(nom, bm, mat or mat_toile(nom + "_toile", JUTE), lisse=True)
    ob.rotation_euler.z = math.radians(lacet)
    ob.location = loc
    h = max(v.co.z for v in ob.data.vertices)
    col = C.cylindre(nom + "_col", rayon * 0.3, rayon * 0.4, (loc[0], loc[1], loc[2] + h - rayon * 0.12), mat or mat_toile(nom + "_toile2", JUTE), segments=12)
    lien = tore(nom + "_lien", rayon * 0.3, rayon * 0.04, (loc[0], loc[1], loc[2] + h + rayon * 0.05), mat_cuir(nom + "_cuir"), segments=20, cotes=6)
    return [ob, col, lien]


def rouleau(nom, longueur=0.9, rayon=0.11, loc=(0, 0, 0), lacet=0.0, ruban=RUBRIQUE, mat=None):
    """Rouleau de parchemin couché (le long de X avant lacet), noué d'un ruban."""
    corps = C.cylindre(nom, rayon, longueur, (0, 0, 0), mat or mat_parchemin(nom + "_p", grain=0.3), segments=20)
    corps.rotation_euler = (0, math.pi / 2, 0)
    corps.location = (-longueur / 2, 0, rayon)
    objets = [corps]
    if ruban:
        rb = tore(nom + "_ruban", rayon * 1.02, rayon * 0.12, (0, 0, rayon), mat_teinte(nom + "_r", ruban), segments=24, cotes=6)
        rb.rotation_euler = (0, math.pi / 2, 0)
        objets.append(rb)
    p = C.pivot(nom + "_pivot", objets, lacet, loc)
    return objets + [p]


def pile_pieces(nom, nombre=5, rayon=0.14, epaisseur=0.03, loc=(0, 0, 0), mat=None, graine=0):
    """Pile de pièces d'or un peu de travers."""
    rnd = random.Random(graine)
    m = mat or mat_or_poli(nom + "_or")
    objets = []
    for k in range(nombre):
        dx, dy = rnd.uniform(-0.25, 0.25) * rayon, rnd.uniform(-0.25, 0.25) * rayon
        p = C.cylindre("%s_%d" % (nom, k), rayon, epaisseur, (loc[0] + dx, loc[1] + dy, loc[2] + k * epaisseur), m, segments=24)
        p.rotation_euler.z = rnd.uniform(0, 1.0)
        objets.append(p)
    return objets


def tente(nom, largeur=1.6, profondeur=1.4, hauteur=1.2, loc=(0, 0, 0), lacet=0.0, mat=None, ouverture="#5a4a36"):
    """Tente à deux pans (faîtière, pans de toile, pignon arrière fermé, entrée sombre devant), face à -Y avant lacet."""
    w, d, h = largeur / 2.0, profondeur / 2.0, hauteur
    m = mat or mat_toile(nom + "_toile", TOILE)
    bm = bmesh.new()
    A, B, Cc = bm.verts.new((-w, -d, 0)), bm.verts.new((w, -d, 0)), bm.verts.new((0, -d, h))
    D, E, F = bm.verts.new((-w, d, 0)), bm.verts.new((w, d, 0)), bm.verts.new((0, d, h))
    bm.faces.new((A, Cc, F, D))
    bm.faces.new((B, E, F, Cc))
    bm.faces.new((D, F, E))
    corps = C.objet_maillage(nom, bm, m)
    so = corps.modifiers.new("ep", "SOLIDIFY")
    so.thickness = 0.03
    bm2 = bmesh.new()
    A2, B2, C2 = bm2.verts.new((-w * 0.98, -d + 0.02, 0)), bm2.verts.new((w * 0.98, -d + 0.02, 0)), bm2.verts.new((0, -d + 0.02, h * 0.98))
    bm2.faces.new((A2, B2, C2))
    entree = C.objet_maillage(nom + "_entree", bm2, mat_teinte(nom + "_ombre", ouverture, rugosite=1.0))
    faite = C.cylindre(nom + "_faite", 0.035, profondeur + 0.3, (0, 0, 0), mat_bois(nom + "_bois"), segments=8)
    faite.rotation_euler = (math.pi / 2, 0, 0)
    faite.location = (0, d + 0.15, h)
    objets = [corps, entree, faite]
    p = C.pivot(nom + "_pivot", objets, lacet, loc)
    return objets + [p]


def feu(nom, loc=(0, 0, 0), rayon=0.3, hauteur=0.55, pierres=True, graine=0):
    """Feu de camp : trois bûches croisées, flammes émissives, cercle de pierres."""
    rnd = random.Random(graine)
    objets = []
    mb = mat_bois(nom + "_buche", "#3a2616")
    for k in range(3):
        b = C.cylindre("%s_b%d" % (nom, k), 0.05, rayon * 1.6, (0, 0, 0), mb, segments=8)
        b.rotation_euler = (math.radians(80 + rnd.uniform(-8, 8)), 0, math.radians(k * 120 + rnd.uniform(-10, 10)))
        b.location = (loc[0] + rnd.uniform(-0.03, 0.03), loc[1] + rnd.uniform(-0.03, 0.03), loc[2] + 0.05)
        objets.append(b)
    mf = mat_flamme(nom + "_flamme")
    mf2 = mat_flamme(nom + "_flamme2", "#ffd36a", force=9.0, alpha=0.9)
    for k, (dx, dy, kh, m) in enumerate(((0, 0, 1.0, mf), (0.1, -0.05, 0.7, mf), (-0.09, 0.06, 0.6, mf), (0.02, 0.0, 0.45, mf2))):
        fl = C.sphere("%s_f%d" % (nom, k), rayon * 0.45, (loc[0] + dx, loc[1] + dy, loc[2] + 0.08 + hauteur * kh * 0.45), m, subdiv=2,
                      echelle=(1.0, 1.0, hauteur * kh / (rayon * 0.45)))
        objets.append(fl)
    if pierres:
        mp = C.mat_simple(nom + "_pierre", "#7d7467", rugosite=0.95, bosse=0.4, echelle_bosse=60.0)
        for k in range(7):
            a = 2 * math.pi * k / 7 + rnd.uniform(-0.2, 0.2)
            r = rayon * 1.45
            objets.append(C.sphere("%s_p%d" % (nom, k), 0.07 * rnd.uniform(0.8, 1.2), (loc[0] + r * math.cos(a), loc[1] + r * math.sin(a), loc[2] + 0.05), mp, subdiv=1,
                                   echelle=(1.2, 1.0, 0.7)))
    return objets


def sceau_cire(nom, rayon=1.7, epaisseur=0.28, teintes=CIRE_JOUEUR, icone=None, loc=(0, 0, 0), graine=0, anneau=True, embleme=True):
    """Cachet de cire : galette au bord irrégulier, dessus bombé, emblème (icône Game-icons) en relief dans la cire et, si
    embleme, posé dessus en plaque fine de la teinte du reflet (lisible à 26 unités), et un cercle en bourrelet (comme le
    sceau du SVG). Renvoie la liste des objets."""
    rnd = random.Random(graine)
    phases = [rnd.uniform(0, 6.28) for _ in range(3)]
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=64, radius1=rayon, radius2=rayon, depth=epaisseur)
    bmesh.ops.translate(bm, vec=(0, 0, epaisseur / 2), verts=bm.verts)
    for v in bm.verts:
        a = math.atan2(v.co.y, v.co.x)
        f = 1 + 0.045 * math.sin(3 * a + phases[0]) + 0.03 * math.sin(5 * a + phases[1]) + 0.02 * math.sin(8 * a + phases[2])
        v.co.x *= f
        v.co.y *= f
    for f in bm.faces:
        f.smooth = True
    relief = icone_png(icone) if icone else None
    m = mat_cire(nom + "_cire", teintes, relief_png=relief, force_relief=0.9, rayon=rayon, part=0.62)
    ob = C.objet_maillage(nom, bm, m, lisse=True)
    b = ob.modifiers.new("biseau", "BEVEL")
    b.width = epaisseur * 0.55
    b.segments = 6
    b.limit_method = "ANGLE"
    b.angle_limit = math.radians(40)
    ob.location = loc
    objets = [ob]
    if anneau:
        # le cercle du sceau : un fin bourrelet de la même cire, un peu plus sombre
        mc = mat_cire(nom + "_cercle", (teintes[1], teintes[1], teintes[2]))
        objets.append(tore(nom + "_anneau", rayon * 0.6, epaisseur * 0.09, (loc[0], loc[1], loc[2] + epaisseur), mc, segments=56, cotes=8))
    if icone and embleme:
        w = rayon * 0.9
        objets.append(plaque_icone(nom + "_embleme", icone, w, teintes[2], epaisseur=0.025, loc=(loc[0], loc[1] - w / 2, loc[2] + epaisseur + 0.012), dresse=False))
    return objets


# ---------------------------------------------------------------- le rondel (cadre commun des médaillons)
def rondel(nom, rayon=R_HALTE / PX_PAR_M, anneau="or", parchemin=PARCHEMIN_CLAIR, bande=BANDE_CADRE / PX_PAR_M):
    """Géométrie du cadre d'un médaillon, à plat autour de l'origine : disque de métal (rayon) cerné d'encre, rang de
    perles d'encre, champ de parchemin un peu surélevé (rayon - bande) cerné d'encre. Renvoie (objets, rayon intérieur, z du champ)."""
    m_or = mat_anneau(anneau)
    m_encre = mat_encre(nom + "_encre")
    r_int = rayon - bande
    objets = [disque(nom + "_or", rayon, 0.10, (0, 0, 0), m_or, segments=96, biseau=0.03),
              tore(nom + "_cerne", rayon, 0.022, (0, 0, 0.09), m_encre, segments=96, cotes=8),
              perles(nom + "_perles", rayon - bande * 0.58, 30, 0.028, 0.105, m_encre),
              disque(nom + "_champ", r_int, 0.14, (0, 0, 0), mat_parchemin(nom + "_parchemin", parchemin), segments=96, biseau=0.015),
              tore(nom + "_rebord", r_int, 0.018, (0, 0, 0.135), m_encre, segments=96, cotes=8)]
    return objets, r_int, 0.14


def cadre_rondel(anneau="or", taille=VIGNETTE, rayon_u=R_HALTE, parchemin=PARCHEMIN_CLAIR, forcer=False, echantillons=64):
    """Image (PIL RGBA, 2 × taille) du cadre d'un médaillon vu de dessus, rendue une fois par variante et mise en cache :
    tous les médaillons partagent le même cercle, à la place exacte du cercle du SVG (rayon_u unités, centré)."""
    cle = "rondel-%s-%d-%d-%s.png" % (anneau, taille, rayon_u, parchemin.lstrip("#"))
    chemin = os.path.join(C.CACHE, cle)
    if os.path.exists(chemin) and not forcer:
        return Image.open(chemin).convert("RGBA")
    px = taille * C.ECHELLE
    C.reinitialiser()
    C.installer_lumiere(force_ciel=0.6)
    C.lumiere_appoint(0.4)
    rondel("cadre", rayon_u / PX_PAR_M, anneau, parchemin)
    C.camera_dessus(0.0, 0.0, taille / PX_PAR_M, taille / PX_PAR_M, hauteur_cam=60.0)
    C.reglages_rendu(px * SURECH, px * SURECH, echantillons=echantillons, transparent=True)
    img = C.rendre(os.path.join(C.CACHE, "_rendu", "cadre-" + cle))
    img = C._reduire(img, SURECH)
    rgb = img.convert("RGB").filter(ImageFilter.UnsharpMask(radius=1.0, percent=40, threshold=1))
    img = Image.merge("RGBA", (*rgb.split(), img.split()[3]))
    img.save(chemin)
    journal("cadre %s rendu (%d px)" % (cle, px))
    return img


def masque_disque(taille_px, rayon_px, fondu=2.0):
    """Masque 0..1 d'un disque centré (bord fondu sur « fondu » px)."""
    yy, xx = np.mgrid[0:taille_px, 0:taille_px].astype(np.float32)
    c = (taille_px - 1) / 2.0
    d = np.hypot(xx - c, yy - c)
    return np.clip((rayon_px - d) / fondu + 0.5, 0, 1)


# ---------------------------------------------------------------- scènes et caméras
def sol_capteur_disque(rayon, teinte=PARCHEMIN_CLAIR, z=0.0):
    """Sol invisible (ne garde que les ombres) en forme de disque, de la teinte du parchemin (rebond chaud sous l'objet)."""
    bm = bmesh.new()
    bmesh.ops.create_circle(bm, cap_ends=True, segments=64, radius=rayon)
    ob = C.objet_maillage("sol_ombres", bm, C.mat_simple("sol_parchemin", teinte, rugosite=1.0))
    ob.location = (0, 0, z)
    ob.is_shadow_catcher = True
    return ob


def scene_vignette(taille=VIGNETTE, inclinaison=INCLINAISON, px_par_m=PX_PAR_M, surech=SURECH, rayon_sol=None, appoint=APPOINT,
                   ancre=None):
    """Scène d'un objet de médaillon : lumière commune, caméra de trois quarts (inclinaison en degrés) dont l'origine du
    monde tombe au centre de l'image (ancre = (x, y) en unités depuis le coin haut-gauche pour en décider autrement),
    sol-capteur en disque de rayon_sol (m) si demandé (l'ombre portée se calcule dessus ; None : pas d'ombre)."""
    C.reinitialiser()
    C.installer_lumiere()
    C.lumiere_appoint(appoint)
    w = h = taille if isinstance(taille, int) else None
    if w is None:
        w, h = taille
    k = C.ECHELLE * surech
    ax, ay = (w / 2.0, h / 2.0) if ancre is None else ancre
    cam = C.camera_trois_quarts(w * k, h * k, px_par_m * k, (h - ay) * k, inclinaison=inclinaison, ancre_x_px=ax * k)
    sol = sol_capteur_disque(rayon_sol) if rayon_sol else None
    return {"camera": cam, "sol": sol, "w": w, "h": h, "surech": surech, "px_par_m": px_par_m}


def scene_dessus(largeur_m, hauteur_m, W, H, echantillons=48, exposition=-0.1, appoint=0.0):
    """Scène d'un fond vu de dessus (parchemin de route, cadre de page) : l'origine au coin sud-ouest, le nord en haut,
    rendu opaque W × H. Renvoie la caméra."""
    C.reinitialiser()
    C.installer_lumiere()
    if appoint:
        C.lumiere_appoint(appoint)
    cam = C.camera_dessus(largeur_m / 2.0, hauteur_m / 2.0, largeur_m, hauteur_m, hauteur_cam=80.0)
    C.reglages_rendu(W, H, echantillons=echantillons, transparent=False, filtre=1.0, exposition=exposition)
    return cam


def scene_scene(w, h, px_par_m, ancre_bas, inclinaison=C.INCLINAISON, surech=SURECH, sol=True, appoint=C.APPOINT_FORCE):
    """Scène de trois quarts à la manière des sprites du jeu (40°, ancre à ancre_bas unités du bas) : carte de campagne,
    illustrations larges. sol : sol-capteur carré d'herbe ou de parchemin (teinte parchemin)."""
    C.reinitialiser()
    C.installer_lumiere()
    C.lumiere_appoint(appoint)
    k = C.ECHELLE * surech
    cam = C.camera_trois_quarts(w * k, h * k, px_par_m * k, ancre_bas * k, inclinaison=inclinaison)
    if sol:
        C.sol_capteur(80.0, teinte=PARCHEMIN_SOMBRE)
    return cam


# ---------------------------------------------------------------- rendu
def rendre_rondel(nom, objets, anneau="or", taille=VIGNETTE, rayon_u=R_HALTE, parchemin=PARCHEMIN_CLAIR, surech=SURECH,
                  echantillons=48, contour=0.4, net=0.5, ombre=True, force_ombre=0.55):
    """Rend les objets de la scène courante (scene_vignette avec rayon_sol) et les pose dans le cadre commun : l'ombre portée,
    coupée au champ intérieur, puis l'objet avec son liseré d'encre. Renvoie l'image PIL RGBA (2 × taille), contrôlée.
    (Le sprite est rendu d'abord : un cadre pas encore en cache se rend ensuite dans une scène à lui.)"""
    px = taille * C.ECHELLE
    sprite = ombre_img = None
    if objets:
        sprite, ombre_img = C.rendre_sprite(nom, px, px, objets, ombre=ombre, contour=contour, surech=surech, echantillons=echantillons,
                                            ombre_separee=True, couleur_ombre=OMBRE_PARCHEMIN, force_ombre=force_ombre, net=net, controle=False)
    final = cadre_rondel(anneau, taille, rayon_u, parchemin).copy()
    if sprite is not None:
        if ombre_img is not None:
            om = ombre_img.crop((0, 0, px, px))
            a = np.array(om.split()[3], dtype=np.float32) / 255.0 * masque_disque(px, (rayon_u - BANDE_CADRE) * C.ECHELLE - 1, 2.0)
            om.putalpha(Image.fromarray((a * 255).astype(np.uint8), "L"))
            final.alpha_composite(om)
        final.alpha_composite(sprite)
    controler(final, nom)
    return final


def rendre_vignette(nom, objets, taille, surech=SURECH, echantillons=48, contour=0.45, net=0.5, ombre=False, force_ombre=0.5):
    """Sprite sans cadre (écussons des portes, sceaux, icônes de la compagnie), fond transparent, contrôlé.
    taille : int (carré) ou (w, h) en unités logiques ; la scène vient de scene_vignette avec la même taille."""
    w, h = (taille, taille) if isinstance(taille, int) else taille
    img, _ = C.rendre_sprite(nom, w * C.ECHELLE, h * C.ECHELLE, objets, ombre=ombre, contour=contour, surech=surech, echantillons=echantillons,
                             couleur_ombre=OMBRE_PARCHEMIN, force_ombre=force_ombre, net=net, controle=False)
    controler(img, nom)
    return img


def rendre_opaque(nom):
    """Rend la scène courante (scene_dessus) en RGB ; la scène doit remplir tout le cadre."""
    return C.rendre(os.path.join(C.CACHE, "_rendu", nom + ".png")).convert("RGB")


def patine(img, force=0.35, graine=7, grain=0.04, bord=0.06):
    """Patine d'un parchemin : bords assombris et irréguliers (pas de texte, pas de dessin), fin grain ; force 0..1."""
    W, H = img.size
    a = np.array(img.convert("RGB"), dtype=np.float32)
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    bx = np.minimum(xx, W - 1 - xx) / W
    by = np.minimum(yy, H - 1 - yy) / H
    n = T.bruit(W, H, max(8, W // 14), graine, octaves=4)
    d = np.minimum(bx * 2.2, by * 2.2 * (H / W) * 2.2) + 0.03 * n
    ombre = 1 - force * (1 - T.lisse01(0.0, bord * 3, d)) ** 1.3
    g = 1 + grain * T.bruit(W, H, 3, graine + 1, octaves=2)
    teinte = np.array((1.0, 0.985, 0.95), dtype=np.float32)       # les bords virent un peu au brun
    a = a * (ombre * g)[..., None] * (teinte + (1 - teinte) * ombre[..., None])
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))


# ---------------------------------------------------------------- contrôles, enregistrement, manifeste
def controler(img, nom, blancs=0.006):
    """Bords transparents (2 px) et pas de blancs brûlés (reflets de l'or, de la cire) : refus sinon (RENDU_ESSAI=1 avertit)."""
    C.controle_bords(img, nom)
    C.controle_blancs(img, nom, tolerance=blancs)
    return img


def budget():
    """Taille totale (octets) des images du dossier."""
    return sum(os.path.getsize(os.path.join(DOSSIER, f)) for f in os.listdir(DOSSIER) if f.lower().endswith((".png", ".jpg")))


def verifier_budget():
    """Refuse si le dossier dépasse BUDGET_TOTAL ; à appeler à la fin de chaque script de famille."""
    b = budget()
    journal("budget : %d Ko sur %d Ko" % (b // 1000, BUDGET_TOTAL // 1000))
    if b > BUDGET_TOTAL:
        raise C.RefusRendu("budget dépassé : %d octets > %d" % (b, BUDGET_TOTAL))
    return b


def sauver(nom, img, w=None, h=None, ax=None, ay=None, jpg=False, max_ko=450, extra=None):
    """Écrit l'image dans jeu/assets/images/expedition/ (PNG optimisé, ramené à 256 couleurs s'il dépasse SEUIL_QUANTIFIER ;
    ou JPEG sous max_ko) et met le manifeste à jour. w, h, ax, ay : taille et ancre logiques (par défaut : la moitié de
    l'image, ancre au centre, ou ceux du CATALOGUE si l'identifiant y est). extra : clés de plus dans l'entrée (ex. coupe)."""
    cat = CATALOGUE.get(nom)
    if cat:
        w = cat[1] if w is None else w
        h = cat[2] if h is None else h
        ax = cat[3] if ax is None else ax
        ay = cat[4] if ay is None else ay
        jpg = cat[5] == "jpg" if not jpg else jpg
    if w is None:
        w, h = img.size[0] // C.ECHELLE, img.size[1] // C.ECHELLE
    if ax is None:
        ax, ay = w // 2, h // 2
    if (img.size[0] != w * C.ECHELLE or img.size[1] != h * C.ECHELLE):
        journal("ATTENTION : %s fait %d × %d px pour %d × %d unités (attendu %d × %d)" % (nom, img.size[0], img.size[1], w, h, w * C.ECHELLE, h * C.ECHELLE))
    fichier = nom + (".jpg" if jpg else ".png")
    chemin = os.path.join(DOSSIER, fichier)
    if jpg:
        C.sauver_jpg(img, chemin, qualite=86, max_ko=max_ko, plancher=70)
    else:
        img.save(chemin, optimize=True)
        if os.path.getsize(chemin) > SEUIL_QUANTIFIER:
            q = img.convert("RGBA").quantize(256, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.FLOYDSTEINBERG)
            q.save(chemin, optimize=True)
            journal("%s ramené à 256 couleurs" % fichier)
        journal("écrit %s (%d Ko)" % (os.path.relpath(chemin, C.RACINE), os.path.getsize(chemin) // 1024))
    taille = os.path.getsize(chemin)
    if taille > MAX_FICHIER:
        raise C.RefusRendu("%s fait %d octets (> %d)" % (fichier, taille, MAX_FICHIER))
    e = {"f": PREFIXE_SRC + fichier, "w": int(w), "h": int(h), "ax": int(ax), "ay": int(ay)}
    if extra:
        e.update(extra)
    maj_manifeste({nom: e})
    b = budget()
    if b > BUDGET_TOTAL:
        journal("ATTENTION : budget total dépassé (%d octets > %d) : alléger les images (verifier_budget refusera)" % (b, BUDGET_TOTAL))
    return chemin


ENTETE_MANIFESTE = (
    "// Images du mode Expéditions (la route des semaines), rendues en 3D (Blender, Cycles) par atelier/outils/rendu-3d/expedition_*.py.\n"
    "// Fichier généré : ne pas modifier à la main (chaque script réécrit ses entrées).\n"
    "// f : fichier, relatif à jeu/ ; w, h : taille logique (unités du parchemin de route 1000 × 320, ou px CSS) ; ax, ay : point\n"
    "// d'ancrage dans l'image, en unités logiques depuis le coin haut-gauche (le jeu pose l'image en x = X - ax, y = Y - ay, largeur w,\n"
    "// hauteur h). Les fichiers font 2 × la taille logique. coupe (cadre-page) : largeur des tranches de border-image, en unités.\n"
    "// Une entrée absente = l'écran garde son dessin SVG (règle de la conception, atelier/conception/expeditions-graphismes.md).\n"
)


def lire_manifeste():
    if not os.path.exists(MANIFESTE):
        return {}
    with open(MANIFESTE, encoding="utf-8") as f:
        txt = f.read()
    m = re.search(r"JEU\.imagesExpedition\s*=\s*(\{.*\})\s*;", txt, re.S)
    return json.loads(m.group(1)) if m else {}


def maj_manifeste(entrees, retirer=()):
    """Fusionne des entrées {id: {f, w, h, ax, ay}} dans le manifeste et le réécrit (ordre alphabétique)."""
    tout = lire_manifeste()
    tout.update(entrees)
    for k in retirer:
        tout.pop(k, None)
    lignes = ["  %s: %s" % (json.dumps(k), json.dumps(tout[k], ensure_ascii=False, separators=(", ", ": "))) for k in sorted(tout)]
    txt = ENTETE_MANIFESTE + "window.JEU = window.JEU || {};\nJEU.imagesExpedition = {\n" + ",\n".join(lignes) + "\n};\n"
    with open(MANIFESTE, "w", encoding="utf-8") as f:
        f.write(txt)
    journal("manifeste : %d entrées" % len(tout))


def manquants(famille=None):
    """Identifiants du catalogue qui n'ont pas encore d'image dans le manifeste."""
    man = lire_manifeste()
    return [k for k in catalogue(famille) if k not in man or not os.path.exists(os.path.join(C.RACINE, "jeu", man[k]["f"]))]


# ---------------------------------------------------------------- planche de contrôle
POLICE = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"


def _police(taille):
    try:
        return ImageFont.truetype(POLICE, taille)
    except Exception:
        return ImageFont.load_default()


def planche(famille, fond=PARCHEMIN, largeur=1400):
    """Planche de contrôle d'une famille : chaque image du manifeste à sa taille logique (échelle 1, comme à 1366 px), à
    1,5 et au fichier (2 ×), sur un fond de parchemin, avec son identifiant ; les images attendues et absentes sont listées.
    Écrit atelier/captures/planche-expedition-<famille>.png et renvoie le chemin."""
    man = lire_manifeste()
    ids = [k for k in catalogue(famille) if k in man]
    absents = manquants(famille)
    police, petite = _police(15), _police(12)
    cellules = []
    for k in ids:
        e = man[k]
        chemin = os.path.join(C.RACINE, "jeu", e["f"])
        if not os.path.exists(chemin):
            continue
        im = Image.open(chemin).convert("RGBA")
        W, H = im.size
        grand = W > 700
        echelles = (0.25, 0.5) if grand else (0.5, 0.75, 1.0)
        vues = []
        for s in echelles:
            vues.append(im.convert("RGBa").resize((max(1, round(W * s)), max(1, round(H * s))), Image.LANCZOS).convert("RGBA"))
        cw = sum(v.size[0] for v in vues) + 16 * (len(vues) + 1)
        ch = max(v.size[1] for v in vues) + 44
        cellules.append((k, e, vues, cw, ch))
    x = y = 16
    hauteur_ligne = 0
    positions = []
    for k, e, vues, cw, ch in cellules:
        if x + cw > largeur - 16 and x > 16:
            x = 16
            y += hauteur_ligne + 12
            hauteur_ligne = 0
        positions.append((x, y))
        x += cw + 12
        hauteur_ligne = max(hauteur_ligne, ch)
    H = y + hauteur_ligne + 60 + 18 * (1 + len(absents) // 4)
    can = Image.new("RGB", (largeur, H), C.rgb8(fond))
    d = ImageDraw.Draw(can)
    for (k, e, vues, cw, ch), (x, y) in zip(cellules, positions):
        d.rectangle((x, y, x + cw, y + ch), outline=(170, 150, 110))
        vx = x + 16
        for v in vues:
            can.alpha_composite(v, (vx, y + 8)) if can.mode == "RGBA" else can.paste(v, (vx, y + 8), v)
            vx += v.size[0] + 16
        d.text((x + 8, y + ch - 34), k, fill=C.rgb8(ENCRE), font=police)
        d.text((x + 8, y + ch - 17), "%d × %d, ancre %d, %d, %d Ko" % (e["w"], e["h"], e["ax"], e["ay"], os.path.getsize(os.path.join(C.RACINE, "jeu", e["f"])) // 1024),
               fill=(90, 74, 54), font=petite)
    yy = H - 50 - 18 * (len(absents) // 4)
    d.text((16, yy), "Famille « %s » : %d images rendues sur %d ; budget du dossier %d Ko / %d Ko" % (famille, len(cellules), len(catalogue(famille)), budget() // 1000, BUDGET_TOTAL // 1000),
           fill=C.rgb8(RUBRIQUE), font=police)
    if absents:
        d.text((16, yy + 20), "Manquent : " + ", ".join(absents), fill=(90, 74, 54), font=petite)
    os.makedirs(CAPTURES, exist_ok=True)
    chemin = os.path.join(CAPTURES, "planche-expedition-%s.png" % famille)
    can.save(chemin)
    journal("planche : " + os.path.relpath(chemin, C.RACINE))
    return chemin


# ---------------------------------------------------------------- essai de bout en bout
def rendre_halte_brume():
    """Le médaillon vide d'une halte dans la brume (famille route) : le cadre commun sur un champ gris, sans objet."""
    img = rendre_rondel("halte-brume", [], anneau="or", parchemin=BRUME_CHAMP)
    return sauver("halte-brume", img)


def main(args):
    if "--essai" in args or not args:
        cadre_rondel("or", forcer="--forcer" in args)
        rendre_halte_brume()
        planche("route")
        verifier_budget()
    if "--planche" in args:
        for f in FAMILLES:
            planche(f)
    if "--manquants" in args:
        for f in FAMILLES:
            print(f, ":", ", ".join(manquants(f)) or "rien")


if __name__ == "__main__":
    main(sys.argv[1:])
