import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { LAB_MAP } from '../../data/map';
import { STRINGS } from '../../data/strings';
import { STUDENT_BACKGROUNDS } from '../../data/studentBackgrounds';
import { resolveRoomVisualConfig } from './roomVisualConfig';
import type { StoryArrival, StoryOutcome, StoryRunnerState } from '../../engine/story/runner';
import { presentChoices } from '../../engine/story/runner';
import type { StoryExpression, StoryGraph, StoryScene } from '../../engine/story/storyTypes';
import type { MissionRecord } from '../../engine/story/saveSlot';
import type { StudentAgent, ZoneType } from '../../types';
import { dosenExpressionFor } from '../characters/dosenPortrait';
import { playFeedbackSfx, playSfx } from '../motion/sfx';
import { IconProfil, IconRelasi } from '../components/GameIcons';
import { classifyAgentWellbeing } from '../../engine/isolationMission';
import type { RoomDecorId } from '../../engine/roomDecor';
import { signalForStudent } from '../../engine/storySignals';
import { resolveSceneArt, sceneVariantForGraph } from '../scene/sceneArt';
import type { SceneVariant } from '../scene/sceneArt';
import { ProfileCard } from './ProfileCard';
import { RoomDecorOverlay } from './RoomDecorOverlay';
import { RoomEnvironmentLayer } from './RoomEnvironmentLayer';
import { StoryHistoryPanel } from './StoryHistoryPanel';
import { EmoteBubble } from './EmoteBubble';
import { ExpressionOverlay } from './ExpressionOverlay';
import { StoryBackdrop } from './SceneBackdrop';
import { StoryPortrait } from './StoryPortrait';
import { speakerSideOf } from './bubbleLayout';
import { emoteFor, shouldPopEmote } from './emoteModel';
import { pickPresentedChoices } from './presentedChoices';
import { StudentListPanel } from './StudentListPanel';
import { VnChoices } from './VnChoices';
import { VnDialogBox } from './VnDialogBox';
import { buildListRows, NARROW_BREAKPOINT } from './storyLayout';
import { buildStudentProfile } from './studentProfile';
import { autoDelayMs, buildBeats, choiceIndexForKey, decideEnterAction, followUpReplyFor, typewriterStep } from './storyUi';
import type { BeatSource, StoryBeat } from './storyUi';

import type { ChoiceFeedback } from './useStoryMission';

type ImpactDirection = keyof typeof STRINGS.story.impactWords;

/** Mengubah selisih angka menjadi kata (tanpa menampilkan skor). */
function impactWord(delta: number): ImpactDirection {
  if (!Number.isFinite(delta) || Math.abs(delta) < 1) return 'tetap';
  return delta > 0 ? 'naik' : 'turun';
}

export interface StoryScreenProps {
  graph: StoryGraph;
  agent: StudentAgent;
  /** State runner dipegang pemanggil; komponen ini terkendali. */
  state: StoryRunnerState;
  /**
   * Kedatangan terakhir. Bila kosong, dipakai entri terakhir `state.history`
   * (mis. setelah Muat atau pada pembuka).
   */
  arrival?: Pick<StoryArrival, 'counselorLine' | 'student' | 'fromNodeId'> | null;
  onChoose: (choiceId: string) => void;
  onSave: () => void;
  onLoad: () => void;
  onEndSession: () => void;
  /** Dipanggil dari kartu Ringkasan Misi: terapkan hasil ke dunia lalu buka Debrief. */
  onViewDebrief: () => void;
  /** Opsional: terapkan hasil ke dunia lalu langsung kembali ke peta lab. */
  onReturnToLab?: () => void;
  reducedMotion: boolean;
  /** Pesan status singkat (mis. hasil Simpan/Muat). */
  statusMessage?: string | null;
  /** Konten tambahan di atas pilihan saat cerita berakhir. */
  endSlot?: ReactNode;
  /** Daftar mahasiswa untuk laci kiri; bila kosong, hanya agen saat ini. */
  roster?: readonly StudentAgent[];
  /** Status misi per mahasiswa untuk kartu profil. */
  missions?: Readonly<Record<string, MissionRecord>>;
  /** Varian latar adegan; bila kosong diturunkan dari id graf. */
  sceneVariant?: SceneVariant;
  /** Daftar hiasan Ruang Konsultasi yang sedang terpasang. */
  equippedDecor?: readonly RoomDecorId[];
  /** Umpan balik energi langsung dari pilihan terakhir (+12% tepat / -14% salah). */
  lastChoiceFeedback?: ChoiceFeedback | null;
  /** Riwayat ketepatan tiap giliran pada sesi aktif. */
  turnResults?: readonly ('tepat' | 'salah')[];
  /** Peringatan live mahasiswa lain di lab yang sedang kritis saat waktu peta tetap berjalan. */
  otherCriticalAgent?: { name: string; energyPct: number } | null;
  /** Jumlah mahasiswa yang sudah hilang (batas kalah = maxLost). */
  lostCount?: number;
  maxLost?: number;
  /** Kontrol cepat musik & efek suara (opsional). */
  audioEnabled?: boolean;
  onToggleAudio?: () => void;
  /** Buka modal pengaturan sistem (opsional). */
  onOpenSettings?: () => void;
  className?: string;
}

function useElementSize<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      setSize((prev) => (prev.width === r.width && prev.height === r.height ? prev : { width: r.width, height: r.height }));
    };
    measure();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measure);
      return () => window.removeEventListener('resize', measure);
    }
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, size] as const;
}

export function SceneBackdrop({ setting }: { setting: StoryScene['setting'] }) {
  const isLab = setting === 'lab';
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 800 450"
      preserveAspectRatio="xMidYMid slice"
      data-setting={setting}
    >
      <defs>
        <linearGradient id={`story-bg-${setting}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={isLab ? '#dbe7ee' : '#efe6d8'} />
          <stop offset="1" stopColor={isLab ? '#bfd0da' : '#d9c9b0'} />
        </linearGradient>
      </defs>
      <rect width="800" height="450" fill={`url(#story-bg-${setting})`} />
    </svg>
  );
}

function useTypewriter(text: string, resetKey: string, reducedMotion: boolean) {
  const [elapsed, setElapsed] = useState(0);
  const [forceFull, setForceFull] = useState(false);

  useEffect(() => {
    setElapsed(0);
    setForceFull(false);
    if (reducedMotion || !text) return;
    const startedAt = typeof performance !== 'undefined' ? performance.now() : Date.now();
    let rafId = 0;
    const step = (now: number) => {
      const nextElapsed = Math.max(0, Math.round(now - startedAt));
      setElapsed(nextElapsed);
      if (!typewriterStep(text, nextElapsed, false).done) {
        rafId = window.requestAnimationFrame(step);
      }
    };
    rafId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(rafId);
  }, [resetKey, reducedMotion, text]);

  const result = typewriterStep(text, elapsed, reducedMotion || forceFull);
  const skip = useCallback(() => setForceFull(true), []);
  return { visible: result.visible, done: result.done, skip };
}

function MissionSummaryCard({
  studentId,
  outcome,
  onViewDebrief,
  onReturnToLab,
}: {
  studentId: string;
  outcome: StoryOutcome;
  onViewDebrief: () => void;
  onReturnToLab?: () => void;
}) {
  const S = STRINGS.story;
  const energy = S.impactWords[impactWord(outcome.energyDelta)];
  const energyDeltaPct = Math.round(outcome.energyDelta * 100);
  const energySigned =
    energyDeltaPct > 0 ? `+${energyDeltaPct}%` : energyDeltaPct < 0 ? `${energyDeltaPct}%` : '0%';
  const stress = S.impactWords[impactWord(outcome.stressDelta)];
  const canFollowUp = outcome.kind !== 'terbantu';
  const storySignal = signalForStudent(studentId);
  const earnedStars = outcome.kind === 'terbantu' ? 2 : outcome.kind === 'kemajuan-kecil' ? 1 : 0;

  return (
    <section
      role="region"
      aria-label={S.summaryCardTitle}
      className="vn-box--solid fx-panel-in max-h-full w-full max-w-xl overflow-y-auto !p-0"
      data-testid="story-mission-summary"
    >
      {/* Header Pita Perayaan Cozy */}
      <div
        className="flex flex-wrap items-center justify-between gap-2 border-b-[3px] border-[#3e2517] px-6 py-4 text-[#fffdf6]"
        style={{
          background:
            outcome.kind === 'terbantu'
              ? 'linear-gradient(135deg, #2e8274 0%, #1f6458 100%)'
              : outcome.kind === 'kemajuan-kecil'
                ? 'linear-gradient(135deg, #c9862d 0%, #a16518 100%)'
                : 'linear-gradient(135deg, #c94c44 0%, #9b332d 100%)',
        }}
      >
        <div>
          <p className="font-['Fredoka'] text-[11px] font-bold uppercase tracking-wider text-[#ffe8a3]">
            {outcome.kind === 'terbantu' ? '✦ Pendampingan Berhasil' : 'Catatan Akhir Sesi'}
          </p>
          <h2 className="font-['Fredoka'] text-xl font-bold drop-shadow-[0_2px_0_#3e2517]">
            {S.summaryCardTitle}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {earnedStars > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full border-2 border-[#3e2517] bg-[#ffe694] px-3 py-1 font-['Fredoka'] text-xs font-bold text-[#3e2517] shadow-[0_3px_0_#3e2517]">
              ⭐ +{earnedStars} Bintang
            </span>
          )}
          <span className="rounded-full border-2 border-[#3e2517] bg-[#fffdf6] px-3 py-1 font-['Fredoka'] text-xs font-bold text-[#3e2517] shadow-[0_3px_0_#3e2517]">
            {S.outcomeLabels[outcome.kind]}
          </span>
        </div>
      </div>

      <div className="p-6">
        {outcome.kind === 'terbantu' && (
          <div
            className="mb-4 rounded-[20px] border-[2.5px] border-[#3e2517] bg-gradient-to-b from-[#fff8de] to-[#fdebb7] p-3.5 shadow-[inset_0_-3px_0_#e8c673,0_4px_0_#3e2517]"
            data-testid="story-unlocked-card"
          >
            <p className="font-['Fredoka'] text-[11px] font-bold uppercase tracking-wider text-[#9c5a0e]">
              📖 Kisah Terungkap di Jurnal Lab
            </p>
            <p className="mt-0.5 font-['Fredoka'] text-base font-bold text-[#3e2517]">
              “{storySignal.unlockedTitle}”
            </p>
            <p className="mt-1 text-xs leading-relaxed text-[#5c3d26]">
              {storySignal.unlockedExcerpt}
            </p>
          </div>
        )}

        <p className="text-sm leading-relaxed text-[#3e2517]">{outcome.summaryBody}</p>

        {outcome.reasons.length > 0 && (
          <div className="mt-4 rounded-2xl border-2 border-[#3e2517]/20 bg-[#fffaf0] p-3.5">
            <h3 className="font-['Fredoka'] text-xs font-bold uppercase tracking-wider text-[#7a5234]">
              {S.summaryReasonsTitle}
            </h3>
            <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm text-[#3e2517]">
              {outcome.reasons.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-2xl border-[2.5px] border-[#3e2517] bg-[#fffdf7] p-3 shadow-[0_3px_0_#3e2517]">
            <span className="block font-['Fredoka'] text-xs font-semibold text-[#7a5234]">
              ⚡ {S.summaryEnergyLabel}
            </span>
            <span
              className={`font-['Fredoka'] text-base font-bold ${
                energyDeltaPct > 0
                  ? 'text-[#217a62]'
                  : energyDeltaPct < 0
                    ? 'text-[#c6453c]'
                    : 'text-[#3e2517]'
              }`}
            >
              {energy} ({energySigned})
            </span>
          </div>
          <div className="rounded-2xl border-[2.5px] border-[#3e2517] bg-[#fffdf7] p-3 shadow-[0_3px_0_#3e2517]">
            <span className="block font-['Fredoka'] text-xs font-semibold text-[#7a5234]">
              🌿 {S.summaryStressLabel}
            </span>
            <span className="font-['Fredoka'] text-base font-bold text-[#3e2517]">{stress}</span>
          </div>
        </div>

        <p className="mt-4 text-xs leading-relaxed text-[#6b482e]">
          {canFollowUp ? S.followUpNote : S.missionCompleteNote}
        </p>

        <div className="mt-5 flex flex-wrap justify-end gap-2.5">
          <button
            type="button"
            className="game-btn-secondary !px-5 text-sm"
            aria-label={S.viewDebriefAria}
            onClick={onViewDebrief}
          >
            {onReturnToLab ? 'Lihat Refleksi' : S.viewDebriefBtn}
          </button>
          {onReturnToLab && (
            <button
              type="button"
              className="game-btn-primary !px-6 text-sm"
              onClick={onReturnToLab}
            >
              Kembali ke Lab →
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

export function StoryScreen({
  graph,
  agent,
  state,
  arrival,
  onChoose,
  onSave,
  onLoad,
  onEndSession,
  onViewDebrief,
  onReturnToLab,
  reducedMotion,
  statusMessage,
  endSlot,
  roster,
  missions,
  sceneVariant,
  equippedDecor,
  lastChoiceFeedback,
  turnResults,
  otherCriticalAgent,
  lostCount = 0,
  maxLost = 3,
  audioEnabled,
  onToggleAudio,
  onOpenSettings,
  className,
}: StoryScreenProps) {
  const S = STRINGS.story;

  const [rootRef, rootSize] = useElementSize<HTMLDivElement>();
  const [drawer, setDrawer] = useState<'left' | 'right' | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const narrow = rootSize.width > 0 && rootSize.width < NARROW_BREAKPOINT;

  const allAgents = useMemo<readonly StudentAgent[]>(
    () => (roster && roster.length > 0 ? roster : [agent]),
    [roster, agent],
  );
  const listRows = useMemo(() => buildListRows(allAgents), [allAgents]);
  const profile = useMemo(
    () => buildStudentProfile(agent, allAgents, missions?.[agent.id]),
    [agent, allAgents, missions],
  );

  const scene = useMemo(
    () => graph.scenes.find((s) => s.id === state.sceneId) ?? graph.scenes[0],
    [graph, state.sceneId],
  );

  const activeNode = useMemo(
    () => graph.nodes.find((n) => n.id === state.nodeId),
    [graph, state.nodeId],
  );
  const studentWellbeing = useMemo(() => classifyAgentWellbeing(agent), [agent]);
  const isOpenUpMoment = Boolean(activeNode?.marks?.includes('momen-terbuka'));

  // Zona awal diambil sekali per (graf, mahasiswa) agar latar tidak berkedip saat agen bergerak.
  const startZoneRef = useRef<{ graph: StoryGraph; agentId: string; zone: ZoneType } | null>(null);
  if (
    !startZoneRef.current ||
    startZoneRef.current.graph !== graph ||
    startZoneRef.current.agentId !== agent.id
  ) {
    startZoneRef.current = { graph, agentId: agent.id, zone: agent.currentZoneId };
  }
  const startZoneId = startZoneRef.current.zone;

  const variant: SceneVariant = sceneVariant ?? sceneVariantForGraph(scene?.id ?? '');

  // Mode ringkas v2 (7 giliran): langsung tampilkan respons mahasiswa (tanpa klik ulang kalimat dosen & tanpa lompatan acak!)
  const isCompactMode = graph.version >= 2;
  const activeSource = useMemo<BeatSource | null>(() => {
    const last = state.history[state.history.length - 1];
    return arrival
      ? { counselorLine: arrival.counselorLine, student: arrival.student }
      : last
        ? { counselorLine: last.counselorLine, student: last.studentLine }
        : null;
  }, [arrival, state.history]);

  const beats = useMemo<StoryBeat[]>(() => {
    if (!activeSource) return [];
    if (isCompactMode) {
      const compactBeats: StoryBeat[] = [];
      if (activeSource.student.aside?.trim()) {
        compactBeats.push({
          kind: 'selingan',
          text: activeSource.student.aside,
          expression: null,
          italic: true,
        });
      }
      compactBeats.push({
        kind: 'mahasiswa',
        text: activeSource.student.text,
        expression: activeSource.student.expression,
        italic: false,
      });
      return compactBeats;
    }
    const last = state.history[state.history.length - 1];
    const prev = state.history.length >= 2 ? state.history[state.history.length - 2] : undefined;
    const prevNodeId = arrival?.fromNodeId ?? last?.fromNodeId ?? prev?.nodeId ?? null;
    const result = buildBeats(activeSource);
    const followUp = followUpReplyFor(graph, state.nodeId, activeSource.student, prevNodeId);
    if (followUp) {
      result.push(...buildBeats({ counselorLine: null, student: followUp }));
    }
    return result;
  }, [activeSource, isCompactMode, arrival, state.history, state.nodeId, graph]);
  const inlineCueText = isCompactMode ? (activeSource?.student.cue ?? null) : null;

  // Kurasi tepat 3 pilihan seimbang agar layar bersih & simetris
  const choices = useMemo(
    () => pickPresentedChoices(presentChoices(graph, state), activeNode),
    [graph, state, activeNode],
  );

  const arrivalKey = `${state.nodeId}|${state.turn}|${state.history.length}`;
  const [beatIndex, setBeatIndex] = useState(0);
  const [auto, setAuto] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [confirmEnd, setConfirmEnd] = useState(false);

  useEffect(() => {
    setBeatIndex(0);
  }, [arrivalKey]);

  const lastIndex = Math.max(0, beats.length - 1);
  const safeIndex = Math.min(beatIndex, lastIndex);
  const beat: StoryBeat | undefined = beats[safeIndex];
  const hasNextBeat = safeIndex < lastIndex;

  const typing = useTypewriter(beat?.text ?? '', `${arrivalKey}|${safeIndex}`, reducedMotion);
  const atChoices = !hasNextBeat && typing.done && !state.ended && choices.length > 0;

  const advance = useCallback(() => {
    playSfx('klik');
    if (!typing.done) {
      typing.skip();
    } else if (hasNextBeat) {
      setBeatIndex(safeIndex + 1);
    }
  }, [typing, hasNextBeat, safeIndex]);

  useEffect(() => {
    if (!auto || !typing.done || !hasNextBeat || !beat) return;
    const id = window.setTimeout(() => setBeatIndex(safeIndex + 1), autoDelayMs(beat.text.length));
    return () => window.clearTimeout(id);
  }, [auto, typing.done, hasNextBeat, beat, safeIndex]);

  const expression: StoryExpression = useMemo(() => {
    for (let i = safeIndex; i >= 0; i -= 1) {
      const e = beats[i]?.expression;
      if (e) return e;
    }
    return beats.length > 0
      ? 'netral'
      : (state.history[state.history.length - 1]?.studentLine.expression ?? 'netral');
  }, [beats, safeIndex, state.history]);

  const choicesRef = useRef<HTMLDivElement | null>(null);
  const modalOpen = historyOpen || confirmEnd;
  const showSummary = state.ended && !!state.outcome && !hasNextBeat && typing.done;

  useEffect(() => {
    if (!atChoices || modalOpen || drawer !== null) return;
    const first = choicesRef.current?.querySelector<HTMLButtonElement>('[data-story-choice]');
    first?.focus();
  }, [atChoices, arrivalKey, modalOpen, drawer]);

  // Papan tombol: 1-3 memilih respons, Enter memajukan dialog, Esc menutup laci/bantuan.
  useEffect(() => {
    if (modalOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target instanceof HTMLElement ? e.target : null;
      if (target && (target.closest('input, textarea, select') || target.isContentEditable)) return;

      if (e.key === 'Escape') {
        if (drawer !== null) {
          e.preventDefault();
          setDrawer(null);
          return;
        }
        if (helpOpen) {
          e.preventDefault();
          setHelpOpen(false);
          return;
        }
      }

      if (drawer !== null) return;

      if (e.key === 'Enter' || e.key === ' ') {
        const choiceFocused = !!target?.closest('[data-story-choice]');
        if (target?.closest('button, a, [role="button"]') && !choiceFocused) return;
        const action = decideEnterAction({ choiceFocused, typing: !typing.done, hasNextBeat });
        if (action === 'pilih-fokus') return;
        if (action === 'tampilkan-penuh' || action === 'lanjut') {
          e.preventDefault();
          advance();
        }
        return;
      }

      if (!atChoices) return;
      const index = choiceIndexForKey(e.key, choices.length);
      if (index === null) return;
      e.preventDefault();
      onChoose(choices[index].id);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [modalOpen, drawer, helpOpen, typing.done, hasNextBeat, advance, atChoices, choices, onChoose]);

  const counselorSpeaking = beat?.kind === 'dosen';
  const studentSpeaking = beat?.kind === 'mahasiswa' || beat?.kind === 'isyarat';
  const speakerKey = counselorSpeaking ? 'dosen' : studentSpeaking ? 'mahasiswa' : 'none';

  // PHASE 4: 6 Visual State Karakter (Entering, Exiting, Speaking, Listening, Selected, Idle)
  const [charEntering, setCharEntering] = useState(true);
  useEffect(() => {
    if (reducedMotion) {
      setCharEntering(false);
      return;
    }
    setCharEntering(true);
    const id = window.setTimeout(() => setCharEntering(false), 360);
    return () => window.clearTimeout(id);
  }, [agent.id, reducedMotion]);

  const counselorVisualState: 'entering' | 'exiting' | 'speaking' | 'listening' | 'selected' | 'idle' =
    showSummary || confirmEnd
      ? 'exiting'
      : charEntering
        ? 'entering'
        : counselorSpeaking
          ? 'speaking'
          : atChoices
            ? 'selected'
            : studentSpeaking
              ? 'listening'
              : 'idle';

  const studentVisualState: 'entering' | 'exiting' | 'speaking' | 'listening' | 'selected' | 'idle' =
    showSummary || confirmEnd
      ? 'exiting'
      : charEntering
        ? 'entering'
        : studentSpeaking
          ? 'speaking'
          : drawer === 'right'
            ? 'selected'
            : counselorSpeaking || atChoices
              ? 'listening'
              : 'idle';

  const studentRoleSubtitle = useMemo(() => {
    const bg = STUDENT_BACKGROUNDS[agent.id];
    return bg ? `Mahasiswa · ${bg.typeTag}` : 'Mahasiswa Vokasi';
  }, [agent.id]);

  const msSinceSpeakerChange = Number.POSITIVE_INFINITY;

  const prevExpressionRef = useRef<StoryExpression | null>(null);
  const [emoteState, setEmoteState] = useState<{ id: ReturnType<typeof emoteFor>; key: number }>({ id: null, key: 0 });
  useEffect(() => {
    const prev = prevExpressionRef.current;
    prevExpressionRef.current = expression;
    if (shouldPopEmote(prev, expression)) {
      setEmoteState((s) => ({ id: emoteFor(expression), key: s.key + 1 }));
      playSfx('emote');
    }
  }, [expression]);

  const visibleLen = typing.visible.length;
  useEffect(() => {
    if (visibleLen > 0 && !typing.done) playSfx('ketik');
  }, [visibleLen, typing.done]);

  const artId = resolveSceneArt({ setting: scene?.setting ?? 'ruang-konsultasi', zoneId: startZoneId });
  const roomConfig = useMemo(
    () =>
      resolveRoomVisualConfig({
        setting: scene?.setting ?? 'ruang-konsultasi',
        zoneId: startZoneId,
      }),
    [scene?.setting, startZoneId]
  );
  const roomThemeStyle = useMemo<CSSProperties>(
    () =>
      ({
        '--vn-room-bg-primary': roomConfig.theme.bgPrimary,
        '--vn-room-bg-secondary': roomConfig.theme.bgSecondary,
        '--vn-room-accent': roomConfig.theme.accentPrimary,
        '--vn-room-accent-secondary': roomConfig.theme.accentSecondary,
        '--vn-room-glow': roomConfig.theme.glowColor,
        '--vn-room-dialog-glass': roomConfig.theme.dialogGlassBg,
        '--vn-room-tabletop': roomConfig.theme.tabletopSurface,
        '--vn-px': 0,
        '--vn-py': 0,
      }) as CSSProperties,
    [roomConfig]
  );
  const displayedSceneTitle = useMemo(() => {
    if (!scene) return roomConfig.headerTitle;
    if (scene.setting === 'ruang-konsultasi') return roomConfig.headerTitle;
    return roomConfig.headerTitle || LAB_MAP.zones.find((z) => z.id === startZoneId)?.label || scene.title;
  }, [scene, startZoneId, roomConfig.headerTitle]);
  const prevArtRef = useRef<string | null>(null);
  useEffect(() => {
    if (prevArtRef.current !== null && prevArtRef.current !== artId) playSfx('ganti-adegan');
    prevArtRef.current = artId;
  }, [artId]);

  const speakerName =
    !beat ? '' : beat.kind === 'dosen' ? S.speakerCounselor : beat.kind === 'selingan' ? S.narrationSpeaker : agent.name;
  const dosenExpression = dosenExpressionFor(
    expression,
    !beat ? 'selingan' : beat.kind === 'dosen' ? 'dosen' : beat.kind === 'selingan' ? 'selingan' : 'mahasiswa',
  );

  const stageMood: 'hangat' | 'tegang' | 'murung' | 'tenang' =
    expression === 'tersenyum' || expression === 'lega'
      ? 'hangat'
      : expression === 'waspada' || expression === 'kesal' || expression === 'terkejut'
        ? 'tegang'
        : expression === 'menunduk' ||
            expression === 'cemas' ||
            expression === 'lelah' ||
            expression === 'menutup-diri'
          ? 'murung'
          : 'tenang';

  const confirmAndEnd = () => {
    setConfirmEnd(false);
    onEndSession();
  };

  // Animasi reaksi emosional saat memilih respons (+12% senang/lega / -14% sedih/kecewa + gelombang komunikasi)
  const [reactionFx, setReactionFx] = useState<{ kind: 'tepat' | 'salah'; key: number } | null>(null);
  const lastFeedbackTurnRef = useRef<number | null>(null);
  useEffect(() => {
    if (!lastChoiceFeedback) {
      lastFeedbackTurnRef.current = null;
      setReactionFx(null);
      return;
    }
    if (lastFeedbackTurnRef.current === lastChoiceFeedback.turn) return;
    lastFeedbackTurnRef.current = lastChoiceFeedback.turn;
    const fxKey = Date.now();
    playFeedbackSfx(lastChoiceFeedback.kind);
    setReactionFx({ kind: lastChoiceFeedback.kind, key: fxKey });
    const timer = window.setTimeout(
      () => setReactionFx((cur) => (cur?.key === fxKey ? null : cur)),
      1550,
    );
    return () => window.clearTimeout(timer);
  }, [lastChoiceFeedback]);

  const isWarmRoom =
    scene?.setting === 'ruang-konsultasi' ||
    startZoneId === 'diskusi' ||
    startZoneId === 'istirahat' ||
    startZoneId === 'konsultasi';

  // Hitung beruntun respons empatik tepat (combo streak) dari riwayat giliran aktif
  const empathyStreak = useMemo(() => {
    if (!turnResults || turnResults.length === 0) return 0;
    let count = 0;
    for (let i = turnResults.length - 1; i >= 0; i -= 1) {
      if (turnResults[i] === 'tepat') count += 1;
      else break;
    }
    return count;
  }, [turnResults]);

  // PHASE 5: Panggung Percakapan Stabil Tanpa Getaran Parallax atau Loop Partikel Berat
  const vfxCanvasRef = useRef<HTMLCanvasElement | null>(null);

  return (
    <div
      ref={rootRef}
      style={roomThemeStyle}
      className={`vn-stage ${className ?? ''}`}
      data-mood={stageMood}
      data-room-id={roomConfig.roomId}
      data-room-mood={roomConfig.moodCategory}
      data-wall-display={roomConfig.wallDisplayKind}
      data-desk-prop={roomConfig.deskPropKind}
      data-testid="story-screen"
    >
      {/* 1. Latar adegan selebar layar dengan atmosfer sinematik tajam & stabil */}
      <div className="vn-backdrop">
        <StoryBackdrop
          setting={scene?.setting ?? 'ruang-konsultasi'}
          zoneId={startZoneId}
          variant={variant}
          size={rootSize}
          narrow={narrow}
          reducedMotion={reducedMotion}
        />
      </div>
      {/* 1a. Lapisan Lingkungan Arsitektural & Panel Dinding Spesifik 11 Ruangan (PHASE 3) */}
      <RoomEnvironmentLayer config={roomConfig} reducedMotion={reducedMotion} />
      {/* 1b. Pencahayaan emosi panggung halus berbasis ekspresi terlihat */}
      <div className="vn-mood-layer" aria-hidden="true" />
      {/* 1b1. Kanvas VFX ringan (statis tanpa loop per-frame yang membebani GPU) */}
      {!reducedMotion && (
        <canvas
          ref={vfxCanvasRef}
          data-testid="vn-vfx-canvas"
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[1] h-full w-full"
        />
      )}
      {/* 1c. Hiasan Ruang Konsultasi yang telah dibuka & dipasang pemain */}
      <RoomDecorOverlay
        setting={scene?.setting ?? 'ruang-konsultasi'}
        equippedIds={equippedDecor ?? []}
        reducedMotion={reducedMotion}
      />

      {/* 2. Dua karakter simetris berdiri penuh di tepi kiri & kanan (stabil tanpa goyangan/getaran) */}
      <div className="vn-cast">
        {/* Jembatan komunikasi visual 2-arah antara Ibu Dosen dan Mahasiswa saat memilih respons */}
        {reactionFx && !reducedMotion && (
          <div
            key={`bridge-${reactionFx.key}`}
            aria-hidden="true"
            className={reactionFx.kind === 'tepat' ? 'vn-empathy-bridge' : 'vn-tension-bridge'}
          >
            {reactionFx.kind === 'tepat' ? (
              <>
                <span className="vn-bridge-particle">💛</span>
                <span className="vn-bridge-particle vn-em-delay-1">✦</span>
                <span className="vn-bridge-particle vn-em-delay-2">✨</span>
              </>
            ) : (
              <span className="vn-bridge-tension-pill">··· suasana terasa canggung ···</span>
            )}
          </div>
        )}

        <div
          className={`vn-char vn-char--left ${
            counselorSpeaking ? 'vn-char--active' : 'vn-char--idle'
          }`}
          data-char-state={counselorVisualState}
          data-testid="vn-stage-char-counselor"
        >
          <span aria-hidden="true" className="vn-char-ground-glow" />
          <ExpressionOverlay
            role="dosen"
            expression={dosenExpression}
            reactionKind={reactionFx?.kind ?? null}
            isSpeaker={counselorSpeaking}
            reducedMotion={reducedMotion}
          />
          <StoryPortrait
            role="dosen"
            expression={dosenExpression}
            reducedMotion={reducedMotion}
            isSpeaker={counselorSpeaking}
            isTyping={counselorSpeaking && !typing.done}
            msSinceSpeakerChange={counselorSpeaking ? msSinceSpeakerChange : Number.POSITIVE_INFINITY}
            facing="kanan"
            fluid
            reactionKind={reactionFx?.kind ?? null}
            scale={4}
          />
          {/* Papan Nama Karakter Panggung Kiri (Ibu Dosen) sesuai gambar referensi */}
          <div
            aria-hidden="true"
            className={`vn-stage-nameplate vn-stage-nameplate--left ${
              counselorSpeaking || atChoices ? 'vn-stage-nameplate--active' : ''
            }`}
            data-state={counselorVisualState}
          >
            <span className="vn-stage-nameplate-icon">📖</span>
            <div className="vn-stage-nameplate-meta">
              <div className="flex items-center gap-1.5">
                <span className="vn-stage-nameplate-title">{S.speakerCounselor}</span>
                <span
                  className={`vn-stage-state-dot vn-stage-state-dot--${counselorVisualState}`}
                />
              </div>
              <span className="vn-stage-nameplate-role">Dosen Pembimbing</span>
            </div>
          </div>
        </div>

        <div
          className={`vn-char vn-char--right ${
            studentSpeaking ? 'vn-char--active' : 'vn-char--idle'
          }`}
          data-char-state={studentVisualState}
          data-testid="vn-stage-char-student"
        >
          <span aria-hidden="true" className="vn-char-ground-glow" />
          <div className="absolute left-1/2 top-2 z-10 -translate-x-1/2">
            <EmoteBubble emote={emoteState.id} triggerKey={emoteState.key} reducedMotion={reducedMotion} />
          </div>
          <ExpressionOverlay
            role="mahasiswa"
            expression={expression}
            reactionKind={reactionFx?.kind ?? null}
            isSpeaker={studentSpeaking}
            reducedMotion={reducedMotion}
          />
          {/* Kilau bintang ceria mengelilingi mahasiswa saat konselor memilih jawaban tepat (+12%) */}
          {reactionFx?.kind === 'tepat' && !reducedMotion && (
            <div key={reactionFx.key} aria-hidden="true" className="vn-sparkle-burst">
              {[
                { left: '16%', top: '20%', ch: '✦', delay: '0ms' },
                { left: '80%', top: '16%', ch: '💛', delay: '80ms' },
                { left: '10%', top: '44%', ch: '✨', delay: '140ms' },
                { left: '86%', top: '40%', ch: '✦', delay: '110ms' },
                { left: '48%', top: '8%', ch: '★', delay: '40ms' },
                { left: '66%', top: '28%', ch: '✨', delay: '180ms' },
              ].map((sp, idx) => (
                <span
                  key={idx}
                  className="vn-sparkle-star"
                  style={{ left: sp.left, top: sp.top, animationDelay: sp.delay }}
                >
                  {sp.ch}
                </span>
              ))}
            </div>
          )}
          <StoryPortrait
            role="mahasiswa"
            studentId={agent.id}
            expression={expression}
            demographicLabel={agent.demographicLabel}
            name={agent.name}
            reducedMotion={reducedMotion}
            isSpeaker={studentSpeaking}
            isTyping={studentSpeaking && !typing.done}
            msSinceSpeakerChange={studentSpeaking ? msSinceSpeakerChange : Number.POSITIVE_INFINITY}
            facing="kiri"
            fluid
            reactionKind={reactionFx?.kind ?? null}
            dialogueText={beat?.text}
            isListening={!studentSpeaking}
            scale={4}
          />
          {/* Papan Nama Karakter Panggung Kanan (Mahasiswa) sesuai gambar referensi */}
          <div
            aria-hidden="true"
            className={`vn-stage-nameplate vn-stage-nameplate--right ${
              studentSpeaking ? 'vn-stage-nameplate--active' : ''
            }`}
            data-state={studentVisualState}
          >
            <span className="vn-stage-nameplate-icon">👤</span>
            <div className="vn-stage-nameplate-meta">
              <div className="flex items-center gap-1.5">
                <span className="vn-stage-nameplate-title">{agent.name}</span>
                <span
                  className={`vn-stage-state-dot vn-stage-state-dot--${studentVisualState}`}
                />
              </div>
              <span className="vn-stage-nameplate-role">{studentRoleSubtitle}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2b. Lapisan tepi meja laboratorium futuristik (foreground tabletop depth): buku log kiri, holopad tengah, & prop spesifik ruangan kanan */}
      <div
        className="vn-tabletop"
        data-desk-prop={roomConfig.deskPropKind}
        aria-hidden="true"
      >
        <div className="vn-tabletop-rim" />
        {/* Tumpukan buku log laboratorium di sisi kiri meja depan */}
        <div className="vn-desk-books">
          <div className="vn-desk-book vn-desk-book--top" />
          <div className="vn-desk-book vn-desk-book--bottom" />
        </div>
        {/* Tablet Holografik bercahaya di tengah meja depan */}
        <div className="vn-desk-holopad">
          <div className="vn-desk-holopad-grid" />
          <div className="vn-desk-holopad-bars">
            <span style={{ width: '38%' }} />
            <span style={{ width: '64%' }} />
            <span style={{ width: '52%' }} />
          </div>
        </div>
        {/* Lencana Instrumen Meja Spesifik Ruangan di sisi kanan meja depan */}
        <div className="vn-desk-room-tag">
          <span className="vn-desk-room-dot" />
          <span>{roomConfig.departmentTag}</span>
        </div>
      </div>

      {/* 3. Bilah atas 3 kolom simetris bergaya AAA Sci-Fi HUD sesuai gambar referensi */}
      <header className="vn-topbar">
        <div className="vn-topbar-left">
          {/* Emblem Brand RUANG DENGAR di kiri atas */}
          <div className="vn-brand-banner" aria-hidden="true">
            <span className="vn-brand-wave">
              <i style={{ height: '6px' }} />
              <i style={{ height: '12px' }} />
              <i style={{ height: '16px' }} />
              <i style={{ height: '10px' }} />
              <i style={{ height: '14px' }} />
            </span>
            <span className="vn-brand-divider">|</span>
            <span className="vn-brand-text">RUANG DENGAR</span>
          </div>

          <div className="vn-topbar-left-pills">
            <button
              type="button"
              className="vn-topbtn"
              aria-label={S.studentListAria}
              aria-expanded={drawer === 'left'}
              onClick={() => {
                playSfx('klik');
                setDrawer((d) => (d === 'left' ? null : 'left'));
              }}
            >
              <IconRelasi className="h-4 w-4 text-[#00E5FF]" />
              <span>{S.studentListTitle(listRows.length)}</span>
            </button>
            <span
              className="vn-energy-chip"
              data-tier={studentWellbeing.tier}
              title={`Energi ${agent.name} di lab saat ini`}
            >
              <span className="text-[#4ade80]">⚡</span>
              <span>Energi {studentWellbeing.energyPct}%</span>
            </span>
            {lastChoiceFeedback && (
              <span
                key={`delta-${lastChoiceFeedback.turn}-${lastChoiceFeedback.kind}`}
                role="status"
                className={`vn-energy-delta-pop inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-['Plus_Jakarta_Sans'] text-xs font-extrabold ${
                  lastChoiceFeedback.kind === 'tepat'
                    ? 'border-[#34d399] bg-[#064e3b]/95 text-[#a7f3d0]'
                    : 'border-[#f87171] bg-[#7f1d1d]/95 text-[#fecaca]'
                }`}
              >
                {lastChoiceFeedback.kind === 'tepat'
                  ? `+${lastChoiceFeedback.deltaPct}% ✓ Tepat`
                  : `${lastChoiceFeedback.deltaPct}% ✕ Salah`}
              </span>
            )}
          </div>
        </div>

        {/* MISSION OBJECTIVE PANEL (Tengah Atas) sesuai gambar referensi */}
        <div className="vn-topbar-center">
          {scene && (
            <div className="vn-location" data-testid="story-scene-caption">
              <div className="vn-location-header-row">
                <span className="vn-location-title">{displayedSceneTitle}</span>

                {isCompactMode && !state.ended && (
                  <div
                    className="vn-mission-progress-pill"
                    aria-label={`Langkah ${Math.min(7, state.turn + 1)} dari 7`}
                  >
                    <span className="inline-flex items-center gap-1.5" aria-hidden="true">
                      {[1, 2, 3, 4, 5, 6, 7].map((step) => {
                        const currentStep = Math.min(7, state.turn + 1);
                        const result = turnResults?.[step - 1];
                        const done = step < currentStep;
                        const active = step === currentStep;
                        return (
                          <span
                            key={step}
                            className={`vn-mission-dot ${
                              active
                                ? 'vn-mission-dot--active'
                                : done
                                  ? result === 'salah'
                                    ? 'vn-mission-dot--wrong'
                                    : 'vn-mission-dot--done'
                                  : ''
                            }`}
                          />
                        );
                      })}
                    </span>
                    <span className="vn-mission-step-num">
                      {Math.min(7, state.turn + 1)} / 7
                    </span>
                  </div>
                )}
              </div>

              <span className="vn-location-caption">{scene.caption}</span>

              <div className="vn-location-objective-pill">
                <span aria-hidden="true" className="text-[#FFBD59]">📍</span>
                <span>
                  {statusMessage
                    ? statusMessage
                    : isOpenUpMoment
                      ? `${agent.name.split(' ')[0]} mulai berani membuka ceritanya.`
                      : `Tiba di dekat ${agent.name}.`}
                </span>
              </div>
            </div>
          )}

          {empathyStreak >= 2 && !state.ended && (
            <div
              key={`streak-${empathyStreak}`}
              role="status"
              data-testid="vn-empathy-streak"
              className="vn-streak-badge"
            >
              <span>
                {empathyStreak >= 5
                  ? `💛 Koneksi Penuh ×${empathyStreak}!`
                  : empathyStreak >= 3
                    ? `🔥 Selaras ×${empathyStreak}`
                    : `✨ Empati Beruntun ×${empathyStreak}`}
              </span>
            </div>
          )}
          {otherCriticalAgent && (
            <div
              role="status"
              className="vn-status-pill !border-[#f87171] !bg-[#7f1d1d]/95 !text-[#fecaca]"
            >
              ⚠️ Di peta: {otherCriticalAgent.name.split(' ')[0]} tinggal {otherCriticalAgent.energyPct}%! · Hilang {lostCount}/{maxLost}
            </div>
          )}
          {helpOpen && (
            <div role="status" className="vn-status-pill">
              Tombol 1–{Math.max(2, choices.length)} memilih respons · Enter / Spasi melanjutkan · Esc menutup panel
            </div>
          )}
        </div>

        <div className="vn-topbar-right">
          <button
            type="button"
            className="vn-topbtn vn-topbtn--circle"
            aria-label={S.keyboardHelpTitle}
            aria-expanded={helpOpen}
            title={S.keyboardHelp}
            onClick={() => {
              playSfx('klik');
              setHelpOpen((v) => !v);
            }}
          >
            ?
          </button>
          {onToggleAudio && (
            <button
              type="button"
              className="vn-topbtn vn-topbtn--circle"
              aria-label={audioEnabled ? 'Matikan musik & suara' : 'Nyalakan musik & suara'}
              aria-pressed={audioEnabled === true}
              title={audioEnabled ? 'Musik & Suara Aktif (klik untuk mematikan)' : 'Nyalakan Musik Kampus & Suara'}
              onClick={onToggleAudio}
            >
              <span aria-hidden="true">{audioEnabled ? '🔊' : '🔇'}</span>
            </button>
          )}
          {onOpenSettings && (
            <button
              type="button"
              className="vn-topbtn vn-topbtn--circle"
              aria-label="Pengaturan"
              title="Pengaturan"
              onClick={() => {
                playSfx('klik');
                onOpenSettings();
              }}
            >
              ⚙
            </button>
          )}
          <button
            type="button"
            className="vn-topbtn"
            aria-label={S.profileCardAria}
            aria-expanded={drawer === 'right'}
            onClick={() => {
              playSfx('klik');
              setDrawer((d) => (d === 'right' ? null : 'right'));
            }}
          >
            <IconProfil className="h-4 w-4 text-[#FFBD59]" />
            <span>{agent.name.split(' ')[0]}</span>
          </button>
        </div>
      </header>

      {/* 4. Koridor percakapan tengah: Panel Dialog Stabil + Slot Respons Terpesan (0 Layout Shift!) */}
      {!showSummary && (
        <div className="vn-center-corridor" data-testid="vn-center-corridor">
          <VnDialogBox
            speakerName={beat ? speakerName : ''}
            text={beat ? typing.visible : ''}
            fullText={beat?.text}
            speakerSide={speakerSideOf(
              studentSpeaking ? 'mahasiswa' : counselorSpeaking ? 'dosen' : 'selingan',
              counselorSpeaking,
            )}
            isSpeaking={!typing.done && (counselorSpeaking || studentSpeaking)}
            cueText={inlineCueText}
            italic={!!beat?.italic}
            canContinue={(hasNextBeat || !typing.done) && !state.ended}
            auto={auto}
            endDisabled={state.ended}
            onAdvance={advance}
            onSkip={typing.skip}
            onToggleAuto={() => setAuto((v) => !v)}
            onOpenHistory={() => setHistoryOpen(true)}
            onSave={onSave}
            onLoad={onLoad}
            onEndSession={() => setConfirmEnd(true)}
          />

          <div
            className={`vn-choice-dock ${
              atChoices ? 'vn-choice-dock--visible' : 'vn-choice-dock--reserved'
            }`}
            aria-hidden={!atChoices}
          >
            {atChoices && (
              <>
                <div className="vn-choice-prompt" aria-hidden="true">
                  <span>💬 Pilih respons Ibu Dosen</span>
                </div>
                <VnChoices ref={choicesRef} choices={choices} onChoose={onChoose} />
              </>
            )}
          </div>
        </div>
      )}

      {/* 5. Ringkasan Misi saat cerita selesai */}
      {showSummary && state.outcome && (
        <div className="vn-summary-layer">
          <div className="flex max-h-full w-full max-w-xl flex-col gap-3">
            {state.ended && endSlot}
            <MissionSummaryCard
              studentId={agent.id}
              outcome={state.outcome}
              onViewDebrief={onViewDebrief}
              onReturnToLab={onReturnToLab}
            />
          </div>
        </div>
      )}

      {/* 7. Laci melayang simetris (Daftar Mahasiswa / Kartu Profil) */}
      {drawer && (
        <>
          <div
            className="vn-drawer-scrim"
            aria-hidden="true"
            onClick={() => setDrawer(null)}
          />
          <div
            className={`vn-drawer ${drawer === 'left' ? 'vn-drawer--left' : 'vn-drawer--right'}`}
            data-testid="story-drawer"
          >
            {drawer === 'left' ? (
              <StudentListPanel
                rows={listRows}
                activeId={agent.id}
                collapsed={false}
                onToggleCollapsed={() => setDrawer(null)}
                className="h-full w-full"
              />
            ) : (
              <ProfileCard
                profile={profile}
                collapsed={false}
                onToggleCollapsed={() => setDrawer(null)}
                onOpenLog={() => {
                  setDrawer(null);
                  setHistoryOpen(true);
                }}
                className="h-full w-full"
              />
            )}
          </div>
        </>
      )}

      {/* 8. Dialog konfirmasi akhiri sesi */}
      {confirmEnd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2c1a0e]/65 p-4 backdrop-blur-xs">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="story-end-title"
            aria-describedby="story-end-body"
            className="vn-box--solid fx-panel-in w-full max-w-md p-6"
          >
            <h2 id="story-end-title" className="mb-2 font-['Fredoka'] text-lg font-bold text-[#3e2517]">
              {S.endSessionConfirmTitle}
            </h2>
            <p id="story-end-body" className="mb-5 text-sm leading-relaxed text-[#5c3d26]">
              {S.endSessionConfirmBody}
            </p>
            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                autoFocus
                aria-label={S.endSessionConfirmNo}
                className="game-btn-secondary !px-4 text-sm"
                onClick={() => setConfirmEnd(false)}
              >
                {S.endSessionConfirmNo}
              </button>
              <button
                type="button"
                aria-label={S.endSessionConfirmYes}
                className="game-btn-primary !px-5 text-sm"
                onClick={confirmAndEnd}
              >
                {S.endSessionConfirmYes}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. Modal riwayat percakapan */}
      {historyOpen && (
        <StoryHistoryPanel
          entries={state.history}
          graph={graph}
          studentName={agent.name}
          reducedMotion={reducedMotion}
          onClose={() => setHistoryOpen(false)}
        />
      )}
    </div>
  );
}

export default StoryScreen;
