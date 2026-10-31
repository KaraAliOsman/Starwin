# Starwin · showroom de ventanas

Astro con 35 páginas HTML, 34 URL indexables y 50 redirecciones permanentes. Identidad cian/oro, Switzer de Indian Type Foundry y composición móvil propia. Dos secuencias reversibles controladas por scroll: acercamiento a través del paño hasta el ambiente y despliegue de tres acabados. Implementación nativa para PC y celular, sin interceptar los gestos ni cargar una biblioteca de animación.

## Ejecutar

Node 22.16 o superior. Ejecutar `npm run build` y `npm run start`. [Vista local](http://127.0.0.1:3006/?v=scroll-escenas). El servidor sirve `dist`; tras editar, repetir el build. Después de modificar `.env`, reiniciar el servidor. `npm run dev` permite desarrollo con recarga. No borrar `node_modules` recursivamente: es un enlace al entorno preparado.

## Diseño y negocio

La dirección está en [DESIGN.md](DESIGN.md). La revisión vigente es [Scroll narrativo](diseno/SCROLL-NARRATIVO-OCT31.md); sustituye las entradas temporizadas de la revisión anterior. La [portada de Patagonia chilena](diseno/PORTADA-PATAGONIA-OCT31.md) reemplaza la sala por una vista de los Cuernos del Paine y lago Pehoé. `node scripts/scroll-story-review.mjs` comprueba las dos escenas en cinco tamaños, avance/retorno, selección y movimiento reducido. `node scripts/record-scroll-stories.mjs` graba el recorrido continuo de PC y celular.

Cotizar abre WhatsApp, correo y estimador opcional. Hero invita a explorar. Se conservan fotografías de aperturas, selección táctil de acabados, 3D opcional y PDF de varias ventanas. La primera ventana es fija blanca de 100 × 100 cm con termopanel. «Corredera Serie Pro70». Nota vigente: «Referencia sujeta a revisión de medidas, configuración y factibilidad.». No se menciona IVA en la UI; el PDF añade + IVA pequeño junto al total final únicamente. Motor original Starwinpvc: 945 equivalencias de precios verificadas.

## Generación gratuita de muestras

La conexión implementada usa la API pública del espacio oficial Qwen Image Edit 2511 en Hugging Face, no un servicio de inferencia de pago. Requiere `HF_TOKEN` propio de una cuenta personal gratuita. Configuración en `.env`:

```dotenv
VISUALIZER_PROVIDER=qwen-space
VISUALIZER_ALLOW_FREE_GENERATION=true
HF_TOKEN=
GEMINI_ALLOW_PAID_GENERATION=false
```

No se incluyen claves en el código ni en el build. La credencial propia está configurada localmente y autentica correctamente. El espacio oficial rechazó la duración GPU y la variante Fast terminó en RuntimeError; ninguna prueba autenticada produjo una imagen. La generación real sigue pendiente del proveedor. Sin token, Generar permanece deshabilitado. Las cuentas PRO/desconocidas se rechazan antes de subir la foto para evitar consumo de créditos tras la cuota gratuita. La oferta gratuita tiene cola y cuota diaria; no proporciona capacidad continua para todos los visitantes.

Las fotos se envían solo al generar con consentimiento, se normalizan y se eliminan de este servicio al caducar. El espacio público del proveedor tiene condiciones propias: los archivos remotos no deben considerarse privados. Cancelar no garantiza detener una operación externa iniciada. No se reintenta una generación automáticamente ni se cambia a Google de forma silenciosa.

Google queda como adaptador alternativo separado, sujeto a habilitación explícita de pago. El formulario sigue preparando borradores de correo hasta configurar el servicio de envío.

## Comprobar

- `npm test`: 35 pruebas, incluyendo precios originales, SEO, formularios y APIs simuladas.
- `npm run typecheck` y `npm run check`: tipos, metadatos, sitemap, enlaces, archivos y schema.
- `npm run test:browser`: recorrido funcional de navegación, formulario, estimador, PDF, 3D y visualizador simulado.
- `node scripts/performance-check.mjs inicio`: Lighthouse móvil local. Última medición: 99 rendimiento y 100 accesibilidad/buenas prácticas/SEO; LCP 2,1 s, CLS 0, TBT 0 ms.
- Prueba real del visualizador: únicamente con credencial propia y `STARWIN_ALLOW_LIVE_IMAGE_TEST=1 node scripts/visualizer-live-check.mjs`. Hace una sola generación y conserva el informe; no forma parte de las pruebas automáticas.

Son tamaños y red emulados en Chrome. No son datos de teléfono físico, ranking, indexación ni conversión. No se publicó en GitHub o Cloudflare. Chile y Bolivia necesitan identidad comercial, precios, moneda y SEO independientes.
