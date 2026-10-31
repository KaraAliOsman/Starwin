import {test} from 'node:test';
import assert from 'node:assert/strict';
import {handleContactRequest,validateContact,composeEmail} from '../scripts/contact-core.mjs';
const valid={name:'Prueba local',email:'prueba@example.com',phone:'+56 9 1234 5678',city:'Concepción',kind:'Hogar',message:'Consulta de prueba local sin destinatario externo.',consent:true,website:''};
const request=(body=valid,origin='http://localhost:3004')=>new Request('http://localhost:3004/api/contact',{method:'POST',headers:{'Content-Type':'application/json',Origin:origin},body:JSON.stringify(body)});
test('Validación con mensajes por campo y sin inyección de cabeceras',()=>{
 assert(validateContact(valid).ok);assert(!validateContact({...valid,name:'A\nB'}).ok);assert(!validateContact({...valid,email:'a@b\ncc:x@y.cl'}).ok);assert(!validateContact({...valid,website:'spam'}).ok);assert(!validateContact({...valid,message:'corto',consent:false}).ok);
 assert(composeEmail(valid).mailto.startsWith('mailto:starwinchile@gmail.com?subject='));
});
test('Sin credenciales prepara el mensaje y nunca lo anuncia como enviado',async()=>{
 let calls=0;const result=await handleContactRequest(request(),{fetcher:()=>{calls++;throw Error('No debe llamarse');}});const data=await result.json();assert.equal(result.status,200);assert.equal(data.mode,'draft');assert.equal(calls,0);assert(data.email.body.includes(valid.message));
});
test('Rechaza origen externo, cuerpo inválido y autorización ausente',async()=>{
 assert.equal((await handleContactRequest(request(valid,'https://externo.invalid'))).status,403);
 assert.equal((await handleContactRequest(request({...valid,consent:false}))).status,422);
 assert.equal((await handleContactRequest(request({...valid,message:'a'.repeat(25000)}))).status,413);
 assert.equal((await handleContactRequest(new Request('http://localhost:3004/api/contact',{method:'POST',body:'error',headers:{'Content-Type':'application/json'}}))).status,400);
});
test('Transporte configurado simulado: contenido correcto, error honesto y límite de abuso',async()=>{
 const env={RESEND_API_KEY:'mock-only',CONTACT_FROM:'test@example.com'};
 let calls=0;const fetcher=async(url,options)=>{calls++;assert.equal(url,'https://api.resend.com/emails');const body=JSON.parse(options.body);assert.equal(body.reply_to,valid.email);assert.deepEqual(body.to,['starwinchile@gmail.com']);return new Response('{"id":"local-test"}',{status:200});};
 for(let i=0;i<5;i++){const result=await handleContactRequest(request(),{env,ip:'mock-limit',fetcher});assert.equal((await result.json()).mode,'sent');}
 assert.equal((await handleContactRequest(request(),{env,ip:'mock-limit',fetcher})).status,429);assert.equal(calls,5);
 const fail=await handleContactRequest(request(),{env,ip:'mock-failure',fetcher:async()=>new Response('{}',{status:500})});assert.equal(fail.status,502);assert(!JSON.stringify(await fail.json()).includes('Consulta enviada'));
});
