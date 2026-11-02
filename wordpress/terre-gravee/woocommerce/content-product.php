<?php
/**
 * Une carte de la boutique : la carte de la maquette v4 (pastilles de finition pour les plaques).
 * Remplace woocommerce/templates/content-product.php.
 *
 * @package TerreGravee
 * @version 9.4.0
 */

defined( 'ABSPATH' ) || exit;

global $product;

if ( ! is_a( $product, WC_Product::class ) || ! $product->is_visible() ) {
	return;
}

echo tg_carte_produit( $product, null, 'h3' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Échappé dans tg_carte_produit().
