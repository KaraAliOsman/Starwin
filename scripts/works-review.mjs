import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const server=spawn(process.execPath,['--env-file-if-exists=.env','scripts/serve.mjs'],{windowsHide:true,stdio:'ignore'});
let browser;
const out='verificacion/trabajos';await fs.mkdir(out,{recursive:true});
const results=[],errors=[];
try{
 for(let n=0;n<40;n++){try{const r=await fetch('http://127.0.0.1:3006/trabajos-realizados/');if((await r.text()).includes('Acabado madera'))break;}catch{}if(n===39)throw Error('Preview no disponible');await new Promise(resolve=>setTimeout(resolve,200));}
 browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 for(const width of [320,390,768,1440]){
  const context=await browser.newContext({viewport:{width,height:width<700?844:1000},reducedMotion:'reduce'});const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:3006/trabajos-realizados/',{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
  assert.equal(await page.locator('.work-project').count(),7);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await page.getByRole('button',{name:'Puertas',exact:true}).click();assert.equal(await page.locator('.work-project:visible').count(),1);
  await page.getByRole('button',{name:'Todos',exact:true}).click();
  const first=page.locator('[data-work-image]').first();await first.click();await page.waitForFunction(()=>document.querySelector('.work-viewer img').naturalWidth>0);
  const dialogAxe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa']).analyze();assert.deepEqual(dialogAxe.violations.map(v=>v.id),[]);
  await page.keyboard.press('Escape');assert.equal(await first.evaluate(el=>el===document.activeElement),true);
  const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(axe.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),[]);
  await page.evaluate(async()=>{for(const img of document.querySelectorAll('.work-photo img')){img.loading='eager';await img.decode();}});
  await page.screenshot({path:`${out}/galeria-${width}.jpg`,fullPage:true});results.push({width,photos:7,filter:true,dialog:true,axe:0});await context.close();
 }
 for(const width of [390,1440]){
  const page=await browser.newPage({viewport:{width,height:900},deviceScaleFactor:2});page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:3006/',{waitUntil:'networkidle'});await page.waitForFunction(()=>document.querySelector('[data-portal-story]').classList.contains('story-live'));
  const range=await page.locator('[data-portal-story]').evaluate(el=>({start:Number(el.dataset.scrollStart),run:Number(el.dataset.scrollRun)}));
  for(const progress of [.3,.6,.85,.6,0]){
   await page.evaluate(({start,run,progress})=>scrollTo({top:start+run*progress,behavior:'instant'}),{...range,progress});
   await page.waitForFunction(p=>Math.abs(Number(document.querySelector('[data-portal-story]').dataset.storyProgress)-p)<.005,progress);
   const stable=await page.evaluate(()=>{const frame=document.querySelector('.hero-product-depth');const before=getComputedStyle(frame).transform;for(let i=0;i<4;i++)dispatchEvent(new Event('resize'));return {before,after:getComputedStyle(frame).transform,plane:getComputedStyle(document.querySelector('.hero-portal')).transform};});
   assert.equal(stable.before,stable.after,'La actualización de geometría no debe interrumpir el zoom');assert.equal(stable.plane,'none','No ampliar una capa del tamaño de la pantalla');
   if(progress===.6)await page.screenshot({path:`${out}/hero-zoom-${width}.jpg`});
  }
  results.push({heroWidth:width,deviceScaleFactor:2,resizeDuringZoom:'stable',reversible:true});await page.close();
 }
 const nojs=await browser.newPage({javaScriptEnabled:false,viewport:{width:390,height:844}});await nojs.goto('http://127.0.0.1:3006/trabajos-realizados/');assert.equal(await nojs.locator('.work-project:visible').count(),7);assert.equal(await nojs.locator('.work-filters').isVisible(),false);await nojs.close();
 assert.deepEqual(errors,[]);await fs.writeFile(`${out}/report.json`,JSON.stringify({results,errors,noJsReadable:true},null,2));console.log(JSON.stringify({results,errors,noJsReadable:true}));
}finally{await browser?.close();server.kill();}
