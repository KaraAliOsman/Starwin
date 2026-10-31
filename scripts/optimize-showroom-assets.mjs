import sharp from 'sharp';
import fs from 'node:fs/promises';
// New delivery variants only; retain all original product and room assets.
const images='public/images/';
for(const color of ['white','anthracite','oak']){
 await sharp(`${images}studio-${color}-900.webp`).resize(600).webp({quality:80,effort:6}).toFile(`${images}studio-${color}-600.webp`);
}
for(const name of ['scene-sala-mobile-480','scene-sala-mobile-720','scene-sala-1200']){
 await sharp(`${images}${name}.webp`).avif({quality:52,effort:6}).toFile(`${images}${name}.avif`);
}
await sharp('public/starwin-logo-small.png').webp({quality:88,effort:6}).toFile('public/starwin-logo-small.webp');
const sizes=await Promise.all(['scene-sala-mobile-720.webp','scene-sala-mobile-720.avif','studio-white-900.webp','studio-white-600.webp'].map(async name=>({name,bytes:(await fs.stat(images+name)).size})));
console.log(JSON.stringify(sizes,null,2));
