> Actualización: galería completada con siete fotos públicas verificadas; ver [TRABAJOS-NOV01.md](TRABAJOS-NOV01.md). El estado pendiente de abajo es histórico.

# Revisión pública de SEO y trabajos realizados · 1 de noviembre de 2026

## Lo verificado en esta revisión

La revisión autenticada actual de Google Search Console y Bing no pudo completarse. El navegador de desarrollo no descubrió una conexión disponible; el control nativo de Chrome se detuvo porque no pudo verificar con seguridad su URL. No se siguió controlando esa ventana ni se extrajeron credenciales. Los últimos resultados autenticados siguen siendo los de `BUSCADORES-NOV01.md`: sitemap correcto en Google y Bing, Biobío y cotizador indexados en Google, validación del aviso histórico iniciada. No se presentan como una consulta nueva ni como validaciones ya finalizadas.

Se revisaron públicamente las variantes sin extensión de las páginas antiguas de GitHub Pages. Ocho devolvían HTTP 404: `/beneficios`, `/blog-eficiencia-estilo`, `/blog-ahorro-energetico`, `/blog-clima-sur`, `/blog-disenos-acabados`, `/blog-impacto-ambiental`, `/blog-guia-compra` y `/gracias`. Se añaden las variantes con y sin barra final, con destinos equivalentes directos. Se completa también `/detalles-tecnicos`, que respondió HTTP 200 durante la comprobación, con el destino migrado ya establecido para su variante `.html`.

El total pasa de 63 a 81 reglas. El comprobador del sitio verifica ahora que cada ruta histórica `.html` tenga sus equivalentes sin extensión cuando el destino es distinto de la ruta actual. Se conservan los 308 normales de `/nosotros`, `/contacto`, `/colores` y `/proceso`. No se añade una redirección general de páginas desconocidas a la portada.

## Trabajos realizados: material y bloqueo

Fuentes del propietario: https://www.facebook.com/Starwinchile/ y https://www.instagram.com/starwincl/.

La lectura pública de Facebook devuelve el nombre, descripción y logo, pero no las fotografías ni los textos de las publicaciones. Instagram también devuelve datos del perfil sin las publicaciones. El plugin público de página de Facebook devolvió únicamente nombre, seguidores y logo. No se usan esas respuestas para inventar instalaciones ni para atribuir fotografías de catálogo a trabajos realizados.

Se buscó una integración social y se sugirió Metricool, que todavía no está conectado. Se pidieron enlaces directos a 3–6 publicaciones como alternativa. La autorización para reutilizar los trabajos ya está dada por el encargo; lo pendiente es acceso al material, no una nueva aprobación general.

El borrador está en `drafts/trabajos-realizados.astro`; el modelo de contenido está en `src/data/works.ts`. Dispone de fotografías ampliables, selección por tipo de trabajo, textos breves, enlace a la publicación y contacto directo. La colección permanece vacía. El borrador queda fuera de las rutas públicas y del sitemap hasta disponer de fotografías verificadas. No se anuncia una galería terminada ni probada con trabajos reales.

Dirección propuesta: fotografías a distintas escalas, conservando Switzer y los colores Starwin. Idea: las instalaciones reales, en su lugar, constituyen la prueba del producto. No se cambia la portada aprobada. La distribución final y sus encuadres se revisarán con las imágenes reales; no se puede juzgar esa composición sin ellas.

Al incorporar material se omiten nombres de clientes, direcciones particulares y rostros salvo autorización específica. Solo se describen aperturas, acabados y comunas cuando la publicación o las imágenes los acreditan. Los enlaces y la procedencia se conservan en el registro editorial.

## Evidencia local

- `verificacion/seo-nov01/rutas-historicas.json`: respuestas públicas antes de corregir.
- `verificacion/trabajos-fuentes/`: respuestas de los perfiles y del plugin público.
- La página de trabajos no se incorpora al menú ni a la portada mientras no contenga trabajos verificados.
