import React, { useMemo, useState } from 'react';
import { signalForStudent } from '../../engine/storySignals';
import type { MissionRecord } from '../../engine/story/saveSlot';
import type { StudentAgent } from '../../types';
import { PixelPortrait } from '../characters/PixelPortrait';
import { GameButton } from '../components/game';
import { playSfx } from '../motion/sfx';

export interface StoryJournalModalProps {
  agents: readonly StudentAgent[];
  missions: Readonly<Record<string, MissionRecord>>;
  reducedMotion: boolean;
  canApproach: boolean;
  onApproach: (agentId: string) => void;
  onClose: () => void;
}

type JournalFilter = 'semua' | 'terungkap' | 'belum';

/**
 * Jurnal Koleksi Kisah Lab (0/18): bergaya buku koleksi interaktif dengan
 * bilah progres, tonggak capaian, dan filter cepat.
 */
export const StoryJournalModal: React.FC<StoryJournalModalProps> = ({
  agents,
  missions,
  reducedMotion,
  canApproach,
  onApproach,
  onClose,
}) => {
  const [filter, setFilter] = useState<JournalFilter>('semua');
  const unlockedCount = agents.filter((a) => missions[a.id]?.status === 'selesai').length;
  const totalCount = Math.max(1, agents.length);
  const pct = Math.round((unlockedCount / totalCount) * 100);

  const visibleEntries = useMemo(() => {
    return agents
      .map((agent, idx) => ({ agent, idx }))
      .filter(({ agent }) => {
        const unlocked = missions[agent.id]?.status === 'selesai';
        if (filter === 'terungkap') return unlocked;
        if (filter === 'belum') return !unlocked;
        return true;
      });
  }, [agents, missions, filter]);

  const milestones = [
    { target: 3, label: '3 · Shift Pagi' },
    { target: 9, label: '9 · Sahabat Kampus' },
    { target: agents.length, label: `${agents.length} · Penjaga Cahaya` },
  ];

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
        className="game-panel-cream responsive-modal-panel responsive-modal-panel--89 fx-panel-in flex max-h-[89vh] w-full max-w-4xl flex-col overflow-hidden !rounded-[28px] border-[3.5px] border-[#3e2517] shadow-[0_10px_0_#3e2517,0_24px_50px_rgba(38,20,10,0.45)]"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="border-b-[3px] border-[#3e2517] bg-gradient-to-r from-[#2e8274] via-[#267366] to-[#1e5f54] px-6 py-4 text-[#fffdf6]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-['Fredoka'] text-xs font-semibold uppercase tracking-wider text-[#ffe8a3]">
                Koleksi Cerita Mahasiswa Kampus Vokasi
              </p>
              <h2 id="journal-modal-title" className="font-['Fredoka'] text-2xl font-bold drop-shadow-[0_2px_0_#3e2517]">
                Jurnal Kisah Lab ({unlockedCount}/{agents.length} Terungkap)
              </h2>
            </div>
            <GameButton variant="sekunder" size="sm" onClick={onClose}>
              Tutup
            </GameButton>
          </div>

          {/* Bilah Progres Koleksi + 3 Tonggak Capaian */}
          <div className="mt-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-bold">
              <div className="flex flex-wrap items-center gap-1.5">
                {milestones.map((m) => {
                  const hit = unlockedCount >= m.target;
                  return (
                    <span
                      key={m.target}
                      className={`rounded-full border border-[#3e2517] px-2.5 py-0.5 font-['Fredoka'] text-[10px] ${
                        hit
                          ? 'bg-[#ffe694] text-[#3e2517]'
                          : 'bg-[#17463e]/70 text-[#d8f3eb]'
                      }`}
                    >
                      {hit ? '✓ ' : '○ '}
                      {m.label}
                    </span>
                  );
                })}
              </div>
              <span className="font-['Fredoka'] text-[#ffe8a3]">{pct}% Tuntas</span>
            </div>
            <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full border-2 border-[#3e2517] bg-[#143d36]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#f4b637] to-[#ffe694] transition-all duration-300"
                style={{ width: `${Math.max(unlockedCount > 0 ? 4 : 0, pct)}%` }}
              />
            </div>
          </div>
        </header>

        {/* Bilah Filter Cepat */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#3e2517]/20 bg-[#f7ebd2] px-5 py-2.5">
          <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Saring koleksi kisah">
            {(
              [
                { id: 'semua', label: `Semua (${agents.length})` },
                { id: 'terungkap', label: `✦ Terungkap (${unlockedCount})` },
                { id: 'belum', label: `🔒 Belum (${agents.length - unlockedCount})` },
              ] as const
            ).map((opt) => {
              const active = filter === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    playSfx('klik');
                    setFilter(opt.id);
                  }}
                  className={`cursor-pointer rounded-full border-2 border-[#3e2517] px-3 py-1 font-['Fredoka'] text-xs font-bold transition ${
                    active
                      ? 'bg-gradient-to-b from-[#ffe694] to-[#f2b53b] text-[#3e2517] shadow-[0_2.5px_0_#3e2517]'
                      : 'bg-[#fffdf6] text-[#5c3d26] hover:bg-[#fff3d6]'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
          <span className="text-[11px] font-semibold text-[#6b482e]">
            ⭐ Setiap kisah terungkap berhadiah +2 Bintang Empati
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {visibleEntries.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-[#3e2517]/30 bg-[#fffaf0] p-8 text-center text-xs text-[#6b482e]">
              <p className="font-['Fredoka'] text-sm font-bold text-[#3e2517]">
                {filter === 'terungkap'
                  ? 'Belum ada kisah yang terungkap.'
                  : 'Seluruh kisah mahasiswa sudah berhasil terungkap!'}
              </p>
              <p className="mt-1">
                {filter === 'terungkap'
                  ? 'Hampiri mahasiswa di peta kampus untuk mulai mendengarkan cerita mereka.'
                  : 'Luar biasa — kamu telah membuka seluruh koleksi Jurnal Kisah Lab!'}
              </p>
            </div>
          ) : (
            <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
              {visibleEntries.map(({ agent, idx }) => {
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
                        className={`relative h-[72px] w-[58px] shrink-0 overflow-hidden rounded-2xl border-[2.5px] border-[#3e2517] bg-gradient-to-b from-[#d8ecfa] via-[#f0f5e8] to-[#f8e6c8] ${
                          unlocked ? '' : 'grayscale-[55%] opacity-85'
                        }`}
                        style={{ lineHeight: 0 }}
                      >
                        <span className="dossier-index-tag absolute left-0 top-0 z-10">{tag}</span>
                        <div className="h-full w-full [&>canvas]:!h-full [&>canvas]:!w-full [&>canvas]:object-contain [&>canvas]:object-bottom [&>img]:!h-full [&>img]:!w-full">
                          <PixelPortrait
                            studentId={agent.id}
                            name={agent.name}
                            expression={unlocked ? 'tersenyum' : 'netral'}
                            scale={1}
                            reducedMotion={reducedMotion}
                            demographicLabel={agent.demographicLabel}
                          />
                        </div>
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
          )}
        </div>
      </div>
    </div>
  );
};

export default StoryJournalModal;
