import {chromium} from 'playwright';
import fs from 'node:fs/promises';
const out='diseno/evidencias-baufens-oct23';
await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'no-preference'});
const page=await context.newPage();
await page.goto('https://baufens.ba/en/',{waitUntil:'domcontentloaded',timeout:60000});
await page.waitForTimeout(7500);
if(await page.locator('#awb-oc-11861 .off-canvas-close').isVisible())await page.locator('#awb-oc-11861 .off-canvas-close').click();
await page.waitForTimeout(1000);
const closers=await page.evaluate(()=>Array.from(document.querySelectorAll('button,[role="button"]')).filter(e=>e.getBoundingClientRect().width&&e.getBoundingClientRect().height).map(e=>({tag:e.tagName,id:e.id,cls:e.className,label:e.getAttribute('aria-label'),title:e.title,text:e.innerText?.slice(0,70)})));
await fs.writeFile(`${out}/visible-controls.json`,JSON.stringify(closers,null,2));
await page.screenshot({path:`${out}/desktop-base.png`});
await fs.writeFile(`${out}/desktop-dom.html`,await page.content());
const state=await page.evaluate(()=>({hero:Array.from(document.querySelectorAll('sr7-module, sr7-content, sr7-img, sr7-txt, sr7-shp, [data-motion-effects]')).map(e=>({tag:e.tagName,id:e.id,cls:e.className,style:e.getAttribute('style'),html:e.outerHTML.slice(0,900),box:JSON.parse(JSON.stringify(e.getBoundingClientRect()))})),animations:document.getAnimations().map(a=>({target:a.effect?.target?.id,name:a.animationName,state:a.playState,duration:a.effect?.getComputedTiming?.().duration}))}));
await fs.writeFile(`${out}/desktop-inspect.json`,JSON.stringify(state,null,2));
const measures=[];
async function sample(label){const v=await page.evaluate(()=>({scrollY,mouse:Array.from(document.querySelectorAll('.sr-mousetrap')).map(e=>({style:e.getAttribute('style'),transform:getComputedStyle(e).transform,box:JSON.parse(JSON.stringify(e.getBoundingClientRect()))})),motion:Array.from(document.querySelectorAll('[data-motion-effects]')).map(e=>({style:e.getAttribute('style'),transform:getComputedStyle(e).transform,box:JSON.parse(JSON.stringify(e.getBoundingClientRect()))})),canvas:Array.from(document.querySelectorAll('canvas')).map(e=>({id:e.id,cls:e.className,w:e.width,h:e.height,box:JSON.parse(JSON.stringify(e.getBoundingClientRect()))}))}));measures.push({label,...v});await page.screenshot({path:`${out}/${label}.png`});}
await page.mouse.move(100,500);await page.waitForTimeout(600);await sample('hover-left');
await page.mouse.move(1300,500);await page.waitForTimeout(600);await sample('hover-right');
await page.mouse.move(350,650);await page.waitForTimeout(600);await sample('hover-text');
for(const y of [1050,1400,1700,2050,2400]){await page.evaluate(y=>scrollTo(0,y),y);await page.waitForTimeout(1500);await sample(`scroll-${y}`);}
await fs.writeFile(`${out}/motion-measures.json`,JSON.stringify(measures,null,2));
const mobile=await context.newPage();await mobile.setViewportSize({width:390,height:844});await mobile.goto('https://baufens.ba/en/',{waitUntil:'domcontentloaded',timeout:60000});await mobile.waitForTimeout(7500);if(await mobile.locator('#awb-oc-11861 .off-canvas-close').isVisible())await mobile.locator('#awb-oc-11861 .off-canvas-close').click();await mobile.waitForTimeout(1000);await mobile.screenshot({path:`${out}/mobile-base.png`});await fs.writeFile(`${out}/mobile-dom.html`,await mobile.content());
for(const y of [650,1100,1500,1900]){await mobile.evaluate(y=>scrollTo(0,y),y);await mobile.waitForTimeout(1500);await mobile.screenshot({path:`${out}/mobile-scroll-${y}.png`});}
console.log(JSON.stringify({closers,measures},null,2));
await browser.close();
