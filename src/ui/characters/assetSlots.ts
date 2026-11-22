import type { StoryExpression } from '../../engine/story/storyTypes'
import {
  IDLE_FRAMES,
  SPRITE_H,
  SPRITE_W,
  WALK_FRAMES,
  type AnimKind,
  type Direction,
} from './pixelGrid'

export interface CharacterAssetEntry {
  portrait?: string
  sprite?: string
  cell?: { w: number; h: number }
  expressions?: Partial<Record<StoryExpression, string>>
}

export interface AssetManifest {
  version: 1
  characters: Record<string, CharacterAssetEntry>
}

export const ASSET_BASE = '/assets/characters'
export const MANIFEST_URL = `${ASSET_BASE}/manifest.json`

const EXPRESSION_KEYS: readonly StoryExpression[] = [
  'netral', 'waspada', 'menunduk', 'cemas', 'lega', 'tersenyum',
  'lelah', 'kesal', 'terkejut', 'tertegun', 'menutup-diri',
]

const DIR_ROW: Record<Direction, number> = { bawah: 0, kiri: 1, kanan: 2, atas: 3 }

/** Sel sprite sheet: kolom 0-1 idle, 2-5 jalan; baris 0 bawah, 1 kiri, 2 kanan, 3 atas. */
export function spriteSheetCell(
  dir: Direction,
  anim: AnimKind,
  frame: number,
): { col: number; row: number } {
  const count = anim === 'idle' ? IDLE_FRAMES : WALK_FRAMES
  const f = ((Math.trunc(Number.isFinite(frame) ? frame : 0) % count) + count) % count
  return { col: anim === 'idle' ? f : IDLE_FRAMES + f, row: DIR_ROW[dir] ?? 0 }
}

/** Transformasi ringan untuk potret aset tanpa gambar ekspresi khusus. */
export interface ExpressionTransform {
  /** Pergeseran vertikal kepala/potret dalam persen tinggi. */
  dyPercent: number
  /** Rotasi kecil dalam derajat. */
  rotateDeg: number
  /** Kecerahan (1 = normal). */
  brightness: number
  /** Ornamen ikon kecil. */
  ornament: 'none' | 'keringat' | 'rona' | 'helaan'
}

export const EXPRESSION_TRANSFORMS: Readonly<Record<StoryExpression, ExpressionTransform>> = {
  netral: { dyPercent: 0, rotateDeg: 0, brightness: 1, ornament: 'none' },
  waspada: { dyPercent: -1, rotateDeg: 0, brightness: 1.03, ornament: 'none' },
  menunduk: { dyPercent: 3, rotateDeg: 0, brightness: 0.95, ornament: 'none' },
  cemas: { dyPercent: 1, rotateDeg: -2, brightness: 0.97, ornament: 'keringat' },
  lega: { dyPercent: 0, rotateDeg: 0, brightness: 1.05, ornament: 'helaan' },
  tersenyum: { dyPercent: -1, rotateDeg: 1, brightness: 1.06, ornament: 'rona' },
  lelah: { dyPercent: 2, rotateDeg: 2, brightness: 0.92, ornament: 'helaan' },
  kesal: { dyPercent: 0, rotateDeg: -1, brightness: 0.96, ornament: 'none' },
  terkejut: { dyPercent: -2, rotateDeg: 0, brightness: 1.08, ornament: 'none' },
  tertegun: { dyPercent: 0, rotateDeg: 0, brightness: 1.02, ornament: 'none' },
  'menutup-diri': { dyPercent: 3, rotateDeg: 3, brightness: 0.88, ornament: 'none' },
}

export function transformForExpression(expression: StoryExpression): ExpressionTransform {
  return EXPRESSION_TRANSFORMS[expression] ?? EXPRESSION_TRANSFORMS.netral
}

/** Nama berkas aman: relatif, tanpa "..", "\", awalan skema URL, atau garis miring awal. */
export function isSafeAssetName(name: unknown): name is string {
  if (typeof name !== 'string' || name.length === 0) return false
  if (name.includes('..') || name.includes('\\') || name.includes(':')) return false
  if (name.startsWith('/')) return false
  if (/[\u0000-\u001f]/.test(name)) return false
  return true
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function has(obj: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(obj, key)
}

function parseCell(raw: unknown): { w: number; h: number } | undefined {
  if (!isRecord(raw)) return undefined
  const { w, h } = raw
  if (typeof w !== 'number' || typeof h !== 'number') return undefined
  if (!Number.isInteger(w) || !Number.isInteger(h) || w < 1 || h < 1 || w > 1024 || h > 1024) {
    return undefined
  }
  return { w, h }
}

function parseEntry(raw: unknown): CharacterAssetEntry | null {
  if (!isRecord(raw)) return null
  const entry: CharacterAssetEntry = {}
  if (isSafeAssetName(raw.portrait)) entry.portrait = raw.portrait
  if (isSafeAssetName(raw.sprite)) entry.sprite = raw.sprite
  const cell = parseCell(raw.cell)
  if (cell) entry.cell = cell
  if (isRecord(raw.expressions)) {
    const expressions: Partial<Record<StoryExpression, string>> = {}
    for (const key of EXPRESSION_KEYS) {
      if (has(raw.expressions, key) && isSafeAssetName(raw.expressions[key])) {
        expressions[key] = raw.expressions[key] as string
      }
    }
    if (Object.keys(expressions).length > 0) entry.expressions = expressions
  }
  return entry
}

/** Mengembalikan null bila bentuk tidak sah; entri bernama berbahaya diabaikan. Tidak pernah melempar. */
export function parseManifest(raw: unknown): AssetManifest | null {
  try {
    if (!isRecord(raw) || raw.version !== 1 || !isRecord(raw.characters)) return null
    const characters: Record<string, CharacterAssetEntry> = {}
    for (const id of Object.keys(raw.characters)) {
      const entry = parseEntry(raw.characters[id])
      if (entry) characters[id] = entry
    }
    return { version: 1, characters }
  } catch {
    return null
  }
}

function entryFor(manifest: AssetManifest | null, id: string): CharacterAssetEntry | undefined {
  if (!manifest || !isRecord(manifest.characters)) return undefined
  if (typeof id !== 'string' || !has(manifest.characters, id)) return undefined
  const entry = manifest.characters[id]
  return isRecord(entry) ? (entry as CharacterAssetEntry) : undefined
}

export function assetUrl(name: string): string {
  return `${ASSET_BASE}/${name}`
}

export type PortraitSource =
  | { kind: 'aset'; url: string; specificExpression: boolean }
  | { kind: 'prosedural' }

export type SpriteSource =
  | { kind: 'aset'; url: string; cell: { w: number; h: number } }
  | { kind: 'prosedural' }

export function resolvePortraitSource(
  id: string,
  expression: StoryExpression,
  manifest: AssetManifest | null,
  loaded: ReadonlySet<string>,
): PortraitSource {
  try {
    const entry = entryFor(manifest, id)
    if (!entry) return { kind: 'prosedural' }
    const exprFile = entry.expressions && has(entry.expressions, expression)
      ? entry.expressions[expression]
      : undefined
    if (isSafeAssetName(exprFile)) {
      const url = assetUrl(exprFile)
      if (loaded.has(url)) return { kind: 'aset', url, specificExpression: true }
    }
    if (isSafeAssetName(entry.portrait)) {
      const url = assetUrl(entry.portrait)
      if (loaded.has(url)) return { kind: 'aset', url, specificExpression: false }
    }
    return { kind: 'prosedural' }
  } catch {
    return { kind: 'prosedural' }
  }
}

export function resolveSpriteSource(
  id: string,
  manifest: AssetManifest | null,
  loaded: ReadonlySet<string>,
): SpriteSource {
  try {
    const entry = entryFor(manifest, id)
    if (!entry || !isSafeAssetName(entry.sprite)) return { kind: 'prosedural' }
    const url = assetUrl(entry.sprite)
    if (!loaded.has(url)) return { kind: 'prosedural' }
    return { kind: 'aset', url, cell: entry.cell ?? { w: SPRITE_W, h: SPRITE_H } }
  } catch {
    return { kind: 'prosedural' }
  }
}

/** Memuat manifest opsional. Tidak pernah melempar; respons non-JSON (mis. HTML fallback) menjadi null. */
export async function loadManifest(fetcher?: typeof fetch): Promise<AssetManifest | null> {
  try {
    const f = fetcher ?? (typeof fetch === 'function' ? fetch : undefined)
    if (!f) return null
    const res = await f(MANIFEST_URL)
    if (!res || !res.ok) return null
    const text = await res.text()
    if (text.trimStart().startsWith('<')) return null
    return parseManifest(JSON.parse(text))
  } catch {
    return null
  }
}

/** true bila gambar termuat. Tidak pernah melempar atau menolak. */
export function preloadImage(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      if (typeof Image === 'undefined') {
        resolve(false)
        return
      }
      const img = new Image()
      img.onload = () => resolve(true)
      img.onerror = () => resolve(false)
      img.src = url
    } catch {
      resolve(false)
    }
  })
}
