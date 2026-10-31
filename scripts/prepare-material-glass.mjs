import sharp from 'sharp';
import fs from 'node:fs/promises';
const source='../baufens-reverse-engineering/recursos/imagenes/ca58ba74bc91__6000-series-outward-opening-glass-3-1200x960.png';
for(const width of [480,960,1600]){
 const file=`public/images/material-glass-${width}.webp`;
 await sharp(source).resize({width,withoutEnlargement:true}).webp({quality:87,alphaQuality:100}).toFile(file);
 await fs.writeFile(file+'.json',JSON.stringify({origin:source,prompt:'Origen: corte BauFens de la Serie 6000 con vidrio, recuperado del sitio del proveedor. Solo redimensionado y convertido a WebP; no representa Pro70 ni acredita una instalación Starwin.',transform:{width,withoutEnlargement:true,format:'webp'},createdAt:new Date().toISOString()},null,2));
}

