import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import sharp from 'sharp';

const originalRoot='diseno/curaduria-oct23/originales';
const candidates=JSON.parse(await fs.readFile('diseno/curaduria-oct23/candidatos.json','utf8'));
const prior=JSON.parse(await fs.readFile('diseno/curaduria-oct23/seleccion-publicada.json','utf8'));
const selections=[
 {id:'i01',name:'architecture-dusk',crop:{left:0,top:30,width:1200,height:675},reason:'Fachada completa y ventanas iluminadas, con cielo real reservado para encabezado breve. Referencia Internorm; no es una obra Starwin.',credit:'Ambiente de referencia · Internorm'},
 {id:'i07',name:'interior-dining',reason:'Interior diurno con carpintería instalada a gran escala. Foto secundaria sin texto superpuesto.',credit:'Ambiente de referencia · Internorm'}
];
const items=[];
for(const selected of selections){
 const bytes=await fs.readFile(`${originalRoot}/${selected.id}`),meta=await sharp(bytes).metadata(),origin=candidates.find(c=>c.id===selected.id);
 for(const nominal of [480,960,1600]){
  let pipeline=sharp(bytes).rotate();if(selected.crop)pipeline=pipeline.extract(selected.crop);
  const file=`${selected.name}-${nominal}.webp`,out=`public/images/${file}`;
  await pipeline.resize({width:nominal,withoutEnlargement:true}).webp({quality:88,effort:6}).toFile(out);
  const output=await sharp(out).metadata();
  items.push({file,source:`${originalRoot}/${selected.id}`,sourceUrl:origin.url,sourcePage:origin.sourcePage,company:origin.company,credit:selected.credit,sourceWidth:meta.width,sourceHeight:meta.height,crop:selected.crop??null,width:output.width,height:output.height,sourceSha256:crypto.createHash('sha256').update(bytes).digest('hex'),sha256:crypto.createHash('sha256').update(await fs.readFile(out)).digest('hex'),transformation:'Orientación EXIF, recorte rectangular cuando se indica y reducción proporcional sin ampliar. WebP88. Sin deformación ni alteración de color.',reason:selected.reason});
 }
}
for(const nominal of [480,960,1600]){
 const file=`interior-garden-${nominal}.webp`,out=`public/images/${file}`,record=prior.find(p=>p.file===file),meta=await sharp(out).metadata();
 if(!record)throw new Error(`Missing recorded provenance for ${file}`);
 items.push({...record,width:meta.width,height:meta.height,sha256:crypto.createHash('sha256').update(await fs.readFile(out)).digest('hex'),credit:'Ambiente de referencia · Deceuninck',transformation:record.transformation+' Archivo existente conservado. Para hero4:5 usar object-position50% 0%; no tapar el producto con texto.',reason:'Retrato móvil nativo de1920×2880, ventana blanca completa. Referencia Deceuninck; no identifica una obra, modelo ni prestación de Starwin.'});
}
await fs.writeFile('diseno/reconstruccion-oct23/activos-publicados.json',JSON.stringify({at:new Date().toISOString(),items},null,2));
await fs.writeFile('procedencia/imagenes/arquitectura-oct23.json',JSON.stringify(items,null,2));
console.log(JSON.stringify(items.map(({file,width,height,company})=>({file,width,height,company})),null,2));
