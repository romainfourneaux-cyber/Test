<?php
/**
 * Formulaire d'achat d'un produit simple (carte cadeau), à la manière de la maquette v4.
 * Remplace woocommerce/templates/single-product/add-to-cart/simple.php.
 *
 * @package TerreGravee
 * @version 10.2.0
 */

defined( 'ABSPATH' ) || exit;

global $product;

if ( ! $product->is_purchasable() ) {
	return;
}

echo wc_get_stock_html( $product ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped

if ( $product->is_in_stock() ) : ?>

	<?php do_action( 'woocommerce_before_add_to_cart_form' ); // phpcs:ignore WooCommerce.Commenting.CommentHooks.MissingHookComment ?>

	<form class="cart tg-achat" action="<?php echo esc_url( apply_filters( 'woocommerce_add_to_cart_form_action', $product->get_permalink() ) ); // phpcs:ignore WooCommerce.Commenting.CommentHooks.MissingHookComment ?>" method="post" enctype="multipart/form-data">
		<?php do_action( 'woocommerce_before_add_to_cart_button' ); // phpcs:ignore WooCommerce.Commenting.CommentHooks.MissingHookComment ?>
		<div class="quantite-achat">
			<?php do_action( 'woocommerce_before_add_to_cart_quantity' ); // phpcs:ignore WooCommerce.Commenting.CommentHooks.MissingHookComment ?>
			<?php tg_champ_quantite( $product, $product->get_slug() === tg_slug_carte_cadeau() ? 'carte' : 'article' ); ?>
			<?php do_action( 'woocommerce_after_add_to_cart_quantity' ); // phpcs:ignore WooCommerce.Commenting.CommentHooks.MissingHookComment ?>
			<button type="submit" name="add-to-cart" value="<?php echo esc_attr( $product->get_id() ); ?>" class="single_add_to_cart_button btn" data-ajouter><?php echo esc_html( $product->single_add_to_cart_text() ); ?></button>
		</div>
		<?php do_action( 'woocommerce_after_add_to_cart_button' ); // phpcs:ignore WooCommerce.Commenting.CommentHooks.MissingHookComment ?>
	</form>

	<?php do_action( 'woocommerce_after_add_to_cart_form' ); // phpcs:ignore WooCommerce.Commenting.CommentHooks.MissingHookComment ?>

<?php endif; ?>
