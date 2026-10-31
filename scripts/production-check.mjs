import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const base='https://starwinpvc.cl';
await fs.mkdir('verificacion/produccion',{recursive:true});
let home;
for(let attempt=0;attempt<45;attempt++){
 const response=await fetch(base+'/',{headers:{'Cache-Control':'no-cache'}});home=await response.text();
 if(home.includes('en todo el Biobío.')&&home.includes('patagonia-chilena'))break;
 if(attempt===44)throw Error('La publicación nueva todavía no responde en el dominio.');
 await new Promise(resolve=>setTimeout(resolve,2000));
}
assert(home.includes('<title>Ventanas de PVC en Biobío y Concepción | Starwin</title>'));
const report={date:new Date().toISOString(),checks:[]};
for(const route of ['/','/ventanas-pvc-biobio/','/ventanas/corredera-pro70/','/cotizador/','/visualizador/','/contacto/','/robots.txt','/sitemap-index.xml','/sitemap-0.xml','/llms.txt']){
 const response=await fetch(base+route),body=await response.text();assert.equal(response.status,200,route);assert(!response.headers.get('x-robots-tag')?.includes('noindex'),route+' must be indexable except API');
 if(route==='/robots.txt')assert(body.includes('Sitemap: https://starwinpvc.cl/sitemap-index.xml'));
 if(route==='/ventanas-pvc-biobio/')for(const city of ['Concepción','Los Ángeles','Arauco','Tirúa','Alto Biobío'])assert(body.includes(city));
 report.checks.push({route,status:response.status});
}
for(const [from,to]of [['/configurador.html','/cotizador/'],['/productos.html','/ventanas/'],['/sitemap.xml','/sitemap-index.xml']]){
 const response=await fetch(base+from,{redirect:'manual'});assert.equal(response.status,301,from);assert.equal(new URL(response.headers.get('location'),base).pathname,to);report.checks.push({redirect:from,to,status:301});
}
const www=await fetch('https://www.starwinpvc.cl/',{redirect:'manual'});assert.equal(www.status,301);assert.equal(www.headers.get('location'),base+'/');
report.wwwRedirect=true;
const config=await(await fetch(base+'/api/visualizations/config')).json();assert.equal(config.available,true);assert(config.providerName.includes('Cloudflare'));report.visualizer=config.providerName;
await fs.writeFile('verificacion/produccion/revision.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
