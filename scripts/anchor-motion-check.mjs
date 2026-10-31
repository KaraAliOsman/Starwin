import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 await page.goto('http://127.0.0.1:3006/?v=anchor#acabados',{waitUntil:'networkidle'});
 await page.evaluate(async()=>{for(let i=0;i<75;i++)await new Promise(requestAnimationFrame);});
 const fragment=await page.locator('#acabados').evaluate(el=>({name:'fragment',top:el.getBoundingClientRect().top,y:scrollY,state:el.dataset.sceneState,hash:location.hash}));
 assert(Math.abs(fragment.top-100)<3,'La escena no debe interrumpir el desplazamiento del enlace directo.');console.log(JSON.stringify(fragment));
 await page.goto('http://127.0.0.1:3006/',{waitUntil:'networkidle'});
 await page.getByRole('link',{name:'Explorar ventanas',exact:true}).click();
 await page.waitForFunction(()=>Math.abs(document.querySelector('#ventanas').getBoundingClientRect().top-210)<3);
 const explore=await page.locator('#ventanas').evaluate(el=>({name:'explore',top:el.getBoundingClientRect().top,y:scrollY,hash:location.hash}));
 assert(Math.abs(explore.top-210)<3,'Explorar debe llegar a la colección con el margen de navegación.');console.log(JSON.stringify(explore));
}finally{await browser.close();}
