import type { StoryExpression } from '../../engine/story/storyTypes'

export const PORTRAIT_W = 80
export const PORTRAIT_H = 96

export interface ExpressionSpec {
  eyes: 'biasa' | 'lebar' | 'sipit' | 'tertutup' | 'turun' | 'melirik'
  brows: 'datar' | 'naik' | 'turun-luar' | 'turun-dalam' | 'cemas'
  mouth: 'datar' | 'senyum' | 'senyum-lebar' | 'turun' | 'o' | 'garis-miring'
  /** Pergeseran kepala dalam sel, -2..3 (positif = menunduk). */
  headDy: number
  /** Pergeseran bahu dalam sel, 0..2 (positif = bahu turun). */
  shoulderDy: number
  ornament: 'none' | 'keringat' | 'rona' | 'helaan'
}

/** Sebelas ekspresi, masing-masing dengan tanda tangan berbeda. */
export const EXPRESSION_SPECS: Readonly<Record<StoryExpression, ExpressionSpec>> = {
  netral: { eyes: 'biasa', brows: 'datar', mouth: 'datar', headDy: 0, shoulderDy: 0, ornament: 'none' },
  waspada: { eyes: 'lebar', brows: 'naik', mouth: 'datar', headDy: -1, shoulderDy: 0, ornament: 'none' },
  menunduk: { eyes: 'turun', brows: 'datar', mouth: 'datar', headDy: 3, shoulderDy: 1, ornament: 'none' },
  cemas: { eyes: 'lebar', brows: 'cemas', mouth: 'garis-miring', headDy: 0, shoulderDy: 0, ornament: 'keringat' },
  lega: { eyes: 'tertutup', brows: 'datar', mouth: 'senyum', headDy: 1, shoulderDy: 0, ornament: 'helaan' },
  tersenyum: { eyes: 'biasa', brows: 'naik', mouth: 'senyum-lebar', headDy: -1, shoulderDy: 0, ornament: 'rona' },
  lelah: { eyes: 'sipit', brows: 'turun-luar', mouth: 'datar', headDy: 2, shoulderDy: 1, ornament: 'none' },
  kesal: { eyes: 'sipit', brows: 'turun-dalam', mouth: 'turun', headDy: 0, shoulderDy: 0, ornament: 'none' },
  terkejut: { eyes: 'lebar', brows: 'naik', mouth: 'o', headDy: -2, shoulderDy: 0, ornament: 'none' },
  tertegun: { eyes: 'lebar', brows: 'datar', mouth: 'o', headDy: 0, shoulderDy: 0, ornament: 'none' },
  'menutup-diri': { eyes: 'melirik', brows: 'turun-luar', mouth: 'datar', headDy: 2, shoulderDy: 2, ornament: 'none' },
}

/** Bentuk mulut bicara untuk potret detail: `tutup` memakai mulut ekspresi dasar. */
export type PortraitMouthVariant = 'tutup' | 'setengah' | 'buka'

export const PORTRAIT_MOUTH_VARIANTS: readonly PortraitMouthVariant[] = ['tutup', 'setengah', 'buka']
