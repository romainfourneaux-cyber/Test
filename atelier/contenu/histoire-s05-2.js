// Source en clair du cours histoire-s05-2 « Cours 8 – Étude de cas 1 et 2 ».
// Compilé (réponses brouillées) par node atelier/outils/compiler-cours.js histoire-s05-2.
// Seule source : l'étude de cas 2 « La seigneurie de Wismes », et surtout son texte tiré de la chanson des vilains
// de Verson (Normandie, XIIe siècle) : le calendrier des redevances, les quatre façons de payer le seigneur, les
// lieux où vont les redevances. L'étude de cas n°1 n'est pas déposée : voir nonCouvert.
const FW = "cours/histoire/Histoire 5e - Moyen Age - Etude de cas 2 Seigneurie de Wismes.pdf";
const SW = p => ({ fichier: FW, page: p });
// Questions de thème (règle du 25/10/2026) : fait vérifié dans une source fiable, notée sans fichier ni page.
const T = (titre, url) => ({ theme: "Cours 8 – Étude de cas 1 et 2", titre, editeur: "Wikipédia", url });

// L'année des redevances à Verson, redessinée en ruban (aucune image reprise).
function annee() {
  const encre = "#2e2419";
  const mois = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
  const X0 = 20, L = 500, w = L / 12;
  let s = "<svg viewBox='0 0 540 230' xmlns='http://www.w3.org/2000/svg' font-family='Georgia,serif' font-size='10'>";
  s += "<text x='270' y='16' text-anchor='middle' font-size='12' fill='" + encre + "'>Ce que les paysans de Verson doivent au fil de l'année</text>";
  for (let i = 0; i < 12; i++) {
    const x = X0 + i * w;
    const hiver = i <= 1 || i === 11;
    s += "<rect x='" + x + "' y='100' width='" + w + "' height='22' fill='" + (hiver ? "#c9d6e3" : i >= 5 && i <= 7 ? "#e8d27a" : "#cfe0b8") + "' stroke='" + encre + "'/>";
    s += "<text x='" + (x + w / 2) + "' y='115' text-anchor='middle' fill='" + encre + "'>" + mois[i] + "</text>";
  }
  const haut = [
    [5, 5.75, "24 juin : fauchage des prés,", "foin porté au manoir"],
    [7, 7.5, "Août : moisson, part du", "seigneur (champart) à la grange"],
    [9, 9.3, "9 octobre : le cens", "(somme d'argent)"]
  ];
  haut.forEach(([i, xi, l1, l2], k) => {
    const x = X0 + xi * w, y = 40 + (k % 2) * 26;
    s += "<line x1='" + x + "' y1='" + (y + 8) + "' x2='" + x + "' y2='100' stroke='" + encre + "' stroke-dasharray='3 2'/>";
    s += "<text x='" + x + "' y='" + (y - 4) + "' text-anchor='middle' fill='" + encre + "'>" + l1 + "</text>";
    s += "<text x='" + x + "' y='" + (y + 7) + "' text-anchor='middle' fill='" + encre + "'>" + l2 + "</text>";
  });
  const bas = [
    [8.5, "Septembre :", "un porc sur huit"],
    [11.2, "Début de l'hiver : corvée", "(préparer, semer, herser)"],
    [0.3, "Noël :", "des poules"],
    [3.2, "Pâques : moutons et", "corvée de labour, puis bois"]
  ];
  bas.forEach(([xi, l1, l2], k) => {
    const x = X0 + xi * w, y = 150 + (k % 2) * 34;
    s += "<line x1='" + x + "' y1='122' x2='" + x + "' y2='" + (y - 12) + "' stroke='" + encre + "' stroke-dasharray='3 2'/>";
    s += "<text x='" + x + "' y='" + y + "' text-anchor='middle' fill='" + encre + "'>" + l1 + "</text>";
    s += "<text x='" + x + "' y='" + (y + 11) + "' text-anchor='middle' fill='" + encre + "'>" + l2 + "</text>";
  });
  s += "<text x='270' y='224' text-anchor='middle' font-size='9' fill='" + encre + "'>D'après la chanson des vilains de Verson (Normandie, XIIe siècle). Jaune : été ; bleu : hiver.</text>";
  return s + "</svg>";
}

module.exports = {
  id: "histoire-s05-2",
  fiches: [
    {
      id: "histoire-s05-2-f1", notion: "Les redevances de Verson, de la saint Jean à la saint Denis",
      titre: "De juin à octobre : foin, moisson, porcs et cens",
      texte: "Une chanson du XIIe siècle liste les redevances des paysans de Verson. À la saint Jean (24 juin), ils fauchent les prés du seigneur et portent le foin au manoir. En août, ils portent le blé à la grange, où le seigneur prend d'abord sa part, le champart. En septembre, un porc sur huit ; en octobre, le cens.",
      pointsCles: ["Chanson des vilains de Verson (Normandie), XIIe siècle", "24 juin, saint Jean : fauchage des prés du seigneur, foin au manoir", "Août : moisson ; le seigneur prend sa part, le champart, avant que les paysans rentrent leurs gerbes", "Septembre : un porc sur huit", "9 octobre, saint Denis : paiement du cens"],
      dates: [],
      lieux: ["Verson", "Normandie"], personnages: [],
      vocabulaire: [
        { mot: "redevance", def: "ce qu'un paysan doit régulièrement à son seigneur : argent, produits ou travail" },
        { mot: "champart", def: "la part de la récolte que le paysan doit au seigneur pour sa tenure" },
        { mot: "gerbe", def: "une brassée d'épis coupés et liés ensemble" }
      ],
      schema: "histoire-s05-2-s1", prerequis: ["histoire-s05-1-f1"], source: SW(1)
    },
    {
      id: "histoire-s05-2-f2", notion: "Les redevances de Verson, de l'hiver à Pâques",
      titre: "Corvées d'hiver, poules de Noël, moutons de Pâques",
      texte: "Au début de l'hiver, les paysans de Verson font une corvée sur la terre du seigneur, qu'ils préparent, sèment et hersent. À Noël, ils doivent des poules. À Pâques, ils donnent des moutons et font une nouvelle corvée de labour. Ensuite, ils coupent des arbres au bois et les transportent jusqu'au château : la corvée du charroi.",
      pointsCles: ["Début de l'hiver : corvée sur la terre du seigneur (préparer, semer, herser)", "Noël : des poules", "Pâques : des moutons et une corvée de labour", "Puis : couper des arbres et les charroyer jusqu'au château"],
      astuce: "Noël rime avec volaille (des poules), Pâques avec labour et moutons.",
      dates: [],
      lieux: ["Verson"], personnages: [],
      vocabulaire: [
        { mot: "herser", def: "passer la herse, un outil à dents, pour casser les mottes et recouvrir les graines" },
        { mot: "charroi", def: "le transport par charrette ; la corvée du charroi amène le bois au château" }
      ],
      schema: "histoire-s05-2-s1", prerequis: ["histoire-s05-2-f1"], source: SW(1)
    },
    {
      id: "histoire-s05-2-f3", notion: "Quatre façons de payer le seigneur : argent, récolte, usage, travail",
      titre: "Cens, champart, banalités, corvées",
      texte: "Les paysans paient le seigneur de quatre façons. Le cens est une somme d'argent, due pour la tenure. Le champart est une part de la récolte, due elle aussi en échange de la tenure. Les banalités sont des taxes pour utiliser son four, son moulin et son pressoir. Les corvées sont des travaux obligatoires et gratuits.",
      pointsCles: ["Cens : de l'argent", "Champart : une part de la récolte", "Banalités : payer pour le four, le moulin, le pressoir", "Corvées : du travail gratuit et obligatoire", "Le vilain est un paysan libre, le serf un paysan non libre"],
      astuce: "Argent, récolte, usage, travail : C-C-B-C, cens, champart, banalités, corvées.",
      dates: [],
      lieux: [], personnages: [],
      vocabulaire: [
        { mot: "serf", def: "un paysan qui n'est pas libre, à la différence du vilain" }
      ],
      schema: null, prerequis: ["histoire-s05-1-f1", "histoire-s05-1-f3", "histoire-s05-2-f1"], source: SW(1)
    },
    {
      id: "histoire-s05-2-f4", notion: "Où vont les redevances : manoir, grange, château, moulin, four",
      titre: "Les lieux du seigneur dans la chanson de Verson",
      texte: "Chaque redevance a sa destination. Le foin fauché à la saint Jean va au manoir du seigneur. Le blé moissonné et le champart vont à sa grange. Le bois coupé est transporté au château par la corvée du charroi. Au moulin, le meunier du seigneur prélève sa part sur le grain. Au four, on paie pour cuire le pain.",
      pointsCles: ["Foin : au manoir", "Blé et champart : à la grange du seigneur", "Bois : au château (charroi)", "Grain : au moulin, où le meunier prélève sa part", "Pain : au four, contre un droit"],
      dates: [],
      lieux: ["Verson"], personnages: [],
      vocabulaire: [
        { mot: "manoir", def: "la demeure d'un seigneur, à la campagne" },
        { mot: "grange", def: "le bâtiment où l'on range les récoltes" }
      ],
      schema: null, prerequis: ["histoire-s05-2-f1", "histoire-s05-2-f2"], source: SW(1)
    }
  ],
  schemas: [
    { id: "histoire-s05-2-s1", legende: "L'année des redevances à Verson, redessinée d'après le texte de la chanson des vilains (XIIe siècle) : ce que les paysans doivent au seigneur, mois après mois.", svg: annee() }
  ],
  questions: [
    // f1 : de juin à octobre
    { id: "histoire-s05-2-q1", fiche: "histoire-s05-2-f1", type: "qcm", niveau: 1,
      enonce: "À la saint Jean, le 24 juin, que font les paysans de Verson pour le seigneur ?",
      choix: ["Ils fauchent ses prés et portent le foin au manoir", "Ils paient le cens", "Ils donnent des poules", "Ils vendangent la vigne du seigneur et portent le raisin au pressoir"],
      reponse: "Ils fauchent ses prés et portent le foin au manoir",
      explication: "La saint Jean ouvre l'année des redevances par la fenaison. Le cens se paie en octobre, les poules se donnent à Noël.", source: SW(1) },
    { id: "histoire-s05-2-q2", fiche: "histoire-s05-2-f1", type: "vrai_faux", niveau: 1,
      enonce: "À Verson, les paysans paient le cens à la saint Denis, le 9 octobre.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : le cens, une somme d'argent, est dû à la saint Denis. C'est le 9 octobre.", source: SW(1) },
    { id: "histoire-s05-2-q3", fiche: "histoire-s05-2-f1", type: "qcm", niveau: 2,
      enonce: "En août, que doit attendre le paysan de Verson avant de rentrer ses propres gerbes ?",
      choix: ["Que le seigneur ait prélevé sa part", "D'avoir payé le cens au meunier", "D'avoir tondu tous les moutons du seigneur dans la réserve", "D'avoir porté le foin au manoir"],
      reponse: "Que le seigneur ait prélevé sa part",
      explication: "Le seigneur se sert d'abord : il prend le champart. Le paysan rentre ses gerbes seulement après.", source: SW(1) },
    { id: "histoire-s05-2-q4", fiche: "histoire-s05-2-f1", type: "vrai_faux", niveau: 2,
      enonce: "En septembre, les paysans de Verson doivent un porc sur deux.",
      corrections: ["Faux : un porc sur huit.", "Faux : un porc par famille, chaque année.", "Faux : ils ne doivent aucun porc, seulement des poules."],
      reponse: { vrai: false, correction: "Faux : un porc sur huit." },
      explication: "La redevance de septembre est d'un porc sur huit. Les poules, elles, se donnent à Noël.", source: SW(1) },
    { id: "histoire-s05-2-q5", fiche: "histoire-s05-2-f1", type: "qcm", niveau: 2,
      enonce: "Pourquoi le champart est-il chargé sur une charrette au mois d'août ?",
      choix: ["Pour porter cette part de la récolte à la grange du seigneur", "Pour l'emmener au marché de la ville voisine et le vendre cher", "Pour le donner au meunier", "Pour le semer dans la réserve"],
      reponse: "Pour porter cette part de la récolte à la grange du seigneur",
      explication: "Le champart est la part du seigneur sur la récolte. Les paysans la transportent eux-mêmes jusqu'à sa grange.", source: SW(1) },
    { id: "histoire-s05-2-q6", fiche: "histoire-s05-2-f1", type: "ordre", niveau: 2,
      enonce: "Remets ces redevances de Verson dans l'ordre de l'année, de juin à octobre.",
      elements: ["Paiement du cens (saint Denis)", "Fauchage des prés du seigneur (saint Jean)", "Un porc sur huit", "Moisson du blé et champart"],
      reponse: [1, 3, 2, 0],
      explication: "Juin : fauchage ; août : moisson et champart ; septembre : un porc sur huit ; octobre : le cens.", source: SW(1) },
    { id: "histoire-s05-2-q7", fiche: "histoire-s05-2-f1", type: "qcm", niveau: 3,
      enonce: "Un paysan de Verson a moissonné dix charrettes de blé. Que se passe-t-il avant qu'il rentre ses gerbes chez lui ?",
      choix: ["Le seigneur prend sa part : le champart", "Le meunier prend un boisseau", "Il doit d'abord payer le cens au seigneur", "Il doit donner un porc"],
      reponse: "Le seigneur prend sa part : le champart",
      explication: "En août, le seigneur prélève le champart sur la récolte avant tout. Le meunier n'intervient que quand on fait moudre le grain.", indice: "Relis ce qui se passe au mois d'août.", source: SW(1) },
    { id: "histoire-s05-2-q9", fiche: "histoire-s05-2-f1", type: "vrai_faux", niveau: 3,
      enonce: "À Verson, le seigneur reçoit du blé deux fois : en août avec le champart, et à la saint Denis avec le cens.",
      corrections: ["Faux : le cens de la saint Denis est une somme d'argent, pas du blé.", "Faux : le seigneur ne reçoit jamais de blé, seulement de l'argent.", "Faux : le champart est payé en porcs."],
      reponse: { vrai: false, correction: "Faux : le cens de la saint Denis est une somme d'argent, pas du blé." },
      explication: "Le champart est bien une part de la récolte. Le cens, lui, se paie en argent.", source: SW(1) },
    // f2 : de l'hiver à Pâques
    { id: "histoire-s05-2-q10", fiche: "histoire-s05-2-f2", type: "qcm", niveau: 1,
      enonce: "Que doivent les paysans de Verson au seigneur à Noël ?",
      choix: ["Des poules", "Des moutons", "Un porc sur huit", "Le cens"],
      reponse: "Des poules",
      explication: "À Noël, ce sont des poules. Les moutons viennent à Pâques, les porcs en septembre.", source: SW(1) },
    { id: "histoire-s05-2-q11", fiche: "histoire-s05-2-f2", type: "vrai_faux", niveau: 1,
      enonce: "À Pâques, les paysans de Verson doivent des moutons et une corvée de labour.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : Pâques apporte deux charges, des moutons à donner et un labour à faire pour le seigneur.", source: SW(1) },
    { id: "histoire-s05-2-q12", fiche: "histoire-s05-2-f2", type: "qcm_multiple", niveau: 2,
      enonce: "Pendant la corvée du début de l'hiver, que font les paysans sur la terre du seigneur ? (plusieurs réponses)",
      choix: ["Ils la préparent", "Ils sèment", "Ils hersent", "Ils vendangent", "Ils tondent les moutons"],
      reponse: ["Ils la préparent", "Ils sèment", "Ils hersent"],
      explication: "La corvée d'hiver prépare la terre, la sème et la herse. Vendange et tonte sont d'autres travaux, à d'autres saisons.", source: SW(1) },
    { id: "histoire-s05-2-q13", fiche: "histoire-s05-2-f2", type: "vrai_faux", niveau: 2,
      enonce: "À Verson, les paysans doivent des poules à Pâques.",
      corrections: ["Faux : les poules sont dues à Noël ; à Pâques, ce sont des moutons.", "Faux : les poules sont dues à la saint Jean.", "Faux : les paysans de Verson ne doivent jamais de poules."],
      reponse: { vrai: false, correction: "Faux : les poules sont dues à Noël ; à Pâques, ce sont des moutons." },
      explication: "Noël, les poules ; Pâques, les moutons et une corvée de labour. Les deux fêtes ont chacune leur redevance.", source: SW(1) },
    { id: "histoire-s05-2-q14", fiche: "histoire-s05-2-f2", type: "qcm", niveau: 2,
      enonce: "Comment s'appelle le transport du bois jusqu'au château, après la coupe des arbres ?",
      choix: ["La corvée du charroi", "Le champart", "La banalité", "Le cens"],
      reponse: "La corvée du charroi",
      explication: "Charroyer, c'est transporter par charrette. Cette corvée amène au château le bois coupé par les paysans.", source: SW(1) },
    { id: "histoire-s05-2-q15", fiche: "histoire-s05-2-f2", type: "qcm", niveau: 3,
      enonce: "Pourquoi peut-on dire que les paysans de Verson travaillent pour le seigneur toute l'année ?",
      choix: ["Des redevances et des corvées tombent à chaque saison, de la saint Jean à Pâques", "Ils ne cultivent jamais leurs propres tenures et restent dans la réserve du seigneur", "Ils vivent dans le château du seigneur", "Ils paient le cens chaque mois"],
      reponse: "Des redevances et des corvées tombent à chaque saison, de la saint Jean à Pâques",
      explication: "Juin, août, septembre, octobre, l'hiver, Noël, Pâques : chaque moment de l'année apporte sa charge. Le cens, lui, n'est dû qu'une fois.", indice: "Compte les moments de l'année cités par la chanson.", source: SW(1) },
    { id: "histoire-s05-2-q16", fiche: "histoire-s05-2-f2", type: "association", niveau: 2,
      enonce: "Relie chaque moment de l'année à ce que doivent les paysans de Verson.",
      gauche: ["Noël", "Pâques", "Début de l'hiver", "Après Pâques"],
      droite: ["Corvée : préparer, semer, herser", "Des poules", "Couper du bois et le charroyer au château", "Des moutons et une corvée de labour"],
      reponse: [[0, 1], [1, 3], [2, 0], [3, 2]],
      explication: "Hiver : la corvée des semailles ; Noël : les poules ; Pâques : moutons et labour ; ensuite : le bois et le charroi.", source: SW(1) },
    { id: "histoire-s05-2-q17", fiche: "histoire-s05-2-f2", type: "qcm", niveau: 3,
      enonce: "La corvée du début de l'hiver sert à préparer, semer et herser la terre du seigneur. De quelle partie de la seigneurie s'agit-il ?",
      choix: ["La réserve", "Les tenures des paysans", "La forêt", "Le pré du manoir"],
      reponse: "La réserve",
      explication: "La terre que le seigneur garde pour lui est la réserve. C'est là que se font les corvées de labour et de semailles.", indice: "Souviens-toi des deux parties d'une seigneurie.", source: SW(1) },
    // f3 : quatre façons de payer
    { id: "histoire-s05-2-q18", fiche: "histoire-s05-2-f3", type: "qcm", niveau: 1,
      enonce: "Comment s'appelle la part de la récolte due au seigneur en échange de la tenure ?",
      choix: ["Le champart", "Le cens", "La corvée", "La banalité"],
      reponse: "Le champart",
      explication: "Le champart se paie en récolte. Le cens, lui, se paie en argent.", source: SW(1) },
    { id: "histoire-s05-2-q19", fiche: "histoire-s05-2-f3", type: "vrai_faux", niveau: 1,
      enonce: "Le cens est une somme d'argent.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : le cens est la taxe en argent due pour la tenure. À Verson, on le paie le 9 octobre.", source: SW(1) },
    { id: "histoire-s05-2-q20", fiche: "histoire-s05-2-f3", type: "association", niveau: 2,
      enonce: "Relie chaque redevance à sa nature.",
      gauche: ["Cens", "Champart", "Corvée", "Banalité"],
      droite: ["Taxe pour utiliser le four, le moulin ou le pressoir", "Somme d'argent", "Part de la récolte", "Travail obligatoire et gratuit"],
      reponse: [[0, 1], [1, 2], [2, 3], [3, 0]],
      explication: "Cens : argent ; champart : récolte ; corvée : travail ; banalité : usage du four, du moulin ou du pressoir.", source: SW(1) },
    { id: "histoire-s05-2-q21", fiche: "histoire-s05-2-f3", type: "vrai_faux", niveau: 2,
      enonce: "Le champart est payé en argent.",
      corrections: ["Faux : le champart est une part de la récolte ; c'est le cens qui est payé en argent.", "Faux : le champart est un travail gratuit.", "Faux : le champart est une taxe pour utiliser le moulin."],
      reponse: { vrai: false, correction: "Faux : le champart est une part de la récolte ; c'est le cens qui est payé en argent." },
      explication: "Le champart se prélève sur la récolte, en août. L'argent, c'est le cens.", source: SW(1) },
    { id: "histoire-s05-2-q22", fiche: "histoire-s05-2-f3", type: "qcm", niveau: 2,
      enonce: "Pourquoi les corvées ne coûtent-elles rien au seigneur ?",
      choix: ["Ce sont des travaux obligatoires et gratuits", "Les paysans les paient en argent", "Le roi les rembourse", "Le meunier du seigneur les fait à la place des paysans"],
      reponse: "Ce sont des travaux obligatoires et gratuits",
      explication: "Une corvée est un travail que le paysan doit, sans salaire. Le seigneur obtient ainsi de la main-d'œuvre sans payer.", source: SW(1) },
    { id: "histoire-s05-2-q23", fiche: "histoire-s05-2-f3", type: "qcm_multiple", niveau: 2,
      enonce: "Parmi ces redevances, lesquelles sont payées en produits, et non en argent ni en travail ? (plusieurs réponses)",
      choix: ["Le champart", "Un porc sur huit", "Des poules à Noël", "Le cens", "La corvée de labour"],
      reponse: ["Le champart", "Un porc sur huit", "Des poules à Noël"],
      explication: "Récolte, porcs et poules sont des produits. Le cens est de l'argent et la corvée du travail.", source: SW(1) },
    { id: "histoire-s05-2-q24", fiche: "histoire-s05-2-f3", type: "qcm", niveau: 3,
      enonce: "Un paysan laisse une part de grain au meunier, donne une part de sa récolte au seigneur pour sa tenure, puis va labourer la réserve. Dans l'ordre, de quelles redevances s'agit-il ?",
      choix: ["Banalité, champart, corvée", "Cens, champart, banalité", "Corvée, cens, banalité", "Champart, banalité, cens"],
      reponse: "Banalité, champart, corvée",
      explication: "Payer le moulin est une banalité, la part de récolte est le champart, le labour gratuit une corvée. Le cens n'apparaît pas : il se paie en argent.", indice: "Le moulin, la récolte, puis le travail.", source: SW(1) },
    { id: "histoire-s05-2-q25", fiche: "histoire-s05-2-f3", type: "trou", niveau: 1,
      enonce: "Complète avec le nom des redevances.",
      texte: "Le ___ est une somme d'argent ; le ___ est une part de la récolte ; la ___ est un travail gratuit.",
      banque: ["cens", "champart", "corvée", "banalité"],
      reponse: [["cens"], ["champart"], ["corvée"]],
      explication: "Cens : argent ; champart : récolte ; corvée : travail. La banalité, elle, se paie pour utiliser le moulin, le four ou le pressoir.", source: SW(1) },
    { id: "histoire-s05-2-q26", fiche: "histoire-s05-2-f3", type: "vrai_faux", niveau: 3,
      enonce: "Un serf qui fait une corvée de labour travaille gratuitement pour le seigneur.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : serf ou vilain, celui qui fait une corvée n'est pas payé. Le serf, en plus, n'est pas libre.", source: SW(1) },
    // f4 : les lieux
    { id: "histoire-s05-2-q27", fiche: "histoire-s05-2-f4", type: "qcm", niveau: 1,
      enonce: "Où les paysans de Verson portent-ils le foin fauché à la saint Jean ?",
      choix: ["Au manoir", "Au moulin", "À l'église", "Au four"],
      reponse: "Au manoir",
      explication: "Le foin va au manoir, la demeure du seigneur. Le moulin reçoit le grain, le four la pâte à pain.", source: SW(1) },
    { id: "histoire-s05-2-q28", fiche: "histoire-s05-2-f4", type: "vrai_faux", niveau: 1,
      enonce: "Le blé moissonné et le champart sont portés à la grange du seigneur.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : la grange du seigneur reçoit la moisson et le champart. Les paysans les y transportent en charrette.", source: SW(1) },
    { id: "histoire-s05-2-q29", fiche: "histoire-s05-2-f4", type: "association", niveau: 2,
      enonce: "Relie chaque produit au lieu où les paysans de Verson le portent.",
      gauche: ["Foin", "Gerbes de blé et champart", "Bois coupé", "Grain à moudre"],
      droite: ["Le moulin du seigneur", "Le château", "Le manoir", "La grange du seigneur"],
      reponse: [[0, 2], [1, 3], [2, 1], [3, 0]],
      explication: "Foin au manoir, blé à la grange, bois au château, grain au moulin. Chaque produit a sa destination.", source: SW(1) },
    { id: "histoire-s05-2-q30", fiche: "histoire-s05-2-f4", type: "vrai_faux", niveau: 2,
      enonce: "Le bois coupé par les paysans de Verson est porté au moulin.",
      corrections: ["Faux : il est transporté au château, c'est la corvée du charroi.", "Faux : il est porté au manoir avec le foin.", "Faux : il est brûlé sur place dans la forêt."],
      reponse: { vrai: false, correction: "Faux : il est transporté au château, c'est la corvée du charroi." },
      explication: "Le bois va au château : c'est la corvée du charroi. Le moulin ne reçoit que le grain.", source: SW(1) },
    { id: "histoire-s05-2-q31", fiche: "histoire-s05-2-f4", type: "qcm", niveau: 2,
      enonce: "Qui prélève un boisseau de grain et de la farine quand le vilain fait moudre son grain ?",
      choix: ["Le meunier du seigneur", "Le seigneur en personne", "Les autres paysans", "Un serf de la seigneurie"],
      reponse: "Le meunier du seigneur",
      explication: "Le moulin appartient au seigneur, mais c'est son meunier qui le fait tourner et prélève la part due. C'est une banalité.", source: SW(1) },
    { id: "histoire-s05-2-q33", fiche: "histoire-s05-2-f4", type: "qcm", niveau: 3,
      enonce: "Pourquoi le seigneur fait-il porter la moisson à sa grange plutôt que de la laisser aux paysans ?",
      choix: ["Pour garder la part qui lui est due, le champart", "Pour nourrir les porcs du village pendant la glandée", "Pour la vendre au meunier", "Pour la faire cuire au four"],
      reponse: "Pour garder la part qui lui est due, le champart",
      explication: "La grange du seigneur reçoit la récolte pour qu'il y prélève le champart. Le reste revient ensuite aux paysans.", indice: "Quelle redevance se prend sur la récolte ?", source: SW(1) },
    { id: "histoire-s05-2-q34", fiche: "histoire-s05-2-f4", type: "qcm_multiple", niveau: 2,
      enonce: "Quels lieux de la seigneurie sont cités dans la chanson de Verson ? (plusieurs réponses)",
      choix: ["Le manoir", "La grange du seigneur", "Le château", "Le moulin", "Le gibet", "Le pressoir"],
      reponse: ["Le manoir", "La grange du seigneur", "Le château", "Le moulin"],
      explication: "Manoir, grange, château et moulin reçoivent les redevances des paysans de Verson. Le gibet et le pressoir existent dans d'autres seigneuries, mais la chanson n'en parle pas.", source: SW(1) },
    { id: "histoire-s05-2-q35", fiche: "histoire-s05-2-f4", type: "vrai_faux", niveau: 3,
      enonce: "Le manoir et la grange reçoivent des produits des paysans, tandis que le moulin et le four leur prennent une taxe quand ils s'en servent.",
      corrections: [], reponse: { vrai: true, correction: null },
      explication: "Oui : foin et blé sont apportés au manoir et à la grange. Au moulin et au four, le paysan vient pour lui et paie une banalité.", source: SW(1) }
  ],
  bonus: [
    {
      id: "histoire-s05-2-b1",
      fiche: "histoire-s05-2-f3",
      titre: "Le serf ne peut pas quitter la seigneurie",
      texte: "Un serf ne pouvait pas quitter la seigneurie ni se marier sans l'accord de son seigneur. Il pouvait pourtant devenir libre : en achetant sa liberté, ou par un acte appelé manumission. Le servage a reculé dès le Moyen Âge, et en 1779 le roi Louis XVI l'a aboli sur ses propres domaines.",
      source: { titre: "Servage", editeur: "Wikipédia, l'encyclopédie libre", url: "https://fr.wikipedia.org/wiki/Servage" }
    },
    {
      id: "histoire-s05-2-b2",
      fiche: "histoire-s05-2-f1",
      titre: "D'où vient la chanson des vilains de Verson",
      texte: "Verson est un village du Calvados, au sud-ouest de Caen. Au Moyen Âge, son seigneur est l'abbé du Mont-Saint-Michel. Quand les paysans contestent l'autorité de l'abbaye, un moine du Mont écrit un long poème sur ces « vilains de Verson » et sur tout ce qu'ils doivent : c'est ce texte que l'étude de cas résume. Les historiens discutent de sa date exacte.",
      source: { titre: "Verson", editeur: "Wikipédia, l'encyclopédie libre", url: "https://fr.wikipedia.org/wiki/Verson" }
    }
  ],
  nonCouvert: [
    "L'étude de cas n°1 annoncée par le planning n'est pas déposée : on ne sait pas de quoi elle traite.",
    "Ce que le programme attend en plus du dépôt (le ban, le château, les défrichements, les serfs) est couvert par les cours 6, 7 et 8 voisins (histoire-s04-3, s05-1, s06-1) ; ce cours garde ses quatre fiches de l'étude de cas 2.",
    "La leçon à apprendre et les réponses rédigées aux cinq questions de l'étude de cas 2, données en vidéo.",
    "Ce que le seigneur doit à ses paysans en échange de son pouvoir (question 5) : la réponse n'est pas dans le fichier.",
    "Le texte complet de la chanson des vilains de Verson : seul un extrait résumé figure dans l'étude de cas.",
    "Les quantités dues (combien de poules, combien de moutons) : le texte ne les précise pas.",
    "La différence détaillée entre serf et vilain : elle est traitée au cours 8 suivant (histoire-s06-1), avec le tableau des redevances.",
    "Les tenures, la réserve, les droits du seigneur et le plan de Wismes : ils sont traités au cours 7 (histoire-s05-1)."
  ]
};
