#!/usr/bin/env python3
"""Regroupe un mini-site statique (pages HTML, CSS, JS, images) en UN SEUL fichier HTML autonome.

Usage :  python regrouper.py <dossier-du-site> <fichier-de-sortie.html> "<titre>"

Principe : chaque page, feuille de style, script et image est rangé dans le fichier. Au chargement,
une petite coquille crée des adresses blob: pour chaque ressource et affiche les pages dans un cadre.
Les liens entre pages, le bouton Retour et le panier (stockage local) continuent de fonctionner.
Les polices restent chargées depuis Google Fonts : une connexion internet est nécessaire.
Pillow (facultatif) réduit les images trop grandes.
"""
import base64
import io
import json
import os
import posixpath
import re
import sys

LARGEUR_MAX = 720
MIME = {".webp": "image/webp", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".svg": "image/svg+xml",
        ".gif": "image/gif", ".avif": "image/avif", ".woff": "font/woff", ".woff2": "font/woff2",
        ".css": "text/css", ".js": "text/javascript"}
TEXTE = {".css", ".js"}
CHEMIN = re.compile(r"""(?<![\w:/.\-])((?:\.\.?/)*[A-Za-z0-9_\-][A-Za-z0-9_\-./]*\.(?:webp|jpe?g|png|svg|gif|avif|woff2?|css|js))(?=[\s"'),?#\\]|$)""")
PREFIXE = re.compile(r"""["']((?:\.\.?/)*[A-Za-z0-9_\-][A-Za-z0-9_\-./]*/)["']""")


def lire(p):
    with open(p, encoding="utf-8") as f:
        return f.read()


class Paquet:
    def __init__(self, site):
        self.site = os.path.abspath(site)
        self.binaires, self.textes, self.carte = [], [], {}
        self.index = {}

    def cle(self, absolu):
        return posixpath.normpath(os.path.relpath(absolu, self.site).replace(os.sep, "/"))

    def ajouter(self, absolu):
        """Range un fichier et renvoie son jeton (tg-asset:N ou tg-file:N)."""
        absolu = os.path.normpath(absolu)
        if absolu in self.index:
            return self.index[absolu]
        ext = os.path.splitext(absolu)[1].lower()
        if ext in TEXTE:
            jeton = "tg-file:%d" % len(self.textes)
            self.index[absolu] = jeton
            self.textes.append(None)
            base = os.path.dirname(absolu) if ext == ".css" else self.site
            contenu = self.remplacer(lire(absolu), base, js=(ext == ".js"))
            self.textes[int(jeton.split(":")[1])] = [MIME[ext], contenu]
        else:
            jeton = "tg-asset:%d" % len(self.binaires)
            self.index[absolu] = jeton
            self.binaires.append([MIME.get(ext, "application/octet-stream"), self.encoder(absolu, ext)])
        self.carte[self.cle(absolu)] = jeton
        return jeton

    def encoder(self, absolu, ext):
        with open(absolu, "rb") as f:
            donnees = f.read()
        if ext in (".webp", ".jpg", ".jpeg", ".png"):
            try:
                from PIL import Image
                im = Image.open(io.BytesIO(donnees))
                if im.width > LARGEUR_MAX:
                    im = im.convert("RGBA" if im.mode in ("RGBA", "LA", "P") else "RGB")
                    im = im.resize((LARGEUR_MAX, round(im.height * LARGEUR_MAX / im.width)), Image.LANCZOS)
                    sortie = io.BytesIO()
                    im.save(sortie, "WEBP", quality=74, method=6)
                    if sortie.tell() < len(donnees):
                        donnees = sortie.getvalue()
            except ImportError:
                pass
        return base64.b64encode(donnees).decode("ascii")

    def remplacer(self, texte, base, js=False):
        def sub(m):
            chemin = m.group(1)
            absolu = os.path.normpath(os.path.join(base, chemin))
            if not os.path.isfile(absolu) or absolu.endswith(".html"):
                return chemin
            return self.ajouter(absolu)
        texte = CHEMIN.sub(sub, texte)
        if js:
            # Dossiers cités dans le JS (chemins construits à l'exécution) : on range tout leur contenu.
            for m in PREFIXE.finditer(texte):
                dossier = os.path.normpath(os.path.join(self.site, m.group(1)))
                if os.path.isdir(dossier) and dossier.startswith(os.path.dirname(os.path.dirname(self.site))):
                    for racine, _, fichiers in os.walk(dossier):
                        for nom in sorted(fichiers):
                            if os.path.splitext(nom)[1].lower() in MIME:
                                self.ajouter(os.path.join(racine, nom))
        return texte


CALE = """<script>(function(){var P;try{P=parent.__tg;}catch(e){}if(!P)return;
if(P.ancre){try{history.replaceState(null,"","#"+P.ancre);}catch(e){}}
try{localStorage.getItem("tg");}catch(e){try{Object.defineProperty(window,"localStorage",{value:P.stockage,configurable:true});}catch(e2){}}
function norm(u){var a=[],s=String(u).split("#")[0].split("?")[0].split("/");for(var i=0;i<s.length;i++){var x=s[i];if(x==="."||x==="")continue;if(x===".."&&a.length&&a[a.length-1]!=="..")a.pop();else a.push(x);}return a.join("/");}
function res(u){if(typeof u!=="string"||/^(blob:|data:|https?:|#|about:)/.test(u))return u;var k=P.carte[norm(u)];return k?P.url(k):u;}
function resSet(v){return String(v).split(",").map(function(p){p=p.trim();var i=p.indexOf(" ");return i<0?res(p):res(p.slice(0,i))+p.slice(i);}).join(", ");}
function patch(C,prop,f){var d=Object.getOwnPropertyDescriptor(C.prototype,prop);if(!d||!d.set)return;Object.defineProperty(C.prototype,prop,{get:d.get,set:function(v){d.set.call(this,f(v));},configurable:true});}
patch(HTMLImageElement,"src",res);patch(HTMLImageElement,"srcset",resSet);patch(HTMLScriptElement,"src",res);patch(HTMLSourceElement,"srcset",resSet);patch(HTMLLinkElement,"href",res);
var sa=Element.prototype.setAttribute;Element.prototype.setAttribute=function(n,v){n=String(n).toLowerCase();if(n==="src"||n==="href"&&this.tagName!=="A")v=res(v);else if(n==="srcset")v=resSet(v);return sa.call(this,n,v);};
})();</script>"""

COQUILLE = """<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow">
<title>__TITRE__</title>
<style>html,body{margin:0;height:100%;background:#1b1e1f}iframe{display:block;width:100%;height:100%;border:0;background:#fff}
#attente{position:fixed;inset:0;display:grid;place-items:center;color:#e5e6e1;font:16px system-ui,sans-serif}</style>
</head>
<body>
<div id="attente">Chargement de la maquette…</div>
<iframe id="vue" title="__TITRE__"></iframe>
<script type="application/json" id="donnees">__DONNEES__</script>
<script>
(function () {
  "use strict";
  var D = JSON.parse(document.getElementById("donnees").textContent);
  var cache = {}, vue = document.getElementById("vue");
  function utf8b64(t) { return btoa(unescape(encodeURIComponent(t))); }
  function texte(i) {
    var k = "t" + i;
    if (!(k in cache)) cache[k] = remplir(D.textes[i][1]);
    return cache[k];
  }
  function url(jeton) {
    if (cache[jeton]) return cache[jeton];
    var p = jeton.split(":"), i = +p[1];
    var u = p[0] === "tg-asset" ? "data:" + D.binaires[i][0] + ";base64," + D.binaires[i][1]
                                : "data:" + D.textes[i][0] + ";charset=utf-8;base64," + utf8b64(texte(i));
    return (cache[jeton] = u);
  }
  function remplir(t) { return t.replace(/tg-(?:asset|file):\\d+/g, url); }
  var memoire = {};
  var stockage = {
    getItem: function (k) { try { var v = localStorage.getItem("tgq:" + k); if (v !== null) return v; } catch (e) {} return Object.prototype.hasOwnProperty.call(memoire, k) ? memoire[k] : null; },
    setItem: function (k, v) { memoire[k] = String(v); try { localStorage.setItem("tgq:" + k, String(v)); } catch (e) {} },
    removeItem: function (k) { delete memoire[k]; try { localStorage.removeItem("tgq:" + k); } catch (e) {} },
    clear: function () { memoire = {}; },
    key: function (i) { return Object.keys(memoire)[i] || null; },
    get length() { return Object.keys(memoire).length; }
  };
  var TG = window.__tg = { carte: D.carte, url: url, stockage: stockage, ancre: "" };
  function normPage(h) { var a = []; h.split("/").forEach(function (x) { if (x === "." || !x) return; if (x === "..") a.pop(); else a.push(x); }); return a.join("/"); }
  function lireHash() { var h = decodeURIComponent(location.hash.slice(1)), i = h.indexOf("~"); return i < 0 ? { page: h, ancre: "" } : { page: h.slice(0, i), ancre: h.slice(i + 1) }; }
  function afficher() {
    var c = lireHash(), page = D.pages[c.page] ? c.page : D.accueil;
    TG.ancre = c.ancre;
    var html = D.pages[page]
      .replace(/<link\\b[^>]*href="(tg-file:\\d+)"[^>]*>/g, function (m, j) { return /stylesheet/.test(m) ? "<style>" + texte(+j.split(":")[1]) + "</style>" : m; })
      .replace(/<script\\b([^>]*?)\\ssrc="(tg-file:\\d+)"([^>]*)><\\/script>/g, function (m, a, j, z) { return "<script" + a + z + ">" + texte(+j.split(":")[1]).replace(/<\\/script/gi, "<\\\\/script") + "<\\/script>"; });
    vue.srcdoc = remplir(html).replace(/<head([^>]*)>/i, "<head$1>" + D.cale);
  }
  function aller(page, ancre) {
    var h = "#" + encodeURIComponent(page + (ancre ? "~" + ancre : ""));
    if (location.hash === h) afficher(); else location.hash = h;
  }
  vue.addEventListener("load", function () {
    var attente = document.getElementById("attente"); if (attente) attente.remove();
    var doc; try { doc = vue.contentDocument; } catch (e) { return; }
    if (!doc) return;
    document.title = doc.title || document.title;
    if (TG.ancre) { var cible = doc.getElementById(TG.ancre); if (cible) cible.scrollIntoView(); }
    doc.addEventListener("click", function (ev) {
      var a = ev.target.closest && ev.target.closest("a[href]");
      if (!a || ev.defaultPrevented) return;
      var href = a.getAttribute("href");
      if (/^(https?:|mailto:|tel:)/i.test(href)) { if (/^https?:/i.test(href)) a.target = "_blank"; return; }
      if (href.charAt(0) === "#") {
        ev.preventDefault();
        var t = href.length > 1 && doc.getElementById(decodeURIComponent(href.slice(1)));
        if (t) t.scrollIntoView({ behavior: "smooth" });
        return;
      }
      ev.preventDefault();
      var i = href.indexOf("#"), page = normPage(i < 0 ? href : href.slice(0, i)), ancre = i < 0 ? "" : href.slice(i + 1);
      if (D.pages[page]) aller(page, ancre);
    });
  });
  window.addEventListener("hashchange", afficher);
  afficher();
})();
</script>
</body>
</html>
"""


def regrouper(site, sortie, titre):
    paquet = Paquet(site)
    pages = {}
    for nom in sorted(os.listdir(paquet.site)):
        if nom.endswith(".html"):
            pages[nom] = paquet.remplacer(lire(os.path.join(paquet.site, nom)), paquet.site)
    donnees = {"accueil": "index.html", "pages": pages, "binaires": paquet.binaires, "textes": paquet.textes,
               "carte": paquet.carte, "cale": CALE}
    brut = json.dumps(donnees, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
    html = COQUILLE.replace("__TITRE__", titre).replace("__DONNEES__", brut)
    os.makedirs(os.path.dirname(os.path.abspath(sortie)), exist_ok=True)
    with open(sortie, "w", encoding="utf-8") as f:
        f.write(html)
    return len(pages), len(paquet.binaires), len(paquet.textes), os.path.getsize(sortie)


if __name__ == "__main__":
    if len(sys.argv) < 4:
        sys.exit(__doc__)
    n_pages, n_img, n_txt, taille = regrouper(sys.argv[1], sys.argv[2], sys.argv[3])
    print("%s : %d pages, %d images, %d fichiers CSS/JS, %.1f Mo" % (sys.argv[2], n_pages, n_img, n_txt, taille / 1048576))
