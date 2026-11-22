/** Kedalaman adegan (murni): parallax mengambang dan debu. */

export const BACKDROP_BLUR_PX = 1.2
export const PARALLAX_MAX_PX = 4
export const PARALLAX_PERIOD_MS = 12000
export const DUST_MAX = 12

export interface DustSpec {
  /** Posisi horizontal awal, persen lebar (0..100). */
  xPct: number
  /** Posisi vertikal awal, persen tinggi (0..100). */
  yPct: number
  sizePx: number
  /** Durasi satu siklus, ms. */
  durationMs: number
  delayMs: number
  opacity: number
}

function safeTime(t: number): number {
  return Number.isFinite(t) && t > 0 ? t : 0
}

/** Pergeseran mengambang horizontal, |x| ≤ 4, periode 12 s; 0 bila gerak dikurangi. */
export function parallaxOffsetPx(timeMs: number, reduced: boolean): number {
  if (reduced) return 0
  const t = safeTime(timeMs) % PARALLAX_PERIOD_MS
  return Math.sin((2 * Math.PI * t) / PARALLAX_PERIOD_MS) * PARALLAX_MAX_PX
}

function makeRng(seed: number): () => number {
  let s = (Number.isFinite(seed) ? Math.floor(seed) : 0) >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Partikel debu deterministik; paling banyak 12, kosong pada viewport sempit. */
export function dustSpecs(seed: number, count: number, narrow: boolean): DustSpec[] {
  if (narrow) return []
  const n = Number.isFinite(count) ? Math.max(0, Math.min(DUST_MAX, Math.floor(count))) : 0
  const rand = makeRng(seed)
  const out: DustSpec[] = []
  for (let i = 0; i < n; i++) {
    out.push({
      xPct: rand() * 100,
      yPct: rand() * 100,
      sizePx: 1 + rand() * 2,
      durationMs: 8000 + Math.floor(rand() * 6000),
      delayMs: Math.floor(rand() * 6000),
      opacity: 0.2 + rand() * 0.3,
    })
  }
  return out
}
