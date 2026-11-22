import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mulberry32 } from '../../engine/rng'
import type { StoryExpression } from '../../engine/story/storyTypes'
import { STUDENT_APPEARANCES } from './appearance'
import { composePortraitFor } from './characterArt'
import { HAIR_COLORS, IDENTITY_COLORS, SKIN_TONES } from './characterPalette'
import { DOSEN_ID, DOSEN_LOOK } from './dosenLook'
import type { PixelGrid } from './pixelGrid'
import { DETAIL_H, DETAIL_W, buildDetailedPortrait, outlineLayer } from './portraitDetail'
import { FRAME_CACHE_CAPACITY, FrameCache, frameKey } from './portraitFrameCache'
import { EXPRESSION_SPECS, PORTRAIT_MOUTH_VARIANTS } from './portraitExpressions'

const EXPRESSIONS = Object.keys(EXPRESSION_SPECS) as StoryExpression[]
const STUDENT_IDS = Object.keys(STUDENT_APPEARANCES)
const LOOK_IDS = [...STUDENT_IDS, DOSEN_ID]
const HEX = /^#[0-9a-f]{6}$/i
const key = (g: PixelGrid) => g.cells.join('|')
const pick = <T>(rng: () => number, xs: readonly T[]): T => xs[Math.floor(rng() * xs.length)]

// Feature: game-juice-upgrade, Property 10: Potret detail berukuran tetap dan deterministik
// **Validates: Requirements 3.1, 3.4**
test('Property 10: potret detail 160x192, deterministik, sel null atau #rrggbb', () => {
  assert.equal(LOOK_IDS.length, 16)
  const rng = mulberry32(1010)
  for (let i = 0; i < 100; i++) {
    const id: string = LOOK_IDS[i % LOOK_IDS.length]
    const expr = pick(rng, EXPRESSIONS)
    const closed = rng() < 0.5
    const mouth = pick(rng, PORTRAIT_MOUTH_VARIANTS)
    const g = buildDetailedPortrait(id, expr, closed, mouth)
    assert.equal(g.width, 160)
    assert.equal(g.height, 192)
    assert.equal(g.width, DETAIL_W)
    assert.equal(g.height, DETAIL_H)
    assert.equal(g.cells.length, 160 * 192)
    let valid = true
    for (const c of g.cells) if (c !== null && !HEX.test(c)) valid = false
    assert.ok(valid, `sel tidak valid ${id} ${expr}`)
    if (i % 4 === 0) {
      assert.equal(key(g), key(buildDetailedPortrait(id, expr, closed, mouth)), `deterministik ${id} ${expr}`)
    }
  }
})

// Feature: game-juice-upgrade, Property 11: Kontur dan bayangan menambah informasi
// **Validates: Requirements 3.2**
test('Property 11: kontur berada di luar siluet dan menempel; detail memuat lebih banyak warna', () => {
  const rng = mulberry32(1111)
  // Grid acak kecil: setiap sel kontur transparan di sumber dan bertetangga dengan sel buram.
  for (let i = 0; i < 100; i++) {
    const w = 3 + Math.floor(rng() * 12)
    const h = 3 + Math.floor(rng() * 12)
    const cells = Array.from({ length: w * h }, () => (rng() < 0.4 ? '#336699' : null))
    const src: PixelGrid = { width: w, height: h, cells }
    const out = outlineLayer(src)
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (!out.cells[y * w + x]) continue
        assert.equal(src.cells[y * w + x], null, 'kontur harus di luar siluet')
        const near =
          (x > 0 && src.cells[y * w + x - 1]) ||
          (x < w - 1 && src.cells[y * w + x + 1]) ||
          (y > 0 && src.cells[(y - 1) * w + x]) ||
          (y < h - 1 && src.cells[(y + 1) * w + x])
        assert.ok(near, 'kontur harus berdekatan dengan sel buram')
      }
    }
  }
  // Potret nyata: lebih banyak warna dibanding pembesaran polos 2x.
  for (let i = 0; i < 24; i++) {
    const id: string = LOOK_IDS[i % LOOK_IDS.length]
    const expr = EXPRESSIONS[i % EXPRESSIONS.length]
    const base = composePortraitFor(id, expr)
    const plain = new Set(base.cells.filter((c): c is string => !!c))
    const detail = new Set(
      buildDetailedPortrait(id, expr, false, 'tutup').cells.filter((c): c is string => !!c),
    )
    assert.ok(detail.size > plain.size, `${id} ${expr}: ${detail.size} <= ${plain.size}`)
  }
})

// Feature: game-juice-upgrade, Property 12: Warna dasar tiap karakter dipertahankan
// **Validates: Requirements 3.3**
test('Property 12: warna kulit, rambut, dan pakaian dasar muncul pada potret detail', () => {
  const rng = mulberry32(1212)
  const norm = (c: string) => c.toLowerCase()
  for (const id of LOOK_IDS) {
    let skinId: string
    let hairId: string
    let hasHair = true
    let cloth: string
    if (id === DOSEN_ID) {
      skinId = DOSEN_LOOK.skinId
      hairId = DOSEN_LOOK.hair.colorId
      cloth = IDENTITY_COLORS[DOSEN_LOOK.blazer.color].base
    } else {
      const a = STUDENT_APPEARANCES[id]
      skinId = a.body.skinId
      hairId = a.hair.colorId
      hasHair = a.hair.kind !== 'kerudung'
      cloth = IDENTITY_COLORS[a.outfit.topColor].base
    }
    const skin = SKIN_TONES.find((s) => s.id === skinId)!.base
    const hair = HAIR_COLORS.find((s) => s.id === hairId)!.base
    for (let i = 0; i < 2; i++) {
      const expr = pick(rng, EXPRESSIONS)
      const g = buildDetailedPortrait(id, expr, rng() < 0.5, pick(rng, PORTRAIT_MOUTH_VARIANTS))
      const set = new Set(g.cells.filter((c): c is string => !!c).map(norm))
      // Warna yang nyaris tak terlihat pada grid dasar (mis. rambut tertutup topi) dilewati.
      const base = composePortraitFor(id, expr).cells.map((c) => (c ? norm(c) : c))
      const visible = (c: string) => base.filter((x) => x === norm(c)).length >= 100
      assert.ok(set.has(norm(skin)), `kulit ${id} ${expr}`)
      if (hasHair && visible(hair)) assert.ok(set.has(norm(hair)), `rambut ${id} ${expr}`)
      assert.ok(set.has(norm(cloth)), `pakaian ${id} ${expr}`)
    }
  }
})

// Feature: game-juice-upgrade, Property 13: Potret detail antar mahasiswa berbeda
// **Validates: Requirements 3.5**
test('Property 13: dua mahasiswa berbeda menghasilkan grid detail berbeda', () => {
  const rng = mulberry32(1313)
  const keys = new Map<string, string>()
  const expr = pick(rng, EXPRESSIONS)
  for (const id of STUDENT_IDS) keys.set(id, key(buildDetailedPortrait(id, expr, false, 'tutup')))
  for (let i = 0; i < STUDENT_IDS.length; i++) {
    for (let j = i + 1; j < STUDENT_IDS.length; j++) {
      assert.notEqual(keys.get(STUDENT_IDS[i]), keys.get(STUDENT_IDS[j]), `${STUDENT_IDS[i]} vs ${STUDENT_IDS[j]}`)
    }
  }
  for (let n = 0; n < 15; n++) {
    const e = pick(rng, EXPRESSIONS)
    const a = pick(rng, STUDENT_IDS)
    const b = pick(rng, STUDENT_IDS.filter((s) => s !== a))
    assert.notEqual(
      key(buildDetailedPortrait(a, e, false, 'tutup')),
      key(buildDetailedPortrait(b, e, false, 'tutup')),
      `${a} vs ${b} ${e}`,
    )
  }
})

// Feature: game-juice-upgrade, Property 14: Cache bingkai terbatas dan stabil
// **Validates: Requirements 3.5 (cache bingkai)**
test('Property 14: FrameCache tidak melebihi 96 dan kunci beruntun mengembalikan objek sama', () => {
  assert.equal(FRAME_CACHE_CAPACITY, 96)
  const rng = mulberry32(1414)
  const cache = new FrameCache<{ k: string }>()
  for (let i = 0; i < 1000; i++) {
    const k = frameKey(
      `mhs-${Math.floor(rng() * 40)}`,
      pick(rng, EXPRESSIONS),
      rng() < 0.5,
      pick(rng, PORTRAIT_MOUTH_VARIANTS),
    )
    const first = cache.get(k, () => ({ k }))
    const second = cache.get(k, () => ({ k }))
    assert.equal(first, second)
    assert.ok(cache.size() <= 96, `size ${cache.size()}`)
  }
  assert.equal(cache.size(), 96)
})


