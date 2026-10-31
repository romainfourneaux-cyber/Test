package fr.ledomaine.revision5e;

import android.annotation.TargetApi;
import android.app.Activity;
import android.content.ContentResolver;
import android.content.ContentValues;
import android.database.Cursor;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.MediaStore;
import android.webkit.JavascriptInterface;
import android.widget.Toast;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

/**
 * Pont entre la page et Android, exposé sous window.AndroidDomaine avant le premier script de la page.
 * Une seule méthode : écrire la sauvegarde exportée, car une WebView ne sait pas télécharger un lien blob:.
 */
public final class PontDomaine {
    /** Taille maximale d'une sauvegarde exportée (une partie pèse quelques centaines de kilo-octets). */
    private static final int TAILLE_MAX = 20 * 1024 * 1024;
    private static final int LONGUEUR_NOM_MAX = 120;

    private final Activity activite;

    PontDomaine(Activity activite) {
        this.activite = activite;
    }

    /**
     * Nom de fichier sûr : lettres, chiffres, point, tiret et souligné seulement ; ni dossier, ni nom caché (point en
     * tête), ni nom vide ; toujours terminé par .json. Le jeu donne « sauvegarde-jeu5e-<date>.json », rien d'autre.
     */
    static String nomSur(String nom) {
        String n = nom.replaceAll("[^A-Za-z0-9._-]", "_").replaceFirst("^[._-]+", "");
        if (n.length() > LONGUEUR_NOM_MAX) n = n.substring(0, LONGUEUR_NOM_MAX);
        if (n.isEmpty() || ".json".equals(n)) n = "sauvegarde";
        if (!n.endsWith(".json")) n += ".json";
        return n;
    }

    /**
     * Écrit la sauvegarde dans le dossier Téléchargements de la tablette (MediaStore, Android 10 et plus, sans
     * permission) ou, avant Android 10, dans le dossier de fichiers de l'application. Appelée depuis le fil du
     * pont JavaScript, donc hors du fil d'interface : l'écriture ne bloque pas l'écran, et le message passe par
     * runOnUiThread. Renvoie vrai si le fichier est écrit.
     */
    @JavascriptInterface
    public boolean exporter(String nom, String contenu) {
        if (nom == null || contenu == null || contenu.isEmpty() || contenu.length() > TAILLE_MAX) return false;
        final String nomSain = nomSur(nom);
        String nomEcrit = nomSain;
        int message;
        boolean ok;
        try {
            if (Build.VERSION.SDK_INT >= 29) {
                nomEcrit = ecrireTelechargements(nomSain, contenu);
                message = R.string.export_ok;
            } else {
                ecrireDossierApplication(nomSain, contenu);
                message = R.string.export_ok_ancien;
            }
            ok = true;
        } catch (Exception e) {
            message = R.string.export_ko;
            ok = false;
        }
        final int texte = message;
        final boolean reussi = ok;
        final String nomAffiche = nomEcrit;
        activite.runOnUiThread(() -> Toast.makeText(activite,
                reussi ? activite.getString(texte, nomAffiche) : activite.getString(texte), Toast.LENGTH_LONG).show());
        return ok;
    }

    /** Renvoie le nom vraiment donné au fichier : un second export le même jour devient « … (1).json ». */
    @TargetApi(29)
    private String ecrireTelechargements(String nom, String contenu) throws Exception {
        ContentResolver r = activite.getContentResolver();
        ContentValues v = new ContentValues();
        v.put(MediaStore.Downloads.DISPLAY_NAME, nom);
        v.put(MediaStore.Downloads.MIME_TYPE, "application/json");
        v.put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS);
        v.put(MediaStore.Downloads.IS_PENDING, 1);
        Uri u = r.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, v);
        if (u == null) throw new IllegalStateException("insertion refusée");
        try (OutputStream s = r.openOutputStream(u)) {
            if (s == null) throw new IllegalStateException("flux indisponible");
            s.write(contenu.getBytes(StandardCharsets.UTF_8));
        } catch (Exception e) {
            r.delete(u, null, null);
            throw e;
        }
        v.clear();
        v.put(MediaStore.Downloads.IS_PENDING, 0);
        r.update(u, v, null, null);
        try (Cursor c = r.query(u, new String[] { MediaStore.Downloads.DISPLAY_NAME }, null, null, null)) {
            if (c != null && c.moveToFirst() && c.getString(0) != null) return c.getString(0);
        } catch (Exception e) {
            // le fichier est écrit ; le message donnera le nom demandé
        }
        return nom;
    }

    private void ecrireDossierApplication(String nom, String contenu) throws Exception {
        File dossier = activite.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS);
        if (dossier == null) dossier = new File(activite.getFilesDir(), "Download");
        if (!dossier.exists() && !dossier.mkdirs()) throw new IllegalStateException("dossier impossible");
        try (FileOutputStream s = new FileOutputStream(new File(dossier, nom))) {
            s.write(contenu.getBytes(StandardCharsets.UTF_8));
        }
    }
}
