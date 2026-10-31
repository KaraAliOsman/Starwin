export async function onRequest(context){
 const url=new URL(context.request.url);
 if(url.hostname==='www.starwinpvc.cl'){url.hostname='starwinpvc.cl';url.protocol='https:';return Response.redirect(url.href,301);}
 const response=await context.next();
 if(url.hostname.endsWith('.pages.dev')){const headers=new Headers(response.headers);headers.set('X-Robots-Tag','noindex, nofollow');return new Response(response.body,{status:response.status,headers});}
 return response;
}
