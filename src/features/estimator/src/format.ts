import { formatDecimal } from './decimal';
export { formatDecimal } from './decimal';


/** Parse a user-entered number accepting both es-CL and software
 * conventions: "1500", "1500.5", "1500,5" and "1.500,5" all work, and the
 * thousands-dot trap ("1.500" meaning fifteen hundred) reads as 1500 —
 * never 1.5. Returns null for anything that is not a plain number. */
export function parseLocaleNumber(candidate: string): number | null {
  const text = candidate.trim();
  if (text === "") return null;
  // Groups of exactly three digits after dots are thousands separators —
  // an optional comma tail is then the decimal part ("1.500.000,25").
  const thousands = /^[+-]?\d{1,3}(?:\.\d{3})+(?:,\d+)?$/.test(text);
  const commaThousands = /^[+-]?\d{1,3}(?:,\d{3})+$/.test(text);
  const normalized = thousands
    ? text.replaceAll(".", "").replace(",", ".")
    : commaThousands
      ? text.replaceAll(",", "")
      : text.replace(",", ".");
  if (!/^[+-]?\d+(?:\.\d+)?$/.test(normalized)) return null;
  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}


export function fmtMm(value: string | number | null | undefined): string {
  const precision =
    String(value ?? "")
      .split(".")[1]
      ?.replace(/0+$/, "").length ?? 0;
  return formatDecimal(value, Math.min(precision, 12));
}