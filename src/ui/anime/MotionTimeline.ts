import type { AnimeExpressionId, AnimeSequenceKind } from './CharacterAssetManager';
import type { PoseId } from '../characters/poseCatalog';

export type MotionTransitionType = 'crossfade' | 'snap-reaction' | 'smooth-settle';

export interface MotionKeyframe {
  characterId: string;
  emotion: string;
  expressionId: AnimeExpressionId;
  poseId: PoseId;
  gestureId: string;
  animationSequence: AnimeSequenceKind;
  startTime: number;
  duration: number;
  transitionType: MotionTransitionType;
}

/**
 * MotionTimeline — Mengevaluasi keyframe aktif pada waktu `elapsedMs`
 * serta menghitung faktor interpolasi transisi (0..1) antar-keyframe.
 */
export class MotionTimeline {
  private keyframes: readonly MotionKeyframe[];

  constructor(keyframes: readonly MotionKeyframe[]) {
    this.keyframes = [...keyframes].sort((a, b) => a.startTime - b.startTime);
  }

  public sampleAt(elapsedMs: number): {
    active: MotionKeyframe | null;
    localElapsedMs: number;
    transitionAlpha01: number;
  } {
    if (this.keyframes.length === 0) {
      return { active: null, localElapsedMs: 0, transitionAlpha01: 1 };
    }
    const t = Math.max(0, elapsedMs);
    let active = this.keyframes[0];
    for (const kf of this.keyframes) {
      if (t >= kf.startTime) {
        active = kf;
      } else {
        break;
      }
    }
    const localElapsedMs = Math.max(0, t - active.startTime);
    const blendWindow = active.transitionType === 'snap-reaction' ? 140 : 280;
    const transitionAlpha01 = Math.max(0, Math.min(1, localElapsedMs / blendWindow));
    return { active, localElapsedMs, transitionAlpha01 };
  }
}
