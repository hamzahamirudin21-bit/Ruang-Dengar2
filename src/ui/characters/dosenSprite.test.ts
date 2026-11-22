import { test } from 'node:test'
import assert from 'node:assert/strict'
import { STUDENT_APPEARANCES } from './appearance'
import {
  parseManifest,
  resolvePortraitSource,
  resolveSpriteSource,
  type AssetManifest,
} from './assetSlots'
import { composePortraitFor, composeSpriteFor } from './characterArt'
import { IDENTITY_COLORS } from './characterPalette'
import { DOSEN_ID, DOSEN_LOOK } from './dosenLook'
import { composeDosenSprite } from './dosenSprite'
import { composePortrait } from './portraitCompose'
import { composeSprite } from './spriteCompose'
import {
  IDLE_FRAMES,
  SPRITE_H,
  SPRITE_W,
  WALK_FRAMES,
  type AnimKind,
  type Direction,
  type PixelGrid,
} from './pixelGrid'

const DIRS: Direction[] = ['bawah', 'kiri', 'kanan', 'atas']
const ANIMS: AnimKind[] = ['idle', 'jalan']
const has = (g: PixelGrid, color: string) => g.cells.some((c) => c?.toLowerCase() === color.toLowerCase())
const key = (g: PixelGrid) => g.cells.join('|')

function frameCount(anim: AnimKind): number {
  return anim === 'idle' ? IDLE_FRAMES : WALK_FRAMES
}

// Feature: ui-visual-overhaul, Property 26: Sprite Dosen lengkap dan berciri
// **Validates: Requirements 14.1, 14.2, 14.3**
test('Property 26: sprite Dosen 16x24 pada semua arah, anim, frame dengan blazer, lanyard, kacamata', () => {
  const blazer = IDENTITY_COLORS[DOSEN_LOOK.blazer.color].base
  let total = 0
  for (const dir of DIRS) {
    for (const anim of ANIMS) {
      for (let f = 0; f < frameCount(anim); f++) {
        const g = composeDosenSprite(dir, anim, f)
        total++
        const tag = `${dir}/${anim}/${f}`
        assert.equal(g.width, SPRITE_W, tag)
        assert.equal(g.height, SPRITE_H, tag)
        assert.equal(g.cells.length, SPRITE_W * SPRITE_H, tag)
        assert.ok(has(g, blazer), `blazer ${tag}`)
        assert.ok(has(g, DOSEN_LOOK.lanyard.strap), `lanyard ${tag}`)
        if (dir !== 'atas') assert.ok(has(g, DOSEN_LOOK.glasses.frame), `kacamata ${tag}`)
        assert.equal(key(g), key(composeDosenSprite(dir, anim, f)), `deterministik ${tag}`)
      }
    }
  }
  assert.equal(total, 4 * (IDLE_FRAMES + WALK_FRAMES))
})

const manifest = (entry: unknown): AssetManifest | null =>
  parseManifest({ version: 1, characters: { [DOSEN_ID]: entry } })

test('resolvePortraitSource/resolveSpriteSource untuk id dosen memakai aset yang termuat', () => {
  const m = manifest({ portrait: 'dosen.png', sprite: 'dosen-sprite.png', cell: { w: 32, h: 48 } })
  const loaded = new Set(['/assets/characters/dosen.png', '/assets/characters/dosen-sprite.png'])
  assert.deepEqual(resolvePortraitSource(DOSEN_ID, 'netral', m, loaded), {
    kind: 'aset',
    url: '/assets/characters/dosen.png',
    specificExpression: false,
  })
  assert.deepEqual(resolveSpriteSource(DOSEN_ID, m, loaded), {
    kind: 'aset',
    url: '/assets/characters/dosen-sprite.png',
    cell: { w: 32, h: 48 },
  })
  // gambar belum termuat -> prosedural
  assert.equal(resolvePortraitSource(DOSEN_ID, 'netral', m, new Set()).kind, 'prosedural')
  assert.equal(resolveSpriteSource(DOSEN_ID, m, new Set()).kind, 'prosedural')
})

test('manifest null atau entri berbahaya jatuh ke prosedural untuk dosen', () => {
  const loaded = new Set(['/assets/characters/../x.png', '/assets/characters//etc/passwd'])
  assert.equal(resolvePortraitSource(DOSEN_ID, 'netral', null, loaded).kind, 'prosedural')
  assert.equal(resolveSpriteSource(DOSEN_ID, null, loaded).kind, 'prosedural')
  const bad = manifest({ portrait: '../x.png', sprite: '/etc/passwd', expressions: { netral: 'c:\\x.png' } })
  assert.equal(resolvePortraitSource(DOSEN_ID, 'netral', bad, loaded).kind, 'prosedural')
  assert.equal(resolveSpriteSource(DOSEN_ID, bad, loaded).kind, 'prosedural')
})

test('composePortraitFor/composeSpriteFor: mahasiswa sama dengan alur lama, dosen memakai seni Dosen', () => {
  const s = STUDENT_APPEARANCES['mhs-01']
  assert.ok(s)
  assert.equal(key(composePortraitFor('mhs-01', 'cemas')), key(composePortrait(s, 'cemas')))
  for (const dir of DIRS) {
    assert.equal(key(composeSpriteFor('mhs-01', dir, 'jalan', 2)), key(composeSprite(s, dir, 'jalan', 2)))
  }
  assert.equal(key(composeSpriteFor(DOSEN_ID, 'bawah', 'idle', 0)), key(composeDosenSprite('bawah', 'idle', 0)))
  assert.notEqual(key(composeSpriteFor(DOSEN_ID, 'bawah', 'idle', 0)), key(composeSpriteFor('mhs-01', 'bawah', 'idle', 0)))
  assert.ok(composePortraitFor(DOSEN_ID, 'netral').cells.length > 0)
})
