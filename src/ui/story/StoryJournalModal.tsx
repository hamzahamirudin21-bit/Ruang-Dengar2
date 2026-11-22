import React from 'react';
import { signalForStudent } from '../../engine/storySignals';
import type { MissionRecord } from '../../engine/story/saveSlot';
import type { StudentAgent } from '../../types';
import { PixelPortrait } from '../characters/PixelPortrait';
import { GameButton } from '../components/game';

export interface StoryJournalModalProps {
  agents: readonly StudentAgent[];
  missions: Readonly<Record<string, MissionRecord>>;
  reducedMotion: boolean;
  canApproach: boolean;
  onApproach: (agentId: string) => void;
  onClose: () => void;
}

/**
 * Jurnal Kisah Lab (Koleksi 0/15): memicu rasa penasaran pemain untuk mengungkap
 * cerita tersembunyi di balik setiap mahasiswa di laboratorium.
 */
export const StoryJournalModal: React.FC<StoryJournalModalProps> = ({
  agents,
  missions,
  reducedMotion,
  canApproach,
  onApproach,
  onClose,
}) => {
  const unlockedCount = agents.filter((a) => missions[a.id]?.status === 'selesai').length;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="journal-modal-title"
      data-testid="story-journal-modal"
      className="fixed inset-0 z-[72] flex items-center justify-center bg-[#091224]/72 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="game-panel-cream flex max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden !rounded-[8px_24px_8px_24px] border-[3px] border-[#0f1b33] shadow-[0_10px_0_#091122]"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#0f1b33] bg-[#14233f] px-5 py-3.5 text-[#fff8e6]">
          <div>
            <p className="font-['Outfit'] text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#fde08d]">
              Koleksi Cerita Mahasiswa
            </p>
            <h2 id="journal-modal-title" className="font-['Outfit'] text-xl font-black">
              Jurnal Kisah Lab ({unlockedCount}/{agents.length} Terungkap)
            </h2>
          </div>
          <GameButton variant="sekunder" size="sm" onClick={onClose}>
            Tutup
          </GameButton>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent, idx) => {
              const status = missions[agent.id]?.status ?? 'belum';
              const unlocked = status === 'selesai';
              const sig = signalForStudent(agent.id);
              const tag = `#${String(idx + 1).padStart(2, '0')}`;
              const energyPct = Math.round(agent.energy * 100);

              return (
                <article
                  key={agent.id}
                  className={`flex flex-col justify-between gap-2.5 rounded-[5px_16px_5px_16px] border-2 p-3 transition ${
                    unlocked
                      ? 'border-[#e5ac3f] bg-[#fffdf7] shadow-[0_4px_0_rgba(15,27,51,0.22)]'
                      : 'border-[#0f1b33]/25 bg-[#f4eee0]/85'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`relative shrink-0 overflow-hidden rounded-[4px_12px_4px_12px] border-2 border-[#0f1b33] bg-gradient-to-b from-[#cbe2f6] via-[#e7f1fa] to-[#f4e7d2] ${
                        unlocked ? '' : 'grayscale-[55%] opacity-85'
                      }`}
                      style={{ lineHeight: 0 }}
                    >
                      <span className="dossier-index-tag absolute left-0 top-0 z-10">{tag}</span>
                      <PixelPortrait
                        studentId={agent.id}
                        name={agent.name}
                        expression={unlocked ? 'tersenyum' : 'netral'}
                        scale={1}
                        reducedMotion={reducedMotion}
                        demographicLabel={agent.demographicLabel}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span
                        className={`inline-block rounded-[3px_7px_3px_7px] px-1.5 py-0.5 font-['Outfit'] text-[10px] font-extrabold uppercase tracking-wider ${
                          unlocked
                            ? 'bg-[#e5ac3f] text-[#0f1b33]'
                            : status === 'lanjutan'
                              ? 'bg-[#9f2744] text-white'
                              : 'bg-[#0f1b33]/12 text-[#334155]'
                        }`}
                      >
                        {unlocked
                          ? '✦ Terungkap'
                          : status === 'lanjutan'
                            ? 'Belum Selesai'
                            : 'Terkunci'}
                      </span>
                      <h3 className="mt-1 truncate font-['Outfit'] text-sm font-black text-[#0f1b33]">
                        {agent.name}
                      </h3>
                      <p className="text-[11px] font-semibold text-[#475569]">
                        Energi saat ini: {energyPct}%
                      </p>
                    </div>
                  </div>

                  {unlocked ? (
                    <div className="rounded-[4px_10px_4px_10px] border border-[#e5ac3f]/50 bg-[#fff8e6] p-2.5 text-xs">
                      <p className="font-['Outfit'] font-extrabold text-[#14233f]">
                        “{sig.unlockedTitle}”
                      </p>
                      <p className="mt-1 leading-relaxed text-[#334155]">{sig.unlockedExcerpt}</p>
                    </div>
                  ) : (
                    <div className="space-y-2 text-xs">
                      <p className="italic leading-relaxed text-[#475569]">
                        Sinyal teramati: “{sig.clue}”
                      </p>
                      <GameButton
                        variant="primer"
                        size="sm"
                        disabled={!canApproach}
                        onClick={() => {
                          onClose();
                          onApproach(agent.id);
                        }}
                        className="w-full"
                      >
                        Hampiri {agent.name.split(' ')[0]} →
                      </GameButton>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryJournalModal;
