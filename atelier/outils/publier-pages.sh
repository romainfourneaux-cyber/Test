#!/bin/bash
# Publie le dossier jeu/ sur la branche gh-pages (racine du site GitHub Pages), sans toucher aux autres branches.
# Usage : bash atelier/outils/publier-pages.sh            (construit la branche et la pousse)
#         bash atelier/outils/publier-pages.sh --sans-push (construit seulement, pour vérifier)
# Prérequis : l'arbre de travail est propre et jeu/sw.js a été régénéré (node atelier/outils/generer-sw.js).
set -e
cd "$(dirname "$0")/../.."
if [ "$1" != "--sans-push" ] && [ -n "$(git status --porcelain)" ]; then echo "Arbre de travail non propre : commite d'abord (la branche est construite depuis HEAD)." >&2; exit 1; fi
VERSION=$(tr -d '[:space:]' < jeu/VERSION.txt)
SOURCE=$(git rev-parse --short HEAD)
# 1. Une branche temporaire qui ne contient que jeu/ à la racine.
git branch -D pages-tmp 2>/dev/null || true
git subtree split --prefix jeu -b pages-tmp >/dev/null 2>&1
# 2. Un arbre de travail séparé pour y ajouter .nojekyll (GitHub Pages ne doit rien filtrer) et un repère de version.
DOSSIER=$(mktemp -d)
git worktree add "$DOSSIER" pages-tmp >/dev/null 2>&1
( cd "$DOSSIER" && touch .nojekyll && printf '%s (%s)\n' "$VERSION" "$SOURCE" > PAGES-VERSION.txt \
  && git add .nojekyll PAGES-VERSION.txt && git commit -q -m "Site du jeu, version $VERSION (depuis $SOURCE)" )
git worktree remove --force "$DOSSIER"
# 3. La branche gh-pages prend ce contenu (historique réécrit à chaque publication : c'est un site, pas un journal).
git branch -f gh-pages pages-tmp
git branch -D pages-tmp >/dev/null
echo "Branche gh-pages prête : version $VERSION, $(git ls-tree -r --name-only gh-pages | wc -l) fichiers, index.html à la racine : $(git ls-tree gh-pages --name-only | grep -c '^index.html$')"
if [ "$1" != "--sans-push" ]; then
  git push -f origin gh-pages
  echo "Poussée. Adresse du site une fois Pages activé : https://romainfourneaux-cyber.github.io/Test/"
fi
