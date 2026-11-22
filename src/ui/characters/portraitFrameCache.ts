/** Cache LRU kecil untuk bingkai potret detail (kunci: id, ekspresi, mata, mulut). */
export const FRAME_CACHE_CAPACITY = 96

export function frameKey(
  id: string,
  expression: string,
  eyesClosed: boolean,
  mouth: string,
): string {
  return `${id}|${expression}|${eyesClosed ? 'c' : 'o'}|${mouth}`
}

export class FrameCache<T> {
  private readonly map = new Map<string, T>()

  constructor(private readonly capacity: number = FRAME_CACHE_CAPACITY) {}

  /** Mengembalikan nilai tersimpan atau membuatnya; entri paling lama tak dipakai dibuang. */
  get(key: string, make: () => T): T {
    if (this.map.has(key)) {
      const hit = this.map.get(key) as T
      this.map.delete(key)
      this.map.set(key, hit)
      return hit
    }
    const value = make()
    this.map.set(key, value)
    while (this.map.size > Math.max(1, this.capacity)) {
      const oldest = this.map.keys().next().value as string
      this.map.delete(oldest)
    }
    return value
  }

  size(): number {
    return this.map.size
  }
}
