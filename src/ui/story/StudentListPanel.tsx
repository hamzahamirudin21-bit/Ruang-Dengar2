import React from 'react';
import { STRINGS } from '../../data/strings';
import { PixelPortrait } from '../characters/PixelPortrait';
import { IconPanahCiut, IconPanahLuas, StatusShapeIcon } from '../components/GameIcons';
import type { StudentListRow } from './storyLayout';

export interface StudentListPanelProps {
  rows: readonly StudentListRow[];
  activeId: string | null;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  className?: string;
}

export const StudentListPanel: React.FC<StudentListPanelProps> = ({
  rows,
  activeId,
  collapsed,
  onToggleCollapsed,
  className = '',
}) => {
  const S = STRINGS.story;
  const toggleLabel = collapsed ? S.expandPanel : S.collapsePanel;

  return (
    <aside
      aria-label={S.studentListAria}
      className={`flex flex-col overflow-hidden ${className}`}
      style={{ color: 'var(--vnp-ink)' }}
    >
      <div
        className="flex shrink-0 items-center justify-between gap-2 border-b px-4 py-3"
        style={{ borderColor: 'var(--vnp-border)', background: 'rgba(27, 42, 73, 0.06)' }}
      >
        {!collapsed && (
          <h2 className="text-sm font-extrabold tracking-wide" style={{ color: 'var(--vn-navy)' }}>
            {S.studentListTitle(rows.length)}
          </h2>
        )}
        <button
          type="button"
          onClick={onToggleCollapsed}
          aria-label={toggleLabel}
          aria-expanded={!collapsed}
          title={toggleLabel}
          className="vn-pill ml-auto !min-h-[28px] !px-2.5"
        >
          {collapsed ? <IconPanahLuas className="h-3.5 w-3.5" /> : <IconPanahCiut className="h-3.5 w-3.5" />}
        </button>
      </div>

      {!collapsed && (
        <ul className="min-w-0 flex-1 space-y-1.5 overflow-y-auto overflow-x-hidden p-3">
          {rows.map((row) => {
            const active = row.id === activeId;
            return (
              <li
                key={row.id}
                aria-current={active ? 'true' : undefined}
                className="flex items-center gap-2.5 rounded-xl border px-2.5 py-1.5 transition-colors"
                style={{
                  borderColor: active ? 'var(--vn-accent)' : 'var(--vnp-border)',
                  background: active ? 'rgba(29, 93, 122, 0.12)' : 'rgba(255, 255, 255, 0.72)',
                  color: 'var(--vnp-ink)',
                }}
              >
                <div
                  className="h-9 w-9 shrink-0 overflow-hidden rounded-full border"
                  style={{
                    borderColor: active ? 'var(--vn-accent)' : 'var(--vnp-border-strong)',
                    background: '#efe7d8',
                  }}
                >
                  <div className="h-full w-full [&>canvas]:!h-full [&>canvas]:!w-full [&>canvas]:object-cover [&>canvas]:object-top [&>img]:!h-full [&>img]:!w-full">
                    <PixelPortrait
                      studentId={row.id}
                      name={row.name}
                      expression="netral"
                      scale={1}
                      fit="cover-head"
                      reducedMotion
                    />
                  </div>
                </div>
                <span
                  title={row.name}
                  className={`min-w-0 flex-1 truncate text-sm ${active ? 'font-extrabold' : 'font-semibold'}`}
                >
                  {row.name}
                  {active && <span className="sr-only"> ({S.activeMarkerLabel})</span>}
                </span>
                {active && (
                  <span
                    aria-hidden="true"
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ background: 'var(--vn-accent)' }}
                  />
                )}
                <StatusShapeIcon shape={row.statusShape} className="h-3 w-3 shrink-0 opacity-70" />
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
};
