import fs from 'node:fs/promises';
const files=JSON.parse(await fs.readFile('procedencia/imagenes/v3-origines.json','utf8'));const og=files.find(x=>x.file==='og-starwin.jpg');
if(og)await fs.writeFile('public/images/og-starwin.jpg.json',JSON.stringify({...og,prompt:'Imagen Open Graph preexistente. Fuente trazada en v3-origines.json; no acredita una obra propia Starwin.',recordedAt:new Date().toISOString()},null,2));
