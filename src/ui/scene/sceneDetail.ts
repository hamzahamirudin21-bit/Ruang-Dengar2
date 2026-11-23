/**
 * Lapisan detail latar adegan. Lukisan logis 192×108 diperbesar 2× (nearest),
 * lalu lapisan ini menambah kontur tipis, tekstur lantai/dinding, sorotan
 * kaca/logam, dan benda kecil khas tiap adegan pada kisi 384×216.
 * Deterministik: hanya memakai PRNG berbenih tetap.
 */
import type { PixelGrid } from '../characters/pixelGrid'
import type { SceneArtId } from './sceneArt'
import {
  blendPx, box, createCanvas, disc, getPx, hline, line, px, rect, rng, shade, shadowRect, vline,
} from './sceneProps'
import type { Canvas, Variant } from './sceneProps'

/** Perbesar `Canvas` dengan faktor bulat (nearest-neighbour). */
export function upscaleCanvas(src: Canvas, factor: number): Canvas {
  const out = createCanvas(src.w * factor, src.h * factor, '#000000')
  for (let y = 0; y < out.h; y++) {
    const sy = Math.floor(y / factor)
    for (let x = 0; x < out.w; x++) {
      out.cells[y * out.w + x] = src.cells[sy * src.w + Math.floor(x / factor)] as string
    }
  }
  return out
}

/** Perbesar `PixelGrid` dengan faktor bulat (nearest-neighbour). */
export function upscaleGrid(src: PixelGrid, factor: number): PixelGrid {
  const width = src.width * factor
  const height = src.height * factor
  const cells = new Array<string | null>(width * height)
  for (let y = 0; y < height; y++) {
    const sy = Math.floor(y / factor)
    for (let x = 0; x < width; x++) cells[y * width + x] = src.cells[sy * src.width + Math.floor(x / factor)] ?? null
  }
  return { width, height, cells }
}

function lum(hex: string): number {
  const n = parseInt(hex.slice(1), 16)
  return 0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)
}

const FLOOR_Y2 = 140

/** Kontur tipis di sisi lebih terang pada tepi benda yang kontrasnya tinggi. */
function outlines(c: Canvas): void {
  const src = c.cells.slice()
  for (let y = 0; y < c.h - 1; y++) {
    for (let x = 0; x < c.w - 1; x++) {
      const i = y * c.w + x
      const a = src[i] as string
      const la = lum(a)
      const right = src[i + 1] as string
      const below = src[i + c.w] as string
      const lr = lum(right)
      const lb = lum(below)
      if ((x & 1) === 1 && Math.abs(la - lr) > 38 && la > lr) c.cells[i] = shade(a, -0.32)
      else if ((y & 1) === 1 && Math.abs(la - lb) > 38 && la > lb) c.cells[i] = shade(a, -0.32)
    }
  }
}

/** Tekstur halus: bintik pada dinding dan lantai, serat/ubin tambahan di lantai. */
function textures(c: Canvas, id: SceneArtId): void {
  const r = rng(7001 + id.length * 31 + id.charCodeAt(0))
  for (let y = 0; y < c.h; y++) {
    const floor = y >= FLOOR_Y2
    const p = floor ? 0.035 : 0.015
    for (let x = 0; x < c.w; x++) {
      const v = r()
      if (v < p) {
        const cur = c.cells[y * c.w + x] as string
        c.cells[y * c.w + x] = shade(cur, v < p / 2 ? 0.04 : -0.04)
      }
    }
  }
  // garis serat/sambungan lantai yang lebih halus
  for (let k = 0; k < 14; k++) {
    const y = FLOOR_Y2 + 4 + Math.floor(r() * 66)
    const x = Math.floor(r() * (c.w - 40))
    const len = 12 + Math.floor(r() * 26)
    for (let i = 0; i < len; i++) blendPx(c, x + i, y, '#000000', 0.12)
  }
  // pantulan lembut di sepanjang kaki dinding
  for (let j = 0; j < 4; j++) for (let x = 0; x < c.w; x++) blendPx(c, x, FLOOR_Y2 + 2 + j, '#ffffff', 0.05 - j * 0.01)
}

/** Sorotan diagonal pada kaca atau logam. */
function glint(c: Canvas, x: number, y: number, len: number, strength = 0.4): void {
  for (let i = 0; i < len; i++) {
    blendPx(c, x + i, y + len - i, '#ffffff', strength)
    blendPx(c, x + i + 1, y + len - i, '#ffffff', strength * 0.5)
  }
}

function cup(c: Canvas, x: number, y: number, col: string): void {
  rect(c, x, y, 7, 8, col)
  vline(c, x, y, 8, shade(col, -0.3))
  hline(c, x, y, 7, shade(col, 0.35))
  rect(c, x + 7, y + 2, 2, 4, shade(col, -0.2))
  px(c, x + 2, y - 2, '#e9f0f3')
  px(c, x + 3, y - 4, '#e9f0f3')
}

function books(c: Canvas, x: number, y: number, cols: readonly string[]): void {
  let ix = x
  cols.forEach((col, k) => {
    const h = 12 + ((k * 5) % 7)
    rect(c, ix, y - h, 5, h, col)
    vline(c, ix, y - h, h, shade(col, -0.3))
    hline(c, ix + 1, y - h + 3, 3, shade(col, 0.4))
    ix += 5
  })
}

function label(c: Canvas, x: number, y: number, w: number, col: string): void {
  rect(c, x, y, w, 4, '#f2efe6')
  hline(c, x, y, w, '#ffffff')
  for (let i = 1; i < w - 1; i += 3) px(c, x + i, y + 2, col)
}

function cable(c: Canvas, x0: number, y0: number, x1: number, y1: number, col: string): void {
  line(c, x0, y0, x1, y1, col)
  line(c, x0, y0 + 1, x1, y1 + 1, shade(col, -0.35))
}

type Extra = (c: Canvas, v: Variant) => void

const EXTRAS: Record<SceneArtId, Extra> = {
  'lab-umum': (c) => {
    glint(c, 120, 36, 28)
    glint(c, 176, 30, 36, 0.3)
    glint(c, 232, 34, 24, 0.35)
    cup(c, 226, 142, '#e5533d')
    books(c, 8, 62, ['#2d9dd0', '#e8c447', '#e5533d', '#59a67a'])
    label(c, 14, 94, 20, '#59636d')
    label(c, 14, 120, 20, '#59636d')
    box(c, 304, 148, 10, 4, '#f2efe6')
  },
  'cetak-3d': (c) => {
    glint(c, 20, 100, 16, 0.35)
    glint(c, 108, 100, 16, 0.35)
    cup(c, 276, 146, '#e8c447')
    for (let k = 0; k < 5; k++) label(c, 20 + k * 40, 100, 14, '#e5533d')
    cable(c, 40, 170, 130, 168, '#e8c447')
    cable(c, 190, 168, 250, 172, '#2d9dd0')
    rect(c, 300, 154, 10, 4, '#d98fa0')
    box(c, 316, 150, 8, 8, '#59a67a')
  },
  elektronik: (c) => {
    glint(c, 100, 120, 20, 0.35)
    glint(c, 100, 136, 24, 0.3)
    for (let i = 0; i < 10; i++) {
      px(c, 24 + i * 12, 22, '#31e3ff')
      px(c, 24 + i * 12, 24 + (i % 3) * 6, '#e5533d')
    }
    disc(c, 348, 124, 4, '#222831')
    disc(c, 348, 124, 1.5, '#5bf0a4')
    for (let i = 0; i < 6; i++) px(c, 220 + i * 3, 150, '#e8c447')
  },
  pemrograman: (c) => {
    for (let i = 0; i < 8; i++) {
      px(c, 270 + i * 6, 34 + (i % 3) * 8, '#7aa2f7')
      px(c, 272 + i * 6, 36 + (i % 3) * 8, '#bb9af7')
    }
    glint(c, 18, 70, 14, 0.3)
    glint(c, 48, 70, 14, 0.3)
    cup(c, 316, 144, '#2e5a8a')
    for (let i = 0; i < 12; i++) px(c, 120 + i * 4, 46 + (i % 2) * 2, '#5bf0a4')
  },
  las: (c) => {
    glint(c, 20, 90, 22, 0.35)
    glint(c, 56, 90, 24, 0.35)
    for (let i = 0; i < 12; i++) {
      px(c, 150 + Math.floor((i * 17) % 40), 140 + Math.floor((i * 11) % 30), '#ffd070')
    }
    rect(c, 318, 150, 16, 3, '#9fb0bb')
    hline(c, 318, 150, 16, '#e9f0f3')
    label(c, 346, 110, 12, '#c8352a')
  },
  gudang: (c) => {
    glint(c, 12, 60, 20, 0.25)
    for (let k = 0; k < 4; k++) label(c, 14 + k * 28, 100, 16, '#1d2127')
    for (let k = 0; k < 3; k++) label(c, 150 + k * 24, 100, 14, '#c8352a')
    books(c, 218, 90, ['#8a6d45', '#a67c52', '#6e4a2c'])
    rect(c, 280, 176, 12, 3, '#f2efe6')
    box(c, 204, 190, 6, 6, '#e8c447')
  },
  diskusi: (c) => {
    glint(c, 150, 28, 30, 0.35)
    glint(c, 212, 36, 22, 0.3)
    cup(c, 232, 148, '#f2f2f2')
    cup(c, 198, 150, '#e5533d')
    books(c, 292, 100, ['#e8c447', '#d9694b', '#4d8fc4', '#59a67a'])
    for (let k = 0; k < 6; k++) box(c, 24 + (k % 3) * 14, 28 + Math.floor(k / 3) * 14, 10, 10, ['#e8c447', '#e5a85a', '#8fd0a0'][k % 3] as string)
    box(c, 200, 154, 6, 4, '#4d8fc4')
  },
  istirahat: (c) => {
    glint(c, 210, 32, 26, 0.35)
    glint(c, 20, 40, 40, 0.28)
    cup(c, 336, 118, '#f2f2f2')
    cup(c, 354, 120, '#e8c447')
    box(c, 192, 182, 12, 6, '#f2f2f2')
    cup(c, 196, 168, '#e5533d')
    books(c, 232, 56, ['#e5533d', '#4d8fc4'])
    label(c, 86, 90, 20, '#c8352a')
  },
  'ruang-bk': (c) => {
    glint(c, 26, 28, 30, 0.35)
    glint(c, 56, 28, 22, 0.28)
    books(c, 280, 70, ['#8a3e2e', '#2e5a8a', '#59a67a', '#e8c447', '#8a6bb8'])
    books(c, 280, 108, ['#c9854a', '#4d8fc4', '#e5533d'])
    cup(c, 174, 168, '#f2f2f2')
    box(c, 196, 168, 10, 4, '#e8c447')
    px(c, 182, 164, '#f2f2f2')
  },
  'ruang-dosen': (c) => {
    glint(c, 260, 22, 36, 0.3)
    glint(c, 310, 26, 24, 0.25)
    books(c, 12, 60, ['#8a3e2e', '#2e5a8a', '#c9854a', '#59a67a', '#e8c447'])
    books(c, 12, 100, ['#2a3a52', '#8a6bb8', '#e5533d', '#4d8fc4'])
    books(c, 12, 140, ['#c9854a', '#2e5a8a', '#8a3e2e'])
    cup(c, 240, 112, '#f2f2f2')
    label(c, 322, 92, 12, '#f2efe6')
    label(c, 322, 110, 12, '#f2efe6')
    label(c, 322, 128, 12, '#f2efe6')
  },
  'studio-desain': (c) => {
    glint(c, 140, 28, 28, 0.35)
    glint(c, 58, 116, 20, 0.3)
    cup(c, 314, 146, '#a869c9')
    books(c, 280, 96, ['#e56256', '#f5be42', '#3aa08e', '#5b72d6'])
    box(c, 218, 148, 12, 5, '#ffe694')
  },
  'pojok-baca': (c) => {
    glint(c, 146, 26, 28, 0.34)
    books(c, 18, 66, ['#8a3e2e', '#2e5a8a', '#59a67a', '#e8c447', '#8a6bb8'])
    books(c, 276, 66, ['#c9854a', '#4d8fc4', '#e5533d', '#3aa08e'])
    cup(c, 232, 146, '#f2f2f2')
    box(c, 204, 148, 14, 4, '#fff8e1')
  },
}

/** Tambah kontur, tekstur, sorotan, dan benda kecil pada kisi 384×216. */
export function paintSceneDetail(id: SceneArtId, variant: Variant, c: Canvas): void {
  outlines(c)
  textures(c, id)
  EXTRAS[id](c, variant)
  // sorotan/bayangan lembut agar benda kecil menempel pada permukaan
  shadowRect(c, 0, FLOOR_Y2, c.w, 3, 0.18)
  // pastikan sel tetap valid
  for (let i = 0; i < c.cells.length; i++) {
    const cell = c.cells[i]
    if (!cell || !/^#[0-9a-f]{6}$/.test(cell)) c.cells[i] = getPx(c, 0, 0)
  }
}
