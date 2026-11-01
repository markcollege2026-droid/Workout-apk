# APK signing

The matching personal debug key is stored in the repository Actions secret `FORGE_WORKOUT_KEYSTORE_B64`. The workflow restores it only on the runner. No private signing key is committed here. Local SDK-only builds without that key generate a different debug identity; export a JSON backup before changing signing identity.

The checked-in manifest no longer sets `android:debuggable`, so the personal-release APK built by `scripts/build-apk.sh` (or the Actions workflow) is **not debuggable** and WebView debugging is disabled.

For development, build a separate debuggable APK with `bash scripts/build-apk.sh --debug` (PowerShell: `./scripts/build-apk.ps1 -Debug`). That flag injects `android:debuggable="true"` into a build-only copy of the manifest; the source manifest is never modified, and the release build re-checks that the shipped APK is not debuggable.
