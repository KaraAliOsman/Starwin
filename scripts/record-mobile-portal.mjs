import {chromium} from 'playwright';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,recordVideo:{dir:'verificacion/umbral-mobile',size:{width:390,height:844}}});
 const page=await context.newPage();
 await page.goto('http://127.0.0.1:3006/?v=switzer-umbral',{waitUntil:'networkidle'});
 await page.evaluate(async()=>{
  await document.fonts.ready;
  await Promise.all([...document.querySelectorAll('.architectural-hero img')].map(i=>i.decode()));
  await new Promise(resolve=>{const started=performance.now();const frame=now=>now-started<3200?requestAnimationFrame(frame):resolve();requestAnimationFrame(frame);});
 });
 await page.screenshot({path:'verificacion/umbral-mobile/portada-final.png'});
 await page.getByRole('link',{name:'Explorar ventanas',exact:true}).click();
 await page.getByRole('heading',{name:'Elige cómo abrir.',exact:true}).waitFor();
 await page.getByRole('button',{name:'Abatible',exact:true}).click();
 await page.waitForFunction(()=>document.querySelector('[data-opening-choice="1"]').getAttribute('aria-pressed')==='true');
 await page.evaluate(()=>new Promise(resolve=>{const started=performance.now();const frame=now=>now-started<1200?requestAnimationFrame(frame):resolve();requestAnimationFrame(frame);}));
 const video=page.video();await context.close();await video.saveAs('verificacion/umbral-mobile/portada-movil.webm');
 console.log('Grabación natural del hero y selección; sin pausar ni acelerar animaciones.');
}finally{await browser.close();}
