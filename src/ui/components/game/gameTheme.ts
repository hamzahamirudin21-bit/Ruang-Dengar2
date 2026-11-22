/**
 * Pemetaan murni varian komponen game → nama kelas, plus format angka lencana/meter.
 * Tanpa warna literal; semua kelas didefinisikan di src/index.css.
 */

export type FrameVariant = "kayu" | "krem" | "navy";
export type ButtonVariant = "primer" | "sekunder" | "bulat-ikon";
export type ButtonSize = "sm" | "md" | "lg";
export type MeterTone = "rendah" | "sedang" | "tinggi";

const FRAME_CLASS: Readonly<Record<FrameVariant, string>> = {
  kayu: "game-panel-wood",
  krem: "game-panel-cream",
  navy: "game-panel-navy",
};

const BUTTON_CLASS: Readonly<Record<ButtonVariant, string>> = {
  primer: "game-btn-primary",
  sekunder: "game-btn-secondary",
  "bulat-ikon": "game-btn-round",
};

export function frameClass(variant: FrameVariant, opts?: { nails?: boolean }): string {
  const base = FRAME_CLASS[variant] ?? FRAME_CLASS.krem;
  return opts?.nails ? `${base} game-nails` : base;
}

export function buttonClass(variant: ButtonVariant, _opts?: { size?: ButtonSize }): string {
  return BUTTON_CLASS[variant] ?? BUTTON_CLASS.primer;
}

/** Bilangan bulat >= 0; di atas 999 menjadi "999+". */
export function badgeValueText(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "0";
  const n = Math.floor(value);
  return n > 999 ? "999+" : String(n);
}

export function badgeFractionText(done: number, total: number): string {
  const d = badgeValueText(done);
  const t = badgeValueText(total);
  return `${d}/${t}`;
}

/** Pecahan [0,1]; masukan tidak sah menghasilkan 0. */
export function meterFraction(value: number, max: number): number {
  if (!Number.isFinite(value) || !Number.isFinite(max) || max <= 0) return 0;
  return Math.min(1, Math.max(0, value / max));
}

export function meterTone(fraction: number, higherIsBetter: boolean): MeterTone {
  const f = Number.isFinite(fraction) ? fraction : 0;
  const raw: MeterTone = f < 0.33 ? "rendah" : f < 0.66 ? "sedang" : "tinggi";
  if (higherIsBetter) return raw;
  return raw === "rendah" ? "tinggi" : raw === "tinggi" ? "rendah" : "sedang";
}

export function meterPercentText(fraction: number): string {
  const f = Number.isFinite(fraction) ? Math.min(1, Math.max(0, fraction)) : 0;
  return `${Math.round(f * 100)}%`;
}
