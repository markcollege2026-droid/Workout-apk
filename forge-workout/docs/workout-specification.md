# Workout App Build Prompt

Paste everything below the line into the AI tool that will build the app.

---

## Goal

Build a **personal-use Android app (installable APK)** for a progressive-overload workout routine. It is for one person only: no accounts, no cloud, no ads, no analytics, no store release. All data stays on the phone and works fully offline.

The app has four jobs:

1. Tell me exactly what to do today and what weight and reps to aim for.
2. Make the session as short as possible by pairing exercises into supersets.
3. Run a rest timer that I start the moment I finish a set.
4. Log every set and use that history to set my next targets.

Units are **kg**.

**Training goal: both strength and muscle size.** The heavy compound lifts (6-10 reps) drive strength, and the higher-rep isolation work drives size. Use longer rests on the heavy compounds and shorter rests on isolation work.

## Tech and delivery

- Use whatever stack produces an installable `.apk` with the least setup. Default suggestion: React Native with Expo, SQLite for storage, and a local debug/preview APK build. Native Kotlin with Jetpack Compose is also fine.
- Give me exact, step-by-step commands to build the APK and install it on my phone (sideloading).
- The rest timer must keep working with the screen off or the app in the background. It must vibrate and play a sound when it ends. Keep the screen awake during a session (setting, on by default).
- Large buttons, high contrast, dark mode by default. I will use it one-handed in the gym.
- Include a **backup/restore** option that exports and imports all data as one JSON file.

## The existing system (keep it)

My spreadsheet is a progressive-overload tracker. Each exercise has a **rep range**, columns for **weight** and **reps**, and a **Raise? / To?** box at the bottom of each block. If I hit the target, I raise the weight and write the new weight in "To?". Bodyweight and abs exercises used **Attempted / Success** columns. The app should replace all of this by doing the "Raise? / To?" decision for me automatically (I can override it).

The sheet also has a **COMMIT** box. Use it as the "Finish and save workout" button at the end of a session.

### Exercise list

Seed the app with these exercises. Everything must be editable later (name, rep range, sets, rest, equipment, increment, substitutes, pairing). The set counts are my guess because the sheet did not make them clear: default to **3 sets**, and **4 for Pull Ups**.

**Chest and Triceps**

| Exercise | Reps | Type |
| --- | --- | --- |
| Bench Press | 6-10 | weighted |
| Incline Bench | 8-12 | weighted |
| Dips | 8-12 | bodyweight |
| Push Ups | 10-15 | bodyweight |
| Push Down | 10-15 | weighted (cable) |
| Skull Crushers | 10-12 | weighted |

**Biceps and Back**

| Exercise | Reps | Type |
| --- | --- | --- |
| Deadlift | 6-10 | weighted |
| Hammer Curls | 8-12 | weighted |
| Pull Ups | 6-10 | bodyweight |
| Pull Down | 8-12 | weighted (cable) |
| Cable Rows | 8-12 | weighted (cable) |
| Incline Curls | 8-12 | weighted |

**Legs**

| Exercise | Reps | Type |
| --- | --- | --- |
| Squats | 6-10 | weighted |
| Lunges | 10-12 | weighted |
| Leg Extensions | 10-15 | weighted (machine) |
| Leg Curls | 10-15 | weighted (machine) |
| Calf Raises | 15-20 | weighted, **weight increase of 1.5-2.5 kg per raise** |

**Abs**

| Exercise | Target | Type |
| --- | --- | --- |
| Sit Ups | 10-15 reps | bodyweight |
| Crunches | 15-20 reps | bodyweight |
| Leg Raises | 10-15 reps | bodyweight |
| Plank | 30-60 sec | timed |

**Shoulders**

| Exercise | Reps | Type |
| --- | --- | --- |
| Overhead Press | 6-10 | weighted |
| Lateral Raises | 10-15 | weighted |
| Face Pulls | 15-20 | weighted (cable) |
| Rear Delt Flies | 12-15 | weighted (machine or dumbbell) |

**Forearms**

| Exercise | Target | Type |
| --- | --- | --- |
| Wrist Curls | 12-15 reps | weighted |
| Reverse Wrist Curl | 12-15 reps | weighted |
| Farmer Carries | 40 sec | timed, weighted |
| Reverse Curls | 10-12 reps | weighted |

## Starting a session

- The home screen shows the six blocks (Chest/Triceps, Biceps/Back, Legs, Abs, Shoulders, Forearms) as checkboxes. I tick what I am training today and tap **Plan my workout**.
- First use: for each exercise, ask for my starting weight (or "unknown, suggest a conservative start"). Bodyweight exercises start with 0 added weight.
- The app builds an ordered, superset-optimized plan (see below) and shows the estimated total time.
- Before each set, show: **exercise name, set number, target weight x target reps, and what I did last session**.

## Machine unavailable

- Every exercise screen has an **Unavailable today** button. One tap swaps in the next substitute from that exercise's substitute list, then re-plans the session (supersets may change).
- Each substitute is its own exercise with its own history and progression. The original exercise's progress is **not** affected or penalized.
- Also offer **Skip today** with no penalty to progression.
- I can edit each exercise's substitute list in settings. Suggested defaults:

| Exercise | Default substitutes (in order) |
| --- | --- |
| Bench Press | Dumbbell Bench Press, Push Ups |
| Incline Bench | Incline Dumbbell Press |
| Dips | Bench Dips, Close-Grip Push Ups |
| Push Down | Overhead Dumbbell Triceps Extension |
| Skull Crushers | Overhead Dumbbell Triceps Extension |
| Pull Down | Pull Ups, Band Pulldown |
| Cable Rows | One-Arm Dumbbell Row |
| Pull Ups | Pull Down |
| Squats | Goblet Squat, Lunges |
| Leg Extensions | Sissy Squat, Lunges |
| Leg Curls | Dumbbell Romanian Deadlift |
| Calf Raises | Standing Calf Raise on a step (bodyweight or dumbbell) |
| Face Pulls | Rear Delt Flies |
| Rear Delt Flies | Face Pulls |
| Incline Curls | Hammer Curls |

## Superset engine (shortest possible workout)

The app does **not** need to understand how exercises relate to each other. It only follows the pairing table below. I control that table and can edit it in settings.

**Rules**

- A superset is two exercises done back to back (optional setting: allow triple sets, off by default).
- Do exercise A set 1, then exercise B set 1, then take the rest timer, then repeat until the sets are finished.
- Two exercises may be paired **only if the table allows it**.
- Greedy planner: pair as many of today's exercises as possible, prefer pairs with equal set counts, put heavy compound lifts first in the session, leave anything unpaired as a normal straight set, and show the estimated total time.
- Everything not listed as pairable is **solo**.

**Groups**

- ABS: Sit Ups, Crunches, Leg Raises, Plank
- LEG\_ISO: Leg Extensions, Leg Curls, Calf Raises
- ROW\_PULL: Pull Ups, Pull Down, Cable Rows
- REAR\_SHOULDER: Rear Delt Flies, Face Pulls
- TRI: Dips, Push Down, Skull Crushers
- BI: Hammer Curls, Incline Curls
- PRESS: Bench Press, Incline Bench, Push Ups
- WRIST: Wrist Curls, Reverse Wrist Curl, Reverse Curls
- SOLO (never paired): Deadlift, Squats, Farmer Carries

**Allowed pairs** (symmetric: if A can pair with B, B can pair with A)

| Exercise or group | Can be paired with |
| --- | --- |
| PRESS | ROW\_PULL, REAR\_SHOULDER, BI, ABS, LEG\_ISO |
| Overhead Press | ROW\_PULL, BI, ABS (not Plank), LEG\_ISO |
| Lateral Raises | ROW\_PULL, BI, ABS, LEG\_ISO, WRIST |
| TRI | ROW\_PULL, BI, REAR\_SHOULDER, ABS (not Plank for Dips), LEG\_ISO |
| BI | PRESS, TRI, REAR\_SHOULDER, ABS, LEG\_ISO |
| ROW\_PULL | PRESS, TRI, Overhead Press, Lateral Raises, ABS, LEG\_ISO (but not another ROW\_PULL) |
| REAR\_SHOULDER | PRESS, TRI, BI, ABS, LEG\_ISO, WRIST |
| LEG\_ISO | all upper-body groups above, ABS (not Leg Raises), and other LEG\_ISO items |
| Lunges | ABS (not Leg Raises), WRIST |
| ABS | any group that lists ABS above; never with another ABS exercise; Plank never with Push Ups, Dips or Overhead Press; Leg Raises never with Pull Ups, Leg Extensions or Leg Curls |
| WRIST | PRESS, TRI, Lateral Raises, REAR\_SHOULDER, LEG\_ISO, ABS (never with ROW\_PULL, BI or Farmer Carries) |

Treat substitute exercises as belonging to the same group as the exercise they replace.

## Rest timer

- A large **Set done** button. The moment I tap it, the rest timer starts.
- Rest length comes from a **Settings** screen: a global default, plus an optional per-exercise override. Suggested defaults: 150 sec for 6-10 rep compounds, 90 sec for everything else.
- In a superset, tapping **Set done** on exercise A shows "Next: B" with a short transition timer (setting, default 10 sec). The full rest timer starts only after B.
- While the timer runs, the screen shows the **next exercise name and its target weight x reps**, so I know what is coming.
- Controls: +15 sec, -15 sec, skip rest.
- Vibrate and sound when the timer ends; both can be toggled in settings.

## Logging

- After each set, a box asks for **reps done** and **weight used**. Prefill it with the target so a normal set takes one tap to confirm.
- Logging happens **during** the rest timer, not before it, so it never delays the timer.
- For timed exercises (Plank, Farmer Carries), log **seconds** instead of reps.
- For bodyweight exercises, log reps plus **added weight** (default 0). Mark a set **Attempted but failed** when I miss the minimum.
- Allow an **undo last set** and editing a past session.

## Progression logic

The app decides "Raise? / To?" for each exercise after every session:

- **Double progression for weighted exercises:** if I hit the **top of the rep range on all sets**, raise the weight and reset the reps target to the bottom of the range. Otherwise keep the same weight and aim for more reps next time.
- **Increment sizes** (editable per exercise): barbell lifts 2.5 kg; dumbbells and cables 1-2.5 kg; Calf Raises 1.5-2.5 kg (as noted on my sheet).
- **Bodyweight exercises:** when I hit the top of the range on all sets, suggest adding weight (belt or backpack) or a harder variation. Track attempted vs. successful sets the way my sheet did.
- **Timed exercises:** add 5 sec per session until the top of the range (60 sec for Plank), then suggest adding load or a harder variation. Farmer Carries: raise the weight when I complete 40 sec on all sets.
- **Stall and deload rule:** if I miss the bottom of the rep range on at least half of my sets two sessions in a row, suggest a 10% deload for that exercise.
- The app only **suggests**. I can accept or edit the "To?" weight with one tap.

## Analysis screens

Keep this simple and readable on a phone.

- Per exercise: weight over time, estimated 1RM trend (Epley formula), total volume per session, personal records.
- A list of **stalled lifts** (no progress in the last several sessions).
- Session history with date, duration, and sets completed.
- A **Next session preview**: every exercise with its new target weight x reps.
- Estimated vs. actual session time, so I can see how much supersets saved.

## Other requirements

- Fully editable: add, remove, and reorder exercises, change rep ranges, sets, rest times, equipment tags, and the pairing table.
- Warm-up sets are \*\*on by default\*\* (setting to turn off). See Extra features below for how they work.
- No login, no network permission needed.

## Extra features

Build these in as well.

- **Warm-up ramp:** before the first working set of Bench Press, Incline Bench, Deadlift, Squats and Overhead Press, show 3 warm-up sets at about 40% x 8, 60% x 5 and 80% x 3 of the working weight, rounded to loadable weights. Warm-ups never count toward progression, and the rest after them is short (default 45 sec).
- **Loadable weights:** a setting where I enter the plates, dumbbells and cable stack steps I actually have. All targets round to a weight I can really load.
- **Time budget mode:** I enter how many minutes I have. Each exercise has a priority (1-3). The app drops the lowest-priority exercises until the estimated time fits, and never drops progression-critical compounds first.
- **Machine settings memory:** per exercise, a note field for seat height, pad position, grip width and similar. It is shown before the first set every time.
- **Optional effort rating:** a one-tap "reps left in the tank" field (0, 1, 2, 3+) after each set. If I hit the top of the range but marked 0 left, the app holds the weight one more session instead of raising it.
- **Safe jumps:** cap any automatic weight increase at 5% per session. If I beat the top of the range by 2 or more reps on every set, allow a double increment.
- **Failure handling:** if I miss the bottom of the range, repeat the same weight next time. After two misses in a row, suggest the 10% deload from the progression section.
- **Weekly volume view:** hard sets per muscle group over the last 7 days, so I can see what I am neglecting.
- **Bodyweight log:** log my body weight weekly. Show bodyweight lifts (Pull Ups, Dips) as total load (body weight + added weight).
- **Session notes:** a free-text note per set and per session (pain, sleep, mood).
- **Autosave and resume:** save after every set. If the app is closed or crashes mid-workout, reopen straight into the same session.
- **Reminders:** optional local notifications for chosen training days.
- **History calendar:** a month view with trained days marked and a streak counter.

## Final instructions to the builder

- Build the whole app, not a plan or a skeleton.
- Seed the database with the exercise list, substitute defaults, and pairing table above.
- Finish with exact commands to produce the APK and install it on an Android phone.
- If something is ambiguous, pick the simplest sensible option and list your assumptions at the end.
