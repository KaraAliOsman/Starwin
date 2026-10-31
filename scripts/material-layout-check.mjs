import {chromium} from 'playwright';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const out='.impeccable/review/fixes';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const report={viewports:[],loading:false,recovery:false};
try{
 for(const width of [320,390,430,600,700,768,1440]){
  const page=await browser.newPage({viewport:{width,height:1000}});
  await page.goto('http://127.0.0.1:3006/',{waitUntil:'networkidle'});
  await page.locator('.material-theatre').scrollIntoViewIfNeeded();
  await page.locator('#material-0 img').evaluate(img=>img.decode());
  await page.waitForTimeout(300);
  const row=await page.evaluate(()=>{
   const bounds=sel=>{const r=document.querySelector(sel).getBoundingClientRect();return {top:r.top,bottom:r.bottom,height:r.height};};
   return {width:innerWidth,stage:bounds('.material-stage'),caption:bounds('#material-0 figcaption'),tabs:bounds('.material-tabs'),visual:bounds('#material-0 .material-visual'),overflow:document.documentElement.scrollWidth>innerWidth};
  });
  assert(!row.overflow);
  if(width<=700){assert(row.caption.bottom<=row.stage.bottom+1);assert(row.stage.bottom<row.tabs.top);assert(row.visual.bottom<row.caption.top);}
  report.viewports.push(row);
  if([320,390,430].includes(width)){
   await page.locator('.material-theatre').screenshot({path:`${out}/material-normal-${width}.png`});
   await page.route('**/images/material-glass-*.webp*',r=>r.abort('failed'));
   await page.getByRole('button',{name:'El vidrio',exact:true}).click();
   await page.locator('.material-theatre .choice-error[data-state=error]').waitFor({state:'visible'});
   assert(await page.locator('#material-0').isVisible());
   await page.locator('.material-theatre').screenshot({path:`${out}/material-error-${width}.png`});
   await page.unroute('**/images/material-glass-*.webp*');
   await page.route('**/images/material-glass-*.webp*',async r=>{await new Promise(resolve=>setTimeout(resolve,1800));await r.continue();});
   await page.getByRole('button',{name:'El vidrio',exact:true}).click();
   await page.getByText('Cargando vista…',{exact:true}).waitFor({state:'visible'});
   assert(await page.locator('#material-0').isVisible());report.loading=true;
   if(width===390)await page.locator('.material-theatre').screenshot({path:`${out}/material-loading-390.png`});
   await page.locator('#material-1').waitFor({state:'visible'});
   await page.waitForTimeout(300);
   assert(await page.locator('.material-theatre .choice-error').isHidden());
   await page.locator('.material-theatre').screenshot({path:`${out}/material-recovered-${width}.png`});
   report.recovery=true;
  }
  await page.close();
 }
 await fs.writeFile(`${out}/material-layout.json`,JSON.stringify(report,null,2));
 console.log(JSON.stringify(report));
}finally{await browser.close();}
