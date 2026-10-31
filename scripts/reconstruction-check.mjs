import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const out='diseno/reconstruccion-oct23';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const page=await context.newPage();
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const results=[];
try{
 await page.goto('http://127.0.0.1:3006/',{waitUntil:'networkidle'});
 for(const [width,height] of [[320,568],[390,844],[430,932],[768,1000],[1440,1000]]){
  await page.setViewportSize({width,height});await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
  assert.equal(await page.locator('h1').count(),1);
  assert(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),`overflow${width}`);
  const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  results.push({width,height,violations:result.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))});
 }
 await page.setViewportSize({width:390,height:844});
 await page.getByRole('button',{name:'Desde dentro',exact:true}).click();await page.locator('[data-architecture-panel="1"]').waitFor({state:'visible'});assert(await page.locator('[data-architecture-panel="1"] img').evaluate(i=>i.naturalWidth>0));
 await page.getByRole('button',{name:'La ventana',exact:true}).click();await page.locator('[data-architecture-panel="0"]').waitFor({state:'visible'});
 for(const prefix of ['opening','material']){for(const button of await page.locator(`[data-${prefix}-choice]`).all()){await button.click();const key=await button.getAttribute(`data-${prefix}-choice`);await page.locator(`[data-${prefix}-panel="${key}"]`).waitFor({state:'visible'});assert.equal(await button.getAttribute('aria-pressed'),'true');}}
 await page.emulateMedia({reducedMotion:'reduce'});await page.getByRole('button',{name:'El acabado',exact:true}).click();await page.locator('#material-0').waitFor({state:'visible'});assert.equal(await page.locator('#material-0').evaluate(el=>el.getAnimations().length),0);
 await page.getByRole('button',{name:'Corredera',exact:true}).press('Enter');await page.locator('#opening-0').waitFor({state:'visible'});assert.equal(await page.locator('#opening-0').evaluate(el=>el.getAnimations().length),0);
 // New context: simulate a failed product image; preserve current material and allow a retry.
 const failure=await browser.newPage({viewport:{width:390,height:844}});
 await failure.route('**/material-handle-*.webp*',route=>route.abort());
 await failure.goto('http://127.0.0.1:3006/',{waitUntil:'networkidle'});await failure.getByRole('button',{name:'La manilla',exact:true}).click();
 await failure.locator('.material-room .choice-error').filter({hasText:'No pudimos'}).waitFor();assert(await failure.locator('#material-0').isVisible());
 await failure.unroute('**/material-handle-*.webp*');await failure.getByRole('button',{name:'La manilla',exact:true}).click();await failure.locator('#material-2').waitFor({state:'visible'});await failure.close();
 await fs.writeFile(`${out}/verificacion-interfaz.json`,JSON.stringify({date:new Date().toISOString(),viewports:results,checks:['Cinco anchos sin desborde','Todos los ambientes, aperturas y detalles','Teclado y movimiento reducido sin animación','Fallo de imagen preserva la escena; reintento recupera','Sin errores de página'],errors},null,2));
 assert.equal(results.reduce((s,r)=>s+r.violations.length,0),0,JSON.stringify(results));assert.deepEqual(errors,[]);console.log('Interfaz: cinco anchos, cero infracciones, todos los selectores y recuperación comprobados.');
}finally{await browser.close();}

