<?php
/**
 * WooCommerce : gabarits de la maquette (boutique, fiche), kit LED en option d'une plaque, en-tête de la boutique.
 *
 * Le panier et la validation de commande restent ceux de WooCommerce (blocs Panier et Validation de commande),
 * mis aux couleurs de la maquette par assets/wp.css. Les données structurées des produits restent celles de
 * WooCommerce et de Rank Math : le thème n'en ajoute aucune.
 *
 * @package TerreGravee
 */

defined( 'ABSPATH' ) || exit;

/* -------------------------------------------------------------------------
 * Réglages d'affichage
 * ---------------------------------------------------------------------- */

// Prix sans « ,00 » (« 65 € », comme la maquette) ; les centimes restent quand il y en a.
add_filter( 'woocommerce_price_trim_zeros', '__return_true' );

// Toute la collection sur une page (14 articles aujourd'hui) : les filtres par thème agissent sur la page entière.
add_filter(
	'loop_shop_per_page',
	function () {
		return 48;
	}
);

// Le gabarit du thème écrit lui-même le titre, le fil d'Ariane et les filtres.
add_filter( 'woocommerce_show_page_title', '__return_false' );

/**
 * Retire les sorties par défaut de WooCommerce que le thème remplace par la mise en page de la maquette.
 * Les autres fonctions accrochées (données structurées, extensions de paiement…) restent en place.
 */
function tg_crochets_woocommerce() {
	remove_action( 'woocommerce_before_main_content', 'woocommerce_output_content_wrapper', 10 );
	remove_action( 'woocommerce_after_main_content', 'woocommerce_output_content_wrapper_end', 10 );
	remove_action( 'woocommerce_before_main_content', 'woocommerce_breadcrumb', 20 );
	remove_action( 'woocommerce_archive_description', 'woocommerce_taxonomy_archive_description', 10 );
	remove_action( 'woocommerce_archive_description', 'woocommerce_product_archive_description', 10 );
	remove_action( 'woocommerce_before_shop_loop', 'woocommerce_result_count', 20 );
	remove_action( 'woocommerce_before_shop_loop', 'woocommerce_catalog_ordering', 30 );
	remove_action( 'woocommerce_shop_loop_header', 'woocommerce_product_taxonomy_archive_header' );
	foreach ( array(
		'woocommerce_template_single_title'       => 5,
		'woocommerce_template_single_rating'      => 10,
		'woocommerce_template_single_price'       => 10,
		'woocommerce_template_single_excerpt'     => 20,
		'woocommerce_template_single_add_to_cart' => 30,
		'woocommerce_template_single_meta'        => 40,
		'woocommerce_template_single_sharing'     => 50,
	) as $fonction => $priorite ) {
		remove_action( 'woocommerce_single_product_summary', $fonction, $priorite );
	}
	remove_action( 'woocommerce_after_single_product_summary', 'woocommerce_output_product_data_tabs', 10 );
	remove_action( 'woocommerce_after_single_product_summary', 'woocommerce_upsell_display', 15 );
	remove_action( 'woocommerce_after_single_product_summary', 'woocommerce_output_related_products', 20 );
	// Les variations : le thème montre le prix en tête de fiche, pas une seconde fois sous les finitions.
	remove_action( 'woocommerce_single_variation', 'woocommerce_single_variation', 10 );
}
add_action( 'wp', 'tg_crochets_woocommerce' );

/**
 * Le zoom, la visionneuse et le diaporama de WooCommerce ne servent pas : la galerie de la maquette les remplace.
 */
function tg_galerie_wc_inutile() {
	if ( function_exists( 'is_product' ) && is_product() ) {
		wp_dequeue_script( 'zoom' );
		wp_dequeue_script( 'flexslider' );
		wp_dequeue_script( 'photoswipe-ui-default' );
		wp_dequeue_script( 'wc-zoom' );
		wp_dequeue_script( 'wc-flexslider' );
		wp_dequeue_script( 'wc-photoswipe-ui-default' );
		wp_dequeue_style( 'photoswipe-default-skin' );
		wp_dequeue_style( 'wc-photoswipe-default-skin' );
		remove_action( 'wp_footer', 'woocommerce_photoswipe' );
	}
}
add_action( 'wp_enqueue_scripts', 'tg_galerie_wc_inutile', 100 );

/**
 * Fil d'Ariane de la maquette : Accueil / Collection / Paysages / Le Pic du Midi.
 *
 * @param WC_Product|null $produit Produit (fiche) ou null (boutique, catégorie).
 * @return string
 */
function tg_fil_ariane( $produit = null ) {
	$etapes = array( array( 'Accueil', home_url( '/' ) ) );
	if ( $produit ) {
		$coll  = tg_collection( $produit );
		$noms  = tg_collections();
		if ( 'accessoires' === $coll ) {
			$etapes[] = array( 'Accessoires', tg_url_boutique() . '#accessoires' );
		} else {
			$etapes[] = array( 'Collection', tg_url_boutique() );
			$etapes[] = array( $noms[ $coll ], tg_url_boutique() . '#' . $coll );
		}
		$etapes[] = array( $produit->get_name(), '' );
	} elseif ( is_product_taxonomy() ) {
		$etapes[] = array( 'Collection', tg_url_boutique() );
		$etapes[] = array( single_term_title( '', false ), '' );
	}
	$li = '';
	foreach ( $etapes as $e ) {
		$li .= $e[1] ? '<li><a href="' . esc_url( $e[1] ) . '">' . esc_html( $e[0] ) . '</a></li>' : '<li aria-current="page">' . esc_html( $e[0] ) . '</li>';
	}
	return '<nav aria-label="Fil d’Ariane" class="fil"><ol class="fil-ariane">' . $li . '</ol></nav>';
}

/**
 * [tg_entete_boutique] : en-tête de la collection (titre, présentation, filtres par thème, « Voir en »).
 * Sur une catégorie, son nom et sa description ; les filtres de la maquette restent sur la boutique.
 *
 * @return string
 */
function tg_code_entete_boutique() {
	if ( is_product_taxonomy() ) {
		$terme = get_queried_object();
		$desc  = $terme && ! empty( $terme->description ) ? '<p class="chapo">' . esc_html( $terme->description ) . '</p>' : '';
		return tg_fil_ariane() . '<header class="entete-page entete-page--serre"><p class="surtitre">Collection</p><h1>' . esc_html( single_term_title( '', false ) ) . '</h1>' . $desc . '</header>';
	}
	if ( is_search() ) {
		return '<header class="entete-page"><p class="surtitre">Recherche</p><h1>' . esc_html( sprintf( 'Résultats pour « %s »', get_search_query() ) ) . '</h1></header>';
	}
	$puces = '<button type="button" class="puce" data-filtre="tout" aria-pressed="true">Tout <span></span></button>';
	foreach ( tg_collections() as $cle => $nom ) {
		$puces .= '<button type="button" class="puce" data-filtre="' . esc_attr( $cle ) . '" aria-pressed="false">' . esc_html( $nom ) . ' <span></span></button>';
	}
	$puces .= '<button type="button" class="puce puce--cadeaux" data-filtre="cadeaux" aria-pressed="false">Idées cadeaux <span></span></button>';
	$voir   = '<span>Voir en</span>';
	foreach ( tg_finitions() as $f => $n ) {
		$voir .= '<button type="button" class="puce puce--fin fin-' . $f . '" data-voir-en="' . $f . '" aria-pressed="false">' . esc_html( $n[0] ) . '</button>';
	}
	return tg_fragment( 'collection_entete' )
		. '<div class="barre-filtres"><div class="puces" role="group" aria-label="Filtrer par thème">' . $puces . '</div>'
		. '<div class="voir-en" role="group" aria-label="Afficher toutes les plaques en">' . $voir . '</div></div>'
		. '<p class="compte" data-compte aria-live="polite"></p>';
}
add_shortcode( 'tg_entete_boutique', 'tg_code_entete_boutique' );

/**
 * [tg_surtitre_commande] : petit titre au-dessus de « Panier » et « Validation de la commande ».
 *
 * @return string
 */
function tg_code_surtitre_commande() {
	return '<p class="surtitre">' . ( is_checkout() ? 'Commande' : 'Votre sélection' ) . '</p>';
}
add_shortcode( 'tg_surtitre_commande', 'tg_code_surtitre_commande' );

/* -------------------------------------------------------------------------
 * Kit LED en option d'une plaque
 * Le kit est un produit variable (attribut « Emplacement câble »). Sur la fiche d'une plaque, la case « Ajouter le kit
 * LED » et le choix de la sortie du câble ajoutent au panier, en plus de la plaque, la variation du kit qui correspond,
 * en même quantité, avec la mention de la plaque à laquelle il est destiné.
 * ---------------------------------------------------------------------- */

/**
 * Attribut et variations du kit : [ clé attribute_…, [ valeur => id de variation ] ].
 *
 * @return array
 */
function tg_options_led() {
	$led = tg_produit_led();
	if ( ! $led ) {
		return array( '', array() );
	}
	$cle  = '';
	$opts = array();
	foreach ( $led->get_available_variations( 'objects' ) as $v ) {
		if ( ! $v->is_purchasable() || ! $v->is_in_stock() ) {
			continue;
		}
		foreach ( $v->get_variation_attributes() as $k => $val ) {
			if ( '' !== $val ) {
				$cle           = $k;
				$opts[ $val ] = $v->get_id();
			}
		}
	}
	return array( $cle, $opts );
}

/**
 * Le produit est-il une plaque (produit variable à finitions, hors kit LED) ?
 *
 * @param WC_Product|int $produit Produit.
 * @return bool
 */
function tg_est_plaque( $produit ) {
	$produit = is_numeric( $produit ) ? wc_get_product( $produit ) : $produit;
	return $produit && $produit->get_slug() !== tg_slug_led() && (bool) tg_attribut_finition( $produit );
}

/**
 * Vérifie le choix du kit avant l'ajout de la plaque.
 *
 * @param bool $ok         Valide.
 * @param int  $produit_id Produit.
 * @return bool
 */
function tg_valider_led( $ok, $produit_id ) {
	if ( empty( $_POST['tg_led'] ) || ! tg_est_plaque( $produit_id ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Missing
		return $ok;
	}
	list( , $opts ) = tg_options_led();
	$choix          = isset( $_POST['tg_led_cable'] ) ? sanitize_text_field( wp_unslash( $_POST['tg_led_cable'] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Missing
	if ( ! isset( $opts[ $choix ] ) ) {
		wc_add_notice( 'Choisissez la sortie du câble du kit LED.', 'error' );
		return false;
	}
	return $ok;
}
add_filter( 'woocommerce_add_to_cart_validation', 'tg_valider_led', 10, 2 );

/**
 * Ajoute le kit au panier juste après la plaque.
 *
 * @param string $cle          Clé de la ligne de la plaque.
 * @param int    $produit_id   Produit.
 * @param int    $quantite     Quantité.
 * @param int    $variation_id Variation.
 * @param array  $variation    Attributs.
 */
function tg_ajouter_led( $cle, $produit_id, $quantite, $variation_id, $variation ) {
	static $en_cours = false;
	if ( $en_cours || empty( $_POST['tg_led'] ) || ! tg_est_plaque( $produit_id ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Missing
		return;
	}
	list( $attr, $opts ) = tg_options_led();
	$choix               = isset( $_POST['tg_led_cable'] ) ? sanitize_text_field( wp_unslash( $_POST['tg_led_cable'] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Missing
	if ( ! isset( $opts[ $choix ] ) ) {
		return;
	}
	$plaque = wc_get_product( $produit_id );
	$fin    = '';
	foreach ( (array) $variation as $val ) {
		$f = tg_finition_de( $val );
		if ( $f ) {
			$fins = tg_finitions();
			$fin  = ', finition ' . $fins[ $f ][1];
		}
	}
	$en_cours = true;
	WC()->cart->add_to_cart(
		tg_produit_led()->get_id(),
		max( 1, (int) $quantite ),
		$opts[ $choix ],
		array( $attr => $choix ),
		array( 'tg_pour' => $plaque->get_name() . $fin )
	);
	$en_cours = false;
}
add_action( 'woocommerce_add_to_cart', 'tg_ajouter_led', 10, 5 );

/**
 * Mention « Pour la plaque » sous le kit, dans le panier, la commande et les e-mails.
 *
 * @param array $donnees Données affichées.
 * @param array $ligne   Ligne du panier.
 * @return array
 */
function tg_mention_led( $donnees, $ligne ) {
	if ( ! empty( $ligne['tg_pour'] ) ) {
		$donnees[] = array(
			'key'   => 'Pour la plaque',
			'value' => esc_html( $ligne['tg_pour'] ),
		);
	}
	return $donnees;
}
add_filter( 'woocommerce_get_item_data', 'tg_mention_led', 10, 2 );

/**
 * Garde la mention sur la ligne de commande.
 *
 * @param WC_Order_Item_Product $item   Ligne.
 * @param string                $cle    Clé.
 * @param array                 $valeur Ligne du panier.
 */
function tg_mention_led_commande( $item, $cle, $valeur ) {
	if ( ! empty( $valeur['tg_pour'] ) ) {
		$item->add_meta_data( 'Pour la plaque', $valeur['tg_pour'], true );
	}
}
add_action( 'woocommerce_checkout_create_order_line_item', 'tg_mention_led_commande', 10, 3 );

/**
 * Le kit ne se vend pas seul : sans plaque dans le panier, la commande est bloquée avec un message clair.
 *
 * @return bool Panier valable.
 */
function tg_led_sans_plaque() {
	if ( ! WC()->cart || ! tg_produit_led() ) {
		return false;
	}
	$led    = false;
	$plaque = false;
	foreach ( WC()->cart->get_cart() as $ligne ) {
		if ( (int) $ligne['product_id'] === tg_produit_led()->get_id() ) {
			$led = true;
		} elseif ( tg_est_plaque( (int) $ligne['product_id'] ) ) {
			$plaque = true;
		}
	}
	return $led && ! $plaque;
}

/** Message affiché quand le kit est seul. */
function tg_message_led_seul() {
	return 'Le kit LED se commande avec une plaque : l’atelier le colle au dos avant l’envoi. Ajoutez une plaque, ou retirez le kit du panier.';
}

add_action(
	'woocommerce_check_cart_items',
	function () {
		if ( tg_led_sans_plaque() ) {
			wc_add_notice( tg_message_led_seul(), 'error' );
		}
	}
);
add_action(
	'woocommerce_store_api_cart_errors',
	function ( $erreurs ) {
		if ( tg_led_sans_plaque() && $erreurs instanceof WP_Error ) {
			$erreurs->add( 'tg_led_seul', tg_message_led_seul() );
		}
	}
);

/**
 * Champ de quantité de la maquette : « − 1 + », de 1 à 9 (ou la limite de WooCommerce si elle est plus basse).
 *
 * @param WC_Product $produit Produit.
 * @param string     $quoi    plaque|carte|article (textes des boutons).
 */
function tg_champ_quantite( $produit, $quoi = 'plaque' ) {
	if ( $produit->is_sold_individually() ) {
		echo '<input type="hidden" name="quantity" value="1">';
		return;
	}
	$min    = max( 1, (int) $produit->get_min_purchase_quantity() );
	$max    = (int) $produit->get_max_purchase_quantity();
	$max    = $max > 0 ? min( 9, $max ) : 9;
	$valeur = isset( $_POST['quantity'] ) ? wc_stock_amount( wp_unslash( $_POST['quantity'] ) ) : $min; // phpcs:ignore WordPress.Security.NonceVerification.Missing
	$valeur = max( $min, min( $max, (int) $valeur ) );
	$noms   = array(
		'plaque'  => 'une plaque',
		'carte'   => 'une carte',
		'article' => 'un article',
	);
	$n      = isset( $noms[ $quoi ] ) ? $noms[ $quoi ] : $noms['article'];
	printf(
		'<div class="quantite"><button type="button" data-qte="-1" aria-label="%1$s">−</button><input id="quantite" class="qty" type="number" name="quantity" min="%3$d" max="%4$d" step="1" value="%5$d" inputmode="numeric" aria-label="Quantité"><button type="button" data-qte="1" aria-label="%2$s">+</button></div>',
		esc_attr( 'Retirer ' . $n ),
		esc_attr( 'Ajouter ' . $n ),
		(int) $min,
		(int) $max,
		(int) $valeur
	);
}

/**
 * Sur la boutique et les fiches, les feuilles de style générales de WooCommerce sont remplacées par celles du thème
 * (elles visent la mise en page classique : colonnes, galerie, onglets). Ailleurs (compte, confirmation), elles restent.
 */
function tg_styles_wc() {
	if ( is_product() || is_shop() || is_product_taxonomy() ) {
		wp_dequeue_style( 'woocommerce-general' );
		wp_dequeue_style( 'woocommerce-layout' );
		wp_dequeue_style( 'woocommerce-smallscreen' );
	}
}
add_action( 'wp_enqueue_scripts', 'tg_styles_wc', 99 );

/**
 * Bouton final de la commande : « Commander avec obligation de paiement » (Code de la consommation, L221-14),
 * sauf si un autre libellé a été réglé dans le bloc Validation de la commande.
 *
 * @param string $html HTML du bloc « Actions » de la validation de commande.
 * @return string
 */
function tg_libelle_commande( $html ) {
	if ( false === strpos( $html, 'data-place-order-button-label' ) ) {
		$html = preg_replace( '/class="wp-block-woocommerce-checkout-actions-block"/', 'class="wp-block-woocommerce-checkout-actions-block" data-place-order-button-label="Commander avec obligation de paiement"', $html, 1 );
	}
	return $html;
}
add_filter( 'render_block_woocommerce/checkout-actions-block', 'tg_libelle_commande' );

/**
 * Pages liées par WooCommerce sous le bouton de commande : CGV et confidentialité de la maquette, si elles existent et
 * qu'aucune page n'est encore choisie.
 */
function tg_pages_legales_wc() {
	if ( ! (int) get_option( 'woocommerce_terms_page_id' ) ) {
		$cgv = get_page_by_path( 'cgv' );
		if ( $cgv && 'publish' === $cgv->post_status ) {
			update_option( 'woocommerce_terms_page_id', $cgv->ID );
		}
	}
}
add_action( 'after_switch_theme', 'tg_pages_legales_wc' );

/* -------------------------------------------------------------------------
 * Opposition aux offres par e-mail, au moment de la commande
 * ---------------------------------------------------------------------- */

/**
 * La politique de confidentialité annonce des offres aux clients pour des produits analogues, « sauf opposition au
 * moment de la commande » (Code des postes et des communications électroniques, art. L34-5) : une case non cochée
 * dans la validation de commande (bloc « Informations supplémentaires » de WooCommerce), enregistrée sur la commande
 * (visible dans la commande et dans l'e-mail de commande envoyé à l'atelier).
 */
function tg_champ_refus_offres() {
	if ( ! function_exists( 'woocommerce_register_additional_checkout_field' ) ) {
		return;
	}
	woocommerce_register_additional_checkout_field(
		array(
			'id'       => 'terre-gravee/refus-offres',
			'label'    => 'Je ne souhaite pas recevoir d’offres de Terre Gravée par e-mail',
			'location' => 'order',
			'type'     => 'checkbox',
		)
	);
}
add_action( 'woocommerce_init', 'tg_champ_refus_offres' );

/* -------------------------------------------------------------------------
 * Aucune note ni avis dans les données structurées
 * ---------------------------------------------------------------------- */

/**
 * Rank Math écrit la note moyenne et les avis d'une fiche dès qu'un avis est approuvé, même avis désactivés dans
 * WooCommerce. Règle du site : aucune note ni avis (les anciens avis ne doivent plus s'afficher). On les retire de
 * l'entité Product, sans rien ajouter d'autre.
 *
 * @param mixed $donnees Données JSON-LD validées de Rank Math.
 * @return mixed
 */
function tg_sans_note_jsonld( $donnees ) {
	if ( ! is_array( $donnees ) ) {
		return $donnees;
	}
	foreach ( $donnees as $cle => $entite ) {
		if ( ! is_array( $entite ) || empty( $entite['@type'] ) ) {
			continue;
		}
		$types = (array) $entite['@type'];
		if ( array_intersect( $types, array( 'Product', 'ProductGroup' ) ) ) {
			unset( $donnees[ $cle ]['aggregateRating'], $donnees[ $cle ]['review'] );
		}
	}
	return $donnees;
}
add_filter( 'rank_math/schema/validated_data', 'tg_sans_note_jsonld', 99 );

/**
 * Même règle pour les données structurées de WooCommerce (utilisées si Rank Math est désactivé).
 *
 * @param array $donnees Données du produit.
 * @return array
 */
function tg_sans_note_wc( $donnees ) {
	unset( $donnees['aggregateRating'], $donnees['review'] );
	return $donnees;
}
add_filter( 'woocommerce_structured_data_product', 'tg_sans_note_wc', 99 );

/* -------------------------------------------------------------------------
 * Finition lisible dans le panier, la commande et les e-mails
 * ---------------------------------------------------------------------- */

/**
 * Hors de l'écran de modification d'un produit (où les vraies valeurs NOIR, GRIS, DOREE doivent rester visibles).
 *
 * @return bool
 */
function tg_affichage_client() {
	if ( ! is_admin() || wp_doing_ajax() ) {
		return true;
	}
	$ecran = function_exists( 'get_current_screen' ) ? get_current_screen() : null;
	return ! ( $ecran && 'product' === $ecran->id );
}

/**
 * L'attribut de finition (« couleur ») s'affiche « Finition ».
 *
 * @param string $libelle Libellé.
 * @param string $nom     Nom de l'attribut.
 * @return string
 */
function tg_libelle_finition( $libelle, $nom ) {
	if ( tg_affichage_client() && in_array( sanitize_title( str_replace( 'attribute_', '', (string) $nom ) ), array( 'couleur', 'pa_couleur' ), true ) ) {
		return 'Finition';
	}
	return $libelle;
}
add_filter( 'woocommerce_attribute_label', 'tg_libelle_finition', 10, 2 );

/**
 * Valeur de finition lisible (« DOREE » → « dorée »), sinon la valeur telle quelle.
 *
 * @param string $valeur Valeur brute.
 * @return string
 */
function tg_finition_lisible( $valeur ) {
	$f    = tg_finition_de( $valeur );
	$noms = tg_finitions();
	return $f ? $noms[ $f ][1] : $valeur;
}

/**
 * Panier (bloc et classique) : valeur de finition lisible.
 *
 * @param string     $nom       Valeur affichée.
 * @param mixed      $terme     Terme (attribut global) ou null.
 * @param string     $attribut  Attribut.
 * @param WC_Product $produit   Produit.
 * @return string
 */
function tg_valeur_finition( $nom, $terme = null, $attribut = '', $produit = null ) {
	if ( ! tg_affichage_client() ) {
		return $nom;
	}
	$a = sanitize_title( str_replace( 'attribute_', '', (string) $attribut ) );
	if ( in_array( $a, array( 'couleur', 'pa_couleur' ), true ) ) {
		return tg_finition_lisible( $nom );
	}
	return $nom;
}
add_filter( 'woocommerce_variation_option_name', 'tg_valeur_finition', 10, 4 );

/**
 * Commande, page « commande reçue » et e-mails : valeur de finition lisible.
 *
 * @param string       $valeur Valeur affichée.
 * @param WC_Meta_Data $meta   Donnée de la ligne.
 * @return string
 */
function tg_meta_finition( $valeur, $meta ) {
	if ( is_object( $meta ) && in_array( sanitize_title( (string) $meta->key ), array( 'couleur', 'pa_couleur' ), true ) ) {
		return wp_kses_post( wpautop( tg_finition_lisible( wp_strip_all_tags( (string) $meta->value ) ) ) );
	}
	return $valeur;
}
add_filter( 'woocommerce_order_item_display_meta_value', 'tg_meta_finition', 10, 2 );

/**
 * Nom d'une plaque sans la valeur brute de la finition (« L’Ours - NOIR » → « L’Ours ») : la finition est affichée
 * à part, sur sa propre ligne.
 *
 * @param string $nom Nom.
 * @return string
 */
function tg_nom_sans_finition( $nom ) {
	$morceaux = preg_split( '/\s[-–]\s/u', (string) $nom );
	if ( count( $morceaux ) > 1 && tg_finition_de( end( $morceaux ) ) && strlen( end( $morceaux ) ) <= 12 ) {
		array_pop( $morceaux );
		return implode( ' - ', $morceaux );
	}
	return $nom;
}

/**
 * Nom des variations pour les nouvelles commandes.
 *
 * @param string     $nom     Nom.
 * @param WC_Product $produit Variation.
 * @return string
 */
function tg_nom_variation( $nom, $produit ) {
	return ( ! is_admin() || wp_doing_ajax() ) ? tg_nom_sans_finition( $nom ) : $nom;
}
add_filter( 'woocommerce_product_variation_get_name', 'tg_nom_variation', 10, 2 );

/**
 * Nom des lignes des commandes déjà passées (page « commande reçue », e-mails).
 *
 * @param string                $nom  Nom (HTML).
 * @param WC_Order_Item_Product $item Ligne.
 * @return string
 */
function tg_nom_ligne_commande( $nom, $item ) {
	if ( ! $item instanceof WC_Order_Item_Product || ! $item->get_variation_id() ) {
		return $nom;
	}
	$brut = $item->get_name();
	$net  = tg_nom_sans_finition( $brut );
	return $net === $brut ? $nom : str_replace( esc_html( $brut ), esc_html( $net ), str_replace( $brut, $net, $nom ) );
}
add_filter( 'woocommerce_order_item_name', 'tg_nom_ligne_commande', 10, 2 );
