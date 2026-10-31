import {handleContactRequest} from './contact-core.mjs';
import {createVisualizationService,MemoryVisualizationStore,MAX_REQUEST_BYTES,VisualizerError} from './visualizer-core.mjs';
import sharp from 'sharp';

// Decode on the server, honor EXIF orientation and remove metadata before transfer.
export async function normalizeRaster(image) {
 try {
  const decoder=sharp(image.bytes,{limitInputPixels:40_000_000,failOn:'warning',animated:false});
  const metadata=await decoder.metadata();
  if((metadata.pages||1)>1)throw new Error('animated');
  const {data,info}=await decoder.rotate().resize({width:2048,height:2048,fit:'inside',withoutEnlargement:true}).flatten({background:'#ffffff'}).jpeg({quality:88,mozjpeg:true}).toBuffer({resolveWithObject:true});
  return {bytes:new Uint8Array(data),mimeType:'image/jpeg',width:info.width,height:info.height};
 } catch {throw new VisualizerError('invalid_image','No se pudo leer la foto. Exporta una imagen JPEG, PNG o WebP válida.',422);}
}

const store=new MemoryVisualizationStore();
const pending=new Set();
const service=createVisualizationService({env:process.env,store,normalizePhoto:normalizeRaster,normalizeResult:normalizeRaster,schedule(task){pending.add(task);task.finally(()=>pending.delete(task));}});
const cleanup=setInterval(()=>store.prune(),60000);cleanup.unref();

export function isApiPath(url='') {const path=url.split('?')[0];return path==='/api/contact'||path==='/api/visualizations'||path.startsWith('/api/visualizations/');}
export async function apiNode(req,res) {
 try {
  const visualizer=req.url?.split('?')[0].startsWith('/api/visualizations');
  const max=visualizer?MAX_REQUEST_BYTES:24000,chunks=[];let size=0;
  if(Number(req.headers['content-length']||0)>max){res.writeHead(413,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify({message:'La solicitud supera el tamaño permitido.'}));req.resume();return;}
  for await(const chunk of req){size+=chunk.length;if(size>max){res.writeHead(413,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify({message:'La solicitud supera el tamaño permitido.'}));req.resume();return;}chunks.push(chunk);}
  const origin=`http://${req.headers.host||'127.0.0.1:3006'}`;
  const request=new Request(new URL(req.url,origin),{method:req.method,headers:req.headers,...(!['GET','HEAD'].includes(req.method)?{body:Buffer.concat(chunks)}:{})});
  const response=visualizer?await service.handle(request):await handleContactRequest(request,{env:process.env,ip:req.socket.remoteAddress||'local'});
  res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));
 } catch {if(!res.headersSent)res.writeHead(500,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify({message:'No pudimos procesar la solicitud. Inténtalo otra vez.'}));}
}
export function apiDevPlugin(){return{name:'starwin-local-api',configureServer(server){server.middlewares.use((req,res,next)=>{if(isApiPath(req.url))return void apiNode(req,res);next();});}};}

