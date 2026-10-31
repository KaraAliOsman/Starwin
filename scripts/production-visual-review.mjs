import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const out='verificacion/produccion';await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const results=[],errors=[];
try{
 const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'}),page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 for(const [name,route]of [['inicio','/'],['biobio','/ventanas-pvc-biobio/'],['visualizador','/visualizador/']]){
  await page.goto('https://starwinpvc.cl'+route,{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
  for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:width<700?844:1000});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,route+' '+width);}
  const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.equal(axe.violations.length,0,JSON.stringify(axe.violations));
  for(const width of [1440,390]){await page.setViewportSize({width,height:width===390?844:1000});await page.evaluate(async()=>Promise.all([...document.images].filter(i=>{const r=i.getBoundingClientRect();return r.width>0&&r.height>0&&r.bottom>0&&r.top<innerHeight;}).map(i=>{i.loading='eager';return i.decode().catch(()=>{});})));await page.screenshot({path:`${out}/${name}-${width}.png`,fullPage:route!=='/'});}
  results.push({route,widths:[320,390,768,1440],axeViolations:0});
 }
 assert.deepEqual(errors,[]);await fs.writeFile(`${out}/visual.json`,JSON.stringify({results,errors,environment:'Chrome emulado'},null,2));console.log(JSON.stringify({results,errors}));
}finally{await browser.close();}
