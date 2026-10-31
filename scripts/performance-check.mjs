import lighthouse from 'lighthouse';
import {launch} from 'chrome-launcher';
import fs from 'node:fs/promises';
const base=process.env.TEST_URL||'http://127.0.0.1:3006';
const chrome=await launch({chromePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',chromeFlags:['--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check']});
let summary=[];await fs.mkdir('verificacion',{recursive:true});
try{summary=JSON.parse(await fs.readFile('verificacion/rendimiento.json','utf8')).results;}catch{}
const selected=process.argv.slice(2);
try{for(const [slug,route]of [['inicio','/'],['cotizador','/cotizador/'],['guia','/blog/pvc-y-termopanel/']].filter(([slug])=>!selected.length||selected.includes(slug))){
 const result=await lighthouse(base+route,{port:chrome.port,logLevel:'error',output:'json',onlyCategories:['performance','accessibility','best-practices','seo'],formFactor:'mobile'});
 if(!result||result.lhr.runtimeError)throw Error(JSON.stringify(result?.lhr.runtimeError));
 await fs.writeFile(`verificacion/lighthouse-${slug}.json`,result.report);
 const audits=result.lhr.audits;
 const row={route,scores:Object.fromEntries(Object.entries(result.lhr.categories).map(([k,v])=>[k,Math.round(v.score*100)])),metrics:Object.fromEntries(['first-contentful-paint','largest-contentful-paint','total-blocking-time','cumulative-layout-shift','speed-index'].map(k=>[k,{value:audits[k].numericValue,display:audits[k].displayValue}])),issues:Object.entries(audits).filter(([k,v])=>v.score!==null&&v.score<1&&v.details?.items?.length).map(([k,v])=>({id:k,title:v.title,score:v.score,display:v.displayValue,items:v.details.items.slice(0,5)}))};
 row.testedAt=new Date().toISOString();summary=summary.filter(r=>r.route!==route);summary.push(row);console.log(JSON.stringify({route,scores:row.scores,metrics:row.metrics}));
}}finally{await chrome.kill();await fs.writeFile('verificacion/rendimiento.json',JSON.stringify({date:new Date().toISOString(),environment:'Lighthouse móvil con throttling simulado, Chrome headless en localhost. No son datos de campo ni prueba en teléfono físico.',results:summary},null,2));}

