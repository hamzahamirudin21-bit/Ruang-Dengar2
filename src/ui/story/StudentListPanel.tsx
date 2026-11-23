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
      <div className="flex shrink-0 items-center justify-between gap-2 border-b-[2.5px] border-[#3e2517] bg-gradient-to-r from-[#f8e6c1] to-[#f2d8a6] px-4 py-3">
        {!collapsed && (
          <h2 className="font-['Fredoka'] text-base font-bold tracking-wide text-[#3e2517]">
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
        <ul className="min-w-0 flex-1 space-y-2 overflow-y-auto overflow-x-hidden p-3">
          {rows.map((row) => {
            const active = row.id === activeId;
            return (
              <li
                key={row.id}
                aria-current={active ? 'true' : undefined}
                className={`flex items-center gap-2.5 rounded-2xl border-2 px-2.5 py-1.5 transition ${
                  active
                    ? 'border-[#3e2517] bg-[#e4f7f1] shadow-[0_3px_0_#3e2517]'
                    : 'border-[#3e2517]/20 bg-[#fffdf7]'
                }`}
              >
                <div
                  className={`h-9 w-9 shrink-0 overflow-hidden rounded-full border-2 ${
                    active ? 'border-[#2e8274]' : 'border-[#3e2517]/40'
                  } bg-[#f5e7cb]`}
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
                  className={`min-w-0 flex-1 truncate font-['Fredoka'] text-sm text-[#3e2517] ${
                    active ? 'font-bold' : 'font-semibold'
                  }`}
                >
                  {row.name}
                  {active && <span className="sr-only"> ({S.activeMarkerLabel})</span>}
                </span>
                {active && (
                  <span
                    aria-hidden="true"
                    className="h-2.5 w-2.5 shrink-0 rounded-full border border-[#3e2517] bg-[#2e8274]"
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
