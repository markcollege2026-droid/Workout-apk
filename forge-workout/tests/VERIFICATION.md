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

---

# Update — 25 October 2026 (functional QA pass)

An independent functional QA review exercised the full app: engine tests, static checks (syntax, bundle integrity, build-script syntax), and a 51-check end-to-end pass over the live browser preview covering planning, first-use starting loads, session logging (reps/weight/RIR/notes/failed sets), timer behaviour (transition vs rest, ±15 s, skip, expiry), reload persistence mid-session, substitutes and skips, history viewing/editing, charts and statistics, JSON export/restore/rejection, corrupt-storage recovery, discard and finish-early flows — with zero uncaught page or console errors.

Three defects were found, fixed, and covered by new regression tests:

| Defect | Fix | Regression coverage |
|---|---|---|
| Accepted "Raise? / To?" suggestions silently flipped back to un-reviewed after any history edit (also after saving equipment or progression preferences) | `recomputeSuggestions()` (www/app.js) now preserves `accepted` when the recomputed proposal is identical (same session, kind, weight, reps); a genuinely changed proposal correctly returns for review; stale suggestions for exercises without a complete session are removed | `tests/ui-smoke.js` — "History editing preserves explicitly accepted suggestions" |
| Undo after "Unavailable today" / "Skip today" re-queued a task of the skipped entry (silently inconsistent state) | `undoSet()` (www/engine.js) no longer re-queues tasks whose entry is skipped; the record is still undone | 2 new `tests/engine.test.js` cases + end-to-end flow |
| History editing accepted future session dates (bodyweight entry already rejected them), corrupting calendar/streak/weekly-volume semantics | `save-history` (www/app.js) rejects `startedAt > now`; the datetime input (www/modals.js) carries a `max` attribute | `tests/ui-smoke.js` — "History editing rejects future session dates without saving" |

Also in this pass:

- Engine suite grew 42 → **45** tests (adds undo-after-substitute, undo-after-skip, and warm-up-only session commit semantics).
- UI smoke grew 24 → **27** checks (adds future-date rejection, accepted-suggestion preservation, and corrupt-storage recovery: warn without silent overwrite, recover on first change).
- CI (`.github/workflows/forge-build-apk.yml`) now runs the headless browser UI smoke suite on every push and fails when the checked-in `www/forge.js` bundle drifted from the readable sources.
- `MainActivity.WorkspaceDatabase.onUpgrade` now preserves stored data instead of throwing (future schema migrations attach there).
- Removed the dead `ForgeStore.sync()` bridge helper; `tests/ui-results.json` is now git-ignored.

Local results, 25 October 2026: **45/45 engine tests**, **51/51 end-to-end preview checks**, 0 page/console errors, checked-in bundle verified byte-identical to the readable sources. The Android runtime (SQLite bridge, screen-off alerts, alarms, reminders) remains unverifiable without a device/emulator; the phone checklist in README still applies.
