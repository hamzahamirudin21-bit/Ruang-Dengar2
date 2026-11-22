export type IdentityColorId =
  | 'navy'
  | 'maroon'
  | 'mustard'
  | 'oranye'
  | 'teal'
  | 'ungu'
  | 'zaitun'
  | 'krem'

export interface ToneSet {
  base: string
  shade: string
  light: string
}

export const IDENTITY_COLORS: Readonly<Record<IdentityColorId, ToneSet>> = {
  navy: { base: '#1f3a5f', shade: '#14263f', light: '#3b5f8f' },
  maroon: { base: '#7a2433', shade: '#521825', light: '#a63d4f' },
  mustard: { base: '#d9a21b', shade: '#a67812', light: '#f0c453' },
  oranye: { base: '#e2702a', shade: '#b0511a', light: '#f59a5b' },
  teal: { base: '#1f8a8a', shade: '#146363', light: '#4fb5b0' },
  ungu: { base: '#6b4a9e', shade: '#4a3070', light: '#947bc4' },
  zaitun: { base: '#6b7a2e', shade: '#4a5520', light: '#93a44d' },
  krem: { base: '#efe3c8', shade: '#cdbd98', light: '#faf4e4' },
}

export const SKIN_TONES: readonly { id: string; base: string; shade: string }[] = [
  { id: 'kulit-1', base: '#f6d5b8', shade: '#dfb592' },
  { id: 'kulit-2', base: '#eab98f', shade: '#c9966b' },
  { id: 'kulit-3', base: '#d39a6a', shade: '#b07a4d' },
  { id: 'kulit-4', base: '#a8714a', shade: '#85553a' },
  { id: 'kulit-5', base: '#7a4e32', shade: '#5c3a25' },
]

export const HAIR_COLORS: readonly { id: string; base: string; shade: string }[] = [
  { id: 'rambut-hitam', base: '#1e1a1a', shade: '#0f0c0c' },
  { id: 'rambut-cokelat-tua', base: '#3b2619', shade: '#26170f' },
  { id: 'rambut-cokelat', base: '#5a3a24', shade: '#3e2616' },
  { id: 'rambut-kastanye', base: '#7a4a2a', shade: '#583319' },
  { id: 'rambut-abu', base: '#6d6d72', shade: '#4a4a4f' },
  { id: 'rambut-pirang-gelap', base: '#8a6a34', shade: '#664d22' },
]

export const OUTLINE = '#2b1f1a'
