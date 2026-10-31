/** Presentation only. Values arrive from the engine; no engineering formula lives here. */
export type DecimalValue = string | number | bigint | null | undefined;

export const THIN_SPACE = "\u2009";


function canonical(value: DecimalValue): string | null {
  if (value === null || value === undefined || value === "") return null;
  const text = String(value).trim();
  if (/^[+-]?\d+(?:\.\d+)?$/.test(text)) return text.replace(/^\+/, "");
  return null;
}


/** Decimal ROUND_HALF_UP, including negative ties and carry beyond Number.MAX_SAFE_INTEGER. */
export function quantize(value: DecimalValue, digits: number): string | null {
  if (!Number.isInteger(digits) || digits < 0 || digits > 12)
    throw new RangeError("Precisión inválida");
  const text = canonical(value);
  if (text === null) return null;
  const negative = text.startsWith("-");
  const [integer = "0", fraction = ""] = text.replace(/^-/, "").split(".");
  const kept = fraction.slice(0, digits).padEnd(digits, "0");
  let units = BigInt(integer + kept);
  if ((fraction[digits] ?? "0") >= "5") units += 1n;
  const magnitude = units.toString().padStart(digits + 1, "0");
  const sign = negative && units !== 0n ? "-" : "";
  return `${sign}${digits ? `${magnitude.slice(0, -digits)}.${magnitude.slice(-digits)}` : magnitude}`;
}


export function formatDecimal(value: DecimalValue, digits = 0, separator = THIN_SPACE): string {
  const rounded = quantize(value, digits);
  if (rounded === null) return "Sin dato";
  const [integer = "0", fraction] = rounded.replace(/^-/, "").split(".");
  const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  return `${rounded.startsWith("-") ? "−" : ""}${grouped}${fraction ? `,${fraction}` : ""}`;
}