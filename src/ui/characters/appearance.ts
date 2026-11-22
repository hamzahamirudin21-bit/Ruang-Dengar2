import type { IdentityColorId } from './characterPalette'

export type BodyType = 'ramping' | 'sedang' | 'tegap'
export type HairKind = 'pendek' | 'sedang' | 'ikat' | 'kerudung'
export type TopKind =
  | 'kemeja' | 'kaus' | 'hoodie' | 'jaket' | 'rompi'
  | 'apron' | 'cardigan' | 'tunik' | 'blus' | 'sweater'
export type BottomKind = 'celana' | 'rok'
export type ShoeKind = 'sneakers' | 'sepatu' | 'bot'

export type AccessoryId =
  | 'ransel' | 'selempang' | 'kacamata' | 'headphone' | 'penutup-telinga' | 'topi'
  | 'hijab' | 'id-card' | 'helm-las' | 'sarung-tangan' | 'ponsel' | 'laptop-dipeluk'
  | 'buku' | 'kertas' | 'botol' | 'pulpen' | 'jam-tangan' | 'gelang-karet' | 'kain-bersih'
  | 'lengan-panjang'

/** Sama dengan SceneBackdropId pada cardBackdrop.ts (tipe literal identik, agar modul ini mandiri). */
export type AppearanceSceneHint =
  | 'lab-elektronik' | 'lab-pemrograman' | 'bengkel-las' | 'lab-cetak3d'
  | 'gudang-alat' | 'meja-diskusi' | 'ruang-istirahat'

export interface CharacterAppearance {
  studentId: string
  styleName: string
  body: { type: BodyType; skinId: string }
  outfit: {
    top: TopKind; topColor: IdentityColorId; topAccent?: IdentityColorId
    bottom: BottomKind; bottomColor: IdentityColorId
    shoe: ShoeKind; shoeColor: IdentityColorId
  }
  hair: { kind: HairKind; colorId: string }
  accessories: readonly AccessoryId[]
  sceneHint: AppearanceSceneHint
}

type Row = Omit<CharacterAppearance, 'studentId'>

const ROWS: Readonly<Record<string, Row>> = {
  'mhs-01': {
    styleName: 'Kemeja Koordinator',
    body: { type: 'sedang', skinId: 'kulit-2' },
    outfit: { top: 'kemeja', topColor: 'navy', bottom: 'celana', bottomColor: 'krem', shoe: 'sepatu', shoeColor: 'maroon' },
    hair: { kind: 'pendek', colorId: 'rambut-hitam' },
    accessories: ['id-card', 'jam-tangan', 'kertas'],
    sceneHint: 'lab-elektronik',
  },
  'mhs-02': {
    styleName: 'Kaus Solder',
    body: { type: 'ramping', skinId: 'kulit-3' },
    outfit: { top: 'kaus', topColor: 'maroon', bottom: 'celana', bottomColor: 'navy', shoe: 'sneakers', shoeColor: 'krem' },
    hair: { kind: 'pendek', colorId: 'rambut-cokelat-tua' },
    accessories: ['kacamata', 'ponsel', 'lengan-panjang'],
    sceneHint: 'lab-elektronik',
  },
  'mhs-03': {
    styleName: 'Blus Mentor',
    body: { type: 'sedang', skinId: 'kulit-1' },
    outfit: { top: 'blus', topColor: 'ungu', bottom: 'rok', bottomColor: 'navy', shoe: 'sepatu', shoeColor: 'maroon' },
    hair: { kind: 'ikat', colorId: 'rambut-hitam' },
    accessories: ['selempang', 'pulpen'],
    sceneHint: 'lab-elektronik',
  },
  'mhs-04': {
    styleName: 'Hoodie Mustard',
    body: { type: 'sedang', skinId: 'kulit-1' },
    outfit: { top: 'hoodie', topColor: 'mustard', bottom: 'celana', bottomColor: 'navy', shoe: 'sneakers', shoeColor: 'navy' },
    hair: { kind: 'pendek', colorId: 'rambut-cokelat' },
    accessories: ['headphone', 'kacamata'],
    sceneHint: 'lab-pemrograman',
  },
  'mhs-05': {
    styleName: 'Cardigan Oranye',
    body: { type: 'ramping', skinId: 'kulit-3' },
    outfit: { top: 'cardigan', topColor: 'oranye', topAccent: 'krem', bottom: 'rok', bottomColor: 'zaitun', shoe: 'sneakers', shoeColor: 'krem' },
    hair: { kind: 'ikat', colorId: 'rambut-kastanye' },
    accessories: ['buku', 'pulpen'],
    sceneHint: 'lab-pemrograman',
  },
  'mhs-06': {
    styleName: 'Tunik Zaitun',
    body: { type: 'ramping', skinId: 'kulit-2' },
    outfit: { top: 'tunik', topColor: 'zaitun', bottom: 'rok', bottomColor: 'krem', shoe: 'sepatu', shoeColor: 'maroon' },
    hair: { kind: 'kerudung', colorId: 'rambut-hitam' },
    accessories: ['hijab', 'ransel', 'lengan-panjang'],
    sceneHint: 'lab-pemrograman',
  },
  'mhs-07': {
    styleName: 'Rompi Bengkel',
    body: { type: 'tegap', skinId: 'kulit-4' },
    outfit: { top: 'rompi', topColor: 'oranye', bottom: 'celana', bottomColor: 'navy', shoe: 'bot', shoeColor: 'maroon' },
    hair: { kind: 'pendek', colorId: 'rambut-hitam' },
    accessories: ['helm-las', 'sarung-tangan'],
    sceneHint: 'bengkel-las',
  },
  'mhs-08': {
    styleName: 'Apron Printer',
    body: { type: 'sedang', skinId: 'kulit-2' },
    outfit: { top: 'apron', topColor: 'teal', bottom: 'celana', bottomColor: 'krem', shoe: 'sneakers', shoeColor: 'mustard' },
    hair: { kind: 'pendek', colorId: 'rambut-cokelat-tua' },
    accessories: ['gelang-karet', 'ponsel'],
    sceneHint: 'lab-cetak3d',
  },
  'mhs-09': {
    styleName: 'Jaket Navy Strip',
    body: { type: 'tegap', skinId: 'kulit-3' },
    outfit: { top: 'jaket', topColor: 'navy', topAccent: 'oranye', bottom: 'celana', bottomColor: 'maroon', shoe: 'sneakers', shoeColor: 'oranye' },
    hair: { kind: 'pendek', colorId: 'rambut-cokelat' },
    accessories: ['botol'],
    sceneHint: 'meja-diskusi',
  },
  'mhs-10': {
    styleName: 'Rompi Teknisi',
    body: { type: 'sedang', skinId: 'kulit-4' },
    outfit: { top: 'rompi', topColor: 'krem', bottom: 'celana', bottomColor: 'zaitun', shoe: 'bot', shoeColor: 'navy' },
    hair: { kind: 'pendek', colorId: 'rambut-abu' },
    accessories: ['topi', 'id-card', 'kain-bersih', 'botol'],
    sceneHint: 'gudang-alat',
  },
  'mhs-11': {
    styleName: 'Sweater Ungu Tenang',
    body: { type: 'ramping', skinId: 'kulit-1' },
    outfit: { top: 'sweater', topColor: 'ungu', bottom: 'celana', bottomColor: 'krem', shoe: 'sneakers', shoeColor: 'ungu' },
    hair: { kind: 'sedang', colorId: 'rambut-cokelat-tua' },
    accessories: ['penutup-telinga', 'buku'],
    sceneHint: 'ruang-istirahat',
  },
  'mhs-12': {
    styleName: 'Blazer Penengah',
    body: { type: 'sedang', skinId: 'kulit-2' },
    outfit: { top: 'jaket', topColor: 'teal', topAccent: 'mustard', bottom: 'celana', bottomColor: 'navy', shoe: 'sepatu', shoeColor: 'navy' },
    hair: { kind: 'sedang', colorId: 'rambut-kastanye' },
    accessories: ['ponsel', 'pulpen', 'id-card'],
    sceneHint: 'ruang-istirahat',
  },
  'mhs-13': {
    styleName: 'Kerudung Teal',
    body: { type: 'ramping', skinId: 'kulit-3' },
    outfit: { top: 'tunik', topColor: 'teal', bottom: 'rok', bottomColor: 'navy', shoe: 'sepatu', shoeColor: 'krem' },
    hair: { kind: 'kerudung', colorId: 'rambut-hitam' },
    accessories: ['hijab', 'buku', 'ponsel'],
    sceneHint: 'ruang-istirahat',
  },
  'mhs-14': {
    styleName: 'Cardigan Maroon',
    body: { type: 'ramping', skinId: 'kulit-2' },
    outfit: { top: 'cardigan', topColor: 'maroon', bottom: 'rok', bottomColor: 'krem', shoe: 'sneakers', shoeColor: 'maroon' },
    hair: { kind: 'ikat', colorId: 'rambut-cokelat' },
    accessories: ['buku', 'kertas'],
    sceneHint: 'ruang-istirahat',
  },
  'mhs-15': {
    styleName: 'Hoodie Oranye',
    body: { type: 'sedang', skinId: 'kulit-3' },
    outfit: { top: 'hoodie', topColor: 'oranye', bottom: 'celana', bottomColor: 'zaitun', shoe: 'sneakers', shoeColor: 'navy' },
    hair: { kind: 'pendek', colorId: 'rambut-cokelat-tua' },
    accessories: ['laptop-dipeluk', 'ransel'],
    sceneHint: 'ruang-istirahat',
  },
}

export const STUDENT_APPEARANCES: Readonly<Record<string, CharacterAppearance>> = Object.freeze(
  Object.fromEntries(
    Object.entries(ROWS).map(([id, row]) => [id, Object.freeze({ studentId: id, ...row })]),
  ),
)

const HUE_COLORS: readonly IdentityColorId[] = ['maroon', 'oranye', 'mustard', 'zaitun', 'teal', 'navy', 'ungu', 'maroon']

function colorFromHue(hue: number): IdentityColorId {
  const h = Number.isFinite(hue) ? ((Math.round(hue) % 360) + 360) % 360 : 0
  return HUE_COLORS[Math.floor(h / 45) % HUE_COLORS.length]
}

function isHairKind(v: unknown): v is HairKind {
  return v === 'pendek' || v === 'sedang' || v === 'ikat' || v === 'kerudung'
}

/**
 * Penampilan terdaftar untuk id mahasiswa; id tak dikenal memakai cadangan
 * dari hairStyle dan avatarHue. hairStyle 'kerudung' selalu berhijab.
 */
export function getAppearance(
  studentId: string,
  fallback?: { hairStyle: HairKind; avatarHue: number },
): CharacterAppearance {
  const known = Object.prototype.hasOwnProperty.call(STUDENT_APPEARANCES, studentId)
    ? STUDENT_APPEARANCES[studentId]
    : undefined
  if (known) return known

  const kind: HairKind = isHairKind(fallback?.hairStyle) ? fallback!.hairStyle : 'pendek'
  const color = colorFromHue(fallback?.avatarHue ?? 0)
  const accessories: AccessoryId[] = kind === 'kerudung' ? ['hijab'] : []
  return {
    studentId,
    styleName: 'Mahasiswa',
    body: { type: 'sedang', skinId: 'kulit-2' },
    outfit: {
      top: 'kaus', topColor: color,
      bottom: kind === 'kerudung' ? 'rok' : 'celana', bottomColor: 'navy',
      shoe: 'sneakers', shoeColor: 'krem',
    },
    hair: { kind, colorId: 'rambut-hitam' },
    accessories,
    sceneHint: 'ruang-istirahat',
  }
}

/** Tanda tangan deterministik gaya, warna, rambut, dan aksesori (tanpa id), untuk uji keunikan. */
export function appearanceSignature(a: CharacterAppearance): string {
  const o = a.outfit
  return [
    a.styleName, a.body.type, a.body.skinId,
    o.top, o.topColor, o.topAccent ?? '-', o.bottom, o.bottomColor, o.shoe, o.shoeColor,
    a.hair.kind, a.hair.colorId,
    [...a.accessories].sort().join(','),
  ].join('|')
}
