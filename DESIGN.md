---
name: "Starwin PVC Chile · showroom de luz"
description: "Vivienda, apertura y material real; Switzer, blanco frío y los acentos originales Starwin."
colors:
  brand: "#1595c3"
  brand-gold: "#feba25"
  paper: "#ffffff"
  ink: "#17272d"
  muted: "#58656b"
  interior-muted: "#53636b"
  tool-muted: "#59696f"
  line: "#dce2e5"
  tool-line: "#d7dfe2"
  surface: "#f1f3f4"
  photo-field: "#d0d2d2"
  blue: "#087493"
  interior-link: "#14566c"
  tool-link: "#086e92"
  cyan-foreground: "#06232f"
  selected-finish: "#e8f4f8"
  selected-photo: "#edf5f8"
  contact-surface: "#17272d"
  showroom-cyan: "#1595c3"
  input-border: "#aebdc4"
  tool-error: "#a43c29"
  gold-hover: "#ffca4d"
  interior-gold-hover: "#ffcc59"
  tool-gold-active: "#efaa12"
  disabled-surface: "#e5e9eb"
  disabled-text: "#64747b"
typography:
  display:
    fontFamily: "Switzer, Arial, sans-serif"
    fontSize: "clamp(84px,10vw,160px)"
    fontWeight: 500
    lineHeight: 0.93
    letterSpacing: "-.055em"
  display-mobile:
    fontFamily: "Switzer, Arial, sans-serif"
    fontSize: "clamp(60px,17.2vw,84px)"
    fontWeight: 500
    lineHeight: 0.93
    letterSpacing: "-.055em"
  headline:
    fontFamily: "Switzer, Arial, sans-serif"
    fontSize: "clamp(36px,4.3vw,60px)"
    fontWeight: 500
    lineHeight: 1.08
    letterSpacing: "-.035em"
  interior-headline:
    fontFamily: "Switzer, Arial, sans-serif"
    fontSize: "clamp(34px,3.5vw,48px)"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-.025em"
  interior-title:
    fontFamily: "Switzer, Arial, sans-serif"
    fontSize: "clamp(27px,2.6vw,34px)"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-.025em"
  body:
    fontFamily: "Switzer, Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.55
  reading:
    fontFamily: "Switzer, Arial, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.75
  navigation:
    fontFamily: "Switzer, Arial, sans-serif"
    fontSize: "15px"
    fontWeight: 400
  action:
    fontFamily: "Switzer, Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 600
  label:
    fontFamily: "Switzer, Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 500
  compact-navigation:
    fontFamily: "Switzer, Arial, sans-serif"
    fontSize: "13px"
    fontWeight: 600
  tool-heading:
    fontFamily: "Switzer, Arial, sans-serif"
    fontSize: "34px"
    fontWeight: 500
    lineHeight: 1.15
    letterSpacing: "-.03em"
  tool-total:
    fontFamily: "Switzer, Arial, sans-serif"
    fontSize: "30px"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-.025em"
rounded:
  tool: "2px"
  contact-field: "3px"
  interior: "4px"
  button: "3px"
  action-pane: "1px"
  tool-action: "2px"
  dialog: "8px"
  sheet: "14px 14px 0 0"
  opening-choice: "2px"
  scene-switch: "3px"
  circle: "50%"
spacing:
  small: "8px"
  control-gap: "14px"
  control: "16px"
  gutter-mobile: "20px"
  tool-gutter-mobile: "22px"
  panel: "24px"
  gutter-medium: "32px"
  gutter-desktop: "48px"
  section-mobile: "56px"
  section: "90px"
components:
  button-yellow:
    backgroundColor: "{colors.brand-gold}"
    textColor: "{colors.ink}"
    typography: "{typography.action}"
    rounded: "{rounded.button}"
    padding: "15px 22px"
    height: "54px"
  button-blue:
    backgroundColor: "{colors.blue}"
    textColor: "{colors.paper}"
    typography: "{typography.action}"
    rounded: "{rounded.button}"
    padding: "15px 22px"
    height: "54px"
  button-interior:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.action}"
    rounded: "{rounded.button}"
    padding: "15px 22px"
    height: "54px"
  button-tool:
    backgroundColor: "{colors.brand-gold}"
    textColor: "{colors.ink}"
    rounded: "{rounded.tool-action}"
    padding: "12px 20px"
    height: "52px"
  button-tool-disabled:
    backgroundColor: "{colors.disabled-surface}"
    textColor: "{colors.disabled-text}"
    rounded: "{rounded.tool}"
  navigation:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.navigation}"
    height: "80px"
  opening-choice:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "2px"
    padding: "11px 24px"
    height: "46px"
  opening-choice-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.opening-choice}"
  material-choice:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.cyan-foreground}"
    padding: "9px 0"
    height: "45px"
  field-tool:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.tool}"
    padding: "12px 14px"
    height: "52px"
  quote-option:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    padding: "20px 8px"
    height: "100px"
  product-panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    padding: "50px 45px 25px"
---

# Design System: Starwin PVC Chile

**Ajuste confirmado el 31 de octubre:** el cliente aprueba el concepto del hero. Se conserva y se amplía el ambiente de PC a toda su altura, sin cambiar la dirección ni la composición móvil. [Encadre, SEO y generador gratuito](diseno/HERO-SEO-GENERACION-OCT31.md) registra evidencia y la credencial propia pendiente de Hugging Face.

**Dirección vigente:** [Un showroom Starwin](diseno/DIRECCION-IDENTIDAD.md). Sustituye la portada fotográfica rechazada y las descripciones históricas que entren en conflicto. Cian, tipografía y producto grande en escritorio; composición móvil propia; catálogo editorial, fichas con comparación visual y contacto/empresas renovados.

## Overview

**Creative North Star: "Showroom de luz"**

Una ventana se entiende en la vivienda y de cerca. El sistema combina escenas de ambiente, aperturas a escala y fotografías de acabado, vidrio y herraje. Blanco y gris frío sostienen una voz Switzer de peso medio; el cian y el oro originales mantienen la identidad Starwin. Rectángulos amplios y controles sólidos permiten pasar de observar a elegir.

Esta es la documentación del resultado implementado el 25 de octubre, según el contrato de reconstrucción. Sustituye la dirección visual anterior, rechazada por el cliente; no representa aprobación del cliente. La revisión independiente cerró los cuatro hallazgos F1–F4 en su alcance documentado, sin certificar conversión, indexación, métricas ni una auditoría de todas las rutas.

**Key Characteristics:**

- Vivienda, apertura y detalle material con fotografías acreditadas.
- Switzer autoalojada, blanco frío, tinta azul y acentos originales Starwin.
- Selección explícita, controles táctiles y acciones que permanecen visibles.
- Herramientas precisas y lectura tranquila dentro de la misma identidad.

## Colors

El cian es reconocible y el oro dirige las acciones comerciales; los tonos fríos dejan que la fotografía y el producto aporten la materia. Los valores normativos están en el frontmatter. Las rampas del sidecar reúnen tonos observados en el código; no autorizan colores adicionales.

- **Primary — Cian Starwin (`brand`):** bloque material, indicadores y acentos de navegación. `blue`, `interior-link` y `tool-link` son sus tintas funcionales para enlaces y foco sobre claro.
- **Secondary — Oro Starwin (`brand-gold`):** Cotizar y acciones principales de estimación. Los estados de puntero usan `gold-hover` en el sitio, `interior-gold-hover` en interiores y `tool-gold-active` en el estimador.
- **Neutral — Tinta azul (`ink`):** títulos y lectura; los tonos secundarios se reservan a notas. Contacto combina vivienda, campo de contraste y tinta #17272d.
- **Neutral — Tinta azul (`ink`):** títulos y lectura; los tonos secundarios se reservan a notas. Contacto combina vivienda, campo de contraste y tinta #17272d.
- **Functional:** `tool-error` identifica errores de medida; `disabled-surface` y `disabled-text` hacen reconocible una acción no disponible. El error incluye texto y asociación al campo, nunca sólo color.

**The Identidad Rule.** Conservar el logo original y sus colores cian y oro; una fotografía de referencia no acredita obra propia ni relación comercial con su proveedor.

**The Texto sobre cian Rule.** Usar `cyan-foreground` para texto pequeño, enlaces y selectores sobre `brand` en todos sus estados. El par medido alcanza aproximadamente 4.75:1. El blanco se reserva allí al titular grande, cuyo par alcanza aproximadamente 3.43:1.

Sobre fotografía, el texto blanco necesita soporte continuo. La portada conserva un degradado oscuro bajo el titular y un fondo propio `rgba(10,27,28,.85)` bajo el enlace de exploración; ese soporte no depende de la imagen seleccionada.

## Typography

Una familia común: Switzer, con Arial y sans-serif de respaldo. Se sirve desde `public/fonts/figtree-latin-variable.woff2`, con `font-display:swap`; la carcasa declara pesos 400–700 y precarga el archivo. `public/fonts/Switzer-OFL.txt` conserva SIL Open Font License 1.1. El estimador declara un rango más amplio del mismo archivo variable, pero sus roles documentados usan pesos 400–600.

- **Display:** titular grande en blanco y oro, junto al recorte de ventana, sobre una escena de vivienda. En móvil el titular se sitúa arriba, el producto en el centro y la acción debajo.
- **Headline:** grandes encabezados comerciales, con ajustes propios según bloque. El título material llega a 72 px en escritorio y usa 45 px en móvil.
- **Interior headline / title:** Switzer peso 500; h1 de 40–64 px, 36 px bajo 359 px. La jerarquía se comparte y la composición responde a la tarea.
- **Body / reading:** lectura general según `body`; artículos en `reading`, con límite de 72ch y 17 px en móvil. Las introducciones interiores suelen limitarse a 52ch.
- **Navigation / action / label:** sin versales decorativas. Los controles y etiquetas nombran la tarea. Los importes y dimensiones del estimador usan cifras tabulares; su total pasa de 30 px a 26 px en móvil y a 23 px bajo 359 px.

Las fotografías se presentan sin leyendas repetidas de referencia, archivo o licencia, por indicación del cliente. La procedencia y las licencias se conservan en metadatos y documentación interna. Los campos de entrada mantienen 16 px como mínimo; instrucciones, precios y acciones conservan su escala legible.

## Layout

La carcasa carga `global.css`, `brand.css`, `showroom.css`, `actions.css` y `showroom-interiors.css`. `home.css` define las composiciones de portada. El archivo de interiores adapta la tipografía compartida, el catálogo fotográfico, el estudio con controles inferiores y las guías editoriales. Estimador y herramientas conservan sus hojas funcionales.

Contenedor comercial de hasta 1400 px, con 48 px a cada lado; a 1100 px baja a 32 px, a 700 px a 20 px y bajo 359 px a 16 px. Son márgenes mínimos: el máximo de contenedor puede dejar más espacio en pantallas anchas. Cabecera de 80 px en escritorio, 70 px hasta 900 px y 68 px hasta 700 px; navegación desplegable en el punto de 900 px. El documento usa `min-width:0`; cualquier desbordamiento necesario pertenece a su tabla o selector, no al body.

La portada combina un ambiente de vivienda, un recorte de producto y tipografía grande. El plano cian aparece en escritorio; en móvil el texto y la acción descansan sobre un fondo oscuro para conservar legibilidad. Después de las aperturas, tres muestras permiten comparar acabados de la misma ventana. El producto de comparación y las herramientas usan `contain` cuando importa ver la geometría completa.

Aperturas: imagen y explicación en proporción 1.5:1; en móvil se apilan y el selector se desplaza horizontalmente. Material: texto/foto en .85:1.15; en móvil el orden es título, selector, foto y explicación. Los espacios de sección comerciales rondan 90 px en escritorio y 54–56 px en móvil; las filas de catálogo y lectura usan ritmo más corto y reglas finas.

Las herramientas trabajan en modo Operate: campos, selección, vista y precio próximos. El estimador usa un contenedor de 1080 px con márgenes de 32 px; a 699 px pasa a una columna y márgenes de 22 px, o 16 px bajo 359 px. La barra de precio y Agregar queda fija con compensación de espacio y safe-area. El visualizador presenta foto y controles en 1.5:1 y pasa a una columna a 700 px. Guías y textos extensos trabajan en modo Read. Las superficies comerciales trabajan en modo Persuade; la densidad y la escala se adaptan a cada tarea.

## Elevation & Depth

El sistema se apoya en fotografía, contraste tonal y divisores. Las superficies de catálogo, lectura y herramientas son planas. La profundidad se concentra en dos capas funcionales: acción sobre fotografía (`0 5px 22px #0c1b2420`) y diálogo de cotización (`0 24px 80px #0d303b33`), con velo `#123e5066`. No repetir sombras en cada bloque.

La fotografía del hero se asienta en 1200 ms. En escritorio ocupa todo el encuadre, sin producto flotante ni seguimiento del puntero; móvil conserva su composición de producto. Apertura 240 ms, acabado 280 ms y menú 220 ms. Curva común `.22,1,.36,1`. Acabados añade una secuencia reversible de tres materiales a un producto central, ligada a un recorrido de scroll nativo de escritorio. GSAP 3.15.0 se importa solo para esa escena; móvil y movimiento reducido muestran la composición estática.

**The Contenido estable Rule.** El contenido y las acciones nunca desaparecen al hacer scroll; teclado y movimiento reducido reciben selección inmediata, sin animación de cambio de plano.

## Shapes

Fotografía y campos de producto: rectángulos de borde limpio. Las acciones se distinguen por función: pestaña con corte de unión para Cotizar, contorno para explorar, curva de conversación para WhatsApp y documento para PDF. Los radios del frontmatter son valores base; las familias vigentes se documentan en [Controles Starwin](diseno/CONTROLES-STARWIN-OCT28.md). Los campos de herramienta mantienen `tool` y los campos de contacto `contact-field`.

La apertura usa índice vertical de texto en escritorio y opciones agrupadas en móvil. No hay selector de ambientes. Acabados usa muestras rectangulares del material y marca de selección. El diálogo conserva su alternativa HTML y su hoja inferior móvil.

## Components

**Buttons.** Cotizar usa pestaña oro, esquina a 45° y extremo tinta con un signo + que gira al abrir. Explorar usa contorno y un brazo direccional; WhatsApp, una forma de conversación; preparar consulta, tinta con símbolo oro separado. Agregar ventana usa + sobre tinta y Descargar PDF un símbolo de documento blanco. Acciones comerciales de 54 px mínimos, herramienta de 52 px y cabecera de 46 px o 44 px en móvil. Respuesta de 120–200 ms con hover solo para puntero fino; movimiento reducido elimina desplazamientos. Foco azul de 3 px separado 4 px, oro sobre fotografía; el estimador conserva foco de 2 px. La forma cambia con la tarea y conserva identidad, escala y foco comunes.

**Navigation.** Logo original sobre blanco y Cotizar en oro; no aparece Cotizador en el navbar. Cotizar abre canales de atención y el estimador opcional. Menú móvil de 44 px con texto Menú/Cerrar y un marco que pasa a cierre; bajo 390 px conserva el texto sin el símbolo. Panel blanco opaco, fondo inerte, foco contenido y restauración de scroll. La portada tiene una sola pieza del estimador dentro de herramientas.

**Selectors.** Apertura: marca técnica pequeña del mecanismo, marcador cian, tipografía y `aria-pressed`; las fotografías de producto se conservan. Material: fotografías a diferentes escalas en escritorio; galería horizontal nativa con tres controles en móvil. Acabados: muestras con esquina cortada, leve giro y elevación de la elegida; el área táctil permanece estable. Marca y anuncio del color elegido. El mismo render conserva geometría y encuadre al cambiar.

**Scene loading.** Una elección de apertura o acabado decodifica su imagen antes de cambiar; la última elección gana y un error conserva la anterior. Las escenas opcionales parten de una composición estática legible. La galería no oculta fotografías; en móvil muestra la leyenda de la elegida para evitar texto cortado en el siguiente elemento. Teclado y movimiento reducido cambian selección de inmediato.

**Quote dialog.** Diálogo nativo con WhatsApp, correo y estimado, en ese orden; alternativa HTML en `/cotizar/`. WhatsApp usa superficie tinta, forma de conversación e icono oro; correo una fila de sobre y estimado una fila de documento. Opciones de 100 px de altura mínima. Se cierra por botón, Escape o fondo; restaura scroll y foco. Apertura de 220 ms por desplazamiento con panel opaco para puntero, inmediata con teclado o movimiento reducido. No presenta el correo directo como disponible sin credenciales.

**Inputs and tools.** Borde continuo, blanco y radio pequeño. Campos de 52 px; dimensiones del estimador de 58 px en escritorio y 56 px en móvil. Error visible y `aria-invalid`; unidades y cifras tabulares facilitan comparación. Cantidad y muestras tienen objetivos de 44 px. Acción deshabilitada con estado explícito. El estimador conserva varias ventanas, PDF real y 3D bajo demanda. La primera ventana es fija blanca de 100 × 100 cm, termopanel y una unidad. La nota es «Referencia sujeta a revisión de medidas, configuración y factibilidad.». El PDF añade «+ IVA» en 7.5–8 pt únicamente junto al total final; el motor mantiene el precio original.

**Product and reading panels.** Fondo gris frío, composición rectangular y explicación junto a imagen grande. Catálogo y guías usan filas separadas por líneas; la foto no se reduce a una miniatura repetida por sistema. El visualizador mantiene la foto contenida y la disponibilidad antes de los controles. La generación externa y el envío directo dependen de credenciales; documentar su estado real y conservar el borrador/fallback disponible.

## Do's and Don'ts

### Do:

- Do conservar el logo original, el cian y el oro Starwin.
- Do combinar ambiente, producto y detalle material con procedencia interna y geometría respetada.
- Do mantener campos legibles, selección explícita, foco visible y acceso directo al estimador.
- Do adaptar el encuadre y el orden de contenido al celular, y respetar movimiento reducido.
- Do informar precios referenciales y disponibilidad real de correo, generación y 3D.

### Don't:

- Don't restaurar el mundo visual rechazado a partir de CSS o documentación histórica.
- Don't sustituir producto y fotografía por slogans intercambiables, tarjetas repetidas o un montaje SVG presentado como visualizador fotográfico.
- Don't atribuir fotografías, obras, cifras, reseñas, certificaciones o relaciones comerciales sin evidencia Starwin.
- Don't usar texto pequeño blanco sobre el cian de marca ni quitar el soporte de contraste sobre fotografía.
- Don't confundir una revisión técnica o visual con aprobación del cliente, conversión, indexación, métricas o autorización para publicar.

## Refinamiento solicitado: fotografía y prioridad comercial

La portada vigente muestra una sala y un render transparente de ventana en capas. Se conserva la composición móvil y se amplía el producto de escritorio. No hay un selector de ambientes aleatorios. Aperturas conserva las imágenes sliding, casement, tilt, awning y fixed; los acercamientos de material forman una sección separada. El muestrario compara el mismo producto en tres acabados sobre cian Starwin.

La portada mantiene un solo acceso secundario al estimador en su contenido, junto al visualizador. El catálogo invita a ver el modelo y consultar. La leyenda vigente es «Referencia sujeta a revisión de medidas, configuración y factibilidad.». No se menciona IVA en la UI; en el PDF se añade «+ IVA» pequeño y legible únicamente junto al total final.

## Corrección de imagen y 3D del último pedido

Aperturas usa de nuevo casement, tilt y fixed del material previo. Las guías no muestran leyendas de procedencia; los datos internos permanecen. Contacto de portada usa azul #006d94, texto blanco legible y acción oro. Material usa tinta #17272d; acabados conserva cian vivo. El 3D carga bajo demanda, ajusta el encuadre al volumen abierto y cerrado, restringe el giro y abre una sola hoja móvil de la corredera. Es una representación ilustrativa.

## Refinamiento vigente · 28 de octubre

Ver [dirección, referencias, movimiento y validación](diseno/REFINAMIENTO-OCT28.md). El acceso móvil inferior es un WhatsApp pequeño, oculto en contacto, menú y diálogo; no repite Cotizar. Las entradas de secciones no ocultan el contenido por defecto. Las selecciones cancelan animaciones pendientes y responden de inmediato al teclado. Menú móvil contiene foco, desactiva el fondo y restaura el desplazamiento al cerrar. Los assets conservan originales y usan variantes responsivas y AVIF para la sala, con WebP de respaldo.

## Dirección vigente de composición y movimiento

Actualización vigente del 31 de octubre: [Scroll narrativo](diseno/SCROLL-NARRATIVO-OCT31.md). Hero con recorrido de cámara y comparación de acabados funcionan con scroll nativo reversible tanto en PC como en móvil; reemplaza las entradas temporizadas de la portada. Switzer y la identidad original permanecen.

[El marco como sistema](diseno/DIRECCION-MOVIMIENTO-OCT28.md) sustituye la repetición de medios paneles del refinamiento anterior. Aperturas usa un índice; acabados un escenario central; material una galería editorial; herramientas dos piezas de escala diferente; guías una lectura ilustrada; contacto una vivienda a sangre. La secuencia de escritorio se verifica en nueve estados y retorno, con vídeo local y variante estática en celular. Los acabados se despliegan hasta el 70 %, permanecen opacos y separados, y sus nombres aparecen al terminar. No hay retirada de productos. [Controles Starwin](diseno/CONTROLES-STARWIN-OCT28.md) registra la revisión vigente de botones y selectores.
