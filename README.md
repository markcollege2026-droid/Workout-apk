# Workout-apk — Forge

**Forge** is a private, offline progressive-overload workout app for Android 8.0+ (API 26), built as a dependency-free vanilla-JS web core inside a small native Java WebView shell with transactional SQLite storage. No accounts, no cloud, no ads, no analytics — the APK requests no INTERNET permission.

| | |
|---|---|
| Application source | [`forge-workout/`](forge-workout/) |
| Full user + build documentation | [`forge-workout/README.md`](forge-workout/README.md) |
| Original build specification | [`forge-workout/docs/workout-specification.md`](forge-workout/docs/workout-specification.md) |
| CI pipeline (tests + signed APK) | [`.github/workflows/forge-build-apk.yml`](.github/workflows/forge-build-apk.yml) |
| Verification reports | [`forge-workout/tests/VERIFICATION.md`](forge-workout/tests/VERIFICATION.md) |

## Get the APK

Download **Forge-Workout-APK** from the latest successful [Actions run](https://github.com/markcollege2026-droid/Workout-apk/actions) and sideload `Forge-Workout.apk` (personal-use debug-signed build), or build locally with the Android SDK:

```bash
cd forge-workout
bash scripts/build-apk.sh   # needs ANDROID_SDK_ROOT + JAVA_HOME; output: release/Forge-Workout.apk
```

## Try the web preview

```bash
cd forge-workout
python3 -m http.server 3000 --bind 0.0.0.0 --directory www
# open http://localhost:3000 — same interface, browser-local storage
```

## Develop & test

```bash
cd forge-workout
npm ci
npm run bundle   # REQUIRED after editing readable www/*.js — CI fails on bundle drift
npm test         # 45 engine unit tests (node:test)
npm run test:ui  # 27 headless-browser checks (Playwright; needs the preview server
                 # and a one-time `npx playwright install --with-deps chromium`)
```

GitHub Actions runs both suites, guards bundle drift, and builds/verifies the signed APK on every push.

## Repository layout

- `forge-workout/www/` — readable app sources + the generated offline bundle (`forge.js`)
- `forge-workout/android/` — native WebView host, SQLite bridge, foreground rest timer, alarms, reminders
- `forge-workout/scripts/` — SDK-only APK build (no Gradle) and the esbuild bundler
- `forge-workout/tests/` — engine tests, UI smoke suite, verification reports
- `.github/workflows/` — APK build + test pipeline

> **History note:** the app was developed on branch `forge/apk-build-20261012`; this tree brings it to `main` together with the 25 October 2026 functional-QA fixes (see the addendum in `forge-workout/tests/VERIFICATION.md`).
