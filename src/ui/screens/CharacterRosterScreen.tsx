import React, { useEffect, useMemo, useRef, useState } from 'react';
import { STUDENT_BLUEPRINTS } from '../../data/agents.seed';
import { STRINGS } from '../../data/strings';
import { getStudentBackground } from '../../data/studentBackgrounds';
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

const ROSTER_FILTERS: readonly {
  key: RosterFilterKey;
  label: string;
  matchIcon?: 'kode' | 'chip' | 'api-las' | 'printer3d';
}[] = [
  { key: 'semua', label: 'Semua' },
  { key: 'pemrograman', label: 'Koding', matchIcon: 'kode' },
  { key: 'elektronika', label: 'Elektronika', matchIcon: 'chip' },
  { key: 'las', label: 'Las', matchIcon: 'api-las' },
  { key: 'cetak3d', label: 'Cetak 3D', matchIcon: 'printer3d' },
];

const FilterCategoryIcon: React.FC<{ filterKey: RosterFilterKey; active: boolean }> = ({
  filterKey,
  active,
}) => {
  const cls = `h-3.5 w-3.5 shrink-0 ${active ? 'text-[#00E5FF]' : 'text-[#9EB7C7]'}`;
  switch (filterKey) {
    case 'semua':
      return (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.1" className={cls} aria-hidden="true">
          <path d="M3 8.5 6.5 12 13 4.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'pemrograman':
      return (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" className={cls} aria-hidden="true">
          <path d="M5 4 1.5 8 5 12M11 4l3.5 4-3.5 4M9 3 7 13" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'elektronika':
      return (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" className={cls} aria-hidden="true">
          <rect x="4" y="4" width="8" height="8" rx="1.2" />
          <path d="M6 1v3M10 1v3M6 12v3M10 12v3M1 6h3M1 10h3M12 6h3M12 10h3" strokeLinecap="round" />
        </svg>
      );
    case 'las':
      return (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" className={cls} aria-hidden="true">
          <path d="M8 1.5c1 2.8 3.8 3.8 3.8 7.5a3.8 3.8 0 0 1-7.6 0c0-1.9 1-2.9 1.9-3.8 0 1.8 1 1.8 1 1.8 0-1.9 0-3.7.9-5.5Z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'cetak3d':
      return (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" className={cls} aria-hidden="true">
          <path d="M8 1.5 2 4.5v7l6 3 6-3v-7L8 1.5ZM2 4.5l6 3 6-3M8 7.5v7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
  }
};

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
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [flippedIds, setFlippedIds] = useState<ReadonlySet<string>>(() => new Set());

  const visibleModels = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return models.filter((m) => {
      if (filterKey !== 'semua') {
        const target = ROSTER_FILTERS.find((f) => f.key === filterKey)?.matchIcon;
        if (target && !m.interests.some((it) => it.iconId === target)) {
          return false;
        }
      }
      if (!q) return true;
      const bg = getStudentBackground(m.studentId);
      const haystack = `${m.number} ${m.name} ${bg.typeTag} ${bg.originAndCohort} ${m.interests
        .map((i) => i.text)
        .join(' ')}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [models, filterKey, searchQuery]);

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
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [viewport, setViewport] = useState(() => ({
    width: typeof window === 'undefined' ? 1366 : window.innerWidth,
    height: typeof window === 'undefined' ? 768 : window.innerHeight,
  }));

  useEffect(() => {
    const el = rootRef.current;
    const inner = containerRef.current;
    const measure = () => {
      const innerW = inner?.clientWidth;
      const w = innerW ? innerW + 40 : (el?.clientWidth || window.innerWidth);
      const h = el?.clientHeight || window.innerHeight;
      setViewport((v) => (v.width === w && v.height === h ? v : { width: w, height: h }));
    };
    measure();
    if (typeof ResizeObserver !== 'undefined' && el) {
      const ro = new ResizeObserver(measure);
      ro.observe(el);
      if (inner) ro.observe(inner);
      return () => ro.disconnect();
    }
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  // Gunakan kapasitas total (18) agar grid 6x3 stabil dan proporsional di desktop/laptop
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
        const t = e.target as HTMLElement | null;
        if (t && t.tagName === 'INPUT' && searchQuery) {
          e.preventDefault();
          setSearchQuery('');
          return;
        }
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
  }, [onBack, onContinue, searchQuery]);

  return (
    <main
      ref={rootRef}
      data-testid="character-roster-screen"
      className={`rtx-roster-lab relative flex h-screen flex-col px-4 py-2.5 sm:px-6 ${
        layout.fitsOneScreen ? 'overflow-hidden' : 'overflow-y-auto'
      }`}
    >
      {/* =====================================================================
          LAPISAN LINGKUNGAN LABORATORIUM FUTURISTIK SINEMATIK (DEPTH & LIGHTING)
         ===================================================================== */}
      <div aria-hidden="true" className="rtx-lab-environment">
        {/* Jendela Akademi Siber di Sisi Kiri (Ambient Cyan Daylight) */}
        <div className="rtx-lab-window-glow" />
        {/* Lampu Gantung Laboratorium Warm Gold di Kanan Atas */}
        <div className="rtx-lab-warm-lamp" />
        {/* Jaring Grid Teknikal & Garis HUD Holografik */}
        <div className="rtx-lab-tech-grid" />
        {/* Partikel Debu Optik Bercahaya (Hanya aktif bila gerak tidak dikurangi) */}
        {!reducedMotion && (
          <div className="rtx-lab-particles">
            <span className="rtx-particle rtx-particle--cyan" style={{ left: '8%', top: '22%', animationDelay: '0s' }} />
            <span className="rtx-particle rtx-particle--gold" style={{ left: '19%', top: '68%', animationDelay: '1.2s' }} />
            <span className="rtx-particle rtx-particle--cyan" style={{ left: '44%', top: '15%', animationDelay: '2.4s' }} />
            <span className="rtx-particle rtx-particle--gold" style={{ left: '78%', top: '24%', animationDelay: '0.7s' }} />
            <span className="rtx-particle rtx-particle--cyan" style={{ left: '91%', top: '58%', animationDelay: '1.9s' }} />
            <span className="rtx-particle rtx-particle--gold" style={{ left: '62%', top: '82%', animationDelay: '3.1s' }} />
          </div>
        )}
      </div>

      <div
        ref={containerRef}
        className="relative z-10 mx-auto flex min-h-0 w-full max-w-[95rem] flex-1 flex-col justify-between gap-2"
      >
        {/* ===================================================================
            1. TOP NAVIGATION — CINEMATIC HUD HEADER
           =================================================================== */}
        <header className="rtx-hud-header flex shrink-0 flex-wrap items-center justify-between gap-3 px-5 py-2.5">
          <div className="flex min-w-0 items-center gap-3.5">
            {/* Emblem Gelombang Akustik Emas Bercahaya */}
            <div className="rtx-soundwave-emblem" aria-hidden="true">
              <span className="h-2.5" />
              <span className="h-4" />
              <span className="h-6" />
              <span className="h-3.5" />
              <span className="h-5" />
              <span className="h-2.5" />
            </div>

            <h1 className="rtx-title-gold font-['Fredoka','Plus_Jakarta_Sans',sans-serif] text-xl font-extrabold tracking-wider uppercase sm:text-2xl">
              {STRINGS.roster.title}
            </h1>

            <span aria-hidden="true" className="hidden h-6 w-[1.5px] bg-gradient-to-b from-transparent via-[#00e5ff]/60 to-transparent lg:block" />

            <p className="hidden truncate font-['Plus_Jakarta_Sans',sans-serif] text-[0.82rem] font-medium text-[#EAF7FF]/90 lg:block">
              Galeri Kartu Lencana {models.length} Mahasiswa — klik kartu untuk membalik &amp; kenali latar belakangnya!
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleFlipAll}
              className="rtx-header-pill"
            >
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5 text-[#00E5FF]" aria-hidden="true">
                <path d="M2.5 8a5.5 5.5 0 0 1 9.3-4M13.5 8a5.5 5.5 0 0 1-9.3 4" strokeLinecap="round" />
                <path d="M12 1.8v2.5H9.5M4 14.2v-2.5h2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>{allFlipped ? 'Foto Semua' : 'Balik Semua'}</span>
            </button>

            {onToggleAudio && (
              <button
                type="button"
                onClick={onToggleAudio}
                aria-pressed={audioEnabled}
                aria-label={audioEnabled ? 'Matikan musik & suara' : 'Nyalakan musik & suara'}
                title={audioEnabled ? 'Musik & Suara Aktif' : 'Nyalakan Musik & Suara'}
                className={`rtx-header-pill !px-3 ${audioEnabled ? 'rtx-header-pill--active' : ''}`}
              >
                <span aria-hidden="true" className="text-sm leading-none text-[#00E5FF]">
                  {audioEnabled ? '🔊' : '🔇'}
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={onOpenSettings}
              className="rtx-header-pill"
            >
              <IconSettings className="h-4 w-4 text-[#FFBD59]" />
              <span className="hidden sm:inline">{STRINGS.roster.settingsButton}</span>
            </button>
          </div>

          {/* Garis Sirkuit Cyan Bercahaya di Dasar Header */}
          <span aria-hidden="true" className="rtx-header-circuit-line" />
        </header>

        {/* ===================================================================
            2. HOLOGRAPHIC FILTER & SEARCH SYSTEM BAR
           =================================================================== */}
        <section
          aria-label="Filter dan Pencarian Mahasiswa"
          className="rtx-filter-bar flex shrink-0 flex-wrap items-center justify-between gap-2.5 px-4 py-1.5"
        >
          <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Saring bidang minat">
            <span className="mr-1 inline-flex items-center gap-1.5 font-['Plus_Jakarta_Sans',sans-serif] text-xs font-semibold text-[#9EB7C7]">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-3.5 w-3.5 text-[#00E5FF]" aria-hidden="true">
                <path d="M2 3h12L9.5 8.2v4.3L6.5 14V8.2L2 3Z" strokeLinejoin="round" />
              </svg>
              <span>Filter Bidang Minat :</span>
            </span>

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
                  className={`rtx-filter-chip ${active ? 'rtx-filter-chip--active' : ''}`}
                >
                  <FilterCategoryIcon filterKey={f.key} active={active} />
                  <span>{f.label}</span>
                  {f.key === 'semua' && (
                    <span className="ml-0.5 opacity-85">({models.length})</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Kolom Pencarian Holografik */}
          <div className="relative flex min-w-[14.5rem] flex-1 items-center sm:max-w-[19rem]">
            <svg
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden="true"
              className="pointer-events-none absolute left-3 h-3.5 w-3.5 text-[#00E5FF]"
            >
              <circle cx="7" cy="7" r="4.6" />
              <path d="m10.5 10.5 3.3 3.3" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama atau bidang minat..."
              aria-label="Cari nama atau bidang minat mahasiswa"
              data-testid="roster-search-input"
              className="rtx-search-input w-full pl-8 pr-7 text-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Bersihkan pencarian"
                className="absolute right-2.5 cursor-pointer text-xs font-bold text-[#9EB7C7] hover:text-[#EAF7FF]"
              >
                ✕
              </button>
            )}
          </div>
        </section>

        {/* ===================================================================
            3. CHARACTER GALLERY — 18 STUDENTS HOLOGRAPHIC GRID (6 × 3)
           =================================================================== */}
        {visibleModels.length > 0 ? (
          <ul
            className="grid min-h-0 w-full flex-1 content-center items-stretch px-0.5 py-0.5"
            style={{
              gridTemplateColumns: `repeat(${layout.columns}, minmax(0, 1fr))`,
              gap: `${Math.max(10, layout.gap + 1)}px`,
            }}
          >
            {visibleModels.map((m, idx) => (
              <RosterCard
                key={m.studentId}
                model={m}
                index={idx}
                reducedMotion={reducedMotion}
                height={Math.max(142, layout.cardHeight - 12)}
                flipped={flippedIds.has(m.studentId)}
                onToggleFlip={() => toggleFlipCard(m.studentId)}
              />
            ))}
          </ul>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-[#00e5ff]/30 bg-[#061522]/80 p-8 text-center text-[#EAF7FF] backdrop-blur-md">
            <p className="font-['Plus_Jakarta_Sans',sans-serif] text-base font-bold text-[#00E5FF]">
              Tidak ada mahasiswa yang cocok dengan pencarian “{searchQuery}”
            </p>
            <p className="mt-1 text-xs text-[#9EB7C7]">
              Coba kata kunci lain atau tampilkan kembali seluruh 18 mahasiswa.
            </p>
            <button
              type="button"
              onClick={() => {
                setFilterKey('semua');
                setSearchQuery('');
              }}
              className="rtx-header-pill rtx-header-pill--active mt-3"
            >
              Reset Filter &amp; Pencarian
            </button>
          </div>
        )}

        {/* ===================================================================
            4. FOOTER — FOREGROUND LAB DESK & HEXAGONAL CHAMFER NAVIGATION
           =================================================================== */}
        <footer className="rtx-footer-bar relative flex shrink-0 flex-wrap items-center justify-between gap-3 pt-1.5">
          {/* Properti Meja Laboratorium Sinematik (Buku Ruang Dengar, Mug Gelombang Emas, & Tablet Hologram Cyan) */}
          <div className="hidden items-center gap-4 md:flex" aria-hidden="true">
            {/* Buku Hardcover Ruang Dengar Beraksen Emas */}
            <div className="rtx-desk-book">
              <span className="rtx-desk-book-title">RUANG DENGAR</span>
              <span className="rtx-desk-book-sub">DOSSIER 18 MAHASISWA</span>
            </div>

            {/* Mug Gelap Berlogo Gelombang Akustik Emas */}
            <div className="rtx-desk-mug">
              <span className="rtx-desk-mug-wave" />
            </div>

            {/* Papan Skema Hologram Cyan Bercahaya di Atas Meja */}
            <div className="rtx-desk-holopad">
              <span className="rtx-desk-holopad-grid" />
              <span className="relative z-10 font-mono text-[10px] font-bold tracking-wider text-[#00E5FF]">
                SYS.ROSTER // {visibleModels.length}/{models.length} AKTIF
              </span>
            </div>

            <span className="hidden text-xs font-medium text-[#9EB7C7] xl:inline">
              · {STRINGS.roster.hint}
            </span>
          </div>

          {/* Tombol Navigasi Utama (← Kembali & Lanjut →) */}
          <div className="ml-auto flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="rtx-nav-btn rtx-nav-btn--back"
            >
              <span aria-hidden="true">←</span>
              <span>{STRINGS.roster.backButton}</span>
            </button>

            <button
              type="button"
              data-continue="true"
              onClick={onContinue}
              className="rtx-nav-btn rtx-nav-btn--continue"
            >
              <span>{STRINGS.roster.continueButton}</span>
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </footer>
      </div>
    </main>
  );
};

export default CharacterRosterScreen;
