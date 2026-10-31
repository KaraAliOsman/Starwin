import {test} from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import {createQwenSpaceProvider,createGoogleImageProvider,createVisualizationService,QWEN_SPACE_ORIGIN,qwenResultUrl} from '../scripts/visualizer-core.mjs';

const env={VISUALIZER_PROVIDER:'qwen-space',VISUALIZER_ALLOW_FREE_GENERATION:'true',HF_TOKEN:'hf_fake_for_tests_only',GEMINI_ALLOW_PAID_GENERATION:'false',VISUALIZER_BILLING_HOLD:'true'};
const bytes=new Uint8Array(await sharp({create:{width:64,height:48,channels:3,background:'#cde0e6'}}).png().toBuffer());
const photo={bytes,width:768,height:576,mimeType:'image/png'},input={photo,model:'sliding2',finish:'ANTRACITA',signal:new AbortController().signal};
const file={path:'/tmp/gradio/result/image.png',url:`${QWEN_SPACE_ORIGIN}/gradio_api/file=/tmp/gradio/result/image.png`};
function transport({account={type:'user',isPro:false},event='complete',result=file,status}={}){
 const calls=[];
 return {calls,fetcher:async(url,options)=>{
  calls.push({url,options});assert.equal(options.redirect,'error');assert.equal(options.headers.Authorization,`Bearer ${env.HF_TOKEN}`);
  if(status)return new Response('{}',{status});
  if(url==='https://huggingface.co/api/whoami-v2')return Response.json(account);
  if(url.endsWith('/upload')){assert.equal(options.body.get('files').name,'room.jpg');return Response.json(['/tmp/gradio/input/room.jpg']);}
  if(url.endsWith('/call/infer')){
   const data=JSON.parse(options.body).data;assert.equal(data[0][0].image.path,'/tmp/gradio/input/room.jpg');assert.match(data[1],/Corredera Serie Pro70/);assert.match(data[1],/antracita/i);assert.deepEqual(data.slice(2),[42,false,4,40,576,768,false]);
   return Response.json({event_id:'a'.repeat(32)});
  }
  if(url.endsWith('a'.repeat(32))){
   const body=`event: heartbeat\ndata: null\n\nevent: ${event}\ndata: ${JSON.stringify(event==='complete'?[[{image:result}],42]:event==='error'?'GPU quota exceeded':null)}\n\n`;
   const encoded=new TextEncoder().encode(body);return new Response(new ReadableStream({start(controller){for(let at=0;at<encoded.length;at+=7)controller.enqueue(encoded.slice(at,at+7));controller.close();}}));
  }
  assert.equal(url,file.url);return new Response(bytes,{headers:{'Content-Type':'image/png'}});
 }};
}

test('Modo gratuito requiere configuración propia y no puede llamar al adaptador de pago',async()=>{
 let calls=0;for(const options of [{...env,HF_TOKEN:''},{...env,VISUALIZER_ALLOW_FREE_GENERATION:'false'}])await assert.rejects(()=>createQwenSpaceProvider({env:options,fetcher:async()=>calls++}).generate(input),/no está habilitada/);
 await assert.rejects(()=>createGoogleImageProvider({env:{...env,GEMINI_API_KEY:'fake',GEMINI_IMAGE_MODEL:'gemini-nano-banana-2.1',GEMINI_PROVIDER:'google'},fetcher:async()=>calls++}).generate(input),/no está habilitada/);assert.equal(calls,0);
 const service=createVisualizationService({env:{...env,HF_TOKEN:''}}),response=await service.handle(new Request('https://starwin.example/api/visualizations/config')),config=await response.json();assert.equal(config.available,false);assert.equal(config.provider,null);assert.equal(config.costMode,'free');assert(!JSON.stringify(config).includes('hf_fake'));
});

test('Cuenta gratuita: edición sobre la foto, SSE fragmentado y resultado raster real',async()=>{
 const t=transport(),result=await createQwenSpaceProvider({env,fetcher:t.fetcher}).generate(input);assert.equal(result.width,64);assert.equal(result.height,48);assert.equal(t.calls.length,5);assert(t.calls.every(c=>!c.url.includes('googleapis')));
 const service=createVisualizationService({env,provider:{generate:async()=>result}}),config=await(await service.handle(new Request('https://starwin.example/api/visualizations/config'))).json();assert.equal(config.available,true);assert.match(config.provider,/Qwen/);assert.equal(config.costMode,'free');
});

test('Cuenta PRO o desconocida se bloquea antes de subir foto para evitar consumo de créditos',async()=>{
 for(const account of [{type:'user',isPro:true},{type:'org',isPro:false},{type:'user'}]){const t=transport({account});await assert.rejects(()=>createQwenSpaceProvider({env,fetcher:t.fetcher}).generate(input),e=>e.code==='free_account_required');assert.equal(t.calls.length,1);}
});

test('Salida de proveedor no puede descargar de otro host ni acceder a un archivo fuera de Gradio',async()=>{
 for(const url of ['https://attacker.example/private','http://qwen-qwen-image-edit-2511.hf.space/gradio_api/file=/tmp/gradio/x.png',`${QWEN_SPACE_ORIGIN}/gradio_api/file=/etc/passwd`,`${file.url}?secret=1`])assert.throws(()=>qwenResultUrl({url}),e=>e.code==='invalid_result');
 const t=transport({result:{url:'https://attacker.example/private'}});await assert.rejects(()=>createQwenSpaceProvider({env,fetcher:t.fetcher}).generate(input),e=>e.code==='invalid_result');assert.equal(t.calls.length,4);
});

test('Cupo o error de proveedor detiene la operación sin descargar ni reintentar',async()=>{
 const t=transport({event:'error'});await assert.rejects(()=>createQwenSpaceProvider({env,fetcher:t.fetcher}).generate(input),e=>e.code==='provider_quota');assert.equal(t.calls.length,4);
 for(const status of [401,429,503]){const t=transport({status});await assert.rejects(()=>createQwenSpaceProvider({env,fetcher:t.fetcher}).generate(input));assert.equal(t.calls.length,1);}
});
