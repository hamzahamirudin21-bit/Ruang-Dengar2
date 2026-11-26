import React from 'react';
import { StoryTimelineState } from './StoryTimeline';
import { ComicPanelRenderer } from './ComicPanelRenderer';

export interface ComicPageRendererProps {
  timeline: StoryTimelineState;
  reducedMotion?: boolean;
  onStartSimulation: () => void;
  onReplayStory: () => void;
  onSkipIntro: () => void;
}

/**
 * Merender satu halaman buku komik penuh (mengisi ~90% viewport) dengan
 * variasi ukuran panel asimetris (splash, wide, close-up, vertical) dan gutter komik.
 */
export const ComicPageRenderer: React.FC<ComicPageRendererProps> = ({
  timeline,
  reducedMotion = false,
  onStartSimulation,
  onReplayStory,
  onSkipIntro,
}) => {
  const { activePage, pageElapsedMs } = timeline;

  return (
    <div
      className="comic-page-viewport relative flex h-full w-full items-center justify-center px-2 pt-3 pb-2 sm:px-4 sm:pt-4 sm:pb-3"
      data-page-number={activePage.pageNumber}
      data-page-id={activePage.id}
    >
      {/* Lembar Halaman Buku Komik (Mengisi ~90% Layar dengan Border & Gutter Komik Asli) */}
      <div className="comic-page-sheet responsive-comic-sheet relative flex h-[90vh] w-[96vw] max-w-[1680px] flex-col rounded-xl border-[4px] border-slate-950 bg-[#f8f4e8] p-2 shadow-[0_18px_50px_rgba(0,0,0,0.85)] sm:p-3">
        {/* Label Kecil Nomor Halaman Buku Komik di Sudut Kiri Atas Lembar */}
        <div className="pointer-events-none absolute -top-3 left-4 z-30 flex items-center gap-2">
          <span className="border-2 border-slate-950 bg-amber-400 px-2.5 py-0.5 font-['Fredoka',sans-serif] text-[11px] font-black tracking-wider uppercase text-slate-950 shadow-[2px_2px_0_#020617]">
            {activePage.code} · {activePage.title}
          </span>
        </div>

        {/* Grid Panel Komik Asimetris (Gutter Konsisten, Tanpa Ruang Hitam Kosong) */}
        <div
          className={`grid h-full w-full gap-2 sm:gap-2.5 ${activePage.pageGridClass}`}
          data-testid={`comic-page-grid-${activePage.pageNumber}`}
        >
          {activePage.panels.map((panel) => (
            <ComicPanelRenderer
              key={panel.id}
              panel={panel}
              pageElapsedMs={pageElapsedMs}
              pageDurationMs={activePage.durationMs}
              reducedMotion={reducedMotion}
              onStartSimulation={onStartSimulation}
              onReplayStory={onReplayStory}
              onSkipIntro={onSkipIntro}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
