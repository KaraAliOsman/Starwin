# Visibilidad y conexión con buscadores · 1 de noviembre de 2026

## Alcance real

La web usa el dominio canónico https://starwinpvc.cl, una sede real en Concepción y cobertura en las 33 comunas del Biobío. La integración de buscadores no cambia el diseño, el motor de precios ni los contactos.

| Canal | Implementación o estado | Límite de la comprobación |
| --- | --- | --- |
| Google Search Console | Sesión del propietario accesible en el navegador integrado. Se envió `sitemap-index.xml` el 1/11/2026 en la propiedad existente `sc-domain:starwinpvc.cl`; confirmación explícita y estado «Correcto». Se conservan los dos registros DNS. | El nuevo índice aún mostraba 0 páginas descubiertas en la lectura inmediata; la indexación posterior no se da por completada. |
| Bing Webmaster Tools e IndexNow | Propiedad existente accesible. Se envió `sitemap-index.xml` el 1/11/2026; pasó de «Processing» a «Success / Successfully processed». IndexNow recibió primero las 35 URL con HTTP 202 y la siguiente notificación obtuvo HTTP 200. | El descubrimiento de URL sigue actualizándose; no se declaran 35 páginas indexadas por Bing. Las estadísticas IndexNow aún no reflejaban los envíos; sus recibos no acreditan indexación. |
| Yandex, Naver, Seznam, Yep y otros participantes | El endpoint global de IndexNow comparte las notificaciones con sus participantes. | No se crean ni se declaran verificadas cuentas individuales. |
| DuckDuckGo y Yahoo | Sitio rastreable y notificaciones a la red de Bing. | No se afirma haber conectado un panel independiente ni que reciban cada URL por IndexNow. |
| Buscadores con IA | HTML estático, schema, canónicas, sitemap y `llms.txt`; robots permite el rastreo público. La configuración consultada de Cloudflare no activa bloqueo general de búsqueda o bots IA. | `llms.txt` es auxiliar; no acredita inclusión ni recomendaciones de una IA. |
| Google Business Profile / Maps | Se accedió a la ficha existente STARWIN desde la cuenta comercial. El enlace apunta a `starwinpvc.cl`, la dirección y el teléfono coinciden con la web y la descripción declara Concepción y cobertura en toda la Región del Biobío. | Comprobación de la ficha existente; no se crearon ubicaciones ni se cambiaron nombre, dirección, horarios o reseñas. |
| Bing Places y Apple Business Connect | No se accedió a esas fichas ni se crearon cuentas. | Requieren acceso del propietario y, cuando corresponda, verificación del proveedor. No confundirlas con Bing Webmaster Tools. |

## IndexNow

`public/indexnow-key.txt` es exclusivamente la prueba pública de control para IndexNow. No es una credencial de Google, Microsoft o Cloudflare. La petición especifica su `keyLocation` en la raíz del dominio.

`scripts/indexnow.mjs` lee el sitemap público, limita todas las URL al dominio canónico y excluye API, credenciales en URL, parámetros y fragmentos. La primera ejecución notifica las páginas del rediseño reciente. Las siguientes comparan contenido público con un registro persistido: texto, metadatos, imágenes, enlaces y JSON-LD. No notifican por cambios aislados de CSS o JavaScript. Las URL retiradas del sitemap se notifican para que el buscador reevalúe su estado. Los estados HTTP de error detienen el envío sin actualizar el registro. No se reintentan automáticamente las notificaciones rechazadas.

`.github/workflows/indexnow.yml` espera la verificación satisfactoria de un push a `main` del propio repositorio y luego comprueba el SHA publicado en `/build-revision.txt`. No notifica previews, forks, pull requests ni una versión todavía sin desplegar. Los permisos de GitHub se limitan a lectura del contenido. El registro se conserva en la caché de Actions; el recibo se conserva como artefacto durante 30 días. Si la caché se elimina, la próxima ejecución hará una nueva notificación inicial.

Comandos: `node scripts/indexnow.mjs` prepara el informe sin enviar; `node scripts/indexnow.mjs --submit` notifica y actualiza el registro tras HTTP 200/202. En CI se exige además `INDEXNOW_EXPECTED_REVISION`. Una respuesta 202 se registra como recibida y pendiente de verificación de la clave; no se presenta como indexación completada.

La segunda ejecución permitió detectar que Cloudflare cambia la representación ofuscada del correo en cada respuesta, provocando diferencias falsas en 33 páginas. Se corrigió la huella para comparar la dirección pública estable sin desactivar la protección de Cloudflare. El registro pasa de versión 1 a 2 con una actualización inicial de la referencia de las URL existentes, sin volver a notificarlas; las nuevas y retiradas conservan sus avisos. Las ejecuciones siguientes vuelven a comparar cambios reales de contenido. Una prueba usa dos representaciones distintas observadas del mismo correo.

## Paneles conectados y revisión de migración

Se buscó una integración específica para Search Console y Bing. La integración encontrada para métricas de Google es de lectura y no sustituye la presentación autenticada de sitemaps. No se conectaron intermediarios ni se contrataron servicios.

El primer intento de control de Chrome se detuvo al no poder verificar con seguridad la URL. Después, el propietario abrió las sesiones en el navegador integrado y confirmó que estaban listas. Se operaron esas sesiones mediante la interfaz de los propios servicios, sin extraer cookies, perfiles, contraseñas ni tokens. Ambos paneles confirmaron el envío; los comprobantes están en `verificacion/buscadores-paneles/`.

La inspección individual de Google confirma «La URL está en Google / La página está indexada» tanto para `/ventanas-pvc-biobio/` como para `/cotizador/`. No se solicitaron rastreos duplicados de estas páginas ni se extrapola ese resultado a todas las URL.

El informe de datos estructurados de Google, actualizado al 29/10/2026, mostraba un error histórico detectado en 2025 en `/blog-comparativa-materiales`. La ruta sin extensión devolvía 404 después de la migración, mientras su variante `.html` ya redirigía. Se publicaron redirecciones 301 directas para las variantes sin extensión, con y sin barra final, al artículo equivalente `/blog/pvc-o-aluminio/`. Sus cinco bloques JSON-LD actuales se analizaron correctamente. El total de reglas permanentes pasa de 61 a 63. Se comprobaron ambas redirecciones en producción. Después se solicitó «VALIDAR CORRECCIÓN» y Google confirmó «Resultado de la validación: iniciada · Fecha de inicio: 1/11/26». El informe aún no se declara resuelto.

Propiedad Google: https://search.google.com/search-console?resource_id=sc-domain%3Astarwinpvc.cl

Sitemap enviado en ambos paneles: https://starwinpvc.cl/sitemap-index.xml

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
