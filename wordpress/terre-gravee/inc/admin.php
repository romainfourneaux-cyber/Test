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
		$msg = $oui ? 'Adhésion au médiateur notée : le marqueur « adhésion à faire » ne s’affiche plus.' : 'Le marqueur « adhésion à faire » s’affiche de nouveau.';
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
		$controles[] = $ok . 'Offre de Noël : ' . esc_html( tg_etat_noel() ) . ' (du 27 novembre au 14 décembre 2026 : livraison offerte)';
	}
	$controles[] = ( class_exists( 'WpMatomo' ) || defined( 'MATOMO_ANALYTICS_FILE' ) ? $ok . 'Extension Matomo active (module d’opposition de la page Confidentialité)' : $non . 'Extension Matomo absente : la page Confidentialité annonce Matomo et son module d’opposition (guide, « Avant tout »)' );
	$controles[] = ( get_option( 'tg_mediateur_adhere' ) ? $ok . 'Adhésion au médiateur (CM2C) déclarée' : $signal . 'Adhésion au médiateur (CM2C) non déclarée : les pages affichent « adhésion à faire »' );
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
		</form>
		<h2>Médiateur de la consommation</h2>
		<form method="post">
			<?php wp_nonce_field( 'tg_admin' ); ?>
			<p><label><input type="checkbox" name="tg_mediateur_adhere" value="1" <?php checked( (bool) get_option( 'tg_mediateur_adhere' ) ); ?>> J’ai adhéré au CM2C et j’ai reçu la confirmation de mon adhésion</label></p>
			<p class="description">Cochée, le marqueur « adhésion à faire » disparaît du pied de page, des CGV et de la page Contact. Ne la cochez qu’une fois l’adhésion confirmée : avant, les pages annonceraient un médiateur dont vous ne relevez pas.</p>
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
