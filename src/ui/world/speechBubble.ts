import type { AgentActivityStatus, AgentSocialStatus } from '../../types'
import type { PixelGrid } from '../characters/pixelGrid'
import { measurePixelText, paintPixelText } from './pixelFont'

export type BubbleGlyph = 'hi' | 'titik' | 'tanya' | 'seru' | 'nada'

export interface BubbleInput {
  agentId: string
  status: AgentActivityStatus
  socialStatus: AgentSocialStatus
  hasInteractionPartner: boolean
  /** null bila avatar tidak idle */
  distanceToAvatarTiles: number | null
  timeSeconds: number
  reducedMotion: boolean
}

export interface BubbleSpec {
  glyph: BubbleGlyph
  text: string
  hopPx: number
}

export const BUBBLE_NEAR_TILES = 2.5
export const MAX_BUBBLES = 4

const TEKS: Readonly<Record<BubbleGlyph, string>> = {
  hi: 'Hi!',
  titik: '...',
  tanya: '?',
  seru: '!',
  nada: '♪',
}

const POOL_OBROL: readonly BubbleGlyph[] = ['titik', 'tanya', 'seru', 'nada']

const FILL = '#ffffff'
const BORDER = '#1b2a49'
const TEXT = '#1b2a49'
const PAD_X = 2
const PAD_Y = 2
const TAIL_H = 3

function hashString(s: string, bucket: number): number {
  let h = 2166136261 ^ bucket
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** Balon ucapan untuk satu agen, atau null. Hanya memakai status terlihat, jarak, waktu, dan id. */
export function bubbleFor(input: BubbleInput): BubbleSpec | null {
  if (input.status === 'berpindah') return null
  let glyph: BubbleGlyph
  if (input.status === 'mengobrol' && input.hasInteractionPartner) {
    const bucket = Math.floor(input.timeSeconds / 5)
    glyph = POOL_OBROL[hashString(input.agentId, bucket) % POOL_OBROL.length]
  } else if (
    input.distanceToAvatarTiles !== null &&
    input.distanceToAvatarTiles <= BUBBLE_NEAR_TILES
  ) {
    glyph = 'hi'
  } else {
    return null
  }
  const hopPx = input.reducedMotion ? 0 : Math.round(Math.abs(Math.sin(input.timeSeconds * 4)))
  return { glyph, text: TEKS[glyph], hopPx }
}

/** Pilih paling banyak MAX_BUBBLES id, terdekat dulu (stabil menurut urutan masukan). */
export function selectBubbles(
  candidates: readonly { agentId: string; spec: BubbleSpec; distance: number }[],
): readonly string[] {
  return candidates
    .map((c, i) => ({ c, i }))
    .sort((a, b) => a.c.distance - b.c.distance || a.i - b.i)
    .slice(0, MAX_BUBBLES)
    .map((e) => e.c.agentId)
}

/** Balon putih berbingkai gelap dengan sudut terpotong dan ekor di bawah tengah. */
export function paintBubble(spec: BubbleSpec): PixelGrid {
  const t = measurePixelText(spec.text)
  const bw = t.w + 2 * (PAD_X + 1)
  const bh = t.h + 2 * (PAD_Y + 1)
  const w = bw
  const h = bh + TAIL_H
  const cells: (string | null)[] = new Array(w * h).fill(null)
  for (let y = 0; y < bh; y++) {
    for (let x = 0; x < bw; x++) {
      const edge = x === 0 || y === 0 || x === bw - 1 || y === bh - 1
      cells[y * w + x] = edge ? BORDER : FILL
    }
  }
  for (const [x, y] of [[0, 0], [bw - 1, 0], [0, bh - 1], [bw - 1, bh - 1]] as const) {
    cells[y * w + x] = null
  }
  // Ekor: segitiga menurun, tepi gelap dengan isi putih.
  const cx = Math.floor(w / 2)
  cells[(bh - 1) * w + cx - 1] = FILL
  cells[(bh - 1) * w + cx] = FILL
  cells[(bh - 1) * w + cx + 1] = BORDER
  cells[(bh - 1) * w + cx - 2] = BORDER
  cells[bh * w + cx - 1] = BORDER
  cells[bh * w + cx] = FILL
  cells[bh * w + cx + 1] = BORDER
  cells[(bh + 1) * w + cx] = BORDER
  cells[(bh + 1) * w + cx - 1] = BORDER
  cells[(bh + 2) * w + cx - 1] = null
  const label = paintPixelText(spec.text, TEXT)
  const ox = 1 + PAD_X
  const oy = 1 + PAD_Y
  for (let y = 0; y < label.height; y++) {
    for (let x = 0; x < label.width; x++) {
      const c = label.cells[y * label.width + x]
      if (c) cells[(oy + y) * w + ox + x] = c
    }
  }
  return { width: w, height: h, cells }
}
