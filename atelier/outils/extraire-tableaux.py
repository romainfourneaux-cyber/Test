# Extraction des tableaux d'un PDF (pdfplumber), utilisée une fois pour l'emploi du temps. Outil facultatif : demande Python et pdfplumber.
# Usage : python extraire-tableaux.py "<pdf>" "<sortie.json>"
import pdfplumber, sys, json
pdf = pdfplumber.open(sys.argv[1])
out = []
for i, p in enumerate(pdf.pages):
    t = p.extract_tables()
    out.append({"page": i+1, "tables": t})
json.dump(out, open(sys.argv[2], "w"), ensure_ascii=False, indent=0)
