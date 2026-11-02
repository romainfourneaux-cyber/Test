<?php
/**
 * Fiche produit de la maquette v4 : galerie (une vue par finition, la mise en situation), achat (cartel, nom,
 * phrase, prix, finition, kit LED, quantité), encart de Noël, garanties, caractéristiques ; puis « Le lieu » et
 * « L'histoire du modèle » ; puis « À voir aussi ». Trois variantes : plaque, kit LED, carte cadeau.
 *
 * Remplace woocommerce/templates/content-single-product.php. Les crochets de WooCommerce restent appelés
 * (avis désactivés, données structurées, extensions de paiement) ; le thème en retire seulement les sorties qu'il remplace.
 *
 * @package TerreGravee
 * @version 3.6.0
 */

defined( 'ABSPATH' ) || exit;

global $product;

do_action( 'woocommerce_before_single_product' ); // phpcs:ignore WooCommerce.Commenting.CommentHooks.MissingHookComment

if ( post_password_required() ) {
	echo get_the_password_form(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	return;
}

$slug      = $product->get_slug();
$est_led   = $slug === tg_slug_led();
$est_carte = $slug === tg_slug_carte_cadeau();
$plaque    = ! $est_led && tg_est_plaque( $product );
$nom       = $product->get_name();
$d         = tg_donnees( $slug );
$finitions = tg_finitions();

// Galerie : une scène par finition (photo de la variation), puis les autres photos du produit (mise en situation…)
$scenes    = array();
$vignettes = array();
$utilisees = array();
if ( $plaque ) {
	$vars = tg_variations_par_finition( $product );
	$premiere = '';
	foreach ( $vars as $f => $v ) {
		if ( $v['image'] && ! $premiere ) {
			$premiere = $f;
		}
	}
	foreach ( $vars as $f => $v ) {
		$cache = $f === $premiere || ( ! $premiere && ! $scenes ) ? '' : ' hidden';
		if ( $v['image'] ) {
			$utilisees[] = $v['image'];
			$scenes[]    = sprintf( '<div data-scene="%s"%s><div class="plaque">%s</div></div>', $f, $cache, tg_img( $v['image'], sprintf( 'Plaque %s, finition %s', $nom, $finitions[ $f ][1] ), '(max-width: 900px) 70vw, 340px', '' === $cache ) );
			$vignettes[] = sprintf( '<button type="button" class="vignette" data-vue="%1$s" aria-pressed="%2$s">%3$s<span>%4$s</span></button>', $f, '' === $cache ? 'true' : 'false', wp_get_attachment_image( $v['image'], 'woocommerce_gallery_thumbnail', false, array( 'alt' => '', 'loading' => 'lazy' ) ), esc_html( $finitions[ $f ][0] ) );
		} else {
			$scenes[]    = sprintf( '<div data-scene="%s"%s><div class="plaque plaque--vide"><span>Finition %s : photo à venir</span></div></div>', $f, $cache, esc_html( $finitions[ $f ][1] ) );
			$vignettes[] = sprintf( '<button type="button" class="vignette" data-vue="%1$s" aria-pressed="false"><span class="vignette__vide"></span><span>%2$s</span></button>', $f, esc_html( $finitions[ $f ][0] ) );
		}
	}
	$utilisees[] = (int) $product->get_image_id();
	foreach ( $product->get_gallery_image_ids() as $i => $img ) {
		if ( in_array( (int) $img, $utilisees, true ) ) {
			continue;
		}
		$cle         = 'vue-' . $i;
		$scenes[]    = sprintf( '<div data-scene="%s" hidden><figure class="scene-situation">%s<figcaption>Mise en situation</figcaption></figure></div>', $cle, wp_get_attachment_image( $img, 'large', false, array( 'class' => 'situation', 'alt' => 'Mise en situation : plaque ' . $nom . ' sur un mur', 'sizes' => '(max-width: 900px) 92vw, 640px', 'loading' => 'lazy' ) ) );
		$vignettes[] = sprintf( '<button type="button" class="vignette vignette--situation" data-vue="%s" aria-pressed="false">%s<span>En situation</span></button>', $cle, wp_get_attachment_image( $img, 'woocommerce_gallery_thumbnail', false, array( 'alt' => '', 'loading' => 'lazy' ) ) );
	}
} else {
	$images = array_values( array_filter( array_merge( array( (int) $product->get_image_id() ), array_map( 'intval', $product->get_gallery_image_ids() ) ) ) );
	$noms   = array( 'Bleu', 'Vert', 'Ruban', 'Commande' );
	foreach ( $images as $i => $img ) {
		$alt         = trim( (string) get_post_meta( $img, '_wp_attachment_image_alt', true ) );
		$scenes[]    = sprintf( '<div data-scene="vue-%d"%s>%s</div>', $i, $i ? ' hidden' : '', wp_get_attachment_image( $img, 'large', false, array( 'class' => 'situation', 'alt' => $alt ? $alt : $nom, 'loading' => $i ? 'lazy' : false, 'fetchpriority' => $i ? false : 'high' ) ) );
		$vignettes[] = sprintf( '<button type="button" class="vignette vignette--situation" data-vue="vue-%1$d" aria-pressed="%2$s">%3$s<span>%4$s</span></button>', $i, $i ? 'false' : 'true', wp_get_attachment_image( $img, 'woocommerce_gallery_thumbnail', false, array( 'alt' => '', 'loading' => 'lazy' ) ), esc_html( $est_led && isset( $noms[ $i ] ) ? $noms[ $i ] : 'Vue ' . ( $i + 1 ) ) );
	}
}

$surtitre = tg_texte( $product, 'surtitre', $est_carte ? 'Idée cadeau' : '' );
$phrase   = tg_texte( $product, 'phrase', wp_strip_all_tags( $product->get_short_description() ) );
$prix     = $product->get_price_html();
$tva      = 'TTC, TVA non applicable (art. 293 B du CGI)';
?>
<div id="product-<?php the_ID(); ?>" <?php wc_product_class( 'tg-produit', $product ); ?>>
<div class="wrap">
	<?php echo tg_fil_ariane( $product ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
	<div class="fiche" data-fiche data-slug="<?php echo esc_attr( $slug ); ?>" data-nom="<?php echo esc_attr( $nom ); ?>"<?php echo $plaque ? '' : ' data-type="accessoire"'; ?><?php echo $est_led ? '' : ' data-prix="' . esc_attr( wc_get_price_to_display( $product ) ) . '"'; ?><?php echo $plaque && tg_produit_led() ? ' data-prix-led="' . esc_attr( tg_produit_led()->get_variation_price( 'min', true ) ) . '"' : ''; ?>>
		<div class="galerie">
			<div class="galerie__scene<?php echo $plaque ? '' : ' galerie__scene--photo'; ?>"><?php echo implode( '', $scenes ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></div>
			<?php if ( count( $vignettes ) > 1 ) : ?>
				<div class="galerie__vignettes" role="group" aria-label="<?php echo esc_attr( $plaque ? 'Vues de la plaque' : 'Vues' ); ?>"><?php echo implode( '', $vignettes ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></div>
			<?php endif; ?>
		</div>
		<div class="achat">
			<div class="achat__tete">
				<?php if ( $surtitre ) : ?>
					<p class="cartel-ligne"><?php echo $surtitre; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- wp_kses_post() dans tg_texte(). ?></p>
				<?php endif; ?>
				<?php the_title( '<h1>', '</h1>' ); ?>
				<?php if ( $phrase ) : ?>
					<p class="achat__phrase"><?php echo $phrase; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></p>
				<?php endif; ?>
			</div>
			<p class="achat__prix"><strong data-prix-affiche><?php echo wp_kses_post( $est_led ? '+ ' . $prix : $prix ); ?></strong><span><?php echo esc_html( $est_led ? 'avec une plaque · ' . $tva : $tva ); ?></span></p>

			<?php if ( $est_led ) : ?>
				<?php echo tg_fragment( 'led_encadre' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
				<p class="option-led-lien"><a class="btn" href="<?php echo esc_url( tg_url_boutique() ); ?>">Choisir une plaque</a></p>
				<?php echo tg_fragment( 'led_caracteristiques' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			<?php else : ?>
				<?php if ( $est_carte ) : ?>
					<?php echo tg_fragment( 'carte_texte' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
				<?php endif; ?>
				<?php woocommerce_template_single_add_to_cart(); ?>
				<?php echo tg_fragment( $est_carte ? 'carte_encart_noel' : 'plaque_encart_noel' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
				<?php echo tg_fragment( $est_carte ? 'carte_garanties' : 'plaque_garanties' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
				<?php if ( $est_carte ) : ?>
					<?php echo tg_fragment( 'carte_caracteristiques' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
				<?php elseif ( $plaque ) : ?>
					<?php echo tg_fragment( 'plaque_caracteristiques' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
				<?php endif; ?>
			<?php endif; ?>
			<div class="tg-crochets-resume">
				<?php do_action( 'woocommerce_single_product_summary' ); // phpcs:ignore WooCommerce.Commenting.CommentHooks.MissingHookComment ?>
			</div>
		</div>
	</div>
</div>

<?php if ( $plaque ) : ?>
	<?php
	$lieu        = tg_texte( $product, 'lieu' );
	$titre_h     = tg_texte( $product, 'titre_histoire', $nom );
	$description = apply_filters( 'the_content', get_the_content() ); // phpcs:ignore WooCommerce.Commenting.CommentHooks.MissingHookComment
	// La description commence souvent par son propre titre (« Le Pic du Midi – … ») : le titre de la fiche le remplace.
	$description = preg_replace( '/^\s*<h[1-6][^>]*>.*?<\/h[1-6]>\s*/is', '', $description );
	?>
	<section class="section section--sauge" aria-labelledby="titre-recit">
		<div class="wrap recit recit--sans-avis">
			<aside class="recit__lieu" aria-label="<?php echo esc_attr( ! empty( $d['lieu_titre'] ) ? $d['lieu_titre'] : 'Le lieu' ); ?>">
				<p class="surtitre"><?php echo esc_html( ! empty( $d['lieu_titre'] ) ? $d['lieu_titre'] : 'Le lieu' ); ?></p>
				<?php if ( $lieu ) : ?>
					<p class="recit__lieu-texte"><?php echo $lieu; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></p>
				<?php endif; ?>
				<?php echo ! empty( $d['localisateur'] ) ? $d['localisateur'] : ''; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- SVG généré par generer.py. ?>
				<?php if ( ! empty( $d['carte'] ) ) : ?>
					<p><a class="lien-fleche" href="<?php echo esc_url( home_url( $d['carte'] ) ); ?>"><?php echo esc_html( $d['carte_texte'] ); ?></a></p>
				<?php endif; ?>
			</aside>
			<div class="recit__histoire">
				<p class="surtitre">L’histoire du modèle</p>
				<h2 id="titre-recit"><?php echo $titre_h; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></h2>
				<div class="texte"><?php echo $description; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></div>
			</div>
		</div>
	</section>
	<?php $similaires = tg_similaires( $product ); ?>
	<?php if ( $similaires ) : ?>
		<section class="section section--clair" aria-labelledby="titre-voir-aussi">
			<div class="wrap">
				<div class="entete-section entete-section--ligne"><div><p class="surtitre"><?php echo esc_html( tg_collections()[ tg_collection( $product ) ] ); ?></p><h2 id="titre-voir-aussi">À voir aussi</h2></div><a class="lien-fleche" href="<?php echo esc_url( tg_url_boutique() ); ?>">Toute la collection</a></div>
				<ul class="grille-produits">
					<?php
					foreach ( $similaires as $s ) {
						echo tg_carte_produit( $s ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
					}
					?>
				</ul>
			</div>
		</section>
	<?php endif; ?>
<?php else : ?>
	<section class="section section--sauge">
		<div class="wrap deux-colonnes deux-colonnes--haut">
			<?php echo tg_fragment( $est_led ? 'led_detail' : 'carte_detail' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			<div class="offre"><p class="surtitre"><?php echo $est_led ? 'Choisir une plaque' : 'Nos coups de cœur'; ?></p><?php echo do_shortcode( $est_led ? '[tg_produits slugs="le-pic-du-midi,lours" classe="grille-produits--deux"]' : '[tg_produits slugs="le-pic-du-midi,lisard" classe="grille-produits--deux"]' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></div>
		</div>
	</section>
	<?php if ( ! $est_led && ! $est_carte && trim( $product->get_description() ) ) : ?>
		<section class="section"><div class="wrap texte"><?php echo apply_filters( 'the_content', get_the_content() ); // phpcs:ignore ?></div></section>
	<?php endif; ?>
<?php endif; ?>

<?php do_action( 'woocommerce_after_single_product_summary' ); // phpcs:ignore WooCommerce.Commenting.CommentHooks.MissingHookComment ?>

<?php if ( ! $est_led && $product->is_purchasable() && $product->is_in_stock() ) : ?>
	<div class="barre-achat-mobile"><div><strong><?php echo esc_html( $nom ); ?></strong><span data-prix-affiche><?php echo wp_kses_post( $prix ); ?></span></div><button type="button" class="btn" data-ajouter-barre>Ajouter au panier</button></div>
<?php endif; ?>
</div>
<?php do_action( 'woocommerce_after_single_product' ); // phpcs:ignore WooCommerce.Commenting.CommentHooks.MissingHookComment ?>
