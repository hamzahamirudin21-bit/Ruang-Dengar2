import React from 'react';
import { IntroTimelineSnapshot } from './IntroTimeline';
import { ComicPanel } from './ComicPanel';
import { NarrativeText } from './NarrativeText';

export interface ComicSceneManagerProps {
  snapshot: IntroTimelineSnapshot;
  reducedMotion?: boolean;
  onStartSimulation: () => void;
  onReplayIntro: () => void;
  onSkipIntro: () => void;
}

export const ComicSceneManager: React.FC<ComicSceneManagerProps> = ({
  snapshot,
  reducedMotion = false,
  onStartSimulation,
  onReplayIntro,
  onSkipIntro,
}) => {
  const { activeBeat, beatElapsedMs, beatProgress, activeDialogues, narrativeVisibleText } =
    snapshot;

  return (
    <main
      className="comic-intro-stage relative flex flex-1 flex-col justify-center overflow-y-auto px-3 py-2 sm:px-6"
      data-scene-number={activeBeat.sceneNumber}
      data-beat-id={activeBeat.id}
    >
      {/* Narasi Atas bila disetel di posisi top */}
      {activeBeat.narrativeCaption && activeBeat.narrativePosition === 'top' && (
        <NarrativeText
          sceneCode={activeBeat.sceneCode}
          text={narrativeVisibleText}
          position="top"
        />
      )}

      {/* Grid Panel Komik Dinamis */}
      <div className="mx-auto grid w-full max-w-6xl grid-cols-12 gap-3 sm:gap-4">
        {activeBeat.panels.map((panel) => (
          <ComicPanel
            key={panel.id}
            panel={panel}
            beatElapsedMs={beatElapsedMs}
            beatProgress={beatProgress}
            activeDialogues={activeDialogues}
            reducedMotion={reducedMotion}
            onStartSimulation={onStartSimulation}
            onReplayIntro={onReplayIntro}
            onSkipIntro={onSkipIntro}
          />
        ))}
      </div>

      {/* Narasi Bawah bila disetel di posisi bottom */}
      {activeBeat.narrativeCaption &&
        (activeBeat.narrativePosition ?? 'bottom') === 'bottom' && (
          <NarrativeText
            sceneCode={activeBeat.sceneCode}
            text={narrativeVisibleText}
            position="bottom"
          />
        )}
    </main>
  );
};
