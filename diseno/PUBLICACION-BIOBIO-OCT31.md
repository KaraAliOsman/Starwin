# Publicación Starwin · Biobío · 31 de octubre de 2026

## Destinos y recuperación

- Repositorio: https://github.com/KaraAliOsman/Starwin, rama `main`.
- Publicación: Cloudflare Pages, proyecto existente `starwin`, build `npm run build`, salida `dist`, Node 24.
- Dominio canónico: https://starwinpvc.cl. `www` apunta al mismo proyecto y redirige al canónico conservando la ruta.
- Respaldo de la versión anterior: rama `archive/pre-starwin-v3-20261031`, commit `b44313c2722b1dbb758b14f8dbd8429e102a4249`. Cloudflare conserva los despliegues anteriores para recuperación. No se reescribió el historial.
- El proyecto Pages sigue conectado al mismo repositorio. Los commits en `main` generan despliegues automáticamente. GitHub Actions verifica build, enlaces, tipos y pruebas.

## Cobertura y SEO

Se mantiene la sede física en Concepción y se amplía la cobertura declarada a toda la Región del Biobío, según confirmó el cliente. Portada, metadatos y servicios incorporan Biobío y Concepción de forma natural. Una sola página regional presenta las 33 comunas de las provincias de Concepción, Biobío y Arauco, información para coordinar traslados e instalación y enlaces a producto/contacto. No se crean páginas de comuna duplicadas ni sedes ficticias.

Datos estructurados: empresa, región administrativa, ciudades atendidas, servicio, productos, artículos y breadcrumbs coherentes. 36 páginas HTML, 35 URL indexables, 163 bloques schema y 61 redirecciones permanentes; sitemap y canónicas usan el mismo origen. El antiguo `/sitemap.xml` redirige al nuevo índice. Las rutas originales del cotizador y productos conservan destinos equivalentes.

Cloudflare Web Analytics ya estaba instalado para este dominio y continúa activo. Se actualiza la política de privacidad para describir esa medición. No se añade publicidad ni se duplican Google Tag Manager y GA4.

## Search Console

El cliente indicó la propiedad `sc-domain:starwinpvc.cl`. Se verificó por DNS público que siguen presentes los dos registros TXT de Google; no se modificaron. El dominio y la propiedad se conservan, por lo que no se necesita crear otra propiedad al cambiar la web.

Sitemap público: https://starwinpvc.cl/sitemap-index.xml. Su índice y sus 35 URL responden desde producción; robots lo anuncia y el antiguo sitemap redirige a él. No se pudo entrar al panel autenticado de Google: el navegador de automatización no estuvo disponible y el control de Chrome se detuvo por no poder verificar la URL. Por eso no se afirma haber enviado el sitemap en el panel, solicitado indexación, inspeccionado cobertura ni consultado datos de clics. El enlace facilitado no es una credencial de acceso.

## Visualizador corregido

Se publicó el servicio `starwin-visualizer`, con binding Workers AI y dos clases de Durable Objects SQLite. Las funciones de Pages lo invocan por `VISUALIZER_COORDINATOR`. Ya no dependen del marcador de producción deshabilitado ni de la cola de Hugging Face.

Modelo real: `@cf/black-forest-labs/flux-2-klein-4b`. Entrada: fotografía del visitante, preparada a 480 px y recodificada en servidor, más apertura/acabado. La propuesta es ilustrativa, no garantiza medidas ni fidelidad perfecta del herraje y no calcula precios. Tres solicitudes por sesión y 30 diarias para el sitio; las solicitudes no se repiten automáticamente. El cupo de Workers AI es compartido por la cuenta. No se contrató una suscripción.

Cada sesión almacena los resultados privadamente, con caducidad de una hora. Un objeto separado coordina el cupo global. Idempotencia, límites y aislamiento de sesiones se prueban con SQLite. Borrar una propuesta no restablece la cuota. Las claves locales no se incluyen en GitHub ni en archivos públicos.

Prueba real en https://starwinpvc.cl/visualizador/: un POST, HTTP 202, estado `ready` en 11,3 segundos, imagen JPEG de 768×576, comparación original/propuesta, descarga, acceso denegado desde otra sesión y borrado verificado. Informe local: `verificacion/cloudflare-production-live/report.json`. Se abrió y revisó la imagen generada. También se permite usar el servicio publicado desde el preview local mediante `VISUALIZER_REMOTE_ORIGIN=https://starwinpvc.cl`, sin copiar claves.

## Comprobaciones y límites

37 pruebas pasan, incluidas las 945 equivalencias de precios con el motor original y dos pruebas del servicio durable. Recorrido funcional del navegador: seis grupos, cero infracciones Axe. Scroll reversible: dos escenas en cinco tamaños, retorno y movimiento reducido. Verificación pública: portada, cobertura, producto, cotizador, visualizador, contacto, robots, sitemaps, llms, redirecciones y canonical www correctos.

La medición de carga se realiza contra el dominio real, no se confunde con localhost. Se prioriza el render principal del hero y se integra CSS en el HTML para eliminar dos peticiones que bloqueaban la primera pintura. Los resultados finales se registran en `verificacion/rendimiento.json` y `verificacion/produccion/`.

El correo del formulario conserva la modalidad de preparar un mensaje para enviarlo desde la aplicación del visitante; el envío directo requiere configurar un transporte y remitente verificados. WhatsApp, teléfono y correo directo están activos. No se declara comprobada una recepción de correo que no ocurrió.

No se garantiza posicionamiento ni número de clics. La verificación del navegador es emulada, no en teléfono físico. El SEO técnico, la publicación y la generación real son comprobaciones distintas.
