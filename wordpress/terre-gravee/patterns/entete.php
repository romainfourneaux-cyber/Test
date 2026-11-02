<?php
/**
 * Title: En-tête (logo, menu, mini-panier)
 * Slug: terre-gravee/entete
 * Categories: terre-gravee
 * Description: En-tête de la maquette v4 : emblème au coq et nom au pochoir, menu principal, mini-panier WooCommerce, bouton du menu sur téléphone.
 * Inserter: false
 *
 * @package TerreGravee
 */

?>
<!-- wp:group {"className":"wrap entete__ligne"} -->
<div class="wp-block-group wrap entete__ligne"><!-- wp:html -->
<a class="marque" href="<?php echo esc_url( home_url( '/' ) ); ?>"><img class="marque__embleme" src="<?php echo esc_url( get_theme_file_uri( 'assets/img/logo-embleme.webp' ) ); ?>" width="274" height="192" alt="" fetchpriority="auto" decoding="async"><span class="marque__nom">TERRE GRAVÉE</span></a>
<!-- /wp:html -->

<!-- wp:navigation {"overlayMenu":"never","className":"nav","ariaLabel":"Navigation principale","layout":{"type":"flex","justifyContent":"right","flexWrap":"nowrap"}} -->
<!-- wp:navigation-link {"label":"Collection","url":"/produits/","kind":"custom","isTopLevelLink":true} /-->
<!-- wp:navigation-link {"label":"Carte","url":"/carte-des-lieux/","kind":"custom","isTopLevelLink":true} /-->
<!-- wp:navigation-link {"label":"L’atelier","url":"/propos/","kind":"custom","isTopLevelLink":true} /-->
<!-- wp:navigation-link {"label":"Sur mesure","url":"/creations/","kind":"custom","isTopLevelLink":true} /-->
<!-- wp:navigation-link {"label":"Contact","url":"/contact/","kind":"custom","isTopLevelLink":true} /-->
<!-- /wp:navigation -->

<!-- wp:woocommerce/mini-cart {"miniCartIcon":"bag","productCountVisibility":"always","hasHiddenPrice":true,"cartAndCheckoutRenderStyle":"removed","className":"bouton-panier-wc"} /-->

<!-- wp:html -->
<button type="button" class="bouton-icone bouton-menu" aria-expanded="false" aria-controls="nav-principale"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="1.5"/></svg><span class="visuellement-cache">Menu</span></button>
<!-- /wp:html --></div>
<!-- /wp:group -->
