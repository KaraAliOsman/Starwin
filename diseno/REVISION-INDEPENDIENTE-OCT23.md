Method: independent Assessment A (diseño, capturas y comprobación runtime limitada; sin consumir resultados del detector).

# Revisión independiente de la portada Starwin · 23 de octubre de 2026

**Disposición: FIX.** La dirección merece conservarse y entregarse después de correcciones puntuales. No requiere reconstrucción. La composición ya responde al encargo de producto a gran escala, capas y arquitectura; no es la propuesta estática anterior con otra paleta. Este juicio es independiente y no constituye aprobación estética del cliente ni autorización de publicación.

## Alcance y método

- Objetivo: `src/pages/index.astro`; estilos `src/styles/home.css`, `src/styles/brand.css`; comportamiento `src/scripts/home-motion.ts`.
- Inspección visual: `.impeccable/review/desktop.png`, `mobile.png`, `full-1440.png`, `full-390.png`, `user-320.png`, `user-430.png` y `user-768.png`. El encargo identifica estas capturas con el build actual.
- Referencia comparada: `diseno/evidencias-baufens-oct23/desktop-base.png`, `mobile-base.png` y la matriz de `diseno/BAUFENS-MOVIMIENTO-OCT23.md`.
- Contexto: PRODUCT.md y DESIGN.md mediante `impeccable context`, skill Starwin y suelo de calidad de Impeccable. Esta revisión delegada usa el brief recibido; no repite una entrevista al cliente.
- Inspección adicional en una pestaña nueva de `http://127.0.0.1:3006/`, mediante la superficie CUA. El cliente browser-use IAB falló al conectar; CUA sí permitió capturas, lectura del DOM y cambios de selección. No se editaron fuentes.
- Este es el assessment de diseño. El detector y la síntesis general corresponden a la tarea principal; no se ejecuta una segunda auditoría automática dentro de este assessment.

## Especificidad y relación con las referencias

La portada tiene autoría suficiente para Starwin. El marco real delante de «PVC», la fotografía ambiental de fondo, el contraste cian/oro del logo y la escena oscura del perfil forman una dirección coherente con el producto. El uso de Manrope da una voz más deliberada a los titulares que la composición documental anterior. Las secciones cambian de función y estructura: escena de producto, material interactivo, explorador de aperturas, muestras físicas, ambiente y contacto. No se construye toda la página con tarjetas equivalentes.

En escritorio la transferencia de BauFens es visible en la superposición de palabra, fotografía y producto recortado. En móvil la escena se recompone sobre el texto y el contacto sigue dentro del primer tramo; no se limita a comprimir dos columnas. No copia la portada móvil oscura de BauFens, pero adapta su prioridad por el producto. El bloque de material oscuro establece una relación visual clara con la referencia de perfiles grandes sin trasladar prestaciones o certificaciones del proveedor.

La evidencia proporcionada no permite declarar fidelidad específica a Deceuninck: no hay una captura de ese referente entre los materiales de esta revisión. Tampoco permite afirmar identidad exacta entre el render genérico del hero y un sistema comercial vendido. La portada lo presenta como imagen de referencia y no lo llama Pro70.

## Lo que funciona

1. **Producto reconocible y profundidad convincente.** El render del hero tiene volumen, borde y herrajes legibles. El cian aparece a través del vidrio y detrás del marco; la sombra mantiene el producto separado del fondo. La relación con BauFens se ve sin explicación adicional.
2. **Jerarquía comercial correcta en móvil.** Se entiende «ventanas de PVC», Concepción y fabricación a medida. WhatsApp es la acción más fuerte, correo está inmediatamente debajo y el estimador aparece después de producto y contexto. El logo original conserva cian y oro.
3. **Secuencia con variedad y contenido real.** Perfil, aperturas, muestras físicas y ambiente tienen imágenes pertinentes. El texto ayuda a entender las opciones sin incorporar testimonios, cifras de ahorro ni credenciales no demostradas. La selección de vidrio probada en runtime actualiza imagen, descripción, enlace y estado activo de forma coherente.

## Correcciones prioritarias

### P2 · El cambio de panel puede revelar una imagen fallida y no ofrece recuperación

**Ubicación:** `src/scripts/home-motion.ts:71–77`, función `wireChoices()`; afecta material y aperturas de `src/pages/index.astro:36–42`.

El código espera `img.decode().catch(()=>{})` y continúa aunque la decodificación falle. Después oculta el panel anterior, activa el nuevo y cambia la explicación. En una carga fallida el visitante pierde la imagen utilizable y queda con una imagen rota sin mensaje ni recuperación. Además, durante una descarga lenta no hay estado perceptible hasta que termina el decode.

**Corrección:** conservar el panel actual si la imagen falla, anunciar un mensaje breve y permitir reintentar. Dar feedback inmediato de la solicitud pendiente sin presentar el panel como cargado. Mantener el contador de generación y la cancelación de animaciones existentes. El selector de acabados del hero ya conserva la imagen anterior y tiene un mensaje de error; usar ese criterio también aquí.

**Evidencia:** defecto observado en el flujo de código; no se simuló una falla de red en esta revisión. La selección exitosa de vidrio sí se verificó en el navegador.

### P2 · Las atribuciones importantes se reducen a texto de 9–10 px

**Ubicación:** `src/styles/home.css:26`, `42`, `81`, `91`, y ajustes móviles `134`, `145`, `174`, `182`. Contenido correspondiente en `src/pages/index.astro:30`, `36`, `44`, `45`.

Las capturas muestran los créditos de imágenes y perfiles como líneas muy pequeñas, especialmente bajo el corte de perfil. No son solo metadatos: explican que SUPREMO y Serie 6000 son referencias de BauFens y que las fotografías no acreditan instalaciones propias. A 9 px en móvil esa distinción exige esfuerzo y es fácil omitirla.

**Corrección:** llevar los créditos móviles a un mínimo práctico de 11–12 px con interlínea suficiente y mantener su contraste; reservar espacio bajo la imagen. No hace falta agrandar todo el pie del hero ni convertir la atribución en una llamada dominante. Comprobar nuevamente material y ambiente a 320/390/430 px.

**Evidencia:** tamaño declarado en CSS y legibilidad visual de las capturas, corroborada en la escena de material del navegador. No se afirma una violación WCAG por tamaño tipográfico: el problema es de lectura y claridad de procedencia.

### P1 · El producto invade el título en el tramo móvil ancho

**Ubicación:** `src/styles/home.css:115–123`, en especial altura fija de escena/producto, ancho del 64 % y `padding-top:338px`.

La distancia entre el borde inferior del producto y el titular se reduce mucho de 390 a 430 px; en `user-430.png` casi se tocan. La comprobación dirigida posterior confirma el defecto: a 600 px el producto invade el título aproximadamente 154 px y a 700 px, 238 px. El borde del marco atraviesa texto principal. El objeto aumenta de tamaño mientras el espacio vertical reservado permanece fijo. No hay overflow horizontal; una comprobación de ese tipo sola no detecta la colisión.

**Corrección:** limitar el tamaño real del render y/o hacer que la escena reserve su altura efectiva. La separación debe admitir el estado de llegada y los acabados, no solo el estado final blanco. Recapturar 320/390/430/600/700/768 px para evitar corregir el tramo ancho a costa del teléfono.

**Evidencia:** inspección visual de `.impeccable/review/hero-600-before.png` y `hero-700-before.png`; medidas en `mid-width-before.json`, generadas por la tarea principal a partir de la preocupación de esta revisión. La colisión está confirmada. La tarea principal comunica que está corrigiendo el dimensionado intrínseco; verificación final pendiente.

## Observaciones menores

- **P3 · Documentación visual anterior:** `DESIGN.md:191`, `214`, `220–222` y `266` siguen describiendo IBM Plex como voz display, la portada fotográfica anterior y ausencia de entradas automáticas. La implementación actual introduce Manrope, escena por capas y animaciones. Actualizar el registro al terminar la corrección para que otra sesión no restaure por error la dirección rechazada.
- **P3 · Descubrimiento de aperturas:** en móvil la fila horizontal deja fuera opciones, incluida Fija, aunque el recorte del siguiente botón da alguna pista. Una indicación discreta de deslizamiento o un tratamiento de borde que comunique continuidad ayudaría. No ampliar las cinco opciones hasta desplazar la imagen o la descripción.
- Los enlaces de correo del hero son visualmente secundarios frente a WhatsApp, pero son localizables en el mismo grupo. La portada no exige aprender el estimador para contactar.
- No se detecta necesidad de añadir más efectos de entrada a todas las secciones. La escena inicial y el material ya aportan el momento de producto; repetir reveals idénticos reduciría la precisión de la dirección.

## Movimiento: qué está demostrado

| Efecto | Evidencia en esta revisión | Límite |
|---|---|---|
| Parallax de producto y palabra del hero | Muestras runtime antes/después de scroll: producto de matriz identidad a traslación vertical de aproximadamente −32,68 px y rotación leve; lettering de identidad a x−11,62/y9,08. | Confirma actividad y cambio; no mide fluidez, FPS ni fidelidad de curva. |
| Giro/traslación del corte de perfil | Muestras runtime cambian de rotación base aproximada de −10° a rotación/traslación distinta al entrar en pantalla. | No prueba comportamiento en hardware móvil ni ausencia de repaints costosos. |
| Selección de material | Se pulsó «El vidrio»: imagen, explicación, enlace y estado activo cambian; composición final correcta. | No se registró un vídeo o una secuencia temporal de la máscara de 260 ms. |
| Llegada del hero y título | Declarada en `home.css:9`, `14–15`, `30–31`. | La inspección empezó con la página asentada. No declarar la secuencia de llegada observada a partir de las capturas. |
| Respuesta al puntero | Declarada en `home-motion.ts:44–51` y limitada a puntero fino. | No se muestreó el recorrido del puntero en esta revisión. |
| Preferencia de movimiento reducido | Declarada en `home.css:200`, regla global y `home-motion.ts:16`, `52–54`, `78`, `110`. | No se cambió la preferencia durante esta revisión. Verificarla en la prueba técnica. |

Las capturas estáticas no prueban ninguna animación. Las muestras runtime anteriores sí prueban que el build inspeccionado ejecuta parte del movimiento, con los límites descritos.

## Revisión heurística acotada de la portada

Escala 0–4; es evaluación de diseño, no resultado de pruebas de accesibilidad o de conversión.

| Heurística | Nota | Motivo |
|---|---:|---|
| Visibilidad del estado | 3 | Selecciones activas claras; falta feedback de descarga en paneles. |
| Lenguaje del mundo real | 4 | Aperturas, materiales y contacto comprensibles. |
| Control y libertad | 3 | Exploración directa sin modal; falta recuperación del panel fallido. |
| Consistencia | 3 | Marca, tipografía, acciones y escenas coherentes. |
| Prevención de errores | 3 | Imágenes rotuladas como referencia; atribución demasiado pequeña. |
| Reconocimiento | 3 | Texto y producto identificables; parte de aperturas queda fuera de vista móvil. |
| Flexibilidad y eficiencia | n/a | Portada de presentación; no es el flujo de operación del estimador. |
| Estética y economía | 3 | Composición específica, variedad y buen foco de contacto; requiere el remate indicado. |
| Recuperación de errores | 2 | Selector de hero la contempla; paneles comparten un camino que ignora decode fallido. |
| Ayuda y documentación | 3 | Guías y proceso localizables sin desplazar la acción comercial. |
| **Total** | **27/36** | **Dirección sólida con correcciones puntuales.** |

La carga de decisión se mantiene razonable: tres acabados, tres materiales y cinco aperturas se presentan por separado. Las cinco aperturas son un conjunto pertinente de producto y tienen una selección inicial comprensible. El recorrido emocional abre con un producto reconocible, explica lo que se compra, muestra material y ambiente y termina con una invitación humana a consultar. La atribución casi ilegible es el punto donde esa confianza pierde precisión.

Para una persona que llega por primera vez desde el teléfono, el principal objetivo está claro y no se exigen medidas para hablar. Para quien necesita texto grande, los créditos y etiquetas pequeñas exigen zoom. Para alguien con una conexión débil, la ausencia de feedback y recuperación del selector de paneles es el riesgo concreto.

## Límites y cierre

Viewport móvil probado mediante capturas; hardware pendiente. Esta revisión no acredita envío/recepción de correo, Nano Banana, precios, PDF, 3D, navegación completa, ausencia de fallos de red, contraste calculado, zoom, lector de pantalla ni rendimiento en teléfonos. No se abrieron destinos externos de WhatsApp ni se enviaron formularios.

La comparación explícita disponible es BauFens. Deceuninck debe permanecer como referencia declarada del encargo hasta contar con una comparación concreta. No hay composición aprobada por el cliente y no se inventa una aprobación a partir de esta nota.

Se debe conservar la dirección y corregir los puntos anteriores. Las capturas base no necesitan rehacerse por una falta de fidelidad detectada; después de modificar la interfaz sí deberán recapturarse las piezas afectadas. La evaluación no autoriza publicar GitHub ni Cloudflare.

Questions skipped: revisión independiente acotada solicitada por la tarea principal; las correcciones no requieren una nueva decisión del cliente.

---

## Comprobación de correcciones · primera recaptura del 23 de octubre

**Disposición de esta comprobación: FIX, con la dirección conservada.** El hero y la recuperación de paneles han mejorado. La ampliación del crédito introduce una colisión vertical en la escena de material que debe resolverse antes de cerrar la revisión.

| Hallazgo original | Estado | Evidencia y límite |
|---|---|---|
| P1 · Producto sobre el título entre 600 y 700 px | **Resuelto** | `hero-600-fixed.png`, `hero-700-fixed.png`, `mobile.png`, `user-320.png` y `user-430.png` muestran producto contenido y título libre. `mid-width-fixed.json` registra solapamiento 0 en 600/700. `fixes/reviewer-fixes.json` aporta 24 casos: dos anchos × tres acabados × cuatro tiempos de llegada, con al menos 40 px entre el límite visible de la escena y el título. El reviewer inspeccionó capturas y resultados, no reejecutó esa matriz. |
| P2 · Panel fallido sin recuperación | **Parcial: recuperación resuelta; feedback de espera pendiente** | `fixes/material-error.png` conserva perfil y selección; `material-recovered.png` muestra vidrio después de reintentar. El código actual de `wireChoices()` devuelve antes de ocultar el panel vigente cuando falla el decode y aumenta la generación antes del retorno de selección actual. Conserva protección frente a una carga obsoleta. Durante la espera solo añade `aria-busy`; no hay texto de carga ni estilo visible para ese atributo. Incorporar un feedback inmediato breve. La evidencia de red simulada la generó la tarea principal; no se probó red real ni hardware móvil. |
| P2 · Créditos de 9–10 px | **Parcial** | Las capturas del hero y `reviewer-fixes.json` confirman 12 px. Sin embargo, `fixes/material-error.png` muestra el perfil invadiendo los tabs y el crédito chocando con el mensaje de error; `full-390.png` muestra el crédito sobre el título «El perfil.». El tamaño se corrigió, pero la figura necesita reservar su altura real antes de tabs, estado y descripción. Ubicación actual: `home.css:143–147`, con escena de 365 px, figura al 100 % e imagen de 330 px más crédito. |
| P3 · DESIGN.md anterior | **Fuera de esta comprobación** | La tarea principal lo está actualizando por separado. No se usa como motivo para sustituir la dirección visual actual. |

La composición del hero conserva su carácter después de limitar el render: producto, palabra cian y fotografía ambiental siguen formando capas; a 600/700 px el espacio de lectura ahora es claro. No hay razón visual para reconstruirlo.

La corrección pendiente es acotada: ordenar el flujo vertical de la escena de material y verificar la imagen por encima del crédito, después los tabs, después el estado y la descripción. Comprobar normal/error/recuperación a 390 px y los extremos 320/430. No reducir de nuevo el crédito para ocultar el problema.

Esta comprobación no implica aprobación estética del cliente. No se modificó UI, no se ejecutó auditoría amplia ni detector. Se mantienen los límites de la revisión original, especialmente hardware, rendimiento, correo, IA, precios y PDF.

---

## Cierre de correcciones · segunda recaptura del 23 de octubre, build 11:23:29

**Disposición final de este alcance: SHIP.** Se cierran los tres hallazgos de código de la primera revisión y la regresión de material detectada en la primera recaptura. Se conserva la dirección visual. «SHIP» significa que estas correcciones están listas para entrega/revisión; no es una aprobación estética del cliente ni una autorización de publicar.

| Hallazgo | Estado final | Evidencia y límites |
|---|---|---|
| P1 · Hero sobre el título a 600/700 px | **Resolved** | Se conserva el cierre documentado de la primera comprobación: render contenido, solapamiento 0 y 24 casos de llegada/acabado sin invasión del título. Las capturas generales finales no muestran regresión de esa composición. No se reejecutó la matriz dentro de esta comprobación. |
| P2 · Panel fallido, recuperación y feedback de espera | **Resolved** | `fixes/material-loading-390.png` muestra «Cargando vista…» mientras permanece el perfil. Las nuevas `material-error-{320,390,430}.png` mantienen imagen/selección y muestran el error; `material-recovered-{320,390,430}.png` muestran vidrio, selección y texto correctos tras reintentar. El código de `home-motion.ts:70–95` mantiene el control de generación, busy, estado visible y cambio solo después del decode exitoso. La simulación de red y el reintento los ejecutó la tarea principal; este reviewer inspeccionó sus capturas, JSON y código. |
| P2 · Créditos demasiado pequeños | **Resolved** | Los créditos conservan 12 px, son legibles en las nuevas capturas 320/390/430 y permanecen separados del producto y de los controles. El salto de línea del crédito a 320 px tiene espacio suficiente. No se acredita con ello lectura en un teléfono físico o a todos los niveles de zoom. |
| Regresión · Perfil/caption sobre tabs, error y título | **Resolved** | Las nueve capturas nuevas de normal/error/recuperación a 320/390/430 muestran el orden producto → crédito → tabs → estado opcional → descripción, sin colisiones entre esas piezas. `material-layout.json` registra el crédito dentro de la escena y sin overflow en 320/390/430/600/700/768/1440. En móvil los tabs quedan debajo de la escena; en escritorio están en la columna contigua. La nueva `.material-visual` contiene la imagen y la figura reserva una fila independiente para el crédito (`home.css:38–42`, `144–147`; `index.astro:36`). El selector de animación se actualizó a `.material-cutaway img`; no quedó apuntando al antiguo hijo directo. |
| P3 · Documentación de la dirección anterior | **No evaluado en este cierre** | Se actualiza por separado. Este cierre no la da por aprobada ni declara resueltas observaciones fuera de las correcciones solicitadas. |

Se inspeccionaron también las capturas generales renovadas `full-390.png` y `full-1440.png` para situar el arreglo dentro de la página. La escena de material ya no invade su contenido siguiente y el recorrido de producto/contacto permanece reconocible. Las capturas antiguas `fixes/material-error.png` y `material-recovered.png` documentan la regresión histórica; **no representan este build**.

No quedan puntos parciales o sin resolver dentro de las cuatro correcciones revisadas arriba. La observación menor de descubrimiento de aperturas y la documentación no se reabren como una auditoría nueva. No se ejecutó detector, auditoría amplia ni pruebas funcionales ajenas a este cierre. Los resultados generales de motion/render/Axe comunicados por la tarea principal no sustituyen ni amplían este juicio visual acotado.

Se mantienen los límites originales: capturas y viewport móvil, hardware pendiente; sin certificación adicional de rendimiento, movimiento reducido, correo, Nano Banana, precios, PDF o 3D. No se infiere aprobación del cliente ni fidelidad a Deceuninck que no haya sido comparada expresamente.
