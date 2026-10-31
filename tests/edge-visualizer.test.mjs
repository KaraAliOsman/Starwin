import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {build} from 'esbuild';
import fs from 'node:fs/promises';
import sharp from 'sharp';
const bundled=await build({entryPoints:['worker/visualizer.mjs'],bundle:true,write:false,format:'esm',platform:'node',plugins:[{name:'cloudflare-test-state',setup(b){b.onResolve({filter:/^cloudflare:workers$/},()=>({path:'cloudflare:workers',namespace:'test'}));b.onLoad({filter:/.*/,namespace:'test'},()=>({contents:'export class DurableObject {constructor(ctx,env){this.ctx=ctx;this.env=env;}}'}));}}]});
const module=await import('data:text/javascript;base64,'+Buffer.from(bundled.outputFiles[0].text).toString('base64'));
function state(){const db=new DatabaseSync(':memory:'),tasks=[];return {tasks,storage:{sql:{exec(query,...args){args=args.map(value=>value instanceof ArrayBuffer?new Uint8Array(value):value);const stmt=db.prepare(query),rows=stmt.columns().length?stmt.all(...args):(stmt.run(...args),[]);return {toArray:()=>rows};}},transactionSync(fn){db.exec('BEGIN');try{const r=fn();db.exec('COMMIT');return r;}catch(e){db.exec('ROLLBACK');throw e;}},setAlarm:async()=>{}},waitUntil(p){tasks.push(p);}};}
const photo=await sharp({create:{width:480,height:360,channels:3,background:'#d9e4e8'}}).jpeg().toBuffer();
function setup(){const budget=new module.GenerationBudget(state(),{}),sessions=new Map();let calls=0;const env={VISUALIZER_ENABLED:'true',AI:{async run(model,input){calls++;assert.equal(model,'@cf/black-forest-labs/flux-2-klein-4b');assert(input.multipart.body);return {image:photo.toString('base64')};}},VISUALIZER_BUDGET:{getByName:()=>budget}};env.VISUALIZER_SESSIONS={getByName(name){if(!sessions.has(name)){const ctx=state();sessions.set(name,{ctx,object:new module.VisualizationSession(ctx,env)});}return sessions.get(name).object;}};return {env,sessions,calls:()=>calls};}
async function session(s){const r=await module.default.fetch(new Request('https://starwinpvc.cl/api/visualizations/config'),s.env);assert.equal(r.status,200);return r.headers.get('set-cookie').split(';')[0];}
function request(path,cookie,options={}){return new Request('https://starwinpvc.cl/api/visualizations'+path,{...options,headers:{cookie,Origin:'https://starwinpvc.cl',...options.headers}});}
function submission(cookie,key='operation_123456789'){const form=new FormData();form.set('photo',new Blob([photo],{type:'image/jpeg'}),'window.jpg');form.set('model','fixed');form.set('finish','ANTRACITA');form.set('consent','true');return request('',cookie,{method:'POST',headers:{'idempotency-key':key},body:form});}
test('Producción: edición real por binding, trabajo durable, idempotencia, privacidad de sesión y borrado',async()=>{
 const s=setup(),cookie=await session(s),other=await session(s);
 const post=await module.default.fetch(submission(cookie),s.env);assert.equal(post.status,202);const job=await post.json();
 for(const {ctx}of s.sessions.values())await Promise.all(ctx.tasks);
 const ready=await(await module.default.fetch(request('/'+job.jobId,cookie),s.env)).json();assert.equal(ready.status,'ready');
 assert.equal((await module.default.fetch(request('/'+job.jobId,other),s.env)).status,404);
 const image=await module.default.fetch(request('/'+job.jobId+'/image',cookie),s.env);assert.equal(image.headers.get('cache-control'),'private, no-store');assert.equal(image.headers.get('content-type'),'image/jpeg');
 await module.default.fetch(submission(cookie),s.env);assert.equal(s.calls(),1);
 assert.equal((await module.default.fetch(request('/'+job.jobId,cookie,{method:'DELETE'}),s.env)).status,200);
 assert.equal((await module.default.fetch(request('/'+job.jobId+'/image',cookie),s.env)).status,404);
 assert.equal((await module.default.fetch(submission(cookie),s.env)).status,410);assert.equal(s.calls(),1);
});
test('Producción: cupo persiste tras borrar, presupuesto global y rechazo de origen cruzado',async()=>{
 const s=setup(),cookie=await session(s);
 for(let i=0;i<3;i++){const r=await module.default.fetch(submission(cookie,`operation_1234567_${i}`),s.env),j=await r.json();for(const {ctx}of s.sessions.values())await Promise.all(ctx.tasks);await module.default.fetch(request('/'+j.jobId,cookie,{method:'DELETE'}),s.env);}
 assert.equal((await module.default.fetch(submission(cookie,'operation_1234567_9'),s.env)).status,429);
 const budget=new module.GenerationBudget(state(),{});for(let i=0;i<30;i++)assert.equal(budget.reserve('job-'+i),true);assert.equal(budget.reserve('job-30'),false);assert.equal(budget.reserve('job-0'),true);
 assert.equal((await module.default.fetch(new Request('https://starwinpvc.cl/api/visualizations/config',{headers:{Origin:'https://other.example'}}),s.env)).status,403);
});
