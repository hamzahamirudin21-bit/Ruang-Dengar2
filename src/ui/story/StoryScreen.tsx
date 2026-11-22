import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { STRINGS } from '../../data/strings';
import type { StoryArrival, StoryOutcome, StoryRunnerState } from '../../engine/story/runner';
import { presentChoices } from '../../engine/story/runner';
import type { StoryExpression, StoryGraph, StoryScene } from '../../engine/story/storyTypes';
import type { MissionRecord } from '../../engine/story/saveSlot';
import type { StudentAgent, ZoneType } from '../../types';
import { dosenExpressionFor } from '../characters/dosenPortrait';
import { playSfx } from '../motion/sfx';
import { IconProfil, IconRelasi } from '../components/GameIcons';
import { classifyAgentWellbeing } from '../../engine/isolationMission';
import { signalForStudent } from '../../engine/storySignals';
import { resolveSceneArt, sceneVariantForGraph } from '../scene/sceneArt';
import type { SceneVariant } from '../scene/sceneArt';
import { STORY_PALETTE as P } from './palette';
import { ProfileCard } from './ProfileCard';
import { StoryHistoryPanel } from './StoryHistoryPanel';
import { EmoteBubble } from './EmoteBubble';
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
    if (reducedMotion) return;
    const startedAt = Date.now();
    const id = window.setInterval(() => setElapsed(Date.now() - startedAt), 33);
    return () => window.clearInterval(id);
  }, [resetKey, reducedMotion]);

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

  return (
    <section
      role="region"
      aria-label={S.summaryCardTitle}
      className="vn-box--solid max-h-full w-full max-w-xl overflow-y-auto p-6"
      data-testid="story-mission-summary"
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b pb-3" style={{ borderColor: 'var(--vnp-border)' }}>
        <h2 className="text-lg font-extrabold" style={{ color: 'var(--vn-navy)' }}>
          {S.summaryCardTitle}
        </h2>
        <span
          className="rounded-full px-3 py-1 text-xs font-bold"
          style={{
            background: outcome.kind === 'terbantu' ? '#1b5e4a' : outcome.kind === 'kemajuan-kecil' ? '#1d5d7a' : '#8f3451',
            color: '#ffffff',
          }}
        >
          {S.outcomeLabels[outcome.kind]}
        </span>
      </div>

      {outcome.kind === 'terbantu' && (
        <div
          className="mb-3.5 rounded-[4px_14px_4px_14px] border-2 p-3"
          style={{ borderColor: '#e5ac3f', background: '#fff8e6' }}
          data-testid="story-unlocked-card"
        >
          <p className="font-['Outfit'] text-[11px] font-extrabold uppercase tracking-wider" style={{ color: '#9a640b' }}>
            ✦ Kisah Terungkap di Jurnal Lab
          </p>
          <p className="mt-0.5 font-['Outfit'] text-sm font-black" style={{ color: 'var(--vn-navy)' }}>
            “{storySignal.unlockedTitle}”
          </p>
          <p className="mt-1 text-xs leading-relaxed" style={{ color: 'var(--vnp-ink)' }}>
            {storySignal.unlockedExcerpt}
          </p>
        </div>
      )}

      <p className="text-sm leading-relaxed" style={{ color: 'var(--vnp-ink)' }}>
        {outcome.summaryBody}
      </p>

      {outcome.reasons.length > 0 && (
        <div className="mt-4">
          <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--vnp-ink-muted)' }}>
            {S.summaryReasonsTitle}
          </h3>
          <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm" style={{ color: 'var(--vnp-ink)' }}>
            {outcome.reasons.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl border p-3 text-sm" style={{ borderColor: 'var(--vnp-border)', background: 'rgba(255,255,255,0.55)' }}>
        <div>
          <span className="block text-xs font-semibold" style={{ color: 'var(--vnp-ink-muted)' }}>
            {S.summaryEnergyLabel}
          </span>
          <span className="font-bold" style={{ color: 'var(--vnp-ink)' }}>
            {energy} ({energySigned})
          </span>
        </div>
        <div>
          <span className="block text-xs font-semibold" style={{ color: 'var(--vnp-ink-muted)' }}>
            {S.summaryStressLabel}
          </span>
          <span className="font-bold" style={{ color: 'var(--vnp-ink)' }}>
            {stress}
          </span>
        </div>
      </div>

      <p className="mt-4 text-xs leading-relaxed" style={{ color: 'var(--vnp-ink-muted)' }}>
        {canFollowUp ? S.followUpNote : S.missionCompleteNote}
      </p>

      <div className="mt-5 flex flex-wrap justify-end gap-2.5">
        <button
          type="button"
          className="vn-topbtn !min-h-[40px] !px-5 !text-sm"
          style={
            onReturnToLab
              ? { background: '#efe5d0', color: 'var(--vn-navy)', borderColor: '#0f1b33' }
              : { background: P.accent, color: '#ffffff' }
          }
          aria-label={S.viewDebriefAria}
          onClick={onViewDebrief}
        >
          {onReturnToLab ? 'Lihat Refleksi' : S.viewDebriefBtn}
        </button>
        {onReturnToLab && (
          <button
            type="button"
            className="vn-topbtn !min-h-[40px] !px-6 !text-sm"
            style={{ background: P.accent, color: '#ffffff' }}
            onClick={onReturnToLab}
          >
            Kembali ke Lab →
          </button>
        )}
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

  // Rangkaian beat koheren: Ucapan Dosen -> Reaksi Mahasiswa -> Lanjutan Simpul Baru (bila belum tercakup)
  const beats = useMemo<StoryBeat[]>(() => {
    const last = state.history[state.history.length - 1];
    const prev = state.history.length >= 2 ? state.history[state.history.length - 2] : undefined;
    const prevNodeId = arrival?.fromNodeId ?? last?.fromNodeId ?? prev?.nodeId ?? null;
    const source: BeatSource | null = arrival
      ? { counselorLine: arrival.counselorLine, student: arrival.student }
      : last
        ? { counselorLine: last.counselorLine, student: last.studentLine }
        : null;
    if (!source) return [];
    const result = buildBeats(source);
    const followUp = followUpReplyFor(graph, state.nodeId, source.student, prevNodeId);
    if (followUp) {
      result.push(...buildBeats({ counselorLine: null, student: followUp }));
    }
    return result;
  }, [arrival, state.history, state.nodeId, graph]);

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

  const [msSinceSpeakerChange, setMsSinceSpeakerChange] = useState(Number.POSITIVE_INFINITY);
  useEffect(() => {
    if (reducedMotion) {
      setMsSinceSpeakerChange(Number.POSITIVE_INFINITY);
      return;
    }
    const startedAt = Date.now();
    setMsSinceSpeakerChange(0);
    const id = window.setInterval(() => {
      const ms = Date.now() - startedAt;
      if (ms >= 320) {
        window.clearInterval(id);
        setMsSinceSpeakerChange(Number.POSITIVE_INFINITY);
      } else {
        setMsSinceSpeakerChange(ms);
      }
    }, 33);
    return () => window.clearInterval(id);
  }, [speakerKey, reducedMotion]);

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

  return (
    <div
      ref={rootRef}
      className={`vn-stage fixed inset-0 z-40 ${className ?? ''}`}
      data-mood={stageMood}
      data-testid="story-screen"
    >
      {/* 1. Latar adegan selebar layar dengan atmosfer sinematik */}
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
      {/* 1b. Pencahayaan emosi panggung halus berbasis ekspresi terlihat */}
      <div className="vn-mood-layer" aria-hidden="true" />

      {/* 2. Dua karakter simetris saling berhadapan: Dosen (kiri -> menghadap kanan), Mahasiswa (kanan -> menghadap kiri) */}
      <div className="vn-cast">
        <div
          className={`vn-char vn-char--left ${counselorSpeaking ? 'vn-char--active' : 'vn-char--idle'}`}
        >
          <StoryPortrait
            role="dosen"
            expression={dosenExpression}
            reducedMotion={reducedMotion}
            isSpeaker={counselorSpeaking}
            isTyping={counselorSpeaking && !typing.done}
            msSinceSpeakerChange={counselorSpeaking ? msSinceSpeakerChange : Number.POSITIVE_INFINITY}
            facing="kanan"
            fluid
            scale={4}
          />
        </div>

        <div
          className={`vn-char vn-char--right ${studentSpeaking ? 'vn-char--active' : 'vn-char--idle'}`}
        >
          <div className="absolute left-1/2 top-2 z-10 -translate-x-1/2">
            <EmoteBubble emote={emoteState.id} triggerKey={emoteState.key} reducedMotion={reducedMotion} />
          </div>
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
            scale={4}
          />
        </div>
      </div>

      {/* 3. Bilah atas 3 kolom simetris yang bersih dan imersif (tanpa label teori!) */}
      <header className="vn-topbar">
        <div className="vn-topbar-left">
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
            <IconRelasi className="h-4 w-4" />
            <span>{S.studentListTitle(listRows.length)}</span>
          </button>
          <span
            className="vn-energy-chip"
            data-tier={studentWellbeing.tier}
            title={`Energi ${agent.name} di lab saat ini`}
          >
            ⚡ Energi {studentWellbeing.energyPct}%
          </span>
        </div>

        <div className="vn-topbar-center">
          {scene && (
            <div className="vn-location" data-testid="story-scene-caption">
              <span className="vn-location-title">{scene.title}</span>
              <span className="vn-location-caption">{scene.caption}</span>
            </div>
          )}

          {helpOpen && (
            <div role="status" className="vn-status-pill">
              Tombol 1–3 memilih respons · Enter / Spasi melanjutkan dialog · Esc menutup panel
            </div>
          )}
          {!helpOpen && statusMessage && (
            <p role="status" className="vn-status-pill">
              {statusMessage}
            </p>
          )}
          {!helpOpen && !statusMessage && isOpenUpMoment && (
            <p role="status" className="vn-status-pill">
              ✦ {agent.name.split(' ')[0]} mulai berani membuka ceritanya...
            </p>
          )}
        </div>

        <div className="vn-topbar-right">
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
            <IconProfil className="h-4 w-4" />
            <span>{agent.name.split(' ')[0]}</span>
          </button>
          <button
            type="button"
            className="vn-topbtn !w-9 !px-0"
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
        </div>
      </header>

      {/* 4. Lapisan pilihan simetris di tengah layar (dengan scrim di bawah kotak dialog) */}
      {atChoices && (
        <div className="vn-choice-layer">
          <div className="vn-scrim" aria-hidden="true" />
          <VnChoices ref={choicesRef} choices={choices} onChoose={onChoose} />
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

      {/* 6. Kotak dialog VN di tengah bawah */}
      <VnDialogBox
        speakerName={beat ? speakerName : ''}
        text={beat ? typing.visible : ''}
        fullText={beat?.text}
        speakerSide={speakerSideOf(
          studentSpeaking ? 'mahasiswa' : counselorSpeaking ? 'dosen' : 'selingan',
          counselorSpeaking,
        )}
        isSpeaking={!typing.done && (counselorSpeaking || studentSpeaking)}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-xs">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="story-end-title"
            aria-describedby="story-end-body"
            className="vn-box--solid w-full max-w-md p-6"
          >
            <h2 id="story-end-title" className="mb-2 text-base font-extrabold" style={{ color: 'var(--vn-navy)' }}>
              {S.endSessionConfirmTitle}
            </h2>
            <p id="story-end-body" className="mb-5 text-sm leading-relaxed" style={{ color: 'var(--vnp-ink)' }}>
              {S.endSessionConfirmBody}
            </p>
            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                autoFocus
                aria-label={S.endSessionConfirmNo}
                className="vn-topbtn"
                style={{ background: '#e8dcc6', color: 'var(--vnp-ink)', borderColor: 'var(--vnp-border-strong)' }}
                onClick={() => setConfirmEnd(false)}
              >
                {S.endSessionConfirmNo}
              </button>
              <button
                type="button"
                aria-label={S.endSessionConfirmYes}
                className="vn-topbtn"
                style={{ background: P.accent, color: '#ffffff' }}
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
