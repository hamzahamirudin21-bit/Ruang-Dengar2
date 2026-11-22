export type SeededRng = () => number;

/**
 * Generator angka acak deterministik mulberry32.
 * Seed yang sama selalu menghasilkan urutan angka identik di [0, 1).
 */
export function mulberry32(seed: number): SeededRng {
  let state = (seed | 0) >>> 0;
  return function next(): number {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function randomInt(rng: SeededRng, minInclusive: number, maxInclusive: number): number {
  const low = Math.ceil(minInclusive);
  const high = Math.floor(maxInclusive);
  if (high <= low) {
    return low;
  }
  return low + Math.floor(rng() * (high - low + 1));
}

export function randomRange(rng: SeededRng, min: number, max: number): number {
  return min + rng() * (max - min);
}

export function pickOne<T>(rng: SeededRng, items: readonly T[]): T {
  if (items.length === 0) {
    throw new Error('pickOne dipanggil pada daftar kosong');
  }
  return items[randomInt(rng, 0, items.length - 1)];
}

export function shuffleDeterministic<T>(rng: SeededRng, items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = randomInt(rng, 0, i);
    const tmp = copy[i];
    copy[i] = copy[j];
    copy[j] = tmp;
  }
  return copy;
}

export function clamp01(value: number): number {
  if (value <= 0) return 0;
  if (value >= 1) return 1;
  return value;
}

export function clampAffinity(value: number): number {
  if (value <= -1) return -1;
  if (value >= 1) return 1;
  return value;
}
