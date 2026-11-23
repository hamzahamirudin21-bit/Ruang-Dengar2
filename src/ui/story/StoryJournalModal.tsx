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
      className="fixed inset-0 z-[72] flex items-center justify-center bg-[#2c1a0e]/65 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="game-panel-cream flex max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden !rounded-[28px] border-[3.5px] border-[#3e2517] shadow-[0_10px_0_#3e2517,0_24px_50px_rgba(38,20,10,0.45)]"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex flex-wrap items-center justify-between gap-3 border-b-[3px] border-[#3e2517] bg-gradient-to-r from-[#2e8274] via-[#267366] to-[#1e5f54] px-6 py-4 text-[#fffdf6]">
          <div>
            <p className="font-['Fredoka'] text-xs font-semibold uppercase tracking-wider text-[#ffe8a3]">
              Koleksi Cerita Mahasiswa
            </p>
            <h2 id="journal-modal-title" className="font-['Fredoka'] text-2xl font-bold drop-shadow-[0_2px_0_#3e2517]">
              Jurnal Kisah Lab ({unlockedCount}/{agents.length} Terungkap)
            </h2>
          </div>
          <GameButton variant="sekunder" size="sm" onClick={onClose}>
            Tutup
          </GameButton>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent, idx) => {
              const status = missions[agent.id]?.status ?? 'belum';
              const unlocked = status === 'selesai';
              const sig = signalForStudent(agent.id);
              const tag = `#${String(idx + 1).padStart(2, '0')}`;
              const energyPct = Math.round(agent.energy * 100);

              return (
                <article
                  key={agent.id}
                  className={`flex flex-col justify-between gap-2.5 rounded-[22px] border-[2.5px] p-3.5 transition ${
                    unlocked
                      ? 'border-[#3e2517] bg-[#fffdf7] shadow-[0_5px_0_#3e2517]'
                      : 'border-[#3e2517]/55 bg-[#f9efda]'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`relative shrink-0 overflow-hidden rounded-2xl border-[2.5px] border-[#3e2517] bg-gradient-to-b from-[#d8ecfa] via-[#f0f5e8] to-[#f8e6c8] ${
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
                        className={`inline-block rounded-full border border-[#3e2517] px-2 py-0.5 font-['Fredoka'] text-[10px] font-bold uppercase tracking-wider ${
                          unlocked
                            ? 'bg-[#ffe494] text-[#3e2517]'
                            : status === 'lanjutan'
                              ? 'bg-[#d8534a] text-[#fffdf6]'
                              : 'bg-[#f1dfc0] text-[#5e3d24]'
                        }`}
                      >
                        {unlocked
                          ? '✦ Terungkap'
                          : status === 'lanjutan'
                            ? 'Belum Selesai'
                            : 'Terkunci'}
                      </span>
                      <h3 className="mt-1 truncate font-['Fredoka'] text-sm font-bold text-[#3e2517]">
                        {agent.name}
                      </h3>
                      <p className="text-[11px] font-semibold text-[#6b482e]">
                        Energi saat ini: {energyPct}%
                      </p>
                    </div>
                  </div>

                  {unlocked ? (
                    <div className="rounded-2xl border-2 border-[#3e2517]/20 bg-[#fff5d8] p-2.5 text-xs">
                      <p className="font-['Fredoka'] font-bold text-[#3e2517]">
                        “{sig.unlockedTitle}”
                      </p>
                      <p className="mt-1 leading-relaxed text-[#5c3d26]">{sig.unlockedExcerpt}</p>
                    </div>
                  ) : (
                    <div className="space-y-2 text-xs">
                      <p className="italic leading-relaxed text-[#6b482e]">
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
