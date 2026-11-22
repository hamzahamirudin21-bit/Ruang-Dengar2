import type { PixelGrid } from '../characters/pixelGrid'
import { measurePixelText, paintPixelText } from './pixelFont'

export const PLAQUE_BORDER = 1
export const PLAQUE_PAD_X = 3
export const PLAQUE_PAD_Y = 2

const BG = '#1b2a49'
const BORDER = '#f6efe0'
const BORDER_HI = '#d9a441'
const TEXT = '#f6efe0'
const TEXT_HI = '#ffe8a8'

/** Ukuran plakat: ukuran teks ditambah bantalan dan bingkai. */
export function measurePlaque(text: string): { w: number; h: number } {
  const t = measurePixelText(text)
  return {
    w: t.w + 2 * (PLAQUE_PAD_X + PLAQUE_BORDER),
    h: t.h + 2 * (PLAQUE_PAD_Y + PLAQUE_BORDER),
  }
}

/** Plakat berbingkai dengan sudut terpotong satu piksel. */
export function paintPlaque(text: string, opts: { highlighted: boolean }): PixelGrid {
  const { w, h } = measurePlaque(text)
  const border = opts.highlighted ? BORDER_HI : BORDER
  const cells: (string | null)[] = new Array(w * h).fill(BG)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const edge = x < PLAQUE_BORDER || y < PLAQUE_BORDER || x >= w - PLAQUE_BORDER || y >= h - PLAQUE_BORDER
      if (edge) cells[y * w + x] = border
    }
  }
  for (const [x, y] of [[0, 0], [w - 1, 0], [0, h - 1], [w - 1, h - 1]] as const) {
    cells[y * w + x] = null
  }
  const label = paintPixelText(text, opts.highlighted ? TEXT_HI : TEXT)
  const ox = PLAQUE_BORDER + PLAQUE_PAD_X
  const oy = PLAQUE_BORDER + PLAQUE_PAD_Y
  for (let y = 0; y < label.height; y++) {
    for (let x = 0; x < label.width; x++) {
      const c = label.cells[y * label.width + x]
      if (c) cells[(oy + y) * w + ox + x] = c
    }
  }
  return { width: w, height: h, cells }
}
