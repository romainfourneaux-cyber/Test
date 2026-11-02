<?php
/**
 * Offre de Noël : quatre états selon la date (comme la maquette), livraison offerte pendant l'offre, rappel du magnet.
 *
 * États, en heure de Paris (réglage « Fuseau horaire » de WordPress) :
 *   « avant »   jusqu'au 26 novembre 2026 inclus ;
 *   « pendant » du 27 novembre au 14 décembre 2026 inclus : livraison offerte, un magnet en ardoise gravée dans chaque colis ;
 *   « apres »   du 15 au 24 décembre : la carte cadeau prend le relais ;
 *   « fini »    à partir du 25 décembre : plus rien ne parle de Noël.
 *
 * Le contenu porte des classes « tg-quand tg-quand-<état> » : le serveur écrit l'état du jour sur <html data-noel="…">
 * (les variantes des autres états sont masquées par assets/wp.css), puis le script le recalcule dans le navigateur,
 * ce qui corrige une page restée en cache (LiteSpeed Cache) après un changement d'état.
 *
 * Pour l'an prochain : changer les dates ci-dessous (ou le filtre « tg_offre ») et les textes des pages.
 *
 * @package TerreGravee
 */

defined( 'ABSPATH' ) || exit;

/**
 * Dates de l'offre (incluses).
 *
 * @return array{debut:string,fin:string,noel_fin:string}
 */
function tg_offre() {
	return apply_filters(
		'tg_offre',
		array(
			'debut'    => '2026-11-27',
			'fin'      => '2026-12-14',
			'noel_fin' => '2026-12-24',
		)
	);
}

/**
 * Date du jour (fuseau du site). La constante TG_DATE_ESSAI (AAAA-MM-JJ), à mettre dans wp-config.php sur un site
 * de test seulement, simule une autre date côté serveur (livraison offerte comprise).
 *
 * @return string AAAA-MM-JJ
 */
function tg_aujourdhui() {
	if ( defined( 'TG_DATE_ESSAI' ) && preg_match( '/^\d{4}-\d{2}-\d{2}$/', TG_DATE_ESSAI ) ) {
		return TG_DATE_ESSAI;
	}
	return wp_date( 'Y-m-d' );
}

/**
 * État de l'offre aujourd'hui.
 *
 * @return string avant|pendant|apres|fini
 */
function tg_etat_noel() {
	$o = tg_offre();
	$j = tg_aujourdhui();
	if ( $j < $o['debut'] ) {
		return 'avant';
	}
	if ( $j <= $o['fin'] ) {
		return 'pendant';
	}
	if ( $j <= $o['noel_fin'] ) {
		return 'apres';
	}
	return 'fini';
}

/**
 * L'état sur la balise <html>, pour masquer dès le premier affichage les variantes des autres états.
 *
 * @param string $attributs Attributs de <html>.
 * @return string
 */
function tg_attribut_noel( $attributs ) {
	if ( is_admin() ) {
		return $attributs;
	}
	return $attributs . ' data-noel="' . esc_attr( tg_etat_noel() ) . '"';
}
add_filter( 'language_attributes', 'tg_attribut_noel' );

if ( class_exists( 'WooCommerce' ) ) {

	/**
	 * Pendant l'offre, tous les modes de livraison passent à 0 € (« 5 € pour tous les modes, offerte pendant l'offre »).
	 *
	 * @param array $tarifs Tarifs calculés.
	 * @return array
	 */
	function tg_livraison_offerte( $tarifs ) {
		if ( 'pendant' !== tg_etat_noel() || ! apply_filters( 'tg_livraison_offerte_active', true ) ) {
			return $tarifs;
		}
		foreach ( $tarifs as $tarif ) {
			if ( $tarif instanceof WC_Shipping_Rate ) {
				$tarif->set_cost( 0 );
				$tarif->set_taxes( array() );
			}
		}
		return $tarifs;
	}
	add_filter( 'woocommerce_package_rates', 'tg_livraison_offerte', 50 );

	/**
	 * L'état de l'offre entre dans le calcul de la livraison mise en cache par WooCommerce : le 27 novembre et le
	 * 15 décembre, les paniers ouverts reprennent le bon tarif.
	 *
	 * @param array $colis Colis.
	 * @return array
	 */
	function tg_colis_etat( $colis ) {
		foreach ( $colis as $i => $c ) {
			$colis[ $i ]['tg_offre_noel'] = tg_etat_noel();
		}
		return $colis;
	}
	add_filter( 'woocommerce_cart_shipping_packages', 'tg_colis_etat' );

	/**
	 * Encart de Noël au-dessus du panier et de la validation de commande (états « avant » et « pendant »).
	 *
	 * @param string $html HTML du bloc.
	 * @return string
	 */
	function tg_encart_noel_panier( $html ) {
		if ( is_admin() || wp_is_json_request() ) {
			return $html;
		}
		// Ligne « Magnet en ardoise gravée : Offert » pendant l'offre, comme dans le panier de la maquette, si un colis part
		$magnet = ( WC()->cart && WC()->cart->needs_shipping() )
			? '<dl class="encart-noel__lignes tg-quand tg-quand-pendant"><div><dt>Magnet en ardoise gravée</dt><dd class="offerte">Offert</dd></div></dl>'
			: '';
		$encart = '<aside class="encart-noel encart-noel--commande tg-quand tg-quand-avant tg-quand-pendant" aria-label="Noël">'
			. '<p class="encart-noel__titre">Noël</p><div class="encart-noel__corps">'
			. '<p class="tg-quand tg-quand-avant"><strong>À partir du 27 novembre : livraison offerte et un magnet en ardoise gravée offert dans chaque colis.</strong> Aujourd’hui, la livraison d’une plaque coûte 5 € par commande.</p>'
			. '<p class="tg-quand tg-quand-pendant"><strong>Livraison offerte et un magnet en ardoise gravée offert dans chaque colis jusqu’au 14 décembre inclus.</strong></p>'
			. '<p>Pour recevoir avant Noël, commandez au plus tard le lundi 14 décembre 2026. Aucuns frais de port pour une carte cadeau seule, envoyée par e-mail.</p>'
			. $magnet
			. '</div></aside>';
		return $encart . $html;
	}
	add_filter( 'render_block_woocommerce/cart', 'tg_encart_noel_panier' );
	add_filter( 'render_block_woocommerce/checkout', 'tg_encart_noel_panier' );

	/**
	 * Pendant l'offre, une note sur la commande rappelle de glisser le magnet dans le colis.
	 *
	 * @param WC_Order $commande Commande.
	 */
	function tg_note_magnet( $commande ) {
		if ( ! $commande instanceof WC_Order || 'pendant' !== tg_etat_noel() || ! $commande->needs_shipping_address() ) {
			return;
		}
		if ( $commande->get_meta( '_tg_magnet' ) ) {
			return;
		}
		$commande->update_meta_data( '_tg_magnet', 'oui' );
		$commande->add_order_note( 'Offre de Noël : glisser un magnet en ardoise gravée dans le colis.' );
		$commande->save();
	}
	add_action( 'woocommerce_checkout_order_created', 'tg_note_magnet' );
	add_action( 'woocommerce_store_api_checkout_order_processed', 'tg_note_magnet' );
}
