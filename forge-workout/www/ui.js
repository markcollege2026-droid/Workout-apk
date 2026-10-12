(function(root){
'use strict';
const E=root.ForgeEngine,Store=root.ForgeStore,Seed=root.ForgeSeed;
const paths={
  home:'M3 10.5 12 3l9 7.5M5 9v11h5v-6h4v6h5V9',
  workout:'M3 9v6m3-9v12m12-12v12m3-9v6M6 12h12',
  chart:'M4 4v16h16M8 15l4-4 4 2 4-6',
  history:'M8 3v4m8-4v4M4 9h16M6 5h12a2 2 0 0 1 2 2v13H4V7a2 2 0 0 1 2-2M8 13h2m4 0h2m-8 4h2',
  library:'M4 4h6v16H4zM10 4h5v16h-5M17 5l3-1 3 15-3 1z',
  settings:'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8M9 3h6l.5 3 2 1 3-.8 2.5 5-2.5 2v2l2.5 2-2.5 5-3-.8-2 1-.5 3H9l-.5-3-2-1-3 .8-2.5-5L3.5 13v-2L1 9l2.5-5 3 .8 2-1z',
  arrow:'M5 12h14m-6-6 6 6-6 6',chevron:'m9 5 7 7-7 7',left:'m15 5-7 7 7 7',
  check:'m5 12 4 4 10-10',close:'m6 6 12 12M18 6 6 18',plus:'M12 5v14M5 12h14',minus:'M5 12h14',
  clock:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18M12 7v5l3 2',timer:'M9 2h6M12 5a8 8 0 1 0 0 16 8 8 0 0 0 0-16M12 9v4l3 2m3-9 2-2',
  shield:'m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6z m-4 9 3 3 5-6',
  bolt:'m13 2-8 12h6l-1 8 9-13h-6z',fire:'M13 3s0 5-3 7c-2-2-3-3-3-3s-5 6-3 11c2 5 11 5 15 0 4-6-3-12-6-15zM10 15c-2 3-1 5 2 5s4-3 2-5l-1 2z',
  layers:'m12 3 9 5-9 5-9-5zM3 12l9 5 9-5M3 16l9 5 9-5',
  scale:'M4 8a8 8 0 0 1 16 0v12H4zM8 8h8m-4 0 2-3',
  edit:'m16 3 5 5-12 12H4v-5zM13 6l5 5',undo:'M8 4 3 9l5 5M3 9h10a7 7 0 0 1 0 14',
  swap:'M4 7h16m-4-4 4 4-4 4M20 17H4m4-4-4 4 4 4',skip:'m5 5 11 7-11 7zM19 5v14',
  bell:'M18 8a6 6 0 0 0-12 0v7l-2 3h16l-2-3zM10 21h4',
  download:'M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5',upload:'M12 16V4m-5 5 5-5 5 5M4 16v5h16v-5',
  search:'M10.5 3a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15m5.5 13 5 5',
  info:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18M12 11v6m0-10h.01',
  trophy:'M7 3h10v7a5 5 0 0 1-10 0zM7 5H3v3a4 4 0 0 0 4 4m10-7h4v3a4 4 0 0 1-4 4M12 15v6m-4 0h8',
  note:'M5 3h14v18H5zM8 7h8m-8 4h8m-8 4h5',eye:'M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7m10-3a3 3 0 1 0 0 6 3 3 0 0 0 0-6',
  trash:'M4 6h16M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7m4-7v7',
  bench:'M4 4v7m3-9v11m10-11v11m3-9v7M7 7h10M4 17h13m-10 0v4m9-4v4',
  pull:'M3 3h18M5 3v18m14-18v18M8 8l4 3 4-3m-4 3v6m-4 4 4-4 4 4',
  legs:'M10 3h4l1 8-3 3-3-3zM9 11l-3 8H3m12-8 3 8h3M12 14v7',
  abs:'M8 3h8l3 5-2 13H7L5 8zM12 6v13M9 9h6m-6 4h6m-6 4h6',
  shoulders:'M5 19v-8l-2-3 4-4h3m4 0h3l4 4-2 3v8M8 4l4 5 4-5M8 12h8m-4-3v10',
  grip:'M5 13V8a2 2 0 0 1 4 0v6-9a2 2 0 0 1 4 0v9-7a2 2 0 0 1 4 0v7-4a2 2 0 0 1 4 0v7c0 4-4 6-8 6-5 0-7-2-9-5l-2-4a2 2 0 0 1 3-2l3 3'
};
const A={E,Store,Seed,pages:{},ui:{route:Store.state.session?'session':'today',planned:null,libraryBlock:'all',search:'',showSubs:false,showArchived:false,progressExercise:'bench-press',chartMode:'weight',previewBlock:'all',calendar:new Date(),historyDate:null,modal:null,lastCommitted:null},s:()=>Store.state};
A.escape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
A.icon=(name,cls='')=>`<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[name]||paths.workout}"/></svg>`;
A.kg=v=>v===null||v===undefined?'—':Number(v).toLocaleString(undefined,{maximumFractionDigits:2});
A.time=v=>{const sec=Math.max(0,Math.ceil(v));return `${Math.floor(sec/60)}:${String(sec%60).padStart(2,'0')}`;};
A.minutes=v=>Math.max(1,Math.round(v/60));
A.actualMinutes=v=>v<60?'<1':Math.round(v/60);
A.savedMinutes=v=>Math.max(0,Math.round(v/60));
A.date=(v,opts={month:'short',day:'numeric'})=>new Date(v).toLocaleDateString('en-GB',opts);
A.fullDate=v=>A.date(v,{weekday:'long',day:'numeric',month:'long',year:'numeric'});
A.block=id=>Seed.blocks.find(b=>b.id===id);
A.load=(e,w,r)=>`${e.equipment==='bodyweight'?(w?'+'+A.kg(w)+' kg':'Bodyweight'):A.kg(w)+' kg'} × ${r}${e.type==='timed'?' sec':' reps'}`;
A.metric=(icon,value,label,suffix='')=>`<div class="metric"><div class="between"><span class="metric-label">${label}</span><span class="metric-icon">${A.icon(icon,'sm')}</span></div><div class="metric-value">${value}<span>${suffix}</span></div></div>`;
A.empty=(icon,title,copy,action='')=>`<div class="card empty-state"><div class="empty-icon">${A.icon(icon,'lg')}</div><h3>${title}</h3><p>${copy}</p>${action}</div>`;
A.switch=(key,label,desc='')=>`<div class="setting-row"><div><strong>${label}</strong><small>${desc}</small></div><button class="switch ${A.s().settings[key]?'on':''}" role="switch" aria-checked="${A.s().settings[key]}" aria-label="${label}" data-action="setting-toggle" data-key="${key}"></button></div>`;
A.chart=(points,field,color='#ff795b',bars=false)=>{
  if(!points.length)return '<div class="chart-blank">Your first session draws the first line.</div>';
  const p=points.slice(-12),w=500,h=166,x0=43,y0=12,ww=440,hh=120;
  const max=Math.max(...p.map(x=>x[field]),1)*1.12;
  const X=i=>x0+(p.length===1?ww/2:i*ww/(p.length-1));const Y=v=>y0+hh*(1-v/max);
  let out=`<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${field} over your last ${p.length} sessions">`;
  for(let i=0;i<4;i++){const v=max*i/3,y=Y(v);out+=`<line x1="${x0}" x2="${x0+ww}" y1="${y}" y2="${y}" stroke="#ffffff08"/><text x="${x0-9}" y="${y+3}" text-anchor="end">${Math.round(v)}</text>`;}
  if(bars){
    p.forEach((v,i)=>{const bw=Math.min(26,ww/p.length*.5);out+=`<rect x="${X(i)-bw/2}" y="${Y(v[field])}" width="${bw}" height="${Math.max(2,y0+hh-Y(v[field]))}" rx="4" fill="${color}" opacity=".7"><title>${A.date(v.date)}: ${A.kg(v[field])}</title></rect>`;});
  }else{
    const pts=p.map((v,i)=>`${X(i)},${Y(v[field])}`).join(' ');
    out+=`<defs><linearGradient id="area-${field}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${color}" stop-opacity=".2"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient></defs><polygon points="${X(0)},${y0+hh} ${pts} ${X(p.length-1)},${y0+hh}" fill="url(#area-${field})"/><polyline points="${pts}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`;
    p.forEach((v,i)=>out+=`<circle cx="${X(i)}" cy="${Y(v[field])}" r="3.5" fill="#191a1f" stroke="${color}" stroke-width="2"><title>${A.date(v.date)}: ${A.kg(v[field])}</title></circle>`);
  }
  const labels=[...new Set([0,Math.floor((p.length-1)/2),p.length-1])];labels.forEach(i=>out+=`<text x="${X(i)}" y="157" text-anchor="middle">${A.date(p[i].date)}</text>`);
  return '<div class="chart">'+out+'</svg></div>';
};
let toastTimeout;
A.toast=(text,ms=3500)=>{const t=document.getElementById('toast');t.textContent=text;t.classList.add('show');clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>t.classList.remove('show'),ms);};
A.save=()=>{
  try{Store.save();if(Store.native)root.Native.keepScreenAwake(!!A.s().session&&A.s().settings.keepAwake);A.screenAwake?.();}
  catch(e){A.toast('Could not save: '+e.message+'. Export a backup now.',9000);console.error(e);}
};
A.dialog=(type,title,body,footer='',data={},wide=false)=>{
  A.lastFocus=document.activeElement;A.ui.modal={type,data};
  document.getElementById('modal-root').innerHTML=`<div class="modal-shade"><section class="modal ${wide?'wide':''}" role="dialog" aria-modal="true" aria-labelledby="modal-title"><header class="modal-header"><h2 id="modal-title">${title}</h2><button class="icon-btn" data-action="close-modal" aria-label="Close dialog">${A.icon('close')}</button></header><div class="modal-body">${body}</div>${footer?`<footer class="modal-footer">${footer}</footer>`:''}</section></div>`;
  document.body.style.overflow='hidden';document.querySelector('.modal-header button')?.focus();
};
A.close=()=>{document.getElementById('modal-root').innerHTML='';A.ui.modal=null;document.body.style.overflow='';A.lastFocus?.focus?.();};
const navs=[['today','home','Overview'],['session','workout','Workout'],['progress','chart','Progress'],['history','history','History'],['library','library','Exercises'],['settings','settings','Settings']];
A.render=()=>{
  const s=A.s();const route=A.ui.route;
  const nav=navs.map(([id,ico,label])=>`<button class="nav-item ${route===id?'active':''}" data-action="nav" data-route="${id}">${A.icon(ico)}<span>${label}</span>${id==='session'&&s.session?'<span class="nav-dot"></span>':''}</button>`).join('');
  const bottom=navs.map(([id,ico,label])=>`<button class="${route===id?'active':''}" data-action="nav" data-route="${id}" aria-label="${label}">${A.icon(ico)}<span>${id==='today'?'Today':id==='session'?'Train':id==='library'?'Library':label}</span>${id==='session'&&s.session?'<i class="nav-dot"></i>':''}</button>`).join('');
  const page=A.pages[route]?A.pages[route]():'';
  document.getElementById('app').innerHTML=`<div class="shell"><aside class="sidebar"><div class="brand"><img src="assets/icon.svg" alt=""><span class="wordmark">FORGE</span><span class="version">01</span></div><div class="nav-caption">YOUR TRAINING</div><nav aria-label="Main navigation">${nav}</nav><div class="sidebar-bottom"><div class="privacy-card">${A.icon('shield')}<h4>Your progress. Yours only.</h4><p>No accounts. No cloud. Just you,<br>getting a little stronger.</p></div><div class="profile"><div class="avatar">YOU</div><div class="grow"><strong>Personal workspace</strong><small>All weights in kilograms</small></div>${A.icon('settings','sm')}</div></div></aside><main class="workspace"><header class="topbar"><div class="breadcrumbs"><span class="mobile-brand hidden"><img src="assets/icon.svg" alt="">FORGE</span><span class="crumb-part">Your training</span><span class="crumb-part soft">/</span><b class="crumb-part">${navs.find(x=>x[0]===route)?.[2]}</b></div><div class="top-actions"><span class="local-status"><i class="dot"></i>On this device</span>${!Store.native?'<button class="preview-pill" data-action="preview-info">BROWSER PREVIEW</button>':''}<span class="date-label">${A.date(Date.now(),{day:'numeric',month:'short',year:'numeric'})}</span></div></header><div class="content">${page}<div class="footer-note">${A.icon('shield','sm')} Fully offline. No accounts, ads, or analytics.</div></div></main><nav class="bottom-nav" aria-label="Main navigation">${bottom}</nav>${s.session&&route!=='session'?`<button class="floating-timer" data-action="nav" data-route="session">${A.icon(s.session.timer?'timer':'workout')}<span>Workout in progress</span><b id="floating-timer-text">${s.session.timer?A.time((s.session.timer.deadline-Date.now())/1000):'Resume'}</b></button>`:''}</div>`;
};
A.navigate=route=>{A.ui.route=route;A.render();window.scrollTo({top:0,behavior:'instant'});};
root.ForgeApp=A;
})(window);
