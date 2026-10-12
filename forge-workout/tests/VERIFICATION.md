# Forge verification — 12 October 2026

## Passed

| Layer | Verification |
|---|---|
| Engine | 42 Node tests passed; 0 failed. Covers all 63 nonempty block combinations, symmetric allowed pairs and exceptions, canonical solo locks, equal/unequal sets, mutually compatible triples, warm-up loadability, budget trimming, immediate countdown deadlines, undo, double progression, safe jump caps, RIR hold, deload thresholds, bodyweight snapshots, timed progression, substitute isolation, partial-set analysis, Epley/volume, and versioned backup validation. |
| Interface | 24 Playwright checks passed; 0 JavaScript page errors. Includes all screens, first-use weights, full workout COMMIT, live timer/log concurrency, autosave/reload, undo, unavailable/skip, exercise add/edit/archive, machine notes, custom pairs, invalid equipment rejection, bodyweight entry, accepted targets, charts, historical edits, JSON export/restore/rejection, and no horizontal overflow at 320px. |
| File assets / bridge | Local file-mode rendering and mocked Android bridge contract passed, including timer calls, screen-awake calls, storage save/load shapes, and native notification-skip callback. This is contract testing, not an Android runtime test. |
| Native build | Java compiled against Android SDK 35 and dexed for minimum API 26 with d8. Resource linking completed. |
| APK | zipalign and Android APK Signature Scheme v2/v3 verification passed. Universal Java/WebView assets; no ABI restriction. |
| Permissions | aapt2 manifest inspection confirmed no INTERNET or external-storage permission; cloud backup/device transfer exclusions present. |

## Not verified

The sandbox has 2 GB RAM and no KVM. Android emulator boot attempts did not succeed. Consequently, Android runtime installation, screen-off audibility/vibration, exact alarm fallback after OS process termination, Doze/reboot, Storage Access Framework on a real device, manufacturer battery optimizations, and Windows build-script execution are **not** claimed as tested.

The native implementation uses a user-started special-use foreground service, a duration-bounded partial wake lock, a monotonic in-process deadline, persisted wall-clock fallback, an exact alarm when authorized, a deduplicating receiver, MediaPlayer alarm audio, and VibrationEffect. Notifications can skip rest, and native cancellation/delivery markers prevent resuming a timer already skipped while its WebView was closed.

Follow the phone smoke checklist in README before relying on screen-off cues. Force stop, device reboot policies, Do Not Disturb, volume settings, and OEM battery restrictions are outside an app's absolute control.

## Reproduce

```bash
npm ci
npm run bundle
npm test
# Serve www in a separate terminal:
python3 -m http.server 3000 --bind 0.0.0.0 --directory www
# Then:
npx playwright install --with-deps chromium
npm run test:ui
# With JAVA_HOME and ANDROID_SDK_ROOT configured:
bash scripts/build-apk.sh
"$ANDROID_SDK_ROOT/build-tools/35.0.0/apksigner" verify --verbose release/Forge-Workout.apk
"$ANDROID_SDK_ROOT/build-tools/35.0.0/aapt2" dump badging release/Forge-Workout.apk
```
