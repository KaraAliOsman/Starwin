import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
const base=path.resolve('../..'),supplier='outputs/baufens-reverse-engineering/recursos/imagenes/',starwin='outputs/material-starwin/imagenes/originales/';
const assets={'product-scene':supplier+'5e1db1c93989__modern-home-windows-window.jpeg','architecture':supplier+'e8a734d21538__windows-as-part-of-your-interior.jpg','living':supplier+'9e5226aa5734__Further-understanding-of-sliding-windows-and-doors.jpg','profile-supremo':supplier+'368e84b1da46__Supremo-PVC-profile-PRemium.png','sliding':starwin+'012-9d09a31d-COREDIZA PRO.webp','casement':starwin+'082-f7362456-abatible.jpg','tilt':starwin+'053-40cbcb66-oscilo.jpg','awning':starwin+'005-110b45c2-apertura exterior.webp','fixed':starwin+'103-f395d7c4-fijo firs.jpeg','hardware':starwin+'117-760f977a-oscilo sistm.jpeg'};
const aliases={hero:'product-scene',room:'living',light:'living',green:'architecture',profiles:'profile-supremo',detail:'hardware',glass:'hardware',care:'hardware',rain:'awning',inspection:'awning',measure:'awning',workshop:'fixed'};
const manifest=[];
for(const [name,relative] of Object.entries(assets)){const input=path.join(base,relative),bytes=await fs.readFile(input),meta=await sharp(bytes).metadata();for(const size of [480,960,1600])await sharp(bytes).rotate().resize({width:size,withoutEnlargement:true}).webp({quality:84}).toFile(`public/images/${name}-${size}.webp`);manifest.push({name,source:relative,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),width:meta.width,height:meta.height,sourceGroup:relative.includes('baufens')?'BauFens':'archivo Starwin'});}
for(const [alias,name] of Object.entries(aliases))for(const size of [480,960,1600])await fs.copyFile(`public/images/${name}-${size}.webp`,`public/images/${alias}-${size}.webp`);
await sharp(path.join(base,assets['product-scene'])).resize(1200,630,{fit:'cover'}).jpeg({quality:88}).toFile('public/images/og-starwin.jpg');
await fs.mkdir('procedencia/imagenes',{recursive:true});await fs.writeFile('procedencia/imagenes/seleccion-v2.json',JSON.stringify(manifest,null,2));console.log(`${manifest.length} originales optimizados.`);
