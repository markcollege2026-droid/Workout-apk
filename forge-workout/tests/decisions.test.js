/* Regression tests for persistent progression-recommendation decisions.
   A recommendation is one persisted record per exercise, tied to the completed
   performance that generated it. ACCEPTED / REJECTED / DEFERRED / pending must survive
   recalculation, history edits, settings and equipment changes, restarts and backups. */
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM}=require('jsdom');
const Seed=require('../www/seed.js');
const E=require('../www/engine.js');

const get=(s,id)=>E.ex(s,id);
const state=()=>Seed.createState();

let clock=Date.now();
const tick=()=>{clock+=60000;return clock;};

function entry(s,id,{sets=null,targetWeight=100,targetReps=null,manual=false,skipped=false}={}){
  const e=get(s,id);
  return {id:E.uid(),exerciseId:id,sourceId:id,pairGroup:e.group,sets:sets??e.sets,
    targetWeight,targetReps:targetReps??e.min,manualTarget:manual,skipped};
}
function start(s,entries,at=tick()){
  const p=E.planEntries(s,entries);
  s.session={id:E.uid(),startedAt:at,endedAt:null,blocks:['chest'],entries:E.clone(entries),
    queue:E.clone(p.queue),records:[],timer:null,workTimer:null,pendingLogId:null,note:'',
    estimateSeconds:p.seconds,straightSeconds:p.straightSeconds,dropped:[],
    exerciseSnapshot:Object.fromEntries(s.exercises.map(e=>[e.id,E.clone(e)]))};
  return s.session;
}
function logAll(s,reps){
  while(s.session.queue.length){
    const task=s.session.queue[0];
    const rec=E.completeSet(s,{reps:typeof reps==='function'?reps(task):reps});
    assert(rec,'every queued set must complete');
    rec.confirmed=true;s.session.pendingLogId=null;s.session.timer=null;
  }
  s.session.timer=null;
}
/* A finished workout for one exercise at its range ceiling. Returns the stored session. */
function workout(s,id,reps,at=tick()){
  s.settings.warmups=false;
  const e=get(s,id);
  s.targets[id]=s.targets[id]||{weight:100,reps:e.min};
  const target=targetOf(s,id);
  start(s,[entry(s,id,{targetWeight:target.weight,targetReps:e.max})],at);
  logAll(s,reps);
  const done=E.finishSession(s);
  return done;
}
function targetOf(s,id){
  // Use the engine's own resolved target so automatic rounding never surprises a test.
  return E.target(s,get(s,id));
}

// ---------------------------------------------------------------------------
// 1. Acceptance persistence
// ---------------------------------------------------------------------------

test('accepting applies the target once and is never asked again',()=>{
  const s=state();
  s.targets['bench-press']={weight:100,reps:8};
  const perf=workout(s,'bench-press',10);
  const rec=s.suggestions['bench-press'];
  assert.equal(rec.decision,'pending');
  assert.equal(rec.sourceSessionId,perf.id);

  assert.equal(E.accept(s,'bench-press'),true);
  assert.equal(s.targets['bench-press'].weight,102.5);
  assert.equal(s.targets['bench-press'].manual,false);
  assert.equal(s.suggestions['bench-press'].decision,'accepted');
  assert.equal(s.suggestions['bench-press'].targetSnapshot.weight,102.5);
  assert.equal(E.outstandingSuggestions(s).length,0,'an accepted recommendation cannot prompt');

  // Recomputation, history edits, settings and equipment changes keep it accepted.
  E.recomputeSuggestions(s);
  assert.equal(s.suggestions['bench-press'].decision,'accepted');
  s.settings.safeJump=7;E.recomputeSuggestions(s);
  s.settings.dumbbells=[2,4,6,8,10,12,14,16,18,20,22,24,26,28,30,32,34,36,38,40];
  E.recomputeSuggestions(s);
  assert.equal(s.suggestions['bench-press'].decision,'accepted','acceptance survives recalculation');
  assert.equal(s.targets['bench-press'].weight,102.5,'the accepted target still applies');
  assert.equal(E.accept(s,'bench-press'),false,'an already-decided record cannot be re-accepted');
});

test('an accepted decision survives a full backup round trip and restore',()=>{
  const s=state();
  s.targets['bench-press']={weight:100,reps:8};
  workout(s,'bench-press',10);
  E.accept(s,'bench-press');
  const backup=JSON.parse(JSON.stringify(s));
  assert.equal(E.validate(backup),true);
  const restored=E.migrate(JSON.parse(JSON.stringify(backup)));
  assert.equal(E.validate(restored),true);
  const rec=restored.suggestions['bench-press'];
  assert.equal(rec.decision,'accepted');
  assert.equal(rec.accepted,true);
  assert.equal(rec.sourceSessionId,s.suggestions['bench-press'].sourceSessionId);
  assert.equal(rec.signature,s.suggestions['bench-press'].signature);
  assert.equal(restored.targets['bench-press'].weight,102.5);
  E.recomputeSuggestions(restored);
  assert.equal(restored.suggestions['bench-press'].decision,'accepted','restore does not erase the decision');
});

// ---------------------------------------------------------------------------
// 2. Rejection persistence and a new performance reopening reassessment
// ---------------------------------------------------------------------------

test('rejecting keeps the current target and suppresses the recommendation',()=>{
  const s=state();
  s.targets['bench-press']={weight:100,reps:8};
  workout(s,'bench-press',10);
  assert.equal(E.target(s,get(s,'bench-press')).weight,100);
  assert.equal(E.reject(s,'bench-press'),true);
  const rec=s.suggestions['bench-press'];
  assert.equal(rec.decision,'rejected');
  assert.equal(rec.accepted,false,'rejection is stored as a decision, not as accepted:false alone');
  assert.equal(rec.targetSnapshot.weight,100);
  assert.equal(E.target(s,get(s,'bench-press')).weight,100,'rejection never touches the target');
  assert.equal(E.outstandingSuggestions(s).length,0);

  E.recomputeSuggestions(s);
  assert.equal(s.suggestions['bench-press'].decision,'rejected','same performance keeps the rejection');
  assert.equal(s.targets['bench-press'].weight,100);
});

test('an unrelated workout does not revive a rejected recommendation',()=>{
  const s=state();
  s.targets['bench-press']={weight:100,reps:8};
  s.targets['squats']={weight:100,reps:6};
  workout(s,'bench-press',10);
  E.reject(s,'bench-press');
  const rejectedSource=s.suggestions['bench-press'].sourceSessionId;

  workout(s,'squats',10);                  // a new qualifying performance for another lift
  E.recomputeSuggestions(s);               // and any recalculation path
  s.settings.safeJump=8;E.recomputeSuggestions(s);
  assert.equal(s.suggestions['bench-press'].decision,'rejected');
  assert.equal(s.suggestions['bench-press'].sourceSessionId,rejectedSource);
  assert.equal(E.outstandingSuggestions(s).filter(q=>q.exerciseId==='bench-press').length,0);
  // The squat performance did reopen assessment for squats only.
  assert.equal(s.suggestions['squats'].decision,'pending');
  assert.equal(E.outstandingSuggestions(s).length,1);
});

test('a new qualifying performance reopens reassessment for that exercise only',()=>{
  const s=state();
  s.targets['bench-press']={weight:100,reps:8};
  s.targets['squats']={weight:100,reps:6};
  workout(s,'bench-press',10);
  E.reject(s,'bench-press');
  const firstSource=s.suggestions['bench-press'].sourceSessionId;
  const squatsBefore=s.suggestions['squats'];

  workout(s,'bench-press',10);
  const rec=s.suggestions['bench-press'];
  assert.notEqual(rec.sourceSessionId,firstSource,'the new performance is the new source');
  assert.equal(rec.decision,'pending','a new qualifying performance asks again');
  assert.deepEqual(s.suggestions['squats'],squatsBefore,'an unrelated exercise is untouched');
});

test('an incomplete performance does not reopen a rejection',()=>{
  const s=state();
  s.settings.warmups=false;
  s.targets['bench-press']={weight:100,reps:8};
  workout(s,'bench-press',10);
  E.reject(s,'bench-press');
  // The user trained but only logged two of the three sets and finished early.
  const t=targetOf(s,'bench-press');
  start(s,[entry(s,'bench-press',{targetWeight:t.weight,targetReps:10})]);
  for(let i=0;i<2;i++){
    const rec=E.completeSet(s,{reps:10});rec.confirmed=true;s.session.pendingLogId=null;s.session.timer=null;
  }
  E.finishSession(s);
  assert.equal(s.suggestions['bench-press'].decision,'rejected','an incomplete set does not qualify');
  assert.equal(s.suggestions['bench-press'].sourceSessionId,s.sessions[0].id);
});

// ---------------------------------------------------------------------------
// 3. Deferral and acceptance of a deferred target
// ---------------------------------------------------------------------------

test('deferral leaves the recommendation outstanding and never applies the target',()=>{
  const s=state();
  s.targets['bench-press']={weight:100,reps:8};
  workout(s,'bench-press',10);
  assert.equal(E.defer(s,'bench-press'),true);
  const rec=s.suggestions['bench-press'];
  assert.equal(rec.decision,'deferred','deferral is its own decision, not rejection');
  assert.equal(rec.accepted,false);
  assert(rec.deferredAt,'the deferral is timestamped');
  assert.equal(s.targets['bench-press'].weight,100,'deferral leaves the target unchanged');
  const outstanding=E.outstandingSuggestions(s);
  assert.equal(outstanding.length,1,'a deferred item stays outstanding for the next workout');
  assert.equal(outstanding[0].decision,'deferred');
  // Recalculation keeps the same outstanding record instead of creating a duplicate.
  E.recomputeSuggestions(s);
  assert.equal(E.outstandingSuggestions(s).length,1);
  assert.equal(E.outstandingSuggestions(s)[0].decision,'deferred');
});

test('a deferred recommendation can be accepted, applying the deferred target',()=>{
  const s=state();
  s.targets['bench-press']={weight:100,reps:8};
  workout(s,'bench-press',10);
  const proposed={weight:s.suggestions['bench-press'].weight,reps:s.suggestions['bench-press'].reps};
  E.defer(s,'bench-press');
  E.recomputeSuggestions(s);
  assert.equal(E.accept(s,'bench-press'),true,'a deferred item can still be accepted');
  assert.equal(s.targets['bench-press'].weight,proposed.weight);
  assert.equal(s.targets['bench-press'].reps,proposed.reps);
  assert.equal(s.suggestions['bench-press'].decision,'accepted');
  assert.equal(E.outstandingSuggestions(s).length,0);
});

test('deferral and rejection are distinct persisted decisions',()=>{
  const s=state();
  s.targets['bench-press']={weight:100,reps:8};
  s.targets['squats']={weight:100,reps:6};
  workout(s,'bench-press',10);
  workout(s,'squats',10);
  E.defer(s,'bench-press');
  E.reject(s,'squats');
  const byId=id=>s.suggestions[id];
  assert.equal(byId('bench-press').decision,'deferred');
  assert.equal(byId('squats').decision,'rejected');
  assert.equal(byId('bench-press').deferredAt!==undefined,true);
  assert.equal(byId('bench-press').rejectedAt,undefined);
  assert.equal(byId('squats').rejectedAt!==undefined,true);
  assert.equal(byId('squats').deferredAt,undefined);
  assert.equal(E.outstandingSuggestions(s).length,1);
  assert.equal(E.outstandingSuggestions(s)[0].exerciseId,'bench-press');
  // An explicit manual target settles a deferred item as rejected instead of leaving it.
  E.setTarget(s,get(s,'bench-press'),95,8);
  assert.equal(s.suggestions['bench-press'].decision,'rejected');
  assert.equal(E.outstandingSuggestions(s).length,0);
});

// ---------------------------------------------------------------------------
// 4. Recalculation, history, settings and equipment changes
// ---------------------------------------------------------------------------

test('history edits and progression/equipment changes preserve every decision',()=>{
  const s=state();
  s.settings.warmups=false;
  for(const id of ['bench-press','squats','pull-down'])s.targets[id]={weight:id==='pull-down'?50:100,reps:get(s,id).min};
  workout(s,'bench-press',10);E.accept(s,'bench-press');
  workout(s,'squats',10);E.reject(s,'squats');
  workout(s,'pull-down',12);E.defer(s,'pull-down');
  const decisions=()=>Object.fromEntries(Object.entries(s.suggestions).map(([id,q])=>[id,q.decision]));
  const before=decisions();
  assert.deepEqual(before,{'bench-press':'accepted',squats:'rejected','pull-down':'deferred'});

  // Edit a past session: change a set weight (this is the save-history trigger).
  s.sessions[0].records[0].weight=101;
  E.recomputeSuggestions(s);
  assert.deepEqual(decisions(),before,'a history edit does not erase decisions');
  // Change progression settings.
  s.settings.safeJump=6;s.settings.stallSessions=4;E.recomputeSuggestions(s);
  assert.deepEqual(decisions(),before);
  // Change the equipment list and re-round automatic targets like save-equipment does.
  s.settings.dumbbells=[2,4,6,8,10,12,14,16,18,20,22,24,26,28,30,32,34,36,38,40];
  for(const e of s.exercises){const t=s.targets[e.id];if(t&&t.weight!==null&&t.manual!==true)t.weight=E.roundWeight(s,e,t.weight);}
  E.recomputeSuggestions(s);
  assert.deepEqual(decisions(),before);
  assert.equal(s.targets['bench-press'].weight,102.5,'the accepted target is still applied');
});

test('repeated recalculation and rerender never create duplicate prompts',()=>{
  const s=state();
  s.targets['bench-press']={weight:100,reps:8};
  workout(s,'bench-press',10);
  for(let i=0;i<10;i++)E.recomputeSuggestions(s);
  assert.equal(Object.keys(s.suggestions).length,1,'still exactly one record for the exercise');
  assert.equal(E.outstandingSuggestions(s).length,1);
  const id=s.suggestions['bench-press'].sourceSessionId;
  for(let i=0;i<10;i++)E.recomputeSuggestions(s);
  assert.equal(s.suggestions['bench-press'].sourceSessionId,id,'and the same identity, not a new prompt');
  E.reject(s,'bench-press');
  for(let i=0;i<10;i++)E.recomputeSuggestions(s);
  assert.equal(E.outstandingSuggestions(s).length,0,'a rejection stays quiet across recalculation');
});

test('a materially changed proposal is handled explicitly instead of silently kept',()=>{
  const s=state();
  s.targets['bench-press']={weight:100,reps:8};
  {
    const perf=workout(s,'bench-press',10);
    const before=s.suggestions['bench-press'];
    assert.equal(before.weight,102.5);
    // A qualifying performance on the SAME session cannot happen twice, so simulate a
    // legitimate change: history editing raised the logged reps to trigger the double
    // increment, which changes the proposal materially.
    const sess=s.sessions.find(x=>x.id===perf.id);
    for(const r of sess.records.filter(r=>!r.warmup))r.reps=12;
    E.recomputeSuggestions(s);
    const after=s.suggestions['bench-press'];
    assert.equal(after.decision,'pending','a different proposal is a new decision');
    assert.equal(after.weight,105,'the double increment is the new proposal');
    assert.notEqual(after.signature,before.signature);
  }
});

// ---------------------------------------------------------------------------
// 5. Manual overrides
// ---------------------------------------------------------------------------

test('a manual override after a recommendation keeps both the target and the decision',()=>{
  const s=state();
  s.targets['push-down']={weight:30,reps:10};
  workout(s,'push-down',15);
  assert.equal(s.suggestions['push-down'].decision,'pending');
  const result=E.setTarget(s,get(s,'push-down'),32.5,12);
  assert.equal(result.ok,true);
  assert.equal(result.settled,true);
  assert.equal(E.target(s,get(s,'push-down')).weight,32.5);
  assert.equal(E.target(s,get(s,'push-down')).manual,true);
  assert.equal(s.suggestions['push-down'].decision,'rejected');
  assert.equal(s.suggestions['push-down'].targetSnapshot.weight,32.5);
  E.recomputeSuggestions(s);
  assert.equal(E.target(s,get(s,'push-down')).weight,32.5,'the manual override is never re-rounded');
  assert.equal(s.suggestions['push-down'].decision,'rejected');
});

// ---------------------------------------------------------------------------
// 5b. Lifecycle of decided records: later manual edits, repeated decisions, timestamps
// ---------------------------------------------------------------------------

test('accepting then manually changing the target keeps the acceptance and records the edit',()=>{
  const s=state();
  s.targets['bench-press']={weight:100,reps:8};
  workout(s,'bench-press',10);
  E.accept(s,'bench-press');
  const accepted=s.suggestions['bench-press'];
  const decidedAt=accepted.decidedAt;
  const applied={...accepted.targetSnapshot};

  const result=E.setTarget(s,get(s,'bench-press'),105,5);
  assert.equal(result.ok,true);
  assert.equal(result.settled,false,'nothing was outstanding, so nothing was settled');
  const rec=s.suggestions['bench-press'];
  assert.equal(rec.decision,'accepted','the acceptance really happened and is not rewritten');
  assert.equal(rec.accepted,true);
  assert.equal(rec.decidedAt,decidedAt,'the decision keeps its original time');
  assert(rec.manualOverrideAt,'the later manual edit is recorded');
  assert.deepEqual(rec.targetSnapshot,applied,'the snapshot still shows what accepting applied');
  assert.equal(rec.rejectedAt,undefined,'no rejection is invented');
  assert.equal(E.target(s,get(s,'bench-press')).weight,105,'the manual target is what is used');
  assert.equal(E.outstandingSuggestions(s).length,0,'no recommendation reappears');

  // Recalculation keeps both facts: the acceptance and the override.
  E.recomputeSuggestions(s);
  assert.equal(s.suggestions['bench-press'].decision,'accepted');
  assert.equal(s.suggestions['bench-press'].manualOverrideAt,rec.manualOverrideAt);
  assert.equal(E.outstandingSuggestions(s).length,0);
  // Progression still generates a fresh proposal from the next qualifying performance.
  workout(s,'bench-press',10);
  assert.notEqual(s.suggestions['bench-press'].sourceSessionId,accepted.sourceSessionId);
  assert.equal(s.suggestions['bench-press'].decision,'pending');
});

test('deferring then manually changing the target settles it as rejected with consistent timestamps',()=>{
  const s=state();
  s.targets['bench-press']={weight:100,reps:8};
  workout(s,'bench-press',10);
  E.defer(s,'bench-press');
  const deferredAt=s.suggestions['bench-press'].deferredAt;
  const createdAt=s.suggestions['bench-press'].createdAt;
  assert(deferredAt,'the deferral is timestamped');

  E.setTarget(s,get(s,'bench-press'),97.5,6);
  const rec=s.suggestions['bench-press'];
  assert.equal(rec.decision,'rejected','a deferred item settled by a manual choice is a rejection');
  assert.equal(rec.deferredAt,undefined,'the deferral no longer applies');
  assert.equal(rec.rejectedAt,rec.decidedAt,'rejection and decision share the same moment');
  assert(rec.rejectedAt>=deferredAt,'the rejection happens after the deferral');
  assert.equal(rec.createdAt,createdAt,'the proposal keeps when it was first generated');
  assert.equal(rec.targetSnapshot.weight,97.5);
  assert.equal(rec.targetSnapshot.reps,6);
  assert.equal(E.outstandingSuggestions(s).length,0);
});

test('recomputing a deferred recommendation never moves its deferral timestamp',()=>{
  const s=state();
  s.targets['bench-press']={weight:100,reps:8};
  workout(s,'bench-press',10);
  E.defer(s,'bench-press');
  const before=s.suggestions['bench-press'];
  const stamp={deferredAt:before.deferredAt,createdAt:before.createdAt,decidedAt:before.decidedAt,source:before.sourceSessionId,signature:before.signature};
  for(let i=0;i<5;i++)E.recomputeSuggestions(s,Date.now()+1000*(i+1));
  const after=s.suggestions['bench-press'];
  assert.equal(after.decision,'deferred');
  assert.deepEqual({deferredAt:after.deferredAt,createdAt:after.createdAt,decidedAt:after.decidedAt,source:after.sourceSessionId,signature:after.signature},stamp,
    'recalculation preserves the user timeline instead of restamping it');
  // A real, new decision does move it.
  E.setTarget(s,get(s,'bench-press'),100,9);
  assert.equal(s.suggestions['bench-press'].decision,'rejected');
});

test('the same proposal keeps its createdAt when it passes through adoption again',()=>{
  const s=state();
  s.targets['bench-press']={weight:100,reps:8};
  const perf=workout(s,'bench-press',10);
  const first=s.suggestions['bench-press'];
  assert(Number.isFinite(first.createdAt),'the proposal records when it first appeared');
  const born=first.createdAt;
  E.defer(s,'bench-press');
  const deferral=s.suggestions['bench-press'].deferredAt;

  // Path 1: the same completed performance is recorded again. recordSuggestions is exported
  // and re-running it for a session that already produced a record must ADOPT that record,
  // not mint a new proposal with a new generation time.
  E.recordSuggestions(s,perf,born+30000);
  const adopted=s.suggestions['bench-press'];
  assert.equal(adopted.sourceSessionId,first.sourceSessionId,'same proposal, same source');
  assert.equal(adopted.signature,first.signature,'same proposal, same signature');
  assert.equal(adopted.createdAt,born,'re-recording the same performance does not restamp createdAt');
  assert.equal(adopted.decision,'deferred','the decision survives adoption');
  assert.equal(adopted.deferredAt,deferral,'and so does the deferral time');

  // Path 2: a legacy schema-v2 record without a signature is re-adopted on every
  // recalculation (validate() explicitly allows the field to be absent), which is the
  // reachable way an already-stored record passes through adoption again.
  delete adopted.signature;
  assert.equal(E.validate(JSON.parse(JSON.stringify(s))),true,'a signature-less v2 record is valid');
  E.recomputeSuggestions(s,born+60000);
  const migrated=s.suggestions['bench-press'];
  assert(!!migrated.signature,'recalculation re-adopts the record and rebuilds the signature');
  assert.equal(migrated.createdAt,born,'adoption preserves the first-generation time');
  assert.equal(migrated.decision,'deferred');
  assert.equal(migrated.deferredAt,deferral,'and the deferral time');

  // A genuinely new proposal is not an adoption: it takes the timestamp of ITS generation.
  E.accept(s,'bench-press');
  const e2=get(s,'bench-press');
  const later={id:E.uid(),exerciseId:'bench-press',sourceId:'bench-press',pairGroup:e2.group,sets:e2.sets,
    targetWeight:s.targets['bench-press'].weight,targetReps:e2.max,manualTarget:false,skipped:false};
  const perf2At=tick();
  const perf2={id:'perf-second',startedAt:perf2At,endedAt:perf2At+500,blocks:['chest'],entries:[later],
    records:[],queue:[],timer:null,workTimer:null,pendingLogId:null,note:'',exerciseSnapshot:{}};
  for(let i=0;i<e2.sets;i++)perf2.records.push({id:E.uid(),entryId:later.id,exerciseId:'bench-press',
    setIndex:i+1,min:e2.min,max:e2.max,weight:later.targetWeight,reps:e2.max,warmup:false,confirmed:true,
    rir:null,note:'',failed:false,bodyweight:null});
  s.sessions.push(perf2);
  assert.equal(E.exerciseHistory(s,'bench-press').pop().session.id,'perf-second','the new performance is the latest one');
  E.recordSuggestions(s,perf2,born+120000);
  const fresh=s.suggestions['bench-press'];
  assert.notEqual(fresh.sourceSessionId,migrated.sourceSessionId,'a new performance is a new proposal');
  assert.equal(fresh.createdAt,born+120000,'a new proposal takes its own generation time, not the old one');
  assert.equal(fresh.decision,'pending','and is unreviewed again');
});

test('a decision records one timestamp for the one settlement event',()=>{
  // The real clock advances between adjacent Date.now() calls only rarely (about 1 in
  // 20,000 pairs), so a plain assertion would almost never catch a second call. A stepped
  // clock makes every call land in a different millisecond, which exposes the difference.
  const realNow=Date.now;
  let now=1700000000000;
  const step=()=>{Date.now=()=>{now+=7;return now;};};
  try{
    step();
    const s=state();
    s.targets['bench-press']={weight:100,reps:8};
    workout(s,'bench-press',10);
    E.reject(s,'bench-press');
    const rejected=s.suggestions['bench-press'];
    assert.equal(rejected.rejectedAt,rejected.decidedAt,'rejecting is a single event with a single time');
    assert(rejected.createdAt<=rejected.decidedAt,'the proposal came first');

    // A deferred proposal settled by a manual edit is the same single event.
    const s2=state();
    s2.targets['bench-press']={weight:100,reps:8};
    workout(s2,'bench-press',10);
    const born=s2.suggestions['bench-press'].createdAt;
    E.defer(s2,'bench-press');
    E.setTarget(s2,get(s2,'bench-press'),97.5,6);
    const settled=s2.suggestions['bench-press'];
    assert.equal(settled.decidedAt,settled.rejectedAt,'manual settlement stamps one moment');
    assert.equal(settled.deferredAt,undefined);
    assert(settled.createdAt<=settled.decidedAt);
    assert.equal(settled.createdAt,born,'settling does not move the first-generation time');
  }finally{Date.now=realNow;}
});

test('reject() only decides an outstanding recommendation',()=>{
  const s=state();
  s.targets['bench-press']={weight:100,reps:8};
  s.targets['squats']={weight:100,reps:6};
  workout(s,'bench-press',10);
  workout(s,'squats',10);
  E.accept(s,'bench-press');
  E.reject(s,'squats');
  const accepted={...s.suggestions['bench-press']};
  const rejected={...s.suggestions['squats']};

  assert.equal(E.reject(s,'bench-press'),false,'an accepted recommendation cannot be rejected');
  assert.equal(E.reject(s,'squats'),false,'a rejection is not repeated');
  assert.deepEqual(s.suggestions['bench-press'],accepted,'the acceptance is untouched by a stale call');
  assert.deepEqual(s.suggestions['squats'],rejected,'the rejection is untouched by a stale call');
  assert.equal(E.reject(s,'pull-down'),false,'no record, no decision');
  assert.equal(E.target(s,get(s,'bench-press')).weight,102.5,'the accepted target still applies');

  // A deferred recommendation can still be rejected, and that is its one transition.
  const s2=state();
  s2.targets['bench-press']={weight:100,reps:8};
  workout(s2,'bench-press',10);
  E.defer(s2,'bench-press');
  assert.equal(E.reject(s2,'bench-press'),true);
  assert.equal(s2.suggestions['bench-press'].decision,'rejected');
  assert.equal(s2.suggestions['bench-press'].deferredAt,undefined);
  assert.equal(E.reject(s2,'bench-press'),false,'and cannot be rejected twice');
});

test('a manual override never makes a decision prompt reappear',()=>{
  const s=state();
  s.targets['bench-press']={weight:100,reps:8};
  s.targets['squats']={weight:100,reps:6};
  workout(s,'bench-press',10);
  workout(s,'squats',10);
  E.accept(s,'bench-press');
  E.reject(s,'squats');
  // Manual edits on top of each decision, plus recalculation and equipment re-rounding.
  E.setTarget(s,get(s,'bench-press'),105,6);
  E.setTarget(s,get(s,'squats'),90,8);
  for(let i=0;i<3;i++){
    s.settings.safeJump=5+i;E.recomputeSuggestions(s);
    for(const e of s.exercises){const t=s.targets[e.id];if(t&&t.weight!==null&&t.manual!==true)t.weight=E.roundWeight(s,e,t.weight);}
  }
  assert.equal(E.outstandingSuggestions(s).length,0,'neither decision turns into a prompt');
  assert.equal(s.suggestions['bench-press'].decision,'accepted');
  assert.equal(s.suggestions['squats'].decision,'rejected');
});

test('a manual edit on an already rejected record keeps the original rejection time',()=>{
  const s=state();
  s.targets['bench-press']={weight:100,reps:8};
  workout(s,'bench-press',10);
  E.reject(s,'bench-press');
  const rejectedAt=s.suggestions['bench-press'].rejectedAt;
  const decidedAt=s.suggestions['bench-press'].decidedAt;
  E.setTarget(s,get(s,'bench-press'),100,7);
  E.setTarget(s,get(s,'bench-press'),102.5,6);
  assert.equal(s.suggestions['bench-press'].decision,'rejected');
  assert.equal(s.suggestions['bench-press'].rejectedAt,rejectedAt,'the rejection keeps its time');
  assert.equal(s.suggestions['bench-press'].decidedAt,decidedAt);
});

test('manual overrides survive the backup round trip alongside their decisions',()=>{
  const s=state();
  s.targets['bench-press']={weight:100,reps:8};
  workout(s,'bench-press',10);
  E.accept(s,'bench-press');
  E.setTarget(s,get(s,'bench-press'),105,6);
  const backup=JSON.parse(JSON.stringify({...s,exportedAt:new Date().toISOString()}));
  assert.equal(E.validate(backup),true);
  const restored=E.migrate(JSON.parse(JSON.stringify(backup)));
  assert.equal(restored.suggestions['bench-press'].decision,'accepted');
  assert.equal(restored.suggestions['bench-press'].manualOverrideAt,s.suggestions['bench-press'].manualOverrideAt);
  assert.equal(restored.targets['bench-press'].weight,105);
  assert.equal(restored.targets['bench-press'].manual,true);
  assert.equal(E.outstandingSuggestions(restored).length,0);
});

// ---------------------------------------------------------------------------
// 5c. A manually selected target is the benchmark for progression
// ---------------------------------------------------------------------------

/* One completed performance for a single exercise. `manual` marks the entry as carrying a
   user-chosen target, which is what the engine must judge the sets against. */
function performance(s,id,{reps,weight,targetReps,manual=false,rir=null,at=tick(),sets=null,skip=false}={}){
  const e=get(s,id),plannedSets=sets??e.sets;
  const en={id:E.uid(),exerciseId:id,sourceId:id,pairGroup:e.group,sets:plannedSets,
    targetWeight:weight,targetReps,manualTarget:manual,skipped:skip};
  const sess={id:E.uid(),startedAt:at,endedAt:at+600000,durationSeconds:600,blocks:['chest'],
    entries:[en],records:[],queue:[],timer:null,workTimer:null,pendingLogId:null,note:'',
    exerciseSnapshot:{[id]:E.clone(e)}};
  if(!en.skipped)reps.forEach((r,i)=>sess.records.push({id:E.uid(),entryId:en.id,exerciseId:id,setIndex:i+1,
    min:manual?Math.min(e.min,targetReps):e.min,max:e.max,weight,reps:r,warmup:false,
    confirmed:true,rir,note:'',failed:false,bodyweight:null}));
  s.sessions.push(sess);
  return sess;
}

test('regression 1: automatic progression is unchanged when no target was chosen by hand',()=>{
  const s=state(),e=get(s,'bench-press');               // default range 6-10
  const top=E.suggestion(s,e,performance(s,'bench-press',{reps:[10,10,10],weight:100,targetReps:10}));
  assert.equal(top.kind,'raise');
  assert.equal(top.weight,102.5);
  assert.equal(top.reps,6);
  assert.equal(top.reason,'Every set reached the top of the range. Raise to the next safe, loadable weight.');

  const partial=E.suggestion(s,e,performance(s,'bench-press',{reps:[10,10,9],weight:100,targetReps:8}));
  assert.equal(partial.kind,'reps');
  assert.equal(partial.reps,9);

  const s2=state();
  performance(s2,'bench-press',{reps:[5,5,6],weight:100,targetReps:6});
  const deload=E.suggestion(s2,get(s2,'bench-press'),performance(s2,'bench-press',{reps:[5,4,6],weight:100,targetReps:6}));
  assert.equal(deload.kind,'deload');
  assert.equal(deload.weight,90);
  assert.equal(deload.reps,6);
  assert.equal(deload.reason,'Below the minimum on at least half your sets twice in a row. Consider a 10% deload.');

  // The RIR rule is unchanged for automatic targets: one 0-RIR top-range session holds,
  // the second earns the raise.
  const rir=state(),re=get(rir,'bench-press');
  assert.equal(E.suggestion(rir,re,performance(rir,'bench-press',{reps:[10,10,10],weight:100,targetReps:10,rir:0})).kind,'hold');
  const second=E.suggestion(rir,re,performance(rir,'bench-press',{reps:[10,10,10],weight:100,targetReps:10,rir:0}));
  assert.equal(second.kind,'raise');
  assert.equal(second.weight,102.5);
  assert.equal(second.reps,6);
});

test('regression 2: a manual target above the range is not achieved at the default maximum',()=>{
  const s=state(),e=get(s,'bench-press');               // range 6-10, manual target 12
  const sug=E.suggestion(s,e,performance(s,'bench-press',{reps:[10,10,10],weight:100,targetReps:12,manual:true}));
  assert.equal(sug.kind,'hold','reaching the default ceiling is not reaching 12 reps');
  assert.equal(sug.weight,100,'no weight increase is proposed');
  assert.equal(sug.reps,12,'the chosen target is preserved');
  assert.match(sug.reason,/target of 12 reps/i);
});

test('regression 3: two consecutive missed manual targets justify a deload',()=>{
  const s=state(),e=get(s,'bench-press');
  performance(s,'bench-press',{reps:[8,8,8],weight:100,targetReps:12,manual:true});
  const sug=E.suggestion(s,e,performance(s,'bench-press',{reps:[8,8,9],weight:100,targetReps:12,manual:true}));
  assert.equal(sug.kind,'deload');
  assert.equal(sug.weight,90,'10% below the 100 kg the user actually lifted');
  assert.equal(sug.reps,12,'the manually chosen 12 reps are preserved');
  assert.match(sug.reason,/target of 12 reps/i);
  assert.match(sug.reason,/10% deload/);
});

test('regression 4: one missed manual-target session does not trigger a deload',()=>{
  const s=state(),e=get(s,'bench-press');
  const sug=E.suggestion(s,e,performance(s,'bench-press',{reps:[8,8,8],weight:100,targetReps:12,manual:true}));
  assert.equal(sug.kind,'hold','a single missed target only asks for a repeat');
  assert.equal(sug.weight,100);
  assert.equal(sug.reps,12);
  assert.match(sug.reason,/Repeat this load/);
});

test('regression 5: a manual deload keeps the chosen rep target instead of resetting to the range minimum',()=>{
  const s=state(),e=get(s,'bench-press');
  performance(s,'bench-press',{reps:[10,10,10],weight:100,targetReps:12,manual:true});
  const sug=E.suggestion(s,e,performance(s,'bench-press',{reps:[10,9,10],weight:100,targetReps:12,manual:true}));
  assert.equal(sug.kind,'deload');
  assert.equal(sug.reps,12,'not the exercise minimum of 6');
  assert.notEqual(sug.reps,e.min);
  // A manual target BELOW the range is preserved just as exactly.
  const s2=state();
  performance(s2,'bench-press',{reps:[2,2,2],weight:100,targetReps:4,manual:true});
  const low=E.suggestion(s2,get(s2,'bench-press'),performance(s2,'bench-press',{reps:[2,2,2],weight:100,targetReps:4,manual:true}));
  assert.equal(low.kind,'deload');
  assert.equal(low.reps,4,'a target below the range is still the target');
});

test('regression 6: the deload weight comes from the manually selected weight',()=>{
  const s=state(),e=get(s,'bench-press');
  performance(s,'bench-press',{reps:[5,5,5],weight:120,targetReps:10,manual:true});
  const sug=E.suggestion(s,e,performance(s,'bench-press',{reps:[5,5,5],weight:120,targetReps:10,manual:true}));
  assert.equal(sug.kind,'deload');
  assert.equal(sug.weight,107.5,'10% below 120 kg, rounded down to a loadable weight');
  assert(E.loadable(s,e).includes(sug.weight),'the reduced weight stays loadable');

  // An unloadable manual weight is still reduced from itself, not from a default.
  const s2=state();
  performance(s2,'bench-press',{reps:[6,6,6],weight:137.5,targetReps:9,manual:true});
  const odd=E.suggestion(s2,get(s2,'bench-press'),performance(s2,'bench-press',{reps:[6,6,6],weight:137.5,targetReps:9,manual:true}));
  assert.equal(odd.kind,'deload');
  assert.equal(odd.weight,122.5,'137.5 kg * 0.9 rounded down');
});

test('regression 6b: when the equipment cannot load lighter, the deload explains it instead of pretending',()=>{
  const s=state(),e=get(s,'bench-press');
  const lightest=E.loadable(s,e)[0];
  performance(s,'bench-press',{reps:[5,5,5],weight:lightest,targetReps:8,manual:true});
  const sug=E.suggestion(s,e,performance(s,'bench-press',{reps:[5,5,5],weight:lightest,targetReps:8,manual:true}));
  assert.equal(sug.kind,'deload','the recommendation is still surfaced');
  assert.equal(sug.weight,lightest,'but no lighter load is invented');
  assert.match(sug.reason,/cannot load a lighter weight/);
  assert.match(sug.reason,/easier variation/);
  assert.equal(sug.reps,8,'the chosen reps are preserved');
});

test('regression 7: RIR-based holds respect a manual target',()=>{
  const s=state(),e=get(s,'bench-press');
  // Manual 12 reps, completed with 0 reps in reserve: the target was reached, so the
  // existing one-session 0-RIR hold applies, at the user's load and reps.
  const reached=E.suggestion(s,e,performance(s,'bench-press',{reps:[12,12,12],weight:100,targetReps:12,manual:true,rir:0}));
  assert.equal(reached.kind,'hold');
  assert.equal(reached.weight,100);
  assert.equal(reached.reps,12);
  assert.match(reached.reason,/0 reps in reserve/);

  // Manual 12 reps but only 10 completed: the target was NOT reached, so no 0-RIR hold
  // reason and no increase — the engine asks for the target again.
  const missedTarget=E.suggestion(s,e,performance(s,'bench-press',{reps:[10,10,10],weight:100,targetReps:12,manual:true,rir:0}));
  assert.equal(missedTarget.kind,'hold');
  assert.equal(missedTarget.weight,100);
  assert.match(missedTarget.reason,/target of 12 reps/i);
  assert.doesNotMatch(missedTarget.reason,/reps in reserve/i);
});

test('regression 8: an achieved target below the default minimum is never a miss or a deload',()=>{
  const s=state(),e=get(s,'bench-press');               // range 6-10
  const sug=E.suggestion(s,e,performance(s,'bench-press',{reps:[4,4,4],weight:100,targetReps:4,manual:true}));
  assert.notEqual(sug.kind,'deload','meeting a deliberate low target is success');
  assert.doesNotMatch(sug.reason,/deload|Below the/i);
  // Meeting the chosen target earns the normal progression, and the 4 reps stay the
  // benchmark rather than being reset to the range floor of 6.
  assert.equal(sug.kind,'raise');
  assert.equal(sug.weight,102.5);
  assert.equal(sug.reps,4,'the deliberate rep target is carried forward, not the range minimum');
});

test('regression 9: skipped and incomplete exercises never count as missed sessions',()=>{
  const s=state(),e=get(s,'bench-press');
  // A skipped exercise logs no sets, so it is not a qualifying performance.
  const skipped=performance(s,'bench-press',{reps:[3,3,3],weight:100,targetReps:12,manual:true,skip:true});
  assert.equal(skipped.entries[0].skipped,true);
  assert.equal(skipped.records.length,0,'a skipped exercise logs nothing');
  assert.equal(E.fullRecords(skipped,'bench-press'),null,'a skipped exercise is not a full record');
  assert.equal(E.exerciseHistory(s,'bench-press').length,0,'and never enters the progression history');

  // An incomplete exercise (fewer confirmed sets than planned) is not a full record either.
  const s2=state();
  performance(s2,'bench-press',{reps:[3,3,3],weight:100,targetReps:12,manual:true});
  const partial=performance(s2,'bench-press',{reps:[3],weight:100,targetReps:12,manual:true});
  assert.equal(E.fullRecords(partial,'bench-press'),null,'an incomplete exercise is not a qualifying session');
  // The one truly missed session still only asks for a repeat, not a deload.
  const sug=E.suggestion(s2,get(s2,'bench-press'),s2.sessions[0]);
  assert.equal(sug.kind,'hold');

  // And a skipped exercise cannot supply a decision record either.
  const s3=state();
  const only=performance(s3,'bench-press',{reps:[3,3,3],weight:100,targetReps:12,manual:true,skip:true});
  E.recordSuggestions(s3,only);
  assert.equal(s3.suggestions['bench-press'],undefined,'a skipped exercise never generates a recommendation');
});

test('regression 10: manual targets survive saving, reloading and recommendation recomputation',()=>{
  const s=state();
  E.setTarget(s,get(s,'bench-press'),137.5,12);          // deliberately above the 6-10 range
  performance(s,'bench-press',{reps:[10,10,10],weight:137.5,targetReps:12,manual:true});
  E.recomputeSuggestions(s);
  const backup=JSON.parse(JSON.stringify(s));
  assert.equal(E.validate(backup),true,'the saved state is valid');
  const restored=E.migrate(backup);

  assert.equal(restored.targets['bench-press'].weight,137.5,'the manual weight is preserved exactly');
  assert.equal(restored.targets['bench-press'].reps,12,'the manual reps are preserved exactly');
  assert.equal(restored.targets['bench-press'].manual,true);

  const sug=restored.suggestions['bench-press'];
  assert.equal(sug.kind,'hold','reaching the default ceiling did not satisfy the manual 12');
  assert.equal(sug.weight,137.5);
  assert.equal(sug.reps,12);

  // Recomputation must reach the same verdict.
  E.recomputeSuggestions(restored,tick());
  const again=restored.suggestions['bench-press'];
  assert.equal(again.kind,'hold');
  assert.equal(again.weight,137.5);
  assert.equal(again.reps,12);
  assert.equal(E.target(restored,get(restored,'bench-press')).weight,137.5,'the target is never overwritten');
  assert.equal(E.target(restored,get(restored,'bench-press')).reps,12);
});

test('regression 11: accepting a recommendation and manually overriding still work',()=>{
  const s=state(),e=get(s,'bench-press');
  performance(s,'bench-press',{reps:[10,10,10],weight:100,targetReps:12,manual:true});
  E.recomputeSuggestions(s);
  const sug=E.suggestion(s,e,s.sessions[0]);
  assert.equal(sug.kind,'hold');
  assert.equal(E.accept(s,'bench-press'),true,'an outstanding recommendation is still acceptable');
  assert.equal(s.targets['bench-press'].weight,100,'accepting applies the proposed target');
  assert.equal(s.targets['bench-press'].reps,12);
  assert.equal(s.suggestions['bench-press'].decision,'accepted');

  // An explicit user target still wins over the pending recommendation.
  const s2=state();
  E.setTarget(s2,get(s2,'bench-press'),137.5,9);
  performance(s2,'bench-press',{reps:[7,7,7],weight:137.5,targetReps:9,manual:true});
  E.recomputeSuggestions(s2);
  const pending=s2.suggestions['bench-press'];
  assert.notEqual(pending.decision,'accepted','the engine never accepts on the user\'s behalf');
  E.setTarget(s2,get(s2,'bench-press'),140,8);
  assert.equal(s2.targets['bench-press'].weight,140,'the user-entered value is kept exactly');
  assert.equal(s2.targets['bench-press'].reps,8);
  assert.equal(E.target(s2,get(s2,'bench-press')).weight,140);
});

// ---------------------------------------------------------------------------
// 6. Migration of old schema
// ---------------------------------------------------------------------------

test('version 1 backups migrate: accepted:true becomes accepted, accepted:false becomes pending',()=>{
  const legacy={
    version:1,createdAt:1,updatedAt:1,
    exercises:[{id:'bench-press',name:'Bench Press',block:'chest',group:'PRESS',type:'weighted',min:6,max:10,
      equipment:'barbell',suggested:20,increment:2.5,muscle:'Chest',sets:3,rest:150,priority:1,compound:true,
      warmup:true,primary:true,active:true,order:0,note:'',substitutes:[]}],
    targets:{'bench-press':{weight:100,reps:8}},
    suggestions:{
      'bench-press':{sessionId:'old-perf',exerciseId:'bench-press',weight:102.5,reps:6,kind:'raise',accepted:false,reason:'old'}
    },
    sessions:[],session:null,bodyweights:[],pairOverrides:{},
    settings:{rest:90,transition:10,warmupRest:45,keepAwake:true,sound:true,vibrate:true,warmups:true,triples:false,
      effort:true,safeJump:5,stallSessions:3,barWeight:20,plates:[{weight:20,pairs:2}],dumbbells:[10,20],cables:[10],
      machines:[10],addedLoads:[0],reminders:{days:[],time:'18:00'},selectedBlocks:['chest'],budget:null}
  };
  assert.equal(E.validate(legacy),true,'the old version is still readable');
  assert.equal(E.validate(E.clone(legacy)).valueOf(),true);
  const pending=E.migrate(E.clone(legacy));
  assert.equal(pending.version,2,'the migration upgrades the schema in place');
  assert.equal(E.validate(pending),true);
  assert.equal(pending.suggestions['bench-press'].decision,'pending','old accepted:false is unreviewed, never rejected');
  assert.equal(pending.suggestions['bench-press'].sourceSessionId,'old-perf','the old sessionId is preserved as the source');
  assert.equal(pending.suggestions['bench-press'].rejectedAt,undefined,'nothing is turned into a rejection');

  const legacyAccepted=E.clone(legacy);
  legacyAccepted.suggestions['bench-press'].accepted=true;
  const accepted=E.migrate(legacyAccepted);
  assert.equal(accepted.version,2);
  assert.equal(accepted.suggestions['bench-press'].decision,'accepted','old accepted:true becomes accepted');
  assert.equal(accepted.suggestions['bench-press'].sourceSessionId,'old-perf');

  // Two migrations of the same backup are idempotent and lose nothing.
  const twice=E.migrate(E.migrate(E.clone(legacy)));
  assert.deepEqual(twice, pending);
});

test('exporting and restoring a decision through the backup dialog keeps every field',()=>{
  const app=boot();const {w,A,E}=app;
  try{
    const s=A.s();
    s.settings.selectedBlocks=['chest'];
    commitInApp(app);
    A.actions['reject-suggestion']({id:'bench-press'});
    const record=JSON.parse(JSON.stringify(s.suggestions['bench-press']));
    const target=JSON.parse(JSON.stringify(s.targets['bench-press']));
    const backup=JSON.stringify({...E.clone(s),exportedAt:new Date().toISOString()});
    A.importData(backup);
    assert(w.document.querySelector('[data-action="restore-confirm"]'),'the exported backup validates');
    A.actions['restore-confirm']();
    const restored=A.s().suggestions['bench-press'];
    assert.equal(restored.decision,'rejected');
    assert.equal(restored.sourceSessionId,record.sourceSessionId);
    assert.equal(restored.signature,record.signature);
    assert.equal(restored.decidedAt,record.decidedAt);
    assert.equal(restored.targetSnapshot.weight,target.weight);
    // The pre-existing app store drops overriddenAt on some save paths; this test pins the
    // values a decision depends on, not that unrelated legacy behaviour.
    const restoredTarget=A.s().targets['bench-press'];
    assert.equal(restoredTarget.weight,target.weight,'the owned target is restored untouched');
    assert.equal(restoredTarget.reps,target.reps);
    assert.equal(restoredTarget.manual,true,'the manual override survives the restore');
    assert.equal(E.outstandingSuggestions(A.s()).length,0,'a restored rejection is not a prompt');
    assert.equal(E.validate(A.s()),true);
  }finally{shut(app);}
});

test('a version 1 backup restores through the app layer without losing data',()=>{
  const dom=new JSDOM(html,{url:'https://forge.test/',runScripts:'outside-only',pretendToBeVisual:true});
  const w=dom.window;w.scrollTo=()=>{};
  w.eval(bundle);
  try{
    const A=w.ForgeApp,E=w.ForgeEngine;
    const legacy=E.clone(A.s());
    legacy.version=1;
    legacy.suggestions={
      'bench-press':{sessionId:'legacy-accepted',exerciseId:'bench-press',weight:102.5,reps:6,kind:'raise',accepted:true,reason:'old accepted'},
      'squats':{sessionId:'legacy-open',exerciseId:'squats',weight:105,reps:6,kind:'raise',accepted:false,reason:'old open'}
    };
    A.importData(JSON.stringify(legacy));
    assert(w.document.querySelector('[data-action="restore-confirm"]'),'a version 1 backup is accepted for restore');
    A.actions['restore-confirm']();
    const s=A.s();
    assert.equal(s.version,2);
    assert.equal(s.suggestions['bench-press'].decision,'accepted','old accepted:true is restored as accepted');
    assert.equal(s.suggestions['squats'].decision,'pending','old accepted:false is restored as unreviewed');
    assert.equal(s.suggestions['squats'].sourceSessionId,'legacy-open','the source session id survives the restore');
    assert.equal(E.validate(s),true);
  }finally{try{w.close();}catch(e){}}
});

// ---------------------------------------------------------------------------
// 7. Edge cases
// ---------------------------------------------------------------------------

test('no history produces no recommendation and nothing to review',()=>{
  const s=state();
  E.recomputeSuggestions(s);
  assert.equal(Object.keys(s.suggestions).length,0);
  assert.equal(E.outstandingSuggestions(s).length,0);
});

test('skipped and substituted exercises do not generate or retire recommendations',()=>{
  const s=state();
  s.settings.warmups=false;
  s.targets['bench-press']={weight:100,reps:8};
  workout(s,'bench-press',10);
  const rec=s.suggestions['bench-press'];
  const source=rec.sourceSessionId;
  // A second workout that skips bench entirely.
  start(s,[entry(s,'bench-press',{targetWeight:100,targetReps:8,skipped:true}),
            entry(s,'incline-bench',{targetWeight:60,targetReps:8})]);
  logAll(s,12);
  E.finishSession(s);
  assert(s.suggestions['bench-press'],'the skipped original keeps its record');
  assert.equal(s.suggestions['bench-press'].sourceSessionId,source,'skipping today never renews a proposal');
  assert.equal(E.outstandingSuggestions(s).some(q=>q.exerciseId==='bench-press'),true);
});

test('deleted or archived exercises retire their recommendations safely',()=>{
  const s=state();
  s.targets['bench-press']={weight:100,reps:8};
  workout(s,'bench-press',10);
  // Deletion removes the definition and everything that referenced it, the way the app
  // would: the record must not survive as an orphan that references a missing exercise.
  s.exercises=s.exercises.filter(e=>e.id!=='bench-press');
  delete s.targets['bench-press'];
  s.sessions=s.sessions.filter(x=>!x.entries.some(en=>en.exerciseId==='bench-press'));
  E.recomputeSuggestions(s);
  assert.equal(s.suggestions['bench-press'],undefined,'a deleted exercise leaves no orphan record');
  assert.equal(E.validate(s),true);
  // Archived exercises keep their record: unarchiving restores the outstanding item.
  const s2=state();
  s2.targets['squats']={weight:100,reps:6};
  workout(s2,'squats',10);
  get(s2,'squats').active=false;
  E.recomputeSuggestions(s2);
  assert(s2.suggestions.squats,'archiving is not deletion');
});

test('a changed target does not silently erase a saved decision',()=>{
  const s=state();
  s.targets['bench-press']={weight:100,reps:8};
  workout(s,'bench-press',10);
  E.accept(s,'bench-press');
  // Automatic re-rounding after an equipment change keeps the accepted decision.
  s.targets['bench-press']={weight:E.roundWeight(s,get(s,'bench-press'),s.targets['bench-press'].weight),reps:8};
  E.recomputeSuggestions(s);
  assert.equal(s.suggestions['bench-press'].decision,'accepted');
  // A deliberate manual change after an acceptance keeps the acceptance (it did happen and
  // was applied) and records the edit alongside it; the proposal stays suppressed.
  E.setTarget(s,get(s,'bench-press'),100,6);
  assert.equal(s.suggestions['bench-press'].decision,'accepted');
  assert(s.suggestions['bench-press'].manualOverrideAt,'the later edit is recorded');
  assert.equal(s.targets['bench-press'].weight,100);
  assert.equal(E.outstandingSuggestions(s).length,0,'no prompt after a manual edit');
  // A hand-created record whose source performance is not in the history is retired
  // instead of lingering; real decisions with a live source are never dropped.
  s.suggestions['push-down']={exerciseId:'push-down',kind:'raise',weight:32.5,reps:10,accepted:false,decision:'rejected',reason:'x',sourceSessionId:'missing'};
  E.recomputeSuggestions(s);
  assert.equal(s.suggestions['push-down'],undefined,'an unverifiable record is retired');
  assert.equal(s.suggestions['bench-press'].decision,'accepted','verifiable decisions survive');
});

test('undoing a set before COMMIT keeps the previous decision intact',()=>{
  const s=state();
  s.settings.warmups=false;
  s.targets['bench-press']={weight:100,reps:8};
  workout(s,'bench-press',10);
  E.defer(s,'bench-press');
  // A new workout that undoes its only set leaves no completed performance.
  start(s,[entry(s,'bench-press',{targetWeight:102.5,targetReps:6})]);
  E.completeSet(s,{reps:6});
  assert.equal(E.undoSet(s),true);
  E.finishSession(s);
  assert.equal(s.suggestions['bench-press'].decision,'deferred','no completed work, no reopen');
});

// ---------------------------------------------------------------------------
// 8. Application layer: pre-workout review, no repeated prompts
// ---------------------------------------------------------------------------

const html=fs.readFileSync(path.join(__dirname,'../www/index.html'),'utf8');
const bundle=fs.readFileSync(path.join(__dirname,'../www/forge.js'),'utf8');

function boot(){
  const dom=new JSDOM(html,{url:'https://forge.test/',runScripts:'outside-only',pretendToBeVisual:true});
  const w=dom.window;w.scrollTo=()=>{};
  w.eval(bundle);
  return {dom,w,A:w.ForgeApp,E:w.ForgeEngine};
}
const shut=app=>{try{app.w.close();}catch(e){}};

function commitInApp(app,{id='bench-press',reps=10}={}){
  const s=app.A.s(),E=app.E;
  s.settings.warmups=false;
  // No first-use starting-weight prompt: every selected lift already has a target.
  for(const e of s.exercises)if(e.block==='chest'&&s.targets[e.id].weight===null)s.targets[e.id].weight=40;
  E.setTarget(s,E.ex(s,id),100,8);
  const t=E.target(s,E.ex(s,id));
  const en={id:E.uid(),exerciseId:id,sourceId:id,pairGroup:E.ex(s,id).group,sets:E.ex(s,id).sets,
    targetWeight:t.weight,targetReps:E.ex(s,id).max,manualTarget:true,skipped:false};
  const p=E.planEntries(s,[en]);
  s.session=E.newSession(s,{...p,entries:[en]});
  app.A.ui.route='session';app.A.render();
  let guard=0;
  while(s.session.queue.length){
    app.A.actions['set-done']();
    app.w.document.getElementById('log-reps').value=String(reps);
    app.A.actions['confirm-set']();
    if(s.session&&s.session.timer)app.A.actions['timer-skip']();
    if(++guard>50)throw new Error('workout did not finish');
  }
  app.A.actions['commit']();
  assert.equal(s.session,null);
  return s.suggestions[id];
}

test('the app layer: pre-workout review appears for pending and deferred items only',()=>{
  const app=boot();const {w,A,E}=app;
  try{
    const s=A.s();
    s.settings.selectedBlocks=['chest'];
    commitInApp(app);
    assert.equal(s.suggestions['bench-press'].decision,'pending');

    // A fresh session in the app state: the outstanding recommendation is reviewed first.
    A.ui.reviewed=false;
    A.actions['plan-workout']();
    assert.match(w.document.getElementById('modal-title').textContent,/Before you train/);
    assert(w.document.querySelector('[data-action="review-accept"]'),'Accept is offered');
    assert(w.document.querySelector('[data-action="review-reject"]'),'Reject is offered');
    assert(w.document.querySelector('[data-action="review-defer"]'),'Defer is offered');
    assert(w.document.querySelector('[data-action="review-start"]'),'the user can start without accepting');

    // Defer: still outstanding, target unchanged, still listed, and re-deferring the
    // only deferred item keeps one record instead of duplicating the prompt.
    A.actions['review-defer']({id:'bench-press'});
    assert.equal(s.suggestions['bench-press'].decision,'deferred');
    assert.equal(s.targets['bench-press'].weight,100);
    assert.match(w.document.getElementById('modal-title').textContent,/Before you train/,'the deferred item is still listed');
    A.actions['review-defer']({id:'bench-press'});
    assert.equal(E.outstandingSuggestions(s).length,1,'repeated deferral never duplicates the prompt');
    A.actions['review-start']();
    assert(A.ui.planned,'starting without accepting builds the normal plan');

    // Accepting a deferred item applies its target and clears the review.
    A.ui.reviewed=false;A.ui.planned=null;
    A.actions['plan-workout']();
    A.actions['review-accept']({id:'bench-press'});
    assert.equal(s.targets['bench-press'].weight,102.5);
    assert.equal(s.suggestions['bench-press'].decision,'accepted');
    assert.equal(w.document.getElementById('modal-root').innerHTML,'','nothing left to review closes the dialog');
    A.actions['review-start']();
    assert(A.ui.planned);

    // Nothing outstanding: planning starts normally with no prompt at all.
    A.ui.reviewed=false;A.ui.planned=null;
    A.actions['plan-workout']();
    assert.equal(w.document.getElementById('modal-root').innerHTML,'','no review when nothing is outstanding');
    assert(A.ui.planned);
  }finally{shut(app);}
});

test('the app layer: rejecting in the review leaves the target and never re-prompts',()=>{
  const app=boot();const {w,A}=app;
  try{
    const s=A.s();
    s.settings.selectedBlocks=['chest'];
    commitInApp(app);
    A.ui.reviewed=false;
    A.actions['plan-workout']();
    A.actions['review-reject']({id:'bench-press'});
    assert.equal(s.suggestions['bench-press'].decision,'rejected');
    assert.equal(s.targets['bench-press'].weight,100);
    assert.equal(w.document.getElementById('modal-root').innerHTML,'');
    A.actions['review-start']();
    // Any earlier recommendation display path shows no card.
    A.navigate('progress');
    assert.doesNotMatch(w.document.getElementById('app').innerHTML,/TO REVIEW/);
    // Re-rendering and replanning never reopens it.
    for(let i=0;i<5;i++){A.render();A.ui.reviewed=false;A.ui.planned=null;A.actions['plan-workout']();}
    assert.equal(w.document.getElementById('modal-root').innerHTML.replace(/<[^>]+>/g,'').trim()==='',true,'a rejected item never prompts again');
    assert.equal(E.outstandingSuggestions(s).length,0);
  }finally{shut(app);}
});

test('the app layer: a saved decision survives app restart from storage',()=>{
  const dom=new JSDOM(html,{url:'https://forge.test/',runScripts:'outside-only',pretendToBeVisual:true});
  const w=dom.window;w.scrollTo=()=>{};
  let saved='';
  w.Native={loadState:()=>saved,saveState:json=>{saved=json;return 'ok';},keepScreenAwake:()=>{},
    setReminders:()=>{},permissions:()=>'{"native":true}',startTimer:()=>{},cancelTimer:()=>{},testAlert:()=>{},
    timerState:()=>'{}',requestNotifications:()=>{},requestExactAlarms:()=>{},exportBackup:()=>{},importBackup:()=>{}};
  w.eval(bundle);
  let app={dom,w,A:w.ForgeApp,E:w.ForgeEngine};
  try{
    let s=w.ForgeApp.s();s.settings.selectedBlocks=['chest'];
    commitInApp(app);
    w.ForgeApp.actions['reject-suggestion']({id:'bench-press'});
    assert.equal(w.ForgeApp.s().suggestions['bench-press'].decision,'rejected');
    const storedRejected=JSON.parse(saved).suggestions['bench-press'];
    assert.equal(storedRejected.decision,'rejected','the decision is on disk');

    // Restart: a brand-new window loads the same stored workspace.
    const dom2=new JSDOM(html,{url:'https://forge.test/',runScripts:'outside-only',pretendToBeVisual:true});
    const w2=dom2.window;w2.scrollTo=()=>{};
    w2.Native={...w.Native,loadState:()=>saved};
    w2.eval(bundle);
    try{
      const A2=w2.ForgeApp;
      assert.equal(A2.s().suggestions['bench-press'].decision,'rejected','the rejection survives restart');
      assert.equal(w2.ForgeEngine.outstandingSuggestions(A2.s()).length,0);
      A2.ui.reviewed=false;A2.ui.planned=null;
      A2.actions['plan-workout']();
      assert.equal(w2.document.getElementById('modal-root').innerHTML,'','no prompt after restart');
    }finally{w2.close();}
  }finally{try{w.close();}catch(e){}}
});
