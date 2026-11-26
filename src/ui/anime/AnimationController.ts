import type { AnimeSequenceKind } from './CharacterAssetManager';
import { getDesignBibleEntry } from './characterDesignBible';

export interface SequenceFrameInfo {
  sequenceKind: AnimeSequenceKind;
  frameIndex: number;
  frameCount: number;
  assetPath: string;
  loopProgress01: number;
}

export const SEQUENCE_FRAME_COUNTS: Readonly<Record<AnimeSequenceKind, number>> = {
  idle: 6,
  walking: 8,
  talking: 4,
  gestures: 4,
};

const SEQUENCE_FPS: Readonly<Record<AnimeSequenceKind, number>> = {
  idle: 4,
  walking: 8,
  talking: 6,
  gestures: 5,
};

const SEQUENCE_FILE_PREFIX: Readonly<Record<AnimeSequenceKind, string>> = {
  idle: 'idle',
  walking: 'walk',
  talking: 'talk',
  gestures: 'gesture',
};

/**
 * AnimationController — Menghitung frame sequence deterministik (idle 6-frame,
 * walking 8-frame, talking 4-frame lip-sync, gestures 4-frame) dengan looping mulus
 * dan keselarasan anchor bottom-center.
 */
export class AnimationController {
  public sampleSequenceFrame(
    characterId: string,
    sequenceKind: AnimeSequenceKind,
    elapsedMs: number,
    reducedMotion = false
  ): SequenceFrameInfo | null {
    const entry = getDesignBibleEntry(characterId);
    if (!entry) return null;

    const frameCount = SEQUENCE_FRAME_COUNTS[sequenceKind];
    const fps = SEQUENCE_FPS[sequenceKind];
    const safeMs = Math.max(0, Number.isFinite(elapsedMs) ? elapsedMs : 0);
    const frameIndex = reducedMotion
      ? 0
      : Math.floor((safeMs / 1000) * fps) % frameCount;
    const num = String(frameIndex + 1).padStart(2, '0');
    const prefix = SEQUENCE_FILE_PREFIX[sequenceKind];

    return {
      sequenceKind,
      frameIndex,
      frameCount,
      assetPath: `/assets/anime-characters/${entry.slug}/animations/${sequenceKind}/${entry.slug}_animation_${prefix}_${num}.png`,
      loopProgress01: frameIndex / Math.max(1, frameCount),
    };
  }
}

export const sharedAnimationController = new AnimationController();
