# Imagen de portada · Patagonia chilena

Pedido: sustituir la fotografía de la portada por Patagonia chilena. Se conserva la composición de la ventana y el recorrido reversible del scroll. La fotografía inicial y la vista final usan el mismo paisaje.

Fotografía de Marek Piwnicki: Cuernos del Paine y lago Pehoé, Parque Nacional Torres del Paine, Chile. Fuente: [Unsplash](https://unsplash.com/it/foto/una-catena-montuosa-con-un-lago-in-primo-piano-wgsu3WzFZ5c). La [licencia Unsplash](https://unsplash.com/license) permite uso comercial y no exige atribución. El autor, origen, licencia, hash y transformaciones se registran en `procedencia/imagenes/patagonia/manifest.json`, sin añadir leyendas a la portada. No se presenta como una obra ejecutada por Starwin.

PC: variante de 1920 px. Móvil: recorte vertical centrado en los Cuernos, con archivos de 480 y 720 px. AVIF principal y WebP de respaldo; el AVIF móvil de 720 px pesa 60 KB. El original permanece fuera de los archivos públicos. Preparación reproducible con `node scripts/prepare-patagonia.mjs`.

Se comprueba la portada inicial, el acercamiento y la vista final con `scripts/scroll-story-review.mjs`, que recorre dos escenas en cinco tamaños e incluye retorno, movimiento reducido y ausencia de JavaScript. Build y enlaces/metadatos correctos. Sin publicación externa.
