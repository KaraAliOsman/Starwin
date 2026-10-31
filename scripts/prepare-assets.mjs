import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
const base=path.resolve('..');
const originals=path.join(base,'material-starwin/imagenes/originales');
const files=await fs.readdir(originals);
await fs.mkdir('public/images',{recursive:true});
const list={hero:30,sliding:12,casement:6,tilt:55,awning:5,fixed:26,workshop:17,inspection:42,rain:24,room:59,detail:1,profiles:114,green:127,glass:69,'color-white':8,'color-anthracite':29,'color-black':49,'color-walnut':50,'color-oak':60,light:123,care:47,measure:112};
const manifest=[];
for(const [name,id] of Object.entries(list)){
 const source=files.find(f=>f.startsWith(String(id).padStart(3,'0')+'-'));
 if(!source)throw Error(`Missing image ${id}`);
 for(const width of [480,960,1600]){
  await sharp(path.join(originals,source)).resize({width,withoutEnlargement:true}).webp({quality:82,effort:5}).toFile(`public/images/${name}-${width}.webp`);
 }
 manifest.push({name,source:`../material-starwin/imagenes/originales/${source}`,origin:'Material entregado de Starwin. Uso ilustrativo de producto, no testimonio de obra ejecutada.'});
}
const supplier=path.join(base,'baufens-reverse-engineering/recursos/imagenes/571adbe2155c__7000-series-3d-model-White.png');
await sharp(supplier).resize({width:800,withoutEnlargement:true}).webp({quality:86}).toFile('public/images/supplier-profile.webp');
manifest.push({name:'supplier-profile',source:path.relative(process.cwd(),supplier),origin:'BauFens. Ilustración de perfil del proveedor; no ficha técnica de la Serie Pro70.'});
await fs.copyFile(path.join(base,'estimador-starwin/public/starwin-logo.png'),'public/starwin-logo.png');
for(const name of ['fonts','pdf-fonts'])await fs.cp(path.join(base,`estimador-starwin/public/${name}`),`public/${name}`,{recursive:true});
const favicon=files.find(f=>f.startsWith('020-'));if(favicon){await fs.copyFile(path.join(originals,favicon),'public/apple-touch-icon.png');await sharp(path.join(originals,favicon)).resize(48,48).png().toFile('public/favicon.png');}
await fs.mkdir('src/features/estimator',{recursive:true});
for(const name of ['app','src'])await fs.cp(path.join(base,`estimador-starwin/${name}`),`src/features/estimator/${name}`,{recursive:true,filter:p=>!p.endsWith('.test.ts')&&!p.endsWith('.test.tsx')&&!p.includes(`${path.sep}test${path.sep}`)});
await fs.mkdir('procedencia',{recursive:true});
await fs.cp(path.join(base,'estimador-starwin/procedencia'),'procedencia/precios',{recursive:true});
await fs.writeFile('procedencia/imagenes.json',JSON.stringify(manifest,null,2));
console.log(`Preparadas ${list?Object.keys(list).length:0} imágenes adaptables y módulo original de precios.`);
