// Savoir-faire : la frise chronologique
// Généré par atelier/outils/compiler-cours.js depuis atelier/contenu/methode-frise.js. Ne pas modifier à la main.
JEU.enregistrer("cours", {
 "id": "methode-frise",
 "matiere": "histoire",
 "titre": "Savoir-faire : la frise chronologique",
 "fiches": [
  {
   "id": "methode-frise-f1",
   "notion": "Les quatre étapes d'une frise",
   "titre": "Construire une frise pas à pas",
   "texte": "Une frise se construit dans un ordre précis. On trace d'abord l'axe du temps. On choisit ensuite une échelle. Puis on place les événements et les périodes. On termine en lui donnant un titre, qu'il ne faut jamais oublier.",
   "pointsCles": [
    "1. Tracer l'axe du temps",
    "2. Choisir une échelle",
    "3. Placer événements et périodes",
    "4. Donner un titre"
   ],
   "astuce": "Retiens l’ordre : axe, échelle, placement, titre.",
   "dates": [],
   "lieux": [],
   "personnages": [],
   "vocabulaire": [
    {
     "mot": "axe du temps",
     "def": "la ligne orientée sur laquelle on place les dates, des plus anciennes aux plus récentes"
    },
    {
     "mot": "chronologique",
     "def": "rangé dans l'ordre du temps, du plus ancien au plus récent"
    }
   ],
   "schema": "methode-frise-s1",
   "prerequis": [],
   "source": {
    "fichier": "methodes/Fiche methode - Frise chronologique.pdf",
    "page": 1
   }
  },
  {
   "id": "methode-frise-f2",
   "notion": "Choisir une échelle de temps",
   "titre": "L'échelle de la frise",
   "texte": "L'échelle dit quelle durée représente une longueur donnée : par exemple 1 cm pour 10 ans, ou 1 carreau pour un siècle. Pour trouver la longueur d'une durée, on divise cette durée par ce que vaut une unité de longueur.",
   "pointsCles": [
    "Une même longueur représente toujours la même durée",
    "Exemple : 1 cm = 10 ans, donc 50 ans = 5 cm"
   ],
   "dates": [],
   "lieux": [],
   "personnages": [],
   "vocabulaire": [
    {
     "mot": "échelle",
     "def": "le rapport entre une longueur sur la frise et la durée qu'elle représente"
    },
    {
     "mot": "siècle",
     "def": "une durée de cent ans"
    }
   ],
   "schema": null,
   "prerequis": [
    "methode-frise-f1"
   ],
   "source": {
    "fichier": "methodes/Fiche methode - Frise chronologique.pdf",
    "page": 1
   }
  },
  {
   "id": "methode-frise-f3",
   "notion": "Placer un événement ou une période",
   "titre": "Événements et périodes",
   "texte": "Un événement se place à sa date : on écrit la date et le nom de l'événement. Une période dure un certain temps : on la place entre sa date de début et sa date de fin, et on écrit son nom.",
   "pointsCles": [
    "Événement : une date, un nom",
    "Période : entre deux dates, un nom"
   ],
   "dates": [],
   "lieux": [],
   "personnages": [],
   "vocabulaire": [
    {
     "mot": "événement",
     "def": "un fait qui se produit à une date précise"
    },
    {
     "mot": "période",
     "def": "un temps qui s'étend entre deux dates"
    }
   ],
   "schema": "methode-frise-s1",
   "prerequis": [
    "methode-frise-f2"
   ],
   "source": {
    "fichier": "methodes/Fiche methode - Frise chronologique.pdf",
    "page": 1
   }
  }
 ],
 "schemas": [
  {
   "id": "methode-frise-s1",
   "legende": "Une frise : axe, échelle, un événement (repère) et une période (bande).",
   "svg": "<svg viewBox='0 0 520 170' xmlns='http://www.w3.org/2000/svg' font-family='Georgia,serif' font-size='13'><text x='260' y='20' text-anchor='middle' font-weight='bold' fill='#2e2419'>Titre de la frise</text><rect x='190' y='70' width='150' height='18' fill='#b08d3a' opacity='.55'/><text x='265' y='62' text-anchor='middle' fill='#2e2419'>une période (entre deux dates)</text><line x1='30' y1='100' x2='490' y2='100' stroke='#2e2419' stroke-width='3'/><path d='M490 92l16 8-16 8z' fill='#2e2419'/><g stroke='#2e2419' stroke-width='2'><line x1='40' y1='94' x2='40' y2='106'/><line x1='115' y1='94' x2='115' y2='106'/><line x1='190' y1='94' x2='190' y2='106'/><line x1='265' y1='94' x2='265' y2='106'/><line x1='340' y1='94' x2='340' y2='106'/><line x1='415' y1='94' x2='415' y2='106'/></g><g text-anchor='middle' fill='#2e2419'><text x='40' y='124'>0</text><text x='115' y='124'>10</text><text x='190' y='124'>20</text><text x='265' y='124'>30</text><text x='340' y='124'>40</text><text x='415' y='124'>50</text></g><line x1='115' y1='100' x2='115' y2='145' stroke='#6b2d5c' stroke-width='2'/><circle cx='115' cy='100' r='5' fill='#6b2d5c'/><text x='115' y='160' text-anchor='middle' fill='#6b2d5c'>un événement (une date)</text><text x='470' y='150' text-anchor='end' fill='#5b5044'>échelle : 1 graduation = 10 ans</text></svg>"
  }
 ],
 "questions": [
  {
   "id": "methode-frise-q1",
   "fiche": "methode-frise-f1",
   "type": "qcm",
   "niveau": 1,
   "enonce": "Quelle est la toute première étape pour réaliser une frise ?",
   "choix": [
    "Tracer l'axe du temps",
    "Écrire le titre",
    "Placer les événements",
    "Choisir une échelle"
   ],
   "explication": "On commence toujours par l'axe du temps. Viennent ensuite l'échelle, les événements, puis le titre.",
   "indice": "Avant de placer quoi que ce soit, il faut une ligne.",
   "source": {
    "fichier": "methodes/Fiche methode - Frise chronologique.pdf",
    "page": 1
   },
   "r": "=UWAFgAEFk0GLIVD7wkQZ1AHKUwBbYSZ",
   "poids": 1
  },
  {
   "id": "methode-frise-q2",
   "fiche": "methode-frise-f1",
   "type": "ordre",
   "niveau": 2,
   "enonce": "Remets les étapes de la frise dans le bon ordre.",
   "elements": [
    "Placer les événements et les périodes",
    "Donner un titre",
    "Tracer l'axe du temps",
    "Choisir une échelle"
   ],
   "explication": "Axe, puis échelle, puis placement, puis titre. Sans échelle, impossible de placer juste.",
   "indice": "Axe, échelle, placement, titre.",
   "source": {
    "fichier": "methodes/Fiche methode - Frise chronologique.pdf",
    "page": 1
   },
   "r": "oxhQfpUVFBEH",
   "poids": 1
  },
  {
   "id": "methode-frise-q3",
   "fiche": "methode-frise-f1",
   "type": "vrai_faux",
   "niveau": 1,
   "enonce": "On écrit le titre de la frise avant de tracer l'axe du temps.",
   "corrections": [
    "Faux : on trace d'abord l'axe ; le titre se met à la fin, sans l'oublier.",
    "Faux : on choisit d'abord l'échelle, puis on écrit le titre, puis on trace l'axe.",
    "Faux : on commence par placer les événements, puis on écrit le titre."
   ],
   "explication": "Le titre est la dernière étape. Il est obligatoire.",
   "source": {
    "fichier": "methodes/Fiche methode - Frise chronologique.pdf",
    "page": 1
   },
   "r": "=MRTcphJElwVYFASKYkGcYSAVl0GY8gTO4BSj7eRBh0APNQFJdRNGwREVRRBORlUNsDTClVDK0RCEgQVjIFEGQxAd4UAdgUeN0BQMhSTcR0Bd4iBWAwBDYQDN5VDwEEBTdBTGcAFfAFP",
   "poids": 1
  },
  {
   "id": "methode-frise-q4",
   "fiche": "methode-frise-f1",
   "type": "qcm",
   "niveau": 2,
   "enonce": "Pourquoi faut-il choisir l'échelle avant de placer les événements ?",
   "choix": [
    "Parce que l'échelle dit où se trouve chaque date sur l'axe",
    "Parce que l'échelle indique le nom et la date de chaque événement",
    "Parce que l'échelle sert aussi de titre à la frise",
    "Parce que l'échelle se trace avant l'axe du temps"
   ],
   "explication": "Sans échelle, on ne sait pas à quelle distance placer une date. C'est elle qui transforme une durée en longueur.",
   "source": {
    "fichier": "methodes/Fiche methode - Frise chronologique.pdf",
    "page": 1
   },
   "r": "=MFDW4QVEM2XQYUDLsxBCk0FyMAFNYRUMghGdoxNNAgRNcNrJYUHbMiUQkQGUEQDGH7Tv0AAAxlTKUAFIISZ",
   "poids": 1
  },
  {
   "id": "methode-frise-q5",
   "fiche": "methode-frise-f1",
   "type": "vrai_faux",
   "niveau": 1,
   "enonce": "Sur une frise, le titre est obligatoire.",
   "corrections": [],
   "explication": "Oui : la dernière étape, c'est de ne pas oublier le titre.",
   "source": {
    "fichier": "methodes/Fiche methode - Frise chronologique.pdf",
    "page": 1
   },
   "r": "==ASBJgGIw1ScgyGBYAEDsRAMAFRmg1FBdBTGcAFfAFP",
   "poids": 1
  },
  {
   "id": "methode-frise-q15",
   "fiche": "methode-frise-f1",
   "type": "vrai_faux",
   "niveau": 2,
   "enonce": "Pour réaliser une frise, on place les événements avant de choisir l'échelle.",
   "corrections": [
    "Faux : on choisit l'échelle d'abord, puis on place les événements.",
    "Faux : on place les événements seulement après avoir écrit le titre.",
    "Faux : on n'a pas besoin d'échelle pour placer les événements."
   ],
   "explication": "L'échelle vient en deuxième, juste après l'axe. Les événements se placent ensuite, grâce à elle.",
   "source": {
    "fichier": "methodes/Fiche methode - Frise chronologique.pdf",
    "page": 1
   },
   "r": "Qd0GepRADsADc4esDwstRpxCDIVDgwUCF1AAAYUFAcwNSlVAH4xCPgkFIZSQJAVRNYcpBVgUzshBMoRGK4UAdgUeN0BQMhSTcR0Bd4iBWAwBDYQDN5VDwEEBTdBTGcAFfAFP",
   "poids": 1
  },
  {
   "id": "methode-frise-q16",
   "fiche": "methode-frise-f1",
   "type": "qcm",
   "niveau": 3,
   "enonce": "Un élève a tracé son axe, choisi son échelle et placé ses événements. Que lui reste-t-il à faire ?",
   "choix": [
    "Donner un titre à sa frise",
    "Tracer un second axe du temps",
    "Choisir une nouvelle échelle",
    "Placer les événements une seconde fois"
   ],
   "explication": "Les trois premières étapes sont faites. Il ne reste que la quatrième : le titre, à ne pas oublier.",
   "source": {
    "fichier": "methodes/Fiche methode - Frise chronologique.pdf",
    "page": 1
   },
   "r": "=wkCV8wGUc2EGUU1ym0CdYQA30wCA1AHKgACGYTZ",
   "poids": 1
  },
  {
   "id": "methode-frise-q17",
   "fiche": "methode-frise-f1",
   "type": "vrai_faux",
   "niveau": 2,
   "enonce": "Sur une frise, la flèche au bout de l'axe du temps est tournée vers le présent.",
   "corrections": [],
   "explication": "Oui : l'axe va du passé vers le présent, dans le sens de la flèche. Les dates les plus récentes sont donc du côté de la pointe.",
   "source": {
    "fichier": "methodes/Fiche methode - Frise chronologique.pdf",
    "page": 1
   },
   "r": "==ASBJgGIw1ScgyGBYAEDsRAMAFRmg1FBdBTGcAFfAFP",
   "poids": 1
  },
  {
   "id": "methode-frise-q27",
   "fiche": "methode-frise-f1",
   "type": "qcm_multiple",
   "niveau": 2,
   "enonce": "Quelles étapes faut-il avoir faites avant de placer les événements ? (plusieurs réponses)",
   "choix": [
    "Tracer l'axe du temps",
    "Choisir une échelle",
    "Donner un titre",
    "Écrire le nom des événements"
   ],
   "explication": "L'axe puis l'échelle viennent avant le placement des événements, avec leur date et leur nom. Le titre vient en dernier.",
   "source": {
    "fichier": "methodes/Fiche methode - Frise chronologique.pdf",
    "page": 1
   },
   "r": "7s0Fr4BENYB2q6kCc0xYfxgREFwBlQURQRjAYAQARxhCPdBEioQCV81CMcAF9AFH",
   "poids": 1
  },
  {
   "id": "methode-frise-q6",
   "fiche": "methode-frise-f2",
   "type": "qcm",
   "niveau": 2,
   "enonce": "Échelle : 1 cm = 10 ans. Quelle longueur faut-il pour représenter 50 ans ?",
   "choix": [
    "5 cm",
    "50 cm",
    "10 cm",
    "0,5 cm"
   ],
   "explication": "50 ans divisés par 10 ans par centimètre, cela fait 5 cm.",
   "indice": "Combien de fois 10 ans dans 50 ans ?",
   "poids": 1,
   "source": {
    "fichier": "methodes/Fiche methode - Frise chronologique.pdf",
    "page": 1
   },
   "r": "NtQBJdUZ"
  },
  {
   "id": "methode-frise-q7",
   "fiche": "methode-frise-f2",
   "type": "qcm",
   "niveau": 3,
   "enonce": "Échelle : 1 carreau = 1 siècle. Combien de carreaux pour 300 ans ?",
   "choix": [
    "3 carreaux",
    "30 carreaux",
    "300 carreaux",
    "1 carreau"
   ],
   "explication": "Un siècle, c'est 100 ans. 300 ans font 3 siècles, donc 3 carreaux.",
   "indice": "Un siècle = 100 ans.",
   "source": {
    "fichier": "methodes/Fiche methode - Frise chronologique.pdf",
    "page": 1
   },
   "r": "hVFEUhEHdcQBJFUZ",
   "poids": 1
  },
  {
   "id": "methode-frise-q8",
   "fiche": "methode-frise-f2",
   "type": "vrai_faux",
   "niveau": 1,
   "enonce": "Avec l'échelle 1 cm = 10 ans, 20 ans se représentent par 2 cm.",
   "corrections": [],
   "explication": "20 divisé par 10 donne 2 : il faut bien 2 cm.",
   "source": {
    "fichier": "methodes/Fiche methode - Frise chronologique.pdf",
    "page": 1
   },
   "r": "==ASBJgGIw1ScgyGBYAEDsRAMAFRmg1FBdBTGcAFfAFP",
   "poids": 1
  },
  {
   "id": "methode-frise-q9",
   "fiche": "methode-frise-f2",
   "type": "vrai_faux",
   "niveau": 2,
   "enonce": "Avec l'échelle 1 cm = 10 ans, une période de 40 ans mesure 40 cm.",
   "corrections": [
    "Faux : elle mesure 4 cm, car 40 divisé par 10 donne 4.",
    "Faux : elle mesure 10 cm, car 1 cm vaut 10 ans.",
    "Faux : elle mesure 400 cm, car on multiplie 40 par 10."
   ],
   "explication": "Chaque centimètre vaut 10 ans. 40 ans prennent donc 4 cm.",
   "source": {
    "fichier": "methodes/Fiche methode - Frise chronologique.pdf",
    "page": 1
   },
   "r": "==ACTdkWPdhBtIUAV0xXPRxBZIl7xaADDgRDO9lRIFDTGURADwgRSl0F1cgBAgRUMIwAXgUeN0BQMhSTcR0Bd4iBWAwBDYQDN5VDwEEBTdBTGcAFfAFP",
   "poids": 1
  },
  {
   "id": "methode-frise-q10",
   "fiche": "methode-frise-f2",
   "type": "qcm",
   "niveau": 2,
   "enonce": "Comment trouver la longueur qui représente une durée sur une frise ?",
   "choix": [
    "On divise la durée par ce que vaut une unité de longueur",
    "On multiplie la durée par ce que vaut une unité de longueur",
    "On compte le nombre d'événements placés sur l'axe",
    "On mesure la longueur du titre de la frise"
   ],
   "explication": "Si 1 cm vaut 10 ans, on divise la durée par 10. On obtient la longueur en centimètres.",
   "source": {
    "fichier": "methodes/Fiche methode - Frise chronologique.pdf",
    "page": 1
   },
   "r": "M1xBNYjSLoVQOpgAGBcszsxGQUFFHsxTG0hIbVEUY9xTDUQSAYiAVBA3yuxGLIVCv0AAGREGGIgRH0TZ",
   "poids": 1
  },
  {
   "id": "methode-frise-q18",
   "fiche": "methode-frise-f2",
   "type": "qcm",
   "niveau": 3,
   "enonce": "Échelle : 1 cm = 10 ans. Deux événements ont lieu en 1950 et en 1980. Quel écart faut-il laisser entre eux ?",
   "choix": [
    "3 cm",
    "30 cm",
    "1,5 cm",
    "8 cm"
   ],
   "explication": "Entre 1950 et 1980, il y a 30 ans. 30 divisé par 10 donne 3 cm.",
   "indice": "Calcule d'abord la durée entre les deux dates.",
   "source": {
    "fichier": "methodes/Fiche methode - Frise chronologique.pdf",
    "page": 1
   },
   "r": "NtQBJFUZ",
   "poids": 1
  },
  {
   "id": "methode-frise-q19",
   "fiche": "methode-frise-f2",
   "type": "vrai_faux",
   "niveau": 2,
   "enonce": "Avec l'échelle 1 carreau = 1 siècle, une période de 200 ans occupe 20 carreaux.",
   "corrections": [
    "Faux : elle occupe 2 carreaux, car 200 ans font 2 siècles.",
    "Faux : elle occupe 200 carreaux, un par année.",
    "Faux : elle occupe 1 carreau, car c'est une seule période."
   ],
   "explication": "Un carreau vaut un siècle, soit 100 ans. 200 ans prennent donc 2 carreaux.",
   "source": {
    "fichier": "methodes/Fiche methode - Frise chronologique.pdf",
    "page": 1
   },
   "r": "=oDUbZBEdogxsuxGj9RRBNUAJYUFHMxZCV0VVNACN8kXQYDTAc0XPwgRUl0F3cgFGoRUMIwAXgUeN0BQMhSTcR0Bd4iBWAwBDYQDN5VDwEEBTdBTGcAFfAFP",
   "poids": 1
  },
  {
   "id": "methode-frise-q20",
   "fiche": "methode-frise-f2",
   "type": "qcm_multiple",
   "niveau": 2,
   "enonce": "Lesquelles de ces échelles de temps peut-on utiliser pour une frise ? (plusieurs réponses)",
   "choix": [
    "1 cm = 10 ans",
    "1 carreau = 1 siècle",
    "1 cm = 100 ans",
    "1 cm = 3 événements",
    "1 cm = 1 km"
   ],
   "explication": "Une échelle de temps relie une longueur à une durée, comme 10 ans ou un siècle. Un kilomètre ou un nombre d'événements n'est pas une durée.",
   "source": {
    "fichier": "methodes/Fiche methode - Frise chronologique.pdf",
    "page": 1
   },
   "r": "==wLKBzQEURHe5lRbl0HkIFRHl1UMIADavqKeVEBNM1TTcADAUzEWUERTVETcwRCj1BVVAhTCUgRYBFH",
   "poids": 1
  },
  {
   "id": "methode-frise-q21",
   "fiche": "methode-frise-f2",
   "type": "qcm",
   "niveau": 3,
   "enonce": "Sur une frise, 4 cm représentent 40 ans. Quelle est l'échelle ?",
   "choix": [
    "1 cm = 10 ans",
    "1 cm = 40 ans",
    "1 cm = 4 ans",
    "1 cm = 160 ans"
   ],
   "explication": "40 ans répartis sur 4 cm, cela fait 10 ans par centimètre. L'échelle est donc 1 cm = 10 ans.",
   "indice": "Divise la durée par le nombre de centimètres.",
   "source": {
    "fichier": "methodes/Fiche methode - Frise chronologique.pdf",
    "page": 1
   },
   "r": "NFgBi0QVE0wUPtQBJNUZ",
   "poids": 1
  },
  {
   "id": "methode-frise-q11",
   "fiche": "methode-frise-f3",
   "type": "qcm",
   "niveau": 1,
   "enonce": "Que faut-il écrire quand on place un événement sur une frise ?",
   "choix": [
    "Sa date et son nom",
    "Seulement sa date",
    "Seulement son nom",
    "Sa date et le titre de la frise"
   ],
   "explication": "Un événement placé porte sa date et son nom. Sans eux, le repère ne veut rien dire.",
   "source": {
    "fichier": "methodes/Fiche methode - Frise chronologique.pdf",
    "page": 1
   },
   "r": "=cEGecgTB0xGjlFAVgkGOIgRIESZ",
   "poids": 1
  },
  {
   "id": "methode-frise-q12",
   "fiche": "methode-frise-f3",
   "type": "vrai_faux",
   "niveau": 1,
   "enonce": "Une période se place à une seule date, comme un événement.",
   "corrections": [
    "Faux : une période se place entre deux dates, son début et sa fin.",
    "Faux : une période se place à sa date de fin seulement.",
    "Faux : une période se place à sa date de début seulement."
   ],
   "explication": "Une période dure : elle occupe tout l'espace entre sa date de début et sa date de fin.",
   "source": {
    "fichier": "methodes/Fiche methode - Frise chronologique.pdf",
    "page": 1
   },
   "r": "=gxFDAgBAYECBcmBQUUAEswxsaBStIkFVEQHKIxBNI1PHARAVRxGaEwFIZiTEkVXOpQFGxgFosxBMbbAJtQAHgUeN0BQMhSTcR0Bd4iBWAwBDYQDN5VDwEEBTdBTGcAFfAFP",
   "poids": 1
  },
  {
   "id": "methode-frise-q13",
   "fiche": "methode-frise-f3",
   "type": "qcm",
   "niveau": 3,
   "enonce": "Comment représenter sur une frise une période qui va de l'an 1050 à l'an 1100 ?",
   "choix": [
    "Par une bande qui s'étend de 1050 à 1100, avec son nom",
    "Par un seul point placé au milieu, en 1075, avec son nom",
    "Par un point en 1050 et un autre en 1100, sans nom",
    "Par une bande qui s'étend de 1050 à 1100, sans nom"
   ],
   "explication": "Une période occupe l'espace entre ses deux dates. On écrit aussi son nom.",
   "source": {
    "fichier": "methodes/Fiche methode - Frise chronologique.pdf",
    "page": 1
   },
   "r": "==AUFwyQFtlQd8UBD8xEn5VRVREQJ5MrShlddQVFIpwTCgADG4esSZRVYwxHPdBDtw0BVgEAaYEFIISZ",
   "poids": 1
  },
  {
   "id": "methode-frise-q14",
   "fiche": "methode-frise-f3",
   "type": "association",
   "niveau": 2,
   "enonce": "Relie chaque élément de la frise à ce qu'il représente.",
   "gauche": [
    "Un événement",
    "Une période",
    "L'échelle",
    "Le titre"
   ],
   "droite": [
    "Ce que montre la frise, à ne pas oublier",
    "Une date et un nom",
    "La durée que vaut une longueur",
    "Un temps entre deux dates"
   ],
   "explication": "Événement : une date. Période : entre deux dates ; l'échelle convertit les durées, le titre dit ce que montre la frise.",
   "source": {
    "fichier": "methodes/Fiche methode - Frise chronologique.pdf",
    "page": 1
   },
   "r": "==ANvcnXG5TWsslQdlCRe4RSEYnQyclSZlCH",
   "poids": 1
  },
  {
   "id": "methode-frise-q22",
   "fiche": "methode-frise-f3",
   "type": "vrai_faux",
   "niveau": 2,
   "enonce": "Quand on place deux dates, l'écart entre elles sur l'axe doit correspondre à l'échelle.",
   "corrections": [],
   "explication": "Oui : l'intervalle entre deux dates doit respecter l'échelle des temps. Sinon, les durées seraient fausses sur la frise.",
   "source": {
    "fichier": "methodes/Fiche methode - Frise chronologique.pdf",
    "page": 1
   },
   "r": "==ASBJgGIw1ScgyGBYAEDsRAMAFRmg1FBdBTGcAFfAFP",
   "poids": 1
  },
  {
   "id": "methode-frise-q23",
   "fiche": "methode-frise-f3",
   "type": "vrai_faux",
   "niveau": 2,
   "enonce": "Pour placer un événement, il suffit d'écrire son nom : la date n'est pas utile.",
   "corrections": [
    "Faux : on indique la date et le nom de l'événement.",
    "Faux : on écrit seulement la date, sans le nom.",
    "Faux : on écrit le titre de la frise à côté de l'événement."
   ],
   "explication": "Un événement placé porte toujours sa date et son nom. L'un sans l'autre ne suffit pas.",
   "source": {
    "fichier": "methodes/Fiche methode - Frise chronologique.pdf",
    "page": 1
   },
   "r": "=QBTBZgBmAEAbRYrZ8cpO5xZXERRY4xBOpgHIdDSFBVWPsgRHUgUicABMExHA4UAdgUeN0BQMhSTcR0Bd4iBWAwBDYQDN5VDwEEBTdBTGcAFfAFP",
   "poids": 1
  },
  {
   "id": "methode-frise-q24",
   "fiche": "methode-frise-f3",
   "type": "qcm",
   "niveau": 2,
   "enonce": "Pourquoi décale-t-on parfois les traits de dates proches les unes des autres ?",
   "choix": [
    "Pour que les noms des événements ne se chevauchent pas",
    "Pour montrer que ces dates sont moins importantes",
    "Pour changer l'échelle de cette partie de la frise",
    "Pour indiquer que ces événements ont eu lieu le même jour"
   ],
   "explication": "Quand deux dates sont proches, leurs noms risquent de se recouvrir. On décale les traits pour pouvoir tout écrire lisiblement.",
   "source": {
    "fichier": "methodes/Fiche methode - Frise chronologique.pdf",
    "page": 1
   },
   "r": "==AUbISXFF0QLcQBTgABiohFFBhAJtQAStxNDBAWIBgxlCBwxeWAQEQVCQQABI1GmEURQh1HPRxEGISZ",
   "poids": 1
  },
  {
   "id": "methode-frise-q25",
   "fiche": "methode-frise-f3",
   "type": "qcm_multiple",
   "niveau": 3,
   "enonce": "Lesquels de ces repères se placent comme des périodes, entre deux dates ? (plusieurs réponses)",
   "choix": [
    "Le règne de Justinien (527-565)",
    "La dynastie omeyyade de Damas (661-750)",
    "Charlemagne, empereur d'Occident (800-814)",
    "La prise de Constantinople (1453)",
    "L'Hégire (622)"
   ],
   "explication": "Un règne ou une dynastie durent : ce sont des périodes entre deux dates. La prise de Constantinople et l'Hégire sont des événements, à une seule date.",
   "source": {
    "fichier": "methodes/Fiche methode - Frise chronologique.pdf",
    "page": 1
   },
   "r": "1EGBRRQFD9lVeFkUzwBEBwhEKECSWgUMYBwRI5hADYURXkSFUgAEdsxDHEjSv9ATFgRWCdFUfp1ZBQBCUUTSLsgUNcCTcwESDAgRDAgB0MxGcERUIISTepkaYMFAAkVXT5UScIyGbwQACwBJPdBDjh0CSVYrdY0AlAFH",
   "poids": 1
  },
  {
   "id": "methode-frise-q26",
   "fiche": "methode-frise-f3",
   "type": "trou",
   "niveau": 1,
   "enonce": "Complète la phrase.",
   "texte": "Une période commence à sa date de ___ et s'arrête à sa date de ___.",
   "banque": [
    "début",
    "fin",
    "naissance",
    "titre"
   ],
   "explication": "Une période s'étend entre deux dates. La première est son début, la seconde sa fin.",
   "source": {
    "fichier": "methodes/Fiche methode - Frise chronologique.pdf",
    "page": 1
   },
   "r": "=gDKTdwBJA1MvB3RBhFDGXqALlCH",
   "poids": 1
  }
 ],
 "bonus": [
  {
   "id": "methode-frise-b1",
   "fiche": "methode-frise-f1",
   "titre": "Une frise de 2 000 vies",
   "texte": "En 1765, le savant anglais Joseph Priestley publie une grande frise, « A Chart of Biography ». Chaque personnage célèbre y est une ligne qui va de sa naissance à sa mort : on voit d'un coup d'œil qui a vécu en même temps que qui.",
   "source": {
    "titre": "Joseph Priestley",
    "editeur": "Wikipédia, l'encyclopédie libre",
    "url": "https://fr.wikipedia.org/wiki/Joseph_Priestley"
   }
  }
 ],
 "nonCouvert": []
});
