<?php
/**
 * Administration : page « Apparence › Terre Gravée » (liste de contrôle de la mise en place et deux actions).
 *
 * @package TerreGravee
 */

defined( 'ABSPATH' ) || exit;

/**
 * Menu.
 */
function tg_menu_admin() {
	add_theme_page( 'Terre Gravée', 'Terre Gravée', 'manage_options', 'terre-gravee', 'tg_page_admin' );
}
add_action( 'admin_menu', 'tg_menu_admin' );

/**
 * Rappel après l'activation du thème.
 */
function tg_avis_activation() {
	global $pagenow;
	if ( 'themes.php' === $pagenow && isset( $_GET['activated'] ) && current_user_can( 'manage_options' ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		echo '<div class="notice notice-info"><p>Thème Terre Gravée activé. Étape suivante : <a href="' . esc_url( admin_url( 'themes.php?page=terre-gravee' ) ) . '">Apparence › Terre Gravée</a> (liste de contrôle).</p></div>';
	}
}
add_action( 'admin_notices', 'tg_avis_activation' );

/**
 * Page importée par son identifiant.
 *
 * @param string $slug Identifiant.
 * @return WP_Post|null
 */
function tg_page( $slug ) {
	$p = get_page_by_path( $slug, OBJECT, 'page' );
	return $p && 'publish' === $p->post_status ? $p : null;
}

/**
 * Actions de la page (formulaires avec jeton de sécurité).
 */
function tg_actions_admin() {
	if ( empty( $_POST['tg_action'] ) || ! current_user_can( 'manage_options' ) ) {
		return;
	}
	check_admin_referer( 'tg_admin' );
	$action = sanitize_key( wp_unslash( $_POST['tg_action'] ) );
	$msg    = '';
	if ( 'accueil' === $action ) {
		$accueil = tg_page( 'accueil' );
		if ( $accueil ) {
			update_option( 'show_on_front', 'page' );
			update_option( 'page_on_front', $accueil->ID );
			$msg = 'La page « Accueil » est maintenant la page d’accueil du site.';
		}
	} elseif ( 'mediateur' === $action ) {
		$oui = ! empty( $_POST['tg_mediateur_adhere'] );
		update_option( 'tg_mediateur_adhere', $oui ? '1' : '' );
		$msg = $oui ? 'Adhésion au médiateur notée : le CM2C est maintenant indiqué aux visiteurs (pied de page, CGV, Contact).' : 'Adhésion retirée : aucun médiateur n’est plus nommé aux visiteurs.';
	} elseif ( 'descriptions' === $action && class_exists( 'WooCommerce' ) ) {
		$msg = sprintf( '%d description(s) remplacée(s) par le texte de la maquette.', tg_remplacer_descriptions() );
	} elseif ( 'annuler_descriptions' === $action ) {
		$n = 0;
		foreach ( get_posts( array( 'post_type' => 'product', 'posts_per_page' => -1, 'meta_key' => '_tg_ancienne_description', 'post_status' => 'any' ) ) as $poste ) { // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key
			wp_update_post(
				array(
					'ID'           => $poste->ID,
					'post_content' => wp_slash( get_post_meta( $poste->ID, '_tg_ancienne_description', true ) ),
				)
			);
			delete_post_meta( $poste->ID, '_tg_ancienne_description' );
			++$n;
		}
		$msg = sprintf( '%d description(s) remise(s) comme avant.', $n );
	} elseif ( 'catalogue' === $action && class_exists( 'WooCommerce' ) ) {
		$msg = sprintf( '%d produit(s) ou page(s) mis comme la maquette (nom, ordre, titre et description) ; collection triée dans l’ordre de la maquette.', tg_appliquer_catalogue() );
	} elseif ( 'annuler_catalogue' === $action && class_exists( 'WooCommerce' ) ) {
		$msg = sprintf( '%d produit(s) ou page(s) remis comme avant ; tri de la collection remis comme avant.', tg_annuler_catalogue() );
	}
	if ( $msg ) {
		set_transient( 'tg_admin_msg', $msg, 60 );
	}
	wp_safe_redirect( admin_url( 'themes.php?page=terre-gravee' ) );
	exit;
}
add_action( 'admin_init', 'tg_actions_admin' );

/**
 * Remplace la description des plaques par le texte relu de la maquette (l'ancienne est gardée dans _tg_ancienne_description).
 *
 * @return int Nombre de descriptions remplacées.
 */
function tg_remplacer_descriptions() {
	$n = 0;
	foreach ( tg_toutes_donnees() as $slug => $d ) {
		// Les 12 plaques (« L'histoire du modèle ») et la carte cadeau (« numérique, envoyée par e-mail »)
		if ( empty( $d['histoire'] ) && empty( $d['description'] ) ) {
			continue;
		}
		$poste = get_page_by_path( $slug, OBJECT, 'product' );
		if ( ! $poste ) {
			continue;
		}
		$html = '';
		foreach ( ! empty( $d['histoire'] ) ? $d['histoire'] : array( $d['description'] ) as $para ) {
			$html .= '<p>' . esc_html( $para ) . "</p>\n";
		}
		if ( ! empty( $d['source']['url'] ) ) {
			$html .= '<p class="recit__source">Pour en savoir plus : <a href="' . esc_url( $d['source']['url'] ) . '">' . esc_html( $d['source']['label'] ) . "</a></p>\n";
		}
		if ( trim( $poste->post_content ) === trim( $html ) ) {
			continue;
		}
		// L'ancienne description reste dans les révisions et dans un champ caché, pour revenir en arrière
		if ( ! get_post_meta( $poste->ID, '_tg_ancienne_description', true ) ) {
			update_post_meta( $poste->ID, '_tg_ancienne_description', wp_slash( $poste->post_content ) );
		}
		wp_update_post(
			array(
				'ID'           => $poste->ID,
				'post_content' => wp_slash( $html ),
			)
		);
		++$n;
	}
	return $n;
}

/**
 * Titre et description Rank Math des pages de WooCommerce et de la page Newsletter (inc/donnees-seo.php, généré).
 * Clé : réglage de page WooCommerce (shop, cart, checkout, myaccount) ou identifiant de page (newsletter).
 *
 * @return array Identifiant de page => array( 'titre' => …, 'desc' => … ).
 */
function tg_seo_pages() {
	$res = array();
	$chemin = get_theme_file_path( 'inc/donnees-seo.php' );
	if ( ! file_exists( $chemin ) ) {
		return $res;
	}
	foreach ( require $chemin as $cle => $seo ) {
		if ( in_array( $cle, array( 'shop', 'cart', 'checkout', 'myaccount' ), true ) ) {
			$id = function_exists( 'wc_get_page_id' ) ? (int) wc_get_page_id( $cle ) : 0;
		} else {
			$page = tg_page( $cle );
			$id   = $page ? $page->ID : 0;
		}
		if ( $id > 0 ) {
			$res[ $id ] = $seo;
		}
	}
	return $res;
}

/**
 * Garde l'état d'avant (nom, ordre, titre et description Rank Math) d'un produit ou d'une page, une seule fois.
 *
 * @param WP_Post $poste Produit ou page.
 */
function tg_garder_avant_catalogue( $poste ) {
	if ( metadata_exists( 'post', $poste->ID, '_tg_avant_catalogue' ) ) {
		return;
	}
	$avant = array(
		'titre'                 => $poste->post_title,
		'ordre'                 => (int) $poste->menu_order,
		'rank_math_title'       => (string) get_post_meta( $poste->ID, 'rank_math_title', true ),
		'rank_math_description' => (string) get_post_meta( $poste->ID, 'rank_math_description', true ),
	);
	update_post_meta( $poste->ID, '_tg_avant_catalogue', wp_slash( wp_json_encode( $avant ) ) );
}

/**
 * Écrit une valeur Rank Math si elle change (vide : la valeur est retirée).
 *
 * @param int    $id     Produit ou page.
 * @param string $cle    rank_math_title ou rank_math_description.
 * @param string $valeur Valeur.
 * @return bool Changé ou non.
 */
function tg_meta_rank_math( $id, $cle, $valeur ) {
	if ( (string) get_post_meta( $id, $cle, true ) === (string) $valeur ) {
		return false;
	}
	if ( '' === (string) $valeur ) {
		delete_post_meta( $id, $cle );
	} else {
		update_post_meta( $id, $cle, wp_slash( $valeur ) );
	}
	return true;
}

/**
 * Noms, ordre et référencement comme la maquette : noms des 14 produits (« L’Isard », « Le Château de Mauvezin »…,
 * identifiants inchangés), rang dans la collection (paysages, patrimoine, faune, puis le kit LED et la carte cadeau),
 * titre et description Rank Math des fiches et des pages de WooCommerce, tri par défaut « ordre personnalisé ».
 * L'état d'avant est gardé (_tg_avant_catalogue, tg_avant_tri) : le bouton « Remettre comme avant » le rétablit.
 *
 * @return int Nombre de produits ou de pages modifiés.
 */
function tg_appliquer_catalogue() {
	$n = 0;
	foreach ( tg_toutes_donnees() as $slug => $d ) {
		$poste   = empty( $d['nom'] ) ? null : get_page_by_path( $slug, OBJECT, 'product' );
		$produit = $poste ? wc_get_product( $poste->ID ) : null;
		if ( ! $produit ) {
			continue;
		}
		tg_garder_avant_catalogue( $poste );
		$change = false;
		if ( $produit->get_name( 'edit' ) !== $d['nom'] ) {
			$produit->set_name( $d['nom'] );
			$change = true;
		}
		if ( isset( $d['ordre'] ) && (int) $produit->get_menu_order( 'edit' ) !== (int) $d['ordre'] ) {
			$produit->set_menu_order( (int) $d['ordre'] );
			$change = true;
		}
		if ( $change ) {
			$produit->save();
		}
		if ( ! empty( $d['titre_seo'] ) ) {
			$change = tg_meta_rank_math( $poste->ID, 'rank_math_title', $d['titre_seo'] ) || $change;
		}
		if ( ! empty( $d['desc_seo'] ) ) {
			$change = tg_meta_rank_math( $poste->ID, 'rank_math_description', $d['desc_seo'] ) || $change;
		}
		$n += $change ? 1 : 0;
	}
	foreach ( tg_seo_pages() as $id => $seo ) {
		$poste = get_post( $id );
		if ( ! $poste ) {
			continue;
		}
		tg_garder_avant_catalogue( $poste );
		$change = tg_meta_rank_math( $id, 'rank_math_title', $seo['titre'] );
		$change = tg_meta_rank_math( $id, 'rank_math_description', $seo['desc'] ) || $change;
		$n     += $change ? 1 : 0;
	}
	if ( false === get_option( 'tg_avant_tri' ) ) {
		update_option( 'tg_avant_tri', get_option( 'woocommerce_default_catalog_orderby', 'menu_order' ), false );
	}
	update_option( 'woocommerce_default_catalog_orderby', 'menu_order' );
	return $n;
}

/**
 * Remet noms, ordre, référencement et tri comme avant tg_appliquer_catalogue().
 *
 * @return int Nombre de produits ou de pages remis.
 */
function tg_annuler_catalogue() {
	$n = 0;
	$postes = get_posts(
		array(
			'post_type'      => array( 'product', 'page' ),
			'post_status'    => 'any',
			'posts_per_page' => -1,
			'meta_key'       => '_tg_avant_catalogue', // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key
		)
	);
	foreach ( $postes as $poste ) {
		$avant = json_decode( (string) get_post_meta( $poste->ID, '_tg_avant_catalogue', true ), true );
		if ( ! is_array( $avant ) ) {
			continue;
		}
		$produit = 'product' === $poste->post_type ? wc_get_product( $poste->ID ) : null;
		if ( $produit ) {
			$produit->set_name( $avant['titre'] );
			$produit->set_menu_order( (int) $avant['ordre'] );
			$produit->save();
		}
		tg_meta_rank_math( $poste->ID, 'rank_math_title', $avant['rank_math_title'] );
		tg_meta_rank_math( $poste->ID, 'rank_math_description', $avant['rank_math_description'] );
		delete_post_meta( $poste->ID, '_tg_avant_catalogue' );
		++$n;
	}
	$tri = get_option( 'tg_avant_tri' );
	if ( false !== $tri ) {
		update_option( 'woocommerce_default_catalog_orderby', $tri );
		delete_option( 'tg_avant_tri' );
	}
	return $n;
}

/**
 * Page « Apparence › Terre Gravée ».
 */
function tg_page_admin() {
	$msg = get_transient( 'tg_admin_msg' );
	delete_transient( 'tg_admin_msg' );
	$ok  = '<span style="color:#1a7f37">✔</span> ';
	$non = '<span style="color:#b32d2e">✘</span> ';
	$signal = '<span style="color:#996800">!</span> ';
	$controles = array();

	$controles[] = ( class_exists( 'WooCommerce' ) ? $ok : $non ) . 'WooCommerce actif';
	$manquantes  = array();
	foreach ( array( 'accueil', 'carte-des-lieux', 'propos', 'creations', 'tuto', 'contact', 'cgv', 'mentions-legales', 'politique' ) as $s ) {
		if ( ! tg_page( $s ) ) {
			$manquantes[] = '/' . $s . '/';
		}
	}
	$controles[] = ( $manquantes ? $non . 'Pages manquantes : ' . esc_html( implode( ', ', $manquantes ) ) . ' (Outils › Importer › WordPress, fichier contenu-terre-gravee.xml)' : $ok . 'Les neuf pages de la maquette sont publiées' );
	$accueil     = tg_page( 'accueil' );
	$est_accueil = $accueil && 'page' === get_option( 'show_on_front' ) && (int) get_option( 'page_on_front' ) === $accueil->ID;
	$controles[] = ( $est_accueil ? $ok : $non ) . 'Page d’accueil : « Accueil »';
	$menu        = get_posts( array( 'post_type' => 'wp_navigation', 'name' => 'menu-principal-terre-gravee', 'posts_per_page' => 1, 'fields' => 'ids' ) );
	$controles[] = ( $menu ? $ok . 'Menu principal importé (Apparence › Éditeur › Navigation pour le modifier)' : $non . 'Menu principal absent : l’en-tête affiche ses cinq liens par défaut' );
	if ( class_exists( 'WooCommerce' ) ) {
		$controles[] = ( tg_produit_led() ? $ok : $non ) . 'Kit LED trouvé (produit « ' . esc_html( tg_slug_led() ) . ' ») : option des plaques';
		$plaques = 0;
		$sans_photo = array();
		foreach ( tg_toutes_donnees() as $slug => $d ) {
			if ( empty( $d['histoire'] ) ) {
				continue;
			}
			$poste = get_page_by_path( $slug, OBJECT, 'product' );
			$p     = $poste ? wc_get_product( $poste->ID ) : null;
			if ( $p && tg_attribut_finition( $p ) ) {
				++$plaques;
				foreach ( tg_variations_par_finition( $p ) as $f => $v ) {
					if ( ! $v['image'] ) {
						$sans_photo[] = $p->get_name() . ' (' . $f . ')';
					}
				}
			}
		}
		$controles[] = ( 12 === $plaques ? $ok : $non ) . sprintf( '%d plaques sur 12 reconnues (attribut de finition noir, gris, doré)', $plaques );
		if ( $sans_photo ) {
			$controles[] = $signal . 'Signalement, sans gravité : finitions sans photo de variation (« photo à venir » sur la fiche) : ' . esc_html( implode( ', ', $sans_photo ) );
		}
		$noms_ecart = array();
		foreach ( tg_toutes_donnees() as $slug => $d ) {
			$poste = empty( $d['nom'] ) ? null : get_page_by_path( $slug, OBJECT, 'product' );
			if ( $poste && ( $poste->post_title !== $d['nom'] || ( isset( $d['ordre'] ) && (int) $poste->menu_order !== (int) $d['ordre'] ) ) ) {
				$noms_ecart[] = $poste->post_title;
			}
		}
		$tri_ok      = 'menu_order' === get_option( 'woocommerce_default_catalog_orderby' );
		$controles[] = ( ! $noms_ecart && $tri_ok ? $ok . 'Noms, ordre et tri de la collection comme la maquette' : $non . 'Noms ou ordre différents de la maquette' . ( $noms_ecart ? ' : ' . esc_html( implode( ', ', $noms_ecart ) ) : '' ) . ( $tri_ok ? '' : ' ; tri par défaut de la boutique autre que « ordre personnalisé »' ) . ' (bouton « Noms, ordre et référencement des produits » ci-dessous)' );
		$tel         = get_option( 'woocommerce_checkout_phone_field', 'required' );
		$societe     = get_option( 'woocommerce_checkout_company_field', 'optional' );
		$controles[] = ( 'required' === $tel && 'hidden' === $societe ? $ok . 'Validation de commande : téléphone obligatoire (points relais), entreprise masquée, pas de région pour la France' : $non . 'Validation de commande : téléphone « ' . esc_html( $tel ) . ' », entreprise « ' . esc_html( $societe ) . ' ». Réglez Apparence › Personnaliser › WooCommerce › Validation de commande : téléphone Obligatoire, entreprise Masqué' );
		$controles[] = $ok . 'Offre de Noël : ' . esc_html( tg_etat_noel() ) . ' (du 27 novembre au 14 décembre 2026 : livraison offerte)';
		// Le tarif à 0 € vient d'un extrait WPCode, pas du thème : on vérifie qu'il est publié (actif)
		$extrait_noel = get_posts( array( 'post_type' => 'wpcode', 'post_status' => 'publish', 'title' => 'Livraison offerte Noël 2026', 'posts_per_page' => 1, 'fields' => 'ids' ) );
		$controles[]  = $extrait_noel ? $ok . 'Livraison offerte : extrait WPCode « Livraison offerte Noël 2026 » actif (le thème ne fait qu’annoncer l’offre)' : $non . 'Livraison offerte : extrait WPCode « Livraison offerte Noël 2026 » introuvable ou inactif. Le thème ne met pas la livraison à 0 € lui-même : sans l’extrait, l’offre annoncée ne serait pas appliquée';
	}
	$controles[] = ( class_exists( 'WpMatomo' ) || defined( 'MATOMO_ANALYTICS_FILE' ) ? $ok . 'Extension Matomo active (module d’opposition de la page Confidentialité)' : $non . 'Extension Matomo absente : la page Confidentialité annonce Matomo et son module d’opposition (guide, « Avant tout »)' );
	$controles[] = ( get_option( 'tg_mediateur_adhere' ) ? $ok . 'Adhésion au médiateur (CM2C) déclarée : le CM2C est indiqué aux visiteurs' : $signal . 'Adhésion au médiateur (CM2C) non déclarée : aucun médiateur n’est nommé aux visiteurs (vous, administrateur, voyez le texte prévu avec « adhésion à faire »)' );
	$controles[] = $ok . 'Marqueurs de la maquette (« à fournir », « à confirmer »…) : visibles seulement des administrateurs connectés, jamais des visiteurs';
	?>
	<div class="wrap">
		<h1>Terre Gravée</h1>
		<?php if ( $msg ) : ?>
			<div class="notice notice-success"><p><?php echo esc_html( $msg ); ?></p></div>
		<?php endif; ?>
		<h2>Liste de contrôle</h2>
		<ul style="font-size:14px;line-height:2">
			<?php foreach ( $controles as $c ) : ?>
				<li><?php echo wp_kses_post( $c ); ?></li>
			<?php endforeach; ?>
		</ul>
		<h2>Actions</h2>
		<form method="post">
			<?php wp_nonce_field( 'tg_admin' ); ?>
			<p><button class="button button-primary" name="tg_action" value="accueil" <?php disabled( ! $accueil || $est_accueil ); ?>>Utiliser la page « Accueil » comme page d’accueil</button></p>
			<p><button class="button" name="tg_action" value="descriptions" onclick="return confirm('Remplacer la description des 12 plaques et de la carte cadeau par le texte relu de la maquette ? L’ancienne description est gardée et peut être remise.');">Remplacer la description des plaques par le texte de la maquette</button>
			<button class="button-link" name="tg_action" value="annuler_descriptions">Remettre les anciennes descriptions</button></p>
			<p class="description">Le texte de la maquette retire les mentions « série limitée et numérotée » et les formulations non vérifiées des anciennes descriptions. La description de la carte cadeau devient « Carte cadeau numérique, envoyée par e-mail… ».</p>
			<p><button class="button" name="tg_action" value="catalogue" onclick="return confirm('Mettre les noms, l’ordre de la collection et le référencement (titre et description Rank Math) des produits et des pages de la boutique comme la maquette ? Les identifiants (adresses) ne changent pas. L’état d’avant est gardé et peut être remis.');">Noms, ordre et référencement des produits comme la maquette</button>
			<button class="button-link" name="tg_action" value="annuler_catalogue">Remettre comme avant</button></p>
			<p class="description">Noms typographiés (« L’Isard », « Le Château de Mauvezin », « La Tour des Jacobins », « L’Abbaye de l’Escaladieu », « Carte cadeau »…), collection rangée par thème avec le kit LED et la carte cadeau à la fin (tri par défaut « ordre personnalisé »), titres et descriptions de la maquette pour les 14 fiches, la collection, le panier, la validation, le compte et la page Newsletter.</p>
		</form>
		<h2>Médiateur de la consommation</h2>
		<form method="post">
			<?php wp_nonce_field( 'tg_admin' ); ?>
			<p><label><input type="checkbox" name="tg_mediateur_adhere" value="1" <?php checked( (bool) get_option( 'tg_mediateur_adhere' ) ); ?>> J’ai adhéré au CM2C et j’ai reçu la confirmation de mon adhésion</label></p>
			<p class="description">Tant que la case n’est pas cochée, aucun médiateur n’est nommé aux visiteurs : le pied de page n’en parle pas et les CGV et la page Contact s’arrêtent à la réclamation écrite (vous, connecté, voyez le texte prévu avec le marqueur « adhésion à faire »). Cochée, le CM2C (49 rue de Ponthieu, 75008 Paris, www.cm2c.net) apparaît pour tous dans le pied de page, les CGV et la page Contact. Ne la cochez qu’une fois l’adhésion confirmée.</p>
			<p><button class="button" name="tg_action" value="mediateur">Enregistrer</button></p>
		</form>
		<h2>Où modifier quoi</h2>
		<ul style="list-style:disc;padding-left:20px">
			<li>Textes des pages : Pages › modifier (chaque section est un groupe de blocs ; les sections de la maquette sont aussi dans l’outil d’insertion, catégorie « Terre Gravée »).</li>
			<li>En-tête, pied de page, bandeau de Noël : Apparence › Éditeur › Compositions › Parties de modèle.</li>
			<li>Cartel, phrase, « Le lieu » d’une plaque : Produits › modifier › encadré « Fiche Terre Gravée ». L’histoire du modèle est la description du produit.</li>
			<li>Dates de l’offre de Noël : inc/noel.php du thème (fonction tg_offre).</li>
		</ul>
	</div>
	<?php
}
