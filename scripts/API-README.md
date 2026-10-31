# Backend local: visualización fotográfica y contacto

Implementación de la API preparada el 19 de octubre de 2026 y habilitación intentada el 27 de octubre. Nano Banana 2.1 está configurado con una credencial privada real y autorización de pago del cliente. La prueba real desde la UI fue rechazada por Google con HTTP 402; no se obtuvo una imagen. Los tests ordinarios siguen usando respuestas y credenciales ficticias.

## Ejecutar

Desde `outputs/starwin-v3`, copiar `scripts/env.example` a `.env` y configurar los secretos localmente. `.env` debe permanecer excluido del repositorio. Los comandos del proyecto cargan ese archivo desde Node; Vite no publica variables sin el prefijo público.

- `npm run dev`: Astro y API en `http://127.0.0.1:3006`.
- `npm run build` y `npm start`: sirve `dist/` y la misma API.
- `node --test tests/visualizer-api.test.mjs tests/contact.test.mjs`: pruebas del contrato y transporte con mocks.

La generación está deshabilitada si falta `GEMINI_PROVIDER=google`, `GEMINI_API_KEY`, un `GEMINI_IMAGE_MODEL` permitido o la autorización explícita `GEMINI_ALLOW_PAID_GENERATION=true`. Por defecto esta última variable es `false`: presupuesto cero. Elegir Google solo si la credencial fue emitida por ese proveedor. Una clave de otro distribuidor de Nano Banana requiere otro adaptador verificado; no se envía por suposición a Google.

Después de un rechazo HTTP 402, el servicio suspende nuevas llamadas para no repetir el rechazo. `VISUALIZER_BILLING_HOLD=true` permite conservar esa pausa al reiniciar el proceso local. Tras verificar saldo disponible y estado activo de la cuenta correcta, quitar la pausa y reiniciar. La autorización de pago no equivale a saldo confirmado.

La configuración local actual usa Nano Banana 2.1, imagen JPEG 1K, pensamiento mínimo y tope de 4.096 tokens de salida. Sin herramientas de búsqueda ni reintentos automáticos. Cupo local: dos solicitudes por sesión, cinco globales por 24 horas y concurrencia uno. Son límites de solicitudes; el consumo exacto se consulta en la cuenta Google y la memoria del servidor se reinicia al cerrar el proceso.

Prueba externa, separada de las suites ordinarias: `STARWIN_ALLOW_LIVE_IMAGE_TEST=1 node scripts/visualizer-live-check.mjs`. Ese script hace una solicitud de generación desde la UI y puede consumir saldo. No ejecutarlo automáticamente cuando existe un rechazo 402 pendiente de resolver.

Al 27 de octubre de 2026, la tarifa oficial de Nano Banana 2.1 y del resto de modelos de imagen permitidos no incluye free tier de imágenes por API. Un límite diario de solicitudes no acredita gratuidad y no limita por sí solo el importe. No habilitar facturación, pago ni generación hasta que el cliente autorice un presupuesto. Probar imágenes manualmente en Gemini/AI Studio no acredita una cuota gratuita utilizable desde el sitio.

## Contrato del navegador

Todas las rutas están en el mismo origen. Usar cookies del mismo origen (`credentials: 'same-origin'`, el valor predeterminado de `fetch`). Primero consultar config para establecer la sesión; un POST sin sesión vigente devuelve 428 antes de llamar al proveedor. Las respuestas privadas llevan `Cache-Control: private, no-store` y `X-Robots-Tag: noindex, nofollow`.

| Operación | Contrato |
| --- | --- |
| `GET /api/visualizations/config` | Devuelve `available`, `provider`, `message`, `models`, `finishes`, `maxUploadBytes`, `maxInputPixels`, `retentionHours`, `sessionLimit`. Crea cookie de sesión HttpOnly, SameSite Strict. No devuelve la clave ni el identificador interno del modelo de IA. |
| `POST /api/visualizations` | `multipart/form-data` con `photo`, `model`, `finish`, `consent=true`; cabecera `Idempotency-Key` de 16–100 caracteres (UUID recomendado). Devuelve `jobId`, `statusUrl` y estado con HTTP 202 si trabaja en segundo plano. Si termina inmediatamente, HTTP 200 con el estado final. |
| `GET /api/visualizations/:jobId` | Estado privado de la sesión: `queued`, `generating`, `ready` o `failed`. Incluye selección, fechas, `result` o `error`. Los identificadores ajenos o caducados responden 404. |
| `GET /api/visualizations/:jobId/image` | Imagen binaria privada, disponible solo cuando el estado es `ready`; no contiene una URL pública del proveedor. |
| `DELETE /api/visualizations/:jobId` | Elimina foto y resultado propios, aborta la espera del proveedor de mejor esfuerzo. Una llamada ya enviada puede haber sido procesada/cobrada. No permite reutilizar su clave de idempotencia para generar otro cargo accidental. |

`model`: `sliding2`, `casement`, `tilt`, `awning`, `fixed`. Son modelos de ventana, no nombres de modelos Gemini. `finish`: `BLANCO`, `ANTRACITA`, `NEGRO`, `NOGAL`, `ROBLE_DORADO`, `WINCHESTER`, `ROBLE_MONTANA`.

El objeto de estado contiene:

```json
{
  "jobId": "identificador-aleatorio",
  "status": "ready",
  "model": "sliding2",
  "finish": "BLANCO",
  "createdAt": "fecha ISO",
  "expiresAt": "fecha ISO",
  "result": {
    "url": "/api/visualizations/identificador-aleatorio/image",
    "mimeType": "image/jpeg",
    "width": 1536,
    "height": 1024
  },
  "error": null
}
```

La UI debe reutilizar la misma clave únicamente al consultar o recuperar **la misma operación**. Una selección/foto nueva necesita una clave nueva. No repetir automáticamente un POST por timeout ni inventar porcentajes de progreso. Si se corta la respuesta, consultar el trabajo ya conocido o reenviar manualmente la operación idéntica con la misma clave y sesión; el backend deduplica. Un fallo `provider_uncertain` no se reenvía a Google al consultar ni al duplicar el POST.

Sin configuración, el POST responde 503 y explica que la foto no fue enviada. No hay imagen de demostración que se presente como resultado del cliente. La foto puede previsualizarse localmente antes de generar; únicamente al confirmar se transmite al backend y al proveedor.

## Adaptador oficial Google verificado

Fuentes primarias consultadas el 19 de octubre de 2026:

- [Guía de generación y edición de imágenes](https://ai.google.dev/gemini-api/docs/image-generation).
- [Referencia Gemini Interactions API](https://ai.google.dev/api/interactions-api).
- [Claves de Gemini](https://ai.google.dev/gemini-api/docs/api-key).
- [Condiciones Gemini API](https://ai.google.dev/gemini-api/terms).
- [Tarifas vigentes](https://ai.google.dev/gemini-api/docs/pricing).

Se usa el destino fijo `POST https://generativelanguage.googleapis.com/v1beta/interactions`, cabecera `x-goog-api-key`, entradas de texto e imagen base64, y `store: false`. La respuesta REST se interpreta desde `steps` de tipo `model_output`, contenido de tipo `image`. No se utiliza el atajo `output_image` del SDK como si fuese un campo REST garantizado, ni se sigue una URL de imagen arbitraria.

La selección de modelo es exclusivamente del servidor. La lista permitida, verificada en esas fuentes, incluye `gemini-nano-banana-2.1`, `gemini-3.1-flash-lite-image`, `gemini-3.1-flash-image`, `gemini-3-pro-image` y `gemini-2.5-flash-image`. Su disponibilidad para una cuenta y su facturación requieren validación real al habilitar la cuenta. No se fija ni promete una tarifa. `store:false` evita solicitar almacenamiento recuperable en Interactions; no equivale a una promesa sobre toda la retención o tratamiento de datos de Google.

La plantilla solicita sustituir la ventana principal, conservar el hueco/contexto y usar el modelo/acabado elegidos. La IA puede equivocarse. El resultado debe rotularse como simulación y revisarse; no mide, certifica viabilidad, determina instalación ni calcula precios. El backend no acepta prompts libres ni endpoints elegidos desde el navegador.

## Validación, privacidad y límites locales

- JPEG/PNG/WebP, una imagen, máximo 12 MiB y 40 megapíxeles; firma binaria y dimensiones comprobadas antes de decodificar. Rechazo de MIME falso, imagen animada y HEIC sin conversión silenciosa.
- Sharp decodifica de verdad en Node, orienta según EXIF, elimina metadatos y normaliza a JPEG de hasta 2048 px por lado antes del envío. La salida también se decodifica y normaliza. Una imagen corrupta, respuesta de texto, salida incompleta o MIME inconsistente nunca se declara exitosa.
- Sesión aleatoria en cookie HttpOnly, SameSite Strict; Secure en HTTPS. Las mutaciones requieren `Origin` idéntico y se rechaza `Sec-Fetch-Site: cross-site`. No se habilita CORS.
- Cupo por sesión: 3 por 24 h; global: 30 por 24 h; concurrencia: 2. Configurables con topes defensivos. La reserva es atómica en el proceso, anterior a la llamada del proveedor. Borrar un resultado no devuelve el cupo. La cuota global limita el gasto incluso si se cambian cookies; no sustituye un control distribuido de abuso.
- Máximo 50 trabajos y 64 MiB retenidos; sesión y trabajos caducan a las 24 h. El proceso borra originales al completar y realiza limpieza periódica cada minuto. No escribe fotos al disco ni registra cuerpos, fotos, prompts o secretos. Reiniciar elimina todos los trabajos locales y reinicia los cupos en memoria.
- Tiempo de espera del proveedor: 120 s; no hay reintentos automáticos. La cancelación local no garantiza cancelar cargos externos.

La expiración local no define la retención del proveedor. El visitante debe ver, antes de generar, que enviará su foto a Google; evitar fotos con personas o datos personales. No afirmar que la foto permanece en el dispositivo.

## Contacto

`GET /api/contact` informa `mode: draft|send`. Sin `RESEND_API_KEY` y `CONTACT_FROM`, el POST prepara un enlace `mailto:`; no anuncia envío. Con ambos, utiliza Resend con destino fijo `starwinchile@gmail.com`, valida campos/consentimiento/origen, aplica un límite de cinco envíos por diez minutos y solo anuncia envío tras aceptación HTTP del transporte. Esa aceptación no acredita recepción en la bandeja. El remitente debe estar verificado por Resend antes de uso real.

## Preparación para Cloudflare, sin despliegue

`visualizer-core.mjs` usa Web APIs, sin Node. Recibe adaptadores `provider`, `store`, `normalizePhoto`, `normalizeResult` y ciclo de vida (`waitUntil` o `schedule`). `MemoryVisualizationStore` sirve únicamente al proceso local. Su contrato de reserva debe convertirse en transacción atómica al implementar almacenamiento durable; sus métodos actuales son síncronos, por lo que un adaptador remoto requiere cambiar la capa de orquestación, no simplemente pasar una promesa como store.

La entrada Pages de contacto ya está separada. La del visualizador reenvía a un futuro service binding `VISUALIZER_COORDINATOR`; sin ese binding permanece deshabilitada. Se evita habilitar una variante insegura con cupos distintos por isolate. La publicación posterior debe aportar coordinación durable de cuotas/idempotencia, almacenamiento privado y caducidad, normalización compatible con el runtime, secretos y controles de abuso. No hay infraestructura creada, binding inventado como operativo ni generación real acreditada.
