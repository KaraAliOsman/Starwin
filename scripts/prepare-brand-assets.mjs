import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
const original=path.resolve('../material-starwin/imagenes/originales');
const files={
 'starwin-home':'030-38fefcc2-hero1.webp',
 'starwin-use':'120-bdd139ee-portada.jpg',
 'starwin-finish':'092-dc2fbdd3-color.jpg',
 'starwin-profiles':'114-2258c693-muestra.jpg',
};
const manifest=[];
for(const [name,file] of Object.entries(files)){
 const bytes=await fs.readFile(path.join(original,file)),meta=await sharp(bytes).metadata();
 for(const width of [480,960,1600])await sharp(bytes).rotate().resize({width,withoutEnlargement:true}).webp({quality:84}).toFile(`public/images/${name}-${width}.webp`);
 manifest.push({name,source:`outputs/material-starwin/imagenes/originales/${file}`,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),width:meta.width,height:meta.height,attribution:'Archivo visual Starwin. Imagen de referencia; no acredita obra propia.'});
}
// Dedicated mobile crop keeps the sash and handle visible without upscaling a landscape thumbnail.
for(const width of [480,960])await sharp(path.join(original,files['starwin-home'])).extract({left:650,top:0,width:1065,height:860}).resize({width}).webp({quality:86}).toFile(`public/images/starwin-home-mobile-${width}.webp`);
manifest[0].mobileCrop={left:650,top:0,width:1065,height:860,variants:[480,960]};
await fs.writeFile('procedencia/imagenes/seleccion-marca.json',JSON.stringify(manifest,null,2));
console.log('Cuatro originales del archivo Starwin optimizados.');
