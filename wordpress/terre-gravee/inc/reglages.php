<?php
/**
 * Réglages du thème : prises en charge, styles et script, catégories de compositions, classes du corps de page.
 *
 * @package TerreGravee
 */

defined( 'ABSPATH' ) || exit;

/**
 * Prises en charge du thème.
 */
function tg_reglages() {
	add_theme_support( 'woocommerce' );
	add_theme_support( 'editor-styles' );
	add_theme_support( 'responsive-embeds' );
	add_editor_style( array( 'assets/galerie.css', 'assets/wp.css', 'assets/editeur.css' ) );
	// Les compositions de WordPress.org (catalogue distant) ne servent pas ici.
	remove_theme_support( 'core-block-patterns' );
}
add_action( 'after_setup_theme', 'tg_reglages' );

/**
 * Catégories des compositions du thème.
 */
function tg_categories_compositions() {
	register_block_pattern_category( 'terre-gravee', array( 'label' => 'Terre Gravée : sections' ) );
	register_block_pattern_category( 'terre-gravee-pages', array( 'label' => 'Terre Gravée : pages complètes' ) );
}
add_action( 'init', 'tg_categories_compositions' );

/**
 * Version d'un fichier du thème (date de modification), pour que les navigateurs reprennent le fichier modifié.
 *
 * @param string $relatif Chemin dans le thème.
 * @return string
 */
function tg_version_fichier( $relatif ) {
	$chemin = get_theme_file_path( $relatif );
	return file_exists( $chemin ) ? TG_VERSION . '.' . filemtime( $chemin ) : TG_VERSION;
}

/**
 * Fuseau horaire du site sous forme de nom IANA (« Europe/Paris »). Un réglage en décalage fixe (UTC+1) n'a pas de
 * nom : on garde Europe/Paris, le fuseau de l'atelier.
 *
 * @return string
 */
function tg_fuseau_iana() {
	$f = wp_timezone_string();
	return ( false !== strpos( $f, '/' ) ) ? $f : 'Europe/Paris';
}

/**
 * Styles et script.
 */
function tg_styles_et_script() {
	wp_enqueue_style( 'terre-gravee-galerie', get_theme_file_uri( 'assets/galerie.css' ), array(), tg_version_fichier( 'assets/galerie.css' ) );
	wp_enqueue_style( 'terre-gravee', get_theme_file_uri( 'assets/wp.css' ), array( 'terre-gravee-galerie' ), tg_version_fichier( 'assets/wp.css' ) );
	wp_enqueue_script( 'terre-gravee', get_theme_file_uri( 'assets/terre-gravee.js' ), array(), tg_version_fichier( 'assets/terre-gravee.js' ), array( 'in_footer' => true, 'strategy' => 'defer' ) );
	$offre = tg_offre();
	wp_add_inline_script(
		'terre-gravee',
		'window.TG = ' . wp_json_encode(
			array(
				'offreDebut' => $offre['debut'],
				'offreFin'   => $offre['fin'],
				'noelFin'    => $offre['noel_fin'],
				'etatServeur' => tg_etat_noel(),
				// Fuseau du site (nom IANA, Europe/Paris sur terregravee.fr) : le navigateur calcule la date à l'heure du site
				'fuseau'      => tg_fuseau_iana(),
				// Date simulée du site de test (TG_DATE_ESSAI) : le navigateur suit le serveur
				'dateEssai'   => defined( 'TG_DATE_ESSAI' ) ? tg_aujourdhui() : '',
				// Panier et validation en blocs : message quand aucune livraison n'est proposée (Corse, étranger)
				'sansLivraison' => function_exists( 'tg_texte_sans_livraison' ) ? tg_texte_sans_livraison() : '',
			)
		) . ';',
		'before'
	);
}
add_action( 'wp_enqueue_scripts', 'tg_styles_et_script' );

/**
 * Émojis de WordPress désactivés : leur script écrit dans le stockage du navigateur (wpEmojiSettingsSupports) sur
 * toutes les pages et charge des images depuis s.w.org. Les navigateurs affichent les émojis eux-mêmes.
 */
function tg_sans_emojis() {
	remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
	remove_action( 'wp_print_styles', 'print_emoji_styles' );
	remove_action( 'wp_enqueue_scripts', 'wp_enqueue_emoji_styles' );
	remove_action( 'admin_print_scripts', 'print_emoji_detection_script' );
	remove_action( 'admin_print_styles', 'print_emoji_styles' );
	remove_action( 'admin_enqueue_scripts', 'wp_enqueue_emoji_styles' );
	remove_filter( 'the_content_feed', 'wp_staticize_emoji' );
	remove_filter( 'comment_text_rss', 'wp_staticize_emoji' );
	remove_filter( 'wp_mail', 'wp_staticize_emoji_for_email' );
	add_filter( 'emoji_svg_url', '__return_false' );
}
add_action( 'init', 'tg_sans_emojis' );

/**
 * Le panier en blocs dit « Expédition », la validation « Livraison » : un seul mot, « Livraison », partout.
 * Textes de WooCommerce traduits côté serveur (gettext) et dans les scripts des blocs (wp.i18n).
 *
 * @param string $traduction Texte traduit.
 * @param string $texte      Texte d'origine.
 * @param string $domaine    Domaine.
 * @return string
 */
function tg_mot_livraison( $traduction, $texte, $domaine ) {
	return ( 'woocommerce' === $domaine && 'Expédition' === $traduction ) ? 'Livraison' : $traduction;
}
add_filter( 'gettext', 'tg_mot_livraison', 10, 3 );

/**
 * Même règle dans les scripts des blocs Panier et Validation de commande.
 */
function tg_mot_livraison_js() {
	if ( ! wp_script_is( 'wp-hooks', 'registered' ) || ! wp_script_is( 'wp-i18n', 'registered' ) ) {
		return;
	}
	wp_add_inline_script(
		'wp-i18n',
		'(function(){if(!window.wp||!wp.hooks)return;var f=function(t){return t==="Expédition"?"Livraison":t;};'
		. 'wp.hooks.addFilter("i18n.gettext_woocommerce","terre-gravee/livraison",f);'
		. 'wp.hooks.addFilter("i18n.gettext_with_context_woocommerce","terre-gravee/livraison",f);})();'
	);
}
add_action( 'wp_enqueue_scripts', 'tg_mot_livraison_js', 5 );

/**
 * Préchargement des deux polices du premier écran (titres et texte).
 */
function tg_prechargement() {
	foreach ( array( 'marcellus-400.woff2', 'jost.woff2' ) as $police ) {
		printf( '<link rel="preload" href="%s" as="font" type="font/woff2" crossorigin>' . "\n", esc_url( get_theme_file_uri( 'assets/fonts/' . $police ) ) );
	}
	echo '<meta name="color-scheme" content="light dark">' . "\n";
}
add_action( 'wp_head', 'tg_prechargement', 2 );

/**
 * Classes du corps de page, comme dans la maquette (page-accueil, page-fiche, page-legale…).
 *
 * @param string[] $classes Classes.
 * @return string[]
 */
function tg_classes_corps( $classes ) {
	$par_slug = array(
		'accueil'          => 'page-accueil',
		'carte-des-lieux'  => 'page-carte',
		'propos'           => 'page-atelier',
		'creations'        => 'page-sur-mesure',
		'tuto'             => 'page-installation',
		'contact'          => 'page-contact',
		'cgv'              => 'page-legale',
		'mentions-legales' => 'page-legale',
		'politique'        => 'page-legale',
	);
	if ( is_front_page() ) {
		$classes[] = 'page-accueil';
	} elseif ( is_page() ) {
		$slug = get_post_field( 'post_name', get_queried_object_id() );
		if ( isset( $par_slug[ $slug ] ) ) {
			$classes[] = $par_slug[ $slug ];
		}
	}
	if ( function_exists( 'is_product' ) && is_product() ) {
		$classes[] = 'page-fiche';
	}
	if ( function_exists( 'is_shop' ) && ( is_shop() || is_product_taxonomy() ) ) {
		$classes[] = 'page-collection';
	}
	return $classes;
}
add_filter( 'body_class', 'tg_classes_corps' );
