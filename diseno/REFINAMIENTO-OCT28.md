# Starwin · refinamiento del showroom

28 de octubre de 2026. Implementación local; sin publicación.

## Dirección

La ventana a medida de Starwin se presenta como una muestra de material a escala arquitectónica. Se conserva Figtree, el logo, el cian #1595c3 y el dorado #feba25. El azul #006d94 permite acciones y textos blancos con contraste. La composición móvil del hero se conserva; escritorio da más escala al producto y une sala, marco y mensaje.

Inventario específico: Concepción y Biobío; dirección Pedro de Valdivia 733; fabricación e instalación a medida; Corredera Serie Pro70; cinco aperturas; siete colores consultables; mismo render en blanco, antracita y roble; estimador original con PDF para varias ventanas; 3D bajo demanda; atención por WhatsApp y correo; foto como punto de partida; mayoría de visitas desde celular. No se usan cifras de rendimiento, obras ni reseñas inventadas.

La dirección `The object, large`, semilla 281026, está en `.taste-skill/oct28/`. No se usa la disposición de varios objetos en arco que sugirió la ficha: el cliente pidió conservar la composición móvil y explorar un producto, no una línea de modelos ficticios. La adaptación conserva el objeto dominante, la profundidad y los acercamientos materiales.

## Argumento y prueba visible

| Sección | Afirmación | Prueba / acción real |
|---|---|---|
| Portada | Ventanas de PVC a medida en Concepción | Producto grande, fabricación e instalación, explorar |
| Aperturas | Cada apertura ocupa y ventila de forma distinta | Cinco fotos existentes y ficha correspondiente |
| Acabados | El acabado cambia la percepción del mismo objeto | Selector con tres versiones del mismo render |
| Material | Vidrio, herrajes y acabado son decisiones separadas | Fotografías cercanas, elección manual y guía específica |
| Proceso | No hacen falta planos completos para iniciar | Tres etapas resumidas desde el proceso real |
| Herramientas | El cliente puede preparar su decisión | Visualizador, estimador, asistente, comparador y medidas |
| Guías | Las dudas tienen respuestas útiles | Precio, PVC/termopanel y aperturas enlazados |
| Contacto | Es fácil conversar con el equipo | WhatsApp, formulario, teléfono y dirección reales |

La cotización no aparece en el CTA del hero ni como etiqueta del navbar. El botón Cotizar abre elección de canal; el estimador tiene una sola pieza en la portada. Se elimina la segunda llamada fija a cotizar en móvil: queda un acceso pequeño a WhatsApp que se oculta junto al contacto y al abrir menú/diálogo.

## Referencias y adaptación

- [BauFens](https://baufens.ba/en/): la evidencia runtime está en `BAUFENS-MOVIMIENTO-OCT23.md`. Se adapta el producto por capas, la escala de los detalles y la respuesta limitada al puntero. No se atribuye SUPREMO a la Pro70 ni se presentan ambientes como obras propias.
- Deceuninck: material y acabado como decisiones de producto; investigación archivada en la preparación de diseño. No se añade su nombre ni metadatos de investigación a la interfaz.
- [bella · comparación de ambiente](https://mobbin.com/sites/sections/276ed59a-6957-45a8-8421-c85687aaa8c0): conservar el objeto al comparar su aspecto.
- [Vizcom · variantes de material](https://mobbin.com/sites/sections/c97fa837-3f6c-40d3-84aa-0db5484f710f): escala y encuadre coherentes al cambiar acabados.
- [bella · producto sobre color](https://mobbin.com/sites/sections/1a1af3a8-4165-4918-a511-71e3745b0886): producto grande sobre campo de marca, adaptado al cian de Starwin.
- Skills aplicadas: starwin-design-evidence, design-taste-frontend, emil-design-eng y animate. Sin instalar una biblioteca para transiciones que resuelven CSS y WAAPI.

## Movimiento

| Momento | Propósito | Implementación |
|---|---|---|
| Portada | Profundidad de producto | Entrada 800 ms, asentamiento fotográfico 1200 ms; desplazamiento máximo ±12/8 px solo con puntero preciso |
| Apertura | Confirmar la selección | Imagen decodificada antes de cambiar; 240 ms, transform y opacidad |
| Acabado | Comparar material sin cambiar encuadre | Barrido de 280 ms entre renders coincidentes; sin cola de animaciones |
| Detalle | Mostrar qué parte cambia | Revelado horizontal de 280 ms; selección explícita, sin avance automático |
| Secciones | Orden de lectura | Máscara de imagen, entrada corta de títulos y secuencia de pasos, 600–800 ms |
| Menú | Orientación y respuesta | 220 ms, gestión de foco, bloqueo y restauración de desplazamiento |

Curva existente `.22,1,.36,1`. Sin secuestrar scroll, rotación automática ni animación de dimensiones. Teclado cambia selecciones de inmediato. Movimiento reducido cancela las capas activas; contenido visible aun si el script no corre. Sin vídeo: no se dispone de metraje propio verificable de fabricación o instalación; una película ajena como prueba de trabajo sería engañosa.

## Crítica y verificación

| Antes | Después | Evidencia |
|---|---|---|
| Varias capas de estilos obsoletos | home.css reconstruido para las clases en uso | Fuentes y build |
| Miniatura decorativa compitiendo con la apertura | Apertura y descripción dominantes; todas las opciones visibles en móvil | Capturas 320/390/768/1440 |
| Acabados pálidos, cambio abrupto | Campo cian, producto grande y comparación por barrido | Captura roble y prueba de selección |
| Contactos repetidos en dos barras | Un Cotizar superior y un WhatsApp flotante discreto | Revisión móvil |
| Guías solo en filas de texto | Lecturas con fotos del tema | Capturas antes/después |
| Menú sin gestión del fondo | Foco contenido, fondo inerte y scroll restaurado | showroom-review.mjs |

Inspección final: movimiento observado en 16 elementos de escritorio, 14 de tablet y 12 de móvil, frente a 2 en el estado anterior; desaparecieron fallos de titulares de tres líneas, texto móvil pequeño del showroom, desborde horizontal y título cubierto por la barra inferior. El inspector conserva advertencias heurísticas sobre variedad de escalas y ausencia de vídeo; no se agregan efectos ni metraje para aumentar un contador. La numeración pertenece a un `ol` de etapas reales, no a un adorno. El margen derecho cero corresponde a la fotografía de material a sangre; los bloques `wrap` sí comparten márgenes. El aviso sobre H1 no detecta como apoyo el texto de 16–17 px que ya identifica fabricación, instalación y Concepción.

### Crítica visual

Valoraciones internas de diseño; no son calificaciones de usuarios ni resultados de conversión.

ROUND 1

Seen in one second: ventana grande, pero escenas que no comparten jerarquía.

Idea (one sentence): presentar el producto antes del presupuesto.

Live thing: cambio de acabados sobre el mismo render.

Layout words by section: hero=capas / aperturas=miniaturas y ficha / acabados=estudio / material=detalle / herramientas=imagen y enlace / cierre=contacto.

Scores: design 6.5 · usability 7 · creativity 6 · content 7.5 → overall 6.8.

Caps applied: movimiento limitado y títulos largos en móvil.

Top three problems (most visible first), each with the screenshot it shows in and the fix:
1. `oct28-before/mobile-page-01.jpg`: barra doble tapa contenido; sustituir por WhatsApp discreto y ocultarlo cerca de controles.
2. `oct28-before/desktop-page-01.jpg`: la miniatura del jardín compite con la apertura; retirarla y ampliar producto/descripcion.
3. `oct28-before/mobile-page-01.jpg`: el título del visualizador ocupa tres líneas; usar «Míralas en tu casa.».

ROUND 2

Seen in one second: ventana dominante, identidad cian/dorado y exploración clara.

Idea (one sentence): acercarse al producto, cambiar su material y preparar una conversación real.

Live thing: comparación de acabado con encuadre estable y barrido de material.

Layout words by section: hero=producto sobre ambiente / aperturas=selector y foto / acabados=campo cian y muestra / material=acercamiento a sangre / proceso=foto en uso y secuencia / herramientas=mesa de proyecto / guías=lecturas ilustradas / cierre=contacto directo.

Scores: design 8 · usability 8.5 · creativity 7 · content 8 → overall 7.9.

Caps applied: la idea de escala de producto también pertenece a la categoría; creatividad limitada a 7, sin atribuir originalidad absoluta.

Top three problems (most visible first), each with the screenshot it shows in and the fix:
1. `diseno-oct28/acabado-roble-movil.png`: WhatsApp alcanzaba a cubrir las muestras; se oculta al entrar las filas de controles y enlaces de herramientas.
2. `diseno-oct28/acabados-1440.png`: una regla anterior conservaba el fondo gris del estudio; se corrige la especificidad y se confirma el campo cian en nuevas capturas.
3. `diseno-oct28/contacto-390.png`: WhatsApp quedaba después del formulario; se añade elección de canal antes de los campos.

Verificación final: ver `verificacion/diseno-oct28/revision.json`, `verificacion/browser-check.json`, `verificacion/herramientas/browser-check.json`, `verificacion/seo-enlaces.json` y `verificacion/lighthouse-inicio.json`. Las capturas y métricas son de navegador local con emulación; no sustituyen una prueba en un teléfono físico ni datos de campo.

Lighthouse móvil local del 28 de octubre: rendimiento 99, accesibilidad 100, buenas prácticas 100 y SEO 100; FCP 1,1 s, LCP 2,0 s, TBT 0 ms y CLS 0. El análisis estático confirma 35 páginas, 34 URL indexables, títulos/descripciones únicos, canónicas consistentes y 50 reglas de migración. Pruebas unitarias: 30 correctas, incluidas 945 equivalencias del motor original. Las suites del navegador revisan las herramientas, el cotizador, el PDF, el 3D y la accesibilidad; el visualizador se prueba con transporte simulado y no genera cargos.

## Límites que se conservan

El motor de precios no se modifica. La UI conserva la nota acordada, el valor inicial fija blanca 100 × 100 cm y PDF múltiple; + IVA aparece solo al total final del PDF. El formulario sigue preparando un correo hasta configurar el servicio de envío. Nano Banana conserva la pausa por el error de saldo 402 documentado; este trabajo de diseño no hace llamadas pagadas ni declara verificada la generación. SEO técnico local no demuestra indexación ni posiciones. La publicación en GitHub/Cloudflare requiere la indicación del cliente.
