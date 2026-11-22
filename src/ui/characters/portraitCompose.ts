import type { StoryExpression } from '../../engine/story/storyTypes'
import type { AccessoryId, CharacterAppearance, TopKind } from './appearance'
import { HAIR_COLORS, IDENTITY_COLORS, OUTLINE, SKIN_TONES } from './characterPalette'
import type { IdentityColorId, ToneSet } from './characterPalette'
import type { LayerId, PixelGrid } from './pixelGrid'
import { EXPRESSION_SPECS, PORTRAIT_H, PORTRAIT_W } from './portraitExpressions'
import type { ExpressionSpec } from './portraitExpressions'

const W = PORTRAIT_W
const H = PORTRAIT_H
const CX = 40

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

const WHITE = '#ffffff'
const SCLERA = '#fbf8f3'
const SCLERA_SHADE = '#d9d3e0'
const MOUTH = '#7a2a30'

/* ------------------------------------------------------------------ */
/* Kanvas piksel                                                       */
/* ------------------------------------------------------------------ */

type Fill = string | ((x: number, y: number) => string | null)
type Test = (x: number, y: number) => boolean

class Canvas {
  readonly cells: (string | null)[] = new Array<string | null>(W * H).fill(null)

  set(x: number, y: number, c: string): void {
    const px = Math.round(x)
    const py = Math.round(y)
    if (px < 0 || py < 0 || px >= W || py >= H) return
    this.cells[py * W + px] = c
  }

  /** Menggambar bentuk beserta kontur 1 sel di tepi luarnya. */
  shape(test: Test, fill: Fill, outline = true): void {
    const m = new Uint8Array(W * H)
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (test(x, y)) m[y * W + x] = 1
    if (outline) {
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          if (!m[y * W + x]) continue
          if (x > 0 && !m[y * W + x - 1]) this.set(x - 1, y, OUTLINE)
          if (x < W - 1 && !m[y * W + x + 1]) this.set(x + 1, y, OUTLINE)
          if (y > 0 && !m[(y - 1) * W + x]) this.set(x, y - 1, OUTLINE)
          if (y < H - 1 && !m[(y + 1) * W + x]) this.set(x, y + 1, OUTLINE)
        }
      }
    }
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        if (!m[y * W + x]) continue
        const c = typeof fill === 'string' ? fill : fill(x, y)
        if (c) this.cells[y * W + x] = c
      }
    }
  }

  /** Piksel tanpa kontur. */
  paint(test: Test, fill: Fill): void {
    this.shape(test, fill, false)
  }
}

/** Nilai persamaan elips (<= 1 berarti di dalam). */
function ell(x: number, y: number, cx: number, cy: number, rx: number, ry: number): number {
  const dx = (x - cx) / rx
  const dy = (y - cy) / ry
  return dx * dx + dy * dy
}

function segTest(x0: number, y0: number, x1: number, y1: number, r: number): Test {
  const vx = x1 - x0
  const vy = y1 - y0
  const len2 = vx * vx + vy * vy || 1
  return (x, y) => {
    const t = Math.max(0, Math.min(1, ((x - x0) * vx + (y - y0) * vy) / len2))
    const px = x0 + vx * t
    const py = y0 + vy * t
    return (x - px) * (x - px) + (y - py) * (y - py) <= r * r
  }
}

function toneOf(id: IdentityColorId): ToneSet {
  return IDENTITY_COLORS[id] ?? IDENTITY_COLORS.navy
}

/** Warna kontras untuk tali dan tas terhadap warna baju. */
function contrastTone(top: IdentityColorId): ToneSet {
  return top === 'navy' || top === 'maroon' || top === 'teal' || top === 'ungu'
    ? IDENTITY_COLORS.mustard
    : IDENTITY_COLORS.navy
}

/* ------------------------------------------------------------------ */
/* Konfigurasi tubuh dan leher                                         */
/* ------------------------------------------------------------------ */

const BODY_HW = { ramping: 26, sedang: 29, tegap: 33 } as const

const NECK: Record<TopKind, { r: number; d: number; v: boolean }> = {
  kemeja: { r: 8, d: 9, v: true },
  kaus: { r: 8, d: 5, v: false },
  hoodie: { r: 9, d: 4, v: false },
  jaket: { r: 9, d: 12, v: true },
  rompi: { r: 8, d: 10, v: true },
  apron: { r: 8, d: 5, v: false },
  cardigan: { r: 8, d: 13, v: true },
  tunik: { r: 9, d: 6, v: false },
  blus: { r: 7, d: 6, v: true },
  sweater: { r: 7, d: 3, v: false },
}

/* ------------------------------------------------------------------ */
/* Penyusun potret                                                     */
/* ------------------------------------------------------------------ */

export function portraitLayerIds(): readonly LayerId[] {
  return ['tubuh', 'pakaian', 'aksesori']
}

export function composePortrait(a: CharacterAppearance, expression: StoryExpression): PixelGrid {
  const spec: ExpressionSpec = EXPRESSION_SPECS[expression] ?? EXPRESSION_SPECS.netral
  const c = new Canvas()
  const has = (id: AccessoryId) => a.accessories.includes(id)

  const skin = SKIN_TONES.find((s) => s.id === a.body.skinId) ?? SKIN_TONES[1]
  const hairTone = HAIR_COLORS.find((h) => h.id === a.hair.colorId) ?? HAIR_COLORS[0]
  const hairLight = mix(hairTone.base, WHITE, 0.24)
  const top = toneOf(a.outfit.topColor)
  const accent = a.outfit.topAccent ? toneOf(a.outfit.topAccent) : null
  const contrast = contrastTone(a.outfit.topColor)
  const kerudung = a.hair.kind === 'kerudung' || has('hijab')
  const kind = a.outfit.top

  const hd = spec.headDy
  const hc = 37 + hd // pusat kepala
  const hw = BODY_HW[a.body.type] ?? 29
  const y0 = 62 + spec.shoulderDy // garis bahu
  const rxFace = (y: number): number => {
    const dy = y - hc
    if (Math.abs(dy) > 19) return -1
    const base = 16 * Math.sqrt(Math.max(0, 1 - (dy / 19) * (dy / 19)))
    return dy > 0 ? base * (1 - 0.26 * (dy / 19)) : base
  }
  const faceTest: Test = (x, y) => Math.abs(x - CX) <= rxFace(y)

  const halfAt = (y: number): number => {
    const t = y - y0
    if (t < 0) return -1
    const k = Math.min(1, t / 15)
    return Math.round(hw * (0.42 + 0.58 * Math.sqrt(k)))
  }
  const torsoTest: Test = (x, y) => Math.abs(x - CX) <= halfAt(y)
  const armEdge = hw - 11 // pembatas lengan dan badan

  /* ---------------- Tinggi garis rambut ---------------- */
  const hairLimit = (x: number): number => {
    const dx = x - CX
    switch (a.hair.kind) {
      case 'sedang':
        return hc - 14 + Math.abs(dx) * 0.45 + (Math.abs(dx) % 4 === 3 ? 1 : 0)
      case 'ikat':
        return hc - 15 + Math.abs(dx) * 0.3
      case 'pendek':
      default:
        return (dx <= 0 ? hc - 12 + -dx * 0.35 : hc - 16 + dx * 0.3) + (x % 5 === 0 ? 1 : 0)
    }
  }

  /* ================= 1. Lapisan belakang ================= */
  if (!kerudung) {
    if (a.hair.kind === 'sedang') {
      c.shape(
        (x, y) => ell(x, y, CX, hc, 21.5, 24) <= 1 || (Math.abs(x - CX) <= 21 && y >= hc && y <= y0 + 8),
        (x, y) => ((Math.abs(x - CX) + (y >> 1)) % 4 === 0 ? mix(hairTone.shade, '#000000', 0.2) : hairTone.shade),
      )
    } else if (a.hair.kind === 'ikat') {
      const tie = contrast.base
      c.shape(
        (x, y) => ell(x, y, CX + 24, hc + 6, 6.5, 16) <= 1,
        (x, y) => ((x + (y >> 1)) % 4 === 0 ? hairTone.shade : hairTone.base),
      )
      c.shape((x, y) => Math.abs(x - (CX + 21)) <= 2.5 && Math.abs(y - (hc - 6)) <= 2.5, tie)
    }
  }
  if (kind === 'hoodie') {
    c.shape((x, y) => ell(x, y, CX, y0 - 1, 21, 11) <= 1 && y <= y0 + 4, top.shade)
  }
  if (has('ransel')) {
    for (const s of [-1, 1]) {
      c.shape((x, y) => ell(x, y, CX + s * (hw - 1), y0 + 5, 6, 8) <= 1, contrast.shade)
    }
  }

  /* ================= 2. Badan ================= */
  const sleeveTone: ToneSet =
    kind === 'apron' ? IDENTITY_COLORS.krem
      : kind === 'rompi' ? (a.outfit.topColor === 'krem' ? IDENTITY_COLORS.teal : IDENTITY_COLORS.krem)
        : top
  const bodyTone: ToneSet = kind === 'apron' ? IDENTITY_COLORS.krem : top
  const knit = kind === 'cardigan' || kind === 'sweater'

  c.shape(torsoTest, (x, y) => {
    const dx = x - CX
    const t = y - y0
    const edge = halfAt(y) - Math.abs(dx)
    const arm = Math.abs(dx) > armEdge
    const tone = arm ? sleeveTone : bodyTone
    let col = tone.base
    if (!arm && dx > 6) col = mix(tone.base, tone.shade, 0.28)
    if (dx > 0 && edge <= 2) col = tone.shade
    else if (dx < 0 && edge <= 1) col = tone.light
    if (t <= 2 && dx < 0) col = tone.light
    if (Math.abs(dx) === armEdge && t >= 14) col = tone.shade
    if (arm && dx > 0 && t > 10 && edge <= 5) col = mix(tone.base, tone.shade, 0.55)
    if (knit && (x + (y >> 1)) % 3 === 0) col = mix(col, tone.shade, 0.35)
    return col
  })

  /* ---------- Leher dan lubang kerah ---------- */
  const nk = NECK[kind] ?? NECK.kaus
  const neckY = (x: number): number => {
    const d = Math.abs(x - CX)
    if (d > nk.r) return y0
    return nk.v
      ? y0 + Math.round(nk.d * (1 - d / nk.r))
      : y0 + Math.round(nk.d * Math.sqrt(1 - (d / nk.r) * (d / nk.r)))
  }
  const chinY = hc + 19
  if (!kerudung) {
    c.shape(
      (x, y) =>
        (Math.abs(x - CX) <= 6 && y >= hc + 12 && y < y0) || (Math.abs(x - CX) <= nk.r && y >= y0 && y < neckY(x)),
      (x, y) => (y <= chinY + 3 || x - CX >= 4 ? skin.shade : skin.base),
    )
  }

  /* ---------- Rincian pakaian ---------- */
  const line = (x0: number, yA: number, x1: number, yB: number, r: number, fill: Fill, outline = false) =>
    c.shape(segTest(x0, yA, x1, yB, r), fill, outline)
  const dot = (x: number, y: number, col: string) => c.set(x, y, col)
  const ring = (col: ToneSet, thick: number) => {
    for (let x = CX - nk.r; x <= CX + nk.r; x++) {
      const yy = neckY(x)
      for (let k = 0; k < thick; k++) dot(x, yy + 1 + k, k === 0 ? col.light : col.shade)
    }
  }
  const buttons = (xx: number, ys: number[], col: string) => ys.forEach((yy) => dot(xx, yy, col))

  switch (kind) {
    case 'kemeja': {
      line(CX - 1, y0 + 9, CX - 11, y0 - 2, 2.2, top.light, true)
      line(CX + 1, y0 + 9, CX + 11, y0 - 2, 2.2, top.light, true)
      line(CX, y0 + 10, CX, H, 0.5, top.shade)
      buttons(CX, [y0 + 14, y0 + 21, y0 + 28], top.light)
      c.shape((x, y) => x >= CX - 21 && x <= CX - 11 && y >= y0 + 14 && y <= y0 + 22, (x, y) => (y === y0 + 14 ? top.light : top.base))
      break
    }
    case 'kaus': {
      ring(top, 2)
      c.shape((x, y) => Math.abs(x - (CX - 14)) + Math.abs(y - (y0 + 20)) <= 4, top.light, false)
      break
    }
    case 'hoodie': {
      ring(top, 3)
      line(CX - 4, y0 + 5, CX - 5, y0 + 15, 0.6, top.light)
      line(CX + 4, y0 + 5, CX + 5, y0 + 15, 0.6, top.light)
      dot(CX - 5, y0 + 16, top.light); dot(CX + 5, y0 + 16, top.light)
      c.shape((x, y) => y >= y0 + 24 && Math.abs(x - CX) <= 15 - Math.floor((y - y0 - 24) / 6), (x, y) => (y === y0 + 24 ? top.light : top.shade), true)
      line(CX, y0 + 24, CX, H, 0.5, mix(top.shade, '#000000', 0.3))
      break
    }
    case 'jaket': {
      const inner = accent ?? IDENTITY_COLORS.krem
      c.paint((x, y) => Math.abs(x - CX) <= 4 && y > neckY(x), (x) => (Math.abs(x - CX) === 4 ? inner.shade : inner.base))
      line(CX - 4, y0 + 12, CX - 12, y0 - 1, 2.2, top.light, true)
      line(CX + 4, y0 + 12, CX + 12, y0 - 1, 2.2, top.light, true)
      line(CX - 5, y0 + 12, CX - 5, H, 0.5, top.shade)
      line(CX + 5, y0 + 12, CX + 5, H, 0.5, top.shade)
      dot(CX + 5, y0 + 15, IDENTITY_COLORS.krem.light); dot(CX + 5, y0 + 16, IDENTITY_COLORS.krem.base)
      if (a.outfit.topAccent) {
        const ac = toneOf(a.outfit.topAccent)
        for (const s of [-1, 1]) line(CX + s * (hw - 5), y0 + 6, CX + s * (hw - 5), H, 1.1, ac.base)
        line(CX - 10, y0 + 14, CX - 10, y0 + 14, 0.5, ac.base)
      }
      break
    }
    case 'rompi': {
      const silver = '#e9e6c9'
      for (const s of [-1, 1]) line(CX + s * 7, y0 + 4, CX + s * 7, H, 1, silver)
      c.paint((x, y) => Math.abs(x - CX) <= armEdge && (y === y0 + 17 || y === y0 + 18 || y === y0 + 28 || y === y0 + 29), silver)
      line(CX, y0 + 11, CX, H, 0.5, top.shade)
      line(CX - 1, y0 + 9, CX - 10, y0 - 2, 2, sleeveTone.light, true)
      line(CX + 1, y0 + 9, CX + 10, y0 - 2, 2, sleeveTone.light, true)
      break
    }
    case 'apron': {
      ring(IDENTITY_COLORS.krem, 2)
      c.shape(
        (x, y) => y >= y0 + 10 && Math.abs(x - CX) <= hw - 12,
        (x, y) => (x - CX > 6 ? top.shade : y === y0 + 10 ? top.light : top.base),
      )
      line(CX - 9, y0 + 10, CX - 6, y0 + 1, 1.1, top.base, true)
      line(CX + 9, y0 + 10, CX + 6, y0 + 1, 1.1, top.base, true)
      c.shape((x, y) => Math.abs(x - CX) <= 8 && y >= y0 + 24 && y <= y0 + 31, (x, y) => (y === y0 + 24 ? top.light : top.shade), true)
      dot(CX - 9, y0 + 16, top.light); dot(CX + 4, y0 + 20, top.light); dot(CX - 3, y0 + 14, top.light)
      break
    }
    case 'cardigan': {
      const inner = accent ?? IDENTITY_COLORS.krem
      c.paint((x, y) => Math.abs(x - CX) <= 6 && y > neckY(x), (x, y) => (Math.abs(x - CX) === 6 ? top.light : (y >> 2) % 2 ? inner.base : inner.light))
      line(CX - 6, y0 + 13, CX - 6, H, 0.5, top.light)
      line(CX + 6, y0 + 13, CX + 6, H, 0.5, top.light)
      buttons(CX + 8, [y0 + 18, y0 + 25, y0 + 32], top.light)
      for (const s of [-1, 1]) c.paint((x, y) => y >= H - 6 && torsoTest(x, y) && Math.abs(x - CX) > armEdge && Math.sign(x - CX) === s, (x) => (x % 2 ? top.light : top.shade))
      break
    }
    case 'tunik': {
      ring(top, 2)
      line(CX, y0 + 7, CX, y0 + 20, 0.5, top.light)
      buttons(CX, [y0 + 9, y0 + 14, y0 + 19], top.light)
      c.paint((x, y) => torsoTest(x, y) && (y === y0 + 26 || y === y0 + 27), (x, y) => (y === y0 + 26 ? top.light : top.shade))
      for (let x = CX - hw + 3; x < CX + hw - 2; x += 4) dot(x, y0 + 29, top.light)
      break
    }
    case 'blus': {
      for (const s of [-1, 1]) {
        c.shape((x, y) => ell(x, y, CX + s * 6, y0 + 2, 5.2, 4) <= 1, (x, y) => (y > y0 + 3 ? top.light : mix(top.light, WHITE, 0.3)))
      }
      c.shape((x, y) => Math.abs(x - CX) <= 1.6 && Math.abs(y - (y0 + 5)) <= 1.6, top.shade)
      for (let y = y0 + 10; y < H; y += 3) dot(CX + 5, y, top.light)
      break
    }
    case 'sweater': {
      c.shape(
        (x, y) => Math.abs(x - CX) <= 10 && y >= y0 - 5 && y <= y0 + 3,
        (x, y) => ((x + (y > y0 - 3 ? 0 : 1)) % 2 === 0 ? top.light : top.base),
      )
      for (const s of [-1, 1]) c.paint((x, y) => y >= H - 6 && torsoTest(x, y) && Math.abs(x - CX) > armEdge && Math.sign(x - CX) === s, (x) => (x % 2 ? top.light : top.shade))
      break
    }
  }

  /* ---------- Aksesori badan ---------- */
  if (has('ransel')) {
    for (const s of [-1, 1]) {
      line(CX + s * 8, y0 + 1, CX + s * (hw - 9), y0 + 18, 2.1, contrast.base, true)
      line(CX + s * (hw - 9), y0 + 18, CX + s * (hw - 9), H, 2.1, contrast.base, true)
      dot(CX + s * (hw - 9), y0 + 14, contrast.light); dot(CX + s * (hw - 9), y0 + 24, contrast.light)
    }
  }
  if (has('selempang')) {
    line(CX - 12, y0 + 1, CX + hw - 5, H, 2.4, contrast.base, true)
    line(CX - 12, y0 + 1, CX + hw - 5, H, 0.5, contrast.light)
    c.shape((x, y) => x >= CX + hw - 17 && x <= CX + hw - 2 && y >= H - 17, (x, y) => (y < H - 14 ? contrast.light : contrast.shade), true)
  }
  if (has('id-card')) {
    const lan = IDENTITY_COLORS.maroon
    line(CX - 8, y0 + 1, CX - 1, y0 + 20, 1.1, lan.base)
    line(CX + 8, y0 + 1, CX + 1, y0 + 20, 1.1, lan.base)
    c.shape(
      (x, y) => x >= CX - 5 && x <= CX + 5 && y >= y0 + 20 && y <= y0 + 32,
      (x, y) => {
        if (y <= y0 + 22) return IDENTITY_COLORS.teal.base
        if (x >= CX - 3 && x <= CX - 1 && y >= y0 + 24 && y <= y0 + 27) return skin.base
        if (y === y0 + 24 && x >= CX + 1) return '#8a8f99'
        if (y === y0 + 26 && x >= CX + 1) return '#8a8f99'
        if (y === y0 + 29) return '#8a8f99'
        return IDENTITY_COLORS.krem.light
      },
    )
  }
  if (has('pulpen')) {
    line(CX + 11, y0 + 4, CX + 11, y0 + 12, 0.6, IDENTITY_COLORS.navy.base, true)
    dot(CX + 11, y0 + 4, IDENTITY_COLORS.mustard.light)
  }

  /* ---------- Tangan dan benda pegangan ---------- */
  const hand = (cx: number, cy: number, col = skin.base, shade = skin.shade) =>
    c.shape((x, y) => ell(x, y, cx, cy, 5, 4.2) <= 1, (x, y) => (y > cy + 1 || x > cx + 3 ? shade : col))
  const LX = CX - (hw - 5)
  const RX = CX + (hw - 5)

  if (has('sarung-tangan')) {
    for (const hx of [LX, RX]) {
      c.shape((x, y) => ell(x, y, hx, H - 3, 5.5, 5) <= 1, (x, y) => (y < H - 7 ? '#8c5a1c' : y > H - 3 ? '#a96f27' : '#c98a2c'))
      c.paint((x, y) => Math.abs(x - hx) <= 5 && y === H - 8, '#5a3a14')
    }
  }
  if (has('jam-tangan') || has('gelang-karet')) {
    c.shape((x, y) => Math.abs(x - LX) <= 3 && y >= H - 12 && y <= H - 6, (x, y) => (y >= H - 9 && y <= H - 8 ? skin.shade : skin.base))
    hand(LX, H - 3)
    if (has('jam-tangan')) {
      c.paint((x, y) => Math.abs(x - LX) <= 3 && y >= H - 11 && y <= H - 9, '#2b2b2f')
      c.paint((x, y) => Math.abs(x - LX) <= 1 && y === H - 10, IDENTITY_COLORS.krem.light)
    } else {
      c.paint((x, y) => Math.abs(x - LX) <= 3 && y >= H - 11 && y <= H - 10, IDENTITY_COLORS.oranye.base)
    }
  }
  if (has('kain-bersih')) {
    c.shape(
      (x, y) => x >= CX - 24 && x <= CX - 10 && y >= H - 22 && y <= H - 4 - (x - CX + 24 > 8 ? 2 : 0),
      (x, y) => (x - CX + 24 > 10 ? IDENTITY_COLORS.krem.shade : (y + x) % 7 === 0 ? IDENTITY_COLORS.krem.shade : IDENTITY_COLORS.krem.base),
    )
    dot(CX - 18, H - 12, '#6b5b3a'); dot(CX - 17, H - 11, '#6b5b3a'); dot(CX - 19, H - 10, '#6b5b3a')
    hand(CX - 17, H - 3)
  }
  if (has('buku')) {
    const cover = a.outfit.topColor === 'maroon' ? IDENTITY_COLORS.teal : IDENTITY_COLORS.maroon
    c.shape(
      (x, y) => x >= CX - 25 && x <= CX - 4 && y >= H - 22,
      (x, y) => {
        if (x >= CX - 6) return IDENTITY_COLORS.krem.base
        if (x <= CX - 23) return cover.shade
        return y === H - 22 ? cover.light : cover.base
      },
    )
    c.paint((x, y) => x >= CX - 19 && x <= CX - 10 && (y === H - 17 || y === H - 15), cover.light)
    hand(CX - 8, H - 3)
  }
  if (has('laptop-dipeluk')) {
    c.shape(
      (x, y) => x >= CX - 20 && x <= CX + 20 && y >= H - 20,
      (x, y) => (y === H - 20 ? '#cfd3d9' : x > CX + 14 ? '#7e848d' : '#a3a9b2'),
    )
    c.shape((x, y) => ell(x, y, CX, H - 11, 3.4, 3.4) <= 1, (x, y) => (y < H - 11 ? contrast.light : contrast.base), false)
    hand(CX - 19, H - 6); hand(CX + 19, H - 6)
  }
  if (has('kertas')) {
    c.shape(
      (x, y) => x >= CX + 7 && x <= CX + 24 && y >= H - 24,
      (x, y) => {
        if (y === H - 24) return '#8a8f99'
        if ((x === CX + 10 || (y - (H - 24)) % 4 === 0) && x > CX + 9 && x < CX + 22) return '#aab0bb'
        return '#fbfaf3'
      },
    )
    c.shape((x, y) => x >= CX + 13 && x <= CX + 18 && y >= H - 26 && y <= H - 24, '#6b6f78')
    hand(CX + 9, H - 3)
  }
  if (has('botol')) {
    c.shape(
      (x, y) => x >= CX + 12 && x <= CX + 22 && y >= H - 26 && (y > H - 22 || (x >= CX + 15 && x <= CX + 19)),
      (x, y) => {
        if (y <= H - 24) return IDENTITY_COLORS.krem.light
        if (x >= CX + 20) return IDENTITY_COLORS.teal.shade
        if (x === CX + 13 && y > H - 18) return '#c9efee'
        return y > H - 12 ? IDENTITY_COLORS.teal.base : IDENTITY_COLORS.teal.light
      },
    )
    hand(CX + 17, H - 3)
  }
  if (has('ponsel')) {
    c.shape(
      (x, y) => x >= CX + 12 && x <= CX + 22 && y >= H - 24,
      (x, y) => (x === CX + 12 || x === CX + 22 || y === H - 24 ? '#2b2d36' : y > H - 20 && x > CX + 14 ? '#8fd0f0' : '#6aa8d6'),
    )
    c.paint((x, y) => x === CX + 14 && y > H - 22 && y < H - 16, '#d9f1fb')
    hand(CX + 17, H - 3)
  }
  if (has('lengan-panjang')) {
    for (const s of [-1, 1]) {
      c.paint(
        (x, y) => y >= H - 11 && y <= H - 9 && torsoTest(x, y) && Math.abs(x - CX) > armEdge && Math.sign(x - CX) === s,
        (x, y) => (y === H - 11 ? sleeveTone.light : sleeveTone.shade),
      )
    }
  }

  /* ================= 3. Kepala ================= */
  // Telinga
  for (const s of [-1, 1]) {
    c.shape((x, y) => ell(x, y, CX + s * 17, hc + 4, 2.8, 4.3) <= 1, (x, y) => (Math.abs(x - (CX + s * 17.5)) <= 0.6 && y > hc + 2 ? skin.shade : skin.base))
  }

  // Wajah
  const openE = (x: number, y: number) => ell(x, y, CX, hc + 3, 14.5, 17.5)
  c.shape(faceTest, (x, y) => {
    const dx = x - CX
    const dy = y - hc
    let col = skin.base
    if (dx > 0 && dx >= rxFace(y) - 3) col = skin.shade
    if (dy >= 17) col = skin.shade
    if (kerudung) {
      if (openE(x, y) > 0.8) col = skin.shade
    } else {
      const lim = hairLimit(x)
      if (y >= lim && y < lim + 2) col = skin.shade
    }
    return col
  })

  // Pipi merona
  const blush = mix(skin.base, '#e05060', spec.ornament === 'rona' ? 0.5 : 0.22)
  const brx = spec.ornament === 'rona' ? 4 : 3
  for (const s of [-1, 1]) {
    c.paint((x, y) => ell(x, y, CX + s * 11, hc + 11, brx, 2) <= 1 && faceTest(x, y), blush)
  }

  // Hidung
  c.set(CX, hc + 9, skin.shade); c.set(CX, hc + 10, skin.shade); c.set(CX + 1, hc + 11, mix(skin.shade, '#000000', 0.2))

  // Mulut
  const my = hc + 15
  const mcol = mix(MOUTH, '#000000', 0.15)
  switch (spec.mouth) {
    case 'datar':
      for (let x = CX - 3; x <= CX + 3; x++) c.set(x, my, mcol)
      c.set(CX - 4, my - 1, mcol); c.set(CX + 4, my - 1, mcol)
      break
    case 'senyum':
      for (let dx = -4; dx <= 4; dx++) c.set(CX + dx, my + Math.round(1.8 * (1 - (dx / 4.5) ** 2)), mcol)
      c.set(CX - 5, my - 1, mcol); c.set(CX + 5, my - 1, mcol)
      break
    case 'senyum-lebar':
      c.shape(
        (x, y) => y >= my - 1 && ell(x, y, CX, my - 1, 6.2, 5.6) <= 1,
        (x, y) => (y <= my ? '#fdfaf0' : y >= my + 3 ? '#d9707a' : MOUTH),
      )
      break
    case 'turun':
      for (let dx = -4; dx <= 4; dx++) c.set(CX + dx, my + 1 + Math.round(2 * (dx / 4.5) ** 2) - 2, mcol)
      c.set(CX - 5, my + 1, mcol); c.set(CX + 5, my + 1, mcol)
      break
    case 'o':
      c.shape((x, y) => ell(x, y, CX, my + 1, 2.6, 3.4) <= 1, (x, y) => (y > my + 2 ? '#d9707a' : MOUTH))
      break
    case 'garis-miring':
      for (let dx = -4; dx <= 4; dx++) c.set(CX + dx, my + 1 - Math.round(dx * 0.35), mcol)
      break
  }

  // Mata
  const eyeCy = hc + 3
  const drawEye = (cx: number, outer: number) => {
    if (spec.eyes === 'tertutup') {
      for (let dx = -4; dx <= 4; dx++) {
        const yy = eyeCy + 1 + Math.round(1.8 * (1 - (dx / 4.5) ** 2))
        c.set(cx + dx, yy, OUTLINE); c.set(cx + dx, yy + 1, OUTLINE)
      }
      c.set(cx + outer * 5, eyeCy + 1, OUTLINE); c.set(cx + outer * 5, eyeCy, OUTLINE)
      c.set(cx + outer * 6, eyeCy - 1, OUTLINE)
      return
    }
    const P = {
      biasa: { rx: 4.7, ry: 5.4, irx: 3.4, iry: 4.4, idx: 0, idy: 0.6, lid: 0 },
      lebar: { rx: 5.1, ry: 6.3, irx: 3, iry: 3.7, idx: 0, idy: 0, lid: 0 },
      sipit: { rx: 4.8, ry: 3.6, irx: 3.2, iry: 3.6, idx: 0, idy: 0.4, lid: 1 },
      turun: { rx: 4.7, ry: 4.6, irx: 3.3, iry: 3.8, idx: 0, idy: 1.6, lid: 2 },
      melirik: { rx: 4.7, ry: 5.4, irx: 3.3, iry: 4.3, idx: 2.2, idy: 0.4, lid: 0 },
    }[spec.eyes]
    const icx = cx + P.idx
    const icy = eyeCy + P.idy
    for (let x = cx - 7; x <= cx + 7; x++) {
      let ytop = -1
      for (let y = eyeCy - 9; y <= eyeCy + 9; y++) {
        if (ell(x, y, cx, eyeCy, P.rx, P.ry) > 1) continue
        if (ytop < 0) ytop = y
        if (y < ytop + P.lid) continue
        const ie = ell(x, y, icx, icy, P.irx, P.iry)
        let col: string = y === ytop + P.lid ? SCLERA_SHADE : SCLERA
        if (ie <= 1) {
          if (ell(x, y, icx, icy, 1.7, 2.5) <= 1) col = '#120c0a'
          else if (ie > 0.7) col = '#2b1a12'
          else col = y < icy ? '#6b4423' : '#b07a45'
        }
        c.set(x, y, col)
      }
      if (ytop >= 0) {
        const start = ytop + P.lid
        c.set(x, start - 1, OUTLINE)
        if (P.lid > 0 || Math.abs(x - (cx + outer * 3)) <= 2 || (x - cx) * outer > 1) c.set(x, start, OUTLINE)
        if (P.lid >= 2) c.set(x, start + 1, SCLERA_SHADE)
      }
    }
    // kilau dan bulu mata luar
    if (P.lid < 2) {
      for (const [dx, dy] of [[-2, -2], [-1, -2], [-2, -1], [-1, -1]]) {
        if (ell(icx + dx, icy + dy, icx, icy, P.irx, P.iry) <= 1) c.set(icx + dx, icy + dy, WHITE)
      }
      c.set(icx + 1, icy + 2, mix('#b07a45', WHITE, 0.7))
    }
    c.set(cx + outer * 5, eyeCy - P.ry + P.lid - 1, OUTLINE)
    c.set(cx + outer * 6, eyeCy - P.ry + P.lid - 2, OUTLINE)
  }
  drawEye(CX - 9, -1)
  drawEye(CX + 9, 1)

  /* ================= 4. Rambut depan atau hijab ================= */
  const hairFill = (x: number, y: number): string => {
    const dx = x - CX
    const lim = hairLimit(x)
    const flow = Math.floor(Math.abs(dx) * 0.9 + (hc - y) * 0.35)
    let col = hairTone.base
    if (flow % 3 === 0) col = mix(hairTone.base, hairTone.shade, 0.6)
    const d = Math.hypot((x - (CX - 6)) / 14, (y - (hc - 18)) / 5.5)
    if (d > 0.45 && d < 0.95 && dx < 8) col = hairLight
    if (y >= lim - 1 && y < lim + 1 && y > hc - 12) col = hairTone.shade
    if (dx > 12 && y > hc - 6) col = hairTone.shade
    return col
  }

  if (kerudung) {
    const hij = toneOf(a.outfit.bottomColor)
    const outer: Test = (x, y) =>
      ell(x, y, CX, hc - 1, 21.5, 25) <= 1 ||
      (y >= hc + 10 && y <= y0 + 15 - Math.floor(Math.abs(x - CX) / 6) && Math.abs(x - CX) <= Math.min(31, 17 + (y - hc - 10) * 0.6))
    c.shape(
      (x, y) => outer(x, y) && openE(x, y) > 1,
      (x, y) => {
        let col = hij.base
        if (openE(x, y) < 1.3) col = hij.shade
        else if ((Math.floor(x * 0.55 + y) % 7 + 7) % 7 === 0) col = mix(hij.base, hij.shade, 0.7)
        if (Math.hypot((x - (CX - 8)) / 12, (y - (hc - 20)) / 5) < 0.9 && openE(x, y) > 1.4) col = hij.light
        if (y > hc + 21 && x > CX + 6) col = mix(col, hij.shade, 0.5)
        return col
      },
    )
  } else {
    const lim = a.hair.kind === 'sedang' ? hc + 17 : a.hair.kind === 'ikat' ? hc - 1 : hc + 1
    const thick = a.hair.kind === 'sedang' ? 5 : a.hair.kind === 'ikat' ? 2.5 : 3
    const bumps = a.hair.kind === 'pendek' ? (x: number) => ((x % 6) === 0 ? 1.5 : 0) : () => 0
    c.shape(
      (x, y) => {
        const ellTop = ell(x, y, CX, hc - 4, 20 + 0.1, 22 + bumps(x)) <= 1 && y < hairLimit(x)
        const rf = rxFace(y)
        const side = rf > 0 && y >= hc - 9 && y <= lim && Math.abs(x - CX) >= rf - 1.5 && Math.abs(x - CX) <= rf + thick
        const sideTaper = a.hair.kind === 'sedang' ? y <= hc + 17 - Math.floor(Math.abs(Math.abs(x - CX) - rf) / 2) : true
        return ellTop || (side && sideTaper)
      },
      hairFill,
    )
  }

  /* ================= 5. Alis ================= */
  const browCol = mix(hairTone.base, '#000000', 0.1)
  const browP = {
    datar: { inner: 0, outer: 0, arch: 1 },
    naik: { inner: -3, outer: -3, arch: 2 },
    'turun-luar': { inner: 0, outer: 2, arch: 0.5 },
    'turun-dalam': { inner: 2, outer: -1, arch: 0 },
    cemas: { inner: -2, outer: 1, arch: 1 },
  }[spec.brows]
  const browBase = hc - (spec.eyes === 'lebar' ? 8 : 7)
  const drawBrow = (cx: number, outer: number) => {
    const xo = cx + outer * 5
    const xi = cx - outer * 4
    const step = xi > xo ? 1 : -1
    for (let x = xo; x !== xi + step; x += step) {
      const t = (x - xo) / (xi - xo)
      const yy = browBase + browP.outer + (browP.inner - browP.outer) * t - browP.arch * Math.sin(Math.PI * t)
      c.set(x, yy, browCol)
      if (t > 0.12 && t < 0.9) c.set(x, yy + 1, browCol)
    }
  }
  drawBrow(CX - 9, -1)
  drawBrow(CX + 9, 1)

  /* ================= 6. Aksesori kepala ================= */
  if (has('kacamata')) {
    const fr = '#2b2f3a'
    for (const s of [-1, 1]) {
      const ex = CX + s * 9
      c.paint((x, y) => ell(x, y, ex, eyeCy, 7.4, 7) <= 1 && ell(x, y, ex, eyeCy, 7.4, 7) > 0.7, fr)
      c.set(ex - 4, eyeCy - 3, mix(WHITE, '#8fd0f0', 0.4)); c.set(ex - 3, eyeCy - 4, mix(WHITE, '#8fd0f0', 0.4))
      line(ex + s * 7, eyeCy - 1, CX + s * 17, hc + 1, 0.5, fr)
    }
    for (let x = CX - 2; x <= CX + 2; x++) c.set(x, eyeCy - 1, fr)
  }
  if (has('topi')) {
    const cap = IDENTITY_COLORS.navy
    c.shape((x, y) => ell(x, y, CX, hc - 9, 19.5, 15) <= 1 && y <= hc - 9, (x, y) => (Math.abs(x - CX) <= 1 && y < hc - 20 ? cap.light : x - CX > 6 ? cap.shade : y < hc - 18 && x < CX ? cap.light : cap.base))
    c.shape((x, y) => ell(x, y, CX, hc - 9, 23, 5) <= 1 && y >= hc - 10, (x, y) => (y >= hc - 7 ? cap.shade : IDENTITY_COLORS.oranye.base))
    c.set(CX, hc - 24, IDENTITY_COLORS.oranye.base)
    line(CX, hc - 24, CX, hc - 12, 0.4, cap.shade)
  }
  if (has('helm-las')) {
    const hel = '#4b4d57'
    c.shape((x, y) => ell(x, y, CX, hc - 10, 21.5, 18) <= 1 && y <= hc - 6, (x, y) => (y >= hc - 9 ? '#2f3036' : Math.hypot((x - (CX - 7)) / 12, (y - (hc - 22)) / 5) < 1 ? '#7d808c' : x - CX > 8 ? '#34353d' : hel))
    for (let x = CX - 20; x <= CX + 20; x += 6) c.paint((xx, yy) => xx >= x && xx < x + 3 && yy >= hc - 9 && yy <= hc - 7, IDENTITY_COLORS.mustard.base)
    c.set(CX - 12, hc - 14, '#a8abb8'); c.set(CX + 12, hc - 14, '#a8abb8')
  }
  if (has('headphone') || has('penutup-telinga')) {
    const muff = has('penutup-telinga')
    const bandCol = muff ? '#c7a9d8' : '#2d2f3a'
    c.shape(
      (x, y) => y <= hc + 1 && ell(x, y, CX, hc - 3, 22.5, 25) <= 1 && ell(x, y, CX, hc - 3, 22.5, 25) >= (muff ? 0.8 : 0.84),
      (x, y) => (x < CX - 4 && y < hc - 12 ? mix(bandCol, WHITE, 0.3) : bandCol),
    )
    for (const s of [-1, 1]) {
      const cxp = CX + s * 22
      if (muff) {
        c.shape((x, y) => ell(x, y, cxp, hc + 4, 7, 9) <= 1, (x, y) => ((x * 3 + y * 2) % 5 === 0 ? '#d9b3c8' : (s < 0 ? x < cxp - 2 : x < cxp + 2) && y < hc + 2 ? '#fbe8f1' : '#f3d9e6'))
      } else {
        c.shape((x, y) => ell(x, y, cxp, hc + 4, 5.4, 8.5) <= 1, (x, y) => (ell(x, y, cxp, hc + 4, 3, 5.5) <= 1 ? '#454a5e' : '#2a2c36'))
        c.set(cxp - s, hc + 1, '#8da0d8'); c.set(cxp - s, hc + 2, '#8da0d8')
      }
    }
  }

  /* ================= 7. Ornamen ekspresi ================= */
  if (spec.ornament === 'keringat') {
    const pts: [number, number][] = [[0, 0], [-1, 1], [0, 1], [1, 1], [-1, 2], [0, 2], [1, 2], [-1, 3], [0, 3], [1, 3], [0, 4]]
    c.shape((x, y) => pts.some(([px, py]) => x === CX + 20 + px && y === hc - 17 + py), (x, y) => (x === CX + 19 && y === hc - 15 ? WHITE : '#8fd0f0'))
  } else if (spec.ornament === 'helaan') {
    for (const [px, py, r] of [[CX + 19, hc + 16, 2.2], [CX + 24, hc + 12, 2.8], [CX + 30, hc + 7, 3.4]] as const) {
      c.shape((x, y) => ell(x, y, px, py, r, r) <= 1, '#e8eef5')
    }
  }

  /* ================= Hasil ================= */
  return { width: W, height: H, cells: c.cells.slice() }
}
