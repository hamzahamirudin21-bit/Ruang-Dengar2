import type { CharacterAppearance } from './appearance'
import { DOSEN_ID, DOSEN_LOOK } from './dosenLook'
import {
  SPRITE_H,
  SPRITE_W,
  flattenLayers,
  type AnimKind,
  type Direction,
  type PixelGrid,
  type SpriteLayer,
} from './pixelGrid'
import { normalizeFrame } from './spriteCompose'
import {
  HAND_PARTS,
  HEAD_PARTS,
  accessoryStamps,
  buildColorMap,
  legRows,
  viewOf,
  type ColorMap,
  type LegStep,
  type Stamp,
  type View,
} from './spriteParts'

/**
 * Sprite chibi 16x24 Dosen BK. Memakai kepala, tangan, kaki, dan rambut yang
 * sama dengan mahasiswa (spriteParts) agar skala dan gaya selaras, dengan badan
 * khusus: blazer navy, kemeja batik di celah kerah, lanyard kuning, kartu teal.
 * Kacamata tampil pada arah bawah/kiri/kanan lewat aksesori 'kacamata'.
 */

const APPEARANCE: CharacterAppearance = {
  studentId: DOSEN_ID,
  styleName: 'Dosen BK',
  body: { type: 'sedang', skinId: DOSEN_LOOK.skinId },
  outfit: {
    top: 'kemeja', topColor: DOSEN_LOOK.blazer.color,
    bottom: 'celana', bottomColor: 'navy',
    shoe: 'sepatu', shoeColor: 'maroon',
  },
  hair: { kind: 'pendek', colorId: DOSEN_LOOK.hair.colorId },
  // kacamata digambar khusus (GLASSES) agar lensa terang, bukan pita gelap
  accessories: [],
  sceneHint: 'ruang-istirahat',
}

const COLORS: ColorMap = {
  ...buildColorMap(APPEARANCE),
  O: DOSEN_LOOK.glasses.frame,
  // kilau lensa biru pucat
  j: '#cfe8f5',
  // celana arang dan sepatu pantofel cokelat gelap
  B: '#3b3f4d',
  b: '#272a35',
  S: '#4a2e1c',
  z: '#2b1a10',
  // kerah/lapel blazer
  L: DOSEN_LOOK.blazer.lapel,
  // kemeja batik parang: V emas, v cokelat
  V: DOSEN_LOOK.shirt.batik.color,
  v: DOSEN_LOOK.shirt.base,
  // lanyard dan kartu
  I: DOSEN_LOOK.lanyard.strap,
  J: DOSEN_LOOK.lanyard.card,
  // uban
  F: DOSEN_LOOK.hair.grey,
}

/** Badan atas (12x5) di (2,12) per arah. T blazer, t bayangan, L lapel. */
const TORSO: Readonly<Record<View, readonly string[]>> = {
  bawah: [
    '.oTLIVVILTo.',
    'oTtLIVVILtTo',
    'oTtTLIILTtTo',
    'oTtTTJJTTtTo',
    'ottTTJJTTtto',
  ],
  atas: [
    '.oTTTIITTTo.',
    'oTtTTttTTtTo',
    'oTtTTttTTtTo',
    'oTtTTttTTtTo',
    'ottTTttTTtto',
  ],
  kiri: [
    '..oITTTTTo..',
    '..oILTTTTo..',
    '..oJLtTTTo..',
    '..oJTtTTTo..',
    '..oTtttTTo..',
  ],
}

/** Pinggul (y=17..19): ujung blazer lalu celana. */
const HIPS: readonly string[] = ['..oTTTTTTo..', '..oBBBBBBo..', '..oBBbbBBo..']

/** Uban di pelipis, ditumpuk di atas rambut. */
const GREY: Readonly<Record<View, readonly string[]>> = {
  bawah: ['.F..........F.', '..F........F..'],
  atas: ['.F..........F.', '.F..F....F..F.'],
  kiri: ['.F............', '......F.......'],
}

/** Kacamata (x=3,y=5): bingkai gelap tipis, kilau lensa terang di atas pupil, tanpa bingkai bawah penuh. */
const GLASSES: Readonly<Record<View, readonly string[] | null>> = {
  bawah: ['OOOO..OOOO', 'OjjOOOOjjO', 'O..O..O..O', '.OO....OO.'],
  atas: null,
  kiri: ['OOOO......', 'OjjOOOOOOO', 'O..O......', '.OO.......'],
}

const WALK_DY = [1, 0, 1, 0]
const WALK_LEGS: readonly LegStep[] = ['a', 'stand', 'b', 'stand']

type Cells = (string | null)[]

function blank(): Cells {
  return new Array<string | null>(SPRITE_W * SPRITE_H).fill(null)
}

function stamp(cells: Cells, s: Stamp, dy: number): void {
  for (let r = 0; r < s.rows.length; r++) {
    const row = s.rows[r]
    const y = s.y + r + dy
    if (y < 0 || y >= SPRITE_H) continue
    for (let c = 0; c < row.length; c++) {
      const x = s.x + c
      if (x < 0 || x >= SPRITE_W) continue
      const color = COLORS[row[c]]
      if (color) cells[y * SPRITE_W + x] = color
    }
  }
}

function toGrid(cells: Cells): PixelGrid {
  return { width: SPRITE_W, height: SPRITE_H, cells }
}

function mirror(g: PixelGrid): PixelGrid {
  const cells: Cells = new Array<string | null>(g.cells.length).fill(null)
  for (let y = 0; y < g.height; y++) {
    for (let x = 0; x < g.width; x++) {
      cells[y * g.width + x] = g.cells[y * g.width + (g.width - 1 - x)]
    }
  }
  return { width: g.width, height: g.height, cells }
}

/** Sprite Dosen 16x24. Fungsi murni; frame di luar jangkauan dilipat. */
export function composeDosenSprite(dir: Direction, anim: AnimKind, frame: number): PixelGrid {
  const view = viewOf(dir)
  const f = normalizeFrame(anim, frame)
  const dy = anim === 'idle' ? f : WALK_DY[f]
  const legs: LegStep = anim === 'idle' ? 'stand' : WALK_LEGS[f]

  const tubuh = blank()
  stamp(tubuh, { x: 2, y: 2, rows: HEAD_PARTS[view] }, dy)
  stamp(tubuh, { x: 2, y: 17, rows: HAND_PARTS[view] }, dy)

  const pakaian = blank()
  stamp(pakaian, { x: 2, y: 12, rows: TORSO[view] }, dy)
  stamp(pakaian, { x: 2, y: 17, rows: HIPS }, 0)
  stamp(pakaian, { x: 2, y: 20, rows: legRows(view, legs) }, 0)

  const aksesori = blank()
  const parts = accessoryStamps(APPEARANCE, view)
  for (const s of parts.belakang) stamp(aksesori, s, dy)
  for (let i = 0; i < aksesori.length; i++) {
    if (tubuh[i] || pakaian[i]) aksesori[i] = null
  }
  for (const s of parts.depan) stamp(aksesori, s, dy)
  const glasses = GLASSES[view]
  if (glasses) stamp(aksesori, { x: 3, y: 5, rows: glasses }, dy)
  stamp(aksesori, { x: 1, y: view === 'kiri' ? 4 : 5, rows: GREY[view] }, dy)

  const layers: SpriteLayer[] = [
    { id: 'tubuh', grid: toGrid(tubuh) },
    { id: 'pakaian', grid: toGrid(pakaian) },
    { id: 'aksesori', grid: toGrid(aksesori) },
  ]
  const flat = flattenLayers(
    dir === 'kanan' ? layers.map((l) => ({ id: l.id, grid: mirror(l.grid) })) : layers,
    SPRITE_W,
    SPRITE_H,
  )
  return flat
}
