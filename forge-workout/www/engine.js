/* Pure workout engine. Shared by Android, browser preview and Node tests. */
(function(root){
'use strict';
const GROUPS={
  PRESS:['ROW_PULL','REAR_SHOULDER','BI','ABS','LEG_ISO'],
  OHP:['ROW_PULL','BI','ABS','LEG_ISO'],
  LATERAL:['ROW_PULL','BI','ABS','LEG_ISO','WRIST'],
  TRI:['ROW_PULL','BI','REAR_SHOULDER','ABS','LEG_ISO'],
  BI:['PRESS','TRI','REAR_SHOULDER','ABS','LEG_ISO'],
  ROW_PULL:['PRESS','TRI','OHP','LATERAL','ABS','LEG_ISO'],
  REAR_SHOULDER:['PRESS','TRI','BI','ABS','LEG_ISO','WRIST'],
  LEG_ISO:['PRESS','TRI','BI','ROW_PULL','REAR_SHOULDER','OHP','LATERAL','WRIST','ABS','LEG_ISO'],
  LUNGES:['ABS','WRIST'],
  ABS:[], WRIST:['PRESS','TRI','LATERAL','REAR_SHOULDER','LEG_ISO','ABS','LUNGES'], SOLO:[]
};
const clone = x=>JSON.parse(JSON.stringify(x));
const uid = ()=>Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8);
const ex = (s,id)=>s.exercises.find(e=>e.id===id);
const key = (a,b)=>[a,b].sort().join('|');
const number = (v,d=0)=>Number.isFinite(Number(v))?Number(v):d;
const rounded = n=>Math.round(n*100)/100;
function canPair(s,a,b){
  if(a.id===b.id) return false;
  const ga=a.pairGroup||a.group, gb=b.pairGroup||b.group;
  if(ga==='SOLO'||gb==='SOLO'||[a.id,b.id,a.sourceId,b.sourceId].some(id=>['deadlift','squats','farmer-carries'].includes(id)))return false;
  const k=key(a.id,b.id);
  if(Object.prototype.hasOwnProperty.call(s.pairOverrides,k))return s.pairOverrides[k]===true;
  const is=(x,id)=>x.id===id||x.sourceId===id;
  const either=(id,predicate)=>(is(a,id)&&predicate(b))||(is(b,id)&&predicate(a));
  if(either('plank',x=>['push-ups','dips','overhead-press'].some(id=>is(x,id))))return false;
  if(either('leg-raises',x=>(x.pairGroup||x.group)==='LEG_ISO'||is(x,'pull-ups')))return false;
  if(ga==='ABS'&&gb==='ABS')return false;
  return (GROUPS[ga]||[]).includes(gb)||(GROUPS[gb]||[]).includes(ga);
}
function loadable(s,e){
  const cfg=s.settings;
  if(e.equipment==='barbell'){
    let vals=new Set([Math.round(number(cfg.barWeight,20)*100)]);
    for(const p of cfg.plates){
      const next=new Set();
      for(const v of vals)for(let count=0;count<=Math.min(12,p.pairs);count++){
        const w=v+Math.round(p.weight*200)*count;if(w<=100000)next.add(w);
      }
      vals=next;
    }
    return [...vals].sort((a,b)=>a-b).map(v=>v/100);
  }
  const field=e.type==='bodyweight'?'addedLoads':{dumbbell:'dumbbells',cable:'cables',machine:'machines',bodyweight:'addedLoads'}[e.equipment];
  return [...new Set((cfg[field]||cfg.addedLoads).map(Number))].filter(v=>v>=0&&Number.isFinite(v)).sort((a,b)=>a-b);
}
function roundWeight(s,e,w,mode='nearest'){
  const vals=loadable(s,e); if(!vals.length)return rounded(Math.max(0,w));
  if(mode==='down')return vals.filter(v=>v<=w+0.001).pop()??vals[0];
  if(mode==='up')return vals.find(v=>v>=w-0.001)??vals[vals.length-1];
  return vals.reduce((best,v)=>Math.abs(v-w)<Math.abs(best-w)?v:best,vals[0]);
}
function target(s,e){
  const t=s.targets[e.id]||{weight:null,reps:e.min};
  return {weight:roundWeight(s,e,t.weight===null?e.suggested:t.weight),reps:Math.max(e.min,Math.min(e.max,number(t.reps,e.min))),configured:t.weight!==null};
}
function rest(s,e){return e.rest===null||e.rest===undefined?s.settings.rest:e.rest;}
function makeEntries(s,selected){
  return s.exercises.filter(e=>e.active&&e.primary&&selected.includes(e.block)).sort((a,b)=>a.order-b.order).map(e=>{
    const t=target(s,e);
    return {id:uid(),exerciseId:e.id,sourceId:e.id,pairGroup:e.group,sets:e.sets,targetWeight:t.weight,targetReps:t.reps,skipped:false};
  });
}
function planEntries(s,entries,records=[]){
  const pending=entries.filter(en=>!en.skipped).map(en=>{
    const e=ex(s,en.exerciseId);if(!e)return null;
    const done=records.filter(r=>!r.warmup&&r.entryId===en.id).length;
    return {...e,...en,id:e.id,entryId:en.id,remaining:Math.max(0,en.sets-done),done};
  }).filter(e=>e&&e.remaining>0).sort((a,b)=>Number(b.compound)-Number(a.compound)||a.order-b.order);
  const groups=[];const pool=[...pending];
  while(pool.length){
    const a=pool.shift();let group=[a];
    const candidates=pool.filter(b=>canPair(s,a,b)).sort((b,c)=>
      Number(c.remaining===a.remaining)-Number(b.remaining===a.remaining)||Math.abs(a.remaining-b.remaining)-Math.abs(a.remaining-c.remaining)||Number(c.compound)-Number(b.compound)||b.order-c.order);
    if(candidates.length){group.push(candidates[0]);pool.splice(pool.indexOf(candidates[0]),1);}
    if(s.settings.triples&&group.length===2){
      const c=pool.filter(x=>group.every(g=>canPair(s,g,x))).sort((b,c)=>Number(c.remaining===a.remaining)-Number(b.remaining===a.remaining)||b.order-c.order)[0];
      if(c){group.push(c);pool.splice(pool.indexOf(c),1);}
    }
    groups.push(group);
  }
  const queue=[];let warmupSeconds=0;
  for(let g=0;g<groups.length;g++){
    const group=groups[g];
    for(const e of group){
      if(s.settings.warmups&&e.warmup&&e.done===0){
        const ramps=[[.4,8],[.6,5],[.8,3]];
        for(let wi=0;wi<ramps.length;wi++){
          if(records.some(r=>r.warmup&&r.entryId===e.entryId&&r.setIndex===wi+1))continue;
          const weight=roundWeight(s,e,e.targetWeight*ramps[wi][0],'down');
          const task={id:uid(),entryId:e.entryId,exerciseId:e.id,setIndex:wi+1,sets:3,warmup:true,
            weight,reps:ramps[wi][1],min:e.min,max:e.max,kind:'warmup',group:g,restAfter:s.settings.warmupRest};
          queue.push(task);warmupSeconds+=task.reps*3+task.restAfter;
        }
      }
    }
    const rounds=Math.max(...group.map(e=>e.remaining));
    for(let r=0;r<rounds;r++){
      const active=group.filter(e=>r<e.remaining);
      for(let i=0;i<active.length;i++){
        const e=active[i]; const last=i===active.length-1;
        queue.push({id:uid(),entryId:e.entryId,exerciseId:e.id,setIndex:e.done+r+1,sets:e.sets,warmup:false,
          weight:e.targetWeight,reps:e.targetReps,min:e.min,max:e.max,kind:group.length===3?'triple':group.length===2?'superset':'straight',transition:!last,
          group:g,restAfter:last?Math.max(...active.map(x=>rest(s,x))):s.settings.transition});
      }
    }
  }
  const workSeconds=queue.reduce((a,t)=>a+(ex(s,t.exerciseId).type==='timed'&&!t.warmup?t.reps:t.reps*3),0);
  const seconds=queue.reduce((a,t)=>a+t.restAfter,workSeconds)+pending.length*10;
  const straightSeconds=pending.reduce((a,e)=>a+e.remaining*((e.type==='timed'?e.targetReps:e.targetReps*3)+rest(s,e)),warmupSeconds)+pending.length*10;
  return {queue,groups:groups.map(g=>g.map(e=>e.entryId)),seconds,straightSeconds,savedSeconds:Math.max(0,straightSeconds-seconds),workingSets:pending.reduce((a,e)=>a+e.remaining,0)};
}
function plan(s,selected,budget=null){
  let entries=makeEntries(s,selected);let result=planEntries(s,entries);const dropped=[];
  if(budget&&budget>0){
    while(result.seconds>budget*60&&entries.length>1){
      const candidates=[...entries].sort((a,b)=>{
        const ea=ex(s,a.exerciseId),eb=ex(s,b.exerciseId);
        return Number(ea.compound)-Number(eb.compound)||eb.priority-ea.priority||eb.order-ea.order;
      });
      const drop=candidates[0];entries=entries.filter(x=>x.id!==drop.id);dropped.push(drop.exerciseId);result=planEntries(s,entries);
    }
  }
  return {...result,entries,dropped,overBudget:!!budget&&result.seconds>budget*60};
}
function newSession(s,planned){
  return {id:uid(),startedAt:Date.now(),endedAt:null,blocks:clone(s.settings.selectedBlocks),entries:clone(planned.entries),
    queue:clone(planned.queue),records:[],timer:null,pendingLogId:null,note:'',estimateSeconds:planned.seconds,
    straightSeconds:planned.straightSeconds,dropped:planned.dropped||[],exerciseSnapshot:Object.fromEntries(s.exercises.map(e=>[e.id,clone(e)]))};
}
function bodyweight(s,at=Date.now()){
  return s.bodyweights.filter(b=>b.date<=localDate(at)).sort((a,b)=>b.date.localeCompare(a.date))[0]?.weight??null;
}
function completeSet(s){
  const session=s.session;if(!session||!session.queue.length)return null;
  const task=session.queue.shift(),e=ex(s,task.exerciseId);
  const rec={...clone(task),id:uid(),task:clone(task),at:Date.now(),weight:task.weight,reps:task.reps,
    confirmed:false,rir:null,note:'',failed:false,bodyweight:bodyweight(s)};
  session.records.push(rec);session.pendingLogId=rec.id;
  session.timer={deadline:Date.now()+task.restAfter*1000,total:task.restAfter,kind:task.warmup?'warmup':task.transition?'transition':'rest'};
  return rec;
}
function undoSet(s){
  const session=s.session;if(!session||!session.records.length)return false;
  const rec=session.records.pop();session.queue.unshift(clone(rec.task));session.pendingLogId=null;session.timer=null;return true;
}
function fullRecords(session,id){
  const en=session.entries.find(e=>e.exerciseId===id);
  if(!en)return null;
  const recs=session.records.filter(r=>r.exerciseId===id&&!r.warmup&&r.confirmed);
  if(recs.length<en.sets)return null;
  return {entry:en,records:recs.slice(0,en.sets)};
}
function exerciseHistory(s,id){
  return s.sessions.filter(x=>fullRecords(x,id)).sort((a,b)=>a.startedAt-b.startedAt).map(x=>({session:x,...fullRecords(x,id)}));
}
function lastRecords(s,id){return [...s.sessions].sort((a,b)=>b.startedAt-a.startedAt).map(x=>x.records.filter(r=>r.exerciseId===id&&!r.warmup&&r.confirmed)).find(r=>r.length)||[];}
function missed(e,records){return records.filter(r=>r.reps<(r.min??e.min)||r.failed).length>=Math.ceil(records.length/2);}
function suggestion(s,e,session){
  const current=fullRecords(session,e.id);if(!current)return null;
  const {entry,records}=current;
  const base=entry.targetWeight;const reps=entry.targetReps;
  const prev=exerciseHistory(s,e.id).filter(x=>x.session.id!==session.id&&x.session.startedAt<session.startedAt).pop();
  const obj={sessionId:session.id,exerciseId:e.id,weight:base,reps,kind:'hold',accepted:false,reason:'Repeat this load and build clean reps.'};
  if(missed(e,records)){
    if(prev&&missed(e,prev.records)){
      obj.kind='deload';obj.weight=roundWeight(s,e,base*.9,'down');obj.reps=e.min;
      obj.reason='Below the minimum on at least half your sets twice in a row. Consider a 10% deload.';
      if(obj.weight>=base)obj.reason+=' Your equipment cannot load a lighter weight; use an easier variation.';
    }else obj.reason='Minimum missed. Repeat this load; skipped and incomplete exercises never count as misses.';
    return obj;
  }
  const isTop=records.every(r=>r.reps>=e.max&&!r.failed&&r.weight>=base);
  if(e.type==='timed'&&e.id!=='farmer-carries'&&e.max>e.min){
    if(records.every(r=>r.reps>=reps)&&reps<e.max){obj.kind='time';obj.reps=Math.min(e.max,reps+5);obj.reason='All timed sets completed. Add 5 seconds next session.';return obj;}
    if(!isTop){obj.reason='Keep this duration until every set is complete.';return obj;}
    obj.kind='variation';obj.reason='Time ceiling reached. Add load or choose a harder variation.';return obj;
  }
  if(!isTop){
    const minDone=Math.min(...records.map(r=>r.reps));
    obj.reps=Math.min(e.max,Math.max(e.min,Math.min(reps+1,minDone+1)));
    obj.kind=obj.reps>reps?'reps':'hold';obj.reason='Keep the load. Aim for '+obj.reps+(e.type==='timed'?' seconds':' reps')+' on every set.';
    return obj;
  }
  obj.reps=e.max;
  const previousHeld=prev&&prev.entry.targetWeight===base&&prev.records.every(r=>r.reps>=e.max&&r.weight>=base)&&prev.records.some(r=>r.rir===0);
  if(records.some(r=>r.rir===0)&&!previousHeld){obj.reason='Top of range, but 0 reps in reserve. Hold this load for one more session.';return obj;}
  const double=e.type!=='timed'&&records.every(r=>r.reps>=e.max+2);const inc=e.increment*(double?2:1);
  let load=Math.min(...records.map(r=>r.weight));
  const bw=e.type==='bodyweight'?bodyweight(s,session.startedAt):0;
  if(load===0&&(!bw||bw===0)){
    obj.kind='variation';obj.weight=roundWeight(s,e,e.increment,'up');obj.reps=e.min;
    obj.reason='All sets at the top. Consider added load or a harder variation. Log body weight to enforce the 5% total-load cap.';return obj;
  }
  const cap=load+(load+(bw||0))*s.settings.safeJump/100;
  const desired=load+inc;
  const next=loadable(s,e).filter(w=>w>load+.001&&w<=cap+.001&&w<=desired+.001).pop();
  if(next===undefined){
    obj.weight=load;obj.reason='Top of range reached, but the next loadable step exceeds your '+s.settings.safeJump+'% safe-jump cap. Edit the target to override.';return obj;
  }
  obj.kind='raise';obj.weight=next;obj.reps=e.min;
  obj.reason=(double?'Every set beat the ceiling by 2+ reps. Double increment, capped at '+s.settings.safeJump+'%.':'Every set reached the top of the range. Raise to the next safe, loadable weight.')+(e.type==='bodyweight'?' Added weight; total load includes your body weight.':'');
  return obj;
}
function finishSession(s){
  const session=s.session;if(!session)return null;
  session.records.forEach(r=>{r.confirmed=true;r.failed=r.failed||(!r.warmup&&r.reps<(r.min||ex(s,r.exerciseId).min));});
  session.endedAt=Date.now();session.durationSeconds=Math.max(0,Math.round((session.endedAt-session.startedAt)/1000));
  session.timer=null;session.pendingLogId=null;
  session.queue=[];
  session.records.forEach(r=>{delete r.task;});
  session.exerciseSnapshot=Object.fromEntries(session.entries.map(en=>[en.exerciseId,session.exerciseSnapshot[en.exerciseId]]));
  s.sessions.push(clone(session));
  for(const en of session.entries){const e=ex(s,en.exerciseId);const sug=e&&suggestion(s,e,session);if(sug)s.suggestions[e.id]=sug;}
  s.session=null;return session;
}
function accept(s,id,weight=null,reps=null){
  const sug=s.suggestions[id];if(!sug)return false;
  s.targets[id]={weight:weight===null?sug.weight:weight,reps:reps===null?sug.reps:reps};sug.accepted=true;return true;
}
function substitute(s,entryId){
  const sess=s.session,en=sess?.entries.find(x=>x.id===entryId);if(!en)return {error:'No exercise to replace.'};
  const original=ex(s,en.sourceId);const candidates=original.substitutes||[];
  const used=new Set(sess.entries.map(x=>x.exerciseId));
  const next=candidates.find(id=>!used.has(id)&&ex(s,id)?.active);
  if(!next)return {error:'No unused substitutes left. Edit the substitute list or skip today.'};
  en.skipped=true;const e=ex(s,next),t=target(s,e);
  const replacement={id:uid(),exerciseId:e.id,sourceId:en.sourceId,pairGroup:en.pairGroup,sets:e.sets,
    targetWeight:t.weight,targetReps:t.reps,skipped:false};
  sess.entries.push(replacement);sess.exerciseSnapshot[e.id]=clone(e);
  sess.queue=planEntries(s,sess.entries,sess.records).queue;
  return {exercise:e,entry:replacement,needsWeight:!t.configured};
}
function skip(s,entryId){
  const en=s.session.entries.find(x=>x.id===entryId);if(!en)return;
  en.skipped=true;s.session.queue=planEntries(s,s.session.entries,s.session.records).queue;
}
function actualLoad(r,e){return r.weight+((e.type==='bodyweight'&&r.bodyweight)?r.bodyweight:0);}
function epley(weight,reps){return weight>0&&reps>0?weight*(1+reps/30):0;}
function stats(s,id){
  const e=ex(s,id);const hist=s.sessions.map(session=>({session,records:session.records.filter(r=>r.exerciseId===id&&!r.warmup&&r.confirmed)})).filter(x=>x.records.length).sort((a,b)=>a.session.startedAt-b.session.startedAt);
  const points=hist.map(({session,records})=>{const original=session.exerciseSnapshot?.[id]||e;return {date:session.endedAt||session.startedAt,
    weight:Math.max(...records.map(r=>r.weight)), reps:Math.max(...records.map(r=>r.reps)),
    e1rm:original.type==='timed'?0:Math.max(...records.map(r=>epley(actualLoad(r,original),r.reps))),
    volume:records.reduce((a,r)=>a+actualLoad(r,original)*r.reps,0),seconds:original.type==='timed'?Math.max(...records.map(r=>r.reps)):0};});
  return {points,prWeight:Math.max(0,...points.map(p=>p.weight)),prReps:Math.max(0,...points.map(p=>p.reps)),
    pr1rm:Math.max(0,...points.map(p=>p.e1rm)),prVolume:Math.max(0,...points.map(p=>p.volume))};
}
function stalled(s){
  return s.exercises.filter(e=>{
    const h=exerciseHistory(s,e.id).slice(-s.settings.stallSessions);if(h.length<s.settings.stallSessions)return false;
    const score=({records})=>Math.max(...records.map(r=>e.type==='timed'?r.reps*Math.max(1,r.weight):actualLoad(r,e)>0?epley(actualLoad(r,e),r.reps):r.reps));
    const first=score(h[0]);return h.slice(1).every(x=>score(x)<=first+.001);
  });
}
function weeklyVolume(s,now=Date.now()){
  const out={};for(const e of s.exercises)out[e.muscle]=0;
  for(const sess of s.sessions.filter(x=>(x.endedAt||x.startedAt)>=now-7*86400000)){
    for(const r of sess.records.filter(r=>!r.warmup&&r.confirmed)){const e=ex(s,r.exerciseId);if(e)out[e.muscle]=(out[e.muscle]||0)+1;}
  }return out;
}
function localDate(time=Date.now()){
  const d=new Date(time);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
}
function streak(s){
  const days=new Set(s.sessions.filter(x=>x.records.some(r=>!r.warmup&&r.confirmed)).map(x=>localDate(x.endedAt||x.startedAt)));
  let d=new Date();d.setHours(12,0,0,0);if(!days.has(localDate(d)))d.setDate(d.getDate()-1);
  let count=0;while(days.has(localDate(d))){count++;d.setDate(d.getDate()-1);}return count;
}
function validate(s){
  const fail=msg=>{throw new Error('Invalid backup: '+msg);};
  if(!s||s.version!==1)fail('unsupported version');
  if(!Array.isArray(s.exercises)||s.exercises.length<1||s.exercises.length>1000)fail('exercise list');
  const ids=new Set();
  const finite=(n,lo,hi)=>typeof n==='number'&&Number.isFinite(n)&&n>=lo&&n<=hi;
  for(const e of s.exercises){
    if(typeof e.id!=='string'||!/^[a-zA-Z0-9_-]{1,80}$/.test(e.id)||['__proto__','constructor','prototype'].includes(e.id)||ids.has(e.id))fail('exercise IDs');ids.add(e.id);
    if(typeof e.name!=='string'||!e.name.trim()||e.name.length>200||typeof e.muscle!=='string'||!e.muscle.trim()||e.muscle.length>80||typeof e.note!=='string'||e.note.length>2000||!['chest','back','legs','abs','shoulders','forearms'].includes(e.block)||!Number.isFinite(e.order)||!['weighted','bodyweight','timed'].includes(e.type)||!Object.keys(GROUPS).includes(e.group)||!['barbell','dumbbell','cable','machine','bodyweight'].includes(e.equipment))fail('exercise fields');
    if(!Number.isInteger(e.sets)||!Number.isInteger(e.min)||!Number.isInteger(e.max)||!finite(e.sets,1,20)||!finite(e.min,1,3600)||!finite(e.max,e.min,3600)||!finite(e.increment,.01,100)||!finite(e.priority,1,3))fail('ranges');
    if(e.rest!==null&&!finite(e.rest,0,1800))fail('rest');
    if(e.equipmentTag!==undefined&&(typeof e.equipmentTag!=='string'||e.equipmentTag.length>120))fail('equipment tag');
    if(!Array.isArray(e.substitutes)||e.substitutes.some(x=>typeof x!=='string'))fail('substitutes');
  }
  for(const e of s.exercises)if(e.substitutes.some(id=>!ids.has(id)||id===e.id))fail('unknown substitute');
  if(!s.settings||!s.targets||Array.isArray(s.targets)||!s.pairOverrides||Array.isArray(s.pairOverrides)||!s.suggestions||Array.isArray(s.suggestions)||!Array.isArray(s.sessions)||s.sessions.length>10000||!Array.isArray(s.bodyweights))fail('missing data');
  for(const id of ids){const t=s.targets[id];if(!t||(t.weight!==null&&!finite(t.weight,0,1000))||!Number.isInteger(t.reps)||!finite(t.reps,1,3600))fail('targets');}
  for(const [k,v] of Object.entries(s.pairOverrides)){const pair=k.split('|');if(pair.length!==2||pair.some(id=>!ids.has(id))||typeof v!=='boolean')fail('pairing override');}
  for(const [id,q] of Object.entries(s.suggestions))if(!ids.has(id)||!q||q.exerciseId!==id||!['hold','raise','reps','time','deload','variation'].includes(q.kind)||!finite(q.weight,0,1000)||!finite(q.reps,1,3600)||typeof q.reason!=='string'||typeof q.accepted!=='boolean')fail('progression suggestion');
  const cfg=s.settings;
  for(const f of ['keepAwake','sound','vibrate','warmups','triples','effort'])if(typeof cfg[f]!=='boolean')fail('training preferences');
  for(const field of ['dumbbells','cables','machines','addedLoads'])if(!Array.isArray(cfg[field])||!cfg[field].length||cfg[field].length>1000||cfg[field].some(x=>!finite(x,0,1000)))fail('equipment weights');
  if(!Array.isArray(cfg.plates)||cfg.plates.length>20||cfg.plates.some(p=>!finite(p.weight,.1,100)||!Number.isInteger(p.pairs)||p.pairs<0||p.pairs>12)||!finite(cfg.barWeight,0,100))fail('plates');
  for(const f of ['rest','transition','warmupRest'])if(!finite(cfg[f],0,1800))fail('timer settings');
  if(!finite(cfg.safeJump,0,100)||!finite(cfg.stallSessions,2,20)||!Array.isArray(cfg.selectedBlocks)||cfg.selectedBlocks.some(id=>!['chest','back','legs','abs','shoulders','forearms'].includes(id))||(cfg.budget!==null&&!finite(cfg.budget,5,240))||!cfg.reminders||!Array.isArray(cfg.reminders.days)||cfg.reminders.days.some(d=>!Number.isInteger(d)||d<0||d>6)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(cfg.reminders.time))fail('settings');
  for(const b of s.bodyweights)if(!finite(b.weight,1,500)||!/^\d{4}-\d{2}-\d{2}$/.test(b.date)||!Number.isFinite(new Date(b.date+'T12:00:00').getTime()))fail('bodyweight log');
  for(const sess of [...s.sessions,...(s.session?[s.session]:[])]){
    if(!sess||typeof sess.id!=='string'||!/^[a-zA-Z0-9_-]{1,100}$/.test(sess.id)||!Array.isArray(sess.blocks)||sess.blocks.some(id=>!['chest','back','legs','abs','shoulders','forearms'].includes(id))||!finite(sess.startedAt,0,1e14)||!Array.isArray(sess.entries)||!Array.isArray(sess.records)||!Array.isArray(sess.queue))fail('session');
    for(const en of sess.entries)if(!ids.has(en.exerciseId)||!ids.has(en.sourceId)||!Number.isInteger(en.sets)||!finite(en.sets,1,20)||typeof en.id!=='string'||!/^[a-zA-Z0-9_-]{1,100}$/.test(en.id)||typeof en.skipped!=='boolean'||!finite(en.targetWeight,0,1000)||!finite(en.targetReps,1,3600))fail('session exercise');
    for(const r of [...sess.records,...sess.queue])if(!ids.has(r.exerciseId)||!finite(r.weight,0,1000)||!finite(r.reps,0,3600)||typeof r.entryId!=='string'||!/^[a-zA-Z0-9_-]{1,100}$/.test(r.entryId)||!sess.entries.some(en=>en.id===r.entryId))fail('set data');
    for(const r of sess.records)if(typeof r.confirmed!=='boolean'||typeof r.warmup!=='boolean'||(r.rir!==null&&(!Number.isInteger(r.rir)||r.rir<0||r.rir>3))||typeof r.note!=='string')fail('logged set');
    if(sess===s.session&&sess.records.some(r=>!r.task||typeof r.task.exerciseId!=='string'))fail('active set undo data');
    if(sess.pendingLogId!==null&&!sess.records.some(r=>r.id===sess.pendingLogId))fail('pending log');
    if(sess.timer&&(!finite(sess.timer.deadline,0,1e14)||!finite(sess.timer.total,0,86400)))fail('active timer');
  }
  return true;
}
const api={GROUPS,clone,uid,ex,key,canPair,loadable,roundWeight,target,rest,makeEntries,planEntries,plan,newSession,bodyweight,completeSet,undoSet,fullRecords,exerciseHistory,lastRecords,suggestion,finishSession,accept,substitute,skip,actualLoad,epley,stats,stalled,weeklyVolume,localDate,streak,validate};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.ForgeEngine=api;
})(typeof window!=='undefined'?window:globalThis);
