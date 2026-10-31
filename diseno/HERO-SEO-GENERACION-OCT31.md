# Hero, SEO y generación · 31 de octubre de 2026

> Documento histórico. La fotografía rectangular y la tipografía de esa revisión fueron rechazadas. Decisiones y estado actual del proveedor en [Portada Switzer](PORTADA-SWITZER-OCT31.md).

## Decisión del cliente y ajuste visual

El cliente confirmó que le gusta el concepto del hero actual. Se conserva la dirección de producto, tipografía y cian. La fotografía de escritorio antes tenía márgenes verticales del 13 % y, en tablet, del 25/20 %: esos límites se veían a través del vidrio y dejaban el ambiente cortado sobre el azul.

Se cambió únicamente el encuadre de la fotografía a altura completa en escritorio, manteniendo su inicio horizontal y la escala del render. La composición móvil sigue siendo propia. No se generó ni modificó la fotografía.

`verificacion/hero-encuadre/revision.json` comprueba que imagen y hero tengan los mismos extremos verticales en siete tamaños: 1024×768, 1440×768, 1440×900, 1920×1080, 2560×1440, 390×844 y 320×568. Sin desbordes. Capturas en esa carpeta. Chrome con tamaños emulados; no acredita teléfono físico.

## SEO y rendimiento

La comprobación del build pasó en 35 páginas y 34 URL indexables: títulos y descripciones únicos, canónicas limpias, idiomas, robots, sitemap, redirecciones, enlaces, anclas, imágenes y datos estructurados. La identidad de empresa, WebSite, WebPage, productos, breadcrumbs y artículos es coherente con el contenido visible. No se inventaron valoraciones, precios de venta finales, coordenadas ni prestaciones para conseguir resultados enriquecidos.

El contenido de marketing llega como HTML estático; estimador, PDF y 3D no se cargan con la portada. Robots bloquea las APIs; `llms.txt` es un índice factual auxiliar, no una instrucción de clasificación. La disponibilidad del visualizador no se presenta como un servicio ilimitado.

Lighthouse móvil local de esta revisión: 99 rendimiento, 100 accesibilidad, 100 buenas prácticas y 100 SEO; LCP 2,0 s, TBT 0 ms y CLS 0. El recorrido funcional auditado detectó cero infracciones Axe. No se ha verificado indexación, Search Console, ranking ni conversión porque la versión sigue sin publicar. Los informes están en `verificacion/`.

## Generador gratuito: proveedor elegido y prueba real

Se preparó un adaptador para la API pública del [espacio oficial Qwen Image Edit 2511](https://huggingface.co/spaces/Qwen/Qwen-Image-Edit-2511). Es edición de imagen sobre la fotografía recibida; no se sustituye por generación de una casa aleatoria o un montaje SVG. La elección responde a preservación de imagen y disponibilidad de pesos abiertos, no a una afirmación de ser universalmente el mejor modelo.

Fuentes primarias consultadas:

- [Qwen Image Edit y capacidad de edición](https://huggingface.co/Qwen/Qwen-Image-Edit).
- [ZeroGPU: acceso gratuito y cuotas](https://huggingface.co/docs/hub/spaces-zerogpu): cupo anónimo de 2 minutos/día y cuenta gratuita de 5 minutos/día en la documentación consultada; cola y disponibilidad compartidas.
- [Spaces como API](https://huggingface.co/docs/hub/spaces-api-endpoints) y [autenticación para agentes](https://huggingface.co/docs/hub/spaces-agents).
- [Precios de Gemini API](https://ai.google.dev/gemini-api/docs/pricing): no confundir una web de consumo gratuita con una API de imágenes gratuita.
- [Pollinations, documentación oficial](https://gen.pollinations.ai/): exige clave propia; no se tomaron claves de terceros.

Se verificó el contrato publicado de Gradio del espacio oficial: subida de archivo, `/call/infer`, eventos SSE y galería de salida. Las pruebas anónimas reales, tanto del espacio oficial como de la variante Fast del mantenedor de Hugging Face, aceptaron upload y operación pero devolvieron `event: error` con `data: null`. No produjeron ninguna imagen. No se atribuye ese error a una causa concreta que el proveedor no comunicó, ni se declara comprobada la calidad del resultado. Se conservan respuestas en `verificacion/proveedor-gratuito/`.

La conexión autenticada queda preparada pero pendiente de `HF_TOKEN` propio. Sin ese token el botón de generación permanece deshabilitado. Se solicitó al cliente configurar la credencial en `.env`, sin publicarla en el chat. No hay credencial de Hugging Face disponible en la configuración local comprobada.

## Configuración y límites

```dotenv
VISUALIZER_PROVIDER=qwen-space
VISUALIZER_ALLOW_FREE_GENERATION=true
HF_TOKEN=
GEMINI_ALLOW_PAID_GENERATION=false
```

Después de introducir el token, reiniciar `npm run start`. La cuenta debe ser personal gratuita. Antes de subir una foto se verifica la clase de cuenta: una cuenta PRO o sin clasificación se rechaza porque ZeroGPU puede consumir créditos prepagados después de su cuota. No se llama al servicio de inferencia de pago ni se cambia automáticamente a Google. No se hacen reintentos automáticos.

El token se usa exclusivamente en servidor. Resultados de Gradio solo pueden descargarse del host oficial y de su directorio de archivos; no se siguen redirecciones. Entrada y salida tienen límites y se validan como imágenes. Se mantienen sesión, deduplicación, cuotas, cancelación y borrado locales.

El espacio del proveedor es público y sus archivos remotos no deben considerarse privados; la modalidad se identifica antes de enviar y la política de privacidad se actualizó. La eliminación en Starwin no controla la retención externa. El cliente aceptó usar servicios públicos, pero se conserva el consentimiento del visitante.

## Verificación de implementación

35 pruebas pasan, incluidas cinco nuevas sobre el adaptador gratuito: configuración, aislamiento frente al proveedor de pago, cuenta gratuita, SSE fragmentado, validación de salida y rechazo de cuota. Incluyen también las 945 equivalencias de precios originales. Las nuevas pruebas usan transportes simulados: no prueban una generación autenticada real.

Build, tipos, navegación, estimador, PDF, 3D opcional, anclas y nueve estados de movimiento correctos. El build público no contiene las credenciales locales. Para la prueba real pendiente se utiliza `STARWIN_ALLOW_LIVE_IMAGE_TEST=1 node scripts/visualizer-live-check.mjs`; hace una generación sobre una imagen de ejemplo, registra el resultado, permite comparar y descargar y verifica el borrado local.

No se publicó en GitHub ni Cloudflare. El concepto del hero es una preferencia explícita del cliente; las métricas y pruebas no equivalen a aprobación de todos los detalles ni garantizan posicionamiento.
