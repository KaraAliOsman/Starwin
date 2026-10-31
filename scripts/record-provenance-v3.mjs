import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
const sources=new Map();
const manifests=['seleccion-v2','seleccion-marca'];
for(const name of manifests){for(const item of JSON.parse(await fs.readFile(`procedencia/imagenes/${name}.json`,'utf8')))sources.set(item.name,item.source);}
const aliases={hero:'product-scene',room:'living',light:'living',green:'architecture',profiles:'profile-supremo',detail:'hardware',glass:'hardware',care:'hardware',rain:'awning',inspection:'awning',measure:'awning',workshop:'fixed'};
for(const [a,b]of Object.entries(aliases))sources.set(a,sources.get(b));
for(const item of JSON.parse(await fs.readFile('procedencia/imagenes/estudio-producto.json','utf8')))sources.set('studio-'+item.name,item.source);
sources.set('starwin-home-mobile',sources.get('starwin-home'));
sources.set('finish-detail',sources.get('starwin-finish'));sources.set('finish-samples',sources.get('starwin-profiles'));
sources.set('supplier-profile','outputs/baufens-reverse-engineering/recursos/imagenes/571adbe2155c__7000-series-3d-model-White.png');
const originals=await fs.readdir('../material-starwin/imagenes/originales');
for(const [name,id]of Object.entries({'color-white':8,'color-anthracite':29,'color-black':49,'color-walnut':50,'color-oak':60}))sources.set(name,'outputs/material-starwin/imagenes/originales/'+originals.find(f=>f.startsWith(String(id).padStart(3,'0')+'-')));
sources.set('og-starwin',sources.get('product-scene'));
const runtime=path.resolve('diseno/runtime');
async function findExe(dir){for(const item of await fs.readdir(dir,{withFileTypes:true})){const target=path.join(dir,item.name);if(item.name==='impeccable.exe')return target;if(item.isDirectory()){const found=await findExe(target);if(found)return found;}}}
const executable=await findExe(runtime),manifest=[];
for(const file of await fs.readdir('public/images')){
 if(!/\.(webp|png|jpg|jpeg)$/.test(file))continue;
 const name=file.replace(/-(480|900|960|1600)\.webp$|\.(webp|png|jpg|jpeg)$/,'');
 const source=sources.get(name);if(!source)throw Error('Missing provenance '+file);
 const prompt=`Origen de imagen preexistente: ${source}. Archivo recuperado de Starwin o su proveedor BauFens; no es imagen generada para esta web ni acredita una instalación Starwin. Derivado para web; fuentes y transformaciones en procedencia/imagenes y scripts/prepare-assets*.mjs.`;
 execFileSync(executable,['embed-prompt','public/images/'+file,'--prompt',prompt],{stdio:'pipe'});
 manifest.push({file,source,sha256:crypto.createHash('sha256').update(await fs.readFile('public/images/'+file)).digest('hex')});
}
await fs.writeFile('procedencia/imagenes/v3-origines.json',JSON.stringify(manifest,null,2));
console.log(`Origen incorporado a ${manifest.length} imágenes (o sidecar nativo WebP).`);
const entries=[['frontend-design','anthropics/skills','dbd4588f9e1033efb41dad4bef2f7947c8993d44'],['canvas-design','anthropics/skills','dbd4588f9e1033efb41dad4bef2f7947c8993d44'],['webapp-testing','anthropics/skills','dbd4588f9e1033efb41dad4bef2f7947c8993d44'],['web-design-guidelines','vercel-labs/agent-skills','063bee94c3f4df8453406c830b0a7df0f2860278'],['react-best-practices','vercel-labs/agent-skills','063bee94c3f4df8453406c830b0a7df0f2860278'],['composition-patterns','vercel-labs/agent-skills','063bee94c3f4df8453406c830b0a7df0f2860278'],['writing-guidelines','vercel-labs/agent-skills','063bee94c3f4df8453406c830b0a7df0f2860278'],['impeccable','pbakaus/impeccable','5cb95eea9c96479f57afe0732a45470d30183326']];
const skills=[];
for(const [name,repository,commit]of entries){const location=`C:/Users/alios/.codex/skills/${name}/SKILL.md`;skills.push({name,repository,commit,path:location,sha256:crypto.createHash('sha256').update(await fs.readFile(location)).digest('hex'),status:'installed-this-turn'});}
for(const name of ['emil-design-eng','apple-design','mobile-native']){const location=`C:/Users/alios/.agents/skills/${name}/SKILL.md`;skills.push({name,repository:'emilkowalski/skills',path:location,sha256:crypto.createHash('sha256').update(await fs.readFile(location)).digest('hex'),status:'already-installed'});}
await fs.writeFile('diseno/SKILLS-INSTALADAS.json',JSON.stringify({date:new Date().toISOString(),note:'Installed skills load into the session catalog on the next turn. Files were read directly for this implementation. Not every installed skill is needed for the website.',skills},null,2));
