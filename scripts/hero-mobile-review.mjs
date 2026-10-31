import {chromium} from 'playwright';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';

const out='verificacion/umbral-mobile';
await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const errors=[],results=[];
try{
 for(const [width,height] of [[320,568],[360,800],[390,844],[430,932],[768,900],[1024,768],[1440,720],[1440,900],[1920,1080]]){
  const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'});
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:3006/',{waitUntil:'networkidle'});
  await page.evaluate(async()=>Promise.all([document.fonts.ready,...[...document.querySelectorAll('.architectural-hero img')].map(i=>i.decode())]));
  const metrics=await page.evaluate(()=>{
   const rect=selector=>{const r=document.querySelector(selector).getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height};};
   return {overflow:document.documentElement.scrollWidth>innerWidth,title:rect('#home-title'),intro:rect('.hero-intro'),scene:rect('.hero-portal'),action:rect('.explore-action'),font:getComputedStyle(document.querySelector('h1')).fontFamily,fontLoaded:document.fonts.check('500 64px Switzer')};
  });
  assert.equal(metrics.overflow,false,`overflow ${width}x${height}`);
  assert(metrics.fontLoaded&&metrics.font.startsWith('Switzer'),'Official Switzer must load');
  assert(metrics.title.x>=0&&metrics.title.right<=width,'Title fits');
  if(width<=700){
   assert(metrics.intro.bottom<=metrics.scene.y+1,'Text and product occupy separate areas');
   assert(metrics.scene.bottom<=metrics.action.y+1,'Action has its own area');
   assert(metrics.action.bottom<=height+1,'Explore action is in the first screen');
  }
  await page.screenshot({path:`${out}/hero-${width}x${height}.png`});
  results.push({width,height,...metrics});
  await page.close();
 }
 for(const reduce of [false,true]){
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:reduce?'reduce':'no-preference',recordVideo:reduce?undefined:{dir:out,size:{width:390,height:844}}});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:3006/',{waitUntil:'networkidle'});
  await page.waitForFunction(()=>document.fonts.check('500 64px Switzer'));
  await page.evaluate(async()=>Promise.all([...document.querySelectorAll('.architectural-hero img')].map(i=>i.decode())));
  if(!reduce){
   await page.waitForFunction(()=>document.querySelector('[data-hero-portal]').classList.contains('portal-ready'));
   for(const fraction of [0,.2,.45,.7,1]){
    await page.evaluate(fraction=>document.getAnimations().filter(a=>a.effect?.target?.closest?.('.architectural-hero')).forEach(a=>{a.pause();a.currentTime=100+fraction*1400;}),fraction);
    await page.screenshot({path:`${out}/motion-${fraction}.png`});
   }
   await page.evaluate(()=>document.getAnimations().filter(a=>a.effect?.target?.closest?.('.architectural-hero')).forEach(a=>a.play()));
  }
  await page.getByRole('link',{name:'Explorar ventanas',exact:true}).click();
  await page.getByRole('heading',{name:'Elige cómo abrir.',exact:true}).waitFor({state:'visible'});
  for(const label of ['Fija','Abatible','Corredera','Oscilobatiente','Proyectante'])await page.getByRole('button',{name:label,exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('[data-opening-choice="3"]').getAttribute('aria-pressed')==='true');
  await page.waitForFunction(()=>[...document.querySelectorAll('[data-opening-panel]')].filter(x=>!x.hidden).length===1);
  assert.equal(await page.locator('[data-opening-panel="3"]').isVisible(),true);
  await page.getByRole('button',{name:'Fija',exact:true}).focus();
  await page.keyboard.press('Enter');
  assert.equal(await page.locator('[data-opening-choice="4"]').getAttribute('aria-pressed'),'true');
  if(!reduce){
   await page.emulateMedia({reducedMotion:'reduce'});
   await page.getByRole('button',{name:'Abatible',exact:true}).click();
   await page.waitForFunction(()=>document.querySelector('[data-opening-choice="1"]').getAttribute('aria-pressed')==='true');
   await page.emulateMedia({reducedMotion:'no-preference'});
   await page.getByRole('button',{name:'Fija',exact:true}).click();
   await page.waitForFunction(()=>document.querySelector('[data-opening-choice="4"]').getAttribute('aria-pressed')==='true');
   assert.equal(await page.locator('.opening-track').evaluate(el=>getComputedStyle(el).transitionDuration),'0.22s','Motion returns after the OS preference changes');
  }
  await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
  const menu=page.getByRole('button',{name:'Abrir menú',exact:true});
  await menu.click();await page.keyboard.press('Escape');
  assert.equal(await menu.getAttribute('aria-expanded'),'false');
  if(!reduce){const video=page.video();await context.close();await video.saveAs(`${out}/recorrido-movil.webm`);}else await context.close();
 }
 const fallback=await browser.newPage({viewport:{width:390,height:844},javaScriptEnabled:false});
 await fallback.goto('http://127.0.0.1:3006/',{waitUntil:'networkidle'});
 assert(await fallback.getByRole('link',{name:'Explorar ventanas',exact:true}).isVisible());
 await fallback.screenshot({path:`${out}/sin-javascript.png`});
 assert.deepEqual(errors,[]);
 await fs.writeFile(`${out}/revision.json`,JSON.stringify({results,errors,environment:'Chrome emulado; sin verificación en teléfono físico.'},null,2));
 console.log(JSON.stringify({sizes:results.length,errors}));
}finally{await browser.close();}
