import React, { useEffect, useMemo, useState } from 'react';
import { LAB_MAP } from '../data/map';
import { STRINGS } from '../data/strings';
import {
  detectInterpretiveWordsInFacts,
  extractAgentBehavioralFacts,
  extractGroupBehavioralFacts,
  getAgentTileHeatmap,
} from '../engine/observationLog';
import {
  AnecdotalRecord,
  ObservationLogState,
  StudentAgent,
  ZoneType,
} from '../types';

export interface ObservationPanelProps {
  agents: readonly StudentAgent[];
  observationLog: ObservationLogState;
  currentDay: number;
  currentTimeFormatted: string;
  selectedAgentId: string | null;
  onSelectAgent: (agentId: string | null) => void;
  anecdotalRecords: readonly AnecdotalRecord[];
  onAddAnecdotalRecord: (record: Omit<AnecdotalRecord, 'id'>) => void;
}

export const ObservationPanel: React.FC<ObservationPanelProps> = ({
  agents,
  observationLog,
  currentDay,
  currentTimeFormatted,
  selectedAgentId,
  onSelectAgent,
  anecdotalRecords,
  onAddAnecdotalRecord,
}) => {
  const selectedAgent = useMemo(
    () => (selectedAgentId ? agents.find((a) => a.id === selectedAgentId) ?? null : null),
    [agents, selectedAgentId]
  );

  const [dateLabel, setDateLabel] = useState<string>(`Hari ${currentDay}`);
  const [timeLabel, setTimeLabel] = useState<string>(currentTimeFormatted);
  const [locationZoneId, setLocationZoneId] = useState<ZoneType>(
    selectedAgent?.currentZoneId ?? 'diskusi'
  );
  const [observedFact, setObservedFact] = useState<string>('');
  const [counselorInterpretation, setCounselorInterpretation] = useState<string>('');

  // Sinkronkan tanggal, jam, dan lokasi bawaan ketika mahasiswa yang dipilih berubah
  useEffect(() => {
    setDateLabel(`Hari ${currentDay}`);
    setTimeLabel(currentTimeFormatted);
    if (selectedAgent) {
      setLocationZoneId(selectedAgent.currentZoneId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAgentId]);

  const factualPatterns = useMemo(() => {
    if (selectedAgent) {
      return extractAgentBehavioralFacts(
        observationLog,
        selectedAgent,
        agents,
        LAB_MAP
      );
    }
    return extractGroupBehavioralFacts(observationLog, agents, LAB_MAP);
  }, [observationLog, selectedAgent, agents]);

  const heatmap = useMemo(() => {
    if (!selectedAgent) return null;
    return getAgentTileHeatmap(observationLog, selectedAgent.id);
  }, [observationLog, selectedAgent]);

  const detectedInterpretiveWords = useMemo(
    () => detectInterpretiveWordsInFacts(observedFact),
    [observedFact]
  );

  const handleMoveFactToInterpretation = () => {
    if (!observedFact.trim()) return;
    setCounselorInterpretation((prev) =>
      prev.trim()
        ? `${prev.trim()}\n${observedFact.trim()}`
        : observedFact.trim()
    );
    setObservedFact('');
  };

  const handleSubmitAnecdotal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgent || !observedFact.trim()) return;

    onAddAnecdotalRecord({
      agentId: selectedAgent.id,
      agentName: selectedAgent.name,
      dateLabel: dateLabel.trim() || `Hari ${currentDay}`,
      timeLabel: timeLabel.trim() || currentTimeFormatted,
      locationZoneId,
      observedFact: observedFact.trim(),
      counselorInterpretation: counselorInterpretation.trim(),
      detectedInterpretiveWords,
      createdAtDay: currentDay,
    });

    setObservedFact('');
    setCounselorInterpretation('');
  };

  const filteredRecords = useMemo(() => {
    if (!selectedAgent) return anecdotalRecords;
    return anecdotalRecords.filter((r) => r.agentId === selectedAgent.id);
  }, [anecdotalRecords, selectedAgent]);

  return (
    <div className="space-y-4 text-xs text-[#3e2517]" data-testid="observation-panel">
      {/* Pemilih Mahasiswa */}
      <div className="rounded-2xl border-2 border-[#3e2517]/30 bg-[#fffdf7] p-3 shadow-[inset_0_-3px_0_#f0e0bf]">
        <label
          htmlFor="obs-student-select"
          className="block font-['Fredoka'] text-xs font-bold text-[#3e2517]"
        >
          {STRINGS.observation.selectStudentLabel}
        </label>
        <select
          id="obs-student-select"
          value={selectedAgentId ?? ''}
          onChange={(e) => onSelectAgent(e.target.value || null)}
          className="mt-1.5 w-full rounded-xl border-2 border-[#3e2517]/40 bg-[#fff9ec] px-2.5 py-2 text-xs font-semibold text-[#3e2517]"
        >
          <option value="">{STRINGS.observation.allStudentsOverviewOption}</option>
          {agents.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name} (Angkatan {a.cohort})
            </option>
          ))}
        </select>
      </div>

      {/* Pola Perilaku Teramati (Fakta Murni, tanpa tafsir) */}
      <section aria-label={STRINGS.observation.patternsTitle} className="rounded-2xl border-2 border-[#3e2517]/30 bg-[#fffdf7] p-3.5 shadow-[inset_0_-3px_0_#f0e0bf]">
        <h3 className="font-['Fredoka'] text-xs font-bold text-[#3e2517]">
          {STRINGS.observation.patternsTitle}
          {selectedAgent ? ` — ${selectedAgent.name}` : ''}
        </h3>
        {factualPatterns.length === 0 ? (
          <p className="mt-1.5 text-[11px] text-[#6b482e]">
            {STRINGS.observation.noPatternsYet}
          </p>
        ) : (
          <ul className="mt-2 list-disc space-y-1.5 pl-4 text-[11px] leading-relaxed text-[#3e2517]">
            {factualPatterns.map((fact, idx) => (
              <li key={idx}>{fact}</li>
            ))}
          </ul>
        )}
      </section>

      {/* Peta Panas Keberadaan 40 x 24 */}
      <section aria-label={STRINGS.observation.heatmapTitle} className="rounded-2xl border-2 border-[#3e2517]/30 bg-[#fffdf7] p-3.5 shadow-[inset_0_-3px_0_#f0e0bf]">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-['Fredoka'] text-xs font-bold text-[#3e2517]">
            {STRINGS.observation.heatmapTitle}
          </h3>
          {selectedAgent && (
            <div className="flex items-center gap-1.5 text-[10px] text-[var(--ui-text-muted)]">
              <span>{STRINGS.observation.heatmapLegendLow}</span>
              <span className="inline-block h-2.5 w-2.5 rounded-xs bg-[#bae6fd]" aria-hidden="true" />
              <span className="inline-block h-2.5 w-2.5 rounded-xs bg-[#0284c7]" aria-hidden="true" />
              <span className="inline-block h-2.5 w-2.5 rounded-xs bg-[#b45309]" aria-hidden="true" />
              <span>{STRINGS.observation.heatmapLegendHigh}</span>
            </div>
          )}
        </div>

        {!selectedAgent || !heatmap ? (
          <p className="mt-1.5 text-[11px] text-[var(--ui-text-muted)]">
            {STRINGS.observation.heatmapEmpty}
          </p>
        ) : (
          <div className="mt-2">
            <svg
              viewBox={`0 0 ${LAB_MAP.width} ${LAB_MAP.height}`}
              role="img"
              aria-label={`${STRINGS.observation.heatmapTitle} ${selectedAgent.name}`}
              className="block h-auto w-full rounded border border-[var(--ui-border)] bg-[#f8fafc]"
            >
              {/* Batas 9 zona lab */}
              {LAB_MAP.zones.map((z) => (
                <g key={z.id}>
                  <rect
                    x={z.bounds.x}
                    y={z.bounds.y}
                    width={z.bounds.w}
                    height={z.bounds.h}
                    fill="#ffffff"
                    stroke="#cbd5e1"
                    strokeWidth="0.16"
                  />
                  <text
                    x={z.bounds.x + z.bounds.w / 2}
                    y={z.bounds.y + z.bounds.h - 0.5}
                    textAnchor="middle"
                    fontSize="0.85"
                    fill="#94a3b8"
                  >
                    {z.shortLabel}
                  </text>
                </g>
              ))}

              {/* Petak panas keberadaan agen */}
              {Object.entries(heatmap.counts).map(([key, count]) => {
                const [xs, ys] = key.split(',');
                const x = Number(xs);
                const y = Number(ys);
                const ratio = heatmap.maxCount > 0 ? count / heatmap.maxCount : 0;
                const fill =
                  ratio > 0.65
                    ? '#b45309'
                    : ratio > 0.3
                      ? '#0284c7'
                      : '#38bdf8';
                const opacity = Math.min(0.88, 0.25 + ratio * 0.65);
                return (
                  <rect
                    key={key}
                    x={x}
                    y={y}
                    width={1}
                    height={1}
                    fill={fill}
                    fillOpacity={opacity}
                  >
                    <title>{`Petak (${x},${y}): ${count} interval`}</title>
                  </rect>
                );
              })}
            </svg>
          </div>
        )}
      </section>

      {/* Formulir Catatan Anekdot (FAKTA terpisah dari TAFSIR) */}
      <section aria-label={STRINGS.observation.anecdotalTitle} className="rounded-2xl border-2 border-[#3e2517]/30 bg-[#fffdf7] p-3.5 shadow-[inset_0_-3px_0_#f0e0bf]">
        <h3 className="font-['Fredoka'] text-xs font-bold text-[#3e2517]">
          📝 {STRINGS.observation.anecdotalTitle}
        </h3>

        {!selectedAgent ? (
          <p className="mt-2 rounded-xl border-2 border-dashed border-[#3e2517]/25 bg-[#fff7e2] p-3 text-[11px] text-[#6b482e]">
            {STRINGS.observation.anecdotalStudentRequired}
          </p>
        ) : (
          <form onSubmit={handleSubmitAnecdotal} className="mt-2.5 space-y-2.5">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="anecdotal-date" className="block font-['Fredoka'] text-[11px] font-bold text-[#5c3d26]">
                  {STRINGS.observation.fieldDate}
                </label>
                <input
                  id="anecdotal-date"
                  type="text"
                  value={dateLabel}
                  onChange={(e) => setDateLabel(e.target.value)}
                  className="mt-1 w-full rounded-xl border-2 border-[#3e2517]/35 bg-[#fffaf0] px-2.5 py-1.5 text-xs text-[#3e2517]"
                />
              </div>
              <div>
                <label htmlFor="anecdotal-time" className="block font-['Fredoka'] text-[11px] font-bold text-[#5c3d26]">
                  {STRINGS.observation.fieldTime}
                </label>
                <input
                  id="anecdotal-time"
                  type="text"
                  value={timeLabel}
                  onChange={(e) => setTimeLabel(e.target.value)}
                  className="font-mono-data mt-1 w-full rounded-xl border-2 border-[#3e2517]/35 bg-[#fffaf0] px-2.5 py-1.5 text-xs text-[#3e2517]"
                />
              </div>
            </div>

            <div>
              <label htmlFor="anecdotal-location" className="block font-['Fredoka'] text-[11px] font-bold text-[#5c3d26]">
                {STRINGS.observation.fieldLocation}
              </label>
              <select
                id="anecdotal-location"
                value={locationZoneId}
                onChange={(e) => setLocationZoneId(e.target.value as ZoneType)}
                className="mt-1 w-full rounded-xl border-2 border-[#3e2517]/35 bg-[#fffaf0] px-2.5 py-1.5 text-xs font-semibold text-[#3e2517]"
              >
                {LAB_MAP.zones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="anecdotal-fact" className="block font-['Fredoka'] text-[11px] font-bold text-[#3e2517]">
                {STRINGS.observation.fieldFact}
              </label>
              <textarea
                id="anecdotal-fact"
                rows={3}
                required
                value={observedFact}
                onChange={(e) => setObservedFact(e.target.value)}
                placeholder={STRINGS.observation.fieldFactPlaceholder}
                className="mt-1 w-full rounded-xl border-2 border-[#3e2517]/35 bg-[#fffaf0] px-2.5 py-1.5 text-xs text-[#3e2517]"
              />

              {detectedInterpretiveWords.length > 0 && (
                <div
                  role="status"
                  data-testid="anecdotal-fact-warning"
                  className="mt-1.5 rounded-xl border-2 border-[#c9862d] bg-[#fff5d6] p-2.5 text-[11px] text-[#6b4208]"
                >
                  <p className="font-bold">
                    {STRINGS.observation.interpretiveWarningPrefix}{' '}
                    <span className="underline">
                      {detectedInterpretiveWords.join(', ')}
                    </span>
                  </p>
                  <p className="mt-0.5 leading-relaxed">
                    {STRINGS.observation.interpretiveWarningAdvice}
                  </p>
                  <button
                    type="button"
                    onClick={handleMoveFactToInterpretation}
                    className="mt-1.5 cursor-pointer rounded-full border-2 border-[#3e2517] bg-[#fffdf6] px-3 py-1 font-['Fredoka'] text-[11px] font-bold text-[#3e2517] hover:bg-[#ffe9a6]"
                  >
                    {STRINGS.observation.moveToInterpretationBtn}
                  </button>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="anecdotal-interpretation" className="block font-['Fredoka'] text-[11px] font-bold text-[#3e2517]">
                {STRINGS.observation.fieldInterpretation}
              </label>
              <textarea
                id="anecdotal-interpretation"
                rows={2}
                value={counselorInterpretation}
                onChange={(e) => setCounselorInterpretation(e.target.value)}
                placeholder={STRINGS.observation.fieldInterpretationPlaceholder}
                className="mt-1 w-full rounded-xl border-2 border-[#3e2517]/35 bg-[#fffaf0] px-2.5 py-1.5 text-xs text-[#3e2517]"
              />
            </div>

            <button
              type="submit"
              className="game-btn-primary w-full text-xs"
            >
              {STRINGS.observation.saveAnecdotalBtn}
            </button>
          </form>
        )}
      </section>

      {/* Daftar Catatan Anekdot Tersimpan */}
      <section aria-label={STRINGS.observation.savedAnecdotalTitle} className="border-t-2 border-dashed border-[#3e2517]/20 pt-3">
        <h3 className="font-['Fredoka'] text-xs font-bold text-[#3e2517]">
          {STRINGS.observation.savedAnecdotalTitle} ({filteredRecords.length})
        </h3>
        {filteredRecords.length === 0 ? (
          <p className="mt-1 text-[11px] text-[#6b482e]">
            {STRINGS.observation.noAnecdotalYet}
          </p>
        ) : (
          <ul className="mt-2 space-y-2">
            {filteredRecords.map((rec) => {
              const zoneName =
                LAB_MAP.zones.find((z) => z.id === rec.locationZoneId)?.shortLabel ??
                rec.locationZoneId;
              return (
                <li
                  key={rec.id}
                  className="rounded-2xl border-2 border-[#3e2517]/25 bg-[#fffdf7] p-3 text-[11px] shadow-[inset_0_-2px_0_#f0e0bf]"
                >
                  <div className="flex items-center justify-between gap-2 font-semibold text-[var(--ui-text)]">
                    <span>{rec.agentName}</span>
                    <span className="font-mono-data text-[10px] font-normal text-[var(--ui-text-muted)]">
                      {rec.dateLabel} · {rec.timeLabel} · {zoneName}
                    </span>
                  </div>
                  <p className="mt-1 text-[var(--ui-text)]">
                    <span className="font-semibold">{STRINGS.observation.factTag} </span>
                    {rec.observedFact}
                  </p>
                  {rec.counselorInterpretation && (
                    <p className="mt-1 text-[var(--ui-text-muted)]">
                      <span className="font-semibold">{STRINGS.observation.interpretationTag} </span>
                      {rec.counselorInterpretation}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
};
