# Portada móvil y tipografía · 31 de octubre de 2026

> El movimiento temporizado de esta revisión fue rechazado. [Scroll narrativo](SCROLL-NARRATIVO-OCT31.md) contiene la implementación vigente; mantiene Switzer y el material fotográfico.

## Decisiones vigentes

La foto rectangular a altura completa y Bricolage Grotesque fueron rechazadas. Se recupera el concepto preferido por el cliente: el ambiente sale de la ventana y mantiene el cian Starwin alrededor. Este documento sustituye las decisiones de `HERO-SEO-GENERACION-OCT31.md`.

Switzer, de Indian Type Foundry, procede del [paquete oficial de Fontshare](https://www.fontshare.com/fonts/switzer). Un archivo variable WOFF2 original, sin modificar, alojado localmente y precargado. Licencia FFL 2.0 y procedencia en `public/fonts/Switzer-FFL.txt` y `Switzer-origin.json`. Uso comercial y alojamiento propio permitidos. Títulos, texto y navegación comparten familia. Se retiraron las precargas anteriores; estimador autónomo y PDF mantienen su tipografía.

En móvil hay tres áreas: lectura, escenario y exploración. La frase factual «Fabricamos e instalamos / a tu medida, en Concepción» sustituye texto sobre fotografía oscurecida. El título ocupa dos líneas en blanco. La altura se adapta a teléfonos cortos.

## Escenario y movimiento

El render de 900×1125 y la fotografía comparten el tamaño real pintado mediante `contain`, calculado con unidades de contenedor. El ambiente empieza detrás del marco; un polígono sigue su perspectiva y evita cian dentro del vidrio superior. No se editó ni se generó la fotografía.

El ambiente se despliega desde el vidrio hacia la derecha durante 1100 ms con la curva de desaceleración existente. Marco y fotografía se asientan juntos 12 px en móvil, manteniendo el registro. Una sola entrada después de decodificar imágenes y fuentes. Texto visible desde el inicio; scroll libre. Sin JavaScript o con movimiento reducido se entrega el encuadre final.

Se conservan el indicador compartido de aperturas, cambios instantáneos con teclado, imagen saliente debajo de la nueva, comparación opaca de acabados, cancelación y estados del menú.

## Referencias observadas y adaptación

- BauFens: extracción local `starwin-preparacion-diseno/02-BAUFENS-EVIDENCIA.md`. Producto dominante y composición de capas. Adaptación: ventana y ambiente en una misma geometría, identidad Starwin.
- [In Common With en Mobbin](https://mobbin.com/sites/sections/a87f2a50-8a78-4193-b491-5589059041fa): fotografía arquitectónica grande, controles discretos. Se observó la captura; no se copió su imagen ni se atribuye movimiento a ella.
- [Vizcom en Mobbin](https://mobbin.com/sites/sections/c97fa837-3f6c-40d3-84aa-0db5484f710f): producto y jerarquía de controles. Una sola invitación a explorar en el hero.
- Design Taste, Animate y Motion Art Direction: composición propia para móvil, escala y movimiento con propósito.

## Evidencia y límites

`scripts/hero-mobile-review.mjs` verifica nueve encuadres entre 320×568 y 1920×1080, fuente cargada, ausencia de desbordes, áreas sin solapamiento, exploración en primera pantalla, aperturas rápidas, teclado, menú/Escape, movimiento reducido y sin JavaScript. Capturas, cinco fotogramas intermedios y WEBM en `verificacion/umbral-mobile/`.

Inspector del build: 0 FAIL a 1440, 768 y 390 px; Switzer en el 100 % del texto medido; once títulos de dos líneas como máximo. Se revisaron todas las hojas de página. Advertencias: escala histórica con muchos tamaños, ausencia de vídeo propio de fabricación, movimiento concentrado en imágenes, galería móvil con siguiente foto parcialmente visible y heurística que no reconoce el contexto de fabricación bajo el título. No se añaden entradas idénticas a todo el texto para inflar el contador de movimiento.

Recorrido funcional final: seis grupos de comprobaciones y cero infracciones Axe; cinco herramientas adicionales también sin infracciones. Escena de acabados comprobada en nueve posiciones y retorno, con comparación estática intencional en móvil. Lighthouse móvil local: rendimiento 98, accesibilidad/buenas prácticas/SEO 100, LCP 2,3 s, CLS 0 y TBT 4 ms. La grabación natural, sin pausar las animaciones, está en `verificacion/umbral-mobile/portada-movil.webm`. Se verificó además el retorno del movimiento del selector tras cambiar la preferencia del sistema.

Build, tipos, SEO local y 35 pruebas pasan; incluyen 945 equivalencias del precio original. Chrome emulado, sin teléfono físico. No acredita ranking, indexación ni conversión. Sin publicación en GitHub/Cloudflare. No se añadieron fotografías; se conserva el registro de activos existente.

## Generación gratuita: resultado real

Credencial propia configurada exclusivamente en `.env`. Autenticación correcta y cuenta personal gratuita verificada. Qwen Image Edit 2511 no produjo imagen: el SDK oficial comunicó «The requested GPU duration (360s) is larger than the maximum allowed». La variante Fast de Hugging Face terminó en `RuntimeError`; tampoco produjo imagen.

La generación real sigue pendiente del proveedor. No se evaden cuotas ni se rotan cuentas. Google permanece deshabilitado para evitar gasto. No se usan claves de terceros. El ciclo de interfaz subir/esperar/comparar/descargar/borrar se verifica con transporte simulado separado.
