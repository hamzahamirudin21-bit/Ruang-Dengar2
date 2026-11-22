/** Utilitas kontras WCAG 2.x. Fungsi murni, tanpa DOM. */

export type RGB = readonly [number, number, number];

/** Parse hex "#rgb" atau "#rrggbb" menjadi [r,g,b] (0-255). Melempar Error jika tidak valid. */
export function parseHex(hex: string): RGB {
  const m = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.exec(hex.trim());
  if (!m) throw new Error(`Warna hex tidak valid: ${hex}`);
  let h = m[1];
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function channel(v: number): number {
  const s = v / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

/** Luminansi relatif (WCAG 2.x), 0..1. */
export function relativeLuminance(hex: string): number {
  const [r, g, b] = parseHex(hex);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** Rasio kontras (WCAG 2.x), 1..21. Simetris terhadap urutan argumen. */
export function contrastRatio(fg: string, bg: string): number {
  const a = relativeLuminance(fg);
  const b = relativeLuminance(bg);
  const hi = Math.max(a, b);
  const lo = Math.min(a, b);
  return (hi + 0.05) / (lo + 0.05);
}

/** Ambang minimum teks normal (WCAG AA). */
export const MIN_TEXT_CONTRAST = 4.5;
