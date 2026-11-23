import React, { useMemo, useRef, useState } from 'react';
import { LAB_MAP } from '../data/map';
import { STRINGS } from '../data/strings';
import {
  analyzeSociometryNetwork,
  computeStableForceLayout,
} from '../engine/network';
import {
  CounselorHypothesis,
  DailySociometrySnapshot,
  HypothesisConfidence,
  ObservationLogState,
  SociogramNodePosition,
  SociometryNetworkStats,
  SociometryNodeMetrics,
  StudentAgent,
  ZoneType,
} from '../types';

export interface SociogramPanelProps {
  agents: readonly StudentAgent[];
  snapshots: readonly DailySociometrySnapshot[];
  livePreviewSnapshot: DailySociometrySnapshot;
  observationLog: ObservationLogState;
  currentDay: number;
  currentTimeFormatted: string;
  selectedAgentId: string | null;
  onSelectAgent: (agentId: string | null) => void;
  hypotheses: readonly CounselorHypothesis[];
  onAddHypothesis: (hypothesis: Omit<CounselorHypothesis, 'id'>) => void;
}

type ColorMode = 'none' | 'station';
type CompareMode = 'single' | 'split';

const ZONE_NODE_COLORS: Record<ZoneType, { fill: string; stroke: string; label: string }> = {
  'cetak-3d': { fill: '#dbeafe', stroke: '#1d4ed8', label: 'Cetak 3D' },
  pemrograman: { fill: '#ccfbf1', stroke: '#0f766e', label: 'Pemrograman' },
  las: { fill: '#fef3c7', stroke: '#b45309', label: 'St. Las' },
  'elektronik-iot': { fill: '#e0e7ff', stroke: '#4338ca', label: 'Elektronik & IoT' },
  diskusi: { fill: '#dcfce7', stroke: '#15803d', label: 'Meja Diskusi' },
  'gudang-alat': { fill: '#f1f5f9', stroke: '#475569', label: 'Gudang Alat' },
  istirahat: { fill: '#fce7f3', stroke: '#be185d', label: 'R. Istirahat' },
  'ruang-dosen': { fill: '#ede9fe', stroke: '#6d28d9', label: 'R. Dosen' },
  konsultasi: { fill: '#e2e8f0', stroke: '#334155', label: 'Konsultasi' },
  'studio-desain': { fill: '#f3e8ff', stroke: '#7e22ce', label: 'Studio Desain' },
  'pojok-baca': { fill: '#d1fae5', stroke: '#047857', label: 'Pojok Baca' },
};

function formatNodeStatusText(m: SociometryNodeMetrics): string {
  const parts: string[] = [];
  if (m.isIsolated) parts.push(STRINGS.sociogram.statusLabels.terisolasi);
  else if (m.isNeglected) parts.push(STRINGS.sociogram.statusLabels.terabaikan);
  else {
    if (m.isStar) parts.push(STRINGS.sociogram.statusLabels.bintang);
    if (m.isBridge) parts.push(STRINGS.sociogram.statusLabels.jembatan);
    if (parts.length === 0) parts.push(STRINGS.sociogram.statusLabels.umum);
  }
  return parts.join(' · ');
}

interface SociogramViewportProps {
  title: string;
  snapshot: DailySociometrySnapshot;
  stats: SociometryNetworkStats;
  agents: readonly StudentAgent[];
  colorMode: ColorMode;
  selectedAgentId: string | null;
  onSelectAgent: (agentId: string) => void;
  manualPositions: Record<string, SociogramNodePosition>;
  onUpdateManualPosition: (agentId: string, pos: SociogramNodePosition) => void;
  compact?: boolean;
  markerPrefix: string;
}

const SociogramViewport: React.FC<SociogramViewportProps> = ({
  title,
  snapshot,
  stats,
  agents,
  colorMode,
  selectedAgentId,
  onSelectAgent,
  manualPositions,
  onUpdateManualPosition,
  compact = false,
  markerPrefix,
}) => {
  const svgWidth = compact ? 260 : 380;
  const svgHeight = compact ? 230 : 280;
  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragStateRef = useRef<{
    agentId: string;
    moved: boolean;
    startClientX: number;
    startClientY: number;
  } | null>(null);

  const computedPositions = useMemo(
    () =>
      computeStableForceLayout(
        snapshot,
        agents,
        stats,
        svgWidth,
        svgHeight
      ),
    [snapshot, agents, stats, svgWidth, svgHeight]
  );

  const positions = useMemo(() => {
    const merged: Record<string, SociogramNodePosition> = { ...computedPositions };
    for (const [id, p] of Object.entries(manualPositions)) {
      if (merged[id]) {
        merged[id] = {
          x: Math.max(16, Math.min(svgWidth - 16, p.x)),
          y: Math.max(16, Math.min(svgHeight - 16, p.y)),
        };
      }
    }
    return merged;
  }, [computedPositions, manualPositions, svgWidth, svgHeight]);

  // Bangun daftar sisi terarah & timbal balik tanpa duplikasi visual
  const { mutualEdges, oneWayEdges } = useMemo(() => {
    const mutual: { a: string; b: string }[] = [];
    const oneWay: { from: string; to: string }[] = [];
    const seenMutual = new Set<string>();

    for (const agent of agents) {
      const m = stats.nodeMetrics[agent.id];
      if (!m) continue;
      const mutualSet = new Set(m.mutualIds);

      for (const toId of m.outgoingToIds) {
        if (mutualSet.has(toId)) {
          const key = agent.id < toId ? `${agent.id}|${toId}` : `${toId}|${agent.id}`;
          if (!seenMutual.has(key)) {
            seenMutual.add(key);
            mutual.push({ a: agent.id, b: toId });
          }
        } else {
          oneWay.push({ from: agent.id, to: toId });
        }
      }
    }
    return { mutualEdges: mutual, oneWayEdges: oneWay };
  }, [agents, stats]);

  const toSvgCoords = (clientX: number, clientY: number): SociogramNodePosition | null => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return null;
    return {
      x: ((clientX - rect.left) / rect.width) * svgWidth,
      y: ((clientY - rect.top) / rect.height) * svgHeight,
    };
  };

  const handleNodePointerDown = (
    e: React.PointerEvent<SVGGElement>,
    agentId: string
  ) => {
    e.stopPropagation();
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    dragStateRef.current = {
      agentId,
      moved: false,
      startClientX: e.clientX,
      startClientY: e.clientY,
    };
  };

  const handleNodePointerMove = (e: React.PointerEvent<SVGGElement>) => {
    const drag = dragStateRef.current;
    if (!drag) return;
    if (
      Math.abs(e.clientX - drag.startClientX) > 3 ||
      Math.abs(e.clientY - drag.startClientY) > 3
    ) {
      drag.moved = true;
    }
    if (!drag.moved) return;
    const pt = toSvgCoords(e.clientX, e.clientY);
    if (pt) {
      onUpdateManualPosition(drag.agentId, pt);
    }
  };

  const handleNodePointerUp = (
    e: React.PointerEvent<SVGGElement>,
    agentId: string
  ) => {
    const drag = dragStateRef.current;
    if (!drag) return;
    const wasMoved = drag.moved;
    dragStateRef.current = null;
    if (!wasMoved) {
      e.stopPropagation();
      onSelectAgent(agentId);
    }
  };

  const getNodeRadius = (agentId: string): number => {
    const rec = stats.nodeMetrics[agentId]?.receivedCount ?? 0;
    return (compact ? 4.5 : 5.5) + Math.min(compact ? 6.5 : 8.5, rec * (compact ? 1.15 : 1.45));
  };

  const trimLine = (
    p1: SociogramNodePosition,
    p2: SociogramNodePosition,
    r1: number,
    r2: number
  ) => {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const dist = Math.hypot(dx, dy);
    if (dist <= r1 + r2 + 4) {
      return null;
    }
    const ux = dx / dist;
    const uy = dy / dist;
    return {
      x1: p1.x + ux * (r1 + 2),
      y1: p1.y + uy * (r1 + 2),
      x2: p2.x - ux * (r2 + 3.5),
      y2: p2.y - uy * (r2 + 3.5),
    };
  };

  return (
    <div className="rounded-2xl border-2 border-[#3e2517]/35 bg-[#fffdf7] p-2.5 shadow-[inset_0_-3px_0_#f0e0bf]">
      <div className="mb-1.5 flex items-center justify-between text-[11px] font-bold text-[#3e2517]">
        <span className="font-['Fredoka']">{title}</span>
        <span className="font-mono-data font-semibold text-[#6b482e]">
          {stats.reciprocalPairCount} timbal balik
        </span>
      </div>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        role="img"
        aria-label={title}
        className="block h-auto w-full select-none rounded-xl border-2 border-[#3e2517]/25 bg-[#fffaf0]"
      >
        <defs>
          <marker
            id={`${markerPrefix}-arrow-one`}
            viewBox="0 0 8 8"
            refX="6"
            refY="4"
            markerWidth="5"
            markerHeight="5"
            orient="auto"
          >
            <path d="M 0 1 L 7 4 L 0 7 z" fill="#64748b" />
          </marker>
          <marker
            id={`${markerPrefix}-arrow-one-active`}
            viewBox="0 0 8 8"
            refX="6"
            refY="4"
            markerWidth="5.5"
            markerHeight="5.5"
            orient="auto"
          >
            <path d="M 0 1 L 7 4 L 0 7 z" fill="#1d5d7a" />
          </marker>
          <marker
            id={`${markerPrefix}-arrow-mutual-end`}
            viewBox="0 0 8 8"
            refX="6"
            refY="4"
            markerWidth="5"
            markerHeight="5"
            orient="auto"
          >
            <path d="M 0 1 L 7 4 L 0 7 z" fill="#0f766e" />
          </marker>
          <marker
            id={`${markerPrefix}-arrow-mutual-start`}
            viewBox="0 0 8 8"
            refX="2"
            refY="4"
            markerWidth="5"
            markerHeight="5"
            orient="auto"
          >
            <path d="M 8 1 L 1 4 L 8 7 z" fill="#0f766e" />
          </marker>
        </defs>

        {/* Pilihan satu arah */}
        <g>
          {oneWayEdges.map((edge) => {
            const p1 = positions[edge.from];
            const p2 = positions[edge.to];
            if (!p1 || !p2) return null;
            const trimmed = trimLine(
              p1,
              p2,
              getNodeRadius(edge.from),
              getNodeRadius(edge.to)
            );
            if (!trimmed) return null;
            const related =
              selectedAgentId === edge.from || selectedAgentId === edge.to;
            const dimmed = selectedAgentId !== null && !related;
            return (
              <line
                key={`${edge.from}->${edge.to}`}
                x1={trimmed.x1}
                y1={trimmed.y1}
                x2={trimmed.x2}
                y2={trimmed.y2}
                stroke={related ? '#1d5d7a' : '#94a3b8'}
                strokeWidth={related ? 1.6 : 0.95}
                strokeOpacity={dimmed ? 0.16 : related ? 0.95 : 0.55}
                markerEnd={
                  related
                    ? `url(#${markerPrefix}-arrow-one-active)`
                    : `url(#${markerPrefix}-arrow-one)`
                }
              />
            );
          })}
        </g>

        {/* Pilihan timbal balik (garis tebal dua arah) */}
        <g>
          {mutualEdges.map((edge) => {
            const p1 = positions[edge.a];
            const p2 = positions[edge.b];
            if (!p1 || !p2) return null;
            const trimmed = trimLine(
              p1,
              p2,
              getNodeRadius(edge.a),
              getNodeRadius(edge.b)
            );
            if (!trimmed) return null;
            const related =
              selectedAgentId === edge.a || selectedAgentId === edge.b;
            const dimmed = selectedAgentId !== null && !related;
            return (
              <line
                key={`${edge.a}<->${edge.b}`}
                x1={trimmed.x1}
                y1={trimmed.y1}
                x2={trimmed.x2}
                y2={trimmed.y2}
                stroke="#0f766e"
                strokeWidth={related ? 2.6 : 1.9}
                strokeOpacity={dimmed ? 0.2 : 0.88}
                markerStart={`url(#${markerPrefix}-arrow-mutual-start)`}
                markerEnd={`url(#${markerPrefix}-arrow-mutual-end)`}
              />
            );
          })}
        </g>

        {/* Simpul seluruh mahasiswa */}
        <g>
          {agents.map((agent) => {
            const pt = positions[agent.id];
            const metric = stats.nodeMetrics[agent.id];
            if (!pt || !metric) return null;
            const r = getNodeRadius(agent.id);
            const isSelected = selectedAgentId === agent.id;
            const zoneStyle = ZONE_NODE_COLORS[metric.dominantZoneId];
            const fill =
              colorMode === 'station' ? zoneStyle.fill : '#f8fafc';
            const stroke = isSelected
              ? '#1d5d7a'
              : colorMode === 'station'
                ? zoneStyle.stroke
                : metric.isIsolated
                  ? '#94a3b8'
                  : '#334155';

            const showLabel =
              !compact && (isSelected || metric.isStar || metric.isBridge);

            return (
              <g
                key={agent.id}
                transform={`translate(${pt.x}, ${pt.y})`}
                onPointerDown={(e) => handleNodePointerDown(e, agent.id)}
                onPointerMove={handleNodePointerMove}
                onPointerUp={(e) => handleNodePointerUp(e, agent.id)}
                className="cursor-grab active:cursor-grabbing"
              >
                <title>
                  {`${agent.name} — Diterima: ${metric.receivedCount}, Dikirim: ${metric.sentCount}, Status: ${formatNodeStatusText(metric)}`}
                </title>
                {isSelected && (
                  <circle
                    r={r + 3.5}
                    fill="none"
                    stroke="#1d5d7a"
                    strokeWidth="1.8"
                  />
                )}
                <circle
                  r={r}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={isSelected ? 2 : metric.isBridge ? 1.8 : 1.2}
                />
                {showLabel && (
                  <text
                    y={r + 9}
                    textAnchor="middle"
                    fontSize="8.5"
                    fontWeight={isSelected ? '700' : '600'}
                    fill="#1e293b"
                    pointerEvents="none"
                  >
                    {agent.name.split(' ')[0]}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
};

export const SociogramPanel: React.FC<SociogramPanelProps> = ({
  agents,
  snapshots,
  livePreviewSnapshot,
  observationLog,
  currentDay,
  currentTimeFormatted,
  selectedAgentId,
  onSelectAgent,
  hypotheses,
  onAddHypothesis,
}) => {
  const [colorMode, setColorMode] = useState<ColorMode>('station');
  const [compareMode, setCompareMode] = useState<CompareMode>('single');
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [manualPositions, setManualPositions] = useState<
    Record<string, SociogramNodePosition>
  >({});

  const [hypothesisDraftOpen, setHypothesisDraftOpen] = useState<boolean>(false);
  const [hypothesisText, setHypothesisText] = useState<string>('');
  const [hypothesisConfidence, setHypothesisConfidence] =
    useState<HypothesisConfidence>('sedang');

  // Gabungkan snapshot harian resmi + pratinjau berjalan hari ini bila belum ditutup pukul 16:00
  const availableSnapshots = useMemo(() => {
    const byDay = new Map<number, DailySociometrySnapshot>();
    for (const s of snapshots) {
      byDay.set(s.day, s);
    }
    if (!byDay.has(livePreviewSnapshot.day)) {
      byDay.set(livePreviewSnapshot.day, livePreviewSnapshot);
    }
    return Array.from(byDay.values()).sort((a, b) => a.day - b.day);
  }, [snapshots, livePreviewSnapshot]);

  const maxDay = availableSnapshots[availableSnapshots.length - 1]?.day ?? 1;
  const clampedDay = Math.max(1, Math.min(selectedDay, maxDay));

  const primarySnapshot =
    availableSnapshots.find((s) => s.day === clampedDay) ?? livePreviewSnapshot;
  const dayOneSnapshot =
    availableSnapshots.find((s) => s.day === 1) ?? primarySnapshot;

  const primaryStats = useMemo(
    () => analyzeSociometryNetwork(primarySnapshot, agents, observationLog),
    [primarySnapshot, agents, observationLog]
  );

  const dayOneStats = useMemo(
    () =>
      compareMode === 'split'
        ? analyzeSociometryNetwork(dayOneSnapshot, agents, observationLog)
        : primaryStats,
    [compareMode, dayOneSnapshot, agents, observationLog, primaryStats]
  );

  const agentById = useMemo(
    () => new Map(agents.map((a) => [a.id, a])),
    [agents]
  );

  const selectedMetric = selectedAgentId
    ? primaryStats.nodeMetrics[selectedAgentId] ?? null
    : null;

  const handleUpdateManualPos = (
    agentId: string,
    pos: SociogramNodePosition
  ) => {
    setManualPositions((prev) => ({ ...prev, [agentId]: pos }));
  };

  const handleOpenHypothesisForAgent = (agentId: string) => {
    onSelectAgent(agentId);
    setHypothesisDraftOpen(true);
  };

  const handleSaveHypothesis = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMetric || !hypothesisText.trim()) return;
    onAddHypothesis({
      agentId: selectedMetric.agentId,
      agentName: selectedMetric.name,
      day: currentDay,
      timeFormatted: currentTimeFormatted,
      hypothesisText: hypothesisText.trim(),
      confidence: hypothesisConfidence,
      sociometryStatusAtCreation: selectedMetric.status,
    });
    setHypothesisText('');
    setHypothesisDraftOpen(false);
  };

  return (
    <div className="space-y-4 text-xs text-[#3e2517]" data-testid="sociogram-panel">
      {/* Penafian kehati-hatian wajib */}
      <div
        role="note"
        className="rounded-2xl border-2 border-[#3e2517]/35 bg-[#fff5d6] p-3 text-[12px] leading-relaxed text-[#5d3d18] shadow-[inset_0_-3px_0_#ebd49a]"
      >
        {STRINGS.sociogram.cautionBanner}
      </div>

      {/* Pertanyaan sosiometri positif */}
      <div className="rounded-2xl border-2 border-[#3e2517]/25 bg-[#fffdf7] p-3">
        <p className="font-['Fredoka'] text-[11px] font-bold uppercase tracking-wider text-[#7a5234]">
          {STRINGS.sociogram.positiveQuestionLabel}
        </p>
        <p className="mt-0.5 text-xs font-bold text-[#3e2517]">
          {STRINGS.sociogram.positiveQuestionText}
        </p>
        {primarySnapshot.isLivePreview && (
          <p className="mt-1 text-[11px] text-[#6b482e]">
            {STRINGS.sociogram.previewNotice}
          </p>
        )}
      </div>

      {/* Kontrol tampilan & slider hari */}
      <div className="space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1 rounded-full border-2 border-[#3e2517]/35 bg-[#f5e6c8] p-0.5">
            <button
              type="button"
              onClick={() => setColorMode('none')}
              aria-pressed={colorMode === 'none'}
              className={`whitespace-nowrap rounded-full px-2.5 py-1 font-['Fredoka'] text-[11px] font-bold transition ${
                colorMode === 'none'
                  ? 'bg-[#3e2517] text-[#fffdf6]'
                  : 'text-[#6b482e] hover:text-[#3e2517]'
              }`}
            >
              {STRINGS.sociogram.colorModeNone}
            </button>
            <button
              type="button"
              onClick={() => setColorMode('station')}
              aria-pressed={colorMode === 'station'}
              className={`whitespace-nowrap rounded-full px-2.5 py-1 font-['Fredoka'] text-[11px] font-bold transition ${
                colorMode === 'station'
                  ? 'bg-[#3e2517] text-[#fffdf6]'
                  : 'text-[#6b482e] hover:text-[#3e2517]'
              }`}
            >
              {STRINGS.sociogram.colorModeStation}
            </button>
          </div>

          <div className="flex items-center gap-1 rounded-full border-2 border-[#3e2517]/35 bg-[#f5e6c8] p-0.5">
            <button
              type="button"
              onClick={() => setCompareMode('single')}
              aria-pressed={compareMode === 'single'}
              className={`whitespace-nowrap rounded-full px-2.5 py-1 font-['Fredoka'] text-[11px] font-bold transition ${
                compareMode === 'single'
                  ? 'bg-[#2e8274] text-[#fffdf6]'
                  : 'text-[#6b482e] hover:text-[#3e2517]'
              }`}
            >
              {STRINGS.sociogram.compareModeSingle}
            </button>
            <button
              type="button"
              onClick={() => setCompareMode('split')}
              aria-pressed={compareMode === 'split'}
              className={`whitespace-nowrap rounded-full px-2.5 py-1 font-['Fredoka'] text-[11px] font-bold transition ${
                compareMode === 'split'
                  ? 'bg-[#2e8274] text-[#fffdf6]'
                  : 'text-[#6b482e] hover:text-[#3e2517]'
              }`}
            >
              {STRINGS.sociogram.compareModeSplit}
            </button>
          </div>
        </div>

        {/* Slider hari */}
        <div className="flex items-center gap-3 rounded-2xl border-2 border-[#3e2517]/30 bg-[#fffdf7] px-3 py-2">
          <label
            htmlFor="sociogram-day-slider"
            className="shrink-0 font-['Fredoka'] font-bold text-[#3e2517]"
          >
            {compareMode === 'split'
              ? STRINGS.sociogram.dayCompareLabel
              : STRINGS.sociogram.daySliderLabel}
          </label>
          <input
            id="sociogram-day-slider"
            type="range"
            min={1}
            max={maxDay}
            value={clampedDay}
            onChange={(e) => setSelectedDay(Number(e.target.value))}
            className="flex-1 accent-[#2e8274]"
          />
          <span className="font-mono-data shrink-0 font-bold text-[#3e2517]">
            Hari {clampedDay}/{maxDay}
          </span>
        </div>
      </div>

      {/* Kanvas Sosiogram (Tunggal atau Berdampingan Hari 1 vs Hari N) */}
      {compareMode === 'single' ? (
        <SociogramViewport
          title={`Sosiogram Hari ${primarySnapshot.day}${primarySnapshot.isLivePreview ? ' (Berjalan)' : ''}`}
          snapshot={primarySnapshot}
          stats={primaryStats}
          agents={agents}
          colorMode={colorMode}
          selectedAgentId={selectedAgentId}
          onSelectAgent={(id) => onSelectAgent(id)}
          manualPositions={manualPositions}
          onUpdateManualPosition={handleUpdateManualPos}
          markerPrefix="sg-single"
        />
      ) : (
        <div className="grid grid-cols-2 gap-2" data-testid="sociogram-compare-grid">
          <SociogramViewport
            title={`Hari 1${dayOneSnapshot.isLivePreview ? ' (Berjalan)' : ''}`}
            snapshot={dayOneSnapshot}
            stats={dayOneStats}
            agents={agents}
            colorMode={colorMode}
            selectedAgentId={selectedAgentId}
            onSelectAgent={(id) => onSelectAgent(id)}
            manualPositions={manualPositions}
            onUpdateManualPosition={handleUpdateManualPos}
            compact
            markerPrefix="sg-left"
          />
          <SociogramViewport
            title={`Hari ${primarySnapshot.day}${primarySnapshot.isLivePreview ? ' (Berjalan)' : ''}`}
            snapshot={primarySnapshot}
            stats={primaryStats}
            agents={agents}
            colorMode={colorMode}
            selectedAgentId={selectedAgentId}
            onSelectAgent={(id) => onSelectAgent(id)}
            manualPositions={manualPositions}
            onUpdateManualPosition={handleUpdateManualPos}
            compact
            markerPrefix="sg-right"
          />
        </div>
      )}

      {/* Legenda Sosiogram */}
      <div className="space-y-1 text-[11px] text-[var(--ui-text-muted)]">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="inline-flex items-center gap-1.5">
            <svg width="24" height="10" aria-hidden="true">
              <line x1="2" y1="5" x2="18" y2="5" stroke="#64748b" strokeWidth="1.2" />
              <polygon points="18,2 23,5 18,8" fill="#64748b" />
            </svg>
            <span>{STRINGS.sociogram.legendOneWay}</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <svg width="24" height="10" aria-hidden="true">
              <polygon points="6,2 1,5 6,8" fill="#0f766e" />
              <line x1="5" y1="5" x2="19" y2="5" stroke="#0f766e" strokeWidth="2.2" />
              <polygon points="18,2 23,5 18,8" fill="#0f766e" />
            </svg>
            <span>{STRINGS.sociogram.legendMutual}</span>
          </span>
        </div>
        <p>{STRINGS.sociogram.legendSize} · {STRINGS.sociogram.dragHint}</p>
        {colorMode === 'station' && (
          <div className="flex flex-wrap gap-x-3 gap-y-1 pt-0.5">
            {(['cetak-3d', 'pemrograman', 'las', 'elektronik-iot', 'diskusi', 'istirahat'] as ZoneType[]).map(
              (zId) => (
                <span key={zId} className="inline-flex items-center gap-1">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full border"
                    style={{
                      backgroundColor: ZONE_NODE_COLORS[zId].fill,
                      borderColor: ZONE_NODE_COLORS[zId].stroke,
                    }}
                    aria-hidden="true"
                  />
                  <span>{ZONE_NODE_COLORS[zId].label}</span>
                </span>
              )
            )}
          </div>
        )}
      </div>

      {/* Detail simpul terpilih + Catat sebagai hipotesis */}
      {selectedMetric && (
        <section
          aria-label={STRINGS.sociogram.selectedNodeTitle}
          className="rounded-lg border border-[var(--ui-border)] bg-[var(--ui-surface-muted)] p-3"
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="text-xs font-bold text-[var(--ui-text)]">
                {selectedMetric.name}
              </h3>
              <p className="font-mono-data mt-0.5 text-[11px] text-[var(--ui-text-muted)]">
                {STRINGS.sociogram.receivedPrefix}: {selectedMetric.receivedCount} ·{' '}
                {STRINGS.sociogram.sentPrefix}: {selectedMetric.sentCount} ·{' '}
                {STRINGS.sociogram.mutualPrefix}: {selectedMetric.mutualCount}
              </p>
              <p className="mt-0.5 text-[11px] font-medium text-[var(--ui-text)]">
                {formatNodeStatusText(selectedMetric)} ·{' '}
                {LAB_MAP.zones.find((z) => z.id === selectedMetric.dominantZoneId)?.shortLabel}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setHypothesisDraftOpen((prev) => !prev)}
              className="whitespace-nowrap rounded-md bg-[var(--ui-accent)] px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-[var(--ui-accent-hover)]"
            >
              {STRINGS.sociogram.recordHypothesisBtn}
            </button>
          </div>

          {/* Daftar pilihan keluar & masuk */}
          <div className="mt-2 space-y-1 text-[11px] text-[var(--ui-text-muted)]">
            <p>
              <span className="font-medium text-[var(--ui-text)]">Memilih: </span>
              {selectedMetric.outgoingToIds.length === 0
                ? 'Belum ada'
                : selectedMetric.outgoingToIds
                    .map((id) => agentById.get(id)?.name ?? id)
                    .join(', ')}
            </p>
            <p>
              <span className="font-medium text-[var(--ui-text)]">Dipilih oleh: </span>
              {selectedMetric.incomingFromIds.length === 0
                ? 'Tidak ada (0 pilihan diterima)'
                : selectedMetric.incomingFromIds
                    .map((id) => agentById.get(id)?.name ?? id)
                    .join(', ')}
            </p>
          </div>

          {hypothesisDraftOpen && (
            <form onSubmit={handleSaveHypothesis} className="mt-3 space-y-2 border-t border-[var(--ui-border)] pt-2.5">
              <p className="font-semibold text-[var(--ui-text)]">
                {STRINGS.sociogram.hypothesisFormTitle}
              </p>
              <textarea
                rows={2}
                required
                value={hypothesisText}
                onChange={(e) => setHypothesisText(e.target.value)}
                placeholder={STRINGS.sociogram.hypothesisPlaceholder}
                className="w-full rounded border border-[var(--ui-border)] bg-[var(--ui-surface)] px-2.5 py-1.5 text-xs text-[var(--ui-text)]"
              />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="flex items-center gap-2 text-[11px] text-[var(--ui-text)]">
                  <span>{STRINGS.sociogram.confidenceLabel}:</span>
                  <select
                    value={hypothesisConfidence}
                    onChange={(e) =>
                      setHypothesisConfidence(e.target.value as HypothesisConfidence)
                    }
                    className="rounded border border-[var(--ui-border)] bg-[var(--ui-surface)] px-2 py-1 text-[11px]"
                  >
                    <option value="rendah">{STRINGS.sociogram.confidenceOptions.rendah}</option>
                    <option value="sedang">{STRINGS.sociogram.confidenceOptions.sedang}</option>
                    <option value="tinggi">{STRINGS.sociogram.confidenceOptions.tinggi}</option>
                  </select>
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setHypothesisDraftOpen(false)}
                    className="rounded border border-[var(--ui-border)] bg-[var(--ui-surface)] px-2.5 py-1 text-[11px] font-medium text-[var(--ui-text-muted)]"
                  >
                    {STRINGS.sociogram.cancelHypothesisBtn}
                  </button>
                  <button
                    type="submit"
                    className="rounded bg-[var(--ui-accent)] px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-[var(--ui-accent-hover)]"
                  >
                    {STRINGS.sociogram.saveHypothesisBtn}
                  </button>
                </div>
              </div>
            </form>
          )}
        </section>
      )}

      {/* Laporan Statistik Sosiometri Klasik */}
      <section aria-label={STRINGS.sociogram.statsTitle} className="space-y-3 border-t border-[var(--ui-border)] pt-3">
        <h3 className="text-xs font-bold text-[var(--ui-text)]">
          {STRINGS.sociogram.statsTitle} (Hari {primaryStats.day})
        </h3>

        <div className="grid grid-cols-3 gap-2 rounded-lg border border-[var(--ui-border)] bg-[var(--ui-surface-muted)] p-2.5 text-center">
          <div>
            <div className="font-mono-data text-sm font-bold text-[var(--ui-text)]">
              {primaryStats.reciprocityChoicePercent}%
            </div>
            <div className="text-[10px] text-[var(--ui-text-muted)]">
              {STRINGS.sociogram.reciprocityChoicesLabel}
            </div>
          </div>
          <div>
            <div className="font-mono-data text-sm font-bold text-[var(--ui-text)]">
              {primaryStats.agentsWithReciprocalPercent}%
            </div>
            <div className="text-[10px] text-[var(--ui-text-muted)]">
              {STRINGS.sociogram.reciprocityAgentsLabel}
            </div>
          </div>
          <div>
            <div className="font-mono-data text-sm font-bold text-[var(--ui-text)]">
              {primaryStats.componentCount}
            </div>
            <div className="text-[10px] text-[var(--ui-text-muted)]">
              {STRINGS.sociogram.componentsLabel}
            </div>
          </div>
        </div>

        {/* Daftar komponen terhubung & anggotanya */}
        <div className="space-y-1">
          {primaryStats.components.map((members, idx) => (
            <div
              key={members[0] ?? idx}
              className="rounded border border-[var(--ui-border)] bg-[var(--ui-surface)] px-2.5 py-1.5 text-[11px]"
            >
              <span className="font-semibold text-[var(--ui-text)]">
                {STRINGS.sociogram.componentGroupPrefix} {idx + 1} ({members.length} anggota):{' '}
              </span>
              <span className="text-[var(--ui-text-muted)]">
                {members.map((id) => agentById.get(id)?.name ?? id).join(', ')}
              </span>
            </div>
          ))}
        </div>

        {/* Tabel per agen */}
        <div>
          <h4 className="mb-1.5 text-[11px] font-semibold text-[var(--ui-text)]">
            {STRINGS.sociogram.tableTitle}
          </h4>
          <div className="max-h-56 overflow-y-auto rounded-lg border border-[var(--ui-border)]">
            <table className="w-full border-collapse text-left text-[11px]">
              <thead className="sticky top-0 bg-[var(--ui-surface-muted)] text-[10px] text-[var(--ui-text-muted)]">
                <tr>
                  <th className="px-2 py-1.5 font-semibold">{STRINGS.sociogram.colName}</th>
                  <th className="px-1.5 py-1.5 text-right font-semibold">{STRINGS.sociogram.colIn}</th>
                  <th className="px-1.5 py-1.5 text-right font-semibold">{STRINGS.sociogram.colOut}</th>
                  <th className="px-2 py-1.5 font-semibold">{STRINGS.sociogram.colStatus}</th>
                  <th className="px-1.5 py-1.5 text-right font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--ui-border)] bg-[var(--ui-surface)]">
                {primaryStats.orderedMetrics.map((m) => {
                  const active = m.agentId === selectedAgentId;
                  return (
                    <tr
                      key={m.agentId}
                      className={active ? 'bg-[var(--ui-accent-soft)]' : 'hover:bg-[var(--ui-surface-muted)]'}
                    >
                      <td className="px-2 py-1.5">
                        <button
                          type="button"
                          onClick={() => onSelectAgent(m.agentId)}
                          className="text-left font-medium text-[var(--ui-text)] hover:underline"
                        >
                          {m.name}
                        </button>
                      </td>
                      <td className="font-mono-data px-1.5 py-1.5 text-right text-[var(--ui-text)]">
                        {m.receivedCount}
                      </td>
                      <td className="font-mono-data px-1.5 py-1.5 text-right text-[var(--ui-text-muted)]">
                        {m.sentCount}
                      </td>
                      <td className="px-2 py-1.5 text-[var(--ui-text-muted)]">
                        {formatNodeStatusText(m)}
                      </td>
                      <td className="px-1.5 py-1.5 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenHypothesisForAgent(m.agentId)}
                          className="whitespace-nowrap font-medium text-[var(--ui-accent)] hover:underline"
                        >
                          Hipotesis
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Daftar Hipotesis Tersimpan */}
      <section aria-label={STRINGS.sociogram.savedHypothesesTitle} className="border-t border-[var(--ui-border)] pt-3">
        <h3 className="text-xs font-bold text-[var(--ui-text)]">
          {STRINGS.sociogram.savedHypothesesTitle} ({hypotheses.length})
        </h3>
        {hypotheses.length === 0 ? (
          <p className="mt-1 text-[11px] text-[var(--ui-text-muted)]">
            {STRINGS.sociogram.noHypothesesYet}
          </p>
        ) : (
          <ul className="mt-1.5 space-y-1.5">
            {hypotheses.map((h) => (
              <li
                key={h.id}
                className="rounded border border-[var(--ui-border)] bg-[var(--ui-surface-muted)] px-2.5 py-2 text-[11px]"
              >
                <div className="flex items-center justify-between gap-2 font-semibold text-[var(--ui-text)]">
                  <span>{h.agentName}</span>
                  <span className="font-mono-data text-[10px] font-normal text-[var(--ui-text-muted)]">
                    Hari {h.day} · {h.timeFormatted} · Keyakinan {h.confidence}
                  </span>
                </div>
                <p className="mt-1 text-[var(--ui-text)]">{h.hypothesisText}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};
