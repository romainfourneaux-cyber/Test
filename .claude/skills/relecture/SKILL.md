---
name: relecture
description: Prépare la fiche de relecture de la semaine (une ligne par fiche ajoutée ou modifiée, avec sa page) et traite les signalements de l'élève trouvés dans la dernière sauvegarde de DEPOT/sauvegardes/. À utiliser quand Romain veut vérifier le contenu du jeu.
---

# Relecture de la semaine (20 minutes)

## 1. Rassembler

- Les fiches et les bonus créés ou modifiés depuis la date inscrite dans atelier/relectures/derniere.txt (tout, s'il s'agit de la première relecture).
- La sauvegarde la plus récente de DEPOT/sauvegardes/ : signalements et notions les plus ratées. Ne modifie jamais ce fichier.

## 2. Produire atelier/relectures/relecture-AAAA-MM-JJ.html

Une page HTML imprimable en A4, lisible sans le jeu :
- En-tête : date, nombre de lignes, temps estimé.
- Tableau des fiches, lignes numérotées : matière, cours, notion, l'essentiel en une phrase, la réponse type d'une question, la page du livret, une case « OK » et une case « à corriger ».
- Les bonus, présentés de la même façon, avec leur source.
- Les signalements : la question, la réponse attendue, la remarque de l'élève, et ton avis (il a raison, ou la fiche tient, page à l'appui).
- Pour information, les cinq notions les plus ratées.

Vise une trentaine de lignes. S'il y en a davantage, garde d'abord les signalements et les fiches des cours ouverts récemment ; le reste passe à la semaine suivante.

Dis à Romain où se trouve le fichier et qu'il s'ouvre par double-clic.

## 3. Après la relecture

Romain te donne les numéros de lignes à corriger. Tu corriges, tu lances le validateur, tu notes au journal, tu incrémentes la version et tu mets à jour atelier/relectures/derniere.txt. Si une correction demandée contredit le livret, montre-lui la page avant de modifier.
