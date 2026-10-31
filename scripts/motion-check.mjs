import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const out='diseno/animaciones-starwin';await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const context=await browser.newContext({viewport:{width:1440,height:1000}});
const page=await context.newPage(),errors=[],requests=[];
page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push(r.url()));
const report={date:new Date().toISOString(),desktop:{},mobile:{},reduced:{},errors};
async function open(target=page){await target.goto('http://127.0.0.1:3006/',{waitUntil:'networkidle'});await target.evaluate(()=>document.fonts.ready);await target.locator('.hero-window').evaluate(img=>img.decode());await target.waitForTimeout(1400);}
async function objectTransform(target=page){return target.locator('.hero-window-parallax').evaluate(el=>getComputedStyle(el).transform);}
try{
 await open();
 report.desktop.noHeavyToolsInitially=!requests.some(url=>/Window3D|Estimator|jspdf|three\.|react-dom/.test(url));assert(report.desktop.noHeavyToolsInitially);
 await page.mouse.move(100,400);await page.waitForTimeout(400);report.desktop.left=await objectTransform();await page.screenshot({path:out+'/desktop-pointer-left.png'});
 await page.mouse.move(1340,400);await page.waitForTimeout(400);report.desktop.right=await objectTransform();await page.screenshot({path:out+'/desktop-pointer-right.png'});assert.notEqual(report.desktop.left,report.desktop.right);
 await page.getByRole('button',{name:'Acabado Antracita',exact:true}).click();await page.waitForFunction(()=>document.querySelector('.hero-window').src.includes('anthracite'));assert.equal(await page.getByRole('button',{name:'Acabado Antracita',exact:true}).getAttribute('aria-pressed'),'true');
 await page.getByRole('button',{name:'Acabado Roble',exact:true}).click();await page.waitForFunction(()=>document.querySelector('.hero-window').src.includes('oak'));await page.waitForTimeout(300);await page.screenshot({path:out+'/desktop-oak.png'});report.desktop.finishes='Blanco, Antracita y Roble: selección e imagen coherentes.';
 await page.getByRole('button',{name:'Acabado Antracita',exact:true}).click();await page.getByRole('button',{name:'Acabado Blanco',exact:true}).click();await page.waitForFunction(()=>document.querySelector('.hero-window').src.includes('white'));assert.equal(await page.getByRole('button',{name:'Acabado Blanco',exact:true}).getAttribute('aria-pressed'),'true');report.desktop.interruption='La última selección rápida prevalece.';
 for(const [label,id] of [['El vidrio',1],['El herraje',2],['El perfil',0]]){await page.getByRole('button',{name:label,exact:true}).click();await page.locator('#material-'+id).waitFor({state:'visible'});await page.waitForTimeout(320);await page.screenshot({path:out+'/material-'+id+'.png'});}
 const cut=page.locator('.material-cutaway img');await page.evaluate(()=>scrollTo({top:800,behavior:'instant'}));await page.waitForTimeout(400);report.desktop.materialBefore=await cut.evaluate(el=>getComputedStyle(el).transform);await page.evaluate(()=>scrollTo({top:1250,behavior:'instant'}));await page.waitForTimeout(400);report.desktop.materialAfter=await cut.evaluate(el=>getComputedStyle(el).transform);assert.notEqual(report.desktop.materialBefore,report.desktop.materialAfter);
 await page.getByRole('button',{name:'Abatible',exact:true}).focus();await page.keyboard.press('Enter');await page.locator('#opening-1').waitFor({state:'visible'});report.desktop.keyboardAnimations=await page.locator('#opening-1').evaluate(el=>el.getAnimations().length);assert.equal(report.desktop.keyboardAnimations,0);
 const mobileContext=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const mp=await mobileContext.newPage();
 await open(mp);report.mobile.start=await objectTransform(mp);report.mobile.finePointer=await mp.evaluate(()=>matchMedia('(hover:hover) and (pointer:fine)').matches);assert.equal(report.mobile.finePointer,false);
 await mp.evaluate(()=>scrollTo({top:160,behavior:'instant'}));await mp.waitForTimeout(400);report.mobile.scroll=await objectTransform(mp);assert.notEqual(report.mobile.start,report.mobile.scroll);await mp.screenshot({path:out+'/mobile-scroll.png'});
 await mp.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await mp.waitForTimeout(400);report.mobile.return=await objectTransform(mp);assert.equal(report.mobile.start,report.mobile.return);
 await mp.emulateMedia({reducedMotion:'reduce'});await open(mp);report.reduced.transform=await objectTransform(mp);report.reduced.animations=await mp.evaluate(()=>document.getAnimations().length);assert.equal(report.reduced.transform,'none');assert.equal(report.reduced.animations,0);await mp.screenshot({path:out+'/mobile-reduced.png'});
 await mp.getByRole('button',{name:'Acabado Roble',exact:true}).click();await mp.waitForFunction(()=>document.querySelector('.hero-window').src.includes('oak'));assert.equal(await mp.locator('.hero-window').evaluate(el=>el.getAnimations().length),0);await mobileContext.close();
 const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});const np=await nojs.newPage();await np.goto('http://127.0.0.1:3006/',{waitUntil:'networkidle'});report.noJS={h1:await np.locator('h1').innerText(),contact:await np.locator('.hero-contact .btn').isVisible(),hiddenControls:!await np.locator('.material-tabs').isVisible()};assert(report.noJS.contact&&report.noJS.hiddenControls);await nojs.close();
  await page.goto('http://127.0.0.1:3006/',{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);await page.locator('.hero-window').evaluate(img=>img.decode());
 for(const time of [200,700,1200]){await page.evaluate(t=>document.getAnimations().filter(a=>a instanceof CSSAnimation).forEach(a=>{a.pause();a.currentTime=t;}),time);await page.screenshot({path:out+'/entrance-'+time+'.png'});}
 report.entranceFrames=[200,700,1200];
 assert.deepEqual(errors,[]);await fs.writeFile(out+'/motion-check.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}finally{await browser.close();}

