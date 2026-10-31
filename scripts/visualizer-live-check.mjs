// Explicit real-provider test: exactly one generation from the browser UI.
// Never included in npm test or the mocked browser suites.
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import sharp from 'sharp';
if(process.env.STARWIN_ALLOW_LIVE_IMAGE_TEST!=='1')throw Error('La prueba real requiere autorización explícita mediante STARWIN_ALLOW_LIVE_IMAGE_TEST=1.');
const base=process.env.TEST_URL||'http://127.0.0.1:3006';
const advertised=await fetch(base+'/api/visualizations/config').then(r=>r.json());
if(!advertised.available)throw Error('Configura la credencial propia y reinicia el servidor antes de la prueba real.');
const out=process.env.LIVE_TEST_OUTPUT||(advertised.providerName?.includes('Cloudflare')?'verificacion/cloudflare-live':advertised.costMode==='free'?'verificacion/qwen-live':'verificacion/nano-banana-live');await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,acceptDownloads:true});
const page=await context.newPage();const report={date:new Date().toISOString(),model:advertised.providerName||advertised.provider,input:'public/images/scene-sala-1200.webp',selection:{model:'sliding2',finish:'ANTRACITA'},postCount:0,browserErrors:[]};let generation=null;
page.on('pageerror',error=>report.browserErrors.push(error.message));
page.on('request',request=>{if(new URL(request.url()).pathname==='/api/visualizations'&&request.method()==='POST')report.postCount++;});
try{
 await page.goto(base+'/visualizador/',{waitUntil:'networkidle'});await page.waitForFunction(()=>!!document.querySelector('.visualizer-availability')?.textContent&&!document.querySelector('.visualizer-availability')?.textContent?.includes('Comprobando'));
 await page.locator('input[type=file]').setInputFiles(report.input);await page.locator('#viz-model').selectOption('sliding2');await page.locator('#viz-finish').selectOption('ANTRACITA');await page.getByRole('checkbox').check();await page.screenshot({path:out+'/foto-preparada-390.png',fullPage:true});
 const started=Date.now();const responsePromise=page.waitForResponse(response=>new URL(response.url()).pathname==='/api/visualizations'&&response.request().method()==='POST');await page.getByRole('button',{name:'Generar propuesta',exact:true}).click();const response=await responsePromise;generation=await response.json();report.initialHttpStatus=response.status();assert(response.ok(),JSON.stringify(generation));assert(generation.jobId);report.jobId=generation.jobId;
 await page.waitForFunction(()=>{const result=[...document.querySelectorAll('button')].some(button=>button.textContent==='Propuesta IA');const failure=document.querySelector('.photo-error');return result||!!failure?.textContent;},null,{timeout:270000});
 const statusResponse=await context.request.get(base+'/api/visualizations/'+generation.jobId);const status=await statusResponse.json();report.finalStatus=status.status;report.durationMs=Date.now()-started;report.result=status.result;report.error=status.error;
 assert.equal(status.status,'ready',status.error?.message||'No se obtuvo la imagen.');assert.equal(report.postCount,1);
 const resultImage=page.locator('.photo-stage>img');await resultImage.evaluate(img=>img.decode());assert.equal(await page.getByRole('button',{name:'Propuesta IA',exact:true}).getAttribute('aria-pressed'),'true');
 await page.screenshot({path:out+'/resultado-real-390.png',fullPage:true});const download=page.waitForEvent('download');await page.getByRole('button',{name:'Descargar imagen',exact:false}).click();await(await download).saveAs(out+'/propuesta-real.jpg');const metadata=await sharp(out+'/propuesta-real.jpg').metadata();assert(metadata.width>=512&&metadata.height>=512);report.download={format:metadata.format,width:metadata.width,height:metadata.height};
 await page.getByRole('button',{name:'Original',exact:true}).click();assert((await resultImage.getAttribute('src')).startsWith('blob:'));await page.getByRole('button',{name:'Propuesta IA',exact:true}).click();assert((await resultImage.getAttribute('src')).startsWith('/api/visualizations/'));
 await page.setViewportSize({width:1440,height:1000});await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.screenshot({path:out+'/resultado-real-1440.png',fullPage:true});
 const other=await browser.newContext();const denied=await other.request.get(base+status.result.url);assert.equal(denied.status(),404);await other.close();report.privateAccessVerified=true;
 await page.getByRole('button',{name:'Borrar foto y resultado',exact:true}).click();await page.locator('.photo-stage>img').waitFor({state:'detached'});assert.equal((await context.request.get(base+status.result.url)).status(),404);report.deletionVerified=true;assert.deepEqual(report.browserErrors,[]);report.success=true;
}catch(error){report.success=false;report.failure=String(error);await page.screenshot({path:out+'/error.png',fullPage:true});throw error;}finally{await fs.writeFile(out+'/report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));await browser.close();}
