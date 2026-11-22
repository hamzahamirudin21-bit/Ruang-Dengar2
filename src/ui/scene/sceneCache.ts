import { composeSceneArt, SCENE_H, SCENE_W, type SceneArtId, type SceneVariant } from './sceneArt'

export type SceneSurface = HTMLCanvasElement | OffscreenCanvas
export type SceneSurfaceFactory = (w: number, h: number) => SceneSurface | null

const cache = new Map<string, SceneSurface>()

function defaultFactory(w: number, h: number): SceneSurface | null {
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

/**
 * Kanvas latar adegan (SCENE_W x SCENE_H, 1 sel = 1 piksel) yang di-cache per
 * (id, varian). Mengembalikan `null` bila kanvas tidak tersedia.
 */
export function getSceneCanvas(
  id: SceneArtId,
  variant: SceneVariant,
  factory: SceneSurfaceFactory = defaultFactory,
): SceneSurface | null {
  const key = `${id}|${variant}`
  const hit = cache.get(key)
  if (hit) return hit
  try {
    const surface = factory(SCENE_W, SCENE_H)
    const ctx = surface?.getContext('2d') as CanvasRenderingContext2D | null | undefined
    if (!surface || !ctx) return null
    const grid = composeSceneArt(id, variant)
    for (let y = 0; y < grid.height; y++) {
      for (let x = 0; x < grid.width; x++) {
        const color = grid.cells[y * grid.width + x]
        if (!color) continue
        ctx.fillStyle = color
        ctx.fillRect(x, y, 1, 1)
      }
    }
    cache.set(key, surface)
    return surface
  } catch {
    return null
  }
}

export function clearSceneCache(): void {
  cache.clear()
}
