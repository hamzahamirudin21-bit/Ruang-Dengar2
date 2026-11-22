/**
 * Renderer karakter anime Visual Novel beresolusi tinggi (420×504, rasio tepat 5:6, latar transparan).
 *
 * Dibangun berdasarkan `REFERENCE_PROFILES` agar seluruh 15 mahasiswa + Ibu Dosen BK tampil
 * semirip mungkin dengan gaya ilustrasi anime kampus referensi:
 * - Proporsi setengah badan anime sejati (kepala ramping, leher & tulang selangka halus, bahu 3/4)
 * - Mata anime berlapis (bulu mata lengkung bertirus, lipatan kelopak, bayangan sklera atas,
 *   gradien iris berkilau + pantulan cahaya bawah, kilau ganda)
 * - Rambut berhelai berlapis & kerudung berlipat lembut dengan pita kilau cahaya
 * - 16 busana, kacamata, headphone, syal, topi bucket, jas lab, almet, dan tas khas tiap tokoh
 * - 11 ekspresi penuh, kedip mata alami, gerak bibir bicara (lip-sync), dan ornamen emosi
 */
import type { StoryExpression } from '../../engine/story/storyTypes'
import type { AppearanceFallback } from './characterArt'
import { EXPRESSION_SPECS } from './portraitExpressions'
import type { ExpressionSpec, PortraitMouthVariant } from './portraitExpressions'
import { getReferenceProfile } from './referenceStyles'
import type { ReferenceCharacterProfile } from './referenceStyles'

export const ILLUSTRATED_W = 420
export const ILLUSTRATED_H = 504

export type PortraitFacing = 'kiri' | 'kanan' | 'depan'

export interface IllustratedPortraitOptions {
  id: string
  expression: StoryExpression
  eyesClosed: boolean
  mouth: PortraitMouthVariant
  facing?: PortraitFacing
  fallback?: AppearanceFallback
}

/* ------------------------------------------------------------------ */
/* Utilitas Warna & Path                                               */
/* ------------------------------------------------------------------ */

function hexToRgb(c: string): [number, number, number] {
  const n = parseInt(c.replace('#', ''), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function rgbToHex(r: number, g: number, b: number): string {
  const cl = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')
  return `#${cl(r)}${cl(g)}${cl(b)}`
}

function mix(a: string, b: string, t: number): string {
  const [ar, ag, ab] = hexToRgb(a)
  const [br, bg, bb] = hexToRgb(b)
  return rgbToHex(ar + (br - ar) * t, ag + (bg - ag) * t, ab + (bb - ab) * t)
}

function rgba(hex: string, alpha: number): string {
  const [r, g, b] = hexToRgb(hex)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function sf(
  ctx: CanvasRenderingContext2D,
  fill: string | CanvasGradient | null,
  stroke: string | null,
  lw = 2.4,
): void {
  if (fill) {
    ctx.fillStyle = fill
    ctx.fill()
  }
  if (stroke) {
    ctx.strokeStyle = stroke
    ctx.lineWidth = lw
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'
    ctx.stroke()
  }
}

function rrect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  const rad = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + rad, y)
  ctx.arcTo(x + w, y, x + w, y + h, rad)
  ctx.arcTo(x + w, y + h, x, y + h, rad)
  ctx.arcTo(x, y + h, x, y, rad)
  ctx.arcTo(x, y, x + w, y, rad)
  ctx.closePath()
}

/* ------------------------------------------------------------------ */
/* Geometri Kepala & Wajah Anime 3/4                                   */
/* ------------------------------------------------------------------ */

interface HeadGeo {
  p: ReferenceCharacterProfile
  spec: ExpressionSpec
  cx: number
  cy: number
  rx: number
  ry: number
  turn: number // -1 (hadap kiri), 0 (depan), +1 (hadap kanan)
  ink: string
}

function traceAnimeFace(ctx: CanvasRenderingContext2D, g: HeadGeo): void {
  const { cx, cy, rx, ry, turn, p } = g
  const chinX = cx + turn * 5.5
  const chinY = cy + ry * 1.04
  const leftW = rx * (turn < 0 ? 0.90 : turn > 0 ? 1.02 : 0.97)
  const rightW = rx * (turn > 0 ? 0.90 : turn < 0 ? 1.02 : 0.97)
  const jawY = cy + ry * 0.56
  const chinPinch = p.feminine ? 0.42 : 0.54

  ctx.beginPath()
  ctx.moveTo(cx, cy - ry * 0.98)
  // Sisi kanan dahi -> pipi -> rahang halus -> dagu runcing anime
  ctx.bezierCurveTo(cx + rightW * 0.78, cy - ry * 0.95, cx + rightW * 1.04, cy - ry * 0.25, cx + rightW * 0.95, cy + ry * 0.24)
  ctx.bezierCurveTo(cx + rightW * 0.86, jawY, chinX + rightW * chinPinch, chinY - ry * 0.12, chinX, chinY)
  // Sisi kiri dagu -> rahang halus -> pipi -> dahi
  ctx.bezierCurveTo(chinX - leftW * chinPinch, chinY - ry * 0.12, cx - leftW * 0.86, jawY, cx - leftW * 0.95, cy + ry * 0.24)
  ctx.bezierCurveTo(cx - leftW * 1.04, cy - ry * 0.25, cx - leftW * 0.78, cy - ry * 0.95, cx, cy - ry * 0.98)
  ctx.closePath()
}

/* ------------------------------------------------------------------ */
/* Mata, Alis, Hidung & Mulut Anime                                    */
/* ------------------------------------------------------------------ */

function drawAnimeEye(
  ctx: CanvasRenderingContext2D,
  g: HeadGeo,
  ex: number,
  ey: number,
  side: -1 | 1,
  closed: boolean,
): void {
  const { p, spec, ink, turn } = g
  const isNear = (turn < 0 && side > 0) || (turn > 0 && side < 0)
  const wScale = turn === 0 ? 1 : isNear ? 1.05 : 0.90
  const eyeW = (p.feminine ? 17.5 : 16.5) * wScale
  const eyeH = (p.feminine ? 13.8 : 11.4) * (spec.eyes === 'lebar' ? 1.15 : spec.eyes === 'sipit' ? 0.72 : 1.0)

  ctx.save()

  // Mata terpejam (kedip / lega / tersenyum hangat)
  if (closed || spec.eyes === 'tertutup') {
    const happyCurve = spec.mouth === 'senyum' || spec.mouth === 'senyum-lebar'
    ctx.beginPath()
    if (happyCurve) {
      ctx.moveTo(ex - eyeW * 0.88, ey + 2)
      ctx.quadraticCurveTo(ex, ey - 7.5, ex + eyeW * 0.88, ey + 2)
    } else {
      ctx.moveTo(ex - eyeW * 0.86, ey - 1)
      ctx.quadraticCurveTo(ex, ey + 4.5, ex + eyeW * 0.86, ey - 1)
    }
    ctx.strokeStyle = ink
    ctx.lineWidth = p.feminine ? 3.5 : 3.0
    ctx.lineCap = 'round'
    ctx.stroke()
    ctx.restore()
    return
  }

  // Bentuk sklera almond anime (melengkung tajam di atas, terbuka halus di bawah)
  const traceWhite = () => {
    ctx.beginPath()
    ctx.moveTo(ex - eyeW, ey + 1.5)
    ctx.bezierCurveTo(ex - eyeW * 0.55, ey - eyeH * 1.12, ex + eyeW * 0.55, ey - eyeH * 1.12, ex + eyeW, ey + 1.2)
    ctx.bezierCurveTo(ex + eyeW * 0.62, ey + eyeH * 0.82, ex - eyeW * 0.62, ey + eyeH * 0.82, ex - eyeW, ey + 1.5)
    ctx.closePath()
  }

  traceWhite()
  ctx.fillStyle = '#fffefe'
  ctx.fill()

  ctx.save()
  traceWhite()
  ctx.clip()

  // Bayangan sklera lembut di bawah kelopak atas (ciri khas shading anime modern)
  const scleraShade = ctx.createLinearGradient(ex, ey - eyeH, ex, ey + eyeH * 0.2)
  scleraShade.addColorStop(0, 'rgba(138, 152, 186, 0.42)')
  scleraShade.addColorStop(1, 'rgba(138, 152, 186, 0)')
  ctx.fillStyle = scleraShade
  ctx.fillRect(ex - eyeW - 2, ey - eyeH - 2, eyeW * 2 + 4, eyeH * 1.25)

  // Iris berlapis dengan arah pandang ke lawan bicara
  const gazeX = spec.eyes === 'melirik' ? -side * 3.0 : turn * 3.0
  const gazeY = spec.eyes === 'turun' ? 3.6 : 0.4
  const ix = ex + gazeX
  const iy = ey + gazeY
  const irX = eyeW * (p.feminine ? 0.58 : 0.54)
  const irY = eyeH * (p.feminine ? 0.90 : 0.86)

  ctx.beginPath()
  ctx.ellipse(ix, iy, irX, irY, 0, 0, Math.PI * 2)
  const irisGrad = ctx.createLinearGradient(ix, iy - irY, ix, iy + irY)
  irisGrad.addColorStop(0, mix(p.irisTop, '#0d0914', 0.35))
  irisGrad.addColorStop(0.46, p.irisTop)
  irisGrad.addColorStop(0.80, p.irisBottom)
  irisGrad.addColorStop(1, mix(p.irisBottom, '#fff0dc', 0.35))
  ctx.fillStyle = irisGrad
  ctx.fill()

  // Sabit pantulan cahaya hangat di bagian bawah iris
  ctx.beginPath()
  ctx.ellipse(ix, iy + irY * 0.44, irX * 0.64, irY * 0.32, 0, 0, Math.PI * 2)
  ctx.fillStyle = rgba(mix(p.irisBottom, '#ffffff', 0.55), 0.58)
  ctx.fill()

  // Pupil tengah tajam
  ctx.beginPath()
  ctx.ellipse(ix, iy - 0.3, irX * 0.40, irY * 0.46, 0, 0, Math.PI * 2)
  ctx.fillStyle = mix(p.irisTop, '#0b0812', 0.68)
  ctx.fill()

  // Cincin limbal halus di tepi iris
  ctx.beginPath()
  ctx.ellipse(ix, iy, irX, irY, 0, 0, Math.PI * 2)
  ctx.strokeStyle = rgba(ink, 0.52)
  ctx.lineWidth = 1.4
  ctx.stroke()

  // Kilau ganda mata anime (specular catchlight besar + bintik kecil berlawanan)
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.ellipse(ix - irX * 0.38, iy - irY * 0.36, irX * 0.30, irY * 0.25, -0.3, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(ix + irX * 0.36, iy + irY * 0.36, Math.max(1.5, irX * 0.14), 0, Math.PI * 2)
  ctx.fill()

  ctx.restore() // end eye white clip

  // Garis bulu mata atas terpahat (tebal di puncak, sedikit sayap di sudut luar untuk perempuan)
  ctx.beginPath()
  ctx.moveTo(ex - eyeW * 1.03, ey + 1.8)
  ctx.bezierCurveTo(ex - eyeW * 0.55, ey - eyeH * 1.18, ex + eyeW * 0.55, ey - eyeH * 1.18, ex + eyeW * 1.06, ey + 0.8)
  ctx.bezierCurveTo(ex + eyeW * 0.52, ey - eyeH * 0.78, ex - eyeW * 0.52, ey - eyeH * 0.78, ex - eyeW * 1.03, ey + 1.8)
  ctx.closePath()
  ctx.fillStyle = ink
  ctx.fill()

  // Ujung bulu mata luar lembut khusus karakter perempuan
  if (p.feminine) {
    ctx.beginPath()
    ctx.moveTo(ex + side * eyeW * 0.92, ey - eyeH * 0.16)
    ctx.lineTo(ex + side * (eyeW * 1.18), ey - eyeH * 0.38)
    ctx.strokeStyle = ink
    ctx.lineWidth = 2.2
    ctx.lineCap = 'round'
    ctx.stroke()
  }

  // Garis tepi bawah tipis halus (terbuka alami, bukan lingkaran penuh)
  ctx.beginPath()
  ctx.moveTo(ex - eyeW * 0.62, ey + eyeH * 0.68)
  ctx.quadraticCurveTo(ex, ey + eyeH * 0.82, ex + eyeW * 0.62, ey + eyeH * 0.68)
  ctx.strokeStyle = rgba(ink, 0.38)
  ctx.lineWidth = 1.4
  ctx.lineCap = 'round'
  ctx.stroke()

  // Garis lipatan kelopak mata ganda (double eyelid)
  ctx.beginPath()
  ctx.moveTo(ex - eyeW * 0.72, ey - eyeH * 1.18)
  ctx.quadraticCurveTo(ex, ey - eyeH * 1.50, ex + eyeW * 0.72, ey - eyeH * 1.14)
  ctx.strokeStyle = rgba(mix(p.skinShade, ink, 0.35), 0.72)
  ctx.lineWidth = 1.45
  ctx.lineCap = 'round'
  ctx.stroke()

  ctx.restore()
}

function drawEyebrow(ctx: CanvasRenderingContext2D, g: HeadGeo, ex: number, ey: number, side: -1 | 1): void {
  const { p, spec, ink } = g
  const yBase = ey - (p.feminine ? 22 : 19.5)
  let inDy = 0
  let outDy = 0
  let arch = -3.2

  switch (spec.brows) {
    case 'naik': inDy = -5.5; outDy = -2.5; arch = -5.5; break
    case 'turun-luar': inDy = -3.8; outDy = 4.2; arch = -1.2; break
    case 'turun-dalam': inDy = 4.4; outDy = -3.8; arch = -2.0; break
    case 'cemas': inDy = -4.5; outDy = 3.5; arch = -3.6; break
    default: inDy = -0.5; outDy = 0.5; arch = -3.0
  }

  const innerX = ex - side * 14.5
  const outerX = ex + side * 17.0
  ctx.save()
  ctx.beginPath()
  ctx.moveTo(innerX, yBase + inDy)
  ctx.quadraticCurveTo(ex + side * 1.5, yBase + (inDy + outDy) * 0.5 + arch, outerX, yBase + outDy)
  ctx.strokeStyle = mix(p.hairShade, ink, 0.35)
  ctx.lineWidth = p.feminine ? 2.5 : 3.4
  ctx.lineCap = 'round'
  ctx.stroke()
  ctx.restore()
}

function drawAnimeMouth(
  ctx: CanvasRenderingContext2D,
  g: HeadGeo,
  mx: number,
  my: number,
  mouthVariant: PortraitMouthVariant,
): void {
  const { spec, ink, p } = g
  const lipLine = mix('#9e404c', ink, 0.35)

  ctx.save()
  if (mouthVariant !== 'tutup') {
    const open = mouthVariant === 'buka'
    const rw = spec.mouth === 'senyum' || spec.mouth === 'senyum-lebar' ? 11.5 : 9.2
    const rh = open ? 8.8 : 4.2
    ctx.beginPath()
    ctx.moveTo(mx - rw, my - 1)
    ctx.quadraticCurveTo(mx, my - rh * 0.4, mx + rw, my - 1)
    ctx.bezierCurveTo(mx + rw * 0.82, my + rh * 1.15, mx - rw * 0.82, my + rh * 1.15, mx - rw, my - 1)
    ctx.closePath()
    ctx.fillStyle = '#993d4a'
    ctx.fill()
    ctx.save()
    ctx.clip()
    ctx.fillStyle = '#fffdf8'
    ctx.fillRect(mx - rw, my - rh * 0.5, rw * 2, open ? 3.2 : 1.9)
    if (open) {
      ctx.beginPath()
      ctx.ellipse(mx, my + rh * 0.8, rw * 0.65, rh * 0.5, 0, 0, Math.PI * 2)
      ctx.fillStyle = '#e5838d'
      ctx.fill()
    }
    ctx.restore()
    ctx.strokeStyle = lipLine
    ctx.lineWidth = 1.9
    ctx.stroke()
    ctx.restore()
    return
  }

  ctx.strokeStyle = lipLine
  ctx.lineWidth = 2.1
  ctx.lineCap = 'round'
  ctx.beginPath()
  switch (spec.mouth) {
    case 'senyum-lebar': {
      ctx.moveTo(mx - 12.5, my - 1)
      ctx.quadraticCurveTo(mx, my + 8.5, mx + 12.5, my - 1)
      ctx.quadraticCurveTo(mx, my + 1.5, mx - 12.5, my - 1)
      ctx.closePath()
      ctx.fillStyle = '#fffdf9'
      ctx.fill()
      ctx.stroke()
      break
    }
    case 'senyum':
      ctx.moveTo(mx - 11.5, my - 1.2)
      ctx.quadraticCurveTo(mx, my + 5.8, mx + 11.5, my - 1.2)
      ctx.stroke()
      break
    case 'turun':
      ctx.moveTo(mx - 8.5, my + 3.2)
      ctx.quadraticCurveTo(mx, my - 2.2, mx + 8.5, my + 3.2)
      ctx.stroke()
      break
    case 'garis-miring':
      ctx.moveTo(mx - 9.5, my + 1.8)
      ctx.quadraticCurveTo(mx, my - 0.6, mx + 9.5, my - 0.8)
      ctx.stroke()
      break
    case 'o':
      ctx.ellipse(mx, my + 1.5, 5.2, 6.4, 0, 0, Math.PI * 2)
      ctx.fillStyle = '#9e404c'
      ctx.fill()
      ctx.stroke()
      break
    default:
      ctx.moveTo(mx - 9.5, my)
      ctx.quadraticCurveTo(mx, my + 3.0, mx + 9.5, my)
      ctx.stroke()
      break
  }

  // Sentuhan kilau bibir bawah halus untuk karakter perempuan
  if (p.feminine && spec.mouth !== 'o') {
    ctx.beginPath()
    ctx.moveTo(mx - 4, my + 5.6)
    ctx.quadraticCurveTo(mx, my + 6.8, mx + 4, my + 5.6)
    ctx.strokeStyle = rgba(p.skinShade, 0.72)
    ctx.lineWidth = 1.6
    ctx.stroke()
  }
  ctx.restore()
}

/* ------------------------------------------------------------------ */
/* Rambut Belakang (sebelum badan)                                     */
/* ------------------------------------------------------------------ */

function drawBackHair(ctx: CanvasRenderingContext2D, g: HeadGeo): void {
  const { p, cx, cy, rx, ry, ink } = g
  if (p.hairStyle === 'hijab-cream' || p.hairStyle === 'hijab-charcoal') return

  ctx.save()
  const grad = ctx.createLinearGradient(cx, cy - ry, cx, cy + ry * 2.8)
  grad.addColorStop(0, p.hairBase)
  grad.addColorStop(1, mix(p.hairShade, '#0e0814', 0.3))

  if (p.hairStyle === 'long-headband' || p.hairStyle === 'long-straight') {
    // Rambut panjang bergelombang jatuh melewati bahu hingga ke dada
    ctx.beginPath()
    ctx.moveTo(cx - rx * 1.26, cy - ry * 0.25)
    ctx.bezierCurveTo(cx - rx * 1.52, cy + ry * 0.9, cx - rx * 1.55, cy + ry * 2.3, cx - rx * 1.12, cy + ry * 2.95)
    ctx.quadraticCurveTo(cx - rx * 0.5, cy + ry * 3.1, cx, cy + ry * 2.85)
    ctx.quadraticCurveTo(cx + rx * 0.5, cy + ry * 3.1, cx + rx * 1.12, cy + ry * 2.95)
    ctx.bezierCurveTo(cx + rx * 1.55, cy + ry * 2.3, cx + rx * 1.52, cy + ry * 0.9, cx + rx * 1.26, cy - ry * 0.25)
    ctx.bezierCurveTo(cx + rx * 1.12, cy - ry * 1.38, cx - rx * 1.12, cy - ry * 1.38, cx - rx * 1.26, cy - ry * 0.25)
    ctx.closePath()
    sf(ctx, grad, ink, 2.5)
  } else if (p.hairStyle === 'bob-xclip' || p.hairStyle === 'bob-twinpin' || p.hairStyle === 'dosen-bob') {
    // Bob bahu halus bervolume di belakang leher
    const bobLen = p.hairStyle === 'dosen-bob' ? 1.55 : 1.48
    ctx.beginPath()
    ctx.moveTo(cx - rx * 1.24, cy - ry * 0.2)
    ctx.bezierCurveTo(cx - rx * 1.42, cy + ry * 0.55, cx - rx * 1.32, cy + ry * bobLen, cx - rx * 0.72, cy + ry * (bobLen + 0.14))
    ctx.quadraticCurveTo(cx, cy + ry * (bobLen + 0.04), cx + rx * 0.72, cy + ry * (bobLen + 0.14))
    ctx.bezierCurveTo(cx + rx * 1.32, cy + ry * bobLen, cx + rx * 1.42, cy + ry * 0.55, cx + rx * 1.24, cy - ry * 0.2)
    ctx.bezierCurveTo(cx + rx * 1.08, cy - ry * 1.32, cx - rx * 1.08, cy - ry * 1.32, cx - rx * 1.24, cy - ry * 0.2)
    ctx.closePath()
    sf(ctx, grad, ink, 2.5)
  } else if (p.hairStyle === 'low-ponytail') {
    // Kuncir samping rendah yang jatuh lembut di bahu kanan + pita krem
    const side = g.turn >= 0 ? -1 : 1
    const px = cx + side * rx * 1.05
    const py = cy + ry * 0.42
    ctx.beginPath()
    ctx.moveTo(px, py)
    ctx.bezierCurveTo(px + side * 38, py + 12, px + side * 48, py + 95, px + side * 14, py + 155)
    ctx.bezierCurveTo(px - side * 10, py + 165, px - side * 14, py + 112, px - side * 4, py + 52)
    ctx.closePath()
    sf(ctx, grad, ink, 2.4)
    // Pita kain krem manis
    ctx.beginPath()
    ctx.ellipse(px + side * 2, py + 4, 12, 7.5, side * 0.25, 0, Math.PI * 2)
    sf(ctx, p.accentColor, ink, 2.0)
  } else {
    // Tengkuk rambut pendek laki-laki (helai bawah lembut di belakang telinga)
    ctx.beginPath()
    ctx.moveTo(cx - rx * 1.04, cy + ry * 0.1)
    ctx.bezierCurveTo(cx - rx * 1.12, cy + ry * 0.72, cx - rx * 0.75, cy + ry * 0.96, cx - rx * 0.42, cy + ry * 0.88)
    ctx.lineTo(cx + rx * 0.42, cy + ry * 0.88)
    ctx.bezierCurveTo(cx + rx * 0.75, cy + ry * 0.96, cx + rx * 1.12, cy + ry * 0.72, cx + rx * 1.04, cy + ry * 0.1)
    ctx.closePath()
    sf(ctx, p.hairShade, ink, 2.2)
  }
  ctx.restore()
}

/* ------------------------------------------------------------------ */
/* Badan, Leher, Bahu 3/4, dan 16 Busana Khas Referensi                */
/* ------------------------------------------------------------------ */

function drawTorsoAndOutfit(ctx: CanvasRenderingContext2D, g: HeadGeo, shoulderY: number): void {
  const { p, cx, turn, ink } = g
  const isHijab = p.hairStyle === 'hijab-cream' || p.hairStyle === 'hijab-charcoal'
  // Proporsi bahu anime realistis (laki-laki ~118 half-width, perempuan ~96 half-width)
  const baseHalfW = p.feminine ? 98 : 118
  const leftW = baseHalfW * (turn < 0 ? 0.91 : turn > 0 ? 1.06 : 1.0)
  const rightW = baseHalfW * (turn > 0 ? 0.91 : turn < 0 ? 1.06 : 1.0)
  const neckW = p.feminine ? 17.5 : 21.5

  // 1. Leher & tulang selangka (di atas badan belakang, sebelum kerah/syal)
  if (!isHijab) {
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(cx - neckW, shoulderY - 46)
    ctx.lineTo(cx - neckW * 1.12, shoulderY + 10)
    ctx.quadraticCurveTo(cx, shoulderY + 34, cx + neckW * 1.12, shoulderY + 10)
    ctx.lineTo(cx + neckW, shoulderY - 46)
    ctx.closePath()
    const ng = ctx.createLinearGradient(cx, shoulderY - 44, cx, shoulderY + 28)
    ng.addColorStop(0, p.skinShade)
    ng.addColorStop(0.55, p.skinBase)
    ng.addColorStop(1, p.skinBase)
    sf(ctx, ng, ink, 2.2)

    // Bayangan segitiga dagu lembut di bawah rahang
    ctx.beginPath()
    ctx.moveTo(cx - neckW * 0.95, shoulderY - 40)
    ctx.lineTo(cx + neckW * 0.95, shoulderY - 40)
    ctx.lineTo(cx + turn * 4, shoulderY - 12)
    ctx.closePath()
    ctx.fillStyle = rgba(p.skinShade, 0.58)
    ctx.fill()
    ctx.restore()
  }

  // 2. Siluet badan & lengan alami sampai tepi bawah kanvas
  const sleeveFill =
    p.outfit === 'varsity-maroon' ? p.accentColor
      : p.outfit === 'hijab-utility' ? p.innerColor
        : p.topBase

  const traceBody = () => {
    ctx.beginPath()
    ctx.moveTo(cx - neckW * 1.15, shoulderY - 4)
    ctx.bezierCurveTo(cx - leftW * 0.52, shoulderY + 2, cx - leftW * 0.92, shoulderY + 18, cx - leftW * 1.05, shoulderY + 62)
    ctx.bezierCurveTo(cx - leftW * 1.24, shoulderY + 135, cx - leftW * 1.28, ILLUSTRATED_H - 20, cx - leftW * 1.22, ILLUSTRATED_H + 14)
    ctx.lineTo(cx + rightW * 1.22, ILLUSTRATED_H + 14)
    ctx.bezierCurveTo(cx + rightW * 1.28, ILLUSTRATED_H - 20, cx + rightW * 1.24, shoulderY + 135, cx + rightW * 1.05, shoulderY + 62)
    ctx.bezierCurveTo(cx + rightW * 0.92, shoulderY + 18, cx + rightW * 0.52, shoulderY + 2, cx + neckW * 1.15, shoulderY - 4)
    ctx.quadraticCurveTo(cx, shoulderY + 22, cx - neckW * 1.15, shoulderY - 4)
    ctx.closePath()
  }

  const bodyGrad = ctx.createLinearGradient(cx - leftW, shoulderY, cx + rightW, ILLUSTRATED_H)
  bodyGrad.addColorStop(0, mix(sleeveFill, '#ffffff', 0.14))
  bodyGrad.addColorStop(0.55, sleeveFill)
  bodyGrad.addColorStop(1, mix(sleeveFill, '#101018', 0.24))

  traceBody()
  ctx.fillStyle = bodyGrad
  ctx.fill()

  // Clip detail pakaian ke dalam siluet badan
  ctx.save()
  traceBody()
  ctx.clip()

  // Badan tengah pakaian untuk rompi / varsity (lengan warna berbeda)
  if (p.outfit === 'varsity-maroon' || p.outfit === 'hijab-utility') {
    const vestW = baseHalfW * 0.72
    const vg = ctx.createLinearGradient(cx - vestW, shoulderY, cx + vestW, ILLUSTRATED_H)
    vg.addColorStop(0, p.topLight)
    vg.addColorStop(0.5, p.topBase)
    vg.addColorStop(1, p.topShade)
    ctx.fillStyle = vg
    ctx.fillRect(cx - vestW, shoulderY - 12, vestW * 2, ILLUSTRATED_H - shoulderY + 24)
    ctx.strokeStyle = ink
    ctx.lineWidth = 2.4
    ctx.beginPath()
    ctx.moveTo(cx - vestW, shoulderY + 10)
    ctx.lineTo(cx - vestW * 0.94, ILLUSTRATED_H)
    ctx.moveTo(cx + vestW, shoulderY + 10)
    ctx.lineTo(cx + vestW * 0.94, ILLUSTRATED_H)
    ctx.stroke()
  }

  // Detail unik setiap busana sesuai Referensi 1
  switch (p.outfit) {
    case 'dosen-blazer': {
      // Kemeja batik emas parang di dalam blazer navy
      ctx.beginPath()
      ctx.moveTo(cx - 34, shoulderY - 8)
      ctx.lineTo(cx, shoulderY + 132)
      ctx.lineTo(cx + 34, shoulderY - 8)
      ctx.closePath()
      ctx.fillStyle = p.innerColor
      ctx.fill()
      ctx.save()
      ctx.clip()
      ctx.strokeStyle = p.accentColor
      ctx.lineWidth = 3.0
      for (let k = -100; k <= 180; k += 15) {
        ctx.beginPath()
        ctx.moveTo(cx - 46, shoulderY + k)
        ctx.lineTo(cx + 46, shoulderY + k + 56)
        ctx.stroke()
      }
      ctx.restore()
      // Lapel blazer elegan
      for (const s of [-1, 1]) {
        ctx.beginPath()
        ctx.moveTo(cx + s * 28, shoulderY - 6)
        ctx.lineTo(cx + s * 62, shoulderY + 34)
        ctx.lineTo(cx + s * 46, shoulderY + 52)
        ctx.lineTo(cx + s * 58, shoulderY + 62)
        ctx.lineTo(cx + s * 4, shoulderY + 136)
        ctx.lineTo(cx + s * 22, shoulderY + 54)
        ctx.closePath()
        sf(ctx, p.topLight, ink, 2.2)
      }
      break
    }

    case 'almet-navy': {
      // Kemeja putih berkancing + lapel almet navy + emblem merah-emas di dada kiri!
      ctx.beginPath()
      ctx.moveTo(cx - 36, shoulderY - 8)
      ctx.lineTo(cx - 20, ILLUSTRATED_H)
      ctx.lineTo(cx + 20, ILLUSTRATED_H)
      ctx.lineTo(cx + 36, shoulderY - 8)
      ctx.closePath()
      sf(ctx, p.innerColor, ink, 2.0)
      // Garis plaket & kancing kemeja putih
      ctx.strokeStyle = rgba('#94a3b8', 0.65)
      ctx.lineWidth = 1.6
      ctx.beginPath()
      ctx.moveTo(cx, shoulderY + 26)
      ctx.lineTo(cx, ILLUSTRATED_H)
      ctx.stroke()
      for (const dy of [54, 92, 130, 168]) {
        ctx.beginPath()
        ctx.arc(cx, shoulderY + dy, 3.2, 0, Math.PI * 2)
        sf(ctx, '#ffffff', '#64748b', 1.3)
      }
      // Kerah kemeja putih
      for (const s of [-1, 1]) {
        ctx.beginPath()
        ctx.moveTo(cx + s * 24, shoulderY - 4)
        ctx.lineTo(cx + s * 32, shoulderY + 26)
        ctx.lineTo(cx + s * 2, shoulderY + 32)
        ctx.closePath()
        sf(ctx, '#ffffff', ink, 1.9)
      }
      // Lapel almet navy
      for (const s of [-1, 1]) {
        ctx.beginPath()
        ctx.moveTo(cx + s * 32, shoulderY - 6)
        ctx.lineTo(cx + s * 62, shoulderY + 36)
        ctx.lineTo(cx + s * 36, shoulderY + 52)
        ctx.lineTo(cx + s * 24, ILLUSTRATED_H)
        ctx.lineTo(cx + s * 20, shoulderY + 36)
        ctx.closePath()
        sf(ctx, p.topLight, ink, 2.2)
      }
      // Emblem bundar merah-emas khas Ref 01 di dada
      const ex = cx + 52
      const ey = shoulderY + 76
      ctx.beginPath()
      ctx.arc(ex, ey, 17, 0, Math.PI * 2)
      sf(ctx, '#1b1d26', '#e6c57a', 2.4)
      ctx.beginPath()
      ctx.arc(ex, ey, 14, Math.PI, 0)
      ctx.fillStyle = p.accentColor
      ctx.fill()
      ctx.beginPath()
      ctx.arc(ex, ey - 3, 4.5, 0, Math.PI * 2)
      ctx.fillStyle = '#f5d27a'
      ctx.fill()
      break
    }

    case 'techwear-cyan': {
      // Kaus hitam dalam + kerah tinggi techwear + garis aksen neon cyan
      ctx.beginPath()
      ctx.moveTo(cx - 28, shoulderY - 4)
      ctx.lineTo(cx - 18, ILLUSTRATED_H)
      ctx.lineTo(cx + 18, ILLUSTRATED_H)
      ctx.lineTo(cx + 28, shoulderY - 4)
      ctx.closePath()
      sf(ctx, p.innerColor, ink, 2.0)
      // Garis ritsleting & strip geometris cyan di bahu/dada
      ctx.strokeStyle = p.accentColor
      ctx.lineWidth = 4.2
      for (const s of [-1, 1]) {
        ctx.beginPath()
        ctx.moveTo(cx + s * 28, shoulderY + 20)
        ctx.lineTo(cx + s * 22, ILLUSTRATED_H)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(cx + s * 62, shoulderY + 54)
        ctx.lineTo(cx + s * 98, shoulderY + 76)
        ctx.lineTo(cx + s * 108, shoulderY + 132)
        ctx.stroke()
      }
      break
    }

    case 'soft-academia': {
      // Mantel krem terbuka + sweater gading dalam + kancing besar
      ctx.fillStyle = p.innerColor
      ctx.fillRect(cx - 32, shoulderY + 10, 64, ILLUSTRATED_H - shoulderY)
      for (const s of [-1, 1]) {
        ctx.beginPath()
        ctx.moveTo(cx + s * 30, shoulderY + 6)
        ctx.lineTo(cx + s * 56, shoulderY + 50)
        ctx.lineTo(cx + s * 36, ILLUSTRATED_H)
        ctx.lineTo(cx + s * 28, ILLUSTRATED_H)
        ctx.closePath()
        sf(ctx, p.topLight, ink, 2.0)
      }
      break
    }

    case 'hoodie-mustard':
    case 'hoodie-purple': {
      // Lipatan tudung hoodie empuk di leher + tali serut + jahitan kantong
      ctx.beginPath()
      ctx.ellipse(cx, shoulderY + 14, 54, 24, 0, 0, Math.PI * 2)
      sf(ctx, p.topShade, ink, 2.3)
      ctx.beginPath()
      ctx.ellipse(cx, shoulderY + 10, 44, 17, 0, 0, Math.PI * 2)
      sf(ctx, p.topLight, ink, 1.9)
      for (const s of [-1, 1]) {
        ctx.beginPath()
        ctx.moveTo(cx + s * 15, shoulderY + 22)
        ctx.quadraticCurveTo(cx + s * 19, shoulderY + 66, cx + s * 15, shoulderY + 104)
        ctx.strokeStyle = p.innerColor
        ctx.lineWidth = 4.5
        ctx.lineCap = 'round'
        ctx.stroke()
        ctx.strokeStyle = ink
        ctx.lineWidth = 1.4
        ctx.stroke()
      }
      // Garis kantong kanguru bawah
      ctx.beginPath()
      ctx.moveTo(cx - 56, shoulderY + 156)
      ctx.lineTo(cx + 56, shoulderY + 156)
      ctx.lineTo(cx + 68, ILLUSTRATED_H)
      ctx.lineTo(cx - 68, ILLUSTRATED_H)
      ctx.closePath()
      sf(ctx, p.topShade, ink, 2.0)
      break
    }

    case 'sporty-pink': {
      // Jaket sporty pink ritsleting putih + kaus dalam putih + strip lengan putih
      ctx.beginPath()
      ctx.moveTo(cx - 26, shoulderY - 2)
      ctx.lineTo(cx - 18, ILLUSTRATED_H)
      ctx.lineTo(cx + 18, ILLUSTRATED_H)
      ctx.lineTo(cx + 26, shoulderY - 2)
      ctx.closePath()
      sf(ctx, p.innerColor, ink, 1.8)
      for (const s of [-1, 1]) {
        ctx.beginPath()
        ctx.moveTo(cx + s * 28, shoulderY + 4)
        ctx.lineTo(cx + s * 46, shoulderY + 26)
        ctx.lineTo(cx + s * 24, shoulderY + 46)
        ctx.closePath()
        sf(ctx, p.topLight, ink, 2.0)
        // Strip sporty putih di bahu/lengan
        ctx.beginPath()
        ctx.moveTo(cx + s * 74, shoulderY + 22)
        ctx.lineTo(cx + s * 106, ILLUSTRATED_H)
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 8.5
        ctx.stroke()
      }
      break
    }

    case 'hijab-minimalist': {
      // Sweater rajut navy bergaris horizontal putih rapi khas Ref 04
      ctx.fillStyle = p.accentColor
      for (let y = shoulderY + 24; y < ILLUSTRATED_H; y += 26) {
        ctx.fillRect(cx - 150, y, 300, 7.5)
      }
      break
    }

    case 'workshop-orange': {
      // Jaket bengkel oranye terbuka di atas kaus hitam + dua saku dada berkancing
      ctx.beginPath()
      ctx.moveTo(cx - 28, shoulderY - 2)
      ctx.lineTo(cx - 22, ILLUSTRATED_H)
      ctx.lineTo(cx + 22, ILLUSTRATED_H)
      ctx.lineTo(cx + 28, shoulderY - 2)
      ctx.closePath()
      sf(ctx, p.innerColor, ink, 2.0)
      for (const s of [-1, 1]) {
        // Kerah jaket workshop
        ctx.beginPath()
        ctx.moveTo(cx + s * 28, shoulderY - 4)
        ctx.lineTo(cx + s * 56, shoulderY + 22)
        ctx.lineTo(cx + s * 24, shoulderY + 42)
        ctx.closePath()
        sf(ctx, p.topLight, ink, 2.2)
        // Saku dada teknisi
        rrect(ctx, cx + s * 58 - 20, shoulderY + 68, 40, 44, 5)
        sf(ctx, p.topShade, ink, 1.9)
        rrect(ctx, cx + s * 58 - 20, shoulderY + 68, 40, 13, 4)
        sf(ctx, p.topLight, ink, 1.8)
      }
      break
    }

    case 'flannel-green': {
      // Kemeja flanel kotak-kotak hijau-navy-krem asli!
      ctx.fillStyle = rgba(p.accentColor, 0.58)
      for (let x = cx - 150; x < cx + 150; x += 28) ctx.fillRect(x, shoulderY, 12, ILLUSTRATED_H - shoulderY)
      for (let y = shoulderY; y < ILLUSTRATED_H; y += 28) ctx.fillRect(cx - 150, y, 300, 11)
      ctx.strokeStyle = rgba('#e5e7d6', 0.45)
      ctx.lineWidth = 2.2
      for (let x = cx - 144; x < cx + 150; x += 28) {
        ctx.beginPath(); ctx.moveTo(x, shoulderY); ctx.lineTo(x, ILLUSTRATED_H); ctx.stroke()
      }
      for (let y = shoulderY + 6; y < ILLUSTRATED_H; y += 28) {
        ctx.beginPath(); ctx.moveTo(cx - 150, y); ctx.lineTo(cx + 150, y); ctx.stroke()
      }
      // Kaus dalam charcoal
      ctx.beginPath()
      ctx.moveTo(cx - 28, shoulderY + 4)
      ctx.lineTo(cx - 24, ILLUSTRATED_H)
      ctx.lineTo(cx + 24, ILLUSTRATED_H)
      ctx.lineTo(cx + 28, shoulderY + 4)
      ctx.closePath()
      sf(ctx, p.innerColor, ink, 2.2)
      // Kerah flanel
      for (const s of [-1, 1]) {
        ctx.beginPath()
        ctx.moveTo(cx + s * 28, shoulderY - 4)
        ctx.lineTo(cx + s * 48, shoulderY + 28)
        ctx.lineTo(cx + s * 24, shoulderY + 44)
        ctx.closePath()
        sf(ctx, p.topBase, ink, 2.1)
      }
      break
    }

    case 'varsity-maroon': {
      // Kaus putih dalam + kerah varsity bergaris + kancing putih + strip manset
      ctx.beginPath()
      ctx.moveTo(cx - 24, shoulderY)
      ctx.lineTo(cx - 18, ILLUSTRATED_H)
      ctx.lineTo(cx + 18, ILLUSTRATED_H)
      ctx.lineTo(cx + 24, shoulderY)
      ctx.closePath()
      sf(ctx, p.innerColor, ink, 2.0)
      // Kerah rib bergaris maroon-putih
      ctx.beginPath()
      ctx.arc(cx, shoulderY + 2, 36, 0.08 * Math.PI, 0.92 * Math.PI)
      ctx.strokeStyle = p.topShade
      ctx.lineWidth = 13
      ctx.stroke()
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 3.2
      ctx.stroke()
      // Emblem huruf kecil putih di dada
      ctx.fillStyle = '#ffffff'
      rrect(ctx, cx + 32, shoulderY + 64, 24, 28, 4)
      ctx.fill()
      ctx.fillStyle = p.topBase
      rrect(ctx, cx + 37, shoulderY + 69, 14, 18, 2)
      ctx.fill()
      break
    }

    case 'lab-coat': {
      // Kemeja biru muda di dalam + lapel jas lab putih rapi
      ctx.beginPath()
      ctx.moveTo(cx - 34, shoulderY - 6)
      ctx.lineTo(cx - 12, ILLUSTRATED_H)
      ctx.lineTo(cx + 12, ILLUSTRATED_H)
      ctx.lineTo(cx + 34, shoulderY - 6)
      ctx.closePath()
      sf(ctx, p.innerColor, ink, 2.0)
      for (const s of [-1, 1]) {
        ctx.beginPath()
        ctx.moveTo(cx + s * 22, shoulderY - 4)
        ctx.lineTo(cx + s * 30, shoulderY + 24)
        ctx.lineTo(cx + s * 2, shoulderY + 30)
        ctx.closePath()
        sf(ctx, mix(p.innerColor, '#ffffff', 0.25), ink, 1.8)
        // Lapel jas lab putih
        ctx.beginPath()
        ctx.moveTo(cx + s * 32, shoulderY - 6)
        ctx.lineTo(cx + s * 64, shoulderY + 38)
        ctx.lineTo(cx + s * 44, shoulderY + 56)
        ctx.lineTo(cx + s * 14, shoulderY + 132)
        ctx.lineTo(cx + s * 22, shoulderY + 38)
        ctx.closePath()
        sf(ctx, '#ffffff', ink, 2.2)
      }
      // Saku jas lab + pulpen
      rrect(ctx, cx + 44, shoulderY + 86, 36, 40, 4)
      sf(ctx, '#f8fafc', ink, 1.8)
      ctx.fillStyle = '#2563eb'
      ctx.fillRect(cx + 54, shoulderY + 72, 5, 18)
      break
    }

    case 'semi-formal-blue': {
      // Kemeja biru langit rapi + kerah runcing + kancing + tepi tablet di bawah
      ctx.fillStyle = rgba(p.topShade, 0.35)
      ctx.fillRect(cx - 5, shoulderY + 30, 10, ILLUSTRATED_H - shoulderY)
      for (const s of [-1, 1]) {
        ctx.beginPath()
        ctx.moveTo(cx + s * 24, shoulderY - 4)
        ctx.lineTo(cx + s * 42, shoulderY + 28)
        ctx.lineTo(cx + s * 2, shoulderY + 34)
        ctx.closePath()
        sf(ctx, p.topLight, ink, 2.0)
      }
      for (const dy of [58, 94, 130]) {
        ctx.beginPath()
        ctx.arc(cx, shoulderY + dy, 3.0, 0, Math.PI * 2)
        sf(ctx, '#ffffff', ink, 1.3)
      }
      break
    }

    case 'hijab-utility': {
      // Rompi zaitun berkantong ganda + ritsleting tengah di atas blus putih
      ctx.strokeStyle = ink
      ctx.lineWidth = 2.4
      ctx.beginPath()
      ctx.moveTo(cx, shoulderY + 20)
      ctx.lineTo(cx, ILLUSTRATED_H)
      ctx.stroke()
      for (const s of [-1, 1]) {
        rrect(ctx, cx + s * 36 - 19, shoulderY + 74, 38, 44, 5)
        sf(ctx, p.topShade, ink, 2.0)
        rrect(ctx, cx + s * 36 - 19, shoulderY + 74, 38, 13, 4)
        sf(ctx, p.topLight, ink, 1.8)
      }
      break
    }

    case 'cardigan-maroon': {
      // Blus krem kerah Peter Pan + cardigan rajut maroon dengan tekstur garis vertikal & kancing
      ctx.beginPath()
      ctx.moveTo(cx - 28, shoulderY - 2)
      ctx.lineTo(cx - 22, ILLUSTRATED_H)
      ctx.lineTo(cx + 22, ILLUSTRATED_H)
      ctx.lineTo(cx + 28, shoulderY - 2)
      ctx.closePath()
      sf(ctx, p.innerColor, ink, 2.0)
      for (const s of [-1, 1]) {
        ctx.beginPath()
        ctx.ellipse(cx + s * 18, shoulderY + 18, 18, 11, s * 0.35, 0, Math.PI * 2)
        sf(ctx, '#ffffff', ink, 1.8)
      }
      for (const dy of [66, 102, 138]) {
        ctx.beginPath()
        ctx.arc(cx + 28, shoulderY + dy, 3.8, 0, Math.PI * 2)
        sf(ctx, p.accentColor, ink, 1.4)
      }
      break
    }

    case 'street-teal': {
      // Jaket windbreaker teal terbuka di atas kaus putih + kerah tegak + emblem kecil
      ctx.beginPath()
      ctx.moveTo(cx - 32, shoulderY - 2)
      ctx.lineTo(cx - 26, ILLUSTRATED_H)
      ctx.lineTo(cx + 26, ILLUSTRATED_H)
      ctx.lineTo(cx + 32, shoulderY - 2)
      ctx.closePath()
      sf(ctx, p.innerColor, ink, 2.0)
      for (const s of [-1, 1]) {
        ctx.beginPath()
        ctx.moveTo(cx + s * 30, shoulderY - 6)
        ctx.lineTo(cx + s * 56, shoulderY + 26)
        ctx.lineTo(cx + s * 28, shoulderY + 46)
        ctx.closePath()
        sf(ctx, p.topLight, ink, 2.1)
      }
      ctx.beginPath()
      ctx.arc(cx + 54, shoulderY + 86, 12, 0, Math.PI * 2)
      sf(ctx, '#c73c3c', '#f5e4c2', 2.0)
      break
    }
  }

  // Tali tas (ransel / selempang / tote) di atas busana
  if (p.bag === 'backpack') {
    for (const s of [-1, 1]) {
      ctx.beginPath()
      ctx.moveTo(cx + s * 46, shoulderY - 4)
      ctx.quadraticCurveTo(cx + s * (baseHalfW * 0.72), shoulderY + 78, cx + s * (baseHalfW * 0.68), ILLUSTRATED_H)
      ctx.strokeStyle = '#252834'
      ctx.lineWidth = 17
      ctx.stroke()
      ctx.strokeStyle = ink
      ctx.lineWidth = 2.2
      ctx.stroke()
    }
  } else if (p.bag === 'crossbody') {
    ctx.beginPath()
    ctx.moveTo(cx - 58, shoulderY - 6)
    ctx.lineTo(cx + rightW * 0.88, ILLUSTRATED_H)
    ctx.strokeStyle = '#3b3330'
    ctx.lineWidth = 20
    ctx.stroke()
    ctx.strokeStyle = ink
    ctx.lineWidth = 2.4
    ctx.stroke()
    // Gesper logam khas Ref 01
    rrect(ctx, cx - 14, shoulderY + 84, 24, 24, 4)
    sf(ctx, '#6b7280', ink, 2.2)
  } else if (p.bag === 'tote-cream') {
    ctx.beginPath()
    ctx.moveTo(cx + 52, shoulderY + 2)
    ctx.quadraticCurveTo(cx + 76, shoulderY + 95, cx + 70, ILLUSTRATED_H)
    ctx.strokeStyle = '#efe5d6'
    ctx.lineWidth = 18
    ctx.stroke()
    ctx.strokeStyle = ink
    ctx.lineWidth = 2.2
    ctx.stroke()
  }

  // Garis lipatan bahu & lekuk lengan dalam (memberi kesan volume pakaian anime)
  ctx.strokeStyle = rgba(ink, 0.42)
  ctx.lineWidth = 2.2
  ctx.beginPath()
  ctx.moveTo(cx - leftW * 0.74, shoulderY + 86)
  ctx.quadraticCurveTo(cx - leftW * 0.78, shoulderY + 148, cx - leftW * 0.72, ILLUSTRATED_H)
  ctx.moveTo(cx + rightW * 0.74, shoulderY + 86)
  ctx.quadraticCurveTo(cx + rightW * 0.78, shoulderY + 148, cx + rightW * 0.72, ILLUSTRATED_H)
  ctx.stroke()

  ctx.restore() // end body clip

  // Kontur luar badan yang tajam & bersih
  traceBody()
  ctx.strokeStyle = ink
  ctx.lineWidth = 2.8
  ctx.lineJoin = 'round'
  ctx.stroke()

  // Aksesori leher (di atas badan)
  if (p.neckItem === 'lanyard-dosen' || p.neckItem === 'lanyard-student') {
    const isDosen = p.neckItem === 'lanyard-dosen'
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(cx - 28, shoulderY - 2)
    ctx.lineTo(cx, shoulderY + 94)
    ctx.lineTo(cx + 28, shoulderY - 2)
    ctx.strokeStyle = isDosen ? '#e6b84c' : '#293347'
    ctx.lineWidth = 7.5
    ctx.lineJoin = 'round'
    ctx.stroke()
    ctx.strokeStyle = ink
    ctx.lineWidth = 1.6
    ctx.stroke()

    rrect(ctx, cx - 22, shoulderY + 92, 44, 56, 6)
    sf(ctx, '#fcfaf4', ink, 2.1)
    rrect(ctx, cx - 21, shoulderY + 93, 42, 14, 5)
    ctx.fillStyle = isDosen ? '#1f8a8a' : '#335c85'
    ctx.fill()
    ctx.fillStyle = '#94a3b8'
    ctx.fillRect(cx - 14, shoulderY + 115, 28, 4)
    ctx.fillRect(cx - 14, shoulderY + 125, 20, 4)
    ctx.restore()
  } else if (p.neckItem === 'scarf-maroon') {
    // Syal rajut maroon tebal & hangat khas Ref 02
    ctx.save()
    ctx.beginPath()
    ctx.ellipse(cx, shoulderY + 8, 56, 26, 0, 0, Math.PI * 2)
    const sg = ctx.createLinearGradient(cx - 56, shoulderY - 14, cx + 56, shoulderY + 34)
    sg.addColorStop(0, '#9e3b4e')
    sg.addColorStop(0.6, p.accentColor)
    sg.addColorStop(1, '#541a26')
    sf(ctx, sg, ink, 2.4)
    // Ujung syal menjuntai di dada
    ctx.beginPath()
    ctx.moveTo(cx - 24, shoulderY + 20)
    ctx.quadraticCurveTo(cx + 12, shoulderY + 75, cx + 22, shoulderY + 118)
    ctx.lineTo(cx - 16, shoulderY + 126)
    ctx.quadraticCurveTo(cx - 34, shoulderY + 78, cx - 40, shoulderY + 22)
    ctx.closePath()
    sf(ctx, sg, ink, 2.3)
    // Garis lipatan kain syal
    ctx.strokeStyle = rgba('#380d16', 0.45)
    ctx.lineWidth = 2.0
    ctx.beginPath()
    ctx.arc(cx, shoulderY + 4, 42, 0.15 * Math.PI, 0.85 * Math.PI)
    ctx.stroke()
    ctx.restore()
  } else if (p.neckItem === 'headphone-cyan') {
    // Headphone cyan-teal melingkar di leher khas Ref 05
    ctx.save()
    ctx.beginPath()
    ctx.arc(cx, shoulderY + 2, 46, 0.12 * Math.PI, 0.88 * Math.PI)
    ctx.strokeStyle = ink
    ctx.lineWidth = 11
    ctx.lineCap = 'round'
    ctx.stroke()
    ctx.strokeStyle = '#243044'
    ctx.lineWidth = 7
    ctx.stroke()
    for (const s of [-1, 1]) {
      const hx = cx + s * 40
      const hy = shoulderY + 24
      ctx.beginPath()
      ctx.ellipse(hx, hy, 18, 22, s * -0.22, 0, Math.PI * 2)
      sf(ctx, '#262d3d', ink, 2.4)
      ctx.beginPath()
      ctx.ellipse(hx + s * 3, hy, 12, 16, s * -0.22, 0, Math.PI * 2)
      sf(ctx, p.accentColor, ink, 1.8)
    }
    ctx.restore()
  }
}

/* ------------------------------------------------------------------ */
/* Rambut Depan Berhelai & Kerudung Modern                             */
/* ------------------------------------------------------------------ */

function drawFrontHair(ctx: CanvasRenderingContext2D, g: HeadGeo): void {
  const { p, cx, cy, rx, ry, ink } = g
  ctx.save()

  // Bayangan poni halus di dahi
  ctx.save()
  traceAnimeFace(ctx, g)
  ctx.clip()
  ctx.beginPath()
  ctx.ellipse(cx, cy - ry * 0.56, rx * 1.12, ry * 0.44, 0, 0, Math.PI * 2)
  ctx.fillStyle = rgba(p.skinShade, 0.36)
  ctx.fill()
  ctx.restore()

  const traceCrown = () => {
    ctx.beginPath()
    ctx.moveTo(cx, cy - ry * 1.32)
    ctx.bezierCurveTo(cx + rx * 0.96, cy - ry * 1.28, cx + rx * 1.32, cy - ry * 0.5, cx + rx * 1.20, cy + ry * 0.24)
    ctx.quadraticCurveTo(cx + rx * 1.02, cy + ry * 0.56, cx + rx * 0.94, cy - ry * 0.14)

    // Poni berlapis khas anime (bervariasi per gaya rambut)
    if (p.hairStyle === 'dosen-bob') {
      ctx.quadraticCurveTo(cx + rx * 0.68, cy - ry * 0.68, cx + rx * 0.34, cy - ry * 0.22)
      ctx.quadraticCurveTo(cx + rx * 0.12, cy - ry * 0.56, cx - rx * 0.14, cy - ry * 0.18)
      ctx.quadraticCurveTo(cx - rx * 0.52, cy - ry * 0.44, cx - rx * 0.94, cy - ry * 0.10)
    } else if (p.hairStyle === 'messy-short' || p.hairStyle === 'fluffy-short') {
      ctx.quadraticCurveTo(cx + rx * 0.72, cy - ry * 0.48, cx + rx * 0.48, cy - ry * 0.08)
      ctx.quadraticCurveTo(cx + rx * 0.28, cy - ry * 0.52, cx + rx * 0.08, cy - ry * 0.06)
      ctx.quadraticCurveTo(cx - rx * 0.14, cy - ry * 0.48, cx - rx * 0.36, cy - ry * 0.08)
      ctx.quadraticCurveTo(cx - rx * 0.68, cy - ry * 0.46, cx - rx * 0.96, cy - ry * 0.10)
    } else {
      // Poni tipis modern anime perempuan
      ctx.quadraticCurveTo(cx + rx * 0.68, cy - ry * 0.24, cx + rx * 0.42, cy - ry * 0.12)
      ctx.quadraticCurveTo(cx + rx * 0.22, cy - ry * 0.48, cx + rx * 0.04, cy - ry * 0.10)
      ctx.quadraticCurveTo(cx - rx * 0.18, cy - ry * 0.46, cx - rx * 0.38, cy - ry * 0.12)
      ctx.quadraticCurveTo(cx - rx * 0.68, cy - ry * 0.32, cx - rx * 0.96, cy - ry * 0.10)
    }

    ctx.quadraticCurveTo(cx - rx * 1.02, cy + ry * 0.56, cx - rx * 1.20, cy + ry * 0.24)
    ctx.bezierCurveTo(cx - rx * 1.32, cy - ry * 0.5, cx - rx * 0.96, cy - ry * 1.28, cx, cy - ry * 1.32)
    ctx.closePath()
  }

  const hg = ctx.createLinearGradient(cx - rx, cy - ry * 1.3, cx + rx, cy + ry * 0.5)
  hg.addColorStop(0, mix(p.hairBase, p.hairLight, 0.24))
  hg.addColorStop(0.54, p.hairBase)
  hg.addColorStop(1, p.hairShade)

  traceCrown()
  ctx.fillStyle = hg
  ctx.fill()

  ctx.save()
  traceCrown()
  ctx.clip()

  // Garis bayangan helai halus
  ctx.strokeStyle = rgba(p.hairShade, 0.5)
  ctx.lineWidth = 2.4
  for (const off of [-0.66, -0.34, 0.0, 0.34, 0.66]) {
    ctx.beginPath()
    ctx.moveTo(cx + rx * off * 0.35, cy - ry * 1.24)
    ctx.quadraticCurveTo(cx + rx * off * 0.92, cy - ry * 0.6, cx + rx * off * 1.04, cy - ry * 0.05)
    ctx.stroke()
  }

  // Pita kilau anime ("angel ring") zig-zag halus
  ctx.beginPath()
  ctx.moveTo(cx - rx * 0.84, cy - ry * 0.56)
  ctx.quadraticCurveTo(cx - rx * 0.12, cy - ry * 0.94, cx + rx * 0.78, cy - ry * 0.60)
  ctx.quadraticCurveTo(cx - rx * 0.10, cy - ry * 0.74, cx - rx * 0.84, cy - ry * 0.56)
  ctx.closePath()
  ctx.fillStyle = rgba(mix(p.hairLight, '#ffffff', 0.42), 0.38)
  ctx.fill()

  // Aksen helai perak anggun di pelipis Ibu Dosen BK
  if (p.hairStyle === 'dosen-bob') {
    ctx.strokeStyle = 'rgba(218, 224, 236, 0.62)'
    ctx.lineWidth = 3.8
    ctx.lineCap = 'round'
    for (const s of [-1, 1]) {
      ctx.beginPath()
      ctx.moveTo(cx + s * rx * 0.86, cy - ry * 0.48)
      ctx.quadraticCurveTo(cx + s * rx * 1.08, cy - ry * 0.1, cx + s * rx * 0.98, cy + ry * 0.22)
      ctx.stroke()
    }
  }

  // Bando gelap khas Ref 02 (Tania)
  if (p.hairStyle === 'long-headband') {
    ctx.beginPath()
    ctx.arc(cx, cy - ry * 0.18, rx * 1.16, Math.PI * 1.12, Math.PI * 1.88)
    ctx.strokeStyle = '#241b1a'
    ctx.lineWidth = 10
    ctx.stroke()
  }

  ctx.restore() // end crown clip

  traceCrown()
  ctx.strokeStyle = ink
  ctx.lineWidth = 2.6
  ctx.lineJoin = 'round'
  ctx.stroke()

  // Helai rambut pembingkai pipi panjang (untuk semua rambut perempuan)
  if (p.feminine) {
    const lockH = p.hairStyle === 'long-headband' || p.hairStyle === 'long-straight' ? 2.0 : 1.18
    for (const s of [-1, 1]) {
      ctx.beginPath()
      ctx.moveTo(cx + s * rx * 0.92, cy - ry * 0.22)
      ctx.bezierCurveTo(cx + s * rx * 1.24, cy + ry * 0.38, cx + s * rx * 1.12, cy + ry * (lockH * 0.78), cx + s * rx * 0.78, cy + ry * lockH)
      ctx.bezierCurveTo(cx + s * rx * 0.80, cy + ry * (lockH * 0.56), cx + s * rx * 0.92, cy + ry * 0.22, cx + s * rx * 0.84, cy - ry * 0.16)
      ctx.closePath()
      sf(ctx, s > 0 ? p.hairShade : p.hairBase, ink, 2.2)
    }
  }

  // Jepit rambut khas Ref 06 (X-clip) & Ref 14 (Twin gold pins)
  if (p.hairStyle === 'bob-xclip') {
    const px = cx + rx * 0.64
    const py = cy - ry * 0.58
    ctx.strokeStyle = '#f6d38b'
    ctx.lineWidth = 3.6
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(px - 8, py - 8); ctx.lineTo(px + 8, py + 8)
    ctx.moveTo(px + 8, py - 8); ctx.lineTo(px - 8, py + 8)
    ctx.stroke()
  } else if (p.hairStyle === 'bob-twinpin') {
    const px = cx - rx * 0.68
    const py = cy - ry * 0.54
    ctx.strokeStyle = '#f3d078'
    ctx.lineWidth = 3.2
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(px - 10, py - 3); ctx.lineTo(px + 8, py + 3)
    ctx.moveTo(px - 9, py + 6); ctx.lineTo(px + 9, py + 11)
    ctx.stroke()
  }

  ctx.restore()
}

function drawHijab(ctx: CanvasRenderingContext2D, g: HeadGeo, shoulderY: number): void {
  const { p, cx, cy, rx, ry, ink } = g
  const hBase = p.hijabBase ?? '#e5d5c3'
  const hShade = p.hijabShade ?? '#c2ae98'
  const hLight = p.hijabLight ?? '#f6ede3'
  ctx.save()

  // Ciput rapi di garis dahi
  ctx.save()
  traceAnimeFace(ctx, g)
  ctx.clip()
  ctx.beginPath()
  ctx.ellipse(cx, cy - ry * 0.88, rx * 1.12, ry * 0.42, 0, 0, Math.PI * 2)
  ctx.fillStyle = mix(hShade, '#1a1622', 0.38)
  ctx.fill()
  ctx.restore()

  const traceOuter = () => {
    ctx.beginPath()
    ctx.moveTo(cx, cy - ry * 1.32)
    ctx.bezierCurveTo(cx + rx * 1.08, cy - ry * 1.28, cx + rx * 1.42, cy - ry * 0.34, cx + rx * 1.34, cy + ry * 0.72)
    ctx.bezierCurveTo(cx + rx * 1.54, shoulderY + 34, cx + rx * 1.42, shoulderY + 76, cx + rx * 0.94, shoulderY + 86)
    ctx.quadraticCurveTo(cx, shoulderY + 106, cx - rx * 0.94, shoulderY + 86)
    ctx.bezierCurveTo(cx - rx * 1.42, shoulderY + 76, cx - rx * 1.54, shoulderY + 34, cx - rx * 1.34, cy + ry * 0.72)
    ctx.bezierCurveTo(cx - rx * 1.42, cy - ry * 0.34, cx - rx * 1.08, cy - ry * 1.28, cx, cy - ry * 1.32)
    ctx.closePath()
  }

  const grad = ctx.createLinearGradient(cx - rx, cy - ry, cx + rx, shoulderY + 95)
  grad.addColorStop(0, hLight)
  grad.addColorStop(0.52, hBase)
  grad.addColorStop(1, hShade)

  // Lubang wajah even-odd agar wajah & ekspresi selalu tampak bersih
  ctx.beginPath()
  ctx.moveTo(cx, cy - ry * 1.32)
  ctx.bezierCurveTo(cx + rx * 1.08, cy - ry * 1.28, cx + rx * 1.42, cy - ry * 0.34, cx + rx * 1.34, cy + ry * 0.72)
  ctx.bezierCurveTo(cx + rx * 1.54, shoulderY + 34, cx + rx * 1.42, shoulderY + 76, cx + rx * 0.94, shoulderY + 86)
  ctx.quadraticCurveTo(cx, shoulderY + 106, cx - rx * 0.94, shoulderY + 86)
  ctx.bezierCurveTo(cx - rx * 1.42, shoulderY + 76, cx - rx * 1.54, shoulderY + 34, cx - rx * 1.34, cy + ry * 0.72)
  ctx.bezierCurveTo(cx - rx * 1.42, cy - ry * 0.34, cx - rx * 1.08, cy - ry * 1.28, cx, cy - ry * 1.32)
  ctx.closePath()

  const fx = rx * 0.94
  const fy = ry * 0.95
  ctx.moveTo(cx, cy - fy * 0.80)
  ctx.bezierCurveTo(cx - fx * 0.98, cy - fy * 0.76, cx - fx * 1.02, cy + fy * 0.56, cx, cy + fy * 1.06)
  ctx.bezierCurveTo(cx + fx * 1.02, cy + fy * 0.56, cx + fx * 0.98, cy - fy * 0.76, cx, cy - fy * 0.80)
  ctx.closePath()
  ctx.fillStyle = grad
  ctx.fill('evenodd')

  // Lipatan kain anggun + pin kecil di bawah dagu
  ctx.save()
  traceOuter()
  ctx.clip()
  ctx.strokeStyle = rgba(hShade, 0.7)
  ctx.lineWidth = 2.6
  for (const dy of [18, 40, 62]) {
    ctx.beginPath()
    ctx.moveTo(cx - rx * 0.95, shoulderY + dy - 12)
    ctx.quadraticCurveTo(cx, shoulderY + dy + 18, cx + rx * 0.95, shoulderY + dy - 10)
    ctx.stroke()
  }
  ctx.beginPath()
  ctx.arc(cx + g.turn * 3, cy + ry * 1.12, 3.8, 0, Math.PI * 2)
  sf(ctx, '#f2d084', ink, 1.4)
  ctx.restore()

  traceOuter()
  ctx.strokeStyle = ink
  ctx.lineWidth = 2.6
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(cx, cy - fy * 0.80)
  ctx.bezierCurveTo(cx - fx * 0.98, cy - fy * 0.76, cx - fx * 1.02, cy + fy * 0.56, cx, cy + fy * 1.06)
  ctx.bezierCurveTo(cx + fx * 1.02, cy + fy * 0.56, cx + fx * 0.98, cy - fy * 0.76, cx, cy - fy * 0.80)
  ctx.closePath()
  ctx.strokeStyle = ink
  ctx.lineWidth = 2.2
  ctx.stroke()

  ctx.restore()
}

/* ------------------------------------------------------------------ */
/* Aksesori Kepala (Kacamata, Headphone, Topi Bucket, Goggles)         */
/* ------------------------------------------------------------------ */

function drawHeadAccessories(ctx: CanvasRenderingContext2D, g: HeadGeo): void {
  const { p, cx, cy, rx, ry, turn, ink } = g
  const eyeY = cy + ry * 0.14
  const spread = 26.5

  if (p.glasses === 'rect-dark' || p.glasses === 'round-dark' || p.glasses === 'safety-clear') {
    const isRound = p.glasses === 'round-dark'
    const isSafety = p.glasses === 'safety-clear'
    const frameCol = isSafety ? 'rgba(186, 212, 236, 0.92)' : '#262b38'
    ctx.save()
    for (const s of [-1, 1]) {
      const lx = cx + s * spread + turn * 3.0
      if (isRound) {
        ctx.beginPath()
        ctx.arc(lx, eyeY + 1, 21, 0, Math.PI * 2)
      } else {
        rrect(ctx, lx - 22, eyeY - 15, 44, isSafety ? 32 : 29, isSafety ? 9 : 7)
      }
      ctx.fillStyle = isSafety ? 'rgba(218, 242, 255, 0.28)' : 'rgba(220, 240, 255, 0.15)'
      ctx.fill()
      ctx.strokeStyle = frameCol
      ctx.lineWidth = isSafety ? 3.4 : 2.8
      ctx.stroke()
      // Kilau diagonal halus
      ctx.beginPath()
      ctx.moveTo(lx - 11, eyeY - 7)
      ctx.lineTo(lx - 4, eyeY - 11)
      ctx.strokeStyle = 'rgba(255,255,255,0.75)'
      ctx.lineWidth = 2.2
      ctx.lineCap = 'round'
      ctx.stroke()
      // Tangkai ke telinga
      ctx.beginPath()
      ctx.moveTo(lx + s * 21, eyeY - 2)
      ctx.lineTo(cx + s * (rx * 1.05), eyeY + 2)
      ctx.strokeStyle = frameCol
      ctx.lineWidth = 2.2
      ctx.stroke()
    }
    ctx.beginPath()
    ctx.moveTo(cx - 5.5 + turn * 3.0, eyeY - 1)
    ctx.quadraticCurveTo(cx + turn * 3.0, eyeY - 4, cx + 5.5 + turn * 3.0, eyeY - 1)
    ctx.strokeStyle = frameCol
    ctx.lineWidth = 2.4
    ctx.stroke()
    ctx.restore()
  }

  if (p.glasses === 'goggles-forehead') {
    // Kacamata lab safety terangkat di dahi khas Ref 09 (Teguh)
    ctx.save()
    ctx.beginPath()
    ctx.arc(cx, cy - ry * 0.56, rx * 1.06, Math.PI * 1.08, Math.PI * 1.92)
    ctx.strokeStyle = '#252b38'
    ctx.lineWidth = 9
    ctx.stroke()
    for (const s of [-1, 1]) {
      rrect(ctx, cx + s * 24 - 19, cy - ry * 1.08, 38, 23, 8)
      sf(ctx, '#334155', ink, 2.4)
      rrect(ctx, cx + s * 24 - 14, cy - ry * 1.03, 28, 13, 5)
      sf(ctx, '#bae6fd', '#64748b', 1.4)
    }
    ctx.restore()
  }

  if (p.headgear === 'headphone-purple') {
    ctx.save()
    ctx.beginPath()
    ctx.arc(cx, cy - ry * 0.08, rx * 1.28, Math.PI * 1.06, Math.PI * 1.94)
    ctx.strokeStyle = ink
    ctx.lineWidth = 14
    ctx.lineCap = 'round'
    ctx.stroke()
    ctx.strokeStyle = '#9c6bc9'
    ctx.lineWidth = 9
    ctx.stroke()
    for (const s of [-1, 1]) {
      const px = cx + s * rx * 1.22
      const py = cy + ry * 0.14
      rrect(ctx, px - 13, py - 24, 26, 48, 12)
      sf(ctx, '#b57edc', ink, 2.4)
      rrect(ctx, px - 7, py - 14, 14, 28, 6)
      sf(ctx, '#ead6f7', '#7c4da8', 1.5)
    }
    ctx.restore()
  }

  if (p.headgear === 'bucket-hat') {
    // Topi bucket krem khas Ref 13 (Naufal)
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(cx - rx * 1.48, cy - ry * 0.42)
    ctx.quadraticCurveTo(cx, cy - ry * 0.12, cx + rx * 1.48, cy - ry * 0.42)
    ctx.quadraticCurveTo(cx + rx * 1.18, cy - ry * 0.72, cx + rx * 0.95, cy - ry * 0.78)
    ctx.bezierCurveTo(cx + rx * 0.88, cy - ry * 1.52, cx - rx * 0.88, cy - ry * 1.52, cx - rx * 0.95, cy - ry * 0.78)
    ctx.quadraticCurveTo(cx - rx * 1.18, cy - ry * 0.72, cx - rx * 1.48, cy - ry * 0.42)
    ctx.closePath()
    const bg = ctx.createLinearGradient(cx, cy - ry * 1.5, cx, cy - ry * 0.2)
    bg.addColorStop(0, '#f7efe0')
    bg.addColorStop(1, '#d8c5a8')
    sf(ctx, bg, ink, 2.6)
    ctx.beginPath()
    ctx.moveTo(cx - rx * 0.95, cy - ry * 0.78)
    ctx.quadraticCurveTo(cx, cy - ry * 0.60, cx + rx * 0.95, cy - ry * 0.78)
    ctx.strokeStyle = '#9c8668'
    ctx.lineWidth = 2.4
    ctx.stroke()
    ctx.restore()
  }
}

function drawExpressionOrnaments(ctx: CanvasRenderingContext2D, g: HeadGeo): void {
  const { cx, cy, rx, ry, spec } = g
  if (spec.ornament === 'keringat') {
    const sx = cx + rx * 0.98
    const sy = cy - ry * 0.34
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(sx, sy - 15)
    ctx.bezierCurveTo(sx + 10, sy, sx + 9, sy + 13, sx, sy + 13)
    ctx.bezierCurveTo(sx - 9, sy + 13, sx - 10, sy, sx, sy - 15)
    ctx.closePath()
    const sg = ctx.createLinearGradient(sx, sy - 15, sx, sy + 13)
    sg.addColorStop(0, '#e0f4ff')
    sg.addColorStop(1, '#4caee8')
    sf(ctx, sg, '#266894', 1.8)
    ctx.beginPath()
    ctx.arc(sx - 2.5, sy + 2, 2.2, 0, Math.PI * 2)
    ctx.fillStyle = '#ffffff'
    ctx.fill()
    ctx.restore()
  } else if (spec.ornament === 'helaan') {
    ctx.save()
    for (const [dx, dy, r] of [[rx * 0.98, ry * 0.62, 6], [rx * 1.18, ry * 0.44, 8.5], [rx * 1.38, ry * 0.25, 10.5]] as const) {
      ctx.beginPath()
      ctx.arc(cx + dx, cy + dy, r, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(241, 246, 252, 0.86)'
      ctx.fill()
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.58)'
      ctx.lineWidth = 1.5
      ctx.stroke()
    }
    ctx.restore()
  }
}

/* ------------------------------------------------------------------ */
/* Pintu Masuk Utama                                                   */
/* ------------------------------------------------------------------ */

export function drawIllustratedPortrait(
  ctx: CanvasRenderingContext2D,
  opts: IllustratedPortraitOptions,
): void {
  const p = getReferenceProfile(opts.id)
  const spec = EXPRESSION_SPECS[opts.expression] ?? EXPRESSION_SPECS.netral
  const isHijab = p.hairStyle === 'hijab-cream' || p.hairStyle === 'hijab-charcoal'
  const ink = '#271a22'

  const cx = ILLUSTRATED_W / 2 // 210
  const headDy = spec.headDy * 3.2
  const shoulderDy = spec.shoulderDy * 3.0
  const cy = 152 + headDy
  const shoulderY = 264 + shoulderDy
  const rx = p.feminine ? 51 : 54
  const ry = p.feminine ? 63 : 66
  const turn = opts.facing === 'kanan' ? 1 : opts.facing === 'kiri' ? -1 : 0

  const g: HeadGeo = { p, spec, cx, cy, rx, ry, turn, ink }

  ctx.save()
  ctx.clearRect(0, 0, ILLUSTRATED_W, ILLUSTRATED_H)

  const tiltRad =
    opts.expression === 'menunduk' || opts.expression === 'menutup-diri'
      ? turn * 0.04
      : opts.expression === 'terkejut'
        ? -turn * 0.03
        : 0

  // 1. Rambut belakang
  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(tiltRad)
  ctx.translate(-cx, -cy)
  drawBackHair(ctx, g)
  ctx.restore()

  // 2. Badan, leher, bahu 3/4 & busana lengkap
  drawTorsoAndOutfit(ctx, g, shoulderY)

  // 3. Kepala (dengan rotasi ekspresif halus)
  ctx.save()
  ctx.translate(cx, cy + ry * 0.5)
  ctx.rotate(tiltRad)
  ctx.translate(-cx, -(cy + ry * 0.5))

  // Telinga
  if (!isHijab) {
    for (const s of [-1, 1]) {
      const earX = cx + s * (rx * 0.94)
      const earY = cy + ry * 0.16
      ctx.beginPath()
      ctx.ellipse(earX, earY, 9.5, 14.5, s * 0.12, 0, Math.PI * 2)
      sf(ctx, s > 0 ? p.skinShade : p.skinBase, ink, 2.2)
      ctx.beginPath()
      ctx.arc(earX - s * 1.5, earY + 1, 4.0, 0, Math.PI * 2)
      ctx.fillStyle = rgba(p.skinShade, 0.7)
      ctx.fill()
    }
  }

  // Dasar wajah dengan gradasi kulit hangat anime
  traceAnimeFace(ctx, g)
  const faceGrad = ctx.createRadialGradient(cx - 12 + turn * 8, cy - 10, 8, cx, cy + 8, ry * 1.28)
  faceGrad.addColorStop(0, p.skinLight)
  faceGrad.addColorStop(0.68, p.skinBase)
  faceGrad.addColorStop(1, mix(p.skinBase, p.skinShade, 0.68))
  ctx.fillStyle = faceGrad
  ctx.fill()

  ctx.save()
  traceAnimeFace(ctx, g)
  ctx.clip()

  // Bayangan tepi pipi sisi belakang cahaya
  const shadeSide = turn >= 0 ? -1 : 1
  ctx.beginPath()
  ctx.ellipse(cx + shadeSide * rx * 0.84, cy + ry * 0.14, rx * 0.44, ry * 1.04, 0, 0, Math.PI * 2)
  ctx.fillStyle = rgba(p.skinShade, 0.34)
  ctx.fill()

  if (opts.expression === 'menutup-diri' || opts.expression === 'lelah' || opts.expression === 'kesal') {
    const gloom = ctx.createLinearGradient(cx, cy - ry, cx, cy + 12)
    gloom.addColorStop(0, 'rgba(32, 28, 56, 0.25)')
    gloom.addColorStop(1, 'rgba(32, 28, 56, 0)')
    ctx.fillStyle = gloom
    ctx.fillRect(cx - rx - 12, cy - ry - 12, rx * 2 + 24, ry + 24)
  }

  // Rona pipi hangat anime
  const blushAlpha = spec.ornament === 'rona' ? 0.50 : p.feminine ? 0.30 : 0.20
  for (const s of [-1, 1]) {
    const bx = cx + s * 29 + turn * 3.5
    const by = cy + ry * 0.40
    const bg = ctx.createRadialGradient(bx, by, 1, bx, by, 16)
    bg.addColorStop(0, rgba(p.blushColor, blushAlpha))
    bg.addColorStop(1, rgba(p.blushColor, 0))
    ctx.fillStyle = bg
    ctx.beginPath()
    ctx.ellipse(bx, by, 17, 10, 0, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore() // end face clip

  // Kontur wajah bersih
  traceAnimeFace(ctx, g)
  ctx.strokeStyle = ink
  ctx.lineWidth = 2.4
  ctx.stroke()

  // Hidung minimalis anime (titik & garis halus terarah)
  const noseX = cx + turn * 5.2
  const noseY = cy + ry * 0.34
  ctx.beginPath()
  ctx.moveTo(noseX - turn * 1.4, noseY - 4.5)
  ctx.lineTo(noseX + (turn >= 0 ? 2.5 : -2.5), noseY + 2.5)
  ctx.lineTo(noseX, noseY + 4.4)
  ctx.strokeStyle = mix(p.skinShade, ink, 0.36)
  ctx.lineWidth = 1.9
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.stroke()

  // Mata kiri & kanan
  const eyeY = cy + ry * 0.14
  const spread = 26.5
  drawAnimeEye(ctx, g, cx - spread + turn * 3.0, eyeY, -1, opts.eyesClosed)
  drawAnimeEye(ctx, g, cx + spread + turn * 3.0, eyeY, 1, opts.eyesClosed)

  // Mulut (lip-sync atau ekspresi)
  drawAnimeMouth(ctx, g, cx + turn * 4.2, cy + ry * 0.64, opts.mouth)

  // Rambut depan atau kerudung
  if (isHijab) {
    drawHijab(ctx, g, shoulderY)
  } else {
    drawFrontHair(ctx, g)
  }

  // Alis (di atas poni agar ekspresi selalu terbaca jelas)
  ctx.save()
  ctx.globalAlpha = 0.92
  drawEyebrow(ctx, g, cx - spread + turn * 3.0, eyeY, -1)
  drawEyebrow(ctx, g, cx + spread + turn * 3.0, eyeY, 1)
  ctx.restore()

  // Aksesori kepala (kacamata, goggles, headphone ungu, topi bucket)
  drawHeadAccessories(ctx, g)

  // Ornamen ekspresi (keringat / helaan napas)
  drawExpressionOrnaments(ctx, g)

  ctx.restore() // end head tilt
  ctx.restore()
}
