/* Application-layer regression tests without a browser: the real app.js/ui.js/views.js/
   modals.js bundle runs in a jsdom window, so actions, rendering and the native bridge
   contract are exercised the same way the WebView runs them. */
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM}=require('jsdom');

const html=fs.readFileSync(path.join(__dirname,'../www/index.html'),'utf8');
const bundle=fs.readFileSync(path.join(__dirname,'../www/forge.js'),'utf8');
const tick=(ms=0)=>new Promise(r=>setTimeout(r,ms));

function nativeBridge(overrides={}){
  const calls=[];
  let saved='';
  const bridge={
    loadState:()=>saved,
    saveState:json=>{saved=json;calls.push(['save']);return 'ok';},
    keepScreenAwake:awake=>calls.push(['awake',!!awake]),
    setReminders:()=>calls.push(['reminders']),
    permissions:()=>'{"native":true,"notifications":true,"exact":true}',
    startTimer:(deadline,kind,next,sound,vibrate,type)=>calls.push(['timer',deadline,kind,type]),
    cancelTimer:type=>calls.push(['cancel',type]),
    timerState:()=>JSON.stringify(bridge.__state||{}),
    testAlert:()=>calls.push(['alert']),
    requestNotifications:()=>{},
    requestExactAlarms:()=>{},
    exportBackup:()=>{},
    importBackup:()=>{},
    previousState:()=>JSON.stringify(bridge.__previous||{available:false}),
    restorePrevious:json=>{bridge.__restored=[json,bridge.__current];bridge.__current=json;return 'ok';},
    ...overrides
  };
  return {bridge,calls,get saved(){return saved;}};
}

function boot({native=null,storage=null}={}){
  const dom=new JSDOM(html,{url:'https://forge.test/',runScripts:'outside-only',pretendToBeVisual:true});
  const w=dom.window;
  w.scrollTo=()=>{};
  if(storage)w.localStorage.setItem('forge.workout.v1',storage);
  if(native)w.Native=native;
  w.eval(bundle);
  return {dom,w,A:w.ForgeApp,E:w.ForgeEngine};
}
function shut(...apps){for(const app of apps){try{app.w.close();}catch(e){}}}
const toast=w=>w.document.getElementById('toast').textContent;

// -------- Priority 1: manual target overrides --------

test('the Progress target editor saves a value between two loadable weights exactly',async()=>{
  const app=boot();const {w,A}=app;
  try{
    A.navigate('progress');
    A.ui.progressExercise='hammer-curls';
    A.actions['target-edit']({id:'hammer-curls'});
    w.document.getElementById('target-weight').value='27.5';
    w.document.getElementById('target-reps').value='11';
    A.actions['save-target']();
    const stored=A.s().targets['hammer-curls'];
    assert.equal(stored.weight,27.5);
    assert.equal(stored.reps,11);
    assert.equal(stored.manual,true);
    assert.match(toast(w),/27\.5 kg × 11 reps/,'the feedback reports what was actually saved');
    assert.equal(w.document.getElementById('modal-root').innerHTML,'');
    // Still exact after leaving and reopening Progress, and in the rendered target list.
    A.navigate('today');A.navigate('progress');A.ui.progressExercise='hammer-curls';A.render();
    assert.match(w.document.getElementById('app').innerHTML,/27\.5/);
    assert.match(w.document.getElementById('app').innerHTML,/MANUAL/,'manual overrides are visibly marked');
    // The next plan carries the same exact values.
    const plan=A.E.plan(A.s(),['chest','back']);
    const entry=plan.entries.find(en=>en.exerciseId==='hammer-curls');
    assert.equal(entry.targetWeight,27.5);
    assert.equal(entry.targetReps,11);
    assert.equal(entry.manualTarget,true);
  }finally{shut(app);}
});

test('a saved manual target survives a full app restart from storage',async()=>{
  const first=boot();
  let saved;
  try{
    first.A.actions['target-edit']({id:'hammer-curls'});
    first.w.document.getElementById('target-weight').value='27.5';
    first.w.document.getElementById('target-reps').value='11';
    first.A.actions['save-target']();
    saved=first.w.localStorage.getItem('forge.workout.v1');
  }finally{shut(first);}
  const second=boot({storage:saved});
  try{
    assert.equal(second.A.s().targets['hammer-curls'].weight,27.5);
    assert.equal(second.A.s().targets['hammer-curls'].reps,11);
    assert.equal(second.A.E.target(second.A.s(),second.A.E.ex(second.A.s(),'hammer-curls')).reps,11);
  }finally{shut(second);}
});

test('a manual target outside the range is saved, clearly reported, and not clamped',async()=>{
  const app=boot();const {w,A}=app;
  try{
    A.actions['target-edit']({id:'bench-press'});
    w.document.getElementById('target-weight').value='101.25';
    w.document.getElementById('target-reps').value='14';
    A.actions['save-target']();
    assert.equal(A.s().targets['bench-press'].reps,14);
    assert.equal(A.s().targets['bench-press'].weight,101.25);
    assert.match(toast(w),/outside the normal 6–10 range, kept as entered/);
  }finally{shut(app);}
});

test('an impossible target shows an error and leaves the saved target untouched',async()=>{
  const app=boot();const {w,A}=app;
  try{
    A.actions['target-edit']({id:'bench-press'});
    w.document.getElementById('target-weight').value='60';
    w.document.getElementById('target-reps').value='8';
    A.actions['save-target']();
    const before=JSON.stringify(A.s().targets['bench-press']);
    A.actions['target-edit']({id:'bench-press'});
    w.document.getElementById('target-weight').value='60';
    w.document.getElementById('target-reps').value='0';
    assert.throws(()=>A.actions['save-target'](),/between 1 and 3600/);
    assert.equal(JSON.stringify(A.s().targets['bench-press']),before);
  }finally{shut(app);}
});

test('saving equipment keeps manual targets and re-rounds automatic ones',async()=>{
  const app=boot();const {w,A}=app;
  try{
    A.actions['target-edit']({id:'hammer-curls'});
    w.document.getElementById('target-weight').value='27.5';
    w.document.getElementById('target-reps').value='11';
    A.actions['save-target']();
    A.s().targets['lateral-raises']={weight:9.5,reps:10};
    A.openEquipment();
    w.document.getElementById('equipment-dumbbells').value='2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 42, 44';
    A.actions['save-equipment']();
    assert.equal(A.s().targets['hammer-curls'].weight,27.5,'manual weight kept');
    assert.equal(A.s().targets['hammer-curls'].reps,11);
    assert.equal(A.s().targets['lateral-raises'].weight,10,'automatic weight re-rounded');
    assert.match(toast(w),/1 manual target kept exactly as saved/);
  }finally{shut(app);}
});

test('editing an exercise range keeps a manual override but clamps automatic targets',async()=>{
  const app=boot();const {w,A}=app;
  try{
    A.actions['target-edit']({id:'bench-press'});
    w.document.getElementById('target-weight').value='100';
    w.document.getElementById('target-reps').value='14';
    A.actions['save-target']();
    A.s().targets['incline-bench']={weight:60,reps:14};
    A.openExercise('bench-press');
    w.document.getElementById('edit-max').value='10';
    A.actions['save-exercise']();
    assert.equal(A.s().targets['bench-press'].reps,14,'manual reps survive a range change');
    A.openExercise('incline-bench');
    w.document.getElementById('edit-max').value='12';
    A.actions['save-exercise']();
    assert.equal(A.s().targets['incline-bench'].reps,12,'automatic reps still clamp to the range');
  }finally{shut(app);}
});

test('a target edited during an active workout reaches the remaining queue',async()=>{
  const app=boot();const {w,A}=app;
  try{
    const p=A.E.plan(A.s(),['chest','back']);
    A.s().session=A.E.newSession(A.s(),p);
    A.ui.route='session';A.render();
    A.actions['target-edit']({id:'hammer-curls'});
    w.document.getElementById('target-weight').value='27.5';
    w.document.getElementById('target-reps').value='11';
    A.actions['save-target']();
    const tasks=A.s().session.queue.filter(t=>t.exerciseId==='hammer-curls');
    assert(tasks.length>0);
    for(const task of tasks){assert.equal(task.weight,27.5);assert.equal(task.reps,11);assert.equal(task.manualTarget,true);}
  }finally{shut(app);}
});

test('accepting a suggestion and manually overriding it are stored differently',async()=>{
  const app=boot();const {w,A}=app;
  try{
    A.s().suggestions['bench-press']={sessionId:'x',exerciseId:'bench-press',weight:102.5,reps:6,kind:'raise',accepted:false,reason:'Every set reached the top.'};
    A.navigate('progress');A.actions['accept-suggestion']({id:'bench-press'});
    assert.equal(A.s().targets['bench-press'].weight,102.5);
    assert.equal(A.s().targets['bench-press'].manual,false,'accepted proposals stay automatic');
    A.actions['suggestion-edit']({id:'bench-press'});
    w.document.getElementById('target-weight').value='103';
    w.document.getElementById('target-reps').value='7';
    A.actions['save-target']();
    assert.equal(A.s().targets['bench-press'].weight,103);
    assert.equal(A.s().targets['bench-press'].manual,true);
  }finally{shut(app);}
});

// -------- Priority 2: timed-exercise work timer in the running app --------

function timedWorkout(A,{seconds=40}={}){
  const s=A.s();const E=A.E;
  s.settings.warmups=false;s.settings.triples=false;
  E.setTarget(s,E.ex(s,'plank'),0,seconds);
  const entries=[
    {id:'e-plank',exerciseId:'plank',sourceId:'plank',pairGroup:'ABS',sets:1,targetWeight:0,targetReps:seconds,manualTarget:true,skipped:false},
    {id:'e-sit',exerciseId:'sit-ups',sourceId:'sit-ups',pairGroup:'ABS',sets:1,targetWeight:0,targetReps:10,manualTarget:false,skipped:false}
  ];
  const p=E.planEntries(s,entries);
  s.session={id:'s-timed',startedAt:Date.now(),endedAt:null,blocks:['abs'],entries:E.clone(entries),queue:E.clone(p.queue),
    records:[],timer:null,workTimer:null,pendingLogId:null,note:'',estimateSeconds:p.seconds,straightSeconds:p.straightSeconds,
    dropped:[],exerciseSnapshot:{}};
  s.session.queue.sort((a,b)=>Number(b.exerciseId==='plank')-Number(a.exerciseId==='plank'));
  A.ui.route='session';A.save();A.render();
  return s.session;
}

test('a timed exercise offers Start timer instead of Set done and counts down on screen',async()=>{
  const app=boot();const {w,A,E}=app;
  try{
    const session=timedWorkout(A,{seconds:2});
    assert.equal(w.document.querySelector('[data-action="set-done"]'),null,'no plain Set done for timed work');
    const start=w.document.querySelector('[data-action="work-start"]');
    assert(start,'the timed exercise exposes a Start timer action');
    assert.match(start.textContent,/Start 2-second timer/);
    assert.match(w.document.getElementById('app').innerHTML,/Target duration <b>2 seconds<\/b>/,'the target duration is shown prominently');
    A.actions['work-start']();
    assert.equal(session.workTimer.total,2);
    assert.equal(session.records.length,0,'starting records nothing');
    assert(w.document.getElementById('work-timer-text'),'the countdown is displayed');
    assert.equal(w.document.querySelector('[data-action="set-done"]'),null);
    A.render();
    assert.match(w.document.getElementById('app').innerHTML,/TIMED WORK · 2 SEC TARGET/);
    // Wait for the real countdown to reach zero through the app's own tick loop.
    await tick(2600);
    assert.equal(session.workTimer,null,'the countdown cleared itself at zero');
    assert.equal(session.records.length,1);
    assert.equal(session.records[0].reps,2,'the full hold is logged');
    assert.equal(session.records[0].early,false);
    assert(session.timer,'the normal rest timer started');
    assert.equal(w.document.getElementById('log-reps').value,'2');
    assert.match(w.document.getElementById('log-panel').textContent,/Seconds completed/);
    A.actions['confirm-set']();
    assert.equal(session.records[0].confirmed,true);
  }finally{shut(app);}
});

test('finishing early logs the actual seconds and can be edited before confirming',async()=>{
  const app=boot();const {w,A}=app;
  try{
    const session=timedWorkout(A,{seconds:40});
    A.actions['work-start']();
    // Simulate 32 seconds of holding.
    session.workTimer.deadline=Date.now()+8000;
    A.actions['work-finish']();
    const rec=session.records[0];
    assert.equal(rec.reps,32);
    assert.equal(rec.early,true);
    assert.match(toast(w),/Hold ended after 32 seconds \(early\)/);
    assert(session.timer,'rest starts after the hold ends');
    w.document.getElementById('log-reps').value='30';
    A.actions['confirm-set']();
    assert.equal(session.records[0].reps,30,'the user can correct the actual seconds');
    assert.equal(session.records[0].confirmed,true);
  }finally{shut(app);}
});

test('cancelling the hold timer records no set and leaves the workout resumable',async()=>{
  const app=boot();const {w,A}=app;
  try{
    const session=timedWorkout(A,{seconds:40});
    A.actions['work-start']();
    A.actions['work-cancel']();
    assert.equal(session.workTimer,null);
    assert.equal(session.records.length,0);
    assert.equal(session.pendingLogId,null);
    assert.equal(session.timer,null);
    assert.equal(session.queue[0].exerciseId,'plank','the hold is still pending');
    assert.match(toast(w),/No set was recorded/);
    assert(w.document.querySelector('[data-action="work-start"]'),'the Start timer button is available again');
  }finally{shut(app);}
});

test('duplicate native completion callbacks record a timed set exactly once',async()=>{
  const native=nativeBridge();const app=boot({native:native.bridge});const {w,A}=app;
  try{
    const session=timedWorkout(A,{seconds:40});
    A.actions['work-start']();
    const deadline=session.workTimer.deadline;
    assert(native.calls.some(c=>c[0]==='timer'&&c[3]==='work'),'the hold uses its own native timer channel');
    w.onNativeWorkFinished(String(deadline));
    const afterFirst=session.records.length;
    w.onNativeWorkFinished(String(deadline));
    w.onNativeWorkFinished(String(deadline));
    assert.equal(afterFirst,1);
    assert.equal(session.records.length,1,'no duplicate completion');
    assert.equal(session.timer.kind,'rest');
    assert(native.calls.some(c=>c[0]==='timer'&&c[3]==='rest'),'the rest timer is started on the rest channel');
    assert(native.calls.some(c=>c[0]==='cancel'&&c[1]==='work'),'the finished hold timer is cancelled');
  }finally{shut(app);}
});

test('a hold timer delivered while the WebView was closed completes on resume',async()=>{
  const native=nativeBridge();const app=boot({native:native.bridge});const {w,A}=app;
  try{
    const session=timedWorkout(A,{seconds:40});
    A.actions['work-start']();
    const deadline=session.workTimer.deadline;
    native.bridge.__state={workDelivered:deadline};
    A.syncNativeTimer();
    assert.equal(session.workTimer,null);
    assert.equal(session.records.length,1);
    assert.equal(session.records[0].reps,40);
    A.syncNativeTimer();
    assert.equal(session.records.length,1,'a second sync must not log it again');
  }finally{shut(app);}
});

test('ordinary weighted work still uses Set done and never a work countdown',async()=>{
  const app=boot();const {w,A,E}=app;
  try{
    const s=A.s();s.settings.warmups=false;
    const entries=[{id:'e1',exerciseId:'bench-press',sourceId:'bench-press',pairGroup:'PRESS',sets:1,targetWeight:60,targetReps:8,manualTarget:false,skipped:false}];
    const p=E.planEntries(s,entries);
    s.session=E.newSession(s,{...p,entries});
    A.ui.route='session';A.render();
    assert.equal(w.document.querySelector('[data-action="work-start"]'),null);
    assert(w.document.querySelector('[data-action="set-done"]'));
    A.actions['set-done']();
    assert.equal(s.session.records.length,1);
    assert.equal(s.session.records[0].reps,8);
    assert.equal(s.session.workTimer,null,'weighted work never starts a hold timer');
  }finally{shut(app);}
});

// -------- Priority 3: keep-screen-awake bridge --------

test('the native keep-screen-awake flag follows the workout and the setting',async()=>{
  const native=nativeBridge();const app=boot({native:native.bridge});const {w,A,E}=app;
  try{
    const awakeCalls=()=>native.calls.filter(c=>c[0]==='awake').map(c=>c[1]);
    assert.equal(awakeCalls().at(-1),false,'no session, no wake flag');
    const p=E.plan(A.s(),['chest']);A.s().session=E.newSession(A.s(),p);
    A.save();
    assert.equal(awakeCalls().at(-1),true,'an active workout keeps the screen on');
    A.actions['setting-toggle']({key:'keepAwake'});
    assert.equal(awakeCalls().at(-1),false,'disabling the setting clears the flag');
    A.s().settings.keepAwake=true;A.save();
    assert.equal(awakeCalls().at(-1),true);
    A.E.finishSession(A.s());A.save();
    assert.equal(awakeCalls().at(-1),false,'committing the workout releases the screen');
    A.s().session=E.newSession(A.s(),E.plan(A.s(),['chest']));A.save();
    assert.equal(awakeCalls().at(-1),true);
    A.confirm('Discard this workout?','test','discard-session-actual','Discard');
    A.ui.modal.data.action='discard-session-actual';
    A.actions['confirm-dialog']();
    assert.equal(A.s().session,null);
    assert.equal(awakeCalls().at(-1),false,'discarding the workout releases the screen');
  }finally{shut(app);}
});

test('the browser preview still uses the Wake Lock API instead of the bridge',async()=>{
  const app=boot();const {w,A}=app;
  try{
    const requested=[];
    Object.defineProperty(w.navigator,'wakeLock',{configurable:true,value:{request:async()=>{requested.push('request');return {released:false,release:async()=>{requested.push('release');}};}}});
    const p=A.E.plan(A.s(),['chest']);A.s().session=A.E.newSession(A.s(),p);
    await A.screenAwake();
    assert.deepEqual(requested,['request']);
    A.s().settings.keepAwake=false;
    await A.screenAwake();
    assert.deepEqual(requested,['request','release']);
  }finally{shut(app);}
});

// -------- Priority 4: previous-workspace recovery --------

test('the previous workspace can be inspected and restored, keeping the current one',async()=>{
  const app=boot();const {w,A}=app;
  try{
    A.s().settings.rest=111;A.save();                 // first save: nothing previous yet in a fresh profile
    A.s().settings.rest=222;A.save();                 // second save: previous = rest 111
    A.s().settings.rest=333;A.save();                 // previous = rest 222
    A.actions['recover-previous']();
    const title=w.document.getElementById('modal-title').textContent;
    assert.match(title,/Restore the previous workspace/);
    const body=w.document.querySelector('.modal-body').textContent;
    assert.match(body,/Saved/,'the recovery copy timestamp is shown');
    assert.match(body,/Saved sessions/,'basic contents are shown');
    A.actions['recover-confirm']();
    assert.equal(A.s().settings.rest,222,'the previous workspace is restored');
    assert.equal(w.localStorage.getItem('forge.workout.v1.previous.includes')===null,true);
    const previous=JSON.parse(w.localStorage.getItem('forge.workout.v1.previous'));
    assert.equal(previous.settings.rest,333,'the workspace in use is preserved as the new recovery copy');
    const current=JSON.parse(w.localStorage.getItem('forge.workout.v1'));
    assert.equal(current.settings.rest,222);
  }finally{shut(app);}
});

test('a corrupt previous workspace is reported and the current workspace is untouched',async()=>{
  const app=boot();const {w,A}=app;
  try{
    A.s().settings.rest=90;A.save();
    w.localStorage.setItem('forge.workout.v1.previous','{"version":999}');
    w.localStorage.setItem('forge.workout.v1.previous.modified',String(Date.now()));
    A.actions['recover-previous']();
    assert.match(w.document.getElementById('modal-title').textContent,/not usable/);
    assert.match(w.document.querySelector('.modal-body').textContent,/unsupported version/);
    assert.equal(w.document.querySelector('[data-action="recover-confirm"]'),null,'invalid data cannot be restored');
    assert.equal(A.s().settings.rest,90);
    assert.equal(JSON.parse(w.localStorage.getItem('forge.workout.v1')).settings.rest,90);
    assert.equal(w.localStorage.getItem('forge.workout.v1.previous'),'{"version":999}','the bad copy is left for inspection');
  }finally{shut(app);}
});

test('the native recovery path validates before calling the bridge',async()=>{
  const native=nativeBridge();
  const app=boot({native:native.bridge});const {w,A}=app;
  try{
    A.s().settings.rest=90;A.save();
    native.bridge.__current=native.saved;
    native.bridge.__previous={available:true,modified:Date.now(),state:'{"version":999}'};
    A.actions['recover-previous']();
    assert.match(w.document.getElementById('modal-title').textContent,/not usable/);
    assert.equal(native.bridge.__restored,undefined,'the bridge is never asked to restore invalid JSON');
    native.bridge.__previous={available:true,modified:Date.now(),state:native.saved};
    A.actions['recover-previous']();
    A.actions['recover-confirm']();
    assert(native.bridge.__restored,'the validated JSON is handed to the transactional native restore');
  }finally{shut(app);}
});

test('a storage read failure keeps the unreadable state instead of overwriting it',async()=>{
  const app=boot({storage:'{"version":999}'});const {w,A}=app;
  try{
    assert(A.Store.error,'the load error is reported');
    assert.match(w.document.getElementById('modal-title').textContent,/needs attention/);
    assert.equal(w.localStorage.getItem('forge.workout.v1'),'{"version":999}','the unreadable state is untouched');
    assert.equal(A.s().version,1,'the app still starts with a fresh in-memory workspace');
  }finally{shut(app);}
});

// -------- Priority 7: one complete mixed workout through the real app layer --------

test('a complete workout with a timed hold, logging, rest and COMMIT stays consistent',async()=>{
  const app=boot();const {w,A,E}=app;
  try{
    const s=A.s();
    // First-use starts, then plan chest + abs so both weighted and timed work appear.
    s.settings.selectedBlocks=['chest','abs'];
    const plan=E.plan(s,['chest','abs']);
    for(const en of plan.entries)A.s().targets[en.exerciseId]={weight:en.targetWeight,reps:en.targetReps,manual:true};
    A.ui.planned=plan;A.actions['start-workout']();
    assert(s.session,'the workout started');
    A.ui.route='session';A.render();

    let guard=0;
    while(s.session&&s.session.queue.length){
      A.render();
      const task=s.session.queue[0];
      const e=E.ex(s,task.exerciseId);
      if(e.type==='timed'&&!task.warmup){
        assert(w.document.querySelector('[data-action="work-start"]'),'timed work offers Start timer');
        assert.equal(w.document.querySelector('[data-action="set-done"]'),null);
        A.actions['work-start']();
        s.session.workTimer.deadline=Date.now()+5000;   // pretend 5 s remaining, then finish
        A.actions['work-finish']();
      }else{
        A.actions['set-done']();
      }
      assert(s.session.pendingLogId,'a set was logged');
      A.actions['confirm-set']();
      if(s.session.timer)A.actions['timer-skip']();
      if(++guard>200)throw new Error('workout did not terminate');
    }
    assert.equal(s.session.queue.length,0);
    A.render();
    A.actions['commit']();
    assert.equal(s.session,null);
    assert.equal(A.s().sessions.length,1);
    const stored=A.s().sessions[0];
    assert(stored.records.some(r=>r.reps>0));
    assert.equal(A.E.validate(A.s()),true);
    assert.equal(w.document.querySelector('#toast').textContent.length>0,true);
    const awakeCalls=[]; // the browser preview has no native bridge
    assert(awakeCalls.length===0);
    A.navigate('progress');A.navigate('history');A.navigate('library');A.navigate('settings');
    assert.match(w.document.getElementById('app').innerHTML,/Previous workspace/);
  }finally{shut(app);}
});
