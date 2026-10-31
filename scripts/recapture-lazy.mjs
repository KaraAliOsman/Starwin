import {chromium} from 'playwright';
const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const c=await b.newContext({viewport:{width:390,height:844}});const p=await c.newPage();
for(const route of ['/ventanas/corredera-pro70/','/blog/']){
 await p.goto('http://127.0.0.1:3006'+route,{waitUntil:'networkidle'});await p.evaluate(()=>document.fonts.ready);
 for(const img of await p.locator('img').all())if(await img.isVisible()){await img.scrollIntoViewIfNeeded();await img.evaluate(img=>img.decode());}
 await p.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await p.screenshot({path:`.impeccable/review/${route.split('/').filter(Boolean).join('-')}-390.png`,fullPage:true});
 console.log({route,images:await p.locator('img').evaluateAll(imgs=>imgs.map(i=>({src:i.currentSrc,complete:i.complete,naturalWidth:i.naturalWidth}))) });
}
await b.close();
