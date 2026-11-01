# Trabajos, icono y estabilidad del hero · 1 de noviembre

Siete fotografías recuperadas de la galería pública de Starwin, con autorización del propietario. La colección conserva enlaces a cada publicación y descripciones visibles sin inferir medidas, prestaciones, comunas ni clientes. Se excluyó una imagen con una persona. Fuente de cada archivo: TRABAJOS-FUENTES-NOV01.json. Se sirven tres tamaños WebP sin ampliar originales.

Galería revisada a 320, 390, 768 y 1440 px: filtros, diálogo, Escape, foco restaurado, sin desbordamiento, cero incidencias axe y contenido legible sin JavaScript. Informe local: verificacion/trabajos/report.json.

El icono reproduce la ventana, estrella y trazo del logo original public/starwin-logo.png; no es una reinterpretación. SVG, PNG y apple-touch actualizados.

El hero conserva su composición. Antes se escalaba el contenedor completo del viewport y refresh borraba la transformación hasta el siguiente frame. Ahora se escala solo el marco y el redibujado ocurre en el mismo cálculo de geometría. Prueba de avance, retorno y cuatro eventos resize durante zoom estable a 390 y 1440 px con DPR 2. Chrome emulado; no se afirma prueba de GPU o teléfono físico.

Se retiró la presentación antigua /sitemap.xml en Google y Bing. Ambos paneles conservan solo /sitemap-index.xml. La dirección histórica responde 301 al índice vigente para bots y enlaces existentes. El build contiene 36 URL indexables (37 HTML incluyendo 404). La indexación de la galería requiere un nuevo rastreo; no se promete plazo ni posición.
