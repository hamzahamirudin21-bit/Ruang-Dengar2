import type { StoryExpression } from '../../engine/story/storyTypes'
import { HAIR_COLORS, IDENTITY_COLORS, OUTLINE, SKIN_TONES } from './characterPalette'
import { DOSEN_LOOK } from './dosenLook'
import type { PixelGrid } from './pixelGrid'
import { EXPRESSION_SPECS, PORTRAIT_H, PORTRAIT_W } from './portraitExpressions'
import type { ExpressionSpec } from './portraitExpressions'

const W = PORTRAIT_W
const H = PORTRAIT_H
const CX = 40

/* ---------------- Warna ---------------- */

function rgb(c: string): [number, number, number] {
  const n = parseInt(c.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
function mix(a: string, b: string, t: number): string {
  const [ar, ag, ab] = rgb(a)
  const [br, bg, bb] = rgb(b)
  const f = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')
  return `#${f(ar + (br - ar) * t)}${f(ag + (bg - ag) * t)}${f(ab + (bb - ab) * t)}`
}

const WHITE = '#ffffff'
const SCLERA = '#fbf8f3'
const SCLERA_SHADE = '#d9d3e0'
const MOUTH = '#7a2a30'

/* ---------------- Kanvas piksel ---------------- */

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

  paint(test: Test, fill: Fill): void {
    this.shape(test, fill, false)
  }
}

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

/* ---------------- Potret ---------------- */

/** Potret Dosen BK 80×96 untuk satu ekspresi. Fungsi murni dan deterministik. */
export function composeDosenPortrait(expression: StoryExpression): PixelGrid {
  const spec: ExpressionSpec = EXPRESSION_SPECS[expression] ?? EXPRESSION_SPECS.netral
  const L = DOSEN_LOOK
  const c = new Canvas()

  const skin = SKIN_TONES.find((s) => s.id === L.skinId) ?? SKIN_TONES[1]
  const hairTone = HAIR_COLORS.find((h) => h.id === L.hair.colorId) ?? HAIR_COLORS[1]
  const blazer = IDENTITY_COLORS[L.blazer.color]
  const lapel = L.blazer.lapel
  const batikGold = L.shirt.batik.color
  const shirtBase = L.shirt.base
  const shirtShade = L.shirt.shade

  const hc = 37 + spec.headDy
  const y0 = 62 + spec.shoulderDy
  const hw = 31

  const line = (x0: number, yA: number, x1: number, yB: number, r: number, fill: Fill, outline = false) =>
    c.shape(segTest(x0, yA, x1, yB, r), fill, outline)

  const rxFace = (y: number): number => {
    const dy = y - hc
    if (Math.abs(dy) > 19) return -1
    const base = 16 * Math.sqrt(Math.max(0, 1 - (dy / 19) * (dy / 19)))
    return dy > 0 ? base * (1 - 0.26 * (dy / 19)) : base
  }
  const faceTest: Test = (x, y) => Math.abs(x - CX) <= rxFace(y)

  /* ===== 1. Badan: blazer navy ===== */
  const halfAt = (y: number): number => {
    const t = y - y0
    if (t < 0) return -1
    const k = Math.min(1, t / 15)
    return Math.round(hw * (0.42 + 0.58 * Math.sqrt(k)))
  }
  const armEdge = hw - 10
  c.shape(
    (x, y) => Math.abs(x - CX) <= halfAt(y),
    (x, y) => {
      const dx = x - CX
      const edge = halfAt(y) - Math.abs(dx)
      let col = blazer.base
      if (dx > 8) col = mix(blazer.base, blazer.shade, 0.35)
      if (dx > 0 && edge <= 2) col = blazer.shade
      else if (dx < 0 && edge <= 1) col = blazer.light
      if (y - y0 <= 2 && dx < 0) col = blazer.light
      if (Math.abs(dx) === armEdge && y - y0 >= 14) col = blazer.shade
      // tekstur kain halus
      if (Math.abs(dx) > armEdge + 1 && (x + y) % 5 === 0) col = mix(col, blazer.light, 0.18)
      return col
    },
  )

  /* ===== 2. Kemeja batik parang di celah blazer ===== */
  const openTop = y0 - 2
  const openLen = 30
  const openHalf = (y: number): number => (y < openTop ? -1 : 5 + 13 * (1 - (y - openTop) / openLen))
  const batik = (x: number, y: number): string => {
    // parang: pita diagonal dengan "kait" emas, tiap pita bergeser agar terbaca sebagai motif
    const d = (((x - y) % 10) + 10) % 10
    const s = (((x + y) % 8) + 8) % 8
    let col = shirtBase
    if (d <= 1) col = batikGold
    else if (d === 2) col = shirtShade
    else if (d === 5 && s <= 2) col = mix(batikGold, shirtBase, 0.35)
    else if (d === 6 && s === 3) col = mix(batikGold, shirtBase, 0.5)
    if (x - CX > 3) col = mix(col, shirtShade, 0.3)
    return col
  }
  c.shape((x, y) => y >= openTop && Math.abs(x - CX) <= openHalf(y), batik)

  /* ===== 3. Leher dan V kulit ===== */
  const chinY = hc + 19
  c.shape(
    (x, y) => Math.abs(x - CX) <= 6 && y >= hc + 12 && y < openTop + 1,
    (x, y) => (y <= chinY + 3 || x - CX >= 4 ? skin.shade : skin.base),
  )
  c.paint(
    (x, y) => y >= openTop + 1 && Math.abs(x - CX) <= 7 * (1 - (y - openTop - 1) / 11),
    (x, y) => (y <= chinY + 3 || x - CX >= 3 ? skin.shade : skin.base),
  )
  // kerah kemeja yang berdiri di bawah kerah blazer
  for (const s of [-1, 1]) {
    c.shape(
      segTest(CX + s * 7, openTop - 3, CX + s * 3, openTop + 9, 1.9),
      (x, y) => (s > 0 ? mix(shirtBase, shirtShade, 0.4) : mix(batikGold, shirtBase, 0.55)),
    )
  }

  /* ===== 4. Kerah dan lapel blazer ===== */
  for (const s of [-1, 1]) {
    const col = s < 0 ? lapel : mix(lapel, blazer.shade, 0.35)
    // lapel bawah (garis celah)
    line(CX + s * 19, openTop + 1, CX + s * 6, openTop + openLen, 2.5, col, true)
    // lapel atas bertakik
    line(CX + s * 24, openTop + 5, CX + s * 16, openTop + 15, 2.2, col, true)
    // kerah belakang yang naik di sisi leher
    c.shape(
      (x, y) => ell(x, y, CX + s * 12, openTop - 1, 5, 3.4) <= 1 && y <= openTop + 1,
      col,
    )
    // sorotan tepi
    line(CX + s * 19, openTop + 1, CX + s * 6, openTop + openLen - 2, 0.4, mix(col, WHITE, 0.22))
  }
  // kancing blazer dan saku dada
  c.shape((x, y) => ell(x, y, CX, y0 + 42, 2, 2) <= 1, IDENTITY_COLORS.mustard.shade)
  c.set(CX - 1, y0 + 41, IDENTITY_COLORS.mustard.light)
  // saku dada dengan lipatan
  c.shape(
    (x, y) => x >= CX + 14 && x <= CX + 23 && y >= y0 + 12 && y <= y0 + 14,
    (x, y) => (y === y0 + 12 ? blazer.light : blazer.shade),
  )
  c.paint((x, y) => x >= CX + 16 && x <= CX + 21 && y === y0 + 11, '#efe3c8')

  /* ===== 5. Lanyard dan kartu ===== */
  const strap = L.lanyard.strap
  for (const s of [-1, 1]) {
    line(CX + s * 10, y0 - 3, CX + s * 3.5, y0 + 20, 1.3, s < 0 ? strap : mix(strap, '#000000', 0.2), true)
  }
  c.paint((x, y) => x >= CX - 2 && x <= CX + 2 && y >= y0 + 19 && y <= y0 + 21, '#9aa0aa')
  c.shape(
    (x, y) => x >= CX - 8 && x <= CX + 8 && y >= y0 + 22 && y <= y0 + 41,
    (x, y) => {
      if (y <= y0 + 25) return L.lanyard.card
      if (x >= CX - 6 && x <= CX - 2 && y >= y0 + 28 && y <= y0 + 34) return y <= y0 + 30 ? skin.base : mix(skin.base, '#4a6aa0', 0.5)
      if (x >= CX + 1 && x <= CX + 6 && (y === y0 + 29 || y === y0 + 32 || y === y0 + 35)) return '#8a8f99'
      if (y === y0 + 38 && x >= CX - 6 && x <= CX + 6) return mix(L.lanyard.card, WHITE, 0.2)
      return x - CX > 5 ? '#d8d4c6' : '#faf6ea'
    },
  )
  c.paint((x, y) => Math.abs(x - CX) <= 3 && y === y0 + 23, mix(L.lanyard.card, WHITE, 0.5))

  /* ===== 6. Kepala ===== */
  // Telinga
  for (const s of [-1, 1]) {
    c.shape(
      (x, y) => ell(x, y, CX + s * 17, hc + 4, 2.8, 4.3) <= 1,
      (x, y) => (Math.abs(x - (CX + s * 17.5)) <= 0.6 && y > hc + 2 ? skin.shade : skin.base),
    )
  }

  // Rambut: garis tepi dan belahan samping
  const hairLimit = (x: number): number => {
    const dx = x - CX
    return dx <= 0 ? hc - 12 + -dx * 0.33 : hc - 16 + dx * 0.3
  }

  c.shape(faceTest, (x, y) => {
    const dx = x - CX
    const dy = y - hc
    let col = skin.base
    if (dx > 0 && dx >= rxFace(y) - 3) col = skin.shade
    if (dy >= 17) col = skin.shade
    const lim = hairLimit(x)
    if (y >= lim && y < lim + 2) col = skin.shade
    return col
  })

  // Pipi
  const blush = mix(skin.base, '#e05060', spec.ornament === 'rona' ? 0.5 : 0.2)
  const brx = spec.ornament === 'rona' ? 4 : 3
  for (const s of [-1, 1]) {
    c.paint((x, y) => ell(x, y, CX + s * 11, hc + 11, brx, 2) <= 1 && faceTest(x, y), blush)
  }

  c.set(CX, hc + 9, skin.shade); c.set(CX, hc + 10, skin.shade); c.set(CX + 1, hc + 11, mix(skin.shade, '#000000', 0.2))

  // Mulut. Garis datar dibuat dengan sudut naik agar wajah tetap ramah.
  const my = hc + 15
  const mcol = mix(MOUTH, '#000000', 0.15)
  switch (spec.mouth) {
    case 'datar':
      for (let x = CX - 3; x <= CX + 3; x++) c.set(x, my + 1, mcol)
      c.set(CX - 4, my, mcol); c.set(CX + 4, my, mcol)
      c.set(CX - 5, my - 1, mcol); c.set(CX + 5, my - 1, mcol)
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
      return
    }
    const P = {
      biasa: { rx: 4.7, ry: 5, irx: 3.3, iry: 4.2, idx: 0, idy: 0.5, lid: 0 },
      lebar: { rx: 5, ry: 5.8, irx: 3, iry: 3.6, idx: 0, idy: 0, lid: 0 },
      sipit: { rx: 4.8, ry: 3.6, irx: 3.2, iry: 3.6, idx: 0, idy: 0.4, lid: 1 },
      turun: { rx: 4.7, ry: 4.6, irx: 3.3, iry: 3.8, idx: 0, idy: 1.6, lid: 2 },
      melirik: { rx: 4.7, ry: 5, irx: 3.3, iry: 4.2, idx: 2.2, idy: 0.4, lid: 0 },
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
          if (ell(x, y, icx, icy, 1.7, 2.4) <= 1) col = '#120c0a'
          else if (ie > 0.7) col = '#2b1a12'
          else col = y < icy ? '#5a3a1e' : '#a06c3c'
        }
        c.set(x, y, col)
      }
      if (ytop >= 0) {
        const start = ytop + P.lid
        c.set(x, start - 1, OUTLINE)
        if (P.lid > 0 || (x - cx) * outer > 1) c.set(x, start, OUTLINE)
        if (P.lid >= 2) c.set(x, start + 1, SCLERA_SHADE)
      }
    }
    if (P.lid < 2) {
      for (const [dx, dy] of [[-2, -2], [-1, -2], [-2, -1]]) {
        if (ell(icx + dx, icy + dy, icx, icy, P.irx, P.iry) <= 1) c.set(icx + dx, icy + dy, WHITE)
      }
    }
  }
  drawEye(CX - 9, -1)
  drawEye(CX + 9, 1)

  /* ===== 7. Rambut depan: rapi, belahan samping, sedikit uban ===== */
  const grey = L.hair.grey
  const hairFill = (x: number, y: number): string => {
    const dx = x - CX
    const lim = hairLimit(x)
    const flow = Math.floor(Math.abs(dx) * 0.9 + (hc - y) * 0.35)
    let col = hairTone.base
    if (flow % 3 === 0) col = mix(hairTone.base, hairTone.shade, 0.6)
    const d = Math.hypot((x - (CX - 6)) / 14, (y - (hc - 18)) / 5.5)
    if (d < 0.8 && d > 0.5 && dx < 4 && (x + y) % 2 === 0) col = mix(hairTone.base, WHITE, 0.2)
    if (y >= lim - 1 && y < lim + 1 && y > hc - 12) col = hairTone.shade
    if (dx > 12 && y > hc - 6) col = hairTone.shade
    // belahan samping
    // uban: dominan di pelipis, sedikit di helai atas
    const temple = Math.abs(dx) >= 11 && y >= hc - 9 && y <= hc + 1
    if (temple && Math.floor(Math.abs(dx) * 0.9 + (hc - y) * 0.35) % 2 === 0) col = mix(grey, hairTone.base, 0.25)
    if (y < hc - 14 && (x * 5 + y * 3) % 13 === 0) col = mix(grey, hairTone.base, 0.25)
    return col
  }
  const sideLim = hc + 1
  c.shape(
    (x, y) => {
      const top = ell(x, y, CX, hc - 4, 20.1, 22) <= 1 && y < hairLimit(x)
      const rf = rxFace(y)
      const side = rf > 0 && y >= hc - 9 && y <= sideLim && Math.abs(x - CX) >= rf - 1.5 && Math.abs(x - CX) <= rf + 3
      return top || side
    },
    hairFill,
  )

  /* ===== 8. Alis ===== */
  const browCol = mix(hairTone.base, '#000000', 0.1)
  const browP = {
    datar: { inner: 0, outer: 0, arch: 1 },
    naik: { inner: -3, outer: -3, arch: 2 },
    'turun-luar': { inner: 0, outer: 2, arch: 0.5 },
    'turun-dalam': { inner: 2, outer: -1, arch: 0 },
    cemas: { inner: -2, outer: 1, arch: 1 },
  }[spec.brows]
  const browBase = hc - (spec.eyes === 'lebar' ? 9 : 8)
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

  /* ===== 9. Kacamata berbingkai ===== */
  const fr = L.glasses.frame
  for (const s of [-1, 1]) {
    const ex = CX + s * 9
    const rim = (x: number, y: number) => {
      const e = ell(x, y, ex, eyeCy, 7.4, 6.2)
      return e <= 1 && e > 0.68
    }
    c.paint(rim, (x, y) => (y <= eyeCy - 4 ? fr : mix(fr, '#5a6070', 0.25)))
    // kilau kaca
    c.set(ex - 4, eyeCy - 2, mix(WHITE, '#8fd0f0', 0.45)); c.set(ex - 3, eyeCy - 3, mix(WHITE, '#8fd0f0', 0.45))
    c.set(ex - 4, eyeCy - 1, mix(WHITE, '#8fd0f0', 0.3))
    line(CX + s * 15.5, eyeCy - 2, CX + s * 17.5, hc + 1, 0.5, fr)
  }
  for (let x = CX - 2; x <= CX + 2; x++) c.set(x, eyeCy - 1 + (Math.abs(x - CX) === 2 ? 1 : 0), fr)

  /* ===== 10. Hiasan ekspresi ===== */
  if (spec.ornament === 'keringat') {
    c.shape((x, y) => ell(x, y, CX + 20, hc - 6, 1.6, 2.6) <= 1, '#a9dcf5')
  } else if (spec.ornament === 'helaan') {
    for (let i = 0; i < 3; i++) c.set(CX + 22 + i * 2, hc + 12 - i, '#cfd6e6')
  }

  return { width: W, height: H, cells: c.cells }
}

/**
 * Ekspresi Dosen sebagai respons ringan atas ekspresi mahasiswa. Total untuk
 * semua masukan: `tersenyum`/`lega` dibalas `tersenyum`, `terkejut` dibalas
 * `tertegun`, selebihnya `netral`.
 */
export function dosenExpressionFor(
  studentExpression: StoryExpression | null,
  speaker: 'dosen' | 'mahasiswa' | 'selingan',
): StoryExpression {
  if (speaker !== 'mahasiswa' || studentExpression === null) return 'netral'
  switch (studentExpression) {
    case 'lega':
    case 'tersenyum':
      return 'tersenyum'
    case 'terkejut':
      return 'tertegun'
    default:
      return 'netral'
  }
}
