import React from 'react';
import { LAB_MAP } from '../../data/map';
import { STRINGS } from '../../data/strings';
import { STUDENT_COUNT } from '../../data/agents.seed';
import {
  CanvasViewOptions,
  ClockState,
  ConsultationDoorMode,
  DevPathTestState,
  LabEvent,
  RandomSessionsAuditResult,
  SimulationSpeed,
  WorldSocialSummary,
  ZoneType,
} from '../../types';

interface DevPanelProps {
  isOpen: boolean;
  seed: number;
  clock: ClockState;
  viewOptions: CanvasViewOptions;
  selectedTestZoneId: ZoneType;
  devPathTest: DevPathTestState | null;
  worldSummary: WorldSocialSummary;
  activeEvents: readonly LabEvent[];
  randomSessionsAudit: RandomSessionsAuditResult | null;
  onClose: () => void;
  onChangeSeed: (nextSeed: number) => void;
  onTogglePause: () => void;
  onChangeSpeed: (speed: SimulationSpeed) => void;
  onUpdateViewOptions: (patch: Partial<CanvasViewOptions>) => void;
  onSelectTestZone: (zoneId: ZoneType) => void;
  onRunPathTest: () => void;
  onClearPathTest: () => void;
  onPrintSociometryDebug: () => void;
  onAdvanceOneDay: () => void;
  onRun100RandomSessions: () => void;
}

export const DevPanel: React.FC<DevPanelProps> = ({
  isOpen,
  seed,
  clock,
  viewOptions,
  selectedTestZoneId,
  devPathTest,
  worldSummary,
  activeEvents,
  randomSessionsAudit,
  onClose,
  onChangeSeed,
  onTogglePause,
  onChangeSpeed,
  onUpdateViewOptions,
  onSelectTestZone,
  onRunPathTest,
  onClearPathTest,
  onPrintSociometryDebug,
  onAdvanceOneDay,
  onRun100RandomSessions,
}) => {
  if (!isOpen) return null;

  const speeds: SimulationSpeed[] = [1, 2, 4];

  const renderTestStatus = () => {
    if (!devPathTest || !devPathTest.active) {
      return STRINGS.devPanel.statusIdle;
    }
    if (!devPathTest.reachable) {
      return STRINGS.devPanel.statusUnreachable;
    }
    if (devPathTest.stepIndex >= devPathTest.path.length - 1) {
      return STRINGS.devPanel.statusReached;
    }
    return STRINGS.devPanel.statusRunning;
  };

  return (
    <aside
      aria-label={STRINGS.devPanel.title}
      data-testid="dev-panel"
      className="responsive-dev-panel fixed top-28 left-4 z-40 max-h-[calc(100vh-13rem)] w-80 max-w-[calc(100vw-2rem)] overflow-y-auto rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface)] p-4 shadow-xl"
    >
      <div className="flex items-center justify-between gap-2 border-b border-[var(--ui-border)] pb-2.5">
        <h2 className="text-sm font-semibold text-[var(--ui-text)]">
          {STRINGS.devPanel.title}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 whitespace-nowrap rounded border border-[var(--ui-border)] px-2.5 py-1 text-xs font-medium text-[var(--ui-text-muted)] hover:bg-[var(--ui-surface-muted)]"
        >
          {STRINGS.devPanel.close}
        </button>
      </div>

      <div className="mt-3 space-y-3 text-xs">
        {/* Seed */}
        <div className="flex items-center justify-between gap-2">
          <label htmlFor="dev-seed-input" className="font-medium text-[var(--ui-text)]">
            {STRINGS.devPanel.seedLabel}
          </label>
          <input
            id="dev-seed-input"
            type="number"
            min={1}
            value={seed}
            onChange={(e) => onChangeSeed(Math.max(1, Number(e.target.value) || 1))}
            className="font-mono-data w-28 rounded border border-[var(--ui-border)] px-2 py-1 text-right text-[var(--ui-text)]"
          />
        </div>

        {/* Kecepatan */}
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium text-[var(--ui-text)]">{STRINGS.devPanel.speedLabel}</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onTogglePause}
              className={`rounded border px-2 py-1 font-medium ${
                clock.paused
                  ? 'border-[var(--ui-accent)] bg-[var(--ui-accent-soft)] text-[var(--ui-accent)]'
                  : 'border-[var(--ui-border)] text-[var(--ui-text)]'
              }`}
            >
              {STRINGS.statusBar.pause}
            </button>
            {speeds.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onChangeSpeed(s)}
                className={`font-mono-data rounded border px-2 py-1 font-medium ${
                  !clock.paused && clock.speed === s
                    ? 'border-[var(--ui-accent)] bg-[var(--ui-accent-soft)] text-[var(--ui-accent)]'
                    : 'border-[var(--ui-border)] text-[var(--ui-text)]'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Toggles tampilan */}
        <div className="space-y-1.5 rounded-lg bg-[var(--ui-surface-muted)] p-2.5">
          <label className="flex cursor-pointer items-center justify-between">
            <span className="text-[var(--ui-text)]">{STRINGS.devPanel.showGrid}</span>
            <input
              type="checkbox"
              checked={viewOptions.showGrid}
              onChange={(e) => onUpdateViewOptions({ showGrid: e.target.checked })}
              className="h-4 w-4 accent-[var(--ui-accent)]"
            />
          </label>
          <label className="flex cursor-pointer items-center justify-between">
            <span className="text-[var(--ui-text)]">{STRINGS.devPanel.showZoneLabels}</span>
            <input
              type="checkbox"
              checked={viewOptions.showZoneLabels}
              onChange={(e) => onUpdateViewOptions({ showZoneLabels: e.target.checked })}
              className="h-4 w-4 accent-[var(--ui-accent)]"
            />
          </label>
        </div>

        {/* Mode pintu konsultasi */}
        <div className="flex items-center justify-between gap-2">
          <label htmlFor="dev-door-mode" className="font-medium text-[var(--ui-text)]">
            {STRINGS.devPanel.doorModeLabel}
          </label>
          <select
            id="dev-door-mode"
            value={viewOptions.consultationDoorMode}
            onChange={(e) =>
              onUpdateViewOptions({
                consultationDoorMode: e.target.value as ConsultationDoorMode,
              })
            }
            className="rounded border border-[var(--ui-border)] bg-[var(--ui-surface)] px-2 py-1 text-[var(--ui-text)]"
          >
            <option value="lab">{STRINGS.canvasToolbar.doorModeLab}</option>
            <option value="samping">{STRINGS.canvasToolbar.doorModeSide}</option>
          </select>
        </div>

        {/* Uji A* Teleport titik lalu jalan */}
        <div className="border-t border-[var(--ui-border)] pt-2.5">
          <label htmlFor="dev-target-zone" className="block font-medium text-[var(--ui-text)]">
            {STRINGS.devPanel.targetZoneLabel}
          </label>
          <select
            id="dev-target-zone"
            value={selectedTestZoneId}
            onChange={(e) => onSelectTestZone(e.target.value as ZoneType)}
            className="mt-1 w-full rounded border border-[var(--ui-border)] bg-[var(--ui-surface)] px-2 py-1.5 text-[var(--ui-text)]"
          >
            {LAB_MAP.zones.map((zone) => (
              <option key={zone.id} value={zone.id}>
                {zone.label}
              </option>
            ))}
          </select>

          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onRunPathTest}
              className="flex-1 rounded-lg bg-[var(--ui-accent)] px-3 py-1.5 font-semibold text-white hover:bg-[var(--ui-accent-hover)]"
            >
              {STRINGS.devPanel.testButton}
            </button>
            {devPathTest?.active && (
              <button
                type="button"
                onClick={onClearPathTest}
                className="rounded-lg border border-[var(--ui-border)] px-2.5 py-1.5 font-medium text-[var(--ui-text-muted)] hover:bg-[var(--ui-surface-muted)]"
              >
                {STRINGS.devPanel.clearTest}
              </button>
            )}
          </div>

          <p className="mt-2 text-[var(--ui-text-muted)]" role="status">
            {renderTestStatus()}
          </p>

          {devPathTest?.active && (
            <div className="font-mono-data mt-2 grid grid-cols-2 gap-1.5 rounded bg-[var(--ui-surface-muted)] p-2 text-[11px] text-[var(--ui-text)]">
              <div>
                {STRINGS.devPanel.telemetryLabels.start}: ({devPathTest.start.x},
                {devPathTest.start.y})
              </div>
              <div>
                {STRINGS.devPanel.telemetryLabels.goal}: ({devPathTest.targetSlot.x},
                {devPathTest.targetSlot.y})
              </div>
              <div>
                {STRINGS.devPanel.telemetryLabels.steps}: {devPathTest.path.length}
              </div>
              <div>
                {STRINGS.devPanel.telemetryLabels.wallCollisions}: {devPathTest.wallCollisions}
              </div>
            </div>
          )}
        </div>

        {/* Ringkasan Simulasi Mahasiswa & Event Lab */}
        <div className="border-t border-[var(--ui-border)] pt-2.5">
          <p className="font-semibold text-[var(--ui-text)]">
            {STRINGS.devPanel.worldStatsTitle(STUDENT_COUNT)} ({worldSummary.totalAgents})
          </p>
          <div className="font-mono-data mt-1.5 grid grid-cols-2 gap-1 rounded bg-[var(--ui-surface-muted)] p-2 text-[11px] text-[var(--ui-text)]">
            <div>Bekerja: {worldSummary.byActivity.bekerja}</div>
            <div>Berpindah: {worldSummary.byActivity.berpindah}</div>
            <div>Mengobrol: {worldSummary.byActivity.mengobrol}</div>
            <div>Istirahat: {worldSummary.byActivity.istirahat}</div>
            <div>Interaksi: {worldSummary.activeInteractions}</div>
            <div>Gesekan: {worldSummary.mildConflicts}</div>
            <div>Energi rata: {Math.round(worldSummary.averageEnergy * 100)}%</div>
            <div>Stres rata: {Math.round(worldSummary.averageStress * 100)}%</div>
          </div>

          <p className="mt-2.5 font-semibold text-[var(--ui-text)]">
            {STRINGS.devPanel.activeEventsTitle}
          </p>
          {activeEvents.length === 0 ? (
            <p className="mt-1 text-[11px] text-[var(--ui-text-muted)]">
              {STRINGS.devPanel.noActiveEvents}
            </p>
          ) : (
            <ul className="mt-1 space-y-1 text-[11px] text-[var(--ui-text-muted)]">
              {activeEvents.slice(0, 3).map((ev) => (
                <li key={ev.id} className="rounded bg-[var(--ui-surface-muted)] px-2 py-1">
                  <span className="font-semibold text-[var(--ui-text)]">{ev.title}</span>
                  <span> · sisa {ev.remainingTicks * 5}m</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Audit Sosiometri & Jaringan */}
        <div className="space-y-1.5 border-t border-[var(--ui-border)] pt-2.5">
          <p className="font-semibold text-[var(--ui-text)]">
            {STRINGS.devPanel.sociometryDebugTitle}
          </p>
          <button
            type="button"
            onClick={onPrintSociometryDebug}
            className="w-full rounded-lg border border-[var(--ui-border)] bg-[var(--ui-surface)] px-2.5 py-1.5 text-[11px] font-semibold text-[var(--ui-text)] hover:bg-[var(--ui-surface-muted)]"
          >
            {STRINGS.devPanel.printSociometryBtn}
          </button>
          <button
            type="button"
            onClick={onAdvanceOneDay}
            className="w-full rounded-lg border border-[var(--ui-border)] bg-[var(--ui-surface-muted)] px-2.5 py-1.5 text-[11px] font-medium text-[var(--ui-text)] hover:bg-[var(--ui-surface)]"
          >
            {STRINGS.devPanel.advanceDayBtn}
          </button>
        </div>

        {/* Uji Mesin Kepercayaan & Keretakan (Tahap 5) */}
        <div className="space-y-1.5 border-t border-[var(--ui-border)] pt-2.5">
          <p className="font-semibold text-[var(--ui-text)]">
            {STRINGS.devPanel.trustSimulationTitle}
          </p>
          <button
            type="button"
            data-testid="dev-simulate-100-sessions-btn"
            onClick={onRun100RandomSessions}
            className="w-full rounded-lg border border-[var(--ui-accent)] bg-[var(--ui-accent-soft)] px-2.5 py-1.5 text-[11px] font-semibold text-[var(--ui-accent)] hover:bg-[var(--ui-surface)]"
          >
            {STRINGS.devPanel.simulate100SessionsBtn}
          </button>
          {randomSessionsAudit && (
            <div
              data-testid="dev-simulate-100-result"
              className="font-mono-data rounded border border-[var(--ui-border)] bg-[var(--ui-surface-muted)] p-2 text-[10px] leading-relaxed text-[var(--ui-text)]"
            >
              <div>
                Status:{' '}
                <span className="font-bold">
                  {randomSessionsAudit.allInvariantsPassed ? 'LULUS' : 'GAGAL'}
                </span>{' '}
                ({randomSessionsAudit.sessionCount} sesi, {randomSessionsAudit.totalTurns} giliran)
              </div>
              <div>Kepercayaan di luar 0-100: {randomSessionsAudit.trustOutOfBoundsCount}</div>
              <div>Lompatan level &gt; 1: {randomSessionsAudit.levelJumpGtOneCount}</div>
              <div>Penghambat naik level: {randomSessionsAudit.harmfulRaisedLevelCount}</div>
              <div>
                Retak (Menarik diri / Konfrontasi): {randomSessionsAudit.withdrawalRuptureCount} /{' '}
                {randomSessionsAudit.confrontationRuptureCount}
              </div>
              <div>Perbaikan berhasil: {randomSessionsAudit.repairedRuptureCount}</div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

