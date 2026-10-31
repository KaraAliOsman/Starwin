import fs from 'node:fs/promises';
import sharp from 'sharp';
const candidates=JSON.parse(await fs.readFile('diseno/curaduria-oct23/candidatos.json','utf8'));
for(const [name,id] of [['home-timber','i16'],['home-cabin','i09']]){
 const original=`diseno/curaduria-oct23/originales/${id}`;
 const source=candidates.find(c=>c.id===id);
 const meta=await sharp(original).metadata();
 for(const width of [480,960,1200]){
  const target=`public/images/${name}-${width===1200?1600:width}.webp`;
  await sharp(original).resize({width,withoutEnlargement:true}).webp({quality:85}).toFile(target);
  await fs.writeFile(`${target}.json`,JSON.stringify({prompt:`Sourced photograph. Origin: ${source.url}. Page: ${source.sourcePage}. Company: ${source.company}. Responsive resizing only; reference atmosphere, not Starwin construction.`,type:'sourced',source:original,sourceUrl:source.url,sourcePage:source.sourcePage,company:source.company,sourceWidth:meta.width,sourceHeight:meta.height,usage:'Ambiente de referencia, no obra Starwin',transform:'Responsive resize, no invented construction or altered geometry'},null,2));
 }
}
const css=await (await fetch('https://fonts.googleapis.com/css2?family=Figtree:wght@400..700&display=swap',{headers:{'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'}})).text();
const fontUrl=[...css.matchAll(/url\((https:[^)]+)\)/g)].at(-1)?.[1];
if(!fontUrl)throw new Error('Figtree stylesheet did not expose a font');
const buffer=Buffer.from(await (await fetch(fontUrl)).arrayBuffer());
await fs.writeFile('public/fonts/figtree-latin-variable.woff2',buffer);
await fs.writeFile('public/fonts/Figtree-origin.json',JSON.stringify({family:'Figtree',source:'https://fonts.google.com/specimen/Figtree',fontUrl,stylesheet:css,date:'2026-10-25'},null,2));
const license=await (await fetch('https://raw.githubusercontent.com/google/fonts/main/ofl/figtree/OFL.txt')).text();
await fs.writeFile('public/fonts/Figtree-OFL.txt',license);
console.log('Two sourced photo families, sidecars and Figtree downloaded.');
