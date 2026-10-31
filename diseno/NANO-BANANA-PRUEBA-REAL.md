# Nano Banana 2.1 · prueba real

27 de octubre de 2026, America/Santiago. Actualiza la restricción de presupuesto cero del documento anterior: el cliente indica haber agregado dinero y autoriza implementar y probar Nano Banana 2.1.

## Implementación

- Modelo exacto `gemini-nano-banana-2.1` y clave privada en `.env`.
- Edición por Interactions API oficial: imagen base64 y plantilla acotada a ventanas, respuesta JPEG 1K inline. `store:false`, sin búsqueda externa, pensamiento mínimo y máximo 4.096 tokens de salida.
- Dos solicitudes por sesión, cinco globales por 24 horas, una concurrente. Idempotencia y ausencia de reintentos automáticos conservadas.
- Diagnóstico 402 separado como `provider_billing`, suspensión de nuevas llamadas después del error y pausa persistente local mediante `VISUALIZER_BILLING_HOLD=true` hasta resolver el estado de cuenta.
- La UI muestra el mensaje de disponibilidad del servidor, sin exponer clave, identificador del modelo ni datos de facturación.

## Prueba real y bloqueo concreto

Se subió `public/images/fixed-960.webp` desde Chrome móvil emulado, se eligió Corredera Serie Pro70 y acabado Antracita y se autorizó el envío. Dos intentos explícitos separados devolvieron HTTP 202 local y después estado `failed`. El rechazo del proveedor es HTTP 402. No se generó una imagen y no se acredita calidad de edición, comparación ni descarga real del proveedor.

La primera respuesta genérica motivó una segunda prueba de diagnóstico. Una vez identificado el 402, no se hacen más intentos sin cambio del estado de la cuenta. Los tests ordinarios verifican resultado/comparación/descarga con transporte simulado, claramente separado de la prueba externa.

AI Studio se inspeccionó en modo de lectura. La fila de la clave configurada corresponde a «Proyecto de Gemini». Su cuenta de facturación muestra crédito disponible CLP 0, aviso de saldo pendiente y requisito de crédito disponible superior a USD 0 para reanudar el servicio. También muestra créditos de Google Cloud aptos, distintos del saldo prepago disponible. La otra cuenta visible requiere configurar prepago. No se modificaron cuentas, tarjetas, recargas ni ajustes de facturación.

La pantalla correspondiente queda preparada para que el cliente revise dónde se aplicó su recarga. Tras verificar saldo prepago disponible en esa cuenta, retirar la pausa local, reiniciar y ejecutar una sola prueba externa para completar la validación visual.

## Evidencia

- `verificacion/nano-banana-live/first-rejected.json`: primer intento.
- `verificacion/nano-banana-live/report.json`: segundo intento.
- `verificacion/nano-banana-live/provider-rejection.log`: HTTP 402, sin secretos ni fotografías.
- `verificacion/nano-banana-live/estado-facturacion.png`: estado de AI Studio.
- `scripts/visualizer-live-check.mjs`: prueba externa explícita, fuera de npm test.

Fuentes oficiales: [edición de imágenes](https://ai.google.dev/gemini-api/docs/image-generation), [formato y código payment_required](https://ai.google.dev/gemini-api/docs/api-errors), [facturación prepago](https://ai.google.dev/gemini-api/docs/billing). El 402 indica saldo prepago agotado; la elegibilidad y aplicación de una recarga deben revisarse en AI Studio.
