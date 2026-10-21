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

Une fois 35 °C atteints, la puissance appelée est de 8,5 kW à J+1, 6,5 kW à J+3, 5,4 kW à J+7 et 4,3 kW à J+30.

> **Conseil : 12 kW, soit 2 poêles de 6 kW**, avec l'air neuf pris dans la pièce d'entrée ou par une double flux.
> Si l'air neuf est pris dehors sans récupération de chaleur, il faut 15 à 18 kW. Au-delà, la puissance ne sert à rien.
> Alimentation : 12 kW, c'est environ 17 A par phase en triphasé 400 V.

Le calage sur la grotte existante (9 kW pour un besoin de 2,2 à 5,4 kW) donne 13 à 14 kW. Il confirme le bas de la première estimation
par proportion (13 à 18 kW). Le facteur de surdimensionnement de l'existante est cependant un choix d'installateur, pas une donnée physique.

**Régulation maison** : elle permet la consigne de 35 °C et pilote les 2 poêles ensemble. Placer la sonde d'ambiance dans la salle haute,
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

**Déshumidificateur** : il faut retirer 1,0 à 1,6 kg/h en moyenne (≈ 36 L/24 h), et 2,4 kg/h en pointe si l'air neuf vient de la pièce d'entrée.

| Modèle | Cotes L × H × P | Capacité à 30 °C / 60 % (≈ à 35 °C / 45 %) | Place sur le mur est (1 667 mm) |
|---|---|---|---|
| **Microwell DRY 500 Silver + option TEV** (retenu) | 1 245 × 642 × 300 mm | 66 L/24 h (≈ 56 L, 2,3 kg/h) : couvre la pointe | 1 645 mm avec les 200 mm latéraux : passe à 11 mm près, mesurer le mur fini |
| Microwell DRY 400 Silver | 780 × 642 × 300 mm | 48 L/24 h (≈ 41 L, 1,7 kg/h) : besoin moyen seulement | 1 180 mm : passe large ; suffit si l'air neuf vient de dehors ou du frigidarium |
| Dantherm CDP 50 (alternative) | 1 160 × 770 × 326 mm | 53 L/24 h (≈ 45 L, 1,9 kg/h) | passe ; plage 10–36 °C seulement |

Choix : **DRY 500 Silver avec l'option TEV**, car la mesure de la grotte existante confirme le cas humide. Pose murale obligatoire,
≥ 200 mm libres sur les côtés et au-dessus, ≥ 150 mm au-dessous. Plage 22–42 °C avec l'option TEV, 22–35 °C sans. Le texte général
de la notice dit 22–35 °C : faire confirmer par écrit à Microwell le fonctionnement continu à 35 °C. Il rejette environ 3,5 kW dans la grotte.
Le raccorder en 230 V, avec une protection 16 A et un différentiel 30 mA, un câble 3G2,5, un interrupteur hors de la salle et une évacuation gravitaire Ø ≥ 18 mm.
Si le mur est fini fait moins de 1 645 mm, le poser sur le mur du fond de l'alcôve (2,52 m).

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
  ce qui va vers l'hypothèse basse du bilan (roche à environ 18 °C, besoin en régime établi d'environ 3 kW). Les 12 kW prévus sont largement suffisants.
  C'est à confirmer par la mesure de la roche et l'essai de co-chauffage.
- **Condensation actuelle.** Toute surface sous 14,3 °C se couvre d'eau. Vérifier au thermomètre infrarouge la voûte sous la route, le sol et les angles contre la roche.

À faire tout de suite :
1. Laisser les briques de sel dans leurs films. Ne pas les entreposer ouvertes dans la grotte.
2. Mettre en route le DH 60 dès qu'il est posé (il fonctionne de 5 à 40 °C), hygrostat vers 55–60 %, et chauffer à 22–25 °C si possible.
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
