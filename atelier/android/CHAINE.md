# Chaîne de construction Android dans le conteneur

Relevé du 31/10/2026. Tout ce qui suit a été exécuté et vérifié dans le conteneur de travail (Linux, 22 Go libres au départ). Rien n'est installé sur le PC de Romain : l'APK est construit ici, puis copié sur la tablette.

## En bref

- JDK 21 : /usr/lib/jvm/java-21-openjdk-amd64 (OpenJDK 21.0.12.1, déjà présent).
- Gradle 8.14.3 : /opt/gradle/bin/gradle (déjà présent) ; le wrapper du projet télécharge la même version.
- Android SDK : /opt/android-sdk, installé par cette chaîne.
  - cmdline-tools 12.0 (zip commandlinetools-linux-11076708_latest.zip, 153 607 504 octets, SHA-1 d313adb7aedccf6cf0cfca51ec180f0059f5f8f8 : taille et somme identiques à celles du manifeste de Google, repository2-3.xml).
  - platform-tools 37.0.1 (adb 1.0.41).
  - platforms;android-34 révision 3 (API 34, Android 14).
  - build-tools;34.0.0 (aapt, aapt2, d8, apksigner, zipalign).
- Android Gradle Plugin (AGP) 8.5.2, en Java seul, compileSdk 34, minSdk 24, targetSdk 34.
- Le projet d'essai (une activité vide + androidx.webkit 1.11.0) compile : premier build complet en 60 s, APK de debug de 439 475 octets, signature v2 vérifiée par apksigner.

## Variables d'environnement

Celles du conteneur, déjà posées, à ne pas toucher :

- HTTPS_PROXY=http://127.0.0.1:37191 : curl et les outils non Java passent par là.
- JAVA_TOOL_OPTIONS : porte le proxy (-Dhttps.proxyHost=127.0.0.1 -Dhttps.proxyPort=37191) et le magasin de confiance (-Djavax.net.ssl.trustStore=/etc/ssl/certs/java/cacerts, type JKS) pour toute JVM. sdkmanager, Gradle, son démon et le téléchargement du wrapper en héritent sans rien ajouter.

Celles à poser pour chaque commande de la chaîne :

```
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64
export ANDROID_HOME=/opt/android-sdk
```

ANDROID_HOME seul suffit à Gradle. Un fichier local.properties avec `sdk.dir=/opt/android-sdk` à la racine du projet suffit aussi, sans ANDROID_HOME. Sans l'un ni l'autre, Gradle s'arrête sur « SDK location not found » (vérifié). Le script de construction posera les deux.

## Installation du SDK, pas à pas

Chaque étape a été jouée telle quelle.

1. Télécharger les command-line tools (146 Mo, 6 s à travers le proxy) :

```
mkdir -p /opt/android-sdk/telechargements
cd /opt/android-sdk/telechargements
curl -fsSL --retry 3 -o commandlinetools-linux-11076708_latest.zip \
  "https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip"
sha1sum commandlinetools-linux-11076708_latest.zip
# attendu : d313adb7aedccf6cf0cfca51ec180f0059f5f8f8 (153 607 504 octets), valeurs lues dans
# https://dl.google.com/android/repository/repository2-3.xml, bloc <archive> de cmdline-tools;12.0 pour linux
```

2. Les placer sous cmdline-tools/latest (le zip contient un dossier cmdline-tools ; son contenu va dans latest) :

```
unzip -q commandlinetools-linux-11076708_latest.zip -d extrait
mkdir -p /opt/android-sdk/cmdline-tools
mv extrait/cmdline-tools /opt/android-sdk/cmdline-tools/latest
rmdir extrait
```

3. Accepter les licences, puis installer les trois paquets (15 s en tout) :

```
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64 ANDROID_HOME=/opt/android-sdk
yes | /opt/android-sdk/cmdline-tools/latest/bin/sdkmanager --sdk_root=/opt/android-sdk --licenses
/opt/android-sdk/cmdline-tools/latest/bin/sdkmanager --sdk_root=/opt/android-sdk \
  "platform-tools" "platforms;android-34" "build-tools;34.0.0"
/opt/android-sdk/cmdline-tools/latest/bin/sdkmanager --sdk_root=/opt/android-sdk --list_installed
```

Le zip peut être supprimé ensuite (/opt/android-sdk/telechargements, 147 Mo) ; il est gardé pour l'instant.

## Projet Gradle : les lignes qui comptent

settings.gradle, l'ordre des dépôts est important :

```
pluginManagement {
    repositories {
        google()
        maven { url = uri("https://maven-central.storage-download.googleapis.com/maven2/") }
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        maven { url = uri("https://maven-central.storage-download.googleapis.com/maven2/") }
        mavenCentral()
    }
}
```

build.gradle à la racine :

```
plugins {
    id "com.android.application" version "8.5.2" apply false
}
```

gradle.properties :

```
org.gradle.jvmargs=-Xmx1536m
android.useAndroidX=true
```

local.properties (facultatif si ANDROID_HOME est posé) :

```
sdk.dir=/opt/android-sdk
```

Wrapper : `gradle wrapper --gradle-version 8.14.3 --distribution-type bin` crée gradlew, gradlew.bat et gradle/wrapper/. Au premier `./gradlew`, la distribution (146 Mo) se télécharge en 8 s depuis services.gradle.org, qui redirige vers GitHub ; le proxy laisse passer. Elle se range dans ~/.gradle/wrapper/dists/gradle-8.14.3-bin.

Commande de build : `./gradlew assembleDebug` (ou assembleRelease). L'APK sort dans app/build/outputs/apk/<variante>/.

## Proxy : ce qui a marché, ce qui a coincé

- Hôtes qui répondent à travers le proxy : dl.google.com (cmdline-tools, AGP), maven.google.com (AndroidX), repo.maven.apache.org et repo1.maven.org (Maven Central), maven-central.storage-download.googleapis.com (miroir Google de Maven Central), services.gradle.org, downloads.gradle.org et release-assets.githubusercontent.com (distribution Gradle).
- Ce qui a coincé : Maven Central répond par moments « 429 Too Many Requests » à l'adresse de sortie du proxy (deux builds de suite ont échoué sur kotlin-stdlib 1.9.20). Gradle ne réessaie pas sur un 429, même avec systemProp.org.gradle.internal.repository.max.retries relevé : ces réglages n'ont rien changé et ne sont pas nécessaires. Le remède est le miroir Google déclaré avant mavenCentral() dans settings.gradle : il n'a pas cette limite et sert les mêmes fichiers. Gradle ne passe au dépôt suivant que sur un 404, donc le miroir doit venir avant Maven Central, pas après.
- Réglages JVM : rien à ajouter, JAVA_TOOL_OPTIONS suffit (build complet réussi ainsi).
- Repli vérifié, au cas où JAVA_TOOL_OPTIONS manquerait un jour : avec la variable retirée et un cache Gradle vierge, ces lignes dans gradle.properties ont suffi à retélécharger les 346 Mo de dépendances et à produire le même APK (75 s) :

```
systemProp.https.proxyHost=127.0.0.1
systemProp.https.proxyPort=37191
systemProp.http.nonProxyHosts=localhost|127.0.0.1
systemProp.javax.net.ssl.trustStore=/etc/ssl/certs/java/cacerts
systemProp.javax.net.ssl.trustStoreType=JKS
```

Le port (37191) peut changer d'une session à l'autre : le lire dans HTTPS_PROXY avant de le recopier. Le magasin /etc/ssl/certs/java/cacerts est aussi celui que le JDK 21 utilise par défaut (lien symbolique), il contient déjà le certificat du proxy. Jamais de désactivation de TLS.

## Compatibilité

- AGP 8.5.2 demande Gradle 8.7 au moins et un JDK 17 au moins. Il tourne sous Gradle 8.14.3 et JDK 21 : seulement des avertissements de dépréciation (propriétés booléennes « is- » d'AGP, et la syntaxe Groovy `namespace "x"` au lieu de `namespace = "x"`). Écrire les affectations avec `=` dans le vrai projet évite la seconde famille.
- sourceCompatibility / targetCompatibility : JavaVersion.VERSION_17.
- minSdk 24 (Android 7.0) : toute tablette récente est couverte, dont celle visée.

## Mesures

- Téléchargements : cmdline-tools 146 Mo (6 s), paquets SDK environ 310 Mo une fois installés (15 s), dépendances Gradle environ 350 Mo au premier build, distribution du wrapper 146 Mo (8 s).
- Durées : premier assembleDebug complet 60 s (téléchargements compris) ; build suivant, tout en cache, 16 à 24 s avec --no-daemon ; 36 s et 13 s pour les deux échecs 429 avant le miroir.
- Disque : /opt/android-sdk 458 Mo (604 Mo avec le zip gardé) ; ~/.gradle 494 Mo (caches 348 Mo + distribution 146 Mo) ; ~/.android 3,6 Mo (debug.keystore créé automatiquement). Il reste 20 Go libres.

## Projet d'essai

Hors dépôt, dans le scratchpad de la session, à jeter : /tmp/claude-0/-home-user-Test/fc3329d7-53e7-59eb-8f72-fa95fe7d4108/scratchpad/apk-essai/ (application essai.apk, une activité vide, androidx.webkit 1.11.0 comme dépendance témoin). APK produit : app/build/outputs/apk/debug/app-debug.apk, 439 475 octets, `aapt dump badging` donne package essai.apk, sdkVersion 24, targetSdkVersion 34 ; `apksigner verify --verbose` : v2 vérifié. Le même projet a été construit de trois façons : local.properties seul, ANDROID_HOME seul, puis par le wrapper.

## Outils pour la suite (vrai projet)

- Clé de signature : `/usr/lib/jvm/java-21-openjdk-amd64/bin/keytool -genkeypair -keystore domaine.jks -alias domaine -keyalg RSA -keysize 2048 -validity 10950`.
- Vérification de l'APK : /opt/android-sdk/build-tools/34.0.0/apksigner verify --verbose, /opt/android-sdk/build-tools/34.0.0/aapt dump badging, zipalign -c -v 4.
- Pas d'émulateur ni d'image système installés : le test sur appareil se fait sur la tablette.
