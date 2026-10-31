import {chromium} from 'playwright';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const out='verificacion/scroll-stories';await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const errors=[],results=[];
try{
 for(const [width,height]of [[390,844],[1440,900],[320,568],[768,900],[1440,720]]){
  const context=await browser.newContext({viewport:{width,height},isMobile:width<700,hasTouch:width<700,recordVideo:width===390||width===1440&&height===900?{dir:out,size:{width,height}}:undefined});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:3006/',{waitUntil:'networkidle'});
  await page.waitForFunction(()=>document.querySelector('[data-portal-story]').classList.contains('story-live'));
  for(const [selector,key]of [['[data-portal-story]','portal'],['#acabados','finish']]){
   const root=page.locator(selector);
   await page.waitForFunction(selector=>Number(document.querySelector(selector).dataset.scrollRun)>0,selector);
   const range=await root.evaluate(el=>({start:Number(el.dataset.scrollStart),run:Number(el.dataset.scrollRun)}));
   assert(range.run>200,`${key} scroll range ${width}`);
   const frames=[];
   for(const pof of [0,.15,.3,.5,.7,.85,1,.5,0]){
    await page.evaluate(({start,run,pof})=>scrollTo({top:start+run*pof,behavior:'instant'}),{...range,pof});
    await page.waitForFunction(({selector,pof,key})=>Math.abs(Number(document.querySelector(selector).dataset[key==='portal'?'storyProgress':'sceneProgress'])-pof)<.003,{selector,pof,key});
    const state=await root.evaluate((el,key)=>({transform:getComputedStyle(el.querySelector(key==='portal'?'.hero-portal':'.finish-echo--dark')).transform,opacity:getComputedStyle(el.querySelector(key==='portal'?'.hero-intro':'.finish-echo--dark')).opacity,overflow:document.documentElement.scrollWidth>innerWidth}),key);
    assert.equal(state.overflow,false);
    if(key==='finish')assert.equal(state.opacity,'1','Finishes stay opaque');
    frames.push({progress:pof,...state});
    if(width===390||width===1440&&height===900)await page.screenshot({path:`${out}/${key}-${width}-${String(frames.length-1).padStart(2,'0')}.png`});
   }
   assert.equal(frames[0].transform,frames.at(-1).transform,'Same scroll position reconstructs same geometry');
   assert.notEqual(frames[0].transform,frames[6].transform,'Scroll changes actual geometry');
   results.push({width,height,key,range,frames});
  }
  if(width<=900){
   const scene=page.locator('#acabados');
   await scene.evaluate(el=>scrollTo({top:Number(el.dataset.scrollStart)+Number(el.dataset.scrollRun),behavior:'instant'}));
   await page.getByRole('button',{name:'Antracita',exact:true}).click();
   assert.equal(await scene.getAttribute('data-finish-focus'),'anthracite');
   await page.screenshot({path:`${out}/focus-${width}.png`});
  }
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.waitForFunction(()=>!document.querySelector('[data-portal-story]').classList.contains('story-live'));
  assert(await page.locator('[data-portal-story]').evaluate(el=>el.offsetHeight<=innerHeight));
  assert.equal(await page.locator('#acabados').getAttribute('data-scene-state'),'rest');
  if(width<=900)assert((await page.locator('[data-hero-image]').getAttribute('src')).includes('studio-anthracite'),'Reduced motion retains the chosen finish');
  await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
  await page.screenshot({path:`${out}/reduced-${width}.png`});
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.waitForFunction(()=>document.querySelector('[data-portal-story]').classList.contains('story-live'));
  await page.getByRole('link',{name:'Explorar ventanas',exact:true}).click();
  assert.equal(new URL(page.url()).hash,'#ventanas');
  await page.waitForFunction(()=>Math.abs(document.querySelector('#ventanas').getBoundingClientRect().top-210)<3||Math.abs(document.querySelector('#ventanas').getBoundingClientRect().top-90)<3);
  const video=page.video();await context.close();
  if(video)await video.saveAs(`${out}/review-${width}.webm`);
 }
 const nojs=await browser.newPage({viewport:{width:390,height:844},javaScriptEnabled:false});await nojs.goto('http://127.0.0.1:3006/',{waitUntil:'networkidle'});
 assert(await nojs.locator('[data-portal-story]').evaluate(el=>el.offsetHeight<=innerHeight));
 assert(await nojs.getByRole('link',{name:'Explorar ventanas',exact:true}).isVisible());
 assert.deepEqual(errors,[]);await fs.writeFile(`${out}/revision.json`,JSON.stringify({results,errors,environment:'Chrome emulado; no acredita teléfono físico'},null,2));
 console.log(JSON.stringify({sizes:5,scenes:results.length,errors}));
}finally{await browser.close();}
