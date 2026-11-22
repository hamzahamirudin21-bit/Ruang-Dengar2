/** Hitung-naik angka (murni), easeOut kubik. */

export function easeOutCubic(p: number): number {
  const c = Math.min(1, Math.max(0, p))
  return 1 - Math.pow(1 - c, 3)
}

export function countUpValue(
  from: number,
  to: number,
  elapsedMs: number,
  durationMs: number,
  reduced = false,
): number {
  const a = Number.isFinite(from) ? from : 0
  const b = Number.isFinite(to) ? to : 0
  if (reduced || !Number.isFinite(durationMs) || durationMs <= 0) return Math.round(b)
  const t = Number.isFinite(elapsedMs) && elapsedMs > 0 ? elapsedMs : 0
  if (t >= durationMs) return Math.round(b)
  const v = Math.round(a + (b - a) * easeOutCubic(t / durationMs))
  const lo = Math.min(Math.round(a), Math.round(b))
  const hi = Math.max(Math.round(a), Math.round(b))
  return Math.min(hi, Math.max(lo, v))
}
