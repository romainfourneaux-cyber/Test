<?php
/**
 * Title: Accueil · Être prévenu des nouvelles plaques
 * Slug: terre-gravee/page-accueil-08
 * Categories: terre-gravee
 * Keywords: terre gravée, accueil
 * Description: Section de la page « Accueil » de la maquette v4 (générée par generer.py).
 * Inserter: true
 *
 * @package TerreGravee
 */

?>
<!-- wp:group {"tagName":"section","className":"section lettre","anchor":"lettre"} -->
<section id="lettre" class="wp-block-group section lettre">
<!-- wp:group {"className":"wrap lettre__grille"} -->
<div class="wp-block-group wrap lettre__grille">
<!-- wp:group {"className":"lettre__texte"} -->
<div class="wp-block-group lettre__texte">
<!-- wp:paragraph {"className":"surtitre"} -->
<p class="surtitre">Lettre d’information</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"anchor":"titre-lettre"} -->
<h2 id="titre-lettre" class="wp-block-heading">Être prévenu des nouvelles plaques</h2>
<!-- /wp:heading -->

<!-- wp:paragraph {"className":"chapo"} -->
<p class="chapo">La lettre vous prévient de chaque nouvelle plaque. Une lettre par trimestre au plus.</p>
<!-- /wp:paragraph -->

<!-- wp:shortcode -->
[tg_lettre]
<!-- /wp:shortcode -->
</div>
<!-- /wp:group -->

<!-- wp:group {"className":"bientot"} -->
<div class="wp-block-group bientot">
<!-- wp:paragraph {"className":"bientot__titre"} -->
<p class="bientot__titre">Bientôt</p>
<!-- /wp:paragraph -->

<!-- wp:html -->
<ul class="bientot__liste">
    <li><div class="dessin"><img src="<?php echo esc_url( get_theme_file_uri( 'assets/img/' ) ); ?>dessin-la-transhumance.webp" width="199" height="398" alt="Dessin « La Transhumance »" loading="lazy" decoding="async"></div><span>La Transhumance</span></li>
    <li><div class="dessin dessin--vide"><span>Dessin à venir</span></div><span>Le Jardin Massey, à Tarbes</span></li>
  </ul>
<!-- /wp:html -->

<!-- wp:paragraph {"className":"bientot__note"} -->
<p class="bientot__note">Et des grands formats de 60 × 120 cm, à 150 € : Le Cirque de Gavarnie, Le Tourmalet, Le Pont d’Espagne et Le Pic du Midi. Le dessin ci-dessus vient de la planche des dessins inédits de Maude Villatte et Lola Jacquet. Ces plaques n’existent pas encore en photo.</p>
<!-- /wp:paragraph -->
</div>
<!-- /wp:group -->
</div>
<!-- /wp:group -->
</section>
<!-- /wp:group -->
