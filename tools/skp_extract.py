#!/usr/bin/env python3
"""
Extraction de la géométrie d'un fichier SketchUp (.skp, format 2021+) vers JSON/JS.

Le .skp récent = en-tête UTF-16 + archive ZIP contenant `model.dat`.
`model.dat` est un arbre TLV (tag uint16, longueur uint32, valeur).
On lit la géométrie de premier niveau du modèle (bloc 502 / 5000) :
  5001 -> sommets   (2500 : id 1502 + position 2501 = 3 doubles, en pouces)
  5002 -> arêtes    (3000 : id + sommet début 3001 + sommet fin 3002)
  5003 -> faces     (3500 : plan 3501 + boucles 3502/4500/4501/4000 d'arêtes orientées)
Les composants (ex. le personnage « Chris ») sont ignorés.

Usage (Windows : `py tools\\skp_extract.py model\\grotte_de_sel1.skp`) :
    python tools/skp_extract.py model/grotte_de_sel1.skp [js/model-data.js]
"""
import io
import json
import struct
import sys
import zipfile

INCH = 25.4  # SketchUp stocke en pouces -> on exporte en mm


def read_model_dat(path):
    raw = open(path, "rb").read()
    i = raw.find(b"PK\x03\x04")
    if i < 0:
        raise SystemExit("Format .skp non reconnu (SketchUp 2021+ requis)")
    with zipfile.ZipFile(io.BytesIO(raw[i:])) as z:
        return z.read("model.dat")


class Node:
    __slots__ = ("tag", "a", "b", "kids", "d")

    def __init__(self, d, tag, a, b):
        self.d, self.tag, self.a, self.b, self.kids = d, tag, a, b, None
        if b - a >= 6:
            self.kids = self._children()

    def _children(self):
        res, p = [], self.a
        while p < self.b:
            if p + 6 > self.b:
                return None
            tag, ln = struct.unpack_from("<HI", self.d, p)
            if p + 6 + ln > self.b:
                return None
            res.append((tag, p + 6, p + 6 + ln))
            p += 6 + ln
        return [Node(self.d, *x) for x in res]

    def val(self):
        return self.d[self.a:self.b]

    def kid(self, tag):
        return [k for k in (self.kids or []) if k.tag == tag]


def entity_id(n):
    def find(x):
        for k in x.kids or []:
            if k.tag == 1502:
                return k
            if k.tag in (2000, 1500):
                r = find(k)
                if r:
                    return r
    return struct.unpack("<H", find(n).val()[:2])[0]


def u16(n):
    return struct.unpack("<H", n.val()[:2])[0]


def extract(path):
    d = read_model_dat(path)
    tag, ln = struct.unpack_from("<HI", d, 0)
    root = Node(d, tag, 6, 6 + ln)
    model = root.kid(502)[0].kids[0]
    grp = {k.tag: k for k in model.kids}

    verts, vindex = [], {}
    for v in grp[5001].kids:
        x, y, z = struct.unpack("<3d", v.kid(2501)[0].val())
        vindex[entity_id(v)] = len(verts)
        verts.append([round(x * INCH, 1), round(y * INCH, 1), round(z * INCH, 1)])

    edges = {}
    for e in grp[5002].kids:
        edges[entity_id(e)] = (vindex[u16(e.kid(3001)[0])], vindex[u16(e.kid(3002)[0])])

    faces = []
    for f in grp[5003].kids:
        nx, ny, nz, _ = struct.unpack("<4d", f.kid(3501)[0].val())
        loops = []
        for lp in f.kid(3502)[0].kid(4500):
            pts = []
            for eu in lp.kid(4501)[0].kid(4000):
                a, b = edges[u16(eu.kid(4001)[0])]
                if eu.kid(4002)[0].val()[0]:
                    a, b = b, a
                pts.append(a)
            loops.append(pts)
        faces.append({"n": [round(nx, 5), round(ny, 5), round(nz, 5)], "loops": loops})

    return {
        "source": path.replace("\\", "/").split("/")[-1],
        "units": "mm",
        "vertices": verts,
        "edges": list(edges.values()),
        "faces": faces,
    }


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    out = sys.argv[2] if len(sys.argv) > 2 else "js/model-data.js"
    m = extract(sys.argv[1])
    with open(out, "w", encoding="utf-8") as fh:
        fh.write("// Généré par tools/skp_extract.py — ne pas éditer à la main\n")
        fh.write("window.SKP_MODEL = ")
        json.dump(m, fh, separators=(",", ":"))
        fh.write(";\n")
    print(f"{out}: {len(m['vertices'])} sommets, {len(m['edges'])} arêtes, {len(m['faces'])} faces")
