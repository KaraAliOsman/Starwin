import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';
const base='http://127.0.0.1:3006',out='.impeccable/review';
await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const context=await browser.newContext();const page=await context.newPage();const report={errors:[],viewports:[],accessibility:[]};
page.on('pageerror',e=>report.errors.push(e.message));
for(const width of [320,390,430,768,1440]){
 await page.setViewportSize({width,height:width===1440?1000:844});await page.goto(base,{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
 for(const image of await page.locator('img').all())if(await image.isVisible())await image.scrollIntoViewIfNeeded();
 await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.locator('.hero-window').evaluate(img=>img.decode());await page.waitForTimeout(1400);
 await page.screenshot({path:`${out}/${width===1440?'desktop':width===390?'mobile':`user-${width}`}.png`});
 await page.screenshot({path:`${out}/full-${width}.png`,fullPage:true});
 report.viewports.push(await page.evaluate(()=>({width:innerWidth,overflow:document.documentElement.scrollWidth>innerWidth,words:document.querySelector('main').innerText.split(/\s+/).length,heroHeight:document.querySelector('.window-hero').getBoundingClientRect().height,contactY:document.querySelector('.hero-contact .btn').getBoundingClientRect().top})));
 if(width===390||width===1440){const a=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();report.accessibility.push({width,violations:a.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))});}
}
for(const route of ['/ventanas/','/ventanas/corredera-pro70/','/colores/','/contacto/','/herramientas/','/blog/']){
 await page.setViewportSize({width:390,height:844});await page.goto(base+route,{waitUntil:'networkidle'});for(const image of await page.locator('img').all())if(await image.isVisible()){await image.scrollIntoViewIfNeeded();await image.evaluate(img=>img.decode());}await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.screenshot({path:`${out}/${route.split('/').filter(Boolean).join('-')}-390.png`,fullPage:true});
 report.viewports.push({route,width:390,overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)});
}
await fs.writeFile(`${out}/render-check.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));await browser.close();


