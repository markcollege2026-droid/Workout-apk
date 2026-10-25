const test=require('node:test');
const assert=require('node:assert/strict');
const Seed=require('../www/seed.js');
const E=require('../www/engine.js');
const state=()=>Seed.createState();
const get=(s,id)=>E.ex(s,id);
function history(s,id,reps,{weight=100,rir=null,at=Date.now()-1000,warmups=0,plannedSets=3,targetReps=null}={}){
  const e=get(s,id),entryId=E.uid();const en={id:entryId,exerciseId:id,sourceId:id,pairGroup:e.group,sets:plannedSets,targetWeight:weight,targetReps:targetReps??e.min,skipped:false};
  const sess={id:E.uid(),startedAt:at,endedAt:at+500,durationSeconds:1,blocks:[e.block],entries:[en],records:[],queue:[],timer:null,pendingLogId:null,note:'',estimateSeconds:100,straightSeconds:200,exerciseSnapshot:{[id]:E.clone(e)}};
  reps.forEach((r,i)=>sess.records.push({id:E.uid(),entryId,exerciseId:id,setIndex:i+1,sets:plannedSets,min:e.min,max:e.max,weight,reps:r,warmup:false,confirmed:true,rir,note:'',failed:r<e.min,bodyweight:E.bodyweight(s,at)}));
  for(let i=0;i<warmups;i++)sess.records.push({id:E.uid(),entryId,exerciseId:id,setIndex:i+1,min:e.min,max:e.max,weight,reps:e.max+2,warmup:true,confirmed:true,rir:null,note:'',failed:false,bodyweight:null});
  s.sessions.push(sess);return sess;
}
test('all 29 original exercises and 11 distinct substitutes are seeded',()=>{
 const s=state();assert.equal(s.exercises.filter(e=>e.primary).length,29);assert.equal(s.exercises.length,40);assert.equal(get(s,'pull-ups').sets,4);assert.equal(get(s,'calf-raises').increment,2);assert.equal(s.settings.warmups,true);assert.equal(s.settings.triples,false);assert.equal(E.validate(s),true);
});
test('all default pairs are symmetric',()=>{const s=state();for(const a of s.exercises)for(const b of s.exercises)assert.equal(E.canPair(s,a,b),E.canPair(s,b,a));});
test('canonical solo lifts never pair, even after a custom override or group edit',()=>{
 const s=state();for(const id of ['deadlift','squats','farmer-carries']){const a=get(s,id);a.group='PRESS';s.pairOverrides[E.key(id,'sit-ups')]=true;assert.equal(E.canPair(s,a,get(s,'sit-ups')),false);}
});
test('union rules allow wrist/press and overhead press/biceps symmetrically',()=>{const s=state();assert(E.canPair(s,get(s,'bench-press'),get(s,'wrist-curls')));assert(E.canPair(s,get(s,'overhead-press'),get(s,'incline-curls')));});
test('plank, leg raise, same-abs and same-row exceptions are enforced',()=>{
 const s=state();for(const id of ['push-ups','dips','overhead-press'])assert.equal(E.canPair(s,get(s,'plank'),get(s,id)),false);
 for(const id of ['pull-ups','leg-extensions','leg-curls','calf-raises'])assert.equal(E.canPair(s,get(s,'leg-raises'),get(s,id)),false);
 assert.equal(E.canPair(s,get(s,'sit-ups'),get(s,'crunches')),false);assert.equal(E.canPair(s,get(s,'pull-ups'),get(s,'pull-down')),false);
 assert.equal(E.canPair(s,get(s,'wrist-curls'),get(s,'hammer-curls')),false);
});
test('an explicit pair override is symmetric and respected',()=>{const s=state();s.pairOverrides[E.key('bench-press','hammer-curls')]=false;assert.equal(E.canPair(s,get(s,'hammer-curls'),get(s,'bench-press')),false);assert(E.plan(s,['chest','back']).workingSets>0);});
test('greedy planner never invents a pairing across all 63 block selections',()=>{
 const s=state(),blocks=Seed.blocks.map(x=>x.id);for(let mask=1;mask<64;mask++){
  const p=E.plan(s,blocks.filter((_,i)=>mask&(1<<i)));const ids=new Set();
  for(const group of p.groups){for(const id of group){assert(!ids.has(id));ids.add(id);}for(let i=0;i<group.length;i++)for(let j=i+1;j<group.length;j++){const a=p.entries.find(e=>e.id===group[i]),b=p.entries.find(e=>e.id===group[j]);assert(E.canPair(s,{...get(s,a.exerciseId),...a,id:a.exerciseId},{...get(s,b.exerciseId),...b,id:b.exerciseId}));}}
  assert.equal(p.queue.filter(r=>!r.warmup).length,p.workingSets);assert(p.straightSeconds>=p.seconds);
 }
});
test('every pair round is A, B, full rest; A has only the transition',()=>{
 const s=state();s.settings.warmups=false;const entries=E.makeEntries(s,['chest','back']).filter(en=>['bench-press','pull-down'].includes(en.exerciseId));
 const p=E.planEntries(s,entries);assert.equal(p.queue.length,6);for(let i=0;i<6;i+=2){assert.equal(p.queue[i].exerciseId,'bench-press');assert.equal(p.queue[i+1].exerciseId,'pull-down');assert.equal(p.queue[i].restAfter,10);assert.equal(p.queue[i+1].restAfter,150);assert(p.queue[i].transition);assert.equal(p.queue[i+1].transition,false);}
});
test('unequal set counts leave the final unmatched round solo with full rest',()=>{
 const s=state();s.settings.warmups=false;const entries=E.makeEntries(s,['chest','back']).filter(en=>['bench-press','pull-ups'].includes(en.exerciseId));const p=E.planEntries(s,entries);assert.equal(p.queue.length,7);assert.equal(p.queue[6].exerciseId,'pull-ups');assert.equal(p.queue[6].restAfter,150);assert.equal(p.queue[6].transition,false);
});
test('triples are off by default and require three mutually compatible edges',()=>{
 const s=state();s.settings.warmups=false;const entries=E.makeEntries(s,['chest','back','abs']).filter(en=>['bench-press','hammer-curls','sit-ups'].includes(en.exerciseId));
 assert.equal(E.planEntries(s,entries).groups[0].length,2);s.settings.triples=true;assert.equal(E.planEntries(s,entries).groups[0].length,3);
 s.pairOverrides[E.key('hammer-curls','sit-ups')]=false;assert.equal(E.planEntries(s,entries).groups[0].length,2);
});
test('heavy compound group anchors precede noncompound groups',()=>{const s=state();const p=E.plan(s,['chest','back','legs','shoulders']);const anchors=p.groups.map(g=>get(s,p.entries.find(en=>en.id===g[0]).exerciseId));let seenIsolation=false;for(const e of anchors){if(!e.compound)seenIsolation=true;else assert.equal(seenIsolation,false);}});
test('warm-up ramp is 40/60/80% × 8/5/3, rounded and never working volume',()=>{
 const s=state();s.targets['bench-press']={weight:100,reps:6};const en=E.makeEntries(s,['chest']).filter(x=>x.exerciseId==='bench-press'),p=E.planEntries(s,en);
 assert.deepEqual(p.queue.slice(0,3).map(r=>[r.weight,r.reps,r.restAfter]),[[40,8,45],[60,5,45],[80,3,45]]);assert.equal(p.workingSets,3);
});
test('time budget drops optional isolation before critical compounds',()=>{
 const s=state();s.settings.warmups=false;get(s,'push-down').priority=3;const p=E.plan(s,['chest'],12);assert(p.dropped.includes('push-down'));assert(p.entries.some(en=>get(s,en.exerciseId).compound));
 const tiny=E.plan(s,['chest'],1);assert.equal(tiny.entries.length,1);assert(tiny.overBudget);assert(get(s,tiny.entries[0].exerciseId).compound);
});
test('loadable barbell combinations, nearest rounding and down-rounding',()=>{const s=state(),e=get(s,'bench-press');s.settings.barWeight=20;s.settings.plates=[{weight:1.25,pairs:1},{weight:5,pairs:1}];assert.deepEqual(E.loadable(s,e),[20,22.5,30,32.5]);assert.equal(E.roundWeight(s,e,29),30);assert.equal(E.roundWeight(s,e,29,'down'),22.5);assert.equal(E.roundWeight(s,e,2),20);});
test('bodyweight added load always includes the zero-load option',()=>{const s=state(),e=get(s,'dips');e.equipment='dumbbell';assert.equal(E.roundWeight(s,e,0),0);});
test('Set done establishes a deadline immediately and prefills its log',()=>{
 const s=state();const p=E.plan(s,['chest']);s.session=E.newSession(s,p);const t=s.session.queue[0],before=Date.now(),r=E.completeSet(s);
 assert.equal(r.weight,t.weight);assert.equal(r.reps,t.reps);assert.equal(r.confirmed,false);assert.equal(s.session.pendingLogId,r.id);assert(s.session.timer.deadline>=before+t.restAfter*1000);assert(s.session.timer.deadline<=Date.now()+t.restAfter*1000);
 E.validate(E.clone(s));
});
test('transition kind remains correct when a full rest coincidentally equals 10 sec',()=>{
 const s=state();s.settings.warmups=false;s.settings.rest=10;get(s,'bench-press').rest=10;const entries=E.makeEntries(s,['chest','back']).filter(x=>['bench-press','hammer-curls'].includes(x.exerciseId));s.session=E.newSession(s,{...E.planEntries(s,entries),entries});E.completeSet(s);assert.equal(s.session.timer.kind,'transition');s.session.pendingLogId=null;E.completeSet(s);assert.equal(s.session.timer.kind,'rest');
});
test('undo restores the original task and clears the rest/pending log',()=>{const s=state();const p=E.plan(s,['abs']);s.session=E.newSession(s,p);const task=s.session.queue[0];E.completeSet(s);E.undoSet(s);assert.equal(s.session.records.length,0);assert.equal(s.session.queue[0].id,task.id);assert.equal(s.session.timer,null);assert.equal(s.session.pendingLogId,null);});
test('all-set top-range success proposes a safe raise and bottom-range reset',()=>{const s=state(),e=get(s,'bench-press'),sess=history(s,e.id,[10,10,10]);const q=E.suggestion(s,e,sess);assert.equal(q.kind,'raise');assert.equal(q.weight,102.5);assert.equal(q.reps,6);assert.equal(s.targets[e.id].weight,null);});
test('a single below-ceiling set holds weight and builds reps',()=>{const s=state(),e=get(s,'bench-press'),q=E.suggestion(s,e,history(s,e.id,[10,10,9],{targetReps:8}));assert.equal(q.weight,100);assert.equal(q.reps,9);assert.equal(q.kind,'reps');});
test('double increment for every set 2+ above ceiling, within 5%',()=>{const s=state(),e=get(s,'bench-press'),q=E.suggestion(s,e,history(s,e.id,[12,12,12]));assert.equal(q.weight,105);assert.equal(q.reps,6);});
test('smallest plate step larger than 5% results in hold, not an unsafe jump',()=>{const s=state(),e=get(s,'bench-press'),q=E.suggestion(s,e,history(s,e.id,[10,10,10],{weight:20}));assert.equal(q.kind,'hold');assert.equal(q.weight,20);assert.equal(q.reps,10);assert.match(q.reason,/cap/);});
test('0 RIR holds exactly one top-range session at the same load',()=>{
 const s=state(),e=get(s,'bench-press'),one=history(s,e.id,[10,10,10],{rir:0,at:100000});assert.equal(E.suggestion(s,e,one).kind,'hold');const two=history(s,e.id,[10,10,10],{rir:0,at:200000});assert.equal(E.suggestion(s,e,two).kind,'raise');
});
test('two majority misses yield a rounded 10% deload',()=>{
 const s=state(),e=get(s,'bench-press'),one=history(s,e.id,[5,5,6],{at:100000});assert.equal(E.suggestion(s,e,one).kind,'hold');const two=history(s,e.id,[5,4,6],{at:200000});const q=E.suggestion(s,e,two);assert.equal(q.kind,'deload');assert.equal(q.weight,90);assert.equal(q.reps,6);
});
test('one miss out of three does not falsely trigger a majority-stall deload',()=>{const s=state(),e=get(s,'bench-press');history(s,e.id,[5,10,10],{at:100000});const q=E.suggestion(s,e,history(s,e.id,[5,10,10],{at:200000}));assert.notEqual(q.kind,'deload');assert.equal(q.weight,100);});
test('incomplete sessions and warm-ups cannot penalize progression',()=>{const s=state(),e=get(s,'bench-press');const partial=history(s,e.id,[0],{warmups:3});assert.equal(E.suggestion(s,e,partial),null);const full=history(s,e.id,[10,10,10],{warmups:3,at:Date.now()});assert.equal(E.suggestion(s,e,full).weight,102.5);});
test('bodyweight success without a weigh-in requests an explicit added-load/variation decision',()=>{const s=state(),e=get(s,'dips'),q=E.suggestion(s,e,history(s,e.id,[12,12,12],{weight:0}));assert.equal(q.kind,'variation');assert.equal(q.weight,2.5);assert.equal(s.targets[e.id].weight,0);});
test('bodyweight safe jump is capped against body weight plus added load',()=>{const s=state();s.bodyweights=[{date:E.localDate(),weight:70}];const e=get(s,'dips'),q=E.suggestion(s,e,history(s,e.id,[12,12,12],{weight:0,at:Date.now()}));assert.equal(q.kind,'raise');assert.equal(q.weight,2.5);});
test('future bodyweights do not leak into past exercise load snapshots',()=>{const s=state();s.bodyweights=[{date:'2026-01-02',weight:70},{date:'2026-01-03',weight:90}];assert.equal(E.bodyweight(s,new Date('2026-01-02T12:00:00').getTime()),70);assert.equal(E.bodyweight(s,new Date('2026-01-01T12:00:00').getTime()),null);});
test('plank adds 5 seconds only when all current-duration sets succeed',()=>{const s=state(),e=get(s,'plank');const q=E.suggestion(s,e,history(s,e.id,[30,30,30],{weight:0,targetReps:30}));assert.equal(q.kind,'time');assert.equal(q.reps,35);const hold=E.suggestion(s,e,history(s,e.id,[34,35,35],{weight:0,targetReps:35,at:Date.now()+1000}));assert.equal(hold.reps,35);});
test('plank ceiling suggests variation; Farmer Carries progress load, not seconds',()=>{
 const s=state(),plank=get(s,'plank');assert.equal(E.suggestion(s,plank,history(s,plank.id,[60,60,60],{weight:0,targetReps:60})).kind,'variation');
 const farmer=get(s,'farmer-carries');s.settings.dumbbells=[40,41,42,43];const q=E.suggestion(s,farmer,history(s,farmer.id,[45,45,45],{weight:40,targetReps:40}));assert.equal(q.kind,'raise');assert.equal(q.weight,41);assert.equal(q.reps,40);
});
test('substitution inherits the source pairing group but keeps its own target and ID',()=>{
 const s=state();s.settings.warmups=false;s.targets['bench-press']={weight:100,reps:6};s.targets['dumbbell-bench-press']={weight:12,reps:8};const p=E.plan(s,['chest']);s.session=E.newSession(s,p);const en=s.session.entries.find(x=>x.exerciseId==='bench-press');const swapped=E.substitute(s,en.id);
 assert.equal(swapped.exercise.id,'dumbbell-bench-press');assert.equal(swapped.entry.pairGroup,'PRESS');assert.equal(swapped.entry.targetWeight,12);assert.equal(en.skipped,true);assert.equal(s.targets['bench-press'].weight,100);assert.equal(s.session.queue.some(r=>r.exerciseId==='bench-press'),false);
});
test('substitution never duplicates an already selected primary or creates a cycle',()=>{
 const s=state(),p=E.plan(s,['chest']);s.session=E.newSession(s,p);let en=s.session.entries.find(x=>x.exerciseId==='bench-press');let swapped=E.substitute(s,en.id);assert.equal(swapped.exercise.id,'dumbbell-bench-press');const again=E.substitute(s,swapped.entry.id);assert(again.error); // Push Ups already present.
});
test('skip removes only remaining tasks and leaves previous targets untouched',()=>{const s=state(),p=E.plan(s,['chest']);s.session=E.newSession(s,p);const en=s.session.entries.find(x=>x.exerciseId==='bench-press');E.skip(s,en.id);assert.equal(s.session.queue.some(r=>r.exerciseId==='bench-press'),false);assert.equal(s.targets['bench-press'].weight,null);});
test('COMMIT saves sets and suggestions atomically at the engine level; accept applies explicitly',()=>{
 const s=state();s.settings.warmups=false;s.targets['bench-press']={weight:100,reps:10};const entries=E.makeEntries(s,['chest']).filter(x=>x.exerciseId==='bench-press');s.session=E.newSession(s,{...E.planEntries(s,entries),entries});while(s.session.queue.length){E.completeSet(s);const r=s.session.records.at(-1);r.confirmed=true;r.reps=10;s.session.pendingLogId=null;}
 E.finishSession(s);assert.equal(s.session,null);assert.equal(s.sessions.length,1);assert.equal(s.targets['bench-press'].weight,100);assert.equal(s.suggestions['bench-press'].weight,102.5);assert(!s.sessions[0].records[0].task);E.accept(s,'bench-press');assert.equal(s.targets['bench-press'].weight,102.5);E.validate(E.clone(s));
});
test('Epley, volume and PRs include real partial working sets but never warm-ups',()=>{
 const s=state();history(s,'bench-press',[10],{weight:100,warmups:3});const stats=E.stats(s,'bench-press');assert.equal(stats.points.length,1);assert.equal(stats.prVolume,1000);assert(Math.abs(stats.pr1rm-133.3333333333)<.0001);assert.equal(E.lastRecords(s,'bench-press').length,1);
});
test('stalled-lift detection excludes incomplete exercise attempts',()=>{const s=state();for(let i=0;i<3;i++)history(s,'bench-press',[8,8,8],{at:10000+i*10000});assert(E.stalled(s).some(e=>e.id==='bench-press'));history(s,'bench-press',[9,9,9],{at:50000});assert(!E.stalled(s).some(e=>e.id==='bench-press'));});
test('weekly volume excludes warmups and data outside seven days',()=>{const s=state();history(s,'bench-press',[8,8,8],{warmups:3});history(s,'bench-press',[8,8,8],{at:Date.now()-9*86400000});assert.equal(E.weeklyVolume(s).Chest,3);});
test('backup round-trip preserves resumable pending logs and deadlines',()=>{const s=state();s.session=E.newSession(s,E.plan(s,['chest']));E.completeSet(s);const copy=JSON.parse(JSON.stringify(s));assert(E.validate(copy));assert.equal(copy.session.pendingLogId,s.session.pendingLogId);assert.equal(copy.session.timer.deadline,s.session.timer.deadline);});
test('backup validator rejects malformed versions, ranges, unknown refs and suggestions',()=>{
 for(const mutate of [s=>s.version=99,s=>s.exercises[0].sets=0,s=>s.exercises[0].min=-1,s=>s.targets['bench-press'].weight='NaN',s=>s.settings.dumbbells=[],s=>s.exercises[0].substitutes=['invented'],s=>s.suggestions['bench-press']={kind:'raise'},s=>s.pairOverrides['bad|pair']=true]){const s=state();mutate(s);assert.throws(()=>E.validate(s),/Invalid backup/);}
});
test('editing a rep range does not retroactively turn a valid old session into a missed minimum',()=>{
 const s=state(),e=get(s,'bench-press');history(s,e.id,[7,7,7],{at:100000});e.min=8;e.max=12;
 const q=E.suggestion(s,e,history(s,e.id,[7,7,7],{at:200000}));assert.notEqual(q.kind,'deload');assert.equal(q.weight,100);
});
test('historical load/volume uses the logging type saved with the session',()=>{
 const s=state();s.bodyweights=[{date:'1970-01-01',weight:70}];history(s,'bench-press',[10],{weight:100,at:100000});get(s,'bench-press').type='bodyweight';
 assert.equal(E.stats(s,'bench-press').points[0].volume,1000);
});
test('undo after a substitute never resurrects tasks of the skipped entry',()=>{
 const s=state();s.settings.warmups=false;
 const p=E.plan(s,['chest','back']);s.session=E.newSession(s,p);
 const rec=E.completeSet(s);rec.confirmed=true;s.session.pendingLogId=null;s.session.timer=null;
 assert.equal(rec.exerciseId,'bench-press');
 const bench=s.session.entries.find(en=>en.exerciseId==='bench-press');
 const sub=E.substitute(s,bench.id);assert.equal(sub.error,undefined);
 assert.equal(s.session.queue.some(t=>t.exerciseId==='bench-press'),false);
 assert.equal(E.undoSet(s),true);
 assert.equal(s.session.records.length,0);
 assert.equal(s.session.queue.some(t=>t.exerciseId==='bench-press'),false,'skipped entry task must not re-enter the queue');
 assert(s.session.queue.length>0);
 E.validate(E.clone(s));
});
test('undo after a skip removes the record without requeueing skipped work',()=>{
 const s=state();s.settings.warmups=false;
 const entries=E.makeEntries(s,['chest']);const p=E.planEntries(s,entries);
 s.session=E.newSession(s,{...p,entries});
 const rec=E.completeSet(s);rec.confirmed=true;s.session.pendingLogId=null;s.session.timer=null;
 const en=s.session.entries.find(x=>x.id===rec.entryId);
 E.skip(s,en.id);
 assert.equal(s.session.queue.some(t=>t.entryId===en.id),false);
 const before=s.session.queue.length;
 assert.equal(E.undoSet(s),true);
 assert.equal(s.session.queue.length,before,'queue unchanged for skipped entry');
 assert.equal(s.session.queue.some(t=>t.entryId===en.id),false);
 E.validate(E.clone(s));
});
test('a warm-up-only session commits without suggestions, streak or trained-day credit',()=>{
 const s=state();
 const entries=E.makeEntries(s,['chest']).filter(en=>en.exerciseId==='bench-press');
 const p=E.planEntries(s,entries);s.session=E.newSession(s,{...p,entries});
 for(let i=0;i<3;i++){const r=E.completeSet(s);r.confirmed=true;s.session.pendingLogId=null;s.session.timer=null;assert.equal(r.warmup,true);}
 const done=E.finishSession(s);
 assert.equal(s.sessions.length,1);assert.equal(done.records.length,3);
 assert.equal(Object.keys(s.suggestions).length,0);
 assert.equal(E.streak(s),0);assert.equal(E.weeklyVolume(s).Chest,0);
 E.validate(E.clone(s));
});
