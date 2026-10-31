# Herramientas Starwin · 27 de octubre de 2026

Se añaden cuatro utilidades públicas al visualizador y al estimador existentes. Cada utilidad resuelve una consulta concreta y deja un siguiente paso hacia el catálogo, el equipo Starwin o las medidas del proyecto. No se incorporan cálculos de ahorro, ruido ni prestaciones sin datos técnicos verificables.

## Rutas y alcance

- `/elegir-ventana/`: tres preguntas sobre habitación, recorrido y prioridad. Reglas explícitas muestran dos aperturas del catálogo. No es una certificación de ventilación ni seguridad.
- `/comparar-ventanas/`: dos productos con filas comunes sobre espacio, ventilación, cierre, limpieza, uso y aspectos a revisar. Los parámetros `a` y `b` conservan la comparación en un enlace compartible. La consulta por WhatsApp incluye los dos modelos.
- `/medir-ventanas/`: hasta 50 medidas distintas con cantidades; entrada en centímetros y coma decimal, conversión a milímetros enteros y suma de áreas desde las medidas. Tres anchos y tres altos opcionales, mínimos sin descontar holguras. Editar, quitar/deshacer, copia, mensajes, guardado local optativo y ficha PDF de varias páginas. Los enlaces al estimador pasan ancho y alto, sin cambiar su motor de precios.
- `/calculadora-condensacion/`: punto de rocío a partir de temperatura interior y humedad. Temperatura superficial opcional para comparar con el punto de rocío. Aproximación de August–Roche–Magnus sobre agua: a = 17,625 y b = 243,04 °C. Fuente: [EPA, Humidity algorithms](https://qed.epa.gov/hms/meteorology/humidity/algorithms/). No representa el comportamiento térmico de un producto ni diagnostica filtraciones.

## Diseño e integración

Figtree, cian y dorado Starwin, superficies planas y fotos ya usadas en el catálogo. El dibujo del medidor es un esquema técnico de ancho y alto. Los controles de la herramienta tienen 16 px de texto y superficies táctiles de al menos 44 px; el medidor agrupa ancho, alto y cantidad para reducir el recorrido móvil. No se instala un framework adicional. El generador PDF y sus tipografías se cargan al descargar.

La cabecera enlaza a Herramientas. El inicio añade tres enlaces discretos dentro de su sección de herramientas. Las guías de medición, condensación y aperturas enlazan a la utilidad correspondiente. Cada página tiene contenido HTML, canonical propio, migas y WebApplication; el índice tiene ItemList. El sitemap y llms.txt incluyen las nuevas rutas.

La extracción BauFens existente orienta la prioridad de imagen y jerarquía material; las utilidades usan el lenguaje de la web vigente. La librería de taste ofreció `framed-sheet` y `achromatic-ledger`; se conserva el marco Starwin y se adopta la prioridad de datos y superficies del segundo, sin reconstruir la marca.

## Verificación

- Build, comprobación TypeScript y SEO: correctos. 35 páginas y 34 URL indexables en el sitemap local.
- 28 pruebas de lógica/API, incluidas 945 comparaciones del estimador con los precios originales, correctas.
- Suite de navegador existente y suite nueva: correctas. Nuevas herramientas verificadas a 320, 390, 768 y 1440 px. Cero observaciones Axe en las cinco páginas y el resultado del asistente.
- Casos funcionales: enlace de comparación, selección y reinicio del asistente, entradas inválidas, valores conocidos de Magnus, medidas con coma, cantidades, tres puntos, editar/quitar/deshacer, persistencia optativa y borrado, WhatsApp/correo y PDFs reales de una y cuatro páginas.
- PDFs renderizados con Poppler e inspeccionados: texto y totales legibles, sin solapamientos; nombres largos y continuación entre páginas correctos.
- Capturas de los inspectores revisadas. Cero FAIL al final. Advertencias defendidas: títulos de página mayores que los de un dashboard por compartir el marco público del sitio; cian en el resultado de condensación para destacar el dato principal. La advertencia de vacío del asistente no coincide con un hueco en la captura: la mitad derecha contiene el formulario.

La revisión móvil es emulación Chrome; falta comprobar teclado y comportamiento en un teléfono físico. El servicio del visualizador conserva su configuración previa y sigue necesitando credenciales para generar imágenes. No se ha publicado en GitHub ni Cloudflare, y no se atribuye una mejora de tráfico a una versión local.

## Revisión final

La pregunta principal se responde en la interfaz, los totales proceden de los datos y los controles conducen a destinos reales. El medidor se simplificó después de revisar el primer móvil. El comparador conserva fotos de formatos diferentes del catálogo; funciona como comparador de aperturas, pero unas fotografías futuras con encuadre consistente mejorarían su uniformidad. La validación técnica y la apariencia no prueban conversión comercial; esta requiere medir el uso después de publicar.

Evidencia reproducible: `npm run test:tools`, `npm run test:browser`, `npm test`, `npm run check` y `npm run typecheck`. Informes y capturas en `verificacion/herramientas/`; informes del inspector en `.taste-skill/tools/`.
