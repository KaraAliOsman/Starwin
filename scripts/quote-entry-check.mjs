import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const base='http://127.0.0.1:3006';
const out='diseno/reconstruccion-oct23/cotizar';
await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const ctx=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1});
const page=await ctx.newPage();
const errors=[],requests=[],checks=[],layout=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('request',r=>requests.push(r.url()));
const visit=route=>page.goto(base+route,{waitUntil:'networkidle'});
const header=()=>page.locator('.header-actions [data-quote-open]');
const dialog=()=>page.getByRole('dialog',{name:'¿Cómo quieres cotizar?'});
const close=()=>page.getByRole('button',{name:'Cerrar opciones de cotización',exact:true});
async function closed(){await dialog().waitFor({state:'hidden'});await page.waitForFunction(()=>document.body.style.position!=='fixed');}
async function images(){await page.locator('img:visible').evaluateAll(async imgs=>{await Promise.all(imgs.filter(i=>{const r=i.getBoundingClientRect();return r.top<innerHeight&&r.bottom>0;}).map(i=>{i.loading='eager';return i.decode();}));});}
async function fit(label){assert(!(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)),`${label}: desborde horizontal`);}
try{
 await visit('/');
 await images();
 assert(!requests.some(u=>/Window3D|Estimator\.|pdf-fonts|react-dom/.test(u)),'Sin herramientas pesadas en portada');
 const direct=page.getByRole('link',{name:'Calcular un estimado',exact:true});
 const directBounds=await direct.boundingBox();assert(directBounds.y+directBounds.height<=844,'Acceso directo al estimador dentro de primera pantalla móvil390');
 await page.screenshot({path:`${out}/inicio-390.png`});
 await header().click();await dialog().waitFor();
 assert.equal(await dialog().locator('a').count(),3);
 assert((await dialog().getByRole('link',{name:'Cotizar por WhatsApp',exact:false}).getAttribute('href')).startsWith('https://wa.me/56966003771?'));
 assert.equal(await dialog().getByRole('link',{name:'Calcular un estimado',exact:false}).getAttribute('href'),'/cotizador/');
 assert.equal(await dialog().getByRole('link',{name:'Cotizar por correo',exact:false}).getAttribute('href'),'/contacto/#consulta');
 assert(await close().evaluate(el=>el===document.activeElement));
 for(let i=0;i<9;i++){await page.keyboard.press('Tab');const focused=await page.evaluate(()=>({inside:!!document.activeElement?.closest('dialog'),tag:document.activeElement?.tagName,href:document.activeElement?.getAttribute('href')}));assert(focused.inside||focused.tag==='BODY',`Tab no enfoca contenido inerte: ${JSON.stringify(focused)}`);}
 await page.keyboard.press('Escape');await closed();assert(await header().evaluate(el=>el===document.activeElement),'Foco regresa al encabezado');
 await header().press('Enter');assert.equal(await dialog().evaluate(el=>el.getAnimations().length),0,'Teclado inmediato');await close().click();await closed();
 checks.push('Tres destinos reales; foco inicial/ciclo de Tab/Escape/retorno; teclado sin entrada animada.');
 for(const [width,height] of [[320,568],[390,844],[430,932],[568,320],[600,900],[700,900],[768,1000],[1440,1000]]){
  await page.setViewportSize({width,height});await page.evaluate(()=>scrollTo({top:0,behavior:"instant"}));await header().click();await dialog().waitFor();await dialog().evaluate(el=>Promise.all(el.getAnimations().map(a=>a.finished)));
  const b=await dialog().boundingBox();assert(b.x>=-1&&b.x+b.width<=width+1&&b.y>=-1&&b.y+b.height<=height+1,`${width}x${height}: diálogo contenido`);
  await dialog().getByRole('link',{name:'Cotizar por correo',exact:false}).scrollIntoViewIfNeeded();
  const option=await dialog().getByRole('link',{name:'Cotizar por correo',exact:false}).boundingBox();assert(option.y+option.height<=height+1,'Correo alcanzable');
  await fit(`modal ${width}`);
  if([320,390,1440].includes(width))await page.screenshot({path:`${out}/selector-${width}.png`});
  layout.push({width,height,dialog:b});await close().click();await closed();
 }
 checks.push('Selector contenido a ocho tamaños, incluido paisaje568x320; tercera opción alcanzable.');
 await page.setViewportSize({width:390,height:844});await page.locator('.hero-intro').getByRole('link',{name:'Cotizar mis ventanas',exact:true}).click();await dialog().waitFor();await page.mouse.click(8,90);await closed();
 await page.evaluate(()=>scrollTo(0,1100));const scrollBefore=await page.evaluate(()=>scrollY);await page.locator('.mobile-contact').getByRole('link',{name:'Cotizar',exact:true}).click();await dialog().waitFor();await close().click();await closed();assert(Math.abs(await page.evaluate(()=>scrollY)-scrollBefore)<2,'Scroll conservado');
 checks.push('Hero, fondo y barra móvil funcionan; cierre conserva scroll.');
 await page.evaluate(()=>scrollTo({top:0,behavior:"instant"}));await header().click();await dialog().waitFor();
 await dialog().evaluate(el=>{for(const x of el.querySelectorAll('h2,.quote-option-title,.quote-option-description'))x.style.fontSize=`${parseFloat(getComputedStyle(x).fontSize)*2}px`;});
 await dialog().getByRole('link',{name:'Cotizar por correo',exact:false}).scrollIntoViewIfNeeded();await fit('Texto doble');await page.screenshot({path:`${out}/texto-doble-390.png`});
 const enlargedClose=await close().boundingBox();assert(enlargedClose.y>=0&&enlargedClose.y+enlargedClose.height<=844,'Cierre visible con texto doble y hoja desplazada');
 const axeDialog=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.equal(axeDialog.violations.length,0,JSON.stringify(axeDialog.violations.map(v=>v.id)));
 await close().click();await closed();
 await page.reload({waitUntil:'networkidle'});await page.emulateMedia({reducedMotion:'reduce'});await header().click();assert.equal(await dialog().evaluate(el=>el.getAnimations().length),0);await close().click();await closed();
 checks.push('Texto doble alcanzable; Axe sin infracciones en selector; movimiento reducido inmediato.');
 await header().click();await dialog().getByRole('link',{name:'Calcular un estimado',exact:false}).click();await page.waitForURL('**/cotizador/');await page.locator('#width').waitFor();
 await visit('/');await header().click();await dialog().getByRole('link',{name:'Cotizar por correo',exact:false}).click();await page.waitForURL('**/contacto/#consulta');assert(await page.locator('form').isVisible());
 checks.push('Destino estimador carga campos; destino correo abre formulario. WhatsApp se comprueba por URL sin enviar mensajes.');
 for(const route of ['/configurador','/configurador/','/configurador.html']){const r=await page.request.get(base+route+'?design=casement',{maxRedirects:0});assert.equal(r.status(),301);assert.equal(r.headers().location,'/cotizador/?design=casement');}
 await visit('/cotizar/');const axePage=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.equal(axePage.violations.length,0);await page.screenshot({path:`${out}/cotizar-390.png`,fullPage:true});
 const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});const p=await nojs.newPage();await p.goto(base+'/');await p.locator('.header-actions a').click();assert.equal(new URL(p.url()).pathname,'/cotizar/');assert.equal(await p.locator('.quote-page-options a').count(),3);await nojs.close();
 checks.push('Tres rutas antiguas301 conservan parámetros; /cotizar/ indexable y navegable sin JavaScript.');
 await page.emulateMedia({reducedMotion:'reduce'});
 for(const width of [320,390,430,600,700,768,1440]){
  await page.setViewportSize({width,height:1000});await visit('/');await images();await fit(`inicio${width}`);
  await page.screenshot({path:`${out}/hero-${width}.png`});
  for(const selector of ['.material-room','.opening-room','.architecture-frame','.project-desk']){await page.locator(selector).scrollIntoViewIfNeeded();await images();}
  await page.locator('.architecture-frame').screenshot({path:`${out}/ambiente-${width}.png`});
  if([390,1440].includes(width)){await page.locator('.material-room').screenshot({path:`${out}/material-${width}.png`});await page.evaluate(()=>{document.activeElement?.blur();scrollTo({top:0,behavior:"instant"});});await page.screenshot({path:`${out}/completa-${width}.png`,fullPage:true});}
 }
 for(const route of ['/nosotros/','/empresas/','/blog/','/blog/pvc-y-termopanel/','/blog/precio-ventanas-pvc-concepcion/']){await visit(route);await images();await fit(route);}
 const imageFailures=await page.locator('img').evaluateAll(imgs=>imgs.filter(i=>i.complete&&i.naturalWidth===0).map(i=>i.src));assert.equal(imageFailures.length,0);
 checks.push('Imágenes decodifican y portada sin desbordes a siete anchos; encuadres móvil/escritorio capturados.');
 assert.equal(errors.length,0,JSON.stringify(errors));
 await fs.writeFile(`${out}/resultado.json`,JSON.stringify({at:new Date().toISOString(),checks,layout,errors,axeDialog:axeDialog.violations,axePage:axePage.violations,device:'Chrome local, emulación de viewport; no teléfono físico'},null,2));console.log({passed:checks.length,checks});
}finally{await browser.close();}
