import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import sharp from 'sharp';

const candidates=JSON.parse(await fs.readFile('diseno/curaduria-oct23/candidatos.json','utf8'));
const scenes=[
 {id:'i08',name:'scene-sala',reason:'Ventanal de esquina completo y relación directa entre sala y jardín. El recorte móvil conserva ambas caras del vidrio.',mobile:{left:360,top:0,width:720,height:900}},
 {id:'i07',name:'scene-comedor',reason:'Carpintería oscura, umbral y apertura a terraza visibles. Otra estancia, sin sugerir que pertenece a la misma vivienda.',mobile:{left:360,top:0,width:720,height:900}},
 {id:'i06',name:'scene-fachada',reason:'Vista exterior cercana al ventanal y al umbral. El producto tiene escala y la carpintería se ve abierta; sustituye la cabaña sin relación con el recorrido.',mobile:{left:360,top:0,width:720,height:900}}
];
const records=[];
for(const scene of scenes){
 const source=candidates.find(c=>c.id===scene.id),bytes=await fs.readFile(`diseno/curaduria-oct23/originales/${scene.id}`);
 const thumbnail=`public/images/${scene.name}-thumb.webp`;
 await sharp(bytes).resize({width:192,height:126,fit:'cover'}).webp({quality:82}).toFile(thumbnail);
 await fs.writeFile(thumbnail+'.json',JSON.stringify({sourceUrl:source.url,sourcePage:source.sourcePage,usage:'Miniatura de ambiente, no obra Starwin.',transform:'Recorte rectangular y reducción a 192 × 126 px.'},null,2));
 for(const mobile of [false,true])for(const width of mobile?[480,720]:[480,960,1200]){
  const path=`public/images/${scene.name}${mobile?'-mobile':''}-${width}.webp`;
  let pipeline=sharp(bytes);if(mobile)pipeline=pipeline.extract(scene.mobile);
  await pipeline.resize({width,withoutEnlargement:true}).webp({quality:87}).toFile(path);
  const record={file:path,sourceUrl:source.url,sourcePage:source.sourcePage,company:source.company,usage:'Ambiente, no obra Starwin; no implica modelo o sistema propio.',reason:scene.reason,transform:mobile?{crop:scene.mobile,width}:{width},sha256:crypto.createHash('sha256').update(await fs.readFile(path)).digest('hex')};
  records.push(record);await fs.writeFile(path+'.json',JSON.stringify(record,null,2));
 }
}
await fs.writeFile('procedencia/imagenes/escenas-oct25.json',JSON.stringify(records,null,2));
const openings=[
 {name:'opening-casement',file:'001-d09cc971-abat.jpg',reason:'Acercamiento nítido al giro lateral y al herraje; reemplaza la foto oscura con un depósito de agua al fondo.'},
 {name:'opening-tilt',file:'119-9f61fb46-oscilobatiente.png',reason:'La inclinación superior se ve completa en una imagen de producto, sin fondo de obra.'},
 {name:'opening-fixed',file:'104-38f513b3-fijo.png',reason:'Paño fijo completo y fondo de estudio coherente con la oscilobatiente.'}
];
const productRecords=[];
for(const opening of openings){
 const source=`../material-starwin/imagenes/originales/${opening.file}`,bytes=await fs.readFile(source);
 for(const nominal of [480,960,1600]){
  const path=`public/images/${opening.name}-${nominal}.webp`,width=Math.min(nominal,1000);
  await sharp(bytes).resize({width,withoutEnlargement:true}).webp({quality:88}).toFile(path);
  const record={file:path,source,reason:opening.reason,usage:'Ilustra el tipo de apertura; no acredita una obra o un sistema concreto de Starwin.',transform:'Reducción proporcional, sin alterar acabado o geometría.',sha256:crypto.createHash('sha256').update(await fs.readFile(path)).digest('hex')};
  productRecords.push(record);await fs.writeFile(path+'.json',JSON.stringify(record,null,2));
 }
}
await fs.writeFile('procedencia/imagenes/aperturas-oct25.json',JSON.stringify(productRecords,null,2));
for(const name of ['sliding','opening-casement','opening-tilt','awning','opening-fixed']){
 const source=`public/images/${name}-480.webp`,target=`public/images/${name}-thumb.webp`;
 await sharp(source).resize({width:224,height:164,fit:'contain',background:'#edf0f1'}).webp({quality:85}).toFile(target);
 await fs.writeFile(target+'.json',JSON.stringify({source,usage:'Miniatura de apertura.',transform:'Contener y reducir; no alterar geometría.'},null,2));
}
console.log('24 imágenes responsivas y 8 miniaturas preparadas con procedencia.');
