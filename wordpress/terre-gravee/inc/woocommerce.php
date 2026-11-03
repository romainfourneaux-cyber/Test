<?php
/**
 * WooCommerce : gabarits de la maquette (boutique, fiche), kit LED en option d'une plaque, en-tête de la boutique.
 *
 * Le panier et la validation de commande restent ceux de WooCommerce (blocs Panier et Validation de commande),
 * mis aux couleurs de la maquette par assets/wp.css. Les données structurées des produits restent celles de
 * WooCommerce et de Rank Math : le thème n'ajoute aucune entité, il corrige seulement celle du produit (nom, sans
 * note ni avis, livraison et retours).
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
		// tg_plaque_cle : la ligne de la plaque, pour limiter le kit à la quantité de cette plaque
		array(
			'tg_pour'       => $plaque->get_name() . $fin,
			'tg_plaque_cle' => $cle,
		)
	);
	$en_cours = false;
}
add_action( 'woocommerce_add_to_cart', 'tg_ajouter_led', 10, 5 );

/**
 * La ligne du panier est-elle un kit LED ?
 *
 * @param array $ligne Ligne du panier.
 * @return bool
 */
function tg_ligne_est_led( $ligne ) {
	$led = tg_produit_led();
	return $led && isset( $ligne['product_id'] ) && (int) $ligne['product_id'] === $led->get_id();
}

/**
 * Nombre de plaques auxquelles un kit LED du panier peut être destiné : la quantité de la plaque liée (kit ajouté
 * depuis sa fiche), sinon toutes les plaques du panier.
 *
 * @param array $ligne Ligne du kit.
 * @return int
 */
function tg_plaques_pour_led( $ligne ) {
	$panier = WC()->cart ? WC()->cart->get_cart() : array();
	if ( ! empty( $ligne['tg_plaque_cle'] ) && isset( $panier[ $ligne['tg_plaque_cle'] ] ) ) {
		return (int) $panier[ $ligne['tg_plaque_cle'] ]['quantity'];
	}
	$n = 0;
	foreach ( $panier as $l ) {
		if ( isset( $l['product_id'] ) && tg_est_plaque( (int) $l['product_id'] ) ) {
			$n += (int) $l['quantity'];
		}
	}
	return $n;
}

/**
 * Kits en trop : un kit par plaque au plus (l'atelier colle un kit au dos de chaque plaque).
 *
 * @return string[] Messages, un par ligne de kit en trop.
 */
function tg_led_en_trop() {
	$messages = array();
	if ( ! WC()->cart || ! tg_produit_led() ) {
		return $messages;
	}
	$kits    = 0;
	$plaques = 0;
	foreach ( WC()->cart->get_cart() as $ligne ) {
		if ( tg_ligne_est_led( $ligne ) ) {
			$kits += (int) $ligne['quantity'];
			$max   = tg_plaques_pour_led( $ligne );
			if ( $max > 0 && (int) $ligne['quantity'] > $max ) {
				$pour       = ! empty( $ligne['tg_pour'] ) ? ' prévu pour « ' . $ligne['tg_pour'] . ' »' : '';
				$messages[] = sprintf( 'Un kit LED par plaque : ramenez la quantité du kit LED%1$s à %2$d.', $pour, $max );
			}
		} elseif ( isset( $ligne['product_id'] ) && tg_est_plaque( (int) $ligne['product_id'] ) ) {
			$plaques += (int) $ligne['quantity'];
		}
	}
	if ( ! $messages && $plaques > 0 && $kits > $plaques ) {
		$messages[] = sprintf( 'Un kit LED par plaque : le panier compte %1$d kits pour %2$d plaque%3$s.', $kits, $plaques, $plaques > 1 ? 's' : '' );
	}
	return $messages;
}

/**
 * Panier en blocs : le bouton « + » du kit s'arrête à la quantité de sa plaque.
 *
 * @param int|float  $max     Maximum.
 * @param WC_Product $produit Produit.
 * @param array|null $ligne   Ligne du panier.
 * @return int|float
 */
function tg_max_led_blocs( $max, $produit, $ligne = null ) {
	if ( is_array( $ligne ) && tg_ligne_est_led( $ligne ) && WC()->cart ) {
		$max = min( $max, max( 1, tg_plaques_pour_led( $ligne ) ) );
	}
	return $max;
}
add_filter( 'woocommerce_store_api_product_quantity_maximum', 'tg_max_led_blocs', 10, 3 );

/**
 * Panier classique : même limite sur le champ de quantité du kit.
 *
 * @param array      $args    Réglages du champ.
 * @param WC_Product $produit Produit.
 * @return array
 */
function tg_max_led_classique( $args, $produit ) {
	if ( ! is_cart() || ! WC()->cart || ! $produit || ! tg_produit_led() || (int) $produit->get_parent_id() !== tg_produit_led()->get_id() ) {
		return $args;
	}
	foreach ( WC()->cart->get_cart() as $cle => $ligne ) {
		if ( tg_ligne_est_led( $ligne ) && isset( $args['input_name'] ) && 'cart[' . $cle . '][qty]' === $args['input_name'] ) {
			$args['max_value'] = max( 1, tg_plaques_pour_led( $ligne ) );
		}
	}
	return $args;
}
add_filter( 'woocommerce_quantity_input_args', 'tg_max_led_classique', 10, 2 );

/**
 * Libellé lisible de la sortie du câble (« Haut Droite » → « Haut droite »), comme sur la fiche.
 *
 * @param string $valeur Valeur de l'attribut.
 * @return string
 */
function tg_libelle_cable( $valeur ) {
	$valeur = trim( (string) $valeur );
	if ( '' === $valeur ) {
		return $valeur;
	}
	$bas = function_exists( 'mb_strtolower' ) ? mb_strtolower( $valeur, 'UTF-8' ) : strtolower( $valeur );
	return ( function_exists( 'mb_strtoupper' ) ? mb_strtoupper( mb_substr( $bas, 0, 1, 'UTF-8' ), 'UTF-8' ) . mb_substr( $bas, 1, null, 'UTF-8' ) : ucfirst( $bas ) );
}

/**
 * L'attribut est-il celui de la sortie du câble du kit LED (« Emplacement câble ») ?
 *
 * @param string $nom Nom de l'attribut (attribute_…, pa_…, ou clé de donnée de commande).
 * @return bool
 */
function tg_attribut_cable( $nom ) {
	$a = sanitize_title( str_replace( array( 'attribute_', 'pa_' ), '', urldecode( (string) $nom ) ) );
	return false !== strpos( $a, 'cable' );
}

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
		foreach ( tg_led_en_trop() as $message ) {
			wc_add_notice( $message, 'error' );
		}
	}
);
add_action(
	'woocommerce_store_api_cart_errors',
	function ( $erreurs ) {
		if ( ! $erreurs instanceof WP_Error ) {
			return;
		}
		if ( tg_led_sans_plaque() ) {
			$erreurs->add( 'tg_led_seul', tg_message_led_seul() );
		}
		foreach ( tg_led_en_trop() as $i => $message ) {
			$erreurs->add( 'tg_led_en_trop_' . $i, $message );
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
 * Libellé du bouton final de la commande (Code de la consommation, L221-14), le même que celui de l'extrait WPCode
 * « Caisse : bouton de commande et mention TVA » du site en ligne.
 *
 * @return string
 */
function tg_texte_bouton_commande() {
	return 'Commande avec obligation de paiement';
}

/**
 * Bloc Validation de la commande : ce libellé, sauf si un autre a été réglé dans le bloc.
 *
 * @param string $html HTML du bloc « Actions » de la validation de commande.
 * @return string
 */
function tg_libelle_commande( $html ) {
	if ( false === strpos( $html, 'data-place-order-button-label' ) ) {
		$html = preg_replace( '/class="wp-block-woocommerce-checkout-actions-block"/', 'class="wp-block-woocommerce-checkout-actions-block" data-place-order-button-label="' . esc_attr( tg_texte_bouton_commande() ) . '"', $html, 1 );
	}
	return $html;
}
add_filter( 'render_block_woocommerce/checkout-actions-block', 'tg_libelle_commande' );

// Validation classique (code court) : même libellé. Priorité basse : l'extrait WPCode du site, s'il est actif, passe après avec le même texte.
add_filter( 'woocommerce_order_button_text', 'tg_texte_bouton_commande', 5 );

/**
 * Mention « TVA non applicable » sous la validation de commande en blocs (sur la validation classique, l'extrait
 * WPCode du site l'écrit déjà sous le total : rien n'est ajouté pour ne pas la doubler).
 *
 * @param string $html HTML du bloc Validation de la commande.
 * @return string
 */
function tg_mention_tva_blocs( $html ) {
	if ( is_admin() || wp_is_json_request() || false !== strpos( $html, 'tg-mention-tva' ) ) {
		return $html;
	}
	return $html . '<p class="tg-mention-tva petit attenue">Prix TTC · TVA non applicable, art. 293 B du CGI</p>';
}
add_filter( 'render_block_woocommerce/checkout', 'tg_mention_tva_blocs', 20 );

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
 * Champs de la validation en blocs : les mêmes que la validation classique du site
 * ---------------------------------------------------------------------- */

/**
 * Sur terregravee.fr, l'extension « Checkout Field Editor » (ThemeHigh) remplace, pour la validation en blocs, les
 * champs d'adresse de WooCommerce par sa propre liste : téléphone facultatif, « Company name » affiché, champ
 * « Région / Département » obligatoire. Les réglages de WooCommerce (Personnaliser › WooCommerce › Validation de
 * commande : téléphone obligatoire, entreprise masquée, réglages déjà en place pour la validation classique) sont
 * alors ignorés. On enregistre les champs de WooCommerce avant elle (priorité 5 contre 999 : la première valeur
 * enregistrée est gardée) : les blocs suivent de nouveau ces réglages. Filtre « tg_champs_woocommerce_blocs » à false
 * pour laisser faire l'extension.
 */
function tg_champs_blocs_woocommerce() {
	// Noms complets sans barre initiale : le conteneur de WooCommerce ne reconnaît que cette forme
	$package  = 'Automattic\WooCommerce\Blocks\Package';
	$champs   = 'Automattic\WooCommerce\Blocks\Domain\Services\CheckoutFields';
	$registre = 'Automattic\WooCommerce\Blocks\Assets\AssetDataRegistry';
	if ( ! class_exists( $package ) || ! class_exists( $champs ) || ! class_exists( $registre ) || ! apply_filters( 'tg_champs_woocommerce_blocs', true ) ) {
		return;
	}
	try {
		$service = $package::container()->get( $champs );
		$package::container()->get( $registre )->add( 'defaultFields', array_merge( $service->get_core_fields(), $service->get_additional_fields() ) );
	} catch ( \Throwable $e ) {
		return; // L'extension garde la main : rien de cassé
	}
}
add_action( 'woocommerce_blocks_checkout_block_registration', 'tg_champs_blocs_woocommerce', 5 );

/**
 * France : pas de champ « Région / Département » (comme le prévoit WooCommerce pour la France et comme la validation
 * classique du site). La même extension l'affiche et le rend obligatoire pour tous les pays (priorité 999).
 *
 * @param array $locale Réglages d'adresse par pays.
 * @return array
 */
function tg_locale_france( $locale ) {
	if ( ! apply_filters( 'tg_champs_woocommerce_blocs', true ) ) {
		return $locale;
	}
	$etat                  = isset( $locale['FR']['state'] ) && is_array( $locale['FR']['state'] ) ? $locale['FR']['state'] : array();
	$locale['FR']['state'] = array_merge( $etat, array( 'required' => false, 'hidden' => true ) );
	return $locale;
}
add_filter( 'woocommerce_get_country_locale', 'tg_locale_france', 1000 );

/* -------------------------------------------------------------------------
 * Corse et étranger : un message clair quand aucun mode de livraison n'est proposé
 * ---------------------------------------------------------------------- */

/**
 * Texte affiché à la place des modes de livraison (zone « Corse (non desservie) » sans méthode, pays non desservis).
 * Le même texte est repris par assets/terre-gravee.js pour le panier et la validation en blocs.
 *
 * @return string
 */
function tg_texte_sans_livraison() {
	return 'Nous ne livrons pas la Corse ni l’étranger : aucun mode de livraison n’est proposé pour cette adresse. Pour une demande particulière, écrivez-nous à contact@terregravee.fr.';
}

/**
 * Pages classiques (codes courts) : le message de WooCommerce « Aucune méthode de livraison… » devient explicite.
 *
 * @return string
 */
function tg_html_sans_livraison() {
	return '<p class="tg-sans-livraison">' . esc_html( tg_texte_sans_livraison() ) . '</p>';
}
add_filter( 'woocommerce_no_shipping_available_html', 'tg_html_sans_livraison' );
add_filter( 'woocommerce_cart_no_shipping_available_html', 'tg_html_sans_livraison' );

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
			$donnees[ $cle ] = tg_jsonld_produit( $donnees[ $cle ] );
		}
	}
	return $donnees;
}
add_filter( 'rank_math/schema/validated_data', 'tg_sans_note_jsonld', 99 );

/**
 * Entité Product de la fiche : le nom du produit (Rank Math y met le titre de la page, « … · Terre Gravée »),
 * la livraison (5 € par commande en France métropolitaine, offerte pendant l'offre de Noël, comme l'extrait WPCode
 * « Livraison offerte Noël 2026 ») et le droit de rétractation de 14 jours des CGV (retour par courrier, à la charge
 * du client).
 *
 * @param array $entite Entité JSON-LD.
 * @return array
 */
function tg_jsonld_produit( $entite ) {
	$produit = function_exists( 'is_product' ) && is_product() ? wc_get_product( get_queried_object_id() ) : null;
	if ( ! $produit ) {
		return $entite;
	}
	$entite['name'] = wp_strip_all_tags( $produit->get_name() );
	if ( empty( $entite['offers'] ) || ! is_array( $entite['offers'] ) ) {
		return $entite;
	}
	$frais     = ( function_exists( 'tg_etat_noel' ) && 'pendant' === tg_etat_noel() ) ? '0' : '5';
	$livraison = array(
		'@type'               => 'OfferShippingDetails',
		'shippingRate'        => array(
			'@type'    => 'MonetaryAmount',
			'value'    => $frais,
			'currency' => 'EUR',
		),
		'shippingDestination' => array(
			'@type'          => 'DefinedRegion',
			'addressCountry' => 'FR',
		),
		'deliveryTime'        => array(
			'@type'        => 'ShippingDeliveryTime',
			'handlingTime' => array(
				'@type'    => 'QuantitativeValue',
				'minValue' => 2,
				'maxValue' => 4,
				'unitCode' => 'DAY',
			),
			'transitTime'  => array(
				'@type'    => 'QuantitativeValue',
				'minValue' => 4,
				'maxValue' => 5,
				'unitCode' => 'DAY',
			),
		),
	);
	$retour    = array(
		'@type'                => 'MerchantReturnPolicy',
		'applicableCountry'    => 'FR',
		'returnPolicyCategory' => 'https://schema.org/MerchantReturnFiniteReturnWindow',
		'merchantReturnDays'   => 14,
		'returnMethod'         => 'https://schema.org/ReturnByMail',
		'returnFees'           => 'https://schema.org/ReturnFeesCustomerResponsibility',
	);
	// Carte cadeau et autres produits sans envoi : ni livraison ni retour par courrier
	if ( ! $produit->needs_shipping() ) {
		return $entite;
	}
	$ajout   = array(
		'shippingDetails'         => $livraison,
		'hasMerchantReturnPolicy' => $retour,
	);
	$ajouter = function ( $offre ) use ( $ajout ) {
		if ( is_array( $offre ) && ! empty( $offre['@type'] ) ) {
			$offre += $ajout;
		}
		return $offre;
	};
	if ( isset( $entite['offers']['@type'] ) ) {
		$entite['offers'] = $ajouter( $entite['offers'] );
	} else {
		$entite['offers'] = array_map( $ajouter, $entite['offers'] );
	}
	return $entite;
}

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
	if ( tg_attribut_cable( $attribut ) ) {
		return tg_libelle_cable( $nom );
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
	if ( is_object( $meta ) && tg_attribut_cable( (string) $meta->key ) && tg_affichage_client() ) {
		return wp_kses_post( wpautop( tg_libelle_cable( wp_strip_all_tags( (string) $meta->value ) ) ) );
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
