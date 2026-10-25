(function(root){
'use strict';
const native=typeof root.Native!=='undefined';
const store={native,error:null,state:null};
try{
  const raw=native?root.Native.loadState():localStorage.getItem('forge.workout.v1');
  if(raw){const parsed=JSON.parse(raw);root.ForgeEngine.validate(parsed);store.state=parsed;}
}catch(e){store.error=e.message;}
if(!store.state)store.state=root.ForgeSeed.createState();
store.save=function(){
  store.state.updatedAt=Date.now();
  const raw=JSON.stringify(store.state);
  if(native){const result=root.Native.saveState(raw);if(result!=='ok')throw new Error(result||'SQLite save failed');}
  else localStorage.setItem('forge.workout.v1',raw);
};
store.permissions=function(){
  if(!native)return {notifications:false,exact:false,native:false};
  try{return JSON.parse(root.Native.permissions());}catch(e){return {native:true,notifications:false,exact:false};}
};
root.ForgeStore=store;
})(window);
