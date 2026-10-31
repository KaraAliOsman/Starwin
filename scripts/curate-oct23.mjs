import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';

const dir='diseno/curaduria-oct23';
const archive=path.resolve('../baufens-reverse-engineering/recursos/imagenes');
const profileFiles=['49a0b8c19a00__PVC-profile-Supremo.png','ad7846cc72c3__uPVC-profile-Supremo.png','f5fed3723c1b__Supremo-White-2.png','571adbe2155c__7000-series-3d-model-White.png','f925c9fa022a__supremo-sa-okruglim-postoljem.png'];
if(process.argv.includes('--profiles')){
 const items=[];
 for(const [i,file] of profileFiles.entries()){
  const tile=await sharp(path.join(archive,file)).resize(360,370,{fit:'contain',background:'#123e50'}).flatten({background:'#123e50'}).png().toBuffer();
  items.push({input:tile,left:i*370,top:30});
 }
 await sharp({create:{width:1850,height:400,channels:3,background:'#123e50'}}).composite(items).jpeg().toFile(`${dir}/perfiles.jpg`);
 console.log(profileFiles);
 process.exit();
}

const selections=[
 {name:'profile-supremo',company:'BauFens',sourcePage:'https://baufens.ba/en/',url:'https://baufens.ba/wp-content/uploads/2024/05/uPVC-profile-Supremo.png',local:path.join(archive,'ad7846cc72c3__uPVC-profile-Supremo.png'),reason:'Render del archivo previamente extraído de BauFens, identificado como SUPREMO. Corte más nítido, sin desenfoque superior; no representa Pro70. URL comprobada en contenido/productos.json de la extracción.'},
 {name:'interior-garden',company:'Deceuninck',sourcePage:'https://www.deceuninck.cz/reference-mesicni/reference-elegant',url:'https://www.deceuninck.cz/getattachment/Reference-mesicni/Funkiconalistsicka-vila-v-Brandyse-nad-Labem/Brandys-nad-Labem-%281%29/Poperinge_10-min.jpg?lang=cs-CZ&width=1920&height=2880&ext=.jpg',reason:'Escena vertical móvil. Ventana blanca completa entre cortinas y jardín; se conserva la geometría original y no se presenta como obra Starwin.'},
 {name:'material-corner',company:'Finstral',sourcePage:'https://www.finstral.com/en/windows/wide-range-of-windows/windows-and-doors-made-of-pvc/24-0.html',url:'https://cdn.finstral.com/images/content/1159837_53265_3_N_0_0_0_107791920/finstral-as-narrow-as-it-gets..jpg',reason:'Encuentro de perfil blanco, vidrio y juntas, sin sustituir una ficha de producto Starwin.'},
 {name:'material-handle',company:'Finstral',sourcePage:'https://www.finstral.com/fl/magazine/inbrekers-breken-meestal-via-het-raam-in/20-1460.html',url:'https://cdn.finstral.com/images/content/1190389_53077_9_N_0_0_0_107883621/finstral-afsluitbare-greep.jpg',reason:'Manilla instalada, vidrio y junta. Imagen de referencia de herraje, no promete cerradura incluida.'},
 {name:'interior-panorama',company:'Internorm',sourcePage:'https://www.internorm.com/en-us/products/photo-gallery',url:'https://a.storyblok.com/f/280153/1200x900/cd8db58ad8/haus-innen-96.png',local:`${dir}/originales/i08`,reason:'Interior amplio con ventana en esquina; alternativa horizontal a la escena vertical móvil. No es una obra Starwin.'},
 {name:'exterior-timber',company:'Internorm',sourcePage:'https://www.internorm.com/en-us/products/photo-gallery',candidate:'i12',reason:'Arquitectura de madera con carpintería oscura, apropiada como referencia ambiental para el sur de Chile. No identifica una obra local ni prestaciones.'},
];
const candidates=JSON.parse(await fs.readFile(`${dir}/candidatos.json`,'utf8'));
const records=[];
await fs.mkdir(`${dir}/originales`,{recursive:true});
for(const item of selections){
 if(item.candidate){const c=candidates.find(c=>c.id===item.candidate);item.url=c.url;item.local=`${dir}/originales/${item.candidate}`;}
 const original=`${dir}/originales/${item.name}`;
 if(item.local)await fs.copyFile(item.local,original);
 else if(!(await fs.access(original).then(()=>true,()=>false))){const res=await fetch(item.url);if(!res.ok)throw new Error(`${item.name}: ${res.status}`);await fs.writeFile(original,Buffer.from(await res.arrayBuffer()));}
 const meta=await sharp(original).metadata();
 const sourceHash=crypto.createHash('sha256').update(await fs.readFile(original)).digest('hex');
 const input=item.name==='profile-supremo'?await sharp(original).trim().toBuffer():original;
 const processing=item.name==='profile-supremo'?'Recorte solo del margen transparente (598×792), orientación EXIF y reducción sin ampliar.':'Orientación EXIF y reducción proporcional sin ampliar.';
 for(const width of [480,960,1600]){
  const file=`${item.name}-${width}.webp`;
  await sharp(input).rotate().resize({width,withoutEnlargement:true}).webp({quality:84,effort:5}).toFile(`public/images/${file}`);
  const output=await fs.readFile(`public/images/${file}`);
  const actual=await sharp(output).metadata();
  const record={file,source:original,sourceUrl:item.url,sourcePage:item.sourcePage,company:item.company,sourceWidth:meta.width,sourceHeight:meta.height,width:actual.width,height:actual.height,sourceSha256:sourceHash,sha256:crypto.createHash('sha256').update(output).digest('hex'),transformation:processing+' WebP calidad84. Encuadre de presentación por CSS documentado en curaduría.',reason:item.reason};
  records.push(record);
  await fs.writeFile(`public/images/${file}.json`,JSON.stringify({prompt:`Fotografía original preexistente de ${item.company}. Fuente: ${item.url}. ${item.reason} ${record.transformation}`,createdAt:new Date().toISOString()},null,2));
 }
}
await fs.writeFile(`${dir}/seleccion-publicada.json`,JSON.stringify(records,null,2));
const manifestFile='procedencia/imagenes/v3-origines.json';
const old=JSON.parse(await fs.readFile(manifestFile,'utf8')).filter(r=>!records.some(n=>n.file===r.file));
await fs.writeFile(manifestFile,JSON.stringify([...old,...records].sort((a,b)=>a.file.localeCompare(b.file)),null,2));
console.log(records.map(r=>({file:r.file,width:r.width,height:r.height,source:r.company})));
