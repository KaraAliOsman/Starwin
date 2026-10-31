import sharp from 'sharp';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
const original='procedencia/imagenes/patagonia/torres-del-paine-marek-piwnicki.jpg';
const bytes=await fs.readFile(original),metadata=await sharp(bytes).metadata();
const mobileCrop={left:1280,top:0,width:1200,height:1500};
if(metadata.width<2480||metadata.height<1500)throw Error('Unexpected source dimensions');
const files=[];
for(const width of [480,720])for(const format of ['avif','webp']){
 const file=`public/images/patagonia-chilena-mobile-${width}.${format}`;
 let pipeline=sharp(bytes).extract(mobileCrop).resize(width,Math.round(width*1.25));
 pipeline=format==='avif'?pipeline.avif({quality:48,effort:6}):pipeline.webp({quality:82,effort:6});
 await pipeline.toFile(file);files.push({file,bytes:(await fs.stat(file)).size});
}
for(const format of ['avif','webp']){
 const file=`public/images/patagonia-chilena-1920.${format}`;
 let pipeline=sharp(bytes).resize({width:1920,withoutEnlargement:true});
 pipeline=format==='avif'?pipeline.avif({quality:50,effort:6}):pipeline.webp({quality:83,effort:6});
 await pipeline.toFile(file);files.push({file,bytes:(await fs.stat(file)).size});
}
await fs.writeFile('procedencia/imagenes/patagonia/manifest.json',JSON.stringify({
 title:'Cuernos del Paine y lago Pehoé, Patagonia chilena',creator:'Marek Piwnicki',
 sourcePage:'https://unsplash.com/it/foto/una-catena-montuosa-con-un-lago-in-primo-piano-wgsu3WzFZ5c',
 sourceImage:'https://images.unsplash.com/photo-1712921675065-b248fa2c569f?auto=format&fit=max&w=2560&q=90',
 license:'Unsplash License',licenseUrl:'https://unsplash.com/license',
 attributionRequired:false,verification:'Indexed Unsplash photo result identifies author, Chile and free image. Unsplash License permits commercial use without mandatory attribution.',
 downloadedAt:new Date().toISOString(),original,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),
 dimensions:{width:metadata.width,height:metadata.height},mobileCrop,files,
 usage:'Hero landscape and scroll arrival. Landscape is an illustrative view of Chile, not a Starwin project.'
},null,2));
console.log(JSON.stringify(files));
