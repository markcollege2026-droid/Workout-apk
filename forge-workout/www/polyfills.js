/* The APK also supports older offline Android WebViews (Chromium 58+). */
(function(){
'use strict';
if(!Object.fromEntries)Object.fromEntries=function(entries){const out={};for(const pair of entries)Object.defineProperty(out,pair[0],{value:pair[1],enumerable:true,writable:true,configurable:true});return out;};
if(!String.prototype.replaceAll)Object.defineProperty(String.prototype,'replaceAll',{value:function(search,replacement){if(search instanceof RegExp)return this.replace(search,replacement);return this.split(String(search)).join(String(replacement));},writable:true,configurable:true});
})();
