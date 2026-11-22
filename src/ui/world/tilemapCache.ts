import type { ConsultationDoorMode, LabMapData } from '../../types'
import { composeTilemapGrid } from './tilemap'

export type TilemapSurface = HTMLCanvasElement | OffscreenCanvas
export type TilemapSurfaceFactory = (w: number, h: number) => TilemapSurface | null

/** Piksel dunia per petak (28). */
const WORLD_TILE = 28

// Per peta (WeakMap) lalu per mode pintu.
const cache = new WeakMap<LabMapData, Map<ConsultationDoorMode, TilemapSurface>>()

function defaultFactory(w: number, h: number): TilemapSurface | null {
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
 * Kanvas latar tilemap (1 sel seni = 1 piksel, 560x336 untuk LAB_MAP) yang
 * dibuat sekali per mode pintu. Mengembalikan `null` bila kanvas atau konteks
 * 2D tidak tersedia; tidak pernah melempar.
 */
export function getTilemapCanvas(
  map: LabMapData,
  doorMode: ConsultationDoorMode,
  factory: TilemapSurfaceFactory = defaultFactory,
): TilemapSurface | null {
  const byMode = cache.get(map)
  const hit = byMode?.get(doorMode)
  if (hit) return hit
  try {
    const grid = composeTilemapGrid(map, doorMode)
    const surface = factory(grid.width, grid.height)
    const ctx = surface?.getContext('2d') as CanvasRenderingContext2D | null | undefined
    if (!surface || !ctx) return null
    for (let y = 0; y < grid.height; y++) {
      for (let x = 0; x < grid.width; x++) {
        const color = grid.cells[y * grid.width + x]
        if (!color) continue
        ctx.fillStyle = color
        ctx.fillRect(x, y, 1, 1)
      }
    }
    const modes = byMode ?? new Map<ConsultationDoorMode, TilemapSurface>()
    modes.set(doorMode, surface)
    if (!byMode) cache.set(map, modes)
    return surface
  } catch {
    return null
  }
}

/** Menggambar kanvas tilemap berskala 28 piksel dunia per petak, tanpa smoothing. */
export function drawTilemap(
  ctx: CanvasRenderingContext2D,
  canvas: TilemapSurface,
  map: LabMapData,
): void {
  ctx.imageSmoothingEnabled = false
  ctx.drawImage(canvas, 0, 0, map.width * WORLD_TILE, map.height * WORLD_TILE)
}
