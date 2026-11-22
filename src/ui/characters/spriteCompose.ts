import type { CharacterAppearance } from './appearance'
import {
  IDLE_FRAMES,
  SPRITE_H,
  SPRITE_W,
  WALK_FRAMES,
  flattenLayers,
  type AnimKind,
  type Direction,
  type PixelGrid,
  type SpriteLayer,
} from './pixelGrid'
import {
  HAND_PARTS,
  HEAD_PARTS,
  accessoryStamps,
  buildColorMap,
  hipRows,
  legRows,
  torsoRows,
  viewOf,
  type ColorMap,
  type LegStep,
  type Stamp,
} from './spriteParts'

/** Frame di luar jangkauan dilipat dengan modulo; nilai non-bilangan bulat jadi 0. */
export function normalizeFrame(anim: AnimKind, frame: number): number {
  const count = anim === 'jalan' ? WALK_FRAMES : IDLE_FRAMES
  if (!Number.isFinite(frame)) return 0
  const f = Math.trunc(frame)
  return ((f % count) + count) % count
}

interface Pose {
  /** Pergeseran badan atas (kepala, badan, tangan, aksesori) ke bawah, dalam sel. */
  dy: number
  legs: LegStep
}

const WALK_DY = [1, 0, 1, 0]
const WALK_LEGS: readonly LegStep[] = ['a', 'stand', 'b', 'stand']

function poseFor(anim: AnimKind, frame: number): Pose {
  if (anim === 'idle') return { dy: frame, legs: 'stand' }
  return { dy: WALK_DY[frame], legs: WALK_LEGS[frame] }
}

type Cells = (string | null)[]

function blank(): Cells {
  return new Array<string | null>(SPRITE_W * SPRITE_H).fill(null)
}

function stamp(cells: Cells, colors: ColorMap, s: Stamp, dy: number): void {
  for (let r = 0; r < s.rows.length; r++) {
    const row = s.rows[r]
    const y = s.y + r + dy
    if (y < 0 || y >= SPRITE_H) continue
    for (let c = 0; c < row.length; c++) {
      const x = s.x + c
      if (x < 0 || x >= SPRITE_W) continue
      const raw = row[c]
      const ch = s.remap?.[raw] ?? raw
      const color = colors[ch]
      if (color) cells[y * SPRITE_W + x] = color
    }
  }
}

function toGrid(cells: Cells): PixelGrid {
  return { width: SPRITE_W, height: SPRITE_H, cells }
}

function mirrorGrid(g: PixelGrid): PixelGrid {
  const cells: Cells = new Array<string | null>(g.cells.length).fill(null)
  for (let y = 0; y < g.height; y++) {
    for (let x = 0; x < g.width; x++) {
      cells[y * g.width + x] = g.cells[y * g.width + (g.width - 1 - x)]
    }
  }
  return { width: g.width, height: g.height, cells }
}

/** Tiga lapisan dengan urutan tetap: tubuh, pakaian, aksesori. */
export function composeSpriteLayers(
  a: CharacterAppearance,
  dir: Direction,
  anim: AnimKind,
  frame: number,
): readonly SpriteLayer[] {
  const view = viewOf(dir)
  const f = normalizeFrame(anim, frame)
  const pose = poseFor(anim, f)
  const colors = buildColorMap(a)
  const { dy } = pose

  // Layer 1: tubuh (kepala, wajah, tangan, kaki berkulit untuk rok)
  const tubuh = blank()
  stamp(tubuh, colors, { x: 2, y: 2, rows: HEAD_PARTS[view] }, dy)
  stamp(tubuh, colors, { x: 2, y: 17, rows: HAND_PARTS[view] }, dy)
  const legs = legRows(view, pose.legs)
  if (a.outfit.bottom === 'rok') {
    stamp(tubuh, colors, {
      x: 2, y: 20, rows: legs,
      remap: { B: 's', b: 'd', o: '.', S: '.', z: '.' },
    }, 0)
  }

  // Layer 2: pakaian (atasan, bawahan, sepatu)
  const pakaian = blank()
  stamp(pakaian, colors, { x: 2, y: 12, rows: torsoRows(view, a.outfit.top) }, dy)
  stamp(pakaian, colors, { x: 2, y: 17, rows: hipRows(a.outfit.bottom, a.outfit.top) }, 0)
  stamp(pakaian, colors, {
    x: 2, y: 20, rows: legs,
    remap: a.outfit.bottom === 'rok' ? { B: '.', b: '.' } : undefined,
  }, 0)

  // Layer 3: rambut dan aksesori. Bagian "belakang" disembunyikan oleh tubuh/pakaian.
  const aksesori = blank()
  const parts = accessoryStamps(a, view)
  for (const s of parts.belakang) stamp(aksesori, colors, s, dy)
  for (let i = 0; i < aksesori.length; i++) {
    if (tubuh[i] || pakaian[i]) aksesori[i] = null
  }
  for (const s of parts.depan) stamp(aksesori, colors, s, dy)

  const layers: SpriteLayer[] = [
    { id: 'tubuh', grid: toGrid(tubuh) },
    { id: 'pakaian', grid: toGrid(pakaian) },
    { id: 'aksesori', grid: toGrid(aksesori) },
  ]
  return dir === 'kanan'
    ? layers.map((l) => ({ id: l.id, grid: mirrorGrid(l.grid) }))
    : layers
}

export function composeSprite(
  a: CharacterAppearance,
  dir: Direction,
  anim: AnimKind,
  frame: number,
): PixelGrid {
  return flattenLayers(composeSpriteLayers(a, dir, anim, frame), SPRITE_W, SPRITE_H)
}
