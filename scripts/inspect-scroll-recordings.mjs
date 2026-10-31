import {chromium} from 'playwright';
import fs from 'node:fs/promises';
const out='verificacion/scroll-stories';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{
 for(const width of [1440,390]){
  const height=width===390?844:900;
  const page=await browser.newPage({viewport:{width,height}});
  const bytes=await fs.readFile(`${out}/recorrido-${width}.webm`);
  await page.setContent(`<style>body{margin:0}video{display:block;width:100vw;height:100vh}</style><video muted src="data:video/webm;base64,${bytes.toString('base64')}"></video>`);
  await page.locator('video').evaluate(video=>new Promise(resolve=>{if(video.readyState>=2)resolve();else video.addEventListener('loadeddata',resolve,{once:true});}));
  for(const time of [2.2,3.8,10.8]){
   await page.locator('video').evaluate((video,time)=>new Promise(resolve=>{video.addEventListener('seeked',resolve,{once:true});video.currentTime=time;}),time);
   await page.screenshot({path:`${out}/video-${width}-${time}.png`});
  }
  await page.close();
 }
 console.log('Seis fotogramas extraídos de las grabaciones reales del navegador.');
}finally{await browser.close();}
