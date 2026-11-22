import {
  ASSET_BASE,
  assetUrl,
  loadManifest,
  resolveSpriteSource,
  spriteSheetCell,
  type AssetManifest,
} from './assetSlots'
import { CHIBI_SURF_H, CHIBI_SURF_W, drawIllustratedChibiSprite } from './illustratedSprite'
import { SPRITE_H, SPRITE_W, type AnimKind, type Direction } from './pixelGrid'

/** Skala cache luar layar: tiap sel piksel menjadi 2x2 piksel kanvas. */
export const CACHE_SCALE = 2

type Surface = HTMLCanvasElement | OffscreenCanvas

const cache = new Map<string, Surface>()
const loadedImages = new Map<string, HTMLImageElement>()
const loadedUrls = new Set<string>()
const assetReadyListeners = new Set<() => void>()
let manifest: AssetManifest | null = null
let assetsRequested = false

/** Mendaftar pembaruan saat aset sprite eksternal selesai dimuat (mis. untuk kartu roster statis). */
export function onSpriteAssetsReady(listener: () => void): () => void {
  assetReadyListeners.add(listener)
  requestAssets()
  return () => {
    assetReadyListeners.delete(listener)
  }
}

function notifySpriteAssetsReady(): void {
  for (const fn of assetReadyListeners) {
    try {
      fn()
    } catch {
      /* abaikan galat listener */
    }
  }
}

export interface DrawSpriteOptions {
  studentId: string
  dir: Direction
  anim: AnimKind
  frame: number
  /** Titik tengah-bawah sprite (kaki) pada kanvas tujuan. */
  x: number
  y: number
  /** Lebar tampil dalam piksel kanvas; tinggi mengikuti rasio 16:24. */
  width: number
  fallback?: { hairStyle: 'pendek' | 'sedang' | 'ikat' | 'kerudung'; avatarHue: number }
}

function createSurface(w: number, h: number): Surface | null {
  try {
    if (typeof document !== 'undefined') {
      const c = document.createElement('canvas')
      c.width = w
      c.height = h
      return c
    }
    if (typeof OffscreenCanvas !== 'undefined') return new OffscreenCanvas(w, h)
  } catch {
    /* kanvas tak tersedia */
  }
  return null
}

/** Memuat manifest dan gambar sprite sekali di latar belakang; galat diabaikan. */
function requestAssets(): void {
  if (assetsRequested) return
  assetsRequested = true
  if (typeof Image === 'undefined') return
  void loadManifest()
    .then((m) => {
      manifest = m
      if (!m) return
      for (const entry of Object.values(m.characters)) {
        if (!entry.sprite) continue
        const url = assetUrl(entry.sprite)
        if (!url.startsWith(`${ASSET_BASE}/`)) continue
        const img = new Image()
        img.onload = () => {
          loadedImages.set(url, img)
          loadedUrls.add(url)
          notifySpriteAssetsReady()
        }
        img.onerror = () => undefined
        img.src = url
      }
    })
    .catch(() => undefined)
}

function renderToSurface(opts: DrawSpriteOptions): Surface | null {
  const surface = createSurface(CHIBI_SURF_W, CHIBI_SURF_H)
  const ctx = surface?.getContext('2d') as CanvasRenderingContext2D | null | undefined
  if (!surface || !ctx) return null
  drawIllustratedChibiSprite(ctx, {
    studentId: opts.studentId,
    dir: opts.dir,
    anim: opts.anim,
    frame: opts.frame,
    fallback: opts.fallback,
  })
  return surface
}

export function drawSprite(ctx: CanvasRenderingContext2D, opts: DrawSpriteOptions): void {
  requestAssets()
  const w = opts.width
  const h = (w * SPRITE_H) / SPRITE_W
  const dx = opts.x - w / 2
  const dy = opts.y - h
  const prevSmoothing = ctx.imageSmoothingEnabled
  try {
    const source = resolveSpriteSource(opts.studentId, manifest, loadedUrls)
    if (source.kind === 'aset') {
      const img = loadedImages.get(source.url)
      if (img) {
        const smooth = source.cell.w > 48
        ctx.imageSmoothingEnabled = smooth
        if (smooth && 'imageSmoothingQuality' in ctx) {
          ctx.imageSmoothingQuality = 'high'
        }
        const { col, row } = spriteSheetCell(opts.dir, opts.anim, opts.frame)
        ctx.drawImage(
          img,
          col * source.cell.w, row * source.cell.h, source.cell.w, source.cell.h,
          dx, dy, w, h,
        )
        return
      }
    }
    ctx.imageSmoothingEnabled = true
    const key = `${opts.studentId}|${opts.dir}|${opts.anim}|${opts.frame}`
    let surface = cache.get(key)
    if (!surface) {
      const made = renderToSurface(opts)
      if (!made) return
      cache.set(key, made)
      surface = made
    }
    ctx.drawImage(surface as CanvasImageSource, dx, dy, w, h)
  } finally {
    ctx.imageSmoothingEnabled = prevSmoothing
  }
}

export function clearSpriteCache(): void {
  cache.clear()
}
