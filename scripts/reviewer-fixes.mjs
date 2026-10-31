import {chromium} from 'playwright';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const out='.impeccable/review/fixes';await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const page=await browser.newPage();const report={bounds:[],failureRecovery:null,captions:null};
try{
 for(const width of [600,700]){
  await page.setViewportSize({width,height:1000});await page.goto('http://127.0.0.1:3006/',{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);await page.locator('.hero-window').evaluate(i=>i.decode());
  for(const [name,asset] of [['Blanco','white'],['Antracita','anthracite'],['Roble','oak']]){
   await page.getByRole('button',{name:'Acabado '+name,exact:true}).click();await page.waitForFunction(a=>document.querySelector('.hero-window').src.includes(a),asset);await page.waitForTimeout(300);
   for(const time of [0,200,700,1200]){
    await page.evaluate(t=>document.getAnimations().filter(a=>a instanceof CSSAnimation).forEach(a=>{a.pause();a.currentTime=t;}),time);
    const row=await page.evaluate(()=>{const image=document.querySelector('.hero-window').getBoundingClientRect(),scene=document.querySelector('.hero-scene').getBoundingClientRect(),title=document.querySelector('h1').getBoundingClientRect();return {width:innerWidth,imageBottom:image.bottom,sceneBottom:scene.bottom,visibleBottom:Math.min(image.bottom,scene.bottom),titleTop:title.top,overflow:getComputedStyle(document.querySelector('.hero-scene')).overflow};});
    Object.assign(row,{name,time});assert(['hidden','clip'].includes(row.overflow));assert(row.visibleBottom<row.titleTop);report.bounds.push(row);
    if(time===200||time===1200)await page.screenshot({path:out+'/hero-'+width+'-'+asset+'-'+time+'.png'});
   }
  }
 }
 const failure=await browser.newPage({viewport:{width:390,height:844}});
 await failure.route('**/images/material-glass-*.webp*',route=>route.abort('failed'));await failure.goto('http://127.0.0.1:3006/',{waitUntil:'networkidle'});
 await failure.getByRole('button',{name:'El vidrio',exact:true}).click();await failure.locator('.material-theatre .choice-error').waitFor({state:'visible'});assert(await failure.locator('#material-0').isVisible());assert(await failure.locator('#material-1').isHidden());assert.equal(await failure.getByRole('button',{name:'El perfil',exact:true}).getAttribute('aria-pressed'),'true');await failure.screenshot({path:out+'/material-error.png'});
 await failure.unroute('**/images/material-glass-*.webp*');await failure.getByRole('button',{name:'El vidrio',exact:true}).click();await failure.locator('#material-1').waitFor({state:'visible'});assert(await failure.locator('.material-theatre .choice-error').isHidden());await failure.waitForTimeout(300);await failure.screenshot({path:out+'/material-recovered.png'});
 report.failureRecovery='Fallo de red simulado: se conserva perfil, se anuncia el error y un segundo intento recupera vidrio.';
 report.captions=await failure.locator('.hero-bottom small,.material-panel figcaption,.finish-copy small,.project-credit').evaluateAll(items=>items.map(el=>({text:el.textContent,size:getComputedStyle(el).fontSize})));assert(report.captions.every(row=>parseFloat(row.size)>=12));
 await fs.writeFile(out+'/reviewer-fixes.json',JSON.stringify(report,null,2));console.log({bounds:report.bounds.length,overlaps:0,failureRecovery:report.failureRecovery,captionMinimum:12});
}finally{await browser.close();}

