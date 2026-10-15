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
   "niveau": 2,
   "enonce": "Que représente un diagramme ombrothermique ?",
   "choix": [
    "Les précipitations et les températures moyennes de chaque mois en un lieu",
    "Les précipitations et les températures de chaque jour d'une année",
    "Les températures moyennes de chaque mois, sans les précipitations",
    "Les précipitations moyennes de plusieurs lieux sur une même carte"
   ],
   "explication": "Il montre, pour un lieu, les pluies et les températures moyennes de chaque mois. Ces moyennes sont calculées sur trente ans.",
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
    "Faux : ce sont des moyennes calculées sur dix ans.",
    "Faux : ce sont les valeurs d'un seul mois."
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
   "niveau": 3,
   "enonce": "Pourquoi utilise-t-on des moyennes sur trente ans plutôt qu'une seule année ?",
   "choix": [
    "Pour montrer le climat habituel du lieu",
    "Parce qu'on ne mesure la pluie qu'une fois en trente ans",
    "Pour que bâtons et courbe aient la même hauteur",
    "Parce qu'un diagramme couvre la vie d'un habitant"
   ],
   "explication": "Une année peut être très sèche ou très chaude. La moyenne sur 30 ans montre le climat habituel.",
   "source": {
    "fichier": "methodes/Fiche methode - Diagramme ombrothermique.pdf",
    "page": 1
   },
   "r": "=cFBMcwAS1xJNkAUYphBEcQASNzEYwQGSk0CDIlGm8VEbJ0APRxEGISZ",
   "poids": 1
  },
  {
   "id": "methode-ombrothermique-q21",
   "fiche": "methode-ombrothermique-f1",
   "type": "vrai_faux",
   "niveau": 1,
   "enonce": "Un diagramme ombrothermique décrit le climat d'une seule zone géographique.",
   "corrections": [],
   "explication": "Chaque diagramme correspond à un lieu précis, comme une ville. Pour comparer deux lieux, on compare leurs deux diagrammes.",
   "source": {
    "fichier": "methodes/Fiche methode - Diagramme ombrothermique.pdf",
    "page": 1
   },
   "r": "==ASBJgGIw1ScgyGBYAEDsRAMAFRmg1FBdBTGcAFfAFP",
   "poids": 1
  },
  {
   "id": "methode-ombrothermique-q22",
   "fiche": "methode-ombrothermique-f1",
   "type": "qcm_multiple",
   "niveau": 2,
   "enonce": "Coche ce qu'on peut lire sur un diagramme ombrothermique.",
   "choix": [
    "Le cumul moyen des précipitations de chaque mois",
    "La température moyenne de chaque mois",
    "La pluie tombée un jour précis",
    "Le nombre d'habitants du lieu",
    "La vitesse du vent chaque mois"
   ],
   "explication": "Le diagramme ne donne que deux choses : les précipitations et les températures moyennes de chaque mois. Il ne dit rien d'un jour précis, du vent ou des habitants.",
   "source": {
    "fichier": "methodes/Fiche methode - Diagramme ombrothermique.pdf",
    "page": 1
   },
   "r": "==gMEVBAdoiUQABBQEQDPdBDjh0Cbh0FAsgRMAgMGQxFcLbGDogBIJSYHlxDdYQCLk0FyMAFNYRUMowTBYALEFBVZdwHPUAwxWjAVZBEVkEAKswBu0QCAB0GMY0AlAFH",
   "poids": 1
  },
  {
   "id": "methode-ombrothermique-q23",
   "fiche": "methode-ombrothermique-f1",
   "type": "qcm",
   "niveau": 3,
   "enonce": "Une année, un lieu connaît un été exceptionnellement chaud. Son diagramme ombrothermique en est-il bouleversé ?",
   "choix": [
    "Non, car chaque valeur est une moyenne sur trente ans",
    "Oui, car le diagramme ne montre qu'une seule année",
    "Oui, car on refait le diagramme après chaque été",
    "Non, car le diagramme ne montre pas les températures"
   ],
   "explication": "Chaque valeur du diagramme est une moyenne sur trente ans. Une seule année exceptionnelle la change donc très peu.",
   "source": {
    "fichier": "methodes/Fiche methode - Diagramme ombrothermique.pdf",
    "page": 1
   },
   "r": "==wDWsFTOpgEIwAAzI1BQYQUMAQAXEBLAVEUDtxTSUBDSVzBQkAFHk0CaMQCr4URHxUDPpECGwTZ",
   "poids": 1
  },
  {
   "id": "methode-ombrothermique-q24",
   "fiche": "methode-ombrothermique-f1",
   "type": "vrai_faux",
   "niveau": 2,
   "enonce": "Le diagramme de Vichy pour la période 1971-2000 repose sur des moyennes de trente ans.",
   "corrections": [],
   "explication": "De 1971 à 2000, on compte trente années de mesures. C'est bien la durée utilisée pour calculer ces moyennes.",
   "source": {
    "fichier": "methodes/Fiche methode - Diagramme ombrothermique.pdf",
    "page": 1
   },
   "r": "==ASBJgGIw1ScgyGBYAEDsRAMAFRmg1FBdBTGcAFfAFP",
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
    "Par des points reliés",
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
    "Il mélange des bâtons et une courbe",
    "Il mélange des mois et des années",
    "Il mélange deux lieux différents",
    "Il mélange le jour et la nuit"
   ],
   "explication": "Mixte veut dire mélangé. Il combine un diagramme en bâtons et un graphique linéaire.",
   "source": {
    "fichier": "methodes/Fiche methode - Diagramme ombrothermique.pdf",
    "page": 1
   },
   "r": "LtQDA0BLOVEUDtxTSMQSBkSHBcstTkUHKYBSmo0CUF0xsugRFsTZ",
   "poids": 1
  },
  {
   "id": "methode-ombrothermique-q25",
   "fiche": "methode-ombrothermique-f2",
   "type": "vrai_faux",
   "niveau": 2,
   "enonce": "Un bâton du diagramme représente la pluie tombée en un seul jour du mois.",
   "corrections": [
    "Faux : il représente le cumul moyen de tout le mois, calculé sur trente ans.",
    "Faux : il représente la température moyenne du mois.",
    "Faux : il représente la pluie d'une année entière."
   ],
   "explication": "Chaque bâton donne la quantité totale de précipitations d'un mois, en moyenne sur trente ans. Pluie, neige et grêle y sont comptées ensemble.",
   "source": {
    "fichier": "methodes/Fiche methode - Diagramme ombrothermique.pdf",
    "page": 1
   },
   "r": "Yc1XaAgDS1wNDBwRZ5UHTURSbToHAYQGQogTDFQAsAURQFkTbMRCdIlIWU1CQggBD8kHd4CWGUBSC80AScwF0sttXUAFb40AbgUeN0BQMhSTcR0Bd4iBWAwBDYQDN5VDwEEBTdBTGcAFfAFP",
   "poids": 1
  },
  {
   "id": "methode-ombrothermique-q26",
   "fiche": "methode-ombrothermique-f2",
   "type": "qcm",
   "niveau": 2,
   "enonce": "Quand un diagramme porte deux courbes de températures, que représentent-elles ?",
   "choix": [
    "Les moyennes des plus basses et des plus hautes",
    "Les températures relevées dans deux villes voisines",
    "Les températures de deux années différentes",
    "Les températures de deux saisons opposées"
   ],
   "explication": "L'une donne la moyenne des températures les plus basses de la journée, l'autre celle des plus hautes. Les deux concernent le même lieu.",
   "source": {
    "fichier": "methodes/Fiche methode - Diagramme ombrothermique.pdf",
    "page": 1
   },
   "r": "==ARVwgByMRHFZABF4xTB0wJNEBUN0hCVUBCQcWAAkQBRpxCLI1GmM0CQRVACYUFM4TZ",
   "poids": 1
  },
  {
   "id": "methode-ombrothermique-q27",
   "fiche": "methode-ombrothermique-f2",
   "type": "association",
   "niveau": 2,
   "enonce": "Relie chaque élément du diagramme à ce qu'il représente.",
   "gauche": [
    "Un bâton bleu",
    "Une croix rouge",
    "L'axe horizontal",
    "Le titre"
   ],
   "droite": [
    "Le lieu et la période des mesures",
    "Le cumul moyen de précipitations d'un mois",
    "Les mois de l'année",
    "La température moyenne d'un mois"
   ],
   "explication": "Un bâton donne les précipitations d'un mois et une croix sa température. L'axe horizontal porte les mois, le titre le lieu et la période.",
   "source": {
    "fichier": "methodes/Fiche methode - Diagramme ombrothermique.pdf",
    "page": 1
   },
   "r": "==ANvcnXG5TWsslQdlCRe4RSEYnQyclSZlCH",
   "poids": 1
  },
  {
   "id": "methode-ombrothermique-q28",
   "fiche": "methode-ombrothermique-f2",
   "type": "qcm",
   "niveau": 3,
   "enonce": "En face d'avril, un bâton monte jusqu'à 70 sur l'axe de droite. Que signifie-t-il ?",
   "choix": [
    "En moyenne, il tombe 70 mm en avril",
    "En moyenne, il fait 70 °C en avril",
    "Il a plu pendant 70 jours en avril",
    "Il est tombé 70 mm en avril dernier"
   ],
   "explication": "L'axe de droite donne les précipitations en mm, et chaque bâton est une moyenne sur trente ans. Il tombe donc en moyenne 70 mm en avril.",
   "source": {
    "fichier": "methodes/Fiche methode - Diagramme ombrothermique.pdf",
    "page": 1
   },
   "r": "==QTeEQMbRQFDtwTLsQSCBnUQcAGe0hTDsBSvh0Cbh0FAsgRHcTZ",
   "poids": 1
  },
  {
   "id": "methode-ombrothermique-q8",
   "fiche": "methode-ombrothermique-f3",
   "type": "qcm",
   "niveau": 1,
   "enonce": "Que porte l'axe horizontal d'un diagramme ombrothermique ?",
   "choix": [
    "Les mois de l'année",
    "Les températures en °C",
    "Les précipitations en mm",
    "Les années de mesure"
   ],
   "explication": "L'axe horizontal donne les douze mois. Il est commun aux bâtons et à la courbe.",
   "source": {
    "fichier": "methodes/Fiche methode - Diagramme ombrothermique.pdf",
    "page": 1
   },
   "r": "==AUQwstfcwDI5BSmkURGRUACYUFM4TZ",
   "poids": 1
  },
  {
   "id": "methode-ombrothermique-q9",
   "fiche": "methode-ombrothermique-f3",
   "type": "vrai_faux",
   "niveau": 2,
   "enonce": "Sur le diagramme, l'axe des précipitations est à gauche, en rouge.",
   "corrections": [
    "Faux : à gauche, en rouge, ce sont les températures ; les précipitations sont à droite, en bleu.",
    "Faux : les précipitations sont sur l'axe horizontal.",
    "Faux : les précipitations sont à droite, en rouge."
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
   "id": "methode-ombrothermique-q19",
   "fiche": "methode-ombrothermique-f3",
   "type": "qcm",
   "niveau": 2,
   "enonce": "Comment lire une croix rouge placée en face de la graduation 30 de l'axe de gauche ?",
   "choix": [
    "C'est une température moyenne de 30 °C",
    "C'est un cumul moyen de 30 mm",
    "C'est le trentième jour du mois",
    "C'est une pluie qui a duré 30 jours"
   ],
   "explication": "Les croix rouges sont les températures, lues sur l'axe de gauche en °C. Cette croix indique donc une moyenne de 30 °C.",
   "source": {
    "fichier": "methodes/Fiche methode - Diagramme ombrothermique.pdf",
    "page": 1
   },
   "r": "HZTwr60XBhkJJVEUDBgCfkABSJCAAEBFDAcrf8RD30AAbhlTbUxAOFTZ",
   "poids": 1
  },
  {
   "id": "methode-ombrothermique-q29",
   "fiche": "methode-ombrothermique-f3",
   "type": "vrai_faux",
   "niveau": 2,
   "enonce": "L'axe horizontal sert à la fois aux bâtons et à la courbe.",
   "corrections": [],
   "explication": "Les mois de l'axe horizontal valent pour les précipitations comme pour les températures. C'est l'axe commun aux deux représentations.",
   "source": {
    "fichier": "methodes/Fiche methode - Diagramme ombrothermique.pdf",
    "page": 1
   },
   "r": "==ASBJgGIw1ScgyGBYAEDsRAMAFRmg1FBdBTGcAFfAFP",
   "poids": 1
  },
  {
   "id": "methode-ombrothermique-q30",
   "fiche": "methode-ombrothermique-f3",
   "type": "qcm",
   "niveau": 1,
   "enonce": "Combien d'axes compte un diagramme ombrothermique ?",
   "choix": [
    "Trois : un horizontal, deux verticaux",
    "Deux : un horizontal, un vertical",
    "Quatre : deux de chaque sorte",
    "Trois : deux horizontaux, un vertical"
   ],
   "explication": "Un axe horizontal pour les mois, et deux axes verticaux : les °C à gauche, les mm à droite. Cela fait trois axes.",
   "source": {
    "fichier": "methodes/Fiche methode - Diagramme ombrothermique.pdf",
    "page": 1
   },
   "r": "LZhGTsgKZdBUb50FTMQDStmHUExGeMxBd0BAjNEEVchTc8QCbYSZ",
   "poids": 1
  },
  {
   "id": "methode-ombrothermique-q31",
   "fiche": "methode-ombrothermique-f3",
   "type": "qcm_multiple",
   "niveau": 3,
   "enonce": "Coche les phrases justes sur les axes du diagramme.",
   "choix": [
    "L'axe horizontal est noir",
    "Les températures se lisent à gauche, en °C",
    "Les précipitations se lisent à droite, en mm",
    "L'axe horizontal est gradué en années",
    "Les deux axes verticaux ont les mêmes graduations"
   ],
   "explication": "Noir en bas pour les mois, rouge à gauche pour les °C, bleu à droite pour les mm. Les axes verticaux n'ont pas les mêmes graduations, car le maximum en mm vaut le double du maximum en °C.",
   "source": {
    "fichier": "methodes/Fiche methode - Diagramme ombrothermique.pdf",
    "page": 1
   },
   "r": "z00HFM2QAURALsxDJshFnJttFFwHM0hBegkJeVkRDFgBScQHbczGWwstDkhTccBJhFwR21JrPhwAJ5lIaYBEUYRSOzqUc0CSWwVQOpQFGpxF1cQAEcA2q6hAXwxYeBQePIUTU8gBccmBGAQVdggGB0hEq8lCd1wCXcQQlAFH",
   "poids": 1
  },
  {
   "id": "methode-ombrothermique-q11",
   "fiche": "methode-ombrothermique-f4",
   "type": "qcm",
   "niveau": 2,
   "enonce": "L'axe des précipitations monte jusqu'à 140 mm. Jusqu'où doit monter l'axe des températures ?",
   "choix": [
    "70 °C",
    "140 °C",
    "280 °C",
    "35 °C"
   ],
   "explication": "Le maximum en mm vaut le double du maximum en °C. 140 divisé par 2 donne 70.",
   "indice": "Les millimètres valent le double des degrés.",
   "source": {
    "fichier": "methodes/Fiche methode - Diagramme ombrothermique.pdf",
    "page": 1
   },
   "r": "=8QLfTqRZVUZ",
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
   "niveau": 3,
   "enonce": "Pourquoi respecter la règle « maximum des pluies = 2 × maximum des températures » ?",
   "choix": [
    "Pour pouvoir comparer les climats de lieux différents",
    "Pour que le diagramme tienne toujours sur une page",
    "Pour que les bâtons aient tous la même hauteur",
    "Pour que la courbe passe toujours au-dessus des bâtons"
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
   "enonce": "L'axe des températures monte jusqu'à 25 °C. Jusqu'où doit monter l'axe des précipitations ?",
   "choix": [
    "50 mm",
    "25 mm",
    "12,5 mm",
    "100 mm"
   ],
   "explication": "On double la valeur des températures. 2 × 25 donne 50 mm.",
   "source": {
    "fichier": "methodes/Fiche methode - Diagramme ombrothermique.pdf",
    "page": 1
   },
   "r": "==ATCsgRZdUZ",
   "poids": 1
  },
  {
   "id": "methode-ombrothermique-q32",
   "fiche": "methode-ombrothermique-f4",
   "type": "vrai_faux",
   "niveau": 3,
   "enonce": "Si l'axe des précipitations monte à 240 mm, celui des températures doit monter à 480 °C.",
   "corrections": [
    "Faux : il doit monter à la moitié, soit 120 °C.",
    "Faux : il doit monter à la même valeur, 240 °C."
   ],
   "explication": "C'est le maximum des précipitations qui vaut le double de celui des températures, pas l'inverse. Ici, 240 mm vont donc avec 120 °C.",
   "source": {
    "fichier": "methodes/Fiche methode - Diagramme ombrothermique.pdf",
    "page": 1
   },
   "r": "=8gSt5W133gXddlRdsBKBUVScLLAaYQHFMGTJURjt+EFD0BHo8RVRwhHN40AbgUeN0BQMhSTcR0Bd4iBWAwBDYQDN5VDwEEBTdBTGcAFfAFP",
   "poids": 1
  },
  {
   "id": "methode-ombrothermique-q33",
   "fiche": "methode-ombrothermique-f4",
   "type": "qcm",
   "niveau": 3,
   "enonce": "Sur l'axe des précipitations, 2 carreaux valent 10 mm. Combien valent ces 2 carreaux sur l'axe des températures ?",
   "choix": [
    "5 °C",
    "10 °C",
    "20 °C",
    "2 °C"
   ],
   "explication": "Les valeurs en mm sont le double des valeurs en °C, à la même hauteur. Si 2 carreaux font 10 mm, ils font donc 5 °C.",
   "source": {
    "fichier": "methodes/Fiche methode - Diagramme ombrothermique.pdf",
    "page": 3
   },
   "r": "==ATsYNpJdUZ",
   "poids": 1
  },
  {
   "id": "methode-ombrothermique-q34",
   "fiche": "methode-ombrothermique-f4",
   "type": "qcm_multiple",
   "niveau": 2,
   "enonce": "Coche les couples de maximums qui respectent la règle des graduations.",
   "choix": [
    "100 mm et 50 °C",
    "140 mm et 70 °C",
    "50 mm et 25 °C",
    "100 mm et 100 °C",
    "50 mm et 100 °C"
   ],
   "explication": "La règle veut que le maximum en mm soit le double du maximum en °C. C'est le cas pour 100 et 50, 140 et 70, 50 et 25.",
   "source": {
    "fichier": "methodes/Fiche methode - Diagramme ombrothermique.pdf",
    "page": 1
   },
   "r": "1EmbVffDb1lRSwgUq8RVVB0UFxELCr6YdIVFZtwTLsQSCN3QXl0VykNrPJUXjlFAVA0APZlVYBFH",
   "poids": 1
  },
  {
   "id": "methode-ombrothermique-q35",
   "fiche": "methode-ombrothermique-f4",
   "type": "trou",
   "niveau": 1,
   "enonce": "Complète la règle.",
   "texte": "La valeur maximale des précipitations est égale au ___ de la température maximale.",
   "banque": [
    "double",
    "triple",
    "moitié",
    "quart"
   ],
   "explication": "Le maximum en mm vaut deux fois le maximum en °C. Par exemple, 100 mm vont avec 50 °C.",
   "source": {
    "fichier": "methodes/Fiche methode - Diagramme ombrothermique.pdf",
    "page": 1
   },
   "r": "eA3RQFEDakgALlCH",
   "poids": 1
  },
  {
   "id": "methode-ombrothermique-q15",
   "fiche": "methode-ombrothermique-f5",
   "type": "ordre",
   "niveau": 3,
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
   "niveau": 3,
   "enonce": "Le mois le plus pluvieux d'une ville reçoit 113 mm. Quel maximum est le plus pratique pour l'axe des précipitations ?",
   "choix": [
    "120 mm",
    "113 mm",
    "100 mm",
    "226 mm"
   ],
   "explication": "On choisit une valeur ronde juste au-dessus du plus fort cumul. 120 mm convient, alors que 100 mm serait trop bas pour ce mois.",
   "source": {
    "fichier": "methodes/Fiche methode - Diagramme ombrothermique.pdf",
    "page": 2
   },
   "r": "=8wACYkVbNUZ",
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
    "Faux : on commence par le titre, puis la courbe.",
    "Faux : on dessine les bâtons en premier, avant l'axe des mois."
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
    "Le mois le plus pluvieux",
    "La température la plus haute",
    "Le nom de la personne qui l'a tracé"
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
   "id": "methode-ombrothermique-q20",
   "fiche": "methode-ombrothermique-f5",
   "type": "qcm",
   "niveau": 2,
   "enonce": "Comment place-t-on la température d'un mois sur le diagramme ?",
   "choix": [
    "Par une croix à la bonne hauteur",
    "Par un bâton bleu clair",
    "Par un petit trait horizontal de 5 mm",
    "Par une flèche vers l'axe de droite"
   ],
   "explication": "On repère chaque température par une croix au-dessus de son mois. On relie ensuite les croix.",
   "source": {
    "fichier": "methodes/Fiche methode - Diagramme ombrothermique.pdf",
    "page": 5
   },
   "r": "=oUMYBQQY9wBGNwBcgCEVRQGRlcrPpQAs8lBVgEAaYEFIISZ",
   "poids": 1
  },
  {
   "id": "methode-ombrothermique-q36",
   "fiche": "methode-ombrothermique-f5",
   "type": "vrai_faux",
   "niveau": 2,
   "enonce": "Pour dessiner un bâton, on trace d'abord un petit trait horizontal à la bonne hauteur, centré sur le mois.",
   "corrections": [],
   "explication": "On place d'abord un petit trait à la hauteur du cumul, au-dessus du mois. On dessine ensuite le rectangle, colorié en bleu clair.",
   "source": {
    "fichier": "methodes/Fiche methode - Diagramme ombrothermique.pdf",
    "page": 3
   },
   "r": "==ASBJgGIw1ScgyGBYAEDsRAMAFRmg1FBdBTGcAFfAFP",
   "poids": 1
  },
  {
   "id": "methode-ombrothermique-q37",
   "fiche": "methode-ombrothermique-f5",
   "type": "vrai_faux",
   "niveau": 2,
   "enonce": "On colorie les bâtons des précipitations en rouge.",
   "corrections": [
    "Faux : on les colorie en bleu clair.",
    "Faux : on les laisse sans couleur.",
    "Faux : on les colorie en noir, comme l'axe des mois."
   ],
   "explication": "Les bâtons sont coloriés en bleu clair, comme l'axe des précipitations. Le rouge est réservé aux températures.",
   "source": {
    "fichier": "methodes/Fiche methode - Diagramme ombrothermique.pdf",
    "page": 4
   },
   "r": "Pc1SHgBCCwgUdYSQHUxQL80APsRHr0hFFZAFF4UAdgUeN0BQMhSTcR0Bd4iBWAwBDYQDN5VDwEEBTdBTGcAFfAFP",
   "poids": 1
  },
  {
   "id": "methode-ombrothermique-q38",
   "fiche": "methode-ombrothermique-f5",
   "type": "qcm",
   "niveau": 3,
   "enonce": "À Vichy, le mois le plus pluvieux reçoit 98 mm. Quels maximums ronds choisit-on pour les deux axes verticaux ?",
   "choix": [
    "100 mm et 50 °C",
    "98 mm et 49 °C",
    "100 mm et 100 °C",
    "50 mm et 100 °C"
   ],
   "explication": "On arrondit juste au-dessus de 98 : 100 mm. La règle donne alors la moitié pour les températures, soit 50 °C.",
   "source": {
    "fichier": "methodes/Fiche methode - Diagramme ombrothermique.pdf",
    "page": 2
   },
   "r": "Tpi3tKFW21QEQ1wACYkVZNUZ",
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
