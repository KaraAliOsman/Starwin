import fs from 'node:fs/promises';
import crypto from 'node:crypto';
const target='procedencia/imagenes/v3-origines.json';
const manifest=JSON.parse(await fs.readFile(target,'utf8')).filter(item=>!item.file.startsWith('material-glass-'));
for(const width of [480,960,1600]){
 const file=`material-glass-${width}.webp`;
 manifest.push({file,source:'outputs/baufens-reverse-engineering/recursos/imagenes/ca58ba74bc91__6000-series-outward-opening-glass-3-1200x960.png',sha256:crypto.createHash('sha256').update(await fs.readFile('public/images/'+file)).digest('hex')});
}
manifest.sort((a,b)=>a.file.localeCompare(b.file));
await fs.writeFile(target,JSON.stringify(manifest,null,2));
console.log({images:manifest.length,appended:3});
