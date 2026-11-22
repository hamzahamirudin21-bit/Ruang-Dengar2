/** Animasi potret hidup: fungsi murni (tanpa react/document/window). */
import { MOTION_MS } from '../motion/motionTokens';

export type MouthShape = 'tutup' | 'setengah' | 'buka';

export interface PoseInput {
  timeMs: number;
  seedId: string;
  isSpeaker: boolean;
  isTyping: boolean;
  msSinceSpeakerChange: number;
  reduced: boolean;
}

export interface Pose {
  breathDy: number;
  scaleX: number;
  scaleY: number;
  brightness: number;
  eyesClosed: boolean;
  mouth: MouthShape;
}

export interface Blink {
  startMs: number;
  endMs: number;
}

const MOUTH_CYCLE: readonly MouthShape[] = ['tutup', 'setengah', 'buka'];
const MOUTH_STEP_MS = 110;
const BREATH_AMPLITUDE = 1.5;
const BLINK_GAP_MIN = 2400;
const BLINK_GAP_SPAN = 2800;

/** Waktu tidak sah (NaN, negatif, tak hingga) → 0. */
function safeTime(v: number): number {
  return typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : 0;
}

function hashString(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

function hash01(s: string): number {
  return hashString(s) / 4294967296;
}

function makeRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function speakerScale(isSpeaker: boolean): number {
  return isSpeaker ? 1 : 0.94;
}

export function speakerBrightness(isSpeaker: boolean): number {
  return isSpeaker ? 1 : 0.82;
}

/** Jadwal kedip deterministik dari seedId, memotong rentang [fromMs, toMs]. */
export function blinkSchedule(seedId: string, fromMs: number, toMs: number): Blink[] {
  const from = safeTime(fromMs);
  const to = safeTime(toMs);
  const dur = MOTION_MS.kedip;
  const rng = makeRng(hashString(seedId));
  const out: Blink[] = [];
  let t = 0;
  while (t < to) {
    t += BLINK_GAP_MIN + Math.floor(rng() * BLINK_GAP_SPAN);
    if (t + dur > from && t < to) out.push({ startMs: t, endMs: t + dur });
    t += dur;
  }
  return out;
}

function squashCurve(u: number): number {
  // 0 → 0,94; puncak 1,04 di u = 0,5; 1 → 1
  if (u <= 0.5) return 0.94 + (1.04 - 0.94) * (u / 0.5);
  return 1.04 + (1 - 1.04) * ((u - 0.5) / 0.5);
}

export function portraitPose(input: PoseInput): Pose {
  const brightness = speakerBrightness(input.isSpeaker);
  if (input.reduced) {
    return { breathDy: 0, scaleX: 1, scaleY: 1, brightness, eyesClosed: false, mouth: 'tutup' };
  }
  const time = safeTime(input.timeMs);
  const since = safeTime(input.msSinceSpeakerChange);

  const phase = (time / MOTION_MS.napas + hash01(input.seedId)) % 1;
  const breathDy = Math.sin(2 * Math.PI * phase) * BREATH_AMPLITUDE;

  const blinks = blinkSchedule(input.seedId, Math.max(0, time - MOTION_MS.kedip), time + 1);
  const eyesClosed = blinks.some((b) => time >= b.startMs && time < b.endMs);

  const mouth: MouthShape =
    input.isSpeaker && input.isTyping
      ? MOUTH_CYCLE[Math.floor(time / MOUTH_STEP_MS) % MOUTH_CYCLE.length]
      : 'tutup';

  let scaleY = 1;
  if (input.isSpeaker && since < MOTION_MS['squash-bicara']) {
    scaleY = Math.min(1.04, Math.max(0.94, squashCurve(since / MOTION_MS['squash-bicara'])));
  }
  const scaleX = Math.min(1.06, Math.max(0.96, 2 - scaleY));

  return { breathDy, scaleX, scaleY, brightness, eyesClosed, mouth };
}
