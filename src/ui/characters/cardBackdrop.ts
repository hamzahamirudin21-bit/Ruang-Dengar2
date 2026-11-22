import type { ZoneType } from '../../types'
import type { PixelGrid } from './pixelGrid'

export type SceneBackdropId =
  | 'lab-elektronik'
  | 'lab-pemrograman'
  | 'bengkel-las'
  | 'lab-cetak3d'
  | 'gudang-alat'
  | 'meja-diskusi'
  | 'ruang-istirahat'

const ZONE_BACKDROP: Record<ZoneType, SceneBackdropId> = {
  'elektronik-iot': 'lab-elektronik',
  pemrograman: 'lab-pemrograman',
  las: 'bengkel-las',
  'cetak-3d': 'lab-cetak3d',
  'gudang-alat': 'gudang-alat',
  diskusi: 'meja-diskusi',
  istirahat: 'ruang-istirahat',
  'ruang-dosen': 'ruang-istirahat',
  konsultasi: 'ruang-istirahat',
}

export function backdropForZone(zoneId: ZoneType): SceneBackdropId {
  return ZONE_BACKDROP[zoneId] ?? 'ruang-istirahat'
}

interface BackdropTheme {
  wall: string
  wallShade: string
  floor: string
  floorShade: string
  prop: string
  propLight: string
}

const THEMES: Record<SceneBackdropId, BackdropTheme> = {
  'lab-elektronik': { wall: '#2f4858', wallShade: '#273d4a', floor: '#4a5d68', floorShade: '#41535d', prop: '#3fb0a0', propLight: '#8be0d2' },
  'lab-pemrograman': { wall: '#2c3252', wallShade: '#252a45', floor: '#454b6b', floorShade: '#3d4361', prop: '#6c8cff', propLight: '#b4c4ff' },
  'bengkel-las': { wall: '#4a3a30', wallShade: '#3f3129', floor: '#5f5047', floorShade: '#554740', prop: '#e8872b', propLight: '#ffc37a' },
  'lab-cetak3d': { wall: '#35524a', wallShade: '#2d463f', floor: '#4e6a62', floorShade: '#46615a', prop: '#f0a830', propLight: '#ffd987' },
  'gudang-alat': { wall: '#4d4a3a', wallShade: '#423f31', floor: '#625e4c', floorShade: '#585444', prop: '#a07a45', propLight: '#d1ad78' },
  'meja-diskusi': { wall: '#4a3b55', wallShade: '#40334a', floor: '#625470', floorShade: '#584b65', prop: '#c98a52', propLight: '#efc08c' },
  'ruang-istirahat': { wall: '#4f6a5b', wallShade: '#445d50', floor: '#6a8070', floorShade: '#607566', prop: '#d9b36a', propLight: '#f2dca6' },
}

/**
 * Latar kartu pixel art. Deterministik: hanya bergantung pada id, lebar, dan tinggi.
 * Dinding (atas) dengan jendela/panel, lantai berpola papan catur halus (bawah),
 * dan satu benda khas tema di sisi kiri atas.
 */
export function paintBackdrop(id: SceneBackdropId, width: number, height: number): PixelGrid {
  const w = Math.max(1, Math.floor(width))
  const h = Math.max(1, Math.floor(height))
  const t = THEMES[id] ?? THEMES['ruang-istirahat']
  const cells: (string | null)[] = new Array(w * h).fill(null)
  const horizon = Math.floor(h * 0.62)
  const set = (x: number, y: number, c: string) => {
    if (x >= 0 && x < w && y >= 0 && y < h) cells[y * w + x] = c
  }

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (y < horizon) {
        set(x, y, Math.floor(x / 8) % 2 === 0 ? t.wall : t.wallShade)
      } else {
        set(x, y, (Math.floor(x / 6) + Math.floor(y / 6)) % 2 === 0 ? t.floor : t.floorShade)
      }
    }
  }

  // Panel/jendela di dinding: dua persegi panjang berbingkai.
  const panelW = Math.max(6, Math.floor(w * 0.22))
  const panelH = Math.max(6, Math.floor(horizon * 0.34))
  const panelY = Math.floor(horizon * 0.2)
  for (const px of [Math.floor(w * 0.5), Math.floor(w * 0.76)]) {
    for (let y = 0; y < panelH; y++) {
      for (let x = 0; x < panelW; x++) {
        const edge = x === 0 || y === 0 || x === panelW - 1 || y === panelH - 1
        set(px + x, panelY + y, edge ? t.propLight : t.prop)
      }
    }
  }

  // Meja/rak rendah sepanjang garis cakrawala.
  for (let x = 0; x < w; x++) {
    set(x, horizon, t.propLight)
    set(x, horizon + 1, t.prop)
  }

  // Benda khas tema: blok bertingkat di kiri.
  const blockW = Math.max(5, Math.floor(w * 0.14))
  const blockH = Math.max(5, Math.floor(horizon * 0.3))
  const bx = Math.floor(w * 0.08)
  const by = horizon - blockH
  for (let y = 0; y < blockH; y++) {
    for (let x = 0; x < blockW; x++) {
      set(bx + x, by + y, y === 0 || x === 0 ? t.propLight : t.prop)
    }
  }

  return { width: w, height: h, cells }
}
