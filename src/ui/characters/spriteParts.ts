import type { AccessoryId, CharacterAppearance, TopKind } from './appearance'
import { HAIR_COLORS, IDENTITY_COLORS, OUTLINE, SKIN_TONES } from './characterPalette'
import type { Direction } from './pixelGrid'

/**
 * Bagian sprite chibi 16x24 sebagai grid teks. Satu karakter = satu sel.
 * '.' atau spasi = transparan. Peta karakter ke warna ada di buildColorMap.
 *
 * Tata letak (sel): kepala besar 12x10 di (2,2), rambut/aksesori kepala mulai y=0,
 * badan atas 12x5 di (2,12), tangan di y=17, pinggul y=17..19, kaki y=20..23.
 * Arah 'kanan' dibuat dengan mencerminkan arah 'kiri' (di spriteCompose).
 */

export type View = 'bawah' | 'atas' | 'kiri'
export type PartLayer = 'belakang' | 'depan'
export type Rows = readonly string[]

export interface Stamp {
  x: number
  y: number
  rows: Rows
  /** Ganti karakter sebelum diwarnai (mis. {B:'s'}). */
  remap?: Readonly<Record<string, string>>
}

export function viewOf(dir: Direction): View {
  return dir === 'kanan' ? 'kiri' : dir
}

/* ------------------------------------------------------------------ */
/* Warna                                                               */
/* ------------------------------------------------------------------ */

export type ColorMap = Readonly<Record<string, string>>

export function hijabColorId(a: CharacterAppearance) {
  return a.outfit.bottomColor === 'krem' ? 'krem' : a.outfit.topColor
}

export function buildColorMap(a: CharacterAppearance): ColorMap {
  const skin = SKIN_TONES.find((s) => s.id === a.body.skinId) ?? SKIN_TONES[1]
  const hair = HAIR_COLORS.find((h) => h.id === a.hair.colorId) ?? HAIR_COLORS[0]
  const tone = (id: string) =>
    (IDENTITY_COLORS as Record<string, { base: string; shade: string; light: string }>)[id] ??
    IDENTITY_COLORS.krem
  const top = tone(a.outfit.topColor)
  const acc = a.outfit.topAccent ? tone(a.outfit.topAccent) : null
  const bottom = tone(a.outfit.bottomColor)
  const shoe = tone(a.outfit.shoeColor)
  const hijab = tone(hijabColorId(a))
  return {
    o: OUTLINE,
    s: skin.base,
    d: skin.shade,
    h: hair.base,
    g: hair.shade,
    e: '#1b1416',
    w: '#ffffff',
    p: '#e58f8a',
    m: '#9a3b36',
    T: top.base,
    t: top.shade,
    L: top.light,
    A: acc ? acc.base : top.light,
    a: acc ? acc.shade : top.shade,
    B: bottom.base,
    b: bottom.shade,
    S: shoe.base,
    z: shoe.shade,
    K: hijab.base,
    k: hijab.shade,
    C: shoe.base,
    c: shoe.shade,
    // warna tetap aksesori
    O: '#2b2b33',
    G: '#8a8f98',
    W: '#f4f4f4',
    x: '#c9c3d6',
    Y: '#f2c230',
    y: '#b88a14',
    R: '#e2502b',
    r: '#9a2f1a',
    U: '#3b7fd1',
    u: '#285a99',
    N: '#4fae6a',
    n: '#2a6e40',
    P: '#f4efe0',
    Q: '#8a5a33',
    q: '#5e3a1f',
  }
}

/* ------------------------------------------------------------------ */
/* Kepala (12x10) di (2,2)                                             */
/* ------------------------------------------------------------------ */

export const HEAD_PARTS: Readonly<Record<View, Rows>> = {
  bawah: [
    '.oooooooooo.',
    'osssssssssso',
    'osssssssssso',
    'osssssssssso',
    'oswessssweso',
    'oseesssseeso',
    'ospsssssspso',
    'ossssmmsssso',
    'osddddddddso',
    '.oooooooooo.',
  ],
  atas: [
    '.oooooooooo.',
    'osssssssssso',
    'osssssssssso',
    'osssssssssso',
    'osssssssssso',
    'osssssssssso',
    'osssssssssso',
    'osssssssssso',
    'osddddddddso',
    '.oooooooooo.',
  ],
  kiri: [
    '.oooooooooo.',
    'osssssssssso',
    'osssssssssso',
    'osssssssssso',
    'oswessssssso',
    'oseessssssso',
    'ospssssssdso',
    'osmmssssssdo',
    'osddddddddso',
    '.oooooooooo.',
  ],
}

/* ------------------------------------------------------------------ */
/* Badan atas (12x5) di (2,12) dan tangan                              */
/* ------------------------------------------------------------------ */

const TORSO: Readonly<Record<View, Rows>> = {
  bawah: ['.oTTTLLTTTo.', 'oTtTTTTTTtTo', 'oTtTTTTTTtTo', 'oTtTTTTTTtTo', 'ottTTTTTTtto'],
  atas: ['.oTTTTTTTTo.', 'oTtTTTTTTtTo', 'oTtTTTTTTtTo', 'oTtTTTTTTtTo', 'ottTTTTTTtto'],
  kiri: ['..oTTTTTTo..', '..oTTtTTTo..', '..oTTtTTTo..', '..oTTtTTTo..', '..oTtttTTo..'],
}

export const HAND_PARTS: Readonly<Record<View, Rows>> = {
  bawah: ['oso......oso', 'ooo......ooo'],
  atas: ['oso......oso', 'ooo......ooo'],
  kiri: ['....oso.....', '....ooo.....'],
}

function put(rows: string[], r: number, c: number, ch: string): void {
  const row = rows[r]
  if (row === undefined || c < 0 || c >= row.length) return
  rows[r] = row.slice(0, c) + ch + row.slice(c + 1)
}

/** Baris badan atas dengan detail khas jenis pakaian. */
export function torsoRows(view: View, top: TopKind): string[] {
  const rows = [...TORSO[view]]
  const front = view === 'bawah'
  const armCols = view === 'kiri' ? [5] : [1, 10]
  const armRows = [1, 2, 3]
  const setArms = (ch: string) => {
    for (const r of armRows) for (const c of armCols) put(rows, r, c, ch)
  }
  switch (top) {
    case 'kemeja':
      if (front) {
        for (let r = 1; r <= 4; r++) put(rows, r, 5, 't')
        put(rows, 2, 6, 'W'); put(rows, 4, 6, 'W')
        rows[0] = '.oTTWWWWTTo.'
      }
      break
    case 'kaus':
      if (front) { put(rows, 2, 4, 'L'); put(rows, 2, 5, 'L'); put(rows, 3, 4, 'L') }
      break
    case 'hoodie':
      if (front) {
        rows[0] = '.oTLLLLLLTo.'
        for (const r of [1, 2, 3]) put(rows, r, 5, 'W')
        for (const r of [1, 2]) put(rows, r, 6, 'W')
        for (let c = 4; c <= 7; c++) put(rows, 4, c, 't')
      } else if (view === 'atas') {
        rows[0] = '.oTLLLLLLTo.'
        for (let c = 4; c <= 7; c++) put(rows, 1, c, 'L')
      } else {
        put(rows, 0, 3, 'L'); put(rows, 0, 4, 'L'); put(rows, 1, 3, 'L')
      }
      break
    case 'jaket':
      setArms('A')
      if (front) {
        for (let c = 3; c <= 8; c++) put(rows, 3, c, 'A')
        for (let r = 1; r <= 4; r++) put(rows, r, 6, 'a')
        rows[0] = '.oTAALLAATo.'
      } else if (view === 'atas') {
        for (let c = 3; c <= 8; c++) put(rows, 3, c, 'A')
      } else {
        for (let c = 3; c <= 8; c++) if (c !== 5) put(rows, 3, c, 'A')
      }
      break
    case 'rompi':
      setArms('W')
      for (let c = 3; c <= 8; c++) if (!(view === 'kiri' && c === 5)) put(rows, 3, c, 'Y')
      if (front) { put(rows, 1, 3, 't'); put(rows, 1, 8, 't') }
      break
    case 'apron':
      setArms('W')
      if (front) {
        put(rows, 0, 4, 'a'); put(rows, 0, 7, 'a')
        for (let r = 1; r <= 4; r++) { put(rows, r, 3, 'W'); put(rows, r, 8, 'W') }
        put(rows, 3, 5, 'L'); put(rows, 3, 6, 'L'); put(rows, 4, 5, 't'); put(rows, 4, 6, 't')
      } else if (view === 'atas') {
        put(rows, 1, 4, 'a'); put(rows, 2, 5, 'a'); put(rows, 2, 6, 'a'); put(rows, 1, 7, 'a')
      }
      break
    case 'cardigan':
      if (front) {
        for (let r = 1; r <= 4; r++) { put(rows, r, 5, 'A'); put(rows, r, 6, 'A') }
        put(rows, 2, 6, 'a'); put(rows, 4, 6, 'a')
      }
      break
    case 'tunik':
      if (front) { put(rows, 1, 6, 'a'); put(rows, 2, 6, 'a'); rows[0] = '.oTTLLLLTTo.' }
      break
    case 'blus':
      if (front) {
        rows[0] = '.oTLLLLLLTo.'
        put(rows, 1, 5, 'W'); put(rows, 1, 6, 'W'); put(rows, 3, 6, 'L')
      }
      break
    case 'sweater':
      if (front) rows[0] = '.oTTLLLLTTo.'
      put(rows, 4, 3, 't'); put(rows, 4, 4, 'L'); put(rows, 4, 5, 't')
      put(rows, 4, 6, 'L'); put(rows, 4, 7, 't'); put(rows, 4, 8, 'L')
      break
  }
  return rows
}

/** Pinggul (3 baris, y=17..19). */
export function hipRows(bottom: 'celana' | 'rok', top: TopKind): string[] {
  const rows =
    bottom === 'rok'
      ? ['..oBBBBBBo..', '.oBBBBBBBBo.', 'oBBBbBBbBBBo']
      : ['..oBBBBBBo..', '..oBBBBBBo..', '..oBBbbBBo..']
  if (top === 'tunik') {
    rows[0] = '..oTTTTTTo..'
    rows[1] = '.oTTTTTTTTo.'
    if (bottom === 'rok') rows[2] = 'oTTLTTTTLTTo'
  }
  return rows
}

/* ------------------------------------------------------------------ */
/* Kaki (4 baris, y=20..23)                                            */
/* ------------------------------------------------------------------ */

export type LegStep = 'stand' | 'a' | 'b'

const mirrorRow = (r: string) => r.split('').reverse().join('')

const FRONT_LEGS_STAND: Rows = [
  '..oBBooBBo..',
  '..oBBooBBo..',
  '.oSSSooSSSo.',
  '.ozzzoozzzo.',
]
const FRONT_LEGS_A: Rows = [
  '..oBBooBBo..',
  '.oSSSooBBo..',
  '.ozzzooSSSo.',
  '..ooo.ozzzo.',
]
const FRONT_LEGS_B: Rows = FRONT_LEGS_A.map(mirrorRow)

const SIDE_LEGS_STAND: Rows = [
  '..oBBBBBBo..',
  '..oBBBBBBo..',
  '.oSSSSSSSo..',
  '.ozzzzzzzo..',
]
const SIDE_LEGS_A: Rows = [
  '..oBBo.oBBo.',
  '..oBBo.oBBo.',
  '.oSSSo.oSSSo',
  '.ozzzo.ozzzo',
]
const SIDE_LEGS_B: Rows = [
  '..oBBo.oBBo.',
  '..oBBo.oSSSo',
  '.oSSSo.ozzzo',
  '.ozzzo..ooo.',
]

export function legRows(view: View, step: LegStep): Rows {
  if (view === 'kiri') {
    return step === 'stand' ? SIDE_LEGS_STAND : step === 'a' ? SIDE_LEGS_A : SIDE_LEGS_B
  }
  return step === 'stand' ? FRONT_LEGS_STAND : step === 'a' ? FRONT_LEGS_A : FRONT_LEGS_B
}

/* ------------------------------------------------------------------ */
/* Rambut (14 lebar) di (1,0)                                          */
/* ------------------------------------------------------------------ */

const HAIR_FRONT: Rows = [
  '...oooooooo...',
  '..ohhhhhhhho..',
  '.ohhhhhhhhhho.',
  'ohhhhhhhhhhhho',
  'ohhghhhhhhghho',
  'ohhhh.hhh.hhho',
  'ohh........hho',
  'oh..........ho',
]
const HAIR_FRONT_LONG: Rows = ['oh..........ho', 'oh..........ho', 'oo..........oo']

const HAIR_BACK: Rows = [
  '...oooooooo...',
  '..ohhhhhhhho..',
  '.ohhhhhhhhhho.',
  'ohhhhhhhhhhhho',
  'ohhghhhhhhghho',
  'ohhhhhhhhhhhho',
  'ohhhhhhhhhhhho',
  'ohhhhgggghhhho',
  'ohhhhhhhhhhhho',
  'ohhhhhhhhhhhho',
  '.ohhhhhhhhhho.',
  '..oohhhhhhoo..',
]
const HAIR_BACK_LONG: Rows = ['...ohhhhhho...', '....oooooo....']

const HAIR_SIDE: Rows = [
  '...oooooooo...',
  '..ohhhhhhhho..',
  '.ohhhhhhhhhho.',
  'ohhhhhhhhhhhho',
  'ohhghhhhhhhhho',
  '.ohhhhhhhhhhho',
  '......ohhhhhho',
  '......ohhhhhho',
  '......ohhhhhho',
  '.......ohhhhho',
  '........oooooo',
]
const HAIR_SIDE_LONG: Rows = [
  '.......ohhhhho',
  '.......ohhhhho',
  '........oooooo',
]

function hairStamps(a: CharacterAppearance, view: View): Stamp[] {
  const kind = a.hair.kind
  if (kind === 'kerudung') return []
  const out: Stamp[] = []
  if (view === 'bawah') {
    out.push({ x: 1, y: 0, rows: kind === 'sedang' ? [...HAIR_FRONT, ...HAIR_FRONT_LONG] : HAIR_FRONT })
    if (kind === 'ikat') {
      out.push({ x: 14, y: 4, rows: ['RR', 'hh', 'hh', 'hh', 'hg', 'gg', '.g'] })
    }
  } else if (view === 'atas') {
    out.push({ x: 1, y: 0, rows: kind === 'sedang' ? [...HAIR_BACK, ...HAIR_BACK_LONG] : HAIR_BACK })
    if (kind === 'ikat') {
      out.push({
        x: 1, y: 10,
        rows: [
          '.....oRRo.....', '....ohhhho....', '....ohhhho....', '....ohhhho....',
          '....ohhhho....', '....ohhggo....', '.....ohgo.....', '......oo......',
        ],
      })
    }
  } else {
    const rows = kind === 'sedang' ? [...HAIR_SIDE.slice(0, 9), ...HAIR_SIDE_LONG] : HAIR_SIDE
    out.push({ x: 1, y: 0, rows })
    if (kind === 'ikat') {
      out.push({ x: 13, y: 6, rows: ['oRR', 'ohh', 'ohh', 'ohh', 'ogh', '.og', '..o'] })
    }
  }
  return out
}

/* ------------------------------------------------------------------ */
/* Aksesori                                                            */
/* ------------------------------------------------------------------ */

export interface AccessoryPart extends Stamp {
  layer?: PartLayer
}
type AccessoryDef = Partial<Record<View, readonly AccessoryPart[]>>

const HIJAB_FRONT: Rows = [
  '...oooooooo...',
  '..oKKKKKKKKo..',
  '.oKKKKKKKKKKo.',
  'oKKKKKKKKKKKKo',
  'oKKkKKKKKKkKKo',
  'oKK........KKo',
  'oKK........KKo',
  'oKK........KKo',
  'oKK........KKo',
  'oKK........KKo',
  'oKKK......KKKo',
  '.oKKKKKKKKKKo.',
  '.oKKKKKKKKKKo.',
  '.oKKkKKKKkKKo.',
  '..oKKKKKKKKo..',
  '...oKKKKKKo...',
]
const HIJAB_BACK: Rows = [
  '...oooooooo...',
  '..oKKKKKKKKo..',
  '.oKKKKKKKKKKo.',
  'oKKKKKKKKKKKKo',
  'oKKKKKKKKKKKKo',
  'oKKKKKkkKKKKKo',
  'oKKKKKKKKKKKKo',
  'oKKKKKKKKKKKKo',
  'oKKKKKKKKKKKKo',
  'oKKKKKKKKKKKKo',
  'oKKKKKKKKKKKKo',
  '.oKKKKKKKKKKo.',
  '.oKKKKKKKKKKo.',
  '.oKKkKKKKkKKo.',
  '..oKKKKKKKKo..',
  '...oKKKKKKo...',
]
const HIJAB_SIDE: Rows = [
  '...oooooooo...',
  '..oKKKKKKKKo..',
  '.oKKKKKKKKKKo.',
  'oKKKKKKKKKKKKo',
  'oKKkKKKKKKKKKo',
  'oKKKKKKKKKKKKo',
  '.....oKKKKKKKo',
  '.....oKKKKKKKo',
  '.....oKKKKKKKo',
  '.....oKKKKKKKo',
  '....oKKKKKKKKo',
  '..oKKKKKKKKKKo',
  '.oKKKKKKKKKKKo',
  '.oKKKKKKKKKKo.',
  '..oKKkKKKKKo..',
  '...oKKKKKKo...',
]

const CAP_FRONT: Rows = [
  '...oooooooo...',
  '..oCCCCCCCCo..',
  '.oCCCCCCCCCCo.',
  'oCCCCCCCCCCCCo',
  'oCCCCCCCCCCCCo',
  'o' + 'c'.repeat(12) + 'o',
]
const CAP_BACK: Rows = [
  '...oooooooo...',
  '..oCCCCCCCCo..',
  '.oCCCCCCCCCCo.',
  'oCCCCCCCCCCCCo',
  'oCCCCCCCCCCCCo',
  '.oCCCCoocCCCo.',
]
const CAP_SIDE: Rows = [
  '....oooooooo...',
  '...oCCCCCCCCo..',
  '..oCCCCCCCCCCo.',
  '.oCCCCCCCCCCCCo',
  'ooccccccCCCCCCo',
  '..oooooooooooo.',
]

const HEADPHONE_FRONT: Rows = [
  '...OOOOOOOO...',
  '..O........O..',
  '.O..........O.',
  '.O..........O.',
  '.O..........O.',
  'OOO........OOO',
  'OGO........OGO',
  'OGO........OGO',
  'OOO........OOO',
]
const HEADPHONE_SIDE: Rows = [
  '...OOOOOOOO...',
  '..O........O..',
  '.O..........O.',
  '............O.',
  '...........O..',
  '.........OOO..',
  '.........OGO..',
  '.........OGO..',
  '.........OOO..',
]
const EARMUFF_FRONT: Rows = [
  '....GGGGGGGG....',
  '...G........G...',
  '..G..........G..',
  '..G..........G..',
  '.oo.........oo.',
  'oWWo........oWWo',
  'oWxo........oxWo',
  'oWxo........oxWo',
  '.oo.........oo.',
]
const EARMUFF_SIDE: Rows = [
  '...GGGGGGGG...',
  '..G........G..',
  '.G..........G.',
  '............G.',
  '...........G..',
  '..........oo..',
  '.........oWWo.',
  '.........oWxo.',
  '.........oWxo.',
  '..........oo..',
]

const ACCESSORIES: Readonly<Record<AccessoryId, AccessoryDef>> = {
  ransel: {
    bawah: [
      {
        x: 0, y: 13, layer: 'belakang',
        rows: [
          '.oooooooooooooo.', 'oQQQQQQQQQQQQQQo', 'oQQQQQQQQQQQQQQo', 'oQqQQQQQQQQQQqQo',
          'oQQQQQQQQQQQQQQo', 'oQQQQQQQQQQQQQQo', 'oqqqqqqqqqqqqqqo',
        ],
      },
      { x: 5, y: 13, rows: ['Q....Q', 'Q....Q', 'qqqqqq', 'Q....Q'] },
    ],
    atas: [
      {
        x: 3, y: 12,
        rows: [
          '.oooooooo.', 'oQQQQQQQQo', 'oQQQQQQQQo', 'oQqqqqqqQo',
          'oQqQQQQqQo', 'oQqQQQQqQo', 'oQqqqqqqQo', '.oooooooo.',
        ],
      },
    ],
    kiri: [
      { x: 11, y: 13, rows: ['oooo.', 'oQQQo', 'oQqQo', 'oQQQo', 'oQqQo', 'oQQQo', 'ooooo'] },
    ],
  },
  selempang: {
    bawah: [
      { x: 4, y: 12, rows: ['QQ......', '.QQ.....', '..QQ....', '...QQ...', '....QQ..', '.....QQ.'] },
      { x: 10, y: 16, rows: ['oooo', 'oQQo', 'oqYo', 'oQQo', 'oooo'] },
    ],
    atas: [
      { x: 4, y: 12, rows: ['......QQ', '.....QQ.', '....QQ..', '...QQ...', '..QQ....', '.QQ.....'] },
      { x: 2, y: 16, rows: ['oooo', 'oQQo', 'oYqo', 'oQQo', 'oooo'] },
    ],
    kiri: [
      { x: 5, y: 12, rows: ['QQ', 'QQ', 'QQ', 'QQ', 'QQ', 'QQ'] },
      { x: 9, y: 16, rows: ['oooo', 'oQQo', 'oqYo', 'oQQo', 'oooo'] },
    ],
  },
  kacamata: {
    bawah: [
      { x: 3, y: 5, rows: ['OOOO..OOOO', 'O..OOOO..O', 'O..O..O..O', 'OOOO..OOOO'] },
    ],
    kiri: [
      { x: 3, y: 5, rows: ['OOOO......', 'O..OOOOOOO', 'O..O......', 'OOOO......'] },
    ],
  },
  headphone: {
    bawah: [{ x: 1, y: 1, rows: HEADPHONE_FRONT }],
    atas: [{ x: 1, y: 1, rows: HEADPHONE_FRONT }],
    kiri: [{ x: 1, y: 1, rows: HEADPHONE_SIDE }],
  },
  'penutup-telinga': {
    bawah: [{ x: 0, y: 1, rows: EARMUFF_FRONT }],
    atas: [{ x: 0, y: 1, rows: EARMUFF_FRONT }],
    kiri: [{ x: 1, y: 1, rows: EARMUFF_SIDE }],
  },
  topi: {
    bawah: [{ x: 1, y: 0, rows: CAP_FRONT }],
    atas: [{ x: 1, y: 0, rows: CAP_BACK }],
    kiri: [{ x: 0, y: 0, rows: CAP_SIDE }],
  },
  hijab: {
    bawah: [{ x: 1, y: 0, rows: HIJAB_FRONT }],
    atas: [{ x: 1, y: 0, rows: HIJAB_BACK }],
    kiri: [{ x: 1, y: 0, rows: HIJAB_SIDE }],
  },
  'id-card': {
    bawah: [
      { x: 5, y: 12, rows: ['U....U', '.U..U.'] },
      { x: 6, y: 14, rows: ['WWWW', 'WUUW', 'WWWW'] },
    ],
    atas: [{ x: 5, y: 12, rows: ['UUUUUU'] }],
    kiri: [{ x: 5, y: 14, rows: ['WUW', 'WWW', 'WWW'] }],
  },
  'helm-las': {
    bawah: [
      {
        x: 0, y: 15,
        rows: ['.ooooo.', 'oOYYYOo', 'oOnnnOo', 'oOnNnOo', 'oOOOOOo', '.ooooo.'],
      },
    ],
    atas: [
      {
        x: 9, y: 15,
        rows: ['.ooooo.', 'oOYYYOo', 'oOOOOOo', 'oOOGOOo', 'oOOOOOo', '.ooooo.'],
      },
    ],
    kiri: [
      {
        x: 3, y: 15,
        rows: ['.ooooo.', 'oOYYYOo', 'oOnnnOo', 'oOnNnOo', 'oOOOOOo', '.ooooo.'],
      },
    ],
  },
  'sarung-tangan': {
    bawah: [
      { x: 2, y: 16, rows: ['yYy', 'oYo'] },
      { x: 11, y: 16, rows: ['yYy', 'oYo'] },
    ],
    atas: [
      { x: 2, y: 16, rows: ['yYy', 'oYo'] },
      { x: 11, y: 16, rows: ['yYy', 'oYo'] },
    ],
    kiri: [{ x: 6, y: 16, rows: ['yYy', 'oYo'] }],
  },
  ponsel: {
    bawah: [{ x: 11, y: 15, rows: ['ooo', 'oUo', 'oUo', 'oOo', 'ooo'] }],
    kiri: [{ x: 4, y: 15, rows: ['ooo', 'oUo', 'oUo', 'oOo', 'ooo'] }],
  },
  'laptop-dipeluk': {
    bawah: [
      {
        x: 3, y: 13,
        rows: [
          'oooooooooo', 'oOOOOOOOOo', 'oORROOYYOo', 'oOOOUUOORo',
          'oOOOOOOOOo', 'oGGGGGGGGo', 'oooooooooo',
        ],
      },
      { x: 2, y: 16, rows: ['oTTs', 'oTTo'] },
      { x: 10, y: 16, rows: ['sTTo', 'oTTo'] },
    ],
    kiri: [
      { x: 4, y: 13, rows: ['ooo', 'oGo', 'oOo', 'oRo', 'oOo', 'oGo', 'ooo'] },
      { x: 3, y: 16, rows: ['TTs', 'TTo'] },
    ],
  },
  buku: {
    bawah: [{ x: 1, y: 14, rows: ['ooooo', 'oNNNo', 'oNWNo', 'oNNNo', 'oNNNo', 'ooooo'] }],
    kiri: [{ x: 3, y: 15, rows: ['oooo', 'oNNo', 'oNWo', 'oNNo', 'oooo'] }],
  },
  kertas: {
    bawah: [{ x: 11, y: 14, rows: ['oooo', 'oPPo', 'oGGo', 'oPPo', 'oGGo', 'oooo'] }],
    kiri: [{ x: 3, y: 15, rows: ['ooo', 'oPo', 'oGo', 'oPo', 'ooo'] }],
  },
  botol: {
    bawah: [{ x: 11, y: 14, rows: ['.R.', 'oUo', 'oWo', 'oUo', 'oUo', 'ooo'] }],
    kiri: [{ x: 4, y: 14, rows: ['.R.', 'oUo', 'oWo', 'oUo', 'oUo', 'ooo'] }],
  },
  pulpen: {
    bawah: [{ x: 14, y: 14, rows: ['R', 'U', 'U', 'O'] }],
    kiri: [{ x: 4, y: 14, rows: ['R', 'U', 'U', 'O'] }],
  },
  'jam-tangan': {
    bawah: [{ x: 3, y: 16, rows: ['YO'] }],
    atas: [{ x: 3, y: 16, rows: ['OY'] }],
    kiri: [{ x: 6, y: 16, rows: ['OY'] }],
  },
  'gelang-karet': {
    bawah: [{ x: 11, y: 16, rows: ['RR'] }],
    atas: [{ x: 11, y: 16, rows: ['RR'] }],
    kiri: [{ x: 7, y: 16, rows: ['RR'] }],
  },
  'kain-bersih': {
    bawah: [{ x: 2, y: 17, rows: ['WWW', 'WUW', 'WWW', 'WUW', '.W.'] }],
    kiri: [{ x: 9, y: 17, rows: ['WWW', 'WUW', 'WWW', 'WUW', '.W.'] }],
  },
  'lengan-panjang': {
    bawah: [
      { x: 2, y: 17, rows: ['oLo', 'oto'] },
      { x: 11, y: 17, rows: ['oLo', 'oto'] },
    ],
    atas: [
      { x: 2, y: 17, rows: ['oLo', 'oto'] },
      { x: 11, y: 17, rows: ['oLo', 'oto'] },
    ],
    kiri: [{ x: 6, y: 17, rows: ['oLo', 'oto'] }],
  },
}

/** Urutan gambar: benda besar di badan dulu, lalu hiasan kepala, lalu benda genggam. */
const ACCESSORY_ORDER: readonly AccessoryId[] = [
  'ransel', 'selempang', 'hijab', 'topi', 'headphone', 'penutup-telinga', 'kacamata',
  'id-card', 'lengan-panjang', 'sarung-tangan', 'jam-tangan', 'gelang-karet',
  'kain-bersih', 'laptop-dipeluk', 'buku', 'kertas', 'botol', 'ponsel', 'pulpen', 'helm-las',
]

export function orderedAccessories(a: CharacterAppearance): readonly AccessoryId[] {
  const set = new Set<AccessoryId>(a.accessories)
  if (a.hair.kind === 'kerudung') set.add('hijab')
  return ACCESSORY_ORDER.filter((id) => set.has(id))
}

export interface AccessoryStamps {
  belakang: Stamp[]
  depan: Stamp[]
}

/** Rambut dan aksesori untuk satu arah (Layer 3), terpisah belakang dan depan. */
export function accessoryStamps(a: CharacterAppearance, view: View): AccessoryStamps {
  const belakang: Stamp[] = []
  const depan: Stamp[] = hairStamps(a, view)
  for (const id of orderedAccessories(a)) {
    const parts = ACCESSORIES[id][view]
    if (!parts) continue
    for (const p of parts) (p.layer === 'belakang' ? belakang : depan).push(p)
  }
  return { belakang, depan }
}
