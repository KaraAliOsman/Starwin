> La portada de esta revisión fue rechazada. Ver la [dirección vigente](DIRECCION-IDENTIDAD.md).

# Dirección vigente: producto y claridad

La revisión anterior de controles y unión fue rechazada por el cliente. Este documento sustituye sus decisiones de forma y movimiento; no representa aprobación de esta versión.

## Intención

Mostrar la vivienda, reconocer el producto y comparar acabados. Preciso, espacioso, material. Se conserva Figtree, el logo, el cian y el oro Starwin. El marco deja de convertirse literalmente en todos los botones.

| Antes | Ahora | Motivo |
|---|---|---|
| Cortes de esquina, bocadillos y compartimentos de iconos | Acciones con proporción, alineación e icono sencillo | Jerarquía legible y menos ruido |
| Símbolo de ventana como menú | Menú/Cerrar y dos trazos | Función inmediata y objetivo de 44 px |
| Producto flotante sobre vivienda en escritorio | Fotografía arquitectónica completa y texto en primer plano | Respetar la escala y dejar ver el ambiente |
| Tres ventanas que se unen y desaparecen | Tres acabados que se abren para comparar y permanecen | El movimiento explica una elección real |
| Ventanas de atrás visibles a través del vidrio central | Plano de oclusión con el mismo cian | Continuidad visual durante la separación |
| Títulos que se recortan al entrar | Títulos y acciones estables | Lectura sin espera ni pérdida de palabras |
| Muestras inclinadas con esquina recortada | Material rectangular y selección con contorno | Conservar la idea del muestrario y limpiar el detalle |

## Movimiento

- Un momento dominante: comparación de acabados. El blanco queda en el centro; antracita se desplaza a la izquierda y roble a la derecha. El desfase es corto y deliberado.
- Del 0 al 10 % se ve una composición compacta de los tres acabados; del 10 al 70 % se despliegan las alternativas; del 70 al 82 % aparecen sus nombres; el resto queda en reposo.
- Las imágenes mantienen opacidad 1, sin giros, rebote ni retirada. La oclusión oculta las partes que todavía están detrás del producto central.
- Desplazamiento nativo y reversible. Una escena de 1,8 alturas de pantalla, sin capturar la rueda. No se carga GSAP en celular.
- Móvil: una ventana grande y selección táctil con cambio de acabado de 220 ms. Con teclado o movimiento reducido, cambio inmediato.
- Fotografía: asentamiento y profundidad suaves. No se anima texto para cubrir una cuota de movimiento.
- UI: 120–220 ms; curva existente `.22,1,.36,1`; puntero fino para hover. Áreas de pulsación estables.

## Evidencia y referencias

Se conserva la investigación local de BauFens: escala de producto, planos de ambiente/producto/detalle y composición móvil propia. No se atribuyen al sitio Starwin prestaciones ni obras del proveedor. Mobbin se consultó para presentación material: [FREITAG](https://mobbin.com/sites/sections/7290219f-8c17-48a6-8c51-358156964344); se toma la claridad del objeto a escala, sin copiar assets o marca. Las otras respuestas de Shopify y Sketch no se adoptaron por no corresponder al producto.

Se mantienen las composiciones vigentes de material, herramientas y guías; la revisión no vuelve a usar una misma plantilla para cada bloque. `motion-art-direction`, `emil-design-eng` y `design-taste-frontend` guían la ejecución, no certifican calidad ni aprobación.

## Comprobación

Capturas y grabación real en `verificacion/motion-system/`; controles en `verificacion/controles/`. Chrome con tamaños emulados, sin prueba en teléfono físico. La prueba de movimiento exige imágenes opacas durante todo el recorrido, productos finales separados dentro de la pantalla y retorno al encuadre inicial. Se verifica también móvil, movimiento reducido, galería y alternativa sin JavaScript.

La inspección visual automática inicial contó siete elementos en movimiento y pidió ocho. Se rechaza añadir un efecto sin función para cumplir ese número: esta dirección concentra el movimiento en el producto. Se registra como excepción a la regla `still-page`, respaldada por el recorrido explícito de nueve estados y el vídeo. Los gradientes restantes son velos neutros sobre fotografía para contraste; no son fondos ornamentales. No se dispone de metraje propio verificable para añadir vídeo de fabricación. La galería horizontal móvil tiene controles, scroll nativo y un fragmento de la siguiente foto deliberado.

Sin cambios de precios, condiciones, disponibilidad de generación ni envío de correo. Sin publicación. La versión anterior se conserva en `revisiones/antes-direccion-producto.zip`.


### Revisión visual

Ronda 1: las formas de controles compiten entre sí y la unión no explica un beneficio. Corrección: retirar literalidad, dar protagonismo a ambiente y producto, conservar acciones en reposo.

Ronda 2: la oclusión corrige la transparencia, pero un arranque totalmente superpuesto corta demasiado el acabado lateral durante la separación. Corrección: partir de un conjunto compacto de los tres acabados (escala 0,90 y desplazamiento ±84 %) y abrirlo hasta escala 1 y ±110 %. El movimiento es corto, sin aparición mágica ni retirada; el centro también se asienta.

La evaluación visual sigue siendo juicio de diseño, no una garantía de conversión ni aprobación del cliente.

Preferencia explícita del cliente: equilibrio entre lenguaje industrial/técnico y residencial/elegante. Se mantiene vivienda en portada, producto a escala y detalle de material, sin sumar texto comercial.

Cierre: compilación y tipos correctos; 30 pruebas y 945 equivalencias de precio; recorrido principal y cinco herramientas sin infracciones Axe; nueve estados de movimiento y retorno correctos; diez controles revisados; cinco encuadres adicionales entre 390×844 y 1440×900. Lighthouse móvil local de esta versión: 99 rendimiento, 100 accesibilidad, 100 buenas prácticas, 100 SEO; LCP 2,1 s, TBT 0 ms, CLS 0. Sin teléfono físico ni datos de campo.


### Juicio interno final

Diseño 7, usabilidad 8, creatividad 6,5, contenido 8. El carácter depende aún de material de la categoría; no se afirma originalidad absoluta. La estructura separa ambiente, objeto y material y mejora la continuidad, pero no existe evidencia de conversión ni aprobación del cliente. La excepción a la cuota automática de ocho movimientos se mantiene por contención; no se añade un efecto decorativo para elevar una puntuación.
