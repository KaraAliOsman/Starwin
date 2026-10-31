import fs from 'node:fs/promises';import sharp from 'sharp';import crypto from 'node:crypto';
const root='../material-starwin/imagenes/originales';
const sources=[['white','090-c4dad9e8-blanco.png'],['anthracite','109-0e7bef83-grisantracita.png'],['oak','125-a9c35e6b-roble.png']];
const manifest=[];
for(const [name,file] of sources){const data=await fs.readFile(root+'/'+file);const cropped=await sharp(data).trim({background:'#00000000',threshold:8}).toBuffer();for(const w of [480,900])await sharp(cropped).resize({width:w,height:Math.round(w*1.25),fit:'contain',background:'#00000000'}).webp({quality:90,alphaQuality:100}).toFile(`public/images/studio-${name}-${w}.webp`);manifest.push({name,source:root+'/'+file,sha256:crypto.createHash('sha256').update(data).digest('hex'),processing:'Trim transparent margins, contain in fixed 4:5 canvas, resize, WebP. Original finish and geometry preserved.'});}
const detail='../baufens-reverse-engineering/recursos/imagenes/368e84b1da46__Supremo-PVC-profile-PRemium.png';
const bytes=await fs.readFile(detail);for(const w of [480,960])await sharp(bytes).trim({background:'#00000000',threshold:8}).resize({width:w}).webp({quality:88,alphaQuality:100}).toFile(`public/images/studio-profile-${w}.webp`);
manifest.push({name:'profile',source:detail,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),description:'BauFens Supremo reference profile, not a Pro70 specification.'});
await fs.writeFile('procedencia/imagenes/estudio-producto.json',JSON.stringify(manifest,null,2));
console.log('Studio assets prepared with original alpha and source hashes.');
