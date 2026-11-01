(function(root){
'use strict';
const native=typeof root.Native!=='undefined';
const store={native,error:null,state:null};
const CURRENT='forge.workout.v1',PREVIOUS='forge.workout.v1.previous';
try{
  const raw=native?root.Native.loadState():localStorage.getItem(CURRENT);
  if(raw){const parsed=JSON.parse(raw);root.ForgeEngine.validate(parsed);store.state=parsed;}
}catch(e){store.error=e.message;}
if(!store.state)store.state=root.ForgeSeed.createState();
// The browser preview keeps the same "previous workspace" recovery copy the APK keeps in
// SQLite row 2, so both storage backends expose the identical recovery contract.
const keepPrevious=raw=>{
  if(raw===null||raw===undefined||raw==='')return;
  try{localStorage.setItem(PREVIOUS,raw);localStorage.setItem(PREVIOUS+'.modified',String(Date.now()));}catch(e){}
};
store.save=function(){
  store.state.updatedAt=Date.now();
  const raw=JSON.stringify(store.state);
  if(native){const result=root.Native.saveState(raw);if(result!=='ok')throw new Error(result||'SQLite save failed');}
  else{keepPrevious(localStorage.getItem(CURRENT));localStorage.setItem(CURRENT,raw);}
};
store.previous=function(){
  if(native){
    try{
      const info=JSON.parse(root.Native.previousState()||'{}');
      return {available:!!info.available,modified:Number(info.modified)||null,text:typeof info.state==='string'?info.state:'',error:info.error||null};
    }catch(e){return {available:false,modified:null,text:'',error:e.message};}
  }
  try{
    const raw=localStorage.getItem(PREVIOUS);
    const modified=Number(localStorage.getItem(PREVIOUS+'.modified'))||null;
    return raw?{available:true,modified,text:raw,error:null}:{available:false,modified:null,text:'',error:null};
  }catch(e){return {available:false,modified:null,text:'',error:e.message};}
};
// The current workspace becomes the new recovery copy before the previous one is restored.
store.restorePrevious=function(text){
  if(native){const result=root.Native.restorePrevious(text);if(result!=='ok')throw new Error(result||'The recovery copy could not be restored.');return true;}
  const current=localStorage.getItem(CURRENT);
  keepPrevious(current);
  localStorage.setItem(CURRENT,text);
  return true;
};
store.permissions=function(){
  if(!native)return {notifications:false,exact:false,native:false};
  try{return JSON.parse(root.Native.permissions());}catch(e){return {native:true,notifications:false,exact:false};}
};
root.ForgeStore=store;
})(window);
