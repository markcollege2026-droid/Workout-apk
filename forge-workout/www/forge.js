/* Generated from the readable source files. Run npm run bundle after edits. */
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
(function() {
  "use strict";
  if (!Object.fromEntries) Object.fromEntries = function(entries) {
    const out = {};
    for (const pair of entries) Object.defineProperty(out, pair[0], { value: pair[1], enumerable: true, writable: true, configurable: true });
    return out;
  };
  if (!String.prototype.replaceAll) Object.defineProperty(String.prototype, "replaceAll", { value: function(search, replacement) {
    if (search instanceof RegExp) return this.replace(search, replacement);
    return this.split(String(search)).join(String(replacement));
  }, writable: true, configurable: true });
})();
(function(root) {
  "use strict";
  const blocks = [
    { id: "chest", name: "Chest & Triceps", short: "Chest / Triceps", icon: "bench", color: "#ff795b", subtitle: "Push with purpose" },
    { id: "back", name: "Biceps & Back", short: "Back / Biceps", icon: "pull", color: "#bba6ff", subtitle: "Build your foundation" },
    { id: "legs", name: "Legs", short: "Legs", icon: "legs", color: "#b8d98b", subtitle: "Strength from the ground up" },
    { id: "abs", name: "Abs", short: "Abs", icon: "abs", color: "#f5cb78", subtitle: "Own your center" },
    { id: "shoulders", name: "Shoulders", short: "Shoulders", icon: "shoulders", color: "#88cbe0", subtitle: "Make room to grow" },
    { id: "forearms", name: "Forearms", short: "Forearms", icon: "grip", color: "#e9a2c0", subtitle: "Grip. Carry. Repeat." }
  ];
  const rows = [
    // id, name, block, pair group, type, min, max, equipment, conservative suggestion, increment, muscle
    ["bench-press", "Bench Press", "chest", "PRESS", "weighted", 6, 10, "barbell", 20, 2.5, "Chest"],
    ["incline-bench", "Incline Bench", "chest", "PRESS", "weighted", 8, 12, "barbell", 20, 2.5, "Chest"],
    ["dips", "Dips", "chest", "TRI", "bodyweight", 8, 12, "bodyweight", 0, 2.5, "Triceps"],
    ["push-ups", "Push Ups", "chest", "PRESS", "bodyweight", 10, 15, "bodyweight", 0, 2.5, "Chest"],
    ["push-down", "Push Down", "chest", "TRI", "weighted", 10, 15, "cable", 10, 1.25, "Triceps"],
    ["skull-crushers", "Skull Crushers", "chest", "TRI", "weighted", 10, 12, "dumbbell", 6, 1, "Triceps"],
    ["deadlift", "Deadlift", "back", "SOLO", "weighted", 6, 10, "barbell", 20, 2.5, "Back"],
    ["hammer-curls", "Hammer Curls", "back", "BI", "weighted", 8, 12, "dumbbell", 6, 1, "Biceps"],
    ["pull-ups", "Pull Ups", "back", "ROW_PULL", "bodyweight", 6, 10, "bodyweight", 0, 2.5, "Back"],
    ["pull-down", "Pull Down", "back", "ROW_PULL", "weighted", 8, 12, "cable", 15, 1.25, "Back"],
    ["cable-rows", "Cable Rows", "back", "ROW_PULL", "weighted", 8, 12, "cable", 15, 1.25, "Back"],
    ["incline-curls", "Incline Curls", "back", "BI", "weighted", 8, 12, "dumbbell", 6, 1, "Biceps"],
    ["squats", "Squats", "legs", "SOLO", "weighted", 6, 10, "barbell", 20, 2.5, "Quads"],
    ["lunges", "Lunges", "legs", "LUNGES", "weighted", 10, 12, "dumbbell", 6, 1, "Quads"],
    ["leg-extensions", "Leg Extensions", "legs", "LEG_ISO", "weighted", 10, 15, "machine", 10, 2.5, "Quads"],
    ["leg-curls", "Leg Curls", "legs", "LEG_ISO", "weighted", 10, 15, "machine", 10, 2.5, "Hamstrings"],
    ["calf-raises", "Calf Raises", "legs", "LEG_ISO", "weighted", 15, 20, "machine", 20, 2, "Calves"],
    ["sit-ups", "Sit Ups", "abs", "ABS", "bodyweight", 10, 15, "bodyweight", 0, 2.5, "Abs"],
    ["crunches", "Crunches", "abs", "ABS", "bodyweight", 15, 20, "bodyweight", 0, 2.5, "Abs"],
    ["leg-raises", "Leg Raises", "abs", "ABS", "bodyweight", 10, 15, "bodyweight", 0, 2.5, "Abs"],
    ["plank", "Plank", "abs", "ABS", "timed", 30, 60, "bodyweight", 0, 2.5, "Abs"],
    ["overhead-press", "Overhead Press", "shoulders", "OHP", "weighted", 6, 10, "barbell", 20, 2.5, "Shoulders"],
    ["lateral-raises", "Lateral Raises", "shoulders", "LATERAL", "weighted", 10, 15, "dumbbell", 4, 1, "Shoulders"],
    ["face-pulls", "Face Pulls", "shoulders", "REAR_SHOULDER", "weighted", 15, 20, "cable", 5, 1.25, "Rear delts"],
    ["rear-delt-flies", "Rear Delt Flies", "shoulders", "REAR_SHOULDER", "weighted", 12, 15, "dumbbell", 4, 1, "Rear delts"],
    ["wrist-curls", "Wrist Curls", "forearms", "WRIST", "weighted", 12, 15, "dumbbell", 4, 1, "Forearms"],
    ["reverse-wrist-curl", "Reverse Wrist Curl", "forearms", "WRIST", "weighted", 12, 15, "dumbbell", 2, 1, "Forearms"],
    ["farmer-carries", "Farmer Carries", "forearms", "SOLO", "timed", 40, 40, "dumbbell", 10, 1, "Forearms"],
    ["reverse-curls", "Reverse Curls", "forearms", "WRIST", "weighted", 10, 12, "barbell", 20, 2.5, "Forearms"],
    ["dumbbell-bench-press", "Dumbbell Bench Press", "chest", "PRESS", "weighted", 6, 10, "dumbbell", 8, 1, "Chest"],
    ["incline-dumbbell-press", "Incline Dumbbell Press", "chest", "PRESS", "weighted", 8, 12, "dumbbell", 6, 1, "Chest"],
    ["bench-dips", "Bench Dips", "chest", "TRI", "bodyweight", 8, 12, "bodyweight", 0, 2.5, "Triceps"],
    ["close-grip-push-ups", "Close-Grip Push Ups", "chest", "TRI", "bodyweight", 8, 12, "bodyweight", 0, 2.5, "Triceps"],
    ["overhead-dumbbell-triceps-extension", "Overhead Dumbbell Triceps Extension", "chest", "TRI", "weighted", 10, 15, "dumbbell", 6, 1, "Triceps"],
    ["band-pulldown", "Band Pulldown", "back", "ROW_PULL", "weighted", 8, 12, "cable", 5, 1.25, "Back"],
    ["one-arm-dumbbell-row", "One-Arm Dumbbell Row", "back", "ROW_PULL", "weighted", 8, 12, "dumbbell", 8, 1, "Back"],
    ["goblet-squat", "Goblet Squat", "legs", "SOLO", "weighted", 6, 10, "dumbbell", 8, 1, "Quads"],
    ["sissy-squat", "Sissy Squat", "legs", "LEG_ISO", "bodyweight", 10, 15, "bodyweight", 0, 2.5, "Quads"],
    ["dumbbell-romanian-deadlift", "Dumbbell Romanian Deadlift", "legs", "LEG_ISO", "weighted", 10, 15, "dumbbell", 8, 1, "Hamstrings"],
    ["standing-calf-raise-step", "Standing Calf Raise on a Step", "legs", "LEG_ISO", "bodyweight", 15, 20, "bodyweight", 0, 2, "Calves"]
  ];
  const substitutes = {
    "bench-press": ["dumbbell-bench-press", "push-ups"],
    "incline-bench": ["incline-dumbbell-press"],
    "dips": ["bench-dips", "close-grip-push-ups"],
    "push-down": ["overhead-dumbbell-triceps-extension"],
    "skull-crushers": ["overhead-dumbbell-triceps-extension"],
    "pull-down": ["pull-ups", "band-pulldown"],
    "cable-rows": ["one-arm-dumbbell-row"],
    "pull-ups": ["pull-down"],
    "squats": ["goblet-squat", "lunges"],
    "leg-extensions": ["sissy-squat", "lunges"],
    "leg-curls": ["dumbbell-romanian-deadlift"],
    "calf-raises": ["standing-calf-raise-step"],
    "face-pulls": ["rear-delt-flies"],
    "rear-delt-flies": ["face-pulls"],
    "incline-curls": ["hammer-curls"]
  };
  const warmup = ["bench-press", "incline-bench", "deadlift", "squats", "overhead-press"];
  const compounds = [...warmup];
  function createState() {
    const exercises = rows.map((r, i) => ({
      id: r[0],
      name: r[1],
      block: r[2],
      group: r[3],
      type: r[4],
      min: r[5],
      max: r[6],
      equipment: r[7],
      suggested: r[8],
      increment: r[9],
      muscle: r[10],
      sets: r[0] === "pull-ups" ? 4 : 3,
      rest: r[5] === 6 ? 150 : null,
      priority: compounds.includes(r[0]) ? 1 : 2,
      compound: compounds.includes(r[0]),
      warmup: warmup.includes(r[0]),
      primary: i < 29,
      active: true,
      order: i,
      note: "",
      equipmentTag: r[0] === "band-pulldown" ? "Resistance band (kg-equivalent)" : "",
      substitutes: substitutes[r[0]] || []
    }));
    const targets = {};
    exercises.forEach((e) => targets[e.id] = { weight: e.equipment === "bodyweight" ? 0 : null, reps: e.min });
    return {
      version: 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      exercises,
      targets,
      suggestions: {},
      sessions: [],
      session: null,
      bodyweights: [],
      pairOverrides: {},
      settings: {
        rest: 90,
        transition: 10,
        warmupRest: 45,
        keepAwake: true,
        sound: true,
        vibrate: true,
        warmups: true,
        triples: false,
        effort: true,
        safeJump: 5,
        stallSessions: 3,
        barWeight: 20,
        plates: [{ weight: 1.25, pairs: 2 }, { weight: 2.5, pairs: 2 }, { weight: 5, pairs: 2 }, { weight: 10, pairs: 2 }, { weight: 15, pairs: 2 }, { weight: 20, pairs: 2 }],
        dumbbells: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40],
        cables: Array.from({ length: 40 }, (_, i) => 5 + i * 2.5),
        machines: Array.from({ length: 30 }, (_, i) => 5 + i * 5),
        addedLoads: [0, 1.25, 2.5, 5, 7.5, 10, 12.5, 15, 17.5, 20, 25, 30, 35, 40, 45, 50],
        reminders: { days: [], time: "18:00" },
        selectedBlocks: ["chest", "back"],
        budget: null
      }
    };
  }
  const api = { blocks, createState };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.ForgeSeed = api;
})(typeof window !== "undefined" ? window : globalThis);
(function(root) {
  "use strict";
  const GROUPS = {
    PRESS: ["ROW_PULL", "REAR_SHOULDER", "BI", "ABS", "LEG_ISO"],
    OHP: ["ROW_PULL", "BI", "ABS", "LEG_ISO"],
    LATERAL: ["ROW_PULL", "BI", "ABS", "LEG_ISO", "WRIST"],
    TRI: ["ROW_PULL", "BI", "REAR_SHOULDER", "ABS", "LEG_ISO"],
    BI: ["PRESS", "TRI", "REAR_SHOULDER", "ABS", "LEG_ISO"],
    ROW_PULL: ["PRESS", "TRI", "OHP", "LATERAL", "ABS", "LEG_ISO"],
    REAR_SHOULDER: ["PRESS", "TRI", "BI", "ABS", "LEG_ISO", "WRIST"],
    LEG_ISO: ["PRESS", "TRI", "BI", "ROW_PULL", "REAR_SHOULDER", "OHP", "LATERAL", "WRIST", "ABS", "LEG_ISO"],
    LUNGES: ["ABS", "WRIST"],
    ABS: [],
    WRIST: ["PRESS", "TRI", "LATERAL", "REAR_SHOULDER", "LEG_ISO", "ABS", "LUNGES"],
    SOLO: []
  };
  const clone = (x) => JSON.parse(JSON.stringify(x));
  const uid = () => Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
  const ex = (s, id) => s.exercises.find((e) => e.id === id);
  const key = (a, b) => [a, b].sort().join("|");
  const number = (v, d = 0) => Number.isFinite(Number(v)) ? Number(v) : d;
  const rounded = (n) => Math.round(n * 100) / 100;
  function canPair(s, a, b) {
    if (a.id === b.id) return false;
    const ga = a.pairGroup || a.group, gb = b.pairGroup || b.group;
    if (ga === "SOLO" || gb === "SOLO" || [a.id, b.id, a.sourceId, b.sourceId].some((id) => ["deadlift", "squats", "farmer-carries"].includes(id))) return false;
    const k = key(a.id, b.id);
    if (Object.prototype.hasOwnProperty.call(s.pairOverrides, k)) return s.pairOverrides[k] === true;
    const is = (x, id) => x.id === id || x.sourceId === id;
    const either = (id, predicate) => is(a, id) && predicate(b) || is(b, id) && predicate(a);
    if (either("plank", (x) => ["push-ups", "dips", "overhead-press"].some((id) => is(x, id)))) return false;
    if (either("leg-raises", (x) => (x.pairGroup || x.group) === "LEG_ISO" || is(x, "pull-ups"))) return false;
    if (ga === "ABS" && gb === "ABS") return false;
    return (GROUPS[ga] || []).includes(gb) || (GROUPS[gb] || []).includes(ga);
  }
  function loadable(s, e) {
    const cfg = s.settings;
    if (e.equipment === "barbell") {
      let vals = /* @__PURE__ */ new Set([Math.round(number(cfg.barWeight, 20) * 100)]);
      for (const p of cfg.plates) {
        const next = /* @__PURE__ */ new Set();
        for (const v of vals) for (let count = 0; count <= Math.min(12, p.pairs); count++) {
          const w = v + Math.round(p.weight * 200) * count;
          if (w <= 1e5) next.add(w);
        }
        vals = next;
      }
      return [...vals].sort((a, b) => a - b).map((v) => v / 100);
    }
    const field = e.type === "bodyweight" ? "addedLoads" : { dumbbell: "dumbbells", cable: "cables", machine: "machines", bodyweight: "addedLoads" }[e.equipment];
    return [...new Set((cfg[field] || cfg.addedLoads).map(Number))].filter((v) => v >= 0 && Number.isFinite(v)).sort((a, b) => a - b);
  }
  function roundWeight(s, e, w, mode = "nearest") {
    var _a, _b;
    const vals = loadable(s, e);
    if (!vals.length) return rounded(Math.max(0, w));
    if (mode === "down") return (_a = vals.filter((v) => v <= w + 1e-3).pop()) != null ? _a : vals[0];
    if (mode === "up") return (_b = vals.find((v) => v >= w - 1e-3)) != null ? _b : vals[vals.length - 1];
    return vals.reduce((best, v) => Math.abs(v - w) < Math.abs(best - w) ? v : best, vals[0]);
  }
  function target(s, e) {
    const t = s.targets[e.id] || { weight: null, reps: e.min };
    return { weight: roundWeight(s, e, t.weight === null ? e.suggested : t.weight), reps: Math.max(e.min, Math.min(e.max, number(t.reps, e.min))), configured: t.weight !== null };
  }
  function rest(s, e) {
    return e.rest === null || e.rest === void 0 ? s.settings.rest : e.rest;
  }
  function makeEntries(s, selected) {
    return s.exercises.filter((e) => e.active && e.primary && selected.includes(e.block)).sort((a, b) => a.order - b.order).map((e) => {
      const t = target(s, e);
      return { id: uid(), exerciseId: e.id, sourceId: e.id, pairGroup: e.group, sets: e.sets, targetWeight: t.weight, targetReps: t.reps, skipped: false };
    });
  }
  function planEntries(s, entries, records = []) {
    const pending = entries.filter((en) => !en.skipped).map((en) => {
      const e = ex(s, en.exerciseId);
      if (!e) return null;
      const done = records.filter((r) => !r.warmup && r.entryId === en.id).length;
      return __spreadProps(__spreadValues(__spreadValues({}, e), en), { id: e.id, entryId: en.id, remaining: Math.max(0, en.sets - done), done });
    }).filter((e) => e && e.remaining > 0).sort((a, b) => Number(b.compound) - Number(a.compound) || a.order - b.order);
    const groups = [];
    const pool = [...pending];
    while (pool.length) {
      const a = pool.shift();
      let group = [a];
      const candidates = pool.filter((b) => canPair(s, a, b)).sort((b, c) => Number(c.remaining === a.remaining) - Number(b.remaining === a.remaining) || Math.abs(a.remaining - b.remaining) - Math.abs(a.remaining - c.remaining) || Number(c.compound) - Number(b.compound) || b.order - c.order);
      if (candidates.length) {
        group.push(candidates[0]);
        pool.splice(pool.indexOf(candidates[0]), 1);
      }
      if (s.settings.triples && group.length === 2) {
        const c = pool.filter((x) => group.every((g) => canPair(s, g, x))).sort((b, c2) => Number(c2.remaining === a.remaining) - Number(b.remaining === a.remaining) || b.order - c2.order)[0];
        if (c) {
          group.push(c);
          pool.splice(pool.indexOf(c), 1);
        }
      }
      groups.push(group);
    }
    const queue = [];
    let warmupSeconds = 0;
    for (let g = 0; g < groups.length; g++) {
      const group = groups[g];
      for (const e of group) {
        if (s.settings.warmups && e.warmup && e.done === 0) {
          const ramps = [[0.4, 8], [0.6, 5], [0.8, 3]];
          for (let wi = 0; wi < ramps.length; wi++) {
            if (records.some((r) => r.warmup && r.entryId === e.entryId && r.setIndex === wi + 1)) continue;
            const weight = roundWeight(s, e, e.targetWeight * ramps[wi][0], "down");
            const task = {
              id: uid(),
              entryId: e.entryId,
              exerciseId: e.id,
              setIndex: wi + 1,
              sets: 3,
              warmup: true,
              weight,
              reps: ramps[wi][1],
              min: e.min,
              max: e.max,
              kind: "warmup",
              group: g,
              restAfter: s.settings.warmupRest
            };
            queue.push(task);
            warmupSeconds += task.reps * 3 + task.restAfter;
          }
        }
      }
      const rounds = Math.max(...group.map((e) => e.remaining));
      for (let r = 0; r < rounds; r++) {
        const active = group.filter((e) => r < e.remaining);
        for (let i = 0; i < active.length; i++) {
          const e = active[i];
          const last = i === active.length - 1;
          queue.push({
            id: uid(),
            entryId: e.entryId,
            exerciseId: e.id,
            setIndex: e.done + r + 1,
            sets: e.sets,
            warmup: false,
            weight: e.targetWeight,
            reps: e.targetReps,
            min: e.min,
            max: e.max,
            kind: group.length === 3 ? "triple" : group.length === 2 ? "superset" : "straight",
            transition: !last,
            group: g,
            restAfter: last ? Math.max(...active.map((x) => rest(s, x))) : s.settings.transition
          });
        }
      }
    }
    const workSeconds = queue.reduce((a, t) => a + (ex(s, t.exerciseId).type === "timed" && !t.warmup ? t.reps : t.reps * 3), 0);
    const seconds = queue.reduce((a, t) => a + t.restAfter, workSeconds) + pending.length * 10;
    const straightSeconds = pending.reduce((a, e) => a + e.remaining * ((e.type === "timed" ? e.targetReps : e.targetReps * 3) + rest(s, e)), warmupSeconds) + pending.length * 10;
    return { queue, groups: groups.map((g) => g.map((e) => e.entryId)), seconds, straightSeconds, savedSeconds: Math.max(0, straightSeconds - seconds), workingSets: pending.reduce((a, e) => a + e.remaining, 0) };
  }
  function plan(s, selected, budget = null) {
    let entries = makeEntries(s, selected);
    let result = planEntries(s, entries);
    const dropped = [];
    if (budget && budget > 0) {
      while (result.seconds > budget * 60 && entries.length > 1) {
        const candidates = [...entries].sort((a, b) => {
          const ea = ex(s, a.exerciseId), eb = ex(s, b.exerciseId);
          return Number(ea.compound) - Number(eb.compound) || eb.priority - ea.priority || eb.order - ea.order;
        });
        const drop = candidates[0];
        entries = entries.filter((x) => x.id !== drop.id);
        dropped.push(drop.exerciseId);
        result = planEntries(s, entries);
      }
    }
    return __spreadProps(__spreadValues({}, result), { entries, dropped, overBudget: !!budget && result.seconds > budget * 60 });
  }
  function newSession(s, planned) {
    return {
      id: uid(),
      startedAt: Date.now(),
      endedAt: null,
      blocks: clone(s.settings.selectedBlocks),
      entries: clone(planned.entries),
      queue: clone(planned.queue),
      records: [],
      timer: null,
      pendingLogId: null,
      note: "",
      estimateSeconds: planned.seconds,
      straightSeconds: planned.straightSeconds,
      dropped: planned.dropped || [],
      exerciseSnapshot: Object.fromEntries(s.exercises.map((e) => [e.id, clone(e)]))
    };
  }
  function bodyweight(s, at = Date.now()) {
    var _a, _b;
    return (_b = (_a = s.bodyweights.filter((b) => b.date <= localDate(at)).sort((a, b) => b.date.localeCompare(a.date))[0]) == null ? void 0 : _a.weight) != null ? _b : null;
  }
  function completeSet(s) {
    const session = s.session;
    if (!session || !session.queue.length) return null;
    const task = session.queue.shift(), e = ex(s, task.exerciseId);
    const rec = __spreadProps(__spreadValues({}, clone(task)), {
      id: uid(),
      task: clone(task),
      at: Date.now(),
      weight: task.weight,
      reps: task.reps,
      confirmed: false,
      rir: null,
      note: "",
      failed: false,
      bodyweight: bodyweight(s)
    });
    session.records.push(rec);
    session.pendingLogId = rec.id;
    session.timer = { deadline: Date.now() + task.restAfter * 1e3, total: task.restAfter, kind: task.warmup ? "warmup" : task.transition ? "transition" : "rest" };
    return rec;
  }
  function undoSet(s) {
    const session = s.session;
    if (!session || !session.records.length) return false;
    const rec = session.records.pop();
    const en = session.entries.find((x) => x.id === rec.entryId);
    if (en && !en.skipped) session.queue.unshift(clone(rec.task));
    session.pendingLogId = null;
    session.timer = null;
    return true;
  }
  function fullRecords(session, id) {
    const en = session.entries.find((e) => e.exerciseId === id);
    if (!en) return null;
    const recs = session.records.filter((r) => r.exerciseId === id && !r.warmup && r.confirmed);
    if (recs.length < en.sets) return null;
    return { entry: en, records: recs.slice(0, en.sets) };
  }
  function exerciseHistory(s, id) {
    return s.sessions.filter((x) => fullRecords(x, id)).sort((a, b) => a.startedAt - b.startedAt).map((x) => __spreadValues({ session: x }, fullRecords(x, id)));
  }
  function lastRecords(s, id) {
    return [...s.sessions].sort((a, b) => b.startedAt - a.startedAt).map((x) => x.records.filter((r) => r.exerciseId === id && !r.warmup && r.confirmed)).find((r) => r.length) || [];
  }
  function missed(e, records) {
    return records.filter((r) => {
      var _a;
      return r.reps < ((_a = r.min) != null ? _a : e.min) || r.failed;
    }).length >= Math.ceil(records.length / 2);
  }
  function suggestion(s, e, session) {
    const current = fullRecords(session, e.id);
    if (!current) return null;
    const { entry, records } = current;
    const base = entry.targetWeight;
    const reps = entry.targetReps;
    const prev = exerciseHistory(s, e.id).filter((x) => x.session.id !== session.id && x.session.startedAt < session.startedAt).pop();
    const obj = { sessionId: session.id, exerciseId: e.id, weight: base, reps, kind: "hold", accepted: false, reason: "Repeat this load and build clean reps." };
    if (missed(e, records)) {
      if (prev && missed(e, prev.records)) {
        obj.kind = "deload";
        obj.weight = roundWeight(s, e, base * 0.9, "down");
        obj.reps = e.min;
        obj.reason = "Below the minimum on at least half your sets twice in a row. Consider a 10% deload.";
        if (obj.weight >= base) obj.reason += " Your equipment cannot load a lighter weight; use an easier variation.";
      } else obj.reason = "Minimum missed. Repeat this load; skipped and incomplete exercises never count as misses.";
      return obj;
    }
    const isTop = records.every((r) => r.reps >= e.max && !r.failed && r.weight >= base);
    if (e.type === "timed" && e.id !== "farmer-carries" && e.max > e.min) {
      if (records.every((r) => r.reps >= reps) && reps < e.max) {
        obj.kind = "time";
        obj.reps = Math.min(e.max, reps + 5);
        obj.reason = "All timed sets completed. Add 5 seconds next session.";
        return obj;
      }
      if (!isTop) {
        obj.reason = "Keep this duration until every set is complete.";
        return obj;
      }
      obj.kind = "variation";
      obj.reason = "Time ceiling reached. Add load or choose a harder variation.";
      return obj;
    }
    if (!isTop) {
      const minDone = Math.min(...records.map((r) => r.reps));
      obj.reps = Math.min(e.max, Math.max(e.min, Math.min(reps + 1, minDone + 1)));
      obj.kind = obj.reps > reps ? "reps" : "hold";
      obj.reason = "Keep the load. Aim for " + obj.reps + (e.type === "timed" ? " seconds" : " reps") + " on every set.";
      return obj;
    }
    obj.reps = e.max;
    const previousHeld = prev && prev.entry.targetWeight === base && prev.records.every((r) => r.reps >= e.max && r.weight >= base) && prev.records.some((r) => r.rir === 0);
    if (records.some((r) => r.rir === 0) && !previousHeld) {
      obj.reason = "Top of range, but 0 reps in reserve. Hold this load for one more session.";
      return obj;
    }
    const double = e.type !== "timed" && records.every((r) => r.reps >= e.max + 2);
    const inc = e.increment * (double ? 2 : 1);
    let load = Math.min(...records.map((r) => r.weight));
    const bw = e.type === "bodyweight" ? bodyweight(s, session.startedAt) : 0;
    if (load === 0 && (!bw || bw === 0)) {
      obj.kind = "variation";
      obj.weight = roundWeight(s, e, e.increment, "up");
      obj.reps = e.min;
      obj.reason = "All sets at the top. Consider added load or a harder variation. Log body weight to enforce the 5% total-load cap.";
      return obj;
    }
    const cap = load + (load + (bw || 0)) * s.settings.safeJump / 100;
    const desired = load + inc;
    const next = loadable(s, e).filter((w) => w > load + 1e-3 && w <= cap + 1e-3 && w <= desired + 1e-3).pop();
    if (next === void 0) {
      obj.weight = load;
      obj.reason = "Top of range reached, but the next loadable step exceeds your " + s.settings.safeJump + "% safe-jump cap. Edit the target to override.";
      return obj;
    }
    obj.kind = "raise";
    obj.weight = next;
    obj.reps = e.min;
    obj.reason = (double ? "Every set beat the ceiling by 2+ reps. Double increment, capped at " + s.settings.safeJump + "%." : "Every set reached the top of the range. Raise to the next safe, loadable weight.") + (e.type === "bodyweight" ? " Added weight; total load includes your body weight." : "");
    return obj;
  }
  function finishSession(s) {
    const session = s.session;
    if (!session) return null;
    session.records.forEach((r) => {
      r.confirmed = true;
      r.failed = r.failed || !r.warmup && r.reps < (r.min || ex(s, r.exerciseId).min);
    });
    session.endedAt = Date.now();
    session.durationSeconds = Math.max(0, Math.round((session.endedAt - session.startedAt) / 1e3));
    session.timer = null;
    session.pendingLogId = null;
    session.queue = [];
    session.records.forEach((r) => {
      delete r.task;
    });
    session.exerciseSnapshot = Object.fromEntries(session.entries.map((en) => [en.exerciseId, session.exerciseSnapshot[en.exerciseId]]));
    s.sessions.push(clone(session));
    for (const en of session.entries) {
      const e = ex(s, en.exerciseId);
      const sug = e && suggestion(s, e, session);
      if (sug) s.suggestions[e.id] = sug;
    }
    s.session = null;
    return session;
  }
  function accept(s, id, weight = null, reps = null) {
    const sug = s.suggestions[id];
    if (!sug) return false;
    s.targets[id] = { weight: weight === null ? sug.weight : weight, reps: reps === null ? sug.reps : reps };
    sug.accepted = true;
    return true;
  }
  function substitute(s, entryId) {
    const sess = s.session, en = sess == null ? void 0 : sess.entries.find((x) => x.id === entryId);
    if (!en) return { error: "No exercise to replace." };
    const original = ex(s, en.sourceId);
    const candidates = original.substitutes || [];
    const used = new Set(sess.entries.map((x) => x.exerciseId));
    const next = candidates.find((id) => {
      var _a;
      return !used.has(id) && ((_a = ex(s, id)) == null ? void 0 : _a.active);
    });
    if (!next) return { error: "No unused substitutes left. Edit the substitute list or skip today." };
    en.skipped = true;
    const e = ex(s, next), t = target(s, e);
    const replacement = {
      id: uid(),
      exerciseId: e.id,
      sourceId: en.sourceId,
      pairGroup: en.pairGroup,
      sets: e.sets,
      targetWeight: t.weight,
      targetReps: t.reps,
      skipped: false
    };
    sess.entries.push(replacement);
    sess.exerciseSnapshot[e.id] = clone(e);
    sess.queue = planEntries(s, sess.entries, sess.records).queue;
    return { exercise: e, entry: replacement, needsWeight: !t.configured };
  }
  function skip(s, entryId) {
    const en = s.session.entries.find((x) => x.id === entryId);
    if (!en) return;
    en.skipped = true;
    s.session.queue = planEntries(s, s.session.entries, s.session.records).queue;
  }
  function actualLoad(r, e) {
    return r.weight + (e.type === "bodyweight" && r.bodyweight ? r.bodyweight : 0);
  }
  function epley(weight, reps) {
    return weight > 0 && reps > 0 ? weight * (1 + reps / 30) : 0;
  }
  function stats(s, id) {
    const e = ex(s, id);
    const hist = s.sessions.map((session) => ({ session, records: session.records.filter((r) => r.exerciseId === id && !r.warmup && r.confirmed) })).filter((x) => x.records.length).sort((a, b) => a.session.startedAt - b.session.startedAt);
    const points = hist.map(({ session, records }) => {
      var _a;
      const original = ((_a = session.exerciseSnapshot) == null ? void 0 : _a[id]) || e;
      return {
        date: session.endedAt || session.startedAt,
        weight: Math.max(...records.map((r) => r.weight)),
        reps: Math.max(...records.map((r) => r.reps)),
        e1rm: original.type === "timed" ? 0 : Math.max(...records.map((r) => epley(actualLoad(r, original), r.reps))),
        volume: records.reduce((a, r) => a + actualLoad(r, original) * r.reps, 0),
        seconds: original.type === "timed" ? Math.max(...records.map((r) => r.reps)) : 0
      };
    });
    return {
      points,
      prWeight: Math.max(0, ...points.map((p) => p.weight)),
      prReps: Math.max(0, ...points.map((p) => p.reps)),
      pr1rm: Math.max(0, ...points.map((p) => p.e1rm)),
      prVolume: Math.max(0, ...points.map((p) => p.volume))
    };
  }
  function stalled(s) {
    return s.exercises.filter((e) => {
      const h = exerciseHistory(s, e.id).slice(-s.settings.stallSessions);
      if (h.length < s.settings.stallSessions) return false;
      const score = ({ records }) => Math.max(...records.map((r) => e.type === "timed" ? r.reps * Math.max(1, r.weight) : actualLoad(r, e) > 0 ? epley(actualLoad(r, e), r.reps) : r.reps));
      const first = score(h[0]);
      return h.slice(1).every((x) => score(x) <= first + 1e-3);
    });
  }
  function weeklyVolume(s, now = Date.now()) {
    const out = {};
    for (const e of s.exercises) out[e.muscle] = 0;
    for (const sess of s.sessions.filter((x) => (x.endedAt || x.startedAt) >= now - 7 * 864e5)) {
      for (const r of sess.records.filter((r2) => !r2.warmup && r2.confirmed)) {
        const e = ex(s, r.exerciseId);
        if (e) out[e.muscle] = (out[e.muscle] || 0) + 1;
      }
    }
    return out;
  }
  function localDate(time = Date.now()) {
    const d = new Date(time);
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function streak(s) {
    const days = new Set(s.sessions.filter((x) => x.records.some((r) => !r.warmup && r.confirmed)).map((x) => localDate(x.endedAt || x.startedAt)));
    let d = /* @__PURE__ */ new Date();
    d.setHours(12, 0, 0, 0);
    if (!days.has(localDate(d))) d.setDate(d.getDate() - 1);
    let count = 0;
    while (days.has(localDate(d))) {
      count++;
      d.setDate(d.getDate() - 1);
    }
    return count;
  }
  function validate(s) {
    const fail = (msg) => {
      throw new Error("Invalid backup: " + msg);
    };
    if (!s || s.version !== 1) fail("unsupported version");
    if (!Array.isArray(s.exercises) || s.exercises.length < 1 || s.exercises.length > 1e3) fail("exercise list");
    const ids = /* @__PURE__ */ new Set();
    const finite = (n, lo, hi) => typeof n === "number" && Number.isFinite(n) && n >= lo && n <= hi;
    for (const e of s.exercises) {
      if (typeof e.id !== "string" || !/^[a-zA-Z0-9_-]{1,80}$/.test(e.id) || ["__proto__", "constructor", "prototype"].includes(e.id) || ids.has(e.id)) fail("exercise IDs");
      ids.add(e.id);
      if (typeof e.name !== "string" || !e.name.trim() || e.name.length > 200 || typeof e.muscle !== "string" || !e.muscle.trim() || e.muscle.length > 80 || typeof e.note !== "string" || e.note.length > 2e3 || !["chest", "back", "legs", "abs", "shoulders", "forearms"].includes(e.block) || !Number.isFinite(e.order) || !["weighted", "bodyweight", "timed"].includes(e.type) || !Object.keys(GROUPS).includes(e.group) || !["barbell", "dumbbell", "cable", "machine", "bodyweight"].includes(e.equipment)) fail("exercise fields");
      if (!Number.isInteger(e.sets) || !Number.isInteger(e.min) || !Number.isInteger(e.max) || !finite(e.sets, 1, 20) || !finite(e.min, 1, 3600) || !finite(e.max, e.min, 3600) || !finite(e.increment, 0.01, 100) || !finite(e.priority, 1, 3)) fail("ranges");
      if (e.rest !== null && !finite(e.rest, 0, 1800)) fail("rest");
      if (e.equipmentTag !== void 0 && (typeof e.equipmentTag !== "string" || e.equipmentTag.length > 120)) fail("equipment tag");
      if (!Array.isArray(e.substitutes) || e.substitutes.some((x) => typeof x !== "string")) fail("substitutes");
    }
    for (const e of s.exercises) if (e.substitutes.some((id) => !ids.has(id) || id === e.id)) fail("unknown substitute");
    if (!s.settings || !s.targets || Array.isArray(s.targets) || !s.pairOverrides || Array.isArray(s.pairOverrides) || !s.suggestions || Array.isArray(s.suggestions) || !Array.isArray(s.sessions) || s.sessions.length > 1e4 || !Array.isArray(s.bodyweights)) fail("missing data");
    for (const id of ids) {
      const t = s.targets[id];
      if (!t || t.weight !== null && !finite(t.weight, 0, 1e3) || !Number.isInteger(t.reps) || !finite(t.reps, 1, 3600)) fail("targets");
    }
    for (const [k, v] of Object.entries(s.pairOverrides)) {
      const pair = k.split("|");
      if (pair.length !== 2 || pair.some((id) => !ids.has(id)) || typeof v !== "boolean") fail("pairing override");
    }
    for (const [id, q] of Object.entries(s.suggestions)) if (!ids.has(id) || !q || q.exerciseId !== id || !["hold", "raise", "reps", "time", "deload", "variation"].includes(q.kind) || !finite(q.weight, 0, 1e3) || !finite(q.reps, 1, 3600) || typeof q.reason !== "string" || typeof q.accepted !== "boolean") fail("progression suggestion");
    const cfg = s.settings;
    for (const f of ["keepAwake", "sound", "vibrate", "warmups", "triples", "effort"]) if (typeof cfg[f] !== "boolean") fail("training preferences");
    for (const field of ["dumbbells", "cables", "machines", "addedLoads"]) if (!Array.isArray(cfg[field]) || !cfg[field].length || cfg[field].length > 1e3 || cfg[field].some((x) => !finite(x, 0, 1e3))) fail("equipment weights");
    if (!Array.isArray(cfg.plates) || cfg.plates.length > 20 || cfg.plates.some((p) => !finite(p.weight, 0.1, 100) || !Number.isInteger(p.pairs) || p.pairs < 0 || p.pairs > 12) || !finite(cfg.barWeight, 0, 100)) fail("plates");
    for (const f of ["rest", "transition", "warmupRest"]) if (!finite(cfg[f], 0, 1800)) fail("timer settings");
    if (!finite(cfg.safeJump, 0, 100) || !finite(cfg.stallSessions, 2, 20) || !Array.isArray(cfg.selectedBlocks) || cfg.selectedBlocks.some((id) => !["chest", "back", "legs", "abs", "shoulders", "forearms"].includes(id)) || cfg.budget !== null && !finite(cfg.budget, 5, 240) || !cfg.reminders || !Array.isArray(cfg.reminders.days) || cfg.reminders.days.some((d) => !Number.isInteger(d) || d < 0 || d > 6) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(cfg.reminders.time)) fail("settings");
    for (const b of s.bodyweights) if (!finite(b.weight, 1, 500) || !/^\d{4}-\d{2}-\d{2}$/.test(b.date) || !Number.isFinite((/* @__PURE__ */ new Date(b.date + "T12:00:00")).getTime())) fail("bodyweight log");
    for (const sess of [...s.sessions, ...s.session ? [s.session] : []]) {
      if (!sess || typeof sess.id !== "string" || !/^[a-zA-Z0-9_-]{1,100}$/.test(sess.id) || !Array.isArray(sess.blocks) || sess.blocks.some((id) => !["chest", "back", "legs", "abs", "shoulders", "forearms"].includes(id)) || !finite(sess.startedAt, 0, 1e14) || !Array.isArray(sess.entries) || !Array.isArray(sess.records) || !Array.isArray(sess.queue)) fail("session");
      for (const en of sess.entries) if (!ids.has(en.exerciseId) || !ids.has(en.sourceId) || !Number.isInteger(en.sets) || !finite(en.sets, 1, 20) || typeof en.id !== "string" || !/^[a-zA-Z0-9_-]{1,100}$/.test(en.id) || typeof en.skipped !== "boolean" || !finite(en.targetWeight, 0, 1e3) || !finite(en.targetReps, 1, 3600)) fail("session exercise");
      for (const r of [...sess.records, ...sess.queue]) if (!ids.has(r.exerciseId) || !finite(r.weight, 0, 1e3) || !finite(r.reps, 0, 3600) || typeof r.entryId !== "string" || !/^[a-zA-Z0-9_-]{1,100}$/.test(r.entryId) || !sess.entries.some((en) => en.id === r.entryId)) fail("set data");
      for (const r of sess.records) if (typeof r.confirmed !== "boolean" || typeof r.warmup !== "boolean" || r.rir !== null && (!Number.isInteger(r.rir) || r.rir < 0 || r.rir > 3) || typeof r.note !== "string") fail("logged set");
      if (sess === s.session && sess.records.some((r) => !r.task || typeof r.task.exerciseId !== "string")) fail("active set undo data");
      if (sess.pendingLogId !== null && !sess.records.some((r) => r.id === sess.pendingLogId)) fail("pending log");
      if (sess.timer && (!finite(sess.timer.deadline, 0, 1e14) || !finite(sess.timer.total, 0, 86400))) fail("active timer");
    }
    return true;
  }
  const api = { GROUPS, clone, uid, ex, key, canPair, loadable, roundWeight, target, rest, makeEntries, planEntries, plan, newSession, bodyweight, completeSet, undoSet, fullRecords, exerciseHistory, lastRecords, suggestion, finishSession, accept, substitute, skip, actualLoad, epley, stats, stalled, weeklyVolume, localDate, streak, validate };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.ForgeEngine = api;
})(typeof window !== "undefined" ? window : globalThis);
(function(root) {
  "use strict";
  const native = typeof root.Native !== "undefined";
  const store = { native, error: null, state: null };
  try {
    const raw = native ? root.Native.loadState() : localStorage.getItem("forge.workout.v1");
    if (raw) {
      const parsed = JSON.parse(raw);
      root.ForgeEngine.validate(parsed);
      store.state = parsed;
    }
  } catch (e) {
    store.error = e.message;
  }
  if (!store.state) store.state = root.ForgeSeed.createState();
  store.save = function() {
    store.state.updatedAt = Date.now();
    const raw = JSON.stringify(store.state);
    if (native) {
      const result = root.Native.saveState(raw);
      if (result !== "ok") throw new Error(result || "SQLite save failed");
    } else localStorage.setItem("forge.workout.v1", raw);
  };
  store.permissions = function() {
    if (!native) return { notifications: false, exact: false, native: false };
    try {
      return JSON.parse(root.Native.permissions());
    } catch (e) {
      return { native: true, notifications: false, exact: false };
    }
  };
  root.ForgeStore = store;
})(window);
(function(root) {
  "use strict";
  const E = root.ForgeEngine, Store = root.ForgeStore, Seed = root.ForgeSeed;
  const paths = {
    home: "M3 10.5 12 3l9 7.5M5 9v11h5v-6h4v6h5V9",
    workout: "M3 9v6m3-9v12m12-12v12m3-9v6M6 12h12",
    chart: "M4 4v16h16M8 15l4-4 4 2 4-6",
    history: "M8 3v4m8-4v4M4 9h16M6 5h12a2 2 0 0 1 2 2v13H4V7a2 2 0 0 1 2-2M8 13h2m4 0h2m-8 4h2",
    library: "M4 4h6v16H4zM10 4h5v16h-5M17 5l3-1 3 15-3 1z",
    settings: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8M9 3h6l.5 3 2 1 3-.8 2.5 5-2.5 2v2l2.5 2-2.5 5-3-.8-2 1-.5 3H9l-.5-3-2-1-3 .8-2.5-5L3.5 13v-2L1 9l2.5-5 3 .8 2-1z",
    arrow: "M5 12h14m-6-6 6 6-6 6",
    chevron: "m9 5 7 7-7 7",
    left: "m15 5-7 7 7 7",
    check: "m5 12 4 4 10-10",
    close: "m6 6 12 12M18 6 6 18",
    plus: "M12 5v14M5 12h14",
    minus: "M5 12h14",
    clock: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18M12 7v5l3 2",
    timer: "M9 2h6M12 5a8 8 0 1 0 0 16 8 8 0 0 0 0-16M12 9v4l3 2m3-9 2-2",
    shield: "m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6z m-4 9 3 3 5-6",
    bolt: "m13 2-8 12h6l-1 8 9-13h-6z",
    fire: "M13 3s0 5-3 7c-2-2-3-3-3-3s-5 6-3 11c2 5 11 5 15 0 4-6-3-12-6-15zM10 15c-2 3-1 5 2 5s4-3 2-5l-1 2z",
    layers: "m12 3 9 5-9 5-9-5zM3 12l9 5 9-5M3 16l9 5 9-5",
    scale: "M4 8a8 8 0 0 1 16 0v12H4zM8 8h8m-4 0 2-3",
    edit: "m16 3 5 5-12 12H4v-5zM13 6l5 5",
    undo: "M8 4 3 9l5 5M3 9h10a7 7 0 0 1 0 14",
    swap: "M4 7h16m-4-4 4 4-4 4M20 17H4m4-4-4 4 4 4",
    skip: "m5 5 11 7-11 7zM19 5v14",
    bell: "M18 8a6 6 0 0 0-12 0v7l-2 3h16l-2-3zM10 21h4",
    download: "M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5",
    upload: "M12 16V4m-5 5 5-5 5 5M4 16v5h16v-5",
    search: "M10.5 3a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15m5.5 13 5 5",
    info: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18M12 11v6m0-10h.01",
    trophy: "M7 3h10v7a5 5 0 0 1-10 0zM7 5H3v3a4 4 0 0 0 4 4m10-7h4v3a4 4 0 0 1-4 4M12 15v6m-4 0h8",
    note: "M5 3h14v18H5zM8 7h8m-8 4h8m-8 4h5",
    eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7m10-3a3 3 0 1 0 0 6 3 3 0 0 0 0-6",
    trash: "M4 6h16M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7m4-7v7",
    bench: "M4 4v7m3-9v11m10-11v11m3-9v7M7 7h10M4 17h13m-10 0v4m9-4v4",
    pull: "M3 3h18M5 3v18m14-18v18M8 8l4 3 4-3m-4 3v6m-4 4 4-4 4 4",
    legs: "M10 3h4l1 8-3 3-3-3zM9 11l-3 8H3m12-8 3 8h3M12 14v7",
    abs: "M8 3h8l3 5-2 13H7L5 8zM12 6v13M9 9h6m-6 4h6m-6 4h6",
    shoulders: "M5 19v-8l-2-3 4-4h3m4 0h3l4 4-2 3v8M8 4l4 5 4-5M8 12h8m-4-3v10",
    grip: "M5 13V8a2 2 0 0 1 4 0v6-9a2 2 0 0 1 4 0v9-7a2 2 0 0 1 4 0v7-4a2 2 0 0 1 4 0v7c0 4-4 6-8 6-5 0-7-2-9-5l-2-4a2 2 0 0 1 3-2l3 3"
  };
  const A = { E, Store, Seed, pages: {}, ui: { route: Store.state.session ? "session" : "today", planned: null, libraryBlock: "all", search: "", showSubs: false, showArchived: false, progressExercise: "bench-press", chartMode: "weight", previewBlock: "all", calendar: /* @__PURE__ */ new Date(), historyDate: null, modal: null, lastCommitted: null }, s: () => Store.state };
  A.escape = (v) => String(v != null ? v : "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  A.icon = (name, cls = "") => '<svg class="icon '.concat(cls, '" viewBox="0 0 24 24" aria-hidden="true"><path d="').concat(paths[name] || paths.workout, '"/></svg>');
  A.kg = (v) => v === null || v === void 0 ? "—" : Number(v).toLocaleString(void 0, { maximumFractionDigits: 2 });
  A.time = (v) => {
    const sec = Math.max(0, Math.ceil(v));
    return "".concat(Math.floor(sec / 60), ":").concat(String(sec % 60).padStart(2, "0"));
  };
  A.minutes = (v) => Math.max(1, Math.round(v / 60));
  A.actualMinutes = (v) => v < 60 ? "<1" : Math.round(v / 60);
  A.savedMinutes = (v) => Math.max(0, Math.round(v / 60));
  A.date = (v, opts = { month: "short", day: "numeric" }) => new Date(v).toLocaleDateString("en-GB", opts);
  A.fullDate = (v) => A.date(v, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  A.block = (id) => Seed.blocks.find((b) => b.id === id);
  A.load = (e, w, r) => "".concat(e.equipment === "bodyweight" ? w ? "+" + A.kg(w) + " kg" : "Bodyweight" : A.kg(w) + " kg", " × ").concat(r).concat(e.type === "timed" ? " sec" : " reps");
  A.metric = (icon, value, label, suffix = "") => '<div class="metric"><div class="between"><span class="metric-label">'.concat(label, '</span><span class="metric-icon">').concat(A.icon(icon, "sm"), '</span></div><div class="metric-value">').concat(value, "<span>").concat(suffix, "</span></div></div>");
  A.empty = (icon, title, copy, action = "") => '<div class="card empty-state"><div class="empty-icon">'.concat(A.icon(icon, "lg"), "</div><h3>").concat(title, "</h3><p>").concat(copy, "</p>").concat(action, "</div>");
  A.switch = (key, label, desc = "") => '<div class="setting-row"><div><strong>'.concat(label, "</strong><small>").concat(desc, '</small></div><button class="switch ').concat(A.s().settings[key] ? "on" : "", '" role="switch" aria-checked="').concat(A.s().settings[key], '" aria-label="').concat(label, '" data-action="setting-toggle" data-key="').concat(key, '"></button></div>');
  A.chart = (points, field, color = "#ff795b", bars = false) => {
    if (!points.length) return '<div class="chart-blank">Your first session draws the first line.</div>';
    const p = points.slice(-12), w = 500, h = 166, x0 = 43, y0 = 12, ww = 440, hh = 120;
    const max = Math.max(...p.map((x) => x[field]), 1) * 1.12;
    const X = (i) => x0 + (p.length === 1 ? ww / 2 : i * ww / (p.length - 1));
    const Y = (v) => y0 + hh * (1 - v / max);
    let out = '<svg viewBox="0 0 '.concat(w, " ").concat(h, '" role="img" aria-label="').concat(field, " over your last ").concat(p.length, ' sessions">');
    for (let i = 0; i < 4; i++) {
      const v = max * i / 3, y = Y(v);
      out += '<line x1="'.concat(x0, '" x2="').concat(x0 + ww, '" y1="').concat(y, '" y2="').concat(y, '" stroke="#ffffff08"/><text x="').concat(x0 - 9, '" y="').concat(y + 3, '" text-anchor="end">').concat(Math.round(v), "</text>");
    }
    if (bars) {
      p.forEach((v, i) => {
        const bw = Math.min(26, ww / p.length * 0.5);
        out += '<rect x="'.concat(X(i) - bw / 2, '" y="').concat(Y(v[field]), '" width="').concat(bw, '" height="').concat(Math.max(2, y0 + hh - Y(v[field])), '" rx="4" fill="').concat(color, '" opacity=".7"><title>').concat(A.date(v.date), ": ").concat(A.kg(v[field]), "</title></rect>");
      });
    } else {
      const pts = p.map((v, i) => "".concat(X(i), ",").concat(Y(v[field]))).join(" ");
      out += '<defs><linearGradient id="area-'.concat(field, '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="').concat(color, '" stop-opacity=".2"/><stop offset="1" stop-color="').concat(color, '" stop-opacity="0"/></linearGradient></defs><polygon points="').concat(X(0), ",").concat(y0 + hh, " ").concat(pts, " ").concat(X(p.length - 1), ",").concat(y0 + hh, '" fill="url(#area-').concat(field, ')"/><polyline points="').concat(pts, '" fill="none" stroke="').concat(color, '" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>');
      p.forEach((v, i) => out += '<circle cx="'.concat(X(i), '" cy="').concat(Y(v[field]), '" r="3.5" fill="#191a1f" stroke="').concat(color, '" stroke-width="2"><title>').concat(A.date(v.date), ": ").concat(A.kg(v[field]), "</title></circle>"));
    }
    const labels = [.../* @__PURE__ */ new Set([0, Math.floor((p.length - 1) / 2), p.length - 1])];
    labels.forEach((i) => out += '<text x="'.concat(X(i), '" y="157" text-anchor="middle">').concat(A.date(p[i].date), "</text>"));
    return '<div class="chart">' + out + "</svg></div>";
  };
  let toastTimeout;
  A.toast = (text, ms = 3500) => {
    const t = document.getElementById("toast");
    t.textContent = text;
    t.classList.add("show");
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => t.classList.remove("show"), ms);
  };
  A.save = () => {
    var _a;
    try {
      Store.save();
      if (Store.native) root.Native.keepScreenAwake(!!A.s().session && A.s().settings.keepAwake);
      (_a = A.screenAwake) == null ? void 0 : _a.call(A);
    } catch (e) {
      A.toast("Could not save: " + e.message + ". Export a backup now.", 9e3);
      console.error(e);
    }
  };
  A.dialog = (type, title, body, footer = "", data = {}, wide = false) => {
    var _a;
    A.lastFocus = document.activeElement;
    A.ui.modal = { type, data };
    document.getElementById("modal-root").innerHTML = '<div class="modal-shade"><section class="modal '.concat(wide ? "wide" : "", '" role="dialog" aria-modal="true" aria-labelledby="modal-title"><header class="modal-header"><h2 id="modal-title">').concat(title, '</h2><button class="icon-btn" data-action="close-modal" aria-label="Close dialog">').concat(A.icon("close"), '</button></header><div class="modal-body">').concat(body, "</div>").concat(footer ? '<footer class="modal-footer">'.concat(footer, "</footer>") : "", "</section></div>");
    document.body.style.overflow = "hidden";
    (_a = document.querySelector(".modal-header button")) == null ? void 0 : _a.focus();
  };
  A.close = () => {
    var _a, _b;
    document.getElementById("modal-root").innerHTML = "";
    A.ui.modal = null;
    document.body.style.overflow = "";
    (_b = (_a = A.lastFocus) == null ? void 0 : _a.focus) == null ? void 0 : _b.call(_a);
  };
  const navs = [["today", "home", "Overview"], ["session", "workout", "Workout"], ["progress", "chart", "Progress"], ["history", "history", "History"], ["library", "library", "Exercises"], ["settings", "settings", "Settings"]];
  A.render = () => {
    var _a;
    const s = A.s();
    const route = A.ui.route;
    const nav = navs.map(([id, ico, label]) => '<button class="nav-item '.concat(route === id ? "active" : "", '" data-action="nav" data-route="').concat(id, '">').concat(A.icon(ico), "<span>").concat(label, "</span>").concat(id === "session" && s.session ? '<span class="nav-dot"></span>' : "", "</button>")).join("");
    const bottom = navs.map(([id, ico, label]) => '<button class="'.concat(route === id ? "active" : "", '" data-action="nav" data-route="').concat(id, '" aria-label="').concat(label, '">').concat(A.icon(ico), "<span>").concat(id === "today" ? "Today" : id === "session" ? "Train" : id === "library" ? "Library" : label, "</span>").concat(id === "session" && s.session ? '<i class="nav-dot"></i>' : "", "</button>")).join("");
    const page = A.pages[route] ? A.pages[route]() : "";
    document.getElementById("app").innerHTML = '<div class="shell"><aside class="sidebar"><div class="brand"><img src="assets/icon.svg" alt=""><span class="wordmark">FORGE</span><span class="version">01</span></div><div class="nav-caption">YOUR TRAINING</div><nav aria-label="Main navigation">'.concat(nav, '</nav><div class="sidebar-bottom"><div class="privacy-card">').concat(A.icon("shield"), '<h4>Your progress. Yours only.</h4><p>No accounts. No cloud. Just you,<br>getting a little stronger.</p></div><div class="profile"><div class="avatar">YOU</div><div class="grow"><strong>Personal workspace</strong><small>All weights in kilograms</small></div>').concat(A.icon("settings", "sm"), '</div></div></aside><main class="workspace"><header class="topbar"><div class="breadcrumbs"><span class="mobile-brand hidden"><img src="assets/icon.svg" alt="">FORGE</span><span class="crumb-part">Your training</span><span class="crumb-part soft">/</span><b class="crumb-part">').concat((_a = navs.find((x) => x[0] === route)) == null ? void 0 : _a[2], '</b></div><div class="top-actions"><span class="local-status"><i class="dot"></i>On this device</span>').concat(!Store.native ? '<button class="preview-pill" data-action="preview-info">BROWSER PREVIEW</button>' : "", '<span class="date-label">').concat(A.date(Date.now(), { day: "numeric", month: "short", year: "numeric" }), '</span></div></header><div class="content">').concat(page, '<div class="footer-note">').concat(A.icon("shield", "sm"), ' Fully offline. No accounts, ads, or analytics.</div></div></main><nav class="bottom-nav" aria-label="Main navigation">').concat(bottom, "</nav>").concat(s.session && route !== "session" ? '<button class="floating-timer" data-action="nav" data-route="session">'.concat(A.icon(s.session.timer ? "timer" : "workout"), '<span>Workout in progress</span><b id="floating-timer-text">').concat(s.session.timer ? A.time((s.session.timer.deadline - Date.now()) / 1e3) : "Resume", "</b></button>") : "", "</div>");
  };
  A.navigate = (route) => {
    A.ui.route = route;
    A.render();
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  root.ForgeApp = A;
})(window);
(function(root) {
  "use strict";
  const A = root.ForgeApp, E = A.E, h = A.escape, I = A.icon;
  const header = (title, desc = "", action = "", eyebrow = "YOUR NEXT REP STARTS HERE") => '<div class="page-heading"><div><div class="eyebrow">'.concat(eyebrow, "</div><h1>").concat(title, "</h1>").concat(desc ? "<p>".concat(desc, "</p>") : "", "</div>").concat(action, "</div>");
  const heroArt = '<svg class="hero-art" viewBox="0 0 340 260" aria-hidden="true"><defs><linearGradient id="plate" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#615058"/><stop offset="1" stop-color="#211e25"/></linearGradient><linearGradient id="metal" x1="0" x2="0" y1="0" y2="1"><stop stop-color="#908087"/><stop offset="1" stop-color="#332c34"/></linearGradient></defs><circle cx="211" cy="124" r="105" fill="none" stroke="#ff795b0c"/><circle cx="211" cy="124" r="83" fill="none" stroke="#ff795b10"/><path d="M68 233 330 92M111 249 338 126" stroke="#ff795b0c"/><g transform="rotate(-32 205 142)"><rect x="72" y="125" width="230" height="23" rx="9" fill="url(#metal)"/><rect x="105" y="97" width="27" height="88" rx="12" fill="#322b34" stroke="#7c626b"/><rect x="126" y="80" width="35" height="121" rx="13" fill="url(#plate)" stroke="#80646d"/><rect x="235" y="80" width="34" height="121" rx="13" fill="#3b303a" stroke="#735561"/><rect x="218" y="80" width="35" height="121" rx="13" fill="url(#plate)" stroke="#886570"/><rect x="160" y="131" width="57" height="11" rx="4" fill="#9e828a"/><path d="M178 132v10m5-10v10m5-10v10m5-10v10m5-10v10" stroke="#69535f"/><rect x="136" y="99" width="9" height="81" rx="4" fill="#ac817e" opacity=".35"/><rect x="229" y="99" width="9" height="81" rx="4" fill="#bd8c86" opacity=".3"/></g><circle cx="300" cy="48" r="4" fill="#ff795b" opacity=".5"/><path d="M280 219h24m-12-12v24" stroke="#ff795b" opacity=".2"/></svg>';
  A.pages.today = () => {
    const s = A.s(), selected = s.settings.selectedBlocks, p = E.plan(s, selected, s.settings.budget);
    const volume = E.weeklyVolume(s), sets = Object.values(volume).reduce((a, v) => a + v, 0);
    const today = /* @__PURE__ */ new Date(), start = /* @__PURE__ */ new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - (start.getDay() + 6) % 7);
    const thisWeek = s.sessions.filter((x) => (x.endedAt || x.startedAt) >= start.getTime()).length;
    const trained = new Set(s.sessions.filter((x) => x.records.some((r) => !r.warmup && r.confirmed)).map((x) => E.localDate(x.endedAt || x.startedAt)));
    const weekdays = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return '<div class="week-day">'.concat(["M", "T", "W", "T", "F", "S", "S"][i], '<div class="week-circle ').concat(E.localDate(d) === E.localDate() ? "today" : "", " ").concat(trained.has(E.localDate(d)) ? "trained" : "", '">').concat(trained.has(E.localDate(d)) ? I("check", "sm") : d.getDate(), "</div></div>");
    }).join("");
    const pair = p.groups.find((g) => g.length > 1);
    const pairEntries = pair == null ? void 0 : pair.map((id) => p.entries.find((e) => e.id === id));
    const blocks = A.Seed.blocks.map((b) => {
      const list = s.exercises.filter((e) => e.active && e.primary && e.block === b.id);
      return '<button class="block-card '.concat(selected.includes(b.id) ? "selected" : "", '" style="--block-color:').concat(b.color, '" data-action="block-toggle" data-id="').concat(b.id, '" role="checkbox" aria-checked="').concat(selected.includes(b.id), '" aria-label="').concat(b.name, '"><span class="block-check">').concat(selected.includes(b.id) ? I("check", "sm") : "", '</span><span class="block-icon">').concat(I(b.icon), "</span><strong>").concat(b.name, "</strong><small>").concat(list.length, " exercises · ").concat(list.reduce((a, e) => a + e.sets, 0), " sets</small></button>");
    }).join("");
    return header("Make today count.", "Choose your focus. We’ll take care of the next rep.", '<button class="btn ghost sm" data-action="bodyweight">'.concat(I("scale", "sm"), "<span>").concat(E.bodyweight(s) ? A.kg(E.bodyweight(s)) + " kg" : "Log body weight", "</span></button>"), A.date(Date.now(), { weekday: "long", day: "numeric", month: "long" }).toUpperCase()) + "\n  ".concat(s.session ? '<div class="notice success between" style="margin-bottom:20px"><span>'.concat(I("workout", "sm"), ' Your workout is saved. Pick up exactly where you left off.</span><button class="btn secondary sm" data-action="nav" data-route="session">Resume ').concat(I("arrow", "sm"), "</button></div>") : "", '\n  <div class="dashboard-grid"><div class="stack dashboard-main"><section class="hero"><div class="hero-copy"><div class="eyebrow">A LITTLE BETTER. EVERY SESSION.</div><h2>Progress isn’t luck.<br>It’s a <span class="accent">plan.</span></h2><p>Your routine. Smarter supersets. A clear target for every set.</p><div class="hero-badges"><span>').concat(I("bolt", "sm"), " Strength + muscle</span><span>").concat(I("shield", "sm"), " 100% offline</span></div></div>").concat(heroArt, '</section>\n  <div class="metrics">').concat(A.metric("history", thisWeek, "Sessions this week", "sessions")).concat(A.metric("layers", sets, "Working sets · 7 days", "sets")).concat(A.metric("fire", E.streak(s), "Current streak", "days"), '</div>\n  <section><div class="between section-heading"><div><h2>What are we training?</h2><p>Select one or more muscle blocks.</p></div><span class="badge">').concat(selected.length, ' SELECTED</span></div><div class="block-grid">').concat(blocks, '</div><div class="plan-footer"><div class="between budget-row"><label for="time-budget">').concat(I("clock", "sm"), ' Time budget</label><div class="flex gap-sm"><input class="budget-input" id="time-budget" type="number" min="5" max="240" inputmode="numeric" value="').concat(s.settings.budget || "", '" placeholder="∞" aria-label="Time budget in minutes"><span>min</span></div></div><button class="btn primary" data-action="plan-workout" ').concat(!p.entries.length || s.session ? "disabled" : "", "><span>").concat(I("bolt"), "Plan my workout</span><span><small>").concat(p.entries.length, " exercises · ~").concat(p.entries.length ? A.minutes(p.seconds) : 0, " min</small>").concat(I("arrow"), '</span></button></div></section></div>\n  <aside class="stack dashboard-side"><section class="card"><div class="between"><h3>Your week</h3><span class="badge">').concat(A.date(start, { month: "short", day: "numeric" }), '</span></div><p class="muted" style="font-size:10px;margin-top:6px">Consistency is the real personal record.</p><div class="week-days">').concat(weekdays, '</div><hr class="card-rule"><div class="week-summary"><div class="symbol">').concat(I("chart", "sm"), "</div><div><strong>").concat(thisWeek ? thisWeek + " session" + (thisWeek === 1 ? "" : "s") + " in the bank." : "A fresh week. A fresh start.", "</strong><p>").concat(thisWeek ? "Keep showing up for yourself." : "Your first session starts right here.", '</p></div></div></section>\n  <section class="card pair-card"><span class="badge purple">').concat(I("layers", "sm"), ' SMART SUPERSETS</span><h3 style="margin-top:14px">Less waiting.<br>More working.</h3><p class="muted" style="font-size:10px;margin-top:10px">Pair compatible exercises. Keep the heavy lifts first. Make every minute count.</p><div class="pair-visual">').concat(pairEntries ? pairEntries.map((en, i) => '<div class="pair-ex"><span class="pair-letter">'.concat("ABC"[i], "</span><span>").concat(h(E.ex(s, en.exerciseId).name), "</span></div>").concat(i < pairEntries.length - 1 ? '<div class="pair-line"></div>' : "")).join("") : '<div class="pair-ex">' + I("shield", "sm") + "Your selected exercises stay solo.</div>", '</div><div class="saving">').concat(I("clock", "sm")).concat(p.savedSeconds ? "~" + A.minutes(p.savedSeconds) + " min saved with this selection" : "Only pairings you allow. No shortcuts.", '</div></section>\n  <section class="card quote-card"><p>“The goal isn’t to lift more than someone else. It’s to do a little more than last time.”</p><small>The progressive overload principle</small></section></aside></div>');
  };
  A.pages.session = () => {
    const s = A.s();
    if (!s.session) return A.ui.planned ? renderPlan() : header("Ready when you are.", "Build today’s workout from your own routine.", "", "THE TRAINING FLOOR") + A.empty("workout", "One plan. One set at a time.", "Select your muscle blocks, set an optional time budget, and let Forge arrange your session.", '<button class="btn primary" data-action="nav" data-route="today">Choose today’s focus '.concat(I("arrow"), "</button>"));
    const session = s.session, t = session.queue[0], pending = session.records.find((r) => r.id === session.pendingLogId);
    const completed = session.records.filter((r) => !r.warmup).length, total = completed + session.queue.filter((r) => !r.warmup).length;
    const timer = session.timer;
    const seconds = timer ? Math.max(0, Math.ceil((timer.deadline - Date.now()) / 1e3)) : 0;
    let main = "";
    if (timer) {
      const e = t ? E.ex(s, t.exerciseId) : null;
      main += '<section class="card timer-card"><div class="between"><span class="badge orange">'.concat(I("timer", "sm"), " ").concat(timer.kind === "transition" ? "TRANSITION" : timer.kind === "warmup" ? "WARM-UP REST" : "REST IS RUNNING", '</span><span class="soft" style="font-size:9px">Starts at the tap. Always.</span></div><div class="timer-main"><div class="timer-dial"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="51" fill="none" stroke="#ff795b12" stroke-width="4"/><circle id="timer-ring" cx="60" cy="60" r="51" fill="none" stroke="#ff795b" stroke-width="4" stroke-linecap="round" stroke-dasharray="320.44" stroke-dashoffset="').concat(320.44 * (1 - Math.min(1, seconds / Math.max(timer.total, 1))), '"/></svg><div class="timer-readout"><strong id="timer-text">').concat(A.time(seconds), "</strong><small>").concat(timer.kind === "transition" ? "switch stations" : "breathe. reset.", '</small></div></div><div class="timer-next"><div class="eyebrow">').concat(e ? "UP NEXT" : "LAST SET COMPLETE", "</div><h3>").concat(e ? h(e.name) : "Finish strong.", "</h3><p>").concat(e ? h(A.load(e, t.weight, t.reps)) : "Confirm your log, then COMMIT.", '</p><small class="soft">').concat(t ? "Set " + t.setIndex + " of " + t.sets : "", '</small></div></div><div class="timer-controls"><button class="btn ghost" data-action="timer-adjust" data-delta="-15">−15 sec</button><button class="btn ghost" data-action="timer-adjust" data-delta="15">+15 sec</button><button class="btn secondary" data-action="timer-skip">Skip rest ').concat(I("skip", "sm"), "</button></div></section>");
    }
    if (pending) {
      const e = E.ex(s, pending.exerciseId);
      main += '<section class="card log-panel" id="log-panel"><div class="between"><div><span class="eyebrow purple">'.concat(pending.warmup ? "WARM-UP LOG" : "LOG THIS SET", '</span><h3 style="margin-top:6px">').concat(h(e.name), ' <span class="soft">· ').concat(pending.setIndex, '</span></h3></div><span class="badge purple">').concat(timer ? "DURING YOUR REST" : "ONE TAP TO CONFIRM", '</span></div><div class="log-grid"><label><span class="field-label">').concat(e.type === "timed" && !pending.warmup ? "Seconds completed" : "Reps done", '</span><input id="log-reps" type="number" min="0" max="3600" step="1" inputmode="numeric" value="').concat(pending.reps, '"></label><label><span class="field-label">').concat(e.equipment === "bodyweight" ? "Added weight" : "Weight used", " · kg").concat(e.equipment === "dumbbell" ? " / hand" : "", '</span><input id="log-weight" type="number" min="0" max="1000" step=".25" inputmode="decimal" value="').concat(pending.weight, '"></label></div>').concat(s.settings.effort && !pending.warmup ? '<div class="effort-row"><small>Reps left in the tank <span class="soft">(optional)</span></small><div class="rir-buttons">'.concat([0, 1, 2, 3].map((v) => '<button class="rir '.concat(pending.rir === v ? "active" : "", '" data-action="set-rir" data-value="').concat(v, '">').concat(v === 3 ? "3+" : v, "</button>")).join(""), "</div></div>") : "").concat(!pending.warmup && e.type === "bodyweight" ? '<label class="check-label"><input id="log-failed" type="checkbox" '.concat(pending.failed ? "checked" : "", '>Attempted but failed <span class="soft">(auto if below ').concat(e.min, ")</span></label>") : "", '<textarea id="log-note" placeholder="Set note · pain, form, energy…" aria-label="Set note">').concat(h(pending.note), '</textarea><button class="btn secondary full" data-action="confirm-set">').concat(I("check"), 'Confirm set</button><p class="form-hint text-center">').concat(timer ? "Your timer is already running. Logging never delays it." : "Prefilled with your target. Edit only what changed.", "</p></section>");
    }
    if (t) {
      const e = E.ex(s, t.exerciseId), last = E.lastRecords(s, e.id).find((r) => r.setIndex === t.setIndex);
      const note = e.note;
      main += '<section class="card active-exercise"><div class="between"><span class="badge '.concat(t.warmup ? "yellow" : t.kind === "straight" ? "" : "purple", '">').concat(t.warmup ? "WARM-UP RAMP" : t.kind === "superset" ? "SUPERSET" : t.kind === "triple" ? "TRIPLE SET" : "STRAIGHT SET", '</span><span class="muted" style="font-size:11px">Set <b>').concat(t.setIndex, "</b> / ").concat(t.sets, "</span></div><h2>").concat(h(e.name), '</h2><div class="exercise-meta">').concat(h(e.equipmentTag || (e.equipment === "bodyweight" ? "Bodyweight" : e.equipment.charAt(0).toUpperCase() + e.equipment.slice(1))), " · ").concat(t.warmup ? "Warm-ups never affect progression" : e.min + "–" + e.max + (e.type === "timed" ? " seconds" : " reps") + " · " + E.rest(s, e) + " sec rest").concat(e.equipment === "dumbbell" ? " · kg per hand" : "", "</div>").concat(note ? '<div class="notice info">'.concat(I("note", "sm"), " ").concat(h(note), "</div>") : "", '<div class="target-display">').concat(e.equipment === "bodyweight" && t.weight === 0 ? '<span class="value" style="font-size:30px">Bodyweight</span>' : '<span class="value">'.concat(e.equipment === "bodyweight" ? "+" : "").concat(A.kg(t.weight), '<span class="unit">kg').concat(e.equipment === "dumbbell" ? " / hand" : "", "</span></span>"), '<span class="times">×</span><span class="value">').concat(t.reps, '<span class="unit">').concat(e.type === "timed" && !t.warmup ? "sec" : "reps", "</span></span></div>").concat(e.type === "bodyweight" && ["pull-ups", "dips"].includes(e.id) ? '<p class="form-hint">Total load: '.concat(E.bodyweight(s) ? A.kg(E.bodyweight(s) + t.weight) + " kg (body weight + added load)" : "log your body weight to see total load", ".</p>") : "", '<div class="last-set"><span class="eyebrow" style="font-size:8px;display:block;margin-bottom:5px">LAST SESSION · SET ').concat(t.setIndex, "</span>").concat(last && !t.warmup ? "<strong>".concat(h(A.load(e, last.weight, last.reps)), "</strong>").concat(last.rir !== null ? " · " + last.rir + " RIR" : "") : "No previous working set. Start conservatively.", '</div><button class="btn primary full jumbo" data-action="set-done" ').concat(timer || pending ? "disabled" : "", ">").concat(I("check"), ' Set done <span style="font-size:11px;font-weight:500;margin-left:auto">').concat(timer ? "Rest is running" : pending ? "Confirm your last set" : t.transition ? "Next exercise · " + t.restAfter + "s" : "Start " + A.time(t.restAfter) + " rest", '</span></button><div class="set-actions"><button class="link-btn" data-action="unavailable" data-entry="').concat(t.entryId, '">').concat(I("swap", "sm"), 'Unavailable today</button><button class="link-btn" data-action="skip-exercise" data-entry="').concat(t.entryId, '">').concat(I("skip", "sm"), "Skip today</button></div></section>");
    } else if (!pending) {
      main += '<section class="card session-complete"><div class="success-emblem">'.concat(I("check", "lg"), '</div><span class="eyebrow green">WORK DONE. PROGRESS EARNED.</span><h2 style="margin-top:12px">That’s a wrap.</h2><p>').concat(completed, ' working sets logged. Finish and save your workout to review your next targets.</p><textarea id="finish-note" placeholder="Session note · sleep, mood, how it felt…" aria-label="Session note">').concat(h(session.note), '</textarea><button class="btn primary full jumbo" data-action="commit" style="margin-top:16px">COMMIT ').concat(I("check"), '<span style="font-size:11px;font-weight:500">Finish & save workout</span></button></section>');
    }
    const queue = session.queue.slice(0, 7).map((r, i) => {
      const e = E.ex(s, r.exerciseId);
      return '<div class="queue-row '.concat(i === 0 ? "current" : "", '"><div class="exercise-num">').concat(i === 0 ? I("arrow", "sm") : i + 1, '</div><div class="grow"><strong>').concat(h(e.name), "</strong><small>").concat(r.warmup ? "Warm-up" : "Set " + r.setIndex + " / " + r.sets, " · ").concat(h(A.load(e, r.weight, r.reps)), "</small></div></div>");
    }).join("");
    const done = session.records.slice(-6).reverse().map((r) => '<div class="completed-row">'.concat(I(r.confirmed ? "check" : "edit", "sm"), '<div class="grow">').concat(h(E.ex(s, r.exerciseId).name), " <small>· ").concat(r.warmup ? "warm-up" : r.setIndex, "</small></div><span>").concat(A.kg(r.weight), " × ").concat(r.reps).concat(E.ex(s, r.exerciseId).type === "timed" ? "s" : "", "</span></div>")).join("");
    return header("Your only job: the next set.", "Targets ready. Timer ready. You’ve got this.", '<button class="icon-btn" data-action="undo" '.concat(!session.records.length ? "disabled" : "", ' aria-label="Undo last set">').concat(I("undo"), "</button>"), "WORKOUT IN PROGRESS") + '<div class="session-progress"><div class="between"><span class="muted">'.concat(completed, " / ").concat(total, ' working sets</span><span class="soft">').concat(A.actualMinutes((Date.now() - session.startedAt) / 1e3), " min elapsed · ~").concat(A.minutes(session.estimateSeconds), ' min planned</span></div><div class="progress-bar"><i style="width:').concat(total ? completed / total * 100 : 100, '%"></i></div></div><div class="layout-two"><div class="stack">').concat(main, '</div><aside class="stack side-stack"><section class="card"><div class="between"><h3>The road ahead</h3><span class="badge">').concat(session.queue.length, ' SETS</span></div><div style="margin-top:13px">').concat(queue || '<p class="muted" style="font-size:11px;margin-top:20px">All sets complete. Time to COMMIT.</p>', "</div>").concat(session.queue.length > 7 ? '<p class="form-hint">+ '.concat(session.queue.length - 7, " more sets in your plan</p>") : "", "</section>").concat(session.records.length ? '<section class="card"><h3>In the bank</h3><div style="margin-top:12px">'.concat(done, '</div><button class="link-btn" data-action="undo">').concat(I("undo", "sm"), "Undo last set</button></section>") : "", '<section class="card"><button class="btn ghost full" data-action="session-note">').concat(I("note", "sm"), 'Session notes</button><button class="link-btn" data-action="end-early" style="margin-top:11px">Finish early & save completed sets</button><button class="link-btn danger-text" data-action="discard-session" style="display:flex;font-size:10px">Discard this session without saving</button></section></aside></div>');
  };
  function renderPlan() {
    const s = A.s(), p = A.ui.planned;
    const list = p.groups.map((group, i) => '<section class="card plan-group"><div class="plan-group-head"><span>'.concat(group.length > 1 ? I("layers", "sm") + " " + (group.length === 3 ? "TRIPLE SET" : "SUPERSET") : I("workout", "sm") + " STRAIGHT SET", " ").concat(String(i + 1).padStart(2, "0"), "</span><span>").concat(Math.max(...group.map((id) => E.rest(s, E.ex(s, p.entries.find((en) => en.id === id).exerciseId)))), " SEC REST</span></div>").concat(group.map((id, j) => {
      const en = p.entries.find((e2) => e2.id === id), e = E.ex(s, en.exerciseId);
      return '<div class="plan-ex-row"><div class="exercise-num">'.concat(group.length > 1 ? "ABC"[j] : I("workout", "sm"), '</div><div class="grow"><h4>').concat(h(e.name), " ").concat(e.compound ? '<span class="badge orange" style="font-size:8px">COMPOUND</span>' : "", "</h4><small>").concat(en.sets, " sets · ").concat(e.min, "–").concat(e.max).concat(e.type === "timed" ? " sec" : " reps").concat(s.settings.warmups && e.warmup ? " + 3 warm-ups" : "").concat(e.equipment === "dumbbell" ? " · per hand" : "", "</small>").concat(e.note ? '<p class="form-hint">'.concat(I("note", "sm"), " ").concat(h(e.note), "</p>") : "", '</div><div class="text-right"><div class="load">').concat(h(A.load(e, en.targetWeight, en.targetReps)), '</div><button class="link-btn" data-action="target-edit" data-id="').concat(e.id, '" style="font-size:9px">Edit target ').concat(I("edit", "sm"), "</button></div></div>");
    }).join(""), "</section>")).join("");
    return header("Your session, streamlined.", "Heavy lifts first. Compatible supersets. Nothing left to guess.", '<button class="btn ghost sm" data-action="nav" data-route="today">'.concat(I("left", "sm"), "Change focus</button>"), "THE PLAN") + '<div class="layout-two"><div class="stack"><div class="metrics">'.concat(A.metric("clock", A.minutes(p.seconds), "Estimated duration", "min")).concat(A.metric("layers", p.workingSets, "Working sets", "sets")).concat(A.metric("bolt", p.savedSeconds ? A.minutes(p.savedSeconds) : 0, "Planned time saved", "min"), "</div>").concat(p.overBudget ? '<div class="notice">Your final compound alone exceeds this budget. It is kept rather than silently dropping the entire workout.</div>' : "").concat(p.dropped.length ? '<div class="notice info">Time budget: '.concat(p.dropped.map((id) => h(E.ex(s, id).name)).join(", "), " left out today. No progression penalty.</div>") : "", '<div class="plan-list">').concat(list, '</div></div><aside class="stack side-stack"><section class="card"><span class="eyebrow accent">TODAY’S FOCUS</span><h3 style="margin-top:12px">').concat(s.settings.selectedBlocks.map((id) => {
      var _a;
      return (_a = A.block(id)) == null ? void 0 : _a.short;
    }).filter(Boolean).join(" + "), '</h3><div class="summary-values"><div class="summary-line"><span>Exercises</span><strong>').concat(p.entries.length, '</strong></div><div class="summary-line"><span>Supersets / triples</span><strong>').concat(p.groups.filter((g) => g.length > 1).length, '</strong></div><div class="summary-line"><span>Warm-up ramp</span><strong>').concat(s.settings.warmups ? "On" : "Off", '</strong></div><div class="summary-line"><span>Without supersets</span><strong>~').concat(A.minutes(p.straightSeconds), ' min</strong></div><div class="summary-line"><span>Your plan</span><strong class="accent">~').concat(A.minutes(p.seconds), ' min</strong></div></div><button class="btn primary full jumbo" data-action="start-workout">Let’s get to work ').concat(I("arrow"), '</button><p class="form-hint text-center">Autosaved after every set. Always resumable.</p></section><div class="notice info">').concat(I("info", "sm"), ' Superset: A → B → rest. Every pairing follows your editable rules. Time is an estimate, not a promise.</div><div class="notice">').concat(I("shield", "sm"), " Starting loads are suggestions, not personalized assessments. Use a weight you can move with control.</div></aside></div>");
  }
  A.pages.progress = () => {
    const s = A.s(), id = A.ui.progressExercise, e = E.ex(s, id) || s.exercises[0], st = E.stats(s, e.id), volume = E.weeklyVolume(s), stalls = E.stalled(s);
    const sug = Object.values(s.suggestions).filter((x) => !x.accepted);
    const options = s.exercises.filter((x) => x.active || E.exerciseHistory(s, x.id).length).map((x) => '<option value="'.concat(x.id, '" ').concat(x.id === e.id ? "selected" : "", ">").concat(h(x.name), "</option>")).join("");
    const mode = e.type === "timed" ? "reps" : A.ui.chartMode;
    const pending = sug.length ? '<section class="card"><div class="between"><h3>Raise? / To?</h3><span class="badge orange">'.concat(sug.length, ' TO REVIEW</span></div><p class="card-desc" style="margin:8px 0 0">Your next step is a suggestion. You’re always in control.</p>').concat(sug.map((x) => {
      const ex = E.ex(s, x.exerciseId);
      return '<div class="suggestion-row"><div class="grow"><span class="badge '.concat(x.kind === "deload" ? "yellow" : x.kind === "raise" ? "green" : "purple", '">').concat({ raise: "RAISE", reps: "MORE REPS", time: "MORE TIME", hold: "HOLD", deload: "DELOAD", variation: "LOAD / VARIATION" }[x.kind], "</span><h4>").concat(h(ex.name), " → ").concat(h(A.load(ex, x.weight, x.reps)), "</h4><p>").concat(h(x.reason), '</p></div><div class="flex gap-sm"><button class="icon-btn" data-action="suggestion-edit" data-id="').concat(ex.id, '" aria-label="Edit ').concat(h(ex.name), ' target">').concat(I("edit", "sm"), '</button><button class="btn secondary sm" data-action="accept-suggestion" data-id="').concat(ex.id, '">').concat(I("check", "sm"), "Accept</button></div></div>");
    }).join(""), "</section>") : "";
    const next = s.exercises.filter((x) => x.active && x.primary && (A.ui.previewBlock === "all" || x.block === A.ui.previewBlock)).sort((a, b) => a.order - b.order).map((x) => {
      const t = E.target(s, x);
      return '<div class="next-target"><div class="grow"><strong>'.concat(h(x.name), "</strong><small>").concat(x.sets, " sets · ").concat(t.configured ? "saved target" : "starting load not confirmed", '</small></div><span class="load">').concat(h(A.load(x, t.weight, t.reps)), '</span><button data-action="target-edit" data-id="').concat(x.id, '" aria-label="Edit ').concat(h(x.name), ' target">').concat(I("edit", "sm"), "</button></div>");
    }).join("");
    const committed = A.ui.lastCommitted ? s.sessions.find((x) => x.id === A.ui.lastCommitted) : null;
    const maxVolume = Math.max(12, ...Object.values(volume));
    return header("Small steps. Stronger you.", "See the work add up, one session at a time.", "", "PROGRESS, NOT PERFECTION") + "".concat(committed ? '<div class="notice success" style="margin-bottom:22px">'.concat(I("check", "sm"), " <b>COMMITTED.</b> ").concat(committed.records.filter((r) => !r.warmup).length, " working sets saved · ").concat(A.actualMinutes(committed.durationSeconds), " min actual / ~").concat(A.minutes(committed.estimateSeconds), " min estimated. Review your next targets below.</div>") : "", '<div class="stack">').concat(pending, '<div class="between wrap"><h2>Your lift, over time</h2><select id="progress-exercise" style="max-width:270px;font-size:12px">').concat(options, '</select></div><div class="pr-grid">').concat(A.metric("trophy", st.points.length ? A.kg(st.prWeight) : "—", "Best recorded load", "kg")).concat(A.metric("bolt", st.points.length && e.type !== "timed" ? A.kg(st.pr1rm) : "—", "Best estimated 1RM", "kg")).concat(A.metric("layers", st.points.length ? st.prReps : "—", e.type === "timed" ? "Longest set" : "Best rep count", e.type === "timed" ? "sec" : "reps")).concat(A.metric("chart", st.points.length ? A.kg(st.prVolume) : "—", "Best session volume", e.type === "timed" ? "kg·sec" : "kg·reps"), '</div><div class="settings-grid"><section class="card"><div class="between"><h3>').concat(e.type === "timed" ? "Duration trend" : A.ui.chartMode === "e1rm" ? "Estimated 1RM" : "Load over time", "</h3>").concat(e.type !== "timed" ? '<div class="flex gap-sm"><button class="tab '.concat(A.ui.chartMode === "weight" ? "active" : "", '" data-action="chart-mode" data-value="weight">kg</button><button class="tab ').concat(A.ui.chartMode === "e1rm" ? "active" : "", '" data-action="chart-mode" data-value="e1rm">1RM</button></div>') : "", "</div>").concat(A.chart(st.points, mode), '<p class="form-hint">').concat(e.type === "timed" ? "Seconds on your longest set. Timed holds do not have an estimated 1RM." : "Epley: load × (1 + reps / 30). An estimate, not a tested max.").concat(e.type === "bodyweight" ? " Total load uses the body weight saved with each set." : "", '</p></section><section class="card"><h3>Volume per session</h3>').concat(A.chart(st.points, "volume", "#bba6ff", true), '<p class="form-hint">').concat(e.type === "timed" ? "Recorded kg × seconds." : "Sum of recorded load × reps. Dumbbell load is per hand.", ' Warm-ups excluded.</p></section></div><div class="layout-two"><section class="card"><div class="between"><h3>Weekly muscle balance</h3><span class="badge purple">LAST 7 DAYS</span></div><p class="card-desc" style="margin:8px 0 17px">Completed working sets, by primary muscle. Warm-ups excluded.</p>').concat(Object.entries(volume).map(([name, n]) => '<div class="volume-row"><span>'.concat(h(name), '</span><div class="progress-bar"><i style="width:').concat(n / maxVolume * 100, '%"></i></div><b>').concat(n, "</b></div>")).join(""), '</section><section class="card"><div class="between"><h3>Stalled lifts</h3><span class="badge">').concat(stalls.length, '</span></div><p class="card-desc" style="margin-top:9px">No improvement in the last ').concat(s.settings.stallSessions, " complete sessions.</p>").concat(stalls.length ? stalls.map((x) => '<div class="queue-row"><div class="grow"><strong>'.concat(h(x.name), '</strong><small>Review effort, rest, and load.</small></div><button class="icon-btn" data-action="analyze" data-id="').concat(x.id, '" aria-label="Analyze ').concat(h(x.name), '">').concat(I("arrow", "sm"), "</button></div>")).join("") : '<div class="notice success">'.concat(I("check", "sm"), " ").concat(s.sessions.length ? "Nothing flagged. Keep stacking good sessions." : "Your first sessions establish a baseline.", "</div>"), '</section></div><section class="card"><div class="between wrap"><div><h3>Next session preview</h3><p class="form-hint">Your currently accepted targets. Edit any lift before you train.</p></div><select id="preview-block" style="max-width:180px;font-size:11px"><option value="all">All muscle blocks</option>').concat(A.Seed.blocks.map((b) => '<option value="'.concat(b.id, '" ').concat(A.ui.previewBlock === b.id ? "selected" : "", ">").concat(b.name, "</option>")).join(""), '</select></div><div class="next-targets">').concat(next, "</div></section></div>");
  };
  A.pages.history = () => {
    const s = A.s(), d = A.ui.calendar, y = d.getFullYear(), m = d.getMonth(), first = (new Date(y, m, 1).getDay() + 6) % 7, days = new Date(y, m + 1, 0).getDate();
    const trained = new Set(s.sessions.filter((x) => x.records.some((r) => !r.warmup && r.confirmed)).map((x) => E.localDate(x.endedAt || x.startedAt)));
    let grid = ["M", "T", "W", "T", "F", "S", "S"].map((v) => '<div class="cal-weekday">'.concat(v, "</div>")).join("");
    grid += Array.from({ length: first }, () => "<span></span>").join("");
    for (let i = 1; i <= days; i++) {
      const date = E.localDate(new Date(y, m, i));
      grid += '<button class="cal-day '.concat(trained.has(date) ? "trained" : "", " ").concat(date === E.localDate() ? "today" : "", " ").concat(A.ui.historyDate === date ? "chosen" : "", '" data-action="history-day" data-date="').concat(date, '" aria-label="').concat(date).concat(trained.has(date) ? ", trained" : "", '">').concat(i, "</button>");
    }
    const sessions = [...s.sessions].reverse().filter((x) => !A.ui.historyDate || E.localDate(x.endedAt || x.startedAt) === A.ui.historyDate);
    const rows = sessions.map((x) => {
      const date = new Date(x.endedAt || x.startedAt);
      const sets = x.records.filter((r) => !r.warmup).length;
      return '<button class="history-row" data-action="history-session" data-id="'.concat(x.id, '"><div class="history-date"><b>').concat(date.getDate(), "</b><small>").concat(A.date(date, { month: "short" }), '</small></div><div class="grow"><h4>').concat(x.blocks.map((id) => {
        var _a;
        return (_a = A.block(id)) == null ? void 0 : _a.short;
      }).filter(Boolean).join(" + ") || "Custom workout", "</h4><p>").concat(sets, " working sets · ").concat(x.records.filter((r) => r.warmup).length, " warm-ups · ").concat(A.date(date, { weekday: "short", hour: "2-digit", minute: "2-digit" }), '</p></div><div class="right-time">').concat(A.actualMinutes(x.durationSeconds), " min</div>").concat(I("chevron", "sm"), "</button>");
    }).join("");
    const totalSets = s.sessions.reduce((a, x) => a + x.records.filter((r) => !r.warmup).length, 0);
    return header("Proof you showed up.", "Every session has a story. Yours stays on this device.", "", "YOUR TRAINING LOG") + '<div class="layout-two"><div class="stack"><div class="metrics">'.concat(A.metric("history", s.sessions.length, "Sessions saved", "total")).concat(A.metric("layers", totalSets, "Working sets", "total")).concat(A.metric("fire", E.streak(s), "Training-day streak", "days"), '</div><div class="between"><h2>').concat(A.ui.historyDate ? A.date(A.ui.historyDate + "T12:00:00", { day: "numeric", month: "long" }) : "Session history", "</h2>").concat(A.ui.historyDate ? '<button class="link-btn" data-action="history-clear">Show all sessions</button>' : '<span class="soft" style="font-size:10px">Newest first</span>', "</div>").concat(rows || A.empty("history", A.ui.historyDate ? "No session on this day." : "Your story starts with a set.", A.ui.historyDate ? "Choose another day or show your full history." : "Completed workouts appear here with every set, note, and next-step decision.", '<button class="btn primary" data-action="'.concat(A.ui.historyDate ? "history-clear" : "nav", '" data-route="today">').concat(A.ui.historyDate ? "Show all sessions" : "Plan your first workout", " ").concat(I("arrow", "sm"), "</button>")), '</div><aside class="stack side-stack"><section class="card"><div class="between calendar-header"><h3>').concat(A.date(d, { month: "long", year: "numeric" }), '</h3><div class="flex gap-sm"><button class="icon-btn" data-action="calendar-month" data-delta="-1" aria-label="Previous month">').concat(I("left", "sm"), '</button><button class="icon-btn" data-action="calendar-month" data-delta="1" aria-label="Next month">').concat(I("chevron", "sm"), '</button></div></div><div class="calendar-grid">').concat(grid, '</div><hr class="card-rule"><div class="flex" style="font-size:10px;color:var(--muted)"><span class="dot accent"></span>Workout saved <span class="soft" style="margin-left:auto">Tap a day to filter</span></div></section><section class="card"><div class="between"><h3>Body weight</h3><button class="icon-btn" data-action="bodyweight" aria-label="Log body weight">').concat(I("plus", "sm"), '</button></div><p class="card-desc" style="margin-top:7px">A weekly check-in for total-load tracking.</p>').concat(s.bodyweights.length ? [...s.bodyweights].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5).map((b) => '<div class="summary-line" style="padding:9px 0"><span>'.concat(A.date(b.date + "T12:00:00"), "</span><strong>").concat(A.kg(b.weight), " kg</strong></div>")).join("") : '<div class="notice info">Log your weight to include it in Pull Up and Dip loads.</div>', "</section></aside></div>");
  };
  A.pages.library = () => {
    const s = A.s(), list = s.exercises.filter((e) => (A.ui.showArchived || e.active) && (A.ui.showSubs || e.primary) && (A.ui.libraryBlock === "all" || e.block === A.ui.libraryBlock) && e.name.toLowerCase().includes(A.ui.search.toLowerCase())).sort((a, b) => a.order - b.order);
    const tabs = ["all", ...A.Seed.blocks.map((b) => b.id)].map((id) => '<button class="tab '.concat(A.ui.libraryBlock === id ? "active" : "", '" data-action="library-filter" data-id="').concat(id, '">').concat(id === "all" ? "All exercises" : A.block(id).short, "</button>")).join("");
    const cards = list.map((e) => {
      const b = A.block(e.block), t = E.target(s, e);
      return '<section class="card exercise-card"><div class="between"><span class="badge" style="color:'.concat((b == null ? void 0 : b.color) || "#aaa", '">').concat(h(e.muscle), '</span><button class="icon-btn" style="height:29px;width:29px;border:0" data-action="analyze" data-id="').concat(e.id, '" aria-label="Analyze ').concat(h(e.name), '">').concat(I("chart", "sm"), "</button></div><h3>").concat(h(e.name)).concat(!e.active ? ' <span class="soft">(archived)</span>' : "", '</h3><div class="tags"><span>').concat(e.sets, " sets</span><span>").concat(e.min, "–").concat(e.max, " ").concat(e.type === "timed" ? "sec" : "reps", "</span><span>").concat(h(e.equipmentTag || e.equipment), "</span><span>").concat(E.rest(s, e), "s rest</span>").concat(!e.primary ? "<span>substitute</span>" : "", '</div><div class="exercise-card-footer"><div><small>Next target</small><strong style="display:block">').concat(t.configured ? h(A.load(e, t.weight, t.reps)) : "Set starting load", '</strong></div><button class="btn ghost sm" data-action="exercise-edit" data-id="').concat(e.id, '">').concat(I("edit", "sm"), 'Edit</button></div><div class="reorder-buttons"><button data-action="exercise-reorder" data-id="').concat(e.id, '" data-delta="-1" aria-label="Move ').concat(h(e.name), ' earlier">↑ Earlier</button><button data-action="exercise-reorder" data-id="').concat(e.id, '" data-delta="1" aria-label="Move ').concat(h(e.name), ' later">↓ Later</button></div></section>');
    }).join("");
    return header("Your routine. Your rules.", "Every exercise, target, substitute, and pairing is editable.", '<button class="btn primary sm" data-action="exercise-add">'.concat(I("plus", "sm"), "Add exercise</button>"), "THE EXERCISE LIBRARY") + '<div class="section-tabs">'.concat(tabs, '</div><div class="library-tools"><div class="search-wrap">').concat(I("search"), '<input id="exercise-search" type="search" placeholder="Find an exercise…" value="').concat(h(A.ui.search), '" aria-label="Search exercises"></div><label class="check-label"><input type="checkbox" id="show-subs" ').concat(A.ui.showSubs ? "checked" : "", '>Substitutes</label><label class="check-label"><input type="checkbox" id="show-archived" ').concat(A.ui.showArchived ? "checked" : "", '>Archived</label><span class="soft" style="font-size:10px;margin-left:auto">').concat(list.length, ' exercises</span></div><div class="library-grid">').concat(cards, "</div>").concat(!list.length ? A.empty("search", "No exercises found.", "Try another name, or include substitutes and archived exercises.") : "");
  };
  A.pages.settings = () => {
    const s = A.s(), cfg = s.settings, permissions = A.Store.permissions();
    const num = (id, label, desc, min, max) => '<div class="setting-row"><div><strong>'.concat(label, "</strong><small>").concat(desc, '</small></div><input type="number" id="setting-').concat(id, '" value="').concat(cfg[id], '" min="').concat(min, '" max="').concat(max, '" inputmode="numeric" aria-label="').concat(label, '"></div>');
    return header("Set it up your way.", "Built for your equipment, your schedule, and your next rep.", "", "THE DETAILS THAT MATTER") + '<div class="settings-grid"><div class="stack"><section class="card"><div class="card-title">'.concat(I("timer"), '<h3>Rest & transitions</h3></div><p class="card-desc">Heavy 6–10-rep lifts default to 150 seconds. Each exercise can override this global default.</p>').concat(num("rest", "Default rest", "Seconds · used without an exercise override", 0, 1800)).concat(num("transition", "Superset transition", "Seconds between exercises A and B", 0, 120)).concat(num("warmupRest", "Warm-up rest", "Seconds after each ramp set", 0, 300), '<div class="setting-save"><button class="btn secondary sm" data-action="save-timers">Save timer defaults ').concat(I("check", "sm"), "</button></div>").concat(A.switch("sound", "Completion sound", "A short two-tone cue when your timer ends.")).concat(A.switch("vibrate", "Completion vibration", "Feel the cue without watching the screen.")).concat(A.switch("keepAwake", "Keep screen awake", "On while a session is active and Forge is open."), '<button class="link-btn" data-action="test-alert">').concat(I("bell", "sm"), 'Test completion alert</button></section><section class="card"><div class="card-title">').concat(I("layers"), '<h3>Training preferences</h3></div><p class="card-desc">Small details that keep the session moving.</p>').concat(A.switch("warmups", "Warm-up ramps", "3 loadable ramp sets before the five main compounds.")).concat(A.switch("triples", "Allow triple sets", "Only if every pair in the triple is compatible.")).concat(A.switch("effort", "Optional effort rating", "Log 0, 1, 2, or 3+ reps left after a working set.")).concat(num("safeJump", "Safe-jump cap", "Maximum suggested increase in percent", 1, 100)).concat(num("stallSessions", "Stall window", "Complete sessions with no improvement", 2, 20), '<div class="setting-save"><button class="btn secondary sm" data-action="save-progression">Save progression preferences</button></div></section><section class="card"><div class="card-title">').concat(I("swap"), '<h3>Pairing rules</h3></div><p class="card-desc">Forge follows your table, not guesses about muscles. Substitutes inherit their source exercise’s group. Deadlift, Squats, and Farmer Carries remain solo.</p><button class="btn ghost full" data-action="pairing">').concat(I("layers", "sm"), 'Edit allowed pairings</button></section></div><div class="stack"><section class="card"><div class="card-title">').concat(I("workout"), '<h3>Your loadable weights</h3></div><p class="card-desc">Every target rounds to weights you actually have. Dumbbell weights are per hand; barbell plates are entered as pairs.</p><div class="summary-values"><div class="summary-line"><span>Bar weight</span><strong>').concat(A.kg(cfg.barWeight), ' kg</strong></div><div class="summary-line"><span>Plate denominations</span><strong>').concat(cfg.plates.length, '</strong></div><div class="summary-line"><span>Dumbbell options</span><strong>').concat(cfg.dumbbells.length, '</strong></div><div class="summary-line"><span>Cable stack options</span><strong>').concat(cfg.cables.length, '</strong></div></div><button class="btn ghost full" data-action="equipment">').concat(I("edit", "sm"), 'Configure equipment</button></section><section class="card"><div class="card-title">').concat(I("bell"), '<h3>Training reminders</h3></div><p class="card-desc">Optional local notifications. No messages, no server. ').concat(A.Store.native ? "" : "Android APK required for reliable reminders.", '</p><div class="reminder-days">').concat([1, 2, 3, 4, 5, 6, 0].map((d, i) => '<button class="reminder-day '.concat(cfg.reminders.days.includes(d) ? "selected" : "", '" data-action="reminder-day" data-day="').concat(d, '" aria-label="').concat(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][i], '">').concat(["M", "T", "W", "T", "F", "S", "S"][i], "</button>")).join(""), '</div><label class="field-label" for="reminder-time">Local time</label><input type="time" id="reminder-time" value="').concat(cfg.reminders.time, '"><p class="form-hint">').concat(cfg.reminders.days.length ? cfg.reminders.days.length + " day(s) selected." : "Off. Select a day to enable.", '</p></section><section class="card"><div class="card-title">').concat(I("shield"), '<h3>Background readiness</h3></div><p class="card-desc">').concat(A.Store.native ? "A native foreground timer and wake lock keep countdowns running with the screen off. An exact alarm is a process-kill fallback." : "This browser is an interactive preview. Install the APK for native screen-off timers, sound, vibration, and scheduled reminders.", '</p><div class="setting-row"><div><strong>Notifications</strong><small>').concat(permissions.notifications ? "Allowed" : "Allow for timer status and reminders", '</small></div><button class="btn ghost sm" data-action="notification-permission">').concat(permissions.notifications ? "Review" : "Allow", '</button></div><div class="setting-row"><div><strong>Exact alarm fallback</strong><small>').concat(permissions.exact ? "Allowed" : "Recommended for timer recovery if Android kills the app", '</small></div><button class="btn ghost sm" data-action="alarm-permission">').concat(permissions.exact ? "Review" : "Allow", '</button></div><p class="form-hint">Android “Force stop” disables timers and reminders. Some manufacturers require unrestricted battery use; test one timer with the screen off.</p></section><section class="card"><div class="card-title">').concat(I("download"), '<h3>Backup & restore</h3></div><p class="card-desc">Your entire workspace in one JSON file: exercises, settings, targets, every set, and your active session. Keep a copy somewhere safe.</p><div class="backup-buttons"><button class="btn secondary" data-action="export">').concat(I("download", "sm"), 'Export JSON</button><button class="btn ghost" data-action="import">').concat(I("upload", "sm"), 'Restore JSON</button></div></section><section class="card"><div class="card-title">').concat(I("info"), '<h3>Forge 1.0</h3></div><p class="card-desc">Personal-use training. No network permission, login, advertising, or analytics. Android stores data in private SQLite. Browser preview uses this browser’s local storage.</p><button class="link-btn" data-action="help">How progression works ').concat(I("arrow", "sm"), "</button></section></div></div>");
  };
})(window);
(function(root) {
  "use strict";
  const A = root.ForgeApp, E = A.E, h = A.escape, I = A.icon;
  const close = '<button class="btn ghost" data-action="close-modal">Cancel</button>';
  A.confirm = (title, text, action, label = "Confirm", data = {}) => A.dialog("confirm", title, '<p class="intro">'.concat(text, "</p>"), close + '<button class="btn primary" data-action="confirm-dialog">'.concat(label, "</button>"), __spreadValues({ action }, data));
  A.openStarts = (ids, purpose = "plan", entryId = null) => {
    const s = A.s();
    ids = [...new Set(ids)];
    A.dialog("starts", "Find your starting point.", '<p class="intro">Enter a comfortable working load for each exercise. Unknown? Use conservative starts, then check them against your ability and equipment. Dumbbells are kg <b>per hand</b>; barbells include the bar.</p><button class="btn ghost full" data-action="conservative-starts">Unknown · suggest conservative starts '.concat(I("bolt", "sm"), '</button><div style="margin-top:12px">').concat(ids.map((id) => {
      var _a;
      const e = E.ex(s, id), t = E.target(s, e);
      return '<div class="setup-row"><div><strong>'.concat(h(e.name), "</strong><small>").concat(h(e.equipment), " · ").concat(e.min, "–").concat(e.max, " ").concat(e.type === "timed" ? "sec" : "reps", '</small></div><div class="input-unit"><input class="start-weight" data-id="').concat(id, '" type="number" min="0" max="1000" step=".25" inputmode="decimal" placeholder="?" value="').concat((_a = s.targets[id].weight) != null ? _a : "", '" aria-label="').concat(h(e.name), ' starting weight"><span>kg</span></div></div>');
    }).join(""), '</div><p class="form-hint">Targets round to your configured loadable weights. You can change them at any time. An empty bar may be the lightest available warm-up.</p>'), close + '<button class="btn primary" data-action="save-starts">Save starting weights ' + I("arrow", "sm") + "</button>", { ids, purpose, entryId });
  };
  A.openTarget = (id, suggestion = false) => {
    const s = A.s(), e = E.ex(s, id), t = E.target(s, e), sug = s.suggestions[id];
    const weight = suggestion && sug ? sug.weight : t.weight, reps = suggestion && sug ? sug.reps : t.reps;
    A.dialog("target", h(e.name), '<p class="intro">Set the next target. Load rounds to your equipment. This is an explicit override; no weight increase is applied without your approval.</p>'.concat(suggestion && sug ? '<div class="notice info" style="margin-bottom:18px">'.concat(h(sug.reason), "</div>") : "", '<div class="form-grid"><label><span class="field-label">').concat(e.equipment === "bodyweight" ? "Added weight" : "Weight", " · kg ").concat(e.equipment === "dumbbell" ? "per hand" : "", '</span><input id="target-weight" type="number" min="0" max="1000" step=".25" inputmode="decimal" value="').concat(weight, '"></label><label><span class="field-label">').concat(e.type === "timed" ? "Seconds" : "Target reps", " · ").concat(e.min, "–").concat(e.max, '</span><input id="target-reps" type="number" min="').concat(e.min, '" max="').concat(e.max, '" step="1" inputmode="numeric" value="').concat(reps, '"></label></div><p class="form-hint">Current range: ').concat(e.min, "–").concat(e.max, ". Edit the exercise to change its range or available increment.</p>"), close + '<button class="btn primary" data-action="save-target">Save target ' + I("check", "sm") + "</button>", { id, suggestion });
  };
  A.openExercise = (id = null) => {
    var _a;
    const s = A.s(), e = id ? E.clone(E.ex(s, id)) : { id: "custom-" + E.uid(), name: "", block: "chest", group: "SOLO", type: "weighted", min: 6, max: 10, equipment: "dumbbell", suggested: 4, increment: 1, muscle: "Chest", sets: 3, rest: null, priority: 2, compound: false, warmup: false, primary: true, active: true, order: Math.max(...s.exercises.map((x) => x.order)) + 1, note: "", equipmentTag: "", substitutes: [] };
    const opts = (values, v) => values.map((x) => '<option value="'.concat(x, '" ').concat(x === v ? "selected" : "", ">").concat(h(x.replaceAll("_", " ")), "</option>")).join("");
    const field = (id2, label, type, value, attrs = "") => '<label><span class="field-label">'.concat(label, '</span><input id="edit-').concat(id2, '" type="').concat(type, '" value="').concat(h(value), '" ').concat(attrs, "></label>");
    A.dialog("exercise", id ? "Make this lift yours." : "Add to your routine.", '<div class="form-grid"><label class="span-two"><span class="field-label">Exercise name</span><input id="edit-name" maxlength="200" value="'.concat(h(e.name), '" placeholder="e.g. Dumbbell Bench Press"></label><label><span class="field-label">Muscle block</span><select id="edit-block">').concat(A.Seed.blocks.map((b) => '<option value="'.concat(b.id, '" ').concat(b.id === e.block ? "selected" : "", ">").concat(b.name, "</option>")).join(""), '</select></label><label><span class="field-label">Logging type</span><select id="edit-type">').concat(opts(["weighted", "bodyweight", "timed"], e.type), "</select></label>").concat(field("min", "Range bottom · reps / sec", "number", e.min, 'min="1" max="3600" inputmode="numeric"')).concat(field("max", "Range top · reps / sec", "number", e.max, 'min="1" max="3600" inputmode="numeric"')).concat(field("sets", "Working sets", "number", e.sets, 'min="1" max="20" inputmode="numeric"')).concat(field("rest", "Rest override · seconds (blank = global)", "number", (_a = e.rest) != null ? _a : "", 'min="0" max="1800" inputmode="numeric"'), '<label><span class="field-label">Equipment / loadable weights</span><select id="edit-equipment">').concat(opts(["barbell", "dumbbell", "cable", "machine", "bodyweight"], e.equipment), "</select></label>").concat(field("increment", "Weight increment · kg", "number", e.increment, 'min=".01" max="100" step=".25" inputmode="decimal"'), '<label><span class="field-label">Priority · budget trimming</span><select id="edit-priority"><option value="1" ').concat(e.priority === 1 ? "selected" : "", '>1 · Essential</option><option value="2" ').concat(e.priority === 2 ? "selected" : "", '>2 · Standard</option><option value="3" ').concat(e.priority === 3 ? "selected" : "", '>3 · Optional</option></select></label><label><span class="field-label">Pairing group</span><select id="edit-group">').concat(opts(Object.keys(E.GROUPS), e.group), '</select></label><label class="span-two"><span class="field-label">Equipment tag · optional</span><input id="edit-equipment-tag" maxlength="120" value="').concat(h(e.equipmentTag || ""), '" placeholder="EZ bar · Smith machine · red band…"></label><label class="span-two"><span class="field-label">Primary muscle · weekly volume</span><input id="edit-muscle" maxlength="80" value="').concat(h(e.muscle), '" placeholder="e.g. Chest"></label><label class="check-label"><input id="edit-primary" type="checkbox" ').concat(e.primary ? "checked" : "", '>Include in this block’s routine</label><label class="check-label"><input id="edit-compound" type="checkbox" ').concat(e.compound ? "checked" : "", '>Progression-critical compound</label><label class="check-label"><input id="edit-warmup" type="checkbox" ').concat(e.warmup ? "checked" : "", '>Show 3 warm-up ramp sets</label><label class="check-label"><input id="edit-active" type="checkbox" ').concat(e.active ? "checked" : "", '>Active (not archived)</label><label class="span-two"><span class="field-label">Machine settings / setup memory</span><textarea id="edit-note" maxlength="2000" placeholder="Seat height, pad position, grip width…">').concat(h(e.note), '</textarea></label></div><hr class="card-rule"><h3>Substitutes, in order</h3><p class="form-hint">Each has its own targets and history. Already-used exercises are not duplicated in the same workout.</p><div id="sub-list"></div><div class="flex gap-sm"><select id="sub-add-select" style="font-size:11px">').concat(s.exercises.filter((x) => x.id !== e.id && x.active).map((x) => '<option value="'.concat(x.id, '">').concat(h(x.name), "</option>")).join(""), '</select><button class="btn ghost sm" data-action="sub-add">').concat(I("plus", "sm"), "Add</button></div>"), (id ? '<button class="btn danger sm" style="margin-right:auto" data-action="archive-exercise" data-id="'.concat(id, '">').concat(I("trash", "sm"), "Archive</button>") : "") + close + '<button class="btn primary" data-action="save-exercise">Save exercise ' + I("check", "sm") + "</button>", { e, id, substitutes: [...e.substitutes] }, true);
    A.renderSubs();
  };
  A.renderSubs = () => {
    const s = A.s(), subs = A.ui.modal.data.substitutes;
    document.getElementById("sub-list").innerHTML = subs.map((id, i) => {
      var _a;
      return '<div class="sub-row"><span class="grow">'.concat(i + 1, ". ").concat(h(((_a = E.ex(s, id)) == null ? void 0 : _a.name) || "Archived exercise"), '</span><button class="icon-btn" data-action="sub-move" data-index="').concat(i, '" data-delta="-1" aria-label="Move substitute earlier">↑</button><button class="icon-btn" data-action="sub-move" data-index="').concat(i, '" data-delta="1" aria-label="Move substitute later">↓</button><button class="icon-btn" data-action="sub-remove" data-index="').concat(i, '" aria-label="Remove substitute">').concat(I("close", "sm"), "</button></div>");
    }).join("") || '<p class="form-hint" style="margin:16px 0">No substitutes yet. Add one below.</p>';
  };
  A.openEquipment = () => {
    const cfg = A.s().settings;
    A.dialog("equipment", "Weights you can really load.", '<p class="intro">Barbell weight includes the bar and matching plates on both sides. Enter plates as <b>kg × number of pairs</b>. All other lists are individual available loads, comma-separated.</p><div class="form-grid"><label class="span-two"><span class="field-label">Bar weight · kg</span><input id="equipment-bar" type="number" min="0" max="100" step=".25" inputmode="decimal" value="'.concat(cfg.barWeight, '"></label><label class="span-two"><span class="field-label">Plates · kg x pairs</span><input id="equipment-plates" value="').concat(cfg.plates.map((p) => p.weight + "x" + p.pairs).join(", "), '"><p class="form-hint">Example: 1.25x2, 2.5x2, 5x2, 10x2, 15x2, 20x2</p></label>').concat([["dumbbells", "Dumbbells · kg per hand"], ["cables", "Cable stack · kg"], ["machines", "Machine stack · kg"], ["addedLoads", "Bodyweight / backpack / belt added loads · kg"]].map(([key, label]) => '<label class="span-two"><span class="field-label">'.concat(label, '</span><textarea id="equipment-').concat(key, '" style="min-height:65px">').concat(cfg[key].join(", "), "</textarea></label>")).join(""), '</div><div class="notice info">Targets use the nearest loadable weight. Raises round down within the safe-jump cap. If no available step fits, the app holds the weight instead of breaking the cap.</div>'), close + '<button class="btn primary" data-action="save-equipment">Save equipment ' + I("check", "sm") + "</button>");
  };
  A.openPairing = (id = null) => {
    const s = A.s();
    id = id || s.exercises.find((e2) => e2.active).id;
    const e = E.ex(s, id);
    const opts = s.exercises.filter((x) => x.active).map((x) => '<option value="'.concat(x.id, '" ').concat(x.id === id ? "selected" : "", ">").concat(h(x.name), "</option>")).join("");
    const rows = s.exercises.filter((x) => x.active && x.id !== id).map((x) => {
      const locked = e.group === "SOLO" || x.group === "SOLO", checked = E.canPair(s, e, x);
      return '<label class="pair-rule"><span>'.concat(h(x.name)).concat(locked ? ' <span class="soft">· solo</span>' : "", '</span><input class="pair-check" type="checkbox" data-a="').concat(id, '" data-b="').concat(x.id, '" ').concat(checked ? "checked" : "", " ").concat(locked ? "disabled" : "", "></label>");
    }).join("");
    A.dialog("pairing", "You control the pairings.", '<p class="intro">Allowed pairs are symmetric. Changes save immediately. Solo exercises stay locked; every member of a triple must be compatible with every other member.</p><label class="field-label" for="pair-exercise">Choose an exercise</label><select id="pair-exercise" style="margin-bottom:20px">'.concat(opts, '</select><div class="pair-rule-list">').concat(rows, "</div>"), '<button class="btn ghost" data-action="reset-pairs">Reset all overrides</button><button class="btn primary" data-action="close-modal">Done '.concat(I("check", "sm"), "</button>"), { id }, true);
  };
  A.openBodyweight = () => {
    const s = A.s(), last = E.bodyweight(s);
    A.dialog("bodyweight", "A weekly check-in.", '<p class="intro">Record your body weight in kg. Pull Ups and Dips display body weight + added load. Each set keeps a snapshot of the body weight available that day.</p><div class="form-grid"><label><span class="field-label">Body weight · kg</span><input id="body-weight" type="number" min="1" max="500" step=".1" inputmode="decimal" value="'.concat(last != null ? last : "", '" placeholder="kg"></label><label><span class="field-label">Date</span><input id="body-date" type="date" value="').concat(E.localDate(), '" max="').concat(E.localDate(), '"></label></div><p class="form-hint">One entry per date. Saving the same date updates that entry. Past set snapshots do not change.</p>').concat(s.bodyweights.length ? '<hr class="card-rule">' + [...s.bodyweights].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8).map((b) => '<div class="between" style="padding:6px 0;font-size:11px"><span class="muted">'.concat(A.date(b.date + "T12:00:00"), '</span><strong class="grow text-right">').concat(A.kg(b.weight), ' kg</strong><button class="icon-btn" style="height:30px;width:30px;border:0" data-action="delete-bodyweight" data-date="').concat(b.date, '" aria-label="Remove bodyweight entry">').concat(I("close", "sm"), "</button></div>")).join("") : ""), close + '<button class="btn primary" data-action="save-bodyweight">Log weight ' + I("check", "sm") + "</button>");
  };
  A.openHistory = (id, editing = false) => {
    const s = A.s(), sess = s.sessions.find((x) => x.id === id);
    if (!sess) return;
    const datetime = E.localDate(sess.startedAt) + "T" + String(new Date(sess.startedAt).getHours()).padStart(2, "0") + ":" + String(new Date(sess.startedAt).getMinutes()).padStart(2, "0");
    const now = /* @__PURE__ */ new Date(), maxDatetime = E.localDate() + "T" + String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0");
    const rows = sess.records.map((r, i) => {
      const e = E.ex(s, r.exerciseId);
      return '<div class="history-set"><div class="history-set-name"><strong>'.concat(h(e.name), "</strong><small>").concat(r.warmup ? "Warm-up" : "Set", " ").concat(r.setIndex, " · ").concat(e.type === "timed" ? "seconds" : "reps").concat(r.rir !== null ? " · " + r.rir + " RIR" : "").concat(r.failed ? " · attempted / failed" : "", "</small></div>").concat(editing ? '<label><span class="soft" style="font-size:9px">kg</span><input class="history-weight" data-index="'.concat(i, '" type="number" min="0" max="1000" step=".25" value="').concat(r.weight, '" aria-label="').concat(h(e.name), ' weight"></label><label><span class="soft" style="font-size:9px">').concat(e.type === "timed" ? "sec" : "reps", '</span><input class="history-reps" data-index="').concat(i, '" type="number" min="0" max="3600" value="').concat(r.reps, '" aria-label="').concat(h(e.name), ' reps or seconds"></label><textarea class="history-note" data-index="').concat(i, '" aria-label="Set note" placeholder="Set note">').concat(h(r.note), "</textarea>").concat(!r.warmup ? '<div class="flex" style="grid-column:1/-1"><label class="check-label grow"><input class="history-failed" data-index="'.concat(i, '" type="checkbox" ').concat(r.failed ? "checked" : "", '>Attempted but failed</label><label class="flex"><span class="soft" style="font-size:9px">RIR</span><select class="history-rir" data-index="').concat(i, '" style="min-height:34px;padding:5px;font-size:10px;width:65px"><option value="">—</option>').concat([0, 1, 2, 3].map((v) => '<option value="'.concat(v, '" ').concat(r.rir === v ? "selected" : "", ">").concat(v === 3 ? "3+" : v, "</option>")).join(""), "</select></label></div>") : "") : '<div class="text-right">'.concat(A.kg(r.weight), ' kg</div><div class="text-right">').concat(r.reps).concat(e.type === "timed" ? "s" : "", "</div>").concat(r.note ? '<small style="grid-column:1/-1">'.concat(h(r.note), "</small>") : ""), "</div>");
    }).join("");
    A.dialog("history", A.fullDate(sess.startedAt), '<div class="notice info" style="margin-bottom:18px">'.concat(sess.records.filter((r) => !r.warmup).length, " working sets · ").concat(A.actualMinutes(sess.durationSeconds), " min actual / ~").concat(A.minutes(sess.estimateSeconds), " min estimated · ~").concat(A.savedMinutes(Math.max(0, sess.straightSeconds - sess.estimateSeconds)), " min planned superset saving. Actual savings are not directly measurable.</div>").concat(editing ? '<div class="form-grid"><label><span class="field-label">Session started</span><input id="history-date-edit" type="datetime-local" value="'.concat(datetime, '" max="').concat(maxDatetime, '"></label><label><span class="field-label">Duration · minutes</span><input id="history-duration" type="number" min="0" max="1440" step=".1" value="').concat(Math.round(sess.durationSeconds / 6) / 10, '"></label></div>') : "", '<div style="margin-top:15px">').concat(rows, '</div><div class="form-row" style="margin-top:20px"><label class="field-label">Session notes</label>').concat(editing ? '<textarea id="history-session-note">'.concat(h(sess.note), "</textarea>") : '<p class="intro">'.concat(sess.note ? h(sess.note) : "No session note.", "</p>"), "</div>"), editing ? close + '<button class="btn primary" data-action="save-history">Save changes ' + I("check", "sm") + "</button>" : '<button class="btn ghost" data-action="history-edit" data-id="'.concat(id, '">').concat(I("edit", "sm"), 'Edit this session</button><button class="btn primary" data-action="close-modal">Done</button>'), { id, editing }, true);
  };
  A.previewInfo = () => A.dialog("info", "The same app. Native where it matters.", '<p class="intro">This is the fully interactive browser preview of Forge. Try planning, logging, editing, charts, and JSON backups. Preview data stays in this browser.</p><div class="notice info">The Android APK adds private SQLite storage, a foreground rest-timer service, screen-off alarms, sound, vibration, local reminders, and Android’s file picker.</div><p class="intro" style="margin-top:18px">Browser tabs may be suspended in the background. For the gym, install the APK; do not rely on this preview for a screen-off timer. Export a JSON backup here if you want to move your preview data to Android.</p>', '<button class="btn primary" data-action="close-modal">Got it '.concat(I("check", "sm"), "</button>"));
  A.help = () => A.dialog("help", "A clear next step.", '<div class="stack"><div><h3>Double progression</h3><p class="form-hint">Reach the range ceiling on every working set at the target load, then review a higher load and reset to the range bottom. Otherwise, keep the load and build reps.</p></div><div><h3>Safe, loadable jumps</h3><p class="form-hint">Raises fit both your increment and the default 5% cap. Beat the ceiling by 2+ on every set for a double increment. If your smallest available step is too large, the app holds and lets you override manually.</p></div><div><h3>Effort & failure</h3><p class="form-hint">0 RIR at the ceiling holds the load for one more session. Miss the minimum on at least half of your sets twice consecutively for a 10% deload suggestion. Incomplete, skipped, substituted-original, and warm-up sets never cause a penalty.</p></div><div><h3>Timed & bodyweight work</h3><p class="form-hint">Timed holds build by 5 seconds until their ceiling, then suggest load or a harder variation. Farmer Carries raise load after all 40-second sets. Bodyweight work tracks attempts and successes; added-load raises use total body load when a weigh-in exists.</p></div><div><h3>You’re in charge</h3><p class="form-hint">COMMIT saves the session and generates Raise? / To? suggestions. Accept or edit each target in Progress. Nothing silently raises your weight. Charts are training estimates, not medical advice.</p></div></div>', '<button class="btn primary" data-action="close-modal">Back to training '.concat(I("arrow", "sm"), "</button>"));
})(window);
(function(root) {
  "use strict";
  const A = root.ForgeApp, E = A.E, h = A.escape, I = A.icon;
  const $ = (id) => document.getElementById(id);
  const n = (id, min, max, integer = false) => {
    const el = $(id);
    if (!el || el.value.trim() === "") throw new Error("Please fill in " + ((el == null ? void 0 : el.getAttribute("aria-label")) || id.replaceAll("-", " ")) + ".");
    const value = Number(el.value);
    if (!Number.isFinite(value) || value < min || value > max || integer && !Number.isInteger(value)) throw new Error("Use " + (integer ? "a whole number" : "a number") + " from " + min + " to " + max + ".");
    return value;
  };
  let audio, wakeLock, requestingWake = false;
  A.screenAwake = async () => {
    if (A.Store.native || !navigator.wakeLock) return;
    if (A.s().session && A.s().settings.keepAwake && document.visibilityState === "visible") {
      if (wakeLock && !wakeLock.released || requestingWake) return;
      requestingWake = true;
      try {
        wakeLock = await navigator.wakeLock.request("screen");
      } catch (e) {
      } finally {
        requestingWake = false;
      }
    } else if (wakeLock) {
      try {
        await wakeLock.release();
      } catch (e) {
      }
      wakeLock = null;
    }
  };
  const enableAudio = () => {
    try {
      if (!audio) audio = new (root.AudioContext || root.webkitAudioContext)();
      if (audio.state === "suspended") audio.resume();
    } catch (e) {
    }
  };
  A.alert = () => {
    if (A.Store.native) {
      root.Native.testAlert(A.s().settings.sound, A.s().settings.vibrate);
      return;
    }
    if (A.s().settings.vibrate && navigator.vibrate) navigator.vibrate([180, 80, 180]);
    if (A.s().settings.sound) {
      enableAudio();
      if (audio) {
        [880, 660].forEach((freq, i) => {
          const o = audio.createOscillator(), g = audio.createGain(), t = audio.currentTime + i * 0.23;
          o.type = "sine";
          o.frequency.value = freq;
          g.gain.setValueAtTime(0, t);
          g.gain.linearRampToValueAtTime(0.14, t + 0.02);
          g.gain.exponentialRampToValueAtTime(1e-3, t + 0.2);
          o.connect(g);
          g.connect(audio.destination);
          o.start(t);
          o.stop(t + 0.22);
        });
      }
    }
  };
  A.scheduleTimer = () => {
    var _a;
    const s = A.s(), timer = (_a = s.session) == null ? void 0 : _a.timer;
    if (!timer) return;
    const task = s.session.queue[0];
    const label = task ? E.ex(s, task.exerciseId).name + " · " + A.load(E.ex(s, task.exerciseId), task.weight, task.reps) : "Last set complete · confirm and COMMIT";
    if (A.Store.native) root.Native.startTimer(Math.round(timer.deadline), timer.kind, label, s.settings.sound, s.settings.vibrate);
    else enableAudio();
  };
  A.cancelTimer = () => {
    if (A.Store.native) root.Native.cancelTimer();
    if (A.s().session) A.s().session.timer = null;
  };
  A.captureLog = (strict = false) => {
    var _a;
    const sess = A.s().session, rec = sess == null ? void 0 : sess.records.find((r) => r.id === sess.pendingLogId);
    if (!rec || !$("log-reps")) return;
    if (strict) {
      rec.reps = n("log-reps", 0, 3600, true);
      rec.weight = n("log-weight", 0, 1e3);
    } else {
      const rr = Number($("log-reps").value), ww = Number($("log-weight").value);
      if (Number.isInteger(rr) && rr >= 0 && rr <= 3600) rec.reps = rr;
      if (Number.isFinite(ww) && ww >= 0 && ww <= 1e3) rec.weight = ww;
    }
    rec.note = ((_a = $("log-note")) == null ? void 0 : _a.value.slice(0, 2e3)) || "";
    if ($("log-failed")) rec.failed = $("log-failed").checked;
  };
  A.buildPlan = () => {
    const s = A.s();
    A.ui.planned = E.plan(s, s.settings.selectedBlocks, s.settings.budget);
    if (!A.ui.planned.entries.length) {
      A.toast("Select a muscle block with active exercises.");
      return;
    }
    A.navigate("session");
  };
  A.refreshPlanned = () => {
    if (A.ui.planned && !A.s().session) A.ui.planned = E.plan(A.s(), A.s().settings.selectedBlocks, A.s().settings.budget);
  };
  const syncReminders = () => {
    if (A.Store.native) root.Native.setReminders(JSON.stringify(A.s().settings.reminders));
  };
  const refreshActiveTimer = () => {
    var _a;
    if ((_a = A.s().session) == null ? void 0 : _a.timer) A.scheduleTimer();
  };
  const confirmPending = () => {
    const sess = A.s().session, rec = sess == null ? void 0 : sess.records.find((r) => r.id === sess.pendingLogId);
    if (!rec) return;
    A.captureLog(true);
    rec.confirmed = true;
    rec.failed = rec.failed || !rec.warmup && rec.reps < rec.min;
    sess.pendingLogId = null;
  };
  const commitActual = () => {
    const sess = A.s().session;
    if (!sess) return;
    confirmPending();
    if ($("finish-note")) sess.note = $("finish-note").value.slice(0, 5e3);
    A.cancelTimer();
    const done = E.finishSession(A.s());
    A.ui.lastCommitted = done.id;
    A.ui.planned = null;
    const first = done.records.find((r) => !r.warmup);
    if (first) A.ui.progressExercise = first.exerciseId;
    A.save();
    A.navigate("progress");
    A.toast("COMMITTED. Every set is saved.");
  };
  const recomputeSuggestions = () => {
    const s = A.s();
    for (const e of s.exercises) {
      const last = E.exerciseHistory(s, e.id).pop();
      if (!last) {
        delete s.suggestions[e.id];
        continue;
      }
      const sug = E.suggestion(s, e, last.session);
      if (!sug) continue;
      const prev = s.suggestions[e.id];
      if (prev && prev.accepted && prev.sessionId === sug.sessionId && prev.kind === sug.kind && prev.weight === sug.weight && prev.reps === sug.reps) sug.accepted = true;
      s.suggestions[e.id] = sug;
    }
  };
  A.importData = (text) => {
    try {
      if (text.length > 64 * 1024 * 1024) throw new Error("Backup is larger than the 64 MB safety limit.");
      const imported = JSON.parse(text);
      E.validate(imported);
      A.dialog("restore", "Restore this workspace?", '<p class="intro">This replaces <b>all current data</b>. Export a backup first if you want to keep it.</p><div class="summary-values"><div class="summary-line"><span>Exercises</span><strong>'.concat(imported.exercises.length, '</strong></div><div class="summary-line"><span>Saved sessions</span><strong>').concat(imported.sessions.length, '</strong></div><div class="summary-line"><span>Body weight entries</span><strong>').concat(imported.bodyweights.length, '</strong></div><div class="summary-line"><span>Active workout</span><strong>').concat(imported.session ? "Yes · will resume" : "No", '</strong></div></div><div class="notice">Restoring is all-or-nothing. Invalid or unsupported files are rejected without changing your data.</div>'), '<button class="btn ghost" data-action="close-modal">Cancel</button><button class="btn primary" data-action="restore-confirm">Restore all data '.concat(I("upload", "sm"), "</button>"), { imported });
    } catch (e) {
      A.toast("Restore rejected: " + e.message, 7e3);
    }
  };
  const actions = {
    "nav": (d) => {
      A.captureLog();
      A.save();
      A.navigate(d.route);
    },
    "close-modal": () => A.close(),
    "preview-info": () => A.previewInfo(),
    "help": () => A.help(),
    "confirm-dialog": () => {
      const data = A.ui.modal.data;
      A.close();
      if (data.action === "commit-actual") commitActual();
      else if (data.action === "discard-session-actual") {
        A.cancelTimer();
        A.s().session = null;
        A.ui.planned = null;
        A.save();
        A.navigate("today");
        A.toast("Session discarded. Saved history is unchanged.");
      } else if (data.action === "reset-pairs-actual") {
        A.s().pairOverrides = {};
        A.save();
        A.openPairing(data.id);
      } else if (data.action === "archive-actual") {
        const e = E.ex(A.s(), data.id);
        e.active = false;
        A.save();
        A.refreshPlanned();
        A.render();
        A.toast("Archived. History and targets are preserved.");
      }
    },
    "block-toggle": (d) => {
      const s = A.s(), sel = s.settings.selectedBlocks;
      s.settings.selectedBlocks = sel.includes(d.id) ? sel.filter((id) => id !== d.id) : [...sel, d.id];
      A.ui.planned = null;
      A.save();
      A.render();
    },
    "plan-workout": () => {
      if (A.s().session) {
        A.navigate("session");
        return;
      }
      const p = E.plan(A.s(), A.s().settings.selectedBlocks, A.s().settings.budget);
      if (!p.entries.length) {
        A.toast("Choose at least one muscle block.");
        return;
      }
      const unknown = p.entries.map((x) => x.exerciseId).filter((id) => A.s().targets[id].weight === null);
      if (unknown.length) A.openStarts(unknown);
      else A.buildPlan();
    },
    "conservative-starts": () => {
      document.querySelectorAll(".start-weight").forEach((input) => {
        const e = E.ex(A.s(), input.dataset.id);
        input.value = E.roundWeight(A.s(), e, e.suggested);
      });
      A.toast("Conservative suggestions filled. Review them before continuing.", 5e3);
    },
    "save-starts": () => {
      const data = A.ui.modal.data;
      const values = [];
      document.querySelectorAll(".start-weight").forEach((input) => {
        if (input.value.trim() === "") throw new Error("Enter every weight, or use conservative starts.");
        const w = Number(input.value);
        if (!Number.isFinite(w) || w < 0 || w > 1e3) throw new Error("Weights must be between 0 and 1,000 kg.");
        values.push([input.dataset.id, w]);
      });
      values.forEach(([id, w]) => {
        const e = E.ex(A.s(), id);
        A.s().targets[id] = { weight: E.roundWeight(A.s(), e, w), reps: A.s().targets[id].reps };
      });
      if (data.purpose === "substitute") {
        const en = A.s().session.entries.find((x) => x.id === data.entryId);
        const t = E.target(A.s(), E.ex(A.s(), en.exerciseId));
        en.targetWeight = t.weight;
        en.targetReps = t.reps;
        A.s().session.queue = E.planEntries(A.s(), A.s().session.entries, A.s().session.records).queue;
      }
      A.save();
      A.close();
      if (data.purpose === "plan") A.buildPlan();
      else {
        refreshActiveTimer();
        A.render();
      }
    },
    "start-workout": () => {
      if (A.s().session) {
        A.navigate("session");
        return;
      }
      if (!A.ui.planned) return;
      A.s().session = E.newSession(A.s(), A.ui.planned);
      A.save();
      A.render();
      window.scrollTo({ top: 0, behavior: "instant" });
      if (A.Store.native && !A.Store.permissions().notifications) root.Native.requestNotifications();
    },
    "set-done": () => {
      if (!A.s().session || A.s().session.pendingLogId || A.s().session.timer) return;
      enableAudio();
      const rec = E.completeSet(A.s());
      if (!rec) return;
      A.scheduleTimer();
      A.save();
      A.render();
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    "confirm-set": () => {
      confirmPending();
      A.save();
      A.render();
      A.toast("Set saved.", 1400);
    },
    "set-rir": (d) => {
      A.captureLog();
      const sess = A.s().session, rec = sess == null ? void 0 : sess.records.find((r) => r.id === sess.pendingLogId);
      if (!rec) return;
      const v = Number(d.value);
      rec.rir = rec.rir === v ? null : v;
      A.save();
      A.render();
    },
    "timer-adjust": (d) => {
      var _a;
      const t = (_a = A.s().session) == null ? void 0 : _a.timer;
      if (!t) return;
      A.captureLog();
      const delta = Number(d.delta);
      t.deadline = Math.max(Date.now() + 1e3, t.deadline + delta * 1e3);
      t.total = Math.max(1, t.total + delta);
      A.scheduleTimer();
      A.save();
      A.render();
    },
    "timer-skip": () => {
      A.captureLog();
      A.cancelTimer();
      A.save();
      A.render();
    },
    "undo": () => {
      var _a;
      if (!((_a = A.s().session) == null ? void 0 : _a.records.length)) return;
      A.cancelTimer();
      E.undoSet(A.s());
      A.save();
      A.render();
      A.toast("Last set undone. No history or progression penalty.");
    },
    "unavailable": (d) => {
      var _a;
      if ((_a = A.s().session) == null ? void 0 : _a.pendingLogId) {
        A.toast("Confirm the set you just finished first.");
        return;
      }
      const result = E.substitute(A.s(), d.entry);
      if (result.error) {
        A.toast(result.error, 5e3);
        return;
      }
      A.save();
      refreshActiveTimer();
      A.render();
      A.toast("Swapped to " + result.exercise.name + ". Original progression is untouched.", 5e3);
      if (result.needsWeight) A.openStarts([result.exercise.id], "substitute", result.entry.id);
    },
    "skip-exercise": (d) => {
      var _a;
      if ((_a = A.s().session) == null ? void 0 : _a.pendingLogId) {
        A.toast("Confirm your previous set first.");
        return;
      }
      E.skip(A.s(), d.entry);
      A.save();
      refreshActiveTimer();
      A.render();
      A.toast("Skipped today. No progression penalty.");
    },
    "session-note": () => {
      const sess = A.s().session;
      if (!sess) return;
      A.captureLog();
      A.dialog("session-note", "How did today feel?", '<p class="intro">Sleep, mood, energy, pain, or anything worth remembering.</p><textarea id="session-note-edit" maxlength="5000" placeholder="A note to your future self…">'.concat(h(sess.note), "</textarea>"), '<button class="btn ghost" data-action="close-modal">Cancel</button><button class="btn primary" data-action="save-session-note">Save note '.concat(I("check", "sm"), "</button>"));
    },
    "save-session-note": () => {
      A.s().session.note = $("session-note-edit").value.slice(0, 5e3);
      A.save();
      A.close();
      A.render();
    },
    "end-early": () => {
      A.captureLog();
      A.confirm("Finish early?", "COMMIT saves your completed sets. Incomplete or skipped exercises do not affect progression. Any unconfirmed target-prefilled set will be saved as shown.", "commit-actual", "COMMIT & save");
    },
    "discard-session": () => A.confirm("Discard this workout?", "Completed sets in this active session will be removed. Your saved history and accepted targets are not changed.", "discard-session-actual", "Discard workout"),
    "commit": () => {
      var _a;
      if ((_a = A.s().session) == null ? void 0 : _a.queue.length) {
        actions["end-early"]();
        return;
      }
      commitActual();
    },
    "target-edit": (d) => A.openTarget(d.id),
    "suggestion-edit": (d) => A.openTarget(d.id, true),
    "save-target": () => {
      const data = A.ui.modal.data, e = E.ex(A.s(), data.id), weight = E.roundWeight(A.s(), e, n("target-weight", 0, 1e3)), reps = n("target-reps", e.min, e.max, true);
      A.s().targets[e.id] = { weight, reps };
      if (A.s().suggestions[e.id]) A.s().suggestions[e.id].accepted = true;
      A.save();
      A.refreshPlanned();
      A.close();
      A.render();
      A.toast("Next target saved: " + A.load(e, weight, reps));
    },
    "accept-suggestion": (d) => {
      E.accept(A.s(), d.id);
      A.save();
      A.refreshPlanned();
      A.render();
      A.toast("Next target accepted.");
    },
    "chart-mode": (d) => {
      A.ui.chartMode = d.value;
      A.render();
    },
    "analyze": (d) => {
      A.ui.progressExercise = d.id;
      A.navigate("progress");
    },
    "history-day": (d) => {
      A.ui.historyDate = A.ui.historyDate === d.date ? null : d.date;
      A.render();
    },
    "history-clear": () => {
      A.ui.historyDate = null;
      A.render();
    },
    "calendar-month": (d) => {
      const c = A.ui.calendar;
      A.ui.calendar = new Date(c.getFullYear(), c.getMonth() + Number(d.delta), 1);
      A.render();
    },
    "history-session": (d) => A.openHistory(d.id),
    "history-edit": (d) => A.openHistory(d.id, true),
    "save-history": () => {
      const sess = A.s().sessions.find((x) => x.id === A.ui.modal.data.id);
      const recs = E.clone(sess.records);
      document.querySelectorAll(".history-weight").forEach((el) => {
        const v = Number(el.value);
        if (el.value === "" || !Number.isFinite(v) || v < 0 || v > 1e3) throw new Error("Invalid set weight.");
        recs[Number(el.dataset.index)].weight = v;
      });
      document.querySelectorAll(".history-reps").forEach((el) => {
        const v = Number(el.value);
        if (el.value === "" || !Number.isInteger(v) || v < 0 || v > 3600) throw new Error("Invalid reps or seconds.");
        recs[Number(el.dataset.index)].reps = v;
      });
      document.querySelectorAll(".history-note").forEach((el) => recs[Number(el.dataset.index)].note = el.value.slice(0, 2e3));
      document.querySelectorAll(".history-failed").forEach((el) => {
        const r = recs[Number(el.dataset.index)];
        r.failed = el.checked || r.reps < r.min;
      });
      document.querySelectorAll(".history-rir").forEach((el) => recs[Number(el.dataset.index)].rir = el.value === "" ? null : Number(el.value));
      const startedAt = new Date($("history-date-edit").value).getTime();
      if (!Number.isFinite(startedAt)) throw new Error("Invalid session date.");
      if (startedAt > Date.now()) throw new Error("Choose a session date up to today.");
      const durationSeconds = Math.round(n("history-duration", 0, 1440) * 60);
      sess.records = recs;
      sess.startedAt = startedAt;
      sess.durationSeconds = durationSeconds;
      sess.endedAt = startedAt + durationSeconds * 1e3;
      sess.note = $("history-session-note").value.slice(0, 5e3);
      A.s().sessions.sort((a, b) => a.startedAt - b.startedAt);
      recomputeSuggestions();
      A.save();
      A.close();
      A.render();
      A.toast("Session updated. Suggestions recalculated; accepted targets stay under your control.", 5500);
    },
    "bodyweight": () => A.openBodyweight(),
    "save-bodyweight": () => {
      const weight = n("body-weight", 1, 500), date = $("body-date").value;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date > E.localDate()) throw new Error("Choose a valid date up to today.");
      A.s().bodyweights = A.s().bodyweights.filter((b) => b.date !== date);
      A.s().bodyweights.push({ date, weight });
      A.save();
      A.close();
      A.render();
      A.toast("Body weight logged.");
    },
    "delete-bodyweight": (d) => {
      A.s().bodyweights = A.s().bodyweights.filter((b) => b.date !== d.date);
      A.save();
      A.openBodyweight();
      A.render();
    },
    "library-filter": (d) => {
      A.ui.libraryBlock = d.id;
      A.render();
    },
    "exercise-add": () => {
      if (A.s().session) {
        A.toast("Finish your active workout before changing exercise definitions.");
        return;
      }
      A.openExercise();
    },
    "exercise-edit": (d) => {
      if (A.s().session) {
        A.toast("Finish your active workout before changing exercise definitions.");
        return;
      }
      A.openExercise(d.id);
    },
    "exercise-reorder": (d) => {
      const e = E.ex(A.s(), d.id);
      const list = A.s().exercises.filter((x) => x.active && x.primary === e.primary && x.block === e.block).sort((a, b) => a.order - b.order), idx = list.indexOf(e), other = list[idx + Number(d.delta)];
      if (other) {
        [e.order, other.order] = [other.order, e.order];
        A.save();
        A.refreshPlanned();
        A.render();
      }
    },
    "sub-add": () => {
      const id = $("sub-add-select").value, subs = A.ui.modal.data.substitutes;
      if (!subs.includes(id)) subs.push(id);
      A.renderSubs();
    },
    "sub-remove": (d) => {
      A.ui.modal.data.substitutes.splice(Number(d.index), 1);
      A.renderSubs();
    },
    "sub-move": (d) => {
      const subs = A.ui.modal.data.substitutes, i = Number(d.index), j = i + Number(d.delta);
      if (j >= 0 && j < subs.length) [subs[i], subs[j]] = [subs[j], subs[i]];
      A.renderSubs();
    },
    "save-exercise": () => {
      const data = A.ui.modal.data, e = E.clone(data.e);
      e.name = $("edit-name").value.trim();
      e.muscle = $("edit-muscle").value.trim();
      if (!e.name || !e.muscle) throw new Error("Name and primary muscle are required.");
      e.block = $("edit-block").value;
      e.type = $("edit-type").value;
      e.min = n("edit-min", 1, 3600, true);
      e.max = n("edit-max", e.min, 3600, true);
      e.sets = n("edit-sets", 1, 20, true);
      e.rest = $("edit-rest").value === "" ? null : n("edit-rest", 0, 1800, true);
      e.equipment = $("edit-equipment").value;
      e.equipmentTag = $("edit-equipment-tag").value.trim().slice(0, 120);
      e.increment = n("edit-increment", 0.01, 100);
      e.priority = Number($("edit-priority").value);
      e.group = $("edit-group").value;
      if (["deadlift", "squats", "farmer-carries"].includes(e.id)) e.group = "SOLO";
      e.primary = $("edit-primary").checked;
      e.compound = $("edit-compound").checked;
      e.warmup = $("edit-warmup").checked;
      e.active = $("edit-active").checked;
      e.note = $("edit-note").value.slice(0, 2e3);
      e.substitutes = [...data.substitutes];
      if (data.id) {
        A.s().exercises = A.s().exercises.map((x) => x.id === e.id ? e : x);
        A.s().targets[e.id].reps = Math.min(e.max, Math.max(e.min, A.s().targets[e.id].reps));
        if (A.s().targets[e.id].weight !== null) A.s().targets[e.id].weight = E.roundWeight(A.s(), e, A.s().targets[e.id].weight);
      } else {
        A.s().exercises.push(e);
        A.s().targets[e.id] = { weight: e.type === "bodyweight" || e.equipment === "bodyweight" ? 0 : null, reps: e.min };
      }
      A.save();
      A.refreshPlanned();
      A.close();
      A.render();
      A.toast("Exercise saved.");
    },
    "archive-exercise": (d) => A.confirm("Archive this exercise?", "It is removed from new routines, not from your history. Show archived exercises in the Library to bring it back.", "archive-actual", "Archive", { id: d.id }),
    "setting-toggle": (d) => {
      A.captureLog();
      A.s().settings[d.key] = !A.s().settings[d.key];
      A.save();
      A.refreshPlanned();
      if (["sound", "vibrate"].includes(d.key)) refreshActiveTimer();
      A.render();
    },
    "save-timers": () => {
      const next = { rest: n("setting-rest", 0, 1800, true), transition: n("setting-transition", 0, 120, true), warmupRest: n("setting-warmupRest", 0, 300, true) };
      Object.assign(A.s().settings, next);
      A.save();
      A.refreshPlanned();
      A.toast("Defaults saved. New plans use these times; the current countdown is unchanged.");
    },
    "save-progression": () => {
      A.s().settings.safeJump = n("setting-safeJump", 1, 100);
      A.s().settings.stallSessions = n("setting-stallSessions", 2, 20, true);
      recomputeSuggestions();
      A.save();
      A.render();
      A.toast("Progression preferences saved.");
    },
    "equipment": () => A.openEquipment(),
    "save-equipment": () => {
      const cfg = E.clone(A.s().settings);
      cfg.barWeight = n("equipment-bar", 0, 100);
      cfg.plates = $("equipment-plates").value.split(",").map((v) => v.trim()).filter(Boolean).map((v) => {
        const m = v.match(/^(\d+(?:\.\d+)?)\s*[x×:]\s*(\d+)$/i);
        if (!m) throw new Error("Use plates like 1.25x2, 5x2.");
        const weight = Number(m[1]), pairs = Number(m[2]);
        if (weight < 0.1 || weight > 100 || pairs < 0 || pairs > 12) throw new Error("Plate weight 0.1–100 kg; 0–12 pairs.");
        return { weight, pairs };
      });
      if (cfg.plates.length > 20) throw new Error("Use at most 20 plate denominations.");
      for (const key of ["dumbbells", "cables", "machines", "addedLoads"]) {
        const values = $("equipment-" + key).value.split(",").map((v) => v.trim()).filter(Boolean).map(Number);
        if (!values.length || values.length > 1e3 || values.some((v) => !Number.isFinite(v) || v < 0 || v > 1e3)) throw new Error("Enter a nonempty comma-separated load list from 0 to 1,000 kg.");
        cfg[key] = [...new Set(values)].sort((a, b) => a - b);
      }
      if (!cfg.addedLoads.includes(0)) cfg.addedLoads.unshift(0);
      A.s().settings = cfg;
      for (const e of A.s().exercises) {
        const t = A.s().targets[e.id];
        if (t.weight !== null) t.weight = E.roundWeight(A.s(), e, t.weight);
      }
      recomputeSuggestions();
      A.save();
      A.refreshPlanned();
      A.close();
      A.render();
      A.toast("Loadable weights updated.");
    },
    "pairing": () => A.openPairing(),
    "reset-pairs": () => A.confirm("Reset pairing overrides?", "This clears your per-exercise overrides and restores the default symmetric group rules. Exercise group assignments stay as you edited them.", "reset-pairs-actual", "Reset", { id: A.ui.modal.data.id }),
    "reminder-day": (d) => {
      const days = A.s().settings.reminders.days, day = Number(d.day);
      A.s().settings.reminders.days = days.includes(day) ? days.filter((x) => x !== day) : [...days, day];
      A.save();
      syncReminders();
      A.render();
    },
    "notification-permission": () => {
      if (!A.Store.native) {
        A.previewInfo();
        return;
      }
      root.Native.requestNotifications();
    },
    "alarm-permission": () => {
      if (!A.Store.native) {
        A.previewInfo();
        return;
      }
      root.Native.requestExactAlarms();
    },
    "test-alert": () => {
      A.alert();
      A.toast("Completion alert tested. Check media / alarm volume if silent.");
    },
    "export": () => {
      A.captureLog();
      A.save();
      const json = JSON.stringify(__spreadProps(__spreadValues({}, E.clone(A.s())), { exportedAt: (/* @__PURE__ */ new Date()).toISOString() }), null, 2), name = "forge-backup-" + E.localDate() + ".json";
      if (A.Store.native) {
        root.Native.exportBackup(json, name);
        A.toast("Choose where to save your backup.");
      } else {
        const url = URL.createObjectURL(new Blob([json], { type: "application/json" })), a = document.createElement("a");
        a.href = url;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 2e3);
        A.toast("JSON backup exported.");
      }
    },
    "import": () => {
      if (A.Store.native) root.Native.importBackup();
      else $("backup-file").click();
    },
    "restore-confirm": () => {
      var _a, _b;
      const imported = E.clone(A.ui.modal.data.imported);
      A.cancelTimer();
      A.Store.state = imported;
      A.ui.planned = null;
      A.ui.lastCommitted = null;
      A.ui.progressExercise = imported.exercises[0].id;
      if (((_a = imported.session) == null ? void 0 : _a.timer) && imported.session.timer.deadline <= Date.now()) imported.session.timer = null;
      A.save();
      syncReminders();
      if ((_b = imported.session) == null ? void 0 : _b.timer) A.scheduleTimer();
      A.close();
      A.navigate(imported.session ? "session" : "today");
      A.toast("Workspace restored. All data stays on this device.");
    }
  };
  A.actions = actions;
  document.addEventListener("click", (event) => {
    const target = event.target.closest("[data-action]");
    if (!target || target.disabled) return;
    const action = actions[target.dataset.action];
    if (!action) return;
    event.preventDefault();
    try {
      action(target.dataset, event, target);
    } catch (e) {
      A.toast(e.message, 5e3);
      console.warn("Forge:", e.message);
    }
  });
  document.addEventListener("change", (event) => {
    var _a;
    const el = event.target, s = A.s();
    try {
      if (el.id === "time-budget") {
        const v = el.value === "" ? null : Number(el.value);
        if (v !== null && (!Number.isFinite(v) || v < 5 || v > 240)) throw new Error("Time budget: 5–240 minutes, or leave blank.");
        s.settings.budget = v;
        A.ui.planned = null;
        A.save();
        A.render();
      }
      if (el.id === "progress-exercise") {
        A.ui.progressExercise = el.value;
        A.render();
      }
      if (el.id === "preview-block") {
        A.ui.previewBlock = el.value;
        A.render();
      }
      if (el.id === "show-subs") {
        A.ui.showSubs = el.checked;
        A.render();
      }
      if (el.id === "show-archived") {
        A.ui.showArchived = el.checked;
        A.render();
      }
      if (el.id === "pair-exercise") A.openPairing(el.value);
      if (el.classList.contains("pair-check")) {
        const ea = E.ex(s, el.dataset.a), eb = E.ex(s, el.dataset.b), k = E.key(ea.id, eb.id), defaultValue = E.canPair(__spreadProps(__spreadValues({}, s), { pairOverrides: {} }), ea, eb);
        if (defaultValue === el.checked) delete s.pairOverrides[k];
        else s.pairOverrides[k] = el.checked;
        A.save();
        A.refreshPlanned();
      }
      if (el.id === "reminder-time") {
        if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(el.value)) throw new Error("Choose a valid reminder time.");
        s.settings.reminders.time = el.value;
        A.save();
        syncReminders();
      }
      if (["log-reps", "log-weight", "log-note", "log-failed"].includes(el.id)) {
        A.captureLog();
        A.save();
      }
      if (el.id === "edit-type" && el.value === "bodyweight") $("edit-equipment").value = "bodyweight";
      if (el.id === "backup-file" && ((_a = el.files) == null ? void 0 : _a.length)) {
        const file = el.files[0];
        if (file.size > 64 * 1024 * 1024) throw new Error("Backup exceeds the 64 MB limit.");
        file.text().then(A.importData).catch((e) => A.toast(e.message));
        el.value = "";
      }
    } catch (e) {
      A.toast(e.message, 6e3);
    }
  });
  document.addEventListener("input", (event) => {
    var _a, _b;
    const el = event.target;
    if (el.id === "exercise-search") {
      const caret = el.selectionStart;
      A.ui.search = el.value;
      A.render();
      (_a = $("exercise-search")) == null ? void 0 : _a.focus();
      (_b = $("exercise-search")) == null ? void 0 : _b.setSelectionRange(caret, caret);
    }
    if (["log-reps", "log-weight", "log-note", "log-failed"].includes(el.id)) {
      A.captureLog();
      A.save();
    }
    if (el.id === "finish-note" && A.s().session) {
      A.s().session.note = el.value.slice(0, 5e3);
      A.save();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (!A.ui.modal) return;
    if (event.key === "Escape") {
      A.close();
      return;
    }
    if (event.key === "Tab") {
      const focusable = [...document.querySelectorAll(".modal button:not(:disabled),.modal input:not(:disabled),.modal select,.modal textarea")].filter((e) => e.offsetParent !== null);
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last == null ? void 0 : last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first == null ? void 0 : first.focus();
      }
    }
  });
  const expire = () => {
    var _a;
    if (!((_a = A.s().session) == null ? void 0 : _a.timer)) return;
    A.captureLog();
    A.s().session.timer = null;
    A.save();
    if (!A.Store.native) A.alert();
    A.render();
    A.toast(A.s().session.queue.length ? "Rest complete. Your next set is ready." : "Final rest complete. Confirm and COMMIT.", 2200);
  };
  setInterval(() => {
    var _a;
    const timer = (_a = A.s().session) == null ? void 0 : _a.timer;
    if (!timer) return;
    const left = Math.max(0, Math.ceil((timer.deadline - Date.now()) / 1e3));
    if ($("timer-text")) $("timer-text").textContent = A.time(left);
    if ($("floating-timer-text")) $("floating-timer-text").textContent = A.time(left);
    if ($("timer-ring")) $("timer-ring").setAttribute("stroke-dashoffset", String(320.44 * (1 - Math.min(1, left / Math.max(1, timer.total)))));
    if (timer.deadline <= Date.now()) expire();
  }, 250);
  A.syncNativeTimer = (text = null) => {
    var _a;
    if (!A.Store.native || !root.Native.timerState) return;
    try {
      const status = JSON.parse(text || root.Native.timerState()), t = (_a = A.s().session) == null ? void 0 : _a.timer;
      if (t && (Number(status.cancelled) === t.deadline || Number(status.delivered) === t.deadline)) {
        A.captureLog();
        A.s().session.timer = null;
        A.save();
        A.render();
      }
    } catch (e) {
    }
  };
  root.onNativeTimerState = (text) => A.syncNativeTimer(text);
  root.onNativeTimerFinished = (deadline) => {
    var _a;
    const t = (_a = A.s().session) == null ? void 0 : _a.timer;
    if (t && Math.abs(t.deadline - Number(deadline)) < 500) expire();
  };
  root.onNativeTimerCancelled = (deadline) => {
    var _a;
    const t = (_a = A.s().session) == null ? void 0 : _a.timer;
    if (t && Math.abs(t.deadline - Number(deadline)) < 500) {
      A.captureLog();
      A.s().session.timer = null;
      A.save();
      A.render();
    }
  };
  root.onNativeImport = (text) => A.importData(text);
  root.onNativeMessage = (text) => A.toast(text, 5e3);
  root.onNativePermissions = () => {
    if (A.ui.route === "settings" && !A.ui.modal) A.render();
  };
  root.onNativeBack = () => {
    if (A.ui.modal) {
      A.close();
      return true;
    }
    if (A.ui.route !== "today" && !A.s().session) {
      A.navigate("today");
      return true;
    }
    if (A.ui.route !== "session" && A.s().session) {
      A.navigate("session");
      return true;
    }
    return false;
  };
  document.addEventListener("visibilitychange", () => {
    var _a;
    if (document.visibilityState === "visible") {
      A.screenAwake();
      if (((_a = A.s().session) == null ? void 0 : _a.timer) && A.s().session.timer.deadline <= Date.now()) expire();
    } else {
      A.captureLog();
      A.save();
    }
  });
  A.render();
  A.screenAwake();
  if (A.Store.native) syncReminders();
  if (A.s().session) {
    A.syncNativeTimer();
    if (A.s().session.timer) {
      if (A.s().session.timer.deadline <= Date.now()) A.s().session.timer = null;
      else A.scheduleTimer();
    }
    A.toast("Workout resumed. Your last set is safe.", 4e3);
    A.render();
  }
  if (!A.Store.error) A.save();
  if (A.Store.error) A.dialog("storage-error", "A storage file needs attention.", '<p class="intro">Your saved state could not be read: '.concat(h(A.Store.error), ". Restore a valid JSON backup in Settings. The app has not overwritten the unreadable state; continuing and making changes creates a new state.</p>"), '<button class="btn ghost" data-action="import">Restore a backup</button><button class="btn primary" data-action="close-modal">Continue with a fresh workspace</button>');
})(window);
