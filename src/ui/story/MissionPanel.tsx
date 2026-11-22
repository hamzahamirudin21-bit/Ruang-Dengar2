import React, { useMemo, useState } from 'react';
import { STORY_ROLES, STORY_ROLE_DEFS } from '../../data/storyRoles';
import { STRINGS } from '../../data/strings';
import {
  classifyAgentWellbeing,
  computeCampusMissionSummary,
  sortAgentsByUrgency,
} from '../../engine/isolationMission';
import { SHIFT_TARGET_STORIES, signalForStudent } from '../../engine/storySignals';
import type { AvatarMode } from '../../engine/story/avatar';
import type { MissionRecord } from '../../engine/story/saveSlot';
import type { ObservationLogState, StudentAgent } from '../../types';
import { PixelPortrait } from '../characters/PixelPortrait';
import { GameBadge, GameButton, GameRibbon, frameClass } from '../components/game';
import { IconBintang, IconJam, IconObrolan } from '../components/GameIcons';
import { CONFETTI_LIFETIME_MS, confettiSpecs } from '../motion/confetti';
import { playSfx } from '../motion/sfx';
import { useReducedMotion } from '../motion/useMotion';

export interface MissionPanelProps {
  agents: readonly StudentAgent[];
  missions: Readonly<Record<string, MissionRecord>>;
  /** Mode avatar; tombol dinonaktifkan saat tidak idle (Requirement 2.5). */
  avatarMode: AvatarMode;
  /** Id mahasiswa yang sedang dihampiri atau diajak bicara. */
  activeAgentId: string | null;
  /** Log pengamatan untuk menghitung rasio menyendiri harian (opsional). */
  observationLog?: ObservationLogState | null;
  /** Hari simulasi berjalan (opsional, bawaan 1). */
  currentDay?: number;
  /** Sama dengan klik agen di denah. */
  onApproach: (agentId: string) => void;
  /** Memulai sesi lanjutan; pemanggil menentukan entri 'lanjutan'. */
  onFollowUp: (agentId: string) => void;
  /** Membuka Jurnal 15 Kisah Lab (opsional). */
  onOpenJournal?: () => void;
  /** Membuka Kartu Hasil Shift (opsional). */
  onOpenShiftReport?: () => void;
}

type MissionStatus = MissionRecord['status'];

const CONFETTI_COLORS = [
  'var(--game-gold)',
  'var(--game-red-banner)',
  'var(--game-navy)',
  'var(--game-cream-paper)',
] as const;

const STATUS_TONE: Record<MissionStatus, 'krem' | 'navy' | 'emas' | 'merah'> = {
  belum: 'krem',
  berlangsung: 'navy',
  selesai: 'emas',
  lanjutan: 'merah',
};

function statusIcon(status: MissionStatus): React.ReactElement {
  if (status === 'belum') return <IconJam />;
  if (status === 'selesai') return <IconBintang />;
  return <IconObrolan />;
}

export function MissionPanel({
  agents,
  missions,
  avatarMode,
  activeAgentId,
  observationLog,
  currentDay = 1,
  onApproach,
  onFollowUp,
  onOpenJournal,
  onOpenShiftReport,
}: MissionPanelProps): React.ReactElement {
  const S = STRINGS.story;
  const busy = avatarMode !== 'idle';
  const reducedMotion = useReducedMotion();
  const [sortMode, setSortMode] = useState<'urgensi' | 'daftar'>('urgensi');

  const doneCount = Object.values(missions).filter((m) => m.status === 'selesai').length;
  const prevDone = React.useRef(doneCount);
  const [burst, setBurst] = React.useState<{ id: number } | null>(null);
  React.useEffect(() => {
    const prev = prevDone.current;
    prevDone.current = doneCount;
    if (doneCount <= prev) return;
    playSfx('misi-selesai');
    const id = doneCount;
    setBurst({ id });
    const timer = window.setTimeout(() => setBurst(null), CONFETTI_LIFETIME_MS);
    return () => window.clearTimeout(timer);
  }, [doneCount]);
  const pieces = React.useMemo(
    () => (burst && !reducedMotion ? confettiSpecs(burst.id, 24) : []),
    [burst, reducedMotion],
  );

  const summary = useMemo(
    () => computeCampusMissionSummary(agents, missions),
    [agents, missions],
  );

  const originalIndexMap = useMemo(() => {
    const map = new Map<string, number>();
    agents.forEach((a, idx) => map.set(a.id, idx + 1));
    return map;
  }, [agents]);

  const orderedAgents = useMemo(
    () => (sortMode === 'urgensi' ? sortAgentsByUrgency(agents, missions) : [...agents]),
    [agents, missions, sortMode],
  );

  const shiftReached = summary.missionsCompleted >= SHIFT_TARGET_STORIES;
  const shiftProgressPct = Math.min(
    100,
    Math.round((summary.missionsCompleted / SHIFT_TARGET_STORIES) * 100),
  );

  return (
    <section aria-label={S.missionPanelTitle} className="relative flex flex-col gap-3 p-2">
      <header className="flex flex-col gap-2">
        <GameRibbon level={2}>{S.missionPanelTitle}</GameRibbon>
        <p className="text-xs leading-relaxed text-slate-800">{S.missionPanelIntro}</p>

        {/* Papan Komando Misi: Target Shift + Kesehatan Energi Lab + Jurnal Kisah */}
        <div className="rounded-[5px_14px_5px_14px] border-2 border-[#0f1b33] bg-[#14233f] p-2.5 text-[#fff8e6] shadow-[0_4px_0_rgba(15,27,51,0.3)]">
          {/* Progres Target Shift (3 kisah pertama -> lalu koleksi 15 kisah!) */}
          <div className="flex items-center justify-between gap-2">
            <span className="font-['Outfit'] text-[11px] font-extrabold uppercase tracking-wider text-[#fde08d]">
              {shiftReached ? '✦ Target Shift Tercapai!' : 'Target Shift Hari Ini'}
            </span>
            <span className="font-['Outfit'] text-xs font-extrabold">
              {shiftReached
                ? `${summary.missionsCompleted}/${summary.missionsTotal} Kisah`
                : `${summary.missionsCompleted}/${SHIFT_TARGET_STORIES} Kisah`}
            </span>
          </div>
          <div className="mt-1 h-2 w-full overflow-hidden rounded-[2px_6px_2px_6px] border border-[#0a1222] bg-white/15">
            <div
              className="h-full bg-gradient-to-r from-[#f5b82e] to-[#fde08d] transition-all duration-300"
              style={{
                width: `${
                  shiftReached
                    ? Math.round((summary.missionsCompleted / Math.max(1, summary.missionsTotal)) * 100)
                    : shiftProgressPct
                }%`,
              }}
            />
          </div>

          <div className="mt-2.5 flex items-center justify-between gap-2 text-[11px]">
            <span className="font-semibold text-[#dbe6f7]">Energi Rata-rata Lab</span>
            <span className="font-['Outfit'] font-extrabold text-[#fde08d]">
              {summary.averageEnergyPct}%
            </span>
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-[2px_6px_2px_6px] border border-[#0a1222] bg-white/15">
            <div
              className={`h-full transition-all duration-300 ${
                summary.averageEnergyPct < 40
                  ? 'bg-[#ef4444]'
                  : summary.averageEnergyPct < 65
                    ? 'bg-[#f59e0b]'
                    : 'bg-[#10b981]'
              }`}
              style={{ width: `${summary.averageEnergyPct}%` }}
            />
          </div>

          <div className="mt-2 grid grid-cols-3 gap-1.5 text-center">
            <div className="rounded-[3px_8px_3px_8px] border border-red-400/40 bg-red-950/60 px-1.5 py-1">
              <div className="font-['Outfit'] text-sm font-black text-red-200">
                {summary.criticalAgents.length}
              </div>
              <div className="text-[10px] font-semibold text-red-100/85">Kritis &lt;35%</div>
            </div>
            <div className="rounded-[3px_8px_3px_8px] border border-amber-400/40 bg-amber-950/55 px-1.5 py-1">
              <div className="font-['Outfit'] text-sm font-black text-amber-200">
                {summary.warningAgents.length}
              </div>
              <div className="text-[10px] font-semibold text-amber-100/85">Waspada</div>
            </div>
            <div className="rounded-[3px_8px_3px_8px] border border-emerald-400/40 bg-emerald-950/55 px-1.5 py-1">
              <div className="font-['Outfit'] text-sm font-black text-emerald-200">
                {summary.communicatingCount}
              </div>
              <div className="text-[10px] font-semibold text-emerald-100/85">Mengobrol</div>
            </div>
          </div>

          <div className="mt-2 flex flex-wrap items-center justify-between gap-1.5 border-t border-white/15 pt-2">
            <div className="inline-flex items-center gap-1 text-[10px] font-bold">
              <button
                type="button"
                onClick={() => setSortMode('urgensi')}
                className={`rounded-[3px_7px_3px_7px] px-2 py-0.5 transition ${
                  sortMode === 'urgensi'
                    ? 'bg-[#fde08d] text-[#0f1b33]'
                    : 'bg-white/10 text-slate-200 hover:bg-white/20'
                }`}
              >
                Prioritas Energi
              </button>
              <button
                type="button"
                onClick={() => setSortMode('daftar')}
                className={`rounded-[3px_7px_3px_7px] px-2 py-0.5 transition ${
                  sortMode === 'daftar'
                    ? 'bg-[#fde08d] text-[#0f1b33]'
                    : 'bg-white/10 text-slate-200 hover:bg-white/20'
                }`}
              >
                #01–#15
              </button>
            </div>
            <div className="inline-flex items-center gap-1">
              {onOpenJournal && (
                <button
                  type="button"
                  onClick={onOpenJournal}
                  className="rounded-[3px_8px_3px_8px] border border-[#fde08d]/60 bg-[#175e75] px-2 py-0.5 text-[10px] font-extrabold text-[#fff8e6] hover:bg-[#1f7b96]"
                >
                  Jurnal ({summary.missionsCompleted}/{summary.missionsTotal})
                </button>
              )}
              {onOpenShiftReport && shiftReached && (
                <button
                  type="button"
                  onClick={onOpenShiftReport}
                  className="rounded-[3px_8px_3px_8px] border border-[#0f1b33] bg-[#fde08d] px-2 py-0.5 text-[10px] font-extrabold text-[#0f1b33] hover:brightness-105"
                >
                  Kartu Hasil
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <ul className="flex flex-col gap-2.5" aria-label={S.missionPanelTitle}>
        {orderedAgents.map((agent) => {
          const status: MissionStatus = missions[agent.id]?.status ?? 'belum';
          const roleId = STORY_ROLES[agent.id];
          const roleLabel = roleId ? STORY_ROLE_DEFS[roleId].label : '-';
          const statusText = S.missionStatus[status];
          const isActive = activeAgentId === agent.id;
          const idxNum = originalIndexMap.get(agent.id) ?? 1;
          const indexTag = `#${String(idxNum).padStart(2, '0')}`;
          const wellbeing = classifyAgentWellbeing(agent, observationLog, currentDay);
          const isoPct = Math.round(wellbeing.isolationRatio * 100);
          const storySig = signalForStudent(agent.id);

          const urgencyHighlight =
            wellbeing.tier === 'kritis'
              ? 'ring-2 ring-red-600/85'
              : wellbeing.tier === 'waspada'
                ? 'ring-1 ring-amber-600/75'
                : '';

          return (
            <li
              key={agent.id}
              data-agent-id={agent.id}
              aria-current={isActive ? 'true' : undefined}
              className={`dossier-card ${frameClass(isActive ? 'navy' : 'krem')} ${urgencyHighlight} flex gap-2.5 p-2.5 text-sm`}
            >
              <div
                className="relative shrink-0 overflow-hidden rounded-[4px_12px_4px_12px] border-2 border-[#0f1b33] bg-gradient-to-b from-[#cbe2f6] via-[#e7f1fa] to-[#f4e7d2] shadow-[0_3px_0_rgba(15,27,51,0.28)]"
                style={{ lineHeight: 0 }}
              >
                <span className="dossier-index-tag absolute left-0 top-0 z-10" aria-hidden="true">
                  {indexTag}
                </span>
                <PixelPortrait
                  studentId={agent.id}
                  name={agent.name}
                  expression={status === 'selesai' ? 'tersenyum' : 'netral'}
                  scale={1}
                  reducedMotion={reducedMotion}
                  demographicLabel={agent.demographicLabel}
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <span className="font-bold tracking-tight">{agent.name}</span>
                  <GameBadge
                    icon={statusIcon(status)}
                    value={statusText}
                    label={S.missionStatusLabel}
                    tone={STATUS_TONE[status]}
                  />
                </div>

                {/* Bilah Energi Langsung + Tren Sosial */}
                <div className="mt-1.5 space-y-1">
                  <div className="flex items-center justify-between gap-1 text-[11px] font-bold">
                    <span
                      className={
                        wellbeing.tier === 'kritis'
                          ? isActive
                            ? 'text-red-300'
                            : 'text-red-700'
                          : wellbeing.tier === 'waspada'
                            ? isActive
                              ? 'text-amber-300'
                              : 'text-amber-800'
                            : wellbeing.isCommunicating
                              ? isActive
                                ? 'text-emerald-300'
                                : 'text-emerald-700'
                              : 'opacity-80'
                      }
                    >
                      {wellbeing.trend === 'naik'
                        ? '▲ '
                        : wellbeing.trend === 'turun'
                          ? '▼ '
                          : '● '}
                      {wellbeing.statusLabel}
                    </span>
                    <span className="font-mono-data">{wellbeing.energyPct}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-[2px_6px_2px_6px] border border-[#0f1b33]/70 bg-[#0f1b33]/20">
                    <div
                      className={`h-full transition-all duration-300 ${
                        wellbeing.tier === 'kritis'
                          ? 'bg-red-500'
                          : wellbeing.tier === 'waspada'
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                      }`}
                      style={{ width: `${wellbeing.energyPct}%` }}
                    />
                  </div>
                </div>

                {/* Sinyal Perilaku Pemicu Rasa Penasaran atau Judul Kisah Terungkap */}
                {status === 'selesai' ? (
                  <p
                    className={`mt-1.5 rounded-[3px_8px_3px_8px] px-2 py-1 text-[11px] font-bold ${
                      isActive
                        ? 'bg-[#e5ac3f]/20 text-[#fde08d]'
                        : 'bg-[#fff3cd] text-[#784905]'
                    }`}
                  >
                    ✦ Kisah terungkap: “{storySig.unlockedTitle}”
                  </p>
                ) : (
                  <p
                    className={`mt-1.5 text-[11px] italic leading-snug ${
                      isActive ? 'text-slate-200' : 'text-slate-700'
                    }`}
                  >
                    “{storySig.clue}”
                  </p>
                )}

                <dl className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px]">
                  <dt className="font-semibold uppercase tracking-wider opacity-70">{S.roleLabel}</dt>
                  <dd
                    className={`rounded-[3px_8px_3px_8px] px-1.5 py-0.5 font-semibold ${
                      isActive ? 'bg-white/15' : 'bg-[#0f1b33]/10'
                    }`}
                  >
                    {roleLabel}
                  </dd>
                  {isoPct >= 50 && (
                    <dd
                      className={`rounded-[3px_8px_3px_8px] px-1.5 py-0.5 font-bold ${
                        isActive
                          ? 'bg-amber-400/20 text-amber-200'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {isoPct}% sendiri
                    </dd>
                  )}
                </dl>

                <div className="mt-2 flex flex-wrap gap-2">
                  <GameButton
                    variant="primer"
                    size="sm"
                    aria-label={S.approachAria(agent.name)}
                    disabled={busy}
                    onClick={() => onApproach(agent.id)}
                  >
                    {S.approachBtn}
                  </GameButton>
                  {status === 'lanjutan' && (
                    <GameButton
                      variant="sekunder"
                      size="sm"
                      aria-label={S.followUpAria(agent.name)}
                      disabled={busy}
                      onClick={() => onFollowUp(agent.id)}
                    >
                      {S.followUpBtn}
                    </GameButton>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      {burst && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
          data-testid="mission-celebration"
        >
          {reducedMotion ? (
            <span
              className="absolute left-1/2 top-4 -translate-x-1/2"
              style={{ color: 'var(--game-gold)' }}
            >
              <IconBintang />
            </span>
          ) : (
            <>
              <span className="fx-star-burst absolute left-1/2 top-4 -translate-x-1/2">
                <IconBintang />
              </span>
              {pieces.map((c, i) => (
                <span
                  key={i}
                  className="fx-confetti absolute"
                  style={{
                    left: `${c.x0Pct}%`,
                    top: '1.5rem',
                    width: `${c.sizePx}px`,
                    height: `${c.sizePx}px`,
                    background: CONFETTI_COLORS[c.colorIndex % CONFETTI_COLORS.length],
                  }}
                />
              ))}
            </>
          )}
        </div>
      )}
    </section>
  );
}

export default MissionPanel;
