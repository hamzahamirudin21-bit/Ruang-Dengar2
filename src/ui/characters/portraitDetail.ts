import type { StoryExpression } from '../../engine/story/storyTypes'
import { getAppearance } from './appearance'
import { composePortraitFor } from './characterArt'
import type { AppearanceFallback } from './characterArt'
import { HAIR_COLORS, OUTLINE, SKIN_TONES } from './characterPalette'
import { DOSEN_ID, DOSEN_LOOK } from './dosenLook'
import type { PixelGrid } from './pixelGrid'
import { EXPRESSION_SPECS, PORTRAIT_H, PORTRAIT_W } from './portraitExpressions'
import type { PortraitMouthVariant } from './portraitExpressions'

/** Potret detail = 2× resolusi logis potret 80×96. */
export const DETAIL_W = PORTRAIT_W * 2
export const DETAIL_H = PORTRAIT_H * 2

/** Karakter: id mahasiswa atau `dosen`, dengan cadangan penampilan opsional. */
export type PortraitLook = string | { id: string; fallback?: AppearanceFallback }

/** Kontur luar siluet, sedikit lebih gelap dari kontur dalam. */
export const DETAIL_OUTLINE = '#1c120e'

const CX = 40
const WHITE = '#ffffff'
const SCLERA = '#fbf8f3'
const MOUTH = '#7a2a30'

/* ------------------------------------------------------------------ */
/* Warna                                                               */
/* ------------------------------------------------------------------ */

function rgb(c: string): [number, number, number] {
  const n = parseInt(c.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
function toHex(r: number, g: number, b: number): string {
  const f = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')
  return `#${f(r)}${f(g)}${f(b)}`
}
function mix(a: string, b: string, t: number): string {
  const [ar, ag, ab] = rgb(a)
  const [br, bg, bb] = rgb(b)
  return toHex(ar + (br - ar) * t, ag + (bg - ag) * t, ab + (bb - ab) * t)
}

const MOUTH_DARK = mix(MOUTH, '#000000', 0.15)
const MOUTH_COLORS = new Set<string>([MOUTH, MOUTH_DARK, '#fdfaf0', '#d9707a'])
const LIGHT_TINT = '#fff4dc'
const SHADE_TINT = '#26142e'

/* ------------------------------------------------------------------ */
/* Skala 2× yang menghaluskan diagonal (Scale2x / EPX)                 */
/* ------------------------------------------------------------------ */

function scale2x(src: PixelGrid): (string | null)[] {
  const w = src.width
  const h = src.height
  const out: (string | null)[] = new Array(w * 2 * h * 2).fill(null)
  const at = (x: number, y: number, fallback: string | null): string | null =>
    x < 0 || y < 0 || x >= w || y >= h ? fallback : src.cells[y * w + x]
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const p = src.cells[y * w + x]
      const a = at(x, y - 1, p)
      const b = at(x + 1, y, p)
      const c = at(x - 1, y, p)
      const d = at(x, y + 1, p)
      const p1 = c === a && c !== d && a !== b ? a : p
      const p2 = a === b && a !== c && b !== d ? b : p
      const p3 = d === c && d !== b && c !== a ? c : p
      const p4 = b === d && b !== a && d !== c ? d : p
      const o = y * 2 * (w * 2) + x * 2
      out[o] = p1
      out[o + 1] = p2
      out[o + w * 2] = p3
      out[o + w * 2 + 1] = p4
    }
  }
  return out
}

/* ------------------------------------------------------------------ */
/* Lapisan kontur dan bayangan                                         */
/* ------------------------------------------------------------------ */

/**
 * Lapisan kontur: sel transparan yang berbatasan (4 arah) dengan sel buram
 * menjadi sel kontur 1 sel. Hasil berukuran sama; sel lain null.
 */
export function outlineLayer(grid: PixelGrid, color: string = DETAIL_OUTLINE): PixelGrid {
  const { width: w, height: h, cells } = grid
  const out: (string | null)[] = new Array(w * h).fill(null)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (cells[y * w + x]) continue
      const near =
        (x > 0 && cells[y * w + x - 1]) ||
        (x < w - 1 && cells[y * w + x + 1]) ||
        (y > 0 && cells[(y - 1) * w + x]) ||
        (y < h - 1 && cells[(y + 1) * w + x])
      if (near) out[y * w + x] = color
    }
  }
  return { width: w, height: h, cells: out }
}

const HI_W = [0.2, 0.15, 0.1, 0.05]
const SH_W = [0.2, 0.15, 0.1, 0.05]

/** Putih mata, iris, dan kilau tidak diberi bayangan tepi agar mata tetap bersih. */
const NO_SHADE = new Set<string>([
  '#fbf8f3', '#d9d3e0', '#ffffff', '#120c0a', '#2b1a12', '#6b4423', '#b07a45', '#5a3a1e', '#a06c3c',
])

function isInk(c: string | null): boolean {
  return c === null || c === OUTLINE || c === DETAIL_OUTLINE
}

/**
 * Bayangan dengan cahaya dari kiri-atas: tepi yang menghadap cahaya (lawan
 * ujung sinar kiri-atas adalah kontur/tepi) diberi sorotan hangat dan tepi
 * yang membelakangi diberi bayangan sejuk. Bagian tengah warna tidak berubah.
 */
export function shadeLayer(grid: PixelGrid): PixelGrid {
  const { width: w, height: h, cells } = grid
  const out: (string | null)[] = cells.slice()
  const cache = new Map<string, string>()
  const tint = (c: string, to: string, t: number): string => {
    const key = `${c}|${to}|${t}`
    let v = cache.get(key)
    if (!v) {
      v = mix(c, to, t)
      cache.set(key, v)
    }
    return v
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const c = cells[y * w + x]
      if (!c || isInk(c) || NO_SHADE.has(c)) continue
      let hi = 0
      let sh = 0
      for (let k = 1; k <= 4; k++) {
        const hx = x - k
        const hy = y - k
        if (hx >= 0 && hy >= 0 && isInk(cells[hy * w + hx])) {
          hi = HI_W[k - 1]
          break
        }
      }
      for (let k = 1; k <= 4; k++) {
        const sx = x + k
        const sy = y + k
        if (sx < w && sy < h && isInk(cells[sy * w + sx])) {
          sh = SH_W[k - 1]
          break
        }
      }
      if (hi === 0 && sh === 0) continue
      out[y * w + x] = sh >= hi ? tint(c, SHADE_TINT, sh * 0.9) : tint(c, LIGHT_TINT, hi * 0.9)
    }
  }
  return { width: w, height: h, cells: out }
}

/* ------------------------------------------------------------------ */
/* Geometri wajah (sama dengan composePortrait / composeDosenPortrait) */
/* ------------------------------------------------------------------ */

function rxFace(hc: number, y: number): number {
  const dy = y - hc
  if (Math.abs(dy) > 19) return -1
  const base = 16 * Math.sqrt(Math.max(0, 1 - (dy / 19) * (dy / 19)))
  return dy > 0 ? base * (1 - 0.26 * (dy / 19)) : base
}

/** Setengah tinggi elips mata (sel 80×96) per jenis mata; dipakai untuk batas salin. */
const EYE_RY: Record<string, number> = {
  biasa: 5.4,
  lebar: 6.3,
  sipit: 3.6,
  turun: 4.6,
  melirik: 5.4,
  tertutup: 4,
}

interface Tones {
  skinBase: string
  skinShade: string
  hairBase: string
  hasHair: boolean
}

function tonesFor(id: string, fallback?: AppearanceFallback): Tones {
  let skinId: string
  let hairId: string
  let hasHair = true
  if (id === DOSEN_ID) {
    skinId = DOSEN_LOOK.skinId
    hairId = DOSEN_LOOK.hair.colorId
  } else {
    const a = getAppearance(id, fallback)
    skinId = a.body.skinId
    hairId = a.hair.colorId
    hasHair = a.hair.kind !== 'kerudung'
  }
  const skin = SKIN_TONES.find((s) => s.id === skinId) ?? SKIN_TONES[1]
  const hair = HAIR_COLORS.find((s) => s.id === hairId) ?? HAIR_COLORS[0]
  return { skinBase: skin.base, skinShade: skin.shade, hairBase: hair.base, hasHair }
}

/* ------------------------------------------------------------------ */
/* Penyusun utama                                                      */
/* ------------------------------------------------------------------ */

/**
 * Potret detail 160×192: komposisi 80×96 yang sama (warna dasar tiap karakter
 * dipertahankan), diperbesar 2× dengan penghalusan diagonal, ditambah sorotan
 * mata dan rambut, bentuk mulut bicara, bayangan kiri-atas, dan kontur luar.
 * Murni dan deterministik.
 */
export function buildDetailedPortrait(
  look: PortraitLook,
  expression: StoryExpression,
  eyesClosed: boolean,
  mouth: PortraitMouthVariant,
): PixelGrid {
  const id = typeof look === 'string' ? look : look.id
  const fallback = typeof look === 'string' ? undefined : look.fallback
  const spec = EXPRESSION_SPECS[expression] ?? EXPRESSION_SPECS.netral
  const tones = tonesFor(id, fallback)

  const baseGrid = composePortraitFor(id, expression, fallback)
  const base = baseGrid.cells.slice()
  const hc = 37 + spec.headDy
  const W = PORTRAIT_W

  /* ---- Mata tertutup: salin daerah mata dari ekspresi bermata tertutup ---- */
  if (eyesClosed && spec.eyes !== 'tertutup') {
    const donorSpec = EXPRESSION_SPECS.lega
    const hcD = 37 + donorSpec.headDy
    const donor = composePortraitFor(id, 'lega', fallback).cells
    const ry = EYE_RY[spec.eyes] ?? 5.4
    const relTop = Math.min(Math.floor(3 - ry - 1.5), -1)
    const relBot = Math.max(Math.ceil(3 + ry), 7)
    for (const ex of [CX - 9, CX + 9]) {
      for (let rel = relTop; rel <= relBot; rel++) {
        for (let x = ex - 6; x <= ex + 6; x++) {
          const yE = hc + rel
          const yD = hcD + rel
          if (yE < 0 || yD < 0 || yE >= PORTRAIT_H || yD >= PORTRAIT_H) continue
          base[yE * W + x] = donor[yD * W + x]
        }
      }
    }
  }

  /* ---- Mulut bicara: hapus mulut dasar, gambar ulang pada 2× ---- */
  if (mouth !== 'tutup') {
    for (let rel = 12; rel <= 20; rel++) {
      const y = hc + rel
      for (let x = CX - 7; x <= CX + 7; x++) {
        const c = base[y * W + x]
        if (!c) continue
        const inside = Math.abs(x - CX) <= rxFace(hc, y)
        if (MOUTH_COLORS.has(c) || (c === OUTLINE && inside)) {
          base[y * W + x] = rel >= 17 ? tones.skinShade : tones.skinBase
        }
      }
    }
  }

  /* ---- Perbesar 2× ---- */
  const w = DETAIL_W
  const h = DETAIL_H
  const g = scale2x({ width: PORTRAIT_W, height: PORTRAIT_H, cells: base })
  const idx = (x: number, y: number) => y * w + x

  const closed = eyesClosed || spec.eyes === 'tertutup'

  /* ---- Sorotan wajah (hanya pada sel kulit dasar) ---- */
  const faceGloss: [number, number, number, number, number][] = [
    [CX - 5, hc - 6, 7, 2.2, 0.16],
    [CX - 11, hc + 9, 3.2, 1.6, 0.2],
    [CX - 1, hc + 8.5, 1.1, 2.4, 0.2],
  ]
  for (const [gx, gy, rx, ry, amt] of faceGloss) {
    const cx2 = (gx + 0.5) * 2
    const cy2 = (gy + 0.5) * 2
    for (let y = Math.floor(cy2 - ry * 2); y <= Math.ceil(cy2 + ry * 2); y++) {
      for (let x = Math.floor(cx2 - rx * 2); x <= Math.ceil(cx2 + rx * 2); x++) {
        if (x < 0 || y < 0 || x >= w || y >= h) continue
        const e = ((x + 0.5 - cx2) / (rx * 2)) ** 2 + ((y + 0.5 - cy2) / (ry * 2)) ** 2
        if (e <= 1 && g[idx(x, y)] === tones.skinBase) {
          g[idx(x, y)] = mix(tones.skinBase, '#ffffff', amt * (1 - 0.5 * e))
        }
      }
    }
  }

  /* ---- Sorotan rambut: pita kilap melengkung di kiri-atas kepala ---- */
  if (tones.hasHair) {
    const hairHi = new Set<string>([
      tones.hairBase,
      mix(tones.hairBase, WHITE, 0.24),
      mix(tones.hairBase, WHITE, 0.2),
    ])
    const gx = (CX - 6 + 0.5) * 2
    const gy = (hc - 18 + 0.5) * 2
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const c = g[idx(x, y)]
        if (!c || !hairHi.has(c)) continue
        const nx = (x + 0.5 - gx) / 28
        const ny = (y + 0.5 - gy) / 11
        const d = Math.hypot(nx, ny)
        if (d > 0.5 && d < 0.78 && ny > 0) {
          // busur kilap pendek di bawah titik cahaya, memudar ke kedua ujung
          const t = 1 - Math.abs(d - 0.64) / 0.14
          const arc = Math.max(0, 1 - Math.abs(nx + 0.25) / 0.45)
          g[idx(x, y)] = mix(c, '#ffffff', 0.4 * Math.max(0, t) * arc)
        }
      }
    }
  }

  /* ---- Mata terbuka: kilau sekunder dan bayangan kelopak ---- */
  if (!closed) {
    for (const ex of [CX - 9, CX + 9]) {
      const x0 = (ex - 6) * 2
      const x1 = (ex + 7) * 2
      const y0 = (hc + 3 - 8) * 2
      const y1 = (hc + 3 + 8) * 2
      let pxMin = 1e9, pxMax = -1, pyMin = 1e9, pyMax = -1
      let wxMin = 1e9, wxMax = -1, wyMin = 1e9, wyMax = -1
      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
          const c = g[idx(x, y)]
          if (c === '#120c0a') {
            pxMin = Math.min(pxMin, x); pxMax = Math.max(pxMax, x)
            pyMin = Math.min(pyMin, y); pyMax = Math.max(pyMax, y)
          } else if (c === WHITE) {
            wxMin = Math.min(wxMin, x); wxMax = Math.max(wxMax, x)
            wyMin = Math.min(wyMin, y); wyMax = Math.max(wyMax, y)
          } else if (c === SCLERA) {
            const up1 = g[idx(x, y - 1)]
            const up2 = g[idx(x, y - 2)]
            if (up1 === OUTLINE || up2 === OUTLINE) g[idx(x, y)] = mix(SCLERA, '#6f6590', 0.22)
          }
        }
      }
      if (pxMax >= 0 && wxMax >= 0) {
        const pcx = (pxMin + pxMax + 1) / 2
        const pcy = (pyMin + pyMax + 1) / 2
        const mx = Math.floor(2 * pcx - (wxMin + wxMax + 1) / 2 - 1)
        const my = Math.floor(2 * pcy - (wyMin + wyMax + 1) / 2 - 1)
        for (let dy = 0; dy < 2; dy++) {
          for (let dx = 0; dx < 2; dx++) {
            const px = mx + dx
            const py = my + dy
            if (px < 0 || py < 0 || px >= w || py >= h) continue
            const c = g[idx(px, py)]
            if (c && c !== SCLERA && c !== OUTLINE && c !== WHITE) {
              g[idx(px, py)] = mix(c, '#ffffff', 0.7)
            }
          }
        }
      }
    }
  }

  /* ---- Mulut bicara pada 2× ---- */
  if (mouth !== 'tutup') drawMouth(g, w, h, hc, spec.mouth, mouth)

  /* ---- Bayangan, lalu kontur luar ---- */
  const shaded = shadeLayer({ width: w, height: h, cells: g })
  const outline = outlineLayer(shaded)
  const cells = shaded.cells.slice()
  for (let i = 0; i < cells.length; i++) if (!cells[i] && outline.cells[i]) cells[i] = outline.cells[i]
  return { width: w, height: h, cells }
}

/* ------------------------------------------------------------------ */
/* Mulut bicara                                                        */
/* ------------------------------------------------------------------ */

function drawMouth(
  g: (string | null)[],
  w: number,
  h: number,
  hc: number,
  baseMouth: string,
  shape: PortraitMouthVariant,
): void {
  const wide = baseMouth === 'senyum' || baseMouth === 'senyum-lebar' ? 2 : baseMouth === 'o' ? -1.5 : 0
  const open = shape === 'buka'
  const rx = (open ? 8 : 7.5) + wide
  const ry = open ? 7.2 : 3.2
  const cx = (CX + 0.5) * 2
  const cy = (hc + 15) * 2 + (open ? 5 : 3)
  const lip = mix(MOUTH, '#000000', 0.4)
  for (let y = Math.floor(cy - ry - 3); y <= Math.ceil(cy + ry + 3); y++) {
    for (let x = Math.floor(cx - rx - 3); x <= Math.ceil(cx + rx + 3); x++) {
      if (x < 0 || y < 0 || x >= w || y >= h) continue
      // sisi atas lebih datar daripada sisi bawah
      const sy = y + 0.5 < cy ? 0.82 : 1
      const e = ((x + 0.5 - cx) / rx) ** 2 + ((y + 0.5 - cy) / (ry * sy)) ** 2
      const eo = ((x + 0.5 - cx) / (rx + 1.6)) ** 2 + ((y + 0.5 - cy) / (ry * sy + 1.6)) ** 2
      if (e <= 1) {
        let col = MOUTH
        const top = cy - ry * 0.82
        if (open && y + 0.5 < top + 4 && e <= 0.85) col = '#fdfaf0'
        else if (open && y + 0.5 > cy + ry * 0.1 && ((x + 0.5 - cx) / (rx * 0.62)) ** 2 + ((y + 0.5 - (cy + ry * 0.62)) / (ry * 0.5)) ** 2 <= 1) col = '#d9707a'
        else if (y + 0.5 < cy - ry * 0.3) col = MOUTH_DARK
        else if (!open && y + 0.5 > cy + 0.5) col = '#b04a54'
        g[y * w + x] = col
      } else if (eo <= 1) {
        g[y * w + x] = lip
      }
    }
  }
}
