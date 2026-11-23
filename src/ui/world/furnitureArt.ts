import type { LabFurniture } from '../../types'
import type { PixelGrid } from '../characters/pixelGrid'

export type FurnitureKind = LabFurniture['kind']

export interface FurnitureSprite {
  /** Ukuran rect.w*14 × (rect.h*14 + extraHeight) piksel seni. */
  grid: PixelGrid
  /** Baris dasar (untuk y-sort) dalam piksel seni, dihitung dari atas grid. */
  anchorY: number
  /** Tinggi di atas petak (rak, bilik, monitor), dalam piksel seni. */
  extraHeight: number
}

export const FURNITURE_ART_TILE = 14

/** Posisi LED printer pada sprite printer (piksel seni); warnanya digambar dinamis oleh renderer. */
export const PRINTER_LED_RECT = { x: 10, y: 18, w: 2, h: 2 } as const

const LED_GREEN = '#16a34a'
const LED_BLUE = '#0284c7'
const LED_ORANGE = '#d97706'
const LED_GRAY = '#64748b'

/** Nomor unit printer dari id perabot (sama dengan aturan labRenderer lama). */
export function printerUnitIndex(id: string): number {
  return Number(id.replace(/\D/g, '')) || 1
}

/** Aturan warna LED printer yang sama dengan labRenderer lama. */
export function printerLedColor(clockMinutesOfDay: number, unitIndex: number): string {
  const activePhase = (Math.floor(clockMinutesOfDay / 15) + unitIndex) % 4
  return activePhase === 0 ? LED_GREEN : activePhase === 1 ? LED_BLUE : activePhase === 2 ? LED_ORANGE : LED_GRAY
}

// ---------------------------------------------------------------- pelukis dasar

const OUT = '#2b2433'
const SHADOW = '#3d3342'

function hexToRgb(hex: string): [number, number, number] {
  return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)]
}

function toHex(r: number, g: number, b: number): string {
  const h = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0')
  return `#${h(r)}${h(g)}${h(b)}`
}

/** f > 0 mencerahkan ke putih, f < 0 menggelapkan ke hitam. */
function shade(hex: string, f: number): string {
  const [r, g, b] = hexToRgb(hex)
  const t = f >= 0 ? 255 : 0
  const a = Math.abs(f)
  return toHex(r + (t - r) * a, g + (t - g) * a, b + (t - b) * a)
}

interface BoxStyle {
  top: string
  front: string
  topH: number
  out?: string
  round?: boolean
}

class Cv {
  readonly cells: (string | null)[]
  constructor(
    readonly w: number,
    readonly h: number,
  ) {
    this.cells = new Array(w * h).fill(null)
  }

  px(x: number, y: number, c: string): void {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return
    this.cells[y * this.w + x] = c
  }

  rect(x: number, y: number, w: number, h: number, c: string): void {
    for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) this.px(xx, yy, c)
  }

  /** Kotak 3/4: kontur gelap, sisi atas terang, sisi depan lebih gelap, garis sorot dan garis dasar. */
  box(x: number, y: number, w: number, h: number, s: BoxStyle): void {
    const out = s.out ?? OUT
    this.rect(x, y, w, h, out)
    if (w < 3 || h < 3) return
    const topH = Math.max(1, Math.min(s.topH, h - 3))
    this.rect(x + 1, y + 1, w - 2, topH, s.top)
    this.rect(x + 1, y + 1 + topH, w - 2, h - 2 - topH, s.front)
    this.rect(x + 1, y + 1, w - 2, 1, shade(s.top, 0.35)) // sorot tepi atas
    this.rect(x + 1, y + 1 + topH, w - 2, 1, shade(s.front, 0.12)) // bibir sisi depan
    if (h - 2 - topH > 2) this.rect(x + 1, y + h - 2, w - 2, 1, shade(s.front, -0.25)) // bayangan sisi depan
    if (s.round) {
      for (const [cx, cy] of [
        [x, y],
        [x + w - 1, y],
        [x, y + h - 1],
        [x + w - 1, y + h - 1],
      ] as const) {
        this.cells[cy * this.w + cx] = null
      }
    }
  }

  /** Bayangan kontak di baris terakhir tapak. */
  shadow(x0: number, x1: number): void {
    const y = this.h - 1
    for (let x = x0; x <= x1; x++) if (!this.cells[y * this.w + x]) this.px(x, y, SHADOW)
  }

  grid(): PixelGrid {
    return { width: this.w, height: this.h, cells: this.cells }
  }
}

function make(w: number, h: number, extra: number): { c: Cv; W: number; H: number; y0: number } {
  const W = w * FURNITURE_ART_TILE
  const H = h * FURNITURE_ART_TILE + extra
  return { c: new Cv(W, H), W, H, y0: extra }
}

function sprite(c: Cv, extra: number): FurnitureSprite {
  return { grid: c.grid(), anchorY: c.h, extraHeight: extra }
}

/** Acak deterministik kecil untuk isi rak. */
function lcg(seed: number): () => number {
  let s = seed >>> 0 || 1
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0
    return s / 4294967296
  }
}

// ---------------------------------------------------------------- perabot

function paintPrinter(w: number, h: number): FurnitureSprite {
  const extra = 10
  const { c, W } = make(w, h, extra)
  c.shadow(1, W - 2)
  // rangka tegak
  c.rect(1, 6, 12, 9, OUT)
  c.rect(2, 7, 2, 8, '#c9d1dd')
  c.rect(10, 7, 2, 8, '#a9b3c2')
  c.rect(4, 7, 6, 7, '#1f2735') // rongga cetak
  c.rect(4, 7, 6, 1, '#2d384b')
  // benda cetak
  c.rect(5, 11, 4, 4, OUT)
  c.rect(6, 12, 2, 2, '#f2a03d')
  c.px(6, 12, '#ffd08a')
  // pelari dan nosel
  c.rect(6, 7, 3, 3, '#9aa6b8')
  c.rect(6, 9, 3, 1, '#6b7587')
  c.px(7, 10, '#f2a03d')
  // gantri atas
  c.box(1, 3, 12, 4, { top: '#6f7b8f', front: '#3b4454', topH: 2 })
  // gulungan filamen
  c.rect(8, 0, 5, 4, OUT)
  c.rect(9, 1, 3, 2, '#f08a3c')
  c.px(10, 1, '#ffc58a')
  c.px(10, 2, OUT)
  // alas
  c.box(1, 14, 12, 8, { top: '#d7dde6', front: '#8d99ab', topH: 3 })
  c.rect(5, 12, 4, 3, OUT)
  c.rect(6, 12, 2, 2, '#f2a03d')
  c.px(6, 12, '#ffd08a')
  // layar dan soket LED
  c.rect(3, 18, 5, 2, '#1e3a5f')
  c.px(4, 18, '#5fd0ff')
  c.px(5, 19, '#3d7fb5')
  c.rect(PRINTER_LED_RECT.x, PRINTER_LED_RECT.y, PRINTER_LED_RECT.w, PRINTER_LED_RECT.h, LED_GRAY)
  return sprite(c, extra)
}

function paintDeskPc(w: number, h: number): FurnitureSprite {
  const extra = 10
  const { c, W, y0 } = make(w, h, extra)
  c.shadow(1, W - 2)
  c.box(0, y0 + 1, W, 12, { top: '#e0c293', front: '#9a6a38', topH: 7 })
  // laci dan kaki di sisi depan
  for (let x = 14; x < W; x += 14) c.rect(x - 1, y0 + 9, 1, 3, shade('#9a6a38', -0.35))
  for (let i = 0; i < w; i++) {
    const x = i * 14
    // monitor
    c.rect(x + 2, y0 - 8, 10, 9, OUT)
    c.rect(x + 3, y0 - 7, 8, 6, '#2f7fd0')
    c.rect(x + 3, y0 - 7, 8, 1, '#63a9f0')
    c.rect(x + 4, y0 - 5, 4, 1, '#bfe0ff')
    c.rect(x + 4, y0 - 3, 5, 1, '#7ec0f5')
    c.px(x + 10, y0 - 2, '#9fd0ff')
    c.rect(x + 3, y0 - 1, 8, 1, '#4a5568')
    c.rect(x + 6, y0 + 1, 2, 2, '#4a5568')
    // papan ketik dan tetikus
    c.rect(x + 3, y0 + 5, 8, 2, '#8e99a9')
    c.rect(x + 3, y0 + 5, 8, 1, '#c3ccd8')
    c.px(x + 12, y0 + 6, '#c3ccd8')
  }
  return sprite(c, extra)
}

function paintWeldingBooth(w: number, h: number): FurnitureSprite {
  const extra = 14
  const { c, W, H } = make(w, h, extra)
  c.shadow(1, W - 2)
  // dinding belakang logam
  c.box(1, 3, W - 2, 24, { top: '#cfd5de', front: '#8a93a3', topH: 3, round: true })
  // jendela kaca gelap
  c.rect(5, 11, 9, 7, OUT)
  c.rect(6, 12, 7, 5, '#2d5a63')
  c.px(7, 12, '#5fa0a8')
  c.px(8, 13, '#4a8a92')
  // ventilasi
  c.rect(17, 10, 8, 9, OUT)
  for (let y = 11; y < 18; y += 2) c.rect(18, y, 6, 1, '#5b6472')
  // meja kerja
  c.box(3, 25, W - 6, 10, { top: '#7c8592', front: '#454c58', topH: 5 })
  // mesin las dan pelat
  c.rect(5, 20, 7, 6, OUT)
  c.rect(6, 21, 5, 4, '#c0392b')
  c.rect(6, 21, 5, 1, '#e86a5c')
  c.px(9, 23, '#f2c200')
  c.rect(15, 27, 7, 2, '#b8c0cc')
  c.px(21, 26, '#fff7a8')
  c.px(22, 25, '#f2c200')
  // tirai las kiri dan kanan
  for (const x0 of [1, W - 9]) {
    c.rect(x0, 6, 8, 30, OUT)
    for (let x = 0; x < 6; x++) c.rect(x0 + 1 + x, 7, 1, 27, x % 2 === 0 ? '#e0a52f' : '#c4861a')
    c.rect(x0 + 1, 7, 6, 1, '#f3c767')
    for (let x = 0; x < 6; x++) c.px(x0 + 1 + x, 34 + (x % 2), x % 2 === 0 ? '#e0a52f' : '#c4861a')
  }
  c.rect(0, 5, W, 2, OUT) // batang tirai
  c.rect(1, 5, W - 2, 1, '#7c8592')
  // garis K3 di depan
  c.rect(1, H - 6, W - 2, 4, OUT)
  for (let x = 1; x < W - 1; x++) {
    for (let y = H - 5; y < H - 3; y++) c.px(x, y, ((x + y) >> 1) % 2 === 0 ? '#f2c200' : OUT)
  }
  return sprite(c, extra)
}

const K3_K = ['X..X', 'X.X.', 'XX..', 'X.X.', 'X..X']
const K3_3 = ['XXX', '..X', '.XX', '..X', 'XXX']

function paintK3Marker(w: number, h: number): FurnitureSprite {
  const { c, W, H } = make(w, h, 0)
  c.rect(1, 2, W - 2, H - 4, OUT)
  for (let y = 3; y < H - 3; y++) {
    for (let x = 2; x < W - 2; x++) c.px(x, y, ((x + y) >> 2) % 2 === 0 ? '#f2c200' : '#3a3340')
  }
  const px0 = Math.floor(W / 2) - 7
  c.rect(px0, 2, 14, H - 4, OUT)
  c.rect(px0 + 1, 3, 12, H - 6, '#fdfdfd')
  const ly = 3 + Math.floor((H - 6 - 5) / 2)
  K3_K.forEach((row, ry) => [...row].forEach((ch, rx) => ch === 'X' && c.px(px0 + 2 + rx, ly + ry, OUT)))
  K3_3.forEach((row, ry) => [...row].forEach((ch, rx) => ch === 'X' && c.px(px0 + 8 + rx, ly + ry, OUT)))
  return sprite(c, 0)
}

function paintElectronicsDesk(w: number, h: number): FurnitureSprite {
  const extra = 10
  const { c, W, y0 } = make(w, h, extra)
  c.shadow(1, W - 2)
  c.box(0, y0 + 1, W, 12, { top: '#cfe8dc', front: '#6e9f89', topH: 7 })
  for (let x = 14; x < W; x += 14) c.rect(x - 1, y0 + 9, 1, 3, shade('#6e9f89', -0.35))
  // osiloskop
  c.box(2, 1, 14, 12, { top: '#aab4c0', front: '#4b5563', topH: 2 })
  c.rect(4, 4, 8, 6, '#0b2a1d')
  const wave = [8, 7, 6, 7, 8, 9, 8, 7]
  wave.forEach((wy, i) => c.px(4 + i, wy - 1 + 1, '#4ade80'))
  c.px(13, 5, '#d1d5db')
  c.px(13, 8, '#d1d5db')
  c.px(14, 6, '#f87171')
  // papan sirkuit
  c.rect(19, y0 + 3, 10, 7, OUT)
  c.rect(20, y0 + 4, 8, 5, '#2f9e5b')
  c.rect(20, y0 + 4, 8, 1, '#5cc487')
  c.rect(22, y0 + 5, 3, 2, '#1f2937')
  c.px(21, y0 + 8, '#facc15')
  c.px(26, y0 + 8, '#facc15')
  c.px(27, y0 + 5, '#ef4444')
  // stasiun solder
  c.box(32, y0 + 2, 6, 7, { top: '#e6e9ee', front: '#8d99ab', topH: 2 })
  c.px(34, y0 + 6, '#ef4444')
  c.rect(36, y0 - 4, 1, 6, '#9aa6b8')
  c.px(36, y0 - 5, '#f2a03d')
  c.px(37, y0 - 7, '#d1d5db')
  // multimeter
  if (W >= 42) {
    c.rect(39, y0 + 2, 3, 7, OUT)
    c.rect(40, y0 + 3, 1, 2, '#9de3a2')
    c.rect(40, y0 + 6, 1, 2, '#f2c200')
  }
  return sprite(c, extra)
}

const CHAIR_COLORS = ['#3b8ea5', '#e07a5f', '#6a994e', '#8d6cb5']

function paintDiscussionTable(w: number, h: number): FurnitureSprite {
  const extra = 8
  const { c, W, H, y0 } = make(w, h, extra)
  c.shadow(2, W - 3)
  const n = Math.max(2, Math.floor(W / 21))
  const chairX = (i: number) => Math.round(((i + 0.5) * W) / n - 6)
  // kursi utara (hanya sandaran terlihat)
  for (let i = 0; i < n; i++) {
    const col = CHAIR_COLORS[i % CHAIR_COLORS.length]
    c.box(chairX(i), 2, 12, 11, { top: shade(col, 0.2), front: col, topH: 3, round: true })
  }
  // kursi selatan (dudukan terlihat, sandaran di bawah)
  for (let i = 0; i < n; i++) {
    const col = CHAIR_COLORS[(i + 2) % CHAIR_COLORS.length]
    const x = chairX(i)
    c.rect(x, H - 9, 12, 8, OUT)
    c.rect(x + 1, H - 8, 10, 4, shade(col, 0.25))
    c.rect(x + 1, H - 4, 10, 2, shade(col, -0.15))
    c.rect(x + 1, H - 8, 10, 1, shade(col, 0.5))
    c.px(x, H - 1, OUT)
    c.px(x + 11, H - 1, OUT)
  }
  c.box(2, y0 + 3, W - 4, 20, { top: '#e4bd7e', front: '#a9752f', topH: 16 })
  // serat kayu
  for (let x = 8; x < W - 10; x += 11) c.rect(x, y0 + 8, 5, 1, '#d4a862')
  for (let x = 14; x < W - 10; x += 13) c.rect(x, y0 + 14, 4, 1, '#d4a862')
  // laptop
  c.rect(10, y0 + 6, 9, 6, OUT)
  c.rect(11, y0 + 7, 7, 4, '#3a8bd8')
  c.rect(11, y0 + 7, 7, 1, '#7cc0f5')
  c.rect(9, y0 + 12, 11, 3, OUT)
  c.rect(10, y0 + 12, 9, 2, '#aeb7c4')
  // kertas
  c.rect(34, y0 + 7, 8, 6, OUT)
  c.rect(35, y0 + 8, 6, 4, '#fdfdfd')
  c.rect(36, y0 + 9, 4, 1, '#94a3b8')
  c.rect(44, y0 + 12, 7, 5, OUT)
  c.rect(45, y0 + 13, 5, 3, '#fdf0c8')
  // cangkir
  c.rect(58, y0 + 8, 4, 4, OUT)
  c.rect(59, y0 + 9, 2, 2, '#f8fafc')
  c.px(62, y0 + 10, OUT)
  c.rect(66, y0 + 14, 4, 4, OUT)
  c.rect(67, y0 + 15, 2, 2, '#e07a5f')
  return sprite(c, extra)
}

function paintShelf(w: number, h: number, theme: 'gudang' | 'buku'): FurnitureSprite {
  const extra = h > w ? 8 : 12
  const { c, W, H } = make(w, h, extra)
  const frame = theme === 'gudang' ? '#7d8ea3' : '#a56a3a'
  const cavity = theme === 'gudang' ? '#363a48' : '#4a2f1c'
  const boardTop = theme === 'gudang' ? '#b9c4d2' : '#c98b52'
  const rnd = lcg(W * 131 + H * 17 + (theme === 'gudang' ? 1 : 2))
  c.shadow(1, W - 2)
  c.box(0, 0, W, H - 1, { top: shade(frame, 0.3), front: cavity, topH: 2 })
  // tiang rangka
  for (let x = 0; x < W; x += 14) {
    const px = x === 0 ? 1 : x - 1
    c.rect(px, 3, 2, H - 8, frame)
    c.rect(px, 3, 1, H - 8, shade(frame, 0.25))
  }
  c.rect(W - 3, 3, 2, H - 8, frame)
  c.rect(W - 3, 3, 1, H - 8, shade(frame, 0.25))
  // lemari bawah
  c.rect(1, H - 5, W - 2, 4, theme === 'gudang' ? '#5f6b7c' : '#7a4d28')
  c.rect(1, H - 5, W - 2, 1, shade(theme === 'gudang' ? '#5f6b7c' : '#7a4d28', 0.3))
  for (let x = 14; x < W - 2; x += 14) c.rect(x, H - 4, 1, 3, OUT)
  c.px(6, H - 3, '#e8d28a')
  const yt = 3
  const yb = H - 6
  const levels = Math.max(1, Math.round((yb - yt) / 9))
  const sp = Math.floor((yb - yt) / levels)
  for (let k = 0; k < levels; k++) {
    const by = yt + sp * (k + 1) - 1
    c.rect(1, by, W - 2, 1, boardTop)
    c.rect(1, by + 1, W - 2, 1, shade(boardTop, -0.35))
    let x = 3
    while (x < W - 4) {
      if (theme === 'buku') {
        const bw = 2 + Math.floor(rnd() * 2)
        const bh = Math.min(sp - 3, 4 + Math.floor(rnd() * 3))
        const col = ['#c0392b', '#2f6db5', '#2f9e5b', '#e0a52f', '#7a4aa8', '#e8e0cf'][Math.floor(rnd() * 6)]
        if (x + bw > W - 3) break
        c.rect(x, by - bh, bw, bh, col)
        c.rect(x, by - bh, bw, 1, shade(col, 0.35))
        x += bw
        if (rnd() < 0.15) x += 1
      } else {
        const bw = 5 + Math.floor(rnd() * 3)
        const bh = Math.min(sp - 3, 4 + Math.floor(rnd() * 3))
        const col = ['#c58b4f', '#3a8bd8', '#8d99ab', '#e07a5f', '#6a994e'][Math.floor(rnd() * 5)]
        if (x + bw > W - 4) break
        c.rect(x, by - bh, bw, bh, OUT)
        c.rect(x + 1, by - bh + 1, bw - 2, bh - 1, col)
        c.rect(x + 1, by - bh + 1, bw - 2, 1, shade(col, 0.35))
        x += bw + 1
      }
    }
  }
  return sprite(c, extra)
}

const SOFA = { base: '#3f8f8a', light: '#5cb3ad', dark: '#2c6b68' }

function paintSofa(w: number, h: number): FurnitureSprite {
  if (h > w) {
    // sofa tegak: sandaran di barat, lengan di utara dan selatan
    const { c, W, H } = make(w, h, 0)
    c.shadow(1, W - 2)
    c.box(0, 1, 5, H - 3, { top: SOFA.light, front: SOFA.dark, topH: 2, round: true })
    const n = Math.max(1, Math.floor((H - 12) / 8))
    const ch = Math.floor((H - 14) / n)
    for (let i = 0; i < n; i++) c.box(4, 6 + i * ch, 9, ch + 1, { top: SOFA.light, front: SOFA.base, topH: ch - 2 })
    c.box(0, 1, W - 1, 5, { top: SOFA.light, front: SOFA.base, topH: 3, round: true })
    c.box(0, H - 8, W - 1, 6, { top: SOFA.light, front: SOFA.base, topH: 3, round: true })
    return sprite(c, 0)
  }
  const extra = 6
  const { c, W, H, y0 } = make(w, h, extra)
  c.shadow(1, W - 2)
  // sandaran
  c.box(0, 1, W, 11, { top: SOFA.light, front: SOFA.dark, topH: 3, round: true })
  const n = Math.max(2, Math.floor((W - 12) / 16))
  const cw = Math.floor((W - 12) / n)
  for (let i = 1; i < n; i++) c.rect(6 + i * cw, 5, 1, 6, shade(SOFA.dark, -0.3))
  // dudukan
  for (let i = 0; i < n; i++) c.box(6 + i * cw, y0 + 2, cw + 1, 9, { top: SOFA.light, front: SOFA.base, topH: 5 })
  // lengan
  for (const x of [0, W - 7]) c.box(x, y0 - 2, 7, 13, { top: SOFA.light, front: SOFA.base, topH: 6, round: true })
  // alas dan kaki
  c.rect(1, H - 3, W - 2, 1, OUT)
  c.px(2, H - 2, OUT)
  c.px(W - 3, H - 2, OUT)
  return sprite(c, extra)
}

function paintCoffeeTable(w: number, h: number): FurnitureSprite {
  const { c, W, H } = make(w, h, 0)
  c.shadow(2, W - 3)
  c.rect(2, H - 3, 2, 2, OUT)
  c.rect(W - 4, H - 3, 2, 2, OUT)
  c.box(1, 2, W - 2, 10, { top: '#ead7b7', front: '#9a6b3b', topH: 6, round: true })
  // cangkir kopi
  c.rect(5, 4, 4, 4, OUT)
  c.rect(6, 5, 2, 2, '#e8e8f0')
  c.px(6, 5, '#7a4a2a')
  c.px(9, 6, OUT)
  // majalah
  c.rect(14, 4, 8, 5, OUT)
  c.rect(15, 5, 6, 3, '#e05252')
  c.rect(15, 5, 6, 1, '#f08a8a')
  c.rect(16, 7, 3, 1, '#fdf0c8')
  return sprite(c, 0)
}

function paintDispenser(w: number, h: number): FurnitureSprite {
  const extra = 10
  const { c, W } = make(w, h, extra)
  c.shadow(2, W - 3)
  // galon
  c.box(4, 0, 6, 9, { top: '#bfe6fa', front: '#78c4ee', topH: 2, round: true })
  c.rect(5, 2, 1, 5, '#e6f6ff')
  // badan
  c.box(3, 8, 8, 15, { top: '#f6f8fb', front: '#dfe6ee', topH: 3 })
  c.rect(5, 13, 2, 2, '#e0463d')
  c.rect(8, 13, 2, 2, '#2f83d8')
  c.rect(4, 18, 6, 2, '#6b7686')
  c.rect(4, 18, 6, 1, '#9aa6b8')
  c.px(7, 17, '#2f83d8')
  return sprite(c, extra)
}

function paintConsultationDesk(w: number, h: number): FurnitureSprite {
  const extra = 8
  const { c, W, y0 } = make(w, h, extra)
  c.shadow(2, W - 3)
  // dua kursi di belakang meja
  c.box(3, 1, 9, 10, { top: '#2f9a90', front: '#0f766e', topH: 3, round: true })
  c.box(16, 1, 9, 10, { top: '#3b84a8', front: '#1d5d7a', topH: 3, round: true })
  c.box(1, y0 + 1, W - 2, 12, { top: '#efe3d2', front: '#8a6f55', topH: 7 })
  // buku catatan
  c.rect(4, y0 + 3, 7, 5, OUT)
  c.rect(5, y0 + 4, 5, 3, '#ffffff')
  c.rect(6, y0 + 5, 3, 1, '#94a3b8')
  // kotak tisu
  c.rect(14, y0 + 4, 5, 4, OUT)
  c.rect(15, y0 + 5, 3, 2, '#7cc4e8')
  c.px(16, y0 + 4, '#ffffff')
  // tanaman kecil
  c.rect(22, y0 + 6, 4, 3, OUT)
  c.rect(23, y0 + 7, 2, 1, '#b4573a')
  c.rect(22, y0 + 2, 4, 4, '#3f9a4f')
  c.px(23, y0 + 2, '#7ad98a')
  return sprite(c, extra)
}

function paintLecturerDesk(w: number, h: number): FurnitureSprite {
  const extra = 10
  const { c, W, y0 } = make(w, h, extra)
  c.shadow(1, W - 2)
  // kursi
  c.box(22, 1, 13, 11, { top: '#6b5a8a', front: '#4a3a5c', topH: 3, round: true })
  c.box(0, y0 + 1, W, 12, { top: '#d9c7a1', front: '#8f6a3f', topH: 7 })
  for (let x = 14; x < W; x += 14) c.rect(x - 1, y0 + 9, 1, 3, shade('#8f6a3f', -0.35))
  // monitor
  c.rect(4, y0 - 7, 13, 9, OUT)
  c.rect(5, y0 - 6, 11, 6, '#2f7fd0')
  c.rect(5, y0 - 6, 11, 1, '#63a9f0')
  c.rect(6, y0 - 4, 5, 1, '#bfe0ff')
  c.rect(6, y0 - 2, 7, 1, '#7ec0f5')
  c.rect(9, y0 + 2, 4, 1, '#4a5568')
  // papan ketik
  c.rect(6, y0 + 5, 9, 2, '#8e99a9')
  c.rect(6, y0 + 5, 9, 1, '#c3ccd8')
  // lampu meja
  c.rect(37, y0 + 4, 4, 2, OUT)
  c.rect(38, y0 - 2, 1, 6, '#9aa6b8')
  c.rect(35, y0 - 4, 5, 2, '#f2c200')
  c.px(35, y0 - 3, '#fff7a8')
  // tumpukan kertas dan papan nama
  c.rect(25, y0 + 3, 7, 4, OUT)
  c.rect(26, y0 + 4, 5, 2, '#fdfdfd')
  c.rect(20, y0 + 8, 6, 2, '#e0b64a')
  c.px(20, y0 + 8, '#fff0a8')
  return sprite(c, extra)
}

function paintDesignDesk(w: number, h: number): FurnitureSprite {
  const extra = 10
  const { c, W, y0 } = make(w, h, extra)
  c.shadow(1, W - 2)
  c.box(0, y0 + 1, W, 12, { top: '#efe2f7', front: '#7c6499', topH: 7 })
  for (let x = 14; x < W; x += 14) c.rect(x - 1, y0 + 9, 1, 3, shade('#7c6499', -0.35))
  for (let i = 0; i < w; i++) {
    const x = i * 14
    // Monitor kalibrasi warna dengan palet cerah
    c.rect(x + 2, y0 - 8, 10, 9, OUT)
    c.rect(x + 3, y0 - 7, 8, 6, '#fdfbf7')
    c.rect(x + 4, y0 - 6, 3, 2, '#e56256')
    c.rect(x + 7, y0 - 6, 3, 2, '#f5be42')
    c.rect(x + 4, y0 - 4, 6, 2, '#35a08d')
    c.rect(x + 3, y0 - 1, 8, 1, '#4a3f66')
    c.rect(x + 6, y0 + 1, 2, 2, '#4a3f66')
    // Pen-display tablet gambar & stylus
    c.rect(x + 3, y0 + 4, 8, 4, OUT)
    c.rect(x + 4, y0 + 5, 6, 2, '#2d2842')
    c.px(x + 6, y0 + 5, '#ffd875')
    c.px(x + 12, y0 + 5, '#e56256')
  }
  return sprite(c, extra)
}

function paintReadingTable(w: number, h: number): FurnitureSprite {
  const extra = 8
  const { c, W, H, y0 } = make(w, h, extra)
  c.shadow(2, W - 3)
  const n = Math.max(2, Math.floor(W / 24))
  const chairX = (i: number) => Math.round(((i + 0.5) * W) / n - 6)
  for (let i = 0; i < n; i++) {
    c.box(chairX(i), 2, 12, 10, { top: '#589e82', front: '#356b56', topH: 3, round: true })
  }
  for (let i = 0; i < n; i++) {
    const x = chairX(i)
    c.rect(x, H - 8, 12, 7, OUT)
    c.rect(x + 1, H - 7, 10, 4, '#589e82')
    c.rect(x + 1, H - 3, 10, 1, '#356b56')
  }
  c.box(2, y0 + 3, W - 4, 20, { top: '#c9975b', front: '#7c5328', topH: 15 })
  // Lampu meja pustaka klasik hijau-kuningan
  c.rect(Math.floor(W / 2) - 4, y0 + 5, 8, 4, OUT)
  c.rect(Math.floor(W / 2) - 3, y0 + 6, 6, 2, '#2e8274')
  c.rect(Math.floor(W / 2) - 2, y0 + 9, 4, 2, '#f5be42')
  // Buku terbuka kiri & kanan
  c.rect(8, y0 + 10, 10, 6, OUT)
  c.rect(9, y0 + 11, 4, 4, '#fffdf6')
  c.rect(13, y0 + 11, 4, 4, '#f7ebd2')
  if (W >= 42) {
    c.rect(W - 19, y0 + 10, 10, 6, OUT)
    c.rect(W - 18, y0 + 11, 4, 4, '#fffdf6')
    c.rect(W - 14, y0 + 11, 4, 4, '#f7ebd2')
  }
  return sprite(c, extra)
}

export const FURNITURE_PAINTERS: Readonly<Record<FurnitureKind, (w: number, h: number) => FurnitureSprite>> = {
  'printer-3d': paintPrinter,
  'meja-komputer': paintDeskPc,
  'bilik-las': paintWeldingBooth,
  'meja-elektronik': paintElectronicsDesk,
  'meja-diskusi': paintDiscussionTable,
  'rak-gudang': (w, h) => paintShelf(w, h, 'gudang'),
  sofa: paintSofa,
  'meja-kopi': paintCoffeeTable,
  dispenser: paintDispenser,
  'meja-konsultasi': paintConsultationDesk,
  'meja-dosen': paintLecturerDesk,
  'rak-buku': (w, h) => paintShelf(w, h, 'buku'),
  'penanda-k3': paintK3Marker,
  'meja-desain': paintDesignDesk,
  'meja-baca': paintReadingTable,
}

/** Menggambar perabot; deterministik. Lebar grid = rect.w × 14. */
export function paintFurniture(item: LabFurniture): FurnitureSprite {
  return FURNITURE_PAINTERS[item.kind](item.rect.w, item.rect.h)
}

/** Y dasar perabot (piksel dunia) untuk pengurutan kedalaman. */
export function furnitureBaseY(item: LabFurniture, tileSizePx: number): number {
  return (item.rect.y + item.rect.h) * tileSizePx
}
