<?php
/**
 * Quantité et bouton d'achat d'une plaque (produit variable), à la manière de la maquette v4.
 * Remplace woocommerce/templates/single-product/add-to-cart/variation-add-to-cart-button.php.
 *
 * @package TerreGravee
 * @version 10.5.2
 */

defined( 'ABSPATH' ) || exit;

global $product;
?>
<div class="woocommerce-variation-add-to-cart variations_button">
	<?php do_action( 'woocommerce_before_add_to_cart_button' ); // phpcs:ignore WooCommerce.Commenting.CommentHooks.MissingHookComment ?>
	<div class="quantite-achat">
		<?php do_action( 'woocommerce_before_add_to_cart_quantity' ); // phpcs:ignore WooCommerce.Commenting.CommentHooks.MissingHookComment ?>
		<?php tg_champ_quantite( $product, 'plaque' ); ?>
		<?php do_action( 'woocommerce_after_add_to_cart_quantity' ); // phpcs:ignore WooCommerce.Commenting.CommentHooks.MissingHookComment ?>
		<button type="submit" class="single_add_to_cart_button btn" data-ajouter><?php echo esc_html( $product->single_add_to_cart_text() ); ?></button>
	</div>
	<?php do_action( 'woocommerce_after_add_to_cart_button' ); // phpcs:ignore WooCommerce.Commenting.CommentHooks.MissingHookComment ?>
	<input type="hidden" name="add-to-cart" value="<?php echo absint( $product->get_id() ); ?>" />
	<input type="hidden" name="product_id" value="<?php echo absint( $product->get_id() ); ?>" />
	<input type="hidden" name="variation_id" class="variation_id" value="0" />
</div>
