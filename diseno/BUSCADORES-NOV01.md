# Visibilidad y conexión con buscadores · 1 de noviembre de 2026

## Alcance real

La web usa el dominio canónico https://starwinpvc.cl, una sede real en Concepción y cobertura en las 33 comunas del Biobío. La integración de buscadores no cambia el diseño, el motor de precios ni los contactos.

| Canal | Implementación o estado | Límite de la comprobación |
| --- | --- | --- |
| Google Search Console | Se conservan la propiedad `sc-domain:starwinpvc.cl` y los dos registros DNS de verificación existentes. Sitemap anunciado en robots y URL antigua redirigida. | No se pudo operar la sesión autenticada ni enviar el sitemap desde el panel. |
| Bing y red IndexNow | Archivo público de verificación, envío de las URL del rediseño y automatización de notificaciones después de publicar. | Un recibo HTTP 200/202 no prueba indexación ni equivale a reclamar la propiedad en Bing Webmaster Tools. |
| Yandex, Naver, Seznam, Yep y otros participantes | El endpoint global de IndexNow comparte las notificaciones con sus participantes. | No se crean ni se declaran verificadas cuentas individuales. |
| DuckDuckGo y Yahoo | Sitio rastreable y notificaciones a la red de Bing. | No se afirma haber conectado un panel independiente ni que reciban cada URL por IndexNow. |
| Buscadores con IA | HTML estático, schema, canónicas, sitemap y `llms.txt`; robots permite el rastreo público. La configuración consultada de Cloudflare no activa bloqueo general de búsqueda o bots IA. | `llms.txt` es auxiliar; no acredita inclusión ni recomendaciones de una IA. |
| Google Business Profile / Maps, Bing Places, Apple Business Connect | Datos de empresa coherentes preparados en `src/config/site.ts`. Se mantiene una sede, sin crear ubicaciones ficticias por comuna. | Las fichas requieren acceso a la cuenta propietaria y, cuando corresponda, verificación del proveedor. No se modificaron ni se duplicaron fichas. |

## IndexNow

`public/indexnow-key.txt` es exclusivamente la prueba pública de control para IndexNow. No es una credencial de Google, Microsoft o Cloudflare. La petición especifica su `keyLocation` en la raíz del dominio.

`scripts/indexnow.mjs` lee el sitemap público, limita todas las URL al dominio canónico y excluye API, credenciales en URL, parámetros y fragmentos. La primera ejecución notifica las páginas del rediseño reciente. Las siguientes comparan contenido público con un registro persistido: texto, metadatos, imágenes, enlaces y JSON-LD. No notifican por cambios aislados de CSS o JavaScript. Las URL retiradas del sitemap se notifican para que el buscador reevalúe su estado. Los estados HTTP de error detienen el envío sin actualizar el registro. No se reintentan automáticamente las notificaciones rechazadas.

`.github/workflows/indexnow.yml` espera la verificación satisfactoria de un push a `main` del propio repositorio y luego comprueba el SHA publicado en `/build-revision.txt`. No notifica previews, forks, pull requests ni una versión todavía sin desplegar. Los permisos de GitHub se limitan a lectura del contenido. El registro se conserva en la caché de Actions; el recibo se conserva como artefacto durante 30 días. Si la caché se elimina, la próxima ejecución hará una nueva notificación inicial.

Comandos: `node scripts/indexnow.mjs` prepara el informe sin enviar; `node scripts/indexnow.mjs --submit` notifica y actualiza el registro tras HTTP 200/202. En CI se exige además `INDEXNOW_EXPECTED_REVISION`. Una respuesta 202 se registra como recibida y pendiente de verificación de la clave; no se presenta como indexación completada.

## Acceso pendiente a paneles

Se buscó una integración específica para Search Console y Bing. La integración encontrada para métricas de Google es de lectura y no sustituye la presentación autenticada de sitemaps. No se conectaron intermediarios ni se contrataron servicios.

El control de Chrome se detuvo al no poder verificar con seguridad la URL de la pestaña. No se intentó sortear ese bloqueo ni leer cookies, perfiles, contraseñas o tokens del navegador. Para operar los paneles hace falta una sesión accesible y autenticada del propietario.

Propiedad Google: https://search.google.com/search-console?resource_id=sc-domain%3Astarwinpvc.cl

Sitemap que corresponde enviar: https://starwinpvc.cl/sitemap-index.xml

Bing Webmaster Tools: https://www.bing.com/webmasters/

## Fuentes oficiales

- Protocolo y verificación: https://www.indexnow.org/documentation
- Participantes, automatización y límites: https://www.indexnow.org/faq
- Descubrimiento de sitemaps de Google: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- Origen de los resultados de DuckDuckGo: https://duckduckgo.com/duckduckgo-help-pages/results/sources
- Requisitos de rastreo para ChatGPT: https://help.openai.com/en/articles/12627856
- Google Business Profile: https://business.google.com/
- Bing Places y soporte por país: https://www.bing.com/forbusiness/help/modernExperience?setlang=en
- Apple Business Connect: https://businessconnect.apple.com/

Los recibos de la ejecución real se conservan en `verificacion/indexnow/` y en GitHub Actions. No se garantiza indexación, posición, tráfico, leads ni plazo de aparición.
