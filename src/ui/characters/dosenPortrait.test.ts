import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mulberry32 } from '../../engine/rng'
import type { StoryExpression } from '../../engine/story/storyTypes'
import { STUDENT_APPEARANCES } from './appearance'
import { IDENTITY_COLORS } from './characterPalette'
import { DOSEN_LOOK } from './dosenLook'
import { composeDosenPortrait, dosenExpressionFor } from './dosenPortrait'
import { composePortrait } from './portraitCompose'
import { EXPRESSION_SPECS, PORTRAIT_H, PORTRAIT_W } from './portraitExpressions'
import type { PixelGrid } from './pixelGrid'

const EXPRESSIONS = Object.keys(EXPRESSION_SPECS) as StoryExpression[]
const key = (g: PixelGrid) => g.cells.join('|')
const has = (g: PixelGrid, color: string) => g.cells.some((c) => c?.toLowerCase() === color.toLowerCase())

// Feature: ui-visual-overhaul, Property 24: Potret Dosen lengkap, berciri, deterministik, dan khas
// **Validates: Requirements 13.1, 13.2, 13.3, 13.5, 13.6**
test('Property 24: potret Dosen lengkap, berciri, deterministik, dan khas', () => {
  assert.equal(EXPRESSIONS.length, 11)
  const students = Object.values(STUDENT_APPEARANCES)
  assert.equal(students.length, 18)
  const blazer = IDENTITY_COLORS[DOSEN_LOOK.blazer.color].base
  const seen = new Map<string, StoryExpression>()
  const rng = mulberry32(2404)
  for (let i = 0; i < 100; i++) {
    const expr: StoryExpression = EXPRESSIONS[Math.floor(rng() * EXPRESSIONS.length)]
    const g = composeDosenPortrait(expr)
    assert.equal(g.width, PORTRAIT_W)
    assert.equal(g.height, PORTRAIT_H)
    assert.equal(g.cells.length, PORTRAIT_W * PORTRAIT_H)
    assert.ok(has(g, DOSEN_LOOK.glasses.frame), `kacamata ${expr}`)
    assert.ok(has(g, blazer), `blazer ${expr}`)
    assert.ok(has(g, DOSEN_LOOK.shirt.batik.color), `batik ${expr}`)
    assert.ok(has(g, DOSEN_LOOK.lanyard.strap), `tali ${expr}`)
    assert.ok(has(g, DOSEN_LOOK.lanyard.card), `kartu ${expr}`)
    assert.equal(key(g), key(composeDosenPortrait(expr)), `deterministik ${expr}`)
    const s = students[Math.floor(rng() * students.length)]
    assert.notEqual(key(g), key(composePortrait(s, expr)), `beda dari ${s.studentId} ${expr}`)
  }
  for (const expr of EXPRESSIONS) {
    const k = key(composeDosenPortrait(expr))
    assert.ok(!seen.has(k), `${expr} sama dengan ${seen.get(k)}`)
    seen.set(k, expr)
    for (const s of students) assert.notEqual(k, key(composePortrait(s, expr)))
  }
})

// Feature: ui-visual-overhaul, Property 25: Pemetaan ekspresi Dosen total
// **Validates: Requirements 13.7, 13.8, 13.9**
test('Property 25: dosenExpressionFor total atas 11 ekspresi dan null', () => {
  const speakers = ['mahasiswa', 'dosen', 'selingan'] as const
  const rng = mulberry32(2405)
  for (let i = 0; i < 100; i++) {
    const inputs: (StoryExpression | null)[] = [...EXPRESSIONS, null]
    const input = inputs[Math.floor(rng() * inputs.length)]
    const out = dosenExpressionFor(input, 'mahasiswa')
    const expected =
      input === 'lega' || input === 'tersenyum' ? 'tersenyum' : input === 'terkejut' ? 'tertegun' : 'netral'
    assert.equal(out, expected)
    assert.ok(EXPRESSIONS.includes(out))
    for (const sp of speakers) assert.ok(EXPRESSIONS.includes(dosenExpressionFor(input, sp)))
  }
  for (const input of [...EXPRESSIONS, null]) {
    assert.equal(dosenExpressionFor(input, 'dosen'), 'netral')
    assert.equal(dosenExpressionFor(input, 'selingan'), 'netral')
  }
})

test('sudut bibir netral lebih tinggi daripada garis mulut datar', () => {
  const g = composeDosenPortrait('netral')
  const at = (x: number, y: number) => g.cells[y * g.width + x]
  const hc = 37 // headDy netral = 0
  const my = hc + 15
  const mouth = at(40, my + 1)
  assert.ok(mouth)
  for (const x of [35, 45]) {
    assert.equal(at(x, my - 1), mouth)
    assert.notEqual(at(x, my + 1), mouth)
  }
})
