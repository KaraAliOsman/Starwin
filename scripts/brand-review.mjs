import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';
const base='http://127.0.0.1:3006';
const out='verificacion/marca';
await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1});
await context.route('**/*',route=>new URL(route.request().url()).origin===base?route.continue():route.abort());
const page=await context.newPage();
const report={date:new Date().toISOString(),viewports:[],accessibility:[],errors:[]};
page.on('pageerror',e=>report.errors.push(e.message));
try{
for(const width of [320,390,768,1440]){
 await page.setViewportSize({width,height:900});await page.goto(base,{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
 for(const img of await page.locator('img[loading=lazy]').all())if(await img.isVisible())await img.scrollIntoViewIfNeeded();
 await page.evaluate(()=>{scrollTo({top:0,behavior:'instant'});});await page.locator('.hero-media img').evaluate(img=>img.decode());
 await page.screenshot({path:`${out}/home-${width}.png`});
 await page.screenshot({path:`${out}/home-full-${width}.png`,fullPage:true});
 report.viewports.push(await page.evaluate(()=>({width:innerWidth,overflow:document.documentElement.scrollWidth>innerWidth,words:document.querySelector('main').innerText.split(/\s+/).length,brand:getComputedStyle(document.documentElement).getPropertyValue('--brand'),font:getComputedStyle(document.querySelector('h1')).fontFamily,hero:document.querySelector('.home-hero').getBoundingClientRect().height})));
 if(width===390||width===1440){const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();report.accessibility.push({route:'/',width,violations:axe.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))});}
}
for(const route of ['/ventanas/','/ventanas/corredera-pro70/','/colores/','/contacto/','/herramientas/']){
 await page.setViewportSize({width:390,height:844});await page.goto(base+route,{waitUntil:'networkidle'});await page.screenshot({path:`${out}/${route.split('/').filter(Boolean).join('-')}-390.png`,fullPage:true});
 report.viewports.push({route,width:390,overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)});
}
await fs.writeFile(`${out}/brand-review.json`,JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
}finally{await browser.close();}

