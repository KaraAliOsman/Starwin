/** The service binding handles private, durable jobs and the daily AI budget. */
export async function onRequest(context) {
 if(context.env.VISUALIZER_COORDINATOR?.fetch)return context.env.VISUALIZER_COORDINATOR.fetch(context.request);
 const config=new URL(context.request.url).pathname.replace(/\/$/,'')==='/api/visualizations/config';
 const data=config?{available:false,provider:null,maxUploadBytes:12582912,message:'La generación de propuestas aún no está habilitada.'}:{error:{code:'storage_not_configured',message:'La generación de propuestas aún no está habilitada.'},message:'La generación de propuestas aún no está habilitada.'};
 return new Response(JSON.stringify(data),{status:config&&context.request.method==='GET'?200:503,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','X-Robots-Tag':'noindex, nofollow'}});
}
