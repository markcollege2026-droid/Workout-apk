/* Source files remain readable; the checked-in bundle needs no npm to build an APK. */
const fs=require('node:fs'),path=require('node:path'),esbuild=require('esbuild');
const root=path.resolve(__dirname,'..');
const files=['polyfills','seed','engine','storage','ui','views','modals','app'];
const code=files.map(name=>fs.readFileSync(path.join(root,'www',name+'.js'),'utf8')).join('\n\n');
esbuild.transform(code,{target:['chrome58'],minify:false,legalComments:'inline',charset:'utf8'}).then(result=>{
  fs.writeFileSync(path.join(root,'www','forge.js'),'/* Generated from the readable source files. Run npm run bundle after edits. */\n'+result.code);
  console.log('Bundled offline UI for Chromium 58+');
}).catch(error=>{console.error(error);process.exit(1);});
