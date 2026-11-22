/**
 * Prop pixel art untuk latar adegan 192×108. Semua fungsi murni terhadap
 * `Canvas` yang dapat diubah (bukan DOM), sehingga dapat diuji di Node.
 */
import type { PixelGrid } from '../characters/pixelGrid'

export interface Canvas {
  readonly w: number
  readonly h: number
  readonly cells: string[]
}

// ---------------------------------------------------------------- warna
const rgbCache = new Map<string, [number, number, number]>()
function rgb(hex: string): [number, number, number] {
  let v = rgbCache.get(hex)
  if (!v) {
    v = [
      parseInt(hex.slice(1, 3), 16),
      parseInt(hex.slice(3, 5), 16),
      parseInt(hex.slice(5, 7), 16),
    ]
    rgbCache.set(hex, v)
  }
  return v
}
function hx(n: number): string {
  const v = Math.max(0, Math.min(255, Math.round(n)))
  return v.toString(16).padStart(2, '0')
}
export function mix(a: string, b: string, t: number): string {
  const p = rgb(a)
  const q = rgb(b)
  return `#${hx(p[0] + (q[0] - p[0]) * t)}${hx(p[1] + (q[1] - p[1]) * t)}${hx(p[2] + (q[2] - p[2]) * t)}`
}
/** t<0 menggelapkan, t>0 mencerahkan. */
export function shade(c: string, t: number): string {
  return t < 0 ? mix(c, '#0b0f1a', -t) : mix(c, '#ffffff', t)
}

/** PRNG kecil deterministik. */
export function rng(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// ------------------------------------------------------------ primitif
export function createCanvas(w: number, h: number, fill: string): Canvas {
  return { w, h, cells: new Array<string>(w * h).fill(fill) }
}
export function px(c: Canvas, x: number, y: number, col: string): void {
  x = Math.floor(x)
  y = Math.floor(y)
  if (x < 0 || y < 0 || x >= c.w || y >= c.h) return
  c.cells[y * c.w + x] = col
}
export function getPx(c: Canvas, x: number, y: number): string {
  x = Math.max(0, Math.min(c.w - 1, Math.floor(x)))
  y = Math.max(0, Math.min(c.h - 1, Math.floor(y)))
  return c.cells[y * c.w + x] as string
}
export function blendPx(c: Canvas, x: number, y: number, col: string, t: number): void {
  x = Math.floor(x)
  y = Math.floor(y)
  if (x < 0 || y < 0 || x >= c.w || y >= c.h) return
  const i = y * c.w + x
  c.cells[i] = mix(c.cells[i] as string, col, t)
}
export function rect(c: Canvas, x: number, y: number, w: number, h: number, col: string): void {
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) px(c, x + i, y + j, col)
}
export function hline(c: Canvas, x: number, y: number, w: number, col: string): void {
  rect(c, x, y, w, 1, col)
}
export function vline(c: Canvas, x: number, y: number, h: number, col: string): void {
  rect(c, x, y, 1, h, col)
}
export function line(c: Canvas, x0: number, y0: number, x1: number, y1: number, col: string): void {
  x0 = Math.round(x0)
  y0 = Math.round(y0)
  x1 = Math.round(x1)
  y1 = Math.round(y1)
  const dx = Math.abs(x1 - x0)
  const dy = -Math.abs(y1 - y0)
  const sx = x0 < x1 ? 1 : -1
  const sy = y0 < y1 ? 1 : -1
  let err = dx + dy
  for (;;) {
    px(c, x0, y0, col)
    if (x0 === x1 && y0 === y1) break
    const e2 = 2 * err
    if (e2 >= dy) {
      err += dy
      x0 += sx
    }
    if (e2 <= dx) {
      err += dx
      y0 += sy
    }
  }
}
export function thickLine(
  c: Canvas, x0: number, y0: number, x1: number, y1: number, t: number, col: string,
): void {
  const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1)
  for (let i = 0; i <= steps; i++) {
    const x = x0 + ((x1 - x0) * i) / steps
    const y = y0 + ((y1 - y0) * i) / steps
    disc(c, x, y, t / 2, col)
  }
}
export function disc(c: Canvas, cx: number, cy: number, r: number, col: string): void {
  const r2 = r * r + 0.3
  for (let j = Math.floor(-r); j <= Math.ceil(r); j++) {
    for (let i = Math.floor(-r); i <= Math.ceil(r); i++) {
      if (i * i + j * j <= r2) px(c, cx + i, cy + j, col)
    }
  }
}
export function ellipse(
  c: Canvas, cx: number, cy: number, rx: number, ry: number, col: string,
): void {
  for (let j = -ry; j <= ry; j++) {
    for (let i = -rx; i <= rx; i++) {
      if ((i * i) / (rx * rx + 0.3) + (j * j) / (ry * ry + 0.3) <= 1) px(c, cx + i, cy + j, col)
    }
  }
}
/** Gradien vertikal berundak. */
export function vgrad(
  c: Canvas, x: number, y: number, w: number, h: number, top: string, bot: string, steps = 8,
): void {
  for (let j = 0; j < h; j++) {
    const q = Math.floor((j / Math.max(1, h - 1)) * (steps - 1)) / Math.max(1, steps - 1)
    hline(c, x, y + j, w, mix(top, bot, q))
  }
}
export function tint(
  c: Canvas, x: number, y: number, w: number, h: number, col: string, t: number,
): void {
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) blendPx(c, x + i, y + j, col, t)
}
/** Cahaya radial (campuran ke warna cahaya). */
export function glow(
  c: Canvas, cx: number, cy: number, r: number, col: string, strength: number,
): void {
  for (let j = Math.floor(-r); j <= Math.ceil(r); j++) {
    for (let i = Math.floor(-r); i <= Math.ceil(r); i++) {
      const d = Math.sqrt(i * i + j * j) / r
      if (d >= 1) continue
      const f = (1 - d) * (1 - d) * strength
      // kuantisasi ringan supaya tetap terasa piksel
      blendPx(c, cx + i, cy + j, col, Math.round(f * 12) / 12)
    }
  }
}
/** Bayangan lembut persegi (gelapkan area). */
export function shadowRect(
  c: Canvas, x: number, y: number, w: number, h: number, t = 0.28,
): void {
  tint(c, x, y, w, h, '#0b0f1a', t)
}
export function blit(dst: Canvas, src: Canvas, x: number, y: number): void {
  for (let j = 0; j < src.h; j++) {
    for (let i = 0; i < src.w; i++) px(dst, x + i, y + j, src.cells[j * src.w + i] as string)
  }
}
export function toGrid(c: Canvas): PixelGrid {
  return { width: c.w, height: c.h, cells: c.cells.slice() }
}
/** Kotak bervolume: sisi atas terang, sisi kanan gelap, garis tepi halus. */
export function box(
  c: Canvas, x: number, y: number, w: number, h: number, col: string,
): void {
  rect(c, x, y, w, h, col)
  hline(c, x, y, w, shade(col, 0.28))
  vline(c, x, y, h, shade(col, 0.12))
  vline(c, x + w - 1, y, h, shade(col, -0.28))
  hline(c, x, y + h - 1, w, shade(col, -0.32))
}

// ------------------------------------------------------------- jendela
export type Variant = 'pagi' | 'sore'

export function paintWindow(
  c: Canvas, x: number, y: number, w: number, h: number,
  o: { variant: Variant; view: 'pohon' | 'gedung'; cols?: number; rows?: number; seed?: number },
): void {
  const sore = o.variant === 'sore'
  const r = rng(o.seed ?? 7)
  const v = createCanvas(w, h, '#000000')
  vgrad(v, 0, 0, w, h, sore ? '#e9796a' : '#6fb6ea', sore ? '#fbd9a0' : '#e3f5fb', 9)
  // awan
  const cloud = sore ? '#ffd9bd' : '#ffffff'
  for (let i = 0; i < 3; i++) {
    const cx = Math.floor(r() * w)
    const cy = 3 + Math.floor(r() * (h * 0.3))
    ellipse(v, cx, cy, 7, 2, cloud)
    ellipse(v, cx + 4, cy - 1, 4, 2, cloud)
  }
  if (o.view === 'pohon') {
    // bukit jauh
    for (let i = 0; i < w; i++) {
      const hh = Math.round(h * 0.52 + Math.sin(i / 7) * 3 + Math.sin(i / 3.1) * 1.2)
      vline(v, i, hh, h - hh, sore ? '#9a8a86' : '#8fb2a4')
    }
    // gedung jauh
    for (let i = 0; i < 4; i++) {
      const bx = Math.floor(r() * (w - 10))
      const bh = 8 + Math.floor(r() * 12)
      rect(v, bx, Math.floor(h * 0.62) - bh, 9, bh + 4, sore ? '#8c7a82' : '#9fb0bd')
      for (let k = 0; k < bh; k += 3) {
        px(v, bx + 2, Math.floor(h * 0.62) - bh + 2 + k, sore ? '#ffd27a' : '#c9d8e2')
        px(v, bx + 6, Math.floor(h * 0.62) - bh + 2 + k, sore ? '#ffd27a' : '#c9d8e2')
      }
    }
    // rumput
    rect(v, 0, Math.floor(h * 0.78), w, h, sore ? '#6e9a4e' : '#5faa4f')
    for (let i = 0; i < w; i += 2) px(v, i, Math.floor(h * 0.78), shade('#5faa4f', 0.25))
    // pohon
    const n = Math.max(3, Math.floor(w / 22))
    for (let i = 0; i < n; i++) {
      const tx = Math.floor(((i + 0.5) * w) / n + (r() - 0.5) * 8)
      const base = Math.floor(h * 0.86)
      const rr = 7 + Math.floor(r() * 5)
      rect(v, tx - 1, base - 12, 3, 14, '#6b4a35')
      vline(v, tx + 1, base - 12, 14, '#4d3425')
      const cy = base - 14 - Math.floor(rr / 2)
      disc(v, tx, cy, rr, sore ? '#2f6a3c' : '#2e7d46')
      disc(v, tx - 3, cy - 2, rr - 2, sore ? '#4a8a45' : '#43a05a')
      disc(v, tx - 4, cy - 4, Math.max(2, rr - 5), sore ? '#8fb85a' : '#86cf72')
      for (let k = 0; k < 4; k++) px(v, tx - rr + Math.floor(r() * rr * 2), cy - rr + Math.floor(r() * rr * 2), '#b6e48e')
    }
  } else {
    for (let layer = 0; layer < 2; layer++) {
      let bx = -2 - layer * 4
      while (bx < w) {
        const bw = 9 + Math.floor(r() * 8)
        const bh = Math.floor(h * (layer ? 0.4 : 0.55)) + Math.floor(r() * h * 0.2)
        const col = layer ? (sore ? '#8a6d7a' : '#9db0c0') : sore ? '#5f4a5e' : '#6f8499'
        rect(v, bx, h - bh, bw, bh, col)
        hline(v, bx, h - bh, bw, shade(col, 0.2))
        for (let wy = h - bh + 3; wy < h - 3; wy += 4) {
          for (let wx = bx + 2; wx < bx + bw - 2; wx += 3) {
            const lit = r() > 0.55
            px(v, wx, wy, lit ? (sore ? '#ffd27a' : '#e8f3fa') : shade(col, -0.18))
          }
        }
        bx += bw + 1
      }
    }
    rect(v, 0, h - 5, w, 5, sore ? '#4a3d4c' : '#56626c')
  }
  // kilau diagonal
  for (let s = -h; s < w; s += 22) {
    for (let k = 0; k < h; k++) {
      for (let t = 0; t < 5; t++) blendPx(v, s + k + t, k, '#ffffff', 0.13)
    }
  }
  blit(c, v, x, y)
  // sekat & bingkai
  const frame = '#f1f4f6'
  const cols = o.cols ?? 3
  const rows = o.rows ?? 2
  for (let i = 1; i < cols; i++) {
    const bx = x + Math.round((i * w) / cols)
    rect(c, bx - 1, y, 2, h, frame)
    vline(c, bx + 1, y, h, '#aab4bb')
  }
  for (let j = 1; j < rows; j++) {
    const by = y + Math.round((j * h) / rows)
    rect(c, x, by - 1, w, 2, frame)
    hline(c, x, by + 1, w, '#aab4bb')
  }
  rect(c, x - 3, y - 3, w + 6, 3, frame)
  rect(c, x - 3, y + h, w + 6, 1, frame)
  rect(c, x - 3, y - 3, 3, h + 6, frame)
  rect(c, x + w, y - 3, 3, h + 6, frame)
  hline(c, x - 3, y - 3, w + 6, '#ffffff')
  vline(c, x - 4, y - 4, h + 8, '#7d8a93')
  vline(c, x + w + 3, y - 4, h + 8, '#7d8a93')
  hline(c, x - 4, y - 4, w + 8, '#7d8a93')
  // ambang
  rect(c, x - 5, y + h + 1, w + 10, 3, '#e3e8ea')
  hline(c, x - 5, y + h + 1, w + 10, '#ffffff')
  hline(c, x - 5, y + h + 4, w + 10, '#8e9aa2')
  shadowRect(c, x - 4, y + h + 5, w + 8, 2, 0.18)
}

// ---------------------------------------------------------------- rak
export function paintShelf(
  c: Canvas, x: number, y: number, w: number, h: number,
  o: { seed: number; rows?: number; tone?: 'abu' | 'kayu' | 'logam'; books?: boolean },
): void {
  const r = rng(o.seed)
  const tone = o.tone ?? 'abu'
  const frame = tone === 'kayu' ? '#8a5a3a' : tone === 'logam' ? '#7e8b95' : '#9aa6ae'
  const back = tone === 'kayu' ? '#5a3b28' : '#4e5a64'
  const rows = o.rows ?? 4
  rect(c, x, y, w, h, back)
  const rh = Math.floor((h - 2) / rows)
  const palette = ['#e0b24a', '#d9694b', '#4d8fc4', '#59a67a', '#c9c2b0', '#8a6bb8', '#d98fa0', '#e8e4d8']
  for (let k = 0; k < rows; k++) {
    const top = y + 1 + k * rh
    const floorY = top + rh - 1
    shadowRect(c, x + 2, top, w - 4, 2, 0.35)
    let ix = x + 2
    while (ix < x + w - 4) {
      const col = palette[Math.floor(r() * palette.length)] as string
      if (o.books ?? tone === 'kayu') {
        const bw = 2 + Math.floor(r() * 2)
        const bh = Math.max(5, rh - 4 - Math.floor(r() * 4))
        if (ix + bw > x + w - 2) break
        box(c, ix, floorY - bh, bw, bh, col)
        if (bw > 2) hline(c, ix, floorY - bh + 2, bw, shade(col, 0.4))
        ix += bw
        if (r() < 0.1) ix += 2
      } else {
        const bw = 5 + Math.floor(r() * 5)
        const bh = Math.max(5, rh - 3 - Math.floor(r() * 5))
        if (ix + bw > x + w - 2) break
        box(c, ix, floorY - bh, bw, bh, col)
        hline(c, ix + 1, floorY - Math.floor(bh / 2), bw - 2, shade(col, 0.45)) // label
        ix += bw + 1
      }
    }
    rect(c, x, floorY, w, 2, frame)
    hline(c, x, floorY, w, shade(frame, 0.3))
    hline(c, x, floorY + 1, w, shade(frame, -0.3))
  }
  rect(c, x, y, 2, h, frame)
  rect(c, x + w - 2, y, 2, h, frame)
  vline(c, x + 1, y, h, shade(frame, 0.25))
  vline(c, x + w - 1, y, h, shade(frame, -0.3))
  hline(c, x, y, w, shade(frame, 0.3))
}

// ----------------------------------------------------------- printer 3D
export function paintPrinter3d(
  c: Canvas, x: number, y: number,
  o: { model?: string; filament?: string; led?: boolean; w?: number; h?: number } = {},
): void {
  const w = o.w ?? 30
  const h = o.h ?? 32
  const model = o.model ?? '#f08a24'
  const fil = o.filament ?? '#e5533d'
  shadowRect(c, x + 1, y + h, w + 2, 2, 0.35)
  // pelat dasar
  box(c, x, y + h - 7, w, 7, '#3a424b')
  rect(c, x + 3, y + h - 5, 9, 3, '#0f1c20')
  rect(c, x + 4, y + h - 4, 7, 1, '#5be0a8')
  px(c, x + w - 5, y + h - 4, o.led === false ? '#6b2d2d' : '#5be0a8')
  px(c, x + w - 3, y + h - 4, '#e8c447')
  // tiang
  box(c, x + 1, y + 6, 3, h - 12, '#aeb8c0')
  box(c, x + w - 4, y + 6, 3, h - 12, '#aeb8c0')
  // bingkai atas
  box(c, x, y + 3, w, 4, '#59636d')
  // kaca / kabinet transparan
  tint(c, x + 4, y + 7, w - 8, h - 14, '#9fd8e8', 0.18)
  vline(c, x + 5, y + 8, h - 16, '#d9f3fa')
  vline(c, x + 6, y + 9, 5, '#ffffff')
  // gantri & kepala cetak
  rect(c, x + 4, y + 15, w - 8, 2, '#d9dfe3')
  hline(c, x + 4, y + 15, w - 8, '#ffffff')
  const hx0 = x + Math.floor(w / 2) - 1
  box(c, hx0 - 2, y + 15, 7, 5, '#2d353d')
  rect(c, hx0, y + 20, 3, 2, '#e8c447')
  // meja cetak & objek
  box(c, x + 5, y + h - 9, w - 10, 2, '#cfd6db')
  const bx = x + Math.floor(w / 2) - 5
  for (let k = 0; k < 6; k++) {
    const ww = 10 - k
    const colk = k % 2 === 0 ? model : shade(model, -0.12)
    rect(c, bx + Math.floor((10 - ww) / 2), y + h - 10 - k, ww, 1, colk)
  }
  vline(c, bx + 1, y + h - 15, 6, shade(model, 0.35))
  // gulungan filamen di atas
  const sx = x + w - 9
  const sy = y - 2
  disc(c, sx, sy, 6, shade(fil, -0.15))
  disc(c, sx, sy, 5, fil)
  disc(c, sx - 1, sy - 1, 3, shade(fil, 0.25))
  disc(c, sx, sy, 2, '#2a2f36')
  px(c, sx, sy, '#c8d0d6')
  rect(c, sx - 1, sy + 6, 3, 2, '#59636d')
  // benang filamen turun ke kepala cetak
  line(c, sx - 5, sy + 2, hx0 + 1, y + 15, fil)
  px(c, hx0 + 1, y + 14, fil)
}

// ----------------------------------------------------------- lengan robot
export function paintRobotArm(
  c: Canvas, x: number, y: number, o: { color?: string; scale?: number } = {},
): void {
  const col = o.color ?? '#f08a24'
  const dark = '#2f3640'
  shadowRect(c, x - 9, y, 20, 2, 0.35)
  box(c, x - 9, y - 4, 19, 4, '#59636d')
  box(c, x - 5, y - 10, 11, 6, col)
  hline(c, x - 4, y - 8, 9, shade(col, 0.4))
  disc(c, x, y - 12, 4, dark)
  disc(c, x, y - 12, 3, '#59636d')
  px(c, x - 1, y - 13, '#b9c3cb')
  // lengan bawah
  thickLine(c, x, y - 12, x + 9, y - 28, 5, shade(col, -0.2))
  thickLine(c, x, y - 12, x + 9, y - 28, 3, col)
  thickLine(c, x - 1, y - 13, x + 8, y - 28, 1, shade(col, 0.45))
  disc(c, x + 9, y - 28, 4, dark)
  disc(c, x + 9, y - 28, 2.5, '#59636d')
  // lengan atas
  thickLine(c, x + 9, y - 28, x + 22, y - 22, 4, shade(col, -0.2))
  thickLine(c, x + 9, y - 28, x + 22, y - 22, 2, col)
  disc(c, x + 22, y - 22, 3, dark)
  px(c, x + 21, y - 23, '#b9c3cb')
  // pergelangan & penjepit
  rect(c, x + 21, y - 20, 3, 4, '#aeb8c0')
  rect(c, x + 19, y - 16, 2, 5, dark)
  rect(c, x + 24, y - 16, 2, 5, dark)
  hline(c, x + 19, y - 11, 2, '#e8c447')
  hline(c, x + 24, y - 11, 2, '#e8c447')
  // kabel
  line(c, x + 5, y - 6, x + 14, y - 3, '#1d2127')
}

// -------------------------------------------------------------- furnitur
export function paintDesk(
  c: Canvas, x: number, y: number, w: number,
  o: { legs?: number; wood?: string; shadow?: boolean } = {},
): void {
  const wood = o.wood ?? '#b5835a'
  const legH = o.legs ?? 14
  if (o.shadow !== false) shadowRect(c, x + 2, y + 4 + legH, w - 2, 3, 0.28)
  box(c, x, y, w, 3, shade(wood, 0.1))
  hline(c, x, y, w, shade(wood, 0.4))
  rect(c, x + 1, y + 3, w - 2, 4, shade(wood, -0.15))
  hline(c, x + 1, y + 3, w - 2, shade(wood, -0.35))
  rect(c, x + 5, y + 4, 12, 2, shade(wood, -0.3))
  px(c, x + 10, y + 5, '#d8c27a')
  box(c, x + 1, y + 7, 3, legH, shade(wood, -0.28))
  box(c, x + w - 4, y + 7, 3, legH, shade(wood, -0.28))
}

export function paintMonitor(
  c: Canvas, x: number, y: number, w: number, h: number,
  o: { kind: 'kode' | 'cad' | 'grafik' | 'mati' | 'terminal'; seed?: number; glow?: string },
): void {
  const r = rng(o.seed ?? 3)
  box(c, x, y, w, h, '#222831')
  const sx = x + 1
  const sy = y + 1
  const sw = w - 2
  const sh = h - 2
  if (o.kind === 'mati') {
    rect(c, sx, sy, sw, sh, '#10151b')
    line(c, sx + 1, sy + 1, sx + 4, sy + 1, '#27303a')
  } else if (o.kind === 'kode' || o.kind === 'terminal') {
    rect(c, sx, sy, sw, sh, o.kind === 'kode' ? '#161b2e' : '#0b1410')
    const cols = o.kind === 'kode'
      ? ['#7aa2f7', '#bb9af7', '#9ece6a', '#e0af68', '#f7768e']
      : ['#6be39a', '#3fae6f', '#b6f5cc']
    for (let j = 1; j < sh - 1; j += 2) {
      let ix = sx + 1 + (r() < 0.4 ? 2 : 0)
      const n = 1 + Math.floor(r() * 3)
      for (let k = 0; k < n; k++) {
        const len = 2 + Math.floor(r() * Math.max(2, sw / 3))
        hline(c, ix, sy + j, Math.min(len, sx + sw - ix - 1), cols[Math.floor(r() * cols.length)] as string)
        ix += len + 1
        if (ix > sx + sw - 3) break
      }
    }
  } else if (o.kind === 'cad') {
    rect(c, sx, sy, sw, sh, '#e9eef2')
    for (let i = 0; i < sw; i += 3) vline(c, sx + i, sy, sh, '#d2dce3')
    for (let j = 0; j < sh; j += 3) hline(c, sx, sy + j, sw, '#d2dce3')
    const m = Math.floor(sw / 2)
    const n = Math.floor(sh / 2)
    box(c, sx + m - 4, sy + n - 2, 8, 6, '#f08a24')
    rect(c, sx + m - 3, sy + n - 4, 6, 2, '#ffb25a')
    rect(c, sx, sy, 3, sh, '#c4cfd7')
  } else {
    rect(c, sx, sy, sw, sh, '#0d1b17')
    for (let i = 0; i < sw; i++) {
      const yy = sy + Math.floor(sh / 2 + Math.sin(i / 2.2) * (sh / 3))
      px(c, sx + i, yy, '#5bf0a4')
      px(c, sx + i, yy + 1, '#2c9f6d')
    }
  }
  hline(c, sx, sy, sw, mix(getPx(c, sx, sy), '#ffffff', 0.2))
  // kaki
  rect(c, x + Math.floor(w / 2) - 1, y + h, 3, 2, '#3a424b')
  rect(c, x + Math.floor(w / 2) - 4, y + h + 2, 9, 1, '#3a424b')
  if (o.kind !== 'mati') glow(c, x + Math.floor(w / 2), y + Math.floor(h / 2), w * 0.9, o.glow ?? '#9fd0ff', 0.22)
}

export function paintLaptop(c: Canvas, x: number, y: number, kind: 'kode' | 'cad' | 'grafik' | 'terminal' = 'kode', seed = 5): void {
  paintMonitor(c, x + 1, y - 9, 12, 9, { kind, seed })
  // hapus kaki monitor: tutup dengan alas laptop
  box(c, x - 1, y, 16, 2, '#aeb8c0')
  hline(c, x + 3, y, 8, '#8a959e')
}

// ------------------------------------------------------- bilik las
export function paintWeldingBooth(
  c: Canvas, x: number, y: number, w: number, h: number, o: { sparks?: boolean; seed?: number } = {},
): void {
  const r = rng(o.seed ?? 11)
  // bagian dalam bilik, gelap dengan cahaya busur
  rect(c, x, y, w, h, '#1b1612')
  const cx = x + Math.floor(w / 2)
  const cy = y + h - 16
  glow(c, cx, cy, 32, '#ffb347', 0.9)
  glow(c, cx, cy, 14, '#fff2c2', 0.95)
  // meja kerja & benda las
  box(c, x + 6, y + h - 10, w - 12, 4, '#59636d')
  box(c, cx - 8, y + h - 14, 16, 4, '#8a959e')
  // busur las
  disc(c, cx, cy + 1, 2, '#ffffff')
  disc(c, cx, cy + 1, 1, '#ffffff')
  px(c, cx, cy + 1, '#ffffff')
  // percikan
  const spark = ['#fff6c4', '#ffd24a', '#ff9a2e']
  for (let i = 0; i < 26; i++) {
    const a = r() * Math.PI * 2
    const d = 3 + r() * 20
    const sx2 = cx + Math.cos(a) * d
    const sy2 = cy + Math.sin(a) * d * 0.8 + d * 0.15
    px(c, sx2, sy2, spark[Math.floor(r() * 3)] as string)
    if (r() < 0.5) px(c, sx2 - Math.cos(a), sy2 - Math.sin(a), '#ff9a2e')
  }
  for (let i = 0; i < 6; i++) line(c, cx, cy + 1, cx + Math.round((r() - 0.5) * 36), cy + Math.round((r() - 0.7) * 20), '#ffd24a')
  // rangka
  box(c, x - 3, y - 5, 4, h + 5, '#3a424b')
  box(c, x + w - 1, y - 5, 4, h + 5, '#3a424b')
  box(c, x - 3, y - 6, w + 6, 4, '#4b5560')
  // tirai las: panel bergaris hijau-oranye di kiri dan kanan, celah tengah
  const panel = (px0: number, pw: number): void => {
    for (let i = 0; i < pw; i++) {
      const stripe = Math.floor(i / 3) % 2
      const colc = stripe ? '#e08a2d' : '#c8701c'
      vline(c, px0 + i, y - 2, h + 2, colc)
      if (i % 3 === 0) vline(c, px0 + i, y - 2, h + 2, shade(colc, -0.22))
    }
    hline(c, px0, y - 2, pw, shade('#e08a2d', 0.3))
    for (let i = 0; i < pw; i += 5) disc(c, px0 + i, y - 3, 1, '#c8d0d6')
    hline(c, px0, y + h - 1, pw, '#6b3a10')
    // bayangan lipatan bawah
    for (let i = 0; i < pw; i += 3) px(c, px0 + i, y + h - 2, '#8a4a10')
  }
  panel(x + 1, 13)
  panel(x + w - 14, 13)
  tint(c, x + 1, y - 2, 13, h + 2, '#ffb347', 0.08)
  // sorot cahaya jatuh ke lantai
  glow(c, cx, y + h + 6, 22, '#ffb347', 0.35)
  // tanda peringatan
  rect(c, x + 2, y + 4, 9, 8, '#f2c230')
  rect(c, x + 3, y + 5, 7, 6, '#1d2127')
  px(c, x + 6, y + 6, '#f2c230')
  vline(c, x + 6, y + 7, 2, '#f2c230')
  px(c, x + 6, y + 10, '#f2c230')
}

// ------------------------------------------------------- osiloskop
export function paintOscilloscope(c: Canvas, x: number, y: number): void {
  shadowRect(c, x + 1, y + 16, 24, 2, 0.35)
  box(c, x, y, 24, 16, '#c9c2ae')
  rect(c, x + 2, y + 2, 14, 11, '#0a1a14')
  for (let i = 0; i < 14; i += 3) vline(c, x + 2 + i, y + 2, 11, '#12332a')
  for (let j = 0; j < 11; j += 3) hline(c, x + 2, y + 2 + j, 14, '#12332a')
  for (let i = 0; i < 14; i++) {
    px(c, x + 2 + i, y + 7 + Math.round(Math.sin(i / 1.8) * 3), '#5bf0a4')
    px(c, x + 2 + i, y + 8 + Math.round(Math.sin(i / 1.8) * 3), '#2c9f6d')
  }
  glow(c, x + 9, y + 7, 16, '#5bf0a4', 0.28)
  disc(c, x + 20, y + 4, 2, '#2a2f36')
  px(c, x + 20, y + 3, '#e5533d')
  disc(c, x + 20, y + 10, 2, '#2a2f36')
  px(c, x + 19, y + 10, '#ffffff')
  rect(c, x + 17, y + 13, 2, 2, '#3a424b')
  rect(c, x + 21, y + 13, 2, 2, '#3a424b')
  // probe
  line(c, x + 3, y + 16, x - 6, y + 19, '#1d2127')
  line(c, x + 12, y + 16, x + 22, y + 21, '#e5533d')
}

export function paintCrates(c: Canvas, x: number, y: number, w: number, h: number, col = '#b98a56'): void {
  shadowRect(c, x + 1, y + h, w + 1, 2, 0.35)
  box(c, x, y, w, h, col)
  for (let j = 3; j < h - 1; j += 4) hline(c, x + 1, y + j, w - 2, shade(col, -0.25))
  rect(c, x, y, 3, h, shade(col, -0.18))
  rect(c, x + w - 3, y, 3, h, shade(col, -0.18))
  line(c, x + 3, y + 2, x + w - 4, y + h - 3, shade(col, -0.3))
  line(c, x + 3, y + h - 3, x + w - 4, y + 2, shade(col, -0.3))
  hline(c, x, y, w, shade(col, 0.4))
}

export function paintSofa(
  c: Canvas, x: number, y: number, w: number, col = '#a65a4a', seats = 2,
): void {
  shadowRect(c, x + 2, y + 21, w, 3, 0.3)
  // sandaran
  box(c, x + 2, y, w - 4, 12, shade(col, -0.08))
  for (let i = 0; i < seats; i++) {
    const sw2 = Math.floor((w - 12) / seats)
    box(c, x + 6 + i * sw2, y + 2, sw2 - 1, 9, col)
    hline(c, x + 7 + i * sw2, y + 3, sw2 - 3, shade(col, 0.3))
  }
  // dudukan
  box(c, x + 5, y + 11, w - 10, 6, shade(col, 0.05))
  const sw3 = Math.floor((w - 12) / seats)
  for (let i = 1; i < seats; i++) vline(c, x + 5 + i * sw3, y + 11, 6, shade(col, -0.35))
  hline(c, x + 6, y + 12, w - 12, shade(col, 0.28))
  // lengan
  box(c, x, y + 5, 6, 13, shade(col, -0.18))
  box(c, x + w - 6, y + 5, 6, 13, shade(col, -0.18))
  hline(c, x + 1, y + 6, 4, shade(col, 0.25))
  hline(c, x + w - 5, y + 6, 4, shade(col, 0.25))
  // kaki
  rect(c, x + 2, y + 18, 2, 3, '#3b2a20')
  rect(c, x + w - 4, y + 18, 2, 3, '#3b2a20')
  // bantal
  box(c, x + 8, y + 5, 6, 6, shade(col, 0.45))
  line(c, x + 9, y + 6, x + 12, y + 9, shade(col, 0.2))
}

export function paintPlant(c: Canvas, x: number, y: number, size = 1, seed = 2): void {
  const r = rng(seed)
  const pw = 8 + size * 2
  shadowRect(c, x - Math.floor(pw / 2) + 1, y, pw, 2, 0.3)
  // pot
  rect(c, x - Math.floor(pw / 2), y - 8, pw, 8, '#c4673f')
  rect(c, x - Math.floor(pw / 2) - 1, y - 9, pw + 2, 3, '#d97a50')
  vline(c, x + Math.floor(pw / 2) - 1, y - 8, 8, '#8f4527')
  hline(c, x - Math.floor(pw / 2) - 1, y - 9, pw + 2, '#eaa07a')
  rect(c, x - Math.floor(pw / 2), y - 10, pw, 1, '#4a2f1d')
  // daun
  const greens = ['#2f8a4a', '#43a85d', '#6cc36e', '#256f3c']
  const n = 7 + size * 3
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (i / (n - 1) - 0.5) * 2.4 + (r() - 0.5) * 0.3
    const len = (8 + r() * 6) * (0.8 + size * 0.3)
    const ex = x + Math.cos(a) * len
    const ey = y - 10 + Math.sin(a) * len
    const colg = greens[i % greens.length] as string
    thickLine(c, x, y - 10, ex, ey, 1, shade(colg, -0.2))
    disc(c, ex, ey, 2.2, colg)
    px(c, ex - 1, ey - 1, shade(colg, 0.4))
  }
}

export function paintWhiteboard(
  c: Canvas, x: number, y: number, w: number, h: number,
  o: { content: 'catatan' | 'diagram' | 'sticky' | 'kosong'; seed?: number },
): void {
  const r = rng(o.seed ?? 4)
  box(c, x - 2, y - 2, w + 4, h + 4, '#8a959e')
  rect(c, x, y, w, h, '#f6f8f8')
  tint(c, x, y, w, 3, '#ffffff', 0.5)
  line(c, x + 3, y + h - 2, x + 9, y + 2, '#ffffff')
  rect(c, x + 3, y + h + 2, w - 6, 2, '#8a959e')
  if (o.content === 'catatan') {
    const ink = ['#2d6fd2', '#d24a3a', '#222831']
    for (let j = 3; j < h - 3; j += 4) {
      const len = 6 + Math.floor(r() * (w - 14))
      hline(c, x + 3, y + j, len, ink[Math.floor(r() * 3)] as string)
    }
  } else if (o.content === 'diagram') {
    box(c, x + 4, y + 4, 12, 7, '#cfe6ff')
    box(c, x + w - 16, y + 4, 12, 7, '#ffe7b8')
    box(c, x + Math.floor(w / 2) - 6, y + h - 12, 12, 7, '#d6f2d6')
    line(c, x + 16, y + 7, x + w - 16, y + 7, '#2d6fd2')
    line(c, x + 10, y + 11, x + Math.floor(w / 2) - 4, y + h - 10, '#d24a3a')
    line(c, x + w - 10, y + 11, x + Math.floor(w / 2) + 4, y + h - 10, '#d24a3a')
  } else if (o.content === 'sticky') {
    const cols = ['#ffe36e', '#ff9fb2', '#9fe0ff', '#b8f0a0']
    for (let j = 0; j < Math.floor((h - 4) / 8); j++) {
      for (let i = 0; i < Math.floor((w - 4) / 9); i++) {
        if (r() < 0.25) continue
        const col = cols[Math.floor(r() * cols.length)] as string
        rect(c, x + 3 + i * 9, y + 3 + j * 8, 7, 6, col)
        hline(c, x + 3 + i * 9, y + 3 + j * 8, 7, shade(col, 0.35))
        hline(c, x + 4 + i * 9, y + 5 + j * 8, 4, shade(col, -0.35))
      }
    }
  }
}

// ----------------------------------------------------------- tambahan
export function paintPendantLamp(c: Canvas, x: number, topY: number, len: number, col = '#e8c447', lightCol = '#ffe9a8'): void {
  vline(c, x, topY, len, '#2a2f36')
  const ly = topY + len
  rect(c, x - 5, ly, 11, 2, shade(col, -0.2))
  rect(c, x - 4, ly - 2, 9, 2, col)
  rect(c, x - 2, ly - 3, 5, 1, shade(col, 0.2))
  hline(c, x - 4, ly - 2, 9, shade(col, 0.4))
  rect(c, x - 2, ly + 2, 5, 1, lightCol)
  glow(c, x, ly + 8, 22, lightCol, 0.38)
}

export function paintDrawerWall(
  c: Canvas, x: number, y: number, cols: number, rows: number, seed = 5,
): void {
  const r = rng(seed)
  const tags = ['#e5533d', '#4d8fc4', '#e8c447', '#59a67a', '#8a6bb8']
  box(c, x, y, cols * 9 + 2, rows * 7 + 2, '#3d4a57')
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const dx = x + 1 + i * 9
      const dy = y + 1 + j * 7
      box(c, dx, dy, 8, 6, '#6c7c8a')
      hline(c, dx + 1, dy + 1, 6, '#8fa0ae')
      rect(c, dx + 2, dy + 2, 4, 2, tags[Math.floor(r() * tags.length)] as string)
      px(c, dx + 3, dy + 4, '#d8dde1')
      px(c, dx + 4, dy + 4, '#d8dde1')
    }
  }
}

export function paintServerRack(c: Canvas, x: number, y: number, h: number, seed = 8): void {
  const r = rng(seed)
  shadowRect(c, x + 1, y + h, 16, 2, 0.35)
  box(c, x, y, 16, h, '#20262d')
  for (let j = 2; j < h - 3; j += 5) {
    box(c, x + 2, y + j, 12, 4, '#39424c')
    for (let i = 0; i < 4; i++) {
      px(c, x + 3 + i * 2, y + j + 2, r() > 0.45 ? '#5bf0a4' : r() > 0.5 ? '#f0b64a' : '#e5533d')
    }
    hline(c, x + 10, y + j + 1, 3, '#12161b')
    hline(c, x + 10, y + j + 3, 3, '#12161b')
  }
  glow(c, x + 8, y + Math.floor(h / 2), 18, '#5bf0a4', 0.15)
}

export function paintFrame(c: Canvas, x: number, y: number, w: number, h: number, inner: string, frame = '#5a3b28'): void {
  box(c, x, y, w, h, frame)
  rect(c, x + 2, y + 2, w - 4, h - 4, '#f2ead8')
  rect(c, x + 3, y + 3, w - 6, h - 6, inner)
  hline(c, x + 3, y + 3, w - 6, shade(inner, 0.3))
  rect(c, x + Math.floor(w / 2) - 2, y + Math.floor(h / 2) - 1, 4, 3, shade(inner, -0.2))
}

export function paintClock(c: Canvas, x: number, y: number): void {
  disc(c, x, y, 6, '#3a424b')
  disc(c, x, y, 5, '#f4f1e6')
  line(c, x, y, x, y - 3, '#222831')
  line(c, x, y, x + 3, y + 1, '#222831')
  px(c, x, y, '#e5533d')
  for (let a = 0; a < 12; a++) px(c, x + Math.round(Math.cos(a * 0.5236) * 4), y + Math.round(Math.sin(a * 0.5236) * 4), '#8a959e')
}

export function paintRug(c: Canvas, cx: number, cy: number, rx: number, ry: number, col: string, accent: string): void {
  ellipse(c, cx, cy, rx, ry, shade(col, -0.2))
  ellipse(c, cx, cy, rx - 1, ry - 1, col)
  ellipse(c, cx, cy, Math.max(2, rx - 5), Math.max(1, ry - 3), accent)
  ellipse(c, cx, cy, Math.max(1, rx - 7), Math.max(1, ry - 4), col)
}

export function paintCylinder(c: Canvas, x: number, y: number, h: number, col: string): void {
  shadowRect(c, x, y + h, 8, 2, 0.35)
  rect(c, x, y + 3, 7, h - 3, col)
  ellipse(c, x + 3, y + 3, 3, 3, col)
  rect(c, x + 2, y - 2, 3, 3, '#59636d')
  vline(c, x + 1, y + 2, h - 2, shade(col, 0.35))
  vline(c, x + 6, y + 3, h - 3, shade(col, -0.3))
  hline(c, x, y + 10, 7, shade(col, -0.25))
  rect(c, x + 1, y + 12, 5, 5, '#f2f2f2')
  rect(c, x + 2, y + 13, 3, 1, '#222831')
}

export function paintChair(c: Canvas, x: number, y: number, col = '#4a5a6a', facing: 'depan' | 'belakang' = 'depan'): void {
  shadowRect(c, x - 1, y + 14, 12, 2, 0.3)
  if (facing === 'belakang') box(c, x, y, 10, 8, col)
  box(c, x - 1, y + 7, 12, 3, shade(col, 0.1))
  rect(c, x + 4, y + 10, 2, 5, '#2a2f36')
  hline(c, x + 1, y + 15, 8, '#2a2f36')
  if (facing === 'depan') hline(c, x, y + 7, 10, shade(col, 0.4))
}

export function paintCeilingStrip(c: Canvas, x: number, y: number, w: number, col = '#f4f8ff'): void {
  box(c, x, y, w, 2, '#c8d0d6')
  rect(c, x + 1, y + 1, w - 2, 1, col)
  glow(c, x + Math.floor(w / 2), y + 10, w * 0.7, col, 0.28)
}
