import {chromium} from 'playwright';
import fs from 'node:fs/promises';
const out='verificacion/motion-system';await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{
 const context=await browser.newContext({viewport:{width:1440,height:1000},recordVideo:{dir:out,size:{width:1440,height:1000}}});
 const page=await context.newPage();await page.goto('http://127.0.0.1:3006/',{waitUntil:'networkidle'});
 await page.waitForFunction(()=>document.querySelector('[data-scene="finish"]')?.dataset.sceneState==='live');
 const range=await page.locator('[data-scene="finish"]').evaluate(el=>({top:el.getBoundingClientRect().top+scrollY,distance:el.offsetHeight-innerHeight}));
 await page.evaluate(async({top,distance})=>{
  await new Promise(resolve=>{let start;function frame(now){start??=now;const time=now-start;
   const progress=time<700?0:time<3100?(time-700)/2400:time<3700?1:time<6100?1-(time-3700)/2400:0;
   scrollTo({top:top+distance*progress,behavior:'instant'});
   if(time<6700)requestAnimationFrame(frame);else resolve();
  }requestAnimationFrame(frame);});
 },range);
 const video=page.video();await context.close();await video.saveAs(out+'/acabados-desplazamiento.webm');
 console.log(JSON.stringify({file:out+'/acabados-desplazamiento.webm',description:'Captura real de Chrome local, avance y regreso de la secuencia. Sin sonido.'}));
}finally{await browser.close();}
