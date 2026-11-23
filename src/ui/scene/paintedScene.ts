/**
 * Pelukis latar adegan Visual Novel bergaya anime kampus beresolusi tinggi (Canvas 2D HD).
 * Menggantikan tampilan piksel kotak-kotak kabur pada layar percakapan dengan ruang
 * laboratorium vokasi & ruang konsultasi hangat bercahaya matahari alami ala game virtual story populer.
 */
import type { SceneArtId, SceneVariant } from './sceneArt'

const paintedCache = new Map<string, HTMLCanvasElement>()
const externalScenes = new Map<string, HTMLImageElement>()
const externalRequested = new Set<string>()
const sceneListeners = new Set<() => void>()
const PAINTED_W = 960
const PAINTED_H = 540

export function onExternalSceneReady(listener: () => void): () => void {
  sceneListeners.add(listener)
  return () => {
    sceneListeners.delete(listener)
  }
}

/**
 * Memetakan setiap zona ke ilustrasi latar ruangan HD unik di `public/assets/scenes/`.
 * Setiap lab memiliki arsitektur, peralatan, palet, dan papan nama khasnya sendiri (0 duplikasi antar-lab!).
 */
function sceneFileFor(id: SceneArtId, variant: SceneVariant): string {
  switch (id) {
    case 'ruang-bk':
    case 'ruang-dosen':
      return `/assets/scenes/ruang-bk-${variant}.png`
    case 'cetak-3d':
      return `/assets/scenes/lab-vokasi-${variant}.png`
    case 'elektronik':
      return `/assets/scenes/elektronik-${variant}.svg`
    case 'pemrograman':
      return `/assets/scenes/pemrograman-${variant}.svg`
    case 'las':
      return `/assets/scenes/las-${variant}.svg`
    case 'diskusi':
    case 'lab-umum':
      return `/assets/scenes/diskusi-${variant}.svg`
    case 'istirahat':
      return `/assets/scenes/istirahat-${variant}.svg`
    case 'gudang':
      return `/assets/scenes/gudang-${variant}.svg`
  }
}

/**
 * Mencoba memuat latar lukisan HD kustom di `public/assets/scenes/`.
 * Jika belum ada, jatuh mulus ke pelukis Canvas 2D HD tanpa error.
 */
function requestExternalScene(id: SceneArtId, variant: SceneVariant): HTMLImageElement | null {
  const srcUrl = sceneFileFor(id, variant)
  const loaded = externalScenes.get(srcUrl)
  if (loaded) return loaded
  if (externalRequested.has(srcUrl) || typeof Image === 'undefined') return null
  externalRequested.add(srcUrl)
  const img = new Image()
  img.onload = () => {
    externalScenes.set(srcUrl, img)
    for (const fn of sceneListeners) {
      try { fn() } catch { /* abaikan */ }
    }
  }
  img.onerror = () => undefined
  img.src = srcUrl
  return null
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

function drawSunlitWindow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  isSunset: boolean,
  withCurtains: boolean,
): void {
  // Langit kampus & pepohonan luar jendela
  ctx.save()
  rrect(ctx, x, y, w, h, 8)
  ctx.clip()

  const sky = ctx.createLinearGradient(x, y, x, y + h)
  if (isSunset) {
    sky.addColorStop(0, '#f4a878')
    sky.addColorStop(0.55, '#fce0b6')
    sky.addColorStop(1, '#fff3dc')
  } else {
    sky.addColorStop(0, '#8cc4f0')
    sky.addColorStop(0.6, '#cce8fb')
    sky.addColorStop(1, '#eef8ff')
  }
  ctx.fillStyle = sky
  ctx.fillRect(x, y, w, h)

  // Siluet gedung kampus di kejauhan
  ctx.fillStyle = isSunset ? 'rgba(164, 108, 92, 0.34)' : 'rgba(116, 148, 184, 0.32)'
  ctx.fillRect(x + w * 0.06, y + h * 0.44, w * 0.34, h * 0.56)
  ctx.fillRect(x + w * 0.52, y + h * 0.36, w * 0.42, h * 0.64)
  ctx.fillStyle = isSunset ? 'rgba(255, 232, 184, 0.5)' : 'rgba(255, 255, 255, 0.52)'
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      ctx.fillRect(x + w * 0.1 + col * 24, y + h * 0.52 + row * 24, 14, 14)
      ctx.fillRect(x + w * 0.57 + col * 28, y + h * 0.44 + row * 26, 16, 15)
    }
  }

  // Tajuk pohon hijau lembut di luar
  const leafCol1 = isSunset ? 'rgba(132, 128, 72, 0.72)' : 'rgba(84, 148, 96, 0.72)'
  const leafCol2 = isSunset ? 'rgba(176, 152, 82, 0.65)' : 'rgba(118, 178, 114, 0.65)'
  ctx.fillStyle = leafCol1
  ctx.beginPath()
  ctx.arc(x + w * 0.16, y + h * 0.88, 52, 0, Math.PI * 2)
  ctx.arc(x + w * 0.46, y + h * 0.94, 48, 0, Math.PI * 2)
  ctx.arc(x + w * 0.84, y + h * 0.86, 56, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = leafCol2
  ctx.beginPath()
  ctx.arc(x + w * 0.24, y + h * 0.78, 34, 0, Math.PI * 2)
  ctx.arc(x + w * 0.76, y + h * 0.78, 38, 0, Math.PI * 2)
  ctx.fill()

  // Kilau matahari kaca
  const sunGlow = ctx.createRadialGradient(x + w * 0.72, y + h * 0.22, 10, x + w * 0.72, y + h * 0.22, w * 0.65)
  sunGlow.addColorStop(0, isSunset ? 'rgba(255, 240, 200, 0.72)' : 'rgba(255, 255, 244, 0.58)')
  sunGlow.addColorStop(1, 'rgba(255, 255, 255, 0)')
  ctx.fillStyle = sunGlow
  ctx.fillRect(x, y, w, h)

  // Kusen jendela modern
  ctx.strokeStyle = withCurtains ? '#a6825c' : '#cbd5e1'
  ctx.lineWidth = 7
  ctx.beginPath()
  ctx.moveTo(x + w / 3, y)
  ctx.lineTo(x + w / 3, y + h)
  ctx.moveTo(x + (w * 2) / 3, y)
  ctx.lineTo(x + (w * 2) / 3, y + h)
  ctx.moveTo(x, y + h * 0.62)
  ctx.lineTo(x + w, y + h * 0.62)
  ctx.stroke()

  // Tirai krem lembut (khusus Ruang Konsultasi / Ruang Istirahat)
  if (withCurtains) {
    for (const side of [0, 1]) {
      const cx = side === 0 ? x : x + w - 42
      const cg = ctx.createLinearGradient(cx, y, cx + 42, y)
      cg.addColorStop(0, side === 0 ? '#eadcc8' : 'rgba(247, 239, 226, 0.86)')
      cg.addColorStop(1, side === 0 ? 'rgba(247, 239, 226, 0.86)' : '#eadcc8')
      ctx.fillStyle = cg
      ctx.fillRect(cx, y, 42, h)
    }
  }
  ctx.restore()

  // Bingkai jendela luar + ambang kayu
  rrect(ctx, x, y, w, h, 8)
  ctx.strokeStyle = withCurtains ? '#8b6848' : '#64748b'
  ctx.lineWidth = 8
  ctx.stroke()

  rrect(ctx, x - 12, y + h - 2, w + 24, 14, 4)
  ctx.fillStyle = withCurtains ? '#a98159' : '#94a3b8'
  ctx.fill()
}

function drawBookshelf(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
  rrect(ctx, x, y, w, h, 8)
  const wood = ctx.createLinearGradient(x, y, x + w, y)
  wood.addColorStop(0, '#9c714c')
  wood.addColorStop(1, '#7c5537')
  ctx.fillStyle = wood
  ctx.fill()
  ctx.strokeStyle = '#573a24'
  ctx.lineWidth = 3
  ctx.stroke()

  const palette = ['#486b8a', '#9c4c58', '#68876b', '#d4a254', '#70638c', '#c97b59', '#4c7e7c', '#b59d78']
  const rows = 4
  const rowH = (h - 24) / rows
  for (let r = 0; r < rows; r++) {
    const sy = y + 12 + r * rowH
    ctx.fillStyle = '#5d3e27'
    ctx.fillRect(x + 10, sy, w - 20, rowH - 8)
    let bx = x + 16
    let idx = r * 5
    while (bx < x + w - 28) {
      const bw = 12 + ((idx * 7) % 10)
      const bh = rowH - 16 - ((idx * 5) % 14)
      ctx.fillStyle = palette[idx % palette.length]
      rrect(ctx, bx, sy + (rowH - 8) - bh, bw, bh, 2)
      ctx.fill()
      ctx.fillStyle = 'rgba(255,255,255,0.28)'
      ctx.fillRect(bx + 2, sy + (rowH - 8) - bh + 5, bw - 4, 3)
      bx += bw + 3
      idx++
    }
    ctx.fillStyle = '#a87d56'
    ctx.fillRect(x + 8, sy + rowH - 10, w - 16, 8)
  }
}

function drawWhiteboard(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, accent: string): void {
  rrect(ctx, x, y, w, h, 8)
  ctx.fillStyle = '#f8fafc'
  ctx.fill()
  ctx.strokeStyle = '#94a3b8'
  ctx.lineWidth = 6
  ctx.stroke()

  // Garis diagram & sticky notes pastel rapi
  ctx.strokeStyle = accent
  ctx.lineWidth = 2.4
  ctx.beginPath()
  ctx.moveTo(x + 22, y + 36)
  ctx.lineTo(x + 120, y + 36)
  ctx.moveTo(x + 22, y + 54)
  ctx.lineTo(x + 92, y + 54)
  ctx.stroke()

  ctx.strokeStyle = '#cbd5e1'
  ctx.lineWidth = 2
  ctx.strokeRect(x + 22, y + 72, 68, 44)
  ctx.strokeRect(x + 108, y + 72, 68, 44)
  ctx.beginPath()
  ctx.moveTo(x + 90, y + 94)
  ctx.lineTo(x + 108, y + 94)
  ctx.stroke()

  const notes = [
    { dx: 196, dy: 26, c: '#fef08a' },
    { dx: 230, dy: 30, c: '#fbcfe8' },
    { dx: 202, dy: 64, c: '#bbf7d0' },
    { dx: 236, dy: 68, c: '#bae6fd' },
  ]
  for (const n of notes) {
    if (n.dx + 28 < w) {
      ctx.fillStyle = n.c
      ctx.fillRect(x + n.dx, y + n.dy, 26, 26)
      ctx.fillStyle = 'rgba(0,0,0,0.08)'
      ctx.fillRect(x + n.dx, y + n.dy + 22, 26, 4)
    }
  }
}

function drawPottedPlant(ctx: CanvasRenderingContext2D, cx: number, bottomY: number, scale = 1): void {
  ctx.save()
  ctx.translate(cx, bottomY)
  ctx.scale(scale, scale)

  // Daun tanaman hias indoor
  const leaves: Array<[number, number, number, number, number, string]> = [
    [-22, -96, 18, 34, -0.55, '#4c855d'],
    [22, -92, 18, 34, 0.55, '#437853'],
    [-34, -68, 16, 28, -0.85, '#59966b'],
    [32, -66, 16, 28, 0.85, '#4f8c60'],
    [0, -108, 17, 36, 0, '#62a375'],
  ]
  for (const [lx, ly, rx, ry, rot, col] of leaves) {
    ctx.save()
    ctx.translate(lx, ly)
    ctx.rotate(rot)
    ctx.beginPath()
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2)
    ctx.fillStyle = col
    ctx.fill()
    ctx.restore()
  }

  // Pot keramik krem hangat
  ctx.beginPath()
  ctx.moveTo(-26, -54)
  ctx.lineTo(26, -54)
  ctx.lineTo(20, 0)
  ctx.lineTo(-20, 0)
  ctx.closePath()
  const pg = ctx.createLinearGradient(-26, 0, 26, 0)
  pg.addColorStop(0, '#f3e7d4')
  pg.addColorStop(1, '#d6c1a3')
  ctx.fillStyle = pg
  ctx.fill()
  ctx.strokeStyle = '#a89070'
  ctx.lineWidth = 2.5
  ctx.stroke()

  ctx.restore()
}

function drawSunbeams(ctx: CanvasRenderingContext2D, w: number, h: number, isSunset: boolean): void {
  ctx.save()
  const beamColor = isSunset ? 'rgba(255, 214, 148, 0.16)' : 'rgba(255, 250, 224, 0.14)'
  ctx.fillStyle = beamColor
  for (let i = 0; i < 3; i++) {
    const bx = w * (0.28 + i * 0.16)
    ctx.beginPath()
    ctx.moveTo(bx, 0)
    ctx.lineTo(bx + 115, 0)
    ctx.lineTo(bx - 95, h)
    ctx.lineTo(bx - 210, h)
    ctx.closePath()
    ctx.fill()
  }
  ctx.restore()
}

function paintToCanvas(id: SceneArtId, variant: SceneVariant): HTMLCanvasElement | null {
  if (typeof document === 'undefined') return null
  const canvas = document.createElement('canvas')
  canvas.width = PAINTED_W
  canvas.height = PAINTED_H
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  const w = PAINTED_W
  const h = PAINTED_H
  const isSunset = variant === 'sore'
  const isBk = id === 'ruang-bk'
  const isRest = id === 'istirahat'
  const isWeld = id === 'las'

  // 1. Dinding ruangan hangat bergaya anime kampus
  const wallGrad = ctx.createLinearGradient(0, 0, 0, h * 0.72)
  if (isBk || isRest) {
    wallGrad.addColorStop(0, isSunset ? '#efe0cb' : '#f4ece0')
    wallGrad.addColorStop(1, isSunset ? '#dfd0b8' : '#e6dac8')
  } else if (isWeld) {
    wallGrad.addColorStop(0, isSunset ? '#d6d4d0' : '#dce2e8')
    wallGrad.addColorStop(1, isSunset ? '#bfc0be' : '#c5ced8')
  } else {
    wallGrad.addColorStop(0, isSunset ? '#e9e2d8' : '#e7eef4')
    wallGrad.addColorStop(1, isSunset ? '#d5cbc0' : '#d2dfe9')
  }
  ctx.fillStyle = wallGrad
  ctx.fillRect(0, 0, w, h * 0.72)

  // Plafon & garis arsitektur atas
  ctx.fillStyle = isBk ? '#dfd0ba' : '#cbd5e1'
  ctx.fillRect(0, 0, w, 24)
  ctx.fillStyle = 'rgba(0,0,0,0.06)'
  ctx.fillRect(0, 24, w, 4)

  // Panel wainscoting kayu bagian bawah dinding
  const panelTop = h * 0.68
  const woodGrad = ctx.createLinearGradient(0, panelTop, 0, h)
  if (isBk || isRest) {
    woodGrad.addColorStop(0, '#c69e74')
    woodGrad.addColorStop(1, '#8c6642')
  } else {
    woodGrad.addColorStop(0, '#b59a7b')
    woodGrad.addColorStop(1, '#7c654d')
  }
  ctx.fillStyle = woodGrad
  ctx.fillRect(0, panelTop, w, h - panelTop)
  ctx.fillStyle = isBk ? '#9e764e' : '#8d745a'
  ctx.fillRect(0, panelTop, w, 8)
  ctx.strokeStyle = 'rgba(54, 34, 18, 0.14)'
  ctx.lineWidth = 2
  for (let x = 0; x < w; x += 64) {
    ctx.beginPath()
    ctx.moveTo(x, panelTop + 8)
    ctx.lineTo(x, h)
    ctx.stroke()
  }

  // 2. Elemen ruang khas per adegan
  if (isBk) {
    // Ruang Konsultasi hangat: jendela bertirai di tengah, rak buku kayu di kanan, jam & bingkai seni di kiri
    drawSunlitWindow(ctx, w * 0.30, 62, w * 0.38, 224, isSunset, true)
    drawBookshelf(ctx, w * 0.73, 56, 200, 310)

    // Jam dinding minimalis & dua bingkai ilustrasi lembut di kiri
    ctx.save()
    ctx.beginPath()
    ctx.arc(135, 112, 34, 0, Math.PI * 2)
    ctx.fillStyle = '#fcfaf5'
    ctx.fill()
    ctx.strokeStyle = '#8b6848'
    ctx.lineWidth = 5
    ctx.stroke()
    ctx.strokeStyle = '#3f3026'
    ctx.lineWidth = 2.6
    ctx.beginPath()
    ctx.moveTo(135, 112)
    ctx.lineTo(135, 92)
    ctx.moveTo(135, 112)
    ctx.lineTo(152, 118)
    ctx.stroke()
    ctx.restore()

    // Lukisan tenang di dinding kiri
    rrect(ctx, 76, 174, 128, 92, 6)
    ctx.fillStyle = '#e7f0e6'
    ctx.fill()
    ctx.strokeStyle = '#8b6848'
    ctx.lineWidth = 5
    ctx.stroke()
    ctx.fillStyle = '#7ba688'
    ctx.beginPath()
    ctx.arc(140, 232, 32, Math.PI, 0)
    ctx.fill()
    ctx.fillStyle = '#f2c777'
    ctx.beginPath()
    ctx.arc(166, 198, 12, 0, Math.PI * 2)
    ctx.fill()

    drawPottedPlant(ctx, 240, 412, 1.05)
    drawPottedPlant(ctx, w - 54, 424, 0.9)
  } else {
    // Ruang Lab Vokasi modern: jendela kampus besar tengah, papan tulis kiri, rak peralatan/buku kanan
    drawSunlitWindow(ctx, w * 0.33, 54, w * 0.35, 222, isSunset, false)
    const accent =
      id === 'elektronik' ? '#0ea5e9'
        : id === 'pemrograman' ? '#6366f1'
          : id === 'las' ? '#ea580c'
            : id === 'cetak-3d' ? '#14b8a6'
              : '#1d5d7a'
    drawWhiteboard(ctx, 40, 72, 244, 172, accent)
    drawBookshelf(ctx, w - 252, 64, 212, 290)

    // Meja praktikum & monitor / alat di latar tengah-bawah
    rrect(ctx, 320, 322, 320, 48, 8)
    ctx.fillStyle = '#475569'
    ctx.fill()
    rrect(ctx, 326, 314, 308, 16, 4)
    ctx.fillStyle = '#cbd5e1'
    ctx.fill()

    // Monitor / osiloskop menyala lembut
    rrect(ctx, 418, 250, 96, 62, 6)
    ctx.fillStyle = '#1e293b'
    ctx.fill()
    ctx.fillStyle = id === 'elektronik' ? '#0f3f4a' : '#1e3a5f'
    ctx.fillRect(424, 256, 84, 48)
    ctx.strokeStyle = '#38bdf8'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(430, 282)
    ctx.quadraticCurveTo(446, 262, 464, 282)
    ctx.quadraticCurveTo(482, 300, 502, 276)
    ctx.stroke()

    drawPottedPlant(ctx, w - 58, 434, 0.92)
  }

  // 3. Berkas cahaya matahari diagonal & suasana hangat sinematik
  drawSunbeams(ctx, w, h, isSunset)

  if (isSunset) {
    ctx.fillStyle = 'rgba(235, 148, 84, 0.12)'
    ctx.fillRect(0, 0, w, h)
  }

  return canvas
}

export function getPaintedSceneCanvas(
  id: SceneArtId,
  variant: SceneVariant,
): HTMLCanvasElement | HTMLImageElement | null {
  const ext = requestExternalScene(id, variant)
  if (ext) return ext
  const key = `${id}|${variant}`
  const hit = paintedCache.get(key)
  if (hit) return hit
  const made = paintToCanvas(id, variant)
  if (made) paintedCache.set(key, made)
  return made
}
