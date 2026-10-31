import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import {createRequire} from 'node:module';
const native=createRequire(import.meta.url),cache=new Map();
export function loadTS(filename){
 const file=path.resolve(filename);if(cache.has(file))return cache.get(file);
 const exports={};cache.set(file,exports);
 const output=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
 const localRequire=name=>{if(!name.startsWith('.'))return native(name);const base=path.resolve(path.dirname(file),name),target=[base,base+'.ts',base+'.tsx',base+'.js'].find(p=>fs.existsSync(p)&&fs.statSync(p).isFile());if(!target)throw Error(`No se encuentra ${name}`);return loadTS(target);};
 new Function('exports','require','module',output)(exports,localRequire,{exports});return exports;
}
