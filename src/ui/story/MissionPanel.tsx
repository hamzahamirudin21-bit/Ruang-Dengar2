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
import { MAX_LOST_STUDENTS } from '../../engine/survivalMission';
import { PixelPortrait } from '../characters/PixelPortrait';
import { GameBadge, GameButton, frameClass } from '../components/game';
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
  /** Jumlah ⭐ Bintang Empati tersedia untuk menghias Ruang Konsultasi. */
  availableStars?: number;
  /** Membuka pop-up Hias Ruang BK (opsional). */
  onOpenDecorShop?: () => void;
  /** Himpunan mahasiswa yang sudah hilang (energi 0%). */
  lostAgentIds?: ReadonlySet<string>;
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
  availableStars = 0,
  onOpenDecorShop,
  lostAgentIds,
}: MissionPanelProps): React.ReactElement {
  const S = STRINGS.story;
  const busy = avatarMode !== 'idle';
  const reducedMotion = useReducedMotion();
  const [sortMode, setSortMode] = useState<'urgensi' | 'daftar'>('urgensi');
  const [filterMode, setFilterMode] = useState<'semua' | 'prioritas' | 'belum' | 'selesai'>('semua');
  const lostCount = lostAgentIds?.size ?? 0;

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
    () => computeCampusMissionSummary(agents, missions, lostAgentIds),
    [agents, missions, lostAgentIds],
  );

  const originalIndexMap = useMemo(() => {
    const map = new Map<string, number>();
    agents.forEach((a, idx) => map.set(a.id, idx + 1));
    return map;
  }, [agents]);

  const orderedAgents = useMemo(() => {
    const base =
      sortMode === 'urgensi' ? sortAgentsByUrgency(agents, missions, lostAgentIds) : [...agents];
    if (filterMode === 'semua') return base;
    return base.filter((a) => {
      const status = missions[a.id]?.status ?? 'belum';
      if (filterMode === 'selesai') return status === 'selesai';
      if (filterMode === 'belum') return status !== 'selesai' && !lostAgentIds?.has(a.id);
      return !lostAgentIds?.has(a.id) && status !== 'selesai' && a.energy < 0.6;
    });
  }, [agents, missions, sortMode, filterMode, lostAgentIds]);

  const shiftReached = summary.missionsCompleted >= SHIFT_TARGET_STORIES;
  const shiftProgressPct = Math.min(
    100,
    Math.round((summary.missionsCompleted / SHIFT_TARGET_STORIES) * 100),
  );

  return (
    <section aria-label={S.missionPanelTitle} className="relative flex flex-col gap-3">
      <header className="flex flex-col gap-2">
        {/* Papan Komando Misi Cozy — langsung tampak utuh tanpa judul ganda terpotong! */}
        <div className="rounded-[20px] border-[3px] border-[#3e2517] bg-gradient-to-b from-[#6b3e22] to-[#4f2c17] p-3 text-[#fffaf0] shadow-[inset_0_2px_0_rgba(255,235,190,0.22),inset_0_-4px_0_rgba(40,20,10,0.45),0_4px_0_#3e2517]">
          {/* Progres Target Shift (3 kisah pertama -> lalu koleksi 15 kisah!) */}
          <div className="flex items-center justify-between gap-2">
            <span className="font-['Fredoka'] text-xs font-bold tracking-wide text-[#ffe494]">
              {shiftReached ? '✦ Target Shift Tercapai!' : 'Target Shift Hari Ini'}
            </span>
            <span className="font-['Fredoka'] text-xs font-bold">
              {shiftReached
                ? `${summary.missionsCompleted}/${summary.missionsTotal} Kisah`
                : `${summary.missionsCompleted}/${SHIFT_TARGET_STORIES} Kisah`}
            </span>
          </div>
          <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full border-2 border-[#3e2517] bg-[#2f1a0e]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#f4b637] to-[#ffe694] transition-all duration-300"
              style={{
                width: `${
                  shiftReached
                    ? Math.round((summary.missionsCompleted / Math.max(1, summary.missionsTotal)) * 100)
                    : shiftProgressPct
                }%`,
              }}
            />
          </div>

          {/* Status Ketahanan Kelas: kalah jika 3 mahasiswa hilang */}
          <div className="mt-2.5 flex items-center justify-between gap-2 rounded-2xl border-2 border-[#3e2517] bg-[#3b2011] px-2.5 py-1.5 text-[11px]">
            <span className="font-['Fredoka'] font-bold text-[#ffe694]">
              🛡️ Batas Hilang ({lostCount}/{MAX_LOST_STUDENTS})
            </span>
            <span className="inline-flex items-center gap-1" aria-label={`Sisa toleransi ${Math.max(0, MAX_LOST_STUDENTS - lostCount)} dari ${MAX_LOST_STUDENTS}`}>
              {Array.from({ length: MAX_LOST_STUDENTS }, (_, idx) => {
                const broken = idx < lostCount;
                return (
                  <span
                    key={idx}
                    className={`inline-flex h-5 w-5 items-center justify-center rounded-full border border-[#3e2517] text-[10px] ${
                      broken ? 'bg-[#5a3b2e] opacity-45 grayscale' : 'bg-[#e5534b] text-white'
                    }`}
                  >
                    {broken ? '✕' : '♥'}
                  </span>
                );
              })}
            </span>
          </div>

          <div className="mt-2.5 flex items-center justify-between gap-2 text-[11px]">
            <span className="font-semibold text-[#f8e7c9]">Energi Rata-rata Lab</span>
            <span className="font-['Fredoka'] font-bold text-[#ffe494]">
              {summary.averageEnergyPct}%
            </span>
          </div>
          <div className="mt-1 h-2 w-full overflow-hidden rounded-full border-2 border-[#3e2517] bg-[#2f1a0e]">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                summary.averageEnergyPct < 40
                  ? 'bg-[#ef5b53]'
                  : summary.averageEnergyPct < 65
                    ? 'bg-[#f5b63b]'
                    : 'bg-[#45c493]'
              }`}
              style={{ width: `${summary.averageEnergyPct}%` }}
            />
          </div>

          <div className="mt-2.5 grid grid-cols-3 gap-1.5 text-center">
            <div className="rounded-2xl border-2 border-[#3e2517] bg-[#a83530] px-1.5 py-1 shadow-[inset_0_-2px_0_rgba(62,37,23,0.4)]">
              <div className="font-['Fredoka'] text-sm font-bold text-[#fff5f2]">
                {summary.criticalAgents.length}
              </div>
              <div className="text-[10px] font-semibold text-[#ffe0dc]">Kritis &lt;35%</div>
            </div>
            <div className="rounded-2xl border-2 border-[#3e2517] bg-[#b5731a] px-1.5 py-1 shadow-[inset_0_-2px_0_rgba(62,37,23,0.4)]">
              <div className="font-['Fredoka'] text-sm font-bold text-[#fffaf0]">
                {summary.warningAgents.length}
              </div>
              <div className="text-[10px] font-semibold text-[#ffefc8]">Waspada</div>
            </div>
            <div className="rounded-2xl border-2 border-[#3e2517] bg-[#247364] px-1.5 py-1 shadow-[inset_0_-2px_0_rgba(62,37,23,0.4)]">
              <div className="font-['Fredoka'] text-sm font-bold text-[#f2fff9]">
                {summary.communicatingCount}
              </div>
              <div className="text-[10px] font-semibold text-[#d2f5e9]">Mengobrol</div>
            </div>
          </div>

          {/* Tombol Pop-Up Hias Ruang BK + Jurnal + Kartu Hasil */}
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5 border-t border-white/15 pt-2.5">
            {onOpenDecorShop && (
              <button
                type="button"
                onClick={onOpenDecorShop}
                className="flex-1 rounded-full border-2 border-[#3e2517] bg-gradient-to-b from-[#ffe58f] to-[#f2b53b] px-3 py-1 font-['Fredoka'] text-[11px] font-bold text-[#3e2517] shadow-[inset_0_-2px_0_#c68616,0_3px_0_#3e2517] transition hover:-translate-y-0.5 hover:brightness-105"
              >
                🪴 Hias Ruang BK · ⭐ {availableStars}
              </button>
            )}
            {onOpenJournal && (
              <button
                type="button"
                onClick={onOpenJournal}
                className="rounded-full border-2 border-[#3e2517] bg-gradient-to-b from-[#3aa08e] to-[#267567] px-2.5 py-1 font-['Fredoka'] text-[11px] font-bold text-[#fffdf6] shadow-[inset_0_-2px_0_#1b574c,0_3px_0_#3e2517] transition hover:-translate-y-0.5 hover:brightness-105"
              >
                📖 Jurnal ({summary.missionsCompleted}/{summary.missionsTotal})
              </button>
            )}
            {onOpenShiftReport && shiftReached && (
              <button
                type="button"
                onClick={onOpenShiftReport}
                className="rounded-full border-2 border-[#3e2517] bg-gradient-to-b from-[#fffdf6] to-[#f5e3be] px-2.5 py-1 font-['Fredoka'] text-[11px] font-bold text-[#3e2517] shadow-[0_3px_0_#3e2517] transition hover:-translate-y-0.5"
              >
                🏆 Kartu Hasil
              </button>
            )}
          </div>

          <div className="mt-2 flex flex-wrap items-center justify-between gap-1.5 border-t border-white/10 pt-2">
            <span className="text-[10px] font-semibold text-[#f3dfc0]">Urutkan:</span>
            <div className="inline-flex items-center gap-1 font-['Fredoka'] text-[10px] font-bold">
              <button
                type="button"
                onClick={() => setSortMode('urgensi')}
                className={`cursor-pointer rounded-full border border-[#3e2517] px-2.5 py-0.5 transition ${
                  sortMode === 'urgensi'
                    ? 'bg-[#ffe494] text-[#3e2517]'
                    : 'bg-white/10 text-[#fff4de] hover:bg-white/20'
                }`}
              >
                Prioritas Energi
              </button>
              <button
                type="button"
                onClick={() => setSortMode('daftar')}
                className={`cursor-pointer rounded-full border border-[#3e2517] px-2.5 py-0.5 transition ${
                  sortMode === 'daftar'
                    ? 'bg-[#ffe494] text-[#3e2517]'
                    : 'bg-white/10 text-[#fff4de] hover:bg-white/20'
                }`}
              >
                #01–#{String(agents.length).padStart(2, '0')}
              </button>
            </div>
          </div>

          <div
            className="mt-1.5 flex flex-wrap items-center gap-1 font-['Fredoka'] text-[10px] font-bold"
            role="group"
            aria-label="Saring daftar misi"
          >
            {(
              [
                { id: 'semua', label: 'Semua' },
                { id: 'prioritas', label: '⚠ Kritis/Waspada' },
                { id: 'belum', label: 'Belum Selesai' },
                { id: 'selesai', label: '✦ Selesai' },
              ] as const
            ).map((f) => (
              <button
                key={f.id}
                type="button"
                aria-pressed={filterMode === f.id}
                onClick={() => setFilterMode(f.id)}
                className={`cursor-pointer rounded-full border border-[#3e2517] px-2 py-0.5 transition ${
                  filterMode === f.id
                    ? 'bg-[#3aa08e] text-[#fffdf6]'
                    : 'bg-white/10 text-[#f8e7c9] hover:bg-white/20'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {orderedAgents.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-[#3e2517]/30 bg-[#fffaf0] p-4 text-center text-xs text-[#6b482e]">
          Tidak ada mahasiswa pada filter ini.
        </div>
      )}

      <ul className="flex flex-col gap-2.5" aria-label={S.missionPanelTitle}>
        {orderedAgents.map((agent) => {
          const isLost = Boolean(lostAgentIds?.has(agent.id));
          const status: MissionStatus = missions[agent.id]?.status ?? 'belum';
          const roleId = STORY_ROLES[agent.id];
          const roleLabel = roleId ? STORY_ROLE_DEFS[roleId].label : '-';
          const statusText = isLost ? 'Hilang (0%)' : S.missionStatus[status];
          const isActive = !isLost && activeAgentId === agent.id;
          const idxNum = originalIndexMap.get(agent.id) ?? 1;
          const indexTag = `#${String(idxNum).padStart(2, '0')}`;
          const wellbeing = classifyAgentWellbeing(agent, observationLog, currentDay);
          const isoPct = Math.round(wellbeing.isolationRatio * 100);
          const storySig = signalForStudent(agent.id);

          const urgencyHighlight = isLost
            ? 'opacity-70 grayscale-[0.75]'
            : wellbeing.tier === 'kritis'
              ? 'ring-2 ring-red-600/85'
              : wellbeing.tier === 'waspada'
                ? 'ring-1 ring-amber-600/75'
                : '';

          return (
            <li
              key={agent.id}
              data-agent-id={agent.id}
              data-lost={isLost ? 'true' : 'false'}
              aria-current={isActive ? 'true' : undefined}
              className={`dossier-card ${frameClass(isActive ? 'navy' : 'krem')} ${urgencyHighlight} flex flex-col gap-2 p-2.5 text-sm`}
            >
              {/* Baris Atas Simetris: Potret setengah badan (kiri) sejajar penuh dengan identitas, energi & sinyal (kanan) */}
              <div className="grid grid-cols-[64px_minmax(0,1fr)] items-center gap-2.5">
                <div
                  className="relative h-[86px] w-[64px] shrink-0 overflow-hidden rounded-2xl border-[2.5px] border-[#3e2517] bg-gradient-to-b from-[#d8ecfa] via-[#f0f5e8] to-[#f8e6c8] shadow-[0_3px_0_#3e2517]"
                  style={{ lineHeight: 0 }}
                >
                  <span
                    className="absolute left-1 top-1 z-10 rounded-full border border-[#fffdf6]/40 bg-[#3e2517]/92 px-1.5 py-0.5 font-['Fredoka'] text-[10px] font-bold leading-none text-[#fffdf6]"
                    aria-hidden="true"
                  >
                    {indexTag}
                  </span>
                  <div className="h-full w-full [&>canvas]:!h-full [&>canvas]:!w-full [&>canvas]:object-contain [&>canvas]:object-bottom [&>img]:!h-full [&>img]:!w-full">
                    <PixelPortrait
                      studentId={agent.id}
                      name={agent.name}
                      expression={status === 'selesai' ? 'tersenyum' : 'netral'}
                      scale={1}
                      reducedMotion={reducedMotion}
                      demographicLabel={agent.demographicLabel}
                    />
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <span className="truncate font-['Fredoka'] text-[0.96rem] font-bold tracking-tight">
                      {agent.name}
                    </span>
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
                              ? 'text-[#ffd0cc]'
                              : 'text-[#b9322c]'
                            : wellbeing.tier === 'waspada'
                              ? isActive
                                ? 'text-[#ffe699]'
                                : 'text-[#a35c0e]'
                              : wellbeing.isCommunicating
                                ? isActive
                                  ? 'text-[#b7f7df]'
                                  : 'text-[#207258]'
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
                    <div className="h-2.5 w-full overflow-hidden rounded-full border-2 border-[#3e2517] bg-[#3e2517]/20">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          wellbeing.tier === 'kritis'
                            ? 'bg-[#e5534b]'
                            : wellbeing.tier === 'waspada'
                              ? 'bg-[#f2ae30]'
                              : 'bg-[#36ab81]'
                        }`}
                        style={{ width: `${wellbeing.energyPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Sinyal Perilaku Pemicu Rasa Penasaran atau Judul Kisah Terungkap */}
                  {isLost ? (
                    <p className="mt-1.5 rounded-xl border border-[#c6453c]/35 bg-[#fdeaea] px-2 py-1 text-[11px] font-bold text-[#992b24]">
                      🚪 Kehabisan energi dan meninggalkan kelas.
                    </p>
                  ) : status === 'selesai' ? (
                    <p
                      className={`mt-1.5 line-clamp-2 rounded-xl border border-[#3e2517]/20 px-2 py-1 text-[11px] font-bold ${
                        isActive
                          ? 'bg-[#ffe494]/20 text-[#ffe699]'
                          : 'bg-[#fff2c6] text-[#6d420c]'
                      }`}
                    >
                      ✦ “{storySig.unlockedTitle}”
                    </p>
                  ) : (
                    <p
                      className={`mt-1.5 line-clamp-2 text-[11px] italic leading-snug ${
                        isActive ? 'text-[#e8fff7]' : 'text-[#66452d]'
                      }`}
                    >
                      “{storySig.clue}”
                    </p>
                  )}
                </div>
              </div>

              {/* Baris Bawah Lebar Penuh & Simetris (nol ruang kosong di bawah potret!) */}
              <div className="flex flex-col gap-2 border-t-2 border-dashed border-[#3e2517]/15 pt-2">
                <dl className="flex flex-wrap items-center justify-between gap-1.5 text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <dt className="font-semibold uppercase tracking-wider opacity-70">{S.roleLabel}</dt>
                    <dd
                      className={`rounded-full px-2.5 py-0.5 font-semibold ${
                        isActive ? 'bg-white/15' : 'bg-[#3e2517]/10'
                      }`}
                    >
                      {roleLabel}
                    </dd>
                  </div>
                  {isoPct >= 50 && !isLost && (
                    <dd
                      className={`rounded-full px-2.5 py-0.5 font-bold ${
                        isActive
                          ? 'bg-[#ffe494]/25 text-[#ffe699]'
                          : 'bg-[#fde5b8] text-[#7a4508]'
                      }`}
                    >
                      {isoPct}% sendiri
                    </dd>
                  )}
                </dl>

                {isLost ? (
                  <GameButton variant="sekunder" size="sm" disabled className="w-full">
                    Meninggalkan Kelas
                  </GameButton>
                ) : (
                  <div className={`grid gap-2 ${status === 'lanjutan' ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    <GameButton
                      variant="primer"
                      size="sm"
                      aria-label={S.approachAria(agent.name)}
                      disabled={busy}
                      onClick={() => onApproach(agent.id)}
                      className="w-full"
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
                        className="w-full"
                      >
                        {S.followUpBtn}
                      </GameButton>
                    )}
                  </div>
                )}
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
