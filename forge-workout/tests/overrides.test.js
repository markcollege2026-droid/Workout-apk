/* Regression tests: manual target overrides must survive rounding, clamping, replanning,
   equipment edits, exercise range edits, storage round-trips and progression. */
const test=require('node:test');
const assert=require('node:assert/strict');
const Seed=require('../www/seed.js');
const E=require('../www/engine.js');
const state=()=>Seed.createState();
const get=(s,id)=>E.ex(s,id);

// Plan a single exercise so the queue is deterministic.
function single(s,id,{sets=null,targetWeight=null,targetReps=null,manual=false}={}){
  const e=get(s,id);
  if(sets!==null)e.sets=sets;
  return {id:E.uid(),exerciseId:id,sourceId:id,pairGroup:e.group,sets:e.sets,targetWeight,targetReps,manualTarget:manual,skipped:false};
}
function session(s,entries){
  const p=E.planEntries(s,entries);
  s.session={id:E.uid(),startedAt:Date.now(),endedAt:null,blocks:['chest'],entries:E.clone(entries),queue:E.clone(p.queue),
    records:[],timer:null,workTimer:null,pendingLogId:null,note:'',estimateSeconds:p.seconds,straightSeconds:p.straightSeconds,
    dropped:[],exerciseSnapshot:{}};
  return s.session;
}
function logAll(s,reps){
  const recs=[];
  while(s.session.queue.length){
    const task=s.session.queue[0];
    const rec=E.completeSet(s,{reps:reps===null?undefined:reps});
    assert(rec,'completing a queued set must return a record');
    rec.confirmed=true;s.session.pendingLogId=null;s.session.timer=null;recs.push(rec);
  }
  s.session.timer=null;
  return recs;
}

test('a manual weight between two loadable dumbbell weights is stored and shown exactly',()=>{
  const s=state(),e=get(s,'hammer-curls');           // dumbbells: 2,4,...,40
  assert.equal(E.roundWeight(s,e,27.5),28,'sanity: automatic rounding would pick 28');
  const result=E.setTarget(s,e,27.5,11);
  assert.equal(result.ok,true);
  assert.deepEqual(s.targets[e.id].weight,27.5);
  assert.equal(s.targets[e.id].reps,11);
  assert.equal(s.targets[e.id].manual,true);
  const t=E.target(s,e);
  assert.equal(t.weight,27.5,'target() must not round a manual weight');
  assert.equal(t.reps,11,'target() must not clamp a manual rep target');
  assert.equal(t.manual,true);
  assert.equal(t.configured,true);
  assert.equal(t.loadable,false,'27.5 kg is not a configured dumbbell weight');
  assert.equal(E.validate(s),true);
});

test('a manual weight above the largest configured load is kept exactly',()=>{
  const s=state(),e=get(s,'hammer-curls');
  assert.equal(Math.max(...E.loadable(s,e)),40);
  E.setTarget(s,e,45,8);
  assert.equal(E.target(s,e).weight,45);
  assert.equal(E.target(s,e).loadable,false);
  assert.equal(E.validate(s),true);
});

test('a manual weight below a normal safe-jump step is kept, not rounded up',()=>{
  const s=state(),e=get(s,'bench-press');
  // 21.5 kg sits between the empty bar (20) and the first two-sided plate step (22.5).
  E.setTarget(s,e,21.5,6);
  assert.equal(E.target(s,e).weight,21.5);
  assert.equal(E.roundWeight(s,e,21.5),22.5,'sanity: automatic rounding would pick 22.5');
});

test('a manual override beyond the automatic safe-jump cap survives',()=>{
  const s=state(),e=get(s,'bench-press');
  s.targets[e.id]={weight:100,reps:10};
  E.setTarget(s,e,140,6);                       // 40% jump: far outside the 5% cap
  assert.equal(E.target(s,e).weight,140);
  const entries=E.makeEntries(s,['chest']).filter(en=>en.exerciseId==='bench-press');
  const p=E.planEntries(s,entries);
  const working=p.queue.filter(t=>!t.warmup&&t.exerciseId==='bench-press');
  assert.equal(working.length,3);
  for(const task of working){assert.equal(task.weight,140,'the plan must carry the exact override');assert.equal(task.manualTarget,true);}
  assert.equal(E.target(s,e).weight,140,'automatic cap logic must never rewrite the stored value');
});

test('manual reps above and below the exercise range are accepted and preserved',()=>{
  const s=state(),e=get(s,'bench-press');       // normal range 6-10
  assert.equal(E.setTarget(s,e,100,13).outsideRange,true);
  assert.equal(E.target(s,e).reps,13);
  assert.equal(E.setTarget(s,e,100,3).outsideRange,true);
  assert.equal(E.target(s,e).reps,3);
  // ...while automatic targets keep clamping to the range.
  s.targets[e.id]={weight:100,reps:13};
  assert.equal(E.target(s,e).reps,10);
  assert.equal(E.target(s,e).manual,false);
});

test('absolute input limits are enforced with clear errors and change nothing',()=>{
  const s=state(),e=get(s,'bench-press');
  E.setTarget(s,e,100,6);
  const before=E.clone(s.targets[e.id]);
  for(const [w,r] of [[-1,6],[1000.5,6],[100,0],[100,3601],[100,6.5],['',6],[100,'']]){
    const result=E.setTarget(s,e,w,r);
    assert(result.error,'rejected: '+w+'/'+r);
    assert.deepEqual(s.targets[e.id],before,'a rejected edit must not change the target');
  }
  assert.equal(E.setTarget(s,e,0,1).ok,true,'the absolute minimum is allowed');
  assert.equal(E.setTarget(s,e,1000,3600).ok,true,'the absolute maximum is allowed');
});

test('manual overrides survive save and reload of the whole workspace',()=>{
  const s=state(),e=get(s,'hammer-curls');
  E.setTarget(s,e,27.5,11);
  const restored=JSON.parse(JSON.stringify(s));
  assert.equal(E.validate(restored),true);
  const t=E.target(restored,get(restored,'hammer-curls'));
  assert.equal(t.weight,27.5);
  assert.equal(t.reps,11);
  assert.equal(t.manual,true);
});

test('rebuilding a workout plan after an override keeps the exact target everywhere',()=>{
  const s=state();
  s.settings.warmups=false;
  const e=get(s,'hammer-curls');
  E.setTarget(s,e,27.5,11);
  for(let i=0;i<3;i++){
    const plan=E.plan(s,['chest','back']);
    const entry=plan.entries.find(en=>en.exerciseId==='hammer-curls');
    assert.equal(entry.targetWeight,27.5);
    assert.equal(entry.targetReps,11);
    assert.equal(entry.manualTarget,true);
    for(const task of plan.queue.filter(t=>t.exerciseId==='hammer-curls')){assert.equal(task.weight,27.5);assert.equal(task.reps,11);}
    const sess=E.newSession(s,plan);
    const queued=sess.queue.filter(t=>t.exerciseId==='hammer-curls');
    assert(queued.length>0);
    for(const task of queued){assert.equal(task.weight,27.5);assert.equal(task.reps,11);}
  }
});

test('editing a suggestion saves the entered values instead of the proposal',()=>{
  const s=state(),e=get(s,'bench-press');
  s.suggestions[e.id]={sessionId:'x',exerciseId:e.id,weight:102.5,reps:6,kind:'raise',accepted:false,reason:'test'};
  const result=E.setTarget(s,e,101,9);          // deliberately neither the suggestion nor loadable
  assert.equal(result.ok,true);
  assert.equal(E.target(s,e).weight,101);
  assert.equal(E.target(s,e).reps,9);
  assert.equal(s.suggestions[e.id],undefined,'an explicit edit supersedes the pending proposal');
});

test('accepting a suggestion stays automatic while a manual edit is marked manual',()=>{
  const s=state(),e=get(s,'bench-press');
  s.suggestions[e.id]={sessionId:'x',exerciseId:e.id,weight:102.5,reps:6,kind:'raise',accepted:false,reason:'test'};
  assert.equal(E.accept(s,e.id),true);
  assert.equal(E.target(s,e).manual,false);
  assert.equal(E.isManual(s,e.id),false);
  assert.equal(s.targets[e.id].weight,102.5);
  // Accepting an automatic target still rounds to the equipment list.
  const d=get(s,'hammer-curls');
  s.suggestions[d.id]={sessionId:'x',exerciseId:d.id,weight:27.5,reps:8,kind:'raise',accepted:false,reason:'test'};
  E.accept(s,d.id);
  assert.equal(E.target(s,d).weight,28,'automatic targets keep rounding');
  E.setTarget(s,d,27.5,8);
  assert.equal(E.target(s,d).weight,27.5,'an explicit edit of the same value is kept');
});

test('changing the equipment list keeps manual overrides and re-rounds automatic ones',()=>{
  const s=state();
  const manual=get(s,'hammer-curls'),automatic=get(s,'lateral-raises');
  E.setTarget(s,manual,27.5,11);
  s.targets[automatic.id]={weight:9.5,reps:10}; // not a loadable step; nearest is 10
  assert.equal(E.target(s,automatic).weight,10);
  // Simulate saving a new equipment list the way the UI does it.
  s.settings.dumbbells=[2,4,6,8,10,12,14,16,18,20,22,24,26,28,30,32,34,36,38,40,42,44];
  for(const e of s.exercises){const t=s.targets[e.id];if(t.manual===true)continue;if(t.weight!==null)t.weight=E.roundWeight(s,e,t.weight);}
  assert.equal(s.targets[manual.id].weight,27.5,'manual override untouched');
  assert.equal(s.targets[manual.id].reps,11);
  assert.equal(s.targets[manual.id].manual,true);
  assert.equal(E.target(s,manual).loadable,false,'the old weight is no longer loadable and is reported as such');
  assert.equal(E.target(s,automatic).weight,10,'automatic target still follows the new list');
});

test('changing an exercise range keeps a manual override and clamps automatic ones',()=>{
  const s=state();
  const e=get(s,'bench-press'),other=get(s,'incline-bench');
  E.setTarget(s,e,100,13);
  s.targets[other.id]={weight:60,reps:13};
  e.min=6;e.max=10;                              // range edited in the exercise editor
  const t=s.targets[e.id];if(t.manual!==true){t.reps=Math.min(e.max,Math.max(e.min,t.reps));}
  const o=s.targets[other.id];const oe=get(s,'incline-bench');oe.min=8;oe.max=12;
  if(o.manual!==true)o.reps=Math.min(oe.max,Math.max(oe.min,o.reps));
  assert.equal(s.targets[e.id].reps,13,'manual reps are not clamped by a range edit');
  assert.equal(s.targets[other.id].reps,12,'automatic reps are still clamped');
});

test('a manual override and its early timed work survive JSON export and restore',()=>{
  const s=state(),e=get(s,'plank');              // timed, 30-60 seconds
  E.setTarget(s,e,0,25);                         // below the normal minimum duration
  session(s,[single(s,'plank',{targetWeight:0,targetReps:25,manual:true})]);
  const started=E.startWork(s);
  assert.equal(started.ok,true);
  const done=E.finishWork(s,{at:started.timer.deadline-15000});   // stopped after 10 of 25 sec
  assert.equal(done.seconds,10);
  s.session.records[0].confirmed=true;s.session.pendingLogId=null;s.session.timer=null;
  E.finishSession(s);
  const backup=JSON.parse(JSON.stringify(s));
  assert.equal(E.validate(backup),true);
  assert.equal(E.target(backup,get(backup,'plank')).weight,0);
  assert.equal(E.target(backup,get(backup,'plank')).reps,25);
  assert.equal(E.target(backup,get(backup,'plank')).manual,true);
  assert.equal(backup.sessions[0].records[0].reps,10);
  assert.equal(backup.sessions[0].records[0].early,true);
});

test('backups without the manual flag keep working (backward compatibility)',()=>{
  const s=state();
  const legacy=JSON.parse(JSON.stringify(s));
  for(const id of Object.keys(legacy.targets)){delete legacy.targets[id].manual;delete legacy.targets[id].overriddenAt;}
  assert.equal(E.validate(legacy),true);
  assert.equal(E.target(legacy,get(legacy,'bench-press')).manual,false);
});

test('normal automatic progression still respects equipment loadability and the safe-jump cap',()=>{
  const s=state(),e=get(s,'bench-press');
  s.targets[e.id]={weight:100,reps:10,manual:false};
  // A complete top-range session at 100 kg proposes a loadable 102.5 kg raise.
  const at=Date.now()-1000;
  const en={id:E.uid(),exerciseId:e.id,sourceId:e.id,pairGroup:e.group,sets:3,targetWeight:100,targetReps:10,manualTarget:false,skipped:false};
  const sess={id:E.uid(),startedAt:at,endedAt:at+500,durationSeconds:1,blocks:['chest'],entries:[en],records:[],queue:[],timer:null,pendingLogId:null,note:'',estimateSeconds:1,straightSeconds:2,exerciseSnapshot:{}};
  for(let i=0;i<3;i++)sess.records.push({id:E.uid(),entryId:en.id,exerciseId:e.id,setIndex:i+1,min:6,max:10,weight:100,reps:10,warmup:false,confirmed:true,rir:null,note:'',failed:false,bodyweight:null});
  s.sessions.push(sess);
  const sug=E.suggestion(s,e,sess);
  assert.equal(sug.kind,'raise');
  assert.equal(sug.weight,102.5);
  assert(E.loadable(s,e).includes(sug.weight),'automatic raises stay loadable');
  assert(sug.weight<=100+100*5/100+.001,'automatic raises stay inside the safe-jump cap');
});

test('a manual target does not corrupt progression history or analytics',()=>{
  const s=state(),e=get(s,'bench-press');
  s.settings.warmups=false;
  E.setTarget(s,e,137.5,9);
  session(s,[single(s,'bench-press',{targetWeight:137.5,targetReps:9})]);
  const recs=logAll(s,9);
  assert.equal(recs.length,3);
  assert.equal(recs[0].weight,137.5);
  E.finishSession(s);
  assert.equal(s.sessions.length,1);
  const stored=s.sessions[0].records.map(r=>[r.weight,r.reps]);
  assert.deepEqual(stored,[[137.5,9],[137.5,9],[137.5,9]],'history records the exact logged values');
  const stats=E.stats(s,'bench-press');
  assert.equal(stats.prWeight,137.5);
  assert.equal(stats.points.length,1);
  assert.equal(E.weeklyVolume(s).Chest,3);
  const sug=s.suggestions[e.id];
  assert.notEqual(sug.kind,'raise','137.5 kg is not a loadable weight, so nothing is auto-raised');
  assert.equal(sug.weight,137.5,'the proposal holds the load the user actually lifted');
  assert.equal(E.target(s,e).weight,137.5,'the manual target itself is unchanged by the suggestion');
  assert.equal(E.validate(E.clone(s)),true);
});

test('a manual target below the range is not treated as a missed minimum',()=>{
  const s=state(),e=get(s,'bench-press');
  s.settings.warmups=false;
  E.setTarget(s,e,100,4);                        // deliberately below the 6-rep floor
  session(s,[single(s,'bench-press',{targetWeight:100,targetReps:4,manual:true})]);
  const recs=logAll(s,4);
  assert.equal(recs[0].min,4,'the set is judged against the target the user chose');
  assert.equal(recs[0].failed,false);
  E.finishSession(s);
  assert.equal(s.sessions[0].records[0].failed,false,'meeting your own target is not a failure');
  const sug=s.suggestions[e.id];
  assert.notEqual(sug.kind,'deload','a deliberate low target must not trigger a deload');
});
