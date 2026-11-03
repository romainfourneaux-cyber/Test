# Extrait les icônes choisies (atelier/outils/icones-choisies.json) du jeu Game-icons (paquet @iconify-json/game-icons,
# fichier icons.json téléchargé depuis cdn.jsdelivr.net) vers jeu/assets/icones/game-icons.js. Licence CC BY 3.0, crédit dans jeu/CREDITS.md.
# Usage : python extraire-icones.py "<icons.json>"
import json, sys, os
ici = os.path.dirname(os.path.abspath(__file__))
racine = os.path.join(ici, "..", "..")
d = json.load(open(sys.argv[1], encoding="utf-8"))["icons"]
noms = json.load(open(os.path.join(ici, "icones-choisies.json"), encoding="utf-8"))
out = {k: d[v]["body"] for k, v in noms.items()}
txt = ("// Icônes Game-icons.net (Lorc, Delapouite, Sbed, Cathelineau, Skoll, HeavenlyDog et DarkZaitzev), licence CC BY 3.0 : https://game-icons.net\n"
       "// Sélection générée par atelier/outils/extraire-icones.py depuis le paquet @iconify-json/game-icons 1.2.4. Cadre 512 × 512.\n"
       "(function (racine) {\n  racine.JEU = racine.JEU || {};\n  racine.JEU.GAME_ICONS = " + json.dumps(out, ensure_ascii=False, indent=0) +
       ";\n})(typeof window !== \"undefined\" ? window : globalThis);\n")
open(os.path.join(racine, "jeu", "assets", "icones", "game-icons.js"), "w", encoding="utf-8").write(txt)
print(len(out), "icônes")
