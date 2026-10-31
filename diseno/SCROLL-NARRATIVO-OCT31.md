# Movimiento ligado al recorrido · 31 de octubre de 2026

## Decisión

La última revisión de entradas y máscaras temporizadas fue rechazada por básica y repetitiva. Esta versión sustituye ese enfoque en la portada. La tipografía Switzer, las imágenes reales existentes y la identidad cian/oro permanecen. No se añaden imágenes de referencias ni afirmaciones comerciales nuevas.

Se aplican Apple Design, Animate, Motion Art Direction y Animation Performance: manipulación continua, reversibilidad, coherencia espacial, un motivo para cada desplazamiento y contenido completo con movimiento reducido. No se copia una animación concreta de Apple ni se declara equivalencia de calidad con su producción.

## Dos escenas, dos funciones

**Del producto al ambiente.** El render y el recorte del ambiente forman una abertura. Al desplazar, la cámara se aproxima al paño izquierdo, evitando el encuentro central, y el marco sale del campo por ampliación. El ambiente amplía su superficie visible sin huecos de fondo. La transparencia del vidrio se retira cuando el marco ya ha salido de la vista; el resultado es la sala a pantalla completa. «Abre la vista» entra al final. La invitación a explorar permanece operativa y permite ir al catálogo sin recorrer la escena. El acercamiento es una transición visual entre producto y vivienda, no una simulación de la apertura del herraje.

La imagen usa el mismo punto focal que el encuadre inicial. Su escala se limita para cubrir cada parte de la abertura que se descubre. Marco, máscara y cámara se calculan desde las dimensiones reales del render de 900×1125. El fondo no se estira: la imagen mantiene su relación de aspecto. En móvil la cámara parte de la composición vertical; en PC parte del encuadre lateral.

**Comparar el acabado.** Los tres renders permanecen opacos. En PC se despliegan hasta una comparación de igual escala. En móvil parten de una muestra y se separan en una comparación de tres, dimensionada para el ancho disponible. Los selectores siguen funcionando: ponen en primer plano el acabado elegido y conservan esa selección al activar movimiento reducido. No se repite el acercamiento del hero en esta sección.

## Implementación y rendimiento

El scroll nativo determina el estado, sin interceptar wheel ni touchmove, sin inercia añadida ni temporizadores que terminen por su cuenta. Puede detenerse y retroceder en cualquier punto. El contenedor sticky reserva el recorrido desde CSS; enlaces y anclas conservan su destino.

Un rAF agrupa las actualizaciones de cada escena. Las medidas se leen al cambiar tamaño o cargar activos; durante el recorrido se escriben transform, opacity y la máscara de la abertura. No se actualiza estado React, no se carga GSAP para estas escenas y no hay bucles permanentes cuando el usuario deja de desplazar. El recorrido usa svh para no cambiar al ocultarse la barra del teléfono. Las imágenes de acabados se anticipan al acercarse, sin competir desde el inicio con la portada. La foto inicial y la de llegada comparten la variante AVIF y su respaldo WebP.

Se retiraron las entradas genéricas de imágenes de la home. Los elementos de lectura y formularios permanecen quietos. Se conservan respuestas al toque, selector de aperturas y menú.

Sin JavaScript o con movimiento reducido: hero y acabados estáticos, contenido y controles completos, sin retención. La preferencia puede cambiar con la página abierta. Si falla la imagen necesaria para el acercamiento, el hero vuelve a la composición estática.

## Evidencia

- `scripts/scroll-story-review.mjs`: cinco tamaños (320×568, 390×844, 768×900, 1440×720 y 1440×900), dos escenas en nueve posiciones cada una, incluyendo retorno a la posición inicial. Sin desbordes ni errores JS. Selección de acabado y conservación al cambiar a movimiento reducido; ancla Explorar y funcionamiento sin JS.
- `scripts/motion-system-review.mjs`: nueve posiciones de acabados en escritorio, separación final, opacidad constante, retorno y funcionamiento en móvil.
- `scripts/anchor-motion-check.mjs`: enlaces de acabados y exploración llegan a sus márgenes. Espera el destino real del desplazamiento suave, sin asumir una duración fija.
- `npm run test:browser`: seis grupos funcionales, estimador/PDF/3D y cero infracciones Axe. El transporte del generador de imágenes es simulado, sin generación externa en esta prueba.
- `npm test`: 35 pruebas, incluidas 945 equivalencias de precios con el original.
- Inspector visual: 0 FAIL a 1440, 768 y 390; hojas revisadas. Las advertencias sobre títulos fijados sobre fotografía se contrastaron con fotogramas: el título inicial ya es transparente en el ambiente; el título final usa un fondo neutro para legibilidad. El contador de elementos móviles sigue bajo su recomendación: aquí se privilegian dos secuencias continuas sobre animar todos los bloques.

Fotogramas e informes: `verificacion/scroll-stories/`. Vídeos de recorrido natural en `recorrido-1440.webm` y `recorrido-390.webm`, con avance, pausa y retroceso. Los índices de fotogramas son muestras instrumentadas; los vídeos recorren el scroll sin pausar las animaciones. La grabación incluye tiempos entre frames, sin que eso acredite fluidez en hardware móvil real.

Se extrajeron y revisaron seis fotogramas directamente de los vídeos. En estas grabaciones locales: mediana de 6,9 ms entre rAF y cero intervalos mayores de 34 ms en ambos tamaños. Lighthouse móvil del build final: rendimiento 99, accesibilidad 100, buenas prácticas 100, SEO 100; LCP 2,1 s, CLS 0, TBT 0 ms. No son métricas de campo.

Chrome emulado. No se comprobó teléfono físico, Safari en iOS ni conversión comercial. No se publicó en GitHub o Cloudflare. El estado del proveedor gratuito del visualizador no cambia en esta revisión.

## Crítica visual

ROUND 3
Seen in one second: una ventana blanca contiene un ambiente, sobre el cian de Starwin.
Idea (one sentence): la abertura del producto se convierte en el umbral entre su vista de estudio y el espacio habitable.
Live thing: recorrer y revertir ese umbral, comparar tres acabados y elegir uno con el pulgar.
Layout words by section: hero=umbral / aperturas=índice / acabados=despliegue / material=galería / herramientas=foto y utilidad / guías=lectura / contacto=imagen y campo cian.
Scores: design 7.0 · usability 8.0 · creativity 7.0 · content 7.5 → overall 7.4
Caps applied: idea aplicable a otros fabricantes, creatividad ≤7; contador still-page del inspector mantiene diseño ≤7. No se añaden movimientos irrelevantes para cambiar la cifra.
Top three problems (most visible first), each with the screenshot it shows in and the fix:
1. `scroll-story-oct31/mobile-page-01.jpg`: la comparación final reduce el tamaño de cada muestra. Se mantiene la selección táctil grande y el acceso a la página de acabados para ver un producto mayor.
2. `scroll-story-oct31/tablet-page-01.jpg`: la composición inicial de tablet conserva más campo cian que la de móvil. Se comprueba la acción visible y el encuadre completo.
3. `scroll-story-oct31/desktop-page-02.jpg`: las fotografías tienen iluminación diversa; no se reeditan activos sin una decisión de dirección fotográfica. Se mantiene el material preferido por el cliente.

Esta es una autocrítica, no una aceptación del usuario ni una garantía de originalidad universal.
