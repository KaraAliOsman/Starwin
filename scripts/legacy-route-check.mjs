import fs from 'node:fs/promises';
import assert from 'node:assert/strict';

const origin='https://starwinpvc.cl';
const rules=(await fs.readFile('public/_redirects','utf8')).split(/\r?\n/)
  .map(line=>line.trim()).filter(line=>line&&!line.startsWith('#')).map(line=>line.split(/\s+/));
const results=[];
for(let start=0;start<rules.length;start+=6){
  const batch=await Promise.all(rules.slice(start,start+6).map(async([from,to,status])=>{
    const response=await fetch(origin+from,{redirect:'manual',signal:AbortSignal.timeout(20000),headers:{'Cache-Control':'no-cache'}});
    const actual=response.headers.get('location');
    return {from,to,status:response.status,expectedStatus:Number(status),location:actual,
      correct:response.status===Number(status)&&actual!==null&&new URL(actual,origin).href===new URL(to,origin).href};
  }));
  results.push(...batch);
}
const failures=results.filter(result=>!result.correct);
await fs.mkdir('verificacion/seo-nov01',{recursive:true});
await fs.writeFile('verificacion/seo-nov01/redirecciones-publicadas.json',JSON.stringify({date:new Date().toISOString(),origin,total:results.length,failures,results},null,2));
console.log(JSON.stringify({total:results.length,correct:results.length-failures.length,failures},null,2));
assert.equal(failures.length,0,'Hay rutas históricas que aún no redirigen al destino publicado.');
