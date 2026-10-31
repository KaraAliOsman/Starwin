const limits = new Map();
export const DESTINATION='starwinchile@gmail.com';
export function validateContact(input) {
 const errors={};
 if(!input||typeof input!=='object')return {ok:false,errors:{form:'Revisa los datos de tu consulta.'}};
 const text=(k,max)=>typeof input[k]==='string'?input[k].trim().slice(0,max+1):'';
 const data={name:text('name',90),email:text('email',160),phone:text('phone',40),city:text('city',100),company:text('company',160),kind:text('kind',60),message:text('message',4000),consent:input.consent===true,website:text('website',200)};
 if(data.name.length<2||data.name.length>90)errors.name='Escribe tu nombre (entre 2 y 90 caracteres).';
 if(!/^[^\s@<>\r\n]+@[^\s@<>\r\n]+\.[^\s@<>\r\n]+$/.test(data.email)||data.email.length>160)errors.email='Escribe un correo válido.';
 if(data.phone.length>40||data.phone&& !/^[+\d\s().-]{6,40}$/.test(data.phone))errors.phone='Revisa tu número de teléfono.';
 if(data.city.length>100)errors.city='El nombre de la comuna es muy largo.';
 if(data.company.length>160)errors.company='El nombre de la empresa es muy largo.';
 if(!['Hogar','Empresa / arquitectura','Consulta general'].includes(data.kind))errors.kind='Elige el tipo de proyecto.';
 if(data.message.length<15||data.message.length>4000)errors.message='Cuéntanos tu proyecto en 15 a 4.000 caracteres.';
 if(!data.consent)errors.consent='Necesitamos tu autorización para responder esta consulta.';
 if(data.website)errors.form='No se pudo procesar esta consulta.';
 if(/[\r\n]/.test(data.name+data.company))errors.name='Escribe el nombre en una sola línea.';
 return {ok:Object.keys(errors).length===0,errors,data};
}
export function composeEmail(d) {
 const subject=`Consulta Starwin · ${d.kind} · ${d.name}`;
 const body=`Nombre: ${d.name}\nCorreo: ${d.email}\nTeléfono: ${d.phone||'No indicado'}\nComuna: ${d.city||'Por confirmar'}\nEmpresa: ${d.company||'No indicada'}\nTipo: ${d.kind}\n\n${d.message}\n\nAutorizó el uso de estos datos para responder su consulta.`;
 return {subject,body,mailto:`mailto:${DESTINATION}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`};
}
export function deliveryMode(env={}){return env.WEB3FORMS_ACCESS_KEY||env.RESEND_API_KEY&&env.CONTACT_FROM?'send':'draft';}
export async function handleContactRequest(request,{env={},ip='local',fetcher=fetch,rateLimit=true}={}) {
 const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
 if(request.method==='GET')return json({mode:deliveryMode(env)});
 if(request.method!=='POST')return json({message:'Método no permitido.'},405);
 const url=new URL(request.url),origin=request.headers.get('origin');
 if(origin&&origin!==url.origin&&origin!==env.SITE_URL)return json({message:'Abre el formulario desde la web de Starwin.'},403);
 if(!request.headers.get('content-type')?.includes('application/json'))return json({message:'Formato de consulta no admitido.'},415);
 const raw=await request.text();
 if(new TextEncoder().encode(raw).length>24000)return json({message:'La consulta supera el tamaño permitido.'},413);
 let input;try{input=JSON.parse(raw);}catch{return json({message:'No se pudo leer la consulta.'},400);}
 const result=validateContact(input);
 if(!result.ok)return json({message:'Revisa los campos señalados.',errors:result.errors},422);
 const mode=deliveryMode(env),email=composeEmail(result.data);
 if(mode==='draft')return json({mode,email,message:'Tu consulta está preparada. Abre tu correo para enviarla a Starwin.'});
 if(rateLimit){
  const now=Date.now(),previous=limits.get(ip)||[];const recent=previous.filter(t=>now-t<600000);
  if(recent.length>=5)return json({message:'Has enviado varias consultas. Espera unos minutos o contáctanos por WhatsApp.'},429);
  limits.set(ip,[...recent,now]);
  if(limits.size>3000)for(const [key,times]of limits)if(times.every(t=>now-t>600000))limits.delete(key);
 }
 try{
  if(env.WEB3FORMS_ACCESS_KEY){
   const response=await fetcher('https://api.web3forms.com/submit',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({access_key:env.WEB3FORMS_ACCESS_KEY,name:result.data.name,email:result.data.email,subject:email.subject,message:email.body,from_name:'Starwin · Consulta web',botcheck:false}),signal:AbortSignal.timeout(12000)});
   const resultBody=await response.json().catch(()=>null);
   if(!response.ok||resultBody?.success!==true)return json({message:'No pudimos entregar la consulta al servicio de correo. Tus datos siguen en el formulario; puedes intentar de nuevo o escribir por WhatsApp.'},502);
   return json({mode:'sent',message:'Consulta enviada. Te responderemos al correo que indicaste.'});
  }
  const response=await fetcher('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${env.RESEND_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({from:env.CONTACT_FROM,to:[DESTINATION],reply_to:result.data.email,subject:email.subject,text:email.body}),signal:AbortSignal.timeout(12000)});
  if(!response.ok)return json({message:'No pudimos enviar el correo. Tus datos siguen en el formulario. Puedes intentarlo otra vez o escribir por WhatsApp.'},502);
  return json({mode:'sent',message:'Consulta enviada. Te responderemos al correo que indicaste.'});
 }catch{return json({message:'No logramos conectar con el servicio de correo. Puedes intentarlo otra vez.'},502);}
}
