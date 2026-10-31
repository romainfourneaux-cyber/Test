package fr.ledomaine.revision5e;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.SystemClock;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.view.WindowManager;
import android.webkit.RenderProcessGoneDetail;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.Toast;

import androidx.webkit.ServiceWorkerClientCompat;
import androidx.webkit.ServiceWorkerControllerCompat;
import androidx.webkit.WebSettingsCompat;
import androidx.webkit.WebViewAssetLoader;
import androidx.webkit.WebViewCompat;
import androidx.webkit.WebViewFeature;

import java.io.ByteArrayInputStream;
import java.util.Collections;

/**
 * Le domaine : le jeu de révision dans une WebView, servi depuis les assets de l'APK.
 * Aucune permission, aucun réseau : ce que la page demande vient de assets/jeu/, tout le reste reçoit un 404.
 */
public class MainActivity extends Activity {
    /** Origine réservée par androidx.webkit aux fichiers de l'application : https, donc contexte sécurisé, jamais sur le réseau. */
    private static final String ORIGINE = "https://appassets.androidplatform.net";
    private static final String ACCUEIL = ORIGINE + "/assets/jeu/index.html";
    private static final int CHOIX_FICHIER = 1;
    private static final long DELAI_DOUBLE_RETOUR_MS = 2000;
    /**
     * Échap envoyé à la page : le jeu ferme sa fenêtre, quitte une halte ou propose de quitter la partie
     * (jeu/js/interface.js). Renvoie 1 si la page a pris la touche (preventDefault), 0 sinon.
     */
    private static final String JS_ECHAP = "(function(){"
            + "var ev=new KeyboardEvent('keydown',{key:'Escape',code:'Escape',keyCode:27,which:27,bubbles:true,cancelable:true});"
            + "(document.activeElement||document.body).dispatchEvent(ev);"
            + "return ev.defaultPrevented?1:0;})()";
    /**
     * Joué avant les scripts de la page. jeu/js/installation.js ne sert qu'à la version web : il enregistre sw.js et
     * ajoute aux Réglages un cartouche « Tablette et hors ligne » (installer depuis Chrome, mettre à jour). Sans
     * navigator.serviceWorker, il se tait, comme en file:// sur le PC : ni essai refusé, ni consigne qui ne vaut pas ici.
     */
    private static final String JS_SANS_SERVICE_WORKER =
            "try{Object.defineProperty(navigator,'serviceWorker',{value:undefined,configurable:true});}catch(e){}";
    /** Deux plantages de la page à moins de dix secondes d'écart : on ferme au lieu de relancer en boucle. */
    private static final long DELAI_PLANTAGES_MS = 10000;
    private static long dernierPlantage;

    private WebView vue;
    private ValueCallback<Uri[]> retourFichier;
    /** Moment du dernier appui sur Retour que la page n'a pas traité (0 : aucun en attente). */
    private long dernierRetourLibre;

    @Override
    @SuppressWarnings("deprecation") // SOFT_INPUT_ADJUST_RESIZE : encore le bon réglage tant que la fenêtre gère les barres système
    protected void onCreate(Bundle etat) {
        super.onCreate(etat);
        Window f = getWindow();
        f.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        // Clavier : la fenêtre se réduit (Android 11 et plus) ou se décale (avant) pour laisser voir le champ.
        f.setSoftInputMode(Build.VERSION.SDK_INT >= 30
                ? WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE
                : WindowManager.LayoutParams.SOFT_INPUT_ADJUST_PAN);

        FrameLayout cadre = new FrameLayout(this);
        vue = new WebView(this);
        vue.setBackgroundColor(0xFF2E2419);
        cadre.addView(vue, new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        setContentView(cadre);

        regler(vue.getSettings());
        brancherChargeur();
        brancherChoixFichier();
        bloquerServiceWorker();
        masquerServiceWorker();
        // Le pont existe avant le premier script de la page : installation.js peut tester typeof window.AndroidDomaine.
        vue.addJavascriptInterface(new PontDomaine(this), "AndroidDomaine");
        vue.loadUrl(ACCUEIL);
    }

    @SuppressLint("SetJavaScriptEnabled")
    @SuppressWarnings("deprecation") // setForceDark : seul réglage disponible sous Android 10 à 12
    private void regler(WebSettings r) {
        r.setJavaScriptEnabled(true);
        r.setDomStorageEnabled(true);                 // localStorage : la sauvegarde du jeu
        r.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        r.setAllowFileAccess(false);                  // pas de file:// : tout vient des assets par le chargeur
        r.setAllowContentAccess(true);                // l'import d'une sauvegarde lit un fichier choisi (content://)
        r.setSupportZoom(false);
        r.setBuiltInZoomControls(false);
        r.setDisplayZoomControls(false);
        r.setMediaPlaybackRequiresUserGesture(false); // le jeu lance ses sons après un geste de toute façon
        r.setUseWideViewPort(true);
        r.setLoadWithOverviewMode(true);
        r.setTextZoom(100);                           // la taille de police du système ne déforme pas le jeu
        r.setGeolocationEnabled(false);
        // Pas d'assombrissement automatique : le jeu a ses propres couleurs.
        if (WebViewFeature.isFeatureSupported(WebViewFeature.ALGORITHMIC_DARKENING)) {
            WebSettingsCompat.setAlgorithmicDarkeningAllowed(r, false);
        } else if (WebViewFeature.isFeatureSupported(WebViewFeature.FORCE_DARK)) {
            WebSettingsCompat.setForceDark(r, WebSettingsCompat.FORCE_DARK_OFF);
        }
    }

    /** Réponse vide 404 : rien ne part jamais vers le réseau, même sans permission Internet. */
    private static WebResourceResponse introuvable() {
        return new WebResourceResponse("text/plain", "utf-8", 404, "Introuvable", null, new ByteArrayInputStream(new byte[0]));
    }

    private void brancherChargeur() {
        final WebViewAssetLoader chargeur = new WebViewAssetLoader.Builder()
                .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this))
                .build();
        vue.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView v, WebResourceRequest demande) {
                WebResourceResponse reponse = chargeur.shouldInterceptRequest(demande.getUrl());
                return reponse != null ? reponse : introuvable();
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest demande) {
                // Tout reste dans l'application : une adresse extérieure n'ouvre rien, pas même le navigateur.
                Uri u = demande.getUrl();
                if (u != null && ORIGINE.equals(u.getScheme() + "://" + u.getHost())) return false;
                Toast.makeText(MainActivity.this, R.string.lien_externe, Toast.LENGTH_SHORT).show();
                return true;
            }

            /**
             * La page a planté, ou Android a repris la mémoire de son processus (tablette de 4 Go). Sans cette réponse,
             * toute l'application se fermerait. On rebâtit l'écran ; la partie revient avec la page (localStorage).
             */
            @Override
            public boolean onRenderProcessGone(WebView v, RenderProcessGoneDetail detail) {
                long maintenant = SystemClock.elapsedRealtime();
                boolean enBoucle = dernierPlantage != 0 && maintenant - dernierPlantage < DELAI_PLANTAGES_MS;
                dernierPlantage = maintenant;
                if (enBoucle) finish(); else recreate();
                return true;
            }
        });
    }

    /** La version web du jeu enregistre un service worker (sw.js) ; dans l'application il n'a pas lieu d'être : refus net. */
    private void bloquerServiceWorker() {
        if (!WebViewFeature.isFeatureSupported(WebViewFeature.SERVICE_WORKER_BASIC_USAGE)
                || !WebViewFeature.isFeatureSupported(WebViewFeature.SERVICE_WORKER_SHOULD_INTERCEPT_REQUEST)) return;
        ServiceWorkerControllerCompat.getInstance().setServiceWorkerClient(new ServiceWorkerClientCompat() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebResourceRequest demande) {
                return introuvable();
            }
        });
    }

    /** Le script JS_SANS_SERVICE_WORKER, pour notre origine seulement. WebView trop ancienne : sw.js est refusé quand même. */
    private void masquerServiceWorker() {
        if (!WebViewFeature.isFeatureSupported(WebViewFeature.DOCUMENT_START_SCRIPT)) return;
        WebViewCompat.addDocumentStartJavaScript(vue, JS_SANS_SERVICE_WORKER, Collections.singleton(ORIGINE));
    }

    /** Import d'une sauvegarde : le champ fichier de la page ouvre le sélecteur de documents d'Android. */
    private void brancherChoixFichier() {
        vue.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView v, ValueCallback<Uri[]> retour, FileChooserParams p) {
                if (retourFichier != null) retourFichier.onReceiveValue(null);
                retourFichier = retour;
                Intent i = new Intent(Intent.ACTION_OPEN_DOCUMENT);
                i.addCategory(Intent.CATEGORY_OPENABLE);
                // Tout type de fichier : une sauvegarde reçue par mail ou copiée par câble n'est pas toujours typée JSON ;
                // le jeu vérifie lui-même le contenu (jeu/js/sauvegarde.js).
                i.setType("*/*");
                i.putExtra(Intent.EXTRA_MIME_TYPES, new String[] { "application/json", "*/*" });
                try {
                    startActivityForResult(i, CHOIX_FICHIER);
                } catch (Exception e) {
                    retourFichier = null;
                    return false;
                }
                return true;
            }
        });
    }

    @Override
    protected void onActivityResult(int code, int resultat, Intent donnees) {
        if (code != CHOIX_FICHIER) {
            super.onActivityResult(code, resultat, donnees);
            return;
        }
        if (retourFichier == null) return;
        retourFichier.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(resultat, donnees));
        retourFichier = null;
    }

    /**
     * Retour : d'abord Échap pour la page. Si elle n'a rien fermé, un second appui dans les deux secondes quitte.
     * Deux fenêtres fermées coup sur coup ne quittent donc jamais le jeu.
     */
    @Override
    @SuppressWarnings("deprecation") // enableOnBackInvokedCallback n'est pas activé : onBackPressed reste appelé sous Android 13 et 14
    public void onBackPressed() {
        vue.evaluateJavascript(JS_ECHAP, valeur -> {
            if ("1".equals(valeur)) {
                dernierRetourLibre = 0;
                return;
            }
            long maintenant = SystemClock.elapsedRealtime();
            if (dernierRetourLibre != 0 && maintenant - dernierRetourLibre < DELAI_DOUBLE_RETOUR_MS) {
                finish();
                return;
            }
            dernierRetourLibre = maintenant;
            Toast.makeText(MainActivity.this, R.string.quitter, Toast.LENGTH_SHORT).show();
        });
    }

    /** Plein écran « immersif collant » : les barres système reviennent d'un glissement du bord, puis se cachent. */
    @SuppressWarnings("deprecation") // setSystemUiVisibility : voie des versions avant Android 11
    private void pleinEcran() {
        if (Build.VERSION.SDK_INT >= 30) {
            WindowInsetsController c = getWindow().getInsetsController();
            if (c == null) return;
            c.setSystemBarsBehavior(WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
            c.hide(WindowInsets.Type.systemBars());
        } else {
            getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                    | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                    | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                    | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                    | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                    | View.SYSTEM_UI_FLAG_FULLSCREEN);
        }
    }

    @Override
    public void onWindowFocusChanged(boolean focus) {
        super.onWindowFocusChanged(focus);
        if (focus) pleinEcran();
    }

    @Override
    protected void onResume() {
        super.onResume();
        vue.resumeTimers();
        vue.onResume();
        pleinEcran();
    }

    @Override
    protected void onPause() {
        // En arrière-plan : plus de minuteries ni de sons ; la partie est déjà enregistrée dans localStorage par le jeu.
        vue.onPause();
        vue.pauseTimers();
        super.onPause();
    }

    @Override
    protected void onDestroy() {
        if (retourFichier != null) {
            retourFichier.onReceiveValue(null);
            retourFichier = null;
        }
        ViewGroup parent = (ViewGroup) vue.getParent();
        if (parent != null) parent.removeView(vue);
        vue.destroy();
        super.onDestroy();
    }
}
