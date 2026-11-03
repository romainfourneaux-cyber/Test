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
	// Site installé dans un sous-dossier (copie de test « /essai/ ») : les liens internes « /propos/ », « /#lettre »…
	// reçoivent le chemin du site. Sans effet à la racine (terregravee.fr). Un lien déjà préfixé ne l'est pas deux fois
	// (le filtre passe sur chaque bloc imbriqué).
	$base = tg_chemin_site();
	if ( '' !== $base && false !== strpos( $html, 'href="/' ) ) {
		$html = tg_remplacer( '#href="/(?!/)(?!' . preg_quote( ltrim( $base, '/' ), '#' ) . '(?:[/"\#?]))#', 'href="' . $base . '/', $html );
	}
	$html    = tg_marqueurs( $html );
	$prefixe = '/wp-content/themes/terre-gravee/assets/img/';
	if ( false !== strpos( $html, $prefixe ) ) {
		$vrai = wp_make_link_relative( get_theme_file_uri( 'assets/img/' ) );
		if ( $vrai !== $prefixe ) {
			// Seulement les adresses qui commencent par ce préfixe (après un guillemet, une parenthèse, une virgule ou une
			// espace) : le filtre passe sur chaque bloc imbriqué, une adresse déjà corrigée ne doit pas l'être deux fois.
			$html = tg_remplacer( '#(["\'(,\s])' . preg_quote( $prefixe, '#' ) . '#', '$1' . $vrai, $html );
		}
	}
	return $html;
}
add_filter( 'render_block', 'tg_reecrire_adresses', 20 );

/**
 * Chemin du site sans barre finale : « » à la racine, « /essai » pour la copie de test.
 *
 * @return string
 */
function tg_chemin_site() {
	$chemin = wp_parse_url( home_url( '/' ), PHP_URL_PATH );
	return $chemin ? untrailingslashit( $chemin ) : '';
}

/**
 * Les marqueurs de la maquette (« à fournir », « à confirmer »…) restent visibles des administrateurs connectés,
 * pour qu'ils sachent ce qui manque encore. Les visiteurs ne les voient jamais.
 *
 * @return bool
 */
function tg_voit_marqueurs() {
	return is_user_logged_in() && current_user_can( 'manage_options' );
}

/**
 * Adhésion au médiateur de la consommation déclarée (case d'Apparence › Terre Gravée).
 *
 * @return bool
 */
function tg_mediateur_adhere() {
	return (bool) get_option( 'tg_mediateur_adhere' );
}

/**
 * Marqueurs de la maquette et médiateur, selon la personne qui regarde.
 *
 * Médiateur : tant que la case « J'ai adhéré au CM2C » n'est pas cochée, aucun médiateur n'est nommé aux visiteurs
 * (pied de page retiré, phrase de saisine retirée des CGV et de la page Contact) ; les administrateurs voient le texte
 * prévu avec le marqueur « adhésion à faire ». Une fois la case cochée, tout le monde voit le CM2C, sans marqueur.
 *
 * Autres marqueurs, pour les visiteurs : retirés avec la phrase qui en dépend quand elle n'a plus de sens seule
 * (« Photo de la découpe à fournir », « Informations de sécurité à fournir », ligne « Sécurité » du kit LED).
 *
 * @param string $html HTML.
 * @return string
 */
function tg_marqueurs( $html ) {
	if ( ! is_string( $html ) || '' === $html ) {
		return $html;
	}
	$admin = tg_voit_marqueurs();
	if ( tg_mediateur_adhere() ) {
		if ( false !== strpos( $html, 'adhésion à faire' ) ) {
			$html = tg_remplacer( '#\s?<span class="note note--decision">adhésion à faire</span>#u', '', $html );
		}
	} elseif ( ! $admin ) {
		if ( false !== strpos( $html, 'adhésion à faire' ) ) {
			// Pied de page : « Médiateur de la consommation : CM2C… » disparaît entièrement
			$html = tg_remplacer( '#<p[^>]*>\s*Médiateur de la consommation[^<]*(?:<a [^>]*>[^<]*</a>[^<]*)*<span class="note note--decision">adhésion à faire</span>\s*</p>#u', '', $html );
			// CGV et Contact : la réclamation écrite reste, la saisine d'un médiateur nommé est retirée
			$html = tg_remplacer( '#\s?Si aucune solution n’est trouvée, vous pouvez saisir gratuitement le médiateur[^<]*(?:<a [^>]*>[^<]*</a>[^<]*)*<span class="note note--decision">adhésion à faire</span>#u', '', $html );
			$html = tg_remplacer( '#\s?<span class="note note--decision">adhésion à faire</span>#u', '', $html );
		}
		$html = tg_remplacer( '#<p[^>]*>\s*<strong>Médiation de la consommation\.</strong>\s*</p>#u', '', $html );
		$html = str_replace( ', qui indiquent aussi le médiateur de la consommation.', '.', $html );
		// CGV : sans médiateur nommé, l'article 11 ne parle plus que de la réclamation écrite (titre, sommaire, chapô)
		$html = str_replace(
			array( '>11. Réclamations et médiation<', '>Réclamations et médiation<', 'garanties légales et médiation.' ),
			array( '>11. Réclamations<', '>Réclamations<', 'garanties légales et réclamations.' ),
			$html
		);
	}
	if ( $admin || false === strpos( $html, 'note--' ) ) {
		return $html;
	}
	$html = tg_remplacer( '#\s?Photo de la découpe <span class="note note--manque">à fournir</span>#u', '', $html );
	$html = tg_remplacer( '#Informations de sécurité <span class="note note--manque">à fournir</span>\s?#u', '', $html );
	$html = tg_remplacer( '#<div>\s*<dt>Sécurité</dt>\s*<dd>[^<]*<span class="note note--manque">[^<]*</span>\s*</dd>\s*</div>#u', '', $html );
	// Tous les autres : le marqueur seul (la phrase garde son sens), puis les paragraphes devenus vides
	$html = tg_remplacer( '#\s?<span class="note note--(?:manque|decision)">[^<]*</span>#u', '', $html );
	$html = tg_remplacer( '#<p[^>]*>\s*</p>#', '', $html );
	return $html;
}

/**
 * preg_replace sans risque : si l'expression échoue (texte très long, limite de PCRE), le texte reste tel quel.
 *
 * @param string $motif       Expression.
 * @param string $remplacement Remplacement.
 * @param string $html        Texte.
 * @return string
 */
function tg_remplacer( $motif, $remplacement, $html ) {
	$r = preg_replace( $motif, $remplacement, $html );
	return null === $r ? $html : $r;
}

/**
 * Les codes courts sont interprétés après les blocs : leur résultat passe aussi par le filtre des marqueurs.
 *
 * @param string $html Contenu.
 * @return string
 */
function tg_marqueurs_contenu( $html ) {
	return tg_marqueurs( $html );
}
add_filter( 'the_content', 'tg_marqueurs_contenu', 99 );

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
	// Chemin demandé tel quel (« /essai/propos/ » sur la copie de test, « /propos/ » en ligne), sans le chemin du site
	$chemin_page = wp_parse_url( add_query_arg( array() ), PHP_URL_PATH );
	$chemin_page = $chemin_page ? $chemin_page : '/';
	$base        = tg_chemin_site();
	if ( '' !== $base && 0 === strpos( $chemin_page, $base . '/' ) ) {
		$chemin_page = substr( $chemin_page, strlen( $base ) );
	}
	$boutique    = wp_parse_url( tg_url_boutique(), PHP_URL_PATH );
	$boutique    = '' !== $base && 0 === strpos( (string) $boutique, $base . '/' ) ? substr( $boutique, strlen( $base ) ) : $boutique;
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
				return tg_voit_marqueurs() ? '<p><span class="note note--manque">module d’opposition : extension Matomo à installer</span></p>' : '';
			}
		);
	}
}
add_action( 'init', 'tg_codes_courts_secours', 20 );
