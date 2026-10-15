// Savoir-faire : le tableau à double entrée
// Généré par atelier/outils/compiler-cours.js depuis atelier/contenu/methode-tableau.js. Ne pas modifier à la main.
JEU.enregistrer("cours", {
 "id": "methode-tableau",
 "matiere": "svt",
 "titre": "Savoir-faire : le tableau à double entrée",
 "fiches": [
  {
   "id": "methode-tableau-f1",
   "notion": "À quoi sert un tableau à double entrée",
   "titre": "Classer selon deux critères",
   "texte": "On fait un tableau à double entrée quand des données dépendent d'au moins deux critères, chacun découpé en catégories. Un critère est rangé en lignes (les rangs), l'autre en colonnes.",
   "pointsCles": [
    "Au moins deux critères",
    "Un critère en rangs, l'autre en colonnes"
   ],
   "dates": [],
   "lieux": [],
   "personnages": [],
   "vocabulaire": [
    {
     "mot": "critère",
     "def": "ce qui sert à trier les données, par exemple la taille ou l'ingrédient"
    },
    {
     "mot": "rang",
     "def": "une ligne horizontale du tableau"
    },
    {
     "mot": "colonne",
     "def": "une bande verticale du tableau"
    }
   ],
   "schema": "methode-tableau-s1",
   "prerequis": [],
   "source": {
    "fichier": "methodes/Fiche methode - Tableau a double entree.pdf",
    "page": 1
   }
  },
  {
   "id": "methode-tableau-f2",
   "notion": "Lire une case",
   "titre": "Le croisement d'un rang et d'une colonne",
   "texte": "Chaque case se trouve au croisement d'un rang et d'une colonne : elle contient la donnée qui correspond aux deux à la fois. Une case peut contenir plusieurs lignes d'écriture.",
   "pointsCles": [
    "Case = croisement d'un rang et d'une colonne",
    "Une case peut avoir plusieurs lignes"
   ],
   "dates": [],
   "lieux": [],
   "personnages": [],
   "vocabulaire": [
    {
     "mot": "case",
     "def": "le petit rectangle au croisement d'un rang et d'une colonne"
    }
   ],
   "schema": "methode-tableau-s1",
   "prerequis": [
    "methode-tableau-f1"
   ],
   "source": {
    "fichier": "methodes/Fiche methode - Tableau a double entree.pdf",
    "page": 1
   }
  },
  {
   "id": "methode-tableau-f3",
   "notion": "Les deux entrées",
   "titre": "Entrée 1 et entrée 2",
   "texte": "Les deux critères s'appellent les entrées. L'une se lit dans la première colonne, en tête de chaque rang ; l'autre se lit dans la première ligne, en tête de chaque colonne. Chaque valeur d'une entrée forme une catégorie.",
   "pointsCles": [
    "Une entrée = un critère",
    "Chaque valeur d'une entrée = une catégorie"
   ],
   "dates": [],
   "lieux": [],
   "personnages": [],
   "vocabulaire": [
    {
     "mot": "entrée",
     "def": "l'un des deux critères qui organisent le tableau"
    },
    {
     "mot": "catégorie",
     "def": "un groupe de données qui ont la même valeur pour un critère"
    }
   ],
   "schema": "methode-tableau-s1",
   "prerequis": [
    "methode-tableau-f1"
   ],
   "source": {
    "fichier": "methodes/Fiche methode - Tableau a double entree.pdf",
    "page": 1
   }
  }
 ],
 "schemas": [
  {
   "id": "methode-tableau-s1",
   "legende": "Un tableau à double entrée : l'entrée 1 en tête des rangs, l'entrée 2 en tête des colonnes.",
   "svg": "<svg viewBox='0 0 520 220' xmlns='http://www.w3.org/2000/svg' font-family='Georgia,serif' font-size='13' fill='#2e2419'><rect x='120' y='40' width='380' height='160' fill='#fbf6ea' stroke='#2e2419' stroke-width='2'/><rect x='120' y='40' width='380' height='32' fill='#b08d3a' opacity='.45'/><rect x='120' y='40' width='95' height='160' fill='#4f6b32' opacity='.25'/><g stroke='#2e2419'><line x1='215' y1='40' x2='215' y2='200'/><line x1='310' y1='40' x2='310' y2='200'/><line x1='405' y1='40' x2='405' y2='200'/><line x1='120' y1='72' x2='500' y2='72'/><line x1='120' y1='115' x2='500' y2='115'/><line x1='120' y1='158' x2='500' y2='158'/></g><g text-anchor='middle'><text x='262' y='61'>colonne A</text><text x='357' y='61'>colonne B</text><text x='452' y='61'>colonne C</text><text x='167' y='98'>rang 1</text><text x='167' y='141'>rang 2</text><text x='167' y='184'>rang 3</text></g><rect x='310' y='115' width='95' height='43' fill='none' stroke='#9a4a32' stroke-width='3'/><text x='357' y='141' text-anchor='middle' fill='#9a4a32'>case B2</text><text x='310' y='24' text-anchor='middle'>entrée 2 (en tête des colonnes)</text><text x='10' y='140' >entrée 1</text><text x='10' y='156'>(en tête</text><text x='10' y='172'>des rangs)</text></svg>"
  }
 ],
 "questions": [
  {
   "id": "methode-tableau-q1",
   "fiche": "methode-tableau-f1",
   "type": "qcm",
   "niveau": 1,
   "enonce": "Quand fait-on un tableau à double entrée ?",
   "choix": [
    "Quand les données dépendent d'au moins deux critères",
    "Quand les données dépendent d'un seul critère",
    "Quand on n'a qu'une seule donnée à noter dans le tableau",
    "Quand les données n'ont aucun critère"
   ],
   "explication": "Double entrée, deux critères : l'un en rangs, l'autre en colonnes.",
   "source": {
    "fichier": "methodes/Fiche methode - Tableau a double entree.pdf",
    "page": 1
   },
   "r": "KBDSX0p7aYAFFkkCycREFZwHAEgAS1hIKEQFZBgCCgADC4esRUkBUAcrBwxBn0gFQFkTLgwBcMSZ",
   "poids": 1
  },
  {
   "id": "methode-tableau-q2",
   "fiche": "methode-tableau-f1",
   "type": "vrai_faux",
   "niveau": 1,
   "enonce": "Dans un tableau à double entrée, les deux critères sont rangés en colonnes.",
   "corrections": [
    "Faux : un critère est rangé en lignes (les rangs), l'autre en colonnes.",
    "Faux : les deux critères sont rangés en lignes.",
    "Faux : il n'y a qu'un seul critère, rangé en colonnes."
   ],
   "explication": "C'est ce qui fait la double entrée : un critère par direction.",
   "source": {
    "fichier": "methodes/Fiche methode - Tableau a double entree.pdf",
    "page": 1
   },
   "r": "==gEQZEMItwWCJAAFY0BXc2FHEBAQ4kAP5VQwo0CU9lTcMgCBJFNXshAc0RSAogUBDoSLQ1XOtRFDk0F1ottRwxAK4UAHgUeN0BQMhSTcR0Bd4iBWAwBDYQDN5VDwEEBTdBTGcAFfAFP",
   "poids": 1
  },
  {
   "id": "methode-tableau-q3",
   "fiche": "methode-tableau-f1",
   "type": "qcm",
   "niveau": 2,
   "enonce": "Pourquoi un tableau à double entrée est-il pratique pour classer des données ?",
   "choix": [
    "On retrouve chaque donnée par son rang et sa colonne",
    "Toutes les données tiennent dans une seule et même case",
    "On n'a plus besoin d'écrire les catégories",
    "On peut y ranger des données sans aucun critère"
   ],
   "explication": "Chaque donnée a sa case, repérée par son rang et sa colonne. On la retrouve d'un coup d'œil.",
   "source": {
    "fichier": "methodes/Fiche methode - Tableau a double entree.pdf",
    "page": 1
   },
   "r": "==wDAs1QBMQCFk0E0IVAAUlFH8QHSZALeV0RM5xTD8sqckSHRUEEEgxDHEBSmsFEa9lGKQhRH0TZ",
   "poids": 1
  },
  {
   "id": "methode-tableau-q4",
   "fiche": "methode-tableau-f1",
   "type": "qcm",
   "niveau": 2,
   "enonce": "Comment appelle-t-on les lignes horizontales d'un tableau à double entrée ?",
   "choix": [
    "Les rangs",
    "Les colonnes",
    "Les cases",
    "Les entrées"
   ],
   "explication": "Les lignes horizontales sont les rangs. Les bandes verticales sont les colonnes.",
   "source": {
    "fichier": "methodes/Fiche methode - Tableau a double entree.pdf",
    "page": 1
   },
   "r": "=8gFSN0DdYUFM4TZ",
   "poids": 1
  },
  {
   "id": "methode-tableau-q11",
   "fiche": "methode-tableau-f1",
   "type": "vrai_faux",
   "niveau": 2,
   "enonce": "Un tableau à double entrée ne peut pas avoir plus de deux colonnes.",
   "corrections": [
    "Faux : il peut en avoir bien plus, une par catégorie, en plus de la première colonne.",
    "Faux : il doit toujours avoir exactement trois colonnes.",
    "Faux : il n'a pas de colonnes, seulement des rangs."
   ],
   "explication": "On fait une colonne par catégorie de l'entrée rangée en colonnes. Un tableau de recette peut ainsi avoir une colonne par ingrédient.",
   "source": {
    "fichier": "methodes/Fiche methode - Tableau a double entree.pdf",
    "page": 1
   },
   "r": "T0ESDcAHo4hGGUFFbYMrbUgJfVRFMJwTDIQSBIjHFU0GUkkQKshGsoEz2n1DMYEFIIwZXsBEV1lGbMgAI1CSMcVDcYQCQggUpcRVRAAFZ40AbgUeN0BQMhSTcR0Bd4iBWAwBDYQDN5VDwEEBTdBTGcAFfAFP",
   "poids": 1
  },
  {
   "id": "methode-tableau-q12",
   "fiche": "methode-tableau-f1",
   "type": "qcm",
   "niveau": 3,
   "enonce": "Lequel de ces classements demande un tableau à double entrée ?",
   "choix": [
    "Les notes de chaque élève dans chaque matière",
    "La liste des prénoms de tous les élèves de la classe",
    "Le nombre total d'élèves de la classe",
    "Le prénom de l'élève le plus jeune"
   ],
   "explication": "Les notes dépendent de deux critères : l'élève et la matière. Un critère se range en rangs, l'autre en colonnes.",
   "source": {
    "fichier": "methodes/Fiche methode - Tableau a double entree.pdf",
    "page": 1
   },
   "r": "=00AUEcsuYAFIUFFc8hDaswYetAVJ5kCQ4sqe4esVBAAAggBMIVDn0gFQlVABYUFM4TZ",
   "poids": 1
  },
  {
   "id": "methode-tableau-q13",
   "fiche": "methode-tableau-f1",
   "type": "qcm_multiple",
   "niveau": 2,
   "enonce": "Coche les cas où un tableau à double entrée est utile.",
   "choix": [
    "Les ingrédients d'un gâteau selon le nombre de personnes",
    "Les ventes de chaque fruit, jour après jour",
    "Les buts de chaque joueur à chaque match",
    "La température d'aujourd'hui, à midi",
    "Le prénom d'une seule personne"
   ],
   "explication": "Dans ces trois cas, chaque donnée dépend de deux critères à la fois. Une seule température ou un seul prénom ne demandent pas de tableau.",
   "source": {
    "fichier": "methodes/Fiche methode - Tableau a double entree.pdf",
    "page": 1
   },
   "r": "ocUHS0xDCIVD2wFBd5kTPXqRbcgIHoxDVRBHf4gGLMGSBUhXaoBBGpxFLAVWHdABGQwTBAMgfVBVNwhGJwQSeNzGAcxERxwGeMBAg0AAR1QHKIBCMQwZBARKX11SdoAHGwiXXAVXOpgAGxAAl8hGLUFFF4UAdQgJeVEQMtwGEXqDSlyBSFQVC0BAKsBDq7+FSN0BPVxAlAFH",
   "poids": 1
  },
  {
   "id": "methode-tableau-q14",
   "fiche": "methode-tableau-f1",
   "type": "trou",
   "niveau": 1,
   "enonce": "Complète la phrase.",
   "texte": "Dans un tableau à double entrée, les lignes horizontales s'appellent les ___ et les bandes verticales les ___.",
   "banque": [
    "rangs",
    "colonnes",
    "cases",
    "entrées"
   ],
   "explication": "Un critère est organisé en rangs, à l'horizontale, et l'autre en colonnes, à la verticale. Les cases sont à leurs croisements.",
   "source": {
    "fichier": "methodes/Fiche methode - Tableau a double entree.pdf",
    "page": 1
   },
   "r": "whzFetQAIkQBdQCUukEKTpxCBURAv8QSX4VCBcAFLlCH",
   "poids": 1
  },
  {
   "id": "methode-tableau-q5",
   "fiche": "methode-tableau-f2",
   "type": "qcm",
   "niveau": 2,
   "enonce": "Un tableau range les ventes d'un marché : les jours en rangs (lundi, mardi), les fruits en colonnes (pommes, poires). Où lis-tu les poires vendues mardi ?",
   "choix": [
    "Au croisement du rang « mardi » et de la colonne « poires »",
    "Au croisement du rang « poires » et de la colonne « mardi »",
    "Au croisement du rang « lundi » et de la colonne « poires »",
    "Au croisement du rang « mardi » et de la colonne « pommes »"
   ],
   "explication": "Une donnée se lit au croisement de son rang et de sa colonne. Ici, les jours sont en rangs et les fruits en colonnes.",
   "indice": "Suis le rang du jour, puis descends la colonne du fruit.",
   "source": {
    "fichier": "methodes/Fiche methode - Tableau a double entree.pdf",
    "page": 1
   },
   "r": "=cl33GlGL0xGHMTDOffDLEACJUQHkIFFJUFFN40GXgE+vXEXJxhDLYkwweWFbQwBRxhCPZgBmAEAGRUAdUgRcMTZ",
   "poids": 1
  },
  {
   "id": "methode-tableau-q6",
   "fiche": "methode-tableau-f2",
   "type": "vrai_faux",
   "niveau": 1,
   "enonce": "Une case d'un tableau à double entrée ne peut contenir qu'une seule ligne d'écriture.",
   "corrections": [
    "Faux : une case peut contenir plusieurs lignes d'écriture.",
    "Faux : une case doit rester vide.",
    "Faux : une case contient toujours un seul nombre."
   ],
   "explication": "Une case peut accueillir plusieurs lignes si la donnée le demande.",
   "source": {
    "fichier": "methodes/Fiche methode - Tableau a double entree.pdf",
    "page": 1
   },
   "r": "=oDUbBwBE0xBdERwAqQAV41CBEwDFIFNAAAAcIAHC8hUaoyQAE0QBwgRSwxF3IFEWQhEJtQAHgUeN0BQMhSTcR0Bd4iBWAwBDYQDN5VDwEEBTdBTGcAFfAFP",
   "poids": 1
  },
  {
   "id": "methode-tableau-q7",
   "fiche": "methode-tableau-f2",
   "type": "qcm",
   "niveau": 1,
   "enonce": "Comment trouver la bonne case pour ranger une donnée ?",
   "choix": [
    "Au croisement de son rang et de sa colonne",
    "Dans la première case libre du tableau",
    "Dans la première colonne, juste en tête du rang",
    "Dans le rang d'en-tête, sous le titre"
   ],
   "explication": "Chaque donnée correspond à une valeur de chaque critère. Leur croisement donne sa case.",
   "source": {
    "fichier": "methodes/Fiche methode - Tableau a double entree.pdf",
    "page": 1
   },
   "r": "=AFELshHFEADSlAMNAQUNohCGFwBTUjUbogBRxgCPZgBmAEAGRUAdUgRcMTZ",
   "poids": 1
  },
  {
   "id": "methode-tableau-q15",
   "fiche": "methode-tableau-f2",
   "type": "qcm",
   "niveau": 2,
   "enonce": "Dans un tableau de recette, la case du rang « 8 personnes » et de la colonne « Œufs » indique 4. Que signifie ce 4 ?",
   "choix": [
    "Il faut 4 œufs pour un gâteau de 8 personnes",
    "Il faut 8 œufs pour un gâteau de 4 personnes",
    "Le gâteau se prépare en 4 étapes",
    "Le tableau compte 4 colonnes"
   ],
   "explication": "Une case répond aux deux critères à la fois : la taille du gâteau et l'ingrédient. Ce 4, ce sont les œufs d'un gâteau pour 8 personnes.",
   "source": {
    "fichier": "methodes/Fiche methode - Tableau a double entree.pdf",
    "page": 1
   },
   "r": "EpxFpwhGWcAFZ40VS1wJNABVIpRzlGQScIjUHAhGBkUHJcw+G2QUVk1GOAgRFsTZ",
   "poids": 1
  },
  {
   "id": "methode-tableau-q16",
   "fiche": "methode-tableau-f2",
   "type": "qcm",
   "niveau": 3,
   "enonce": "Un tableau a 4 rangs et 5 colonnes de données, sans compter les en-têtes. Combien de cases de données compte-t-il ?",
   "choix": [
    "20",
    "9",
    "30",
    "25"
   ],
   "explication": "Chaque rang croise chaque colonne : 4 × 5 = 20 cases. C'est le cas d'un tableau de recette pour 4 tailles de gâteau et 5 ingrédients.",
   "source": {
    "fichier": "methodes/Fiche methode - Tableau a double entree.pdf",
    "page": 1
   },
   "r": "==ARZBUZ",
   "poids": 1
  },
  {
   "id": "methode-tableau-q17",
   "fiche": "methode-tableau-f2",
   "type": "vrai_faux",
   "niveau": 2,
   "enonce": "La donnée d'une case dépend seulement de son rang, pas de sa colonne.",
   "corrections": [
    "Faux : elle dépend à la fois de son rang et de sa colonne.",
    "Faux : elle dépend seulement de sa colonne.",
    "Faux : elle ne dépend ni de son rang ni de sa colonne."
   ],
   "explication": "Une case est au croisement d'un rang et d'une colonne. Sa donnée correspond donc aux deux critères à la fois.",
   "source": {
    "fichier": "methodes/Fiche methode - Tableau a double entree.pdf",
    "page": 1
   },
   "r": "PUGXQswGeUQAMIVCw0AAR1gGKYUAHMRNSthCGEFDK8UABwySFRVQO9cpG1AHiIA3mGRUMIwAXgUeN0BQMhSTcR0Bd4iBWAwBDYQDN5VDwEEBTdBTGcAFfAFP",
   "poids": 1
  },
  {
   "id": "methode-tableau-q18",
   "fiche": "methode-tableau-f2",
   "type": "qcm",
   "niveau": 2,
   "enonce": "Dans un tableau à double entrée, que range-t-on dans les cases ?",
   "choix": [
    "Les données",
    "Les critères",
    "Les entrées",
    "Les titres des colonnes"
   ],
   "explication": "Les cases accueillent les données. Les critères et leurs catégories sont écrits en tête des rangs et des colonnes.",
   "source": {
    "fichier": "methodes/Fiche methode - Tableau a double entree.pdf",
    "page": 1
   },
   "r": "=A1GmQopbNUALYUFM4TZ",
   "poids": 1
  },
  {
   "id": "methode-tableau-q19",
   "fiche": "methode-tableau-f2",
   "type": "qcm_multiple",
   "niveau": 3,
   "enonce": "Dans un tableau de recette, les tailles de gâteau sont en rangs et les ingrédients en colonnes. Coche ce qu'on trouve dans des cases de données.",
   "choix": [
    "150 g",
    "75 g",
    "Eau de fleur d'oranger : 1 cc",
    "Farine",
    "4 personnes"
   ],
   "explication": "Les quantités sont des données : elles vont dans les cases, parfois sur deux lignes. « Farine » et « 4 personnes » sont des catégories, écrites en tête des colonnes et des rangs.",
   "source": {
    "fichier": "methodes/Fiche methode - Tableau a double entree.pdf",
    "page": 1
   },
   "r": "7sUEkIFRF9UUbsACckQMCJUUNwhGDowDSJiFVBBF0skQNVBS2pxRZ8QCPZ1UYBFH",
   "poids": 1
  },
  {
   "id": "methode-tableau-q8",
   "fiche": "methode-tableau-f3",
   "type": "qcm",
   "niveau": 2,
   "enonce": "Dans un tableau à double entrée, comment appelle-t-on chacun des deux critères ?",
   "choix": [
    "Une entrée",
    "Une catégorie",
    "Une case",
    "Un rang"
   ],
   "explication": "Les deux critères sont l'entrée 1 et l'entrée 2, d'où le nom « double entrée ». Une catégorie n'est qu'une des valeurs d'une entrée.",
   "source": {
    "fichier": "methodes/Fiche methode - Tableau a double entree.pdf",
    "page": 1
   },
   "r": "==gSmQopHlFAKY0AHcSZ",
   "poids": 1
  },
  {
   "id": "methode-tableau-q9",
   "fiche": "methode-tableau-f3",
   "type": "vrai_faux",
   "niveau": 1,
   "enonce": "Chaque valeur d'une entrée forme une catégorie.",
   "corrections": [],
   "explication": "Oui : chaque titre de rang ou de colonne est une catégorie.",
   "source": {
    "fichier": "methodes/Fiche methode - Tableau a double entree.pdf",
    "page": 1
   },
   "r": "==ASBJgGIw1ScgyGBYAEDsRAMAFRmg1FBdBTGcAFfAFP",
   "poids": 1
  },
  {
   "id": "methode-tableau-q10",
   "fiche": "methode-tableau-f3",
   "type": "association",
   "niveau": 2,
   "enonce": "Relie chaque mot à sa place dans le tableau à double entrée.",
   "gauche": [
    "Entrée 1",
    "Entrée 2",
    "Case",
    "Catégorie"
   ],
   "droite": [
    "Croisement d'un rang et d'une colonne",
    "Lue en tête des rangs",
    "Une valeur d'une entrée",
    "Lue en tête des colonnes"
   ],
   "explication": "Une entrée en tête des rangs, l'autre en tête des colonnes. Les cases sont aux croisements.",
   "source": {
    "fichier": "methodes/Fiche methode - Tableau a double entree.pdf",
    "page": 1
   },
   "r": "==ANvUnXG5TWsklQdlCRe4RSEYnQyclSZlCH",
   "poids": 1
  },
  {
   "id": "methode-tableau-q20",
   "fiche": "methode-tableau-f3",
   "type": "association",
   "niveau": 3,
   "enonce": "Dans un tableau de recette, relie chaque élément à son rôle.",
   "gauche": [
    "La taille du gâteau",
    "Les ingrédients",
    "« 6 personnes »",
    "« 225 g »"
   ],
   "droite": [
    "Une catégorie de l'entrée 1",
    "L'entrée 2, lue en tête des colonnes",
    "Une donnée rangée dans une case",
    "L'entrée 1, lue en tête des rangs"
   ],
   "explication": "La taille du gâteau est l'entrée 1, les ingrédients l'entrée 2. « 6 personnes » est une catégorie de l'entrée 1, et « 225 g » une donnée rangée dans une case.",
   "source": {
    "fichier": "methodes/Fiche methode - Tableau a double entree.pdf",
    "page": 1
   },
   "r": "==ANvUnXG5TWsklQdlCRewRSEYnQyUlSZlCH",
   "poids": 1
  },
  {
   "id": "methode-tableau-q21",
   "fiche": "methode-tableau-f3",
   "type": "vrai_faux",
   "niveau": 2,
   "enonce": "Dans un tableau de recette, chaque ingrédient (œufs, farine, sucre) forme une catégorie de l'entrée « ingrédients ».",
   "corrections": [],
   "explication": "Les ingrédients forment l'une des deux entrées. Chacun d'eux, les œufs ou la farine par exemple, en est une catégorie.",
   "source": {
    "fichier": "methodes/Fiche methode - Tableau a double entree.pdf",
    "page": 1
   },
   "r": "==ASBJgGIw1ScgyGBYAEDsRAMAFRmg1FBdBTGcAFfAFP",
   "poids": 1
  },
  {
   "id": "methode-tableau-q22",
   "fiche": "methode-tableau-f3",
   "type": "vrai_faux",
   "niveau": 2,
   "enonce": "La première ligne du tableau, qui porte les titres des colonnes, s'appelle la case d'en-tête.",
   "corrections": [
    "Faux : on l'appelle le rang d'en-tête.",
    "Faux : on l'appelle la colonne d'en-tête.",
    "Faux : on l'appelle l'entrée 1."
   ],
   "explication": "La première ligne est le rang d'en-tête : elle porte les catégories rangées en colonnes. Les données viennent dans les rangs suivants.",
   "source": {
    "fichier": "methodes/Fiche methode - Tableau a double entree.pdf",
    "page": 1
   },
   "r": "UAVaXEwz2WARAoQVMMmSLQ1XOpgCGxgHrcRBVQhVF4UAdgUeN0BQMhSTcR0Bd4iBWAwBDYQDN5VDwEEBTdBTGcAFfAFP",
   "poids": 1
  },
  {
   "id": "methode-tableau-q23",
   "fiche": "methode-tableau-f3",
   "type": "qcm_multiple",
   "niveau": 3,
   "enonce": "Un tableau range les notes d'un élève : les trimestres en rangs, les matières en colonnes. Coche les catégories de l'entrée « matières ».",
   "choix": [
    "Français",
    "Histoire",
    "SVT",
    "Premier trimestre",
    "Deuxième trimestre"
   ],
   "explication": "Les matières sont l'entrée rangée en colonnes : le français, l'histoire et les SVT en sont les catégories. Les trimestres sont les catégories de l'autre entrée, écrite en tête des rangs.",
   "source": {
    "fichier": "methodes/Fiche methode - Tableau a double entree.pdf",
    "page": 1
   },
   "r": "wx0OwUzSeV2FHwgGFoxBnAFRh5FDUpYrBcAFvAFH",
   "poids": 1
  }
 ],
 "bonus": [],
 "nonCouvert": []
});
