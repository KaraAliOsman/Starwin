# Starwin · showroom de ventanas

Astro con 36 páginas HTML, 35 URL indexables y 63 redirecciones permanentes. Ventanas de PVC para Concepción y las 33 comunas del Biobío. Identidad cian/oro, Switzer y portada de Patagonia chilena. Dos secuencias reversibles controladas por scroll, para PC y celular.

## Ejecutar

Node 22.16 o superior. Ejecutar `npm run build` y `npm run start`. [Vista local](http://127.0.0.1:3006/?v=scroll-escenas). El servidor sirve `dist`; tras editar, repetir el build. Después de modificar `.env`, reiniciar el servidor. `npm run dev` permite desarrollo con recarga. No borrar `node_modules` recursivamente: es un enlace al entorno preparado.

## Diseño y negocio

La dirección está en [DESIGN.md](DESIGN.md). La revisión vigente es [Scroll narrativo](diseno/SCROLL-NARRATIVO-OCT31.md); sustituye las entradas temporizadas de la revisión anterior. La [portada de Patagonia chilena](diseno/PORTADA-PATAGONIA-OCT31.md) reemplaza la sala por una vista de los Cuernos del Paine y lago Pehoé. `node scripts/scroll-story-review.mjs` comprueba las dos escenas en cinco tamaños, avance/retorno, selección y movimiento reducido. `node scripts/record-scroll-stories.mjs` graba el recorrido continuo de PC y celular.

Cotizar abre WhatsApp, correo y estimador opcional. Hero invita a explorar. Se conservan fotografías de aperturas, selección táctil de acabados, 3D opcional y PDF de varias ventanas. La primera ventana es fija blanca de 100 × 100 cm con termopanel. «Corredera Serie Pro70». Nota vigente: «Referencia sujeta a revisión de medidas, configuración y factibilidad.». No se menciona IVA en la UI; el PDF añade + IVA pequeño junto al total final únicamente. Motor original Starwinpvc: 945 equivalencias de precios verificadas.

## Visualizador en producción

Cloudflare Pages delega `/api/visualizations` al servicio `starwin-visualizer`. Usa FLUX.2 Klein 4B mediante el binding Workers AI y Durable Objects SQLite por sesión, más un coordinador del cupo global. No requiere publicar una API key ni utiliza la cola pública de Hugging Face. El modelo edita la foto recibida; se comprobó una generación real antes de conectarlo.

La foto se prepara en el navegador a 480 px, se decodifica y recodifica en servidor para retirar metadatos, y solo se envía tras consentimiento. Los resultados privados caducan en una hora. Idempotencia, borrado, aislamiento de sesiones y cupos persisten. Límite: tres solicitudes por sesión y 30 generaciones por día para el sitio; no se reintenta automáticamente ni se cambia a Google. La cuota gratuita de Cloudflare es compartida con otros usos de la cuenta y puede agotarse.

Fuente del Worker: `worker/visualizer.mjs`; empaquetado: `node scripts/build-worker.mjs`. Bindings: `AI`, `VISUALIZER_SESSIONS`, `VISUALIZER_BUDGET`; variable `VISUALIZER_ENABLED=true`. Pages usa `VISUALIZER_COORDINATOR` como service binding. Cambios al Worker requieren publicar también su bundle; el push a GitHub actualiza automáticamente las páginas mediante el proyecto Pages existente.

Los adaptadores anteriores de Qwen y Google permanecen aislados para desarrollo local y pruebas; no son el proveedor de producción. Los secretos locales no se incluyen en el repositorio.

Google queda como adaptador alternativo separado, sujeto a habilitación explícita de pago. El formulario de producción reutiliza Web3Forms, la integración de la web anterior, con `WEB3FORMS_ACCESS_KEY` guardada como secreto en Cloudflare. Solo anuncia un envío si el proveedor lo acepta expresamente. Sin credenciales, el entorno local prepara un borrador; Resend permanece como alternativa. No se ha comprobado recepción en la bandeja de entrada.

## Comprobar

- `npm test`: 42 pruebas, incluyendo precios originales, SEO, formularios, avisos IndexNow y almacenamiento/API de producción con transporte de IA simulado.
- `npm run typecheck` y `npm run check`: tipos, metadatos, sitemap, enlaces, archivos y schema.
- `npm run test:browser`: recorrido funcional de navegación, formulario, estimador, PDF, 3D y visualizador simulado.
- `node scripts/performance-check.mjs inicio`: Lighthouse móvil; la última medición contra el dominio público registró 91 en rendimiento y 100 en accesibilidad/buenas prácticas/SEO; LCP 3,2 s, CLS 0,001 y TBT 0 ms. Informe: `verificacion/rendimiento.json`.
- Prueba real del visualizador: únicamente con credencial propia y `STARWIN_ALLOW_LIVE_IMAGE_TEST=1 node scripts/visualizer-live-check.mjs`. Hace una sola generación y conserva el informe; no forma parte de las pruebas automáticas.

Son tamaños y red emulados en Chrome. No son datos de teléfono físico, ranking, indexación ni conversión. Publicado en https://starwinpvc.cl desde `KaraAliOsman/Starwin`, rama `main`, mediante Cloudflare Pages. El registro de publicación, recuperación y límites está en [PUBLICACION-BIOBIO-OCT31.md](diseno/PUBLICACION-BIOBIO-OCT31.md). El 1 de noviembre se envió el sitemap desde las propiedades existentes de Google Search Console y Bing Webmaster Tools: Google lo muestra como «Correcto» y Bing como «Success». Google también confirma que la página regional y el cotizador están indexados. Esto no acredita que todas las URL estén indexadas. Chile y Bolivia necesitan identidad comercial, precios, moneda y SEO independientes.

IndexNow notifica cambios públicos después de cada publicación verificada en `main`, mediante [Notify search engines](.github/workflows/indexnow.yml). El archivo de control solo sirve para este protocolo. Preparar sin enviar: `node scripts/indexnow.mjs`; enviar: añadir `--submit`. El estado de cada canal, los requisitos de acceso y los límites están en [BUSCADORES-NOV01.md](diseno/BUSCADORES-NOV01.md).
