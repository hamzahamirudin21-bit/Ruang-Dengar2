/**
 * Debrief: bagian fungsi murni (tugas 7.1).
 * Komponen React `DebriefDashboard` ditambahkan pada berkas ini di tugas 7.2.
 *
 * Gerbang variabel tersembunyi berada di tingkat data: sebelum sesi selesai,
 * `buildDebriefProps` hanya mengembalikan `{ status: 'belum-selesai' }` tanpa
 * menyentuh data agen. `buildHiddenReveal` tidak pernah dipanggil dari
 * `buildDebriefProps`; hanya dipanggil saat pengguna menekan "Ungkap".
 */
import React, { useCallback, useMemo, useState } from 'react';
import { CONTACT_CHANNELS } from '../data/contactChannels';
import { RUBRIC_CONFIG, STRATEGY_PRESETS } from '../data/rubric';
import { STRINGS } from '../data/strings';
import { getAgentHiddenProblemProfile } from '../data/skillEffects';
import { analyzeSociometryNetwork } from '../engine/network';
import { analyzeSession } from '../engine/rubric';
import { buildAgentSessionVars } from '../engine/trust';
import type {
  ContactChannelId,
  DailySociometrySnapshot,
  DebriefSessionRecord,
  DebriefSociogramPanel,
  DebriefView,
  ExportPayload,
  HiddenReveal,
  KeyPoint,
  ReplayComparison,
  RubricConfig,
  SessionState,
  StudentAgent,
} from '../types';

/* ------------------------------------------------------------------ */
/* Tipe                                                                */
/* ------------------------------------------------------------------ */

export type DebriefProps =
  | { status: 'belum-selesai' }
  | { status: 'selesai'; view: DebriefView };

export type ReplayViewOutcome =
  | { ok: true; comparison: ReplayComparison }
  | { ok: false; message: string };

/* ------------------------------------------------------------------ */
/* Gerbang                                                             */
/* ------------------------------------------------------------------ */

/** Session_Complete: sesi tertutup, atau pengguna menekan tombol tutup sesi. */
export function isSessionComplete(
  session: SessionState | null | undefined,
  finishedByUser: boolean
): boolean {
  if (finishedByUser === true) return true;
  return !!session && session.closed === true;
}

/* ------------------------------------------------------------------ */
/* Sosiogram ego-network                                               */
/* ------------------------------------------------------------------ */

function buildSociogramPanel(
  snapshot: DailySociometrySnapshot,
  isLivePreview: boolean,
  targetId: string,
  record: DebriefSessionRecord
): DebriefSociogramPanel {
  const { agents, observationLog } = record.sociometry;
  const stats = analyzeSociometryNetwork(snapshot, agents, observationLog);
  const metrics = stats.nodeMetrics[targetId] ?? null;

  const nameOf = new Map(agents.map((a) => [a.id, a.name]));
  const outgoing = metrics ? metrics.outgoingToIds : [];
  const incoming = metrics ? metrics.incomingFromIds : [];

  const ids: string[] = [targetId];
  for (const id of [...outgoing, ...incoming]) {
    if (!ids.includes(id)) ids.push(id);
  }
  const nodes = ids.map((id) => ({
    id,
    name: id === targetId ? record.session.agentName : nameOf.get(id) ?? id,
  }));

  const choicesByAgent: Record<string, string[]> = {};
  if (outgoing.length > 0) choicesByAgent[targetId] = [...outgoing];
  for (const from of incoming) {
    choicesByAgent[from] = [...(choicesByAgent[from] ?? []), targetId];
  }

  return {
    day: snapshot.day,
    isLivePreview,
    nodes,
    choicesByAgent,
    stats: metrics
      ? {
          receivedCount: metrics.receivedCount,
          sentCount: metrics.sentCount,
          mutualCount: metrics.mutualCount,
          status: metrics.status,
        }
      : null,
  };
}

function buildSociogramPanels(
  record: DebriefSessionRecord,
  targetId: string
): { day1: DebriefSociogramPanel | null; dayN: DebriefSociogramPanel | null } {
  const snaps = [...record.sociometry.snapshots].sort((a, b) => a.day - b.day);
  const live = record.sociometry.livePreview;

  const day1 = snaps.length > 0 ? buildSociogramPanel(snaps[0], false, targetId, record) : null;

  let dayN: DebriefSociogramPanel | null = null;
  if (snaps.length >= 2) {
    dayN = buildSociogramPanel(snaps[snaps.length - 1], false, targetId, record);
  } else if (live) {
    dayN = buildSociogramPanel(live, true, targetId, record);
  }
  return { day1, dayN };
}

/* ------------------------------------------------------------------ */
/* buildDebriefProps                                                   */
/* ------------------------------------------------------------------ */

/**
 * Membangun props Debrief. Bila sesi belum selesai, mengembalikan
 * `{ status: 'belum-selesai' }` tanpa menghitung apa pun dan tanpa membaca
 * `record.init.agent`. Bila selesai, `view` tidak memuat variabel tersembunyi.
 */
export function buildDebriefProps(
  record: DebriefSessionRecord | null,
  finishedByUser: boolean = record?.finishedByUser ?? false,
  config: RubricConfig = RUBRIC_CONFIG
): DebriefProps {
  if (!record || !isSessionComplete(record.session, finishedByUser)) {
    return { status: 'belum-selesai' };
  }

  const analysis = analyzeSession(record, config);
  const agentId = record.session.agentId;
  const panels = buildSociogramPanels(record, agentId);
  const hasTranscript = analysis.transcript.length > 0;

  const view: DebriefView = {
    agentId,
    agentName: record.session.agentName,
    day: record.init.context.day,
    channelId: record.session.channelContext.channelId,
    transcript: analysis.transcript,
    trustSeries: analysis.trustSeries,
    keyPoints: analysis.keyPoints,
    episodes: analysis.episodes,
    highestLevel: analysis.highestLevel,
    contactChannel: {
      chosen: analysis.contactFit.chosen,
      best: analysis.contactFit.best,
      explanation: analysis.contactFit.explanation,
    },
    rubric: analysis.rubric,
    feedback: analysis.feedback,
    sociogramDay1: panels.day1,
    sociogramDayN: panels.dayN,
    hypotheses: record.hypotheses.filter((h) => h.agentId === agentId),
    hypothesisVerdicts: analysis.hypothesisVerdicts,
    replayPresets: STRATEGY_PRESETS.map((p) => ({
      id: p.id,
      label: p.label,
      description: p.description,
    })),
    replayable: record.replayable && hasTranscript,
    replayBlockedReason: record.replayBlockedReason,
  };

  return { status: 'selesai', view };
}

/* ------------------------------------------------------------------ */
/* buildHiddenReveal                                                   */
/* ------------------------------------------------------------------ */

const HESITATION_THRESHOLD = 0.55;

function buildHesitationReasons(
  agent: StudentAgent,
  vars: ReturnType<typeof buildAgentSessionVars>,
  record: DebriefSessionRecord
): string[] {
  const reasons: string[] = [];
  if (vars.selfStigma >= HESITATION_THRESHOLD) {
    reasons.push('Stigma diri yang tinggi membuat bercerita terasa berisiko.');
  }
  if (vars.socialAnxiety >= HESITATION_THRESHOLD) {
    reasons.push('Kecemasan sosial yang tinggi membuat berbicara dengan orang lain terasa berat.');
  }
  if (vars.gossipSensitivity >= HESITATION_THRESHOLD) {
    reasons.push('Kepekaan terhadap gosip membuat ia khawatir ceritanya menyebar.');
  }
  if (vars.selfReliance >= HESITATION_THRESHOLD) {
    reasons.push('Kebiasaan menyelesaikan masalah sendiri membuat ia enggan meminta bantuan.');
  }
  const ruptures = record.session.rupture.ruptureCountInSession;
  const repaired = record.session.rupture.repairedCountInSession;
  if (ruptures > 0) {
    reasons.push(
      repaired >= ruptures
        ? 'Terjadi keretakan hubungan pada sesi ini; sudah diperbaiki, tetapi rasa waspada dapat bertahan.'
        : 'Terjadi keretakan hubungan pada sesi ini yang belum sepenuhnya pulih, sehingga ia makin berhati-hati.'
    );
  }
  void agent;
  return reasons;
}

/** Hanya dipanggil saat pengguna menekan tombol ungkap. */
export function buildHiddenReveal(record: DebriefSessionRecord): HiddenReveal {
  const agent = record.init.agent;
  const vars = buildAgentSessionVars(agent, record.init.exposure);
  const problem = getAgentHiddenProblemProfile(agent);
  return {
    selfStigma: vars.selfStigma,
    socialAnxiety: vars.socialAnxiety,
    selfReliance: vars.selfReliance,
    gossipSensitivity: vars.gossipSensitivity,
    problem: {
      categoryLabel: problem.categoryLabel,
      l1Fact: problem.l1Fact,
      l2Feeling: problem.l2Feeling,
      l3CoreNeed: problem.l3CoreNeed,
    },
    primaryConcernSummary: agent.hiddenVars.primaryConcernSummary,
    hesitationReasons: buildHesitationReasons(agent, vars, record),
  };
}

/* ------------------------------------------------------------------ */
/* buildExportPayload                                                  */
/* ------------------------------------------------------------------ */

/** `hidden` hanya disertakan bila diberikan non-null. */
export function buildExportPayload(view: DebriefView, hidden: HiddenReveal | null): ExportPayload {
  const payload: ExportPayload = {
    transcript: view.transcript,
    keyPoints: view.keyPoints,
    rubric: {
      items: view.rubric.items,
      total: view.rubric.total,
      descriptor: view.rubric.totalDescriptor,
    },
    feedback: view.feedback,
    contactChannel: { ...view.contactChannel },
  };
  if (hidden) payload.hidden = hidden;
  return payload;
}

/* ------------------------------------------------------------------ */
/* Geometri grafik kepercayaan                                         */
/* ------------------------------------------------------------------ */

export interface TrustChartSize {
  width: number;
  height: number;
  pad?: number;
}

export interface TrustChartPoint {
  turn: number;
  trust: number;
  x: number;
  y: number;
}

export interface TrustChartMarker {
  kind: 'keretakan' | 'perbaikan';
  turnNumber: number;
  x: number;
  y: number;
}

export interface TrustChartGeometry {
  viewBox: string;
  points: TrustChartPoint[];
  /** Nilai atribut `points` untuk <polyline> */
  polyline: string;
  markers: TrustChartMarker[];
}

/**
 * Sumbu x: giliran 0..n linear ke [pad, width - pad]. Sumbu y: 0..100 dibalik
 * ke [height - pad, pad]. Aman untuk deret kosong dan satu titik.
 */
export function buildTrustChartGeometry(
  trustSeries: readonly number[],
  keyPoints: readonly KeyPoint[],
  size: TrustChartSize
): TrustChartGeometry {
  const { width, height } = size;
  const pad = size.pad ?? 16;
  const innerW = Math.max(0, width - 2 * pad);
  const innerH = Math.max(0, height - 2 * pad);
  const span = Math.max(1, trustSeries.length - 1);

  const xAt = (turn: number) => pad + (innerW * turn) / span;
  const yAt = (trust: number) => {
    const t = Number.isFinite(trust) ? Math.max(0, Math.min(100, trust)) : 0;
    return height - pad - (innerH * t) / 100;
  };

  const points: TrustChartPoint[] = trustSeries.map((trust, turn) => ({
    turn,
    trust,
    x: xAt(turn),
    y: yAt(trust),
  }));

  const markers: TrustChartMarker[] = [];
  for (const kp of keyPoints) {
    if (kp.kind !== 'keretakan' && kp.kind !== 'perbaikan') continue;
    const point = points[kp.turnNumber];
    if (!point) continue;
    markers.push({ kind: kp.kind, turnNumber: kp.turnNumber, x: point.x, y: point.y });
  }

  return {
    viewBox: `0 0 ${width} ${height}`,
    points,
    polyline: points.map((p) => `${p.x},${p.y}`).join(' '),
    markers,
  };
}

/* ================================================================== */
/* Komponen React (tugas 7.2)                                          */
/* ================================================================== */

const D = STRINGS.debrief;

export interface DebriefDashboardProps {
  props: DebriefProps;
  /** Dipanggil saat pengguna menekan "Ungkap"; data tersembunyi tidak pernah masuk sebagai props. */
  onRevealRequest: () => HiddenReveal | null;
  /** Menjalankan putar ulang dan mengembalikan hasil perbandingan saja. */
  onRequestReplay: (presetId: string) => ReplayViewOutcome;
  onClose: () => void;
  /** Hanya untuk uji. */
  defaultRevealed?: HiddenReveal;
}

const RUBRIC_ITEM_ORDER: readonly import('../types').RubricItemId[] = [
  'sasaran',
  'jalur-kontak',
  'kualitas-pertanyaan',
  'kesalahan-fatal',
  'keretakan-perbaikan',
  'kerahasiaan-peran',
  'ritme',
  'catatan-pengamatan',
];

const SECTION_CLASS =
  'space-y-3 rounded-[22px] border-[2.5px] border-[#3e2517] bg-[#fffdf7] p-4 sm:p-5 shadow-[inset_0_-4px_0_#edd9b4,0_5px_0_#3e2517]';
const H2_CLASS = "font-['Fredoka'] text-base font-bold text-[#3e2517]";
const MUTED_CLASS = 'text-[11px] leading-relaxed text-[#6b482e]';
const BTN_CLASS =
  'game-btn-secondary !min-h-[2.1rem] !px-4 text-xs whitespace-nowrap';
const BTN_PRIMARY_CLASS =
  'game-btn-primary !min-h-[2.1rem] !px-4 text-xs whitespace-nowrap';

function channelName(id: ContactChannelId): string {
  return CONTACT_CHANNELS.find((c) => c.id === id)?.name ?? id;
}

function turnLabel(n: number): string {
  return n === 0 ? D.openingSessionLabel : D.turnPrefix(n);
}

function pct(v: number): string {
  return `${Math.round(v * 100)}%`;
}

function signed(n: number): string {
  return n > 0 ? `+${n}` : `${n}`;
}

/* ---------------- Grafik kepercayaan ---------------- */

const CHART_W = 360;
const CHART_H = 160;
const CHART_PAD = 28;

const TrustChart: React.FC<{
  series: readonly number[];
  keyPoints: readonly KeyPoint[];
  color?: string;
  caption?: string;
}> = ({ series, keyPoints, color = 'var(--ui-accent)', caption }) => {
  const geo = useMemo(
    () => buildTrustChartGeometry(series, keyPoints, { width: CHART_W, height: CHART_H, pad: CHART_PAD }),
    [series, keyPoints]
  );
  const turnCount = Math.max(0, series.length - 1);
  const yTicks = [0, 50, 100];
  const yOf = (t: number) => CHART_H - CHART_PAD - ((CHART_H - 2 * CHART_PAD) * t) / 100;
  return (
    <figure className="space-y-1">
      {caption && <figcaption className="text-[11px] font-semibold text-[var(--ui-text)]">{caption}</figcaption>}
      <svg
        viewBox={geo.viewBox}
        role="img"
        aria-label={D.chart.ariaLabel(turnCount)}
        className="h-auto w-full max-w-md"
      >
        {yTicks.map((t) => (
          <g key={t}>
            <line x1={CHART_PAD} x2={CHART_W - CHART_PAD} y1={yOf(t)} y2={yOf(t)} stroke="#cbd5e1" strokeWidth={0.5} />
            <text x={CHART_PAD - 4} y={yOf(t) + 3} fontSize={9} textAnchor="end" fill="#64748b">
              {t}
            </text>
          </g>
        ))}
        <line x1={CHART_PAD} x2={CHART_PAD} y1={CHART_PAD} y2={CHART_H - CHART_PAD} stroke="#64748b" />
        <line x1={CHART_PAD} x2={CHART_W - CHART_PAD} y1={CHART_H - CHART_PAD} y2={CHART_H - CHART_PAD} stroke="#64748b" />
        <text x={CHART_W / 2} y={CHART_H - 4} fontSize={9} textAnchor="middle" fill="#64748b">
          {D.chart.xAxisLabel} (0–{turnCount})
        </text>
        <text x={8} y={CHART_H / 2} fontSize={9} textAnchor="middle" fill="#64748b" transform={`rotate(-90 8 ${CHART_H / 2})`}>
          {D.chart.yAxisLabel}
        </text>
        {geo.points.length > 1 && <polyline points={geo.polyline} fill="none" stroke={color} strokeWidth={2} />}
        {geo.points.map((p) => (
          <circle key={p.turn} cx={p.x} cy={p.y} r={2.5} fill={color} />
        ))}
        {geo.markers.map((m) =>
          m.kind === 'keretakan' ? (
            <path
              key={`${m.kind}-${m.turnNumber}`}
              d={`M${m.x - 5} ${m.y - 5} L${m.x + 5} ${m.y + 5} M${m.x + 5} ${m.y - 5} L${m.x - 5} ${m.y + 5}`}
              stroke="#dc2626"
              strokeWidth={2}
            />
          ) : (
            <rect
              key={`${m.kind}-${m.turnNumber}`}
              x={m.x - 4}
              y={m.y - 4}
              width={8}
              height={8}
              fill="none"
              stroke="#15803d"
              strokeWidth={2}
            />
          )
        )}
      </svg>
      <p className={MUTED_CLASS}>
        <span className="font-semibold">{D.chart.legendTitle}:</span>{' '}
        <span aria-hidden="true">✕</span> {D.chart.ruptureMarker}; <span aria-hidden="true">□</span>{' '}
        {D.chart.repairMarker}.
      </p>
      <table className="sr-only">
        <caption>{D.chart.ariaLabel(turnCount)}</caption>
        <thead>
          <tr>
            <th scope="col">{D.turnLabel}</th>
            <th scope="col">{D.chart.yAxisLabel}</th>
          </tr>
        </thead>
        <tbody>
          {series.map((t, i) => (
            <tr key={i}>
              <th scope="row">{i === 0 ? D.chart.startLabel : D.turnPrefix(i)}</th>
              <td>{Math.round(t)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
};

/* ---------------- Sosiogram ego ---------------- */

const SociogramEgo: React.FC<{ panel: DebriefSociogramPanel | null; title: string; targetId: string }> = ({
  panel,
  title,
  targetId,
}) => {
  if (!panel) {
    return (
      <div className="rounded-lg border border-dashed border-[var(--ui-border)] p-3">
        <h3 className="text-xs font-bold text-[var(--ui-text)]">{title}</h3>
        <p className={MUTED_CLASS}>{D.sociogram.dayNUnavailable}</p>
      </div>
    );
  }
  const W = 240;
  const H = 200;
  const cx = W / 2;
  const cy = H / 2;
  const others = panel.nodes.filter((n) => n.id !== targetId);
  const pos = new Map<string, { x: number; y: number }>([[targetId, { x: cx, y: cy }]]);
  others.forEach((n, i) => {
    const a = (2 * Math.PI * i) / Math.max(1, others.length) - Math.PI / 2;
    pos.set(n.id, { x: cx + 80 * Math.cos(a), y: cy + 75 * Math.sin(a) });
  });
  const edges: { from: string; to: string }[] = [];
  for (const [from, tos] of Object.entries(panel.choicesByAgent)) {
    for (const to of tos) if (pos.has(from) && pos.has(to)) edges.push({ from, to });
  }
  const s = panel.stats;
  const heading = panel.isLivePreview ? `${title} (${D.sociogram.previewLabel})` : title;
  return (
    <div className="space-y-1 rounded-lg border border-[var(--ui-border)] p-3">
      <h3 className="text-xs font-bold text-[var(--ui-text)]">{heading}</h3>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={heading} className="h-auto w-full">
        <defs>
          <marker id={`arrow-${panel.day}-${panel.isLivePreview ? 'p' : 's'}`} markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0 0 L6 3 L0 6 z" fill="#64748b" />
          </marker>
        </defs>
        {edges.map((e, i) => {
          const a = pos.get(e.from)!;
          const b = pos.get(e.to)!;
          return (
            <line
              key={i}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke="#64748b"
              strokeWidth={1}
              markerEnd={`url(#arrow-${panel.day}-${panel.isLivePreview ? 'p' : 's'})`}
            />
          );
        })}
        {panel.nodes.map((n) => {
          const p = pos.get(n.id)!;
          const isTarget = n.id === targetId;
          return (
            <g key={n.id}>
              <circle cx={p.x} cy={p.y} r={isTarget ? 9 : 6} fill={isTarget ? '#2563eb' : '#e2e8f0'} stroke="#334155" />
              <text x={p.x} y={p.y + (isTarget ? 20 : 16)} fontSize={8} textAnchor="middle" fill="#0f172a">
                {n.name}
              </text>
            </g>
          );
        })}
      </svg>
      {s && (
        <dl className="grid grid-cols-2 gap-x-3 text-[11px] text-[var(--ui-text-muted)]">
          <dt>{D.sociogram.receivedLabel}</dt>
          <dd className="font-mono-data text-[var(--ui-text)]">{s.receivedCount}</dd>
          <dt>{D.sociogram.sentLabel}</dt>
          <dd className="font-mono-data text-[var(--ui-text)]">{s.sentCount}</dd>
          <dt>{D.sociogram.mutualLabel}</dt>
          <dd className="font-mono-data text-[var(--ui-text)]">{s.mutualCount}</dd>
          <dt>{D.sociogram.statusLabel}</dt>
          <dd className="text-[var(--ui-text)]">{s.status}</dd>
        </dl>
      )}
    </div>
  );
};

/* ---------------- Hal tersembunyi ---------------- */

const HiddenPanel: React.FC<{ hidden: HiddenReveal }> = ({ hidden }) => {
  const H = D.hidden;
  const vars: [string, number][] = [
    [H.selfStigmaLabel, hidden.selfStigma],
    [H.socialAnxietyLabel, hidden.socialAnxiety],
    [H.selfEfficacyLabel, hidden.selfReliance],
    [H.gossipSensitivityLabel, hidden.gossipSensitivity],
  ];
  return (
    <div className="space-y-3" data-testid="debrief-hidden">
      <p className={MUTED_CLASS}>{H.intro}</p>
      <h3 className="text-xs font-bold text-[var(--ui-text)]">{H.variablesTitle}</h3>
      <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
        {vars.map(([label, v]) => (
          <React.Fragment key={label}>
            <dt className="text-[var(--ui-text-muted)]">{label}</dt>
            <dd className="font-mono-data font-semibold text-[var(--ui-text)]">{pct(v)}</dd>
          </React.Fragment>
        ))}
      </dl>
      <h3 className="text-xs font-bold text-[var(--ui-text)]">{H.problemTitle}</h3>
      <dl className="space-y-1 text-xs">
        {(
          [
            [H.problemCategoryLabel, hidden.problem.categoryLabel],
            [H.problemL1Label, hidden.problem.l1Fact],
            [H.problemL2Label, hidden.problem.l2Feeling],
            [H.problemL3Label, hidden.problem.l3CoreNeed],
            [H.problemSummaryLabel, hidden.primaryConcernSummary],
          ] as [string, string][]
        ).map(([label, v]) => (
          <div key={label}>
            <dt className="text-[var(--ui-text-muted)]">{label}</dt>
            <dd className="text-[var(--ui-text)]">{v}</dd>
          </div>
        ))}
      </dl>
      <h3 className="text-xs font-bold text-[var(--ui-text)]">{H.hesitationTitle}</h3>
      {hidden.hesitationReasons.length === 0 ? (
        <p className={MUTED_CLASS}>{H.noHesitationReasons}</p>
      ) : (
        <ul className="list-disc space-y-1 pl-5 text-xs text-[var(--ui-text)]">
          {hidden.hesitationReasons.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

/* ---------------- Putar ulang ---------------- */

const ReplayResult: React.FC<{
  view: DebriefView;
  cmp: ReplayComparison;
}> = ({ view, cmp }) => {
  const R = D.replay;
  const preset = view.replayPresets.find((p) => p.id === cmp.presetId);
  return (
    <div className="space-y-3" data-testid="debrief-replay-result">
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <h3 className="text-xs font-bold text-[var(--ui-text)]">{R.originalColumn}</h3>
          <TrustChart series={cmp.original.trustSeries} keyPoints={[]} color="#475569" />
          <p className="text-xs text-[var(--ui-text)]">
            {R.highestLevelLabel}: {D.ladder.levelLabels[cmp.original.highestLevel]}
          </p>
          <p className="text-xs text-[var(--ui-text)]">
            {D.rubric.totalLabel}: <span className="font-mono-data font-semibold">{cmp.original.total}</span>
          </p>
        </div>
        <div>
          <h3 className="text-xs font-bold text-[var(--ui-text)]">
            {R.replayColumn}
            {preset ? ` · ${R.strategyLabel}: ${preset.label}` : ''}
          </h3>
          <TrustChart series={cmp.replay.trustSeries} keyPoints={[]} color="#7c3aed" />
          <p className="text-xs text-[var(--ui-text)]">
            {R.highestLevelLabel}: {D.ladder.levelLabels[cmp.replay.highestLevel]}
          </p>
          <p className="text-xs text-[var(--ui-text)]">
            {D.rubric.totalLabel}: <span className="font-mono-data font-semibold">{cmp.replay.total}</span>
          </p>
        </div>
      </div>
      <h3 className="text-xs font-bold text-[var(--ui-text)]">{R.scoreComparisonTitle}</h3>
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-[var(--ui-border)] text-[var(--ui-text-muted)]">
            <th scope="col" className="py-1">{D.sections.rubric}</th>
            <th scope="col">{R.originalColumn}</th>
            <th scope="col">{R.replayColumn}</th>
            <th scope="col">Δ</th>
          </tr>
        </thead>
        <tbody>
          {RUBRIC_ITEM_ORDER.map((id) => (
            <tr key={id} className="border-b border-[var(--ui-border)]">
              <th scope="row" className="py-1 font-medium">{D.rubric.itemLabels[id]}</th>
              <td className="font-mono-data">{cmp.original.itemScores[id]}</td>
              <td className="font-mono-data">{cmp.replay.itemScores[id]}</td>
              <td className="font-mono-data">{signed(cmp.itemDeltas[id])}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs font-semibold text-[var(--ui-text)]">
        {R.totalDifferenceLabel}: <span className="font-mono-data">{signed(cmp.totalDelta)}</span>
      </p>
    </div>
  );
};

/* ---------------- Dasbor ---------------- */

export const DebriefDashboard: React.FC<DebriefDashboardProps> = ({
  props,
  onRevealRequest,
  onRequestReplay,
  onClose,
  defaultRevealed,
}) => {
  const [hidden, setHidden] = useState<HiddenReveal | null>(defaultRevealed ?? null);
  const [presetId, setPresetId] = useState('');
  const [replayOpen, setReplayOpen] = useState(false);
  const [comparison, setComparison] = useState<ReplayComparison | null>(null);
  const [replayError, setReplayError] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  const view = props.status === 'selesai' ? props.view : null;

  const handleReveal = useCallback(() => {
    setHidden(onRevealRequest());
  }, [onRevealRequest]);

  const handleReplay = useCallback(() => {
    if (!presetId) return;
    try {
      const out = onRequestReplay(presetId);
      if (out.ok) {
        setComparison(out.comparison);
        setReplayError(null);
      } else {
        setComparison(null);
        setReplayError(out.message || D.replay.errorGeneric);
      }
    } catch {
      setComparison(null);
      setReplayError(D.replay.errorGeneric);
    }
  }, [presetId, onRequestReplay]);

  const handleExport = useCallback(() => {
    if (!view) return;
    try {
      const payload = buildExportPayload(view, hidden);
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `debrief-${view.agentId}-hari${view.day}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setExportError(null);
    } catch {
      setExportError(D.export.errorJson);
    }
  }, [view, hidden]);

  const handlePrint = useCallback(() => {
    try {
      window.print();
      setExportError(null);
    } catch {
      setExportError(D.export.errorPrint);
    }
  }, []);

  if (!view) {
    return (
      <div data-debrief-root className="space-y-3 p-4 text-xs text-[var(--ui-text)]">
        <section aria-labelledby="debrief-incomplete-title" className={SECTION_CLASS}>
          <h2 id="debrief-incomplete-title" className="text-base font-bold">
            {D.sessionNotCompleteTitle}
          </h2>
          <p role="status" className="text-xs text-[var(--ui-text-muted)]">
            {D.sessionNotCompleteMessage}
          </p>
          <button type="button" data-print-hide onClick={onClose} className={BTN_CLASS}>
            {D.closeButton}
          </button>
        </section>
      </div>
    );
  }

  const { rubric, feedback, contactChannel } = view;
  const replayDisabledReason = !view.replayable
    ? view.transcript.length === 0
      ? D.replay.unavailableNoTranscript
      : view.replayBlockedReason || D.replay.unavailableNotReplayable
    : null;
  const verdictById = new Map(view.hypothesisVerdicts.map((v) => [v.hypothesisId, v]));

  return (
    <div data-debrief-root className="mx-auto max-w-4xl space-y-4 p-3 sm:p-5 text-xs text-[#3e2517]">
      <header className="flex flex-wrap items-center justify-between gap-3 rounded-[26px] border-[3.5px] border-[#3e2517] bg-gradient-to-r from-[#2e8274] via-[#257164] to-[#1e5c51] px-6 py-4 text-[#fffdf6] shadow-[0_6px_0_#3e2517]">
        <div>
          <p className="font-['Fredoka'] text-[11px] font-bold uppercase tracking-wider text-[#ffe8a3]">
            ✦ Laporan Refleksi Konseling
          </p>
          <h1 className="font-['Fredoka'] text-xl font-bold drop-shadow-[0_2px_0_#3e2517]">
            {D.title}
          </h1>
          <p className="mt-0.5 text-xs text-[#e2f7f0]">{D.subtitle}</p>
        </div>
        <button type="button" data-print-hide onClick={onClose} className={BTN_CLASS}>
          {D.closeButton}
        </button>
      </header>

      <p role="note" className="rounded-2xl border-2 border-[#3e2517]/40 bg-[#fff5d6] p-3 text-xs font-semibold text-[#5d3d18]">
        {D.learningToolDisclaimer}
      </p>

      {/* Ringkasan + tangga */}
      <section aria-labelledby="debrief-summary" className={SECTION_CLASS}>
        <h2 id="debrief-summary" className={H2_CLASS}>{D.sections.summary}</h2>
        <dl className="grid grid-cols-3 gap-2">
          <div>
            <dt className="text-[var(--ui-text-muted)]">{D.summary.studentLabel}</dt>
            <dd className="font-semibold">{view.agentName}</dd>
          </div>
          <div>
            <dt className="text-[var(--ui-text-muted)]">{D.summary.dayLabel}</dt>
            <dd className="font-mono-data font-semibold">{view.day}</dd>
          </div>
          <div>
            <dt className="text-[var(--ui-text-muted)]">{D.summary.turnCountLabel}</dt>
            <dd className="font-mono-data font-semibold">{view.transcript.length}</dd>
          </div>
        </dl>
        {view.transcript.length === 0 && <p className={MUTED_CLASS}>{D.summary.emptyTranscriptNote}</p>}
        <h3 className="text-xs font-bold">{D.sections.openingLadder}</h3>
        <ol className="space-y-1" aria-label={D.sections.openingLadder}>
          {([0, 1, 2, 3] as const).map((lvl) => {
            const reached = lvl <= view.highestLevel;
            const highest = lvl === view.highestLevel;
            return (
              <li
                key={lvl}
                aria-current={highest ? 'true' : undefined}
                className={`rounded-md border px-2 py-1 ${
                  highest
                    ? 'border-[var(--ui-accent)] bg-[var(--ui-surface-muted)] font-bold'
                    : reached
                      ? 'border-[var(--ui-border)] bg-[var(--ui-surface-muted)]'
                      : 'border-dashed border-[var(--ui-border)] text-[var(--ui-text-muted)]'
                }`}
              >
                {D.ladder.levelLabels[lvl]}
                {highest && ` — ${D.ladder.highestReachedLabel}`}
              </li>
            );
          })}
        </ol>
      </section>

      {/* Grafik kepercayaan */}
      <section aria-labelledby="debrief-trust" className={SECTION_CLASS}>
        <h2 id="debrief-trust" className={H2_CLASS}>{D.sections.trustChart}</h2>
        <TrustChart series={view.trustSeries} keyPoints={view.keyPoints} />
        {view.keyPoints.length > 0 && (
          <ul className="space-y-0.5 text-[11px] text-[var(--ui-text-muted)]">
            {view.keyPoints.map((kp, i) => {
              const label =
                kp.kind === 'keretakan'
                  ? D.chart.ruptureMarker
                  : kp.kind === 'perbaikan'
                    ? D.chart.repairMarker
                    : kp.kind === 'trust-turun-tajam'
                      ? D.chart.sharpDropMarker
                      : D.chart.sharpRiseMarker;
              return (
                <li key={i}>
                  {turnLabel(kp.turnNumber)}: {label} ({signed(Math.round(kp.trustDelta))})
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Ringkasan hasil cerita (mode cerita saja) */}
      {view.storyMode && view.storyOutcome && (
        <section aria-labelledby="debrief-story-outcome" className={SECTION_CLASS} data-testid="debrief-story-outcome">
          <h2 id="debrief-story-outcome" className={H2_CLASS}>{STRINGS.story.summaryCardTitle}</h2>
          <p className="text-sm font-bold">{STRINGS.story.outcomeLabels[view.storyOutcome.kind]}</p>
          <p className="font-semibold">{view.storyOutcome.summaryTitle}</p>
          <p className="text-xs text-[var(--ui-text-muted)]">{view.storyOutcome.summaryBody}</p>
        </section>
      )}

      {/* Jalur kontak (disembunyikan pada mode cerita) */}
      {!view.storyMode && (
      <section aria-labelledby="debrief-contact" className={SECTION_CLASS}>
        <h2 id="debrief-contact" className={H2_CLASS}>{D.sections.contactChannel}</h2>
        <dl className="grid grid-cols-2 gap-2">
          <div>
            <dt className="text-[var(--ui-text-muted)]">{D.contact.chosenLabel}</dt>
            <dd className="font-semibold">{channelName(contactChannel.chosen)}</dd>
          </div>
          <div>
            <dt className="text-[var(--ui-text-muted)]">{D.contact.bestLabel}</dt>
            <dd className="font-semibold">{channelName(contactChannel.best)}</dd>
          </div>
        </dl>
        <p className="font-semibold">
          {contactChannel.chosen === contactChannel.best ? D.contact.matchBadge : D.contact.mismatchBadge}
        </p>
        <p className="text-xs text-[var(--ui-text-muted)]">
          <span className="font-semibold">{D.contact.explanationLabel}:</span> {contactChannel.explanation}
        </p>
      </section>
      )}

      {/* Rubrik */}
      <section aria-labelledby="debrief-rubric" className={SECTION_CLASS}>
        <h2 id="debrief-rubric" className={H2_CLASS}>{D.sections.rubric}</h2>
        <p className="text-sm font-bold" data-testid="debrief-total">
          {D.rubric.totalLabel}: <span className="font-mono-data">{rubric.total}</span> ·{' '}
          {D.rubric.descriptorLabels[rubric.totalDescriptor]}
        </p>
        {rubric.neutralCount > 0 && <p className={MUTED_CLASS}>{D.rubric.neutralCountLabel(rubric.neutralCount)}</p>}
        <ul className="space-y-2.5">
          {rubric.items.map((item) => (
            <li
              key={item.id}
              className="rounded-2xl border-2 border-[#3e2517]/25 bg-[#fffaf0] p-3"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-['Fredoka'] text-xs font-bold text-[#3e2517]">
                  {D.rubric.itemLabels[item.id]}
                </h3>
                <span className="font-mono-data text-[11px] font-bold text-[#5d3d26]">
                  {D.rubric.scoreLabel}: <span className="text-[#217a62]">{item.score}</span> ·{' '}
                  {D.rubric.descriptorLabels[item.descriptor]}
                  {item.neutral && ` · ${D.rubric.neutralBadge}`}
                </span>
              </div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full border border-[#3e2517]/40 bg-[#eeddc0]">
                <div
                  className={`h-full rounded-full ${
                    item.score >= 75
                      ? 'bg-[#2e8274]'
                      : item.score >= 50
                        ? 'bg-[#e8a730]'
                        : 'bg-[#d8534a]'
                  }`}
                  style={{ width: `${Math.max(4, Math.min(100, item.score))}%` }}
                />
              </div>
              {item.neutral && item.neutralNote && (
                <p className={MUTED_CLASS}>
                  {D.rubric.neutralNotePrefix} {item.neutralNote}
                </p>
              )}
              {item.details.length > 0 && (
                <details className="mt-1">
                  <summary className="cursor-pointer text-[11px] font-semibold text-[var(--ui-accent)]">
                    {D.rubric.detailsToggleShow}
                  </summary>
                  <h4 className="mt-1 text-[11px] font-bold">{D.rubric.detailsTitle}</h4>
                  <ul className="mt-1 space-y-0.5 text-[11px]">
                    {item.details.map((d, i) => (
                      <li key={i}>
                        {d.label}: <span className="font-mono-data">{String(d.value)}</span>
                        {d.turnNumbers && d.turnNumbers.length > 0 && (
                          <span className="text-[var(--ui-text-muted)]">
                            {' '}
                            ({d.turnNumbers.map(turnLabel).join(', ')})
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* Umpan balik */}
      <section aria-labelledby="debrief-feedback" className={SECTION_CLASS}>
        <h2 id="debrief-feedback" className={H2_CLASS}>{D.sections.supervisorFeedback}</h2>
        {feedback.insufficient ? (
          <p role="status">{feedback.message ?? D.feedback.insufficientData}</p>
        ) : (
          <>
            <h3 className="text-xs font-bold">{D.feedback.strengthsTitle}</h3>
            <ul className="list-disc space-y-1 pl-5">
              {feedback.strengths.map((f, i) => (
                <li key={i}>{f.text}</li>
              ))}
            </ul>
            <h3 className="text-xs font-bold">{D.feedback.opportunitiesTitle}</h3>
            <ul className="list-disc space-y-1 pl-5">
              {feedback.opportunities.map((f, i) => (
                <li key={i}>
                  {f.text}
                  {f.alternative && (
                    <p className="text-[var(--ui-text-muted)]">
                      <span className="font-semibold">{D.feedback.alternativeLabel}</span> {f.alternative}
                    </p>
                  )}
                </li>
              ))}
            </ul>
            {feedback.drill && (
              <>
                <h3 className="text-xs font-bold">{D.feedback.drillTitle}</h3>
                <p className="font-semibold">{feedback.drill.title}</p>
                <p>{feedback.drill.instruction}</p>
                <p className={MUTED_CLASS}>
                  {feedback.drill.turnNumber === null
                    ? D.feedback.noTurnReference
                    : turnLabel(feedback.drill.turnNumber)}
                </p>
              </>
            )}
          </>
        )}
      </section>

      {/* Sosiogram */}
      <section aria-labelledby="debrief-sociogram" className={SECTION_CLASS}>
        <h2 id="debrief-sociogram" className={H2_CLASS}>{D.sections.sociogram}</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <SociogramEgo panel={view.sociogramDay1} title={D.sociogram.day1Title} targetId={view.agentId} />
          <SociogramEgo
            panel={view.sociogramDayN}
            title={D.sociogram.dayNTitle(view.sociogramDayN?.day ?? view.day)}
            targetId={view.agentId}
          />
        </div>
      </section>

      {/* Hipotesis */}
      <section aria-labelledby="debrief-hypotheses" className={SECTION_CLASS}>
        <h2 id="debrief-hypotheses" className={H2_CLASS}>{D.sections.hypotheses}</h2>
        {view.hypotheses.length === 0 ? (
          <p className={MUTED_CLASS}>{D.hypotheses.noHypotheses}</p>
        ) : (
          <>
            <ul className="space-y-2">
              {view.hypotheses.map((h) => {
                const v = verdictById.get(h.id);
                return (
                  <li key={h.id} className="rounded-lg border border-[var(--ui-border)] p-2.5">
                    <p>{h.hypothesisText}</p>
                    <p className={MUTED_CLASS}>
                      {D.hypotheses.confidenceLabel}: {h.confidence}
                      {v && (
                        <>
                          {' · '}
                          {D.hypotheses.verdictLabel}:{' '}
                          <span className="font-semibold text-[var(--ui-text)]">
                            {v.verdict === 'terbukti' ? D.hypotheses.verdictProven : D.hypotheses.verdictFalsePositive}
                          </span>
                        </>
                      )}
                    </p>
                  </li>
                );
              })}
            </ul>
            <p className={MUTED_CLASS}>{D.hypotheses.verdictNote}</p>
          </>
        )}
      </section>

      {/* Tersembunyi */}
      <section aria-labelledby="debrief-hidden" className={SECTION_CLASS}>
        <h2 id="debrief-hidden" className={H2_CLASS}>{D.sections.hidden}</h2>
        {hidden ? (
          <>
            <HiddenPanel hidden={hidden} />
            <button type="button" data-print-hide onClick={() => setHidden(null)} className={BTN_CLASS}>
              {D.hidden.hideButton}
            </button>
          </>
        ) : (
          <button type="button" data-print-hide onClick={handleReveal} className={BTN_PRIMARY_CLASS}>
            {D.hidden.revealButton}
          </button>
        )}
      </section>

      {/* Putar ulang */}
      <section aria-labelledby="debrief-replay" className={SECTION_CLASS}>
        <h2 id="debrief-replay" className={H2_CLASS}>{D.sections.replay}</h2>
        {replayDisabledReason ? (
          <>
            <button type="button" data-print-hide disabled className={BTN_CLASS}>
              {D.replay.replayButton}
            </button>
            <p role="status" className={MUTED_CLASS}>{replayDisabledReason}</p>
          </>
        ) : !replayOpen ? (
          <button type="button" data-print-hide onClick={() => setReplayOpen(true)} className={BTN_CLASS}>
            {D.replay.replayButton}
          </button>
        ) : (
          <div className="space-y-2" data-print-hide>
            <label htmlFor="debrief-replay-preset" className="block font-semibold">
              {D.replay.presetLabel}
            </label>
            <select
              id="debrief-replay-preset"
              value={presetId}
              onChange={(e) => setPresetId(e.target.value)}
              className="w-full rounded-lg border border-[var(--ui-border)] bg-[var(--ui-surface)] px-2.5 py-2 text-xs text-[var(--ui-text)]"
            >
              <option value="" />
              {view.replayPresets.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label} — {p.description}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <button type="button" onClick={handleReplay} disabled={!presetId} className={BTN_PRIMARY_CLASS}>
                {D.replay.runButton}
              </button>
              <button
                type="button"
                onClick={() => {
                  setReplayOpen(false);
                  setReplayError(null);
                  setComparison(null);
                }}
                className={BTN_CLASS}
              >
                {D.replay.cancelButton}
              </button>
            </div>
          </div>
        )}
        {replayError && (
          <p role="alert" className="rounded-lg border border-[var(--ui-warning-border)] bg-[var(--ui-warning-bg)] p-2.5 font-medium text-[var(--ui-warning-text)]">
            {replayError}
          </p>
        )}
        {comparison && <ReplayResult view={view} cmp={comparison} />}
      </section>

      {/* Ekspor */}
      <section aria-labelledby="debrief-export" className={SECTION_CLASS} data-print-hide>
        <h2 id="debrief-export" className={H2_CLASS}>{D.sections.export}</h2>
        <div className="flex gap-2">
          <button type="button" data-print-hide onClick={handleExport} className={BTN_CLASS}>
            {D.export.jsonButton}
          </button>
          <button type="button" data-print-hide onClick={handlePrint} className={BTN_CLASS}>
            {D.export.printButton}
          </button>
        </div>
        <p className={MUTED_CLASS}>
          {D.export.jsonFileNote} {hidden ? D.export.hiddenIncludedNote : D.export.hiddenExcludedNote}
        </p>
        {exportError && (
          <p role="alert" className="font-medium text-[var(--ui-warning-text)]">
            {exportError}
          </p>
        )}
      </section>
    </div>
  );
};
