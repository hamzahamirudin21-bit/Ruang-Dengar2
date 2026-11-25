import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  COMIC_STORY_PAGES,
  COMIC_STORY_TOTAL_DURATION_MS,
  clampStoryTimeMs,
  computeStoryTimelineState,
  getNextPageStartMs,
  getPrevPageStartMs,
} from './StoryTimeline';
import { AudioController } from './AudioController';
import { ComicPageRenderer } from './ComicPageRenderer';

export interface ComicIntroControllerProps {
  reducedMotion?: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

function readInitialPageTimeFromUrl(): number {
  try {
    if (typeof window === 'undefined') return 0;
    const params = new URLSearchParams(window.location.search);
    const pageNum = Number(params.get('introPage'));
    if (pageNum >= 1 && pageNum <= COMIC_STORY_PAGES.length) {
      const target = COMIC_STORY_PAGES[pageNum - 1];
      return target ? target.startTimeMs + 2600 : 0;
    }
    return 0;
  } catch {
    return 0;
  }
}

export const ComicIntroController: React.FC<ComicIntroControllerProps> = ({
  reducedMotion = false,
  onComplete,
  onSkip,
}) => {
  const [elapsedMs, setElapsedMs] = useState<number>(() => readInitialPageTimeFromUrl());
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const audioRef = useRef<AudioController>(new AudioController());
  const [isMuted, setIsMuted] = useState<boolean>(() => audioRef.current.isMuted());

  const timeline = useMemo(() => computeStoryTimelineState(elapsedMs), [elapsedMs]);

  useEffect(() => {
    audioRef.current.syncAt(elapsedMs);
  }, [elapsedMs]);

  useEffect(() => {
    if (isPaused || timeline.isFinished) return undefined;
    let rafId = 0;
    let lastTs = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(100, Math.max(0, now - lastTs));
      lastTs = now;
      setElapsedMs((prev) => clampStoryTimeMs(prev + dt, COMIC_STORY_TOTAL_DURATION_MS));
      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, [isPaused, timeline.isFinished]);

  const handleTogglePause = useCallback(() => {
    setIsPaused((prev) => !prev);
  }, []);

  const handleNextPage = useCallback(() => {
    setElapsedMs((prev) => getNextPageStartMs(prev));
  }, []);

  const handlePrevPage = useCallback(() => {
    setElapsedMs((prev) => getPrevPageStartMs(prev));
  }, []);

  const handleReplay = useCallback(() => {
    audioRef.current.reset();
    setElapsedMs(0);
    setIsPaused(false);
  }, []);

  const handleToggleMute = useCallback(() => {
    const nextMuted = !audioRef.current.isMuted();
    audioRef.current.setMuted(nextMuted);
    setIsMuted(nextMuted);
  }, []);

  const handleJumpToPage = useCallback((pageIdx: number) => {
    const page = COMIC_STORY_PAGES[pageIdx];
    if (!page) return;
    setElapsedMs(page.startTimeMs);
  }, []);

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
        handleNextPage();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevPage();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleNextPage, handlePrevPage, handleTogglePause, onSkip]);

  return (
    <div
      className="comic-intro-fullscreen fixed inset-0 z-50 flex flex-col overflow-hidden select-none"
      style={{
        background:
          'radial-gradient(circle at 50% 50%, #1e293b 0%, #0f172a 75%, #020617 100%)',
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Komik Animasi Pembuka Ruang Dengar"
      data-testid="comic-intro-overlay"
    >
      {/* Garis Progres Tipis di Tepi Paling Atas Layar (Tanpa Header Besar!) */}
      <div className="relative z-40 h-1.5 w-full bg-slate-900">
        <div
          className="h-full bg-gradient-to-r from-amber-400 via-sky-400 to-emerald-400 transition-all duration-100"
          style={{ width: `${Math.round(timeline.overallProgress01 * 100)}%` }}
        />
      </div>

      {/* Kontrol Melayang Minimalis di Sudut Kanan Atas (Tidak Menguasai Layar) */}
      <nav
        aria-label="Kontrol Cerita Komik"
        className="fixed top-3 right-4 z-40 flex items-center gap-1 rounded-full border-2 border-slate-950 bg-slate-950/88 px-2.5 py-1 text-white shadow-[3px_3px_0_#020617] backdrop-blur-md"
      >
        {/* Indikator 6 Halaman */}
        <div className="mr-1.5 flex items-center gap-1">
          {COMIC_STORY_PAGES.map((p, idx) => (
            <button
              key={p.id}
              type="button"
              onClick={() => handleJumpToPage(idx)}
              className={`h-2.5 w-2.5 cursor-pointer rounded-full border border-slate-950 transition ${
                idx === timeline.activePageIndex
                  ? 'scale-125 bg-amber-400'
                  : idx < timeline.activePageIndex
                    ? 'bg-sky-400'
                    : 'bg-slate-700 hover:bg-slate-500'
              }`}
              title={`Halaman ${p.pageNumber}: ${p.title}`}
              data-testid={`comic-page-dot-${p.pageNumber}`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={handlePrevPage}
          className="cursor-pointer rounded-full px-2 py-0.5 text-[11px] font-bold text-slate-200 hover:bg-slate-800 hover:text-white"
          title="Halaman Sebelumnya (←)"
          data-testid="comic-intro-btn-prev"
        >
          ⏮
        </button>
        <button
          type="button"
          onClick={handleTogglePause}
          className="cursor-pointer rounded-full bg-amber-400/20 px-2.5 py-0.5 text-[11px] font-black text-amber-300 hover:bg-amber-400/30"
          title="Pause / Resume (Spasi)"
          data-testid="comic-intro-btn-pause"
        >
          {isPaused ? '▶ Resume' : '⏸ Pause'}
        </button>
        <button
          type="button"
          onClick={handleNextPage}
          className="cursor-pointer rounded-full px-2 py-0.5 text-[11px] font-bold text-slate-200 hover:bg-slate-800 hover:text-white"
          title="Halaman Berikutnya (→)"
          data-testid="comic-intro-btn-next"
        >
          ⏭
        </button>
        <button
          type="button"
          onClick={handleReplay}
          className="cursor-pointer rounded-full px-2 py-0.5 text-[11px] font-bold text-slate-200 hover:bg-slate-800 hover:text-white"
          title="Ulangi Cerita"
          data-testid="comic-intro-btn-replay"
        >
          ↻
        </button>
        <button
          type="button"
          onClick={handleToggleMute}
          className="cursor-pointer rounded-full px-2 py-0.5 text-[11px] font-bold text-slate-200 hover:bg-slate-800 hover:text-white"
          title={isMuted ? 'Nyalakan Suara' : 'Bisukan Suara'}
          data-testid="comic-intro-btn-mute"
        >
          {isMuted ? '🔇' : '🔊'}
        </button>
        <button
          type="button"
          onClick={onSkip}
          className="ml-1 cursor-pointer rounded-full border border-slate-950 bg-amber-400 px-2.5 py-0.5 text-[11px] font-black uppercase text-slate-950 hover:bg-amber-300"
          title="Lewati Intro (Esc)"
          data-testid="comic-intro-btn-skip"
        >
          Skip ✕
        </button>
      </nav>

      {/* Panggung Halaman Buku Komik (Mengisi ~90% Layar) */}
      <ComicPageRenderer
        timeline={timeline}
        reducedMotion={reducedMotion}
        onStartSimulation={onComplete}
        onReplayStory={handleReplay}
        onSkipIntro={onSkip}
      />
    </div>
  );
};
