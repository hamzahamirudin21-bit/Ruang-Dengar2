import React, { useEffect, useMemo, useRef, useState } from 'react';
import { STUDENT_BLUEPRINTS } from '../../data/agents.seed';
import { STRINGS } from '../../data/strings';
import { buildRosterModel } from '../characters/rosterModel';
import { IconSettings } from '../components/Icons';
import { RosterCard } from './RosterCard';
import { computeRosterLayout } from './rosterLayout';

export interface CharacterRosterScreenProps {
  reducedMotion: boolean;
  onContinue: () => void;
  onBack: () => void;
  onOpenSettings: () => void;
}

export const CharacterRosterScreen: React.FC<CharacterRosterScreenProps> = ({
  reducedMotion,
  onContinue,
  onBack,
  onOpenSettings,
}) => {
  const models = useMemo(() => buildRosterModel(STUDENT_BLUEPRINTS), []);
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
      className={`flex h-screen flex-col px-6 py-3.5 ${layout.fitsOneScreen ? 'overflow-hidden' : 'overflow-y-auto'}`}
      style={{
        backgroundColor: '#e8d8be',
        backgroundImage:
          'radial-gradient(rgba(62, 37, 23, 0.1) 1.2px, transparent 1.2px), linear-gradient(180deg, #f6ead4 0%, #e5d2b3 100%)',
        backgroundSize: '20px 20px, 100% 100%',
      }}
    >
      <div className="mx-auto flex min-h-0 w-full max-w-[90rem] flex-1 flex-col">
        <header className="game-panel-wood game-nails mb-3 flex shrink-0 items-center justify-between gap-3 px-5 py-2.5 text-[#fffdf6]">
          <div className="flex min-w-0 items-center gap-3.5">
            <span className="title-wave-bars" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
            </span>
            <h1 className="font-['Fredoka',sans-serif] text-lg font-bold tracking-wide text-[#ffe694] md:text-xl">
              {STRINGS.roster.title}
            </h1>
            <span aria-hidden="true" className="hidden h-4 w-0.5 bg-[#ffe694]/45 md:block" />
            <p className="hidden truncate text-sm text-[#fff3dc] md:block">
              {STRINGS.roster.subtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenSettings}
            className={`game-btn-secondary !min-h-[2rem] !px-3.5 !py-1 text-xs ${transition}`}
          >
            <IconSettings className="h-4 w-4" />
            <span>{STRINGS.roster.settingsButton}</span>
          </button>
        </header>

        <ul
          className="mx-auto grid min-h-0 flex-1 content-start justify-center"
          style={{
            gridTemplateColumns: `repeat(${layout.columns}, ${layout.cardWidth}px)`,
            gap: layout.gap,
          }}
        >
          {models.map((m) => (
            <RosterCard
              key={m.studentId}
              model={m}
              reducedMotion={reducedMotion}
              width={layout.cardWidth}
              height={layout.cardHeight}
            />
          ))}
        </ul>

        <footer className="mt-3 flex shrink-0 flex-wrap items-center justify-between gap-3 border-t-2 border-[#0f1b33]/18 pt-3">
          <p className="text-xs font-semibold text-[#3f4f6b]">{STRINGS.roster.hint}</p>
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
