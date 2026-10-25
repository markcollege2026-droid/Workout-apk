# Forge — your next rep

A complete personal-use, offline Android workout app built from your workout specification.

**APK output:** `release/Forge-Workout.apk` locally, or the **Forge-Workout-APK** artifact on GitHub Actions  
**Android:** 8.0+ (API 26), target/compile SDK 35. One universal APK; no CPU-specific downloads.  
**Package:** `app.forge.workout`  
**Privacy:** no Internet permission, accounts, cloud, ads, analytics, or automatic OS cloud backup.

## Build on GitHub Actions

The workflow is at the repository root: **`.github/workflows/forge-build-apk.yml`**. Source lives in **`forge-workout/`**. A push on any branch runs the workflow: 45 engine tests, the 27-check headless browser UI smoke suite, a guard that fails when the checked-in `www/forge.js` bundle drifted from the readable sources, then the APK build and verification. Download **Forge-Workout-APK** from a successful run and extract **Forge-Workout.apk**. Pushing a `v*` tag additionally publishes a **GitHub Release** with the signed APK, its SHA-256 checksum, and build details attached.

The matching APK signing key is restored from the **FORGE_WORKOUT_KEYSTORE_B64** Actions secret; it is not public source. Cloud compilation processes app code only, not your phone's workout data. See **GITHUB_ACTIONS.md** for this repository's build details.

## 1. Install the already-built APK — no development tools needed

1. Download **Forge-Workout.apk** onto your Android phone.
2. Open the file in **Files / Downloads**.
3. If prompted, allow **Install unknown apps** for the specific Files app or browser you used. This is a personal-use debug-signed APK, not a Play Store release. Do not disable device-wide security protections.
4. Tap **Install**, then open **Forge**. You can turn that install-source permission off again afterward.
5. Start a workout and allow **notifications** when asked. In **Settings → Background readiness**, allow **Alarms & reminders** as the process-kill fallback if Android offers that setting.
6. In Android's app battery settings, choose **Unrestricted** if your manufacturer's battery saver interrupts foreground timers. Keep alarm volume audible; Do Not Disturb, volume controls, and device policies can affect sound.

### Screen-off check before your first gym session

The APK has a native foreground countdown, partial wake lock, completion sound, vibration, and an exact-alarm fallback. **Physical-phone behavior has not been verified in this workspace.** Test your phone:

1. In Forge Settings, turn **sound** and **vibration** on; tap **Test completion alert**.
2. On Today, select only **Abs**, plan it, and start the session. No starting-load setup is needed.
3. Tap **Set done** without performing a set; the default rest begins immediately. Tap **−15 sec** five times to reduce 90 seconds to roughly 15 seconds.
4. Lock the phone. Check that the cue occurs with the screen off. Unlock and verify the countdown is finished.
5. Tap **Undo last set**, then **Discard this session without saving** and confirm. No test sets remain in your history.
6. Repeat with Forge in the background. If a cue is missed, check notification/alarm permissions, alarm volume, Do Not Disturb, and battery restrictions before relying on the timer.

Android **Force stop** disables alarms/services/reminders. It is not a normal background state; reopen Forge afterward. Reminders are local but intentionally inexact and can be delayed by Android's power management.

## 2. First real workout

- Select any of the six muscle blocks; optionally set a **5–240 minute** budget.
- Tap **Plan my workout**. Enter comfortable starting loads or select **Unknown · suggest conservative starts** and review them.
- Check the plan and estimated time. Heavy compounds come first; compatible exercises are paired using your table. Triples are optional and off initially.
- Tap **Set done** at the instant you finish. The timer starts before the log. The log is target-prefilled; confirm while resting. In a superset, A starts a transition and B starts the full rest.
- Use **Unavailable today** for the next unused substitute or **Skip today**. Substitute targets and history are independent. Original, skipped, and incomplete exercises are not penalized.
- Use **COMMIT** to finish and save. In Progress, review **Raise? / To?**, then **Accept** or edit each proposal. Nothing silently raises your load.

Every set and draft log autosaves. Reopening goes straight into the same active session. Undo restores the most recent task. Discard requires confirmation and only removes the active session.

## 3. What is included

- **29 original exercises**, all specified rep/time ranges, **4 Pull Up sets** and **3 sets** elsewhere, plus **11 distinct substitute exercises** with the specified ordered defaults.
- Symmetric, editable pair rules, greedy equal-set-count preference, heavy-lift ordering, unequal-round handling, and optional mutually compatible triples.
- Global/per-exercise rest, 10-second transitions, sound/vibration toggles, and screen-awake preference.
- Warm-up ramps for the five main compounds, loadable plate combinations and load lists, priorities and time-budget trimming, and machine/setup notes.
- Weighted/bodyweight/timed logging, attempted/failed sets, optional RIR, per-set and session notes, explicit progression acceptance/override, safe jumps, double increments, and deload suggestions.
- Real weight/Epley/volume charts, PRs, stalled lifts, weekly primary-muscle working-set totals, accepted next targets, and bodyweight snapshots for total-load tracking.
- Session history, editable past sets/RIR/notes/date/duration, calendar, streak, estimated versus actual duration, and planned superset savings.
- Add/edit/reorder/archive exercises, free-form equipment tags, editable substitute ordering, configurable equipment, and chosen-day reminders.
- Complete one-file **JSON export/import**, including settings and an active session; validation happens before any replacement.

## 4. Build the APK yourself

No Expo account, cloud build, Gradle installation, Maven downloads, or npm installation is required to build the delivered source. The offline JavaScript bundle is already included.

### One-time toolchain setup

Install **Android Studio** from `https://developer.android.com/studio`. Open its SDK Manager and install **Android SDK Command-line Tools (latest)**. The bundled `jbr` supplies a suitable Java runtime (JDK 17+). The commands below install the exact tested SDK packages.

Extract `Forge-Workout-Source.zip`. It contains a `forge-workout` directory. Commands assume the ZIP is in Downloads; change that path only if needed.

### macOS

```bash
cd "$HOME/Downloads"
unzip Forge-Workout-Source.zip
cd forge-workout
export ANDROID_SDK_ROOT="$HOME/Library/Android/sdk"
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
export PATH="$JAVA_HOME/bin:$ANDROID_SDK_ROOT/platform-tools:$PATH"
"$ANDROID_SDK_ROOT/cmdline-tools/latest/bin/sdkmanager" --licenses
"$ANDROID_SDK_ROOT/cmdline-tools/latest/bin/sdkmanager" \
  "platforms;android-35" "build-tools;35.0.0" "platform-tools"
bash scripts/build-apk.sh
```

### Linux

Install/extract Android Studio to `$HOME/android-studio` and run its setup wizard first. If installed elsewhere, adjust `JAVA_HOME`.

```bash
cd "$HOME/Downloads"
unzip Forge-Workout-Source.zip
cd forge-workout
export ANDROID_SDK_ROOT="$HOME/Android/Sdk"
export JAVA_HOME="$HOME/android-studio/jbr"
export PATH="$JAVA_HOME/bin:$ANDROID_SDK_ROOT/platform-tools:$PATH"
"$ANDROID_SDK_ROOT/cmdline-tools/latest/bin/sdkmanager" --licenses
"$ANDROID_SDK_ROOT/cmdline-tools/latest/bin/sdkmanager" \
  "platforms;android-35" "build-tools;35.0.0" "platform-tools"
bash scripts/build-apk.sh
```

### Windows PowerShell

Use Android Studio's default install location, or adjust the two paths below.

```powershell
Set-Location "$env:USERPROFILE\Downloads"
Expand-Archive -Path .\Forge-Workout-Source.zip -DestinationPath . -Force
Set-Location .\forge-workout
$env:ANDROID_SDK_ROOT = "$env:LOCALAPPDATA\Android\Sdk"
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
$env:PATH = "$env:JAVA_HOME\bin;$env:ANDROID_SDK_ROOT\platform-tools;$env:PATH"
& "$env:ANDROID_SDK_ROOT\cmdline-tools\latest\bin\sdkmanager.bat" --licenses
& "$env:ANDROID_SDK_ROOT\cmdline-tools\latest\bin\sdkmanager.bat" `
  "platforms;android-35" "build-tools;35.0.0" "platform-tools"
powershell -ExecutionPolicy Bypass -File .\scripts\build-apk.ps1
```

Output on every platform: **`release/Forge-Workout.apk`**. The script compiles resources with aapt2, compiles the native Java layer, dexes it with d8, aligns, signs, and verifies the APK. The final build/verification was performed with the Linux script; the PowerShell script is supplied but has not been executed on Windows here.

### Install with USB/adb

1. Phone → **Settings → About phone → Build number**: tap seven times to enable Developer options.
2. Enable **USB debugging**. Connect a data-capable USB cable.
3. Run `adb devices` and accept the phone's debugging authorization prompt. The device should show `device`, not `unauthorized`.
4. From `forge-workout`, run:

macOS/Linux:

```bash
"$ANDROID_SDK_ROOT/platform-tools/adb" devices
"$ANDROID_SDK_ROOT/platform-tools/adb" install -r release/Forge-Workout.apk
"$ANDROID_SDK_ROOT/platform-tools/adb" shell am start -n app.forge.workout/.MainActivity
```

Windows:

```powershell
& "$env:ANDROID_SDK_ROOT\platform-tools\adb.exe" devices
& "$env:ANDROID_SDK_ROOT\platform-tools\adb.exe" install -r .\release\Forge-Workout.apk
& "$env:ANDROID_SDK_ROOT\platform-tools\adb.exe" shell am start -n app.forge.workout/.MainActivity
```

`-r` preserves data when the package and signing key match. Keep the included `signing/forge-debug.keystore` if you want rebuilds to update the supplied APK. This is a **debug/personal-use key**, password `android`, alias `androiddebugkey`; do not reuse it for a production or public-store app. If you change signing keys, Android will refuse the update; **export JSON before uninstalling**.

## 5. Preview, edit, and test

The live preview is the same interface with browser-local storage. Native SQLite, background service, alarms, SAF backup picker, vibration, and reminders belong to the APK. **Do not rely on a background browser tab as a gym timer.** Browser preview data is separate from phone data; JSON export/import moves it between them.

Preview with Python 3:

```bash
python3 -m http.server 3000 --bind 0.0.0.0 --directory www
# Open http://localhost:3000 on the development computer.
```

Optional developer tools: Node 20+.

```bash
npm ci
npm run bundle    # REQUIRED after editing readable www/*.js sources — CI fails on drift
npm test          # 45 planner/progression/backup unit tests
npx playwright install --with-deps chromium
# With the preview server running in another terminal:
npm run test:ui   # 27 headless-browser checks (also runs in GitHub Actions)
bash scripts/build-apk.sh
```

`www/forge.js` is the checked-in, transpiled offline bundle (Chromium 58+ syntax with small polyfills). No CDN scripts, fonts, images, services, or APIs are used at runtime. Source changes to the readable JS files need the bundle command before previewing/building.

### Architecture

- `www/seed.js`: routine, substitute defaults, initial targets and settings.
- `www/engine.js`: pure pairing, planner, progression, records, analysis and backup validation.
- `www/ui.js`, `views.js`, `modals.js`, `app.js`: complete responsive interface and controllers.
- `www/storage.js`: private SQLite bridge on Android; localStorage in the preview.
- `android/app/src/main/java/app/forge/workout/`: activity, transactional SQLite workspace repository, foreground timer, deduplicated alarm completion, and local reminders.
- `scripts/`: SDK-only builds and optional JS transpilation.
- `tests/`: 45 passing engine tests, 27 passing browser/UI/bridge-contract checks, and scope/verification report.

SQLite stores the complete versioned workspace document transactionally, plus one previous local revision. History is keyed by actual exercise IDs, not by substituted-original IDs. Android's automatic cloud backup/device transfer is excluded; backups happen only when you choose to export.

## 6. Verification and boundaries

- Linux SDK 35 build completed; aapt2/d8 compilation succeeded.
- APK alignment and v2/v3 signature verification passed.
- APK manifest was inspected: **no Internet permission**.
- **45 engine tests passed**, including all 63 nonempty block selections, pairing exceptions, unequal sets, triples, budget trimming, loadability, immediate timers, progression, failure/deload rules, substitution independence, undo after substitute/skip, warm-up-only session semantics, analytics and backup validation.
- **27 UI checks passed**: complete session workflow, drafts and reload, notes, edit/archive, independent substitutes, history editing (including future-date rejection and accepted-suggestion preservation), real charts, export/restore, malformed-backup rejection, corrupt-storage recovery, 320px layouts, local-file assets, and mocked native bridge contracts. No JavaScript page errors.
- **25 October 2026 functional-QA pass** fixed three defects with new regression tests: accepted suggestions were silently un-accepted by history edits, undo could resurrect tasks of skipped/substituted entries, and history editing accepted future session dates. GitHub Actions now also runs the headless UI smoke suite and fails on `www/forge.js` bundle drift. See the addendum in `tests/VERIFICATION.md`.
- An Android emulator could not boot in the 2 GB, unaccelerated workspace. **No Android runtime, physical-device alert, Doze/reboot, OEM battery-policy, or Windows-build execution is claimed.** Perform the screen-off check above on your actual phone.

## Assumptions and interpretations

1. A small native Java Android host with bundled HTML/JS was chosen instead of Expo/Compose to deliver a real APK with the fewest build dependencies. All actual Android data is private SQLite, not browser storage.
2. Weights are kg. Dumbbells, including Farmer Carries, are recorded **per hand**; barbell load includes the bar. Unilateral rep targets are per side. Volume uses the recorded load basis, not automatically doubled dumbbell tonnage; timed volume is kg·seconds.
3. Where equipment was not specified, sensible editable defaults were chosen: dumbbells for Skull Crushers and Rear Delt Flies; barbell for Reverse Curls. Band Pulldown uses a labeled kg-equivalent resistance slot and cable load list; edit that tag/load model to your equipment.
4. Starting-load suggestions are generic, deliberately low equipment defaults, not a personalized assessment. No historical workouts or personal records are fabricated.
5. The most restrictive default pairing interpretation wins: **no LEG_ISO item, including Calf Raises, pairs with Leg Raises**. Symmetric rules are the union of both sides of your table. Named solo lifts stay solo; other rules can be explicitly overridden in Settings.
6. Substitute definitions keep their own targets, rep range, set count and history, but inherit the original's pairing group. Already-used exercises are not duplicated or cycled back into the same session. Original partial sets remain in history; a replacement starts its own full set allocation.
7. Progression requires the full planned working-set count for that actual exercise. Incomplete/skipped originals are excluded from progression/failure checks, but their real completed sets still appear in analysis and weekly volume.
8. All next-target changes—including rep/time proposals—are explicit **Accept/Edit** decisions. The preview shows accepted targets. A 0-RIR ceiling effort holds one session at that load; the next eligible ceiling session may raise it.
9. The default safe-jump cap is 5%, editable. If no available increment fits, hold rather than exceed it. Added-bodyweight load uses total body load when a weigh-in exists; without one, initial added load/harder variation is a manual proposal, not an automatic jump. Double increments apply to rep exercises, not extra carry seconds.
10. Warm-up percentages round down to available weights, with the empty bar as a floor. Light working loads can produce repeated empty-bar warm-ups. Warm-ups only precede the first working set, and never count for progression.
11. Time estimates use roughly 3 seconds per rep, recorded seconds for timed work, 10 seconds of setup per exercise, and planned rest/transition/warm-up durations. They include the final planned rest; you can COMMIT sooner. **Savings are modeled straight-set minus superset time, not a claim of measured actual savings.**
12. The five ramp compounds default to highest budget priority; other exercises default to priority 2. Budget mode drops optional/noncompound work first and keeps at least one exercise, warning if that last compound cannot fit.
13. Weekly muscle balance counts confirmed working sets by **primary muscle**, not fractional secondary-muscle credit or a measured effort threshold. A streak means consecutive local calendar days with completed working sets, including yesterday if today is not yet trained.
14. Body weight is the latest logged value on/before the set's date. Each set snapshots it; later weigh-ins do not retroactively alter old total loads. Estimated 1RM is Epley and is not shown for timed work or claimed as a tested max.
15. Reminder delivery is best-effort local scheduling, not an exact training appointment. JSON backups are versioned, validated, and capped at 64 MB on import to protect phone memory. Archiving preserves historical IDs and can be undone in the Library.
