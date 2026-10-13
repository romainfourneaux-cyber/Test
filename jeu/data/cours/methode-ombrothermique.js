// Savoir-faire : le diagramme ombrothermique
// Généré par atelier/outils/compiler-cours.js depuis atelier/contenu/methode-ombrothermique.js. Ne pas modifier à la main.
JEU.enregistrer("cours", {
 "id": "methode-ombrothermique",
 "matiere": "svt",
 "titre": "Savoir-faire : le diagramme ombrothermique",
 "fiches": [
  {
   "id": "methode-ombrothermique-f1",
   "notion": "Ce que montre un diagramme ombrothermique",
   "titre": "Pluies et températures d'un lieu",
   "texte": "Un diagramme ombrothermique montre le climat d'un lieu mois par mois : les précipitations et les températures. Ce sont des moyennes, calculées sur trente ans.",
   "pointsCles": [
    "Un lieu, douze mois",
    "Précipitations et températures",
    "Moyennes sur 30 ans"
   ],
   "dates": [],
   "lieux": [],
   "personnages": [],
   "vocabulaire": [
    {
     "mot": "précipitations",
     "def": "l'eau qui tombe du ciel : pluie, neige, grêle"
    },
    {
     "mot": "moyenne",
     "def": "la valeur obtenue en partageant le total de plusieurs mesures entre elles"
    }
   ],
   "schema": "methode-ombrothermique-s1",
   "prerequis": [],
   "source": {
    "fichier": "methodes/Fiche methode - Diagramme ombrothermique.pdf",
    "page": 1
   }
  },
  {
   "id": "methode-ombrothermique-f2",
   "notion": "Bâtons et courbe",
   "titre": "Un graphique mixte",
   "texte": "Les précipitations sont dessinées en bâtons : chaque bâton est le cumul moyen d'un mois, en millimètres. Les températures forment une courbe : un point par mois, en degrés Celsius, reliés par un trait. Il peut y avoir deux courbes, l'une des températures basses, l'autre des hautes.",
   "pointsCles": [
    "Bâtons = précipitations (mm)",
    "Courbe = températures (°C)",
    "Bâtons + courbe = graphique mixte"
   ],
   "dates": [],
   "lieux": [],
   "personnages": [],
   "vocabulaire": [
    {
     "mot": "cumul",
     "def": "la quantité totale accumulée, par exemple toute la pluie tombée en un mois"
    },
    {
     "mot": "graphique mixte",
     "def": "un graphique qui mélange deux façons de représenter : bâtons et courbe"
    }
   ],
   "schema": "methode-ombrothermique-s1",
   "prerequis": [
    "methode-ombrothermique-f1"
   ],
   "source": {
    "fichier": "methodes/Fiche methode - Diagramme ombrothermique.pdf",
    "page": 1
   }
  },
  {
   "id": "methode-ombrothermique-f3",
   "notion": "Les trois axes",
   "titre": "Un axe horizontal, deux axes verticaux",
   "texte": "L'axe horizontal porte les mois, de janvier à décembre ; il sert aux deux représentations. À gauche, un axe vertical rouge donne les températures en °C. À droite, un axe vertical bleu donne les précipitations en mm.",
   "pointsCles": [
    "En bas : les mois",
    "À gauche, en rouge : °C",
    "À droite, en bleu : mm"
   ],
   "dates": [],
   "lieux": [],
   "personnages": [],
   "vocabulaire": [
    {
     "mot": "abscisse",
     "def": "l'axe horizontal d'un graphique"
    },
    {
     "mot": "ordonnée",
     "def": "un axe vertical d'un graphique"
    }
   ],
   "schema": "methode-ombrothermique-s1",
   "prerequis": [
    "methode-ombrothermique-f2"
   ],
   "source": {
    "fichier": "methodes/Fiche methode - Diagramme ombrothermique.pdf",
    "page": 1
   }
  },
  {
   "id": "methode-ombrothermique-f4",
   "notion": "La règle des graduations",
   "titre": "Précipitations = 2 × températures",
   "texte": "Pour comparer les climats entre eux, on gradue les deux axes verticaux avec une règle : la valeur la plus haute des précipitations vaut le double de la température la plus haute. Si l'axe des pluies monte à 100 mm, celui des températures monte à 50 °C.",
   "pointsCles": [
    "Maximum en mm = 2 × maximum en °C",
    "Exemple : 100 mm en face de 50 °C"
   ],
   "dates": [],
   "lieux": [],
   "personnages": [],
   "vocabulaire": [
    {
     "mot": "graduation",
     "def": "un repère chiffré placé régulièrement le long d'un axe"
    }
   ],
   "schema": "methode-ombrothermique-s1",
   "prerequis": [
    "methode-ombrothermique-f3"
   ],
   "source": {
    "fichier": "methodes/Fiche methode - Diagramme ombrothermique.pdf",
    "page": 1
   }
  },
  {
   "id": "methode-ombrothermique-f5",
   "notion": "Construire le diagramme",
   "titre": "Les étapes de construction",
   "texte": "On trace l'axe des mois avec le zéro. On repère le plus fort cumul de pluie et on choisit un maximum un peu au-dessus. On en déduit le maximum des températures. On dessine les bâtons en bleu clair, puis on place une croix par mois pour la température, on relie, et on écrit le titre.",
   "pointsCles": [
    "1. Axe des mois et zéro",
    "2. Maximums des deux axes",
    "3. Bâtons bleu clair",
    "4. Croix des températures reliées",
    "5. Titre : lieu et période"
   ],
   "dates": [],
   "lieux": [],
   "personnages": [],
   "vocabulaire": [],
   "schema": "methode-ombrothermique-s1",
   "prerequis": [
    "methode-ombrothermique-f4"
   ],
   "source": {
    "fichier": "methodes/Fiche methode - Diagramme ombrothermique.pdf",
    "page": 2
   }
  }
 ],
 "schemas": [
  {
   "id": "methode-ombrothermique-s1",
   "legende": "Exemple redessiné avec des valeurs inventées : bâtons bleus (mm, axe de droite), courbe rouge (°C, axe de gauche).",
   "svg": "<svg viewBox='0 0 480 280' xmlns='http://www.w3.org/2000/svg' font-family='Georgia,serif' font-size='11' fill='#2e2419'><rect x='64' y='122' width='22' height='108' fill='#7fb0d8' stroke='#2f5a8a'/><rect x='94' y='140' width='22' height='90' fill='#7fb0d8' stroke='#2f5a8a'/><rect x='124' y='149' width='22' height='81' fill='#7fb0d8' stroke='#2f5a8a'/><rect x='154' y='131' width='22' height='99.00000000000001' fill='#7fb0d8' stroke='#2f5a8a'/><rect x='184' y='104.00000000000001' width='22' height='125.99999999999999' fill='#7fb0d8' stroke='#2f5a8a'/><rect x='214' y='158' width='22' height='72' fill='#7fb0d8' stroke='#2f5a8a'/><rect x='244' y='194' width='22' height='36' fill='#7fb0d8' stroke='#2f5a8a'/><rect x='274' y='185' width='22' height='45' fill='#7fb0d8' stroke='#2f5a8a'/><rect x='304' y='140' width='22' height='90' fill='#7fb0d8' stroke='#2f5a8a'/><rect x='334' y='86' width='22' height='144' fill='#7fb0d8' stroke='#2f5a8a'/><rect x='364' y='68' width='22' height='162' fill='#7fb0d8' stroke='#2f5a8a'/><rect x='394' y='95' width='22' height='135' fill='#7fb0d8' stroke='#2f5a8a'/><polyline points='75,219.2 105,215.6 135,201.2 165,190.4 195,176.0 225,161.6 255,150.8 285,154.4 315,168.8 345,186.8 375,204.8 405,215.6' fill='none' stroke='#9a4a32' stroke-width='2.5'/><path d='M71 215.2l8 8M71 223.2l8 -8' stroke='#9a4a32' stroke-width='1.5'/><path d='M101 211.6l8 8M101 219.6l8 -8' stroke='#9a4a32' stroke-width='1.5'/><path d='M131 197.2l8 8M131 205.2l8 -8' stroke='#9a4a32' stroke-width='1.5'/><path d='M161 186.4l8 8M161 194.4l8 -8' stroke='#9a4a32' stroke-width='1.5'/><path d='M191 172l8 8M191 180l8 -8' stroke='#9a4a32' stroke-width='1.5'/><path d='M221 157.6l8 8M221 165.6l8 -8' stroke='#9a4a32' stroke-width='1.5'/><path d='M251 146.8l8 8M251 154.8l8 -8' stroke='#9a4a32' stroke-width='1.5'/><path d='M281 150.4l8 8M281 158.4l8 -8' stroke='#9a4a32' stroke-width='1.5'/><path d='M311 164.8l8 8M311 172.8l8 -8' stroke='#9a4a32' stroke-width='1.5'/><path d='M341 182.8l8 8M341 190.8l8 -8' stroke='#9a4a32' stroke-width='1.5'/><path d='M371 200.8l8 8M371 208.8l8 -8' stroke='#9a4a32' stroke-width='1.5'/><path d='M401 211.6l8 8M401 219.6l8 -8' stroke='#9a4a32' stroke-width='1.5'/><line x1='60' y1='230' x2='420' y2='230' stroke='#2e2419' stroke-width='2'/><line x1='60' y1='230' x2='60' y2='40' stroke='#9a4a32' stroke-width='2'/><line x1='420' y1='230' x2='420' y2='40' stroke='#2f5a8a' stroke-width='2'/><text x='54' y='234' text-anchor='end' fill='#9a4a32'>0</text><text x='426' y='234' fill='#2f5a8a'>0</text><text x='54' y='198' text-anchor='end' fill='#9a4a32'>10</text><text x='426' y='198' fill='#2f5a8a'>20</text><text x='54' y='162' text-anchor='end' fill='#9a4a32'>20</text><text x='426' y='162' fill='#2f5a8a'>40</text><text x='54' y='126' text-anchor='end' fill='#9a4a32'>30</text><text x='426' y='126' fill='#2f5a8a'>60</text><text x='54' y='90' text-anchor='end' fill='#9a4a32'>40</text><text x='426' y='90' fill='#2f5a8a'>80</text><text x='54' y='54' text-anchor='end' fill='#9a4a32'>50</text><text x='426' y='54' fill='#2f5a8a'>100</text><text x='75' y='244' text-anchor='middle'>J</text><text x='105' y='244' text-anchor='middle'>F</text><text x='135' y='244' text-anchor='middle'>M</text><text x='165' y='244' text-anchor='middle'>A</text><text x='195' y='244' text-anchor='middle'>M</text><text x='225' y='244' text-anchor='middle'>J</text><text x='255' y='244' text-anchor='middle'>J</text><text x='285' y='244' text-anchor='middle'>A</text><text x='315' y='244' text-anchor='middle'>S</text><text x='345' y='244' text-anchor='middle'>O</text><text x='375' y='244' text-anchor='middle'>N</text><text x='405' y='244' text-anchor='middle'>D</text><text x='20' y='30' fill='#9a4a32'>°C</text><text x='424' y='30' fill='#2f5a8a'>mm</text><text x='240' y='270' text-anchor='middle' font-weight='bold'>Diagramme ombrothermique d'une ville imaginaire</text></svg>"
  }
 ],
 "questions": [
  {
   "id": "methode-ombrothermique-q1",
   "fiche": "methode-ombrothermique-f1",
   "type": "qcm",
   "niveau": 1,
   "enonce": "Que représente un diagramme ombrothermique ?",
   "choix": [
    "Les précipitations et les températures moyennes de chaque mois en un lieu",
    "Le nombre d'habitants d'une ville",
    "Les heures de lever du soleil",
    "La vitesse du vent chaque jour"
   ],
   "explication": "Il montre, pour un lieu, les pluies et les températures moyennes de chaque mois.",
   "source": {
    "fichier": "methodes/Fiche methode - Diagramme ombrothermique.pdf",
    "page": 1
   },
   "r": "=8AEQRkAPhwEJxhISZADawRSLoxAJsiTFBVSOxxAIcwF+0BGFZAFbsxGToh6uXBWIpxTVMQBSNzFVZxGeAgGOYQAzQkBc6OHfYUFM4TZ",
   "poids": 1
  },
  {
   "id": "methode-ombrothermique-q2",
   "fiche": "methode-ombrothermique-f1",
   "type": "vrai_faux",
   "niveau": 1,
   "enonce": "Les valeurs d'un diagramme ombrothermique sont celles d'une seule année.",
   "corrections": [
    "Faux : ce sont des moyennes calculées sur trente ans.",
    "Faux : ce sont les valeurs d'un seul jour.",
    "Faux : ce sont des valeurs inventées."
   ],
   "explication": "On utilise des moyennes sur 30 ans. Une seule année pourrait être exceptionnelle.",
   "source": {
    "fichier": "methodes/Fiche methode - Diagramme ombrothermique.pdf",
    "page": 1
   },
   "r": "MsEQcwRCjhUEbhEHbYEFcEwZBABz22BHNMwELMmXAs1QLYRCLkUAiYRVRshHa4kCRgUeN0BQMhSTcR0Bd4iBWAwBDYQDN5VDwEEBTdBTGcAFfAFP",
   "poids": 1
  },
  {
   "id": "methode-ombrothermique-q3",
   "fiche": "methode-ombrothermique-f1",
   "type": "qcm",
   "niveau": 2,
   "enonce": "Pourquoi utilise-t-on des moyennes sur trente ans plutôt qu'une seule année ?",
   "choix": [
    "Pour décrire le climat habituel du lieu, pas une année particulière",
    "Parce qu'on ne mesure la pluie qu'une fois tous les trente ans",
    "Pour que le diagramme soit plus coloré",
    "Parce que les thermomètres sont lents"
   ],
   "explication": "Une année peut être très sèche ou très chaude. La moyenne sur 30 ans montre le climat habituel.",
   "source": {
    "fichier": "methodes/Fiche methode - Diagramme ombrothermique.pdf",
    "page": 1
   },
   "r": "NNAFBHrLeAgBcUwGP8hUNou7LsFTOpACTkUAmIQVJBAFAIwTHwwYBBAQZdQDH4QSGYyHckgFRxgAPdhGq8lBc6uCPRxEGISZ",
   "poids": 1
  },
  {
   "id": "methode-ombrothermique-q4",
   "fiche": "methode-ombrothermique-f2",
   "type": "qcm",
   "niveau": 1,
   "enonce": "Sur un diagramme ombrothermique, comment sont représentées les précipitations ?",
   "choix": [
    "Par des bâtons",
    "Par une courbe",
    "Par des camemberts",
    "Par des flèches"
   ],
   "explication": "Les précipitations sont en bâtons, un par mois. Les températures forment la courbe.",
   "source": {
    "fichier": "methodes/Fiche methode - Diagramme ombrothermique.pdf",
    "page": 1
   },
   "r": "=sUHB0BHh7+BV41CLYEFIISZ",
   "poids": 1
  },
  {
   "id": "methode-ombrothermique-q5",
   "fiche": "methode-ombrothermique-f2",
   "type": "vrai_faux",
   "niveau": 1,
   "enonce": "Les températures sont représentées par des points reliés par un trait.",
   "corrections": [],
   "explication": "Oui : un point par mois, puis on relie les points pour obtenir la courbe.",
   "source": {
    "fichier": "methodes/Fiche methode - Diagramme ombrothermique.pdf",
    "page": 1
   },
   "r": "==ASBJgGIw1ScgyGBYAEDsRAMAFRmg1FBdBTGcAFfAFP",
   "poids": 1
  },
  {
   "id": "methode-ombrothermique-q6",
   "fiche": "methode-ombrothermique-f2",
   "type": "vrai_faux",
   "niveau": 2,
   "enonce": "Un diagramme ombrothermique a toujours une seule courbe de température.",
   "corrections": [
    "Faux : il peut y en avoir deux, celle des températures basses et celle des hautes.",
    "Faux : il n'a jamais de courbe.",
    "Faux : il a une courbe par jour."
   ],
   "explication": "On peut tracer deux courbes : les moyennes des températures les plus basses et des plus hautes de la journée.",
   "source": {
    "fichier": "methodes/Fiche methode - Diagramme ombrothermique.pdf",
    "page": 1
   },
   "r": "=QBUpFAERAAEB4EHXwwYIlQWI1wTSMQSBISAGQwFRpxCdcAHi8Fz231AKIhRacxISBRCZQhCONkCdYSSFdERBkxBGdwFntQVRAAFZ40AbgUeN0BQMhSTcR0Bd4iBWAwBDYQDN5VDwEEBTdBTGcAFfAFP",
   "poids": 1
  },
  {
   "id": "methode-ombrothermique-q7",
   "fiche": "methode-ombrothermique-f2",
   "type": "qcm",
   "niveau": 2,
   "enonce": "Pourquoi dit-on que le diagramme ombrothermique est un graphique mixte ?",
   "choix": [
    "Parce qu'il mélange des bâtons et une courbe",
    "Parce qu'il est dessiné à deux",
    "Parce qu'il mélange deux villes",
    "Parce qu'il a deux titres"
   ],
   "explication": "Mixte veut dire mélangé. Il combine un diagramme en bâtons et un graphique linéaire.",
   "source": {
    "fichier": "methodes/Fiche methode - Diagramme ombrothermique.pdf",
    "page": 1
   },
   "r": "ExAE1cgGGUFFHsxTG0wYetgWZxMrEYkGXMiUQIwGQUwxs+BSvQkQAxlTKUAFIISZ",
   "poids": 1
  },
  {
   "id": "methode-ombrothermique-q8",
   "fiche": "methode-ombrothermique-f3",
   "type": "qcm",
   "niveau": 1,
   "enonce": "Que porte l'axe horizontal d'un diagramme ombrothermique ?",
   "choix": [
    "Les mois, de janvier à décembre",
    "Les températures en °C",
    "Les précipitations en mm",
    "Les années de 1 à 30"
   ],
   "explication": "L'axe horizontal donne les douze mois. Il est commun aux bâtons et à la courbe.",
   "source": {
    "fichier": "methodes/Fiche methode - Diagramme ombrothermique.pdf",
    "page": 1
   },
   "r": "=okJfdAWI1gxlKQSSToUHAAHHcwDFIVDn0QSGRUACYUFM4TZ",
   "poids": 1
  },
  {
   "id": "methode-ombrothermique-q9",
   "fiche": "methode-ombrothermique-f3",
   "type": "vrai_faux",
   "niveau": 1,
   "enonce": "Sur le diagramme, l'axe des précipitations est à gauche, en rouge.",
   "corrections": [
    "Faux : à gauche, en rouge, ce sont les températures ; les précipitations sont à droite, en bleu.",
    "Faux : les précipitations sont sur l'axe horizontal.",
    "Faux : il n'y a pas d'axe pour les précipitations."
   ],
   "explication": "Rouge à gauche pour la chaleur en °C. Bleu à droite pour l'eau en mm.",
   "indice": "Rouge comme la chaleur, bleu comme l'eau.",
   "source": {
    "fichier": "methodes/Fiche methode - Diagramme ombrothermique.pdf",
    "page": 1
   },
   "r": "==AGX9FHLMAEI1CSFlBSaYQCU0gUnHbVRshHa4EHccgKZRQQE5hBF8sqAcjUGAQGRJlTcchG2kFBHRYrfswAdIFNXkRRB8hBd80FLMWAAIFWB0hRIwgUrdRHGAAEO40zxiUeN0BQMhSTcR0Bd4iBWAwBDYQDN5VDwEEBTdBTGcAFfAFP",
   "poids": 1
  },
  {
   "id": "methode-ombrothermique-q10",
   "fiche": "methode-ombrothermique-f3",
   "type": "association",
   "niveau": 2,
   "enonce": "Relie chaque axe à ce qu'il indique.",
   "gauche": [
    "Axe horizontal",
    "Axe vertical de gauche",
    "Axe vertical de droite"
   ],
   "droite": [
    "Les précipitations en mm",
    "Les mois de l'année",
    "Les températures en °C"
   ],
   "explication": "En bas les mois, à gauche les °C, à droite les mm.",
   "source": {
    "fichier": "methodes/Fiche methode - Diagramme ombrothermique.pdf",
    "page": 1
   },
   "r": "==AKsklQdlCRe8RSEYnQyclSZlCH",
   "poids": 1
  },
  {
   "id": "methode-ombrothermique-q11",
   "fiche": "methode-ombrothermique-f4",
   "type": "qcm",
   "niveau": 2,
   "enonce": "L'axe des précipitations monte jusqu'à 160 mm. Jusqu'où doit monter l'axe des températures ?",
   "choix": [
    "80 °C",
    "160 °C",
    "320 °C",
    "40 °C"
   ],
   "explication": "Le maximum en mm vaut le double du maximum en °C. 160 divisé par 2 donne 80.",
   "indice": "Les millimètres valent le double des degrés.",
   "source": {
    "fichier": "methodes/Fiche methode - Diagramme ombrothermique.pdf",
    "page": 1
   },
   "r": "=8QLfTqRZpUZ",
   "poids": 1
  },
  {
   "id": "methode-ombrothermique-q12",
   "fiche": "methode-ombrothermique-f4",
   "type": "vrai_faux",
   "niveau": 1,
   "enonce": "La valeur maximale des précipitations est égale au double de la température maximale.",
   "corrections": [],
   "explication": "C'est la règle des graduations : par exemple 100 mm en face de 50 °C.",
   "source": {
    "fichier": "methodes/Fiche methode - Diagramme ombrothermique.pdf",
    "page": 1
   },
   "r": "==ASBJgGIw1ScgyGBYAEDsRAMAFRmg1FBdBTGcAFfAFP",
   "poids": 1
  },
  {
   "id": "methode-ombrothermique-q13",
   "fiche": "methode-ombrothermique-f4",
   "type": "qcm",
   "niveau": 2,
   "enonce": "Pourquoi respecter la règle « maximum des pluies = 2 × maximum des températures » ?",
   "choix": [
    "Pour pouvoir comparer les climats de lieux différents",
    "Pour que le diagramme tienne sur une page",
    "Pour que les bâtons soient tous de la même taille",
    "Parce qu'il pleut deux fois par mois"
   ],
   "explication": "Avec la même règle partout, deux diagrammes se comparent d'un coup d'œil.",
   "source": {
    "fichier": "methodes/Fiche methode - Diagramme ombrothermique.pdf",
    "page": 1
   },
   "r": "=EmXRsFScYcpA8wGjIVDQABGF4kCWgEMZRAWEJADGVBDecGAQcBFBQQAMIlGqI0EAJkHPRxEGISZ",
   "poids": 1
  },
  {
   "id": "methode-ombrothermique-q14",
   "fiche": "methode-ombrothermique-f4",
   "type": "qcm",
   "niveau": 2,
   "enonce": "L'axe des températures monte jusqu'à 30 °C. Jusqu'où doit monter l'axe des précipitations ?",
   "choix": [
    "60 mm",
    "30 mm",
    "15 mm",
    "90 mm"
   ],
   "explication": "On double la valeur des températures. 2 × 30 donne 60 mm.",
   "source": {
    "fichier": "methodes/Fiche methode - Diagramme ombrothermique.pdf",
    "page": 1
   },
   "r": "==ATCsgRZRUZ",
   "poids": 1
  },
  {
   "id": "methode-ombrothermique-q15",
   "fiche": "methode-ombrothermique-f5",
   "type": "ordre",
   "niveau": 2,
   "enonce": "Remets dans l'ordre les étapes de construction du diagramme.",
   "elements": [
    "Placer les croix des températures et les relier",
    "Tracer l'axe des mois avec le zéro",
    "Dessiner les bâtons des précipitations",
    "Choisir les maximums des deux axes verticaux",
    "Écrire le titre"
   ],
   "explication": "Axe des mois, maximums, bâtons, courbe, titre. On finit toujours par le titre.",
   "source": {
    "fichier": "methodes/Fiche methode - Diagramme ombrothermique.pdf",
    "page": 2
   },
   "r": "=AXUZ0hQdpUVFNEH",
   "poids": 1
  },
  {
   "id": "methode-ombrothermique-q16",
   "fiche": "methode-ombrothermique-f5",
   "type": "qcm",
   "niveau": 2,
   "enonce": "Le mois le plus pluvieux d'une ville reçoit 87 mm. Quel maximum est le plus pratique pour l'axe des précipitations ?",
   "choix": [
    "90 mm",
    "87 mm",
    "50 mm",
    "200 mm"
   ],
   "explication": "On prend une valeur ronde juste au-dessus du plus fort cumul. 90 mm convient, et l'axe des températures ira à 45 °C.",
   "source": {
    "fichier": "methodes/Fiche methode - Diagramme ombrothermique.pdf",
    "page": 2
   },
   "r": "==ATCsgRZtUZ",
   "poids": 1
  },
  {
   "id": "methode-ombrothermique-q17",
   "fiche": "methode-ombrothermique-f5",
   "type": "vrai_faux",
   "niveau": 1,
   "enonce": "On dessine la courbe des températures avant de tracer l'axe des mois.",
   "corrections": [
    "Faux : on trace d'abord l'axe des mois, puis les bâtons, puis la courbe.",
    "Faux : on ne trace jamais l'axe des mois.",
    "Faux : on commence par le titre."
   ],
   "explication": "Sans axe, impossible de savoir où placer les points. L'axe des mois vient en premier.",
   "source": {
    "fichier": "methodes/Fiche methode - Diagramme ombrothermique.pdf",
    "page": 2
   },
   "r": "==gEQZkJPdBQC1wTHoQSB4yBFUUWCcQAbA9qh0gFQFkTc8wEZI1aBwhCYElGLsgUNsDTClVDK0RCEgQVjIFEGQxAd4UAdgUeN0BQMhSTcR0Bd4iBWAwBDYQDN5VDwEEBTdBTGcAFfAFP",
   "poids": 1
  },
  {
   "id": "methode-ombrothermique-q18",
   "fiche": "methode-ombrothermique-f5",
   "type": "qcm",
   "niveau": 1,
   "enonce": "Que doit contenir le titre d'un diagramme ombrothermique ?",
   "choix": [
    "Le lieu et la période des mesures",
    "Le nom de l'élève seulement",
    "La couleur des bâtons",
    "Le mois le plus chaud"
   ],
   "explication": "Le titre dit de quel lieu il s'agit et sur quelles années portent les moyennes.",
   "source": {
    "fichier": "methodes/Fiche methode - Diagramme ombrothermique.pdf",
    "page": 6
   },
   "r": "QthJfBhRINwTVMQDSJiFawwBYrqHPNBBjlFAVg1CGogRM4TZ",
   "poids": 1
  },
  {
   "id": "methode-ombrothermique-q19",
   "fiche": "methode-ombrothermique-f3",
   "type": "qcm",
   "niveau": 2,
   "enonce": "Comment savoir, sur le diagramme, quel axe vertical lire pour une température ?",
   "choix": [
    "On lit l'axe de gauche, en rouge, gradué en °C",
    "On lit l'axe de droite, en bleu, gradué en mm",
    "On lit l'axe horizontal",
    "On lit le titre"
   ],
   "explication": "Les températures se lisent à gauche, en °C. Les précipitations à droite, en mm.",
   "source": {
    "fichier": "methodes/Fiche methode - Diagramme ombrothermique.pdf",
    "page": 1
   },
   "r": "=0UJWvqUpcRVMbLBN8QHVg0bIJAQCxxTIMQSeJiGWABFWk0CLIVD7wkQZ1gGGogRH0TZ",
   "poids": 1
  },
  {
   "id": "methode-ombrothermique-q20",
   "fiche": "methode-ombrothermique-f5",
   "type": "qcm",
   "niveau": 2,
   "enonce": "Comment place-t-on la température d'un mois sur le diagramme ?",
   "choix": [
    "Par une croix en face du mois, à la hauteur de sa température",
    "Par un bâton bleu",
    "Par une flèche vers l'axe de droite",
    "Par une couleur dans le titre"
   ],
   "explication": "On repère chaque température par une croix au-dessus de son mois. On relie ensuite les croix.",
   "source": {
    "fichier": "methodes/Fiche methode - Diagramme ombrothermique.pdf",
    "page": 5
   },
   "r": "=cFAHQQHP0x2rODQAEUDPwhRD0gU1cAERAAEB4kDeg04uXUGedAALYEHWc2FWQwERdwCPpQAs8lBVgEAaYEFIISZ",
   "poids": 1
  }
 ],
 "bonus": [
  {
   "id": "methode-ombrothermique-b1",
   "fiche": "methode-ombrothermique-f4",
   "titre": "Le mois sec de Gaussen",
   "texte": "Ce diagramme a été mis au point au milieu du XXe siècle par le botaniste français Henri Gaussen, avec F. Bagnouls. Grâce à la règle « 2 × », un mois est dit sec quand la courbe des températures passe au-dessus du bâton des pluies.",
   "source": {
    "titre": "Diagramme ombrothermique",
    "editeur": "Wikipédia, l'encyclopédie libre",
    "url": "https://fr.wikipedia.org/wiki/Diagramme_ombrothermique"
   }
  }
 ],
 "nonCouvert": []
});
