export type Direction = 'bawah' | 'kiri' | 'kanan' | 'atas'
export type AnimKind = 'idle' | 'jalan'
export type LayerId = 'tubuh' | 'pakaian' | 'aksesori'

export const SPRITE_W = 16
export const SPRITE_H = 24
export const IDLE_FRAMES = 2
export const WALK_FRAMES = 4

/** Sel bernilai warna "#rrggbb" atau null (transparan). Indeks: y * width + x. */
export interface PixelGrid {
  width: number
  height: number
  cells: readonly (string | null)[]
}

export interface SpriteLayer {
  id: LayerId
  grid: PixelGrid
}

/**
 * Menumpuk lapisan dari bawah ke atas. Sel non-null pada lapisan yang lebih
 * atas menimpa sel di bawahnya. Lapisan dipotong/diisi ke ukuran width x height.
 */
export function flattenLayers(
  layers: readonly SpriteLayer[],
  width: number,
  height: number,
): PixelGrid {
  const cells: (string | null)[] = new Array(width * height).fill(null)
  for (const layer of layers) {
    const { grid } = layer
    const w = Math.min(width, grid.width)
    const h = Math.min(height, grid.height)
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const c = grid.cells[y * grid.width + x]
        if (c) cells[y * width + x] = c
      }
    }
  }
  return { width, height, cells }
}
