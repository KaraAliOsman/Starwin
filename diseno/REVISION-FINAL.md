# Revisión final · reconstrucción de arquitectura

23 de octubre de 2026. Sustituye las revisiones estéticas de la versión rechazada. El revisor adicional falló por exceso de contexto; la comprobación visual final se realizó manualmente en este hilo. No se presenta como revisión independiente ni aprobación del cliente.

## Persistencia

PRODUCT.md conserva la verdad comercial y registra el rechazo. DESIGN.md y .impeccable/design.json describen la nueva implementación. Dirección y fuentes en diseno/reconstruccion-oct23. Ejecución delegada por el cliente sin nuevas preguntas; no existe una maqueta aprobada contra la cual afirmar fidelidad exacta.

## Composición revisada

Capturas de 390 × 844 y 1440 × 1000: oferta visible, CTA, foto vertical/horizontal, navegación y fotografía sin deformación. Recorrido nuevo desde arquitectura a aperturas, detalle, herramientas y contacto. El catálogo tiene filas de producto; contacto presenta primero el formulario en móvil; las guías combinan una fotografía destacada con una lista breve.

La adaptación conserva BauFens como referencia de escala, materia y recomposición; no es una reproducción literal de su portada. Créditos explícitos para referencias Internorm, Deceuninck y Finstral. Se preservan las imágenes originales de apertura Starwin para no inventar sistemas ni herrajes.

## Ajustes realizados tras inspección

- La imagen de apertura ocupa un campo completo, sin miniatura flotante sobre otra superficie.
- Título móvil y enlace de colección se separan para evitar una columna de texto demasiado estrecha.
- Contraste corregido en los números del selector y el cierre cian: texto pequeño oscuro, título grande blanco.
- Capturas realizadas desde el inicio, con imágenes decodificadas y sin foco accidental en el enlace de salto. Se sustituyó una captura que mostraba el logo sin decodificar; el recurso respondió y se decodificó correctamente en verificación directa.
- Frase introductoria breve para que no quede partida en tres líneas junto al botón en teléfono.

## Pruebas

- Build y TypeScript correctos. Validación estática: 31 páginas, 30 URL en sitemap y 50 redirecciones; títulos, descripciones, canónicos, enlaces y anclas comprobados.
- Integración completa: seis grupos, cero errores de página/HTTP y cero infracciones Axe en los ámbitos examinados. Presupuesto de varias ventanas, total original $1.622.053, PDF auténtico y 3D opcional comprobados.
- Interfaz nueva: todos los selectores; cinco anchos sin desborde; movimiento reducido y teclado sin transición; fallo de imagen preserva la escena anterior y permite reintentar. `verificacion-interfaz.json`.
- Cotizar: tres destinos reales, foco, Escape, fondo, ocho tamaños, texto doble, formulario, estimador, ruta sin JavaScript y redirecciones. `cotizar/resultado.json`.
- Detector: 162 avisos de diferencia contra los tokens de la versión rechazada (60 de color, 99 de tamaño, 3 de radio), sin otra categoría. Se actualizó la documentación de la nueva dirección. Los avisos no acreditan ni refutan calidad visual.
- Lighthouse local: 95/100/100/100, LCP 2,9 s, TBT 0 ms, CLS 0. No prueba conversión ni posiciones, y LCP todavía supera 2,5 s en esa simulación.

## Límites y conservación

Móvil emulado, no dispositivo físico. Nano Banana y correo directo necesitan configuración; se probaron estados locales y transporte simulado sin transmitir a terceros. No se publicó. Mantener precios originales, logo, cian/oro, acceso directo al cotizador y el diálogo de tres opciones. La valoración estética final corresponde al cliente.
