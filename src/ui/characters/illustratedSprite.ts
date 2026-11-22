/**
 * Renderer miniatur sprite chibi 2D bergaris tebal beresolusi tinggi (96×144 -> tampil tajam di 48×72)
 * bergaya persis referensi pixel-chibi RPG (Gambar 2) untuk seluruh 15 mahasiswa + Ibu Dosen BK.
 *
 * Seluruh 4 arah (bawah, kiri, kanan, atas) dan 6 frame (idle 0..1, jalan 0..3) dibangun dari
 * `REFERENCE_PROFILES` yang identik dengan potret percakapan sehingga miniatur TIDAK PERNAH
 * berubah-ubah ukuran, warna, maupun aksesori saat berjalan atau berbalik arah.
 */
import type { AppearanceFallback } from './characterArt'
import type { AnimKind, Direction } from './pixelGrid'
import { getReferenceProfile } from './referenceStyles'
import { normalizeFrame } from './spriteCompose'

export const CHIBI_SURF_W = 96
export const CHIBI_SURF_H = 144

function sf(
  ctx: CanvasRenderingContext2D,
  fill: string | CanvasGradient | null,
  stroke: string | null,
  lw = 3.2,
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

export function drawIllustratedChibiSprite(
  ctx: CanvasRenderingContext2D,
  opts: {
    studentId: string
    dir: Direction
    anim: AnimKind
    frame: number
    fallback?: AppearanceFallback
  },
): void {
  const p = getReferenceProfile(opts.studentId)
  const isHijab = p.hairStyle === 'hijab-cream' || p.hairStyle === 'hijab-charcoal'
  const isLongHair = p.hairStyle === 'long-headband' || p.hairStyle === 'long-straight'
  const isBobHair = p.hairStyle === 'bob-xclip' || p.hairStyle === 'bob-twinpin' || p.hairStyle === 'dosen-bob'
  const ink = '#1c1520'

  const f = normalizeFrame(opts.anim, opts.frame)
  const walking = opts.anim === 'jalan'
  const bob = walking ? (f % 2 === 0 ? -3.0 : 0.4) : f === 1 ? 1.2 : 0
  const stride = walking ? (f === 0 ? 1 : f === 2 ? -1 : 0) : 0

  ctx.save()
  ctx.clearRect(0, 0, CHIBI_SURF_W, CHIBI_SURF_H)

  const isSide = opts.dir === 'kiri' || opts.dir === 'kanan'
  const isBack = opts.dir === 'atas'
  if (opts.dir === 'kanan') {
    ctx.translate(CHIBI_SURF_W, 0)
    ctx.scale(-1, 1)
  }

  const cx = CHIBI_SURF_W / 2 // 48
  const footY = 136
  const hipY = 105 + bob * 0.4
  const torsoTop = 76 + bob
  const headCy = 46 + bob
  const headRx = isSide ? 24 : 27
  const headRy = 25

  /* ===== 1. Ransel (belakang saat tampak depan/samping) ===== */
  if (p.bag === 'backpack' && !isBack) {
    if (isSide) {
      rrect(ctx, cx + 11, torsoTop + 3, 15, 28, 6)
      sf(ctx, '#2a2e3d', ink, 2.8)
    } else {
      rrect(ctx, cx - 26, torsoTop + 5, 52, 24, 7)
      sf(ctx, '#2a2e3d', ink, 2.8)
    }
  }

  /* ===== 2. Rambut Belakang (di belakang badan untuk depan & samping) ===== */
  if (!isHijab && !isBack) {
    if (isLongHair) {
      rrect(ctx, cx - (isSide ? 18 : 29), headCy - 8, isSide ? 40 : 58, 56, 18)
      sf(ctx, p.hairShade, ink, 3.0)
    } else if (isBobHair) {
      rrect(ctx, cx - (isSide ? 18 : 28), headCy - 6, isSide ? 38 : 56, 40, 15)
      sf(ctx, p.hairShade, ink, 3.0)
    } else if (p.hairStyle === 'low-ponytail') {
      const px = isSide ? cx + 22 : cx + 26
      ctx.beginPath()
      ctx.ellipse(px, headCy + 16, 10, 18, -0.2, 0, Math.PI * 2)
      sf(ctx, p.hairBase, ink, 2.8)
      ctx.beginPath()
      ctx.arc(px - 4, headCy + 3, 4.5, 0, Math.PI * 2)
      sf(ctx, p.accentColor, ink, 2.0)
    }
  }

  /* ===== 3. Kaki & Sepatu (langkah seragam & mulus) ===== */
  const drawLeg = (lx: number, liftY: number, shiftX: number) => {
    const legW = isSide ? 12 : 11.5
    const topL = hipY + 7
    rrect(ctx, lx - legW / 2 + shiftX, topL + liftY, legW, 21, 5)
    sf(ctx, p.isSkirt ? p.skinBase : p.bottomColor, ink, 2.8)
    ctx.beginPath()
    ctx.ellipse(lx + shiftX - (isSide ? 2 : 0), footY - 4.5 + liftY * 0.65, isSide ? 9.5 : 8.5, 5.8, 0, 0, Math.PI * 2)
    sf(ctx, p.shoeColor, ink, 2.8)
  }

  if (isSide) {
    drawLeg(cx + 2, stride < 0 ? -4 : 0, -stride * 8)
    drawLeg(cx - 2, stride > 0 ? -4 : 0, stride * 8)
  } else {
    drawLeg(cx - 10, stride > 0 ? -4.5 : 0, 0)
    drawLeg(cx + 10, stride < 0 ? -4.5 : 0, 0)
  }

  /* ===== 4. Lengan Belakang (saat hadap samping) ===== */
  const sleeveCol =
    p.outfit === 'varsity-maroon' ? p.accentColor
      : p.outfit === 'hijab-utility' ? p.innerColor
        : p.topBase

  if (isSide) {
    rrect(ctx, cx - 5 - stride * 6.5, torsoTop + 5, 11, 23, 5)
    sf(ctx, p.topShade, ink, 2.6)
  }

  /* ===== 5. Badan & Busana Khas Referensi 2 ===== */
  const torsoW = isSide ? 26 : 38
  rrect(ctx, cx - torsoW / 2, torsoTop, torsoW, 33, 9)
  const tg = ctx.createLinearGradient(cx - torsoW / 2, torsoTop, cx + torsoW / 2, torsoTop + 34)
  tg.addColorStop(0, p.topLight)
  tg.addColorStop(0.55, p.topBase)
  tg.addColorStop(1, p.topShade)
  sf(ctx, tg, ink, 3.0)

  if (!isBack) {
    if (p.outfit === 'dosen-blazer' || p.outfit === 'almet-navy' || p.outfit === 'lab-coat' || p.outfit === 'cardigan-maroon' || p.outfit === 'soft-academia' || p.outfit === 'sporty-pink' || p.outfit === 'workshop-orange' || p.outfit === 'varsity-maroon' || p.outfit === 'street-teal' || p.outfit === 'flannel-green') {
      ctx.fillStyle = p.innerColor
      ctx.fillRect(cx - (isSide ? 4 : 6), torsoTop + 3, isSide ? 7 : 12, 27)
    }
    if (p.outfit === 'almet-navy' && !isSide) {
      // Emblem merah-emas kecil di dada kiri
      ctx.beginPath()
      ctx.arc(cx + 9, torsoTop + 14, 4.5, 0, Math.PI * 2)
      sf(ctx, p.accentColor, '#f0cc74', 1.4)
    } else if (p.outfit === 'hijab-minimalist') {
      ctx.fillStyle = p.accentColor
      for (const dy of [10, 18, 26]) {
        ctx.fillRect(cx - torsoW / 2 + 3, torsoTop + dy, torsoW - 6, 3)
      }
    } else if (p.outfit === 'techwear-cyan') {
      ctx.fillStyle = p.accentColor
      ctx.fillRect(cx - torsoW / 2 + 4, torsoTop + 18, torsoW - 8, 3.2)
    } else if (p.outfit === 'hoodie-mustard' || p.outfit === 'hoodie-purple') {
      ctx.strokeStyle = p.innerColor
      ctx.lineWidth = 2.4
      ctx.beginPath()
      ctx.moveTo(cx - 4, torsoTop + 5); ctx.lineTo(cx - 4, torsoTop + 16)
      ctx.moveTo(cx + 4, torsoTop + 5); ctx.lineTo(cx + 4, torsoTop + 16)
      ctx.stroke()
    } else if (p.outfit === 'flannel-green') {
      ctx.fillStyle = 'rgba(220, 232, 214, 0.4)'
      ctx.fillRect(cx - torsoW / 2 + 3, torsoTop + 14, torsoW - 6, 2.5)
      ctx.fillRect(cx - torsoW / 2 + 3, torsoTop + 23, torsoW - 6, 2.5)
    }

    // Lanyard ID (Ibu Dosen BK & Sari Melati)
    if (p.neckItem === 'lanyard-dosen' || p.neckItem === 'lanyard-student') {
      ctx.strokeStyle = p.neckItem === 'lanyard-dosen' ? '#f0c453' : '#253147'
      ctx.lineWidth = 2.6
      ctx.beginPath()
      ctx.moveTo(cx - 6, torsoTop + 2); ctx.lineTo(cx, torsoTop + 18); ctx.lineTo(cx + 6, torsoTop + 2)
      ctx.stroke()
      rrect(ctx, cx - 4.5, torsoTop + 16, 9, 11, 2)
      sf(ctx, p.neckItem === 'lanyard-dosen' ? '#1f8a8a' : '#f8fafc', ink, 1.5)
    } else if (p.neckItem === 'scarf-maroon') {
      rrect(ctx, cx - 15, torsoTop - 1, 30, 10, 5)
      sf(ctx, p.accentColor, ink, 2.2)
    } else if (p.neckItem === 'headphone-cyan') {
      ctx.beginPath()
      ctx.arc(cx - 10, torsoTop + 5, 5.5, 0, Math.PI * 2)
      ctx.arc(cx + 10, torsoTop + 5, 5.5, 0, Math.PI * 2)
      sf(ctx, p.accentColor, ink, 2.0)
    }

    // Tali selempang
    if (p.bag === 'crossbody' && !isSide) {
      ctx.strokeStyle = '#3b3330'
      ctx.lineWidth = 4.2
      ctx.beginPath()
      ctx.moveTo(cx - 12, torsoTop + 2)
      ctx.lineTo(cx + 14, torsoTop + 31)
      ctx.stroke()
    }
  }

  // Rok atau celana bagian pinggul
  if (p.isSkirt) {
    ctx.beginPath()
    ctx.moveTo(cx - (isSide ? 13 : 19), hipY - 2)
    ctx.lineTo(cx + (isSide ? 13 : 19), hipY - 2)
    ctx.lineTo(cx + (isSide ? 17 : 24), hipY + 15)
    ctx.lineTo(cx - (isSide ? 17 : 24), hipY + 15)
    ctx.closePath()
    sf(ctx, p.bottomColor, ink, 2.8)
  } else {
    rrect(ctx, cx - (isSide ? 13 : 19), hipY - 1, isSide ? 26 : 38, 12, 4)
    sf(ctx, p.bottomColor, ink, 2.8)
  }

  // Lengan depan / samping
  if (isSide) {
    const shift = stride * 6.5
    rrect(ctx, cx - 5 + shift, torsoTop + 5, 11, 23, 5)
    sf(ctx, sleeveCol, ink, 2.6)
    ctx.beginPath()
    ctx.arc(cx + shift, torsoTop + 28, 4.8, 0, Math.PI * 2)
    sf(ctx, p.skinBase, ink, 2.2)
  } else {
    for (const s of [-1, 1]) {
      const ay = torsoTop + 4 + (s < 0 ? -stride * 2.5 : stride * 2.5)
      rrect(ctx, cx + s * 22 - 5.5, ay, 11, 23, 5)
      sf(ctx, sleeveCol, ink, 2.6)
      ctx.beginPath()
      ctx.arc(cx + s * 22, ay + 23, 4.6, 0, Math.PI * 2)
      sf(ctx, p.skinBase, ink, 2.0)
    }
  }

  // Ransel di punggung saat menghadap belakang
  if (p.bag === 'backpack' && isBack) {
    rrect(ctx, cx - 16, torsoTop + 2, 32, 29, 7)
    sf(ctx, '#2a2e3d', ink, 2.8)
    rrect(ctx, cx - 11, torsoTop + 16, 22, 10, 4)
    sf(ctx, '#1b1e29', ink, 2.0)
  }

  // Tote bag krem di samping kanan (Mita)
  if (p.bag === 'tote-cream' && !isBack) {
    rrect(ctx, cx + (isSide ? 6 : 16), torsoTop + 14, 14, 18, 4)
    sf(ctx, '#efe5d6', ink, 2.2)
  }

  /* ===== 6. Kepala Chibi Ekspresif Seragam ===== */
  ctx.beginPath()
  ctx.ellipse(cx, headCy + 2, headRx, headRy, 0, 0, Math.PI * 2)
  const fg = ctx.createRadialGradient(cx - 5, headCy - 4, 4, cx, headCy + 4, 28)
  fg.addColorStop(0, p.skinLight)
  fg.addColorStop(0.7, p.skinBase)
  fg.addColorStop(1, p.skinShade)
  sf(ctx, fg, ink, 3.0)

  if (!isBack) {
    const eyeY = headCy + 6
    if (isSide) {
      const ex = cx - 10
      ctx.beginPath()
      ctx.ellipse(ex, eyeY, 4.6, 6.0, 0, 0, Math.PI * 2)
      ctx.fillStyle = '#1b1320'
      ctx.fill()
      ctx.beginPath()
      ctx.arc(ex - 1.4, eyeY - 2, 1.9, 0, Math.PI * 2)
      ctx.fillStyle = '#ffffff'
      ctx.fill()
      ctx.beginPath()
      ctx.ellipse(ex + 5, eyeY + 6.5, 4.2, 2.3, 0, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(238, 126, 138, 0.42)'
      ctx.fill()
    } else {
      for (const s of [-1, 1]) {
        const ex = cx + s * 10.5
        ctx.beginPath()
        ctx.ellipse(ex, eyeY, 4.5, 5.8, 0, 0, Math.PI * 2)
        ctx.fillStyle = '#1b1320'
        ctx.fill()
        ctx.beginPath()
        ctx.arc(ex - 1.4, eyeY - 1.8, 1.9, 0, Math.PI * 2)
        ctx.fillStyle = '#ffffff'
        ctx.fill()
        ctx.beginPath()
        ctx.arc(ex + 1.3, eyeY + 1.8, 1.0, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(255,255,255,0.85)'
        ctx.fill()
        ctx.beginPath()
        ctx.ellipse(cx + s * 15, eyeY + 6.5, 4.0, 2.2, 0, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(238, 126, 138, 0.40)'
        ctx.fill()
      }
      ctx.beginPath()
      ctx.arc(cx, eyeY + 7.5, 3.4, 0.15 * Math.PI, 0.85 * Math.PI)
      ctx.strokeStyle = '#7d343a'
      ctx.lineWidth = 2.0
      ctx.lineCap = 'round'
      ctx.stroke()
    }
  }

  /* ===== 7. Rambut atau Hijab (Konsisten 100% di Semua Arah!) ===== */
  if (isHijab) {
    const hb = p.hijabBase ?? '#e5d5c3'
    ctx.beginPath()
    ctx.ellipse(cx, headCy - 1, headRx + 4, headRy + 4, 0, Math.PI * 0.92, Math.PI * 2.08)
    if (isBack) {
      ctx.lineTo(cx + 28, torsoTop + 26)
      ctx.quadraticCurveTo(cx, torsoTop + 34, cx - 28, torsoTop + 26)
      ctx.closePath()
      sf(ctx, hb, ink, 3.0)
    } else if (isSide) {
      ctx.lineTo(cx + 26, torsoTop + 20)
      ctx.quadraticCurveTo(cx + 6, torsoTop + 26, cx - 10, headCy + 26)
      ctx.quadraticCurveTo(cx - 2, headCy + 10, cx - 4, headCy - 12)
      ctx.quadraticCurveTo(cx - 16, headCy - 10, cx - headRx - 3, headCy + 2)
      ctx.closePath()
      sf(ctx, hb, ink, 3.0)
    } else {
      ctx.lineTo(cx + 29, torsoTop + 22)
      ctx.quadraticCurveTo(cx, torsoTop + 30, cx - 29, torsoTop + 22)
      ctx.closePath()
      ctx.fillStyle = hb
      ctx.fill()
      // Wajah terbuka bersih di dalam bingkai hijab
      ctx.beginPath()
      ctx.ellipse(cx, headCy + 5, 19, 19, 0, 0, Math.PI * 2)
      sf(ctx, fg, ink, 2.2)
      const eyeY = headCy + 6
      for (const s of [-1, 1]) {
        const ex = cx + s * 9
        ctx.beginPath()
        ctx.ellipse(ex, eyeY, 4.1, 5.2, 0, 0, Math.PI * 2)
        ctx.fillStyle = '#1b1320'
        ctx.fill()
        ctx.beginPath()
        ctx.arc(ex - 1.2, eyeY - 1.5, 1.6, 0, Math.PI * 2)
        ctx.fillStyle = '#ffffff'
        ctx.fill()
        ctx.beginPath()
        ctx.ellipse(cx + s * 12.5, eyeY + 6, 3.5, 2, 0, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(238, 126, 138, 0.36)'
        ctx.fill()
      }
      ctx.beginPath()
      ctx.arc(cx, eyeY + 7.2, 3.1, 0.15 * Math.PI, 0.85 * Math.PI)
      ctx.strokeStyle = '#7d343a'
      ctx.lineWidth = 1.9
      ctx.stroke()

      ctx.beginPath()
      ctx.ellipse(cx, headCy - 1, headRx + 4, headRy + 4, 0, Math.PI * 0.92, Math.PI * 2.08)
      ctx.lineTo(cx + 29, torsoTop + 22)
      ctx.quadraticCurveTo(cx, torsoTop + 30, cx - 29, torsoTop + 22)
      ctx.closePath()
      ctx.strokeStyle = ink
      ctx.lineWidth = 3.0
      ctx.stroke()
    }
  } else if (isBack) {
    const extraBack = isLongHair ? 32 : isBobHair ? 18 : 8
    ctx.beginPath()
    ctx.arc(cx, headCy - 2, headRx + 3.5, Math.PI, 0)
    ctx.lineTo(cx + headRx + 3, headCy + 14 + extraBack)
    ctx.quadraticCurveTo(cx, headCy + 22 + extraBack, cx - headRx - 3, headCy + 14 + extraBack)
    ctx.closePath()
    sf(ctx, p.hairBase, ink, 3.0)
    // Kilau melengkung rambut belakang (bersih, tanpa artefak!)
    ctx.beginPath()
    ctx.arc(cx, headCy - 6, headRx - 5, Math.PI * 1.18, Math.PI * 1.82)
    ctx.strokeStyle = 'rgba(255,255,255,0.22)'
    ctx.lineWidth = 4
    ctx.lineCap = 'round'
    ctx.stroke()
    if (p.hairStyle === 'low-ponytail') {
      ctx.beginPath()
      ctx.ellipse(cx, headCy + 28, 10, 16, 0, 0, Math.PI * 2)
      sf(ctx, p.hairShade, ink, 2.6)
      ctx.beginPath()
      ctx.arc(cx, headCy + 16, 5, 0, Math.PI * 2)
      sf(ctx, p.accentColor, ink, 2.0)
    }
  } else {
    // Mahkota rambut + poni lembut
    ctx.beginPath()
    ctx.arc(cx, headCy - 3, headRx + 3.5, Math.PI * 0.94, Math.PI * 2.06)
    if (isSide) {
      ctx.lineTo(cx + headRx + 3, headCy + 16)
      ctx.quadraticCurveTo(cx + 4, headCy + 16, cx + 2, headCy - 2)
      ctx.quadraticCurveTo(cx - 10, headCy - 8, cx - headRx - 2, headCy - 2)
    } else {
      ctx.lineTo(cx + headRx + 2, headCy + 4)
      ctx.quadraticCurveTo(cx + 12, headCy - 6, cx + 4, headCy - 1)
      ctx.quadraticCurveTo(cx - 6, headCy - 8, cx - 14, headCy - 1)
      ctx.quadraticCurveTo(cx - 22, headCy - 5, cx - headRx - 2, headCy + 4)
    }
    ctx.closePath()
    sf(ctx, p.hairBase, ink, 3.0)
    ctx.beginPath()
    ctx.arc(cx - 3, headCy - 7, headRx - 6, Math.PI * 1.2, Math.PI * 1.75)
    ctx.strokeStyle = 'rgba(255,255,255,0.24)'
    ctx.lineWidth = 3.5
    ctx.lineCap = 'round'
    ctx.stroke()

    if (p.hairStyle === 'bob-xclip' && !isSide) {
      ctx.strokeStyle = '#f6d38b'
      ctx.lineWidth = 2.6
      ctx.beginPath()
      ctx.moveTo(cx + 13, headCy - 12); ctx.lineTo(cx + 19, headCy - 6)
      ctx.moveTo(cx + 19, headCy - 12); ctx.lineTo(cx + 13, headCy - 6)
      ctx.stroke()
    } else if (p.hairStyle === 'long-headband') {
      ctx.beginPath()
      ctx.arc(cx, headCy - 3, headRx + 1, Math.PI * 1.15, Math.PI * 1.85)
      ctx.strokeStyle = '#241b1a'
      ctx.lineWidth = 4.2
      ctx.stroke()
    }
  }

  /* ===== 8. Aksesori Kepala Chibi ===== */
  if (!isBack && (p.glasses === 'rect-dark' || p.glasses === 'round-dark' || p.glasses === 'safety-clear')) {
    const eyeY = headCy + 6
    const fc = p.glasses === 'safety-clear' ? '#b8d4ec' : '#242936'
    ctx.strokeStyle = fc
    ctx.lineWidth = 2.5
    ctx.fillStyle = 'rgba(215, 240, 255, 0.28)'
    if (isSide) {
      ctx.beginPath()
      ctx.arc(cx - 10, eyeY, 7.2, 0, Math.PI * 2)
      ctx.fill(); ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(cx - 2.8, eyeY); ctx.lineTo(cx + 12, eyeY)
      ctx.stroke()
    } else {
      for (const s of [-1, 1]) {
        ctx.beginPath()
        ctx.arc(cx + s * 10.2, eyeY, 7.0, 0, Math.PI * 2)
        ctx.fill(); ctx.stroke()
      }
      ctx.beginPath()
      ctx.moveTo(cx - 3.2, eyeY); ctx.lineTo(cx + 3.2, eyeY)
      ctx.stroke()
    }
  }

  if (p.glasses === 'goggles-forehead' && !isBack) {
    for (const s of [-1, 1]) {
      rrect(ctx, cx + s * 10 - 7, headCy - 17, 14, 9, 3)
      sf(ctx, '#bae6fd', '#252b38', 2.2)
    }
  }

  if (p.headgear === 'headphone-purple') {
    ctx.beginPath()
    ctx.arc(cx, headCy - 2, headRx + 5.5, Math.PI * 1.05, Math.PI * 1.95)
    ctx.strokeStyle = '#9c6bc9'
    ctx.lineWidth = 5
    ctx.stroke()
    if (!isSide) {
      for (const s of [-1, 1]) {
        ctx.beginPath()
        ctx.ellipse(cx + s * (headRx + 4), headCy + 4, 6.5, 9.5, 0, 0, Math.PI * 2)
        sf(ctx, '#b57edc', ink, 2.4)
      }
    } else {
      ctx.beginPath()
      ctx.ellipse(cx + 5, headCy + 4, 6.5, 9.5, 0, 0, Math.PI * 2)
      sf(ctx, '#b57edc', ink, 2.4)
    }
  }

  if (p.headgear === 'bucket-hat') {
    ctx.beginPath()
    ctx.arc(cx, headCy - 10, headRx + 2, Math.PI, 0)
    ctx.closePath()
    sf(ctx, '#ebe0cc', ink, 2.8)
    ctx.beginPath()
    ctx.ellipse(cx, headCy - 9, headRx + 8, 6.5, 0, 0, Math.PI * 2)
    sf(ctx, '#dfd0b4', ink, 2.6)
  }

  ctx.restore()
}
