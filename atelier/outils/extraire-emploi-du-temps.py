# Découpe les tableaux de l'emploi du temps (sortie de extraire-tableaux.py) en entrées par matière, jour et créneau.
# Usage : python extraire-emploi-du-temps.py "<tableaux.json>" "atelier/extractions/Emploi du temps - entrees par matiere.json"
import json, re, sys
d = json.load(open(sys.argv[1]))
DAYS = ["Lundi","Mardi","Mercredi","Jeudi","Vendredi"]
SUBJ = [("histoire", r"Histoire\s*[–-]"), ("geographie", r"G[ée]o(graphie)?\s*[–-]"), ("svt", r"SVT\s*[–-]"),
        ("physique", r"Physique[- ]Chimie"), ("litterature", r"Litt[ée]rature\s*[–-]"),
        ("lecture", r"Lecture\s*[–-]"), ("anglais", r"Anglais"),
        ("_autre", r"Maths|Français vidéo|Langue vivante|Rattrapage|Éducation musicale|Techno|Option Latin|Art plastique|EMC|Expression écrite|Dictée|Récitation|Visio|Poésie|Espagnol")]
res = {}
for pg in d:
    for t in pg["tables"]:
        week = None
        for r in t:
            for c in r:
                m = re.search(r"Semaine\s+(\d+)", c or "")
                if m: week = int(m.group(1))
        if not week: continue
        blocks = {day: [[]] for day in DAYS}
        hdr = None
        for r in t:
            cells = [(c or "").replace("\n"," ").strip() for c in r]
            if "Lundi" in cells: hdr = cells; continue
            if hdr is None: continue
            for j, day in enumerate(hdr):
                if day not in DAYS: continue
                v = cells[j] if j < len(cells) else ""
                if v in ("Récréation","Déjeuner"):
                    blocks[day].append([])
                elif v: blocks[day][-1].append(v)
        entries = []
        for day in DAYS:
            for b in blocks[day]:
                txt = " ".join(b)
                txt = re.sub(r"\s+"," ",txt)
                if not txt: continue
                # split at subject keywords
                pos = []
                for s, rx in SUBJ:
                    for m in re.finditer(rx, txt):
                        pos.append((m.start(), s))
                pos.sort()
                # drop keyword hits inside a previous segment of same subject? keep simple
                for k,(p,s) in enumerate(pos):
                    end = pos[k+1][0] if k+1 < len(pos) else len(txt)
                    seg = txt[p:end].strip()
                    if s != "_autre": entries.append({"jour":day,"matiere":s,"texte":seg})
        res.setdefault(week, []).extend(entries)
json.dump(res, open(sys.argv[2],"w"), ensure_ascii=False, indent=1)
for w in sorted(res, key=int):
    print("=== S%s" % w)
    for e in res[w]:
        print("  %-9s %-11s %s" % (e["jour"], e["matiere"], e["texte"][:150]))
