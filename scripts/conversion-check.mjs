import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {composeEmail} from './contact-core.mjs';

const base = (process.env.TEST_URL || 'http://127.0.0.1:3006').replace(/\/$/, '');
const origin = new URL(base).origin;
assert(['127.0.0.1', 'localhost', '::1', '[::1]'].includes(new URL(base).hostname), 'Esta comprobación solo admite un servidor local.');
const out = path.resolve('verificacion/conversion');
await fs.mkdir(out, {recursive:true});
const browser = await chromium.launch({executablePath:process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const context = await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
const page = await context.newPage();
const checks = [], errors = [], httpFailures = [], blockedExternal = [], interceptedContact = [], accessibility = [];
page.on('pageerror', error => errors.push(error.message));
page.on('response', response => {if(response.status() >= 400) httpFailures.push({url:response.url(),status:response.status()});});
await context.route('**/*', async route => {
  const request = route.request(), url = new URL(request.url());
  if (url.origin !== origin) {blockedExternal.push({url:request.url(),method:request.method()});return route.abort('blockedbyclient');}
  if (url.pathname === '/api/contact') {
    if (request.method() === 'GET') return route.fulfill({json:{mode:'draft'}});
    if (request.method() === 'POST') {
      const data = request.postDataJSON();
      interceptedContact.push(data);
      return route.fulfill({json:{mode:'draft',email:composeEmail(data),message:'Consulta preparada; prueba local sin envío.'}});
    }
  }
  return route.continue();
});
const visit = async route => page.goto(base + route, {waitUntil:'networkidle'});
const fits = async label => assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),false,`Desborde horizontal: ${label}`);
const screenshot = async name => page.screenshot({path:path.join(out,name + '.png')});
async function axe(route) {
  const result = await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  accessibility.push({route,violations:result.violations.map(issue => ({id:issue.id,impact:issue.impact,description:issue.description,nodes:issue.nodes.map(node => ({target:node.target,summary:node.failureSummary}))}))});
}
function whatsappText(href) {const url = new URL(href);assert.equal(url.hostname,'wa.me');assert.equal(url.pathname,'/56966003771');return url.searchParams.get('text') || '';}
function emailBody(href) {assert(href.startsWith('mailto:starwinchile@gmail.com?'));return new URL(href).searchParams.get('body') || '';}

try {
  await visit('/');
  assert.equal(await page.locator('h1').count(),1);
  assert.equal(await page.locator('.home-hero a[href^="/cotizador/"],.site-header a[href^="/cotizador/"],.footer-contact a[href^="/cotizador/"]').count(),0);
  assert.equal(await page.locator('.home-hero a[href^="https://wa.me/"]').count(),1);
  assert.equal(await page.locator('.home-hero a[href="/contacto/#consulta"]').count(),1);
  assert.equal(await page.locator('.header-actions a').innerText(),'Contactar');
  assert.equal(await page.locator('.home-resources a[href="/herramientas/"]').count(),1);
  assert.equal(await page.locator('.home-inquiry a[href^="https://wa.me/"]').count(),1);
  assert.equal(await page.locator('.home-inquiry a[href="/contacto/#consulta"]').count(),1);
  assert.equal(await page.locator('[data-project-guide]').count(),0,'El orientador se encuentra en herramientas, no en la portada.');
  assert.equal(interceptedContact.length,0);
  checks.push('Portada, cabecera y cierre priorizan WhatsApp/correo; estimador fuera de sus acciones. Herramientas es un enlace secundario.');
  for (const width of [320,360,390,430,768,1440]) {
    await page.setViewportSize({width,height:900});await fits(`home/${width}`);
    if ([320,390,1440].includes(width)) {
      await page.evaluate(() => scrollTo(0,0));
      await page.locator('.hero-media img').evaluate(image => image.decode());
      await screenshot(`home-${width}`);
    }
  }
  await page.setViewportSize({width:390,height:844});
  const quickContact = page.locator('.mobile-contact');
  await page.waitForFunction(() => document.querySelector('.mobile-contact')?.hidden === true);
  assert.equal(await quickContact.isVisible(),false,'La barra no debe competir con el hero.');
  const showcase = page.locator('[data-opening-showcase]');
  assert.equal(await showcase.locator('[data-opening-choice]').count(),3);
  // Wait until the hero contacts leave the viewport before expecting the quick bar.
  await showcase.locator('.opening-stage').first().evaluate(element=>scrollTo(0,element.getBoundingClientRect().top+scrollY-100));
  await page.waitForFunction(()=>document.querySelector('.mobile-contact')?.hidden===false);
  for(const [name,title] of [['Corredera','Corredera Serie Pro70'],['Oscilobatiente','Oscilobatiente'],['Proyectante','Proyectante']]){
    const button=showcase.getByRole('button',{name,exact:false});await button.click();
    assert.equal(await button.getAttribute('aria-pressed'),'true');
    assert.equal(await showcase.locator('[data-opening-panel]:not([hidden]) h3').innerText(),title);
    await fits('apertura '+name);
  }
  await screenshot('aperturas-390');
  await page.getByRole('button',{name:'Abrir menú',exact:true}).click();
  assert.equal(await page.locator('.main-nav').isVisible(),true);
  assert.equal(await page.locator('.main-nav a[href^="/cotizador/"]').count(),0);
  await screenshot('menu-390');await page.keyboard.press('Escape');
  await page.locator('.site-footer').scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.querySelector('.mobile-contact')?.hidden === true);
  assert.equal(await quickContact.isVisible(),false,'El contacto del pie sustituye la barra flotante.');
  await page.evaluate(() => scrollTo(0,0));await axe('/');

  await visit('/herramientas/');
  const guide = page.locator('section[data-project-guide]');
  await guide.scrollIntoViewIfNeeded();
  assert.equal(await guide.locator('[data-guide-choice]').count(),5);
  for (const item of [
    {label:'Frío',heading:'Frío y corrientes de aire',slug:'pvc-y-termopanel',keyword:'frío'},
    {label:'Ruido',heading:'Ruido del exterior',slug:'ventanas-y-ruido',keyword:'ruido'},
    {label:'Humedad',heading:'Humedad en la ventana',slug:'condensacion-en-ventanas',keyword:'humedad'},
    {label:'Renovar',heading:'Cambiar ventanas existentes',slug:'instalacion-ventanas-concepcion',keyword:'cambiar'},
    {label:'Obra nueva',heading:'Ventanas para una obra nueva',slug:'elegir-apertura-ventana',keyword:'obra nueva'},
  ]) {
    const choice = guide.getByRole('button',{name:item.label,exact:true});
    await choice.click();
    assert.equal(await choice.getAttribute('aria-pressed'),'true');
    assert.equal(await guide.locator('button[aria-pressed="true"]').count(),1);
    assert.equal(await guide.locator('[data-guide-heading]').innerText(),item.heading);
    assert.equal(new URL(await guide.locator('[data-guide-link]').getAttribute('href'),base).pathname,`/blog/${item.slug}/`);
    assert(whatsappText(await guide.locator('[data-guide-whatsapp]').getAttribute('href')).toLowerCase().includes(item.keyword));
    assert(emailBody(await guide.locator('[data-guide-email]').getAttribute('href')).toLowerCase().includes(item.keyword));
  }
  await guide.getByRole('button',{name:'Humedad',exact:true}).click();
  await guide.locator('.project-guide-links').scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.querySelector('.mobile-contact')?.hidden === true);
  assert.equal(await page.locator('.mobile-contact').isVisible(),false,'El orientador ya ofrece contactos y debe ocultar la barra flotante.');
  await screenshot('orientador-390');await fits('orientador/390');await axe('/herramientas/');
  checks.push('Aperturas seleccionables sin desbordar la página; acabados en su destino propio. Orientador en herramientas: cinco necesidades, selección única, guía y mensajes contextuales. Menú móvil sin estimador directo. Barra visible en aperturas y oculta ante contactos de hero, orientador, consulta y pie.');

  await visit('/preparar-proyecto/');
  assert.equal(await page.locator('.mobile-contact').count(),0);
  assert.equal(await page.locator('.guide-check-items input[type=checkbox]').count(),6);
  assert.equal(await page.locator('[data-brief-field][required]').count(),0);
  const beforeBrief = interceptedContact.length;
  await page.getByLabel('Comuna',{exact:true}).fill('San Pedro de la Paz');
  await page.getByLabel('Tipo de proyecto',{exact:true}).selectOption({label:'Recambio de ventanas'});
  await page.getByLabel('Cantidad aproximada',{exact:true}).fill('3');
  await page.getByLabel('Qué necesitas',{exact:true}).fill('Quiero revisar las ventanas de dos dormitorios. Todavía no tengo las medidas.');
  const message = await page.locator('#guide-message').inputValue();
  assert(message.includes('Comuna: San Pedro de la Paz') && message.includes('Cantidad aproximada: 3') && message.includes('Tipo de proyecto: Recambio de ventanas'));
  assert.equal(whatsappText(await page.locator('[data-brief-whatsapp]').getAttribute('href')),message);
  assert.equal(emailBody(await page.locator('[data-brief-email]').getAttribute('href')),message);
  assert.equal(interceptedContact.length,beforeBrief,'El brief no debe enviar datos al servidor.');
  for (const width of [320,390,768,1440]) {await page.setViewportSize({width,height:900});await fits(`brief/${width}`);}
  await page.setViewportSize({width:320,height:900});await page.locator('.guide-brief-body').scrollIntoViewIfNeeded();await screenshot('brief-320');
  const inputFonts = await page.locator('[data-brief-field]').evaluateAll(nodes => nodes.map(node => parseFloat(getComputedStyle(node).fontSize)));
  assert(inputFonts.every(size => size >= 16),'Los campos móviles deben evitar zoom de foco por tipografía menor de 16px.');
  await page.locator('#guide-check-0').check();
  assert.equal(await page.locator('#guide-check-0').isChecked(),true);
  assert.equal(await page.evaluate(() => Object.keys(localStorage).some(key => /brief|guide|project/i.test(key))),false);
  await axe('/preparar-proyecto/');
  await page.emulateMedia({media:'print'});
  assert.equal(await page.locator('.guide-brief').isVisible(),false);
  assert.equal(await page.locator('.guide-print-contact').isVisible(),true);
  await page.setViewportSize({width:1000,height:1300});await page.evaluate(() => scrollTo(0,0));await screenshot('checklist-impresion');
  await page.emulateMedia({media:'screen'});
  checks.push('Brief opcional: seis puntos, resumen y destinos consistentes, ningún POST ni almacenamiento propio; 320–1440 px sin desbordes, campos de 16px y composición imprimible.');

  await page.setViewportSize({width:390,height:844});await visit('/contacto/#consulta');
  assert.equal(await page.locator('.mobile-contact').count(),0);
  await page.locator('.contact-form-panel').scrollIntoViewIfNeeded();
  await screenshot('contacto-formulario-390');
  const form = page.locator('form[data-contact-form]');
  const beforeForm = interceptedContact.length;
  assert.equal(await form.locator('input[name=phone][required],input[name=city][required]').count(),0);
  assert.equal(await form.locator('input[name=phone]').isVisible(),false,'Datos opcionales deben permanecer plegados al inicio.');
  await form.locator('[data-submit]').click();
  assert.equal(await form.locator('[name=name]').getAttribute('aria-invalid'),'true');
  assert.equal(interceptedContact.length,beforeForm,'La validación incompleta debe resolverse antes de enviar.');
  await form.getByLabel('Tu nombre',{exact:false}).fill('Prueba local conversión');
  await form.getByLabel('Correo electrónico',{exact:false}).fill('prueba@example.com');
  await form.getByLabel('Cuéntanos tu proyecto',{exact:false}).fill('Quiero orientación para cambiar dos ventanas en Concepción. No tengo medidas exactas.');
  await form.locator('[name=consent]').check();
  assert.equal(interceptedContact.length,beforeForm,'Rellenar y autorizar no deben enviar la consulta.');
  await form.locator('[data-submit]').click();
  await form.locator('.mail-draft').waitFor({state:'visible'});
  assert.equal(interceptedContact.length,beforeForm + 1);
  assert.equal(interceptedContact.at(-1).consent,true);
  assert.equal(interceptedContact.at(-1).kind,'Hogar');
  assert(emailBody(await form.locator('[data-open-mail]').getAttribute('href')).includes('No tengo medidas exactas.'));
  assert.equal(context.pages().length,1,'Preparar consulta no debe abrir una aplicación externa.');
  await screenshot('contacto-borrador-390');
  for (const width of [320,390,768,1440]) {await page.setViewportSize({width,height:900});await fits(`contacto/${width}`);}
  await page.setViewportSize({width:320,height:900});await form.locator('.mail-draft').scrollIntoViewIfNeeded();await screenshot('contacto-borrador-320');
  await axe('/contacto/');
  checks.push('Contacto: datos opcionales plegados, errores sin POST, rellenar no envía; un envío explícito interceptado prepara correo sin abrir apps. Sin barra fija sobre el formulario y sin desbordes.');

  await visit('/empresas/');
  assert.equal(await page.locator('.mobile-contact').count(),0);
  assert.equal(await page.locator('form[data-contact-form] input[name=company][required]').count(),0);
  assert.equal(await page.locator('form[data-contact-form] input[name=kind]').inputValue(),'Empresa / arquitectura');
  await fits('empresas/320');await axe('/empresas/');
  await visit('/ventanas/');
  assert.equal(await page.locator('.cta-section a[href^="/cotizador/"]').count(),0);
  assert.equal(await page.locator('.cta-section a[href^="https://wa.me/"]').count(),1);
  assert.equal(await page.locator('.cta-section a[href="/contacto/#consulta"]').count(),1);
  checks.push('Empresas permite empresa opcional y no muestra barra sobre el formulario. CTA compartida orienta a conversación y correo.');

  const noJs = await browser.newContext({javaScriptEnabled:false,viewport:{width:320,height:900},deviceScaleFactor:1});
  await noJs.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort('blockedbyclient'));
  const staticPage = await noJs.newPage();
  await staticPage.goto(base + '/preparar-proyecto/',{waitUntil:'networkidle'});
  assert.equal(await staticPage.locator('.guide-check-items input[type=checkbox]').count(),6);
  await staticPage.locator('#guide-check-1').check();
  assert.equal(await staticPage.locator('#guide-check-1').isChecked(),true);
  assert.equal(await staticPage.locator('.guide-summary').isVisible(),false);
  assert.equal(await staticPage.locator('[data-brief-whatsapp]').isVisible(),true);
  await staticPage.screenshot({path:path.join(out,'checklist-sin-javascript-320.png')});
  await noJs.close();
  checks.push('Sin JavaScript: lista marcable y contactos directos disponibles; no aparece un resumen que no se pueda actualizar.');

  assert.deepEqual(errors,[],'Errores de ejecución en página.');
  assert.deepEqual(httpFailures,[],'Respuestas HTTP fallidas.');
  assert.deepEqual(blockedExternal,[],'La página intentó cargar un recurso externo; fue bloqueado.');
  assert.equal(accessibility.reduce((sum,result) => sum + result.violations.length,0),0,'Hay observaciones axe pendientes.');
  const report = {date:new Date().toISOString(),success:true,browser:'Chrome headless propio; emulación táctil, sin dispositivo físico',base,checks,errors,httpFailures,blockedExternal,contactPostsIntercepted:interceptedContact.length,contactDelivery:'Todas las llamadas de contacto fueron interceptadas localmente; ningún correo ni WhatsApp enviados.',accessibility};
  await fs.writeFile(path.join(out,'conversion-check.json'),JSON.stringify(report,null,2));
  console.log(JSON.stringify({success:true,checks:checks.length,contactPostsIntercepted:interceptedContact.length,axeViolations:0},null,2));
} catch (error) {
  await fs.writeFile(path.join(out,'conversion-check.json'),JSON.stringify({date:new Date().toISOString(),success:false,error:String(error),checks,errors,httpFailures,blockedExternal,contactPostsIntercepted:interceptedContact.length,accessibility},null,2));
  await screenshot('error');
  throw error;
} finally {await browser.close();}

