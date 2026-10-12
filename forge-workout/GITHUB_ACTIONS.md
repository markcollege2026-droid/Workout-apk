# Build Forge on GitHub Actions

The repository-root workflow `.github/workflows/forge-build-apk.yml` compiles this app on pushes. It installs Java 17, Node 22, Android SDK 35/build tools 35.0.0, runs 42 engine tests, builds/signs a fresh APK, verifies it, and uploads the **Forge-Workout-APK** artifact.

The personal signing key is held only in the repository Actions secret **FORGE_WORKOUT_KEYSTORE_B64**. It is not committed in this public repository. The secret is the base64 encoding of the original debug keystore; it preserves update compatibility with the previously delivered APK. This is personal-use debug signing, not a production/store-release setup.

Download the artifact from the successful Actions run, extract its ZIP, and sideload **Forge-Workout.apk** on Android 8.0+. Do not uninstall just to update. Your workout data stays on the phone; the APK has no INTERNET permission.

The pipeline does not run physical Android or browser UI tests. Follow the phone screen-off alert check in README before gym use.
