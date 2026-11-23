/* Regression tests: the timed-exercise work timer is a real countdown that is logically
   separate from the rest/transition timer, logs the ACTUAL hold, and never double-records. */
const test=require('node:test');
const assert=require('node:assert/strict');
const Seed=require('../www/seed.js');
const E=require('../www/engine.js');
const state=()=>Seed.createState();
const get=(s,id)=>E.ex(s,id);

function entry(s,id,{sets=null,weight=null,reps=null,manual=false}={}){
  const e=get(s,id);
  if(sets!==null)e.sets=sets;
  return {id:E.uid(),exerciseId:id,sourceId:id,pairGroup:e.group,sets:e.sets,
    targetWeight:weight===null?(e.equipment==='bodyweight'?0:20):weight,targetReps:reps===null?e.min:reps,manualTarget:manual,skipped:false};
}
function start(s,entries){
  const p=E.planEntries(s,entries);
  s.session={id:E.uid(),startedAt:Date.now(),endedAt:null,blocks:['abs'],entries:E.clone(entries),queue:E.clone(p.queue),
    records:[],timer:null,workTimer:null,pendingLogId:null,note:'',estimateSeconds:p.seconds,straightSeconds:p.straightSeconds,
    dropped:[],exerciseSnapshot:{}};
  return s.session;
}
// A workout with a 40-second plank followed by a weighted bench set.
function plankThenBench(s,{plankSeconds=40}={}){
  s.settings.warmups=false;
  s.pairOverrides[E.key('plank','bench-press')]=false;
  const plank=entry(s,'plank',{sets:1,reps:plankSeconds,weight:0,manual:true});
  const bench=entry(s,'bench-press',{sets:1,reps:8,weight:60});
  const session=start(s,[plank,bench]);
  session.queue=session.queue.filter(t=>!t.warmup).sort((a,b)=>Number(b.exerciseId==='plank')-Number(a.exerciseId==='plank'));
  assert.deepEqual(session.queue.map(t=>t.exerciseId),['plank','bench-press'],'plank is first in this fixture');
  assert.equal(session.queue[0].restAfter,E.rest(s,get(s,'plank')));
  return session;
}

test('a timed exercise starts a real work countdown with the target duration',()=>{
  const s=state();const session=plankThenBench(s,{plankSeconds:40});
  const at=1700000000000;
  const started=E.startWork(s,at);
  assert.equal(started.ok,true);
  assert.equal(started.total,40);
  assert.equal(session.workTimer.total,40);
  assert.equal(session.workTimer.deadline,at+40000);
  assert.equal(session.workTimer.exerciseId,'plank');
  assert.equal(session.workTimer.taskId,session.queue[0].id);
  assert.equal(session.timer,null,'starting a hold must not start a rest timer');
  assert.equal(session.records.length,0,'starting a timer records nothing');
  assert.equal(E.validate(E.clone(s)),true);
});

test('the work countdown expiring logs the full hold and starts the normal rest timer',()=>{
  const s=state();const session=plankThenBench(s,{plankSeconds:40});
  const at=1700000000000;
  const started=E.startWork(s,at);
  assert.equal(session.timer,null);
  const done=E.finishWork(s,{at:started.timer.deadline});
  assert(done);
  assert.equal(done.seconds,40);
  assert.equal(done.early,false);
  assert.equal(done.record.reps,40);
  assert.equal(done.record.manualTarget,true);
  assert.equal(done.record.early,false);
  assert.equal(session.workTimer,null,'the work countdown is cleared when it ends');
  assert.equal(session.pendingLogId,done.record.id,'the set log opens for the actual seconds');
  assert.equal(session.timer.kind,'rest','the existing rest workflow takes over');
  assert.equal(session.timer.total,E.rest(s,get(s,'plank')));
  assert.equal(session.queue[0].exerciseId,'bench-press','the next exercise is now the head');
  assert.equal(E.validate(E.clone(s)),true);
});

test('finishing early records the actual elapsed seconds, not the target',()=>{
  const s=state();const session=plankThenBench(s,{plankSeconds:40});
  const at=1700000000000;
  const started=E.startWork(s,at);
  const done=E.finishWork(s,{at:started.timer.deadline-8000});   // stopped after 32 seconds
  assert.equal(done.seconds,32);
  assert.equal(done.early,true);
  assert.equal(done.record.reps,32);
  assert.equal(done.record.plannedReps,40,'the planned hold is still known');
  assert.equal(done.record.early,true,'the set is marked as completed early');
  assert.equal(session.timer.kind,'rest');
});

test('an explicit elapsed value from the UI wins over the wall clock',()=>{
  const s=state();const session=plankThenBench(s,{plankSeconds:40});
  E.startWork(s,Date.now());
  const done=E.finishWork(s,{elapsed:12});
  assert.equal(done.seconds,12);
  assert.equal(done.record.reps,12);
  assert.equal(done.record.early,true);
});

test('cancelling a hold records no set and leaves the task queued',()=>{
  const s=state();const session=plankThenBench(s,{plankSeconds:40});
  E.startWork(s,Date.now());
  const head=session.queue[0].id;
  assert.equal(E.cancelWork(s),true);
  assert.equal(session.workTimer,null);
  assert.equal(session.records.length,0,'no set is recorded on cancel');
  assert.equal(session.pendingLogId,null);
  assert.equal(session.timer,null,'cancel never starts a rest timer');
  assert.equal(session.queue[0].id,head,'the same set is still waiting');
  assert.equal(E.cancelWork(s),false,'a second cancel is a harmless no-op');
});

test('the actual seconds can be edited before confirming the set',()=>{
  const s=state();const session=plankThenBench(s,{plankSeconds:40});
  const at=1700000000000;
  E.startWork(s,at);
  E.finishWork(s,{at:at+40000});
  const rec=session.records[0];
  assert.equal(rec.reps,40);
  rec.reps=37;                                   // what the user actually held
  rec.confirmed=true;session.pendingLogId=null;session.timer=null;
  E.finishSession(s);
  assert.equal(s.sessions[0].records[0].reps,37,'the edited duration is what is saved');
  const sug=s.suggestions['plank'];
  assert(sug,'a completed timed exercise produces a suggestion');
  assert.equal(sug.reps,40,'the 5-second-increase proposal starts from the logged 37 + hold logic');
});

test('a completion callback delivered twice records exactly one set',()=>{
  const s=state();const session=plankThenBench(s,{plankSeconds:40});
  const at=1700000000000;
  const started=E.startWork(s,at);
  const first=E.finishWork(s,{at:started.timer.deadline});
  const second=E.finishWork(s,{at:started.timer.deadline});
  assert(first);
  assert.equal(second,null,'the duplicate completion is ignored');
  assert.equal(session.records.length,1);
  assert.equal(session.queue.length,1);
  assert.equal(s.total,undefined);
});

test('the work timer cannot be started twice, during rest, or with an unconfirmed log',()=>{
  const s=state();const session=plankThenBench(s,{plankSeconds:40});
  const at=1700000000000;
  assert.equal(E.startWork(s,at).ok,true);
  assert.match(E.startWork(s,at).error,/already running/);
  E.finishWork(s,{at:at+40000});
  assert.equal(session.workTimer,null);
  assert.match(E.startWork(s).error,/Confirm the set/,'an unconfirmed log blocks the next set');
  session.pendingLogId=null;
  session.records[0].confirmed=true;
  assert.match(E.startWork(s).error,/rest timer/,'the rest timer blocks the next hold');
  session.timer=null;
  assert.match(E.startWork(s).error,/not timed/,'bench press is not a timed exercise');
  assert.equal(session.workTimer,null);
});

test('ordinary weighted and rep-based sets never get a work countdown',()=>{
  const s=state();s.settings.warmups=false;
  const session=start(s,[entry(s,'bench-press',{sets:2,reps:8,weight:60})]);
  const result=E.startWork(s);
  assert.match(result.error,/not timed/);
  assert.equal(session.workTimer,null);
  const task=session.queue[0];
  const rec=E.completeSet(s);
  assert(rec,'a weighted set still logs with one tap');
  assert.equal(rec.reps,task.reps);
  assert.equal(rec.weight,task.weight);
  assert.equal(session.timer.kind,'rest');
});

test('a timed set can never be logged by the plain Set done path',()=>{
  const s=state();const session=plankThenBench(s,{plankSeconds:40});
  assert.equal(E.completeSet(s),null,'a timed set needs its work countdown');
  assert.equal(session.records.length,0);
  assert.equal(session.queue[0].exerciseId,'plank');
  session.queue[0].warmup=true;
  assert(E.completeSet(s),'warm-up tasks are unaffected');
});

test('work and rest countdowns never swap state',()=>{
  const s=state();const session=plankThenBench(s,{plankSeconds:40});
  const at=1700000000000;
  E.startWork(s,at);
  assert.equal(session.timer,null,'a running hold is not a rest timer');
  E.finishWork(s,{at:at+40000});
  assert.equal(session.workTimer,null,'a running rest is not a work timer');
  assert.equal(session.timer.kind,'rest');
  assert.equal(session.timer.total,E.rest(s,get(s,'plank')));
  // Skipping rest and confirming the log is the existing action; it must not resurrect
  // the finished hold countdown.
  session.timer=null;session.records[0].confirmed=true;session.pendingLogId=null;
  assert.equal(session.workTimer,null);
  // A following timed exercise starts a brand-new countdown with its own duration.
  session.queue[0]={...session.queue[0],exerciseId:'plank',reps:20,min:1,max:60};
  const next=E.startWork(s);
  assert.equal(next.ok,true);
  assert.equal(session.workTimer.total,20);
  assert.equal(session.workTimer.deadline>Date.now(),true);
});

test('short and long durations are timed from their own target',()=>{
  for(const seconds of [1,5,30,60,300,3600]){
    const s=state();
    s.settings.warmups=false;
    const session=start(s,[entry(s,'plank',{sets:1,reps:seconds,weight:0,manual:true})]);
    const at=1700000000000;
    const started=E.startWork(s,at);
    assert.equal(started.ok,true);
    assert.equal(started.total,seconds);
    assert.equal(session.workTimer.deadline,at+seconds*1000);
    const done=E.finishWork(s,{at:at+seconds*1000});
    assert.equal(done.seconds,seconds);
    assert.equal(done.early,false);
  }
});

test('undo after a timed set restores the hold task and clears both timers',()=>{
  const s=state();const session=plankThenBench(s,{plankSeconds:40});
  const at=1700000000000;
  E.startWork(s,at);
  E.finishWork(s,{at:at+40000});
  assert.equal(session.records.length,1);
  const restDeadline=session.timer.deadline;
  assert.equal(E.undoSet(s),true);
  assert.equal(session.records.length,0);
  assert.equal(session.queue[0].exerciseId,'plank','the plank set is queued again');
  assert.equal(session.timer,null,'the rest timer is cleared by undo');
  assert.equal(session.workTimer,null);
  assert.equal(session.pendingLogId,null);
  assert(E.validate(E.clone(s)),true);
  assert(restDeadline>0);
});

test('a mid-hold reload resumes the same countdown, and a finished one completes once',()=>{
  const s=state();
  // Mid-hold: state is persisted with an absolute deadline and survives a reload.
  plankThenBench(s,{plankSeconds:40});
  const at=Date.now();
  E.startWork(s,at);
  const reloaded=JSON.parse(JSON.stringify(s));
  assert.equal(E.validate(reloaded),true);
  assert.equal(reloaded.session.workTimer.deadline,at+40000);
  assert.equal(reloaded.session.workTimer.total,40);
  assert.equal(reloaded.session.workTimer.exerciseId,'plank');

  // Expired while the app was closed: resuming logs it once, never twice.
  const later=E.finishWork(reloaded,{at:at+40000});
  assert(later);
  assert.equal(later.record.reps,40);
  assert.equal(E.finishWork(reloaded,{at:at+40000}),null);
  assert.equal(reloaded.session.records.length,1);
});

test('overlapping rest and work timers are rejected by the backup validator',()=>{
  const s=state();const session=plankThenBench(s,{plankSeconds:40});
  const at=Date.now();
  E.startWork(s,at);
  session.timer={deadline:at+90000,total:90,kind:'rest'};
  assert.throws(()=>E.validate(E.clone(s)),/overlapping rest and work timers/);
});

test('a corrupt work timer is rejected by validation instead of resuming blindly',()=>{
  const s=state();const session=plankThenBench(s,{plankSeconds:40});
  E.startWork(s,Date.now());
  for(const mutate of [
    w=>{w.deadline=-1;},
    w=>{w.total=0;},
    w=>{w.total=99999;},
    w=>{w.taskId='not valid id!';},
    w=>{w.startedAt=-5;}
  ]){
    const copy=E.clone(s);mutate(copy.session.workTimer);
    assert.throws(()=>E.validate(copy),/Invalid backup/);
  }
});

test('progression uses the logged duration, and an early hold is not a full hold',()=>{
  const s=state();
  s.settings.warmups=false;
  get(s,'plank').sets=1;
  const session=start(s,[entry(s,'plank',{sets:1,reps:40,weight:0,manual:true})]);
  const at=1700000000000;
  E.startWork(s,at);
  E.finishWork(s,{at:at+25000});                 // 25 of 40 seconds
  session.records[0].confirmed=true;session.pendingLogId=null;session.timer=null;
  E.finishSession(s);
  const rec=s.sessions[0].records[0];
  assert.equal(rec.reps,25,'the logged duration is the actual hold');
  assert.equal(rec.early,true);
  const sug=s.suggestions['plank'];
  assert.equal(sug.kind,'hold','an incomplete hold never earns extra time');
  assert.equal(sug.reps,40,'the planned duration is held, not raised');
  assert.equal(E.stats(s,'plank').prReps,25,'analytics use the seconds actually held');
});

test('a completed timed hold earns its 5-second progression from the logged seconds',()=>{
  const s=state();
  s.settings.warmups=false;
  get(s,'plank').sets=1;
  const session=start(s,[entry(s,'plank',{sets:1,reps:30,weight:0,manual:true})]);
  const at=1700000000000;
  E.startWork(s,at);
  E.finishWork(s,{at:at+30000});
  session.records[0].confirmed=true;session.pendingLogId=null;session.timer=null;
  E.finishSession(s);
  const sug=s.suggestions['plank'];
  assert.equal(sug.kind,'time');
  assert.equal(sug.reps,35);
  assert.equal(E.stats(s,'plank').prReps,30);
});
