import {DurableObject} from 'cloudflare:workers';
import {Buffer} from 'node:buffer';
import jpeg from 'jpeg-js';
import {WINDOW_MODELS,FINISHES,buildEditPrompt,inspectRaster,readBoundedBytes,VisualizerError} from '../scripts/visualizer-core.mjs';
globalThis.Buffer=Buffer;
const COOKIE='starwin_visualizer',DAY=86400000,MODEL='@cf/black-forest-labs/flux-2-klein-4b';
const headers={'Content-Type':'application/json; charset=utf-8','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','X-Robots-Tag':'noindex, nofollow','Vary':'Cookie, Origin'};
const json=(value,status=200,extra={})=>new Response(JSON.stringify(value),{status,headers:{...headers,...extra}});
const error=(code,message,status=422)=>json({error:{code,message},message},status);
const first=cursor=>cursor.toArray()[0];
const cookie=request=>request.headers.get('cookie')?.split(';').map(s=>s.trim()).find(s=>s.startsWith(COOKIE+'='))?.slice(COOKIE.length+1);
const publicJob=job=>({jobId:job.id,status:job.status,model:job.model,finish:job.finish,expiresAt:new Date(job.expires).toISOString(),result:job.status==='ready'?{url:`/api/visualizations/${job.id}/image`,mimeType:job.mime}:null,error:job.error?{message:job.error}:null});

export default {
 async fetch(request,env){
  const url=new URL(request.url),origin=request.headers.get('origin');
  if(request.headers.get('sec-fetch-site')==='cross-site'||origin&&origin!==url.origin)return error('origin','Abre el visualizador desde Starwin.',403);
  if(!/^\/api\/visualizations(?:\/|$)/.test(url.pathname))return error('not_found','Ruta no disponible.',404);
  const config=url.pathname==='/api/visualizations/config';
  let session=cookie(request),fresh=false;
  if(!session||!/^[a-f\d-]{36}$/.test(session)){if(!config||request.method!=='GET')return error('session_required','Recarga el visualizador antes de generar.',request.method==='GET'?404:428);session=crypto.randomUUID();fresh=true;}
  const response=await env.VISUALIZER_SESSIONS.getByName(session).fetch(request);
  if(!fresh)return response;
  const next=new Headers(response.headers);next.set('Set-Cookie',`${COOKIE}=${session}; HttpOnly; Secure; SameSite=Strict; Path=/api/visualizations; Max-Age=86400`);
  return new Response(response.body,{status:response.status,headers:next});
 }
};

/** One object per browser session; persisted jobs survive isolate eviction. */
export class VisualizationSession extends DurableObject {
 constructor(ctx,env){super(ctx,env);this.running=new Map();ctx.storage.sql.exec('CREATE TABLE IF NOT EXISTS jobs (id TEXT PRIMARY KEY, operation TEXT UNIQUE, fingerprint TEXT, data TEXT, result BLOB, expires INTEGER)');ctx.storage.sql.exec('CREATE TABLE IF NOT EXISTS usage (created INTEGER)');}
 read(id){const row=first(this.ctx.storage.sql.exec('SELECT data FROM jobs WHERE id=?',id));return row?JSON.parse(row.data):null;}
 save(job,bytes=null){this.ctx.storage.sql.exec('UPDATE jobs SET data=?, result=COALESCE(?,result) WHERE id=?',JSON.stringify(job),bytes,job.id);}
 async alarm(){const now=Date.now();this.ctx.storage.sql.exec('DELETE FROM jobs WHERE expires<=?',now);this.ctx.storage.sql.exec('DELETE FROM usage WHERE created<=?',now-DAY);const row=first(this.ctx.storage.sql.exec('SELECT MIN(expires) AS next FROM jobs'));if(row?.next)await this.ctx.storage.setAlarm(row.next);}
 async fetch(request){
  try{
   const url=new URL(request.url),path=url.pathname.replace(/\/$/,'');
   if(path==='/api/visualizations/config')return json({available:Boolean(this.env.AI)&&this.env.VISUALIZER_ENABLED==='true',provider:'Cloudflare Workers AI',providerName:'FLUX.2 Klein · Cloudflare',costMode:'free',message:'Propuesta visual con cupo diario. No define medidas ni precios.',maxUploadBytes:12582912,normalizeMaxEdge:480,retentionHours:1,models:WINDOW_MODELS,finishes:FINISHES,sessionLimit:3});
   const match=path.match(/^\/api\/visualizations\/([a-f\d-]{36})(\/image)?$/);
   if(match){
    let job=this.read(match[1]);if(!job||job.status==='deleted'||job.expires<=Date.now())return error('not_found','La propuesta caducó o se eliminó.',404);
    if(request.method==='DELETE'&&!match[2]){this.running.get(job.id)?.abort();job.status='deleted';this.ctx.storage.sql.exec('UPDATE jobs SET data=?,result=NULL WHERE id=?',JSON.stringify(job),job.id);return json({deleted:true,message:'Foto y resultado eliminados de Starwin.'});}
    if(request.method!=='GET')return error('method','Método no permitido.',405);
    if(job.status==='generating'&&job.started<Date.now()-120000){job.status='failed';job.error='No se pudo confirmar el resultado. No repetimos la generación automáticamente.';this.save(job);}
    if(match[2]){if(job.status!=='ready')return error('not_ready','La propuesta aún no está disponible.',409);const row=first(this.ctx.storage.sql.exec('SELECT result FROM jobs WHERE id=?',job.id));return new Response(row.result,{headers:{...headers,'Content-Type':job.mime,'Content-Disposition':`inline; filename="Starwin-propuesta-${job.id}.jpg"`,'Cross-Origin-Resource-Policy':'same-origin'}});}
    return json(publicJob(job));
   }
   if(path!=='/api/visualizations'||request.method!=='POST')return error('method','Método no permitido.',405);
   if(this.env.VISUALIZER_ENABLED!=='true')return error('not_configured','El visualizador no está disponible en este momento.',503);
   const operation=request.headers.get('idempotency-key');if(!operation||!/^[A-Za-z\d_-]{16,100}$/.test(operation))return error('operation','Recarga la página para identificar la operación.',400);
   if(!request.headers.get('content-type')?.startsWith('multipart/form-data;'))return error('format','Selecciona una fotografía desde el visualizador.',415);
   const body=await readBoundedBytes(request,600000),form=await new Response(body,{headers:{'Content-Type':request.headers.get('content-type')}}).formData();
   const model=form.get('model'),finish=form.get('finish'),photo=form.get('photo');
   if(form.get('consent')!=='true')return error('consent','Autoriza el envío de tu foto para generar la propuesta.');
   if(!WINDOW_MODELS.some(x=>x.id===model)||!FINISHES.some(x=>x.id===finish))return error('selection','Elige una apertura y un acabado disponibles.');
   if(form.getAll('photo').length!==1||!photo||typeof photo==='string'||photo.type!=='image/jpeg')return error('photo','La foto debe prepararse como JPEG desde el visualizador.');
   const original=new Uint8Array(await photo.arrayBuffer()),meta=inspectRaster(original,{maxPixels:512*512,maxBytes:550000});
   if(meta.mimeType!=='image/jpeg'||meta.width>480||meta.height>480)return error('photo_size','Vuelve a seleccionar la foto para prepararla con el tamaño correcto.');
   const hash=new Uint8Array(await crypto.subtle.digest('SHA-256',original)),fingerprint=Array.from(hash,b=>b.toString(16).padStart(2,'0')).join('')+model+finish;
   const previous=first(this.ctx.storage.sql.exec('SELECT fingerprint,data FROM jobs WHERE operation=?',operation));
   if(previous){if(previous.fingerprint!==fingerprint)return error('operation_conflict','Esta operación corresponde a otra foto.',409);const job=JSON.parse(previous.data);if(job.status==='deleted')return error('deleted','Esta propuesta fue eliminada.',410);return json(publicJob(job),200);}
   this.ctx.storage.sql.exec('DELETE FROM usage WHERE created<=?',Date.now()-DAY);
   if(first(this.ctx.storage.sql.exec('SELECT COUNT(*) AS count FROM usage WHERE created>?',Date.now()-DAY)).count>=3)return error('session_quota','Alcanzaste el cupo de hoy. Puedes consultar a Starwin por WhatsApp.',429);
   if(first(this.ctx.storage.sql.exec("SELECT COUNT(*) AS count FROM jobs WHERE json_extract(data,'$.status')='generating' AND expires>?",Date.now())).count)return error('session_busy','Tu propuesta ya se está procesando.',429);
   // Decode and re-encode before transfer: reject invalid JPEG and remove metadata.
   let normalized;try{const decoded=jpeg.decode(original,{useTArray:true,maxResolutionInMP:1,maxMemoryUsageInMB:24});normalized=new Uint8Array(jpeg.encode(decoded,82).data);}catch{return error('invalid_image','No se pudo leer la foto. Vuelve a seleccionarla.');}
   const job={id:crypto.randomUUID(),status:'generating',model,finish,started:Date.now(),expires:Date.now()+3600000,error:null};
   const reserved=this.ctx.storage.transactionSync(()=>{const old=first(this.ctx.storage.sql.exec('SELECT data FROM jobs WHERE operation=?',operation));if(old)return JSON.parse(old.data);this.ctx.storage.sql.exec('INSERT INTO jobs VALUES(?,?,?,?,NULL,?)',job.id,operation,fingerprint,JSON.stringify(job),job.expires);this.ctx.storage.sql.exec('INSERT INTO usage VALUES(?)',Date.now());return null;});
   if(reserved)return json(publicJob(reserved));
   await this.ctx.storage.setAlarm(job.expires);
   const controller=new AbortController();this.running.set(job.id,controller);
   this.ctx.waitUntil(this.generate(job,normalized,meta,controller).finally(()=>this.running.delete(job.id)));
   return json({...publicJob(job),statusUrl:`/api/visualizations/${job.id}`},202);
  }catch(e){console.warn(JSON.stringify({event:'visualizer_request_failed',code:e instanceof VisualizerError?e.code:'request_error'}));return error(e instanceof VisualizerError?e.code:'request_error',e instanceof VisualizerError?e.message:'No se pudo preparar la foto. Vuelve a seleccionarla.',e instanceof VisualizerError?e.status:500);}
 }
 async generate(job,bytes,meta,controller){
  try{
   const granted=await this.env.VISUALIZER_BUDGET.getByName('daily-budget').reserve(job.id);
   if(!granted)throw Error('Se alcanzó el cupo diario. Vuelve mañana o consulta tu proyecto con Starwin.');
   if(!this.read(job.id)||this.read(job.id).status==='deleted'||controller.signal.aborted)return;
   const form=new FormData();form.append('input_image_0',new Blob([bytes],{type:'image/jpeg'}),'window.jpg');form.append('prompt','Edit image 0. '+buildEditPrompt(job.model,job.finish));
   const width=meta.width>=meta.height?768:Math.max(256,Math.round(768*meta.width/meta.height/16)*16),height=meta.height>=meta.width?768:Math.max(256,Math.round(768*meta.height/meta.width/16)*16);
   form.append('width',String(width));form.append('height',String(height));form.append('seed','42');
   const encoded=new Response(form),result=await this.env.AI.run(MODEL,{multipart:{body:encoded.body,contentType:encoded.headers.get('content-type')}});
   if(!result?.image)throw Error('El proveedor no devolvió una imagen. Inténtalo más tarde.');
   const raw=atob(result.image),output=Uint8Array.from(raw,c=>c.charCodeAt(0));const inspected=inspectRaster(output,{maxPixels:2000000,maxBytes:3000000});
   if(!this.read(job.id)||this.read(job.id).status==='deleted'||controller.signal.aborted)return;
   job.status='ready';job.mime=inspected.mimeType;this.save(job,output.buffer);
  }catch(e){if(!this.read(job.id)||this.read(job.id).status==='deleted'||controller.signal.aborted)return;job.status='failed';job.error=/cupo diario|proveedor no devolvió/.test(e.message)?e.message:'No se pudo generar esta propuesta. No se repetirá automáticamente; inténtalo más tarde.';this.save(job);console.warn(JSON.stringify({event:'visualizer_generation_failed',jobId:job.id}));}
 }
}

/** One coordination atom for the site's daily generation budget. */
export class GenerationBudget extends DurableObject {
 constructor(ctx,env){super(ctx,env);ctx.storage.sql.exec('CREATE TABLE IF NOT EXISTS requests (id TEXT PRIMARY KEY, day TEXT)');}
 reserve(id){const day=new Date().toISOString().slice(0,10);return this.ctx.storage.transactionSync(()=>{this.ctx.storage.sql.exec('DELETE FROM requests WHERE day<>?',day);if(first(this.ctx.storage.sql.exec('SELECT id FROM requests WHERE id=?',id)))return true;const count=first(this.ctx.storage.sql.exec('SELECT COUNT(*) AS count FROM requests')).count;if(count>=30)return false;this.ctx.storage.sql.exec('INSERT INTO requests VALUES(?,?)',id,day);return true;});}
}
