import {chromium} from 'playwright';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const base=process.env.TEST_URL||'http://127.0.0.1:3006';
const out='verificacion/motion-system';await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const errors=[],frames=[];
try{
 const context=await browser.newContext({viewport:{width:1440,height:1000}});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base,{waitUntil:'networkidle'});
 await page.waitForFunction(()=>document.querySelector('[data-scene="finish"]')?.dataset.sceneState==='live');
 const scene=page.locator('[data-scene="finish"]');
 const range=await scene.evaluate(el=>({top:el.getBoundingClientRect().top+scrollY,distance:el.offsetHeight-innerHeight}));
 assert(range.distance>=600,'La comparación necesita un recorrido breve y real.');
 for(const progress of [0,.25,.5,.65,.75,.85,1,.5,0]){
  await page.evaluate(({top,distance,progress})=>scrollTo({top:top+distance*progress,behavior:'instant'}),{...range,progress});
  await page.waitForFunction(p=>Math.abs(Number(document.querySelector('[data-scene="finish"]').dataset.sceneProgress||0)-p)<.025,progress);
  const state=await scene.evaluate(el=>({observedProgress:Number(el.dataset.sceneProgress||0),main:getComputedStyle(el.querySelector('.finish-window-motion')).transform,left:getComputedStyle(el.querySelector('.finish-echo--dark')).transform,leftClip:getComputedStyle(el.querySelector('.finish-echo--dark')).clipPath,opacity:getComputedStyle(el.querySelector('.finish-echo--dark')).opacity,geometry:['.finish-window-motion','.finish-echo--dark','.finish-echo--oak'].map(selector=>{const layer=el.querySelector(selector),r=layer.getBoundingClientRect(),s=getComputedStyle(layer);return {x:r.x,y:r.y,width:r.width,height:r.height,opacity:Number(s.opacity),clip:s.clipPath};})}));
  for(const layer of state.geometry)assert.equal(layer.opacity,1,'Los tres acabados deben permanecer opacos durante todo el despliegue.');
  if(progress>=.85){const [main,left,right]=state.geometry;assert(left.x+left.width<main.x,'Antracita queda separada del blanco.');assert(main.x+main.width<right.x,'Roble queda separado del blanco.');assert(left.x>=0&&right.x+right.width<=1440,'Los tres productos caben en el escenario.');}
  const file=`scene-${String(frames.length).padStart(2,'0')}.png`;await page.screenshot({path:`${out}/${file}`});frames.push({progress,file,...state});
 }
 assert.notEqual(frames[0].left,frames[6].left);assert.equal(frames[0].left,frames.at(-1).left,'La secuencia regresa a su encuadre inicial.');
 for(const [selector,name] of [['.window-collection','aperturas'],['.material-scene','material'],['.project-workbench','herramientas'],['.home-guides','guias'],['.home-contact','contacto']]){
  await page.locator(selector).scrollIntoViewIfNeeded();await page.evaluate(async()=>Promise.all([...document.images].filter(i=>i.getBoundingClientRect().top<innerHeight&&i.getBoundingClientRect().bottom>0).map(i=>i.decode().catch(()=>{}))));
  await page.screenshot({path:`${out}/${name}-1440.png`});
 }
 await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>!document.querySelector('[data-scene="finish"]').classList.contains('is-live'));
 assert.equal(await scene.evaluate(el=>el.offsetHeight<1000),true);await scene.scrollIntoViewIfNeeded();await page.screenshot({path:`${out}/acabados-reduced-1440.png`});
 await context.close();
 const phone=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
 const mobile=await phone.newPage();mobile.on('pageerror',e=>errors.push(e.message));const requests=[];mobile.on('request',r=>requests.push(r.url()));
 await mobile.goto(base,{waitUntil:'networkidle'});
 for(const width of [320,390,430,768]){await mobile.setViewportSize({width,height:844});assert.equal(await mobile.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`Desborde ${width}`);}
 await mobile.setViewportSize({width:390,height:844});
 assert(!requests.some(url=>url.includes('finish-scene')),'La escena GSAP no debe descargarse en celular.');
 await mobile.getByRole('button',{name:'Antracita',exact:true}).click();await mobile.waitForFunction(()=>document.querySelector('[data-hero-finish-option="anthracite"]').getAttribute('aria-pressed')==='true');
 await mobile.emulateMedia({reducedMotion:'reduce'});await mobile.waitForFunction(()=>!document.querySelector('.finish-previous'));await mobile.locator('.finish-feature').scrollIntoViewIfNeeded();await mobile.screenshot({path:`${out}/acabados-390.png`});
 for(const [index,label] of ['Vidrio','Manilla','Acabados'].entries()){
  await mobile.getByRole('button',{name:label,exact:true}).click();
  await mobile.waitForFunction(i=>{const gallery=document.querySelector('.material-gallery'),piece=document.querySelector(`[data-material-panel="${i}"]`);return Math.abs(piece.getBoundingClientRect().left-gallery.getBoundingClientRect().left-parseFloat(getComputedStyle(gallery).paddingLeft))<3;},index);
  await mobile.screenshot({path:`${out}/detalle-${index}-390.png`});
 }
 for(const [selector,name] of [['.window-collection','aperturas'],['.project-workbench','herramientas'],['.home-guides','guias'],['.home-contact','contacto']]){await mobile.locator(selector).scrollIntoViewIfNeeded();await mobile.screenshot({path:`${out}/${name}-390.png`});}
 const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});const fallback=await nojs.newPage();await fallback.goto(base,{waitUntil:'networkidle'});
 assert(await fallback.getByRole('link',{name:'Explorar ventanas',exact:true}).isVisible());assert(await fallback.locator('#opening-0').isVisible());assert.equal(await fallback.locator('.finish-feature').evaluate(el=>el.offsetHeight<1000),true);assert.equal(await fallback.locator('.material-piece').count(),3);await nojs.close();
 assert.deepEqual(errors,[]);await fs.writeFile(`${out}/revision.json`,JSON.stringify({date:new Date().toISOString(),frames,errors,checks:['Escena real en nueve posiciones, incluyendo regreso','Tres acabados opacos durante todo el despliegue; separación final sin solapamientos ni cortes','Preferencia de movimiento reducido elimina la retención; comparación estática de tres acabados en escritorio','Sin descarga de GSAP en celular','Galería horizontal: vidrio, manilla y acabados','320, 390, 430 y 768 sin desbordes','Contenido y enlaces utilizables sin JavaScript'],environment:'Chrome headless, tamaños emulados. No es prueba en teléfono físico.'},null,2));
 console.log(JSON.stringify({success:true,frames:frames.length,errors}));
}finally{await browser.close();}
