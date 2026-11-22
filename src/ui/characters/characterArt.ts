import type { StoryExpression } from '../../engine/story/storyTypes'
import { getAppearance, type HairKind } from './appearance'
import { DOSEN_ID } from './dosenLook'
import { composeDosenPortrait } from './dosenPortrait'
import { composeDosenSprite } from './dosenSprite'
import type { AnimKind, Direction, PixelGrid } from './pixelGrid'
import { composePortrait } from './portraitCompose'
import { composeSprite } from './spriteCompose'

/** Cadangan penampilan untuk id mahasiswa yang tidak terdaftar. */
export interface AppearanceFallback {
  hairStyle: HairKind
  avatarHue: number
}

/** Pintu masuk tunggal potret: id `dosen` memakai seni Dosen, selain itu mahasiswa. */
export function composePortraitFor(
  id: string,
  expression: StoryExpression,
  fallback?: AppearanceFallback,
): PixelGrid {
  if (id === DOSEN_ID) return composeDosenPortrait(expression)
  return composePortrait(getAppearance(id, fallback), expression)
}

/** Pintu masuk tunggal sprite 16x24 untuk Dosen maupun mahasiswa. */
export function composeSpriteFor(
  id: string,
  dir: Direction,
  anim: AnimKind,
  frame: number,
  fallback?: AppearanceFallback,
): PixelGrid {
  if (id === DOSEN_ID) return composeDosenSprite(dir, anim, frame)
  return composeSprite(getAppearance(id, fallback), dir, anim, frame)
}
