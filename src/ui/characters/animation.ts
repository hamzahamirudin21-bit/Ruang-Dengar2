import type { StudentAgent } from '../../types'
import {
  IDLE_FRAMES,
  WALK_FRAMES,
  type AnimKind,
  type Direction,
} from './pixelGrid'

export interface FrameChoice {
  anim: AnimKind
  frame: number
}

export const WALK_FPS = 8
export const IDLE_FPS = 2

type FacingAgent = Pick<
  StudentAgent,
  'position' | 'path' | 'pathStepIndex' | 'status' | 'interactingWithIds'
>

type Point = { x: number; y: number }

/** Benar bila agen berpindah dan langkah berikutnya pada path tersedia. */
function nextStep(agent: FacingAgent): Point | undefined {
  if (agent.status !== 'berpindah') return undefined
  return agent.path[agent.pathStepIndex]
}

export function facingOf(
  agent: FacingAgent,
  lookupPosition: (id: string) => Point | undefined,
): Direction {
  let target: Point | undefined = nextStep(agent)
  if (!target) {
    for (const id of agent.interactingWithIds) {
      const p = lookupPosition(id)
      if (p) {
        target = p
        break
      }
    }
  }
  if (!target) return 'bawah'
  const dx = target.x - agent.position.x
  const dy = target.y - agent.position.y
  if (dx === 0 && dy === 0) return 'bawah'
  if (Math.abs(dx) >= Math.abs(dy)) return dx < 0 ? 'kiri' : 'kanan'
  return dy < 0 ? 'atas' : 'bawah'
}

export function isWalking(agent: FacingAgent): boolean {
  return nextStep(agent) !== undefined
}

export function selectFrame(input: {
  moving: boolean
  timeSeconds: number
  reducedMotion: boolean
  phaseOffset: number
}): FrameChoice {
  if (input.reducedMotion) return { anim: 'idle', frame: 0 }
  const fps = input.moving ? WALK_FPS : IDLE_FPS
  const count = input.moving ? WALK_FRAMES : IDLE_FRAMES
  const t = Number.isFinite(input.timeSeconds) ? Math.max(0, input.timeSeconds) : 0
  const tick = Math.floor((t + input.phaseOffset) * fps)
  return { anim: input.moving ? 'jalan' : 'idle', frame: tick % count }
}

/** Hash FNV-1a deterministik dari id ke rentang [0, 1). */
export function phaseOffsetFor(studentId: string): number {
  let h = 2166136261
  for (let i = 0; i < studentId.length; i++) {
    h ^= studentId.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0) / 4294967296
}

/** Nomor tik animasi global pada laju tercepat (jalan). */
export function animationTick(timeSeconds: number): number {
  const t = Number.isFinite(timeSeconds) ? Math.max(0, timeSeconds) : 0
  return Math.floor(t * WALK_FPS)
}

export function shouldRedrawForAnimation(
  prevTick: number,
  nowTick: number,
  reducedMotion: boolean,
): boolean {
  if (reducedMotion) return false
  return prevTick !== nowTick
}
