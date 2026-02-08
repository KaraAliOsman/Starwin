# Exportandes - Estructura propuesta

```
exportandes/
├── content/
│   └── hero-copy.md
├── seo/
│   └── recycling-center.jsonld
└── src/
    ├── components/
    │   └── PriceTicker.tsx
    ├── data/
    │   └── priceTicker.json
    └── styles/
        └── ticker.css
```

## Cómo usar el PriceTicker

1. Editar los precios en `src/data/priceTicker.json` o conectarlo a Google Sheets/Headless CMS.
2. Consumir el JSON desde una ruta API o desde `getStaticProps`/`fetch` en Next.js.
3. Renderizar el componente:

```tsx
import tickerData from "@/data/priceTicker.json";
import { PriceTicker } from "@/components/PriceTicker";

<PriceTicker prices={tickerData.prices} updatedAt={tickerData.updatedAt} />
```

## Estilos adicionales (opcional)

El componente incluye su animación vía `styled-jsx`. Si se prefiere CSS global, mover los estilos a `src/styles/ticker.css`.
