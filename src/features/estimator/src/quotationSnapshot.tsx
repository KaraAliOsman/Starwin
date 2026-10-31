import { renderToStaticMarkup } from "react-dom/server";
import { ProductFrontSvg } from "./features/canvas/ProductFrontSvg";
import type { ProductJson } from "./features/canvas/productEditing";
import type { MemberGeometry } from "./features/canvas/members";
import { elevationEnvelopeMm } from "./features/canvas/productEditing";
import drawingCss from "./features/canvas/Drawing.css?raw";

/** A presentation snapshot. Prices are supplied by the caller; none are computed here. */
export type QuotationSnapshot = {
  schema_version: 1;
  issuer: { name: string; details?: string };
  client: { name: string; details?: string };
  number: string;
  revision: string;
  date: string;
  title: string;
  currency: string;
  paper: "LETTER" | "A4" | "OFICIO";
  layout: "ESENCIAL" | "PROYECTO" | "ALTERNATIVAS";
  positions: {
    id: string;
    name: string;
    dimensions: string;
    quantity: string;
    specifications: { label: string; value: string }[];
    drawing_png?: string;
    unit_price?: string | null;
    line_total?: string | null;
  }[];
  totals: { label: string; value: string }[];
  terms: string[];
  notice?: string;
};

export async function windowDrawingPng(
  product: ProductJson,
  members: MemberGeometry,
): Promise<string> {
  const noop = () => {};
  const svg = renderToStaticMarkup(
    <ProductFrontSvg
      product={product}
      members={members}
      selectedId={null}
      issues={[]}
      disabled
      preview
      onSelectModule={noop}
      onAddUnit={noop}
      onCommitModuleWidth={noop}
      onCommitTotalWidth={noop}
      onCommitHeight={noop}
    />,
  );
  // Resolve the original design tokens into the standalone SVG before rasterizing.
  const tokens = getComputedStyle(document.documentElement);
  const resolve = (input: string) =>
    input.replace(
      /var\((--[\w-]+)(?:,\s*([^()]*))?\)/g,
      (_, key: string, fallback: string) =>
        tokens.getPropertyValue(key).trim() || fallback || "#465158",
    );
  const standalone = resolve(
    svg
      .replace(
        "<svg ",
        `<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="1000" `,
      )
      .replace(">", "><style>" + drawingCss + "</style>"),
  );
  const url = URL.createObjectURL(
    new Blob([standalone], { type: "image/svg+xml" }),
  );
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const canvas = document.createElement("canvas");
    canvas.width = 1400;
    canvas.height = 1000;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas_unavailable");
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, 1400, 1000);
    ctx.drawImage(img, 0, 0);
    return canvas.toDataURL("image/png");
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function exportQuotationSnapshot(
  product: ProductJson,
  members: MemberGeometry,
): Promise<QuotationSnapshot> {
  const dims = elevationEnvelopeMm(product);
  return {
    schema_version: 1,
    issuer: { name: "Starwin" },
    client: { name: "Cliente por completar" },
    number: "BORRADOR",
    revision: "A",
    date: new Intl.DateTimeFormat("es-CL", {
      timeZone: "America/Santiago",
    }).format(new Date()),
    title: "Propuesta de ventanas",
    currency: "CLP",
    paper: "LETTER",
    layout: "ESENCIAL",
    notice:
      "Borrador visual sin importes. Perfiles ilustrativos, sin catálogo de fabricante.",
    positions: [
      {
        id: "V1",
        name: "Ventana diseñada",
        dimensions: `${dims.width} × ${dims.height} mm`,
        quantity: "1",
        specifications: [
          { label: "Vista", value: "Interior" },
          { label: "Geometría", value: "Ilustrativa, sin catálogo" },
        ],
        drawing_png: await windowDrawingPng(product, members),
      },
    ],
    totals: [],
    terms: [],
  };
}
