import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { COMIC_INTRO_BEATS, COMIC_INTRO_TOTAL_DURATION_MS } from './comicIntroData';
import {
  clampTimelineMs,
  computeIntroTimelineState,
  getNextBeatStartMs,
  getPrevBeatStartMs,
} from './IntroTimeline';
import { IntroAudioManager } from './IntroAudioManager';
import { IntroSkipController } from './IntroSkipController';
import { ComicSceneManager } from './ComicSceneManager';

export interface ComicIntroControllerProps {
  reducedMotion?: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export const ComicIntroController: React.FC<ComicIntroControllerProps> = ({
  reducedMotion = false,
  onComplete,
  onSkip,
}) => {
  const [elapsedMs, setElapsedMs] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const audioManagerRef = useRef<IntroAudioManager>(new IntroAudioManager());
  const [isMuted, setIsMuted] = useState<boolean>(() => audioManagerRef.current.isMuted());

  const snapshot = useMemo(() => computeIntroTimelineState(elapsedMs), [elapsedMs]);

  // Sinkronisasi pemicu SFX setiap kali elapsedMs bertambah
  useEffect(() => {
    audioManagerRef.current.syncAt(elapsedMs);
  }, [elapsedMs]);

  // Loop animasi berbasis requestAnimationFrame yang mulus
  useEffect(() => {
    if (isPaused || snapshot.isFinished) return undefined;
    let rafId = 0;
    let lastTs = performance.now();

    const step = (now: number) => {
      const dt = Math.min(120, Math.max(0, now - lastTs));
      lastTs = now;
      setElapsedMs((prev) => {
        const next = clampTimelineMs(prev + dt, COMIC_INTRO_TOTAL_DURATION_MS);
        return next;
      });
      rafId = window.requestAnimationFrame(step);
    };

    rafId = window.requestAnimationFrame(step);
    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, [isPaused, snapshot.isFinished]);

  const handleTogglePause = useCallback(() => {
    setIsPaused((prev) => !prev);
  }, []);

  const handleNextBeat = useCallback(() => {
    setElapsedMs((prev) => {
      const nextMs = getNextBeatStartMs(prev);
      return nextMs;
    });
  }, []);

  const handlePrevBeat = useCallback(() => {
    setElapsedMs((prev) => getPrevBeatStartMs(prev));
  }, []);

  const handleReplay = useCallback(() => {
    audioManagerRef.current.reset();
    setElapsedMs(0);
    setIsPaused(false);
  }, []);

  const handleToggleMute = useCallback(() => {
    const nextMuted = !audioManagerRef.current.isMuted();
    audioManagerRef.current.setMuted(nextMuted);
    setIsMuted(nextMuted);
  }, []);

  const handleJumpToBeat = useCallback((beatIndex: number) => {
    const targetBeat = COMIC_INTRO_BEATS[beatIndex];
    if (!targetBeat) return;
    setElapsedMs(targetBeat.startTimeMs);
  }, []);

  // Pintasan keyboard (Space = Pause/Resume, Panah Kanan = Next Beat, Panah Kiri = Prev Beat, Escape = Skip)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onSkip();
      } else if (e.key === ' ') {
        e.preventDefault();
        handleTogglePause();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNextBeat();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevBeat();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleNextBeat, handlePrevBeat, handleTogglePause, onSkip]);

  return (
    <div
      className="comic-intro-overlay fixed inset-0 z-50 flex flex-col bg-slate-950 text-white select-none"
      role="dialog"
      aria-modal="true"
      aria-label="Pembuka Komik Animasi Sinematik Ruang Dengar"
      data-testid="comic-intro-overlay"
    >
      <IntroSkipController
        activeBeat={snapshot.activeBeat}
        activeBeatIndex={snapshot.activeBeatIndex}
        totalBeats={COMIC_INTRO_BEATS.length}
        overallProgress={snapshot.overallProgress}
        isPaused={isPaused}
        isMuted={isMuted}
        onTogglePause={handleTogglePause}
        onPrevBeat={handlePrevBeat}
        onNextBeat={handleNextBeat}
        onReplay={handleReplay}
        onToggleMute={handleToggleMute}
        onSkip={onSkip}
        onJumpToBeat={handleJumpToBeat}
      />

      <ComicSceneManager
        snapshot={snapshot}
        reducedMotion={reducedMotion}
        onStartSimulation={onComplete}
        onReplayIntro={handleReplay}
        onSkipIntro={onSkip}
      />

      {/* Footer Petunjuk Pintasan & Status */}
      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/80 bg-slate-950/95 px-4 py-2 text-[11px] text-slate-400">
        <div className="flex items-center gap-3">
          <span>
            Pintasan: <strong className="text-slate-200">Spasi</strong> Jeda ·{' '}
            <strong className="text-slate-200">← / →</strong> Geser Panel ·{' '}
            <strong className="text-slate-200">Esc</strong> Lewati
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-amber-300/90">
            18 Mahasiswa Terhubung dengan Database Resmi
          </span>
          {!snapshot.isFinished && (
            <button
              type="button"
              onClick={onComplete}
              className="cursor-pointer rounded-md border border-emerald-400/60 bg-emerald-950/80 px-2.5 py-0.5 text-[11px] font-bold text-emerald-200 transition hover:bg-emerald-900"
              data-testid="comic-intro-footer-continue"
            >
              Langsung Mulai Simulasi →
            </button>
          )}
        </div>
      </footer>
    </div>
  );
};
