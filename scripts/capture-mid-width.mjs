import {chromium} from 'playwright';
import fs from 'node:fs/promises';
const out='.impeccable/review',phase=process.argv[2]||'current';const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const page=await browser.newPage();const rows=[];
for(const width of [600,700]){
 await page.setViewportSize({width,height:1000});await page.goto('http://127.0.0.1:3006/',{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);await page.locator('.hero-window').evaluate(i=>i.decode());await page.waitForTimeout(1400);
 rows.push(await page.evaluate(()=>{const image=document.querySelector('.hero-window').getBoundingClientRect(),title=document.querySelector('h1').getBoundingClientRect();return {width:innerWidth,imageBottom:image.bottom,titleTop:title.top,overlap:Math.max(0,image.bottom-title.top),overflow:document.documentElement.scrollWidth>innerWidth};}));
 await page.screenshot({path:out+'/hero-'+width+'-'+phase+'.png'});
}
await fs.writeFile(out+'/mid-width-'+phase+'.json',JSON.stringify(rows,null,2));console.log(rows);await browser.close();

