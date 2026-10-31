> Revisión histórica rechazada. La dirección implementada vigente está en [Producto y claridad](DIRECCION-PRODUCTO.md).

# Controles Starwin · función y carácter

La observación del cliente se refiere también a botones, selectores, navegación y detalle, no solamente a la composición de secciones. Esta revisión sustituye la regla anterior de usar el mismo rectángulo con flecha para todas las acciones.

## Familias

| Acción | Forma / tratamiento | Motivo |
|---|---|---|
| Cotizar | Pestaña oro, esquina a 45°, extremo tinta con + | Abrir las opciones de un proyecto; el corte deriva de la unión de un marco |
| Explorar | Contorno blanco, texto estable y brazo direccional largo | Recorrer la página sin una llamada comercial idéntica a Cotizar |
| Conversar | Superficie blanca con curva de bocadillo | Reconocer WhatsApp como conversación |
| Abrir menú | Texto Menú y marco que se convierte en X | La palabra aclara la función del símbolo; Cerrar reemplaza la etiqueta al abrir |
| Elegir apertura | Marca técnica pequeña de cada mecanismo y marcador cian | Explicar la opción sin sustituir sus fotografías por dibujos |
| Elegir acabado | Muestras con corte superior, leve giro y elevación de la elegida | Comparar materiales como en un muestrario; área táctil estable |
| Preparar / enviar | Acción tinta con símbolo final separado | Confirmar una tarea de formulario, sin fingir un envío disponible |
| Agregar ventana | Oro con + sobre tinta | Incorporar un elemento al presupuesto |
| Descargar PDF | Tinta y símbolo blanco con esquina de hoja | Distinguir el documento de la acción Agregar |
| Acciones secundarias | Contorno o enlace editorial | Copiar, volver o leer conserva una jerarquía menor |

La identidad sigue siendo cian, oro, tinta y Figtree. No se cambian precios, nombres de producto, condiciones ni canales de contacto. Los controles comparten escala, espaciado, foco y tono, pero su función decide la forma.

## Interacción

Apple Design orienta claridad, feedback y áreas táctiles; Emil y animate orientan estados, interrupción y tiempos. El botón no mueve su área de pulsación cuando el material se eleva: se mueve solamente la muestra interior. El corte de esquina se dibuja sobre un fondo o una muestra, sin recortar el contorno de foco.

- Objetivos de 44 px como mínimo en móvil.
- Controles 120–200 ms, sin rebotes. La exploración responde al puntero preciso y no deja hover pegado en touch.
- Menú y cotización actualizan sus estados accesibles. Teclado y movimiento reducido omiten movimientos de apertura.
- Texto, icono y marca de selección refuerzan el color.
- No hay cambios de precio ni llamadas pagadas por este trabajo.

Referencia complementaria consultada: [Frontify](https://mobbin.com/sites/sections/62984214-7e41-43f6-b3fe-4ada5446fc18), por la separación entre acción principal y exploración. No se trasladan su fotografía, paleta ni tipografía. Los resultados de Calendly y Anchor no aportaron un recurso propio para este caso y no se adoptaron como dirección.

## Corrección de la secuencia

Las tres imágenes comparten ahora un único plano, dimensiones y encuadre. La secuencia se reparte en acercamiento (0–60 %), coincidencia completa (60–76 %), retirada de las capas secundarias (76–92 %) y reposo. No se recorta ninguna imagen al acercarse.

La prueba en `scripts/motion-system-review.mjs` verifica que las tres geometrías coincidan a menos de 1 px y que todas conserven opacidad 1 durante la unión y su pausa. También comprueba regreso, movimiento reducido y ausencia de carga de GSAP en móvil. Las capturas y grabación locales no sustituyen una prueba de teléfono físico.
