import React from 'react';
import { COMIC_INTRO_BEATS, ComicIntroBeat } from './comicIntroData';

export interface IntroSkipControllerProps {
  activeBeat: ComicIntroBeat;
  activeBeatIndex: number;
  totalBeats: number;
  overallProgress: number;
  isPaused: boolean;
  isMuted: boolean;
  onTogglePause: () => void;
  onPrevBeat: () => void;
  onNextBeat: () => void;
  onReplay: () => void;
  onToggleMute: () => void;
  onSkip: () => void;
  onJumpToBeat: (beatIndex: number) => void;
}

export const IntroSkipController: React.FC<IntroSkipControllerProps> = ({
  activeBeat,
  activeBeatIndex,
  totalBeats,
  overallProgress,
  isPaused,
  isMuted,
  onTogglePause,
  onPrevBeat,
  onNextBeat,
  onReplay,
  onToggleMute,
  onSkip,
  onJumpToBeat,
}) => {
  return (
    <header className="comic-intro-topbar relative z-40 flex flex-col gap-2 border-b-2 border-slate-800/90 bg-slate-950/95 px-4 py-2.5 backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Judul Babak Aktif */}
        <div className="flex items-center gap-2.5">
          <span className="rounded-lg border-2 border-amber-300/80 bg-amber-400 px-2.5 py-0.5 text-xs font-black tracking-wider uppercase text-slate-950">
            {activeBeat.sceneCode}
          </span>
          <div>
            <h1 className="text-xs font-black tracking-wide uppercase text-white sm:text-sm">
              {activeBeat.sceneTitle}
            </h1>
            <p className="text-[11px] font-medium text-slate-300">
              {activeBeat.beatLabel} · Babak {activeBeat.sceneNumber}/6 (Panel {activeBeatIndex + 1}/{totalBeats})
            </p>
          </div>
        </div>

        {/* Tombol Kontrol Interaktif Lengkap */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={onPrevBeat}
            className="cursor-pointer rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs font-bold text-slate-200 transition hover:border-sky-400 hover:text-white"
            title="Panel Sebelumnya (Panah Kiri)"
            data-testid="comic-intro-btn-prev"
          >
            ⏮ Prev
          </button>

          <button
            type="button"
            onClick={onTogglePause}
            className="cursor-pointer rounded-lg border border-amber-300/60 bg-slate-900 px-3 py-1.5 text-xs font-extrabold text-amber-200 transition hover:bg-slate-800"
            title="Jeda / Lanjutkan (Spasi)"
            data-testid="comic-intro-btn-pause"
          >
            {isPaused ? '▶ Resume' : '⏸ Pause'}
          </button>

          <button
            type="button"
            onClick={onNextBeat}
            className="cursor-pointer rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs font-bold text-slate-200 transition hover:border-sky-400 hover:text-white"
            title="Lanjut ke Panel Berikutnya (Panah Kanan)"
            data-testid="comic-intro-btn-next"
          >
            Lanjut ⏭
          </button>

          <button
            type="button"
            onClick={onReplay}
            className="cursor-pointer rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs font-bold text-slate-200 transition hover:border-sky-400 hover:text-white"
            title="Putar Ulang dari Scene 01"
            data-testid="comic-intro-btn-replay"
          >
            ↻ Replay
          </button>

          <button
            type="button"
            onClick={onToggleMute}
            className="cursor-pointer rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs font-bold text-slate-200 transition hover:border-sky-400 hover:text-white"
            title={isMuted ? 'Aktifkan Suara' : 'Bisukan Suara'}
            data-testid="comic-intro-btn-mute"
          >
            {isMuted ? '🔇 Mute' : '🔊 Suara'}
          </button>

          <button
            type="button"
            onClick={onSkip}
            className="cursor-pointer rounded-lg border-2 border-amber-400 bg-amber-400 px-3 py-1.5 text-xs font-black tracking-wide uppercase text-slate-950 shadow transition hover:bg-amber-300"
            title="Lewati Komik Pembuka (Esc)"
            data-testid="comic-intro-btn-skip"
          >
            Lewati Intro ✕
          </button>
        </div>
      </div>

      {/* Bar Progres 13 Beat Komik (Dapat Diklik untuk Berpindah Babak) */}
      <div className="flex items-center gap-1" role="tablist" aria-label="Navigasi Babak Komik Intro">
        {COMIC_INTRO_BEATS.map((beat, idx) => {
          const isCurrent = idx === activeBeatIndex;
          const isPassed = idx < activeBeatIndex;
          return (
            <button
              key={beat.id}
              type="button"
              onClick={() => onJumpToBeat(idx)}
              className={`group relative h-2 flex-1 cursor-pointer overflow-hidden rounded-full transition-all ${
                isCurrent
                  ? 'bg-amber-400 ring-1 ring-amber-200'
                  : isPassed
                    ? 'bg-sky-400/80 hover:bg-sky-300'
                    : 'bg-slate-800 hover:bg-slate-700'
              }`}
              title={`${beat.sceneCode}: ${beat.beatLabel}`}
              data-testid={`comic-intro-step-${idx}`}
            />
          );
        })}
        <span className="ml-2 text-[10px] font-bold tabular-nums text-slate-400">
          {Math.round(overallProgress * 100)}%
        </span>
      </div>
    </header>
  );
};
