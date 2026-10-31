import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const base=process.env.TEST_URL||'http://127.0.0.1:3006';
const out='verificacion/diseno-oct28';
await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
const checks=[],screens=[];
async function shot(name){await page.screenshot({path:`${out}/${name}.png`,fullPage:false});screens.push(name);}
async function settled(){await page.evaluate(async()=>{await Promise.all(document.getAnimations().filter(a=>a.playState==='running'&&Number.isFinite(a.effect?.getComputedTiming().endTime)).map(a=>a.finished.catch(()=>{})));});}
try{
 await page.goto(base,{waitUntil:'networkidle'});
 for(const width of [320,390,768,1440]){
  await page.setViewportSize({width,height:width>=768?1000:844});
  await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
  await page.locator('.architectural-hero-object').evaluate(image=>image.decode());await page.locator('.architectural-hero-photo img').evaluate(image=>image.decode());
  await settled();await shot(`inicio-${width}`);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`Desborde ${width}`);
 }
 checks.push('Portada en 320, 390, 768 y 1440 px, sin desbordes.');
 await page.setViewportSize({width:390,height:844});
 await page.locator('.finish-feature').scrollIntoViewIfNeeded();await settled();
 await page.getByRole('button',{name:'Antracita',exact:true}).click();
 await page.waitForFunction(()=>document.querySelector('[data-hero-finish-option=anthracite]')?.getAttribute('aria-pressed')==='true');
 await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>!document.querySelector('.finish-previous'));
 await page.getByRole('button',{name:'Roble dorado',exact:true}).focus();await page.keyboard.press('Enter');
 await page.waitForFunction(()=>document.querySelector('[data-hero-image]')?.getAttribute('alt')?.includes('roble'));
 assert.equal(await page.locator('.finish-previous').count(),0);await shot('acabado-roble-movil');
 await page.getByRole('button',{name:'Manilla',exact:true}).focus();await page.keyboard.press('Enter');
 await page.locator('#material-1').waitFor({state:'visible'});assert.equal(await page.locator('[data-material-panel]:not([hidden])').count(),3);
 await page.emulateMedia({reducedMotion:'no-preference'});await page.getByRole('button',{name:'Acabados',exact:true}).click();
 await page.waitForFunction(()=>document.querySelector('[data-material-choice="2"]')?.getAttribute('aria-pressed')==='true');
 await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>document.querySelectorAll('[data-material-panel]:not([hidden])').length===3);
 checks.push('Acabados con imagen responsiva; teclado y activar movimiento reducido cancelan capas anteriores sin perder selección.');
 await page.getByRole('button',{name:'Abrir menú',exact:true}).evaluate(button=>button.focus({preventScroll:true}));
 const scroll=await page.evaluate(()=>scrollY);
 await page.keyboard.press('Enter');
 const menuPosition=await page.evaluate(()=>({scroll:scrollY,top:document.body.style.top}));
 assert.equal(await page.locator('main').evaluate(el=>el.inert),true);
 await page.keyboard.press('Tab');assert.equal(await page.locator('.brand').evaluate(el=>el===document.activeElement),true);
 await page.locator('.site-header [data-quote-open]').click();assert.equal(await page.locator('main').evaluate(el=>el.inert),false);
 const quotePosition=await page.evaluate(()=>({scroll:scrollY,top:document.body.style.top}));
 await page.getByRole('button',{name:'Cerrar opciones de cotización',exact:true}).click();
 await page.waitForFunction(()=>document.body.style.position==='');
 const restoredScroll=await page.evaluate(()=>scrollY);
 assert(Math.abs(restoredScroll-scroll)<2,`Scroll esperado ${scroll}, menú ${JSON.stringify(menuPosition)}, cotizar ${JSON.stringify(quotePosition)}, restaurado ${restoredScroll}`);
 checks.push('Menú: foco contenido, lectura de fondo desactivada, paso a cotización y cierre restauran desplazamiento.');
 for(const [route,slug] of [['/ventanas/','catalogo'],['/colores/','acabados'],['/contacto/','contacto'],['/blog/','guias']]){
  for(const width of [390,1440]){
   await page.setViewportSize({width,height:1000});await page.goto(base+route,{waitUntil:'networkidle'});
   if(slug==='acabados'){await page.locator('.finish-studio').scrollIntoViewIfNeeded();await page.locator('[data-material-image]').evaluate(img=>img.decode());}
   await settled();await shot(`${slug}-${width}`);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${slug}/${width}`);
  }
 }
 const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});const fallback=await nojs.newPage();
 await fallback.goto(base,{waitUntil:'networkidle'});assert(await fallback.getByRole('link',{name:'Explorar ventanas',exact:true}).isVisible());assert(await fallback.locator('#opening-0').isVisible());assert(await fallback.getByRole('link',{name:'catálogo de ventanas',exact:true}).isVisible());await nojs.close();
 checks.push('Sin JavaScript: producto inicial, contenido y enlace al catálogo disponibles.');
 assert.deepEqual(errors,[]);
 await fs.writeFile(`${out}/revision.json`,JSON.stringify({date:new Date().toISOString(),checks,screens,errors,environment:'Chrome local headless; tamaños emulados, sin certificación de teléfono físico.'},null,2));
 console.log(JSON.stringify({success:true,checks:checks.length,screenshots:screens.length,errors},null,2));
}finally{await browser.close();}
