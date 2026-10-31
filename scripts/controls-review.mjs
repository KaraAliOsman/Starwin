import {chromium} from 'playwright';
import sharp from 'sharp';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const out='verificacion/controles';await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const items=[],errors=[],checks=[];
try{
 const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
 const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));
 async function settle(){await page.evaluate(async()=>Promise.all(document.getAnimations().filter(animation=>animation.playState==='running'&&Number.isFinite(animation.effect?.getComputedTiming().endTime)).map(animation=>animation.finished.catch(()=>{}))));}
 async function capture(selector,name,label){await settle();const file=`${out}/${name}.png`;await page.locator(selector).screenshot({path:file});items.push({file,label});}
 await page.goto('http://127.0.0.1:3006/',{waitUntil:'networkidle'});
 for(const width of [320,360,390,430,768,1440]){
  await page.setViewportSize({width,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`Desborde ${width}`);
  const box=await page.locator('.quote-launch').boundingBox();assert(box.height>=44&&box.width>=44,'Área táctil Cotizar');
  assert(await page.locator('.quote-launch>svg').isVisible(),'El control de apertura de Cotizar debe permanecer visible.');
 }
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
 await capture('.quote-launch','cotizar','Cotizar · invitación compacta');await capture('.menu-button','menu','Menú · navegación clara');
 await capture('.explore-action','explorar','Explorar · contorno y recorrido');
 await page.getByRole('button',{name:'Abrir menú',exact:true}).click();assert.equal(await page.locator('main').evaluate(el=>el.inert),true);await settle();await page.screenshot({path:`${out}/menu-abierto-390.png`});await page.keyboard.press('Escape');
 await page.locator('.quote-launch').click();await page.waitForFunction(()=>document.querySelector('.quote-launch').getAttribute('aria-expanded')==='true');
 await settle();await page.screenshot({path:`${out}/opciones-390.png`});await capture('.quote-option:first-child','canal','Conversar · elección de canal');
 await page.keyboard.press('Escape');await page.waitForFunction(()=>document.querySelector('.quote-launch').getAttribute('aria-expanded')==='false');
 checks.push('Cabecera 320–1440 sin desbordes; objetivos de 44px, menú, Escape y estado accesible de Cotizar.');
 await capture('[data-opening-choice="0"]','apertura','Apertura · selección tipográfica');
 await page.getByRole('button',{name:'Roble dorado',exact:true}).click();await page.waitForFunction(()=>document.querySelector('[data-hero-finish-option="oak"]').getAttribute('aria-pressed')==='true');
 await capture('.hero-finishes','muestras','Acabados · muestras físicas');
 await capture('.home-contact-copy .btn','whatsapp','WhatsApp · conversación');
 await page.goto('http://127.0.0.1:3006/contacto/',{waitUntil:'networkidle'});await capture('[data-submit]','formulario','Correo · preparar consulta');
 await page.goto('http://127.0.0.1:3006/cotizador/',{waitUntil:'networkidle'});await page.locator('#width').waitFor();
 assert.equal(await page.locator('#width').inputValue(),'100');assert.equal(await page.locator('#height').inputValue(),'100');
 await capture('[data-action="add"]','agregar','Presupuesto · agregar ventana');await page.getByRole('button',{name:'Agregar',exact:true}).click();
 await page.locator('[data-action="download"]').waitFor();await capture('[data-action="download"]','pdf','PDF · descargar documento');
 await page.setViewportSize({width:320,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'PDF en 320px');
 checks.push('Agregar y Descargar tienen tratamientos propios; fija 100×100 conservada y presupuesto sin desborde a 320px.');
 assert.deepEqual(errors,[]);
 const width=1440,cellWidth=660,cellHeight=220,margin=40,rows=Math.ceil(items.length/2),height=rows*cellHeight+margin*2;
 const layers=[];
 for(const [i,item] of items.entries()){
  const x=margin+(i%2)*(cellWidth+40),y=margin+Math.floor(i/2)*cellHeight;
  const label=Buffer.from(`<svg width="${cellWidth}" height="36"><text x="0" y="25" font-family="Arial,sans-serif" font-size="22" fill="#17272d">${item.label}</text></svg>`);
  layers.push({input:label,left:x,top:y});
  const source=await sharp(item.file).resize({width:570,height:135,fit:'inside'}).png().toBuffer({resolveWithObject:true});
  layers.push({input:source.data,left:x,top:y+52+Math.round((135-source.info.height)/2)});
 }
 await sharp({create:{width,height,channels:3,background:'#edf3f5'}}).composite(layers).png().toFile(`${out}/sistema-controles.png`);
 await fs.writeFile(`${out}/revision.json`,JSON.stringify({date:new Date().toISOString(),checks,errors,items,environment:'Capturas de los controles reales en Chrome local, emulación móvil.'},null,2));
 console.log(JSON.stringify({success:true,controls:items.length,errors}));
}finally{await browser.close();}
