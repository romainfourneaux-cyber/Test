# Audit des questions de langue, d'anglais et de méthode (28/10/2026)

Demande de Romain du 25/10/2026 : retirer les questions bizarres et, quand le cours déposé est trop mince, poser une question de thème. Grille : atelier/relecture/grille-audit-questions.md. Détail question par question : atelier/relecture/audit-questions-langue-anglais-methodes.json (71 entrées : tout ce qui n'est pas gardé tel quel, plus sept « garder » signalés avec une raison, sans retouche). Appliqué le 28/10/2026 dans atelier/contenu/ (détail dans docs/JOURNAL.md) ; en plus des verdicts, methode-instruments-q54 a été ajoutée (question de thème sur la fiole jaugée, Wikipédia) pour que la fiche f7, une seule phrase dans la fiche déposée, garde cinq questions après le retrait du doublon q48 : le cours compte 46 questions dont 2 de thème. La source Larousse de langue-conj10-q19 est l'entrée /18262 (définition complète), l'adresse /18283 citée plus bas n'en montre qu'un aperçu tronqué.

## Résumé

695 questions relues dans onze cours : trois cours de langue (Griffon de cuivre, cours 10 à 12), trois séquences d'anglais (livret 1) et cinq fiches méthode.

| Verdict | Nombre |
|---|---|
| garder | 631 (dont 7 signalés sans retouche) |
| réécrire depuis la fiche | 8 |
| remplacer par une question de thème | 3 |
| supprimer | 53 |

Après application : 642 questions, dont 3 de thème (moins de 1 %). Aucun cours n'approche la moitié : pas d'entrée « cours-mince » dans le fichier JSON.

Les questions de ces trois matières sont, dans l'ensemble, de vraies questions de cours : les modes du verbe, les sens d'être et d'avoir, les homophones, was et were, le prétérit, les possessifs, les étapes d'un graphique ou d'une frise. Les défauts trouvés se concentrent sur trois points :

1. **Les quasi-doublons** : 43 des 53 suppressions. En anglais, les questions q109 à q119 de la séquence 1 (et quelques-unes des séquences 2 et 3) sont une série de vrai/faux ajoutés qui redisent la règle d'une question voisine de la même fiche (« avec they, le tag est weren't they ? » à côté de « You were at the stadium, ___ ? »). Dans les fiches méthode, l'ordre des étapes d'une frise était posé six fois, la lecture au ménisque quatre fois, la règle « mm = 2 × °C » huit fois.
2. **Les consignes de présentation prises pour du savoir** (fiche « réaliser un graphique » surtout) : titre au crayon à papier souligné à la règle, en gras à l'ordinateur, pointillés au crayon, axes à la règle, « le titre est facile à repérer dans la consigne » : dix questions, retirées ou réécrites.
3. **Les détails du livret** : le diagramme de Vichy 1971-2000, le trait de 5 mm centré sur le mois, les bâtons bleu clair, la recette avec « eau de fleur d'oranger : 1 cc », les photos « présentées dans le livret », les cinq thèmes du programme du Griffon de cuivre : huit questions.

Deux faits avaient été écrits sans source dans la fiche frise (le sens de la flèche de l'axe, le décalage des traits de dates proches) : l'un devient une question de thème sourcée, l'autre est réécrit depuis l'étape « définir une échelle ». Deux formes douteuses en anglais sont réécrites : « Will I close the window ? » donnée comme équivalente de Shall I, et un QCM à quatre transcriptions phonétiques complètes.

## Bilan par cours

| Cours | Avant | Gardées | Signalées | Réécrites | Thème | Supprimées | Après | Part thème | Mince ? |
|---|---|---|---|---|---|---|---|---|---|
| langue-conj10 – Les modes du verbe | 40 | 38 | 0 | 0 | 1 | 1 | 39 | 3 % | fiche f5 (page d'introduction) |
| langue-conj11 – Être et avoir | 32 | 32 | 1 | 0 | 0 | 0 | 32 | 0 % | non (tableaux vides, fiches de sens pleines) |
| langue-conj12 – Les homophones grammaticaux | 40 | 40 | 1 | 0 | 0 | 0 | 40 | 0 % | non |
| methode-frise – Savoir-faire : la frise chronologique | 27 | 17 | 1 | 1 | 1 | 8 | 19 | 5 % | oui (fiche de quatre lignes) |
| methode-graphique – Savoir-faire : réaliser un graphique | 46 | 32 | 0 | 2 | 0 | 12 | 34 | 0 % | non |
| methode-instruments – Savoir-faire : les instruments de mesure | 53 | 43 | 2 | 1 | 1 | 8 | 45 | 2 % | fiche f8 (liste de matériel) |
| methode-ombrothermique – Savoir-faire : le diagramme ombrothermique | 38 | 30 | 1 | 1 | 0 | 7 | 31 | 0 % | non |
| methode-tableau – Savoir-faire : le tableau à double entrée | 23 | 20 | 0 | 1 | 0 | 2 | 21 | 0 % | non |
| anglais-seq01 – Séquence 1 : was et were | 130 | 121 | 0 | 0 | 0 | 9 | 121 | 0 % | non |
| anglais-seq02 – Séquence 2 : le prétérit simple, les verbes irréguliers et les possessifs | 125 | 120 | 0 | 0 | 0 | 5 | 120 | 0 % | non |
| anglais-seq03 – Séquence 3 : dire ce qu'on pense, parler de l'avenir, les dates | 141 | 138 | 1 | 2 | 0 | 1 | 140 | 0 % | non |
| Total | 695 | 631 | 7 | 8 | 3 | 53 | 642 | 0,5 % | |

« Gardées » compte toutes les questions gardées ; « Signalées » en isole celles qui ont une entrée dans le JSON avec une raison (vérification faite, aucune retouche à apporter).

## Cours et fiches minces

- **methode-frise** : la fiche déposée tient en quatre lignes (tracer l'axe, définir une échelle avec deux exemples, placer les événements avec date et nom ou les périodes entre deux dates, ne pas oublier le titre). Les 27 questions en étaient des dérivations, souvent répétées : huit doublons partent. Deux faits ajoutés sans source : la flèche de l'axe du temps (q17, question de thème sourcée sur Wikipédia) et le décalage des traits de dates proches (q24, réécrite en « pourquoi garde-t-on la même échelle »). Besoin : 1 question de thème sur 19, loin de la moitié ; pas d'entrée « cours-mince ».
- **methode-instruments, fiche f8** (le matériel des TP) : une liste de matériel et deux consignes d'organisation (toujours un adulte, les photos du livret). La consigne de sécurité reste (q24) ; les photos du livret deviennent une question de thème sur le thermomètre (q25) et un « comment » sur le verre doseur (q27). 1 sur 45.
- **langue-conj10, fiche f5** (pourquoi apprendre la grammaire) : une page d'introduction du Griffon de cuivre, utile pour les mots analyse grammaticale, analyse logique et orthographe d'usage, trop mince pour « d'où viennent les fautes » et « les cinq thèmes du programme ». Une question de thème (q19, « que veut dire conjuguer un verbe », Larousse) et une suppression. 1 sur 39.
- **langue-conj11** : les tableaux de conjugaison d'être et d'avoir sont vides dans le cours déposé (dit dans nonCouvert), mais les quatre fiches sur les sens d'être et d'avoir ont de quoi faire : rien à ajouter.
- **anglais** : le livret 1 lui-même n'est pas déposé, seulement ses corrigés et les exercices supplémentaires. Les règles des fiches g sont reconstituées à partir des corrigés et tiennent largement ; les fiches de vocabulaire et de phrases n'ont qu'une question chacune, c'est voulu et le validateur ne leur demande ni vrai/faux ni trois questions.

Aucun cours de la matière n'a besoin de plus de la moitié de questions de thème.

## Anti-spoil

- **Langue, devoir FR-CUIVRE-2A** (énoncé seul déposé) : il demande d'expliquer des terminaisons (imparfait, infinitif), de définir le COI, de construire des phrases avec des adjectifs et pronoms, de distinguer lieu et temps, de remplir un tableau infinitif / groupe / temps / personne (futur simple, passé simple, plus-que-parfait, imparfait, futur antérieur), d'analyser des mots et de classer sens propre et sens figuré. Aucune question du jeu ne reprend une phrase du texte (Le Grand Meaulnes), un verbe ou une forme du tableau. Les questions de langue-conj10-f4 (temps simples et composés : « elles avaient dessiné », « ils auront chanté ») portent sur la même compétence que le tableau du devoir, parce que c'est la leçon du cours 10 ; elles sont gardées. **À signaler à Romain** : s'il préfère, cette fiche peut être mise en sommeil jusqu'au devoir.
- **Anglais, devoirs 1 et 2** (énoncés seuls déposés) : formes négatives, questions avec un pronom interrogatif, tags et réponses courtes, présent simple ou progressif, possessifs, prétérit, traductions. Aucune phrase des deux devoirs n'est reprise (ni « Adrian is exhausted », ni « This is John's car », ni « He broke the mirror yesterday », ni « They were waiting for you ») ; le mot exhausted figure seulement comme mot de vocabulaire (anglais-seq01-v2), ce qui n'est pas une tournure. Les trois pistes de réécriture et les trois questions de thème ne touchent à aucun point du devoir.
- Les pistes de thème évitent la valeur 0 °C de la glace qui fond (demandée par le devoir 1 de physique) : la question sur le thermomètre dit seulement qu'il mesure une température en degrés Celsius.

## Garde-fous vérifiés

Après application, chaque fiche de langue et de méthode garde au moins quatre questions (methode-instruments-f7 en garde quatre, toutes les autres cinq ou plus), au moins un vrai/faux et au moins une question en « pourquoi » ou « comment » (vérifié fiche par fiche, en comptant les réécritures : methode-graphique-q6 et q29, methode-frise-q24, methode-instruments-q27, et les pistes de thème methode-frise-q17 et methode-instruments-q25). En anglais, chaque fiche de structure (g) garde au moins un vrai/faux. Les identifiants sont conservés pour toute question réécrite ou remplacée (même fiche, même famille de type) ; aucune fiche ne bouge.

## Sources envisagées pour les questions de thème

Wikipédia (« Frise chronologique », « Thermomètre »), Larousse (« conjuguer »). Les trois adresses répondent et les faits visés y figurent (événements placés sur la flèche du temps le long d'une échelle graduée ; thermomètre et degrés Celsius ; conjuguer : énumérer les formes d'un verbe selon les modes, les temps et les personnes). Chaque fait reste à relire sur la page citée au moment de la réécriture. Les thèmes sont écrits comme le titre du cours : « Les modes du verbe (Griffon de cuivre) », « Savoir-faire : la frise chronologique », « Savoir-faire : les instruments de mesure ».

## Contrôles au moment de l'audit

node atelier/outils/valider.js : 0 erreur, 5 alertes (les « [5] source absente » connues des PDF de géographie). node atelier/outils/tests.js : 347 réussis, 0 en échec. Aucun fichier de contenu, de jeu ou de documentation n'a été modifié par l'audit.
