import {chromium} from 'playwright';
import fs from 'node:fs/promises';
const out='verificacion/scroll-stories';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const reports=[];
try{
 for(const width of [1440,390]){
  const height=width===390?844:900;
  const context=await browser.newContext({viewport:{width,height},isMobile:width===390,hasTouch:width===390,recordVideo:{dir:out,size:{width,height}}});
  const page=await context.newPage();await page.goto('http://127.0.0.1:3006/?v=scroll-escenas',{waitUntil:'networkidle'});
  await page.waitForFunction(()=>document.querySelector('[data-portal-story]').classList.contains('story-live'));
  const ranges=await page.evaluate(()=>['[data-portal-story]','#acabados'].map(selector=>{const e=document.querySelector(selector);return {start:Number(e.dataset.scrollStart),run:Number(e.dataset.scrollRun)};}));
  const perf=await page.evaluate(async([hero,finish])=>{
   const intervals=[];
   const move=(from,to,duration)=>new Promise(resolve=>{let start,last;const frame=now=>{start??=now;if(last)intervals.push(now-last);last=now;const p=Math.min((now-start)/duration,1);scrollTo({top:from+(to-from)*p,behavior:'instant'});if(p<1)requestAnimationFrame(frame);else resolve();};requestAnimationFrame(frame);});
   await move(0,0,500);
   await move(0,hero.start+hero.run,2600);
   await move(hero.start+hero.run,hero.start+hero.run,700);
   await move(hero.start+hero.run,hero.start,1900);
   await move(hero.start,hero.start+hero.run,2000);
   await move(hero.start+hero.run,finish.start,900);
   await move(finish.start,finish.start+finish.run,2400);
   await move(finish.start+finish.run,finish.start+finish.run,800);
   await move(finish.start+finish.run,finish.start,1700);
   intervals.sort((a,b)=>a-b);return {frames:intervals.length,medianMs:intervals[Math.floor(intervals.length/2)],over34ms:intervals.filter(n=>n>34).length,maxMs:intervals.at(-1)};
  },ranges);
  const video=page.video();await context.close();await video.saveAs(`${out}/recorrido-${width}.webm`);reports.push({width,height,...perf});
 }
 await fs.writeFile(`${out}/grabacion.json`,JSON.stringify({reports,environment:'Chrome headless emulado. Esta medición no acredita GPU ni fluidez en teléfono físico.'},null,2));console.log(JSON.stringify(reports));
}finally{await browser.close();}
