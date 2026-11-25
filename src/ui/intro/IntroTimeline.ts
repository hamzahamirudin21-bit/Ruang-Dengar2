import {
  COMIC_INTRO_BEATS,
  COMIC_INTRO_TOTAL_DURATION_MS,
  ComicCameraMotion,
  ComicDialogueEntry,
  ComicIntroBeat,
} from './comicIntroData';

export interface ActiveDialogueRenderState {
  entry: ComicDialogueEntry;
  visibleText: string;
  progress: number;
  isComplete: boolean;
}

export interface IntroTimelineSnapshot {
  elapsedMs: number;
  totalDurationMs: number;
  overallProgress: number;
  activeBeatIndex: number;
  activeBeat: ComicIntroBeat;
  beatElapsedMs: number;
  beatProgress: number;
  isFinished: boolean;
  activeDialogues: readonly ActiveDialogueRenderState[];
  narrativeVisibleText: string;
  narrativeProgress: number;
}

export function clampTimelineMs(ms: number, totalDurationMs = COMIC_INTRO_TOTAL_DURATION_MS): number {
  if (!Number.isFinite(ms)) return 0;
  return Math.max(0, Math.min(totalDurationMs, ms));
}

export function typewriterTextAt(fullText: string, elapsedMs: number, revealDurationMs = 1400): {
  text: string;
  progress: number;
  isComplete: boolean;
} {
  if (!fullText) {
    return { text: '', progress: 1, isComplete: true };
  }
  const safeDuration = Math.max(120, revealDurationMs);
  const progress = Math.max(0, Math.min(1, elapsedMs / safeDuration));
  const charCount = Math.round(fullText.length * progress);
  return {
    text: fullText.slice(0, charCount),
    progress,
    isComplete: charCount >= fullText.length,
  };
}

export function computeCameraTransformStyle(
  motion: ComicCameraMotion,
  beatProgress: number,
  reducedMotion = false
): { transform: string } {
  if (reducedMotion) {
    return { transform: 'translate3d(0px, 0px, 0px) scale(1)' };
  }
  const p = Math.max(0, Math.min(1, beatProgress));
  switch (motion) {
    case 'slow-zoom-in': {
      const scale = 1 + p * 0.045;
      return { transform: `translate3d(0px, ${(-p * 4).toFixed(2)}px, 0px) scale(${scale.toFixed(4)})` };
    }
    case 'slow-zoom-out': {
      const scale = 1.045 - p * 0.045;
      return { transform: `translate3d(0px, 0px, 0px) scale(${scale.toFixed(4)})` };
    }
    case 'pan-left-to-right': {
      const tx = -10 + p * 20;
      return { transform: `translate3d(${tx.toFixed(2)}px, 0px, 0px) scale(1.025)` };
    }
    case 'pan-right-to-left': {
      const tx = 10 - p * 20;
      return { transform: `translate3d(${tx.toFixed(2)}px, 0px, 0px) scale(1.025)` };
    }
    case 'track-forward': {
      const ty = 6 - p * 12;
      const scale = 1 + p * 0.05;
      return { transform: `translate3d(0px, ${ty.toFixed(2)}px, 0px) scale(${scale.toFixed(4)})` };
    }
    case 'dynamic-tilt': {
      const tx = -6 + p * 12;
      const scale = 1.01 + p * 0.03;
      return { transform: `translate3d(${tx.toFixed(2)}px, ${(-p * 3).toFixed(2)}px, 0px) scale(${scale.toFixed(4)})` };
    }
  }
}

export function computeIntroTimelineState(
  rawElapsedMs: number,
  beats: readonly ComicIntroBeat[] = COMIC_INTRO_BEATS
): IntroTimelineSnapshot {
  const totalDurationMs = beats.reduce(
    (maxEnd, b) => Math.max(maxEnd, b.startTimeMs + b.durationMs),
    0
  );
  const elapsedMs = clampTimelineMs(rawElapsedMs, totalDurationMs);

  let activeBeatIndex = beats.length - 1;
  for (let i = 0; i < beats.length; i += 1) {
    const b = beats[i];
    const end = b.startTimeMs + b.durationMs;
    if (elapsedMs >= b.startTimeMs && elapsedMs < end) {
      activeBeatIndex = i;
      break;
    }
  }

  const activeBeat = beats[activeBeatIndex];
  const beatElapsedMs = Math.max(0, elapsedMs - activeBeat.startTimeMs);
  const beatProgress = Math.max(0, Math.min(1, beatElapsedMs / Math.max(1, activeBeat.durationMs)));

  const activeDialogues: ActiveDialogueRenderState[] = [];
  for (const dlg of activeBeat.dialogues) {
    if (elapsedMs >= dlg.startTime && elapsedMs <= dlg.startTime + dlg.duration) {
      const dlgElapsed = elapsedMs - dlg.startTime;
      const revealWindow = Math.min(1350, dlg.duration * 0.52);
      const tw = typewriterTextAt(dlg.dialogue, dlgElapsed, revealWindow);
      activeDialogues.push({
        entry: dlg,
        visibleText: tw.text,
        progress: tw.progress,
        isComplete: tw.isComplete,
      });
    }
  }

  const narrative = activeBeat.narrativeCaption
    ? typewriterTextAt(
        activeBeat.narrativeCaption,
        beatElapsedMs,
        Math.min(1800, activeBeat.durationMs * 0.45)
      )
    : { text: '', progress: 1, isComplete: true };

  return {
    elapsedMs,
    totalDurationMs,
    overallProgress: totalDurationMs > 0 ? elapsedMs / totalDurationMs : 1,
    activeBeatIndex,
    activeBeat,
    beatElapsedMs,
    beatProgress,
    isFinished: elapsedMs >= totalDurationMs,
    activeDialogues,
    narrativeVisibleText: narrative.text,
    narrativeProgress: narrative.progress,
  };
}

export function getNextBeatStartMs(
  elapsedMs: number,
  beats: readonly ComicIntroBeat[] = COMIC_INTRO_BEATS
): number {
  const snap = computeIntroTimelineState(elapsedMs, beats);
  const nextIndex = snap.activeBeatIndex + 1;
  if (nextIndex >= beats.length) {
    return snap.totalDurationMs;
  }
  return beats[nextIndex].startTimeMs;
}

export function getPrevBeatStartMs(
  elapsedMs: number,
  beats: readonly ComicIntroBeat[] = COMIC_INTRO_BEATS
): number {
  const snap = computeIntroTimelineState(elapsedMs, beats);
  // Jika sudah berjalan > 1.2 detik di dalam beat saat ini, kembali ke awal beat ini
  if (snap.beatElapsedMs > 1200) {
    return snap.activeBeat.startTimeMs;
  }
  const prevIndex = Math.max(0, snap.activeBeatIndex - 1);
  return beats[prevIndex].startTimeMs;
}
