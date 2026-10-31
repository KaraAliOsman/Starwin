# Precios del repositorio original Starwinpvc

Verificado el 18 de octubre de 2026.

## Fuente comprobable

- Repositorio: https://github.com/KaraAliOsman/Starwinpvc
- Commit: `64a6a279a8f7f08844001d6380dec1b658444fa5`.
- Archivo: [src/app/api/pricing/route.ts](https://github.com/KaraAliOsman/Starwinpvc/blob/64a6a279a8f7f08844001d6380dec1b658444fa5/src/app/api/pricing/route.ts).
- Blob Git: `ccb416b6caa0c5ed19419636b3087b70b9d1aa8f`.
- Copia íntegra: `Starwinpvc-pricing-route.original.ts.txt`, 20.991 bytes, conservando sus finales de línea.
- SHA-256 de la copia original: `ff550fbb016dbfd71d9bd5afa8c5d4994e057cf02a66a17030262d0fbf28b67c`.

Se comprobó la ruta fijada a ese commit en GitHub y en un checkout limpio del mismo repositorio. El configurador original la solicita en `src/components/configurador/ConfiguratorContext.tsx`, mediante `fetch('/api/pricing', ...)`.

El repositorio también contiene `src/lib/pricing.ts`, un estimador genérico anterior. Ese archivo no es la autoridad utilizada para este configurador de paneles.

## Adaptación utilizada

`../app/pricing/pricing.ts` contiene el motor extraído de esa ruta. Se separaron los tipos y se cambió la recepción/respuesta HTTP por `calcularPrecio(config)`. Las tablas de perfiles por color, vidrio, herrajes, extras, fórmulas de divisiones, margen `2.25` y `Math.round(factory * MARGEN)` se conservan.

SHA-256 del motor extraído, sin cambios durante esta restauración:

`f4bf0eab0813d872011e054e6d0f61af4fb1a940c641abb37bdf6b0643013a42`.

Los gráficos proceden del kit Framedex. Sus anchos visuales de perfil y su escena 3D no deciden ningún precio. El árbol del diseño, sus proporciones y la apertura de cada paño se entregan al motor de Starwinpvc. Los unitarios se calculan y redondean como en el original; después se multiplican por la cantidad y se suman los subtotales.

## Equivalencia ejecutable

`../app/original-pricing.test.ts` transpila y ejecuta la ruta original completa. Solo sustituye `NextResponse.json` por un transporte de pruebas, sin sustituir ninguna instrucción de cálculo. Comprueba también el SHA-256 de la copia original.

Con `npm test` se comparan 467 configuraciones contra esa ruta:

- 47 casos de referencia conservados de la extracción inicial.
- 280 combinaciones de 8 diseños, 7 colores y 5 vidrios, con medidas de 1835 × 1475 mm.
- 70 variantes con travesaño horizontal y división vertical anidados, posiciones de 30% y 40%, hojas abatible/oscilobatiente, todos los colores/vidrios y extras activados/desactivados.
- 70 combinaciones de los dos modelos prearmados con fijo superior para la interfaz simple, con los siete colores y cinco vidrios.

Todas coinciden exactamente, sin tolerancias ni ajustes de precio. En total pasan 243 pruebas del módulo, incluidas geometría, gráficos, persistencia y cantidades. Esto verifica fidelidad al cálculo original; las tarifas originales siguen siendo las de ese commit y no se han actualizado a un catálogo comercial posterior.

## Ejemplo comprobado en navegador y PDF

| Diseño | Cantidad | Unitario original | Unitario nuevo | Subtotal |
| --- | ---: | ---: | ---: | ---: |
| Corredera de 2 hojas, 180,5 × 140 cm, Antracita | 2 | $488.829 | $488.829 | $977.658 |
| Dos abatibles con fijo superior, 190 × 150 cm, Nogal | 1 | $531.612 | $531.612 | $531.612 |
| Baño, proyectante, 70 × 60 cm, Blanco, vidrio opaco | 1 | $112.783 | $112.783 | $112.783 |
| **Total** | **4** | | | **$1.622.053** |

Los tres modelos usan termopanel; solo el baño tiene activado el extra de vidrio opaco. Las entradas y los resultados se conservan en `../ejemplos/datos-verificados.json`. El total coincide con pantalla y con `../ejemplos/presupuesto-starwin.pdf`, renderizado para revisión visual. La interfaz permite elegir estos modelos completos sin editar sus divisiones.

## Ubicación en Starwin v3 (23 de octubre de 2026)

El motor integrado está en `src/features/estimator/app/pricing/pricing.ts`, con el mismo SHA-256 documentado arriba. La prueba actual de comparación está en `tests/pricing.test.mjs` y cubre 945 configuraciones; no confundir las rutas históricas de extracción con las rutas del proyecto Astro. La integridad se volvió a comprobar mediante hash en `verificacion/precios-integridad.json`. No se cambiaron fórmulas ni tablas durante el rediseño. La prueba actual de navegador vuelve a obtener $1.622.053 en un presupuesto de varias ventanas.
