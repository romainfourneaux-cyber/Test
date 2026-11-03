<?php
/**
 * Title: Accueil · Graver l’âme des territoires
 * Slug: terre-gravee/page-accueil-02
 * Categories: terre-gravee
 * Keywords: terre gravée, accueil
 * Description: Section de la page « Accueil » de la maquette v4 (générée par generer.py).
 * Inserter: true
 *
 * @package TerreGravee
 */

defined( 'ABSPATH' ) || exit;
?>
<!-- wp:group {"tagName":"section","className":"heros"} -->
<section class="wp-block-group heros">
<!-- wp:group {"className":"wrap heros__grille"} -->
<div class="wp-block-group wrap heros__grille">
<!-- wp:group {"className":"heros__texte"} -->
<div class="wp-block-group heros__texte">
<!-- wp:paragraph {"className":"surtitre"} -->
<p class="surtitre">Plaques murales en aluminium · Hautes-Pyrénées</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":1} -->
<h1 class="wp-block-heading">Graver l’âme des territoires</h1>
<!-- /wp:heading -->

<!-- wp:paragraph {"className":"heros__intro"} -->
<p class="heros__intro">Terre Gravée fabrique des plaques de décoration murale en aluminium inspirées des Hautes-Pyrénées : le Pic du Midi, l’isard, la tour des Jacobins… Douze modèles dessinés par Maude Villatte et Lola Jacquet pour le décor d’Aquensis, découpés au laser à Revel et thermolaqués à Bagnères-de-Bigorre.</p>
<!-- /wp:paragraph -->

<!-- wp:group {"className":"heros__actions"} -->
<div class="wp-block-group heros__actions">
<!-- wp:html -->
<a class="btn" href="/produits/">Voir la collection</a>
<!-- /wp:html -->

<!-- wp:html -->
<a class="btn btn--ligne" href="/carte-des-lieux/">La carte des lieux</a>
<!-- /wp:html -->
</div>
<!-- /wp:group -->

<!-- wp:html -->
<dl class="faits">
        <div><dt>Format</dt><dd>60 × 30 cm</dd></div>
        <div><dt>Finitions</dt><dd>Noir, gris, doré</dd></div>
        <div><dt>Prix</dt><dd>65 €</dd></div>
      </dl>
<!-- /wp:html -->
</div>
<!-- /wp:group -->

<!-- wp:html -->
<div class="mur-expo" data-mur>
      <figure class="accroche accroche--a"><div class="plaque"><img src="<?php echo esc_url( get_theme_file_uri( 'assets/img/' ) ); ?>p/le-pic-du-midi-noir-440.webp" srcset="<?php echo esc_url( get_theme_file_uri( 'assets/img/' ) ); ?>p/le-pic-du-midi-noir-440.webp 440w, <?php echo esc_url( get_theme_file_uri( 'assets/img/' ) ); ?>p/le-pic-du-midi-noir-880.webp 880w" sizes="(max-width: 900px) 27vw, 170px" width="440" height="873" alt="Plaque Le Pic du Midi, finition noire" fetchpriority="high" decoding="async"></div><figcaption class="cartel"><span class="cartel__nom">Le Pic du Midi</span><span class="cartel__sep"> · </span><span class="cartel__detail">2 877 m</span></figcaption></figure><figure class="accroche accroche--b"><div class="plaque"><img src="<?php echo esc_url( get_theme_file_uri( 'assets/img/' ) ); ?>p/lisard-dore-440.webp" srcset="<?php echo esc_url( get_theme_file_uri( 'assets/img/' ) ); ?>p/lisard-dore-440.webp 440w, <?php echo esc_url( get_theme_file_uri( 'assets/img/' ) ); ?>p/lisard-dore-880.webp 880w" sizes="(max-width: 900px) 27vw, 170px" width="440" height="871" alt="Plaque L’Isard, finition dorée" fetchpriority="high" decoding="async"></div><figcaption class="cartel"><span class="cartel__nom">L’Isard</span><span class="cartel__sep"> · </span><span class="cartel__detail"><i>Rupicapra pyrenaica</i></span></figcaption></figure><figure class="accroche accroche--c"><div class="plaque"><img src="<?php echo esc_url( get_theme_file_uri( 'assets/img/' ) ); ?>p/la-tour-des-jacobins-gris-440.webp" srcset="<?php echo esc_url( get_theme_file_uri( 'assets/img/' ) ); ?>p/la-tour-des-jacobins-gris-440.webp 440w, <?php echo esc_url( get_theme_file_uri( 'assets/img/' ) ); ?>p/la-tour-des-jacobins-gris-880.webp 880w" sizes="(max-width: 900px) 27vw, 170px" width="440" height="856" alt="Plaque La Tour des Jacobins, finition grise" fetchpriority="high" decoding="async"></div><figcaption class="cartel"><span class="cartel__nom">La Tour des Jacobins</span><span class="cartel__sep"> · </span><span class="cartel__detail">Bagnères</span></figcaption></figure>
      <div class="mur-expo__legende">
        <div class="led-commandes">
          <button type="button" class="interrupteur" aria-pressed="false"><span class="interrupteur__voyant" aria-hidden="true"></span><span class="interrupteur__texte">Allumer le rétroéclairage</span></button>
          <div class="led-couleurs" role="group" aria-label="Couleur des LED" hidden><button type="button" style="--c:#FFD39A" data-couleur="#FFD39A" aria-pressed="true" title="Blanc chaud"><span class="visuellement-cache">Blanc chaud</span></button><button type="button" style="--c:#5AB0FF" data-couleur="#5AB0FF" aria-pressed="false" title="Bleu"><span class="visuellement-cache">Bleu</span></button><button type="button" style="--c:#63E58F" data-couleur="#63E58F" aria-pressed="false" title="Vert"><span class="visuellement-cache">Vert</span></button><button type="button" style="--c:#B48CFF" data-couleur="#B48CFF" aria-pressed="false" title="Violet"><span class="visuellement-cache">Violet</span></button><button type="button" style="--c:#FF8A57" data-couleur="#FF8A57" aria-pressed="false" title="Orange"><span class="visuellement-cache">Orange</span></button></div>
        </div>
        <a class="mur-expo__note" href="/produits/led/">Simulation · kit LED en option, 15 €</a>
      </div>
    </div>
<!-- /wp:html -->
</div>
<!-- /wp:group -->
</section>
<!-- /wp:group -->
