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

---

# Update — 1 November 2026 (target overrides, work timer, recovery, release hardening)

## Root cause of the reverted manual target

`engine.target()` applied `roundWeight()` to every stored target on every read and then clamped
reps to the exercise's `min`/`max`. `app.js` also rounded at the moment of saving
(`save-target`, `save-starts`), `save-equipment` re-rounded every stored weight, and
`save-exercise` re-clamped every stored rep target. So an intentional target such as
**27.5 kg × 11** was rewritten to the nearest dumbbell (28) and clamped to 10 the first time it
was read; there was nowhere to record that the value was explicit.

## What changed

| Area | Change |
|---|---|
| Target storage | `targets[id]` now carries `manual:true` (plus `overriddenAt`). Older backups without the flag keep working and are treated as automatic. |
| Engine | `target()` returns a manual override exactly (only absolute limits 0–1000 kg / 1–3600 reps are applied) and reports `manual`/`loadable`. `setTarget()` validates, stores, clears the superseded proposal, and reports `outsideRange`. `accept()` stores `manual:false`. Plan/session entries and queue tasks carry`manualTarget`, and a manual target below the range is judged against the chosen target instead of the exercise minimum, so it is not logged as a failed set or counted as a missed minimum. |
| App | `save-target`/`save-starts` save exactly what was typed and report the real saved values; `save-equipment` and `save-exercise` skip manual targets; a target edited mid-workout also updates the remaining queue; Progress/Library/Plan show a `MANUAL` badge. |
| Work timer | New `startWork`/`finishWork`/`cancelWork` engine state (`session.workTimer`) separate from `session.timer`. Timed sets cannot be logged by `completeSet` without the countdown. The UI replaces **Set done** with **Start N-second timer**, shows a live countdown, **Finish early** (logs the real seconds, marked early) and **Cancel timer** (records nothing); the existing rest timer starts at the end of the hold. |
| Native timer | `RestTimerService` now handles two channels (`rest`, `work`) with separate persisted keys, alarm request codes and notification actions; `TimerSignals.finish` takes the channel, deduplicates per channel and calls back `onNativeWorkFinished`/`onNativeWorkCancelled`. No second foreground service was added. |
| Screen awake | `A.screenAwake()` now calls `Native.keepScreenAwake(desired)` in the APK (previously it returned immediately), and the flag follows session start, commit, discard, setting changes and activity resume. The browser preview keeps its Wake Lock API path. |
| Recovery | SQLite row 2 is now reachable: `Native.previousState()`/`Native.restorePrevious(json)`, an engine-validated Settings dialog with timestamp and counts, a transactional restore that first copies the current workspace into row 2. The browser preview keeps an equivalent localStorage copy so both backends behave the same. |
| Release build | The source manifest no longer sets `android:debuggable`. `scripts/build-apk.sh --debug` (and `-Debug` in PowerShell) injects it into a build-only manifest; WebView debugging follows the debuggable flag. CI now fails if the APK is debuggable or if its packaged bundle differs from `www/forge.js`. |

## Tested in this environment

- **101 Node tests** (`npm test`): 45 pre-existing engine tests unchanged and passing; 17 new
  manual-override tests; 18 new work-timer tests; 21 new app-layer tests that boot the real
  `forge.js` bundle in jsdom, including the native bridge contract, screen-awake calls, the
  timed-exercise UI flow and both recovery paths (valid and corrupt).
- Java sources parse cleanly (javalang). There is **no JDK or Android SDK in this workspace**, so
  native compilation, dexing and APK assembly were performed by GitHub Actions instead of
  locally; see the Actions run for this branch.
- `npm run bundle` regenerates `www/forge.js` byte-identically to the committed bundle.
- Playwright could not run locally (the browser download is blocked in this sandbox); the
  31-check browser suite runs in GitHub Actions on every push.

## Not verified (no physical device available)

- Screen-off and background behaviour of the **work** countdown, including OEM battery policies.
- Audible/vibration delivery of the hold-complete cue at zero.
- Real-device SQLite recovery across an app kill, and the Storage Access Framework paths.
- Anything involving Android's Doze, reboot or Force stop semantics.

These are the same limitations recorded for the rest timer: the implementation uses a
user-started foreground service with a monotonic in-process countdown, a persisted wall-clock
deadline, a duration-bounded partial wake lock, an exact alarm when the OS allows it, and
per-channel deduplication, but no app can guarantee delivery against every manufacturer policy.
