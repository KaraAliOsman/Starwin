# Dirección vigente: un showroom Starwin

El cliente rechazó la portada fotográfica de la revisión anterior. Esta versión sustituye esa composición; no se interpreta la entrega como aprobación. La preferencia es equilibrar lenguaje residencial y técnico, con presencia de marca, poco texto y mayor calidad visual.

## Material y argumento

El inventario continúa siendo el real: identidad cian/oro, Figtree, Concepción, fabricación a medida, Serie Pro70, cinco aperturas, tres acabados comparables, detalles de vidrio y herraje, atención por WhatsApp/correo, estimación original de varias ventanas y PDF, 3D opcional, visualización sujeta a disponibilidad. No se crean obras, reseñas ni prestaciones comerciales nuevas.

| Página / pieza | Decisión | Función |
|---|---|---|
| Portada de escritorio | Cian pleno, título blanco/tinta y ventana recortada a gran escala sobre un ambiente | Volver a producto e identidad, sin un hero de fotografía genérica con texto encima |
| Portada móvil | Mantener la composición de ambiente y producto, ajustar la altura de pantallas pequeñas | Explorar visible desde 320×568; ningún presupuesto obligatorio en el hero |
| Aperturas | Índice tipográfico y fotografías ya seleccionadas | Comparar mecanismos sin reemplazar producto por dibujos |
| Acabados | Tres productos opacos que se abren para comparar; muestrario táctil en móvil | La elección de material es el motivo del movimiento |
| Detalle | Fotografías con escala asimétrica | Leer vidrio, herraje y acabado como materia |
| Cierre de portada | Imagen y plano cian separados, canales estables | Eliminar la caja oscura pegada encima de la fotografía |
| Catálogo | Encabezado editorial y panorámica bajo el título, luego índice de aperturas | Orientación de oferta sin repetir el hero |
| Fichas | Producto inmediato y alternativas con imágenes reales | Comparar sin depender solo de nombres |
| Contacto | Formulario blanco, fotografía y WhatsApp al lado; canales delante del formulario en móvil | Reducir fricción y dar dos caminos claros |
| Empresas | Arquitectura, alcance concreto y formulario específico | Admitir planos y cuadros de ventanas sin llenar la página de texto genérico |
| Componentes comunes | Retirar etiquetas repetidas; aumentar legibilidad de ayuda de formularios | Misma identidad en contenido y herramientas |

## Fuentes, adaptación y límites

Se reutiliza [la evidencia BauFens](../../starwin-preparacion-diseno/02-BAUFENS-EVIDENCIA.md), especialmente la relación producto/tipografía/ambiente y la separación entre imagen inmediata y 3D opcional. La escala de producto se adapta a las ventanas disponibles; no se trasladan sistemas SUPREMO/6000 a Pro70.

La consulta Mobbin de producto físico devolvió [Norma](https://mobbin.com/sites/sections/4c83ffbb-502c-4d4f-a953-5ba945d10a46), [Daylight](https://mobbin.com/sites/sections/b9729ea8-5d0f-4cd1-bd67-77d6f9d835e0) y [Analogue](https://mobbin.com/sites/sections/7333844a-cefc-4c85-8b1b-cd9bfb3e7d09). Se examinaron sus imágenes para estudiar escala de objeto y contención de interfaz; no se reutilizaron assets ni se copiaron sus paletas. Calm no se adoptó porque su módulo comercial no resolvía esta portada.

La ficha `.taste-skill/showroom-signature/` selecciona `loud-flat-poster`, preservando paleta y tipografía. El hero sorteado de papel/tinta sin imagen contradice el encargo visual de producto y BauFens: se adapta al cian y al render existente. Se omite la inclinación ornamental porque la ventana ya tiene perspectiva. Los textos permanecen legibles y no se ocultan para hacer una entrada.

## Movimiento y móvil

- Una secuencia principal: comparación de acabados. Sin unión ni desaparición de ventanas.
- En portada el ambiente se asienta detrás del producto; al desplazarse, la escena fotográfica aporta profundidad y el marco no se deforma.
- El texto y los CTA permanecen estables. No se captura rueda ni touch. El movimiento reducido conserva la composición y selección inmediatas.
- Los controles usan la curva existente `.22,1,.36,1`, con respuesta de 120–220 ms; hover condicionado a puntero preciso.
- La galería móvil usa scroll nativo y controles; no se transforma en editor de divisiones. Campos de 16 px, zoom permitido y áreas táctiles de al menos 44 px.
- Las pruebas son Chrome y tamaños emulados; falta validación en teléfono físico, teclado de iOS/Android y safe areas reales. No se declara una prueba física.

## Revisión visual y comprobación

Ronda 1: la fotografía lateral cortaba el interior del vidrio. Se alineó su plano con el producto. La portada deja de perder la identidad en un velo oscuro.

Ronda 2: contacto heredaba columnas internas en 768 px y provocaba desborde. Se definió una composición de tablet independiente. El cierre de portada heredaba el ancho de `.wrap` dentro de una celda; se fijó a la anchura de la celda. Los títulos vuelven a dos líneas. El formulario empresarial evita un botón partido en móvil.

Capturas finales en `verificacion/identidad/`, registro de siete páginas y cinco anchos en `revision.json`, movimiento en nueve estados en `verificacion/motion-system/`, y recorrido real en `verificacion/identidad/recorrido-starwin.webm`. La inspección estática de los archivos modificados no detecta fallos; los contornos funcionales de controles se conservan. La cuota automática `still-page` se exceptúa: no se añaden efectos sin propósito para llegar a ocho elementos. Los estados y el vídeo verifican el movimiento concreto. Las advertencias sobre tipografía, vídeo ausente y galería horizontal se evalúan visualmente; no hay metraje propio verificado para fingir fabricación.

Compilación, tipos, 30 pruebas (945 equivalencias originales), navegación/estimador/PDF y metadatos correctos. El recorrido principal de Axe no detectó infracciones. Lighthouse local móvil de esta revisión: 99 rendimiento, 100 accesibilidad, 100 buenas prácticas, 100 SEO; LCP 2,2 s, CLS 0 y TBT 0 ms. No demuestra ranking ni conversión.

La creatividad sigue estando limitada por material de la categoría; no se afirma originalidad absoluta ni excelencia certificada. Esta entrega es una dirección implementada y comprobable, no una promesa de ser “la mejor”.

No cambian precios, impuestos del PDF, canales ni disponibilidad de Nano Banana. No hay llamadas pagadas ni publicación. La revisión anterior se conserva en `revisiones/antes-showroom-identidad.zip`.

Juicio visual interno final: diseño 7,5; usabilidad 8; creatividad 6,5; contenido 8. Persisten límites de originalidad de las imágenes de categoría; la mejora se apoya en composición y continuidad, no en atribuir fotografía exclusiva. La comprobación de tablet terminó con cero fallos del inspector y dos advertencias (cantidad de tamaños y título breve); el texto de apoyo explica fabricación, instalación y Concepción. Los resultados no equivalen a aprobación del cliente.

