> Revisión histórica rechazada. La dirección implementada vigente está en [Producto y claridad](DIRECCION-PRODUCTO.md).

# Starwin · el marco como sistema

Revisión posterior al rechazo de la repetición de composiciones del showroom. Esta dirección sustituye la alternancia de bloques de media pantalla de la revisión anterior; no supone aprobación del cliente.

## Idea y argumento

El marco de PVC de Starwin pasa a ser la forma de encuadrar producto, material y vivienda. La firma es un rectángulo abierto, con márgenes y escala definidos; la identidad sigue siendo Figtree, cian #1595c3, oro #feba25 y tinta #17272d. Un estilo común no requiere repetir una distribución.

Inventario real: fabricación a medida en Concepción; dirección Pedro de Valdivia 733; atención por WhatsApp y correo; Pro70; cinco aperturas; siete colores consultables; tres renders del mismo producto; fotos de vidrio, manilla y perfiles; estimador original de varias ventanas con PDF; 3D opcional; visualizador fotográfico sujeto a disponibilidad; mayoría de tráfico móvil.

| Pieza | Composición | Afirmación verificable |
|---|---|---|
| Hero | Capas de producto y vivienda | Ventanas a medida, fabricación e instalación en Concepción |
| Aperturas | Índice de producto, imagen y ficha | Cinco maneras de abrir, con la fotografía original de cada una |
| Acabados | Escenario central con encuadre fijo | Tres materiales sobre una misma geometría |
| Detalles | Galería editorial de escalas diferentes | Vidrio, manilla y acabado como decisiones separadas |
| Herramientas | Dos piezas visuales de distinta escala y un índice compacto | Visualizar, estimar, comparar y preparar medidas |
| Guías | Lectura por temas, sin otro panel dividido | Resolver precio, material y apertura |
| Contacto | Vivienda a sangre, apertura del encuadre y datos reales | Iniciar la conversación con lo que el cliente tenga |

Se retira la sección de proceso con otra fotografía y tres párrafos: el recorrido queda resumido junto al contacto y enlaza al proceso completo. No se agregan slogans, cifras ni testimonios.

## Referencias concretas

- BauFens: evidencia archivada en `BAUFENS-MOVIMIENTO-OCT23.md`; producto por capas y escala material. Se conserva su principio, sin atribuir sistemas o prestaciones del proveedor a Starwin.
- [Kinfolk, galería editorial](https://mobbin.com/sites/sections/6733adc0-959f-4d37-afec-0977605d2d9d): imágenes de tamaños distintos con una lectura coherente. Se adapta la distribución a vidrio/manilla/perfil; no sus fotografías o tipografía editorial.
- [In Common With, detalle y material](https://mobbin.com/sites/sections/ccb238a7-2d59-4b67-8225-5db269bcbd0b): relación entre objeto y detalle, con espacio y encuadres distintos. Se elimina su texto largo.
- La nueva ficha `.taste-skill/oct28-motion/` selecciona `one-motif`: el rectángulo del marco ordena encuadres y transiciones. El héroe móvil conserva la composición solicitada; no se deforma el logo ni se recortan controles.

## Lenguaje de movimiento

Intención: preciso, material, continuo. Calma con un único momento dominante. Jerarquía: producto principal → otros acabados → encuadre. Texto, CTA, precios y formularios no compiten con el producto.

| Propiedad | Regla |
|---|---|
| Curva | `.22,1,.36,1`, ya existente |
| Unidad | 200 ms; controles 140–240 ms; cambios de material 280 ms; entrada escénica 800 ms |
| Familia | Abrir un encuadre y alinear capas del mismo objeto |
| Firma | Tres acabados se alinean en un producto central al recorrer el estudio |
| Desplazamiento | Nativo, sin capturar rueda ni suavizar touch |
| Móvil | Estudio en reposo, sin longitud extra; controles táctiles, selección rápida y galería horizontal nativa |
| Movimiento reducido | Composición final visible, sin parallax ni escena retenida; selección inmediata |
| Fallo de carga | Contenido y enlaces completos, sin zona vacía |

La escena retenida adapta las garantías de `design-taste-frontend/assets/scenes/stage.js`: composición estática por defecto, matchMedia, limpieza al cambiar preferencias, ScrollTrigger y refresco después de imágenes/fuentes. GSAP 3.15.0 se sirve localmente y se carga solo para la escena de escritorio. No se incorpora Lenis.

La escena debe verificarse en varios progresos del desplazamiento, incluyendo retorno, cambio de tamaño y movimiento reducido. El conteo de animaciones o Lighthouse no acredita su calidad.

## Revisión realizada

- `verificacion/motion-system/revision.json`: nueve estados de la secuencia, transformaciones observadas, regreso al inicio, cambio de preferencia, galería y fallback sin JavaScript.
- `verificacion/motion-system/acabados-desplazamiento.webm`: grabación de Chrome local con avance y regreso reales, sin sonido ni montaje de imágenes.
- `scripts/anchor-motion-check.mjs`: enlaces directos y CTA Explorar. La inicialización espera el reposo del desplazamiento nativo antes de refrescar la escena para no interrumpir la navegación.
- `verificacion/diseno-oct28/`: capturas actualizadas de portada, catálogo, estudio, contacto y guías en móvil y escritorio.
- La escena reserva espacio para el nombre completo del acabado y mantiene las capas laterales por debajo del enlace, también en escritorios de poca altura. No se anima texto por encima de los controles.
- `verificacion/browser-check.json`: recorrido funcional, formulario en modo borrador, estimador, PDF, 3D y visualizador con transporte simulado. Cero errores de accesibilidad detectados en los recorridos auditados.
- `verificacion/herramientas/browser-check.json`: cinco rutas de herramientas y sus estados; cero errores de accesibilidad detectados.
- Lighthouse móvil local: 99 rendimiento, 100 accesibilidad, 100 buenas prácticas y 100 SEO; LCP aproximadamente 2,2 s, TBT 0 ms y CLS 0. Emulación en Chrome; no se presenta como prueba de teléfono físico, ranking o datos de usuarios reales.

### Crítica de composición

Valoraciones internas para comparar revisiones, sin aprobación implícita del cliente.

ROUND 1

Seen in one second: el producto se reconoce, pero casi cada sección repite un medio panel.

Idea (one sentence): mostrar la ventana antes del presupuesto.

Live thing: selección de acabado sobre el mismo render.

Layout words by section: hero=split / apertura=split / acabado=split / detalle=split / proceso=split / herramientas=split / contacto=split.

Scores: design 6.5 · usability 8 · creativity 6 · content 8 → overall 7.1.

Caps applied: repetición de composición y movimiento limitado a entradas.

Top three problems (most visible first), each with the screenshot it shows in and the fix:
1. Las capturas de `oct28-before` y `oct28-after` repiten el mismo reparto. Cambiar composición según producto, material o lectura.
2. `motion-system/scene-02.png` de la primera ejecución superpone acabados semitransparentes. La revisión vigente sustituye aquel desvanecimiento por acercamiento con capas opacas, alineación completa y una pausa; la retirada comienza después.
3. Primera captura `herramientas-390.png`: CTA cortado por una columna demasiado estrecha. Darle su propio renglón y nombrar directamente el estimador.

ROUND 2

Seen in one second: mismo cian, oro y tipografía, con producto central, índice y galería distintos.

Idea (one sentence): usar el marco como encuadre y como regla de continuidad del movimiento.

Live thing: tres acabados se alinean y el visitante compara materiales con el mismo encuadre.

Layout words by section: hero=capas / apertura=índice / acabado=escenario / detalle=galería asimétrica / herramientas=piezas editoriales / guías=lectura / contacto=ambiente y canales.

Scores: design 8 · usability 8.5 · creativity 7 · content 8 → overall 7.9.

Caps applied: un marco también es un recurso de la categoría; no se declara originalidad absoluta ni diseño aprobado.

Top three problems (most visible first), each with the screenshot it shows in and the fix:
1. La siguiente leyenda de la galería móvil asomaba cortada al borde. Se muestra la leyenda del detalle activo y se mantiene el fragmento de foto como invitación a deslizar.
2. Contacto usaba una imagen apaisada demasiado pequeña para cubrir alto móvil. Se preparó un recorte vertical de la misma fotografía.
3. El catálogo y el estudio todavía heredaban el medio panel anterior. Se reemplazaron por fotografía con texto editorial y escenario con controles inferiores.

La última inspección automatizada no detecta fallos de su catálogo de reglas. Conserva advertencias por escala tipográfica, galería horizontal, titular breve y ausencia de vídeo en la página. La galería es nativa, con controles explícitos; el hero ya identifica fabricación, instalación y Concepción. No hay metraje propio de fabricación verificable, por lo que no se añade vídeo ajeno como supuesto trabajo Starwin. El inspector cuenta nueve elementos en movimiento, tres controlados por script; la prueba de los nueve estados y el vídeo acreditan la secuencia concreta, no una calificación de calidad.

## Condiciones conservadas

Motor de precios, fija inicial blanca 100×100, PDF múltiple y + IVA únicamente al total final del PDF. Sin publicación. Sin nuevas llamadas pagadas al visualizador; la pausa de saldo y el correo en modo borrador permanecen visibles en sus flujos correspondientes.


## Corrección final de controles y unión

[Controles Starwin](CONTROLES-STARWIN-OCT28.md) documenta las familias de acciones vigentes. Cotizar, explorar, conversar, seleccionar acabado, agregar y descargar ya no heredan una única forma. Menú y diálogo conservan superficies opacas durante la apertura.

Las tres capas comparten un plano de idénticas dimensiones. Se acercan hasta el 60 % del recorrido, coinciden sin transparencia hasta el 76 % y las secundarias se retiran entre el 76 % y el 92 %. La prueba comprueba nueve estados, coincidencia menor de 1 px, opacidad 1 durante la unión y la pausa, y reversibilidad.

Verificación final: compilación, tipos, 30 pruebas unitarias (945 equivalencias de precios), rutas y metadatos, recorrido principal y las cinco herramientas correctos. Cero infracciones detectadas por Axe en los recorridos comprobados. Controles revisados entre 320 y 1440 px. Lighthouse móvil local: 99 rendimiento, 100 accesibilidad, 100 buenas prácticas y 100 SEO; LCP 2,2 s, TBT 0 ms, CLS 0. Evidencia en `verificacion/controles/revision.json`, `verificacion/motion-system/revision.json`, `verificacion/herramientas/browser-check.json` y `verificacion/rendimiento.json`.
