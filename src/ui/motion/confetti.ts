/** Konfeti deterministik (murni). */

export const CONFETTI_LIFETIME_MS = 1600
export const CONFETTI_MAX = 40

export interface ConfettiSpec {
  /** Titik awal horizontal, persen (0..100). */
  x0Pct: number
  /** Kecepatan horizontal px/detik. */
  vx: number
  /** Kecepatan vertikal awal px/detik (negatif = naik). */
  vy: number
  /** Percepatan gravitasi px/detik². */
  gravity: number
  rotSpeedDeg: number
  sizePx: number
  /** Indeks warna 0..3 (dipetakan ke token CSS oleh penyaji). */
  colorIndex: number
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

export function confettiSpecs(seed: number, count: number): ConfettiSpec[] {
  const n = Number.isFinite(count) ? Math.max(0, Math.min(CONFETTI_MAX, Math.floor(count))) : 0
  const rand = makeRng(seed)
  const out: ConfettiSpec[] = []
  for (let i = 0; i < n; i++) {
    out.push({
      x0Pct: 30 + rand() * 40,
      vx: (rand() - 0.5) * 360,
      vy: -(180 + rand() * 220),
      gravity: 500 + rand() * 200,
      rotSpeedDeg: (rand() - 0.5) * 720,
      sizePx: 5 + rand() * 5,
      colorIndex: Math.floor(rand() * 4),
    })
  }
  return out
}

export function confettiPosition(
  spec: ConfettiSpec,
  tMs: number,
): { x: number; y: number; rot: number; alpha: number } {
  const t = Number.isFinite(tMs) && tMs > 0 ? tMs : 0
  const s = t / 1000
  const alpha = t >= CONFETTI_LIFETIME_MS ? 0 : Math.max(0, 1 - t / CONFETTI_LIFETIME_MS)
  return {
    x: spec.vx * s,
    y: spec.vy * s + 0.5 * spec.gravity * s * s,
    rot: spec.rotSpeedDeg * s,
    alpha,
  }
}
