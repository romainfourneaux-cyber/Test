# Grotte de sel — DH 65 contre TTR 500 D

Comparatif du 22 octobre 2026. Données lues dans les notices (Dantherm DAN-BA-DH20-DH35-DH35H-DH65-DH65H, Trotec TRT-BA-TTR400-400D-500D-TC-004-FR)
et calculs vérifiés. « Estimé » = calcul, pas une donnée du fabricant. Détail des calculs : [BILAN_THERMIQUE.md](BILAN_THERMIQUE.md) et [CONTROLES.md](CONTROLES.md).

| Critère | **Dantherm DH 65** | **Trotec TTR 500 D** |
|---|---|---|
| Principe | frigorifique, mural | adsorption (roue au gel de silice), gainable |
| Emplacement | dans la grotte, mur est de l'alcôve, derrière un écran bois à claire-voie | hors de la grotte : local technique, ou dehors sous abri / caisson Trotec (référence et prix à demander) ; aucun IP publié |
| Coût | déjà acheté | 3 751 € TTC (airchaud-diffusion.fr) à 4 688 € TTC (fr.trotec.com), plus boîte à filtre, filtres, adaptateurs (≈ 600 € HT), gaines, pièges à son, abri |
| NF C 15-100-7-703 (local avec poêle de sauna) | IPX2 dans la grotte : non conforme (IP24 exigé) → décision du bureau de contrôle | conforme : rien d'électrique dans la grotte, seulement des grilles |
| Séance à 35 °C | ≈ 46 % HR en moyenne, ≈ 51 % en pointe (air neuf de la pièce d'entrée) | sur l'air de la grotte : ≈ 1,8–2,6 kg/h estimés, pointe couverte |
| Séance à 40 °C | hors de sa plage (40 % HR maxi à 40 °C) : à couper | sur l'air de la grotte : hors plage (aspiration ≤ 35 °C). En air neuf séché : fonctionne, voir plus bas |
| Nuit, réduit à 30 °C | dans sa plage, point de capacité publié (45,8 L/24 h à 30 °C / 60 %) | dans sa plage |
| Sel (NaCl) | frigorifique ; « atmosphères agressives » exclues par la notice → confirmation Dantherm | sur l'air de la grotte : NaCl nuisible au rotor (notice p. 12), filtre F9 + accord Trotec ; sans objet en air neuf séché |
| Capacité publiée | 45,8 L/24 h à 30 °C / 60 % ; ≈ 1,33 kg/h estimés à 35 °C / 45 % | 2,2 kg/h à 20 °C / 60 % |
| Puissance, énergie par kg d'eau | 1,1 kW ; ≈ 0,6–0,75 kWh/kg | 2,3 kW (notice) à 3,0 kW (site) ; ≈ 1,05–1,35 kWh/kg |
| Énergie annuelle (estimé, 1,3 kg/h × 3 000 h) | ≈ 2 700 kWh, chaleur entièrement rendue à la grotte | ≈ 4 700 kWh en recyclage, chaleur de régénération rejetée dehors |
| Bruit à 1 m | 48 dB(A) | 74 dB(A) : pièges à son |
| Électricité | 230 V, 5,3 A ; circuit 16 A, DDR 30 mA | 230 V, 10 A ; circuit 16 A, DDR 30 mA |
| Eau | condensats ≈ 1,3 kg/h vers un siphon | pas de condensats ; rejet d'air humide Ø 80 en pente vers dehors, purgé |
| Gaines | aucune | air sec Ø 125 → Ø 200 (4,2 m/s) ; régénération Ø 80 |
| Pilotage | bornier JB (contact sec) | prise pour hygrostat externe (sonde en gaine) |

## Le TTR 500 D en air neuf séché

Posé hors de la grotte, il aspire l'air extérieur, le sèche et le souffle dans la grotte (mode « aération », notice p. 7).
Il ne voit alors ni le sel ni l'air à 40 °C.

- Par un jour d'été très humide (26 °C / 70 % dehors) : grotte vers 31–32 % HR en pointe à 40 °C (estimé), contre ≈ 46 % avec 300 m³/h d'air extérieur non traité.
- Mais ce jour-là est rare : d'après la réanalyse ERA5 (Bagnères, 2016–2025), il n'est dépassé qu'environ **20 h par an**. En été, l'air extérieur contient en moyenne 10 à 11,5 g/kg.
- Un dessicant en air neuf vaut à peu près un supplément d'air extérieur non traité de même débit (vérifié sur le TTR 250 : 250 m³/h séchés ≈ +250 m³/h d'air brut).
  **Un simple ventilateur d'air neuf extérieur à deux vitesses (300 puis 550–600 m³/h), piloté sur le point de rosée de la grotte, fait presque aussi bien** (moins de 0,5 point d'écart en pointe), pour quelques centaines d'euros.
- Avec 300 m³/h d'air extérieur non traité, la grotte dépasse 40 % HR en pointe à 40 °C environ 290 h par an ; avec 550 m³/h, environ 18 h.
- L'hiver, tout air neuf coûte cher à réchauffer : 300 m³/h de −5 à 35 °C demandent 4,1 kW (4,65 kW jusqu'à 40 °C).
- Limite de la ventilation : si la grotte a un générateur d'aérosol salin, plus d'air neuf dilue l'aérosol. À vérifier avant de monter à 550–600 m³/h.

## Verdict

1. **Garder le DH 65** : déjà acheté, deux fois plus économe par kg d'eau, silencieux, adapté aux séances à 35–37 °C et à la nuit.
2. **Prendre l'air neuf dehors**, avec un ventilateur à deux vitesses piloté sur le point de rosée : c'est lui qui règle les séances à 40 °C et les jours humides, pas un second déshumidificateur.
3. **Le TTR 500 D ne s'impose dans aucun cas** :
   - en recyclage, il a les mêmes limites que le DH 65 (35 °C) et le problème du sel ;
   - en air neuf séché, un ventilateur fait presque aussi bien.
4. **Si le bureau de contrôle refuse l'IPX2 du DH 65**, le remplaçant déporté à privilégier est un frigorifique gainable admis à 42 °C (Microwell DRY 400 DUCT ≈ 4 000 € TTC, ou DRY 500 DUCT avec option 15–42 °C ≈ 5 000 €), plutôt que le TTR 500 D.
