<?php
/**
 * Thème Terre Gravée : chargement des fonctions.
 *
 * Le thème reprend la maquette v4 « Galerie de territoire ». Les styles sont dans assets/galerie.css (copie de la maquette)
 * et assets/wp.css (adaptations à WordPress et WooCommerce) ; le script dans assets/terre-gravee.js.
 *
 * @package TerreGravee
 */

defined( 'ABSPATH' ) || exit;

define( 'TG_VERSION', '1.0.0' );

require_once get_theme_file_path( 'inc/reglages.php' );
require_once get_theme_file_path( 'inc/contenu.php' );
require_once get_theme_file_path( 'inc/noel.php' );
require_once get_theme_file_path( 'inc/formulaires.php' );
require_once get_theme_file_path( 'inc/admin.php' );

// Tout ce qui touche à la boutique ne se charge que si WooCommerce est actif : sans lui, les pages s'affichent quand même.
if ( class_exists( 'WooCommerce' ) ) {
	require_once get_theme_file_path( 'inc/produits.php' );
	require_once get_theme_file_path( 'inc/woocommerce.php' );
}
