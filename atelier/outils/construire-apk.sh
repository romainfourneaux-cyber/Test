#!/usr/bin/env bash
# Construit l'application Android « Le domaine » (atelier/android) : copie jeu/ dans les assets, lit la version
# dans jeu/VERSION.txt, construit l'APK de release signé avec la clé du projet, le vérifie et le range dans
# atelier/android/sorties/le-domaine-<version>.apk. Une seule commande : bash atelier/outils/construire-apk.sh
# Prérequis (voir atelier/android/CHAINE.md) : JDK 21, SDK Android dans /opt/android-sdk (ou ANDROID_HOME).
set -euo pipefail

RACINE="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PROJET="$RACINE/atelier/android"
JEU="$RACINE/jeu"
export JAVA_HOME="${JAVA_HOME:-/usr/lib/jvm/java-21-openjdk-amd64}"
export ANDROID_HOME="${ANDROID_HOME:-/opt/android-sdk}"
OUTILS="$ANDROID_HOME/build-tools/34.0.0"

erreur() { echo "ERREUR : $*" >&2; exit 1; }
etape() { echo; echo "== $* =="; }

# ---------- 0. Tout ce qu'il faut est là ----------
[ -f "$JEU/VERSION.txt" ] || erreur "jeu/VERSION.txt manquant : c'est lui qui donne la version de l'application."
[ -f "$PROJET/cles/domaine.jks" ] || erreur "clé de signature manquante : atelier/android/cles/domaine.jks (voir atelier/android/README.md)."
[ -f "$PROJET/cles/mot-de-passe.txt" ] || erreur "mot de passe de la clé manquant : atelier/android/cles/mot-de-passe.txt."
[ -x "$JAVA_HOME/bin/java" ] || erreur "JDK introuvable dans $JAVA_HOME (poser JAVA_HOME)."
[ -d "$ANDROID_HOME/platforms/android-34" ] || erreur "SDK Android absent de $ANDROID_HOME : suivre atelier/android/CHAINE.md."
for o in apksigner aapt zipalign; do [ -x "$OUTILS/$o" ] || erreur "build-tools 34.0.0 incomplets : $o manque dans $OUTILS."; done
command -v unzip >/dev/null || erreur "unzip manquant."

VERSION="$(tr -d '[:space:]' < "$JEU/VERSION.txt")"
[[ "$VERSION" =~ ^([0-9]+)\.([0-9]+)\.([0-9]+)$ ]] || erreur "jeu/VERSION.txt illisible : « $VERSION » (attendu majeur.mineur.correctif, par exemple 0.9.3)."
# Le versionCode doit toujours grandir d'une version à l'autre (Android refuse une mise à jour qui recule) :
# mineur et correctif restent donc sous 100, sinon 0.9.100 (1000) passerait devant 0.10.0 (1000) et après lui.
[ $(( 10#${BASH_REMATCH[2]} )) -lt 100 ] && [ $(( 10#${BASH_REMATCH[3]} )) -lt 100 ] || erreur "jeu/VERSION.txt : mineur et correctif doivent rester sous 100 (« $VERSION »), sinon le versionCode cesse de croître."
CODE=$(( 10#${BASH_REMATCH[1]} * 10000 + 10#${BASH_REMATCH[2]} * 100 + 10#${BASH_REMATCH[3]} ))
etape "Version $VERSION (versionCode $CODE)"

# ---------- 1. Le jeu dans les assets ----------
# sw.js et manifest.webmanifest servent à la version web installable, pas à l'application : exclus.
etape "Copie de jeu/ dans les assets"
ASSETS="$PROJET/app/src/main/assets/jeu"
rm -rf "$PROJET/app/src/main/assets"
mkdir -p "$ASSETS"
cp -a "$JEU/." "$ASSETS/"
rm -f "$ASSETS/sw.js" "$ASSETS/manifest.webmanifest"
# Liste exacte attendue dans l'APK (chemins triés) : jeu/ moins ces deux fichiers de la racine.
LISTE_ATTENDUE="$(cd "$JEU" && find . -type f ! -path ./sw.js ! -path ./manifest.webmanifest | sed 's|^\./|assets/jeu/|' | LC_ALL=C sort)"
ATTENDUS="$(printf '%s\n' "$LISTE_ATTENDUE" | grep -c .)"
COPIES="$(find "$ASSETS" -type f | wc -l)"
[ "$ATTENDUS" -eq "$COPIES" ] || erreur "copie incomplète : $COPIES fichiers sur $ATTENDUS."
[ -f "$ASSETS/index.html" ] || erreur "index.html absent des assets."
echo "$COPIES fichiers copiés ($(du -sh "$ASSETS" | cut -f1))."

# ---------- 2. Réglages locaux : SDK et proxy ----------
echo "sdk.dir=$ANDROID_HOME" > "$PROJET/local.properties"
# Le bloc proxy de gradle.properties suit HTTPS_PROXY (le port change d'une session à l'autre) ; sans proxy, bloc vide.
PROPS="$PROJET/gradle.properties"
DEBUT="# --- proxy (écrit par construire-apk.sh) ---"
FIN="# --- fin proxy ---"
grep -qF "$DEBUT" "$PROPS" && grep -qF "$FIN" "$PROPS" || erreur "repères du bloc proxy absents de gradle.properties."
{
  sed -n "1,/^$(printf '%s' "$DEBUT" | sed 's/[][\.*^$/]/\\&/g')\$/p" "$PROPS"
  if [[ "${HTTPS_PROXY:-}" =~ ^https?://([^:/]+):([0-9]+)/?$ ]]; then
    echo "systemProp.https.proxyHost=${BASH_REMATCH[1]}"
    echo "systemProp.https.proxyPort=${BASH_REMATCH[2]}"
    echo "systemProp.http.nonProxyHosts=localhost|127.0.0.1"
    echo "systemProp.javax.net.ssl.trustStore=/etc/ssl/certs/java/cacerts"
    echo "systemProp.javax.net.ssl.trustStoreType=JKS"
  fi
  sed -n "/^$(printf '%s' "$FIN" | sed 's/[][\.*^$/]/\\&/g')\$/,\$p" "$PROPS"
} > "$PROPS.tmp" && mv "$PROPS.tmp" "$PROPS"

# ---------- 3. Construction ----------
etape "Construction (gradlew assembleRelease)"
cd "$PROJET"
./gradlew --no-daemon --console=plain assembleRelease -PjeuVersion="$VERSION" -PjeuCode="$CODE"
APK="$PROJET/app/build/outputs/apk/release/app-release.apk"
[ -f "$APK" ] || erreur "APK introuvable après la construction ($APK)."

# ---------- 4. Vérifications ----------
etape "Vérification de la signature"
"$OUTILS/apksigner" verify --verbose --print-certs "$APK" | grep -E "^Verifies|^Verified using|certificate DN|Number of signers"
"$OUTILS/apksigner" verify --print-certs "$APK" | grep -q "CN=Le domaine" || erreur "l'APK n'est pas signé avec la clé du projet."
"$OUTILS/zipalign" -c 4 "$APK" >/dev/null || erreur "APK mal aligné."

etape "Fiche de l'APK (aapt dump badging)"
BADGING="$("$OUTILS/aapt" dump badging "$APK")"
echo "$BADGING" | grep -E "^package:|^sdkVersion|^targetSdkVersion|^application-label:|^application: |^uses-permission|^launchable-activity" || true
echo "$BADGING" | grep -q "^package: name='fr.ledomaine.revision5e' versionCode='$CODE' versionName='$VERSION'" || erreur "paquet, versionCode ou versionName inattendus."
echo "$BADGING" | grep -q "^uses-permission" && erreur "l'APK déclare une permission : il ne doit en déclarer aucune (ni Internet ni autre)."
echo "$BADGING" | grep -q "^sdkVersion:'26'" || erreur "minSdk inattendu."
echo "$BADGING" | grep -q "^targetSdkVersion:'34'" || erreur "targetSdk inattendu."
echo "Aucune permission déclarée : bon."

etape "Contenu : le jeu entier dans assets/jeu/"
LISTE="$(unzip -Z1 "$APK")"
echo "$LISTE" | grep -qx "assets/jeu/index.html" || erreur "assets/jeu/index.html absent de l'APK."
NB_APK="$(echo "$LISTE" | grep -c "^assets/jeu/" || true)"
# Comparaison nom à nom : l'outil d'Android écarte sans rien dire certains fichiers (nom en « . », dossier en « _ »).
LISTE_APK="$(echo "$LISTE" | grep "^assets/jeu/" | LC_ALL=C sort || true)"
if [ "$LISTE_APK" != "$LISTE_ATTENDUE" ]; then
  diff <(printf '%s\n' "$LISTE_ATTENDUE") <(printf '%s\n' "$LISTE_APK") | head -20 >&2 || true
  erreur "l'APK contient $NB_APK fichiers du jeu, $ATTENDUS attendus, ou pas les mêmes (écarts ci-dessus : < manque, > en trop)."
fi
echo "$LISTE" | grep -qE "^assets/jeu/(sw\.js|manifest\.webmanifest)$" && erreur "sw.js ou manifest.webmanifest a fui dans les assets."
echo "$NB_APK fichiers du jeu dans l'APK (= jeu/ moins sw.js et manifest.webmanifest)."

# ---------- 5. Rangement ----------
etape "Sortie"
mkdir -p "$PROJET/sorties"
SORTIE="$PROJET/sorties/le-domaine-$VERSION.apk"
# Un APK déjà rangé avec un versionCode plus grand : la tablette refuserait celui-ci par-dessus. Prévenir, sans arrêter.
for ancien in "$PROJET"/sorties/*.apk; do
  [ -f "$ancien" ] && [ "$ancien" != "$SORTIE" ] || continue
  c="$("$OUTILS/aapt" dump badging "$ancien" 2>/dev/null | sed -n "s/^package: .*versionCode='\([0-9]*\)'.*/\1/p")"
  [ -n "$c" ] && [ "$c" -gt "$CODE" ] && echo "ATTENTION : $(basename "$ancien") porte le versionCode $c, plus grand que $CODE : Android refusera d'installer $VERSION par-dessus."
done
cp "$APK" "$SORTIE"
echo "$SORTIE"
echo "taille : $(stat -c %s "$SORTIE") octets ($(du -h "$SORTIE" | cut -f1))"
echo "sha256 : $(sha256sum "$SORTIE" | cut -d' ' -f1)"
