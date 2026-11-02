<?php
/**
 * Formulaire d'achat d'un produit variable, à la manière de la maquette v4 : la finition se choisit avec trois
 * boutons (noir, gris, doré) ; le kit LED s'ajoute en option avec la sortie du câble.
 *
 * Les listes déroulantes de WooCommerce restent dans la page (masquées) : le script de WooCommerce
 * (wc-add-to-cart-variation) trouve la variation et active le bouton comme d'habitude, et les extensions qui
 * s'y accrochent (paiement express…) continuent de fonctionner.
 *
 * Remplace woocommerce/templates/single-product/add-to-cart/variable.php.
 *
 * @package TerreGravee
 * @version 11.1.0
 */

defined( 'ABSPATH' ) || exit;

global $product;

$attribute_keys  = array_keys( $attributes );
$variations_json = wp_json_encode( $available_variations );
$variations_attr = function_exists( 'wc_esc_json' ) ? wc_esc_json( $variations_json ) : _wp_specialchars( $variations_json, ENT_QUOTES, 'UTF-8', true );
$attr_finition   = tg_attribut_finition( $product );
$par_finition    = tg_variations_par_finition( $product );
$finitions       = tg_finitions();

// Finition cochée d'abord : celle réglée par défaut dans WooCommerce, sinon la première qui a sa photo.
$defaut_fin = '';
if ( $attr_finition ) {
	$demande = isset( $_REQUEST[ 'attribute_' . sanitize_title( $attr_finition ) ] ) ? wc_clean( wp_unslash( $_REQUEST[ 'attribute_' . sanitize_title( $attr_finition ) ] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
	$defaut_fin = tg_finition_de( $demande ? $demande : $product->get_variation_default_attribute( $attr_finition ) );
	if ( ! $defaut_fin || empty( $par_finition[ $defaut_fin ]['achetable'] ) ) {
		$defaut_fin = '';
		foreach ( $par_finition as $f => $v ) {
			if ( $v['achetable'] && $v['image'] ) {
				$defaut_fin = $f;
				break;
			}
		}
		if ( ! $defaut_fin ) {
			foreach ( $par_finition as $f => $v ) {
				if ( $v['achetable'] ) {
					$defaut_fin = $f;
					break;
				}
			}
		}
	}
}

do_action( 'woocommerce_before_add_to_cart_form' ); // phpcs:ignore WooCommerce.Commenting.CommentHooks.MissingHookComment
?>
<form class="variations_form cart tg-achat" action="<?php echo esc_url( apply_filters( 'woocommerce_add_to_cart_form_action', $product->get_permalink() ) ); // phpcs:ignore WooCommerce.Commenting.CommentHooks.MissingHookComment ?>" method="post" enctype="multipart/form-data" data-product_id="<?php echo absint( $product->get_id() ); ?>" data-product_variations="<?php echo $variations_attr; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>">
	<?php do_action( 'woocommerce_before_variations_form' ); // phpcs:ignore WooCommerce.Commenting.CommentHooks.MissingHookComment ?>

	<?php if ( empty( $available_variations ) && false !== $available_variations ) : ?>
		<p class="stock out-of-stock">Cette plaque est momentanément indisponible.</p>
	<?php else : ?>
		<?php if ( $attr_finition && $par_finition ) : ?>
			<fieldset class="option choix-finition">
				<legend class="option__titre">Finition : <output id="finition-choisie"><?php echo esc_html( $defaut_fin ? $finitions[ $defaut_fin ][0] : '' ); ?></output></legend>
				<div class="choix-finition__options">
					<?php foreach ( $par_finition as $f => $v ) : ?>
						<label class="fin-<?php echo esc_attr( $f ); ?>"><input type="radio" name="tg_finition" value="<?php echo esc_attr( $f ); ?>" data-valeur="<?php echo esc_attr( $v['valeur'] ); ?>"<?php checked( $f, $defaut_fin ); ?><?php disabled( ! $v['achetable'] ); ?>><?php echo esc_html( $finitions[ $f ][0] ); ?><?php echo $v['image'] ? '' : '<span class="visuellement-cache"> (photo à venir)</span>'; ?><?php echo $v['achetable'] ? '' : '<span class="visuellement-cache"> (indisponible)</span>'; ?></label>
					<?php endforeach; ?>
				</div>
			</fieldset>
		<?php endif; ?>

		<div class="variations tg-variations<?php echo $attr_finition && 1 === count( $attributes ) ? ' visuellement-cache' : ''; ?>"<?php echo $attr_finition && 1 === count( $attributes ) ? ' aria-hidden="true"' : ''; ?>>
			<?php foreach ( $attributes as $attribute_name => $options ) : ?>
				<?php $est_finition = ( $attribute_name === $attr_finition ); ?>
				<div class="champ<?php echo $est_finition ? ' visuellement-cache' : ''; ?>"<?php echo $est_finition ? ' aria-hidden="true"' : ''; ?>>
					<label for="<?php echo esc_attr( sanitize_title( $attribute_name ) ); ?>"><?php echo esc_html( wc_attribute_label( $attribute_name ) ); ?></label>
					<?php
					$args = array(
						'options'   => $options,
						'attribute' => $attribute_name,
						'product'   => $product,
					);
					if ( $est_finition ) {
						$args['selected'] = $defaut_fin ? $par_finition[ $defaut_fin ]['valeur'] : '';
						ob_start();
						wc_dropdown_variation_attribute_options( $args );
						// La liste de la finition est pilotée par les boutons : hors du parcours au clavier.
						echo str_replace( '<select ', '<select tabindex="-1" data-tg-finition ', ob_get_clean() ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
					} else {
						wc_dropdown_variation_attribute_options( $args );
					}
					?>
				</div>
			<?php endforeach; ?>
			<a class="reset_variations" href="#" hidden>Effacer</a>
		</div>
		<div class="reset_variations_alert screen-reader-text" role="alert" aria-live="polite" aria-relevant="all"></div>
		<?php do_action( 'woocommerce_after_variations_table' ); // phpcs:ignore WooCommerce.Commenting.CommentHooks.MissingHookComment ?>

		<?php
		// Kit LED en option, sur les plaques seulement
		list( , $options_led ) = tg_options_led();
		if ( $options_led && tg_est_plaque( $product ) ) :
			$prix_led = tg_produit_led()->get_variation_price( 'min', true );
			?>
			<div class="option-led">
				<label class="option-led__case"><input type="checkbox" id="option-led" name="tg_led" value="1"><span><strong>Ajouter le kit LED</strong><?php echo tg_fragment( 'plaque_led_texte' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></span><span class="option-led__prix">+<?php echo wp_kses_post( wc_price( $prix_led ) ); ?></span></label>
				<div class="champ" data-position-led hidden><label for="position-cable">Sortie du câble</label><select id="position-cable" name="tg_led_cable">
					<?php foreach ( $options_led as $valeur => $id_variation ) : ?>
						<option value="<?php echo esc_attr( $valeur ); ?>"><?php echo esc_html( ucfirst( strtolower( $valeur ) ) ); ?></option>
					<?php endforeach; ?>
				</select></div>
			</div>
		<?php endif; ?>

		<div class="single_variation_wrap">
			<?php
			do_action( 'woocommerce_before_single_variation' ); // phpcs:ignore WooCommerce.Commenting.CommentHooks.MissingHookComment
			do_action( 'woocommerce_single_variation' ); // phpcs:ignore WooCommerce.Commenting.CommentHooks.MissingHookComment
			do_action( 'woocommerce_after_single_variation' ); // phpcs:ignore WooCommerce.Commenting.CommentHooks.MissingHookComment
			?>
		</div>
	<?php endif; ?>

	<?php do_action( 'woocommerce_after_variations_form' ); // phpcs:ignore WooCommerce.Commenting.CommentHooks.MissingHookComment ?>
</form>
<?php
do_action( 'woocommerce_after_add_to_cart_form' ); // phpcs:ignore WooCommerce.Commenting.CommentHooks.MissingHookComment
