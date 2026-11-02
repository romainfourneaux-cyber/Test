<?php
/**
 * Contenu : adresses du contenu importé, menu actif, morceaux de la maquette, codes courts communs.
 *
 * @package TerreGravee
 */

defined( 'ABSPATH' ) || exit;

/**
 * Adresse de la boutique (« /produits/ » sur terregravee.fr, mais le réglage WooCommerce fait foi).
 *
 * @return string
 */
function tg_url_boutique() {
	if ( function_exists( 'wc_get_page_permalink' ) ) {
		$url = wc_get_page_permalink( 'shop' );
		if ( $url && home_url( '/' ) !== $url ) {
			return $url;
		}
	}
	return home_url( '/produits/' );
}

/**
 * Le contenu importé (pages, menu, pied de page) écrit ses liens et images comme sur terregravee.fr :
 * « /produits/ » pour la boutique et « /wp-content/themes/terre-gravee/assets/img/ » pour les images du thème.
 * Si la boutique ou le thème sont ailleurs, on corrige à l'affichage. L'opération est sans effet quand tout est en place.
 *
 * @param string $html HTML.
 * @return string
 */
function tg_reecrire_adresses( $html ) {
	if ( ! is_string( $html ) || '' === $html ) {
		return $html;
	}
	if ( false !== strpos( $html, 'href="/produits/' ) ) {
		$boutique = tg_url_boutique();
		$html     = str_replace( array( 'href="/produits/"', 'href="/produits/#' ), array( 'href="' . esc_url( $boutique ) . '"', 'href="' . esc_url( $boutique ) . '#' ), $html );
	}
	// Médiateur : le marqueur « adhésion à faire » disparaît une fois l'adhésion déclarée (Apparence › Terre Gravée)
	if ( false !== strpos( $html, 'adhésion à faire' ) && get_option( 'tg_mediateur_adhere' ) ) {
		$html = str_replace( array( ' <span class="note note--decision">adhésion à faire</span>', '<span class="note note--decision">adhésion à faire</span>' ), '', $html );
	}
	$prefixe = '/wp-content/themes/terre-gravee/assets/img/';
	if ( false !== strpos( $html, $prefixe ) ) {
		$vrai = wp_make_link_relative( get_theme_file_uri( 'assets/img/' ) );
		if ( $vrai !== $prefixe ) {
			$html = str_replace( $prefixe, $vrai, $html );
		}
	}
	return $html;
}
add_filter( 'render_block', 'tg_reecrire_adresses', 20 );

/**
 * Menu principal : l'entrée de la page affichée est soulignée (aria-current), comme dans la maquette.
 * Les liens du menu importé sont des adresses (« /propos/ ») : on les compare à l'adresse demandée.
 *
 * @param string $html  HTML du lien.
 * @param array  $block Bloc.
 * @return string
 */
function tg_menu_actif( $html, $block ) {
	if ( empty( $block['attrs']['url'] ) || false !== strpos( $html, 'aria-current' ) ) {
		return $html;
	}
	$chemin_lien = wp_parse_url( $block['attrs']['url'], PHP_URL_PATH );
	$chemin_page = wp_parse_url( home_url( add_query_arg( array() ) ), PHP_URL_PATH );
	$chemin_page = $chemin_page ? $chemin_page : '/';
	$boutique    = wp_parse_url( tg_url_boutique(), PHP_URL_PATH );
	$actif       = $chemin_lien && '/' !== $chemin_lien && 0 === strpos( trailingslashit( $chemin_page ), trailingslashit( $chemin_lien ) );
	// « Collection » reste actif sur la boutique, les catégories et les fiches produit
	if ( ! $actif && in_array( $chemin_lien, array( '/produits/', $boutique ), true ) && function_exists( 'is_woocommerce' ) && is_woocommerce() ) {
		$actif = true;
	}
	if ( $actif ) {
		$html = preg_replace( '/<a /', '<a aria-current="page" ', $html, 1 );
		$html = preg_replace( '/class="wp-block-navigation-item /', 'class="wp-block-navigation-item current-menu-item ', $html, 1 );
	}
	return $html;
}
add_filter( 'render_block_core/navigation-link', 'tg_menu_actif', 10, 2 );

/**
 * Le bloc Navigation de l'en-tête utilise le menu importé (« Menu principal Terre Gravée ») quand il existe :
 * on le modifie alors dans Apparence › Éditeur › Navigation. Sinon, les cinq liens écrits dans l'en-tête s'affichent.
 *
 * @param array $block Bloc analysé.
 * @return array
 */
function tg_menu_importe( $block ) {
	if ( 'core/navigation' !== $block['blockName'] || ! empty( $block['attrs']['ref'] ) ) {
		return $block;
	}
	if ( empty( $block['attrs']['className'] ) || false === strpos( $block['attrs']['className'], 'nav' ) ) {
		return $block;
	}
	$menu = get_posts(
		array(
			'post_type'      => 'wp_navigation',
			'name'           => 'menu-principal-terre-gravee',
			'post_status'    => 'publish',
			'posts_per_page' => 1,
			'fields'         => 'ids',
		)
	);
	if ( $menu ) {
		$block['attrs']['ref'] = (int) $menu[0];
	}
	return $block;
}
add_filter( 'render_block_data', 'tg_menu_importe' );

/**
 * Identifiant du menu principal sur le bloc Navigation (cible du bouton « Menu » sur téléphone).
 *
 * @param string $html HTML du bloc.
 * @return string
 */
function tg_menu_identifiant( $html ) {
	if ( false !== strpos( $html, 'class="wp-block-navigation nav' ) || preg_match( '/<nav[^>]*\bnav\b/', $html ) ) {
		$html = preg_replace( '/<nav /', '<nav id="nav-principale" ', $html, 1 );
	}
	return $html;
}
add_filter( 'render_block_core/navigation', 'tg_menu_identifiant' );

/**
 * Morceau fixe de la maquette (inc/fragments.php, généré par generer.py), adresses adaptées.
 *
 * @param string $cle Nom du morceau.
 * @return string HTML.
 */
function tg_fragment( $cle ) {
	static $fragments = null;
	if ( null === $fragments ) {
		$fragments = require get_theme_file_path( 'inc/fragments.php' );
	}
	if ( empty( $fragments[ $cle ] ) ) {
		return '';
	}
	return tg_reecrire_adresses( str_replace( '{{img}}', get_theme_file_uri( 'assets/img/' ), $fragments[ $cle ] ) );
}

/**
 * Textes de la maquette pour un produit (inc/donnees-produits.php, généré par generer.py).
 *
 * @param string $slug Identifiant du produit.
 * @return array
 */
function tg_donnees( $slug ) {
	static $donnees = null;
	if ( null === $donnees ) {
		$donnees = require get_theme_file_path( 'inc/donnees-produits.php' );
	}
	return isset( $donnees[ $slug ] ) ? $donnees[ $slug ] : array();
}

/**
 * Tous les textes de la maquette, par identifiant.
 *
 * @return array
 */
function tg_toutes_donnees() {
	tg_donnees( '' );
	return require get_theme_file_path( 'inc/donnees-produits.php' );
}

/**
 * Codes courts sans WooCommerce : rien plutôt que le code brut. Sans l'extension Matomo, la page Confidentialité
 * montre un marqueur à la place du module d'opposition (guide, « Avant tout » : installer Matomo avant l'import).
 */
function tg_codes_courts_secours() {
	foreach ( array( 'tg_produits', 'tg_entete_boutique', 'tg_surtitre_commande' ) as $code ) {
		if ( ! shortcode_exists( $code ) ) {
			add_shortcode( $code, '__return_empty_string' );
		}
	}
	if ( ! shortcode_exists( 'matomo_opt_out' ) ) {
		add_shortcode(
			'matomo_opt_out',
			function () {
				return '<p><span class="note note--manque">module d’opposition : extension Matomo à installer</span></p>';
			}
		);
	}
}
add_action( 'init', 'tg_codes_courts_secours', 20 );
