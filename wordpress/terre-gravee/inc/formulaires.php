<?php
/**
 * Formulaires de la maquette, rendus réels : contact, rétractation en ligne (en deux étapes), lettre d'information.
 *
 *  - [tg_contact] : le message part par e-mail à l'adresse de contact (réponse à l'expéditeur possible d'un clic).
 *  - [tg_devis] : demande de devis sur mesure (mêmes champs que la maquette, croquis ou photo joint à l'e-mail,
 *    5 Mo au plus, image ou PDF ; le fichier n'est pas gardé sur le serveur).
 *  - [tg_retractation] : « Renoncer au contrat ici » ; après confirmation, un e-mail part à l'atelier et un accusé de
 *    réception, daté, au client (support durable). Chaque rétractation est aussi gardée dans l'administration
 *    (menu « Rétractations »), pour preuve.
 *  - [tg_lettre] : inscription par l'extension « Newsletter » (déjà installée sur terregravee.fr) si elle est active ;
 *    sinon, un lien vers la page Contact.
 *
 * Pas de jeton de sécurité (nonce) sur ces formulaires publics : les pages peuvent rester en cache plusieurs jours
 * (LiteSpeed Cache) et le jeton y deviendrait périmé. Protection : champ piège invisible, délai minimal de remplissage,
 * limite de cinq envois par heure et par adresse IP.
 *
 * @package TerreGravee
 */

defined( 'ABSPATH' ) || exit;

/**
 * Adresse qui reçoit les messages et les rétractations.
 *
 * @return string
 */
function tg_email_atelier() {
	return apply_filters( 'tg_email_atelier', 'contact@terregravee.fr' );
}

/**
 * Champs anti-robots communs : piège invisible et heure d'affichage signée.
 *
 * @return string
 */
function tg_champs_anti_robots() {
	$t = time();
	return '<p class="tg-piege" aria-hidden="true"><label>Ne pas remplir <input type="text" name="tg_site" tabindex="-1" autocomplete="off"></label></p>'
		. '<input type="hidden" name="tg_t" value="' . esc_attr( $t . '.' . substr( wp_hash( 'tg' . $t ), 0, 12 ) ) . '">';
}

/**
 * Contrôle anti-robots. Renvoie un code d'erreur, ou chaîne vide si tout va bien.
 *
 * @return string
 */
function tg_controle_anti_robots() {
	// phpcs:disable WordPress.Security.NonceVerification.Missing
	if ( ! empty( $_POST['tg_site'] ) ) {
		return 'robot';
	}
	$jeton = isset( $_POST['tg_t'] ) ? sanitize_text_field( wp_unslash( $_POST['tg_t'] ) ) : '';
	// phpcs:enable
	$p = explode( '.', $jeton );
	if ( 2 !== count( $p ) || ! hash_equals( substr( wp_hash( 'tg' . $p[0] ), 0, 12 ), $p[1] ) ) {
		return 'jeton';
	}
	$age = time() - (int) $p[0];
	if ( $age < 3 || $age > 60 * DAY_IN_SECONDS ) {
		return 'delai';
	}
	$ip  = isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : '';
	$cle = 'tg_envois_' . md5( $ip );
	$n   = (int) get_transient( $cle );
	if ( $n >= 5 ) {
		return 'trop';
	}
	set_transient( $cle, $n + 1, HOUR_IN_SECONDS );
	return '';
}

/**
 * Retour vers la page du formulaire, avec un état à afficher.
 *
 * @param string $etat   Code.
 * @param string $ancre  Ancre.
 * @param array  $extra  Paramètres en plus.
 */
function tg_retour( $etat, $ancre, $extra = array() ) {
	$depart = wp_get_referer();
	$depart = $depart ? $depart : home_url( '/contact/' );
	$depart = remove_query_arg( array( 'tg_contact', 'tg_retract', 'tg_jeton', 'tg_devis' ), $depart );
	$depart = preg_replace( '/#.*$/', '', $depart );
	$cles   = array(
		'retractation'     => 'tg_retract',
		'formulaire-devis' => 'tg_devis',
	);
	$cle    = isset( $cles[ $ancre ] ) ? $cles[ $ancre ] : 'tg_contact';
	wp_safe_redirect( add_query_arg( $extra + array( $cle => $etat ), $depart ) . '#' . $ancre );
	exit;
}

/**
 * Message affiché sous un formulaire après l'envoi.
 *
 * @param string $etat Code.
 * @return string
 */
function tg_message_formulaire( $etat ) {
	$textes = array(
		'envoye'  => 'Merci, votre message est parti. La réponse arrivera par e-mail.',
		'champs'  => 'Il manque un champ, ou l’adresse e-mail n’est pas valable. Rien n’a été envoyé.',
		'echec'   => 'L’envoi n’a pas abouti. Écrivez directement à ' . tg_email_atelier() . '.',
		'robot'   => 'L’envoi n’a pas abouti. Réessayez dans quelques secondes, ou écrivez à ' . tg_email_atelier() . '.',
		'jeton'   => 'L’envoi n’a pas abouti. Rechargez la page puis réessayez.',
		'delai'   => 'L’envoi n’a pas abouti. Rechargez la page puis réessayez.',
		'trop'    => 'Trop d’envois en peu de temps. Réessayez dans une heure, ou écrivez à ' . tg_email_atelier() . '.',
		'fichier' => 'Le fichier joint n’a pas été accepté : une image (JPEG, PNG, WebP, GIF) ou un PDF de 5 Mo au plus. Rien n’a été envoyé.',
		'devis'   => 'Merci, votre demande est partie. La réponse arrivera par e-mail.',
	);
	return isset( $textes[ $etat ] ) ? $textes[ $etat ] : '';
}

/* -------------------------------------------------------------------------
 * Contact
 * ---------------------------------------------------------------------- */

/**
 * [tg_contact]
 *
 * @return string
 */
function tg_code_contact() {
	$etat = isset( $_GET['tg_contact'] ) ? sanitize_key( wp_unslash( $_GET['tg_contact'] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
	$msg  = tg_message_formulaire( $etat );
	$sujets = array( 'Une question sur un modèle', 'Ma commande', 'Un projet sur mesure', 'Autre' );
	$options = '';
	foreach ( $sujets as $s ) {
		$options .= '<option>' . esc_html( $s ) . '</option>';
	}
	return '<form class="formulaire" id="formulaire-contact" method="post" action="' . esc_url( admin_url( 'admin-post.php' ) ) . '">'
		. '<input type="hidden" name="action" value="tg_contact">'
		. '<div class="champs">'
		. '<div class="champ"><label for="nom-contact">Nom</label><input id="nom-contact" name="nom" type="text" autocomplete="name" required maxlength="120"></div>'
		. '<div class="champ"><label for="email-contact">E-mail</label><input id="email-contact" name="email" type="email" autocomplete="email" required maxlength="190"></div>'
		. '<div class="champ champ--large"><label for="sujet">Sujet</label><select id="sujet" name="sujet">' . $options . '</select></div>'
		. '<div class="champ champ--large"><label for="message-contact">Message</label><textarea id="message-contact" name="message" rows="5" required maxlength="5000"></textarea></div>'
		. '</div>'
		. tg_champs_anti_robots()
		. '<div><button class="btn" type="submit">Envoyer</button></div>'
		. '<p class="formulaire__aide">Vos coordonnées servent uniquement à vous répondre. <a href="' . esc_url( home_url( '/politique/' ) ) . '">Confidentialité</a></p>'
		. ( $msg ? '<p class="message-demo' . ( 'envoye' === $etat ? ' message-demo--ok' : ' message-demo--erreur' ) . '" role="status" tabindex="-1">' . esc_html( $msg ) . '</p>' : '' )
		. '</form>';
}
add_shortcode( 'tg_contact', 'tg_code_contact' );

/**
 * Envoi du formulaire de contact.
 */
function tg_envoi_contact() {
	$erreur = tg_controle_anti_robots();
	if ( $erreur ) {
		tg_retour( $erreur, 'formulaire-contact' );
	}
	// phpcs:disable WordPress.Security.NonceVerification.Missing
	$nom     = isset( $_POST['nom'] ) ? sanitize_text_field( wp_unslash( $_POST['nom'] ) ) : '';
	$email   = isset( $_POST['email'] ) ? sanitize_email( wp_unslash( $_POST['email'] ) ) : '';
	$sujet   = isset( $_POST['sujet'] ) ? sanitize_text_field( wp_unslash( $_POST['sujet'] ) ) : '';
	$message = isset( $_POST['message'] ) ? sanitize_textarea_field( wp_unslash( $_POST['message'] ) ) : '';
	// phpcs:enable
	if ( '' === $nom || ! is_email( $email ) || '' === trim( $message ) ) {
		tg_retour( 'champs', 'formulaire-contact' );
	}
	$corps = "Message envoyé depuis le formulaire de contact de " . home_url( '/' ) . "\n\n"
		. 'Nom : ' . $nom . "\nE-mail : " . $email . "\nSujet : " . $sujet . "\n\n" . $message . "\n";
	$ok    = wp_mail( tg_email_atelier(), '[Terre Gravée] ' . $sujet . ' : ' . $nom, $corps, array( 'Reply-To: ' . $nom . ' <' . $email . '>' ) );
	tg_retour( $ok ? 'envoye' : 'echec', 'formulaire-contact' );
}
add_action( 'admin_post_nopriv_tg_contact', 'tg_envoi_contact' );
add_action( 'admin_post_tg_contact', 'tg_envoi_contact' );

/* -------------------------------------------------------------------------
 * Demande de devis sur mesure
 * ---------------------------------------------------------------------- */

/**
 * Choix des listes du formulaire de devis (repris de la maquette, page Sur mesure).
 *
 * @return array
 */
function tg_choix_devis() {
	$modeles = array( 'Aucun en particulier' );
	foreach ( tg_toutes_donnees() as $d ) {
		if ( ! empty( $d['histoire'] ) ) {
			$modeles[] = $d['nom'];
		}
	}
	return array(
		'type'   => array( 'Adapter un modèle existant', 'Un dessin inédit', 'Série pour un professionnel' ),
		'modele' => $modeles,
		'metal'  => array( 'Aluminium, teinte RAL', 'Acier Corten', 'Aluminium brut', 'Je ne sais pas encore' ),
		'usage'  => array( 'Intérieur', 'Extérieur', 'Les deux' ),
	);
}

/**
 * Types de fichiers acceptés pour le croquis ou la photo.
 *
 * @return array
 */
function tg_types_fichier_devis() {
	return array(
		'jpg|jpeg|jpe' => 'image/jpeg',
		'png'          => 'image/png',
		'webp'         => 'image/webp',
		'gif'          => 'image/gif',
		'pdf'          => 'application/pdf',
	);
}

/**
 * [tg_devis]
 *
 * @return string
 */
function tg_code_devis() {
	$etat  = isset( $_GET['tg_devis'] ) ? sanitize_key( wp_unslash( $_GET['tg_devis'] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
	$msg   = tg_message_formulaire( 'envoye' === $etat ? 'devis' : $etat );
	$choix = tg_choix_devis();
	$liste = function ( $nom, $id ) use ( $choix ) {
		$h = '<select id="' . esc_attr( $id ) . '" name="' . esc_attr( $nom ) . '">';
		foreach ( $choix[ $nom ] as $c ) {
			$h .= '<option>' . esc_html( $c ) . '</option>';
		}
		return $h . '</select>';
	};
	return '<form class="formulaire" id="formulaire-devis" method="post" enctype="multipart/form-data" action="' . esc_url( admin_url( 'admin-post.php' ) ) . '">'
		. '<input type="hidden" name="action" value="tg_devis">'
		. '<div class="champs">'
		. '<div class="champ"><label for="type-demande">Type de demande</label>' . $liste( 'type', 'type-demande' ) . '</div>'
		. '<div class="champ"><label for="modele">Modèle de départ</label>' . $liste( 'modele', 'modele' ) . '</div>'
		. '<div class="champ"><label for="metal">Métal souhaité</label>' . $liste( 'metal', 'metal' ) . '</div>'
		. '<div class="champ"><label for="format">Format</label><input id="format" name="format" type="text" maxlength="120" placeholder="Par exemple 100 × 50 cm" aria-describedby="aide-format"><small id="aide-format">Jusqu’à 2 m × 1 m</small></div>'
		. '<div class="champ"><label for="quantite-projet">Quantité</label><input id="quantite-projet" name="quantite" type="number" min="1" max="9999" value="1"></div>'
		. '<div class="champ"><label for="usage">Usage</label>' . $liste( 'usage', 'usage' ) . '</div>'
		. '<div class="champ champ--large"><label for="message-projet">Votre projet</label><textarea id="message-projet" name="message" rows="4" maxlength="5000" placeholder="Lieu, support, délai souhaité…"></textarea></div>'
		. '<div class="champ champ--large"><label for="fichier">Croquis ou photo (facultatif)</label><input id="fichier" name="fichier" type="file" accept="image/jpeg,image/png,image/webp,image/gif,.pdf" aria-describedby="aide-fichier"><small id="aide-fichier">Une image ou un PDF, 5 Mo au plus.</small></div>'
		. '<div class="champ"><label for="nom-projet">Nom</label><input id="nom-projet" name="nom" type="text" autocomplete="name" required maxlength="120"></div>'
		. '<div class="champ"><label for="email-projet">E-mail</label><input id="email-projet" name="email" type="email" autocomplete="email" required maxlength="190"></div>'
		. '</div>'
		. tg_champs_anti_robots()
		. '<div><button class="btn" type="submit">Envoyer la demande</button></div>'
		. '<p class="formulaire__aide">Vos coordonnées servent uniquement à répondre à cette demande. <a href="' . esc_url( home_url( '/politique/' ) ) . '">Confidentialité</a></p>'
		. ( $msg ? '<p class="message-demo' . ( 'envoye' === $etat ? ' message-demo--ok' : ' message-demo--erreur' ) . '" role="status" tabindex="-1">' . esc_html( $msg ) . '</p>' : '' )
		. '</form>';
}
add_shortcode( 'tg_devis', 'tg_code_devis' );

/**
 * Envoi de la demande de devis (le fichier joint part avec l'e-mail, puis il est effacé du serveur).
 */
function tg_envoi_devis() {
	$erreur = tg_controle_anti_robots();
	if ( $erreur ) {
		tg_retour( $erreur, 'formulaire-devis' );
	}
	$choix = tg_choix_devis();
	// phpcs:disable WordPress.Security.NonceVerification.Missing
	$v = array();
	foreach ( array( 'type', 'modele', 'metal', 'usage', 'format', 'nom' ) as $c ) {
		$v[ $c ] = isset( $_POST[ $c ] ) ? sanitize_text_field( wp_unslash( $_POST[ $c ] ) ) : '';
	}
	foreach ( array( 'type', 'modele', 'metal', 'usage' ) as $c ) {
		if ( ! in_array( $v[ $c ], $choix[ $c ], true ) ) {
			$v[ $c ] = $choix[ $c ][0];
		}
	}
	$v['quantite'] = isset( $_POST['quantite'] ) ? max( 1, min( 9999, absint( $_POST['quantite'] ) ) ) : 1;
	$v['email']    = isset( $_POST['email'] ) ? sanitize_email( wp_unslash( $_POST['email'] ) ) : '';
	$v['message']  = isset( $_POST['message'] ) ? sanitize_textarea_field( wp_unslash( $_POST['message'] ) ) : '';
	// phpcs:enable
	if ( '' === $v['nom'] || ! is_email( $v['email'] ) ) {
		tg_retour( 'champs', 'formulaire-devis' );
	}
	// Croquis ou photo : contrôle de la taille et du type réel du fichier, copie sous son nom dans un dossier temporaire
	$pieces  = array();
	$dossier = '';
	// phpcs:ignore WordPress.Security.NonceVerification.Missing, WordPress.Security.ValidatedSanitizedInput
	$f = isset( $_FILES['fichier'] ) && is_array( $_FILES['fichier'] ) ? $_FILES['fichier'] : null;
	if ( $f && isset( $f['error'] ) && UPLOAD_ERR_NO_FILE !== (int) $f['error'] ) {
		$type = UPLOAD_ERR_OK === (int) $f['error'] && is_uploaded_file( $f['tmp_name'] ) && (int) $f['size'] <= 5 * MB_IN_BYTES
			? wp_check_filetype_and_ext( $f['tmp_name'], $f['name'], tg_types_fichier_devis() )
			: array( 'ext' => false );
		if ( empty( $type['ext'] ) ) {
			tg_retour( 'fichier', 'formulaire-devis' );
		}
		$dossier = trailingslashit( get_temp_dir() ) . 'tg-devis-' . strtolower( wp_generate_password( 12, false ) );
		$nom     = sanitize_file_name( pathinfo( $f['name'], PATHINFO_FILENAME ) );
		$chemin  = $dossier . '/' . ( '' !== $nom ? $nom : 'piece-jointe' ) . '.' . $type['ext'];
		if ( ! wp_mkdir_p( $dossier ) || ! move_uploaded_file( $f['tmp_name'], $chemin ) ) {
			tg_retour( 'echec', 'formulaire-devis' );
		}
		$pieces[] = $chemin;
	}
	$corps = 'Demande de devis envoyée depuis la page Sur mesure de ' . home_url( '/' ) . "\n\n"
		. 'Nom : ' . $v['nom'] . "\nE-mail : " . $v['email'] . "\n\n"
		. 'Type de demande : ' . $v['type'] . "\nModèle de départ : " . $v['modele'] . "\nMétal souhaité : " . $v['metal']
		. "\nFormat : " . ( '' !== $v['format'] ? $v['format'] : '(non précisé)' ) . "\nQuantité : " . $v['quantite'] . "\nUsage : " . $v['usage']
		. "\nCroquis ou photo : " . ( $pieces ? 'en pièce jointe' : 'aucun' ) . "\n\nProjet :\n" . ( '' !== trim( $v['message'] ) ? $v['message'] : '(non précisé)' ) . "\n";
	$ok = wp_mail( tg_email_atelier(), '[Terre Gravée] Devis sur mesure : ' . $v['nom'], $corps, array( 'Reply-To: ' . $v['nom'] . ' <' . $v['email'] . '>' ), $pieces );
	foreach ( $pieces as $p ) {
		wp_delete_file( $p );
	}
	if ( $dossier ) {
		@rmdir( $dossier ); // phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged, WordPress.WP.AlternativeFunctions.file_system_operations_rmdir
	}
	tg_retour( $ok ? 'envoye' : 'echec', 'formulaire-devis' );
}
add_action( 'admin_post_nopriv_tg_devis', 'tg_envoi_devis' );
add_action( 'admin_post_tg_devis', 'tg_envoi_devis' );

/* -------------------------------------------------------------------------
 * Rétractation en ligne (fonction de rétractation, en deux étapes)
 * ---------------------------------------------------------------------- */

/**
 * Registre des rétractations (visible dans l'administration seulement).
 */
function tg_registre_retractations() {
	register_post_type(
		'tg_retractation',
		array(
			'labels'          => array(
				'name'          => 'Rétractations',
				'singular_name' => 'Rétractation',
				'menu_name'     => 'Rétractations',
				'all_items'     => 'Rétractations reçues',
			),
			'public'          => false,
			'show_ui'         => true,
			'show_in_menu'    => class_exists( 'WooCommerce' ) ? 'woocommerce' : true,
			'show_in_rest'    => false,
			'supports'        => array( 'title', 'editor' ),
			'capability_type' => 'post',
			'capabilities'    => array( 'create_posts' => 'do_not_allow' ),
			'map_meta_cap'    => true,
			'menu_icon'       => 'dashicons-undo',
		)
	);
}
add_action( 'init', 'tg_registre_retractations' );

/**
 * Champs de la rétractation.
 *
 * @return array
 */
function tg_champs_retractation() {
	return array(
		'nom'      => 'Nom et prénom',
		'commande' => 'Numéro de commande',
		'email'    => 'E-mail pour l’accusé de réception',
		'articles' => 'Articles concernés',
	);
}

/**
 * [tg_retractation]
 *
 * @return string
 */
function tg_code_retractation() {
	// phpcs:disable WordPress.Security.NonceVerification.Recommended
	$etat  = isset( $_GET['tg_retract'] ) ? sanitize_key( wp_unslash( $_GET['tg_retract'] ) ) : '';
	$jeton = isset( $_GET['tg_jeton'] ) ? sanitize_key( wp_unslash( $_GET['tg_jeton'] ) ) : '';
	// phpcs:enable
	$action = esc_url( admin_url( 'admin-post.php' ) );
	if ( 'recue' === $etat ) {
		return '<div class="formulaire retract"><p class="message-demo message-demo--ok" role="status" tabindex="-1">Votre rétractation est enregistrée. Un accusé de réception daté vient de partir à l’adresse indiquée. S’il s’agit d’une plaque, renvoyez-la au plus tard 14 jours après votre rétractation, à : Terre Gravée, 16 rue du Pic du Midi, 65200 Gerde.</p></div>';
	}
	// Étape 2 sans JavaScript : résumé préparé par le serveur
	if ( 'confirmer' === $etat && $jeton ) {
		$d = get_transient( 'tg_retract_' . $jeton );
		if ( is_array( $d ) ) {
			return '<form class="formulaire retract" method="post" action="' . $action . '"><input type="hidden" name="action" value="tg_retractation"><input type="hidden" name="tg_etape" value="2"><input type="hidden" name="tg_jeton" value="' . esc_attr( $jeton ) . '">'
				. '<div class="retract__etape"><p class="retract__resume" tabindex="-1">' . esc_html( tg_resume_retractation( $d ) ) . '</p>'
				. '<p class="retract__boutons"><button class="btn" type="submit">Confirmer la rétractation</button><a class="btn btn--ligne" href="' . esc_url( remove_query_arg( array( 'tg_retract', 'tg_jeton' ) ) ) . '#retractation">Modifier</a></p></div></form>';
		}
	}
	$msg = tg_message_formulaire( $etat );
	return '<form class="formulaire retract" method="post" action="' . $action . '" data-retract>'
		. '<input type="hidden" name="action" value="tg_retractation"><input type="hidden" name="tg_etape" value="1">'
		. '<fieldset class="retract__etape" data-retract-etape="1"><legend>1. Votre déclaration de rétractation</legend><div class="champs">'
		. '<div class="champ"><label for="nom-retract">Nom et prénom</label><input id="nom-retract" name="nom" type="text" autocomplete="name" required maxlength="120"></div>'
		. '<div class="champ"><label for="commande-retract">Numéro de commande</label><input id="commande-retract" name="commande" type="text" required maxlength="40"></div>'
		. '<div class="champ champ--large"><label for="email-retract">E-mail pour recevoir l’accusé de réception</label><input id="email-retract" name="email" type="email" autocomplete="email" required maxlength="190" aria-describedby="aide-email-retract"><small id="aide-email-retract">Celui de la commande ou un autre.</small></div>'
		. '<div class="champ champ--large"><label for="articles-retract">Articles concernés (facultatif)</label><input id="articles-retract" name="articles" type="text" maxlength="300"><small>Sans précision, la rétractation porte sur toute la commande.</small></div>'
		. '</div>' . tg_champs_anti_robots() . '<button class="btn" type="submit">Renoncer au contrat</button></fieldset>'
		. '<div class="retract__etape" data-retract-etape="2" hidden><p class="retract__resume" tabindex="-1" data-retract-resume>2. Vérifiez puis confirmez votre rétractation.</p>'
		. '<p class="retract__boutons"><button class="btn" type="button" data-retract-confirmer>Confirmer la rétractation</button><button class="btn btn--ligne" type="button" data-retract-retour>Modifier</button></p></div>'
		. ( $msg ? '<p class="message-demo message-demo--erreur" role="status" tabindex="-1">' . esc_html( $msg ) . '</p>' : '' )
		. '</form>';
}
add_shortcode( 'tg_retractation', 'tg_code_retractation' );

/**
 * Phrase de vérification (même texte que dans le navigateur).
 *
 * @param array $d Données.
 * @return string
 */
function tg_resume_retractation( $d ) {
	return '2. Vérifiez puis confirmez : ' . $d['nom'] . ' renonce à la commande ' . $d['commande']
		. ( '' !== $d['articles'] ? ' (articles : ' . $d['articles'] . ').' : ' (toute la commande).' );
}

/**
 * Réception d'une rétractation.
 */
function tg_envoi_retractation() {
	// phpcs:disable WordPress.Security.NonceVerification.Missing
	$etape = isset( $_POST['tg_etape'] ) ? (int) $_POST['tg_etape'] : 1;
	$jeton = isset( $_POST['tg_jeton'] ) ? sanitize_key( wp_unslash( $_POST['tg_jeton'] ) ) : '';
	if ( 2 === $etape && $jeton ) {
		// Confirmation de l'étape 2 sans JavaScript
		$d = get_transient( 'tg_retract_' . $jeton );
		delete_transient( 'tg_retract_' . $jeton );
		if ( ! is_array( $d ) ) {
			tg_retour( 'jeton', 'retractation' );
		}
	} else {
		$erreur = tg_controle_anti_robots();
		if ( $erreur ) {
			tg_retour( $erreur, 'retractation' );
		}
		$d = array();
		foreach ( array_keys( tg_champs_retractation() ) as $c ) {
			$d[ $c ] = isset( $_POST[ $c ] ) ? sanitize_text_field( wp_unslash( $_POST[ $c ] ) ) : '';
		}
		$d['email'] = sanitize_email( $d['email'] );
		if ( '' === $d['nom'] || '' === $d['commande'] || ! is_email( $d['email'] ) ) {
			tg_retour( 'champs', 'retractation' );
		}
		if ( 2 !== $etape ) {
			// Sans JavaScript : on montre le résumé à confirmer (deuxième étape) avant d'enregistrer
			$jeton = strtolower( wp_generate_password( 20, false ) );
			set_transient( 'tg_retract_' . $jeton, $d, HOUR_IN_SECONDS );
			tg_retour( 'confirmer', 'retractation', array( 'tg_jeton' => $jeton ) );
		}
	}
	// phpcs:enable
	$quand = wp_date( 'j F Y \à H \h i' );
	$texte = 'Déclaration de rétractation reçue le ' . $quand . " (heure de Paris).\n\n"
		. 'Nom : ' . $d['nom'] . "\nCommande : " . $d['commande'] . "\nE-mail : " . $d['email'] . "\nArticles : "
		. ( '' !== $d['articles'] ? $d['articles'] : 'toute la commande' ) . "\n";
	wp_insert_post(
		array(
			'post_type'    => 'tg_retractation',
			'post_status'  => 'private',
			'post_title'   => 'Commande ' . $d['commande'] . ' : ' . $d['nom'],
			'post_content' => $texte,
		)
	);
	wp_mail( tg_email_atelier(), '[Terre Gravée] Rétractation : commande ' . $d['commande'], $texte, array( 'Reply-To: ' . $d['nom'] . ' <' . $d['email'] . '>' ) );
	$accuse = 'Bonjour ' . $d['nom'] . ",\n\nNous avons bien reçu votre rétractation le " . $quand . ".\n\n" . $texte
		. "\nS’il s’agit d’une plaque, renvoyez-la au plus tard 14 jours après votre rétractation, à : Terre Gravée, 16 rue du Pic du Midi, 65200 Gerde. Les frais de retour sont à votre charge.\n"
		. "Nous vous remboursons tous les paiements reçus, frais de livraison compris, au plus tard 14 jours après avoir été informés de votre rétractation, avec le moyen de paiement que vous avez utilisé. Le remboursement peut être différé jusqu’à la récupération du bien ou jusqu’à ce que vous ayez fourni une preuve de son expédition, à la première de ces dates.\n\n"
		. "Terre Gravée\n" . tg_email_atelier() . "\n";
	wp_mail( $d['email'], 'Accusé de réception de votre rétractation (commande ' . $d['commande'] . ')', $accuse );
	tg_retour( 'recue', 'retractation' );
}
add_action( 'admin_post_nopriv_tg_retractation', 'tg_envoi_retractation' );
add_action( 'admin_post_tg_retractation', 'tg_envoi_retractation' );

/* -------------------------------------------------------------------------
 * Lettre d'information
 * ---------------------------------------------------------------------- */

/**
 * [tg_lettre]
 *
 * @return string
 */
function tg_code_lettre() {
	if ( class_exists( 'NewsletterSubscription' ) && method_exists( 'NewsletterSubscription', 'instance' ) ) {
		$abo    = NewsletterSubscription::instance();
		$action = method_exists( $abo, 'build_action_url' ) ? $abo->build_action_url( 's' ) : home_url( '/?na=s' );
		return '<form class="inscription" method="post" action="' . esc_url( $action ) . '">'
			. '<input type="hidden" name="nlang" value="">'
			. '<div class="inscription__ligne"><label class="visuellement-cache" for="email-lettre">Adresse e-mail</label>'
			. '<input id="email-lettre" name="ne" type="email" required placeholder="votre@adresse.fr" autocomplete="email">'
			. '<button class="btn" type="submit">S’inscrire</button></div>'
			. '<div class="case"><input id="accord-lettre" name="ny" type="checkbox" required><label for="accord-lettre">J’accepte de recevoir la lettre de Terre Gravée par e-mail, une par trimestre au plus. Je peux me désinscrire à chaque envoi.</label></div>'
			. '</form>';
	}
	return '<p class="inscription inscription--plus-tard">La lettre n’est pas encore ouverte. Pour être prévenu d’une nouvelle plaque, <a href="' . esc_url( home_url( '/contact/' ) ) . '">écrivez-nous</a>.</p>';
}
add_shortcode( 'tg_lettre', 'tg_code_lettre' );
