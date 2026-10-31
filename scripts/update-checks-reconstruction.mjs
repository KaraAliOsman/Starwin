import fs from 'node:fs/promises';
let s=await fs.readFile('scripts/browser-check.mjs','utf8');
s=s.replaceAll('.hero-window','.architecture-shot:not([hidden]) img').replaceAll('.window-hero','.architecture-hero');
s=s.replace("name:'El herraje'","name:'La manilla'").replace("name:'El perfil'","name:'El acabado'");
s=s.replaceAll("name:'Abatible',exact:true","name:'Abatible 02',exact:true").replaceAll("name:'Corredera',exact:true","name:'Corredera 01',exact:true");
// Numbers are aria-hidden; retain accessible control names.
s=s.replaceAll("name:'Abatible 02'","name:'Abatible'").replaceAll("name:'Corredera 01'","name:'Corredera'");
s=s.replaceAll('scrollTo(0,0)','scrollTo({top:0,behavior:"instant"})');
await fs.writeFile('scripts/browser-check.mjs',s);
s=await fs.readFile('scripts/quote-entry-check.mjs','utf8');
s=s.replace("const out='.impeccable/review/cotizar-oct23'","const out='diseno/reconstruccion-oct23/cotizar'").replace("name:'Calcular un estimado online',exact:true","name:'Calcular un estimado',exact:true");
s=s.replace("page.locator('.hero-contact').getByRole('link',{name:'Cotiza tus ventanas',exact:true})","page.locator('.hero-intro').getByRole('link',{name:'Cotizar mis ventanas',exact:true})");
s=s.replaceAll('.material-theatre','.material-room').replaceAll('.finish-story','.opening-room').replaceAll('.project-scene','.architecture-frame').replaceAll('.home-assistance','.project-desk');
s=s.replaceAll('scrollTo(0,0)','scrollTo({top:0,behavior:"instant"})');
await fs.writeFile('scripts/quote-entry-check.mjs',s);
s=await fs.readFile('scripts/reconstruction-captures.mjs','utf8');s=s.replace("scrollTo(0,0)","document.activeElement?.blur();document.documentElement.style.scrollBehavior='auto';scrollTo({top:0,behavior:'instant'})");s=s.replace("await p.screenshot({path:`${out}/${section.slice(1)}-${width}.png`})","await p.locator(`${section} img:visible`).evaluateAll(async imgs=>{await Promise.all(imgs.map(i=>{i.loading='eager';return i.decode()}))});await p.screenshot({path:`${out}/${section.slice(1)}-${width}.png`})");await fs.writeFile('scripts/reconstruction-captures.mjs',s);
