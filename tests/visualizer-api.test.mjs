import {test} from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import {createVisualizationService,createGoogleImageProvider,MemoryVisualizationStore,inspectRaster,parseGoogleImageResponse,MAX_UPLOAD_BYTES,MAX_REQUEST_BYTES} from '../scripts/visualizer-core.mjs';
import {normalizeRaster,isApiPath} from '../scripts/api-dev.mjs';

const origin='http://localhost:3005';
// Paid mode is exercised only with fake credentials and local transports.
const env={GEMINI_PROVIDER:'google',GEMINI_API_KEY:'mock-key-not-real',GEMINI_IMAGE_MODEL:'gemini-nano-banana-2.1',GEMINI_ALLOW_PAID_GENERATION:'true'};
const fixture=new Uint8Array(await sharp({create:{width:16,height:12,channels:3,background:'#d9dfdc'}}).png().toBuffer());
const image={bytes:fixture,mimeType:'image/png',width:16,height:12};
function multipart({photo=fixture,type='image/png',model='sliding2',finish='BLANCO',consent='true'}={}){
 const form=new FormData();form.set('photo',new Blob([photo],{type}),'room.png');form.set('model',model);form.set('finish',finish);form.set('consent',consent);return form;
}
function post(cookie,{key=crypto.randomUUID(),headers={},...fields}={}){return new Request(`${origin}/api/visualizations`,{method:'POST',headers:{Origin:origin,Cookie:cookie,'Idempotency-Key':key,...headers},body:multipart(fields)});}
const get=(path,cookie='')=>new Request(`${origin}${path}`,{headers:{Cookie:cookie}});
async function session(service){const response=await service.handle(get('/api/visualizations/config'));assert.equal(response.status,200);return response.headers.get('set-cookie').split(';')[0];}
const json=async response=>({status:response.status,data:await response.json()});
function successProvider(counter={calls:0}){return {async generate(){counter.calls++;return image;}};}

test('Deshabilitado sin proveedor, modelo o clave; jamás llama al proveedor',async()=>{
 for(const options of [{},{GEMINI_PROVIDER:'other',GEMINI_API_KEY:'mock',GEMINI_IMAGE_MODEL:env.GEMINI_IMAGE_MODEL},{...env,GEMINI_IMAGE_MODEL:'arbitrary-model'},{...env,GEMINI_API_KEY:''},{...env,GEMINI_ALLOW_PAID_GENERATION:undefined},{...env,GEMINI_ALLOW_PAID_GENERATION:'false'},{...env,GEMINI_ALLOW_PAID_GENERATION:'1'},{...env,VISUALIZER_BILLING_HOLD:'true'}]){
  const counter={calls:0},service=createVisualizationService({env:options,provider:successProvider(counter)});
  const config=await json(await service.handle(get('/api/visualizations/config')));assert.equal(config.data.available,false);assert.equal(config.data.provider,null);assert(!JSON.stringify(config).includes('mock-key'));
  const response=await service.handle(post(''));assert.equal(response.status,503);assert.equal(counter.calls,0);
 }
});

test('Presupuesto cero: la protección también bloquea llamadas directas al adaptador',async()=>{
 let calls=0;
 for(const allowed of [undefined,'false','1','TRUE']){
  const provider=createGoogleImageProvider({env:{...env,GEMINI_ALLOW_PAID_GENERATION:allowed},fetcher:async()=>{calls++;throw Error('No debe llamar a Google');}});
  await assert.rejects(()=>provider.generate({photo:image,model:'sliding2',finish:'BLANCO',signal:new AbortController().signal}),/no está habilitada/);
 }
 assert.equal(calls,0);
});

test('Cookie privada, contrato público y rechazo de origen cruzado',async()=>{
 const service=createVisualizationService({env,provider:successProvider()});
 const response=await service.handle(new Request('https://starwin.example/api/visualizations/config'));
 const cookie=response.headers.get('set-cookie');assert.match(cookie,/HttpOnly/);assert.match(cookie,/SameSite=Strict/);assert.match(cookie,/Secure/);assert.match(cookie,/Path=\/api\/visualizations/);
 const config=await response.json();assert.equal(config.available,true);assert.equal(config.models[0].label,'Corredera Serie Pro70');assert.equal(config.finishes.length,7);
 assert.match(response.headers.get('cache-control'),/no-store/);
 const bad=await service.handle(post('',{headers:{Origin:'https://external.example'}}));assert.equal(bad.status,403);
 const absent=new Request(`${origin}/api/visualizations`,{method:'POST',body:multipart()});assert.equal((await service.handle(absent)).status,403);
 assert.equal((await service.handle(post(''))).status,428);
 const cross=new Request(`${origin}/api/visualizations/config`,{headers:{'sec-fetch-site':'cross-site'}});assert.equal((await service.handle(cross)).status,403);
});

test('Valida foto real, selección, consentimiento, formatos, tamaño y operación',async()=>{
 const service=createVisualizationService({env,provider:successProvider(),normalizePhoto:normalizeRaster}),cookie=await session(service);
 for(const [fields,status]of [[{consent:'false'},422],[{model:'unlimited'},422],[{finish:'<script>'},422],[{type:'image/heic'},415],[{type:'image/jpeg'},415],[{photo:new TextEncoder().encode('not a photo but long enough to inspect')},422],[{key:'short'},400]])assert.equal((await service.handle(post(cookie,fields))).status,status);
 const oversized=post(cookie,{headers:{'Content-Length':String(MAX_REQUEST_BYTES+1)}});assert.equal((await service.handle(oversized)).status,413);
 const huge=fixture.slice();new DataView(huge.buffer).setUint32(16,16000);new DataView(huge.buffer).setUint32(20,16000);assert.throws(()=>inspectRaster(huge),/demasiado grande/);
 const broken=fixture.subarray(0,Math.floor(fixture.length/2));await assert.rejects(()=>normalizeRaster({...image,bytes:broken}),/No se pudo leer/);
 assert.equal(MAX_UPLOAD_BYTES,12582912);
});

test('Genera, entrega imagen privada y elimina el original al completar',async()=>{
 const store=new MemoryVisualizationStore(),service=createVisualizationService({env,store,provider:successProvider(),normalizePhoto:normalizeRaster,normalizeResult:normalizeRaster}),cookie=await session(service);
 const response=await service.handle(post(cookie)),job=await response.json();assert.equal(response.status,200);assert.equal(job.status,'ready');assert.equal(job.model,'sliding2');assert(job.result.url.endsWith('/image'));assert.equal(store.jobs.get(job.jobId).photo,null);
 const binary=await service.handle(get(job.result.url,cookie));assert.equal(binary.status,200);assert.equal(binary.headers.get('content-type'),'image/jpeg');assert.match(binary.headers.get('cache-control'),/no-store/);assert.equal(binary.headers.get('cross-origin-resource-policy'),'same-origin');assert((await binary.arrayBuffer()).byteLength>0);
 const other=await session(service);assert.equal((await service.handle(get(job.statusUrl,other))).status,404);assert.equal((await service.handle(get(job.result.url,other))).status,404);assert.equal((await service.handle(get(job.statusUrl))).status,404);
 const deletion=await service.handle(new Request(`${origin}${job.statusUrl}`,{method:'DELETE',headers:{Origin:origin,Cookie:cookie}}));assert.equal(deletion.status,200);assert.equal(store.jobs.size,0);assert.equal((await service.handle(get(job.result.url,cookie))).status,404);
});

test('Idempotencia evita cargos dobles y detecta cambios con la misma clave',async()=>{
 const counter={calls:0},service=createVisualizationService({env,provider:successProvider(counter)}),cookie=await session(service),key=crypto.randomUUID();
 const first=await json(await service.handle(post(cookie,{key}))),second=await json(await service.handle(post(cookie,{key})));
 assert.equal(first.data.jobId,second.data.jobId);assert.equal(second.data.duplicate,true);assert.equal(counter.calls,1);
 assert.equal((await service.handle(post(cookie,{key,finish:'NEGRO'}))).status,409);
 await service.handle(new Request(`${origin}${first.data.statusUrl}`,{method:'DELETE',headers:{Origin:origin,Cookie:cookie}}));
 assert.equal((await service.handle(post(cookie,{key}))).status,410);assert.equal(counter.calls,1);
});

test('POST asíncrono, polling y cancelación sin resucitar archivos',async()=>{
 let release,signalSeen;const tasks=[];const provider={async generate({signal}){signalSeen=signal;await new Promise(resolve=>release=resolve);return image;}};
 const store=new MemoryVisualizationStore(),service=createVisualizationService({env,store,provider,schedule:task=>tasks.push(task)}),cookie=await session(service);
 const first=await json(await service.handle(post(cookie)));assert.equal(first.status,202);assert.equal(first.data.status,'generating');
 assert.equal((await service.handle(get(`/api/visualizations/${first.data.jobId}/image`,cookie))).status,409);
 assert.equal((await service.handle(post(cookie))).status,429);
 const status=await json(await service.handle(get(first.data.statusUrl,cookie)));assert.equal(status.data.result,null);
 await service.handle(new Request(`${origin}${first.data.statusUrl}`,{method:'DELETE',headers:{Origin:origin,Cookie:cookie}}));assert.equal(signalSeen.aborted,true);release();await Promise.all(tasks);assert.equal(store.jobs.size,0);
});

test('Cupos de sesión y global sobreviven al borrado; caducidad elimina las imágenes',async()=>{
 let time=Date.now();const store=new MemoryVisualizationStore(),service=createVisualizationService({env:{...env,VISUALIZER_SESSION_LIMIT:'1',VISUALIZER_GLOBAL_DAILY_LIMIT:'2'},store,provider:successProvider(),now:()=>time});
 const firstCookie=await session(service),first=await json(await service.handle(post(firstCookie)));
 await service.handle(new Request(`${origin}${first.data.statusUrl}`,{method:'DELETE',headers:{Origin:origin,Cookie:firstCookie}}));assert.equal((await service.handle(post(firstCookie))).status,429);
 const secondCookie=await session(service),second=await json(await service.handle(post(secondCookie)));assert.equal(second.status,200);
 const thirdCookie=await session(service);assert.equal((await service.handle(post(thirdCookie))).status,429);
 time+=86400001;assert.equal((await service.handle(get(second.data.statusUrl,secondCookie))).status,404);assert.equal(store.jobs.size,0);assert.equal(store.globalUsage.length,0);
});

test('Google: contrato REST verificado, solo imagen válida; nunca consulta URL de salida arbitraria',async()=>{
 let calls=0;const provider=createGoogleImageProvider({env,fetcher:async(url,options)=>{
  calls++;assert.equal(url,'https://generativelanguage.googleapis.com/v1beta/interactions');assert.equal(options.method,'POST');assert.equal(options.headers['x-goog-api-key'],env.GEMINI_API_KEY);
  const body=JSON.parse(options.body);assert.equal(body.model,env.GEMINI_IMAGE_MODEL);assert.equal(body.store,false);assert.equal(body.input[1].type,'image');assert.equal(body.input[1].mime_type,'image/png');assert.equal(body.input[1].data,Buffer.from(fixture).toString('base64'));assert(body.input[0].text.includes('Corredera Serie Pro70'));assert.deepEqual(body.response_format,{type:'image',mime_type:'image/jpeg',image_size:'1K',delivery:'inline'});assert.deepEqual(body.generation_config,{thinking_level:'minimal',max_output_tokens:4096});assert.equal(body.tools,undefined);
  return new Response(JSON.stringify({status:'completed',steps:[{type:'model_output',content:[{type:'image',mime_type:'image/png',data:Buffer.from(fixture).toString('base64')}]}]}));
 }});
 const result=await provider.generate({photo:image,model:'sliding2',finish:'BLANCO',signal:new AbortController().signal});assert.equal(result.width,16);assert.equal(calls,1);
 assert.throws(()=>parseGoogleImageResponse({status:'completed',steps:[{type:'model_output',content:[{type:'text',text:'No puedo generar'}]}]}),/No se obtuvo/);
 assert.throws(()=>parseGoogleImageResponse({status:'incomplete',steps:[]}),/no completó/);
 assert.throws(()=>parseGoogleImageResponse({steps:[{type:'model_output',content:[{type:'image',mime_type:'image/png',uri:'https://arbitrary.example/private'}]}]}),/No se obtuvo/);
 assert.throws(()=>parseGoogleImageResponse({steps:[{type:'model_output',content:[{type:'image',mime_type:'image/png',data:'<bad>'}]}]}),/imagen válida/);
});

test('Fallo de red queda incierto, sin reintentos al consultar o duplicar operación',async()=>{
 let calls=0;const provider=createGoogleImageProvider({env,fetcher:async()=>{calls++;throw new Error('network');}}),service=createVisualizationService({env,provider}),cookie=await session(service),key=crypto.randomUUID();
 const first=await json(await service.handle(post(cookie,{key})));assert.equal(first.data.status,'failed');assert.equal(first.data.error.code,'provider_uncertain');
 await service.handle(get(first.data.statusUrl,cookie));await service.handle(post(cookie,{key}));assert.equal(calls,1);
});

test('Google 402: error de saldo distinguible y bloqueo de nuevas llamadas hasta corregir la cuenta',async()=>{
 let calls=0;const provider=createGoogleImageProvider({env,fetcher:async()=>{calls++;return new Response(JSON.stringify({error:{code:'payment_required',message:'Prepay credit balance depleted'}}),{status:402});}});
 const service=createVisualizationService({env,provider}),cookie=await session(service);
 const first=await json(await service.handle(post(cookie)));assert.equal(first.data.status,'failed');assert.equal(first.data.error.code,'provider_billing');assert.equal(calls,1);
 const config=await json(await service.handle(get('/api/visualizations/config',cookie)));assert.equal(config.data.available,false);
 const second=await json(await service.handle(post(cookie)));assert.equal(second.status,503);assert.equal(second.data.error.code,'provider_billing');assert.equal(calls,1);
 assert.equal((await json(await service.handle(get(first.data.statusUrl,cookie)))).data.status,'failed');
});

test('Normalización decodifica, orienta, quita EXIF y conserva un tamaño móvil acotado',async()=>{
 const input=new Uint8Array(await sharp({create:{width:3000,height:1500,channels:3,background:'#c8c8c8'}}).jpeg().withMetadata({orientation:6}).toBuffer());
 const result=await normalizeRaster({bytes:input});const metadata=await sharp(result.bytes).metadata();
 assert.equal(metadata.width,1024);assert.equal(metadata.height,2048);assert.equal(metadata.exif,undefined);assert.equal(metadata.orientation,undefined);assert.equal(metadata.format,'jpeg');
 assert(isApiPath('/api/visualizations/config?x=1'));assert(isApiPath('/api/contact'));assert(!isApiPath('/api/visualizations-foreign'));
});

test('Inspección de JPEG, WebP con y sin pérdidas e imagen API de tamaño realista',async()=>{
 for(const kind of ['jpeg','webp'])for(const lossless of kind==='webp'?[true,false]:[false]){
  const bytes=new Uint8Array(await sharp(fixture)[kind]({lossless}).toBuffer());const metadata=inspectRaster(bytes);assert.equal(metadata.mimeType,`image/${kind}`);assert.equal(metadata.width,16);assert.equal(metadata.height,12);
 }
 const large=new Uint8Array(await sharp({create:{width:2048,height:2048,channels:3,background:'#e5e6df'}}).png({compressionLevel:0}).toBuffer());
 const output=parseGoogleImageResponse({status:'completed',steps:[{type:'model_output',content:[{type:'image',mime_type:'image/png',data:Buffer.from(large).toString('base64')}]}]});assert.equal(output.width,2048);assert.equal(output.bytes.length,large.length);
});
