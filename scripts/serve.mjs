import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {brotliCompress,gzip,constants} from 'node:zlib';
import {promisify} from 'node:util';
import {apiNode,isApiPath} from './api-dev.mjs';
const root=path.resolve('dist'),port=Number(process.env.PORT||3006);
// The production preview applies the exact migration rules shipped with the site.
// Unsupported patterns fail at startup instead of silently behaving unlike hosting.
let redirectSource='';
try{redirectSource=await fs.readFile(path.join(root,'_redirects'),'utf8');}catch(error){if(error.code!=='ENOENT')throw error;}
const redirects=new Map();
for(const [index,line] of redirectSource.split(/\r?\n/).entries()){
 const rule=line.trim();if(!rule||rule.startsWith('#'))continue;
 const parts=rule.split(/\s+/),[from,to,status]=parts;
 const destination=new URL(to,'http://preview.local');
 if(parts.length!==3||!from.startsWith('/')||from.startsWith('//')||/[?#*:]/.test(from)||!to.startsWith('/')||destination.origin!=='http://preview.local'||!['301','308'].includes(status)||redirects.has(from)||from===destination.pathname){
  throw new Error(`Regla _redirects no válida o no admitida en línea ${index+1}. Solo rutas locales exactas con estado 301/308.`);
 }
 redirects.set(from,{destination,status:Number(status)});
}
for(const rule of redirects.values())if(redirects.has(rule.destination.pathname))throw new Error('El mapa _redirects contiene una cadena o un ciclo. Usa destinos finales.');
const brotli=promisify(brotliCompress),zip=promisify(gzip),encoded=new Map();
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.xml':'application/xml; charset=utf-8','.txt':'text/plain; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.avif':'image/avif','.woff2':'font/woff2','.ttf':'font/ttf','.pdf':'application/pdf'};
const server=http.createServer(async(req,res)=>{
 const url=new URL(req.url,'http://localhost');
 if(isApiPath(url.pathname))return void apiNode(req,res);
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
 try{
  const redirect=redirects.get(url.pathname);
  if(redirect){
   const destination=new URL(redirect.destination);
   if(!destination.search)destination.search=url.search;
   res.writeHead(redirect.status,{Location:destination.pathname+destination.search+destination.hash,'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});res.end();return;
  }
  let rel=decodeURIComponent(url.pathname);if(rel.includes('\0'))throw Error('Invalid path');
  let target=path.resolve(root,'.'+rel);if(target!==root&&!target.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
  let status=200;
  try{const s=await fs.stat(target);if(s.isDirectory()){if(!url.pathname.endsWith('/')){res.writeHead(301,{Location:url.pathname+'/'+url.search});res.end();return;}target=path.join(target,'index.html');}await fs.access(target);}catch{target=path.join(root,'404.html');status=404;}
  let body=await fs.readFile(target);let encoding='';
  if(/\.(html|js|css|svg|json|xml|txt|ttf)$/.test(target)&&body.length>512){
   const accepted=new Map((req.headers['accept-encoding']||'').split(',').map(value=>{const [name,...params]=value.trim().split(';');const q=params.find(p=>p.trim().startsWith('q='));return [name,q?Number(q.trim().slice(2)):1];}));
   const br=accepted.get('br')??accepted.get('*')??0,gz=accepted.get('gzip')??accepted.get('*')??0;
   encoding=br>0&&br>=gz?'br':gz>0?'gzip':'';
   if(encoding){const stat=await fs.stat(target),key=`${target}:${stat.mtimeMs}:${body.length}:${encoding}`;if(encoded.has(key))body=encoded.get(key);else{body=encoding==='br'?await brotli(body,{params:{[constants.BROTLI_PARAM_QUALITY]:4}}):await zip(body,{level:5});if(encoded.size>300)encoded.clear();encoded.set(key,body);}}
  }
  res.writeHead(status,{'Content-Type':mime[path.extname(target)]||'application/octet-stream','Content-Length':body.length,'X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin','X-Frame-Options':'DENY','Cache-Control':target.includes(`${path.sep}_astro${path.sep}`)?'public, max-age=31536000, immutable':'no-cache',...(encoding?{'Content-Encoding':encoding,Vary:'Accept-Encoding'}:{})});
  res.end(req.method==='HEAD'?undefined:body);
 }catch{res.writeHead(400);res.end('Solicitud no válida.');}
});
server.listen(port,'0.0.0.0',()=>console.log(`Starwin · http://127.0.0.1:${port}/`));

