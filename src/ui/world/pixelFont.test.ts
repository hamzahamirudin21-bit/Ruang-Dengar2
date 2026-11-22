import test from 'node:test'
import assert from 'node:assert/strict'
import { LAB_MAP } from '../../data/map'
import { hasGlyph, measurePixelText, paintPixelText, GLYPH_H } from './pixelFont'
import { measurePlaque, paintPlaque, PLAQUE_BORDER, PLAQUE_PAD_X, PLAQUE_PAD_Y } from './plaque'

const BUBBLE_TEXTS = ['Hi!', '...', '?', '!', '♪']

test('teks balon ucapan semuanya punya glif', () => {
  for (const t of BUBBLE_TEXTS) {
    for (const ch of Array.from(t)) assert.ok(hasGlyph(ch), `tanpa glif: ${ch}`)
  }
})

test('label zona LAB_MAP (shortLabel dan label) semuanya punya glif', () => {
  for (const z of LAB_MAP.zones) {
    for (const text of [z.shortLabel, z.label]) {
      for (const ch of Array.from(text)) {
        assert.ok(hasGlyph(ch), `zona ${z.id}: karakter "${ch}" tanpa glif`)
      }
    }
  }
})

test('paintPixelText sesuai measurePixelText dan tidak kosong', () => {
  for (const z of LAB_MAP.zones) {
    const m = measurePixelText(z.shortLabel)
    const g = paintPixelText(z.shortLabel, '#fff')
    assert.equal(g.width, m.w)
    assert.equal(g.height, m.h)
    assert.equal(m.h, GLYPH_H)
    assert.ok(g.cells.some((c) => c !== null))
  }
})

test('plakat berukuran teks ditambah bantalan dan bingkai, tidak kosong', () => {
  for (const z of LAB_MAP.zones) {
    for (const highlighted of [false, true]) {
      const t = measurePixelText(z.shortLabel)
      const p = paintPlaque(z.shortLabel, { highlighted })
      assert.equal(p.width, t.w + 2 * (PLAQUE_PAD_X + PLAQUE_BORDER))
      assert.equal(p.height, t.h + 2 * (PLAQUE_PAD_Y + PLAQUE_BORDER))
      assert.deepEqual({ w: p.width, h: p.height }, measurePlaque(z.shortLabel))
      assert.equal(p.cells.length, p.width * p.height)
      assert.ok(p.cells.some((c) => c !== null))
    }
  }
})
