import { phaseOffsetFor, selectFrame } from '../characters/animation';
import type { AnimKind, Direction } from '../characters/pixelGrid';
import { MiniSpriteActivity, PanelMiniActorSpec } from './StoryTimeline';

export interface MiniSpriteAnimationState {
  characterId: string;
  activity: MiniSpriteActivity;
  /** Koordinat tile X aktual pada LAB_MAP (52x24) */
  tileX: number;
  /** Koordinat tile Y aktual pada LAB_MAP (52x24) */
  tileY: number;
  /** Arah hadap sprite 4 arah ('down' | 'left' | 'right' | 'up') */
  dir: Direction;
  /** Jenis animasi sprite ('idle' | 'walk') untuk drawSprite */
  anim: AnimKind;
  /** Nomor frame animasi sprite */
  frame: number;
  /** Sedang bergerak melintasi jalur */
  isMoving: boolean;
  /** Sedang berbicara aktif */
  isSpeaking: boolean;
  /** Fase siklus aktivitas peralatan (0..1) untuk indikator visual alat */
  workPulse01: number;
}

function easeInOutQuad(t: number): number {
  const p = Math.max(0, Math.min(1, t));
  return p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
}

function directionFromDelta(dx: number, dy: number, fallback: Direction): Direction {
  if (Math.abs(dx) < 0.001 && Math.abs(dy) < 0.001) return fallback;
  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? 'kanan' : 'kiri';
  }
  return dy > 0 ? 'bawah' : 'atas';
}

/**
 * Menghitung posisi, arah hadap 4-arah, dan frame animasi untuk Mini Character Sprite.
 * - TIDAK memisahkan tangan atau kaki dari tubuh.
 * - TIDAK melakukan stretch atau distorsi bentuk sprite.
 * - Menggunakan interpolasi jalur (path animation) yang mulus dan stabil pada titik dasar kaki.
 */
export function computeMiniSpriteAnimationState(
  actor: PanelMiniActorSpec,
  pageElapsedMs: number,
  pageDurationMs: number,
  isSpeaking: boolean,
  reducedMotion = false
): MiniSpriteAnimationState {
  const tSec = Math.max(0, pageElapsedMs) / 1000;
  const phase = phaseOffsetFor(actor.characterId);
  const rawProgress = Math.max(0, Math.min(1, pageElapsedMs / Math.max(1, pageDurationMs)));
  const workPulse01 = reducedMotion ? 0.5 : 0.5 + 0.5 * Math.sin(tSec * 5.2 + phase * 6.28);

  // Path interpolation untuk karakter yang berjalan melewati koridor / halaman kampus
  const points = [actor.startTile, ...(actor.waypoints ?? [])];
  let tileX = actor.startTile.x;
  let tileY = actor.startTile.y;
  let dir: Direction = actor.facing;
  let isMoving = false;

  if (actor.activity === 'walk' && points.length > 1) {
    if (reducedMotion) {
      const last = points[points.length - 1];
      tileX = last.x;
      tileY = last.y;
      isMoving = false;
    } else {
      // Gunakan 82% durasi halaman untuk berjalan mulus lalu berhenti stabil di tujuan
      const walkWindow01 = Math.min(1, rawProgress / 0.82);
      const eased = easeInOutQuad(walkWindow01);
      isMoving = walkWindow01 < 0.995;

      // Hitung panjang total segmen jalur
      const segLengths: number[] = [];
      let totalLen = 0;
      for (let i = 0; i < points.length - 1; i += 1) {
        const dx = points[i + 1].x - points[i].x;
        const dy = points[i + 1].y - points[i].y;
        const len = Math.hypot(dx, dy);
        segLengths.push(len);
        totalLen += len;
      }

      if (totalLen > 0.001) {
        const targetDist = eased * totalLen;
        let acc = 0;
        for (let i = 0; i < segLengths.length; i += 1) {
          const segLen = segLengths[i];
          if (acc + segLen >= targetDist || i === segLengths.length - 1) {
            const localT = segLen > 0 ? Math.max(0, Math.min(1, (targetDist - acc) / segLen)) : 1;
            const p0 = points[i];
            const p1 = points[i + 1];
            tileX = p0.x + (p1.x - p0.x) * localT;
            tileY = p0.y + (p1.y - p0.y) * localT;
            dir = directionFromDelta(p1.x - p0.x, p1.y - p0.y, actor.facing);
            break;
          }
          acc += segLen;
        }
      }
    }
  } else if (actor.activity === 'turn' && actor.turnToFacing) {
    dir = rawProgress >= 0.48 ? actor.turnToFacing : actor.facing;
  }

  // Pilih frame sprite asli menggunakan fungsi selectFrame yang sama dengan simulasi utama
  const frameChoice = selectFrame({
    moving: isMoving,
    timeSeconds: tSec,
    reducedMotion,
    phaseOffset: phase,
  });

  return {
    characterId: actor.characterId,
    activity: actor.activity,
    tileX,
    tileY,
    dir,
    anim: frameChoice.anim,
    frame: frameChoice.frame,
    isMoving,
    isSpeaking,
    workPulse01,
  };
}
