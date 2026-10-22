# Grotte de sel — bilan thermique et humidité

Calcul du 12 octobre 2026, consigne **35 °C**, avec les conditions relevées sur place. Les valeurs sont des estimations
d'avant-projet (U des parois et température de la roche supposés) : à valider par l'essai de co-chauffage et le bureau d'études.

## 1. Données

| Élément | Valeur |
|---|---|
| Volume chauffé | 84,9 m³ : salle haute + partie basse + alcôve ouverte |
| Plafond / sol | 33,96 m² chacun |
| Murs de soutènement contre roche | 43,1 m² : côté transats, alcôve, côté des 3 fauteuils (nord et sud de la partie basse à confirmer) |
| Mur d'entrée | 6,53 m² opaques + 4,07 m² de double porte vitrée, vers une pièce à 26 °C / 75 % HR |
| Mur côté frigidarium | 9,32 m² de grosse brique + porte vitrée 0,80 m (1,68 m²), frigidarium à 15 °C / 80 % HR |
| Plafond | lames de bois sans isolant, sous la route goudronnée |
| Grotte existante (référence) | 5,90 × 2,80 × 1,88 m, 9 kW, 52 % HR mesurés à 40 °C |
| Matériel installé (21/10/2026) | 2 poêles de sauna de 9 kW = **18 kW** ; déshumidificateur **Dantherm DH 65** |
| Régulation | maison : thermostat d'ambiance qui pilote les contacteurs des 2 poêles |

## 2. Pertes paroi par paroi (cas central)

| Paroi | Surface | U (W/m²K) | Autre côté | Pertes |
|---|---|---|---|---|
| Plafond bois sous la route | 33,96 m² | 1,09 | 0 °C | 1,30 kW |
| Murs contre roche | 43,10 m² | 0,9 | 14 °C | 0,82 kW |
| Sol sur roche | 33,96 m² | 0,7 | 14 °C | 0,50 kW |
| Mur en brique côté frigidarium | 9,32 m² | 1,38 | 15 °C | 0,26 kW |
| Porte vitrée du frigidarium | 1,68 m² | 3,8 | 15 °C | 0,13 kW |
| Mur d'entrée (opaque) | 6,53 m² | 2,04 | 26 °C | 0,12 kW |
| Double porte vitrée d'entrée | 4,07 m² | 3,8 | 26 °C | 0,14 kW |
| Ponts thermiques (hors roche et sol) | | | | 0,19 kW |
| Air neuf de la pièce d'entrée (≈ 300 m³/h) | | | 26 °C | 0,9 à 1,0 kW |
| Stratification (air plus chaud sous le plafond) | | | | 0,15 à 0,35 kW |

**Besoin en régime établi : 3,0 kW (bas), 4,9 kW (central), 7,5 kW (haut).**
Le plafond est le premier poste, avec un tiers des pertes.

## 3. Puissance à installer

Le besoin en régime établi ne fixe pas la puissance. Elle est fixée par la **mise en chauffe** : la roche et le sel absorbent la chaleur pendant des jours.

| Puissance installée | Montée de 14 à 35 °C (cas central) |
|---|---|
| 6 kW | 137 h |
| 8 kW | 38 h |
| 10 kW | 12 h |
| **12 kW** | **3,8 h** |
| 15 kW | 0,5 h (l'air seulement, les parois restent froides) |
| **18 kW (installés)** | **moins de 0,5 h pour l'air** ; les parois suivent au même rythme qu'avec 12 à 15 kW |

Une fois 35 °C atteints, la puissance appelée est de 8,5 kW à J+1, 6,5 kW à J+3, 5,4 kW à J+7 et 4,3 kW à J+30.

> **Conseil du 12/10 : 12 kW, soit 2 poêles de 6 kW**, avec l'air neuf pris dans la pièce d'entrée ou par une double flux.
> Si l'air neuf est pris dehors sans récupération de chaleur, il faut 15 à 18 kW. Au-delà, la puissance ne sert à rien.
>
> **Installé : 2 × 9 kW = 18 kW.** C'est le haut de la fourchette, donc pas de manque de puissance, même avec l'air neuf pris dehors
> sans récupération (300 m³/h d'air à −5 °C demandent 3,8 kW). En régime établi (3 à 7,5 kW), **un seul poêle suffit** : voir la régulation ci-dessous.
> Alimentation : 18 kW, c'est environ 26 A par phase en triphasé 400 V (13 A par poêle), avec une protection et un contacteur par poêle.

Le calage sur la grotte existante (9 kW pour un besoin de 2,2 à 5,4 kW) donne 13 à 14 kW. Il confirme le bas de la première estimation
par proportion (13 à 18 kW). Le facteur de surdimensionnement de l'existante est cependant un choix d'installateur, pas une donnée physique.

**Régulation maison** : elle permet la consigne de 35 °C. Avec 18 kW pour 3 à 7,5 kW de besoin, piloter en **2 étages** :
un poêle en base sur la consigne, le second en relance seulement (consigne − 2 °C, mise en chauffe et retour de réduit), en alternant les poêles
chaque semaine pour user également les résistances. Différentiel d'au moins 1 K et temps minimal de marche et d'arrêt pour ménager les contacteurs.
Sinon, les 18 kW en tout ou rien font osciller la température et stratifient l'air chaud sous le plafond de la partie basse. Placer la sonde d'ambiance dans la salle haute,
pas dans le panache au-dessus des poêles. Garder la sécurité : sur beaucoup de poêles, le limiteur de surchauffe à réarmement manuel est
dans le boîtier sonde du régulateur d'origine. Sans ce régulateur, il faut un limiteur homologué par poêle, sonde au-dessus du poêle
à l'emplacement prévu par la notice, en série sur les contacteurs, plus une minuterie de coupure. Faire valider le schéma par le bureau de contrôle.

**Régime de chauffe** : chauffer en permanence, avec un réduit de nuit d'au moins 30 °C. Après un arrêt, il faut 8 à 10 kW pendant 1 à 3 jours.
**Confort** : à 35 °C d'air, les parois lourdes restent à 27–29,5 °C, et la température ressentie n'est que d'environ 31–32 °C.
Pour ressentir 35 °C, comme les 40 °C d'air de l'existante, il faudrait 38 à 40 °C d'air, soit 15 à 25 % de besoin en plus.

## 4. Humidité

Points de rosée à 35 °C : 19,4 °C à 40 % HR, **21,3 °C à 45 % HR**, 23,0 °C à 50 % HR.
Le sel devient humide (déliquescence) au-delà de 75 % HR.

| Origine de l'air neuf | Humidité en séance à 35 °C, sans déshumidificateur |
|---|---|
| Pièce d'entrée (26 °C / 75 %) | 52 à 63 % : **trop humide**. Cet air est déjà à 45 % une fois chauffé. |
| Frigidarium (15 °C / 80 %) | 35 à 44 % : correct |
| Extérieur en hiver | 24 à 33 % : sec |
| Extérieur en été | 45 à 53 % |

**Les 52 % de la grotte existante, mesurés à 40 °C** : 26 g d'eau par kg d'air, **point de rosée 28 °C**, soit l'équivalent de 68 % HR ramené à 35 °C.
C'est une grotte très humide : toute surface sous 28 °C y condense (vitrages, angles, dos des briques de sel).
C'est exactement le cas calculé avec l'air de la pièce d'entrée et peu de renouvellement (6 personnes avec 150 m³/h de cet air donnent 50 % à 40 °C).
À ne pas reproduire : la nouvelle grotte doit être déshumidifiée.

**Besoin de déshumidification** : il faut retirer 1,0 à 1,6 kg/h en moyenne (≈ 36 L/24 h), et 2,4 kg/h en pointe (14 curistes)
si l'air neuf vient de la pièce d'entrée.

**Appareil installé : Dantherm DH 65** (notice DAN-BA-DH20-DH35-DH35H-DH65-DH65H), mural, au mur est de l'alcôve.

| | DH 65 |
|---|---|
| Cotes | 1 306 × 720 × 265 mm, 76 kg, sur mur brique ou béton |
| Dégagements (notice) | 300 mm dessus, 300 mm dessous, 200 mm sur les côtés, 500 mm devant, « par rapport aux murs et aux objets » |
| Air | aspiré par toute la face inférieure (filtre), soufflé vers le haut ; 800 m³/h ; 48 dB(A) à 1 m |
| Plage | 5 à 40 °C ; enveloppe (notice p. 36) : 40–80 % HR jusqu'à 35 °C, puis HR maxi 80 − 8 × (T − 35), soit 72 % à 36 °C, 64 % à 37 °C, 56 % à 38 °C, 48 % à 39 °C, 40 % à 40 °C ; réglage 40 à 80 % HR |
| Capacité | 45,8 L/24 h à 30 °C / 60 % (publié) ; **≈ 32 L/24 h (30 à 34), soit 1,33 kg/h, à 35 °C / 45 %** (même point de rosée, valeur extrapolée, non publiée) |
| Électricité | 230 V, 1,263 kW et 5,3 A maxi, aucun câble fourni, DDR obligatoire ; IPX2 ; R-454C (A2L), 850 g |
| Chaleur rejetée dans la grotte | ≈ 2,1 kW (1,2 kW électrique + 0,9 kW de chaleur de condensation) |

**Humidité d'équilibre avec le DH 65** (calcul vérifié : l'air neuf assèche la grotte dès qu'elle dépasse la teneur en eau de l'air entrant) :

| Air neuf (300 m³/h) | Moyenne (1,5 kg/h) | Pointe (2,4 kg/h) |
|---|---|---|
| Pièce d'entrée (26 °C / 75 %) | **≈ 46 % HR** | **≈ 51 % HR** (point de rosée 23,4 °C) |
| Dehors, été humide (26 °C / 70 %) | ≈ 44 % HR | ≈ 49 % HR |
| Dehors, hiver (≈ 5 g/kg) | 26 % HR sans le DH | 33 % HR sans le DH : l'appareil ne tourne pas |
| Pour mémoire, sans déshumidificateur, air de la pièce d'entrée | 57 % HR | 64 % HR |

Lecture :
- Le DH 65 tient la moyenne (≈ 46 %, pour 45 % visés) mais pas tout à fait la pointe (≈ 51 %). Les deux restent loin du seuil du sel (75 %).
- À 51 %, toute surface sous 23,4 °C condense : porte vitrée du frigidarium en simple vitrage, vide du plafond. Ce sont les points du § 5, déjà à traiter.
- Prendre l'air neuf dehors règle presque tout : en hiver l'air extérieur assèche seul, et l'été humide reste sous 50 %.
- Le DH 60 aurait eu environ 1,5 fois cette capacité (48,8 L/24 h à 35 °C / 45 %). Avec le DH 65, pour tenir 45 % en pointe, il faut l'air neuf dehors ou un appoint d'environ 1 kg/h.
- Réglage : hygrostat sur 45 %. Il ne descend pas sous 40 %, ce qui convient.

**Séances de 35 à 40 °C** : la plage du DH 65 se resserre au-dessus de 35 °C.

| Air de la séance | HR maxi admise par le DH 65 | Grotte sans DH (air neuf de la pièce d'entrée), moyenne / pointe | Verdict |
|---|---|---|---|
| 35 °C | 80 % | 57 % / 64 % | dans la plage |
| 37 °C | 64 % | 51 % / 57 % | dans la plage |
| 38 °C | 56 % | 48 % / 54 % | dans la plage, juste en pointe |
| 39 °C | 48 % | 46 % / 51 % | hors plage en pointe |
| 40 °C | 40 % | 43 % / 49 % | **hors plage** : l'hygrostat ne descend pas sous 40 %, l'appareil ne peut tourner qu'en dehors de sa plage |

- À 40 °C, la même quantité d'eau donne une HR plus basse (43 à 49 %), mais le point de rosée reste de 25 à 27 °C. C'est la situation de la grotte existante (52 % à 40 °C).
- Hors plage, l'appareil se met en défaut : voyant d'état irrégulier, compresseur arrêté, cause « température ambiante » ou « pression du circuit ».
- Conduite à tenir si l'on fait des séances à 40 °C : couper le DH 65 par la régulation au-dessus de 38 °C, mesuré à son aspiration (à 0,28 m du sol, l'air y est plus frais que dans la salle haute), et le faire tourner avant et après, pendant le réduit et les séances à 35 °C.
  L'air neuf pris dehors devient alors le vrai moyen de sécher : en hiver, 20 à 25 % HR à 40 °C sans déshumidificateur.

**Pose dans l'alcôve** :
- Largeur : 1 306 + 2 × 200 = 1 706 mm pour 1 667 mm d'alcôve. Le mur est continue jusqu'au tableau de l'ouverture (1 758 mm en tout) :
  l'appareil est à 0,22 m du mur sud et à 0,24 m du bout du mur, et son dégagement nord déborde de 55 mm dans le tableau. Rien ne doit être fixé là.
- Hauteur : la zone 2 de la NF C 15-100-7-703 s'arrête à 1,0 m. Avec 300 mm dessous, le dessus arrive à 1,02 m.
  Modélisé à 280 mm du sol, dessus à 1,00 m : il faut l'accord écrit de Dantherm pour 280 mm. Sinon, pose à 300 mm et dessus à 1,02 m, à faire accepter par le bureau de contrôle.
- Habillage : pas de caisson fermé, la notice demandant 30 cm libres dessus et dessous et 50 cm devant les objets. Il faut un écran bois à claire-voie,
  posé au sol à 50 cm devant l'appareil (0,785 m du mur), du mur sud jusqu'à l'ouverture, haut de 1,32 m, ouvert dessus, sans joue côté ouverture,
  en 3 panneaux démontables. La section libre est de 0,92 m² pour 0,11 m² nécessaires. Il reste 1,49 m de passage jusqu'au banc ouest.
- Raccordement : circuit dédié 16 A, DDR 30 mA, interrupteur hors de la salle, câble sous 1,0 m. Condensats ≈ 1,3 kg/h vers un siphon.
- **Indice de protection IPX2 : non conforme.** La NF C 15-100-7-703 s'applique à toute la grotte dès qu'elle contient un poêle de sauna, et exige IP24
  pour tout le matériel, zone 2 comprise (703.512.2). Voir CONTROLES.md, NOK 1 quater.

## 5. Risques de condensation

1. **Plafond bois sous la route : priorité 1.** Dans le vide au-dessus des lames, la voûte est à 18–23 °C en hiver, sous le point de rosée
   de la grotte. La condensation y serait cachée : bois et solives pourris, sel dissous. Si des poutrelles acier sous la chaussée existent, elles rouilleraient.
   Les stalactites de la voûte du frigidarium montrent que l'eau traverse déjà les voûtes. Dans l'ordre : sonder la voûte, traiter
   les infiltrations côté route, puis poser un isolant non sensible à l'eau et un pare-vapeur continu (Sd ≥ 100 m), refermer le vide, et reposer les lames.
   Gain : 1 à 1,8 kW.
2. **Murs contre roche** : pas de condensation en régime établi (surface à 30–32 °C). Le risque apparaît à la mise en chauffe et à l'arrêt,
   d'où le chauffage permanent. Avant le parement de sel, vérifier qu'aucune eau ne ruisselle.
3. **Porte vitrée du frigidarium** : en simple vitrage, la face côté grotte est à environ 25 °C. Elle condense au-delà de 50 à 57 % HR.
   Le double vitrage est conseillé. Le verre trempé est obligatoire, car les poêles sont juste à côté.
4. **Mur en brique côté frigidarium** : pas de condensation dans la brique (méthode de Glaser).
5. **Pression** : mettre la grotte en légère dépression (extraction 5 à 10 % au-dessus du soufflage), jamais en surpression.
6. **Frigidarium** : il reçoit 0,4 à 0,9 kW de la grotte. Vérifier qu'il tiendra 15 °C.

## 5 bis. Mesure sur place du 21 octobre 2026 (grotte non chauffée)

| | Température | HR | Point de rosée | Eau dans l'air |
|---|---|---|---|---|
| Grotte, sans chauffage | 18,6 °C | 76 % | 14,3 °C | 10,8 g/kg |
| Dehors (AROME Meteociel, après-midi) | 3 à 5 °C | 85 à 98 % | 2 à 4 °C | ≈ 5 g/kg |
| Cible en séance | 35 °C | 45 % | 21,3 °C | 17,0 g/kg |

Lecture :
- **Seuil du sel dépassé.** À 76 % HR, l'air est au-dessus du seuil de 75 % où le sel (NaCl) commence à absorber l'eau.
  Les briques de sel stockées dans la grotte doivent rester emballées et fermées, et il ne faut pas monter les murs de sel avant que la pièce soit tenue sous 60 %.
- **L'eau ne vient pas de dehors.** L'air de la grotte contient deux fois plus d'eau que l'air extérieur. L'humidité vient donc de l'intérieur :
  - séchage des travaux récents (chape, enduits, jointoiement à la chaux) ;
  - roche et murs contre terre ;
  - air humide des locaux voisins (la pièce d'entrée à 26 °C / 75 % contient 16,9 g/kg).
  Une seule mesure ne permet pas de faire la part de chaque source : il faut un enregistreur sur une semaine.
- **Chauffée à 35 °C, cette même eau ne donnerait que 29 % HR.** L'humidité propre de la pièce ne gênera pas l'exploitation.
  Le besoin de déshumidification viendra des curistes et de l'air neuf. L'air extérieur d'aujourd'hui, réchauffé à 35 °C, ne ferait que 12 à 14 % HR :
  cela confirme qu'il faut prendre l'air neuf dehors (double flux) et non dans la pièce d'entrée.
- **Le chauffage seul assèche vite.** À 19 °C, l'air passe sous 75 % ; à 22,5 °C, sous 60 % ; à 30 °C (réduit de nuit), il est à 38 %.
- **Pièce tempérée sans chauffage.** Elle reste à 18,6 °C quand il fait 3 à 5 °C dehors. La roche et les locaux voisins la tiennent donc chaude,
  ce qui va vers l'hypothèse basse du bilan (roche à environ 18 °C, besoin en régime établi d'environ 3 kW). Les 18 kW installés sont largement suffisants.
  C'est à confirmer par la mesure de la roche et l'essai de co-chauffage.
- **Condensation actuelle.** Toute surface sous 14,3 °C se couvre d'eau. Vérifier au thermomètre infrarouge la voûte sous la route, le sol et les angles contre la roche.

À faire tout de suite :
1. Laisser les briques de sel dans leurs films. Ne pas les entreposer ouvertes dans la grotte.
2. Mettre en route le DH 65 dès qu'il est posé (il fonctionne de 5 à 40 °C), hygrostat vers 55–60 %, et chauffer à 22–25 °C si possible.
   Cela accélère aussi le séchage de la chape. L'eau à retirer vient surtout des matériaux : l'air de la grotte n'en contient que 0,2 kg au-dessus de 60 % HR.
3. Avant le collage du Florafloor, mesurer l'humidité de la chape à la bombe à carbure (CM).
4. Poser un enregistreur température + humidité pendant au moins 7 jours, et relever la météo extérieure sur la même période.

## 6. Mesures à faire

- **Grotte existante** : enregistreur de température et d'humidité au pas de 5 min sur 7 jours (séances et nuits), et relevé des kWh des poêles.
- **Nouvelle grotte, avant de commander les poêles** : essai de co-chauffage de 7 à 14 jours avec 6 à 9 kW de radiateurs provisoires et des brasseurs d'air.
  On relève les kWh, l'air et les températures de surface. On en tire le coefficient de déperdition réel.
- **Roche** : sonde dans un forage de 0,5 à 1 m, en hiver. La roche est peut-être plus chaude dans une ville thermale.
- **Plafond** : sondage de la voûte (épaisseur, poutrelles, teneur en eau), inspection après une forte pluie.
- **Murs contre roche** : humidimètre à 3 hauteurs et caméra thermique après la pluie. Confirmer que les murs nord et sud de la partie basse sont contre la roche.
- **Menuiseries** : simple ou double vitrage, rupture de pont thermique, surface réelle de la verrière cintrée.
- **Pièce d'entrée et frigidarium** : enregistrement sur 7 jours.
- **Ventilation** : faire fixer le débit hygiénique par le bureau de contrôle (18 à 25 m³/h par personne). Demander les exigences du fabricant des poêles.
- **Alcôve** : hauteur sous voûte contre le mur est, et longueur du mur fini.
