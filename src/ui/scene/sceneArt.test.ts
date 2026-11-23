import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { mulberry32 } from '../../engine/rng'
import type { ZoneType } from '../../types'
import {
  SCENE_ART_IDS, SCENE_H, SCENE_W, composeSceneArt, resolveSceneArt, sceneVariantForGraph,
} from './sceneArt'
import type { SceneArtId, SceneVariant } from './sceneArt'

const ZONES: ZoneType[] = [
  'cetak-3d', 'pemrograman', 'las', 'elektronik-iot', 'diskusi', 'gudang-alat',
  'istirahat', 'konsultasi', 'ruang-dosen', 'studio-desain', 'pojok-baca',
]
const WORK_ZONE_ART: Partial<Record<ZoneType, SceneArtId>> = {
  'cetak-3d': 'cetak-3d',
  pemrograman: 'pemrograman',
  las: 'las',
  'elektronik-iot': 'elektronik',
  diskusi: 'diskusi',
  'gudang-alat': 'gudang',
  istirahat: 'istirahat',
  'studio-desain': 'studio-desain',
  'pojok-baca': 'pojok-baca',
}
const VARIANTS: SceneVariant[] = ['pagi', 'sore']

// Feature: ui-visual-overhaul, Property 1: Pemilihan adegan total dan benar
// **Validates: Requirements 1.2, 1.3, 1.4**
test('Property 1: resolveSceneArt total dan benar untuk semua zona dan setting', () => {
  for (const zone of [...ZONES, null]) {
    assert.equal(resolveSceneArt({ setting: 'ruang-konsultasi', zoneId: zone }), 'ruang-bk')
    const expected = zone === null ? 'lab-umum' : (WORK_ZONE_ART[zone] ?? 'lab-umum')
    assert.equal(resolveSceneArt({ setting: 'lab', zoneId: zone }), expected)
  }
  assert.equal(resolveSceneArt({ setting: 'lab', zoneId: 'konsultasi' }), 'lab-umum')
  assert.equal(resolveSceneArt({ setting: 'lab', zoneId: 'ruang-dosen' }), 'lab-umum')
})

// Feature: ui-visual-overhaul, Property 2: Latar adegan lengkap, deterministik, dan berbeda
// **Validates: Requirements 1.5, 1.8, 1.9**
test('Property 2: composeSceneArt lengkap, deterministik, dan unik antar id', () => {
  assert.equal(SCENE_ART_IDS.length, 12)
  for (const variant of VARIANTS) {
    const seen = new Map<string, SceneArtId>()
    for (const id of SCENE_ART_IDS) {
      const a = composeSceneArt(id, variant)
      const b = composeSceneArt(id, variant)
      assert.equal(a.width, SCENE_W)
      assert.equal(a.height, SCENE_H)
      assert.equal(a.cells.length, SCENE_W * SCENE_H)
      assert.ok(a.cells.every((c) => typeof c === 'string' && /^#[0-9a-f]{6}$/.test(c)), `${id}/${variant} berisi sel tak valid`)
      assert.deepEqual(a.cells, b.cells, `${id}/${variant} tidak deterministik`)
      const key = a.cells.join('')
      assert.equal(seen.get(key), undefined, `${id} sama dengan ${seen.get(key)}`)
      seen.set(key, id)
    }
  }
})

// Feature: ui-visual-overhaul, Property 3: Varian sore ditentukan oleh kata "lanjutan"
// **Validates: Requirements 1.9**
test('Property 3: sceneVariantForGraph sore iff memuat "lanjutan" (>=100 iterasi)', () => {
  const rng = mulberry32(20240603)
  const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789-._ '
  for (let i = 0; i < 300; i++) {
    const len = Math.floor(rng() * 24)
    let s = ''
    for (let k = 0; k < len; k++) s += alphabet[Math.floor(rng() * alphabet.length)]
    if (i % 3 === 0) {
      const at = Math.floor(rng() * (s.length + 1))
      s = s.slice(0, at) + 'lanjutan' + s.slice(at)
    }
    assert.equal(sceneVariantForGraph(s), s.includes('lanjutan') ? 'sore' : 'pagi', s)
  }
  assert.equal(sceneVariantForGraph('mhs-01.lanjutan'), 'sore')
  assert.equal(sceneVariantForGraph('mhs-01.lab'), 'pagi')
})

// Feature: game-ui-polish, Property 8: Latar adegan lengkap dan deterministik
// **Validates: Requirements 5.1, 5.2, 5.3**
test('Property 8: ukuran 384x216, sel #rrggbb, deterministik untuk semua id dan varian', () => {
  assert.equal(SCENE_W, 384)
  assert.equal(SCENE_H, 216)
  for (const variant of VARIANTS) {
    for (const id of SCENE_ART_IDS) {
      const a = composeSceneArt(id, variant)
      assert.equal(a.width, 384)
      assert.equal(a.height, 216)
      assert.equal(a.cells.length, 384 * 216)
      assert.ok(a.cells.every((c) => typeof c === 'string' && /^#[0-9a-f]{6}$/.test(c)))
      assert.deepEqual(composeSceneArt(id, variant).cells, a.cells)
    }
  }
})

// Feature: game-ui-polish, Property 9: Latar adegan saling berbeda
// **Validates: Requirements 5.4**
test('Property 9: kisi sepuluh latar saling berbeda pada tiap varian', () => {
  for (const variant of VARIANTS) {
    const keys = new Set(SCENE_ART_IDS.map((id) => composeSceneArt(id, variant).cells.join('')))
    assert.equal(keys.size, SCENE_ART_IDS.length)
  }
})

// Feature: game-ui-polish, Property 10: Lapisan detail menambah informasi
// **Validates: Requirements 5.5**
test('Property 10: lapisan detail mengubah >= 5% sel dibanding upscale 2x polos', () => {
  for (const variant of VARIANTS) {
    for (const id of SCENE_ART_IDS) {
      const g = composeSceneArt(id, variant)
      // Upscale 2x polos: setiap sel sama dengan sel jangkar blok 2x2-nya.
      let changed = 0
      for (let y = 0; y < g.height; y++) {
        for (let x = 0; x < g.width; x++) {
          const anchor = g.cells[(y & ~1) * g.width + (x & ~1)]
          if (g.cells[y * g.width + x] !== anchor) changed++
        }
      }
      assert.ok(changed / g.cells.length >= 0.05, `${id}/${variant}: ${changed} sel berubah`)
    }
  }
})

test('sceneCache.ts tidak memuat angka 192 atau 108 dan memakai SCENE_W/SCENE_H', () => {
  const src = readFileSync(new URL('./sceneCache.ts', import.meta.url), 'utf8')
  assert.ok(!/\b(192|108)\b/.test(src))
  assert.ok(src.includes('SCENE_W') && src.includes('SCENE_H'))
})

test('resolveSceneArt dan sceneVariantForGraph tidak berubah untuk contoh tetap', () => {
  assert.equal(resolveSceneArt({ setting: 'ruang-konsultasi', zoneId: 'las' }), 'ruang-bk')
  assert.equal(resolveSceneArt({ setting: 'lab', zoneId: 'las' }), 'las')
  assert.equal(resolveSceneArt({ setting: 'lab', zoneId: null }), 'lab-umum')
  assert.equal(sceneVariantForGraph('x.lanjutan'), 'sore')
  assert.equal(sceneVariantForGraph('x.lab'), 'pagi')
})

test('lab-umum memakai prop jendela, rak, printer 3D, lengan robot, dan meja', () => {
  const src = readFileSync(new URL('./sceneArt.ts', import.meta.url), 'utf8')
  const body = /function sceneLabUmum[\s\S]*?\n}\n/.exec(src)?.[0] ?? ''
  for (const p of ['paintWindow', 'paintShelf', 'paintPrinter3d', 'paintRobotArm', 'paintDesk']) {
    assert.ok(body.includes(p), `lab-umum tanpa ${p}`)
  }
})

test('varian sore berbeda dari pagi dan lebih hangat pada lab-umum', () => {
  const avg = (cells: readonly (string | null)[], from: number, to: number): number => {
    let sum = 0
    for (const c of cells) sum += parseInt((c as string).slice(from, to), 16)
    return sum / cells.length
  }
  const pagi = composeSceneArt('lab-umum', 'pagi').cells
  const sore = composeSceneArt('lab-umum', 'sore').cells
  assert.notDeepEqual(pagi, sore)
  assert.ok(avg(sore, 1, 3) - avg(sore, 5, 7) > avg(pagi, 1, 3) - avg(pagi, 5, 7))
})
