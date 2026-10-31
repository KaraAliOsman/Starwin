import sharp from 'sharp';
const source='public/images/starwin-home-1600.webp';
const metadata=await sharp(source).metadata();
// Match the same room on phone, preserving enough pixels for its tall display.
const height=metadata.height,width=Math.round(height*480/760);
const left=Math.min(metadata.width-width,Math.round(metadata.width*.62-width/2));
for(const size of [480,720])await sharp(source).extract({left,top:0,width,height}).resize(size,Math.round(size*760/480)).webp({quality:83,effort:6}).toFile(`public/images/contact-window-mobile-${size}.webp`);
console.log(JSON.stringify({source,original:[metadata.width,metadata.height],crop:[left,0,width,height]}));
