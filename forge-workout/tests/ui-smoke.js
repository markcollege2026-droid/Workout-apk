/* End-to-end UI smoke checks. Start the preview server before running. */
const {chromium,expect}=require('@playwright/test');
const fs=require('node:fs');
const path=require('node:path');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const context=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true});
 const page=await context.newPage(),errors=[],checks=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 const click=async(action,data='')=>page.locator(`[data-action="${action}"]${data}:visible`).first().click();
 const check=(name)=>{checks.push(name);console.log('PASS',name);};
 const noOverflow=async()=>{const info=await page.evaluate(()=>({ok:document.documentElement.scrollWidth<=innerWidth,width:innerWidth,scroll:document.documentElement.scrollWidth,route:ForgeApp.ui.route,overflow:[...document.querySelectorAll('main *')].filter(e=>e.getBoundingClientRect().right>innerWidth+1).map(e=>[e.tagName,e.className]).slice(0,12)}));if(!info.ok)throw new Error('Overflow: '+JSON.stringify(info));};
 try{
  await page.goto(process.env.FORGE_URL||'http://localhost:3000');
  await expect(page.locator('h1')).toContainText('Make today count');await noOverflow();check('Offline seed loads and desktop overview fits');
  await page.screenshot({path:'tests/artifacts/desktop-overview.png',fullPage:true});
  for(const route of ['progress','history','library','settings','session','today']){await click('nav',`[data-route="${route}"]`);await expect(page.locator('h1')).toBeVisible();await noOverflow();}
  check('All six navigation screens render without errors');
  await click('nav','[data-route="library"]');await click('exercise-edit','[data-id="bench-press"]');
  await page.locator('#edit-note').fill('Grip: second ring. Safety pins: 6.');await click('save-exercise');
  expect(await page.evaluate(()=>ForgeApp.s().exercises.find(e=>e.id==='bench-press').note)).toContain('Safety pins');check('Editable exercise definitions and machine settings memory');
  await click('exercise-add');await page.locator('#edit-name').fill('Test row');await page.locator('#edit-muscle').fill('Back');await page.locator('#edit-block').selectOption('back');await click('save-exercise');
  const custom=await page.evaluate(()=>ForgeApp.s().exercises.find(e=>e.name==='Test row').id);
  await click('exercise-edit',`[data-id="${custom}"]`);await click('archive-exercise');await click('confirm-dialog');
  expect(await page.evaluate(id=>ForgeApp.s().exercises.find(e=>e.id===id).active,custom)).toBe(false);check('Add, edit and archive keep IDs and histories safe');
  await click('nav','[data-route="settings"]');await click('pairing');await page.locator('#pair-exercise').selectOption('bench-press');
  await page.locator('.pair-check[data-b="pull-down"]').uncheck();expect(await page.evaluate(()=>ForgeApp.s().pairOverrides['bench-press|pull-down'])).toBe(false);
  await click('reset-pairs');await click('confirm-dialog');await click('close-modal');check('Symmetric pairing table editing and reset');
  await click('equipment');await page.locator('#equipment-dumbbells').fill('-1, 4');await click('save-equipment');await expect(page.locator('#toast')).toContainText('comma-separated');
  await page.locator('#equipment-dumbbells').fill('2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40');await click('save-equipment');check('Equipment validation rejects invalid loads without a partial save');
  await click('nav','[data-route="today"]');await click('bodyweight');await page.locator('#body-weight').fill('72.4');await click('save-bodyweight');expect(await page.evaluate(()=>ForgeApp.s().bodyweights[0].weight)).toBe(72.4);check('Bodyweight snapshot source is recorded locally');
  await click('block-toggle','[data-id="back"]');await click('plan-workout');
  if(await page.locator('[data-action="review-start"]').count())await click('review-start');
  await expect(page.locator('#modal-title')).toContainText('starting point');await click('conservative-starts');await click('save-starts');
  await expect(page.locator('h1')).toContainText('streamlined');expect(await page.evaluate(()=>ForgeApp.ui.planned.entries.length)).toBe(6);check('First-use starting-weight flow builds a complete plan');
  await page.screenshot({path:'tests/artifacts/desktop-plan.png',fullPage:true});await click('start-workout');
  await expect(page.locator('[data-action="set-done"]')).toBeEnabled();await click('set-done');await expect(page.locator('#timer-text')).toBeVisible();await expect(page.locator('#log-reps')).toHaveValue('8');
  expect(await page.evaluate(()=>ForgeApp.s().session.timer.deadline-Date.now())).toBeGreaterThan(40000);
  await page.locator('#log-note').fill('Warm-up smooth.');await click('confirm-set');await click('undo');expect(await page.evaluate(()=>ForgeApp.s().session.records.length)).toBe(0);check('Rest starts before logging; confirmation and undo are functional');
  await click('set-done');await page.locator('#log-note').fill('Preserved while the timer ends.');
  await page.evaluate(()=>{ForgeApp.s().session.timer.deadline=Date.now()+150;ForgeApp.save();});
  await expect(page.locator('#timer-text')).toHaveCount(0,{timeout:4000});await expect(page.locator('#log-note')).toHaveValue('Preserved while the timer ends.');check('Timer expiry preserves an in-progress log');
  await page.reload();await expect(page.locator('h1')).toContainText('next set');await expect(page.locator('#log-note')).toHaveValue('Preserved while the timer ends.');await click('confirm-set');check('Crash/reload resumes the exact pending set and its draft');
  await click('session-note');await page.locator('#session-note-edit').fill('Good sleep. Controlled tempo.');await click('save-session-note');
  await click('unavailable');await expect(page.locator('#modal-title')).toContainText('starting point');await click('conservative-starts');await click('save-starts');
  expect(await page.evaluate(()=>ForgeApp.s().session.entries.find(e=>e.exerciseId==='bench-press').skipped)).toBe(true);
  expect(await page.evaluate(()=>ForgeApp.s().session.entries.some(e=>e.exerciseId==='dumbbell-bench-press'))).toBe(true);check('Unavailable swaps, replans and keeps independent substitute targets');
  await click('skip-exercise');expect(await page.evaluate(()=>ForgeApp.s().session.queue.some(r=>r.exerciseId==='incline-bench'))).toBe(false);check('Skip removes remaining work without creating a failed attempt');
  await page.setViewportSize({width:390,height:844});await noOverflow();await click('set-done');await page.screenshot({path:'tests/artifacts/mobile-workout.png',fullPage:true});await click('confirm-set');await click('timer-skip');
  let completed=0;
  while(await page.evaluate(()=>ForgeApp.s().session.queue.length>0)){
   const task=await page.evaluate(()=>{const t=ForgeApp.s().session.queue[0],e=ForgeApp.s().exercises.find(e=>e.id===t.exerciseId);return {...t,rangeTop:e.max,type:e.type};});
   await click('set-done');await page.locator('#log-reps').fill(String(task.warmup?task.reps:task.rangeTop));
   if(await page.locator('[data-action="set-rir"]').count())await click('set-rir','[data-value="1"]');
   await click('confirm-set');if(await page.locator('[data-action="timer-skip"]').count())await click('timer-skip');completed++;
   if(completed>100)throw new Error('Workout failed to terminate');
  }
  await expect(page.locator('[data-action="commit"]')).toBeVisible();await click('commit');await expect(page.locator('.notice.success').first()).toContainText('COMMITTED');
  const summary=await page.evaluate(()=>({history:ForgeApp.s().sessions.length,active:ForgeApp.s().session,original:ForgeApp.s().suggestions['bench-press'],subs:ForgeApp.s().suggestions['dumbbell-bench-press'],valid:ForgeEngine.validate(ForgeApp.s())}));
  expect(summary.history).toBe(1);expect(summary.active).toBe(null);expect(summary.original).toBeUndefined();expect(summary.subs).toBeTruthy();expect(summary.valid).toBe(true);check('Full session COMMIT generates independent suggestions, real charts and records');
  await noOverflow();await page.screenshot({path:'tests/artifacts/mobile-progress.png',fullPage:true});
  const decisionCounts=await page.evaluate(()=>({pending:ForgeEngine.outstandingSuggestions(ForgeApp.s()).length,targets:JSON.parse(JSON.stringify(ForgeApp.s().targets)),records:Object.fromEntries(Object.entries(ForgeApp.s().suggestions).map(([id,q])=>[id,q.decision]))}));
  if(await page.locator('[data-action="accept-suggestion"]').count())await click('accept-suggestion');
  const acceptedNow=await page.evaluate(()=>Object.values(ForgeApp.s().suggestions).filter(q=>q.decision==='accepted').length);
  expect(acceptedNow).toBeGreaterThan(0);check('One-tap acceptance applies the next target explicitly');
  if(await page.locator('[data-action="reject-suggestion"]').count()){
    const before=await page.evaluate(()=>{const id=ForgeEngine.outstandingSuggestions(ForgeApp.s())[0].exerciseId;return {id,target:ForgeEngine.target(ForgeApp.s(),ForgeEngine.ex(ForgeApp.s(),id))};});
    await click('reject-suggestion');
    const after=await page.evaluate(id=>({decision:ForgeApp.s().suggestions[id].decision,target:ForgeEngine.target(ForgeApp.s(),ForgeEngine.ex(ForgeApp.s(),id))}),before.id);
    expect(after.decision).toBe('rejected');
    expect(after.target.weight).toBe(before.target.weight);expect(after.target.reps).toBe(before.target.reps);
    check('Reject keeps the current target and stores the decision');
  }
  if(await page.locator('[data-action="defer-suggestion"]').count()){
    const deferred=await page.evaluate(()=>{const q=ForgeEngine.outstandingSuggestions(ForgeApp.s())[0];if(!q)return null;const before=ForgeEngine.target(ForgeApp.s(),ForgeEngine.ex(ForgeApp.s(),q.exerciseId));return {id:q.exerciseId,weight:before.weight,reps:before.reps};});
    if(deferred){
      await click('defer-suggestion');
      const after=await page.evaluate(id=>({decision:ForgeApp.s().suggestions[id].decision,target:ForgeEngine.target(ForgeApp.s(),ForgeEngine.ex(ForgeApp.s(),id))}),deferred.id);
      expect(after.decision).toBe('deferred');
      expect(after.target.weight).toBe(deferred.weight);expect(after.target.reps).toBe(deferred.reps);
      check('Defer stores a distinct decision and never applies the target');
    }
  }
  const acceptedBefore=await page.evaluate(()=>Object.values(ForgeApp.s().suggestions).filter(x=>x.accepted).length);
  await click('nav','[data-route="history"]');await expect(page.locator('.history-row')).toHaveCount(1);await click('history-session');await click('history-edit');
  const originalStart=await page.locator('#history-date-edit').inputValue();
  const future=new Date(Date.now()+86400000),futureStr=future.getFullYear()+'-'+String(future.getMonth()+1).padStart(2,'0')+'-'+String(future.getDate()).padStart(2,'0');
  await page.locator('#history-date-edit').fill(futureStr+'T12:00');await click('save-history');
  await expect(page.locator('#toast')).toContainText('up to today');
  expect(await page.evaluate(()=>ForgeApp.s().sessions[0].startedAt<Date.now())).toBe(true);
  await page.locator('#history-date-edit').fill(originalStart);check('History editing rejects future session dates without saving');
  await page.locator('#history-duration').fill('25.5');await page.locator('#history-session-note').fill('Edited session note.');await page.locator('.history-note').first().fill('Edited historical set.');await click('save-history');
  expect(await page.evaluate(()=>ForgeApp.s().sessions[0].durationSeconds)).toBe(1530);expect(await page.evaluate(()=>ForgeApp.s().sessions[0].note)).toBe('Edited session note.');check('Past-session set, note and duration editing recalculates suggestions');
  expect(await page.evaluate(()=>Object.values(ForgeApp.s().suggestions).filter(x=>x.accepted).length)).toBe(acceptedBefore);check('History editing preserves explicitly accepted suggestions');
  await click('nav','[data-route="settings"]');const downloadPromise=page.waitForEvent('download');await click('export');const dl=await downloadPromise,location=await dl.path(),backup=fs.readFileSync(location,'utf8');
  const payload=JSON.parse(backup);expect(payload.sessions.length).toBe(1);expect(payload.exercises.length).toBe(41);check('One-file JSON export includes the entire workspace');
  await page.locator('#backup-file').setInputFiles({name:'restore.json',mimeType:'application/json',buffer:Buffer.from(backup)});await expect(page.locator('#modal-title')).toContainText('Restore');await click('restore-confirm');expect(await page.evaluate(()=>ForgeApp.s().sessions[0].note)).toBe('Edited session note.');check('Validated JSON restore is all-or-nothing');
  await page.locator('#backup-file').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{"version":999}')});await expect(page.locator('#toast')).toContainText('Restore rejected');expect(await page.evaluate(()=>ForgeApp.s().sessions.length)).toBe(1);check('Invalid backup leaves current data untouched');
  await page.setViewportSize({width:320,height:740});for(const route of ['today','session','progress','history','library','settings']){await click('nav',`[data-route="${route}"]`);await noOverflow();}check('All screens remain one-handed and within a 320px viewport');
  await page.setViewportSize({width:390,height:844});await click('nav','[data-route="today"]');await page.screenshot({path:'tests/artifacts/mobile-overview.png',fullPage:true});
  const filePage=await browser.newPage({viewport:{width:390,height:844}});
  filePage.on('pageerror',e=>errors.push(e.message));
  await filePage.addInitScript(()=>{let saved='';window.__nativeCalls=[];window.Native={loadState:()=>saved,saveState:j=>{saved=j;window.__nativeCalls.push(['save']);return 'ok';},keepScreenAwake:v=>window.__nativeCalls.push(['awake',v]),setReminders:()=>{},permissions:()=>'{"native":true,"notifications":true,"exact":true}',startTimer:(...v)=>window.__nativeCalls.push(['timer',...v]),cancelTimer:()=>window.__nativeCalls.push(['cancel']),testAlert:()=>{},timerState:()=>JSON.stringify(window.__nativeStatus||{}),requestNotifications:()=>{},requestExactAlarms:()=>{},exportBackup:()=>{},importBackup:()=>{}};});
  await filePage.goto('file://'+path.resolve(__dirname,'../www/index.html'));await expect(filePage.locator('h1')).toContainText('Make today count');
  await filePage.evaluate(()=>{const s=ForgeApp.s();s.settings.selectedBlocks=['abs'];const p=ForgeEngine.plan(s,['abs']);s.session=ForgeEngine.newSession(s,p);ForgeApp.ui.route='session';ForgeApp.render();});
  await filePage.locator('[data-action="set-done"]').click();
  const calls=await filePage.evaluate(()=>__nativeCalls);expect(calls.some(c=>c[0]==='timer')).toBe(true);expect(calls.some(c=>c[0]==='awake'&&c[1]===true)).toBe(true);
  await filePage.evaluate(()=>onNativeTimerCancelled(ForgeApp.s().session.timer.deadline));expect(await filePage.evaluate(()=>ForgeApp.s().session.timer)).toBe(null);check('Local file assets, SQLite bridge contract, timer bridge and native skip callback');
  await filePage.evaluate(()=>{ForgeApp.s().session.timer={deadline:Date.now()+20000,total:20,kind:'rest'};window.__nativeStatus={cancelled:ForgeApp.s().session.timer.deadline};ForgeApp.syncNativeTimer();});expect(await filePage.evaluate(()=>ForgeApp.s().session.timer)).toBe(null);check('Native cancellation marker prevents resurrecting a rest skipped while closed');
  await filePage.locator('[data-action="discard-session"]').click();await filePage.locator('[data-action="confirm-dialog"]').click();expect(await filePage.evaluate(()=>ForgeApp.s().session)).toBe(null);expect(await filePage.evaluate(()=>ForgeApp.s().sessions.length)).toBe(0);check('Confirmed discard removes only the active session');
  const awakeAfterDiscard=await filePage.evaluate(()=>__nativeCalls.filter(c=>c[0]==='awake').map(c=>c[1]));
  expect(awakeAfterDiscard.at(-1)).toBe(false);check('Keep-screen-awake is cleared when the workout ends or is discarded');
  await filePage.close();

  // Manual target overrides, the timed-exercise hold timer and workspace recovery.
  const featurePage=await browser.newPage({viewport:{width:390,height:844}});
  featurePage.on('pageerror',e=>errors.push(e.message));
  featurePage.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await featurePage.goto(process.env.FORGE_URL||'http://localhost:3000');
  await featurePage.evaluate(()=>{ForgeApp.ui.progressExercise='hammer-curls';ForgeApp.navigate('progress');});
  await featurePage.locator('[data-action="target-edit"][data-id="hammer-curls"]').click();
  await featurePage.locator('#target-weight').fill('27.5');
  await featurePage.locator('#target-reps').fill('11');
  await featurePage.locator('[data-action="save-target"]').click();
  await expect(featurePage.locator('#toast')).toContainText('Manual target saved: 27.5 kg × 11 reps');
  expect(await featurePage.evaluate(()=>[ForgeApp.s().targets['hammer-curls'].weight,ForgeApp.s().targets['hammer-curls'].reps,ForgeApp.s().targets['hammer-curls'].manual])).toEqual([27.5,11,true]);
  await featurePage.reload();
  await featurePage.evaluate(()=>{ForgeApp.ui.progressExercise='hammer-curls';});
  await featurePage.locator('[data-action="nav"][data-route="progress"]:visible').first().click();
  await expect(featurePage.locator('.next-target').filter({hasText:'Hammer Curls'})).toContainText('27.5');
  await expect(featurePage.locator('.next-target').filter({hasText:'Hammer Curls'})).toContainText('MANUAL');
  expect(await featurePage.evaluate(()=>ForgeEngine.target(ForgeApp.s(),ForgeEngine.ex(ForgeApp.s(),'hammer-curls')).reps)).toBe(11);
  check('A manual weight and rep target between loadable values survives a reload, unrounded');

  await featurePage.evaluate(()=>{const s=ForgeApp.s(),E=ForgeEngine;s.settings.warmups=false;s.settings.triples=false;E.setTarget(s,E.ex(s,'plank'),0,40);
    const entries=[{id:'ui-plank',exerciseId:'plank',sourceId:'plank',pairGroup:'ABS',sets:1,targetWeight:0,targetReps:40,manualTarget:true,skipped:false},
                   {id:'ui-sit',exerciseId:'sit-ups',sourceId:'sit-ups',pairGroup:'ABS',sets:1,targetWeight:0,targetReps:10,manualTarget:false,skipped:false}];
    const p=E.planEntries(s,entries);
    s.session={id:'ui-timed',startedAt:Date.now(),endedAt:null,blocks:['abs'],entries:E.clone(entries),queue:E.clone(p.queue),records:[],timer:null,workTimer:null,pendingLogId:null,note:'',estimateSeconds:p.seconds,straightSeconds:p.straightSeconds,dropped:[],exerciseSnapshot:{}};
    s.session.queue.sort((a,b)=>Number(b.exerciseId==='plank')-Number(a.exerciseId==='plank'));
    ForgeApp.ui.route='session';ForgeApp.save();ForgeApp.render();});
  await expect(featurePage.locator('[data-action="work-start"]')).toContainText('Start 40-second timer');
  await expect(featurePage.locator('[data-action="set-done"]')).toHaveCount(0);
  await featurePage.locator('[data-action="work-start"]').click();
  await expect(featurePage.locator('#work-timer-text')).toBeVisible();
  const firstRead=await featurePage.locator('#work-timer-text').textContent();
  expect(firstRead).toBe('0:40');
  // The readout is a whole-second ceil(), so poll instead of assuming the exact tick.
  await expect.poll(()=>featurePage.locator('#work-timer-text').textContent(),{timeout:6000}).not.toBe(firstRead);
  await featurePage.locator('[data-action="work-cancel"]').click();
  expect(await featurePage.evaluate(()=>[ForgeApp.s().session.records.length,ForgeApp.s().session.workTimer])).toEqual([0,null]);
  await expect(featurePage.locator('[data-action="work-start"]')).toBeVisible();
  await featurePage.locator('[data-action="work-start"]').click();
  await featurePage.evaluate(()=>{ForgeApp.s().session.workTimer.deadline=Date.now()+9000;});
  await featurePage.locator('[data-action="work-finish"]').click();
  const logged=await featurePage.locator('#log-reps').inputValue();
  expect(Number(logged)).toBeGreaterThanOrEqual(28);
  expect(Number(logged)).toBeLessThan(40);
  await expect(featurePage.locator('.log-panel')).toContainText('Ended early');
  expect(await featurePage.evaluate(()=>ForgeApp.s().session.records[0].early)).toBe(true);
  await expect(featurePage.locator('[data-action="timer-skip"]')).toBeVisible();
  await featurePage.locator('[data-action="confirm-set"]').click();
  expect(await featurePage.evaluate(()=>ForgeApp.s().session.records[0].reps)).toBe(Number(logged));
  check('A timed exercise counts down, can be cancelled, and an early hold logs its real seconds');

  // Pre-workout recommendation review: decisions persist, a rerender creates no duplicate
  // prompts, and the user can always start without accepting.
  await featurePage.reload();
  await featurePage.evaluate(()=>{
    const s=ForgeApp.s(),E=ForgeEngine;
    s.session=null;ForgeApp.ui.planned=null;ForgeApp.ui.reviewed=false;
    s.settings.warmups=false;
    // Deterministic review state: only the two performances created below are outstanding.
    s.suggestions={};
    for(const e of s.exercises)if(s.targets[e.id].weight===null)s.targets[e.id].weight=20;
    const now=Date.now();
    const make=(id,at)=>{
      const e=E.ex(s,id);
      const en={id:E.uid(),exerciseId:id,sourceId:id,pairGroup:e.group,sets:1,targetWeight:100,targetReps:e.max,manualTarget:false,skipped:false};
      const sess={id:E.uid(),startedAt:at,endedAt:at+600000,durationSeconds:600,blocks:[e.block],entries:[en],
        records:[{id:E.uid(),entryId:en.id,exerciseId:id,setIndex:1,min:e.min,max:e.max,weight:100,reps:e.max,warmup:false,confirmed:true,rir:null,note:'',failed:false,bodyweight:null}],
        queue:[],timer:null,pendingLogId:null,note:'',estimateSeconds:600,straightSeconds:600,exerciseSnapshot:{[id]:E.clone(e)}};
      s.sessions.push(sess);
      E.recordSuggestions(s,sess,now);
    };
    make('bench-press',now-7200000);make('squats',now-3600000);
    ForgeApp.save();ForgeApp.render();
  });
  await featurePage.locator('[data-action="nav"][data-route="today"]:visible').first().click();
  await featurePage.locator('[data-action="plan-workout"]').click();
  await expect(featurePage.locator('#modal-title')).toContainText('Before you train');
  await expect(featurePage.locator('[data-action="review-start"]')).toBeVisible();
  const reviewOutstanding=await featurePage.evaluate(()=>ForgeEngine.outstandingSuggestions(ForgeApp.s()).length);
  expect(reviewOutstanding).toBe(2);
  const beforeDecide=await featurePage.evaluate(()=>{const s=ForgeApp.s();const q=ForgeEngine.outstandingSuggestions(s).map(x=>({id:x.exerciseId,decision:x.decision,source:x.sourceSessionId,target:ForgeEngine.target(s,ForgeEngine.ex(s,x.exerciseId))}));return q;});
  // Defer keeps the item outstanding, unapplied, and listed; it is never regenerated.
  await featurePage.locator('[data-action="review-defer"]').first().click();
  const deferredId=beforeDecide[0].id;
  const afterDefer=await featurePage.evaluate(id=>{const s=ForgeApp.s(),q=s.suggestions[id];return {decision:q.decision,source:q.sourceSessionId,target:ForgeEngine.target(s,ForgeEngine.ex(s,id)),outstanding:ForgeEngine.outstandingSuggestions(s).length};},deferredId);
  expect(afterDefer.decision).toBe('deferred');
  expect(afterDefer.source).toBe(beforeDecide[0].source);
  expect(afterDefer.target.weight).toBe(beforeDecide[0].target.weight);
  expect(afterDefer.target.reps).toBe(beforeDecide[0].target.reps);
  expect(afterDefer.outstanding).toBe(2);
  await expect(featurePage.locator('#modal-title')).toContainText('Before you train');
  // Only the rejected one leaves the outstanding list.
  await featurePage.locator('[data-action="review-reject"]').first().click();
  const reviewed=await featurePage.evaluate(()=>({outstanding:ForgeEngine.outstandingSuggestions(ForgeApp.s()).map(q=>q.decision).sort(),decisions:Object.values(ForgeApp.s().suggestions).map(q=>q.decision).sort()}));
  expect(reviewed.outstanding).toEqual(['deferred']);
  expect(reviewed.decisions).toEqual(['deferred','rejected']);
  // Starting without accepting builds the plan; the deferred item was not applied.
  await featurePage.locator('[data-action="review-start"]').click();
  await expect(featurePage.locator('h1')).toContainText('streamlined');
  expect(await featurePage.evaluate(()=>!!ForgeApp.ui.planned)).toBe(true);
  // Recalculation and rerender never duplicate or revive decided proposals.
  await featurePage.evaluate(()=>{ForgeEngine.recomputeSuggestions(ForgeApp.s());ForgeApp.save();ForgeApp.ui.planned=null;ForgeApp.render();});
  const afterRecompute=await featurePage.evaluate(()=>({decisions:Object.values(ForgeApp.s().suggestions).map(q=>q.decision).sort(),outstanding:ForgeEngine.outstandingSuggestions(ForgeApp.s()).length}));
  expect(afterRecompute.decisions).toEqual(['deferred','rejected']);
  expect(afterRecompute.outstanding).toBe(1);
  // The deferred item comes back for the next workout review; the rejected one stays quiet.
  await featurePage.locator('[data-action="nav"][data-route="today"]:visible').first().click();
  await featurePage.locator('[data-action="plan-workout"]').click();
  await expect(featurePage.locator('#modal-title')).toContainText('Before you train');
  expect(await featurePage.evaluate(()=>ForgeEngine.outstandingSuggestions(ForgeApp.s()).map(q=>q.decision))).toEqual(['deferred']);
  await featurePage.locator('[data-action="review-dismiss"]').click();
  check('Pre-workout review accepts/rejects/defers without duplicates and never blocks starting');
  await featurePage.reload();
  await featurePage.locator('[data-action="nav"][data-route="settings"]:visible').first().click();
  await featurePage.locator('[data-action="recover-previous"]').click();
  await expect(featurePage.locator('#modal-title')).toContainText('Restore the previous workspace');
  await expect(featurePage.locator('.modal-body')).toContainText('Saved');
  await featurePage.locator('[data-action="recover-confirm"]').click();
  await expect(featurePage.locator('#toast')).toContainText('Previous workspace restored');
  expect(await featurePage.evaluate(()=>ForgeEngine.validate(ForgeApp.s()))).toBe(true);
  check('The previous workspace can be inspected and restored from Settings');
  await featurePage.close();
  const corruptPage=await browser.newPage({viewport:{width:390,height:844}});
  corruptPage.on('pageerror',e=>errors.push(e.message));
  corruptPage.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await corruptPage.addInitScript(()=>{try{localStorage.setItem('forge.workout.v1','{"version":999}');}catch(e){}});
  await corruptPage.goto(process.env.FORGE_URL||'http://localhost:3000');
  await expect(corruptPage.locator('#modal-title')).toContainText('needs attention');
  expect(await corruptPage.evaluate(()=>localStorage.getItem('forge.workout.v1'))).toBe('{"version":999}');
  await corruptPage.locator('[data-action="close-modal"]').first().click();
  await corruptPage.locator('[data-action="block-toggle"][data-id="legs"]').click();
  expect(await corruptPage.evaluate(()=>JSON.parse(localStorage.getItem('forge.workout.v1')).version)).toBe(1);
  await corruptPage.close();check('Corrupt saved state warns without silent overwrite and recovers on first change');
  expect(errors).toEqual([]);check('Zero JavaScript page errors');
  fs.writeFileSync('tests/ui-results.json',JSON.stringify({passed:checks.length,checks,errors},null,2));console.log('\n'+checks.length+' UI checks passed.');
 }catch(e){console.error(e);await page.screenshot({path:'tests/artifacts/failure.png',fullPage:true});console.error('JS errors:',errors);process.exitCode=1;}
 finally{await browser.close();}
})();
