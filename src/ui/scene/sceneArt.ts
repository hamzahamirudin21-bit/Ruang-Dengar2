/**
 * Latar adegan 384×216 (lukisan logis 192×108 diperbesar 2× + lapisan detail) bergaya visual novel, dibuat sebagai `PixelGrid` murni.
 * Setiap `SceneArtId` memiliki komposisi, palet, dan prop khas sendiri.
 */
import type { PixelGrid } from '../characters/pixelGrid'
import type { StoryScene } from '../../engine/story/storyTypes'
import type { ZoneType } from '../../types'
import {
  blendPx, box, createCanvas, disc, ellipse, getPx, glow, hline, line, mix, paintChair,
  paintCeilingStrip, paintClock, paintCrates, paintCylinder, paintDesk, paintDrawerWall,
  paintFrame, paintLaptop, paintMonitor, paintOscilloscope, paintPendantLamp, paintPlant,
  paintPrinter3d, paintRobotArm, paintRug, paintServerRack, paintShelf, paintSofa,
  paintWeldingBooth, paintWhiteboard, paintWindow, px, rect, rng, shade, shadowRect, thickLine,
  tint, toGrid, vgrad, vline,
} from './sceneProps'
import type { Canvas, Variant } from './sceneProps'
import { paintSceneDetail, upscaleCanvas } from './sceneDetail'

export type SceneArtId =
  | 'lab-umum' | 'cetak-3d' | 'elektronik' | 'pemrograman' | 'las'
  | 'gudang' | 'diskusi' | 'istirahat' | 'ruang-bk' | 'ruang-dosen'
  | 'studio-desain' | 'pojok-baca'

export type SceneVariant = Variant

export const SCENE_SCALE = 2
export const SCENE_LOGICAL_W = 192
export const SCENE_LOGICAL_H = 108
export const SCENE_W = SCENE_LOGICAL_W * SCENE_SCALE
export const SCENE_H = SCENE_LOGICAL_H * SCENE_SCALE

export const SCENE_ART_IDS: readonly SceneArtId[] = [
  'lab-umum', 'cetak-3d', 'elektronik', 'pemrograman', 'las',
  'gudang', 'diskusi', 'istirahat', 'ruang-bk', 'ruang-dosen',
  'studio-desain', 'pojok-baca',
]

const ZONE_TO_ART: Partial<Record<ZoneType, SceneArtId>> = {
  'cetak-3d': 'cetak-3d',
  'elektronik-iot': 'elektronik',
  pemrograman: 'pemrograman',
  las: 'las',
  'gudang-alat': 'gudang',
  diskusi: 'diskusi',
  istirahat: 'istirahat',
  'studio-desain': 'studio-desain',
  'pojok-baca': 'pojok-baca',
}

export function resolveSceneArt(input: {
  setting: StoryScene['setting']
  zoneId: ZoneType | null
}): SceneArtId {
  if (input.setting === 'ruang-konsultasi') return 'ruang-bk'
  if (input.zoneId === null) return 'lab-umum'
  return ZONE_TO_ART[input.zoneId] ?? 'lab-umum'
}

export function sceneVariantForGraph(graphId: string): SceneVariant {
  return graphId.includes('lanjutan') ? 'sore' : 'pagi'
}

// ------------------------------------------------------------ pembantu
const FLOOR_Y = 70

function drawWall(c: Canvas, top: string, bot: string, baseboard: string): void {
  vgrad(c, 0, 0, SCENE_LOGICAL_W, FLOOR_Y, top, bot, 10)
  rect(c, 0, FLOOR_Y - 3, SCENE_LOGICAL_W, 3, baseboard)
  hline(c, 0, FLOOR_Y - 3, SCENE_LOGICAL_W, shade(baseboard, 0.3))
  hline(c, 0, FLOOR_Y - 1, SCENE_LOGICAL_W, shade(baseboard, -0.25))
  // bayangan sudut atas dinding
  for (let j = 0; j < 6; j++) tint(c, 0, j, SCENE_LOGICAL_W, 1, '#0b0f1a', 0.22 - j * 0.035)
}

type FloorKind = 'ubin' | 'kayu' | 'beton' | 'karpet'

function drawFloor(c: Canvas, kind: FloorKind, base: string, seed = 1): void {
  const r = rng(seed)
  const rows = [70, 73, 77, 82, 88, 95, 103, 112]
  rect(c, 0, FLOOR_Y, SCENE_LOGICAL_W, SCENE_LOGICAL_H - FLOOR_Y, base)
  for (let i = 0; i < rows.length - 1; i++) {
    const y0 = rows[i] as number
    const y1 = rows[i + 1] as number
    const rowCol = mix(base, i % 2 ? '#000000' : '#ffffff', 0.04)
    rect(c, 0, y0, SCENE_LOGICAL_W, y1 - y0, rowCol)
    if (kind === 'karpet') continue
    hline(c, 0, y0, SCENE_LOGICAL_W, shade(base, kind === 'kayu' ? -0.3 : -0.18))
    if (kind === 'kayu') {
      const sp = 22 + i * 7
      const off = (i * 11) % sp
      for (let x = -off; x < SCENE_LOGICAL_W; x += sp) vline(c, x, y0, y1 - y0, shade(base, -0.28))
      for (let k = 0; k < 6; k++) hline(c, Math.floor(r() * SCENE_LOGICAL_W), y0 + 1 + Math.floor(r() * Math.max(1, y1 - y0 - 1)), 6 + Math.floor(r() * 10), shade(base, 0.1))
    } else if (kind === 'ubin') {
      const scale = 0.55 + ((y0 - FLOOR_Y) / 38) * 1.1
      for (let k = -14; k <= 14; k++) vline(c, Math.round(96 + k * 16 * scale), y0, y1 - y0, shade(base, -0.14))
      hline(c, 0, y0 + 1, SCENE_LOGICAL_W, shade(base, 0.12))
    } else {
      for (let k = 0; k < 22; k++) px(c, Math.floor(r() * SCENE_LOGICAL_W), y0 + Math.floor(r() * (y1 - y0)), shade(base, r() > 0.5 ? 0.14 : -0.16))
    }
  }
  if (kind === 'karpet') {
    for (let k = 0; k < 260; k++) px(c, Math.floor(r() * SCENE_LOGICAL_W), FLOOR_Y + Math.floor(r() * 38), shade(base, r() > 0.5 ? 0.1 : -0.1))
  }
  // pantulan di dekat dinding
  for (let j = 0; j < 8; j++) tint(c, 0, FLOOR_Y + j, SCENE_LOGICAL_W, 1, '#ffffff', 0.1 - j * 0.012)
  shadowRect(c, 0, FLOOR_Y, SCENE_LOGICAL_W, 2, 0.25)
}

/** Jalur cahaya dari jendela jatuh ke lantai. */
function lightBeam(c: Canvas, x0: number, x1: number, col: string, t: number, slant = 18): void {
  for (let y = FLOOR_Y; y < SCENE_LOGICAL_H; y++) {
    const k = (y - FLOOR_Y) / (SCENE_LOGICAL_H - FLOOR_Y)
    const off = Math.round(k * slant)
    for (let x = x0 + off; x < x1 + off + Math.round(k * 10); x++) blendPx(c, x, y, col, t * (1 - k * 0.5))
  }
}

function vignette(c: Canvas, strength = 0.3): void {
  for (let y = 0; y < SCENE_LOGICAL_H; y++) {
    for (let x = 0; x < SCENE_LOGICAL_W; x++) {
      const dx = (x - SCENE_LOGICAL_W / 2) / (SCENE_LOGICAL_W / 2)
      const dy = (y - SCENE_LOGICAL_H / 2) / (SCENE_LOGICAL_H / 2)
      const d = Math.max(0, Math.sqrt(dx * dx * 0.8 + dy * dy * 0.9) - 0.55)
      const t = Math.min(strength, d * d * strength * 2.2)
      if (t > 0.01) blendPx(c, x, y, '#070a14', Math.round(t * 16) / 16)
    }
  }
}

const GLYPHS: Record<string, string[]> = {
  G: ['111', '100', '101', '101', '111'],
  U: ['101', '101', '101', '101', '111'],
  D: ['110', '101', '101', '101', '110'],
  A: ['010', '101', '111', '101', '101'],
  N: ['111', '101', '101', '101', '101'],
  '3': ['111', '001', '111', '001', '111'],
  '<': ['001', '010', '100', '010', '001'],
  '>': ['100', '010', '001', '010', '100'],
  '/': ['001', '001', '010', '100', '100'],
}
function glyphText(c: Canvas, x: number, y: number, text: string, col: string): void {
  let ix = x
  for (const ch of text) {
    const g = GLYPHS[ch]
    if (g) {
      for (let j = 0; j < 5; j++) {
        for (let i = 0; i < 3; i++) if (g[j]?.[i] === '1') px(c, ix + i, y + j, col)
      }
    }
    ix += 4
  }
}

function pegboard(c: Canvas, x: number, y: number, w: number, h: number, seed: number): void {
  const r = rng(seed)
  box(c, x, y, w, h, '#cdb98c')
  for (let j = 2; j < h - 1; j += 3) for (let i = 2; i < w - 1; i += 3) px(c, x + i, y + j, '#9a8760')
  const toolCols = ['#e5533d', '#4d8fc4', '#e8c447', '#59a67a']
  let ix = x + 4
  while (ix < x + w - 8) {
    const kind = Math.floor(r() * 3)
    const col = toolCols[Math.floor(r() * toolCols.length)] as string
    if (kind === 0) {
      rect(c, ix, y + 4, 2, 11, '#aeb8c0')
      rect(c, ix - 1, y + 14, 4, 6, col)
    } else if (kind === 1) {
      rect(c, ix, y + 5, 2, 12, col)
      rect(c, ix - 2, y + 3, 6, 3, '#59636d')
    } else {
      disc(c, ix + 1, y + 8, 3, '#59636d')
      disc(c, ix + 1, y + 8, 1.2, '#cdb98c')
      rect(c, ix, y + 11, 2, 8, col)
    }
    shadowRect(c, ix + 2, y + 5, 1, 12, 0.15)
    ix += 8
  }
}

function warm(c: Canvas, variant: Variant): void {
  if (variant !== 'sore') return
  tint(c, 0, 0, SCENE_LOGICAL_W, SCENE_LOGICAL_H, '#ff9a4a', 0.12)
  tint(c, 0, 0, SCENE_LOGICAL_W, SCENE_LOGICAL_H, '#3a1030', 0.06)
}

function standBase(c: Canvas, y: number, h: number, color: string): void {
  rect(c, 0, y, SCENE_LOGICAL_W, h, color)
}

// ------------------------------------------------------------- adegan
function sceneLabUmum(c: Canvas, v: Variant): void {
  drawWall(c, '#d3dde3', '#b4c4cd', '#8d9ca6')
  // panel dinding bawah
  rect(c, 0, 50, SCENE_LOGICAL_W, 17, '#a9bac4')
  hline(c, 0, 50, SCENE_LOGICAL_W, '#e9f0f3')
  drawFloor(c, 'ubin', '#9ba8ae', 3)
  paintWindow(c, 52, 11, 84, 42, { variant: v, view: 'pohon', cols: 4, rows: 2, seed: 21 })
  paintShelf(c, 4, 8, 30, 61, { seed: 5, rows: 5, tone: 'abu' })
  pegboard(c, 148, 10, 40, 30, 9)
  paintFrame(c, 150, 44, 14, 10, '#8fb8d8', '#59636d')
  paintClock(c, 176, 50)
  for (const x of [32, 94, 156]) paintCeilingStrip(c, x - 12, 0, 24)
  // meja kiri: printer 3D
  paintDesk(c, 4, 76, 86, { legs: 20, wood: '#d6dde1' })
  paintPrinter3d(c, 40, 44, { model: '#f08a24', filament: '#e5533d' })
  paintPrinter3d(c, 8, 48, { model: '#34b3a0', filament: '#2d9dd0', w: 26, h: 28 })
  paintLaptop(c, 48+24, 76, 'cad', 3)
  box(c, 56, 71, 7, 5, '#e0b24a')
  box(c, 62, 73, 6, 3, '#4d8fc4')
  // meja kanan: lengan robot + monitor
  paintDesk(c, 98, 78, 90, { legs: 20, wood: '#d6dde1' })
  paintRobotArm(c, 114, 78)
  paintMonitor(c, 148, 62, 17, 13, { kind: 'cad', seed: 2 })
  paintMonitor(c, 168, 64, 16, 11, { kind: 'kode', seed: 6 })
  rect(c, 150, 76, 14, 1, '#4b5560')
  box(c, 134, 74, 7, 4, '#c9c2b0')
  // kursi & tanaman & kabel
  paintChair(c, 76, 86, '#46607a')
  paintPlant(c, 92, 106, 1, 3)
  line(c, 70, 100, 96, 106, '#1d2127')
  lightBeam(c, 56, 100, '#fff4cf', 0.14, 22)
  vignette(c, 0.3)
}

function sceneCetak3d(c: Canvas, v: Variant): void {
  drawWall(c, '#2e5560', '#1f3a43', '#17282e')
  // panel sisi gelap bergaris
  for (let x = 0; x < SCENE_LOGICAL_W; x += 24) vline(c, x, 4, 62, '#1a3038')
  drawFloor(c, 'beton', '#4a5358', 4)
  // garis aman kuning
  for (let x = 0; x < SCENE_LOGICAL_W; x += 8) {
    rect(c, x, 100, 4, 3, '#e8c447')
    rect(c, x + 4, 100, 4, 3, '#1d2127')
  }
  // rak gulungan filamen
  box(c, 6, 6, 104, 48, '#27343b')
  const cols = ['#e5533d', '#f08a24', '#e8c447', '#59a67a', '#2d9dd0', '#8a6bb8', '#d98fa0', '#e8e4d8', '#34b3a0', '#c8d0d6']
  for (let row = 0; row < 2; row++) {
    const by = 10 + row * 22
    rect(c, 8, by + 18, 100, 3, '#59636d')
    hline(c, 8, by + 18, 100, '#9fb0bb')
    for (let k = 0; k < 9; k++) {
      const col = cols[(k + row * 4) % cols.length] as string
      const cx = 16 + k * 11
      disc(c, cx, by + 8, 8, shade(col, -0.25))
      disc(c, cx, by + 8, 7, col)
      disc(c, cx - 1, by + 7, 4, shade(col, 0.28))
      disc(c, cx, by + 8, 2.5, '#1d2127')
      px(c, cx, by + 8, '#c8d0d6')
      for (let a = 0; a < 6; a++) px(c, cx + Math.round(Math.cos(a) * 5.5), by + 8 + Math.round(Math.sin(a) * 5.5), shade(col, -0.35))
    }
  }
  // neon "3D"
  box(c, 118, 8, 28, 14, '#14242a')
  glyphText(c, 122, 12, '3D', '#ff6bd6')
  glow(c, 132, 15, 22, '#ff6bd6', 0.45)
  // rak model cetakan
  paintShelf(c, 152, 8, 36, 58, { seed: 12, rows: 3, tone: 'logam' })
  for (let k = 0; k < 3; k++) {
    for (let i = 0; i < 3; i++) {
      const col = cols[(k * 3 + i * 2) % cols.length] as string
      const ox = 156 + i * 10
      const oy = 22 + k * 19
      for (let s = 0; s < 6; s++) rect(c, ox + Math.floor(s / 2), oy - s, 7 - s, 1, s % 2 ? shade(col, -0.1) : col)
    }
  }
  // meja panjang + dua printer besar
  paintDesk(c, 4, 80, 140, { legs: 18, wood: '#59636d', shadow: true })
  paintPrinter3d(c, 10, 47, { model: '#f08a24', filament: '#2d9dd0', w: 34, h: 33 })
  paintPrinter3d(c, 54, 47, { model: '#34b3a0', filament: '#e5533d', w: 34, h: 33 })
  paintPrinter3d(c, 98, 52, { model: '#e8c447', filament: '#59a67a', w: 28, h: 28, led: false })
  box(c, 130, 74, 10, 6, '#d98fa0')
  rect(c, 132, 71, 6, 3, '#e8e4d8')
  // kardus & tong
  paintCrates(c, 152, 76, 20, 16, '#a67c52')
  paintCrates(c, 168, 84, 20, 14, '#b98a56')
  glow(c, 28, 63, 26, '#ffd9a0', 0.22)
  glow(c, 72, 63, 26, '#ffd9a0', 0.22)
  paintCeilingStrip(c, 20, 0, 30, '#cfeeff')
  paintCeilingStrip(c, 100, 0, 30, '#cfeeff')
  if (v === 'sore') tint(c, 0, 0, SCENE_LOGICAL_W, 60, '#ff7a30', 0.04)
  vignette(c, 0.4)
}

function sceneElektronik(c: Canvas, _v: Variant): void {
  drawWall(c, '#2b3753', '#1d2640', '#141a2e')
  drawFloor(c, 'ubin', '#46505f', 6)
  paintDrawerWall(c, 6, 8, 10, 6, 7)
  // poster skematik
  box(c, 108, 10, 34, 26, '#0f2a3a')
  const sch = '#5bd7f0'
  hline(c, 112, 22, 8, sch)
  rect(c, 120, 18, 2, 8, sch)
  hline(c, 124, 22, 10, sch)
  rect(c, 134, 19, 3, 6, sch)
  vline(c, 112, 16, 6, sch)
  hline(c, 112, 16, 18, sch)
  vline(c, 130, 16, 6, sch)
  hline(c, 112, 30, 24, sch)
  vline(c, 112, 22, 8, sch)
  disc(c, 140, 30, 1, '#e8c447')
  glow(c, 125, 23, 24, '#5bd7f0', 0.22)
  // papan kabel kanan
  box(c, 150, 10, 36, 40, '#3a2f2a')
  for (let k = 0; k < 6; k++) {
    const colk = ['#e5533d', '#e8c447', '#59a67a', '#4d8fc4', '#f2f2f2', '#d98fa0'][k] as string
    line(c, 154 + k * 5, 12, 156 + k * 5 + (k % 2 ? 3 : -3), 26 + (k % 3) * 6, colk)
    thickLine(c, 156 + k * 5 + (k % 2 ? 3 : -3), 26 + (k % 3) * 6, 156 + k * 5 + (k % 2 ? 2 : -2), 40, 1, colk)
  }
  // lampu LED strip dinding
  for (let x = 4; x < SCENE_LOGICAL_W - 4; x++) {
    px(c, x, 58, x % 12 < 6 ? '#31e3ff' : '#ff4fd8')
  }
  glow(c, 48, 60, 40, '#31e3ff', 0.18)
  glow(c, 140, 60, 40, '#ff4fd8', 0.15)
  // meja kerja
  paintDesk(c, 4, 78, 184, { legs: 20, wood: '#59636d' })
  rect(c, 6, 76, 180, 2, '#2f6e4e') // alas ESD
  hline(c, 6, 76, 180, '#4aa077')
  paintOscilloscope(c, 14, 61)
  paintMonitor(c, 46, 62, 22, 14, { kind: 'grafik', seed: 1, glow: '#5bf0a4' })
  // breadboard + LED
  box(c, 76, 72, 22, 5, '#f2efe6')
  for (let i = 0; i < 9; i++) px(c, 78 + i * 2, 74, '#8a959e')
  px(c, 80, 73, '#e5533d')
  px(c, 88, 73, '#4d8fc4')
  px(c, 92, 73, '#59a67a')
  line(c, 80, 74, 88, 70, '#e8c447')
  line(c, 88, 70, 92, 74, '#e5533d')
  glow(c, 80, 72, 10, '#ff6a6a', 0.45)
  // PCB hijau
  box(c, 104, 71, 16, 6, '#1f7a52')
  for (let i = 0; i < 5; i++) px(c, 106 + i * 3, 73, '#e8c447')
  rect(c, 110, 72, 4, 3, '#222831')
  // stasiun solder + ujung membara
  box(c, 128, 66, 14, 10, '#d9dfe3')
  rect(c, 130, 68, 6, 3, '#2a2f36')
  px(c, 139, 68, '#e5533d')
  line(c, 141, 68, 150, 74, '#59636d')
  px(c, 151, 75, '#ff9a2e')
  glow(c, 151, 75, 10, '#ff9a2e', 0.6)
  line(c, 142, 70, 152, 76, '#2a2f36')
  // multimeter
  box(c, 160, 62, 12, 14, '#e8c447')
  rect(c, 162, 64, 8, 4, '#c8e0b4')
  disc(c, 166, 72, 2.2, '#2a2f36')
  px(c, 166, 70, '#ffffff')
  // bangku
  paintChair(c, 88, 84, '#c0553f')
  paintChair(c, 130, 86, '#c0553f')
  glow(c, 100, 70, 36, '#5bd7f0', 0.1)
  vignette(c, 0.42)
}

function scenePemrograman(c: Canvas, _v: Variant): void {
  drawWall(c, '#241f3d', '#161430', '#0f0e22')
  drawFloor(c, 'karpet', '#262445', 8)
  // garis cahaya ungu
  for (let x = 8; x < SCENE_LOGICAL_W - 8; x++) px(c, x, 6, '#a066ff')
  glow(c, 96, 7, 90, '#a066ff', 0.22)
  // lampu hias
  for (let k = 0; k < 16; k++) {
    const x = 6 + k * 12
    const y = 12 + Math.round(Math.sin(k * 0.9) * 3)
    px(c, x, y, '#ffd98a')
    glow(c, x, y, 6, '#ffd98a', 0.4)
    if (k > 0) line(c, x - 12, 12 + Math.round(Math.sin((k - 1) * 0.9) * 3), x, y, '#3a3156')
  }
  // rak server
  paintServerRack(c, 6, 20, 48, 3)
  paintServerRack(c, 24, 20, 48, 9)
  // tanda </>
  box(c, 52, 16, 32, 14, '#14122a')
  glyphText(c, 55, 21, '</>', '#5bf0a4')
    glow(c, 68, 23, 24, '#5bf0a4', 0.3)
  // papan tulis
  paintWhiteboard(c, 128, 14, 58, 36, { content: 'diagram', seed: 2 })
  // meja panjang + monitor ganda
  paintDesk(c, 28, 78, 150, { legs: 20, wood: '#3a3550' })
  paintMonitor(c, 40, 56, 26, 17, { kind: 'kode', seed: 4, glow: '#7aa2f7' })
  paintMonitor(c, 70, 52, 30, 20, { kind: 'kode', seed: 8, glow: '#bb9af7' })
  paintMonitor(c, 104, 56, 26, 17, { kind: 'terminal', seed: 5, glow: '#5bf0a4' })
  paintLaptop(c, 142, 77, 'kode', 12)
  // papan ketik menyala
  rect(c, 60, 75, 40, 3, '#14122a')
  for (let i = 0; i < 20; i++) px(c, 61 + i * 2, 76, i % 4 === 0 ? '#a066ff' : '#3a3156')
  // kopi & headphone
  box(c, 108, 71, 5, 6, '#f2f2f2')
  px(c, 113, 73, '#f2f2f2')
  px(c, 110, 69, '#c8d0d6')
  px(c, 111, 68, '#c8d0d6')
  thickLine(c, 164, 76, 164, 70, 1, '#222831')
  disc(c, 162, 76, 2, '#e5533d')
  disc(c, 168, 76, 2, '#e5533d')
  // kursi (dari belakang)
  paintChair(c, 82, 84, '#2e5a8a', 'belakang')
  paintChair(c, 48, 86, '#8a2e5a', 'belakang')
  vignette(c, 0.5)
}

function sceneLas(c: Canvas, _v: Variant): void {
  drawWall(c, '#6d7075', '#4d5055', '#2e3136')
  // batu bata
  const r = rng(13)
  for (let j = 0; j < 8; j++) {
    for (let i = -1; i < 14; i++) {
      const bx = i * 16 + (j % 2) * 8
      const by = 4 + j * 8
      const col = mix('#7a6c63', '#5a4e48', r() * 0.8)
      rect(c, bx, by, 15, 7, mix(col, '#5d6065', 0.45))
      hline(c, bx, by, 15, shade(col, 0.15))
    }
  }
  rect(c, 0, 62, SCENE_LOGICAL_W, 5, '#5a5e63')
  drawFloor(c, 'beton', '#585b60', 9)
  // garis bahaya
  for (let x = -4; x < SCENE_LOGICAL_W; x += 12) {
    for (let k = 0; k < 4; k++) hline(c, x + k, 98 + k, 6, '#e8c447')
  }
  // bilik las
  paintWeldingBooth(c, 56, 20, 80, 50, { seed: 5 })
  // tabung gas
  paintCylinder(c, 14, 34, 36, '#3a78b8')
  paintCylinder(c, 25, 36, 34, '#c0553f')
  line(c, 18, 36, 30, 50, '#1d2127')
  // alat pelindung
  box(c, 150, 20, 18, 14, '#e8c447')
  rect(c, 154, 24, 10, 5, '#0a1a14')
  px(c, 156, 25, '#5bf0a4')
  hline(c, 150, 20, 18, '#ffe48a')
  vline(c, 158, 12, 8, '#2a2f36')
  // pemadam api
  box(c, 172, 42, 8, 20, '#c8352a')
  rect(c, 174, 38, 4, 4, '#2a2f36')
  rect(c, 173, 47, 6, 5, '#f2f2f2')
  // landasan + meja logam
  paintDesk(c, 142, 78, 48, { legs: 18, wood: '#454b52' })
  box(c, 150, 66, 22, 6, '#2a2f36')
  box(c, 146, 72, 30, 6, '#3a424b')
  rect(c, 172, 66, 8, 3, '#2a2f36')
  // pelat logam bersandar
  for (let k = 0; k < 4; k++) rect(c, 6 + k * 3, 66 + k, 10, 34 - k, mix('#9fb0bb', '#59636d', k * 0.25))
  hline(c, 6, 66, 10, '#e9f0f3')
  // tumpukan potongan baja
  for (let k = 0; k < 4; k++) box(c, 70 + k * 2, 94 - k * 3, 26, 3, '#7a8791')
  // pantulan oranye di lantai & sekitarnya
  glow(c, 96, 78, 46, '#ff9a2e', 0.4)
  glow(c, 96, 96, 40, '#ff9a2e', 0.25)
  paintCeilingStrip(c, 10, 0, 30, '#f2e8c8')
  paintCeilingStrip(c, 150, 0, 30, '#f2e8c8')
  vignette(c, 0.5)
}

function sceneGudang(c: Canvas, _v: Variant): void {
  drawWall(c, '#7c6e5c', '#5e5446', '#3e382f')
  // dinding bergelombang
  for (let x = 0; x < SCENE_LOGICAL_W; x += 4) {
    vline(c, x, 4, 62, '#6b5f4f')
    vline(c, x + 2, 4, 62, '#85776a')
  }
  drawFloor(c, 'beton', '#6e6a62', 10)
  // rak besi besar
  paintShelf(c, 4, 8, 58, 62, { seed: 31, rows: 4, tone: 'logam' })
  paintShelf(c, 70, 18, 52, 52, { seed: 18, rows: 3, tone: 'logam' })
  // plakat
  box(c, 128, 10, 36, 11, '#e8c447')
  glyphText(c, 131, 13, 'GUDANG', '#1d2127')
  // tangga
  for (const lx of [150, 172]) {
    vline(c, lx, 26, 52, '#c9a24a')
    vline(c, lx + 1, 26, 52, '#8a6d28')
  }
  for (let k = 0; k < 8; k++) hline(c, 150, 32 + k * 6, 23, '#b08a30')
  // tumpukan peti
  paintCrates(c, 128, 74, 20, 16, '#b98a56')
  paintCrates(c, 130, 60, 16, 14, '#a67c52')
  paintCrates(c, 100, 84, 26, 18, '#a67c52')
  paintCrates(c, 6, 84, 22, 16, '#b98a56')
  paintCrates(c, 30, 90, 18, 12, '#c9a06a')
  // palet
  for (let k = 0; k < 3; k++) rect(c, 62, 96 + k * 3, 30, 2, '#8a6d45')
  box(c, 66, 82, 22, 14, '#c9a06a')
  hline(c, 66, 88, 22, '#8a6d45')
  rect(c, 74, 82, 6, 14, '#e5dcc4')
  // troli
  line(c, 166, 98, 170, 78, '#3a78b8')
  rect(c, 166, 98, 14, 2, '#3a78b8')
  disc(c, 170, 102, 3, '#1d2127')
  disc(c, 170, 102, 1, '#8a959e')
  // bohlam gantung
  paintPendantLamp(c, 96, 0, 10, '#2a2f36', '#ffd98a')
  glow(c, 96, 22, 50, '#ffd98a', 0.25)
  vignette(c, 0.48)
}

function sceneDiskusi(c: Canvas, v: Variant): void {
  drawWall(c, '#efe4cb', '#d8caa8', '#a58c62')
  rect(c, 0, 48, SCENE_LOGICAL_W, 19, '#b7a57f')
  hline(c, 0, 48, SCENE_LOGICAL_W, '#f4ecd8')
  drawFloor(c, 'kayu', '#c9a572', 12)
  paintWindow(c, 70, 10, 52, 34, { variant: v, view: 'pohon', cols: 3, rows: 2, seed: 4 })
  paintWhiteboard(c, 8, 12, 50, 34, { content: 'sticky', seed: 6 })
  paintShelf(c, 140, 10, 44, 56, { seed: 9, rows: 4, tone: 'kayu' })
  paintFrame(c, 130, 16, 8, 10, '#e5a85a')
  for (const x of [48, 144]) paintPendantLamp(c, x, 0, 12, '#e8c447', '#ffe9a8')
  paintPlant(c, 64, 70, 2, 5)
  paintPlant(c, 184, 104, 2, 7)
  // karpet & meja bundar
  paintRug(c, 96, 88, 56, 14, '#6a8f6e', '#d9c27a')
  for (const [cx, cy] of [[62, 80], [130, 80], [76, 98], [116, 98]] as const) {
    paintChair(c, cx - 5, cy - 10, '#d9694b', cy < 90 ? 'belakang' : 'depan')
  }
  box(c, 76, 75, 40, 4, '#e0c492')
  ellipse(c, 96, 76, 20, 5, '#e8d0a0')
  ellipse(c, 96, 75, 19, 4, '#f0dcb4')
  rect(c, 94, 79, 4, 8, '#8a6d45')
  ellipse(c, 96, 88, 8, 2, '#8a6d45')
  // benda di meja
  paintLaptop(c, 84, 76, 'kode', 3)
  box(c, 100, 73, 8, 4, '#f2f2f2')
  box(c, 110, 74, 4, 3, '#4d8fc4')
  lightBeam(c, 74, 118, '#fff4cf', 0.13, 14)
  vignette(c, 0.25)
}

function sceneIstirahat(c: Canvas, v: Variant): void {
  drawWall(c, '#cfe3d2', '#b2cdb8', '#7e9b86')
  hline(c, 0, 58, SCENE_LOGICAL_W, '#e9f4ec')
  rect(c, 0, 59, SCENE_LOGICAL_W, 8, '#9fbca9')
  drawFloor(c, 'kayu', '#d2b384', 14)
  paintWindow(c, 100, 12, 46, 32, { variant: v, view: 'gedung', cols: 2, rows: 2, seed: 8 })
  paintClock(c, 78, 18)
  // mesin penjual otomatis
  box(c, 6, 14, 30, 56, '#c8352a')
  rect(c, 9, 18, 18, 36, '#14202a')
  for (let j = 0; j < 4; j++) {
    for (let i = 0; i < 3; i++) {
      const colk = ['#e8c447', '#4d8fc4', '#59a67a', '#d98fa0', '#f08a24'][(i + j * 2) % 5] as string
      box(c, 11 + i * 5, 20 + j * 8, 4, 6, colk)
    }
    hline(c, 9, 27 + j * 8, 18, '#8a959e')
  }
  tint(c, 9, 18, 18, 36, '#9fd8e8', 0.12)
  rect(c, 29, 20, 5, 12, '#2a2f36')
  px(c, 31, 24, '#5bf0a4')
  px(c, 31, 28, '#e5533d')
  rect(c, 10, 58, 17, 7, '#0b1218')
  hline(c, 6, 14, 30, '#e6665b')
  glow(c, 18, 36, 26, '#9fd8e8', 0.25)
  // kulkas & mesin kopi di konter
  box(c, 42, 20, 22, 50, '#e9eef0')
  hline(c, 42, 38, 22, '#9aa6ae')
  rect(c, 60, 24, 2, 10, '#8a959e')
  rect(c, 60, 44, 2, 12, '#8a959e')
  box(c, 46, 26, 6, 6, '#f08a24')
  box(c, 54, 28, 5, 5, '#59a67a')
  paintDesk(c, 150, 62, 38, { legs: 22, wood: '#e8dcc0' })
  box(c, 156, 50, 14, 12, '#2a2f36')
  rect(c, 158, 53, 6, 5, '#e5533d')
  rect(c, 160, 58, 4, 4, '#f2f2f2')
  px(c, 166, 52, '#5bf0a4')
  box(c, 176, 54, 5, 8, '#f2f2f2')
  box(c, 182, 56, 4, 6, '#e8c447')
  // karpet & sofa
  paintRug(c, 100, 98, 62, 10, '#6fa38a', '#e8c447')
  paintSofa(c, 54, 72, 56, '#4d8fc4', 2)
  paintSofa(c, 118, 76, 52, '#e08a4a', 2)
  box(c, 92, 94, 18, 4, '#b98a56')
  box(c, 96, 90, 5, 4, '#f2f2f2')
  paintPlant(c, 176, 100, 2, 4)
  paintFrame(c, 118, 40, 14, 10, '#7fc4a0')
  paintCeilingStrip(c, 60, 0, 40, '#fff4d8')
  vignette(c, 0.22)
}

function sceneRuangBk(c: Canvas, v: Variant): void {
  drawWall(c, '#f2e3c4', '#e6cfa4', '#7a4d2e')
  // wainscot kayu
  rect(c, 0, 44, SCENE_LOGICAL_W, 23, '#a56f47')
  for (let x = 0; x < SCENE_LOGICAL_W; x += 12) {
    vline(c, x, 46, 21, '#8a5a38')
    vline(c, x + 1, 46, 21, '#b98259')
  }
  hline(c, 0, 44, SCENE_LOGICAL_W, '#d9a876')
  hline(c, 0, 45, SCENE_LOGICAL_W, '#6b4429')
  drawFloor(c, 'kayu', '#b58557', 16)
  // jendela dengan tirai
  paintWindow(c, 12, 10, 40, 30, { variant: v, view: 'pohon', cols: 2, rows: 2, seed: 15 })
  rect(c, 2, 4, 10, 44, '#c9693f')
  rect(c, 52, 4, 10, 44, '#c9693f')
  for (let k = 0; k < 5; k++) {
    vline(c, 3 + k * 2, 4, 44, shade('#c9693f', k % 2 ? -0.18 : 0.12))
    vline(c, 53 + k * 2, 4, 44, shade('#c9693f', k % 2 ? -0.18 : 0.12))
  }
  hline(c, 0, 4, 66, '#6b4429')
  // rak buku
  paintShelf(c, 138, 8, 30, 58, { seed: 22, rows: 4, tone: 'kayu' })
  // bingkai penghargaan
  paintFrame(c, 80, 14, 16, 12, '#8fb8d8', '#3b2a20')
  paintFrame(c, 100, 18, 12, 14, '#e5a85a', '#3b2a20')
  paintFrame(c, 116, 12, 14, 10, '#9fd0a0', '#3b2a20')
  // karpet dan sofa
  paintRug(c, 82, 96, 62, 11, '#a85a46', '#e8c98a')
  paintSofa(c, 46, 62, 62, '#6f9a7a', 2)
  // kursi berlengan di kanan
  paintSofa(c, 120, 66, 28, '#c9854a', 1)
  // meja kopi
  box(c, 66, 88, 30, 4, '#d9b27a')
  rect(c, 68, 92, 3, 6, '#8a5a38')
  rect(c, 91, 92, 3, 6, '#8a5a38')
  shadowRect(c, 68, 98, 26, 2, 0.28)
  box(c, 72, 84, 5, 4, '#f2f2f2')
  px(c, 77, 85, '#f2f2f2')
  box(c, 82, 82, 9, 6, '#6aa8d8')
  px(c, 85, 81, '#ffffff')
  // tanaman
  paintPlant(c, 62, 106, 2, 3)
  paintPlant(c, 112, 70, 1, 9)
  paintPlant(c, 134, 106, 1, 4)
  // lampu lantai
  // rak buku berakhir di x 168; kap lampu mulai di x 171
  rect(c, 177, 38, 2, 62, '#3b2a20')
  rect(c, 171, 30, 14, 9, '#f2d79a')
  hline(c, 171, 30, 14, '#fff2c2')
  rect(c, 172, 100, 12, 2, '#3b2a20')
  glow(c, 178, 36, 50, '#ffe0a0', 0.55)
  glow(c, 178, 70, 36, '#ffd08a', 0.2)
  // cahaya jendela hangat
  lightBeam(c, 14, 52, '#fff0c0', 0.16, 26)
  tint(c, 0, 0, SCENE_LOGICAL_W, SCENE_LOGICAL_H, '#ffb060', 0.06)
  vignette(c, 0.22)
}

function sceneRuangDosen(c: Canvas, v: Variant): void {
  drawWall(c, '#aab9c6', '#8fa1b1', '#2a3646')
  rect(c, 0, 40, SCENE_LOGICAL_W, 27, '#33445a')
  for (let x = 0; x < SCENE_LOGICAL_W; x += 16) {
    box(c, x + 2, 43, 12, 21, '#3c4f68')
    rect(c, x + 4, 45, 8, 17, '#33445a')
  }
  hline(c, 0, 40, SCENE_LOGICAL_W, '#6d84a0')
  drawFloor(c, 'kayu', '#5b4331', 17)
  // jendela berkerai
  paintWindow(c, 124, 10, 52, 28, { variant: v, view: 'gedung', cols: 1, rows: 1, seed: 6 })
  for (let j = 10; j < 38; j += 3) {
    hline(c, 124, j, 52, '#dfe6ea')
    hline(c, 124, j + 1, 52, '#8d9aa4')
  }
  rect(c, 124, 8, 52, 3, '#59636d')
  // rak buku besar
  paintShelf(c, 4, 6, 56, 62, { seed: 41, rows: 5, tone: 'kayu' })
  // sertifikat
  paintFrame(c, 70, 14, 18, 13, '#cfd8e4', '#1d2a3a')
  paintFrame(c, 92, 14, 18, 13, '#e0d2a0', '#1d2a3a')
  paintFrame(c, 80, 31, 22, 7, '#c2d4c6', '#1d2a3a')
  paintClock(c, 116, 22)
  // lemari arsip
  box(c, 156, 42, 24, 28, '#59636d')
  for (let k = 0; k < 3; k++) {
    box(c, 158, 44 + k * 9, 20, 8, '#6c7a86')
    rect(c, 166, 47 + k * 9, 4, 1, '#d8dde1')
  }
  paintPlant(c, 186, 70, 2, 6)
  // meja dosen
  paintRug(c, 96, 98, 52, 8, '#2a3a52', '#6d84a0')
  box(c, 66, 62, 62, 4, '#7a5438')
  rect(c, 66, 66, 62, 14, '#5f402a')
  hline(c, 66, 66, 62, '#3b2718')
  box(c, 70, 68, 22, 10, '#6c4830')
  rect(c, 79, 72, 4, 2, '#d8c27a')
  box(c, 102, 68, 22, 10, '#6c4830')
  rect(c, 111, 72, 4, 2, '#d8c27a')
  shadowRect(c, 68, 80, 60, 3, 0.3)
  // di atas meja
  paintLaptop(c, 74, 62, 'kode', 7)
  box(c, 96, 59, 12, 3, '#f2f2f2')
  box(c, 98, 57, 10, 3, '#e8e4d8')
  box(c, 114, 58, 8, 4, '#2a3a52')
  rect(c, 115, 59, 6, 1, '#e8c447')
  rect(c, 56, 52, 4, 10, '#222831')
  rect(c, 112, 52, 3, 7, '#c9693f')
  // lampu meja
  line(c, 124, 62, 122, 52, '#222831')
  rect(c, 118, 48, 9, 4, '#e8c447')
  glow(c, 122, 56, 26, '#ffe0a0', 0.4)
  // kursi dosen
  box(c, 84, 36, 22, 24, '#2a3a52')
  hline(c, 85, 37, 20, '#4a5e7a')
  rect(c, 80, 48, 4, 10, '#2a3a52')
  rect(c, 106, 48, 4, 10, '#2a3a52')
  // kursi tamu
  paintChair(c, 28, 84, '#7a8794')
  paintChair(c, 148, 86, '#7a8794')
  lightBeam(c, 126, 176, '#e6f0ff', 0.12, -16)
  vignette(c, 0.3)
}

function sceneStudioDesain(c: Canvas, v: Variant): void {
  drawWall(c, '#efe6fa', '#d8caee', '#8c72ad')
  rect(c, 0, 50, SCENE_LOGICAL_W, 17, '#c7b5e3')
  hline(c, 0, 50, SCENE_LOGICAL_W, '#f8f2ff')
  drawFloor(c, 'kayu', '#c8a87e', 19)
  paintWindow(c, 66, 10, 60, 34, { variant: v, view: 'pohon', cols: 3, rows: 2, seed: 25 })
  // papan palet warna & moodboard desain di kiri
  box(c, 8, 12, 48, 34, '#fffaf0')
  const swatches = ['#e56256', '#f5be42', '#3aa08e', '#5b72d6', '#a869c9', '#f08a24']
  for (let i = 0; i < swatches.length; i++) {
    box(c, 12 + (i % 3) * 14, 16 + Math.floor(i / 3) * 13, 11, 10, swatches[i] as string)
  }
  paintShelf(c, 136, 10, 48, 56, { seed: 29, rows: 4, tone: 'kayu' })
  for (const x of [48, 142]) paintPendantLamp(c, x, 0, 11, '#8c72ad', '#fff2c2')
  // meja gambar & monitor grafis lebar
  paintDesk(c, 12, 78, 152, { legs: 20, wood: '#e6d4b5' })
  paintMonitor(c, 26, 54, 34, 21, { kind: 'cad', seed: 11, glow: '#b894ff' })
  paintMonitor(c, 70, 56, 30, 19, { kind: 'grafik', seed: 14, glow: '#5bf0c4' })
  // pen tablet & stylus
  box(c, 110, 72, 24, 5, '#2b3240')
  rect(c, 114, 73, 16, 3, '#4c5770')
  line(c, 138, 72, 146, 75, '#e8c447')
  paintChair(c, 52, 86, '#7e63a8', 'belakang')
  paintChair(c, 106, 86, '#3aa08e', 'belakang')
  paintPlant(c, 178, 104, 2, 11)
  lightBeam(c, 70, 122, '#fff4dc', 0.14, 16)
  vignette(c, 0.24)
}

function scenePojokBaca(c: Canvas, v: Variant): void {
  drawWall(c, '#dceee2', '#bfd8c8', '#5e7e6c')
  rect(c, 0, 46, SCENE_LOGICAL_W, 21, '#8ead9a')
  hline(c, 0, 46, SCENE_LOGICAL_W, '#eef8f1')
  drawFloor(c, 'karpet', '#688c79', 23)
  paintWindow(c, 68, 10, 56, 32, { variant: v, view: 'pohon', cols: 3, rows: 2, seed: 31 })
  // dua rak buku tinggi di kiri dan kanan
  paintShelf(c, 6, 8, 52, 60, { seed: 33, rows: 5, tone: 'kayu' })
  paintShelf(c, 134, 8, 52, 60, { seed: 37, rows: 5, tone: 'kayu' })
  paintClock(c, 96, 16)
  // karpet baca hangat & meja riset kayu
  paintRug(c, 96, 94, 68, 12, '#c89b62', '#f2e0b4')
  paintSofa(c, 26, 68, 44, '#c9854a', 2)
  paintDesk(c, 82, 78, 66, { legs: 18, wood: '#c99c68' })
  paintLaptop(c, 90, 77, 'kode', 19)
  // lampu baca meja bernuansa kuning hangat
  line(c, 136, 77, 134, 65, '#3b2a20')
  rect(c, 129, 61, 10, 4, '#f2c864')
  glow(c, 134, 68, 28, '#ffe29c', 0.48)
  paintChair(c, 102, 86, '#3e6e5c', 'depan')
  paintPlant(c, 168, 102, 2, 13)
  lightBeam(c, 72, 120, '#fff5d6', 0.14, 18)
  vignette(c, 0.24)
}

const SCENES: Record<SceneArtId, (c: Canvas, v: Variant) => void> = {
  'lab-umum': sceneLabUmum,
  'cetak-3d': sceneCetak3d,
  elektronik: sceneElektronik,
  pemrograman: scenePemrograman,
  las: sceneLas,
  gudang: sceneGudang,
  diskusi: sceneDiskusi,
  istirahat: sceneIstirahat,
  'ruang-bk': sceneRuangBk,
  'ruang-dosen': sceneRuangDosen,
  'studio-desain': sceneStudioDesain,
  'pojok-baca': scenePojokBaca,
}

export function composeSceneArt(id: SceneArtId, variant: SceneVariant): PixelGrid {
  const c = createCanvas(SCENE_LOGICAL_W, SCENE_LOGICAL_H, '#000000')
  standBase(c, 0, SCENE_LOGICAL_H, '#202830')
  SCENES[id](c, variant)
  warm(c, variant)
  // pastikan sel valid
  for (let i = 0; i < c.cells.length; i++) {
    const cell = c.cells[i]
    if (!cell || !/^#[0-9a-f]{6}$/.test(cell)) c.cells[i] = getPx(c, 0, 0)
  }
  const big = upscaleCanvas(c, SCENE_SCALE)
  paintSceneDetail(id, variant, big)
  return toGrid(big)
}
