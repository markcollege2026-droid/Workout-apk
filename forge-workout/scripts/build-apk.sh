#!/usr/bin/env bash
# SDK-only APK build: no Gradle, npm, cloud service, or app dependency downloads.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SDK="${ANDROID_SDK_ROOT:-${ANDROID_HOME:-}}"
if [[ -z "$SDK" ]]; then
  for candidate in "$HOME/Android/Sdk" "$HOME/Library/Android/sdk"; do
    [[ ! -d "$candidate" ]] || SDK="$candidate"
  done
fi
[[ -n "$SDK" ]] || { echo "Set ANDROID_SDK_ROOT to your Android SDK folder." >&2; exit 1; }
JAVAC="${JAVA_HOME:+$JAVA_HOME/bin/}javac"
JAR="${JAVA_HOME:+$JAVA_HOME/bin/}jar"
KEYTOOL="${JAVA_HOME:+$JAVA_HOME/bin/}keytool"
BT="$SDK/build-tools/35.0.0"
PLATFORM="$SDK/platforms/android-35/android.jar"
[[ -f "$PLATFORM" && -x "$BT/aapt2" ]] || { echo 'Install SDK packages: sdkmanager "platforms;android-35" "build-tools;35.0.0" "platform-tools"' >&2; exit 1; }
WORK="$ROOT/build/apk"
rm -rf "$WORK"
mkdir -p "$WORK"/{gen,classes,dex,assets/www} "$ROOT/release" "$ROOT/signing"
cp -R "$ROOT/www/." "$WORK/assets/www/"
"$BT/aapt2" compile --dir "$ROOT/android/app/src/main/res" -o "$WORK/resources.zip"
"$BT/aapt2" link -o "$WORK/linked.apk" -I "$PLATFORM" --manifest "$ROOT/android/app/src/main/AndroidManifest.xml" --java "$WORK/gen" -A "$WORK/assets" --min-sdk-version 26 --target-sdk-version 35 --version-code 1 --version-name 1.0 "$WORK/resources.zip"
find "$ROOT/android/app/src/main/java" "$WORK/gen" -name '*.java' -print0 | while IFS= read -r -d '' source; do printf '"%s"\n' "$source"; done > "$WORK/sources.txt"
"$JAVAC" -encoding UTF-8 -source 8 -target 8 -classpath "$PLATFORM" -d "$WORK/classes" "@$WORK/sources.txt"
mapfile_compat=()
while IFS= read -r -d '' file; do mapfile_compat+=("$file"); done < <(find "$WORK/classes" -name '*.class' -print0)
"$BT/d8" --lib "$PLATFORM" --min-api 26 --output "$WORK/dex" "${mapfile_compat[@]}"
cp "$WORK/linked.apk" "$WORK/unsigned.apk"
(cd "$WORK/dex" && "$JAR" uf "$WORK/unsigned.apk" classes.dex)
"$BT/zipalign" -f 4 "$WORK/unsigned.apk" "$WORK/aligned.apk"
KEY="$ROOT/signing/forge-debug.keystore"
if [[ ! -f "$KEY" ]]; then
  "$KEYTOOL" -genkeypair -noprompt -keystore "$KEY" -storepass android -keypass android -alias androiddebugkey -keyalg RSA -keysize 2048 -validity 10000 -dname 'CN=Android Debug,O=Forge Personal,C=US'
fi
APK="$ROOT/release/Forge-Workout.apk"
"$BT/apksigner" sign --ks "$KEY" --ks-pass pass:android --key-pass pass:android --out "$APK" "$WORK/aligned.apk"
"$BT/apksigner" verify --verbose "$APK"
printf '\nBuilt: %s\nInstall: %s/platform-tools/adb install -r "%s"\n' "$APK" "$SDK" "$APK"
