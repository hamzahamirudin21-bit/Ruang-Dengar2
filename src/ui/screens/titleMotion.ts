/** Gerak Layar Awal: jeda pantul huruf logo dan kilau (murni, deterministik). */

export const MAX_SPARKLES = 12;

export interface SparkleSpec {
  /** Posisi horizontal, persen 0..100 */
  leftPct: number;
  /** Posisi vertikal, persen 0..100 */
  topPct: number;
  /** Ukuran dalam px */
  sizePx: number;
  /** Jeda animasi dalam ms */
  delayMs: number;
  /** Durasi animasi dalam ms */
  durationMs: number;
}

/** Jeda pantul per karakter; panjang sama dengan teks, tak menurun, ≥ 0. */
export function letterBounceDelays(text: string, stepMs: number): number[] {
  const step = Number.isFinite(stepMs) ? Math.max(0, Math.round(stepMs)) : 0;
  const n = Array.from(text).length;
  const out: number[] = [];
  for (let i = 0; i < n; i++) out.push(i * step);
  return out;
}

function mulberry32(seed: number): () => number {
  let a = (Number.isFinite(seed) ? Math.floor(seed) : 0) >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Kilau deterministik dari benih; paling banyak 12. */
export function sparkleSpecs(seed: number, count: number): SparkleSpec[] {
  const n = Number.isFinite(count)
    ? Math.max(0, Math.min(MAX_SPARKLES, Math.floor(count)))
    : 0;
  const rnd = mulberry32(seed);
  const out: SparkleSpec[] = [];
  for (let i = 0; i < n; i++) {
    out.push({
      leftPct: Math.round(rnd() * 1000) / 10,
      topPct: Math.round(rnd() * 1000) / 10,
      sizePx: 6 + Math.floor(rnd() * 9),
      delayMs: Math.floor(rnd() * 2400),
      durationMs: 1400 + Math.floor(rnd() * 1600),
    });
  }
  return out;
}
