import React, { useState } from 'react';
import { STRINGS } from '../../data/strings';
import {
  IconJadwal,
  IconLog,
  IconPanahCiut,
  IconPanahLuas,
  IconProfil,
  IconRelasi,
  IconRiwayat,
} from '../components/GameIcons';
import type { ProfileTabId, StudentProfile } from './studentProfile';

const TABS: readonly { id: ProfileTabId; Icon: React.FC<{ className?: string }> }[] = [
  { id: 'profil', Icon: IconProfil },
  { id: 'jadwal', Icon: IconJadwal },
  { id: 'riwayat', Icon: IconRiwayat },
  { id: 'relasi', Icon: IconRelasi },
];

const Field: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="mb-3.5 rounded-xl border p-3" style={{ borderColor: 'var(--vnp-border)', background: 'rgba(255, 255, 255, 0.65)' }}>
    <h3
      className="mb-1 text-[0.7rem] font-extrabold uppercase tracking-wider"
      style={{ color: 'var(--vnp-ink-muted)' }}
    >
      {title}
    </h3>
    <div className="text-sm font-medium leading-snug" style={{ color: 'var(--vnp-ink)' }}>
      {children}
    </div>
  </section>
);

export interface ProfileCardProps {
  profile: StudentProfile;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onOpenLog: () => void;
  initialTab?: ProfileTabId;
  className?: string;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  collapsed,
  onToggleCollapsed,
  onOpenLog,
  initialTab = 'profil',
  className = '',
}) => {
  const S = STRINGS.story;
  const [tab, setTab] = useState<ProfileTabId>(initialTab);
  const toggleLabel = collapsed ? S.expandPanel : S.collapsePanel;
  const m = profile.missionHistory;

  const onTabKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const i = TABS.findIndex((t) => t.id === tab);
    let next = i;
    if (e.key === 'ArrowRight') next = (i + 1) % TABS.length;
    else if (e.key === 'ArrowLeft') next = (i - 1 + TABS.length) % TABS.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = TABS.length - 1;
    else return;
    e.preventDefault();
    setTab(TABS[next].id);
    document.getElementById(`profile-tab-${TABS[next].id}`)?.focus();
  };

  return (
    <aside
      aria-label={S.profileCardAria}
      className={`flex flex-col overflow-hidden ${className}`}
      style={{ color: 'var(--vnp-ink)' }}
    >
      <div
        className="flex shrink-0 items-center justify-between gap-2 border-b px-4 py-3"
        style={{ borderColor: 'var(--vnp-border)', background: 'rgba(27, 42, 73, 0.06)' }}
      >
        {!collapsed && (
          <div className="min-w-0">
            <h2 className="truncate text-sm font-extrabold" style={{ color: 'var(--vn-navy)' }}>
              {profile.name}
            </h2>
            <div className="mt-0.5 flex flex-wrap gap-1.5 text-[0.7rem] font-semibold" style={{ color: 'var(--vnp-ink-muted)' }}>
              <span>{S.profileIdBadge(profile.number)}</span>
              <span aria-hidden="true">·</span>
              <span>{S.profileCohortBadge(profile.cohort)}</span>
            </div>
          </div>
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
        <>
          <div
            role="tablist"
            aria-label={S.profileTabsAria}
            onKeyDown={onTabKeyDown}
            className="grid shrink-0 grid-cols-4 gap-1 border-b p-2"
            style={{ borderColor: 'var(--vnp-border)' }}
          >
            {TABS.map(({ id, Icon }) => {
              const selected = tab === id;
              return (
                <button
                  key={id}
                  id={`profile-tab-${id}`}
                  role="tab"
                  type="button"
                  aria-selected={selected}
                  aria-controls="profile-tabpanel"
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setTab(id)}
                  className="flex flex-col items-center justify-center gap-0.5 rounded-lg px-1.5 py-1.5 text-[0.7rem] font-bold transition-colors"
                  style={{
                    background: selected ? 'var(--vn-navy)' : 'transparent',
                    color: selected ? '#fdf9f2' : 'var(--vnp-ink-muted)',
                  }}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="truncate">{S.profileTabs[id]}</span>
                </button>
              );
            })}
          </div>

          <div
            role="tabpanel"
            id="profile-tabpanel"
            aria-labelledby={`profile-tab-${tab}`}
            className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden break-words p-3.5"
          >
            {tab === 'profil' && (
              <>
                <Field title={S.profileSectionBiodata}>
                  {S.profileStyleLabel}: {profile.styleName}
                </Field>
                <Field title={S.profileSectionInterests}>
                  {profile.interests.length > 0 ? (
                    <ul className="mt-1 flex flex-wrap gap-1.5">
                      {profile.interests.map((i) => (
                        <li
                          key={i}
                          className="rounded-full border px-2.5 py-0.5 text-xs font-semibold"
                          style={{
                            borderColor: 'var(--vnp-border-strong)',
                            background: '#f5ecdc',
                            color: 'var(--vnp-ink)',
                          }}
                        >
                          {i}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    S.profileNoInterests
                  )}
                </Field>
              </>
            )}
            {tab === 'jadwal' && (
              <>
                <Field title={S.profileSectionActivity}>{profile.currentActivity}</Field>
                <Field title={S.profileSectionLocation}>{profile.currentZoneLabel}</Field>
              </>
            )}
            {tab === 'riwayat' && (
              <>
                <Field title={S.profileSectionMission}>{S.missionStatus[m.status]}</Field>
                <Field title={S.profileSectionSessions}>{m.sessions}</Field>
                <Field title={S.profileSectionLastOutcome}>
                  {m.lastOutcomeLabel ?? S.missionOutcomeWords.belum}
                </Field>
                <button
                  type="button"
                  onClick={onOpenLog}
                  aria-label={S.historyAria}
                  className="vn-topbtn w-full justify-center"
                >
                  <IconLog className="h-4 w-4" />
                  <span>{S.logBtn}</span>
                </button>
              </>
            )}
            {tab === 'relasi' && (
              <Field title={S.profileSectionRelations}>
                {profile.withNames.length > 0 ? (
                  <ul className="list-disc pl-5">
                    {profile.withNames.map((n) => (
                      <li key={n}>{n}</li>
                    ))}
                  </ul>
                ) : (
                  S.relasiNeutralNote
                )}
              </Field>
            )}
          </div>
        </>
      )}
    </aside>
  );
};
