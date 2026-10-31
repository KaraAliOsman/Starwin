import {handleContactRequest} from './contact-core.mjs';
export async function contactNode(req,res) {
 const chunks=[];let bytes=0;
 try{
  for await(const chunk of req){bytes+=chunk.length;if(bytes>24000){res.writeHead(413,{'Content-Type':'application/json'});res.end(JSON.stringify({message:'La consulta es demasiado larga.'}));return;}chunks.push(chunk);}
  const origin=`http://${req.headers.host||'127.0.0.1:3004'}`;
  const request=new Request(new URL(req.url,origin),{method:req.method,headers:req.headers,...(!['GET','HEAD'].includes(req.method)?{body:Buffer.concat(chunks)}:{})});
  const response=await handleContactRequest(request,{env:process.env,ip:req.socket.remoteAddress||'local'});
  res.writeHead(response.status,Object.fromEntries(response.headers));res.end(await response.text());
 }catch{res.writeHead(500,{'Content-Type':'application/json'});res.end(JSON.stringify({message:'No pudimos procesar la consulta. Inténtalo otra vez.'}));}
}
export function contactDevPlugin(){return{name:'starwin-local-contact',configureServer(server){server.middlewares.use((req,res,next)=>{if(req.url?.split('?')[0]==='/api/contact')return void contactNode(req,res);next();});}};}
