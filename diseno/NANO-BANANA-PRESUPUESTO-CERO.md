# Nano Banana · presupuesto cero

Verificado el 27 de octubre de 2026, zona America/Santiago.

El cliente autoriza configurar su clave, pero indica presupuesto cero. La credencial se guarda únicamente en `.env`, excluido por `.gitignore`, y no se reproduce en este informe. No se ha activado facturación ni solicitado una generación real.

## Evidencia oficial

- [Modelo Nano Banana 2.1](https://ai.google.dev/gemini-api/docs/models/gemini-nano-banana-2.1): identificador estable `gemini-nano-banana-2.1`.
- [Precios](https://ai.google.dev/gemini-api/docs/pricing): entrada y salida de Nano Banana 2.1 no disponibles en Free Tier. Lo mismo se indica para los otros modelos de imagen admitidos por el adaptador. Los límites diarios de solicitudes no constituyen una cuota gratuita.
- [Facturación](https://ai.google.dev/gemini-api/docs/billing): el crédito Welcome de Google Cloud no puede aplicarse a Gemini API/AI Studio. Las promociones de otros productos no acreditan saldo o cuota en esta cuenta.
- [Claves](https://ai.google.dev/gemini-api/docs/api-key): credenciales estándar y de autorización; mantener la clave del lado del servidor.

## Verificación realizada

Una única petición autenticada GET de metadatos al endpoint oficial `/v1beta/models/gemini-nano-banana-2.1` devolvió HTTP 200 y el identificador esperado. Esto acredita aceptación de la credencial para metadatos; no acredita cuota de imágenes, nivel de facturación, saldo, permisos de generación ni calidad visual.

El control `GEMINI_ALLOW_PAID_GENERATION` es `false` por defecto y en la configuración local. Solo el valor exacto `true` habilita el acceso a generación junto con proveedor, clave y modelo válidos. No se cambia a ese valor sin nueva autorización de presupuesto. Se comprueba tanto en el servicio como en el adaptador directo. Los cupos adicionales se fijan en una operación por sesión, una global diaria y concurrencia uno; no sustituyen el bloqueo de pago.

Después de reiniciar la vista previa, la API pública informa `available:false` y el POST de generación responde HTTP 503 sin llamar a Google. Escaneo de 453 archivos públicos: clave ausente. Pruebas locales: 29 correctas, incluidas cuatro variantes de autorización de pago bloqueadas y transporte simulado. No se enviaron fotos a Google.

La preparación y previsualización de la fotografía siguen funcionando. La generación automática no está operativa con presupuesto cero. Las pruebas gratuitas que puedan ofrecer las interfaces de Gemini/AI Studio son una modalidad distinta y no se automatizan ni se presentan como una API gratuita para visitantes de Starwin.

Evidencia sin secretos: `verificacion/nano-banana-zero-budget.json`. La integración continúa pendiente de un presupuesto autorizado o de una oferta oficial de generación por API gratuita verificada posteriormente.
