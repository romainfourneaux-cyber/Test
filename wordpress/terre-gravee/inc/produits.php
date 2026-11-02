<?php
/**
 * Produits : textes des fiches (maquette ou champs « Fiche Terre Gravée »), finitions, cartes à pastilles.
 *
 * Les produits existants restent tels quels. Le thème lit :
 *   - l'attribut de finition (« couleur » sur terregravee.fr, valeurs NOIR, GRIS, DOREE), reconnu aussi s'il s'écrit
 *     « noir », « gris », « doré » ; la photo de chaque variation sert de photo de la finition ;
 *   - les textes de la maquette (inc/donnees-produits.php) par identifiant de produit (le-pic-du-midi, lisard…),
 *     remplaçables produit par produit dans l'encadré « Fiche Terre Gravée » de la page du produit.
 *
 * @package TerreGravee
 */

defined( 'ABSPATH' ) || exit;

/** Ordre et noms des finitions. */
function tg_finitions() {
	return array(
		'noir' => array( 'Noir', 'noire' ),
		'gris' => array( 'Gris', 'grise' ),
		'dore' => array( 'Doré', 'dorée' ),
	);
}

/**
 * Identifiant du kit LED (produit WooCommerce) : « led » sur terregravee.fr.
 *
 * @return string
 */
function tg_slug_led() {
	return apply_filters( 'tg_slug_led', 'led' );
}

/**
 * Identifiant de la carte cadeau.
 *
 * @return string
 */
function tg_slug_carte_cadeau() {
	return apply_filters( 'tg_slug_carte_cadeau', 'carte-cadeau' );
}

/**
 * Le produit du kit LED, s'il existe et se vend.
 *
 * @return WC_Product_Variable|null
 */
function tg_produit_led() {
	static $led = false;
	if ( false === $led ) {
		$led   = null;
		$poste = get_page_by_path( tg_slug_led(), OBJECT, 'product' );
		if ( $poste ) {
			$p = wc_get_product( $poste->ID );
			if ( $p && $p->is_type( 'variable' ) && 'publish' === $p->get_status() ) {
				$led = $p;
			}
		}
	}
	return $led;
}

/**
 * Finition (noir, gris, dore) d'une valeur d'attribut (« NOIR », « doré », « DOREE », « Dorée »…), ou chaîne vide.
 *
 * @param string $valeur Valeur.
 * @return string
 */
function tg_finition_de( $valeur ) {
	$v = strtolower( remove_accents( (string) $valeur ) );
	foreach ( array( 'noir', 'gris', 'dor' ) as $debut ) {
		if ( 0 === strpos( $v, $debut ) ) {
			return 'dor' === $debut ? 'dore' : $debut;
		}
	}
	return '';
}

/**
 * Nom de l'attribut de finition d'un produit variable (clé « attribute_… »), ou chaîne vide.
 *
 * @param WC_Product $produit Produit.
 * @return string
 */
function tg_attribut_finition( $produit ) {
	if ( ! $produit || ! $produit->is_type( 'variable' ) ) {
		return '';
	}
	foreach ( $produit->get_variation_attributes() as $nom => $valeurs ) {
		$cle = sanitize_title( $nom );
		if ( in_array( $cle, array( 'couleur', 'pa_couleur', 'finition', 'pa_finition' ), true ) ) {
			return $nom;
		}
		foreach ( (array) $valeurs as $v ) {
			if ( tg_finition_de( $v ) ) {
				return $nom;
			}
		}
	}
	return '';
}

/**
 * Variations d'une plaque par finition : identifiant, valeur d'attribut, image, achetable.
 *
 * @param WC_Product $produit Produit variable.
 * @return array<string,array>
 */
function tg_variations_par_finition( $produit ) {
	$res = array();
	$nom = tg_attribut_finition( $produit );
	if ( ! $nom ) {
		return $res;
	}
	$cle = 'attribute_' . sanitize_title( $nom );
	foreach ( $produit->get_children() as $id ) {
		$v = wc_get_product( $id );
		if ( ! $v || ! $v->exists() || 'publish' !== $v->get_status() ) {
			continue;
		}
		$attrs = $v->get_variation_attributes();
		$val   = isset( $attrs[ $cle ] ) ? $attrs[ $cle ] : '';
		$fin   = tg_finition_de( $val );
		if ( ! $fin || isset( $res[ $fin ] ) ) {
			continue;
		}
		$res[ $fin ] = array(
			'id'        => $id,
			'valeur'    => $val,
			'image'     => tg_image_variation( $id ),
			'achetable' => $v->is_purchasable() && $v->is_in_stock(),
		);
	}
	// Ordre noir, gris, doré
	$ordre = array();
	foreach ( array_keys( tg_finitions() ) as $f ) {
		if ( isset( $res[ $f ] ) ) {
			$ordre[ $f ] = $res[ $f ];
		}
	}
	return $ordre;
}

/**
 * Photo propre d'une variation (sans repli sur la photo du produit, qui montrerait une autre finition).
 *
 * @param int $variation_id Variation.
 * @return int
 */
function tg_image_variation( $variation_id ) {
	return (int) get_post_meta( $variation_id, '_thumbnail_id', true );
}

/**
 * Collection de la maquette (paysages, patrimoine, faune, accessoires) : textes du thème, sinon catégories WooCommerce.
 *
 * @param WC_Product $produit Produit.
 * @return string
 */
function tg_collection( $produit ) {
	$d = tg_donnees( $produit->get_slug() );
	if ( ! empty( $d['collection'] ) ) {
		return $d['collection'];
	}
	$cats = wc_get_product_cat_ids( $produit->get_id() );
	$par  = array( 'paysage' => 'paysages', 'archi' => 'patrimoine', 'animaux' => 'faune' );
	foreach ( $cats as $cat ) {
		$t = get_term( $cat, 'product_cat' );
		if ( $t && ! is_wp_error( $t ) && isset( $par[ $t->slug ] ) ) {
			return $par[ $t->slug ];
		}
	}
	return tg_attribut_finition( $produit ) ? 'paysages' : 'accessoires';
}

/** Noms des collections. */
function tg_collections() {
	return array(
		'paysages'    => 'Paysages',
		'patrimoine'  => 'Patrimoine',
		'faune'       => 'Faune',
		'accessoires' => 'Accessoires',
	);
}

/**
 * Texte d'une fiche : champ « Fiche Terre Gravée » du produit, sinon texte de la maquette, sinon $defaut.
 *
 * @param WC_Product $produit Produit.
 * @param string     $cle     surtitre|phrase|lieu|titre_histoire.
 * @param string     $defaut  Valeur de repli.
 * @return string HTML sûr.
 */
function tg_texte( $produit, $cle, $defaut = '' ) {
	$meta = trim( (string) $produit->get_meta( '_tg_' . $cle ) );
	if ( '' !== $meta ) {
		return wp_kses_post( $meta );
	}
	$d    = tg_donnees( $produit->get_slug() );
	$cles = array(
		'surtitre'       => 'cartel',
		'phrase'         => 'phrase',
		'lieu'           => 'lieu',
		'titre_histoire' => 'titre_histoire',
	);
	if ( isset( $cles[ $cle ] ) && ! empty( $d[ $cles[ $cle ] ] ) ) {
		return wp_kses_post( $d[ $cles[ $cle ] ] );
	}
	return $defaut;
}

/**
 * Image d'une plaque dans un cadre « plaque accrochée » (ombre portée), avec srcset.
 *
 * @param int    $image_id Pièce jointe.
 * @param string $alt      Texte alternatif.
 * @param string $sizes    Attribut sizes.
 * @param bool   $prioritaire Image du premier écran.
 * @return string
 */
function tg_img( $image_id, $alt, $sizes, $prioritaire = false, $classe = '' ) {
	$attrs = array(
		'alt'      => $alt,
		'sizes'    => $sizes,
		'decoding' => 'async',
	);
	if ( $classe ) {
		$attrs['class'] = $classe;
	}
	if ( $prioritaire ) {
		$attrs['fetchpriority'] = 'high';
		$attrs['loading']       = false;
	}
	return wp_get_attachment_image( $image_id, 'woocommerce_single', false, $attrs );
}

/**
 * Carte de produit de la maquette (pastilles de finition pour les plaques).
 *
 * @param WC_Product  $produit Produit.
 * @param string|null $fin     Finition affichée d'abord.
 * @param string      $niveau  Balise du nom (h2, h3).
 * @return string
 */
function tg_carte_produit( $produit, $fin = null, $niveau = 'h3' ) {
	if ( ! $produit ) {
		return '';
	}
	$slug   = $produit->get_slug();
	$d      = tg_donnees( $slug );
	$coll   = tg_collection( $produit );
	$url    = get_permalink( $produit->get_id() );
	$nom    = $produit->get_name();
	$niveau = in_array( $niveau, array( 'h2', 'h3', 'h4' ), true ) ? $niveau : 'h3';
	$cadeau = ! empty( $d['cadeau'] ) || ( $produit->is_featured() && empty( $d ) ) ? ' data-cadeau' : '';
	$sizes  = '(max-width: 720px) 40vw, (max-width: 1000px) 26vw, 220px';
	$lieu   = ! empty( $d['cartel_court'] ) ? $d['cartel_court'] : '';
	$prix   = $produit->get_price_html();

	if ( $slug === tg_slug_led() || $slug === tg_slug_carte_cadeau() || 'accessoires' === $coll ) {
		$led    = $slug === tg_slug_led();
		$visuel = tg_img( (int) $produit->get_image_id(), $led ? 'Plaque rétroéclairée par le kit LED' : $nom, $sizes );
		$pied   = $led ? 'À cocher sur la fiche de la plaque' : 'Par e-mail';
		if ( $led ) {
			$prix = '+ ' . $prix;
			$lieu = $lieu ? $lieu : 'Option d’une plaque';
		}
		return sprintf(
			'<li><article class="carte" data-collection="accessoires" data-nom="%1$s"%2$s><a class="carte__visuel%3$s" href="%4$s" tabindex="-1" aria-hidden="true"><div class="plaque">%5$s</div></a><div class="carte__infos"><%6$s class="carte__nom"><a href="%4$s">%7$s</a></%6$s><span class="carte__prix">%8$s</span><span class="carte__lieu">%9$s</span></div><div class="carte__pied"><span class="carte__note">%10$s</span></div></article></li>',
			esc_attr( $nom ),
			$cadeau,
			$led ? '' : ' carte__visuel--carre',
			esc_url( $url ),
			$visuel,
			$niveau,
			esc_html( $nom ),
			wp_kses_post( $prix ),
			wp_kses_post( $lieu ),
			esc_html( $pied )
		);
	}

	$vars = tg_variations_par_finition( $produit );
	$data = array();
	$past = array();
	$fins = tg_finitions();
	foreach ( $fins as $f => $noms ) {
		$img = isset( $vars[ $f ] ) ? tg_image_variation( $vars[ $f ]['id'] ) : 0;
		if ( $img ) {
			$src    = wp_get_attachment_image_src( $img, 'woocommerce_single' );
			$data[] = sprintf( 'data-img-%1$s="%2$s" data-srcset-%1$s="%3$s"', $f, esc_url( $src ? $src[0] : '' ), esc_attr( (string) wp_get_attachment_image_srcset( $img, 'woocommerce_single' ) ) );
		}
	}
	$avec_photo = array_values( array_filter( array_keys( $fins ), function ( $f ) use ( $data ) {
		return (bool) preg_grep( '/^data-img-' . $f . '=/', $data );
	} ) );
	if ( ! $fin || ! in_array( $fin, $avec_photo, true ) ) {
		$fin = $avec_photo ? $avec_photo[0] : '';
	}
	foreach ( $fins as $f => $noms ) {
		if ( in_array( $f, $avec_photo, true ) ) {
			$past[] = sprintf( '<button type="button" class="pastille fin-%1$s" data-fin="%1$s" aria-pressed="%2$s" title="%3$s"><span class="visuellement-cache">%3$s</span></button>', $f, $f === $fin ? 'true' : 'false', esc_attr( $noms[0] ) );
		} elseif ( isset( $vars[ $f ] ) ) {
			$past[] = sprintf( '<button type="button" class="pastille pastille--manque fin-%1$s" disabled title="%2$s : photo à venir"><span class="visuellement-cache">%2$s, photo à venir</span></button>', $f, esc_attr( $noms[0] ) );
		}
	}
	if ( $fin ) {
		$visuel = tg_img( tg_image_variation( $vars[ $fin ]['id'] ), sprintf( 'Plaque %s, finition %s', $nom, $fins[ $fin ][1] ), $sizes );
	} else {
		$visuel = tg_img( (int) $produit->get_image_id(), 'Plaque ' . $nom, $sizes );
	}
	return sprintf(
		'<li><article class="carte" data-collection="%1$s" data-nom="%2$s"%3$s %4$s><a class="carte__visuel" href="%5$s" tabindex="-1" aria-hidden="true"><div class="plaque">%6$s</div></a><div class="carte__infos"><%7$s class="carte__nom"><a href="%5$s">%8$s</a></%7$s><span class="carte__prix">%9$s</span><span class="carte__lieu">%10$s</span></div><div class="carte__pied">%11$s</div></article></li>',
		esc_attr( $coll ),
		esc_attr( $nom ),
		$cadeau,
		implode( ' ', $data ),
		esc_url( $url ),
		$visuel,
		$niveau,
		esc_html( $nom ),
		wp_kses_post( $prix ),
		wp_kses_post( $lieu ),
		$past ? '<div class="pastilles" role="group" aria-label="' . esc_attr( 'Finition affichée pour ' . $nom ) . '">' . implode( '', $past ) . '</div>' : ''
	);
}

/**
 * Produits par identifiant (slug), dans l'ordre donné, seulement ceux qui sont publiés.
 *
 * @param string[] $slugs Identifiants.
 * @return WC_Product[]
 */
function tg_produits_par_slug( $slugs ) {
	$res = array();
	foreach ( $slugs as $s ) {
		$poste = get_page_by_path( sanitize_title( $s ), OBJECT, 'product' );
		if ( $poste && 'publish' === $poste->post_status ) {
			$p = wc_get_product( $poste->ID );
			if ( $p && $p->is_visible() ) {
				$res[] = $p;
			}
		}
	}
	return $res;
}

/**
 * [tg_produits slugs="le-pic-du-midi,lours" finitions="lours:dore" classe="grille-produits--deux" niveau="h3"]
 * Grille de cartes de la maquette, avec les vrais produits (nom, prix et photos de WooCommerce).
 * Sans « slugs » : les produits mis en avant (« featured »), sinon les quatre premiers.
 *
 * @param array $a Attributs.
 * @return string
 */
function tg_code_produits( $a ) {
	$a     = shortcode_atts( array( 'slugs' => '', 'finitions' => '', 'classe' => '', 'niveau' => 'h3', 'nombre' => 4 ), $a, 'tg_produits' );
	$slugs = array_filter( array_map( 'trim', explode( ',', $a['slugs'] ) ) );
	if ( $slugs ) {
		$produits = tg_produits_par_slug( $slugs );
	} else {
		$ids      = wc_get_featured_product_ids();
		$produits = array_filter( array_map( 'wc_get_product', array_slice( $ids, 0, (int) $a['nombre'] ) ) );
	}
	$fins = array();
	foreach ( array_filter( explode( ',', $a['finitions'] ) ) as $paire ) {
		$p = explode( ':', $paire );
		if ( 2 === count( $p ) ) {
			$fins[ trim( $p[0] ) ] = trim( $p[1] );
		}
	}
	$cartes = '';
	foreach ( $produits as $p ) {
		$cartes .= tg_carte_produit( $p, isset( $fins[ $p->get_slug() ] ) ? $fins[ $p->get_slug() ] : null, $a['niveau'] );
	}
	if ( ! $cartes ) {
		return '';
	}
	$classes = trim( 'grille-produits ' . preg_replace( '/[^a-z0-9_ -]/i', '', $a['classe'] ) );
	return '<ul class="' . esc_attr( $classes ) . '">' . $cartes . '</ul>';
}
add_shortcode( 'tg_produits', 'tg_code_produits' );

/**
 * Plaques à proposer sous une fiche : même collection, puis les produits mis en avant.
 *
 * @param WC_Product $produit Produit.
 * @param int        $nombre  Nombre.
 * @return WC_Product[]
 */
function tg_similaires( $produit, $nombre = 4 ) {
	$coll   = tg_collection( $produit );
	$ids    = wc_get_products( array( 'status' => 'publish', 'visibility' => 'catalog', 'limit' => 60, 'orderby' => 'menu_order', 'order' => 'ASC', 'exclude' => array( $produit->get_id() ), 'return' => 'objects' ) );
	$meme   = array();
	$autres = array();
	foreach ( $ids as $p ) {
		if ( ! tg_attribut_finition( $p ) ) {
			continue;
		}
		if ( tg_collection( $p ) === $coll ) {
			$meme[] = $p;
		} elseif ( $p->is_featured() ) {
			$autres[] = $p;
		}
	}
	return array_slice( array_merge( $meme, $autres ), 0, $nombre );
}

/* -------------------------------------------------------------------------
 * Encadré « Fiche Terre Gravée » dans la page d'un produit (administration)
 * ---------------------------------------------------------------------- */

/** Champs de l'encadré. */
function tg_champs_fiche() {
	return array(
		'surtitre'       => array( 'Cartel (au-dessus du nom)', 'cartel', 'text' ),
		'phrase'         => array( 'Phrase de présentation (sous le nom)', 'phrase', 'textarea' ),
		'lieu'           => array( '« Le lieu » (ou « L’animal »)', 'lieu', 'textarea' ),
		'titre_histoire' => array( 'Titre de « L’histoire du modèle » (le texte est la description du produit)', 'titre_histoire', 'text' ),
	);
}

/**
 * Ajoute l'encadré.
 */
function tg_encadre_fiche() {
	add_meta_box( 'tg-fiche', 'Fiche Terre Gravée', 'tg_encadre_fiche_html', 'product', 'normal', 'default' );
}
add_action( 'add_meta_boxes', 'tg_encadre_fiche' );

/**
 * Contenu de l'encadré.
 *
 * @param WP_Post $poste Produit.
 */
function tg_encadre_fiche_html( $poste ) {
	wp_nonce_field( 'tg_fiche', 'tg_fiche_nonce' );
	$d = tg_donnees( $poste->post_name );
	echo '<p>Laissez un champ vide pour garder le texte de la maquette (affiché en gris). Les balises simples sont permises (&lt;i&gt;, &lt;sup&gt;).</p>';
	foreach ( tg_champs_fiche() as $cle => $champ ) {
		$valeur = get_post_meta( $poste->ID, '_tg_' . $cle, true );
		$repli  = isset( $d[ $champ[1] ] ) ? wp_strip_all_tags( $d[ $champ[1] ] ) : '';
		printf( '<p><label for="tg-%1$s"><strong>%2$s</strong></label><br>', esc_attr( $cle ), esc_html( $champ[0] ) );
		if ( 'textarea' === $champ[2] ) {
			printf( '<textarea id="tg-%1$s" name="tg_fiche[%1$s]" rows="3" class="large-text" placeholder="%3$s">%2$s</textarea></p>', esc_attr( $cle ), esc_textarea( $valeur ), esc_attr( $repli ) );
		} else {
			printf( '<input type="text" id="tg-%1$s" name="tg_fiche[%1$s]" class="large-text" value="%2$s" placeholder="%3$s"></p>', esc_attr( $cle ), esc_attr( $valeur ), esc_attr( $repli ) );
		}
	}
}

/**
 * Enregistre l'encadré.
 *
 * @param int $post_id Produit.
 */
function tg_enregistrer_fiche( $post_id ) {
	if ( ! isset( $_POST['tg_fiche_nonce'] ) || ! wp_verify_nonce( sanitize_key( wp_unslash( $_POST['tg_fiche_nonce'] ) ), 'tg_fiche' ) ) {
		return;
	}
	if ( ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) || ! current_user_can( 'edit_post', $post_id ) ) {
		return;
	}
	$valeurs = isset( $_POST['tg_fiche'] ) && is_array( $_POST['tg_fiche'] ) ? wp_unslash( $_POST['tg_fiche'] ) : array(); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
	foreach ( array_keys( tg_champs_fiche() ) as $cle ) {
		$v = isset( $valeurs[ $cle ] ) ? trim( wp_kses_post( $valeurs[ $cle ] ) ) : '';
		if ( '' === $v ) {
			delete_post_meta( $post_id, '_tg_' . $cle );
		} else {
			update_post_meta( $post_id, '_tg_' . $cle, $v );
		}
	}
}
add_action( 'save_post_product', 'tg_enregistrer_fiche' );
