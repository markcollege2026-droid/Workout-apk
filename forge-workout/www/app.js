(function(root){
'use strict';
const A=root.ForgeApp,E=A.E,h=A.escape,I=A.icon;
const $=id=>document.getElementById(id);
const n=(id,min,max,integer=false)=>{
  const el=$(id);if(!el||el.value.trim()==='')throw new Error('Please fill in '+(el?.getAttribute('aria-label')||id.replaceAll('-',' '))+'.');
  const value=Number(el.value);if(!Number.isFinite(value)||value<min||value>max||(integer&&!Number.isInteger(value)))throw new Error('Use '+(integer?'a whole number':'a number')+' from '+min+' to '+max+'.');return value;
};
let audio, wakeLock, requestingWake=false;
const wantsScreenAwake=()=>!!(A.s().session&&A.s().settings.keepAwake);
A.screenAwake=async()=>{
  const keep=wantsScreenAwake();
  if(A.Store.native){
    // The APK owns FLAG_KEEP_SCREEN_ON; the WebView cannot set it, so ask the activity.
    try{root.Native.keepScreenAwake(keep);}catch(e){}
    return;
  }
  if(!navigator.wakeLock)return;
  if(keep&&document.visibilityState==='visible'){
    if(wakeLock&&!wakeLock.released||requestingWake)return;requestingWake=true;
    try{wakeLock=await navigator.wakeLock.request('screen');}catch(e){}finally{requestingWake=false;}
  }else if(wakeLock){try{await wakeLock.release();}catch(e){}wakeLock=null;}
};
const enableAudio=()=>{try{if(!audio)audio=new (root.AudioContext||root.webkitAudioContext)();if(audio.state==='suspended')audio.resume();}catch(e){}};
A.alert=()=>{
  if(A.Store.native){root.Native.testAlert(A.s().settings.sound,A.s().settings.vibrate);return;}
  if(A.s().settings.vibrate&&navigator.vibrate)navigator.vibrate([180,80,180]);
  if(A.s().settings.sound){enableAudio();if(audio){[880,660].forEach((freq,i)=>{const o=audio.createOscillator(),g=audio.createGain(),t=audio.currentTime+i*.23;o.type='sine';o.frequency.value=freq;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.14,t+.02);g.gain.exponentialRampToValueAtTime(.001,t+.2);o.connect(g);g.connect(audio.destination);o.start(t);o.stop(t+.22);});}}
};
A.scheduleTimer=()=>{
  const s=A.s(),timer=s.session?.timer;if(!timer)return;
  const task=s.session.queue[0];const label=task?E.ex(s,task.exerciseId).name+' · '+A.load(E.ex(s,task.exerciseId),task.weight,task.reps):'Last set complete · confirm and COMMIT';
  if(A.Store.native)root.Native.startTimer(Math.round(timer.deadline),timer.kind,label,s.settings.sound,s.settings.vibrate,'rest');
  else enableAudio();
};
A.cancelTimer=()=>{if(A.Store.native)root.Native.cancelTimer('rest');if(A.s().session)A.s().session.timer=null;};
/* Work timer = the timed exercise itself. It never shares state with the rest timer. */
A.scheduleWorkTimer=()=>{
  const s=A.s(),timer=s.session?.workTimer;if(!timer)return;
  const e=E.ex(s,timer.exerciseId);
  const label=(e?e.name+' · ':'')+'hold '+A.time(timer.total);
  if(A.Store.native)root.Native.startTimer(Math.round(timer.deadline),'work',label,s.settings.sound,s.settings.vibrate,'work');
  else enableAudio();
};
A.cancelWorkTimer=()=>{if(A.Store.native)root.Native.cancelTimer('work');if(A.s().session)A.s().session.workTimer=null;};
const workElapsed=timer=>Math.max(0,Math.min(timer.total,Math.round((Math.min(Date.now(),timer.deadline)-(timer.deadline-timer.total*1000))/1000)));
A.finishWorkTimer=options=>{
  const s=A.s();if(!s.session?.workTimer)return null;
  const result=E.finishWork(s,options||{});
  if(!result){return null;}
  if(A.Store.native)root.Native.cancelTimer('work');
  A.scheduleTimer();A.save();A.render();
  return result;
};
A.captureLog=(strict=false)=>{
  const sess=A.s().session,rec=sess?.records.find(r=>r.id===sess.pendingLogId);if(!rec||!$('log-reps'))return;
  if(strict){rec.reps=n('log-reps',0,3600,true);rec.weight=n('log-weight',0,1000);}
  else{const rr=Number($('log-reps').value),ww=Number($('log-weight').value);if(Number.isInteger(rr)&&rr>=0&&rr<=3600)rec.reps=rr;if(Number.isFinite(ww)&&ww>=0&&ww<=1000)rec.weight=ww;}
  rec.note=$('log-note')?.value.slice(0,2000)||'';
  if($('log-failed'))rec.failed=$('log-failed').checked;
};
A.buildPlan=()=>{
  const s=A.s();A.ui.planned=E.plan(s,s.settings.selectedBlocks,s.settings.budget);
  if(!A.ui.planned.entries.length){A.toast('Select a muscle block with active exercises.');return;}
  A.navigate('session');
};
A.refreshPlanned=()=>{if(A.ui.planned&&!A.s().session)A.ui.planned=E.plan(A.s(),A.s().settings.selectedBlocks,A.s().settings.budget);};
const syncReminders=()=>{if(A.Store.native)root.Native.setReminders(JSON.stringify(A.s().settings.reminders));};
const refreshActiveTimer=()=>{if(A.s().session?.timer)A.scheduleTimer();};
const confirmPending=()=>{
  const sess=A.s().session,rec=sess?.records.find(r=>r.id===sess.pendingLogId);if(!rec)return;
  A.captureLog(true);rec.confirmed=true;rec.failed=rec.failed||(!rec.warmup&&rec.reps<rec.min);sess.pendingLogId=null;
};
const commitActual=()=>{
  const sess=A.s().session;if(!sess)return;
  confirmPending();if($('finish-note'))sess.note=$('finish-note').value.slice(0,5000);
  A.cancelTimer();A.cancelWorkTimer();const done=E.finishSession(A.s());A.ui.lastCommitted=done.id;A.ui.planned=null;
  const first=done.records.find(r=>!r.warmup);if(first)A.ui.progressExercise=first.exerciseId;
  A.save();A.screenAwake();A.navigate('progress');A.toast('COMMITTED. Every set is saved.');
};
const recomputeSuggestions=()=>{
  const s=A.s();for(const e of s.exercises){
    const last=E.exerciseHistory(s,e.id).pop();
    if(!last){delete s.suggestions[e.id];continue;}
    const sug=E.suggestion(s,e,last.session);if(!sug)continue;
    const prev=s.suggestions[e.id];
    // An identical recompute of an already accepted proposal keeps the explicit acceptance;
    // a changed proposal is a new decision and correctly returns for review.
    if(prev&&prev.accepted&&prev.sessionId===sug.sessionId&&prev.kind===sug.kind&&prev.weight===sug.weight&&prev.reps===sug.reps)sug.accepted=true;
    s.suggestions[e.id]=sug;
  }
};
// A target edited during an active workout must reach the work still ahead, not only
// the next plan. Never rebuilds the queue while a work countdown or unconfirmed log is open.
const applyTargetToSession=(id,weight,reps,manual)=>{
  const s=A.s(),session=s.session;if(!session)return false;
  let touched=false;
  for(const en of session.entries){if(en.exerciseId!==id)continue;en.targetWeight=weight;en.targetReps=reps;en.manualTarget=manual===true;touched=true;}
  if(touched&&!session.workTimer&&!session.pendingLogId)session.queue=E.planEntries(s,session.entries,session.records).queue;
  return touched;
};
A.importData=text=>{
  try{
    if(text.length>64*1024*1024)throw new Error('Backup is larger than the 64 MB safety limit.');
    const imported=JSON.parse(text);E.validate(imported);
    A.dialog('restore','Restore this workspace?',`<p class="intro">This replaces <b>all current data</b>. Export a backup first if you want to keep it.</p><div class="summary-values"><div class="summary-line"><span>Exercises</span><strong>${imported.exercises.length}</strong></div><div class="summary-line"><span>Saved sessions</span><strong>${imported.sessions.length}</strong></div><div class="summary-line"><span>Body weight entries</span><strong>${imported.bodyweights.length}</strong></div><div class="summary-line"><span>Active workout</span><strong>${imported.session?'Yes · will resume':'No'}</strong></div></div><div class="notice">Restoring is all-or-nothing. Invalid or unsupported files are rejected without changing your data.</div>`,`<button class="btn ghost" data-action="close-modal">Cancel</button><button class="btn primary" data-action="restore-confirm">Restore all data ${I('upload','sm')}</button>`,{imported});
  }catch(e){A.toast('Restore rejected: '+e.message,7000);}
};
// Restoring the previous workspace is validated before anything is written, and the
// current workspace is preserved as the new recovery copy first.
A.restorePreviousWorkspace=text=>{
  const parsed=JSON.parse(text);
  E.validate(parsed);
  A.captureLog();
  // Storage is swapped first: if it fails, nothing local has changed yet and the
  // running timers are left alone.
  A.Store.restorePrevious(text);
  A.cancelTimer();A.cancelWorkTimer();
  A.Store.state=E.clone(parsed);
  if(!A.Store.state.session)A.Store.state.session=null;
  A.ui.planned=null;A.ui.lastCommitted=null;A.ui.progressExercise=A.Store.state.exercises[0]?.id||'bench-press';
  const session=A.Store.state.session;
  if(session){
    if(session.timer&&session.timer.deadline<=Date.now())session.timer=null;
    if(session.workTimer&&session.workTimer.deadline<=Date.now())session.workTimer=null;
  }
  // The restored JSON is already stored by restorePrevious(); saving here would overwrite
  // the copy of the workspace we just preserved, so only the timers are re-armed.
  syncReminders();if(session?.timer)A.scheduleTimer();if(session?.workTimer)A.scheduleWorkTimer();
  A.screenAwake();A.render();
  return A.Store.state;
};
const actions={
  'nav':d=>{A.captureLog();A.save();A.navigate(d.route);},
  'recover-previous':()=>A.openRecovery(),
  'recover-confirm':()=>{
    const data=A.ui.modal.data;
    try{
      const restored=A.restorePreviousWorkspace(data.text);
      A.close();A.navigate(restored.session?'session':'today');
      A.toast('Previous workspace restored. The workspace you were using is kept as the new recovery copy.',7000);
    }catch(e){A.toast('Recovery failed: '+e.message+' Your current workspace is unchanged.',9000);}
  },
  'close-modal':()=>A.close(),
  'preview-info':()=>A.previewInfo(),
  'help':()=>A.help(),
  'confirm-dialog':()=>{const data=A.ui.modal.data;A.close();if(data.action==='commit-actual')commitActual();else if(data.action==='discard-session-actual'){A.cancelTimer();A.cancelWorkTimer();A.s().session=null;A.ui.planned=null;A.save();A.screenAwake();A.navigate('today');A.toast('Session discarded. Saved history is unchanged.');}else if(data.action==='reset-pairs-actual'){A.s().pairOverrides={};A.save();A.openPairing(data.id);}else if(data.action==='archive-actual'){const e=E.ex(A.s(),data.id);e.active=false;A.save();A.refreshPlanned();A.render();A.toast('Archived. History and targets are preserved.');}},
  'block-toggle':d=>{const s=A.s(),sel=s.settings.selectedBlocks;s.settings.selectedBlocks=sel.includes(d.id)?sel.filter(id=>id!==d.id):[...sel,d.id];A.ui.planned=null;A.save();A.render();},
  'plan-workout':()=>{
    if(A.s().session){A.navigate('session');return;}
    const p=E.plan(A.s(),A.s().settings.selectedBlocks,A.s().settings.budget);
    if(!p.entries.length){A.toast('Choose at least one muscle block.');return;}
    const unknown=p.entries.map(x=>x.exerciseId).filter(id=>A.s().targets[id].weight===null);
    if(unknown.length)A.openStarts(unknown);else A.buildPlan();
  },
  'conservative-starts':()=>{document.querySelectorAll('.start-weight').forEach(input=>{const e=E.ex(A.s(),input.dataset.id);input.value=E.roundWeight(A.s(),e,e.suggested);});A.toast('Conservative suggestions filled. Review them before continuing.',5000);},
  'save-starts':()=>{
    const data=A.ui.modal.data,s=A.s();const values=[];
    document.querySelectorAll('.start-weight').forEach(input=>{if(input.value.trim()==='')throw new Error('Enter every weight, or use conservative starts.');const w=Number(input.value);if(!Number.isFinite(w)||w<0||w>1000)throw new Error('Weights must be between 0 and 1,000 kg.');values.push([input.dataset.id,w]);});
    // Starting loads typed here are explicit: they are stored exactly as entered.
    for(const [id,w] of values){
      const e=E.ex(s,id),current=s.targets[id]||{reps:e.min};
      const reps=Number.isInteger(Number(current.reps))?Math.min(3600,Math.max(1,Number(current.reps))):e.min;
      const result=E.setTarget(s,e,w,reps);
      if(result.error)throw new Error(e.name+': '+result.error);
      applyTargetToSession(id,result.target.weight,result.target.reps,true);
    }
    if(data.purpose==='substitute'){
      const en=s.session.entries.find(x=>x.id===data.entryId);const t=E.target(s,E.ex(s,en.exerciseId));en.targetWeight=t.weight;en.targetReps=t.reps;en.manualTarget=t.manual===true;s.session.queue=E.planEntries(s,s.session.entries,s.session.records).queue;
    }
    A.save();A.close();if(data.purpose==='plan')A.buildPlan();else{refreshActiveTimer();A.render();}
  },
  'start-workout':()=>{
    if(A.s().session){A.navigate('session');return;}if(!A.ui.planned)return;
    A.s().session=E.newSession(A.s(),A.ui.planned);A.save();A.render();window.scrollTo({top:0,behavior:'instant'});
    if(A.Store.native&&!A.Store.permissions().notifications)root.Native.requestNotifications();
  },
  'set-done':()=>{
    const s=A.s(),sess=s.session;
    if(!sess||sess.pendingLogId||sess.timer||sess.workTimer)return;
    const task=sess.queue[0],exercise=task&&E.ex(s,task.exerciseId);
    // A timed exercise is started with its own work countdown, never logged by a tap.
    if(exercise&&exercise.type==='timed'&&!task.warmup){actions['work-start']();return;}
    enableAudio();const rec=E.completeSet(s);if(!rec)return;A.scheduleTimer();A.save();A.render();window.scrollTo({top:0,behavior:'smooth'});
  },
  'work-start':()=>{
    const s=A.s();if(!s.session)return;
    const result=E.startWork(s);
    if(result.error){A.toast(result.error,5000);return;}
    enableAudio();A.scheduleWorkTimer();A.save();A.render();
    A.toast(result.exercise.name+' · hold timer started for '+result.total+' seconds.',2600);
  },
  'work-finish':()=>{
    const s=A.s(),timer=s.session?.workTimer;if(!timer)return;
    const result=A.finishWorkTimer({elapsed:workElapsed(timer)});
    if(!result){A.toast('That hold was already saved. Nothing was recorded twice.',4000);return;}
    A.toast('Hold ended after '+result.seconds+' seconds'+(result.early?' (early)':'')+'. Edit the seconds if needed, then confirm.',5000);
  },
  'work-cancel':()=>{
    const s=A.s();if(!s.session?.workTimer)return;
    A.cancelWorkTimer();A.save();A.render();
    A.toast('Hold timer cancelled. No set was recorded.',4000);
  },
  'confirm-set':()=>{confirmPending();A.save();A.render();A.toast('Set saved.',1400);},
  'set-rir':d=>{A.captureLog();const sess=A.s().session,rec=sess?.records.find(r=>r.id===sess.pendingLogId);if(!rec)return;const v=Number(d.value);rec.rir=rec.rir===v?null:v;A.save();A.render();},
  'timer-adjust':d=>{
    const t=A.s().session?.timer;if(!t)return;A.captureLog();const delta=Number(d.delta);
    t.deadline=Math.max(Date.now()+1000,t.deadline+delta*1000);t.total=Math.max(1,t.total+delta);A.scheduleTimer();A.save();A.render();
  },
  'timer-skip':()=>{A.captureLog();A.cancelTimer();A.save();A.render();},
  'undo':()=>{if(!A.s().session?.records.length)return;A.cancelTimer();E.undoSet(A.s());A.save();A.render();A.toast('Last set undone. No history or progression penalty.');},
  'unavailable':d=>{
    if(A.s().session?.pendingLogId){A.toast('Confirm the set you just finished first.');return;}
    const result=E.substitute(A.s(),d.entry);if(result.error){A.toast(result.error,5000);return;}
    A.save();refreshActiveTimer();A.render();A.toast('Swapped to '+result.exercise.name+'. Original progression is untouched.',5000);
    if(result.needsWeight)A.openStarts([result.exercise.id],'substitute',result.entry.id);
  },
  'skip-exercise':d=>{if(A.s().session?.pendingLogId){A.toast('Confirm your previous set first.');return;}E.skip(A.s(),d.entry);A.save();refreshActiveTimer();A.render();A.toast('Skipped today. No progression penalty.');},
  'session-note':()=>{const sess=A.s().session;if(!sess)return;A.captureLog();A.dialog('session-note','How did today feel?',`<p class="intro">Sleep, mood, energy, pain, or anything worth remembering.</p><textarea id="session-note-edit" maxlength="5000" placeholder="A note to your future self…">${h(sess.note)}</textarea>`,`<button class="btn ghost" data-action="close-modal">Cancel</button><button class="btn primary" data-action="save-session-note">Save note ${I('check','sm')}</button>`);},
  'save-session-note':()=>{A.s().session.note=$('session-note-edit').value.slice(0,5000);A.save();A.close();A.render();},
  'end-early':()=>{A.captureLog();A.confirm('Finish early?','COMMIT saves your completed sets. Incomplete or skipped exercises do not affect progression. Any unconfirmed target-prefilled set will be saved as shown.','commit-actual','COMMIT & save');},
  'discard-session':()=>A.confirm('Discard this workout?','Completed sets in this active session will be removed. Your saved history and accepted targets are not changed.','discard-session-actual','Discard workout'),
  'commit':()=>{if(A.s().session?.queue.length){actions['end-early']();return;}commitActual();},
  'target-edit':d=>A.openTarget(d.id),
  'suggestion-edit':d=>A.openTarget(d.id,true),
  'save-target':()=>{
    const s=A.s(),e=E.ex(s,A.ui.modal.data.id);
    const weight=$('target-weight')?.value.trim()??'',reps=$('target-reps')?.value.trim()??'';
    if(weight===''||reps==='')throw new Error('Enter both a weight and a '+(e.type==='timed'?'duration in seconds':'rep target')+'.');
    // Saved exactly as entered: no equipment rounding, no range clamping. The engine
    // applies absolute safety limits only and reports what was actually stored.
    const result=E.setTarget(s,e,Number(weight),Number(reps));
    if(result.error)throw new Error(result.error);
    applyTargetToSession(e.id,result.target.weight,result.target.reps,true);
    A.save();A.refreshPlanned();refreshActiveTimer();A.close();A.render();A.screenAwake();
    let message='Manual target saved: '+A.load(e,result.target.weight,result.target.reps);
    if(result.outsideRange)message+=' · outside the normal '+e.min+'–'+e.max+' range, kept as entered.';
    else if(!result.loadable)message+=' · kept as entered; it is not one of your loadable weights.';
    A.toast(message,6500);
  },
  'accept-suggestion':d=>{
    const s=A.s();if(!E.accept(s,d.id)){A.toast('That suggestion is no longer available.',4000);return;}
    const e=E.ex(s,d.id),t=E.target(s,e);
    applyTargetToSession(d.id,t.weight,t.reps,t.manual===true);
    A.save();A.refreshPlanned();refreshActiveTimer();A.render();A.toast('Next target accepted: '+A.load(e,t.weight,t.reps),5000);
  },
  'chart-mode':d=>{A.ui.chartMode=d.value;A.render();},
  'analyze':d=>{A.ui.progressExercise=d.id;A.navigate('progress');},
  'history-day':d=>{A.ui.historyDate=A.ui.historyDate===d.date?null:d.date;A.render();},
  'history-clear':()=>{A.ui.historyDate=null;A.render();},
  'calendar-month':d=>{const c=A.ui.calendar;A.ui.calendar=new Date(c.getFullYear(),c.getMonth()+Number(d.delta),1);A.render();},
  'history-session':d=>A.openHistory(d.id),
  'history-edit':d=>A.openHistory(d.id,true),
  'save-history':()=>{
    const sess=A.s().sessions.find(x=>x.id===A.ui.modal.data.id);const recs=E.clone(sess.records);
    document.querySelectorAll('.history-weight').forEach(el=>{const v=Number(el.value);if(el.value===''||!Number.isFinite(v)||v<0||v>1000)throw new Error('Invalid set weight.');recs[Number(el.dataset.index)].weight=v;});
    document.querySelectorAll('.history-reps').forEach(el=>{const v=Number(el.value);if(el.value===''||!Number.isInteger(v)||v<0||v>3600)throw new Error('Invalid reps or seconds.');recs[Number(el.dataset.index)].reps=v;});
    document.querySelectorAll('.history-note').forEach(el=>recs[Number(el.dataset.index)].note=el.value.slice(0,2000));
    document.querySelectorAll('.history-failed').forEach(el=>{const r=recs[Number(el.dataset.index)];r.failed=el.checked||r.reps<r.min;});
    document.querySelectorAll('.history-rir').forEach(el=>recs[Number(el.dataset.index)].rir=el.value===''?null:Number(el.value));
    const startedAt=new Date($('history-date-edit').value).getTime();if(!Number.isFinite(startedAt))throw new Error('Invalid session date.');
    if(startedAt>Date.now())throw new Error('Choose a session date up to today.');
    const durationSeconds=Math.round(n('history-duration',0,1440)*60);
    sess.records=recs;sess.startedAt=startedAt;sess.durationSeconds=durationSeconds;sess.endedAt=startedAt+durationSeconds*1000;sess.note=$('history-session-note').value.slice(0,5000);
    A.s().sessions.sort((a,b)=>a.startedAt-b.startedAt);recomputeSuggestions();A.save();A.close();A.render();A.toast('Session updated. Suggestions recalculated; accepted targets stay under your control.',5500);
  },
  'bodyweight':()=>A.openBodyweight(),
  'save-bodyweight':()=>{
    const weight=n('body-weight',1,500),date=$('body-date').value;if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||date>E.localDate())throw new Error('Choose a valid date up to today.');
    A.s().bodyweights=A.s().bodyweights.filter(b=>b.date!==date);A.s().bodyweights.push({date,weight});A.save();A.close();A.render();A.toast('Body weight logged.');
  },
  'delete-bodyweight':d=>{A.s().bodyweights=A.s().bodyweights.filter(b=>b.date!==d.date);A.save();A.openBodyweight();A.render();},
  'library-filter':d=>{A.ui.libraryBlock=d.id;A.render();},
  'exercise-add':()=>{if(A.s().session){A.toast('Finish your active workout before changing exercise definitions.');return;}A.openExercise();},
  'exercise-edit':d=>{if(A.s().session){A.toast('Finish your active workout before changing exercise definitions.');return;}A.openExercise(d.id);},
  'exercise-reorder':d=>{
    const e=E.ex(A.s(),d.id);const list=A.s().exercises.filter(x=>x.active&&x.primary===e.primary&&x.block===e.block).sort((a,b)=>a.order-b.order),idx=list.indexOf(e),other=list[idx+Number(d.delta)];
    if(other){[e.order,other.order]=[other.order,e.order];A.save();A.refreshPlanned();A.render();}
  },
  'sub-add':()=>{const id=$('sub-add-select').value,subs=A.ui.modal.data.substitutes;if(!subs.includes(id))subs.push(id);A.renderSubs();},
  'sub-remove':d=>{A.ui.modal.data.substitutes.splice(Number(d.index),1);A.renderSubs();},
  'sub-move':d=>{const subs=A.ui.modal.data.substitutes,i=Number(d.index),j=i+Number(d.delta);if(j>=0&&j<subs.length)[subs[i],subs[j]]=[subs[j],subs[i]];A.renderSubs();},
  'save-exercise':()=>{
    const data=A.ui.modal.data,e=E.clone(data.e);e.name=$('edit-name').value.trim();e.muscle=$('edit-muscle').value.trim();if(!e.name||!e.muscle)throw new Error('Name and primary muscle are required.');
    e.block=$('edit-block').value;e.type=$('edit-type').value;e.min=n('edit-min',1,3600,true);e.max=n('edit-max',e.min,3600,true);e.sets=n('edit-sets',1,20,true);e.rest=$('edit-rest').value===''?null:n('edit-rest',0,1800,true);
    e.equipment=$('edit-equipment').value;e.equipmentTag=$('edit-equipment-tag').value.trim().slice(0,120);e.increment=n('edit-increment',.01,100);e.priority=Number($('edit-priority').value);e.group=$('edit-group').value;
    if(['deadlift','squats','farmer-carries'].includes(e.id))e.group='SOLO';
    e.primary=$('edit-primary').checked;e.compound=$('edit-compound').checked;e.warmup=$('edit-warmup').checked;e.active=$('edit-active').checked;e.note=$('edit-note').value.slice(0,2000);e.substitutes=[...data.substitutes];
    if(data.id){
      A.s().exercises=A.s().exercises.map(x=>x.id===e.id?e:x);
      const t=A.s().targets[e.id];
      // Only automatic targets follow a changed range or equipment list.
      if(t.manual!==true){t.reps=Math.min(e.max,Math.max(e.min,t.reps));if(t.weight!==null)t.weight=E.roundWeight(A.s(),e,t.weight);}
    }
    else{A.s().exercises.push(e);A.s().targets[e.id]={weight:e.type==='bodyweight'||e.equipment==='bodyweight'?0:null,reps:e.min};}
    A.save();A.refreshPlanned();A.close();A.render();A.toast('Exercise saved.');
  },
  'archive-exercise':d=>A.confirm('Archive this exercise?','It is removed from new routines, not from your history. Show archived exercises in the Library to bring it back.','archive-actual','Archive',{id:d.id}),
  'setting-toggle':d=>{
    A.captureLog();A.s().settings[d.key]=!A.s().settings[d.key];A.save();A.refreshPlanned();if(['sound','vibrate'].includes(d.key))refreshActiveTimer();A.render();
  },
  'save-timers':()=>{const next={rest:n('setting-rest',0,1800,true),transition:n('setting-transition',0,120,true),warmupRest:n('setting-warmupRest',0,300,true)};Object.assign(A.s().settings,next);A.save();A.refreshPlanned();A.toast('Defaults saved. New plans use these times; the current countdown is unchanged.');},
  'save-progression':()=>{A.s().settings.safeJump=n('setting-safeJump',1,100);A.s().settings.stallSessions=n('setting-stallSessions',2,20,true);recomputeSuggestions();A.save();A.render();A.toast('Progression preferences saved.');},
  'equipment':()=>A.openEquipment(),
  'save-equipment':()=>{
    const cfg=E.clone(A.s().settings);cfg.barWeight=n('equipment-bar',0,100);
    cfg.plates=$('equipment-plates').value.split(',').map(v=>v.trim()).filter(Boolean).map(v=>{const m=v.match(/^(\d+(?:\.\d+)?)\s*[x×:]\s*(\d+)$/i);if(!m)throw new Error('Use plates like 1.25x2, 5x2.');const weight=Number(m[1]),pairs=Number(m[2]);if(weight<.1||weight>100||pairs<0||pairs>12)throw new Error('Plate weight 0.1–100 kg; 0–12 pairs.');return {weight,pairs};});
    if(cfg.plates.length>20)throw new Error('Use at most 20 plate denominations.');
    for(const key of ['dumbbells','cables','machines','addedLoads']){
      const values=$('equipment-'+key).value.split(',').map(v=>v.trim()).filter(Boolean).map(Number);
      if(!values.length||values.length>1000||values.some(v=>!Number.isFinite(v)||v<0||v>1000))throw new Error('Enter a nonempty comma-separated load list from 0 to 1,000 kg.');cfg[key]=[...new Set(values)].sort((a,b)=>a-b);
    }
    if(!cfg.addedLoads.includes(0))cfg.addedLoads.unshift(0);
    A.s().settings=cfg;
    let kept=0;
    for(const e of A.s().exercises){
      const t=A.s().targets[e.id];
      // Automatic targets follow the equipment list. A manual override is preserved.
      if(t.manual===true){kept++;continue;}
      if(t.weight!==null)t.weight=E.roundWeight(A.s(),e,t.weight);
    }
    recomputeSuggestions();A.save();A.refreshPlanned();A.close();A.render();
    A.toast('Loadable weights updated.'+(kept?' '+kept+' manual target'+(kept===1?'':'s')+' kept exactly as saved.':''),5500);
  },
  'pairing':()=>A.openPairing(),
  'reset-pairs':()=>A.confirm('Reset pairing overrides?','This clears your per-exercise overrides and restores the default symmetric group rules. Exercise group assignments stay as you edited them.','reset-pairs-actual','Reset',{id:A.ui.modal.data.id}),
  'reminder-day':d=>{const days=A.s().settings.reminders.days,day=Number(d.day);A.s().settings.reminders.days=days.includes(day)?days.filter(x=>x!==day):[...days,day];A.save();syncReminders();A.render();},
  'notification-permission':()=>{if(!A.Store.native){A.previewInfo();return;}root.Native.requestNotifications();},
  'alarm-permission':()=>{if(!A.Store.native){A.previewInfo();return;}root.Native.requestExactAlarms();},
  'test-alert':()=>{A.alert();A.toast('Completion alert tested. Check media / alarm volume if silent.');},
  'export':()=>{
    A.captureLog();A.save();const json=JSON.stringify({...E.clone(A.s()),exportedAt:new Date().toISOString()},null,2),name='forge-backup-'+E.localDate()+'.json';
    if(A.Store.native){root.Native.exportBackup(json,name);A.toast('Choose where to save your backup.');}
    else{const url=URL.createObjectURL(new Blob([json],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);A.toast('JSON backup exported.');}
  },
  'import':()=>{if(A.Store.native)root.Native.importBackup();else $('backup-file').click();},
  'restore-confirm':()=>{
    const imported=E.clone(A.ui.modal.data.imported);A.cancelTimer();A.Store.state=imported;A.ui.planned=null;A.ui.lastCommitted=null;A.ui.progressExercise=imported.exercises[0].id;
    if(imported.session?.timer&&imported.session.timer.deadline<=Date.now())imported.session.timer=null;
    if(imported.session){if(!imported.session.workTimer||imported.session.workTimer.deadline<=Date.now())imported.session.workTimer=null;}
    A.save();syncReminders();if(imported.session?.timer)A.scheduleTimer();if(imported.session?.workTimer)A.scheduleWorkTimer();A.close();A.navigate(imported.session?'session':'today');A.toast('Workspace restored. All data stays on this device.');
  }
};
A.actions=actions;
document.addEventListener('click',event=>{
  const target=event.target.closest('[data-action]');if(!target||target.disabled)return;
  const action=actions[target.dataset.action];if(!action)return;event.preventDefault();
  try{action(target.dataset,event,target);}catch(e){A.toast(e.message,5000);console.warn('Forge:',e.message);}
});
document.addEventListener('change',event=>{
  const el=event.target,s=A.s();try{
    if(el.id==='time-budget'){const v=el.value===''?null:Number(el.value);if(v!==null&&(!Number.isFinite(v)||v<5||v>240))throw new Error('Time budget: 5–240 minutes, or leave blank.');s.settings.budget=v;A.ui.planned=null;A.save();A.render();}
    if(el.id==='progress-exercise'){A.ui.progressExercise=el.value;A.render();}
    if(el.id==='preview-block'){A.ui.previewBlock=el.value;A.render();}
    if(el.id==='show-subs'){A.ui.showSubs=el.checked;A.render();}
    if(el.id==='show-archived'){A.ui.showArchived=el.checked;A.render();}
    if(el.id==='pair-exercise')A.openPairing(el.value);
    if(el.classList.contains('pair-check')){
      const ea=E.ex(s,el.dataset.a),eb=E.ex(s,el.dataset.b),k=E.key(ea.id,eb.id),defaultValue=E.canPair({...s,pairOverrides:{}},ea,eb);
      if(defaultValue===el.checked)delete s.pairOverrides[k];else s.pairOverrides[k]=el.checked;A.save();A.refreshPlanned();
    }
    if(el.id==='reminder-time'){if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(el.value))throw new Error('Choose a valid reminder time.');s.settings.reminders.time=el.value;A.save();syncReminders();}
    if(['log-reps','log-weight','log-note','log-failed'].includes(el.id)){A.captureLog();A.save();}
    if(el.id==='edit-type'&&el.value==='bodyweight')$('edit-equipment').value='bodyweight';
    if(el.id==='backup-file'&&el.files?.length){const file=el.files[0];if(file.size>64*1024*1024)throw new Error('Backup exceeds the 64 MB limit.');file.text().then(A.importData).catch(e=>A.toast(e.message));el.value='';}
  }catch(e){A.toast(e.message,6000);}
});
document.addEventListener('input',event=>{
  const el=event.target;
  if(el.id==='exercise-search'){const caret=el.selectionStart;A.ui.search=el.value;A.render();$('exercise-search')?.focus();$('exercise-search')?.setSelectionRange(caret,caret);}
  if(['log-reps','log-weight','log-note','log-failed'].includes(el.id)){A.captureLog();A.save();}
  if(el.id==='finish-note'&&A.s().session){A.s().session.note=el.value.slice(0,5000);A.save();}
});
document.addEventListener('keydown',event=>{
  if(!A.ui.modal)return;
  if(event.key==='Escape'){A.close();return;}
  if(event.key==='Tab'){
    const focusable=[...document.querySelectorAll('.modal button:not(:disabled),.modal input:not(:disabled),.modal select,.modal textarea')].filter(e=>e.offsetParent!==null);
    const first=focusable[0],last=focusable[focusable.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
  }
});
const expire=()=>{
  if(!A.s().session?.timer)return;A.captureLog();A.s().session.timer=null;A.save();if(!A.Store.native)A.alert();A.render();A.toast(A.s().session.queue.length?'Rest complete. Your next set is ready.':'Final rest complete. Confirm and COMMIT.',2200);
};
// Work countdown reached zero: log the ACTUAL hold duration, then start the normal rest.
const expireWork=complete=>{
  const s=A.s(),timer=s.session?.workTimer;if(!timer)return false;
  // A native delivery (or an expired stored deadline) means the full hold was completed.
  const result=E.finishWork(s,complete?{elapsed:timer.total,at:Date.now()}:{at:Date.now()});
  if(!result)return false;
  if(A.Store.native)root.Native.cancelTimer('work');
  if(!A.Store.native)A.alert();
  A.scheduleTimer();A.save();A.render();
  A.toast((result.early?'Hold ended after ':'Hold complete: ')+result.seconds+'s. Confirm the set, then rest.',3800);
  return true;
};
setInterval(()=>{
  const session=A.s().session;if(!session)return;
  const work=session.workTimer;
  if(work){
    const remaining=Math.max(0,Math.ceil((work.deadline-Date.now())/1000));
    if($('work-timer-text'))$('work-timer-text').textContent=A.time(remaining);
    if($('work-timer-ring'))$('work-timer-ring').setAttribute('stroke-dashoffset',String(320.44*(1-Math.min(1,remaining/Math.max(1,work.total)))));
    if(work.deadline<=Date.now())expireWork();
    return;
  }
  const timer=session.timer;if(!timer)return;
  const left=Math.max(0,Math.ceil((timer.deadline-Date.now())/1000));
  if($('timer-text'))$('timer-text').textContent=A.time(left);
  if($('floating-timer-text'))$('floating-timer-text').textContent=A.time(left);
  if($('timer-ring'))$('timer-ring').setAttribute('stroke-dashoffset',String(320.44*(1-Math.min(1,left/Math.max(1,timer.total)))));
  if(timer.deadline<=Date.now())expire();
},250);
A.syncNativeTimer=(text=null)=>{
  if(!A.Store.native||!root.Native.timerState)return;
  try{
    const status=JSON.parse(text||root.Native.timerState()),s=A.s();
    const t=s.session?.timer;
    if(t&&(Number(status.cancelled)===t.deadline||Number(status.delivered)===t.deadline)){A.captureLog();s.session.timer=null;A.save();A.render();}
    const w=s.session?.workTimer;
    // A hold countdown that finished while the WebView was closed completes exactly once.
    if(w&&Number(status.workDelivered)===w.deadline)expireWork(true);
    else if(w&&Number(status.workCancelled)===w.deadline){s.session.workTimer=null;A.save();A.render();}
  }catch(e){}
};
root.onNativeTimerState=text=>A.syncNativeTimer(text);
root.onNativeTimerFinished=deadline=>{const t=A.s().session?.timer;if(t&&Math.abs(t.deadline-Number(deadline))<500)expire();};
root.onNativeTimerCancelled=deadline=>{const t=A.s().session?.timer;if(t&&Math.abs(t.deadline-Number(deadline))<500){A.captureLog();A.s().session.timer=null;A.save();A.render();}};
root.onNativeWorkFinished=deadline=>{const w=A.s().session?.workTimer;if(w&&Math.abs(w.deadline-Number(deadline))<500)expireWork(true);};
root.onNativeWorkCancelled=deadline=>{const s=A.s(),w=s.session?.workTimer;if(w&&Math.abs(w.deadline-Number(deadline))<500){s.session.workTimer=null;A.save();A.render();}};
root.onNativeImport=text=>A.importData(text);
root.onNativeMessage=text=>A.toast(text,5000);
root.onNativePermissions=()=>{if(A.ui.route==='settings'&&!A.ui.modal)A.render();};
// The activity resumed: re-assert the wake flag and reconcile any native timer that
// finished while the WebView was paused.
root.onNativeResume=()=>{A.screenAwake();A.syncNativeTimer();};
root.onNativeBack=()=>{if(A.ui.modal){A.close();return true;}if(A.ui.route!=='today'&&!A.s().session){A.navigate('today');return true;}if(A.ui.route!=='session'&&A.s().session){A.navigate('session');return true;}return false;};
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){A.screenAwake();if(A.s().session?.timer&&A.s().session.timer.deadline<=Date.now())expire();}else{A.captureLog();A.save();}});
A.render();A.screenAwake();if(A.Store.native)syncReminders();
if(A.s().session){
  A.syncNativeTimer();
  if(A.s().session.timer){if(A.s().session.timer.deadline<=Date.now())A.s().session.timer=null;else A.scheduleTimer();}
  let workResumed=false;
  const pendingWork=A.s().session?.workTimer;
  if(pendingWork){
    if(pendingWork.deadline<=Date.now())workResumed=expireWork(pendingWork.deadline<Date.now()-2000);
    else A.scheduleWorkTimer();
  }
  if(!workResumed)A.toast('Workout resumed. Your last set is safe.',4000);
  A.render();
}
if(!A.Store.error)A.save();
if(A.Store.error)A.dialog('storage-error','A storage file needs attention.',`<p class="intro">Your saved state could not be read: ${h(A.Store.error)}. Restore a valid JSON backup in Settings. The app has not overwritten the unreadable state; continuing and making changes creates a new state.</p>`,`<button class="btn ghost" data-action="import">Restore a backup</button><button class="btn primary" data-action="close-modal">Continue with a fresh workspace</button>`);
})(window);
