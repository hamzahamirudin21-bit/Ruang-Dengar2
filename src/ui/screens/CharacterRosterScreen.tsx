import React, { useEffect, useMemo, useRef, useState } from 'react';
import { STUDENT_BLUEPRINTS } from '../../data/agents.seed';
import { STRINGS } from '../../data/strings';
import { buildRosterModel } from '../characters/rosterModel';
import { IconSettings } from '../components/Icons';
import { playSfx } from '../motion/sfx';
import { RosterCard } from './RosterCard';
import { computeRosterLayout } from './rosterLayout';

export interface CharacterRosterScreenProps {
  reducedMotion: boolean;
  audioEnabled?: boolean;
  onToggleAudio?: () => void;
  onContinue: () => void;
  onBack: () => void;
  onOpenSettings: () => void;
}

type RosterFilterKey = 'semua' | 'elektronika' | 'pemrograman' | 'las' | 'cetak3d';

const ROSTER_FILTERS: readonly { key: RosterFilterKey; label: string; icon: string }[] = [
  { key: 'semua', label: 'Semua', icon: '✦' },
  { key: 'pemrograman', label: 'Koding', icon: '💻' },
  { key: 'elektronika', label: 'Elektronika', icon: '🔌' },
  { key: 'las', label: 'Las', icon: '🔥' },
  { key: 'cetak3d', label: 'Cetak 3D', icon: '🖨️' },
];

export const CharacterRosterScreen: React.FC<CharacterRosterScreenProps> = ({
  reducedMotion,
  audioEnabled = false,
  onToggleAudio,
  onContinue,
  onBack,
  onOpenSettings,
}) => {
  const models = useMemo(() => buildRosterModel(STUDENT_BLUEPRINTS), []);
  const [filterKey, setFilterKey] = useState<RosterFilterKey>('semua');
  const [flippedIds, setFlippedIds] = useState<ReadonlySet<string>>(() => new Set());

  const visibleModels = useMemo(() => {
    if (filterKey === 'semua') return models;
    const matchIcon =
      filterKey === 'pemrograman'
        ? 'kode'
        : filterKey === 'elektronika'
          ? 'chip'
          : filterKey === 'las'
            ? 'api-las'
            : 'printer3d';
    return models.filter((m) => m.interests.some((it) => it.iconId === matchIcon));
  }, [models, filterKey]);

  const allFlipped =
    visibleModels.length > 0 && visibleModels.every((m) => flippedIds.has(m.studentId));
  const toggleFlipCard = (studentId: string) => {
    setFlippedIds((prev) => {
      const next = new Set(prev);
      if (next.has(studentId)) next.delete(studentId);
      else next.add(studentId);
      return next;
    });
  };
  const toggleFlipAll = () => {
    playSfx('klik');
    setFlippedIds((prev) =>
      allFlipped ? new Set() : new Set([...prev, ...visibleModels.map((m) => m.studentId)]),
    );
  };
  const rootRef = useRef<HTMLElement | null>(null);
  const [viewport, setViewport] = useState(() => ({
    width: typeof window === 'undefined' ? 1366 : window.innerWidth,
    height: typeof window === 'undefined' ? 768 : window.innerHeight,
  }));

  useEffect(() => {
    const el = rootRef.current;
    const measure = () => {
      const w = el?.clientWidth || window.innerWidth;
      const h = el?.clientHeight || window.innerHeight;
      setViewport((v) => (v.width === w && v.height === h ? v : { width: w, height: h }));
    };
    measure();
    if (typeof ResizeObserver !== 'undefined' && el) {
      const ro = new ResizeObserver(measure);
      ro.observe(el);
      return () => ro.disconnect();
    }
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  // Selalu gunakan kapasitas total (18) untuk dimensi kartu agar grid stabil & tetap muat 1 layar saat Semua aktif
  const layout = useMemo(
    () => computeRosterLayout(viewport, models.length),
    [viewport, models.length],
  );

  useEffect(() => {
    rootRef.current?.querySelector<HTMLButtonElement>('[data-continue="true"]')?.focus();
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onBack();
        return;
      }
      if (e.key === 'Enter') {
        const t = e.target as HTMLElement | null;
        if (t && (t.tagName === 'BUTTON' || t.tagName === 'A' || t.tagName === 'INPUT')) return;
        e.preventDefault();
        onContinue();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onBack, onContinue]);

  const transition = reducedMotion ? '' : 'transition-colors';

  return (
    <main
      ref={rootRef}
      className={`yearbook-pinboard flex h-screen flex-col px-5 py-3 ${layout.fitsOneScreen ? 'overflow-hidden' : 'overflow-y-auto'}`}
    >
      <div className="mx-auto flex min-h-0 w-full max-w-[92rem] flex-1 flex-col">
        <header className="game-panel-wood game-nails mb-3 flex shrink-0 flex-wrap items-center justify-between gap-2.5 px-4 py-2 text-[#fffdf6]">
          <div className="flex min-w-0 items-center gap-3">
            <span className="title-wave-bars" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
            </span>
            <h1 className="font-['Fredoka',sans-serif] text-lg font-bold tracking-wide text-[#ffe694] md:text-xl">
              {STRINGS.roster.title}
            </h1>
            <span aria-hidden="true" className="hidden h-4 w-0.5 bg-[#ffe694]/45 lg:block" />
            <p className="hidden truncate text-xs font-medium text-[#fff3dc] lg:block">
              Buku Tahunan {models.length} Mahasiswa — klik kartu untuk membalik &amp; kenali latar belakangnya!
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={toggleFlipAll}
              className={`game-btn-secondary !min-h-[2rem] !px-3 !py-1 text-xs ${transition}`}
            >
              <span>{allFlipped ? '↺ Foto Semua' : '↻ Balik Semua'}</span>
            </button>
            {onToggleAudio && (
              <button
                type="button"
                onClick={onToggleAudio}
                aria-pressed={audioEnabled}
                aria-label={audioEnabled ? 'Matikan musik & suara' : 'Nyalakan musik & suara'}
                title={audioEnabled ? 'Musik & Suara Aktif' : 'Nyalakan Musik & Suara'}
                className={`game-btn-secondary !min-h-[2rem] !px-2.5 !py-1 text-xs ${transition}`}
              >
                <span aria-hidden="true">{audioEnabled ? '🔊' : '🔇'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={onOpenSettings}
              className={`game-btn-secondary !min-h-[2rem] !px-3 !py-1 text-xs ${transition}`}
            >
              <IconSettings className="h-4 w-4" />
              <span className="hidden sm:inline">{STRINGS.roster.settingsButton}</span>
            </button>
          </div>
        </header>

        <ul
          className="mx-auto grid min-h-0 flex-1 content-start justify-center"
          style={{
            gridTemplateColumns: `repeat(${layout.columns}, ${layout.cardWidth}px)`,
            gap: layout.gap,
          }}
        >
          {visibleModels.map((m) => (
            <RosterCard
              key={m.studentId}
              model={m}
              reducedMotion={reducedMotion}
              width={layout.cardWidth}
              height={layout.cardHeight}
              flipped={flippedIds.has(m.studentId)}
              onToggleFlip={() => toggleFlipCard(m.studentId)}
            />
          ))}
        </ul>

        <footer className="mt-2.5 flex shrink-0 flex-wrap items-center justify-between gap-2.5 border-t-2 border-[#3e2517]/20 pt-2.5">
          {/* Filter cepat minat praktikum terintegrasi rapi di footer agar 18 kartu tetap 100% muat 1 layar */}
          <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Saring minat praktikum">
            {ROSTER_FILTERS.map((f) => {
              const active = filterKey === f.key;
              return (
                <button
                  key={f.key}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    playSfx('klik');
                    setFilterKey(f.key);
                  }}
                  className={`inline-flex cursor-pointer items-center gap-1 rounded-full border-2 border-[#3e2517] px-2.5 py-1 font-['Fredoka'] text-[11px] font-bold transition ${
                    active
                      ? 'bg-gradient-to-b from-[#ffe694] to-[#f2b53b] text-[#3e2517] shadow-[0_2.5px_0_#3e2517]'
                      : 'bg-[#fffdf6]/90 text-[#5c3d26] hover:bg-[#fff3d6]'
                  }`}
                >
                  <span aria-hidden="true">{f.icon}</span>
                  <span>{f.label}</span>
                  {f.key === 'semua' && <span className="opacity-70">({models.length})</span>}
                </button>
              );
            })}
            <span className="ml-1 hidden text-xs font-semibold text-[#5c3d26] xl:inline">
              · {STRINGS.roster.hint}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onBack}
              className={`game-btn-secondary !px-5 !py-2 text-sm ${transition}`}
            >
              {STRINGS.roster.backButton}
            </button>
            <button
              type="button"
              data-continue="true"
              onClick={onContinue}
              className={`game-btn-primary !px-7 !py-2 text-sm ${transition}`}
            >
              {STRINGS.roster.continueButton}
            </button>
          </div>
        </footer>
      </div>
    </main>
  );
};

export default CharacterRosterScreen;
